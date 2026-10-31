"use client";
import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Link from 'next/link';

const CSS = `
.an-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.an-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.an-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Custom top bar for announcements user welcome */
.an-top-info { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: #fff; border-bottom: 1px solid #E2E8F0; }
.an-user-greet { display: flex; align-items: center; gap: 10px; }
.an-user-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; background: #2a195c; color: #fff; font-size: 13px; font-weight: bold; display: flex; align-items: center; justify-content: center; }
.an-user-text { display: flex; flex-direction: column; }
.an-user-name { font-size: 13.5px; font-weight: 700; color: #1E293B; }
.an-user-role { font-size: 11.5px; color: #64748B; }

.an-top-actions { display: flex; align-items: center; gap: 16px; }
.an-zone-select { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #334155; background: #fff; cursor: pointer; }
.an-bell-btn { position: relative; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #E2E8F0; display: flex; align-items: center; justify-content: center; color: #475569; background: #fff; cursor: pointer; }
.an-bell-badge { position: absolute; top: -2px; right: -2px; width: 16px; height: 16px; border-radius: 50%; background: #2a195c; color: #fff; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }

/* Header title */
.an-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-top: 4px; }
.an-back-link { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #2A195C; text-decoration: none; cursor: pointer; margin-bottom: 6px; }
.an-back-link:hover { text-decoration: underline; }
.an-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 6px; letter-spacing: -0.02em; }
.an-sub { font-size: 13.5px; color: #64748B; margin: 0; font-weight: 400; }

.an-btn { display: flex; align-items: center; gap: 7px; padding: 10px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; }
.an-btn:hover { border-color: #2a195c; color: #2a195c; }
.an-btn-primary { background: #2A195C; color: #fff; border-color: #2A195C; }
.an-btn-primary:hover { background: #4338CA; border-color: #4338CA; color: #fff; }

/* Layout Grid */
.an-layout-grid { display: grid; grid-template-columns: 2.2fr 1fr; gap: 20px; align-items: start; }
.an-left-col { display: flex; flex-direction: column; gap: 20px; }

/* Wizard Form Step Card */
.an-form-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 20px; }
.an-step-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #0F172A; border-bottom: 1px solid #F1F5F9; padding-bottom: 14px; }
.an-step-num { width: 22px; height: 22px; border-radius: 50%; background: #2A195C; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }

.an-field-group { display: flex; flex-direction: column; gap: 6px; }
.an-field-lbl { font-size: 12.5px; font-weight: 600; color: #334155; }
.an-field-lbl span { color: #EF4444; margin-left: 2px; }
.an-input { padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; width: 100%; color: #1E293B; }
.an-input:focus { border-color: #2A195C; }

/* Type Select Grid */
.an-type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.an-type-card { border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 12px; cursor: pointer; display: flex; flex-direction: column; gap: 6px; text-align: left; transition: all .15s; }
.an-type-card:hover { border-color: #C7D2FE; }
.an-type-card.active { border-color: #2A195C; background: #F5F3FF; }
.an-type-card-ic { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.an-type-name { font-size: 13px; font-weight: 700; color: #1E293B; }
.an-type-desc { font-size: 11px; color: #64748B; line-height: 1.3; }

/* Rich Text Editor */
.an-editor-toolbar { border: 1.5px solid #E2E8F0; border-bottom: none; border-radius: 8px 8px 0 0; background: #FAFBFD; padding: 6px 10px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.an-editor-btn { background: none; border: none; padding: 4px 6px; font-size: 12.5px; font-weight: 600; color: #64748B; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.an-editor-btn:hover { background: #E2E8F0; color: #1E293B; }
.an-editor-area { border: 1.5px solid #E2E8F0; border-radius: 0 0 8px 8px; padding: 12px; min-height: 120px; outline: none; font-size: 13px; color: #1E293B; resize: vertical; }

.an-char-cnt { align-self: flex-end; font-size: 11px; color: #94A3B8; font-weight: 500; }

/* Step 2 Inputs */
.an-audience-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.an-select { width: 100%; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #334155; cursor: pointer; font-weight: 500; }
.an-select:focus { border-color: #2A195C; }

/* Step 3 Expiry date inputs */
.an-date-row { display: grid; grid-template-columns: 1.2fr 1.2fr auto; gap: 12px; align-items: center; }
.an-date-input-wrap { position: relative; }
.an-date-ic { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94A3B8; display: flex; align-items: center; pointer-events: none; }
.an-date-input { width: 100%; padding: 10px 12px 10px 32px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; }

/* Toggle push notifications */
.an-toggle-row { display: flex; justify-content: space-between; align-items: center; background: #FAFAFA; border: 1px solid #F1F5F9; border-radius: 10px; padding: 12px 14px; }
.an-toggle-info { display: flex; flex-direction: column; gap: 2px; }
.an-toggle-title { font-size: 13px; font-weight: 700; color: #1E293B; }
.an-toggle-desc { font-size: 11.5px; color: #64748B; }

/* Toggle Switch */
.an-switch { position: relative; display: inline-block; width: 38px; height: 20px; }
.an-switch input { opacity: 0; width: 0; height: 0; }
.an-slider { position: absolute; cursor: pointer; inset: 0; background-color: #CBD5E1; transition: .3s; border-radius: 20px; }
.an-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; }
input:checked + .an-slider { background-color: #2A195C; }
input:checked + .an-slider:before { transform: translateX(18px); }

/* Right Column Sidebar */
.an-sidebar { display: flex; flex-direction: column; gap: 16px; }
.an-side-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.an-side-tit { font-size: 13.5px; font-weight: 700; color: #0F172A; margin-bottom: 12px; display:block; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px; }

/* Preview Card */
.an-preview-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; display: flex; flex-direction: column; }
.an-preview-hdr { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #F1F5F9; }
.an-preview-tit { font-size: 13.5px; font-weight: 700; color: #0F172A; }
.an-preview-tabs { display: flex; border: 1px solid #E2E8F0; border-radius: 6px; padding: 2px; background: #FAFAFA; }
.an-preview-tab { border: none; background: transparent; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #64748B; border-radius: 4px; cursor: pointer; }
.an-preview-tab.active { background: #fff; color: #1E293B; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

.an-preview-body { padding: 16px; background: #F8FAFC; }
.an-preview-visual-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,.02); }
.an-preview-visual-hdr { display: flex; align-items: center; gap: 10px; }
.an-preview-visual-ic { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #F3E8FF; color: #7E22CE; }
.an-preview-visual-title { font-size: 13.5px; font-weight: 700; color: #1E293B; }
.an-preview-visual-subtitle { font-size: 11px; color: #64748B; margin-top: 1px; display: flex; align-items: center; gap: 6px; }
.an-preview-visual-desc { font-size: 12px; color: #475569; line-height: 1.45; }
.an-preview-visual-ft { border-top: 1px solid #F1F5F9; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #64748B; }

/* Summary List items */
.an-sum-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F8FAFC; font-size: 12px; }
.an-sum-item:last-child { border-bottom: none; }
.an-sum-lbl { color: #64748B; font-weight: 500; }
.an-sum-val { font-weight: 700; color: #1E293B; }
.an-sum-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 4px; }
.an-sum-push { background: #DCFCE7; color: #15803D; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; }

/* Tips list */
.an-tips-list { display: flex; flex-direction: column; gap: 10px; }
.an-tip-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #475569; font-weight: 500; }
.an-tip-ic { width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.tip-info { color: #3B82F6; }
.tip-warning { color: #EA580C; }
.tip-clock { color: #6B7280; }
`;

export default function CreateAnnouncementPage() {
  const [title, setTitle] = useState('New Service Center Launched in JP Nagar');
  const [desc, setDesc] = useState('We are excited to announce the launch of our new service center in JP Nagar to serve you better.');
  const [type, setType] = useState<'General' | 'Alert' | 'Update' | 'Maintenance'>('General');
  const [audience, setAudience] = useState('All Users');
  const [targeting, setTargeting] = useState('All Zones');
  const [priority, setPriority] = useState('Medium');
  const [language, setLanguage] = useState('English');
  const [publishOn, setPublishOn] = useState('May 18, 2024 10:00 AM');
  const [expiresOn, setExpiresOn] = useState('May 25, 2024 11:59 PM');
  const [noExpiry, setNoExpiry] = useState(false);
  const [pushNotification, setPushNotification] = useState(true);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="an-shell">
        <Sidebar activePath="/announcements" />
        <div className="an-main">
          <TopBar />

          <div className="an-page">
            {/* Header section */}
            <div>
              <Link href="/announcements" className="an-back-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: 'rotate(180deg)' }}>
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
                Subscription Packages
              </Link>
              <div className="an-title-row" style={{ alignItems: 'flex-start' }}>
                <div>
                  <h1 className="an-h1">Create New Announcement</h1>
                  <p className="an-sub">Share important updates and information with your selected audience.</p>
                </div>
                <div className="an-actions">
                  <button className="an-btn">Save as Draft</button>
                  <button className="an-btn an-btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 2 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Review & Publish
                  </button>
                </div>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="an-layout-grid">
              {/* Left Column Form */}
              <div className="an-left-col">
                {/* Step 1: Announcement Details */}
                <div className="an-form-card">
                  <div className="an-step-title">
                    <span className="an-step-num">1</span>
                    Announcement Details
                  </div>

                  <div className="an-field-group">
                    <label className="an-field-lbl">Announcement Title<span>*</span></label>
                    <input
                      type="text"
                      className="an-input"
                      placeholder="Enter a clear and concise title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <span className="an-char-cnt">{title.length}/100</span>
                  </div>

                  <div className="an-field-group">
                    <label className="an-field-lbl">Announcement Type<span>*</span></label>
                    <div className="an-type-grid">
                      {/* Card 1: General */}
                      <div className={`an-type-card ${type === 'General' ? 'active' : ''}`} onClick={() => setType('General')}>
                        <div className="an-type-card-ic" style={{ background: '#F3E8FF', color: '#7E22CE' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        </div>
                        <span className="an-type-name">General</span>
                        <span className="an-type-desc">General information for all users</span>
                      </div>

                      {/* Card 2: Alert */}
                      <div className={`an-type-card ${type === 'Alert' ? 'active' : ''}`} onClick={() => setType('Alert')}>
                        <div className="an-type-card-ic" style={{ background: '#FFF7ED', color: '#C2410C' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          </svg>
                        </div>
                        <span className="an-type-name">Alert</span>
                        <span className="an-type-desc">Important alert requiring attention</span>
                      </div>

                      {/* Card 3: Update */}
                      <div className={`an-type-card ${type === 'Update' ? 'active' : ''}`} onClick={() => setType('Update')}>
                        <div className="an-type-card-ic" style={{ background: '#ECFDF5', color: '#059669' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <span className="an-type-name">Update</span>
                        <span className="an-type-desc">System or process updates</span>
                      </div>

                      {/* Card 4: Maintenance */}
                      <div className={`an-type-card ${type === 'Maintenance' ? 'active' : ''}`} onClick={() => setType('Maintenance')}>
                        <div className="an-type-card-ic" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                          </svg>
                        </div>
                        <span className="an-type-name">Maintenance</span>
                        <span className="an-type-desc">Maintenance or scheduled downtime</span>
                      </div>
                    </div>
                  </div>

                  <div className="an-field-group">
                    <label className="an-field-lbl">Message<span>*</span></label>
                    <div className="an-editor-toolbar">
                      <button className="an-editor-btn" title="Paragraph">Paragraph</button>
                      <span style={{ color: '#E2E8F0', padding: '0 2px' }}>|</span>
                      <button className="an-editor-btn" title="Bold"><b>B</b></button>
                      <button className="an-editor-btn" title="Italic"><i>I</i></button>
                      <button className="an-editor-btn" title="Underline"><ins>U</ins></button>
                      <button className="an-editor-btn" title="Strikethrough"><s>S</s></button>
                      <span style={{ color: '#E2E8F0', padding: '0 2px' }}>|</span>
                      <button className="an-editor-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                          <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                      </button>
                      <button className="an-editor-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
                          <text x="2" y="11" fontSize="9" fontWeight="700">1.</text>
                        </svg>
                      </button>
                      <span style={{ color: '#E2E8F0', padding: '0 2px' }}>|</span>
                      <button className="an-editor-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </button>
                      <button className="an-editor-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                      </button>
                      <button className="an-editor-btn">☺</button>
                    </div>
                    <textarea
                      className="an-editor-area"
                      placeholder="Type your announcement message here..."
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                    />
                    <span className="an-char-cnt">{desc.length}/5000</span>
                  </div>
                </div>

                {/* Step 2: Audience & Visibility */}
                <div className="an-form-card">
                  <div className="an-step-title">
                    <span className="an-step-num">2</span>
                    Audience & Visibility
                  </div>

                  <div className="an-audience-grid">
                    <div className="an-field-group">
                      <label className="an-field-lbl">Audience<span>*</span></label>
                      <select className="an-select" value={audience} onChange={(e) => setAudience(e.target.value)}>
                        <option>All Users</option>
                        <option>Employees</option>
                        <option>Zone Staff</option>
                      </select>
                    </div>

                    <div className="an-field-group">
                      <label className="an-field-lbl">Additional Targeting (Optional)</label>
                      <select className="an-select" value={targeting} onChange={(e) => setTargeting(e.target.value)}>
                        <option>All Zones</option>
                        <option>Gotri Zone</option>
                        <option>Manjalpur Zone</option>
                        <option>KPGU Zone</option>
                        <option>Aatapi Zone</option>
                        <option>Moti Daman Zone</option>
                      </select>
                    </div>

                    <div className="an-field-group">
                      <label className="an-field-lbl">Priority<span>*</span></label>
                      <select className="an-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>

                    <div className="an-field-group">
                      <label className="an-field-lbl">Language</label>
                      <select className="an-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option>English</option>
                        <option>Hindi</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Step 3: Schedule & Expiry */}
                <div className="an-form-card">
                  <div className="an-step-title">
                    <span className="an-step-num">3</span>
                    Schedule & Expiry
                  </div>

                  <div className="an-date-row">
                    <div className="an-field-group">
                      <label className="an-field-lbl">Publish On<span>*</span></label>
                      <div className="an-date-input-wrap">
                        <span className="an-date-ic">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          className="an-date-input"
                          value={publishOn}
                          onChange={(e) => setPublishOn(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="an-field-group">
                      <label className="an-field-lbl">Expires On (Optional)</label>
                      <div className="an-date-input-wrap">
                        <span className="an-date-ic">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          className="an-date-input"
                          value={expiresOn}
                          onChange={(e) => setExpiresOn(e.target.value)}
                          disabled={noExpiry}
                          style={noExpiry ? { background: '#F1F5F9' } : undefined}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '20px' }}>
                      <input
                        type="checkbox"
                        id="no-expiry"
                        checked={noExpiry}
                        onChange={(e) => setNoExpiry(e.target.checked)}
                      />
                      <label htmlFor="no-expiry" style={{ fontSize: '12.5px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>No Expiry</label>
                    </div>
                  </div>

                  <div className="an-toggle-row">
                    <div className="an-toggle-info">
                      <span className="an-toggle-title">Send push notification</span>
                      <span className="an-toggle-desc">Send push notification to users in the selected audience</span>
                    </div>
                    <label className="an-switch">
                      <input
                        type="checkbox"
                        checked={pushNotification}
                        onChange={(e) => setPushNotification(e.target.checked)}
                      />
                      <span className="an-slider" />
                    </label>
                  </div>
                </div>

                {/* Bottom Cancel & Save actions bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #E2E8F0', padding: '12px 20px', borderRadius: '14px' }}>
                  <button className="an-btn">Cancel</button>
                  <button className="an-btn an-btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 2 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Review & Publish
                  </button>
                </div>
              </div>

              {/* Right Column Preview & Checklist Info */}
              <div className="an-sidebar">
                {/* Preview tab card */}
                <div className="an-preview-card">
                  <div className="an-preview-hdr">
                    <span className="an-preview-tit">Preview</span>
                    <div className="an-preview-tabs">
                      <button className="an-preview-tab active">Web</button>
                      <button className="an-preview-tab">Mobile</button>
                      <button className="an-preview-tab">Email</button>
                    </div>
                  </div>

                  <div className="an-preview-body">
                    <div className="an-preview-visual-card">
                      <div className="an-preview-visual-hdr">
                        <div className={`an-preview-visual-ic ${type === 'General' ? 'ic-general' : type === 'Update' ? 'ic-update' : type === 'Alert' ? 'ic-alert' : 'ic-maintenance'}`}>
                          {type === 'General' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                            </svg>
                          )}
                          {type === 'Update' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            </svg>
                          )}
                          {type === 'Alert' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            </svg>
                          )}
                          {type === 'Maintenance' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span className="an-preview-visual-title">{title || 'Untitled Announcement'}</span>
                          <div className="an-preview-visual-subtitle">
                            <span className={`an-badge badge-${type.toLowerCase()}`} style={{ padding: '1px 6px', fontSize: '9.5px' }}>{type}</span>
                            <span>· {publishOn || 'Date'}</span>
                          </div>
                        </div>
                      </div>
                      <p className="an-preview-visual-desc">{desc || 'Announcement message preview...'}</p>
                      <div className="an-preview-visual-ft">
                        <span>Zone Manager · South Zone</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Announcement Summary */}
                <div className="an-side-card">
                  <span className="an-side-tit">Announcement Summary</span>
                  <div className="an-summary-list">
                    <div className="an-sum-item">
                      <span className="an-sum-lbl">Type</span>
                      <span className="an-sum-val">{type}</span>
                    </div>

                    <div className="an-sum-item">
                      <span className="an-sum-lbl">Audience</span>
                      <span className="an-sum-val">{audience} ({targeting})</span>
                    </div>

                    <div className="an-sum-item">
                      <span className="an-sum-lbl">Priority</span>
                      <span className="an-sum-val">
                        <span className="an-sum-dot" style={{ background: priority === 'High' ? '#EF4444' : priority === 'Medium' ? '#F59E0B' : '#6B7280' }} />
                        {priority}
                      </span>
                    </div>

                    <div className="an-sum-item">
                      <span className="an-sum-lbl">Publish On</span>
                      <span className="an-sum-val">{publishOn}</span>
                    </div>

                    <div className="an-sum-item">
                      <span className="an-sum-lbl">Expires On</span>
                      <span className="an-sum-val">{noExpiry ? 'No Expiry' : expiresOn}</span>
                    </div>

                    <div className="an-sum-item">
                      <span className="an-sum-lbl">Push Notification</span>
                      <span className="an-sum-push">{pushNotification ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                {/* Tips Card */}
                <div className="an-side-card" style={{ background: '#FAFBFD' }}>
                  <span className="an-side-tit">Tips for Effective Announcements</span>
                  <div className="an-tips-list">
                    <div className="an-tip-item">
                      <span className="an-tip-ic tip-info">ⓘ</span>
                      <span>Keep your title clear and concise</span>
                    </div>
                    <div className="an-tip-item">
                      <span className="an-tip-ic tip-info">ⓘ</span>
                      <span>Include all important details in the message</span>
                    </div>
                    <div className="an-tip-item">
                      <span className="an-tip-ic tip-warning">⚠</span>
                      <span>Use high priority only for time-sensitive alerts</span>
                    </div>
                    <div className="an-tip-item">
                      <span className="an-tip-ic tip-clock">⏰</span>
                      <span>Set an expiry date to keep information relevant</span>
                    </div>
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
