"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

.bi-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; }
.bi-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.bi-page { flex: 1; padding: 20px 24px 60px; display: flex; flex-direction: column; gap: 20px; }

/* Breadcrumb */
.bi-bc { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748B; font-weight: 500; }
.bi-bc a { color: #64748B; text-decoration: none; }
.bi-bc a:hover { color: #6366F1; }
.bi-bc-sep { color: #CBD5E1; }
.bi-bc-cur { color: #0F172A; font-weight: 700; }

/* Header title */
.bi-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.bi-h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 4px; font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; }
.bi-sub { font-size: 12.5px; color: #64748B; margin: 0; font-weight: 500; }

.bi-actions { display: flex; align-items: center; gap: 10px; }
.bi-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; font-weight: 700; color: #334155; cursor: pointer; transition: all .15s; }
.bi-btn:hover { border-color: #6366F1; color: #6366F1; }
.bi-btn-primary { background: #6366F1; color: #fff; border-color: #6366F1; box-shadow: 0 4px 12px rgba(99,102,241,0.25); }
.bi-btn-primary:hover { background: #4f46e5; border-color: #4f46e5; color: #fff; }

/* KPI Grid */
.bi-stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.bi-stat-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.02); transition: all .15s; }
.bi-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.04); border-color: #CBD5E1; }
.bi-stat-ic { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 800; }
.ic-purple { background: #EEF2FF; color: #6366F1; }
.ic-green { background: #ECFDF5; color: #10B981; }
.ic-orange { background: #FFF7ED; color: #F97316; }
.ic-blue { background: #EFF6FF; color: #2563EB; }
.ic-red { background: #FEF2F2; color: #EF4444; }

.bi-stat-info { min-width: 0; flex: 1; }
.bi-stat-lbl { font-size: 10.5px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 2px; }
.bi-stat-val { font-size: 22px; font-weight: 800; color: #0F172A; line-height: 1; font-family: 'Outfit', sans-serif; }
.bi-stat-sub { font-size: 11px; color: #64748B; font-weight: 500; margin-top: 4px; display: flex; align-items: center; justify-content: space-between; }
.bi-stat-link { color: #6366F1; text-decoration: none; font-weight: 600; cursor: pointer; }
.bi-stat-link:hover { text-decoration: underline; }

/* Filter bar panel */
.bi-filter-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.bi-filter-grid { display: grid; grid-template-columns: 2.5fr 1.25fr 1.25fr 1.25fr 1.25fr auto auto auto; gap: 10px; align-items: center; }
.bi-search-wrap { position: relative; }
.bi-search-input { width: 100%; padding: 8px 12px 8px 34px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; outline: none; transition: border-color .15s; font-weight: 500; }
.bi-search-input:focus { border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.bi-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
.bi-select { padding: 8px 10px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; outline: none; background: #fff; color: #334155; cursor: pointer; font-weight: 600; }
.bi-select:focus { border-color: #6366F1; }
.bi-filter-btn { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; font-weight: 700; color: #334155; cursor: pointer; }
.bi-filter-btn:hover { border-color: #6366F1; color: #6366F1; }
.bi-reset-btn { padding: 8px 14px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; font-weight: 700; color: #64748B; cursor: pointer; transition: all .15s; }
.bi-reset-btn:hover { border-color: #EF4444; color: #EF4444; }
.bi-apply-btn { padding: 8px 16px; background: #6366F1; border: 1.5px solid #6366F1; border-radius: 10px; font-size: 12.5px; font-weight: 700; color: #fff; cursor: pointer; transition: all .15s; }
.bi-apply-btn:hover { background: #4f46e5; border-color: #4f46e5; }

/* Table styling */
.bi-tcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; }
.bi-dt { width: 100%; border-collapse: collapse; }
.bi-dt th { font-size: 9.5px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: .05em; text-align: left; padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #F1F5F9; }
.bi-dt td { padding: 12px 16px; font-size: 12.5px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.bi-dt tr:last-child td { border-bottom: none; }
.bi-dt tr:hover td { background: #F8FAFC; }

.td-id { font-weight: 800; color: #0F172A; text-decoration: none; cursor: pointer; font-family: 'Outfit', sans-serif; }
.td-id:hover { color: #6366F1; }

.status-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 10.5px; font-weight: 700; text-transform: capitalize; }
.badge-healthy { background: #DCFCE7; color: #15803D; }
.badge-fair { background: #FEF3C7; color: #D97706; }
.badge-poor { background: #FEE2E2; color: #EF4444; }
.badge-maintenance { background: #EFF6FF; color: #2563EB; }
.badge-decommissioned { background: #F1F5F9; color: #475569; }

.action-row { display: flex; align-items: center; gap: 6px; }
.action-btn { width: 26px; height: 26px; border: 1.5px solid #E2E8F0; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #64748B; background: #fff; cursor: pointer; }
.action-btn:hover { border-color: #6366F1; color: #6366F1; }

.bi-tcard-ft { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-top: 1px solid #E2E8F0; background: #F8FAFC; }
.bi-tcard-ft-lbl { font-size: 12.5px; color: #64748B; font-weight: 500; }
.bi-pg { display: flex; align-items: center; gap: 4px; }
.bi-pgb { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 6px; background: #fff; font-size: 12.5px; font-weight: 600; color: #475569; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.bi-pgb:hover:not(:disabled) { border-color: #6366F1; color: #6366F1; }
.bi-pgb.cur { background: #2a195c; color: #fff; border-color: #2a195c; }
.bi-pgb:disabled { opacity: 0.5; cursor: not-allowed; }

/* Donut & Low Health Grid */
.bi-bottom-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.bi-chart-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; }
.bi-chart-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.bi-chart-tit { font-size: 14px; font-weight: 700; color: #0F172A; }
.bi-chart-viewall { font-size: 11px; font-weight: 700; color: #6366F1; text-decoration: none; cursor: pointer; }
.bi-chart-viewall:hover { text-decoration: underline; }

.bi-chart-body { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; flex: 1; }
.donut-container { position: relative; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center; }
.donut-center { position: absolute; text-align: center; }
.donut-number { font-size: 18px; font-weight: 800; color: #0F172A; }
.donut-label { font-size: 9.5px; color: #64748B; font-weight: 500; text-transform: uppercase; }

.bi-legend { width: 100%; display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
.bi-legend-item { display: flex; align-items: center; justify-content: space-between; font-size: 11px; }
.bi-legend-lbl-wrap { display: flex; align-items: center; gap: 6px; color: #64748B; }
.bi-legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.bi-legend-val { font-weight: 700; color: #334155; }

/* Alerts list */
.alerts-list { display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: center; }
.alert-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #FFF1F2; border: 1px solid #FFE4E6; border-radius: 8px; }
.alert-item-left { display: flex; align-items: center; gap: 8px; }
.alert-icon-box { color: #F43F5E; display: flex; align-items: center; justify-content: center; }
.alert-id { font-size: 12px; font-weight: 700; color: #9F1239; }
.alert-location { font-size: 10.5px; color: #E11D48; font-weight: 500; margin-top: 1px; }
.alert-value { font-size: 12.5px; font-weight: 800; color: #9F1239; }

/* Bottom Data Status footer */
.bi-footer-bar { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: #64748B; font-weight: 500; padding: 10px 0 0; }
.bi-refresh-btn { background: none; border: none; color: #64748B; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.bi-refresh-btn:hover { color: #6366F1; }

@keyframes drawPath {
  to { stroke-dashoffset: 0; }
}
@keyframes growBar {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-draw {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawPath 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.animate-draw-large {
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: drawPath 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.animate-scale-in {
  transform-origin: center;
  animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.animate-grow-bar {
  transform-origin: bottom;
  animation: growBar 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
`;

interface BatteryItem {
  id: string;
  battery_id: string;
  serial_number: string;
  battery_type: string;
  capacity: string;
  voltage: string;
  health: number;
  status: string;
  location: string;
  zone: string;
  assigned_to: string;
  vehicle_number: string;
  rider_name: string;
  updated_at: string;
  soc: number;
}

export default function BatteryInventoryPage() {
  const router = useRouter();
  const [batteries, setBatteries] = useState<BatteryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const [searchVal, setSearchVal] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedHealth, setSelectedHealth] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedZone, setSelectedZone] = useState('All Zones');

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

  const fetchBatteries = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/batteries`);
      if (res.ok) {
        const data = await res.json();
        setBatteries(data);
      }
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error fetching batteries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatteries();
    // Auto refresh every 5 mins
    const interval = setInterval(fetchBatteries, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = batteries.filter(b => {
    let matchesZone = true;
    if (selectedZone && selectedZone !== 'All Zones') {
      const zStr = (b.zone || b.location || '').toLowerCase();
      matchesZone = zStr.includes(selectedZone.toLowerCase().trim());
    }

    const matchesSearch = 
      (b.battery_id && b.battery_id.toLowerCase().includes(searchVal.toLowerCase())) || 
      (b.serial_number && b.serial_number.toLowerCase().includes(searchVal.toLowerCase()));
    
    // Status filter - supports case differences and mapping
    let matchesStatus = true;
    if (selectedStatus !== 'All Status') {
      const statusLower = b.status?.toLowerCase() || '';
      const filterLower = selectedStatus.toLowerCase();
      matchesStatus = statusLower === filterLower;
    }

    let matchesType = true;
    if (selectedType !== 'All Types') {
      matchesType = (b.battery_type || '').toLowerCase() === selectedType.toLowerCase();
    }

    let matchesHealth = true;
    if (selectedHealth !== 'All') {
      const h = Number(b.health) || 0;
      if (selectedHealth === 'Healthy') matchesHealth = h >= 80;
      else if (selectedHealth === 'Fair') matchesHealth = h >= 50 && h < 80;
      else if (selectedHealth === 'Poor') matchesHealth = h < 50;
    }

    let matchesLocation = true;
    if (selectedLocation !== 'All Locations') {
      matchesLocation = (b.location || '').toLowerCase().includes(selectedLocation.toLowerCase());
    }

    return matchesZone && matchesSearch && matchesStatus && matchesType && matchesHealth && matchesLocation;
  });

  const resetFilters = () => {
    setSearchVal('');
    setSelectedStatus('All Status');
    setSelectedType('All Types');
    setSelectedHealth('All');
    setSelectedLocation('All Locations');
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAllSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(b => b.battery_id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDeleteSingle = async (batteryId: string) => {
    if (!window.confirm(`Are you sure you want to delete battery "${batteryId}"?`)) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/batteries/${encodeURIComponent(batteryId)}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedIds(prev => prev.filter(x => x !== batteryId));
        fetchBatteries();
      } else {
        alert('Failed to delete battery');
      }
    } catch (err: any) {
      alert('Error deleting battery: ' + err.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected batteries?`)) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/batteries/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battery_ids: selectedIds })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchBatteries();
      } else {
        alert('Failed to delete selected batteries');
      }
    } catch (err: any) {
      alert('Error deleting batteries: ' + err.message);
    }
  };

  // Live KPI calculation from real DB entries
  const totalBatteries = batteries.length;
  const assignedCount = batteries.filter(b => b.assigned_to && b.assigned_to !== '-' && b.assigned_to !== '').length;
  const inMaintenanceCount = batteries.filter(b => {
    const s = b.status?.toLowerCase() || '';
    return s === 'in maintenance' || s === 'maintenance';
  }).length;
  const decommissionedCount = batteries.filter(b => {
    const s = b.status?.toLowerCase() || '';
    return s === 'decommissioned';
  }).length;
  const availableCount = batteries.filter(b => {
    const isAssigned = b.assigned_to && b.assigned_to !== '-' && b.assigned_to !== '';
    const s = b.status?.toLowerCase() || '';
    return !isAssigned && s !== 'in maintenance' && s !== 'maintenance' && s !== 'decommissioned';
  }).length;

  const lowHealthCount = batteries.filter(b => {
    const h = Number(b.health);
    return !isNaN(h) && h < 50 && b.status?.toLowerCase() !== 'decommissioned';
  }).length;

  // Percentage calculations safely
  const availablePct = totalBatteries > 0 ? ((availableCount / totalBatteries) * 100).toFixed(1) + '%' : '0%';
  const assignedPct = totalBatteries > 0 ? ((assignedCount / totalBatteries) * 100).toFixed(1) + '%' : '0%';
  const maintenancePct = totalBatteries > 0 ? ((inMaintenanceCount / totalBatteries) * 100).toFixed(1) + '%' : '0%';
  const decommissionedPct = totalBatteries > 0 ? ((decommissionedCount / totalBatteries) * 100).toFixed(1) + '%' : '0%';

  // Stock by Location donut calculations
  const locationCounts: { [key: string]: number } = {};
  batteries.forEach(b => {
    const loc = b.location || 'Unknown Location';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const locationList = Object.entries(locationCounts)
    .map(([name, val]) => ({ name, val }))
    .sort((a, b) => b.val - a.val);

  const topLocations = locationList.slice(0, 4);
  const otherLocationsCount = locationList.slice(4).reduce((sum, item) => sum + item.val, 0);
  if (otherLocationsCount > 0) {
    topLocations.push({ name: 'Others', val: otherLocationsCount });
  }

  // Stock by Status donut calculations
  const statusCounts = {
    Available: availableCount,
    'In Use': assignedCount,
    'In Maintenance': inMaintenanceCount,
    Decommissioned: decommissionedCount
  };
  const statusColors = {
    Available: '#10B981',
    'In Use': '#3B82F6',
    'In Maintenance': '#F59E0B',
    Decommissioned: '#EF4444'
  };

  // Health distribution donut calculations
  const healthyCount = batteries.filter(b => Number(b.health) >= 80).length;
  const fairCount = batteries.filter(b => Number(b.health) >= 50 && Number(b.health) < 80).length;
  const poorCount = batteries.filter(b => Number(b.health) < 50).length;

  // Low health warning alerts list (top 4 poor SOH)
  const lowHealthAlerts = batteries
    .filter(b => Number(b.health) < 50 && b.status?.toLowerCase() !== 'decommissioned')
    .sort((a, b) => Number(a.health) - Number(b.health))
    .slice(0, 4);

  // Dynamic SVG circle offsets generators
  const renderDonutCircles = (segments: { val: number; color: string }[]) => {
    const total = segments.reduce((sum, s) => sum + s.val, 0);
    if (total === 0) {
      return <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#E2E8F0" strokeWidth="4" />;
    }
    let currentOffset = 25;
    return segments.map((seg, idx) => {
      const pct = (seg.val / total) * 100;
      const dashArray = `${pct} ${100 - pct}`;
      const dashOffset = currentOffset;
      currentOffset -= pct;
      return (
        <circle
          key={idx}
          cx="21"
          cy="21"
          r="15.91549430918954"
          fill="transparent"
          stroke={seg.color}
          strokeWidth="4"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
        />
      );
    });
  };

  // Colors list for location segments
  const locationColors = ['#2A195C', '#06B6D4', '#10B981', '#F59E0B', '#94A3B8'];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bi-shell">
        <Sidebar activePath="/battery/inventory" />
        <div className="bi-main">
          <TopBar title="Battery Inventory" subtitle="Manage and track all battery stock" />
          <div className="bi-page">

            {/* Breadcrumb */}
            <div className="bi-bc">
              <span style={{ marginRight: '4px', display: 'flex', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </span>
              <a href="#" onClick={(e) => { e.preventDefault(); router.push('/battery/inventory'); }}>Battery</a>
              <span className="bi-bc-sep">&gt;</span>
              <span className="bi-bc-cur">Battery Inventory</span>
            </div>

            {/* Title & Action Row */}
            <div className="bi-title-row">
              <div>
                <h1 className="bi-h1">Battery Inventory</h1>
                <p className="bi-sub">Manage and track all battery stock across locations</p>
              </div>
              <div className="bi-actions">
                {selectedIds.length > 0 && (
                  <button
                    className="bi-btn"
                    style={{ background: '#FEF2F2', borderColor: '#F87171', color: '#DC2626', fontWeight: 700 }}
                    onClick={handleDeleteSelected}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete Selected ({selectedIds.length})
                  </button>
                )}
                <button className="bi-btn bi-btn-primary" onClick={() => router.push('/battery/list')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Battery
                </button>
                <button className="bi-btn" onClick={() => alert('Importing CSV...')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Import
                </button>
                <button className="bi-btn" onClick={() => alert('Exporting CSV...')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="bi-stats-row">
              <div className="bi-stat-card">
                <div className="bi-stat-ic ic-purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div className="bi-stat-info">
                  <div className="bi-stat-lbl">Total Batteries</div>
                  <div className="bi-stat-val"><AnimatedCount value={totalBatteries} /></div>
                  <div className="bi-stat-sub">All locations</div>
                </div>
              </div>
              <div className="bi-stat-card">
                <div className="bi-stat-ic ic-green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="14" y2="12"/></svg>
                </div>
                <div className="bi-stat-info">
                  <div className="bi-stat-lbl">Available</div>
                  <div className="bi-stat-val"><AnimatedCount value={availableCount} /></div>
                  <div className="bi-stat-sub"><span>{availablePct}</span></div>
                </div>
              </div>
              <div className="bi-stat-card">
                <div className="bi-stat-ic ic-orange">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div className="bi-stat-info">
                  <div className="bi-stat-lbl">In Use</div>
                  <div className="bi-stat-val"><AnimatedCount value={assignedCount} /></div>
                  <div className="bi-stat-sub"><span>{assignedPct}</span></div>
                </div>
              </div>
              <div className="bi-stat-card">
                <div className="bi-stat-ic ic-blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </div>
                <div className="bi-stat-info">
                  <div className="bi-stat-lbl">In Maintenance</div>
                  <div className="bi-stat-val"><AnimatedCount value={inMaintenanceCount} /></div>
                  <div className="bi-stat-sub"><span>{maintenancePct}</span></div>
                </div>
              </div>
              <div className="bi-stat-card">
                <div className="bi-stat-ic ic-red">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                </div>
                <div className="bi-stat-info">
                  <div className="bi-stat-lbl">Decommissioned</div>
                  <div className="bi-stat-val"><AnimatedCount value={decommissionedCount} /></div>
                  <div className="bi-stat-sub"><span>{decommissionedPct}</span></div>
                </div>
              </div>
              <div className="bi-stat-card">
                <div className="bi-stat-ic ic-purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div className="bi-stat-info">
                  <div className="bi-stat-lbl">Low Health Alert</div>
                  <div className="bi-stat-val"><AnimatedCount value={lowHealthCount} /></div>
                  <div className="bi-stat-sub">
                    <span />
                    <span className="bi-stat-link" onClick={() => setSelectedHealth('Poor')}>View All</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters panel */}
            <div className="bi-filter-card">
              <div className="bi-filter-grid">
                <div className="bi-search-wrap">
                  <span className="bi-search-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search by Battery ID / Serial No." 
                    className="bi-search-input"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                  />
                </div>
                <select className="bi-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="All Status">All Status</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="In Maintenance">In Maintenance</option>
                  <option value="Decommissioned">Decommissioned</option>
                </select>
                <select className="bi-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="All Types">All Types</option>
                  <option value="Li-ion">Li-ion</option>
                </select>
                <select className="bi-select" value={selectedHealth} onChange={(e) => setSelectedHealth(e.target.value)}>
                  <option value="All">All Health</option>
                  <option value="Healthy">Healthy (&gt;=80%)</option>
                  <option value="Fair">Fair (50%-79%)</option>
                  <option value="Poor">Poor (&lt;50%)</option>
                </select>
                <select className="bi-select" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                  <option value="All Locations">All Locations</option>
                  <option value="Gotri Hub">Gotri Hub</option>
                  <option value="Manjalpur Hub">Manjalpur Hub</option>
                  <option value="KPGU Hub">KPGU Hub</option>
                  <option value="Aatapi Hub">Aatapi Hub</option>
                  <option value="Moti Daman Hub">Moti Daman Hub</option>
                </select>
                <button className="bi-filter-btn" onClick={() => alert('Filtering loaded batteries list in real time!')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  More Filters
                </button>
                <button className="bi-reset-btn" onClick={resetFilters}>Reset</button>
                <button className="bi-apply-btn" onClick={() => fetchBatteries()}>Refresh</button>
              </div>
            </div>

            {/* Table */}
            <div className="bi-tcard">
              <div style={{ overflowX: 'auto' }}>
                <table className="bi-dt">
                  <thead>
                    <tr>
                      <th style={{ width: '36px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          style={{ cursor: 'pointer' }}
                          title="Select All"
                        />
                      </th>
                      <th>Battery ID</th>
                      <th>Serial Number</th>
                      <th>Battery Type</th>
                      <th>Capacity</th>
                      <th>Voltage</th>
                      <th>SoH (Health)</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>In Use / Assigned To</th>
                      <th>Last Updated</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                          <span className="spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #E2E8F0', borderTopColor: '#2a195c', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px', verticalAlign: 'middle' }}></span>
                          Loading batteries from database...
                          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: '#64748B' }}>No Batteries Found</div>
                          <div style={{ fontSize: '12.5px', color: '#94A3B8', marginBottom: '16px' }}>There are no battery records matching your active filters.</div>
                          <button className="bi-btn bi-btn-primary" style={{ margin: '0 auto' }} onClick={() => router.push('/battery/list')}>
                            Add Battery
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(b => (
                        <tr key={b.battery_id} style={{ background: selectedIds.includes(b.battery_id) ? '#F0FDF4' : undefined }}>
                          <td style={{ width: '36px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(b.battery_id)}
                              onChange={() => handleToggleSelect(b.battery_id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td className="td-id" onClick={() => router.push(`/battery/inward?id=${encodeURIComponent(b.battery_id)}`)}>{b.battery_id}</td>
                          <td style={{ fontFamily: 'monospace' }}>{b.serial_number || '-'}</td>
                          <td>{b.battery_type || 'Li-ion'}</td>
                          <td>{b.capacity || '-'}</td>
                          <td>{b.voltage ? `${b.voltage} V` : '-'}</td>
                          <td style={{ fontWeight: '700', color: Number(b.health) < 50 ? '#EF4444' : Number(b.health) < 80 ? '#D97706' : '#16A34A' }}>
                            {b.health !== null && b.health !== undefined ? `${b.health}%` : '-'}
                          </td>
                          <td>
                            <span className={`status-badge ${
                              (b.status || '').toLowerCase() === 'healthy' || (b.status || '').toLowerCase() === 'idle' || (b.status || '').toLowerCase() === 'available' ? 'badge-healthy' :
                              (b.status || '').toLowerCase() === 'fair' ? 'badge-fair' :
                              (b.status || '').toLowerCase() === 'poor' ? 'badge-poor' :
                              (b.status || '').toLowerCase().includes('maintenance') ? 'badge-maintenance' : 'badge-decommissioned'
                            }`}>
                              {b.status || 'available'}
                            </span>
                          </td>
                          <td>{b.location || '-'}</td>
                          <td style={{ color: b.assigned_to && b.assigned_to !== '-' ? '#2563EB' : '#64748B', fontWeight: b.assigned_to && b.assigned_to !== '-' ? '600' : '400' }}>
                            {b.assigned_to || '-'}
                          </td>
                          <td>{formatDate(b.updated_at)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-row" style={{ justifyContent: 'center' }}>
                              <button
                                className="action-btn"
                                title="View Inward Specs"
                                onClick={() => router.push(`/battery/inward?id=${encodeURIComponent(b.battery_id)}`)}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button
                                className="action-btn"
                                title="Delete Battery"
                                style={{ color: '#DC2626' }}
                                onClick={() => handleDeleteSingle(b.battery_id)}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <div className="bi-tcard-ft">
                <div className="bi-tcard-ft-lbl">Showing 1 to {filtered.length} of {totalBatteries} entries</div>
                <div className="bi-pg">
                  <button className="bi-pgb" disabled>&lt;</button>
                  <button className="bi-pgb cur">1</button>
                  <button className="bi-pgb" disabled>&gt;</button>
                  <select className="bi-select" style={{ height: '28px', padding: '0 6px', fontSize: '12px', marginLeft: '6px' }} disabled>
                    <option>10 / page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Row Donut charts & alerts */}
            <div className="bi-bottom-grid">
              
              {/* Donut 1: Stock by Location */}
              <div className="bi-chart-card">
                <div className="bi-chart-hdr">
                  <span className="bi-chart-tit">Stock by Location</span>
                  <span className="bi-chart-viewall" onClick={() => alert('Top locations by stock')}>View All</span>
                </div>
                <div className="bi-chart-body">
                  <div className="donut-container">
                    <svg className="animate-scale-in" width="100%" height="100%" viewBox="0 0 42 42">
                      <circle cx="21" cy="21" r="15.91549430918954" fill="#fff" />
                      {renderDonutCircles(topLocations.map((item, idx) => ({ val: item.val, color: locationColors[idx % locationColors.length] })))}
                    </svg>
                    <div className="donut-center">
                      <div className="donut-number">{totalBatteries}</div>
                      <div className="donut-label">Total</div>
                    </div>
                  </div>
                  <div className="bi-legend">
                    {topLocations.map((item, idx) => {
                      const pct = totalBatteries > 0 ? ((item.val / totalBatteries) * 100).toFixed(1) : '0';
                      return (
                        <div className="bi-legend-item" key={item.name}>
                          <div className="bi-legend-lbl-wrap">
                            <span className="bi-legend-dot" style={{ background: locationColors[idx % locationColors.length] }} />
                            {item.name}
                          </div>
                          <div className="bi-legend-val">{item.val} <span style={{ fontWeight: 'normal', color: '#94A3B8' }}>({pct}%)</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Donut 2: Stock by Status */}
              <div className="bi-chart-card">
                <div className="bi-chart-hdr">
                  <span className="bi-chart-tit">Stock by Status</span>
                  <span className="bi-chart-viewall" onClick={() => alert('Status distribution details')}>View All</span>
                </div>
                <div className="bi-chart-body">
                  <div className="donut-container">
                    <svg className="animate-scale-in" width="100%" height="100%" viewBox="0 0 42 42">
                      <circle cx="21" cy="21" r="15.91549430918954" fill="#fff" />
                      {renderDonutCircles(Object.entries(statusCounts).map(([name, val]) => ({ val, color: statusColors[name as keyof typeof statusColors] })))}
                    </svg>
                    <div className="donut-center">
                      <div className="donut-number">{totalBatteries}</div>
                      <div className="donut-label">Total</div>
                    </div>
                  </div>
                  <div className="bi-legend">
                    {Object.entries(statusCounts).map(([name, val]) => {
                      const pct = totalBatteries > 0 ? ((val / totalBatteries) * 100).toFixed(1) : '0';
                      return (
                        <div className="bi-legend-item" key={name}>
                          <div className="bi-legend-lbl-wrap">
                            <span className="bi-legend-dot" style={{ background: statusColors[name as keyof typeof statusColors] }} />
                            {name}
                          </div>
                          <div className="bi-legend-val">{val} <span style={{ fontWeight: 'normal', color: '#94A3B8' }}>({pct}%)</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Donut 3: Health Distribution */}
              <div className="bi-chart-card">
                <div className="bi-chart-hdr">
                  <span className="bi-chart-tit">Health Distribution</span>
                  <span className="bi-chart-viewall" onClick={() => alert('Health breakdown')}>View All</span>
                </div>
                <div className="bi-chart-body">
                  <div className="donut-container">
                    <svg className="animate-scale-in" width="100%" height="100%" viewBox="0 0 42 42">
                      <circle cx="21" cy="21" r="15.91549430918954" fill="#fff" />
                      {renderDonutCircles([
                        { val: healthyCount, color: '#10B981' },
                        { val: fairCount, color: '#F59E0B' },
                        { val: poorCount, color: '#EF4444' }
                      ])}
                    </svg>
                    <div className="donut-center">
                      <div className="donut-number">{totalBatteries}</div>
                      <div className="donut-label">Total</div>
                    </div>
                  </div>
                  <div className="bi-legend">
                    <div className="bi-legend-item">
                      <div className="bi-legend-lbl-wrap"><span className="bi-legend-dot" style={{ background: '#10B981' }} />Healthy <span style={{ color: '#94A3B8', fontSize: '9px', fontWeight: 'normal' }}>(&gt;=80%)</span></div>
                      <div className="bi-legend-val">{healthyCount} <span style={{ fontWeight: 'normal', color: '#94A3B8' }}>({totalBatteries > 0 ? ((healthyCount / totalBatteries) * 100).toFixed(1) : 0}%)</span></div>
                    </div>
                    <div className="bi-legend-item">
                      <div className="bi-legend-lbl-wrap"><span className="bi-legend-dot" style={{ background: '#F59E0B' }} />Fair <span style={{ color: '#94A3B8', fontSize: '9px', fontWeight: 'normal' }}>(50% - 79%)</span></div>
                      <div className="bi-legend-val">{fairCount} <span style={{ fontWeight: 'normal', color: '#94A3B8' }}>({totalBatteries > 0 ? ((fairCount / totalBatteries) * 100).toFixed(1) : 0}%)</span></div>
                    </div>
                    <div className="bi-legend-item">
                      <div className="bi-legend-lbl-wrap"><span className="bi-legend-dot" style={{ background: '#EF4444' }} />Poor <span style={{ color: '#94A3B8', fontSize: '9px', fontWeight: 'normal' }}>(&lt;50%)</span></div>
                      <div className="bi-legend-val">{poorCount} <span style={{ fontWeight: 'normal', color: '#94A3B8' }}>({totalBatteries > 0 ? ((poorCount / totalBatteries) * 100).toFixed(1) : 0}%)</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* List: Low Health Alerts */}
              <div className="bi-chart-card">
                <div className="bi-chart-hdr">
                  <span className="bi-chart-tit">Low Health Alerts</span>
                  <span className="bi-chart-viewall" onClick={() => setSelectedHealth('Poor')}>View All</span>
                </div>
                <div className="alerts-list">
                  {lowHealthAlerts.length === 0 ? (
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', padding: '20px' }}>
                      No battery degradation alerts.
                    </div>
                  ) : (
                    lowHealthAlerts.map(b => (
                      <div className="alert-item" key={b.battery_id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/battery/inventory/${b.battery_id}`)}>
                        <div className="alert-item-left">
                          <span className="alert-icon-box">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          </span>
                          <div>
                            <div className="alert-id">{b.battery_id}</div>
                            <div className="alert-location">{b.location || 'Unknown Location'}</div>
                          </div>
                        </div>
                        <span className="alert-value">{b.health}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Data Status footer */}
            <div className="bi-footer-bar">
              <span className="bi-refresh-btn" onClick={fetchBatteries}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </span>
              <span>Data is auto refreshed every 5 minutes</span>
              <span style={{ color: '#CBD5E1' }}>|</span>
              <span>Last updated: {lastRefreshed || 'Just Now'}</span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

