"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.jc-page {
  display: flex;
  min-height: 100vh;
  background: #F8F9FF;
  font-family: 'Inter', sans-serif;
}
.jc-main {
  margin-left: 230px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100% - 230px);
}
.jc-body {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Breadcrumb */
.jc-bc {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}
.jc-bc-link {
  color: #2A195C;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}
.jc-bc-sep {
  color: #CBD5E1;
}
.jc-bc-cur {
  color: #0F172A;
  font-weight: 700;
}

/* Header Row */
.jc-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-top: -4px;
}
.jc-h1-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.jc-h1 {
  font-size: 24px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.02em;
}
.jc-sub {
  font-size: 13px;
  color: #64748B;
  margin: 4px 0 0;
  font-weight: 500;
}

/* Actions */
.jc-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.jc-btn {
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
.jc-btn-outline {
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  color: #475569;
}
.jc-btn-outline:hover {
  border-color: #2A195C;
  color: #2A195C;
}
.jc-btn-primary {
  background: #2A195C;
  border: 1.5px solid #2A195C;
  color: #FFF;
}
.jc-btn-primary:hover {
  background: #1E1145;
  border-color: #1E1145;
}

/* Vehicle Banner Card */
.jc-banner {
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0,0,0,.01);
  gap: 20px;
}
.jc-banner-left {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
}
.jc-scooter-img {
  width: 90px;
  height: 70px;
  border-radius: 12px;
  background: #F1F5F9;
  object-fit: cover;
  flex-shrink: 0;
}
.jc-banner-title-block {
  display: flex;
  flex-direction: column;
}
.jc-banner-veh-id {
  font-size: 20px;
  font-weight: 800;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 8px;
}
.jc-banner-veh-sub {
  font-size: 13px;
  color: #64748B;
  font-weight: 600;
  margin-top: 4px;
}
.jc-banner-grid {
  display: flex;
  gap: 24px;
  flex: 1;
  justify-content: space-around;
  margin-left: 20px;
  border-left: 1.5px solid #F1F5F9;
  padding-left: 20px;
}
.jc-banner-info-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.jc-banner-info-label {
  font-size: 10px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.jc-banner-info-val {
  font-size: 13px;
  font-weight: 700;
  color: #1E293B;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Layout Columns */
.jc-layout-grid {
  display: grid;
  grid-template-columns: 1fr 340px 320px;
  gap: 20px;
}
.jc-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Base Card */
.jc-card {
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.01);
}
.jc-card-title {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Key Value Fields */
.jc-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}
.jc-field-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.jc-field-icon {
  font-size: 16px;
  color: #8B5CF6;
  flex-shrink: 0;
  margin-top: 2px;
}
.jc-field-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.jc-field-label {
  font-size: 10px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.jc-field-val {
  font-size: 12.5px;
  font-weight: 600;
  color: #1E293B;
}

/* Tabs */
.jc-tabs {
  display: flex;
  gap: 20px;
  border-bottom: 1.5px solid #E2E8F0;
  margin: 20px 0 16px;
}
.jc-tab-btn {
  padding: 10px 2px;
  font-size: 13px;
  font-weight: 700;
  color: #64748B;
  cursor: pointer;
  border: none;
  background: none;
  border-bottom: 2.5px solid transparent;
  transition: all 0.15s;
  margin-bottom: -1.5px;
}
.jc-tab-btn.active {
  color: #2A195C;
  border-bottom-color: #2A195C;
  font-weight: 800;
}
.jc-tab-btn:hover {
  color: #2A195C;
}

/* Checklist Table */
.jc-checklist-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}
.jc-checklist-table th {
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  padding: 10px;
  border-bottom: 1.5px solid #F1F5F9;
  text-align: left;
}
.jc-checklist-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #F1F5F9;
  font-size: 12px;
  font-weight: 500;
}
.jc-clickable-badge {
  cursor: pointer;
}

/* Workflow timeline */
.jc-workflow {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  padding-left: 10px;
}
.jc-workflow-item {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}
.jc-workflow-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: #FFF;
  z-index: 2;
  flex-shrink: 0;
}
.jc-workflow-line {
  position: absolute;
  left: 11px;
  top: 24px;
  bottom: -20px;
  width: 2px;
  background: #E2E8F0;
  z-index: 1;
}
.jc-workflow-line.active {
  background: #10B981;
}
.jc-workflow-info {
  display: flex;
  flex-direction: column;
}
.jc-workflow-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #1E293B;
}
.jc-workflow-time {
  font-size: 10.5px;
  color: #64748B;
  margin-top: 2px;
}

/* Timeline Activity */
.jc-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.jc-timeline-item {
  display: flex;
  gap: 12px;
}
.jc-timeline-bullet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366F1;
  margin-top: 6px;
  flex-shrink: 0;
}
.jc-timeline-text {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
  line-height: 1.4;
}
.jc-timeline-time {
  font-size: 10px;
  color: #94A3B8;
  margin-top: 2px;
  font-weight: 600;
}

/* Photos upload grid */
.jc-photos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 14px;
}
.jc-photo-card {
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #E2E8F0;
}
.jc-photo-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.jc-upload-dashed {
  height: 60px;
  border: 1.5px dashed #CBD5E1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  background: #F8FAFC;
}
`;

interface ChecklistItem {
  task: string;
  status: "Completed" | "In Progress" | "Pending";
  remarks: string;
  images: boolean;
}

export default function JobCardDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string || "JC-2026-000125";

  // Dynamic states
  const [activeTab, setActiveTab] = useState<"checklist" | "parts" | "labor" | "notes" | "history">("checklist");
  const [jobCardStatus, setJobCardStatus] = useState<string>("Scheduled");
  const [paymentStatus, setPaymentStatus] = useState<string>("Pending");

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { task: "Battery Health Check", status: "Completed", remarks: "Battery health is normal (92%)", images: true },
    { task: "Brake Inspection", status: "Completed", remarks: "Brake pads in good condition", images: true },
    { task: "Tyre Condition Check", status: "In Progress", remarks: "Rear tyre tread slightly worn", images: true },
    { task: "Motor Performance Check", status: "Pending", remarks: "--", images: false },
    { task: "Electrical System Check", status: "Pending", remarks: "--", images: false },
    { task: "Vehicle Cleaning", status: "Pending", remarks: "--", images: false }
  ]);

  // Read job card values from URL / local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("evegah_maintenance_records");
      if (stored) {
        const list = JSON.parse(stored);
        const match = list.find((r: any) => r.id === id);
        if (match) {
          setJobCardStatus(match.status);
          if (match.status === "Completed") {
            setPaymentStatus("Completed");
            setChecklist(prev => prev.map(c => ({ ...c, status: "Completed" })));
          }
        }
      }
    }
  }, [id]);

  // Toggle checklist item status when clicked (Interactive Prototype Detail!)
  const handleToggleStatus = (index: number) => {
    if (jobCardStatus === "Completed") return; // locked once completed
    setChecklist(prev => prev.map((item, idx) => {
      if (idx === index) {
        const nextStatus = item.status === "Pending" ? "In Progress" : 
                            (item.status === "In Progress" ? "Completed" : "Pending");
        return {
          ...item,
          status: nextStatus,
          remarks: nextStatus === "Completed" ? `${item.task} check completed.` : 
                   (nextStatus === "In Progress" ? "Currently inspecting..." : "--")
        };
      }
      return item;
    }));
  };

  // Mark Job Card as Completed
  const handleMarkAsCompleted = () => {
    setJobCardStatus("Completed");
    setPaymentStatus("Completed");
    setChecklist(prev => prev.map(c => ({ ...c, status: "Completed" })));

    // Save back to local storage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("evegah_maintenance_records");
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.map((r: any) => r.id === id ? { ...r, status: "Completed" } : r);
        localStorage.setItem("evegah_maintenance_records", JSON.stringify(updated));
      }
    }

    alert("Job Card successfully marked as COMPLETED! Wallet payment processed.");
  };

  return (
    <div className="jc-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Sidebar activePath="/maintenance/overview" />

      <div className="jc-main">
        <TopBar 
          notificationCount={5}
          hideZone={false}
        />

        <div className="jc-body">
          {/* Breadcrumb */}
          <div className="jc-bc">
            <span className="mo-bc-link" onClick={() => router.push('/')}>Home</span>
            <span className="mo-bc-sep">&gt;</span>
            <span className="mo-bc-link" onClick={() => router.push('/maintenance/overview')}>Maintenance</span>
            <span className="mo-bc-sep">&gt;</span>
            <span className="mo-bc-link" onClick={() => router.push('/maintenance/overview')}>Job Cards</span>
            <span className="mo-bc-sep">&gt;</span>
            <span className="mo-bc-cur">{id}</span>
          </div>

          {/* Header Row */}
          <div className="jc-header-row">
            <div className="jc-h1-row">
              <h1 className="jc-h1">Job Card Details</h1>
              <span className={`mo-badge ${jobCardStatus === 'Completed' ? 'mo-badge-green' : 'mo-badge-orange'}`}>
                {jobCardStatus}
              </span>
            </div>
            <div className="jc-actions">
              <button className="jc-btn jc-btn-outline" onClick={() => router.push('/maintenance/overview')}>
                &larr; Back to Job Cards
              </button>
              <button className="jc-btn jc-btn-outline" onClick={() => window.print()}>
                🖨️ Print Job Card
              </button>
              <button className="jc-btn jc-btn-outline">
                📥 Download
              </button>
              <button className="jc-btn jc-btn-primary">
                Edit Job Card
              </button>
            </div>
          </div>

          {/* Banner Vehicle Card */}
          <div className="jc-banner">
            <div className="jc-banner-left">
              <img 
                src="/evegah_scooter.png" 
                className="jc-scooter-img" 
                alt="Scooter"
              />
              <div className="jc-banner-title-block">
                <div className="jc-banner-veh-id">
                  <span>EV-12KA-5678</span>
                  <span className="mo-badge mo-badge-green" style={{ fontSize: '10px', padding: '2px 8px' }}>Active</span>
                </div>
                <div className="jc-banner-veh-sub">KA01AB5678 | Eve S1 Pro</div>
              </div>
            </div>

            <div className="jc-banner-grid">
              <div className="jc-banner-info-box">
                <span className="jc-banner-info-label">Current KM</span>
                <span className="jc-banner-info-val">12,560 km</span>
              </div>
              <div className="jc-banner-info-box">
                <span className="jc-banner-info-label">Last Service</span>
                <span className="jc-banner-info-val">10 May 2026</span>
              </div>
              <div className="jc-banner-info-box">
                <span className="jc-banner-info-label">Next Service</span>
                <span className="jc-banner-info-val">10 Jun 2026 / 14,000 km</span>
              </div>
              <div className="jc-banner-info-box">
                <span className="jc-banner-info-label">Battery Status</span>
                <span className="jc-banner-info-val" style={{ color: '#10B981' }}>Good (92%)</span>
              </div>
              <div className="jc-banner-info-box">
                <span className="jc-banner-info-label">IoT Status</span>
                <span className="jc-banner-info-val" style={{ color: '#10B981' }}>
                  <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Online
                </span>
              </div>
              <div className="jc-banner-info-box">
                <span className="jc-banner-info-label">Assigned Mechanic</span>
                <span className="jc-banner-info-val">Ravi Kumar</span>
              </div>
              <div className="jc-banner-info-box">
                <span className="jc-banner-info-label">Assigned Station</span>
                <span className="jc-banner-info-val">Koramangala Hub</span>
              </div>
            </div>
          </div>

          {/* Three-Column Layout */}
          <div className="jc-layout-grid">
            {/* Column 1: Job Card Info & Checklist Tabs */}
            <div className="jc-col">
              {/* Job Card Info */}
              <div className="jc-card">
                <div className="jc-card-title">
                  <span>Job Card Information</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#6366F1', cursor: 'pointer' }}>✎ Edit</span>
                </div>
                
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.02em' }}>
                  JC: <span style={{ color: '#0F172A' }}>{id}</span> | Date: <span style={{ color: '#0F172A' }}>19 Jun 2026, 09:45 AM</span>
                </div>

                <div className="jc-fields-grid">
                  <div className="jc-field-row">
                    <span className="jc-field-icon">🛠️</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Service Type</span>
                      <span className="jc-field-val">Periodic Service</span>
                    </div>
                  </div>
                  <div className="jc-field-row">
                    <span className="jc-field-icon">📋</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Job Card Status</span>
                      <span className="jc-field-val">{jobCardStatus}</span>
                    </div>
                  </div>
                  <div className="jc-field-row">
                    <span className="jc-field-icon">📁</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Service Category</span>
                      <span className="jc-field-val">General Service</span>
                    </div>
                  </div>
                  <div className="jc-field-row">
                    <span className="jc-field-icon">📅</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Appointment Date</span>
                      <span className="jc-field-val">20 Jun 2026, 09:00 AM</span>
                    </div>
                  </div>
                  <div className="jc-field-row">
                    <span className="jc-field-icon">👤</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Reported By</span>
                      <span className="jc-field-val">Neha Verma (Renter)</span>
                    </div>
                  </div>
                  <div className="jc-field-row">
                    <span className="jc-field-icon">⏱️</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Estimated Time</span>
                      <span className="jc-field-val">2 - 3 Hours</span>
                    </div>
                  </div>
                  <div className="jc-field-row">
                    <span className="jc-field-icon">📞</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Contact Number</span>
                      <span className="jc-field-val">+91 98765 43210</span>
                    </div>
                  </div>
                  <div className="jc-field-row">
                    <span className="jc-field-icon">🏁</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Service Due By</span>
                      <span className="jc-field-val">10 Jun 2026 / 14,000 km</span>
                    </div>
                  </div>
                  <div className="jc-field-row">
                    <span className="jc-field-icon">📅</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Reported Date</span>
                      <span className="jc-field-val">19 Jun 2026, 09:30 AM</span>
                    </div>
                  </div>
                  <div className="jc-field-row">
                    <span className="jc-field-icon">💳</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Payment Type</span>
                      <span className="jc-field-val">Franchise Wallet</span>
                    </div>
                  </div>
                  <div className="jc-field-row" style={{ gridColumn: 'span 2' }}>
                    <span className="jc-field-icon">⚠️</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Issue Reported</span>
                      <span className="jc-field-val" style={{ fontWeight: 500, color: '#475569' }}>General checkup and performance issue</span>
                    </div>
                  </div>
                  <div className="jc-field-row" style={{ gridColumn: 'span 2' }}>
                    <span className="jc-field-icon">✍️</span>
                    <div className="jc-field-content">
                      <span className="jc-field-label">Remarks</span>
                      <span className="jc-field-val" style={{ fontWeight: 500, color: '#475569' }}>Customer reported slight throttle delay</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Panel */}
              <div className="jc-card">
                <div className="jc-tabs">
                  <button className={`jc-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`} onClick={() => setActiveTab('checklist')}>Service Checklist</button>
                  <button className={`jc-tab-btn ${activeTab === 'parts' ? 'active' : ''}`} onClick={() => setActiveTab('parts')}>Parts & Materials</button>
                  <button className={`jc-tab-btn ${activeTab === 'labor' ? 'active' : ''}`} onClick={() => setActiveTab('labor')}>Labor Charges</button>
                  <button className={`jc-tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Notes & Photos</button>
                  <button className={`jc-tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
                </div>

                {activeTab === 'checklist' && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '10px' }}>
                      💡 Click status badges to toggle status (Demo interactive helper)
                    </div>
                    <table className="jc-checklist-table">
                      <thead>
                        <tr>
                          <th>Task / Checkpoint</th>
                          <th style={{ width: '120px' }}>Status</th>
                          <th>Mechanic Remarks</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>Images</th>
                        </tr>
                      </thead>
                      <tbody>
                        {checklist.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700, color: '#374151' }}>
                              {item.status === 'Completed' ? '✓ ' : '• '} {item.task}
                            </td>
                            <td>
                              <span 
                                onClick={() => handleToggleStatus(idx)}
                                className={`mo-badge jc-clickable-badge ${
                                  item.status === 'Completed' ? 'mo-badge-green' : 
                                  (item.status === 'In Progress' ? 'mo-badge-blue' : 'mo-badge-red')
                                }`}
                                style={{ background: item.status === 'Pending' ? '#F1F5F9' : undefined, color: item.status === 'Pending' ? '#64748B' : undefined }}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td style={{ color: '#475569' }}>{item.remarks}</td>
                            <td style={{ textAlign: 'center', fontSize: '14px', cursor: 'pointer' }}>
                              {item.images ? "🖼️" : "--"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ marginTop: '16px' }}>
                      <span className="jc-field-label">Service Images / Uploads</span>
                      <div className="jc-photos">
                        <div className="jc-photo-card">
                          <img src="/evegah_scooter.png" alt="Detail 1" />
                        </div>
                        <div className="jc-photo-card">
                          <img src="/evegah_scooter.png" alt="Detail 2" />
                        </div>
                        <div className="jc-photo-card">
                          <img src="/evegah_scooter.png" alt="Detail 3" />
                        </div>
                        <div className="jc-upload-dashed">+ Upload</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'parts' && (
                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                    <h4 style={{ margin: '0 0 10px', color: '#0F172A' }}>Assigned Parts Details</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <span>Rear Tyre - 90/90 R12 (TYR-90-90-R12) x 1</span>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>₹1,030.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <span>Brake Pads Set (BRK-PAD-12) x 1</span>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>₹820.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontWeight: 700 }}>
                      <span>Total Parts Cost</span>
                      <span>₹1,850.00</span>
                    </div>
                  </div>
                )}

                {activeTab === 'labor' && (
                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                    <h4 style={{ margin: '0 0 10px', color: '#0F172A' }}>Labor Charges Breakdown</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <span>Labor Charge</span>
                      <span>₹450.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <span>Diagnostic Charge</span>
                      <span>₹0.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontWeight: 700 }}>
                      <span>Total Labor Cost</span>
                      <span>₹450.00</span>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                    <h4 style={{ margin: '0 0 8px', color: '#0F172A' }}>Customer Notes</h4>
                    <p style={{ margin: '0 0 16px', background: '#F8FAFC', padding: '10px', borderRadius: '6px' }}>
                      "Rider reported slight throttle lag while acceleration on slopes."
                    </p>
                    <h4 style={{ margin: '0 0 8px', color: '#0F172A' }}>Mechanic Notes</h4>
                    <p style={{ margin: 0, background: '#F8FAFC', padding: '10px', borderRadius: '6px' }}>
                      "Performed periodic service. All major electrical systems are normal. Replaced brake pads front. Next service due at 14,000 km."
                    </p>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: '#475569' }}>
                    <div>• 19 Jun 2026, 09:45 AM - Job Card created by Admin.</div>
                    <div>• 19 Jun 2026, 09:50 AM - Status updated to Scheduled by Admin.</div>
                    <div>• 19 Jun 2026, 09:55 AM - Mechanic Ravi Kumar assigned.</div>
                    <div>• 20 Jun 2026, 09:05 AM - Vehicle received at station by Ravi Kumar.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Workflow, Invoice & Mechanic Notes */}
            <div className="jc-col">
              {/* Service Workflow */}
              <div className="jc-card">
                <h2 className="jc-card-title">Service Workflow</h2>
                <div className="jc-workflow">
                  <div className="jc-workflow-item">
                    <div className="jc-workflow-circle" style={{ background: '#10B981' }}>✓</div>
                    <div className="jc-workflow-line active" />
                    <div className="jc-workflow-info">
                      <span className="jc-workflow-title">Job Card Created</span>
                      <span className="jc-workflow-time">19 Jun 2026, 09:45 AM</span>
                    </div>
                  </div>
                  
                  <div className="jc-workflow-item">
                    <div className="jc-workflow-circle" style={{ background: '#10B981' }}>✓</div>
                    <div className="jc-workflow-line active" />
                    <div className="jc-workflow-info">
                      <span className="jc-workflow-title">Scheduled</span>
                      <span className="jc-workflow-time">19 Jun 2026, 09:50 AM</span>
                    </div>
                  </div>

                  <div className="jc-workflow-item">
                    <div className="jc-workflow-circle" style={{ background: jobCardStatus === 'Completed' ? '#10B981' : '#3B82F6' }}>
                      {jobCardStatus === 'Completed' ? "✓" : "3"}
                    </div>
                    <div className={`jc-workflow-line ${jobCardStatus === 'Completed' ? 'active' : ''}`} />
                    <div className="jc-workflow-info">
                      <span className="jc-workflow-title">In Progress</span>
                      <span className="jc-workflow-time">{jobCardStatus === 'Completed' ? "Completed" : "Active Step"}</span>
                    </div>
                  </div>

                  <div className="jc-workflow-item">
                    <div className="jc-workflow-circle" style={{ background: jobCardStatus === 'Completed' ? '#10B981' : '#94A3B8' }}>
                      {jobCardStatus === 'Completed' ? "✓" : "4"}
                    </div>
                    <div className={`jc-workflow-line ${jobCardStatus === 'Completed' ? 'active' : ''}`} />
                    <div className="jc-workflow-info">
                      <span className="jc-workflow-title">Quality Check</span>
                      <span className="jc-workflow-time">{jobCardStatus === 'Completed' ? "Completed" : "Pending"}</span>
                    </div>
                  </div>

                  <div className="jc-workflow-item">
                    <div className="jc-workflow-circle" style={{ background: jobCardStatus === 'Completed' ? '#10B981' : '#94A3B8' }}>
                      {jobCardStatus === 'Completed' ? "✓" : "5"}
                    </div>
                    <div className="jc-workflow-info">
                      <span className="jc-workflow-title">Completed</span>
                      <span className="jc-workflow-time">{jobCardStatus === 'Completed' ? "Completed" : "Pending"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Card Summary / Invoice */}
              <div className="jc-card">
                <h2 className="jc-card-title">Job Card Summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="ma-summary-row">
                    <span>Total Parts Cost</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>₹1,850</span>
                  </div>
                  <div className="ma-summary-row">
                    <span>Labor Charges</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>₹450</span>
                  </div>
                  <div className="ma-summary-row">
                    <span>Discount</span>
                    <span>- ₹0</span>
                  </div>
                  <div className="ma-divider" style={{ margin: '4px 0' }} />
                  <div className="ma-summary-row ma-summary-row-bold">
                    <span>Total Amount</span>
                    <span style={{ color: '#2A195C' }}>₹2,300</span>
                  </div>
                  <div className="ma-summary-row">
                    <span>Amount Paid</span>
                    <span>{jobCardStatus === 'Completed' ? "₹2,300" : "₹0"}</span>
                  </div>
                  <div className="ma-summary-row ma-summary-row-bold" style={{ fontSize: '13px' }}>
                    <span>Pending Amount</span>
                    <span style={{ color: jobCardStatus === 'Completed' ? '#10B981' : '#EF4444' }}>
                      {jobCardStatus === 'Completed' ? "₹0" : "₹2,300"}
                    </span>
                  </div>
                  {jobCardStatus !== 'Completed' && (
                    <button 
                      type="button" 
                      className="mo-btn mo-btn-primary" 
                      onClick={handleMarkAsCompleted}
                      style={{ marginTop: '10px', height: '42px', borderRadius: '10px' }}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>

              {/* Mechanic Notes */}
              <div className="jc-card">
                <div className="jc-card-title">
                  <span>Mechanic Notes</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#6366F1', cursor: 'pointer' }}>✎ Edit</span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
                  Performed periodic service. All major systems are normal. Replaced brake pads front. Next service due at 14,000 km.
                </p>
              </div>
            </div>

            {/* Column 3: Timeline, Customer Details & Payment Info */}
            <div className="jc-col">
              {/* Job Card Timeline */}
              <div className="jc-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 className="jc-card-title" style={{ margin: 0 }}>Job Card Timeline</h2>
                  <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: 700 }}>View All</span>
                </div>

                <div className="jc-timeline">
                  <div className="jc-timeline-item">
                    <div className="jc-timeline-bullet" />
                    <div>
                      <div className="jc-timeline-text">Job card created by <b>Admin</b> (You)</div>
                      <div className="jc-timeline-time">19 Jun 2026, 09:45 AM</div>
                    </div>
                  </div>
                  <div className="jc-timeline-item">
                    <div className="jc-timeline-bullet" />
                    <div>
                      <div className="jc-timeline-text">Scheduled for service by <b>Admin</b> (You)</div>
                      <div className="jc-timeline-time">19 Jun 2026, 09:50 AM</div>
                    </div>
                  </div>
                  <div className="jc-timeline-item">
                    <div className="jc-timeline-bullet" />
                    <div>
                      <div className="jc-timeline-text">Mechanic assigned: <b>Ravi Kumar</b></div>
                      <div className="jc-timeline-time">19 Jun 2026, 09:55 AM</div>
                    </div>
                  </div>
                  <div className="jc-timeline-item">
                    <div className="jc-timeline-bullet" />
                    <div>
                      <div className="jc-timeline-text">Vehicle received at station by <b>Ravi Kumar</b></div>
                      <div className="jc-timeline-time">20 Jun 2026, 09:05 AM</div>
                    </div>
                  </div>
                  {jobCardStatus === 'Completed' && (
                    <div className="jc-timeline-item">
                      <div className="jc-timeline-bullet" style={{ background: '#10B981' }} />
                      <div>
                        <div className="jc-timeline-text" style={{ color: '#16A34A', fontWeight: 700 }}>Service completed & paid from wallet</div>
                        <div className="jc-timeline-time">20 Jun 2026, 11:30 AM</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Details */}
              <div className="jc-card">
                <h2 className="jc-card-title">Customer Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="jc-field-label">Customer Name</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>Neha Verma</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="jc-field-label">Customer ID</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>CUST-2026-000178</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="jc-field-label">Contact Number</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>+91 98765 43210</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="jc-field-label">Email ID</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>neha.verma@email.com</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="jc-card">
                <h2 className="jc-card-title">Payment Information</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="jc-field-label">Payment Type</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>Franchise Wallet</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="jc-field-label">Wallet Balance</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>₹12,450</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="jc-field-label">Transaction Status</span>
                    <span className={`mo-badge ${paymentStatus === 'Completed' ? 'mo-badge-green' : 'mo-badge-orange'}`}>
                      {paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
