const Member = require('../models/Member');
const Batch = require('../models/Batch');

const getMembers = async (req, res) => {
  try {
    const filter = req.query.batchId ? { batchId: req.query.batchId } : {};
    const members = await Member.find(filter).sort({ batchId: 1, createdAt: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNextMemberId = async (req, res) => {
  try {
    const lastMember = await Member.findOne().sort({ memberId: -1 });
    let nextMemberId = 'M001';
    if (lastMember && lastMember.memberId) {
      const match = lastMember.memberId.match(/^M(\d+)$/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        nextMemberId = 'M' + String(nextNum).padStart(3, '0');
      }
    }
    res.json({ nextMemberId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createMember = async (req, res) => {
  try {
    if (!req.body.memberId || !req.body.memberId.trim()) {
      const lastMember = await Member.findOne().sort({ memberId: -1 });
      let nextMemberId = 'M001';
      if (lastMember && lastMember.memberId) {
        const match = lastMember.memberId.match(/^M(\d+)$/);
        if (match) {
          const nextNum = parseInt(match[1], 10) + 1;
          nextMemberId = 'M' + String(nextNum).padStart(3, '0');
        }
      }
      req.body.memberId = nextMemberId;
    }
    if (!req.body.location || !req.body.location.trim()) {
      const batch = await Batch.findOne({ batchId: req.body.batchId });
      if (batch && batch.location) {
        req.body.location = batch.location;
      }
    }
    const member = new Member(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMembers, getNextMemberId, createMember, updateMember, deleteMember };
