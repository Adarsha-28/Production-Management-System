import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productionAPI, machineAPI } from '../../api';
import { StatCard, LoadingSkeleton, StatusBadge, ProgressBar } from '../../components/UI';

export default function OperatorDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productionAPI.getAll(0, 10), machineAPI.getAll()])
      .then(([p, m]) => { setTasks(p.data.content || []); setMachines(m.data || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton rows={6} />;

  const myMachines = machines.filter(m => m.operatorName === user?.fullName);
  const activeTasks = tasks.filter(t => t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Tasks" value={tasks.length} icon="📋" gradient="gradient-blue" />
        <StatCard title="Active Tasks" value={activeTasks.length} icon="🏭" gradient="gradient-green" />
        <StatCard title="My Machines" value={myMachines.length} icon="⚙️" gradient="gradient-orange" />
        <StatCard title="Completed Today" value={2} icon="✅" gradient="gradient-purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">My Assigned Tasks</h3>
          <div className="space-y-4">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.productName}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <ProgressBar value={task.completedQuantity || 0} max={task.targetQuantity || 1}
                  color={task.status === 'DELAYED' ? 'bg-red-500' : task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'} />
                <p className="text-xs text-gray-400 mt-2">Due: {task.endDate}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">My Machines</h3>
          <div className="space-y-3">
            {myMachines.length > 0 ? myMachines.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${m.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : m.status === 'MAINTENANCE' ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.machineCode} • {m.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={m.status} />
                  {m.efficiency > 0 && <p className="text-xs text-gray-500 mt-1">{m.efficiency}%</p>}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-3xl mb-2">⚙️</p>
                <p className="text-sm">No machines assigned yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
