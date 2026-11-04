'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

export default function ReconciliationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const [d, r] = await Promise.all([
        api.get('/reconciliation/discrepancies'),
        api.get('/reconciliation/runs'),
      ]);
      setItems(d.data || []);
      setRuns(r.data || []);
    } catch (e: any) {
      setErr(e.message || 'Failed to load reconciliation');
    }
  };

  useEffect(() => { load(); }, []);

  const runNow = async () => {
    setBusy(true);
    setErr('');
    try {
      const res = await api.post('/reconciliation/run', { timezone: 'Asia/Kolkata' });
      setSummary(res.data?.summary || null);
      setMsg(`Run #${res.data?.run?.id} completed at ${res.data?.run?.run_at}`);
      await load();
    } catch (e: any) {
      setErr(e.message || 'Run failed');
    } finally {
      setBusy(false);
    }
  };

  const resolve = async (id: number) => {
    try {
      await api.post(`/reconciliation/items/${id}/resolve`, { note: 'Matched after gateway review' });
      setMsg(`Item #${id} marked reconciled`);
      await load();
    } catch (e: any) {
      setErr(e.message || 'Resolve failed');
    }
  };

  return (
    <OpsPageShell
      title="Payment Reconciliation"
      subtitle="Match gateway callbacks to transactions. States: Success, Pending, Failed, Refunded, Chargeback Dispute."
      actions={<button className="ops-btn" disabled={busy} onClick={runNow}>{busy ? 'Running…' : 'Run reconciliation'}</button>}
    >
      <div className="ops-stats">
        <div className="ops-stat"><div className="ops-stat-lbl">Matched</div><div className="ops-stat-val">{summary?.matched ?? '—'}</div></div>
        <div className="ops-stat"><div className="ops-stat-lbl">Mismatch</div><div className="ops-stat-val">{summary?.mismatch ?? items.length}</div></div>
        <div className="ops-stat"><div className="ops-stat-lbl">Pending</div><div className="ops-stat-val">{summary?.pending ?? '—'}</div></div>
        <div className="ops-stat"><div className="ops-stat-lbl">Runs</div><div className="ops-stat-val">{runs.length}</div></div>
      </div>
      {msg ? <div className="ops-card" style={{ marginBottom: 12, background: '#ECFDF5' }}>{msg}</div> : null}
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}

      <div className="ops-grid" style={{ gridTemplateColumns: '1.4fr 1fr', marginBottom: 16 }}>
        <div className="ops-card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Visible mismatches</div>
          <table className="ops-table">
            <thead><tr><th>Txn</th><th>Gateway</th><th>Internal</th><th>Provider</th><th>Age (h)</th><th>Reason</th><th></th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td>{i.transaction_id}</td>
                  <td>{i.gateway}</td>
                  <td>{i.internal_status}</td>
                  <td>{i.gateway_status}</td>
                  <td>{i.age_hours}</td>
                  <td>{i.mismatch_reason || '—'}</td>
                  <td><button className="ops-btn secondary" onClick={() => resolve(i.id)}>Resolve</button></td>
                </tr>
              ))}
              {!items.length ? <tr><td colSpan={7} className="ops-muted">No open mismatches.</td></tr> : null}
            </tbody>
          </table>
        </div>
        <div className="ops-card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Recent runs</div>
          <table className="ops-table">
            <thead><tr><th>ID</th><th>Time</th><th>Matched</th><th>Mismatch</th><th>Outcome</th></tr></thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{new Date(r.run_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                  <td>{r.matched_count}</td>
                  <td>{r.mismatch_count}</td>
                  <td><span className="ops-badge ok">{r.outcome}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ops-muted" style={{ marginTop: 10 }}>Scheduled daily reconciliation target: 02:00 Asia/Kolkata.</p>
        </div>
      </div>
    </OpsPageShell>
  );
}
