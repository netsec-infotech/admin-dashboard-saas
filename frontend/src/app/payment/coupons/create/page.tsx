"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CSS = `
.fc-shell { display: flex; min-height: 100vh; background: #ffffff; font-family: 'Inter', sans-serif; }
.fc-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); background: #ffffff; }
.fc-page { padding: 24px 32px; display: flex; flex-direction: column; gap: 24px; }

/* Breadcrumbs back button */
.fc-header-row { display: flex; align-items: center; gap: 12px; }
.fc-back-btn { width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #E2E8F0; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff; color: #475569; transition: all 0.15s; }
.fc-back-btn:hover { border-color: #2A195C; color: #2A195C; }
.fc-header-text { display: flex; flex-direction: column; gap: 2px; }
.fc-h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -0.02em; }
.fc-subtitle { font-size: 13px; color: #64748B; font-weight: 500; }

/* Two Column Layout */
.fc-content-layout { display: grid; grid-template-columns: 2.45fr 1fr; gap: 24px; align-items: flex-start; }
.fc-form-column { display: flex; flex-direction: column; gap: 20px; }

.fc-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.01); }
.fc-card-title { font-size: 14px; font-weight: 800; color: #1E293B; margin: 0; }

.fc-form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.fc-form-row-2 { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }

.fc-field-group { display: flex; flex-direction: column; gap: 6px; }
.fc-label { font-size: 12px; font-weight: 600; color: #334155; }
.fc-required { color: #EF4444; margin-left: 2px; }

.fc-input-wrapper { display: flex; align-items: center; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; background: #fff; transition: border-color 0.15s; height: 38px; }
.fc-input-wrapper:focus-within { border-color: #2A195C; }
.fc-input-prefix { font-size: 13px; color: #94A3B8; font-weight: 600; margin-right: 6px; }
.fc-input { border: none; outline: none; font-size: 13px; color: #1E293B; width: 100%; background: transparent; font-family: inherit; }
.fc-input::placeholder { color: #94A3B8; }

.fc-select { border: 1.5px solid #E2E8F0; padding: 8px 12px; border-radius: 8px; font-size: 13px; color: #1E293B; background: #fff; outline: none; cursor: pointer; transition: border-color 0.15s; height: 38px; }
.fc-select:focus { border-color: #2A195C; }

.fc-help-text { font-size: 11px; color: #94A3B8; font-weight: 500; margin-top: 1px; }

/* Switch Toggle */
.fc-toggle-group { display: flex; align-items: center; gap: 12px; }
.fc-toggle-switch { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
.fc-toggle-switch input { opacity: 0; width: 0; height: 0; }
.fc-toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #CBD5E1; transition: .3s; border-radius: 20px; }
.fc-toggle-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
.fc-toggle-switch input:checked + .fc-toggle-slider { background-color: #2A195C; }
.fc-toggle-switch input:checked + .fc-toggle-slider:before { transform: translateX(16px); }

/* Assign Zones */
.fc-zone-radio-group { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
.fc-radio-lbl { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #334155; cursor: pointer; }
.fc-radio { width: 16px; height: 16px; accent-color: #2A195C; cursor: pointer; }

.fc-zone-tags { display: flex; flex-wrap: wrap; gap: 6px; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 6px 12px; background: #fff; align-items: center; min-height: 38px; cursor: pointer; }
.fc-zone-tag { display: inline-flex; align-items: center; gap: 6px; background: #F5F3FF; color: #2A195C; font-size: 11.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; border: 1px solid #E9D5FF; }
.fc-zone-tag-close { font-size: 11.5px; font-weight: 800; cursor: pointer; color: #A78BFA; }
.fc-zone-tag-close:hover { color: #2A195C; }

.fc-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.fc-btn-cancel { border: 1.5px solid #E2E8F0; padding: 10px 24px; border-radius: 8px; font-size: 13.5px; font-weight: 600; color: #475569; background: #fff; cursor: pointer; transition: all 0.15s; }
.fc-btn-cancel:hover { border-color: #F43F5E; color: #F43F5E; }
.fc-btn-submit { background: #2A195C; border: 1.5px solid #2A195C; padding: 10px 24px; border-radius: 8px; font-size: 13.5px; font-weight: 600; color: #fff; cursor: pointer; transition: all 0.15s; }
.fc-btn-submit:hover { background: #6D28D9; border-color: #6D28D9; }

/* Summary Right Column */
.fc-summary-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.01); }
.fc-summary-title-row { display: flex; justify-content: space-between; align-items: center; }
.fc-preview-badge { background: #F5F3FF; color: #2A195C; font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; border: 1px solid #E9D5FF; text-transform: uppercase; }

.fc-summary-list { display: flex; flex-direction: column; gap: 12px; }
.fc-summary-item { display: flex; justify-content: space-between; align-items: flex-start; font-size: 12.5px; }
.fc-summary-lbl { color: #64748B; font-weight: 500; }
.fc-summary-val { font-weight: 700; color: #1E293B; text-align: right; max-width: 160px; overflow-wrap: break-word; }
.fc-summary-divider { height: 1px; background: #F1F5F9; margin: 4px 0; }
.fc-summary-pills { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; max-width: 180px; }
.fc-summary-pill { background: #F1F5F9; color: #334155; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }

.fc-guide-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.01); }
.fc-guide-title { font-size: 14px; font-weight: 800; color: #1E293B; margin: 0; }
.fc-guide-list { display: flex; flex-direction: column; gap: 12px; }
.fc-guide-step { display: flex; gap: 10px; align-items: flex-start; font-size: 12.5px; color: #475569; font-weight: 500; }
.fc-guide-num { width: 18px; height: 18px; border-radius: 50%; background: #F5F3FF; color: #2A195C; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }

.fc-alert-box { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 12px; display: flex; gap: 10px; align-items: flex-start; font-size: 12px; color: #1D4ED8; font-weight: 500; line-height: 1.4; }
.fc-alert-icon { width: 16px; height: 16px; border-radius: 50%; background: #3B82F6; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; flex-shrink: 0; margin-top: 2px; }

/* Zone dropdown */
.fc-zone-dropdown-wrap { position: relative; }
.fc-zone-dropdown-menu { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; z-index: 100; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.fc-zone-option { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 13px; color: #1E293B; cursor: pointer; transition: background 0.1s; }
.fc-zone-option:hover { background: #F5F3FF; }
.fc-zone-option input[type=checkbox] { accent-color: #2A195C; width: 14px; height: 14px; cursor: pointer; }
`;

export default function CreateCouponPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  // Form states linked to Live Summary Card preview!
  const [couponCode, setCouponCode] = useState('SUMMER25');
  const [couponName, setCouponName] = useState('Summer Offer 2025');
  const [description, setDescription] = useState('Flat ₹25 OFF on all rentals');
  const [discountType, setDiscountType] = useState('Flat Amount');
  const [discountValue, setDiscountValue] = useState('25');
  const [minOrder, setMinOrder] = useState('100');
  const [redemptionLimit, setRedemptionLimit] = useState('300');
  const [perUserLimit, setPerUserLimit] = useState('1');
  const [startDate, setStartDate] = useState('20 May 2026 12:00 AM');
  const [endDate, setEndDate] = useState('19 Jun 2026 11:59 PM');
  const [noExpiry, setNoExpiry] = useState(false);
  const [applicableOn, setApplicableOn] = useState('All Rentals');
  const [assignZones, setAssignZones] = useState('select');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  // Zones from API
  const [dbZones, setDbZones] = useState<any[]>([]);
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  const zoneDropdownRef = useRef<HTMLDivElement>(null);

  // Close zone dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (zoneDropdownRef.current && !zoneDropdownRef.current.contains(e.target as Node)) {
        setZoneDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    // Fetch zones from backend
    api.get('/zones')
      .then((res: any) => {
        if (res && res.data) setDbZones(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!editId) return;

    api.get('/coupons')
      .then(res => {
        if (res && res.status === 'success' && res.data) {
          const coupon = res.data.find((c: any) => String(c.id) === String(editId));
          if (coupon) {
            setCouponCode(coupon.code);
            setCouponName(coupon.title);
            setDescription(coupon.description || '');
            setDiscountType(coupon.discount_type === 'Flat' ? 'Flat Amount' : (coupon.discount_type === 'Free Minutes' ? 'Free Minutes' : 'Percentage'));
            setDiscountValue(String(coupon.discount_value));
            setMinOrder(String(coupon.min_order));
            setRedemptionLimit(String(coupon.redemption_limit));
            setPerUserLimit(String(coupon.per_user_limit));
            setStartDate(coupon.start_date ? coupon.start_date.slice(0, 16) : '');
            setEndDate(coupon.end_date ? coupon.end_date.slice(0, 16) : '');
            setNoExpiry(!coupon.end_date);
            setApplicableOn(coupon.applicable_on || 'All Rentals');
            setSelectedZones(coupon.selected_zones || []);
          }
        }
      })
      .catch(err => console.error('Error fetching coupon for editing:', err));
  }, [editId]);

  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      code: couponCode,
      title: couponName,
      description,
      discount_type: discountType === 'Flat Amount' ? 'Flat' : (discountType === 'Free Minutes' ? 'Free Minutes' : 'Percentage'),
      discount_value: parseFloat(discountValue) || 0.0,
      min_order: parseFloat(minOrder) || 0.0,
      redemption_limit: parseInt(redemptionLimit) || 100,
      per_user_limit: parseInt(perUserLimit) || 1,
      start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      end_date: noExpiry ? null : (endDate ? new Date(endDate).toISOString() : null),
      applicable_on: applicableOn,
      selected_zones: selectedZones
    };

    try {
      let res;
      if (editId) {
        res = await api.put(`/coupons/${editId}`, payload);
      } else {
        res = await api.post('/coupons', payload);
      }

      if (res && res.status === 'success') {
        alert(editId ? 'Coupon Updated Successfully!' : 'Coupon Created Successfully!');
        router.push('/payment/coupons');
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to save coupon: ' + (err.message || err));
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fc-shell">
        <Sidebar activePath="/payment/coupons" />
        <div className="fc-main">
          <TopBar
            notificationCount={2}
            hideZone={false}
          />
          <div className="fc-page">
            
            {/* Breadcrumb row */}
            <div className="fc-header-row">
              <button className="fc-back-btn" onClick={() => router.push('/payment/coupons')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <div className="fc-header-text">
                <h1 className="fc-h1">{editId ? 'Edit Coupon' : 'Create Coupon'}</h1>
                <span className="fc-subtitle">{editId ? 'Configure and update this coupon\'s settings.' : 'Create and configure a new coupon for your franchise.'}</span>
              </div>
            </div>

            {/* Layout */}
            <div className="fc-content-layout">
              
              {/* Form Column */}
              <form className="fc-form-column" onSubmit={handleCreateCouponSubmit}>
                
                {/* Section 1: Coupon Information */}
                <div className="fc-card">
                  <h3 className="fc-card-title">Coupon Information</h3>
                  <div className="fc-form-row">
                    <div className="fc-field-group">
                      <label className="fc-label">Coupon Code<span className="fc-required">*</span></label>
                      <div className="fc-input-wrapper">
                        <input
                          type="text"
                          className="fc-input"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          required
                          placeholder="e.g. SUMMER25"
                        />
                      </div>
                      <span className="fc-help-text">Customers will use this code at checkout.</span>
                    </div>

                    <div className="fc-field-group">
                      <label className="fc-label">Coupon Name<span className="fc-required">*</span></label>
                      <div className="fc-input-wrapper">
                        <input
                          type="text"
                          className="fc-input"
                          value={couponName}
                          onChange={(e) => setCouponName(e.target.value)}
                          required
                          placeholder="e.g. Summer Offer 2025"
                        />
                      </div>
                      <span className="fc-help-text">For internal reference only.</span>
                    </div>

                    <div className="fc-field-group">
                      <label className="fc-label">Description</label>
                      <div className="fc-input-wrapper">
                        <input
                          type="text"
                          className="fc-input"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="e.g. Flat ₹25 OFF on all rentals"
                        />
                      </div>
                      <span className="fc-help-text">This will be shown to customers.</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Discount Configuration */}
                <div className="fc-card">
                  <h3 className="fc-card-title">Discount Configuration</h3>
                  <div className="fc-form-row">
                    <div className="fc-field-group">
                      <label className="fc-label">Discount Type<span className="fc-required">*</span></label>
                      <select
                        className="fc-select"
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                      >
                        <option value="Flat Amount">Flat Amount</option>
                        <option value="Percentage">Percentage</option>
                        <option value="Free Minutes">Free Minutes</option>
                      </select>
                    </div>

                    <div className="fc-field-group">
                      <label className="fc-label">Discount Value<span className="fc-required">*</span></label>
                      <div className="fc-input-wrapper">
                        <span className="fc-input-prefix">{discountType === 'Percentage' ? '%' : '₹'}</span>
                        <input
                          type="number"
                          className="fc-input"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          required
                          placeholder="25"
                        />
                      </div>
                      <span className="fc-help-text">
                        {discountType === 'Percentage' ? 'Percentage rate to be discounted.' : 'Flat amount to be discounted.'}
                      </span>
                    </div>

                    <div className="fc-field-group">
                      <label className="fc-label">Minimum Order Value (Optional)</label>
                      <div className="fc-input-wrapper">
                        <span className="fc-input-prefix">₹</span>
                        <input
                          type="number"
                          className="fc-input"
                          value={minOrder}
                          onChange={(e) => setMinOrder(e.target.value)}
                          placeholder="100"
                        />
                      </div>
                      <span className="fc-help-text">Minimum order value to apply this coupon.</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Usage & Limits */}
                <div className="fc-card">
                  <h3 className="fc-card-title">Usage & Limits</h3>
                  <div className="fc-form-row">
                    <div className="fc-field-group">
                      <label className="fc-label">Redemption Limit (Overall)<span className="fc-required">*</span></label>
                      <div className="fc-input-wrapper">
                        <input
                          type="number"
                          className="fc-input"
                          value={redemptionLimit}
                          onChange={(e) => setRedemptionLimit(e.target.value)}
                          required
                          placeholder="300"
                        />
                      </div>
                      <span className="fc-help-text">Total number of times this coupon can be used.</span>
                    </div>

                    <div className="fc-field-group">
                      <label className="fc-label">Redemption Limit (Per User)</label>
                      <div className="fc-input-wrapper">
                        <input
                          type="number"
                          className="fc-input"
                          value={perUserLimit}
                          onChange={(e) => setPerUserLimit(e.target.value)}
                          placeholder="1"
                        />
                      </div>
                      <span className="fc-help-text">How many times a single user can use this coupon.</span>
                    </div>

                    <div className="fc-field-group">
                      <label className="fc-label">Usage Counter</label>
                      <div className="fc-input-wrapper" style={{ background: '#F8FAFC' }}>
                        <input
                          type="text"
                          className="fc-input"
                          value={`0 / ${redemptionLimit || 0}`}
                          readOnly
                          style={{ color: '#64748B', fontWeight: 600 }}
                        />
                      </div>
                      <span className="fc-help-text">Auto-updated as the coupon is used.</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Validity */}
                <div className="fc-card">
                  <h3 className="fc-card-title">Validity</h3>
                  <div className="fc-form-row" style={{ gridTemplateColumns: '1.2fr 1.2fr 1fr', alignItems: 'center' }}>
                    <div className="fc-field-group">
                      <label className="fc-label">Start Date & Time<span className="fc-required">*</span></label>
                      <div className="fc-input-wrapper">
                        <input
                          type="datetime-local"
                          className="fc-input"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="fc-field-group">
                      <label className="fc-label">End Date & Time<span className="fc-required">*</span></label>
                      <div className="fc-input-wrapper" style={{ background: noExpiry ? '#F8FAFC' : '#fff' }}>
                        <input
                          type="datetime-local"
                          className="fc-input"
                          value={noExpiry ? '' : endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          disabled={noExpiry}
                        />
                      </div>
                    </div>

                    <div className="fc-field-group" style={{ height: '38px', justifyContent: 'center', marginTop: '18px' }}>
                      <div className="fc-toggle-group">
                        <label className="fc-toggle-switch">
                          <input
                            type="checkbox"
                            checked={noExpiry}
                            onChange={(e) => setNoExpiry(e.target.checked)}
                          />
                          <span className="fc-toggle-slider"></span>
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>No Expiry</span>
                          <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>Enable if this coupon never expires.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5: Applicable On */}
                <div className="fc-card">
                  <h3 className="fc-card-title">Applicable On</h3>
                  <div className="fc-form-row-2" style={{ alignItems: 'center' }}>
                    <div className="fc-field-group">
                      <label className="fc-label">Applicable On<span className="fc-required">*</span></label>
                      <select
                        className="fc-select"
                        value={applicableOn}
                        onChange={(e) => setApplicableOn(e.target.value)}
                      >
                        <option value="All Rentals">All Rentals</option>
                        <option value="Battery Swaps">Battery Swaps</option>
                        <option value="First Rides">First Rides</option>
                      </select>
                    </div>
                    <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500, marginTop: '14px' }}>
                      Select where this coupon can be applied.
                    </span>
                  </div>
                </div>

                {/* Section 6: Assign Zone(s) */}
                <div className="fc-card">
                  <h3 className="fc-card-title">Assign Zone(s)</h3>
                  <div className="fc-form-row-2">
                    <div className="fc-zone-radio-group">
                      <label className="fc-radio-lbl">
                        <input
                          type="radio"
                          className="fc-radio"
                          name="zonesRadio"
                          checked={assignZones === 'all'}
                          onChange={() => setAssignZones('all')}
                        />
                        All Zones
                      </label>
                      <label className="fc-radio-lbl">
                        <input
                          type="radio"
                          className="fc-radio"
                          name="zonesRadio"
                          checked={assignZones === 'select'}
                          onChange={() => setAssignZones('select')}
                        />
                        Select Zones
                      </label>
                    </div>

                    <div className="fc-field-group">
                      <label className="fc-label">Select Zones<span className="fc-required">*</span></label>
                      {assignZones === 'select' ? (
                        <>
                          <div
                            className="fc-zone-dropdown-wrap"
                            ref={zoneDropdownRef}
                          >
                            <div
                              className="fc-zone-tags"
                              onClick={() => setZoneDropdownOpen(o => !o)}
                            >
                              {selectedZones.length === 0 && (
                                <span style={{ color: '#94A3B8', fontSize: '12px' }}>Click to select zones...</span>
                              )}
                              {selectedZones.map((zone) => (
                                <span key={zone} className="fc-zone-tag">
                                  {zone}
                                  <span className="fc-zone-tag-close" onClick={(e) => { e.stopPropagation(); setSelectedZones(selectedZones.filter(z => z !== zone)); }}>×</span>
                                </span>
                              ))}
                              <span style={{ flex: 1 }}></span>
                              <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{zoneDropdownOpen ? '▲' : '▼'}</span>
                            </div>
                            {zoneDropdownOpen && (
                              <div className="fc-zone-dropdown-menu">
                                {dbZones.length === 0 && (
                                  <div className="fc-zone-option" style={{ color: '#94A3B8' }}>Loading zones...</div>
                                )}
                                {dbZones.map((z: any) => (
                                  <label key={z.id} className="fc-zone-option">
                                    <input
                                      type="checkbox"
                                      checked={selectedZones.includes(z.name)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedZones([...selectedZones, z.name]);
                                        } else {
                                          setSelectedZones(selectedZones.filter(n => n !== z.name));
                                        }
                                      }}
                                    />
                                    {z.name} {z.code ? `(${z.code})` : ''}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="fc-help-text">Coupon will be available only in the selected zones.</span>
                        </>
                      ) : (
                        <div className="fc-zone-tags" style={{ background: '#F8FAFC', color: '#64748B', borderStyle: 'dashed' }}>
                          <span>Coupon is active across all franchise zones.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="fc-actions">
                  <button type="button" className="fc-btn-cancel" onClick={() => router.push('/payment/coupons')}>
                    Cancel
                  </button>
                  <button type="submit" className="fc-btn-submit">
                    {editId ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>

              </form>

              {/* Right Summary Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Summary Card */}
                <div className="fc-summary-card">
                  <div className="fc-summary-title-row">
                    <h3 className="fc-card-title">Coupon Summary</h3>
                    <span className="fc-preview-badge">Preview</span>
                  </div>
                  
                  <div className="fc-summary-list">
                    <div className="fc-summary-item">
                      <span className="fc-summary-lbl">Coupon Code</span>
                      <span className="fc-summary-val" style={{ fontFamily: 'monospace', color: '#2A195C' }}>{couponCode || '—'}</span>
                    </div>
                    <div className="fc-summary-item">
                      <span className="fc-summary-lbl">Coupon Name</span>
                      <span className="fc-summary-val">{couponName || '—'}</span>
                    </div>
                    <div className="fc-summary-item">
                      <span className="fc-summary-lbl">Description</span>
                      <span className="fc-summary-val">{description || '—'}</span>
                    </div>

                    <div className="fc-summary-divider"></div>

                    <div className="fc-summary-item">
                      <span className="fc-summary-lbl">Discount</span>
                      <span className="fc-summary-val">
                        {discountType === 'Free Minutes' ? `${discountValue || 0} mins` : `${discountType === 'Percentage' ? '' : 'Flat '}${discountType === 'Percentage' ? '' : '₹'}${discountValue || 0}${discountType === 'Percentage' ? '%' : ''}`}
                      </span>
                    </div>
                    <div className="fc-summary-item">
                      <span className="fc-summary-lbl">Min. Order Value</span>
                      <span className="fc-summary-val">₹{minOrder || '0'}</span>
                    </div>
                    <div className="fc-summary-item">
                      <span className="fc-summary-lbl">Redemption Limit</span>
                      <span className="fc-summary-val">{redemptionLimit || '0'} (Overall)</span>
                    </div>
                    <div className="fc-summary-item">
                      <span className="fc-summary-lbl">Per User Limit</span>
                      <span className="fc-summary-val">{perUserLimit || '—'}</span>
                    </div>
                    <div className="fc-summary-item">
                      <span className="fc-summary-lbl">Validity</span>
                      <span className="fc-summary-val" style={{ fontSize: '11.5px', color: '#334155' }}>
                        {startDate} to {noExpiry ? 'Never' : endDate}
                      </span>
                    </div>
                    <div className="fc-summary-item">
                      <span className="fc-summary-lbl">Applicable On</span>
                      <span className="fc-summary-val">{applicableOn}</span>
                    </div>
                    <div className="fc-summary-item">
                      <span className="fc-summary-lbl">Zones</span>
                      <div className="fc-summary-pills">
                        {assignZones === 'all' ? (
                          <span className="fc-summary-pill">All Zones</span>
                        ) : (
                          <>
                            {selectedZones.slice(0, 2).map((z) => (
                              <span key={z} className="fc-summary-pill">
                                {z.split(',')[0]}
                              </span>
                            ))}
                            {selectedZones.length > 2 && (
                              <span className="fc-summary-pill" style={{ color: '#2A195C', background: '#F5F3FF' }}>
                                + {selectedZones.length - 2} more
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* How it works card */}
                <div className="fc-guide-card">
                  <h3 className="fc-guide-title">How it works</h3>
                  <div className="fc-guide-list">
                    <div className="fc-guide-step">
                      <span className="fc-guide-num">1</span>
                      <span>Create a coupon with code and discount.</span>
                    </div>
                    <div className="fc-guide-step">
                      <span className="fc-guide-num">2</span>
                      <span>Set validity, usage limits and minimum order value.</span>
                    </div>
                    <div className="fc-guide-step">
                      <span className="fc-guide-num">3</span>
                      <span>Assign zones where the coupon will be applicable.</span>
                    </div>
                    <div className="fc-guide-step">
                      <span className="fc-guide-num">4</span>
                      <span>Customers can use the coupon at checkout.</span>
                    </div>
                  </div>

                  <div className="fc-alert-box">
                    <span className="fc-alert-icon">i</span>
                    <span>Coupons once created can be edited or paused anytime.</span>
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
