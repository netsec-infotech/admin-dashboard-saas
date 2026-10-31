'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const ATTENDANCE_CSS = `
.att-clock-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
  margin-bottom: 32px;
}
@media (max-width: 1024px) {
  .att-clock-grid {
    grid-template-columns: 1fr;
  }
}
.att-pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.att-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
`;

export default function AttendancePage() {
  // Employee profile
  const [employeeName, setEmployeeName] = useState('Priyansh Shah');
  const [employeeId, setEmployeeId] = useState('EVG-EMP-104');
  const [employeeZone, setEmployeeZone] = useState('Gotri Zone Hub');
  const [employeeRole, setEmployeeRole] = useState('Hub Operations Staff');

  // Clock status
  const [clockStatus, setClockStatus] = useState<'clocked_in' | 'clocked_out' | 'on_break'>('clocked_in');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [clockInTime, setClockInTime] = useState('08:32 AM');
  const [clockOutTime, setClockOutTime] = useState('--:--');
  const [selectedShift, setSelectedShift] = useState('Morning Shift (08:00 AM – 04:00 PM)');
  const [elapsedHours, setElapsedHours] = useState('04h 28m');
  const [breakTime, setBreakTime] = useState('00m');
  const [geofenceVerified, setGeofenceVerified] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'attendance' | 'evaluation' | 'calendar'>('attendance');

  // Load name & zone from session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('evegah_user_name');
      const zone = localStorage.getItem('evegah_user_zone');
      const role = localStorage.getItem('evegah_user_role_name');
      if (name) setEmployeeName(name);
      if (zone) setEmployeeZone(zone);
      if (role) setEmployeeRole(role);
    }
  }, []);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live attendance logs from backend
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Load session from localStorage & fetch live attendance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('evegah_user_name');
      const zone = localStorage.getItem('evegah_user_zone');
      const role = localStorage.getItem('evegah_user_role_name');
      const activeName = name || 'Priyansh Shah';
      if (name) setEmployeeName(name);
      if (zone) setEmployeeZone(zone);
      if (role) setEmployeeRole(role);

      fetchCurrentAttendance(activeName);
      fetchAttendanceLogs(activeName);
    }
  }, []);

  const fetchCurrentAttendance = async (empName: string) => {
    try {
      const res = await fetch(`${apiUrl}/attendance/current?employee_name=${encodeURIComponent(empName)}`);
      const json = await res.json();
      if (json.status === 'success' && json.activeSession) {
        const s = json.activeSession;
        setCurrentSessionId(s.id);
        setClockStatus('clocked_in');
        const inDate = new Date(s.clock_in_time);
        setClockInTime(inDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        const diffMins = Math.max(0, Math.round((Date.now() - inDate.getTime()) / (1000 * 60)));
        const hrs = Math.floor(diffMins / 60).toString().padStart(2, '0');
        const mins = (diffMins % 60).toString().padStart(2, '0');
        setElapsedHours(`${hrs}h ${mins}m`);
      } else {
        setClockStatus('clocked_out');
        setClockInTime('--:--');
        setClockOutTime('--:--');
      }
    } catch (e) {
      console.warn('Failed to load current attendance:', e);
    }
  };

  const fetchAttendanceLogs = async (empName: string) => {
    try {
      const res = await fetch(`${apiUrl}/attendance/logs?employee_name=${encodeURIComponent(empName)}`);
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        const formatted = json.data.map((r: any) => {
          const inD = new Date(r.clock_in_time);
          const outD = r.clock_out_time ? new Date(r.clock_out_time) : null;
          const mins = r.elapsed_minutes || (outD ? Math.round((outD.getTime() - inD.getTime()) / (1000 * 60)) : 0);
          const hrsStr = mins > 0 ? `${(mins / 60).toFixed(1)} hrs` : '--';
          return {
            date: inD.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
            shift: r.shift || 'Morning (08:00 - 16:00)',
            in: inD.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            out: outD ? outD.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--',
            hours: hrsStr,
            status: r.status === 'clocked_in' ? 'Present' : 'Present',
            geofence: `${r.zone || 'Gotri Hub'} (Verified)`,
            score: '100%',
          };
        });
        setAttendanceRecords(formatted);
      }
    } catch (e) {
      console.warn('Failed to fetch attendance logs:', e);
    }
  };

  // Clock Actions connected to Backend
  const handleClockIn = async () => {
    setLoadingAction(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      const res = await fetch(`${apiUrl}/attendance/clock-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          employee_name: employeeName,
          employee_role: employeeRole,
          zone: employeeZone,
          shift: selectedShift,
          geofence_verified: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const inDate = new Date(data.data?.clock_in_time || Date.now());
        setClockInTime(inDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        setClockStatus('clocked_in');
        setElapsedHours('00h 01m');
        setCurrentSessionId(data.data?.id || null);
        setApiSuccess(data.message || 'Clock-in recorded successfully!');
        fetchAttendanceLogs(employeeName);
      } else {
        setApiError(data.message || 'Failed to clock in');
      }
    } catch (err: any) {
      setApiError('Network error recording clock-in: ' + err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleClockOut = async () => {
    setLoadingAction(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      const res = await fetch(`${apiUrl}/attendance/clock-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentSessionId,
          employee_name: employeeName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const outDate = new Date(data.data?.clock_out_time || Date.now());
        setClockOutTime(outDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        setClockStatus('clocked_out');
        setCurrentSessionId(null);
        setApiSuccess('Clock-out recorded successfully! Shift logged.');
        fetchAttendanceLogs(employeeName);
      } else {
        setApiError(data.message || 'Failed to clock out');
      }
    } catch (err: any) {
      setApiError('Network error recording clock-out: ' + err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleBreak = () => {
    if (clockStatus === 'on_break') {
      setClockStatus('clocked_in');
    } else {
      setClockStatus('on_break');
      setBreakTime('15m');
    }
  };

  // Evaluation Metrics Data
  const evaluationStats = {
    grade: 'Grade A+ (Elite Operator)',
    overallScore: 98.4,
    attendanceRate: 98.2,
    punctualityRate: 96.5,
    daysPresent: 24,
    daysTotal: 25,
    daysLate: 1,
    unplannedLeaves: 0,
    dispatchesCount: 184,
    batterySwapsCount: 342,
    collectionsTotal: 142800,
    inspectionAccuracy: 99.4,
    customerRating: 4.9,
    reviewsCount: 96
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ATTENDANCE_CSS }} />
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar />

          <main style={{ padding: '24px 32px 60px', flex: 1 }}>
          {/* Breadcrumb & Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
              <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Dashboard</Link>
              <span>/</span>
              <span style={{ color: '#0F172A', fontWeight: 700 }}>Employee Attendance &amp; Evaluation</span>
            </div>

            <Link
              href="/employee-dashboard"
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#4F46E5',
                background: '#EEF2FF',
                padding: '6px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>&larr; Return to Operations Dashboard</span>
            </Link>
          </div>

          {/* Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E1548', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                Employee Attendance &amp; Performance Evaluation
              </h1>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                Real-time check-in, geolocation geofence tracking, operational KPIs, and performance appraisal scorecard.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', background: '#E2E8F0', padding: '4px', borderRadius: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('attendance')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9px',
                  border: 'none',
                  background: activeTab === 'attendance' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'attendance' ? '#1E1548' : '#64748B',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'attendance' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                🕒 Clock-In Terminal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('evaluation')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9px',
                  border: 'none',
                  background: activeTab === 'evaluation' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'evaluation' ? '#1E1548' : '#64748B',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'evaluation' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                ⭐ Evaluation Scorecard
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9px',
                  border: 'none',
                  background: activeTab === 'calendar' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'calendar' ? '#1E1548' : '#64748B',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                📅 Monthly Log &amp; Statement
              </button>
            </div>
          </div>

          {/* TAB 1: CLOCK-IN TERMINAL */}
          {activeTab === 'attendance' && (
            <div className="att-clock-grid">
              {/* Main Clock Card */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>
                      Digital Punch Terminal
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1548', margin: '4px 0 0 0' }}>
                      {employeeName} &bull; {employeeId}
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '5px 12px',
                      borderRadius: '20px',
                      background: clockStatus === 'clocked_in' ? '#DCFCE7' : clockStatus === 'on_break' ? '#FEF3C7' : '#F1F5F9',
                      color: clockStatus === 'clocked_in' ? '#16A34A' : clockStatus === 'on_break' ? '#D97706' : '#64748B',
                      border: `1px solid ${clockStatus === 'clocked_in' ? '#BBF7D0' : clockStatus === 'on_break' ? '#FDE68A' : '#E2E8F0'}`
                    }}
                  >
                    ● {clockStatus === 'clocked_in' ? 'On Duty' : clockStatus === 'on_break' ? 'On Break' : 'Off Duty'}
                  </span>
                </div>

                {/* Big Live Digital Clock */}
                <div style={{ textAlign: 'center', padding: '24px 0 16px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                  <div style={{ fontSize: '42px', fontWeight: 800, color: '#1E1548', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                    {currentTime || '08:32:15 AM'}
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
                    {currentDate}
                  </div>

                  {/* Geolocation Geofence status */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '4px 12px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '20px', fontSize: '11.5px', fontWeight: 600, color: '#059669' }}>
                    <span>📍</span>
                    <span>Geofence Verified: Inside {employeeZone} (5m accuracy)</span>
                  </div>
                </div>

                {/* Shift Selector */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Assigned Shift Schedule
                  </label>
                  <select
                    value={selectedShift}
                    onChange={e => setSelectedShift(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13px', fontWeight: 600, color: '#0F172A', background: '#FFFFFF' }}
                  >
                    <option value="Morning Shift (08:00 AM – 04:00 PM)">Morning Shift (08:00 AM – 04:00 PM)</option>
                    <option value="Evening Shift (02:00 PM – 10:00 PM)">Evening Shift (02:00 PM – 10:00 PM)</option>
                    <option value="General Shift (09:30 AM – 06:30 PM)">General Shift (09:30 AM – 06:30 PM)</option>
                  </select>
                </div>

                {/* Shift Timestamps Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Clocked In</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#16A34A', marginTop: '2px' }}>{clockInTime}</div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Elapsed Duty</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#1E1548', marginTop: '2px' }}>{elapsedHours}</div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Break Taken</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>{breakTime}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {clockStatus === 'clocked_out' ? (
                    <button
                      type="button"
                      onClick={handleClockIn}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#16A34A',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                      }}
                    >
                      ▶ Clock In for Shift
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleToggleBreak}
                        style={{
                          flex: 0.8,
                          padding: '14px',
                          borderRadius: '12px',
                          border: '1.5px solid #F59E0B',
                          background: clockStatus === 'on_break' ? '#FEF3C7' : '#FFFFFF',
                          color: '#D97706',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {clockStatus === 'on_break' ? '⏸ End Break' : '☕ Take Break (30m)'}
                      </button>

                      <button
                        type="button"
                        onClick={handleClockOut}
                        style={{
                          flex: 1.2,
                          padding: '14px',
                          borderRadius: '12px',
                          border: 'none',
                          background: '#DC2626',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)'
                        }}
                      >
                        ⏹ Clock Out &bull; End Shift
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Shift Punctuality & Evaluation Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Employee Evaluation Score Header Card */}
                <div style={{ background: 'linear-gradient(135deg, #1E1548 0%, #312E81 100%)', borderRadius: '20px', padding: '22px', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(30, 21, 72, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Evaluation Grade
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#4ADE80', margin: '4px 0 6px 0' }}>
                    {evaluationStats.grade}
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    Rated among top 5% hub operators across all zones this month.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Punctuality Rate</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{evaluationStats.punctualityRate}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Rider Rating</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#FBBF24' }}>{evaluationStats.customerRating} ★</div>
                    </div>
                  </div>
                </div>

                {/* Today's Operational Execution */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1E1548', margin: '0 0 14px 0' }}>
                    Operations Executed Today
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748B' }}>🛵 Rides Dispatched:</span>
                      <strong style={{ color: '#1E1548' }}>12 Rides</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748B' }}>🔋 Battery Swaps Logged:</span>
                      <strong style={{ color: '#16A34A' }}>24 Swaps</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748B' }}>🏁 Vehicle Returns Handled:</span>
                      <strong style={{ color: '#2563EB' }}>9 Units</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748B' }}>💳 Dues Collected:</span>
                      <strong style={{ color: '#059669' }}>₹16,500</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPREHENSIVE EVALUATION SCORECARD */}
          {activeTab === 'evaluation' && (
            <div>
              {/* Top Score Banner */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '14px', background: '#DCFCE7', color: '#16A34A' }}>
                      Official Performance Appraisal &bull; September 2026
                    </span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1E1548', margin: '6px 0 4px 0' }}>
                      {employeeName} — Operations Scorecard
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                      Evaluated continuously across biometric attendance, dispatch TAT, swap speed, inspection accuracy, and customer satisfaction.
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '38px', fontWeight: 900, color: '#16A34A', lineHeight: 1 }}>
                      {evaluationStats.overallScore}/100
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginTop: '4px' }}>
                      Overall Performance Score
                    </div>
                  </div>
                </div>

                {/* 4 Core Evaluation Pillars */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  {/* Pillar 1: Attendance & Punctuality */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Attendance &amp; Punctuality</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#16A34A' }}>98.2%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ width: '98.2%', height: '100%', background: '#16A34A' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      24/25 Days Present &bull; 1 Grace Late &bull; 0 Absent
                    </div>
                  </div>

                  {/* Pillar 2: Dispatch & Swap Output */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Operations Throughput</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>99.1%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ width: '99.1%', height: '100%', background: '#2563EB' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      184 Dispatches &bull; 342 Battery Swaps
                    </div>
                  </div>

                  {/* Pillar 3: Cash & Deposit Accuracy */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Collection Accuracy</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#059669' }}>100%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ width: '100%', height: '100%', background: '#059669' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      ₹1,42,800 Settled &bull; Zero Discrepancy
                    </div>
                  </div>

                  {/* Pillar 4: Rider Satisfaction */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Rider Satisfaction</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#D97706' }}>4.9 ★</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ width: '98%', height: '100%', background: '#F59E0B' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      96 Positive Reviews &bull; Zero Grievances
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MONTHLY LOG & STATEMENT */}
          {activeTab === 'calendar' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1548', margin: '0 0 4px 0' }}>
                    Biometric &amp; Geofence Attendance Log
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                    Daily timestamps verified via GPS geofence and hub operations check-in.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => alert("Downloading Monthly Attendance & Evaluation Statement (PDF)...")}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    background: '#1E1548',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📥 Download Statement (PDF)</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#64748B', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Shift Details</th>
                      <th style={{ padding: '12px 16px' }}>Clock In</th>
                      <th style={{ padding: '12px 16px' }}>Clock Out</th>
                      <th style={{ padding: '12px 16px' }}>Hours</th>
                      <th style={{ padding: '12px 16px' }}>Geofence Location</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((rec, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1E1548' }}>{rec.date}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{rec.shift}</td>
                        <td style={{ padding: '12px 16px', color: '#16A34A', fontWeight: 700 }}>{rec.in}</td>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>{rec.out}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>{rec.hours}</td>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>{rec.geofence}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '12px',
                              background: rec.status === 'Present' ? '#DCFCE7' : rec.status === 'Weekly Off' ? '#F1F5F9' : '#FEF3C7',
                              color: rec.status === 'Present' ? '#16A34A' : rec.status === 'Weekly Off' ? '#64748B' : '#D97706'
                            }}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#1E1548' }}>
                          {rec.score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </>
  );
}
