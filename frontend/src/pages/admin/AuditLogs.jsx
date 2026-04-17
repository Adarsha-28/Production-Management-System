import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../api';
import { PageHeader, LoadingSkeleton } from '../../components/UI';

const actionColors = { LOGIN: 'bg-green-100 text-green-800', CREATE: 'bg-blue-100 text-blue-800', UPDATE: 'bg-yellow-100 text-yellow-800', DELETE: 'bg-red-100 text-red-800', LOGOUT: 'bg-gray-100 text-gray-700' };

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getLogs(page, 20).then(r => { setLogs(r.data.content || []); setTotalPages(r.data.totalPages || 0); }).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter(l => l.username?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="Complete system activity trail" />

      <div className="card p-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by user or action..." className="input max-w-xs" />
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-6"><LoadingSkeleton /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="table-header">Timestamp</th>
                  <th className="table-header">User</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Resource</th>
                  <th className="table-header">Details</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="table-row">
                    <td className="table-cell text-xs text-gray-500 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                    </td>
                    <td className="table-cell">
                      <span className="font-medium text-gray-900 dark:text-white">{log.username}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>{log.action}</span>
                    </td>
                    <td className="table-cell text-gray-500">{log.resource}</td>
                    <td className="table-cell text-gray-500 max-w-xs truncate">{log.details}</td>
                    <td className="table-cell">
                      <span className={`badge ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{log.status}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No logs found</div>}
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
    </div>
  );
}
