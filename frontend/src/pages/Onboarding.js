import swiggyLogo from '../swiggy.png';
import zomatoLogo from '../zomato.png';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { worker as workerApi } from '../services/api';
import './Onboarding.css';

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];
const STEPS = [{ id:1, label:'Identity', icon:'01' }, { id:2, label:'Zone', icon:'02' }, { id:3, label:'Payout', icon:'03' }];

export default function Onboarding() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: user?.name || '', platform: 'swiggy', city: 'Mumbai', weeklyEarnings: 5000, upiId: '', aadhaarLast4: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const res = await workerApi.updateProfile({ ...form, operatingZone: { city: form.city }, weeklyEarnings: Number(form.weeklyEarnings) });
      setUser(res.data);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const canNext1 = form.name.trim().length > 1 && form.aadhaarLast4.length === 4;
  const canNext2 = form.city && form.weeklyEarnings > 0;
  const canSubmit = form.upiId.trim().length > 4;

  return (
    <div className="ob-root">
      <div className="ob-bg-grid" />
      <div className="ob-glow ob-glow-1" /><div className="ob-glow ob-glow-2" />
      <div className="ob-topbar">
        <div className="ob-brand">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="#00ffe0" strokeWidth="1.5" fill="none"/><circle cx="14" cy="14" r="3" fill="#00ffe0"/></svg>
          <span>GigShield</span>
        </div>
        <div className="ob-steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`ob-step ${step===s.id?'active':step>s.id?'done':''}`}>
                <div className="ob-step-dot">{step>s.id?<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6L5 9L10 3" stroke="#060a10" strokeWidth="1.5" fill="none"/></svg>:s.icon}</div>
                <span className="ob-step-label">{s.label}</span>
              </div>
              {i < STEPS.length-1 && <div className={`ob-step-line ${step>s.id?'done':''}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="ob-skip">Setup {step}/3</div>
      </div>
      <div className="ob-main">
        <div className="ob-card">
          {step === 1 && (
            <div className="ob-section">
              <div className="ob-section-header"><div className="ob-step-tag">IDENTITY</div><h2>Tell us about yourself</h2><p>Basic details for your insurance profile</p></div>
              <div className="ob-field"><label>Full Name</label><input className="ob-input" placeholder="Rajan Kumar" value={form.name} onChange={e => update('name', e.target.value)} autoFocus /></div>
              <div className="ob-field">
                <label>Platform</label>
                <div className="ob-platform-grid">
                  {[{id:'swiggy',name:'Swiggy'},{id:'zomato',name:'Zomato'},{id:'both',name:'Both'}].map(p => (
  <button key={p.id} onClick={() => update('platform', p.id)} className={`ob-platform-btn ${form.platform===p.id?'selected':''}`}>
    {p.id === 'swiggy' && <img src={swiggyLogo} alt="Swiggy" width="32" height="32" />}
    {p.id === 'zomato' && <img src={zomatoLogo} alt="Zomato" width="32" height="32" />}
    {p.id === 'both' && <span style={{fontSize:'22px'}}>⚡</span>}
    <span>{p.name}</span>
  </button>
))}
                </div>
              </div>
              <div className="ob-field"><label>Aadhaar last 4 digits</label><input className="ob-input ob-input-sm" type="tel" maxLength={4} placeholder="_ _ _ _" value={form.aadhaarLast4} onChange={e => update('aadhaarLast4', e.target.value.replace(/\D/g,''))} /><span className="ob-hint">Used for KYC only</span></div>
              <button className="ob-btn" onClick={() => setStep(2)} disabled={!canNext1}>Continue <span>→</span></button>
            </div>
          )}
          {step === 2 && (
            <div className="ob-section">
              <div className="ob-section-header"><div className="ob-step-tag">WORK ZONE</div><h2>Where do you deliver?</h2><p>We monitor disruptions in your area</p></div>
              <div className="ob-field"><label>City</label><div className="ob-city-grid">{CITIES.map(c => <button key={c} onClick={() => update('city', c)} className={`ob-city-btn ${form.city===c?'selected':''}`}>{c}</button>)}</div></div>
              <div className="ob-field">
                <label>Estimated weekly earnings</label>
                <div className="ob-earnings-wrap"><span className="ob-currency">₹</span><input className="ob-input ob-input-earnings" type="number" placeholder="5000" value={form.weeklyEarnings} onChange={e => update('weeklyEarnings', e.target.value)} /></div>
                <div className="ob-earnings-info"><span>≈ ₹{Math.round(form.weeklyEarnings/60)}/hr</span><span>Used to calculate payout</span></div>
              </div>
              <div className="ob-btn-row"><button className="ob-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="ob-btn" onClick={() => setStep(3)} disabled={!canNext2}>Continue <span>→</span></button></div>
            </div>
          )}
          {step === 3 && (
            <div className="ob-section">
              <div className="ob-section-header"><div className="ob-step-tag">PAYOUT</div><h2>Where should we send your money?</h2><p>Claims transferred directly — no bank forms</p></div>
              <div className="ob-upi-info"><div className="ob-upi-icon">⚡</div><div><p className="ob-upi-title">Instant UPI transfer</p><p className="ob-upi-sub">Funds land within 2 hours of a verified claim</p></div></div>
              <div className="ob-field"><label>UPI ID</label><input className="ob-input" placeholder="name@upi or 9876543210@paytm" value={form.upiId} onChange={e => update('upiId', e.target.value)} /><span className="ob-hint">Accepts PhonePe, GPay, Paytm, or any UPI ID</span></div>
              <div className="ob-summary">
                <div className="ob-summary-row"><span>Name</span><span>{form.name}</span></div>
                <div className="ob-summary-row"><span>Platform</span><span style={{textTransform:'capitalize'}}>{form.platform}</span></div>
                <div className="ob-summary-row"><span>City</span><span>{form.city}</span></div>
                <div className="ob-summary-row"><span>Weekly earnings</span><span>₹{Number(form.weeklyEarnings).toLocaleString()}</span></div>
              </div>
              {error && <div className="ob-error">{error}</div>}
              <div className="ob-btn-row"><button className="ob-btn-ghost" onClick={() => setStep(2)}>← Back</button><button className="ob-btn ob-btn-final" onClick={handleSubmit} disabled={loading||!canSubmit}>{loading?<span className="ob-spinner"/>:<>Activate Shield 🛡️</>}</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}