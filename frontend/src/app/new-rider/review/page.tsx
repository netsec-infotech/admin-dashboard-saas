'use client';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/* ──────────────────────────────────────────────────────────────
   STEP 5 · REVIEW & CONFIRM — Evegah Smart Mobility
   ────────────────────────────────────────────────────────────── */

const CSS = `
/* ── shell & layout ── */
.nr-shell { display: flex; min-height: 100vh; background: #F3F4F9; }
.nr-main  { margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 240px); }
.nr-page  { flex: 1; padding: 0 28px 80px; }

/* ── breadcrumb ── */
.nr-bc { display: flex; align-items: center; gap: 7px; padding: 14px 0 0; font-size: 12px; color: #9CA3AF; }
.nr-bc a { color: #9CA3AF; display: flex; align-items: center; gap: 4px; text-decoration: none; transition: color .15s; }
.nr-bc a:hover { color: #2a195c; }
.nr-bc-sep { color: #D1D5DB; }
.nr-bc-cur { color: #2a195c; font-weight: 600; }

/* ── title row ── */
.nr-title-row { display: flex; align-items: flex-start; justify-content: space-between; margin: 14px 0 20px; gap: 16px; }
.nr-h1  { font-size: 24px; font-weight: 800; color: #111827; line-height: 1.2; margin: 0; }
.nr-sub { font-size: 13px; color: #6B7280; margin-top: 4px; }
.nr-action-group { display: flex; align-items: center; gap: 10px; }
.nr-preview-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px; background: #EDE9FE; border: 1.5px solid #C4B5FD;
  border-radius: 10px; font-size: 13px; font-weight: 700; color: #2a195c;
  cursor: pointer; font-family: inherit; transition: all .15s;
}
.nr-preview-btn:hover { background: #DDD6FE; }
.nr-back-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px; background: #fff; border: 1.5px solid #E5E7EB;
  border-radius: 10px; font-size: 13px; font-weight: 600; color: #374151;
  cursor: pointer; white-space: nowrap; font-family: inherit;
  box-shadow: 0 1px 3px rgba(0,0,0,.06); transition: border-color .15s, color .15s; flex-shrink: 0;
  text-decoration: none;
}
.nr-back-btn:hover { border-color: #2a195c; color: #2a195c; }

/* ── stepper ── */
.nr-stepper {
  display: flex; align-items: center;
  background: #fff; border: 1px solid #E5E7EB; border-radius: 14px;
  padding: 18px 24px; margin-bottom: 22px; box-shadow: 0 1px 4px rgba(0,0,0,.05);
}
.nr-step-wrap  { display: flex; align-items: center; flex: 1; }
.nr-step       { display: flex; align-items: center; gap: 10px; }
.nr-step-num   { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.nr-step-num.active { background: #2a195c; color: #fff; }
.nr-step-num.done   { background: #22C55E; color: #fff; }
.nr-step-num.pend   { background: #fff; color: #9CA3AF; border: 2px solid #E5E7EB; }
.nr-step-label      { font-size: 13px; font-weight: 600; color: #111827; white-space: nowrap; }
.nr-step-label.pend { color: #9CA3AF; font-weight: 500; }
.nr-step-stat       { font-size: 11.5px; margin-top: 2px; white-space: nowrap; }
.nr-step-stat.done-s   { color: #22C55E; }
.nr-step-stat.active-s { color: #2a195c; }
.nr-step-stat.pend-s   { color: #9CA3AF; }
.nr-step-line { flex: 1; height: 2px; background: #E5E7EB; margin: 0 14px; min-width: 16px; }
.nr-step-line.done-l { background: #22C55E; }

/* ── outer 2-col layout ── */
.nr-layout { display: grid; grid-template-columns: 1fr 296px; gap: 20px; align-items: start; }

/* ── card ── */
.nr-card {
  background: #fff; border: 1px solid #E5E7EB; border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden; margin-bottom: 16px;
}
.nr-card-hdr {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; padding: 20px 24px 18px; border-bottom: 1px solid #F3F4F6;
}
.nr-card-hdr h2 { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 4px; }
.nr-card-hdr p  { font-size: 13px; color: #6B7280; margin: 0; }

/* ── Footer ── */
.nr-footer-actions {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; background: #fff;
  border: 1px solid #E5E7EB; border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
}
.nr-prev-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 22px; background: #fff; border: 1.5px solid #E5E7EB;
  border-radius: 10px; font-size: 13px; font-weight: 600; color: #374151;
  cursor: pointer; font-family: inherit; transition: border-color .15s, color .15s;
  text-decoration: none;
}
.nr-prev-btn:hover { border-color: #2a195c; color: #2a195c; }
.nr-continue-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 30px; background: #2a195c; border: none;
  border-radius: 10px; font-size: 13.5px; font-weight: 700; color: #fff;
  cursor: pointer; font-family: inherit; transition: background .15s;
  text-decoration: none;
}
.nr-continue-btn:hover { background: #4338CA; }
.nr-continue-btn:disabled { background: #9CA3AF; cursor: not-allowed; }

/* ─── RIGHT PANEL ─── */
.nr-rp { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }
.nr-rp-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden; }
.nr-rp-hdr  { display: flex; align-items: center; gap: 9px; padding: 14px 18px; border-bottom: 1px solid #E5E7EB; }
.nr-rp-hdr-ic { display: flex; align-items: center; flex-shrink: 0; }
.nr-rp-title  { font-size: 13.5px; font-weight: 700; color: #111827; }
.nr-sum-body  { padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 7px; }
.nr-sum-row   { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; font-size: 13px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; }
.nr-sum-row-img { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; font-size: 13px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; }
.nr-sum-label { color: #64748B; font-weight: 500; }
.nr-sum-val   { font-weight: 700; color: #111827; display: flex; align-items: center; gap: 8px; }
.nr-sum-thumb { width: 38px; height: 26px; border-radius: 5px; overflow: hidden; background: #F8FAFC; display: flex; align-items: center; justify-content: center; border: 1px solid #E2E8F0; }
.nr-sum-divider { height: 1px; background: #E2E8F0; margin: 4px 0; }
.nr-sum-total {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; margin: 4px 0 0; border-radius: 10px; background: #F5F3FF; border: 1.5px solid #DDD6FE;
}
.nr-sum-total-l { font-size: 13px; font-weight: 700; color: #111827; }
.nr-sum-total-r { font-size: 18px; font-weight: 800; color: #2a195c; }

/* checklist */
.doc-checklist-body { padding: 6px 0 10px; }
.doc-cl-row { display: flex; align-items: center; justify-content: space-between; padding: 7px 18px; font-size: 12.5px; }
.doc-cl-label { color: #374151; }
.doc-cl-status { display: flex; align-items: center; gap: 5px; color: #16A34A; font-weight: 600; font-size: 11.5px; }

.nr-help-body { padding: 14px 18px 16px; }
.nr-help-sub  { font-size: 13px; color: #6B7280; margin-bottom: 12px; line-height: 1.5; }
.nr-help-btn  { width: 100%; padding: 10px; background: #2a195c; color: #fff; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: background .15s; }
.nr-help-btn:hover { background: #4338CA; }

/* ─── REVIEW-SPECIFIC ─── */
.rv-top3 { display: grid; grid-template-columns: 1.15fr 1fr 1fr; }
.rv-sec { padding: 20px 22px; }
.rv-sec:not(:last-child) { border-right: 1px solid #F3F4F6; }
.rv-sec-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.rv-sec-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #111827; }
.rv-edit-btn { color: #2a195c; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: none; display: flex; align-items: center; gap: 4px; font-family: inherit; text-decoration: none; }
.rv-edit-btn:hover { text-decoration: underline; }
.rv-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #F9FAFB; font-size: 12.5px; }
.rv-row-l { color: #6B7280; }
.rv-row-v { font-weight: 600; color: #111827; text-align: right; }
.rv-divider { height: 1px; background: #F3F4F6; }
.rv-total-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0 0; margin-top: 6px; border-top: 1.5px solid #E5E7EB; }
.rv-total-l { font-size: 13px; font-weight: 800; color: #111827; }
.rv-total-v { font-size: 20px; font-weight: 800; color: #2a195c; }
.rv-vb-inner { display: grid; grid-template-columns: 1fr 180px; gap: 24px; }
.rv-veh-thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
.rv-thumb { border-radius: 8px; overflow: hidden; height: 84px; background: #F8FAFC; border: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: center; }
.rv-thumb img { width: 100%; height: 100%; object-fit: contain; }
.rv-thumb-lbl { font-size: 11px; font-weight: 600; color: #4B5563; text-align: center; margin-top: 5px; }
.rv-bat-name { font-size: 13.5px; font-weight: 800; color: #111827; margin-bottom: 8px; margin-top: 8px; }
.rv-doc-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 12.5px; }
.rv-confirm-banner { display: flex; align-items: flex-start; gap: 10px; background: #F0FDF4; border-top: 1px solid #BBF7D0; padding: 14px 22px; font-size: 13px; color: #15803D; line-height: 1.5; }
.rv-footer-note { font-size: 11.5px; color: #9CA3AF; text-align: right; margin-top: 5px; }
.rv-bottom-2col { display: grid; grid-template-columns: 1fr 1fr; }

/* Agreement box (replaces signature) */
.rv-agree-box {
  background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; margin-top: 10px;
}
.rv-agree-title { font-size: 12.5px; font-weight: 700; color: #1E293B; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
.rv-agree-meta { font-size: 12px; color: #64748B; line-height: 1.5; }

/* ── Modal Styles (Preview & Success) ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px); z-index: 999;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.preview-modal {
  background: #fff; width: 100%; max-width: 860px; max-height: 90vh;
  border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  display: flex; flex-direction: column; overflow: hidden;
}
.preview-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; background: #2A195C; color: #fff;
}
.preview-hdr h3 { font-size: 16px; font-weight: 700; margin: 0; }
.preview-close { background: none; border: none; color: #fff; cursor: pointer; font-size: 18px; padding: 4px; }
.preview-body { padding: 24px; overflow-y: auto; flex: 1; }
.preview-sec { margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px solid #E2E8F0; }
.preview-sec:last-child { border-bottom: none; margin-bottom: 0; }
.preview-sec-h { font-size: 14px; font-weight: 700; color: #2A195C; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.preview-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.preview-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.preview-field { font-size: 12.5px; }
.preview-label { color: #64748B; margin-bottom: 2px; }
.preview-val { font-weight: 600; color: #0F172A; }
.preview-thumb { border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; height: 80px; background: #F8FAFC; display: flex; align-items: center; justify-content: center; }
.preview-thumb img { width: 100%; height: 100%; object-fit: contain; }
.preview-footer {
  display: flex; align-items: center; justify-content: flex-end; gap: 12px;
  padding: 14px 24px; background: #F8FAFC; border-top: 1px solid #E2E8F0;
}
`;

/* ── SVG Helpers ── */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 as number, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const SV = ({ s = 14, children, ...p }: { s?: number; children: React.ReactNode } & React.SVGProps<SVGSVGElement>) => (
  <svg width={s} height={s} viewBox="0 0 24 24" {...S} {...p}>{children}</svg>
);

const ILeft = () => <SV s={13}><polyline points="15 18 9 12 15 6" /></SV>;
const ICheck = ({ s = 13 }: { s?: number }) => <SV s={s}><polyline points="20 6 9 17 4 12" /></SV>;
const IHead = () => <SV s={15}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></SV>;
const IArr = ({ s = 12 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IReceipt = ({ s = 14 }: { s?: number }) => <SV s={s}><path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2z" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="12" y2="13" /></SV>;
const IFile = ({ s = 14 }: { s?: number }) => <SV s={s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></SV>;
const IUser = ({ s = 14 }: { s?: number }) => <SV s={s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></SV>;
const IClipboard = ({ s = 14 }: { s?: number }) => <SV s={s}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></SV>;
const IShield = ({ s = 14 }: { s?: number }) => <SV s={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></SV>;
const ICheckList = () => <SV s={14}><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></SV>;
const IPen = () => <SV s={13}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></SV>;
const IExt = () => <SV s={12}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></SV>;
const IPrint = () => <SV s={14}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></SV>;
const IWhatsApp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.96.549 1.78.814 2.796.815 3.183 0 5.769-2.587 5.77-5.767 0-3.18-2.586-5.768-5.77-5.768zm0-2.172c4.418 0 8 3.582 8 8 0 1.545-.441 3.01-1.258 4.295l1.227 4.483-4.593-1.205c-1.238.74-2.658 1.149-4.225 1.149-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8z"/>
  </svg>
);

/* ── Stepper ── */
const STEPS = [
  { n: 1, label: 'KYC Verification', stat: 'Completed', state: 'done' },
  { n: 2, label: 'Rental Details', stat: 'Completed', state: 'done' },
  { n: 3, label: 'Payment & Charges', stat: 'Completed', state: 'done' },
  { n: 4, label: 'Documents', stat: 'Completed', state: 'done' },
  { n: 5, label: 'Review & Confirm', stat: 'In Progress', state: 'active' },
];

/* ── Right Panel ── */
function RightPanel({ rentalData, paymentData }: { rentalData: any; paymentData?: any }) {
  const baseRent = Number(rentalData?.plan_rate ?? 0);
  const deposit = Number(rentalData?.deposit_amount ?? 0);
  const discount = Number(paymentData?.discount) || 0;
  const total = paymentData?.total_payable || Math.max(0, baseRent + deposit - discount);

  const CHECKLIST = [
    { l: 'KYC Details', s: 'Verified' },
    { l: 'Identity Document', s: 'Uploaded' },
    { l: 'Profile Photo', s: 'Captured' },
    { l: 'Vehicle Photos (4 Angles)', s: 'Completed' },
    { l: 'Terms & Conditions', s: 'Agreed' },
  ];

  return (
    <div className="nr-rp">
      {/* Rental Summary */}
      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: '#2a195c' }}><IReceipt /></span>
          <div className="nr-rp-title">Rental Summary</div>
        </div>
        <div className="nr-sum-body">
          <div className="nr-sum-row">
            <span className="nr-sum-label">Vehicle Number</span>
            <span className="nr-sum-val" style={{ fontWeight: 600 }}>
              {rentalData?.vehicle_code || (rentalData?.vehicle_name?.match(/\((.*?)\)/)?.[1]) || rentalData?.vehicle_name || 'EVM102501'}
            </span>
          </div>
          <div className="nr-sum-row">
            <span className="nr-sum-label">Vehicle Model</span>
            <span className="nr-sum-val" style={{ fontWeight: 600 }}>
              {rentalData?.vehicle_model || rentalData?.vehicle_name?.replace(/\(.*?\)/, '').trim() || 'Evegah City'}
            </span>
          </div>
          <div className="nr-sum-row-img">
            <span className="nr-sum-label">Battery ID</span>
            <span className="nr-sum-val">
              {rentalData?.battery_id || 'BAT-MNZ-001'}
              <span className="nr-sum-thumb">
                <img src="/ev_batttery.png" alt="Battery" style={{ width: 16, height: 24, objectFit: 'contain' }} />
              </span>
            </span>
          </div>
          {[
            { l: 'Assigned Zone', v: rentalData?.zone_name || 'Assigned Zone' },
            { l: 'Package Plan', v: rentalData?.plan_type || 'Daily Plan' },
            { l: 'Rental Rent Price', v: `₹${baseRent.toFixed(2)}` },
            { l: 'Refundable Security Deposit', v: `₹${deposit.toFixed(2)}` },
            ...(discount > 0 ? [{ l: 'Coupon Discount', v: `-₹${discount.toFixed(2)}` }] : []),
          ].map(r => (
            <div key={r.l} className="nr-sum-row">
              <span className="nr-sum-label">{r.l}</span>
              <span className="nr-sum-val" style={{ textAlign: 'right', fontWeight: r.l.includes('Deposit') ? 700 : 500 }}>{r.v}</span>
            </div>
          ))}
          <div className="nr-sum-divider" />
          <div className="nr-sum-total">
            <span className="nr-sum-total-l">Total Payable (Zero GST)</span>
            <span className="nr-sum-total-r">₹{Number(total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: '#2a195c' }}><ICheckList /></span>
          <div className="nr-rp-title">Document Checklist</div>
        </div>
        <div className="doc-checklist-body">
          {CHECKLIST.map(c => (
            <div key={c.l} className="doc-cl-row">
              <span className="doc-cl-label">{c.l}</span>
              <span className="doc-cl-status"><ICheck s={11} /> {c.s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Need Help */}
      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: '#2a195c' }}><IHead /></span>
          <div className="nr-rp-title">Need Help?</div>
        </div>
        <div className="nr-help-body">
          <div className="nr-help-sub">Facing issues with review &amp; confirmation?</div>
          <button className="nr-help-btn">Contact Support</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function ReviewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [kycData, setKycData] = useState<any>({});
  const [rentalData, setRentalData] = useState<any>({});
  const [paymentData, setPaymentData] = useState<any>({});

  // Real photos from localStorage or defaults
  const [docIdentity, setDocIdentity] = useState('/assets/aadhar.jpg');
  const [docProfile, setDocProfile] = useState('/rohit_avatar.png');
  const [vehFront, setVehFront] = useState('/City-1.png');
  const [vehRear, setVehRear] = useState('/City-2.png');
  const [vehLeft, setVehLeft] = useState('/City-3.png');
  const [vehRight, setVehRight] = useState('/City-4.png');

  // Modals & confirmation
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);

  useEffect(() => {
    try {
      const k = JSON.parse(localStorage.getItem('evegah_new_ride_kyc') || '{}');
      const r = JSON.parse(localStorage.getItem('evegah_new_ride_rental') || '{}');
      const p = JSON.parse(localStorage.getItem('evegah_new_ride_payment') || '{}');
      setKycData(k);
      setRentalData(r);
      setPaymentData(p);

      const idDoc = localStorage.getItem('evegah_doc_identity');
      if (idDoc) setDocIdentity(idDoc);
      const profDoc = localStorage.getItem('evegah_doc_profile');
      if (profDoc) setDocProfile(profDoc);
      const vf = localStorage.getItem('evegah_veh_front');
      if (vf) setVehFront(vf);
      const vr = localStorage.getItem('evegah_veh_rear');
      if (vr) setVehRear(vr);
      const vl = localStorage.getItem('evegah_veh_left');
      if (vl) setVehLeft(vl);
      const vrt = localStorage.getItem('evegah_veh_right');
      if (vrt) setVehRight(vrt);
    } catch (e) {}
  }, []);

  const handleConfirmSubmit = async () => {
    const riderName = (kycData.fullName || kycData.name || '').trim();
    const mobileNumber = (kycData.mobile || '').replace(/\D/g, '').slice(-10);
    if (!riderName || !mobileNumber) {
      alert('Rider Name and 10-digit Mobile Number are required. Please complete Step 1 (KYC Verification).');
      router.push('/new-rider');
      return;
    }

    setSubmitting(true);
    try {
      const planRate = Number(rentalData?.plan_rate ?? 0);
      const depositAmt = Number(rentalData?.deposit_amount ?? 0);
      const discountAmt = Number(paymentData?.discount || 0);
      const totalAmount = (paymentData?.total_payable !== undefined && paymentData?.total_payable !== null)
        ? Number(paymentData.total_payable)
        : Math.max(0, planRate + depositAmt - discountAmt);

      const fullPresentAddress = [kycData.address1, kycData.address2, kycData.city, kycData.state, kycData.pincode]
        .filter(Boolean)
        .join(', ');
      const fullPermAddress = [
        kycData.permAddress1 || kycData.address1,
        kycData.permAddress2 || kycData.address2,
        kycData.permCity || kycData.city,
        kycData.permState || kycData.state,
        kycData.permPincode || kycData.pincode,
      ]
        .filter(Boolean)
        .join(', ');

      const payload = {
        rider_name: riderName,
        name: riderName,
        mobile: mobileNumber,
        email: kycData.email || null,
        date_of_birth: kycData.dob || null,
        gender: kycData.gender || null,
        address: fullPermAddress || fullPresentAddress || null,
        present_address: fullPresentAddress || null,
        aadhaar_number: kycData.idNumber || kycData.aadhaar || null,
        emergency_contact_name: kycData.refName || kycData.fatherName || null,
        emergency_contact_phone: kycData.altMobile || kycData.refNumber || null,
        vehicle_id: rentalData.vehicle_code || rentalData.vehicle_name || 'Evegah City',
        battery_id: rentalData.battery_id || 'BAT-MNZ-001',
        package_name: rentalData.plan_type || 'Daily Plan',
        rental_start_date: rentalData.start_date || new Date().toISOString().split('T')[0],
        return_date: rentalData.return_date || null,
        rent: planRate,
        deposit: depositAmt,
        total: totalAmount,
        zone_name: rentalData.zone_name || 'Assigned Zone',
        pay_method: paymentData.pay_method || 'payu',
        payment_mode: paymentData.pay_method === 'cash' ? 'Cash' : 'PayU',
        payu_tx_id: paymentData.payu_tx_id || null,
        cash_receipt: paymentData.cash_receipt || null,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const res = await fetch(`${apiUrl}/rides/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json().catch(() => ({}));

      if (payload.payu_tx_id) {
        fetch(`${apiUrl}/payments/payu/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tx_id: payload.payu_tx_id,
            amount: payload.total,
            mobile: payload.mobile,
            rider_name: payload.rider_name
          })
        }).catch(() => {});
      }

      const bookingId = resJson?.data?.id || `RIDE-${Date.now().toString().slice(-6)}`;

      setSuccessBooking({
        id: bookingId,
        name: riderName,
        mobile: mobileNumber,
        vehicle: payload.vehicle_id,
        battery: payload.battery_id,
        plan: payload.package_name,
        amount: totalAmount
      });

      // Clear local storage for the flow
      try {
        localStorage.removeItem('evegah_new_ride_kyc');
        localStorage.removeItem('evegah_new_ride_rental');
        localStorage.removeItem('evegah_new_ride_payment');
        localStorage.removeItem('evegah_doc_identity');
        localStorage.removeItem('evegah_doc_profile');
        localStorage.removeItem('evegah_veh_front');
        localStorage.removeItem('evegah_veh_rear');
        localStorage.removeItem('evegah_veh_left');
        localStorage.removeItem('evegah_veh_right');
      } catch (e) {}

    } catch (e: any) {
      alert('Error registering ride: ' + (e.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  const riderName = (kycData.fullName || kycData.name || '').trim() || '—';
  const riderMobile = (kycData.mobile || '').trim() || '—';
  const cleanMobile = riderMobile.replace(/\D/g, '').slice(-10);
  const planRateNum = Number(rentalData?.plan_rate ?? 0);
  const depositNum = Number(rentalData?.deposit_amount ?? 0);
  const discountNum = Number(paymentData?.discount || 0);
  const totalAmount = (paymentData?.total_payable !== undefined && paymentData?.total_payable !== null)
    ? Number(paymentData.total_payable)
    : Math.max(0, planRateNum + depositNum - discountNum);

  const whatsappReceiptText = `Hello ${riderName}, your Evegah EV ride booking is confirmed!%0A%0A*Booking ID:* ${successBooking?.id || 'EVG-' + Date.now().toString().slice(-6)}%0A*Vehicle:* ${rentalData?.vehicle_name || 'Evegah City'}%0A*Battery:* ${rentalData?.battery_id || 'BAT-MNZ-001'}%0A*Plan:* ${rentalData?.plan_type || 'Daily Plan'}%0A*Total Paid:* ₹${totalAmount.toFixed(2)} (Zero GST)%0A%0AThank you for choosing Evegah Smart Mobility! ⚡`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="nr-shell">
        <Sidebar activePath="/new-rider" />
        <div className="nr-main">
          <TopBar />
          <div className="nr-page">

            {/* Breadcrumb */}
            <div className="nr-bc">
              <Link href="/"><ILeft /> Home</Link>
              <span className="nr-bc-sep">›</span>
              <a href="#">Rides / Rentals</a>
              <span className="nr-bc-sep">›</span>
              <span className="nr-bc-cur">New Ride Registration</span>
            </div>

            {/* Title */}
            <div className="nr-title-row">
              <div>
                <h1 className="nr-h1">New Ride Registration</h1>
                <p className="nr-sub">Review all details before confirming the registration</p>
              </div>
              <div className="nr-action-group">
                <button
                  type="button"
                  className="nr-preview-btn"
                  onClick={() => setShowPreviewModal(true)}
                >
                  <IFile s={14} /> Preview Registration Form
                </button>
                <Link href="/renters" className="nr-back-btn">
                  <ILeft /> Back to Rides
                </Link>
              </div>
            </div>

            {/* Stepper */}
            <div className="nr-stepper">
              {STEPS.map((s, i) => (
                <div key={s.n} className="nr-step-wrap">
                  <div className="nr-step">
                    <div className={`nr-step-num ${s.state}`}>
                      {s.state === 'done' ? <ICheck s={13} /> : s.n}
                    </div>
                    <div>
                      <div className={`nr-step-label ${s.state === 'pend' ? 'pend' : ''}`}>{s.label}</div>
                      <div className={`nr-step-stat ${s.state}-s`}>{s.stat}</div>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`nr-step-line ${s.state === 'done' ? 'done-l' : ''}`} />
                  )}
                </div>
              ))}
            </div>

            {/* 2-col outer */}
            <div className="nr-layout">
              <div>
                {/* Main Card */}
                <div className="nr-card">
                  <div className="nr-card-hdr">
                    <div>
                      <h2>Step 5: Review &amp; Confirm</h2>
                      <p>Review all rider and rental details before confirming the registration.</p>
                    </div>
                  </div>

                  {/* ── Section Row 1: Rider / Rental / Payment ── */}
                  <div className="rv-top3">
                    {/* 1. Rider Details */}
                    <div className="rv-sec">
                      <div className="rv-sec-hdr">
                        <div className="rv-sec-title">
                          <span style={{ color: '#2a195c', display: 'flex' }}><IUser s={15} /></span>
                          Rider Details
                        </div>
                        <Link href="/new-rider" className="rv-edit-btn"><IPen /> Edit</Link>
                      </div>
                      {[
                        { l: 'Name', v: riderName },
                        { l: 'Mobile Number', v: riderMobile },
                        { l: 'Email', v: kycData.email || '—' },
                        { l: 'Date of Birth', v: kycData.dob || '—' },
                        { l: 'Identity Document', v: `${kycData.idType || 'Aadhaar'}: ${kycData.idNumber || kycData.aadhaar || '—'}` },
                        { l: 'Address', v: `${kycData.address1 || ''} ${kycData.city || ''} ${kycData.state || ''} ${kycData.pincode || ''}`.trim() || '—' },
                      ].map(r => (
                        <div key={r.l} className="rv-row">
                          <span className="rv-row-l">{r.l}</span>
                          <span className="rv-row-v">{r.v}</span>
                        </div>
                      ))}
                    </div>

                    {/* 2. Rental Details */}
                    <div className="rv-sec">
                      <div className="rv-sec-hdr">
                        <div className="rv-sec-title">
                          <span style={{ color: '#2a195c', display: 'flex' }}><IClipboard s={15} /></span>
                          Rental Details
                        </div>
                        <Link href="/new-rider/rental" className="rv-edit-btn"><IPen /> Edit</Link>
                      </div>
                      {[
                        { l: 'Vehicle', v: rentalData?.vehicle_name || rentalData?.vehicle_code || 'Evegah City' },
                        { l: 'Battery', v: rentalData?.battery_id || 'BAT-MNZ-001' },
                        { l: 'Plan', v: rentalData?.plan_type || 'Daily Plan' },
                        { l: 'Plan Rate', v: `₹${planRateNum.toFixed(2)}` },
                        { l: 'Expected Duration', v: `${rentalData?.total_days || 1} Day${(rentalData?.total_days || 1) > 1 ? 's' : ''}` },
                        { l: 'Assigned Zone', v: rentalData?.zone_name || 'Assigned Zone' },
                      ].map(r => (
                        <div key={r.l} className="rv-row">
                          <span className="rv-row-l">{r.l}</span>
                          <span className="rv-row-v">{r.v}</span>
                        </div>
                      ))}
                    </div>

                    {/* 3. Payment Summary */}
                    <div className="rv-sec">
                      <div className="rv-sec-hdr">
                        <div className="rv-sec-title">
                          <span style={{ color: '#2a195c', display: 'flex' }}><IReceipt s={15} /></span>
                          Payment Summary
                        </div>
                        <Link href="/new-rider/payment" className="rv-edit-btn"><IPen /> Edit</Link>
                      </div>
                      {[
                        { l: `Plan Charges (${rentalData?.plan_type || 'Daily Plan'})`, v: `₹${planRateNum.toFixed(2)}` },
                        { l: 'Security Deposit', v: `₹${depositNum.toFixed(2)}` },
                        { l: 'Payment Mode', v: (paymentData?.pay_method || 'payu').toUpperCase() },
                        ...(paymentData?.discount > 0 ? [{ l: 'Coupon Discount', v: `-₹${Number(paymentData.discount).toFixed(2)}` }] : []),
                        ...(paymentData?.pay_method === 'split' ? [
                          { l: 'Cash Component', v: `₹${Number(paymentData.cash_amount || 0).toFixed(2)}` },
                          { l: 'Online Component', v: `₹${Number(paymentData.online_amount || 0).toFixed(2)}` },
                        ] : []),
                      ].map(r => (
                        <div key={r.l} className="rv-row">
                          <span className="rv-row-l">{r.l}</span>
                          <span className="rv-row-v">{r.v}</span>
                        </div>
                      ))}
                      <div className="rv-total-row">
                        <span className="rv-total-l">Total Payable (Zero GST)</span>
                        <span className="rv-total-v">₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="rv-divider" />

                  {/* ── Section Row 2: Vehicle & Battery ── */}
                  <div className="rv-sec">
                    <div className="rv-sec-hdr">
                      <div className="rv-sec-title">
                        <span style={{ color: '#2a195c', display: 'flex' }}><IShield s={15} /></span>
                        Vehicle &amp; Battery Inspection Photos
                      </div>
                      <Link href="/new-rider/documents" className="rv-edit-btn"><IPen /> Edit</Link>
                    </div>
                    <div className="rv-vb-inner">
                      {/* Left: 4 Vehicle Angle Photos */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>
                          Vehicle Inspection Photos (4 Angles Mandatory)
                        </div>
                        <div className="rv-veh-thumbs">
                          {[
                            { label: 'Front View', img: vehFront },
                            { label: 'Rear View', img: vehRear },
                            { label: 'Left Side View', img: vehLeft },
                            { label: 'Right Side View', img: vehRight },
                          ].map(t => (
                            <div key={t.label}>
                              <div className="rv-thumb">
                                <img src={t.img} alt={t.label} />
                              </div>
                              <div className="rv-thumb-lbl">{t.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Battery */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: 12, borderLeft: '1px solid #F3F4F6' }}>
                        <img
                          src="/ev_batttery.png"
                          alt="Battery Unit"
                          style={{ width: 68, height: 80, objectFit: 'contain', borderRadius: 6 }}
                        />
                        <div className="rv-bat-name">{rentalData?.battery_id || 'Evegah 60V 30Ah'}</div>
                        {[
                          { l: 'Type', v: 'Li-ion' },
                          { l: 'Swappable', v: 'Yes' },
                          { l: 'Capacity', v: '60V / 30Ah' },
                        ].map(r => (
                          <div key={r.l} className="rv-row" style={{ width: '100%' }}>
                            <span className="rv-row-l">{r.l}</span>
                            <span className="rv-row-v">{r.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="rv-divider" />

                  {/* ── Section Row 3: Documents + Terms ── */}
                  <div className="rv-bottom-2col">
                    {/* 1. Documents Summary */}
                    <div className="rv-sec" style={{ borderRight: '1px solid #F3F4F6' }}>
                      <div className="rv-sec-hdr">
                        <div className="rv-sec-title">
                          <span style={{ color: '#2a195c', display: 'flex' }}><IFile s={15} /></span>
                          Documents Summary
                        </div>
                        <Link href="/new-rider/documents" className="rv-edit-btn"><IPen /> Edit</Link>
                      </div>
                      {[
                        { l: 'Identity Document', v: 'Uploaded & Verified' },
                        { l: 'Profile Photo', v: 'Captured & Verified' },
                        { l: 'Vehicle Photos (4 Angles)', v: '4 Completed' },
                        { l: 'Rental Agreement Terms', v: 'Agreed & Accepted' },
                      ].map(r => (
                        <div key={r.l} className="rv-doc-row">
                          <span style={{ display: 'flex', color: '#16A34A', flexShrink: 0 }}><ICheck s={13} /></span>
                          <span style={{ flex: 1, color: '#374151' }}>{r.l}</span>
                          <span style={{ color: '#16A34A', fontWeight: 600, fontSize: 11.5 }}>{r.v}</span>
                        </div>
                      ))}
                    </div>

                    {/* 2. Terms & Digital Consent */}
                    <div className="rv-sec">
                      <div className="rv-sec-hdr">
                        <div className="rv-sec-title">
                          <span style={{ color: '#2a195c', display: 'flex' }}><IShield s={15} /></span>
                          Terms &amp; Consent
                        </div>
                        <Link href="/new-rider/documents" className="rv-edit-btn"><IPen /> Edit</Link>
                      </div>

                      {/* Checkbox row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, border: '2px solid #2a195c',
                          background: '#2a195c', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0, marginTop: 1
                        }}>
                          <ICheck s={11} />
                        </div>
                        <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                          Rider has read, understood and agreed to the{' '}
                          <span style={{ color: '#2a195c', fontWeight: 600 }}>Rider Terms &amp; Conditions</span> and battery handling policy.
                        </span>
                      </div>

                      {/* Verified acceptance box */}
                      <div className="rv-agree-box">
                        <div className="rv-agree-title">
                          <span style={{ color: '#16A34A', display: 'flex' }}><ICheck s={14} /></span>
                          Digitally Verified Consent
                        </div>
                        <div className="rv-agree-meta">
                          Consent confirmed for <strong>{riderName}</strong> ({riderMobile}). WhatsApp booking receipt and tax-free rental agreement will be dispatched automatically upon confirmation.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Banner */}
                  <div className="rv-confirm-banner">
                    <span style={{ display: 'flex', flexShrink: 0, marginTop: 1, color: '#16A34A' }}>
                      <ICheck s={16} />
                    </span>
                    <div>
                      By clicking <strong>&quot;Confirm &amp; Submit&quot;</strong>, the rental booking will be activated and an instant digital booking receipt will be sent to the rider on WhatsApp (+91 {cleanMobile}).
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="nr-footer-actions">
                  <Link href="/new-rider/documents" className="nr-prev-btn"><ILeft /> Previous</Link>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <button
                      className="nr-continue-btn"
                      onClick={handleConfirmSubmit}
                      disabled={submitting}
                    >
                      {submitting ? 'Confirming Ride...' : 'Confirm & Submit'} <IArr s={12} />
                    </button>
                    <div className="rv-footer-note">Instant WhatsApp receipt dispatched upon submission</div>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <RightPanel rentalData={rentalData} paymentData={paymentData} />
            </div>
          </div>
        </div>
      </div>

      {/* ── PREVIEW FORM MODAL ── */}
      {showPreviewModal && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="preview-modal" onClick={e => e.stopPropagation()}>
            <div className="preview-hdr">
              <div>
                <h3>📋 Complete Rider Registration Form Preview</h3>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Evegah Smart Mobility • Application Summary</span>
              </div>
              <button className="preview-close" onClick={() => setShowPreviewModal(false)}>✕</button>
            </div>

            <div className="preview-body">
              {/* Section 1: Rider KYC */}
              <div className="preview-sec">
                <div className="preview-sec-h"><IUser s={15} /> 1. Rider Information</div>
                <div className="preview-grid-2">
                  <div className="preview-field">
                    <div className="preview-label">Full Name</div>
                    <div className="preview-val">{riderName}</div>
                  </div>
                  <div className="preview-field">
                    <div className="preview-label">Mobile Number</div>
                    <div className="preview-val">{riderMobile}</div>
                  </div>
                  <div className="preview-field">
                    <div className="preview-label">Email Address</div>
                    <div className="preview-val">{kycData.email || '—'}</div>
                  </div>
                  <div className="preview-field">
                    <div className="preview-label">Date of Birth</div>
                    <div className="preview-val">{kycData.dob || '—'}</div>
                  </div>
                  <div className="preview-field">
                    <div className="preview-label">Identity Document</div>
                    <div className="preview-val">{kycData.idType || 'Aadhaar'}: {kycData.idNumber || kycData.aadhaar || '—'}</div>
                  </div>
                  <div className="preview-field">
                    <div className="preview-label">Registered Address</div>
                    <div className="preview-val">{`${kycData.address1 || ''} ${kycData.city || ''} ${kycData.state || ''} ${kycData.pincode || ''}`.trim() || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Section 2: Rental Details */}
              <div className="preview-sec">
                <div className="preview-sec-h"><IClipboard s={15} /> 2. Vehicle &amp; Rental Plan</div>
                <div className="preview-grid-2">
                  <div className="preview-field">
                    <div className="preview-label">Allocated Vehicle</div>
                    <div className="preview-val">{rentalData?.vehicle_name || rentalData?.vehicle_code || 'Evegah City'}</div>
                  </div>
                  <div className="preview-field">
                    <div className="preview-label">Allocated Battery</div>
                    <div className="preview-val">{rentalData?.battery_id || 'BAT-MNZ-001'}</div>
                  </div>
                  <div className="preview-field">
                    <div className="preview-label">Package Plan</div>
                    <div className="preview-val">{rentalData?.plan_type || 'Daily Plan'} ({rentalData?.total_days || 1} Day)</div>
                  </div>
                  <div className="preview-field">
                    <div className="preview-label">Assigned Zone</div>
                    <div className="preview-val">{rentalData?.zone_name || 'Assigned Zone'}</div>
                  </div>
                </div>
              </div>

              {/* Section 3: Billing & Charges (Zero GST) */}
              <div className="preview-sec">
                <div className="preview-sec-h"><IReceipt s={15} /> 3. Payment &amp; Charges Breakdown (Zero GST)</div>
                <div className="preview-grid-2">
                  <div className="preview-field">
                    <div className="preview-label">Plan Rental Rate</div>
                    <div className="preview-val">₹{planRateNum.toFixed(2)}</div>
                  </div>
                  <div className="preview-field">
                    <div className="preview-label">Security Deposit (Refundable)</div>
                    <div className="preview-val">₹{depositNum.toFixed(2)}</div>
                  </div>
                  <div className="preview-field">
                    <div className="preview-label">Coupon Discount</div>
                    <div className="preview-val">₹{discountNum.toFixed(2)}</div>
                  </div>
                  <div className="preview-field">
                    <div className="preview-label">Payment Mode</div>
                    <div className="preview-val">{(paymentData?.pay_method || 'PAYU').toUpperCase()}</div>
                  </div>
                  <div className="preview-field" style={{ gridColumn: 'span 2' }}>
                    <div className="preview-label">Total Amount Payable</div>
                    <div className="preview-val" style={{ fontSize: 16, color: '#2A195C', fontWeight: 800 }}>
                      ₹{totalAmount.toFixed(2)} (Zero GST)
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Document & Vehicle Photos */}
              <div className="preview-sec">
                <div className="preview-sec-h"><IShield s={15} /> 4. Rider Documents &amp; Vehicle Photos</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Identity &amp; Profile</div>
                <div className="preview-grid-2" style={{ marginBottom: 14 }}>
                  <div>
                    <div className="preview-thumb">
                      <img src={docIdentity} alt="Identity Document" />
                    </div>
                    <div style={{ fontSize: 11, textAlign: 'center', marginTop: 4, color: '#64748B' }}>Identity Document</div>
                  </div>
                  <div>
                    <div className="preview-thumb">
                      <img src={docProfile} alt="Profile Photo" />
                    </div>
                    <div style={{ fontSize: 11, textAlign: 'center', marginTop: 4, color: '#64748B' }}>Profile Photo</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Vehicle Inspection Angles</div>
                <div className="preview-grid-4">
                  <div>
                    <div className="preview-thumb"><img src={vehFront} alt="Front View" /></div>
                    <div style={{ fontSize: 10.5, textAlign: 'center', marginTop: 4, color: '#64748B' }}>Front View</div>
                  </div>
                  <div>
                    <div className="preview-thumb"><img src={vehRear} alt="Rear View" /></div>
                    <div style={{ fontSize: 10.5, textAlign: 'center', marginTop: 4, color: '#64748B' }}>Rear View</div>
                  </div>
                  <div>
                    <div className="preview-thumb"><img src={vehLeft} alt="Left Side" /></div>
                    <div style={{ fontSize: 10.5, textAlign: 'center', marginTop: 4, color: '#64748B' }}>Left Side</div>
                  </div>
                  <div>
                    <div className="preview-thumb"><img src={vehRight} alt="Right Side" /></div>
                    <div style={{ fontSize: 10.5, textAlign: 'center', marginTop: 4, color: '#64748B' }}>Right Side</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="preview-footer">
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', background: '#F1F5F9', border: '1px solid #CBD5E1',
                  borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer'
                }}
              >
                <IPrint /> Print Summary
              </button>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                style={{
                  padding: '9px 22px', background: '#2A195C', border: 'none',
                  borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#FFF', cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL WITH WHATSAPP CONFIRMATION ── */}
      {successBooking && (
        <div className="modal-overlay">
          <div className="preview-modal" style={{ maxWidth: 540 }}>
            <div style={{ padding: '32px 28px', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7',
                color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: 28
              }}>
                ✓
              </div>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
                Booking Registered Successfully!
              </h2>
              <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 20px', lineHeight: 1.5 }}>
                Ride <strong>{successBooking.id}</strong> has been created. A digital booking receipt has been dispatched to rider on WhatsApp.
              </p>

              <div style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12,
                padding: '16px 20px', textAlign: 'left', marginBottom: 22, fontSize: 13
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748B' }}>Rider Name:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{successBooking.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748B' }}>Mobile Number:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>+91 {successBooking.mobile}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748B' }}>Vehicle &amp; Battery:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{successBooking.vehicle} • {successBooking.battery}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Total Amount Paid:</span>
                  <span style={{ fontWeight: 800, color: '#16A34A' }}>₹{Number(successBooking.amount).toFixed(2)} (Zero GST)</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href={`https://wa.me/91${cleanMobile}?text=${whatsappReceiptText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px', background: '#25D366', color: '#FFF', borderRadius: 10,
                    fontSize: 14, fontWeight: 700, textDecoration: 'none'
                  }}
                >
                  <IWhatsApp /> Open Booking Receipt in WhatsApp Web
                </a>
                <button
                  type="button"
                  onClick={() => router.push('/renters')}
                  style={{
                    padding: '12px', background: '#2A195C', color: '#FFF', borderRadius: 10,
                    fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer'
                  }}
                >
                  Go to All Renters &amp; Active Rides
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
