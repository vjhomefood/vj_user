const FoodRequest = require('../models/FoodRequest');
const Batch = require('../models/Batch');

// ── GET /api/food-requests (Admin — all requests) ────────────────────────────
const getAllRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await FoodRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/food-requests/my (Batch user — own requests) ────────────────────
const getMyRequests = async (req, res) => {
  try {
    const batchId = req.user.batchId;
    if (!batchId) return res.status(400).json({ message: 'No batch associated with this user' });
    const requests = await FoodRequest.find({ batchId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/food-requests (Batch user — create request) ────────────────────
const createRequest = async (req, res) => {
  try {
    const { type, requestedSchedule, date, members, reason } = req.body;
    const batchId = req.user.batchId;

    if (!batchId) {
      return res.status(400).json({ message: 'No batch associated with this user' });
    }

    const batch = await Batch.findOne({ batchId });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    if (type === 'count') {
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: 'A valid date (YYYY-MM-DD) is required for count requests.' });
      }
      if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: 'Members count list is required.' });
      }

      // Check timezone-specific locks (IST / Asia/Kolkata)
      const getISTDateTime = () => {
        const d = new Date();
        const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(d);
        const map = {};
        parts.forEach(p => { map[p.type] = p.value; });
        return {
          dateString: `${map.year}-${map.month}-${map.day}`,
          hour: parseInt(map.hour, 10),
          minute: parseInt(map.minute, 10)
        };
      };

      const currentIST = getISTDateTime();

      if (date < currentIST.dateString) {
        return res.status(400).json({ message: 'Cannot request food changes for past dates.' });
      }

      if (date === currentIST.dateString) {
        // Breakfast cut-off: 7:00 AM
        if (currentIST.hour >= 7) {
          const hasBfChange = members.some(m => m.requested.bf !== m.current.bf);
          if (hasBfChange) {
            return res.status(400).json({ message: 'Breakfast count changes for today are locked after 7:00 AM.' });
          }
        }
        // Lunch cut-off: 10:00 AM
        if (currentIST.hour >= 10) {
          const hasLunchChange = members.some(m => m.requested.lunch !== m.current.lunch);
          if (hasLunchChange) {
            return res.status(400).json({ message: 'Lunch count changes for today are locked after 10:00 AM.' });
          }
        }
        // Dinner cut-off: 5:00 PM (17:00)
        if (currentIST.hour >= 17) {
          const hasDinnerChange = members.some(m => m.requested.dinner !== m.current.dinner);
          if (hasDinnerChange) {
            return res.status(400).json({ message: 'Dinner count changes for today are locked after 5:00 PM.' });
          }
        }
      }

      // Check if there's already a pending request for this batch and date
      const existingPending = await FoodRequest.findOne({ batchId, date, status: 'pending' });
      if (existingPending) {
        return res.status(400).json({ message: 'You already have a pending count request for this date.' });
      }

      const request = await FoodRequest.create({
        batchId,
        batchName: batch.batchName,
        requestedBy: req.user.username,
        type: 'count',
        date,
        members,
        reason: reason || ''
      });

      return res.status(201).json(request);
    } else {
      // Legacy schedule request logic
      // Validate requestedSchedule
      const validSchedules = ['BLD', 'BL', 'BD', 'LD', 'B', 'L', 'D'];
      if (!requestedSchedule || !validSchedules.includes(requestedSchedule)) {
        return res.status(400).json({ message: 'Invalid meal schedule. Valid values: ' + validSchedules.join(', ') });
      }

      // Check if there's already a pending schedule request for this batch
      const existingPending = await FoodRequest.findOne({ batchId, type: 'schedule', status: 'pending' });
      if (existingPending) {
        return res.status(400).json({ message: 'You already have a pending schedule request. Please wait for admin to review it.' });
      }

      // Don't allow requesting the same schedule
      if (batch.mealSchedule === requestedSchedule) {
        return res.status(400).json({ message: 'The requested schedule is the same as your current schedule.' });
      }

      const request = await FoodRequest.create({
        batchId,
        batchName: batch.batchName,
        requestedBy: req.user.username,
        type: 'schedule',
        currentSchedule: batch.mealSchedule || 'BLD',
        requestedSchedule,
        reason: reason || ''
      });

      return res.status(201).json(request);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PATCH /api/food-requests/:id/approve (Admin) ─────────────────────────────
const approveRequest = async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been ' + request.status });
    }

    if (request.type === 'count') {
      const DailyOrder = require('../models/DailyOrder');
      const DailyMenu = require('../models/DailyMenu');
      const DailySummary = require('../models/DailySummary');

      const date = request.date;
      const batchId = request.batchId;

      // Upsert DailyOrder values for each member in request
      const ops = request.members.map(m => ({
        updateOne: {
          filter: { date, memberId: m.memberId },
          update: {
            $set: {
              date,
              batchId,
              memberId:   m.memberId,
              memberName: m.memberName,
              bf:         Number(m.requested.bf)     || 0,
              lunch:      Number(m.requested.lunch)  || 0,
              dinner:     Number(m.requested.dinner) || 0
            }
          },
          upsert: true
        }
      }));

      if (ops.length > 0) {
        await DailyOrder.bulkWrite(ops);
      }

      // Recalculate summary
      const allOrders = await DailyOrder.find({ date });
      const savedMenu = await DailyMenu.findOne({ date });
      let bfTotal = 0, lunchTotal = 0, dinnerTotal = 0, income = 0;
      allOrders.forEach(o => {
        bfTotal += o.bf;
        lunchTotal += o.lunch;
        dinnerTotal += o.dinner;
      });
      if (savedMenu) {
        income = bfTotal * (savedMenu.breakfast?.price || 0) +
                 lunchTotal * (savedMenu.lunch?.price || 0) +
                 dinnerTotal * (savedMenu.dinner?.price || 0);
      }
      await DailySummary.findOneAndUpdate(
        { date },
        { date, bfTotal, lunchTotal, dinnerTotal, income },
        { upsert: true, new: true }
      );

      request.status = 'approved';
      request.adminNote = req.body.adminNote || '';
      request.updatedAt = new Date();
      await request.save();

      return res.json({ message: 'Request approved. Daily orders and summary updated.', request });
    } else {
      // Legacy schedule request logic
      const batch = await Batch.findOneAndUpdate(
        { batchId: request.batchId },
        { mealSchedule: request.requestedSchedule },
        { new: true }
      );

      if (!batch) {
        return res.status(404).json({ message: 'Batch not found. Cannot apply schedule change.' });
      }

      request.status = 'approved';
      request.adminNote = req.body.adminNote || '';
      request.updatedAt = new Date();
      await request.save();

      return res.json({ message: 'Request approved. Meal schedule updated.', request, batch: { mealSchedule: batch.mealSchedule } });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PATCH /api/food-requests/:id/reject (Admin) ──────────────────────────────
const rejectRequest = async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been ' + request.status });
    }

    request.status = 'rejected';
    request.adminNote = req.body.adminNote || '';
    request.updatedAt = new Date();
    await request.save();

    res.json({ message: 'Request rejected.', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllRequests,
  getMyRequests,
  createRequest,
  approveRequest,
  rejectRequest
};

