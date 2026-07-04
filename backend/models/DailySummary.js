const mongoose = require('mongoose');

const dailySummarySchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  bfTotal: { type: Number, default: 0 },
  lunchTotal: { type: Number, default: 0 },
  dinnerTotal: { type: Number, default: 0 },
  income: { type: Number, default: 0 }
});

module.exports = mongoose.model('DailySummary', dailySummarySchema);
