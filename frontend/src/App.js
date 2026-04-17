import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ProductionManagerDashboard from './pages/dashboards/ProductionManagerDashboard';
import InventoryManagerDashboard from './pages/dashboards/InventoryManagerDashboard';
import OperatorDashboard from './pages/dashboards/OperatorDashboard';
import QualityDashboard from './pages/dashboards/QualityDashboard';
import ProductionPlans from './pages/ProductionPlans';
import Inventory from './pages/Inventory';
import Machines from './pages/Machines';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import UserManagement from './pages/admin/UserManagement';
import AuditLogs from './pages/admin/AuditLogs';
import Analytics from './pages/admin/Analytics';

const ROLE_HOME = {
  ADMIN: '/admin',
  PRODUCTION_MANAGER: '/production-manager',
  INVENTORY_MANAGER: '/inventory-manager',
  MACHINE_OPERATOR: '/operator',
  QUALITY_ANALYST: '/quality',
};

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⚙️</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={ROLE_HOME[user.role] || '/login'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={ROLE_HOME[user.role] || '/login'} /> : <Register />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><Analytics /></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AuditLogs /></ProtectedRoute>} />

        {/* Production Manager */}
        <Route path="/production-manager" element={<ProtectedRoute allowedRoles={['PRODUCTION_MANAGER']}><ProductionManagerDashboard /></ProtectedRoute>} />
        <Route path="/production" element={<ProtectedRoute allowedRoles={['ADMIN', 'PRODUCTION_MANAGER']}><ProductionPlans /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['PRODUCTION_MANAGER', 'ADMIN']}><Analytics /></ProtectedRoute>} />

        {/* Inventory Manager */}
        <Route path="/inventory-manager" element={<ProtectedRoute allowedRoles={['INVENTORY_MANAGER']}><InventoryManagerDashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute allowedRoles={['ADMIN', 'INVENTORY_MANAGER']}><Inventory /></ProtectedRoute>} />
        <Route path="/inventory/low-stock" element={<ProtectedRoute allowedRoles={['ADMIN', 'INVENTORY_MANAGER']}><Inventory /></ProtectedRoute>} />

        {/* Operator */}
        <Route path="/operator" element={<ProtectedRoute allowedRoles={['MACHINE_OPERATOR']}><OperatorDashboard /></ProtectedRoute>} />
        <Route path="/operator/tasks" element={<ProtectedRoute allowedRoles={['MACHINE_OPERATOR']}><ProductionPlans /></ProtectedRoute>} />
        <Route path="/machines" element={<ProtectedRoute allowedRoles={['ADMIN', 'MACHINE_OPERATOR', 'PRODUCTION_MANAGER']}><Machines /></ProtectedRoute>} />

        {/* Quality */}
        <Route path="/quality" element={<ProtectedRoute allowedRoles={['QUALITY_ANALYST']}><QualityDashboard /></ProtectedRoute>} />
        <Route path="/quality/reports" element={<ProtectedRoute allowedRoles={['QUALITY_ANALYST', 'ADMIN']}><Analytics /></ProtectedRoute>} />
        <Route path="/quality/analytics" element={<ProtectedRoute allowedRoles={['QUALITY_ANALYST', 'ADMIN']}><Analytics /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>

      <Route path="/" element={user ? <Navigate to={ROLE_HOME[user.role] || '/login'} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            style: { borderRadius: '12px', background: '#1e2235', color: '#fff', fontSize: '14px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
