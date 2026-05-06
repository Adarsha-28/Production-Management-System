import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { productionAPI, machineAPI } from '../../api';
import { LoadingSkeleton, StatusBadge, ProgressBar } from '../../components/UI';

/* ── Machine Operator theme: amber/orange ── */
const THEME = {
  primary:'#f97316', dark:'#ea580c', soft:'#fff7ed',
  gradient:'linear-gradient(135deg,#f97316,#ea580c)',
  glow:'rgba(249,115,22,0.15)',
};
const fadeUp = (i=0) => ({ initial:{opacity:0,y:20}, animate:{opacity:1,y:0}, transition:{duration:0.4,delay:i*0.07,ease:[0.4,0,0.2,1]} });

function KpiCard({ title, value, icon, sub, i }) {
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

export default function OperatorDashboard() {
  const { user }                    = useAuth();
  const [tasks, setTasks]           = useState([]);
  const [machines, setMachines]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([productionAPI.getAll(0,10), machineAPI.getAll()])
      .then(([p,m]) => { setTasks(p.data.content||[]); setMachines(m.data||[]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton rows={6} />;

  const myMachines   = machines.filter(m => m.operatorName === user?.fullName);
  const activeTasks  = tasks.filter(t => t.status === 'IN_PROGRESS');

  const statusDot = { ACTIVE:'#10b981', IDLE:'#f59e0b', MAINTENANCE:'#f97316', OFFLINE:'#ef4444' };

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
            Machine Operator Dashboard
          </p>
          <h2 style={{ color:'#fff', fontSize:20, fontWeight:800, letterSpacing:'-0.02em' }}>My Work Center</h2>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:4 }}>
            Assigned to: <strong style={{ color:'#fff' }}>{user?.fullName}</strong>
          </p>
        </div>
        <div style={{ display:'flex', gap:16 }}>
          {[{v:tasks.length,l:'My Tasks'},{v:activeTasks.length,l:'Active'},{v:myMachines.length,l:'My Machines'}].map(s=>(
            <div key={s.l} style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 16px' }}>
              <p style={{ color:'#fff', fontSize:22, fontWeight:800, lineHeight:1 }}>{s.v}</p>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:10, marginTop:4, fontWeight:600 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        <KpiCard i={1} title="My Tasks"       value={tasks.length}        icon="📋" />
        <KpiCard i={2} title="Active Tasks"   value={activeTasks.length}  icon="⚡" />
        <KpiCard i={3} title="My Machines"    value={myMachines.length}   icon="⚙" />
        <KpiCard i={4} title="Completed Today" value={2}                  icon="✓" sub="Today's output" />
      </div>

      {/* Tasks + Machines */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

        {/* Tasks */}
        <motion.div {...fadeUp(3)} style={{ background:'#fff', border:'1px solid #e8ecf4', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
          <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f3fa' }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526' }}>My Assigned Tasks</h3>
          </div>
          <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:12 }}>
            {tasks.slice(0,5).map((task,i) => (
              <motion.div key={task.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:0.4+i*0.07}}
                style={{ padding:'14px 16px', background:'#f8fafc', borderRadius:12, border:'1px solid #f0f3fa' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:'#0d1526' }}>{task.title}</p>
                    <p style={{ fontSize:11, color:'#9aa3b5', marginTop:2 }}>{task.productName}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <ProgressBar
                  value={task.completedQuantity||0}
                  max={task.targetQuantity||1}
                  color={task.status==='DELAYED'?'bg-red-500':task.status==='COMPLETED'?'bg-green-500':'bg-blue-500'}
                />
                <p style={{ fontSize:10, color:'#9aa3b5', marginTop:8 }}>Due: {task.endDate}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Machines */}
        <motion.div {...fadeUp(4)} style={{ background:'#fff', border:'1px solid #e8ecf4', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
          <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f3fa' }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526' }}>My Machines</h3>
          </div>
          <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:10 }}>
            {myMachines.length > 0 ? myMachines.map((m,i) => (
              <motion.div key={m.id} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{delay:0.4+i*0.07}}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'#f8fafc', borderRadius:12, border:'1px solid #f0f3fa' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:10, height:10, borderRadius:'50%',
                    background: statusDot[m.status]||'#9aa3b5',
                    boxShadow:`0 0 0 3px ${(statusDot[m.status]||'#9aa3b5')}30`,
                  }} />
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:'#0d1526' }}>{m.name}</p>
                    <p style={{ fontSize:11, color:'#9aa3b5', marginTop:1 }}>{m.machineCode} · {m.location}</p>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <StatusBadge status={m.status} />
                  {m.efficiency>0 && <p style={{ fontSize:10, color:'#9aa3b5', marginTop:3 }}>{m.efficiency}% eff.</p>}
                </div>
              </motion.div>
            )) : (
              <div style={{ textAlign:'center', padding:'32px 0', color:'#9aa3b5' }}>
                <p style={{ fontSize:28, marginBottom:8 }}>⚙</p>
                <p style={{ fontSize:12, fontWeight:500 }}>No machines assigned yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
