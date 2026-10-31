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

/* Stepper Wizard Styles */
.wiz-container { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); max-width: 900px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; overflow: hidden; }
.wiz-header { display: flex; border-bottom: 1px solid #E2E8F0; background: #F8FAFC; padding: 20px 24px; }
.step-item { display: flex; align-items: center; gap: 8px; flex: 1; position: relative; }
.step-item:not(:last-child)::after { content: ''; position: absolute; right: 12px; left: 130px; height: 2px; background: #E2E8F0; top: 50%; transform: translateY(-50%); z-index: 1; }
.step-item.active:not(:last-child)::after { background: #6366F1; }
.step-num { width: 28px; height: 28px; border-radius: 50%; background: #E2E8F0; color: #64748B; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; z-index: 2; border: 2px solid #fff; transition: all 0.15s; }
.step-item.active .step-num { background: #6366F1; color: #fff; }
.step-item.done .step-num { background: #10B981; color: #fff; }
.step-label { font-size: 12.5px; font-weight: 700; color: #64748B; z-index: 2; transition: all 0.15s; }
.step-item.active .step-label { color: #0F172A; }
.step-item.done .step-label { color: #10B981; }

.wiz-body { padding: 30px 40px; flex: 1; }
.wiz-title { font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
.wiz-sub { font-size: 13px; color: #64748B; margin-bottom: 24px; }

/* Form styles */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: span 2; }
.form-lbl { font-size: 12px; font-weight: 700; color: #334155; }
.form-inp { padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13.5px; outline: none; background: #fff; color: #1E293B; transition: border-color 0.15s; }
.form-inp:focus { border-color: #6366F1; }
.form-inp::placeholder { color: #94A3B8; }
.form-select { cursor: pointer; }

/* Plan Selection Cards */
.plan-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 10px; }
.plan-card { border: 2px solid #E2E8F0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; cursor: pointer; transition: all 0.15s; position: relative; }
.plan-card:hover { border-color: #A5B4FC; }
.plan-card.selected { border-color: #6366F1; background: #EEF2FF; }
.plan-name { font-size: 14.5px; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
.plan-price { font-size: 18px; font-weight: 800; color: #6366F1; margin-bottom: 12px; }
.plan-feat { font-size: 11px; color: #64748B; display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
.plan-feat svg { color: #10B981; width: 12px; height: 12px; }

/* Custom Switch Toggle */
.switch-wrap { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
.switch-inp { display: none; }
.switch-slider { width: 34px; height: 20px; background: #CBD5E1; border-radius: 20px; position: relative; cursor: pointer; transition: background 0.15s; }
.switch-slider::after { content: ''; position: absolute; width: 16px; height: 16px; border-radius: 50%; background: #fff; top: 2px; left: 2px; transition: transform 0.15s; }
.switch-inp:checked + .switch-slider { background: #6366F1; }
.switch-inp:checked + .switch-slider::after { transform: translateX(14px); }

/* Review section specs */
.review-spec { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
.review-row { display: flex; justify-content: space-between; font-size: 13px; border-bottom: 1px dashed #E2E8F0; padding-bottom: 8px; }
.review-row:last-child { border-bottom: none; padding-bottom: 0; }
.review-lbl { color: #64748B; font-weight: 500; }
.review-val { color: #0F172A; font-weight: 700; }

.wiz-footer { border-top: 1px solid #E2E8F0; padding: 16px 40px; background: #F8FAFC; display: flex; justify-content: space-between; }
`;

export default function FranchiseOnboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    phone: '',
    email: '',
    regNo: '',
    zone: 'Gotri Zone',
    address: '',
    launchDate: '',
    plan: 'Standard',
    billingCycle: 'Monthly',
    subdomain: '',
    customDomain: '',
    brandColor: '#2a195c',
    whiteLabelEnabled: true
  });

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Franchise environment successfully initialized and credentials emailed to tenant!');
    setStep(1);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ev-shell">
        <Sidebar activePath="/super-admin/franchise-onboarding" />
        <div className="ev-main">
          
          <TopBar 
            title="Franchise Onboarding Wizard" 
            subtitle="Deploy a new white-labeled SaaS franchise environment in minutes." 
          />

          <div className="ev-body">
            
            <div className="wiz-container">
              {/* Stepper Header */}
              <div className="wiz-header">
                {[
                  { n: 1, label: 'Company Info' },
                  { n: 2, label: 'Location & Zone' },
                  { n: 3, label: 'Subscription Plan' },
                  { n: 4, label: 'Branding Setup' },
                  { n: 5, label: 'Review & Launch' }
                ].map(s => (
                  <div key={s.n} className={`step-item ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
                    <span className="step-num">{step > s.n ? '✓' : s.n}</span>
                    <span className="step-label">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Stepper Wizard Forms */}
              <div className="wiz-body">
                {step === 1 && (
                  <div>
                    <h2 className="wiz-title">Company Profile Details</h2>
                    <p className="wiz-sub">Provide registration and key contact information of the franchise franchisee.</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-lbl">Franchise Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Dwarka Electric Mobility Hub" 
                          className="form-inp"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-lbl">Owner / Operator Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Rahul Sharma" 
                          className="form-inp"
                          value={formData.owner}
                          onChange={e => setFormData({ ...formData, owner: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-lbl">Contact Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. +91 98765 43210" 
                          className="form-inp"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-lbl">Contact Email Address</label>
                        <input 
                          type="email" 
                          placeholder="e.g. owner@dwarka-evegah.com" 
                          className="form-inp"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="form-group full">
                        <label className="form-lbl">Company Registration Number / GSTIN</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 07AAAAB1111A1Z1" 
                          className="form-inp"
                          value={formData.regNo}
                          onChange={e => setFormData({ ...formData, regNo: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="wiz-title">Location & Zone Assignment</h2>
                    <p className="wiz-sub">Configure the physical hub location coordinates and assign pricing zones.</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-lbl">Pricing Zone Assignment</label>
                        <select 
                          className="form-inp form-select"
                          value={formData.zone}
                          onChange={e => setFormData({ ...formData, zone: e.target.value })}
                        >
                          <option>Gotri Zone</option>
                          <option>Manjalpur Zone</option>
                          <option>KPGU Zone</option>
                          <option>Aatapi Zone</option>
                          <option>Moti Daman Zone</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-lbl">Target Launch Date</label>
                        <input 
                          type="date" 
                          className="form-inp"
                          value={formData.launchDate}
                          onChange={e => setFormData({ ...formData, launchDate: e.target.value })}
                        />
                      </div>
                      <div className="form-group full">
                        <label className="form-lbl">Physical Hub Address</label>
                        <textarea 
                          placeholder="Complete physical street details, landmarks and GPS pincode..." 
                          className="form-inp" 
                          style={{ height: '70px', resize: 'none' }}
                          value={formData.address}
                          onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="wiz-title">SaaS Subscription & Billing Settings</h2>
                    <p className="wiz-sub">Choose a tenant plan tier. Monthly recurring cycles will be billed automatically.</p>
                    
                    <div className="plan-cards">
                      {[
                        { name: 'Starter', price: '₹9,999/mo', maxZones: '1 Zone', maxVehicles: '50 Vehicles', maxUsers: '5 Employees' },
                        { name: 'Standard', price: '₹24,999/mo', maxZones: '3 Zones', maxVehicles: '200 Vehicles', maxUsers: '15 Employees' },
                        { name: 'Enterprise', price: '₹59,999/mo', maxZones: 'Unlimited', maxVehicles: '500+ Vehicles', maxUsers: 'Unlimited' }
                      ].map(plan => (
                        <div 
                          key={plan.name} 
                          className={`plan-card ${formData.plan === plan.name ? 'selected' : ''}`}
                          onClick={() => setFormData({ ...formData, plan: plan.name })}
                        >
                          <span className="plan-name">{plan.name}</span>
                          <span className="plan-price">{plan.price}</span>
                          <span className="plan-feat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            {plan.maxZones}
                          </span>
                          <span className="plan-feat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            {plan.maxVehicles}
                          </span>
                          <span className="plan-feat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            {plan.maxUsers}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="form-grid" style={{ marginTop: '20px' }}>
                      <div className="form-group">
                        <label className="form-lbl">Billing Frequency</label>
                        <select 
                          className="form-inp form-select"
                          value={formData.billingCycle}
                          onChange={e => setFormData({ ...formData, billingCycle: e.target.value })}
                        >
                          <option>Monthly</option>
                          <option>Annually (Save 15%)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 className="wiz-title">Subdomain & White-Label Customization</h2>
                    <p className="wiz-sub">Customize subdomain routing prefixes and the color branding parameters.</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-lbl">Assign Subdomain Prefix</label>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            placeholder="e.g. dwarka" 
                            className="form-inp" 
                            style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }}
                            value={formData.subdomain}
                            onChange={e => setFormData({ ...formData, subdomain: e.target.value })}
                          />
                          <span className="form-inp" style={{ background: '#F8FAFC', color: '#94A3B8', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, fontSize: '12px', fontWeight: 'bold' }}>
                            .evegah.com
                          </span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-lbl">Theme Primary Color Accent</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="color" 
                            className="form-inp" 
                            style={{ padding: '0px', width: '42px', height: '42px', cursor: 'pointer' }}
                            value={formData.brandColor}
                            onChange={e => setFormData({ ...formData, brandColor: e.target.value })}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{formData.brandColor}</span>
                        </div>
                      </div>
                      <div className="form-group full">
                        <label className="form-lbl">Custom Landing Page Domain URL (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. rides.dwarka-mobility.com" 
                          className="form-inp"
                          value={formData.customDomain}
                          onChange={e => setFormData({ ...formData, customDomain: e.target.value })}
                        />
                      </div>
                      <div className="form-group full">
                        <div className="switch-wrap">
                          <label className="form-lbl" style={{ cursor: 'pointer', margin: 0 }}>Enable White-Labeled Splash Screens & Email Receipts</label>
                          <input 
                            type="checkbox" 
                            id="wl-sw" 
                            className="switch-inp"
                            checked={formData.whiteLabelEnabled}
                            onChange={e => setFormData({ ...formData, whiteLabelEnabled: e.target.checked })}
                          />
                          <label htmlFor="wl-sw" className="switch-slider" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h2 className="wiz-title">Verify & Initialize Environment</h2>
                    <p className="wiz-sub">Review details. Clicking launch automatically compiles resources and sets up database schema partitions.</p>
                    
                    <div className="review-spec">
                      <div className="review-row">
                        <span className="review-lbl">Franchise Name</span>
                        <span className="review-val">{formData.name || 'Not Provided'}</span>
                      </div>
                      <div className="review-row">
                        <span className="review-lbl">Owner / Operator</span>
                        <span className="review-val">{formData.owner || 'Not Provided'}</span>
                      </div>
                      <div className="review-row">
                        <span className="review-lbl">Hub Contact Email</span>
                        <span className="review-val">{formData.email || 'Not Provided'}</span>
                      </div>
                      <div className="review-row">
                        <span className="review-lbl">Pricing Zone assigned</span>
                        <span className="review-val">{formData.zone}</span>
                      </div>
                      <div className="review-row">
                        <span className="review-lbl">SaaS Tier Plan</span>
                        <span className="review-val">{formData.plan} ({formData.billingCycle})</span>
                      </div>
                      <div className="review-row">
                        <span className="review-lbl">Routing Subdomain</span>
                        <span className="review-val">{formData.subdomain ? `${formData.subdomain}.evegah.com` : 'Not Assigned'}</span>
                      </div>
                      <div className="review-row">
                        <span className="review-lbl">Primary Branding HEX Color</span>
                        <span className="review-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: formData.brandColor }} />
                          {formData.brandColor}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stepper Footer Controls */}
              <div className="wiz-footer">
                <button 
                  className="fr-btn" 
                  onClick={handleBack} 
                  disabled={step === 1}
                  style={{ opacity: step === 1 ? 0.5 : 1 }}
                >
                  Back
                </button>
                {step < 5 ? (
                  <button 
                    className="fr-btn fr-btn-primary" 
                    onClick={handleNext}
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    className="fr-btn fr-btn-primary" 
                    style={{ background: '#10B981', borderColor: '#10B981' }}
                    onClick={handleSubmit}
                  >
                    Deploy Environment
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
