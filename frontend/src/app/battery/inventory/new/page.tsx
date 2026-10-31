"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.ab-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.ab-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.ab-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Breadcrumb */
.ab-bc { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748B; font-weight: 500; }
.ab-bc a { color: #64748B; text-decoration: none; }
.ab-bc a:hover { color: #2A195C; }
.ab-bc-sep { color: #94A3B8; }
.ab-bc-cur { color: #2A195C; font-weight: 600; }

/* Header title */
.ab-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.ab-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; letter-spacing: -0.02em; }
.ab-sub { font-size: 13px; color: #64748B; margin: 0; }

.ab-actions { display: flex; align-items: center; gap: 10px; }
.ab-btn { display: flex; align-items: center; gap: 7px; padding: 10px 20px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; }
.ab-btn:hover { border-color: #6366F1; color: #6366F1; }
.ab-btn-primary { background: #2a195c; color: #fff; border-color: #2a195c; }
.ab-btn-primary:hover { background: #4338CA; border-color: #4338CA; color: #fff; }

/* Form layout grid */
.ab-grid { display: grid; grid-template-columns: 3fr 1.2fr; gap: 20px; align-items: start; }
.ab-form-cols { display: flex; flex-direction: column; gap: 20px; }
.ab-form-row-top { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.ab-form-row-bottom { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }

/* Panel card */
.ab-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 16px; }
.ab-card-hdr { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #0F172A; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; margin-bottom: 4px; }
.ab-card-hdr-ic { color: #6366F1; display: flex; align-items: center; justify-content: center; }

/* Form controls */
.ab-group { display: flex; flex-direction: column; gap: 6px; }
.ab-label { font-size: 12px; font-weight: 600; color: #475569; }
.ab-label span { color: #EF4444; margin-left: 2px; }

.ab-input-wrap { position: relative; display: flex; align-items: center; }
.ab-input { width: 100%; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; color: #334155; outline: none; transition: border-color .15s; background: #fff; }
.ab-input:focus { border-color: #6366F1; }
.ab-input-suffix { position: absolute; right: 12px; font-size: 12px; font-weight: 600; color: #94A3B8; pointer-events: none; }
.ab-input-prefix { position: absolute; left: 12px; font-size: 12px; font-weight: 600; color: #94A3B8; pointer-events: none; }
.ab-input-with-suffix { padding-right: 36px; }
.ab-input-with-prefix { padding-left: 24px; }

.ab-select { width: 100%; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; color: #334155; outline: none; background: #fff; cursor: pointer; transition: border-color .15s; }
.ab-select:focus { border-color: #6366F1; }

.ab-textarea { width: 100%; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; color: #334155; outline: none; resize: none; min-height: 80px; font-family: inherit; transition: border-color .15s; }
.ab-textarea:focus { border-color: #6366F1; }
.ab-counter { font-size: 10px; color: #94A3B8; align-self: flex-end; margin-top: -4px; }

/* Image upload dropzone */
.ab-dropzone { border: 2px dashed #CBD5E1; border-radius: 10px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; text-align: center; background: #FAF9FF; transition: all .15s; }
.ab-dropzone:hover { border-color: #6366F1; background: #F5F3FF; }
.ab-dropzone-ic { color: #6366F1; }
.ab-dropzone-tit { font-size: 12.5px; font-weight: 600; color: #475569; }
.ab-dropzone-tit span { color: #6366F1; text-decoration: underline; }
.ab-dropzone-sub { font-size: 11px; color: #94A3B8; }

.ab-info-bar { background: #EEF2F6; border-radius: 8px; padding: 10px 16px; font-size: 12px; color: #475569; font-weight: 500; display: flex; align-items: center; gap: 8px; }
.ab-req-alert { background: #FAF5FF; border: 1px solid #F3E8FF; color: #2A195C; }

/* Right Summary Sidebar */
.ab-sum-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.02); position: sticky; top: 20px; display: flex; flex-direction: column; gap: 16px; }
.ab-sum-hdr { font-size: 15px; font-weight: 700; color: #0F172A; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.ab-sum-list { display: flex; flex-direction: column; gap: 10px; }
.ab-sum-item { display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; border-bottom: 1px dashed #F1F5F9; padding-bottom: 6px; }
.ab-sum-lbl { color: #64748B; font-weight: 500; }
.ab-sum-val { color: #334155; font-weight: 600; text-align: right; max-width: 60%; word-break: break-all; }

.ab-sum-banner { background: #FAF5FF; border: 1.5px solid #F3E8FF; border-radius: 10px; padding: 12px; display: flex; gap: 8px; font-size: 12px; color: #2A195C; font-weight: 500; align-items: center; margin-top: 10px; }
.ab-sum-banner-ic { flex-shrink: 0; }
`;

export default function AddBatteryPage() {
  const router = useRouter();

  // Form State
  const [batteryId, setBatteryId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [batteryType, setBatteryType] = useState('Li-ion');
  const [capacity, setCapacity] = useState('');
  const [voltage, setVoltage] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');

  const [health, setHealth] = useState('');
  const [status, setStatus] = useState('Healthy');
  const [conditionNotes, setConditionNotes] = useState('');

  const [location, setLocation] = useState('');
  const [zone, setZone] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [riderName, setRiderName] = useState('');

  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyValidTill, setWarrantyValidTill] = useState('');
  const [supplier, setSupplier] = useState('');
  const [cost, setCost] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!batteryId.trim()) return setErrorMsg('Battery ID / Serial No. is required.');
    if (!capacity.trim()) return setErrorMsg('Capacity is required.');
    if (!voltage.trim()) return setErrorMsg('Nominal Voltage is required.');
    if (!health.trim()) return setErrorMsg('SOH (Health) is required.');
    if (!location.trim()) return setErrorMsg('Location is required.');
    if (!zone.trim()) return setErrorMsg('Zone is required.');
    if (!assignedTo.trim()) return setErrorMsg('Assignment is required.');

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const payload = {
        battery_id: batteryId,
        serial_number: serialNumber || batteryId,
        battery_type: batteryType,
        capacity: capacity.includes('Ah') ? capacity : `${capacity} Ah`,
        voltage: parseFloat(voltage),
        make: make || null,
        model: model || null,
        health: parseInt(health) || 100,
        status: status,
        location: location,
        zone: zone,
        assigned_to: assignedTo === 'Unassigned' ? '' : assignedTo,
        vehicle_number: vehicleNumber || null,
        rider_name: riderName || null,
        purchase_date: purchaseDate || null,
        warranty_valid_till: warrantyValidTill || null,
        supplier: supplier || null,
        cost: cost ? parseFloat(cost) : null,
        invoice_number: invoiceNumber || null,
        notes: notes || conditionNotes || null,
        soc: 100, // Default SOC when newly added
        current: 0,
        temp: 25,
        cycles: 0,
        cells: []
      };

      const res = await fetch(`${apiUrl}/batteries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push('/battery/inventory');
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.error || 'Failed to save battery to the database.');
      }
    } catch (err: any) {
      console.error('Error saving battery:', err);
      setErrorMsg('Network error: Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ab-shell">
        <Sidebar activePath="/battery/inventory" />
        <div className="ab-main">
          <TopBar title="Battery Inventory" subtitle="Manage and track all battery stock" />
          <div className="ab-page">

            {/* Breadcrumb */}
            <div className="ab-bc">
              <span style={{ marginRight: '4px', display: 'flex', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </span>
              <a href="#" onClick={(e) => { e.preventDefault(); router.push('/battery/inventory'); }}>Battery</a>
              <span className="ab-bc-sep">&gt;</span>
              <a href="#" onClick={(e) => { e.preventDefault(); router.push('/battery/inventory'); }}>Battery Inventory</a>
              <span className="ab-bc-sep">&gt;</span>
              <span className="ab-bc-cur">Add Battery</span>
            </div>

            {/* Title & Action Row */}
            <div className="ab-title-row">
              <div>
                <h1 className="ab-h1">Add Battery</h1>
                <p className="ab-sub">Add a new battery to your inventory</p>
              </div>
              <div className="ab-actions">
                <button className="ab-btn" onClick={() => router.push('/battery/inventory')} disabled={submitting}>
                  Cancel
                </button>
                <button className="ab-btn ab-btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Battery'}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                {errorMsg}
              </div>
            )}

            <div className="ab-grid">
              {/* Form Panels */}
              <div className="ab-form-cols">
                
                {/* Panel 1, 2, 3 in a Row */}
                <div className="ab-form-row-top">
                  
                  {/* Battery Information */}
                  <div className="ab-card">
                    <div className="ab-card-hdr">
                      <span className="ab-card-hdr-ic">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="16" height="12" rx="2" ry="2"/><line x1="22" y1="11" x2="22" y2="15"/><line x1="6" y1="11" x2="10" y2="11"/><line x1="14" y1="11" x2="14" y2="11"/></svg>
                      </span>
                      Battery Information
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Battery ID / Serial No.<span>*</span></label>
                      <div className="ab-input-wrap">
                        <input 
                          type="text" 
                          placeholder="Enter battery ID or scan barcode" 
                          className="ab-input"
                          value={batteryId}
                          onChange={(e) => {
                            setBatteryId(e.target.value);
                            // Auto fill serial number if empty
                            if (!serialNumber) setSerialNumber(e.target.value);
                          }}
                        />
                        <span className="ab-input-suffix">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 3H3v18h2V3zM8 3h1v18H8V3zM12 3h3v18h-3V3zM18 3h1v18h-1V3zM21 3h1v18h-1V3z"/></svg>
                        </span>
                      </div>
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Serial Number</label>
                      <input 
                        type="text" 
                        placeholder="Enter manufacturer serial number" 
                        className="ab-input"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                      />
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Battery Type<span>*</span></label>
                      <select className="ab-select" value={batteryType} onChange={(e) => setBatteryType(e.target.value)}>
                        <option value="Li-ion">Li-ion</option>
                        <option value="LFP (Lithium Iron Phosphate)">LFP (Lithium Iron Phosphate)</option>
                        <option value="Lead Acid">Lead Acid</option>
                        <option value="NMC">NMC</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="ab-group">
                        <label className="ab-label">Capacity (Ah)<span>*</span></label>
                        <div className="ab-input-wrap">
                          <input 
                            type="text" 
                            placeholder="Enter capacity" 
                            className="ab-input ab-input-with-suffix"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                          />
                          <span className="ab-input-suffix">Ah</span>
                        </div>
                      </div>
                      <div className="ab-group">
                        <label className="ab-label">Nominal Voltage (V)<span>*</span></label>
                        <div className="ab-input-wrap">
                          <input 
                            type="number" 
                            step="0.1"
                            placeholder="Enter voltage" 
                            className="ab-input ab-input-with-suffix"
                            value={voltage}
                            onChange={(e) => setVoltage(e.target.value)}
                          />
                          <span className="ab-input-suffix">V</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="ab-group">
                        <label className="ab-label">Make / Brand</label>
                        <input 
                          type="text" 
                          placeholder="Brand name" 
                          className="ab-input"
                          value={make}
                          onChange={(e) => setMake(e.target.value)}
                        />
                      </div>
                      <div className="ab-group">
                        <label className="ab-label">Model</label>
                        <input 
                          type="text" 
                          placeholder="Model code" 
                          className="ab-input"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status & Health */}
                  <div className="ab-card">
                    <div className="ab-card-hdr">
                      <span className="ab-card-hdr-ic">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </span>
                      Status & Health
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">SOH (Health) (%)<span>*</span></label>
                      <div className="ab-input-wrap">
                        <input 
                          type="number" 
                          placeholder="Enter SOH percentage" 
                          className="ab-input ab-input-with-suffix"
                          value={health}
                          onChange={(e) => setHealth(e.target.value)}
                        />
                        <span className="ab-input-suffix">%</span>
                      </div>
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Status<span>*</span></label>
                      <select className="ab-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Healthy">Healthy</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                        <option value="In Maintenance">In Maintenance</option>
                        <option value="Decommissioned">Decommissioned</option>
                      </select>
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Condition Notes</label>
                      <textarea 
                        maxLength={200}
                        placeholder="Enter condition notes (optional)" 
                        className="ab-textarea"
                        value={conditionNotes}
                        onChange={(e) => setConditionNotes(e.target.value)}
                      />
                      <span className="ab-counter">{conditionNotes.length}/200</span>
                    </div>
                  </div>

                  {/* Location & Assignment */}
                  <div className="ab-card">
                    <div className="ab-card-hdr">
                      <span className="ab-card-hdr-ic">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                      </span>
                      Location & Assignment
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Location<span>*</span></label>
                      <select className="ab-select" value={location} onChange={(e) => setLocation(e.target.value)}>
                        <option value="">Select location</option>
                        <option value="Gotri Hub">Gotri Hub</option>
                        <option value="Manjalpur Hub">Manjalpur Hub</option>
                        <option value="KPGU Hub">KPGU Hub</option>
                        <option value="Aatapi Hub">Aatapi Hub</option>
                        <option value="Moti Daman Hub">Moti Daman Hub</option>
                        <option value="Service Center">Service Center</option>
                        <option value="Warehouse">Warehouse</option>
                      </select>
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Zone<span>*</span></label>
                      <select className="ab-select" value={zone} onChange={(e) => setZone(e.target.value)}>
                        <option value="">Select zone</option>
                        <option value="Gotri Zone">Gotri Zone</option>
                        <option value="Manjalpur Zone">Manjalpur Zone</option>
                        <option value="KPGU Zone">KPGU Zone</option>
                        <option value="Aatapi Zone">Aatapi Zone</option>
                        <option value="Moti Daman Zone">Moti Daman Zone</option>
                      </select>
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Assign To<span>*</span></label>
                      <select className="ab-select" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                        <option value="">Select assigned to</option>
                        <option value="Unassigned">Unassigned / In Stock</option>
                        <option value="EVM1024011">EVM1024011 (Gotri Rider)</option>
                        <option value="EVM1024012">EVM1024012 (Gotri Rider)</option>
                        <option value="EVM1024023">EVM1024023 (Gotri Rider)</option>
                        <option value="EVM102501">EVM102501 (Manjalpur Rider)</option>
                      </select>
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Vehicle Number (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Enter vehicle number" 
                        className="ab-input"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                      />
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Rider Name (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Enter rider name" 
                        className="ab-input"
                        value={riderName}
                        onChange={(e) => setRiderName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details & Images row */}
                <div className="ab-form-row-bottom">
                  
                  {/* Additional Details */}
                  <div className="ab-card">
                    <div className="ab-card-hdr">
                      <span className="ab-card-hdr-ic">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      </span>
                      Additional Details
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="ab-group">
                        <label className="ab-label">Purchase Date</label>
                        <input 
                          type="date" 
                          className="ab-input"
                          value={purchaseDate}
                          onChange={(e) => setPurchaseDate(e.target.value)}
                        />
                      </div>
                      <div className="ab-group">
                        <label className="ab-label">Warranty Valid Till</label>
                        <input 
                          type="date" 
                          className="ab-input"
                          value={warrantyValidTill}
                          onChange={(e) => setWarrantyValidTill(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Supplier / Vendor</label>
                      <input 
                        type="text" 
                        placeholder="Enter supplier or vendor name" 
                        className="ab-input"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                      <div className="ab-group">
                        <label className="ab-label">Cost (Optional)</label>
                        <div className="ab-input-wrap">
                          <span className="ab-input-prefix">₹</span>
                          <input 
                            type="number" 
                            placeholder="Enter cost" 
                            className="ab-input ab-input-with-prefix"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="ab-group">
                        <label className="ab-label">Invoice Number (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="Enter invoice number" 
                          className="ab-input"
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="ab-group">
                      <label className="ab-label">Notes (Optional)</label>
                      <textarea 
                        maxLength={300}
                        placeholder="Enter any additional notes" 
                        className="ab-textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <span className="ab-counter">{notes.length}/300</span>
                    </div>
                  </div>

                  {/* Battery Images */}
                  <div className="ab-card">
                    <div className="ab-card-hdr">
                      <span className="ab-card-hdr-ic">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </span>
                      Battery Images (Optional)
                    </div>

                    <div className="ab-dropzone" onClick={() => alert('Mock Image Uploader: Files selected!')}>
                      <span className="ab-dropzone-ic">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </span>
                      <div className="ab-dropzone-tit">Drag & drop images here or <span>click to browse</span></div>
                      <div className="ab-dropzone-sub">Upload battery images, labels, serial number etc.</div>
                      <div className="ab-dropzone-sub" style={{ fontWeight: '600' }}>JPG, PNG up to 5MB each</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>
                      <span>You can upload up to 5 images</span>
                      <span>0 / 5 uploaded</span>
                    </div>
                  </div>

                </div>

                {/* Bottom marker */}
                <div className="ab-info-bar ab-req-alert">
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </span>
                  Fields marked with * are required
                </div>

              </div>

              {/* Battery Live Summary Preview Panel */}
              <div className="ab-sum-card">
                <div className="ab-sum-hdr">
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </span>
                  Battery Summary
                </div>

                <div className="ab-sum-list">
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Battery ID</span>
                    <span className="ab-sum-val" style={{ color: '#2A195C', fontWeight: '700' }}>{batteryId || '-'}</span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Battery Type</span>
                    <span className="ab-sum-val">{batteryType || '-'}</span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Capacity</span>
                    <span className="ab-sum-val">{capacity ? `${capacity} Ah` : '-'}</span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Voltage</span>
                    <span className="ab-sum-val">{voltage ? `${voltage} V` : '-'}</span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">SOH (Health)</span>
                    <span className="ab-sum-val" style={{ color: health ? '#16A34A' : '#64748B' }}>{health ? `${health}%` : '-'}</span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Status</span>
                    <span className="ab-sum-val">{status || '-'}</span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Location</span>
                    <span className="ab-sum-val">{location || '-'}</span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Zone</span>
                    <span className="ab-sum-val">{zone || '-'}</span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Assigned To</span>
                    <span className="ab-sum-val" style={{ color: assignedTo && assignedTo !== 'Unassigned' ? '#2563EB' : '#334155' }}>
                      {assignedTo || '-'}
                    </span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Vehicle Number</span>
                    <span className="ab-sum-val">{vehicleNumber || '-'}</span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Rider Name</span>
                    <span className="ab-sum-val">{riderName || '-'}</span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Purchase Date</span>
                    <span className="ab-sum-val">{purchaseDate || '-'}</span>
                  </div>
                  <div className="ab-sum-item">
                    <span className="ab-sum-lbl">Warranty Valid Till</span>
                    <span className="ab-sum-val">{warrantyValidTill || '-'}</span>
                  </div>
                </div>

                <div className="ab-sum-banner">
                  <span className="ab-sum-banner-ic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </span>
                  Fill in the details to see summary
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
