import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api';
import { PageHeader, LoadingSkeleton, Modal } from '../../components/UI';

const ROLES = ['ADMIN', 'PRODUCTION_MANAGER', 'INVENTORY_MANAGER', 'MACHINE_OPERATOR', 'QUALITY_ANALYST'];
const ROLE_COLORS = {
  ADMIN: 'from-purple-500 to-indigo-500',
  PRODUCTION_MANAGER: 'from-blue-500 to-cyan-500',
  INVENTORY_MANAGER: 'from-green-500 to-teal-500',
  MACHINE_OPERATOR: 'from-orange-500 to-amber-500',
  QUALITY_ANALYST: 'from-pink-500 to-rose-500',
};
const ROLE_ICONS = {
  ADMIN: '👑',
  PRODUCTION_MANAGER: '🏭',
  INVENTORY_MANAGER: '📦',
  MACHINE_OPERATOR: '⚙️',
  QUALITY_ANALYST: '🔍',
};

const emptyForm = {
  fullName: '', username: '', email: '', password: '',
  role: 'MACHINE_OPERATOR', phone: '', department: '',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getUsers(page, 12)
      .then(r => { setUsers(r.data.content || []); setTotalPages(r.data.totalPages || 0); })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.fullName || !form.username || !form.email || !form.password) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      await adminAPI.createUser(form);
      toast.success(`User "${form.fullName}" created successfully!`);
      setModal(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create user';
      toast.error(msg);
    }
    setSaving(false);
  };

  const handleRoleChange = async (id, role) => {
    try { await adminAPI.updateRole(id, role); toast.success('Role updated!'); load(); }
    catch { toast.error('Failed to update role'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try { await adminAPI.deleteUser(id); toast.success('User deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} total users across all roles`}
        action={
          <button onClick={() => { setForm(emptyForm); setModal(true); }} className="btn-primary flex items-center gap-2">
            <span className="text-lg">+</span> Create User
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role).length;
          return (
            <button key={role} onClick={() => setRoleFilter(f => f === role ? '' : role)}
              className={`card p-3 text-center transition-all hover:shadow-md ${roleFilter === role ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="text-xl mb-1">{ROLE_ICONS[role]}</div>
              <div className="text-lg font-bold">{count}</div>
              <div className="text-xs" style={{ color: '#9ca3af' }}>{role.replace(/_/g, ' ')}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by name, username or email..."
          className="input max-w-xs" />
        {roleFilter && (
          <button onClick={() => setRoleFilter('')}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
            {ROLE_ICONS[roleFilter]} {roleFilter.replace(/_/g, ' ')}
            <span className="ml-1 font-bold">✕</span>
          </button>
        )}
        <span className="text-sm ml-auto" style={{ color: '#9ca3af' }}>
          Showing {filtered.length} of {users.length} users
        </span>
      </div>

      {/* User Cards */}
      {loading ? (
        <div className="card p-6"><LoadingSkeleton rows={6} /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">👥</div>
          <p className="font-semibold text-lg">No users found</p>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((u, i) => (
            <motion.div key={u.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-5 hover:shadow-md transition-all duration-200">

              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                    alt="avatar"
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${u.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{u.fullName}</h3>
                  <p className="text-xs" style={{ color: '#6b7280' }}>@{u.username}</p>
                  <p className="text-xs truncate" style={{ color: '#9ca3af' }}>{u.email}</p>
                </div>
                <span className={`badge text-white text-xs bg-gradient-to-r ${ROLE_COLORS[u.role] || 'from-gray-400 to-gray-500'} flex-shrink-0`}>
                  {ROLE_ICONS[u.role]}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs mb-4 p-3 rounded-xl" style={{ background: '#f9fafb' }}>
                <div className="flex justify-between">
                  <span style={{ color: '#9ca3af' }}>📱 Phone</span>
                  <span className="font-medium">{u.phone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#9ca3af' }}>🏢 Department</span>
                  <span className="font-medium">{u.department || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#9ca3af' }}>📅 Joined</span>
                  <span className="font-medium">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#9ca3af' }}>🕐 Last Login</span>
                  <span className="font-medium">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>

              {/* Role selector */}
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Change Role</label>
                <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                  className="input text-sm py-1.5">
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_ICONS[r]} {r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
                <span className={`badge text-white text-xs bg-gradient-to-r ${ROLE_COLORS[u.role] || 'from-gray-400 to-gray-500'}`}>
                  {u.role?.replace(/_/g, ' ')}
                </span>
                <button onClick={() => handleDelete(u.id, u.fullName)}
                  className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                  🗑️ Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: '#6b7280' }}>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="btn-secondary text-sm disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {/* ── Create User Modal ── */}
      <Modal open={modal} onClose={() => { setModal(false); setForm(emptyForm); }} title="Create New User">
        <div className="space-y-4">

          {/* Avatar preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#f9fafb' }}>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username || 'new'}`}
              alt="preview"
              className="w-14 h-14 rounded-xl bg-gray-200 object-cover"
            />
            <div>
              <p className="font-semibold text-sm">{form.fullName || 'New User'}</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>@{form.username || 'username'}</p>
              <span className={`badge text-white text-xs mt-1 bg-gradient-to-r ${ROLE_COLORS[form.role]}`}>
                {ROLE_ICONS[form.role]} {form.role?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="input" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Username <span className="text-red-500">*</span>
              </label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="input" placeholder="john.doe" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
              Email <span className="text-red-500">*</span>
            </label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="input" placeholder="john@prodexa.com" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input pr-10" placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9ca3af' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && form.password.length < 6 && (
              <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
              Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map(r => (
                <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    form.role === r
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  <span className="text-xl">{ROLE_ICONS[r]}</span>
                  <div>
                    <p className="text-sm font-medium">{r.replace(/_/g, ' ')}</p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>
                      {r === 'ADMIN' ? 'Full system access' :
                       r === 'PRODUCTION_MANAGER' ? 'Manage production plans' :
                       r === 'INVENTORY_MANAGER' ? 'Manage materials & stock' :
                       r === 'MACHINE_OPERATOR' ? 'Operate machines & tasks' :
                       'Quality control & reports'}
                    </p>
                  </div>
                  {form.role === r && <span className="ml-auto text-blue-500">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="input" placeholder="+1-555-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Department</label>
              <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="input" placeholder="Operations" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleCreate}
              disabled={saving || !form.fullName || !form.username || !form.email || !form.password || form.password.length < 6}
              className="btn-primary flex-1 disabled:opacity-50">
              {saving ? '⏳ Creating...' : '✅ Create User'}
            </button>
            <button onClick={() => { setModal(false); setForm(emptyForm); }} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
