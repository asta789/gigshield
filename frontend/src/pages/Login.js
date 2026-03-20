import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/api';
import './Login.css';

export default function Login() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (phone.length !== 10) return setError('Enter a valid 10-digit number');
    setError(''); setLoading(true);
    try {
      const res = await auth.requestOtp(phone);
      if (res.data.otp) setDevOtp(res.data.otp);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return setError('Enter the 6-digit OTP');
    setError(''); setLoading(true);
    try {
      const res = await auth.verifyOtp({ phone, otp });
      login(res.data.token, res.data.worker);
      navigate(res.data.isNew ? '/onboarding' : '/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-root">
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="login-left">
        <div className="brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="#00ffe0" strokeWidth="1.5" fill="none"/>
              <path d="M14 7L21 11V17L14 21L7 17V11L14 7Z" fill="#00ffe0" fillOpacity="0.15" stroke="#00ffe0" strokeWidth="1"/>
              <circle cx="14" cy="14" r="3" fill="#00ffe0"/>
            </svg>
          </div>
          <span className="brand-name">GigShield</span>
        </div>

        <div className="illustration-wrap">
          <svg className="city-svg" viewBox="0 0 420 380" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="180" width="50" height="160" fill="#0d1117" stroke="#1e2d3d" strokeWidth="1"/>
            <rect x="25" y="190" width="10" height="12" fill="#00ffe0" fillOpacity="0.3"/>
            <rect x="40" y="190" width="10" height="12" fill="#00ffe0" fillOpacity="0.6"/>
            <rect x="25" y="215" width="10" height="12" fill="#00ffe0" fillOpacity="0.2"/>
            <rect x="40" y="215" width="10" height="12" fill="#00ffe0" fillOpacity="0.4"/>
            <rect x="80" y="120" width="70" height="220" fill="#0d1117" stroke="#1e2d3d" strokeWidth="1"/>
            <rect x="88" y="130" width="12" height="14" fill="#00ffe0" fillOpacity="0.5"/>
            <rect x="106" y="130" width="12" height="14" fill="#00ffe0" fillOpacity="0.2"/>
            <rect x="124" y="130" width="12" height="14" fill="#00ffe0" fillOpacity="0.7"/>
            <rect x="88" y="158" width="12" height="14" fill="#00ffe0" fillOpacity="0.3"/>
            <rect x="106" y="158" width="12" height="14" fill="#00ffe0" fillOpacity="0.6"/>
            <rect x="160" y="80" width="90" height="260" fill="#0a0f16" stroke="#1e2d3d" strokeWidth="1"/>
            <rect x="168" y="92" width="14" height="16" fill="#7b61ff" fillOpacity="0.6"/>
            <rect x="188" y="92" width="14" height="16" fill="#00ffe0" fillOpacity="0.4"/>
            <rect x="208" y="92" width="14" height="16" fill="#7b61ff" fillOpacity="0.3"/>
            <rect x="228" y="92" width="14" height="16" fill="#00ffe0" fillOpacity="0.7"/>
            <rect x="260" y="140" width="60" height="200" fill="#0d1117" stroke="#1e2d3d" strokeWidth="1"/>
            <rect x="268" y="152" width="10" height="12" fill="#00ffe0" fillOpacity="0.5"/>
            <rect x="300" y="152" width="10" height="12" fill="#00ffe0" fillOpacity="0.7"/>
            <rect x="330" y="160" width="75" height="180" fill="#0d1117" stroke="#1e2d3d" strokeWidth="1"/>
            <rect x="338" y="170" width="12" height="14" fill="#7b61ff" fillOpacity="0.6"/>
            <rect x="374" y="170" width="12" height="14" fill="#7b61ff" fillOpacity="0.4"/>
            <rect x="0" y="335" width="420" height="45" fill="#080c12"/>
            <rect x="0" y="333" width="420" height="3" fill="#1e2d3d"/>
            <rect x="30" y="353" width="40" height="3" fill="#1e2d3d"/>
            <rect x="100" y="353" width="40" height="3" fill="#1e2d3d"/>
            <rect x="170" y="353" width="40" height="3" fill="#1e2d3d"/>
            <rect x="240" y="353" width="40" height="3" fill="#1e2d3d"/>
            <g transform="translate(175, 270)">
              <circle cx="10" cy="52" r="14" stroke="#00ffe0" strokeWidth="2" fill="none"/>
              <circle cx="60" cy="52" r="14" stroke="#00ffe0" strokeWidth="2" fill="none"/>
              <circle cx="10" cy="52" r="3" fill="#00ffe0"/>
              <circle cx="60" cy="52" r="3" fill="#00ffe0"/>
              <path d="M10 52 L35 28 L60 52" stroke="#00ffe0" strokeWidth="1.5" fill="none"/>
              <path d="M35 28 L45 52" stroke="#00ffe0" strokeWidth="1.5"/>
              <rect x="22" y="8" width="26" height="20" rx="3" fill="#00ffe0" fillOpacity="0.15" stroke="#00ffe0" strokeWidth="1.5"/>
              <path d="M22 16 L48 16" stroke="#00ffe0" strokeWidth="1" strokeOpacity="0.5"/>
              <circle cx="50" cy="14" r="6" fill="#00ffe0" fillOpacity="0.9"/>
            </g>
            <g opacity="0.4">
              <line x1="50" y1="20" x2="45" y2="40" stroke="#00ffe0" strokeWidth="1"/>
              <line x1="90" y1="10" x2="85" y2="30" stroke="#00ffe0" strokeWidth="1"/>
              <line x1="340" y1="15" x2="335" y2="35" stroke="#00ffe0" strokeWidth="1"/>
              <line x1="370" y1="30" x2="365" y2="50" stroke="#00ffe0" strokeWidth="1"/>
            </g>
            <ellipse cx="245" cy="300" rx="55" ry="40" fill="#00ffe0" fillOpacity="0.04" stroke="#00ffe0" strokeWidth="1" strokeDasharray="4 4"/>
            <text x="218" y="296" fill="#00ffe0" fontSize="10" fontFamily="monospace" opacity="0.7">PROTECTED</text>
          </svg>
        </div>

        <div className="left-tagline">
          <h2>Your income,<br /><span className="neon-text">protected.</span></h2>
          <p>AI-powered parametric insurance for Zomato & Swiggy delivery partners.</p>
        </div>

        <div className="stats-row">
          <div className="stat-chip"><span className="stat-num">₹900</span><span className="stat-lbl">max weekly payout</span></div>
          <div className="stat-chip"><span className="stat-num">&lt;2hr</span><span className="stat-lbl">auto transfer</span></div>
          <div className="stat-chip"><span className="stat-num">7</span><span className="stat-lbl">AI fraud signals</span></div>
        </div>
      </div>

      <div className="login-right">
        <div className="form-card">
          {step === 'phone' ? (
            <>
              <div className="form-header">
                <div className="step-indicator">STEP 01 / 02</div>
                <h1>Sign in</h1>
                <p>Enter your mobile number to get started</p>
              </div>
              <div className="field-group">
                <label>Mobile Number</label>
                <div className="phone-row">
                  <div className="country-pill">🇮🇳 +91</div>
                  <input className="dark-input" type="tel" maxLength={10}
                    placeholder="98765 43210" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()} autoFocus />
                </div>
              </div>
              {error && <div className="err-bar">{error}</div>}
              <button className="neon-btn" onClick={handleSendOtp} disabled={loading}>
                {loading ? <span className="spinner" /> : <>Send OTP <span className="btn-arrow">→</span></>}
              </button>
              <p className="form-note">We'll send a 6-digit OTP to verify your number.</p>
            </>
          ) : (
            <>
              <div className="form-header">
                <div className="step-indicator">STEP 02 / 02</div>
                <h1>Verify OTP</h1>
                <p>Sent to +91 {phone} <button className="change-btn" onClick={() => setStep('phone')}>Change</button></p>
              </div>
              {devOtp && (
                <div className="dev-badge">
                  <span className="dev-label">DEV MODE</span>
                  <span className="dev-otp">{devOtp}</span>
                </div>
              )}
              <div className="field-group">
                <label>6-digit OTP</label>
                <input className="dark-input otp-field" type="tel" maxLength={6}
                  placeholder="• • • • • •" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()} autoFocus />
              </div>
              {error && <div className="err-bar">{error}</div>}
              <button className="neon-btn" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? <span className="spinner" /> : <>Verify & Continue <span className="btn-arrow">→</span></>}
              </button>
              <p className="form-note">OTP expires in 5 minutes. <button className="change-btn" onClick={handleSendOtp}>Resend</button></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}