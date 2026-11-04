'use client';
import { useEffect, useMemo, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

const REJECT_REASONS = [
  'Blurry or unreadable document',
  'Name mismatch with profile',
  'Expired driving licence',
  'Aadhaar face mismatch',
  'Incomplete submission',
];

export default function KycReviewPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [docSide, setDocSide] = useState<'aadhaar_front' | 'aadhaar_back' | 'dl'>('aadhaar_front');
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/renters/kyc/queue?status=Under Review');
      const rows = res.data || [];
      setQueue(rows);
      if (!selected && rows.length) setSelected(rows[0]);
    } catch (e: any) {
      setError(e.message || 'Failed to load KYC queue');
    }
  };

  useEffect(() => { load(); }, []);

  const docUrl = useMemo(() => {
    if (!selected) return '';
    return selected.avatar_url || selected.aadhaar_front || '/logo.png';
  }, [selected, docSide]);

  const decide = async (decision: 'approve' | 'reject') => {
    if (!selected?.mobile) return;
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/renters/kyc/review', {
        mobile: selected.mobile,
        decision,
        reason: decision === 'reject' ? reason : undefined,
        reviewer: 'ops-reviewer',
      });
      setToast(res.message || `KYC ${decision}d`);
      await load();
      setSelected(null);
      setZoom(1);
      setRotation(0);
    } catch (e: any) {
      setError(e.message || 'Decision failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <OpsPageShell
      title="KYC Document Review"
      subtitle="Full-screen Aadhaar and driving-licence review with one-action approve or reject."
      actions={<button className="ops-btn secondary" onClick={load}>Refresh queue</button>}
    >
      {toast ? <div className="ops-card" style={{ marginBottom: 12, borderColor: '#A7F3D0', background: '#ECFDF5' }}>{toast}</div> : null}
      {error ? <div className="ops-card" style={{ marginBottom: 12, borderColor: '#FECACA', background: '#FEF2F2' }}>{error}</div> : null}

      <div className="ops-grid" style={{ gridTemplateColumns: '280px 1fr', alignItems: 'start' }}>
        <div className="ops-card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Review queue ({queue.length})</div>
          {queue.length === 0 ? <p className="ops-muted">No submissions awaiting review.</p> : null}
          {queue.map((r) => (
            <button
              key={r.id || r.mobile}
              onClick={() => { setSelected(r); setZoom(1); setRotation(0); setToast(''); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', marginBottom: 8,
                padding: '10px 12px', borderRadius: 10, border: selected?.mobile === r.mobile ? '1.5px solid #2A195C' : '1px solid #E5E7EB',
                background: selected?.mobile === r.mobile ? '#F5F3FF' : '#fff', cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 700 }}>{r.rider_name || 'Rider'}</div>
              <div className="ops-muted">{r.mobile}</div>
              <span className="ops-badge warn">{r.kyc_status || 'Under Review'}</span>
            </button>
          ))}
        </div>

        <div className="ops-card" style={{ minHeight: 560 }}>
          {!selected ? (
            <p className="ops-muted">Select a rider to open the full-screen document viewer.</p>
          ) : (
            <>
              <div className="ops-row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{selected.rider_name || 'Rider'}</div>
                  <div className="ops-muted">Mobile {selected.mobile} · Document {docSide.replace('_', ' ')} · Status {selected.kyc_status}</div>
                </div>
                <div className="ops-row">
                  {(['aadhaar_front', 'aadhaar_back', 'dl'] as const).map((s) => (
                    <button key={s} className={`ops-btn ${docSide === s ? '' : 'secondary'}`} onClick={() => setDocSide(s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div style={{ background: '#0F172A', borderRadius: 12, minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={docUrl}
                  alt={`${docSide} preview`}
                  style={{ maxWidth: '90%', maxHeight: 340, transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: 'transform .2s' }}
                />
              </div>

              <div className="ops-row" style={{ marginBottom: 14 }}>
                <button className="ops-btn secondary" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>Zoom +</button>
                <button className="ops-btn secondary" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>Zoom −</button>
                <button className="ops-btn secondary" onClick={() => setRotation((r) => r + 90)}>Rotate</button>
                <button className="ops-btn secondary" onClick={() => { setZoom(1); setRotation(0); }}>Reset</button>
              </div>

              <div className="ops-row" style={{ alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <label className="ops-muted">Rejection reason</label>
                  <select className="ops-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                    {REJECT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button className="ops-btn" disabled={busy} onClick={() => decide('approve')}>Approve</button>
                <button className="ops-btn danger" disabled={busy} onClick={() => decide('reject')}>Reject</button>
              </div>
            </>
          )}
        </div>
      </div>
    </OpsPageShell>
  );
}
