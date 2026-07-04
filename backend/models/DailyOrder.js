const mongoose = require('mongoose');

const dailyOrderSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  batchId: { type: String, required: true },
  memberId: { type: String, required: true },
  memberName: { type: String, required: true },
  
  bf: { type: Number, default: 1, min: 0 },
  bfQty: { type: Number, default: 1, min: 0 },
  bfType: { type: String, default: 'nonveg' },
  bfAddons: { type: Array, default: [] },
  bfReceived: { type: Boolean, default: false },

  lunch: { type: Number, default: 1, min: 0 },
  lunchQty: { type: Number, default: 1, min: 0 },
  lunchType: { type: String, default: 'nonveg' },
  lunchAddons: { type: Array, default: [] },
  lunchReceived: { type: Boolean, default: false },

  dinner: { type: Number, default: 1, min: 0 },
  dinnerQty: { type: Number, default: 1, min: 0 },
  dinnerType: { type: String, default: 'nonveg' },
  dinnerAddons: { type: Array, default: [] },
  dinnerReceived: { type: Boolean, default: false },

  deliveryType: { type: String, default: 'home', enum: ['home', 'college'] }
});

dailyOrderSchema.index({ date: 1, memberId: 1 }, { unique: true });

module.exports = mongoose.model('DailyOrder', dailyOrderSchema);
