'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

/* ──────────────────────────────────────────────────────────────
   STEP 2 · RENTAL DETAILS — pixel-perfect
   ────────────────────────────────────────────────────────────── */



const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ── shell & layout ── */
.nr-shell { display: flex; min-height: 100vh; background: #F3F4F9; font-family: Inter, sans-serif; }
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
  box-shadow: 0 1px 3px rgba(0,0,0,.06); transition: border-color .15s, color .15s; flex-shrink: 0;
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

/* ── card shell ── */
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

/* ── 3-column panel grid ── */
.rd-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; }
.rd-panel { padding: 20px 22px; }
.rd-panel:not(:last-child) { border-right: 1px solid #F3F4F6; }

/* panel header */
.rd-ph { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.rd-ph-title { font-size: 13px; font-weight: 700; color: #374151; }
.rd-avail {
  background: #DCFCE7; color: #16A34A; border: 1px solid #BBF7D0;
  border-radius: 6px; font-size: 11px; font-weight: 700; padding: 3px 10px;
}

/* image area */
.rd-img-wrap { display: flex; justify-content: center; align-items: center; min-height: 110px; margin-bottom: 12px; }

/* vehicle name + type */
.rd-veh-name { font-size: 14.5px; font-weight: 800; color: #111827; margin-bottom: 2px; }
.rd-veh-type { font-size: 12px; color: #6B7280; margin-bottom: 14px; }

/* spec rows */
.rd-spec { display: flex; align-items: center; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #F9FAFB; font-size: 12.5px; }
.rd-spec:last-child { border-bottom: none; }
.rd-spec-l { color: #6B7280; }
.rd-spec-v { font-weight: 600; color: #111827; }

/* change dropdown */
.rd-chg-sel {
  width: 100%; margin-top: 14px; padding: 9px 13px;
  border: 1.5px solid #E5E7EB; border-radius: 9px;
  font-size: 13px; color: #374151; font-family: inherit; cursor: pointer;
  outline: none; background: #fff; transition: border-color .15s;
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;
  box-sizing: border-box;
}
.rd-chg-sel:focus { border-color: #2a195c; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }

/* plan panel */
.rd-plan-sel {
  width: 100%; padding: 9px 13px; border: 1.5px solid #E5E7EB; border-radius: 9px;
  font-size: 13px; color: #111827; font-family: inherit; cursor: pointer;
  outline: none; background: #fff; transition: border-color .15s;
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;
  box-sizing: border-box; font-weight: 600; margin-bottom: 12px;
}
.rd-plan-sel:focus { border-color: #2a195c; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.rd-price-box { background: #FAFAFF; border: 1px solid #E0E7FF; border-radius: 10px; padding: 14px 16px; margin-bottom: 14px; }
.rd-price-amount { font-size: 22px; font-weight: 800; color: #111827; line-height: 1.1; }
.rd-price-unit { font-size: 13px; color: #6B7280; font-weight: 500; }
.rd-price-from { font-size: 12px; color: #9CA3AF; margin-top: 4px; }
.rd-feature { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #374151; margin-bottom: 8px; }
.rd-feature-ic-green { color: #22C55E; display: flex; flex-shrink: 0; }
.rd-feature-ic-amber { color: #F59E0B; display: flex; flex-shrink: 0; }
.rd-view-plans { font-size: 12.5px; color: #2a195c; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; border: none; background: none; font-family: inherit; padding: 0; margin-top: 6px; text-decoration: none; }
.rd-view-plans:hover { text-decoration: underline; }

/* ── Ride Timing card ── */
.rd-timing-hdr { display: flex; align-items: flex-start; gap: 10px; padding: 18px 24px 14px; border-bottom: 1px solid #F3F4F6; }
.rd-timing-hdr-ic { color: #2a195c; display: flex; flex-shrink: 0; margin-top: 1px; }
.rd-timing-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 3px; }
.rd-timing-sub { font-size: 12.5px; color: #6B7280; }
.rd-timing-body { padding: 20px 24px; }
.rd-timing-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 20px; align-items: end; }
.rd-fld label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 7px; }
.rd-fld .req { color: #EF4444; margin-left: 2px; }
.rd-dt-row { display: grid; grid-template-columns: 1fr auto; gap: 10px; }
.nr-inp {
  width: 100%; padding: 10px 13px; border: 1.5px solid #E5E7EB; border-radius: 9px;
  font-size: 13px; color: #111827; font-family: inherit; outline: none;
  transition: border-color .15s, box-shadow .15s; background: #fff; box-sizing: border-box;
}
.nr-inp::placeholder { color: #9CA3AF; }
.nr-inp:focus { border-color: #2a195c; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.nr-inp-wrap { position: relative; }
.nr-inp-wrap .nr-inp { padding-right: 36px; }
.nr-inp-wrap-ic { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; display: flex; }
.rd-dur-box {
  background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 12px;
  padding: 14px 20px; text-align: center; min-width: 115px;
}
.rd-dur-lbl { font-size: 11px; color: #6B7280; margin-bottom: 5px; font-weight: 500; }
.rd-dur-val { font-size: 22px; font-weight: 800; color: #2a195c; line-height: 1.1; }
.rd-dur-sub { font-size: 11.5px; color: #9CA3AF; margin-top: 3px; }
.rd-timing-note {
  display: flex; align-items: flex-start; gap: 10px;
  background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px;
  padding: 11px 16px; margin-top: 16px; font-size: 12.5px; color: #1D4ED8; line-height: 1.5;
}

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
  padding: 11px 28px; background: linear-gradient(135deg, #2a195c 0%, #4338CA 100%); border: none;
  border-radius: 10px; font-size: 13px; font-weight: 700; color: #fff;
  cursor: pointer; font-family: inherit; transition: all .22s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(42, 25, 92, 0.25);
  text-decoration: none;
}
.nr-continue-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(42, 25, 92, 0.32); }
.nr-continue-btn:disabled {
  background: #CBD5E1; color: #64748B; cursor: not-allowed; box-shadow: none; opacity: 0.75;
}
@keyframes nrFadeSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.nr-card, .nr-rp-card, .nr-stepper {
  animation: nrFadeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* ─── RIGHT PANEL ─── */
.nr-rp { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }
.nr-rp-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden; }
.nr-rp-hdr  { display: flex; align-items: center; gap: 9px; padding: 14px 18px; border-bottom: 1px solid #E5E7EB; }
.nr-rp-hdr-ic { display: flex; align-items: center; flex-shrink: 0; }
.nr-rp-title  { font-size: 13.5px; font-weight: 700; color: #111827; }
.nr-sum-body  { padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 7px; }
.nr-sum-row   { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; font-size: 13px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; }
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
.nr-help-btn  { width: 100%; padding: 10px; background: #2a195c; color: #fff; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: background .15s; }
.nr-help-btn:hover { background: #4338CA; }
`;

/* ── SVG icons ── */
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
const IClock = ({ s = 16 }: { s?: number }) => <SV s={s}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></SV>;
const ICal = ({ s = 14 }: { s?: number }) => <SV s={s}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></SV>;

/* ── Scooter SVG ── */
const ScooterSVG = () => (
  <svg viewBox="0 0 260 170" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 190, height: 'auto' }}>
    <ellipse cx="128" cy="162" rx="98" ry="5" fill="#E5E7EB" />
    {/* Rear wheel */}
    <circle cx="52" cy="126" r="34" fill="#1F2937" />
    <circle cx="52" cy="126" r="24" fill="#374151" />
    <circle cx="52" cy="126" r="13" fill="#6B7280" />
    <circle cx="52" cy="126" r="5" fill="#9CA3AF" />
    {[0, 60, 120, 180, 240, 300].map(a => (
      <line key={a} x1={52 + 13 * Math.cos(a * Math.PI / 180)} y1={126 + 13 * Math.sin(a * Math.PI / 180)} x2={52 + 24 * Math.cos(a * Math.PI / 180)} y2={126 + 24 * Math.sin(a * Math.PI / 180)} stroke="#9CA3AF" strokeWidth="1.5" />
    ))}
    {/* Front wheel */}
    <circle cx="206" cy="126" r="34" fill="#1F2937" />
    <circle cx="206" cy="126" r="24" fill="#374151" />
    <circle cx="206" cy="126" r="13" fill="#6B7280" />
    <circle cx="206" cy="126" r="5" fill="#9CA3AF" />
    {[0, 60, 120, 180, 240, 300].map(a => (
      <line key={a} x1={206 + 13 * Math.cos(a * Math.PI / 180)} y1={126 + 13 * Math.sin(a * Math.PI / 180)} x2={206 + 24 * Math.cos(a * Math.PI / 180)} y2={126 + 24 * Math.sin(a * Math.PI / 180)} stroke="#9CA3AF" strokeWidth="1.5" />
    ))}
    {/* Main body */}
    <path d="M52 92 L80 44 L168 37 L210 92 Z" fill="#2a195c" />
    {/* Rear section */}
    <path d="M52 92 L80 44 L88 44 L67 92 Z" fill="#3730A3" />
    {/* Front section */}
    <path d="M168 37 L210 85 L210 92 L202 92 L178 54 L160 37 Z" fill="#3730A3" />
    {/* Seat */}
    <path d="M100 40 L166 35 L164 27 L98 33 Z" fill="#1E1B4B" rx="3" />
    {/* Handle stem */}
    <rect x="199" y="46" width="7" height="48" fill="#374151" rx="3" />
    {/* Handlebars */}
    <rect x="188" y="44" width="24" height="7" fill="#374151" rx="3.5" />
    <rect x="184" y="40" width="7" height="14" fill="#374151" rx="3.5" />
    <rect x="203" y="40" width="7" height="14" fill="#374151" rx="3.5" />
    {/* Windscreen */}
    <path d="M168 37 L186 46 L193 62 L177 55 Z" fill="#BFDBFE" opacity="0.55" />
    {/* Headlight */}
    <ellipse cx="205" cy="84" rx="11" ry="8" fill="#FEF9C3" />
    <ellipse cx="205" cy="84" rx="7" ry="5" fill="#FEF08A" />
    {/* Rear light */}
    <rect x="52" y="76" width="8" height="11" rx="3" fill="#FCA5A5" />
    {/* Footboard */}
    <rect x="95" y="93" width="112" height="10" fill="#374151" rx="2" />
    {/* Body panel */}
    <path d="M108 60 L162 55 L166 74 L108 80 Z" fill="#3730A3" opacity="0.45" />
    {/* Logo */}
    <text x="136" y="70" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle" opacity="0.9">EVEGAH CITY</text>
    {/* Kickstand */}
    <rect x="155" y="103" width="4" height="22" fill="#6B7280" rx="2" transform="rotate(8 155 103)" />
  </svg>
);

/* ── Battery SVG ── */
const BatterySVG = () => (
  <svg viewBox="0 0 110 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 'auto', height: 110, margin: '0 auto', display: 'block' }}>
    <rect x="18" y="28" width="74" height="122" rx="10" fill="#1F2937" />
    <rect x="21" y="31" width="68" height="116" rx="8" fill="#111827" />
    {/* Terminal */}
    <rect x="40" y="16" width="30" height="16" rx="5" fill="#374151" />
    <rect x="44" y="10" width="22" height="8" rx="3" fill="#4B5563" />
    {/* Cells */}
    <rect x="27" y="44" width="56" height="14" rx="3" fill="#22C55E" />
    <rect x="27" y="63" width="56" height="14" rx="3" fill="#22C55E" />
    <rect x="27" y="82" width="56" height="14" rx="3" fill="#22C55E" />
    <rect x="27" y="101" width="56" height="14" rx="3" fill="#16A34A" opacity="0.6" />
    <rect x="27" y="120" width="56" height="14" rx="3" fill="#4B5563" />
    {/* Separator lines */}
    <line x1="27" y1="58" x2="83" y2="58" stroke="#374151" strokeWidth="0.8" />
    <line x1="27" y1="77" x2="83" y2="77" stroke="#374151" strokeWidth="0.8" />
    <line x1="27" y1="96" x2="83" y2="96" stroke="#374151" strokeWidth="0.8" />
    <line x1="27" y1="115" x2="83" y2="115" stroke="#374151" strokeWidth="0.8" />
    {/* Lightning bolt */}
    <path d="M60 60 L48 78 L58 78 L50 96 L68 76 L58 76 L66 60 Z" fill="#FCD34D" />
    {/* Label */}
    <text x="55" y="148" textAnchor="middle" fontFamily="Arial" fontSize="8.5" fontWeight="bold" fill="#6B7280">60V / 30Ah</text>
  </svg>
);

/* ── Stepper ── */
const STEPS = [
  { n: 1, label: 'KYC Verification', stat: 'Completed', state: 'done' },
  { n: 2, label: 'Rental Details', stat: 'In Progress', state: 'active' },
  { n: 3, label: 'Payment & Charges', stat: 'Pending', state: 'pend' },
  { n: 4, label: 'Documents', stat: 'Pending', state: 'pend' },
  { n: 5, label: 'Review & Confirm', stat: 'Pending', state: 'pend' },
];

/* ── Right Panel ── */
function RightPanel({ 
  zoneName, vehicleCode, vehicleModel, batteryName, planName, planPrice, depositAmount, durationDays 
}: { 
  zoneName: string; vehicleCode: string; vehicleModel: string; batteryName: string; planName: string; planPrice: number; depositAmount: number; durationDays: number; 
}) {
  const subtotal = planPrice || 0;
  const deposit = Number(depositAmount ?? 0);
  const total = subtotal + deposit;

  return (
    <div className="nr-rp">
      {/* Rental Summary */}
      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: '#2a195c' }}><IReceipt /></span>
          <div className="nr-rp-title">Rental Summary</div>
        </div>
        <div className="nr-sum-body">
          {[
            { l: 'Assigned Zone', v: zoneName || 'Gotri Zone' },
            { l: 'Vehicle Number', v: vehicleCode || 'Not selected' },
            { l: 'Vehicle Model', v: vehicleModel || 'Evegah City' },
            { l: 'Swappable Battery', v: batteryName || 'Evegah 60V 30Ah' },
            { l: 'Rental Package', v: planName || 'Daily Pass' },
            { l: 'Package Duration', v: `${durationDays} ${durationDays === 1 ? 'Day' : 'Days'}` },
            { l: 'Rental Rent Price', v: `₹${subtotal.toFixed(2)}` },
            { l: 'Refundable Security Deposit', v: `₹${deposit.toFixed(2)}` },
          ].map(r => (
            <div key={r.l} className="nr-sum-row">
              <span className="nr-sum-label">{r.l}</span>
              <span className="nr-sum-val" style={{ textAlign: 'right', fontWeight: r.l.includes('Deposit') ? 700 : 500 }}>{r.v}</span>
            </div>
          ))}
          <div className="nr-sum-divider" />
          <div className="nr-sum-total">
            <span className="nr-sum-total-l">Est. Total Payable</span>
            <span className="nr-sum-total-r">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: '#D97706' }}><IInfo s={14} /></span>
          <div className="nr-rp-title">Zone &amp; Deposit Policy</div>
        </div>
        <div className="nr-imp-body">
          {[
            'Vehicles and batteries are automatically filtered per assigned zone.',
            'Security Deposit is 100% refundable upon vehicle return in good condition.',
            'Rental package rates and deposits are synced directly with Zone Pricing API.',
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
          <div className="nr-help-sub">Facing issues with rental details?</div>
          <button className="nr-help-btn">Contact Support</button>
        </div>
      </div>
    </div>
  );
}

const VEHICLE_MODELS = {
  city: {
    name: 'Evegah City',
    type: 'Electric Scooter',
    image: '/City-1.png',
    specs: [
      { l: 'Top Speed', v: '45 km/h' },
      { l: 'Range', v: '80 km/charge' },
    ],
  },
  mink: {
    name: 'Evegah Mink',
    type: 'Electric Scooter',
    image: '/mink.png',
    specs: [
      { l: 'Top Speed', v: '30 km/h' },
      { l: 'Range', v: '70 km/charge' },
    ],
  },
  pro: {
    name: 'Evegah Pro',
    type: 'Electric Scooter',
    image: '/pro-1.png',
    specs: [
      { l: 'Top Speed', v: '75 km/h' },
      { l: 'Range', v: '120 km/charge' },
    ],
  },
  fly: {
    name: 'Evegah Fly',
    type: 'Electric Cycle',
    image: '/fly-1.png',
    specs: [
      { l: 'Top Speed', v: '25 km/h' },
      { l: 'Range', v: '60 km/charge' },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
const IPin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

function normalizeModel(m: string): string {
  if (!m) return 'Evegah City';
  const l = m.toLowerCase().trim();
  if (l.includes('mink')) return 'Evegah Mink';
  if (l.includes('city')) return 'Evegah City';
  if (l.includes('pro')) return 'Evegah Pro';
  if (l.includes('fly')) return 'Evegah Fly';
  return m;
}

export default function RentalDetailsPage() {
  const router = useRouter();

  // Zone allocation state (synced with top header & role)
  const [zonesCatalog, setZonesCatalog] = useState<any[]>([]);
  const zonesCatalogRef = useRef<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [activeZoneName, setActiveZoneName] = useState<string>('Gotri Zone');

  // Dynamic available models connected with assigned vehicles in the selected zone
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModelName, setSelectedModelName] = useState('Evegah City');
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [selectedVehicleCode, setSelectedVehicleCode] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Batteries allocated to zone
  const [batteriesList, setBatteriesList] = useState<any[]>([]);
  const [selectedBatteryId, setSelectedBatteryId] = useState('');

  // Zone Pricing & Rental Packages
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  // Timing
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Format current local time HH:MM AM/PM
  const getCurrentTimeFormatted = () => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  };

  const [startDate, setStartDate] = useState(todayStr);
  const [startTime, setStartTime] = useState(getCurrentTimeFormatted());
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState(getCurrentTimeFormatted());
  const [totalDays, setTotalDays] = useState(1);

  // Handle direct zone switch from on-page dropdown or header
  const handleZoneChange = (zoneName: string) => {
    if (!zoneName || zoneName === 'All Zones') return;
    const zones = zonesCatalogRef.current.length > 0 ? zonesCatalogRef.current : zonesCatalog;
    const matched = zones.find((z: any) =>
      (z.name || '').toLowerCase() === zoneName.toLowerCase() ||
      (z.name || '').toLowerCase().includes(zoneName.toLowerCase()) ||
      zoneName.toLowerCase().includes((z.name || '').toLowerCase())
    );
    if (matched) {
      setSelectedZone(matched);
      setActiveZoneName(matched.name);
      if (typeof window !== 'undefined') {
        localStorage.setItem('evegah_active_zone', matched.name);
        localStorage.setItem('evegah_selected_zone', matched.name);
        window.dispatchEvent(new Event('evegah_active_zone_changed'));
        window.dispatchEvent(new Event('evegah_zone_changed'));
      }
    }
  };

  // Sync active zone from header / localStorage (role-aware & real-time)
  const syncZoneFromStorage = (catalog?: any[]) => {
    if (typeof window === 'undefined') return;
    const zones = (catalog && catalog.length > 0)
      ? catalog
      : (zonesCatalogRef.current.length > 0 ? zonesCatalogRef.current : zonesCatalog);
    if (!zones || zones.length === 0) return;

    const storedActive = localStorage.getItem('evegah_active_zone');
    const storedSelected = localStorage.getItem('evegah_selected_zone');
    const userAssignedZone = localStorage.getItem('evegah_user_zone');

    let targetZoneName = '';
    if (storedActive && storedActive !== 'All Zones') {
      targetZoneName = storedActive;
    } else if (storedSelected && storedSelected !== 'All Zones') {
      targetZoneName = storedSelected;
    } else if (userAssignedZone) {
      targetZoneName = userAssignedZone;
    } else {
      targetZoneName = zones[0]?.name || 'Gotri Zone';
    }

    const matched = zones.find((z: any) =>
      (z.name || '').toLowerCase() === targetZoneName.toLowerCase() ||
      (z.name || '').toLowerCase().includes(targetZoneName.toLowerCase()) ||
      targetZoneName.toLowerCase().includes((z.name || '').toLowerCase())
    ) || zones[0];

    if (matched) {
      setActiveZoneName(matched.name);
      setSelectedZone(matched);
    }
  };

  // Load all zones catalog and listen for top header zone changes
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/zones`)
      .then(res => res.json())
      .then(res => {
        const data = (res && res.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
        // Operational zones only (Evegah Service Center is strictly excluded)
        const operationalZones = data.filter((z: any) => {
          const t = (z.type || '').toLowerCase();
          const n = (z.name || '').toLowerCase();
          return !t.includes('service zone') && !t.includes('maintenance hub') && !n.includes('service center');
        });
        const finalZones = operationalZones;
        if (finalZones.length > 0) {
          zonesCatalogRef.current = finalZones;
          setZonesCatalog(finalZones);
          syncZoneFromStorage(finalZones);
        }
      }).catch(() => {});

    const onZoneChange = () => syncZoneFromStorage();
    window.addEventListener('evegah_active_zone_changed', onZoneChange);
    window.addEventListener('evegah_zone_changed', onZoneChange);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', onZoneChange);
      window.removeEventListener('evegah_zone_changed', onZoneChange);
    };
  }, []);

  // 1. When selectedZone changes, load available vehicles & derive available models
  useEffect(() => {
    if (!selectedZone) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    setLoadingVehicles(true);

    // Fetch available vehicles for this zone
    fetch(`${apiUrl}/vehicles?zone=${encodeURIComponent(selectedZone.name)}&status=Available`)
      .then(res => res.json())
      .then(res => {
        const vData = (res && res.data && Array.isArray(res.data)) ? res.data : [];
        const availableOnly = vData.filter((v: any) => {
          const vStatus = (v.vehicle_status || v.status || '').toLowerCase();
          return !['in ride', 'active', 'rented', 'maintenance', 'offline'].includes(vStatus);
        });

        setVehiclesList(availableOnly);

        // Derive models strictly from available vehicles in this assigned zone
        const modelsWithVehicles: string[] = Array.from(new Set<string>(
          availableOnly
            .map((v: any) => normalizeModel(v.evegah_model_name || v.vehicle_model))
            .filter(Boolean)
        ));

        let finalModels: string[] = modelsWithVehicles;
        // If no available vehicles, check all vehicles assigned to this zone
        if (finalModels.length === 0) {
          const allAssignedModels: string[] = Array.from(new Set<string>(
            vData
              .map((v: any) => normalizeModel(v.evegah_model_name || v.vehicle_model))
              .filter(Boolean)
          ));
          if (allAssignedModels.length > 0) {
            finalModels = allAssignedModels;
          }
        }

        // If still no vehicles, check models configured in zone pricing packages
        if (finalModels.length === 0 && selectedZone?.pricing) {
          const zPricing = selectedZone.pricing;
          const pricingModels = new Set<string>();
          if (Array.isArray(zPricing.packages)) {
            zPricing.packages.forEach((p: any) => {
              if (p.model) pricingModels.add(normalizeModel(p.model));
            });
          }
          if (zPricing.modelPackages && typeof zPricing.modelPackages === 'object') {
            Object.keys(zPricing.modelPackages).forEach((m: string) => {
              pricingModels.add(normalizeModel(m));
            });
          }
          if (pricingModels.size > 0) {
            finalModels = Array.from(pricingModels);
          }
        }

        if (finalModels.length === 0) {
          finalModels = ['Evegah City'];
        }

        setAvailableModels(finalModels);

        // Auto-select first available model if current model is not present in this zone
        setSelectedModelName(prev => (finalModels.includes(prev) ? prev : finalModels[0]));
        setLoadingVehicles(false);
      })
      .catch(() => {
        setVehiclesList([]);
        setAvailableModels(['Evegah City']);
        setLoadingVehicles(false);
      });

    // 2. Fetch batteries for this zone (Available only)
    fetch(`${apiUrl}/batteries?zone=${encodeURIComponent(selectedZone.name)}&status=available`)
      .then(res => res.json())
      .then(res => {
        const bData = Array.isArray(res) ? res : (res.data || []);
        setBatteriesList(bData);
        if (bData.length > 0) {
          setSelectedBatteryId(bData[0].battery_id || bData[0].id);
        } else {
          setSelectedBatteryId('');
        }
      }).catch(() => {
        setBatteriesList([]);
        setSelectedBatteryId('');
      });
  }, [selectedZone]);

  // 2. Filter vehicles matching current model and auto-select vehicle code
  useEffect(() => {
    const currentModelVehicles = vehiclesList.filter((v: any) =>
      normalizeModel(v.evegah_model_name || v.vehicle_model) === selectedModelName
    );

    setFilteredVehicles(currentModelVehicles);
    if (currentModelVehicles.length > 0) {
      const exists = currentModelVehicles.some((v: any) => (v.code || v.id) === selectedVehicleCode);
      if (!exists) {
        setSelectedVehicleCode(currentModelVehicles[0].code || currentModelVehicles[0].id);
        setSelectedVehicle(currentModelVehicles[0]);
      }
    } else {
      setSelectedVehicleCode('');
      setSelectedVehicle(null);
    }
  }, [selectedModelName, vehiclesList]);

  // 3. Extract model-specific packages from zone pricing
  useEffect(() => {
    if (!selectedZone) return;
    let pkgs: any[] = [];
    const zPricing = selectedZone.pricing || {};

    // Check modelPackages[selectedModelName]
    if (zPricing.modelPackages && Array.isArray(zPricing.modelPackages[selectedModelName])) {
      pkgs = zPricing.modelPackages[selectedModelName].filter((p: any) => Number(p.price) > 0);
    }

    // Check packages matching selectedModelName
    if (pkgs.length === 0 && Array.isArray(zPricing.packages)) {
      pkgs = zPricing.packages.filter((p: any) => {
        if (!p.model) return false;
        return normalizeModel(p.model) === selectedModelName && Number(p.price) > 0;
      });
    }

    // Check general packages without model
    if (pkgs.length === 0 && Array.isArray(zPricing.packages)) {
      pkgs = zPricing.packages.filter((p: any) => !p.model && Number(p.price) > 0);
    }

    // Default fallbacks if none configured in zone pricing
    if (pkgs.length === 0) {
      if (selectedModelName === 'Evegah Mink') {
        pkgs = [
          { id: 201, name: 'Daily Pass', duration: 1, price: 250, deposit: 500 },
          { id: 202, name: 'Weekly Pass', duration: 7, price: 1500, deposit: 500 },
          { id: 203, name: 'Monthly Pass', duration: 30, price: 5500, deposit: 1500 }
        ];
      } else if (selectedModelName === 'Evegah Fly') {
        pkgs = [
          { id: 401, name: 'Daily Pass', duration: 1, price: 100, deposit: 0 },
          { id: 402, name: 'Weekly Pass', duration: 7, price: 650, deposit: 0 }
        ];
      } else if (selectedModelName === 'Evegah Pro') {
        pkgs = [
          { id: 301, name: 'Daily Pass', duration: 1, price: 200, deposit: 100 },
          { id: 302, name: 'Weekly Pass', duration: 7, price: 1200, deposit: 100 }
        ];
      } else {
        pkgs = [
          { id: 101, name: 'Daily Pass', duration: 1, price: 350, deposit: 500 },
          { id: 102, name: 'Weekly Pass', duration: 7, price: 1750, deposit: 1000 },
          { id: 103, name: 'Monthly Pass', duration: 30, price: 6500, deposit: 2500 }
        ];
      }
    }

    setPackagesList(pkgs);
    setSelectedPackage(pkgs[0]);
  }, [selectedZone, selectedModelName]);

  // Auto-calculate return date & return time based on package duration
  useEffect(() => {
    if (!selectedPackage) return;
    const duration = selectedPackage.duration || 1;
    setTotalDays(duration);

    if (startDate) {
      const d = new Date(startDate);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + duration);
        setReturnDate(d.toISOString().split('T')[0]);
      }
    }
    setReturnTime(startTime);
  }, [startDate, startTime, selectedPackage]);

  const handleNextStep = () => {
    if (!selectedVehicleCode) {
      alert(`No available vehicle in ${selectedZone?.name || 'this zone'} for ${selectedModelName}. Please choose another model or change zone.`);
      return;
    }
    if (!startDate || !returnDate) {
      alert('Please specify valid start and return dates.');
      return;
    }
    const rentalData = {
      zone_name: selectedZone?.name || 'Gotri Zone',
      vehicle_code: selectedVehicleCode,
      vehicle_name: `${selectedModelName} (${selectedVehicleCode})`,
      vehicle_model: selectedModelName,
      battery_id: selectedBatteryId || 'BAT-GT-60V-01',
      plan_type: selectedPackage?.name || 'Daily Pass',
      plan_rate: Number(selectedPackage?.price || 0),
      deposit_amount: Number(selectedPackage?.deposit ?? 0),
      start_date: startDate,
      start_time: startTime,
      return_date: returnDate,
      return_time: returnTime,
      total_days: totalDays
    };
    localStorage.setItem('evegah_new_ride_rental', JSON.stringify(rentalData));
    router.push('/new-rider/payment');
  };

  const getVehicleImage = () => {
    if (selectedVehicle?.vehicle_image) return selectedVehicle.vehicle_image;
    if (selectedModelName === 'Evegah Mink') return '/Mink-1.png';
    if (selectedModelName === 'Evegah Pro') return '/pro-1.png';
    if (selectedModelName === 'Evegah Fly') return '/fly-1.png';
    return '/City-1.png';
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
                <p className="nr-sub">Register a new ride for assigned zone ({selectedZone?.name || 'Gotri Zone'})</p>
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
              <div>
                {/* ── 3-Column Selection Card ── */}
                <div className="nr-card">
                  <div className="rd-3col">

                    {/* 1. Select Vehicle (2 Tier Selection) */}
                    <div className="rd-panel">
                      <div className="rd-ph">
                        <span className="rd-ph-title">1. Select Vehicle</span>
                        <span className="rd-avail" style={{ background: filteredVehicles.length > 0 ? '#DCFCE7' : '#FEE2E2', color: filteredVehicles.length > 0 ? '#15803D' : '#B91C1C' }}>
                          {loadingVehicles ? 'Loading...' : `${filteredVehicles.length} Available`}
                        </span>
                      </div>
                      <div className="rd-img-wrap" style={{ height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: '12px', padding: '10px', marginBottom: '12px' }}>
                        <img
                          src={getVehicleImage()}
                          alt={selectedModelName}
                          style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.12))' }}
                        />
                      </div>

                      {/* Dropdown 1: Select Vehicle Model */}
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginTop: 6, display: 'block' }}>Vehicle Model</label>
                      <select 
                        className="rd-chg-sel"
                        style={{ marginBottom: 8, fontWeight: 700 }}
                        value={selectedModelName}
                        onChange={(e) => setSelectedModelName(e.target.value)}
                      >
                        {availableModels.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>

                      {/* Dropdown 2: Select Vehicles / Code */}
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block' }}>Vehicle Number</label>
                      <select
                        className="rd-chg-sel"
                        value={selectedVehicleCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          setSelectedVehicleCode(code);
                          const found = filteredVehicles.find(v => (v.code || v.id) === code);
                          if (found) setSelectedVehicle(found);
                        }}
                      >
                        {filteredVehicles.length > 0 ? (
                          filteredVehicles.map(v => (
                            <option key={v.code || v.id} value={v.code || v.id}>
                              {v.code || v.id} ({v.registration_number ? `${v.registration_number} • ` : ''}Available)
                            </option>
                          ))
                        ) : (
                          <option value="">No available {selectedModelName} in {selectedZone?.name || 'zone'}</option>
                        )}
                      </select>
                    </div>

                    {/* 2. Select Battery */}
                    <div className="rd-panel">
                      <div className="rd-ph">
                        <span className="rd-ph-title">2. Select Battery</span>
                        <span className="rd-avail" style={{ background: batteriesList.length > 0 ? '#DCFCE7' : '#FEE2E2', color: batteriesList.length > 0 ? '#15803D' : '#B91C1C' }}>
                          {batteriesList.length > 0 ? `${batteriesList.length} Assigned` : 'No Battery'}
                        </span>
                      </div>
                      <div className="rd-img-wrap">
                        <BatterySVG />
                      </div>
                      <div className="rd-veh-name">{selectedBatteryId || 'No Battery Allocated'}</div>
                      <div className="rd-veh-type">Portable Swappable Battery</div>
                      {[
                        { l: 'Type', v: 'Li-ion' },
                        { l: 'Capacity', v: '60V / 30Ah' },
                        { l: 'Swappable', v: 'Yes' },
                      ].map(r => (
                        <div key={r.l} className="rd-spec">
                          <span className="rd-spec-l">{r.l}</span>
                          <span className="rd-spec-v">{r.v}</span>
                        </div>
                      ))}
                      <select 
                        className="rd-chg-sel"
                        value={selectedBatteryId}
                        onChange={(e) => setSelectedBatteryId(e.target.value)}
                      >
                        {batteriesList.length > 0 ? (
                          batteriesList.map(b => (
                            <option key={b.battery_id || b.id} value={b.battery_id || b.id}>
                              {b.battery_id || b.id} ({b.soc ? `${b.soc}%` : '100%'} • {b.capacity || '60V 30Ah'})
                            </option>
                          ))
                        ) : (
                          <option value="">No batteries available in {selectedZone?.name || 'zone'}</option>
                        )}
                      </select>
                    </div>

                    {/* 3. Select Rental Plan & Deposit (Zone Pricing API) */}
                    <div className="rd-panel">
                      <div className="rd-ph">
                        <span className="rd-ph-title">3. Zone Package Plan</span>
                        <span className="rd-avail" style={{ background: '#EDE9FE', color: '#2a195c' }}>
                          {selectedModelName}
                        </span>
                      </div>
                      <select 
                        className="rd-plan-sel"
                        value={selectedPackage?.id || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = packagesList.find(p => String(p.id) === String(val));
                          if (found) setSelectedPackage(found);
                        }}
                      >
                        {packagesList.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.duration} {p.duration === 1 ? 'Day' : 'Days'}) - Rent: ₹{p.price} | Dep: ₹{Number(p.deposit ?? 0)}
                          </option>
                        ))}
                      </select>
                      <div className="rd-price-box">
                        <div>
                          <span className="rd-price-amount">₹{(selectedPackage?.price || 0).toFixed(2)}</span>
                          <span className="rd-price-unit"> / {totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
                        </div>
                        <div className="rd-price-from" style={{ color: '#059669', fontWeight: 700 }}>
                          + Refundable Deposit: ₹{Number(selectedPackage?.deposit ?? 0).toFixed(2)}
                        </div>
                      </div>
                      {[
                        { label: 'Unlimited kms in zone', green: true },
                        { label: 'Battery swap included', green: true },
                        { label: '100% Refundable Deposit', green: true },
                      ].map(f => (
                        <div key={f.label} className="rd-feature">
                          {f.green
                            ? <span className="rd-feature-ic-green"><ICheck s={13} /></span>
                            : <span className="rd-feature-ic-amber"><IInfo s={13} /></span>
                          }
                          {f.label}
                        </div>
                      ))}
                      <button className="rd-view-plans">View zone pricing <IArr s={11} /></button>
                    </div>

                  </div>
                </div>

                {/* ── Ride Timing Card ── */}
                <div className="nr-card">
                  <div className="rd-timing-hdr">
                    <span className="rd-timing-hdr-ic"><IClock s={18} /></span>
                    <div>
                      <div className="rd-timing-title">Ride Timing (Zone Package Synced)</div>
                      <div className="rd-timing-sub">Start time defaults to current time. Return date/time auto-calculates per package (fully editable).</div>
                    </div>
                  </div>
                  <div className="rd-timing-body">
                    <div className="rd-timing-grid">
                      {/* Start */}
                      <div className="rd-fld">
                        <label>Expected Start Date &amp; Time<span className="req" style={{ color: '#EF4444', marginLeft: 2 }}> *</span></label>
                        <div className="rd-dt-row">
                          <div className="nr-inp-wrap">
                            <input 
                              type="date"
                              className="nr-inp" 
                              value={startDate} 
                              onChange={(e) => setStartDate(e.target.value)} 
                            />
                          </div>
                          <div className="nr-inp-wrap" style={{ width: 130 }}>
                            <input 
                              type="text"
                              className="nr-inp" 
                              value={startTime} 
                              onChange={(e) => setStartTime(e.target.value)} 
                              placeholder="10:00 AM"
                            />
                            <span className="nr-inp-wrap-ic"><IClock s={13} /></span>
                          </div>
                        </div>
                      </div>
                      {/* Return */}
                      <div className="rd-fld">
                        <label>Expected Return Date &amp; Time<span style={{ color: '#EF4444', marginLeft: 2 }}> *</span></label>
                        <div className="rd-dt-row">
                          <div className="nr-inp-wrap">
                            <input 
                              type="date"
                              className="nr-inp" 
                              value={returnDate} 
                              onChange={(e) => setReturnDate(e.target.value)} 
                            />
                          </div>
                          <div className="nr-inp-wrap" style={{ width: 130 }}>
                            <input 
                              type="text"
                              className="nr-inp" 
                              value={returnTime} 
                              onChange={(e) => setReturnTime(e.target.value)} 
                              placeholder="10:00 AM"
                            />
                            <span className="nr-inp-wrap-ic"><IClock s={13} /></span>
                          </div>
                        </div>
                      </div>
                      {/* Duration */}
                      <div className="rd-dur-box">
                        <div className="rd-dur-lbl">Total Duration</div>
                        <div className="rd-dur-val">{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</div>
                        <div className="rd-dur-sub">({totalDays * 24} Hours)</div>
                      </div>
                    </div>
                    <div className="rd-timing-note">
                      <span style={{ color: '#2563EB', display: 'flex', flexShrink: 0 }}><IInfo s={14} /></span>
                      <span>Return date auto-calculates based on package duration. You can customize start and return times.</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="nr-footer-actions">
                  <Link href="/new-rider" className="nr-prev-btn"><ILeft /> Previous</Link>
                  <button
                    className="nr-continue-btn"
                    type="button"
                    disabled={!selectedVehicleCode || !selectedPackage || !startDate || !returnDate}
                    onClick={handleNextStep}
                  >
                    Continue to Payment &amp; Charges <IArr s={12} />
                  </button>
                </div>
              </div>

              {/* Right Panel */}
              <RightPanel 
                zoneName={selectedZone?.name || 'Gotri Zone'}
                vehicleCode={selectedVehicleCode}
                vehicleModel={selectedModelName}
                batteryName={selectedBatteryId || 'No battery allocated'}
                planName={selectedPackage?.name || 'Daily Pass'}
                planPrice={Number(selectedPackage?.price || 0)}
                depositAmount={Number(selectedPackage?.deposit ?? 0)}
                durationDays={totalDays}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
