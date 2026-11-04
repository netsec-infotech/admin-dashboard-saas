'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

export default function SettlementsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({
    franchise_name: 'Vadodara Central',
    period_start: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    period_end: new Date().toISOString().slice(0, 10),
    commission_rate: 15,
    adjustments: 0,
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const load = async () => {
    try {
      const res = await api.get('/franchise-settlements');
      setRows(res.data || []);
    } catch (e: any) {
      setErr(e.message || 'Failed to load settlements');
    }
  };

  useEffect(() => { load(); }, []);

  const calculate = async () => {
    try {
      const res = await api.post('/franchise-settlements/calculate', form);
      setMsg('Settlement calculated — review source transactions before approval.');
      setSelected(res.data);
      await load();
    } catch (e: any) {
      setErr(e.message || 'Calculate failed');
    }
  };

  const setStatus = async (id: number, status: string) => {
    try {
      await api.post(`/franchise-settlements/${id}/status`, { status });
      setMsg(`Settlement #${id} marked ${status}`);
      await load();
    } catch (e: any) {
      setErr(e.message || 'Status update failed');
    }
  };

  return (
    <OpsPageShell
      title="Franchise Settlement"
      subtitle="Commission split with traceability to underlying rides and payments."
      actions={<button className="ops-btn" onClick={calculate}>Calculate period</button>}
    >
      {msg ? <div className="ops-card" style={{ marginBottom: 12, background: '#ECFDF5' }}>{msg}</div> : null}
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}

      <div className="ops-card" style={{ marginBottom: 16 }}>
        <div className="ops-row">
          <div style={{ flex: 1 }}><label className="ops-muted">Franchise</label><input className="ops-input" value={form.franchise_name} onChange={(e) => setForm({ ...form, franchise_name: e.target.value })} /></div>
          <div><label className="ops-muted">Start</label><input className="ops-input" type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} /></div>
          <div><label className="ops-muted">End</label><input className="ops-input" type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} /></div>
          <div style={{ width: 120 }}><label className="ops-muted">Commission %</label><input className="ops-input" type="number" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })} /></div>
          <div style={{ width: 120 }}><label className="ops-muted">Adjustments</label><input className="ops-input" type="number" value={form.adjustments} onChange={(e) => setForm({ ...form, adjustments: Number(e.target.value) })} /></div>
        </div>
      </div>

      <div className="ops-grid" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
        <div className="ops-card">
          <table className="ops-table">
            <thead><tr><th>ID</th><th>Franchise</th><th>Period</th><th>Gross</th><th>Commission</th><th>Net</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.franchise_name}</td>
                  <td>{r.period_start} → {r.period_end}</td>
                  <td>₹{Number(r.gross_revenue).toFixed(2)}</td>
                  <td>₹{Number(r.commission_amount).toFixed(2)} ({r.commission_rate}%)</td>
                  <td>₹{Number(r.net_payout).toFixed(2)}</td>
                  <td><span className="ops-badge info">{r.status}</span></td>
                  <td>
                    <div className="ops-row">
                      <button className="ops-btn secondary" onClick={() => setSelected(r)}>Trace</button>
                      {r.status === 'calculated' ? <button className="ops-btn" onClick={() => setStatus(r.id, 'approved')}>Approve</button> : null}
                      {r.status === 'approved' ? <button className="ops-btn" onClick={() => setStatus(r.id, 'paid')}>Mark paid</button> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ops-card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Source traceability</div>
          {!selected ? <p className="ops-muted">Select a settlement to inspect source transaction IDs and adjustments.</p> : (
            <>
              <p><strong>#{selected.id}</strong> · {selected.franchise_name}</p>
              <p className="ops-muted">Adjustments: ₹{Number(selected.adjustments || 0).toFixed(2)}</p>
              <div style={{ maxHeight: 320, overflow: 'auto', marginTop: 10 }}>
                {(selected.source_txn_ids || []).slice(0, 50).map((t: string) => (
                  <div key={t} className="ops-muted" style={{ padding: '4px 0', borderBottom: '1px solid #F3F4F6' }}>{t}</div>
                ))}
                {!selected.source_txn_ids?.length ? <p className="ops-muted">No source IDs attached.</p> : null}
              </div>
            </>
          )}
        </div>
      </div>
    </OpsPageShell>
  );
}
