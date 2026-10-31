"use client";
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Link from 'next/link';

const CSS = `
.pk-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.pk-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.pk-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Custom top bar welcome greeting */
.pk-top-info { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: #fff; border-bottom: 1px solid #E2E8F0; }
.pk-user-greet { display: flex; align-items: center; gap: 10px; }
.pk-user-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; background: #EEF2FF; }
.pk-user-text { display: flex; flex-direction: column; }
.pk-user-name { font-size: 13.5px; font-weight: 700; color: #1E293B; }
.pk-user-role { font-size: 11.5px; color: #64748B; }

.pk-top-actions { display: flex; align-items: center; gap: 16px; }
.pk-zone-select { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #334155; background: #fff; cursor: pointer; }
.pk-bell-btn { position: relative; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #E2E8F0; display: flex; align-items: center; justify-content: center; color: #475569; background: #fff; cursor: pointer; }
.pk-bell-badge { position: absolute; top: -2px; right: -2px; width: 16px; height: 16px; border-radius: 50%; background: #2a195c; color: #fff; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }

/* Header title */
.pk-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-top: 4px; }
.pk-back-link { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #2A195C; text-decoration: none; cursor: pointer; margin-bottom: 6px; }
.pk-back-link:hover { text-decoration: underline; }
.pk-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 6px; letter-spacing: -0.02em; }
.pk-sub { font-size: 13.5px; color: #64748B; margin: 0; font-weight: 400; }

.pk-actions { display: flex; align-items: center; gap: 10px; }
.pk-btn { display: flex; align-items: center; gap: 7px; padding: 9px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; }
.pk-btn:hover { border-color: #2a195c; color: #2a195c; }
.pk-btn-primary { background: #2a195c; color: #fff; border-color: #2a195c; }
.pk-btn-primary:hover { background: #4338CA; border-color: #4338CA; color: #fff; }

/* Tabs categories */
.pk-tabs-card { border-bottom: 1px solid #E2E8F0; margin-bottom: 4px; overflow-x: auto; }
.pk-tabs-list { display: flex; gap: 24px; }
.pk-tab { padding: 12px 4px 14px; font-size: 13.5px; font-weight: 600; color: #64748B; cursor: pointer; border-bottom: 2.5px solid transparent; transition: all .15s; white-space: nowrap; background: transparent; border-top: none; border-left: none; border-right: none; }
.pk-tab:hover { color: #2a195c; }
.pk-tab.active { color: #2a195c; border-color: #2a195c; font-weight: 700; }

/* Page Layout grid */
.pk-layout-grid { display: grid; grid-template-columns: 2.1fr 1fr; gap: 20px; align-items: start; }
.pk-left-col { display: flex; flex-direction: column; gap: 20px; }

/* Features tab design */
.pk-form-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 20px; }
.pk-form-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 14px; }
.pk-form-tit { font-size: 15px; font-weight: 700; color: #0F172A; }
.pk-form-sub { font-size: 12.5px; color: #64748B; margin-top: 4px; }

.pk-search-wrap { position: relative; width: 220px; }
.pk-search-input { width: 100%; padding: 8px 12px 8px 32px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12px; outline: none; }
.pk-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94A3B8; display: flex; align-items: center; }

/* Module list items */
.pk-module-group { display: flex; flex-direction: column; gap: 12px; }
.pk-module-group-title { font-size: 13px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; }
.pk-module-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1px solid #F1F5F9; border-radius: 10px; background: #FAFAFA; transition: background .12s; }
.pk-module-item:hover { background: #F8FAFC; }
.pk-module-l { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.pk-module-ic { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ic-purple { background: #8B5CF6; color: #fff; }
.ic-green { background: #10B981; color: #fff; }
.ic-orange { background: #F97316; color: #fff; }
.ic-blue { background: #3B82F6; color: #fff; }
.ic-gray { background: #6B7280; color: #fff; }

.pk-module-meta { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.pk-module-name { font-size: 13px; font-weight: 700; color: #1E293B; }
.pk-module-desc { font-size: 11.5px; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }

.pk-module-r { display: flex; align-items: center; gap: 14px; }
.pk-chev-btn { background: none; border: none; color: #94A3B8; cursor: pointer; display: flex; align-items: center; }

/* Toggle Switch */
.pk-switch { position: relative; display: inline-block; width: 38px; height: 20px; }
.pk-switch input { opacity: 0; width: 0; height: 0; }
.pk-slider { position: absolute; cursor: pointer; inset: 0; background-color: #CBD5E1; transition: .3s; border-radius: 20px; }
.pk-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; }
input:checked + .pk-slider { background-color: #2A195C; }
input:checked + .pk-slider:before { transform: translateX(18px); }

.pk-form-ft { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #F1F5F9; font-size: 12px; color: #64748B; }
.pk-legend-item { display: flex; align-items: center; gap: 6px; }
.pk-leg-dot { width: 8px; height: 8px; border-radius: 50%; }

/* Limits & Quotas Form Tab */
.pk-limits-tbl { width: 100%; border-collapse: collapse; text-align: left; }
.pk-limits-tbl th { padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1.5px solid #E2E8F0; background: #FAFBFD; }
.pk-limits-tbl td { padding: 12px 14px; font-size: 12.5px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.pk-limits-tbl tr:last-child td { border-bottom: none; }

.pk-limits-tbl-strong { font-weight: 700; color: #1E293B; }
.pk-limit-input { width: 70px; padding: 6px 10px; border: 1.5px solid #E2E8F0; border-radius: 6px; font-size: 12px; outline: none; font-weight: 600; text-align: center; }
.pk-limit-input:focus { border-color: #2a195c; }
.pk-limit-select-sm { padding: 6px 10px; border: 1.5px solid #E2E8F0; border-radius: 6px; font-size: 12px; outline: none; background: #fff; cursor: pointer; font-weight: 600; }

.pk-reset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.pk-reset-field { display: flex; flex-direction: column; gap: 6px; }
.pk-reset-lbl { font-size: 12.5px; font-weight: 600; color: #334155; }
.pk-reset-select { padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #334155; cursor: pointer; font-weight: 500; }
.pk-reset-hint { font-size: 11.5px; color: #94A3B8; margin-top: 4px; display: flex; align-items: center; gap: 6px; }

/* Right Column Sidebar */
.pk-sidebar { display: flex; flex-direction: column; gap: 16px; }
.pk-preview-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; display: flex; flex-direction: column; }
.pk-preview-hdr { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #F1F5F9; }
.pk-preview-tit { font-size: 13.5px; font-weight: 700; color: #0F172A; }
.pk-active-badge { background: #DCFCE7; color: #15803D; padding: 2px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; }

.pk-preview-banner { background: linear-gradient(135deg, #2A195C 0%, #2a195c 100%); color: #fff; padding: 22px 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; position: relative; }
.pk-banner-crown { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; }
.pk-banner-name { font-size: 18px; font-weight: 800; letter-spacing: -0.01em; }
.pk-banner-desc { font-size: 11px; opacity: 0.85; line-height: 1.4; max-width: 230px; }
.pk-banner-price { font-size: 22px; font-weight: 800; margin-top: 4px; }
.pk-banner-price span { font-size: 11px; opacity: 0.75; font-weight: 500; }

.pk-preview-features { padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.pk-feature-el { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #334155; font-weight: 500; }
.pk-feature-check { width: 14px; height: 14px; border-radius: 50%; background: #DCFCE7; color: #16A34A; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; }

.pk-summary-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 12px; }
.pk-summary-tit { font-size: 13.5px; font-weight: 700; color: #0F172A; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px; }
.pk-summary-list { display: flex; flex-direction: column; gap: 8px; }
.pk-summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; }
.pk-summary-lbl { color: #64748B; font-weight: 500; }
.pk-summary-val { font-weight: 700; color: #1E293B; }

/* Bottom Action Bar */
.pk-action-footer { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-top: 1px solid #E2E8F0; background: #fff; border-radius: 14px; box-shadow: 0 -1px 3px rgba(0,0,0,.02); }
`;

export default function EditPackagePage() {
  const [activeTab, setActiveTab] = useState('Features & Access');
  const [searchFilter, setSearchFilter] = useState('');

  // Core Modules checklist state
  const [coreModules, setCoreModules] = useState([
    { name: 'Dashboard & Analytics', desc: 'Access to dashboard, reports and analytics', enabled: true, iconClass: 'ic-purple', type: 'chart' },
    { name: 'Registrations', desc: 'Manage rider registrations and KYC', enabled: true, iconClass: 'ic-green', type: 'reg' },
    { name: 'Vehicles', desc: 'Add, manage and track vehicles', enabled: true, iconClass: 'ic-orange', type: 'car' },
    { name: 'Rentals', desc: 'Create and manage rentals & returns', enabled: true, iconClass: 'ic-green', type: 'bike' },
    { name: 'Battery Management', desc: 'Battery inventory, swaps and tracking', enabled: true, iconClass: 'ic-purple', type: 'battery' },
    { name: 'Reports', desc: 'Access to all reports and export', enabled: true, iconClass: 'ic-green', type: 'report' },
    { name: 'Zone Management', desc: 'Create zones, geofence and analytics', enabled: true, iconClass: 'ic-blue', type: 'zone' },
  ]);

  // Advanced Modules state
  const [advModules, setAdvModules] = useState([
    { name: 'Maintenance Management', desc: 'Schedule and manage vehicle maintenance', enabled: true, iconClass: 'ic-purple', type: 'tools' },
    { name: 'IoT & Tracking', desc: 'Live tracking, geofence, alerts and diagnostics', enabled: true, iconClass: 'ic-blue', type: 'signal' },
    { name: 'Finance & Payments', desc: 'Payments, invoices, settlements and refunds', enabled: false, iconClass: 'ic-orange', type: 'finance' },
    { name: 'Franchise Management', desc: 'Manage franchises, branches and commissions', enabled: true, iconClass: 'ic-green', type: 'franchise' },
    { name: 'API Access', desc: 'Access to REST APIs and integrations', enabled: false, iconClass: 'ic-gray', type: 'code' },
    { name: 'White Label', desc: 'Enable white label with custom branding', enabled: false, iconClass: 'ic-gray', type: 'shield' },
    { name: 'Mobile App Access', desc: 'Access to mobile applications (Rider/Employee)', enabled: true, iconClass: 'ic-purple', type: 'phone' },
  ]);

  // Handle core toggle
  const toggleCore = (idx: number) => {
    setCoreModules(prev => prev.map((item, i) => i === idx ? { ...item, enabled: !item.enabled } : item));
  };

  // Handle adv toggle
  const toggleAdv = (idx: number) => {
    setAdvModules(prev => prev.map((item, i) => i === idx ? { ...item, enabled: !item.enabled } : item));
  };

  const tabs = [
    'Package Details',
    'Features & Access',
    'Limits & Quotas',
    'Pricing & Billing',
    'Additional Settings'
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pk-shell">
        <Sidebar activePath="/franchise/packages" />
        <div className="pk-main">
          <TopBar />

          <div className="pk-page">
            {/* Header section */}
            <div>
              <Link href="/franchise/packages" className="pk-back-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: 'rotate(180deg)' }}>
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
                Subscription Packages
              </Link>
              <div className="pk-title-row">
                <div>
                  <h1 className="pk-h1">Edit Package</h1>
                  <p className="pk-sub">Update package details, features and limits.</p>
                </div>
                <div className="pk-actions">
                  <button className="pk-btn">Cancel</button>
                  <button className="pk-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 2 }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Preview
                  </button>
                  <button className="pk-btn pk-btn-primary">Save Changes</button>
                </div>
              </div>
            </div>

            {/* Tabs Row */}
            <div className="pk-tabs-card">
              <div className="pk-tabs-list">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`pk-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Split */}
            <div className="pk-layout-grid">
              {/* Left Column Forms */}
              <div className="pk-left-col">
                {activeTab === 'Features & Access' && (
                  <div className="pk-form-card">
                    <div className="pk-form-hdr">
                      <div>
                        <span className="pk-form-tit">Features & Access</span>
                        <p className="pk-form-sub">Enable or disable platform features and module access for this package.</p>
                      </div>
                      <div className="pk-search-wrap">
                        <span className="pk-search-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          className="pk-search-input"
                          placeholder="Search feature..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Section 1: Core Modules */}
                    <div className="pk-module-group">
                      <span className="pk-module-group-title">Core Modules</span>
                      {coreModules
                        .filter(m => m.name.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map((mod, idx) => (
                          <div key={idx} className="pk-module-item">
                            <div className="pk-module-l">
                              <div className={`pk-module-ic ${mod.iconClass}`}>
                                {mod.type === 'chart' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                                  </svg>
                                )}
                                {mod.type === 'reg' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                  </svg>
                                )}
                                {mod.type === 'car' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 5v3h-7z" />
                                  </svg>
                                )}
                                {mod.type === 'bike' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <circle cx="5.5" cy="17.5" r="2.5" /><circle cx="18.5" cy="17.5" r="2.5" />
                                  </svg>
                                )}
                                {mod.type === 'battery' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="13" x2="23" y2="11" />
                                  </svg>
                                )}
                                {mod.type === 'report' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
                                  </svg>
                                )}
                                {mod.type === 'zone' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                                  </svg>
                                )}
                              </div>
                              <div className="pk-module-meta">
                                <span className="pk-module-name">{mod.name}</span>
                                <span className="pk-module-desc">{mod.desc}</span>
                              </div>
                            </div>
                            <div className="pk-module-r">
                              <label className="pk-switch">
                                <input type="checkbox" checked={mod.enabled} onChange={() => toggleCore(idx)} />
                                <span className="pk-slider" />
                              </label>
                              <button className="pk-chev-btn">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Section 2: Advanced Modules */}
                    <div className="pk-module-group">
                      <span className="pk-module-group-title">Advanced Modules</span>
                      {advModules
                        .filter(m => m.name.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map((mod, idx) => (
                          <div key={idx} className="pk-module-item">
                            <div className="pk-module-l">
                              <div className={`pk-module-ic ${mod.iconClass}`}>
                                {mod.type === 'tools' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                  </svg>
                                )}
                                {mod.type === 'signal' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 7.76a6 6 0 0 0 0 8.49" />
                                  </svg>
                                )}
                                {mod.type === 'finance' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                                  </svg>
                                )}
                                {mod.type === 'franchise' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                                  </svg>
                                )}
                                {mod.type === 'code' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                                  </svg>
                                )}
                                {mod.type === 'shield' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                  </svg>
                                )}
                                {mod.type === 'phone' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                                  </svg>
                                )}
                              </div>
                              <div className="pk-module-meta">
                                <span className="pk-module-name">{mod.name}</span>
                                <span className="pk-module-desc">{mod.desc}</span>
                              </div>
                            </div>
                            <div className="pk-module-r">
                              <label className="pk-switch">
                                <input type="checkbox" checked={mod.enabled} onChange={() => toggleAdv(idx)} />
                                <span className="pk-slider" />
                              </label>
                              <button className="pk-chev-btn">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Footer list indicators */}
                    <div className="pk-form-ft">
                      <div style={{ display: 'flex', gap: 16 }}>
                        <span className="pk-legend-item">
                          <span className="pk-leg-dot" style={{ background: '#2A195C' }} />
                          Enabled
                        </span>
                        <span className="pk-legend-item">
                          <span className="pk-leg-dot" style={{ background: '#CBD5E1' }} />
                          Disabled
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
                          <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
                        </svg>
                        Drag to reorder modules
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Limits & Quotas' && (
                  <div className="pk-form-card">
                    <div className="pk-form-hdr">
                      <div>
                        <span className="pk-form-tit">Limits & Quotas</span>
                        <p className="pk-form-sub">Define usage limits and quotas for this package.</p>
                      </div>
                      <div>
                        <select className="pk-reset-select" style={{ padding: '6px 12px', fontSize: '12px' }} defaultValue="Monthly">
                          <option>Billing Cycle: Monthly</option>
                          <option>Billing Cycle: Yearly</option>
                        </select>
                      </div>
                    </div>

                    {/* Table 1: Platform Usage Limits */}
                    <div className="pk-module-group">
                      <span className="pk-module-group-title">Platform Usage Limits</span>
                      <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                        <table className="pk-limits-tbl">
                          <thead>
                            <tr>
                              <th>Resource / Feature</th>
                              <th>Description</th>
                              <th>Limit Type</th>
                              <th>Limit</th>
                              <th>Unit</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="pk-limits-tbl-strong">Vehicles</td>
                              <td style={{ color: '#64748B' }}>Maximum vehicles that can be added</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Fixed">
                                  <option>Fixed</option>
                                  <option>Flexible</option>
                                </select>
                              </td>
                              <td><input type="text" className="pk-limit-input" defaultValue="500" /></td>
                              <td style={{ color: '#64748B', fontWeight: '500' }}>Vehicles</td>
                            </tr>
                            <tr>
                              <td className="pk-limits-tbl-strong">Renters</td>
                              <td style={{ color: '#64748B' }}>Maximum renters that can be added</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Fixed">
                                  <option>Fixed</option>
                                </select>
                              </td>
                              <td><input type="text" className="pk-limit-input" defaultValue="2000" /></td>
                              <td style={{ color: '#64748B', fontWeight: '500' }}>Renters</td>
                            </tr>
                            <tr>
                              <td className="pk-limits-tbl-strong">Zones</td>
                              <td style={{ color: '#64748B' }}>Maximum zones that can be created</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Fixed">
                                  <option>Fixed</option>
                                </select>
                              </td>
                              <td><input type="text" className="pk-limit-input" defaultValue="10" /></td>
                              <td style={{ color: '#64748B', fontWeight: '500' }}>Zones</td>
                            </tr>
                            <tr>
                              <td className="pk-limits-tbl-strong">Branches</td>
                              <td style={{ color: '#64748B' }}>Maximum branches that can be added</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Fixed">
                                  <option>Fixed</option>
                                </select>
                              </td>
                              <td><input type="text" className="pk-limit-input" defaultValue="5" /></td>
                              <td style={{ color: '#64748B', fontWeight: '500' }}>Branches</td>
                            </tr>
                            <tr>
                              <td className="pk-limits-tbl-strong">Employees</td>
                              <td style={{ color: '#64748B' }}>Maximum employees / users</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Fixed">
                                  <option>Fixed</option>
                                </select>
                              </td>
                              <td><input type="text" className="pk-limit-input" defaultValue="50" /></td>
                              <td style={{ color: '#64748B', fontWeight: '500' }}>Users</td>
                            </tr>
                            <tr>
                              <td className="pk-limits-tbl-strong">Storage</td>
                              <td style={{ color: '#64748B' }}>Total storage for documents & images</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Fixed">
                                  <option>Fixed</option>
                                </select>
                              </td>
                              <td><input type="text" className="pk-limit-input" defaultValue="100" /></td>
                              <td style={{ color: '#64748B', fontWeight: '500' }}>GB</td>
                            </tr>
                            <tr>
                              <td className="pk-limits-tbl-strong">API Requests</td>
                              <td style={{ color: '#64748B' }}>Monthly API requests limit</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Unlimited">
                                  <option>Unlimited</option>
                                  <option>Fixed</option>
                                </select>
                              </td>
                              <td><input type="text" className="pk-limit-input" defaultValue="—" disabled style={{ background: '#F1F5F9' }} /></td>
                              <td style={{ color: '#64748B', fontWeight: '500' }}>Requests</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Table 2: Usage Based Limits */}
                    <div className="pk-module-group">
                      <span className="pk-module-group-title">Usage Based Limits</span>
                      <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                        <table className="pk-limits-tbl">
                          <thead>
                            <tr>
                              <th>Resource / Feature</th>
                              <th>Description</th>
                              <th>Limit Type</th>
                              <th>Included</th>
                              <th>Chargeable</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="pk-limits-tbl-strong">Additional Vehicles</td>
                              <td style={{ color: '#64748B' }}>Beyond included vehicle limit</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Per Unit">
                                  <option>Per Unit</option>
                                </select>
                              </td>
                              <td style={{ fontWeight: '600' }}>—</td>
                              <td className="pk-limits-tbl-strong" style={{ color: '#2A195C' }}>₹100 / Vehicle</td>
                            </tr>
                            <tr>
                              <td className="pk-limits-tbl-strong">Additional Renters</td>
                              <td style={{ color: '#64748B' }}>Beyond included renter limit</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Per Unit">
                                  <option>Per Unit</option>
                                </select>
                              </td>
                              <td style={{ fontWeight: '600' }}>—</td>
                              <td className="pk-limits-tbl-strong" style={{ color: '#2A195C' }}>₹20 / Renter</td>
                            </tr>
                            <tr>
                              <td className="pk-limits-tbl-strong">Additional Storage</td>
                              <td style={{ color: '#64748B' }}>Beyond included storage limit</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Per Unit">
                                  <option>Per Unit</option>
                                </select>
                              </td>
                              <td style={{ fontWeight: '600' }}>—</td>
                              <td className="pk-limits-tbl-strong" style={{ color: '#2A195C' }}>₹10 / GB</td>
                            </tr>
                            <tr>
                              <td className="pk-limits-tbl-strong">SMS Notifications</td>
                              <td style={{ color: '#64748B' }}>Transactional SMS</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Per Unit">
                                  <option>Per Unit</option>
                                </select>
                              </td>
                              <td style={{ fontWeight: '600' }}>—</td>
                              <td className="pk-limits-tbl-strong" style={{ color: '#2A195C' }}>₹0.10 / SMS</td>
                            </tr>
                            <tr>
                              <td className="pk-limits-tbl-strong">Email Notifications</td>
                              <td style={{ color: '#64748B' }}>Email notifications</td>
                              <td>
                                <select className="pk-limit-select-sm" defaultValue="Per Unit">
                                  <option>Per Unit</option>
                                </select>
                              </td>
                              <td style={{ fontWeight: '600' }}>—</td>
                              <td className="pk-limits-tbl-strong" style={{ color: '#2A195C' }}>₹0.05 / Email</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Section 3: Reset Settings */}
                    <div className="pk-module-group" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                      <span className="pk-module-group-title">Quota Reset Settings</span>
                      <div className="pk-reset-grid">
                        <div className="pk-reset-field">
                          <label className="pk-reset-lbl">Reset Frequency</label>
                          <select className="pk-reset-select" defaultValue="Monthly">
                            <option>Monthly</option>
                            <option>Daily</option>
                          </select>
                        </div>
                        <div className="pk-reset-field">
                          <label className="pk-reset-lbl">Reset Day</label>
                          <select className="pk-reset-select" defaultValue="1st of Every Month">
                            <option>1st of Every Month</option>
                            <option>End of Month</option>
                          </select>
                        </div>
                      </div>
                      <div className="pk-reset-hint">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: '#94A3B8' }}>
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        All usage counters will be reset on the selected day of each month.
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Placeholders for Detail, Pricing and Add. Settings */}
                {(activeTab === 'Package Details' || activeTab === 'Pricing & Billing' || activeTab === 'Additional Settings') && (
                  <div className="pk-form-card" style={{ alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#64748B' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12, color: '#94A3B8' }}>
                      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    <span style={{ fontWeight: 'bold', color: '#1E293B' }}>{activeTab} Settings Form</span>
                    <p style={{ fontSize: '13px', textAlign: 'center', maxWidth: '300px', marginTop: 4 }}>Standard details form is configured. Please navigate to Features & Access or Limits & Quotas tabs to preview the main components.</p>
                  </div>
                )}

                {/* Bottom Action buttons bar */}
                <div className="pk-action-footer">
                  <button className="pk-btn" style={{ padding: '10px 22px' }}>Cancel</button>
                  <button className="pk-btn pk-btn-primary" style={{ padding: '10px 22px' }}>Save Changes</button>
                </div>
              </div>

              {/* Right Column Preview Cards */}
              <div className="pk-sidebar">
                <div className="pk-preview-card">
                  <div className="pk-preview-hdr">
                    <span className="pk-preview-tit">Package Preview</span>
                    <span className="pk-active-badge">Active</span>
                  </div>

                  <div className="pk-preview-banner">
                    <div className="pk-banner-crown">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                      </svg>
                    </div>
                    <span className="pk-banner-name">Professional</span>
                    <span className="pk-banner-desc">Best for established franchises with multi-zone operations and advanced reporting needs.</span>
                    <div className="pk-banner-price">₹19,999<span>/ month</span></div>
                  </div>

                  <div className="pk-preview-features">
                    <div className="pk-feature-el">
                      <span className="pk-feature-check">✓</span>
                      Up to 500 Vehicles
                    </div>
                    <div className="pk-feature-el">
                      <span className="pk-feature-check">✓</span>
                      Mobile App Access
                    </div>
                    <div className="pk-feature-el">
                      <span className="pk-feature-check">✓</span>
                      Up to 2000 Renters
                    </div>
                    <div className="pk-feature-el">
                      <span className="pk-feature-check">✓</span>
                      API Access
                    </div>
                    <div className="pk-feature-el">
                      <span className="pk-feature-check">✓</span>
                      10 Zones Access
                    </div>
                    <div className="pk-feature-el">
                      <span className="pk-feature-check">✓</span>
                      Custom Domain
                    </div>
                    <div className="pk-feature-el">
                      <span className="pk-feature-check">✓</span>
                      Advanced Reports
                    </div>
                    <div className="pk-feature-el">
                      <span className="pk-feature-check">✓</span>
                      White Label
                    </div>
                    <div className="pk-feature-el" style={{ gridColumn: '1 / -1' }}>
                      <span className="pk-feature-check">✓</span>
                      Priority Support
                    </div>
                  </div>
                </div>

                <div className="pk-summary-card">
                  <span className="pk-summary-tit">Summary</span>
                  <div className="pk-summary-list">
                    <div className="pk-summary-row">
                      <span className="pk-summary-lbl">Billing Cycle</span>
                      <span className="pk-summary-val">Monthly</span>
                    </div>
                    <div className="pk-summary-row">
                      <span className="pk-summary-lbl">Price</span>
                      <span className="pk-summary-val">₹19,999</span>
                    </div>
                    <div className="pk-summary-row">
                      <span className="pk-summary-lbl">Setup Fee</span>
                      <span className="pk-summary-val">₹0</span>
                    </div>
                    <div className="pk-summary-row" style={{ borderTop: '1px dashed #F1F5F9', margin: '4px 0', padding: '4px 0' }}>
                      <span className="pk-summary-lbl">Vehicle Limit</span>
                      <span className="pk-summary-val">500</span>
                    </div>
                    <div className="pk-summary-row">
                      <span className="pk-summary-lbl">Renter Limit</span>
                      <span className="pk-summary-val">2000</span>
                    </div>
                    <div className="pk-summary-row">
                      <span className="pk-summary-lbl">Zone Access</span>
                      <span className="pk-summary-val">10</span>
                    </div>
                    <div className="pk-summary-row" style={{ borderTop: '1px dashed #F1F5F9', margin: '4px 0', padding: '4px 0' }}>
                      <span className="pk-summary-lbl">Status</span>
                      <span className="pk-active-badge">Active</span>
                    </div>
                    <div className="pk-summary-row">
                      <span className="pk-summary-lbl">Created On</span>
                      <span className="pk-summary-val">10 Jan 2024</span>
                    </div>
                    <div className="pk-summary-row">
                      <span className="pk-summary-lbl">Last Updated</span>
                      <span className="pk-summary-val">10 May 2024</span>
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
