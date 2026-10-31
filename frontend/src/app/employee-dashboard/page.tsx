'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ActiveRide {
  id: string;
  riderName: string;
  riderPhone: string;
  bikePlate: string;
  model: string;
  startTime: string;
  dueTime: string;
  status: 'Active' | 'Overdue' | 'Due Soon';
  dueAmount: number;
}

export default function EmployeeDashboard() {
  const router = useRouter();

  // Employee details
  const [employeeName, setEmployeeName] = useState('Priyansh Shah');
  const [employeeZone, setEmployeeZone] = useState('Gotri Zone');
  const [employeeId, setEmployeeId] = useState('EVG-EMP-104');
  const [shiftDuration, setShiftDuration] = useState('04h 32m 18s');
  const [activeVelocityTab, setActiveVelocityTab] = useState<'today' | 'week'>('today');

  // Modals
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOverdueRide, setSelectedOverdueRide] = useState<ActiveRide | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'ICICI Link'>('UPI');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Exchange form
  const [exchangeOldBike, setExchangeOldBike] = useState('GJ-06-EV-1042');
  const [exchangeNewBike, setExchangeNewBike] = useState('GJ-06-EV-2098');
  const [exchangeReason, setExchangeReason] = useState('Low Battery / Urgent Replacement');
  const [exchangeOdometer, setExchangeOdometer] = useState('14,250 km');
  const [exchangeSuccess, setExchangeSuccess] = useState(false);

  // Shift KPIs
  const [shiftStats, setShiftStats] = useState({
    dispatched: 12,
    retained: 7,
    batterySwaps: 24,
    returned: 9,
    duesCollected: 16500,
    activeYardVehicles: 38,
    chargingBatteries: 18
  });

  // Overdue / Due payment rides
  const [dueRides, setDueRides] = useState<ActiveRide[]>([
    {
      id: 'RD-9021',
      riderName: 'Rahul Varma',
      riderPhone: '+91 98765 11223',
      bikePlate: 'GJ-06-EV-1042',
      model: 'Evegah City',
      startTime: 'Today, 09:00 AM',
      dueTime: 'Today, 02:00 PM',
      status: 'Overdue',
      dueAmount: 350
    },
    {
      id: 'RD-9024',
      riderName: 'Kunal Patel',
      riderPhone: '+91 98240 55441',
      bikePlate: 'GJ-06-EV-3011',
      model: 'Evegah Pro',
      startTime: 'Yesterday, 10:00 AM',
      dueTime: 'Today, 10:00 AM',
      status: 'Overdue',
      dueAmount: 800
    },
    {
      id: 'RD-9033',
      riderName: 'Vikram Joshi',
      riderPhone: '+91 97234 88712',
      bikePlate: 'GJ-06-EV-4421',
      model: 'Evegah Mink',
      startTime: 'Today, 01:00 PM',
      dueTime: 'Today, 05:30 PM',
      status: 'Due Soon',
      dueAmount: 180
    }
  ]);

  // Load employee session info and listen to TopBar Zone changes
  useEffect(() => {
    const handleZoneAndSession = () => {
      if (typeof window !== 'undefined') {
        const storedName = localStorage.getItem('evegah_user_name');
        const activeZone = localStorage.getItem('evegah_selected_zone') || localStorage.getItem('evegah_user_zone') || 'Gotri Zone';
        if (storedName) setEmployeeName(storedName);
        if (activeZone) setEmployeeZone(activeZone);

        // Adjust stats dynamically based on selected zone
        if (activeZone.toLowerCase().includes('alkapuri')) {
          setShiftStats({
            dispatched: 16,
            retained: 9,
            batterySwaps: 32,
            returned: 12,
            duesCollected: 21800,
            activeYardVehicles: 44,
            chargingBatteries: 22
          });
        } else if (activeZone.toLowerCase().includes('manjalpur')) {
          setShiftStats({
            dispatched: 9,
            retained: 5,
            batterySwaps: 18,
            returned: 7,
            duesCollected: 12400,
            activeYardVehicles: 28,
            chargingBatteries: 14
          });
        } else {
          setShiftStats({
            dispatched: 12,
            retained: 7,
            batterySwaps: 24,
            returned: 9,
            duesCollected: 16500,
            activeYardVehicles: 38,
            chargingBatteries: 18
          });
        }
      }
    };

    handleZoneAndSession();
    window.addEventListener('evegah_active_zone_changed', handleZoneAndSession);
    window.addEventListener('storage', handleZoneAndSession);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', handleZoneAndSession);
      window.removeEventListener('storage', handleZoneAndSession);
    };
  }, []);

  // ONLY 4 Core Operational Tasks
  const primaryTasks = [
    {
      id: 'new-ride',
      title: '1. New Ride Dispatch',
      description: 'Quick Aadhaar/DL KYC verification, assign available EV scooter, select rental package & dispatch.',
      href: '/new-rider',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" />
          <path d="M5.5 17.5l4-8h4l2.5 8" />
        </svg>
      ),
      badge: 'KYC & Dispatch',
      badgeColor: '#ECFDF5',
      badgeTextColor: '#059669',
      primaryBtnText: 'Start New Ride'
    },
    {
      id: 'retain-extend',
      title: '2. Retain & Extend Ride',
      description: 'Renew ongoing rental package without returning vehicle, or add extra rental hours/days with auto rate calculation.',
      href: '/retain-rider',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      ),
      badge: 'Renewal & Extension',
      badgeColor: '#EFF6FF',
      badgeTextColor: '#2563EB',
      primaryBtnText: 'Retain / Extend Ride'
    },
    {
      id: 'battery-swap',
      title: '3. Rapid Battery Swap',
      description: 'Under 60-second BMS swap: Scan depleted battery pack, slot into charging bay, and dispense 95%+ high SOC battery.',
      href: '/battery-swap',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="16" height="12" rx="2" />
          <path d="M22 11v4" />
          <path d="M7 13l2-2 2 2" />
          <path d="M13 11l-2 2-2-2" />
        </svg>
      ),
      badge: '60s BMS Swap',
      badgeColor: '#DCFCE7',
      badgeTextColor: '#16A34A',
      primaryBtnText: 'Swap Battery'
    },
    {
      id: 'return-dues',
      title: '4. Return Ride & Due Collection',
      description: 'Vehicle intake inspection (scratches, helmet, odometer), calculate extra usage, deposit settlement & collect pending dues.',
      href: '/return-ride',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
      badge: 'Check-In & Settlement',
      badgeColor: '#F3E8FF',
      badgeTextColor: '#7C3AED',
      primaryBtnText: 'Process Return & Dues'
    }
  ];

  // Handle Payment Collection submission
  const handleOpenPayment = (ride: ActiveRide) => {
    setSelectedOverdueRide(ride);
    setPaymentSuccess(false);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedOverdueRide) return;
    setPaymentSuccess(true);
    setShiftStats(prev => ({
      ...prev,
      duesCollected: prev.duesCollected + selectedOverdueRide.dueAmount
    }));

    setTimeout(() => {
      setDueRides(prev => prev.filter(r => r.id !== selectedOverdueRide.id));
      setPaymentModalOpen(false);
      setPaymentSuccess(false);
    }, 1500);
  };

  // Operational Velocity Chart Data
  const velocityDataToday = {
    labels: ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'],
    datasets: [
      {
        label: 'Dispatches',
        data: [2, 5, 8, 12, 9, 14, 11],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        fill: true,
        tension: 0.38,
        pointBackgroundColor: '#6366F1',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.2
      },
      {
        label: 'Battery Swaps',
        data: [4, 9, 15, 24, 18, 26, 21],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.06)',
        fill: true,
        tension: 0.38,
        pointBackgroundColor: '#10B981',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.2
      },
      {
        label: 'Returns Inspected',
        data: [1, 3, 6, 9, 8, 12, 7],
        borderColor: '#0284C7',
        backgroundColor: 'rgba(2, 132, 199, 0.05)',
        fill: false,
        tension: 0.38,
        pointBackgroundColor: '#0284C7',
        pointRadius: 3.5,
        pointHoverRadius: 5.5,
        borderWidth: 2,
        borderDash: [4, 4]
      }
    ]
  };

  const velocityDataWeek = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Dispatches',
        data: [42, 58, 64, 71, 85, 96, 78],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        fill: true,
        tension: 0.38,
        pointBackgroundColor: '#6366F1',
        pointRadius: 4,
        borderWidth: 2.2
      },
      {
        label: 'Battery Swaps',
        data: [98, 115, 124, 138, 162, 184, 142],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.06)',
        fill: true,
        tension: 0.38,
        pointBackgroundColor: '#10B981',
        pointRadius: 4,
        borderWidth: 2.2
      }
    ]
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11, weight: 'bold', family: "'Plus Jakarta Sans', sans-serif" },
          color: '#64748B',
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: '#1E293B',
        titleFont: { size: 12, weight: 'bold', family: "'Plus Jakarta Sans', sans-serif" },
        bodyFont: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" }, color: '#94A3B8' }
      },
      y: {
        grid: { color: '#F1F5F9' },
        ticks: { font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" }, color: '#94A3B8', stepSize: 5 }
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />

        <main style={{ padding: '24px 32px 60px', flex: 1 }}>
          {/* Top Header Bar (Clean, no bulky gradient welcome card) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Hub Dispatch &amp; Operations Console
                </h1>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                  Shift Active &bull; On Duty
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: 500 }}>
                Operational Station: <strong style={{ color: '#1E1548' }}>{employeeZone}</strong> &bull; Assigned Staff: <strong>{employeeName}</strong> ({employeeId})
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', padding: '8px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Shift Time</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#16A34A', fontFamily: 'monospace' }}>{shiftDuration}</div>
              </div>
              <Link
                href="/attendance"
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: '#1E1548',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(30, 21, 72, 0.2)'
                }}
              >
                <span>Attendance &amp; Scorecard</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          {/* 4 KPI Cards - Same as Super Admin sa-kpi-card styling */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {/* Card 1: Dispatched Today */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Dispatched Today
                </span>
                <span style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF2FF', color: '#6366F1' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="5.5" cy="17.5" r="3.5" />
                    <circle cx="18.5" cy="17.5" r="3.5" />
                    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" />
                    <path d="M5.5 17.5l4-8h4l2.5 8" />
                  </svg>
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                {shiftStats.dispatched} <span style={{ fontSize: '13px', fontWeight: 600, color: '#6366F1' }}>Rides</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>
                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>↑ +18.2%</span>
                <span>Avg. dispatch: 3.2m</span>
              </div>
            </div>

            {/* Card 2: Battery Swaps Done */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Battery Swaps Done
                </span>
                <span style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ECFDF5', color: '#10B981' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="16" height="12" rx="2" />
                    <path d="M22 11v4" />
                    <path d="M7 13l2-2 2 2" />
                    <path d="M13 11l-2 2-2-2" />
                  </svg>
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                {shiftStats.batterySwaps} <span style={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>Swaps</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>
                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>↑ 98% SOC</span>
                <span>Avg. swap time: 48s</span>
              </div>
            </div>

            {/* Card 3: Returns Inspected */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Returns Inspected
                </span>
                <span style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFF6FF', color: '#2563EB' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                {shiftStats.returned} <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB' }}>Units</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>
                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>↑ 100% OK</span>
                <span>Zero yard damage</span>
              </div>
            </div>

            {/* Card 4: Dues Collected */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Dues Collected (Shift)
                </span>
                <span style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DCFCE7', color: '#059669', fontWeight: 800, fontSize: '15px' }}>
                  ₹
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                ₹{shiftStats.duesCollected.toLocaleString()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>
                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>↑ Settled</span>
                <span>Instant UPI &amp; Cash</span>
              </div>
            </div>
          </div>

          {/* Section 1: Hub Operations Action Desk (EXACTLY 4 CARDS) */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1548', margin: '0 0 3px 0' }}>
                  Hub Operations Action Desk
                </h2>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                  Ground operational modules for rider dispatch, package renewal, rapid battery swapping, and return settlements.
                </p>
              </div>

              <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                4 Core Modules Active
              </span>
            </div>

            {/* Exactly 4 Operational Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {primaryTasks.map(task => (
                <Link
                  key={task.id}
                  href={task.href}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '20px',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
                  }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(15, 23, 42, 0.08)';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.02)';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: task.badgeColor,
                          color: task.badgeTextColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {task.icon}
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '14px',
                          background: task.badgeColor,
                          color: task.badgeTextColor
                        }}
                      >
                        {task.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E1548', margin: '0 0 6px 0' }}>
                      {task.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.45', margin: 0 }}>
                      {task.description}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#16A34A' }}>
                      {task.primaryBtnText} &rarr;
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Instant action</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Section 2: Real Interactive Graph (Operational Hourly Velocity) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1E1548', margin: '0 0 3px 0' }}>
                  Hub Operational Velocity &bull; {employeeZone}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                  Real-time activity flow of EV dispatches, rapid battery swaps, and inspected returns.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveVelocityTab('today')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: activeVelocityTab === 'today' ? '#1E1548' : '#F1F5F9',
                    color: activeVelocityTab === 'today' ? '#FFFFFF' : '#64748B',
                    transition: 'all 0.15s'
                  }}
                >
                  Today (Hourly)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVelocityTab('week')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: activeVelocityTab === 'week' ? '#1E1548' : '#F1F5F9',
                    color: activeVelocityTab === 'week' ? '#FFFFFF' : '#64748B',
                    transition: 'all 0.15s'
                  }}
                >
                  This Week
                </button>
              </div>
            </div>

            <div style={{ height: '240px', width: '100%', position: 'relative' }}>
              <Line data={activeVelocityTab === 'today' ? velocityDataToday : velocityDataWeek} options={chartOptions} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Peak Dispatch Window</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E1548', marginTop: '2px' }}>04:00 PM - 06:00 PM</div>
              </div>
              <div style={{ height: '24px', width: '1px', background: '#E2E8F0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Average Rapid Swap Time</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>48 Seconds / Unit</div>
              </div>
              <div style={{ height: '24px', width: '1px', background: '#E2E8F0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Station Throughput Index</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#6366F1', marginTop: '2px' }}>96.4% Operational</div>
              </div>
            </div>
          </div>

          {/* Section 3: Overdue Rides & Payment Collection Table */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1E1548', margin: '0 0 3px 0' }}>
                  Pending Due Payments &amp; Overdue Rides
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                  Riders with overdue rentals or pending extension fees at {employeeZone}. Collect in cash or generate instant UPI QR.
                </p>
              </div>

              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '4px 12px', borderRadius: '20px', border: '1px solid #FCA5A5' }}>
                {dueRides.length} Overdue Actions Pending
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#64748B', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Ride ID</th>
                    <th style={{ padding: '12px 16px' }}>Rider Name</th>
                    <th style={{ padding: '12px 16px' }}>Vehicle</th>
                    <th style={{ padding: '12px 16px' }}>Scheduled Due</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Due Amount</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dueRides.map(ride => (
                    <tr key={ride.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1E1548' }}>{ride.id}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{ride.riderName}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{ride.riderPhone}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 600, color: '#1E1548' }}>{ride.bikePlate}</span>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{ride.model}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{ride.dueTime}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '12px',
                            background: ride.status === 'Overdue' ? '#FEE2E2' : '#FEF3C7',
                            color: ride.status === 'Overdue' ? '#DC2626' : '#D97706'
                          }}
                        >
                          {ride.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#DC2626', fontSize: '14px' }}>
                        ₹{ride.dueAmount}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(ride)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: '#16A34A',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                          }}
                        >
                          Collect ₹{ride.dueAmount} &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dueRides.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#16A34A', fontWeight: 600 }}>
                        ✓ All due payments cleared for this shift!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Station Yard Status Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Ready to Dispatch EV Scooters */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1E1548', margin: 0 }}>
                  Ready to Dispatch Scooters
                </h4>
                <span style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 700 }}>
                  {shiftStats.activeYardVehicles} Available
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E1548' }}>GJ-06-EV-2098 &bull; Evegah City</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Bay A-03 &bull; Cleaned &amp; Inspected</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '8px' }}>
                    98% SOC
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E1548' }}>GJ-06-EV-2104 &bull; Evegah Pro</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Bay A-07 &bull; Cleaned &amp; Inspected</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '8px' }}>
                    100% SOC
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E1548' }}>GJ-06-EV-2119 &bull; Evegah Mink</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Bay B-02 &bull; Cleaned &amp; Inspected</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '8px' }}>
                    94% SOC
                  </span>
                </div>
              </div>
            </div>

            {/* Battery Swap Locker Cabinet Status */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1E1548', margin: 0 }}>
                  Swap Locker Cabinet (Hub 1)
                </h4>
                <span style={{ fontSize: '11.5px', color: '#2563EB', fontWeight: 700 }}>
                  8 / 8 Bays Operational
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { bay: 1, soc: 98, status: 'Ready' },
                  { bay: 2, soc: 100, status: 'Ready' },
                  { bay: 3, soc: 96, status: 'Ready' },
                  { bay: 4, soc: 72, status: 'Charging' },
                  { bay: 5, soc: 100, status: 'Ready' },
                  { bay: 6, soc: 45, status: 'Charging' },
                  { bay: 7, soc: 95, status: 'Ready' },
                  { bay: 8, soc: 20, status: 'Depleted' },
                ].map(item => (
                  <div
                    key={item.bay}
                    style={{
                      background: item.status === 'Ready' ? '#F0FDF4' : '#FFFBEB',
                      border: `1px solid ${item.status === 'Ready' ? '#BBF7D0' : '#FDE68A'}`,
                      borderRadius: '10px',
                      padding: '10px 8px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Bay {item.bay}</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: item.status === 'Ready' ? '#16A34A' : '#D97706', margin: '2px 0' }}>
                      {item.soc}%
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: item.status === 'Ready' ? '#15803D' : '#B45309' }}>
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL: Payment Collection Modal */}
      {paymentModalOpen && selectedOverdueRide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setPaymentModalOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1548', margin: 0 }}>
                  Collect Pending Due
                </h3>
              </div>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}
                onClick={() => setPaymentModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '26px' }}>
                  ✓
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1548', margin: '0 0 6px 0' }}>
                  Payment of ₹{selectedOverdueRide.dueAmount} Received!
                </h4>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Ride {selectedOverdueRide.id} has been reconciled and settled.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>Rider:</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E1548' }}>{selectedOverdueRide.riderName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>Vehicle / Model:</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E1548' }}>{selectedOverdueRide.bikePlate} ({selectedOverdueRide.model})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626' }}>Total Due Amount:</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#DC2626' }}>₹{selectedOverdueRide.dueAmount}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                    Payment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {(['UPI', 'Cash', 'ICICI Link'] as const).map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: paymentMethod === method ? '2px solid #16A34A' : '1px solid #E2E8F0',
                          background: paymentMethod === method ? '#F0FDF4' : '#FFFFFF',
                          color: paymentMethod === method ? '#16A34A' : '#475569',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'UPI' && (
                  <div style={{ textAlign: 'center', padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '18px' }}>
                    <div style={{ width: '130px', height: '130px', margin: '0 auto 8px', background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QRCodeSVG
                        value={`upi://pay?pa=EVEGAHUAT@icici&pn=Evegah&am=${Number(selectedOverdueRide.dueAmount).toFixed(2)}&cu=INR`}
                        size={114}
                        level="M"
                      />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#701A75', marginBottom: 2 }}>UPI ID: EVEGAHUAT@icici</div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Scan with GPay, PhonePe, Paytm or BHIM</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#F1F5F9', border: 'none', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    style={{ flex: 2, padding: '12px', borderRadius: '10px', background: '#16A34A', border: 'none', color: '#FFFFFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}
                  >
                    Mark ₹{selectedOverdueRide.dueAmount} Received &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
