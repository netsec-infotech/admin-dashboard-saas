"use client";
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.io-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.io-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.io-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* KPI Grid */
.io-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.io-stat-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.io-stat-ic { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
.ic-purple { background: #EEF2FF; color: #6366F1; }
.ic-green { background: #ECFDF5; color: #10B981; }
.ic-red { background: #FEF2F2; color: #EF4444; }
.ic-yellow { background: #FFF7ED; color: #F97316; }

.io-stat-info { min-width: 0; flex: 1; }
.io-stat-lbl { font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 2px; }
.io-stat-val { font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1; }

/* Filter bar panel */
.io-filter-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.io-filter-grid { display: grid; grid-template-columns: 2fr 1.2fr 1.2fr auto; gap: 10px; align-items: center; }
.io-search-wrap { position: relative; }
.io-search-input { width: 100%; padding: 8px 12px 8px 34px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; transition: border-color .15s; }
.io-search-input:focus { border-color: #6366F1; }
.io-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
.io-select { padding: 8px 10px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #334155; cursor: pointer; }
.io-select:focus { border-color: #6366F1; }
.io-reset-btn { padding: 8px 14px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #64748B; cursor: pointer; transition: all .15s; }
.io-reset-btn:hover { border-color: #6366F1; color: #6366F1; }

/* Table styling */
.io-tcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; }
.io-dt { width: 100%; border-collapse: collapse; }
.io-dt th { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .06em; text-align: left; padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
.io-dt td { padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.io-dt tr:last-child td { border-bottom: none; }
.io-dt tr:hover td { background: #F8FAFC; }

.sev-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.sev-critical { background: #FEE2E2; color: #EF4444; }
.sev-warning { background: #FFF7ED; color: #F97316; }
`;

export default function DeviceAlertsPage() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');

  const alerts = [
    { id: 'ALT-1002', device: 'IOT-9182', type: 'Geofence Breach', severity: 'critical', time: '2 min ago' },
    { id: 'ALT-1001', device: 'IOT-4821', type: 'Low Battery (10%)', severity: 'warning', time: '15 min ago' },
    { id: 'ALT-0998', device: 'IOT-3011', type: 'Over-speed warning (68 km/h)', severity: 'warning', time: '45 min ago' },
    { id: 'ALT-0997', device: 'IOT-8492', type: 'Temperature threshold exceeded', severity: 'critical', time: '1 hr ago' },
    { id: 'ALT-0995', device: 'IOT-2741', type: 'Sudden deceleraton trigger', severity: 'warning', time: '2 hrs ago' }
  ];

  const filtered = alerts.filter(a => {
    const matchesSearch = a.id.toLowerCase().includes(search.toLowerCase()) || a.device.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severity === 'all' || a.severity === severity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="io-shell">
        <Sidebar activePath="/iot-devices/alerts" />
        <div className="io-main">
          <TopBar title="Device Alerts" subtitle="Track live notifications and system exceptions from IoT telemetry." showHand={false} />
          
          <div className="io-page">
            <div className="io-stats-row">
              <div className="io-stat-card">
                <span className="io-stat-ic ic-red">🚨</span>
                <div className="io-stat-info">
                  <span className="io-stat-lbl">Active Alerts</span>
                  <span className="io-stat-val">34</span>
                </div>
              </div>
              <div className="io-stat-card">
                <span className="io-stat-ic ic-red">✗</span>
                <div className="io-stat-info">
                  <span className="io-stat-lbl">Critical</span>
                  <span className="io-stat-val">12</span>
                </div>
              </div>
              <div className="io-stat-card">
                <span className="io-stat-ic ic-yellow">⚠</span>
                <div className="io-stat-info">
                  <span className="io-stat-lbl">Warnings</span>
                  <span className="io-stat-val">22</span>
                </div>
              </div>
              <div className="io-stat-card">
                <span className="io-stat-ic ic-green">✓</span>
                <div className="io-stat-info">
                  <span className="io-stat-lbl">Resolved Today</span>
                  <span className="io-stat-val">45</span>
                </div>
              </div>
            </div>

            <div className="io-filter-card">
              <div className="io-filter-grid">
                <div className="io-search-wrap">
                  <input
                    type="text"
                    className="io-search-input"
                    placeholder="Search by Device ID, Alert ID, or Alert Type..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <span className="io-search-icon">🔍</span>
                </div>
                <select className="io-select" value={severity} onChange={e => setSeverity(e.target.value)}>
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                </select>
                <button className="io-reset-btn" onClick={() => { setSearch(''); setSeverity('all'); }}>Reset Filters</button>
              </div>
            </div>

            <div className="io-tcard">
              <table className="io-dt">
                <thead>
                  <tr>
                    <th>Alert ID</th>
                    <th>Device ID</th>
                    <th>Alert Type</th>
                    <th>Severity</th>
                    <th>Time Received</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: '700', color: '#EF4444' }}>{a.id}</td>
                      <td style={{ fontWeight: '600' }}>{a.device}</td>
                      <td style={{ fontWeight: '700' }}>{a.type}</td>
                      <td>
                        <span className={`sev-badge ${a.severity === 'critical' ? 'sev-critical' : 'sev-warning'}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', color: '#64748B' }}>{a.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
