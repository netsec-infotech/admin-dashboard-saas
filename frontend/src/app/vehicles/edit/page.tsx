"use client";
import { useState, useEffect, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

const CSS = `
.add-veh-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.add-veh-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.add-veh-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Breadcrumb styling */
.add-veh-bc { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #64748B; margin-bottom: 2px; }
.add-veh-bc-link { color: #64748B; text-decoration: none; cursor: pointer; }
.add-veh-bc-link:hover { color: #2a195c; }
.add-veh-bc-sep { color: #CBD5E1; }
.add-veh-bc-curr { color: #2A195C; }

/* Header and Actions bar */
.add-veh-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 4px; }
.add-veh-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 6px; letter-spacing: -0.02em; }
.add-veh-subtitle { font-size: 13.5px; color: #64748B; margin: 0; font-weight: 400; }

.add-veh-header-actions { display: flex; align-items: center; gap: 12px; }
.add-veh-btn { padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; border: 1.5px solid #E2E8F0; background: #fff; color: #475569; }
.add-veh-btn:hover { border-color: #2a195c; color: #2a195c; }
.add-veh-btn-draft { border-color: #8B5CF6; color: #8B5CF6; }
.add-veh-btn-draft:hover { background: #F5F3FF; }
.add-veh-btn-primary { background: #2a195c; color: #fff; border-color: #2a195c; }
.add-veh-btn-primary:hover { background: #4338CA; border-color: #4338CA; }

/* Workspace Grid Layout */
.add-veh-grid { display: grid; grid-template-columns: 7fr 3fr; gap: 20px; align-items: start; }
.add-veh-left-col { display: flex; flex-direction: column; gap: 20px; }
.add-veh-right-col { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 80px; }

/* Card styles */
.add-veh-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.add-veh-card-title-row { display: flex; align-items: center; gap: 8px; border-bottom: 1.5px solid #F1F5F9; padding-bottom: 14px; margin-bottom: 20px; }
.add-veh-card-icon { color: #6366F1; display: flex; align-items: center; }
.add-veh-card-title { font-size: 14.5px; font-weight: 700; color: #1E293B; margin: 0; }

/* Form inputs styling */
.add-veh-form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px 14px; }
.add-veh-form-grid-span2 { grid-column: span 2; }
.add-veh-form-grid-span4 { grid-column: span 4; }

.add-veh-field { display: flex; flex-direction: column; gap: 6px; }
.add-veh-label { font-size: 11.5px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px; }
.add-veh-req { color: #EF4444; }

.add-veh-input { width: 100%; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 500; outline: none; background: #fff; color: #1E293B; transition: border-color .15s; }
.add-veh-input::placeholder { color: #94A3B8; font-weight: 400; }
.add-veh-input:focus { border-color: #6366F1; }
.add-veh-input:disabled { background: #F8FAFC; color: #64748B; cursor: not-allowed; }

.add-veh-select { width: 100%; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 500; outline: none; background: #fff; color: #1E293B; transition: border-color .15s; cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 11px; padding-right: 32px; }
.add-veh-select:focus { border-color: #6366F1; }

.add-veh-textarea { width: 100%; height: 74px; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 500; outline: none; background: #fff; color: #1E293B; transition: border-color .15s; resize: none; font-family: inherit; }
.add-veh-textarea:focus { border-color: #6366F1; }

/* Document Upload layout */
.add-veh-upload-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; align-items: start; }
.add-veh-dropzone { border: 1.5px dashed #C084FC; background: #FAF5FF; border-radius: 10px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 8px; cursor: pointer; transition: background .15s; height: 160px; }
.add-veh-dropzone:hover { background: #F3E8FF; }
.add-veh-dropzone-ic { color: #A855F7; display: flex; align-items: center; }
.add-veh-dropzone-t { font-size: 12px; font-weight: 600; color: #2A195C; }
.add-veh-dropzone-b { font-size: 11.5px; color: #64748B; }
.add-veh-dropzone-s { font-size: 9.5px; color: #94A3B8; margin-top: 4px; }

.add-veh-docs-list { display: flex; flex-direction: column; gap: 10px; }
.add-veh-docs-title { font-size: 11.5px; font-weight: 700; color: #475569; margin: 0 0 4px; }
.add-veh-doc-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; background: #FAFBFD; border: 1px solid #F1F5F9; border-radius: 8px; }
.add-veh-doc-row:hover { background: #F8FAFC; }
.add-veh-doc-l { display: flex; align-items: center; gap: 8px; font-size: 11.5px; font-weight: 600; color: #475569; }
.add-veh-doc-ic { color: #94A3B8; display: flex; align-items: center; }
.add-veh-doc-btn { padding: 4px 12px; border: 1px solid #2A195C; background: #fff; color: #2A195C; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all .15s; }
.add-veh-doc-btn:hover { background: #2A195C; color: #fff; }

/* Right Panel Cards */
.add-veh-preview-img-box { width: 100%; height: 130px; background: #FAFBFD; border: 1px solid #F1F5F9; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 16px; position: relative; }
.add-veh-preview-img { width: auto; height: 100%; object-fit: contain; }

.add-veh-preview-table { width: 100%; display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.add-veh-preview-tr { display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; }
.add-veh-preview-td-lbl { color: #64748B; font-weight: 500; }
.add-veh-preview-td-val { color: #1E293B; font-weight: 700; }

.add-veh-badge { padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.add-veh-badge-green { background: #DCFCE7; color: #15803D; }
.add-veh-badge-orange { background: #FEF3C7; color: #D97706; }
.add-veh-badge-red { background: #FEE2E2; color: #B91C1C; }
.add-veh-badge-gray { background: #F1F5F9; color: #475569; }

.add-veh-btn-full { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; }

/* QR Code Section */
.add-veh-qr-box { display: flex; justify-content: center; padding: 12px; background: #FAFBFD; border: 1px dashed #E2E8F0; border-radius: 10px; margin: 12px 0 16px; min-height: 110px; align-items: center; }
.add-veh-qr-mock { display: flex; flex-direction: column; gap: 2px; }
.add-veh-qr-grid-row { display: flex; gap: 2px; }
.add-veh-qr-pixel { width: 5px; height: 5px; background: #E2E8F0; }
.add-veh-qr-pixel.active { background: #1E293B; }
.add-veh-qr-pixel.corner { background: #1E293B; outline: 1px solid #fff; }

.add-veh-qr-actions-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
`;

function EditVehicleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  // Unified Form State containing all requested columns
  const [formData, setFormData] = useState({
    vehicleId: 'Auto Generated',
    vehicleNumber: '',
    vehicleCategory: 'E-Scooter',
    vehicleType: 'Rental',
    evegahModelName: 'Evegah City',
    vehicleModel: '',
    vehicleManufacturer: '',
    manufacturingDate: '',
    chassisNumber: '',
    motorNumber: '',
    controllerNumber: '',
    registrationNumber: '',
    color: '',
    purchaseDate: '',
    vehicleWarrantyExpiryDate: '',
    insurancePolicyNumber: '',
    insuranceProvider: '',
    insuranceExpiryDate: '',
    currentKmReading: '',
    totalKmCovered: '',
    vehicleStatus: 'Available',
    vehicleDocument: '',
    vehicleQrCode: '',
    zone: 'Unassigned'
  });

  const [qrGenerated, setQrGenerated] = useState(false);
  const [vehicleImage, setVehicleImage] = useState('/City-1.png');

  useEffect(() => {
    if (!code) return;
    api.get(`/vehicles/${code}`)
      .then(res => {
        if (res && res.status === 'success' && res.data) {
          const v = res.data;
          setFormData({
            vehicleId: v.id || 'Auto Generated',
            vehicleNumber: v.code || '',
            vehicleCategory: v.vehicle_category || 'E-Scooter',
            vehicleType: v.vehicle_type || 'Rental',
            evegahModelName: v.evegah_model_name || 'Evegah City',
            vehicleModel: v.vehicle_model || '',
            vehicleManufacturer: v.vehicle_manufacturer || '',
            manufacturingDate: v.manufacturing_date ? new Date(v.manufacturing_date).toISOString().split('T')[0] : '',
            chassisNumber: v.chassis_number || '',
            motorNumber: v.motor_number || '',
            controllerNumber: v.controller_number || '',
            registrationNumber: v.registration_number || '',
            color: v.color || '',
            purchaseDate: v.purchase_date ? new Date(v.purchase_date).toISOString().split('T')[0] : '',
            vehicleWarrantyExpiryDate: v.vehicle_warranty_expiry_date ? new Date(v.vehicle_warranty_expiry_date).toISOString().split('T')[0] : '',
            insurancePolicyNumber: v.insurance_policy_number || '',
            insuranceProvider: v.insurance_provider || '',
            insuranceExpiryDate: v.insurance_expiry_date ? new Date(v.insurance_expiry_date).toISOString().split('T')[0] : '',
            currentKmReading: v.current_km_reading || '0',
            totalKmCovered: v.total_km_covered || '0',
            vehicleStatus: v.vehicle_status || 'Available',
            vehicleDocument: v.vehicle_document || '',
            vehicleQrCode: v.vehicle_qr_code || '',
            zone: v.zone || 'Unassigned'
          });
          setVehicleImage(v.vehicle_image || '/City-1.png');
          if (v.vehicle_qr_code) {
            setQrGenerated(true);
          }
        }
      })
      .catch(err => {
        console.error(err);
        alert('Failed to load vehicle details');
      });
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber) {
      alert('Please fill out the Vehicle Number');
      return;
    }
    try {
      const payload = { ...formData, vehicleImage };
      const res = await api.put(`/vehicles/${code}`, payload);
      if (res && res.status === 'success') {
        alert('Vehicle details updated successfully!');
        router.push('/vehicles/all');
      } else {
        alert('Error: ' + (res.message || 'Unknown error occurred'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to update vehicle: ' + (err.message || err));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'evegahModelName') {
        if (value === 'Evegah Mink') setVehicleImage('/Mink-1.png');
        else if (value === 'Evegah City') setVehicleImage('/City-1.png');
        else if (value === 'Evegah Fly') setVehicleImage('/fly-1.png');
        else if (value === 'Evegah Pro') setVehicleImage('/pro-1.png');
      }
      return next;
    });
  };

  const handleGenerateQR = () => {
    setQrGenerated(true);
    setFormData(prev => ({ ...prev, vehicleQrCode: `QR-EVE-${formData.vehicleNumber || 'UPD'}-${Math.floor(Math.random() * 9000 + 1000)}` }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVehicleImage(URL.createObjectURL(file));
    }
  };

  const handleDocUpload = () => {
    const docPath = `/documents/DOC-VEH-${Date.now()}.pdf`;
    setFormData(prev => ({ ...prev, vehicleDocument: docPath }));
    alert('Document uploaded successfully!');
  };

  const qrTarget = formData.vehicleNumber || (code as string) || 'EVM-UPD';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`https://app.evegah.com/vehicles/detail?code=${qrTarget}`)}`;

  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `QR-${qrTarget}.png`;
    a.target = '_blank';
    a.click();
  };

  const handlePrintSticker = () => {
    const printWin = window.open('', '_blank', 'width=450,height=520');
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>Vehicle Asset Tag - ${qrTarget}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fff; }
            .sticker { border: 2.5px dashed #0F172A; border-radius: 16px; padding: 24px; text-align: center; width: 280px; box-sizing: border-box; }
            .brand { font-size: 20px; font-weight: 900; color: #6366F1; letter-spacing: 1px; margin-bottom: 4px; }
            .sub { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 14px; }
            .qr-img { width: 170px; height: 170px; border-radius: 8px; border: 1px solid #E2E8F0; padding: 6px; }
            .code { font-size: 18px; font-weight: 800; color: #0F172A; margin-top: 12px; font-family: monospace; }
            .model { font-size: 12px; font-weight: 600; color: #334155; margin-top: 2px; }
            .zone { font-size: 10.5px; color: #94A3B8; margin-top: 4px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div class="brand">EVEGAH EV</div>
            <div class="sub">Asset Identification Tag</div>
            <img class="qr-img" src="${qrUrl}" alt="Vehicle QR" />
            <div class="code">${qrTarget}</div>
            <div class="model">${formData.evegahModelName || 'E-Vehicle'} • ${formData.vehicleCategory || 'EV'}</div>
            <div class="zone">Assigned to ${formData.zone || 'Gotri Hub'}</div>
          </div>
          <script>
            setTimeout(() => { window.print(); window.close(); }, 400);
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const getVehicleStatusBadgeClass = () => {
    switch (formData.vehicleStatus) {
      case 'Available': return 'add-veh-badge-green';
      case 'Maintenance': return 'add-veh-badge-red';
      default: return 'add-veh-badge-gray';
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="add-veh-shell">
        <Sidebar activePath="/vehicles/all" />
        
        <div className="add-veh-main">
        <TopBar />
        
        <div className="add-veh-page">
          {/* Breadcrumb */}
          <div className="add-veh-bc">
            <span className="add-veh-bc-link" onClick={() => router.push('/')}>Home</span>
            <span className="add-veh-bc-sep">&gt;</span>
            <span className="add-veh-bc-link" onClick={() => router.push('/vehicles/all')}>Vehicles</span>
            <span className="add-veh-bc-sep">&gt;</span>
            <span className="add-veh-bc-curr">Edit Vehicle: {code}</span>
          </div>

          {/* Title Header */}
          <div className="add-veh-header">
            <div>
              <h1 className="add-veh-title">Edit Vehicle Details</h1>
              <p className="add-veh-subtitle">Modify the fields and save updates to this vehicle.</p>
            </div>
            <div className="add-veh-header-actions">
              <button className="add-veh-btn" onClick={() => router.push('/vehicles/all')}>Cancel</button>
              <button className="add-veh-btn add-veh-btn-draft" onClick={handleSubmit}>Save Draft</button>
              <button className="add-veh-btn add-veh-btn-primary" onClick={handleSubmit}>Save Changes</button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="add-veh-grid">
            <div className="add-veh-left-col">
              
              {/* Card 1: Basic Information */}
              <div className="add-veh-card">
                <div className="add-veh-card-title-row">
                  <span className="add-veh-card-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="5.5" cy="17.5" r="3.5" />
                      <circle cx="18.5" cy="17.5" r="3.5" />
                      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" />
                      <path d="M5.5 17.5l4-8h4l2.5 8" />
                      <path d="M8.5 12h5" />
                      <path d="M12 9l-1.5 2.5h2L11 14" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <h2 className="add-veh-card-title">Basic Information</h2>
                </div>

                <div className="add-veh-form-grid">
                  <div className="add-veh-field">
                    <label className="add-veh-label">Vehicle ID</label>
                    <input 
                      type="text" 
                      name="vehicleId"
                      className="add-veh-input" 
                      value={formData.vehicleId} 
                      disabled 
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Vehicle Number <span className="add-veh-req">*</span></label>
                    <input 
                      type="text" 
                      name="vehicleNumber"
                      className="add-veh-input" 
                      placeholder="e.g. MH12AB1234" 
                      value={formData.vehicleNumber}
                      disabled
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Vehicle Category</label>
                    <select 
                      name="vehicleCategory" 
                      className="add-veh-select"
                      value={formData.vehicleCategory}
                      onChange={handleInputChange}
                    >
                      <option value="E-Scooter">E-Scooter</option>
                      <option value="E-Bike">E-Bike</option>
                      <option value="E-Cycle">E-Cycle</option>
                      <option value="EV Auto">EV Auto</option>
                      <option value="EV Car">EV Car</option>
                      <option value="Delivery EV">Delivery EV</option>
                      <option value="Campus EV">Campus EV</option>
                    </select>
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Vehicle Type</label>
                    <select 
                      name="vehicleType" 
                      className="add-veh-select"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                    >
                      <option value="Rental">Rental</option>
                      <option value="Sharing">Sharing</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Tourism">Tourism</option>
                      <option value="Campus">Campus</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                  </div>

                  <div className="add-veh-field">
                    <label className="add-veh-label">Evegah Model Name</label>
                    <select 
                      name="evegahModelName" 
                      className="add-veh-select"
                      value={formData.evegahModelName}
                      onChange={handleInputChange}
                    >
                      <option value="Evegah City">Evegah City</option>
                      <option value="Evegah Mink">Evegah Mink</option>
                      <option value="Evegah Fly">Evegah Fly</option>
                      <option value="Evegah Pro">Evegah Pro</option>
                    </select>
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Vehicle Model (Mfg Name)</label>
                    <input 
                      type="text" 
                      name="vehicleModel"
                      className="add-veh-input" 
                      placeholder="e.g. Model-V1" 
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Vehicle Manufacturer</label>
                    <input 
                      type="text" 
                      name="vehicleManufacturer"
                      className="add-veh-input" 
                      placeholder="Manufacturer/Supplier" 
                      value={formData.vehicleManufacturer}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Manufacturing Date</label>
                    <input 
                      type="date" 
                      name="manufacturingDate"
                      className="add-veh-input" 
                      value={formData.manufacturingDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Technical Specifications */}
              <div className="add-veh-card">
                <div className="add-veh-card-title-row">
                  <span className="add-veh-card-icon" style={{ color: '#10B981' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
                    </svg>
                  </span>
                  <h2 className="add-veh-card-title">Technical Specifications</h2>
                </div>

                <div className="add-veh-form-grid">
                  <div className="add-veh-field">
                    <label className="add-veh-label">Chassis Number</label>
                    <input 
                      type="text" 
                      name="chassisNumber"
                      className="add-veh-input" 
                      placeholder="Enter chassis number" 
                      value={formData.chassisNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Motor Number</label>
                    <input 
                      type="text" 
                      name="motorNumber"
                      className="add-veh-input" 
                      placeholder="Enter motor number" 
                      value={formData.motorNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Controller Number</label>
                    <input 
                      type="text" 
                      name="controllerNumber"
                      className="add-veh-input" 
                      placeholder="Enter controller number" 
                      value={formData.controllerNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Registration Number</label>
                    <input 
                      type="text" 
                      name="registrationNumber"
                      className="add-veh-input" 
                      placeholder="Enter registration plates" 
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="add-veh-field">
                    <label className="add-veh-label">Color</label>
                    <input 
                      type="text" 
                      name="color"
                      className="add-veh-input" 
                      placeholder="e.g. Purple, Black" 
                      value={formData.color}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Purchase Date</label>
                    <input 
                      type="date" 
                      name="purchaseDate"
                      className="add-veh-input" 
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Warranty Expiry Date</label>
                    <input 
                      type="date" 
                      name="vehicleWarrantyExpiryDate"
                      className="add-veh-input" 
                      value={formData.vehicleWarrantyExpiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Vehicle Status</label>
                    <select 
                      name="vehicleStatus" 
                      className="add-veh-select"
                      value={formData.vehicleStatus}
                      onChange={handleInputChange}
                    >
                      <option value="Available">Available</option>
                      <option value="In Ride">In Ride</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Low Battery">Low Battery</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 3: Insurance & Usage */}
              <div className="add-veh-card">
                <div className="add-veh-card-title-row">
                  <span className="add-veh-card-icon" style={{ color: '#F59E0B' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </span>
                  <h2 className="add-veh-card-title">Insurance, Usage & Zone</h2>
                </div>

                <div className="add-veh-form-grid">
                  <div className="add-veh-field">
                    <label className="add-veh-label">Insurance Policy Number</label>
                    <input 
                      type="text" 
                      name="insurancePolicyNumber"
                      className="add-veh-input" 
                      placeholder="Policy details (optional)" 
                      value={formData.insurancePolicyNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Insurance Provider</label>
                    <input 
                      type="text" 
                      name="insuranceProvider"
                      className="add-veh-input" 
                      placeholder="Provider name (optional)" 
                      value={formData.insuranceProvider}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Insurance Expiry Date</label>
                    <input 
                      type="date" 
                      name="insuranceExpiryDate"
                      className="add-veh-input" 
                      value={formData.insuranceExpiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Current KM Reading</label>
                    <input 
                      type="number" 
                      name="currentKmReading"
                      className="add-veh-input" 
                      placeholder="0.0" 
                      value={formData.currentKmReading}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field">
                    <label className="add-veh-label">Total KM Covered</label>
                    <input 
                      type="number" 
                      name="totalKmCovered"
                      className="add-veh-input" 
                      placeholder="0.0" 
                      value={formData.totalKmCovered}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="add-veh-field add-veh-form-grid-span2">
                    <label className="add-veh-label">Assign Zone</label>
                    <select 
                      name="zone"
                      className="add-veh-select"
                      value={formData.zone}
                      onChange={handleInputChange}
                    >
                      <option value="Unassigned">Unassigned (None)</option>
                      <option value="Gotri Zone">Gotri Zone</option>
                      <option value="Manjalpur Zone">Manjalpur Zone</option>
                      <option value="KPGU Zone">KPGU Zone</option>
                      <option value="Aatapi Zone">Aatapi Zone</option>
                      <option value="Moti Daman Zone">Moti Daman Zone</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 4: Documents & Images */}
              <div className="add-veh-card">
                <div className="add-veh-card-title-row">
                  <span className="add-veh-card-icon" style={{ color: '#8B5CF6' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </span>
                  <h2 className="add-veh-card-title">Vehicle Image & Document</h2>
                </div>

                <div className="add-veh-upload-grid">
                  <label style={{ border: '1.5px dashed #C084FC', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: '#FAF5FF', cursor: 'pointer', height: '140px', transition: 'background 0.15s' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                    />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#A855F7', marginBottom: '6px' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#2A195C' }}>Upload Vehicle Photo</span>
                    <span style={{ fontSize: '9px', color: '#94A3B8', marginTop: '2px' }}>PNG, JPG up to 4MB</span>
                  </label>

                  <div className="add-veh-docs-list">
                    <div className="add-veh-doc-row">
                      <span className="add-veh-doc-l">
                        <span className="add-veh-doc-ic">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </span>
                        Registration Certificate / Documents
                      </span>
                      <button className="add-veh-doc-btn" type="button" onClick={handleDocUpload}>
                        {formData.vehicleDocument ? 'Uploaded' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="add-veh-right-col">
              
              {/* Vehicle Preview card */}
              <div className="add-veh-card">
                <div className="add-veh-card-title-row">
                  <h2 className="add-veh-card-title">Live Preview</h2>
                </div>
                
                <div className="add-veh-preview-img-box">
                  <img 
                    src={vehicleImage} 
                    alt="Vehicle Preview" 
                    style={{ width: 'auto', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div className="add-veh-preview-table">
                  <div className="add-veh-preview-tr">
                    <span className="add-veh-preview-td-lbl">Number</span>
                    <span className="add-veh-preview-td-val">{formData.vehicleNumber || 'MH12AB1234'}</span>
                  </div>
                  <div className="add-veh-preview-tr">
                    <span className="add-veh-preview-td-lbl">Model Name</span>
                    <span className="add-veh-preview-td-val">{formData.evegahModelName}</span>
                  </div>
                  <div className="add-veh-preview-tr">
                    <span className="add-veh-preview-td-lbl">Category</span>
                    <span className="add-veh-preview-td-val">{formData.vehicleCategory}</span>
                  </div>
                  <div className="add-veh-preview-tr">
                    <span className="add-veh-preview-td-lbl">Status</span>
                    <span className={`add-veh-badge ${getVehicleStatusBadgeClass()}`}>
                      {formData.vehicleStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="add-veh-card">
                <div className="add-veh-card-title-row" style={{ justifyContent: 'space-between' }}>
                  <h2 className="add-veh-card-title">Asset QR Code</h2>
                  <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>Real Scannable</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px', background: '#FAFBFD', border: '1.5px solid #E2E8F0', borderRadius: '12px', margin: '8px 0 14px' }}>
                  <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', border: '1px solid #CBD5E1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <img 
                      src={qrUrl} 
                      alt={`QR Code for ${qrTarget}`} 
                      style={{ width: '140px', height: '140px', display: 'block' }} 
                    />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '10px', fontFamily: 'monospace' }}>
                    {qrTarget}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                    Scannable via Evegah Hub / Mobile App
                  </div>
                </div>

                <div className="add-veh-qr-actions-row">
                  <button 
                    className="add-veh-btn" 
                    style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} 
                    type="button"
                    onClick={handleDownloadQR}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download
                  </button>
                  <button 
                    className="add-veh-btn" 
                    style={{ fontSize: '12px', fontWeight: 700, borderColor: '#6366F1', color: '#6366F1', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} 
                    type="button"
                    onClick={handlePrintSticker}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Print Sticker
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

export default function EditVehiclePage() {
  return (
    <Suspense fallback={<div>Loading vehicle editor...</div>}>
      <EditVehicleForm />
    </Suspense>
  );
}
