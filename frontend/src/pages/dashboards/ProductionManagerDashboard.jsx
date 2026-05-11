import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI, productionAPI } from '../../api';
import { LoadingSkeleton, StatusBadge, ProgressBar } from '../../components/UI';
import DelayPredictor from '../../components/DelayPredictor';

/* ── Production Manager theme: deep blue/cyan ── */
const THEME = {
  primary:'#0ea5e9', dark:'#0284c7', soft:'#f0f9ff',
  gradient:'linear-gradient(135deg,#0ea5e9,#0284c7)',
  glow:'rgba(14,165,233,0.15)',
};

const weeklyData = [
  {day:'Mon',units:85},{day:'Tue',units:92},{day:'Wed',units:78},
  {day:'Thu',units:96},{day:'Fri',units:88},{day:'Sat',units:45},{day:'Sun',units:20},
];

const fadeUp = (i=0) => ({ initial:{opacity:0,y:20}, animate:{opacity:1,y:0}, transition:{duration:0.4,delay:i*0.07,ease:[0.4,0,0.2,1]} });

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

export default function ProductionManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardAPI.getStats(), productionAPI.getAll(0,8)])
      .then(([s,p]) => { setStats(s.data); setPlans(p.data.content||[]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton rows={8} />;

  const kpis = [
    { label:'On-Time Delivery', value:87, color:THEME.primary },
    { label:'Quality Pass Rate', value:94, color:'#10b981' },
    { label:'Resource Utilization', value:78, color:'#8b5cf6' },
    { label:'Plan Completion', value:72, color:'#f59e0b' },
  ];

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
            Production Manager Dashboard
          </p>
          <h2 style={{ color:'#fff', fontSize:20, fontWeight:800, letterSpacing:'-0.02em' }}>Production Control Center</h2>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:4 }}>Plan · Schedule · Track · Deliver</p>
        </div>
        <div style={{ display:'flex', gap:16 }}>
          {[{v:stats?.totalPlans||0,l:'Total Plans'},{v:stats?.activePlans||0,l:'In Progress'},{v:stats?.delayedPlans||0,l:'Delayed'}].map(s=>(
            <div key={s.l} style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 16px' }}>
              <p style={{ color:'#fff', fontSize:22, fontWeight:800, lineHeight:1 }}>{s.v}</p>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:10, marginTop:4, fontWeight:600 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        <KpiCard i={1} title="Total Plans"  value={stats?.totalPlans||0}     icon="📋" change={12} />
        <KpiCard i={2} title="In Progress"  value={stats?.activePlans||0}    icon="⚡" change={8}  />
        <KpiCard i={3} title="Delayed"      value={stats?.delayedPlans||0}   icon="⚠" />
        <KpiCard i={4} title="Completed"    value={stats?.completedPlans||0} icon="✓" change={15} />
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
        <motion.div {...fadeUp(3)} style={{ background:'#fff', border:'1px solid #e8ecf4', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
          <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f3fa' }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526' }}>Weekly Production Output</h3>
          </div>
          <div style={{ padding:'18px 22px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f3fa" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'#9aa3b5' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#9aa3b5' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #e8ecf4', fontSize:12 }} />
                <Bar dataKey="units" fill={THEME.primary} radius={[6,6,0,0]} name="Units Produced" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div {...fadeUp(4)} style={{ background:'#fff', border:'1px solid #e8ecf4', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
          <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f3fa' }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526' }}>Performance Metrics</h3>
          </div>
          <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:18 }}>
            {kpis.map(k => (
              <div key={k.label}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:12, color:'#5a6478', fontWeight:500 }}>{k.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#0d1526' }}>{k.value}%</span>
                </div>
                <div style={{ height:5, background:'#f0f3fa', borderRadius:99, overflow:'hidden' }}>
                  <motion.div
                    initial={{ width:0 }} animate={{ width:`${k.value}%` }}
                    transition={{ duration:1, delay:0.5, ease:[0.4,0,0.2,1] }}
                    style={{ height:'100%', background:k.color, borderRadius:99 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Delay Predictor */}
      <motion.div {...fadeUp(6)}>
        <DelayPredictor />
      </motion.div>

      {/* Plans table */}
      <motion.div {...fadeUp(5)} style={{ background:'#fff', border:'1px solid #e8ecf4', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f3fa' }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526' }}>Production Plans Overview</h3>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Plan','Product','Progress','Priority','Status','Due Date'].map(h=>(
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map((plan,i) => (
                <motion.tr key={plan.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5+i*0.05}} className="table-row">
                  <td className="table-cell" style={{ fontWeight:600, color:'#0d1526' }}>{plan.title}</td>
                  <td className="table-cell" style={{ color:'#9aa3b5' }}>{plan.productName}</td>
                  <td className="table-cell" style={{ width:160 }}>
                    <ProgressBar value={plan.completedQuantity||0} max={plan.targetQuantity||1}
                      color={plan.status==='DELAYED'?'bg-red-500':'bg-blue-500'} />
                  </td>
                  <td className="table-cell"><StatusBadge status={plan.priority} /></td>
                  <td className="table-cell"><StatusBadge status={plan.status} /></td>
                  <td className="table-cell" style={{ color:'#9aa3b5', fontSize:12 }}>{plan.endDate}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
