const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  getMyRequests,
  createRequest,
  approveRequest,
  rejectRequest
} = require('../controllers/foodRequestController');
const { protect, adminOnly, batchOnly } = require('../middleware/auth');

router.get('/',              protect, adminOnly, getAllRequests);
router.get('/my',            protect, batchOnly, getMyRequests);
router.post('/',             protect, batchOnly, createRequest);
router.patch('/:id/approve', protect, adminOnly, approveRequest);
router.patch('/:id/reject',  protect, adminOnly, rejectRequest);

module.exports = router;
