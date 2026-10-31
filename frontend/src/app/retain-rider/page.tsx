'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

/* ──────────────────────────────────────────────────────────────
   RETAIN RIDER REGISTRATION  ·  Step 1 — Rider Search
   ────────────────────────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ── shell & layout ── */
.nr-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: Inter, sans-serif; }
.nr-main  { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; flex: 1; min-width: 0; background: #F8FAFC; }
.nr-page  { flex: 1; padding: 20px 22px 70px; }

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
.nr-step-stat.active-s { color: #2a195c; }
.nr-step-stat.pend-s   { color: #9CA3AF; }
.nr-step-line { flex: 1; height: 2px; background: #E5E7EB; margin: 0 14px; min-width: 16px; }

/* ── 2-col layout ── */
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

/* ── search tabs ── */
.rr-tabs { display: flex; align-items: center; gap: 0; border-bottom: 1.5px solid #E5E7EB; padding: 0 24px; }
.rr-tab {
  display: flex; align-items: center; gap: 6px; padding: 12px 18px;
  font-size: 13px; font-weight: 500; color: #6B7280; cursor: pointer;
  border-bottom: 2.5px solid transparent; margin-bottom: -1.5px;
  transition: color .15s, border-color .15s; white-space: nowrap; user-select: none;
}
.rr-tab.active { color: #2a195c; font-weight: 700; border-bottom-color: #2a195c; }
.rr-tab:hover:not(.active) { color: #374151; }

/* ── search input area ── */
.rr-search-area { padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
.rr-search-row { display: flex; align-items: center; gap: 10px; }
.nr-ph {
  display: flex; border: 1.5px solid #E5E7EB; border-radius: 9px;
  overflow: hidden; background: #fff; transition: border-color .15s, box-shadow .15s; flex: 1;
}
.nr-ph:focus-within { border-color: #2a195c; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.nr-ph-pre {
  padding: 10px 11px; background: #F9FAFB; border-right: 1.5px solid #E5E7EB;
  font-size: 13px; font-weight: 600; color: #374151;
  display: flex; align-items: center; gap: 5px; white-space: nowrap; flex-shrink: 0;
}
.nr-ph input {
  flex: 1; padding: 10px 13px; border: none; outline: none;
  font-size: 13px; font-family: inherit; background: transparent; min-width: 0;
}
.nr-ph input::placeholder { color: #9CA3AF; }
.rr-search-btn {
  padding: 10px 22px; background: #2a195c; color: #fff;
  border: none; border-radius: 9px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; white-space: nowrap;
  display: flex; align-items: center; gap: 7px; transition: background .15s; flex-shrink: 0;
}
.rr-search-btn:hover { background: #4338CA; }

/* ── results section ── */
.rr-results { padding: 0 24px 20px; }
.rr-results-hdr {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 0 14px; border-bottom: 1.5px solid #F3F4F6; margin-bottom: 4px;
}
.rr-results-title { font-size: 14px; font-weight: 700; color: #111827; }
.rr-found-badge {
  background: #EEF2FF; color: #2a195c; border: 1px solid #C7D2FE;
  border-radius: 20px; font-size: 11px; font-weight: 700; padding: 2px 10px;
}
.rr-refresh-btn {
  margin-left: auto; padding: 6px 14px; background: #fff;
  border: 1.5px solid #E5E7EB; border-radius: 8px;
  font-size: 12px; font-weight: 600; color: #374151;
  cursor: pointer; font-family: inherit; transition: border-color .15s;
}
.rr-refresh-btn:hover { border-color: #2a195c; color: #2a195c; }

/* ── rider row ── */
.rr-rider-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 0; border-bottom: 1px solid #F3F4F6;
}
.rr-rider-row:last-child { border-bottom: none; }
.rr-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0;
}
.rr-rider-info { flex: 1; min-width: 0; }
.rr-rider-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; flex-wrap: wrap; }
.rr-rider-name { font-size: 14px; font-weight: 700; color: #111827; }
.rr-returning-badge {
  background: #DCFCE7; color: #16A34A; border: 1px solid #BBF7D0;
  border-radius: 20px; font-size: 11px; font-weight: 700; padding: 1px 9px;
}
.rr-kyc-badge {
  background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0;
  border-radius: 5px; font-size: 10.5px; font-weight: 600; padding: 1px 7px;
}
.rr-rider-id { font-size: 12px; color: #9CA3AF; margin-bottom: 6px; }
.rr-rider-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.rr-meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6B7280; }
.rr-select-btn {
  padding: 8px 16px; background: #fff;
  border: 1.5px solid #2a195c; border-radius: 9px;
  font-size: 13px; font-weight: 600; color: #2a195c;
  cursor: pointer; font-family: inherit; white-space: nowrap; flex-shrink: 0;
  transition: background .15s, color .15s;
}
.rr-select-btn:hover { background: #EEF2FF; }

/* ── pagination ── */
.rr-paging {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px 4px; border-top: 1px solid #F3F4F6;
}
.rr-paging-info { font-size: 12px; color: #9CA3AF; }
.rr-paging-btns { display: flex; align-items: center; gap: 4px; }
.rr-pg-btn {
  width: 30px; height: 30px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; cursor: pointer;
  border: 1.5px solid #E5E7EB; background: #fff; color: #374151;
  transition: border-color .15s, background .15s, color .15s; font-family: inherit;
}
.rr-pg-btn.active { background: #2a195c; border-color: #2a195c; color: #fff; }
.rr-pg-btn:hover:not(.active) { border-color: #2a195c; color: #2a195c; }

/* ─────────────── RIGHT PANEL ─────────────── */
.nr-rp { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }
.nr-rp-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden; }
.nr-rp-hdr  { display: flex; align-items: center; gap: 9px; padding: 14px 18px; border-bottom: 1px solid #E5E7EB; }
.nr-rp-hdr-ic { display: flex; align-items: center; flex-shrink: 0; }
.nr-rp-title  { font-size: 13.5px; font-weight: 700; color: #111827; }
.nr-why-list  { padding: 10px 0 4px; }
.nr-why-row   { display: flex; align-items: center; gap: 10px; padding: 7px 18px; font-size: 13px; color: #374151; }
.nr-why-ic    { color: #22C55E; display: flex; align-items: center; flex-shrink: 0; }
.nr-help-body { padding: 14px 18px 16px; }
.nr-help-sub  { font-size: 13px; color: #6B7280; margin-bottom: 12px; }
.nr-help-btn  { width: 100%; padding: 10px; background: #2a195c; color: #fff; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: background .15s; }
.nr-help-btn:hover { background: #4338CA; }
.nr-tips-card { background: #FFF8F0; border: 1px solid #FED7AA; border-radius: 14px; overflow: hidden; }
.nr-tips-hdr  { display: flex; align-items: center; gap: 9px; padding: 14px 18px; border-bottom: 1px solid #FED7AA; }
.nr-tips-body { padding: 10px 0 6px; }
.nr-tip-row   { display: flex; align-items: flex-start; gap: 9px; padding: 7px 18px; font-size: 12.5px; color: #92400E; line-height: 1.5; }
.nr-tip-ic    { color: #D97706; display: flex; flex-shrink: 0; margin-top: 2px; }
`;

/* ── SVG icons ── */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 as number, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const SV = ({ s = 14, children, ...p }: { s?: number; children: React.ReactNode } & React.SVGProps<SVGSVGElement>) => (
  <svg width={s} height={s} viewBox="0 0 24 24" {...S} {...p}>{children}</svg>
);

const ILeft = () => <SV s={13}><polyline points="15 18 9 12 15 6" /></SV>;
const ICheck = ({ s = 13 }: { s?: number }) => <SV s={s}><polyline points="20 6 9 17 4 12" /></SV>;
const IPhone = ({ s = 13 }: { s?: number }) => <SV s={s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.54 3.53 2 2 0 0 1 3.5 1.35h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></SV>;
const ICard = ({ s = 13 }: { s?: number }) => <SV s={s}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></SV>;
const IPerson = ({ s = 13 }: { s?: number }) => <SV s={s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></SV>;
const ICal = ({ s = 13 }: { s?: number }) => <SV s={s}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></SV>;
const ISearch = ({ s = 14 }: { s?: number }) => <SV s={s}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></SV>;
const IRefresh = ({ s = 13 }: { s?: number }) => <SV s={s}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></SV>;
const IScooter = ({ s = 13 }: { s?: number }) => <SV s={s}><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="18.5" cy="17.5" r="2.5" /><path d="M15 6H6l-1 5h12.5M15 6l1.5 5" /><path d="M10 6V3" /></SV>;
const IBulb = ({ s = 14 }: { s?: number }) => <SV s={s}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></SV>;
const IDoc = ({ s = 12 }: { s?: number }) => <SV s={s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></SV>;
const IMagnify = ({ s = 14 }: { s?: number }) => <SV s={s}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></SV>;
const IHead = ({ s = 14 }: { s?: number }) => <SV s={s}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></SV>;

/* ── stepper data (4 Steps for Retain Rider, skipping KYC re-upload) ── */
const STEPS = [
  { n: 1, label: 'Rider Search', stat: 'In Progress', state: 'active' },
  { n: 2, label: 'Rental Details', stat: 'Pending', state: 'pend' },
  { n: 3, label: 'Payment & Charges', stat: 'Pending', state: 'pend' },
  { n: 4, label: 'Review & Confirm', stat: 'Pending', state: 'pend' },
];

/* ── search tabs ── */
const TABS = [
  { id: 'mobile', label: 'Mobile Number', Icon: IPhone },
  { id: 'riderid', label: 'Rider ID', Icon: ICard },
  { id: 'aadhaar', label: 'Aadhaar Number', Icon: ICard },
  { id: 'name', label: 'Name', Icon: IPerson },
];

/* ── Helper: Clean Rider ID format ── */
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

/* ── rider data ── */
const RIDERS = [
  {
    initials: 'DR', gradient: 'linear-gradient(135deg,#2a195c,#2A195C)',
    name: 'Devendra Rana', id: 'EVR-16EFE6', phone: '+91 98255 44332',
    aadhaar: 'XXXX XXXX 4432', lastRide: 'Active Booking', vehicle: 'Evegah E1',
    avatar: '/rohit_avatar.png',
  },
  {
    initials: 'VP', gradient: 'linear-gradient(135deg,#2A195C,#A855F7)',
    name: 'Vikram Patel', id: 'EVR-349240', phone: '+91 78945 61230',
    aadhaar: 'XXXX XXXX 6123', lastRide: 'Active Booking', vehicle: 'Evegah City',
    avatar: '/rohit_avatar.png',
  },
  {
    initials: 'PS', gradient: 'linear-gradient(135deg,#DB2777,#F472B6)',
    name: 'Priya Sharma', id: 'EVR-6D0DF4', phone: '+91 98123 45678',
    aadhaar: 'XXXX XXXX 5678', lastRide: 'Active Booking', vehicle: 'Evegah Pro',
    avatar: '/priya_avatar.png',
  },
  {
    initials: 'MP', gradient: 'linear-gradient(135deg,#EA580C,#FBBF24)',
    name: 'Manish Parmar', id: 'EVR-C430C1', phone: '+91 98980 11223',
    aadhaar: 'XXXX XXXX 1122', lastRide: 'Active Booking', vehicle: 'Evegah E1',
    avatar: '/rohit_avatar.png',
  },
  {
    initials: 'KT', gradient: 'linear-gradient(135deg,#2563EB,#0EA5E9)',
    name: 'Kinjal Trivedi', id: 'EVR-AF605E', phone: '+91 97241 87654',
    aadhaar: 'XXXX XXXX 8765', lastRide: 'Active Booking', vehicle: 'Evegah City',
    avatar: '/priya_avatar.png',
  },
];

/* ── Right Panel ── */
function RightPanel() {
  return (
    <div className="nr-rp">
      {/* Why search existing rider */}
      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: '#2a195c' }}><IMagnify /></span>
          <div className="nr-rp-title">Why search existing rider?</div>
        </div>
        <div className="nr-why-list">
          {[
            'Faster registration process',
            'No need to re-enter KYC details',
            'View previous ride history',
            'Track dues and wallet balance',
          ].map(w => (
            <div key={w} className="nr-why-row">
              <span className="nr-why-ic"><ICheck s={14} /></span>
              {w}
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
          <div className="nr-help-sub">Facing issues in finding rider?</div>
          <button className="nr-help-btn">Contact Support</button>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="nr-tips-card">
        <div className="nr-tips-hdr">
          <span style={{ color: '#D97706', display: 'flex' }}><IBulb s={14} /></span>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#92400E' }}>Quick Tips</div>
        </div>
        <div className="nr-tips-body">
          {[
            'Search by Mobile Number — This is the fastest way to find a rider.',
            'Check Outstanding Due — Clear dues before starting a new ride.',
          ].map((tip, i) => (
            <div key={i} className="nr-tip-row">
              <span className="nr-tip-ic"><IDoc s={12} /></span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function RetainRiderPage() {
  const [activeTab, setActiveTab] = useState('mobile');
  const [searchQuery, setSearchQuery] = useState('');
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const router = useRouter();

  const chevSvg = (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/renters`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || data.renters || []);
      if (list.length > 0) {
        setRiders(list.map((item: any, idx: number) => {
          const realName = item.rider_name || item.customer_name || item.name || 'Devendra Rana';
          const riderId = formatCleanRiderId(item.reservation_id || item.renter_id || item.id, idx);
          const dateVal = item.rental_start_date || item.created_at;
          const lastRideFormatted = dateVal
            ? new Date(dateVal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Active Booking';
          const isFemale = realName.toLowerCase().includes('priya') || realName.toLowerCase().includes('kinjal') || realName.toLowerCase().includes('neha');
          return {
            initials: realName.slice(0, 2).toUpperCase(),
            gradient: isFemale ? 'linear-gradient(135deg,#DB2777,#F472B6)' : 'linear-gradient(135deg,#2a195c,#2A195C)',
            name: realName,
            id: riderId,
            phone: item.mobile || item.phone || '+91 98765 43210',
            aadhaar: item.aadhaar || 'XXXX XXXX 1234',
            lastRide: lastRideFormatted,
            vehicle: item.vehicle_name || item.vehicle_code || item.vehicle_id || 'Evegah E1',
            vehicle_id: item.vehicle_id || item.vehicle_code || 'EVM1024012',
            battery_id: item.battery_id || 'BAT-0098',
            deposit: item.deposit || item.deposit_amount || 500,
            zone: item.zone || 'All',
            avatar: isFemale ? '/priya_avatar.png' : '/rohit_avatar.png',
            raw: item,
          };
        }));
      } else {
        setRiders(RIDERS);
      }
    } catch {
      setRiders(RIDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('evegah_active_zone');
      if (saved) setSelectedZone(saved);
    }
    fetchRiders();

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

  // Filter riders based on search query and active zone
  const filteredRiders = riders.filter(r => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.id && r.id.toLowerCase().includes(q)) ||
      (r.vehicle && r.vehicle.toLowerCase().includes(q)) ||
      (r.aadhaar && r.aadhaar.toLowerCase().includes(q))
    );
    const isAll = !selectedZone || selectedZone === 'All' || selectedZone === 'All Zones';
    const riderZone = (r.zone || '').trim().toLowerCase();
    const activeZone = (selectedZone || '').trim().toLowerCase();
    const matchesZone = isAll || (riderZone && (riderZone.includes(activeZone) || activeZone.includes(riderZone)));
    return matchesSearch && matchesZone;
  });

  const handleSelectRider = (rider: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('evegah_retain_rider', JSON.stringify(rider));
      // also seed retain_ride_kyc for full compatibility
      localStorage.setItem('evegah_retain_ride_kyc', JSON.stringify({
        fullName: rider.name,
        mobile: rider.phone,
        riderId: rider.id,
        vehicle: rider.vehicle,
        deposit: rider.deposit,
        aadhaar: rider.aadhaar,
        isReturning: true
      }));
    }
    router.push('/retain-rider/rental');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="nr-shell">
        <Sidebar activePath="/retain-rider" />

        <div className="nr-main">
          <TopBar title="Retain Rider Registration" subtitle="Search and select an existing rider to create a new ride" />

          <div className="nr-page">

            {/* ── Breadcrumb ── */}
            <div className="nr-bc">
              <Link href="/"><ILeft /> Home</Link>
              <span className="nr-bc-sep">›</span>
              <a href="#">Rides / Rentals</a>
              <span className="nr-bc-sep">›</span>
              <span className="nr-bc-cur">Retain Ride Registration</span>
            </div>

            {/* ── Title row ── */}
            <div className="nr-title-row">
              <div>
                <h1 className="nr-h1">Retain Ride Registration</h1>
                <p className="nr-sub">Search and select an existing rider to create a new ride</p>
              </div>
              <Link href="/renters" className="nr-back-btn"><ILeft /> Back to Rides</Link>
            </div>

            {/* ── Stepper ── */}
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
                  {i < STEPS.length - 1 && <div className="nr-step-line" />}
                </div>
              ))}
            </div>

            {/* ── 2-col layout ── */}
            <div className="nr-layout">

              {/* ── LEFT COLUMN ── */}
              <div>
                <div className="nr-card">

                  {/* Card header */}
                  <div className="nr-card-hdr">
                    <div>
                      <h2>Search Existing Rider</h2>
                      <p>Search by mobile number, rider ID, or name from registered riders</p>
                    </div>
                  </div>

                  {/* Search Tabs */}
                  <div className="rr-tabs">
                    {TABS.map(t => (
                      <div
                        key={t.id}
                        className={`rr-tab ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.id)}
                      >
                        <span style={{ display: 'flex', color: activeTab === t.id ? '#2a195c' : '#9CA3AF' }}>
                          <t.Icon s={13} />
                        </span>
                        {t.label}
                      </div>
                    ))}
                  </div>

                  {/* Search input */}
                  <div className="rr-search-area">
                    <div className="rr-search-row">
                      {activeTab === 'mobile' ? (
                        <div className="nr-ph">
                          <div className="nr-ph-pre">
                            <span style={{ fontSize: 13 }}>🇮🇳</span>+91 {chevSvg}
                          </div>
                          <input
                            placeholder="Enter 10 digit mobile number"
                            maxLength={10}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      ) : activeTab === 'riderid' ? (
                        <div className="nr-ph" style={{ flex: 1 }}>
                          <input
                            style={{ padding: '10px 13px' }}
                            placeholder="Enter Rider ID (e.g. RDR00124)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      ) : activeTab === 'aadhaar' ? (
                        <div className="nr-ph" style={{ flex: 1 }}>
                          <input
                            style={{ padding: '10px 13px' }}
                            placeholder="Enter 12 digit Aadhaar number"
                            maxLength={12}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="nr-ph" style={{ flex: 1 }}>
                          <input
                            style={{ padding: '10px 13px' }}
                            placeholder="Enter rider full name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      )}
                      <button className="rr-search-btn" onClick={fetchRiders}>
                        <ISearch s={14} /> Search
                      </button>
                    </div>
                  </div>

                  {/* Search Results */}
                  <div className="rr-results">
                    <div className="rr-results-hdr">
                      <span className="rr-results-title">Search Results</span>
                      <span className="rr-found-badge">{filteredRiders.length} Rider{filteredRiders.length !== 1 ? 's' : ''} Found</span>
                      <button
                        className="rr-refresh-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                        onClick={fetchRiders}
                      >
                        <IRefresh s={12} /> {loading ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>

                    {filteredRiders.length === 0 ? (
                      <div style={{ padding: '30px 0', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                        No matching registered riders found. Please try a different search term.
                      </div>
                    ) : (
                      filteredRiders.map((r, idx) => (
                        <div key={r.id || idx} className="rr-rider-row">
                          <div className="rr-avatar" style={{ position: 'relative', overflow: 'hidden', background: r.gradient || 'linear-gradient(135deg,#2a195c,#2A195C)' }}>
                            <img
                              src={r.avatar || '/rohit_avatar.png'}
                              alt={r.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, zIndex: 0 }}>
                              {r.initials}
                            </span>
                          </div>
                          <div className="rr-rider-info">
                            <div className="rr-rider-name-row">
                              <span className="rr-rider-name">{r.name}</span>
                              <span className="rr-returning-badge">Returning Rider</span>
                              <span className="rr-kyc-badge">✓ KYC On File</span>
                            </div>
                            <div className="rr-rider-id">{r.id}</div>
                            <div className="rr-rider-meta">
                              <span className="rr-meta-item"><IPhone s={12} /> {r.phone}</span>
                              <span className="rr-meta-item"><ICard s={12} /> {r.aadhaar}</span>
                              <span className="rr-meta-item"><ICal s={12} /> Last Ride: {r.lastRide}</span>
                              <span className="rr-meta-item"><IScooter s={12} /> {r.vehicle}</span>
                            </div>
                          </div>
                          <button
                            className="rr-select-btn"
                            onClick={() => handleSelectRider(r)}
                          >
                            Select Rider &gt;
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="rr-paging">
                    <span className="rr-paging-info">Showing {filteredRiders.length} registered rider(s)</span>
                    <div className="rr-paging-btns">
                      <button className="rr-pg-btn"><ILeft /></button>
                      <button className="rr-pg-btn active">1</button>
                      <button className="rr-pg-btn">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <RightPanel />

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
