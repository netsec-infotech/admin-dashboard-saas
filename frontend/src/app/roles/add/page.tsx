"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import RoleGuard from '@/components/RoleGuard';

const CSS = `
.role-shell { display: flex; min-height: 100vh; background: #fff; font-family: 'Inter', sans-serif; }
.role-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.role-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Breadcrumb */
.role-bc { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #64748B; margin-bottom: 2px; }
.role-bc-link { color: #64748B; text-decoration: none; cursor: pointer; }
.role-bc-link:hover { color: #2a195c; }
.role-bc-sep { color: #CBD5E1; }
.role-bc-curr { color: #2A195C; }

/* Header & actions */
.role-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 4px; }
.role-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 6px; letter-spacing: -0.02em; }
.role-subtitle { font-size: 13.5px; color: #64748B; margin: 0; font-weight: 400; }

.role-header-actions { display: flex; align-items: center; gap: 12px; }
.role-btn { padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; border: 1.5px solid #E2E8F0; background: #fff; color: #475569; }
.role-btn:hover { border-color: #2a195c; color: #2a195c; }
.role-btn-draft { border-color: #8B5CF6; color: #8B5CF6; }
.role-btn-draft:hover { background: #F5F3FF; }
.role-btn-primary { background: #2a195c; color: #fff; border-color: #2a195c; }
.role-btn-primary:hover { background: #4338CA; border-color: #4338CA; }

/* Grid Layout */
.role-grid { display: grid; grid-template-columns: 3.5fr 6.5fr; gap: 20px; align-items: start; }
.role-left-col { display: flex; flex-direction: column; gap: 20px; }
.role-right-col { display: flex; flex-direction: column; gap: 20px; }

/* Card styles */
.role-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.role-card-title-row { display: flex; align-items: center; gap: 8px; border-bottom: 1.5px solid #F1F5F9; padding-bottom: 14px; margin-bottom: 20px; }
.role-card-title { font-size: 14.5px; font-weight: 700; color: #1E293B; margin: 0; }
.role-card-desc { font-size: 11.5px; color: #64748B; margin-top: -16px; margin-bottom: 20px; }

/* Form field styles */
.role-form { display: flex; flex-direction: column; gap: 18px; }
.role-field { display: flex; flex-direction: column; gap: 6px; }
.role-label { font-size: 11.5px; font-weight: 700; color: #334155; }
.role-req { color: #EF4444; }
.role-sub-lbl { font-size: 10px; color: #94A3B8; margin-top: 2px; }

.role-input { width: 100%; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 500; outline: none; background: #fff; color: #1E293B; transition: border-color .15s; }
.role-input::placeholder { color: #94A3B8; font-weight: 400; }
.role-input:focus { border-color: #6366F1; }

.role-textarea { width: 100%; height: 80px; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 500; outline: none; background: #fff; color: #1E293B; transition: border-color .15s; resize: none; font-family: inherit; }
.role-textarea:focus { border-color: #6366F1; }
.role-textarea-counter { display: flex; justify-content: flex-end; font-size: 10px; color: #94A3B8; margin-top: 2px; }

.role-select { width: 100%; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; font-weight: 500; outline: none; background: #fff; color: #1E293B; transition: border-color .15s; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 11px; padding-right: 32px; }
.role-select:focus { border-color: #6366F1; }

/* Status Toggle buttons */
.role-status-row { display: flex; gap: 8px; }
.role-status-btn { flex: 1; padding: 10px; font-size: 12.5px; font-weight: 700; border: 1.5px solid #E2E8F0; border-radius: 8px; cursor: pointer; background: #fff; color: #64748B; transition: all .15s; text-align: center; }
.role-status-btn.active { background: #EEF2FF; border-color: #6366F1; color: #6366F1; }

/* Permissions Layout */
.role-perm-hdr { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; }
.role-search-wrap { width: 280px; position: relative; display: flex; align-items: center; }
.role-search-input { width: 100%; padding: 9px 12px 9px 34px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12px; font-weight: 500; outline: none; background: #fff; color: #1E293B; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 10px; padding-right: 30px; }
.role-search-input:focus { border-color: #6366F1; }
.role-search-ic { position: absolute; left: 11px; color: #94A3B8; display: flex; }

.role-perm-ctrls { display: flex; gap: 8px; }
.role-ctrl-btn { padding: 8px 16px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12px; font-weight: 700; color: #64748B; background: #fff; cursor: pointer; transition: all .15s; }
.role-ctrl-btn:hover { border-color: #6366F1; color: #6366F1; }
.role-ctrl-btn-primary { border-color: #6366F1; color: #6366F1; background: #F5F3FF; }

/* Permissions Table */
.role-tbl-wrap { border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; }
.role-tbl { width: 100%; border-collapse: collapse; text-align: left; }
.role-tbl th { background: #FAFBFD; padding: 12px 14px; font-size: 10px; font-weight: 700; color: #475569; border-bottom: 1px solid #E2E8F0; text-transform: uppercase; letter-spacing: 0.05em; }
.role-tbl td { padding: 12px 14px; font-size: 12.5px; color: #1E293B; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.role-tbl tr:last-child td { border-bottom: none; }

.role-module-cell { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #0F172A; }
.role-module-cell-sub { display: flex; align-items: center; gap: 8px; padding-left: 28px; color: #475569; font-weight: 500; font-size: 11.5px; position: relative; }
.role-module-cell-sub::before { content: ''; position: absolute; left: 16px; top: -12px; bottom: 18px; width: 1.5px; background: #E2E8F0; }
.role-module-cell-sub::after { content: ''; position: absolute; left: 16px; bottom: 18px; width: 8px; height: 1.5px; background: #E2E8F0; }

.role-expand-btn { background: none; border: none; padding: 2px; color: #94A3B8; cursor: pointer; display: flex; align-items: center; transition: transform .15s; }
.role-expand-btn.expanded { transform: rotate(90deg); color: #6366F1; }
.role-module-ic { color: #6366F1; display: flex; align-items: center; }

/* Custom styled Checkbox */
.role-cb-input { width: 15px; height: 15px; accent-color: #6366F1; border: 1.5px solid #CBD5E1; border-radius: 4px; cursor: pointer; outline: none; }
.role-cb-input:disabled { opacity: 0.25; cursor: not-allowed; }

/* Custom Permissions list */
.role-custom-row { display: flex; align-items: center; justify-content: space-between; border-top: 1.5px solid #F1F5F9; padding-top: 16px; margin-top: 16px; }
.role-custom-list { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
.role-custom-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #FAFBFD; border: 1px solid #F1F5F9; border-radius: 8px; }
.role-custom-lbl { font-size: 12.5px; font-weight: 600; color: #475569; }
.role-custom-rm { background: none; border: none; color: #EF4444; font-size: 11px; font-weight: 700; cursor: pointer; }
.role-custom-rm:hover { text-decoration: underline; }
`;

interface SubPage {
  name: string;
  permissions: {
    access: boolean;
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  };
  supported: {
    access: boolean;
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  };
}

interface ModulePermission {
  name: string;
  desc: string;
  icon: React.ReactNode;
  expanded: boolean;
  permissions: {
    access: boolean;
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  };
  supported: {
    access: boolean;
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  };
  subPages: SubPage[];
}

function AddRoleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id') || searchParams.get('edit');

  const [roleName, setRoleName] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [assignedDashboard, setAssignedDashboard] = useState('Auto-Detect from Role');
  const [description, setDescription] = useState('');
  const [reportingTo, setReportingTo] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [charCount, setCharCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom permissions state
  const [customPermInput, setCustomPermInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);

  // Detailed dynamic permissions list
  const [modules, setModules] = useState<ModulePermission[]>([
    {
      name: 'Registrations',
      desc: 'Manage registrations, new rides, returns and hub users',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      subPages: [
        { name: 'New Ride', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Retain Ride', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Return Ride', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Franchise Users', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } }
      ]
    },
    {
      name: 'Dashboard',
      desc: 'View dashboards and analytics across platform roles',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
      expanded: true,
      permissions: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      supported: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      subPages: [
        { name: 'Super Admin Dashboard', permissions: { access: true, create: true, view: true, edit: true, delete: true, export: true }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Zone Admin Dashboard', permissions: { access: true, create: true, view: true, edit: true, delete: true, export: true }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Operations Dashboard', permissions: { access: true, create: true, view: true, edit: true, delete: true, export: true }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Franchise Dashboard', permissions: { access: true, create: true, view: true, edit: true, delete: true, export: true }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'BMS Battery Dashboard', permissions: { access: true, create: true, view: true, edit: true, delete: true, export: true }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'IoT Devices Dashboard', permissions: { access: true, create: true, view: true, edit: true, delete: true, export: true }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Riders & Renters Dashboard', permissions: { access: true, create: true, view: true, edit: true, delete: true, export: true }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Payments & Revenue Dashboard', permissions: { access: true, create: true, view: true, edit: true, delete: true, export: true }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Maintenance & Service Dashboard', permissions: { access: true, create: true, view: true, edit: true, delete: true, export: true }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Attendance & Shift Dashboard', permissions: { access: true, create: true, view: true, edit: true, delete: true, export: true }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
      ]
    },
    {
      name: 'Riders',
      desc: 'Manage riders and rider analytics',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: true, edit: true, delete: true, export: false },
      subPages: [
        { name: 'Riders List', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: false } },
        { name: 'Reserved Rides log', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: false } }
      ]
    },
    {
      name: 'Vehicles',
      desc: 'Manage vehicles and documents',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" /><path d="M5.5 17.5l4-8h4l2.5 8" /><path d="M8.5 12h5" /><path d="M12 9l-1.5 2.5h2L11 14" strokeWidth="1.8" /></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      subPages: [
        { name: 'Vehicle List', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Active Rides Tracker', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Vehicle Details Spec', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } }
      ]
    },
    {
      name: 'Battery',
      desc: 'Battery inventory and operations',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/><line x1="7" y1="12" x2="11" y2="8"/><line x1="11" y1="8" x2="11" y2="12"/><line x1="11" y1="12" x2="15" y2="12"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: true, edit: true, delete: true, export: false },
      subPages: [
        { name: 'Battery Inventory', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: false } },
        { name: 'Battery Inward', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: false } },
        { name: 'Battery List Catalog', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: false } },
        { name: 'Swap History Analytics', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: false } }
      ]
    },
    {
      name: 'IoT Devices',
      desc: 'Manage IoT devices and tracking',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: false, view: true, edit: true, delete: false, export: false },
      subPages: [
        { name: 'Inward Registration', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: false, view: true, edit: true, delete: false, export: false } },
        { name: 'Installed Devices catalog', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: false, view: true, edit: true, delete: false, export: false } },
        { name: 'Device Alerts Hub', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: false, view: true, edit: true, delete: false, export: false } },
        { name: 'Live Device Geolocation Map', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: false, view: true, edit: true, delete: false, export: false } }
      ]
    },
    {
      name: 'Payments',
      desc: 'View and manage payments',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: false, view: true, edit: true, delete: true, export: false },
      subPages: [
        { name: 'Payment History Ledger', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: false, view: true, edit: true, delete: true, export: false } },
        { name: 'Deposit Refunds Manager', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: false, view: true, edit: true, delete: true, export: false } }
      ]
    },
    {
      name: 'Reports',
      desc: 'Generate and view reports',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      subPages: [
        { name: 'Franchise Reports', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: false, export: true } },
        { name: 'Vehicle Analytics', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: false, export: true } },
        { name: 'Rental Logs Report', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: false, export: true } },
        { name: 'Battery Health Report', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: false, export: true } },
        { name: 'Financial Revenue Report', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: false, export: true } }
      ]
    },
    {
      name: 'Alerts',
      desc: 'View and manage alerts',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: false, edit: false, delete: false, export: false },
      subPages: [
        { name: 'System Crash Alerts', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: false, edit: false, delete: false, export: false } }
      ]
    },
    {
      name: 'Zone Management',
      desc: 'Manage zones and hubs',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: false, view: true, edit: false, delete: false, export: false },
      subPages: [
        { name: 'Geofenced Zones List', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: false, view: true, edit: false, delete: false, export: false } },
        { name: 'Zone Pricing parameters', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: false, view: true, edit: false, delete: false, export: false } }
      ]
    },
    {
      name: 'Franchise',
      desc: 'Franchise management',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: false, view: true, edit: false, delete: false, export: false },
      subPages: [
        { name: 'Franchise Details config', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: false, view: true, edit: false, delete: false, export: false } },
        { name: 'Subscription packages', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: false, view: true, edit: false, delete: false, export: false } },
        { name: 'Expense Transactions logs', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: false, view: true, edit: false, delete: false, export: false } }
      ]
    },
    {
      name: 'Users & Roles',
      desc: 'User accounts, roles, access permissions matrix and team management',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      subPages: [
        { name: 'Users List', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Roles & Permissions', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Create User', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Create Role', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } }
      ]
    },
    {
      name: 'Maintenance',
      desc: 'Vehicle service, maintenance schedules and technician tasks',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      subPages: [
        { name: 'Service Requests', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Technician Schedule', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Maintenance Log History', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } }
      ]
    },
    {
      name: 'Attendance',
      desc: 'Staff shift schedules, attendance logs and work tracker',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      subPages: [
        { name: 'Daily Attendance', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Staff Shifts', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Leave Tracker', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } }
      ]
    },
    {
      name: 'Announcements',
      desc: 'Broadcast notifications and system announcements',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      subPages: [
        { name: 'Active Broadcasts', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'New Announcement', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } }
      ]
    },
    {
      name: 'Co2 Saving',
      desc: 'Carbon emissions tracking and sustainability metrics',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      subPages: [
        { name: 'Environmental Analytics', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Carbon Credit Ledger', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } }
      ]
    },
    {
      name: 'Settings',
      desc: 'System preferences, Theme, Mobile App, and Notifications config',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
      expanded: false,
      permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false },
      supported: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      subPages: [
        { name: 'General Settings', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Theme Settings', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Mobile App Settings', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Notification Settings', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Payment Settings', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Document Parameters', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Reserved Rides Config', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'Audit Logs', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } },
        { name: 'White Label Config', permissions: { access: false, create: false, view: false, edit: false, delete: false, export: false }, supported: { access: true, create: true, view: true, edit: true, delete: true, export: true } }
      ]
    },
  ]);

  // Fetch existing role details if in edit mode
  useEffect(() => {
    if (!editId) return;

    const fetchRoleDetail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/roles/${editId}`);
        if (res.ok) {
          const resObj = await res.json();
          const roleData = resObj.data;
          if (roleData) {
            setRoleName(roleData.name || '');
            setRoleCode(roleData.code || '');
            setDescription(roleData.description || '');
            setCharCount((roleData.description || '').length);
            setReportingTo(roleData.reporting_to || '');
            setStatus(roleData.status || 'Active');
            
            // Parse custom permissions
            let customPerms: string[] = [];
            try {
              customPerms = Array.isArray(roleData.custom_permissions) 
                ? roleData.custom_permissions 
                : JSON.parse(roleData.custom_permissions || '[]');
            } catch (_) {}
            setCustomPermissions(customPerms);

            // Parse modules permissions
            let perms: Record<string, any> = {};
            try {
              perms = typeof roleData.permissions === 'object' && roleData.permissions !== null
                ? roleData.permissions 
                : JSON.parse(roleData.permissions || '{}');
            } catch (_) {}

            setModules(prev => prev.map(mod => {
              const modPerm = perms[mod.name] || { access: false, create: false, view: false, edit: false, delete: false, export: false };
              const updatedSubPages = mod.subPages.map(sub => {
                const subKey = `${mod.name}:${sub.name}`;
                const subPerm = perms[subKey] || { access: false, create: false, view: false, edit: false, delete: false, export: false };
                return {
                  ...sub,
                  permissions: {
                    access: !!subPerm.access,
                    create: !!subPerm.create,
                    view: !!subPerm.view,
                    edit: !!subPerm.edit,
                    delete: !!subPerm.delete,
                    export: !!subPerm.export,
                  }
                };
              });

              return {
                ...mod,
                permissions: {
                  access: !!modPerm.access,
                  create: !!modPerm.create,
                  view: !!modPerm.view,
                  edit: !!modPerm.edit,
                  delete: !!modPerm.delete,
                  export: !!modPerm.export,
                },
                subPages: updatedSubPages
              };
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching role details:', err);
      }
    };

    fetchRoleDetail();
  }, [editId]);

  const handleCreateRole = async (isDraft: boolean = false) => {
    if (!roleName || !roleCode) {
      alert('Role Name and Role Code are required.');
      return;
    }

    const permissionsPayload: Record<string, any> = {};
    modules.forEach(mod => {
      permissionsPayload[mod.name] = {
        access: mod.permissions.access,
        create: mod.permissions.create,
        view: mod.permissions.view,
        edit: mod.permissions.edit,
        delete: mod.permissions.delete,
        export: mod.permissions.export
      };
      
      mod.subPages.forEach(sub => {
        permissionsPayload[`${mod.name}:${sub.name}`] = {
          access: sub.permissions.access,
          create: sub.permissions.create,
          view: sub.permissions.view,
          edit: sub.permissions.edit,
          delete: sub.permissions.delete,
          export: sub.permissions.export
        };
      });
    });

    // Auto-assign Dashboard permissions for every created or updated role
    if (!permissionsPayload['Dashboard'] || permissionsPayload['Dashboard'].access === false) {
      permissionsPayload['Dashboard'] = {
        access: true,
        create: true,
        view: true,
        edit: true,
        delete: true,
        export: true
      };
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const url = editId ? `${apiUrl}/roles/${editId}` : `${apiUrl}/roles`;
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roleName,
          code: roleCode,
          description,
          reporting_to: reportingTo,
          status: isDraft ? 'Inactive' : status,
          permissions: permissionsPayload,
          custom_permissions: customPermissions
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        alert(editId ? `Role "${roleName}" updated successfully!` : `Role "${roleName}" created successfully!`);
        router.push('/roles');
      } else {
        alert(`Error: ${resData.message || 'Failed to submit role'}`);
      }
    } catch (err) {
      console.error(err);
      alert(editId ? 'Network error. Failed to update role.' : 'Network error. Failed to create role.');
    }
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleToggleExpand = (index: number) => {
    setModules(prev => prev.map((mod, idx) => idx === index ? { ...mod, expanded: !mod.expanded } : mod));
  };

  const handleExpandAll = () => {
    setModules(prev => prev.map(mod => ({ ...mod, expanded: true })));
  };

  const handleCollapseAll = () => {
    setModules(prev => prev.map(mod => ({ ...mod, expanded: false })));
  };

  // Toggle main module permission column checkbox
  const handleToggleModulePerm = (modIdx: number, column: keyof ModulePermission['permissions']) => {
    setModules(prev => prev.map((mod, idx) => {
      if (idx !== modIdx) return mod;
      
      const newVal = !mod.permissions[column];
      
      // Update main module value
      const updatedPerms = { ...mod.permissions, [column]: newVal };
      
      // Cascade/propagate value to all its sub-pages
      const updatedSubPages = mod.subPages.map(sub => {
        if (!sub.supported[column]) return sub;
        return {
          ...sub,
          permissions: { ...sub.permissions, [column]: newVal }
        };
      });

      return {
        ...mod,
        permissions: updatedPerms,
        subPages: updatedSubPages
      };
    }));
  };

  // Toggle sub-page permission checkbox
  const handleToggleSubPagePerm = (modIdx: number, subIdx: number, column: keyof SubPage['permissions']) => {
    setModules(prev => prev.map((mod, idx) => {
      if (idx !== modIdx) return mod;

      const updatedSubPages = mod.subPages.map((sub, sidx) => {
        if (sidx !== subIdx) return sub;
        return {
          ...sub,
          permissions: { ...sub.permissions, [column]: !sub.permissions[column] }
        };
      });

      // Update main module status based on sub-pages (if all sub-pages checked -> check main, else uncheck main)
      const allChecked = updatedSubPages.every(sub => !sub.supported[column] || sub.permissions[column]);
      const updatedModulePerms = { ...mod.permissions, [column]: allChecked };

      return {
        ...mod,
        permissions: updatedModulePerms,
        subPages: updatedSubPages
      };
    }));
  };

  const isColAllChecked = (column: keyof ModulePermission['permissions']) => {
    let totalSupported = 0;
    let checkedCount = 0;
    modules.forEach(mod => {
      if (mod.supported[column]) {
        totalSupported++;
        if (mod.permissions[column]) checkedCount++;
      }
      mod.subPages.forEach(sub => {
        if (sub.supported[column]) {
          totalSupported++;
          if (sub.permissions[column]) checkedCount++;
        }
      });
    });
    return totalSupported > 0 && checkedCount === totalSupported;
  };

  const handleToggleColumnAll = (column: keyof ModulePermission['permissions'], checked: boolean) => {
    setModules(prev => prev.map(mod => {
      const updatedPerms = { ...mod.permissions };
      if (mod.supported[column]) {
        updatedPerms[column] = checked;
      }
      const updatedSubPages = mod.subPages.map(sub => {
        if (sub.supported[column]) {
          return {
            ...sub,
            permissions: { ...sub.permissions, [column]: checked }
          };
        }
        return sub;
      });
      return {
        ...mod,
        permissions: updatedPerms,
        subPages: updatedSubPages
      };
    }));
  };

  const handleSelectAllPermissions = () => {
    setModules(prev => prev.map(mod => {
      const updatedPerms = { ...mod.permissions };
      (Object.keys(mod.permissions) as (keyof ModulePermission['permissions'])[]).forEach(col => {
        if (mod.supported[col]) updatedPerms[col] = true;
      });
      const updatedSubPages = mod.subPages.map(sub => {
        const subPerms = { ...sub.permissions };
        (Object.keys(sub.permissions) as (keyof SubPage['permissions'])[]).forEach(col => {
          if (sub.supported[col]) subPerms[col] = true;
        });
        return { ...sub, permissions: subPerms };
      });
      return {
        ...mod,
        permissions: updatedPerms,
        subPages: updatedSubPages
      };
    }));
  };

  const handleDeselectAllPermissions = () => {
    setModules(prev => prev.map(mod => {
      const updatedPerms = { ...mod.permissions };
      (Object.keys(mod.permissions) as (keyof ModulePermission['permissions'])[]).forEach(col => {
        updatedPerms[col] = false;
      });
      const updatedSubPages = mod.subPages.map(sub => {
        const subPerms = { ...sub.permissions };
        (Object.keys(sub.permissions) as (keyof SubPage['permissions'])[]).forEach(col => {
          subPerms[col] = false;
        });
        return { ...sub, permissions: subPerms };
      });
      return {
        ...mod,
        permissions: updatedPerms,
        subPages: updatedSubPages
      };
    }));
  };


  // Add custom permission helper
  const handleAddCustomPermission = () => {
    if (customPermInput.trim()) {
      setCustomPermissions(prev => [...prev, customPermInput.trim()]);
      setCustomPermInput('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveCustomPermission = (index: number) => {
    setCustomPermissions(prev => prev.filter((_, idx) => idx !== index));
  };

  const filteredModules = modules.filter(mod => 
    mod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    mod.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RoleGuard moduleName="Users & Roles">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="role-shell">
        <Sidebar activePath="/roles" />
        <div className="role-main">
          <TopBar />
          
          <div className="role-page">
            {/* Breadcrumbs */}
            <div className="role-bc">
              <span className="role-bc-link" onClick={() => router.push('/')}>Home</span>
              <span className="role-bc-sep">&gt;</span>
              <span className="role-bc-link" onClick={() => router.push('/users')}>Users &amp; Roles</span>
              <span className="role-bc-sep">&gt;</span>
              <span className="role-bc-link" onClick={() => router.push('/roles')}>Roles</span>
              <span className="role-bc-sep">&gt;</span>
              <span className="role-bc-curr">{editId ? 'Edit Role' : 'Add New Role'}</span>
            </div>

            {/* Title Row */}
            <div className="role-header">
              <div>
                <h1 className="role-title">{editId ? 'Edit Platform Role' : 'Create Platform Role'}</h1>
                <p className="role-subtitle">{editId ? 'Modify role metadata, permissions matrix and details.' : 'Define new role metadata, permissions template and options.'}</p>
              </div>
              <div className="role-header-actions">
                <button className="role-btn" onClick={() => router.push('/roles')}>Cancel</button>
                {!editId && (
                  <button className="role-btn role-btn-draft" onClick={() => handleCreateRole(true)}>Save as Draft</button>
                )}
                <button className="role-btn role-btn-primary" onClick={() => handleCreateRole(false)}>
                  {editId ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </div>

            {/* Main Form Grid */}
            <div className="role-grid">
              {/* Left Column: Role Details Form */}
              <div className="role-left-col">
                <div className="role-card">
                  <div className="role-card-title-row">
                    <h2 className="role-card-title">Role Information</h2>
                  </div>

                  <div className="role-form">
                    <div className="role-field">
                      <label className="role-label">Role Name <span className="role-req">*</span></label>
                      <input 
                        type="text" 
                        className="role-input" 
                        placeholder="e.g. Fleet Manager" 
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                      />
                    </div>

                    <div className="role-field">
                      <label className="role-label">
                        Role Code <span className="role-req">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="role-input" 
                        placeholder="e.g. SUPER_ADMIN, PLATFORM_ADMIN" 
                        style={{ textTransform: 'uppercase', background: editId ? '#F1F5F9' : '#fff' }}
                        value={roleCode} 
                        onChange={(e) => setRoleCode(e.target.value)}
                        disabled={!!editId}
                      />
                      <span className="role-sub-lbl">
                        {editId ? 'Role code is a unique system identifier and cannot be modified.' : 'System identifier name. Must be unique and capitalized.'}
                      </span>
                    </div>

                    <div className="role-field">
                      <label className="role-label">Assigned Dashboard View <span className="role-req">*</span></label>
                      <select 
                        className="role-select"
                        value={assignedDashboard}
                        onChange={(e) => setAssignedDashboard(e.target.value)}
                      >
                        <option value="Auto-Detect from Role">Auto-Detect from Role</option>
                        <option value="Super Admin Dashboard">Super Admin Dashboard</option>
                        <option value="Zone Admin Dashboard">Zone Admin Dashboard</option>
                        <option value="Operations Manager Dashboard">Operations Manager Dashboard</option>
                        <option value="Support Executive Dashboard">Support Executive Dashboard</option>
                        <option value="Franchise Manager Dashboard">Franchise Manager Dashboard</option>
                        <option value="BMS Battery Dashboard">BMS Battery Dashboard</option>
                        <option value="Fleet Manager Dashboard">Fleet Manager Dashboard</option>
                        <option value="Finance Manager Dashboard">Finance Manager Dashboard</option>
                      </select>
                      <span className="role-sub-lbl">Select which dashboard view users with this role will see when logged in.</span>
                    </div>

                    <div className="role-field">
                      <label className="role-label">Description</label>
                      <textarea 
                        className="role-textarea" 
                        placeholder="Enter role description" 
                        maxLength={250}
                        value={description}
                        onChange={handleDescChange}
                      />
                      <div className="role-textarea-counter">{charCount}/250</div>
                    </div>

                    <div className="role-field">
                      <label className="role-label">Reporting To</label>
                      <select 
                        className="role-select"
                        value={reportingTo}
                        onChange={(e) => setReportingTo(e.target.value)}
                      >
                        <option value="">Select Role (Optional)</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Zone Admin">Zone Admin</option>
                        <option value="Operations Director">Operations Director</option>
                      </select>
                    </div>

                    <div className="role-field">
                      <label className="role-label">Role Status</label>
                      <div className="role-status-row">
                        <button 
                          type="button"
                          className={`role-status-btn ${status === 'Active' ? 'active' : ''}`}
                          onClick={() => setStatus('Active')}
                        >
                          Active
                        </button>
                        <button 
                          type="button"
                          className={`role-status-btn ${status === 'Inactive' ? 'active' : ''}`}
                          onClick={() => setStatus('Inactive')}
                        >
                          Inactive
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Assign Permissions Table */}
              <div className="role-right-col">
                <div className="role-card">
                  <div className="role-card-title-row" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 12 }}>
                    <h2 className="role-card-title">Assign Permissions</h2>
                  </div>
                  <p className="role-card-desc">Select the modules and permissions this role should have access to.</p>

                  {/* Actions Header inside card */}
                  <div className="role-perm-hdr">
                    <div className="role-search-wrap">
                      <span className="role-search-ic">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </span>
                      <input 
                        type="text" 
                        className="role-search-input" 
                        placeholder="Search modules or permissions..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="role-perm-ctrls" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button type="button" className="role-ctrl-btn role-ctrl-btn-primary" onClick={handleExpandAll}>Expand All</button>
                      <button type="button" className="role-ctrl-btn" onClick={handleCollapseAll}>Collapse All</button>
                      <button type="button" className="role-ctrl-btn" style={{ borderColor: '#10B981', color: '#10B981' }} onClick={handleSelectAllPermissions}>Select All</button>
                      <button type="button" className="role-ctrl-btn" style={{ borderColor: '#EF4444', color: '#EF4444' }} onClick={handleDeselectAllPermissions}>Deselect All</button>
                    </div>
                  </div>

                  {/* Grid Table */}
                  <div className="role-tbl-wrap">
                    <table className="role-tbl">
                      <thead>
                        <tr>
                          <th style={{ width: '40%', verticalAlign: 'middle' }}>Module</th>
                          {(['access', 'create', 'view', 'edit', 'delete', 'export'] as const).map(col => (
                            <th key={col} style={{ textAlign: 'center', padding: '10px 6px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <span style={{ textTransform: 'capitalize', fontSize: '10px' }}>{col}</span>
                                <input 
                                  type="checkbox" 
                                  className="role-cb-input" 
                                  style={{ margin: 0, cursor: 'pointer' }}
                                  checked={isColAllChecked(col)} 
                                  onChange={(e) => handleToggleColumnAll(col, e.target.checked)}
                                />
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {filteredModules.map((mod, modIdx) => {
                          const mainIndex = modules.findIndex(m => m.name === mod.name);
                          
                          return (
                            <>
                              {/* Main Module Row */}
                              <tr key={mod.name} style={{ background: mod.expanded ? '#FAFBFD' : undefined }}>
                                <td>
                                  <div className="role-module-cell">
                                    <button 
                                      className={`role-expand-btn ${mod.expanded ? 'expanded' : ''}`}
                                      onClick={() => handleToggleExpand(mainIndex)}
                                      type="button"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="9 18 15 12 9 6" />
                                      </svg>
                                    </button>
                                    <span className="role-module-ic">{mod.icon}</span>
                                    <span>{mod.name}</span>
                                  </div>
                                </td>
                                
                                {(['access', 'create', 'view', 'edit', 'delete', 'export'] as const).map(col => (
                                  <td key={col}>
                                    <input 
                                      type="checkbox"
                                      className="role-cb-input"
                                      disabled={!mod.supported[col]}
                                      checked={mod.supported[col] && mod.permissions[col]}
                                      onChange={() => handleToggleModulePerm(mainIndex, col)}
                                    />
                                  </td>
                                ))}
                              </tr>

                              {/* Expanded Dropdown Page Section */}
                              {mod.expanded && mod.subPages.map((sub, subIdx) => (
                                <tr key={`${mod.name}-${sub.name}`} style={{ background: '#FCFDFE' }}>
                                  <td>
                                    <div className="role-module-cell-sub">
                                      <span>{sub.name}</span>
                                    </div>
                                  </td>

                                  {(['access', 'create', 'view', 'edit', 'delete', 'export'] as const).map(col => (
                                    <td key={col}>
                                      <input 
                                        type="checkbox"
                                        className="role-cb-input"
                                        disabled={!sub.supported[col]}
                                        checked={sub.supported[col] && sub.permissions[col]}
                                        onChange={() => handleToggleSubPagePerm(mainIndex, subIdx, col)}
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Optional custom permissions section */}
                  <div className="role-custom-row">
                    <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Custom Permissions (Optional)</h3>
                    <button 
                      type="button"
                      className="role-ctrl-btn role-ctrl-btn-primary" 
                      style={{ padding: '6px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setShowCustomInput(!showCustomInput)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Add Custom Permission
                    </button>
                  </div>
                  
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0' }}>Add any custom or restricted permissions for this role.</p>

                  {showCustomInput && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px', background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <input 
                        type="text" 
                        className="role-input" 
                        style={{ height: '36px' }}
                        placeholder="e.g. ALLOW_OVERRIDE_REFUND" 
                        value={customPermInput}
                        onChange={(e) => setCustomPermInput(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                      />
                      <button 
                        type="button" 
                        className="role-btn role-btn-primary" 
                        style={{ padding: '8px 16px', height: '36px' }}
                        onClick={() => handleAddCustomPermission()}
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {customPermissions.length > 0 && (
                    <div className="role-custom-list">
                      {customPermissions.map((perm, index) => (
                        <div key={index} className="role-custom-item">
                          <span className="role-custom-lbl">{perm}</span>
                          <button 
                            type="button" 
                            className="role-custom-rm"
                            onClick={() => handleRemoveCustomPermission(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

export default function AddRolePage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>Loading Role Configuration...</div>}>
      <AddRoleForm />
    </Suspense>
  );
}
