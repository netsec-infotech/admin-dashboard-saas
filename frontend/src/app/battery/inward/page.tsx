"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const SVGTick = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// 2D Icons styled nicely with TypeScript parameters
const IconBattery = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
    <line x1="22" y1="11" x2="22" y2="13" />
  </svg>
);

const IconVolt = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconCapacity = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconWeight = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z" />
    <path d="M12 12v9" />
    <path d="M8 21h8" />
  </svg>
);

const IconScooter = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="5" cy="18" r="3" />
    <circle cx="19" cy="18" r="3" />
    <path d="M5 15h11.5l3.5-6h-4" />
    <path d="M8 5h3l2 4" />
    <line x1="12" y1="9" x2="5" y2="18" />
  </svg>
);

const IconChip = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <line x1="9" y1="9" x2="9" y2="15" />
    <line x1="12" y1="9" x2="12" y2="15" />
    <line x1="15" y1="9" x2="15" y2="15" />
  </svg>
);

const IconStatus = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconTray = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const IconUser = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconCalendar = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconPin = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconSpeedometer = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 12 16 8" />
  </svg>
);

const IconHeart = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const IconReload = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

const IconFactory = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 20h20M2 17h20M12 20v-8M7 20v-5M17 20v-5M4 17V8l4 3 4-3 4 3 4-3v9" />
  </svg>
);

const IconShield = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CSS = `
.ba-shell { display: flex; min-height: 100vh; background: #ffffff; font-family: 'Inter', sans-serif; }
.ba-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); background: #ffffff; }
.ba-page { padding: 24px 32px; display: flex; flex-direction: column; gap: 24px; }

/* Breadcrumb back arrow */
.ba-bc-container { display: flex; align-items: center; gap: 12px; }
.ba-bc-back { width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #E2E8F0; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff; color: #475569; transition: all 0.15s; }
.ba-bc-back:hover { border-color: #2A195C; color: #2A195C; }
.ba-bc-text { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748B; font-weight: 500; }
.ba-bc-link { color: #64748B; text-decoration: none; cursor: pointer; transition: color 0.15s; }
.ba-bc-link:hover { color: #2A195C; }
.ba-bc-sep { color: #94A3B8; }
.ba-bc-cur { color: #1E293B; font-weight: 600; }

/* Title Row */
.ba-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.ba-title-left { display: flex; align-items: center; gap: 12px; }
.ba-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -0.02em; }
.ba-badge-completed { background: #DCFCE7; color: #16A34A; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; border: 1px solid #BBF7D0; text-transform: capitalize; }

.ba-actions { display: flex; align-items: center; gap: 12px; }
.ba-btn-secondary { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; }
.ba-btn-secondary:hover { border-color: #2A195C; color: #2A195C; }

/* Profile Card */
.ba-profile-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; display: flex; gap: 32px; align-items: flex-start; }
.ba-profile-left { display: flex; flex-direction: column; gap: 12px; align-items: center; width: 140px; flex-shrink: 0; }
.ba-img-box { width: 130px; height: 110px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.ba-soc-panel { width: 100%; display: flex; flex-direction: column; gap: 6px; }
.ba-soc-bar-bg { width: 100%; height: 6px; background: #F1F5F9; border-radius: 3px; overflow: hidden; margin-top: 4px; }
.ba-soc-bar-val { height: 100%; background: #10B981; border-radius: 3px; }
.ba-soc-text-row { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.ba-soc-label { color: #64748B; font-weight: 500; font-size: 11.5px; }
.ba-badge-healthy { background: #ECFDF5; color: #10B981; border: 1px solid #A7F3D0; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; align-self: flex-start; text-transform: capitalize; }

.ba-details-col { display: flex; flex-direction: column; gap: 14px; }
.ba-detail-item { display: flex; align-items: center; gap: 10px; }
.ba-detail-ic { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ba-detail-text { display: flex; flex-direction: column; gap: 1px; }
.ba-detail-lbl { font-size: 11px; color: #64748B; font-weight: 500; }
.ba-detail-val { font-size: 13px; font-weight: 700; color: #1E293B; }

/* Tabs */
.ba-tabs { display: flex; border-bottom: 1.5px solid #E2E8F0; gap: 32px; margin-top: 8px; }
.ba-tab { padding: 12px 4px; font-size: 14px; font-weight: 600; color: #64748B; cursor: pointer; border-bottom: 3.5px solid transparent; transition: all 0.15s; margin-bottom: -1.5px; }
.ba-tab:hover { color: #2A195C; }
.ba-tab.active { color: #2A195C; border-bottom-color: #2A195C; font-weight: 700; }

/* Grid layout for cards */
.ba-grid-overview { display: grid; grid-template-columns: 1fr 1fr 1.15fr; gap: 24px; }
.ba-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.ba-card-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; margin-bottom: 4px; }
.ba-card-tit { font-size: 14px; font-weight: 800; color: #1E293B; margin: 0; }

.ba-info-list { display: flex; flex-direction: column; gap: 14px; }
.ba-info-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.ba-info-lbl { color: #64748B; font-weight: 500; display: flex; align-items: center; gap: 8px; }
.ba-info-val { font-weight: 700; color: #1E293B; }
.ba-info-val-notes { font-weight: 500; color: #64748B; background: #F8FAFC; padding: 10px 14px; border-radius: 8px; width: 100%; border: 1px solid #E2E8F0; margin-top: 4px; font-size: 12.5px; line-height: 1.4; }

/* Health Circle Gauge */
.ba-health-con { position: relative; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ba-health-svg { transform: rotate(-90deg); width: 110px; height: 110px; }
.ba-health-txt { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ba-health-num { font-size: 22px; font-weight: 800; color: #1E293B; line-height: 1.1; }
.ba-health-lbl { font-size: 8.5px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; text-align: center; width: 80px; }
.ba-health-badge { background: #DCFCE7; color: #16A34A; font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1.1px solid #BBF7D0; margin-top: 3px; text-transform: uppercase; }

.ba-btn-health { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 10px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #2A195C; cursor: pointer; transition: all 0.15s; margin-top: 8px; }
.ba-btn-health:hover { border-color: #2A195C; background: #FAF5FF; }

/* Specs two-column */
.ba-specs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px 24px; }
.ba-spec-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.ba-spec-lbl { color: #64748B; font-weight: 500; }
.ba-spec-val { font-weight: 700; color: #1E293B; }

/* Bottom Row Cards */
.ba-grid-bottom { display: grid; grid-template-columns: 1.2fr 0.9fr 0.9fr; gap: 24px; }
.ba-link { font-size: 13px; font-weight: 600; color: #2A195C; text-decoration: none; cursor: pointer; }
.ba-link:hover { text-decoration: underline; }

.ba-table-container { overflow-x: auto; margin-top: 4px; }
.ba-table { width: 100%; border-collapse: collapse; }
.ba-table th { font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; padding: 10px; border-bottom: 1.2px solid #E2E8F0; text-align: left; }
.ba-table td { padding: 10px; font-size: 12.5px; color: #1E293B; border-bottom: 1px solid #F1F5F9; }
.ba-table tr:hover td { background: #F8FAFC; }

.ba-chk-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 6.5px 0; border-bottom: 1px solid #F1F5F9; }
.ba-chk-item:last-child { border-bottom: none; }
.ba-chk-lbl { color: #334155; font-weight: 500; display: flex; align-items: center; gap: 10px; }
.ba-chk-circle { width: 16px; height: 16px; border-radius: 50%; background: #ECFDF5; border: 1.2px solid #A7F3D0; display: flex; align-items: center; justify-content: center; color: #10B981; font-size: 10px; font-weight: bold; }
.ba-chk-val { color: #10B981; font-weight: 700; font-size: 11.5px; }

/* Attachments */
.ba-attach-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 4px; }
.ba-attach-card { border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; background: #fff; display: flex; flex-direction: column; transition: transform 0.15s, border-color 0.15s; }
.ba-attach-card:hover { border-color: #2A195C; transform: translateY(-2px); }
.ba-attach-thumb-container { height: 68px; overflow: hidden; background: #F8FAFC; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #E2E8F0; position: relative; }
.ba-attach-name { font-size: 11.5px; font-weight: 700; color: #1E293B; padding: 8px 8px 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ba-attach-date { font-size: 9.5px; color: #94A3B8; padding: 0 8px 8px; font-weight: 500; }

.ba-carousel-dots { display: flex; justify-content: center; gap: 6px; margin-top: 12px; align-items: center; }
.ba-carousel-btn { border: none; background: none; cursor: pointer; color: #64748B; font-weight: 700; font-size: 14px; padding: 0 6px; transition: color 0.15s; }
.ba-carousel-btn:hover { color: #2A195C; }
.ba-carousel-dot { width: 5px; height: 5px; border-radius: 50%; background: #CBD5E1; transition: background 0.15s; }
.ba-carousel-dot.active { background: #2A195C; width: 6px; height: 6px; }

/* Timeline Horizontal */
.ba-timeline-container { display: flex; justify-content: space-between; align-items: center; position: relative; padding: 24px 40px 12px; }
.ba-timeline-line { position: absolute; left: 70px; right: 70px; top: 43px; height: 2.5px; background: #E2E8F0; z-index: 0; }
.ba-tl-step { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; text-align: center; width: 140px; }
.ba-tl-circle { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; background: #fff; border: 2.5px solid #CBD5E1; color: #64748B; transition: all 0.2s; }
.ba-tl-circle.done { border-color: #10B981; background: #ECFDF5; color: #10B981; }
.ba-tl-circle.active { border-color: #2A195C; background: #F5F3FF; color: #2A195C; }
.ba-tl-label { font-size: 13px; font-weight: 700; color: #1E293B; margin-top: 10px; }
.ba-tl-time { font-size: 11px; color: #94A3B8; margin-top: 2px; font-weight: 500; }
`;

function BatteryInwardDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams?.get('id') || searchParams?.get('battery_id') || '';

  const [battery, setBattery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    let isMounted = true;
    const fetchBattery = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      try {
        if (requestedId) {
          const res = await fetch(`${apiUrl}/batteries/${encodeURIComponent(requestedId)}`);
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data && data.battery_id) {
              setBattery(data);
              setLoading(false);
              return;
            }
          }
        }
        // Fallback to first available battery in database
        const listRes = await fetch(`${apiUrl}/batteries`);
        if (listRes.ok) {
          const list = await listRes.json();
          if (isMounted && Array.isArray(list) && list.length > 0) {
            setBattery(list[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching battery detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBattery();
    return () => { isMounted = false; };
  }, [requestedId]);

  const [checklist] = useState([
    { name: 'Battery Physical Check', status: 'OK' },
    { name: 'Voltage Check', status: 'OK' },
    { name: 'Temperature Check', status: 'OK' },
    { name: 'Connector & Wiring Check', status: 'OK' },
    { name: 'BMS Communication Check', status: 'OK' },
    { name: 'Capacity Verification', status: 'OK' },
    { name: 'Cosmetic Condition Check', status: 'OK' },
    { name: 'Documents Verified', status: 'OK' }
  ]);

  const bId = battery?.battery_id || requestedId || 'BAT-GT-60V-01';
  const bSoc = typeof battery?.soc === 'number' ? battery.soc : parseInt(battery?.soc) || 92;
  const bSoh = battery?.soh ? parseInt(battery.soh) : (battery?.health ? parseInt(battery.health) : 98);
  const bStatus = (battery?.status || 'available').toLowerCase();
  const bType = battery?.battery_type || 'Li-ion NMC';
  const bVolt = battery?.voltage || (bSoc > 80 ? 67.2 : 64.5);
  const bCap = battery?.capacity || '60V / 30Ah';
  const bZone = battery?.zone || 'Gotri Zone';
  const bLocation = battery?.location || `${bZone} Dock #01`;
  const bModel = battery?.model || 'TR-6030N';
  const bSerial = battery?.serial_number || bId;
  const bCycles = battery?.cycles || 25;
  const bTemp = battery?.temp || 28;
  const bPurchDate = battery?.purchase_date ? new Date(battery.purchase_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '10 Jan 2026';
  const bWarrDate = battery?.warranty_valid_till ? new Date(battery.warranty_valid_till).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '10 Jan 2028';
  const bNotes = battery?.notes || 'Standard inward inspection passed. Battery ready for dock swapping.';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ba-shell">
        <Sidebar activePath="/battery/inward" />
        <div className="ba-main">
          <TopBar />
          <div className="ba-page">
            {/* Breadcrumbs Row */}
            <div className="ba-bc-container">
              <button className="ba-bc-back" onClick={() => router.back()}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <div className="ba-bc-text">
                <a href="/battery/list" className="ba-bc-link">Battery List</a>
                <span className="ba-bc-sep">&gt;</span>
                <span className="ba-bc-sep">Battery Inward</span>
                <span className="ba-bc-sep">&gt;</span>
                <span className="ba-bc-cur">{bId}</span>
              </div>
            </div>

            {/* Page Title Row */}
            <div className="ba-title-row">
              <div className="ba-title-left">
                <h1 className="ba-h1">Battery Inward: {bId}</h1>
                <span className="ba-badge-completed" style={{ background: bStatus === 'available' ? '#DCFCE7' : '#EFF6FF', color: bStatus === 'available' ? '#16A34A' : '#2563EB', borderColor: bStatus === 'available' ? '#BBF7D0' : '#BFDBFE' }}>
                  {bStatus.replace('_', ' ')}
                </span>
              </div>
              <div className="ba-actions">
                <button className="ba-btn-secondary" onClick={() => router.push('/battery/list')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back to Battery List
                </button>
              </div>
            </div>

            {/* Profile Header Card */}
            <div className="ba-profile-card">
              {/* Left Part: Battery Image & SoC */}
              <div className="ba-profile-left">
                <div className="ba-img-box">
                  <img
                    src="/ev_batttery.png"
                    alt="Battery"
                    style={{ width: '100%', height: '110px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.src = "/evegah_battery.png";
                    }}
                  />
                </div>
                <div className="ba-soc-panel">
                  <div className="ba-soc-text-row">
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>{bSoc}%</span>
                    <span className="ba-soc-label">Battery SoC</span>
                  </div>
                  <div className="ba-soc-bar-bg">
                    <div className="ba-soc-bar-val" style={{ width: `${bSoc}%`, background: bSoc > 70 ? '#10B981' : bSoc > 25 ? '#F59E0B' : '#EF4444' }}></div>
                  </div>
                </div>
              </div>

              {/* Right Part: Header & Metadata Columns */}
              <div className="ba-profile-right" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Battery Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>{bId}</h2>
                  <span className="ba-badge-healthy" style={{ background: bSoh >= 90 ? '#ECFDF5' : '#FEF3C7', color: bSoh >= 90 ? '#10B981' : '#D97706' }}>
                    {bSoh >= 90 ? 'Healthy Pack' : 'Service Due'} ({bSoh}% SOH)
                  </span>
                </div>

                {/* Metadata Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                  {/* Column 1 */}
                  <div className="ba-details-col">
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#ECFDF5', color: '#10B981' }}>
                        <IconBattery />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Battery Type</span>
                        <span className="ba-detail-val">{bType}</span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#ECFDF5', color: '#10B981' }}>
                        <IconVolt />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Voltage</span>
                        <span className="ba-detail-val">{bVolt} V</span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#ECFDF5', color: '#10B981' }}>
                        <IconCapacity />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Capacity</span>
                        <span className="ba-detail-val">{bCap}</span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#ECFDF5', color: '#10B981' }}>
                        <IconWeight />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Pack Weight</span>
                        <span className="ba-detail-val">11.4 kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="ba-details-col">
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#F1F5F9', color: '#64748B' }}>
                        <IconScooter />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Compatible Model</span>
                        <span className="ba-detail-val">{bModel}</span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#F1F5F9', color: '#64748B' }}>
                        <IconChip />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Battery Serial No.</span>
                        <span className="ba-detail-val">{bSerial}</span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#F1F5F9', color: '#64748B' }}>
                        <IconStatus />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Status</span>
                        <span className="ba-detail-val" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: bStatus === 'available' ? '#10B981' : '#3B82F6', display: 'inline-block' }}></span>
                          {bStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#F1F5F9', color: '#64748B' }}>
                        <IconTray />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Inward Type</span>
                        <span className="ba-detail-val">Station Inward</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="ba-details-col">
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#F5F3FF', color: '#2A195C' }}>
                        <IconUser />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-val">{battery?.assigned_to || battery?.rider_name || 'Station Fleet'}</span>
                        <span className="ba-detail-lbl">Assigned To</span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#F5F3FF', color: '#2A195C' }}>
                        <IconCalendar />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Inward Date & Time</span>
                        <span className="ba-detail-val" style={{ whiteSpace: 'nowrap' }}>{bPurchDate}</span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#F5F3FF', color: '#2A195C' }}>
                        <IconPin />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Assigned Zone</span>
                        <span className="ba-detail-val">{bZone}</span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#F5F3FF', color: '#2A195C' }}>
                        <IconSpeedometer />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Dock Location</span>
                        <span className="ba-detail-val">{bLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 4 */}
                  <div className="ba-details-col">
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#ECFDF5', color: '#10B981' }}>
                        <IconHeart />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Current SoH</span>
                        <span className="ba-detail-val" style={{ color: '#10B981' }}>{bSoh}% SOH</span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#ECFDF5', color: '#10B981' }}>
                        <IconReload />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Cycle Count</span>
                        <span className="ba-detail-val">{bCycles}</span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#ECFDF5', color: '#10B981' }}>
                        <IconFactory />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Supplier / Make</span>
                        <span className="ba-detail-val">{battery?.supplier || battery?.make || 'Trontek Power'}</span>
                      </div>
                    </div>
                    <div className="ba-detail-item">
                      <div className="ba-detail-ic" style={{ background: '#ECFDF5', color: '#10B981' }}>
                        <IconShield />
                      </div>
                      <div className="ba-detail-text">
                        <span className="ba-detail-lbl">Warranty Valid Till</span>
                        <span className="ba-detail-val">{bWarrDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Row */}
            <div className="ba-tabs">
              {['Overview', 'Battery Health', 'Inward Metrics', 'Documents', 'History'].map((tab) => (
                <div key={tab} className={`ba-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab}
                </div>
              ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'Overview' && (
              <>
                {/* Middle Grid */}
                <div className="ba-grid-overview">
                  {/* Card 1: Inward Information */}
                  <div className="ba-card">
                    <div className="ba-card-hdr">
                      <h3 className="ba-card-tit">Inward Information</h3>
                    </div>
                    <div className="ba-info-list">
                      <div className="ba-info-row">
                        <span className="ba-info-lbl">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          Inward ID
                        </span>
                        <span className="ba-info-val" style={{ fontFamily: 'monospace' }}>BINW-2024-5678</span>
                      </div>
                      <div className="ba-info-row">
                        <span className="ba-info-lbl">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          Inward Date & Time
                        </span>
                        <span className="ba-info-val">20 May 2024, 10:15 AM</span>
                      </div>
                      <div className="ba-info-row">
                        <span className="ba-info-lbl">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                          </svg>
                          Inward Type
                        </span>
                        <span className="ba-info-val">Manual</span>
                      </div>
                      <div className="ba-info-row">
                        <span className="ba-info-lbl">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          Inward Reason
                        </span>
                        <span className="ba-info-val">New Battery Inward</span>
                      </div>
                      <div className="ba-info-row" style={{ alignItems: 'flex-start' }}>
                        <span className="ba-info-lbl" style={{ marginTop: '2px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          Inward Location
                        </span>
                        <span className="ba-info-val" style={{ textAlign: 'right', fontSize: '12.5px', lineHeight: '1.4' }}>
                          Palika Bazaar, CP<br />
                          <span style={{ color: '#64748B', fontWeight: 500 }}>New Delhi, Delhi</span>
                        </span>
                      </div>
                      <div className="ba-info-row">
                        <span className="ba-info-lbl">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          Assigned To
                        </span>
                        <span className="ba-info-val">Rahul Sharma</span>
                      </div>
                      <div className="ba-info-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', marginTop: '4px' }}>
                        <span className="ba-info-lbl">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9M3 20h4L18 9l-4-4L3 16v4z" />
                          </svg>
                          Notes
                        </span>
                        <div className="ba-info-val-notes">{bNotes}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Battery Health Overview */}
                  <div className="ba-card">
                    <div className="ba-card-hdr">
                      <h3 className="ba-card-tit">Battery Health Overview</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
                      <div className="ba-health-con">
                        <svg viewBox="0 0 36 36" className="ba-health-svg">
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="3"
                            strokeDasharray="92 8"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="ba-health-txt">
                          <span className="ba-health-num">92%</span>
                          <span className="ba-health-lbl">State of Health</span>
                          <span className="ba-health-badge">Good</span>
                        </div>
                      </div>
                      <div className="ba-info-list" style={{ flex: 1, gap: '10px' }}>
                        <div className="ba-info-row">
                          <span className="ba-info-lbl">
                            <IconBattery className="text-emerald-500" />
                            State of Charge
                          </span>
                          <span className="ba-info-val">78%</span>
                        </div>
                        <div className="ba-info-row">
                          <span className="ba-info-lbl">
                            <IconVolt className="text-emerald-500" />
                            Voltage
                          </span>
                          <span className="ba-info-val">48.6 V</span>
                        </div>
                        <div className="ba-info-row">
                          <span className="ba-info-lbl">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="17 1 21 5 17 9" />
                              <path d="M3 11V9a4 4 0 0 1 4-4h14M7 23 3 19l4-4" />
                              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                            </svg>
                            Current
                          </span>
                          <span className="ba-info-val">-12.4 A</span>
                        </div>
                        <div className="ba-info-row">
                          <span className="ba-info-lbl">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                            </svg>
                            Temperature
                          </span>
                          <span className="ba-info-val">32°C</span>
                        </div>
                        <div className="ba-info-row">
                          <span className="ba-info-lbl">
                            <IconShield className="text-emerald-500" />
                            Health Status
                          </span>
                          <span className="ba-info-val" style={{ color: '#10B981' }}>Good</span>
                        </div>
                        <div className="ba-info-row">
                          <span className="ba-info-lbl">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
                            </svg>
                            Power Status
                          </span>
                          <span className="ba-info-val" style={{ color: '#10B981' }}>Normal</span>
                        </div>
                      </div>
                    </div>
                    <button className="ba-btn-health" onClick={() => setActiveTab('Battery Health')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                      View Detailed Health Report
                    </button>
                  </div>

                  {/* Card 3: Battery Specifications */}
                  <div className="ba-card">
                    <div className="ba-card-hdr">
                      <h3 className="ba-card-tit">Battery Specifications</h3>
                    </div>
                    <div className="ba-specs-grid">
                      {/* Sub-Column 1 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">Battery ID</span>
                          <span className="ba-spec-val" style={{ fontFamily: 'monospace' }}>BAT-450X-12340001</span>
                        </div>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">Battery Type</span>
                          <span className="ba-spec-val">Li-ion</span>
                        </div>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">Nominal Voltage</span>
                          <span className="ba-spec-val">48 V</span>
                        </div>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">Nominal Capacity</span>
                          <span className="ba-spec-val">45 Ah</span>
                        </div>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">Energy</span>
                          <span className="ba-spec-val">2.16 kWh</span>
                        </div>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">Manufacturer</span>
                          <span className="ba-spec-val">VegaH Energy</span>
                        </div>
                      </div>
                      {/* Sub-Column 2 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">Model</span>
                          <span className="ba-spec-val">450X-BAT-V1</span>
                        </div>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">IP Rating</span>
                          <span className="ba-spec-val">IP67</span>
                        </div>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">Charging Voltage</span>
                          <span className="ba-spec-val">54.6 V</span>
                        </div>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">Max Charge Current</span>
                          <span className="ba-spec-val">25 A</span>
                        </div>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">Discharge Current</span>
                          <span className="ba-spec-val">60 A</span>
                        </div>
                        <div className="ba-spec-item">
                          <span className="ba-spec-lbl">Cells Configuration</span>
                          <span className="ba-spec-val">13S4P</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Grid */}
                <div className="ba-grid-bottom">
                  {/* Card 4: Recent Inwards */}
                  <div className="ba-card">
                    <div className="ba-card-hdr">
                      <h3 className="ba-card-tit">Recent Inwards</h3>
                      <span className="ba-link" onClick={() => alert('Opening full records logs...')}>View All</span>
                    </div>
                    <div className="ba-table-container">
                      <table className="ba-table">
                        <thead>
                          <tr>
                            <th>Date & Time</th>
                            <th>Inward ID</th>
                            <th>Inward By</th>
                            <th>Location</th>
                            <th style={{ textAlign: 'right' }}>Odometer</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ whiteSpace: 'nowrap' }}>20 May 2024, 10:15 AM</td>
                            <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#2A195C' }}>BINW-2024-5678</td>
                            <td style={{ fontWeight: 600 }}>Rahul Sharma</td>
                            <td>Palika Bazaar, CP</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>2,156 km</td>
                          </tr>
                          <tr>
                            <td style={{ whiteSpace: 'nowrap' }}>16 May 2024, 09:30 AM</td>
                            <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#2A195C' }}>BINW-2024-5567</td>
                            <td style={{ fontWeight: 600 }}>Ritu Sharma</td>
                            <td>Manjalpur Zone</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>2,100 km</td>
                          </tr>
                          <tr>
                            <td style={{ whiteSpace: 'nowrap' }}>12 May 2024, 08:50 AM</td>
                            <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#2A195C' }}>BINW-2024-5446</td>
                            <td style={{ fontWeight: 600 }}>Mohit Singh</td>
                            <td>KPGU Zone</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>2,048 km</td>
                          </tr>
                          <tr>
                            <td style={{ whiteSpace: 'nowrap' }}>08 May 2024, 07:45 AM</td>
                            <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#2A195C' }}>BINW-2024-5335</td>
                            <td style={{ fontWeight: 600 }}>Neha Gupta</td>
                            <td>Gotri Zone</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>1,984 km</td>
                          </tr>
                          <tr>
                            <td style={{ whiteSpace: 'nowrap' }}>04 May 2024, 09:10 AM</td>
                            <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#2A195C' }}>BINW-2024-5224</td>
                            <td style={{ fontWeight: 600 }}>Sandeep Kumar</td>
                            <td>Janpath Market</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>1,923 km</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card 5: Inward Checklist */}
                  <div className="ba-card">
                    <div className="ba-card-hdr">
                      <h3 className="ba-card-tit">Inward Checklist</h3>
                      <span className="ba-link" onClick={() => alert('View physical inspection logs...')}>View Checklist</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {checklist.map((item, idx) => (
                        <div key={idx} className="ba-chk-item">
                          <span className="ba-chk-lbl">
                            <span className="ba-chk-circle">✓</span>
                            {item.name}
                          </span>
                          <span className="ba-chk-val">OK</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 6: Attachments */}
                  <div className="ba-card">
                    <div className="ba-card-hdr">
                      <h3 className="ba-card-tit">Attachments</h3>
                      <span className="ba-link" onClick={() => alert('Viewing all 5 document files')}>View All (5)</span>
                    </div>
                    <div className="ba-attach-grid">
                      <div className="ba-attach-card">
                        <div className="ba-attach-thumb-container">
                          <img src="/battery_inward1.png" alt="Battery Label" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span className="ba-attach-name">Battery Label</span>
                        <span className="ba-attach-date">20 May, 10:10 AM</span>
                      </div>
                      <div className="ba-attach-card">
                        <div className="ba-attach-thumb-container">
                          <img src="/battery_inward2.png" alt="Connector Check" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span className="ba-attach-name">Connector Check</span>
                        <span className="ba-attach-date">20 May, 10:10 AM</span>
                      </div>
                      <div className="ba-attach-card">
                        <div className="ba-attach-thumb-container">
                          <img src="/battery_inward3.png" alt="Top View" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span className="ba-attach-name">Top View</span>
                        <span className="ba-attach-date">20 May, 10:10 AM</span>
                      </div>
                      <div className="ba-attach-card">
                        <div className="ba-attach-thumb-container">
                          <img src="/battery_inward4.png" alt="Packaging" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span className="ba-attach-name">Packaging</span>
                        <span className="ba-attach-date">20 May, 10:10 AM</span>
                      </div>
                    </div>
                    <div className="ba-carousel-dots">
                      <button className="ba-carousel-btn">&lt;</button>
                      <span className="ba-carousel-dot active"></span>
                      <span className="ba-carousel-dot"></span>
                      <span className="ba-carousel-dot"></span>
                      <span className="ba-carousel-dot"></span>
                      <button className="ba-carousel-btn">&gt;</button>
                    </div>
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="ba-card" style={{ width: '100%' }}>
                  <div className="ba-card-hdr" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <h3 className="ba-card-tit">Timeline</h3>
                  </div>
                  <div className="ba-timeline-container">
                    <div className="ba-timeline-line"></div>
                    <div className="ba-tl-step">
                      <div className="ba-tl-circle done">
                        <SVGTick />
                      </div>
                      <span className="ba-tl-label">Inward Created</span>
                      <span className="ba-tl-time">20 May 2024, 10:05 AM</span>
                    </div>
                    <div className="ba-tl-step">
                      <div className="ba-tl-circle done">
                        <SVGTick />
                      </div>
                      <span className="ba-tl-label">Battery Received</span>
                      <span className="ba-tl-time">20 May 2024, 10:07 AM</span>
                    </div>
                    <div className="ba-tl-step">
                      <div className="ba-tl-circle done">
                        <SVGTick />
                      </div>
                      <span className="ba-tl-label">Inspection Started</span>
                      <span className="ba-tl-time">20 May 2024, 10:08 AM</span>
                    </div>
                    <div className="ba-tl-step">
                      <div className="ba-tl-circle done">
                        <SVGTick />
                      </div>
                      <span className="ba-tl-label">Inspection Completed</span>
                      <span className="ba-tl-time">20 May 2024, 10:12 AM</span>
                    </div>
                    <div className="ba-tl-step">
                      <div className="ba-tl-circle active">
                        <SVGTick />
                      </div>
                      <span className="ba-tl-label">Inward Completed</span>
                      <span className="ba-tl-time">20 May 2024, 10:15 AM</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Other Tab placeholders */}
            {activeTab !== 'Overview' && (
              <div className="ba-card" style={{ padding: '40px', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>{activeTab} data and visualization is loaded dynamically.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function BatteryInwardDetailsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading battery inward telemetry...</div>}>
      <BatteryInwardDetailsContent />
    </Suspense>
  );
}
