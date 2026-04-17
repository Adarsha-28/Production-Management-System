import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI, productionAPI } from '../../api';
import { StatCard, LoadingSkeleton, StatusBadge, ProgressBar } from '../../components/UI';

const weeklyData = [
  { day: 'Mon', units: 85 }, { day: 'Tue', units: 92 }, { day: 'Wed', units: 78 },
  { day: 'Thu', units: 96 }, { day: 'Fri', units: 88 }, { day: 'Sat', units: 45 }, { day: 'Sun', units: 20 },
];

export default function ProductionManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardAPI.getStats(), productionAPI.getAll(0, 8)])
      .then(([s, p]) => { setStats(s.data); setPlans(p.data.content || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton rows={8} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Plans" value={stats?.totalPlans || 0} icon="📋" gradient="gradient-blue" change={12} />
        <StatCard title="In Progress" value={stats?.activePlans || 0} icon="🏭" gradient="gradient-green" change={8} />
        <StatCard title="Delayed" value={stats?.delayedPlans || 0} icon="⚠️" gradient="gradient-red" />
        <StatCard title="Completed" value={stats?.completedPlans || 0} icon="✅" gradient="gradient-purple" change={15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Weekly Production Output</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="units" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Units Produced" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
          <div className="space-y-4">
            {[
              { label: 'On-Time Delivery', value: 87, color: 'bg-green-500' },
              { label: 'Quality Pass Rate', value: 94, color: 'bg-blue-500' },
              { label: 'Resource Utilization', value: 78, color: 'bg-purple-500' },
              { label: 'Plan Completion', value: 72, color: 'bg-orange-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-dark-700 rounded-full">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Production Plans Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 dark:border-dark-700">
              <th className="table-header">Plan</th>
              <th className="table-header">Product</th>
              <th className="table-header">Progress</th>
              <th className="table-header">Priority</th>
              <th className="table-header">Status</th>
              <th className="table-header">Due Date</th>
            </tr></thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id} className="table-row">
                  <td className="table-cell font-medium">{plan.title}</td>
                  <td className="table-cell text-gray-500">{plan.productName}</td>
                  <td className="table-cell w-40">
                    <ProgressBar value={plan.completedQuantity || 0} max={plan.targetQuantity || 1}
                      color={plan.status === 'DELAYED' ? 'bg-red-500' : 'bg-blue-500'} />
                  </td>
                  <td className="table-cell"><StatusBadge status={plan.priority} /></td>
                  <td className="table-cell"><StatusBadge status={plan.status} /></td>
                  <td className="table-cell text-gray-500">{plan.endDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
