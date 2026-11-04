'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

function Rider360Inner() {
  const params = useSearchParams();
  const [riderKey, setRiderKey] = useState(params.get('id') || params.get('mobile') || '');
  const [data, setData] = useState<any | null>(null);
  const [reason, setReason] = useState('non_payment');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async (key = riderKey) => {
    if (!key) return;
    setErr('');
    try {
      const res = await api.get(`/renters/${encodeURIComponent(key)}/360`);
      setData(res.data);
      setRiderKey(String(res.data?.rider?.id || res.data?.rider?.mobile || key));
    } catch (e: any) {
      setErr(e.message || 'Failed to load rider 360');
    }
  };

  useEffect(() => {
    (async () => {
      if (riderKey) return load(riderKey);
      try {
        const list = await api.get('/renters?limit=1');
        const first = (list.data || list.riders || [])[0];
        if (first?.id || first?.mobile) {
          const key = String(first.id || first.mobile);
          setRiderKey(key);
          await load(key);
        }
      } catch (e: any) {
        setErr(e.message || 'No riders available');
      }
    })();
  }, []);

  const applyRestriction = async (action: 'restrict' | 'clear') => {
    if (!data?.rider?.id && !riderKey) return;
    try {
      const id = data?.rider?.id || riderKey;
      const res = await api.post(`/renters/${id}/restrictions`, {
        action,
        reason_tag: reason,
        notes,
      });
      setMsg(action === 'clear' ? 'Restriction cleared' : `Restricted: ${res.data?.restriction_reason}`);
      await load(String(id));
    } catch (e: any) {
      setErr(e.message || 'Restriction update failed');
    }
  };

  const rider = data?.rider;

  return (
    <OpsPageShell
      title="Rider 360 Profile"
      subtitle="Current ride, wallet/deposit ledger, lifetime rides, penalties, documents, and restriction controls."
      actions={
        <div className="ops-row">
          <input className="ops-input" style={{ width: 180 }} placeholder="Rider id / mobile" value={riderKey} onChange={(e) => setRiderKey(e.target.value)} />
          <button className="ops-btn secondary" onClick={() => load()}>Load</button>
        </div>
      }
    >
      {msg ? <div className="ops-card" style={{ marginBottom: 12, background: '#ECFDF5' }}>{msg}</div> : null}
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}

      {!data ? <div className="ops-card ops-muted">Select a rider to open the 360 profile.</div> : (
        <div className="ops-grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
          <div className="ops-card">
            <div style={{ fontWeight: 800, fontSize: 18 }}>{rider?.rider_name || 'Rider'}</div>
            <div className="ops-muted">{rider?.mobile} · KYC {rider?.kyc_status} · Status {rider?.status}</div>
            <div className="ops-stats" style={{ marginTop: 12 }}>
              <div className="ops-stat"><div className="ops-stat-lbl">Wallet</div><div className="ops-stat-val">₹{Number(data.wallet?.balance || 0).toFixed(0)}</div></div>
              <div className="ops-stat"><div className="ops-stat-lbl">Deposit</div><div className="ops-stat-val">₹{Number(data.wallet?.deposit || rider?.deposit || 0).toFixed(0)}</div></div>
              <div className="ops-stat"><div className="ops-stat-lbl">Lifetime rides</div><div className="ops-stat-val">{data.lifetime?.ride_count || 0}</div></div>
              <div className="ops-stat"><div className="ops-stat-lbl">Distance</div><div className="ops-stat-val">{data.lifetime?.distance_km || 0} km</div></div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700 }}>Current ride</div>
              {data.current_ride ? (
                <div className="ops-muted">#{data.current_ride.id} · {data.current_ride.vehicle_number} · {data.current_ride.status}</div>
              ) : <div className="ops-muted">No active ride</div>}
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700 }}>Documents</div>
              <div className="ops-muted">KYC {data.documents?.kyc_status} · Re-upload {data.documents?.reupload_available ? 'available' : 'not required'}</div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700 }}>Wallet ledger</div>
              {(data.wallet?.ledger || []).slice(0, 5).map((t: any) => (
                <div key={t.id || t.transaction_id} className="ops-muted">{t.title || t.type} · ₹{t.amount} · {t.status}</div>
              ))}
              {!data.wallet?.ledger?.length ? <div className="ops-muted">No ledger rows</div> : null}
            </div>
          </div>

          <div className="ops-card">
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Account restriction (KYC-03)</div>
            <div className="ops-muted" style={{ marginBottom: 10 }}>
              Current: {data.restriction?.reason ? `${data.restriction.status} / ${data.restriction.reason}` : 'None'}
            </div>
            <label className="ops-muted">Reason tag</label>
            <select className="ops-select" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="non_payment">non_payment</option>
              <option value="vehicle_abandonment">vehicle_abandonment</option>
              <option value="unsafe_driving">unsafe_driving</option>
              <option value="other">other</option>
            </select>
            <label className="ops-muted" style={{ marginTop: 8, display: 'block' }}>Notes</label>
            <textarea className="ops-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="ops-row" style={{ marginTop: 12 }}>
              <button className="ops-btn danger" onClick={() => applyRestriction('restrict')}>Flag / block rider</button>
              <button className="ops-btn secondary" onClick={() => applyRestriction('clear')}>Clear restriction</button>
            </div>
            <p className="ops-muted" style={{ marginTop: 10 }}>Restricted riders are blocked from new bookings and ride extensions.</p>
          </div>
        </div>
      )}
    </OpsPageShell>
  );
}

export default function Rider360Page() {
  return (
    <Suspense fallback={<div />}>
      <Rider360Inner />
    </Suspense>
  );
}
