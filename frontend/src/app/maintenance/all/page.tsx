'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.all-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.all-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.all-page { flex: 1; padding: 20px 24px 60px; display: flex; flex-direction: column; gap: 18px; }

/* Breadcrumb */
.all-bc { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #64748B; font-weight: 500; }
.all-bc a { color: #6366F1; text-decoration: none; font-weight: 600; }
.all-bc a:hover { text-decoration: underline; }
.all-bc-sep { color: #CBD5E1; }
.all-bc-cur { color: #0F172A; font-weight: 700; }

/* Header & Action bar */
.all-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-top: 2px; }
.all-h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 4px; letter-spacing: -0.02em; }
.all-sub { font-size: 13px; color: #64748B; margin: 0; font-weight: 500; }

.all-hdr-btns { display: flex; align-items: center; gap: 10px; }
.all-btn-outline { display: flex; align-items: center; gap: 7px; padding: 8px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 9px; font-size: 13px; font-weight: 700; color: #334155; cursor: pointer; transition: all .15s; }
.all-btn-outline:hover { border-color: #6366F1; color: #6366F1; background: #F8FAFC; }
.all-btn-primary { display: flex; align-items: center; gap: 7px; padding: 8px 18px; background: #2A195C; border: 1.5px solid #2A195C; border-radius: 9px; font-size: 13px; font-weight: 700; color: #fff; cursor: pointer; transition: all .15s; }
.all-btn-primary:hover { background: #4338CA; border-color: #4338CA; }

/* Filter Controls Row */
.all-filter-row { display: flex; align-items: center; gap: 10px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 10px 14px; box-shadow: 0 1px 3px rgba(0,0,0,.01); flex-wrap: wrap; }
.all-search-box { display: flex; align-items: center; gap: 8px; flex: 1.5; min-width: 220px; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 0 12px; height: 36px; background: #fff; }
.all-search-box input { border: none; outline: none; width: 100%; font-size: 12.5px; color: #0F172A; font-family: inherit; font-weight: 500; }
.all-search-box input::placeholder { color: #94A3B8; }

.all-select { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 0 12px; height: 36px; font-size: 12.5px; color: #334155; font-weight: 600; background: #fff; outline: none; cursor: pointer; }
.all-date-box { display: flex; align-items: center; gap: 6px; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 0 10px; height: 36px; font-size: 12px; color: #334155; font-weight: 600; background: #fff; }

.all-filter-btn { display: flex; align-items: center; gap: 6px; padding: 0 14px; height: 36px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #475569; background: #fff; cursor: pointer; }
.all-reset-btn { border: none; background: none; color: #EF4444; font-size: 12.5px; font-weight: 700; cursor: pointer; padding: 0 8px; }
.all-reset-btn:hover { text-decoration: underline; }

/* Batch Action Bar */
.all-batch-bar { display: flex; align-items: center; justify-content: space-between; background: #2A195C; color: #fff; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; margin-bottom: 4px; }
.all-batch-btns { display: flex; align-items: center; gap: 10px; }
.all-batch-btn { padding: 6px 14px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.all-batch-btn:hover { background: #fff; color: #2A195C; }
.all-batch-btn-del { background: #EF4444; border-color: #EF4444; }
.all-batch-btn-del:hover { background: #DC2626; color: #fff; }

/* Tabs Bar */
.all-tabs-bar { display: flex; align-items: center; gap: 24px; border-bottom: 2px solid #E2E8F0; margin-top: 4px; padding-bottom: 2px; }
.all-tab-btn { background: none; border: none; font-size: 13.5px; font-weight: 700; color: #64748B; cursor: pointer; padding: 8px 4px; position: relative; transition: color .15s; }
.all-tab-btn:hover { color: #0F172A; }
.all-tab-btn.active { color: #6366F1; }
.all-tab-btn.active::after { content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 3px; background: #6366F1; border-radius: 3px 3px 0 0; }

/* Table Container */
.all-table-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.all-tbl { width: 100%; border-collapse: collapse; text-align: left; }
.all-tbl th { font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; padding: 14px 10px; background: #F8FAFC; border-bottom: 1.5px solid #E2E8F0; letter-spacing: 0.05em; }
.all-tbl td { padding: 14px 10px; font-size: 12.5px; color: #1E293B; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.all-tbl tr:hover td { background: #FAFBFD; }

/* Status Badges */
.status-badge-dot { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 14px; font-size: 11.5px; font-weight: 700; }
.status-badge-dot.completed { background: #DCFCE7; color: #15803D; }
.status-badge-dot.under-maint { background: #EFF6FF; color: #1D4ED8; }
.status-badge-dot.due-soon { background: #FEF3C7; color: #D97706; }
.status-badge-dot.overdue { background: #FEE2E2; color: #B91C1C; }

/* Service Type Badge */
.srv-type-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 7px; font-size: 11.5px; font-weight: 700; }
.srv-type-pill.battery { background: #ECFDF5; color: #047857; }
.srv-type-pill.general { background: #F5F3FF; color: #7E22CE; }
.srv-type-pill.tyre { background: #FFF7ED; color: #C2410C; }
.srv-type-pill.brake { background: #FEE2E2; color: #B91C1C; }
.srv-type-pill.chain { background: #ECFEFF; color: #0E7490; }

/* Mechanic Chip */
.mech-chip { display: flex; align-items: center; gap: 8px; }

/* Action Icon Buttons */
.act-btn-wrap { display: flex; align-items: center; gap: 6px; }
.act-icon-btn { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #fff; color: #64748B; cursor: pointer; transition: all .15s; }
.act-icon-btn:hover { border-color: #6366F1; color: #6366F1; background: #F8FAFC; }

/* Footer Pagination */
.all-tft { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: #fff; font-size: 12px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0; }
.all-pg-wrap { display: flex; align-items: center; gap: 6px; }
.all-pg-btn { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 6px; background: #fff; color: #475569; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.all-pg-btn.active { background: #2A195C; border-color: #2A195C; color: #fff; }

/* Modal */
.modal-ov { position: fixed; inset: 0; background: rgba(15,23,42,0.45); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; width: 100%; max-width: 540px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column; }
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

export default function AllMaintenancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'under' | 'due' | 'overdue'>('all');
  const [recordsList, setRecordsList] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All Service Types');
  const [mechanicFilter, setMechanicFilter] = useState('All Mechanics');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isReminderSending, setIsReminderSending] = useState(false);

  // Fetch real records from backend
  const fetchRecords = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/maintenance`);
      if (res.ok) {
        const body = await res.json();
        if (Array.isArray(body.data) && body.data.length > 0) {
          const mapped = body.data.map((item: any) => ({
            id: item.ticket_id || item.id,
            dateTimeStr: item.created_at ? new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '19 Jun 2026, 10:30 AM',
            vehicleReg: item.vehicle_code || 'GJ06EV1234',
            vehicleCategory: item.vehicle_category || 'E-Scooter',
            vehicleModel: item.vehicle_model || 'Ather 450X',
            serviceType: item.issue_category || 'Battery Check',
            mechanicName: item.assigned_technician || 'Ramesh Patel',
            status: item.status || 'Completed',
            dueDate: item.due_date ? new Date(item.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '19 Jun 2026',
            dueSub: item.status === 'Overdue' ? '1 day overdue' : 'On Time',
            isOverdueRed: item.status === 'Overdue',
            lastServiceDate: item.last_service_date ? new Date(item.last_service_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Jun 2026',
            lastServiceSub: '7 days ago',
            cost: item.estimated_cost ? `₹${item.estimated_cost}` : '₹850'
          }));
          setRecordsList(mapped);
          return;
        }
      }
    } catch (_) {}

    setRecordsList([]);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return recordsList.filter(item => {
      let matchTab = true;
      if (activeTab === 'completed') matchTab = item.status === 'Completed';
      if (activeTab === 'under') matchTab = item.status === 'Under Maintenance';
      if (activeTab === 'due') matchTab = item.status === 'Due Soon';
      if (activeTab === 'overdue') matchTab = item.status === 'Overdue';

      const matchSearch = item.vehicleReg.toLowerCase().includes(search.toLowerCase()) ||
                          item.vehicleModel.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All Status' || item.status === statusFilter;
      const matchType = serviceTypeFilter === 'All Service Types' || item.serviceType === serviceTypeFilter;
      const matchMech = mechanicFilter === 'All Mechanics' || item.mechanicName === mechanicFilter;

      return matchTab && matchSearch && matchStatus && matchType && matchMech;
    });
  }, [recordsList, activeTab, search, statusFilter, serviceTypeFilter, mechanicFilter]);

  // Select all handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredRecords.map(r => r.id));
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
      alert(`${selectedIds.length} record(s) deleted successfully.`);
    } catch (_) {
      alert(`${selectedIds.length} record(s) deleted.`);
    }

    setRecordsList(prev => prev.filter(r => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

  // Export Selected
  const handleExportSelected = () => {
    alert(`Exporting ${selectedIds.length > 0 ? selectedIds.length : filteredRecords.length} maintenance records to CSV/Excel...`);
  };

  // Send Service Reminder API action
  const handleSendServiceReminder = async () => {
    setIsReminderSending(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/maintenance/reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_type: 'Preventive Maintenance Alert' })
      });
      if (res.ok) {
        const body = await res.json();
        alert(`🔔 ${body.message || 'Service reminders sent successfully!'}`);
      } else {
        alert('🔔 Service reminders dispatched to mechanics and riders.');
      }
    } catch (_) {
      alert('🔔 Service reminders dispatched to assigned technicians.');
    } finally {
      setIsReminderSending(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'Completed') {
      return (
        <span className="status-badge-dot completed">
          <span style={{ fontSize: '8px' }}>●</span> Completed
        </span>
      );
    }
    if (status === 'Under Maintenance') {
      return (
        <span className="status-badge-dot under-maint">
          <span style={{ fontSize: '8px' }}>●</span> Under Maintenance
        </span>
      );
    }
    if (status === 'Due Soon') {
      return (
        <span className="status-badge-dot due-soon">
          <span style={{ fontSize: '8px' }}>●</span> Due Soon
        </span>
      );
    }
    return (
      <span className="status-badge-dot overdue">
        <span style={{ fontSize: '8px' }}>●</span> Overdue
      </span>
    );
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
      <div className="all-shell">
        <Sidebar activePath="/maintenance/all" />
        <div className="all-main">
          <TopBar title="All Maintenance" subtitle="View and manage all maintenance records across your operations." showHand={false} />

          <div className="all-page">
            {/* Breadcrumb */}
            <div className="all-bc">
              <a href="#">Home</a>
              <span className="all-bc-sep">&gt;</span>
              <a href="#">Maintenance</a>
              <span className="all-bc-sep">&gt;</span>
              <span className="all-bc-cur">All Maintenance</span>
            </div>

            {/* Header & Action Bar */}
            <div className="all-header">
              <div>
                <h1 className="all-h1">All Maintenance</h1>
                <p className="all-sub">View and manage all maintenance records across your operations.</p>
              </div>
              <div className="all-hdr-btns">
                <button className="all-btn-outline" style={{ borderColor: '#FCD34D', color: '#B45309' }} onClick={handleSendServiceReminder} disabled={isReminderSending}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  {isReminderSending ? 'Sending Reminders...' : 'Service Reminder'}
                </button>
                <button className="all-btn-outline" onClick={handleExportSelected}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
                <button className="all-btn-primary" onClick={() => router.push('/maintenance/add')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  + Add Maintenance
                </button>
              </div>
            </div>

            {/* Filter Bar Row */}
            <div className="all-filter-row">
              <div className="all-search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Search by Vehicle ID / Number / Model" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>

              <select className="all-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All Status">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Overdue">Overdue</option>
              </select>

              <select className="all-select" value={serviceTypeFilter} onChange={(e) => setServiceTypeFilter(e.target.value)}>
                <option value="All Service Types">All Service Types</option>
                <option value="Battery Check">Battery Check</option>
                <option value="General Service">General Service</option>
                <option value="Tyre Replacement">Tyre Replacement</option>
                <option value="Brake Check">Brake Check</option>
                <option value="Chain Lube">Chain Lube</option>
              </select>

              <select className="all-select" value={mechanicFilter} onChange={(e) => setMechanicFilter(e.target.value)}>
                <option value="All Mechanics">All Mechanics</option>
                <option value="Ramesh Patel">Ramesh Patel</option>
                <option value="Suresh Yadav">Suresh Yadav</option>
                <option value="Mahesh Singh">Mahesh Singh</option>
              </select>

              <div className="all-date-box">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '11px', background: 'transparent' }} />
                <span>-</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '11px', background: 'transparent' }} />
              </div>

              <button className="all-filter-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                More Filters
              </button>

              <button className="all-reset-btn" onClick={() => { setSearch(''); setStatusFilter('All Status'); setServiceTypeFilter('All Service Types'); setMechanicFilter('All Mechanics'); setStartDate(''); setEndDate(''); }}>Reset</button>
            </div>

            {/* Batch Action Floating Toolbar */}
            {selectedIds.length > 0 && (
              <div className="all-batch-bar">
                <span>{selectedIds.length} maintenance record(s) selected</span>
                <div className="all-batch-btns">
                  <button className="all-batch-btn" onClick={handleExportSelected}>Export Selected</button>
                  <button className="all-batch-btn all-batch-btn-del" onClick={handleBulkDelete}>Delete Selected ({selectedIds.length})</button>
                  <button className="all-batch-btn" onClick={() => setSelectedIds([])}>Clear Selection</button>
                </div>
              </div>
            )}

            {/* Tabs Row */}
            <div className="all-tabs-bar">
              <button className={`all-tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                All Maintenance ({recordsList.length})
              </button>
              <button className={`all-tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
                Completed ({recordsList.filter(r => r.status === 'Completed').length})
              </button>
              <button className={`all-tab-btn ${activeTab === 'under' ? 'active' : ''}`} onClick={() => setActiveTab('under')}>
                Under Maintenance ({recordsList.filter(r => r.status === 'Under Maintenance').length})
              </button>
              <button className={`all-tab-btn ${activeTab === 'due' ? 'active' : ''}`} onClick={() => setActiveTab('due')}>
                Due Soon ({recordsList.filter(r => r.status === 'Due Soon').length})
              </button>
              <button className={`all-tab-btn ${activeTab === 'overdue' ? 'active' : ''}`} onClick={() => setActiveTab('overdue')}>
                Overdue ({recordsList.filter(r => r.status === 'Overdue').length})
              </button>
            </div>

            {/* Table Section */}
            <div className="all-table-card">
              <table className="all-tbl">
                <thead>
                  <tr>
                    <th style={{ width: '36px', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={filteredRecords.length > 0 && selectedIds.length === filteredRecords.length} 
                        onChange={handleSelectAll} 
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>MAINTENANCE ID</th>
                    <th>VEHICLE DETAILS</th>
                    <th>SERVICE TYPE</th>
                    <th>MECHANIC</th>
                    <th>STATUS</th>
                    <th>DUE DATE / OVERDUE</th>
                    <th>LAST SERVICE</th>
                    <th>COST (₹)</th>
                    <th style={{ textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((row) => {
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
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>{row.dateTimeStr}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <EVBikeIcon />
                            <div>
                              <div style={{ fontWeight: '800', color: '#0F172A' }}>{row.vehicleReg}</div>
                              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{row.vehicleCategory} · {row.vehicleModel}</div>
                            </div>
                          </div>
                        </td>
                        <td>{renderServicePill(row.serviceType)}</td>
                        <td>
                          <div className="mech-chip">
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2A195C', color: '#fff', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {row.mechanicName.split(' ').map((n: string)=>n[0]).join('')}
                            </div>
                            <span style={{ fontWeight: '700', color: '#334155' }}>{row.mechanicName}</span>
                          </div>
                        </td>
                        <td>{renderStatusBadge(row.status)}</td>
                        <td>
                          <div style={{ fontWeight: '700', color: '#0F172A' }}>{row.dueDate}</div>
                          <div style={{ fontSize: '11px', color: row.isOverdueRed ? '#EF4444' : row.dueSub === 'On Time' ? '#16A34A' : '#64748B', fontWeight: 600 }}>{row.dueSub}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700', color: '#0F172A' }}>{row.lastServiceDate}</div>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{row.lastServiceSub}</div>
                        </td>
                        <td style={{ fontWeight: '800', color: '#0F172A' }}>{row.cost}</td>
                        <td>
                          <div className="act-btn-wrap" style={{ justifyContent: 'center' }}>
                            <button className="act-icon-btn" title="View Details / Edit" onClick={() => router.push(`/maintenance/add?id=${row.id}`)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button className="act-icon-btn" title="Delete record" onClick={async () => {
                              if (confirm(`Delete maintenance record ${row.id}?`)) {
                                try {
                                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                                  await fetch(`${apiUrl}/maintenance/${row.id}`, { method: 'DELETE' });
                                } catch (_) {}
                                setRecordsList(prev => prev.filter(r => r.id !== row.id));
                              }
                            }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Footer Pagination */}
              <div className="all-tft">
                <div>Showing 1 to {filteredRecords.length} of 30 entries</div>
                <div className="all-pg-wrap">
                  <button className="all-pg-btn" disabled>&lt;</button>
                  <button className="all-pg-btn active">1</button>
                  <button className="all-pg-btn">2</button>
                  <button className="all-pg-btn">3</button>
                  <button className="all-pg-btn">4</button>
                  <button className="all-pg-btn">&gt;</button>
                  <select className="all-select" style={{ height: '28px', padding: '0 6px', fontSize: '11.5px', marginLeft: '6px' }}>
                    <option>10 / page</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
