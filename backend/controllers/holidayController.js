const Holiday = require('../models/Holiday');

const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addHoliday = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const holiday = await Holiday.findOneAndUpdate(
      { date },
      { date, reason: reason || 'Holiday' },
      { upsert: true, new: true }
    );

    res.json({ message: 'Holiday saved successfully', holiday });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const removeHoliday = async (req, res) => {
  try {
    const { date } = req.params;
    const result = await Holiday.findOneAndDelete({ date });
    if (!result) {
      return res.status(404).json({ message: 'Holiday not found for this date' });
    }
    res.json({ message: 'Holiday removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getHolidays,
  addHoliday,
  removeHoliday
};
