"use client";
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.ad-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.ad-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.ad-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Breadcrumb */
.ad-bc { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #64748B; font-weight: 500; }
.ad-bc a { color: #64748B; text-decoration: none; }
.ad-bc a:hover { color: #6D28D9; }
.ad-bc-sep { color: #94A3B8; }
.ad-bc-cur { color: #1E293B; font-weight: 600; }

/* Header title */
.ad-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.ad-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; letter-spacing: -0.02em; }
.ad-sub { font-size: 13px; color: #64748B; margin: 0; }
.ad-back-btn { display: flex; align-items: center; gap: 7px; padding: 8px 14px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #475569; cursor: pointer; transition: all .15s; }
.ad-back-btn:hover { border-color: #6D28D9; color: #6D28D9; }

/* Dual Column Layout */
.ad-layout-split { display: grid; grid-template-columns: 2.1fr 0.9fr; gap: 20px; }
.ad-form-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 22px; }
.ad-section-title { font-size: 14px; font-weight: 800; color: #0F172A; border-bottom: 1.5px solid #F1F5F9; padding-bottom: 8px; margin: 0 0 4px 0; }

/* Form inputs */
.ad-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.ad-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.ad-form-group { display: flex; flex-direction: column; gap: 5px; }
.ad-form-lbl { font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.02em; }
.ad-form-lbl span { color: #EF4444; }
.ad-inp { padding: 8px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; font-weight: 500; }
.ad-inp:focus { border-color: #6D28D9; }
.ad-select { padding: 8px 10px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #334155; cursor: pointer; }
.ad-select:focus { border-color: #6D28D9; }

/* Table for device rows */
.ad-table-wrap { border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; margin-top: 10px; }
.ad-tbl { width: 100%; border-collapse: collapse; }
.ad-tbl th { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; padding: 8px 12px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; text-align: left; }
.ad-tbl td { padding: 8px 12px; font-size: 12.5px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.ad-tbl tr:last-child td { border-bottom: none; }
.ad-tag-bound { background: #DCFCE7; color: #16A34A; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
.ad-tag-unbound { background: #F1F5F9; color: #64748B; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; }
.ad-btn-del { width: 24px; height: 24px; border: 1.5px solid #FEE2E2; background: #fff; color: #EF4444; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.ad-btn-del:hover { background: #FEE2E2; }

/* Upload Drag Drop */
.ad-dropzone { border: 2.2px dashed #E2E8F0; border-radius: 12px; padding: 24px; text-align: center; color: #64748B; cursor: pointer; transition: all .15s; background: #FAFBFD; }
.ad-dropzone:hover { border-color: #6D28D9; background: #F5F3FF; }
.ad-dropzone-ic { font-size: 24px; margin-bottom: 8px; }

/* Right Panel Cards */
.ad-side-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.ad-side-card-hdr { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 800; color: #0F172A; text-transform: uppercase; border-bottom: 1.5px solid #F1F5F9; padding-bottom: 8px; }
.ad-side-card-hdr span { font-size: 16px; }

.ad-summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; padding-bottom: 6px; border-bottom: 1px dashed #F1F5F9; }
.ad-summary-row:last-child { border-bottom: none; padding-bottom: 0; }
.ad-summary-lbl { color: #64748B; font-weight: 500; }
.ad-summary-val { font-weight: 700; color: #1E293B; }

/* Bound list UI */
.ad-bound-list { display: flex; flex-direction: column; gap: 8px; }
.ad-bound-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1.2px solid #E2E8F0; border-radius: 8px; background: #FAFBFD; font-size: 12px; }
.ad-bound-item-left { display: flex; gap: 8px; align-items: center; }
.ad-bound-ic { font-size: 16px; width: 28px; height: 28px; border-radius: 50%; background: #EEF2FF; display: flex; align-items: center; justify-content: center; color: #2A195C; }
.ad-bound-title { font-weight: 700; color: #1E293B; }
.ad-bound-sub { font-size: 10.5px; color: #64748B; margin-top: 1px; }

/* Bottom Action Row */
.ad-footer-actions { display: flex; justify-content: flex-end; gap: 10px; border-top: 1.5px solid #F1F5F9; padding-top: 18px; margin-top: 10px; }
`;

interface DeviceRow {
  key: string;
  type: string;
  model: string;
  serial: string;
  vehiclePlate: string;
  vehicleModel: string;
}

export default function AddInwardPage() {
  const router = useRouter();
  
  // Form top states
  const [supplier, setSupplier] = useState('GlideX IoT Pvt. Ltd.');
  const [invoiceNo, setInvoiceNo] = useState('INV-2024-0587');
  const [invoiceDate, setInvoiceDate] = useState('2026-06-15');
  const [poNo, setPoNo] = useState('PO-2024-1256');

  // Input Device States
  const [inpType, setInpType] = useState('GPS Tracker');
  const [inpModel, setInpModel] = useState('GLX-GT06');
  const [inpSerial, setInpSerial] = useState('GLXGT060519240087');

  // Inline added device items
  const [devices, setDevices] = useState<DeviceRow[]>([
    { key: '1', type: 'GPS Tracker', model: 'GLX-GT06', serial: 'GLXGT060519240087', vehiclePlate: 'GJ 06 EV 1024', vehicleModel: 'Evegah City' },
    { key: '2', type: '4G Telematics', model: 'TRK-4G-01', serial: 'TRK4G010519240088', vehiclePlate: '', vehicleModel: '' }
  ]);

  // Form bottom states
  const [receivedOn, setReceivedOn] = useState('19 May 2024, 11:45 AM');
  const [receivedBy, setReceivedBy] = useState('Himanshu');
  const [location, setLocation] = useState('Gotri Warehouse');
  const [notes, setNotes] = useState('Regular shipment checkup');

  // Vehicle choices for binding select
  const VEHICLES = [
    { plate: 'GJ 06 EV 1024', model: 'Evegah City' },
    { plate: 'GJ 06 EV 1025', model: 'Evegah Mink' },
    { plate: 'GJ 06 EV 1026', model: 'Evegah City' }
  ];

  // Model dictionary map helper
  const handleTypeChange = (typeVal: string) => {
    setInpType(typeVal);
    if (typeVal === 'GPS Tracker') setInpModel('GLX-GT06');
    else if (typeVal === '4G Telematics') setInpModel('TRK-4G-01');
    else if (typeVal === 'Fuel Sensor') setInpModel('FLS-100');
    else if (typeVal === 'OBD Device') setInpModel('TRK-OBD-02');
    else if (typeVal === 'Temperature Sensor') setInpModel('TMP-01');
    else if (typeVal === 'Door Sensor') setInpModel('DRS-01');
  };

  // Add device to table
  const addDeviceRow = () => {
    if (!inpSerial) {
      alert('Please enter a Serial No. / IMEI');
      return;
    }
    // Prevent duplicate serial entry
    if (devices.some(d => d.serial.toLowerCase() === inpSerial.toLowerCase())) {
      alert('A device with this serial number is already added.');
      return;
    }
    const newRow: DeviceRow = {
      key: Date.now().toString(),
      type: inpType,
      model: inpModel,
      serial: inpSerial,
      vehiclePlate: '',
      vehicleModel: ''
    };
    setDevices([...devices, newRow]);
    setInpSerial('');
  };

  // Bind vehicle dropdown change handler
  const handleBindVehicle = (key: string, vehiclePlate: string) => {
    const selectedVeh = VEHICLES.find(v => v.plate === vehiclePlate);
    const updated = devices.map(d => {
      if (d.key === key) {
        return {
          ...d,
          vehiclePlate: vehiclePlate,
          vehicleModel: selectedVeh ? selectedVeh.model : ''
        };
      }
      return d;
    });
    setDevices(updated);
  };

  // Delete device from table
  const deleteDeviceRow = (key: string) => {
    setDevices(devices.filter(d => d.key !== key));
  };

  // Save the complete Inward form
  const handleSave = async () => {
    if (!invoiceNo || !supplier) {
      alert('Supplier and Invoice No. are required fields');
      return;
    }
    if (devices.length === 0) {
      alert('Please add at least one device to this inward checklist.');
      return;
    }

    try {
      const payload = {
        supplier,
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        po_no: poNo,
        device_type: devices[0]?.type || 'GPS Tracker',
        device_model: devices[0]?.model || 'GLX-GT06',
        quantity: devices.length,
        status: 'Completed',
        qc_status: 'Accepted',
        devices: devices.map(d => ({
          serial_number: d.serial,
          device_type: d.type,
          device_model: d.model,
          supplier: supplier,
          assigned_vehicle_code: d.vehiclePlate || null
        }))
      };

      const res = await fetch('http://localhost:5000/api/iot/inward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Server rejected inward record');
      }

      alert(`Inward record logged successfully!\nInvoice No: ${invoiceNo}\nTotal Devices: ${devices.length}`);
      router.push('/iot-devices/inward');
    } catch (err: any) {
      alert(`Error submitting inward batch: ${err.message}`);
    }
  };

  // Real-time calculated properties
  const totalQty = devices.length;
  const boundDevices = devices.filter(d => d.vehiclePlate !== '');
  const unboundDevices = devices.filter(d => d.vehiclePlate === '');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ad-shell">
        <Sidebar activePath="/iot-devices/inward" />
        <div className="ad-main">
          <TopBar />
          <div className="ad-page">
            {/* Breadcrumbs */}
            <div className="ad-bc">
              <a href="/">Dashboard</a>
              <span className="ad-bc-sep">&gt;</span>
              <a href="/iot-devices/inward">IoT Devices</a>
              <span className="ad-bc-sep">&gt;</span>
              <span className="ad-bc-cur">Add Inward</span>
            </div>

            {/* Title row */}
            <div className="ad-title-row">
              <div>
                <h1 className="ad-h1">Add Inward</h1>
                <p className="ad-sub">Record a new inward for IoT devices received in your zone.</p>
              </div>
              <button className="ad-back-btn" onClick={() => router.push('/iot-devices/inward')}>
                ← Back to Inward
              </button>
            </div>

            {/* Split layout: Form left, summary cards right */}
            <div className="ad-layout-split">
              
              {/* Form card left */}
              <div className="ad-form-card">
                
                {/* 1. Supplier & Invoice details */}
                <div>
                  <h3 className="ad-section-title">1. Supplier & Invoice Details</h3>
                  <div className="ad-grid-4" style={{ marginTop: '10px' }}>
                    <div className="ad-form-group">
                      <label className="ad-form-lbl">Supplier <span>*</span></label>
                      <select className="ad-select" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                        <option value="GlideX IoT Pvt. Ltd.">GlideX IoT Pvt. Ltd.</option>
                        <option value="Tracko Devices">Tracko Devices</option>
                        <option value="IoTech Solutions">IoTech Solutions</option>
                        <option value="SmartSense IoT">SmartSense IoT</option>
                      </select>
                    </div>
                    <div className="ad-form-group">
                      <label className="ad-form-lbl">Invoice No. <span>*</span></label>
                      <input type="text" className="ad-inp" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
                    </div>
                    <div className="ad-form-group">
                      <label className="ad-form-lbl">Invoice Date <span>*</span></label>
                      <input type="date" className="ad-inp" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                    </div>
                    <div className="ad-form-group">
                      <label className="ad-form-lbl">Purchase Order (PO No.)</label>
                      <input type="text" className="ad-inp" placeholder="Optional PO reference..." value={poNo} onChange={(e) => setPoNo(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* 2. Device Details entry */}
                <div>
                  <h3 className="ad-section-title">2. Device Details</h3>
                  <div className="ad-grid-4" style={{ marginTop: '10px', alignItems: 'flex-end' }}>
                    <div className="ad-form-group">
                      <label className="ad-form-lbl">Device Type <span>*</span></label>
                      <select className="ad-select" value={inpType} onChange={(e) => handleTypeChange(e.target.value)}>
                        <option value="GPS Tracker">GPS Tracker</option>
                        <option value="4G Telematics">4G Telematics</option>
                        <option value="Fuel Sensor">Fuel Sensor</option>
                        <option value="OBD Device">OBD Device</option>
                        <option value="Temperature Sensor">Temperature Sensor</option>
                        <option value="Door Sensor">Door Sensor</option>
                      </select>
                    </div>
                    <div className="ad-form-group">
                      <label className="ad-form-lbl">Device Model <span>*</span></label>
                      <select className="ad-select" value={inpModel} onChange={(e) => setInpModel(e.target.value)}>
                        <option value={inpModel}>{inpModel}</option>
                      </select>
                    </div>
                    <div className="ad-form-group" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label className="ad-form-lbl">Serial No. / IMEI No. <span>*</span></label>
                        <input type="text" className="ad-inp" placeholder="e.g. GLXGT060519240087..." value={inpSerial} onChange={(e) => setInpSerial(e.target.value)} />
                      </div>
                      <button className="ad-back-btn" style={{ padding: '9px 16px', whiteSpace: 'nowrap' }} onClick={addDeviceRow}>
                        + Add Another
                      </button>
                    </div>
                  </div>

                  {/* Device List Table */}
                  <div className="ad-table-wrap">
                    <table className="ad-tbl">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>#</th>
                          <th>Device Type</th>
                          <th>Model</th>
                          <th>Serial No. / IMEI No.</th>
                          <th>Bind to Vehicle</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {devices.map((dev, idx) => (
                          <tr key={dev.key}>
                            <td>{idx + 1}</td>
                            <td style={{ fontWeight: 700 }}>{dev.type}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '11.5px' }}>{dev.model}</td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{dev.serial}</td>
                            <td>
                              {dev.vehiclePlate ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className="ad-tag-bound">
                                    🟢 Bound to {dev.vehiclePlate}
                                  </span>
                                  <button style={{ border: 'none', background: 'none', color: '#EF4444', fontWeight: 700, cursor: 'pointer', fontSize: '11px' }} onClick={() => handleBindVehicle(dev.key, '')}>
                                    Unbind
                                  </button>
                                </div>
                              ) : (
                                <select className="ad-select" style={{ padding: '4px 8px', fontSize: '12px' }} value="" onChange={(e) => handleBindVehicle(dev.key, e.target.value)}>
                                  <option value="">Select vehicle (optional)</option>
                                  {VEHICLES.map(v => (
                                    <option key={v.plate} value={v.plate}>{v.plate} ({v.model})</option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button className="ad-btn-del" title="Delete device" onClick={() => deleteDeviceRow(dev.key)}>✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                    Total Devices added: {totalQty}
                  </div>
                </div>

                {/* 3. Additional information */}
                <div>
                  <h3 className="ad-section-title">3. Additional Information</h3>
                  <div className="ad-grid-3" style={{ marginTop: '10px' }}>
                    <div className="ad-form-group">
                      <label className="ad-form-lbl">Received On <span>*</span></label>
                      <input type="text" className="ad-inp" value={receivedOn} onChange={(e) => setReceivedOn(e.target.value)} />
                    </div>
                    <div className="ad-form-group">
                      <label className="ad-form-lbl">Received By <span>*</span></label>
                      <select className="ad-select" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)}>
                        <option value="Himanshu">Himanshu (Super Admin)</option>
                        <option value="Speed Force">Speed Force (Zone Admin)</option>
                        <option value="Suresh Dev">Suresh Dev (Zone Auditor)</option>
                      </select>
                    </div>
                    <div className="ad-form-group">
                      <label className="ad-form-lbl">Location / Warehouse <span>*</span></label>
                      <select className="ad-select" value={location} onChange={(e) => setLocation(e.target.value)}>
                        <option value="Gotri Warehouse">Gotri Warehouse</option>
                        <option value="Manjalpur Warehouse">Manjalpur Warehouse</option>
                        <option value="KPGU Warehouse">KPGU Warehouse</option>
                      </select>
                    </div>
                  </div>
                  <div className="ad-form-group" style={{ marginTop: '12px' }}>
                    <label className="ad-form-lbl">Notes (Optional)</label>
                    <textarea className="ad-inp" style={{ minHeight: '80px', fontFamily: 'inherit' }} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                </div>

                {/* 4. Attachments drag drop */}
                <div>
                  <h3 className="ad-section-title">4. Attachments (Optional)</h3>
                  <div className="ad-dropzone" onClick={() => alert('Opening file selection dialog')}>
                    <div className="ad-dropzone-ic">📁</div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1F2937' }}>
                      Drag and drop files here, or <span style={{ color: '#6D28D9', textDecoration: 'underline' }}>click to browse</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                      Supports: PDF, JPG, PNG (Max 5MB each)
                    </div>
                  </div>
                </div>

                {/* Footer buttons left side */}
                <div className="ad-footer-actions">
                  <button className="ad-back-btn" style={{ padding: '9px 18px' }} onClick={() => router.push('/iot-devices/inward')}>
                    Cancel
                  </button>
                  <button className="io-btn-primary io-btn" style={{ padding: '9px 24px' }} onClick={handleSave}>
                    Save Inward
                  </button>
                </div>

              </div>

              {/* Side panels right */}
              <div>
                
                {/* Summary Card */}
                <div className="ad-side-card">
                  <div className="ad-side-card-hdr">
                    <span>📋</span>
                    <span>Inward Summary</span>
                  </div>
                  <div className="ad-summary-row">
                    <span className="ad-summary-lbl">Total Devices</span>
                    <span className="ad-summary-val">{totalQty}</span>
                  </div>
                  <div className="ad-summary-row">
                    <span className="ad-summary-lbl">Total Quantity</span>
                    <span className="ad-summary-val">{totalQty}</span>
                  </div>
                  <div className="ad-summary-row">
                    <span className="ad-summary-lbl">Bound to Vehicles</span>
                    <span className="ad-summary-val" style={{ color: '#16A34A' }}>{boundDevices.length}</span>
                  </div>
                  <div className="ad-summary-row">
                    <span className="ad-summary-lbl">Unbound Devices</span>
                    <span className="ad-summary-val" style={{ color: '#EA580C' }}>{unboundDevices.length}</span>
                  </div>
                  <div className="ad-summary-row">
                    <span className="ad-summary-lbl">Invoice Info</span>
                    <span className="ad-summary-val">{supplier.split(' ')[0]} / {invoiceNo}</span>
                  </div>
                  <div className="ad-summary-row">
                    <span className="ad-summary-lbl">Received On</span>
                    <span className="ad-summary-val" style={{ fontSize: '11px' }}>{receivedOn}</span>
                  </div>
                </div>

                {/* Vehicle Binding details */}
                <div className="ad-side-card">
                  <div className="ad-side-card-hdr">
                    <span>🔗</span>
                    <span>Vehicle Binding Summary</span>
                  </div>
                  
                  <div className="ad-bound-list">
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', marginBottom: '2px' }}>
                      🟢 {boundDevices.length} Bound
                    </div>
                    {boundDevices.map(b => (
                      <div key={b.key} className="ad-bound-item">
                        <div className="ad-bound-item-left">
                          <div className="ad-bound-ic">🚚</div>
                          <div>
                            <div className="ad-bound-title">{b.vehiclePlate}</div>
                            <div className="ad-bound-sub">{b.vehicleModel}</div>
                          </div>
                        </div>
                        <div style={{ color: '#64748B', fontWeight: 600, fontSize: '11px' }}>
                          1 Device &gt;
                        </div>
                      </div>
                    ))}

                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#EA580C', marginTop: '10px', marginBottom: '2px' }}>
                      🟠 {unboundDevices.length} Unbound Device
                    </div>
                    {unboundDevices.map(u => (
                      <div key={u.key} className="ad-bound-item" style={{ borderLeft: '3px solid #EA580C' }}>
                        <div className="ad-bound-item-left">
                          <div className="ad-bound-ic" style={{ background: '#FFF7ED', color: '#EA580C' }}>📱</div>
                          <div>
                            <div className="ad-bound-title">{u.type}</div>
                            <div className="ad-bound-sub">{u.model} (S/N: {u.serial.substring(0, 8)}...)</div>
                          </div>
                        </div>
                        <div style={{ color: '#64748B', fontWeight: 600, fontSize: '11px' }}>
                          1 Device &gt;
                        </div>
                      </div>
                    ))}
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
