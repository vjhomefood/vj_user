const mongoose = require('mongoose');

const foodRequestSchema = new mongoose.Schema({
  batchId:           { type: String, required: true },
  batchName:         { type: String, required: true },
  requestedBy:       { type: String, required: true },       // username who submitted
  
  // Request type
  type:              { type: String, enum: ['schedule', 'count'], default: 'count' },
  
  // For count-based requests
  date:              { type: String, default: null },        // YYYY-MM-DD
  members: [
    {
      memberId:   { type: String, required: true },
      memberName: { type: String, required: true },
      current: {
        bf:     { type: Number, default: 0 },
        lunch:  { type: Number, default: 0 },
        dinner: { type: Number, default: 0 }
      },
      requested: {
        bf:     { type: Number, default: 0 },
        lunch:  { type: Number, default: 0 },
        dinner: { type: Number, default: 0 }
      }
    }
  ],

  // For legacy schedule-based requests
  currentSchedule:   { type: String, default: null },       // current mealSchedule code
  requestedSchedule: { type: String, default: null },       // desired mealSchedule code
  
  reason:            { type: String, default: '' },          // optional user note
  status:            { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote:         { type: String, default: '' },          // optional admin response
  createdAt:         { type: Date, default: Date.now },
  updatedAt:         { type: Date, default: Date.now }
});

foodRequestSchema.index({ batchId: 1, date: 1, status: 1 });
foodRequestSchema.index({ batchId: 1, status: 1 });

module.exports = mongoose.model('FoodRequest', foodRequestSchema);

