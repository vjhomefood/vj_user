const express = require('express');
const router  = express.Router();
const {
  generateBills,
  getBills,
  getMyBills,
  getBillById,
  updateBill,
  updateBillPayment,
  getBillsSummary
} = require('../controllers/billController');
const { protect, adminOnly, ownBatchOnly } = require('../middleware/auth');

router.get('/summary',       protect, adminOnly,    getBillsSummary);
router.post('/generate',     protect, adminOnly,    generateBills);
router.get('/my',            protect,               getMyBills);
router.get('/',              protect, ownBatchOnly, getBills);
router.get('/:id',           protect, ownBatchOnly, getBillById);
router.put('/:id',           protect, adminOnly,    updateBill);
router.patch('/:id/payment', protect, adminOnly,    updateBillPayment);

module.exports = router;
