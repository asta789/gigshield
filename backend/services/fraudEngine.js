/**
 * GigShield Fraud Detection Engine
 * Implements the Composite Trust Score (CTS) described in the README.
 * 
 * In production: 
 *  - cell tower data via telecom APIs
 *  - accelerometer via PWA DeviceMotion API (sent from app)
 *  - IP geolocation via ipapi.co or similar
 *  - Order activity via platform API webhook
 *
 * For hackathon: signals are simulated with realistic mock logic
 * to demonstrate the architecture.
 */

/**
 * Signal weights (must sum to 1.0)
 */
const WEIGHTS = {
  cellTowerMatch:       0.25,
  motionScore:          0.20,
  ipMatch:              0.15,
  orderActivity:        0.15,
  networkConsistency:   0.10,
  claimTimingScore:     0.10,
  historyScore:         0.05,
};

/**
 * Score thresholds
 */
const THRESHOLDS = {
  autoApprove:  0.75,
  softReview:   0.45,
  // below softReview => deny/investigate
};

/**
 * Ring detection: if many workers in same zone claim within short window
 */
const recentClaims = []; // In production: use Redis with TTL

function checkRingActivity(zone, windowMinutes = 10) {
  const cutoff = Date.now() - windowMinutes * 60 * 1000;
  const recentInZone = recentClaims.filter(
    c => c.zone === zone && c.timestamp > cutoff
  );
  return recentInZone.length;
}

function recordClaim(zone) {
  recentClaims.push({ zone, timestamp: Date.now() });
  // Keep array from growing unbounded
  if (recentClaims.length > 1000) recentClaims.shift();
}

/**
 * Main fraud scoring function.
 * @param {Object} params - signal data from client + server
 * @returns {Object} fraudScore result
 */
async function scoreClaim(params) {
  const {
    worker,
    triggerType,
    claimedZone,
    clientSignals = {},  // from PWA: motionData, networkType, ipAddress
    triggerFiredAt,      // timestamp when our system detected the disruption
    claimInitiatedAt,    // timestamp when worker's claim was initiated
  } = params;

  const signals = {};
  const flags = [];

  //Signal 1: Cell tower match (0–1)
  // In production: compare GPS vs cell tower triangulation
  // Mock: workers in high-risk zones during alerts are assumed present
  if (clientSignals.cellTowerZone) {
    signals.cellTowerMatch = clientSignals.cellTowerZone === claimedZone ? 1.0 : 0.1;
    if (signals.cellTowerMatch < 0.5) flags.push('cell_tower_mismatch');
  } else {
    signals.cellTowerMatch = 0.6; // neutral if not available
  }

  //Signal 2: Motion score (0–1)
  // Genuine worker in rain: irregular movement, phone acceleration
  // Spoofer at home: near-zero motion, steady accelerometer
  if (clientSignals.motionVariance !== undefined) {
    // motionVariance: standard deviation of accelerometer readings (m/s²)
    // >0.8 = outdoor movement, <0.1 = stationary
    const mv = clientSignals.motionVariance;
    if (mv > 0.8) signals.motionScore = 1.0;
    else if (mv > 0.4) signals.motionScore = 0.7;
    else if (mv > 0.1) signals.motionScore = 0.4;
    else {
      signals.motionScore = 0.1;
      flags.push('stationary_during_claim');
    }
  } else {
    signals.motionScore = 0.5; // neutral if PWA motion permission denied
  }

  //Signal 3: IP address match (0–1)
  if (clientSignals.ipCity) {
    const ipMatchesZone = clientSignals.ipCity.toLowerCase().includes(
      claimedZone.toLowerCase().split(',')[0]
    );
    signals.ipMatch = ipMatchesZone ? 0.9 : 0.3;
    if (!ipMatchesZone) flags.push('ip_zone_mismatch');
    // VPN/datacenter IP detection
    if (clientSignals.isVpn) {
      signals.ipMatch = 0.1;
      flags.push('vpn_detected');
    }
  } else {
    signals.ipMatch = 0.55;
  }

  //Signal 4: Order activity (0–1)
  // Did the worker have delivery attempts before the disruption?
  // In production: pull from platform API
  if (clientSignals.ordersBeforeDisruption !== undefined) {
    const orders = clientSignals.ordersBeforeDisruption;
    if (orders >= 3) signals.orderActivity = 1.0;
    else if (orders >= 1) signals.orderActivity = 0.75;
    else {
      signals.orderActivity = 0.2;
      flags.push('no_order_activity_today');
    }
  } else {
    signals.orderActivity = 0.6;
  }

  //Signal 5: Network consistency (0–1)
  // During bad weather: 4G with signal drops is expected
  // Fraudster at home: stable WiFi
  if (clientSignals.networkType) {
    if (clientSignals.networkType === 'wifi' && triggerType === 'rain') {
      signals.networkConsistency = 0.3;
      flags.push('wifi_during_rain_claim');
    } else if (clientSignals.networkType === '4g') {
      signals.networkConsistency = 0.9;
    } else {
      signals.networkConsistency = 0.65;
    }
  } else {
    signals.networkConsistency = 0.55;
  }

  //Signal 6: Claim timing naturalness (0–1)
  // Bots claim within seconds of trigger. Genuine workers claim after a delay.
  if (triggerFiredAt && claimInitiatedAt) {
    const deltaSeconds = (new Date(claimInitiatedAt) - new Date(triggerFiredAt)) / 1000;
    if (deltaSeconds < 60) {
      signals.claimTimingScore = 0.1; // Suspiciously fast
      flags.push('bot_like_claim_speed');
    } else if (deltaSeconds < 300) {
      signals.claimTimingScore = 0.6;
    } else {
      signals.claimTimingScore = 1.0; // Natural delay
    }
  } else {
    signals.claimTimingScore = 0.65;
  }

  //Signal 7: History score (0–1)
  const trustScore = worker.riskProfile?.trustScore || 0.8;
  const fraudFlags = worker.riskProfile?.fraudFlags || 0;
  if (fraudFlags === 0) {
    signals.historyScore = trustScore;
  } else {
    signals.historyScore = Math.max(0.1, trustScore - fraudFlags * 0.2);
    flags.push(`prior_fraud_flags_${fraudFlags}`);
  }

  //Ring detection
  const recentRingCount = checkRingActivity(claimedZone);
  if (recentRingCount > 20) {
    flags.push(`ring_activity_detected_${recentRingCount}_claims`);
    // Penalise all signals if ring detected
    Object.keys(signals).forEach(k => { signals[k] *= 0.6; });
  }

  //Composite Trust Score 
  const compositeScore = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => {
    return sum + (signals[key] || 0.5) * weight;
  }, 0);

  //Decision
  let decision;
  if (compositeScore >= THRESHOLDS.autoApprove) {
    decision = 'approve';
  } else if (compositeScore >= THRESHOLDS.softReview) {
    decision = 'soft_review';
  } else {
    decision = 'deny';
    if (flags.length === 0) flags.push('low_composite_score');
  }

  // Trust override: clean history workers get benefit of doubt on soft_review
  if (decision === 'soft_review' && worker.riskProfile?.claimHistory >= 3 && worker.riskProfile?.fraudFlags === 0) {
    decision = 'approve';
    flags.push('trust_override_applied');
  }

  recordClaim(claimedZone);

  return {
    compositeScore: Math.round(compositeScore * 100) / 100,
    signals,
    decision,
    flags,
    thresholds: THRESHOLDS,
  };
}

module.exports = { scoreClaim };
