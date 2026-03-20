const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Worker = require('../models/Worker');

// Get own profile
router.get('/profile', auth, async (req, res) => {
  try {
    const worker = await Worker.findById(req.workerId);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile (onboarding completion)
router.put('/profile', auth, async (req, res) => {
  try {
    const allowed = ['name', 'platform', 'platformId', 'upiId', 'operatingZone', 'weeklyEarnings', 'aadhaarLast4'];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    // Recalculate hourly rate if weekly earnings updated
    if (updates.weeklyEarnings) {
      updates.avgHourlyEarnings = Math.round(updates.weeklyEarnings / 60);
    }

    const worker = await Worker.findByIdAndUpdate(req.workerId, updates, { new: true });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;