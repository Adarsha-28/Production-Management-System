import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationAPI } from '../api';
import { PageHeader, LoadingSkeleton } from '../components/UI';
import toast from 'react-hot-toast';

const typeIcons = { LOW_STOCK: '📦', DELAY_ALERT: '⚠️', MACHINE_DOWNTIME: '⚙️', SYSTEM: '🖥️', INFO: 'ℹ️' };
const typeColors = { LOW_STOCK: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10', DELAY_ALERT: 'border-l-red-500 bg-red-50 dark:bg-red-900/10', MACHINE_DOWNTIME: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10', SYSTEM: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10', INFO: 'border-l-green-500 bg-green-50 dark:bg-green-900/10' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    notificationAPI.getAll().then(r => setNotifications(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    try { await notificationAPI.markAllRead(); toast.success('All marked as read'); load(); }
    catch { toast.error('Failed'); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle={`${unreadCount} unread notifications`}
        action={unreadCount > 0 && <button onClick={markAllRead} className="btn-secondary">✓ Mark All Read</button>} />

      {loading ? <LoadingSkeleton rows={6} /> : (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No notifications</h3>
              <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
            </div>
          ) : notifications.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`card p-4 border-l-4 ${typeColors[n.type] || 'border-l-gray-300'} ${!n.read ? 'ring-1 ring-blue-200 dark:ring-blue-800' : ''}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{typeIcons[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{n.title}</h3>
                    {!n.read && <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">New</span>}
                    <span className="badge bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-gray-400">{n.type?.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
