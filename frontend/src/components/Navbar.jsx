import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI } from '../api';

export default function Navbar({ sidebarWidth }) {
  const { user } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifDrop, setShowNotifDrop] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    notificationAPI.getUnreadCount().then(r => setNotifCount(r.data.count)).catch(() => {});
    notificationAPI.getAll().then(r => setNotifications(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const markRead = () => {
    notificationAPI.markAllRead().then(() => setNotifCount(0)).catch(() => {});
    setShowNotifDrop(false);
  };

  const typeColors = {
    LOW_STOCK: 'bg-yellow-100 text-yellow-800',
    DELAY_ALERT: 'bg-red-100 text-red-800',
    MACHINE_DOWNTIME: 'bg-orange-100 text-orange-800',
    SYSTEM: 'bg-blue-100 text-blue-800',
    INFO: 'bg-green-100 text-green-800',
  };

  const navStyle = {
    background: dark ? 'rgba(24,28,46,0.85)' : 'rgba(255,255,255,0.85)',
    borderBottom: `1px solid ${dark ? '#2a2f45' : '#f3f4f6'}`,
  };

  return (
    <header
      className="fixed top-0 right-0 z-30 h-16 backdrop-blur-md flex items-center justify-between px-6 shadow-sm"
      style={{ left: sidebarWidth, ...navStyle }}
    >
      <div>
        <h1 className="text-lg font-semibold" style={{ color: dark ? '#f1f5f9' : '#111827' }}>
          Welcome back, <span className="gradient-text">{user?.fullName?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-xs" style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDrop(s => !s)}
            className="relative p-2 rounded-xl transition-colors"
            style={{ background: showNotifDrop ? (dark ? '#2a2f45' : '#f3f4f6') : 'transparent' }}
          >
            <span className="text-xl">🔔</span>
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifDrop && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 card shadow-xl z-50 overflow-hidden"
              >
                <div className="p-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${dark ? '#2a2f45' : '#f3f4f6'}` }}>
                  <span className="font-semibold text-sm">Notifications</span>
                  <button onClick={markRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                  ) : notifications.map(n => (
                    <div key={n.id} className="p-3" style={{
                      borderBottom: `1px solid ${dark ? '#2a2f45' : '#f9fafb'}`,
                      background: !n.read ? (dark ? 'rgba(59,130,246,0.08)' : 'rgba(239,246,255,0.7)') : 'transparent'
                    }}>
                      <span className={`badge ${typeColors[n.type] || 'bg-gray-100 text-gray-700'}`}>{n.type?.replace('_', ' ')}</span>
                      <p className="text-sm font-medium mt-1">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center">
                  <button onClick={() => { navigate('/notifications'); setShowNotifDrop(false); }} className="text-xs text-blue-600 hover:underline">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 p-1.5 rounded-xl transition-colors"
        >
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
            alt="avatar" className="w-8 h-8 rounded-full bg-gray-100"
          />
          <div className="text-left hidden sm:block">
            <div className="text-sm font-medium leading-none" style={{ color: dark ? '#f1f5f9' : '#111827' }}>{user?.fullName}</div>
            <div className="text-xs mt-0.5" style={{ color: dark ? '#9ca3af' : '#6b7280' }}>{user?.role?.replace(/_/g, ' ')}</div>
          </div>
        </button>
      </div>
    </header>
  );
}
