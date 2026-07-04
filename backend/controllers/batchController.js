const bcrypt = require('bcryptjs');
const Batch  = require('../models/Batch');
const Member = require('../models/Member');
const User   = require('../models/User');

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate next sequential memberId across ALL members (global M001, M002…) */
async function nextMemberId() {
  const last = await Member.findOne().sort({ createdAt: -1, memberId: -1 });
  if (!last || !last.memberId) return 'M001';
  const m = last.memberId.match(/^M(\d+)$/);
  if (!m) return 'M001';
  return 'M' + String(parseInt(m[1], 10) + 1).padStart(3, '0');
}

// ── GET /api/batches ──────────────────────────────────────────────────────────
const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: 1 }).select('-password');
    // Attach member count and lead name to each batch
    const enriched = await Promise.all(batches.map(async (b) => {
      const members = await Member.find({ batchId: b.batchId, status: 'Active' });
      const lead    = members.find(m => m.isLead);
      return {
        ...b.toObject(),
        memberCount: members.length,
        leadName: lead ? lead.name : b.batchName,
        leadPhone: lead ? lead.phone : b.phone
      };
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/batches/:batchId/detail ─────────────────────────────────────────
const getBatchDetail = async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId }).select('-password');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    const members = await Member.find({ batchId: req.params.batchId }).sort({ isLead: -1, createdAt: 1 });
    res.json({ batch, members });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/batches ─────────────────────────────────────────────────────────
const createBatch = async (req, res) => {
  try {
    const { batchId, batchName, phone, password, mealSchedule, extraMembers = [], location } = req.body;

    if (!password) return res.status(400).json({ message: 'Password is required' });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create batch
    const batch = await Batch.create({ batchId, batchName, phone, password: hashed, mealSchedule: mealSchedule || 'BLD', location: location || '' });

    // Auto-create lead member
    const leadId = await nextMemberId();
    const cleanName = batchName.replace(/\s+batch\s*$/i, '').trim();
    await Member.create({
      memberId: leadId,
      batchId,
      name: cleanName,
      phone: phone || '',
      isLead: true,
      status: 'Active',
      location: location || ''
    });

    // Auto-create extra members
    for (const em of extraMembers) {
      if (!em.name || !em.name.trim()) continue;
      const mId = await nextMemberId();
      await Member.create({
        memberId: mId,
        batchId,
        name: em.name.trim(),
        phone: em.phone || '',
        isLead: false,
        status: 'Active',
        location: location || ''
      });
    }

    // Create batch-user login account
    const existingUser = await User.findOne({ username: batchId });
    if (!existingUser) {
      await User.create({ username: batchId, password: hashed, role: 'batch', batchId });
    }

    res.status(201).json({ ...batch.toObject(), password: undefined });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PUT /api/batches/:id ──────────────────────────────────────────────────────
const updateBatch = async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    const update = { ...rest };

    // If admin provides a new password, re-hash
    if (password && password.trim()) {
      const hashed = await bcrypt.hash(password.trim(), 10);
      update.password = hashed;
      // Also update the batch-user's login password
      const batch = await Batch.findById(req.params.id);
      if (batch) {
        await User.findOneAndUpdate({ username: batch.batchId, role: 'batch' }, { password: hashed });
      }
    }

    const updated = await Batch.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'Batch not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PATCH /api/batches/:batchId/payment ───────────────────────────────────────
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const batch = await Batch.findOneAndUpdate(
      { batchId: req.params.batchId },
      { paymentStatus },
      { new: true }
    ).select('-password');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── DELETE /api/batches/:id ───────────────────────────────────────────────────
const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    // Cleanup: delete associated user account
    await User.findOneAndDelete({ username: batch.batchId, role: 'batch' });
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/batches/location ─────────────────────────────────────────────────
const updateBatchLocation = async (req, res) => {
  try {
    const { location } = req.body;
    const batchId = req.user?.batchId;
    if (!batchId) return res.status(400).json({ message: 'Batch ID is missing in user session' });

    const updated = await Batch.findOneAndUpdate(
      { batchId },
      { location: location || '' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'Batch not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getBatches,
  getBatchDetail,
  createBatch,
  updateBatch,
  updatePaymentStatus,
  deleteBatch,
  updateBatchLocation
};
