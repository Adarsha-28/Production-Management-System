import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { PageHeader } from '../../components/UI';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const monthlyProduction = [
  { month: 'Jan', actual: 380, target: 400, efficiency: 82 },
  { month: 'Feb', actual: 420, target: 400, efficiency: 85 },
  { month: 'Mar', actual: 390, target: 420, efficiency: 79 },
  { month: 'Apr', actual: 460, target: 440, efficiency: 88 },
  { month: 'May', actual: 510, target: 480, efficiency: 91 },
  { month: 'Jun', actual: 495, target: 500, efficiency: 87 },
  { month: 'Jul', actual: 530, target: 500, efficiency: 93 },
  { month: 'Aug', actual: 480, target: 520, efficiency: 85 },
  { month: 'Sep', actual: 550, target: 530, efficiency: 94 },
  { month: 'Oct', actual: 520, target: 540, efficiency: 89 },
  { month: 'Nov', actual: 570, target: 550, efficiency: 96 },
  { month: 'Dec', actual: 495, target: 560, efficiency: 87 },
];

const deptData = [
  { dept: 'Assembly', output: 1240, defects: 23 },
  { dept: 'Machining', output: 980, defects: 15 },
  { dept: 'Welding', output: 760, defects: 31 },
  { dept: 'Coating', output: 540, defects: 8 },
  { dept: 'QA', output: 890, defects: 12 },
];

const categoryData = [
  { name: 'Metals', value: 35 }, { name: 'Chemicals', value: 20 },
  { name: 'Electrical', value: 18 }, { name: 'Fasteners', value: 15 }, { name: 'Others', value: 12 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Reports" subtitle="Comprehensive production and performance insights" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Annual Output', value: '6,040 units', change: '+12.4%', color: 'text-green-600' },
          { label: 'Avg Efficiency', value: '88.1%', change: '+3.2%', color: 'text-green-600' },
          { label: 'Total Defects', value: '89 units', change: '-8.5%', color: 'text-green-600' },
          { label: 'Downtime Hours', value: '142 hrs', change: '-15.3%', color: 'text-green-600' },
        ].map(kpi => (
          <div key={kpi.label} className="stat-card">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
            <p className={`text-xs font-medium mt-1 ${kpi.color}`}>{kpi.change} YoY</p>
          </div>
        ))}
      </div>

      {/* Annual Production Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Annual Production Overview</h3>
          <button className="btn-secondary text-xs">📥 Export CSV</button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthlyProduction}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="url(#actualGrad)" strokeWidth={2} name="Actual" />
            <Area type="monotone" dataKey="target" stroke="#10b981" fill="url(#targetGrad)" strokeWidth={2} name="Target" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="output" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Output" />
              <Bar dataKey="defects" fill="#ef4444" radius={[4, 4, 0, 0]} name="Defects" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory by Category */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Efficiency Trend */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Monthly Efficiency Trend (%)</h3>
          <button className="btn-secondary text-xs">📄 Export PDF</button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyProduction}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis domain={[75, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v}%`, 'Efficiency']} />
            <Line type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
