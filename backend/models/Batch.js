const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchId:       { type: String, required: true, unique: true },
  batchName:     { type: String, required: true },
  phone:         { type: String, default: '' },
  password:      { type: String, required: true },           // bcrypt hashed
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid', 'Partial'], default: 'Unpaid' },
  status:        { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  // Meal schedule: which meals this batch receives by default
  // BLD=All, BL=Breakfast+Lunch, BD=Breakfast+Dinner, LD=Lunch+Dinner, L=Lunch only
  mealSchedule:  { type: String, enum: ['BLD', 'BL', 'BD', 'LD', 'L'], default: 'BLD' },
  location:      { type: String, default: '' },
  deliveryPartner: { type: String, default: '' },
  createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', batchSchema);
