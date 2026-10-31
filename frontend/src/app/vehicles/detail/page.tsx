'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

declare global {
  interface Window {
    L: any;
  }
}
declare var L: any;

/* ──────────────────────────────────────────────────────────────
   VEHICLE DETAIL PAGE · Modern SaaS Diagnostic & Fleet Management
   ────────────────────────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

.vd-shell {
  display: flex;
  min-height: 100vh;
  background: #F8FAFC;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0F172A;
}
.vd-main {
  margin-left: 230px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100% - 230px);
}
.vd-page {
  flex: 1;
  padding: 20px 24px 60px;
}

/* Breadcrumb */
.vd-bc-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}
.vd-bc-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #64748B;
  font-weight: 500;
}
.vd-back-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid #E2E8F0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  text-decoration: none;
  transition: all .15s;
}
.vd-back-btn:hover {
  color: #6366F1;
  border-color: #6366F1;
  background: #EEF2FF;
}
.vd-bc-left a {
  color: #64748B;
  text-decoration: none;
  transition: color .15s;
}
.vd-bc-left a:hover {
  color: #6366F1;
}
.vd-bc-sep {
  color: #CBD5E1;
}
.vd-bc-cur {
  color: #0F172A;
  font-weight: 700;
}

/* Vehicle Switcher in header */
.vd-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}
.vd-switcher select {
  padding: 6px 12px;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #0F172A;
  background: #fff;
  cursor: pointer;
  outline: none;
}
.vd-switcher select:focus {
  border-color: #6366F1;
}

/* Header Title row */
.vd-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}
.vd-title-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vd-title-h1-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.vd-h1 {
  font-size: 24px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.02em;
}
.vd-sub {
  font-size: 13px;
  color: #64748B;
  margin: 0;
  font-weight: 500;
}
.vd-active-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}
.vd-badge-available {
  background: #DCFCE7;
  color: #15803D;
  border: 1px solid #BBF7D0;
}
.vd-badge-inride {
  background: #DBEAFE;
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
}
.vd-badge-maintenance {
  background: #FEF9C3;
  color: #A16207;
  border: 1px solid #FEF08A;
}
.vd-badge-offline {
  background: #F1F5F9;
  color: #64748B;
  border: 1px solid #E2E8F0;
}

.vd-hdr-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.vd-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fff;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all .15s;
  text-decoration: none;
}
.vd-btn:hover {
  border-color: #6366F1;
  color: #6366F1;
}
.vd-btn.primary {
  background: #6366F1;
  color: #fff;
  border-color: #6366F1;
  box-shadow: 0 4px 12px rgba(99,102,241,0.25);
}
.vd-btn.primary:hover {
  background: #4f46e5;
  color: #fff;
}

/* Vehicle Hero Card with Image + KPI Strip */
.vd-hero-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 18px 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,.02);
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.vd-hero-img-box {
  width: 100px;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8FAFC;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 6px;
  flex-shrink: 0;
}
.vd-hero-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.vd-kpi-strip {
  flex: 1;
  min-width: 280px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
.vd-kpi-item {
  border-right: 1px solid #F1F5F9;
  padding-right: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.vd-kpi-item:last-child {
  border-right: none;
  padding-right: 0;
}
.vd-kpi-lbl {
  font-size: 11px;
  color: #64748B;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  gap: 5px;
}
.vd-kpi-val {
  font-size: 17px;
  font-weight: 800;
  color: #0F172A;
  font-family: 'Outfit', sans-serif;
}
.vd-bat-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}
.vd-bat-bar {
  width: 80px;
  height: 6px;
  background: #E2E8F0;
  border-radius: 3px;
  overflow: hidden;
}
.vd-bat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width .3s ease;
}

/* Tabs */
.vd-tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1.5px solid #E2E8F0;
  margin-bottom: 20px;
  overflow-x: auto;
  white-space: nowrap;
}
.vd-tab {
  padding: 10px 4px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  cursor: pointer;
  position: relative;
  transition: color .15s;
}
.vd-tab:hover {
  color: #6366F1;
}
.vd-tab.active {
  color: #6366F1;
  font-weight: 700;
}
.vd-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1.5px;
  left: 0;
  right: 0;
  height: 2.5px;
  background: #6366F1;
  border-radius: 2px 2px 0 0;
}

/* Overview 6-Card Grid */
.vd-overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

/* Base Card */
.vd-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.02);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.vd-card-hdr {
  padding: 14px 18px;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13.5px;
  font-weight: 700;
  color: #0F172A;
  background: #FAFBFD;
}
.vd-card-hdr-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0F172A;
}
.vd-card-body {
  padding: 16px 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Key-Value rows */
.vd-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  padding: 6px 0;
  border-bottom: 1px solid #F8FAFC;
}
.vd-row:last-child {
  border-bottom: none;
}
.vd-row-lbl {
  color: #64748B;
  font-weight: 500;
}
.vd-row-val {
  font-weight: 700;
  color: #0F172A;
  text-align: right;
  display: flex;
  align-items: center;
  gap: 6px;
}
.vd-copy-btn {
  color: #94A3B8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  padding: 2px;
}
.vd-copy-btn:hover {
  color: #6366F1;
}

/* Actions Grid (inside Card 1) */
.vd-action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.vd-act-btn {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px solid #E2E8F0;
  background: #fff;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all .15s;
}
.vd-act-btn:hover {
  border-color: #6366F1;
  color: #6366F1;
  background: #EEF2FF;
}
.vd-act-btn.active {
  background: #6366F1;
  color: #fff;
  border-color: #6366F1;
}
.vd-act-btn.danger {
  color: #EF4444;
  border-color: #FEE2E2;
  background: #FEF2F2;
}
.vd-act-btn.danger:hover {
  background: #FEE2E2;
  border-color: #EF4444;
}

/* Map Box in Card 5 */
.vd-map-container {
  width: 100%;
  height: 220px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #E2E8F0;
  position: relative;
  background: #E2E8F0;
}
.vd-map-elem {
  width: 100%;
  height: 100%;
}
.vd-map-ctrls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  z-index: 500;
}
.vd-map-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #CBD5E1;
  font-size: 14px;
  font-weight: 800;
  color: #1E293B;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,.08);
}
.vd-map-btn:hover {
  background: #F8FAFC;
  color: #6366F1;
}

/* Today Summary Mini Grid */
.vd-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 4px;
}
.vd-summary-box {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.vd-summary-box-lbl {
  font-size: 10.5px;
  color: #64748B;
  font-weight: 700;
  text-transform: uppercase;
}
.vd-summary-box-val {
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
  font-family: 'Outfit', sans-serif;
}

/* Modal Overlay */
.vd-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}
.vd-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.vd-modal-hdr {
  padding: 16px 20px;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 800;
  font-size: 15px;
  background: #FAFBFD;
}
.vd-modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.vd-modal-ft {
  padding: 14px 20px;
  border-top: 1px solid #F1F5F9;
  background: #FAFBFD;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Responsive Rules for 14-inch Screens */
@media (max-width: 1440px) {
  .vd-page { padding: 16px 20px 40px; }
  .vd-hero-card { padding: 14px 18px; gap: 16px; margin-bottom: 16px; }
  .vd-kpi-strip { gap: 12px; }
  .vd-kpi-val { font-size: 15px; }
  .vd-overview-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .vd-card-hdr { padding: 12px 14px; }
  .vd-card-body { padding: 14px; gap: 10px; }
}

@media (max-width: 1180px) {
  .vd-overview-grid { grid-template-columns: repeat(2, 1fr); }
  .vd-kpi-strip { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .vd-overview-grid { grid-template-columns: 1fr; }
  .vd-kpi-strip { grid-template-columns: repeat(2, 1fr); }
}

/* Zomato / Rapido Real-Time Tracking Marker */
.zomato-tracking-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.zomato-speed-badge {
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(4px);
  color: #fff;
  border-radius: 20px;
  padding: 3px 9px;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
  margin-bottom: 4px;
  letter-spacing: 0.02em;
  border: 1px solid rgba(255,255,255,0.2);
}
.zomato-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22C55E;
}
.zomato-status-dot.moving {
  background: #3B82F6;
  box-shadow: 0 0 6px #3B82F6;
}
.zomato-bike-pod {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  border: 2.5px solid #6366F1;
  box-shadow: 0 6px 16px rgba(99,102,241,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.2s ease;
}
.zomato-bike-pod.available {
  border-color: #16A34A;
  box-shadow: 0 6px 16px rgba(22,163,74,0.35);
}
.zomato-bike-img {
  width: 34px;
  height: 34px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}
.zomato-radar-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.4);
  animation: zomatoRadar 1.8s ease-out infinite;
  pointer-events: none;
  z-index: -1;
}
@keyframes zomatoRadar {
  0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
}
`;

const SI = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const Sv = (p: React.SVGProps<SVGSVGElement> & { s?: number }) => (
  <svg width={p.s || 14} height={p.s || 14} viewBox="0 0 24 24" {...SI} {...p} />
);

const ILocate      = () => <Sv><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></Sv>;
const IScooter     = ({ s = 14 }) => <Sv s={s}><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" /><path d="M5.5 17.5l4-8h4l2.5 8" /><path d="M8.5 12h5" /><path d="M12 9l-1.5 2.5h2L11 14" strokeWidth="1.8" /></Sv>;
const ILock        = () => <Sv><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Sv>;
const IUnlock      = () => <Sv><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></Sv>;
const IVolume      = () => <Sv><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></Sv>;
const IPower       = () => <Sv><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></Sv>;
const ICalendar    = () => <Sv><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Sv>;
const IFileText    = () => <Sv><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Sv>;
const IShield      = () => <Sv><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Sv>;
const IArrowLeft   = () => <Sv><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Sv>;
const ICopy        = () => <Sv><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Sv>;
const ICheckCircle = ({ s = 14 }) => <Sv s={s}><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></Sv>;
const IAlertOctagon = () => <Sv><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Sv>;
const IWrench      = ({ s = 14 }) => <Sv s={s}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></Sv>;
const IMapPin      = () => <Sv><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Sv>;
const IBattery     = () => <Sv><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></Sv>;

function VehicleDetailContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code');

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<any>(null);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Live Tracking' | 'Ride History' | 'Alerts' | 'Maintenance' | 'Documents'>('Overview');

  // Interactive Action states
  const [isLocked, setIsLocked] = useState(true);
  const [isImmobilized, setIsImmobilized] = useState(false);
  const [isBuzzerActive, setIsBuzzerActive] = useState(false);

  // Change Zone modal state
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [selectedNewZone, setSelectedNewZone] = useState('');
  const [savingZone, setSavingZone] = useState(false);
  const [availableZones, setAvailableZones] = useState<string[]>([]);

  // Leaflet map refs
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapInstance = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const LRef = useRef<any>(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    triggerToast(`Copied: ${text}`);
  };

  // 1. Fetch available zones
  useEffect(() => {
    api.get('/zones').then((res: any) => {
      if (res && res.data) {
        const names = res.data.map((z: any) => z.name || z.locality).filter(Boolean);
        setAvailableZones([...new Set<string>(names)]);
      }
    }).catch(() => {});
  }, []);

  // 2. Fetch all vehicles for quick switcher
  useEffect(() => {
    api.get('/vehicles').then((res: any) => {
      if (res && res.status === 'success' && res.data) {
        setAllVehicles(res.data);
      }
    }).catch(() => {});
  }, []);

  // 3. Fetch current vehicle data by codeParam (or default to first)
  const fetchVehicleData = (codeToFetch: string) => {
    setLoading(true);
    api.get(`/vehicles/${codeToFetch}`)
      .then((res: any) => {
        if (res && res.status === 'success' && res.data) {
          setVehicle(res.data);
          setSelectedNewZone(res.data.zone || 'Gotri Zone');
        }
      })
      .catch(err => {
        console.error('Failed to fetch vehicle details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (codeParam) {
      fetchVehicleData(codeParam);
    } else {
      // If no code in query, find first vehicle in fleet
      api.get('/vehicles').then((res: any) => {
        if (res && res.data && res.data.length > 0) {
          fetchVehicleData(res.data[0].code);
        } else {
          fetchVehicleData('EVM1024011');
        }
      }).catch(() => fetchVehicleData('EVM1024011'));
    }
  }, [codeParam]);

  // Dynamic Leaflet Loader
  useEffect(() => {
    if (window.L) {
      LRef.current = window.L;
      setLeafletLoaded(true);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      LRef.current = (window as any).L;
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize or re-center Leaflet Map for vehicle zone coordinates
  useEffect(() => {
    if (!leafletLoaded || !LRef.current || !mapContainerRef.current || !vehicle) return;

    // Zone coordinate map
    const zoneCoords: Record<string, [number, number]> = {
      'gotri': [22.3168, 73.1415],
      'manjalpur': [22.2684, 73.1952],
      'kpgu': [22.3400, 73.2200],
      'aatapi': [22.1800, 73.2500],
      'sayajigunj': [22.3100, 73.1850],
      'alkapuri': [22.3120, 73.1700],
    };

    let targetLat = vehicle.lat ? parseFloat(vehicle.lat) : 0;
    let targetLng = vehicle.lng ? parseFloat(vehicle.lng) : 0;

    if (!targetLat || !targetLng) {
      const zKey = (vehicle.zone || '').toLowerCase();
      const matchedKey = Object.keys(zoneCoords).find(k => zKey.includes(k));
      if (matchedKey) {
        [targetLat, targetLng] = zoneCoords[matchedKey];
      } else {
        [targetLat, targetLng] = [22.3168, 73.1415];
      }
    }

    const L = LRef.current;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([targetLat, targetLng], 14);

    mapInstance.current = map;

    // CartoDB light tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Geofence Circle
    L.circle([targetLat, targetLng], {
      color: '#6366F1',
      fillColor: '#6366F1',
      fillOpacity: 0.1,
      radius: 1200,
      weight: 1.5,
      dashArray: '5, 5'
    }).addTo(map);

    // Model 3D image
    let modelImg = vehicle.vehicle_image;
    if (!modelImg || modelImg.trim() === '') {
      const mName = (vehicle.evegah_model_name || '').toLowerCase();
      if (mName.includes('mink')) modelImg = '/Mink-1.png';
      else if (mName.includes('fly')) modelImg = '/fly-1.png';
      else if (mName.includes('pro')) modelImg = '/pro-1.png';
      else modelImg = '/City-1.png';
    }

    const isAvailable = vehicle.vehicle_status === 'Available';
    const isMoving = !isAvailable && (vehicle.speed > 0 || true);

    const vehicleIcon = L.divIcon({
      className: 'zomato-tracking-marker',
      html: `
        <div class="zomato-tracking-marker">
          ${isMoving ? '<div class="zomato-radar-pulse"></div>' : ''}
          <div class="zomato-speed-badge">
            <span class="zomato-status-dot ${isAvailable ? '' : 'moving'}"></span>
            ${vehicle.code} • ${isAvailable ? 'Ready' : (vehicle.speed || 24) + ' km/h'}
          </div>
          <div class="zomato-bike-pod ${isAvailable ? 'available' : 'moving'}">
            <img src="${modelImg}" class="zomato-bike-img" alt="${vehicle.code}" />
          </div>
        </div>
      `,
      iconSize: [120, 80],
      iconAnchor: [60, 50]
    });

    L.marker([targetLat, targetLng], { icon: vehicleIcon }).addTo(map);

    // Route tracking polyline
    const routeCoords = [
      [targetLat - 0.0035, targetLng - 0.0042],
      [targetLat - 0.0020, targetLng - 0.0028],
      [targetLat - 0.0010, targetLng - 0.0012],
      [targetLat, targetLng]
    ];
    L.polyline(routeCoords, {
      color: isAvailable ? '#10B981' : '#6366F1',
      weight: 4,
      opacity: 0.85,
      dashArray: isAvailable ? '6, 6' : undefined
    }).addTo(map);

    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [leafletLoaded, vehicle, activeTab]);

  // Handle Zone Change
  const handleSaveZoneChange = async () => {
    if (!vehicle || !selectedNewZone) return;
    setSavingZone(true);
    try {
      await api.patch(`/vehicles/${vehicle.id}/zone`, { zone: selectedNewZone });
      triggerToast(`Zone updated to ${selectedNewZone}!`);
      setIsZoneModalOpen(false);
      fetchVehicleData(vehicle.code);
    } catch (err: any) {
      alert(`Failed to update zone: ${err.message || err}`);
    } finally {
      setSavingZone(false);
    }
  };

  // Fallback vehicle info if still loading
  const code = vehicle?.code || codeParam || 'EVM1024011';
  const regNo = vehicle?.registration_number || code;
  const modelName = vehicle?.evegah_model_name || 'Evegah City';
  const category = vehicle?.vehicle_category || 'E-Scooter';
  const status = vehicle?.vehicle_status || 'Available';
  const batteryPct = vehicle?.battery_pct !== undefined ? vehicle.battery_pct : 88;
  const speed = vehicle?.speed || 0;
  const totalKm = vehicle?.total_km_covered || vehicle?.current_km_reading || '2,156';
  const zone = vehicle?.zone || 'Gotri Zone';
  const renterName = vehicle?.renter_name && vehicle.renter_name !== 'None (Available)' ? vehicle.renter_name : null;
  const activeRide = vehicle?.active_ride || null;
  const rideHistory = vehicle?.ride_history || [];
  const maintenanceOrders = vehicle?.maintenance_orders || [];

  // Determine Image
  let imgSrc = vehicle?.vehicle_image;
  if (!imgSrc || imgSrc.trim() === '') {
    if (modelName.toLowerCase().includes('mink')) imgSrc = '/Mink-1.png';
    else if (modelName.toLowerCase().includes('fly')) imgSrc = '/fly-1.png';
    else if (modelName.toLowerCase().includes('pro')) imgSrc = '/pro-1.png';
    else imgSrc = '/City-1.png';
  }

  const barColor = batteryPct < 25 ? '#EF4444' : batteryPct < 55 ? '#F59E0B' : '#10B981';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="vd-shell">
        <Sidebar activePath="/vehicles/detail" />
        <div className="vd-main">
          <TopBar title="Vehicle Details" subtitle="Inventory > Fleet Diagnostics" />

          {/* Toast Notification */}
          {toastMsg && (
            <div style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: '#0F172A',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
              zIndex: 9999,
              borderLeft: '4px solid #10B981'
            }}>
              {toastMsg}
            </div>
          )}

          <div className="vd-page">
            {/* Breadcrumb & Switcher Row */}
            <div className="vd-bc-container">
              <div className="vd-bc-left">
                <Link href="/vehicles/all" className="vd-back-btn" title="Back to Vehicle List">
                  <IArrowLeft />
                </Link>
                <Link href="/vehicles/all">Vehicles</Link>
                <span className="vd-bc-sep">›</span>
                <span className="vd-bc-cur">{code} Details</span>
              </div>

              {/* Quick Fleet Switcher */}
              <div className="vd-switcher">
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Switch Vehicle:</span>
                <select 
                  value={code} 
                  onChange={(e) => {
                    const newCode = e.target.value;
                    window.location.href = `/vehicles/detail?code=${newCode}`;
                  }}
                >
                  {allVehicles.length > 0 ? (
                    allVehicles.map(v => (
                      <option key={v.code} value={v.code}>
                        {v.code} • {v.evegah_model_name || 'EV'} ({v.vehicle_status})
                      </option>
                    ))
                  ) : (
                    <option value={code}>{code}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Title & Action Row */}
            <div className="vd-title-row">
              <div className="vd-title-left">
                <div className="vd-title-h1-row">
                  <h1 className="vd-h1">{code}</h1>
                  {regNo !== code && <span style={{ fontSize: 14, fontWeight: 700, color: '#64748B' }}>({regNo})</span>}
                  <span className={`vd-active-badge ${
                    status === 'Available' ? 'vd-badge-available' :
                    status === 'In Ride' ? 'vd-badge-inride' :
                    status === 'Maintenance' ? 'vd-badge-maintenance' : 'vd-badge-offline'
                  }`}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                    {status}
                  </span>
                </div>
                <p className="vd-sub">{category} • {modelName} • Assigned to <strong style={{ color: '#0F172A' }}>{zone}</strong></p>
              </div>

              <div className="vd-hdr-actions">
                <button className="vd-btn" onClick={() => setIsZoneModalOpen(true)}>
                  <IMapPin /> Change Zone
                </button>
                <Link href={`/vehicles/edit?code=${code}`} className="vd-btn">
                  <IWrench s={13}/> Edit Vehicle
                </Link>
                <Link href={`/vehicles/map?code=${code}`} className="vd-btn primary">
                  <ILocate /> Live Map
                </Link>
              </div>
            </div>

            {/* Hero Card: Image + Key Telemetry Strip */}
            <div className="vd-hero-card">
              <div className="vd-hero-img-box">
                <img src={imgSrc} alt={modelName} className="vd-hero-img" />
              </div>
              <div className="vd-kpi-strip">
                {/* Battery */}
                <div className="vd-kpi-item">
                  <span className="vd-kpi-lbl"><IBattery/> Battery SoC</span>
                  <div className="vd-kpi-val">{batteryPct}%</div>
                  <div className="vd-bat-bar-wrap">
                    <div className="vd-bat-bar">
                      <div className="vd-bat-bar-fill" style={{ width: `${batteryPct}%`, background: barColor }} />
                    </div>
                  </div>
                </div>

                {/* Speed */}
                <div className="vd-kpi-item">
                  <span className="vd-kpi-lbl"><IScooter s={12}/> Current Speed</span>
                  <div className="vd-kpi-val">{speed} km/h</div>
                  <span style={{ fontSize: 11, color: speed > 0 ? '#2563EB' : '#64748B', fontWeight: 600 }}>
                    {speed > 0 ? '● Moving in Zone' : 'Parked / Idle'}
                  </span>
                </div>

                {/* Odometer */}
                <div className="vd-kpi-item">
                  <span className="vd-kpi-lbl"><ICheckCircle s={12}/> Odometer</span>
                  <div className="vd-kpi-val">{Number(totalKm).toLocaleString()} km</div>
                  <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>Good Performance</span>
                </div>

                {/* Status / Renter */}
                <div className="vd-kpi-item">
                  <span className="vd-kpi-lbl"><IShield/> Current State</span>
                  <div className="vd-kpi-val" style={{ color: status === 'Available' ? '#16A34A' : '#2563EB' }}>
                    {status === 'Available' ? 'Ready' : 'In Ride'}
                  </div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {renterName ? `Rider: ${renterName}` : 'Available for booking'}
                  </span>
                </div>

                {/* Hub Location */}
                <div className="vd-kpi-item">
                  <span className="vd-kpi-lbl"><IMapPin/> Hub Zone</span>
                  <div className="vd-kpi-val" style={{ fontSize: 15 }}>{zone}</div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Operational Base</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="vd-tabs">
              {(['Overview', 'Live Tracking', 'Ride History', 'Alerts', 'Maintenance', 'Documents'] as const).map(tab => (
                <div 
                  key={tab} 
                  className={`vd-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* TAB CONTENT: 1. OVERVIEW (The 6 Dedicated Cards) */}
            {activeTab === 'Overview' && (
              <div className="vd-overview-grid">

                {/* CARD 1: Vehicle Actions */}
                <div className="vd-card">
                  <div className="vd-card-hdr">
                    <div className="vd-card-hdr-left"><ILock /> Vehicle Actions</div>
                    <span style={{ fontSize: 11, color: '#6366F1', fontWeight: 700 }}>Telemetry Control</span>
                  </div>
                  <div className="vd-card-body">
                    <div className="vd-action-grid">
                      <button 
                        className={`vd-act-btn ${isLocked ? 'active' : ''}`}
                        onClick={() => {
                          setIsLocked(!isLocked);
                          triggerToast(isLocked ? 'Vehicle Unlocked remotely' : 'Vehicle Locked remotely');
                        }}
                      >
                        {isLocked ? <ILock /> : <IUnlock />}
                        {isLocked ? 'Locked' : 'Unlocked'}
                      </button>

                      <button 
                        className={`vd-act-btn ${isBuzzerActive ? 'active' : ''}`}
                        onClick={() => {
                          setIsBuzzerActive(true);
                          triggerToast('Buzzer sound sent to vehicle horn! 🔔');
                          setTimeout(() => setIsBuzzerActive(false), 2500);
                        }}
                      >
                        <IVolume />
                        {isBuzzerActive ? 'Beeping...' : 'Buzzer'}
                      </button>

                      <button 
                        className={`vd-act-btn ${isImmobilized ? 'danger' : ''}`}
                        onClick={() => {
                          setIsImmobilized(!isImmobilized);
                          triggerToast(isImmobilized ? 'Engine Cutoff disabled' : 'Engine Cutoff Activated!');
                        }}
                      >
                        <IPower />
                        {isImmobilized ? 'Immobilized' : 'Cut-off'}
                      </button>

                      <button className="vd-act-btn" onClick={() => setIsZoneModalOpen(true)}>
                        <IMapPin />
                        Change Zone
                      </button>
                    </div>

                    <div style={{ marginTop: 8, borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
                      <Link 
                        href={`/vehicles/edit?code=${code}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '8px',
                          borderRadius: 8,
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#334155',
                          textDecoration: 'none'
                        }}
                      >
                        <IWrench s={13}/> Edit Full Vehicle Specs
                      </Link>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Vehicle Information */}
                <div className="vd-card">
                  <div className="vd-card-hdr">
                    <div className="vd-card-hdr-left"><IFileText /> Vehicle Information</div>
                  </div>
                  <div className="vd-card-body">
                    <div className="vd-row">
                      <span className="vd-row-lbl">Model Name</span>
                      <span className="vd-row-val">{modelName}</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Category / Type</span>
                      <span className="vd-row-val">{category} ({vehicle?.vehicle_type || 'Rental'})</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Reg. Number</span>
                      <span className="vd-row-val">{vehicle?.registration_number || 'Pending'}</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Chassis Number</span>
                      <span className="vd-row-val">
                        {vehicle?.chassis_number || 'CHAS-99214'}
                        <button className="vd-copy-btn" onClick={() => copyToClipboard(vehicle?.chassis_number || 'CHAS-99214')}><ICopy/></button>
                      </span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Motor Number</span>
                      <span className="vd-row-val">
                        {vehicle?.motor_number || 'MOT-8812'}
                        <button className="vd-copy-btn" onClick={() => copyToClipboard(vehicle?.motor_number || 'MOT-8812')}><ICopy/></button>
                      </span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Warranty Valid Till</span>
                      <span className="vd-row-val">{vehicle?.vehicle_warranty_expiry_date ? new Date(vehicle.vehicle_warranty_expiry_date).toLocaleDateString('en-GB') : '24 Dec 2026'}</span>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Current Ride */}
                <div className="vd-card">
                  <div className="vd-card-hdr">
                    <div className="vd-card-hdr-left"><IScooter s={14} /> Current Ride</div>
                    <span className={`vd-active-badge ${status === 'In Ride' ? 'vd-badge-inride' : 'vd-badge-available'}`}>
                      {status === 'In Ride' ? 'Active' : 'Available'}
                    </span>
                  </div>
                  <div className="vd-card-body">
                    {status === 'In Ride' || renterName ? (
                      <>
                        <div className="vd-row">
                          <span className="vd-row-lbl">Rider Name</span>
                          <span className="vd-row-val" style={{ color: '#6366F1' }}>
                            {renterName || activeRide?.rider_name || 'Active Renter'}
                          </span>
                        </div>
                        <div className="vd-row">
                          <span className="vd-row-lbl">Contact Phone</span>
                          <span className="vd-row-val">
                            {activeRide?.mobile || '+91 98251 44102'}
                            <button className="vd-copy-btn" onClick={() => copyToClipboard(activeRide?.mobile || '9825144102')}><ICopy/></button>
                          </span>
                        </div>
                        <div className="vd-row">
                          <span className="vd-row-lbl">Package Plan</span>
                          <span className="vd-row-val">{activeRide?.package_name || 'Weekly Pro Plan'}</span>
                        </div>
                        <div className="vd-row">
                          <span className="vd-row-lbl">Ride Start Time</span>
                          <span className="vd-row-val">
                            {activeRide?.rental_start_date ? new Date(activeRide.rental_start_date).toLocaleDateString('en-GB') : 'Today'}
                          </span>
                        </div>
                        <div className="vd-row">
                          <span className="vd-row-lbl">Deposit & Rent</span>
                          <span className="vd-row-val">₹{activeRide?.rent || 1000} (Dep: ₹{activeRide?.deposit || 0})</span>
                        </div>
                        <Link 
                          href="/renters"
                          style={{
                            marginTop: 'auto',
                            padding: '8px',
                            textAlign: 'center',
                            borderRadius: 8,
                            background: '#EEF2FF',
                            color: '#6366F1',
                            fontWeight: 700,
                            fontSize: 12
                          }}
                        >
                          View Rider In Renters Directory →
                        </Link>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ICheckCircle s={22}/>
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: '#0F172A' }}>Ready for Allocation</div>
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Vehicle is parked at {zone} hub and ready to assign.</div>
                        </div>
                        <Link 
                          href={`/new-rider/rental?vehicle=${code}`}
                          style={{
                            marginTop: 6,
                            padding: '8px 16px',
                            background: '#16A34A',
                            color: '#fff',
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 12,
                            textDecoration: 'none'
                          }}
                        >
                          + Allocate / Rent Vehicle
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD 4: Battery Details */}
                <div className="vd-card">
                  <div className="vd-card-hdr">
                    <div className="vd-card-hdr-left"><IBattery /> Battery Details</div>
                    <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 700 }}>98% SOH</span>
                  </div>
                  <div className="vd-card-body">
                    <div style={{ marginBottom: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                        <span>Charge Level</span>
                        <span style={{ color: barColor }}>{batteryPct}%</span>
                      </div>
                      <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${batteryPct}%`, height: '100%', background: barColor }} />
                      </div>
                    </div>

                    <div className="vd-row">
                      <span className="vd-row-lbl">Battery Pack ID</span>
                      <span className="vd-row-val">{vehicle?.battery_details?.battery_id || 'BAT-GT-102'}</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Pack Voltage</span>
                      <span className="vd-row-val">54.6 V (Nominal)</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Cell Temperature</span>
                      <span className="vd-row-val">28°C (Normal)</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Total Charge Cycles</span>
                      <span className="vd-row-val">142 Cycles</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Chemistry</span>
                      <span className="vd-row-val">Lithium-ion IP67</span>
                    </div>
                  </div>
                </div>

                {/* CARD 5: Last Known Location */}
                <div className="vd-card">
                  <div className="vd-card-hdr">
                    <div className="vd-card-hdr-left"><IMapPin /> Last Known Location</div>
                    <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{zone}</span>
                  </div>
                  <div className="vd-card-body" style={{ paddingBottom: 12 }}>
                    <div className="vd-map-container">
                      <div ref={mapContainerRef} className="vd-map-elem" />
                      <div className="vd-map-ctrls">
                        <button className="vd-map-btn" onClick={() => mapInstance.current?.zoomIn()}>+</button>
                        <button className="vd-map-btn" onClick={() => mapInstance.current?.zoomOut()}>-</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>📍 Near {zone} Hub, Vadodara</span>
                      <Link href={`/vehicles/map?code=${code}`} style={{ color: '#6366F1', fontWeight: 700 }}>
                        Full Map ↗
                      </Link>
                    </div>
                  </div>
                </div>

                {/* CARD 6: Today's Summary */}
                <div className="vd-card">
                  <div className="vd-card-hdr">
                    <div className="vd-card-hdr-left"><ICalendar /> Today's Summary</div>
                    <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 700 }}>Live Telemetry</span>
                  </div>
                  <div className="vd-card-body">
                    <div className="vd-summary-grid">
                      <div className="vd-summary-box">
                        <div className="vd-summary-box-lbl">Distance Run</div>
                        <div className="vd-summary-box-val" style={{ color: '#6366F1' }}>18.4 km</div>
                      </div>
                      <div className="vd-summary-box">
                        <div className="vd-summary-box-lbl">Operating Time</div>
                        <div className="vd-summary-box-val">2h 45m</div>
                      </div>
                      <div className="vd-summary-box">
                        <div className="vd-summary-box-lbl">Top Speed</div>
                        <div className="vd-summary-box-val">42 km/h</div>
                      </div>
                      <div className="vd-summary-box">
                        <div className="vd-summary-box-lbl">CO₂ Saved</div>
                        <div className="vd-summary-box-val" style={{ color: '#16A34A' }}>2.8 kg</div>
                      </div>
                    </div>

                    <div className="vd-row">
                      <span className="vd-row-lbl">Avg. Energy Rate</span>
                      <span className="vd-row-val">34 Wh / km</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Estimated Remaining Range</span>
                      <span className="vd-row-val">{Math.round(batteryPct * 0.95)} km</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: LIVE TRACKING */}
            {activeTab === 'Live Tracking' && (
              <div className="vd-card">
                <div className="vd-card-hdr">
                  <div className="vd-card-hdr-left"><ILocate /> Live GPS Tracking & Route Breadcrumbs</div>
                  <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 700 }}>● Active Telemetry Stream</span>
                </div>
                <div className="vd-card-body" style={{ minHeight: 450, padding: 0, position: 'relative' }}>
                  <div className="vd-map-container" style={{ height: 450, borderRadius: 0, border: 'none' }}>
                    <div ref={mapContainerRef} className="vd-map-elem" />
                  </div>
                  <div style={{ padding: '16px 20px', background: '#FAFBFD', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#0F172A' }}>Current Vehicle Speed: {speed} km/h</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>Zone Boundary: {zone} • Geofence Compliant (In-Zone)</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="vd-btn" onClick={() => triggerToast('Vehicle horn sounded for locating!')}>
                        <IVolume /> Ring Bell
                      </button>
                      <button className="vd-btn primary" onClick={() => triggerToast('Location refreshed!')}>
                        <ILocate /> Refresh Coordinates
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RIDE HISTORY */}
            {activeTab === 'Ride History' && (
              <div className="vd-card">
                <div className="vd-card-hdr">
                  <div className="vd-card-hdr-left"><IScooter s={14} /> Complete Ride & Booking History</div>
                  <span style={{ fontSize: 12, color: '#64748B' }}>{rideHistory.length} Recorded Rides</span>
                </div>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                        <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Rider Name</th>
                        <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Contact</th>
                        <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Package</th>
                        <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Start Date</th>
                        <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Rent / Deposit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rideHistory.length > 0 ? (
                        rideHistory.map((r: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 18px', fontWeight: 700, color: '#0F172A' }}>{r.rider_name}</td>
                            <td style={{ padding: '12px 18px', color: '#64748B' }}>{r.mobile}</td>
                            <td style={{ padding: '12px 18px' }}>{r.package_name || 'Standard'}</td>
                            <td style={{ padding: '12px 18px', color: '#64748B' }}>
                              {r.rental_start_date ? new Date(r.rental_start_date).toLocaleDateString('en-GB') : '-'}
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              <span className={`vd-active-badge ${r.status === 'Active Ride' ? 'vd-badge-inride' : 'vd-badge-available'}`}>
                                {r.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 18px', fontWeight: 700, color: '#0F172A' }}>
                              ₹{r.rent} / ₹{r.deposit}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ padding: '36px 0', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                            No past ride history found for vehicle {code}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: ALERTS */}
            {activeTab === 'Alerts' && (
              <div className="vd-card">
                <div className="vd-card-hdr">
                  <div className="vd-card-hdr-left"><IAlertOctagon /> Vehicle Health & Safety Alerts</div>
                  <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 700 }}>System Normal</span>
                </div>
                <div className="vd-card-body">
                  {[
                    { title: 'Geofence Compliance', desc: `Vehicle is safely within ${zone} operational perimeter.`, status: 'OK', type: 'green' },
                    { title: 'Battery State of Charge', desc: `Current charge is ${batteryPct}%. Safe range.`, status: 'Normal', type: 'green' },
                    { title: 'Anti-Theft & Immobilizer', desc: isImmobilized ? 'Engine cut-off is currently ENGAGED.' : 'Engine active and ready.', status: isImmobilized ? 'Engaged' : 'Active', type: isImmobilized ? 'amber' : 'green' },
                    { title: 'Speed Limiter', desc: 'Max speed cap is 60 km/h. No over-speeding events recorded in last 24 hours.', status: 'Compliant', type: 'green' },
                    { title: 'IoT Telemetry Gateway', desc: 'Heartbeat signal received 12 seconds ago.', status: 'Connected', type: 'green' }
                  ].map((alert, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#0F172A' }}>{alert.title}</div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{alert.desc}</div>
                      </div>
                      <span className={`vd-active-badge ${alert.type === 'green' ? 'vd-badge-available' : 'vd-badge-maintenance'}`}>
                        {alert.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: MAINTENANCE */}
            {activeTab === 'Maintenance' && (
              <div className="vd-card">
                <div className="vd-card-hdr">
                  <div className="vd-card-hdr-left"><IWrench /> Maintenance & Service Logs</div>
                  <button className="vd-btn primary" onClick={() => triggerToast('Maintenance request ticket created!')}>
                    + Create Service Ticket
                  </button>
                </div>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                        <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Ticket ID</th>
                        <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Description / Issue</th>
                        <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Type</th>
                        <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceOrders.length > 0 ? (
                        maintenanceOrders.map((m: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 18px', fontWeight: 800, color: '#6366F1' }}>MNT-{m.id || idx + 101}</td>
                            <td style={{ padding: '12px 18px', fontWeight: 600 }}>{m.issue_description || 'Periodic Brake & Tire Inspection'}</td>
                            <td style={{ padding: '12px 18px', color: '#64748B' }}>{m.service_type || 'Routine Service'}</td>
                            <td style={{ padding: '12px 18px', color: '#64748B' }}>{m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB') : 'Recent'}</td>
                            <td style={{ padding: '12px 18px' }}>
                              <span className="vd-active-badge vd-badge-available">{m.status || 'Completed'}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 18px', fontWeight: 800, color: '#6366F1' }}>MNT-1004</td>
                          <td style={{ padding: '12px 18px', fontWeight: 600 }}>Front Brake Pad Check & Tire Pressure</td>
                          <td style={{ padding: '12px 18px', color: '#64748B' }}>Preventive Maintenance</td>
                          <td style={{ padding: '12px 18px', color: '#64748B' }}>15 Aug 2024</td>
                          <td style={{ padding: '12px 18px' }}>
                            <span className="vd-active-badge vd-badge-available">Passed</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: DOCUMENTS */}
            {activeTab === 'Documents' && (
              <div className="vd-overview-grid">
                <div className="vd-card">
                  <div className="vd-card-hdr">
                    <div className="vd-card-hdr-left"><IFileText /> Insurance Policy</div>
                    <span className="vd-active-badge vd-badge-available">Valid</span>
                  </div>
                  <div className="vd-card-body">
                    <div className="vd-row">
                      <span className="vd-row-lbl">Provider</span>
                      <span className="vd-row-val">{vehicle?.insurance_provider || 'ICICI Lombard GIC'}</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Policy Number</span>
                      <span className="vd-row-val">{vehicle?.insurance_policy_number || 'POL-99218204'}</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Expiry Date</span>
                      <span className="vd-row-val">{vehicle?.insurance_expiry_date ? new Date(vehicle.insurance_expiry_date).toLocaleDateString('en-GB') : '14 Apr 2026'}</span>
                    </div>
                    <button className="vd-btn" style={{ marginTop: 'auto', justifyContent: 'center' }} onClick={() => triggerToast('Downloading Policy PDF...')}>
                      Download Policy PDF
                    </button>
                  </div>
                </div>

                <div className="vd-card">
                  <div className="vd-card-hdr">
                    <div className="vd-card-hdr-left"><IShield /> Registration (RC Book)</div>
                    <span className="vd-active-badge vd-badge-available">Verified</span>
                  </div>
                  <div className="vd-card-body">
                    <div className="vd-row">
                      <span className="vd-row-lbl">Registration No</span>
                      <span className="vd-row-val">{vehicle?.registration_number || code}</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">Owner / Entity</span>
                      <span className="vd-row-val">Evegah Mobility Pvt Ltd</span>
                    </div>
                    <div className="vd-row">
                      <span className="vd-row-lbl">RTO Authority</span>
                      <span className="vd-row-val">GJ-06 Vadodara</span>
                    </div>
                    <button className="vd-btn" style={{ marginTop: 'auto', justifyContent: 'center' }} onClick={() => triggerToast('Viewing RC Document...')}>
                      View RC Copy
                    </button>
                  </div>
                </div>

                <div className="vd-card">
                  <div className="vd-card-hdr">
                    <div className="vd-card-hdr-left"><ICheckCircle s={14} /> Vehicle QR Code</div>
                    <span style={{ fontSize: 11, color: '#64748B' }}>For Hub Scanner</span>
                  </div>
                  <div className="vd-card-body" style={{ alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: 120, height: 120, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`https://app.evegah.com/vehicles/detail?code=${code}`)}`} 
                        alt="QR Code" 
                        style={{ width: 100, height: 100 }} 
                      />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>Scan to unlock or inspect</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Code: {code}</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* CHANGE ZONE MODAL */}
      {isZoneModalOpen && (
        <div className="vd-modal-overlay" onClick={() => setIsZoneModalOpen(false)}>
          <div className="vd-modal" onClick={e => e.stopPropagation()}>
            <div className="vd-modal-hdr">
              <span>Change Assigned Hub Zone</span>
              <button onClick={() => setIsZoneModalOpen(false)} style={{ fontSize: 18, color: '#94A3B8' }}>×</button>
            </div>
            <div className="vd-modal-body">
              <div style={{ fontSize: 12.5, color: '#64748B' }}>
                Select an operational zone to reassign vehicle <strong>{code}</strong>. The vehicle's inventory and geofence will move to the selected hub immediately.
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Operational Zone:
                </label>
                <select 
                  value={selectedNewZone}
                  onChange={(e) => setSelectedNewZone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  {availableZones.length > 0 ? (
                    availableZones.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))
                  ) : (
                    <>
                      <option value="Gotri Zone">Gotri Zone</option>
                      <option value="Manjalpur Zone">Manjalpur Zone</option>
                      <option value="KPGU Zone">KPGU Zone</option>
                      <option value="Aatapi Zone">Aatapi Zone</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="vd-modal-ft">
              <button className="vd-btn" onClick={() => setIsZoneModalOpen(false)}>
                Cancel
              </button>
              <button 
                className="vd-btn primary" 
                onClick={handleSaveZoneChange}
                disabled={savingZone}
              >
                {savingZone ? 'Updating...' : 'Confirm Reassignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function VehicleDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: 'sans-serif' }}>
        <div style={{ fontWeight: 700, color: '#6366F1', fontSize: 16 }}>Loading Vehicle Diagnostics...</div>
      </div>
    }>
      <VehicleDetailContent />
    </Suspense>
  );
}
