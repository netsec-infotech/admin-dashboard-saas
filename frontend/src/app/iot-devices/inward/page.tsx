"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.io-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.io-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.io-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; background-color: #FFF; }

/* Breadcrumb */
.io-bc { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #64748B; font-weight: 500; }
.io-bc a { color: #64748B; text-decoration: none; }
.io-bc a:hover { color: #6D28D9; }
.io-bc-sep { color: #94A3B8; }
.io-bc-cur { color: #1E293B; font-weight: 600; }

/* Header title */
.io-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.io-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; letter-spacing: -0.02em; }
.io-sub { font-size: 13px; color: #64748B; margin: 0; }

.io-actions { display: flex; align-items: center; gap: 10px; }
.io-btn { display: flex; align-items: center; gap: 7px; padding: 9px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; }
.io-btn:hover { border-color: #6D28D9; color: #6D28D9; }
.io-btn-primary { background: #6D28D9; color: #fff; border-color: #6D28D9; }
.io-btn-primary:hover { background: #5B21B6; border-color: #5B21B6; color: #fff; }

/* KPI Grid */
.io-stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.io-stat-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.io-stat-ic { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
.ic-purple { background: #8B5CF6; color: #fff; }
.ic-green { background: #10B981; color: #fff; }
.ic-blue { background: #3B82F6; color: #fff; }
.ic-yellow { background: #F59E0B; color: #fff; }
.ic-red { background: #EF4444; color: #fff; }

.io-stat-info { min-width: 0; flex: 1; }
.io-stat-lbl { font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 2px; }
.io-stat-val { font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1; }
.io-stat-sub { font-size: 11px; color: #64748B; font-weight: 500; margin-top: 4px; }

/* Filter bar panel */
.io-filter-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.io-filter-grid { display: grid; grid-template-columns: 1.8fr 1fr 1fr 1fr 1.5fr auto; gap: 10px; align-items: center; }
.io-search-wrap { position: relative; }
.io-search-input { width: 100%; padding: 8px 12px 8px 34px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; transition: border-color .15s; }
.io-search-input:focus { border-color: #6D28D9; }
.io-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
.io-select { padding: 8px 10px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #334155; cursor: pointer; }
.io-select:focus { border-color: #6D28D9; }
.io-reset-btn { padding: 8px 14px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #64748B; cursor: pointer; transition: all .15s; display: flex; align-items: center; gap: 6px; }
.io-reset-btn:hover { border-color: #6D28D9; color: #6D28D9; }

/* Table styling */
.io-tcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; }
.io-dt { width: 100%; border-collapse: collapse; }
.io-dt th { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .06em; text-align: left; padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
.io-dt td { padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.io-dt tr:last-child td { border-bottom: none; }
.io-dt tr:hover td { background: #F8FAFC; }

.td-id { font-weight: 700; color: #6D28D9; text-decoration: none; cursor: pointer; display: block; }
.td-id:hover { text-decoration: underline; }
.td-sub { font-size: 10.5px; color: #64748B; font-weight: 500; margin-top: 1px; }

/* Badges */
.status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; }
.status-completed { color: #16A34A; }
.status-inprogress { color: #2563EB; }
.status-cancelled { color: #475569; }
.dot-completed { width: 6px; height: 6px; border-radius: 50%; background: #16A34A; }
.dot-inprogress { width: 6px; height: 6px; border-radius: 50%; background: #2563EB; }
.dot-cancelled { width: 6px; height: 6px; border-radius: 50%; background: #475569; }

.qc-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.qc-accepted { background: #DCFCE7; color: #16A34A; }
.qc-rejected { background: #FEE2E2; color: #EF4444; }
.qc-pending { background: #FEF3C7; color: #D97706; }
.dot-qcac { width: 6px; height: 6px; border-radius: 50%; background: #16A34A; }
.dot-qcre { width: 6px; height: 6px; border-radius: 50%; background: #EF4444; }
.dot-qcpe { width: 6px; height: 6px; border-radius: 50%; background: #D97706; }

.action-row { display: flex; align-items: center; gap: 6px; }
.action-btn { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #64748B; background: #fff; cursor: pointer; transition: all .12s; }
.action-btn:hover { border-color: #6D28D9; color: #6D28D9; }

.io-tcard-ft { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-top: 1px solid #E2E8F0; background: #F8FAFC; }
.io-tcard-ft-lbl { font-size: 12.5px; color: #64748B; font-weight: 500; }
.io-pg { display: flex; align-items: center; gap: 4px; }
.io-pgb { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 6px; background: #fff; font-size: 12.5px; font-weight: 600; color: #475569; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.io-pgb:hover:not(:disabled) { border-color: #6D28D9; color: #6D28D9; }
.io-pgb.cur { background: #6D28D9; color: #fff; border-color: #6D28D9; }
.io-pgb:disabled { opacity: 0.5; cursor: not-allowed; }

/* Custom feedback toast alert */
.io-toast { position: fixed; bottom: 24px; right: 24px; background: #0F172A; color: #fff; padding: 12px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 12.5px; font-weight: 600; z-index: 300; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); animation: io-slideup 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.io-toast-green { border-left: 4px solid #10B981; }

@keyframes io-slideup { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

interface InwardRecord {
  inwardNo: string;
  inwardDate: string;
  invoiceNo: string;
  supplier: string;
  deviceType: string;
  deviceIcon: string;
  deviceModel: string;
  quantity: number;
  receivedOn: string;
  status: 'Completed' | 'In Progress' | 'Cancelled';
  qcStatus: 'Accepted' | 'Rejected' | 'Pending' | '-';
}

const INITIAL_RECORDS: InwardRecord[] = [
  { inwardNo: 'INW-248', inwardDate: '19 May 2024, 11:45 AM', invoiceNo: 'INV-2024-0587', supplier: 'GlideX IoT Pvt. Ltd.', deviceType: 'GPS Tracker', deviceIcon: '📡', deviceModel: 'GLX-GT06', quantity: 25, receivedOn: '19 May 2024 11:45 AM', status: 'Completed', qcStatus: 'Accepted' },
  { inwardNo: 'INW-247', inwardDate: '18 May 2024, 04:20 PM', invoiceNo: 'INV-2024-0586', supplier: 'Tracko Devices', deviceType: '4G Telematics', deviceIcon: '📱', deviceModel: 'TRK-4G-01', quantity: 20, receivedOn: '18 May 2024 04:20 PM', status: 'Completed', qcStatus: 'Accepted' },
  { inwardNo: 'INW-246', inwardDate: '17 May 2024, 09:10 AM', invoiceNo: 'INV-2024-0585', supplier: 'IoTech Solutions', deviceType: 'Fuel Sensor', deviceIcon: '⛽', deviceModel: 'FLS-100', quantity: 15, receivedOn: '17 May 2024 09:10 AM', status: 'Completed', qcStatus: 'Accepted' },
  { inwardNo: 'INW-245', inwardDate: '16 May 2024, 01:30 PM', invoiceNo: 'INV-2024-0584', supplier: 'GlideX IoT Pvt. Ltd.', deviceType: 'GPS Tracker', deviceIcon: '📡', deviceModel: 'GLX-GT06', quantity: 30, receivedOn: '16 May 2024 01:30 PM', status: 'Completed', qcStatus: 'Rejected' },
  { inwardNo: 'INW-244', inwardDate: '15 May 2024, 10:05 AM', invoiceNo: 'INV-2024-0583', supplier: 'Tracko Devices', deviceType: 'OBD Device', deviceIcon: '🔌', deviceModel: 'TRK-OBD-02', quantity: 10, receivedOn: '15 May 2024 10:05 AM', status: 'In Progress', qcStatus: 'Pending' },
  { inwardNo: 'INW-243', inwardDate: '14 May 2024, 05:15 PM', invoiceNo: 'INV-2024-0582', supplier: 'IoTech Solutions', deviceType: 'Temperature Sensor', deviceIcon: '🌡️', deviceModel: 'TMP-01', quantity: 12, receivedOn: '14 May 2024 05:15 PM', status: 'Completed', qcStatus: 'Accepted' },
  { inwardNo: 'INW-242', inwardDate: '13 May 2024, 12:00 PM', invoiceNo: 'INV-2024-0581', supplier: 'SmartSense IoT', deviceType: 'Door Sensor', deviceIcon: '🚪', deviceModel: 'DRS-01', quantity: 18, receivedOn: '13 May 2024 12:00 PM', status: 'Completed', qcStatus: 'Accepted' },
  { inwardNo: 'INW-241', inwardDate: '12 May 2024, 09:35 AM', invoiceNo: 'INV-2024-0580', supplier: 'GlideX IoT Pvt. Ltd.', deviceType: '4G Telematics', deviceIcon: '📡', deviceModel: 'GLX-4G-02', quantity: 8, receivedOn: '12 May 2024 09:35 AM', status: 'Cancelled', qcStatus: '-' }
];

export default function IoTInwardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<InwardRecord[]>(INITIAL_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  useEffect(() => {
    async function loadInwardRecords() {
      try {
        const res = await fetch('http://localhost:5000/api/iot/inward');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: InwardRecord[] = json.data.map((b: any) => ({
              inwardNo: b.inward_no || 'INW-NEW',
              inwardDate: b.inward_date ? new Date(b.inward_date).toLocaleString() : 'Recent',
              invoiceNo: b.invoice_no || '-',
              supplier: b.supplier || 'Vendor',
              deviceType: b.device_type || 'GPS Tracker',
              deviceIcon: b.device_type?.toLowerCase().includes('obd') ? '🔌' : '📡',
              deviceModel: b.device_model || 'Standard',
              quantity: b.quantity || 1,
              receivedOn: b.received_on ? new Date(b.received_on).toLocaleString() : 'Recent',
              status: (b.status === 'Completed' || b.status === 'In Progress' || b.status === 'Cancelled') ? b.status : 'Completed',
              qcStatus: (b.qc_status === 'Accepted' || b.qc_status === 'Rejected' || b.qc_status === 'Pending') ? b.qc_status : 'Accepted'
            }));
            setRecords(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch live inward records, using fallback baseline:', err);
      }
    }
    loadInwardRecords();
  }, []);

  const triggerToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setSupplierFilter('');
    setCurrentPage(1);
    triggerToast('Filters reset successfully');
  };

  // Filter calculations
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      const matchQuery = searchQuery === '' ||
        item.inwardNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === '' || item.status === statusFilter;
      const matchType = typeFilter === '' || item.deviceType === typeFilter;
      const matchSupplier = supplierFilter === '' || item.supplier === supplierFilter;
      return matchQuery && matchStatus && matchType && matchSupplier;
    });
  }, [records, searchQuery, statusFilter, typeFilter, supplierFilter]);

  // Paginated records (5 per page for consistency)
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * 5;
    return filteredRecords.slice(start, start + 5);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / 5) || 1;

  // KPI aggregates
  const totalReceived = 248;
  const thisMonthCount = 42;
  const pendingQC = records.filter(r => r.qcStatus === 'Pending').length + 6;
  const acceptedQC = 236;
  const rejectedQC = 4;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="io-shell">
        <Sidebar activePath="/iot-devices/inward" />
        <div className="io-main">
          <TopBar />
          <div className="io-page">
            {/* Breadcrumbs */}
            <div className="io-bc">
              <a href="/">Dashboard</a>
              <span className="io-bc-sep">&gt;</span>
              <span className="io-bc-sep">IoT Devices</span>
              <span className="io-bc-sep">&gt;</span>
              <span className="io-bc-cur">Inward</span>
            </div>

            {/* Title & Action Buttons */}
            <div className="io-title-row">
              <div>
                <h1 className="io-h1">IoT Inward</h1>
                <p className="io-sub">Track and manage all IoT devices received in your zone.</p>
              </div>
              <div className="io-actions">
                <button className="io-btn" onClick={() => triggerToast('Inward report exported successfully')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
                <button className="io-btn-primary io-btn" onClick={() => router.push('/iot-devices/inward/add')}>
                  + Add Inward
                </button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="io-stats-row">
              <div className="io-stat-card">
                <div className="io-stat-ic ic-purple">📦</div>
                <div className="io-stat-info">
                  <span className="io-stat-lbl">Total Received</span>
                  <div className="io-stat-val">{totalReceived}</div>
                  <div className="io-stat-sub">All time devices received</div>
                </div>
              </div>
              <div className="io-stat-card">
                <div className="io-stat-ic ic-green">📥</div>
                <div className="io-stat-info">
                  <span className="io-stat-lbl">This Month</span>
                  <div className="io-stat-val">{thisMonthCount}</div>
                  <div className="io-stat-sub">Devices received this month</div>
                </div>
              </div>
              <div className="io-stat-card">
                <div className="io-stat-ic ic-blue">🔍</div>
                <div className="io-stat-info">
                  <span className="io-stat-lbl">Pending QC</span>
                  <div className="io-stat-val">{pendingQC}</div>
                  <div className="io-stat-sub">Awaiting quality check</div>
                </div>
              </div>
              <div className="io-stat-card">
                <div className="io-stat-ic ic-yellow">✓</div>
                <div className="io-stat-info">
                  <span className="io-stat-lbl">Accepted</span>
                  <div className="io-stat-val">{acceptedQC}</div>
                  <div className="io-stat-sub">Devices accepted</div>
                </div>
              </div>
              <div className="io-stat-card">
                <div className="io-stat-ic ic-red">✕</div>
                <div className="io-stat-info">
                  <span className="io-stat-lbl">Rejected</span>
                  <div className="io-stat-val">{rejectedQC}</div>
                  <div className="io-stat-sub">Devices rejected</div>
                </div>
              </div>
            </div>

            {/* Filter controls bar */}
            <div className="io-filter-card">
              <div className="io-filter-grid">
                <div className="io-search-wrap">
                  <span className="io-search-icon">🔍</span>
                  <input
                    type="text"
                    className="io-search-input"
                    placeholder="Search by Invoice No., Device ID, Series No..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <select className="io-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <select className="io-select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">All Types</option>
                  <option value="GPS Tracker">GPS Tracker</option>
                  <option value="4G Telematics">4G Telematics</option>
                  <option value="Fuel Sensor">Fuel Sensor</option>
                  <option value="OBD Device">OBD Device</option>
                  <option value="Temperature Sensor">Temperature Sensor</option>
                  <option value="Door Sensor">Door Sensor</option>
                </select>
                <select className="io-select" value={supplierFilter} onChange={(e) => { setSupplierFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">All Suppliers</option>
                  <option value="GlideX IoT Pvt. Ltd.">GlideX IoT Pvt. Ltd.</option>
                  <option value="Tracko Devices">Tracko Devices</option>
                  <option value="IoTech Solutions">IoTech Solutions</option>
                  <option value="SmartSense IoT">SmartSense IoT</option>
                </select>
                <div style={{ color: '#64748B', fontSize: '12.5px', fontWeight: 600, paddingLeft: '8px' }}>
                  📅 12 May 2024 - 19 May 2024
                </div>
                <button className="io-reset-btn" onClick={resetFilters}>
                  Filters ✕
                </button>
              </div>
            </div>

            {/* Inward Ledger Table */}
            <div className="io-tcard">
              <table className="io-dt">
                <thead>
                  <tr>
                    <th>Inward No.</th>
                    <th>Invoice No.</th>
                    <th>Supplier</th>
                    <th>Device Type & Model</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th>Received On</th>
                    <th>Status</th>
                    <th>QC Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '28px', color: '#64748B' }}>
                        No IoT inward records matching filters found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((item) => (
                      <tr key={item.inwardNo}>
                        <td>
                          <span className="td-id" onClick={() => alert(`Inward details:\nNo: ${item.inwardNo}\nInvoice: ${item.invoiceNo}`)}>
                            {item.inwardNo}
                          </span>
                          <span className="td-sub">{item.inwardDate.split(',')[0]}</span>
                        </td>
                        <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{item.invoiceNo}</td>
                        <td style={{ fontWeight: 600 }}>{item.supplier}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>{item.deviceIcon}</span>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.deviceType}</div>
                              <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>{item.deviceModel}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ color: '#475569', fontSize: '12.5px' }}>{item.receivedOn}</td>
                        <td>
                          <div className={`status-badge ${item.status === 'Completed' ? 'status-completed' : item.status === 'In Progress' ? 'status-inprogress' : 'status-cancelled'}`}>
                            <span className={item.status === 'Completed' ? 'dot-completed' : item.status === 'In Progress' ? 'dot-inprogress' : 'dot-cancelled'}></span>
                            {item.status}
                          </div>
                        </td>
                        <td>
                          {item.qcStatus === '-' ? (
                            <span style={{ color: '#94A3B8', fontWeight: 600 }}>-</span>
                          ) : (
                            <div className={`qc-badge ${item.qcStatus === 'Accepted' ? 'qc-accepted' : item.qcStatus === 'Rejected' ? 'qc-rejected' : 'qc-pending'}`}>
                              <span className={item.qcStatus === 'Accepted' ? 'dot-qcac' : item.qcStatus === 'Rejected' ? 'dot-qcre' : 'dot-qcpe'}></span>
                              {item.qcStatus}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="action-row" style={{ justifyContent: 'center' }}>
                            <button className="action-btn" title="View details" onClick={() => alert(`Audit report for ${item.inwardNo}:\nInvoice: ${item.invoiceNo}\nSupplier: ${item.supplier}\nDevice: ${item.deviceType} (${item.deviceModel})\nQty: ${item.quantity}\nQC status: ${item.qcStatus}`)}>👁</button>
                            <button className="action-btn" title="QC Action / More" onClick={() => triggerToast(`Voucher ${item.inwardNo} verification panel opened`)}>···</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Paginated Footer controls */}
              <div className="io-tcard-ft">
                <span className="io-tcard-ft-lbl">
                  Showing {(currentPage - 1) * 5 + 1} to {Math.min(currentPage * 5, filteredRecords.length)} of {filteredRecords.length} records
                </span>
                <div className="io-pg" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="io-pg">
                    <button className="io-pgb" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>&lt;</button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} className={`io-pgb ${currentPage === i + 1 ? 'cur' : ''}`} onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </button>
                    ))}
                    <button className="io-pgb" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>&gt;</button>
                  </div>
                  <select className="io-select" style={{ padding: '4px 6px', fontSize: '11.5px' }} onChange={() => triggerToast('Page size changed')}>
                    <option>5 / page</option>
                    <option selected>10 / page</option>
                    <option>20 / page</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {toast.show && (
        <div className="io-toast io-toast-green">
          <span>🔔</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}
