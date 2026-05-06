import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { dashboardAPI, inventoryAPI } from '../../api';
import { LoadingSkeleton, StatusBadge } from '../../components/UI';

/* ── Inventory Manager theme: emerald/teal ── */
const THEME = {
  primary:'#10b981', dark:'#059669', soft:'#ecfdf5',
  gradient:'linear-gradient(135deg,#10b981,#059669)',
  glow:'rgba(16,185,129,0.15)',
};
const PIE_COLORS = ['#10b981','#f59e0b','#ef4444'];
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

export default function InventoryManagerDashboard() {
  const [stats, setStats]         = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([dashboardAPI.getStats(), inventoryAPI.getAll(0,20)])
      .then(([s,m]) => { setStats(s.data); setMaterials(m.data.content||[]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton rows={8} />;

  const stockData = materials.slice(0,8).map(m=>({
    name: m.name.split(' ').slice(0,2).join(' '),
    current: m.currentStock, min: m.minStockLevel,
  }));
  const statusCounts = materials.reduce((acc,m)=>{ acc[m.stockStatus]=(acc[m.stockStatus]||0)+1; return acc; },{});
  const pieData = Object.entries(statusCounts).map(([k,v])=>({ name:k.replace('_',' '), value:v }));
  const alertMaterials = materials.filter(m=>m.stockStatus!=='ADEQUATE');

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
            Inventory Manager Dashboard
          </p>
          <h2 style={{ color:'#fff', fontSize:20, fontWeight:800, letterSpacing:'-0.02em' }}>Stock Control Center</h2>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:4 }}>Monitor · Restock · Optimize · Alert</p>
        </div>
        <div style={{ display:'flex', gap:16 }}>
          {[{v:stats?.totalMaterials||0,l:'Materials'},{v:stats?.lowStockAlerts||0,l:'Low Stock'},{v:8,l:'Suppliers'}].map(s=>(
            <div key={s.l} style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 16px' }}>
              <p style={{ color:'#fff', fontSize:22, fontWeight:800, lineHeight:1 }}>{s.v}</p>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:10, marginTop:4, fontWeight:600 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        <KpiCard i={1} title="Total Materials" value={stats?.totalMaterials||0}                                    icon="📦" />
        <KpiCard i={2} title="Low Stock"        value={stats?.lowStockAlerts||0}                                   icon="⚠" />
        <KpiCard i={3} title="Adequate Stock"   value={(stats?.totalMaterials||0)-(stats?.lowStockAlerts||0)}      icon="✓" />
        <KpiCard i={4} title="Suppliers"        value={8}                                                          icon="🚚" />
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
        <motion.div {...fadeUp(3)} style={{ background:'#fff', border:'1px solid #e8ecf4', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
          <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f3fa' }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526' }}>Stock Levels vs Minimum Required</h3>
          </div>
          <div style={{ padding:'18px 22px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stockData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f3fa" horizontal={false} />
                <XAxis type="number" tick={{ fontSize:11, fill:'#9aa3b5' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize:10, fill:'#9aa3b5' }} width={90} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #e8ecf4', fontSize:12 }} />
                <Bar dataKey="current" fill={THEME.primary} radius={[0,5,5,0]} name="Current Stock" />
                <Bar dataKey="min" fill="#fca5a5" radius={[0,5,5,0]} name="Min Level" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div {...fadeUp(4)} style={{ background:'#fff', border:'1px solid #e8ecf4', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
          <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f3fa' }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526' }}>Stock Status Distribution</h3>
          </div>
          <div style={{ padding:'18px 22px' }}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={3}>
                  {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #e8ecf4', fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', flexDirection:'column', gap:7, marginTop:8 }}>
              {pieData.map((d,i)=>(
                <div key={d.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:PIE_COLORS[i] }} />
                    <span style={{ color:'#5a6478' }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight:700, color:'#0d1526' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Alert table */}
      <motion.div {...fadeUp(5)} style={{ background:'#fff', border:'1px solid #e8ecf4', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f3fa', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:'#0d1526' }}>Materials Requiring Attention</h3>
          <span style={{ fontSize:11, fontWeight:700, color:'#ef4444', background:'#fef2f2', padding:'3px 10px', borderRadius:99 }}>
            {alertMaterials.length} alerts
          </span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Material','SKU','Current Stock','Min Level','Supplier','Status'].map(h=>(
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alertMaterials.map((m,i)=>(
                <motion.tr key={m.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5+i*0.05}} className="table-row">
                  <td className="table-cell" style={{ fontWeight:600, color:'#0d1526' }}>{m.name}</td>
                  <td className="table-cell" style={{ color:'#9aa3b5', fontFamily:'monospace', fontSize:11 }}>{m.sku}</td>
                  <td className="table-cell"><span style={{ fontWeight:700, color:'#ef4444' }}>{m.currentStock} {m.unit}</span></td>
                  <td className="table-cell" style={{ color:'#9aa3b5' }}>{m.minStockLevel} {m.unit}</td>
                  <td className="table-cell" style={{ color:'#9aa3b5', fontSize:12 }}>{m.supplier}</td>
                  <td className="table-cell"><StatusBadge status={m.stockStatus} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
