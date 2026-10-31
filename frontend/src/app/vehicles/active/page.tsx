'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

/* ──────────────────────────────────────────────────────────────
   ACTIVE RIDES PAGE  ·  Real-Time Ride Operations
   ────────────────────────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.ar-shell{display:flex;min-height:100vh;background:#FAFBFD;font-family:Inter,sans-serif;}
.ar-main{margin-left:230px;display:flex;flex-direction:column;min-height:100vh;width:calc(100% - 230px);}
.ar-page{flex:1;padding:24px 28px 60px; background-color:#FAFBFD;}

/* breadcrumb */
.ar-bc{display:flex;align-items:center;gap:6px;font-size:12px;color:#64748B;font-weight:500;margin-bottom:12px;}
.ar-bc a{color:#64748B;text-decoration:none;transition:color .15s;}
.ar-bc a:hover{color:#2A195C;}
.ar-bc-sep{color:#94A3B8;}
.ar-bc-cur{color:#1E293B;font-weight:600;}

/* Header Title row */
.ar-title-row{display:flex;align-items:flex-start;justify-content:space-between;margin:0 0 20px;gap:16px;}
.ar-h1{font-size:24px;font-weight:800;color:#0F172A;margin:0 0 4px;letter-spacing:-0.02em;}
.ar-sub{font-size:13.5px;color:#64748B;margin:0;font-weight:500;}
.ar-hdr-actions{display:flex;align-items:center;gap:10px;}
.ar-hdr-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;background:#fff;border:1.5px solid #E2E8F0;border-radius:10px;font-size:13px;font-weight:600;color:#475569;cursor:pointer;font-family:inherit;box-shadow:0 1px 2px rgba(0,0,0,.03);transition:all .15s;}
.ar-hdr-btn:hover{border-color:#2A195C;color:#2A195C;}

/* Stats cards (6 in a row, matching Image 3 design) */
.ar-stats-row{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:24px;}
.ar-stat-card{background:#fff;border:1.5px solid #E2E8F0;border-radius:14px;padding:16px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 2px rgba(0,0,0,.02);box-sizing:border-box;}
.ar-stat-ic{width:40px;height:40px;border-radius:10px;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ar-stat-info{min-width:0;flex:1;display:flex;flex-direction:column;}
.ar-stat-lbl{font-size:9.5px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px;}
.ar-stat-val{font-size:19px;font-weight:800;color:#0F172A;line-height:1.2;margin-bottom:2px;}
.ar-stat-trend{font-size:10px;font-weight:600;display:flex;align-items:center;gap:2px;}

/* Search & filters */
.ar-filter-card{background:#fff;border:1.5px solid #E2E8F0;border-radius:14px;padding:14px 18px;margin-bottom:20px;box-shadow:0 1px 2px rgba(0,0,0,.02);display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;}
.ar-search-input-wrap{flex:1;min-width:260px;position:relative;display:flex;align-items:center;}
.ar-search-ic{position:absolute;left:12px;color:#64748B;display:flex;}
.ar-search-input{width:100%;padding:9px 12px 9px 36px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:13px;color:#1E293B;outline:none;background:#FAFBFD;transition:all .15s;font-family:inherit;}
.ar-search-input:focus{border-color:#2A195C;background:#fff;}
.ar-filter-grp{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.ar-select{padding:9px 14px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:13px;color:#475569;background:#fff;font-weight:600;cursor:pointer;outline:none;transition:border-color .15s;font-family:inherit;}
.ar-select:focus{border-color:#2A195C;}

/* Telemetry Table Styles */
.ar-table-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 0px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.02); margin-top: 20px; }
.ar-table { width: 100%; border-collapse: collapse; text-align: left; }
.ar-tr { border-bottom: 1.5px solid #F1F5F9; cursor: pointer; transition: background .15s, border-left .15s; }
.ar-tr:hover { background: #F8FAFC; }
.ar-tr.selected { background: #F9FAFF; }
.ar-tr.selected td:first-child { border-left: 4px solid #2A195C; padding-left: 12px; }
.ar-th { font-size: 11px; font-weight: 700; color: #475569; padding: 14px 16px; border-bottom: 2.5px solid #E2E8F0; text-transform: uppercase; letter-spacing: 0.05em; background: #FAFBFD; }
.ar-td { padding: 16px; font-size: 13px; color: #334155; vertical-align: middle; }

/* Renter & Ride ID Cell */
.ar-renter-cell { display: flex; align-items: center; gap: 12px; }
.ar-renter-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #2A195C, #4F46E5); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11.5px; font-weight: 700; flex-shrink: 0; }
.ar-renter-name-wrap { display: flex; flex-direction: column; gap: 2px; }
.ar-renter-name-text { font-weight: 700; color: #0F172A; }
.ar-ride-id-text { font-size: 10.5px; color: #64748B; font-weight: 500; }

/* Vehicle Info Cell */
.ar-veh-cell { display: flex; align-items: center; gap: 10px; }
.ar-veh-img-box { width: 38px; height: 38px; border-radius: 8px; border: 1.5px solid #E2E8F0; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff; flex-shrink: 0; }
.ar-veh-img { max-width: 100%; max-height: 100%; object-fit: contain; }
.ar-veh-name-wrap { display: flex; flex-direction: column; gap: 2px; }
.ar-veh-code-text { font-weight: 800; color: #0F172A; }
.ar-veh-type-text { font-size: 10.5px; color: #64748B; font-weight: 500; }

/* Route Cell */
.ar-route-cell { display: flex; flex-direction: column; gap: 8px; padding-left: 14px; position: relative; max-width: 200px; }
.ar-route-cell::before { content: ''; position: absolute; left: 3px; top: 8px; bottom: 8px; width: 1.5px; background: #E2E8F0; border-style: dashed; }
.ar-route-node-cell { font-size: 12px; color: #475569; position: relative; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ar-route-node-cell::before { content: ''; position: absolute; left: -14px; top: 4px; width: 6.5px; height: 6.5px; border-radius: 50%; border: 1.5px solid #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.1); z-index: 2; }
.ar-route-node-cell.start::before { background: #10B981; }
.ar-route-node-cell.end::before { background: #2A195C; }
.ar-route-node-text { font-weight: 600; color: #0F172A; }

/* Telemetry styling in table */
.ar-table-progress-bg { width: 70px; height: 5.5px; background: #E2E8F0; border-radius: 3px; overflow: hidden; margin-top: 4px; }
.ar-table-progress-fill { height: 100%; background: #10B981; border-radius: 3px; }

/* Status alerts cell */
.ar-alert-banner { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; padding: 4.5px 9px; border-radius: 6px; border-width: 1px; border-style: solid; text-transform: uppercase; letter-spacing: 0.02em; }
.ar-alert-banner.critical { background: #FEF2F2; border-color: #FCA5A5; color: #EF4444; }
.ar-alert-banner.warning { background: #FFFBEB; border-color: #FDE68A; color: #D97706; }
.ar-alert-banner.normal { background: #ECFDF5; border-color: #A7F3D0; color: #10B981; }
.ar-alert-desc { font-size: 11px; font-weight: 600; margin-top: 5px; }
.ar-alert-desc.critical { color: #EF4444; }
.ar-alert-desc.warning { color: #D97706; }

/* Actions */
.ar-action-btn { width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #E2E8F0; background: #fff; color: #64748B; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
.ar-action-btn:hover { color: #2A195C; border-color: #C7D2FE; background: #F5F3FF; }
.ar-action-btn.end-btn:hover { color: #EF4444; border-color: #FCA5A5; background: #FEF2F2; }
.ar-action-link { font-size: 12.5px; font-weight: 700; color: #2A195C; text-decoration: none; display: flex; align-items: center; gap: 4px; }
.ar-action-link:hover { text-decoration: underline; }

/* Unified Vehicle Hero Section */
.vd-hero-container { display: flex; flex-direction: column; gap: 0px; margin-bottom: 24px; width: 100%; box-sizing: border-box; }
.vd-hero-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 20px 24px; display: flex; align-items: center; gap: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.01); box-sizing: border-box; }
.vd-hero-scooter-wrap { width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.vd-hero-scooter-img { max-width: 100%; max-height: 100%; object-fit: contain; }
.vd-hero-middle { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.vd-hero-title-row { display: flex; align-items: center; gap: 10px; }
.vd-hero-h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -0.02em; }
.vd-hero-active-badge { background: #ECFDF5; color: #10B981; border: 1px solid #A7F3D0; border-radius: 6px; font-size: 11px; font-weight: 700; padding: 2.5px 8.5px; }
.vd-hero-active-badge.warning { background: #FFFBEB; color: #D97706; border-color: #FDE68A; }
.vd-hero-active-badge.critical { background: #FEF2F2; color: #EF4444; border-color: #FCA5A5; }
.vd-hero-sub { font-size: 13px; color: #64748B; margin: 0; font-weight: 500; }
.vd-hero-telemetry-bar { display: flex; background: #FAFBFD; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; margin-top: 10px; align-items: center; width: 100%; max-width: 720px; box-sizing: border-box; justify-content: space-between; }
.vd-t-item { display: flex; flex-direction: column; gap: 4px; border-right: 1px solid #E2E8F0; padding-right: 16px; flex: 1; }
.vd-t-item:last-child { border-right: none; padding-right: 0; }
.vd-t-lbl { font-size: 11px; color: #64748B; font-weight: 600; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.02em; }
.vd-t-val { font-size: 13.5px; font-weight: 700; color: #1E293B; }
.vd-t-progress-bg { width: 60px; height: 5px; background: #E2E8F0; border-radius: 2.5px; overflow: hidden; margin-top: 1px; }
.vd-t-progress-val { height: 100%; background: #10B981; border-radius: 2.5px; }
.vd-t-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.vd-t-dot.online { background: #10B981; }
.vd-t-dot.warning { background: #F59E0B; }
.vd-t-dot.critical { background: #EF4444; }
.vd-hero-right { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
.vd-h-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; }
.vd-h-btn:hover { border-color: #2A195C; color: #2A195C; }

`;

const SI = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const Sv = (p: React.SVGProps<SVGSVGElement> & { s?: number }) => (
  <svg width={p.s || 14} height={p.s || 14} viewBox="0 0 24 24" {...SI} {...p} />
);

const ILocate      = () => <Sv><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></Sv>;
const ISearch      = () => <Sv><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Sv>;
const ICalendar    = () => <Sv><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Sv>;
const IScooter     = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" />
    <path d="M5.5 17.5l4-8h4l2.5 8" />
    <path d="M8.5 12h5" />
    <path d="M12 9l-1.5 2.5h2L11 14" strokeWidth="1.8" />
  </svg>
);
const IMsg         = () => <Sv><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Sv>;
const IRefresh     = () => <Sv><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></Sv>;
const ITrend    = ({ s = 14 }) => <Sv s={s}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Sv>;
const IClock    = ({ s = 14 }) => <Sv s={s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Sv>;
const IAlert    = () => <Sv><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Sv>;
const IChevronDown = () => <Sv><polyline points="6 9 12 15 18 9"/></Sv>;
const IDots        = () => <Sv><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></Sv>;
const IBolt        = () => <Sv><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Sv>;
const ISpeed       = () => <Sv><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Sv>;
const IOdo         = () => <Sv><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></Sv>;
const ITool        = () => <Sv><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></Sv>;

// 2D SVG Icons for KPI cards
const ITruck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" />
    <path d="M5.5 17.5l4-8h4l2.5 8" />
    <path d="M8.5 12h5" />
    <path d="M12 9l-1.5 2.5h2L11 14" strokeWidth="1.8" />
  </svg>
);
const IUsers = () => <Sv s={20}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Sv>;
const IChart = () => <Sv s={20}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></Sv>;
const IRupee = () => <Sv s={20}><path d="M6 9h12M6 5h12M6 9c0 3 3 6 6 6h1c4 0 7-3 7-7M9 15l-6 6" /></Sv>;
const ISwap  = () => <Sv s={20}><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="8 21 3 21 3 16" /><line x1="3" y1="21" x2="20" y2="4" /></Sv>;
const IWarning = () => <Sv s={20}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Sv>;

interface ActiveRideItem {
  rideId: string;
  renter: string;
  code: string;
  type: string;
  pickup: string;
  destination: string;
  distance: string;
  duration: string;
  speed: number;
  battery: number;
  fare: string;
  status: 'Normal' | 'Warning' | 'Critical';
  badgeCls: string;
  alertMsg?: string;
  imgSrc: string;
}

const ACTIVE_RIDES_MOCK: ActiveRideItem[] = [];

export default function ActiveRidesPage() {
  const [search, setSearch] = useState('');
  const [alertFilter, setAlertFilter] = useState('All');
  const [selectedCode, setSelectedCode] = useState('');
  const [dbRenterList, setDbRenterList] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState('All Zones');

  useEffect(() => {
    const updateZone = () => {
      if (typeof window !== 'undefined') {
        const z = localStorage.getItem('evegah_active_zone') || localStorage.getItem('evegah_selected_zone') || 'All Zones';
        setSelectedZone(z);
      }
    };
    updateZone();
    window.addEventListener('evegah_active_zone_changed', updateZone);
    window.addEventListener('evegah_zone_changed', updateZone);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', updateZone);
      window.removeEventListener('evegah_zone_changed', updateZone);
    };
  }, []);

  useEffect(() => {
    api.get('/renters')
      .then(res => {
        if (res && res.data) {
          const activeOnly = res.data.filter((r: any) => r.status === 'Active Ride' || r.status === 'Retain Ride');
          setDbRenterList(activeOnly);
          if (activeOnly.length > 0) {
            setSelectedCode(activeOnly[0].vehicle_id);
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  const activeRides = useMemo<ActiveRideItem[]>(() => {
    return dbRenterList.map((r, idx) => ({
      rideId: `RID-2026-${String(r.id).substring(0, 4)}`,
      renter: r.rider_name,
      code: r.vehicle_id || 'EV-UNKNOWN',
      type: 'Electric Scooter',
      pickup: (r as any).zone || (r as any).zone_name || 'Manjalpur Zone',
      destination: 'Campus Area',
      distance: '1.5 km',
      duration: '10 mins',
      speed: 22,
      battery: 85,
      fare: `₹${r.rent}`,
      status: 'Normal' as const,
      badgeCls: 'in_ride',
      alertMsg: undefined,
      imgSrc: '/assets/v1.webp'
    }));
  }, [dbRenterList]);

  const filtered = activeRides.filter(r => {
    const matchesZone = !selectedZone || selectedZone === 'All Zones' || r.pickup.toLowerCase().includes(selectedZone.toLowerCase().replace(/zone|vadodara|-/g, '').trim());
    const matchesSearch = r.renter.toLowerCase().includes(search.toLowerCase()) || r.rideId.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase());
    const matchesAlert = alertFilter === 'All' || (alertFilter === 'Warning' && r.status !== 'Normal') || (alertFilter === 'Normal' && r.status === 'Normal');
    return matchesZone && matchesSearch && matchesAlert;
  });

  const selectedRide = activeRides.find(r => r.code === selectedCode) || activeRides[0] || {
    rideId: 'N/A',
    renter: 'No Active Rider',
    code: 'N/A',
    type: 'N/A',
    pickup: 'N/A',
    destination: 'N/A',
    distance: '0 km',
    duration: '0 mins',
    speed: 0,
    battery: 0,
    fare: '₹0.00',
    status: 'Normal' as const,
    badgeCls: 'in_ride',
    alertMsg: undefined,
    imgSrc: '/assets/v1.webp'
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ar-shell">
        <Sidebar activePath="/vehicles/active" />
        <div className="ar-main">
          <TopBar subtitle="Zone Admin" notificationCount={3} />
          <div className="ar-page">

            {/* Breadcrumb */}
            <div className="ar-bc">
              <Link href="/">Home</Link>
              <span className="ar-bc-sep">›</span>
              <a href="#">Vehicles</a>
              <span className="ar-bc-sep">›</span>
              <span className="ar-bc-cur">Active Rides</span>
            </div>

            {/* Title Row */}
            <div className="ar-title-row">
              <div>
                <h1 className="ar-h1">Active Rides</h1>
                <p className="ar-sub">Live monitoring of all rides currently in progress across the city.</p>
              </div>
              <div className="ar-hdr-actions">
                <button className="ar-hdr-btn"><IRefresh/> Refresh Live</button>
              </div>
            </div>

            {/* Metric KPI cards matching Image 3 design */}
            <div className="ar-stats-row">
              {[
                { lbl: 'TOTAL VEHICLES', val: '24', trend: '9.1% vs last 7 days', bg: '#2A195C', ic: <ITruck />, trendColor: '#16A34A' },
                { lbl: 'TOTAL RENTERS', val: '312', trend: '12.4% vs last 7 days', bg: '#10B981', ic: <IUsers />, trendColor: '#16A34A' },
                { lbl: 'ACTIVE RENTALS', val: '180', trend: '8.3% vs last 7 days', bg: '#3B82F6', ic: <IChart />, trendColor: '#16A34A' },
                { lbl: 'TOTAL REVENUE', val: '₹1,24,560', trend: '14.7% vs last 7 days', bg: '#F97316', ic: <IRupee />, trendColor: '#16A34A' },
                { lbl: 'BATTERY SWAPS', val: '96', trend: '7.6% vs last 7 days', bg: '#059669', ic: <ISwap />, trendColor: '#16A34A' },
                { lbl: 'ALERTS', val: '8', trend: '20% vs last 7 days', bg: '#EF4444', ic: <IWarning />, trendColor: '#EF4444', down: true }
              ].map(s => (
                <div className="ar-stat-card" key={s.lbl}>
                  <div className="ar-stat-ic" style={{ background: s.bg }}>
                    {s.ic}
                  </div>
                  <div className="ar-stat-info">
                    <div className="ar-stat-lbl">{s.lbl}</div>
                    <div className="ar-stat-val">{s.val}</div>
                    <div className="ar-stat-trend" style={{ color: s.trendColor }}>
                      <span style={{ fontSize: 8 }}>{s.down ? '▼' : '▲'}</span> {s.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Unified Vehicle Hero Section for selected ride */}
            {selectedRide && (
              <div className="vd-hero-container">
                <div className="vd-hero-card">
                  <div className="vd-hero-scooter-wrap">
                    <img src={selectedRide.imgSrc} alt={selectedRide.code} className="vd-hero-scooter-img" />
                  </div>
                  <div className="vd-hero-middle">
                    <div className="vd-hero-title-row">
                      <h1 className="vd-hero-h1">{selectedRide.code}</h1>
                      <span className={`vd-hero-active-badge ${selectedRide.status !== 'Normal' ? selectedRide.status.toLowerCase() : ''}`}>
                        {selectedRide.status === 'Normal' ? 'Active' : selectedRide.status}
                      </span>
                    </div>
                    <p className="vd-hero-sub">{selectedRide.type} • Evegah Pro</p>
                    
                    <div className="vd-hero-telemetry-bar">
                      <div className="vd-t-item">
                        <span className="vd-t-lbl"><IBolt /> Battery</span>
                        <span className="vd-t-val" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {selectedRide.battery}%
                          <span className="vd-t-progress-bg">
                            <span className="vd-t-progress-val" style={{ width: `${selectedRide.battery}%`, background: selectedRide.battery < 20 ? '#EF4444' : '#10B981' }} />
                          </span>
                        </span>
                      </div>
                      
                      <div className="vd-t-item">
                        <span className="vd-t-lbl"><ISpeed /> Speed</span>
                        <span className="vd-t-val" style={{ color: selectedRide.speed > 30 ? '#EF4444' : '#1E293B' }}>{selectedRide.speed} km/h</span>
                      </div>
                      
                      <div className="vd-t-item">
                        <span className="vd-t-lbl"><IOdo /> Odometer</span>
                        <span className="vd-t-val">2,156 km</span>
                      </div>
                      
                      <div className="vd-t-item">
                        <span className="vd-t-lbl"><ITool /> Status</span>
                        <span className="vd-t-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`vd-t-dot ${selectedRide.status === 'Normal' ? 'online' : selectedRide.status.toLowerCase()}`} />
                          {selectedRide.status === 'Normal' ? 'Online' : selectedRide.status}
                        </span>
                      </div>
                      
                      <div className="vd-t-item" style={{ flex: 1.4 }}>
                        <span className="vd-t-lbl"><ICalendar /> Last Updated</span>
                        <span className="vd-t-val">20 May 2024, 10:15 AM</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="vd-hero-right">
                    <Link href="/vehicles/map" className="vd-h-btn" style={{ borderColor: '#2A195C', color: '#2A195C', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                      <ILocate /> View on Map
                    </Link>
                    <button className="vd-h-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IDots /> More Actions <IChevronDown />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search and filters */}
            <div className="ar-filter-card">
              <div className="ar-search-input-wrap">
                <span className="ar-search-ic"><ISearch/></span>
                <input 
                  type="text" 
                  className="ar-search-input" 
                  placeholder="Search by Ride ID, Renter name, or Scooter Code..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="ar-filter-grp">
                <select 
                  className="ar-select"
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Normal">Normal Status</option>
                  <option value="Warning">With Active Alerts</option>
                </select>
              </div>
            </div>

            {/* Active rides table (replacing grid) */}
            <div className="ar-table-card">
              <table className="ar-table">
                <thead>
                  <tr>
                    <th className="ar-th">Renter / Ride ID</th>
                    <th className="ar-th">Vehicle</th>
                    <th className="ar-th">Trip Route</th>
                    <th className="ar-th">Speed</th>
                    <th className="ar-th">Battery</th>
                    <th className="ar-th">Est. Fare</th>
                    <th className="ar-th">Status & Alerts</th>
                    <th className="ar-th" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const initials = r.renter.split(' ').map((n: string) => n[0]).join('');
                    const isSelected = r.code === selectedCode;
                    return (
                      <tr 
                        className={`ar-tr ${isSelected ? 'selected' : ''}`} 
                        key={r.rideId}
                        onClick={() => setSelectedCode(r.code)}
                      >
                        {/* Renter & Ride ID */}
                        <td className="ar-td">
                          <div className="ar-renter-cell">
                            <div className="ar-renter-avatar">{initials}</div>
                            <div className="ar-renter-name-wrap">
                              <span className="ar-renter-name-text">{r.renter}</span>
                              <span className="ar-ride-id-text">{r.rideId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Vehicle Info */}
                        <td className="ar-td">
                          <div className="ar-veh-cell">
                            <div className="ar-veh-img-box">
                              <img src={r.imgSrc} alt={r.code} className="ar-veh-img" />
                            </div>
                            <div className="ar-veh-name-wrap">
                              <span className="ar-veh-code-text">{r.code}</span>
                              <span className="ar-veh-type-text">{r.type}</span>
                            </div>
                          </div>
                        </td>

                        {/* Trip Route */}
                        <td className="ar-td">
                          <div className="ar-route-cell">
                            <div className="ar-route-node-cell start">
                              Pickup: <span className="ar-route-node-text">{r.pickup}</span>
                            </div>
                            <div className="ar-route-node-cell end">
                              Current: <span className="ar-route-node-text">{r.destination}</span>
                            </div>
                          </div>
                        </td>

                        {/* Speed */}
                        <td className="ar-td">
                          <span style={{ fontWeight: 700, color: r.speed > 30 ? '#EF4444' : '#111827' }}>
                            {r.speed} km/h
                          </span>
                        </td>

                        {/* Battery */}
                        <td className="ar-td">
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: r.battery < 20 ? '#EF4444' : '#111827' }}>
                              {r.battery}%
                            </span>
                            <div className="ar-table-progress-bg">
                              <div 
                                className="ar-table-progress-fill" 
                                style={{ width: `${r.battery}%`, background: r.battery < 20 ? '#EF4444' : '#10B981' }} 
                              />
                            </div>
                          </div>
                        </td>

                        {/* Est. Fare */}
                        <td className="ar-td">
                          <span style={{ fontWeight: 700, color: '#2A195C' }}>{r.fare}</span>
                        </td>

                        {/* Status & Alerts */}
                        <td className="ar-td">
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span className={`ar-alert-banner ${r.status.toLowerCase()}`}>
                              {r.status === 'Normal' ? 'In Ride' : r.status}
                            </span>
                            {r.alertMsg && (
                              <span className={`ar-alert-desc ${r.status.toLowerCase()}`}>
                                {r.alertMsg}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="ar-td" onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Link href="/vehicles/map" className="ar-action-link" style={{ marginRight: 8 }}>
                              <ILocate/> Map
                            </Link>
                            <button className="ar-action-btn" title="Send Message to Rider"><IMsg/></button>
                            <button className="ar-action-btn end-btn" style={{ color: '#EF4444' }} title="End Ride">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontWeight: 600 }}>
                        No active rides found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
