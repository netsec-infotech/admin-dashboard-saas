"use client";
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Link from 'next/link';
import { api } from '@/lib/api';

// Helper component for SearchParams inside a Suspense boundary
function PricingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [dbZones, setDbZones] = useState<any[]>([]);

  useEffect(() => {
    api.get('/zones')
      .then(res => {
        if (res && res.data) {
          setDbZones(res.data);
          if (editId) {
            const zone = res.data.find((z: any) => String(z.id) === String(editId));
            if (zone) {
              setSelectedZoneName(zone.name);
              setStatus(zone.status === 'active' ? 'Active' : 'Inactive');
              if (zone.pricing && zone.pricing.pricingModel) {
                setPricingModel(zone.pricing.pricingModel);
                setNotes(zone.pricing.notes || '');
                if (zone.pricing.pricingModel === 'Hourly Based') {
                  setHourlyRows(zone.pricing.hourlyPricing || []);
                } else if (zone.pricing.pricingModel === 'Minute Based') {
                  setMinuteRate(String(zone.pricing.ratePerMinute || zone.pricing.basePrice || '1.50'));
                  setMinuteMinTime(String(zone.pricing.minMinutes || '10'));
                  setMinuteUnlockFee(String(zone.pricing.unlockFee || '10.00'));
                  setMinuteGracePeriod(String(zone.pricing.gracePeriod || '3'));
                  setMinuteDeposit(String(zone.pricing.deposit || '200'));
                } else {
                  setPackages(zone.pricing.packages || []);
                }
              }
            }
          } else if (res.data.length > 0) {
            setSelectedZoneName(res.data[0].name);
          }
        }
      })
      .catch(err => console.error(err));
  }, [editId]);

  const ZONES_LIST = useMemo(() => {
    return dbZones.map(z => ({
      id: String(z.id),
      name: z.name,
      city: z.city || 'N/A'
    }));
  }, [dbZones]);

  const VEHICLE_MODELS = useMemo(() => [
    { name: 'Evegah MINK', image: '/assets/mink.png' },
    { name: 'Evegah CITY', image: '/assets/city.png' },
    { name: 'Evegah Fly', image: '/Fly.png' },
    { name: 'Evegah Pro', image: '/Evegah Pro.png' }
  ], []);

  // Core Page States
  const [selectedZoneName, setSelectedZoneName] = useState('');
  const [status, setStatus] = useState('Active');
  const [pricingModel, setPricingModel] = useState<'Hourly Based' | 'Package Based' | 'Minute Based'>('Hourly Based');
  const [notes, setNotes] = useState('');

  // Minute-Based Pricing States
  const [minuteRate, setMinuteRate] = useState('1.50');
  const [minuteMinTime, setMinuteMinTime] = useState('10');
  const [minuteUnlockFee, setMinuteUnlockFee] = useState('10.00');
  const [minuteGracePeriod, setMinuteGracePeriod] = useState('3');
  const [minuteDeposit, setMinuteDeposit] = useState('200');

  // Minute-based model rows state
  const [minuteRows, setMinuteRows] = useState<any[]>([
    { id: 1, model: 'Evegah CITY', ratePerMinute: '1.50', unlockFee: '10.00', minMinutes: '10', gracePeriod: '3', deposit: '200', status: true, imgSrc: '/assets/city.png' },
    { id: 2, model: 'Evegah MINK', ratePerMinute: '1.20', unlockFee: '8.00', minMinutes: '10', gracePeriod: '3', deposit: '150', status: true, imgSrc: '/assets/mink.png' },
    { id: 3, model: 'Evegah Fly', ratePerMinute: '1.00', unlockFee: '5.00', minMinutes: '5', gracePeriod: '2', deposit: '100', status: true, imgSrc: '/Fly.png' },
    { id: 4, model: 'Evegah Pro', ratePerMinute: '2.00', unlockFee: '15.00', minMinutes: '15', gracePeriod: '5', deposit: '300', status: true, imgSrc: '/Evegah Pro.png' }
  ]);
  const [isAddingMinute, setIsAddingMinute] = useState(false);
  const [newMinuteModel, setNewMinuteModel] = useState('Evegah CITY');

  // Hourly Pricing Rows State
  const [hourlyRows, setHourlyRows] = useState<any[]>([]);

  // Package Pricing State
  const [packages, setPackages] = useState<any[]>([]);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgDuration, setNewPkgDuration] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('');
  const [newPkgModel, setNewPkgModel] = useState('Evegah MINK');
  const [pkgType, setPkgType] = useState('Daily');

  // Hourly inline form states
  const [isAddingHourly, setIsAddingHourly] = useState(false);
  const [newHourlyModel, setNewHourlyModel] = useState('Evegah MINK');
  const [newHourlyBasePrice, setNewHourlyBasePrice] = useState('');
  const [newHourlyExtraPrice, setNewHourlyExtraPrice] = useState('');
  const [newHourlyGracePeriod, setNewHourlyGracePeriod] = useState('0');
  const [newHourlyRoundingRule, setNewRoundingRule] = useState('Per 15 Minutes');
  const [newHourlyDeposit, setNewHourlyDeposit] = useState('');

  // Package inline form states
  const [newPkgDeposit, setNewPkgDeposit] = useState('');

  const handleAddHourlyRow = () => {
    if (!newHourlyBasePrice || !newHourlyExtraPrice) {
      alert('Please fill out all required fields for the hourly rate.');
      return;
    }
    const matched = VEHICLE_MODELS.find(m => m.name === newHourlyModel);
    const newRow = {
      id: Date.now(),
      model: newHourlyModel,
      basePrice: newHourlyBasePrice,
      extraPrice: newHourlyExtraPrice,
      gracePeriod: newHourlyGracePeriod || '0',
      roundingRule: newHourlyRoundingRule,
      deposit: newHourlyDeposit || '0',
      status: true,
      imgSrc: matched ? matched.image : '/assets/city.png'
    };
    setHourlyRows(prev => [...prev, newRow]);
    setNewHourlyBasePrice('');
    setNewHourlyExtraPrice('');
    setNewHourlyGracePeriod('0');
    setNewHourlyDeposit('');
    setIsAddingHourly(false);
  };

  // Find corresponding city
  const selectedCity = useMemo(() => {
    const zone = ZONES_LIST.find(z => z.name === selectedZoneName);
    return zone ? zone.city : '';
  }, [selectedZoneName, ZONES_LIST]);



  // Handler for saving configuration
  const handleSave = async () => {
    const zone = dbZones.find(z => z.name === selectedZoneName);
    if (!zone) {
      alert("Selected zone not found in database.");
      return;
    }

    const pricingObj: any = {
      pricingModel,
      notes
    };

    if (pricingModel === 'Hourly Based') {
      pricingObj.basePrice = parseFloat(hourlyRows[0]?.basePrice) || 0;
      pricingObj.extraPrice = parseFloat(hourlyRows[0]?.extraPrice) || 0;
      pricingObj.packageDetails = [];
      pricingObj.hourlyPricing = hourlyRows;
      pricingObj.packages = [];
    } else if (pricingModel === 'Minute Based') {
      pricingObj.basePrice = parseFloat(minuteRate) || 1.5;
      pricingObj.extraPrice = parseFloat(minuteUnlockFee) || 10;
      pricingObj.ratePerMinute = parseFloat(minuteRate) || 1.5;
      pricingObj.unlockFee = parseFloat(minuteUnlockFee) || 10;
      pricingObj.minMinutes = parseInt(minuteMinTime) || 10;
      pricingObj.gracePeriod = parseInt(minuteGracePeriod) || 3;
      pricingObj.deposit = parseFloat(minuteDeposit) || 200;
      pricingObj.packageDetails = [`₹${minuteRate}/min (Min ${minuteMinTime}m, Unlock: ₹${minuteUnlockFee})`];
      pricingObj.hourlyPricing = [];
      pricingObj.packages = [];
    } else {
      pricingObj.basePrice = null;
      pricingObj.extraPrice = null;
      pricingObj.packageDetails = packages.map(p => `${p.model}: ${p.duration} Days - ₹${p.price}${p.deposit ? ` (Deposit: ₹${p.deposit})` : ''}`);
      pricingObj.hourlyPricing = [];
      pricingObj.packages = packages;
    }

    const payload = {
      ...zone,
      status: status.toLowerCase(),
      pricing: pricingObj
    };

    try {
      const res = await api.put(`/zones/${zone.id}`, payload);
      if (res && res.status === 'success') {
        alert('Zone pricing configured successfully!');
        router.push('/zones/pricing');
      } else {
        alert('Failed to configure pricing: ' + (res.message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to save pricing configuration: ' + (err.message || err));
    }
  };

  // Hourly Rows updates
  const handleHourlyRowChange = (id: number, field: string, value: any) => {
    setHourlyRows(prev => prev.map(row => {
      if (row.id === id) {
        if (field === 'model') {
          const matched = VEHICLE_MODELS.find(m => m.name === value);
          return { ...row, model: value, imgSrc: matched ? matched.image : '/assets/city.png' };
        }
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleHourlyDelete = (id: number) => {
    setHourlyRows(prev => prev.filter(row => row.id !== id));
  };

  // Package Management
  const handleAddPackage = () => {
    let nameToUse = newPkgName;
    let durationToUse = newPkgDuration;
    if (pkgType === 'Daily') {
      nameToUse = 'Daily';
      durationToUse = '1';
    } else if (pkgType === 'Weekly') {
      nameToUse = 'Weekly';
      durationToUse = '7';
    } else if (pkgType === 'Monthly') {
      nameToUse = 'Monthly';
      durationToUse = '30';
    }

    if (!nameToUse || !durationToUse || !newPkgPrice) {
      alert('Please fill out all fields for the package.');
      return;
    }
    const newPkg = {
      id: Date.now(),
      model: newPkgModel || hourlyRows[0]?.model || 'All Models',
      name: nameToUse,
      duration: parseInt(durationToUse),
      price: parseFloat(newPkgPrice),
      deposit: parseFloat(newPkgDeposit) || 0
    };
    setPackages(prev => [...prev, newPkg]);
    setNewPkgName('Daily');
    setNewPkgDuration('1');
    setPkgType('Daily');
    setNewPkgPrice('');
    setNewPkgDeposit('');
    setIsAddingPackage(false);
  };

  const handlePackageDelete = (id: number) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const handlePackageChange = (id: number, field: string, value: any) => {
    setPackages(prev => prev.map(pkg => {
      if (pkg.id === id) {
        return { ...pkg, [field]: value };
      }
      return pkg;
    }));
  };

  const handlePackageMultiChange = (id: number, updates: Record<string, any>) => {
    setPackages(prev => prev.map(pkg => {
      if (pkg.id === id) {
        return { ...pkg, ...updates };
      }
      return pkg;
    }));
  };

  const handleAddMinuteRow = () => {
    if (!minuteRate) {
      alert('Please enter a Rate Per Minute.');
      return;
    }
    const modelObj = VEHICLE_MODELS.find(m => m.name === newMinuteModel) || VEHICLE_MODELS[0];
    const newRow = {
      id: Date.now(),
      model: newMinuteModel,
      ratePerMinute: minuteRate || '1.50',
      unlockFee: minuteUnlockFee || '10.00',
      minMinutes: minuteMinTime || '10',
      gracePeriod: minuteGracePeriod || '3',
      deposit: minuteDeposit || '200',
      status: true,
      imgSrc: modelObj.image
    };
    setMinuteRows(prev => [...prev.filter(r => r.model !== newMinuteModel), newRow]);
    setIsAddingMinute(false);
  };

  const handleMinuteDelete = (id: number) => {
    setMinuteRows(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="zp-page">
      {/* Breadcrumb back */}
      <div className="zp-bc">
        <Link href="/zones/pricing" className="zp-bc-back">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Zone Pricing
        </Link>
      </div>

      {/* Header */}
      <div className="zp-title-row">
        <div>
          <h1 className="zp-h1">{editId ? `Edit Zone Pricing: ${selectedZoneName || 'Zone'}` : 'Add Zone Pricing'}</h1>
          <p className="zp-sub">{editId ? 'Modify rates, duration, and deposits for existing packages in this zone.' : 'Configure pricing model and rates for the selected zone.'}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="zp-btn-secondary"
            onClick={() => router.push('/zones/pricing')}
          >
            Cancel
          </button>
          <button 
            className="zp-btn-primary" 
            style={{ padding: '10px 22px' }}
            onClick={handleSave}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span>{editId ? 'Save & Update Pricing' : 'Save Pricing'}</span>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="zp-form-layout">
        
        {/* Row 1: Zone Info & Pricing Model Selection */}
        <div className="zp-info-grid">
          {/* Card 1: Zone Information */}
          <div className="zp-card">
            <h2 className="zp-card-title">Zone Information</h2>
            <div className="zp-card-body">
              <div className="zp-form-row">
                <div className="zp-form-group">
                  <label className="zp-form-label">Zone Name</label>
                  <select 
                    className="zp-form-select"
                    value={selectedZoneName}
                    onChange={(e) => setSelectedZoneName(e.target.value)}
                    disabled={!!editId}
                  >
                    {ZONES_LIST.map((zone, idx) => (
                      <option key={idx} value={zone.name}>{zone.name}</option>
                    ))}
                  </select>
                </div>
                <div className="zp-form-group">
                  <label className="zp-form-label">City</label>
                  <input 
                    type="text" 
                    className="zp-form-input" 
                    value={selectedCity}
                    disabled
                  />
                </div>
              </div>

              <div className="zp-form-group" style={{ marginTop: '16px' }}>
                <label className="zp-form-label">Status</label>
                <select 
                  className="zp-form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Pricing Model */}
          <div className="zp-card">
            <h2 className="zp-card-title">Pricing Model</h2>
            <div className="zp-card-body">
              <p className="zp-card-subtitle">Choose how you want to price this zone.</p>
              
              <div className="zp-radio-cards-grid">
                {/* Radio Card 1: Hourly Based */}
                <div 
                  className={`zp-radio-card ${pricingModel === 'Hourly Based' ? 'active' : ''}`}
                  onClick={() => setPricingModel('Hourly Based')}
                >
                  <div className="zp-radio-header">
                    <span className="zp-radio-circle"></span>
                    <span className="zp-radio-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="zp-radio-title">Hourly Based</h3>
                  <p className="zp-radio-desc">Customers will be charged based on hourly usage with extra time charges.</p>
                </div>

                {/* Radio Card 2: Minute Based */}
                <div 
                  className={`zp-radio-card ${pricingModel === 'Minute Based' ? 'active' : ''}`}
                  onClick={() => setPricingModel('Minute Based')}
                >
                  <div className="zp-radio-header">
                    <span className="zp-radio-circle"></span>
                    <span className="zp-radio-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 15 15" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="zp-radio-title">Minute Based</h3>
                  <p className="zp-radio-desc">Customers pay per minute with optional base unlock fare and minimum time.</p>
                </div>

                {/* Radio Card 3: Package Based */}
                <div 
                  className={`zp-radio-card ${pricingModel === 'Package Based' ? 'active' : ''}`}
                  onClick={() => setPricingModel('Package Based')}
                >
                  <div className="zp-radio-header">
                    <span className="zp-radio-circle"></span>
                    <span className="zp-radio-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="zp-radio-title">Package Based</h3>
                  <p className="zp-radio-desc">Customers will be charged based on selected rental packages.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Dynamic Pricing Card depending on Selected Model */}
        {pricingModel === 'Hourly Based' ? (
          /* Card 3: Hourly Pricing Card */
          <div className="zp-card" style={{ marginTop: '24px' }}>
            <div className="zp-card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="zp-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Hourly Pricing (For Selected Models)</h2>
                <span className="zp-badge zp-badge-hourly">Selected</span>
              </div>
              <button 
                className="zp-btn-add-pkg"
                onClick={() => setIsAddingHourly(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Hourly Rate
              </button>
            </div>
            
            <div className="zp-card-body" style={{ marginTop: '16px' }}>
              <p className="zp-card-subtitle" style={{ marginTop: 0, marginBottom: '16px' }}>Set dynamic pricing for each model</p>
              
              {isAddingHourly && (
                <div className="zp-pkg-form-box">
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: '#1E293B', fontWeight: 700 }}>New Hourly Rate Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1.2fr auto', gap: '12px', alignItems: 'end' }}>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Model</label>
                      <select 
                        className="zp-form-select"
                        value={newHourlyModel}
                        onChange={(e) => setNewHourlyModel(e.target.value)}
                      >
                        {VEHICLE_MODELS.map((vm, idx) => (
                          <option key={idx} value={vm.name}>{vm.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Base Price (Per Hour)</label>
                      <input 
                        type="number" 
                        className="zp-form-input" 
                        placeholder="e.g. 80"
                        value={newHourlyBasePrice}
                        onChange={(e) => setNewHourlyBasePrice(e.target.value)}
                      />
                    </div>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Extra Price (Per 15 Min)</label>
                      <input 
                        type="number" 
                        className="zp-form-input" 
                        placeholder="e.g. 10"
                        value={newHourlyExtraPrice}
                        onChange={(e) => setNewHourlyExtraPrice(e.target.value)}
                      />
                    </div>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Grace Period (Mins)</label>
                      <input 
                        type="number" 
                        className="zp-form-input" 
                        placeholder="e.g. 5"
                        value={newHourlyGracePeriod}
                        onChange={(e) => setNewHourlyGracePeriod(e.target.value)}
                      />
                    </div>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Deposit (₹)</label>
                      <input 
                        type="number" 
                        className="zp-form-input" 
                        placeholder="e.g. 500"
                        value={newHourlyDeposit}
                        onChange={(e) => setNewHourlyDeposit(e.target.value)}
                      />
                    </div>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Rounding Rule</label>
                      <select 
                        className="zp-form-select"
                        value={newHourlyRoundingRule}
                        onChange={(e) => setNewRoundingRule(e.target.value)}
                      >
                        <option value="Per 15 Minutes">Per 15 Minutes</option>
                        <option value="Per 30 Minutes">Per 30 Minutes</option>
                        <option value="Per Hour">Per Hour</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="zp-btn-primary" style={{ padding: '10px 14px' }} onClick={handleAddHourlyRow}>Add</button>
                      <button className="zp-btn-cancel-pkg" onClick={() => setIsAddingHourly(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="zp-table-container">
                <table className="zp-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>Model</th>
                      <th style={{ width: '15%' }}>Base Price (Per Hour)</th>
                      <th style={{ width: '15%' }}>Deposit (₹)</th>
                      <th style={{ width: '15%' }}>Extra Price (Per Extra 15 Min)</th>
                      <th style={{ width: '15%' }}>Grace Period (Minutes)</th>
                      <th style={{ width: '12%' }}>Rounding Rule</th>
                      <th style={{ width: '8%', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hourlyRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                          No hourly rates configured yet. Click "Add Hourly Rate" to add one.
                        </td>
                      </tr>
                    ) : (
                      hourlyRows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="zp-model-img-box">
                                <img src={row.imgSrc} alt={row.model || 'Scooter'} className="zp-model-img" />
                              </div>
                              <select 
                                className="zp-select-inline"
                                value={row.model}
                                onChange={(e) => handleHourlyRowChange(row.id, 'model', e.target.value)}
                                style={{ fontWeight: 700, width: '130px', padding: '4px' }}
                              >
                                {VEHICLE_MODELS.map((vm, idx) => (
                                  <option key={idx} value={vm.name}>{vm.name}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td>
                            <div className="zp-input-currency-wrap">
                              <span className="zp-currency-symbol">₹</span>
                              <input 
                                type="text" 
                                className="zp-input-inline" 
                                value={row.basePrice}
                                onChange={(e) => handleHourlyRowChange(row.id, 'basePrice', e.target.value)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="zp-input-currency-wrap">
                              <span className="zp-currency-symbol">₹</span>
                              <input 
                                type="text" 
                                className="zp-input-inline" 
                                value={row.deposit || ''}
                                onChange={(e) => handleHourlyRowChange(row.id, 'deposit', e.target.value)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="zp-input-currency-wrap">
                              <span className="zp-currency-symbol">₹</span>
                              <input 
                                type="text" 
                                className="zp-input-inline" 
                                value={row.extraPrice}
                                onChange={(e) => handleHourlyRowChange(row.id, 'extraPrice', e.target.value)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="zp-input-inline-wrap">
                              <input 
                                type="text" 
                                className="zp-input-inline" 
                                value={row.gracePeriod}
                                onChange={(e) => handleHourlyRowChange(row.id, 'gracePeriod', e.target.value)}
                              />
                              <div className="zp-input-helper">Free minutes before extra charges apply</div>
                            </div>
                          </td>
                          <td>
                            <select 
                              className="zp-select-inline"
                              value={row.roundingRule}
                              onChange={(e) => handleHourlyRowChange(row.id, 'roundingRule', e.target.value)}
                            >
                              <option value="Per 15 Minutes">Per 15 Minutes</option>
                              <option value="Per 30 Minutes">Per 30 Minutes</option>
                              <option value="Per Hour">Per Hour</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                              <label className="zp-switch">
                                <input 
                                  type="checkbox" 
                                  checked={row.status}
                                  onChange={(e) => handleHourlyRowChange(row.id, 'status', e.target.checked)}
                                />
                                <span className="zp-slider" />
                              </label>
                              
                              <button 
                                className="zp-delete-row-btn"
                                onClick={() => handleHourlyDelete(row.id)}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : pricingModel === 'Minute Based' ? (
          /* Card 3B: Model-Based Minute Pricing Card */
          <div className="zp-card" style={{ marginTop: '24px' }}>
            <div className="zp-card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="zp-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Minute-Based Price Configuration (Per EV Model)</h2>
                <span className="zp-badge zp-badge-minute" style={{ background: '#FAF5FF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>Selected</span>
              </div>
              <button 
                type="button"
                className="zp-btn-add-pkg"
                onClick={() => setIsAddingMinute(!isAddingMinute)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {isAddingMinute ? 'Cancel' : 'Add Model Rate'}
              </button>
            </div>

            <div className="zp-card-body" style={{ marginTop: '16px' }}>
              <p className="zp-card-subtitle" style={{ marginTop: 0, marginBottom: '20px' }}>
                Configure per-minute rental rates, base unlock fee, grace cancellation period, and security deposits for each electric scooter model.
              </p>

              {/* Inline Form to Add / Edit Model Minute Pricing */}
              {isAddingMinute && (
                <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
                    Configure Minute Rate for EV Model
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Vehicle Model *</label>
                      <select
                        className="zp-form-select"
                        value={newMinuteModel}
                        onChange={(e) => setNewMinuteModel(e.target.value)}
                      >
                        {VEHICLE_MODELS.map(m => (
                          <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="zp-form-group">
                      <label className="zp-form-label">Rate Per Minute (₹ / min) *</label>
                      <input
                        type="number"
                        step="0.10"
                        className="zp-form-input"
                        placeholder="e.g. 1.50"
                        value={minuteRate}
                        onChange={(e) => setMinuteRate(e.target.value)}
                      />
                    </div>

                    <div className="zp-form-group">
                      <label className="zp-form-label">Base Unlock Fee (₹)</label>
                      <input
                        type="number"
                        className="zp-form-input"
                        placeholder="e.g. 10.00"
                        value={minuteUnlockFee}
                        onChange={(e) => setMinuteUnlockFee(e.target.value)}
                      />
                    </div>

                    <div className="zp-form-group">
                      <label className="zp-form-label">Minimum Minutes Charged</label>
                      <input
                        type="number"
                        className="zp-form-input"
                        placeholder="e.g. 10"
                        value={minuteMinTime}
                        onChange={(e) => setMinuteMinTime(e.target.value)}
                      />
                    </div>

                    <div className="zp-form-group">
                      <label className="zp-form-label">Grace Period (Minutes)</label>
                      <input
                        type="number"
                        className="zp-form-input"
                        placeholder="e.g. 3"
                        value={minuteGracePeriod}
                        onChange={(e) => setMinuteGracePeriod(e.target.value)}
                      />
                    </div>

                    <div className="zp-form-group">
                      <label className="zp-form-label">Security Deposit (₹)</label>
                      <input
                        type="number"
                        className="zp-form-input"
                        placeholder="e.g. 200"
                        value={minuteDeposit}
                        onChange={(e) => setMinuteDeposit(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
                    <button
                      type="button"
                      className="zp-btn-cancel"
                      onClick={() => setIsAddingMinute(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="zp-btn-save-inline"
                      onClick={handleAddMinuteRow}
                    >
                      Save Model Rate
                    </button>
                  </div>
                </div>
              )}

              {/* Models Minute Pricing Rates Table */}
              <div className="zp-table-wrap">
                <table className="zp-table">
                  <thead>
                    <tr>
                      <th>Vehicle Model</th>
                      <th>Rate / Min</th>
                      <th>Unlock Fee</th>
                      <th>Min Duration</th>
                      <th>Grace Period</th>
                      <th>Deposit</th>
                      <th>Status</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {minuteRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
                          No minute pricing rates configured. Click &quot;Add Model Rate&quot; above to configure rates.
                        </td>
                      </tr>
                    ) : (
                      minuteRows.map(row => (
                        <tr key={row.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={row.imgSrc || '/assets/city.png'}
                                alt={row.model}
                                style={{ width: '36px', height: '28px', objectFit: 'contain' }}
                                onError={(e: any) => { e.target.src = '/assets/city.png'; }}
                              />
                              <span style={{ fontWeight: 700, color: '#0F172A' }}>{row.model}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 800, color: '#6D28D9' }}>₹{row.ratePerMinute} / min</td>
                          <td style={{ fontWeight: 600, color: '#334155' }}>₹{row.unlockFee || '0'}</td>
                          <td>{row.minMinutes || '10'} mins</td>
                          <td>{row.gracePeriod || '3'} mins</td>
                          <td style={{ fontWeight: 600, color: '#0F172A' }}>₹{row.deposit || '0'}</td>
                          <td>
                            <span className="zp-badge zp-badge-active" style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                              Active
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleMinuteDelete(row.id)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                              title="Delete Model Rate"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Live Fare Calculator Preview Box */}
              <div style={{ marginTop: '24px', background: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                    Live Fare Calculator (Sample 30-Minute Trip)
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Calculated for {minuteRows[0]?.model || 'Standard EV'}: Unlock (₹{parseFloat(minuteRows[0]?.unlockFee || minuteUnlockFee) || 0}) + 30 mins × ₹{parseFloat(minuteRows[0]?.ratePerMinute || minuteRate) || 0}/min
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#6D28D9', fontFamily: 'monospace' }}>
                    ₹{((parseFloat(minuteRows[0]?.unlockFee || minuteUnlockFee) || 0) + 30 * (parseFloat(minuteRows[0]?.ratePerMinute || minuteRate) || 0)).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                    + ₹{minuteRows[0]?.deposit || minuteDeposit || 0} Refundable Deposit
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Card 4: Package Pricing Card */
          <div className="zp-card" style={{ marginTop: '24px' }}>
            <div className="zp-card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="zp-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Package Pricing</h2>
                <span className="zp-badge zp-badge-package">Selected</span>
              </div>
              <button 
                className="zp-btn-add-pkg"
                onClick={() => {
                  setPkgType('Daily');
                  setNewPkgName('Daily');
                  setNewPkgDuration('1');
                  setIsAddingPackage(true);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Package
              </button>
            </div>

            <div className="zp-card-body" style={{ marginTop: '16px' }}>
              <p className="zp-card-subtitle" style={{ marginTop: 0, marginBottom: '16px' }}>Add packages for this zone.</p>

              {/* Inline Package Form */}
              {isAddingPackage && (
                <div className="zp-pkg-form-box">
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: '#1E293B', fontWeight: 700 }}>New Package Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.2fr 1.2fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Model</label>
                      <select 
                        className="zp-form-select"
                        value={newPkgModel}
                        onChange={(e) => setNewPkgModel(e.target.value)}
                      >
                        {VEHICLE_MODELS.map((vm, idx) => (
                          <option key={idx} value={vm.name}>{vm.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Package Type</label>
                      <select 
                        className="zp-form-select"
                        value={pkgType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPkgType(val);
                          if (val === 'Daily') {
                            setNewPkgName('Daily');
                            setNewPkgDuration('1');
                          } else if (val === 'Weekly') {
                            setNewPkgName('Weekly');
                            setNewPkgDuration('7');
                          } else if (val === 'Monthly') {
                            setNewPkgName('Monthly');
                            setNewPkgDuration('30');
                          } else {
                            setNewPkgName('');
                            setNewPkgDuration('');
                          }
                        }}
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Package Name</label>
                      <input 
                        type="text" 
                        className="zp-form-input" 
                        placeholder="e.g. Daily"
                        value={newPkgName}
                        onChange={(e) => setNewPkgName(e.target.value)}
                        disabled={pkgType !== 'Custom'}
                      />
                    </div>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Duration (Days)</label>
                      <input 
                        type="number" 
                        className="zp-form-input" 
                        placeholder="e.g. 1"
                        value={newPkgDuration}
                        onChange={(e) => setNewPkgDuration(e.target.value)}
                        disabled={pkgType !== 'Custom'}
                      />
                    </div>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Price (₹)</label>
                      <input 
                        type="number" 
                        className="zp-form-input" 
                        placeholder="e.g. 199"
                        value={newPkgPrice}
                        onChange={(e) => setNewPkgPrice(e.target.value)}
                      />
                    </div>
                    <div className="zp-form-group">
                      <label className="zp-form-label">Deposit (₹)</label>
                      <input 
                        type="number" 
                        className="zp-form-input" 
                        placeholder="e.g. 500"
                        value={newPkgDeposit}
                        onChange={(e) => setNewPkgDeposit(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="zp-btn-primary" style={{ padding: '10px 14px' }} onClick={handleAddPackage}>Add</button>
                      <button className="zp-btn-cancel-pkg" onClick={() => setIsAddingPackage(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="zp-table-container">
                <table className="zp-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>Model</th>
                      <th style={{ width: '25%' }}>Package Name</th>
                      <th style={{ width: '15%' }}>Duration</th>
                      <th style={{ width: '15%' }}>Price (₹)</th>
                      <th style={{ width: '15%' }}>Deposit (₹)</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: '#64748B' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                              <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                            <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#475569', marginTop: '6px' }}>No packages added yet.</span>
                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>Click "Add Package" to create a package.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      packages.map((pkg) => (
                        <tr key={pkg.id}>
                          <td>
                            <select
                              className="zp-select-inline"
                              value={pkg.model || 'Evegah MINK'}
                              onChange={(e) => handlePackageChange(pkg.id, 'model', e.target.value)}
                              style={{ fontWeight: 700, color: '#2A195C', width: '100%', padding: '6px 8px' }}
                            >
                              {VEHICLE_MODELS.map((vm, idx) => (
                                <option key={idx} value={vm.name}>{vm.name}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              className="zp-select-inline"
                              value={pkg.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                let dur = pkg.duration;
                                if (val === 'Daily') dur = 1;
                                else if (val === 'Weekly') dur = 7;
                                else if (val === 'Monthly') dur = 30;
                                handlePackageMultiChange(pkg.id, { name: val, duration: dur });
                              }}
                              style={{ fontWeight: 700, width: '100%', padding: '6px 8px' }}
                            >
                              <option value="Daily">Daily</option>
                              <option value="Weekly">Weekly</option>
                              <option value="Monthly">Monthly</option>
                              <option value="Custom">Custom</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input 
                                type="number"
                                className="zp-input-inline"
                                value={pkg.duration}
                                onChange={(e) => handlePackageChange(pkg.id, 'duration', parseInt(e.target.value) || 1)}
                                style={{ width: '60px', padding: '6px 8px', fontWeight: 600 }}
                              />
                              <span style={{ fontSize: '11.5px', color: '#64748B' }}>Days</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ position: 'relative' }}>
                              <input 
                                type="number"
                                className="zp-input-inline"
                                value={pkg.price}
                                onChange={(e) => handlePackageChange(pkg.id, 'price', parseFloat(e.target.value) || 0)}
                                style={{ width: '100%', padding: '6px 8px 6px 18px', fontWeight: 700, color: '#1E293B', border: '1.5px solid #CBD5E1' }}
                              />
                              <span style={{ position: 'absolute', left: '7px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontWeight: 700, fontSize: '12px' }}>₹</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ position: 'relative' }}>
                              <input 
                                type="number"
                                className="zp-input-inline"
                                value={pkg.deposit ?? 500}
                                onChange={(e) => handlePackageChange(pkg.id, 'deposit', parseFloat(e.target.value) || 0)}
                                style={{ width: '100%', padding: '6px 8px 6px 18px', fontWeight: 700, color: '#059669', border: '1.5px solid #CBD5E1' }}
                              />
                              <span style={{ position: 'absolute', left: '7px', top: '50%', transform: 'translateY(-50%)', color: '#059669', fontWeight: 700, fontSize: '12px' }}>₹</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              className="zp-delete-row-btn"
                              onClick={() => handlePackageDelete(pkg.id)}
                              title="Delete package"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Notes (Optional) */}
        <div className="zp-card" style={{ marginTop: '24px' }}>
          <h2 className="zp-card-title">Notes (Optional)</h2>
          <div className="zp-card-body">
            <textarea 
              className="zp-form-textarea"
              maxLength={200}
              placeholder="Add any notes for this pricing configuration..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="zp-char-counter">{notes.length} / 200</div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="zp-footer-buttons">
          <button 
            className="zp-btn-secondary"
            onClick={() => router.push('/zones/pricing')}
          >
            Cancel
          </button>
          <button 
            className="zp-btn-primary" 
            style={{ padding: '10px 24px' }}
            onClick={handleSave}
          >
            Save Pricing
          </button>
        </div>
      </div>
    </div>
  );
}

// Shell component with Sidebar, TopBar and loaded state
export default function NewZonePricingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .zp-shell { display: flex; min-height: 100vh; background: #F8F9FF; font-family: 'Inter', sans-serif; }
        .zp-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
        .zp-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

        /* Breadcrumb back */
        .zp-bc { display: flex; align-items: center; font-size: 13px; font-weight: 500; }
        .zp-bc-back { display: inline-flex; align-items: center; color: #8B5CF6; text-decoration: none; font-weight: 700; transition: color .15s; }
        .zp-bc-back:hover { color: #6D28D9; }

        /* Header title */
        .zp-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-top: -4px; }
        .zp-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 6px; letter-spacing: -0.02em; }
        .zp-sub { font-size: 13.5px; color: #64748B; margin: 0; font-weight: 500; }

        /* Form Layout */
        .zp-form-layout { display: flex; flex-direction: column; margin-top: 4px; }
        .zp-info-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 24px; }

        /* Card styles */
        .zp-card { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; }
        .zp-card-title { font-size: 14.5px; font-weight: 800; color: #0F172A; margin: 0 0 16px 0; border-bottom: 1.5px solid #F3F4F6; padding-bottom: 12px; }
        .zp-card-subtitle { font-size: 12.5px; color: #64748B; font-weight: 500; margin-top: -8px; margin-bottom: 16px; }

        /* Form elements */
        .zp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .zp-form-group { display: flex; flex-direction: column; gap: 6px; }
        .zp-form-label { font-size: 12.5px; font-weight: 700; color: #475569; }
        .zp-form-select, .zp-form-input { padding: 9px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; font-weight: 500; color: #1E293B; outline: none; background: #fff; transition: all .15s; }
        .zp-form-select:focus, .zp-form-input:focus { border-color: #2a195c; }
        .zp-form-input:disabled { background: #F8FAFC; color: #64748B; cursor: not-allowed; }

        /* Radio Cards */
        .zp-radio-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 1100px) { .zp-radio-cards-grid { grid-template-columns: 1fr; } }
        .zp-radio-card { border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 14px; cursor: pointer; transition: all .15s; background: #fff; display: flex; flex-direction: column; gap: 8px; }
        .zp-radio-card:hover { border-color: #C7D2FE; }
        .zp-radio-card.active { border-color: #6366F1; background: #F5F7FF; }
        
        .zp-radio-header { display: flex; justify-content: space-between; align-items: center; }
        .zp-radio-circle { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #94A3B8; display: flex; align-items: center; justify-content: center; }
        .zp-radio-card.active .zp-radio-circle { border-color: #6366F1; }
        .zp-radio-card.active .zp-radio-circle::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #6366F1; display: block; }
        
        .zp-radio-icon { width: 34px; height: 34px; border-radius: 50%; background: #EEF2FF; color: #6366F1; display: flex; align-items: center; justify-content: center; }
        .zp-radio-card.active .zp-radio-icon { background: #E0E7FF; }
        
        .zp-radio-title { font-size: 13.5px; font-weight: 800; color: #0F172A; margin: 0; }
        .zp-radio-desc { font-size: 11px; color: #64748B; margin: 0; line-height: 1.4; font-weight: 500; }

        /* Badges */
        .zp-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .zp-badge-hourly { background: #DEF7EC; color: #03543F; }
        .zp-badge-package { background: #E1EFFE; color: #1E429F; }

        /* Table */
        .zp-table-container { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; overflow: hidden; }
        .zp-table { width: 100%; border-collapse: collapse; text-align: left; }
        .zp-table th { background: #FAFBFD; border-bottom: 1.5px solid #E2E8F0; padding: 12px 14px; font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
        .zp-table td { padding: 12px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #1E293B; vertical-align: middle; }
        .zp-table tr:last-child td { border-bottom: none; }
        
        /* Model icon box */
        .zp-model-img-box { width: 34px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: #F3F4F6; overflow: hidden; }
        .zp-model-img { max-height: 100%; max-width: 100%; object-fit: contain; }

        /* Inputs Inside Table */
        .zp-input-currency-wrap { display: flex; align-items: center; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 6px 10px; background: #fff; width: 90px; }
        .zp-input-currency-wrap:focus-within { border-color: #2a195c; }
        .zp-currency-symbol { font-size: 12.5px; font-weight: 700; color: #64748B; margin-right: 4px; }
        
        .zp-input-inline { border: none; outline: none; width: 100%; font-size: 12.5px; font-weight: 700; color: #1E293B; font-family: inherit; }
        .zp-input-inline-wrap { display: flex; flex-direction: column; width: 140px; }
        .zp-input-inline-wrap .zp-input-inline { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 6px 10px; }
        .zp-input-inline-wrap .zp-input-inline:focus { border-color: #2a195c; }
        .zp-input-helper { font-size: 9.5px; color: #94A3B8; font-weight: 500; margin-top: 3px; line-height: 1.2; }

        .zp-select-inline { padding: 6px 8px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12px; font-weight: 600; color: #475569; background: #fff; cursor: pointer; outline: none; width: 120px; }
        .zp-select-inline:focus { border-color: #2a195c; }

        /* Switch toggle */
        .zp-switch { position: relative; display: inline-block; width: 34px; height: 18px; }
        .zp-switch input { opacity: 0; width: 0; height: 0; }
        .zp-slider { position: absolute; cursor: pointer; inset: 0; background-color: #E2E8F0; border-radius: 34px; transition: .15s; }
        .zp-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; border-radius: 50%; transition: .15s; }
        .zp-switch input:checked + .zp-slider { background-color: #6366F1; }
        .zp-switch input:checked + .zp-slider:before { transform: translateX(16px); }

        .zp-delete-row-btn { background: none; border: none; cursor: pointer; color: #EF4444; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 4px; transition: background 0.15s; }
        .zp-delete-row-btn:hover { background: #FEF2F2; }

        /* Package styling */
        .zp-btn-add-pkg { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: 1.5px solid #DDD6FE; background: #fff; color: #2A195C; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .zp-btn-add-pkg:hover { background: #FAF5FF; }
        
        .zp-pkg-form-box { background: #FAFBFD; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-bottom: 16px; }
        .zp-btn-cancel-pkg { padding: 9px 14px; background: #fff; border: 1.5px solid #E2E8F0; color: #475569; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .zp-btn-cancel-pkg:hover { background: #FAFBFD; }

        /* Notes textarea */
        .zp-form-textarea { width: 100%; height: 70px; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; resize: none; font-family: inherit; color: #1E293B; font-weight: 500; }
        .zp-form-textarea:focus { border-color: #2a195c; }
        .zp-char-counter { text-align: right; font-size: 10.5px; color: #94A3B8; font-weight: 600; margin-top: 2px; }

        /* Footer buttons */
        .zp-footer-buttons { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1.5px solid #F3F4F6; }
        .zp-btn-secondary { padding: 10px 20px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.15s; }
        .zp-btn-secondary:hover { background: #FAFBFD; border-color: #94A3B8; }
        .zp-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: #2a195c; color: #fff; border: 1.5px solid #2a195c; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
        .zp-btn-primary:hover { background: #1e1145; border-color: #1e1145; }
      ` }} />
      <div className="zp-shell">
        <Sidebar activePath="/zones/pricing" />
        <div className="zp-main">
          <TopBar 
            notificationCount={3}
            showSearch={false}
            hideZone={false}
          />
          <Suspense fallback={<div className="zp-page">Loading...</div>}>
            <PricingForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
