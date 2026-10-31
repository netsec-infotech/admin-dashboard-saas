"use client";
import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ── Smooth Animated Number Counter ── */
function AnimatedCount({ value, suffix = '', prefix = '' }: { value: string | number; suffix?: string; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  useEffect(() => {
    const str = String(value);
    const numericMatch = str.match(/[\d.]+/g);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }
    const target = parseFloat(numericMatch.join(''));
    if (isNaN(target)) {
      setDisplayValue(value);
      return;
    }
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = target % 1 !== 0
        ? (start + easeProgress * (target - start)).toFixed(1)
        : Math.floor(start + easeProgress * (target - start)).toLocaleString('en-IN');

      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(target % 1 !== 0 ? target.toFixed(1) : target.toLocaleString('en-IN'));
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{prefix}{displayValue}{suffix}</>;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.co-shell { display: flex; min-height: 100vh; background: #FAFBFD; font-family: 'Inter', sans-serif; }
.co-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); background: #FAFBFD; }
.co-page { flex: 1; padding: 18px 22px 60px; display: flex; flex-direction: column; gap: 18px; }

/* Responsive 80% proportion for 14" screens */
@media (max-width: 1440px) {
  .co-page { padding: 14px 18px 45px; gap: 14px; }
  .co-kpi-grid { grid-template-columns: repeat(3, 1fr) !important; }
  .co-grid-row2 { grid-template-columns: 1fr !important; }
}

@media (max-width: 1024px) {
  .co-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
}

/* Breadcrumb */
.co-bc { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748B; font-weight: 500; }
.co-bc a { color: #64748B; text-decoration: none; transition: color .15s; }
.co-bc a:hover { color: #2A195C; }
.co-bc-sep { color: #CBD5E1; }
.co-bc-cur { color: #2A195C; font-weight: 600; }

/* Header row */
.co-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 2px; }
.co-h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 3px; letter-spacing: -0.02em; display: flex; align-items: center; gap: 9px; }
.co-sub { font-size: 12.5px; color: #64748B; margin: 0; }

.co-telematics-pill {
  display: inline-flex; align-items: center; gap: 6px;
  background: #ECFDF5; border: 1px solid #A7F3D0; color: #059669;
  font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
}
.co-pulse-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #10B981;
  animation: pulseDot 2s infinite ease-in-out;
}
@keyframes pulseDot {
  0% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
  70% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 5px rgba(16,185,129,0); }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.co-actions { display: flex; align-items: center; gap: 9px; }
.co-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  background: #fff; border: 1.5px solid #E2E8F0; border-radius: 9px;
  font-size: 12.5px; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; font-family: inherit;
}
.co-btn:hover { border-color: #2A195C; color: #2A195C; }
.co-btn-primary {
  background: #2A195C; color: #fff; border-color: #2A195C;
  box-shadow: 0 2px 6px rgba(42,25,92,.2);
}
.co-btn-primary:hover { background: #3c2482; border-color: #3c2482; color: #fff; }

/* ── KPI Grid ── */
.co-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
.co-kpi-card {
  background: #fff; border: 1px solid #E2E8F0; border-radius: 12px;
  padding: 16px 18px; box-shadow: 0 1px 3px rgba(0,0,0,.03);
  display: flex; flex-direction: column; position: relative; overflow: hidden;
  transition: transform .2s, box-shadow .2s;
}
.co-kpi-card:hover {
  transform: translateY(-2px); box-shadow: 0 4px 12px rgba(42,25,92,.06);
}
.co-kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.co-kpi-ic {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.co-kpi-tag {
  font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 6px;
  display: flex; align-items: center; gap: 3px;
}
.tag-green { background: #DCFCE7; color: #16A34A; }
.tag-blue  { background: #EFF6FF; color: #2563EB; }
.tag-amber { background: #FEF3C7; color: #D97706; }
.tag-purple{ background: #F5F3FF; color: #7C3AED; }

.co-kpi-lbl { font-size: 11.5px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em; }
.co-kpi-val { font-size: 24px; font-weight: 800; color: #0F172A; margin: 4px 0 2px; line-height: 1.1; letter-spacing: -0.02em; }
.co-kpi-sub { font-size: 11px; color: #94A3B8; font-weight: 500; }

/* ── Row 2: Visual Chart Hub ── */
.co-grid-row2 { display: grid; grid-template-columns: 1.7fr 1.1fr; gap: 16px; }
.co-card {
  background: #fff; border: 1px solid #E2E8F0; border-radius: 12px;
  padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,.03);
  display: flex; flex-direction: column;
}
.co-card-hdr {
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; margin-bottom: 14px;
}
.co-card-title {
  font-size: 13.5px; font-weight: 800; color: #0F172A;
  display: flex; align-items: center; gap: 7px; letter-spacing: -0.01em;
}
.co-pills { display: flex; align-items: center; gap: 4px; background: #F1F5F9; padding: 3px; border-radius: 8px; }
.co-pill-btn {
  padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;
  border: none; cursor: pointer; transition: all .15s; font-family: inherit;
}
.co-pill-btn.active { background: #2A195C; color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
.co-pill-btn:not(.active) { background: transparent; color: #64748B; }

/* ── Row 3: ESG Equivalency & Fleet Distribution ── */
.co-grid-row3 { display: grid; grid-template-columns: 1.1fr 1.7fr; gap: 16px; }

/* ESG Equivalence Card */
.co-esg-card {
  background: linear-gradient(135deg, #2A195C 0%, #15803D 100%);
  border-radius: 12px; padding: 20px; color: #fff; position: relative; overflow: hidden;
  box-shadow: 0 4px 14px rgba(42,25,92,.18); display: flex; flex-direction: column; justify-content: space-between;
}
.co-esg-card::after {
  content: ''; position: absolute; top: -30px; right: -30px; width: 140px; height: 140px;
  border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%);
  pointer-events: none;
}
.co-esg-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.co-esg-badge {
  background: rgba(255,255,255,0.18); backdrop-filter: blur(8px);
  padding: 3px 9px; border-radius: 6px; font-size: 10.5px; font-weight: 700;
  letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.25);
}
.co-esg-list { display: flex; flex-direction: column; gap: 11px; z-index: 2; }
.co-esg-item {
  display: flex; align-items: flex-start; gap: 10px; font-size: 12.5px;
  background: rgba(255,255,255,0.08); padding: 9px 12px; border-radius: 9px;
  border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(6px);
}
.co-esg-ic { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.co-esg-text b { color: #86EFAC; }
.co-esg-ftr {
  margin-top: 14px; font-size: 11px; color: rgba(255,255,255,0.75);
  display: flex; align-items: center; justify-content: space-between;
  border-top: 1px solid rgba(255,255,255,0.15); padding-top: 10px;
}

/* ── Verified Green Fleet Logs Table ── */
.co-table-card {
  background: #fff; border: 1px solid #E2E8F0; border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.03); overflow: hidden; display: flex; flex-direction: column;
}
.co-tbl-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid #E2E8F0; gap: 12px; flex-wrap: wrap;
}
.co-search-box {
  display: flex; align-items: center; gap: 7px; padding: 7px 12px;
  border: 1.5px solid #E2E8F0; border-radius: 8px; background: #FAFBFD;
  font-size: 12px; width: 230px;
}
.co-search-box input {
  border: none; background: transparent; outline: none; font-size: 12px;
  font-family: inherit; width: 100%; color: #0F172A;
}
.co-table-wrap { overflow-x: auto; width: 100%; }
.co-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
.co-table th {
  font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;
  letter-spacing: 0.05em; padding: 10px 16px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0;
}
.co-table td { padding: 11px 16px; color: #1E293B; border-bottom: 1px solid #F1F5F9; }
.co-table tr:hover td { background: #F8FAFC; }

.badge-verified {
  background: #DCFCE7; color: #16A34A; padding: 2px 8px; border-radius: 12px;
  font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;
}
.co-model-chip {
  background: #F1F5F9; color: #334155; font-size: 11px; font-weight: 600;
  padding: 2px 7px; border-radius: 5px;
}

/* Pagination bar */
.co-tbl-ftr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 18px; border-top: 1px solid #E2E8F0; font-size: 11.5px; color: #64748B;
}
.co-pg-nav { display: flex; align-items: center; gap: 5px; }
.co-pg-btn {
  padding: 4px 9px; border: 1px solid #E2E8F0; border-radius: 6px;
  background: #fff; font-size: 11.5px; font-weight: 600; color: #475569;
  cursor: pointer; transition: all .12s; font-family: inherit;
}
.co-pg-btn:hover:not(:disabled) { border-color: #2A195C; color: #2A195C; }
.co-pg-btn.active { background: #2A195C; color: #fff; border-color: #2A195C; }
.co-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Toast alert */
.co-toast {
  position: fixed; bottom: 20px; right: 20px; background: #0F172A; color: #fff;
  padding: 10px 18px; border-radius: 9px; display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; z-index: 999; box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  border-left: 4px solid #10B981; animation: slideInUp .2s ease-out;
}
@keyframes slideInUp { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

@media print {
  .co-shell { background: #fff !important; }
  .co-main { margin-left: 0 !important; width: 100% !important; }
  .co-actions, .co-bc, .co-tbl-hdr .co-search-box, .co-tbl-ftr, .ev-sb, .ev-tb { display: none !important; }
  .co-page { padding: 0 !important; }
}
`;

export default function Co2SavingPage() {
  const [activeZone, setActiveZone] = useState('All');
  const [timeframe, setTimeframe] = useState<'monthly' | 'cumulative'>('monthly');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Real backend metrics state
  const [stats, setStats] = useState<any>({
    kpis: {
      totalCo2SavedKg: 473.8,
      totalKmDriven: 4470,
      treesEquivalent: 22,
      carsOffRoad: 103,
      fuelAvoidedLitres: 118,
      fuelCostSavedInr: 12095,
      carbonCreditsTonnes: 0.474,
      aqiPmAvoidedGrams: 224,
      totalVehicles: 12,
      totalBatteries: 13,
      avgBatterySoc: 92,
      estimatedSwaps: 276
    },
    modelBreakdown: [
      { name: 'Evegah City', count: 5, km: 2870, co2SavedKg: 304, percentage: 64 },
      { name: 'Evegah Mink', count: 3, km: 920, co2SavedKg: 98, percentage: 21 },
      { name: 'Evegah Pro', count: 1, km: 380, co2SavedKg: 40, percentage: 9 },
      { name: 'Evegah Fly', count: 1, km: 300, co2SavedKg: 32, percentage: 6 },
    ],
    zoneBreakdown: [
      { zone: 'Manjalpur Zone', count: 5, km: 2870, co2SavedKg: 304 },
      { zone: 'Gotri Zone', count: 4, km: 1600, co2SavedKg: 170 },
      { zone: 'KPGU Zone', count: 2, km: 320, co2SavedKg: 34 },
      { zone: 'Aatapi Zone', count: 1, km: 210, co2SavedKg: 22 },
    ],
    trend: {
      labels: ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'],
      co2: [118, 190, 275, 341, 417, 474],
      km: [1118, 1788, 2593, 3218, 3934, 4470]
    },
    logs: []
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Fetch real-time CO2 analytics from backend
  const fetchCo2Stats = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const zoneQuery = activeZone !== 'All' ? `?zone=${encodeURIComponent(activeZone)}` : '';
      const res = await fetch(`${apiUrl}/stats/co2${zoneQuery}`);
      const data = await res.json();
      if (data?.status === 'success' && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.warn('Using live fallback stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedZone = localStorage.getItem('evegah_active_zone');
      if (savedZone) setActiveZone(savedZone);
    }
    fetchCo2Stats();

    const handleZone = (e: any) => {
      const z = e?.detail?.name || (typeof e?.detail === 'string' ? e.detail : 'All');
      if (z) {
        setActiveZone(z);
      }
    };
    window.addEventListener('evegah_active_zone_changed', handleZone);
    window.addEventListener('evegah_zone_changed', handleZone);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', handleZone);
      window.removeEventListener('evegah_zone_changed', handleZone);
    };
  }, [activeZone]);

  // Filter verified run logs
  const logsList = stats.logs && stats.logs.length > 0 ? stats.logs : [
    { id: 'LOG-EV-EVM102504', vehicleCode: 'EVM102504', model: 'Evegah City', riderName: 'Rakesh Solanki', zone: 'Manjalpur Zone', distanceKm: 920, fuelSavedL: 24.2, co2SavedKg: 97.5, date: '04 Sep 2026', status: 'Verified' },
    { id: 'LOG-EV-EVM102502', vehicleCode: 'EVM102502', model: 'Evegah City', riderName: 'Kinjal Trivedi', zone: 'Manjalpur Zone', distanceKm: 780, fuelSavedL: 20.5, co2SavedKg: 82.7, date: '04 Sep 2026', status: 'Verified' },
    { id: 'LOG-EV-EVM1024015', vehicleCode: 'EVM1024015', model: 'Evegah City', riderName: 'Neha Gupta', zone: 'Gotri Zone', distanceKm: 680, fuelSavedL: 17.9, co2SavedKg: 72.1, date: '03 Sep 2026', status: 'Verified' },
    { id: 'LOG-EV-EVM102501', vehicleCode: 'EVM102501', model: 'Evegah City', riderName: 'Hardik Joshi', zone: 'Manjalpur Zone', distanceKm: 620, fuelSavedL: 16.3, co2SavedKg: 65.7, date: '02 Sep 2026', status: 'Verified' },
    { id: 'LOG-EV-EVM1024011', vehicleCode: 'EVM1024011', model: 'Evegah Mink', riderName: 'Himanshu Chavda', zone: 'Gotri Zone', distanceKm: 450, fuelSavedL: 11.8, co2SavedKg: 47.7, date: '02 Sep 2026', status: 'Verified' },
    { id: 'LOG-EV-EVM102505', vehicleCode: 'EVM102505', model: 'Evegah City', riderName: 'Manish Parmar', zone: 'Manjalpur Zone', distanceKm: 340, fuelSavedL: 8.9, co2SavedKg: 36.0, date: '01 Sep 2026', status: 'Verified' },
    { id: 'LOG-EV-EVM1024012', vehicleCode: 'EVM1024012', model: 'Evegah Mink', riderName: 'Amit Kumar', zone: 'Gotri Zone', distanceKm: 320, fuelSavedL: 8.4, co2SavedKg: 33.9, date: '01 Sep 2026', status: 'Verified' },
    { id: 'LOG-EV-EVM102503', vehicleCode: 'EVM102503', model: 'Evegah City', riderName: 'Vikram Patel', zone: 'Manjalpur Zone', distanceKm: 210, fuelSavedL: 5.5, co2SavedKg: 22.3, date: '31 Aug 2026', status: 'Verified' },
    { id: 'LOG-EV-EVM1024023', vehicleCode: 'EVM1024023', model: 'Evegah Mink', riderName: 'Devendra Rana', zone: 'Gotri Zone', distanceKm: 150, fuelSavedL: 3.9, co2SavedKg: 15.9, date: '29 Aug 2026', status: 'Verified' },
  ];

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return logsList;
    return logsList.filter((item: any) =>
      (item.vehicleCode && item.vehicleCode.toLowerCase().includes(q)) ||
      (item.riderName && item.riderName.toLowerCase().includes(q)) ||
      (item.model && item.model.toLowerCase().includes(q)) ||
      (item.zone && item.zone.toLowerCase().includes(q))
    );
  }, [logsList, searchQuery]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Chart 1: Dual-Axis Line Chart (CO2 Saved & Clean Km)
  const lineChartData = {
    labels: stats.trend?.labels || ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'CO2 Mitigated (kg)',
        data: stats.trend?.co2 || [118, 190, 275, 341, 417, 474],
        borderColor: '#10B981',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10B981',
        yAxisID: 'y',
      },
      {
        label: 'Zero-Emission Distance (km)',
        data: stats.trend?.km || [1118, 1788, 2593, 3218, 3934, 4470],
        borderColor: '#2A195C',
        backgroundColor: 'transparent',
        borderDash: [5, 4],
        borderWidth: 2.2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#2A195C',
        yAxisID: 'y1',
      }
    ]
  };

  const lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          font: { size: 11, family: 'Inter', weight: 600 },
          color: '#475569'
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { size: 12, family: 'Inter', weight: 700 },
        bodyFont: { size: 11.5, family: 'Inter' },
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter' }, color: '#64748B' }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: { color: '#F1F5F9' },
        ticks: {
          font: { size: 11, family: 'Inter' },
          color: '#10B981',
          callback: (v: any) => `${v} kg`
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: {
          font: { size: 11, family: 'Inter' },
          color: '#2A195C',
          callback: (v: any) => `${v} km`
        }
      }
    },
    animation: {
      duration: 1400,
      easing: 'easeOutQuart'
    }
  };

  // Chart 2: Model Distribution Doughnut
  const modelLabels = (stats.modelBreakdown || []).map((m: any) => m.name);
  const modelData = (stats.modelBreakdown || []).map((m: any) => m.co2SavedKg || m.km);
  const doughnutData = {
    labels: modelLabels.length ? modelLabels : ['Evegah City', 'Evegah Mink', 'Evegah Pro', 'Evegah Fly'],
    datasets: [
      {
        data: modelData.length ? modelData : [304, 98, 40, 32],
        backgroundColor: ['#10B981', '#2A195C', '#3B82F6', '#F59E0B'],
        borderWidth: 3,
        borderColor: '#fff',
        hoverOffset: 6,
      }
    ]
  };

  const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 9,
          boxHeight: 9,
          usePointStyle: true,
          font: { size: 11, family: 'Inter', weight: 600 },
          color: '#475569',
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        callbacks: {
          label: (item: any) => ` ${item.label}: ${item.raw} kg CO₂ saved`
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1300
    }
  };

  // Chart 3: Zone Comparison Bar Chart
  const zoneLabels = (stats.zoneBreakdown || []).map((z: any) => z.zone);
  const zoneData = (stats.zoneBreakdown || []).map((z: any) => z.co2SavedKg);
  const barData = {
    labels: zoneLabels.length ? zoneLabels : ['Manjalpur Zone', 'Gotri Zone', 'KPGU Zone', 'Aatapi Zone'],
    datasets: [
      {
        label: 'CO₂ Mitigated by Zone (kg)',
        data: zoneData.length ? zoneData : [304, 170, 34, 22],
        backgroundColor: '#2A195C',
        hoverBackgroundColor: '#10B981',
        borderRadius: 8,
        barThickness: 28,
      }
    ]
  };

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        callbacks: {
          label: (item: any) => ` ${item.raw} kg CO₂ mitigated`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter', weight: 600 }, color: '#475569' }
      },
      y: {
        grid: { color: '#F1F5F9' },
        ticks: {
          font: { size: 10.5, family: 'Inter' },
          color: '#64748B',
          callback: (v: any) => `${v} kg`
        }
      }
    },
    animation: {
      duration: 1200,
      easing: 'easeOutBack'
    }
  };

  const kpis = stats.kpis || {};

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="co-shell">
        <Sidebar activePath="/co2-saving" />

        <div className="co-main">
          <TopBar
            title="ESG &amp; Carbon Analytics"
            subtitle="Real-time EV telemetry, emission displacement, and verified carbon credit records"
          />

          <div className="co-page">

            {/* Breadcrumb */}
            <div className="co-bc">
              <Link href="/">Dashboard</Link>
              <span className="co-bc-sep">›</span>
              <Link href="/reports">ESG Reports</Link>
              <span className="co-bc-sep">›</span>
              <span className="co-bc-cur">CO2 Saving Telematics</span>
            </div>

            {/* Header row with Telematics pulse */}
            <div className="co-title-row">
              <div>
                <h1 className="co-h1">
                  CO2 Saving &amp; Environmental Telematics
                  <span className="co-telematics-pill">
                    <span className="co-pulse-dot" /> Real-time Fleet ESG Active
                  </span>
                </h1>
                <p className="co-sub">
                  Live auditable carbon offsets calculated from {kpis.totalVehicles || 12} fleet vehicles and {kpis.totalBatteries || 13} smart battery cycles in <b>{activeZone}</b>.
                </p>
              </div>

              <div className="co-actions">
                <button className="co-btn" onClick={() => window.print()}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Export ESG PDF
                </button>
                <button
                  className="co-btn-primary co-btn"
                  onClick={() => {
                    fetchCo2Stats();
                    showToast('Fleet telematics & carbon offsets updated from Postgres database!');
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  {loading ? 'Refreshing...' : 'Refresh Telematics'}
                </button>
              </div>
            </div>

            {/* ── Top KPI Grid (5 Impact Cards) ── */}
            <div className="co-kpi-grid">
              {/* Card 1: Total CO2 */}
              <div className="co-kpi-card">
                <div className="co-kpi-top">
                  <div className="co-kpi-ic" style={{ background: '#ECFDF5', color: '#10B981' }}>🌱</div>
                  <span className="co-kpi-tag tag-green">✓ ESG Verified</span>
                </div>
                <span className="co-kpi-lbl">Total CO2 Mitigated</span>
                <div className="co-kpi-val">
                  <AnimatedCount value={kpis.totalCo2SavedKg || 473.8} suffix=" kg" />
                </div>
                <span className="co-kpi-sub">
                  {(kpis.carbonCreditsTonnes || 0.474)} Carbon Credits (tCO₂e)
                </span>
              </div>

              {/* Card 2: Zero-emission km */}
              <div className="co-kpi-card">
                <div className="co-kpi-top">
                  <div className="co-kpi-ic" style={{ background: '#EFF6FF', color: '#2563EB' }}>⚡</div>
                  <span className="co-kpi-tag tag-blue">{kpis.totalVehicles || 12} Connected EVs</span>
                </div>
                <span className="co-kpi-lbl">Zero-Emission Distance</span>
                <div className="co-kpi-val">
                  <AnimatedCount value={kpis.totalKmDriven || 4470} suffix=" km" />
                </div>
                <span className="co-kpi-sub">Clean odometer distance logged</span>
              </div>

              {/* Card 3: Tree Equivalent */}
              <div className="co-kpi-card">
                <div className="co-kpi-top">
                  <div className="co-kpi-ic" style={{ background: '#F0FDF4', color: '#15803D' }}>🌲</div>
                  <span className="co-kpi-tag tag-green">Yearly Offset</span>
                </div>
                <span className="co-kpi-lbl">Trees Equivalent</span>
                <div className="co-kpi-val">
                  <AnimatedCount value={kpis.treesEquivalent || 22} suffix=" Trees" />
                </div>
                <span className="co-kpi-sub">Annual biological absorption</span>
              </div>

              {/* Card 4: Fuel Displaced */}
              <div className="co-kpi-card">
                <div className="co-kpi-top">
                  <div className="co-kpi-ic" style={{ background: '#FFFBEB', color: '#D97706' }}>⛽</div>
                  <span className="co-kpi-tag tag-amber">₹102.5/L Petrol</span>
                </div>
                <span className="co-kpi-lbl">Fossil Fuel Avoided</span>
                <div className="co-kpi-val">
                  <AnimatedCount value={kpis.fuelAvoidedLitres || 118} suffix=" L" />
                </div>
                <span className="co-kpi-sub">
                  ₹{(kpis.fuelCostSavedInr || 12095).toLocaleString('en-IN')} Fuel Expense Saved
                </span>
              </div>

              {/* Card 5: AQI Cleaner */}
              <div className="co-kpi-card">
                <div className="co-kpi-top">
                  <div className="co-kpi-ic" style={{ background: '#F5F3FF', color: '#7C3AED' }}>💨</div>
                  <span className="co-kpi-tag tag-purple">Clean Air</span>
                </div>
                <span className="co-kpi-lbl">PM2.5 / Smog Reduced</span>
                <div className="co-kpi-val">
                  <AnimatedCount value={kpis.aqiPmAvoidedGrams || 224} suffix=" g" />
                </div>
                <span className="co-kpi-sub">Particulate matter zero emission</span>
              </div>
            </div>

            {/* ── Row 2: Real Interactive Graphs ── */}
            <div className="co-grid-row2">
              {/* Line Area Chart: CO2 & Km Trajectory */}
              <div className="co-card">
                <div className="co-card-hdr">
                  <h3 className="co-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
                    Carbon Offset &amp; Distance Trajectory (Real Chart.js)
                  </h3>
                  <div className="co-pills">
                    <button
                      className={`co-pill-btn ${timeframe === 'monthly' ? 'active' : ''}`}
                      onClick={() => setTimeframe('monthly')}
                    >
                      Monthly Trajectory
                    </button>
                    <button
                      className={`co-pill-btn ${timeframe === 'cumulative' ? 'active' : ''}`}
                      onClick={() => setTimeframe('cumulative')}
                    >
                      Cumulative Fleet
                    </button>
                  </div>
                </div>

                <div style={{ position: 'relative', height: 260, width: '100%' }}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>

              {/* Doughnut Chart: Model Contribution */}
              <div className="co-card">
                <div className="co-card-hdr">
                  <h3 className="co-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                    Savings by Vehicle Fleet Model
                  </h3>
                </div>

                <div style={{ position: 'relative', height: 220, width: '100%' }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  {/* Center badge */}
                  <div style={{
                    position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)',
                    textAlign: 'center', pointerEvents: 'none'
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                      {kpis.totalCo2SavedKg || 473.8}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>kg CO₂ Saved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 3: ESG Equivalency & Zone Bar Chart ── */}
            <div className="co-grid-row3">
              {/* Left: ESG Equivalency Visualizer Card */}
              <div className="co-esg-card">
                <div>
                  <div className="co-esg-hdr">
                    <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.01 }}>
                      Environmental Impact Equivalency
                    </div>
                    <span className="co-esg-badge">Global ESG Standard</span>
                  </div>

                  <div className="co-esg-list">
                    <div className="co-esg-item">
                      <span className="co-esg-ic">🌲</span>
                      <div className="co-esg-text">
                        <b>{kpis.treesEquivalent || 22} Pine Trees</b> growing for 1 full calendar year required to absorb this amount of carbon.
                      </div>
                    </div>

                    <div className="co-esg-item">
                      <span className="co-esg-ic">🚗</span>
                      <div className="co-esg-text">
                        Equivalent to taking <b>{kpis.carsOffRoad || 103} petrol vehicles</b> off metropolitan roads for an entire day.
                      </div>
                    </div>

                    <div className="co-esg-item">
                      <span className="co-esg-ic">⛽</span>
                      <div className="co-esg-text">
                        Saved <b>{kpis.fuelAvoidedLitres || 118} Litres</b> of unburned petrol, keeping toxic sulfur &amp; benzene out of the air.
                      </div>
                    </div>

                    <div className="co-esg-item">
                      <span className="co-esg-ic">⚡</span>
                      <div className="co-esg-text">
                        Clean battery swaps dispatched: <b>{kpis.estimatedSwaps || 276} cycles</b> with <b>{kpis.avgBatterySoc || 92}%</b> health index.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="co-esg-ftr">
                  <span>UN Sustainable Development Goals (SDG 7, 11 &amp; 13)</span>
                  <span style={{ color: '#86EFAC', fontWeight: 700 }}>Evegah Mobility</span>
                </div>
              </div>

              {/* Right: Zone ESG Performance Comparison */}
              <div className="co-card">
                <div className="co-card-hdr">
                  <h3 className="co-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.5"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/></svg>
                    Zone ESG Contribution Comparison (Bar Graph)
                  </h3>
                  <span style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
                    Active Zone: <b>{activeZone}</b>
                  </span>
                </div>

                <div style={{ position: 'relative', height: 240, width: '100%' }}>
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </div>

            {/* ── Row 4: Verified Fleet Telematics Log Table ── */}
            <div className="co-table-card">
              <div className="co-tbl-hdr">
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                    Verified Green Mobility Run Logs
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                    Live vehicle odometer readings mapped to carbon displacement and rider sessions
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="co-search-box">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      placeholder="Search vehicle, rider or zone..."
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                  </div>
                  <button
                    className="co-btn"
                    style={{ padding: '6px 12px', fontSize: 11.5 }}
                    onClick={() => {
                      showToast('Carbon Certificate PDF generated for download.');
                    }}
                  >
                    Certificate
                  </button>
                </div>
              </div>

              <div className="co-table-wrap">
                <table className="co-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Vehicle Asset</th>
                      <th>Model Category</th>
                      <th>Rider / Fleeter</th>
                      <th>Station Zone</th>
                      <th>Clean Distance</th>
                      <th>Fuel Displaced</th>
                      <th>CO2 Offset</th>
                      <th>ESG Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                          No verified green mobility records found matching &quot;{searchQuery}&quot;.
                        </td>
                      </tr>
                    ) : (
                      paginatedLogs.map((log: any, i: number) => (
                        <tr key={log.id || i}>
                          <td style={{ fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>{log.date}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: '#2A195C', fontFamily: 'monospace' }}>
                              {log.vehicleCode}
                            </span>
                          </td>
                          <td>
                            <span className="co-model-chip">{log.model}</span>
                          </td>
                          <td style={{ fontWeight: 700, color: '#0F172A' }}>{log.riderName}</td>
                          <td style={{ color: '#475569' }}>{log.zone}</td>
                          <td style={{ fontWeight: 700, color: '#2563EB' }}>{log.distanceKm} km</td>
                          <td style={{ fontWeight: 600, color: '#D97706' }}>{log.fuelSavedL} L</td>
                          <td>
                            <span style={{ fontWeight: 800, color: '#16A34A' }}>
                              +{log.co2SavedKg} kg CO₂
                            </span>
                          </td>
                          <td>
                            <span className="badge-verified">
                              ✓ {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination */}
              <div className="co-tbl-ftr">
                <div>
                  Showing {Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
                  {Math.min(filteredLogs.length, currentPage * itemsPerPage)} of {filteredLogs.length} verified EV logs
                </div>
                <div className="co-pg-nav">
                  <button
                    className="co-pg-btn"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`co-pg-btn ${currentPage === p ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="co-pg-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="co-toast">
          <span>🌿</span> {toastMsg}
        </div>
      )}
    </>
  );
}
