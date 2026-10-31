"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

interface FranchiseInfo {
  id: string;
  name: string;
  code: string;
  type: string;
  zone: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  agreementStart: string;
  agreementEnd: string;
  duration: string;
  revenueMtd: string;
  revenueYtd: string;
  swapsCount: number;
  activeVehicles: number;
  status: 'Active' | 'Under Review' | 'Suspended';
}

export default function FranchiseDetailPage() {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Financials' | 'Fleet' | 'Batteries' | 'Documents'>('Overview');
  const [activeZone, setActiveZone] = useState('Manjalpur Zone');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedZone = localStorage.getItem('evegah_active_zone') || localStorage.getItem('evegah_selected_zone') || 'Manjalpur Zone';
      if (savedZone && savedZone !== 'All Zones') {
        setActiveZone(savedZone);
      }
    }

    const handleZone = (e: any) => {
      const z = e?.detail?.name || (typeof e?.detail === 'string' ? e.detail : 'Manjalpur Zone');
      if (z && z !== 'All Zones') setActiveZone(z);
    };

    window.addEventListener('evegah_active_zone_changed', handleZone);
    window.addEventListener('evegah_zone_changed', handleZone);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', handleZone);
      window.removeEventListener('evegah_zone_changed', handleZone);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const franchise: FranchiseInfo = activeZone.includes('Gotri') ? {
    id: 'FRN-GOT-0001',
    name: 'Gotri Evegah Green Hub',
    code: 'FRN-GOT-0001',
    type: 'Battery Swapping & Rental Depot',
    zone: 'Gotri Zone, Vadodara',
    ownerName: 'Hardik Joshi',
    phone: '+91 98254 11290',
    email: 'gotri.hub@evegah.com',
    address: 'Shop No. 12, Gotri Main Road, Vadodara - 390021',
    agreementStart: '01 Jan 2026',
    agreementEnd: '31 Dec 2027',
    duration: '2 Years (Renewable)',
    revenueMtd: '₹2,94,200',
    revenueYtd: '₹34,18,000',
    swapsCount: 840,
    activeVehicles: 24,
    status: 'Active'
  } : {
    id: 'FRN-SF-MJ-002',
    name: 'Speed Force Station & Depot',
    code: 'FRN-SF-002',
    type: 'Master Franchise & Service Hub',
    zone: 'Manjalpur Zone, Vadodara',
    ownerName: 'Speed Force Mobility LLP',
    phone: '+91 99245 88123',
    email: 'speedforcev@evegah.com',
    address: 'Plot 45, GIDC Industrial Estate, Manjalpur, Vadodara - 390011',
    agreementStart: '15 Feb 2026',
    agreementEnd: '14 Feb 2028',
    duration: '2 Years (Institutional)',
    revenueMtd: '₹4,12,650',
    revenueYtd: '₹48,92,400',
    swapsCount: 1240,
    activeVehicles: 38,
    status: 'Active'
  };

  const fleetList = [
    { id: 'GJ06-EV-1025', model: 'Evegah City', rider: 'Rakesh Solanki', soc: '88%', status: 'Active Rental', health: '98%' },
    { id: 'GJ06-EV-1022', model: 'Evegah City', rider: 'Kinjal Trivedi', soc: '94%', status: 'Active Rental', health: '97%' },
    { id: 'GJ06-EV-2041', model: 'Evegah Cargo', rider: 'Vikram Rajput', soc: '76%', status: 'Active Rental', health: '95%' },
    { id: 'GJ06-EV-1018', model: 'Evegah Pro', rider: 'Station Reserve', soc: '100%', status: 'Available in Hub', health: '100%' },
    { id: 'GJ06-EV-1029', model: 'Evegah City', rider: 'Depot Maintenance', soc: '42%', status: 'Routine Check', health: '92%' }
  ];

  const batteryDocks = [
    { bay: 'Bay #01', id: 'BAT-MJ-60V-01', soc: 100, temp: '27°C', volts: '67.2V', status: 'Ready for Swap' },
    { bay: 'Bay #02', id: 'BAT-MJ-60V-02', soc: 98, temp: '28°C', volts: '66.8V', status: 'Ready for Swap' },
    { bay: 'Bay #03', id: 'BAT-MJ-72V-01', soc: 94, temp: '29°C', volts: '83.4V', status: 'Ready for Swap' },
    { bay: 'Bay #04', id: 'BAT-MJ-60V-03', soc: 82, temp: '31°C', volts: '64.9V', status: 'Fast Charging' },
    { bay: 'Bay #05', id: 'BAT-MJ-60V-04', soc: 64, temp: '32°C', volts: '63.2V', status: 'Charging' },
    { bay: 'Bay #06', id: 'BAT-MJ-60V-05', soc: 38, temp: '33°C', volts: '60.8V', status: 'Charging' }
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap');

        .nr-shell {
          display: flex;
          min-height: 100vh;
          background: #F8FAFC;
          font-family: 'Inter', sans-serif;
          color: #0F172A;
        }

        .nr-main {
          margin-left: 230px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          flex: 1;
          min-width: 0;
          background: #F8FAFC;
        }

        .nr-page {
          flex: 1;
          padding: 20px 24px 60px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        @media (max-width: 1440px) {
          .nr-page {
            padding: 16px 20px 48px;
            gap: 16px;
          }
        }

        .nr-bc {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #64748B;
        }

        .nr-bc a {
          color: #64748B;
          text-decoration: none;
          font-weight: 500;
        }

        .nr-bc a:hover {
          color: #2A195C;
        }

        .nr-bc-sep {
          color: #CBD5E1;
        }

        .nr-bc-cur {
          color: #2A195C;
          font-weight: 600;
        }

        /* Top Hero Profile Card */
        .hub-profile-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 20px 24px;
          display: grid;
          grid-template-columns: 200px 1.4fr 1.2fr 1fr;
          gap: 24px;
          align-items: center;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
        }

        @media (max-width: 1100px) {
          .hub-profile-card {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .hub-profile-card {
            grid-template-columns: 1fr;
          }
        }

        .hub-photo-box {
          height: 120px;
          border-radius: 10px;
          background: #2A195C;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          gap: 8px;
          border: 1px solid #3B2382;
        }

        .hub-details-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .hub-name-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 2px;
        }

        .hub-meta-row {
          font-size: 12.5px;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hub-meta-row strong {
          color: #0F172A;
          width: 85px;
          flex-shrink: 0;
        }

        .hub-stats-col {
          border-left: 1px solid #F1F5F9;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-mini-box {
          display: flex;
          flex-direction: column;
        }

        .stat-mini-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .stat-mini-val {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #0F172A;
        }

        /* Action Buttons */
        .hub-actions-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
          justify-content: center;
        }

        .hub-btn {
          width: 100%;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .hub-btn-outline {
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #334155;
        }

        .hub-btn-outline:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
        }

        .hub-btn-primary {
          background: #2A195C;
          border: 1px solid #2A195C;
          color: #FFFFFF;
        }

        .hub-btn-primary:hover {
          background: #3B2382;
        }

        /* Nav Tabs */
        .hub-tabs-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 2px;
        }

        .hub-tab {
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 700;
          color: #64748B;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
        }

        .hub-tab:hover {
          color: #2A195C;
        }

        .hub-tab.active {
          color: #2A195C;
          border-bottom-color: #2A195C;
        }

        /* Grid Sections */
        .hub-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .hub-grid-3 {
            grid-template-columns: 1fr;
          }
        }

        .hub-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
          display: flex;
          flex-direction: column;
        }

        .hub-card-title {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: left;
          padding: 10px 12px;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
        }

        .data-table td {
          font-size: 12.5px;
          color: #334155;
          padding: 10px 12px;
          border-bottom: 1px solid #F1F5F9;
          vertical-align: middle;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover td {
          background: #F8FAFC;
        }

        .badge-green {
          background: #DCFCE7;
          color: #16A34A;
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .badge-purple {
          background: #F3E8FF;
          color: #7C3AED;
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .toast-banner {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0F172A;
          color: #FFFFFF;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <div className="nr-shell">
        <Sidebar activePath="/franchise" />
        <div className="nr-main">
          <TopBar
            title="Franchise Operations Center"
            subtitle={`${franchise.name} — Asset allocation, commission payouts, and live telemetry.`}
            showHand={false}
          />

          <div className="nr-page">
            {/* Breadcrumb */}
            <div className="nr-bc">
              <a href="/">Home</a>
              <span className="nr-bc-sep">&gt;</span>
              <a href="/franchise">Franchise</a>
              <span className="nr-bc-sep">&gt;</span>
              <span className="nr-bc-cur">{franchise.name} ({franchise.code})</span>
            </div>

            {/* Top Profile Card */}
            <div className="hub-profile-card">
              <div className="hub-photo-box">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#A7F3D0' }}>Station Verified</span>
              </div>

              <div className="hub-details-col">
                <h1 className="hub-name-title">{franchise.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge-green">{franchise.status}</span>
                  <span className="badge-purple">{franchise.code}</span>
                  <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>{franchise.type}</span>
                </div>
                <div className="hub-meta-row">
                  <strong>Partner:</strong> {franchise.ownerName}
                </div>
                <div className="hub-meta-row">
                  <strong>Phone:</strong> {franchise.phone} &bull; {franchise.email}
                </div>
                <div className="hub-meta-row">
                  <strong>Location:</strong> {franchise.address}
                </div>
              </div>

              <div className="hub-stats-col">
                <div className="stat-mini-box">
                  <span className="stat-mini-label">Revenue (MTD)</span>
                  <span className="stat-mini-val" style={{ color: '#16A34A' }}>{franchise.revenueMtd}</span>
                </div>
                <div className="stat-mini-box">
                  <span className="stat-mini-label">Agreement Period</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                    {franchise.agreementStart} &ndash; {franchise.agreementEnd}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{franchise.duration}</span>
                </div>
              </div>

              <div className="hub-actions-col">
                <button
                  className="hub-btn hub-btn-primary"
                  onClick={() => showToast('Opening Station Allocation Console...')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Allocate Asset
                </button>
                <button
                  className="hub-btn hub-btn-outline"
                  onClick={() => showToast('Syncing franchise settlement telemetry with ICICI E-Collect...')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Sync Payouts
                </button>
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="hub-tabs-bar">
              {[
                { key: 'Overview', label: 'Overview & KPIs' },
                { key: 'Fleet', label: `Assigned Fleet (${franchise.activeVehicles})` },
                { key: 'Batteries', label: `Battery Docks (${batteryDocks.length})` },
                { key: 'Financials', label: 'Commission & Payouts' },
                { key: 'Documents', label: 'Agreement & KYC' }
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`hub-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: Overview */}
            {activeTab === 'Overview' && (
              <div className="hub-grid-3">
                <div className="hub-card">
                  <div className="hub-card-title">Operational Summary</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Total Assigned EV Scooters</span>
                      <strong style={{ color: '#0F172A' }}>{franchise.activeVehicles} Units</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Active Battery Swap Docks</span>
                      <strong style={{ color: '#0F172A' }}>8 Docks (6 Online)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Swaps Completed This Month</span>
                      <strong style={{ color: '#16A34A' }}>{franchise.swapsCount} Swaps</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Station Uptime</span>
                      <strong style={{ color: '#16A34A' }}>99.4%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748B' }}>Operating Hours</span>
                      <strong style={{ color: '#0F172A' }}>24x7 Unmanned / RFID</strong>
                    </div>
                  </div>
                </div>

                <div className="hub-card">
                  <div className="hub-card-title">Hub Battery Health (SOH)</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', position: 'relative' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '32px', fontWeight: 800, color: '#16A34A' }}>97.2%</div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Average Pack Health</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>Good (&gt;90%)</span>
                      <div style={{ fontWeight: 700, color: '#16A34A' }}>94%</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>Fair (80-90%)</span>
                      <div style={{ fontWeight: 700, color: '#D97706' }}>6%</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>Critical</span>
                      <div style={{ fontWeight: 700, color: '#EF4444' }}>0%</div>
                    </div>
                  </div>
                </div>

                <div className="hub-card">
                  <div className="hub-card-title">Location &amp; Geofence Coordinates</div>
                  <div style={{ background: '#E2E8F0', height: '140px', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                    <svg width="100%" height="100%" style={{ background: '#E0F2FE' }}>
                      <rect x="0" y="0" width="100%" height="100%" fill="#E9EDF0" />
                      <line x1="20" y1="0" x2="20" y2="140" stroke="#fff" strokeWidth="8" />
                      <line x1="0" y1="70" x2="350" y2="70" stroke="#fff" strokeWidth="10" />
                      <line x1="140" y1="0" x2="140" y2="140" stroke="#fff" strokeWidth="8" />
                      <circle cx="140" cy="70" r="14" fill="rgba(42, 25, 92, 0.2)" />
                      <circle cx="140" cy="70" r="6" fill="#2A195C" stroke="#fff" strokeWidth="2" />
                    </svg>
                    <div style={{ position: 'absolute', bottom: '6px', left: '8px', background: 'rgba(255,255,255,0.95)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                      GPS: 22.2882° N, 73.1974° E
                    </div>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '10px' }}>
                    Geofenced perimeter: 2.5 km operational corridor around station center.
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Assigned Fleet */}
            {activeTab === 'Fleet' && (
              <div className="hub-card">
                <div className="hub-card-title">
                  <span>Assigned Vehicle Inventory ({fleetList.length} Units)</span>
                  <button className="hub-btn hub-btn-primary" style={{ width: 'auto' }} onClick={() => showToast('Add Vehicle modal open')}>
                    + Assign New Vehicle
                  </button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vehicle Number</th>
                      <th>Model</th>
                      <th>Assigned Rider</th>
                      <th>SoC Status</th>
                      <th>SOH Health</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleetList.map(item => (
                      <tr key={item.id}>
                        <td><strong style={{ color: '#2A195C' }}>{item.id}</strong></td>
                        <td>{item.model}</td>
                        <td>{item.rider}</td>
                        <td><strong>{item.soc}</strong></td>
                        <td><span style={{ color: '#16A34A', fontWeight: 700 }}>{item.health}</span></td>
                        <td>
                          <span className={item.status.includes('Active') ? 'badge-green' : 'badge-purple'}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="hub-btn hub-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => showToast(`Opening diagnostic telemetry for ${item.id}`)}
                          >
                            Telemetry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: Battery Docks */}
            {activeTab === 'Batteries' && (
              <div className="hub-card">
                <div className="hub-card-title">
                  <span>Battery Swap Cabinet Docks ({batteryDocks.length} Active Bays)</span>
                  <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>Cabinet Controller: Online</span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Dock Bay</th>
                      <th>Battery ID</th>
                      <th>Charge (SoC)</th>
                      <th>Pack Voltage</th>
                      <th>Temperature</th>
                      <th>Bay Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batteryDocks.map(dock => (
                      <tr key={dock.bay}>
                        <td><strong>{dock.bay}</strong></td>
                        <td style={{ color: '#2A195C', fontWeight: 700 }}>{dock.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong>{dock.soc}%</strong>
                            <div style={{ width: '50px', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${dock.soc}%`, height: '100%', background: dock.soc > 80 ? '#16A34A' : '#F59E0B' }} />
                            </div>
                          </div>
                        </td>
                        <td>{dock.volts}</td>
                        <td>{dock.temp}</td>
                        <td>
                          <span className={dock.status.includes('Ready') ? 'badge-green' : 'badge-purple'}>
                            {dock.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: Financials */}
            {activeTab === 'Financials' && (
              <div className="hub-grid-3">
                <div className="hub-card" style={{ gridColumn: 'span 2' }}>
                  <div className="hub-card-title">Commission Payout Settlement History</div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Cycle</th>
                        <th>Gross Swaps</th>
                        <th>Rental Commission</th>
                        <th>Net Payable</th>
                        <th>Settlement Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>August 2026</strong></td>
                        <td>₹1,88,400</td>
                        <td>₹64,200</td>
                        <td><strong>₹2,52,600</strong></td>
                        <td><span className="badge-green">Settled via ICICI (REF#99812)</span></td>
                      </tr>
                      <tr>
                        <td><strong>July 2026</strong></td>
                        <td>₹1,72,100</td>
                        <td>₹58,900</td>
                        <td><strong>₹2,31,000</strong></td>
                        <td><span className="badge-green">Settled via ICICI (REF#88120)</span></td>
                      </tr>
                      <tr>
                        <td><strong>June 2026</strong></td>
                        <td>₹1,64,000</td>
                        <td>₹52,000</td>
                        <td><strong>₹2,16,000</strong></td>
                        <td><span className="badge-green">Settled via ICICI (REF#77291)</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="hub-card">
                  <div className="hub-card-title">Pending Settlement</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Cycle: Sep 1 &ndash; 7, 2026</span>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>₹68,450</div>
                    <span style={{ fontSize: '12px', color: '#D97706', fontWeight: 600 }}>Scheduled for payout: Friday 10:00 AM</span>
                    <button
                      className="hub-btn hub-btn-primary"
                      style={{ marginTop: '12px' }}
                      onClick={() => showToast('Disbursement batch triggered via ICICI corporate gateway.')}
                    >
                      Release Payout Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Documents */}
            {activeTab === 'Documents' && (
              <div className="hub-card">
                <div className="hub-card-title">Franchise Legal Documents &amp; Certificates</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: 'Master Franchise Agreement 2026-2028', date: 'Executed 15 Feb 2026', type: 'Signed PDF' },
                    { name: 'Station GIDC Land NOC & Electrical Clearance', date: 'Approved 20 Jan 2026', type: 'Govt Certificate' },
                    { name: 'GSTIN & Commercial Registration Copy', date: 'Verified Active', type: 'Tax ID' },
                    { name: 'Fleet Comprehensive Insurance Policy Bond', date: 'Valid till Feb 2027', type: 'Insurance Policy' }
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{doc.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{doc.date} &bull; {doc.type}</div>
                        </div>
                      </div>
                      <button
                        className="hub-btn hub-btn-outline"
                        style={{ width: 'auto', padding: '6px 12px' }}
                        onClick={() => showToast(`Downloading ${doc.name}...`)}
                      >
                        Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="toast-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
}
