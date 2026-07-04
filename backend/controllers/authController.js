const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Token = require('../models/Token');

// Helper to generate token and save it in MongoDB
const createSessionToken = async (user, resolvedBatchId) => {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
    memberId: user.memberId,
    batchId: resolvedBatchId || user.batchId
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

  // Store token in MongoDB for security
  await Token.create({ userId: user._id, token });

  return token;
};

// ── Admin Login ──────────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Enforce role isolation: only admin role allowed
    if (user.role !== 'admin') {
      return res.status(401).json({ message: 'Access denied: not an administrator' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = await createSessionToken(user);

    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
        memberId: user.memberId,
        batchId: user.batchId
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── User Login (Batch portal login) ──────────────────────────────────────────
const userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Enforce role isolation: only user or batch role allowed
    if (user.role !== 'user' && user.role !== 'batch') {
      return res.status(401).json({ message: 'Access denied: not a portal user' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Resolve batchId if user is of role 'user' (individual member account)
    let resolvedBatchId = user.batchId;
    if (user.role === 'user' && user.memberId && !resolvedBatchId) {
      const Member = require('../models/Member');
      const member = await Member.findOne({ memberId: user.memberId });
      if (member) {
        resolvedBatchId = member.batchId;
      }
    }

    const token = await createSessionToken(user, resolvedBatchId);

    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
        memberId: user.memberId,
        batchId: resolvedBatchId
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Unified Login ────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Resolve batchId if user is of role 'user' (individual member account)
    let resolvedBatchId = user.batchId;
    if (user.role === 'user' && user.memberId && !resolvedBatchId) {
      const Member = require('../models/Member');
      const member = await Member.findOne({ memberId: user.memberId });
      if (member) {
        resolvedBatchId = member.batchId;
      }
    }

    const token = await createSessionToken(user, resolvedBatchId);

    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
        memberId: user.memberId,
        batchId: resolvedBatchId
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Logout (Revoke token in MongoDB) ─────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const token = req.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (token) {
      await Token.findOneAndDelete({ token });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Change Admin Password ───────────────────────────────────────────────────
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get currently logged in user (who must be admin as checked by route protection)
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Double check it's admin role just to be safe
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: admin role required' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    // Hash and update to new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Revoke ALL active sessions/tokens for this admin in MongoDB for security
    await Token.deleteMany({ userId: user._id });

    res.json({ message: 'Password updated successfully. All other active sessions have been logged out.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delivery Partner Login ──────────────────────────────────────────────────
const DeliveryPartner = require('../models/DeliveryPartner');

const deliveryPartnerLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Auto-seed a default partner if none exists for easy verification
    const count = await DeliveryPartner.countDocuments();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('driver_123', 10);
      await DeliveryPartner.create({
        username: 'driver_123',
        password: hashedPassword,
        name: 'Driver Sam',
        phone: '+91 9876543210'
      });
    }

    const partner = await DeliveryPartner.findOne({ username });
    if (!partner) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const payload = {
      id: partner._id,
      username: partner.username,
      role: 'delivery'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    await Token.create({ userId: partner._id, token });

    res.json({
      token,
      user: {
        username: partner.username,
        role: 'delivery',
        name: partner.name,
        phone: partner.phone
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  adminLogin,
  userLogin,
  login,
  logout,
  changeAdminPassword,
  deliveryPartnerLogin
};
