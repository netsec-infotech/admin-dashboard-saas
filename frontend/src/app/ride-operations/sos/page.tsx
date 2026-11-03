'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

export default function SosQueuePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const q = filter === 'all' ? '' : `?status=${filter}`;
      const res = await api.get(`/sos${q}`);
      setRows(res.data || []);
      setErr('');
    } catch (e: any) {
      setErr(e.message || 'Failed to load SOS queue');
    }
  };

  useEffect(() => { load(); }, [filter]);

  const act = async (id: number, kind: 'acknowledge' | 'resolve') => {
    try {
      const notes = kind === 'resolve' ? window.prompt('Resolution notes') || 'Resolved by ops' : undefined;
      await api.post(`/sos/${id}/${kind}`, notes ? { notes } : {});
      setMsg(`${kind} recorded for SOS #${id}`);
      await load();
    } catch (e: any) {
      setErr(e.message || 'Action failed');
    }
  };

  const open = rows.filter((r) => r.status === 'open').length;

  return (
    <OpsPageShell
      title="Emergency SOS Queue"
      subtitle="High-priority rider SOS events with location freshness and direct dial."
      actions={
        <div className="ops-row">
          <select className="ops-select" style={{ width: 160 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="ops-btn secondary" onClick={load}>Refresh</button>
        </div>
      }
    >
      <div className="ops-stats">
        <div className="ops-stat"><div className="ops-stat-lbl">Open SOS</div><div className="ops-stat-val">{open}</div></div>
        <div className="ops-stat"><div className="ops-stat-lbl">In queue</div><div className="ops-stat-val">{rows.length}</div></div>
      </div>
      {msg ? <div className="ops-card" style={{ marginBottom: 12, background: '#ECFDF5' }}>{msg}</div> : null}
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}
      <div className="ops-card">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Rider</th><th>Ride / Vehicle</th><th>Location</th><th>Freshness</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{r.rider_name || '—'}</div>
                  <div className="ops-muted">{r.rider_mobile}</div>
                </td>
                <td>{r.ride_id || '—'}<br /><span className="ops-muted">{r.vehicle_code}</span></td>
                <td>{r.lat != null ? `${Number(r.lat).toFixed(4)}, ${Number(r.lng).toFixed(4)}` : '—'}</td>
                <td>
                  <span className={`ops-badge ${r.location_fresh ? 'ok' : 'warn'}`}>
                    {r.location_fresh ? 'Fresh' : 'Stale'} · {r.location_age_seconds}s
                  </span>
                </td>
                <td><span className={`ops-badge ${r.status === 'open' ? 'bad' : r.status === 'resolved' ? 'ok' : 'info'}`}>{r.status}</span></td>
                <td>
                  <div className="ops-row">
                    {r.dial_url ? <a className="ops-btn secondary" href={r.dial_url}>Dial</a> : null}
                    {r.status === 'open' ? <button className="ops-btn" onClick={() => act(r.id, 'acknowledge')}>Ack</button> : null}
                    {r.status !== 'resolved' ? <button className="ops-btn secondary" onClick={() => act(r.id, 'resolve')}>Resolve</button> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
