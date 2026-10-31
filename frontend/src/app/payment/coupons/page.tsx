"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);


// Icons
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconExport = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconArrowUp = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconPencil = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const IconDots = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const CSS = `
.cp-shell { display: flex; min-height: 100vh; background: #ffffff; font-family: 'Inter', sans-serif; }
.cp-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); background: #ffffff; }
.cp-page { padding: 24px 32px; display: flex; flex-direction: column; gap: 24px; }

/* Header */
.cp-header { display: flex; justify-content: space-between; align-items: center; }
.cp-header-left { display: flex; flex-direction: column; gap: 4px; }
.cp-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -0.02em; }
.cp-subtitle { font-size: 13px; color: #64748B; font-weight: 500; }
.cp-header-right { display: flex; gap: 12px; align-items: center; }

.cp-btn-export { border: 1.5px solid #E2E8F0; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569; background: #fff; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 8px; }
.cp-btn-export:hover { border-color: #2A195C; color: #2A195C; }

.cp-btn-create { background: #2A195C; border: 1.5px solid #2A195C; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 8px; }
.cp-btn-create:hover { background: #6D28D9; border-color: #6D28D9; }

/* Stats grid */
.cp-stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; }
.cp-stat-card { background: #fff; border: 1.5px solid #F1F5F9; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.cp-stat-icon-wrapper { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cp-stat-info { display: flex; flex-direction: column; gap: 2px; }
.cp-stat-lbl { font-size: 11.5px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
.cp-stat-val { font-size: 18px; font-weight: 800; color: #0F172A; }
.cp-stat-trend { font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 2px; margin-top: 2px; }
.cp-trend-up { color: #10B981; }
.cp-trend-down { color: #EF4444; }
.cp-trend-neutral { color: #64748B; }

/* Filter row */
.cp-filters-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 8px; }
.cp-search-box { display: flex; align-items: center; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; gap: 8px; background: #fff; width: 300px; }
.cp-search-input { border: none; outline: none; font-size: 13px; color: #1E293B; width: 100%; font-family: inherit; }
.cp-search-input::placeholder { color: #94A3B8; }

.cp-filters-right { display: flex; gap: 10px; align-items: center; }
.cp-select { border: 1.5px solid #E2E8F0; padding: 8px 12px; border-radius: 8px; font-size: 13px; color: #475569; background: #fff; outline: none; cursor: pointer; height: 37px; }
.cp-date-picker { display: flex; align-items: center; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; gap: 8px; background: #fff; cursor: pointer; height: 37px; font-size: 13px; color: #475569; }

.cp-btn-filters { border: 1.5px solid #E2E8F0; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569; background: #fff; cursor: pointer; display: flex; align-items: center; gap: 6px; height: 37px; }
.cp-btn-filters:hover { border-color: #2A195C; color: #2A195C; }
.cp-link-reset { font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer; margin-left: 8px; text-decoration: none; }
.cp-link-reset:hover { color: #2A195C; }

/* Table */
.cp-table-card { border: 1px solid #E2E8F0; border-radius: 12px; background: #fff; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.01); }
.cp-table-container { overflow-x: auto; }
.cp-table { width: 100%; border-collapse: collapse; }
.cp-table th { font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; padding: 12px 16px; border-bottom: 1.5px solid #E2E8F0; text-align: left; background: #FAFBFD; letter-spacing: 0.03em; }
.cp-table td { padding: 14px 16px; font-size: 13px; color: #1E293B; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.cp-table tr:last-child td { border-bottom: none; }
.cp-table tr:hover td { background: #FAFBFD; }

.cp-code-badge { font-family: monospace; font-size: 12.5px; font-weight: 700; color: #2A195C; background: #F5F3FF; border: 1px solid #E9D5FF; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: all 0.15s; display: inline-block; }
.cp-code-badge:hover { background: #EDE9FE; }

.cp-type-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: #334155; }
.cp-type-icon { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; }
.cp-type-icon.percentage { background: #F5F3FF; color: #2A195C; }
.cp-type-icon.flat { background: #ECFDF5; color: #10B981; }
.cp-type-icon.free { background: #EFF6FF; color: #3B82F6; }

.cp-progress-container { display: flex; align-items: center; gap: 8px; width: 130px; }
.cp-progress-bar-bg { flex: 1; height: 5px; background: #F1F5F9; border-radius: 2.5px; overflow: hidden; }
.cp-progress-bar-val { height: 100%; background: #2A195C; border-radius: 2.5px; }

.cp-badge-active { background: #ECFDF5; color: #16A34A; border: 1px solid #BBF7D0; padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 700; }
.cp-badge-expired { background: #FEE2E2; color: #DC2626; border: 1px solid #FECACA; padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 700; }
.cp-badge-utilized { background: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 700; }
.cp-badge-scheduled { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 700; }
.cp-badge-inactive { background: #F1F5F9; color: #64748B; border: 1px solid #E2E8F0; padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 700; }

.cp-actions-cell { display: flex; gap: 6px; align-items: center; }
.cp-action-btn { border: none; background: none; cursor: pointer; color: #64748B; padding: 6px; border-radius: 6px; transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center; }
.cp-action-btn:hover { background: #F1F5F9; color: #1E293B; }

/* Footer pagination */
.cp-footer { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-top: 1.5px solid #E2E8F0; background: #FAFBFD; font-size: 12.5px; color: #64748B; font-weight: 500; }
.cp-pagination { display: flex; gap: 6px; align-items: center; }
.cp-page-btn { width: 32px; height: 32px; border-radius: 6px; border: 1.5px solid #E2E8F0; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #475569; background: #fff; cursor: pointer; transition: all 0.15s; }
.cp-page-btn:hover { border-color: #2A195C; color: #2A195C; }
.cp-page-btn.active { background: #2A195C; border-color: #2A195C; color: #fff; }
`;

export default function CouponsListPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewCoupon, setViewCoupon] = useState<any | null>(null);

  const fetchCoupons = () => {
    setLoading(true);
    api.get('/coupons')
      .then(res => {
        if (res && res.status === 'success' && res.data) {
          setCoupons(res.data);
        }
      })
      .catch(err => console.error('Error fetching coupons:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDeleteCoupon = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete coupon code "${code}"?`)) {
      api.delete(`/coupons/${id}`)
        .then(res => {
          if (res && res.status === 'success') {
            alert('Coupon deleted successfully');
            fetchCoupons();
          }
        })
        .catch(err => {
          console.error(err);
          alert('Failed to delete coupon: ' + (err.message || err));
        });
    }
  };

  // Derived statistics
  const totalCouponsCount = coupons.length;
  const activeCouponsCount = coupons.filter(c => c.status === 'Active').length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (parseInt(c.current_usage || '0') || 0), 0);
  const totalDiscountGiven = coupons.reduce((sum, c) => sum + (parseFloat(c.current_usage || '0') * parseFloat(c.discount_value || '0')), 0);

  // Expiring Soon — coupons expiring within 7 days from now
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiringSoonCount = coupons.filter(c => {
    if (!c.end_date || c.status !== 'Active') return false;
    const end = new Date(c.end_date);
    return end >= now && end <= in7Days;
  }).length;

  // Filtered coupons list
  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase()) || 
                          (c.title || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || 
                        (typeFilter === 'percentage' && c.discount_type === 'Percentage') ||
                        (typeFilter === 'flat' && c.discount_type === 'Flat') ||
                        (typeFilter === 'free' && c.discount_type === 'Free Minutes');
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cp-shell">
        <Sidebar activePath="/payment/coupons" />
        <div className="cp-main">
          <TopBar
            hideZone={false}
            notificationCount={2}
          />
          <div className="cp-page">
            
            {/* Header row */}
            <div className="cp-header">
              <div className="cp-header-left">
                <h1 className="cp-h1">Coupons</h1>
                <span className="cp-subtitle">Create, manage and track discount coupons for your franchise.</span>
              </div>
              <div className="cp-header-right">
                <button className="cp-btn-export" onClick={() => alert('Exporting coupons data...')}>
                  <IconExport />
                  Export
                </button>
                <button className="cp-btn-create" onClick={() => router.push('/payment/coupons/create')}>
                  <IconPlus />
                  Create Coupon
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="cp-stats-grid">
              
              {/* Stat 1 */}
              <div className="cp-stat-card">
                <div className="cp-stat-icon-wrapper" style={{ background: '#F5F3FF', color: '#2A195C' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <circle cx="8" cy="15" r="1" />
                    <circle cx="16" cy="15" r="1" />
                  </svg>
                </div>
                <div className="cp-stat-info">
                  <span className="cp-stat-lbl">Total Coupons</span>
                  <span className="cp-stat-val">{totalCouponsCount}</span>
                  <span className="cp-stat-trend cp-trend-up">
                    <IconArrowUp />
                    +4 vs last month
                  </span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="cp-stat-card">
                <div className="cp-stat-icon-wrapper" style={{ background: '#E8FDF5', color: '#10B981' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="cp-stat-info">
                  <span className="cp-stat-lbl">Active Coupons</span>
                  <span className="cp-stat-val">{activeCouponsCount}</span>
                  <span className="cp-stat-trend cp-trend-up">
                    <IconArrowUp />
                    +2 vs last month
                  </span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="cp-stat-card">
                <div className="cp-stat-icon-wrapper" style={{ background: '#FFF7ED', color: '#F97316' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div className="cp-stat-info">
                  <span className="cp-stat-lbl">Total Redemptions</span>
                  <span className="cp-stat-val">{totalRedemptions}</span>
                  <span className="cp-stat-trend cp-trend-up">
                    <IconArrowUp />
                    {totalRedemptions > 0 ? `${totalRedemptions} total claims` : 'No redemptions yet'}
                  </span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="cp-stat-card">
                <div className="cp-stat-icon-wrapper" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                  <span style={{ fontSize: '18px', fontWeight: '800' }}>₹</span>
                </div>
                <div className="cp-stat-info">
                  <span className="cp-stat-lbl">Total Discount Given</span>
                  <span className="cp-stat-val">₹{totalDiscountGiven.toLocaleString()}</span>
                  <span className="cp-stat-trend cp-trend-up">
                    <IconArrowUp />
                    +15.7% vs last month
                  </span>
                </div>
              </div>

              {/* Stat 5 */}
              <div className="cp-stat-card">
                <div className="cp-stat-icon-wrapper" style={{ background: '#FFF1F2', color: '#F43F5E' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="cp-stat-info">
                  <span className="cp-stat-lbl">Expiring Soon</span>
                  <span className="cp-stat-val">{expiringSoonCount}</span>
                  <span className="cp-stat-trend" style={{ color: '#F43F5E' }}>
                    In next 7 days
                  </span>
                </div>
              </div>

            </div>

            {/* Filter row */}
            <div className="cp-filters-row">
              <div className="cp-search-box">
                <IconSearch />
                <input type="text" className="cp-search-input" placeholder="Search by coupon code or name..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="cp-filters-right">
                <select className="cp-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="utilized">Utilized</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select className="cp-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Discount</option>
                  <option value="free">Free Minutes</option>
                </select>
                <div className="cp-date-picker" onClick={() => alert('Calendar selection popover')}>
                  <IconCalendar />
                  <span>Select Date Range</span>
                </div>
                <button className="cp-btn-filters" onClick={() => alert('Detailed filters pane')}>
                  <IconFilter />
                  Filters
                </button>
                <a className="cp-link-reset" onClick={() => { setSearch(''); setStatusFilter('all'); setTypeFilter('all'); }}>Reset</a>
              </div>
            </div>

            {/* Table block */}
            <div className="cp-table-card">
              <div className="cp-table-container">
                <table className="cp-table">
                  <thead>
                    <tr>
                      <th style={{ width: '135px' }}>Coupon Code</th>
                      <th>Details</th>
                      <th style={{ width: '150px' }}>Type</th>
                      <th style={{ width: '150px' }}>Discount</th>
                      <th style={{ width: '180px' }}>Usage</th>
                      <th style={{ width: '220px' }}>Validity</th>
                      <th style={{ width: '110px' }}>Status</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.map((c) => {
                      const row = {
                        id: c.id,
                        code: c.code,
                        title: c.title,
                        date: `Created on ${new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
                        type: c.discount_type,
                        typeClass: c.discount_type === 'Percentage' ? 'percentage' : (c.discount_type === 'Free Minutes' ? 'free' : 'flat'),
                        typeSym: c.discount_type === 'Percentage' ? '%' : (c.discount_type === 'Free Minutes' ? '🕒' : '🎟️'),
                        discount: c.discount_type === 'Percentage' ? `${parseFloat(c.discount_value)}%` : (c.discount_type === 'Free Minutes' ? `${parseFloat(c.discount_value)} mins` : `₹${parseFloat(c.discount_value)}`),
                        discSub: parseFloat(c.min_order) > 0 ? `Min. order ₹${parseFloat(c.min_order)}` : 'No minimum order',
                        current: c.current_usage || 0,
                        max: c.redemption_limit || 100,
                        percent: Math.min(100, Math.round(((c.current_usage || 0) / (c.redemption_limit || 100)) * 100)),
                        validity: `${new Date(c.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${c.end_date ? new Date(c.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}`,
                        status: c.status
                      };
                      return (
                        <tr key={row.id}>
                          <td>
                            <span className="cp-code-badge" onClick={() => router.push(`/payment/coupons/create?id=${row.id}`)}>
                              {row.code}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>{row.title}</span>
                              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>{row.date}</span>
                            </div>
                          </td>
                          <td>
                            <div className="cp-type-badge">
                              <span className={`cp-type-icon ${row.typeClass}`}>
                                {row.typeSym}
                              </span>
                              <span>{row.type}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontWeight: 700, color: '#1E293B' }}>{row.discount}</span>
                              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{row.discSub}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div className="cp-progress-container">
                                <div className="cp-progress-bar-bg">
                                  <div className="cp-progress-bar-val" style={{ width: `${row.percent}%`, background: row.percent === 100 ? '#2A195C' : undefined }}></div>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', minWidth: '28px', textAlign: 'right' }}>{row.percent}%</span>
                              </div>
                              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{row.current} / {row.max} used</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 500, color: '#475569' }}>
                              <IconCalendar />
                              <span>{row.validity}</span>
                            </div>
                          </td>
                          <td>
                            {row.status === 'Active' && <span className="cp-badge-active">Active</span>}
                            {row.status === 'Expired' && <span className="cp-badge-expired">Expired</span>}
                            {row.status === 'Utilized' && <span className="cp-badge-utilized">Utilized</span>}
                            {row.status === 'Scheduled' && <span className="cp-badge-scheduled">Scheduled</span>}
                            {row.status === 'Inactive' && <span className="cp-badge-inactive">Inactive</span>}
                          </td>
                          <td>
                            <div className="cp-actions-cell">
                              <button className="cp-action-btn" title="View details" onClick={() => setViewCoupon(c)}>
                                <IconEye />
                              </button>
                              <button className="cp-action-btn" title="Edit coupon" onClick={() => router.push(`/payment/coupons/create?id=${row.id}`)}>
                                <IconPencil />
                              </button>
                              <button className="cp-action-btn" title="Delete coupon" style={{ color: '#EF4444' }} onClick={() => handleDeleteCoupon(row.id, row.code)}>
                                <IconTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer / Pagination */}
              <div className="cp-footer">
                <span>Showing 1 to {filteredCoupons.length} of {filteredCoupons.length} coupons</span>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <select className="cp-select" style={{ height: '32px', padding: '0 8px', fontSize: '12px' }} defaultValue="10">
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                  </select>
                  <div className="cp-pagination">
                    <button className="cp-page-btn">&lt;</button>
                    <button className="cp-page-btn active">1</button>
                    <button className="cp-page-btn">2</button>
                    <button className="cp-page-btn">3</button>
                    <button className="cp-page-btn">&gt;</button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* VIEW COUPON DETAIL MODAL */}
      {viewCoupon && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '90vh' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Coupon Details</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Full information for this coupon</div>
              </div>
              <button onClick={() => setViewCoupon(null)} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#94A3B8', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {([
                ['Coupon Code', <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2A195C', background: '#F5F3FF', padding: '2px 8px', borderRadius: '5px' }}>{viewCoupon.code}</span>],
                ['Title', viewCoupon.title],
                ['Description', viewCoupon.description || '—'],
                ['Discount Type', viewCoupon.discount_type],
                ['Discount Value', viewCoupon.discount_type === 'Percentage' ? `${viewCoupon.discount_value}%` : viewCoupon.discount_type === 'Free Minutes' ? `${viewCoupon.discount_value} mins` : `₹${viewCoupon.discount_value}`],
                ['Minimum Order', parseFloat(viewCoupon.min_order) > 0 ? `₹${viewCoupon.min_order}` : 'No minimum'],
                ['Redemption Limit', `${viewCoupon.current_usage || 0} used / ${viewCoupon.redemption_limit} total`],
                ['Per User Limit', viewCoupon.per_user_limit],
                ['Valid From', viewCoupon.start_date ? new Date(viewCoupon.start_date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'],
                ['Valid Until', viewCoupon.end_date ? new Date(viewCoupon.end_date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No Expiry'],
                ['Applicable On', viewCoupon.applicable_on || 'All Rentals'],
                ['Zones', Array.isArray(viewCoupon.selected_zones) && viewCoupon.selected_zones.length > 0 ? viewCoupon.selected_zones.join(', ') : 'All Zones'],
                ['Status', <span className={viewCoupon.status === 'Active' ? 'cp-badge-active' : viewCoupon.status === 'Expired' ? 'cp-badge-expired' : 'cp-badge-scheduled'}>{viewCoupon.status}</span>],
                ['Created On', viewCoupon.created_at ? new Date(viewCoupon.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'],
              ] as [string, React.ReactNode][]).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '13px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>{key}</span>
                  <span style={{ fontWeight: 700, color: '#0F172A', textAlign: 'right', maxWidth: '260px', wordBreak: 'break-word' }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#F8FAFC' }}>
              <button onClick={() => setViewCoupon(null)} style={{ border: '1.5px solid #E2E8F0', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', background: '#fff', cursor: 'pointer' }}>Close</button>
              <button onClick={() => { setViewCoupon(null); router.push(`/payment/coupons/create?id=${viewCoupon.id}`); }} style={{ background: '#2A195C', border: '1.5px solid #2A195C', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Edit Coupon</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
