import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardAPI, productionAPI, machineAPI } from '../../api';
import { LoadingSkeleton, StatusBadge } from '../../components/UI';
import DelayPredictor from '../../components/DelayPredictor';

/* ── Admin theme: deep indigo/violet ── */
const THEME = {
  primary: '#6366f1', soft: '#eef2ff', dark: '#4338ca',
  gradient: 'linear-gradient(135deg,#6366f1,#4338ca)',
  glow: 'rgba(99,102,241,0.15)',
};
const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'];
const monthlyData = [
  { month:'Jul', production:420, target:450, efficiency:82 },
  { month:'Aug', production:480, target:450, efficiency:85 },
  { month:'Sep', production:390, target:450, efficiency:78 },
  { month:'Oct', production:510, target:500, efficiency:88 },
  { month:'Nov', production:530, target:500, efficiency:91 },
  { month:'Dec', production:495, target:500, efficiency:87 },
];

const fadeUp = (i=0) => ({ initial:{opacity:0,y:20}, animate:{opacity:1,y:0}, transition:{duration:0.4,delay:i*0.07,ease:[0.4,0,0.2,1]} });

function KpiCard({ title, value, sub, change, icon, i }) {
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
          {sub && <p style={{ fontSize:11, color:'#9aa3b5', marginTop:5 }}>{sub}</p>}
          {change !== undefined && (
            <div style={{
              display:'inline-flex', alignItems:'center', gap:4, marginTop:8,
              padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700,
              background: change>=0 ? '#ecfdf5' : '#fef2f2',
              color: change>=0 ? '#059669' : '#dc2626',
            }}>
              <span style={{fontSize:9}}>{change>=0?'▲':'▼'}</span>{Math.abs(change)}%
            </div>
          )}
        </div>
        <div style={{
          width:42, height:42, borderRadius:12, display:'flex',
          alignItems:'center', justifyContent:'center', fontSize:20,
          background: THEME.gradient,
          boxShadow:`0 4px 14px ${THEME.glow}`,
          flexShrink:0,
        }}>{icon}</div>
      </div>
    </motion.div>
  );
}

function SectionCard({ title, children, delay=0, span='' }) {
  return (
    <motion.div {...fadeUp(delay)} className={span} style={{
      background:'#fff', border:'1px solid #e8ecf4', borderRadius:14,
      boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden',
    }}>
      <div style={{ padding:'18px 22px 0', borderBottom:'1px solid #f0f3fa', paddingBottom:14 }}>
        <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526', letterSpacing:'-0.01em' }}>{title}</h3>
      </div>
      <div style={{ padding:'18px 22px' }}>{children}</div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [plans, setPlans]     = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardAPI.getStats(), productionAPI.getAll(0,5), machineAPI.getAll()])
      .then(([s,p,m]) => { setStats(s.data); setPlans(p.data.content||[]); setMachines(m.data.slice(0,6)); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton rows={8} />;

  const pieData = stats ? Object.entries(stats.plansByStatus||{}).map(([k,v])=>({name:k.replace('_',' '),value:v})) : [];

  /* Role banner */
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Role identity banner */}
      <motion.div {...fadeUp(0)} style={{
        background: THEME.gradient, borderRadius:14, padding:'20px 28px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        boxShadow:`0 8px 24px ${THEME.glow}`,
      }}>
        <div>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>
            Administrator Dashboard
          </p>
          <h2 style={{ color:'#fff', fontSize:20, fontWeight:800, letterSpacing:'-0.02em' }}>
            System Overview
          </h2>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:4 }}>
            Full access · All modules · Real-time monitoring
          </p>
        </div>
        <div style={{ display:'flex', gap:16 }}>
          {[{v:stats?.totalPlans||0,l:'Plans'},{v:stats?.totalMachines||0,l:'Machines'},{v:stats?.totalMaterials||0,l:'Materials'}].map(s=>(
            <div key={s.l} style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 16px' }}>
              <p style={{ color:'#fff', fontSize:22, fontWeight:800, lineHeight:1 }}>{s.v}</p>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:10, marginTop:4, fontWeight:600 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPI grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        <KpiCard i={1} title="Total Plans"      value={stats?.totalPlans||0}          icon="📋" change={12} />
        <KpiCard i={2} title="Active Plans"     value={stats?.activePlans||0}         icon="⚡" change={8}  />
        <KpiCard i={3} title="Delayed Plans"    value={stats?.delayedPlans||0}        icon="⚠" change={-3} />
        <KpiCard i={4} title="Low Stock Alerts" value={stats?.lowStockAlerts||0}      icon="📦" change={5}  />
        <KpiCard i={5} title="Total Machines"   value={stats?.totalMachines||0}       icon="⚙" />
        <KpiCard i={6} title="Active Machines"  value={stats?.activeMachines||0}      icon="✓" change={2}  />
        <KpiCard i={7} title="In Maintenance"   value={stats?.maintenanceMachines||0} icon="🔧" />
        <KpiCard i={8} title="Notifications"    value={stats?.unreadNotifications||0} icon="🔔" />
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
        <SectionCard title="Production vs Target — Last 6 Months" delay={3}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f3fa" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#9aa3b5' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#9aa3b5' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #e8ecf4', fontSize:12 }} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="production" fill={THEME.primary} radius={[5,5,0,0]} name="Actual" />
              <Bar dataKey="target" fill="#e8ecf4" radius={[5,5,0,0]} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Plans by Status" delay={4}>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #e8ecf4', fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
            {pieData.map((d,i)=>(
              <div key={d.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:PIE_COLORS[i%PIE_COLORS.length] }} />
                  <span style={{ color:'#5a6478' }}>{d.name}</span>
                </div>
                <span style={{ fontWeight:700, color:'#0d1526' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Efficiency line */}
      <SectionCard title="Plant Efficiency Trend (%)" delay={5}>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f3fa" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:'#9aa3b5' }} axisLine={false} tickLine={false} />
            <YAxis domain={[70,100]} tick={{ fontSize:11, fill:'#9aa3b5' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v=>[`${v}%`,'Efficiency']} contentStyle={{ borderRadius:10, border:'1px solid #e8ecf4', fontSize:12 }} />
            <Line type="monotone" dataKey="efficiency" stroke={THEME.primary} strokeWidth={2.5} dot={{ fill:THEME.primary, r:4, strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* AI Delay Predictor */}
      <motion.div {...fadeUp(8)}>
        <DelayPredictor />
      </motion.div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <SectionCard title="Recent Production Plans" delay={6}>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {plans.map(plan=>(
              <div key={plan.id} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 14px', background:'#f8fafc', borderRadius:10,
                border:'1px solid #f0f3fa',
              }}>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#0d1526', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:200 }}>{plan.title}</p>
                  <p style={{ fontSize:11, color:'#9aa3b5', marginTop:2 }}>{plan.productName}</p>
                </div>
                <StatusBadge status={plan.status} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Machine Status Overview" delay={7}>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {machines.map(m=>{
              const dotColor = m.status==='ACTIVE'?'#10b981':m.status==='MAINTENANCE'?'#f97316':m.status==='IDLE'?'#f59e0b':'#ef4444';
              return (
                <div key={m.id} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'10px 14px', background:'#f8fafc', borderRadius:10,
                  border:'1px solid #f0f3fa',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:dotColor, boxShadow:`0 0 0 3px ${dotColor}30` }} />
                    <div>
                      <p style={{ fontSize:12, fontWeight:600, color:'#0d1526' }}>{m.name}</p>
                      <p style={{ fontSize:11, color:'#9aa3b5', marginTop:1 }}>{m.machineCode}</p>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <StatusBadge status={m.status} />
                    {m.efficiency>0 && <p style={{ fontSize:10, color:'#9aa3b5', marginTop:3 }}>{m.efficiency}% eff.</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
