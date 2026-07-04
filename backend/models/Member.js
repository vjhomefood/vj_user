const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  memberId: { type: String, required: true, unique: true },
  batchId:  { type: String, required: true },
  name:     { type: String, required: true },
  phone:    { type: String, default: '' },
  isLead:   { type: Boolean, default: false },
  status:   { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  location: { type: String, default: '' },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', memberSchema);
