'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

/* ──────────────────────────────────────────────────────────────
   STEP 3 · PAYMENT & CHARGES  — pixel-perfect
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
.nr-back-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px; background: #fff; border: 1.5px solid #E5E7EB;
  border-radius: 10px; font-size: 13px; font-weight: 600; color: #374151;
  cursor: pointer; white-space: nowrap; font-family: inherit;
  box-shadow: 0 1px 3px rgba(0,0,0,.06); transition: border-color .15s, color .15s;
  flex-shrink: 0;
}
.nr-back-btn:hover { border-color: #2a195c; color: #2a195c; }

/* ── stepper ── */
.nr-stepper {
  display: flex; align-items: center;
  background: #fff; border: 1px solid #E5E7EB; border-radius: 14px;
  padding: 18px 24px; margin-bottom: 22px;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
}
.nr-step-wrap { display: flex; align-items: center; flex: 1; }
.nr-step { display: flex; align-items: center; gap: 10px; }
.nr-step-num {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
}
.nr-step-num.active { background: #2a195c; color: #fff; }
.nr-step-num.done   { background: #22C55E; color: #fff; }
.nr-step-num.pend   { background: #fff; color: #9CA3AF; border: 2px solid #E5E7EB; }
.nr-step-label      { font-size: 13px; font-weight: 600; color: #111827; white-space: nowrap; }
.nr-step-label.pend { color: #9CA3AF; font-weight: 500; }
.nr-step-stat       { font-size: 11.5px; margin-top: 2px; white-space: nowrap; }
.nr-step-stat.done-s   { color: #22C55E; }
.nr-step-stat.active-s { color: #2a195c; }
.nr-step-stat.pend-s   { color: #9CA3AF; }
.nr-step-line       { flex: 1; height: 2px; background: #E5E7EB; margin: 0 14px; min-width: 16px; }
.nr-step-line.done-l { background: #22C55E; }

/* ── outer 2-col layout ── */
.nr-layout { display: grid; grid-template-columns: 1fr 296px; gap: 20px; align-items: start; }

/* ── main card ── */
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

/* ── inner 2-col content grid inside the card ── */
.pm-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.pm-left  { padding: 22px 22px 22px 24px; border-right: 1px solid #F3F4F6; }
.pm-right { padding: 22px 24px 22px 22px; }

/* ── section headings ── */
.pm-sec-hd { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 14px; }

/* ── payment method tabs ── */
.pm-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.pm-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 9px; font-size: 12.5px; font-weight: 600;
  cursor: pointer; border: 1.5px solid #E5E7EB; background: #fff;
  color: #374151; font-family: inherit; transition: all .15s; white-space: nowrap;
}
.pm-tab.sel { background: #2a195c; border-color: #2a195c; color: #fff; }
.pm-tab:hover:not(.sel) { border-color: #C7D2FE; color: #2a195c; }
.pm-tab-ic { display: flex; align-items: center; }

/* ── ICICI QR Card ── */
.icici-qr-card {
  background: #FDF4FF;
  border: 1.5px solid #F0ABFC;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 18px;
}
.icici-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #701A75;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 10px;
  letter-spacing: 0.3px;
}
.icici-qr-frame {
  background: #fff;
  padding: 8px;
  border-radius: 10px;
  border: 1.5px solid #E5E7EB;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icici-qr-frame svg {
  display: block;
  border-radius: 4px;
}
.icici-vpa-txt { font-size: 12.5px; font-weight: 700; color: #701A75; margin-top: 10px; }
.icici-ref-txt { font-size: 11px; color: #64748B; margin-top: 2px; }

/* ── ICICI Live Status & Pulse ── */
.icici-status-box {
  margin-top: 12px;
  width: 100%;
  max-width: 320px;
}
.icici-pulse-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 9px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #1D4ED8;
}
.icici-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563EB;
  box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
  animation: iciciPulse 1.8s infinite;
}
@keyframes iciciPulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
}
.icici-verified-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: #ECFDF5;
  border: 1.5px solid #10B981;
  border-radius: 9px;
  padding: 9px 14px;
  font-size: 12.5px;
  font-weight: 700;
  color: #065F46;
}

/* ── PayU (Primary Gateway) QR & PG Card ── */
.payu-qr-card {
  background: #F0FDF4;
  border: 1.5px solid #86EFAC;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 18px;
}
.payu-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #059669;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 12px;
  border-radius: 20px;
  margin-bottom: 10px;
  letter-spacing: 0.4px;
}
.payu-vpa-txt { font-size: 12.5px; font-weight: 700; color: #047857; margin-top: 10px; }
.payu-ref-txt { font-size: 11px; color: #64748B; margin-top: 2px; }
.payu-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #059669;
  box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7);
  animation: payuPulse 1.8s infinite;
}
@keyframes payuPulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(5, 150, 105, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
}

/* ── PhonePe QR & PG Card ── */
.phonepe-qr-card {
  background: #FAF5FF;
  border: 1.5px solid #D8B4FE;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 18px;
}
.phonepe-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #5F259F;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 10px;
  letter-spacing: 0.3px;
}
.phonepe-vpa-txt { font-size: 12.5px; font-weight: 700; color: #5F259F; margin-top: 10px; }
.phonepe-ref-txt { font-size: 11px; color: #64748B; margin-top: 2px; }
.phonepe-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #5F259F;
  box-shadow: 0 0 0 0 rgba(95, 37, 159, 0.7);
  animation: phonepePulse 1.8s infinite;
}
@keyframes phonepePulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(95, 37, 159, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(95, 37, 159, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(95, 37, 159, 0); }
}

/* ── Split Payment Box ── */
.pm-split-box {
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 18px;
}
.pm-split-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 10px;
}

/* ── verified banner ── */
.pm-ok-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12.5px;
  color: #16A34A;
  font-weight: 600;
  margin-bottom: 18px;
}

/* cash / card / wallet input */
.pm-fld { margin-bottom: 14px; }
.pm-fld:last-child { margin-bottom: 0; }
.pm-fld label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
.pm-fld .req { color: #EF4444; margin-left: 2px; }
.pm-fld .opt { color: #9CA3AF; font-size: 11px; font-weight: 400; margin-left: 4px; }
.nr-inp {
  width: 100%; padding: 10px 13px; border: 1.5px solid #E5E7EB; border-radius: 9px;
  font-size: 13px; color: #111827; font-family: inherit; outline: none;
  transition: border-color .15s, box-shadow .15s; background: #fff; box-sizing: border-box;
}
.nr-inp::placeholder { color: #9CA3AF; }
.nr-inp:focus { border-color: #2a195c; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.nr-sel {
  width: 100%; padding: 10px 13px; border: 1.5px solid #E5E7EB; border-radius: 9px;
  font-size: 13px; color: #111827; font-family: inherit; outline: none;
  transition: border-color .15s; background: #fff; cursor: pointer;
  -webkit-appearance: none; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;
  box-sizing: border-box;
}
.nr-sel:focus { border-color: #2a195c; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.pm-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* wallet pills */
.pm-wallet-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.pm-wallet-pill {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border: 1.5px solid #E5E7EB; border-radius: 8px;
  font-size: 12.5px; font-weight: 600; color: #374151; cursor: pointer;
  background: #fff; font-family: inherit; transition: all .15s;
}
.pm-wallet-pill.sel { border-color: #2a195c; background: #EEF2FF; color: #2a195c; }
.pm-wallet-pill:hover:not(.sel) { border-color: #C7D2FE; }

/* ── Payment Summary table ── */
.pm-sum-hd { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 12px; }
.pm-sum-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 0; border-bottom: 1px solid #F9FAFB; font-size: 13px;
}
.pm-sum-row:last-child { border-bottom: none; }
.pm-sum-label { color: #6B7280; display: flex; align-items: center; gap: 5px; }
.pm-sum-val   { font-weight: 600; color: #111827; }
.pm-sum-info  { color: #9CA3AF; cursor: pointer; display: flex; align-items: center; }
.pm-total-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 0 0; margin-top: 4px;
}
.pm-total-label { font-size: 14px; font-weight: 800; color: #111827; }
.pm-total-val   { font-size: 22px; font-weight: 800; color: #2a195c; }
.pm-dep-note {
  display: flex; align-items: flex-start; gap: 9px;
  background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 9px;
  padding: 11px 14px; margin-top: 14px; font-size: 12.5px; color: #1D4ED8; line-height: 1.5;
}

/* ── Coupon ── */
.pm-coupon-wrap { display: flex; gap: 9px; margin-bottom: 8px; }
.pm-coupon-inp {
  flex: 1; padding: 10px 13px; border: 1.5px solid #E5E7EB; border-radius: 9px;
  font-size: 13px; font-family: inherit; outline: none; color: #111827; background: #fff;
  transition: border-color .15s; box-sizing: border-box;
}
.pm-coupon-inp::placeholder { color: #9CA3AF; }
.pm-coupon-inp:focus { border-color: #2a195c; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.pm-coupon-btn {
  padding: 10px 20px; background: #2a195c; color: #fff; border: none;
  border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: inherit; white-space: nowrap; transition: background .15s;
}
.pm-coupon-btn:hover { background: #4338CA; }
.pm-coupon-ok {
  display: flex; align-items: center; gap: 8px;
  background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px;
  padding: 9px 14px; font-size: 12.5px; color: #16A34A; font-weight: 600;
  margin-bottom: 12px;
}
.pm-coupon-err {
  background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;
  padding: 8px 12px; font-size: 12px; color: #DC2626; font-weight: 600;
  margin-bottom: 12px;
}
.pm-coupon-chips {
  display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px;
}
.pm-coupon-chip {
  padding: 4px 9px; border: 1px dashed #6366F1; border-radius: 6px;
  background: #EEF2FF; color: #4338CA; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
}
.pm-coupon-chip:hover { background: #E0E7FF; }
.pm-coupon-rm { margin-left: auto; cursor: pointer; color: #9CA3AF; font-size: 11px; font-weight: 600; background: none; border: none; font-family: inherit; padding: 0; }
.pm-coupon-rm:hover { color: #EF4444; }

/* ── Charges Breakdown ── */
.pm-bk-hd { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 12px; }
.pm-bk-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; font-size: 13px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 6px; }
.pm-bk-label { color: #64748B; font-weight: 500; }
.pm-bk-val   { font-weight: 700; color: #111827; }
.pm-inc-hd { font-size: 13px; font-weight: 700; color: #374151; margin: 16px 0 10px; }
.pm-inc-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; margin-bottom: 7px; }
.pm-inc-ic  { display: flex; align-items: center; flex-shrink: 0; }

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
  padding: 11px 28px; background: #2a195c; border: none;
  border-radius: 10px; font-size: 13px; font-weight: 700; color: #fff;
  cursor: pointer; font-family: inherit; transition: background .15s;
}
.nr-continue-btn:hover { background: #4338CA; }

/* ─────────────── RIGHT PANEL ─────────────── */
.nr-rp { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }
.nr-rp-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden; }
.nr-rp-hdr  { display: flex; align-items: center; gap: 9px; padding: 14px 18px; border-bottom: 1px solid #E5E7EB; }
.nr-rp-hdr-ic { display: flex; align-items: center; flex-shrink: 0; }
.nr-rp-title  { font-size: 13.5px; font-weight: 700; color: #111827; }

.nr-sum-body { padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 7px; }
.nr-sum-row  { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; font-size: 13px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; }
.nr-sum-label { color: #64748B; font-weight: 500; }
.nr-sum-val   { font-weight: 700; color: #111827; }
.nr-sum-divider { height: 1px; background: #E2E8F0; margin: 4px 0; }
.nr-sum-total {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; margin: 4px 0 0; border-radius: 10px; background: #F5F3FF; border: 1.5px solid #DDD6FE;
}
.nr-sum-total-l { font-size: 13px; font-weight: 700; color: #111827; }
.nr-sum-total-r { font-size: 18px; font-weight: 800; color: #2a195c; }

.nr-imp-body { padding: 12px 18px 14px; }
.nr-imp-item { display: flex; align-items: flex-start; gap: 7px; font-size: 12.5px; color: #92400E; margin-bottom: 6px; line-height: 1.5; }
.nr-imp-item:last-child { margin-bottom: 0; }

.nr-help-body { padding: 14px 18px 16px; }
.nr-help-sub  { font-size: 13px; color: #6B7280; margin-bottom: 12px; }
.nr-help-btn  {
  width: 100%; padding: 10px; background: #2a195c; color: #fff;
  border-radius: 9px; font-size: 13px; font-weight: 600;
  cursor: pointer; border: none; font-family: inherit; transition: background .15s;
}
.nr-help-btn:hover { background: #4338CA; }
.nr-continue-btn:disabled {
  background: #CBD5E1 !important;
  color: #64748B !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
  opacity: 0.75 !important;
}
@keyframes nrFadeSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.nr-card, .nr-rp-card, .nr-stepper {
  animation: nrFadeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}
`;

/* ── SVG Helpers ── */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 as number, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const SV = ({ s = 14, children, ...p }: { s?: number; children: React.ReactNode } & React.SVGProps<SVGSVGElement>) => (
  <svg width={s} height={s} viewBox="0 0 24 24" {...S} {...p}>{children}</svg>
);

const ILeft = () => <SV s={13}><polyline points="15 18 9 12 15 6" /></SV>;
const ICheck = ({ s = 13 }: { s?: number }) => <SV s={s}><polyline points="20 6 9 17 4 12" /></SV>;
const IInfo = ({ s = 14 }: { s?: number }) => <SV s={s}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></SV>;
const IHead = () => <SV s={15}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></SV>;
const IArr = ({ s = 12 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IReceipt = () => <SV s={14}><path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2z" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="12" y2="13" /></SV>;
const IShield = () => <SV s={13}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></SV>;

/* UPI icon */
const IUPIIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 19 21 12 17 5 21 12 2" />
  </svg>
);
/* Card icon */
const ICardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
/* Cash icon */
const ICashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
    <circle cx="12" cy="15" r="2" />
  </svg>
);
/* Wallet icon */
const IWalletIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
    <circle cx="17" cy="14" r="1" fill="currentColor" />
    <path d="M20 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
  </svg>
);

/* ── Stepper ── */
const STEPS = [
  { n: 1, label: 'KYC Verification', stat: 'Completed', state: 'done' },
  { n: 2, label: 'Rental Details', stat: 'Completed', state: 'done' },
  { n: 3, label: 'Payment & Charges', stat: 'In Progress', state: 'active' },
  { n: 4, label: 'Documents', stat: 'Pending', state: 'pend' },
  { n: 5, label: 'Review & Confirm', stat: 'Pending', state: 'pend' },
];

const IPayuIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h7a4 4 0 0 1 4 4 4 4 0 0 1-4 4H4V4z" />
    <path d="M12 12l5 8" />
  </svg>
);

const ISplitIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4L8.12 15.88" />
    <path d="M14.47 14.48L20 20" />
    <path d="M8.12 8.12L12 12" />
  </svg>
);

const IPhonePeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

type PayMethod = 'payu' | 'split' | 'cash';

const PAY_TABS: { id: PayMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'payu', label: 'PayU (Primary Gateway)', icon: <IPayuIcon /> },
  { id: 'split', label: 'Split Payment (Cash + PayU)', icon: <ISplitIcon /> },
  { id: 'cash', label: 'Cash Only', icon: <ICashIcon /> },
];

const IZap = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IScale = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

const WALLETS = [
  { id: 'paytm', label: 'Paytm', color: '#00BAF2' },
  { id: 'phonepe', label: 'PhonePe', color: '#5F259F' },
  { id: 'gpay', label: 'GPay', color: '#0F9D58' },
  { id: 'amazon', label: 'Amazon', color: '#FF9900' },
];

/* ── Conditional method input area ── */
function MethodDetail({
  method,
  totalPayable,
  cashAmount,
  setCashAmount,
  onlineAmount,
  staffCollector,
  setStaffCollector,
  cashReceipt,
  setCashReceipt,
  payuQrString,
  payuTxId,
  payuVerified,
  isCheckingPayU,
  splitQrString,
  splitMerchantTranId,
}: {
  method: PayMethod;
  totalPayable: number;
  cashAmount: number;
  setCashAmount: (v: number) => void;
  onlineAmount: number;
  staffCollector: string;
  setStaffCollector: (v: string) => void;
  cashReceipt: string;
  setCashReceipt: (v: string) => void;
  payuQrString?: string;
  payuTxId?: string;
  payuVerified?: boolean;
  isCheckingPayU?: boolean;
  splitQrString?: string;
  splitMerchantTranId?: string;
}) {
  if (method === 'payu') return (
    <>
      <div className="payu-qr-card">
        <div className="payu-badge">
          <span style={{ display: 'flex', alignItems: 'center' }}><IPayuIcon /></span> PAYU INDIA (PRIMARY GATEWAY)
        </div>
        <div className="icici-qr-frame">
          {payuQrString ? (
            <QRCodeSVG
              value={payuQrString}
              size={164}
              level="M"
              includeMargin={false}
            />
          ) : (
            <div style={{ width: 164, height: 164, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 12, fontWeight: 600 }}>
              Generating PayU QR...
            </div>
          )}
        </div>
        <div className="payu-vpa-txt">PayU Smart Dynamic UPI QR</div>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: '#111827', marginTop: 4 }}>
          Scan to Pay: ₹{totalPayable.toFixed(2)}
        </div>
        <div className="payu-ref-txt">
          Payee: Evegah | Txn ID: {payuTxId || 'EVG-GENERATING...'}
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
          Works with Google Pay, PhonePe, Paytm, BHIM, Cards, NetBanking &amp; UPI
        </div>

        <div className="icici-status-box">
          {payuVerified ? (
            <div className="icici-verified-badge" style={{ borderColor: '#059669', color: '#047857' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}><ICheck s={13} /></span> Payment Verified via PayU
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', width: '100%' }}>
              <div className="icici-pulse-badge" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#047857' }}>
                <span className="payu-pulse-dot" />
                <span>{isCheckingPayU ? 'Verifying with PayU...' : 'Awaiting customer PayU payment...'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {payuVerified && (
        <div className="pm-ok-banner">
          <span style={{ display: 'flex', color: '#16A34A' }}><ICheck s={14} /></span>
          PayU payment verified successfully for ₹{totalPayable.toFixed(2)}. Ref: {payuTxId}
        </div>
      )}
    </>
  );

  if (method === 'split') return (
    <>
      <div className="pm-split-box">
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'flex', alignItems: 'center', color: '#2A195C' }}><IScale s={14} /></span> Split Payment (Cash + PayU Online)
        </div>
        <div className="pm-split-grid">
          <div className="pm-fld" style={{ marginBottom: 0 }}>
            <label>Cash Amount (₹)<span className="req"> *</span></label>
            <input
              type="number"
              min={0}
              max={totalPayable}
              className="nr-inp"
              value={cashAmount === 0 ? '' : cashAmount}
              placeholder="e.g. 500"
              onChange={(e) => {
                const val = Math.max(0, Math.min(totalPayable, Number(e.target.value) || 0));
                setCashAmount(val);
              }}
            />
          </div>
          <div className="pm-fld" style={{ marginBottom: 0 }}>
            <label>Remaining Online (₹)</label>
            <input
              className="nr-inp"
              readOnly
              style={{ background: '#F1F5F9', fontWeight: 700, color: '#2a195c' }}
              value={`₹${onlineAmount.toFixed(2)}`}
            />
          </div>
        </div>

        <div className="pm-fld" style={{ marginTop: 12 }}>
          <label>Cash Collected By<span className="req"> *</span></label>
          <select
            className="nr-sel"
            value={staffCollector}
            onChange={(e) => setStaffCollector(e.target.value)}
          >
            <option value="Himanshu (Super Admin)">Himanshu (Super Admin)</option>
            <option value="Speed Force (Zone Admin)">Speed Force (Zone Admin)</option>
            <option value="Rahul Singh (Field Agent)">Rahul Singh (Field Agent)</option>
            <option value="Desk Operator">Desk Operator</option>
          </select>
        </div>
        <div className="pm-fld" style={{ marginTop: 10, marginBottom: 0 }}>
          <label>Cash Receipt / Voucher<span className="opt"> (Optional)</span></label>
          <input
            className="nr-inp"
            placeholder="e.g. CASH-RCP-1082"
            value={cashReceipt}
            onChange={(e) => setCashReceipt(e.target.value)}
          />
        </div>
      </div>

      {onlineAmount > 0 ? (
        <div className="payu-qr-card">
          <div className="payu-badge">
            <span style={{ display: 'flex', alignItems: 'center' }}><IPayuIcon /></span> PAYU QR FOR ONLINE BALANCE
          </div>
          <div className="icici-qr-frame">
            {splitQrString ? (
              <QRCodeSVG
                value={splitQrString}
                size={164}
                level="M"
                includeMargin={false}
              />
            ) : (
              <div style={{ width: 164, height: 164, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 12, fontWeight: 600 }}>
                Generating PayU QR...
              </div>
            )}
          </div>
          <div className="payu-vpa-txt">PayU Smart Dynamic UPI QR</div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#111827', marginTop: 4 }}>
            Scan to pay Online Portion: ₹{onlineAmount.toFixed(2)}
          </div>
          <div className="payu-ref-txt">
            Payee: Evegah | Txn ID: {splitMerchantTranId || 'EVG-SPLIT'}
          </div>

          <div className="icici-status-box">
            {payuVerified ? (
              <div className="icici-verified-badge" style={{ borderColor: '#059669', color: '#047857' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}><ICheck s={13} /></span> Online Portion Verified via PayU
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', width: '100%' }}>
                <div className="icici-pulse-badge" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#047857' }}>
                  <span className="payu-pulse-dot" />
                  <span>{isCheckingPayU ? 'Verifying Online Portion...' : 'Awaiting online portion payment...'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="pm-ok-banner">
          <span style={{ display: 'flex', color: '#16A34A' }}><ICheck s={14} /></span>
          Full payment of ₹{totalPayable.toFixed(2)} is collected in Cash.
        </div>
      )}
    </>
  );

  if (method === 'cash') return (
    <>
      <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '14px', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: '#64748B' }}>Total Cash to be collected</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginTop: 2 }}>₹{totalPayable.toFixed(2)}</div>
        <div style={{ fontSize: 11, color: '#16A34A', marginTop: 4, fontWeight: 600 }}>Zero taxes or GST applicable</div>
      </div>
      <div className="pm-fld">
        <label>Collected By<span className="req"> *</span></label>
        <select
          className="nr-sel"
          value={staffCollector}
          onChange={(e) => setStaffCollector(e.target.value)}
        >
          <option value="Himanshu (Super Admin)">Himanshu (Super Admin)</option>
          <option value="Speed Force (Zone Admin)">Speed Force (Zone Admin)</option>
          <option value="Rahul Singh (Field Agent)">Rahul Singh (Field Agent)</option>
          <option value="Desk Operator">Desk Operator</option>
        </select>
      </div>
      <div className="pm-fld">
        <label>Receipt / Voucher Number<span className="opt"> (Optional)</span></label>
        <input
          className="nr-inp"
          placeholder="Enter receipt or voucher number"
          value={cashReceipt}
          onChange={(e) => setCashReceipt(e.target.value)}
        />
      </div>
    </>
  );

  return null;
}

/* ── Right Panel ── */
function RightPanel({ rentalData, discount, totalPayable }: { rentalData: any; discount: number; totalPayable: number }) {
  const baseRent = Number(rentalData?.plan_rate ?? 0);
  const deposit = Number(rentalData?.deposit_amount ?? 0);
  const vehicleName = rentalData?.vehicle_name || rentalData?.vehicle_code || 'Evegah City';
  const batteryId = rentalData?.battery_id || 'BAT-MNZ-001';
  const planType = rentalData?.plan_type || 'Daily Plan';
  const zoneName = rentalData?.zone_name || 'Assigned Zone';

  return (
    <div className="nr-rp">
      {/* Rental Summary */}
      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: '#2a195c' }}><IReceipt /></span>
          <div className="nr-rp-title">Payment Summary</div>
        </div>
        <div className="nr-sum-body">
          {[
            { l: 'Assigned Zone', v: zoneName },
            { l: 'Vehicle No', v: vehicleName },
            { l: 'Swappable Battery', v: batteryId },
            { l: 'Package Plan', v: planType },
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
            <span className="nr-sum-total-l">Total Payable</span>
            <span className="nr-sum-total-r">₹{totalPayable.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: '#D97706' }}><IInfo s={14} /></span>
          <div className="nr-rp-title">Payment &amp; Deposit Terms</div>
        </div>
        <div className="nr-imp-body">
          {[
            'Zero GST & zero hidden taxes applied. All rates are net.',
            'Security Deposit is 100% refundable upon vehicle return.',
            'PayU Dynamic UPI QR payments reflect automatically upon server confirmation.',
            'Instant payment receipt is generated and dispatched via WhatsApp.',
          ].map((n, i) => (
            <div key={i} className="nr-imp-item">
              <span style={{ color: '#D97706', fontWeight: 700, marginTop: 1 }}>•</span>
              <span>{n}</span>
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
          <div className="nr-help-sub">Facing issues with payment?</div>
          <button className="nr-help-btn">Contact Support</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function PaymentPage() {
  const router = useRouter();
  const [payMethod, setPayMethod] = useState<PayMethod>('payu');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponsList, setCouponsList] = useState<any[]>([]);

  // Split and Cash fields
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [staffCollector, setStaffCollector] = useState('Himanshu (Super Admin)');
  const [cashReceipt, setCashReceipt] = useState('');

  // PayU (Primary Gateway) fields
  const [payuQrString, setPayuQrString] = useState('');
  const [payuTxId, setPayuTxId] = useState('');
  const [payuCheckoutUrl, setPayuCheckoutUrl] = useState('');
  const [payuVerified, setPayuVerified] = useState(false);
  const [isCheckingPayU, setIsCheckingPayU] = useState(false);

  // Split Payment PayU fields
  const [splitQrString, setSplitQrString] = useState('');
  const [splitMerchantTranId, setSplitMerchantTranId] = useState('');
  const [splitCheckoutUrl, setSplitCheckoutUrl] = useState('');

  // In-page PayU Popup Modal state
  const [showPayuPopup, setShowPayuPopup] = useState(false);
  const [popupCheckoutUrl, setPopupCheckoutUrl] = useState('');

  // Form data from previous steps (loaded synchronously so first PayU initiate call has actual rider details)
  const [rentalData, setRentalData] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('evegah_new_ride_rental') || '{}');
      } catch (_) {}
    }
    return null;
  });
  const [kycData, setKycData] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('evegah_new_ride_kyc') || '{}');
      } catch (_) {}
    }
    return null;
  });

  useEffect(() => {
    try {
      const rData = JSON.parse(localStorage.getItem('evegah_new_ride_rental') || '{}');
      const kData = JSON.parse(localStorage.getItem('evegah_new_ride_kyc') || '{}');
      setRentalData(rData);
      setKycData(kData);
    } catch (e) {}
  }, []);

  // Fetch registered active coupons from backend
  useEffect(() => {
    api.get('/coupons')
      .then((res: any) => {
        const raw = res?.data || res?.coupons || res;
        if (Array.isArray(raw)) {
          setCouponsList(raw.filter((c: any) => c.is_active !== false && c.status === 'Active'));
        }
      })
      .catch(() => {});
  }, []);

  // Calculation of real amounts
  const baseRent = Number(rentalData?.plan_rate ?? 0);
  const deposit = Number(rentalData?.deposit_amount ?? 0);
  const durationDays = Number(rentalData?.total_days) || 1;
  const vehicleDisplayName = rentalData?.vehicle_name || rentalData?.vehicle_code || 'Evegah City';
  const batteryDisplayId = rentalData?.battery_id || 'BAT-MNZ-001';

  // Zero GST formula
  const totalPayable = Math.max(0, baseRent + deposit - discount);
  const clampedCash = Math.min(totalPayable, Math.max(0, cashAmount));
  const onlineAmount = Math.max(0, totalPayable - clampedCash);

  // Single authoritative PayU Initiation + Official S2S Dynamic QR for full PayU
  useEffect(() => {
    if (payMethod !== 'payu' || totalPayable <= 0) return;
    setPayuVerified(false);
    setPayuQrString('');
    let isMounted = true;

    api.post('/payments/payu/initiate', {
      amount: totalPayable,
      rider_name: kycData?.fullName || 'Rider',
      mobile: kycData?.mobile || '',
      email: kycData?.email || '',
      notes: `EV Ride ${rentalData?.vehicle_code || 'Rental'}`,
      purpose: 'ride'
    })
      .then((res: any) => {
        if (!isMounted) return;
        const data = res?.data || res;
        const txId = data?.txnid || data?.tx_id || '';
        const chkUrl = data?.checkout_url || '';
        const qrStr = data?.qrString || data?.upi_string || '';
        setPayuTxId(txId);
        setPayuCheckoutUrl(chkUrl);
        if (qrStr) {
          setPayuQrString(qrStr);
          return null;
        }
        return api.post('/payments/payu/qr', {
          txnid: txId,
          amount: totalPayable,
          rider_name: kycData?.fullName || 'Rider',
          mobile: kycData?.mobile || '',
          email: kycData?.email || '',
          notes: `PayU EV Ride ${rentalData?.vehicle_code || 'Rental'}`,
          purpose: 'ride'
        });
      })
      .then((qrRes: any) => {
        if (!isMounted || !qrRes) return;
        const qrData = qrRes?.data || qrRes;
        const qrStr = qrData?.qrString || qrData?.upi_string || '';
        if (qrStr) setPayuQrString(qrStr);
      })
      .catch((err) => {
        console.error('PayU initiation error:', err);
      });

    return () => { isMounted = false; };
  }, [payMethod, totalPayable, kycData?.fullName, kycData?.mobile, kycData?.email, rentalData?.vehicle_code]);

  // Single authoritative PayU Initiation + Official S2S Dynamic QR for Split Online portion
  useEffect(() => {
    if (payMethod !== 'split' || onlineAmount <= 0) {
      setSplitQrString('');
      setSplitMerchantTranId('');
      setSplitCheckoutUrl('');
      return;
    }
    setPayuVerified(false);
    setSplitQrString('');
    let isMounted = true;

    api.post('/payments/payu/initiate', {
      amount: onlineAmount,
      rider_name: kycData?.fullName || 'Rider',
      mobile: kycData?.mobile || '',
      email: kycData?.email || '',
      notes: `Split Online PayU - ${rentalData?.vehicle_code || 'Rental'}`,
      purpose: 'ride'
    })
      .then((res: any) => {
        if (!isMounted) return;
        const data = res?.data || res;
        const txId = data?.txnid || data?.tx_id || '';
        const chkUrl = data?.checkout_url || '';
        const qrStr = data?.qrString || data?.upi_string || '';
        setSplitMerchantTranId(txId);
        setSplitCheckoutUrl(chkUrl);
        if (qrStr) {
          setSplitQrString(qrStr);
          return null;
        }
        return api.post('/payments/payu/qr', {
          txnid: txId,
          amount: onlineAmount,
          rider_name: kycData?.fullName || 'Rider',
          mobile: kycData?.mobile || '',
          email: kycData?.email || '',
          notes: `Split PayU QR - ${rentalData?.vehicle_code || 'Rental'}`,
          purpose: 'ride'
        });
      })
      .then((qrRes: any) => {
        if (!isMounted || !qrRes) return;
        const qrData = qrRes?.data || qrRes;
        const qrStr = qrData?.qrString || qrData?.upi_string || '';
        if (qrStr) setSplitQrString(qrStr);
      })
      .catch((err) => {
        console.error('Split PayU QR generation error:', err);
      });

    return () => { isMounted = false; };
  }, [payMethod, onlineAmount, kycData?.fullName, kycData?.mobile, kycData?.email, rentalData?.vehicle_code]);

  // Listen for PayU callback postMessage from popup/iframe and verify with backend
  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (!event?.data || event.data.type !== 'PAYU_PAYMENT_RESPONSE') return;
      const activeTxId = event.data.txnid || (payMethod === 'split' ? splitMerchantTranId : payuTxId);
      if (!activeTxId) return;
      try {
        setIsCheckingPayU(true);
        const res: any = await api.get(`/payments/payu/status/${activeTxId}`);
        const rawStatus = (res?.data?.status || res?.status || '').toUpperCase();
        if (rawStatus === 'SUCCESS') {
          setPayuVerified(true);
          setShowPayuPopup(false);
        }
      } catch (_) {
      } finally {
        setIsCheckingPayU(false);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [payMethod, payuTxId, splitMerchantTranId]);

  // Automated real-time authoritative PayU payment status polling
  useEffect(() => {
    const activeTxId = payMethod === 'split' ? splitMerchantTranId : payuTxId;
    if (!activeTxId || payuVerified) return;

    let isMounted = true;

    const checkPayUStatus = async () => {
      if (!isMounted || payuVerified) return;
      try {
        setIsCheckingPayU(true);
        const res: any = await api.get(`/payments/payu/status/${activeTxId}`);
        if (!isMounted) return;
        const rawStatus = (res?.data?.status || res?.status || '').toUpperCase();
        if (rawStatus === 'SUCCESS') {
          setPayuVerified(true);
          setShowPayuPopup(false);
        }
      } catch (e) {
        // Continue quietly
      } finally {
        if (isMounted) setIsCheckingPayU(false);
      }
    };

    const timeout = setTimeout(checkPayUStatus, 1500);
    const interval = setInterval(checkPayUStatus, 2500);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [payMethod, payuTxId, splitMerchantTranId, payuVerified]);

  // Open PayU Checkout in centered Popup Window + In-Page Popup Modal
  const openPayuCheckoutPopup = (url: string) => {
    setPopupCheckoutUrl(url);
    setShowPayuPopup(true);
    const width = 520;
    const height = 680;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = Math.max(0, Math.round((window.screen.height - height) / 2));
    window.open(
      url,
      'PayUCheckoutPopup',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
  };

  // Authoritative PayU Checkout Launcher via primary CTA
  const handleInitiatePayUCheckout = async () => {
    const targetAmount = payMethod === 'split' ? onlineAmount : totalPayable;
    if (targetAmount <= 0) return;

    try {
      setIsCheckingPayU(true);
      const existingUrl = payMethod === 'split' ? splitCheckoutUrl : payuCheckoutUrl;
      if (existingUrl) {
        openPayuCheckoutPopup(existingUrl);
        return;
      }

      const res: any = await api.post('/payments/payu/initiate', {
        amount: targetAmount,
        rider_name: kycData?.fullName || 'Rider',
        mobile: kycData?.mobile || '',
        email: kycData?.email || '',
        notes: `EV Ride ${rentalData?.vehicle_code || 'Rental'}`,
        purpose: 'ride'
      });
      const data = res?.data || res;
      const txId = data?.txnid || data?.tx_id || '';
      const chkUrl = data?.checkout_url || '';
      const qrStr = data?.qrString || data?.upi_string || '';
      if (txId) {
        if (payMethod === 'split') {
          setSplitMerchantTranId(txId);
          if (qrStr) setSplitQrString(qrStr);
        } else {
          setPayuTxId(txId);
          if (qrStr) setPayuQrString(qrStr);
        }
      }
      if (chkUrl) {
        if (payMethod === 'split') setSplitCheckoutUrl(chkUrl);
        else setPayuCheckoutUrl(chkUrl);
        openPayuCheckoutPopup(chkUrl);
      }
    } catch (e: any) {
      alert('PayU payment initiation failed: ' + (e?.message || 'Network error'));
    } finally {
      setIsCheckingPayU(false);
    }
  };

  // Coupon validation against backend coupons
  const applyCode = (codeToApply?: string) => {
    const clean = (codeToApply || coupon).trim().toUpperCase();
    if (!clean) return;
    setCouponError('');

    const found = couponsList.find((c: any) => (c.code || '').toUpperCase() === clean);
    if (!found) {
      setCouponError(`Coupon "${clean}" is invalid. Please use a registered coupon code.`);
      setCouponApplied(false);
      setDiscount(0);
      return;
    }

    const minAmount = Number(found.min_order_amount || found.min_order || found.min_amount || 0);
    if (baseRent < minAmount) {
      setCouponError(`Coupon "${clean}" requires a minimum rental of ₹${minAmount}. Current rent is ₹${baseRent}.`);
      setCouponApplied(false);
      setDiscount(0);
      return;
    }

    let disc = 0;
    if (found.discount_type === 'percent' || found.type === 'percent') {
      const pct = Number(found.discount_value || found.discount || 0);
      disc = Math.round((baseRent * pct) / 100);
      if (found.max_discount_amount) {
        disc = Math.min(disc, Number(found.max_discount_amount));
      }
    } else {
      disc = Number(found.discount_value || found.discount || 0);
    }

    disc = Math.min(baseRent, Math.max(0, disc));
    setCoupon(clean);
    setDiscount(disc);
    setCouponApplied(true);
    setCouponError('');
  };

  const removeCode = () => {
    setCouponApplied(false);
    setCoupon('');
    setDiscount(0);
    setCouponError('');
  };

  const canContinue = () => {
    if (payMethod === 'payu') return payuVerified;
    if (payMethod === 'split') return onlineAmount === 0 || payuVerified;
    if (payMethod === 'cash') return true;
    return false;
  };

  const handleNextStep = () => {
    if (!canContinue()) return;
    const paymentData = {
      pay_method: payMethod,
      coupon: couponApplied ? coupon : '',
      discount,
      deposit,
      gst: 0,
      base_rent: baseRent,
      subtotal: baseRent,
      total_payable: totalPayable,
      cash_amount: payMethod === 'split' ? clampedCash : (payMethod === 'cash' ? totalPayable : 0),
      online_amount: payMethod === 'split' ? onlineAmount : (payMethod === 'payu' ? totalPayable : 0),
      staff_collector: staffCollector,
      cash_receipt: cashReceipt,
      payu_tx_id: payMethod === 'split' ? splitMerchantTranId : payuTxId,
      payu_verified: payuVerified,
    };
    localStorage.setItem('evegah_new_ride_payment', JSON.stringify(paymentData));
    router.push('/new-rider/documents');
  };

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
                <p className="nr-sub">Register a new ride for the rider</p>
              </div>
              <Link href="/renters" className="nr-back-btn"><ILeft /> Back to Rides</Link>
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

            {/* 2-col outer layout */}
            <div className="nr-layout">

              {/* LEFT COLUMN */}
              <div>
                {/* Main Card */}
                <div className="nr-card">
                  {/* Card Header */}
                  <div className="nr-card-hdr">
                    <div>
                      <h2>Step 3: Payment &amp; Charges</h2>
                      <p>Collect payment and review applicable charges (Zero GST).</p>
                    </div>
                  </div>

                  {/* Inner 2-col grid */}
                  <div className="pm-inner">

                    {/* ── LEFT INNER — method + summary ── */}
                    <div className="pm-left">

                      {/* 1. Payment Method */}
                      <div className="pm-sec-hd">1. Select Payment Method</div>
                      <div className="pm-tabs">
                        {PAY_TABS.map(t => (
                          <button
                            key={t.id}
                            className={`pm-tab ${payMethod === t.id ? 'sel' : ''}`}
                            onClick={() => {
                              setPayMethod(t.id);
                              setPayuVerified(false);
                            }}
                          >
                            <span className="pm-tab-ic">{t.icon}</span>
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Conditional input */}
                      <MethodDetail
                        method={payMethod}
                        totalPayable={totalPayable}
                        cashAmount={cashAmount}
                        setCashAmount={setCashAmount}
                        onlineAmount={onlineAmount}
                        staffCollector={staffCollector}
                        setStaffCollector={setStaffCollector}
                        cashReceipt={cashReceipt}
                        setCashReceipt={setCashReceipt}
                        payuQrString={payuQrString}
                        payuTxId={payuTxId}
                        payuVerified={payuVerified}
                        isCheckingPayU={isCheckingPayU}
                        splitQrString={splitQrString}
                        splitMerchantTranId={splitMerchantTranId}
                      />

                      {/* 2. Payment Summary */}
                      <div className="pm-sum-hd" style={{ marginTop: 16 }}>
                        2. Payment Summary
                      </div>
                      <div className="pm-sum-row">
                        <span className="pm-sum-label">Plan Charges ({rentalData?.plan_type || 'Selected Plan'})</span>
                        <span className="pm-sum-val">₹{baseRent.toFixed(2)}</span>
                      </div>
                      <div className="pm-sum-row">
                        <span className="pm-sum-label">
                          Refundable Security Deposit
                          <span className="pm-sum-info" title="100% Refundable"><IInfo s={13} /></span>
                        </span>
                        <span className="pm-sum-val">₹{deposit.toFixed(2)}</span>
                      </div>
                      <div className="pm-sum-row">
                        <span className="pm-sum-label">
                          Accessories
                          <span className="pm-sum-info"><IInfo s={13} /></span>
                        </span>
                        <span className="pm-sum-val">₹0.00</span>
                      </div>
                      {couponApplied && (
                        <div className="pm-sum-row">
                          <span className="pm-sum-label" style={{ color: '#16A34A' }}>Coupon Discount ({coupon.toUpperCase()})</span>
                          <span className="pm-sum-val" style={{ color: '#16A34A' }}>- ₹{discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="pm-total-row">
                        <span className="pm-total-label">Total Payable</span>
                        <span className="pm-total-val">₹{totalPayable.toFixed(2)}</span>
                      </div>

                      {/* Deposit note */}
                      <div className="pm-dep-note">
                        <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}><IShield /></span>
                        Security deposit of ₹{deposit.toFixed(2)} is 100% refundable after the vehicle is returned in good condition. Zero GST applied.
                      </div>
                    </div>

                    {/* ── RIGHT INNER — coupon + breakdown ── */}
                    <div className="pm-right">

                      {/* 3. Apply Coupon */}
                      <div className="pm-sec-hd">3. Apply Coupon (Optional)</div>
                      {!couponApplied ? (
                        <>
                          <div className="pm-coupon-wrap">
                            <input
                              className="pm-coupon-inp"
                              placeholder="Enter coupon code"
                              value={coupon}
                              onChange={e => {
                                setCoupon(e.target.value);
                                setCouponError('');
                              }}
                              onKeyDown={e => e.key === 'Enter' && applyCode()}
                            />
                            <button className="pm-coupon-btn" onClick={() => applyCode()}>Apply</button>
                          </div>
                          {couponError && <div className="pm-coupon-err">{couponError}</div>}
                        </>
                      ) : (
                        <div className="pm-coupon-ok">
                          <span style={{ color: '#16A34A', display: 'flex' }}><ICheck s={14} /></span>
                          Coupon <strong style={{ margin: '0 4px' }}>{coupon.toUpperCase()}</strong> applied! (-₹{discount.toFixed(2)})
                          <button className="pm-coupon-rm" onClick={removeCode}>Remove</button>
                        </div>
                      )}

                      {/* Charges Breakdown */}
                      <div className="pm-bk-hd">Charges Breakdown</div>
                      {[
                        { l: 'Plan', v: `${rentalData?.plan_type || 'Daily Plan'} (${durationDays} Day${durationDays > 1 ? 's' : ''})` },
                        { l: 'Vehicle', v: vehicleDisplayName },
                        { l: 'Battery', v: batteryDisplayId },
                        { l: 'Plan Rate', v: `₹${baseRent.toFixed(2)}` },
                        { l: 'Expected Duration', v: `${durationDays} Day${durationDays > 1 ? 's' : ''}` },
                      ].map(r => (
                        <div key={r.l} className="pm-bk-row">
                          <span className="pm-bk-label">{r.l}</span>
                          <span className="pm-bk-val">{r.v}</span>
                        </div>
                      ))}

                      {/* Includes */}
                      <div className="pm-inc-hd">Includes</div>
                      {[
                        'Unlimited kms',
                        'Battery swap included',
                        'Roadside assistance',
                        'Maintenance & insurance support',
                      ].map(inc => (
                        <div key={inc} className="pm-inc-row">
                          <span className="pm-inc-ic" style={{ color: '#22C55E' }}><ICheck s={14} /></span>
                          {inc}
                        </div>
                      ))}
                    </div>

                  </div>{/* end pm-inner */}
                </div>{/* end nr-card */}

                {/* Footer Actions */}
                <div className="nr-footer-actions">
                  <Link href="/new-rider/rental" className="nr-prev-btn"><ILeft /> Previous</Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {!canContinue() && (payMethod === 'payu' || payMethod === 'split') && (
                      <button
                        type="button"
                        className="nr-continue-btn"
                        onClick={handleInitiatePayUCheckout}
                        disabled={isCheckingPayU || totalPayable <= 0}
                        style={{
                          background: '#2A195C',
                          opacity: isCheckingPayU ? 0.75 : 1,
                          cursor: isCheckingPayU ? 'wait' : 'pointer',
                        }}
                      >
                        {isCheckingPayU
                          ? 'Verifying with PayU...'
                          : payMethod === 'split'
                          ? `Pay ₹${onlineAmount.toFixed(2)} via PayU Popup`
                          : `Pay ₹${totalPayable.toFixed(2)} via PayU Popup`}
                        <IArr s={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="nr-continue-btn"
                      disabled={!canContinue()}
                      onClick={handleNextStep}
                    >
                      Continue to Documents
                      <IArr s={12} />
                    </button>
                  </div>
                </div>

              </div>{/* end left col */}

              {/* RIGHT PANEL */}
              <RightPanel rentalData={rentalData} discount={discount} totalPayable={totalPayable} />

            </div>
          </div>
        </div>
      </div>

      {/* PayU Popup Checkout Overlay Modal */}
      {showPayuPopup && popupCheckoutUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: 480,
              borderRadius: 18,
              boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Popup Header */}
            <div
              style={{
                background: '#2A195C',
                color: '#fff',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  P
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>PayU India Secure Checkout</div>
                  <div style={{ fontSize: 11, color: '#DDD6FE' }}>
                    Txn: {payMethod === 'split' ? splitMerchantTranId : payuTxId} • ₹{(payMethod === 'split' ? onlineAmount : totalPayable).toFixed(2)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayuPopup(false)}
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  border: 'none',
                  color: '#fff',
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            {/* Popup Body */}
            <div style={{ padding: '22px 24px', textAlign: 'center' }}>
              {(payMethod === 'split' ? splitQrString : payuQrString) && (
                <div
                  style={{
                    display: 'inline-flex',
                    padding: 12,
                    background: '#fff',
                    borderRadius: 12,
                    border: '1.5px solid #86EFAC',
                    boxShadow: '0 4px 14px rgba(5,150,105,0.1)',
                    marginBottom: 12,
                  }}
                >
                  <QRCodeSVG
                    value={payMethod === 'split' ? splitQrString : payuQrString}
                    size={180}
                    level="M"
                  />
                </div>
              )}

              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                Pay ₹{(payMethod === 'split' ? onlineAmount : totalPayable).toFixed(2)}
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, marginBottom: 16 }}>
                Complete payment in the PayU popup window or scan the official PayU Dynamic UPI QR above.
              </div>

              <div
                className="icici-pulse-badge"
                style={{
                  background: '#F0FDF4',
                  borderColor: '#BBF7D0',
                  color: '#047857',
                  marginBottom: 16,
                }}
              >
                <span className="payu-pulse-dot" />
                <span>
                  {isCheckingPayU
                    ? 'Checking authoritative status with PayU Server...'
                    : 'Waiting for PayU payment confirmation...'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    const width = 520;
                    const height = 680;
                    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
                    const top = Math.max(0, Math.round((window.screen.height - height) / 2));
                    window.open(
                      popupCheckoutUrl,
                      'PayUCheckoutPopup',
                      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
                    );
                  }}
                  style={{
                    flex: 1,
                    padding: '11px 14px',
                    background: '#2A195C',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Re-open PayU Popup ↗
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayuPopup(false)}
                  style={{
                    padding: '11px 16px',
                    background: '#F1F5F9',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
