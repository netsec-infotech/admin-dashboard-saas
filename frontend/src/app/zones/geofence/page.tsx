'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

const sampleBoundary = [
  { lat: 22.31, lng: 73.16 },
  { lat: 22.32, lng: 73.16 },
  { lat: 22.32, lng: 73.18 },
  { lat: 22.31, lng: 73.18 },
];

const overlappingBoundary = [
  { lat: 22.315, lng: 73.165 },
  { lat: 22.325, lng: 73.165 },
  { lat: 22.325, lng: 73.185 },
  { lat: 22.315, lng: 73.185 },
];

const invalidBoundary = [
  { lat: 22.31, lng: 73.16 },
  { lat: 22.32, lng: 73.18 },
  { lat: 22.32, lng: 73.16 },
  { lat: 22.31, lng: 73.18 }, // self-crossing bowtie
];

export default function GeofenceToolsPage() {
  const [validation, setValidation] = useState<any | null>(null);
  const [breaches, setBreaches] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const validate = async (boundary: any[], label: string) => {
    setErr('');
    try {
      const res = await api.post('/zones/geometry/validate', {
        boundary,
        no_parking: [[{ lat: 22.312, lng: 73.17 }, { lat: 22.313, lng: 73.17 }, { lat: 22.313, lng: 73.171 }]],
      });
      setValidation({ label, ...res.data });
      setMsg(res.data?.explanation || '');
    } catch (e: any) {
      setErr(e.message || 'Validation failed');
    }
  };

  const loadBreaches = async () => {
    try {
      const res = await api.get('/zones/breaches');
      setBreaches(res.data || []);
    } catch (e: any) {
      setErr(e.message || 'Breach scan failed');
    }
  };

  useEffect(() => { loadBreaches(); }, []);

  return (
    <OpsPageShell
      title="Geofence & No-parking Editor"
      subtitle="Validate polygons, explain invalid/overlapping geometry, and detect vehicles that cross assigned boundaries."
      actions={<a className="ops-btn secondary" href="/zones/new">Open draw editor</a>}
    >
      {msg ? <div className="ops-card" style={{ marginBottom: 12, background: validation?.valid ? '#ECFDF5' : '#FFFBEB' }}>{msg}</div> : null}
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}

      <div className="ops-row" style={{ marginBottom: 16 }}>
        <button className="ops-btn" onClick={() => validate(sampleBoundary, 'Valid sample')}>Validate sample boundary</button>
        <button className="ops-btn secondary" onClick={() => validate(invalidBoundary, 'Self-intersecting')}>Validate invalid geometry</button>
        <button className="ops-btn secondary" onClick={() => validate(overlappingBoundary, 'Overlap check')}>Check overlap</button>
        <button className="ops-btn secondary" onClick={loadBreaches}>Scan boundary crossings</button>
      </div>

      {validation ? (
        <div className="ops-card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800 }}>{validation.label}</div>
          <p><span className={`ops-badge ${validation.valid ? 'ok' : 'bad'}`}>{validation.valid ? 'Valid' : 'Invalid / needs fixes'}</span></p>
          <ul>
            {(validation.issues || []).map((i: any, idx: number) => (
              <li key={idx} className="ops-muted">{i.code}: {i.message}</li>
            ))}
            {!validation.issues?.length ? <li className="ops-muted">No geometry issues.</li> : null}
          </ul>
        </div>
      ) : null}

      <div className="ops-card">
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Vehicles outside assigned boundary ({breaches.length})</div>
        <table className="ops-table">
          <thead><tr><th>Vehicle</th><th>Assigned zone</th><th>Location</th><th>Alert</th></tr></thead>
          <tbody>
            {breaches.slice(0, 50).map((b) => (
              <tr key={`${b.vehicle_code}-${b.zone_id}`}>
                <td style={{ fontWeight: 700 }}>{b.vehicle_code}</td>
                <td>{b.assigned_zone}</td>
                <td>{Number(b.lat).toFixed(4)}, {Number(b.lng).toFixed(4)}</td>
                <td><span className="ops-badge warn">{b.alert}</span></td>
              </tr>
            ))}
            {!breaches.length ? <tr><td colSpan={4} className="ops-muted">No crossings detected for assigned zones with valid polygons.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
