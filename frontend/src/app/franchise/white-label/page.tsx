"use client";
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.ev-shell { display: flex; min-height: 100vh; background: #F3F4F9; font-family: 'Inter', sans-serif; }
.ev-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.ev-body { padding: 20px 22px 50px; flex: 1; display: flex; flex-direction: column; gap: 20px; }

/* Breadcrumb */
.fr-bc { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748B; font-weight: 500; }
.fr-bc a { color: #64748B; text-decoration: none; }
.fr-bc a:hover { color: #2a195c; }
.fr-bc-sep { color: #94A3B8; }
.fr-bc-cur { color: #2a195c; font-weight: 700; }

/* White Label configuration layout */
.wl-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }
.wl-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden; display: flex; flex-direction: column; }
.wl-card-hdr { padding: 14px 18px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between; }
.wl-card-tit { font-size: 13.5px; font-weight: 700; color: #0F172A; }
.wl-card-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

/* Upload box */
.wl-upload-box { border: 1.8px dashed #E2E8F0; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 6px; cursor: pointer; transition: all 0.15s; }
.wl-upload-box:hover { border-color: #6366F1; background: #F8FAFC; }
.wl-upload-ic { width: 34px; height: 34px; border-radius: 50%; background: #EEF2FF; color: #6366F1; display: flex; align-items: center; justify-content: center; }
.wl-upload-lbl { font-size: 12px; font-weight: 700; color: #334155; }
.wl-upload-sub { font-size: 10.5px; color: #64748B; }

/* Live Mobile Mockup Preview */
.mobile-mock { width: 100%; height: 500px; border: 10px solid #0F172A; border-radius: 36px; background: #fff; box-shadow: 0 12px 24px -4px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; position: relative; }
.mobile-notch { width: 110px; height: 18px; background: #0F172A; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; align-self: center; z-index: 10; display: flex; align-items: center; justify-content: center; }
.mobile-notch-dot { width: 6px; height: 6px; border-radius: 50%; background: #1E293B; margin-left: 30px; }
.mobile-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 40px 20px 30px; color: #fff; transition: background 0.3s; position: relative; }
.mobile-tagline { font-size: 12px; font-weight: 500; opacity: 0.85; text-align: center; line-height: 1.4; margin-top: 10px; }
.mobile-logo-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 80px; }
.mobile-btn { width: 100%; padding: 12px; border-radius: 10px; font-size: 12.5px; font-weight: 800; border: none; cursor: pointer; text-align: center; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.15s; }

/* DNS Verification styles */
.dns-verify-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
.dns-verify-table th { text-align: left; padding: 6px 8px; background: #F8FAFC; color: #64748B; font-weight: 700; border-bottom: 1px solid #E2E8F0; }
.dns-verify-table td { padding: 8px; border-bottom: 1px solid #F1F5F9; font-family: monospace; color: #334155; }
.dns-badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.dns-verified { background: #ECFDF5; color: #047857; }
.dns-pending { background: #FFF7ED; color: #C2410C; }

/* Form layout settings */
.wl-form-group { display: flex; flex-direction: column; gap: 6px; }
.wl-form-lbl { font-size: 12px; font-weight: 700; color: #334155; }
.wl-form-inp { padding: 9px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #1E293B; }
.wl-form-inp:focus { border-color: #6366F1; }
`;

export default function WhiteLabelSettings() {
  const [tenantName, setTenantName] = useState('Evegah CP Hub');
  const [tagline, setTagline] = useState('Sustainable Commuting Made Simple');
  const [brandColor, setBrandColor] = useState('#2a195c');
  const [textColor, setTextColor] = useState('#ffffff');
  const [btnColor, setBtnColor] = useState('#ffffff');
  const [btnTextColor, setBtnTextColor] = useState('#2a195c');

  const handleSave = () => {
    alert('White-Label branding theme settings saved and rebuilt successfully!');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ev-shell">
        <Sidebar activePath="/franchise/white-label" />
        <div className="ev-main">
          <TopBar />

          <div className="ev-body">
            
            {/* Breadcrumbs */}
            <div className="fr-bc">
              <a href="/">Home</a>
              <span className="fr-bc-sep">&gt;</span>
              <a href="/franchise/list">Franchise</a>
              <span className="fr-bc-sep">&gt;</span>
              <span className="fr-bc-cur">White-Label Settings</span>
            </div>

            <div className="wl-grid">
              
              {/* Left Config Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Visual Identity Theme */}
                <div className="wl-card">
                  <div className="wl-card-hdr">
                    <span className="wl-card-tit">Visual Identity & App Customization</span>
                  </div>
                  <div className="wl-card-body">
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="wl-form-group">
                        <label className="wl-form-lbl">Tenant Storefront Name</label>
                        <input 
                          type="text" 
                          className="wl-form-inp"
                          value={tenantName}
                          onChange={e => setTenantName(e.target.value)}
                        />
                      </div>
                      <div className="wl-form-group">
                        <label className="wl-form-lbl">Rider App Waving Tagline</label>
                        <input 
                          type="text" 
                          className="wl-form-inp"
                          value={tagline}
                          onChange={e => setTagline(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '4px' }}>
                      <div className="wl-form-group">
                        <label className="wl-form-lbl">Brand Color</label>
                        <input 
                          type="color" 
                          className="wl-form-inp" 
                          style={{ padding: 0, height: '36px', cursor: 'pointer', width: '100%' }}
                          value={brandColor}
                          onChange={e => setBrandColor(e.target.value)}
                        />
                      </div>
                      <div className="wl-form-group">
                        <label className="wl-form-lbl">Text Color</label>
                        <input 
                          type="color" 
                          className="wl-form-inp" 
                          style={{ padding: 0, height: '36px', cursor: 'pointer', width: '100%' }}
                          value={textColor}
                          onChange={e => setTextColor(e.target.value)}
                        />
                      </div>
                      <div className="wl-form-group">
                        <label className="wl-form-lbl">Button Background</label>
                        <input 
                          type="color" 
                          className="wl-form-inp" 
                          style={{ padding: 0, height: '36px', cursor: 'pointer', width: '100%' }}
                          value={btnColor}
                          onChange={e => setBtnColor(e.target.value)}
                        />
                      </div>
                      <div className="wl-form-group">
                        <label className="wl-form-lbl">Button Text</label>
                        <input 
                          type="color" 
                          className="wl-form-inp" 
                          style={{ padding: 0, height: '36px', cursor: 'pointer', width: '100%' }}
                          value={btnTextColor}
                          onChange={e => setBtnTextColor(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '6px' }}>
                      <div className="wl-upload-box">
                        <span className="wl-upload-ic">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        </span>
                        <span className="wl-upload-lbl">Upload Main Logo</span>
                        <span className="wl-upload-sub">PNG, SVG (max. 300px width)</span>
                      </div>

                      <div className="wl-upload-box">
                        <span className="wl-upload-ic">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        </span>
                        <span className="wl-upload-lbl">Upload Favicon</span>
                        <span className="wl-upload-sub">ICO, PNG (max. 64x64px size)</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Custom Domains & SSL */}
                <div className="wl-card">
                  <div className="wl-card-hdr">
                    <span className="wl-card-tit">Custom Domain SSL verification</span>
                  </div>
                  <div className="wl-card-body">
                    <div className="wl-form-group">
                      <label className="wl-form-lbl">Assign Custom Domain URL</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" className="wl-form-inp" style={{ flex: 1 }} placeholder="e.g. portal.dwarkamobility.in" />
                        <button className="wl-form-inp" style={{ background: '#EEF2FF', color: '#6366F1', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Verify Records</button>
                      </div>
                    </div>

                    <div style={{ marginTop: '6px' }}>
                      <span className="wl-form-lbl" style={{ display: 'block', marginBottom: '6px' }}>Verify DNS Records on your domain registrar:</span>
                      <table className="dns-verify-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Host / Name</th>
                            <th>Value / Target</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>CNAME</td>
                            <td>portal</td>
                            <td>cname.evegah-saas.com</td>
                            <td><span className="dns-badge dns-verified">Verified</span></td>
                          </tr>
                          <tr>
                            <td>TXT</td>
                            <td>@</td>
                            <td>evegah-verification-hash-328b9</td>
                            <td><span className="dns-badge dns-pending">Pending</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="wl-form-inp" style={{ background: '#2a195c', color: '#fff', fontWeight: '700', padding: '10px 24px', cursor: 'pointer', border: 'none', borderRadius: '8px' }} onClick={handleSave}>
                    Save All Changes
                  </button>
                </div>

              </div>

              {/* Right Simulator Panel */}
              <div className="wl-card">
                <div className="wl-card-hdr">
                  <span className="wl-card-tit">Rider App Splash Preview</span>
                </div>
                <div className="wl-card-body" style={{ alignItems: 'center' }}>
                  
                  {/* Smartphone Mockup */}
                  <div className="mobile-mock">
                    <div className="mobile-notch">
                      <div className="mobile-notch-dot" />
                    </div>
                    
                    <div className="mobile-screen" style={{ background: brandColor }}>
                      <div className="mobile-logo-wrap">
                        {/* Mock logo representation */}
                        <div style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '15px', fontWeight: '800', color: textColor, letterSpacing: '0.04em' }}>
                          {tenantName || 'LOGO'}
                        </div>
                        <p className="mobile-tagline" style={{ color: textColor }}>{tagline}</p>
                      </div>

                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button className="mobile-btn" style={{ background: btnColor, color: btnTextColor }}>
                          Verify Phone Number
                        </button>
                        <span style={{ fontSize: '9px', textAlign: 'center', color: textColor, opacity: 0.7 }}>
                          By signing in you agree to our Terms of Service
                        </span>
                      </div>
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
