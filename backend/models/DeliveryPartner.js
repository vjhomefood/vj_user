const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name:     { type: String, default: '' },
  phone:    { type: String, default: '' }
}, { collection: 'deliverypartner' }); // Keep the requested collection name: deliverypartner

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
