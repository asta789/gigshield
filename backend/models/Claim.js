const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  triggerType: {
    type: String,
    enum: ['rain', 'heat', 'aqi', 'flood', 'curfew'],
    required: true,
  },
  triggerData: {
    value: Number,       // e.g. rainfall mm, AQI index, temp °C
    threshold: Number,   // the threshold that was crossed
    zone: String,
    source: String,      // API source name
  },
  disruptionStart: { type: Date },
  disruptionEnd: { type: Date },
  estimatedHoursLost: { type: Number },
  claimAmount: { type: Number }, // ₹ amount to pay out
  status: {
    type: String,
    enum: ['auto_approved', 'soft_review', 'approved', 'denied', 'paid'],
    default: 'soft_review',
  },

  // Fraud detection output
  fraudScore: {
    compositeScore: { type: Number }, // 0–1, higher = more trustworthy
    signals: {
      cellTowerMatch: Number,
      motionScore: Number,
      ipMatch: Number,
      orderActivity: Number,
      networkConsistency: Number,
      claimTimingScore: Number,
      historyScore: Number,
    },
    decision: { type: String, enum: ['approve', 'soft_review', 'deny'] },
    flags: [String], // list of triggered fraud flags
  },

  payoutTransactionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

module.exports = mongoose.model('Claim', claimSchema);
