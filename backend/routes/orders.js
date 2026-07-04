const express = require('express');
const router = express.Router();
const { 
  getOrders, saveOrders, updateOrder, initOrders, getOrdersRange, 
  getBatchOrders, saveBatchOrders, receiveBatchOrders,
  getDeliveryDashboard, updateDeliveryStatus, getDeliveryProfile
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.get('/export', protect, getOrdersRange);
router.get('/delivery/profile', protect, getDeliveryProfile);
router.get('/delivery/dashboard', protect, getDeliveryDashboard);
router.post('/delivery/update-status', protect, updateDeliveryStatus);
router.get('/init/:date', protect, initOrders);
router.get('/batch/:date', protect, getBatchOrders);
router.post('/batch-save', protect, saveBatchOrders);
router.post('/batch-receive', protect, receiveBatchOrders);
router.get('/:date', protect, getOrders);
router.post('/', protect, saveOrders);
router.put('/:id', protect, updateOrder);

module.exports = router;
