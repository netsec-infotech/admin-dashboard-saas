'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';
import * as XLSX from 'xlsx';

/* ──────────────────────────────────────────────────────────────
   VEHICLE CATALOG & FLEET MANAGEMENT
   ────────────────────────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
.vl-shell{display:flex;min-height:100vh;background:#F8FAFC;font-family:'Plus Jakarta Sans',sans-serif;color:#0F172A;}
.vl-main{margin-left:230px;display:flex;flex-direction:column;min-height:100vh;width:calc(100% - 230px);}
.vl-page{flex:1;padding:20px 24px 60px;}

/* breadcrumb */
.vl-bc{display:flex;align-items:center;gap:6px;font-size:12px;color:#64748B;font-weight:500;margin-bottom:8px;}
.vl-bc a{color:#64748B;text-decoration:none;}
.vl-bc a:hover{color:#6366F1;}
.vl-bc-sep{color:#CBD5E1;}
.vl-bc-cur{color:#0F172A;font-weight:700;}

/* Header Title row */
.vl-title-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;gap:16px;}
.vl-h1{font-size:22px;font-weight:800;color:#0F172A;margin:0 0 4px;font-family:'Outfit',sans-serif;letter-spacing:-0.02em;}
.vl-sub{font-size:12.5px;color:#64748B;margin:0;font-weight:500;}
.vl-hdr-actions{display:flex;align-items:center;gap:10px;}
.vl-hdr-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;background:#fff;border:1.5px solid #E2E8F0;border-radius:10px;font-size:12.5px;font-weight:700;color:#334155;cursor:pointer;transition:all .15s;}
.vl-hdr-btn:hover{border-color:#6366F1;color:#6366F1;}
.vl-hdr-btn.primary{background:#6366F1;color:#fff;border-color:#6366F1;box-shadow:0 4px 12px rgba(99,102,241,0.25);}
.vl-hdr-btn.primary:hover{background:#4f46e5;color:#fff;border-color:#4f46e5;}
.vl-hdr-btn.danger{background:#EF4444;color:#fff;border-color:#EF4444;box-shadow:0 4px 12px rgba(239,68,68,0.25);}
.vl-hdr-btn.danger:hover{background:#dc2626;border-color:#dc2626;}

/* Stats cards (5 in a row, matching Active Ride Page KPI Card Design) */
.vl-stats-row{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px;}
.vl-stat-card{background:#fff;border:1.5px solid #E2E8F0;border-radius:14px;padding:16px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 2px rgba(0,0,0,.02);box-sizing:border-box;transition:all .15s;}
.vl-stat-card:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.04);border-color:#CBD5E1;}
.vl-stat-ic{width:40px;height:40px;border-radius:10px;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:800;}
.vl-stat-info{min-width:0;flex:1;display:flex;flex-direction:column;}
.vl-stat-lbl{font-size:9.5px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px;}
.vl-stat-val{font-size:19px;font-weight:800;color:#0F172A;line-height:1.2;margin-bottom:2px;font-family:'Outfit',sans-serif;}
.vl-stat-trend{font-size:10px;font-weight:600;display:flex;align-items:center;gap:2px;}

/* Search & filter panel */
.vl-filter-card{background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:16px 20px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.02);display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;}
.vl-search-input-wrap{flex:1;min-width:260px;position:relative;display:flex;align-items:center;}
.vl-search-ic{position:absolute;left:12px;color:#94A3B8;display:flex;}
.vl-search-input{width:100%;padding:9px 12px 9px 36px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:13px;color:#0F172A;outline:none;background:#FFF;transition:all .15s;font-weight:500;}
.vl-search-input:focus{border-color:#6366F1;box-shadow:0 0 0 3px rgba(99,102,241,0.1);}
.vl-filter-grp{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.vl-select{padding:8px 14px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:12.5px;color:#334155;background:#fff;font-weight:600;cursor:pointer;outline:none;transition:border-color .15s;}
.vl-select:focus{border-color:#6366F1;}

/* List View table */
.vl-table-card{background:#fff;border:1px solid #E2E8F0;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.02);overflow:hidden;}
.vl-table-wrap{width:100%;overflow-x:auto;}
.vl-table{width:100%;min-width:1100px;border-collapse:collapse;text-align:left;}
.vl-table th{background:#F8FAFC;padding:12px 16px;font-size:9.5px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #F1F5F9;}
.vl-table td{padding:12px 16px;font-size:12.5px;color:#334155;border-bottom:1px solid #F1F5F9;vertical-align:middle;}
.vl-table tr:last-child td{border-bottom:none;}
.vl-table tr:hover td{background:#F8FAFC;}

/* 14-inch Laptop Responsive Layout */
@media (max-width: 1440px) {
  .vl-page { padding: 16px 20px 40px; }
  .vl-stats-row { gap: 12px; margin-bottom: 16px; }
  .vl-stat-card { padding: 12px 14px; gap: 10px; }
  .vl-stat-val { font-size: 20px; }
  .vl-stat-ic { width: 34px; height: 34px; }
  .vl-filter-card { padding: 12px 16px; gap: 10px; margin-bottom: 16px; }
  .vl-table th, .vl-table td { padding: 10px 14px; }
}
@media (max-width: 1220px) {
  .vl-stats-row { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 820px) {
  .vl-stats-row { grid-template-columns: repeat(2, 1fr); }
}

.vl-veh-cell{display:flex;align-items:center;gap:12px;}
.vl-code{font-size:13.5px;font-weight:800;color:#0F172A;font-family:'Outfit',sans-serif;}
.vl-type{font-size:11px;color:#64748B;margin-top:2px;font-weight:500;}

.vl-badge{font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:20px;display:inline-block;}
.vl-badge.online{background:#DCFCE7;color:#15803D;}
.vl-badge.in_ride{background:#DBEAFE;color:#1D4ED8;}
.vl-badge.low_bat{background:#FEF9C3;color:#A16207;}
.vl-badge.offline{background:#F1F5F9;color:#64748B;}

.vl-bat-bar-wrap{display:flex;align-items:center;gap:8px;}
.vl-bat-pct{font-size:12px;font-weight:700;color:#0F172A;width:34px;}
.vl-bat-bar{width:60px;height:6px;background:#E2E8F0;border-radius:3px;overflow:hidden;}
.vl-bat-bar-fill{height:100%;border-radius:3px;}

.vl-actions{display:flex;align-items:center;gap:8px;}
.vl-act-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid #E2E8F0;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;text-decoration:none;}
.vl-act-btn.view{color:#10B981;border-color:#ECFDF5;background:#ECFDF5;}
.vl-act-btn.view:hover{background:#D1FAE5;color:#059669;}
.vl-act-btn.edit{color:#6366F1;border-color:#EEF2FF;background:#EEF2FF;}
.vl-act-btn.edit:hover{background:#E0E7FF;color:#4f46e5;}
.vl-act-btn.delete{color:#EF4444;border-color:#FEF2F2;background:#FEF2F2;}
.vl-act-btn.delete:hover{background:#FEE2E2;color:#dc2626;}

.vl-pag-row{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid #F1F5F9;}
.vl-pag-lbl{font-size:12px;color:#64748B;}
.vl-pag-ctrls{display:flex;align-items:center;gap:6px;}
.vl-pag-btn{padding:6px 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#fff;font-size:12px;font-weight:600;color:#334155;cursor:pointer;}
.vl-pag-btn:hover:not(:disabled){border-color:#6366F1;color:#6366F1;}
.vl-pag-btn:disabled{opacity:0.5;cursor:not-allowed;}
.vl-pag-num{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;cursor:pointer;}
.vl-pag-num.active{background:#6366F1;color:#fff;}
.vl-pag-num:hover:not(.active){background:#F8FAFC;}
`;

const SI = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const Sv = (p: React.SVGProps<SVGSVGElement> & { s?: number }) => (
  <svg width={p.s || 14} height={p.s || 14} viewBox="0 0 24 24" {...SI} {...p} />
);

const IPlus        = () => <Sv><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Sv>;
const IFilter      = () => <Sv><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Sv>;
const ISearch      = () => <Sv><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Sv>;
const IScooter     = ({ s = 14 }) => <Sv s={s}><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" /><path d="M5.5 17.5l4-8h4l2.5 8" /><path d="M8.5 12h5" /><path d="M12 9l-1.5 2.5h2L11 14" strokeWidth="1.8" /></Sv>;
const ICheckCircle = ({ s = 14 }) => <Sv s={s}><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></Sv>;
const IRide        = ({ s = 14 }) => <Sv s={s}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></Sv>;
const IOffline     = ({ s = 14 }) => <Sv s={s}><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><circle cx="12" cy="20" r="1"/></Sv>;
const IWrench      = ({ s = 14 }) => <Sv s={s}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></Sv>;

interface EVListItem {
  code: string;
  type: string;
  battery: number;
  speed: number;
  status: 'Available' | 'In Ride' | 'Maintenance' | 'Low Battery' | 'Offline';
  badgeCls: string;
  renter: string;
  hub: string;
  lastSeen: string;
  imgSrc: string;
  zone: string;
  category?: string;
  vehicleType?: string;
  vehicleModel?: string;
  currentKm?: string;
  totalKm?: string;
}

export default function VehicleListPage() {
  const [vehiclesList, setVehiclesList] = useState<EVListItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [zonesList, setZonesList] = useState<string[]>(['All Zones']);

  useEffect(() => {
    api.get('/zones').then((res: any) => {
      if (res && res.data) {
        const names = res.data.map((z: any) => z.name || z.locality).filter(Boolean);
        setZonesList(['All Zones', ...new Set<string>(names)]);
      }
    }).catch(() => {});
  }, []);

  // Multi-delete row selections
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  // Vehicle Models & Media Modal State
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isSavingModel, setIsSavingModel] = useState(false);
  const [modelFormData, setModelFormData] = useState({
    name: 'Evegah City',
    category: 'E-Vehicle',
    tagline: 'Stylish. Powerful. Eco-friendly.',
    rating: '4.6',
    reviewsCount: '128',
    description: 'Evegah City is built for the modern commuter. It combines performance, comfort and style with zero emissions.',
    range: '90–110 km',
    topSpeed: '60 km/h',
    batteryCapacity: '2.3 kWh',
    brakes: 'Disc Brakes (Front & Rear)',
    motorPower: '2500 W',
    batteryType: 'Lithium-ion',
    wheelSize: '12 inch',
    waterResistance: 'IP67',
    chargingTime: '4 – 5 Hours',
    loadCapacity: '150 kg',
    warranty: '1 Year Warranty',
    mainImage: 'assets/City-1.png',
    videoUrl: 'assets/ev_video.mp4',
    galleryImagesStr: 'assets/City-1.png, assets/ev_baroda.png, assets/mink_banner.png, assets/Pro_Banner.png',
  });

  const handleSaveModelData = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingModel(true);
    try {
      const galleryList = modelFormData.galleryImagesStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await api.post('/vehicles/models', {
        ...modelFormData,
        galleryImages: galleryList
      });
      alert(`Model specs & media for "${modelFormData.name}" updated successfully!`);
      setIsModelModalOpen(false);
    } catch (err: any) {
      alert(`Failed to save model specs: ${err.message || err}`);
    } finally {
      setIsSavingModel(false);
    }
  };

  // Bulk Vehicle Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedVehicles, setParsedVehicles] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ success?: string; error?: string } | null>(null);

  const handleFileSelect = (file: File) => {
    setImportFile(file);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(sheet);
        if (json.length === 0) {
          setImportResult({ error: 'Uploaded file contains no rows' });
        } else {
          setParsedVehicles(json);
        }
      } catch (err: any) {
        setImportResult({ error: 'Failed to read Excel file: ' + (err.message || err) });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkImport = async () => {
    if (parsedVehicles.length === 0) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/vehicles/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicles: parsedVehicles }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setImportResult({ success: `Successfully imported: ${data.inserted} added, ${data.updated} updated!` });
        fetchVehicles();
        setTimeout(() => {
          setShowImportModal(false);
          setImportFile(null);
          setParsedVehicles([]);
          setImportResult(null);
        }, 1800);
      } else {
        setImportResult({ error: data.message || 'Import failed' });
      }
    } catch (err: any) {
      setImportResult({ error: err.message || 'Failed to submit bulk import' });
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadSample = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.open(`${apiUrl}/vehicles/sample-excel`, '_blank');
  };

  useEffect(() => {
    const updateZone = () => {
      if (typeof window !== 'undefined') {
        const z = localStorage.getItem('evegah_active_zone') || localStorage.getItem('evegah_selected_zone') || 'All Zones';
        setSelectedZone(z);
      }
    };
    updateZone();
    window.addEventListener('evegah_active_zone_changed', updateZone);
    window.addEventListener('evegah_zone_changed', updateZone);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', updateZone);
      window.removeEventListener('evegah_zone_changed', updateZone);
    };
  }, []);

  const fetchVehicles = () => {
    api.get('/vehicles')
      .then(res => {
        if (res && res.status === 'success' && res.data) {
          const mapped = res.data.map((v: any) => ({
            code: v.code,
            type: v.evegah_model_name || 'Evegah City',
            battery: v.battery_pct || 100,
            speed: parseFloat(v.speed || 0),
            status: v.vehicle_status || 'Available',
            badgeCls: v.vehicle_status === 'Available' ? 'online' : v.vehicle_status === 'In Ride' ? 'in_ride' : v.vehicle_status === 'Maintenance' ? 'low_bat' : 'offline',
            renter: v.renter_name || 'None (Available)',
            hub: v.vehicle_manufacturer || 'Evegah Hub',
            lastSeen: v.last_seen ? new Date(v.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            imgSrc: v.vehicle_image || '/City-1.png',
            zone: v.zone || 'Unassigned',
            
            category: v.vehicle_category || 'E-Scooter',
            vehicleType: v.vehicle_type || 'Rental',
            vehicleModel: v.vehicle_model || '',
            currentKm: v.current_km_reading || '0',
            totalKm: v.total_km_covered || '0'
          }));
          setVehiclesList(mapped);
        }
      })
      .catch(err => console.error('Failed to fetch vehicles:', err));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDeleteVehicle = (code: string) => {
    if (confirm(`Are you sure you want to delete vehicle ${code}?`)) {
      api.delete(`/vehicles/${code}`)
        .then(() => {
          setSelectedCodes(prev => prev.filter(c => c !== code));
          fetchVehicles();
        })
        .catch(err => console.error('Failed to delete vehicle:', err));
    }
  };

  const handleToggleRow = (code: string) => {
    setSelectedCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleToggleAll = (filteredItems: EVListItem[]) => {
    if (selectedCodes.length === filteredItems.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(filteredItems.map(v => v.code));
    }
  };

  const handleMultiDelete = async () => {
    if (confirm(`Are you sure you want to delete the ${selectedCodes.length} selected vehicles?`)) {
      try {
        await Promise.all(selectedCodes.map(code => api.delete(`/vehicles/${code}`)));
        setSelectedCodes([]);
        fetchVehicles();
        alert('Selected vehicles deleted successfully!');
      } catch (err) {
        console.error('Failed to delete some vehicles:', err);
      }
    }
  };

  const filtered = vehiclesList.filter(v => {
    const matchesZone = !selectedZone || selectedZone === 'All Zones' || v.zone.toLowerCase().trim() === selectedZone.toLowerCase().trim();
    const matchesSearch = v.code.toLowerCase().includes(search.toLowerCase()) || v.renter.toLowerCase().includes(search.toLowerCase()) || v.hub.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    return matchesZone && matchesSearch && matchesStatus && matchesType;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="vl-shell">
        <Sidebar activePath="/vehicles/all" />
        <div className="vl-main">
          <TopBar />
          <div className="vl-page">

            {/* Breadcrumb */}
            <div className="vl-bc">
              <Link href="/">Home</Link>
              <span className="vl-bc-sep">›</span>
              <a href="#">Vehicles</a>
              <span className="vl-bc-sep">›</span>
              <span className="vl-bc-cur">Vehicle List</span>
            </div>

            {/* Title Row */}
            <div className="vl-title-row">
              <div>
                <h1 className="vl-h1">Vehicle List</h1>
                <p className="vl-sub">
                  Monitor stats, edit vehicle fields, assign zones, and view details.
                  {selectedZone && selectedZone !== 'All Zones' && (
                    <span style={{ marginLeft: '8px', color: '#6366F1', fontWeight: 'bold' }}>
                      📍 Filtered by: {selectedZone}
                    </span>
                  )}
                </p>
              </div>
              <div className="vl-hdr-actions">
                {selectedCodes.length > 0 && (
                  <button className="vl-hdr-btn danger" onClick={handleMultiDelete}>
                    Delete Selected ({selectedCodes.length})
                  </button>
                )}
                <button 
                  className="vl-hdr-btn" 
                  onClick={() => { setShowImportModal(true); setImportResult(null); }}
                  style={{ borderColor: '#10B981', color: '#059669', background: '#ECFDF5' }}
                >
                  📥 Bulk Import
                </button>
                <Link 
                  href="/vehicles/models"
                  className="vl-hdr-btn" 
                  style={{ borderColor: '#8B5CF6', color: '#8B5CF6', background: '#F5F3FF', textDecoration: 'none' }}
                >
                  ⚡ Vehicle Models & Media
                </Link>
                <Link href="/vehicles/add" className="vl-hdr-btn primary" style={{ textDecoration: 'none' }}>
                  <IPlus/> Add Vehicle
                </Link>
              </div>
            </div>

            {/* Metric KPI cards matching Active Ride Page Card Design */}
            <div className="vl-stats-row">
              {[
                { lbl: 'TOTAL VEHICLES', val: filtered.length, trend: 'Fleet In Inventory', ic: <IScooter s={20}/>, bg: '#2A195C', clr: '#16A34A' },
                { lbl: 'AVAILABLE', val: filtered.filter(v => v.status === 'Available').length, trend: 'Ready For Ride', ic: <ICheckCircle s={20}/>, bg: '#10B981', clr: '#16A34A' },
                { lbl: 'IN RIDE', val: filtered.filter(v => v.status === 'In Ride').length, trend: 'On Road Trips', ic: <IRide s={20}/>, bg: '#3B82F6', clr: '#16A34A' },
                { lbl: 'OFFLINE', val: filtered.filter(v => v.status === 'Offline').length, trend: 'Depot Idle', ic: <IOffline s={20}/>, bg: '#64748B', clr: '#64748B' },
                { lbl: 'MAINTENANCE', val: filtered.filter(v => v.status === 'Maintenance').length, trend: 'Under Inspection', ic: <IWrench s={20}/>, bg: '#F59E0B', clr: '#D97706' }
              ].map(s => (
                <div className="vl-stat-card" key={s.lbl}>
                  <div className="vl-stat-ic" style={{ background: s.bg, color: '#fff' }}>
                    {s.ic}
                  </div>
                  <div className="vl-stat-info">
                    <div className="vl-stat-lbl">{s.lbl}</div>
                    <div className="vl-stat-val">{s.val}</div>
                    <div className="vl-stat-trend" style={{ color: s.clr }}>
                      <span style={{ fontSize: 8 }}>▲</span> {s.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search and filter panel */}
            <div className="vl-filter-card">
              <div className="vl-search-input-wrap">
                <span className="vl-search-ic"><ISearch/></span>
                <input 
                  type="text" 
                  className="vl-search-input" 
                  placeholder="Search by Code, Renter name, or Hub..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="vl-filter-grp">
                <select 
                  className="vl-select"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                >
                  {zonesList.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>

                <select 
                  className="vl-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="In Ride">In Ride</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Low Battery">Low Battery</option>
                  <option value="Offline">Offline</option>
                </select>

                <select 
                  className="vl-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Models</option>
                  <option value="Evegah City">Evegah City</option>
                  <option value="Evegah Mink">Evegah Mink</option>
                  <option value="Evegah Fly">Evegah Fly</option>
                  <option value="Evegah Pro">Evegah Pro</option>
                </select>

                <button className="vl-hdr-btn"><IFilter/> Advanced</button>
              </div>
            </div>

            {/* List View Table */}
            <div className="vl-table-card">
              <div className="vl-table-wrap">
                <table className="vl-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={filtered.length > 0 && selectedCodes.length === filtered.length} 
                          onChange={() => handleToggleAll(filtered)}
                        />
                      </th>
                      <th>Image</th>
                      <th>Vehicle Number</th>
                      <th>Model Name</th>
                      <th>Zone</th>
                      <th>Status</th>
                      <th>Battery</th>
                      <th>Speed</th>
                      <th>Hub Location / Renter</th>
                      <th>Last Seen</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(v => {
                      const barColor = v.battery < 20 ? '#EF4444' : v.battery < 50 ? '#F59E0B' : '#10B981';
                      const isSelected = selectedCodes.includes(v.code);
                      return (
                        <tr key={v.code} style={isSelected ? { background: '#F8FAFC' } : undefined}>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleToggleRow(v.code)}
                            />
                          </td>
                          <td>
                            <div className="vl-veh-img-box" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                              <img src={v.imgSrc} alt={v.code} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                          </td>
                          <td>
                            <div className="vl-code">{v.code}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#1E293B' }}>{v.type}</div>
                          </td>
                          <td>
                            <div style={{ 
                              fontWeight: 700, 
                              color: v.zone === 'Unassigned' ? '#94A3B8' : '#2A195C',
                              fontSize: '12px'
                            }}>
                              {v.zone}
                            </div>
                          </td>
                          <td>
                            <span className={`vl-badge ${v.badgeCls}`}>{v.status}</span>
                          </td>
                          <td>
                            <div className="vl-bat-bar-wrap">
                              <span className="vl-bat-pct">{v.battery}%</span>
                              <div className="vl-bat-bar">
                                <div className="vl-bat-bar-fill" style={{ width: `${v.battery}%`, background: barColor }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{v.speed} km/h</span>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontWeight: 600, color: '#111827' }}>{v.hub}</div>
                              {v.status === 'Available' || !v.renter || v.renter === 'None (Available)' ? (
                                <div style={{ fontSize: 11, color: '#16A34A', marginTop: 2, fontWeight: 600 }}>● Ready for allocation</div>
                              ) : v.status === 'In Ride' && v.renter && v.renter !== 'None (Available)' ? (
                                <div style={{ fontSize: 11, color: '#2563EB', marginTop: 2, fontWeight: 600 }}>Renter: {v.renter}</div>
                              ) : (
                                <div style={{ fontSize: 11, color: '#16A34A', marginTop: 2, fontWeight: 600 }}>● Ready for allocation</div>
                              )}
                            </div>
                          </td>
                          <td style={{ color: '#6B7280', fontWeight: 500 }}>
                            {v.lastSeen}
                          </td>
                          <td>
                            <div className="vl-actions" style={{ justifyContent: 'flex-end' }}>
                              <Link href={`/vehicles/detail?code=${v.code}`} className="vl-act-btn view" title="View Vehicle Details" style={{ color: '#4C28BC', background: '#F5F3FF', borderColor: '#C7D2FE' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </Link>
                              <Link href={`/vehicles/map?code=${v.code}`} className="vl-act-btn view" title="View location on live map">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                              </Link>
                              <Link href={`/vehicles/edit?code=${v.code}`} className="vl-act-btn edit" title="Edit vehicle details">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </Link>
                              <button className="vl-act-btn delete" title="Delete vehicle" onClick={() => handleDeleteVehicle(v.code)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: '36px 0', color: '#9CA3AF', fontWeight: 600 }}>
                          No vehicles found matching the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="vl-pag-row">
                <span className="vl-pag-lbl">Showing 1 to {filtered.length} of {filtered.length} entries</span>
                <div className="vl-pag-ctrls">
                  <button className="vl-pag-btn" disabled>Previous</button>
                  <div className="vl-pag-num active">1</div>
                  <button className="vl-pag-btn" disabled>Next</button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* --- VEHICLE MODELS & MEDIA DETAILS MANAGER MODAL --- */}
        {isModelModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                    ⚡ Vehicle Models & Media Manager
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                    Configure specs, video URL, tagline, rating, and gallery images for each model.
                  </p>
                </div>
                <button 
                  onClick={() => setIsModelModalOpen(false)}
                  style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveModelData} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Model Selection Dropdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Vehicle Model Name</label>
                    <select 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px', fontWeight: 600 }}
                      value={modelFormData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        if (name === 'Evegah City') {
                          setModelFormData({
                            name: 'Evegah City',
                            category: 'E-Vehicle',
                            tagline: 'Stylish. Powerful. Eco-friendly.',
                            rating: '4.6',
                            reviewsCount: '128',
                            description: 'Evegah City is built for the modern commuter. It combines performance, comfort and style with zero emissions.',
                            range: '90–110 km',
                            topSpeed: '60 km/h',
                            batteryCapacity: '2.3 kWh',
                            brakes: 'Disc Brakes (Front & Rear)',
                            motorPower: '2500 W',
                            batteryType: 'Lithium-ion',
                            wheelSize: '12 inch',
                            waterResistance: 'IP67',
                            chargingTime: '4 – 5 Hours',
                            loadCapacity: '150 kg',
                            warranty: '1 Year Warranty',
                            mainImage: 'assets/City-1.png',
                            videoUrl: 'assets/ev_video.mp4',
                            galleryImagesStr: 'assets/City-1.png, assets/ev_baroda.png, assets/mink_banner.png, assets/Pro_Banner.png'
                          });
                        } else if (name === 'Evegah Pro') {
                          setModelFormData({
                            name: 'Evegah Pro',
                            category: 'E-Scooter',
                            tagline: 'High Speed Performance EV Scooter.',
                            rating: '4.8',
                            reviewsCount: '215',
                            description: 'Evegah Pro delivers ultimate power and range for highway and long-distance commuting.',
                            range: '110–130 km',
                            topSpeed: '75 km/h',
                            batteryCapacity: '3.1 kWh',
                            brakes: 'CBS Brakes (Front & Rear)',
                            motorPower: '3200 W',
                            batteryType: 'Advanced LiFePO4',
                            wheelSize: '12 inch',
                            waterResistance: 'IP68',
                            chargingTime: '3 – 4 Hours',
                            loadCapacity: '180 kg',
                            warranty: '2 Years Warranty',
                            mainImage: 'assets/Pro_Banner.png',
                            videoUrl: 'assets/ev_video.mp4',
                            galleryImagesStr: 'assets/Pro_Banner.png, assets/fleet_bg_pro.jpg, assets/city.png'
                          });
                        } else if (name === 'Evegah Fly') {
                          setModelFormData({
                            name: 'Evegah Fly',
                            category: 'E-Moped',
                            tagline: 'Lightweight & Agile City Moped.',
                            rating: '4.5',
                            reviewsCount: '94',
                            description: 'Evegah Fly is engineered for effortless maneuverability and instant swappable battery support.',
                            range: '40–60 km',
                            topSpeed: '25 km/h',
                            batteryCapacity: '1.2 kWh',
                            brakes: 'Front Disc & Rear Drum',
                            motorPower: '1200 W',
                            batteryType: 'Swappable Li-ion',
                            wheelSize: '10 inch',
                            waterResistance: 'IP65',
                            chargingTime: '2.5 – 3 Hours',
                            loadCapacity: '120 kg',
                            warranty: '1 Year Warranty',
                            mainImage: 'assets/fly-1.png',
                            videoUrl: 'assets/ev_video.mp4',
                            galleryImagesStr: 'assets/fly-1.png, assets/fleet_bg_cycle.jpg, assets/city-white.png'
                          });
                        } else if (name === 'Evegah Mink') {
                          setModelFormData({
                            name: 'Evegah Mink',
                            category: 'E-Cargo',
                            tagline: 'Heavy-Duty Cargo & Delivery EV.',
                            rating: '4.7',
                            reviewsCount: '156',
                            description: 'Evegah Mink is built for commercial delivery and cargo transport with high load capacity.',
                            range: '70–90 km',
                            topSpeed: '45 km/h',
                            batteryCapacity: '2.0 kWh',
                            brakes: 'Dual Heavy Disc Brakes',
                            motorPower: '2000 W',
                            batteryType: 'High-Capacity Li-ion',
                            wheelSize: '12 inch',
                            waterResistance: 'IP67',
                            chargingTime: '4 Hours',
                            loadCapacity: '220 kg',
                            warranty: '2 Years Warranty',
                            mainImage: 'assets/mink.png',
                            videoUrl: 'assets/ev_video.mp4',
                            galleryImagesStr: 'assets/mink.png, assets/mink_banner.png, assets/MINK.png'
                          });
                        }
                      }}
                    >
                      <option value="Evegah City">Evegah City</option>
                      <option value="Evegah Pro">Evegah Pro</option>
                      <option value="Evegah Fly">Evegah Fly</option>
                      <option value="Evegah Mink">Evegah Mink</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Category Badge</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px' }}
                      value={modelFormData.category}
                      onChange={(e) => setModelFormData({ ...modelFormData, category: e.target.value })}
                    />
                  </div>
                </div>

                {/* Tagline & Ratings */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Tagline</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px' }}
                      value={modelFormData.tagline}
                      onChange={(e) => setModelFormData({ ...modelFormData, tagline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Rating (★)</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px' }}
                      value={modelFormData.rating}
                      onChange={(e) => setModelFormData({ ...modelFormData, rating: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Reviews Count</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px' }}
                      value={modelFormData.reviewsCount}
                      onChange={(e) => setModelFormData({ ...modelFormData, reviewsCount: e.target.value })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Overview Description</label>
                  <textarea 
                    rows={2} 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit' }}
                    value={modelFormData.description}
                    onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
                  />
                </div>

                {/* Technical Specifications Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>Range</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }} value={modelFormData.range} onChange={(e) => setModelFormData({ ...modelFormData, range: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>Top Speed</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }} value={modelFormData.topSpeed} onChange={(e) => setModelFormData({ ...modelFormData, topSpeed: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>Battery Capacity</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }} value={modelFormData.batteryCapacity} onChange={(e) => setModelFormData({ ...modelFormData, batteryCapacity: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>Brakes</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }} value={modelFormData.brakes} onChange={(e) => setModelFormData({ ...modelFormData, brakes: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>Motor Power</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }} value={modelFormData.motorPower} onChange={(e) => setModelFormData({ ...modelFormData, motorPower: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>Charging Time</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }} value={modelFormData.chargingTime} onChange={(e) => setModelFormData({ ...modelFormData, chargingTime: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>Load Capacity</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }} value={modelFormData.loadCapacity} onChange={(e) => setModelFormData({ ...modelFormData, loadCapacity: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>Warranty</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }} value={modelFormData.warranty} onChange={(e) => setModelFormData({ ...modelFormData, warranty: e.target.value })} />
                  </div>
                </div>

                {/* Media Section: Images & Video */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '4px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Main Vehicle Graphic Path/URL</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px' }}
                      value={modelFormData.mainImage}
                      onChange={(e) => setModelFormData({ ...modelFormData, mainImage: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Video URL / Asset Path</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px' }}
                      value={modelFormData.videoUrl}
                      onChange={(e) => setModelFormData({ ...modelFormData, videoUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Gallery Images (Comma Separated)</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px' }}
                    value={modelFormData.galleryImagesStr}
                    onChange={(e) => setModelFormData({ ...modelFormData, galleryImagesStr: e.target.value })}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsModelModalOpen(false)}
                    style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSavingModel}
                    style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#6366F1', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
                  >
                    {isSavingModel ? 'Saving...' : 'Save Model Specs & Media'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Vehicle Import Modal */}
        {showImportModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                    Bulk Vehicle Import (Excel / CSV)
                  </h2>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0' }}>
                    Download the pre-filled sample Excel template, enter vehicle details, and import into fleet.
                  </p>
                </div>
                <button
                  onClick={() => setShowImportModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94A3B8', cursor: 'pointer', padding: '4px 8px' }}
                >
                  ✕
                </button>
              </div>

              {/* Step 1: Sample Template Download */}
              <div style={{ background: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📄 Ready-to-Use Sample Excel Template
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Pre-formatted columns with validation guides, allowed zones, and sample rows.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}
                >
                  📥 Download Sample Template (.xlsx)
                </button>
              </div>

              {/* Step 2: File Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '8px' }}>
                  Upload Filled Excel / CSV File
                </label>
                <div style={{ border: '2px dashed #94A3B8', borderRadius: '12px', padding: '24px', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer', position: 'relative' }}>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  />
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>📊</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    {importFile ? importFile.name : 'Click or Drag & Drop Excel file here'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                    Supports .xlsx, .xls, and .csv
                  </div>
                </div>
              </div>

              {/* Step 3: Preview */}
              {parsedVehicles.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                      Preview: {parsedVehicles.length} Vehicle(s) Detected
                    </span>
                    <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, background: '#DCFCE7', padding: '2px 8px', borderRadius: '10px' }}>
                      Ready to import
                    </span>
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                    <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: '#F1F5F9', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '6px 10px', borderBottom: '1px solid #E2E8F0' }}>Code</th>
                          <th style={{ padding: '6px 10px', borderBottom: '1px solid #E2E8F0' }}>Model</th>
                          <th style={{ padding: '6px 10px', borderBottom: '1px solid #E2E8F0' }}>Category</th>
                          <th style={{ padding: '6px 10px', borderBottom: '1px solid #E2E8F0' }}>Reg No</th>
                          <th style={{ padding: '6px 10px', borderBottom: '1px solid #E2E8F0' }}>Zone</th>
                          <th style={{ padding: '6px 10px', borderBottom: '1px solid #E2E8F0' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedVehicles.slice(0, 5).map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '6px 10px', fontWeight: 700 }}>{row.code || row['Vehicle Code *'] || row['Vehicle Code'] || '—'}</td>
                            <td style={{ padding: '6px 10px' }}>{row.evegah_model_name || row['Model Name *'] || row['Model Name'] || '—'}</td>
                            <td style={{ padding: '6px 10px' }}>{row.vehicle_category || row['Category'] || 'E-Scooter'}</td>
                            <td style={{ padding: '6px 10px' }}>{row.registration_number || row['Registration Number'] || '—'}</td>
                            <td style={{ padding: '6px 10px' }}>{row.zone || row['Zone'] || 'Gotri Zone'}</td>
                            <td style={{ padding: '6px 10px' }}>{row.vehicle_status || row['Vehicle Status'] || 'Available'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedVehicles.length > 5 && (
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', textAlign: 'right' }}>
                      + {parsedVehicles.length - 5} more vehicles will be imported
                    </div>
                  )}
                </div>
              )}

              {/* Result alerts */}
              {importResult?.error && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '12.5px', fontWeight: 600, marginBottom: '16px' }}>
                  ❌ {importResult.error}
                </div>
              )}
              {importResult?.success && (
                <div style={{ padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', color: '#16A34A', fontSize: '12.5px', fontWeight: 600, marginBottom: '16px' }}>
                  ✅ {importResult.success}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={parsedVehicles.length === 0 || importLoading}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: parsedVehicles.length === 0 ? '#94A3B8' : '#10B981',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: parsedVehicles.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: parsedVehicles.length > 0 ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
                  }}
                >
                  {importLoading ? 'Importing...' : `Import ${parsedVehicles.length} Vehicle(s)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
