'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

/* ──────────────────────────────────────────────────────────────
   RETAIN RIDER REGISTRATION · Step 2 — Rental Details
   Fully dynamic with identical backend logic, vehicle models,
   zone pricing, swappable batteries, and ride timing.
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

/* rider banner */
.rr-rider-banner { display: flex; align-items: center; gap: 18px; padding: 18px 24px; background: #FAF5FF; border-bottom: 1px solid #E9D5FF; }
.rr-banner-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg,#2A195C,#4338CA); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: #fff; flex-shrink: 0; }
.rr-banner-name { font-size: 17px; font-weight: 800; color: #111827; margin-bottom: 3px; }
.rr-banner-row { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #6B7280; margin-bottom: 2px; }
.rr-kyc-badge { background: #DCFCE7; color: #16A34A; border: 1px solid #BBF7D0; border-radius: 6px; font-size: 11.5px; font-weight: 700; padding: 3px 10px; display: inline-flex; align-items: center; gap: 4px; }

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

/* dropdowns */
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
  text-decoration: none;
}
.nr-continue-btn:hover { background: #4338CA; }

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
const IPhone = () => <SV s={13}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.54 3.53 2 2 0 0 1 3.5 1.35h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></SV>;
const IID = () => <SV s={13}><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="8.5" cy="10" r="2" /><path d="M14 10h4M14 14h4M6 14h5" /></SV>;

/* ── 4 Steps for Retain Rider ── */
const STEPS = [
  { n: 1, label: 'Rider Search', stat: 'Completed', state: 'done' },
  { n: 2, label: 'Rental Details', stat: 'In Progress', state: 'active' },
  { n: 3, label: 'Payment & Charges', stat: 'Pending', state: 'pend' },
  { n: 4, label: 'Review & Confirm', stat: 'Pending', state: 'pend' },
];

const VEHICLE_MODELS: Record<string, any> = {
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

function normalizeModel(m: string): string {
  if (!m) return 'Evegah City';
  const l = m.toLowerCase().trim();
  if (l.includes('mink')) return 'Evegah Mink';
  if (l.includes('city')) return 'Evegah City';
  if (l.includes('pro')) return 'Evegah Pro';
  if (l.includes('fly')) return 'Evegah Fly';
  return m;
}

export default function RetainRiderRentalPage() {
  const router = useRouter();

  // Rider info from Step 1
  const [rider, setRider] = useState<any>(null);

  // Zone allocation state
  const [zonesCatalog, setZonesCatalog] = useState<any[]>([]);
  const zonesCatalogRef = useRef<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [activeZoneName, setActiveZoneName] = useState<string>('Gotri Zone');

  // Dynamic available models & vehicles
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

  // Load returning rider data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('evegah_retain_rider') || localStorage.getItem('evegah_retain_ride_kyc');
        if (saved) {
          setRider(JSON.parse(saved));
        }
      } catch {}
    }
  }, []);

  // Sync active zone from localStorage
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

  // Load all zones catalog
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/zones`)
      .then(res => res.json())
      .then(res => {
        const data = (res && res.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
        const operationalZones = data.filter((z: any) => {
          const t = (z.type || '').toLowerCase();
          const n = (z.name || '').toLowerCase();
          return !t.includes('service zone') && !t.includes('maintenance hub') && !n.includes('service center');
        });
        if (operationalZones.length > 0) {
          zonesCatalogRef.current = operationalZones;
          setZonesCatalog(operationalZones);
          syncZoneFromStorage(operationalZones);
        }
      }).catch(() => {});

    const onZoneChanged = () => syncZoneFromStorage();
    window.addEventListener('evegah_active_zone_changed', onZoneChanged);
    window.addEventListener('evegah_zone_changed', onZoneChanged);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', onZoneChanged);
      window.removeEventListener('evegah_zone_changed', onZoneChanged);
    };
  }, []);

  // Fetch vehicles for selected zone
  useEffect(() => {
    if (!activeZoneName) return;
    setLoadingVehicles(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    fetch(`${apiUrl}/vehicles?zone=${encodeURIComponent(activeZoneName)}&limit=100`)
      .then(r => r.json())
      .then(res => {
        const list = (res && res.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
        const cleanList = list.filter((v: any) => {
          const st = (v.status || '').toLowerCase();
          return st === 'available' || st === 'ready' || st === 'idle';
        });

        setVehiclesList(cleanList);

        const modelsFound = Array.from(new Set(cleanList.map((v: any) => normalizeModel(v.model || v.name || 'Evegah City')))) as string[];
        const validModels = modelsFound.length > 0 ? modelsFound : ['Evegah City', 'Evegah Mink', 'Evegah Pro'];
        setAvailableModels(validModels);

        const initialModel = validModels[0] || 'Evegah City';
        setSelectedModelName(initialModel);

        const matchingVehs = cleanList.filter((v: any) => normalizeModel(v.model || v.name || '') === initialModel);
        setFilteredVehicles(matchingVehs);
        if (matchingVehs.length > 0) {
          setSelectedVehicleCode(matchingVehs[0].reg_number || matchingVehs[0].vehicle_number || matchingVehs[0].id);
          setSelectedVehicle(matchingVehs[0]);
        } else {
          setSelectedVehicleCode('');
          setSelectedVehicle(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingVehicles(false));
  }, [activeZoneName]);

  // Fetch batteries for selected zone
  useEffect(() => {
    if (!activeZoneName) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/batteries?zone=${encodeURIComponent(activeZoneName)}&limit=50`)
      .then(r => r.json())
      .then(res => {
        const list = (res && res.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
        const clean = list.filter((b: any) => {
          const st = (b.status || '').toLowerCase();
          return st.includes('charged') || st.includes('ready') || st.includes('in-station') || st.includes('available');
        });
        setBatteriesList(clean);
        if (clean.length > 0) {
          setSelectedBatteryId(clean[0].battery_code || clean[0].battery_id || clean[0].id);
        }
      })
      .catch(() => {});
  }, [activeZoneName]);

  // Fetch zone pricing packages
  useEffect(() => {
    if (!activeZoneName) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/zones/pricing?zone=${encodeURIComponent(activeZoneName)}`)
      .then(r => r.json())
      .then(res => {
        const pkgs = (res && res.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
        if (pkgs.length > 0) {
          setPackagesList(pkgs);
          setSelectedPackage(pkgs[0]);
        } else {
          const fallbackPkgs = [
            { id: 'p1', name: 'Daily Pass', duration_days: 1, base_fare: 600, deposit_amount: 500 },
            { id: 'p2', name: 'Weekly Commuter', duration_days: 7, base_fare: 2800, deposit_amount: 1000 },
            { id: 'p3', name: 'Monthly Pro', duration_days: 30, base_fare: 7500, deposit_amount: 2000 },
          ];
          setPackagesList(fallbackPkgs);
          setSelectedPackage(fallbackPkgs[0]);
        }
      })
      .catch(() => {});
  }, [activeZoneName]);

  // Update return date when package changes
  useEffect(() => {
    if (selectedPackage && startDate) {
      const days = Number(selectedPackage.duration_days) || 1;
      setTotalDays(days);
      const start = new Date(startDate);
      start.setDate(start.getDate() + days);
      setReturnDate(start.toISOString().split('T')[0]);
    }
  }, [selectedPackage, startDate]);

  // Model selection handler
  const handleModelSelect = (modelName: string) => {
    setSelectedModelName(modelName);
    const matching = vehiclesList.filter((v: any) => normalizeModel(v.model || v.name || '') === modelName);
    setFilteredVehicles(matching);
    if (matching.length > 0) {
      setSelectedVehicleCode(matching[0].reg_number || matching[0].vehicle_number || matching[0].id);
      setSelectedVehicle(matching[0]);
    } else {
      setSelectedVehicleCode('');
      setSelectedVehicle(null);
    }
  };

  // Selected vehicle code handler
  const handleVehicleChange = (vCode: string) => {
    setSelectedVehicleCode(vCode);
    const found = filteredVehicles.find(v => (v.reg_number || v.vehicle_number || v.id) === vCode);
    setSelectedVehicle(found || null);
  };

  const currentModelMeta = useMemo(() => {
    const key = Object.keys(VEHICLE_MODELS).find(k => VEHICLE_MODELS[k].name === selectedModelName) || 'city';
    return VEHICLE_MODELS[key];
  }, [selectedModelName]);

  const selectedBattery = useMemo(() => {
    return batteriesList.find(b => (b.battery_code || b.battery_id || b.id) === selectedBatteryId) || null;
  }, [batteriesList, selectedBatteryId]);

  const rentPrice = Number(selectedPackage?.base_fare) || 600;
  const depositAmount = Number(selectedPackage?.deposit_amount ?? selectedPackage?.deposit ?? rider?.deposit ?? 0);
  const totalAmount = rentPrice + depositAmount;

  // Handle Continue to Payment
  const handleContinue = () => {
    if (typeof window !== 'undefined') {
      const rentalData = {
        pickup_zone: activeZoneName,
        drop_zone: activeZoneName,
        vehicle_code: selectedVehicleCode || 'EVM1024012',
        vehicle_model: selectedModelName,
        vehicle_name: `${selectedModelName} (${selectedVehicleCode || 'EV'})`,
        battery_id: selectedBatteryId || 'BAT-0098',
        battery_name: selectedBattery?.battery_type || 'Evegah 60V 30Ah Lithium-ion',
        plan_id: selectedPackage?.id || 'daily',
        plan_type: selectedPackage?.name || 'Daily Pass',
        plan_name: selectedPackage?.name || 'Daily Pass',
        plan_rate: rentPrice,
        fare: rentPrice,
        deposit: depositAmount,
        deposit_amount: depositAmount,
        total_payable: totalAmount,
        total_days: totalDays,
        start_date: startDate,
        start_time: startTime,
        return_date: returnDate,
        return_time: returnTime,
        pickup_datetime: `${startDate} ${startTime}`,
        drop_datetime: `${returnDate} ${returnTime}`,
      };

      localStorage.setItem('evegah_retain_rental', JSON.stringify(rentalData));
      localStorage.setItem('evegah_new_ride_rental', JSON.stringify(rentalData));
      localStorage.setItem('evegah_rental_data', JSON.stringify(rentalData));
    }
    router.push('/retain-rider/payment');
  };

  const riderName = rider?.name || rider?.fullName || 'Returning Rider';
  const riderPhone = rider?.phone || rider?.mobile || '—';
  const riderId = rider?.id || rider?.riderId || '—';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="nr-shell">
        <Sidebar activePath="/retain-rider" />

        <div className="nr-main">
          <TopBar title="Retain Rider - Rental Details" subtitle="Configure vehicle, swappable battery, and rental plan" />

          <div className="nr-page">
            {/* Breadcrumb */}
            <div className="nr-bc">
              <Link href="/"><ILeft /> Home</Link>
              <span className="nr-bc-sep">›</span>
              <a href="#">Rides / Rentals</a>
              <span className="nr-bc-sep">›</span>
              <span className="nr-bc-cur">Retain Ride Registration</span>
            </div>

            {/* Title Row */}
            <div className="nr-title-row">
              <div>
                <h1 className="nr-h1">Retain Ride Registration</h1>
                <p className="nr-sub">Configure vehicle and rental plan for returning rider</p>
              </div>
              <Link href="/retain-rider" className="nr-back-btn">
                <ILeft /> Back to Rider Search
              </Link>
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
                  {i < STEPS.length - 1 && <div className={`nr-step-line ${s.state === 'done' ? 'done-l' : ''}`} />}
                </div>
              ))}
            </div>

            {/* 2-Column Layout */}
            <div className="nr-layout">
              {/* Left Column */}
              <div>
                <div className="nr-card">
                  {/* Returning Rider Banner */}
                  <div className="rr-rider-banner">
                    <div className="rr-banner-avatar">
                      {riderName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="rr-banner-name">{riderName}</div>
                      <div className="rr-banner-row"><IPhone /> {riderPhone}</div>
                      <div className="rr-banner-row"><IID /> Rider ID: {riderId}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginLeft: 'auto' }}>
                      <span className="rr-kyc-badge"><ICheck s={11} /> Documents On File</span>
                      <span style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 600 }}>Returning Rider</span>
                    </div>
                  </div>

                  {/* Card Header */}
                  <div className="nr-card-hdr">
                    <div>
                      <h2>Select Vehicle, Battery &amp; Plan</h2>
                      <p>All pricing and available fleet are directly connected with <strong>{activeZoneName}</strong></p>
                    </div>
                  </div>

                  {/* 3-Column Panel Grid */}
                  <div className="rd-3col">
                    {/* Panel 1: Vehicle Model & Unit */}
                    <div className="rd-panel">
                      <div className="rd-ph">
                        <span className="rd-ph-title">1. VEHICLE MODEL</span>
                        <span className="rd-avail">✓ {filteredVehicles.length} Available</span>
                      </div>

                      <div className="rd-img-wrap">
                        <img
                          src={currentModelMeta.image}
                          alt={selectedModelName}
                          style={{ maxHeight: 110, maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </div>

                      <div className="rd-veh-name">{selectedModelName}</div>
                      <div className="rd-veh-type">{currentModelMeta.type}</div>

                      {currentModelMeta.specs.map((sp: any) => (
                        <div key={sp.l} className="rd-spec">
                          <span className="rd-spec-l">{sp.l}</span>
                          <span className="rd-spec-v">{sp.v}</span>
                        </div>
                      ))}

                      <select
                        className="rd-chg-sel"
                        value={selectedModelName}
                        onChange={e => handleModelSelect(e.target.value)}
                      >
                        {availableModels.map(m => (
                          <option key={m} value={m}>Model: {m}</option>
                        ))}
                      </select>

                      <div style={{ marginTop: 10 }}>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                          Assign Specific Vehicle Number
                        </label>
                        <select
                          className="rd-chg-sel"
                          style={{ marginTop: 0 }}
                          value={selectedVehicleCode}
                          onChange={e => handleVehicleChange(e.target.value)}
                        >
                          {filteredVehicles.length === 0 ? (
                            <option value="">No idle unit in this zone</option>
                          ) : (
                            filteredVehicles.map(v => {
                              const code = v.reg_number || v.vehicle_number || v.id;
                              return <option key={code} value={code}>{code} (Battery: {v.battery_soc || 95}%)</option>;
                            })
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Panel 2: Swappable Battery */}
                    <div className="rd-panel">
                      <div className="rd-ph">
                        <span className="rd-ph-title">2. SWAPPABLE BATTERY</span>
                        <span className="rd-avail">✓ In-Station</span>
                      </div>

                      <div className="rd-img-wrap">
                        <img
                          src="/ev_batttery.png"
                          alt="Battery"
                          style={{ maxHeight: 110, maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </div>

                      <div className="rd-veh-name">
                        {selectedBattery?.battery_code || selectedBatteryId || 'BAT-0098'}
                      </div>
                      <div className="rd-veh-type">60V 30Ah Lithium-ion Swappable</div>

                      <div className="rd-spec">
                        <span className="rd-spec-l">Chemistry</span>
                        <span className="rd-spec-v">NMC / LiFePO4</span>
                      </div>
                      <div className="rd-spec">
                        <span className="rd-spec-l">State of Charge</span>
                        <span className="rd-spec-v" style={{ color: '#16A34A' }}>100% Full</span>
                      </div>
                      <div className="rd-spec">
                        <span className="rd-spec-l">Health (SOH)</span>
                        <span className="rd-spec-v">98% Optimal</span>
                      </div>

                      <select
                        className="rd-chg-sel"
                        value={selectedBatteryId}
                        onChange={e => setSelectedBatteryId(e.target.value)}
                      >
                        {batteriesList.length === 0 ? (
                          <option value="BAT-0098">BAT-0098 (Default Charged Unit)</option>
                        ) : (
                          batteriesList.map(b => {
                            const bId = b.battery_code || b.battery_id || b.id;
                            return <option key={bId} value={bId}>{bId} (100% Ready)</option>;
                          })
                        )}
                      </select>
                    </div>

                    {/* Panel 3: Rental Package & Zone Pricing */}
                    <div className="rd-panel">
                      <div className="rd-ph">
                        <span className="rd-ph-title">3. RENTAL PACKAGE</span>
                        <span className="rd-avail">Zero GST</span>
                      </div>

                      <select
                        className="rd-plan-sel"
                        value={selectedPackage?.id || ''}
                        onChange={e => {
                          const found = packagesList.find(p => String(p.id) === String(e.target.value));
                          if (found) setSelectedPackage(found);
                        }}
                      >
                        {packagesList.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.duration_days} {p.duration_days === 1 ? 'Day' : 'Days'}) - ₹{p.base_fare}
                          </option>
                        ))}
                      </select>

                      <div className="rd-price-box">
                        <div className="rd-price-amount">₹{rentPrice.toFixed(2)}</div>
                        <div className="rd-price-unit">per package duration</div>
                        <div className="rd-price-from">Duration: {totalDays} {totalDays === 1 ? 'Day' : 'Days'}</div>
                      </div>

                      <div className="rd-feature">
                        <span className="rd-feature-ic-green"><ICheck s={13} /></span>
                        <span>Unlimited battery swaps at all Evegah hubs</span>
                      </div>
                      <div className="rd-feature">
                        <span className="rd-feature-ic-green"><ICheck s={13} /></span>
                        <span>24/7 Roadside breakdown assistance</span>
                      </div>
                      <div className="rd-feature">
                        <span className="rd-feature-ic-green"><ICheck s={13} /></span>
                        <span>Full comprehensive fleet insurance</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ride Timing Card */}
                <div className="nr-card">
                  <div className="rd-timing-hdr">
                    <span className="rd-timing-hdr-ic"><IClock s={18} /></span>
                    <div>
                      <div className="rd-timing-title">Ride Timing &amp; Duration</div>
                      <div className="rd-timing-sub">Schedule the pickup and planned return date &amp; time</div>
                    </div>
                  </div>

                  <div className="rd-timing-body">
                    <div className="rd-timing-grid">
                      {/* Pickup */}
                      <div className="rd-fld">
                        <label>Pickup Date &amp; Time <span className="req">*</span></label>
                        <div className="rd-dt-row">
                          <div className="nr-inp-wrap">
                            <input
                              type="date"
                              className="nr-inp"
                              value={startDate}
                              onChange={e => setStartDate(e.target.value)}
                            />
                            <span className="nr-inp-wrap-ic"><ICal s={14} /></span>
                          </div>
                          <div className="nr-inp-wrap" style={{ width: 130 }}>
                            <input
                              type="text"
                              className="nr-inp"
                              value={startTime}
                              onChange={e => setStartTime(e.target.value)}
                            />
                            <span className="nr-inp-wrap-ic"><IClock s={13} /></span>
                          </div>
                        </div>
                      </div>

                      {/* Drop */}
                      <div className="rd-fld">
                        <label>Planned Drop Date &amp; Time <span className="req">*</span></label>
                        <div className="rd-dt-row">
                          <div className="nr-inp-wrap">
                            <input
                              type="date"
                              className="nr-inp"
                              value={returnDate}
                              onChange={e => setReturnDate(e.target.value)}
                            />
                            <span className="nr-inp-wrap-ic"><ICal s={14} /></span>
                          </div>
                          <div className="nr-inp-wrap" style={{ width: 130 }}>
                            <input
                              type="text"
                              className="nr-inp"
                              value={returnTime}
                              onChange={e => setReturnTime(e.target.value)}
                            />
                            <span className="nr-inp-wrap-ic"><IClock s={13} /></span>
                          </div>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="rd-dur-box">
                        <div className="rd-dur-lbl">CALCULATED DURATION</div>
                        <div className="rd-dur-val">{totalDays}</div>
                        <div className="rd-dur-sub">{totalDays === 1 ? 'Day' : 'Days'} Total</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Navigation */}
                <div className="nr-footer-actions">
                  <Link href="/retain-rider" className="nr-prev-btn">
                    <ILeft /> Previous (Rider Search)
                  </Link>
                  <button className="nr-continue-btn" onClick={handleContinue}>
                    Continue to Payment &amp; Charges <IArr s={12} />
                  </button>
                </div>
              </div>

              {/* Right Panel */}
              <div className="nr-rp">
                {/* Rental Summary Card */}
                <div className="nr-rp-card">
                  <div className="nr-rp-hdr">
                    <span className="nr-rp-hdr-ic" style={{ color: '#2a195c' }}><IReceipt /></span>
                    <div className="nr-rp-title">Rental Summary</div>
                  </div>
                  <div className="nr-sum-body">
                    {[
                      { l: 'Assigned Zone', v: activeZoneName },
                      { l: 'Rider Name', v: riderName },
                      { l: 'Vehicle Number', v: selectedVehicleCode || 'EVM1024012' },
                      { l: 'Vehicle Model', v: selectedModelName },
                      { l: 'Swappable Battery', v: selectedBatteryId || 'BAT-0098' },
                      { l: 'Rental Package', v: selectedPackage?.name || 'Daily Pass' },
                      { l: 'Package Duration', v: `${totalDays} ${totalDays === 1 ? 'Day' : 'Days'}` },
                      { l: 'Rental Fare Rate', v: `₹${rentPrice.toFixed(2)}` },
                      { l: 'Refundable Security Deposit', v: `₹${depositAmount.toFixed(2)}` },
                    ].map(r => (
                      <div key={r.l} className="nr-sum-row">
                        <span className="nr-sum-label">{r.l}</span>
                        <span className="nr-sum-val" style={{ textAlign: 'right', fontWeight: r.l.includes('Deposit') ? 700 : 500 }}>
                          {r.v}
                        </span>
                      </div>
                    ))}
                    <div className="nr-sum-divider" />
                    <div className="nr-sum-total">
                      <span className="nr-sum-total-l">Total Payable</span>
                      <span className="nr-sum-total-r">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Zone & Deposit Policy */}
                <div className="nr-rp-card">
                  <div className="nr-rp-hdr">
                    <span className="nr-rp-hdr-ic" style={{ color: '#D97706' }}><IInfo s={14} /></span>
                    <div className="nr-rp-title">Zone &amp; Deposit Policy</div>
                  </div>
                  <div className="nr-imp-body">
                    {[
                      'Vehicles and batteries are automatically filtered per assigned zone.',
                      'Security Deposit is 100% refundable upon vehicle return in good condition.',
                      'Rental rates and grace periods are synced directly with Zone Pricing API.',
                    ].map((n, i) => (
                      <div key={i} className="nr-imp-item">
                        <span style={{ color: '#D97706', fontWeight: 700, marginTop: 1 }}>•</span>
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Need Help Card */}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
