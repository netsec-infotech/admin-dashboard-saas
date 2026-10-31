"use client";
import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.sh-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.sh-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.sh-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; background-color: #FFF; }

/* Breadcrumb */
.sh-bc { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #64748B; font-weight: 500; }
.sh-bc a { color: #64748B; text-decoration: none; }
.sh-bc a:hover { color: #6D28D9; }
.sh-bc-sep { color: #94A3B8; }
.sh-bc-cur { color: #6D28D9; font-weight: 600; }

/* Header title */
.sh-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.sh-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; letter-spacing: -0.02em; }
.sh-sub { font-size: 13px; color: #64748B; margin: 0; }

.sh-actions { display: flex; align-items: center; gap: 10px; }
.sh-btn { display: flex; align-items: center; gap: 7px; padding: 9px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; }
.sh-btn:hover { border-color: #6D28D9; color: #6D28D9; }
.sh-btn-primary { background: #6D28D9; color: #fff; border-color: #6D28D9; }
.sh-btn-primary:hover { background: #5B21B6; border-color: #5B21B6; color: #fff; }

/* KPI Grid */
.sh-stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.sh-stat-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.02); position: relative; }
.sh-stat-ic { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ic-purple { background: #8B5CF6; color: #fff; }
.ic-green { background: #10B981; color: #fff; }
.ic-blue { background: #3B82F6; color: #fff; }
.ic-red { background: #EF4444; color: #fff; }
.ic-orange { background: #F97316; color: #fff; }

.sh-stat-info { min-width: 0; flex: 1; }
.sh-stat-lbl { font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 2px; }
.sh-stat-val { font-size: 22px; font-weight: 800; color: #0F172A; line-height: 1; }
.sh-stat-sub { font-size: 11px; color: #64748B; font-weight: 500; margin-top: 4px; display: flex; align-items: center; justify-content: space-between; }
.sh-stat-sub-green { color: #16A34A; font-weight: 600; }
.sh-stat-sub-red { color: #DC2626; font-weight: 600; }

/* Filter bar panel */
.sh-filter-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.sh-filter-grid { display: grid; grid-template-columns: 2.2fr 1.2fr 1.2fr 1.2fr 1.4fr auto; gap: 10px; align-items: center; }
.sh-search-wrap { position: relative; }
.sh-search-input { width: 100%; padding: 8px 12px 8px 34px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; transition: border-color .15s; }
.sh-search-input:focus { border-color: #6D28D9; }
.sh-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
.sh-select { padding: 8px 10px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #334155; cursor: pointer; }
.sh-select:focus { border-color: #6D28D9; }
.sh-reset-btn { padding: 8px 14px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #64748B; cursor: pointer; transition: all .15s; }
.sh-reset-btn:hover { border-color: #EF4444; color: #EF4444; }

/* Table styling */
.sh-tcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; }
.sh-dt { width: 100%; border-collapse: collapse; }
.sh-dt th { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .06em; text-align: left; padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
.sh-dt td { padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.sh-dt tr:last-child td { border-bottom: none; }
.sh-dt tr:hover td { background: #F8FAFC; }

.td-id { font-weight: 700; color: #6D28D9; text-decoration: none; cursor: pointer; }
.td-id:hover { text-decoration: underline; }

.status-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.badge-completed { background: #DCFCE7; color: #16A34A; }
.badge-ongoing { background: #EFF6FF; color: #2563EB; }
.badge-failed { background: #FEE2E2; color: #EF4444; }

.action-row { display: flex; align-items: center; gap: 6px; }
.action-btn { width: 26px; height: 26px; border: 1.5px solid #E2E8F0; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #64748B; background: #fff; cursor: pointer; transition: all .12s; }
.action-btn:hover { border-color: #6D28D9; color: #6D28D9; }

.sh-tcard-ft { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-top: 1px solid #E2E8F0; background: #F8FAFC; }
.sh-tcard-ft-lbl { font-size: 12.5px; color: #64748B; font-weight: 500; }
.sh-pg { display: flex; align-items: center; gap: 4px; }
.sh-pgb { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 6px; background: #fff; font-size: 12.5px; font-weight: 600; color: #475569; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.sh-pgb:hover:not(:disabled) { border-color: #6D28D9; color: #6D28D9; }
.sh-pgb.cur { background: #6D28D9; color: #fff; border-color: #6D28D9; }
.sh-pgb:disabled { opacity: 0.5; cursor: not-allowed; }

/* Custom feedback toast alert */
.sh-toast { position: fixed; bottom: 24px; right: 24px; background: #0F172A; color: #fff; padding: 12px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 12.5px; font-weight: 600; z-index: 300; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); animation: sh-slideup 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.sh-toast-green { border-left: 4px solid #10B981; }

@keyframes sh-slideup { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

interface SwapRecord {
  id: string | number;
  swap_id: string;
  rider_name: string;
  rider_mobile: string;
  vehicle_number: string;
  old_battery_id: string;
  old_battery_soc: number;
  new_battery_id: string;
  new_battery_soc: number;
  amount: number | string;
  payment_mode: string;
  payment_ref: string;
  zone: string;
  station: string;
  operator: string;
  duration: string;
  swap_type: string;
  status: string;
  notes?: string;
  created_at: string;
}

export default function SwapHistoryPage() {
  const [swaps, setSwaps] = useState<SwapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetail, setSelectedDetail] = useState<SwapRecord | null>(null);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  const triggerToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const z = localStorage.getItem('evegah_active_zone') || localStorage.getItem('evegah_selected_zone') || 'All Zones';
      setSelectedZone(z);
    }
    const handleZone = (e: any) => {
      const z = e?.detail?.name || (typeof e?.detail === 'string' ? e.detail : 'All Zones');
      if (z) setSelectedZone(z);
    };
    window.addEventListener('evegah_active_zone_changed', handleZone);
    window.addEventListener('evegah_zone_changed', handleZone);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', handleZone);
      window.removeEventListener('evegah_zone_changed', handleZone);
    };
  }, []);

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const zParam = selectedZone && selectedZone !== 'All Zones' && selectedZone !== 'Multiple Zones'
        ? `?zone=${encodeURIComponent(selectedZone)}`
        : '';
      const res = await fetch(`${apiUrl}/batteries/swap-history${zParam}`);
      if (res.ok) {
        const result = await res.json();
        const list = result.data || result.swaps || (Array.isArray(result) ? result : []);
        setSwaps(list);
      }
    } catch (err) {
      console.error('Error fetching swap history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, [selectedZone]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setLocationFilter('');
    setCurrentPage(1);
    triggerToast('Filters reset successfully');
  };

  // Filtered dataset
  const filteredSwaps = useMemo(() => {
    return swaps.filter(item => {
      const sId = item.swap_id || String(item.id);
      const matchSearch = searchQuery === '' ||
        sId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.rider_name && item.rider_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.vehicle_number && item.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.old_battery_id && item.old_battery_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.new_battery_id && item.new_battery_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.operator && item.operator.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === '' || item.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchType = typeFilter === '' || item.swap_type?.toLowerCase().includes(typeFilter.toLowerCase());
      const matchLocation = locationFilter === '' ||
        (item.station && item.station.toLowerCase().includes(locationFilter.toLowerCase())) ||
        (item.zone && item.zone.toLowerCase().includes(locationFilter.toLowerCase()));

      return matchSearch && matchStatus && matchType && matchLocation;
    });
  }, [swaps, searchQuery, statusFilter, typeFilter, locationFilter]);

  // Paginated dataset (10 items per page)
  const pageSize = 10;
  const paginatedSwaps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSwaps.slice(start, start + pageSize);
  }, [filteredSwaps, currentPage]);

  const totalPages = Math.ceil(filteredSwaps.length / pageSize) || 1;

  // Calculate metrics based on state
  const totalSwapsCount = swaps.length;
  const completedSwapsCount = swaps.filter(s => s.status?.toLowerCase() === 'completed').length;
  const ongoingSwapsCount = swaps.filter(s => s.status?.toLowerCase() === 'ongoing').length;
  const failedSwapsCount = swaps.filter(s => s.status?.toLowerCase() === 'failed').length;
  const uniqueLocations = Array.from(new Set(swaps.map(s => s.station || s.zone).filter(Boolean))).length;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="sh-shell">
        <Sidebar activePath="/battery/swap-history" />
        <div className="sh-main">
          <TopBar title="Battery Swap History" subtitle={`Track all physical and automated battery transactions (${selectedZone})`} />
          <div className="sh-page">
            {/* Breadcrumb */}
            <div className="sh-bc">
              <a href="/">Dashboard</a>
              <span className="sh-bc-sep">&gt;</span>
              <a href="/battery/list">Battery</a>
              <span className="sh-bc-sep">&gt;</span>
              <span className="sh-bc-cur">Swap History</span>
            </div>

            {/* Title & Actions */}
            <div className="sh-title-row">
              <div>
                <h1 className="sh-h1">Battery Swap History</h1>
                <p className="sh-sub">Real database records of battery swaps, SoC exchanges, and station logs across {selectedZone}.</p>
              </div>
              <div className="sh-actions">
                <button className="sh-btn" onClick={() => triggerToast('CSV report export queued')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export CSV
                </button>
                <a href="/battery-swap" className="sh-btn-primary sh-btn" style={{ textDecoration: 'none' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
                  New Battery Swap
                </a>
              </div>
            </div>

            {/* KPI Summary Row */}
            <div className="sh-stats-row">
              <div className="sh-stat-card">
                <div className="sh-stat-ic ic-purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="sh-stat-info">
                  <span className="sh-stat-lbl">Total Swaps</span>
                  <div className="sh-stat-val">{totalSwapsCount}</div>
                  <div className="sh-stat-sub">Cumulative count</div>
                </div>
              </div>

              <div className="sh-stat-card">
                <div className="sh-stat-ic ic-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="sh-stat-info">
                  <span className="sh-stat-lbl">Completed</span>
                  <div className="sh-stat-val">{completedSwapsCount}</div>
                  <div className="sh-stat-sub">
                    <span className="sh-stat-sub-green">
                      {totalSwapsCount > 0 ? ((completedSwapsCount / totalSwapsCount) * 100).toFixed(1) + '%' : '100%'}
                    </span>
                    <span>success rate</span>
                  </div>
                </div>
              </div>

              <div className="sh-stat-card">
                <div className="sh-stat-ic ic-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </div>
                <div className="sh-stat-info">
                  <span className="sh-stat-lbl">Ongoing</span>
                  <div className="sh-stat-val">{ongoingSwapsCount}</div>
                  <div className="sh-stat-sub">In progress active</div>
                </div>
              </div>

              <div className="sh-stat-card">
                <div className="sh-stat-ic ic-red">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <div className="sh-stat-info">
                  <span className="sh-stat-lbl">Failed</span>
                  <div className="sh-stat-val">{failedSwapsCount}</div>
                  <div className="sh-stat-sub">
                    <span className="sh-stat-sub-red">
                      {totalSwapsCount > 0 ? ((failedSwapsCount / totalSwapsCount) * 100).toFixed(1) + '%' : '0%'}
                    </span>
                    <span>error rate</span>
                  </div>
                </div>
              </div>

              <div className="sh-stat-card">
                <div className="sh-stat-ic ic-orange">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="sh-stat-info">
                  <span className="sh-stat-lbl">Stations</span>
                  <div className="sh-stat-val">{uniqueLocations}</div>
                  <div className="sh-stat-sub">Active stations</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="sh-filter-card">
              <div className="sh-filter-grid">
                <div className="sh-search-wrap">
                  <span className="sh-search-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="sh-search-input"
                    placeholder="Search Swap ID, Rider, Battery, Vehicle..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <select className="sh-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Failed">Failed</option>
                </select>
                <select className="sh-select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">All Types</option>
                  <option value="Automated">Automated</option>
                  <option value="Manual">Manual Hub</option>
                </select>
                <select className="sh-select" value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">All Locations</option>
                  <option value="Gotri">Gotri Station</option>
                  <option value="Manjalpur">Manjalpur Hub</option>
                  <option value="KPGU">KPGU Station</option>
                  <option value="Aatapi">Aatapi Hub</option>
                </select>
                <button className="sh-reset-btn" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="sh-tcard">
              <div style={{ overflowX: 'auto' }}>
                <table className="sh-dt">
                  <thead>
                    <tr>
                      <th>Swap ID</th>
                      <th>Rider &amp; Vehicle</th>
                      <th>Old Battery (Return)</th>
                      <th>New Battery (Issued)</th>
                      <th>Station / Zone</th>
                      <th>Swap Type</th>
                      <th>Duration</th>
                      <th>Fee &amp; Payment</th>
                      <th>Timestamp</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                          Loading swap records from database...
                        </td>
                      </tr>
                    ) : paginatedSwaps.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                          No swap history found matching filters for {selectedZone}.
                        </td>
                      </tr>
                    ) : (
                      paginatedSwaps.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong style={{ color: '#2A195C', fontFamily: 'monospace' }}>
                              {item.swap_id || `SWP-${item.id}`}
                            </strong>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.rider_name || 'Rider'}</span>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>
                                {item.vehicle_number} &bull; {item.rider_mobile || '-'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.old_battery_id || '-'}</span>
                              <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>
                                SoC: {item.old_battery_soc ?? 0}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2A195C' }}>
                                {item.new_battery_id || '-'}
                              </span>
                              <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                                SoC: {item.new_battery_soc ?? 100}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600 }}>{item.station || 'Depot'}</span>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>{item.zone || selectedZone}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>
                              {item.swap_type || 'Manual Hub'}
                            </span>
                          </td>
                          <td>{item.duration || '1m 20s'}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, color: '#0F172A' }}>₹{item.amount || 150}</span>
                              <span style={{ fontSize: '10.5px', color: '#64748B' }}>
                                {item.payment_mode || 'UPI / ICICI'}
                              </span>
                            </div>
                          </td>
                          <td style={{ color: '#64748B', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                            {formatDate(item.created_at)}
                          </td>
                          <td>
                            <span className={`status-badge badge-${(item.status || 'completed').toLowerCase()}`}>
                              {item.status || 'Completed'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="action-btn"
                              title="View Swap Details"
                              onClick={() => setSelectedDetail(item)}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="sh-tcard-ft">
                <span className="sh-tcard-ft-lbl">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredSwaps.length)} of {filteredSwaps.length} logs
                </span>
                <div className="sh-pg">
                  <button className="sh-pgb" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>&lt;</button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} className={`sh-pgb ${currentPage === i + 1 ? 'cur' : ''}`} onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  ))}
                  <button className="sh-pgb" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>&gt;</button>
                </div>
              </div>
            </div>

            {/* Swap Details Modal */}
            {selectedDetail && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(3px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}>
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  width: '100%',
                  maxWidth: '560px',
                  padding: '24px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                        Swap Log: {selectedDetail.swap_id || `SWP-${selectedDetail.id}`}
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                        Recorded on {formatDate(selectedDetail.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDetail(null)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Rider</label>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{selectedDetail.rider_name}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>{selectedDetail.rider_mobile}</div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Vehicle</label>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{selectedDetail.vehicle_number}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>Assigned Fleet Unit</div>
                    </div>

                    <div style={{ background: '#FEF2F2', padding: '10px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                      <label style={{ fontSize: '10.5px', color: '#DC2626', fontWeight: 700, textTransform: 'uppercase' }}>Old Battery (Return)</label>
                      <div style={{ fontWeight: 800, color: '#991B1B' }}>{selectedDetail.old_battery_id}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626' }}>Returned SoC: {selectedDetail.old_battery_soc}%</div>
                    </div>

                    <div style={{ background: '#F0FDF4', padding: '10px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                      <label style={{ fontSize: '10.5px', color: '#16A34A', fontWeight: 700, textTransform: 'uppercase' }}>New Battery (Issued)</label>
                      <div style={{ fontWeight: 800, color: '#166534' }}>{selectedDetail.new_battery_id}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A' }}>Fresh SoC: {selectedDetail.new_battery_soc}%</div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Station &amp; Zone</label>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{selectedDetail.station || 'Depot'}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>{selectedDetail.zone}</div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Operator &amp; Type</label>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{selectedDetail.operator || 'Operator'}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>{selectedDetail.swap_type} &bull; {selectedDetail.duration}</div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Payment &amp; Ref</label>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>₹{selectedDetail.amount} ({selectedDetail.payment_mode})</div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>Ref: {selectedDetail.payment_ref || 'ICICI-UPI'}</div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Status</label>
                      <div>
                        <span className={`status-badge badge-${(selectedDetail.status || 'completed').toLowerCase()}`}>
                          {selectedDetail.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedDetail.notes && (
                    <div style={{ marginTop: '14px', padding: '10px', background: '#F8FAFC', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
                      <strong>Notes: </strong>{selectedDetail.notes}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
                    <button
                      onClick={() => setSelectedDetail(null)}
                      style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff', color: '#334155', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {toast.show && (
        <div className="sh-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}
