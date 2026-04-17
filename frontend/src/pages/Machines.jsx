import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { machineAPI } from '../api';
import { PageHeader, StatusBadge, LoadingSkeleton, Modal } from '../components/UI';

const STATUSES = ['ACTIVE', 'IDLE', 'MAINTENANCE', 'OFFLINE'];
const emptyForm = { name: '', machineCode: '', type: '', location: '', status: 'ACTIVE', efficiency: '', operatorName: '', notes: '' };

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    machineAPI.getAll().then(r => setMachines(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (m) => { setEditing(m); setForm(m); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) { await machineAPI.update(editing.id, form); toast.success('Machine updated!'); }
      else { await machineAPI.create(form); toast.success('Machine added!'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this machine?')) return;
    try { await machineAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = machines.filter(m =>
    (m.name?.toLowerCase().includes(search.toLowerCase()) || m.machineCode?.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || m.status === statusFilter)
  );

  const statusDot = { ACTIVE: 'bg-green-500', IDLE: 'bg-yellow-500', MAINTENANCE: 'bg-orange-500', OFFLINE: 'bg-red-500' };
  const icons = { ACTIVE: '✅', IDLE: '⏸️', MAINTENANCE: '🔧', OFFLINE: '❌' };

  return (
    <div className="space-y-6">
      <PageHeader title="Machine Monitoring" subtitle="Real-time machine status and workflow"
        action={<button onClick={openCreate} className="btn-primary">+ Add Machine</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUSES.map(s => (
          <div key={s} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: '#6b7280' }}>{s}</p>
                <p className="text-2xl font-bold mt-1">{machines.filter(m => m.status === s).length}</p>
              </div>
              <span className="text-2xl">{icons[s]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search machines..." className="input max-w-xs" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input max-w-[160px]">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <div className="card p-6"><LoadingSkeleton /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card p-5 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusDot[m.status]} ${m.status === 'ACTIVE' ? 'animate-pulse' : ''}`}></div>
                  <div>
                    <h3 className="font-semibold text-sm">{m.name}</h3>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{m.machineCode} • {m.type}</p>
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>

              <div className="space-y-2 text-xs" style={{ color: '#6b7280' }}>
                <div className="flex justify-between"><span>📍 Location</span><span className="font-medium">{m.location}</span></div>
                <div className="flex justify-between"><span>👤 Operator</span><span className="font-medium">{m.operatorName || 'Unassigned'}</span></div>
                {m.efficiency > 0 && (
                  <div>
                    <div className="flex justify-between mb-1"><span>⚡ Efficiency</span><span className="font-semibold">{m.efficiency}%</span></div>
                    <div className="h-1.5 rounded-full" style={{ background: '#f3f4f6' }}>
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.efficiency}%` }}></div>
                    </div>
                  </div>
                )}
                {m.totalDowntimeMinutes > 0 && <div className="flex justify-between"><span>⏱️ Downtime</span><span className="text-orange-600 font-medium">{m.totalDowntimeMinutes} min</span></div>}
                {m.nextMaintenance && <div className="flex justify-between"><span>🔧 Next Maint.</span><span className="font-medium">{new Date(m.nextMaintenance).toLocaleDateString()}</span></div>}
              </div>

              {m.notes && <p className="mt-3 text-xs text-orange-600 rounded-lg p-2" style={{ background: '#fff7ed' }}>{m.notes}</p>}

              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(m)} className="btn-secondary text-xs flex-1">Edit</button>
                <button onClick={() => handleDelete(m.id)} className="btn-danger text-xs flex-1">Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Machine' : 'Add Machine'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Machine Code</label>
              <input value={form.machineCode} onChange={e => setForm(f => ({ ...f, machineCode: e.target.value }))} className="input" placeholder="CNC-001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input" placeholder="CNC, Press, Welding..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input" placeholder="Floor A" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Efficiency (%)</label>
              <input type="number" min="0" max="100" value={form.efficiency} onChange={e => setForm(f => ({ ...f, efficiency: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Operator Name</label>
            <input value={form.operatorName} onChange={e => setForm(f => ({ ...f, operatorName: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? '⏳ Saving...' : editing ? '✅ Update' : '✅ Add Machine'}
            </button>
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
