const express = require('express');
const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');
const router = express.Router();

// In production: replace with real OTP service (Twilio / MSG91)
const otpStore = {}; // phone -> otp (in-memory for hackathon)

// Step 1: Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ error: 'Valid 10-digit phone required' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
    // TODO: Send SMS via MSG91 in production
    console.log(`OTP for ${phone}: ${otp}`); // Remove in production
    res.json({ message: 'OTP sent', ...(process.env.NODE_ENV !== 'production' && { otp }) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 2: Verify OTP + register or login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, platform, city } = req.body;
    const stored = otpStore[phone];
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }
    delete otpStore[phone];

    let worker = await Worker.findOne({ phone });
    if (!worker) {
      // New registration
      worker = new Worker({ phone, name: name || 'Worker', platform: platform || 'swiggy' });
      if (city) worker.operatingZone.city = city;
      await worker.save();
    }

    const token = jwt.sign({ workerId: worker._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, worker, isNew: !worker.name || worker.name === 'Worker' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;