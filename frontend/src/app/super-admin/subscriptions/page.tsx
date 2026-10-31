"use client";
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.ev-shell { display: flex; min-height: 100vh; background: #F3F4F9; font-family: 'Inter', sans-serif; }
.ev-main { margin-left: var(--ev-sidebar-width, 240px); display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - var(--ev-sidebar-width, 240px)); }
.ev-body { padding: 20px 22px 50px; flex: 1; display: flex; flex-direction: column; gap: 20px; }

/* Custom Super Admin Top Bar */
.sa-tb { height: 68px; background: #fff; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; padding: 0 22px; justify-content: space-between; position: sticky; top: 0; z-index: 90; }
.sa-tb-left { display: flex; flex-direction: column; }
.sa-tb-hello { font-size: 17px; font-weight: 800; color: #111827; display: flex; align-items: center; gap: 6px; }
.sa-tb-sub { font-size: 11.5px; color: #64748B; margin-top: 2px; }
.sa-tb-right { display: flex; align-items: center; gap: 14px; }
.sa-tb-prof { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.sa-tb-prof-av { width: 34px; height: 34px; border-radius: 50%; background: #6366F1; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.sa-tb-prof-info { display: flex; flex-direction: column; }
.sa-tb-prof-name { font-size: 12.5px; font-weight: 700; color: #1E293B; line-height: 1.2; }
.sa-tb-prof-role { font-size: 10px; color: #64748B; }

/* Stats Row */
.sub-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.sub-kpi { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.sub-kpi-ic { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-purple { background: #EEF2FF; color: #6366F1; }
.kpi-green { background: #ECFDF5; color: #10B981; }
.kpi-orange { background: #FFF7ED; color: #F97316; }
.kpi-blue { background: #EFF6FF; color: #3B82F6; }
.sub-kpi-info { display: flex; flex-direction: column; }
.sub-kpi-lbl { font-size: 11px; font-weight: 600; color: #64748B; }
.sub-kpi-val { font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 2px; }

/* Subscriptions layout */
.sub-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden; display: flex; flex-direction: column; }
.sub-card-hdr { padding: 14px 18px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between; }
.sub-card-tit { font-size: 13.5px; font-weight: 700; color: #0F172A; }
.sub-table { width: 100%; border-collapse: collapse; }
.sub-table th { font-size: 10.5px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; padding: 10px 16px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
.sub-table td { padding: 12px 16px; font-size: 12.5px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; color: #334155; }
.sub-table tr:hover td { background: #F8FAFC; }
.sub-table tr:last-child td { border-bottom: none; }

/* Badges */
.badge-pill { display: inline-flex; align-items: center; justify-content: center; padding: 3px 9px; border-radius: 20px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; }
.badge-active { background: #DCFCE7; color: #15803D; }
.badge-trial { background: #E0F2FE; color: #0369A1; }
.badge-suspended { background: #FEE2E2; color: #EF4444; }
.badge-expired { background: #F3F4F6; color: #4B5563; }

.act-row-btns { display: flex; align-items: center; gap: 6px; }
.act-btn { padding: 4px 8px; border: 1.5px solid #E2E8F0; border-radius: 6px; font-size: 11px; font-weight: 700; color: #475569; background: #fff; cursor: pointer; transition: all 0.15s; }
.act-btn:hover { border-color: #6366F1; color: #6366F1; }
`;

interface Subscription {
  tenantName: string;
  plan: 'Starter' | 'Standard' | 'Enterprise';
  billing: 'Monthly' | 'Annual';
  mrr: number;
  nextInvoice: string;
  status: 'active' | 'trial' | 'suspended' | 'expired';
  paymentMethod: string;
}

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { tenantName: 'EcoRide Solutions', plan: 'Enterprise', billing: 'Monthly', mrr: 59999, nextInvoice: '12 Jun 2026', status: 'active', paymentMethod: 'HDFC Card **** 8820' },
  { tenantName: 'GreenMove Mobility', plan: 'Standard', billing: 'Annual', mrr: 21250, nextInvoice: '18 Jan 2027', status: 'active', paymentMethod: 'UPI Auto-pay' },
  { tenantName: 'VoltEdge Rentals', plan: 'Standard', billing: 'Monthly', mrr: 24999, nextInvoice: '22 Jun 2026', status: 'active', paymentMethod: 'ICICI Card **** 9012' },
  { tenantName: 'EvoFleet Services', plan: 'Enterprise', billing: 'Monthly', mrr: 59999, nextInvoice: '02 Jun 2026', status: 'active', paymentMethod: 'Bank Transfer' },
  { tenantName: 'NextGen Mobility', plan: 'Starter', billing: 'Monthly', mrr: 9999, nextInvoice: '10 Jun 2026', status: 'trial', paymentMethod: 'None' },
  { tenantName: 'Gotri E-Wheels Hub', plan: 'Starter', billing: 'Monthly', mrr: 9999, nextInvoice: 'N/A', status: 'suspended', paymentMethod: 'HDFC Card **** 8820' },
  { tenantName: 'Manjalpur E-Wheels', plan: 'Starter', billing: 'Monthly', mrr: 9999, nextInvoice: '15 Dec 2025', status: 'expired', paymentMethod: 'UPI Auto-pay' }
];

export default function Subscriptions() {
  const [subscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ev-shell">
        <Sidebar activePath="/super-admin/subscriptions" />
        <div className="ev-main">
          
          <TopBar 
            title="SaaS Subscriptions & Billing" 
            subtitle="Track active recurring plans, MRR billing invoices and plan adjustments." 
          />

          <div className="ev-body">
            
            {/* KPI metrics */}
            <div className="sub-kpis">
              <div className="sub-kpi">
                <div className="sub-kpi-ic kpi-purple">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                </div>
                <div className="sub-kpi-info">
                  <span className="sub-kpi-lbl">Active Subscriptions</span>
                  <span className="sub-kpi-val">96</span>
                </div>
              </div>

              <div className="sub-kpi">
                <div className="sub-kpi-ic kpi-green">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                <div className="sub-kpi-info">
                  <span className="sub-kpi-lbl">Total SaaS MRR</span>
                  <span className="sub-kpi-val">₹1,24,75,320</span>
                </div>
              </div>

              <div className="sub-kpi">
                <div className="sub-kpi-ic kpi-orange">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                </div>
                <div className="sub-kpi-info">
                  <span className="sub-kpi-lbl">Due Invoices</span>
                  <span className="sub-kpi-val">4</span>
                </div>
              </div>

              <div className="sub-kpi">
                <div className="sub-kpi-ic kpi-blue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </div>
                <div className="sub-kpi-info">
                  <span className="sub-kpi-lbl">Trial Tier Expiring</span>
                  <span className="sub-kpi-val">8</span>
                </div>
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="sub-card">
              <div className="sub-card-hdr">
                <span className="sub-card-tit">Active Tenant Subscriptions</span>
                <button className="act-btn" style={{ borderColor: '#6366F1', color: '#6366F1' }} onClick={() => alert('Opening create billing tier modal...')}>+ Create Custom Tier</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="sub-table">
                  <thead>
                    <tr>
                      <th>Tenant Name</th>
                      <th>Current Plan</th>
                      <th>Billing Mode</th>
                      <th>MRR Rate</th>
                      <th>Next Invoice Date</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map(s => (
                      <tr key={s.tenantName}>
                        <td style={{ fontWeight: '700', color: '#1E293B' }}>{s.tenantName}</td>
                        <td style={{ fontWeight: '600' }}>
                          <span style={{ color: s.plan === 'Enterprise' ? '#8B5CF6' : s.plan === 'Standard' ? '#3B82F6' : '#10B981' }}>{s.plan}</span>
                        </td>
                        <td style={{ fontWeight: '500', color: '#64748B' }}>{s.billing}</td>
                        <td style={{ fontWeight: '700', color: '#0F172A' }}>₹{s.mrr.toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: '500', color: '#64748B' }}>{s.nextInvoice}</td>
                        <td style={{ fontSize: '11.5px', color: '#475569' }}>{s.paymentMethod}</td>
                        <td>
                          <span className={`badge-pill ${
                            s.status === 'active' ? 'badge-active' :
                            s.status === 'trial' ? 'badge-trial' :
                            s.status === 'suspended' ? 'badge-suspended' : 'badge-expired'
                          }`}>{s.status}</span>
                        </td>
                        <td>
                          <div className="act-row-btns">
                            <button className="act-btn" onClick={() => alert(`Upgrading/adjusting tier details for ${s.tenantName}`)}>Adjust Plan</button>
                            <button className="act-btn" style={{ color: '#EF4444' }} onClick={() => alert(`Confirm suspension action on ${s.tenantName}`)}>Suspend</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
