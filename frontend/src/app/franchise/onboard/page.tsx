"use client";
import { useState, useRef, useEffect } from 'react';
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

/* Title row */
.on-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
.on-title { font-size: 22px; font-weight: 800; color: #1E293B; margin: 0; }
.on-sub { font-size: 13px; color: #64748B; margin-top: 4px; }
.on-back-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12px; font-weight: 700; color: #2A195C; cursor: pointer; }
.on-back-btn:hover { border-color: #2A195C; }

/* Stepper header */
.on-stepper { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px 30px; display: flex; justify-content: space-between; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.on-step { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; position: relative; z-index: 2; }
.on-stepper::before { content: ''; position: absolute; left: 10%; right: 10%; top: 34px; height: 3px; background: #E2E8F0; z-index: 1; }
.on-stepper-fill { content: ''; position: absolute; left: 10%; top: 34px; height: 3px; background: #6366F1; z-index: 1; transition: width 0.3s; }
.on-step-circle { width: 28px; height: 28px; border-radius: 50%; background: #fff; border: 2.2px solid #E2E8F0; color: #94A3B8; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 800; transition: all 0.2s; }
.on-step.active .on-step-circle { border-color: #6366F1; background: #6366F1; color: #fff; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15); }
.on-step.done .on-step-circle { border-color: #6366F1; background: #fff; color: #6366F1; }
.on-step-lbl { font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.02em; }
.on-step.active .on-step-lbl { color: #0F172A; }
.on-step.done .on-step-lbl { color: #6366F1; }
.on-step-sub { font-size: 9.5px; color: #94A3B8; font-weight: 500; }
.on-step.active .on-step-sub { color: #64748B; }

/* 2 Column Content Layout */
.on-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }
.on-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 20px; }
.on-card-title { font-size: 15px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.on-card-sub { font-size: 12px; color: #64748B; margin: 0; }

/* Form Elements */
.on-form-sec { display: flex; flex-direction: column; gap: 14px; }
.on-sec-title { font-size: 13px; font-weight: 800; color: #1E293B; border-left: 3.5px solid #6366F1; padding-left: 8px; margin-bottom: 2px; }
.on-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.on-form-group { display: flex; flex-direction: column; gap: 6px; }
.on-form-group.full { grid-column: span 2; }
.on-lbl { font-size: 11.5px; font-weight: 700; color: #475569; }
.on-lbl span { color: #EF4444; }
.on-inp { padding: 9px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #1E293B; transition: border-color 0.15s; font-family: inherit; }
.on-inp:focus { border-color: #6366F1; }
.on-inp::placeholder { color: #94A3B8; }
.on-select { cursor: pointer; font-weight: 500; color: #475569; }

/* Right Column Summary Card */
.on-right-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 16px; }
.on-right-title { font-size: 13.5px; font-weight: 800; color: #0F172A; margin: 0; }
.on-right-preview { border-radius: 8px; overflow: hidden; position: relative; height: 160px; background: #1E293B; display: flex; flex-direction: column; justify-content: flex-end; padding: 14px; color: #fff; }
.on-preview-bg { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%); z-index: 2; }
.on-preview-badge { position: absolute; left: 10px; top: 10px; background: #10B981; color: #fff; font-size: 8.5px; font-weight: 800; padding: 2px 8px; border-radius: 12px; text-transform: uppercase; z-index: 3; }
.on-preview-logo { font-size: 16px; font-weight: 800; letter-spacing: 0.05em; z-index: 3; }
.on-preview-loc { font-size: 9px; opacity: 0.8; margin-top: 1px; z-index: 3; }

.on-summary-list { display: flex; flex-direction: column; gap: 10px; }
.on-summary-row { display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; }
.on-summary-ic { width: 18px; height: 18px; color: #64748B; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.on-summary-lbl { color: #64748B; width: 90px; flex-shrink: 0; }
.on-summary-val { color: #0F172A; font-weight: 700; word-break: break-all; }

/* Tip box */
.on-tip-box { background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 10px; padding: 12px 14px; display: flex; gap: 8px; font-size: 11px; color: #6B7280; line-height: 1.45; }
.on-tip-ic { color: #2A195C; font-weight: bold; font-size: 13px; }

/* Inward document checklist items */
.on-doc-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; background: #FAFBFD; transition: all 0.15s; }
.on-doc-row:hover { border-color: #6366F1; }
.on-doc-lbl { font-size: 12px; font-weight: 700; color: #334155; }
.on-doc-status { font-size: 10.5px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
.doc-uploaded { color: #10B981; }
.doc-empty { color: #94A3B8; }
.on-doc-btn { padding: 4.5px 10px; background: #6366F1; color: #fff; border: none; border-radius: 6px; font-size: 10.5px; font-weight: 700; cursor: pointer; }

/* Review section styles */
.rev-box-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #FAFBFD; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; position: relative; }
.rev-box-title { font-size: 12px; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
.rev-box-edit { position: absolute; right: 12px; top: 12px; font-size: 10.5px; font-weight: 700; color: #2A195C; cursor: pointer; background: none; border: none; }
.rev-box-row { display: flex; justify-content: space-between; font-size: 12px; border-bottom: 1px dashed #E2E8F0; padding-bottom: 6px; }
.rev-box-row:last-child { border-bottom: none; padding-bottom: 0; }

.deposit-card { background: #FAF5FF; border: 1px dashed #2A195C; border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
.deposit-circle { width: 34px; height: 34px; border-radius: 50%; background: #E9D5FF; color: #2A195C; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.deposit-val { font-size: 16px; font-weight: 800; color: #0F172A; }

/* Application Summary right block */
.app-sum-card { background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 12px; padding: 18px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.app-sum-circle { width: 38px; height: 38px; border-radius: 50%; background: #D1FAE5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; }

/* Navigation buttons */
.on-nav-row { display: flex; justify-content: space-between; border-top: 1px solid #E2E8F0; padding-top: 18px; margin-top: 10px; }

/* Document Viewer & Signature Styles */
.on-doc-viewer { border: 1.5px solid #E2E8F0; border-radius: 10px; display: flex; flex-direction: column; overflow: hidden; height: 480px; background: #94A3B8; }
.on-doc-viewer-hdr { background: #1E293B; color: #fff; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; }
.on-doc-viewer-controls { display: flex; align-items: center; gap: 10px; }
.on-doc-viewer-body { flex: 1; padding: 24px; overflow-y: auto; display: flex; justify-content: center; background: #64748B; }
.on-doc-page { width: 100%; max-width: 440px; background: #fff; min-height: 600px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); color: #334155; }
.on-doc-page-tit { font-size: 16px; font-weight: 800; color: #0F172A; text-align: center; border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 20px; }
.on-doc-page-body { font-size: 10.5px; line-height: 1.6; }
.on-doc-page-body h4 { font-size: 11px; font-weight: 800; color: #0F172A; margin: 14px 0 6px; }

.sig-card { border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #fff; }
.sig-tabs { display: flex; border-bottom: 1.5px solid #E2E8F0; gap: 14px; }
.sig-tab { font-size: 12px; font-weight: 700; color: #64748B; padding-bottom: 8px; cursor: pointer; border-bottom: 2px solid transparent; background: none; border-top: none; border-left: none; border-right: none; }
.sig-tab.act { color: #6366F1; border-color: #6366F1; }
.sig-pad-canvas { border: 1.5px dashed #CBD5E1; border-radius: 8px; background: #F8FAFC; cursor: crosshair; }

.stamp-box { border: 1.5px dashed #CBD5E1; border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; background: #F8FAFC; }
.stamp-preview-img { width: 52px; height: 52px; border-radius: 50%; border: 2.2px double #2A195C; display: flex; align-items: center; justify-content: center; font-size: 6px; font-weight: 800; text-align: center; color: #2A195C; background: #fff; line-height: 1.2; text-transform: uppercase; font-family: monospace; flex-shrink: 0; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.05); }

/* Agreement checklist */
.chk-item { display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; padding-bottom: 8px; border-bottom: 1px solid #F1F5F9; }
.chk-item:last-child { border-bottom: none; padding-bottom: 0; }
.chk-l { display: flex; align-items: center; gap: 8px; color: #475569; }
.chk-dot { width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; }
.chk-green { background: #ECFDF5; color: #10B981; }
.chk-warn { background: #FFF7ED; color: #F97316; }
.on-nav-btn { display: flex; align-items: center; gap: 6px; padding: 9px 16px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #475569; background: #fff; cursor: pointer; transition: all 0.15s; font-family: inherit; }
.on-nav-btn:hover:not(:disabled) { border-color: #6366F1; color: #6366F1; }
.on-nav-btn-primary { background: #6366F1; color: #fff; border-color: #6366F1; }
.on-nav-btn-primary:hover { background: #2A195C; border-color: #2A195C; color: #fff; }
.on-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

export default function FranchiseOnboardWizard() {
  const [step, setStep] = useState(4); // Default to Step 4 to show the newly updated Agreement & Signature step
  const [formData, setFormData] = useState({
    hubName: 'Gotri E-Vegah Hub',
    code: 'FRN-GOT-0001',
    type: 'Battery Swapping + Rental',
    zone: 'Gotri Zone',
    address: 'Shop No. 12, Gotri Road, Vadodara - 390021',
    landmark: 'Near Gotri Water Tank',
    ownerName: 'Rahul Sharma',
    mobile: '+91 98765 43210',
    email: 'rahul.sharma@evegah.com',
    pan: 'ABCDE1234F',
    aadhaar: '1234 5678 9012',
    dob: '1990-06-15',

    bizType: 'Proprietorship',
    entityName: 'Gotri E-Vegah Hub',
    gstin: '07ABCDE1234F1Z5',
    establishmentYear: '2023',
    employees: '8',
    expectedRev: '12,00,000',
    investment: '8,00,000',
    workingCapital: '4,00,000',
    bankName: 'HDFC Bank',
    accNo: '50200012345678',
    ifsc: 'HDFC0001234',
    openDate: '2024-07-15',
    timings: '10:00 AM - 10:00 PM',
    deliveryService: 'Yes',
    notes: ''
  });

  const [activeSigTab, setActiveSigTab] = useState('draw');
  const [typedSig, setTypedSig] = useState('Rahul Sharma');
  
  // HTML5 signature drawing pad states & refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureAdded, setSignatureAdded] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(true);
  const [infoConfirmed, setInfoConfirmed] = useState(true);
  const [stampUploaded, setStampUploaded] = useState(true);

  useEffect(() => {
    if (step === 4 && activeSigTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [step, activeSigTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setSignatureAdded(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureAdded(false);
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Franchise onboarding application submitted successfully!');
    setStep(1);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ev-shell">
        <Sidebar activePath="/franchise/onboard" />
        <div className="ev-main">
          <TopBar />

          <div className="ev-body">
            
            {/* Breadcrumb */}
            <div className="fr-bc">
              <a href="/">Home</a>
              <span className="fr-bc-sep">&gt;</span>
              <a href="/franchise/list">Franchise</a>
              <span className="fr-bc-sep">&gt;</span>
              <span className="fr-bc-cur">Franchise Onboard</span>
            </div>

            {/* Title Section */}
            <div className="on-header">
              <div>
                <h1 className="on-title">Franchise Onboard</h1>
                <p className="on-sub">Complete the following steps to onboard a new franchise</p>
              </div>
              <a href="/franchise/list" style={{ textDecoration: 'none' }}>
                <button className="on-back-btn">
                  <span>←</span> Back to Franchise List
                </button>
              </a>
            </div>

            {/* Stepper Wizard Header */}
            <div className="on-stepper">
              <div 
                className="on-stepper-fill" 
                style={{ width: `${((step - 1) / 4) * 80}%` }}
              />
              {[
                { n: 1, title: 'Basic Information', sub: 'Franchise & owner details' },
                { n: 2, title: 'Business Details', sub: 'Business & financial info' },
                { n: 3, title: 'Documents', sub: 'Upload required documents' },
                { n: 4, title: 'Agreement & Terms', sub: 'Review & accept terms' },
                { n: 5, title: 'Review & Submit', sub: 'Verify & submit application' }
              ].map(s => (
                <div key={s.n} className={`on-step ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
                  <span className="on-step-circle">{step > s.n ? '✓' : s.n}</span>
                  <span className="on-step-lbl">{s.title}</span>
                  <span className="on-step-sub">{s.sub}</span>
                </div>
              ))}
            </div>

            {/* Multi-step Layout Grid */}
            <div className="on-grid">
              
              {/* Form Column */}
              <div className="on-card" style={step === 4 ? { gridColumn: 'span 1' } : undefined}>
                
                {step === 1 && (
                  <div className="on-form-sec">
                    <h2 className="on-card-title">Basic Information</h2>
                    <p className="on-card-sub" style={{ marginBottom: '14px' }}>Enter the basic details of the franchise and the owner.</p>
                    
                    <span className="on-sec-title">Franchise Details</span>
                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Franchise Hub Name <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.hubName}
                          onChange={e => setFormData({ ...formData, hubName: e.target.value })}
                        />
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">Franchise Code <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.code}
                          onChange={e => setFormData({ ...formData, code: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Franchise Type <span>*</span></label>
                        <select 
                          className="on-inp on-select"
                          value={formData.type}
                          onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                          <option>Battery Swapping + Rental</option>
                          <option>Battery Swapping Only</option>
                          <option>Rental Only</option>
                        </select>
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">Zone <span>*</span></label>
                        <select 
                          className="on-inp on-select"
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
                    </div>

                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Shop / Hub Address <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.address}
                          onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">Landmark (Optional)</label>
                        <input 
                          type="text" 
                          className="on-inp"
                          placeholder="e.g. Near Metro Station"
                          value={formData.landmark}
                          onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                        />
                      </div>
                    </div>

                    <span className="on-sec-title" style={{ marginTop: '10px' }}>Owner Details</span>
                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Franchise Owner Name <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.ownerName}
                          onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                        />
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">Mobile Number <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.mobile}
                          onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Email Address <span>*</span></label>
                        <input 
                          type="email" 
                          className="on-inp"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">PAN Number <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.pan}
                          onChange={e => setFormData({ ...formData, pan: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Aadhaar Number <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.aadhaar}
                          onChange={e => setFormData({ ...formData, aadhaar: e.target.value })}
                        />
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">Date of Birth <span>*</span></label>
                        <input 
                          type="date" 
                          className="on-inp"
                          value={formData.dob}
                          onChange={e => setFormData({ ...formData, dob: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="on-form-sec">
                    <h2 className="on-card-title">Business Details</h2>
                    <p className="on-card-sub" style={{ marginBottom: '14px' }}>Enter the business and financial details of the franchise.</p>
                    
                    <span className="on-sec-title">Business Information</span>
                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Business Type <span>*</span></label>
                        <select 
                          className="on-inp on-select"
                          value={formData.bizType}
                          onChange={e => setFormData({ ...formData, bizType: e.target.value })}
                        >
                          <option>Proprietorship</option>
                          <option>Partnership</option>
                          <option>LLP / Pvt Ltd</option>
                        </select>
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">Entity Name <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.entityName}
                          onChange={e => setFormData({ ...formData, entityName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">GST Number (Optional)</label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.gstin}
                          onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                        />
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">PAN Number <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.pan}
                          onChange={e => setFormData({ ...formData, pan: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Year of Establishment <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.establishmentYear}
                          onChange={e => setFormData({ ...formData, establishmentYear: e.target.value })}
                        />
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">No. of Employees <span>*</span></label>
                        <input 
                          type="number" 
                          className="on-inp"
                          value={formData.employees}
                          onChange={e => setFormData({ ...formData, employees: e.target.value })}
                        />
                      </div>
                    </div>

                    <span className="on-sec-title" style={{ marginTop: '10px' }}>Financial Information</span>
                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Expected Monthly Revenue (₹) <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.expectedRev}
                          onChange={e => setFormData({ ...formData, expectedRev: e.target.value })}
                        />
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">Investment Capacity (₹) <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.investment}
                          onChange={e => setFormData({ ...formData, investment: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Working Capital (₹) <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.workingCapital}
                          onChange={e => setFormData({ ...formData, workingCapital: e.target.value })}
                        />
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">Bank Name <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.bankName}
                          onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Account Number <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.accNo}
                          onChange={e => setFormData({ ...formData, accNo: e.target.value })}
                        />
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">IFSC Code <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.ifsc}
                          onChange={e => setFormData({ ...formData, ifsc: e.target.value })}
                        />
                      </div>
                    </div>

                    <span className="on-sec-title" style={{ marginTop: '10px' }}>Operational Information</span>
                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Preferred Opening Date <span>*</span></label>
                        <input 
                          type="date" 
                          className="on-inp"
                          value={formData.openDate}
                          onChange={e => setFormData({ ...formData, openDate: e.target.value })}
                        />
                      </div>
                      <div className="on-form-group">
                        <label className="on-lbl">Operation Timings <span>*</span></label>
                        <input 
                          type="text" 
                          className="on-inp"
                          value={formData.timings}
                          onChange={e => setFormData({ ...formData, timings: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="on-form-row">
                      <div className="on-form-group">
                        <label className="on-lbl">Delivery Service <span>*</span></label>
                        <div style={{ display: 'flex', gap: '20px', padding: '8px 0' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                            <input 
                              type="radio" 
                              name="deliv" 
                              checked={formData.deliveryService === 'Yes'}
                              onChange={() => setFormData({ ...formData, deliveryService: 'Yes' })}
                            />
                            Yes
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                            <input 
                              type="radio" 
                              name="deliv" 
                              checked={formData.deliveryService === 'No'}
                              onChange={() => setFormData({ ...formData, deliveryService: 'No' })}
                            />
                            No
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="on-form-sec">
                    <h2 className="on-card-title">Upload Documents</h2>
                    <p className="on-card-sub" style={{ marginBottom: '14px' }}>Upload all required franchise setup verification files.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { label: 'PAN Card', status: 'Verified' },
                        { label: 'Aadhaar Card (Front & Back)', status: 'Verified' },
                        { label: 'GST Certificate', status: 'Verified' },
                        { label: 'Shop Establishment License', status: 'Verified' },
                        { label: 'Bank Passbook / Cancelled Cheque', status: 'Verified' },
                        { label: 'Owner Photograph', status: 'Verified' },
                        { label: 'Address Proof', status: 'Verified' }
                      ].map(doc => (
                        <div className="on-doc-row" key={doc.label}>
                          <span className="on-doc-lbl">{doc.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="on-doc-status doc-uploaded">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              {doc.status}
                            </span>
                            <button className="on-doc-btn" style={{ background: '#FAFBFD', color: '#6366F1', border: '1.5px solid #E2E8F0' }}>Re-upload</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                          {step === 4 && (
                  <div className="on-form-sec">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <h2 className="on-card-title">Agreement & Digital Signature</h2>
                        <p className="on-card-sub">Review the franchise agreement carefully and provide your digital signature to proceed.</p>
                      </div>
                      <button 
                        className="on-nav-btn on-nav-btn-primary" 
                        style={{ padding: '8px 14px', fontSize: '11.5px', background: '#6366F1', borderColor: '#6366F1', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => alert('Franchise agreement document download started!')}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download Agreement
                      </button>
                    </div>
                    
                    <div className="on-form-row" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
                      {/* Left: PDF Document Viewer */}
                      <div className="on-doc-viewer">
                        <div className="on-doc-viewer-hdr" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#1E293B', color: '#fff', fontSize: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📄</span>
                            <strong>Franchise Agreement</strong>
                          </div>
                          <div className="on-doc-viewer-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span>1 / 18</span>
                            <span>|</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}>-</button>
                              <span>100%</span>
                              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}>+</button>
                            </div>
                            <span>|</span>
                            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }} title="Page Fit">🗖</button>
                            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }} title="Download" onClick={() => alert('Downloading...')}>📥</button>
                            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }} title="Print" onClick={() => window.print()}>🖨</button>
                          </div>
                        </div>
                        
                        <div className="on-doc-viewer-body" style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#475569', height: '440px' }}>
                          {/* Thumbnails Sidebar */}
                          <div style={{ width: '80px', background: '#334155', display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px 8px', borderRight: '1px solid #1e293b', overflowY: 'auto', alignItems: 'center' }}>
                            <div style={{ width: '56px', height: '74px', background: '#fff', border: '2px solid #6366F1', padding: '4px', cursor: 'pointer', borderRadius: '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ fontSize: '7px', zoom: 0.6, color: '#334155', textAlign: 'center', fontWeight: 'bold' }}>FRANCHISE AGREEMENT</div>
                              <span style={{ fontSize: '8px', color: '#64748B', fontWeight: 'bold', marginTop: 'auto' }}>1</span>
                            </div>
                            <div style={{ width: '56px', height: '74px', background: '#fff', border: '1px solid #94A3B8', padding: '4px', cursor: 'pointer', borderRadius: '3px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                              <div style={{ fontSize: '7px', zoom: 0.6, color: '#334155', textAlign: 'center' }}>TERMS & CONDITIONS</div>
                              <span style={{ fontSize: '8px', color: '#64748B', fontWeight: 'bold', marginTop: 'auto' }}>2</span>
                            </div>
                          </div>

                          {/* Main Scrollable Document */}
                          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                            <div className="on-doc-page" style={{ width: '100%', maxWidth: '440px', background: '#fff', padding: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', color: '#334155', minHeight: '560px' }}>
                              <div className="on-doc-page-tit" style={{ fontSize: '14px', fontWeight: '800', borderBottom: '2px solid #0F172A', paddingBottom: '8px', marginBottom: '14px', textAlign: 'center' }}>FRANCHISE AGREEMENT</div>
                              <div className="on-doc-page-body" style={{ fontSize: '10px', lineHeight: '1.5' }}>
                                <p>This Franchise Agreement (&quot;Agreement&quot;) is made and entered into on this <strong>15th day of July, 2024</strong>, by and between:</p>
                                <p><strong>Evegah Mobility Private Limited</strong>, a company incorporated under the laws of India, having its registered office at Gotri Road, Vadodara, Gujarat (hereinafter referred to as &quot;Company&quot;)</p>
                                <p>AND</p>
                                <p><strong>Rahul Sharma</strong>, residing at Shop No. 12, Gotri Road, Vadodara - 390021 (hereinafter referred to as &quot;Franchisee&quot;)</p>
                                <h4 style={{ fontSize: '10.5px', fontWeight: '800', marginTop: '10px', marginBottom: '4px' }}>WHEREAS:</h4>
                                <p>The Company is engaged in the business of battery swapping, EV mobility, and related services under the brand &quot;Evegah&quot;; and the Franchisee desires to associate with the Company for operating a battery swapping station under the brand &quot;Evegah&quot;.</p>
                                <p>Now, therefore, in consideration of the mutual covenants contained herein, the parties agree to perform the duties and obligations described in the agreement.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Signature inputs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        
                        <div className="sig-card">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>Digital Signature</span>
                            <span style={{ fontSize: '10px', color: '#64748B' }}>Sign below to accept the agreement</span>
                          </div>
                          
                          <div className="sig-tabs" style={{ marginTop: '4px' }}>
                            <button className={`sig-tab ${activeSigTab === 'draw' ? 'act' : ''}`} onClick={() => setActiveSigTab('draw')}>Draw Signature</button>
                            <button className={`sig-tab ${activeSigTab === 'type' ? 'act' : ''}`} onClick={() => setActiveSigTab('type')}>Type Signature</button>
                            <button className={`sig-tab ${activeSigTab === 'upload' ? 'act' : ''}`} onClick={() => setActiveSigTab('upload')}>Upload Signature</button>
                          </div>

                          {activeSigTab === 'draw' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <canvas 
                                ref={canvasRef} 
                                className="sig-pad-canvas" 
                                width="220" 
                                height="110"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                style={{ width: '100%', height: '110px' }}
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={clearCanvas} style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  🗑 Clear
                                </button>
                              </div>
                            </div>
                          ) : activeSigTab === 'type' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input 
                                type="text" 
                                className="on-inp" 
                                value={typedSig} 
                                onChange={e => { setTypedSig(e.target.value); setSignatureAdded(true); }}
                                style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontStyle: 'italic', textAlign: 'center', background: '#F8FAFC', padding: '16px 12px' }}
                              />
                            </div>
                          ) : (
                            <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: '8px', padding: '20px', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer' }} onClick={() => setSignatureAdded(true)}>
                              <span style={{ fontSize: '20px' }}>📤</span>
                              <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#2A195C', marginTop: '6px' }}>Upload Signature Image</div>
                              <div style={{ fontSize: '9px', color: '#94A3B8', marginTop: '2px' }}>PNG, JPG, JPEG (Max. 2MB)</div>
                            </div>
                          )}

                          <div className="on-form-group">
                            <label className="on-lbl">Full Name <span>*</span></label>
                            <input type="text" className="on-inp" defaultValue="Rahul Sharma" />
                          </div>

                          <div className="on-form-row">
                            <div className="on-form-group" style={{ gridColumn: 'span 2' }}>
                              <label className="on-lbl">Signing Date <span>*</span></label>
                              <input type="text" className="on-inp" defaultValue="15 / 07 / 2024" disabled />
                            </div>
                          </div>
                        </div>

                        {/* Stamp upload */}
                        <div className="sig-card">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>Company Stamp (If applicable)</span>
                            <span style={{ fontSize: '10px', color: '#64748B' }}>Upload your company stamp</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                            {stampUploaded ? (
                              <>
                                <div style={{ flex: 1, border: '1.5px dashed #A7F3D0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ECFDF5', textAlign: 'center' }}>
                                  <span style={{ fontSize: '14px', color: '#059669', fontWeight: 'bold' }}>✓ Uploaded</span>
                                  <span style={{ fontSize: '8.5px', color: '#64748B', marginTop: '4px' }}>PNG, JPG (Max. 2MB)</span>
                                </div>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                  <div className="stamp-preview-img" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2.5px double #2A195C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6px', fontWeight: '800', textAlign: 'center', color: '#2A195C', background: '#fff', lineHeight: '1.2', textTransform: 'uppercase', fontFamily: 'monospace', padding: '4px' }}>
                                    C.P. E-VEGAH<br/>HUB<br/>NEW DELHI
                                  </div>
                                  <button 
                                    style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: '#EF4444', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', cursor: 'pointer', fontWeight: 'bold' }} 
                                    onClick={() => setStampUploaded(false)}
                                    title="Remove Stamp"
                                  >
                                    ×
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div 
                                style={{ flex: 1, border: '1.5px dashed #CBD5E1', borderRadius: '8px', padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', cursor: 'pointer', textAlign: 'center' }}
                                onClick={() => setStampUploaded(true)}
                              >
                                <span style={{ fontSize: '16px' }}>📤</span>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2A195C', marginTop: '4px' }}>Upload Stamp</span>
                                <span style={{ fontSize: '8.5px', color: '#94A3B8', marginTop: '2px' }}>PNG, JPG, JPEG (Max. 2MB)</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="on-form-group" style={{ marginTop: '14px' }}>
                      <label className="on-lbl">Terms & Conditions Acceptance</label>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11.5px', fontWeight: '600', color: '#475569', cursor: 'pointer', marginTop: '6px' }}>
                        <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ marginTop: '2px' }} />
                        <span>I have read, understood and <strong>agree</strong> to all the terms and conditions of this Franchise Agreement. <a href="#" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 'bold' }}>View Terms ↗</a></span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11.5px', fontWeight: '600', color: '#475569', cursor: 'pointer', marginTop: '8px' }}>
                        <input type="checkbox" checked={infoConfirmed} onChange={e => setInfoConfirmed(e.target.checked)} style={{ marginTop: '2px' }} />
                        <span>I confirm that the <strong>information provided above is true and correct</strong> to the best of my knowledge.</span>
                      </label>
                      <p style={{ fontSize: '10px', color: '#64748B', margin: '8px 0 0 20px', lineHeight: '1.4' }}>By proceeding, you agree that this digital signature is legally binding and equivalent to a physical signature.</p>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="on-form-sec">
                    <h2 className="on-card-title">Review & Confirm Details</h2>
                    <p className="on-card-sub" style={{ marginBottom: '14px' }}>Please review all details before submitting the franchise application.</p>
                    
                    <div className="rev-box-grid">
                      <button className="rev-box-edit" onClick={() => setStep(1)}>Edit</button>
                      <div style={{ gridColumn: 'span 2' }}>
                        <span className="rev-box-title" style={{ display: 'block', marginBottom: '8px' }}>Franchise & Owner Details</span>
                      </div>
                      <div className="rev-box-row" style={{ gridColumn: 'span 2' }}>
                        <span className="review-lbl">Franchise Name</span>
                        <span className="review-val" style={{ fontWeight: 'bold' }}>{formData.hubName}</span>
                      </div>
                      <div className="rev-box-row">
                        <span className="review-lbl">Owner Name</span>
                        <span className="review-val">{formData.ownerName}</span>
                      </div>
                      <div className="rev-box-row">
                        <span className="review-lbl">Mobile Number</span>
                        <span className="review-val">{formData.mobile}</span>
                      </div>
                      <div className="rev-box-row" style={{ gridColumn: 'span 2' }}>
                        <span className="review-lbl">Email Address</span>
                        <span className="review-val">{formData.email}</span>
                      </div>
                      <div className="rev-box-row">
                        <span className="review-lbl">PAN Number</span>
                        <span className="review-val">{formData.pan}</span>
                      </div>
                      <div className="rev-box-row">
                        <span className="review-lbl">Aadhaar Number</span>
                        <span className="review-val">{formData.aadhaar}</span>
                      </div>
                    </div>

                    <div className="rev-box-grid">
                      <button className="rev-box-edit" onClick={() => setStep(2)}>Edit</button>
                      <div style={{ gridColumn: 'span 2' }}>
                        <span className="rev-box-title" style={{ display: 'block', marginBottom: '8px' }}>Business & Financial Details</span>
                      </div>
                      <div className="rev-box-row">
                        <span className="review-lbl">Business Type</span>
                        <span className="review-val">{formData.bizType}</span>
                      </div>
                      <div className="rev-box-row">
                        <span className="review-lbl">GST Number</span>
                        <span className="review-val">{formData.gstin}</span>
                      </div>
                      <div className="rev-box-row">
                        <span className="review-lbl">Expected Monthly Rev</span>
                        <span className="review-val">₹{formData.expectedRev}</span>
                      </div>
                      <div className="rev-box-row">
                        <span className="review-lbl">Investment Capacity</span>
                        <span className="review-val">₹{formData.investment}</span>
                      </div>
                    </div>

                    <span className="on-sec-title">Franchise Fee & Deposit Summary</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="deposit-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="deposit-circle">₹</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>Registration Fee</span>
                            <span style={{ fontSize: '10px', color: '#64748B' }}>One-time (Non-refundable)</span>
                          </div>
                        </div>
                        <span className="deposit-val">₹ 10,000</span>
                      </div>

                      <div className="deposit-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="deposit-circle">₹</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>Security Deposit</span>
                            <span style={{ fontSize: '10px', color: '#64748B' }}>Refundable</span>
                          </div>
                        </div>
                        <span className="deposit-val">₹ 50,000</span>
                      </div>

                      <div className="deposit-card" style={{ background: '#EEF2FF', borderColor: '#6366F1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="deposit-circle" style={{ background: '#6366F1', color: '#fff' }}>₹</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A' }}>Total Payable</span>
                            <span style={{ fontSize: '10px', color: '#64748B' }}>Inclusive of all applicable taxes</span>
                          </div>
                        </div>
                        <span className="deposit-val" style={{ color: '#6366F1' }}>₹ 60,000</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer buttons controls */}
                <div className="on-nav-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '18px', marginTop: '10px' }}>
                  <button 
                    className="on-nav-btn" 
                    onClick={handleBack} 
                    disabled={step === 1}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    ← Previous
                  </button>
                  
                  <button 
                    className="on-nav-btn" 
                    onClick={() => alert('Application draft saved successfully!')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    💾 Save Draft
                  </button>

                  {step < 5 ? (
                    <button className="on-nav-btn on-nav-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleNext}>
                      Save & Continue →
                    </button>
                  ) : (
                    <button className="on-nav-btn on-nav-btn-primary" style={{ background: '#2a195c', borderColor: '#2a195c', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleSubmit}>
                      Submit Application ✓
                    </button>
                  )}
                </div>

              </div>

              {/* Sidebar Summary Info Column */}
              <div>
                {step === 5 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="app-sum-card">
                      <span className="app-sum-circle">✓</span>
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#065F46' }}>All Good!</span>
                      <p style={{ fontSize: '11px', color: '#047857', margin: 0 }}>All information looks accurate. You are ready to submit.</p>
                    </div>

                    <div className="on-right-card">
                      <span className="on-right-title">What happens next?</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#EEF2FF', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', flexShrink: 0 }}>1</span>
                          <div>
                            <strong style={{ display: 'block', color: '#0F172A', marginBottom: '2px' }}>Application Review</strong>
                            Our team will review your application within 2-3 working days.
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#EEF2FF', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', flexShrink: 0 }}>2</span>
                          <div>
                            <strong style={{ display: 'block', color: '#0F172A', marginBottom: '2px' }}>Verification Call</strong>
                            You will receive a call for location verification.
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#EEF2FF', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', flexShrink: 0 }}>3</span>
                          <div>
                            <strong style={{ display: 'block', color: '#0F172A', marginBottom: '2px' }}>Approval & Activation</strong>
                            Once approved, your franchise will be activated and you can start operations.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="on-right-card">
                      <span className="on-right-title">Declaration</span>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: '#475569', cursor: 'pointer', marginTop: '6px' }}>
                        <input type="checkbox" defaultChecked style={{ marginTop: '2px' }} />
                        <span>I hereby declare that all the information provided above is true, correct and complete to the best of my knowledge. I understand that any fraudulent information may lead to rejection of this application.</span>
                      </label>
                    </div>
                  </div>
                ) : step === 4 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <div className="on-right-card">
                      <span className="on-right-title">Franchise Summary</span>
                      <div className="on-right-preview" style={{ padding: 0, height: 'auto', background: '#fff', border: '1px solid #E2E8F0', color: '#334155', display: 'block' }}>
                        <div style={{ height: '100px', background: 'linear-gradient(135deg, #2a195c 0%, #6366F1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', position: 'relative' }}>
                          <strong style={{ fontSize: '16px', letterSpacing: '0.04em' }}>Evegah</strong>
                          <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#8B5CF6', color: '#fff', fontSize: '9px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Active</span>
                        </div>
                        <div style={{ padding: '14px', fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B' }}>Franchise Name:</span>
                            <strong style={{ color: '#0F172A' }}>{formData.hubName}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B' }}>Zone:</span>
                            <strong style={{ color: '#0F172A' }}>{formData.zone}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B' }}>Owner:</span>
                            <strong style={{ color: '#0F172A' }}>{formData.ownerName}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B' }}>Mobile:</span>
                            <strong style={{ color: '#0F172A' }}>{formData.mobile}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B' }}>Email:</span>
                            <strong style={{ color: '#0F172A', fontSize: '10.5px' }}>{formData.email}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '8px', marginTop: '4px' }}>
                            <span style={{ color: '#64748B' }}>Onboarding Status:</span>
                            <span style={{ background: '#F5F3FF', color: '#8B5CF6', fontSize: '9.5px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px' }}>Agreement Pending</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="on-right-card">
                      <span className="on-right-title">Agreement Checklist</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                        
                        <div className="chk-item">
                          <div className="chk-l">
                            <span className="chk-dot chk-green">✓</span>
                            <span>Franchise Agreement Viewed</span>
                          </div>
                        </div>

                        <div className="chk-item">
                          <div className="chk-l">
                            <span className={`chk-dot ${termsAccepted ? 'chk-green' : 'chk-warn'}`}>{termsAccepted ? '✓' : '!'}</span>
                            <span>Terms & Conditions Accepted</span>
                          </div>
                        </div>

                        <div className="chk-item">
                          <div className="chk-l">
                            <span className={`chk-dot ${signatureAdded ? 'chk-green' : 'chk-warn'}`}>{signatureAdded ? '✓' : '!'}</span>
                            <span>Digital Signature Added</span>
                          </div>
                        </div>

                        <div className="chk-item">
                          <div className="chk-l">
                            <span className={`chk-dot ${stampUploaded ? 'chk-green' : 'chk-warn'}`}>{stampUploaded ? '✓' : '!'}</span>
                            <span>Company Stamp (Optional)</span>
                          </div>
                        </div>

                        <div className="chk-item">
                          <div className="chk-l">
                            <span className={`chk-dot ${(termsAccepted && signatureAdded) ? 'chk-green' : 'chk-warn'}`}>{(termsAccepted && signatureAdded) ? '✓' : '!'}</span>
                            <span>Ready for Final Review</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="on-right-card" style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'flex-start', background: '#FAF5FF', borderColor: '#E9D5FF' }}>
                      <span style={{ fontSize: '18px' }}>📞</span>
                      <div style={{ fontSize: '11px', color: '#6B7280', lineHeight: '1.4' }}>
                        <strong style={{ display: 'block', color: '#2A195C', marginBottom: '2px' }}>Need Help?</strong>
                        Our support team is here to help you 24/7.
                        <button style={{ marginTop: '8px', display: 'block', padding: '6px 12px', background: '#2A195C', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => alert('Calling support...')}>Contact Support</button>
                      </div>
                    </div>

                    <div className="on-tip-box" style={{ background: '#ECFDF5', borderColor: '#A7F3D0', color: '#047857' }}>
                      <span className="on-tip-ic" style={{ color: '#10B981' }}>🛡</span>
                      <div>
                        <strong style={{ display: 'block', color: '#059669', marginBottom: '2px' }}>Security & Compliance</strong>
                        Your data is secure and encrypted. We follow industry best practices.
                        <span style={{ display: 'inline-block', background: '#D1FAE5', color: '#065F46', fontSize: '9px', fontWeight: 'bold', padding: '1px 6px', borderRadius: '4px', marginTop: '6px' }}>256-bit SSL Encrypted</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="on-right-card">
                      <span className="on-right-title">Franchise Summary</span>
                      <div className="on-right-preview">
                        <div className="on-preview-bg" />
                        <span className="on-preview-badge">Active</span>
                        <div className="on-preview-logo">{formData.hubName}</div>
                        <div className="on-preview-loc">{formData.address}</div>
                      </div>

                      <div className="on-summary-list">
                        <div className="on-summary-row">
                          <span className="on-summary-lbl">Franchise Hub</span>
                          <span className="on-summary-val">{formData.hubName}</span>
                        </div>
                        <div className="on-summary-row">
                          <span className="on-summary-lbl">Franchise Type</span>
                          <span className="on-summary-val">{formData.type}</span>
                        </div>
                        <div className="on-summary-row">
                          <span className="on-summary-lbl">Zone</span>
                          <span className="on-summary-val">{formData.zone}</span>
                        </div>
                        <div className="on-summary-row">
                          <span className="on-summary-lbl">Franchise Owner</span>
                          <span className="on-summary-val">{formData.ownerName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="on-tip-box">
                      <span className="on-tip-ic">ⓘ</span>
                      <div>
                        <strong style={{ display: 'block', color: '#2A195C', marginBottom: '2px' }}>Next Steps</strong>
                        After saving basic information, you will be able to add business details and upload documents.
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}
