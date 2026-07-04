const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  batchId:     { type: String, required: true },
  batchName:   { type: String, default: '' },
  message:     { type: String, required: true },
  status:      { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
  adminNote:   { type: String, default: '' },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);
