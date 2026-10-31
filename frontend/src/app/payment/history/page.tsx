"use client";
import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap');

* { box-sizing: border-box; }
.ph-shell { display:flex; min-height:100vh; background:#F6F7FB; font-family:'Inter',sans-serif; color:#0F172A; }
.ph-main { margin-left:230px; display:flex; flex-direction:column; min-height:100vh; width:calc(100% - 230px); min-width:0; }
.ph-page { flex:1; padding:24px; display:flex; flex-direction:column; gap:18px; background:#F8FAFC; min-width:0; }

.ph-title-row { display:flex; align-items:center; justify-content:space-between; gap:18px; margin-bottom:2px; }
.ph-h1 { font-size:24px; font-weight:800; color:#0F172A; margin:0 0 5px; letter-spacing:-.025em; }
.ph-sub { font-size:13px; color:#64748B; margin:0; line-height:1.5; }
.ph-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.ph-btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:8px 14px; background:#FFF; border:1px solid #DCE3EE; border-radius:9px; font-size:12.5px; font-weight:700; color:#475569; cursor:pointer; transition:.15s ease; white-space:nowrap; }
.ph-btn:hover { border-color:#2A195C; color:#2A195C; background:#FAF8FF; }
.ph-btn:disabled { opacity:.55; cursor:not-allowed; }
.ph-btn-primary { background:#2A195C; color:#FFF; border-color:#2A195C; box-shadow:0 4px 10px rgba(42,25,92,.14); }
.ph-btn-primary:hover { background:#39257D; color:#FFF; border-color:#39257D; }
.ph-btn-danger { background:#FEF2F2; color:#DC2626; border-color:#FECACA; }
.ph-btn-danger:hover { background:#FEE2E2; color:#B91C1C; border-color:#FCA5A5; }
.ph-checkbox { width:16px; height:16px; margin:0; border-radius:4px; accent-color:#2A195C; cursor:pointer; }
.action-delete-btn { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; border:1px solid #FECACA; background:#FFF7F7; color:#DC2626; cursor:pointer; transition:.15s; flex:0 0 auto; }
.action-delete-btn:hover { background:#DC2626; color:#FFF; border-color:#DC2626; }
.action-delete-btn:disabled { opacity:.5; cursor:not-allowed; }

.ph-kpi-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
.ph-kpi-card { background:#FFF; border:1px solid #E3E8F0; border-radius:14px; padding:16px 17px; box-shadow:0 1px 2px rgba(15,23,42,.025); min-width:0; }
.ph-kpi-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.ph-kpi-label { font-size:10.5px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.045em; }
.ph-kpi-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ph-kpi-val { font-family:'Outfit',sans-serif; font-size:23px; font-weight:800; line-height:1.1; margin:8px 0 3px; white-space:nowrap; }
.ph-kpi-sub { font-size:10.5px; color:#64748B; margin-top:8px; font-weight:600; display:flex; align-items:center; gap:6px; white-space:nowrap; }
.ic-purple { background:#EEF2FF; color:#6366F1; }
.ic-green { background:#ECFDF5; color:#10B981; }
.ic-orange { background:#FFF7ED; color:#F97316; }
.ic-blue { background:#EFF6FF; color:#2563EB; }

.ph-filter-card { background:#FFF; border:1px solid #E1E7F0; border-radius:14px; padding:13px; box-shadow:0 1px 2px rgba(15,23,42,.025); }
.ph-filter-grid { display:grid; grid-template-columns:minmax(260px,2fr) minmax(145px,1.15fr) minmax(135px,1.05fr) minmax(165px,1.25fr) auto; gap:9px; align-items:center; }
.ph-search-wrap { position:relative; min-width:0; }
.ph-search-input { width:100%; height:40px; padding:0 12px 0 38px; border:1px solid #DCE3EE; border-radius:9px; font-size:12.5px; outline:none; background:#FFF; color:#1E293B; }
.ph-search-input:focus,.ph-select:focus { border-color:#2A195C; box-shadow:0 0 0 3px rgba(42,25,92,.06); }
.ph-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#94A3B8; display:flex; align-items:center; pointer-events:none; }
.ph-select { width:100%; height:40px; padding:0 35px 0 12px; border:1px solid #DCE3EE; border-radius:9px; font-size:12px; font-weight:600; outline:none; background:#FFF; color:#334155; cursor:pointer; appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; background-size:11px; }
.ph-filter-btn { height:40px; display:inline-flex; align-items:center; justify-content:center; padding:0 13px; background:#FFF; border:1px solid #DCE3EE; border-radius:9px; font-size:12px; font-weight:700; color:#475569; cursor:pointer; white-space:nowrap; }
.ph-filter-btn:hover { background:#FAF8FF; border-color:#2A195C; color:#2A195C; }

.ph-tcard { background:#FFF; border:1px solid #DDE4EE; border-radius:14px; box-shadow:0 2px 6px rgba(15,23,42,.025); overflow:hidden; display:flex; flex-direction:column; min-width:0; }
.ph-dt-wrap { width:100%; overflow-x:auto; overflow-y:hidden; scrollbar-width:thin; }
.ph-dt-wrap::-webkit-scrollbar { height:8px; }
.ph-dt-wrap::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:8px; }
.ph-dt { width:100%; min-width:1550px; border-collapse:separate; border-spacing:0; table-layout:fixed; }
.ph-dt th { height:52px; padding:0 14px; font-size:10.5px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.055em; text-align:left; background:#F8FAFC; border-bottom:1px solid #DDE4EE; white-space:nowrap; vertical-align:middle; }
.ph-dt td { height:68px; padding:10px 14px; font-size:12.5px; color:#334155; border-bottom:1px solid #EEF2F6; vertical-align:middle; overflow:hidden; }
.ph-dt tbody tr:last-child td { border-bottom:none; }
.ph-dt tbody tr:hover td { background:#FBFAFF; }
.ph-dt th:first-child,.ph-dt td:first-child { width:48px; padding-left:16px; padding-right:7px; text-align:center; }
.ph-dt th:nth-child(2),.ph-dt td:nth-child(2) { width:190px; }
.ph-dt th:nth-child(3),.ph-dt td:nth-child(3) { width:160px; }
.ph-dt th:nth-child(4),.ph-dt td:nth-child(4) { width:220px; }
.ph-dt th:nth-child(5),.ph-dt td:nth-child(5) { width:100px; }
.ph-dt th:nth-child(6),.ph-dt td:nth-child(6) { width:140px; }
.ph-dt th:nth-child(7),.ph-dt td:nth-child(7) { width:180px; }
.ph-dt th:nth-child(8),.ph-dt td:nth-child(8) { width:110px; }
.ph-dt th:nth-child(9),.ph-dt td:nth-child(9) { width:110px; }
.ph-dt th:nth-child(10),.ph-dt td:nth-child(10) { width:135px; }
.ph-dt th:nth-child(11),.ph-dt td:nth-child(11) { width:120px; }
.ph-dt th:nth-child(12),.ph-dt td:nth-child(12) { width:115px; }

.ph-rider-cell { display:flex; align-items:center; gap:10px; min-width:0; }
.ph-rider-avatar { width:38px; height:38px; border-radius:50%; object-fit:cover; background:#2A195C; color:#FFF; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex:0 0 38px; }
.ph-rider-info { min-width:0; display:flex; flex-direction:column; }
.ph-rider-name { font-size:13px; font-weight:750; color:#1E293B; line-height:1.35; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ph-rider-code { font-size:11px; color:#64748B; font-weight:600; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ph-date-time { white-space:nowrap; color:#475569; font-size:12px; font-weight:600; }
.ph-tx-wrap { display:flex; align-items:center; gap:7px; min-width:0; white-space:nowrap; }
.ph-tx-code { font-family:'SFMono-Regular',Consolas,monospace; font-size:10.8px; font-weight:700; color:#1E293B; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
.ph-ref-code { font-family:'SFMono-Regular',Consolas,monospace; font-size:10.5px; font-weight:600; color:#64748B; margin-top:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ph-type-badge { display:inline-flex; align-items:center; justify-content:center; min-width:62px; padding:5px 9px; border-radius:7px; font-size:11px; font-weight:800; white-space:nowrap; }
.type-credit { background:#DCFCE7; color:#15803D; }
.type-debit { background:#FEF3C7; color:#B45309; }
.ph-pm-badge { display:inline-flex; align-items:center; gap:5px; padding:7px 10px; border-radius:8px; font-size:11.5px; font-weight:750; border:1px solid #E1E7F0; background:#FFF; color:#334155; white-space:nowrap; }
.ph-purpose { min-width:0; }
.ph-purpose-main { font-size:11.5px; color:#475569; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ph-amount { display:inline-flex; align-items:baseline; gap:1px; font-weight:800; font-size:14px; line-height:1; white-space:nowrap; letter-spacing:-.01em; }
.ph-amount.credit { color:#15803D; }
.ph-amount.debit { color:#DC2626; }
.ph-amount-sign { display:inline-block; font-weight:900; }
.status-badge { display:inline-flex; align-items:center; justify-content:center; padding:6px 11px; border-radius:999px; font-size:11px; font-weight:800; border:1px solid transparent; white-space:nowrap; }
.badge-successful { background:#ECFDF5; color:#15803D; border-color:#BBF7D0; }
.badge-pending { background:#EFF6FF; color:#1D4ED8; border-color:#BFDBFE; }
.badge-failed { background:#FEF2F2; color:#B91C1C; border-color:#FECACA; }
.action-copy-btn { display:inline-flex; align-items:center; justify-content:center; height:32px; padding:0 9px; background:#FFF; border:1px solid #DCE3EE; border-radius:8px; font-size:10.5px; font-weight:750; color:#475569; cursor:pointer; transition:.15s; white-space:nowrap; }
.action-copy-btn:hover { background:#2A195C; color:#FFF; border-color:#2A195C; }
.ph-actions-cell { display:flex; align-items:center; gap:6px; white-space:nowrap; }

.ph-tcard-ft { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-top:1px solid #DDE4EE; background:#FFF; flex-wrap:wrap; gap:12px; }
.ph-tcard-ft-lbl { font-size:12px; color:#64748B; font-weight:600; }
.ph-footer-controls { display:flex; align-items:center; gap:10px; }
.ph-pg { display:flex; align-items:center; gap:4px; }
.ph-pgb { width:32px; height:32px; border:1px solid #DCE3EE; border-radius:8px; background:#FFF; font-size:15px; font-weight:800; color:#475569; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.ph-pgb:hover:not(:disabled) { border-color:#2A195C; color:#2A195C; background:#FAF8FF; }
.ph-pgb:disabled { opacity:.45; cursor:not-allowed; }
.ph-limit-select { height:34px; padding:0 10px; border:1px solid #DCE3EE; border-radius:8px; font-size:11.5px; font-weight:700; outline:none; background:#FFF; color:#475569; cursor:pointer; }

@keyframes ph-spin { to { transform:rotate(360deg); } }
.ph-spinner { display:inline-block; width:24px; height:24px; border:3px solid #DDD6FE; border-top-color:#2A195C; border-radius:50%; animation:ph-spin .8s linear infinite; }

@media (max-width:1200px) {
  .ph-main { margin-left:210px; width:calc(100% - 210px); }
  .ph-page { padding:18px; }
  .ph-kpi-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .ph-filter-grid { grid-template-columns:2fr 1fr 1fr; }
  .ph-filter-grid > :first-child { grid-column:span 3; }
}
@media (max-width:760px) {
  .ph-main { margin-left:0; width:100%; }
  .ph-page { padding:14px; }
  .ph-title-row { align-items:flex-start; flex-direction:column; }
  .ph-actions { width:100%; overflow-x:auto; padding-bottom:2px; }
  .ph-kpi-grid { grid-template-columns:1fr; }
  .ph-filter-grid { grid-template-columns:1fr; }
  .ph-filter-grid > :first-child { grid-column:auto; }
  .ph-footer-controls { width:100%; justify-content:space-between; }
}
`;

interface PaymentRecord {
  id: string;
  tx_id: string;
  reference_id: string;
  rider_name: string;
  mobile: string;
  rent_amount?: number | string;
  deposit_amount?: number | string;
  amount: number;
  type: 'Credit' | 'Debit';
  status: 'Successful' | 'Pending' | 'Failed';
  payment_method: string;
  purpose: string;
  created_at: string;
}

interface KPIStats {
  total_credit: number;
  total_debit: number;
  net_balance: number;
  total_transactions: number;
  successful_count: number;
  pending_count: number;
  failed_count: number;
}

export default function PaymentHistoryPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const [kpis, setKpis] = useState<KPIStats>({
    total_credit: 0,
    total_debit: 0,
    net_balance: 0,
    total_transactions: 0,
    successful_count: 0,
    pending_count: 0,
    failed_count: 0
  });

  // Fetch real payment history from backend API
  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const qParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: search.trim(),
        type: typeFilter,
        status: statusFilter
      });

      const res: any = await api.get(`/payments/history?${qParams.toString()}`);
      if (res && res.status === 'success') {
        setRecords(res.data || []);
        if (res.kpis) setKpis(res.kpis);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalRecords(res.pagination.total || 0);
        }
      }
    } catch (e) {
      console.error('Failed to load payment history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, [page, limit, typeFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchPaymentHistory();
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Filter client-side by method if needed
  const displayRecords = useMemo(() => {
    if (methodFilter === 'all') return records;
    return records.filter(r => {
      const pm = (r.payment_method || '').toLowerCase();
      if (methodFilter === 'icici') return pm.includes('icici');
      if (methodFilter === 'payu') return pm.includes('payu');
      if (methodFilter === 'wallet') return pm.includes('wallet');
      if (methodFilter === 'razorpay') return pm.includes('razorpay');
      return true;
    });
  }, [records, methodFilter]);

  // Keep the date/time value as one visual unit. This prevents the browser from
  // creating awkward wrapped/repeated-looking time fragments inside the table.
  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isAllSelected = displayRecords.length > 0 && displayRecords.every(r => selectedIds.includes(r.id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayRecords.map(r => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected transaction(s)?`)) return;
    try {
      setIsDeleting(true);
      await api.delete('/payments/history', { ids: selectedIds });
      setSelectedIds([]);
      await fetchPaymentHistory();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete transactions');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSingleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      setIsDeleting(true);
      await api.delete(`/payments/history/${id}`);
      setSelectedIds(prev => prev.filter(item => item !== id));
      await fetchPaymentHistory();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Transaction ID', 'Rider Name', 'Mobile', 'Type', 'Amount', 'Status', 'Payment Method', 'Reference ID', 'Date'];
    const rows = records.map(r => [
      r.tx_id,
      r.rider_name,
      r.mobile,
      r.type,
      r.amount,
      r.status,
      r.payment_method,
      r.reference_id,
      new Date(r.created_at).toISOString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Evegah_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ph-shell">
        <Sidebar activePath="/payment/history" />
        <div className="ph-main">
          <TopBar />
          
          <div className="ph-page">
            {/* Header */}
            <div className="ph-title-row">
              <div>
                <h1 className="ph-h1">Live Payment History</h1>
                <p className="ph-sub">Real-time ledger of collections, deposits, refunds, and withdrawals across all payment gateways.</p>
              </div>
              <div className="ph-actions">
                {selectedIds.length > 0 && (
                  <button 
                    className="ph-btn ph-btn-danger" 
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    {isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
                  </button>
                )}
                <button className="ph-btn" onClick={exportCSV}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export CSV
                </button>
                <button className="ph-btn ph-btn-primary" onClick={fetchPaymentHistory}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </div>

            {/* KPI Cards Grid (Matches Renters/Vehicles UI) */}
            <div className="ph-kpi-grid">
              {/* 1. Total Collections (Credit) */}
              <div className="ph-kpi-card">
                <div className="ph-kpi-top">
                  <div>
                    <div className="ph-kpi-label">Total Collections</div>
                    <div className="ph-kpi-val" style={{ color: '#0F172A' }}>
                      ₹{(kpis.total_credit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="ph-kpi-sub" style={{ color: '#10B981' }}>
                      ↑ {kpis.successful_count} successful collections
                    </div>
                  </div>
                  <div className="ph-kpi-icon ic-green">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 2. Total Refunds / Debits */}
              <div className="ph-kpi-card">
                <div className="ph-kpi-top">
                  <div>
                    <div className="ph-kpi-label">Total Refunds / Payouts</div>
                    <div className="ph-kpi-val" style={{ color: '#0F172A' }}>
                      ₹{(kpis.total_debit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="ph-kpi-sub" style={{ color: '#F97316' }}>
                      ↓ deposits &amp; adjustments
                    </div>
                  </div>
                  <div className="ph-kpi-icon ic-orange">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M3 21v-5h5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 3. Net Balance */}
              <div className="ph-kpi-card">
                <div className="ph-kpi-top">
                  <div>
                    <div className="ph-kpi-label">Net Platform Settled</div>
                    <div className="ph-kpi-val" style={{ color: '#0F172A' }}>
                      ₹{(kpis.net_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="ph-kpi-sub" style={{ color: '#6366F1' }}>
                      ↑ gross collections minus refunds
                    </div>
                  </div>
                  <div className="ph-kpi-icon ic-purple">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 4. Total Transactions Count */}
              <div className="ph-kpi-card">
                <div className="ph-kpi-top">
                  <div>
                    <div className="ph-kpi-label">Total Transactions</div>
                    <div className="ph-kpi-val" style={{ color: '#0F172A' }}>
                      {kpis.total_transactions}
                    </div>
                    <div className="ph-kpi-sub" style={{ color: '#64748B' }}>
                      <span style={{ color: '#F59E0B' }}>{kpis.pending_count} pending</span>
                      <span>•</span>
                      <span style={{ color: '#EF4444' }}>{kpis.failed_count} failed</span>
                    </div>
                  </div>
                  <div className="ph-kpi-icon ic-blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="ph-filter-card">
              <div className="ph-filter-grid">
                <div className="ph-search-wrap">
                  <span className="ph-search-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="ph-search-input"
                    placeholder="Search by Rider Name, Mobile, Tx ID, Ref ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div>
                  <select
                    className="ph-select"
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  >
                    <option value="all">All Types (Credit &amp; Debit)</option>
                    <option value="credit">Credit (Collections)</option>
                    <option value="debit">Debit (Refunds / Withdrawals)</option>
                  </select>
                </div>

                <div>
                  <select
                    className="ph-select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  >
                    <option value="all">All Status</option>
                    <option value="successful">Successful</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <select
                    className="ph-select"
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                  >
                    <option value="all">All Gateways &amp; Methods</option>
                    <option value="icici">ICICI Bank UPI</option>
                    <option value="payu">PayU </option>
                    <option value="wallet">Wallet Transactions</option>
                    <option value="razorpay">Razorpay</option>
                  </select>
                </div>

                <button className="ph-filter-btn" onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); setMethodFilter('all'); setPage(1); }}>
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="ph-tcard">
              <div className="ph-dt-wrap">
                <table className="ph-dt">
                  <colgroup>
                    <col style={{ width: 48 }} />
                    <col style={{ width: 190 }} />
                    <col style={{ width: 160 }} />
                    <col style={{ width: 220 }} />
                    <col style={{ width: 100 }} />
                    <col style={{ width: 140 }} />
                    <col style={{ width: 180 }} />
                    <col style={{ width: 110 }} />
                    <col style={{ width: 110 }} />
                    <col style={{ width: 135 }} />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 115 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ width: 44, paddingLeft: 18, paddingRight: 8 }}>
                        <input 
                          type="checkbox" 
                          className="ph-checkbox"
                          checked={isAllSelected}
                          ref={el => { if (el) el.indeterminate = isSomeSelected; }}
                          onChange={toggleSelectAll}
                          title="Select / Deselect All"
                        />
                      </th>
                      <th>RIDER / CUSTOMER</th>
                      <th>DATE &amp; TIME</th>
                      <th>TRANSACTION ID</th>
                      <th>TYPE</th>
                      <th>GATEWAY / METHOD</th>
                      <th>PURPOSE</th>
                      <th>RENT</th>
                      <th>DEPOSIT</th>
                      <th>TOTAL</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                          <div className="ph-spinner" style={{ marginBottom: 8 }} />
                          <div>Loading live transaction history...</div>
                        </td>
                      </tr>
                    ) : displayRecords.length === 0 ? (
                      <tr>
                        <td colSpan={12} style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💳</div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: '#1E293B' }}>No Transactions Found</div>
                          <div style={{ fontSize: '13px', marginTop: '4px' }}>Try adjusting your search query or status filter.</div>
                        </td>
                      </tr>
                    ) : (
                      displayRecords.map((r) => {
                        const isCredit = r.type === 'Credit';
                        const isSuccess = r.status === 'Successful';
                        const isPending = r.status === 'Pending';
                        const isSelected = selectedIds.includes(r.id);
                        const initials = (r.rider_name || 'R').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                        return (
                          <tr key={r.id} style={{ background: isSelected ? '#FAF5FF' : undefined }}>
                            {/* Row Checkbox */}
                            <td style={{ width: 44, paddingLeft: 18, paddingRight: 8 }}>
                              <input 
                                type="checkbox" 
                                className="ph-checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectOne(r.id)}
                              />
                            </td>

                            {/* Rider info */}
                            <td>
                              <div className="ph-rider-cell">
                                <div className="ph-rider-avatar">
                                  {initials}
                                </div>
                                <div className="ph-rider-info">
                                  <span className="ph-rider-name">{r.rider_name}</span>
                                  <span className="ph-rider-code">{r.mobile || 'No Mobile'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Date & Time */}
                            <td>
                              <span className="ph-date-time">{formatDateTime(r.created_at)}</span>
                            </td>

                            {/* Transaction ID */}
                            <td>
                              <div className="ph-tx-wrap">
                                <span className="ph-tx-code" title={r.tx_id}>{r.tx_id}</span>
                                <button
                                  className="action-copy-btn"
                                  onClick={() => copyToClipboard(r.tx_id)}
                                  title="Copy transaction ID"
                                >
                                  {copiedId === r.tx_id ? '✓ Copied' : 'Copy'}
                                </button>
                              </div>
                            </td>

                            {/* Type */}
                            <td>
                              <span className={`ph-type-badge ${isCredit ? 'type-credit' : 'type-debit'}`}>
                                {isCredit ? 'Credit' : 'Debit'}
                              </span>
                            </td>

                            {/* Payment Method */}
                            <td>
                              <span className="ph-pm-badge" title={r.payment_method}>
                                {r.payment_method.includes('ICICI') ? '🟠 ICICI UPI' :
                                 r.payment_method.includes('PayU') ? 'PayU' :
                                 r.payment_method.includes('Razorpay') ? '🔵 Razorpay' : r.payment_method}
                              </span>
                            </td>

                            {/* Purpose / Reference */}
                            <td>
                              <div className="ph-purpose">
                                <div className="ph-purpose-main" title={r.purpose}>{r.purpose || '—'}</div>
                                {r.reference_id && (
                                  <div className="ph-ref-code" title={r.reference_id}>{r.reference_id}</div>
                                )}
                              </div>
                            </td>

                            {/* Rent Amount */}
                            <td>
                              <span style={{ fontWeight: 700, color: '#334155' }}>
                                ₹{Number(r.rent_amount ?? r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </td>

                            {/* Deposit Amount */}
                            <td>
                              <span style={{ fontWeight: 700, color: Number(r.deposit_amount) > 0 ? '#B45309' : '#94A3B8' }}>
                                ₹{Number(r.deposit_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </td>

                            {/* Total Amount */}
                            <td>
                              <span className={`ph-amount ${isCredit ? 'credit' : 'debit'}`} title={`${isCredit ? '+' : '-'}₹${Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}>
                                <span className="ph-amount-sign">{isCredit ? '+' : '-'}</span><span>₹{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </span>
                            </td>

                            {/* Status */}
                            <td>
                              <span className={`status-badge ${isSuccess ? 'badge-successful' : isPending ? 'badge-pending' : 'badge-failed'}`}>
                                {r.status}
                              </span>
                            </td>

                            {/* Action */}
                            <td>
                              <div className="ph-actions-cell">
                                <button
                                  className="action-copy-btn"
                                  onClick={() => copyToClipboard(r.reference_id || r.tx_id)}
                                  title="Copy reference ID"
                                >
                                  Details
                                </button>
                                <button
                                  className="action-delete-btn"
                                  title="Delete Record"
                                  onClick={() => handleSingleDelete(r.id)}
                                  disabled={isDeleting}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="ph-tcard-ft">
                <span className="ph-tcard-ft-lbl">
                  Showing {displayRecords.length} of {totalRecords} total transactions
                </span>

                <div className="ph-footer-controls">
                  <select
                    className="ph-limit-select"
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  >
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>

                  <div className="ph-pg">
                    <button
                      className="ph-pgb"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      ‹
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 700, padding: '0 8px', color: '#2A195C' }}>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      className="ph-pgb"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
