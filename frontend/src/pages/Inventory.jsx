import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { inventoryAPI } from '../api';
import { PageHeader, StatusBadge, LoadingSkeleton, Modal } from '../components/UI';

const emptyForm = { name: '', sku: '', category: '', currentStock: '', minStockLevel: '', maxStockLevel: '', unit: 'kg', unitCost: '', supplier: '', supplierContact: '', location: '' };

export default function Inventory() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    inventoryAPI.getAll(page, 10)
      .then(r => { setMaterials(r.data.content || []); setTotalPages(r.data.totalPages || 0); })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (m) => { setEditing(m); setForm(m); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) { await inventoryAPI.update(editing.id, form); toast.success('Material updated!'); }
      else { await inventoryAPI.create(form); toast.success('Material added!'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try { await inventoryAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = materials.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()) || m.sku?.toLowerCase().includes(search.toLowerCase()));

  const stockColor = (status) => status === 'ADEQUATE' ? 'bg-green-500' : status === 'LOW' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Management" subtitle="Track raw materials and stock levels"
        action={<button onClick={openCreate} className="btn-primary">+ Add Material</button>} />

      <div className="card p-4 flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search materials..." className="input max-w-xs" />
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-6"><LoadingSkeleton /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="table-header">Material</th>
                  <th className="table-header">SKU</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Stock Level</th>
                  <th className="table-header">Unit Cost</th>
                  <th className="table-header">Supplier</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900 dark:text-white">{m.name}</div>
                      <div className="text-xs text-gray-400">{m.location}</div>
                    </td>
                    <td className="table-cell text-gray-500 font-mono text-xs">{m.sku}</td>
                    <td className="table-cell">
                      <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">{m.category}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stockColor(m.stockStatus)}`}></div>
                        <span className="font-semibold">{m.currentStock}</span>
                        <span className="text-gray-400 text-xs">/ {m.minStockLevel} min {m.unit}</span>
                      </div>
                    </td>
                    <td className="table-cell">${m.unitCost}/{m.unit}</td>
                    <td className="table-cell text-gray-500 text-xs">{m.supplier}</td>
                    <td className="table-cell"><StatusBadge status={m.stockStatus} /></td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(m)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                        <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No materials found</div>}
          </div>
        )}
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

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Material' : 'Add Material'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
              <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="input" placeholder="MAT-001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="input">
                {['kg', 'liters', 'pieces', 'meters', 'sheets', 'boxes'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Stock</label>
              <input type="number" value={form.currentStock} onChange={e => setForm(f => ({ ...f, currentStock: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Level</label>
              <input type="number" value={form.minStockLevel} onChange={e => setForm(f => ({ ...f, minStockLevel: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Cost ($)</label>
              <input type="number" step="0.01" value={form.unitCost} onChange={e => setForm(f => ({ ...f, unitCost: e.target.value }))} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier</label>
              <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input" placeholder="Warehouse A-1" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? '⏳ Saving...' : editing ? '✅ Update' : '✅ Add Material'}
            </button>
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
