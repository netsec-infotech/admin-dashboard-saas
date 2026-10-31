"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

interface AlertItem {
  id: string;
  category: 'Geofence' | 'Battery BMS' | 'Fleet Telematics' | 'Payment Gateway' | 'Station Hardware';
  severity: 'Critical' | 'Warning' | 'Info' | 'Resolved';
  title: string;
  description: string;
  source: string;
  zone: string;
  timestamp: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  metric?: string;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-GF-9021',
    category: 'Geofence',
    severity: 'Critical',
    title: 'Geofence Boundary Breach Detected',
    description: 'Vehicle exited the designated Manjalpur Zone geofence boundary without route clearance.',
    source: 'GJ06-EV-1025 (Evegah City)',
    zone: 'Manjalpur Zone',
    timestamp: '3 mins ago',
    status: 'Open',
    metric: 'Speed: 42 km/h • 1.4 km outside zone'
  },
  {
    id: 'ALT-BMS-4102',
    category: 'Battery BMS',
    severity: 'Critical',
    title: 'BMS Critical Low SoC & High Temperature',
    description: 'Battery pack cell temperature exceeded safety threshold (48°C) with SoC below 12%.',
    source: 'BAT-MJ-60V-02 (Li-ion 60V)',
    zone: 'Manjalpur Zone',
    timestamp: '9 mins ago',
    status: 'Open',
    metric: 'SoC: 11% • Temp: 48.2°C • 3.1V/cell'
  },
  {
    id: 'ALT-FLT-3319',
    category: 'Fleet Telematics',
    severity: 'Warning',
    title: 'Unexpected Fall & Impact Sensor Triggered',
    description: '6-axis IMU detected tilt angle exceeding 72 degrees with abrupt deceleration.',
    source: 'GJ06-EV-2041 (Rider: Hardik Joshi)',
    zone: 'Gotri Zone',
    timestamp: '24 mins ago',
    status: 'Investigating',
    metric: 'Impact: 2.8G • Tilt: 76° • GPS Locked'
  },
  {
    id: 'ALT-STN-1108',
    category: 'Station Hardware',
    severity: 'Warning',
    title: 'Battery Swap Dock Cabinet Disconnected',
    description: 'Locker bay #4 in Manjalpur Hub failed heartbeat ping for over 15 minutes.',
    source: 'Station Dock #4 (Manjalpur Hub)',
    zone: 'Manjalpur Zone',
    timestamp: '42 mins ago',
    status: 'Open',
    metric: 'Offline: 18m • Bay 4 Locked'
  },
  {
    id: 'ALT-PAY-8821',
    category: 'Payment Gateway',
    severity: 'Warning',
    title: 'ICICI Payment Webhook Delivery Timeout',
    description: 'Gateway responded with 504 Gateway Timeout on deposit refund batch #8821.',
    source: 'ICICI E-Collect Webhook',
    zone: 'All Zones',
    timestamp: '1 hr ago',
    status: 'Investigating',
    metric: 'Batch: ₹14,200 • 3 Retry attempts'
  },
  {
    id: 'ALT-BMS-2204',
    category: 'Battery BMS',
    severity: 'Warning',
    title: 'Rapid State of Charge Degradation',
    description: 'Excessive delta-V detected between parallel strings during active rental discharge.',
    source: 'BAT-GT-60V-01 (Li-ion 60V)',
    zone: 'Gotri Zone',
    timestamp: '2 hrs ago',
    status: 'Open',
    metric: 'Delta-V: 180mV • SoC Drop: 4.8%/km'
  },
  {
    id: 'ALT-FLT-1190',
    category: 'Fleet Telematics',
    severity: 'Info',
    title: 'Firmware Over-The-Air (FOTA) Completed',
    description: 'ECU Telematics firmware v2.6.4 updated successfully on vehicle fleet cluster.',
    source: 'GJ06-EV-1018 (Evegah Pro)',
    zone: 'KPGU Zone',
    timestamp: '3 hrs ago',
    status: 'Resolved',
    metric: 'Checksum: 0x88F1A • Signal: -68 dBm'
  },
  {
    id: 'ALT-GF-8834',
    category: 'Geofence',
    severity: 'Resolved',
    title: 'Geofence Breach Cleared - Rider Returned',
    description: 'Vehicle re-entered authorized depot boundary. Speed and GPS lock verified.',
    source: 'GJ06-EV-1022 (Evegah City)',
    zone: 'Manjalpur Zone',
    timestamp: '4 hrs ago',
    status: 'Resolved',
    metric: 'Return Verified • Distance: 8.4 km'
  }
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Critical' | 'Warning' | 'Geofence' | 'Battery' | 'System' | 'Resolved'>('All');
  const [activeZone, setActiveZone] = useState('All Zones');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync active zone from session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedZone = localStorage.getItem('evegah_active_zone') || localStorage.getItem('evegah_selected_zone') || 'All Zones';
      if (savedZone) setActiveZone(savedZone);
    }

    const handleZone = (e: any) => {
      const z = e?.detail?.name || (typeof e?.detail === 'string' ? e.detail : 'All Zones');
      if (z) setActiveZone(z);
    };

    window.addEventListener('evegah_active_zone_changed', handleZone);
    window.addEventListener('evegah_zone_changed', handleZone);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', handleZone);
      window.removeEventListener('evegah_zone_changed', handleZone);
    };
  }, []);

  // Fetch backend notifications to merge real data if available
  useEffect(() => {
    const fetchBackendAlerts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/notifications`);
        if (res.ok) {
          const result = await res.json();
          if (Array.isArray(result.data) && result.data.length > 0) {
            const apiItems: AlertItem[] = result.data.map((n: any) => ({
              id: `ALT-NOTIF-${n.id || Date.now()}`,
              category: n.type === 'alert' ? 'Battery BMS' : n.type === 'payment' ? 'Payment Gateway' : 'Station Hardware',
              severity: n.type === 'alert' ? 'Critical' : n.type === 'payment' ? 'Warning' : 'Info',
              title: n.title || 'System Notification Alert',
              description: n.message || 'System notification received.',
              source: 'Evegah Telemetry Stream',
              zone: activeZone !== 'All Zones' ? activeZone : 'Manjalpur Zone',
              timestamp: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              status: n.read ? 'Resolved' : 'Open',
              metric: 'Real-time Ingress'
            }));
            setAlerts(prev => {
              const ids = new Set(prev.map(p => p.id));
              const fresh = apiItems.filter(item => !ids.has(item.id));
              return [...fresh, ...prev];
            });
          }
        }
      } catch (err) {
        // Fallback to initial alerts
      }
    };
    fetchBackendAlerts();
  }, [activeZone]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Investigating' } : a));
    showToast(`Alert #${id} marked as Investigating.`);
  };

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved', severity: 'Resolved' } : a));
    showToast(`Alert #${id} marked as Resolved.`);
  };

  const handleMarkAllResolved = () => {
    setAlerts(prev => prev.map(a => ({ ...a, status: 'Resolved', severity: 'Resolved' })));
    showToast('All visible alerts marked as Resolved.');
  };

  const handleExportCSV = () => {
    const headers = ['Alert ID', 'Category', 'Severity', 'Title', 'Source', 'Zone', 'Timestamp', 'Status', 'Metrics'];
    const rows = filteredAlerts.map(a => [
      a.id,
      a.category,
      a.severity,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.source.replace(/"/g, '""')}"`,
      a.zone,
      a.timestamp,
      a.status,
      `"${(a.metric || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Evegah_Alerts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Alert logs exported to CSV.');
  };

  // KPIs
  const stats = useMemo(() => {
    const critical = alerts.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length;
    const warning = alerts.filter(a => a.severity === 'Warning' && a.status !== 'Resolved').length;
    const geofence = alerts.filter(a => a.category === 'Geofence' && a.status !== 'Resolved').length;
    const battery = alerts.filter(a => a.category === 'Battery BMS' && a.status !== 'Resolved').length;
    const resolved = alerts.filter(a => a.status === 'Resolved').length;
    return { critical, warning, geofence, battery, resolved };
  }, [alerts]);

  // Filtered Alert List
  const filteredAlerts = useMemo(() => {
    return alerts.filter(item => {
      // Zone filter
      if (activeZone && activeZone !== 'All Zones' && activeZone !== 'Multiple Zones' && item.zone !== 'All Zones') {
        if (!item.zone.toLowerCase().includes(activeZone.toLowerCase())) return false;
      }
      // Tab filter
      if (activeFilter === 'Critical' && item.severity !== 'Critical') return false;
      if (activeFilter === 'Warning' && item.severity !== 'Warning') return false;
      if (activeFilter === 'Geofence' && item.category !== 'Geofence') return false;
      if (activeFilter === 'Battery' && item.category !== 'Battery BMS') return false;
      if (activeFilter === 'System' && item.category !== 'Station Hardware' && item.category !== 'Payment Gateway') return false;
      if (activeFilter === 'Resolved' && item.status !== 'Resolved') return false;

      // Severity select filter
      if (severityFilter !== 'All') {
        if (severityFilter === 'Critical' && item.severity !== 'Critical') return false;
        if (severityFilter === 'Warning' && item.severity !== 'Warning') return false;
        if (severityFilter === 'Info' && item.severity !== 'Info') return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          item.zone.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [alerts, activeFilter, activeZone, severityFilter, searchQuery]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap');

        .nr-shell {
          display: flex;
          min-height: 100vh;
          background: #F8FAFC;
          font-family: 'Inter', sans-serif;
          color: #0F172A;
        }

        .nr-main {
          margin-left: 230px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          flex: 1;
          min-width: 0;
          background: #F8FAFC;
        }

        .nr-page {
          flex: 1;
          padding: 20px 24px 60px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        @media (max-width: 1440px) {
          .nr-page {
            padding: 16px 20px 48px;
            gap: 16px;
          }
        }

        /* Breadcrumb */
        .nr-bc {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #64748B;
        }

        .nr-bc a {
          color: #64748B;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }

        .nr-bc a:hover {
          color: #2A195C;
        }

        .nr-bc-sep {
          color: #CBD5E1;
        }

        .nr-bc-cur {
          color: #2A195C;
          font-weight: 600;
        }

        /* Header row */
        .nr-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }

        .nr-h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nr-sub {
          font-size: 12.5px;
          color: #64748B;
          margin: 3px 0 0 0;
        }

        .action-btn-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nr-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 9px;
          font-size: 12.5px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .nr-btn:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
          color: #0F172A;
        }

        .nr-btn-primary {
          background: #2A195C;
          border-color: #2A195C;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(42, 25, 92, 0.25);
        }

        .nr-btn-primary:hover {
          background: #3B2382;
          border-color: #3B2382;
          color: #FFFFFF;
        }

        /* KPI Stat Cards Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        @media (max-width: 1200px) {
          .kpi-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }
        }

        .kpi-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
        }

        .kpi-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-icon-red {
          background: #FEF2F2;
          color: #EF4444;
          border: 1px solid #FECACA;
        }

        .kpi-icon-amber {
          background: #FFFBEB;
          color: #D97706;
          border: 1px solid #FDE68A;
        }

        .kpi-icon-purple {
          background: #FAF5FF;
          color: #7C3AED;
          border: 1px solid #E9D5FF;
        }

        .kpi-icon-cyan {
          background: #ECFEFF;
          color: #0891B2;
          border: 1px solid #A5F3FC;
        }

        .kpi-icon-green {
          background: #F0FDF4;
          color: #16A34A;
          border: 1px solid #BBF7D0;
        }

        .kpi-content {
          min-width: 0;
          flex: 1;
        }

        .kpi-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .kpi-value {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1.1;
          margin: 2px 0 1px;
        }

        .kpi-hint {
          font-size: 11px;
          color: #94A3B8;
          font-weight: 500;
        }

        /* Filter Controls Box */
        .filter-panel {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
        }

        .filter-tabs-row {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .filter-tab {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          background: #F1F5F9;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          border: none;
        }

        .filter-tab.active {
          background: #2A195C;
          color: #FFFFFF;
          box-shadow: 0 2px 5px rgba(42, 25, 92, 0.2);
        }

        .filter-tab:hover:not(.active) {
          background: #E2E8F0;
          color: #0F172A;
        }

        .filter-search-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          font-size: 12.5px;
          color: #0F172A;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }

        .search-input:focus {
          border-color: #2A195C;
        }

        .dropdown-select {
          padding: 8px 12px;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          font-size: 12.5px;
          color: #334155;
          font-weight: 500;
          background: #FFFFFF;
          outline: none;
          cursor: pointer;
        }

        /* Alert Feed List */
        .alerts-feed-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
          overflow: hidden;
        }

        .feed-header {
          padding: 14px 20px;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .feed-title {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-row {
          padding: 16px 20px;
          border-bottom: 1px solid #F1F5F9;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          transition: background 0.12s;
        }

        .alert-row:last-child {
          border-bottom: none;
        }

        .alert-row:hover {
          background: #F8FAFC;
        }

        .alert-main-col {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }

        .severity-pulse-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .pulse-critical {
          background: #EF4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
        }

        .pulse-warning {
          background: #F59E0B;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25);
        }

        .pulse-info {
          background: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
        }

        .pulse-resolved {
          background: #10B981;
        }

        .alert-info-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .alert-badge-line {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .alert-id-pill {
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          color: #2A195C;
          background: #F3E8FF;
          padding: 2px 7px;
          border-radius: 4px;
        }

        .category-pill {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          background: #F1F5F9;
          padding: 2px 7px;
          border-radius: 4px;
        }

        .zone-pill {
          font-size: 11px;
          font-weight: 600;
          color: #0284C7;
          background: #E0F2FE;
          padding: 2px 7px;
          border-radius: 4px;
        }

        .status-pill {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .status-open {
          background: #FEE2E2;
          color: #B91C1C;
        }

        .status-investigating {
          background: #FEF3C7;
          color: #B45309;
        }

        .status-resolved {
          background: #DCFCE7;
          color: #15803D;
        }

        .alert-title-text {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          margin: 2px 0 0 0;
        }

        .alert-desc-text {
          font-size: 12.5px;
          color: #475569;
          line-height: 1.45;
          margin: 0;
        }

        .alert-meta-line {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 11.5px;
          color: #64748B;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .meta-metric {
          color: #2A195C;
          font-weight: 600;
          background: #F8FAFC;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #E2E8F0;
        }

        /* Action Buttons on Right */
        .alert-actions-col {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-action-sm {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          border: 1px solid #CBD5E1;
          background: #FFFFFF;
          color: #334155;
        }

        .btn-action-sm:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
        }

        .btn-action-resolve {
          background: #ECFDF5;
          border-color: #A7F3D0;
          color: #059669;
        }

        .btn-action-resolve:hover {
          background: #D1FAE5;
          border-color: #6EE7B7;
        }

        .toast-banner {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0F172A;
          color: #FFFFFF;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <div className="nr-shell">
        <Sidebar activePath="/alerts" />
        <div className="nr-main">
          <TopBar
            title="Alerts & System Exceptions"
            subtitle="Real-time incident feed, battery anomalies, and geofence monitoring."
            showHand={false}
          />

          <div className="nr-page">
            {/* Breadcrumb */}
            <div className="nr-bc">
              <a href="/">Home</a>
              <span className="nr-bc-sep">&gt;</span>
              <a href="/alerts">Operations</a>
              <span className="nr-bc-sep">&gt;</span>
              <span className="nr-bc-cur">Live System Alerts</span>
            </div>

            {/* Title & Actions Row */}
            <div className="nr-title-row">
              <div>
                <h1 className="nr-h1">
                  Alerts &amp; Operational Exceptions
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '12px' }}>
                    Live Monitoring Active
                  </span>
                </h1>
                <p className="nr-sub">
                  Active monitoring across {activeZone} stations, fleet scooters, battery swappers, and network gateways.
                </p>
              </div>

              <div className="action-btn-group">
                <button className="nr-btn" onClick={handleExportCSV}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export CSV
                </button>
                <button className="nr-btn nr-btn-primary" onClick={handleMarkAllResolved}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Mark All Resolved
                </button>
              </div>
            </div>

            {/* Top KPI Cards Grid */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon-wrap kpi-icon-red">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="kpi-content">
                  <div className="kpi-label">Critical Alerts</div>
                  <div className="kpi-value">{stats.critical}</div>
                  <div className="kpi-hint">Requires immediate action</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap kpi-icon-amber">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="kpi-content">
                  <div className="kpi-label">Active Warnings</div>
                  <div className="kpi-value">{stats.warning}</div>
                  <div className="kpi-hint">Monitored thresholds</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap kpi-icon-purple">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="kpi-content">
                  <div className="kpi-label">Geofence Breaches</div>
                  <div className="kpi-value">{stats.geofence}</div>
                  <div className="kpi-hint">Boundary violations</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap kpi-icon-cyan">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="7" width="16" height="10" rx="2" />
                    <line x1="22" y1="11" x2="22" y2="13" />
                    <line x1="6" y1="11" x2="6" y2="13" />
                    <line x1="10" y1="11" x2="10" y2="13" />
                  </svg>
                </div>
                <div className="kpi-content">
                  <div className="kpi-label">Battery BMS Issues</div>
                  <div className="kpi-value">{stats.battery}</div>
                  <div className="kpi-hint">Thermal &amp; voltage cutoffs</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap kpi-icon-green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="kpi-content">
                  <div className="kpi-label">Resolved Today</div>
                  <div className="kpi-value">{stats.resolved}</div>
                  <div className="kpi-hint">Cleared incidents</div>
                </div>
              </div>
            </div>

            {/* Filter & Search Panel */}
            <div className="filter-panel">
              <div className="filter-tabs-row">
                {[
                  { key: 'All', label: `All Alerts (${alerts.length})` },
                  { key: 'Critical', label: `Critical (${stats.critical})` },
                  { key: 'Warning', label: `Warnings (${stats.warning})` },
                  { key: 'Geofence', label: `Geofence (${stats.geofence})` },
                  { key: 'Battery', label: `Battery BMS (${stats.battery})` },
                  { key: 'System', label: 'System & Gateway' },
                  { key: 'Resolved', label: `Resolved (${stats.resolved})` }
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveFilter(tab.key as any)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="filter-search-row">
                <div className="search-box">
                  <span className="search-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by Alert ID, Vehicle Plate, Rider, Zone, or Description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="dropdown-select"
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                  >
                    <option value="All">All Severities</option>
                    <option value="Critical">Critical Only</option>
                    <option value="Warning">Warnings Only</option>
                    <option value="Info">Info Only</option>
                  </select>

                  <select
                    className="dropdown-select"
                    value={activeZone}
                    onChange={(e) => setActiveZone(e.target.value)}
                  >
                    <option value="All Zones">All Zones</option>
                    <option value="Manjalpur Zone">Manjalpur Zone</option>
                    <option value="Gotri Zone">Gotri Zone</option>
                    <option value="KPGU Zone">KPGU Zone</option>
                    <option value="Aatapi Zone">Aatapi Zone</option>
                    <option value="South Depot">South Depot</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Alert Items Feed */}
            <div className="alerts-feed-card">
              <div className="feed-header">
                <div className="feed-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Incident Stream ({filteredAlerts.length} Events)
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                  Filtering: {activeFilter} &bull; Zone: {activeZone}
                </div>
              </div>

              {filteredAlerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>No Matching Alerts Found</div>
                  <div style={{ fontSize: '12.5px', marginTop: '4px' }}>All systems and monitored assets in this scope are operating within nominal limits.</div>
                </div>
              ) : (
                filteredAlerts.map(alert => {
                  const pulseClass =
                    alert.status === 'Resolved' ? 'pulse-resolved' :
                    alert.severity === 'Critical' ? 'pulse-critical' :
                    alert.severity === 'Warning' ? 'pulse-warning' : 'pulse-info';

                  const statusClass =
                    alert.status === 'Resolved' ? 'status-resolved' :
                    alert.status === 'Investigating' ? 'status-investigating' : 'status-open';

                  return (
                    <div className="alert-row" key={alert.id}>
                      <div className="alert-main-col">
                        <span className={`severity-pulse-dot ${pulseClass}`} />

                        <div className="alert-info-box">
                          <div className="alert-badge-line">
                            <span className="alert-id-pill">{alert.id}</span>
                            <span className="category-pill">{alert.category}</span>
                            <span className="zone-pill">{alert.zone}</span>
                            <span className={`status-pill ${statusClass}`}>{alert.status}</span>
                            <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: 'auto' }}>
                              {alert.timestamp}
                            </span>
                          </div>

                          <h3 className="alert-title-text">{alert.title}</h3>
                          <p className="alert-desc-text">{alert.description}</p>

                          <div className="alert-meta-line">
                            <div className="meta-item">
                              <strong>Source:</strong> {alert.source}
                            </div>
                            {alert.metric && (
                              <div className="meta-item">
                                <strong>Telemetry:</strong>
                                <span className="meta-metric">{alert.metric}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="alert-actions-col">
                        {alert.status === 'Open' && (
                          <button
                            className="btn-action-sm"
                            onClick={() => handleAcknowledge(alert.id)}
                            title="Mark as being investigated"
                          >
                            Acknowledge
                          </button>
                        )}
                        {alert.status !== 'Resolved' && (
                          <button
                            className="btn-action-sm btn-action-resolve"
                            onClick={() => handleResolve(alert.id)}
                            title="Mark incident resolved"
                          >
                            Resolve
                          </button>
                        )}
                        {alert.status === 'Resolved' && (
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="toast-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
