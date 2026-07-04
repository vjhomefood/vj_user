const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'user', 'batch', 'delivery'], default: 'user' },
  memberId: { type: String, default: null },
  batchId:  { type: String, default: null }   // populated for batch-role users
});

module.exports = mongoose.model('User', userSchema);
