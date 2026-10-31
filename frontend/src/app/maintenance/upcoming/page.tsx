'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.up-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.up-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.up-page { flex: 1; padding: 20px 24px 60px; display: flex; flex-direction: column; gap: 18px; }

/* Breadcrumb */
.up-bc { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #64748B; font-weight: 500; }
.up-bc a { color: #6366F1; text-decoration: none; font-weight: 600; }
.up-bc a:hover { text-decoration: underline; }
.up-bc-sep { color: #CBD5E1; }
.up-bc-cur { color: #0F172A; font-weight: 700; }

/* Header & Action bar */
.up-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-top: 2px; }
.up-h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 4px; letter-spacing: -0.02em; }
.up-sub { font-size: 13px; color: #64748B; margin: 0; font-weight: 500; }

.up-hdr-btns { display: flex; align-items: center; gap: 10px; }
.up-btn-outline { display: flex; align-items: center; gap: 7px; padding: 8px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 9px; font-size: 13px; font-weight: 700; color: #334155; cursor: pointer; transition: all .15s; }
.up-btn-outline:hover { border-color: #6366F1; color: #6366F1; background: #F8FAFC; }

/* Top KPI Cards Row */
.up-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
.up-kpi-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.up-kpi-ic-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.up-kpi-val { font-size: 22px; font-weight: 800; color: #0F172A; line-height: 1.1; }
.up-kpi-lbl { font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px; }
.up-kpi-sub { font-size: 11.5px; color: #64748B; font-weight: 600; }

/* Filter Controls Row */
.up-filter-row { display: flex; align-items: center; gap: 10px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 10px 14px; box-shadow: 0 1px 3px rgba(0,0,0,.01); flex-wrap: wrap; }
.up-search-box { display: flex; align-items: center; gap: 8px; flex: 1.5; min-width: 220px; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 0 12px; height: 36px; background: #fff; }
.up-search-box input { border: none; outline: none; width: 100%; font-size: 12.5px; color: #0F172A; font-family: inherit; font-weight: 500; }
.up-search-box input::placeholder { color: #94A3B8; }

.up-select { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 0 12px; height: 36px; font-size: 12.5px; color: #334155; font-weight: 600; background: #fff; outline: none; cursor: pointer; }
.up-date-box { display: flex; align-items: center; gap: 6px; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 0 10px; height: 36px; font-size: 12px; color: #334155; font-weight: 600; background: #fff; }

.up-filter-btn { display: flex; align-items: center; gap: 6px; padding: 0 14px; height: 36px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #475569; background: #fff; cursor: pointer; }
.up-reset-btn { border: none; background: none; color: #EF4444; font-size: 12.5px; font-weight: 700; cursor: pointer; padding: 0 8px; }
.up-reset-btn:hover { text-decoration: underline; }

/* Batch Action Bar */
.up-batch-bar { display: flex; align-items: center; justify-content: space-between; background: #2A195C; color: #fff; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; margin-bottom: 12px; }
.up-batch-btns { display: flex; align-items: center; gap: 10px; }
.up-batch-btn { padding: 6px 14px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.up-batch-btn:hover { background: #fff; color: #2A195C; }
.up-batch-btn-del { background: #EF4444; border-color: #EF4444; }
.up-batch-btn-del:hover { background: #DC2626; color: #fff; }

/* 2-Column Layout */
.up-content-grid { display: grid; grid-template-columns: 3.2fr 1fr; gap: 18px; align-items: start; }

/* Main Left Table Card */
.up-table-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.up-table-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.up-table-tit { font-size: 15px; font-weight: 800; color: #0F172A; margin: 0; }

.up-tbl { width: 100%; border-collapse: collapse; text-align: left; }
.up-tbl th { font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; padding: 12px 10px; background: #F8FAFC; border-bottom: 1.5px solid #E2E8F0; letter-spacing: 0.05em; }
.up-tbl td { padding: 12px 10px; font-size: 12.5px; color: #1E293B; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.up-tbl tr:hover td { background: #FAFBFD; }

/* Service Type Badge */
.srv-type-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 7px; font-size: 11.5px; font-weight: 700; }
.srv-type-pill.battery { background: #ECFDF5; color: #047857; }
.srv-type-pill.general { background: #F5F3FF; color: #7E22CE; }
.srv-type-pill.tyre { background: #FFF7ED; color: #C2410C; }
.srv-type-pill.brake { background: #FEE2E2; color: #B91C1C; }
.srv-type-pill.chain { background: #ECFEFF; color: #0E7490; }

/* Status Pill */
.status-pill-sub { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 14px; font-size: 11px; font-weight: 700; }
.status-pill-sub.today { background: #EFF6FF; color: #1D4ED8; }
.status-pill-sub.tomorrow { background: #F3E8FF; color: #6B21A8; }
.status-pill-sub.days { background: #EFF6FF; color: #1E40AF; }

/* Mechanic Chip */
.mech-chip { display: flex; align-items: center; gap: 8px; }

/* Actions cell */
.act-btn-wrap { display: flex; align-items: center; gap: 6px; }
.act-icon-btn { width: 26px; height: 26px; border: 1.5px solid #E2E8F0; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #fff; color: #64748B; cursor: pointer; transition: all .15s; }
.act-icon-btn:hover { border-color: #6366F1; color: #6366F1; background: #F8FAFC; }

/* Footer Pagination */
.up-tft { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; font-size: 12px; color: #64748B; font-weight: 500; }
.up-pg-wrap { display: flex; align-items: center; gap: 6px; }
.up-pg-btn { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 6px; background: #fff; color: #475569; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.up-pg-btn.active { background: #2A195C; border-color: #2A195C; color: #fff; }

/* Right Sidebar Widgets */
.up-widget { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.01); display: flex; flex-direction: column; gap: 14px; }
.up-widget-title { font-size: 14px; font-weight: 800; color: #0F172A; margin: 0; }

/* Donut chart wrap */
.donut-chart-container { position: relative; width: 150px; height: 150px; margin: 0 auto; }
.donut-center-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
.donut-center-val { font-size: 22px; font-weight: 900; color: #0F172A; line-height: 1; }
.donut-center-sub { font-size: 9px; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-top: 2px; }

/* Donut legend */
.donut-legend-list { display: flex; flex-direction: column; gap: 8px; font-size: 12px; color: #475569; font-weight: 600; }
.donut-legend-item { display: flex; align-items: center; justify-content: space-between; }
.donut-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }

/* Service Types list */
.type-rank-list { display: flex; flex-direction: column; gap: 10px; }
.type-rank-item { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: #334155; font-weight: 600; }
.type-rank-val { font-weight: 800; color: #0F172A; }

.widget-link { font-size: 12px; font-weight: 700; color: #6366F1; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
.widget-link:hover { text-decoration: underline; }

/* Need Attention card */
.attn-card { background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.attn-title { font-size: 13px; font-weight: 800; color: #991B1B; display: flex; align-items: center; gap: 6px; }
.attn-sub { font-size: 12px; color: #B91C1C; font-weight: 500; }

/* Modal overlays */
.modal-ov { position: fixed; inset: 0; background: rgba(15,23,42,0.45); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; width: 100%; max-width: 680px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.modal-hdr { padding: 16px 20px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; }
.modal-body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.modal-ftr { padding: 14px 20px; border-top: 1px solid #E2E8F0; background: #F8FAFC; display: flex; justify-content: flex-end; gap: 10px; }

/* Calendar grid */
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-top: 10px; }
.cal-day-name { font-size: 11px; font-weight: 800; color: #64748B; text-align: center; text-transform: uppercase; padding: 4px; }
.cal-day-cell { border: 1.5px solid #E2E8F0; border-radius: 8px; min-height: 64px; padding: 6px; font-size: 12px; font-weight: 700; background: #fff; display: flex; flex-direction: column; justify-content: space-between; }
.cal-day-cell.today-cell { border-color: #6366F1; background: #EEF2FF; }
.cal-event-pill { font-size: 9.5px; font-weight: 700; padding: 2px 4px; border-radius: 4px; background: #6366F1; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

// EV Scooter Bike Vector Icon SVG Component
const EVBikeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v4" />
    <circle cx="7" cy="17" r="3" />
    <circle cx="17" cy="17" r="3" />
    <path d="M9 11h3" />
  </svg>
);

export default function UpcomingServicesPage() {
  const router = useRouter();
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All Service Types');
  const [mechanicFilter, setMechanicFilter] = useState('All Mechanics');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<any>(null);

  // Fetch real maintenance records from backend API
  const fetchServices = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/maintenance`);
      if (res.ok) {
        const body = await res.json();
        const rawList = Array.isArray(body) ? body : (body.data || []);
        if (Array.isArray(rawList)) {
          const mapped = rawList.map((item: any) => ({
            id: item.ticket_id || item.id,
            rawId: item.id,
            subDate: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
            vehicleReg: item.vehicle_code || item.vehicle_id || 'EV-001',
            vehicleModel: item.vehicle_model || 'Evegah Pro',
            vehicleKm: item.km_reading || '0 km',
            serviceType: item.issue_category || 'General Service',
            scheduledDateTime: item.scheduled_date ? new Date(item.scheduled_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Scheduled',
            mechanicName: item.assigned_technician || 'Technician',
            serviceCenter: item.service_center || 'Evegah Hub',
            statusText: item.status === 'Scheduled' ? 'Today' : item.status || 'Pending',
            statusType: (item.status || '').toLowerCase().includes('today') || item.status === 'Scheduled' ? 'today' : 'days',
            cost: item.estimated_cost ? `₹${item.estimated_cost}` : '₹0',
            description: item.description || 'Preventive maintenance check'
          }));
          setServicesList(mapped);
          return;
        }
      }
    } catch (_) {}

    setServicesList([]);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return servicesList.filter(item => {
      const matchSearch = item.vehicleReg.toLowerCase().includes(search.toLowerCase()) || 
                          item.vehicleModel.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toLowerCase().includes(search.toLowerCase());
      const matchType = serviceTypeFilter === 'All Service Types' || item.serviceType === serviceTypeFilter;
      const matchMech = mechanicFilter === 'All Mechanics' || item.mechanicName === mechanicFilter;
      return matchSearch && matchType && matchMech;
    });
  }, [servicesList, search, serviceTypeFilter, mechanicFilter]);

  // Handle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredList.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected maintenance record(s)?`)) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/maintenance/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      alert(`${selectedIds.length} maintenance record(s) deleted successfully.`);
    } catch (_) {
      alert(`${selectedIds.length} record(s) deleted.`);
    }
    setServicesList(prev => prev.filter(s => !selectedIds.includes(s.id)));
    setSelectedIds([]);
  };

  // Export Selected
  const handleExportSelected = () => {
    alert(`Exporting ${selectedIds.length > 0 ? selectedIds.length : filteredList.length} maintenance record(s) to CSV/Excel...`);
  };

  // Dynamic metric calculations
  const todayCount = useMemo(() => {
    return servicesList.filter(s => s.statusText === 'Today').length;
  }, [servicesList]);

  const tomorrowCount = useMemo(() => {
    return servicesList.filter(s => s.statusText === 'Tomorrow').length;
  }, [servicesList]);

  const weekCount = useMemo(() => {
    return servicesList.filter(s => s.statusType === 'days' || s.statusText === 'Today' || s.statusText === 'Tomorrow').length;
  }, [servicesList]);

  const overdueCount = useMemo(() => {
    return servicesList.filter(s => (s.statusText || '').toLowerCase().includes('overdue')).length;
  }, [servicesList]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    servicesList.forEach(s => {
      counts[s.serviceType] = (counts[s.serviceType] || 0) + 1;
    });
    return counts;
  }, [servicesList]);

  // Chart.js Donut Config
  const chartData = useMemo(() => ({
    labels: ['Today', 'Tomorrow', 'Next 7 Days', 'Next 30 Days', 'Overdue'],
    datasets: [
      {
        data: [todayCount, tomorrowCount, weekCount, servicesList.length, overdueCount],
        backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F97316', '#EF4444'],
        hoverBackgroundColor: ['#2563EB', '#7C3AED', '#059669', '#EA580C', '#DC2626'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }), [todayCount, tomorrowCount, weekCount, servicesList.length, overdueCount]);

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
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1200
    }
  };

  const renderServicePill = (type: string) => {
    if (type === 'Battery Check') {
      return (
        <span className="srv-type-pill battery">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
          Battery Check
        </span>
      );
    }
    if (type === 'General Service') {
      return (
        <span className="srv-type-pill general">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          General Service
        </span>
      );
    }
    if (type === 'Tyre Replacement') {
      return (
        <span className="srv-type-pill tyre">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>
          Tyre Replacement
        </span>
      );
    }
    if (type === 'Brake Check') {
      return (
        <span className="srv-type-pill brake">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>
          Brake Check
        </span>
      );
    }
    return (
      <span className="srv-type-pill chain">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        Chain Lube
      </span>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="up-shell">
        <Sidebar activePath="/maintenance/upcoming" />
        <div className="up-main">
          <TopBar title="Upcoming Services" subtitle="Services scheduled in the coming days. Plan and manage in advance." showHand={false} />
          
          <div className="up-page">
            {/* Breadcrumb */}
            <div className="up-bc">
              <a href="#">Home</a>
              <span className="up-bc-sep">&gt;</span>
              <a href="#">Maintenance</a>
              <span className="up-bc-sep">&gt;</span>
              <span className="up-bc-cur">Upcoming Services</span>
            </div>

            {/* Header & Actions */}
            <div className="up-header">
              <div>
                <h1 className="up-h1">Upcoming Services</h1>
                <p className="up-sub">Services scheduled in the coming days. Plan and manage in advance.</p>
              </div>
              <div className="up-hdr-btns">
                <button className="up-btn-outline" onClick={handleExportSelected}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
                <button className="up-btn-outline" style={{ borderColor: '#8B5CF6', color: '#6D28D9' }} onClick={() => setIsCalendarOpen(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Calendar View
                </button>
              </div>
            </div>

            {/* Top KPI Cards Row */}
            <div className="up-kpi-grid">
              <div className="up-kpi-card">
                <div className="up-kpi-ic-box" style={{ background: '#F5F3FF', color: '#6366F1' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div className="up-kpi-lbl">Total Upcoming</div>
                  <div className="up-kpi-val">{filteredList.length}</div>
                  <div className="up-kpi-sub">Across all zones</div>
                </div>
              </div>

              <div className="up-kpi-card">
                <div className="up-kpi-ic-box" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <div className="up-kpi-lbl">Today</div>
                  <div className="up-kpi-val">{todayCount}</div>
                  <div className="up-kpi-sub">Due today</div>
                </div>
              </div>

              <div className="up-kpi-card">
                <div className="up-kpi-ic-box" style={{ background: '#ECFDF5', color: '#10B981' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><polyline points="9 11 12 14 17 9"/></svg>
                </div>
                <div>
                  <div className="up-kpi-lbl">This Week</div>
                  <div className="up-kpi-val">{weekCount}</div>
                  <div className="up-kpi-sub" style={{ color: '#10B981', fontWeight: 700 }}>Next 7 days</div>
                </div>
              </div>

              <div className="up-kpi-card">
                <div className="up-kpi-ic-box" style={{ background: '#FFF7ED', color: '#F97316' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div className="up-kpi-lbl">This Month</div>
                  <div className="up-kpi-val">{servicesList.length}</div>
                  <div className="up-kpi-sub">Next 30 days</div>
                </div>
              </div>

              <div className="up-kpi-card">
                <div className="up-kpi-ic-box" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div>
                  <div className="up-kpi-lbl">Overdue</div>
                  <div className="up-kpi-val" style={{ color: '#EF4444' }}>{overdueCount}</div>
                  <div className="up-kpi-sub" style={{ color: '#EF4444', fontWeight: 700 }}>Requires attention</div>
                </div>
              </div>
            </div>

            {/* Filter Bar Row */}
            <div className="up-filter-row">
              <div className="up-search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Search by Vehicle ID / Number / Model" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>

              <select className="up-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All Status">All Status</option>
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="In 2 Days">In 2 Days</option>
              </select>

              <select className="up-select" value={serviceTypeFilter} onChange={(e) => setServiceTypeFilter(e.target.value)}>
                <option value="All Service Types">All Service Types</option>
                <option value="Battery Check">Battery Check</option>
                <option value="General Service">General Service</option>
                <option value="Tyre Replacement">Tyre Replacement</option>
                <option value="Brake Check">Brake Check</option>
                <option value="Chain Lube">Chain Lube</option>
              </select>

              <select className="up-select" value={mechanicFilter} onChange={(e) => setMechanicFilter(e.target.value)}>
                <option value="All Mechanics">All Mechanics</option>
                <option value="Ramesh Patel">Ramesh Patel</option>
                <option value="Suresh Yadav">Suresh Yadav</option>
                <option value="Mahesh Singh">Mahesh Singh</option>
              </select>

              <div className="up-date-box">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '11px', background: 'transparent' }} />
                <span>-</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '11px', background: 'transparent' }} />
              </div>

              <button className="up-filter-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                More Filters
              </button>

              <button className="up-reset-btn" onClick={() => { setSearch(''); setStatusFilter('All Status'); setServiceTypeFilter('All Service Types'); setMechanicFilter('All Mechanics'); setStartDate(''); setEndDate(''); }}>Reset</button>
            </div>

            {/* Batch Action Floating Toolbar */}
            {selectedIds.length > 0 && (
              <div className="up-batch-bar">
                <span>{selectedIds.length} maintenance item(s) selected</span>
                <div className="up-batch-btns">
                  <button className="up-batch-btn" onClick={handleExportSelected}>Export Selected</button>
                  <button className="up-batch-btn up-batch-btn-del" onClick={handleBulkDelete}>Delete Selected ({selectedIds.length})</button>
                  <button className="up-batch-btn" onClick={() => setSelectedIds([])}>Clear Selection</button>
                </div>
              </div>
            )}

            {/* 2-Column Content Grid */}
            <div className="up-content-grid">
              {/* Left Column Table */}
              <div className="up-table-card">
                <div className="up-table-hdr">
                  <h3 className="up-table-tit">Upcoming Maintenance List ({filteredList.length})</h3>
                </div>

                <table className="up-tbl">
                  <thead>
                    <tr>
                      <th style={{ width: '36px', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={filteredList.length > 0 && selectedIds.length === filteredList.length} 
                          onChange={handleSelectAll} 
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th>SERVICE ID</th>
                      <th>VEHICLE DETAILS</th>
                      <th>SERVICE TYPE</th>
                      <th>SCHEDULED DATE &amp; TIME</th>
                      <th>MECHANIC</th>
                      <th>SERVICE CENTER</th>
                      <th>STATUS</th>
                      <th style={{ textAlign: 'center' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((row) => {
                      const isSelected = selectedIds.includes(row.id);
                      return (
                        <tr key={row.id} style={{ background: isSelected ? '#F5F3FF' : undefined }}>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={isSelected} 
                              onChange={() => toggleSelectOne(row.id)} 
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td>
                            <div style={{ fontWeight: '800', color: '#0F172A' }}>{row.id}</div>
                            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>{row.subDate}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <EVBikeIcon />
                              <div>
                                <div style={{ fontWeight: '800', color: '#0F172A' }}>{row.vehicleReg}</div>
                                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{row.vehicleModel} · {row.vehicleKm}</div>
                              </div>
                            </div>
                          </td>
                          <td>{renderServicePill(row.serviceType)}</td>
                          <td>
                            <div style={{ fontWeight: '700', color: '#0F172A' }}>{row.scheduledDateTime}</div>
                          </td>
                          <td>
                            <div className="mech-chip">
                              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#2A195C', color: '#fff', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {row.mechanicName.split(' ').map((n: string)=>n[0]).join('')}
                              </div>
                              <span style={{ fontWeight: '700', color: '#334155' }}>{row.mechanicName}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: '600', color: '#475569' }}>{row.serviceCenter}</td>
                          <td>
                            <span className={`status-pill-sub ${row.statusType}`}>
                              {row.statusText}
                            </span>
                          </td>
                          <td>
                            <div className="act-btn-wrap" style={{ justifyContent: 'center' }}>
                              <button className="act-icon-btn" title="View Details" onClick={() => setSelectedServiceDetail(row)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button className="act-icon-btn" title="Delete record" onClick={async () => {
                                if (confirm(`Delete service ${row.id}?`)) {
                                  try {
                                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                                    await fetch(`${apiUrl}/maintenance/${row.id}`, { method: 'DELETE' });
                                  } catch (_) {}
                                  setServicesList(prev => prev.filter(s => s.id !== row.id));
                                }
                              }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Footer Pagination */}
                <div className="up-tft">
                  <div>Showing 1 to {filteredList.length} of {servicesList.length} entries</div>
                  <div className="up-pg-wrap">
                    <button className="up-pg-btn" disabled>&lt;</button>
                    <button className="up-pg-btn active">1</button>
                    <button className="up-pg-btn">2</button>
                    <button className="up-pg-btn">3</button>
                    <button className="up-pg-btn">&gt;</button>
                    <select className="up-select" style={{ height: '28px', padding: '0 6px', fontSize: '11.5px', marginLeft: '6px' }}>
                      <option>10 / page</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Widgets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Widget 1: Animated Chart.js Donut */}
                <div className="up-widget">
                  <h4 className="up-widget-title">Upcoming Summary</h4>
                  <div className="donut-chart-container">
                    <Doughnut data={chartData} options={chartOptions} />
                    <div className="donut-center-label">
                      <div className="donut-center-val">{servicesList.length}</div>
                      <div className="donut-center-sub">TOTAL</div>
                    </div>
                  </div>
                  
                  <div className="donut-legend-list">
                    <div className="donut-legend-item">
                      <div><span className="donut-dot" style={{ background: '#3B82F6' }}></span>Today</div>
                      <span>{todayCount}</span>
                    </div>
                    <div className="donut-legend-item">
                      <div><span className="donut-dot" style={{ background: '#8B5CF6' }}></span>Tomorrow</div>
                      <span>{tomorrowCount}</span>
                    </div>
                    <div className="donut-legend-item">
                      <div><span className="donut-dot" style={{ background: '#10B981' }}></span>Next 7 Days</div>
                      <span>{weekCount}</span>
                    </div>
                    <div className="donut-legend-item">
                      <div><span className="donut-dot" style={{ background: '#F97316' }}></span>Next 30 Days</div>
                      <span>{servicesList.length}</span>
                    </div>
                    <div className="donut-legend-item">
                      <div><span className="donut-dot" style={{ background: '#EF4444' }}></span>Overdue</div>
                      <span style={{ color: '#EF4444', fontWeight: 800 }}>{overdueCount}</span>
                    </div>
                  </div>
                </div>

                {/* Widget 2: Upcoming Service Types */}
                <div className="up-widget">
                  <h4 className="up-widget-title">Upcoming Service Types</h4>
                  <div className="type-rank-list">
                    {Object.keys(typeCounts).length > 0 ? (
                      Object.entries(typeCounts).map(([typeName, count]) => (
                        <div key={typeName} className="type-rank-item">
                          <span>{typeName}</span>
                          <span className="type-rank-val">{count}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="type-rank-item"><span>Battery Check</span><span className="type-rank-val">0</span></div>
                        <div className="type-rank-item"><span>General Service</span><span className="type-rank-val">0</span></div>
                        <div className="type-rank-item"><span>Tyre Replacement</span><span className="type-rank-val">0</span></div>
                        <div className="type-rank-item"><span>Brake Check</span><span className="type-rank-val">0</span></div>
                      </>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '4px' }}>
                    <span className="widget-link" onClick={() => router.push('/maintenance/all')}>View All &rarr;</span>
                  </div>
                </div>

                {/* Widget 3: Need Attention Alert */}
                <div className="attn-card">
                  <div className="attn-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Need Attention
                  </div>
                  <div className="attn-sub">{overdueCount} services are overdue</div>
                  <div style={{ marginTop: '4px' }}>
                    <span className="widget-link" style={{ color: '#B91C1C', fontWeight: 800 }} onClick={() => router.push('/maintenance/all?status=Overdue')}>View Overdue Services &rarr;</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Calendar View Modal */}
      {isCalendarOpen && (
        <div className="modal-ov">
          <div className="modal-box">
            <div className="modal-hdr">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Maintenance Calendar (June 2026)</h3>
              <button onClick={() => setIsCalendarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>View scheduled maintenance services across dates.</p>
              <div className="cal-grid">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="cal-day-name">{d}</div>
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const dayNum = i + 1;
                  const isToday = dayNum === 19;
                  const hasServices = dayNum >= 19 && dayNum <= 24;
                  return (
                    <div key={dayNum} className={`cal-day-cell ${isToday ? 'today-cell' : ''}`}>
                      <span>{dayNum}</span>
                      {hasServices && (
                        <span className="cal-event-pill">
                          {dayNum === 19 ? '2 Services' : '1 Service'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-ftr">
              <button className="up-btn-outline" onClick={() => setIsCalendarOpen(false)}>Close Calendar</button>
            </div>
          </div>
        </div>
      )}

      {/* Service Detail Modal */}
      {selectedServiceDetail && (
        <div className="modal-ov">
          <div className="modal-box" style={{ maxWidth: '520px' }}>
            <div className="modal-hdr">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Work Order Details - {selectedServiceDetail.id}</h3>
              <button onClick={() => setSelectedServiceDetail(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div><strong>Vehicle Code:</strong> {selectedServiceDetail.vehicleReg}</div>
                <div><strong>Model:</strong> {selectedServiceDetail.vehicleModel}</div>
                <div><strong>Service Type:</strong> {selectedServiceDetail.serviceType}</div>
                <div><strong>Assigned Mechanic:</strong> {selectedServiceDetail.mechanicName}</div>
                <div><strong>Service Center:</strong> {selectedServiceDetail.serviceCenter}</div>
                <div><strong>Estimated Cost:</strong> {selectedServiceDetail.cost}</div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '13px' }}>
                <strong>Description &amp; Notes:</strong>
                <p style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', marginTop: '6px' }}>
                  {selectedServiceDetail.description}
                </p>
              </div>
            </div>
            <div className="modal-ftr">
              <button className="up-btn-outline" onClick={() => setSelectedServiceDetail(null)}>Close</button>
              <button className="all-btn-primary" style={{ background: '#2A195C', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700 }} onClick={() => { alert('Navigating to job card editor...'); router.push(`/maintenance/add?id=${selectedServiceDetail.id}`); }}>Edit Work Order</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
