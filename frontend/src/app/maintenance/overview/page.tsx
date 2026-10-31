"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.mo-page { display: flex; min-height: 100vh; background: #F8F9FF; font-family: 'Inter', sans-serif; }
.mo-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.mo-body { flex: 1; padding: 20px 24px 60px; display: flex; flex-direction: column; gap: 18px; }

/* Breadcrumb */
.mo-bc { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #64748B; font-weight: 500; }
.mo-bc a { color: #6366F1; text-decoration: none; font-weight: 600; }
.mo-bc a:hover { text-decoration: underline; }
.mo-bc-sep { color: #CBD5E1; }
.mo-bc-cur { color: #0F172A; font-weight: 700; }

/* Title Row */
.mo-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-top: 2px; }
.mo-h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 4px; letter-spacing: -0.02em; }
.mo-sub { font-size: 13px; color: #64748B; margin: 0; font-weight: 500; }

.mo-actions { display: flex; align-items: center; gap: 10px; }
.mo-btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #FFF; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; transition: all .15s; }
.mo-btn:hover { border-color: #2A195C; color: #2A195C; }
.mo-btn-primary { background: #2A195C; color: #FFF; border-color: #2A195C; }
.mo-btn-primary:hover { background: #4338CA; border-color: #4338CA; }

/* KPI Cards Grid (5 Cards) */
.mo-stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
.mo-stat-card { background: #FFF; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.mo-stat-icon-box { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mo-stat-val { font-size: 22px; font-weight: 800; color: #0F172A; line-height: 1.1; }
.mo-stat-lbl { font-size: 10.5px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px; }
.mo-stat-sub { font-size: 11px; font-weight: 700; }

/* Filters Bar */
.mo-filters-bar { background: #FFF; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.mo-search-wrap { display: flex; align-items: center; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 0 12px; gap: 8px; background: #FFF; height: 36px; flex: 1; min-width: 200px; }
.mo-search-inp { border: none; outline: none; font-size: 12.5px; color: #1E293B; width: 100%; font-weight: 500; }
.mo-select { height: 36px; border: 1.5px solid #E2E8F0; border-radius: 8px; background: #FFF; font-size: 12.5px; font-weight: 600; color: #475569; padding: 0 12px; outline: none; cursor: pointer; }
.mo-reset-btn { border: none; background: none; color: #EF4444; font-size: 12.5px; font-weight: 700; cursor: pointer; padding: 0 8px; }

/* 2-Column Main Layout Grid */
.mo-layout-grid { display: grid; grid-template-columns: 1fr 340px; gap: 18px; align-items: start; }
.mo-card { background: #FFF; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.mo-card-title { font-size: 15px; font-weight: 800; color: #0F172A; margin: 0 0 16px; }

/* Table Design */
.mo-table-container { overflow-x: auto; min-height: 220px; }
.mo-table { width: 100%; border-collapse: collapse; text-align: left; }
.mo-table th { font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; padding: 12px 10px; background: #F8FAFC; border-bottom: 1.5px solid #E2E8F0; letter-spacing: 0.04em; }
.mo-table td { padding: 12px 10px; border-bottom: 1px solid #F1F5F9; font-size: 12.5px; color: #334155; font-weight: 500; vertical-align: middle; }
.mo-table tr:hover { background: #FAF9FF; }

/* Badges */
.mo-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 14px; font-size: 11px; font-weight: 700; }
.mo-badge-completed { background: #DCFCE7; color: #15803D; }
.mo-badge-under { background: #EFF6FF; color: #1D4ED8; }
.mo-badge-due { background: #FEF3C7; color: #D97706; }
.mo-badge-overdue { background: #FEE2E2; color: #B91C1C; }

/* Pagination */
.mo-pagination { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; font-size: 12px; color: #64748B; font-weight: 500; }
.mo-pag-btns { display: flex; align-items: center; gap: 4px; }
.mo-pag-btn { height: 28px; width: 28px; border-radius: 6px; border: 1.5px solid #E2E8F0; background: #FFF; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: 700; color: #475569; font-size: 11.5px; }
.mo-pag-btn.active { background: #2A195C; border-color: #2A195C; color: #FFF; }

/* Right Summary Sidebar */
.mo-chart-box { position: relative; width: 140px; height: 140px; margin: 0 auto 16px; }
.mo-chart-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
.mo-chart-label-val { font-size: 24px; font-weight: 900; color: #0F172A; line-height: 1; }
.mo-chart-label-lbl { font-size: 9px; color: #94A3B8; font-weight: 800; text-transform: uppercase; margin-top: 2px; }

.mo-legend { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 11.5px; color: #475569; font-weight: 600; }
.mo-legend-item { display: flex; align-items: center; gap: 6px; }
.mo-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.mo-cost-box { border-top: 1.5px solid #F1F5F9; padding-top: 14px; display: flex; flex-direction: column; gap: 10px; }
.mo-cost-row { display: flex; align-items: center; justify-content: space-between; }
.mo-cost-label { font-size: 12px; color: #64748B; font-weight: 500; }
.mo-cost-val { font-size: 16px; font-weight: 800; color: #0F172A; }

/* Bottom Row Grid (3 Cards) */
.mo-bottom-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
.mo-bottom-list { display: flex; flex-direction: column; gap: 10px; }
.mo-bottom-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #FFF; border: 1.5px solid #E2E8F0; border-radius: 10px; transition: border-color 0.15s; }
.mo-bottom-item:hover { border-color: #6366F1; }

.mo-cost-bar-container { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.mo-cost-bar-row { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #374151; }
.mo-cost-bar-track { height: 6px; background: #F1F5F9; border-radius: 3px; overflow: hidden; }
.mo-cost-bar-fill { height: 100%; background: #6366F1; border-radius: 3px; }

/* Service Centers & Maintenance Hubs */
.mo-sc-card { background: #FFF; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.mo-sc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-top: 14px; }
.mo-sc-item { border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 16px; background: #FAFBFD; transition: all 0.2s; display: flex; flex-direction: column; gap: 10px; }
.mo-sc-item:hover { border-color: #2A195C; background: #FFF; box-shadow: 0 4px 12px rgba(42,25,92,0.06); }
`;

// EV Bike Vector SVG Icon
const EVBikeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v4" />
    <circle cx="7" cy="17" r="3" />
    <circle cx="17" cy="17" r="3" />
    <path d="M9 11h3" />
  </svg>
);

export default function MaintenanceOverviewPage() {
  const router = useRouter();
  const [activeZone, setActiveZone] = useState("Gotri Zone");
  const [records, setRecords] = useState<any[]>([]);
  const [serviceCenters, setServiceCenters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Service Types");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchServiceCenters = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/zones?type=service`);
      if (res.ok) {
        const body = await res.json();
        if (Array.isArray(body.data) && body.data.length > 0) {
          setServiceCenters(body.data);
          return;
        }
      }
    } catch (_) {}
    setServiceCenters([
      {
        id: 'SC-01',
        name: 'Evegah Service Center & Central Hub',
        code: 'EVG-SC-01',
        type: 'Service Zone (Maintenance Hub)',
        locality: 'Central Workshop, Vadodara',
        city: 'Vadodara',
        address: 'Plot 14, GIDC Industrial Estate, Makarpura, Vadodara',
        phone: '+91 98255 44332',
        open_time: '08:00 AM',
        close_time: '09:00 PM',
        is_24_hours: false,
        status: 'active'
      }
    ]);
  };

  useEffect(() => {
    fetchServiceCenters();
  }, []);

  useEffect(() => {
    const checkZone = () => {
      const z = localStorage.getItem("evegah_active_zone") || "Gotri Zone";
      setActiveZone(z);
    };
    if (typeof window !== 'undefined') {
      checkZone();
      window.addEventListener("evegah_active_zone_changed", checkZone);
      return () => window.removeEventListener("evegah_active_zone_changed", checkZone);
    }
  }, []);

  const [stats, setStats] = useState({
    total_vehicles: 0,
    due_for_service: 0,
    under_maintenance: 0,
    overdue: 0,
    serviced_vehicles: 0
  });

  const [overviewMetrics, setOverviewMetrics] = useState<{
    upcoming_services: any[];
    top_costs: any[];
    recent_history: any[];
    total_cost: number;
    avg_cost: number;
  }>({
    upcoming_services: [],
    top_costs: [],
    recent_history: [],
    total_cost: 0,
    avg_cost: 0
  });

  const fetchStatsAndMetrics = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const [sRes, mRes] = await Promise.all([
        fetch(`${apiUrl}/maintenance/stats`).then(r => r.json()).catch(() => null),
        fetch(`${apiUrl}/maintenance/overview-metrics`).then(r => r.json()).catch(() => null)
      ]);
      if (sRes?.data) {
        setStats(sRes.data);
      }
      if (mRes?.data) {
        setOverviewMetrics(mRes.data);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchStatsAndMetrics();
  }, []);

  // Fetch data directly from Backend API (no mock auto-restore override)
  const fetchRecords = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/maintenance`);
      if (res.ok) {
        const body = await res.json();
        if (Array.isArray(body.data)) {
          const mapped = body.data.map((m: any) => ({
            id: m.ticket_id || `JC-2026-${(m.id || '').substring(0, 6)}`,
            rawId: m.id,
            vehicleId: m.vehicle_code || 'EV-12KA-1234',
            vehicleNumber: m.vehicle_code || 'GJ06EV1234',
            vehicleModel: m.vehicle_model || 'Evegah EV',
            serviceType: m.issue_category || 'General Service',
            status: m.status || 'Scheduled',
            dueDate: m.scheduled_date ? new Date(m.scheduled_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending Date',
            dueText: m.status === 'Overdue' ? 'Overdue' : 'On Time',
            lastService: m.last_service_date ? new Date(m.last_service_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            zone: m.zone || activeZone,
            cost: m.estimated_cost ? `₹${m.estimated_cost}` : '₹0'
          }));
          setRecords(mapped);
          return;
        }
      }
      setRecords([]);
    } catch (_) {
      setRecords([]);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = r.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "All Status" || r.status === statusFilter;
      const matchType = typeFilter === "All Service Types" || r.serviceType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [records, searchQuery, statusFilter, typeFilter]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;

  // Handle Record Delete
  const handleDeleteRecord = async (id: string) => {
    if (!confirm(`Are you sure you want to delete maintenance record ${id}?`)) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/maintenance/${id}`, { method: 'DELETE' });
    } catch (_) {}

    setRecords(prev => prev.filter(r => r.id !== id));
  };

  // Chart.js Donut Config
  const completedCount = stats.serviced_vehicles || records.filter(r => r.status === 'Completed').length;
  const underMaintCount = stats.under_maintenance || records.filter(r => r.status === 'Under Maintenance').length;
  const dueSoonCount = stats.due_for_service || records.filter(r => r.status === 'Due Soon').length;
  const overdueCount = stats.overdue || records.filter(r => r.status === 'Overdue').length;
  const totalChartServices = completedCount + underMaintCount + dueSoonCount + overdueCount;

  const chartData = {
    labels: ['Completed', 'Under Maintenance', 'Due Soon', 'Overdue'],
    datasets: [
      {
        data: [completedCount, underMaintCount, dueSoonCount, overdueCount],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
        hoverBackgroundColor: ['#059669', '#2563EB', '#D97706', '#DC2626'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    cutout: '72%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.raw} services`
        }
      }
    },
    animation: { animateScale: true, animateRotate: true, duration: 1000 }
  };

  const renderBadge = (status: string) => {
    if (status === 'Completed') return <span className="mo-badge mo-badge-completed">● Completed</span>;
    if (status === 'Under Maintenance') return <span className="mo-badge mo-badge-under">● Under Maint.</span>;
    if (status === 'Due Soon') return <span className="mo-badge mo-badge-due">● Due Soon</span>;
    return <span className="mo-badge mo-badge-overdue">● Overdue</span>;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="mo-page">
        <Sidebar activePath="/maintenance/overview" />
        <div className="mo-main">
          <TopBar showHand={false} />

          <div className="mo-body">
            {/* Breadcrumb */}
            <div className="mo-bc">
              <a href="#">Home</a>
              <span className="mo-bc-sep">&gt;</span>
              <a href="#">Maintenance</a>
              <span className="mo-bc-sep">&gt;</span>
              <span className="mo-bc-cur">Overview</span>
            </div>

            {/* Title Row */}
            <div className="mo-title-row">
              <div>
                <h1 className="mo-h1">Maintenance Overview</h1>
                <p className="mo-sub">Track, manage and schedule maintenance for your entire fleet.</p>
              </div>
              <div className="mo-actions">
                <button className="mo-btn" style={{ color: '#6366F1', borderColor: '#C7D2FE' }} onClick={() => alert('Sending service reminders to mechanics...')}>
                  🔔 Service Reminder
                </button>
                <button className="mo-btn" onClick={() => alert('Exporting maintenance overview report...')}>
                  📥 Export
                </button>
                <button className="mo-btn mo-btn-primary" onClick={() => router.push('/maintenance/add')}>
                  + Add Maintenance
                </button>
              </div>
            </div>

            {/* Stats Cards (5 KPI Cards) */}
            <div className="mo-stats-grid">
              <div className="mo-stat-card">
                <div className="mo-stat-icon-box" style={{ background: '#F5F3FF', color: '#6366F1' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div className="mo-stat-lbl">Total Vehicles</div>
                  <div className="mo-stat-val">{stats.total_vehicles}</div>
                  <div className="mo-stat-sub" style={{ color: '#64748B' }}>Across all zones</div>
                </div>
              </div>

              <div className="mo-stat-card">
                <div className="mo-stat-icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div className="mo-stat-lbl">Due for Service</div>
                  <div className="mo-stat-val">{stats.due_for_service}</div>
                  <div className="mo-stat-sub" style={{ color: '#D97706' }}>{stats.total_vehicles > 0 ? ((stats.due_for_service / stats.total_vehicles) * 100).toFixed(1) : '0'}% of total</div>
                </div>
              </div>

              <div className="mo-stat-card">
                <div className="mo-stat-icon-box" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </div>
                <div>
                  <div className="mo-stat-lbl">Under Maintenance</div>
                  <div className="mo-stat-val">{stats.under_maintenance}</div>
                  <div className="mo-stat-sub" style={{ color: '#3B82F6' }}>{stats.total_vehicles > 0 ? ((stats.under_maintenance / stats.total_vehicles) * 100).toFixed(1) : '0'}% of total</div>
                </div>
              </div>

              <div className="mo-stat-card">
                <div className="mo-stat-icon-box" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div>
                  <div className="mo-stat-lbl">Overdue</div>
                  <div className="mo-stat-val" style={{ color: '#EF4444' }}>{stats.overdue}</div>
                  <div className="mo-stat-sub" style={{ color: '#EF4444' }}>{stats.overdue > 0 ? 'Requires action' : 'All clear'}</div>
                </div>
              </div>

              <div className="mo-stat-card">
                <div className="mo-stat-icon-box" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div>
                  <div className="mo-stat-lbl">Serviced Vehicles</div>
                  <div className="mo-stat-val">{stats.serviced_vehicles}</div>
                  <div className="mo-stat-sub" style={{ color: '#16A34A' }}>{stats.total_vehicles > 0 ? ((stats.serviced_vehicles / stats.total_vehicles) * 100).toFixed(1) : '0'}% of total</div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="mo-filters-bar">
              <div className="mo-search-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  className="mo-search-inp" 
                  placeholder="Search by Vehicle ID / Number / Model" 
                  value={searchQuery} 
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                />
              </div>

              <select className="mo-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                <option value="All Status">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Overdue">Overdue</option>
              </select>

              <select className="mo-select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
                <option value="All Service Types">All Service Types</option>
                <option value="Battery Check">Battery Check</option>
                <option value="General Service">General Service</option>
                <option value="Tyre Replacement">Tyre Replacement</option>
                <option value="Brake Check">Brake Check</option>
              </select>

              <button className="mo-reset-btn" onClick={() => { setSearchQuery(""); setStatusFilter("All Status"); setTypeFilter("All Service Types"); setCurrentPage(1); }}>Reset Filters</button>
            </div>

            {/* 2-Column Main Layout */}
            <div className="mo-layout-grid">
              {/* Left Column: Maintenance List Table */}
              <div className="mo-card">
                <h3 className="mo-card-title">Maintenance List</h3>
                
                <div className="mo-table-container">
                  <table className="mo-table">
                    <thead>
                      <tr>
                        <th>VEHICLE ID</th>
                        <th>VEHICLE NUMBER</th>
                        <th>VEHICLE MODEL</th>
                        <th>SERVICE TYPE</th>
                        <th>STATUS</th>
                        <th>DUE DATE / OVERDUE</th>
                        <th>LAST SERVICE</th>
                        <th style={{ textAlign: 'center' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRecords.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '40px 10px', color: '#94A3B8', fontWeight: 600 }}>
                            No maintenance records found for the selected zone/filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedRecords.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <div style={{ fontWeight: '800', color: '#0F172A' }}>{row.id}</div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <EVBikeIcon />
                                <span style={{ fontWeight: '800', color: '#0F172A' }}>{row.vehicleNumber}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight: '600', color: '#475569' }}>{row.vehicleModel}</td>
                            <td style={{ fontWeight: '700', color: '#334155' }}>{row.serviceType}</td>
                            <td>{renderBadge(row.status)}</td>
                            <td>
                              <div style={{ fontWeight: '700', color: '#0F172A' }}>{row.dueDate}</div>
                              <div style={{ fontSize: '11px', color: row.status === 'Overdue' ? '#EF4444' : '#64748B', fontWeight: 600 }}>{row.dueText}</div>
                            </td>
                            <td style={{ fontWeight: '600', color: '#475569' }}>{row.lastService}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <button className="mo-btn" style={{ padding: '4px 8px', height: '28px', fontSize: '11.5px' }} onClick={() => router.push(`/maintenance/add?id=${row.id}`)}>
                                  Edit
                                </button>
                                <button className="mo-btn" style={{ padding: '4px 8px', height: '28px', fontSize: '11.5px', color: '#EF4444', borderColor: '#FCA5A5' }} onClick={() => handleDeleteRecord(row.id)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Working Pagination Bar */}
                <div className="mo-pagination">
                  <div>
                    Showing {filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} entries
                  </div>
                  <div className="mo-pag-btns">
                    <button className="mo-pag-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>&lt;</button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button 
                        key={idx + 1} 
                        className={`mo-pag-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button className="mo-pag-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>&gt;</button>
                    
                    <select className="mo-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} style={{ height: '28px', padding: '0 6px', fontSize: '11.5px', marginLeft: '8px' }}>
                      <option value={5}>5 / page</option>
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Maintenance Summary Widget */}
              <div className="mo-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 className="mo-card-title" style={{ margin: 0 }}>Maintenance Summary</h3>
                  <select className="mo-select" style={{ height: '28px', padding: '0 6px', fontSize: '11.5px' }}>
                    <option>This Month</option>
                  </select>
                </div>

                <div className="mo-chart-box">
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="mo-chart-label">
                    <div className="mo-chart-label-val">{totalChartServices}</div>
                    <div className="mo-chart-label-lbl">TOTAL SERVICES</div>
                  </div>
                </div>

                <div className="mo-legend">
                  <div className="mo-legend-item"><span className="mo-legend-dot" style={{ background: '#10B981' }}></span>Completed ({completedCount})</div>
                  <div className="mo-legend-item"><span className="mo-legend-dot" style={{ background: '#3B82F6' }}></span>Under Maint. ({underMaintCount})</div>
                  <div className="mo-legend-item"><span className="mo-legend-dot" style={{ background: '#F59E0B' }}></span>Due Soon ({dueSoonCount})</div>
                  <div className="mo-legend-item"><span className="mo-legend-dot" style={{ background: '#EF4444' }}></span>Overdue ({overdueCount})</div>
                </div>

                <div className="mo-cost-box">
                  <div className="mo-cost-row">
                    <div>
                      <div className="mo-cost-label">Total Cost (This Month)</div>
                      <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>Live Fleet Expense</div>
                    </div>
                    <div className="mo-cost-val">₹{Number(overviewMetrics.total_cost || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="mo-cost-row" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                    <div className="mo-cost-label">Avg Cost / Service</div>
                    <div className="mo-cost-val" style={{ fontSize: '14px' }}>₹{Number(overviewMetrics.avg_cost || 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row Grid (3 Live Metric Cards) */}
            <div className="mo-bottom-grid">
              {/* Card 1: Upcoming Services */}
              <div className="mo-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 className="mo-card-title" style={{ margin: 0 }}>Upcoming Services</h3>
                  <a href="/maintenance/upcoming" style={{ fontSize: '12px', fontWeight: 700, color: '#6366F1', textDecoration: 'none' }}>View All &rarr;</a>
                </div>

                <div className="mo-bottom-list">
                  {overviewMetrics.upcoming_services && overviewMetrics.upcoming_services.length > 0 ? (
                    overviewMetrics.upcoming_services.map((item: any, idx: number) => (
                      <div key={item.id || idx} className="mo-bottom-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <EVBikeIcon />
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A' }}>{item.vehicle_code || item.vehicle_number || item.id}</div>
                            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{item.issue_category || item.service_type || 'Periodic Inspection'}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`mo-badge ${item.status === 'Overdue' ? 'mo-badge-overdue' : (item.status === 'Due Soon' ? 'mo-badge-due' : 'mo-badge-under')}`}>
                            {item.status || 'Scheduled'}
                          </span>
                          <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                            {item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Upcoming'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: '12.5px' }}>
                      No upcoming services scheduled
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Top Maintenance Costs */}
              <div className="mo-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 className="mo-card-title" style={{ margin: 0 }}>Top Maintenance Costs</h3>
                  <a href="/reports" style={{ fontSize: '12px', fontWeight: 700, color: '#6366F1', textDecoration: 'none' }}>View Report &rarr;</a>
                </div>

                {overviewMetrics.top_costs && overviewMetrics.top_costs.length > 0 ? (
                  <>
                    {overviewMetrics.top_costs.map((item: any, idx: number) => {
                      const maxCost = Math.max(...overviewMetrics.top_costs.map((c: any) => Number(c.amount) || 0), 1);
                      const pct = Math.min(100, Math.round(((Number(item.amount) || 0) / maxCost) * 100));
                      return (
                        <div key={item.category || idx} className="mo-cost-bar-container">
                          <div className="mo-cost-bar-row">
                            <span>{item.category}</span>
                            <strong style={{ color: '#0F172A' }}>₹{Number(item.amount || 0).toLocaleString('en-IN')}</strong>
                          </div>
                          <div className="mo-cost-bar-track">
                            <div className="mo-cost-bar-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #F1F5F9', paddingTop: '10px', marginTop: '10px', fontWeight: 800, fontSize: '13.5px' }}>
                      <span>Total</span>
                      <span style={{ color: '#0F172A' }}>₹{Number(overviewMetrics.total_cost || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: '12.5px' }}>
                    No maintenance cost logs recorded
                  </div>
                )}
              </div>

              {/* Card 3: Recent Service History */}
              <div className="mo-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 className="mo-card-title" style={{ margin: 0 }}>Recent Service History</h3>
                  <a href="/maintenance/history" style={{ fontSize: '12px', fontWeight: 700, color: '#6366F1', textDecoration: 'none' }}>View All &rarr;</a>
                </div>

                <div className="mo-bottom-list">
                  {overviewMetrics.recent_history && overviewMetrics.recent_history.length > 0 ? (
                    overviewMetrics.recent_history.map((item: any, idx: number) => (
                      <div key={item.id || idx} className="mo-bottom-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>✓</div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A' }}>{item.vehicle_code || item.vehicle_number || item.id}</div>
                            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{item.issue_category || item.service_type || 'Service Completed'}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '800', color: '#16A34A', fontSize: '12.5px' }}>₹{Number(item.cost || item.estimated_cost || 0).toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
                            {item.completed_at ? new Date(item.completed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Recent'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: '12.5px' }}>
                      No recent service records completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Service Centers & Maintenance Hubs Section */}
            <div className="mo-sc-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 className="mo-card-title" style={{ margin: '0 0 4px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: '#EEF2FF', color: '#6366F1' }}>
                      🔧
                    </span>
                    Authorized Evegah Service Centers & Maintenance Hubs
                  </h3>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
                    Official workshop locations for EV inspections, BMS battery diagnostics, component servicing, and staging. (Hidden from Rider App)
                  </span>
                </div>
                <button
                  onClick={() => router.push('/zones/new?type=service')}
                  className="mo-btn mo-btn-primary"
                  style={{ fontSize: '12.5px', padding: '8px 14px' }}
                >
                  + Add Service Zone
                </button>
              </div>

              <div className="mo-sc-grid">
                {serviceCenters.map((sc: any, idx: number) => (
                  <div key={sc.id || idx} className="mo-sc-item">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>{sc.name || 'Evegah Service Center'}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                          Code: <span style={{ fontFamily: 'monospace', color: '#2A195C', fontWeight: 700 }}>{sc.code || 'EVG-SC-01'}</span> • {sc.city || 'Vadodara'}
                        </div>
                      </div>
                      <span className="mo-badge mo-badge-completed" style={{ fontSize: '10px', padding: '2px 8px' }}>
                        ● Active Hub
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📍</span>
                      <span>{sc.address || sc.locality || 'Makarpura Industrial Estate, Vadodara'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', borderTop: '1px dashed #E2E8F0', paddingTop: '10px', marginTop: '2px' }}>
                      <div>
                        <strong style={{ color: '#0F172A' }}>Hours:</strong> {sc.is_24_hours ? '24x7 Open' : `${sc.open_time || '08:00 AM'} - ${sc.close_time || '09:00 PM'}`}
                      </div>
                      <div>
                        <strong style={{ color: '#0F172A' }}>Contact:</strong> {sc.phone || '+91 98255 44332'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                      <button
                        onClick={() => router.push(`/zones/new?id=${sc.id}`)}
                        style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', fontWeight: 700, color: '#2A195C', cursor: 'pointer' }}
                      >
                        Manage Hub &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      
    </>
  );
}
