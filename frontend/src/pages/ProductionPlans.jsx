import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { productionAPI } from '../api';
import { PageHeader, StatusBadge, LoadingSkeleton, Modal, ProgressBar } from '../components/UI';

const STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'];
const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

const emptyForm = { title: '', description: '', productName: '', targetQuantity: '', completedQuantity: 0, status: 'PLANNED', priority: 'MEDIUM', startDate: '', endDate: '' };

export default function ProductionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    productionAPI.getAll(page, 10, filter)
      .then(r => { setPlans(r.data.content || []); setTotalPages(r.data.totalPages || 0); })
      .finally(() => setLoading(false));
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (plan) => { setEditing(plan); setForm({ ...plan, startDate: plan.startDate || '', endDate: plan.endDate || '' }); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) { await productionAPI.update(editing.id, form); toast.success('Plan updated!'); }
      else { await productionAPI.create(form); toast.success('Plan created!'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try { await productionAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = plans.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.productName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Production Plans" subtitle="Manage and track all production plans"
        action={<button onClick={openCreate} className="btn-primary">+ New Plan</button>} />

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search plans..." className="input max-w-xs" />
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(0); }} className="input max-w-[160px]">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <div className="p-6"><LoadingSkeleton /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="table-header">Plan</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Progress</th>
                  <th className="table-header">Priority</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Dates</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((plan, i) => (
                  <motion.tr key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900 dark:text-white">{plan.title}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{plan.description}</div>
                    </td>
                    <td className="table-cell text-gray-500">{plan.productName}</td>
                    <td className="table-cell w-40">
                      <ProgressBar value={plan.completedQuantity || 0} max={plan.targetQuantity || 1}
                        color={plan.status === 'DELAYED' ? 'bg-red-500' : plan.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'} />
                    </td>
                    <td className="table-cell"><StatusBadge status={plan.priority} /></td>
                    <td className="table-cell"><StatusBadge status={plan.status} /></td>
                    <td className="table-cell text-xs text-gray-500">
                      <div>{plan.startDate}</div>
                      <div>→ {plan.endDate}</div>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(plan)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                        <button onClick={() => handleDelete(plan.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No plans found</div>}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-dark-700 flex items-center justify-between">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Plan' : 'Create Production Plan'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="e.g. Automotive Frame Batch Q1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
              <input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Qty</label>
              <input type="number" value={form.targetQuantity} onChange={e => setForm(f => ({ ...f, targetQuantity: e.target.value }))} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input" rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.title} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? '⏳ Saving...' : editing ? '✅ Update Plan' : '✅ Create Plan'}
            </button>
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
