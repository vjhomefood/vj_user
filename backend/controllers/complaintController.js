const Complaint = require('../models/Complaint');
const Batch     = require('../models/Batch');

// ── POST /api/complaints  (batch user submits) ────────────────────────────────
const createComplaint = async (req, res) => {
  try {
    const { message } = req.body;
    const batchId = req.user.batchId;   // from JWT

    if (!message || !message.trim())
      return res.status(400).json({ message: 'Complaint message is required' });

    const batch = await Batch.findOne({ batchId }).select('batchName');
    const complaint = await Complaint.create({
      batchId,
      batchName: batch ? batch.batchName : '',
      message: message.trim()
    });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/complaints  (admin sees all; batch user sees own) ────────────────
const getComplaints = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'batch') filter.batchId = req.user.batchId;
    else if (req.query.batchId)   filter.batchId = req.query.batchId;
    if (req.query.status)          filter.status  = req.query.status;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PATCH /api/complaints/:id  (admin resolves) ───────────────────────────────
const resolveComplaint = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const update = { updatedAt: new Date() };
    if (status)    update.status    = status;
    if (adminNote) update.adminNote = adminNote;

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { createComplaint, getComplaints, resolveComplaint };
