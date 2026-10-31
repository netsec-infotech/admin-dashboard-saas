"use client";
import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

const CSS = `
.rh-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.rh-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.rh-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; background-color: #FFF; }

/* Header title */
.rh-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 4px; }
.rh-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 6px; letter-spacing: -0.02em; }
.rh-sub { font-size: 13.5px; color: #64748B; margin: 0; font-weight: 400; }

.rh-actions { display: flex; align-items: center; gap: 10px; }
.rh-btn { display: flex; align-items: center; gap: 7px; padding: 9px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; }
.rh-btn:hover { border-color: #2a195c; color: #2a195c; }
.rh-btn-primary { background: #2a195c; color: #fff; border-color: #2a195c; }
.rh-btn-primary:hover { background: #4338CA; border-color: #4338CA; color: #fff; }
.rh-btn-danger { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }
.rh-btn-danger:hover { background: #FEE2E2; border-color: #DC2626; color: #B91C1C; }
.rh-checkbox { width: 16px; height: 16px; border-radius: 4px; accent-color: #2A195C; cursor: pointer; }
.action-delete-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; border: 1.5px solid #FECACA; background: #FEF2F2; color: #DC2626; cursor: pointer; transition: all .15s; }
.action-delete-btn:hover { background: #DC2626; color: #fff; border-color: #DC2626; }


/* KPI Cards Grid */
.rh-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.rh-kpi-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,.02);
  transition: all .15s;
}
.rh-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
  border-color: #CBD5E1;
}

.rh-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2px; }
.rh-kpi-label { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.03em; }
.rh-kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rh-kpi-val { font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1; margin: 8px 0 4px; font-family: 'Outfit', sans-serif; }
.rh-kpi-sub { font-size: 10.5px; color: #64748B; margin-top: 10px; font-weight: 600; display: flex; align-items: center; gap: 6px; }

.ic-purple { background: #EEF2FF; color: #6366F1; }
.ic-green { background: #ECFDF5; color: #10B981; }
.ic-orange { background: #FFF7ED; color: #F97316; }
.ic-blue { background: #EFF6FF; color: #2563EB; }

/* Tabs bar */
.rh-tabs { display: flex; border-bottom: 1.5px solid #E2E8F0; gap: 28px; margin-bottom: 4px; }
.rh-tab { padding: 12px 8px; font-size: 14px; font-weight: 700; color: #64748B; cursor: pointer; border-bottom: 3px solid transparent; transition: all .15s; margin-bottom: -1.5px; display: flex; align-items: center; gap: 8px; }
.rh-tab:hover { color: #2a195c; }
.rh-tab.active { color: #2a195c; border-bottom-color: #2a195c; }
.rh-tab-badge { font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 800; }

/* Filter bar panel */
.rh-filter-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.rh-filter-grid { display: grid; grid-template-columns: 2fr 1.25fr auto; gap: 12px; align-items: center; }
.rh-search-wrap { position: relative; }
.rh-search-input { width: 100%; padding: 10px 12px 10px 38px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; outline: none; transition: border-color .15s; background: #FFF; color: #1E293B; }
.rh-search-input:focus { border-color: #2a195c; background: #fff; }
.rh-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94A3B8; display: flex; align-items: center; }

.rh-select { width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 500; outline: none; background: #fff; color: #334155; cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; background-size: 12px; padding-right: 36px; }
.rh-select:focus { border-color: #2a195c; }

.rh-filter-btn { display: flex; align-items: center; gap: 7px; padding: 10px 16px; background: #FFF; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; transition: all .15s; }
.rh-filter-btn:hover { background: #FAF5FF; border-color: #2a195c; color: #2a195c; }

/* Table styling */
.rh-tcard { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; display: flex; flex-direction: column; }
.rh-dt-wrap { overflow-x: auto; }
.rh-dt { width: 100%; border-collapse: collapse; min-width: 1000px; }
.rh-dt th { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .06em; text-align: left; padding: 14px 18px; background: #FFF; border-bottom: 1.5px solid #E2E8F0; }
.rh-dt td { padding: 14px 18px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.rh-dt tr:last-child td { border-bottom: none; }
.rh-dt tr:hover td { background: #FAF8FF; }

.rh-rider-cell { display: flex; align-items: center; gap: 12px; }
.rh-rider-avatar { width: 36px; height: 36px; border-radius: 50%; background: #2A195C; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; flex-shrink: 0; }
.rh-rider-info { display: flex; flex-direction: column; }
.rh-rider-name { font-size: 13.5px; font-weight: 700; color: #1E293B; }
.rh-rider-code { font-size: 11.5px; color: #64748B; font-weight: 600; text-transform: uppercase; margin-top: 1px; }

.rh-tx-code { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 12px; font-weight: 700; color: #1E293B; }
.rh-ref-code { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 12.5px; font-weight: 600; color: #64748B; }

.rh-amount { font-weight: 800; font-size: 14px; color: #15803D; }
.rh-amount.deducted { color: #DC2626; }

.status-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; border: 1.5px solid transparent; }
.badge-successful { background: #DCFCE7; color: #15803D; border-color: #BBF7D0; }
.badge-pending { background: #FEF3C7; color: #B45309; border-color: #FDE68A; }
.badge-no-damage { background: #DCFCE7; color: #15803D; border-color: #BBF7D0; }
.badge-damage { background: #FEE2E2; color: #B91C1C; border-color: #FECACA; }

.action-process-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: #2a195c; border: 1.5px solid #2a195c; border-radius: 8px; font-size: 12px; font-weight: 700; color: #fff; cursor: pointer; transition: all .15s; }
.action-process-btn:hover { background: #4338CA; border-color: #4338CA; }

/* Modal overlay styling */
.rh-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.rh-modal-card { background: #fff; border-radius: 16px; width: 480px; max-width: 95vw; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); display: flex; flex-direction: column; overflow: hidden; animation: modalSlide .2s ease-out; }
.rh-modal-hdr { padding: 18px 20px; border-bottom: 1.5px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between; }
.rh-modal-title { font-size: 16px; font-weight: 800; color: #0F172A; }
.rh-modal-close { background: none; border: none; cursor: pointer; color: #94A3B8; display: flex; transition: color .15s; }
.rh-modal-close:hover { color: #475569; }
.rh-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; max-height: 80vh; overflow-y: auto; }
.rh-modal-ft { padding: 16px 20px; background: #FFF; border-top: 1.5px solid #F1F5F9; display: flex; justify-content: flex-end; gap: 8px; }

.modal-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.modal-lbl { color: #64748B; font-weight: 500; font-size: 12.5px; }
.modal-val { font-weight: 700; color: #0F172A; }

.modal-input-wrap { display: flex; flex-direction: column; gap: 6px; }
.modal-input { padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13.5px; outline: none; transition: border-color .15s; font-weight: 700; color: #0F172A; }
.modal-input:focus { border-color: #2a195c; }

@keyframes modalSlide {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
`;

interface PendingRefund {
  id: string;
  reservation_id: string;
  rider: { name: string; code: string; avatar: string };
  mobile: string;
  vehicle: string;
  returnDate: string;
  bookingDate?: string;
  deposit: number;
  condition: string;
  conditionDetail?: string;
  deductions: number;
  refundAmount: number;
  deposit_status: string;
  notes?: string;
  is_returned?: boolean;
  can_refund?: boolean;
  ride_status?: string;
}

interface CompletedRefund {
  id: string;
  reservation_id: string;
  rider: { name: string; code: string; avatar: string };
  mobile: string;
  vehicle: string;
  refundDate: string;
  txId: string;
  deposit: number;
  deductions: number;
  refundAmount: number;
  method: string;
  status: string;
  returnCondition?: string;
}

interface KPIData {
  total_held: number;
  pending_refunds_count: number;
  pending_refunds_amount: number;
  total_refunded_amount: number;
  total_deductions_amount: number;
}

export default function DepositRefundPage() {
  const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // KPIs State
  const [kpis, setKpis] = useState<KPIData>({
    total_held: 0,
    pending_refunds_count: 0,
    pending_refunds_amount: 0,
    total_refunded_amount: 0,
    total_deductions_amount: 0
  });

  // Lists State
  const [pendingRefunds, setPendingRefunds] = useState<PendingRefund[]>([]);
  const [completedRefunds, setCompletedRefunds] = useState<CompletedRefund[]>([]);

  // Modal State
  const [selectedPending, setSelectedPending] = useState<PendingRefund | null>(null);
  const [damageDeductions, setDamageDeductions] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState('PayU');
  const [upiId, setUpiId] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch live deposits data from backend
  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/reservations/deposits');
      if (res && res.status === 'success') {
        if (res.kpis) setKpis(res.kpis);
        if (res.data) {
          setPendingRefunds(res.data.pending || []);
          setCompletedRefunds(res.data.completed || []);
        }
      }
    } catch (e) {
      console.error('Failed to fetch deposits data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const openRefundModal = (r: PendingRefund) => {
    setSelectedPending(r);
    setDamageDeductions(r.deductions || 0);
    setUpiId(r.mobile ? `${r.mobile.replace(/\D/g, '').slice(-10)}@upi` : '');
    setRefundNotes(r.notes || '');
  };

  const closeRefundModal = () => {
    setSelectedPending(null);
  };

  // Security Verification Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [authOtp, setAuthOtp] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [authVerifying, setAuthVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [maskedAuthMobile, setMaskedAuthMobile] = useState('81******72');

  // Trigger OTP dispatch to configured authorized phone number
  const handleSendAuthOtp = async () => {
    setOtpSending(true);
    setAuthError(null);
    try {
      const res: any = await api.post('/settings/refund-auth/send-otp', {});
      if (res && res.status === 'success') {
        setOtpSent(true);
        if (res.mobile) setMaskedAuthMobile(res.mobile);
      } else {
        setAuthError(res?.message || 'Failed to send OTP.');
      }
    } catch (e: any) {
      setAuthError(e.response?.data?.message || e.message || 'Error sending OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  // Open auth modal when clicking Confirm & Process Refund
  const handleInitiateRefund = () => {
    setAuthError(null);
    setAuthOtp('');
    setAuthPassword('');
    setOtpSent(false);
    setShowAuthModal(true);
  };

  // Verify OTP or Master Password then proceed with refund
  const handleVerifyAuthAndProceed = async () => {
    setAuthError(null);
    setAuthVerifying(true);
    try {
      const res: any = await api.post('/settings/refund-auth/verify', {
        method: authMethod,
        otp: authOtp,
        password: authPassword
      });

      if (res && res.status === 'success' && res.verified) {
        setShowAuthModal(false);
        await executeActualRefund(res.token);
      } else {
        setAuthError(res?.message || 'Verification failed. Please check credentials.');
      }
    } catch (e: any) {
      setAuthError(e.response?.data?.message || e.message || 'Authorization failed.');
    } finally {
      setAuthVerifying(false);
    }
  };

  // Process live refund via backend API after security authorization
  const executeActualRefund = async (authToken?: string) => {
    if (!selectedPending) return;
    setProcessing(true);

    const netRefundAmount = Math.max(0, selectedPending.deposit - damageDeductions);

    try {
      const res: any = await api.post(`/reservations/${selectedPending.id}/refund-deposit`, {
        refund_amount: netRefundAmount,
        deductions: damageDeductions,
        refund_mode: refundMethod,
        upi_id: upiId,
        notes: refundNotes,
        auth_token: authToken
      });

      if (res && res.status === 'success') {
        setActionSuccess(`✓ Security Deposit of ₹${netRefundAmount} successfully authorized and refunded! Request ID: ${res.data?.tx_id || 'REF-DONE'}`);
        closeRefundModal();
        await fetchDeposits();
        setTimeout(() => setActionSuccess(null), 6000);
      } else {
        alert(res?.message || 'PayU Gateway Refund could not be completed.');
      }
    } catch (err: any) {
      console.error('Refund processing error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'PayU Gateway rejected the refund request.';
      alert(`⚠️ Refund Processing Error:\n\n${serverMsg}`);
    } finally {
      setProcessing(false);
    }
  };

  // Filter pending
  const filteredPending = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pendingRefunds;
    return pendingRefunds.filter(r =>
      (r.rider.name || '').toLowerCase().includes(q) ||
      (r.rider.code || '').toLowerCase().includes(q) ||
      (r.mobile || '').includes(q) ||
      (r.vehicle || '').toLowerCase().includes(q)
    );
  }, [pendingRefunds, search]);

  // Filter completed
  const filteredCompleted = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return completedRefunds;
    return completedRefunds.filter(r =>
      (r.rider.name || '').toLowerCase().includes(q) ||
      (r.rider.code || '').toLowerCase().includes(q) ||
      (r.mobile || '').includes(q) ||
      (r.txId || '').toLowerCase().includes(q)
    );
  }, [completedRefunds, search]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  const activeList = activeTab === 'Pending' ? filteredPending : filteredCompleted;
  const isAllSelected = activeList.length > 0 && activeList.every(r => selectedIds.includes(String(r.id)));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeList.map(r => String(r.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete / dismiss ${selectedIds.length} selected deposit record(s)?`)) return;
    try {
      setIsDeleting(true);
      await api.delete('/reservations/deposits', { data: { ids: selectedIds } });
      setSelectedIds([]);
      await fetchDeposits();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete deposit records');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSingleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete / dismiss this deposit record?')) return;
    try {
      setIsDeleting(true);
      await api.delete(`/reservations/deposits/${id}`);
      setSelectedIds(prev => prev.filter(item => item !== id));
      await fetchDeposits();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete deposit record');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rh-shell">
        <Sidebar activePath="/payment/refund" />
        <div className="rh-main">
          <TopBar />
          
          <div className="rh-page">
            {/* Header */}
            <div className="rh-title-row">
              <div>
                <h1 className="rh-h1">Deposit &amp; Refund Management</h1>
                <p className="rh-sub">Track active security deposits, inspect vehicle return condition, and refund deposits directly to riders via payment gateways.</p>
              </div>
              <div className="rh-actions">
                {selectedIds.length > 0 && (
                  <button 
                    className="rh-btn rh-btn-danger" 
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
                <button className="rh-btn ph-btn-primary" onClick={fetchDeposits}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* Success Notification Banner */}
            {actionSuccess && (
              <div style={{ background: '#DCFCE7', border: '1.5px solid #86EFAC', padding: '12px 18px', borderRadius: '12px', color: '#15803D', fontWeight: 700, fontSize: '13.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{actionSuccess}</span>
                <button onClick={() => setActionSuccess(null)} style={{ background: 'none', border: 'none', color: '#15803D', cursor: 'pointer', fontWeight: 800 }}>✕</button>
              </div>
            )}

            {/* KPI Cards Grid (Matches Renters/Vehicles UI) */}
            <div className="rh-kpi-grid">
              {/* 1. Active Deposits Held */}
              <div className="rh-kpi-card">
                <div className="rh-kpi-top">
                  <div>
                    <div className="rh-kpi-label">Active Deposits Held</div>
                    <div className="rh-kpi-val" style={{ color: '#0F172A' }}>
                      ₹{(kpis.total_held || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="rh-kpi-sub" style={{ color: '#10B981' }}>
                      ↑ Active rides pool
                    </div>
                  </div>
                  <div className="rh-kpi-icon ic-green">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 2. Pending Deposit Refunds */}
              <div className="rh-kpi-card">
                <div className="rh-kpi-top">
                  <div>
                    <div className="rh-kpi-label">Pending Deposit Refunds</div>
                    <div className="rh-kpi-val" style={{ color: '#0F172A' }}>
                      ₹{(kpis.pending_refunds_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="rh-kpi-sub" style={{ color: '#F97316' }}>
                      ↓ {kpis.pending_refunds_count} returned rides awaiting payout
                    </div>
                  </div>
                  <div className="rh-kpi-icon ic-orange">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 3. Total Deposits Refunded */}
              <div className="rh-kpi-card">
                <div className="rh-kpi-top">
                  <div>
                    <div className="rh-kpi-label">Total Deposits Refunded</div>
                    <div className="rh-kpi-val" style={{ color: '#0F172A' }}>
                      ₹{(kpis.total_refunded_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="rh-kpi-sub" style={{ color: '#6366F1' }}>
                      ↑ credited back to rider accounts
                    </div>
                  </div>
                  <div className="rh-kpi-icon ic-purple">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 4. Total Retained Deductions */}
              <div className="rh-kpi-card">
                <div className="rh-kpi-top">
                  <div>
                    <div className="rh-kpi-label">Retained Deductions</div>
                    <div className="rh-kpi-val" style={{ color: '#0F172A' }}>
                      ₹{(kpis.total_deductions_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="rh-kpi-sub" style={{ color: '#2563EB' }}>
                      damage repairs &amp; penalty fees
                    </div>
                  </div>
                  <div className="rh-kpi-icon ic-blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="rh-tabs">
              <div 
                className={`rh-tab ${activeTab === 'Pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('Pending')}
              >
                <span>Pending Refunds</span>
                <span className="rh-tab-badge" style={{ background: activeTab === 'Pending' ? '#2A195C' : '#E2E8F0', color: activeTab === 'Pending' ? '#fff' : '#64748B' }}>
                  {pendingRefunds.length}
                </span>
              </div>
              <div 
                className={`rh-tab ${activeTab === 'Completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('Completed')}
              >
                <span>Refunded History</span>
                <span className="rh-tab-badge" style={{ background: activeTab === 'Completed' ? '#2A195C' : '#E2E8F0', color: activeTab === 'Completed' ? '#fff' : '#64748B' }}>
                  {completedRefunds.length}
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="rh-filter-card">
              <div className="rh-filter-grid">
                <div className="rh-search-wrap">
                  <span className="rh-search-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="rh-search-input"
                    placeholder="Search by Rider Name, Mobile, Vehicle Number, Transaction ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                  Showing {activeTab === 'Pending' ? filteredPending.length : filteredCompleted.length} records
                </div>

                <button className="rh-filter-btn" onClick={() => setSearch('')}>
                  Clear Search
                </button>
              </div>
            </div>

            {/* Content Tab 1: Pending Refunds */}
            {activeTab === 'Pending' && (
              <div className="rh-tcard">
                <div className="rh-dt-wrap">
                  <table className="rh-dt">
                    <thead>
                      <tr>
                        <th style={{ width: 44, paddingLeft: 18, paddingRight: 8 }}>
                          <input 
                            type="checkbox" 
                            className="rh-checkbox"
                            checked={isAllSelected}
                            ref={el => { if (el) el.indeterminate = isSomeSelected; }}
                            onChange={toggleSelectAll}
                            title="Select / Deselect All"
                          />
                        </th>
                        <th>RIDER NAME</th>
                        <th>VEHICLE</th>
                        <th>RETURN DATE &amp; TIME</th>
                        <th>ORIGINAL DEPOSIT</th>
                        <th>INSPECTION CONDITION</th>
                        <th>DEDUCTIONS</th>
                        <th>NET REFUNDABLE</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                            <div>Loading pending deposit refunds...</div>
                          </td>
                        </tr>
                      ) : filteredPending.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1E293B' }}>No Pending Refunds!</div>
                            <div style={{ fontSize: '13px', marginTop: '4px' }}>All returned rides have been processed and refunded.</div>
                          </td>
                        </tr>
                      ) : (
                        filteredPending.map((r) => {
                          const netAmt = Math.max(0, r.deposit - (r.deductions || 0));
                          const isSelected = selectedIds.includes(String(r.id));
                          const initials = (r.rider.name || 'R').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                          return (
                            <tr key={r.id} style={{ background: isSelected ? '#FAF5FF' : undefined }}>
                              <td style={{ width: 44, paddingLeft: 18, paddingRight: 8 }}>
                                <input 
                                  type="checkbox" 
                                  className="rh-checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectOne(String(r.id))}
                                />
                              </td>

                              <td>
                                <div className="rh-rider-cell">
                                  <div className="rh-rider-avatar">{initials}</div>
                                  <div className="rh-rider-info">
                                    <span className="rh-rider-name">{r.rider.name}</span>
                                    <span className="rh-rider-code">{r.mobile || r.rider.code}</span>
                                  </div>
                                </div>
                              </td>

                              <td style={{ fontWeight: 700, color: '#1E293B' }}>{r.vehicle}</td>

                              <td style={{ fontSize: 12.5, color: '#475569', whiteSpace: 'nowrap' }}>
                                {r.returnDate
                                  ? new Date(r.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                  : (r.bookingDate ? `Booked: ${new Date(r.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : 'Ride in Progress')}
                              </td>

                              <td style={{ fontWeight: 700, color: '#1E293B' }}>
                                ₹{r.deposit.toLocaleString('en-IN')}
                              </td>

                              <td>
                                {r.can_refund ? (
                                  <span className={`status-badge ${r.condition === 'Damage Charged' ? 'badge-damage' : 'badge-no-damage'}`}>
                                    {r.condition}
                                  </span>
                                ) : (
                                  <span
                                    className="status-badge"
                                    style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
                                    title="Vehicle is currently in ride. Refund will be enabled once rider returns vehicle."
                                  >
                                    ● Vehicle In Ride
                                  </span>
                                )}
                              </td>

                              <td>
                                <span className={r.deductions > 0 ? 'rh-amount deducted' : 'rh-amount'} style={{ color: r.deductions > 0 ? '#DC2626' : '#64748B' }}>
                                  {r.deductions > 0 ? `-₹${r.deductions.toLocaleString('en-IN')}` : '₹0'}
                                </span>
                              </td>

                              <td>
                                <span className="rh-amount" style={{ color: '#15803D' }}>
                                  ₹{netAmt.toLocaleString('en-IN')}
                                </span>
                              </td>

                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {r.can_refund ? (
                                    <button 
                                      className="action-process-btn"
                                      onClick={() => openRefundModal(r)}
                                      title="Process refund to rider"
                                    >
                                      Process Refund ➔
                                    </button>
                                  ) : (
                                    <button 
                                      className="action-process-btn"
                                      disabled
                                      title="Refund button is disabled until the rider returns the vehicle"
                                      style={{
                                        background: '#F1F5F9',
                                        color: '#94A3B8',
                                        borderColor: '#CBD5E1',
                                        cursor: 'not-allowed',
                                        boxShadow: 'none',
                                        opacity: 0.85
                                      }}
                                    >
                                      🔒 Vehicle In Ride
                                    </button>
                                  )}
                                  <button
                                    className="action-delete-btn"
                                    title="Delete / Dismiss Deposit"
                                    onClick={() => handleSingleDelete(String(r.id))}
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
              </div>
            )}

            {/* Content Tab 2: Completed Refunds */}
            {activeTab === 'Completed' && (
              <div className="rh-tcard">
                <div className="rh-dt-wrap">
                  <table className="rh-dt">
                    <thead>
                      <tr>
                        <th style={{ width: 44, paddingLeft: 18, paddingRight: 8 }}>
                          <input 
                            type="checkbox" 
                            className="rh-checkbox"
                            checked={isAllSelected}
                            ref={el => { if (el) el.indeterminate = isSomeSelected; }}
                            onChange={toggleSelectAll}
                            title="Select / Deselect All"
                          />
                        </th>
                        <th>RIDER NAME</th>
                        <th>DATE &amp; TIME</th>
                        <th>REFUND TX ID</th>
                        <th>VEHICLE</th>
                        <th>ORIGINAL DEPOSIT</th>
                        <th>REFUNDED AMOUNT</th>
                        <th>PAYMENT METHOD</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                            <div>Loading refund history...</div>
                          </td>
                        </tr>
                      ) : filteredCompleted.length === 0 ? (
                        <tr>
                          <td colSpan={10} style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1E293B' }}>No Completed Refunds Yet</div>
                            <div style={{ fontSize: '13px', marginTop: '4px' }}>Processed refunds will automatically show up here.</div>
                          </td>
                        </tr>
                      ) : (
                        filteredCompleted.map((r) => {
                          const isSelected = selectedIds.includes(String(r.id || r.txId));
                          const initials = (r.rider.name || 'R').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                          return (
                            <tr key={r.id} style={{ background: isSelected ? '#FAF5FF' : undefined }}>
                              <td style={{ width: 44, paddingLeft: 18, paddingRight: 8 }}>
                                <input 
                                  type="checkbox" 
                                  className="rh-checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectOne(String(r.id))}
                                />
                              </td>

                              <td>
                                <div className="rh-rider-cell">
                                  <div className="rh-rider-avatar">{initials}</div>
                                  <div className="rh-rider-info">
                                    <span className="rh-rider-name">{r.rider.name}</span>
                                    <span className="rh-rider-code">{r.mobile || r.rider.code}</span>
                                  </div>
                                </div>
                              </td>

                              <td style={{ fontSize: 12.5, color: '#475569', whiteSpace: 'nowrap' }}>
                                {r.refundDate ? new Date(r.refundDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Completed'}
                              </td>

                              <td>
                                <span className="rh-tx-code">{r.txId}</span>
                              </td>

                              <td style={{ fontWeight: 700, color: '#1E293B' }}>{r.vehicle}</td>

                              <td style={{ fontWeight: 700, color: '#64748B' }}>
                                ₹{r.deposit.toLocaleString('en-IN')}
                              </td>

                              <td>
                                <span className="rh-amount" style={{ color: '#15803D' }}>
                                  ₹{r.refundAmount.toLocaleString('en-IN')}
                                </span>
                              </td>

                              <td>
                                <span style={{ padding: '4px 10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                                  {r.method}
                                </span>
                              </td>

                              <td>
                                <span className="status-badge badge-successful">
                                  Successful
                                </span>
                              </td>

                              <td>
                                <button
                                  className="action-delete-btn"
                                  title="Delete / Dismiss Record"
                                  onClick={() => handleSingleDelete(String(r.id))}
                                  disabled={isDeleting}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Process Refund Modal */}
      {selectedPending && (
        <div className="rh-modal-overlay">
          <div className="rh-modal-card">
            <div className="rh-modal-hdr">
              <span className="rh-modal-title">Process Security Deposit Refund</span>
              <button className="rh-modal-close" onClick={closeRefundModal}>
                ✕
              </button>
            </div>
            
            <div className="rh-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div className="rh-rider-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                  {(selectedPending.rider.name || 'R').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A' }}>{selectedPending.rider.name}</span>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Mobile: {selectedPending.mobile || selectedPending.rider.code}</span>
                </div>
              </div>

              <div className="modal-row">
                <span className="modal-lbl">Vehicle Returned</span>
                <span className="modal-val">{selectedPending.vehicle}</span>
              </div>
              <div className="modal-row">
                <span className="modal-lbl">Inspection Condition</span>
                <span className={`status-badge ${selectedPending.condition === 'Damage Charged' ? 'badge-damage' : 'badge-no-damage'}`}>
                  {selectedPending.conditionDetail || selectedPending.condition}
                </span>
              </div>

              <div style={{ borderTop: '1px dashed #E2E8F0', margin: '4px 0' }} />

              <div className="modal-row">
                <span className="modal-lbl">Original Security Deposit</span>
                <span className="modal-val" style={{ fontSize: '15px', color: '#1E293B' }}>₹{selectedPending.deposit}</span>
              </div>

              <div className="modal-input-wrap">
                <label className="modal-lbl">Damage / Penalties / Deductions (₹)</label>
                <input 
                  type="number" 
                  className="modal-input" 
                  value={damageDeductions}
                  onChange={(e) => setDamageDeductions(Math.max(0, Number(e.target.value)))}
                  min={0}
                  max={selectedPending.deposit}
                />
              </div>

              <div className="modal-input-wrap">
                <label className="modal-lbl">Refund Payment Gateway</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#1E293B'
                }}>
                  <span style={{
                    background: '#528900',
                    color: '#FFF',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>PayU</span>
                  <span>PayU(Live Refund Flow)</span>
                </div>
              </div>

              <div className="modal-input-wrap">
                <label className="modal-lbl">Rider VPA / UPI ID or Bank Details</label>
                <input 
                  type="text" 
                  className="modal-input" 
                  placeholder="e.g. mobile@upi or 9825544332@icici"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>

              <div className="modal-input-wrap">
                <label className="modal-lbl">Remarks / Inspection Notes (Optional)</label>
                <input 
                  type="text" 
                  className="modal-input" 
                  placeholder="e.g. Returned with clean battery & charger"
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                />
              </div>

              <div style={{ background: '#ECFDF5', border: '1.5px solid #86EFAC', padding: '14px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#065F46' }}>Net Refund to Rider</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#065F46' }}>
                  ₹{Math.max(0, selectedPending.deposit - damageDeductions).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="rh-modal-ft">
              <button className="rh-btn" onClick={closeRefundModal} disabled={processing}>Cancel</button>
              <button 
                className="rh-btn rh-btn-primary" 
                onClick={handleInitiateRefund}
                disabled={processing || damageDeductions > selectedPending.deposit || damageDeductions < 0}
              >
                {processing ? 'Processing Gateway Refund...' : 'Confirm & Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Verification Popup (OTP or Master Password) */}
      {showAuthModal && (
        <div className="rh-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="rh-modal-card" style={{ width: 440, border: '2px solid #2A195C' }}>
            <div className="rh-modal-hdr" style={{ background: '#2A195C', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🔐</span>
                <span className="rh-modal-title" style={{ color: '#fff', fontSize: '15px' }}>
                  Refund Security Authorization
                </span>
              </div>
              <button className="rh-modal-close" onClick={() => setShowAuthModal(false)} style={{ color: '#E0E7FF' }}>✕</button>
            </div>

            <div className="rh-modal-body" style={{ gap: '16px' }}>
              <div style={{ fontSize: '12.5px', color: '#64748B', lineHeight: '1.4' }}>
                Super Admin security authorization is required to disburse the deposit refund of <strong>₹{selectedPending ? Math.max(0, selectedPending.deposit - damageDeductions).toLocaleString('en-IN') : 0}</strong>. Choose a verification method to proceed:
              </div>

              {/* Method Selector Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('otp'); setAuthError(null); }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: authMethod === 'otp' ? '#2A195C' : 'transparent',
                    color: authMethod === 'otp' ? '#fff' : '#64748B',
                    transition: 'all .15s'
                  }}
                >
                  📱 WhatsApp OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('password'); setAuthError(null); }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: authMethod === 'password' ? '#2A195C' : 'transparent',
                    color: authMethod === 'password' ? '#fff' : '#64748B',
                    transition: 'all .15s'
                  }}
                >
                  🔑 Master Password
                </button>
              </div>

              {authError && (
                <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>
                  ⚠️ {authError}
                </div>
              )}

              {/* Method 1: Send OTP */}
              {authMethod === 'otp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#334155' }}>
                    <div style={{ fontWeight: 700, marginBottom: '2px', color: '#0F172A' }}>Authorized Verification Mobile:</div>
                    <div>WhatsApp OTP will be sent to <strong>+91 {maskedAuthMobile || '81******72'}</strong></div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="rh-btn"
                      onClick={handleSendAuthOtp}
                      disabled={otpSending}
                      style={{ flex: 1, justifyContent: 'center', background: '#EEF2FF', borderColor: '#C7D2FE', color: '#2A195C', fontWeight: 700 }}
                    >
                      {otpSending ? 'Sending OTP...' : (otpSent ? 'Resend OTP' : 'Send WhatsApp OTP')}
                    </button>
                  </div>

                  {otpSent && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="modal-lbl">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        maxLength={6}
                        className="modal-input"
                        placeholder="e.g. 123456"
                        value={authOtp}
                        onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, ''))}
                        style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px', fontWeight: 800 }}
                        autoFocus
                      />
                      <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>✓ OTP sent via WhatsApp. Valid for 5 mins.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Method 2: Enter Master Password */}
              {authMethod === 'password' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label className="modal-lbl">Enter Super Admin Master Password</label>
                  <input
                    type="password"
                    className="modal-input"
                    placeholder="Enter Master Password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    autoFocus
                  />
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Configured in Super Admin Settings &gt; Security</span>
                </div>
              )}
            </div>

            <div className="rh-modal-ft">
              <button className="rh-btn" onClick={() => setShowAuthModal(false)} disabled={authVerifying}>Cancel</button>
              <button
                className="rh-btn rh-btn-primary"
                onClick={handleVerifyAuthAndProceed}
                disabled={authVerifying || (authMethod === 'otp' && (!otpSent || authOtp.length < 4)) || (authMethod === 'password' && !authPassword)}
              >
                {authVerifying ? 'Verifying...' : 'Authorize & Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
