const express = require('express');
const router = express.Router();
const { adminLogin, userLogin, login, logout, changeAdminPassword, changeUserPassword, deliveryPartnerLogin } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/admin/login', adminLogin);
router.post('/users/login', userLogin);
router.post('/delivery/login', deliveryPartnerLogin);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/change-password', protect, adminOnly, changeAdminPassword);
router.post('/user/change-password', protect, changeUserPassword);

module.exports = router;
