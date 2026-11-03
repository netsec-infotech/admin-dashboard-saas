'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

export default function VehicleDocumentsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState('30');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const res = await api.get(`/fleet-documents/expiry?filter=${filter}&within_days=${filter === 'expired' ? 3650 : filter}`);
      setRows(res.data || []);
    } catch (e: any) {
      setErr(e.message || 'Failed to load document expiry');
    }
  };

  useEffect(() => { load(); }, [filter]);

  const stateClass = (s: string) => {
    if (s === 'expired') return 'bad';
    if (String(s).startsWith('due_soon')) return 'warn';
    if (s === 'valid') return 'ok';
    return 'muted';
  };

  return (
    <OpsPageShell
      title="Vehicle Document Expiry"
      subtitle="Insurance, fitness, and road tax with 7 / 15 / 30 day filters."
      actions={
        <div className="ops-row">
          {['7', '15', '30', 'expired', 'all'].map((f) => (
            <button key={f} className={`ops-btn ${filter === f ? '' : 'secondary'}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'expired' ? 'Expired' : `${f} days`}
            </button>
          ))}
        </div>
      }
    >
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}
      <div className="ops-card">
        <table className="ops-table">
          <thead><tr><th>Vehicle</th><th>Model</th><th>Zone</th><th>Document</th><th>Expiry</th><th>Days</th><th>State</th></tr></thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={`${r.vehicle_code}-${r.document_type}-${idx}`}>
                <td style={{ fontWeight: 700 }}>{r.vehicle_code}</td>
                <td>{r.model || '—'}</td>
                <td>{r.zone || '—'}</td>
                <td>{r.document_type}</td>
                <td>{r.expiry_date || '—'}</td>
                <td>{r.days_remaining ?? '—'}</td>
                <td><span className={`ops-badge ${stateClass(r.state)}`}>{r.state}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
