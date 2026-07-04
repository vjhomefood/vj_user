const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  date:            { type: String, required: true }, // YYYY-MM-DD
  batchId:         { type: String, required: true },
  deliveryPartner: { type: String, required: true }, // username
  bfStatus:        { type: String, enum: ['Pending', 'On Delivery', 'Delivered'], default: 'Pending' },
  bfDeliveredAt:   { type: Date },
  lunchStatus:     { type: String, enum: ['Pending', 'On Delivery', 'Delivered'], default: 'Pending' },
  lunchDeliveredAt:{ type: Date },
  dinnerStatus:    { type: String, enum: ['Pending', 'On Delivery', 'Delivered'], default: 'Pending' },
  dinnerDeliveredAt:{ type: Date },
  createdAt:       { type: Date, default: Date.now }
});

// Compound index to ensure one delivery status per batch per date
deliverySchema.index({ date: 1, batchId: 1 }, { unique: true });

module.exports = mongoose.model('Delivery', deliverySchema);
