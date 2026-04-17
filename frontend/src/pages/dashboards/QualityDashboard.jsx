import React, { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { productionAPI } from '../../api';
import { StatCard, LoadingSkeleton, StatusBadge } from '../../components/UI';

const qualityData = [
  { subject: 'Dimensional', A: 94 }, { subject: 'Surface Finish', A: 88 },
  { subject: 'Material', A: 96 }, { subject: 'Assembly', A: 91 },
  { subject: 'Functional', A: 89 }, { subject: 'Visual', A: 97 },
];

const trendData = [
  { week: 'W1', passRate: 91 }, { week: 'W2', passRate: 94 }, { week: 'W3', passRate: 88 },
  { week: 'W4', passRate: 96 }, { week: 'W5', passRate: 93 }, { week: 'W6', passRate: 97 },
];

export default function QualityDashboard() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productionAPI.getAll(0, 10).then(r => setPlans(r.data.content || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Inspections Today" value={12} icon="🔍" gradient="gradient-blue" change={8} />
        <StatCard title="Pass Rate" value="94.2%" icon="✅" gradient="gradient-green" change={2.1} />
        <StatCard title="Failed Batches" value={3} icon="❌" gradient="gradient-red" change={-1} />
        <StatCard title="Pending Review" value={7} icon="⏳" gradient="gradient-orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quality Metrics Radar</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={qualityData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar name="Quality" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Weekly Pass Rate Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Pass Rate']} />
              <Line type="monotone" dataKey="passRate" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Production Batches for QA Review</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 dark:border-dark-700">
              <th className="table-header">Batch / Plan</th>
              <th className="table-header">Product</th>
              <th className="table-header">Quantity</th>
              <th className="table-header">Status</th>
              <th className="table-header">QA Status</th>
            </tr></thead>
            <tbody>
              {plans.map((plan, i) => (
                <tr key={plan.id} className="table-row">
                  <td className="table-cell font-medium">{plan.title}</td>
                  <td className="table-cell text-gray-500">{plan.productName}</td>
                  <td className="table-cell">{plan.completedQuantity} / {plan.targetQuantity}</td>
                  <td className="table-cell"><StatusBadge status={plan.status} /></td>
                  <td className="table-cell">
                    <span className={`badge ${i % 3 === 0 ? 'bg-green-100 text-green-800' : i % 3 === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {i % 3 === 0 ? 'Approved' : i % 3 === 1 ? 'Pending' : 'In Review'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
