import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const roleMenus = {
  ADMIN: [
    { icon: '🏠', label: 'Dashboard', path: '/admin' },
    { icon: '👥', label: 'Users', path: '/admin/users' },
    { icon: '📊', label: 'Analytics', path: '/admin/analytics' },
    { icon: '📋', label: 'Audit Logs', path: '/admin/logs' },
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ],
  PRODUCTION_MANAGER: [
    { icon: '🏠', label: 'Dashboard', path: '/production-manager' },
    { icon: '🏭', label: 'Production Plans', path: '/production' },
    { icon: '📈', label: 'Reports', path: '/reports' },
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ],
  INVENTORY_MANAGER: [
    { icon: '🏠', label: 'Dashboard', path: '/inventory-manager' },
    { icon: '📦', label: 'Inventory', path: '/inventory' },
    { icon: '🚨', label: 'Low Stock', path: '/inventory/low-stock' },
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ],
  MACHINE_OPERATOR: [
    { icon: '🏠', label: 'Dashboard', path: '/operator' },
    { icon: '⚙️', label: 'My Tasks', path: '/operator/tasks' },
    { icon: '🔧', label: 'Machines', path: '/machines' },
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ],
  QUALITY_ANALYST: [
    { icon: '🏠', label: 'Dashboard', path: '/quality' },
    { icon: '🔍', label: 'Quality Reports', path: '/quality/reports' },
    { icon: '📊', label: 'Analytics', path: '/quality/analytics' },
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ],
};

const roleColors = {
  ADMIN: 'from-purple-600 to-indigo-600',
  PRODUCTION_MANAGER: 'from-blue-600 to-cyan-600',
  INVENTORY_MANAGER: 'from-green-600 to-teal-600',
  MACHINE_OPERATOR: 'from-orange-500 to-amber-500',
  QUALITY_ANALYST: 'from-pink-600 to-rose-600',
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const menu = roleMenus[user?.role] || [];
  const gradient = roleColors[user?.role] || 'from-blue-600 to-indigo-600';

  const sidebarStyle = {
    background: dark ? '#181c2e' : '#ffffff',
    borderRight: `1px solid ${dark ? '#2a2f45' : '#f3f4f6'}`,
  };
  const dividerStyle = { borderColor: dark ? '#2a2f45' : '#f3f4f6' };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col shadow-xl overflow-hidden"
      style={sidebarStyle}
    >
      {/* Logo */}
      <div className={`p-4 bg-gradient-to-r ${gradient} flex items-center gap-3 min-h-[64px]`}>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">P</div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div className="text-white font-bold text-lg leading-none">Prodexa</div>
              <div className="text-white/70 text-xs">ERP Platform</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Info */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-4 border-b" style={dividerStyle}>
            <div className="flex items-center gap-3">
              <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                alt="avatar" className="w-10 h-10 rounded-full bg-gray-100" />
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: dark ? '#f1f5f9' : '#111827' }}>{user?.fullName}</div>
                <div className="text-xs truncate" style={{ color: dark ? '#9ca3af' : '#6b7280' }}>{user?.role?.replace(/_/g, ' ')}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menu.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path.split('/').length <= 2}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-sm font-medium truncate">{item.label}</motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Controls */}
      <div className="p-3 space-y-1 border-t" style={dividerStyle}>
        <button onClick={toggle} className="sidebar-link w-full">
          <span className="text-xl">{dark ? '☀️' : '🌙'}</span>
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">{dark ? 'Light Mode' : 'Dark Mode'}</motion.span>}
          </AnimatePresence>
        </button>
        <button onClick={() => { logout(); navigate('/login'); }}
          className="sidebar-link w-full" style={{ color: '#ef4444' }}>
          <span className="text-xl">🚪</span>
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">Logout</motion.span>}
          </AnimatePresence>
        </button>
        <button onClick={() => setCollapsed(c => !c)} className="sidebar-link w-full">
          <span className="text-xl">{collapsed ? '→' : '←'}</span>
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">Collapse</motion.span>}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
