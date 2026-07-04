const express = require('express');
const router = express.Router();
const { getSummary, getAllSummaries } = require('../controllers/summaryController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAllSummaries);
router.get('/:date', protect, getSummary);

module.exports = router;
