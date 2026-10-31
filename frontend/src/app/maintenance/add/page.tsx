"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

const CSS = `
.ma-page {
  display: flex;
  min-height: 100vh;
  background: #F8F9FF;
  font-family: 'Inter', sans-serif;
}
.ma-main {
  margin-left: 230px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100% - 230px);
}
.ma-body {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Breadcrumb */
.ma-bc {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}
.ma-bc-link {
  color: #2A195C;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}
.ma-bc-sep {
  color: #CBD5E1;
}
.ma-bc-cur {
  color: #0F172A;
  font-weight: 700;
}

/* Header Row */
.ma-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-top: -4px;
}
.ma-h1 {
  font-size: 24px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.02em;
}
.ma-sub {
  font-size: 13px;
  color: #64748B;
  margin: 4px 0 0;
  font-weight: 500;
}

/* Actions */
.ma-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ma-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
  height: 40px;
  box-sizing: border-box;
}
.ma-btn-outline {
  background: #FFF;
  border: 1.5px solid #2A195C;
  color: #2A195C;
}
.ma-btn-outline:hover {
  background: #F5F3FF;
}
.ma-btn-primary {
  background: #2A195C;
  border: 1.5px solid #2A195C;
  color: #FFF;
}
.ma-btn-primary:hover {
  background: #1E1145;
  border-color: #1E1145;
}

/* Grid Layout */
.ma-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
}
.ma-form-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Form Section Card */
.ma-section {
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,.01);
}
.ma-section-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 18px;
  border-bottom: 1.5px solid #F8FAFC;
  padding-bottom: 8px;
}
.ma-fields-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.ma-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ma-field-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.ma-field-label::after {
  content: ' *';
  color: #EF4444;
}
.ma-field-label-optional::after {
  content: '';
}
.ma-input, .ma-select-field {
  height: 38px;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 12.5px;
  color: #1E293B;
  outline: none;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;
  background: #FFF;
}
.ma-input:focus, .ma-select-field:focus {
  border-color: #2A195C;
}
.ma-input:disabled {
  background: #F8FAFC;
  color: #64748B;
  cursor: not-allowed;
}
.ma-textarea {
  grid-column: span 3;
  min-height: 80px;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12.5px;
  color: #1E293B;
  outline: none;
  font-family: inherit;
  font-weight: 500;
  box-sizing: border-box;
}
.ma-textarea:focus {
  border-color: #2A195C;
}

/* Parts Table */
.ma-parts-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}
.ma-parts-table th {
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  padding: 10px;
  border-bottom: 1.5px solid #F1F5F9;
  text-align: left;
}
.ma-parts-table td {
  padding: 10px;
  border-bottom: 1px solid #F1F5F9;
}
.ma-trash-btn {
  background: none;
  border: none;
  color: #EF4444;
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ma-trash-btn:hover {
  color: #DC2626;
}

/* Sidebar Details */
.ma-sidebar-box {
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.01);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.ma-sidebar-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
}
.ma-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  color: #475569;
  font-weight: 500;
}
.ma-summary-row-bold {
  font-weight: 800;
  color: #0F172A;
  font-size: 15px;
}
.ma-divider {
  height: 1px;
  background: #F1F5F9;
}

/* Checklist Preview list */
.ma-chk-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ma-chk-preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #374151;
  font-weight: 600;
}
.ma-chk-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #FFF;
  flex-shrink: 0;
}
.ma-chk-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 700;
}

/* Photos Grid */
.ma-photos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.ma-photo-card {
  height: 60px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  position: relative;
}
.ma-photo-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ma-photo-card-del {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0,0,0,0.5);
  color: #FFF;
  border: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  cursor: pointer;
}
.ma-upload-dashed {
  height: 60px;
  border: 1.5px dashed #CBD5E1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  background: #F8FAFC;
}

/* Quick Actions Button Grid */
.ma-qa-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.ma-qa-btn {
  padding: 10px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  background: #FFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.ma-qa-btn:hover {
  border-color: #2A195C;
  background: #F5F3FF;
}
.ma-qa-btn-icon {
  font-size: 18px;
}
.ma-qa-btn-text {
  font-size: 11px;
  font-weight: 700;
  color: #374151;
}
`;

interface PartRow {
  partName: string;
  partNo: string;
  qty: number;
  cost: number;
}

export default function AddMaintenancePage() {
  const router = useRouter();

  // Active zone state
  const [activeZone, setActiveZone] = useState("Gotri Hub");

  useEffect(() => {
    const z = localStorage.getItem("evegah_active_zone") || "Gotri Zone";
    setActiveZone(z.includes("Manjalpur") ? "Manjalpur Hub" : z.includes("KPGU") ? "KPGU Hub" : "Gotri Hub");
  }, []);

  // Form Fields State
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);
  const [zonesList, setZonesList] = useState<any[]>([]);
  const [techniciansList, setTechniciansList] = useState<any[]>([]);

  const [vehicleId, setVehicleId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [kmReading, setKmReading] = useState("1,200 km");
  const [batteryId, setBatteryId] = useState("");
  const [iotId, setIotId] = useState("");
  const [mechanic, setMechanic] = useState("");

  const [serviceType, setServiceType] = useState("Tyre Replacement");
  const [serviceCategory, setServiceCategory] = useState("General Service");
  const [priority, setPriority] = useState("Medium");
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [estimatedTime, setEstimatedTime] = useState("2 - 3 Hours");
  const [description, setDescription] = useState("Tyre tread inspection & maintenance required.");
  const [checklistTemplate, setChecklistTemplate] = useState("Tyre Replacement Checklist");
  const [parts, setParts] = useState<PartRow[]>([
    { partName: 'MRF Front Tubeless Tyre 90/90-12', partNo: 'PRT-TY-0089', qty: 1, cost: 1250 },
    { partName: 'Tyre Valve Stem TR412', partNo: 'PRT-VL-0012', qty: 1, cost: 150 }
  ]);
  const [laborCharge, setLaborCharge] = useState(350);
  const [diagnosticCharge, setDiagnosticCharge] = useState(100);
  const [otherCharge, setOtherCharge] = useState(50);
  const [discount, setDiscount] = useState(0);
  const [nextDate, setNextDate] = useState("2026-09-20");
  const [nextKm, setNextKm] = useState("3,000 km");
  const [reminderDays, setReminderDays] = useState("7 Days Before");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  // Fetch live vehicles, zones, and technicians from Backend DB
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    Promise.all([
      fetch(`${apiUrl}/vehicles`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${apiUrl}/zones`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${apiUrl}/users`).then(r => r.json()).catch(() => ({ data: [] }))
    ]).then(([vRes, zRes, uRes]) => {
      const vList = Array.isArray(vRes) ? vRes : (vRes.data || []);
      const zList = Array.isArray(zRes) ? zRes : (zRes.data || []);
      const uList = Array.isArray(uRes) ? uRes : (uRes.data || []);

      setVehiclesList(vList);
      setZonesList(zList);

      const techList = uList.filter((u: any) => {
        const role = (u.role || '').toLowerCase();
        return role.includes('tech') || role.includes('mechanic') || role.includes('operat') || role.includes('admin') || role.includes('staff');
      });
      setTechniciansList(techList.length > 0 ? techList : uList);

      if (vList.length > 0) {
        const firstV = vList[0];
        const vCode = firstV.code || firstV.registration_number || 'EVM1024001';
        setVehicleId(vCode);
        setVehicleNumber(firstV.registration_number || vCode);
        setVehicleModel(firstV.model || 'Evegah Pro');
        setKmReading(firstV.km_reading ? `${firstV.km_reading} km` : '1,200 km');
        setBatteryId(firstV.battery_id || 'BAT-0098');
        setIotId(firstV.iot_id || firstV.imei || 'IOT-EVG-101');
        if (firstV.zone) setActiveZone(firstV.zone);
      }
      if (techList.length > 0) {
        setMechanic(techList[0].full_name || techList[0].name || 'Technician Lead');
      }
    });
  }, []);

  const handleVehicleSelect = (selectedCode: string) => {
    setVehicleId(selectedCode);
    const found = vehiclesList.find(v => (v.code || v.registration_number) === selectedCode);
    if (found) {
      setVehicleNumber(found.registration_number || found.code);
      setVehicleModel(found.model || 'Evegah Pro');
      setKmReading(found.km_reading ? `${found.km_reading} km` : '1,200 km');
      setBatteryId(found.battery_id || 'BAT-0098');
      setIotId(found.iot_id || found.imei || 'IOT-EVG-101');
      if (found.zone) setActiveZone(found.zone);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(p => [...p, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };
 
  // Derived cost sums
  const totalPartsCost = useMemo(() => {
    return parts.reduce((sum, p) => sum + (p.qty * p.cost), 0);
  }, [parts]);

  const totalLaborCost = useMemo(() => {
    const sum = laborCharge + diagnosticCharge + otherCharge - discount;
    return sum < 0 ? 0 : sum;
  }, [laborCharge, diagnosticCharge, otherCharge, discount]);

  const totalInvoiceCost = useMemo(() => {
    return totalPartsCost + totalLaborCost;
  }, [totalPartsCost, totalLaborCost]);

  // Handle adding new part row
  const handleAddPartRow = () => {
    setParts(p => [...p, { partName: "New Part Name", partNo: "PART-CODE", qty: 1, cost: 0.00 }]);
  };

  // Handle removing part row
  const handleRemovePartRow = (index: number) => {
    setParts(p => p.filter((_, i) => i !== index));
  };

  // Update part values
  const handleUpdatePart = (index: number, key: keyof PartRow, value: any) => {
    setParts(p => p.map((row, i) => {
      if (i === index) {
        return {
          ...row,
          [key]: key === 'qty' || key === 'cost' ? parseFloat(value) || 0 : value
        };
      }
      return row;
    }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create a new record
    const newRecord = {
      id: `JC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      vehicleId: vehicleId,
      vehicleNumber: vehicleNumber,
      vehicleModel: vehicleModel,
      serviceType: serviceType,
      status: "Scheduled",
      dueDate: new Date(serviceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      dueText: "Scheduled",
      lastService: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      zone: activeZone
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_code: vehicleNumber || vehicleId || 'EVM1024008',
          issue_category: serviceType || serviceCategory || 'General Service',
          description: description,
          assigned_technician: mechanic,
          priority: priority,
          estimated_cost: totalInvoiceCost,
          zone: activeZone
        })
      });
    } catch (err) {
      console.error('Failed to post maintenance order to API:', err);
    }

    // Save to local storage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("evegah_maintenance_records");
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newRecord); // add to top of list
      localStorage.setItem("evegah_maintenance_records", JSON.stringify(list));
    }

    alert("Maintenance Job Card created successfully!");
    router.push('/maintenance/overview');
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(p => p.filter((_, i) => i !== idx));
  };

  return (
    <div className="ma-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Sidebar activePath="/maintenance/overview" />

      <div className="ma-main">
        <TopBar 
          notificationCount={5}
          hideZone={false}
        />

        <div className="ma-body">
          {/* Breadcrumb */}
          <div className="ma-bc">
            <span className="mo-bc-link" onClick={() => router.push('/')}>Home</span>
            <span className="mo-bc-sep">&gt;</span>
            <span className="mo-bc-link" onClick={() => router.push('/maintenance/overview')}>Maintenance</span>
            <span className="mo-bc-sep">&gt;</span>
            <span className="mo-bc-cur">Add Maintenance</span>
          </div>

          {/* Header Row */}
          <div className="ma-header-row">
            <div>
              <h1 className="mo-h1">Add Maintenance</h1>
              <p className="mo-sub">Create a new maintenance record for the vehicle.</p>
            </div>
            <div className="ma-actions">
              <button className="ma-btn ma-btn-outline" onClick={() => router.push('/maintenance/overview')}>Cancel</button>
              <button className="ma-btn ma-btn-outline" onClick={() => { alert("Draft Saved!"); router.push('/maintenance/overview'); }}>Save Draft</button>
              <button className="ma-btn ma-btn-primary" onClick={handleSubmit}>Save & Submit</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="ma-grid">
            {/* Left Column Sections */}
            <div className="ma-form-left">
              {/* Section 1: Vehicle Information */}
              <div className="ma-section">
                <h2 className="ma-section-title">1. Vehicle Information</h2>
                <div className="ma-fields-grid">
                  <div className="ma-field">
                    <span className="ma-field-label">Vehicle ({vehiclesList.length} Available)</span>
                    <select
                      className="ma-select-field"
                      value={vehicleId}
                      onChange={(e) => handleVehicleSelect(e.target.value)}
                    >
                      {vehiclesList.length > 0 ? (
                        vehiclesList.map((v: any) => {
                          const code = v.code || v.registration_number;
                          return (
                            <option key={v.id || code} value={code}>
                              {code} — {v.model || 'Evegah EV'} ({v.vehicle_status || 'Ready'})
                            </option>
                          );
                        })
                      ) : (
                        <option value="">No vehicles available</option>
                      )}
                    </select>
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Vehicle Number</span>
                    <input type="text" className="ma-input" disabled value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Vehicle Model</span>
                    <input type="text" className="ma-input" disabled value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} />
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Current KM Reading</span>
                    <input type="text" className="ma-input" value={kmReading} onChange={(e) => setKmReading(e.target.value)} />
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Battery ID</span>
                    <input type="text" className="ma-input" value={batteryId} onChange={(e) => setBatteryId(e.target.value)} />
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">IoT Device ID</span>
                    <input type="text" className="ma-input" value={iotId} onChange={(e) => setIotId(e.target.value)} />
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Assigned Station / Zone</span>
                    <select className="ma-select-field" value={activeZone} onChange={(e) => setActiveZone(e.target.value)}>
                      {zonesList.length > 0 ? (
                        zonesList.map((z: any) => (
                          <option key={z.id || z.name} value={z.name}>{z.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="Gotri Hub">Gotri Hub</option>
                          <option value="Manjalpur Hub">Manjalpur Hub</option>
                          <option value="KPGU Hub">KPGU Hub</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Assigned Mechanic / Technician</span>
                    <select className="ma-select-field" value={mechanic} onChange={(e) => setMechanic(e.target.value)}>
                      {techniciansList.length > 0 ? (
                        techniciansList.map((t: any) => (
                          <option key={t.id || t.email} value={t.full_name || t.name}>
                            {t.full_name || t.name} ({t.role || 'Staff'})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Ravi Kumar">Ravi Kumar (Technician)</option>
                          <option value="Vikram Singh">Vikram Singh (Mechanic)</option>
                          <option value="Neelesh Rao">Neelesh Rao (Operator)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Service Details */}
              <div className="ma-section">
                <h2 className="ma-section-title">2. Service Details</h2>
                <div className="ma-fields-grid">
                  <div className="ma-field">
                    <span className="ma-field-label">Service Type</span>
                    <select className="ma-select-field" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                      <option value="Tyre Replacement">Tyre Replacement</option>
                      <option value="Periodic Service">Periodic Service</option>
                      <option value="Battery Check">Battery Check</option>
                      <option value="Brake Service">Brake Service</option>
                      <option value="General Inspection">General Inspection</option>
                    </select>
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Service Category</span>
                    <select className="ma-select-field" value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)}>
                      <option value="General Service">General Service</option>
                      <option value="Major Repair">Major Repair</option>
                    </select>
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Priority</span>
                    <select className="ma-select-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Service Date</span>
                    <input type="date" className="ma-input" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} />
                  </div>
                  <div className="ma-field" style={{ gridColumn: 'span 3' }}>
                    <span className="ma-field-label">Description / Issue Reported</span>
                    <textarea 
                      className="ma-textarea" 
                      style={{ width: '100%' }}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Service Checklist Template</span>
                    <select className="ma-select-field" value={checklistTemplate} onChange={(e) => setChecklistTemplate(e.target.value)}>
                      <option>Tyre Replacement Checklist</option>
                      <option>Periodic Inspection Checklist</option>
                      <option>General Service Checklist</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Parts & Materials */}
              <div className="ma-section">
                <h2 className="ma-section-title">3. Parts & Materials</h2>
                <div className="ma-table-container">
                  <table className="ma-parts-table">
                    <thead>
                      <tr>
                        <th>Part / Material</th>
                        <th>Part Number</th>
                        <th style={{ width: '80px' }}>Quantity</th>
                        <th style={{ width: '120px' }}>Unit Cost (₹)</th>
                        <th style={{ width: '120px' }}>Total (₹)</th>
                        <th style={{ width: '50px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parts.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            <input 
                              type="text" 
                              className="ma-input" 
                              value={row.partName} 
                              onChange={(e) => handleUpdatePart(idx, 'partName', e.target.value)}
                            />
                          </td>
                          <td>
                            <input 
                              type="text" 
                              className="ma-input" 
                              value={row.partNo} 
                              onChange={(e) => handleUpdatePart(idx, 'partNo', e.target.value)}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="ma-input" 
                              style={{ textAlign: 'center' }}
                              value={row.qty} 
                              onChange={(e) => handleUpdatePart(idx, 'qty', e.target.value)}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="ma-input" 
                              value={row.cost} 
                              onChange={(e) => handleUpdatePart(idx, 'cost', e.target.value)}
                            />
                          </td>
                          <td style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A' }}>
                            ₹{(row.qty * row.cost).toFixed(2)}
                          </td>
                          <td>
                            <button type="button" className="ma-trash-btn" onClick={() => handleRemovePartRow(idx)}>
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" className="mo-btn" onClick={handleAddPartRow} style={{ color: '#2A195C', borderColor: '#E9D5FF' }}>
                    + Add Part / Material
                  </button>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Total Parts Cost: <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginLeft: '6px' }}>₹{totalPartsCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Labor & Charges */}
              <div className="ma-section">
                <h2 className="ma-section-title">4. Labor & Charges</h2>
                <div className="ma-fields-grid">
                  <div className="ma-field">
                    <span className="ma-field-label">Labor Charge (₹)</span>
                    <input type="number" className="ma-input" value={laborCharge} onChange={(e) => setLaborCharge(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Diagnostic Charge (₹)</span>
                    <input type="number" className="ma-input" value={diagnosticCharge} onChange={(e) => setDiagnosticCharge(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Other Charges (₹)</span>
                    <input type="number" className="ma-input" value={otherCharge} onChange={(e) => setOtherCharge(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Discount (₹)</span>
                    <input type="number" className="ma-input" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="ma-divider" style={{ margin: '16px 0' }} />
                <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  Total Labor & Charges: <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginLeft: '6px' }}>₹{totalLaborCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Section 5: Next Service Information */}
              <div className="ma-section">
                <h2 className="ma-section-title">5. Next Service Information</h2>
                <div className="ma-fields-grid">
                  <div className="ma-field">
                    <span className="ma-field-label">Next Service Due Date</span>
                    <input type="date" className="ma-input" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Next Service KM</span>
                    <input type="text" className="ma-input" value={nextKm} onChange={(e) => setNextKm(e.target.value)} />
                  </div>
                  <div className="ma-field">
                    <span className="ma-field-label">Service Reminder</span>
                    <select className="ma-select-field" value={reminderDays} onChange={(e) => setReminderDays(e.target.value)}>
                      <option>Before 5 Days</option>
                      <option>Before 2 Days</option>
                      <option>On the Day</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 6: Remarks & Notes */}
              <div className="ma-section">
                <h2 className="ma-section-title">6. Remarks & Notes</h2>
                <div className="ma-field" style={{ gridColumn: 'span 4' }}>
                  <span className="ma-field-label">Internal Notes</span>
                  <textarea 
                    className="ma-textarea" 
                    style={{ width: '100%' }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right Column Sidebar Summary Panel */}
            <div className="ma-sidebar-box">
              {/* Maintenance Invoice Summary */}
              <div>
                <h3 className="ma-sidebar-title" style={{ marginBottom: '16px' }}>Maintenance Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="ma-summary-row ma-summary-row-bold">
                    <span>Total Cost</span>
                    <span style={{ color: '#2A195C', fontSize: '18px' }}>₹{totalInvoiceCost.toFixed(2)}</span>
                  </div>
                  <div className="ma-summary-row">
                    <span>Amount Paid</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="ma-summary-row">
                    <span>Payment Status</span>
                    <span className="mo-badge mo-badge-orange">Pending</span>
                  </div>
                  <div className="ma-divider" style={{ margin: '6px 0' }} />
                  <div className="ma-summary-row ma-summary-row-bold" style={{ fontSize: '14px' }}>
                    <span>Due Amount</span>
                    <span style={{ color: '#EF4444' }}>₹{totalInvoiceCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="ma-divider" />

              {/* Service Checklist Preview */}
              <div>
                <h3 className="ma-sidebar-title" style={{ marginBottom: '16px' }}>Service Checklist Preview</h3>
                <div className="ma-chk-preview">
                  {[
                    { task: "Tyre Condition Check", status: "Completed", color: "#10B981", icon: "✓" },
                    { task: "Tyre Removal", status: "Completed", color: "#10B981", icon: "✓" },
                    { task: "New Tyre Installation", status: "In Progress", color: "#3B82F6", icon: "•" },
                    { task: "Wheel Balancing", status: "Pending", color: "#94A3B8", icon: "•" },
                    { task: "Air Pressure Check", status: "Pending", color: "#94A3B8", icon: "•" },
                    { task: "Test Ride", status: "Pending", color: "#94A3B8", icon: "•" }
                  ].map((item, idx) => (
                    <div key={idx} className="ma-chk-preview-item">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="ma-chk-dot" style={{ background: item.color }}>{item.icon}</div>
                        {item.task}
                      </span>
                      <span className={`ma-chk-badge ${
                        item.status === 'Completed' ? 'mo-badge-green' :
                        (item.status === 'In Progress' ? 'mo-badge-blue' : 'mo-badge-red')
                      }`} style={{ background: item.status === 'Pending' ? '#F1F5F9' : undefined, color: item.status === 'Pending' ? '#64748B' : undefined }}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ma-divider" />

              {/* Photos upload list */}
              <div>
                <h3 className="ma-sidebar-title" style={{ marginBottom: '16px' }}>Upload Photos / Documents</h3>
                <div className="ma-photos-grid">
                  {photos.map((url, idx) => (
                    <div key={idx} className="ma-photo-card">
                      <img src={url} alt={`Upload ${idx}`} />
                      <button type="button" className="ma-photo-card-del" onClick={() => handleRemovePhoto(idx)}>x</button>
                    </div>
                  ))}
                  <label className="ma-upload-dashed" style={{ cursor: 'pointer' }}>
                    + Upload
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>

              <div className="ma-divider" />

              {/* Quick Actions */}
              <div>
                <h3 className="ma-sidebar-title" style={{ marginBottom: '16px' }}>Quick Actions</h3>
                <div className="ma-qa-grid">
                  <div className="ma-qa-btn">
                    <span className="ma-qa-btn-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A195C' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                    </span>
                    <span className="ma-qa-btn-text">Print Job Card</span>
                  </div>
                  <div className="ma-qa-btn">
                    <span className="ma-qa-btn-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A195C' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                    </span>
                    <span className="ma-qa-btn-text">View Vehicle</span>
                  </div>
                  <div className="ma-qa-btn">
                    <span className="ma-qa-btn-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A195C' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </span>
                    <span className="ma-qa-btn-text">Service History</span>
                  </div>
                  <div className="ma-qa-btn">
                    <span className="ma-qa-btn-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A195C' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </span>
                    <span className="ma-qa-btn-text">Create Reminder</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
