'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

/* ──────────────────────────────────────────────────────────────
   RIDE HISTORY PAGE  ·  Fleet Archival & History Logs
   ────────────────────────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.vh-shell{display:flex;min-height:100vh;background:#F3F4F9;font-family:Inter,sans-serif;}
.vh-main{margin-left:240px;display:flex;flex-direction:column;min-height:100vh;width:calc(100% - 240px);}
.vh-page{flex:1;padding:0 28px 60px; background-color:#FFF;}

/* breadcrumb */
.vh-bc{display:flex;align-items:center;gap:6px;padding:14px 0 0;font-size:12px;color:#9CA3AF;}
.vh-bc a{color:#9CA3AF;text-decoration:none;}
.vh-bc a:hover{color:#2A195C;}
.vh-bc-sep{color:#D1D5DB;}
.vh-bc-cur{color:#2A195C;font-weight:600;}

/* Header Title row */
.vh-title-row{display:flex;align-items:flex-start;justify-content:space-between;margin:12px 0 18px;gap:16px;}
.vh-h1{font-size:22px;font-weight:800;color:#111827;margin:0 0 4px;}
.vh-sub{font-size:13px;color:#6B7280;margin:0;}
.vh-hdr-actions{display:flex;align-items:center;gap:10px;}
.vh-hdr-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13px;font-weight:600;color:#374151;cursor:pointer;font-family:inherit;box-shadow:0 1px 3px rgba(0,0,0,.06);transition:all .15s;}
.vh-hdr-btn:hover{border-color:#2A195C;color:#2A195C;}

/* Stats cards (5 in a row) */
.vh-stats-row{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px;}
.vh-stat-card{background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 3px rgba(0,0,0,.05);}
.vh-stat-ic{width:36px;height:36px;border-radius:8px;background:#F5F3FF;color:#2A195C;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.vh-stat-info{min-width:0;flex:1;}
.vh-stat-lbl{font-size:10.5px;color:#9CA3AF;font-weight:600;margin-bottom:2px;}
.vh-stat-val{font-size:18px;font-weight:800;color:#111827;line-height:1;}
.vh-dot{width:7px;height:7px;border-radius:50%;display:inline-block;}
.vh-dot.completed{background:#10B981;}
.vh-dot.canceled{background:#EF4444;}
.vh-dot.primary{background:#2A195C;}

/* Search & filters */
.vh-filter-card{background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:16px 20px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.04);display:flex;align-items:center;justify-content:between;gap:14px;flex-wrap:wrap;}
.vh-search-input-wrap{flex:1;min-width:240px;position:relative;display:flex;align-items:center;}
.vh-search-ic{position:absolute;left:12px;color:#9CA3AF;display:flex;}
.vh-search-input{width:100%;padding:9px 12px 9px 36px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13.5px;color:#111827;outline:none;background:#F9FAFB;transition:all .15s;font-family:inherit;}
.vh-search-input:focus{border-color:#2A195C;background:#fff;box-shadow:0 0 0 3px rgba(79,70,229,0.08);}
.vh-filter-grp{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.vh-select{padding:9px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13px;color:#374151;background:#fff;font-weight:600;cursor:pointer;outline:none;transition:border-color .15s;font-family:inherit;}
.vh-select:focus{border-color:#2A195C;}
.vh-date-input{padding:7px 12px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13.5px;color:#374151;background:#fff;outline:none;font-family:inherit;}

/* Table view */
.vh-table-card{background:#fff;border:1px solid #E5E7EB;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden;}
.vh-table-wrap{width:100%;overflow-x:auto;}
.vh-table{width:100%;border-collapse:collapse;text-align:left;}
.vh-table th{background:#F9FAFB;padding:14px 18px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #E5E7EB;}
.vh-table td{padding:14px 18px;font-size:13px;color:#374151;border-bottom:1px solid #F3F4F6;vertical-align:middle;}
.vh-table tr:last-child td{border-bottom:none;}
.vh-table tr:hover td{background:#FAFAFF;}

.vh-renter-cell{display:flex;align-items:center;gap:10px;}
.vh-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#6B7280,#9CA3AF);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:700;flex-shrink:0;}
.vh-renter-name{font-weight:700;color:#111827;}
.vh-ride-id{font-size:11px;color:#6B7280;margin-top:1px;}

.vh-veh-cell{display:flex;align-items:center;gap:10px;}
.vh-veh-img-box{width:36px;height:36px;border-radius:6px;background:#F9FAFB;border:1px solid #E5E7EB;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;}
.vh-veh-img{width:100%;height:100%;object-fit:contain;}
.vh-veh-code{font-size:12.5px;font-weight:800;color:#111827;}

.vh-badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:6px;display:inline-block;}
.vh-badge.completed{background:#DCFCE7;color:#16A34A;}
.vh-badge.canceled{background:#FEE2E2;color:#EF4444;}
.vh-badge.settled{background:#E0E7FF;color:#2A195C;}

.vh-actions{display:flex;align-items:center;gap:8px;}
.vh-act-btn{width:30px;height:30px;border-radius:6px;border:1.5px solid #E5E7EB;background:#fff;color:#4B5563;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;}
.vh-act-btn:hover{color:#2A195C;border-color:#C7D2FE;background:#F5F3FF;}
.vh-act-link{font-size:12px;font-weight:700;color:#2A195C;text-decoration:none;}
.vh-act-link:hover{text-decoration:underline;}

/* Pagination */
.vh-pag-row{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-top:1px solid #E5E7EB;}
.vh-pag-lbl{font-size:12px;color:#6B7280;}
.vh-pag-ctrls{display:flex;align-items:center;gap:6px;}
.vh-pag-btn{padding:6px 12px;border:1.5px solid #E5E7EB;border-radius:8px;background:#fff;font-size:12.5px;font-weight:600;color:#374151;cursor:pointer;}
.vh-pag-btn:hover:not(:disabled){border-color:#2A195C;color:#2A195C;}
.vh-pag-btn:disabled{opacity:0.5;cursor:not-allowed;}
.vh-pag-num{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:700;cursor:pointer;}
.vh-pag-num.active{background:#2A195C;color:#fff;}
.vh-pag-num:hover:not(.active){background:#F3F4F6;}
`;

const SI = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const Sv = (p: React.SVGProps<SVGSVGElement> & { s?: number }) => (
  <svg width={p.s || 14} height={p.s || 14} viewBox="0 0 24 24" {...SI} {...p} />
);

const ISearch   = () => <Sv><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Sv>;
const ICalendar = () => <Sv><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Sv>;
const IDownload  = () => <Sv><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Sv>;
const IFileText  = () => <Sv><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></Sv>;
const ITrend    = ({ s = 14 }) => <Sv s={s}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Sv>;
const IClock    = ({ s = 14 }) => <Sv s={s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Sv>;
const IMap      = () => <Sv><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></Sv>;

interface HistoricalRideItem {
  rideId: string;
  renter: string;
  code: string;
  type: string;
  date: string;
  distance: string;
  duration: string;
  fare: string;
  payment: string;
  status: 'Completed' | 'Canceled';
  badgeCls: string;
  imgSrc: string;
}

const HISTORICAL_RIDES_MOCK: HistoricalRideItem[] = [];

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dbRenterList, setDbRenterList] = useState<any[]>([]);

  useEffect(() => {
    api.get('/renters')
      .then(res => {
        if (res && res.data) {
          const historicalOnly = res.data.filter((r: any) => r.status === 'Return' || r.status === 'Extend' || r.status === 'Completed' || r.status === 'Canceled');
          setDbRenterList(historicalOnly);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const historicalRides = useMemo(() => {
    return dbRenterList.map((r, idx) => ({
      rideId: `RID-2026-${String(r.id).substring(0, 4)}`,
      renter: r.rider_name,
      code: r.vehicle_id || 'EV-UNKNOWN',
      type: 'Electric Scooter',
      date: r.return_date ? new Date(r.return_date).toLocaleString() : new Date().toLocaleString(),
      distance: '3.5 km',
      duration: '15 mins',
      fare: `₹${r.rent}`,
      payment: 'UPI (Settled)',
      status: r.status === 'Canceled' ? 'Canceled' as const : 'Completed' as const,
      badgeCls: r.status === 'Canceled' ? 'canceled' : 'completed',
      imgSrc: '/assets/v1.webp'
    }));
  }, [dbRenterList]);

  const filtered = historicalRides.filter(r => {
    const matchesSearch = r.renter.toLowerCase().includes(search.toLowerCase()) || r.rideId.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="vh-shell">
        <Sidebar activePath="/vehicles/history" />
        <div className="vh-main">
          <TopBar />
          <div className="vh-page">

            {/* Breadcrumb */}
            <div className="vh-bc">
              <Link href="/">Home</Link>
              <span className="vh-bc-sep">›</span>
              <a href="#">Vehicles</a>
              <span className="vh-bc-sep">›</span>
              <span className="vh-bc-cur">History</span>
            </div>

            {/* Title Row */}
            <div className="vh-title-row">
              <div>
                <h1 className="vh-h1">History</h1>
                <p className="vh-sub">Analyze and browse all past rides, diagnostics events and transaction logs.</p>
              </div>
              <div className="vh-hdr-actions">
                <button className="vh-hdr-btn"><IDownload/> Export Reports</button>
              </div>
            </div>

            {/* Metric KPI cards */}
            <div className="vh-stats-row">
              {[
                { lbl: 'Total Rides', val: '4.8K', ic: <IMap/> },
                { lbl: 'Completed', val: '4.6K', dot: 'completed' },
                { lbl: 'Canceled', val: 184, dot: 'canceled' },
                { lbl: 'Avg Distance', val: '6.4 km', ic: <ITrend s={16}/> },
                { lbl: 'Avg Duration', val: '22 mins', ic: <IClock s={16}/> }
              ].map(s => (
                <div className="vh-stat-card" key={s.lbl}>
                  <div className="vh-stat-ic">
                    {s.ic ? s.ic : <div className={`vh-dot ${s.dot}`}/>}
                  </div>
                  <div className="vh-stat-info">
                    <div className="vh-stat-lbl">{s.lbl}</div>
                    <div className="vh-stat-val">{s.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search and filters */}
            <div className="vh-filter-card">
              <div className="vh-search-input-wrap">
                <span className="vh-search-ic"><ISearch/></span>
                <input 
                  type="text" 
                  className="vh-search-input" 
                  placeholder="Search by Ride ID, Renter, or Scooter Code..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="vh-filter-grp">
                <select 
                  className="vl-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed Only</option>
                  <option value="Canceled">Canceled Only</option>
                </select>

                <input type="date" className="vh-date-input" defaultValue="2024-05-01" />
                <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>to</span>
                <input type="date" className="vh-date-input" defaultValue="2024-05-20" />
              </div>
            </div>

            {/* History Table */}
            <div className="vh-table-card">
              <div className="vh-table-wrap">
                <table className="vh-table">
                  <thead>
                    <tr>
                      <th>Ride ID / Renter</th>
                      <th>Vehicle</th>
                      <th>Date & Time</th>
                      <th>Distance</th>
                      <th>Duration</th>
                      <th>Fare & Payment</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.rideId}>
                        <td>
                          <div className="vh-renter-cell">
                            <div className="vh-avatar">
                              {r.renter.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <div className="vh-renter-name">{r.renter}</div>
                              <div className="vh-ride-id">{r.rideId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="vh-veh-cell">
                            <div className="vh-veh-img-box">
                              <img src={r.imgSrc} alt={r.code} className="vh-veh-img" />
                            </div>
                            <span className="vh-veh-code">{r.code}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500, color: '#4B5563' }}>
                          {r.date}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {r.distance}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {r.duration}
                        </td>
                        <td>
                          <div>
                            <div style={{ fontWeight: 700, color: r.status === 'Canceled' ? '#9CA3AF' : '#111827' }}>{r.fare}</div>
                            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{r.payment}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`vh-badge ${r.badgeCls}`}>{r.status}</span>
                        </td>
                        <td>
                          <div className="vh-actions" style={{ justifyContent: 'flex-end' }}>
                            <button className="vh-act-btn" title="View Ride Log"><IFileText/></button>
                            <button className="vh-act-btn" title="Download Receipt"><IDownload/></button>
                            <Link href="/vehicles/map" className="vh-act-link" style={{ marginLeft: 6 }}>
                              View Path
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#9CA3AF', fontWeight: 600 }}>
                          No historical rides found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="vh-pag-row">
                <span className="vh-pag-lbl">Showing 1 to {filtered.length} of {filtered.length} historical entries</span>
                <div className="vh-pag-ctrls">
                  <button className="vh-pag-btn" disabled>Previous</button>
                  <div className="vh-pag-num active">1</div>
                  <button className="vh-pag-btn" disabled>Next</button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
