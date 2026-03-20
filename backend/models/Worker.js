const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  aadhaarLast4: { type: String },
  platform: { type: String, enum: ['swiggy', 'zomato', 'both'], default: 'swiggy' },
  platformId: { type: String },
  upiId: { type: String },
  operatingZone: {
    city: { type: String, default: 'Mumbai' },
    pinCodes: [String],
    lat: Number,
    lng: Number,
  },
  riskProfile: {
    zoneRiskScore: { type: Number, default: 0.5 }, // 0 = low risk, 1 = high risk
    claimHistory: { type: Number, default: 0 },
    fraudFlags: { type: Number, default: 0 },
    trustScore: { type: Number, default: 0.8 },
  },
  weeklyEarnings: { type: Number, default: 5000 }, // estimated ₹ per week
  avgHourlyEarnings: { type: Number, default: 83 }, // 5000 / 60 hrs
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Worker', workerSchema);
