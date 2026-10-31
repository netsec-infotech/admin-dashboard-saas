"use client";
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

.ev-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; }
.ev-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.ev-body { padding: 20px 24px 60px; flex: 1; display: flex; flex-direction: column; gap: 20px; }

/* Breadcrumb */
.fr-bc { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748B; font-weight: 500; }
.fr-bc a { color: #64748B; text-decoration: none; transition: color 0.15s; }
.fr-bc a:hover { color: #6366F1; }
.fr-bc-sep { color: #CBD5E1; }
.fr-bc-cur { color: #0F172A; font-weight: 700; }

/* Header */
.fr-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 2px; }
.fr-title-h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0; font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; }
.fr-title-sub { font-size: 12.5px; color: #64748B; margin-top: 4px; font-weight: 500; }
.fr-actions { display: flex; align-items: center; gap: 10px; }
.fr-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; font-weight: 700; color: #334155; cursor: pointer; transition: all .15s; }
.fr-btn:hover { border-color: #6366F1; color: #6366F1; }
.fr-btn-primary { background: #6366F1; color: #fff; border-color: #6366F1; box-shadow: 0 4px 12px rgba(99,102,241,0.25); }
.fr-btn-primary:hover { background: #4f46e5; border-color: #4f46e5; color: #fff; }

/* KPI Stats cards */
.fr-kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.fr-kpi { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.02); transition: all .15s; }
.fr-kpi:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.04); border-color: #CBD5E1; }
.fr-kpi-ic { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 800; }
.kpi-purple { background: #EEF2FF; color: #6366F1; }
.kpi-green { background: #ECFDF5; color: #10B981; }
.kpi-orange { background: #FFF7ED; color: #F97316; }
.kpi-red { background: #FEF2F2; color: #EF4444; }
.kpi-blue { background: #EFF6FF; color: #2563EB; }
.fr-kpi-info { min-width: 0; flex: 1; }
.fr-kpi-lbl { font-size: 10.5px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 2px; }
.fr-kpi-val { font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1.1; font-family: 'Outfit', sans-serif; }
.fr-kpi-sub { font-size: 10.5px; color: #64748B; margin-top: 3px; font-weight: 600; }

/* Filters Panel */
.fr-filters-bar { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.fr-filters-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto auto auto; gap: 10px; align-items: center; }
.fr-search-wrap { position: relative; }
.fr-search-input { width: 100%; padding: 8px 12px 8px 34px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; outline: none; background: #fff; color: #0F172A; font-weight: 500; }
.fr-search-input:focus { border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.fr-search-ic { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
.fr-select { padding: 8px 10px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; outline: none; background: #fff; color: #334155; cursor: pointer; font-weight: 600; }
.fr-select:focus { border-color: #6366F1; }
.fr-reset-btn { font-size: 12.5px; font-weight: 700; color: #EF4444; background: none; border: none; cursor: pointer; padding: 6px 12px; }
.fr-reset-btn:hover { text-decoration: underline; }

/* Table styling */
.fr-tcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; }
.fr-tcard-hdr { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #F1F5F9; }
.fr-tcard-tit { font-size: 13.5px; font-weight: 800; color: #0F172A; font-family: 'Outfit', sans-serif; }
.fr-dt { width: 100%; border-collapse: collapse; }
.fr-dt th { font-size: 9.5px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: .05em; text-align: left; padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #F1F5F9; }
.fr-dt td { padding: 12px 16px; font-size: 12.5px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.fr-dt tr:last-child td { border-bottom: none; }
.fr-dt tr:hover td { background: #F8FAFC; }

/* Table badges */
.badge-pill { display: inline-flex; align-items: center; justify-content: center; padding: 3px 9px; border-radius: 20px; font-size: 10.5px; font-weight: 700; text-transform: capitalize; min-width: 65px; text-align: center; }
.badg-active { background: #DCFCE7; color: #15803D; }
.badg-inactive { background: #FEE2E2; color: #EF4444; }
.badg-pending { background: #FEF9C3; color: #A16207; }
.badg-suspended { background: #FEF2F2; color: #EF4444; }

.badg-app-approved { background: #E0F2FE; color: #0369A1; }
.badg-app-pending { background: #FEF3C7; color: #B45309; }
.badg-app-na { background: #F3F4F6; color: #64748B; }

.action-row-btns { display: flex; align-items: center; gap: 6px; }
.act-btn { width: 30px; height: 30px; border: 1.5px solid #E2E8F0; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: #6366F1; background: #fff; cursor: pointer; transition: all .15s; }
.act-btn:hover { border-color: #6366F1; background: #EEF2FF; }

/* Pagination footer */
.fr-tcard-ft { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-top: 1px solid #F1F5F9; background: #fff; }
.fr-tcard-ft-lbl { font-size: 12px; color: #64748B; font-weight: 500; }
.fr-pg { display: flex; align-items: center; gap: 4px; }
.fr-pgb { width: 30px; height: 30px; border: 1.5px solid #E2E8F0; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.fr-pgb:hover:not(:disabled) { border-color: #6366F1; color: #6366F1; }
.fr-pgb.cur { background: #6366F1; color: #fff; border-color: #6366F1; }
.fr-pgb:disabled { opacity: 0.5; cursor: not-allowed; }

/* Bottom Dashboards grid */
.fr-bottom-grid { display: grid; grid-template-columns: 280px 280px 1fr 280px; gap: 16px; }
.bcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; overflow: hidden; min-height: 250px; }
.bcard-hdr { padding: 14px 16px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between; }
.bcard-tit { font-size: 13px; font-weight: 800; color: #0F172A; font-family: 'Outfit', sans-serif; }
.bcard-body { padding: 16px; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
/* Bottom Donuts center label */
.bdonut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
.bdonut-num { font-size: 20px; font-weight: 800; color: #0F172A; }
.bdonut-lbl { font-size: 9px; color: #94A3B8; margin-top: 1px; font-weight: 600; text-transform: uppercase; }

/* Legend Row */
.blegend { width: 100%; display: flex; flex-direction: column; gap: 5px; margin-top: 10px; }
.bleg-row { display: flex; align-items: center; justify-content: space-between; font-size: 10.5px; color: #475569; border-bottom: 1px solid #F8FAFC; padding-bottom: 3px; }
.bleg-row-l { display: flex; align-items: center; gap: 4px; }
.bleg-dot { width: 7px; height: 7px; border-radius: 50%; }
.bleg-val { font-weight: 700; color: #0F172A; }

/* Bar Chart columns styling */
.bar-chart-container { display: flex; align-items: flex-end; justify-content: space-between; height: 120px; width: 100%; padding-top: 10px; position: relative; }
.bar-col-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.bar-col { width: 16px; background: linear-gradient(180deg, #6366F1 0%, #312E81 100%); border-radius: 4px; transition: height 0.3s; position: relative; }
.bar-col:hover { background: #6366F1; }
.bar-lbl { font-size: 9px; color: #94A3B8; font-weight: 700; }

/* Recent Inward items */
.inward-list { display: flex; flex-direction: column; width: 100%; gap: 10px; }
.inward-item { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px; }
.inward-item:last-child { border-bottom: none; padding-bottom: 0; }
.inward-l { display: flex; align-items: center; gap: 8px; }
.inward-icon { width: 28px; height: 28px; background: #EEF2FF; color: #2a195c; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.inward-info { display: flex; flex-direction: column; gap: 1px; }
.inward-code { font-size: 11px; font-weight: 700; color: #1E293B; }
.inward-name { font-size: 10.5px; color: #64748B; }
.inward-r { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.inward-time { font-size: 9px; color: #94A3B8; font-weight: 500; }

/* Quick Summary Footer */
.quick-sum-row { display: flex; align-items: center; background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; justify-content: space-between; width: 100%; }
.quick-sum-hdr { font-size: 12px; font-weight: 800; color: #0F172A; }
.quick-sum-item { display: flex; align-items: center; gap: 8px; }
.quick-sum-circle { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; }
.quick-sum-lbl { font-size: 11px; color: #64748B; font-weight: 500; }
.quick-sum-val { font-size: 12px; font-weight: 700; color: #0F172A; }
`;

interface Franchise {
  code: string;
  name: string;
  ownerName: string;
  zone: string;
  type: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended';
  approvalStatus: 'Approved' | 'Pending' | 'N/A';
  joinedOn: string;
  revenue: number;
}

const INITIAL_FRANCHISES: Franchise[] = [
  { code: 'FRN-GT-0001', name: 'Gotri E-Vegah Hub', ownerName: 'Rahul Sharma', zone: 'Gotri, Vadodara', type: 'Battery Swapping + Rental', status: 'Active', approvalStatus: 'Approved', joinedOn: '12 Jan 2024', revenue: 324850 },
  { code: 'FRN-MJ-0002', name: 'Manjalpur E-Vegah', ownerName: 'Aarav Verma', zone: 'Manjalpur, Vadodara', type: 'Battery Swapping', status: 'Active', approvalStatus: 'Approved', joinedOn: '18 Jan 2024', revenue: 288650 },
  { code: 'FRN-KP-0003', name: 'KPGU E-Vegah Hub', ownerName: 'Neha Gupta', zone: 'KPGU Campus, Vadodara', type: 'Rental', status: 'Active', approvalStatus: 'Approved', joinedOn: '22 Jan 2024', revenue: 245320 },
  { code: 'FRN-AT-0004', name: 'Aatapi E-Vegah', ownerName: 'Mohit Singh', zone: 'Aatapi, Vadodara', type: 'Battery Swapping + Rental', status: 'Active', approvalStatus: 'Approved', joinedOn: '02 Feb 2024', revenue: 312750 },
  { code: 'FRN-MD-0005', name: 'Moti Daman E-Vegah', ownerName: 'Pooja Mehta', zone: 'Moti Daman, Daman', type: 'Battery Swapping', status: 'Inactive', approvalStatus: 'N/A', joinedOn: '10 Feb 2024', revenue: 0 },
  { code: 'FRN-AL-0006', name: 'Alkapuri E-Vegah', ownerName: 'Vikram Arora', zone: 'Alkapuri, Vadodara', type: 'Rental', status: 'Pending', approvalStatus: 'Pending', joinedOn: '15 Feb 2024', revenue: 0 },
  { code: 'FRN-SY-0007', name: 'Sayajigunj E-Vegah', ownerName: 'Sandeep Kumar', zone: 'Sayajigunj, Vadodara', type: 'Battery Swapping + Rental', status: 'Active', approvalStatus: 'Approved', joinedOn: '20 Feb 2024', revenue: 295600 },
  { code: 'FRN-AK-0008', name: 'Akota E-Vegah', ownerName: 'Karan Malhotra', zone: 'Akota, Vadodara', type: 'Battery Swapping', status: 'Suspended', approvalStatus: 'Approved', joinedOn: '05 Mar 2024', revenue: 0 }
];

export default function FranchiseManagementPage() {
  const [franchises] = useState<Franchise[]>(INITIAL_FRANCHISES);
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedApproval, setSelectedApproval] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Filter handlers
  const filtered = franchises.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase()) ||
      f.ownerName.toLowerCase().includes(search.toLowerCase());

    const matchesZone = selectedZone === 'All' || f.zone.includes(selectedZone);
    const matchesStatus = selectedStatus === 'All' || f.status === selectedStatus;
    const matchesApproval = selectedApproval === 'All' || f.approvalStatus === selectedApproval;
    const matchesType = selectedType === 'All' || f.type.toLowerCase().includes(selectedType.toLowerCase());

    return matchesSearch && matchesZone && matchesStatus && matchesApproval && matchesType;
  });

  const handleReset = () => {
    setSearch('');
    setSelectedZone('All');
    setSelectedStatus('All');
    setSelectedApproval('All');
    setSelectedType('All');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ev-shell">
        <Sidebar activePath="/franchise/list" />
        <div className="ev-main">
          <TopBar />
          
          <div className="ev-body">
            
            {/* Breadcrumbs */}
            <div className="fr-bc">
              <a href="/">Home</a>
              <span className="fr-bc-sep">&gt;</span>
              <a href="/franchise/list">Franchise</a>
              <span className="fr-bc-sep">&gt;</span>
              <span className="fr-bc-cur">Franchise Management</span>
            </div>

            {/* Header Title Section */}
            <div className="fr-header">
              <div>
                <h1 className="fr-title-h1">Franchise Management</h1>
                <p className="fr-title-sub">Manage and monitor all franchise operations and performance</p>
              </div>
              <div className="fr-actions">
                <button className="fr-btn" onClick={() => alert('Exporting franchise list CSV...')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Export
                </button>
                <button className="fr-btn fr-btn-primary" onClick={() => alert('Add franchise form...')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Franchise
                </button>
              </div>
            </div>

            {/* Stats Row (5 Cards) */}
            <div className="fr-kpis">
              <div className="fr-kpi">
                <div className="fr-kpi-ic kpi-purple">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className="fr-kpi-info">
                  <span className="fr-kpi-lbl">Total Franchises</span>
                  <div className="fr-kpi-val">48</div>
                  <span className="fr-kpi-sub">Across all zones</span>
                </div>
              </div>

              <div className="fr-kpi">
                <div className="fr-kpi-ic kpi-green">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="fr-kpi-info">
                  <span className="fr-kpi-lbl">Active Franchises</span>
                  <div className="fr-kpi-val">42</div>
                  <span className="fr-kpi-sub">87.50%</span>
                </div>
              </div>

              <div className="fr-kpi">
                <div className="fr-kpi-ic kpi-orange">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="fr-kpi-info">
                  <span className="fr-kpi-lbl">Pending Approval</span>
                  <div className="fr-kpi-val">3</div>
                  <span className="fr-kpi-sub">6.25%</span>
                </div>
              </div>

              <div className="fr-kpi">
                <div className="fr-kpi-ic kpi-red">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                  </svg>
                </div>
                <div className="fr-kpi-info">
                  <span className="fr-kpi-lbl">Inactive / Suspended</span>
                  <div className="fr-kpi-val">3</div>
                  <span className="fr-kpi-sub">6.25%</span>
                </div>
              </div>

              <div className="fr-kpi">
                <div className="fr-kpi-ic kpi-blue">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="fr-kpi-info">
                  <span className="fr-kpi-lbl">Total Revenue (MTD)</span>
                  <div className="fr-kpi-val">₹28,75,450</div>
                  <span className="fr-kpi-sub" style={{ color: '#10B981', fontWeight: 700 }}>↑ 12.6% vs last month</span>
                </div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="fr-filters-bar">
              <div className="fr-filters-grid">
                <div className="fr-search-wrap">
                  <span className="fr-search-ic">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search by Franchise Name / Code / Owner" 
                    className="fr-search-input"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <select className="fr-select" value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
                  <option value="All">All Zones</option>
                  <option value="Gotri Zone">Gotri Zone</option>
                  <option value="Manjalpur Zone">Manjalpur Zone</option>
                  <option value="KPGU Zone">KPGU Zone</option>
                  <option value="Aatapi Zone">Aatapi Zone</option>
                  <option value="Moti Daman Zone">Moti Daman Zone</option>
                </select>

                <select className="fr-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                </select>

                <select className="fr-select" value={selectedApproval} onChange={e => setSelectedApproval(e.target.value)}>
                  <option value="All">All Approvals</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="N/A">N/A</option>
                </select>

                <select className="fr-select" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="Battery Swapping + Rental">Swapping & Rental</option>
                  <option value="Battery Swapping">Swapping</option>
                  <option value="Rental">Rental</option>
                </select>

                <button className="fr-btn" style={{ gap: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                  More Filters
                </button>

                <button className="fr-reset-btn" onClick={handleReset}>Reset</button>

                <button className="fr-btn fr-btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>Apply</button>
              </div>
            </div>

            {/* Franchise List Table */}
            <div className="fr-tcard">
              <div style={{ overflowX: 'auto' }}>
                <table className="fr-dt">
                  <thead>
                    <tr>
                      <th>Franchise Code</th>
                      <th>Franchise Name</th>
                      <th>Owner Name</th>
                      <th>Zone / Location</th>
                      <th>Franchise Type</th>
                      <th>Status</th>
                      <th>Approval Status</th>
                      <th>Joined On</th>
                      <th>Revenue (MTD)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(row => (
                      <tr key={row.code}>
                        <td style={{ fontWeight: '700', color: '#2A195C' }}>{row.code}</td>
                        <td style={{ fontWeight: '700', color: '#1E293B' }}>{row.name}</td>
                        <td style={{ fontWeight: '500' }}>{row.ownerName}</td>
                        <td style={{ color: '#475569', fontWeight: '500' }}>{row.zone}</td>
                        <td style={{ color: '#475569', fontWeight: '500' }}>{row.type}</td>
                        <td>
                          <span className={`badge-pill ${
                            row.status === 'Active' ? 'badg-active' :
                            row.status === 'Inactive' ? 'badg-inactive' :
                            row.status === 'Pending' ? 'badg-pending' : 'badg-suspended'
                          }`}>{row.status}</span>
                        </td>
                        <td>
                          <span className={`badge-pill ${
                            row.approvalStatus === 'Approved' ? 'badg-app-approved' :
                            row.approvalStatus === 'Pending' ? 'badg-app-pending' : 'badg-app-na'
                          }`}>{row.approvalStatus}</span>
                        </td>
                        <td style={{ color: '#64748B', fontWeight: '500' }}>{row.joinedOn}</td>
                        <td style={{ fontWeight: '700', color: '#1E293B' }}>
                          {row.revenue > 0 ? `₹${row.revenue.toLocaleString('en-IN')}` : '₹0'}
                        </td>
                        <td>
                          <div className="action-row-btns">
                            <button className="act-btn" onClick={() => alert(`Viewing details of ${row.name}`)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button className="act-btn">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="fr-tcard-ft">
                <span className="fr-tcard-ft-lbl">Showing 1 to {filtered.length} of 48 entries</span>
                <div className="fr-pg">
                  <button className="fr-pgb" disabled>&lt;</button>
                  <button className="fr-pgb cur">1</button>
                  <button className="fr-pgb">2</button>
                  <button className="fr-pgb">3</button>
                  <button className="fr-pgb">4</button>
                  <button className="fr-pgb">5</button>
                  <span style={{ fontSize: '12px', padding: '0 4px', color: '#94A3B8' }}>...</span>
                  <button className="fr-pgb">6</button>
                  <button className="fr-pgb">&gt;</button>
                  <select className="fr-select" style={{ padding: '4px 6px', fontSize: '11px', marginLeft: '6px' }}>
                    <option>10 / page</option>
                    <option>20 / page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Grid: Zone distribution, Status, Revenue Overview, Recent Franchise Inward */}
            <div className="fr-bottom-grid">
              
              {/* Franchise Distribution by Zone */}
              <div className="bcard">
                <div className="bcard-hdr">
                  <span className="bcard-tit">Franchise Distribution by Zone</span>
                </div>
                <div className="bcard-body">
                  <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <svg viewBox="0 0 100 100" width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                      {/* CP: 25% (length = 62.8) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366F1" strokeWidth="12" strokeDasharray="62.8 188.4" strokeDashoffset="0" />
                      {/* KB: 16.7% (length = 41.9) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="12" strokeDasharray="41.9 209.3" strokeDashoffset="-62.8" />
                      {/* JP: 12.5% (length = 31.4) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="12" strokeDasharray="31.4 219.8" strokeDashoffset="-104.7" />
                      {/* RG: 10.4% (length = 26.1) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EC4899" strokeWidth="12" strokeDasharray="26.1 225.1" strokeDashoffset="-136.1" />
                      {/* NP: 10.4% (length = 26.1) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#06B6D4" strokeWidth="12" strokeDasharray="26.1 225.1" strokeDashoffset="-162.2" />
                      {/* Others: 25% (length = 62.8) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94A3B8" strokeWidth="12" strokeDasharray="62.8 188.4" strokeDashoffset="-188.3" />
                    </svg>
                    <div className="bdonut-center">
                      <span className="bdonut-num">48</span>
                      <span className="bdonut-lbl">Total</span>
                    </div>
                  </div>

                  <div className="blegend">
                    {[
                      { color: '#6366F1', label: 'Gotri Zone', count: 18, pct: '37.5%' },
                      { color: '#10B981', label: 'Manjalpur Zone', count: 14, pct: '29.2%' },
                      { color: '#F59E0B', label: 'KPGU Zone', count: 8, pct: '16.7%' },
                      { color: '#EC4899', label: 'Aatapi Zone', count: 5, pct: '10.4%' },
                      { color: '#06B6D4', label: 'Moti Daman Zone', count: 3, pct: '6.2%' }
                    ].map(item => (
                      <div className="bleg-row" key={item.label}>
                        <div className="bleg-row-l">
                          <span className="bleg-dot" style={{ background: item.color }} />
                          <span>{item.label}</span>
                        </div>
                        <span className="bleg-val">{item.count} <span style={{ fontWeight: 400, color: '#94A3B8' }}>({item.pct})</span></span>
                      </div>
                    ))}
                  </div>
                  <a href="/zones" className="sa-viewall" style={{ marginTop: '8px', alignSelf: 'flex-start' }}>View All Zones →</a>
                </div>
              </div>

              {/* Franchise Status */}
              <div className="bcard">
                <div className="bcard-hdr">
                  <span className="bcard-tit">Franchise Status</span>
                </div>
                <div className="bcard-body">
                  <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <svg viewBox="0 0 100 100" width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                      {/* Active: 87.5% (length = 219.9) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="12" strokeDasharray="219.9 31.4" strokeDashoffset="0" />
                      {/* Inactive: 6.25% (length = 15.7) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94A3B8" strokeWidth="12" strokeDasharray="15.7 235.6" strokeDashoffset="-219.9" />
                      {/* Suspended: 6.25% (length = 15.7) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EF4444" strokeWidth="12" strokeDasharray="15.7 235.6" strokeDashoffset="-235.6" />
                    </svg>
                    <div className="bdonut-center">
                      <span className="bdonut-num">48</span>
                      <span className="bdonut-lbl">Total</span>
                    </div>
                  </div>

                  <div className="blegend">
                    {[
                      { color: '#10B981', label: 'Active', count: 42, pct: '87.50%' },
                      { color: '#3B82F6', label: 'Inactive', count: 3, pct: '6.25%' },
                      { color: '#EF4444', label: 'Suspended', count: 3, pct: '6.25%' },
                      { color: '#F59E0B', label: 'Pending Approval', count: 3, pct: '6.25%' }
                    ].map(item => (
                      <div className="bleg-row" key={item.label}>
                        <div className="bleg-row-l">
                          <span className="bleg-dot" style={{ background: item.color }} />
                          <span>{item.label}</span>
                        </div>
                        <span className="bleg-val">{item.count} <span style={{ fontWeight: 400, color: '#94A3B8' }}>({item.pct})</span></span>
                      </div>
                    ))}
                  </div>
                  <a href="#" className="sa-viewall" style={{ marginTop: '8px', alignSelf: 'flex-start' }}>View All →</a>
                </div>
              </div>

              {/* Revenue Overview (Bar chart) */}
              <div className="bcard">
                <div className="bcard-hdr">
                  <span className="bcard-tit">Revenue Overview</span>
                  <select className="sa-select-sm" style={{ padding: '2px 6px', fontSize: '11px' }}>
                    <option>This Month</option>
                    <option>Last Month</option>
                  </select>
                </div>
                <div className="bcard-body" style={{ justifyContent: 'space-between', alignItems: 'stretch' }}>
                  <div className="bar-chart-container">
                    {/* Y-axis indicator lines */}
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: '0%', borderBottom: '1px dashed #E2E8F0', height: 0 }} />
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: '25%', borderBottom: '1px dashed #E2E8F0', height: 0 }} />
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: '50%', borderBottom: '1px dashed #E2E8F0', height: 0 }} />
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: '75%', borderBottom: '1px dashed #E2E8F0', height: 0 }} />
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: '100%', borderBottom: '1px dashed #E2E8F0', height: 0 }} />

                    {/* Chart Bars */}
                    {[
                      { label: 'CP', height: '80%' },
                      { label: 'KR', height: '70%' },
                      { label: 'JM', height: '60%' },
                      { label: 'RG', height: '75%' },
                      { label: 'NR', height: '65%' },
                      { label: 'DW', height: '10%' },
                      { label: 'PK', height: '20%' },
                      { label: 'Others', height: '55%' }
                    ].map(col => (
                      <div className="bar-col-wrap" key={col.label}>
                        <div className="bar-col" style={{ height: col.height }} />
                        <span className="bar-lbl">{col.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8', marginTop: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
                    <span>₹0</span>
                    <span>₹1L</span>
                    <span>₹2L</span>
                    <span>₹3L</span>
                    <span>₹4L</span>
                  </div>
                  <a href="/reports" className="sa-viewall" style={{ marginTop: '8px', alignSelf: 'flex-start' }}>View Detailed Report →</a>
                </div>
              </div>

              {/* Recent Franchise Inward */}
              <div className="bcard">
                <div className="bcard-hdr">
                  <span className="bcard-tit">Recent Franchise Inward</span>
                  <a href="/franchise/inward" className="sa-viewall">View All</a>
                </div>
                <div className="bcard-body" style={{ padding: '12px', justifyContent: 'flex-start' }}>
                  <div className="inward-list">
                    {[
                      { code: 'FRN-PK-0006', name: 'Pitampura E-Vegah', status: 'Pending', time: '20 May 2024, 11:30 AM' },
                      { code: 'FRN-CR-0009', name: 'Chandni Chowk E-Vegah', status: 'Pending', time: '20 May 2024, 10:45 AM' },
                      { code: 'FRN-SA-0010', name: 'Saket E-Vegah', status: 'Pending', time: '20 May 2024, 09:15 AM' }
                    ].map(item => (
                      <div className="inward-item" key={item.code}>
                        <div className="inward-l">
                          <span className="inward-icon">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                            </svg>
                          </span>
                          <div className="inward-info">
                            <span className="inward-code">{item.code}</span>
                            <span className="inward-name">{item.name}</span>
                          </div>
                        </div>
                        <div className="inward-r">
                          <span className="badge-pill badg-pending" style={{ fontSize: '8px', padding: '2px 6px', minWidth: 'auto' }}>{item.status}</span>
                          <span className="inward-time">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Summary row */}
            <div className="quick-sum-row">
              <span className="quick-sum-hdr">Quick Summary</span>
              {[
                { label: 'Total Franchises', value: '48', color: '#6366F1', bg: '#EEF2FF' },
                { label: 'Active', value: '42', color: '#10B981', bg: '#ECFDF5' },
                { label: 'Inactive / Suspended', value: '3', color: '#EF4444', bg: '#FEF2F2' },
                { label: 'Pending Approval', value: '3', color: '#F97316', bg: '#FFF7ED' },
                { label: 'Total Revenue (MTD)', value: '₹28,75,450', color: '#3B82F6', bg: '#EFF6FF' },
                { label: 'Revenue vs Last Month', value: '↑ 12.6%', color: '#10B981', bg: '#ECFDF5' }
              ].map(item => (
                <div className="quick-sum-item" key={item.label}>
                  <span className="quick-sum-circle" style={{ color: item.color, background: item.bg }}>
                    {item.label === 'Revenue vs Last Month' ? '↑' : item.value}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="quick-sum-lbl">{item.label}</span>
                    <span className="quick-sum-val">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
