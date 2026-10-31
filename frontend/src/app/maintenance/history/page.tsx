'use client';
import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.his-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.his-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.his-page { flex: 1; padding: 20px 24px 60px; display: flex; flex-direction: column; gap: 18px; }

/* Breadcrumb */
.his-bc { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #64748B; font-weight: 500; }
.his-bc a { color: #6366F1; text-decoration: none; font-weight: 600; }
.his-bc a:hover { text-decoration: underline; }
.his-bc-sep { color: #CBD5E1; }
.his-bc-cur { color: #0F172A; font-weight: 700; }

/* Header & Action bar */
.his-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-top: 2px; }
.his-h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 4px; letter-spacing: -0.02em; }
.his-sub { font-size: 13px; color: #64748B; margin: 0; font-weight: 500; }

.his-hdr-btns { display: flex; align-items: center; gap: 10px; }
.his-btn-outline { display: flex; align-items: center; gap: 7px; padding: 8px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 9px; font-size: 13px; font-weight: 700; color: #334155; cursor: pointer; transition: all .15s; }
.his-btn-outline:hover { border-color: #6366F1; color: #6366F1; background: #F8FAFC; }

/* Top KPI Cards Row (4 Cards) */
.his-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.his-kpi-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.his-kpi-ic-box { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.his-kpi-val { font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1.1; }
.his-kpi-lbl { font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px; }
.his-kpi-sub { font-size: 11.5px; color: #64748B; font-weight: 600; }

/* Filter Controls Row */
.his-filter-row { display: flex; align-items: center; gap: 10px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 10px 14px; box-shadow: 0 1px 3px rgba(0,0,0,.01); flex-wrap: wrap; }
.his-search-box { display: flex; align-items: center; gap: 8px; flex: 1.5; min-width: 220px; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 0 12px; height: 36px; background: #fff; }
.his-search-box input { border: none; outline: none; width: 100%; font-size: 12.5px; color: #0F172A; font-family: inherit; font-weight: 500; }
.his-search-box input::placeholder { color: #94A3B8; }

.his-select { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 0 12px; height: 36px; font-size: 12.5px; color: #334155; font-weight: 600; background: #fff; outline: none; cursor: pointer; }
.his-date-box { display: flex; align-items: center; gap: 6px; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 0 10px; height: 36px; font-size: 12px; color: #334155; font-weight: 600; background: #fff; }
.his-reset-btn { border: none; background: none; color: #EF4444; font-size: 12.5px; font-weight: 700; cursor: pointer; padding: 0 8px; }
.his-reset-btn:hover { text-decoration: underline; }

/* Batch Bar */
.his-batch-bar { display: flex; align-items: center; justify-content: space-between; background: #2A195C; color: #fff; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; margin-bottom: 4px; }
.his-batch-btns { display: flex; align-items: center; gap: 10px; }
.his-batch-btn { padding: 6px 14px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.his-batch-btn:hover { background: #fff; color: #2A195C; }
.his-batch-btn-del { background: #EF4444; border-color: #EF4444; }
.his-batch-btn-del:hover { background: #DC2626; color: #fff; }

/* 2-Column Content Grid */
.his-content-grid { display: grid; grid-template-columns: 3.2fr 1fr; gap: 18px; align-items: start; }

/* Main Left Table Card */
.his-table-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.his-tbl { width: 100%; border-collapse: collapse; text-align: left; }
.his-tbl th { font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; padding: 14px 10px; background: #F8FAFC; border-bottom: 1.5px solid #E2E8F0; letter-spacing: 0.05em; }
.his-tbl td { padding: 14px 10px; font-size: 12.5px; color: #1E293B; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.his-tbl tr:hover td { background: #FAFBFD; }

/* Status Badge */
.status-pill-completed { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 14px; font-size: 11.5px; font-weight: 700; background: #DCFCE7; color: #15803D; }

/* Service Type Badge */
.srv-type-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 7px; font-size: 11.5px; font-weight: 700; }
.srv-type-pill.battery { background: #ECFDF5; color: #047857; }
.srv-type-pill.general { background: #F5F3FF; color: #7E22CE; }
.srv-type-pill.tyre { background: #FFF7ED; color: #C2410C; }
.srv-type-pill.brake { background: #FEE2E2; color: #B91C1C; }
.srv-type-pill.chain { background: #ECFEFF; color: #0E7490; }

/* Action Icon Buttons */
.act-btn-wrap { display: flex; align-items: center; gap: 6px; }
.act-icon-btn { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #fff; color: #64748B; cursor: pointer; transition: all .15s; }
.act-icon-btn:hover { border-color: #6366F1; color: #6366F1; background: #F8FAFC; }

/* Footer Pagination */
.his-tft { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: #fff; font-size: 12px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0; }
.his-pg-wrap { display: flex; align-items: center; gap: 6px; }
.his-pg-btn { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 6px; background: #fff; color: #475569; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.his-pg-btn.active { background: #2A195C; border-color: #2A195C; color: #fff; }

/* Right Sidebar Widgets */
.his-widget { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.01); display: flex; flex-direction: column; gap: 14px; }
.his-widget-hdr { display: flex; align-items: center; justify-content: space-between; }
.his-widget-title { font-size: 14px; font-weight: 800; color: #0F172A; margin: 0; }

/* Donut chart wrap */
.donut-chart-container { position: relative; width: 140px; height: 140px; margin: 0 auto; }
.donut-center-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
.donut-center-val { font-size: 20px; font-weight: 900; color: #0F172A; line-height: 1; }
.donut-center-sub { font-size: 9px; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-top: 2px; }

/* Service Summary breakdown */
.srv-summary-item { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #334155; font-weight: 600; }
.srv-summary-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }

/* Mechanics List */
.mech-rank-list { display: flex; flex-direction: column; gap: 12px; }
.mech-rank-item { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: #0F172A; font-weight: 700; }
.mech-rank-user { display: flex; align-items: center; gap: 10px; }

/* Need Help Card */
.help-card { background: #F5F3FF; border: 1.5px solid #E9D5FF; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 10px; }
.help-icon { width: 36px; height: 36px; border-radius: 50%; background: #EEF2FF; color: #6366F1; display: flex; align-items: center; justify-content: center; }
.help-btn { border: 1.5px solid #E2E8F0; background: #fff; color: #0F172A; font-size: 12.5px; font-weight: 700; border-radius: 8px; padding: 8px 14px; width: 100%; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.help-btn:hover { border-color: #6366F1; color: #6366F1; }

/* Invoice Modal */
.modal-ov { position: fixed; inset: 0; background: rgba(15,23,42,0.45); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; width: 100%; max-width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column; }
.modal-hdr { padding: 16px 20px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; }
.modal-body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
.modal-ftr { padding: 14px 20px; border-top: 1px solid #E2E8F0; background: #F8FAFC; display: flex; justify-content: flex-end; gap: 10px; }
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

export default function ServiceHistoryPage() {
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All Service Types');
  const [mechanicFilter, setMechanicFilter] = useState('All Mechanics');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Fetch real records from backend
  const fetchHistory = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/maintenance?status=Completed`);
      if (res.ok) {
        const body = await res.json();
        const rawList = Array.isArray(body) ? body : (body.data || []);
        if (Array.isArray(rawList)) {
          const mapped = rawList.map((item: any) => ({
            id: item.ticket_id || item.id,
            subDate: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Completed',
            vehicleReg: item.vehicle_code || item.vehicle_id || 'EV-001',
            vehicleModel: item.vehicle_model || 'Evegah Pro',
            vehicleKm: item.km_reading || '0 km',
            serviceType: item.issue_category || 'General Service',
            mechanicName: item.assigned_technician || 'Technician',
            serviceDateTime: item.scheduled_date ? new Date(item.scheduled_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Completed',
            cost: item.estimated_cost ? `₹${item.estimated_cost}` : '₹0',
            status: 'Completed'
          }));
          setHistoryList(mapped);
          return;
        }
      }
    } catch (_) {}

    setHistoryList([]);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return historyList.filter(item => {
      const matchSearch = item.vehicleReg.toLowerCase().includes(search.toLowerCase()) ||
                          item.vehicleModel.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toLowerCase().includes(search.toLowerCase());
      const matchType = serviceTypeFilter === 'All Service Types' || item.serviceType === serviceTypeFilter;
      const matchMech = mechanicFilter === 'All Mechanics' || item.mechanicName === mechanicFilter;
      return matchSearch && matchType && matchMech;
    });
  }, [historyList, search, serviceTypeFilter, mechanicFilter]);

  // Dynamic Metrics
  const completedCount = useMemo(() => {
    return historyList.filter(h => h.status === 'Completed').length;
  }, [historyList]);

  const generalCount = useMemo(() => {
    return historyList.filter(h => h.serviceType === 'General Service').length;
  }, [historyList]);

  const totalCost = useMemo(() => {
    return historyList.reduce((acc, h) => {
      const num = parseInt(String(h.cost || '').replace(/[^0-9]/g, ''), 10);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }, [historyList]);

  const avgCost = useMemo(() => {
    if (historyList.length === 0) return 0;
    return Math.round(totalCost / historyList.length);
  }, [totalCost, historyList.length]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    historyList.forEach(h => {
      counts[h.serviceType] = (counts[h.serviceType] || 0) + 1;
    });
    return counts;
  }, [historyList]);

  const topMechanics = useMemo(() => {
    const mechMap: Record<string, number> = {};
    historyList.forEach(h => {
      if (h.mechanicName) {
        mechMap[h.mechanicName] = (mechMap[h.mechanicName] || 0) + 1;
      }
    });
    return Object.entries(mechMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  }, [historyList]);

  // Select all handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredList.map(h => h.id));
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
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected history entry(s)?`)) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/maintenance/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      alert(`${selectedIds.length} record(s) deleted successfully.`);
    } catch (_) {
      alert(`${selectedIds.length} record(s) deleted.`);
    }

    setHistoryList(prev => prev.filter(h => !selectedIds.includes(h.id)));
    setSelectedIds([]);
  };

  // Export Selected
  const handleExportSelected = () => {
    alert(`Exporting ${selectedIds.length > 0 ? selectedIds.length : filteredList.length} completed service records to CSV/Excel...`);
  };

  // Chart.js Donut Config
  const chartData = useMemo(() => {
    const labels = ['Battery Check', 'General Service', 'Tyre Replacement', 'Brake Check', 'Chain Lube', 'Other Services'];
    const data = labels.map(lbl => typeCounts[lbl] || 0);
    return {
      labels,
      datasets: [
        {
          data: historyList.length > 0 ? data : [0, 0, 0, 0, 0, 0],
          backgroundColor: ['#10B981', '#3B82F6', '#F97316', '#EF4444', '#06B6D4', '#8B5CF6'],
          hoverBackgroundColor: ['#059669', '#2563EB', '#EA580C', '#DC2626', '#0891B2', '#7C3AED'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [typeCounts, historyList.length]);

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
      <div className="his-shell">
        <Sidebar activePath="/maintenance/history" />
        <div className="his-main">
          <TopBar title="Service History" subtitle="View and track all completed maintenance and services." showHand={false} />

          <div className="his-page">
            {/* Breadcrumb */}
            <div className="his-bc">
              <a href="#">Home</a>
              <span className="his-bc-sep">&gt;</span>
              <a href="#">Maintenance</a>
              <span className="his-bc-sep">&gt;</span>
              <span className="his-bc-cur">Service History</span>
            </div>

            {/* Header & Actions */}
            <div className="his-header">
              <div>
                <h1 className="his-h1">Service History</h1>
                <p className="his-sub">View and track all completed maintenance and services.</p>
              </div>
              <div className="his-hdr-btns">
                <button className="his-btn-outline" onClick={handleExportSelected}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
                <button className="his-btn-outline">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Filter
                </button>
              </div>
            </div>

            {/* Top 4 KPI Cards Row */}
            <div className="his-kpi-grid">
              <div className="his-kpi-card">
                <div className="his-kpi-ic-box" style={{ background: '#F5F3FF', color: '#6366F1' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <div className="his-kpi-lbl">Total Services</div>
                  <div className="his-kpi-val">{historyList.length}</div>
                  <div className="his-kpi-sub">Across all zones</div>
                </div>
              </div>

              <div className="his-kpi-card">
                <div className="his-kpi-ic-box" style={{ background: '#ECFDF5', color: '#10B981' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div>
                  <div className="his-kpi-lbl">Completed</div>
                  <div className="his-kpi-val">{completedCount}</div>
                  <div className="his-kpi-sub" style={{ color: '#10B981', fontWeight: 700 }}>
                    {historyList.length > 0 ? ((completedCount / historyList.length) * 100).toFixed(1) : '0'}% of total
                  </div>
                </div>
              </div>

              <div className="his-kpi-card">
                <div className="his-kpi-ic-box" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </div>
                <div>
                  <div className="his-kpi-lbl">General Service</div>
                  <div className="his-kpi-val">{generalCount}</div>
                  <div className="his-kpi-sub" style={{ color: '#3B82F6', fontWeight: 700 }}>
                    {historyList.length > 0 ? ((generalCount / historyList.length) * 100).toFixed(1) : '0'}% of total
                  </div>
                </div>
              </div>

              <div className="his-kpi-card">
                <div className="his-kpi-ic-box" style={{ background: '#FFF7ED', color: '#F97316' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <div>
                  <div className="his-kpi-lbl">Tyre / Brake / Others</div>
                  <div className="his-kpi-val">{Math.max(0, historyList.length - generalCount)}</div>
                  <div className="his-kpi-sub" style={{ color: '#F97316', fontWeight: 700 }}>
                    {historyList.length > 0 ? (((historyList.length - generalCount) / historyList.length) * 100).toFixed(1) : '0'}% of total
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar Row */}
            <div className="his-filter-row">
              <div className="his-search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Search by Vehicle ID / Number / Model" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>

              <select className="his-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All Status">All Status</option>
                <option value="Completed">Completed</option>
              </select>

              <select className="his-select" value={serviceTypeFilter} onChange={(e) => setServiceTypeFilter(e.target.value)}>
                <option value="All Service Types">All Service Types</option>
                <option value="Battery Check">Battery Check</option>
                <option value="General Service">General Service</option>
                <option value="Tyre Replacement">Tyre Replacement</option>
                <option value="Brake Check">Brake Check</option>
                <option value="Chain Lube">Chain Lube</option>
              </select>

              <select className="his-select" value={mechanicFilter} onChange={(e) => setMechanicFilter(e.target.value)}>
                <option value="All Mechanics">All Mechanics</option>
                <option value="Ramesh Patel">Ramesh Patel</option>
                <option value="Suresh Yadav">Suresh Yadav</option>
                <option value="Mahesh Singh">Mahesh Singh</option>
              </select>

              <div className="his-date-box">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '11px', background: 'transparent' }} />
                <span>-</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '11px', background: 'transparent' }} />
              </div>

              <button className="his-reset-btn" onClick={() => { setSearch(''); setStatusFilter('All Status'); setServiceTypeFilter('All Service Types'); setMechanicFilter('All Mechanics'); setStartDate(''); setEndDate(''); }}>Reset</button>
            </div>

            {/* Batch Action Floating Toolbar */}
            {selectedIds.length > 0 && (
              <div className="his-batch-bar">
                <span>{selectedIds.length} service history entry(s) selected</span>
                <div className="his-batch-btns">
                  <button className="his-batch-btn" onClick={handleExportSelected}>Export Selected</button>
                  <button className="his-batch-btn his-batch-btn-del" onClick={handleBulkDelete}>Delete Selected ({selectedIds.length})</button>
                  <button className="his-batch-btn" onClick={() => setSelectedIds([])}>Clear Selection</button>
                </div>
              </div>
            )}

            {/* 2-Column Content Grid */}
            <div className="his-content-grid">
              {/* Left Column Table */}
              <div className="his-table-card">
                <table className="his-tbl">
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
                      <th>MECHANIC</th>
                      <th>SERVICE DATE &amp; TIME</th>
                      <th>COST (₹)</th>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2A195C', color: '#fff', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {row.mechanicName.split(' ').map((n: string)=>n[0]).join('')}
                              </div>
                              <span style={{ fontWeight: '700', color: '#334155' }}>{row.mechanicName}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '700', color: '#0F172A' }}>{row.serviceDateTime}</div>
                          </td>
                          <td style={{ fontWeight: '800', color: '#0F172A' }}>{row.cost}</td>
                          <td>
                            <span className="status-pill-completed">Completed</span>
                          </td>
                          <td>
                            <div className="act-btn-wrap" style={{ justifyContent: 'center' }}>
                              <button className="act-icon-btn" title="View Details" onClick={() => setSelectedInvoice(row)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button className="act-icon-btn" title="Download Invoice" onClick={() => setSelectedInvoice(row)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Footer Pagination */}
                <div className="his-tft">
                  <div>Showing 1 to {filteredList.length} of {historyList.length} entries</div>
                  <div className="his-pg-wrap">
                    <button className="his-pg-btn" disabled>&lt;</button>
                    <button className="his-pg-btn active">1</button>
                    <button className="his-pg-btn">2</button>
                    <button className="his-pg-btn">3</button>
                    <span style={{ color: '#94A3B8', padding: '0 4px' }}>...</span>
                    <button className="his-pg-btn">&gt;</button>
                    <select className="his-select" style={{ height: '28px', padding: '0 6px', fontSize: '11.5px', marginLeft: '6px' }}>
                      <option>10 / page</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Widgets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Widget 1: Animated Service Summary Donut */}
                <div className="his-widget">
                  <div className="his-widget-hdr">
                    <h4 className="his-widget-title">Service Summary</h4>
                    <select className="his-select" style={{ height: '28px', fontSize: '11.5px', padding: '0 6px' }}>
                      <option>This Month</option>
                    </select>
                  </div>

                  <div className="donut-chart-container">
                    <Doughnut data={chartData} options={chartOptions} />
                    <div className="donut-center-label">
                      <div className="donut-center-val">{historyList.length}</div>
                      <div className="donut-center-sub">TOTAL</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.keys(typeCounts).length > 0 ? (
                      Object.entries(typeCounts).map(([typeName, count]) => (
                        <div key={typeName} className="srv-summary-item">
                          <div>
                            <span className="srv-summary-dot" style={{ background: '#3B82F6' }}></span>
                            {typeName}
                          </div>
                          <span style={{ fontWeight: 800 }}>
                            {count} ({historyList.length > 0 ? ((count / historyList.length) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="srv-summary-item">
                          <div><span className="srv-summary-dot" style={{ background: '#10B981' }}></span>Battery Check</div>
                          <span style={{ fontWeight: 800 }}>0 (0%)</span>
                        </div>
                        <div className="srv-summary-item">
                          <div><span className="srv-summary-dot" style={{ background: '#3B82F6' }}></span>General Service</div>
                          <span style={{ fontWeight: 800 }}>0 (0%)</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ borderTop: '1.5px solid #F1F5F9', paddingTop: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Total Cost</span>
                      <span style={{ fontWeight: 800, color: '#0F172A', marginLeft: 'auto' }}>₹{totalCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Avg. Cost / Service</span>
                      <span style={{ fontWeight: 800, color: '#0F172A', marginLeft: 'auto' }}>₹{avgCost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Widget 2: Top Mechanics */}
                <div className="his-widget">
                  <h4 className="his-widget-title">Top Mechanics</h4>
                  <div className="mech-rank-list">
                    {topMechanics.length > 0 ? (
                      topMechanics.map(m => (
                        <div key={m.name} className="mech-rank-item">
                          <div className="mech-rank-user">
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2A195C', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {m.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span>{m.name}</span>
                          </div>
                          <span>{m.count}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', padding: '8px 0' }}>No mechanics recorded yet</div>
                    )}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '6px' }}>
                    <a href="#" className="help-btn" style={{ textDecoration: 'none' }}>View All Mechanics &rarr;</a>
                  </div>
                </div>

                {/* Widget 3: Need Help */}
                <div className="help-card">
                  <div className="help-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>Need Help?</div>
                  <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>Facing an issue or need assistance with service history?</div>
                  <button className="help-btn" onClick={() => alert('Connecting to support desk...')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Contact Support
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Invoice Download Modal */}
      {selectedInvoice && (
        <div className="modal-ov">
          <div className="modal-box">
            <div className="modal-hdr">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Service Invoice #{selectedInvoice.id}</h3>
              <button onClick={() => setSelectedInvoice(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#FAFBFD', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Vehicle:</span>
                  <strong>{selectedInvoice.vehicleReg} ({selectedInvoice.vehicleModel})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Service Completed:</span>
                  <strong>{selectedInvoice.serviceType}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Mechanic:</span>
                  <strong>{selectedInvoice.mechanicName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Service Date &amp; Time:</span>
                  <strong>{selectedInvoice.serviceDateTime}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', paddingTop: '4px' }}>
                  <span style={{ fontWeight: 700 }}>Total Billed:</span>
                  <strong style={{ color: '#16A34A', fontSize: '16px' }}>{selectedInvoice.cost}</strong>
                </div>
              </div>
            </div>
            <div className="modal-ftr">
              <button className="his-btn-outline" onClick={() => setSelectedInvoice(null)}>Close</button>
              <button className="his-btn-outline" style={{ background: '#2A195C', color: '#fff', border: 'none' }} onClick={() => { alert(`Downloading PDF Invoice for ${selectedInvoice.id}...`); setSelectedInvoice(null); }}>Download PDF Invoice</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
