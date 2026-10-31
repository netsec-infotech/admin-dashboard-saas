"use client";
import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.ex-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.ex-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.ex-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Breadcrumb */
.ex-bc { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #64748B; font-weight: 500; }
.ex-bc a { color: #64748B; text-decoration: none; }
.ex-bc a:hover { color: #2A195C; }
.ex-bc-sep { color: #94A3B8; }
.ex-bc-cur { color: #2A195C; font-weight: 600; }

/* Header title */
.ex-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.ex-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; letter-spacing: -0.02em; }
.ex-sub { font-size: 13px; color: #64748B; margin: 0; }

.ex-actions { display: flex; align-items: center; gap: 10px; }
.ex-btn { display: flex; align-items: center; gap: 7px; padding: 9px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; }
.ex-btn:hover { border-color: #2A195C; color: #2A195C; }
.ex-btn-primary { background: #2A195C; color: #fff; border-color: #2A195C; }
.ex-btn-primary:hover { background: #6D28D9; border-color: #6D28D9; color: #fff; }

/* Hub details profile card */
.ex-profile-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: grid; grid-template-columns: 240px 1.5fr 1fr; gap: 24px; align-items: center; }
.ex-img-box { width: 100%; height: 135px; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; position: relative; background: #FAF5FF; display: flex; align-items: center; justify-content: center; }
.ex-img-box img { width: 100%; height: 100%; object-fit: cover; }
.ex-details-col { display: flex; flex-direction: column; gap: 8px; }
.ex-detail-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #475569; }
.ex-detail-lbl { font-weight: 500; color: #64748B; width: 110px; flex-shrink: 0; }
.ex-detail-val { font-weight: 700; color: #0F172A; }

/* Donut box */
.ex-donut-card { display: flex; align-items: center; gap: 16px; border-left: 1px solid #F1F5F9; padding-left: 24px; height: 100%; }
.ex-donut-svg { position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ex-donut-val { position: absolute; font-size: 11.5px; font-weight: 800; color: #0F172A; text-align: center; line-height: 1.2; }
.ex-donut-info { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.ex-donut-item { display: flex; align-items: center; justify-content: space-between; font-size: 11px; fontWeight: 600; }
.ex-donut-lbl-wrap { display: flex; align-items: center; gap: 6px; color: #475569; }
.ex-donut-dot { width: 8px; height: 8px; border-radius: 50%; }

/* KPI Grid */
.ex-stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.ex-stat-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.ex-stat-lbl { font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
.ex-stat-val { font-size: 20px; font-weight: 800; color: #0F172A; line-height: 1.1; }
.ex-stat-sub { font-size: 10.5px; color: #94A3B8; font-weight: 500; }
.ex-stat-sub-green { color: #16A34A; font-weight: 700; }

/* Filter bar panel */
.ex-filter-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.ex-filter-grid { display: grid; grid-template-columns: 2fr 1.2fr 1.2fr 1.2fr 1fr auto; gap: 10px; align-items: center; }
.ex-search-wrap { position: relative; }
.ex-search-input { width: 100%; padding: 8px 12px 8px 34px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; }
.ex-search-input:focus { border-color: #2A195C; }
.ex-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
.ex-select { padding: 8px 10px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #334155; cursor: pointer; }
.ex-select:focus { border-color: #2A195C; }
.ex-reset-btn { padding: 8px 14px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #64748B; cursor: pointer; transition: all .15s; }
.ex-reset-btn:hover { border-color: #EF4444; color: #EF4444; }

/* Table styling */
.ex-tcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; }
.ex-dt { width: 100%; border-collapse: collapse; }
.ex-dt th { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .06em; text-align: left; padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
.ex-dt td { padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.ex-dt tr:last-child td { border-bottom: none; }
.ex-dt tr:hover td { background: #F8FAFC; }

.td-id { font-weight: 700; color: #2A195C; text-decoration: none; cursor: pointer; }
.td-id:hover { text-decoration: underline; }

.status-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.badge-approved { background: #DCFCE7; color: #16A34A; }
.badge-pending { background: #FEF3C7; color: #D97706; }
.badge-rejected { background: #FEE2E2; color: #EF4444; }

.action-row { display: flex; align-items: center; gap: 6px; }
.action-btn { width: 26px; height: 26px; border: 1.5px solid #E2E8F0; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #64748B; background: #fff; cursor: pointer; }
.action-btn:hover { border-color: #2A195C; color: #2A195C; }

.ex-tcard-ft { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-top: 1px solid #E2E8F0; background: #F8FAFC; }
.ex-tcard-ft-lbl { font-size: 12.5px; color: #64748B; font-weight: 500; }
.ex-pg { display: flex; align-items: center; gap: 4px; }
.ex-pgb { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 6px; background: #fff; font-size: 12.5px; font-weight: 600; color: #475569; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.ex-pgb:hover:not(:disabled) { border-color: #2A195C; color: #2A195C; }
.ex-pgb.cur { background: #2A195C; color: #fff; border-color: #2A195C; }
.ex-pgb:disabled { opacity: 0.5; cursor: not-allowed; }

/* Custom feedback toast alert */
.ex-toast { position: fixed; bottom: 24px; right: 24px; background: #0F172A; color: #fff; padding: 12px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 12.5px; font-weight: 600; z-index: 300; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); animation: ex-slideup 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.ex-toast-green { border-left: 4px solid #10B981; }

/* Popups / Dialogs style */
.ex-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(2px); z-index: 200; display: flex; align-items: center; justify-content: center; }
.ex-modal-box { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; width: 440px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; }
.ex-modal-hdr { padding: 16px 20px; border-bottom: 1.5px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; }
.ex-modal-tit { font-size: 15px; font-weight: 800; color: #0F172A; margin: 0; }
.ex-modal-close { border: none; background: none; font-size: 18px; color: #94A3B8; cursor: pointer; }
.ex-modal-close:hover { color: #64748B; }
.ex-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.ex-modal-ft { padding: 14px 20px; border-top: 1.5px solid #F1F5F9; background: #FAFBFD; display: flex; justify-content: flex-end; gap: 8px; }

.ex-form-group { display: flex; flex-direction: column; gap: 4px; }
.ex-form-lbl { font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.02em; }
.ex-form-inp { width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; font-weight: 500; }
.ex-form-inp:focus { border-color: #2A195C; }

@keyframes ex-slideup { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

interface ExpenseItem {
  id: string;
  name: string;
  category: 'Rent' | 'Electricity' | 'Staff Salaries' | 'Maintenance' | 'Misc';
  amount: number;
  date: string;
  payMethod: 'Bank Transfer' | 'UPI' | 'Card' | 'Cash';
  status: 'Approved' | 'Pending Approval' | 'Rejected';
}

const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: 'EXP-2024-0052', name: 'Manjalpur Hub Rent Payment', category: 'Rent', amount: 45000, date: '15 May 2024', payMethod: 'Bank Transfer', status: 'Approved' },
  { id: 'EXP-2024-0051', name: 'Gotri Hub Centralized Electricity Bill', category: 'Electricity', amount: 25000, date: '12 May 2024', payMethod: 'UPI', status: 'Approved' },
  { id: 'EXP-2024-0050', name: 'May staff salary partial advance', category: 'Staff Salaries', amount: 18000, date: '10 May 2024', payMethod: 'Bank Transfer', status: 'Approved' },
  { id: 'EXP-2024-0049', name: 'Micro-station and AC servicing charge', category: 'Maintenance', amount: 12000, date: '08 May 2024', payMethod: 'UPI', status: 'Approved' },
  { id: 'EXP-2024-0048', name: 'Stationary & Water Dispenser refilling', category: 'Misc', amount: 5000, date: '05 May 2024', payMethod: 'Cash', status: 'Approved' },
  { id: 'EXP-2024-0047', name: 'Fire Extinguisher refill audit clearance', category: 'Maintenance', amount: 4800, date: '03 May 2024', payMethod: 'Card', status: 'Approved' },
  { id: 'EXP-2024-0046', name: 'Gotri Hub Office internet router upgrade', category: 'Misc', amount: 2200, date: '01 May 2024', payMethod: 'UPI', status: 'Approved' }
];

export default function FranchiseExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [payMethodFilter, setPayMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });
  const [loading, setLoading] = useState(false);

  // Add modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [newExpName, setNewExpName] = useState('');
  const [newExpCat, setNewExpCat] = useState<'Rent' | 'Electricity' | 'Staff Salaries' | 'Maintenance' | 'Misc'>('Rent');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpPay, setNewExpPay] = useState<'Bank Transfer' | 'UPI' | 'Card' | 'Cash'>('Bank Transfer');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const triggerToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  // Load persistent expenses from backend
  const fetchExpensesFromBackend = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/franchises/expenses/all`);
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        const mapped: ExpenseItem[] = json.data.map((r: any) => ({
          id: r.invoice_number || `EXP-${r.id.slice(0, 8)}`,
          name: r.title,
          category: r.category as any,
          amount: parseFloat(r.amount),
          date: new Date(r.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          payMethod: (r.payment_mode || 'UPI') as any,
          status: (r.status || 'Approved') as any,
        }));
        setExpenses(mapped);
      }
    } catch (e) {
      console.warn('Could not fetch backend expenses, retaining local records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesFromBackend();
  }, []);

  const resetFilters = () => {
    setSearchQuery('');
    setCatFilter('');
    setPayMethodFilter('');
    setStatusFilter('');
    setCurrentPage(1);
    triggerToast('Filters reset successfully');
  };

  const handleAddExpense = async () => {
    if (!newExpName || !newExpAmount) {
      alert('Please fill out all fields');
      return;
    }

    const amt = parseFloat(newExpAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid expense amount');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/franchises/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newExpName,
          category: newExpCat,
          amount: amt,
          payment_mode: newExpPay,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const item = data.data;
        const newEntry: ExpenseItem = {
          id: item.invoice_number || `EXP-${item.id.slice(0, 8)}`,
          name: item.title,
          category: item.category,
          amount: parseFloat(item.amount),
          date: new Date(item.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          payMethod: item.payment_mode,
          status: item.status,
        };
        setExpenses((prev) => [newEntry, ...prev]);
        setNewExpName('');
        setNewExpAmount('');
        setModalOpen(false);
        triggerToast(`Expense ${newEntry.id} recorded and persisted to database!`);
      } else {
        alert(data.message || 'Failed to record expense');
      }
    } catch (e: any) {
      alert('Network error connecting to backend: ' + e.message);
    }
  };

  // Filter logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchSearch = searchQuery === '' ||
        exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = catFilter === '' || exp.category === catFilter;
      const matchPay = payMethodFilter === '' || exp.payMethod === payMethodFilter;
      const matchStatus = statusFilter === '' || exp.status === statusFilter;
      return matchSearch && matchCat && matchPay && matchStatus;
    });
  }, [expenses, searchQuery, catFilter, payMethodFilter, statusFilter]);

  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * 5;
    return filteredExpenses.slice(start, start + 5);
  }, [filteredExpenses, currentPage]);

  const totalPages = Math.ceil(filteredExpenses.length / 5) || 1;

  // MTD sums
  const sumCat = (cat: string) => {
    return expenses
      .filter(e => e.category === cat && e.status === 'Approved')
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const rentSum = sumCat('Rent');
  const elecSum = sumCat('Electricity');
  const staffSum = sumCat('Staff Salaries');
  const maintSum = sumCat('Maintenance');
  const miscSum = sumCat('Misc');
  const totalSum = rentSum + elecSum + staffSum + maintSum + miscSum;

  const rentPct = Math.round((rentSum / (totalSum || 1)) * 100);
  const elecPct = Math.round((elecSum / (totalSum || 1)) * 100);
  const staffPct = Math.round((staffSum / (totalSum || 1)) * 100);
  const maintPct = Math.round((maintSum / (totalSum || 1)) * 100);
  const miscPct = Math.round((miscSum / (totalSum || 1)) * 100);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ex-shell">
        <Sidebar activePath="/franchise/expenses" />
        <div className="ex-main">
          <TopBar />
          <div className="ex-page">
            {/* Breadcrumb */}
            <div className="ex-bc">
              <a href="/">Dashboard</a>
              <span className="ex-bc-sep">/</span>
              <span className="ex-bc-sep">Franchise</span>
              <span className="ex-bc-sep">/</span>
              <span className="ex-bc-cur">Expenses</span>
            </div>

            {/* Title & Actions */}
            <div className="ex-title-row">
              <div>
                <h1 className="ex-h1">Hub Expenses Ledger</h1>
                <p className="ex-sub">Manage rent, utilities, salaries, and station operational expense metrics.</p>
              </div>
              <div className="ex-actions">
                <button className="ex-btn" onClick={() => triggerToast('Expenses report exported')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export Ledger
                </button>
                <button className="ex-btn-primary ex-btn" onClick={() => setModalOpen(true)}>
                  + Log Expense
                </button>
              </div>
            </div>

            {/* Hub details profile card */}
            <div className="ex-profile-card">
              <div className="ex-img-box">
                <img src="/evegah_hub_storefront.png" alt="Hub Storefront" onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80";
                }} />
              </div>
              <div className="ex-details-col">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>CP E-Vegah Hub</h2>
                  <span style={{ background: '#FAF5FF', color: '#2A195C', border: '1.2px solid #E9D5FF', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>CENTRAL ZONE</span>
                </div>
                <div className="ex-detail-item">
                  <span className="ex-detail-lbl">Hub Owner</span>
                  <span className="ex-detail-val">Anand Sharma</span>
                </div>
                <div className="ex-detail-item">
                  <span className="ex-detail-lbl">Active Period</span>
                  <span className="ex-detail-val">Owner since Jan 2024</span>
                </div>
                <div className="ex-detail-item">
                  <span className="ex-detail-lbl">Franchise Term</span>
                  <span className="ex-detail-val">3 Years (Expires Dec 2026)</span>
                </div>
              </div>

              {/* MTD Expenses Donut breakdown */}
              <div className="ex-donut-card">
                <div className="ex-donut-svg">
                  <svg width="86" height="86" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2A195C" strokeWidth="3" strokeDasharray={`${rentPct} ${100 - rentPct}`} strokeDashoffset="25" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray={`${elecPct} ${100 - elecPct}`} strokeDashoffset={`${25 - rentPct}`} />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={`${staffPct} ${100 - staffPct}`} strokeDashoffset={`${25 - rentPct - elecPct}`} />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray={`${maintPct + miscPct} ${100 - maintPct - miscPct}`} strokeDashoffset={`${25 - rentPct - elecPct - staffPct}`} />
                  </svg>
                  <div className="ex-donut-val">
                    <div>MTD</div>
                    <div style={{ fontSize: '10px', fontWeight: 600 }}>₹{(totalSum / 1000).toFixed(0)}k</div>
                  </div>
                </div>
                <div className="ex-donut-info">
                  <div className="ex-donut-item">
                    <span className="ex-donut-lbl-wrap">
                      <span className="ex-donut-dot" style={{ background: '#2A195C' }}></span>
                      <span>Rent ({rentPct}%)</span>
                    </span>
                    <span>₹{rentSum.toLocaleString()}</span>
                  </div>
                  <div className="ex-donut-item">
                    <span className="ex-donut-lbl-wrap">
                      <span className="ex-donut-dot" style={{ background: '#3B82F6' }}></span>
                      <span>Utilities ({elecPct}%)</span>
                    </span>
                    <span>₹{elecSum.toLocaleString()}</span>
                  </div>
                  <div className="ex-donut-item">
                    <span className="ex-donut-lbl-wrap">
                      <span className="ex-donut-dot" style={{ background: '#10B981' }}></span>
                      <span>Staff ({staffPct}%)</span>
                    </span>
                    <span>₹{staffSum.toLocaleString()}</span>
                  </div>
                  <div className="ex-donut-item">
                    <span className="ex-donut-lbl-wrap">
                      <span className="ex-donut-dot" style={{ background: '#F59E0B' }}></span>
                      <span>Ops & Misc ({maintPct + miscPct}%)</span>
                    </span>
                    <span>₹{(maintSum + miscSum).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI grid of Expense summary blocks (6 blocks) */}
            <div className="ex-stats-row">
              <div className="ex-stat-card">
                <span className="ex-stat-lbl">MTD Rent</span>
                <div className="ex-stat-val">₹{rentSum.toLocaleString()}</div>
                <span className="ex-stat-sub">Central Hub lease</span>
              </div>
              <div className="ex-stat-card">
                <span className="ex-stat-lbl">MTD Electricity</span>
                <div className="ex-stat-val">₹{elecSum.toLocaleString()}</div>
                <span className="ex-stat-sub">Swapping station grid</span>
              </div>
              <div className="ex-stat-card">
                <span className="ex-stat-lbl">MTD Staff Salaries</span>
                <div className="ex-stat-val">₹{staffSum.toLocaleString()}</div>
                <span className="ex-stat-sub">Hub operators & guard</span>
              </div>
              <div className="ex-stat-card">
                <span className="ex-stat-lbl">MTD Maintenance</span>
                <div className="ex-stat-val">₹{maintSum.toLocaleString()}</div>
                <span className="ex-stat-sub">AC & charger service</span>
              </div>
              <div className="ex-stat-card">
                <span className="ex-stat-lbl">MTD Miscellaneous</span>
                <div className="ex-stat-val">₹{miscSum.toLocaleString()}</div>
                <span className="ex-stat-sub">Office supplies & audit</span>
              </div>
              <div className="ex-stat-card" style={{ borderLeft: '3px solid #2A195C' }}>
                <span className="ex-stat-lbl" style={{ color: '#2A195C' }}>Total MTD Expenses</span>
                <div className="ex-stat-val" style={{ color: '#2A195C' }}>₹{totalSum.toLocaleString()}</div>
                <span className="ex-stat-sub">
                  <span className="ex-stat-sub-green">100% accounted</span>
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="ex-filter-card">
              <div className="ex-filter-grid">
                <div className="ex-search-wrap">
                  <span className="ex-search-icon">🔍</span>
                  <input
                    type="text"
                    className="ex-search-input"
                    placeholder="Search expense, ID..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <select className="ex-select" value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">All Categories</option>
                  <option value="Rent">Rent</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Staff Salaries">Staff Salaries</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Misc">Misc</option>
                </select>
                <select className="ex-select" value={payMethodFilter} onChange={(e) => { setPayMethodFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">All Pay Methods</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                </select>
                <select className="ex-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <div style={{ color: '#64748B', fontSize: '12px', fontWeight: 600 }}>
                  {filteredExpenses.length} entries
                </div>
                <button className="ex-reset-btn" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="ex-tcard">
              <table className="ex-dt">
                <thead>
                  <tr>
                    <th>Expense ID</th>
                    <th>Details</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                        No expenses logged matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedExpenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="td-id" onClick={() => alert(`Expense Voucher:\nID: ${exp.id}\nDetails: ${exp.name}\nAmount: ₹${exp.amount}`)}>
                          {exp.id}
                        </td>
                        <td style={{ fontWeight: 600 }}>{exp.name}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#475569', fontSize: '12.5px' }}>{exp.category}</span>
                        </td>
                        <td style={{ fontWeight: 800, color: '#0F172A' }}>₹{exp.amount.toLocaleString()}</td>
                        <td>{exp.date}</td>
                        <td style={{ fontWeight: 600 }}>{exp.payMethod}</td>
                        <td>
                          <span className={`status-badge ${exp.status === 'Approved' ? 'badge-approved' : exp.status === 'Pending Approval' ? 'badge-pending' : 'badge-rejected'}`}>
                            {exp.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-row" style={{ justifyContent: 'center' }}>
                            <button className="action-btn" title="View Voucher" onClick={() => alert(`Voucher details for ${exp.id}:\nItem: ${exp.name}\nAmt: ₹${exp.amount}\nCategory: ${exp.category}\nDate: ${exp.date}\nPayment: ${exp.payMethod}`)}>👁</button>
                            <button className="action-btn" title="Toggle Approval Status" onClick={() => {
                              const newStatus = exp.status === 'Approved' ? 'Pending Approval' : 'Approved';
                              const updated = expenses.map(e => e.id === exp.id ? { ...e, status: newStatus as any } : e);
                              setExpenses(updated);
                              triggerToast(`Approval status of ${exp.id} is now ${newStatus}`);
                            }}>🔄</button>
                            <button className="action-btn" title="Delete Voucher" onClick={() => {
                              if (confirm(`Delete voucher ${exp.id}?`)) {
                                const updated = expenses.filter(e => e.id !== exp.id);
                                setExpenses(updated);
                                triggerToast(`Voucher ${exp.id} deleted.`);
                              }
                            }}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Table Footer / Pagination */}
              <div className="ex-tcard-ft">
                <span>
                  Showing {(currentPage - 1) * 5 + 1} to {Math.min(currentPage * 5, filteredExpenses.length)} of {filteredExpenses.length} entries
                </span>
                <div className="ex-pg">
                  <button className="ex-pgb" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>&lt;</button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} className={`ex-pgb ${currentPage === i + 1 ? 'cur' : ''}`} onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  ))}
                  <button className="ex-pgb" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>&gt;</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {modalOpen && (
        <div className="ex-modal-overlay">
          <div className="ex-modal-box">
            <div className="ex-modal-hdr">
              <h3 className="ex-modal-tit">Log Hub Expense</h3>
              <button className="ex-modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="ex-modal-body">
              <div className="ex-form-group">
                <label className="ex-form-lbl">Expense Description / Name</label>
                <input type="text" className="ex-form-inp" placeholder="e.g. Manjalpur rent, Staff snacks" value={newExpName} onChange={(e) => setNewExpName(e.target.value)} />
              </div>
              <div className="ex-form-group">
                <label className="ex-form-lbl">Category</label>
                <select className="ex-select" style={{ width: '100%' }} value={newExpCat} onChange={(e) => setNewExpCat(e.target.value as any)}>
                  <option value="Rent">Rent</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Staff Salaries">Staff Salaries</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Misc">Misc</option>
                </select>
              </div>
              <div className="ex-form-group">
                <label className="ex-form-lbl">Voucher Amount (₹)</label>
                <input type="number" className="ex-form-inp" placeholder="e.g. 5000" value={newExpAmount} onChange={(e) => setNewExpAmount(e.target.value)} />
              </div>
              <div className="ex-form-group">
                <label className="ex-form-lbl">Payment Method</label>
                <select className="ex-select" style={{ width: '100%' }} value={newExpPay} onChange={(e) => setNewExpPay(e.target.value as any)}>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>
            <div className="ex-modal-ft">
              <button className="ex-btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="ex-btn-primary" onClick={handleAddExpense}>Log Expense</button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="ex-toast ex-toast-green">
          <span>🔔</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}
