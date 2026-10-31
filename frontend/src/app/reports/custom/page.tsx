"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
.sa-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; }
.sa-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.sa-body { flex: 1; padding: 20px 24px 60px; display: flex; flex-direction: column; gap: 20px; }

.sa-sub-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-top: 4px; }
.sa-sub-title-group { display: flex; flex-direction: column; }
.sa-sub-title { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 4px; font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; }
.sa-sub-desc { font-size: 12.5px; color: #64748B; margin: 0; font-weight: 500; }

.sa-sub-right { display: flex; align-items: center; gap: 10px; }
.sa-date-box { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; font-weight: 600; color: #334155; cursor: pointer; }
.sa-export-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #6366F1; color: #fff; border: 1.5px solid #6366F1; border-radius: 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all .15s; box-shadow: 0 4px 12px rgba(99,102,241,0.25); }
.sa-export-btn:hover { background: #4f46e5; border-color: #4f46e5; }

/* Filter Configuration Card */
.cr-filter-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 14px; }
.cr-filter-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.cr-filter-field { display: flex; flex-direction: column; gap: 6px; }
.cr-lbl { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.03em; }
.cr-select { width: 100%; padding: 9px 12px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; font-weight: 600; outline: none; background: #fff; color: #334155; cursor: pointer; }
.cr-select:focus { border-color: #6366F1; }

.cr-metrics-row { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid #F1F5F9; }
.cr-cb-label { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: #334155; cursor: pointer; }
.cr-cb { width: 16px; height: 16px; accent-color: #6366F1; cursor: pointer; }

/* 5 KPI Row */
.sa-kpi-row-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.sa-kpi-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; box-shadow: 0 1px 3px rgba(0,0,0,.02); transition: all .15s; }
.sa-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.04); }
.sa-kpi-card-top { display: flex; align-items: center; justify-content: space-between; }
.sa-kpi-card-lbl { font-size: 10.5px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.03em; }
.sa-kpi-card-ic { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.sa-kpi-card-val { font-size: 24px; font-weight: 800; color: #0F172A; margin: 8px 0 4px; font-family: 'Outfit', sans-serif; }
.sa-kpi-card-bot { font-size: 11px; color: #94A3B8; font-weight: 500; display: flex; align-items: center; gap: 4px; }
.sa-kpi-card-trend-up { color: #10B981; font-weight: 700; }

/* 3 Column Grid for Charts */
.sa-row-1-grid { display: grid; grid-template-columns: 2.2fr 1.2fr; gap: 16px; }
.sa-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; overflow: hidden; }
.sa-card-hdr { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid #F1F5F9; }
.sa-card-title { font-size: 14px; font-weight: 800; color: #0F172A; font-family: 'Outfit', sans-serif; }
.sa-card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; position: relative; }

.sa-donut-wrap { position: relative; width: 130px; height: 130px; margin: 0 auto; }
.sa-donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; }
.sa-donut-num { font-size: 16px; font-weight: 800; color: #0F172A; font-family: 'Outfit', sans-serif; }
.sa-donut-lbl { font-size: 9px; color: #94A3B8; font-weight: 700; text-transform: uppercase; }

/* Table */
.sa-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12.5px; }
.sa-table th { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 18px; background: #FAFBFD; border-bottom: 1px solid #E2E8F0; }
.sa-table td { padding: 12px 18px; color: #334155; border-bottom: 1px solid #F1F5F9; }
.sa-table tr:hover td { background: #F8FAFC; }
.sa-badge { padding: 3px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; display: inline-block; }
.sa-badge-green { background: #DCFCE7; color: #15803D; }
`;

export default function CustomReportPage() {
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [metricCategory, setMetricCategory] = useState('Revenue & Fleet');
  const [groupBy, setGroupBy] = useState('Daily');

  useEffect(() => {
    const handleZoneChange = () => {
      const activeZone = localStorage.getItem('evegah_active_zone') || 'All Zones';
      setSelectedZone(activeZone);
    };
    handleZoneChange();
    window.addEventListener('evegah_zone_changed', handleZoneChange);
    return () => window.removeEventListener('evegah_zone_changed', handleZoneChange);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="sa-shell page-transition">
        <Sidebar activePath="/reports" />
        <div className="sa-main">
          <TopBar title="Custom Report Builder" subtitle="Super Admin Analytics & Custom Data Extractor" />

          <div className="sa-body">
            {/* Header */}
            <div className="sa-sub-header">
              <div className="sa-sub-title-group">
                <h2 className="sa-sub-title">Custom Analytics Dashboard</h2>
                <span className="sa-sub-desc">Generate tailored multi-zone reports, revenue telemetry, and fleet utilization insights</span>
              </div>
              <div className="sa-sub-right">
                <div className="sa-date-box">
                  <span>01 Jul 2026 - 31 Jul 2026</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
                </div>
                <button className="sa-export-btn" onClick={() => alert('Custom Report Exported to CSV!')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export CSV
                </button>
              </div>
            </div>

            {/* Filter Configuration Panel */}
            <div className="cr-filter-card">
              <div className="cr-filter-grid">
                <div className="cr-filter-field">
                  <label className="cr-lbl">Target Zone</label>
                  <select className="cr-select" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
                    <option value="All Zones">All Zones (Multi-Zone View)</option>
                    <option value="Gotri Zone">Gotri Zone</option>
                    <option value="Manjalpur Zone">Manjalpur Zone</option>
                    <option value="KPGU Zone">KPGU Zone</option>
                    <option value="Aatapi Zone">Aatapi Zone</option>
                    <option value="Moti Daman Zone">Moti Daman Zone</option>
                  </select>
                </div>

                <div className="cr-filter-field">
                  <label className="cr-lbl">Metric Category</label>
                  <select className="cr-select" value={metricCategory} onChange={(e) => setMetricCategory(e.target.value)}>
                    <option value="Revenue & Fleet">Revenue & Fleet Performance</option>
                    <option value="Battery Telemetry">Battery Telemetry & Swaps</option>
                    <option value="Rider Analytics">Rider Activity & Rentals</option>
                  </select>
                </div>

                <div className="cr-filter-field">
                  <label className="cr-lbl">Group By Dimension</label>
                  <select className="cr-select" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                    <option value="Daily">Daily Breakdown</option>
                    <option value="Weekly">Weekly Aggregation</option>
                    <option value="Monthly">Monthly Summary</option>
                  </select>
                </div>

                <div className="cr-filter-field">
                  <label className="cr-lbl">Report Format</label>
                  <select className="cr-select" defaultValue="Detailed Table + Charts">
                    <option>Detailed Table + Charts</option>
                    <option>Executive Summary PDF</option>
                    <option>Raw Telemetry Data CSV</option>
                  </select>
                </div>
              </div>

              <div className="cr-metrics-row">
                <span className="cr-lbl" style={{ marginRight: '8px' }}>Include Metrics:</span>
                <label className="cr-cb-label"><input type="checkbox" className="cr-cb" defaultChecked /> Gross Revenue</label>
                <label className="cr-cb-label"><input type="checkbox" className="cr-cb" defaultChecked /> Active Rentals</label>
                <label className="cr-cb-label"><input type="checkbox" className="cr-cb" defaultChecked /> Battery Swaps</label>
                <label className="cr-cb-label"><input type="checkbox" className="cr-cb" defaultChecked /> Fleet Utilization %</label>
                <label className="cr-cb-label"><input type="checkbox" className="cr-cb" defaultChecked /> Deposit Refunds</label>
              </div>
            </div>

            {/* 5 KPI Cards (Matching SuperAdmin UI) */}
            <div className="sa-kpi-row-5">
              {[
                {
                  label: 'Selected Zone',
                  val: selectedZone,
                  change: 'Active',
                  up: true,
                  bg: '#EEF2FF',
                  color: '#6366F1',
                  ic: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                },
                {
                  label: 'Total Revenue',
                  val: '₹4,85,600',
                  change: '14.8%',
                  up: true,
                  bg: '#ECFDF5',
                  color: '#10B981',
                  ic: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                },
                {
                  label: 'Total Rentals',
                  val: '1,420',
                  change: '9.2%',
                  up: true,
                  bg: '#EFF6FF',
                  color: '#2563EB',
                  ic: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                },
                {
                  label: 'Battery Swaps',
                  val: '984',
                  change: '12.1%',
                  up: true,
                  bg: '#FFF7ED',
                  color: '#F97316',
                  ic: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>
                },
                {
                  label: 'Fleet Utilization',
                  val: '78.4%',
                  change: '5.6%',
                  up: true,
                  bg: '#EEF2FF',
                  color: '#4F46E5',
                  ic: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                }
              ].map(k => (
                <div key={k.label} className="sa-kpi-card">
                  <div className="sa-kpi-card-top">
                    <span className="sa-kpi-card-lbl">{k.label}</span>
                    <span className="sa-kpi-card-ic" style={{ background: k.bg, color: k.color }}>{k.ic}</span>
                  </div>
                  <div className="sa-kpi-card-val"><AnimatedCount value={k.val} /></div>
                  <div className="sa-kpi-card-bot">
                    <span className="sa-kpi-card-trend-up">↑ {k.change}</span>
                    <span>vs prior period</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 2 Column Charts Row */}
            <div className="sa-row-1-grid">
              <div className="sa-card">
                <div className="sa-card-hdr">
                  <span className="sa-card-title">Custom Multi-Spline Telemetry ({selectedZone})</span>
                  <span style={{ fontSize: '11px', color: '#6366F1', fontWeight: '700' }}>• Real-Time Dataset</span>
                </div>
                <div className="sa-card-body" style={{ height: '220px' }}>
                  <Line
                    data={{
                      labels: ['01 Jul', '06 Jul', '11 Jul', '16 Jul', '21 Jul', '26 Jul', '31 Jul'],
                      datasets: [
                        { label: 'Revenue (₹)', data: [55, 82, 64, 78, 89, 94, 115], borderColor: '#6366F1', backgroundColor: 'rgba(99, 102, 241, 0.12)', fill: true, tension: 0.4 },
                        { label: 'Rentals Count', data: [32, 45, 40, 52, 60, 68, 85], borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.12)', fill: true, tension: 0.4 }
                      ]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' } } }}
                  />
                </div>
              </div>

              <div className="sa-card">
                <div className="sa-card-hdr">
                  <span className="sa-card-title">Category Revenue Share</span>
                </div>
                <div className="sa-card-body" style={{ justifyContent: 'center' }}>
                  <div className="sa-donut-wrap">
                    <Doughnut
                      data={{
                        labels: ['Scooters', 'Cargo EVs', 'E-Cycles'],
                        datasets: [{ data: [65, 24, 11], backgroundColor: ['#6366F1', '#3B82F6', '#10B981'] }]
                      }}
                      options={{ responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false } } }}
                    />
                    <div className="sa-donut-center">
                      <span className="sa-donut-num">₹4.85L</span>
                      <span className="sa-donut-lbl">Total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Custom Report Data Table */}
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Custom Report Data Matrix — {selectedZone}</span>
                <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '600' }}>Showing top 5 record breakdowns</span>
              </div>
              <div className="sa-card-body" style={{ padding: 0 }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Zone Name</th>
                      <th>Period</th>
                      <th>Active Fleet</th>
                      <th>Rentals Count</th>
                      <th>Battery Swaps</th>
                      <th>Gross Revenue (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { zone: 'Gotri Zone', period: 'Jul 2026', fleet: '180 EV', rentals: 420, swaps: 284, rev: '₹1,85,400', st: 'Verified' },
                      { zone: 'Aatapi Zone', period: 'Jul 2026', fleet: '145 EV', rentals: 380, swaps: 240, rev: '₹1,42,800', st: 'Verified' },
                      { zone: 'Manjalpur Zone', period: 'Jul 2026', fleet: '160 EV', rentals: 410, swaps: 310, rev: '₹1,57,400', st: 'Verified' }
                    ].map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {row.zone}
                        </td>
                        <td>{row.period}</td>
                        <td style={{ fontWeight: '600' }}>{row.fleet}</td>
                        <td>{row.rentals} rides</td>
                        <td>{row.swaps} swaps</td>
                        <td style={{ fontWeight: '800', color: '#0F172A' }}>{row.rev}</td>
                        <td><span className="sa-badge sa-badge-green">✓ {row.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
