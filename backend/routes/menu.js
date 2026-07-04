const express = require('express');
const router = express.Router();
const { getMenu, getMenuRange, upsertMenu } = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/range', protect, getMenuRange);
router.get('/:date', protect, getMenu);
router.post('/', protect, adminOnly, upsertMenu);

module.exports = router;
