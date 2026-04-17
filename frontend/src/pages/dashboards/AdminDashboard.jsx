import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardAPI, productionAPI, machineAPI } from '../../api';
import { StatCard, LoadingSkeleton, StatusBadge } from '../../components/UI';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const monthlyData = [
  { month: 'Jul', production: 420, target: 450, efficiency: 82 },
  { month: 'Aug', production: 480, target: 450, efficiency: 85 },
  { month: 'Sep', production: 390, target: 450, efficiency: 78 },
  { month: 'Oct', production: 510, target: 500, efficiency: 88 },
  { month: 'Nov', production: 530, target: 500, efficiency: 91 },
  { month: 'Dec', production: 495, target: 500, efficiency: 87 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardAPI.getStats(), productionAPI.getAll(0, 5), machineAPI.getAll()])
      .then(([s, p, m]) => {
        setStats(s.data);
        setPlans(p.data.content || []);
        setMachines(m.data.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><LoadingSkeleton rows={8} /></div>;

  const pieData = stats ? Object.entries(stats.plansByStatus || {}).map(([k, v]) => ({ name: k.replace('_', ' '), value: v })) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Plans" value={stats?.totalPlans || 0} icon="📋" gradient="gradient-blue" change={12} />
        <StatCard title="Active Plans" value={stats?.activePlans || 0} icon="🏭" gradient="gradient-green" change={8} />
        <StatCard title="Delayed Plans" value={stats?.delayedPlans || 0} icon="⚠️" gradient="gradient-red" change={-3} />
        <StatCard title="Low Stock Alerts" value={stats?.lowStockAlerts || 0} icon="📦" gradient="gradient-orange" change={5} />
        <StatCard title="Total Machines" value={stats?.totalMachines || 0} icon="⚙️" gradient="gradient-purple" />
        <StatCard title="Active Machines" value={stats?.activeMachines || 0} icon="✅" gradient="gradient-green" change={2} />
        <StatCard title="In Maintenance" value={stats?.maintenanceMachines || 0} icon="🔧" gradient="gradient-orange" />
        <StatCard title="Notifications" value={stats?.unreadNotifications || 0} icon="🔔" gradient="gradient-blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-base font-semibold mb-4">Production vs Target (6 Months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="production" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Actual" />
              <Bar dataKey="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold mb-4">Plans by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                  <span style={{ color: '#6b7280' }}>{d.name}</span>
                </div>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-base font-semibold mb-4">Plant Efficiency Trend (%)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v}%`, 'Efficiency']} />
            <Line type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold mb-4">Recent Production Plans</h3>
          <div className="space-y-3">
            {plans.map(plan => (
              <div key={plan.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f9fafb' }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{plan.title}</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>{plan.productName}</p>
                </div>
                <StatusBadge status={plan.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold mb-4">Machine Status Overview</h3>
          <div className="space-y-3">
            {machines.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f9fafb' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    m.status === 'ACTIVE' ? 'bg-green-500' :
                    m.status === 'MAINTENANCE' ? 'bg-orange-500' :
                    m.status === 'IDLE' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{m.machineCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={m.status} />
                  {m.efficiency > 0 && <p className="text-xs mt-1" style={{ color: '#6b7280' }}>{m.efficiency}% eff.</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
