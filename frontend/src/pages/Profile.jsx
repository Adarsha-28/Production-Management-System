import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { userAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  ADMIN: 'from-purple-500 to-indigo-500',
  PRODUCTION_MANAGER: 'from-blue-500 to-cyan-500',
  INVENTORY_MANAGER: 'from-green-500 to-teal-500',
  MACHINE_OPERATOR: 'from-orange-500 to-amber-500',
  QUALITY_ANALYST: 'from-pink-500 to-rose-500',
};

const AVATAR_PRESETS = [
  'admin', 'sarah', 'mike', 'john', 'emma',
  'alice', 'bob', 'carol', 'dave', 'eve',
  'frank', 'grace',
];

export default function Profile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    userAPI.getMe().then(r => { setProfile(r.data); setForm(r.data); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateMe(form);
      setProfile(res.data);
      updateUser(res.data);
      setEditing(false);
      setShowAvatarPicker(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setSaving(true);
    try {
      await userAPI.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    setSaving(false);
  };

  const avatarSrc = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  const currentAvatar = imgError
    ? avatarSrc(profile?.username)
    : (profile?.avatarUrl || avatarSrc(profile?.username));

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin text-4xl">⚙️</div>
    </div>
  );

  const gradient = ROLE_COLORS[profile.role] || 'from-blue-500 to-indigo-500';

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Header Card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">

        {/* Banner */}
        <div className={`h-36 bg-gradient-to-r ${gradient} relative`}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/20"
              style={{ width: 80 + i * 40, height: 80 + i * 40, left: `${5 + i * 18}%`, top: '-30%', opacity: 0.15 }} />
          ))}
        </div>

        {/* Avatar + Info row */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4" style={{ marginTop: -48 }}>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100"
                style={{ minWidth: 96, minHeight: 96 }}>
                <img
                  src={currentAvatar}
                  alt="avatar"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online dot */}
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"
                style={{ transform: 'translate(25%, 25%)' }} />
              {/* Change avatar button */}
              <button
                onClick={() => { setEditing(true); setShowAvatarPicker(p => !p); }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white shadow px-2 py-0.5 rounded-full border border-gray-200 whitespace-nowrap hover:bg-gray-50 transition-colors"
                style={{ color: '#374151' }}>
                ✏️ Change
              </button>
            </div>

            {/* Name / role */}
            <div className="pb-1 pt-10 sm:pt-0 flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{profile.fullName}</h1>
              <p className="text-sm" style={{ color: '#6b7280' }}>@{profile.username} · {profile.email}</p>
            </div>

            {/* Role badge */}
            <div className="pb-1 flex-shrink-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${gradient} shadow`}>
                {profile.role?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Avatar preset picker */}
          {showAvatarPicker && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-2xl border border-gray-100" style={{ background: '#f9fafb' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#6b7280' }}>CHOOSE AVATAR</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_PRESETS.map(seed => (
                  <button key={seed} onClick={() => { setForm(f => ({ ...f, avatarUrl: avatarSrc(seed) })); setImgError(false); }}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 ${form.avatarUrl === avatarSrc(seed) ? 'border-blue-500 shadow-md' : 'border-transparent'}`}>
                    <img src={avatarSrc(seed)} alt={seed} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={form.avatarUrl || ''}
                  onChange={e => { setForm(f => ({ ...f, avatarUrl: e.target.value })); setImgError(false); }}
                  placeholder="Or paste any image URL..."
                  className="input text-sm py-1.5 flex-1"
                />
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-3 disabled:opacity-50">
                  {saving ? '⏳' : '✅ Save'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Info chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Phone', value: profile.phone || 'Not set', icon: '📱' },
              { label: 'Department', value: profile.department || 'Not set', icon: '🏢' },
              { label: 'Status', value: profile.active ? 'Active' : 'Inactive', icon: '✅' },
              { label: 'Member Since', value: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A', icon: '📅' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3" style={{ background: '#f9fafb' }}>
                <div className="text-xs mb-1" style={{ color: '#9ca3af' }}>{item.icon} {item.label}</div>
                <div className="text-sm font-semibold truncate">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <div className="flex gap-1" style={{ borderBottom: '1px solid #e5e7eb' }}>
        {[
          { key: 'profile', label: '👤 Profile' },
          { key: 'security', label: '🔐 Security' },
          { key: 'activity', label: '📋 Activity' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
            style={{ borderColor: tab === t.key ? '#2563eb' : 'transparent', color: tab === t.key ? '#2563eb' : '#6b7280' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-secondary">✏️ Edit</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? '⏳ Saving...' : '✅ Save Changes'}
                </button>
                <button onClick={() => { setEditing(false); setForm(profile); setShowAvatarPicker(false); }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', key: 'fullName' },
              { label: 'Username', key: 'username', disabled: true },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone', placeholder: '+1-555-0000' },
              { label: 'Department', key: 'department', placeholder: 'e.g. Operations' },
              { label: 'Avatar URL', key: 'avatarUrl', placeholder: 'https://...' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>{field.label}</label>
                {editing && !field.disabled ? (
                  <input
                    type={field.type || 'text'}
                    value={form[field.key] || ''}
                    placeholder={field.placeholder}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="input"
                  />
                ) : (
                  <div className="px-4 py-2.5 rounded-xl text-sm" style={{ background: '#f9fafb', color: field.disabled ? '#9ca3af' : 'inherit' }}>
                    {profile[field.key] || '—'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Live avatar preview while editing */}
          {editing && form.avatarUrl && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl" style={{ background: '#eff6ff' }}>
              <img src={form.avatarUrl} alt="preview" onError={e => e.target.style.display = 'none'}
                className="w-12 h-12 rounded-xl object-cover border-2 border-blue-200" />
              <p className="text-sm text-blue-700">Avatar preview — save to apply</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Security Tab ── */}
      {tab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <h2 className="text-lg font-semibold mb-2">Change Password</h2>
          <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Use a strong password with at least 6 characters.</p>
          <div className="max-w-md space-y-4">
            {[
              { label: 'Current Password', key: 'oldPassword', placeholder: 'Enter current password' },
              { label: 'New Password', key: 'newPassword', placeholder: 'Min 6 characters' },
              { label: 'Confirm New Password', key: 'confirm', placeholder: 'Repeat new password' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>{field.label}</label>
                <input type="password" value={pwForm[field.key]} placeholder={field.placeholder}
                  onChange={e => setPwForm(f => ({ ...f, [field.key]: e.target.value }))} className="input" />
              </div>
            ))}
            {pwForm.newPassword && pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
              <p className="text-xs text-red-500">⚠️ Passwords do not match</p>
            )}
            <button onClick={handlePasswordChange}
              disabled={saving || !pwForm.oldPassword || !pwForm.newPassword || pwForm.newPassword !== pwForm.confirm}
              className="btn-primary disabled:opacity-50">
              {saving ? '⏳ Changing...' : '🔐 Change Password'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Activity Tab ── */}
      {tab === 'activity' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {[
              { action: 'Logged in successfully', time: '2 hours ago', icon: '🔐', color: '#dcfce7' },
              { action: 'Updated production plan', time: '5 hours ago', icon: '📋', color: '#dbeafe' },
              { action: 'Viewed inventory report', time: '1 day ago', icon: '📊', color: '#fef9c3' },
              { action: 'Updated machine status', time: '2 days ago', icon: '⚙️', color: '#ffedd5' },
              { action: 'Changed password', time: '1 week ago', icon: '🔑', color: '#f3e8ff' },
              { action: 'Profile information updated', time: '2 weeks ago', icon: '👤', color: '#dbeafe' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f9fafb' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: item.color }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
