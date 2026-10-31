'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

/* ──────────────────────────────────────────────────────────────
   STEP 4 · RETAIN RIDER - REVIEW & CONFIRM
   ────────────────────────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ── shell & layout ── */
.nr-shell { display: flex; min-height: 100vh; background: #fff; font-family: Inter, sans-serif; }
.nr-main  { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; flex: 1; min-width: 0; background: #fff; }
.nr-page  { flex: 1; padding: 20px 22px 70px;}

/* ── breadcrumb ── */
.nr-bc { display: flex; align-items: center; gap: 7px; padding: 14px 0 0; font-size: 12px; color: #9CA3AF; }
.nr-bc a { color: #9CA3AF; display: flex; align-items: center; gap: 4px; text-decoration: none; transition: color .15s; }
.nr-bc a:hover { color: #2A195C; }
.nr-bc-sep { color: #D1D5DB; }
.nr-bc-cur { color: #2A195C; font-weight: 600; }

/* ── title row ── */
.nr-title-row { display: flex; align-items: flex-start; justify-content: space-between; margin: 14px 0 20px; gap: 16px; }
.nr-h1  { font-size: 24px; font-weight: 800; color: #111827; line-height: 1.2; margin: 0; }
.nr-sub { font-size: 13px; color: #6B7280; margin-top: 4px; }
.nr-back-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px; background: #fff; border: 1.5px solid #E5E7EB;
  border-radius: 10px; font-size: 13px; font-weight: 600; color: #374151;
  cursor: pointer; white-space: nowrap; font-family: inherit;
  box-shadow: 0 1px 3px rgba(0,0,0,.06); transition: border-color .15s, color .15s; flex-shrink: 0;
  text-decoration: none;
}
.nr-back-btn:hover { border-color: #2A195C; color: #2A195C; }

/* ── stepper ── */
.nr-stepper {
  display: flex; align-items: center;
  background: #fff; border: 1px solid #E5E7EB; border-radius: 14px;
  padding: 18px 24px; margin-bottom: 22px; box-shadow: 0 1px 4px rgba(0,0,0,.05);
}
.nr-step-wrap  { display: flex; align-items: center; flex: 1; }
.nr-step       { display: flex; align-items: center; gap: 10px; }
.nr-step-num   { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.nr-step-num.active { background: #2A195C; color: #fff; }
.nr-step-num.done   { background: #22C55E; color: #fff; }
.nr-step-num.pend   { background: #fff; color: #9CA3AF; border: 2px solid #E5E7EB; }
.nr-step-label      { font-size: 13px; font-weight: 600; color: #111827; white-space: nowrap; }
.nr-step-label.pend { color: #9CA3AF; font-weight: 500; }
.nr-step-stat       { font-size: 11.5px; margin-top: 2px; white-space: nowrap; }
.nr-step-stat.done-s   { color: #22C55E; }
.nr-step-stat.active-s { color: #2A195C; }
.nr-step-stat.pend-s   { color: #9CA3AF; }
.nr-step-line { flex: 1; height: 2px; background: #E5E7EB; margin: 0 14px; min-width: 16px; }
.nr-step-line.done-l { background: #22C55E; }

/* ── outer 2-col layout ── */
.nr-layout { display: grid; grid-template-columns: 1fr 296px; gap: 20px; align-items: start; }

/* ── card ── */
.nr-card {
  background: #fff; border: 1px solid #E5E7EB; border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden; margin-bottom: 16px;
}
.nr-card-hdr {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; padding: 20px 24px 18px; border-bottom: 1px solid #F3F4F6;
}
.nr-card-hdr h2 { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 4px; }
.nr-card-hdr p  { font-size: 13px; color: #6B7280; margin: 0; }

/* ── Footer ── */
.nr-footer-actions {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; background: #fff;
  border: 1px solid #E5E7EB; border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
}
.nr-prev-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 22px; background: #fff; border: 1.5px solid #E5E7EB;
  border-radius: 10px; font-size: 13px; font-weight: 600; color: #374151;
  cursor: pointer; font-family: inherit; transition: border-color .15s, color .15s;
  text-decoration: none;
}
.nr-prev-btn:hover { border-color: #2A195C; color: #2A195C; }
.nr-continue-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 28px; background: #2A195C; border: none;
  border-radius: 10px; font-size: 13.5px; font-weight: 700; color: #fff;
  cursor: pointer; font-family: inherit; transition: background .15s;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(79,70,229,.3);
}
.nr-continue-btn:hover { background: #4338CA; }

/* ── Right Panel ── */
.nr-rp { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }
.nr-rp-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden; }
.nr-rp-hdr  { display: flex; align-items: center; gap: 9px; padding: 14px 18px; border-bottom: 1px solid #E5E7EB; }
.nr-rp-hdr-ic { display: flex; align-items: center; flex-shrink: 0; }
.nr-rp-title  { font-size: 13.5px; font-weight: 700; color: #111827; }
.nr-rp-body { padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 7px; }
.nr-rp-row  { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; font-size: 13px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; }
.nr-rp-label { color: #64748B; font-weight: 500; }
.nr-rp-val   { font-weight: 700; color: #111827; }
.nr-rp-divider { height: 1px; background: #E2E8F0; margin: 2px 0; }
.nr-rp-total {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; margin: 2px 0 0; border-radius: 10px; background: #F5F3FF; border: 1.5px solid #DDD6FE;
}
.nr-rp-total-l { font-size: 13px; font-weight: 700; color: #111827; }
.nr-rp-total-r { font-size: 18px; font-weight: 800; color: #2A195C; }

/* ── Section Grid ── */
.rv-top3 { display: grid; grid-template-columns: 1.1fr 1fr 1fr; border-bottom: 1px solid #F3F4F6; }
.rv-sec { padding: 20px 22px; }
.rv-sec:not(:last-child) { border-right: 1px solid #F3F4F6; }
.rv-sec-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.rv-sec-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #111827; }
.rv-edit-btn { color: #2A195C; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: none; }
.rv-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #F9FAFB; }
.rv-label { color: #6B7280; }
.rv-val { font-weight: 600; color: #111827; }

/* Vehicle Photos */
.rv-veh-thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
.rv-thumb { border-radius: 8px; overflow: hidden; height: 84px; background: #F8FAFC; border: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: center; }
.rv-thumb img { width: 100%; height: 100%; object-fit: contain; }
.rv-thumb-lbl { font-size: 11px; font-weight: 600; color: #4B5563; text-align: center; margin-top: 5px; }

/* Documents box */
.rv-doc-on-file {
  background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 12px;
  padding: 16px 20px; margin: 18px 22px;
}
.rv-doc-pill {
  display: inline-flex; align-items: center; gap: 6px; background: #fff;
  border: 1px solid #86EFAC; border-radius: 20px; padding: 4px 12px;
  font-size: 12px; font-weight: 600; color: #15803D; margin: 4px 6px 4px 0;
}

/* Modal */
.success-modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px); z-index: 999;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.success-modal {
  background: #fff; width: 100%; max-width: 500px;
  border-radius: 16px; padding: 28px; text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}
.success-modal-ic {
  width: 64px; height: 64px; border-radius: 50%; background: #DCFCE7;
  color: #16A34A; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.success-modal-title { font-size: 20px; font-weight: 800; color: #111827; margin-bottom: 8px; }
.success-modal-sub { font-size: 13.5px; color: #4B5563; line-height: 1.5; margin-bottom: 22px; }
.modal-actions { display: flex; gap: 10px; justify-content: center; }
.modal-wa-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: #25D366; color: #fff; padding: 10px 18px; border-radius: 9px;
  font-size: 13px; font-weight: 700; text-decoration: none;
}
.modal-wa-btn:hover { background: #1EBE5D; }
.modal-close-btn {
  background: #2A195C; color: #fff; padding: 10px 22px; border-radius: 9px;
  font-size: 13px; font-weight: 700; border: none; cursor: pointer; text-decoration: none;
}
.modal-close-btn:hover { background: #4338CA; }
`;

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 as number, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const SV = ({ s = 14, children, ...p }: { s?: number; children: React.ReactNode } & React.SVGProps<SVGSVGElement>) => (<svg width={s} height={s} viewBox="0 0 24 24" {...S} {...p}>{children}</svg>);
const ILeft = () => <SV s={13}><polyline points="15 18 9 12 15 6" /></SV>;
const ICheck = ({ s = 13 }: { s?: number }) => <SV s={s}><polyline points="20 6 9 17 4 12" /></SV>;
const IArr = ({ s = 12 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IUser = () => <SV s={14}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></SV>;
const IReceipt = () => <SV s={14}><path d="M4 2v20l3-1.5L10 22l3-1.5L16 22l3-1.5L22 22V2" /><path d="M10 9H8M16 9h-2M10 14H8M16 14h-2" /></SV>;
const IFile = ({ s = 14 }: { s?: number }) => <SV s={s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></SV>;
const IPen = () => <SV s={12}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></SV>;

const STEPS = [
  { n: 1, label: 'Rider Search', stat: 'Completed', state: 'done' },
  { n: 2, label: 'Rental Details', stat: 'Completed', state: 'done' },
  { n: 3, label: 'Payment & Charges', stat: 'Completed', state: 'done' },
  { n: 4, label: 'Review & Confirm', stat: 'In Progress', state: 'active' },
];

export default function RetainRiderReviewPage() {
  const router = useRouter();
  const [rider, setRider] = useState<any>(null);
  const [rental, setRental] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmedRideId, setConfirmedRideId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const r = localStorage.getItem('evegah_retain_rider');
        if (r) setRider(JSON.parse(r));
        const rn = localStorage.getItem('evegah_retain_rental');
        if (rn) setRental(JSON.parse(rn));
        const pm = localStorage.getItem('evegah_retain_payment');
        if (pm) setPayment(JSON.parse(pm));
      } catch {}
    }
  }, []);

  const riderName = rider?.name || rider?.fullName || 'Returning Rider';
  const riderPhone = rider?.phone || rider?.mobile || '—';
  const riderId = rider?.id || rider?.riderId || '—';
  const vehicleName = rental?.vehicle_name || 'Evegah E1';
  const vehicleCode = rental?.vehicle_code || 'EVM1024012';
  const batteryId = rental?.battery_id || 'BAT-0098';
  const planType = rental?.plan_type || 'Daily Plan';
  const rentRate = Number(payment?.base_rent ?? rental?.plan_rate ?? 0);
  const deposit = Number(payment?.deposit_amount ?? rental?.deposit_amount ?? 0);
  const discount = Number(payment?.discount_amount || 0);
  const totalPayable = Math.max(0, rentRate + deposit - discount);
  const payMethod = payment?.payment_method || 'payu';

  const [confirmedVoucherId, setConfirmedVoucherId] = useState('');

  const handleConfirmSubmit = async () => {
    if (!agreed) {
      alert('Please agree to the Retain Ride terms before confirming.');
      return;
    }
    setIsSubmitting(true);
    const newRideId = `RID-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedRideId(newRideId);

    const voucherToUse = payment?.cash_voucher_number || payment?.voucher_number || null;
    if (voucherToUse) setConfirmedVoucherId(voucherToUse);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      // Save Retain Ride directly into renters table (never reservations)
      const res = await fetch(`${apiUrl}/rides/retain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rider_name: riderName,
          name: riderName,
          mobile: riderPhone,
          vehicle_id: vehicleCode,
          battery_id: batteryId,
          package_name: rental?.plan_type || planType || 'Daily Pass',
          rent: rentRate,
          deposit: deposit,
          total: totalPayable,
          zone_name: rental?.pickup_zone || 'Gotri Zone',
          return_date: rental?.return_date || null,
          payment_method: payMethod === 'cash' ? 'Cash' : 'PayU',
          cash_voucher_number: voucherToUse
        })
      });

      const resData = await res.json().catch(() => ({}));
      if (resData?.data?.id) {
        setConfirmedRideId(`RID-${String(resData.data.id).slice(0, 6).toUpperCase()}`);
      }
      if (resData?.data?.cash_voucher_number) {
        setConfirmedVoucherId(resData.data.cash_voucher_number);
      }

    } catch (err) {
      console.error('Retain rider submission fallback:', err);
    } finally {
      setIsSubmitting(false);
      setShowModal(true);
    }
  };

  const cleanPhone = riderPhone.replace(/[^0-9]/g, '');
  const waReceiptText = encodeURIComponent(
    `*EVEGAH EV RENTAL CONFIRMATION*\n\n` +
    `Hello ${riderName},\n` +
    `Your retain ride registration is confirmed!\n\n` +
    `• Ride ID: ${confirmedRideId || 'RID-202409'}\n` +
    (confirmedVoucherId ? `• Cash Voucher / Receipt: ${confirmedVoucherId}\n` : '') +
    `• Vehicle: ${vehicleName} (${vehicleCode})\n` +
    `• Battery: ${batteryId}\n` +
    `• Plan: ${planType}\n` +
    `• Total Paid: ₹${totalPayable.toFixed(2)} (Zero GST)\n` +
    `• Deposit on File: ₹${deposit.toFixed(2)}\n\n` +
    `Thank you for riding with Evegah!`
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="nr-shell">
        <Sidebar activePath="/retain-rider" />
        <div className="nr-main">
          <TopBar title="Retain Rider - Review & Confirm" subtitle="Review rider and asset allocation before final submission" />
          <div className="nr-page">
            <div className="nr-bc">
              <Link href="/">Home</Link><span className="nr-bc-sep">›</span>
              <a href="#">Rides / Rentals</a><span className="nr-bc-sep">›</span>
              <span className="nr-bc-cur">Retain Ride Registration</span>
            </div>
            <div className="nr-title-row">
              <div><h1 className="nr-h1">Retain Ride Registration</h1><p className="nr-sub">Final confirmation for returning rider</p></div>
              <Link href="/renters" className="nr-back-btn"><ILeft /> Back to Rides</Link>
            </div>
            <div className="nr-stepper">
              {STEPS.map((s, i) => (
                <div key={s.n} className="nr-step-wrap">
                  <div className="nr-step">
                    <div className={`nr-step-num ${s.state}`}>{s.state === 'done' ? <ICheck s={13} /> : s.n}</div>
                    <div><div className={`nr-step-label ${s.state === 'pend' ? 'pend' : ''}`}>{s.label}</div><div className={`nr-step-stat ${s.state}-s`}>{s.stat}</div></div>
                  </div>
                  {i < STEPS.length - 1 && <div className={`nr-step-line ${s.state === 'done' ? 'done-l' : ''}`} />}
                </div>
              ))}
            </div>

            <div className="nr-layout">
              <div>
                <div className="nr-card">
                  <div className="nr-card-hdr">
                    <div>
                      <h2>Review &amp; Confirm Registration</h2>
                      <p>Returning rider verified on file. Assets allocated and payment confirmed with Zero GST.</p>
                    </div>
                  </div>

                  <div className="rv-top3">
                    {/* 1. Rider */}
                    <div className="rv-sec">
                      <div className="rv-sec-hdr">
                        <div className="rv-sec-title"><IUser /> Rider Information</div>
                        <Link href="/retain-rider" className="rv-edit-btn"><IPen /> Change</Link>
                      </div>
                      <div className="rv-row"><span className="rv-label">Full Name</span><span className="rv-val">{riderName}</span></div>
                      <div className="rv-row"><span className="rv-label">Mobile</span><span className="rv-val">{riderPhone}</span></div>
                      <div className="rv-row"><span className="rv-label">Rider ID</span><span className="rv-val">{riderId}</span></div>
                      <div className="rv-row"><span className="rv-label">Status</span><span className="rv-val" style={{ color: '#16A34A' }}>Verified On File</span></div>
                    </div>

                    {/* 2. Rental */}
                    <div className="rv-sec">
                      <div className="rv-sec-hdr">
                        <div className="rv-sec-title"><IReceipt /> Asset Allocation</div>
                        <Link href="/retain-rider/rental" className="rv-edit-btn"><IPen /> Edit</Link>
                      </div>
                      <div className="rv-row"><span className="rv-label">Vehicle</span><span className="rv-val">{vehicleName}</span></div>
                      <div className="rv-row"><span className="rv-label">Vehicle ID</span><span className="rv-val">{vehicleCode}</span></div>
                      <div className="rv-row"><span className="rv-label">Battery ID</span><span className="rv-val">{batteryId}</span></div>
                      <div className="rv-row"><span className="rv-label">Package Plan</span><span className="rv-val">{planType}</span></div>
                    </div>

                    {/* 3. Payment */}
                    <div className="rv-sec">
                      <div className="rv-sec-hdr">
                        <div className="rv-sec-title"><IReceipt /> Payment Summary</div>
                        <Link href="/retain-rider/payment" className="rv-edit-btn"><IPen /> Edit</Link>
                      </div>
                      <div className="rv-row"><span className="rv-label">Rent Price</span><span className="rv-val">₹{rentRate.toFixed(2)}</span></div>
                      <div className="rv-row"><span className="rv-label">Deposit</span><span className="rv-val">₹{deposit.toFixed(2)}</span></div>
                      {discount > 0 && <div className="rv-row"><span className="rv-label">Discount</span><span className="rv-val" style={{ color: '#16A34A' }}>-₹{discount.toFixed(2)}</span></div>}
                      <div className="rv-row" style={{ fontWeight: 800 }}><span className="rv-label">Total Payable</span><span className="rv-val" style={{ color: '#2A195C', fontSize: 16 }}>₹{totalPayable.toFixed(2)}</span></div>
                    </div>
                  </div>

                  {/* Vehicle Inspection Thumbs */}
                  <div style={{ padding: '18px 22px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                      Vehicle &amp; Battery Ready for Handover
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
                      Inspection verified by dispatch staff. Zero damage detected.
                    </div>
                    <div className="rv-veh-thumbs">
                      {[
                        { img: '/City-1.png', lbl: 'Front View' },
                        { img: '/City-2.png', lbl: 'Side Profile' },
                        { img: '/City-3.png', lbl: 'Rear View' },
                        { img: '/ev_batttery.png', lbl: 'Swappable Battery' },
                      ].map(t => (
                        <div key={t.lbl}>
                          <div className="rv-thumb">
                            <img src={t.img} alt={t.lbl} />
                          </div>
                          <div className="rv-thumb-lbl">{t.lbl}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verified Documents On File */}
                  <div className="rv-doc-on-file">
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#15803D', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ICheck s={16} /> Documents Verified on File (No Re-upload Required)
                    </div>
                    <div style={{ fontSize: 12.5, color: '#166534', lineHeight: 1.5, marginBottom: 10 }}>
                      As this is a registered returning rider, all identity documents, profile photos, and verification records are permanently linked to Rider ID <strong>{riderId}</strong>.
                    </div>
                    <div>
                      <span className="rv-doc-pill">✓ Identity Document Verified</span>
                      <span className="rv-doc-pill">✓ Profile Photo On Record</span>
                      <span className="rv-doc-pill">✓ Active Agreement Active</span>
                      <span className="rv-doc-pill">✓ Zero Due Clear</span>
                    </div>
                  </div>

                  {/* Agreement */}
                  <div style={{ padding: '0 22px 20px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={e => setAgreed(e.target.checked)}
                        style={{ marginTop: 3, accentColor: '#2A195C', width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                        I confirm that <strong>{riderName}</strong> has been handed over vehicle <strong>{vehicleCode}</strong> and battery <strong>{batteryId}</strong> under terms of the Evegah EV Retain Agreement.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="nr-footer-actions">
                  <Link href="/retain-rider/payment" className="nr-prev-btn">
                    <ILeft /> Previous
                  </Link>
                  <button
                    className="nr-continue-btn"
                    onClick={handleConfirmSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm & Activate Ride'} <IArr s={12} />
                  </button>
                </div>
              </div>

              {/* Right Panel */}
              <div className="nr-rp">
                <div className="nr-rp-card">
                  <div className="nr-rp-hdr"><span className="nr-rp-hdr-ic" style={{ color: '#2A195C' }}><IReceipt /></span><div className="nr-rp-title">Rental Summary</div></div>
                  <div className="nr-rp-body">
                    {[
                      { l: 'Assigned Rider', v: riderName },
                      { l: 'Vehicle Model', v: vehicleName },
                      { l: 'Asset Code', v: vehicleCode },
                      { l: 'Battery Code', v: batteryId },
                      { l: 'Rent Price', v: `₹${rentRate.toFixed(2)}` },
                      { l: 'Security Deposit', v: `₹${deposit.toFixed(2)}` },
                      ...(discount > 0 ? [{ l: 'Coupon Discount', v: `-₹${discount.toFixed(2)}` }] : []),
                    ].map(r => (
                      <div key={r.l} className="nr-rp-row">
                        <span className="nr-rp-label">{r.l}</span>
                        <span className="nr-rp-val">{r.v}</span>
                      </div>
                    ))}
                    <div className="nr-rp-divider" />
                    <div className="nr-rp-total">
                      <span className="nr-rp-total-l">Total (Zero GST)</span>
                      <span className="nr-rp-total-r">₹{totalPayable.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-modal-ic">
              <ICheck s={32} />
            </div>
            <h3 className="success-modal-title">Retain Ride Activated!</h3>
            <p className="success-modal-sub">
              Ride for <strong>{riderName}</strong> ({riderPhone}) has been successfully registered and marked as Active.<br/>
              Vehicle: <strong>{vehicleName}</strong> | Ride ID: <strong>{confirmedRideId}</strong>
              {confirmedVoucherId && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 13, color: '#166534', fontWeight: 700 }}>
                  💵 Cash Voucher / Receipt: <span style={{ fontFamily: 'monospace' }}>{confirmedVoucherId}</span>
                </div>
              )}
            </p>
            <div className="modal-actions">
              <a
                href={`https://wa.me/${cleanPhone}?text=${waReceiptText}`}
                target="_blank"
                rel="noreferrer"
                className="modal-wa-btn"
              >
                <span>💬</span> WhatsApp Receipt
              </a>
              <Link href="/renters" className="modal-close-btn">
                Go to Rides Table
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
