import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { dashboardAPI, inventoryAPI } from '../../api';
import { StatCard, LoadingSkeleton, StatusBadge } from '../../components/UI';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function InventoryManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardAPI.getStats(), inventoryAPI.getAll(0, 20)])
      .then(([s, m]) => { setStats(s.data); setMaterials(m.data.content || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton rows={8} />;

  const stockData = materials.slice(0, 8).map(m => ({
    name: m.name.split(' ').slice(0, 2).join(' '),
    current: m.currentStock,
    min: m.minStockLevel,
  }));

  const statusCounts = materials.reduce((acc, m) => {
    acc[m.stockStatus] = (acc[m.stockStatus] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([k, v]) => ({ name: k.replace('_', ' '), value: v }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Materials" value={stats?.totalMaterials || 0} icon="📦" gradient="gradient-blue" />
        <StatCard title="Low Stock" value={stats?.lowStockAlerts || 0} icon="⚠️" gradient="gradient-orange" />
        <StatCard title="Adequate Stock" value={(stats?.totalMaterials || 0) - (stats?.lowStockAlerts || 0)} icon="✅" gradient="gradient-green" />
        <StatCard title="Suppliers" value={8} icon="🚚" gradient="gradient-purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Stock Levels vs Minimum</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stockData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="current" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Current Stock" />
              <Bar dataKey="min" fill="#fca5a5" radius={[0, 4, 4, 0]} name="Min Level" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Stock Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }}></div>
                  <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                </div>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Materials Requiring Attention</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 dark:border-dark-700">
              <th className="table-header">Material</th>
              <th className="table-header">SKU</th>
              <th className="table-header">Current Stock</th>
              <th className="table-header">Min Level</th>
              <th className="table-header">Supplier</th>
              <th className="table-header">Status</th>
            </tr></thead>
            <tbody>
              {materials.filter(m => m.stockStatus !== 'ADEQUATE').map(m => (
                <tr key={m.id} className="table-row">
                  <td className="table-cell font-medium">{m.name}</td>
                  <td className="table-cell text-gray-500">{m.sku}</td>
                  <td className="table-cell"><span className="font-semibold text-red-600">{m.currentStock} {m.unit}</span></td>
                  <td className="table-cell text-gray-500">{m.minStockLevel} {m.unit}</td>
                  <td className="table-cell text-gray-500">{m.supplier}</td>
                  <td className="table-cell"><StatusBadge status={m.stockStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
