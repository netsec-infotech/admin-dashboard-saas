'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

export default function AuditLogsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (moduleFilter !== 'All Modules') params.set('module', moduleFilter);
      params.set('limit', '100');
      const res = await api.get(`/audit-logs?${params.toString()}`);
      setRows(res.data || []);
      setErr('');
    } catch (e: any) {
      setErr(e.message || 'Failed to load audit logs');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <OpsPageShell
      title="Audit History"
      subtitle="Searchable records for remote commands, KYC decisions, refunds, pricing, and settlement changes."
      actions={
        <div className="ops-row">
          <input className="ops-input" style={{ width: 220 }} placeholder="Search actor / details" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="ops-select" style={{ width: 180 }} value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
            {['All Modules', 'Fleet', 'KYC', 'Payments', 'Finance', 'Franchise', 'RideSafety', 'Messaging', 'DataOps', 'WhiteLabel'].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <button className="ops-btn secondary" onClick={load}>Search</button>
        </div>
      }
    >
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}
      <div className="ops-card">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Time</th><th>Actor</th><th>Action</th><th>Module</th><th>Entity</th><th>Outcome</th><th>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                <td>{r.performed_by || r.user_name || '—'}</td>
                <td style={{ fontWeight: 700 }}>{r.action}</td>
                <td>{r.module}</td>
                <td>{r.entity_type ? `${r.entity_type}:${r.entity_id}` : '—'}</td>
                <td><span className={`ops-badge ${r.outcome === 'success' || !r.outcome ? 'ok' : r.outcome === 'failure' ? 'bad' : 'info'}`}>{r.outcome || 'recorded'}</span></td>
                <td style={{ maxWidth: 280 }}><div className="ops-muted" style={{ whiteSpace: 'pre-wrap' }}>{typeof r.details === 'string' ? r.details : JSON.stringify(r.details)}</div></td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={7} className="ops-muted">No audit records match the current filters.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
