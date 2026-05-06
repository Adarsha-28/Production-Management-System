import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { productionAPI } from '../../api';
import { LoadingSkeleton, StatusBadge } from '../../components/UI';

/* ── Quality Analyst theme: rose/pink ── */
const THEME = {
  primary:'#e11d48', dark:'#be123c', soft:'#fff1f2',
  gradient:'linear-gradient(135deg,#e11d48,#be123c)',
  glow:'rgba(225,29,72,0.12)',
};
const fadeUp = (i=0) => ({ initial:{opacity:0,y:20}, animate:{opacity:1,y:0}, transition:{duration:0.4,delay:i*0.07,ease:[0.4,0,0.2,1]} });

const qualityData = [
  {subject:'Dimensional',A:94},{subject:'Surface',A:88},
  {subject:'Material',A:96},{subject:'Assembly',A:91},
  {subject:'Functional',A:89},{subject:'Visual',A:97},
];
const trendData = [
  {week:'W1',passRate:91},{week:'W2',passRate:94},{week:'W3',passRate:88},
  {week:'W4',passRate:96},{week:'W5',passRate:93},{week:'W6',passRate:97},
];

function KpiCard({ title, value, icon, change, i }) {
  return (
    <motion.div {...fadeUp(i)} style={{
      background:'#fff', border:'1px solid #e8ecf4', borderRadius:14,
      padding:'20px 22px', position:'relative', overflow:'hidden',
      boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:THEME.glow }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#9aa3b5', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:8 }}>{title}</p>
          <p style={{ fontSize:26, fontWeight:800, color:'#0d1526', letterSpacing:'-0.03em', lineHeight:1 }}>{value}</p>
          {change !== undefined && (
            <div style={{
              display:'inline-flex', alignItems:'center', gap:4, marginTop:8,
              padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700,
              background:change>=0?'#ecfdf5':'#fef2f2', color:change>=0?'#059669':'#dc2626',
            }}>
              <span style={{fontSize:9}}>{change>=0?'▲':'▼'}</span>{Math.abs(change)}%
            </div>
          )}
        </div>
        <div style={{
          width:42, height:42, borderRadius:12, display:'flex',
          alignItems:'center', justifyContent:'center', fontSize:20,
          background:THEME.gradient, boxShadow:`0 4px 14px ${THEME.glow}`, flexShrink:0,
        }}>{icon}</div>
      </div>
    </motion.div>
  );
}

const qaColors = [
  { bg:'#ecfdf5', color:'#065f46', border:'#a7f3d0', label:'Approved' },
  { bg:'#fffbeb', color:'#92400e', border:'#fde68a', label:'Pending'  },
  { bg:'#eff6ff', color:'#1e40af', border:'#bfdbfe', label:'In Review'},
];

export default function QualityDashboard() {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productionAPI.getAll(0,10).then(r => setPlans(r.data.content||[])).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Role banner */}
      <motion.div {...fadeUp(0)} style={{
        background:THEME.gradient, borderRadius:14, padding:'20px 28px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        boxShadow:`0 8px 24px ${THEME.glow}`,
      }}>
        <div>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>
            Quality Analyst Dashboard
          </p>
          <h2 style={{ color:'#fff', fontSize:20, fontWeight:800, letterSpacing:'-0.02em' }}>Quality Control Center</h2>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:4 }}>Inspect · Analyze · Approve · Report</p>
        </div>
        <div style={{ display:'flex', gap:16 }}>
          {[{v:'94.2%',l:'Pass Rate'},{v:12,l:'Inspections'},{v:3,l:'Failed'}].map(s=>(
            <div key={s.l} style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 16px' }}>
              <p style={{ color:'#fff', fontSize:22, fontWeight:800, lineHeight:1 }}>{s.v}</p>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:10, marginTop:4, fontWeight:600 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        <KpiCard i={1} title="Inspections Today" value={12}      icon="🔍" change={8}   />
        <KpiCard i={2} title="Pass Rate"          value="94.2%"  icon="✓"  change={2.1} />
        <KpiCard i={3} title="Failed Batches"     value={3}      icon="✗"  change={-1}  />
        <KpiCard i={4} title="Pending Review"     value={7}      icon="⏳" />
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <motion.div {...fadeUp(3)} style={{ background:'#fff', border:'1px solid #e8ecf4', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
          <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f3fa' }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526' }}>Quality Metrics Radar</h3>
          </div>
          <div style={{ padding:'18px 22px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={qualityData}>
                <PolarGrid stroke="#f0f3fa" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:10, fill:'#9aa3b5' }} />
                <Radar name="Quality" dataKey="A" stroke={THEME.primary} fill={THEME.primary} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div {...fadeUp(4)} style={{ background:'#fff', border:'1px solid #e8ecf4', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
          <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f3fa' }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526' }}>Weekly Pass Rate Trend</h3>
          </div>
          <div style={{ padding:'18px 22px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f3fa" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize:11, fill:'#9aa3b5' }} axisLine={false} tickLine={false} />
                <YAxis domain={[80,100]} tick={{ fontSize:11, fill:'#9aa3b5' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v=>[`${v}%`,'Pass Rate']} contentStyle={{ borderRadius:10, border:'1px solid #e8ecf4', fontSize:12 }} />
                <Line type="monotone" dataKey="passRate" stroke={THEME.primary} strokeWidth={2.5} dot={{ fill:THEME.primary, r:4, strokeWidth:0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* QA Review table */}
      <motion.div {...fadeUp(5)} style={{ background:'#fff', border:'1px solid #e8ecf4', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f3fa' }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526' }}>Production Batches for QA Review</h3>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Batch / Plan','Product','Quantity','Status','QA Status'].map(h=>(
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map((plan,i) => {
                const qa = qaColors[i%3];
                return (
                  <motion.tr key={plan.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5+i*0.05}} className="table-row">
                    <td className="table-cell" style={{ fontWeight:600, color:'#0d1526' }}>{plan.title}</td>
                    <td className="table-cell" style={{ color:'#9aa3b5' }}>{plan.productName}</td>
                    <td className="table-cell" style={{ color:'#5a6478' }}>{plan.completedQuantity} / {plan.targetQuantity}</td>
                    <td className="table-cell"><StatusBadge status={plan.status} /></td>
                    <td className="table-cell">
                      <span style={{
                        display:'inline-flex', alignItems:'center',
                        padding:'2px 10px', borderRadius:99, fontSize:11, fontWeight:700,
                        background:qa.bg, color:qa.color, border:`1px solid ${qa.border}`,
                      }}>
                        {qa.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
