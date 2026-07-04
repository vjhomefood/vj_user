const Bill       = require('../models/Bill');
const DailyOrder = require('../models/DailyOrder');
const DailyMenu  = require('../models/DailyMenu');
const Member     = require('../models/Member');

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeLines(orders, menuMap) {
  const lineMap = {};

  orders.forEach(o => {
    if (!lineMap[o.date]) {
      const menu = menuMap[o.date] || {};
      lineMap[o.date] = {
        date:        o.date,
        bfPrice:     menu.breakfast?.price || 0,
        lunchPrice:  menu.lunch?.price     || 0,
        dinnerPrice: menu.dinner?.price    || 0,
        bfQty: 0, bfTotal: 0,
        lunchQty: 0, lunchTotal: 0,
        dinnerQty: 0, dinnerTotal: 0,
        dayTotal: 0
      };
    }
    const l = lineMap[o.date];
    l.bfQty     += o.bf     || 0;
    l.lunchQty  += o.lunch  || 0;
    l.dinnerQty += o.dinner || 0;
  });

  Object.values(lineMap).forEach(l => {
    l.bfTotal     = l.bfQty     * l.bfPrice;
    l.lunchTotal  = l.lunchQty  * l.lunchPrice;
    l.dinnerTotal = l.dinnerQty * l.dinnerPrice;
    l.dayTotal    = l.bfTotal + l.lunchTotal + l.dinnerTotal;
  });

  return Object.values(lineMap).sort((a, b) => a.date.localeCompare(b.date));
}

function buildDateRange(month, year, startDate, endDate) {
  if (startDate && endDate) return { start: startDate, end: endDate };
  const m       = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${m}-01`,
    end:   `${year}-${m}-${String(lastDay).padStart(2, '0')}`
  };
}

// ── POST /api/bills/generate ──────────────────────────────────────────────────
const generateBills = async (req, res) => {
  try {
    const { batchId, month, year, startDate, endDate } = req.body;
    if (!batchId) return res.status(400).json({ message: 'batchId required' });

    const { start, end } = buildDateRange(month, year, startDate, endDate);

    const members = await Member.find({ batchId, status: 'Active' });
    if (!members.length) return res.json({ generated: 0, bills: [], message: 'No active members in batch' });

    const menus   = await DailyMenu.find({ date: { $gte: start, $lte: end } });
    const menuMap = {};
    menus.forEach(m => { menuMap[m.date] = m; });

    const results = [];

    for (const member of members) {
      const existingBill = await Bill.findOne({
        batchId,
        memberId: member.memberId,
        ...(month && year ? { month, year } : { startDate: start, endDate: end })
      });
      if (existingBill?.isManuallyEdited) {
        results.push(existingBill);
        continue;
      }

      const orders = await DailyOrder.find({
        batchId,
        memberId: member.memberId,
        date: { $gte: start, $lte: end }
      });

      const lines      = computeLines(orders, menuMap);
      const grandTotal = lines.reduce((s, l) => s + l.dayTotal, 0);

      const billData = {
        batchId,
        memberId:   member.memberId,
        memberName: member.name,
        isLead:     member.isLead,
        month:      month || null,
        year:       year  || null,
        startDate:  start,
        endDate:    end,
        lines,
        grandTotal,
        updatedAt: new Date()
      };

      const bill = await Bill.findOneAndUpdate(
        {
          batchId,
          memberId: member.memberId,
          ...(month && year ? { month, year } : { startDate: start, endDate: end })
        },
        billData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(bill);
    }

    res.json({ generated: results.length, bills: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/bills ─────────────────────────────────────────────────────────────
const getBills = async (req, res) => {
  try {
    const { batchId, month, year, startDate, endDate } = req.query;
    const filter = {};
    if (batchId)   filter.batchId   = batchId;
    if (month)     filter.month     = Number(month);
    if (year)      filter.year      = Number(year);
    if (startDate) filter.startDate = startDate;
    if (endDate)   filter.endDate   = endDate;

    const bills = await Bill.find(filter).sort({ batchId: 1, isLead: -1, memberName: 1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/bills/my — returns bills for the authenticated user's batch ───
const getMyBills = async (req, res) => {
  try {
    const { month, year } = req.query;
    let batchId = req.user.batchId;

    // If regular user, look up their batchId from Member collection
    if (!batchId && req.user.memberId) {
      const member = await Member.findOne({ memberId: req.user.memberId });
      if (member) {
        batchId = member.batchId;
      }
    }

    if (!batchId) {
      // Fallback to only own member bills if no batchId is resolved
      if (req.user.memberId) {
        const filter = { memberId: req.user.memberId };
        if (month) filter.month = Number(month);
        if (year)  filter.year  = Number(year);
        const bills = await Bill.find(filter).sort({ year: -1, month: -1 });
        return res.json(bills);
      }
      return res.status(400).json({ message: 'No batch or member associated with this account' });
    }

    const filter = { batchId };
    if (month) filter.month = Number(month);
    if (year)  filter.year  = Number(year);

    const bills = await Bill.find(filter).sort({ year: -1, month: -1, isLead: -1, memberName: 1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/bills/:id ────────────────────────────────────────────────────────
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Users can only access their own bills
    if (req.user.role === 'user' && bill.memberId !== req.user.memberId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/bills/:id ────────────────────────────────────────────────────────
const updateBill = async (req, res) => {
  try {
    const { lines, paymentStatus, paidAmount, notes } = req.body;

    const update = { updatedAt: new Date(), isManuallyEdited: true };
    if (lines) {
      update.lines      = lines;
      update.grandTotal = lines.reduce((s, l) => s + (l.dayTotal || 0), 0);
    }
    if (paymentStatus !== undefined) update.paymentStatus = paymentStatus;
    if (paidAmount    !== undefined) update.paidAmount    = paidAmount;
    if (notes         !== undefined) update.notes         = notes;

    const bill = await Bill.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PATCH /api/bills/:id/payment ──────────────────────────────────────────────
const updateBillPayment = async (req, res) => {
  try {
    const { paymentStatus, paidAmount, notes } = req.body;
    const update = { updatedAt: new Date() };
    if (paymentStatus !== undefined) update.paymentStatus = paymentStatus;
    if (paidAmount    !== undefined) update.paidAmount    = paidAmount;
    if (notes         !== undefined) update.notes         = notes;

    const bill = await Bill.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── GET /api/bills/summary ────────────────────────────────────────────────────
const getBillsSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = Number(month);
    if (year)  filter.year  = Number(year);

    const bills       = await Bill.find(filter);
    const totalAmount = bills.reduce((s, b) => s + b.grandTotal, 0);
    const paidAmount  = bills.reduce((s, b) => s + (b.paidAmount || 0), 0);
    const unpaidCount = bills.filter(b => b.paymentStatus !== 'Paid').length;
    const paidCount   = bills.filter(b => b.paymentStatus === 'Paid').length;

    res.json({ totalAmount, paidAmount, unpaidCount, paidCount, totalBills: bills.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  generateBills,
  getBills,
  getMyBills,
  getBillById,
  updateBill,
  updateBillPayment,
  getBillsSummary
};
