const mongoose = require('mongoose');

const dailyMenuSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  breakfast: {
    name: { type: String, default: '' },
    price: { type: Number, default: 0 }
  },
  lunch: {
    name: { type: String, default: '' },
    price: { type: Number, default: 0 }
  },
  dinner: {
    name: { type: String, default: '' },
    price: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('DailyMenu', dailyMenuSchema);
