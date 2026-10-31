'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';


/* ── Evegah Logo (uses real logo.png or evegah_brand.png when collapsed) ── */
export const EvegahLogo = ({ height = 40, collapsed = false }: { height?: number; collapsed?: boolean }) => {
  if (collapsed) {
    return (
      <Image
        src="/evegah_brand.png"
        alt="Evegah"
        width={38}
        height={38}
        style={{ height: '36px', width: '36px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
        priority
      />
    );
  }
  return (
    <Image
      src="/logo.png"
      alt="Evegah"
      width={160}
      height={42}
      style={{ height: height, width: 'auto', objectFit: 'contain', display: 'block' }}
      priority
    />
  );
};

/* ── Icons ── */
const strokeBase = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const Ic = (p: React.SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 24 24" {...strokeBase} {...p} />;

const icons: Record<string, React.ReactNode> = {
  dashboard: <Ic><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></Ic>,
  reg: <Ic><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></Ic>,
  vehicle: <Ic><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" /><path d="M5.5 17.5l4-8h4l2.5 8" /><path d="M8.5 12h5" /><path d="M12 9l-1.5 2.5h2L11 14" strokeWidth="1.8" /></Ic>,
  user: <Ic><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></Ic>,
  renter: <Ic><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Ic>,
  battery: <Ic><rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="13" x2="23" y2="11" /><line x1="7" y1="12" x2="11" y2="8" /><line x1="11" y1="8" x2="11" y2="12" /><line x1="11" y1="12" x2="15" y2="12" /></Ic>,
  reports: <Ic><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></Ic>,
  alerts: <Ic><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Ic>,
  zone: <Ic><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></Ic>,
  franchise: <Ic><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Ic>,
  usersrole: <Ic><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Ic>,
  announcements: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /><path d="M2 8c0-2.2 1.8-4 4-4" /><path d="M22 8c0-2.2-1.8-4-4-4" /></svg>,
  payment: <Ic><rect x="2" y="5" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="10" x2="22" y2="10" /></Ic>,
  co2: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 21 3c-1 5.5-2.5 7.5-6.1 11.8A7 7 0 0 1 11 20z" /><path d="M9 11l3 3" /></svg>,
  iot: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /><path d="M9 4v2M15 4v2M9 18v2M15 18v2M4 9h2M4 15h2M18 9h2M18 15h2" /></svg>,
  settings: <Ic><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Ic>,
  maintenance: <Ic><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></Ic>,
  chevdown: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  chevup: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>,
  help: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  arr: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
};

/* ── Nav config ── */
interface NavGroup {
  key: string; icon?: string; label: string;
  href?: string;
  children?: { label: string; href: string }[];
  isHeader?: boolean;
}

const NAV: NavGroup[] = [
  { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: '/' },

  { key: 'hdr_mgmt', label: 'MANAGEMENT', isHeader: true },
  {
    key: 'reg', icon: 'reg', label: 'Registrations', children: [
      { label: 'New Ride', href: '/new-rider' },
      { label: 'Retain Ride', href: '/retain-rider' },
      { label: 'Return Ride', href: '/return-ride' },
      { label: 'Extend Ride', href: '/extend-ride' },
      { label: 'Franchise Users', href: '/franchise-users' },
    ]
  },
  {
    key: 'vehicles', icon: 'vehicle', label: 'Vehicles', children: [
      { label: 'Vehicle List', href: '/vehicles/all' },
      { label: 'Vehicle Models', href: '/vehicles/models' },
      { label: 'Map', href: '/vehicles/map' },
      { label: 'Active Rides', href: '/vehicles/active' },
      { label: 'History', href: '/vehicles/history' },
    ]
  },
  {
    key: 'renters', icon: 'renter', label: 'Riders', children: [
      { label: 'Riders List', href: '/renters' },
      { label: 'Reserved Rides', href: '/renters/reserved' },
    ]
  },
  {
    key: 'zone', icon: 'zone', label: 'Zone Management', children: [
      { label: 'Zone List', href: '/zones' },
      { label: 'Zone Pricing', href: '/zones/pricing' },
      { label: 'Assign Zone', href: '/zones/assign' },
    ]
  },
  {
    key: 'franchise', icon: 'franchise', label: 'Franchise', children: [
      { label: 'Franchise List', href: '/franchise/list' },
      { label: 'Franchise Detail', href: '/franchise/detail' },
      { label: 'Franchise Onboarding', href: '/super-admin/franchise-onboarding' },
      { label: 'Subscriptions', href: '/super-admin/subscriptions' },
      { label: 'White Label Settings', href: '/super-admin/white-label' },
      { label: 'Subscription Packages', href: '/franchise/packages' },
      { label: 'Expenses', href: '/franchise/expenses' },
      { label: 'White Label Config', href: '/franchise/white-label' },
    ]
  },
  {
    key: 'usersrole', icon: 'usersrole', label: 'Users & Roles', children: [
      { label: 'Users', href: '/users' },
      { label: 'Roles', href: '/roles' },
    ]
  },

  { key: 'hdr_ops', label: 'OPERATIONS', isHeader: true },
  {
    key: 'battery', icon: 'battery', label: 'Battery', children: [
      { label: 'Battery Inventory', href: '/battery/inventory' },
      { label: 'Battery Inward', href: '/battery/inward' },
      { label: 'Battery Swap', href: '/battery-swap' },
      { label: 'Battery List', href: '/battery/list' },
      { label: 'Swap History', href: '/battery/swap-history' },
    ]
  },
  {
    key: 'maintenance', icon: 'maintenance', label: 'Maintenance', children: [
      { label: 'Overview', href: '/maintenance/overview' },
      { label: 'All Maintenance', href: '/maintenance/all' },
      { label: 'Upcoming Services', href: '/maintenance/upcoming' },
      { label: 'Service History', href: '/maintenance/history' },
    ]
  },
  {
    key: 'iot', icon: 'iot', label: 'IoT Devices', children: [
      { label: 'Inward', href: '/iot-devices/inward' },
      { label: 'Installed Devices', href: '/iot-devices/installed' },
      { label: 'Device Alerts', href: '/iot-devices/alerts' },
      { label: 'Device Map', href: '/iot-devices/map' },
    ]
  },
  {
    key: 'payment', icon: 'payment', label: 'Payments', children: [
      { label: 'Payment Users', href: '/payment' },
      { label: 'Payment History', href: '/payment/history' },
      { label: 'Deposit Refunds', href: '/payment/refund' },
      { label: 'Coupons', href: '/payment/coupons' },
      { label: 'Franchise Transactions', href: '/franchise/transactions' },
    ]
  },
  { key: 'attendance', icon: 'renter', label: 'Attendance', href: '/attendance' },

  { key: 'hdr_sys', label: 'SYSTEM', isHeader: true },
  { key: 'reports', icon: 'reports', label: 'Reports', href: '/reports' },
  { key: 'alerts', icon: 'alerts', label: 'Alerts', href: '/alerts' },
  { key: 'announcements', icon: 'announcements', label: 'Announcements', href: '/announcements' },
  { key: 'co2', icon: 'co2', label: 'Co2 Saving', href: '/co2-saving' },
  {
    key: 'settings', icon: 'settings', label: 'Settings', children: [
      { label: 'General', href: '/settings/general' },
      { label: 'Theme Settings', href: '/settings/theme' },
      { label: 'Mobile App Settings', href: '/settings/mobile-app' },
      { label: 'Notifications', href: '/settings/notifications' },
      { label: 'Payment', href: '/settings/payment' },
      { label: 'Documents', href: '/settings/documents' },
      { label: 'Reserved Rides', href: '/settings/reserved-rides' },
      { label: 'Audit Logs', href: '/settings/audit-logs' },
      { label: 'White Label', href: '/settings/white-label' },
    ]
  },
];

const SUPER_ADMIN_NAV: NavGroup[] = [
  { key: 'dashboard', icon: 'dashboard', label: 'SA Dashboard', href: '/super-admin' },

  { key: 'hdr_mgmt', label: 'MANAGEMENT', isHeader: true },
  {
    key: 'reg', icon: 'reg', label: 'Registrations', children: [
      { label: 'New Ride', href: '/new-rider' },
      { label: 'Retain Ride', href: '/retain-rider' },
      { label: 'Return Ride', href: '/return-ride' },
      { label: 'Extend Ride', href: '/extend-ride' },
      { label: 'Franchise Users', href: '/franchise-users' },
    ]
  },
  {
    key: 'vehicles', icon: 'vehicle', label: 'Vehicles', children: [
      { label: 'Vehicle List', href: '/vehicles/all' },
      { label: 'Vehicle Models', href: '/vehicles/models' },
      { label: 'Map', href: '/vehicles/map' },
      { label: 'Active Rides', href: '/vehicles/active' },
      { label: 'History', href: '/vehicles/history' },
      { label: 'Vehicle Details', href: '/vehicles/detail' },
    ]
  },
  {
    key: 'renters', icon: 'renter', label: 'Riders', children: [
      { label: 'Riders List', href: '/renters' },
      { label: 'Reserved Rides', href: '/renters/reserved' },
    ]
  },
  {
    key: 'zone', icon: 'zone', label: 'Zone Management', children: [
      { label: 'Zone List', href: '/zones' },
      { label: 'Zone Pricing', href: '/zones/pricing' },
      { label: 'Assign Zone', href: '/zones/assign' },
    ]
  },
  {
    key: 'franchise', icon: 'franchise', label: 'Franchise', children: [
      { label: 'Franchise List', href: '/franchise/list' },
      { label: 'Franchise Detail', href: '/franchise/detail' },
      { label: 'Franchise Onboarding', href: '/super-admin/franchise-onboarding' },
      { label: 'Subscriptions', href: '/super-admin/subscriptions' },
      { label: 'White Label Settings', href: '/super-admin/white-label' },
      { label: 'Subscription Packages', href: '/franchise/packages' },
      { label: 'Expenses', href: '/franchise/expenses' },
      { label: 'White Label Config', href: '/franchise/white-label' },
    ]
  },
  {
    key: 'usersrole', icon: 'usersrole', label: 'Users & Roles', children: [
      { label: 'Users', href: '/users' },
      { label: 'Roles', href: '/roles' },
    ]
  },

  { key: 'hdr_ops', label: 'OPERATIONS', isHeader: true },
  {
    key: 'battery', icon: 'battery', label: 'Battery', children: [
      { label: 'Battery Inventory', href: '/battery/inventory' },
      { label: 'Battery Inward', href: '/battery/inward' },
      { label: 'Battery Monitoring', href: '/battery/monitoring' },
      { label: 'Battery Swap', href: '/battery-swap' },
      { label: 'Battery List', href: '/battery/list' },
      { label: 'Swap History', href: '/battery/swap-history' },
    ]
  },
  {
    key: 'maintenance', icon: 'maintenance', label: 'Maintenance', children: [
      { label: 'Overview', href: '/maintenance/overview' },
      { label: 'All Maintenance', href: '/maintenance/all' },
      { label: 'Upcoming Services', href: '/maintenance/upcoming' },
      { label: 'Service History', href: '/maintenance/history' },
    ]
  },
  {
    key: 'iot', icon: 'iot', label: 'IoT Devices', children: [
      { label: 'Inward', href: '/iot-devices/inward' },
      { label: 'Installed Devices', href: '/iot-devices/installed' },
      { label: 'Device Alerts', href: '/iot-devices/alerts' },
      { label: 'Device Map', href: '/iot-devices/map' },
    ]
  },
  {
    key: 'payment', icon: 'payment', label: 'Payments', children: [
      { label: 'Payment Users', href: '/payment' },
      { label: 'Payment History', href: '/payment/history' },
      { label: 'Deposit Refunds', href: '/payment/refund' },
      { label: 'Coupons', href: '/payment/coupons' },
      { label: 'Franchise Transactions', href: '/franchise/transactions' },
    ]
  },
  { key: 'attendance', icon: 'renter', label: 'Attendance', href: '/attendance' },

  { key: 'hdr_sys', label: 'SYSTEM', isHeader: true },
  { key: 'reports', icon: 'reports', label: 'Reports', href: '/reports' },
  { key: 'alerts', icon: 'alerts', label: 'Alerts', href: '/alerts' },
  { key: 'announcements', icon: 'announcements', label: 'Announcements', href: '/announcements' },
  { key: 'co2', icon: 'co2', label: 'Co2 Saving', href: '/co2-saving' },
  {
    key: 'settings', icon: 'settings', label: 'Settings', children: [
      { label: 'General Settings', href: '/settings' },
      { label: 'Audit Logs', href: '/settings/audit-logs' },
      { label: 'Documents Settings', href: '/settings/documents' },
      { label: 'White Label Config', href: '/settings/white-label' },
    ]
  },
];
const CSS = `
.ev-sb {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  bottom: 0 !important;

  width: 240px !important;
  min-width: 240px !important;
  max-width: 240px !important;

  height: 100vh !important;
  max-height: 100vh !important;
  height: 100dvh !important;
  max-height: 100dvh !important;

  background: var(--sb-bg, #fff);
  border-right: 1px solid var(--sb-border, #E5E7EB);

  display: flex !important;
  flex-direction: column !important;

  z-index: 1000;
  box-sizing: border-box;

  /* Strict 100vh screen lock */
  overflow: hidden !important;
  transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Collapsed Sidebar Mode (Icon-Only, 72px) */
.ev-sb.collapsed {
  width: 72px !important;
  min-width: 72px !important;
  max-width: 72px !important;
}

/* Sibling main content containers: 240px when expanded */
.ev-sb:not(.collapsed) + div,
.ev-sb:not(.collapsed) + main,
.ev-sb:not(.collapsed) ~ div[class*="-main"],
.ev-sb:not(.collapsed) ~ main[class*="-main"],
.ev-sb:not(.collapsed) ~ div {
  margin-left: 240px !important;
  width: calc(100% - 240px) !important;
  flex: 1 1 0% !important;
  min-width: 0 !important;
  transition: margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1), width 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Sibling main content containers: 72px when collapsed */
.ev-sb.collapsed + div,
.ev-sb.collapsed + main,
.ev-sb.collapsed ~ div[class*="-main"],
.ev-sb.collapsed ~ main[class*="-main"],
.ev-sb.collapsed ~ div {
  margin-left: 72px !important;
  width: calc(100% - 72px) !important;
  flex: 1 1 0% !important;
  min-width: 0 !important;
  transition: margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1), width 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Collapsed overrides */
.ev-sb.collapsed .ev-sb-logo {
  padding: 14px 10px 12px;
  justify-content: center;
}

.ev-sb.collapsed .ev-sb-group-hdr {
  height: 1px;
  padding: 0;
  margin: 10px 16px;
  background: var(--sb-border, #E5E7EB);
  font-size: 0;
  color: transparent;
  overflow: hidden;
}

.ev-sb.collapsed .ev-sb-ni {
  padding: 11px 0;
  justify-content: center;
}

.ev-sb.collapsed .ev-sb-ni-l {
  gap: 0;
  justify-content: center;
  width: 100%;
}

.ev-sb.collapsed .ev-sb-ni-lbl,
.ev-sb.collapsed .ev-sb-chev {
  display: none !important;
}

.ev-sb.collapsed .ev-sb-ni-ic {
  width: 20px;
  height: 20px;
  margin: 0 auto;
}

.ev-sb.collapsed .ev-sb-sub {
  display: none !important;
}

.ev-sb.collapsed .ev-sb-help {
  display: none !important;
}

.ev-sb.collapsed .ev-sb-user {
  padding: 12px 0;
  justify-content: center;
}

.ev-sb.collapsed .ev-sb-user-text,
.ev-sb.collapsed .ev-sb-logout-btn {
  display: none !important;
}

/* Hover Flyout Popover for Collapsed Sidebar */
.ev-sb-item-wrap {
  position: relative;
}

.ev-sb.collapsed .ev-sb-item-wrap:hover .ev-sb-flyout {
  display: flex !important;
}

.ev-sb-flyout {
  display: none;
  position: absolute;
  left: 68px;
  top: 0;
  min-width: 200px;
  background: var(--sb-bg, #ffffff);
  border: 1px solid var(--sb-border, #E2E8F0);
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 8px;
  z-index: 1050;
  flex-direction: column;
  gap: 3px;
}

.ev-sb-flyout-hdr {
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px 6px;
  border-bottom: 1px solid var(--sb-border, #F1F5F9);
  margin-bottom: 3px;
}

.ev-sb-flyout-item {
  display: block;
  padding: 7px 12px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--sb-text, #334155);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.15s;
}

.ev-sb-flyout-item:hover {
  background: var(--sb-act-bg, #EEF2FF);
  color: var(--sb-act-text, #2A195C);
  font-weight: 600;
}

.ev-sb-flyout-item.act {
  background: var(--sb-act-bg, #EEF2FF);
  color: var(--sb-act-text, #2A195C);
  font-weight: 700;
}

.ev-sb-group-hdr {
  font-size: 10px;
  font-weight: 700;
  color: #94A3B8;
  padding: 12px 18px 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.ev-sb-logo {
  display: flex;
  align-items: center;
  padding: 14px 18px 12px;
  border-bottom: 1px solid var(--sb-border, #E5E7EB);
  flex:0 0 auto;
}
.ev-sb-nav {
  flex: 1 1 auto;
  min-height: 0;
  padding: 6px 0;
  overflow-y: auto  !important;
  overflow-x: hidden !important;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE / Edge */
}
.ev-sb-nav::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
.ev-sb-ni {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7.5px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--sb-text, #374151);
  cursor: pointer;
  position: relative;
  transition: background .1s;
  border-radius: 0;
  justify-content: space-between;
}
.ev-sb-ni:hover {
  background: var(--sb-hover, #F9FAFB);
}
.ev-sb-ni.act {
  background: var(--sb-act-bg, #EEF2FF);
  color: var(--sb-act-text, #2a195c);
  font-weight: 600;
}
.ev-sb-ni.act::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--sb-act-text, #2a195c);
  border-radius: 0 2px 2px 0;
}
.ev-sb-ni-l { display: flex; align-items: center; gap: 10px; }
.ev-sb-ni-ic { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ev-sb-sub { padding: 0 0 0 40px; }
.ev-sb-sub-item {
  display: block;
  padding: 5.5px 14px;
  font-size: 12px;
  color: var(--sb-sub-text, #6B7280);
  cursor: pointer;
  transition: background .1s, color .1s;
  border-radius: 0;
}
.ev-sb-sub-item:hover {
  background: var(--sb-hover, #F9FAFB);
  color: var(--sb-act-text, #2a195c);
}
.ev-sb-sub-item.act {
  color: var(--sb-act-text, #2a195c);
  background: var(--sb-sub-act-bg, #F5F3FF);
  font-weight: 600;
  border-radius: 6px;
  margin: 1px 8px 1px 0;
}
.ev-sb-help {
  padding: 8px 12px;
  border-top: 1px solid var(--sb-border, #E5E7EB);
  flex: 0 0 auto;
  margin-top: auto;
}
.ev-sb-help-box {
  background: var(--sb-help-bg, #FAF5FF);
  border: 1px solid var(--sb-help-border, #E9D5FF);
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  margin-bottom: 6px;
}
.ev-sb-help-orb {
  width: 28px;
  height: 28px;
  background: var(--sb-help-orb-bg, #E9D5FF);
  color: var(--sb-help-orb-text, #2A195C);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ev-sb-help-t {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--sb-help-title, #0F172A);
}
.ev-sb-help-s {
  font-size: 10px;
  color: var(--sb-sub-text, #64748B);
  line-height: 1.3;
  margin: 0;
}
.ev-sb-contact {
  width: 100%;
  padding: 6px 10px;
  background: var(--sb-contact-bg, #FFF);
  color: var(--sb-contact-text, #2A195C);
  border: 1.5px solid var(--sb-contact-border, #2A195C);
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.ev-sb-contact:hover {
  background: var(--sb-contact-hover-bg, #2A195C);
  color: var(--sb-contact-hover-text, #FFF);
  border-color: var(--sb-contact-hover-border, #2A195C);
}
.ev-sb-user {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 14px;
  border-top: 1px solid var(--sb-border, #E5E7EB);
  cursor: pointer;
  flex-shrink: 0;
}
.ev-sb-user-av {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.ev-sb-user-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--sb-help-title, #111827);
}
.ev-sb-user-role {
  font-size: 10.5px;
  color: var(--sb-sub-text, #9CA3AF);
}

/* 14" Laptop & Small Screen Optimization */
@media screen and (max-width: 1536px) {
  .ev-sb {
    width: 230px !important;
    min-width: 230px !important;
    max-width: 230px !important;
  }
  .ev-sb + div,
  .ev-sb + main,
  .ev-sb ~ div[class*="-main"],
  .ev-sb ~ main[class*="-main"],
  .ev-sb ~ div {
    width: calc(100% - 230px) !important;
  }
  .ev-sb-ni {
    padding: 7px 14px;
    font-size: 12.5px;
  }
  .ev-sb-sub-item {
    padding: 5px 12px;
    font-size: 11.5px;
  }
  .ev-sb-group-hdr {
    padding: 10px 14px 3px;
    font-size: 9.5px;
  }
  .ev-sb-logo {
    padding: 12px 14px 10px;
  }
}

@media (max-height: 760px) {
  .ev-sb-help-box { display: none; }
  .ev-sb-help { padding: 6px 12px; }
}
`;

interface SidebarProps { activePath?: string; isOpen?: boolean }

export default function Sidebar({ activePath, isOpen = true }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const active = activePath || pathname;

  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [rawRole, setRawRole] = useState('super_admin');
  const [userRoleCode, setUserRoleCode] = useState('super_admin');
  const [permissions, setPermissions] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const loadSession = () => {
      const name = localStorage.getItem("evegah_user_name") || 'Himanshu';
      const roleVal = localStorage.getItem("evegah_role") || 'super_admin';
      const roleNameVal = localStorage.getItem("evegah_user_role_name") || 'Super Admin';
      const avatar = localStorage.getItem("evegah_user_avatar") || '';
      setUserName(name);
      if (avatar) setUserAvatar(avatar);

      setRawRole(roleVal);
      setUserRoleCode(roleVal);

      if (roleNameVal) {
        setUserRole(roleNameVal);
      } else if (roleVal === 'super_admin') setUserRole('Super Admin');
      else if (roleVal === 'admin') setUserRole('Platform Admin');
      else if (roleVal === 'operation_manager') setUserRole('Operation Manager');
      else if (roleVal === 'zone_manager') setUserRole('Zone Manager');
      else if (roleVal === 'zone_employee') setUserRole('Zone Employee');
      else if (roleVal === 'franchise_admin') setUserRole('Franchise Admin');
      else if (roleVal === 'franchise_zone_manager') setUserRole('Franchise Zone Manager');
      else if (roleVal === 'franchise_zone_employee') setUserRole('Franchise Zone Employee');
      else if (roleVal === 'first_time_franchise') setUserRole('Koramangala Hub');
      else if (roleVal === 'employee') setUserRole('Zone Employee');

      // Load permissions
      try {
        const storedPerms = localStorage.getItem("evegah_user_permissions");
        if (storedPerms) {
          setPermissions(JSON.parse(storedPerms));
        } else {
          setPermissions(null);
        }
      } catch (e) {
        console.error("Error loading permissions in Sidebar:", e);
      }
    };

    const loadTheme = () => {
      const savedTheme = localStorage.getItem("sidebar_theme") || "light";
      setTheme(savedTheme as 'light' | 'dark');
    };

    const loadCollapsed = () => {
      const c = localStorage.getItem("evegah_sidebar_collapsed") === "true";
      setIsCollapsed(c);
    };

    if (typeof window !== 'undefined') {
      loadSession();
      loadTheme();
      loadCollapsed();
      window.addEventListener("evegah_role_changed", loadSession);
      window.addEventListener("sidebar_theme_changed", loadTheme);
      window.addEventListener("evegah_sidebar_toggle", loadCollapsed);
      return () => {
        window.removeEventListener("evegah_role_changed", loadSession);
        window.removeEventListener("sidebar_theme_changed", loadTheme);
        window.removeEventListener("evegah_sidebar_toggle", loadCollapsed);
      };
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("evegah_role");
    localStorage.removeItem("evegah_user_name");
    localStorage.removeItem("evegah_user_role_name");
    localStorage.removeItem("evegah_user_email");
    localStorage.removeItem("evegah_user_zone");
    localStorage.removeItem("evegah_active_zone");
    localStorage.removeItem("evegah_selected_zone");
    localStorage.removeItem("evegah_user_avatar");
    localStorage.removeItem("evegah_user_permissions");
    localStorage.removeItem("evegah_assigned_dashboard");
    window.dispatchEvent(new Event("evegah_role_changed"));
    router.push('/login');
  };

  const KEY_MAP: Record<string, string> = {
    dashboard: 'Dashboard',
    reg: 'Registrations',
    vehicles: 'Vehicles',
    renters: 'Riders',
    battery: 'Battery',
    maintenance: 'Maintenance',
    iot: 'IoT Devices',
    payment: 'Payments',
    reports: 'Reports',
    alerts: 'Alerts',
    zone: 'Zone Management',
    franchise: 'Franchise',
    settings: 'Settings',
    usersrole: 'Users & Roles',
    announcements: 'Announcements',
    co2: 'Co2 Saving',
    attendance: 'Attendance'
  };

  const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
    super_admin: ['Dashboard', 'Registrations', 'Vehicles', 'Riders', 'Battery', 'Maintenance', 'IoT Devices', 'Payments', 'Reports', 'Alerts', 'Zone Management', 'Franchise', 'Settings', 'Users & Roles', 'Announcements', 'Co2 Saving', 'Attendance'],
    platform_admin: ['Dashboard', 'Registrations', 'Vehicles', 'Riders', 'Battery', 'Maintenance', 'IoT Devices', 'Payments', 'Reports', 'Alerts', 'Zone Management', 'Franchise', 'Settings', 'Users & Roles', 'Announcements', 'Co2 Saving', 'Attendance'],
    sf_admin: ['Dashboard', 'Registrations', 'Vehicles', 'Riders', 'Battery', 'Maintenance', 'IoT Devices', 'Payments', 'Reports', 'Alerts', 'Zone Management', 'Franchise', 'Settings', 'Users & Roles', 'Announcements', 'Co2 Saving', 'Attendance'],
    sf_001: ['Dashboard', 'Registrations', 'Vehicles', 'Riders', 'Battery', 'Maintenance', 'IoT Devices', 'Payments', 'Reports', 'Alerts', 'Zone Management', 'Franchise', 'Settings', 'Users & Roles', 'Announcements', 'Co2 Saving', 'Attendance'],
    zone_admin: ['Dashboard', 'Registrations', 'Vehicles', 'Riders', 'Zone Management', 'Maintenance', 'Reports', 'Alerts', 'Attendance', 'Users & Roles', 'Settings'],
    zone_manager: ['Dashboard', 'Registrations', 'Vehicles', 'Riders', 'Zone Management', 'Maintenance', 'Reports', 'Alerts', 'Attendance', 'Users & Roles', 'Settings'],
    zone_employee: ['Dashboard', 'Registrations', 'Vehicles', 'Riders', 'Battery', 'Maintenance', 'IoT Devices', 'Reports', 'Alerts', 'Attendance', 'Users & Roles', 'Settings'],
    operations_manager: ['Dashboard', 'Registrations', 'Vehicles', 'Battery', 'Maintenance', 'IoT Devices', 'Reports', 'Alerts', 'Attendance', 'Users & Roles', 'Settings'],
    employee: ['Dashboard', 'Registrations', 'Vehicles', 'Battery', 'Maintenance', 'IoT Devices', 'Reports', 'Alerts', 'Attendance', 'Users & Roles', 'Settings'],
    franchise_manager: ['Dashboard', 'Franchise', 'Riders', 'Vehicles', 'Payments', 'Reports', 'Settings', 'Users & Roles'],
    admin: ['Dashboard', 'Registrations', 'Vehicles', 'Riders', 'Battery', 'Maintenance', 'IoT Devices', 'Payments', 'Reports', 'Alerts', 'Zone Management', 'Franchise', 'Settings', 'Users & Roles', 'Announcements', 'Co2 Saving', 'Attendance'],
    battery_technician: ['Dashboard', 'Battery', 'IoT Devices', 'Maintenance', 'Alerts'],
    technician: ['Dashboard', 'Battery', 'IoT Devices', 'Maintenance', 'Alerts'],
    support_executive: ['Dashboard', 'Registrations', 'Riders', 'Alerts', 'Announcements'],
    fleet_manager: ['Dashboard', 'Vehicles', 'Maintenance', 'IoT Devices', 'Reports'],
    field_technician: ['Dashboard', 'Battery', 'Vehicles', 'Maintenance'],
    finance_manager: ['Dashboard', 'Payments', 'Franchise', 'Reports', 'Settings'],
    finance: ['Dashboard', 'Payments', 'Franchise', 'Reports', 'Settings'],
  };

  const isSuperAdmin = rawRole === 'super_admin' || userRole === 'Super Admin';
  const activeNav = isSuperAdmin ? SUPER_ADMIN_NAV : NAV;

  const rawFilteredNav = activeNav.map(g => {
    if (isSuperAdmin) return g;
    if (g.isHeader) return g;

    const permKey = KEY_MAP[g.key];
    if (!permKey || permKey === 'Dashboard') return g;

    if (permissions && typeof permissions === 'object' && Object.keys(permissions).length > 0) {
      const permObj = permissions[permKey];
      if (permObj && permObj.access === false) {
        return null;
      }
      return g;
    }

    const allowedModules = DEFAULT_ROLE_PERMISSIONS[userRoleCode.toLowerCase()] ||
      DEFAULT_ROLE_PERMISSIONS[rawRole.toLowerCase()] ||
      DEFAULT_ROLE_PERMISSIONS['operations_manager'] ||
      ['Dashboard'];
    return allowedModules.includes(permKey) ? g : null;
  }).filter(Boolean) as NavGroup[];

  // Remove empty header groups (MANAGEMENT, OPERATIONS, SYSTEM) when no sub-links are visible
  const filteredNav: NavGroup[] = [];
  for (let i = 0; i < rawFilteredNav.length; i++) {
    const item = rawFilteredNav[i];
    if (item.isHeader) {
      let hasVisibleChild = false;
      for (let j = i + 1; j < rawFilteredNav.length; j++) {
        if (rawFilteredNav[j].isHeader) break;
        hasVisibleChild = true;
        break;
      }
      if (hasVisibleChild) {
        filteredNav.push(item);
      }
    } else {
      filteredNav.push(item);
    }
  }

  const checkSubActive = (href: string, activePathStr: string) => {
    if (!activePathStr) return false;

    // Reserved Rides under Riders or Settings
    if (href === '/renters/reserved' || href === '/settings/reserved-rides') {
      return activePathStr.includes('reserved');
    }

    // Riders List under Riders (MUST NOT match reserved rides!)
    if (href === '/renters') {
      if (activePathStr.includes('reserved')) return false;
      return activePathStr === '/renters' || activePathStr.startsWith('/renters/profile') || activePathStr.startsWith('/renters/detail');
    }

    // Roles under Users & Roles
    if (href === '/roles') {
      return activePathStr === '/roles' || activePathStr.startsWith('/roles/') || activePathStr.includes('/roles');
    }

    // Users under Users & Roles (MUST NOT match roles!)
    if (href === '/users') {
      if (activePathStr.includes('role') || activePathStr.includes('roles')) return false;
      return activePathStr === '/users' || activePathStr.startsWith('/users/');
    }

    if (activePathStr === href) return true;
    if (href !== '/' && activePathStr.startsWith(href + '/')) return true;

    return false;
  };

  // auto-expand group containing active item
  const defaultOpen = filteredNav.reduce((acc, g) => {
    if (g.children?.some(c => checkSubActive(c.href, active))) acc[g.key] = true;
    return acc;
  }, {} as Record<string, boolean>);

  const [open, setOpen] = useState<Record<string, boolean>>(defaultOpen);

  useEffect(() => {
    filteredNav.forEach(g => {
      if (g.children?.some(c => checkSubActive(c.href, active))) {
        setOpen(p => ({ ...p, [g.key]: true }));
      }
    });
  }, [active]);

  const toggle = (key: string) => setOpen(p => ({ ...p, [key]: !p[key] }));

  const themeStyles = theme === 'dark' ? {
    '--sb-bg': '#130735',
    '--sb-text': '#E2E8F0',
    '--sb-border': 'rgba(255,255,255,0.1)',
    '--sb-hover': 'rgba(255,255,255,0.05)',
    '--sb-act-bg': 'rgba(255,255,255,0.1)',
    '--sb-act-text': '#FFF',
    '--sb-sub-text': '#CBD5E1',
    '--sb-sub-act-bg': 'rgba(255,255,255,0.15)',
    '--sb-help-bg': 'rgba(255,255,255,0.05)',
    '--sb-help-border': 'rgba(255,255,255,0.1)',
    '--sb-help-orb-bg': 'rgba(255,255,255,0.1)',
    '--sb-help-orb-text': '#FFF',
    '--sb-help-title': '#FFF',
    '--sb-contact-bg': 'transparent',
    '--sb-contact-text': '#FFF',
    '--sb-contact-border': 'rgba(255,255,255,0.4)',
    '--sb-contact-hover-bg': '#FFF',
    '--sb-contact-hover-text': '#2a195c',
    '--sb-contact-hover-border': '#FFF',
  } as React.CSSProperties : {} as React.CSSProperties;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <aside className={`ev-sb ${isCollapsed ? 'collapsed' : ''}`} style={{ display: isOpen ? undefined : 'none', ...themeStyles }}>
        {/* Logo */}
        <div
          className="ev-sb-logo"
          style={{ filter: theme === 'dark' ? 'invert(1) brightness(100)' : 'none', cursor: 'pointer' }}
          onClick={() => {
            const isEmp = userRoleCode.toLowerCase().includes('employee') || rawRole.toLowerCase().includes('employee') || userRole.toLowerCase().includes('employee');
            router.push(isEmp ? '/employee-dashboard' : (isSuperAdmin ? '/super-admin' : '/'));
          }}
        >
          <EvegahLogo height={46} collapsed={isCollapsed} />
        </div>

        {/* Nav */}
        <nav className="ev-sb-nav">
          {filteredNav.map(g => {
            if (g.isHeader) {
              return (
                <div key={g.key} className="ev-sb-group-hdr">
                  {g.label}
                </div>
              );
            }
            const isGroupActive = g.href === active || g.children?.some(c => checkSubActive(c.href, active));
            const isOpen = open[g.key];

            const currentPermKey = KEY_MAP[g.key];
            const isEmp = userRoleCode.toLowerCase().includes('employee') || rawRole.toLowerCase().includes('employee') || userRole.toLowerCase().includes('employee');

            return (
              <div key={g.key} className="ev-sb-item-wrap">
                {g.href ? (
                  <Link
                    href={g.key === 'dashboard' ? (isEmp ? '/employee-dashboard' : (isSuperAdmin ? '/super-admin' : '/')) : g.href}
                    className={`ev-sb-ni ${isGroupActive ? 'act' : ''}`}
                    title={isCollapsed ? g.label : undefined}
                  >
                    <div className="ev-sb-ni-l">
                      <span className="ev-sb-ni-ic">{g.icon && icons[g.icon]}</span>
                      <span className="ev-sb-ni-lbl">{g.label}</span>
                    </div>
                  </Link>
                ) : (
                  <div
                    className={`ev-sb-ni ${isGroupActive && !isOpen ? 'act' : ''}`}
                    onClick={() => toggle(g.key)}
                    title={isCollapsed ? g.label : undefined}
                  >
                    <div className="ev-sb-ni-l">
                      <span className="ev-sb-ni-ic">{g.icon && icons[g.icon]}</span>
                      <span className="ev-sb-ni-lbl">{g.label}</span>
                    </div>
                    <span className="ev-sb-chev" style={{ color: '#9CA3AF' }}>{isOpen ? icons.chevup : icons.chevdown}</span>
                  </div>
                )}

                {/* Sub items for expanded mode */}
                {g.children && isOpen && (
                  <div className="ev-sb-sub">
                    {g.children.filter(c => {
                      if (isSuperAdmin) return true;
                      if (permissions && typeof permissions === 'object' && Object.keys(permissions).length > 0 && currentPermKey) {
                        const subPermKey = `${currentPermKey}:${c.label}`;
                        const subPermObj = permissions[subPermKey];
                        if (subPermObj && subPermObj.access === false) {
                          return false;
                        }
                      }
                      return true;
                    }).map(c => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`ev-sb-sub-item ${checkSubActive(c.href, active) ? 'act' : ''}`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Hover Flyout for Collapsed Mode */}
                <div className="ev-sb-flyout">
                  <div className="ev-sb-flyout-hdr">{g.label}</div>
                  {g.href ? (
                    <Link
                      href={g.key === 'dashboard' ? (isEmp ? '/employee-dashboard' : (isSuperAdmin ? '/super-admin' : '/')) : g.href}
                      className={`ev-sb-flyout-item ${isGroupActive ? 'act' : ''}`}
                    >
                      Open {g.label}
                    </Link>
                  ) : (
                    g.children?.filter(c => {
                      if (isSuperAdmin) return true;
                      if (permissions && typeof permissions === 'object' && Object.keys(permissions).length > 0 && currentPermKey) {
                        const subPermKey = `${currentPermKey}:${c.label}`;
                        const subPermObj = permissions[subPermKey];
                        if (subPermObj && subPermObj.access === false) return false;
                      }
                      return true;
                    }).map(c => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`ev-sb-flyout-item ${checkSubActive(c.href, active) ? 'act' : ''}`}
                      >
                        {c.label}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Help box */}
        <div className="ev-sb-help">
          <div className="ev-sb-help-box">
            <div className="ev-sb-help-orb">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div>
              <div className="ev-sb-help-t">Need Help?</div>
              <p className="ev-sb-help-s">Our support team is here to help you 24/7</p>
            </div>
          </div>
          <button className="ev-sb-contact">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Contact Support
          </button>
        </div>

        {/* User profile */}
        <div className="ev-sb-user">
          {userAvatar ? (
            <img
              src={userAvatar}
              className="ev-sb-user-av"
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              alt={userName}
            />
          ) : (
            <div className="ev-sb-user-av">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
          )}
          <div className="ev-sb-user-text" style={{ flex: 1, minWidth: 0 }} onClick={() => router.push('/settings')}>
            <div className="ev-sb-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div className="ev-sb-user-role">{userRole}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="ev-sb-logout-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'background 0.2s',
              flexShrink: 0
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#FEE2E2'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}

