const DailyOrder = require('../models/DailyOrder');
const DailyMenu = require('../models/DailyMenu');
const DailySummary = require('../models/DailySummary');
const Member = require('../models/Member');
const Delivery = require('../models/Delivery');
const Holiday = require('../models/Holiday');

const getOrders = async (req, res) => {
  try {
    const orders = await DailyOrder.find({ date: req.params.date }).sort({ batchId: 1, memberName: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk upsert orders for a date (saves all orders at once)
const saveOrders = async (req, res) => {
  try {
    const { date, orders, menu } = req.body;

    // Upsert all orders
    const ops = orders.map(order => ({
      updateOne: {
        filter: { date, memberId: order.memberId },
        update: { $set: { ...order, date } },
        upsert: true
      }
    }));
    if (ops.length > 0) await DailyOrder.bulkWrite(ops);

    // Save menu if provided
    if (menu) {
      await DailyMenu.findOneAndUpdate(
        { date },
        { date, ...menu },
        { upsert: true, new: true }
      );
    }

    // Recalculate summary
    const allOrders = await DailyOrder.find({ date });
    const savedMenu = await DailyMenu.findOne({ date }).lean();
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

    res.json({ message: 'Orders saved successfully', bfTotal, lunchTotal, dinnerTotal, income });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await DailyOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Returns default bf/lunch/dinner values for a given meal schedule code.
 * BLD = all meals, BL = Breakfast+Lunch, BD = Breakfast+Dinner,
 * LD  = Lunch+Dinner,  L = Lunch only
 */
function getMealDefaults(mealSchedule) {
  switch (mealSchedule) {
    case 'BL':  return { bf: 1, lunch: 1, dinner: 0 };
    case 'BD':  return { bf: 1, lunch: 0, dinner: 1 };
    case 'LD':  return { bf: 0, lunch: 1, dinner: 1 };
    case 'L':   return { bf: 0, lunch: 1, dinner: 0 };
    case 'BLD':
    default:    return { bf: 1, lunch: 1, dinner: 1 };
  }
}

// Initialize orders for a date from active members (uses each batch's mealSchedule)
const initOrders = async (req, res) => {
  try {
    const { date } = req.params;
    const Batch = require('../models/Batch');

    // Load all active members and build a batchId → mealSchedule map
    const [members, batches] = await Promise.all([
      Member.find({ status: 'Active' }),
      Batch.find({}, { batchId: 1, mealSchedule: 1 })
    ]);

    const scheduleMap = {};
    batches.forEach(b => { scheduleMap[b.batchId] = b.mealSchedule || 'BLD'; });

    const ops = members.map(m => {
      const { bf, lunch, dinner } = getMealDefaults(scheduleMap[m.batchId]);
      return {
        updateOne: {
          filter: { date, memberId: m.memberId },
          update: {
            $setOnInsert: {
              date,
              batchId:    m.batchId,
              memberId:   m.memberId,
              memberName: m.name,
              bf,
              bfQty:      bf, // if count is 1, default qty to 1. If 0, default qty to 0.
              bfType:     'nonveg',
              bfAddons:   [],
              bfReceived: false,
              lunch,
              lunchQty:   lunch,
              lunchType:  'nonveg',
              lunchAddons:[],
              lunchReceived: false,
              dinner,
              dinnerQty:  dinner,
              dinnerType: 'nonveg',
              dinnerAddons:[],
              dinnerReceived: false
            }
          },
          upsert: true
        }
      };
    });

    if (ops.length > 0) await DailyOrder.bulkWrite(ops);
    const orders = await DailyOrder.find({ date }).sort({ batchId: 1, memberName: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export: all orders in a date range or exact date, optionally filtered by batchId
const getOrdersRange = async (req, res) => {
  try {
    const { startDate, endDate, batchId, date } = req.query;
    const filter = {};
    if (date) {
      filter.date = date;
    } else if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      filter.date = { $lte: endDate };
    }
    if (batchId) filter.batchId = batchId;

    const orders = await DailyOrder.find(filter).sort({ date: 1, batchId: 1, memberName: 1 });

    // Collect unique dates so we can attach menu prices
    const uniqueDates = [...new Set(orders.map(o => o.date))];
    const menus = await DailyMenu.find({ date: { $in: uniqueDates } }).lean();
    const menuMap = {};
    menus.forEach(m => { menuMap[m.date] = m; });

    // Enrich orders with menu info
    const enriched = orders.map(o => {
      const menu = menuMap[o.date] || {};
      return {
        date: o.date,
        batchId: o.batchId,
        memberId: o.memberId,
        memberName: o.memberName,
        bf: o.bf,
        lunch: o.lunch,
        dinner: o.dinner,
        bfPrice:     menu.breakfast?.price || 0,
        lunchPrice:  menu.lunch?.price     || 0,
        dinnerPrice: menu.dinner?.price    || 0,
        bfMenu:      menu.breakfast?.name  || '',
        lunchMenu:   menu.lunch?.name      || '',
        dinnerMenu:  menu.dinner?.name     || '',
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBatchOrders = async (req, res) => {
  try {
    const { date } = req.params;
    
    const holiday = await Holiday.findOne({ date });
    if (holiday) {
      return res.json({
        orders: [],
        delivery: null,
        isHoliday: true,
        holidayReason: holiday.reason || 'Holiday'
      });
    }

    const batchId = req.user.batchId;

    if (!batchId) {
      return res.status(400).json({ message: 'Batch ID is missing in user session' });
    }

    const Batch = require('../models/Batch');
    const batch = await Batch.findOne({ batchId });
    const mealSchedule = batch ? batch.mealSchedule || 'BLD' : 'BLD';

    const activeMembers = await Member.find({ batchId, status: 'Active' });

    let orders = await DailyOrder.find({ date, batchId }).sort({ memberName: 1 });

    const missingMembers = activeMembers.filter(m => !orders.some(o => o.memberId === m.memberId));

    if (missingMembers.length > 0) {
      const { bf, lunch, dinner } = getMealDefaults(mealSchedule);
      const newOrdersOps = missingMembers.map(m => ({
        updateOne: {
          filter: { date, memberId: m.memberId },
          update: {
            $setOnInsert: {
              date,
              batchId,
              memberId: m.memberId,
              memberName: m.name,
              bf,
              bfQty: bf,
              bfType: 'nonveg',
              bfAddons: [],
              bfReceived: false,
              lunch,
              lunchQty: lunch,
              lunchType: 'nonveg',
              lunchAddons: [],
              lunchReceived: false,
              dinner,
              dinnerQty: dinner,
              dinnerType: 'nonveg',
              dinnerAddons: [],
              dinnerReceived: false
            }
          },
          upsert: true
        }
      }));

      await DailyOrder.bulkWrite(newOrdersOps);
      orders = await DailyOrder.find({ date, batchId }).sort({ memberName: 1 });
    }

    let delivery = await Delivery.findOne({ date, batchId });
    if (!delivery) {
      delivery = {
        bfStatus: 'Pending',
        lunchStatus: 'Pending',
        dinnerStatus: 'Pending'
      };
    }

    res.json({
      orders,
      delivery
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const saveBatchOrders = async (req, res) => {
  try {
    const { date, orders } = req.body;
    
    const holiday = await Holiday.findOne({ date });
    if (holiday) {
      return res.status(400).json({ message: 'Cannot save orders on a holiday' });
    }

    const batchId = req.user.batchId;

    if (!batchId) {
      return res.status(400).json({ message: 'Batch ID is missing in user session' });
    }

    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const map = {};
    parts.forEach(p => { map[p.type] = p.value; });
    const istToday = `${map.year}-${String(map.month).padStart(2, '0')}-${String(map.day).padStart(2, '0')}`;
    const istHour = parseInt(map.hour, 10);

    let bfLocked = false;
    let lunchLocked = false;
    let dinnerLocked = false;

    if (date < istToday) {
      bfLocked = true;
      lunchLocked = true;
      dinnerLocked = true;
    } else if (date === istToday) {
      if (istHour >= 4) bfLocked = true;
      if (istHour >= 9) lunchLocked = true;
      if (istHour >= 16) dinnerLocked = true;
    }

    const dbOrders = await DailyOrder.find({ date, batchId });

    const ops = orders.map(order => {
      if (order.batchId !== batchId) {
        throw new Error(`Unauthorized: Order batch ID does not match user batch`);
      }

      const dbOrder = dbOrders.find(o => o.memberId === order.memberId);

      let updatedOrder = { ...order };

      if (dbOrder) {
        if (bfLocked) {
          updatedOrder.bf = dbOrder.bf;
          updatedOrder.bfQty = dbOrder.bfQty;
          updatedOrder.bfType = dbOrder.bfType;
          updatedOrder.bfReceived = dbOrder.bfReceived;
        }
        if (lunchLocked) {
          updatedOrder.lunch = dbOrder.lunch;
          updatedOrder.lunchQty = dbOrder.lunchQty;
          updatedOrder.lunchType = dbOrder.lunchType;
          updatedOrder.lunchReceived = dbOrder.lunchReceived;
        }
        if (dinnerLocked) {
          updatedOrder.dinner = dbOrder.dinner;
          updatedOrder.dinnerQty = dbOrder.dinnerQty;
          updatedOrder.dinnerType = dbOrder.dinnerType;
          updatedOrder.dinnerReceived = dbOrder.dinnerReceived;
        }
      } else {
        if (bfLocked) {
          updatedOrder.bf = 0;
          updatedOrder.bfQty = 0;
          updatedOrder.bfType = 'nonveg';
          updatedOrder.bfReceived = false;
        }
        if (lunchLocked) {
          updatedOrder.lunch = 0;
          updatedOrder.lunchQty = 0;
          updatedOrder.lunchType = 'nonveg';
          updatedOrder.lunchReceived = false;
        }
        if (dinnerLocked) {
          updatedOrder.dinner = 0;
          updatedOrder.dinnerQty = 0;
          updatedOrder.dinnerType = 'nonveg';
          updatedOrder.dinnerReceived = false;
        }
      }

      // Enforce business rule: if count is 0, quantity is also 0
      if (updatedOrder.bf === 0) updatedOrder.bfQty = 0;
      if (updatedOrder.lunch === 0) updatedOrder.lunchQty = 0;
      if (updatedOrder.dinner === 0) updatedOrder.dinnerQty = 0;



      return {
        updateOne: {
          filter: { date, memberId: order.memberId },
          update: { $set: { ...updatedOrder, date, batchId } },
          upsert: true
        }
      };
    });

    if (ops.length > 0) {
      await DailyOrder.bulkWrite(ops);
    }

    const allOrders = await DailyOrder.find({ date });
    const savedMenu = await DailyMenu.findOne({ date }).lean();
    let bfTotal = 0, lunchTotal = 0, dinnerTotal = 0, income = 0;
    allOrders.forEach(o => {
      bfTotal += o.bfQty || 0;
      lunchTotal += o.lunchQty || 0;
      dinnerTotal += o.dinnerQty || 0;
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

    res.json({ message: 'Batch orders saved successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const receiveBatchOrders = async (req, res) => {
  try {
    const { date, session } = req.body;
    const batchId = req.user.batchId;

    if (!batchId) {
      return res.status(400).json({ message: 'Batch ID is missing in user session' });
    }

    if (!['bf', 'lunch', 'dinner'].includes(session)) {
      return res.status(400).json({ message: 'Invalid session code' });
    }

    const field = `${session}Received`;

    await DailyOrder.updateMany(
      { date, batchId },
      { $set: { [field]: true } }
    );

    res.json({ message: `Session ${session} marked as received successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delivery Partner Dashboard Controllers ──────────────────────────────
const getDeliveryDashboard = async (req, res) => {
  try {
    const Batch = require('../models/Batch');
    const username = req.user.username;

    // Get today's date in IST
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const parts = formatter.formatToParts(now);
    const m = {};
    parts.forEach(p => { m[p.type] = p.value; });
    const date = `${m.year}-${m.month}-${m.day}`;

    // Find all batches assigned to this delivery partner (select only required fields)
    const batches = await Batch.find({ deliveryPartner: username }).select('batchId batchName location phone');

    const tasks = [];
    for (const b of batches) {
      // Fetch today's orders for this batch to sum up meal quantities and counts
      const orders = await DailyOrder.find({ date, batchId: b.batchId }).select('bf lunch dinner');
      
      const bfQty = orders.reduce((sum, o) => sum + (o.bf || 0), 0);
      const bfCount = orders.reduce((sum, o) => sum + (o.bf > 0 ? 1 : 0), 0);
      
      const lunchQty = orders.reduce((sum, o) => sum + (o.lunch || 0), 0);
      const lunchCount = orders.reduce((sum, o) => sum + (o.lunch > 0 ? 1 : 0), 0);
      
      const dinnerQty = orders.reduce((sum, o) => sum + (o.dinner || 0), 0);
      const dinnerCount = orders.reduce((sum, o) => sum + (o.dinner > 0 ? 1 : 0), 0);

      // Find or default delivery status (select only status fields)
      let delivery = await Delivery.findOne({ date, batchId: b.batchId }).select('bfStatus lunchStatus dinnerStatus');
      if (!delivery) {
        delivery = {
          bfStatus: 'Pending',
          lunchStatus: 'Pending',
          dinnerStatus: 'Pending'
        };
      }

      tasks.push({
        batchId: b.batchId,
        batchName: b.batchName,
        location: b.location || 'No location saved',
        phone: b.phone || '',
        meals: {
          bf: { qty: bfQty, count: bfCount },
          lunch: { qty: lunchQty, count: lunchCount },
          dinner: { qty: dinnerQty, count: dinnerCount }
        },
        status: {
          bf: delivery.bfStatus,
          lunch: delivery.lunchStatus,
          dinner: delivery.dinnerStatus
        }
      });
    }

    res.json({ date, tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { batchId, session, status } = req.body;
    const username = req.user.username;

    if (!batchId || !session || !status) {
      return res.status(400).json({ message: 'Missing batchId, session, or status' });
    }

    if (!['bf', 'lunch', 'dinner'].includes(session)) {
      return res.status(400).json({ message: 'Invalid session' });
    }

    if (!['Pending', 'On Delivery', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Get today's date in IST
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const parts = formatter.formatToParts(now);
    const m = {};
    parts.forEach(p => { m[p.type] = p.value; });
    const date = `${m.year}-${m.month}-${m.day}`;

    // Verify batch belongs to this driver
    const Batch = require('../models/Batch');
    const batch = await Batch.findOne({ batchId, deliveryPartner: username });
    if (!batch) {
      return res.status(403).json({ message: 'Unauthorized: batch not assigned to you' });
    }

    const statusField = `${session}Status`;
    const timeField = `${session}DeliveredAt`;

    const updateObj = { [statusField]: status };
    if (status === 'Delivered') {
      updateObj[timeField] = new Date();
    }

    const delivery = await Delivery.findOneAndUpdate(
      { date, batchId },
      { $set: { ...updateObj, deliveryPartner: username } },
      { upsert: true, new: true }
    );

    res.json({ message: 'Status updated successfully', delivery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ── Delivery Partner Profile ─────────────────────────────────────────────────
const getDeliveryProfile = async (req, res) => {
  try {
    const Batch = require('../models/Batch');
    const username = req.user.username;

    // Fetch partner record from deliverypartner collection
    const DeliveryPartner = require('../models/DeliveryPartner');
    const partner = await DeliveryPartner.findOne({ username }).select('-password');

    // Fetch all batches assigned to this partner
    const batches = await Batch.find({ deliveryPartner: username })
      .select('batchId batchName location phone mealSchedule status');

    // Count active members per batch
    const batchesWithCounts = await Promise.all(batches.map(async (b) => {
      const memberCount = await Member.countDocuments({ batchId: b.batchId, status: 'Active' });
      return {
        batchId: b.batchId,
        batchName: b.batchName,
        location: b.location || '',
        phone: b.phone || '',
        mealSchedule: b.mealSchedule || 'BLD',
        memberCount
      };
    }));

    res.json({
      username: partner?.username || username,
      name: partner?.name || '',
      phone: partner?.phone || '',
      batchCount: batches.length,
      batches: batchesWithCounts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getOrders,
  saveOrders,
  updateOrder,
  initOrders,
  getOrdersRange,
  getBatchOrders,
  saveBatchOrders,
  receiveBatchOrders,
  getDeliveryDashboard,
  updateDeliveryStatus,
  getDeliveryProfile
};
