const express = require('express');
const router = express.Router();
const { adminLogin, userLogin, login, logout, changeAdminPassword, deliveryPartnerLogin } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/admin/login', adminLogin);
router.post('/users/login', userLogin);
router.post('/delivery/login', deliveryPartnerLogin);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/change-password', protect, adminOnly, changeAdminPassword);

module.exports = router;
