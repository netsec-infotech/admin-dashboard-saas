'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

export default function BatteryHealthPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [thresholds, setThresholds] = useState({ cycle_count: 800, soh_percent: 75 });
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/swap-stations/health/flags?cycle_threshold=800&soh_threshold=75');
      setRows(res.data || []);
      if (res.thresholds) setThresholds(res.thresholds);
    } catch (e: any) {
      setErr(e.message || 'Failed to load health flags');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <OpsPageShell
      title="Battery Health & Retirement"
      subtitle={`Flagged when cycle count exceeds ${thresholds.cycle_count} or SoH falls below ${thresholds.soh_percent}%.`}
      actions={<button className="ops-btn secondary" onClick={load}>Refresh flags</button>}
    >
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}
      <div className="ops-stats">
        <div className="ops-stat"><div className="ops-stat-lbl">Flagged batteries</div><div className="ops-stat-val">{rows.length}</div></div>
        <div className="ops-stat"><div className="ops-stat-lbl">Cycle threshold</div><div className="ops-stat-val">{thresholds.cycle_count}</div></div>
        <div className="ops-stat"><div className="ops-stat-lbl">SoH threshold</div><div className="ops-stat-val">{thresholds.soh_percent}%</div></div>
      </div>
      <div className="ops-card">
        <table className="ops-table">
          <thead><tr><th>Battery</th><th>Zone</th><th>Cycles</th><th>SoH</th><th>Temp</th><th>Triggers</th><th>Flag</th></tr></thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.battery_id}>
                <td style={{ fontWeight: 700 }}>{b.battery_id}</td>
                <td>{b.zone || '—'}</td>
                <td>{b.cycles}</td>
                <td>{b.soh ?? b.health}%</td>
                <td>{b.temp ?? '—'}°C</td>
                <td>
                  {(b.triggers || []).map((t: any) => (
                    <span key={t.measure} className="ops-badge warn" style={{ marginRight: 4 }}>
                      {t.measure}: {t.value} (lim {t.threshold})
                    </span>
                  ))}
                </td>
                <td><span className="ops-badge bad">{b.message || 'Review'}</span></td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={7} className="ops-muted">No batteries currently flagged.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
