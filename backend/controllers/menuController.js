const DailyMenu = require('../models/DailyMenu');
const NodeCache = require('node-cache');

// Cache menu data for 5 minutes (menus don't change often during the day)
const menuCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const getMenu = async (req, res) => {
  try {
    const { date } = req.params;
    const cacheKey = `menu_${date}`;

    // Return cached result if available
    const cached = menuCache.get(cacheKey);
    if (cached !== undefined) {
      return res.json(cached);
    }

    const menu = await DailyMenu.findOne({ date }).select('date breakfast lunch dinner').lean();
    const result = menu || null;

    // Cache the result (null is also cached to avoid repeated DB hits for missing dates)
    menuCache.set(cacheKey, result);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMenuRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      filter.date = { $lte: endDate };
    }
    // Select only the fields the billing screen needs
    const menus = await DailyMenu.find(filter)
      .select('date breakfast lunch dinner')
      .sort({ date: 1 })
      .lean();
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const upsertMenu = async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner } = req.body;
    const menu = await DailyMenu.findOneAndUpdate(
      { date },
      { date, breakfast, lunch, dinner },
      { upsert: true, new: true, runValidators: true }
    );

    // Invalidate cache for this date when menu is updated
    menuCache.del(`menu_${date}`);

    res.json(menu);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getMenu, getMenuRange, upsertMenu };
