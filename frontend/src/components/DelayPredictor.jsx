import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { predictionAPI } from '../api';

const MACHINE_STATUSES = ['ACTIVE', 'IDLE', 'MAINTENANCE', 'OFFLINE'];

const riskConfig = {
  LOW:    { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', bar: '#10b981', label: 'Low Risk',    icon: '✓' },
  MEDIUM: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', bar: '#f59e0b', label: 'Medium Risk', icon: '⚠' },
  HIGH:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', bar: '#ef4444', label: 'High Risk',   icon: '✕' },
};

const defaultForm = {
  targetQuantity:       100,
  completedQuantity:    30,
  machineStatus:        'ACTIVE',
  materialAvailability: 60,
  activeMachines:       7,
  totalMachines:        10,
};

export default function DelayPredictor() {
  const [form, setForm]         = useState(defaultForm);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePredict = async () => {
    if (form.targetQuantity <= 0) { setError('Target quantity must be greater than 0.'); return; }
    if (form.completedQuantity > form.targetQuantity) { setError('Completed quantity cannot exceed target.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await predictionAPI.predictDelay({
        ...form,
        targetQuantity:       Number(form.targetQuantity),
        completedQuantity:    Number(form.completedQuantity),
        materialAvailability: Number(form.materialAvailability),
        activeMachines:       Number(form.activeMachines),
        totalMachines:        Number(form.totalMachines),
      });
      setResult(res.data);
    } catch {
      setError('Prediction failed. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const progress = form.targetQuantity > 0
    ? Math.min(100, Math.round((form.completedQuantity / form.targetQuantity) * 100))
    : 0;

  const cfg = result ? riskConfig[result.riskLevel] : null;

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: '#78716c', marginBottom: 6,
    letterSpacing: '0.06em', textTransform: 'uppercase',
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    fontSize: 13, fontFamily: 'inherit',
    background: '#fafaf9', border: '1.5px solid #e7e5e4',
    borderRadius: 9, outline: 'none', color: '#1c1917',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e7e5e4',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(28,25,23,0.06)',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '18px 24px',
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><path d="M18 2l4 4-4 4"/><path d="M22 2l-4 4"/>
          </svg>
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1, letterSpacing: '-0.01em' }}>
            AI Delay Predictor
          </p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 3 }}>
            Rule-based analysis · Real-time risk assessment
          </p>
        </div>
        <div style={{
          marginLeft: 'auto',
          padding: '4px 10px', borderRadius: 99,
          background: 'rgba(255,255,255,0.15)',
          fontSize: 10, fontWeight: 700, color: '#fff',
          letterSpacing: '0.06em',
        }}>
          AI POWERED
        </div>
      </div>

      <div style={{ padding: '24px' }}>

        {/* ── Input grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

          {/* Target Quantity */}
          <div>
            <label style={labelStyle}>Target Quantity</label>
            <input
              type="number" min="1" value={form.targetQuantity}
              onChange={e => set('targetQuantity', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = '#e7e5e4'}
            />
          </div>

          {/* Completed Quantity */}
          <div>
            <label style={labelStyle}>Completed Quantity</label>
            <input
              type="number" min="0" value={form.completedQuantity}
              onChange={e => set('completedQuantity', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = '#e7e5e4'}
            />
          </div>

          {/* Active Machines */}
          <div>
            <label style={labelStyle}>Active Machines</label>
            <input
              type="number" min="0" value={form.activeMachines}
              onChange={e => set('activeMachines', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = '#e7e5e4'}
            />
          </div>

          {/* Total Machines */}
          <div>
            <label style={labelStyle}>Total Machines</label>
            <input
              type="number" min="1" value={form.totalMachines}
              onChange={e => set('totalMachines', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = '#e7e5e4'}
            />
          </div>
        </div>

        {/* Machine Status */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Machine Status</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {MACHINE_STATUSES.map(s => {
              const colors = { ACTIVE:'#059669', IDLE:'#d97706', MAINTENANCE:'#ea580c', OFFLINE:'#dc2626' };
              const selected = form.machineStatus === s;
              return (
                <button key={s} type="button" onClick={() => set('machineStatus', s)}
                  style={{
                    padding: '8px 4px', borderRadius: 9, fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'center',
                    background: selected ? colors[s] + '15' : '#fafaf9',
                    border: `1.5px solid ${selected ? colors[s] : '#e7e5e4'}`,
                    color: selected ? colors[s] : '#78716c',
                  }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Material Availability slider */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Material Availability</label>
            <span style={{
              fontSize: 12, fontWeight: 800,
              color: form.materialAvailability < 30 ? '#dc2626' : form.materialAvailability < 60 ? '#d97706' : '#059669',
            }}>
              {form.materialAvailability}%
            </span>
          </div>
          <input
            type="range" min="0" max="100" value={form.materialAvailability}
            onChange={e => set('materialAvailability', Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>Critical</span>
            <span style={{ fontSize: 10, color: '#d97706', fontWeight: 600 }}>Low</span>
            <span style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>Adequate</span>
          </div>
        </div>

        {/* Progress preview */}
        <div style={{
          padding: '12px 14px', borderRadius: 10, marginBottom: 18,
          background: '#fafaf9', border: '1px solid #f5f5f4',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#78716c' }}>Task Completion Preview</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#1c1917' }}>{progress}%</span>
          </div>
          <div style={{ height: 6, background: '#e7e5e4', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              style={{
                height: '100%', borderRadius: 99,
                background: progress < 30 ? '#ef4444' : progress < 60 ? '#f59e0b' : '#10b981',
              }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 9, marginBottom: 14,
            background: '#fef2f2', border: '1px solid #fecaca',
            fontSize: 12, color: '#dc2626', fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        {/* Predict button */}
        <button
          onClick={handlePredict}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
            color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#d97706' : 'linear-gradient(135deg, #f97316, #ea580c)',
            border: 'none', borderRadius: 11,
            boxShadow: loading ? 'none' : '0 4px 14px rgba(234,88,12,0.35)',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.8 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 20px rgba(234,88,12,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(234,88,12,0.35)'; }}
        >
          {loading ? (
            <>
              <span style={{
                width: 15, height: 15, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.35)',
                borderTopColor: '#fff', display: 'inline-block',
                animation: 'dp-spin 0.65s linear infinite',
              }} />
              Analyzing...
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              Predict Delay Risk
            </>
          )}
        </button>

        {/* ── Result ── */}
        <AnimatePresence>
          {result && cfg && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: 20 }}
            >
              {/* Risk level banner */}
              <div style={{
                padding: '16px 18px',
                background: cfg.bg,
                border: `1.5px solid ${cfg.border}`,
                borderRadius: 12,
                marginBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: cfg.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, flexShrink: 0,
                  }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: cfg.color, letterSpacing: '-0.01em' }}>
                        {cfg.label}
                      </p>
                      <span style={{
                        fontSize: 13, fontWeight: 800, color: cfg.color,
                        background: 'rgba(255,255,255,0.6)',
                        padding: '2px 10px', borderRadius: 99,
                      }}>
                        Score: {result.riskScore}/100
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: cfg.color, marginTop: 3, opacity: 0.8 }}>
                      {result.summary}
                    </p>
                  </div>
                </div>

                {/* Score bar */}
                <div style={{ height: 6, background: 'rgba(255,255,255,0.5)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.riskScore}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    style={{ height: '100%', background: cfg.bar, borderRadius: 99 }}
                  />
                </div>
              </div>

              {/* Reasons */}
              {result.reasons?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#78716c', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Risk Factors Detected
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.reasons.map((r, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                        padding: '8px 12px', borderRadius: 8,
                        background: '#fef2f2', border: '1px solid #fecaca',
                      }}>
                        <span style={{ color: '#dc2626', fontWeight: 700, fontSize: 12, flexShrink: 0, marginTop: 1 }}>!</span>
                        <p style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.5 }}>{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#78716c', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Recommended Actions
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.suggestions.map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                        padding: '8px 12px', borderRadius: 8,
                        background: '#ecfdf5', border: '1px solid #a7f3d0',
                      }}>
                        <span style={{ color: '#059669', fontWeight: 700, fontSize: 12, flexShrink: 0, marginTop: 1 }}>→</span>
                        <p style={{ fontSize: 12, color: '#064e3b', lineHeight: 1.5 }}>{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset */}
              <button
                onClick={() => setResult(null)}
                style={{
                  marginTop: 14, width: '100%', padding: '9px',
                  fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                  color: '#78716c', cursor: 'pointer',
                  background: '#fafaf9', border: '1px solid #e7e5e4',
                  borderRadius: 9, transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f4'; e.currentTarget.style.color = '#1c1917'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fafaf9'; e.currentTarget.style.color = '#78716c'; }}
              >
                Run New Prediction
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes dp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
