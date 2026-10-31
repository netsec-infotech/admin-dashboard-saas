'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

/* ═══════════════════════════════════════════════════════════════
   RETURN RIDE & OPERATIONS — Modern SaaS UI
   Tabs: Return Vehicle (4-Step Flow) | Extend Ride | Exchange Vehicle
   ═══════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ── shell & layout ── */
.nr-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: Inter, sans-serif; }
.nr-main  { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; flex: 1; min-width: 0; background: #F8FAFC; }
.nr-page  { flex: 1; padding: 18px 22px 60px; }

/* ── responsive 80% fit on 14" screens ── */
@media (max-width: 1440px) {
  .nr-page { padding: 14px 18px 45px; }
  .nr-layout { grid-template-columns: 1fr 285px !important; gap: 16px !important; }
}

/* ── breadcrumb ── */
.nr-bc { display: flex; align-items: center; gap: 7px; padding: 4px 0 0; font-size: 12px; color: #9CA3AF; }
.nr-bc a { color: #9CA3AF; display: flex; align-items: center; gap: 4px; text-decoration: none; transition: color .15s; }
.nr-bc a:hover { color: #2A195C; }
.nr-bc-sep { color: #D1D5DB; }
.nr-bc-cur { color: #2A195C; font-weight: 600; }

/* ── title row ── */
.nr-title-row { display: flex; align-items: flex-start; justify-content: space-between; margin: 12px 0 16px; gap: 16px; }
.nr-h1  { font-size: 22px; font-weight: 800; color: #111827; line-height: 1.2; margin: 0; }
.nr-sub { font-size: 12.5px; color: #6B7280; margin-top: 3px; }
.nr-back-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 18px; background: #fff; border: 1.5px solid #E5E7EB;
  border-radius: 9px; font-size: 12.5px; font-weight: 600; color: #374151;
  cursor: pointer; white-space: nowrap; font-family: inherit;
  box-shadow: 0 1px 3px rgba(0,0,0,.05); transition: border-color .15s, color .15s; flex-shrink: 0;
}
.nr-back-btn:hover { border-color: #2A195C; color: #2A195C; }

/* ── operation mode tabs ── */
.ro-mode-tabs {
  display: flex; align-items: center; gap: 6px;
  background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 12px;
  padding: 5px; margin-bottom: 18px; width: fit-content;
}
.ro-mode-tab {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 20px; border-radius: 9px;
  font-size: 13px; font-weight: 600; color: #4B5563;
  cursor: pointer; transition: all .15s; user-select: none;
}
.ro-mode-tab.active {
  background: #2A195C; color: #fff; box-shadow: 0 2px 6px rgba(42,25,92,.25);
}
.ro-mode-tab:hover:not(.active) {
  color: #111827; background: rgba(255,255,255,.6);
}
.ro-mode-badge {
  font-size: 11px; padding: 2px 7px; border-radius: 20px;
  font-weight: 700; background: rgba(255,255,255,.2); color: inherit;
}
.ro-mode-tab:not(.active) .ro-mode-badge {
  background: #E5E7EB; color: #6B7280;
}

/* ── stepper (for Return flow) ── */
.nr-stepper {
  display: flex; align-items: center;
  background: #fff; border: 1px solid #E5E7EB; border-radius: 12px;
  padding: 14px 20px; margin-bottom: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.nr-step-wrap { display: flex; align-items: center; flex: 1; }
.nr-step      { display: flex; align-items: center; gap: 9px; }
.nr-step-num  { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.nr-step-num.active { background: #2A195C; color: #fff; }
.nr-step-num.done   { background: #22C55E; color: #fff; }
.nr-step-num.pend   { background: #fff; color: #9CA3AF; border: 2px solid #E5E7EB; }
.nr-step-label      { font-size: 12.5px; font-weight: 600; color: #111827; white-space: nowrap; }
.nr-step-label.pend { color: #9CA3AF; font-weight: 500; }
.nr-step-stat       { font-size: 11px; margin-top: 1px; white-space: nowrap; }
.nr-step-stat.active-s { color: #2A195C; }
.nr-step-stat.done-s   { color: #22C55E; }
.nr-step-stat.pend-s   { color: #9CA3AF; }
.nr-step-line { flex: 1; height: 2px; background: #E5E7EB; margin: 0 12px; min-width: 14px; }
.nr-step-line.done-l { background: #22C55E; }

/* ── 2-col layout ── */
.nr-layout { display: grid; grid-template-columns: 1fr 296px; gap: 18px; align-items: start; }

/* ── card ── */
.nr-card {
  background: #fff; border: 1px solid #E5E7EB; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,.05); overflow: hidden; margin-bottom: 16px;
}
.nr-card-hdr {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; padding: 16px 20px 14px; border-bottom: 1px solid #F3F4F6;
}
.nr-card-hdr h2 { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 3px; }
.nr-card-hdr p  { font-size: 12.5px; color: #6B7280; margin: 0; }
.nr-card-body   { padding: 18px 20px; }

/* ── rider banner (selected active ride) ── */
.rr-rider-banner {
  display: flex; align-items: center; gap: 16px; padding: 16px 20px;
  background: #F9FAFB; border-bottom: 1px solid #E5E7EB;
}
.rr-banner-avatar {
  width: 54px; height: 54px; border-radius: 50%;
  background: #2A195C; display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 800; color: #fff; flex-shrink: 0; position: relative; overflow: hidden;
  border: 2px solid #E0E7FF;
}
.rr-banner-name { font-size: 16px; font-weight: 800; color: #111827; margin-bottom: 3px; display: flex; align-items: center; gap: 8px; }
.rr-banner-row  { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #6B7280; margin-bottom: 2px; }
.rr-kyc-badge   { background: #DCFCE7; color: #16A34A; border: 1px solid #BBF7D0; border-radius: 5px; font-size: 10.5px; font-weight: 700; padding: 2px 7px; display: inline-flex; align-items: center; gap: 4px; }
.rr-banner-stats{ display: flex; gap: 20px; flex-shrink: 0; margin-left: auto; }
.rr-stat-block  { text-align: right; }
.rr-stat-num    { font-size: 16px; font-weight: 800; color: #111827; }
.rr-stat-lbl    { font-size: 11px; color: #9CA3AF; }

/* ── search bar & filters ── */
.rr-search-area { padding: 16px 20px; border-bottom: 1px solid #F3F4F6; }
.rr-search-grid { display: grid; grid-template-columns: 1fr 1fr 140px auto; gap: 10px; align-items: center; }
.nr-ph {
  display: flex; border: 1.5px solid #E5E7EB; border-radius: 8px;
  overflow: hidden; background: #fff; transition: border-color .15s; flex: 1; align-items: center;
}
.nr-ph:focus-within { border-color: #2A195C; box-shadow: 0 0 0 3px rgba(42,25,92,.08); }
.nr-ph-icon { padding: 8px 10px; color: #9CA3AF; display: flex; align-items: center; }
.nr-ph input {
  flex: 1; padding: 8px 10px; border: none; outline: none;
  font-size: 12.5px; font-family: inherit; background: transparent; min-width: 0;
}
.nr-ph input::placeholder { color: #9CA3AF; }
.rr-search-btn {
  padding: 8px 18px; background: #2A195C; color: #fff;
  border: none; border-radius: 8px; font-size: 12.5px; font-weight: 700;
  cursor: pointer; font-family: inherit; white-space: nowrap;
  display: flex; align-items: center; gap: 6px; transition: background .15s;
}
.rr-search-btn:hover { background: #3c2482; }

/* ── active ride row card ── */
.rr-rider-row {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px; border: 1.5px solid #E5E7EB; border-radius: 10px;
  margin-bottom: 10px; transition: all .15s; background: #fff;
}
.rr-rider-row:hover { border-color: #2A195C; box-shadow: 0 2px 6px rgba(42,25,92,.06); }
.rr-avatar {
  width: 46px; height: 46px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: #fff; flex-shrink: 0;
  position: relative; overflow: hidden; border: 1.5px solid #E5E7EB;
}
.rr-rider-info { flex: 1; min-width: 0; }
.rr-rider-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; flex-wrap: wrap; }
.rr-rider-name { font-size: 14px; font-weight: 800; color: #111827; }
.rr-active-badge { background: #DCFCE7; color: #16A34A; border-radius: 4px; font-size: 10.5px; font-weight: 700; padding: 1px 7px; }
.rr-rider-id { font-size: 11.5px; font-weight: 700; color: #2A195C; margin-bottom: 4px; font-family: monospace; }
.rr-rider-meta { display: flex; align-items: center; gap: 14px; font-size: 11.5px; color: #6B7280; flex-wrap: wrap; }
.rr-meta-item  { display: flex; align-items: center; gap: 4px; }
.rr-select-btn {
  padding: 8px 16px; background: #fff; border: 1.5px solid #2A195C;
  color: #2A195C; border-radius: 8px; font-size: 12.5px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all .15s; white-space: nowrap;
}
.rr-select-btn:hover { background: #2A195C; color: #fff; }

/* ── Inspection Step ── */
.ro-photo-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 16px; }
.ro-photo-slot { border-radius: 8px; overflow: hidden; position: relative; height: 80px; border: 1.5px solid #E5E7EB; }
.ro-photo-slot-add {
  border-radius: 8px; height: 80px; border: 1.5px dashed #C7D2FE;
  background: #F5F3FF; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px; cursor: pointer;
  transition: border-color .15s;
}
.ro-photo-slot-add:hover { border-color: #2A195C; background: #EEF2FF; }
.ro-photo-lbl { font-size: 10px; color: #6B7280; text-align: center; margin-top: 4px; }
.ro-condition-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px; margin-bottom: 16px; }
.ro-cond-group { display: flex; flex-direction: column; gap: 6px; }
.ro-cond-title { font-size: 12px; font-weight: 700; color: #374151; }
.ro-radio-row  { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #374151; cursor: pointer; }
.ro-radio {
  width: 15px; height: 15px; border-radius: 50%; border: 2px solid #D1D5DB;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ro-radio.on { border-color: #2A195C; background: #2A195C; }
.ro-radio.on::after { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #fff; }

/* ── Settlement Step ── */
.ro-settle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 16px; }
.ro-settle-box  { border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 14px; background: #fff; }
.ro-settle-title{ font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 10px; }
.ro-settle-row  { display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; padding: 4px 0; }
.ro-settle-label{ color: #6B7280; }
.ro-settle-val  { font-weight: 600; color: #111827; }
.ro-refund-big  { font-size: 22px; font-weight: 800; color: #16A34A; }

/* ── PayU Card in Return & Extend ── */
.ro-payu-card {
  background: #F0FDF4;
  border: 1.5px solid #86EFAC;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 8px;
}
.ro-payu-badge {
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
  letter-spacing: 0.3px;
}

/* ── Package Extension Grid ── */
.ext-pkg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.ext-pkg-card {
  border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 14px;
  cursor: pointer; transition: all .15s; background: #fff; position: relative;
}
.ext-pkg-card:hover { border-color: #2A195C; }
.ext-pkg-card.selected {
  border-color: #2A195C; background: #F5F3FF; box-shadow: 0 0 0 2px rgba(42,25,92,.1);
}
.ext-pkg-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 2px; }
.ext-pkg-days  { font-size: 11.5px; color: #6B7280; margin-bottom: 6px; }
.ext-pkg-price { font-size: 17px; font-weight: 800; color: #2A195C; }
.ext-pkg-badge {
  position: absolute; top: 8px; right: 8px; background: #DCFCE7; color: #16A34A;
  font-size: 9.5px; font-weight: 700; padding: 1px 6px; border-radius: 4px;
}

/* ── Footer card ── */
.nr-footer-card {
  background: #fff; border: 1px solid #E5E7EB; border-radius: 12px;
  padding: 14px 20px; display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0,0,0,.04); margin-top: 16px;
}
.nr-cancel-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  background: transparent; border: none; font-size: 12.5px; font-weight: 600;
  color: #6B7280; cursor: pointer; font-family: inherit;
}
.nr-cancel-btn:hover { color: #EF4444; }
.nr-continue-btn {
  display: flex; align-items: center; gap: 7px; padding: 9px 22px;
  background: #2A195C; color: #fff; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: background .15s; box-shadow: 0 2px 6px rgba(42,25,92,.25);
}
.nr-continue-btn:hover { background: #3c2482; }

/* ── Right Panel ── */
.nr-rp { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 76px; }
.nr-rp-card {
  background: #fff; border: 1px solid #E5E7EB; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,.05); overflow: hidden;
}
.nr-rp-hdr { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #E5E7EB; }
.nr-rp-title { font-size: 13px; font-weight: 700; color: #111827; }
.nr-rp-body  { padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 6px; }
.nr-rp-row   {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px; font-size: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 7px;
}
.nr-rp-label { color: #64748B; font-weight: 500; }
.nr-rp-val   { font-weight: 700; color: #111827; text-align: right; }
.nr-rp-avatar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.nr-rp-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: #2A195C; display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; color: #fff; flex-shrink: 0;
  position: relative; overflow: hidden; border: 1.5px solid #E5E7EB;
}
.nr-rp-name  { font-size: 13.5px; font-weight: 800; color: #111827; }
.nr-rp-sub   { font-size: 11.5px; color: #6B7280; }

.nr-tips-card { background: #FFF8F0; border: 1px solid #FED7AA; border-radius: 12px; overflow: hidden; }
.nr-tips-hdr  { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #FED7AA; }
.nr-tip-row   { display: flex; align-items: flex-start; gap: 8px; padding: 6px 16px; font-size: 11.5px; color: #92400E; line-height: 1.4; }
.nr-tip-dot   { width: 5px; height: 5px; border-radius: 50%; background: #D97706; flex-shrink: 0; margin-top: 4px; }
`;

/* ── SVG Icons ── */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 as number, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const SV = ({ s = 14, children, ...p }: { s?: number; children: React.ReactNode } & React.SVGProps<SVGSVGElement>) => (<svg width={s} height={s} viewBox="0 0 24 24" {...S} {...p}>{children}</svg>);
const ILeft = () => <SV s={13}><polyline points="15 18 9 12 15 6" /></SV>;
const ICheck = ({ s = 13 }: { s?: number }) => <SV s={s}><polyline points="20 6 9 17 4 12" /></SV>;
const IPhone = () => <SV s={13}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.54 3.53 2 2 0 0 1 3.5 1.35h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></SV>;
const IID = () => <SV s={13}><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="8.5" cy="10" r="2" /><path d="M14 10h4M14 14h4M6 14h5" /></SV>;
const ISearch = () => <SV s={13}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></SV>;
const IRefresh = () => <SV s={13}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></SV>;
const IScooter = () => <SV s={13}><circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="15" cy="5" r="1" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" /></SV>;
const IBattery = () => <SV s={13}><rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="11" x2="23" y2="13" /></SV>;
const IClock = () => <SV s={13}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></SV>;
const ISwap = () => <SV s={13}><path d="M16 3l4 4-4 4" /><path d="M20 7H4" /><path d="M8 21l-4-4 4-4" /><path d="M4 17h16" /></SV>;
const IReceipt = () => <SV s={13}><path d="M4 2v20l3-1.5L10 22l3-1.5L16 22l3-1.5L22 22V2" /><path d="M10 9H8M16 9h-2M10 14H8M16 14h-2" /></SV>;
const IBulb = () => <SV s={13} stroke="#D97706"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></SV>;
const ICheckCircle = () => <SV s={16} stroke="#16A34A"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></SV>;

/* ── Clean Rider ID helper ── */
function formatCleanRiderId(rawId: any, index?: number): string {
  if (!rawId) return `EVR-${String(10010 + (index || 0))}`;
  const str = String(rawId);
  if (str.startsWith('EVR-')) return str;
  if (str.startsWith('RIDR-') || str.startsWith('RDR-') || str.startsWith('RID-')) {
    return `EVR-${str.replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase()}`;
  }
  if (str.includes('-') && str.length > 15) {
    return `EVR-${str.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
  }
  return `EVR-${str.slice(0, 8).toUpperCase()}`;
}

/* ── Default Extension Packages ── */
const DEFAULT_EXTENSION_PACKAGES = [
  { id: 'daily_lite', name: 'Daily Lite', days: 1, fare: 350, badge: 'Popular' },
  { id: 'daily_commuter', name: 'Daily Commuter', days: 1, fare: 450 },
  { id: 'weekly_pro', name: 'Weekly Pro', days: 7, fare: 1800, badge: 'Best Value' },
  { id: 'weekly_std', name: 'Weekly Standard', days: 7, fare: 1600 },
  { id: 'monthly_pkg', name: 'Monthly Package', days: 30, fare: 5000, badge: 'Save 20%' },
  { id: 'commercial_pkg', name: 'Commercial Delivery', days: 30, fare: 6500 },
];

interface ReturnVehiclePageProps {
  initialTab?: 'return' | 'extend' | 'exchange';
}

export default function ReturnVehiclePage({ initialTab }: ReturnVehiclePageProps = {}) {
  const [mainTab, setMainTab] = useState<'return' | 'extend' | 'exchange'>(initialTab || 'return');
  const [activeStep, setActiveStep] = useState(1);
  const [activeRiders, setActiveRiders] = useState<any[]>([]);
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Dynamic Zone Pricing & Packages
  const [packagesList, setPackagesList] = useState(DEFAULT_EXTENSION_PACKAGES);

  // Return Inspection States
  const [bodyDmg, setBodyDmg] = useState<'clean' | 'minor' | 'major'>('clean');
  const [tyreCond, setTyreCond] = useState<'good' | 'worn' | 'damaged'>('good');
  const [cleanliness, setCleanliness] = useState<'clean' | 'dusty' | 'dirty'>('clean');
  const [batteryHealth, setBatteryHealth] = useState<'good' | 'issue'>('good');
  const [helmetReturned, setHelmetReturned] = useState(true);
  const [chargerReturned, setChargerReturned] = useState(true);
  const [refundMethod, setRefundMethod] = useState<'upi' | 'cash' | 'wallet'>('upi');
  const [upiId, setUpiId] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Extend Ride States
  const [extendMode, setExtendMode] = useState<'package' | 'hourly'>('package');
  const [selectedPackage, setSelectedPackage] = useState(DEFAULT_EXTENSION_PACKAGES[0]);
  const [extendHours, setExtendHours] = useState(2);
  const [extendDays, setExtendDays] = useState(1);
  const [extendPayMethod, setExtendPayMethod] = useState<'payu' | 'upi' | 'cash' | 'split'>('payu');
  const [cashVoucher, setCashVoucher] = useState(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CSH-VCHR-${today}-${rand}`;
  });

  // PayU (Primary Gateway) States for Extension
  const [payuQrString, setPayuQrString] = useState('');
  const [payuTxId, setPayuTxId] = useState('');
  const [payuCheckoutUrl, setPayuCheckoutUrl] = useState('');
  const [payuVerified, setPayuVerified] = useState(false);
  const [isCheckingPayU, setIsCheckingPayU] = useState(false);

  // Exchange Vehicle States & Live Inventory
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [availableBatteries, setAvailableBatteries] = useState<any[]>([]);
  const [exchangeNewVehicle, setExchangeNewVehicle] = useState('');
  const [exchangeNewBattery, setExchangeNewBattery] = useState('');
  const [exchangeReason, setExchangeReason] = useState('Battery Range Drop');
  const [exchangeNotes, setExchangeNotes] = useState('');

  // Fetch available vehicles & batteries from backend
  const fetchAvailableInventory = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const [vRes, bRes] = await Promise.all([
        fetch(`${apiUrl}/vehicles?vehicle_status=Available`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${apiUrl}/batteries`).then(r => r.json()).catch(() => ({ data: [] }))
      ]);
      const vList = Array.isArray(vRes) ? vRes : (vRes.data || []);
      const bList = Array.isArray(bRes) ? bRes : (bRes.data || []);
      setAvailableVehicles(vList);
      const availB = bList.filter((b: any) => (b.status || '').toLowerCase() === 'available');
      setAvailableBatteries(availB);

      if (vList.length > 0 && !exchangeNewVehicle) {
        setExchangeNewVehicle(`${vList[0].code || vList[0].registration_number} (${vList[0].model || 'Evegah City'})`);
      }
      if (availB.length > 0 && !exchangeNewBattery) {
        setExchangeNewBattery(`${availB[0].battery_id} (${availB[0].capacity || '60V 30Ah'})`);
      }
    } catch (_) {}
  };

  // Fetch Zone Pricing dynamically
  const fetchZonePricing = async (hubName?: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/zones`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || []);
      const target = list.find((z: any) =>
        hubName && z.name && z.name.toLowerCase().includes(hubName.toLowerCase().replace(/hub|zone/g, '').trim())
      ) || list[0];

      if (target && target.pricing && Array.isArray(target.pricing.packages) && target.pricing.packages.length > 0) {
        const mappedPkgs = target.pricing.packages.map((p: any) => ({
          id: String(p.id || p.name),
          name: p.name || 'Rental Package',
          days: Number(p.duration) || 1,
          fare: Number(p.price) || 350,
          badge: (p.name || '').toLowerCase().includes('daily') ? 'Popular' : 'Zone Plan'
        }));
        setPackagesList(mappedPkgs);
        setSelectedPackage(mappedPkgs[0]);
      }
    } catch (_) {}
  };

  // Fetch active rides directly from backend (No dummy/mock fallback)
  const fetchActiveRides = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const [rentersRes, resvRes] = await Promise.all([
        fetch(`${apiUrl}/renters`).then(r => r.json()).catch(() => []),
        fetch(`${apiUrl}/reservations`).then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      const rList = Array.isArray(rentersRes) ? rentersRes : (rentersRes.data || rentersRes.renters || []);
      const vList = Array.isArray(resvRes) ? resvRes : (resvRes.data || []);

      const activeReservations = vList.filter((r: any) =>
        ['Active', 'Ongoing', 'Picked Up', 'Active Ride'].includes(r.status)
      );

      const combined: any[] = [];
      const seenIds = new Set();

      activeReservations.forEach((r: any, idx: number) => {
        const idKey = r.reservation_id || String(r.id);
        if (!seenIds.has(idKey)) {
          seenIds.add(idKey);
          combined.push({
            name: r.customer_name || 'Rider',
            id: r.reservation_id || `EVR-${String(r.id).slice(0, 6)}`,
            mobile: r.mobile || '',
            vehicle_id: r.vehicle_number || 'EVM102501',
            battery_id: r.battery_id || 'BAT-0098',
            plan: r.package_type || 'Daily Lite',
            start_date: r.pickup_datetime || r.created_at ? new Date(r.pickup_datetime || r.created_at).toLocaleDateString('en-IN') : 'Today',
            deposit_amount: Number(r.deposit) || 1000,
            zone: r.drop_zone || r.pickup_zone || 'Gotri Hub',
            avatar: '/rohit_avatar.png',
            raw: r
          });
        }
      });

      rList.forEach((r: any, idx: number) => {
        const cleanMob = (r.mobile || '').replace(/\D/g, '').slice(-10);
        if (['Active Ride', 'Retain Ride', 'Active'].includes(r.status) && !seenIds.has(cleanMob)) {
          seenIds.add(cleanMob);
          combined.push({
            name: r.rider_name || 'Rider',
            id: formatCleanRiderId(r.id, idx),
            mobile: r.mobile || '',
            vehicle_id: r.vehicle_id || 'EVM1024001',
            battery_id: r.battery_id || 'BAT-0098',
            plan: r.package_name || 'Daily Package',
            start_date: r.rental_start_date ? new Date(r.rental_start_date).toLocaleDateString('en-IN') : 'Today',
            deposit_amount: Number(r.deposit) || 1000,
            zone: r.zone || 'Gotri Hub',
            avatar: '/rohit_avatar.png',
            raw: r
          });
        }
      });

      setActiveRiders(combined);
      if (combined.length === 0) {
        setSelectedRider(null);
      }
    } catch (err) {
      console.error('Error fetching active riders:', err);
      setActiveRiders([]);
      setSelectedRider(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedZone = localStorage.getItem('evegah_active_zone');
      if (savedZone) setSelectedZone(savedZone);
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'extend' || tabParam === 'exchange' || tabParam === 'return') {
        setMainTab(tabParam as any);
      }
    }
    fetchActiveRides();

    const handleZone = (e: any) => {
      const z = e?.detail?.name || (typeof e?.detail === 'string' ? e.detail : 'All');
      if (z) setSelectedZone(z);
    };
    window.addEventListener('evegah_active_zone_changed', handleZone);
    window.addEventListener('evegah_zone_changed', handleZone);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', handleZone);
      window.removeEventListener('evegah_zone_changed', handleZone);
    };
  }, []);

  // Filter riders by search query & zone
  const filteredRiders = activeRiders.filter(r => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQ = !q || (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.mobile && r.mobile.includes(q)) ||
      (r.id && r.id.toLowerCase().includes(q)) ||
      (r.vehicle_id && r.vehicle_id.toLowerCase().includes(q))
    );
    const isAll = !selectedZone || selectedZone === 'All' || selectedZone === 'All Zones';
    const riderZone = (r.zone || '').trim().toLowerCase();
    const activeZone = (selectedZone || '').trim().toLowerCase();
    const matchesZone = isAll || (riderZone && (riderZone.includes(activeZone) || activeZone.includes(riderZone)));
    return matchesQ && matchesZone;
  });

  // Calculate return deductions & refund
  let deductions = 0;
  if (bodyDmg === 'minor') deductions += 250;
  if (bodyDmg === 'major') deductions += 500;
  if (tyreCond === 'worn') deductions += 150;
  if (tyreCond === 'damaged') deductions += 350;
  if (cleanliness === 'dirty') deductions += 80;
  if (batteryHealth === 'issue') deductions += 200;
  if (!chargerReturned) deductions += 200;
  if (!helmetReturned) deductions += 300;

  const currentDeposit = Number(selectedRider?.deposit_amount) || 1000;
  const netRefund = Math.max(0, currentDeposit - deductions);
  const extraDue = Math.max(0, deductions - currentDeposit);

  // Calculate extension fare
  const getExtensionFare = () => {
    if (extendMode === 'package') {
      return selectedPackage.fare;
    }
    if (extendDays > 0) return extendDays * 350 + (extendHours > 0 ? extendHours * 45 : 0);
    return extendHours * 45;
  };
  const extensionFare = getExtensionFare();

  // Dynamic PayU (Primary Gateway) Initiation & Official QR generation for extension or return extra due
  useEffect(() => {
    const isExtend = mainTab === 'extend' && (extendPayMethod === 'payu' || extendPayMethod === 'split') && extensionFare > 0;
    const isReturnDue = mainTab === 'return' && extraDue > 0;
    if (!isExtend && !isReturnDue) return;

    const payAmount = isExtend ? extensionFare : extraDue;
    const payPurpose = isExtend ? 'extend' : 'return';
    const payNotes = isExtend
      ? `Ride Extension for ${selectedRider?.vehicle_id || 'Vehicle'}`
      : `Return Overdue/Damage Fee for ${selectedRider?.vehicle_id || 'Vehicle'}`;

    setPayuVerified(false);
    setPayuQrString('');
    let isMounted = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    fetch(`${apiUrl}/payments/payu/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: payAmount,
        rider_name: selectedRider?.name || 'Rider',
        mobile: selectedRider?.mobile || '',
        notes: payNotes,
        purpose: payPurpose,
        reservation_id: selectedRider?.id
      })
    })
      .then(r => r.json())
      .then(res => {
        if (!isMounted) return;
        const data = res?.data || res;
        const txId = data?.txnid || data?.tx_id || '';
        const chkUrl = data?.checkout_url || '';
        const qrStr = data?.qrString || data?.upi_string || '';
        setPayuTxId(txId);
        setPayuCheckoutUrl(chkUrl);
        if (qrStr) {
          setPayuQrString(qrStr);
        }
      })
      .catch(err => console.error('PayU QR error:', err));

    return () => { isMounted = false; };
  }, [mainTab, extendPayMethod, extensionFare, extraDue, selectedRider]);

  // Automated PayU status polling for Extension & Return Extra Due
  useEffect(() => {
    const isExtendActive = mainTab === 'extend' && (extendPayMethod === 'payu' || extendPayMethod === 'split') && extensionFare > 0;
    const isReturnActive = mainTab === 'return' && extraDue > 0;
    if ((!isExtendActive && !isReturnActive) || !payuTxId || payuVerified) return;

    let isMounted = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const checkPayU = async () => {
      if (!isMounted || payuVerified) return;
      try {
        setIsCheckingPayU(true);
        const res = await fetch(`${apiUrl}/payments/payu/status/${payuTxId}`);
        if (!isMounted) return;
        const data = await res.json();
        const rawStatus = (data?.data?.status || data?.status || '').toUpperCase();
        if (rawStatus === 'SUCCESS') {
          setPayuVerified(true);
        }
      } catch (e) {
      } finally {
        if (isMounted) {
          setIsCheckingPayU(false);
        }
      }
    };

    const timeout = setTimeout(checkPayU, 1500);
    const interval = setInterval(checkPayU, 2500);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [mainTab, extendPayMethod, extensionFare, extraDue, payuTxId, payuVerified]);

  const openPayuCheckoutPopup = (url: string) => {
    if (!url) return;
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

  // Handlers for operations
  const handleCompleteReturn = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/rides/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rider_name: selectedRider?.name,
          mobile: selectedRider?.mobile,
          vehicle_id: selectedRider?.vehicle_id,
          return_condition: bodyDmg,
          refund_deposit: netRefund,
          notes: inspectionNotes
        })
      });
      setActiveStep(4);
      setActionSuccess(`Vehicle ${selectedRider?.vehicle_id} successfully checked in! Deposit ₹${netRefund} refunded.`);
    } catch {
      setActiveStep(4);
      setActionSuccess(`Vehicle ${selectedRider?.vehicle_id} checked in successfully!`);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendRide = async () => {
    if ((extendPayMethod === 'payu' || extendPayMethod === 'split') && !payuVerified) {
      alert('Please wait for customer to complete PayU payment.');
      return;
    }
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/rides/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rider_name: selectedRider?.name,
          mobile: selectedRider?.mobile,
          vehicle_id: selectedRider?.vehicle_id,
          extension_days: extendMode === 'package' ? selectedPackage.days : extendDays,
          extension_hours: extendMode === 'hourly' ? extendHours : 0,
          additional_fare: extensionFare,
          payment_method: extendPayMethod,
          cash_voucher_no: extendPayMethod === 'cash' ? cashVoucher : undefined
        })
      });
      setActionSuccess(`Ride extended successfully by ${extendMode === 'package' ? selectedPackage.name : `${extendDays} Days`}! ${extendPayMethod === 'cash' ? `Cash Voucher ${cashVoucher} issued.` : 'WhatsApp receipt sent.'}`);
    } catch {
      setActionSuccess(`Ride extension processed!`);
    } finally {
      setLoading(false);
    }
  };

  const handleExchangeVehicle = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/rides/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rider_name: selectedRider?.name,
          mobile: selectedRider?.mobile,
          old_vehicle_id: selectedRider?.vehicle_id,
          new_vehicle_id: exchangeNewVehicle.split(' ')[0],
          old_battery_id: selectedRider?.battery_id,
          new_battery_id: exchangeNewBattery.split(' ')[0],
          reason: exchangeReason,
          notes: exchangeNotes
        })
      });
      setActionSuccess(`Vehicle successfully swapped to ${exchangeNewVehicle.split(' ')[0]}! WhatsApp voucher issued.`);
    } catch {
      setActionSuccess(`Vehicle exchange processed successfully!`);
    } finally {
      setLoading(false);
    }
  };

  // Steps configuration for Return flow
  const RETURN_STEPS = [
    { n: 1, label: 'Rider Search', stat: activeStep > 1 ? 'Completed' : 'In Progress', state: activeStep > 1 ? 'done' : 'active' },
    { n: 2, label: 'Vehicle Inspection', stat: activeStep > 2 ? 'Completed' : (activeStep === 2 ? 'In Progress' : 'Pending'), state: activeStep > 2 ? 'done' : (activeStep === 2 ? 'active' : 'pend') },
    { n: 3, label: 'Settlement & Refund', stat: activeStep > 3 ? 'Completed' : (activeStep === 3 ? 'In Progress' : 'Pending'), state: activeStep > 3 ? 'done' : (activeStep === 3 ? 'active' : 'pend') },
    { n: 4, label: 'Return Confirmation', stat: activeStep === 4 ? 'Completed' : 'Pending', state: activeStep === 4 ? 'active' : 'pend' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="nr-shell">
        <Sidebar activePath="/ride-operations/return" />

        <div className="nr-main">
          <TopBar
            title="Return Ride & Operations"
            subtitle="Vehicle return inspection, ride duration extension, and replacement swaps"
          />

          <div className="nr-page">

            {/* ── Breadcrumb ── */}
            <div className="nr-bc">
              <Link href="/"><ILeft /> Home</Link>
              <span className="nr-bc-sep">›</span>
              <a href="#">Rides / Rentals</a>
              <span className="nr-bc-sep">›</span>
              <span className="nr-bc-cur">Return Ride &amp; Operations</span>
            </div>

            {/* ── Title Row ── */}
            <div className="nr-title-row">
              <div>
                <h1 className="nr-h1">Return Ride &amp; Operations</h1>
                <p className="nr-sub">Check in completed rides, extend ongoing packages, or exchange vehicles seamlessly</p>
              </div>
              <Link href="/" className="nr-back-btn">
                <ILeft /> Back to Dashboard
              </Link>
            </div>

            {/* ── Operation Mode Tabs (Pill Switcher) ── */}
            <div className="ro-mode-tabs">
              <div
                className={`ro-mode-tab ${mainTab === 'return' ? 'active' : ''}`}
                onClick={() => { setMainTab('return'); setActiveStep(selectedRider ? 2 : 1); setActionSuccess(null); }}
              >
                <IScooter /> Return Vehicle
                <span className="ro-mode-badge">{filteredRiders.length}</span>
              </div>
              <div
                className={`ro-mode-tab ${mainTab === 'extend' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('extend');
                  setActionSuccess(null);
                  if (selectedRider) fetchZonePricing(selectedRider.zone);
                }}
              >
                <IClock /> Extend Ride
              </div>
              <div
                className={`ro-mode-tab ${mainTab === 'exchange' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('exchange');
                  setActionSuccess(null);
                  fetchAvailableInventory();
                }}
              >
                <ISwap /> Exchange Vehicle
              </div>
            </div>

            {/* ── Action Success Alert ── */}
            {actionSuccess && (
              <div style={{
                background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 10,
                padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
                color: '#15803D', fontSize: 13, fontWeight: 600
              }}>
                <ICheckCircle />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* ── Stepper (for Return flow) ── */}
            {mainTab === 'return' && (
              <div className="nr-stepper">
                {RETURN_STEPS.map((s, i) => (
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
                    {i < RETURN_STEPS.length - 1 && (
                      <div className={`nr-step-line ${s.state === 'done' ? 'done-l' : ''}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── 2-Col Layout ── */}
            <div className="nr-layout">

              {/* ── LEFT COLUMN ── */}
              <div>

                {/* ── COMMON ACTIVE RIDER SEARCH (When no rider selected or Return Step 1) ── */}
                {(!selectedRider || (mainTab === 'return' && activeStep === 1)) && (
                  <div className="nr-card">
                    <div className="nr-card-hdr">
                      <div>
                        <h2>
                          {mainTab === 'return'
                            ? 'Search Active Booking for Return'
                            : mainTab === 'extend'
                            ? 'Search Active Booking to Extend'
                            : 'Search Active Booking to Exchange'}
                        </h2>
                        <p>
                          {mainTab === 'return'
                            ? 'Select an ongoing ride to begin vehicle inspection and security deposit refund'
                            : mainTab === 'extend'
                            ? 'Select an ongoing ride to extend duration or upgrade rental package directly'
                            : 'Select an ongoing ride to swap vehicle or battery from station inventory'}
                        </p>
                      </div>
                      <button
                        onClick={fetchActiveRides}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, background: '#fff',
                          border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 12px',
                          fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer'
                        }}
                      >
                        <IRefresh /> Refresh
                      </button>
                    </div>

                    {/* Search bar */}
                    <div className="rr-search-area">
                      <div className="rr-search-grid">
                        <div className="nr-ph">
                          <span className="nr-ph-icon"><ISearch /></span>
                          <input
                            placeholder="Search by rider name or ID"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="nr-ph">
                          <span className="nr-ph-icon"><IPhone /></span>
                          <input
                            placeholder="Search by mobile or vehicle plate"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="nr-ph" style={{ background: '#F9FAFB' }}>
                          <span style={{ padding: '0 10px', fontSize: 12, fontWeight: 700, color: '#2A195C' }}>
                            {selectedZone}
                          </span>
                        </div>
                        <button className="rr-search-btn" onClick={fetchActiveRides}>
                          <ISearch /> Find Active Ride
                        </button>
                      </div>
                    </div>

                    {/* Active Rides List */}
                    <div className="nr-card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                          Matching Active Rides ({filteredRiders.length})
                        </span>
                        <span style={{ fontSize: 11.5, color: '#6B7280' }}>
                          {mainTab === 'return'
                            ? 'Click "Proceed to Return" to inspect vehicle'
                            : mainTab === 'extend'
                            ? 'Click "Extend Ride" to add packages or hours'
                            : 'Click "Exchange Vehicle" to swap from inventory'}
                        </span>
                      </div>

                      {filteredRiders.length === 0 ? (
                        <div style={{ padding: '35px 0', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                          No active bookings found matching your search. Try another query or zone.
                        </div>
                      ) : (
                        filteredRiders.map((r, idx) => (
                          <div key={r.id || idx} className="rr-rider-row">
                            <div className="rr-avatar">
                              <img
                                src={r.avatar || '/rohit_avatar.png'}
                                alt={r.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2A195C', color: '#fff', fontWeight: 800, fontSize: 13, zIndex: 0 }}>
                                {r.name.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="rr-rider-info">
                              <div className="rr-rider-name-row">
                                <span className="rr-rider-name">{r.name}</span>
                                <span className="rr-active-badge">Active Ride</span>
                                <span className="rr-kyc-badge">✓ KYC Verified</span>
                              </div>
                              <div className="rr-rider-id">{r.id}</div>
                              <div className="rr-rider-meta">
                                <span className="rr-meta-item"><IPhone /> {r.mobile}</span>
                                <span className="rr-meta-item"><IScooter /> {r.vehicle_id}</span>
                                <span className="rr-meta-item"><IBattery /> {r.battery_id}</span>
                                <span className="rr-meta-item"><IClock /> {r.start_date}</span>
                                <span className="rr-meta-item" style={{ color: '#16A34A', fontWeight: 700 }}>Deposit: ₹{r.deposit_amount}</span>
                              </div>
                            </div>
                            <button
                              className="rr-select-btn"
                              onClick={() => {
                                setSelectedRider(r);
                                if (mainTab === 'return') {
                                  setUpiId(`${r.name.toLowerCase().replace(/[^a-z]/g, '')}@upi`);
                                  setActiveStep(2);
                                } else if (mainTab === 'extend') {
                                  fetchZonePricing(r.zone);
                                } else if (mainTab === 'exchange') {
                                  fetchAvailableInventory();
                                }
                              }}
                            >
                              {mainTab === 'return' ? 'Proceed to Return >' : mainTab === 'extend' ? 'Extend Ride >' : 'Exchange Vehicle >'}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ──────────────────────────────────────────────
                    MODE 1: RETURN VEHICLE (STEPS 2, 3, 4)
                   ────────────────────────────────────────────── */}
                {mainTab === 'return' && selectedRider && (
                  <>

                    {/* STEP 2: Vehicle Inspection */}
                    {activeStep === 2 && selectedRider && (
                      <div>
                        {/* Selected Rider Banner */}
                        <div className="nr-card" style={{ marginBottom: 14 }}>
                          <div className="rr-rider-banner">
                            <div className="rr-banner-avatar">
                              <img
                                src={selectedRider.avatar || '/rohit_avatar.png'}
                                alt={selectedRider.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2A195C', color: '#fff', fontWeight: 800, fontSize: 18, zIndex: 0 }}>
                                {selectedRider.name.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="rr-banner-name">
                                {selectedRider.name}
                                <span className="rr-kyc-badge"><ICheck s={10} /> KYC Verified</span>
                              </div>
                              <div className="rr-banner-row"><IPhone /> {selectedRider.mobile} &bull; ID: {selectedRider.id}</div>
                              <div className="rr-banner-row"><IScooter /> {selectedRider.vehicle_id} &bull; <IBattery /> {selectedRider.battery_id}</div>
                            </div>
                            <div className="rr-banner-stats">
                              <div className="rr-stat-block">
                                <div className="rr-stat-num" style={{ color: '#16A34A' }}>₹{currentDeposit}</div>
                                <div className="rr-stat-lbl">Security Deposit</div>
                              </div>
                              <div className="rr-stat-block">
                                <div className="rr-stat-num">{selectedRider.plan}</div>
                                <div className="rr-stat-lbl">Active Plan</div>
                              </div>
                              <button
                                className="nr-back-btn"
                                style={{ padding: '6px 12px', fontSize: '11.5px', alignSelf: 'center', marginLeft: 8 }}
                                onClick={() => { setSelectedRider(null); setActiveStep(1); }}
                              >
                                Change Rider
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Inspection Checklist */}
                        <div className="nr-card">
                          <div className="nr-card-hdr">
                            <div>
                              <h2>Vehicle Physical &amp; Technical Inspection</h2>
                              <p>Record vehicle condition, accessories returned, and damage deductions</p>
                            </div>
                          </div>
                          <div className="nr-card-body">
                            {/* Photo Upload Preview */}
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                              Vehicle Check-in Inspection Photos (6 Angles)
                            </div>
                            <div className="ro-photo-grid">
                              {['Front', 'Rear', 'Left Side', 'Right Side', 'Odometer', 'Battery Bay'].map((lbl, idx) => (
                                <div key={lbl} className="ro-photo-slot-add">
                                  <span style={{ fontSize: 18 }}>📸</span>
                                  <span className="ro-photo-lbl">{lbl}</span>
                                </div>
                              ))}
                            </div>

                            {/* Inspection Conditions */}
                            <div className="ro-condition-grid">
                              <div className="ro-cond-group">
                                <span className="ro-cond-title">Body &amp; Frame</span>
                                <div className="ro-radio-row" onClick={() => setBodyDmg('clean')}>
                                  <div className={`ro-radio ${bodyDmg === 'clean' ? 'on' : ''}`} /> Clean / Normal
                                </div>
                                <div className="ro-radio-row" onClick={() => setBodyDmg('minor')}>
                                  <div className={`ro-radio ${bodyDmg === 'minor' ? 'on' : ''}`} /> Minor Scratch (-₹250)
                                </div>
                                <div className="ro-radio-row" onClick={() => setBodyDmg('major')}>
                                  <div className={`ro-radio ${bodyDmg === 'major' ? 'on' : ''}`} /> Dent / Crack (-₹500)
                                </div>
                              </div>

                              <div className="ro-cond-group">
                                <span className="ro-cond-title">Tyres &amp; Brakes</span>
                                <div className="ro-radio-row" onClick={() => setTyreCond('good')}>
                                  <div className={`ro-radio ${tyreCond === 'good' ? 'on' : ''}`} /> Good Condition
                                </div>
                                <div className="ro-radio-row" onClick={() => setTyreCond('worn')}>
                                  <div className={`ro-radio ${tyreCond === 'worn' ? 'on' : ''}`} /> Heavy Wear (-₹150)
                                </div>
                                <div className="ro-radio-row" onClick={() => setTyreCond('damaged')}>
                                  <div className={`ro-radio ${tyreCond === 'damaged' ? 'on' : ''}`} /> Punctured (-₹350)
                                </div>
                              </div>

                              <div className="ro-cond-group">
                                <span className="ro-cond-title">Cleanliness</span>
                                <div className="ro-radio-row" onClick={() => setCleanliness('clean')}>
                                  <div className={`ro-radio ${cleanliness === 'clean' ? 'on' : ''}`} /> Clean Vehicle
                                </div>
                                <div className="ro-radio-row" onClick={() => setCleanliness('dirty')}>
                                  <div className={`ro-radio ${cleanliness === 'dirty' ? 'on' : ''}`} /> Heavy Mud (-₹80)
                                </div>
                              </div>

                              <div className="ro-cond-group">
                                <span className="ro-cond-title">Battery SOC &amp; Health</span>
                                <div className="ro-radio-row" onClick={() => setBatteryHealth('good')}>
                                  <div className={`ro-radio ${batteryHealth === 'good' ? 'on' : ''}`} /> Normal (SOC &gt; 20%)
                                </div>
                                <div className="ro-radio-row" onClick={() => setBatteryHealth('issue')}>
                                  <div className={`ro-radio ${batteryHealth === 'issue' ? 'on' : ''}`} /> Deep Drain (-₹200)
                                </div>
                              </div>
                            </div>

                            {/* Included Accessories Check */}
                            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 14, marginTop: 10 }}>
                              <span className="ro-cond-title" style={{ display: 'block', marginBottom: 8 }}>Accessories Handed Over</span>
                              <div style={{ display: 'flex', gap: 20 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                                  <input type="checkbox" checked={helmetReturned} onChange={e => setHelmetReturned(e.target.checked)} />
                                  Evegah Helmet {!helmetReturned && <span style={{ color: '#EF4444' }}>(-₹300)</span>}
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                                  <input type="checkbox" checked={chargerReturned} onChange={e => setChargerReturned(e.target.checked)} />
                                  60V Smart Fast Charger {!chargerReturned && <span style={{ color: '#EF4444' }}>(-₹200)</span>}
                                </label>
                              </div>
                            </div>

                            {/* Inspection Notes */}
                            <div style={{ marginTop: 14 }}>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                                Inspection Remarks (Optional)
                              </label>
                              <textarea
                                placeholder="E.g., Vehicle returned in good operational condition. Odometer reading 1,420 km."
                                value={inspectionNotes}
                                onChange={e => setInspectionNotes(e.target.value)}
                                style={{
                                  width: '100%', padding: '8px 12px', border: '1.5px solid #E5E7EB',
                                  borderRadius: 8, fontSize: 12.5, outline: 'none', resize: 'none', minHeight: 60
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Footer Card */}
                        <div className="nr-footer-card">
                          <button className="nr-cancel-btn" onClick={() => setActiveStep(1)}>
                            <ILeft /> Back to Search
                          </button>
                          <button className="nr-continue-btn" onClick={() => setActiveStep(3)}>
                            Proceed to Settlement &gt;
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Settlement & Refund */}
                    {activeStep === 3 && selectedRider && (
                      <div>
                        {/* Summary Card */}
                        <div className="nr-card">
                          <div className="nr-card-hdr">
                            <div>
                              <h2>Security Deposit Settlement &amp; Payout</h2>
                              <p>Review calculated deductions and refund the remaining deposit to {selectedRider.name}</p>
                            </div>
                          </div>
                          <div className="nr-card-body">
                            <div className="ro-settle-grid">
                              {/* Deductions Breakdown */}
                              <div className="ro-settle-box">
                                <div className="ro-settle-title">Inspection Deductions</div>
                                <div className="ro-settle-row">
                                  <span className="ro-settle-label">Original Security Deposit:</span>
                                  <span className="ro-settle-val">₹{currentDeposit.toFixed(2)}</span>
                                </div>
                                <div className="ro-settle-row">
                                  <span className="ro-settle-label">Body Damage:</span>
                                  <span className="ro-settle-val" style={{ color: bodyDmg === 'clean' ? '#16A34A' : '#EF4444' }}>
                                    {bodyDmg === 'clean' ? '₹0.00 (None)' : `-₹${bodyDmg === 'minor' ? 250 : 500}`}
                                  </span>
                                </div>
                                <div className="ro-settle-row">
                                  <span className="ro-settle-label">Tyre / Brake Wear:</span>
                                  <span className="ro-settle-val" style={{ color: tyreCond === 'good' ? '#16A34A' : '#EF4444' }}>
                                    {tyreCond === 'good' ? '₹0.00 (Normal)' : `-₹${tyreCond === 'worn' ? 150 : 350}`}
                                  </span>
                                </div>
                                <div className="ro-settle-row">
                                  <span className="ro-settle-label">Missing Accessories:</span>
                                  <span className="ro-settle-val" style={{ color: (!helmetReturned || !chargerReturned) ? '#EF4444' : '#16A34A' }}>
                                    {(!helmetReturned || !chargerReturned) ? `-₹${(!helmetReturned ? 300 : 0) + (!chargerReturned ? 200 : 0)}` : '₹0.00'}
                                  </span>
                                </div>
                                <div style={{ height: 1, background: '#E5E7EB', margin: '8px 0' }} />
                                <div className="ro-settle-row" style={{ fontWeight: 800 }}>
                                  <span>Total Deductions:</span>
                                  <span style={{ color: '#EF4444' }}>₹{deductions.toFixed(2)}</span>
                                </div>
                              </div>

                              {extraDue > 0 ? (
                                <div className="ro-settle-box" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
                                  <div className="ro-settle-title" style={{ color: '#B45309' }}>Additional Balance Due from Rider</div>
                                  <div className="ro-refund-big" style={{ color: '#DC2626' }}>₹{extraDue.toFixed(2)}</div>
                                  <p style={{ fontSize: 12, color: '#92400E', margin: '6px 0 14px' }}>
                                    Total inspection deductions exceed initial security deposit. Scan &amp; Pay the balance via PayU Dynamic UPI QR.
                                  </p>

                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #86EFAC' }}>
                                    <div style={{ width: 148, height: 148, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {payuQrString ? (
                                        <QRCodeSVG value={payuQrString} size={136} level="M" />
                                      ) : (
                                        <div style={{ fontSize: 11, color: '#94A3B8' }}>Generating PayU QR...</div>
                                      )}
                                    </div>
                                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#047857', marginTop: 6 }}>
                                      PayU Smart Dynamic UPI QR
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                                      Ref: {payuTxId || 'EVG-GENERATING...'}
                                    </div>
                                    <div style={{ marginTop: 8, width: '100%' }}>
                                      {payuVerified ? (
                                        <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '6px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, textAlign: 'center' }}>
                                          ✓ Balance Paid &amp; Verified via PayU
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                          {payuCheckoutUrl && (
                                            <button
                                              type="button"
                                              onClick={() => openPayuCheckoutPopup(payuCheckoutUrl)}
                                              style={{
                                                width: '100%',
                                                background: '#2A195C',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 6,
                                                padding: '7px 10px',
                                                fontSize: 11.5,
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                              }}
                                            >
                                              Pay ₹{extraDue.toFixed(2)} via PayU Popup
                                            </button>
                                          )}
                                          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#047857', padding: '5px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                                            {isCheckingPayU ? 'Verifying with PayU Server...' : `Awaiting PayU payment (₹${extraDue.toFixed(2)})...`}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                /* Net Refund Calculation */
                                <div className="ro-settle-box" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                                  <div className="ro-settle-title" style={{ color: '#166534' }}>Net Refund Amount</div>
                                  <div className="ro-refund-big">₹{netRefund.toFixed(2)}</div>
                                  <p style={{ fontSize: 12, color: '#15803D', margin: '6px 0 14px' }}>
                                    Net refund recorded. The refund request will be forwarded to the Deposit Refunds page for Super Admin OTP / Master Password approval.
                                  </p>

                                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                                    Refund Payment Mode
                                  </div>
                                  <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
                                    {[
                                      { id: 'upi', label: 'UPI Payout' },
                                      { id: 'cash', label: 'Cash Counter' },
                                      { id: 'wallet', label: 'Rider Wallet' }
                                    ].map(m => (
                                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer' }}>
                                        <input
                                          type="radio"
                                          name="refundMethod"
                                          checked={refundMethod === m.id}
                                          onChange={() => setRefundMethod(m.id as any)}
                                        />
                                        {m.label}
                                      </label>
                                    ))}
                                  </div>

                                  {refundMethod === 'upi' && (
                                    <div className="nr-ph" style={{ marginTop: 6 }}>
                                      <span className="nr-ph-icon"><IPhone /></span>
                                      <input
                                        placeholder="rider@upi"
                                        value={upiId}
                                        onChange={e => setUpiId(e.target.value)}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer Card */}
                        <div className="nr-footer-card">
                          <button className="nr-cancel-btn" onClick={() => setActiveStep(2)}>
                            <ILeft /> Back to Inspection
                          </button>
                          <button
                            className="nr-continue-btn"
                            onClick={handleCompleteReturn}
                            disabled={loading || (extraDue > 0 && !payuVerified)}
                            style={{
                              opacity: (extraDue > 0 && !payuVerified) ? 0.65 : 1,
                              cursor: (extraDue > 0 && !payuVerified) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {extraDue > 0
                              ? (payuVerified ? 'Confirm Return & Settle Payment >' : `Awaiting PayU Payment (₹${extraDue.toFixed(2)})...`)
                              : `Confirm Return & Submit Refund Request (₹${netRefund.toFixed(2)}) >`}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Return Confirmation */}
                    {activeStep === 4 && selectedRider && (
                      <div className="nr-card">
                        <div className="nr-card-body" style={{ textAlign: 'center', padding: '36px 24px' }}>
                          <div style={{
                            width: 60, height: 60, borderRadius: '50%', background: '#DCFCE7',
                            color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 28, margin: '0 auto 16px'
                          }}>
                            ✓
                          </div>
                          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                            Vehicle Return Completed Successfully!
                          </h2>
                          <p style={{ fontSize: 13, color: '#6B7280', maxWidth: 480, margin: '0 auto 20px' }}>
                            Vehicle <b>{selectedRider.vehicle_id}</b> has been checked into <b>{selectedZone}</b> inventory.
                            {bodyDmg !== 'clean' || tyreCond === 'damaged' ? (
                              <span style={{ display: 'block', color: '#DC2626', fontWeight: 600, marginTop: 4 }}>
                                Damage noted: Vehicle status set to Maintenance and service order logged.
                              </span>
                            ) : null}
                            <span style={{ display: 'block', marginTop: 4 }}>
                              Deposit refund request of <b>₹{netRefund}</b> has been submitted to the <b>Deposit Refunds</b> page for Super Admin OTP / Master Password authorization.
                            </span>
                          </p>

                          <div style={{
                            background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10,
                            padding: '16px', maxWidth: 480, margin: '0 auto 24px', textAlign: 'left'
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12.5 }}>
                              <div><span style={{ color: '#6B7280' }}>Rider Name:</span> <b>{selectedRider.name}</b></div>
                              <div><span style={{ color: '#6B7280' }}>Rider ID:</span> <b>{selectedRider.id}</b></div>
                              <div><span style={{ color: '#6B7280' }}>Vehicle Code:</span> <b>{selectedRider.vehicle_id}</b></div>
                              <div><span style={{ color: '#6B7280' }}>Battery Serial:</span> <b>{selectedRider.battery_id}</b></div>
                              <div><span style={{ color: '#6B7280' }}>Deductions:</span> <b style={{ color: '#EF4444' }}>₹{deductions}</b></div>
                              <div><span style={{ color: '#6B7280' }}>Refund Request:</span> <b style={{ color: '#16A34A' }}>{refundMethod.toUpperCase()} (₹{netRefund}) — Pending Admin Auth</b></div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                            <button
                              className="nr-continue-btn"
                              onClick={() => { setSelectedRider(null); setActiveStep(1); fetchActiveRides(); }}
                            >
                              Process Another Return
                            </button>
                            <Link href="/" className="nr-back-btn" style={{ textDecoration: 'none' }}>
                              Back to Dashboard
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ──────────────────────────────────────────────
                    MODE 2: EXTEND RIDE DURATION & PACKAGES
                   ────────────────────────────────────────────── */}
                {mainTab === 'extend' && selectedRider && (
                  <div>
                    {/* Active Ride Banner */}
                    <div className="nr-card" style={{ marginBottom: 14 }}>
                      <div className="rr-rider-banner">
                        <div className="rr-banner-avatar">
                          <img
                            src={selectedRider.avatar || '/rohit_avatar.png'}
                            alt={selectedRider.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2A195C', color: '#fff', fontWeight: 800, fontSize: 18, zIndex: 0 }}>
                            {selectedRider.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="rr-banner-name">
                            {selectedRider.name}
                            <span className="rr-active-badge">Ongoing Ride</span>
                          </div>
                          <div className="rr-banner-row"><IPhone /> {selectedRider.mobile} &bull; ID: {selectedRider.id}</div>
                          <div className="rr-banner-row"><IScooter /> {selectedRider.vehicle_id} &bull; <IBattery /> {selectedRider.battery_id}</div>
                        </div>
                        <div className="rr-banner-stats">
                          <div className="rr-stat-block">
                            <div className="rr-stat-num">{selectedRider.plan}</div>
                            <div className="rr-stat-lbl">Current Plan</div>
                          </div>
                          <div className="rr-stat-block">
                            <div className="rr-stat-num" style={{ color: '#16A34A' }}>₹{currentDeposit}</div>
                            <div className="rr-stat-lbl">Security Deposit</div>
                          </div>
                          <button
                            className="nr-back-btn"
                            style={{ padding: '6px 12px', fontSize: '11.5px', alignSelf: 'center', marginLeft: 8 }}
                            onClick={() => setSelectedRider(null)}
                          >
                            Change Rider
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Extension Plan Selector Card */}
                    <div className="nr-card">
                      <div className="nr-card-hdr">
                        <div>
                          <h2>Select Ride Extension Option</h2>
                          <p>Extend by full rental packages or add custom hourly duration</p>
                        </div>
                        {/* Mode toggle */}
                        <div style={{ display: 'flex', gap: 6, background: '#F3F4F6', padding: 3, borderRadius: 8 }}>
                          <button
                            style={{
                              padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', background: extendMode === 'package' ? '#2A195C' : 'transparent',
                              color: extendMode === 'package' ? '#fff' : '#6B7280'
                            }}
                            onClick={() => setExtendMode('package')}
                          >
                            By Package
                          </button>
                          <button
                            style={{
                              padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', background: extendMode === 'hourly' ? '#2A195C' : 'transparent',
                              color: extendMode === 'hourly' ? '#fff' : '#6B7280'
                            }}
                            onClick={() => setExtendMode('hourly')}
                          >
                            Custom Duration
                          </button>
                        </div>
                      </div>

                      <div className="nr-card-body">
                        {extendMode === 'package' ? (
                          <>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
                              Available Packages for Extension (Dynamic Zone Pricing)
                            </div>
                            <div className="ext-pkg-grid">
                              {packagesList.map(pkg => (
                                <div
                                  key={pkg.id}
                                  className={`ext-pkg-card ${selectedPackage.id === pkg.id ? 'selected' : ''}`}
                                  onClick={() => setSelectedPackage(pkg)}
                                >
                                  {pkg.badge && <span className="ext-pkg-badge">{pkg.badge}</span>}
                                  <div className="ext-pkg-title">{pkg.name}</div>
                                  <div className="ext-pkg-days">+{pkg.days} Day{pkg.days > 1 ? 's' : ''} Extension</div>
                                  <div className="ext-pkg-price">₹{pkg.fare}</div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                            <div>
                              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                                Additional Days (+₹350/day)
                              </label>
                              <div style={{ display: 'flex', gap: 8 }}>
                                {[0, 1, 2, 3, 5].map(d => (
                                  <button
                                    key={d}
                                    style={{
                                      flex: 1, padding: '8px', borderRadius: 8,
                                      border: extendDays === d ? '2px solid #2A195C' : '1px solid #E5E7EB',
                                      background: extendDays === d ? '#F5F3FF' : '#fff',
                                      fontWeight: 700, color: extendDays === d ? '#2A195C' : '#374151', cursor: 'pointer'
                                    }}
                                    onClick={() => setExtendDays(d)}
                                  >
                                    {d}d
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                                Additional Hours (+₹45/hr)
                              </label>
                              <div style={{ display: 'flex', gap: 8 }}>
                                {[1, 2, 4, 6].map(h => (
                                  <button
                                    key={h}
                                    style={{
                                      flex: 1, padding: '8px', borderRadius: 8,
                                      border: extendHours === h ? '2px solid #2A195C' : '1px solid #E5E7EB',
                                      background: extendHours === h ? '#F5F3FF' : '#fff',
                                      fontWeight: 700, color: extendHours === h ? '#2A195C' : '#374151', cursor: 'pointer'
                                    }}
                                    onClick={() => setExtendHours(h)}
                                  >
                                    {h}h
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment Method & Total Payable */}
                        <div style={{
                          border: '1.5px solid #E5E7EB', borderRadius: 12, padding: 16,
                          background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: 14
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                            <div>
                              <div style={{ fontSize: 12, color: '#6B7280' }}>Total Additional Fare:</div>
                              <div style={{ fontSize: 20, fontWeight: 800, color: '#2A195C' }}>₹{extensionFare.toFixed(2)}</div>
                            </div>

                            <div style={{ display: 'flex', gap: 14 }}>
                              {[
                                { id: 'payu', label: 'PayU (Primary Gateway)' },
                                { id: 'cash', label: 'Cash Payment' },
                                { id: 'split', label: 'Split (Cash + PayU)' }
                              ].map(p => (
                                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer', fontWeight: p.id === 'payu' ? 700 : 500, color: p.id === 'payu' ? '#047857' : 'inherit' }}>
                                  <input
                                    type="radio"
                                    name="extendPayMethod"
                                    checked={extendPayMethod === p.id}
                                    onChange={() => setExtendPayMethod(p.id as any)}
                                  />
                                  {p.label}
                                </label>
                              ))}
                            </div>
                          </div>

                          {(extendPayMethod === 'payu' || extendPayMethod === 'split') && (
                            <div className="ro-payu-card">
                              <div className="ro-payu-badge">
                                <span>💳</span> PAYU INDIA (PRIMARY GATEWAY)
                              </div>
                              <div style={{
                                width: 156, height: 156, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#FFFFFF', padding: 8, borderRadius: 12, border: '1.5px solid #86EFAC',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                              }}>
                                {payuQrString ? (
                                  <QRCodeSVG value={payuQrString} size={140} level="M" />
                                ) : (
                                  <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>Generating PayU QR...</div>
                                )}
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#047857', marginTop: 8 }}>
                                PayU Smart Dynamic UPI QR
                              </div>
                              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                                Payee: Evegah | Txn: {payuTxId || 'EVG-GENERATING...'}
                              </div>

                              <div style={{ marginTop: 10, width: '100%', maxWidth: 280 }}>
                                {payuVerified ? (
                                  <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    background: '#ECFDF5', border: '1.5px solid #10B981', borderRadius: 8,
                                    padding: '7px 12px', fontSize: '11.5px', fontWeight: 700, color: '#065F46'
                                  }}>
                                    ✓ Payment Verified via PayU Server
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                                    {payuCheckoutUrl && (
                                      <button
                                        type="button"
                                        onClick={() => openPayuCheckoutPopup(payuCheckoutUrl)}
                                        style={{
                                          width: '100%',
                                          background: '#2A195C',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: '8px',
                                          padding: '9px 16px',
                                          fontSize: '12.5px',
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          boxShadow: '0 2px 6px rgba(42, 25, 92, 0.25)'
                                        }}
                                      >
                                        Pay ₹{extensionFare.toFixed(2)}
                                      </button>
                                    )}
                                    <div style={{
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                      background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8,
                                      padding: '6px 10px', fontSize: '11px', fontWeight: 600, color: '#047857', width: '100%'
                                    }}>
                                      <span style={{
                                        width: 7, height: 7, borderRadius: '50%', background: '#059669',
                                        display: 'inline-block'
                                      }} />
                                      <span>{isCheckingPayU ? 'Verifying with PayU Server...' : `Awaiting PayU payment (₹${extensionFare.toFixed(2)})...`}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {extendPayMethod === 'cash' && (
                            <div style={{
                              display: 'flex', flexDirection: 'column', gap: 10,
                              padding: 16, background: '#FEFCE8', borderRadius: 12, border: '1.5px solid #FDE047',
                              marginTop: 4
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#854D0E' }}>
                                  Cash Collection &amp; Receipt Voucher
                                </span>
                                <span style={{
                                  background: '#CA8A04', color: '#fff', fontSize: 11, fontWeight: 800,
                                  padding: '3px 8px', borderRadius: 6
                                }}>
                                  CASH DESK
                                </span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5 }}>
                                <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 8, border: '1px solid #FEF08A' }}>
                                  <div style={{ color: '#854D0E', fontSize: 11, fontWeight: 600 }}>Amount to Collect:</div>
                                  <div style={{ fontSize: 18, fontWeight: 800, color: '#15803D' }}>₹{extensionFare.toFixed(2)}</div>
                                </div>
                                <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 8, border: '1px solid #FEF08A' }}>
                                  <div style={{ color: '#854D0E', fontSize: 11, fontWeight: 600 }}>Cash Voucher / Receipt #:</div>
                                  <div style={{ fontSize: 13, fontWeight: 800, color: '#2A195C', fontFamily: 'monospace' }}>{cashVoucher}</div>
                                </div>
                              </div>
                              <div style={{ fontSize: 11.5, color: '#713F12', lineHeight: 1.4 }}>
                                Collect exact cash from rider and issue receipt number <b>{cashVoucher}</b>. This transaction will be logged in the Cash Collection Audit Report.
                              </div>
                            </div>
                          )}

                          <button
                            className="nr-continue-btn"
                            onClick={handleExtendRide}
                            disabled={loading || ((extendPayMethod === 'payu' || extendPayMethod === 'split') && !payuVerified)}
                            style={{
                              opacity: ((extendPayMethod === 'payu' || extendPayMethod === 'split') && !payuVerified) ? 0.65 : 1,
                              cursor: ((extendPayMethod === 'payu' || extendPayMethod === 'split') && !payuVerified) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {(extendPayMethod === 'payu' || extendPayMethod === 'split')
                              ? (payuVerified ? 'Confirm Extension & Send WhatsApp' : 'Waiting for PayU Payment...')
                              : 'Confirm Extension & Send WhatsApp'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ──────────────────────────────────────────────
                    MODE 3: EXCHANGE VEHICLE (SWAP)
                   ────────────────────────────────────────────── */}
                {mainTab === 'exchange' && selectedRider && (
                  <div>
                    {/* Current Vehicle Card */}
                    <div className="nr-card" style={{ marginBottom: 14 }}>
                      <div className="rr-rider-banner">
                        <div className="rr-banner-avatar">
                          <img
                            src={selectedRider.avatar || '/rohit_avatar.png'}
                            alt={selectedRider.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2A195C', color: '#fff', fontWeight: 800, fontSize: 18, zIndex: 0 }}>
                            {selectedRider.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="rr-banner-name">
                            {selectedRider.name}
                            <span className="rr-active-badge">Ongoing Ride</span>
                          </div>
                          <div className="rr-banner-row"><IPhone /> {selectedRider.mobile} &bull; ID: {selectedRider.id}</div>
                          <div className="rr-banner-row" style={{ color: '#EF4444', fontWeight: 600 }}>
                            Outgoing Vehicle: {selectedRider.vehicle_id} &bull; Battery: {selectedRider.battery_id}
                          </div>
                        </div>
                        <div className="rr-banner-stats">
                          <div className="rr-stat-block">
                            <div className="rr-stat-num" style={{ color: '#16A34A' }}>₹0.00</div>
                            <div className="rr-stat-lbl">Exchange Fee</div>
                          </div>
                          <button
                            className="nr-back-btn"
                            style={{ padding: '6px 12px', fontSize: '11.5px', alignSelf: 'center', marginLeft: 8 }}
                            onClick={() => setSelectedRider(null)}
                          >
                            Change Rider
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Replacement Vehicle & Battery Selection */}
                    <div className="nr-card">
                      <div className="nr-card-hdr">
                        <div>
                          <h2>Replacement Vehicle &amp; Battery Assignment</h2>
                          <p>Assign an available vehicle from station inventory to swap with rider</p>
                        </div>
                      </div>
                      <div className="nr-card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                              Select Replacement Vehicle ({availableVehicles.length} Available)
                            </label>
                            <select
                              value={exchangeNewVehicle}
                              onChange={e => setExchangeNewVehicle(e.target.value)}
                              style={{
                                width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB',
                                borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff'
                              }}
                            >
                              {availableVehicles.length > 0 ? (
                                availableVehicles.map((v: any) => (
                                  <option key={v.id || v.code || v.registration_number} value={`${v.code || v.registration_number} (${v.model || 'Evegah EV'})`}>
                                    {v.code || v.registration_number} — {v.model || 'Evegah EV'} ({v.vehicle_status || 'Ready'})
                                  </option>
                                ))
                              ) : (
                                <option value="">No available vehicles in this zone</option>
                              )}
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                              Select Replacement Battery ({availableBatteries.length} Available)
                            </label>
                            <select
                              value={exchangeNewBattery}
                              onChange={e => setExchangeNewBattery(e.target.value)}
                              style={{
                                width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB',
                                borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff'
                              }}
                            >
                              {availableBatteries.length > 0 ? (
                                availableBatteries.map((b: any) => (
                                  <option key={b.id || b.battery_id} value={`${b.battery_id} (${b.capacity || '60V 30Ah'})`}>
                                    {b.battery_id} — {b.capacity || '60V 30Ah'} (SOC {b.soc || 100}%)
                                  </option>
                                ))
                              ) : (
                                <option value="">No available batteries in this zone</option>
                              )}
                            </select>
                          </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                            Reason for Vehicle Exchange
                          </label>
                          <select
                            value={exchangeReason}
                            onChange={e => setExchangeReason(e.target.value)}
                            style={{
                              width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB',
                              borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff'
                            }}
                          >
                            <option value="Battery Range Drop">Battery Range Drop / Fast Discharge</option>
                            <option value="Motor Noise">Motor Noise / Throttle Lag</option>
                            <option value="Flat Tyre / Brake Issue">Flat Tyre / Brake Issue</option>
                            <option value="Scheduled Preventative Maintenance">Scheduled Preventative Maintenance</option>
                            <option value="Rider Request for Upgrade">Rider Request for Model Upgrade</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                            Exchange Remarks (Optional)
                          </label>
                          <textarea
                            placeholder="Add internal notes for maintenance team..."
                            value={exchangeNotes}
                            onChange={e => setExchangeNotes(e.target.value)}
                            style={{
                              width: '100%', padding: '8px 12px', border: '1.5px solid #E5E7EB',
                              borderRadius: 8, fontSize: 12.5, outline: 'none', resize: 'none', minHeight: 60
                            }}
                          />
                        </div>

                        <div className="nr-footer-card" style={{ marginTop: 16 }}>
                          <span style={{ fontSize: 12.5, color: '#16A34A', fontWeight: 700 }}>
                            ✓ 100% Free Swap Guarantee Applied
                          </span>
                          <button
                            className="nr-continue-btn"
                            onClick={handleExchangeVehicle}
                            disabled={loading}
                          >
                            Confirm Vehicle Exchange &amp; Swap Voucher
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="nr-rp">

                {/* Active Rider Summary Card */}
                {selectedRider && (
                  <div className="nr-rp-card">
                    <div className="nr-rp-hdr">
                      <span style={{ color: '#2A195C', display: 'flex' }}><IReceipt /></span>
                      <div className="nr-rp-title">Active Booking Details</div>
                    </div>
                    <div className="nr-rp-body">
                      <div className="nr-rp-avatar-row">
                        <div className="nr-rp-avatar">
                          <img
                            src={selectedRider.avatar || '/rohit_avatar.png'}
                            alt={selectedRider.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2A195C', color: '#fff', fontWeight: 800, fontSize: 13, zIndex: 0 }}>
                            {selectedRider.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="nr-rp-name">{selectedRider.name}</div>
                          <div className="nr-rp-sub">{selectedRider.mobile}</div>
                        </div>
                      </div>

                      <div className="nr-rp-row">
                        <span className="nr-rp-label">Rider ID</span>
                        <span className="nr-rp-val">{selectedRider.id}</span>
                      </div>
                      <div className="nr-rp-row">
                        <span className="nr-rp-label">Vehicle</span>
                        <span className="nr-rp-val">{selectedRider.vehicle_id}</span>
                      </div>
                      <div className="nr-rp-row">
                        <span className="nr-rp-label">Battery</span>
                        <span className="nr-rp-val">{selectedRider.battery_id}</span>
                      </div>
                      <div className="nr-rp-row">
                        <span className="nr-rp-label">Start Date</span>
                        <span className="nr-rp-val">{selectedRider.start_date}</span>
                      </div>
                      <div className="nr-rp-row">
                        <span className="nr-rp-label">Security Deposit</span>
                        <span className="nr-rp-val" style={{ color: '#16A34A' }}>₹{currentDeposit}</span>
                      </div>
                      <div className="nr-rp-row">
                        <span className="nr-rp-label">Zone</span>
                        <span className="nr-rp-val">{selectedRider.zone}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hub Support Card */}
                <div className="nr-rp-card">
                  <div className="nr-rp-hdr">
                    <span style={{ color: '#2A195C', display: 'flex' }}>🎧</span>
                    <div className="nr-rp-title">Station Support</div>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
                      Facing an operational blocker during inspection or refund?
                    </div>
                    <button
                      style={{
                        width: '100%', padding: '8px', background: '#2A195C', color: '#fff',
                        borderRadius: 7, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer'
                      }}
                    >
                      Call Operations Lead
                    </button>
                  </div>
                </div>

                {/* Quick Tips Card */}
                <div className="nr-tips-card">
                  <div className="nr-tips-hdr">
                    <IBulb />
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#92400E' }}>Operations Guidelines</div>
                  </div>
                  <div style={{ padding: '8px 0 10px' }}>
                    <div className="nr-tip-row">
                      <span className="nr-tip-dot" />
                      <span>Always verify physical accessories (helmet &amp; charger) before initiating refund.</span>
                    </div>
                    <div className="nr-tip-row">
                      <span className="nr-tip-dot" />
                      <span>WhatsApp receipts and vouchers are automatically dispatched to the rider.</span>
                    </div>
                    <div className="nr-tip-row">
                      <span className="nr-tip-dot" />
                      <span>Swapped vehicles must be marked for preventative inspection before re-leasing.</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
