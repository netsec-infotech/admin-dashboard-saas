'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

const STATE_STYLE: Record<string, string> = {
  ready: 'ok',
  charging: 'info',
  faulty: 'bad',
  over_temperature: 'bad',
  empty: 'muted',
  unlocked: 'warn',
};

export default function SwapStationsPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [err, setErr] = useState('');

  const loadStations = async () => {
    try {
      const res = await api.get('/swap-stations');
      setStations(res.data || []);
      if (res.data?.length && !active) openStation(res.data[0].id);
    } catch (e: any) {
      setErr(e.message || 'Failed to load stations');
    }
  };

  const openStation = async (id: number) => {
    try {
      const res = await api.get(`/swap-stations/${id}/slots`);
      setActive(res.data.station);
      setSlots(res.data.slots || []);
      setErr('');
    } catch (e: any) {
      setErr(e.message || 'Failed to load slots');
    }
  };

  useEffect(() => { loadStations(); }, []);

  return (
    <OpsPageShell
      title="Swap-station Slot Grid"
      subtitle="Interactive 8 / 12 / 16 slot cabinets with ready, charging, faulty, and empty states."
    >
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}
      <div className="ops-row" style={{ marginBottom: 14 }}>
        {stations.map((s) => (
          <button key={s.id} className={`ops-btn ${active?.id === s.id ? '' : 'secondary'}`} onClick={() => openStation(s.id)}>
            {s.name} ({s.slot_count})
          </button>
        ))}
      </div>

      {active ? (
        <div className="ops-card">
          <div className="ops-row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 800 }}>{active.name}</div>
              <div className="ops-muted">{active.zone} · {active.slot_count} slots · Updated {new Date(active.last_update || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
            </div>
            <div className="ops-row">
              {Object.keys(STATE_STYLE).map((k) => (
                <span key={k} className={`ops-badge ${STATE_STYLE[k]}`}>{k.replace('_', ' ')}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(active.slot_count, 8)}, minmax(0,1fr))`, gap: 10 }}>
            {slots.map((slot) => (
              <div key={slot.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 10, background: slot.is_fault ? '#FEF2F2' : '#fff' }}>
                <div style={{ fontWeight: 800 }}>Slot {slot.slot_number}</div>
                <span className={`ops-badge ${STATE_STYLE[slot.state] || 'muted'}`}>{slot.state_label || slot.state}</span>
                <div className="ops-muted" style={{ marginTop: 6 }}>{slot.battery_id || 'No battery'}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>SoC {slot.soc}% · {slot.temperature}°C</div>
                {slot.state === 'charging' ? <div className="ops-muted">ETA full {slot.eta_full_minutes} min</div> : null}
                <div className="ops-muted">Updated {new Date(slot.last_update).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </OpsPageShell>
  );
}
