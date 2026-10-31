"use client";
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.ud-shell { display: flex; min-height: 100vh; background: #F8F9FF; font-family: 'Inter', sans-serif; }
.ud-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.ud-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Breadcrumb */
.ud-bc { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748B; font-weight: 500; }
.ud-bc a { color: #8B5CF6; text-decoration: none; font-weight: 600; transition: color .15s; }
.ud-bc a:hover { color: #6D28D9; }
.ud-bc-sep { color: #D8B4FE; font-weight: 600; }
.ud-bc-cur { color: #0F172A; font-weight: 700; }

/* Actions row */
.ud-actions-row { display: flex; justify-content: space-between; align-items: center; margin-top: -4px; }
.ud-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0; }
.bi-sub { font-size: 13.5px; color: #64748B; margin: 4px 0 0 0; font-weight: 500; }
.ud-btn-wrap { display: flex; gap: 8px; }
.ud-btn-outline { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; font-weight: 700; color: #0F172A; background: #fff; cursor: pointer; transition: all .15s; }
.ud-btn-outline:hover { border-color: #6366F1; color: #6366F1; background: #F8FAFC; }
.ud-btn-primary { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: #2a195c; color: #fff; border: 1.5px solid #2a195c; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
.ud-btn-primary:hover { background: #4338CA; border-color: #4338CA; }

/* User profile header card */
.ud-profile-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 24px; display: grid; grid-template-columns: 1.25fr 1fr 1.25fr; gap: 28px; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.ud-profile-left { display: flex; gap: 20px; align-items: center; }
.ud-avatar-circle { width: 90px; height: 90px; border-radius: 50%; overflow: hidden; background: #EEF2FF; border: 1.5px solid #E2E8F0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ud-avatar-circle img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.ud-profile-details { display: flex; flex-direction: column; gap: 4px; }
.ud-profile-name-row { display: flex; align-items: center; gap: 8px; }
.ud-profile-name { font-size: 19px; font-weight: 800; color: #0F172A; }
.badge-active { background: #DCFCE7; color: #15803D; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; border: 1px solid #BBF7D0; }
.badge-inactive { background: #FEE2E2; color: #991B1B; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; border: 1px solid #FCA5A5; }
.ud-profile-role { font-size: 13px; color: #475569; font-weight: 600; }
.ud-profile-meta-line { font-size: 13px; color: #64748B; font-weight: 500; }
.ud-profile-meta-line span { font-weight: 700; color: #0F172A; }

.ud-profile-mid { display: flex; flex-direction: column; gap: 10px; border-left: 1.5px solid #F1F5F9; border-right: 1.5px solid #F1F5F9; padding: 0 24px; }
.ud-mid-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.ud-mid-lbl { color: #64748B; font-weight: 600; }
.ud-mid-val { font-weight: 700; color: #0F172A; }
.badge-purple-role { background: #F3E8FF; color: #7E22CE; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 6px; border: 1px solid #E9D5FF; }

/* Permissions Summary Card inside profile */
.ud-summary-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.ud-summary-title { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
.ud-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ud-summary-col { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.ud-summary-lbl { font-size: 9.5px; color: #64748B; font-weight: 600; text-align: center; white-space: nowrap; }
.ud-summary-box { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 8px; font-size: 14px; font-weight: 800; color: #0F172A; border: 1px solid #E2E8F0; }
.ud-summary-box.purple { background: #8B5CF6; color: #fff; }
.ud-summary-box.blue { background: #3B82F6; color: #fff; }
.ud-summary-box.green { background: #10B981; color: #fff; }
.ud-summary-box.red { background: #EF4444; color: #fff; }

/* Tabs bar */
.ud-tabs { display: flex; border-bottom: 1.5px solid #E2E8F0; gap: 28px; margin-bottom: 16px; }
.ud-tab { padding: 12px 8px; font-size: 14px; font-weight: 700; color: #64748B; cursor: pointer; border-bottom: 3px solid transparent; transition: all .15s; margin-bottom: -1.5px; }
.ud-tab:hover { color: #2a195c; }
.ud-tab.active { color: #2a195c; border-bottom-color: #2a195c; }

/* Layout grids */
.ud-two-col { display: grid; grid-template-columns: 1.85fr 1fr; gap: 20px; align-items: start; }
.ud-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 16px; }
.ud-card-hdr { display: flex; justify-content: space-between; align-items: center; }
.ud-card-tit { font-size: 15px; font-weight: 800; color: #0F172A; margin: 0; display: flex; justify-content: space-between; align-items: center; }

/* Module access table */
.ud-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
.ud-table th { font-size: 11.5px; font-weight: 700; color: #64748B; text-transform: uppercase; padding: 12px; border-bottom: 1.5px solid #E2E8F0; background: #F8FAFC; text-align: center; }
.ud-table th:first-child { text-align: left; }
.ud-table td { padding: 12px; font-size: 13px; color: #334155; border-bottom: 1.5px solid #F1F5F9; vertical-align: middle; }
.ud-table tr:last-child td { border-bottom: none; }
.ud-table tr:hover td { background: #FAFBFD; }

/* Circular icons badges */
.perm-badge-circle { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; margin: 0 auto; }
.perm-badge-circle.granted { background: #DCFCE7; color: #16A34A; border: 1.2px solid #BBF7D0; }
.perm-badge-circle.restricted { background: #FEE2E2; color: #EF4444; border: 1.2px solid #FECACA; }
.perm-badge-circle.na { background: #F1F5F9; color: #94A3B8; border: 1.2px solid #E2E8F0; }

/* Legend items circular badges */
.perm-legend-row { display: flex; gap: 20px; margin-top: 12px; font-size: 12px; color: #475569; font-weight: 600; border-top: 1.5px solid #F1F5F9; padding-top: 16px; }
.legend-item { display: flex; align-items: center; gap: 6px; }

/* Table Module style */
.module-chevron { color: #94A3B8; flex-shrink: 0; margin-right: 4px; }
.module-icon-wrap { width: 32px; height: 32px; background: #F3E8FF; border: 1.2px solid #E9D5FF; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #7E22CE; flex-shrink: 0; }

/* Quick actions */
.ud-qa-list { display: flex; flex-direction: column; gap: 8px; }
.ud-qa-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 700; color: #334155; cursor: pointer; transition: all .15s; background: #fff; }
.ud-qa-item:hover { border-color: #2a195c; color: #2a195c; background: #FAFBFD; }

/* Overview Perm Summary Blocks */
.ud-perms-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.ud-perm-block { display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid #E2E8F0; border-radius: 10px; }
.ud-perm-ic-box { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.ud-perm-ic-box.ic-purple { background: #8B5CF6; color: #fff; }
.ud-perm-ic-box.ic-blue { background: #3B82F6; color: #fff; }
.ud-perm-ic-box.ic-green { background: #10B981; color: #fff; }
.ud-perm-ic-box.ic-red { background: #EF4444; color: #fff; }
.ud-perm-num { font-size: 18px; font-weight: 800; color: #0F172A; line-height: 1.2; }
.ud-perm-lbl { font-size: 11px; color: #64748B; font-weight: 600; }

.status-check-green { display: inline-flex; align-items: center; color: #16A34A; font-weight: 700; font-size: 12.5px; }
.badge-blue-text { color: #2563EB; font-weight: 700; font-size: 12.5px; }
.badge-orange-text { color: #EA580C; font-weight: 700; font-size: 12.5px; }
.table-viewall { font-size: 12px; font-weight: 700; color: #8B5CF6; cursor: pointer; }
.table-viewall:hover { text-decoration: underline; }

.badge-green-filled { background: #DCFCE7; color: #15803D; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }

/* Security logs list */
.ud-info-list { display: flex; flex-direction: column; gap: 14px; }
.ud-info-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; border-bottom: 1px dashed #E2E8F0; padding-bottom: 10px; }
.ud-info-row:last-child { border-bottom: none; padding-bottom: 0; }
.ud-info-lbl { color: #64748B; font-weight: 600; }
.ud-info-val { font-weight: 700; color: #0F172A; }
.ud-info-link { color: #8B5CF6; font-weight: 700; cursor: pointer; font-size: 12px; }
.ud-info-link:hover { text-decoration: underline; }

/* Recent activity list */
.act-list { display: flex; flex-direction: column; gap: 16px; position: relative; padding-left: 14px; }
.act-list::before { content: ''; position: absolute; left: 3.5px; top: 6px; bottom: 6px; width: 1.5px; background: #E2E8F0; }
.act-item { display: flex; gap: 12px; position: relative; }
.act-dot { width: 8px; height: 8px; border-radius: 50%; background: #CBD5E1; border: 2px solid #fff; position: absolute; left: -14px; top: 5px; box-shadow: 0 0 0 2px #E2E8F0; }
.act-item:first-child .act-dot { background: #2A195C; box-shadow: 0 0 0 2px #DDD6FE; }
.act-info { display: flex; flex-direction: column; gap: 2px; }
.act-txt { font-size: 12.5px; color: #334155; font-weight: 600; line-height: 1.4; }
.act-time { font-size: 11px; color: #94A3B8; font-weight: 500; }

/* Activity tab log classes */
.act-filter-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr auto; gap: 10px; align-items: center; margin-bottom: 8px; }
.fr-search-wrap { position: relative; display: flex; align-items: center; }
.fr-search-input { width: 100%; padding: 8px 12px 8px 32px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; font-weight: 500; }
.fr-search-input:focus { border-color: #2A195C; }
.fr-search-icon { position: absolute; left: 10px; color: #94A3B8; display: flex; align-items: center; }

.bi-select { padding: 8px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #334155; cursor: pointer; font-weight: 500; }
.bi-select:focus { border-color: #2A195C; }
.bi-reset-btn { font-size: 12.5px; font-weight: 700; color: #EF4444; background: none; border: none; cursor: pointer; }
.bi-reset-btn:hover { text-decoration: underline; }

.act-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; border: 1px solid transparent; }
.act-b-login { background: #EFF6FF; color: #1D4ED8; border-color: #BFDBFE; }
.act-b-update { background: #FAF5FF; color: #7E22CE; border-color: #E9D5FF; }
.act-b-create { background: #ECFDF5; color: #047857; border-color: #A7F3D0; }
.act-b-delete { background: #FEE2E2; color: #B91C1C; border-color: #FCA5A5; }

.usr-avatar { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.usr-avatar.purple { background: #8B5CF6; color: #fff; }
.usr-avatar.green { background: #10B981; color: #fff; }
.usr-avatar.orange { background: #F97316; color: #fff; }
.usr-avatar.blue { background: #3B82F6; color: #fff; }
.usr-avatar.pink { background: #FDF2F8; color: #DB2777; border: 1px solid #FBCFE8; }

.bi-tcard-ft { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-top: 1.5px solid #E2E8F0; background: #FAFBFD; margin-top: 14px; border-radius: 0 0 10px 10px; }
.bi-tcard-ft-lbl { font-size: 12px; color: #64748B; font-weight: 500; }
.bi-pg { display: flex; align-items: center; gap: 4px; }
.bi-pgb { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 600; color: #64748B; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
.bi-pgb:hover:not(:disabled) { border-color: #2A195C; color: #2A195C; }
.bi-pgb.cur { background: #2a195c; color: #fff; border-color: #2a195c; }
.bi-pgb:disabled { opacity: 0.5; cursor: not-allowed; }
`;

interface DeviceSession {
  device: string;
  ip: string;
  location: string;
  time: string;
  current?: boolean;
}

const SESSIONS: DeviceSession[] = [
  { device: 'Chrome on Windows', ip: '192.168.1.10', location: 'New Delhi, India', time: '20 May 2024, 10:30 AM', current: true },
  { device: 'Safari on iPhone', ip: '103.22.245.99', location: 'New Delhi, India', time: '19 May 2024, 11:20 PM' }
];

interface ModuleAccess {
  name: string;
  level: string;
  type: 'full' | 'edit' | 'read';
}

const MODULES_SUMMARY: ModuleAccess[] = [
  { name: 'Dashboard', level: 'Full Access', type: 'full' },
  { name: 'Riders', level: 'Full Access', type: 'full' },
  { name: 'Battery', level: 'Full Access', type: 'full' },
  { name: 'Reports', level: 'Full Access', type: 'full' },
  { name: 'Franchise', level: 'Full Access', type: 'full' },
  { name: 'Alerts', level: 'Full Access', type: 'full' },
  { name: 'Settings', level: 'Full Access', type: 'full' }
];

interface LoggedActivity {
  time: string;
  action: 'Login' | 'Update' | 'Create' | 'Delete';
  module: string;
  details: string;
  ip: string;
  performedBy: string;
  performedByInitials: string;
  avatarCls: string;
}

const LOGGED_ACTIVITIES: LoggedActivity[] = [
  { time: '20 May 2024, 10:30 AM', action: 'Login', module: 'Authentication', details: 'User logged in to the system', ip: '192.168.1.10', performedBy: 'Himanshu', performedByInitials: 'H', avatarCls: 'purple' },
  { time: '20 May 2024, 10:15 AM', action: 'Update', module: 'Settings', details: 'Configured Gotri Zone threshold variables', ip: '192.168.1.10', performedBy: 'Himanshu', performedByInitials: 'H', avatarCls: 'purple' },
  { time: '20 May 2024, 09:40 AM', action: 'Create', module: 'Users', details: 'Created a new employee account USR-005 (Pooja Mehta)', ip: '192.168.1.10', performedBy: 'Himanshu', performedByInitials: 'H', avatarCls: 'purple' },
  { time: '19 May 2024, 05:15 PM', action: 'Update', module: 'Franchise', details: 'Approved Franchise Application #FA-2309', ip: '192.168.1.10', performedBy: 'Himanshu', performedByInitials: 'H', avatarCls: 'purple' }
];

interface PermissionRow {
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  access: 'granted' | 'restricted' | 'na';
  create: 'granted' | 'restricted' | 'na';
  view: 'granted' | 'restricted' | 'na';
  edit: 'granted' | 'restricted' | 'na';
  delete: 'granted' | 'restricted' | 'na';
  export: 'granted' | 'restricted' | 'na';
}

const DEFAULT_USER_INFO = {
  id: 'USR-001',
  name: 'Himanshu',
  email: 'himanshu@evegah.com',
  mobile: '+91 98765 43210',
  role: 'Super Admin',
  zone: 'Gotri Zone',
  status: 'Active',
  reportingTo: 'System Owner',
  avatar: '',
  initials: 'H',
  avatarBg: '#F5F3FF',
  avatarCls: 'purple'
};

const PERM_ROWS: PermissionRow[] = [
  {
    name: 'Dashboard',
    subtitle: 'View dashboards and analytics',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
    access: 'granted', create: 'granted', view: 'granted', edit: 'granted', delete: 'granted', export: 'granted'
  },
  {
    name: 'Riders',
    subtitle: 'Manage riders and rider analytics',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    access: 'granted', create: 'granted', view: 'granted', edit: 'granted', delete: 'granted', export: 'granted'
  },
  {
    name: 'Vehicles',
    subtitle: 'Manage vehicles and documents',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" /><path d="M5.5 17.5l4-8h4l2.5 8" /><path d="M8.5 12h5" /><path d="M12 9l-1.5 2.5h2L11 14" strokeWidth="1.8" /></svg>,
    access: 'granted', create: 'granted', view: 'granted', edit: 'granted', delete: 'granted', export: 'granted'
  },
  {
    name: 'Battery',
    subtitle: 'Battery inventory and operations',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="11" x2="23" y2="13"/></svg>,
    access: 'granted', create: 'granted', view: 'granted', edit: 'granted', delete: 'granted', export: 'granted'
  },
  {
    name: 'Reports',
    subtitle: 'Generate and view reports',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    access: 'granted', create: 'granted', view: 'granted', edit: 'granted', delete: 'granted', export: 'granted'
  },
  {
    name: 'Franchise',
    subtitle: 'Franchise management',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    access: 'granted', create: 'granted', view: 'granted', edit: 'granted', delete: 'granted', export: 'granted'
  },
  {
    name: 'Alerts',
    subtitle: 'View and manage alerts',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    access: 'granted', create: 'granted', view: 'granted', edit: 'granted', delete: 'granted', export: 'granted'
  },
  {
    name: 'Settings',
    subtitle: 'System and platform settings',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    access: 'granted', create: 'granted', view: 'granted', edit: 'granted', delete: 'granted', export: 'granted'
  }
];

function UserProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'Overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userInfo, setUserInfo] = useState(DEFAULT_USER_INFO);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('evegah_user_name');
      const storedEmail = localStorage.getItem('evegah_user_email');
      const storedRole = localStorage.getItem('evegah_user_role') || localStorage.getItem('evegah_user_role_name');
      const storedZone = localStorage.getItem('evegah_user_zone') || localStorage.getItem('evegah_active_zone');
      const initials = storedName ? storedName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'H';

      setUserInfo(prev => ({
        ...prev,
        name: storedName || prev.name,
        email: storedEmail || prev.email,
        role: storedRole || prev.role,
        zone: storedZone || prev.zone,
        initials: initials || prev.initials
      }));
    }
  }, []);

  // Search & filter states for Activity Log
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('All Actions');
  const [selectedModule, setSelectedModule] = useState('All Modules');

  const filteredLogs = useMemo(() => {
    return LOGGED_ACTIVITIES.filter(l => {
      const matchesSearch = l.details.toLowerCase().includes(searchQuery.toLowerCase()) || l.module.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = selectedAction === 'All Actions' || l.action === selectedAction;
      const matchesModule = selectedModule === 'All Modules' || l.module === selectedModule;
      return matchesSearch && matchesAction && matchesModule;
    });
  }, [searchQuery, selectedAction, selectedModule]);

  const renderBadge = (status: 'granted' | 'restricted' | 'na') => {
    if (status === 'granted') {
      return (
        <div className="perm-badge-circle granted">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      );
    }
    if (status === 'restricted') {
      return (
        <div className="perm-badge-circle restricted">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
        </div>
      );
    }
    return (
      <div className="perm-badge-circle na">
        <svg width="8" height="2" viewBox="0 0 8 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="0" y1="1" x2="8" y2="1"/>
        </svg>
      </div>
    );
  };

  const QUICK_ACTIONS = [
    {
      name: 'View Role Details',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    {
      name: 'Compare with Other Roles',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="7" x2="19" y2="7"/><path d="M5 7L2 13h6l-3-6z"/><path d="M19 7l-3 6h6l-3-6z"/></svg>
    },
    {
      name: 'Copy Permissions',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
    }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ud-shell">
        <Sidebar activePath="/users" />
        <div className="ud-main">
          <TopBar 
            notificationCount={3}
            showSearch={false}
            hideZone={false}
          />
          <div className="ud-page">

            {/* Breadcrumbs */}
            <div className="ud-bc">
              <a href="#">Settings</a>
              <span className="ud-bc-sep">&gt;</span>
              <a href="/users">Users &amp; Roles</a>
              <span className="ud-bc-sep">&gt;</span>
              {activeTab === 'Overview' ? (
                <span className="ud-bc-cur">My Profile</span>
              ) : (
                <>
                  <span 
                    style={{ cursor: 'pointer', color: '#8B5CF6', fontWeight: 600 }} 
                    onClick={() => setActiveTab('Overview')}
                  >
                    My Profile
                  </span>
                  <span className="ud-bc-sep">&gt;</span>
                  <span className="ud-bc-cur">{activeTab}</span>
                </>
              )}
            </div>

            {/* Action Row */}
            <div className="ud-actions-row">
              <div>
                <h1 className="ud-h1">{activeTab === 'Permissions' ? 'My Permissions' : 'My Profile'}</h1>
                <p className="bi-sub">
                  {activeTab === 'Permissions' 
                    ? 'Review your active system and security access rules.' 
                    : 'Manage your personal profile, secure credentials, and login sessions.'}
                </p>
              </div>
              <div className="ud-btn-wrap">
                {activeTab === 'Permissions' ? (
                  <>
                    <button className="ud-btn-outline" onClick={() => setActiveTab('Overview')}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                      Back to Profile
                    </button>
                  </>
                ) : (
                  <>
                    <button className="ud-btn-primary" onClick={() => router.push(`/users/add?edit=${userInfo.id}`)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Shared Profile Info card at top */}
            <div className="ud-profile-card">
              {/* Left Column: Avatar + Profile details */}
              <div className="ud-profile-left">
                <div className="ud-avatar-circle">
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt={`${userInfo.name} avatar`} />
                  ) : (
                    <div className={`usr-avatar ${userInfo.avatarCls}`} style={{ width: '100%', height: '100%', borderRadius: '50%', fontSize: '32px' }}>
                      {userInfo.initials}
                    </div>
                  )}
                </div>
                <div className="ud-profile-details">
                  <div className="ud-profile-name-row">
                    <span className="ud-profile-name">{userInfo.name}</span>
                    <span className="badge-active">{userInfo.status}</span>
                  </div>
                  <div className="ud-profile-role">{userInfo.role}</div>
                  <div className="ud-profile-meta-line" style={{ marginTop: '4px' }}>
                    User ID: <span>{userInfo.id}</span>
                  </div>
                  <div className="ud-profile-meta-line">
                    Email: <span>{userInfo.email}</span>
                  </div>
                  <div className="ud-profile-meta-line">
                    Mobile: <span>{userInfo.mobile}</span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Role and scope metadata */}
              <div className="ud-profile-mid">
                <div className="ud-mid-row">
                  <span className="ud-mid-lbl">Role</span>
                  <span className="badge-purple-role">{userInfo.role}</span>
                </div>
                <div className="ud-mid-row" style={{ marginTop: '4px' }}>
                  <span className="ud-mid-lbl">Zone / Scope</span>
                  <span className="ud-mid-val">{userInfo.zone}</span>
                </div>
                <div className="ud-mid-row" style={{ marginTop: '4px' }}>
                  <span className="ud-mid-lbl">Reporting To</span>
                  <span className="ud-mid-val">{userInfo.reportingTo}</span>
                </div>
              </div>

              {/* Right Column: Permissions Summary box */}
              <div className="ud-summary-card">
                <div className="ud-summary-title">Permissions Summary</div>
                <div className="ud-summary-grid">
                  
                  <div className="ud-summary-col">
                    <span className="ud-summary-lbl">Total Modules</span>
                    <div className="ud-summary-box purple">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      <span>8</span>
                    </div>
                  </div>

                  <div className="ud-summary-col">
                    <span className="ud-summary-lbl">Total Perms</span>
                    <div className="ud-summary-box blue">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span>48</span>
                    </div>
                  </div>

                  <div className="ud-summary-col">
                    <span className="ud-summary-lbl">Granted</span>
                    <div className="ud-summary-box green">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>48</span>
                    </div>
                  </div>

                  <div className="ud-summary-col">
                    <span className="ud-summary-lbl">Restricted</span>
                    <div className="ud-summary-box red">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      <span>0</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Tab Swi Bar */}
            <div className="ud-tabs">
              {['Overview', 'Permissions', 'Activity Log'].map(t => (
                <div 
                  key={t} 
                  className={`ud-tab ${activeTab === t ? 'active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </div>
              ))}
            </div>

            {/* Content areas based on activeTab */}
            {activeTab === 'Overview' && (
              <div className="ud-two-col">
                
                {/* Left Column blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Permissions summary grid */}
                  <div className="ud-card">
                    <div className="ud-card-tit">Permissions Summary</div>
                    <div className="ud-perms-row">
                      <div className="ud-perm-block">
                        <div className="ud-perm-ic-box ic-purple">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                        </div>
                        <div>
                          <div className="ud-perm-num">8</div>
                          <div className="ud-perm-lbl">Total Modules</div>
                        </div>
                      </div>
                      <div className="ud-perm-block">
                        <div className="ud-perm-ic-box ic-blue">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                        <div>
                          <div className="ud-perm-num">48</div>
                          <div className="ud-perm-lbl">Permissions</div>
                        </div>
                      </div>
                      <div className="ud-perm-block">
                        <div className="ud-perm-ic-box ic-green">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div>
                          <div className="ud-perm-num">48</div>
                          <div className="ud-perm-lbl">Granted</div>
                        </div>
                      </div>
                      <div className="ud-perm-block">
                        <div className="ud-perm-ic-box ic-red">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        </div>
                        <div>
                          <div className="ud-perm-num">0</div>
                          <div className="ud-perm-lbl">Restricted</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Module Access */}
                  <div className="ud-card">
                    <div className="ud-card-tit">
                      <span>Module Access</span>
                      <span className="table-viewall" onClick={() => setActiveTab('Permissions')}>View all permissions →</span>
                    </div>
                    <table className="ud-table">
                      <thead>
                        <tr>
                          <th>Module</th>
                          <th>Access Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MODULES_SUMMARY.map((m, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '700' }}>{m.name}</td>
                            <td>
                              <span className="status-check-green">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '3px' }}><polyline points="20 6 9 17 4 12"/></svg>
                                {m.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Devices & Sessions */}
                  <div className="ud-card">
                    <div className="ud-card-tit">
                      <span>Devices &amp; Sessions</span>
                      <span className="table-viewall" onClick={() => alert('View all active sessions details...')}>View all sessions →</span>
                    </div>
                    <table className="ud-table">
                      <thead>
                        <tr>
                          <th>Device / Browser</th>
                          <th>IP Address</th>
                          <th>Location</th>
                          <th>Last Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SESSIONS.map((s, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                              {s.device}
                              {s.current && <span className="badge-green-filled">Current</span>}
                            </td>
                            <td>{s.ip}</td>
                            <td>{s.location}</td>
                            <td>{s.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Right Column blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Recent activities */}
                  <div className="ud-card">
                    <div className="ud-card-hdr" style={{ padding: 0, borderBottom: 'none' }}>
                      <span className="ud-card-tit" style={{ fontSize: '15px' }}>Recent Activity</span>
                      <span className="table-viewall" onClick={() => setActiveTab('Activity Log')}>View All</span>
                    </div>
                    <div className="act-list" style={{ marginTop: '10px' }}>
                      {LOGGED_ACTIVITIES.slice(0, 5).map((act, index) => (
                        <div key={index} className="act-item">
                          <span className="act-dot" />
                          <div className="act-info">
                            <div className="act-txt">{act.details}</div>
                            <div className="act-time">{act.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="ud-card">
                    <div className="ud-card-tit">Security Information</div>
                    <div className="ud-info-list">
                      <div className="ud-info-row">
                        <span className="ud-info-lbl">Password</span>
                        <span className="ud-info-val" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>••••••••</span>
                          <span className="ud-info-link" onClick={() => alert('Triggering reset password email...')}>Reset Password</span>
                        </span>
                      </div>
                      <div className="ud-info-row">
                        <span className="ud-info-lbl">Two Factor Authentication</span>
                        <span className="badge-green-filled">Enabled</span>
                      </div>
                      <div className="ud-info-row">
                        <span className="ud-info-lbl">Failed Login Attempts</span>
                        <span className="ud-info-val" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>0</span>
                          <span className="ud-info-link" onClick={() => alert('Opening security logs...')}>View Logs</span>
                        </span>
                      </div>
                      <div className="ud-info-row">
                        <span className="ud-info-lbl">Account Locked</span>
                        <span className="ud-info-val" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>No</span>
                          <span className="ud-info-link" onClick={() => alert('Opening account lock audit...')}>View Logs</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="ud-card">
                    <div className="ud-card-tit">Account Information</div>
                    <div className="ud-info-list">
                      <div className="ud-info-row">
                        <span className="ud-info-lbl">Language</span>
                        <span className="ud-info-val">English</span>
                      </div>
                      <div className="ud-info-row">
                        <span className="ud-info-lbl">Date Format</span>
                        <span className="ud-info-val">DD MMM YYYY</span>
                      </div>
                      <div className="ud-info-row">
                        <span className="ud-info-lbl">Time Zone</span>
                        <span className="ud-info-val">(UTC+05:30) Asia/Kolkata</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {activeTab === 'Permissions' && (
              <div className="ud-two-col">
                
                {/* Left: module permissions table */}
                <div className="ud-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Module Permissions</h2>
                      <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>View and manage permissions for each module</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ position: 'absolute', left: '10px', color: '#94A3B8' }}>
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input 
                          type="text" 
                          placeholder="Search modules..." 
                          style={{ 
                            padding: '8px 12px 8px 32px', 
                            fontSize: '12.5px', 
                            border: '1.5px solid #E2E8F0', 
                            borderRadius: '8px', 
                            outline: 'none',
                            width: '180px',
                            fontWeight: 500,
                            color: '#0F172A'
                          }} 
                        />
                      </div>
                      <select 
                        style={{ 
                          padding: '8px 12px', 
                          fontSize: '12.5px', 
                          border: '1.5px solid #E2E8F0', 
                          borderRadius: '8px', 
                          background: '#fff', 
                          fontWeight: 600, 
                          color: '#475569',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option>All Modules</option>
                      </select>
                      <button 
                        style={{ 
                          padding: '8px 14px', 
                          fontSize: '12.5px', 
                          fontWeight: 700, 
                          border: '1.5px solid #E2E8F0', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          background: '#fff',
                          color: '#475569'
                        }}
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>
                  
                  <table className="ud-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40%', textAlign: 'left' }}>Module</th>
                        <th style={{ textAlign: 'center' }}>Access</th>
                        <th style={{ textAlign: 'center' }}>Create</th>
                        <th style={{ textAlign: 'center' }}>View</th>
                        <th style={{ textAlign: 'center' }}>Edit</th>
                        <th style={{ textAlign: 'center' }}>Delete</th>
                        <th style={{ textAlign: 'center' }}>Export</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PERM_ROWS.map(row => (
                        <tr key={row.name}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <svg className="module-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                              <div className="module-icon-wrap" style={{ color: '#2a195c', background: '#F5F3FF', border: '1px solid #E9D5FF' }}>{row.icon}</div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>{row.name}</span>
                                <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{row.subtitle}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>{renderBadge(row.access)}</td>
                          <td style={{ textAlign: 'center' }}>{renderBadge(row.create)}</td>
                          <td style={{ textAlign: 'center' }}>{renderBadge(row.view)}</td>
                          <td style={{ textAlign: 'center' }}>{renderBadge(row.edit)}</td>
                          <td style={{ textAlign: 'center' }}>{renderBadge(row.delete)}</td>
                          <td style={{ textAlign: 'center' }}>{renderBadge(row.export)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Legend & Pagination Info */}
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                      Showing 1 to 8 of 8 modules
                    </div>
                    <div className="perm-legend-row" style={{ display: 'flex', gap: '20px', borderTop: '1.5px solid #F1F5F9', paddingTop: '16px', marginTop: '4px' }}>
                      <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>
                        {renderBadge('granted')} <span>Granted</span>
                      </div>
                      <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>
                        {renderBadge('restricted')} <span>Restricted</span>
                      </div>
                      <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>
                        {renderBadge('na')} <span>Not Applicable</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  
                  {/* Role Info */}
                  <div className="ud-card" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>Role Information</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="badge-purple-role" style={{ width: 'fit-content', padding: '4px 10px', fontSize: '12px' }}>{userInfo.role}</div>
                      
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</div>
                        <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.5', marginTop: '4px', fontWeight: 500 }}>
                          Full platform administrator with complete configuration access scope.
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Role Statistics</div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1.5px solid #F1F5F9', paddingTop: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', fontSize: '13px', fontWeight: 500 }}>
                            <span style={{ color: '#64748B' }}>Users with this role</span>
                            <span style={{ fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>12</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', fontSize: '13px', fontWeight: 500 }}>
                            <span style={{ color: '#64748B' }}>Total permissions</span>
                            <span style={{ fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>48</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', fontSize: '13px', fontWeight: 500 }}>
                            <span style={{ color: '#64748B' }}>Granted permissions</span>
                            <span style={{ fontWeight: 700, color: '#16A34A', textAlign: 'right' }}>48 (100.0%)</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', fontSize: '13px', fontWeight: 500 }}>
                            <span style={{ color: '#64748B' }}>Restricted permissions</span>
                            <span style={{ fontWeight: 700, color: '#EF4444', textAlign: 'right' }}>0 (0.0%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '8px 0 4px 0' }}>Quick Actions</h2>
                    <div className="ud-qa-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {QUICK_ACTIONS.map(qa => (
                        <div 
                          key={qa.name} 
                          className="ud-qa-item" 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            cursor: 'pointer', 
                            padding: '12px 16px', 
                            border: '1.5px solid #E2E8F0', 
                            borderRadius: '10px',
                            background: '#fff',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => {
                            if (qa.name === 'Copy Permissions') {
                              alert('Permissions Copied!');
                            } else {
                              alert(`${qa.name} clicked`);
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: '#2a195c', display: 'flex', alignItems: 'center' }}>{qa.icon}</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{qa.name}</span>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#94A3B8' }}>
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {activeTab === 'Activity Log' && (
              <div className="ud-card">
                <div className="ud-card-tit">Activity Log</div>
                
                {/* Filters */}
                <div className="act-filter-row">
                  <div className="fr-search-wrap">
                    <span className="fr-search-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </span>
                    <input 
                      type="text" 
                      placeholder="Search activities..." 
                      className="fr-search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select className="bi-select" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
                    <option value="All Actions">All Actions</option>
                    <option value="Login">Login</option>
                    <option value="Update">Update</option>
                    <option value="Create">Create</option>
                    <option value="Delete">Delete</option>
                  </select>
                  <select className="bi-select" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
                    <option value="All Modules">All Modules</option>
                    <option value="Authentication">Authentication</option>
                    <option value="Settings">Settings</option>
                    <option value="Users">Users</option>
                    <option value="Franchise">Franchise</option>
                  </select>
                  <select className="bi-select">
                    <option>All Performed By</option>
                    <option>{userInfo.name}</option>
                  </select>
                  <div className="fr-search-wrap">
                    <span className="fr-search-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </span>
                    <input type="text" className="fr-search-input" style={{ paddingLeft: '28px' }} value="15 May 2024 - 21 May 2024" readOnly />
                  </div>
                  <button className="bi-reset-btn" onClick={() => { setSearchQuery(''); setSelectedAction('All Actions'); setSelectedModule('All Modules'); }}>Reset</button>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                  <table className="ud-table">
                    <thead>
                      <tr>
                        <th>Date &amp; Time</th>
                        <th>Action</th>
                        <th>Module</th>
                        <th>Details</th>
                        <th>Performed By</th>
                        <th>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                            No log entries match the search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log, idx) => (
                          <tr key={idx}>
                            <td>{log.time}</td>
                            <td>
                              <span className={`act-badge ${
                                log.action === 'Login' ? 'act-b-login' :
                                log.action === 'Update' ? 'act-b-update' :
                                log.action === 'Create' ? 'act-b-create' : 'act-b-delete'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ fontWeight: '700' }}>{log.module}</td>
                            <td>{log.details}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className={`usr-avatar ${log.avatarCls}`}>{log.performedByInitials}</div>
                                <span style={{ fontWeight: '600' }}>{log.performedBy}</span>
                              </div>
                            </td>
                            <td style={{ fontFamily: 'monospace' }}>{log.ip}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer pagination */}
                <div className="bi-tcard-ft" style={{ border: 'none', background: 'none', padding: '10px 0 0' }}>
                  <div className="bi-tcard-ft-lbl">Showing 1 to {filteredLogs.length} of 4 entries</div>
                  <div className="bi-pg">
                    <button className="bi-pgb" disabled>&lt;&lt;</button>
                    <button className="bi-pgb" disabled>&lt;</button>
                    <button className="bi-pgb cur">1</button>
                    <button className="bi-pgb" disabled>2</button>
                    <button className="bi-pgb" disabled>3</button>
                    <span style={{ color: '#94A3B8', padding: '0 4px' }}>...</span>
                    <button className="bi-pgb" disabled>6</button>
                    <button className="bi-pgb" disabled>&gt;</button>
                    <button className="bi-pgb" disabled>&gt;&gt;</button>
                    <select className="bi-select" style={{ height: '28px', padding: '0 6px', fontSize: '12px', marginLeft: '6px' }}>
                      <option>10 / page</option>
                    </select>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '24px', fontFamily: 'sans-serif', color: '#64748B' }}>
        Loading Profile...
      </div>
    }>
      <UserProfileContent />
    </Suspense>
  );
}
