GigShield — AI-Powered Income Insurance for Food Delivery Workers

Guidewire DEVTrails 2026 | Phase 1 Submission | Ideation & Foundation

Table of Contents:-
Problem Statement
Persona & Scenarios
Application Workflow
Weekly Premium Model & Parametric Triggers
AI/ML Integration Plan
Adversarial Defense & Anti-Spoofing Strategy
Tech Stack & Architecture
Development Plan



Problem Statement
In India, over 10 million food delivery partners work for Zomato and Swiggy. When there's heavy rain, curfews, or hazardous air quality, they can’t operate. A single day of disruption can wipe out 20–30% of their weekly earnings, leaving them without any safety net or insurance coverage.

GigShield offers an AI-driven parametric income insurance solution that quickly detects external disruptions, verifies claims through a 7-signal fraud engine, and sends lost income directly to workers via UPI — no paperwork, no phone calls, no delays.



Persona & Scenarios

Primary Persona: Rajan, 28 — Swiggy delivery partner, Mumbai

AttributeDetailPlatformSwiggy (primary), Zomato (secondary)Avg. weekly earnings₹4,500–₹6,000Working hours10am–10pm, 6 days/weekDeviceAndroid (budget), 4G connectivityPain pointNo earnings during Mumbai monsoon; lacks savingsTech comfortRegularly uses Swiggy app; familiar with UPI payments

Scenario 1 — Heavy Rain Event

It’s July, and the IMD has issued a red alert for Mumbai. Rajan can’t work from 2pm to 8pm, costing him ₹600 in peak earnings. GigShield detects the red alert through a weather API, confirms Rajan's last known delivery area using 7 fraud signals, and automatically starts a claim. Within 2 hours, ₹480 (80% of the estimated loss) is sent to his UPI ID — no action needed from Rajan.

Scenario 2 — Local Curfew / Strike

A sudden bandh is announced in Rajan’s area, making all pickup locations unreachable. GigShield picks up on the disruption through traffic and news APIs and automatically triggers a claim for the affected hours.

Scenario 3 — Extreme Heat / AQI

In the scorching Delhi summer, the AQI hits 400. The heat index makes it unsafe to work outdoors. GigShield activates a partial payout for the afternoon hours when the heat index exceeds the limit — no claim filing required.



Application Workflow

[Worker Onboarding]    → Phone OTP login (no password hassle)    → KYC: Name + Aadhaar last 4 digits    → Select platform (Swiggy / Zomato / Both)    → Input city + weekly earnings    → Register UPI ID for instant payouts    → Choose weekly plan (Basic / Standard / Full Shield)[Active Coverage Week]    → Cron job runs every 30 minutes    → Monitors: Weather API + AQI API + Traffic API + News API    → Worker's city zone tracked (with consent, anonymized)[Disruption Detected]    → Parametric trigger threshold crossed    → AI fraud engine runs 7-signal validation (< 3 seconds)    → Composite Trust Score calculated    → CTS > 0.75 → Auto-approved immediately    → CTS 0.45–0.75 → Soft review (non-penalizing)    → CTS < 0.45 → Flagged for further investigation[Payout]    → Approved: UPI transfer within 2 hours    → Soft review: System re-checks after 10 mins, auto-approves if clear    → Denied: Reason recorded, worker notified, 2-tap appeal available[Weekly Reset]    → Coverage auto-renews every 7 days    → Premium deducted from UPI    → Worker dashboard updated with weekly overview



Weekly Premium Model & Parametric Triggers

Why Weekly Pricing?

Food delivery workers usually earn and spend on a weekly basis. A monthly premium can create affordability issues and lead to dropouts. Weekly pricing of ₹49–₹89/week aligns perfectly with their earning cycle.

Premium Tiers

PlanWeekly PremiumMax Weekly PayoutCoverageBasic Shield₹49₹500Rain (Red alert only)Standard Shield₹69₹900Rain + Heat + AQIFull Shield₹89₹1,400All triggers + Curfew/Strike

Dynamic Pricing (AI-adjusted)





Workers in areas with historically low disruptions get a 5–15% discount



Workers with a clean claim history (0 fraud flags) get a loyalty discount



Monsoon season (June–September) sees a slight actuarial loading



High history of fraud flags incurs a risk surcharge

Parametric Triggers

TriggerData SourceThresholdPayout RateHeavy RainIMD / OpenWeatherMap>64.5mm/hr OR Red Alert80% of hourly avgExtreme HeatOpenWeatherMapHeat index > 47°C60% for affected hoursPoor AQICPCB APIAQI > 400 (Severe)50% for affected hoursFlash FloodIMD flood alertsZone-level flood warning100% for durationBandh/CurfewNews API + Traffic APIZone access score < 20%70%

Platform Choice: Web (PWA)

A Progressive Web App is accessible through any Android browser — no need to download from an app store. This is crucial for users with budget devices. Workers receive push notifications and have an offline-capable dashboard.



AI/ML Integration Plan

1. Dynamic Premium Calculation

Model: Gradient Boosted Trees (XGBoost)

Input features:
Worker's city (historical disruption frequency per zone)
Current season/month (monsoon risk scoring)
Account age and activity consistency
City-level actuarial loss ratio data

Output: Personalized weekly premium in the ₹49–₹89 range, complete with a breakdown shown to the worker.

2. Fraud Detection Engine

Model: Isolation Forest + Rule-based ensemble

The 7-signal Composite Trust Score processes every claim in less than 3 seconds. Full architecture details are in the Anti-Spoofing section below.

Phase 1 status: Complete engine implemented in backend/services/fraudEngine.js

3. Predictive Risk Monitoring

Model: LSTM time-series forecasting on weather and historical claim data

Predicts disruption probability for the next 48 hours, which is useful for:

Proactive worker notifications (e.g., "Rain alert tomorrow — your coverage is active")

Pre-allocating liquidity before significant weather events

Adjusting premiums dynamically ahead of high-risk weeks

Adversarial Defense & Anti-Spoofing Strategy

This section addresses the Phase 1 market shift alert: a group of 500 delivery workers used GPS-spoofing apps to fake their locations during a rain alert, leading to a rapid outflow from the liquidity pool.

The Attack We're Defending Against

Coordinated groups use GPS-spoofing applications to falsely claim they are inside a disrupted weather zone while resting at home. They trigger widespread false payouts, draining the liquidity pool.

1. Differentiating Genuine Workers from Bad Actors

GigShield does not rely solely on GPS. Every claim is evaluated using a Composite Trust Score (CTS) generated from 7 independent signal layers:

Signal LayerGenuine WorkerSpooferGPS coordinatesIn disrupted zoneIn disrupted zone (faked)Cell tower triangulationMatches GPS zoneMISMATCH — shows home locationDevice motion (accelerometer)Erratic, outdoor movementNear-zero motion — stationary at homeIP geolocationMatches delivery zoneMatches home ISP / VPN detectedOrder activity trailActive deliveries before disruptionNo platform activity all dayNetwork type4G with weather-related signal dropsStable WiFi (at home)Claim timingNatural delay after disruptionBot-speed — within 60s of alert firing

A spoofer can fake GPS, but they cannot fake all 7 layers at once.

CTS Formula:

CTS = w1(cell_match) + w2(motion_score) + w3(ip_match) + w4(order_activity)      + w5(network_consistency) + w6(claim_timing_naturalness) + w7(history_score)Signal weights: cell_match=0.25, motion=0.20, ip=0.15, orders=0.15,                network=0.10, timing=0.10, history=0.05CTS > 0.75   → Auto-approveCTS 0.45–0.75 → Soft review (secondary verification, non-penalizing)CTS < 0.45   → Flag + hold + investigation queue



2. The Data — Beyond GPS

Individual-level signals:

Accelerometer & gyroscope data (via PWA DeviceMotion API, with consent): A worker biking in heavy rain shows irregular movement patterns, while someone at home exhibits almost no motion. We measure accelerometer standard deviation — >0.8 m/s² = outdoor, <0.1 m/s² = stationary.

Cell tower triangulation: GPS says Andheri East, but if three towers indicate Borivali West? That’s a significant mismatch. Genuine workers in their delivery zone will have cell towers confirming their location.

IP address geolocation: A mobile 4G IP should roughly match the worker's city zone. If a home WiFi IP shows an ISP link 15km away, that's a strong fraud signal. We flag VPN/datacenter IPs immediately.

Network type: Bad weather can cause fluctuations in 4G signals. A claim logged over stable WiFi during a declared rain event triggers suspicion.

Order history: Did this worker attempt active deliveries 2 hours before the disruption? No activity throughout the day means no income was generated, hence no loss to compensate.

Claim initiation latency: Genuine workers file claims after experiencing a disruption (usually a delay of 5–30 minutes). Fraud attacks occur within 60–90 seconds of our alert. We carefully track this delay.



Ring / syndicate-level signals:

Geo-cluster analysis: If 20+ workers in the same area submit claims within a 10-minute window, it’s statistically improbable in genuine scenarios. Real claims spread over 30–90 minutes as individuals respond to disruptions.

Device fingerprinting: If multiple accounts are registered from the same device IMEI or browser fingerprint, they are flagged as synthetic.

Sequential phone number detection: Fraud rings often register accounts with sequential numbers. Our monitor flags this pattern.

Payout velocity monitoring: A spike of 400% in claims from a single pin code compared to historical baselines means those claims are held for batch review.

Claim amount uniformity: Genuine workers have varying earnings; a fraud ring claiming identical ₹480 amounts across multiple accounts raises red flags.

VPN/proxy detection: Coordinated fraud frequently uses shared VPN exit nodes. We flag non-Indian IPs and datacenter IP ranges when filing claims.



3. The UX Balance — Protecting Honest Workers

The major risk of any fraud prevention system is unintentionally penalizing legitimate workers. A delivery partner struggling with poor 4G signals in heavy rain should NEVER be denied their claim. Here’s our protocol:

The Soft-Hold Protocol (CTS 0.45–0.75):

Step 1 — Instant notification (using non-penalizing language):"We’re running a quick connectivity check on your claim.This takes under 10 minutes. You don’t need to do anything."Step 2 — Passive re-verification (no action required from worker):The system waits 10 minutes and re-checks cell tower + motion signals.If the signals align on the second check → auto-approve. Worker remains unaware.Step 3 — Optional single-tap verification (only if still unclear):Worker receives a WhatsApp/SMS: "Could you share your current location once?" (one tap, 5 seconds)A genuine outdoor worker will respond quickly during rainy conditions.Step 4 — Trust Override (clean history workers):If a worker has had a clean claim history for 3+ weeks with 0 fraud flags →TRUST OVERRIDE applied: 60% paid immediately, 40% pending verification.We won’t leave a genuine worker without payout during a crisis.



What we never do:
Never demand photo proof in bad weather (unsafe + impractical)

Never send an automated denial without a human review option

Never penalize claim history based on an outcome from a soft-hold review

Never share fraud flags with the worker's delivery platform (Zomato/Swiggy)



Appeal mechanism:
Any denied claim → appeal with 2 taps → human reviewer responds within 4 hours. We have a safety net for edge cases that the ML might miss.

Tech Stack & Architecture
Frontend
React.js (PWA-enabled) — installable on Android, works offline
React Router — client-side navigation
Recharts — earnings + claims analytics dashboard
Custom CSS — dark theme, neon accent UI optimized for mobile
Backend
Node.js + Express — REST API server
MongoDB + Mongoose — worker profiles, policies, claims, fraud scores
JWT + OTP Authentication — phone-based login, no password hassle
node-cron — scheduled disruption monitoring every 30 minutes

AI/ML (Planned — Phase 2 & 3)

Python microservice (FastAPI) — ML fraud scoring

Scikit-learn — Isolation Forest for anomaly detection

XGBoost — model for dynamic premium calculation


Phase 1: Rule-based weighted ensemble implemented in fraudEngine.js

External APIs
OpenWeatherMap API (free tier) — triggers for weather
CPCB AQI API (public) — triggers for pollution levels
Nominatim / OpenStreetMap — geocoding for zone mapping
Razorpay sandbox — mock UPI payout simulation (Phase 2)

Architecture

[React PWA — Mobile First]         ↕ REST API (JWT Auth)[Node.js + Express Server]    ├── Auth Service        → OTP login + JWT    ├── Worker Service      → Profile + KYC + onboarding    ├── Policy Service      → Weekly plans + dynamic pricing (Phase 2)    ├── Trigger Monitor     → Cron for Weather/AQI APIs (Phase 2)    ├── Claims Service      → validation via fraudEngine.js (Phase 2)    └── Payout Service      → Razorpay UPI sandbox (Phase 2)              ↕          [MongoDB]    Workers | Policies | Claims | FraudScores

Phase 1 Implemented Components

backend/├── models/Worker.js         → Worker schema + risk profile├── models/Policy.js         → Weekly policy schema├── models/Claim.js          → Claim + fraud score schema├── routes/auth.js           → OTP request + verification + JWT├── routes/worker.js         → Profile retrieval + updates├── middleware/auth.js        → JWT verification└── services/fraudEngine.js  → 7-signal CTS fraud detection enginefrontend/├── pages/Login.js           → Dark theme OTP login (full-screen illustration)├── pages/Onboarding.js      → 3-step worker setup (identity/zone/payout)├── context/AuthContext.js   → Global auth state└── services/api.js          → Axios API service layer



Development Plan

Phase 1 ✅ Complete (March 4–20)





[x] Problem research + persona definition (Rajan, Swiggy, Mumbai)



[x] Complete README with architecture plan



[x] Defined weekly premium model + parametric triggers



[x] Documented AI/ML integration plan



[x] Developed adversarial defense + anti-spoofing strategy (7-signal CTS)



[x] Implemented fraud detection engine (fraudEngine.js)



[x] Established project scaffolding (React + Node.js + MongoDB)



[x] Enabled OTP-based phone login (auth workflow functioning)



[x] Completed 3-step onboarding flow (identity + zone + payout)



[x] Designed a dark theme UI with neon accents



[ ] Creating a 2-minute strategy video (in progress)

GigShield — Because every delivery partner deserves a safety net.