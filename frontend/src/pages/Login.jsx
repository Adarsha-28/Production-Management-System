import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const ROLE_PATHS = {
  ADMIN: '/admin',
  PRODUCTION_MANAGER: '/production-manager',
  INVENTORY_MANAGER: '/inventory-manager',
  MACHINE_OPERATOR: '/operator',
  QUALITY_ANALYST: '/quality',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      login(res.data, res.data.token);
      toast.success(`Welcome back, ${res.data.fullName}!`);
      navigate(ROLE_PATHS[res.data.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  const demoAccounts = [
    { label: 'Admin', username: 'admin', password: 'admin123', color: 'from-purple-500 to-indigo-500' },
    { label: 'Prod. Manager', username: 'sarah.pm', password: 'pass123', color: 'from-blue-500 to-cyan-500' },
    { label: 'Inv. Manager', username: 'mike.inv', password: 'pass123', color: 'from-green-500 to-teal-500' },
    { label: 'Operator', username: 'john.op', password: 'pass123', color: 'from-orange-500 to-amber-500' },
    { label: 'QA Analyst', username: 'emma.qa', password: 'pass123', color: 'from-pink-500 to-rose-500' },
  ];

  const quickLogin = async (username, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ username, password });
      login(res.data, res.data.token);
      toast.success(`Logged in as ${res.data.fullName}`);
      navigate(ROLE_PATHS[res.data.role] || '/');
    } catch { toast.error('Quick login failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
              className="absolute w-32 h-32 border border-white/30 rounded-2xl"
              style={{ left: `${10 + i * 15}%`, top: `${10 + (i % 3) * 25}%` }} />
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center z-10">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl">🏭</div>
          <h1 className="text-4xl font-bold text-white mb-3">Prodexa ERP</h1>
          <p className="text-white/80 text-lg mb-8">Manufacturing & Production Management</p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {['🏭 Production Planning', '📦 Inventory Control', '⚙️ Machine Monitoring', '📊 Analytics & Reports'].map(f => (
              <div key={f} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white text-sm font-medium">{f}</div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-dark-900">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">P</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in to Prodexa</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
              <input {...register('username', { required: 'Username is required' })}
                className="input" placeholder="Enter username" />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <input {...register('password', { required: 'Password is required' })}
                type="password" className="input" placeholder="Enter password" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-60">
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-5 gap-2">
              {demoAccounts.map(acc => (
                <button key={acc.username} onClick={() => quickLogin(acc.username, acc.password)}
                  disabled={loading}
                  className={`bg-gradient-to-br ${acc.color} text-white text-xs font-medium py-2 px-1 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-center`}>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-medium">Register</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
