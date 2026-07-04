const express = require('express');
const router  = express.Router();
const { createComplaint, getComplaints, resolveComplaint } = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/',     protect, createComplaint);     // batch user submits
router.get('/',      protect, getComplaints);       // admin: all | batch user: own
router.patch('/:id', protect, adminOnly, resolveComplaint);  // admin only

module.exports = router;
