const express = require('express');
const router  = express.Router();
const { getBatches, getBatchDetail, createBatch, updateBatch, updatePaymentStatus, deleteBatch, updateBatchLocation } = require('../controllers/batchController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',                protect, getBatches);
router.get('/:batchId/detail', protect, getBatchDetail);
router.put('/location',        protect, updateBatchLocation);
router.post('/',               protect, adminOnly, createBatch);
router.put('/:id',             protect, adminOnly, updateBatch);
router.patch('/:batchId/payment', protect, adminOnly, updatePaymentStatus);
router.delete('/:id',          protect, adminOnly, deleteBatch);

module.exports = router;
