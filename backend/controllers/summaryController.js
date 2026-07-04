const DailySummary = require('../models/DailySummary');

const getSummary = async (req, res) => {
  try {
    const summary = await DailySummary.findOne({ date: req.params.date });
    if (!summary) return res.json(null);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllSummaries = async (req, res) => {
  try {
    const summaries = await DailySummary.find().sort({ date: -1 });
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSummary, getAllSummaries };
