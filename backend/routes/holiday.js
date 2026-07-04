const express = require('express');
const router = express.Router();
const { getHolidays, addHoliday, removeHoliday } = require('../controllers/holidayController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getHolidays);
router.post('/', protect, adminOnly, addHoliday);
router.delete('/:date', protect, adminOnly, removeHoliday);

module.exports = router;
