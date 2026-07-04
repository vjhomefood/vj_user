const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // TTL index: automatically deletes document after 24 hours (24 * 3600 seconds)
  }
});

// Ensure we have indexes on userId and token for fast lookup
tokenSchema.index({ userId: 1, token: 1 });

module.exports = mongoose.model('Token', tokenSchema);
