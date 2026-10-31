"use client";
import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

function AnimatedCount({ value }: { value: string | number }) {
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  useEffect(() => {
    const str = String(value);
    const numericMatch = str.match(/[\d.]+/g);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }
    const numericStr = numericMatch.join('');
    const target = parseFloat(numericStr);
    if (isNaN(target)) {
      setDisplayValue(value);
      return;
    }
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(start + easeProgress * (target - start));
      let formatted = String(current);
      if (str.includes('₹')) {
        formatted = '₹' + current.toLocaleString('en-IN');
      } else if (str.includes(',')) {
        formatted = current.toLocaleString('en-US');
      } else if (str.includes('%')) {
        formatted = current + '%';
      }
      setDisplayValue(formatted);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}</>;
}

const CSS = `
.ev-shell { display: flex; min-height: 100vh; background: #F3F4F9; }
.ev-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.ev-body { padding: 20px 22px 70px; flex: 1; }

/* Breadcrumb */
.fr-bc { display: flex; align-items: center; gap: 6px; padding: 0 0 14px; font-size: 12px; color: #9CA3AF; }
.fr-bc a { color: #9CA3AF; text-decoration: none; }
.fr-bc a:hover { color: #2A195C; }
.fr-bc-sep { color: #D1D5DB; }
.fr-bc-cur { color: #2A195C; font-weight: 600; }

/* Title section */
.fr-title-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; }
.fr-h1 { font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 4px; }
.fr-sub { font-size: 13px; color: #6B7280; margin: 0; }

.fr-actions { display: flex; align-items: center; gap: 10px; }
.fr-btn { display: flex; align-items: center; gap: 7px; padding: 9px 16px; background: #fff; border: 1.5px solid #E5E7EB; border-radius: 10px; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer; transition: all .15s; }
.fr-btn:hover { border-color: #2A195C; color: #2A195C; }
.fr-btn-primary { background: #2a195c; color: #fff; border-color: #2a195c; }
.fr-btn-primary:hover { background: #4338CA; border-color: #4338CA; color: #fff; }

/* KPI Stats cards */
.fr-stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px; }
.fr-stat-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
.fr-stat-ic { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ic-purple { background: #8B5CF6; color: #fff; }
.ic-green { background: #10B981; color: #fff; }
.ic-blue { background: #3B82F6; color: #fff; }
.ic-orange { background: #F97316; color: #fff; }
.ic-red { background: #EF4444; color: #fff; }
.fr-stat-info { min-width: 0; flex: 1; }
.fr-stat-lbl { font-size: 11px; color: #6B7280; font-weight: 500; margin-bottom: 2px; }
.fr-stat-val { font-size: 20px; font-weight: 800; color: #111827; line-height: 1; }
.fr-stat-sub { font-size: 10px; color: #9CA3AF; margin-top: 3px; }

/* Filters Bar */
.fr-filter-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
.fr-filter-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto; gap: 10px; align-items: center; }
.fr-search-wrap { position: relative; }
.fr-search-input { width: 100%; padding: 8px 12px 8px 32px; border: 1.5px solid #E5E7EB; border-radius: 8px; font-size: 13px; outline: none; transition: border-color .15s; }
.fr-search-input:focus { border-color: #2A195C; }
.fr-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9CA3AF; }
.fr-select { padding: 8px 10px; border: 1.5px solid #E5E7EB; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #374151; cursor: pointer; }
.fr-select:focus { border-color: #2A195C; }
.fr-reset-btn { font-size: 12px; font-weight: 700; color: #ef4444; background: none; border: none; cursor: pointer; padding: 5px; }
.fr-reset-btn:hover { text-decoration: underline; }

/* Table styling */
.fr-tcard { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06); overflow: hidden; }
.fr-tcard-hdr { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid #E5E7EB; }
.fr-tcard-tit { font-size: 14.5px; font-weight: 700; color: #111827; }
.fr-dt { width: 100%; border-collapse: collapse; }
.fr-dt th { font-size: 11px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: .06em; text-align: left; padding: 10px 18px; background: #FAFBFD; border-bottom: 1px solid #E5E7EB; }
.fr-dt td { padding: 12px 18px; font-size: 13px; color: #374151; border-bottom: 1px solid #F3F4F6; vertical-align: middle; }
.fr-dt tr:last-child td { border-bottom: none; }
.fr-dt tr:hover td { background: #FAFBFC; }

.fr-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; }
.badge-active { background: #DCFCE7; color: #15803D; }
.badge-inactive { background: #F3F4F6; color: #4B5563; }
.badge-pending { background: #FEF9C3; color: #A16207; }
.badge-suspended { background: #FEE2E2; color: #991B1B; }

.fr-app-badge { display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 600; }
.app-approved { background: #E0F2FE; color: #0369A1; }
.app-pending { background: #FEF3C7; color: #B45309; }
.app-na { background: #F3F4F6; color: #6B7280; }

.fr-eye-btn { width: 28px; height: 28px; border: 1.5px solid #E5E7EB; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: #6B7280; background: #fff; cursor: pointer; transition: all .15s; }
.fr-eye-btn:hover { border-color: #2a195c; color: #2a195c; }

/* Pagination footer */
.fr-tcard-ft { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-top: 1px solid #E5E7EB; background: #FAFBFD; }
.fr-tcard-ft-lbl { font-size: 12px; color: #6B7280; }
.fr-pg { display: flex; align-items: center; gap: 4px; }
.fr-pgb { width: 30px; height: 30px; border: 1.5px solid #E5E7EB; border-radius: 8px; background: #fff; font-size: 12.5px; font-weight: 600; color: #4B5563; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
.fr-pgb:hover:not(:disabled) { border-color: #2A195C; color: #2A195C; }
.fr-pgb.cur { background: #2a195c; color: #fff; border-color: #2a195c; }
.fr-pgb:disabled { opacity: 0.5; cursor: not-allowed; }

/* Modal overlay */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal-card { background: #fff; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); width: 100%; max-width: 500px; overflow: hidden; animation: scaleUp 0.2s ease-out; }
@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.modal-hdr { padding: 16px 20px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: space-between; }
.modal-tit { font-size: 16.5px; font-weight: 800; color: #111827; }
.modal-close { border: none; background: none; cursor: pointer; color: #9CA3AF; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 50%; }
.modal-close:hover { background: #F3F4F9; color: #4B5563; }
.modal-body { padding: 20px; }
.modal-ft { padding: 14px 20px; border-top: 1px solid #E5E7EB; display: flex; justify-content: flex-end; gap: 10px; background: #FAFBFD; }
.form-group { margin-bottom: 14px; }
.form-lbl { display: block; font-size: 12px; font-weight: 600; color: #4B5563; margin-bottom: 5px; }
.form-input { width: 100%; padding: 8px 12px; border: 1.5px solid #E5E7EB; border-radius: 8px; font-size: 13.5px; outline: none; transition: border-color .15s; }
.form-input:focus { border-color: #2A195C; }

@keyframes drawPath {
  to { stroke-dashoffset: 0; }
}
@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-draw {
  stroke-dasharray: 600;
  stroke-dashoffset: 600;
  animation: drawPath 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.animate-scale-in {
  transform-origin: center;
  animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
`;

interface Franchise {
  id: string;
  name: string;
  ownerName: string;
  location: string;
  type: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended';
  approvalStatus: 'Approved' | 'Pending' | 'N/A';
  joinedOn: string;
  revenue: number;
}

const INITIAL_FRANCHISES: Franchise[] = [
  { id: 'FRN-GT-0001', name: 'Gotri E-Vegah Hub', ownerName: 'Rahul Sharma', location: 'Gotri, Vadodara', type: 'Battery Swapping + Rental', status: 'Active', approvalStatus: 'Approved', joinedOn: '12 Jan 2024', revenue: 324850.0 },
  { id: 'FRN-MJ-0002', name: 'Manjalpur E-Vegah', ownerName: 'Aarav Verma', location: 'Manjalpur, Vadodara', type: 'Battery Swapping', status: 'Active', approvalStatus: 'Approved', joinedOn: '18 Jan 2024', revenue: 288650.0 },
  { id: 'FRN-KP-0003', name: 'KPGU E-Vegah Hub', ownerName: 'Neha Gupta', location: 'KPGU Campus, Vadodara', type: 'Rental', status: 'Active', approvalStatus: 'Approved', joinedOn: '22 Jan 2024', revenue: 245320.0 },
  { id: 'FRN-AT-0004', name: 'Aatapi E-Vegah', ownerName: 'Mohit Singh', location: 'Aatapi, Vadodara', type: 'Battery Swapping + Rental', status: 'Active', approvalStatus: 'Approved', joinedOn: '02 Feb 2024', revenue: 312750.0 },
  { id: 'FRN-MD-0005', name: 'Moti Daman E-Vegah', ownerName: 'Pooja Mehta', location: 'Moti Daman, Daman', type: 'Battery Swapping', status: 'Inactive', approvalStatus: 'N/A', joinedOn: '10 Feb 2024', revenue: 0.0 },
  { id: 'FRN-AL-0006', name: 'Alkapuri E-Vegah', ownerName: 'Vikram Arora', location: 'Alkapuri, Vadodara', type: 'Rental', status: 'Pending', approvalStatus: 'Pending', joinedOn: '15 Feb 2024', revenue: 0.0 },
  { id: 'FRN-SY-0007', name: 'Sayajigunj E-Vegah', ownerName: 'Sandeep Kumar', location: 'Sayajigunj, Vadodara', type: 'Battery Swapping + Rental', status: 'Active', approvalStatus: 'Approved', joinedOn: '20 Feb 2024', revenue: 295600.0 },
  { id: 'FRN-AK-0008', name: 'Akota E-Vegah', ownerName: 'Karan Malhotra', location: 'Akota, Vadodara', type: 'Battery Swapping', status: 'Suspended', approvalStatus: 'Approved', joinedOn: '05 Mar 2024', revenue: 0.0 }
];

export default function FranchisePage() {
  const [franchises, setFranchises] = useState<Franchise[]>(INITIAL_FRANCHISES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedApproval, setSelectedApproval] = useState('All Approvals');
  const [selectedType, setSelectedType] = useState('All Types');
  
  // Dialog state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFranchiseName, setNewFranchiseName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newLocation, setNewLocation] = useState('Gotri, Vadodara');
  const [newType, setNewType] = useState('Battery Swapping + Rental');

  // Filter list
  const filtered = franchises.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesZone = selectedZone === 'All Zones' || f.location.includes(selectedZone);
    const matchesStatus = selectedStatus === 'All Status' || f.status === selectedStatus;
    const matchesApproval = selectedApproval === 'All Approvals' || f.approvalStatus === selectedApproval;
    const matchesType = selectedType === 'All Types' || f.type === selectedType;

    return matchesSearch && matchesZone && matchesStatus && matchesApproval && matchesType;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedZone('All Zones');
    setSelectedStatus('All Status');
    setSelectedApproval('All Approvals');
    setSelectedType('All Types');
  };

  const handleAddFranchise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFranchiseName || !newOwnerName) return;

    const newId = `FRN-NEW-00${franchises.length + 1}`;
    const newFrn: Franchise = {
      id: newId,
      name: newFranchiseName,
      ownerName: newOwnerName,
      location: newLocation,
      type: newType,
      status: 'Pending',
      approvalStatus: 'Pending',
      joinedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      revenue: 0.0
    };

    setFranchises([newFrn, ...franchises]);
    setShowAddModal(false);
    setNewFranchiseName('');
    setNewOwnerName('');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ev-shell">
        <Sidebar activePath="/franchise" />
        <div className="ev-main">
          <TopBar title="Franchise Dashboard" subtitle="Manage Evegah franchises" />
          <div className="ev-body">
            
            {/* Breadcrumb */}
            <div className="fr-bc">
              <a href="/">Home</a>
              <span className="fr-bc-sep">/</span>
              <a href="#">Zone Management</a>
              <span className="fr-bc-sep">/</span>
              <span className="fr-bc-cur">Franchise</span>
            </div>

            {/* Title Section */}
            <div className="fr-title-row">
              <div>
                <h1 className="fr-h1">Franchise Management</h1>
                <p className="fr-sub">Monitor operations, revenue, and approval statuses of all hubs</p>
              </div>
              <div className="fr-actions">
                <button className="fr-btn" onClick={() => alert('Exporting franchise report CSV...')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Export
                </button>
                <button className="fr-btn fr-btn-primary" onClick={() => setShowAddModal(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Franchise
                </button>
              </div>
            </div>

            {/* KPI Row */}
            <div className="fr-stats-row">
              <div className="fr-stat-card">
                <div className="fr-stat-ic ic-purple">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div className="fr-stat-info">
                  <div className="fr-stat-lbl">Total Franchises</div>
                  <div className="fr-stat-val"><AnimatedCount value={franchises.length} /></div>
                  <div className="fr-stat-sub">Across all zones</div>
                </div>
              </div>
              <div className="fr-stat-card">
                <div className="fr-stat-ic ic-green">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div className="fr-stat-info">
                  <div className="fr-stat-lbl">Active</div>
                  <div className="fr-stat-val"><AnimatedCount value={franchises.filter(f => f.status === 'Active').length} /></div>
                  <div className="fr-stat-sub">{((franchises.filter(f => f.status === 'Active').length / franchises.length) * 100).toFixed(1)}% Active rate</div>
                </div>
              </div>
              <div className="fr-stat-card">
                <div className="fr-stat-ic ic-orange">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="fr-stat-info">
                  <div className="fr-stat-lbl">Pending Approval</div>
                  <div className="fr-stat-val"><AnimatedCount value={franchises.filter(f => f.approvalStatus === 'Pending').length} /></div>
                  <div className="fr-stat-sub">Requires review</div>
                </div>
              </div>
              <div className="fr-stat-card">
                <div className="fr-stat-ic ic-red">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <div className="fr-stat-info">
                  <div className="fr-stat-lbl">Inactive / Suspended</div>
                  <div className="fr-stat-val"><AnimatedCount value={franchises.filter(f => f.status === 'Inactive' || f.status === 'Suspended').length} /></div>
                  <div className="fr-stat-sub">Deactivated accounts</div>
                </div>
              </div>
              <div className="fr-stat-card">
                <div className="fr-stat-ic ic-blue">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="fr-stat-info">
                  <div className="fr-stat-lbl">Total Revenue (MTD)</div>
                  <div className="fr-stat-val"><AnimatedCount value={'₹' + franchises.reduce((acc, f) => acc + f.revenue, 0).toLocaleString('en-IN')} /></div>
                  <div className="fr-stat-sub">↑ 12.6% vs last month</div>
                </div>
              </div>
            </div>

            {/* Filters bar */}
            <div className="fr-filter-card">
              <div className="fr-filter-grid">
                <div className="fr-search-wrap">
                  <span className="fr-search-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search by Name, ID, or Owner" 
                    className="fr-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select className="fr-select" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
                  <option value="All Zones">All Zones</option>
                  <option value="Gotri">Gotri</option>
                  <option value="Manjalpur">Manjalpur</option>
                  <option value="KPGU">KPGU</option>
                  <option value="Aatapi">Aatapi</option>
                  <option value="Moti Daman">Moti Daman</option>
                  <option value="Alkapuri">Alkapuri</option>
                  <option value="Sayajigunj">Sayajigunj</option>
                  <option value="Akota">Akota</option>
                </select>
                <select className="fr-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                </select>
                <select className="fr-select" value={selectedApproval} onChange={(e) => setSelectedApproval(e.target.value)}>
                  <option value="All Approvals">All Approvals</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="N/A">N/A</option>
                </select>
                <select className="fr-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="All Types">All Types</option>
                  <option value="Battery Swapping + Rental">Battery Swapping + Rental</option>
                  <option value="Battery Swapping">Battery Swapping</option>
                  <option value="Rental">Rental</option>
                </select>
                <div>
                  {(searchQuery || selectedZone !== 'All Zones' || selectedStatus !== 'All Status' || selectedApproval !== 'All Approvals' || selectedType !== 'All Types') && (
                    <button className="fr-reset-btn" onClick={resetFilters}>Reset</button>
                  )}
                </div>
              </div>
            </div>

            {/* Table card */}
            <div className="fr-tcard">
              <div className="fr-tcard-hdr">
                <div className="fr-tcard-tit">Franchise Locations List ({filtered.length})</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="fr-dt">
                  <thead>
                    <tr>
                      <th>Franchise ID</th>
                      <th>Franchise Name</th>
                      <th>Owner Name</th>
                      <th>Location / Zone</th>
                      <th>Service Type</th>
                      <th>Approval Status</th>
                      <th>Joined Date</th>
                      <th>Revenue (MTD)</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
                          No franchises match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(f => (
                        <tr key={f.id}>
                          <td style={{ fontWeight: 'bold', color: '#2A195C' }}>{f.id}</td>
                          <td style={{ fontWeight: '600' }}>{f.name}</td>
                          <td>{f.ownerName}</td>
                          <td>{f.location}</td>
                          <td>{f.type}</td>
                          <td>
                            <span className={`fr-app-badge ${
                              f.approvalStatus === 'Approved' ? 'app-approved' : 
                              f.approvalStatus === 'Pending' ? 'app-pending' : 'app-na'
                            }`}>
                              {f.approvalStatus}
                            </span>
                          </td>
                          <td>{f.joinedOn}</td>
                          <td style={{ fontWeight: 'bold' }}>
                            {f.revenue > 0 ? `₹${f.revenue.toLocaleString('en-IN')}` : '₹0.00'}
                          </td>
                          <td>
                            <span className={`fr-badge ${
                              f.status === 'Active' ? 'badge-active' :
                              f.status === 'Inactive' ? 'badge-inactive' :
                              f.status === 'Pending' ? 'badge-pending' : 'badge-suspended'
                            }`}>
                              {f.status}
                            </span>
                          </td>
                          <td>
                            <button className="fr-eye-btn" title="View details" onClick={() => alert(`Details for ${f.name}\nOwner: ${f.ownerName}\nLocation: ${f.location}\nRevenue: ₹${f.revenue.toLocaleString('en-IN')}`)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="fr-tcard-ft">
                <div className="fr-tcard-ft-lbl">Showing 1 to {filtered.length} of {filtered.length} entries</div>
                <div className="fr-pg">
                  <button className="fr-pgb" disabled>&lt;</button>
                  <button className="fr-pgb cur">1</button>
                  <button className="fr-pgb" disabled>&gt;</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Add Franchise Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-hdr">
              <div className="modal-tit">Add New Franchise</div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddFranchise}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-lbl">Franchise Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dwarka Sec 12 Hub" 
                    className="form-input" 
                    required
                    value={newFranchiseName}
                    onChange={(e) => setNewFranchiseName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-lbl">Owner Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ramesh Kumar" 
                    className="form-input" 
                    required
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-lbl">Location Zone</label>
                  <select 
                    className="form-input"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  >
                    <option value="Gotri, Vadodara">Gotri, Vadodara</option>
                    <option value="Manjalpur, Vadodara">Manjalpur, Vadodara</option>
                    <option value="KPGU Campus, Vadodara">KPGU Campus, Vadodara</option>
                    <option value="Aatapi, Vadodara">Aatapi, Vadodara</option>
                    <option value="Moti Daman, Daman">Moti Daman, Daman</option>
                    <option value="Alkapuri, Vadodara">Alkapuri, Vadodara</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-lbl">Service Type</label>
                  <select 
                    className="form-input"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="Battery Swapping + Rental">Battery Swapping + Rental</option>
                    <option value="Battery Swapping">Battery Swapping</option>
                    <option value="Rental">Rental</option>
                  </select>
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" className="fr-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="fr-btn fr-btn-primary">Add Hub</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
