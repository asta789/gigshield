const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  plan: { type: String, enum: ['basic', 'standard', 'full'], required: true },
  weeklyPremium: { type: Number, required: true }, // in ₹
  maxWeeklyPayout: { type: Number, required: true },
  coverageTriggers: [String], // ['rain', 'heat', 'aqi', 'curfew']
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  weekNumber: { type: Number }, // ISO week number
  premiumPaid: { type: Boolean, default: false },
  totalPayoutsThisWeek: { type: Number, default: 0 },
});

// Auto-set endDate to 7 days from startDate
policySchema.pre('save', function (next) {
  if (!this.endDate) {
    const end = new Date(this.startDate);
    end.setDate(end.getDate() + 7);
    this.endDate = end;
  }
  next();
});

module.exports = mongoose.model('Policy', policySchema);
