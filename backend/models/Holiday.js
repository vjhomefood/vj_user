const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  date:   { type: String, required: true, unique: true }, // YYYY-MM-DD
  reason: { type: String, default: 'Holiday' }
}, { collection: 'holiday' });

module.exports = mongoose.model('Holiday', holidaySchema);
