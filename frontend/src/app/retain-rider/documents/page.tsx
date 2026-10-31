'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.nr-shell{display:flex;min-height:100vh;background:#fff;font-family:Inter,sans-serif;}
.nr-main{margin-left:230px;display:flex;flex-direction:column;min-height:100vh;flex:1;min-width:0;background:#fff;}
.nr-page{flex:1;padding:20px 22px 70px; }
.nr-bc{display:flex;align-items:center;gap:7px;padding:14px 0 0;font-size:12px;color:#9CA3AF;}
.nr-bc a{color:#9CA3AF;text-decoration:none;} .nr-bc a:hover{color:#2A195C;} .nr-bc-sep{color:#D1D5DB;} .nr-bc-cur{color:#2A195C;font-weight:600;}
.nr-title-row{display:flex;align-items:flex-start;justify-content:space-between;margin:14px 0 20px;gap:16px;}
.nr-h1{font-size:24px;font-weight:800;color:#111827;line-height:1.2;margin:0;}
.nr-sub{font-size:13px;color:#6B7280;margin-top:4px;}
.nr-back-btn{display:flex;align-items:center;gap:7px;padding:10px 20px;background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13px;font-weight:600;color:#374151;cursor:pointer;white-space:nowrap;font-family:inherit;box-shadow:0 1px 3px rgba(0,0,0,.06);transition:border-color .15s;flex-shrink:0;}
.nr-back-btn:hover{border-color:#2A195C;color:#2A195C;}
.nr-stepper{display:flex;align-items:center;background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:18px 24px;margin-bottom:22px;box-shadow:0 1px 4px rgba(0,0,0,.05);}
.nr-step-wrap{display:flex;align-items:center;flex:1;}
.nr-step{display:flex;align-items:center;gap:10px;}
.nr-step-num{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;}
.nr-step-num.active{background:#2A195C;color:#fff;} .nr-step-num.done{background:#22C55E;color:#fff;} .nr-step-num.pend{background:#fff;color:#9CA3AF;border:2px solid #E5E7EB;}
.nr-step-label{font-size:13px;font-weight:600;color:#111827;white-space:nowrap;} .nr-step-label.pend{color:#9CA3AF;font-weight:500;}
.nr-step-stat{font-size:11.5px;margin-top:2px;white-space:nowrap;}
.nr-step-stat.active-s{color:#2A195C;} .nr-step-stat.done-s{color:#22C55E;} .nr-step-stat.pend-s{color:#9CA3AF;}
.nr-step-line{flex:1;height:2px;background:#E5E7EB;margin:0 14px;min-width:16px;} .nr-step-line.done-l{background:#22C55E;}
.nr-layout{display:grid;grid-template-columns:1fr 296px;gap:20px;align-items:start;}
.nr-card{background:#fff;border:1px solid #E5E7EB;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden;margin-bottom:16px;}
.nr-card-body{padding:20px 24px;}
.nr-footer-card{background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 4px rgba(0,0,0,.06);}
.nr-prev-btn{display:flex;align-items:center;gap:6px;padding:10px 18px;background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13px;font-weight:600;color:#374151;cursor:pointer;font-family:inherit;transition:border-color .15s;}
.nr-prev-btn:hover{border-color:#2A195C;color:#2A195C;}
.nr-continue-btn{display:flex;align-items:center;gap:7px;padding:11px 26px;background:#2A195C;color:#fff;border:none;border-radius:10px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s;box-shadow:0 2px 8px rgba(79,70,229,.3);}
.nr-continue-btn:hover{background:#4338CA;}
.rr-doc-row{display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-bottom:1px solid #F3F4F6;}
.rr-doc-row:last-child{border-bottom:none;}
.rr-doc-left{display:flex;align-items:center;gap:12px;}
.rr-doc-ic{width:38px;height:38px;border-radius:9px;background:#EEF2FF;display:flex;align-items:center;justify-content:center;color:#2A195C;flex-shrink:0;}
.rr-doc-name{font-size:13px;font-weight:700;color:#111827;}
.rr-doc-note{font-size:11.5px;color:#9CA3AF;margin-top:2px;}
.rr-doc-right{display:flex;align-items:center;gap:10px;}
.rr-status-badge{display:flex;align-items:center;gap:5px;border-radius:7px;font-size:11.5px;font-weight:700;padding:4px 11px;}
.rr-status-ok{background:#DCFCE7;color:#16A34A;}
.rr-view-btn{display:flex;align-items:center;gap:5px;padding:7px 12px;background:#fff;border:1.5px solid #E5E7EB;border-radius:8px;font-size:12.5px;font-weight:600;color:#374151;cursor:pointer;font-family:inherit;transition:border-color .15s;}
.rr-view-btn:hover{border-color:#2A195C;color:#2A195C;}
.rr-photo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:4px;}
.rr-photo-box{border:1.5px dashed #C7D2FE;border-radius:10px;background:#F5F3FF;height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;transition:all .15s;}
.rr-photo-box:hover{border-color:#2A195C;background:#EEF2FF;}
.rr-photo-box.uploaded{border-style:solid;border-color:#22C55E;background:#F0FDF4;}
.rr-photo-label{font-size:11.5px;color:#6B7280;font-weight:600;text-align:center;}
.rr-kyc-section{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:14px 18px;margin-bottom:18px;display:flex;align-items:flex-start;gap:12px;}
.rr-kyc-ic-wrap{width:36px;height:36px;border-radius:9px;background:#22C55E;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.rr-kyc-title{font-size:13.5px;font-weight:700;color:#166534;margin-bottom:4px;}
.rr-kyc-sub{font-size:12.5px;color:#15803D;}
.rr-kyc-meta-row{display:flex;align-items:center;gap:16px;margin-top:8px;flex-wrap:wrap;}
.rr-kyc-meta{display:flex;align-items:center;gap:5px;font-size:12px;color:#166534;font-weight:600;}
.rr-kyc-detail-badge{display:flex;align-items:center;gap:5px;padding:4px 10px;background:#DCFCE7;border-radius:6px;font-size:11.5px;font-weight:700;color:#16A34A;}
.rr-sec-hdr{font-size:14px;font-weight:700;color:#111827;margin-bottom:4px;display:flex;align-items:center;gap:8px;}
.rr-sec-sub{font-size:12px;color:#6B7280;margin-bottom:14px;}
.nr-rp{display:flex;flex-direction:column;gap:16px;position:sticky;top:80px;}
.nr-rp-card{background:#fff;border:1px solid #E5E7EB;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden;}
.nr-rp-hdr{display:flex;align-items:center;gap:9px;padding:14px 18px;border-bottom:1px solid #E5E7EB;}
.nr-rp-title{font-size:13.5px;font-weight:700;color:#111827;}
.nr-rp-body{padding:12px 18px 14px;}
.nr-rp-row{display:flex;align-items:flex-start;justify-content:space-between;padding:7px 0;border-bottom:1px solid #F9FAFB;font-size:12.5px;}
.nr-rp-row:last-child{border-bottom:none;} .nr-rp-label{color:#6B7280;} .nr-rp-val{font-weight:600;color:#111827;}
.nr-help-body{padding:14px 18px 16px;} .nr-help-sub{font-size:13px;color:#6B7280;margin-bottom:12px;}
.nr-help-btn{width:100%;padding:10px;background:#2A195C;color:#fff;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit;}
.nr-help-btn:hover{background:#4338CA;}
.nr-checklist-row{display:flex;align-items:center;gap:9px;padding:7px 18px;font-size:12.5px;color:#374151;border-bottom:1px solid #F9FAFB;}
.nr-checklist-row:last-child{border-bottom:none;}
.nr-cl-check{width:20px;height:20px;border-radius:50%;background:#DCFCE7;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#16A34A;}
`;

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 as number, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const SV = ({ s = 14, children, ...p }: { s?: number; children: React.ReactNode } & React.SVGProps<SVGSVGElement>) => (<svg width={s} height={s} viewBox="0 0 24 24" {...S} {...p}>{children}</svg>);
const ILeft = () => <SV s={13}><polyline points="15 18 9 12 15 6" /></SV>;
const ICheck = ({ s = 13 }: { s?: number }) => <SV s={s}><polyline points="20 6 9 17 4 12" /></SV>;
const IArr = ({ s = 12 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IFile = () => <SV s={14}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></SV>;
const IUser = () => <SV s={14}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></SV>;
const ICamera = () => <SV s={18} stroke="#9CA3AF"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></SV>;
const IShield = () => <SV s={14}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></SV>;
const IEye = () => <SV s={13}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></SV>;
const ICal = () => <SV s={13}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></SV>;
const ICar = () => <SV s={14}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></SV>;

const STEPS = [
  { n: 1, label: 'Rider Search', stat: 'Completed', state: 'done' },
  { n: 2, label: 'Rental Details', stat: 'Completed', state: 'done' },
  { n: 3, label: 'Payment & Charges', stat: 'Completed', state: 'done' },
  { n: 4, label: 'Documents', stat: 'In Progress', state: 'active' },
  { n: 5, label: 'Review & Confirm', stat: 'Pending', state: 'pend' },
];
const KYC_DOCS = [
  { name: 'Aadhaar Card', note: 'Front & Back side' },
  { name: 'Driving License', note: 'Valid and clear photo' },
  { name: 'PAN Card', note: 'Clearly visible' },
  { name: 'Address Proof', note: 'Utility bill or bank statement' },
  { name: 'Profile Photo', note: 'Clear face photo' },
];
const VEHICLE_PHOTOS = [
  { label: 'Front View', uploaded: true },
  { label: 'Rear View', uploaded: true },
  { label: 'Left Side View', uploaded: true },
  { label: 'Right Side View', uploaded: true },
  { label: 'Odometer View', uploaded: false },
  { label: 'Chassis Number', uploaded: false },
];
const CHECKLIST = ['Aadhaar Card', 'Driving License', 'PAN Card', 'Address Proof', 'Profile Photo', 'Vehicle Images'];

export default function RetainRiderDocumentsPage() {
  const [photos, setPhotos] = useState(VEHICLE_PHOTOS.map(p => p.uploaded));
  const [rider] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('evegah_retain_rider') || '{}');
      } catch (_) {}
    }
    return {};
  });
  const riderName = rider?.name || rider?.fullName || 'Returning Rider';
  const riderId = rider?.id || rider?.riderId || '—';
  const initials = riderName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'RR';
  const togglePhoto = (i: number) => setPhotos(p => { const a = [...p]; a[i] = !a[i]; return a; });
  const uploadedCount = photos.filter(Boolean).length;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="nr-shell">
        <Sidebar activePath="/retain-rider" />
        <div className="nr-main">
          <TopBar title="Retain Rider - Documents" subtitle="Upload or verify rider and vehicle documents" />
          <div className="nr-page">
            <div className="nr-bc">
              <Link href="/">Home</Link><span className="nr-bc-sep">›</span><a href="#">Rides / Rentals</a><span className="nr-bc-sep">›</span><span className="nr-bc-cur">Retain Ride Registration</span>
            </div>
            <div className="nr-title-row">
              <div><h1 className="nr-h1">Retain Ride Registration</h1><p className="nr-sub">Search and select an existing rider to create a new ride</p></div>
              <button className="nr-back-btn"><ILeft /> Back to Rides</button>
            </div>
            <div className="nr-stepper">
              {STEPS.map((s, i) => (
                <div key={s.n} className="nr-step-wrap">
                  <div className="nr-step">
                    <div className={`nr-step-num ${s.state}`}>{s.state === 'done' ? <ICheck s={13} /> : s.n}</div>
                    <div><div className={`nr-step-label ${s.state === 'pend' ? 'pend' : ''}`}>{s.label}</div><div className={`nr-step-stat ${s.state}-s`}>{s.stat}</div></div>
                  </div>
                  {i < STEPS.length - 1 && <div className={`nr-step-line ${s.state === 'done' ? 'done-l' : ''}`} />}
                </div>
              ))}
            </div>
            <div className="nr-layout">
              <div>
                <div className="nr-card">
                  <div className="nr-card-body">
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Documents</h2>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 18px' }}>KYC documents are already on file. Add new vehicle photos if needed.</p>
                    <div className="rr-kyc-section">
                      <div className="rr-kyc-ic-wrap"><IShield /></div>
                      <div>
                        <div className="rr-kyc-title">KYC Verified — Documents on File</div>
                        <div className="rr-kyc-sub">All KYC documents for {riderName} are verified. No re-upload required.</div>
                        <div className="rr-kyc-meta-row">
                          <div className="rr-kyc-meta"><ICal /> Verified on File</div>
                          <span className="rr-kyc-detail-badge"><ICheck s={11} /> 5 Documents Verified</span>
                        </div>
                      </div>
                    </div>
                    <div className="rr-sec-hdr"><IFile /> KYC Documents</div>
                    <div className="rr-sec-sub">Existing documents from previous registration</div>
                    <div style={{ marginBottom: 24 }}>
                      {KYC_DOCS.map(d => (
                        <div key={d.name} className="rr-doc-row">
                          <div className="rr-doc-left">
                            <div className="rr-doc-ic"><IFile /></div>
                            <div><div className="rr-doc-name">{d.name}</div><div className="rr-doc-note">{d.note}</div></div>
                          </div>
                          <div className="rr-doc-right">
                            <span className="rr-status-badge rr-status-ok"><ICheck s={11} /> Verified</span>
                            <button className="rr-view-btn"><IEye /> View</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rr-sec-hdr"><ICar /> Vehicle Photos</div>
                    <div className="rr-sec-sub">Upload current vehicle images for this ride ({uploadedCount} of 6 uploaded)</div>
                    <div className="rr-photo-grid">
                      {VEHICLE_PHOTOS.map((p, i) => (
                        <div key={p.label} className={`rr-photo-box ${photos[i] ? 'uploaded' : ''}`} onClick={() => togglePhoto(i)}>
                          {photos[i]
                            ? <><span style={{ color: '#22C55E', display: 'flex' }}><ICheck s={22} /></span><div style={{ fontSize: 11, fontWeight: 700, color: '#22C55E' }}>Uploaded</div><div className="rr-photo-label">{p.label}</div></>
                            : <><ICamera /><div className="rr-photo-label">{p.label}</div><div style={{ fontSize: 10.5, color: '#9CA3AF' }}>Tap to upload</div></>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="nr-footer-card">
                  <Link href="/retain-rider/payment" style={{ textDecoration: 'none' }}><button className="nr-prev-btn"><ILeft /> Previous</button></Link>
                  <Link href="/retain-rider/review" style={{ textDecoration: 'none' }}><button className="nr-continue-btn">Save &amp; Continue <IArr s={12} /></button></Link>
                </div>
              </div>
              <div className="nr-rp">
                <div className="nr-rp-card">
                  <div className="nr-rp-hdr"><div style={{ color: '#2A195C', display: 'flex' }}><IUser /></div><div className="nr-rp-title">Rider Info</div></div>
                  <div className="nr-rp-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #F3F4F6' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#2A195C,#2A195C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>{initials}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#111827' }}>{riderName}</div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>{riderId}</div>
                      </div>
                    </div>
                    {[{ l: 'KYC Status', v: <span style={{ background: '#DCFCE7', color: '#16A34A', borderRadius: 5, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>Verified</span> }, { l: 'Last Ride', v: '18 May 2024' }].map(r => (
                      <div key={r.l} className="nr-rp-row"><span className="nr-rp-label">{r.l}</span><span className="nr-rp-val">{r.v}</span></div>
                    ))}
                  </div>
                </div>
                <div className="nr-rp-card">
                  <div className="nr-rp-hdr"><div style={{ color: '#2A195C', display: 'flex' }}><IFile /></div><div className="nr-rp-title">Document Checklist</div></div>
                  <div style={{ padding: '8px 0' }}>
                    {CHECKLIST.map((item) => (
                      <div key={item} className="nr-checklist-row">
                        <div className="nr-cl-check"><ICheck s={11} /></div>
                        <span style={{ flex: 1 }}>{item}</span>
                        {item === 'Vehicle Images' && <span style={{ fontSize: 11, color: '#2A195C', fontWeight: 700 }}>{uploadedCount}/6</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="nr-rp-card">
                  <div className="nr-rp-hdr"><div style={{ color: '#2A195C', display: 'flex' }}><IUser /></div><div className="nr-rp-title">Need Help?</div></div>
                  <div className="nr-help-body"><div className="nr-help-sub">Facing issues with document upload?</div><button className="nr-help-btn">Contact Support</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
