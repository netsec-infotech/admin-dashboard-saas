"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import DateRangeFilter from '@/components/DateRangeFilter';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

.ev-tb{height:70px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 24px;gap:16px;position:sticky;top:0;z-index:90;flex-shrink:0;width:100%;box-sizing:border-box;font-family:'Plus Jakarta Sans',sans-serif}
.ev-tb-hamburger{width:36px;height:36px;border:1.5px solid #E2E8F0;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;background:#fff;transition:all 0.15s;flex-shrink:0}
.ev-tb-hamburger:hover{border-color:#6366F1;background:#F8FAFC}
.ev-tb-hamburger span{display:block;width:14px;height:1.8px;background:#64748B;border-radius:2px}
.ev-tb-user{display:flex;align-items:center;gap:12px}
.ev-tb-av{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#0F172A,#1E1B4B);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0;overflow:hidden;position:relative;font-family:'Outfit',sans-serif}
.ev-tb-av img{width:100%;height:100%;object-fit:cover}
.ev-tb-hello{font-size:16px;font-weight:800;color:#0F172A;font-family:'Outfit',sans-serif;letter-spacing:-0.01em;display:flex;align-items:center;gap:6px}
.ev-tb-check{width:15px;height:15px;background:#22C55E;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:bold}
.ev-tb-role{font-size:11.5px;color:#64748B;font-weight:500}
.ev-tb-spacer{flex:1}
.ev-tb-zone{display:flex;align-items:center;gap:8px;padding:8px 14px;border:1.5px solid #E2E8F0;border-radius:10px;background:#fff;cursor:pointer;font-size:12.5px;font-weight:600;color:#334155;transition:all 0.15s;box-shadow:0 1px 2px rgba(0,0,0,0.02);user-select:none;}
.ev-tb-zone:hover{border-color:#6366F1}
.ev-tb-zone-t{font-size:12.5px;font-weight:600;color:#334155}
.ev-tb-bell{width:38px;height:38px;border:1.5px solid #E2E8F0;border-radius:10px;background:#fff;color:#64748B;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:all 0.15s;flex-shrink:0}
.ev-tb-bell:hover{border-color:#6366F1;color:#6366F1}
.ev-tb-bell-dot{position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:#6366F1;color:#fff;font-size:9px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff}
.ev-tb-search-wrap{display:flex;align-items:center;border:1.5px solid #E2E8F0;border-radius:10px;padding:8px 14px;gap:8px;background:#FFF;width:420px;transition:border-color 0.15s;margin-left:16px}
.ev-tb-search-wrap:focus-within{border-color:#6366F1;box-shadow:0 0 0 3px rgba(99,102,241,0.1)}
.ev-tb-search-inp{border:none;outline:none;font-size:12.5px;color:#1E293B;width:100%;font-family:inherit;font-weight:500}
.ev-tb-search-inp::placeholder{color:#94A3B8}
.ev-tb-search-kb{border:1px solid #E2E8F0;border-radius:4px;padding:2px 5px;font-size:9.5px;color:#64748B;font-weight:700;background:#F8FAFC;white-space:nowrap;display:flex;align-items:center;justify-content:center;gap:2px}
.ev-tb-profile{display:flex;align-items:center;gap:10px;padding:6px 12px;border:1.5px solid #E2E8F0;border-radius:10px;cursor:pointer;background:#fff;transition:all 0.15s;user-select:none;}
.ev-tb-profile:hover{border-color:#6366F1;background:#F8FAFC}
.ev-tb-zone-dd{position:absolute;top:48px;right:0;background:#FFF;border:1.5px solid #E2E8F0;border-radius:12px;padding:6px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.15);z-index:100;width:230px;display:flex;flex-direction:column;gap:2px;max-height:280px;overflow-y:auto}
.ev-tb-zone-opt{padding:8px 12px;font-size:12.5px;font-weight:600;border:none;border-radius:6px;text-align:left;cursor:pointer;width:100%;transition:all 0.15s}
.ev-tb-user-menu{position:absolute;top:50px;right:0;background:#FFF;border:1.5px solid #E2E8F0;border-radius:14px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1);z-index:120;width:250px;overflow:hidden;animation:evMenuFade 0.15s ease-out}
.ev-tb-menu-item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;font-size:12.5px;font-weight:600;color:#334155;background:transparent;border:none;border-radius:8px;cursor:pointer;transition:all 0.15s;text-align:left}
.ev-tb-menu-item:hover{background:#F8FAFC;color:#2A195C}
.ev-tb-menu-logout{color:#EF4444}
.ev-tb-menu-logout:hover{background:#FEF2F2;color:#DC2626}
@keyframes evMenuFade{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
`;

const IBell = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IChevD = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showHand?: boolean;
  hideLeftAvatar?: boolean;
  leftAvatarText?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  notificationCount?: number;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  hideZone?: boolean;
  hideDateFilter?: boolean;
  onDateChange?: (start: string, end: string, text: string) => void;
  onToggle?: () => void;
}

function getInitials(name: string): string {
  if (!name) return 'EV';
  return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function roleLabel(rawRole: string | null): string {
  if (!rawRole) return 'Super Admin';
  const roleName = typeof window !== 'undefined' ? localStorage.getItem('evegah_user_role_name') : '';
  if (roleName) return roleName;
  if (rawRole === 'super_admin') return 'Super Admin';
  if (rawRole === 'admin') return 'Platform Admin';
  if (rawRole === 'zone_manager') return 'Zone Admin';
  if (rawRole === 'first_time_franchise') return 'Franchise Admin';
  if (rawRole === 'employee') return 'Zone Employee';
  if (rawRole === 'battery_technician') return 'Battery Technician';
  if (rawRole === 'operations_manager') return 'Operations Manager';
  return rawRole || 'User';
}

export default function TopBar({
  title,
  subtitle,
  showHand = false,
  hideLeftAvatar = false,
  leftAvatarText,
  showSearch = false,
  searchPlaceholder = "Search...",
  notificationCount = 1,
  userAvatar: propAvatar,
  hideZone = false,
  hideDateFilter = false,
  onDateChange,
  onToggle,
}: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Session state
  const [sessionName, setSessionName] = useState('');
  const [sessionEmail, setSessionEmail] = useState('');
  const [sessionRole, setSessionRole] = useState('');
  const [sessionAvatar, setSessionAvatar] = useState('');
  const [userAssignedZone, setUserAssignedZone] = useState('');

  // Dropdown states
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [activeZone, setActiveZone] = useState('');
  const [zonesList, setZonesList] = useState<string[]>([]);
  const [allZonesRaw, setAllZonesRaw] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const zoneMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/notifications`);
      if (res.ok) {
        const body = await res.json();
        setNotifications(body.data || []);
        setUnreadCount(body.unreadCount || 0);
      }
    } catch (_) {}
  };

  // Load session & apply user zone restrictions
  const loadSession = () => {
    if (typeof window === 'undefined') return;
    const name = localStorage.getItem('evegah_user_name') || 'Himanshu';
    const email = localStorage.getItem('evegah_user_email') || 'himanshu@evegah.com';
    const rawRole = localStorage.getItem('evegah_role') || 'super_admin';
    const storedRoleName = localStorage.getItem('evegah_user_role_name');
    const avatar = localStorage.getItem('evegah_user_avatar') || '';
    const userZone = (localStorage.getItem('evegah_user_zone') || '').trim();

    setSessionName(name);
    setSessionEmail(email);
    setSessionRole(storedRoleName || roleLabel(rawRole));
    setSessionAvatar(avatar);
    setUserAssignedZone(userZone);

    const isSuperOrAdmin = rawRole === 'super_admin' || storedRoleName === 'Super Admin';
    const isMultiZone = !userZone || userZone === 'All Zones' || userZone === 'Multiple Zones' || userZone === 'All Zones / Platform Wide';

    let currentActive = localStorage.getItem('evegah_active_zone') || localStorage.getItem('evegah_selected_zone');

    // If user has a specific assigned zone and is not Super Admin, lock strictly to that assigned zone
    if (!isSuperOrAdmin && !isMultiZone) {
      const allowed = userZone.split(',').map(s => s.trim()).filter(Boolean);
      if (allowed.length > 0) {
        if (!currentActive || !allowed.includes(currentActive)) {
          currentActive = allowed[0];
          localStorage.setItem('evegah_active_zone', currentActive);
          localStorage.setItem('evegah_selected_zone', currentActive);
          window.dispatchEvent(new Event('evegah_active_zone_changed'));
          window.dispatchEvent(new Event('evegah_zone_changed'));
        }
      }
    } else {
      if (!currentActive) {
        currentActive = 'All Zones';
        localStorage.setItem('evegah_active_zone', 'All Zones');
        localStorage.setItem('evegah_selected_zone', 'All Zones');
      }
    }

    setActiveZone(currentActive || 'All Zones');
  };

  // Fetch zones catalog from backend
  const fetchZones = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/zones`);
      if (res.ok) {
        const data = await res.json();
        const zones: any[] = Array.isArray(data) ? data : (data.data || []);
        setAllZonesRaw(zones);
        const names = zones.map((z: any) => z.name).filter(Boolean);
        if (names.length > 0) {
          setZonesList(names);
        }
      }
    } catch (e) {
      console.warn('TopBar: Could not fetch zones from backend');
    }
  };

  useEffect(() => {
    loadSession();
    fetchZones();
    fetchNotifications();

    // Click outside listener to close dropdowns
    const handleClickOutside = (e: MouseEvent) => {
      if (zoneMenuRef.current && !zoneMenuRef.current.contains(e.target as Node)) {
        setZoneDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    if (typeof window !== 'undefined') {
      window.addEventListener('evegah_role_changed', loadSession);
      window.addEventListener('evegah_active_zone_changed', loadSession);
      window.addEventListener('evegah_zone_changed', loadSession);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('evegah_role_changed', loadSession);
        window.removeEventListener('evegah_active_zone_changed', loadSession);
        window.removeEventListener('evegah_zone_changed', loadSession);
      };
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Permission route guard
  useEffect(() => {
    const getPermissionKeyForPath = (path: string): string => {
      if (path === '/' || path.startsWith('/dashboard')) return 'Dashboard';
      if (path.startsWith('/new-rider') || path.startsWith('/retain-rider') || path.startsWith('/return-ride') || path.startsWith('/extend-ride') || path.startsWith('/franchise-users')) return 'Registrations';
      if (path.startsWith('/vehicles')) return 'Vehicles';
      if (path.startsWith('/renters') || path.startsWith('/riders')) return 'Riders';
      if (path.startsWith('/battery')) return 'Battery';
      if (path.startsWith('/maintenance')) return 'Maintenance';
      if (path.startsWith('/iot-devices')) return 'IoT Devices';
      if (path.startsWith('/payment') || path.startsWith('/payments')) return 'Payments';
      if (path.startsWith('/reports')) return 'Reports';
      if (path.startsWith('/alerts')) return 'Alerts';
      if (path.startsWith('/zones')) return 'Zone Management';
      if (path.startsWith('/franchise')) return 'Franchise';
      if (path.startsWith('/settings')) return 'Settings';
      if (path.startsWith('/users') || path.startsWith('/roles')) return 'Settings';
      return '';
    };

    if (typeof window !== 'undefined') {
      const rawRole = localStorage.getItem('evegah_role');
      if (rawRole === 'super_admin') return; // super admin bypasses all

      const stored = localStorage.getItem('evegah_user_permissions');
      if (stored) {
        try {
          const permissions = JSON.parse(stored);
          const permKey = getPermissionKeyForPath(pathname);
          if (permKey && permKey !== 'Dashboard') {
            const perm = permissions[permKey];
            if (perm && perm.access === false) {
              alert(`Access Denied: You do not have permission to access ${permKey}.`);
              router.push('/');
            }
          }
        } catch (e) {
          console.error('Error parsing permissions in TopBar route guard:', e);
        }
      }
    }
  }, [pathname, router]);

  // Check if current page is within maintenance
  const isMaintenancePage = pathname?.startsWith('/maintenance');

  // Filter zones by type: Service Zone (Maintenance Hub) only visible on /maintenance
  // Rest of pages should only have operational zones access!
  const filteredByPageType = zonesList.filter(zName => {
    const zObj = allZonesRaw.find(z => z.name === zName);
    const zType = (zObj?.type || '').toLowerCase();
    const isServiceZone = zType.includes('service zone') || zType.includes('maintenance hub');
    if (isMaintenancePage) {
      return true; // on maintenance page, can see service zones and operational zones
    } else {
      return !isServiceZone; // on other pages, only operational zones
    }
  });

  // If user is on a non-maintenance page but has a Service Zone selected, auto-reset to 'All Zones'
  useEffect(() => {
    if (!isMaintenancePage && activeZone && activeZone !== 'All Zones') {
      const activeObj = allZonesRaw.find(z => z.name === activeZone);
      const activeType = (activeObj?.type || '').toLowerCase();
      if (activeType.includes('service zone') || activeType.includes('maintenance hub')) {
        const fallback = 'All Zones';
        localStorage.setItem('evegah_active_zone', fallback);
        localStorage.setItem('evegah_selected_zone', fallback);
        setActiveZone(fallback);
        window.dispatchEvent(new Event('evegah_active_zone_changed'));
        window.dispatchEvent(new Event('evegah_zone_changed'));
      }
    }
  }, [pathname, activeZone, allZonesRaw, isMaintenancePage]);

  // Determine allowed zones for this user
  const isSuperOrAdmin = sessionRole === 'Super Admin' || (typeof window !== 'undefined' && localStorage.getItem('evegah_role') === 'super_admin');
  const isMultiZoneUser = !userAssignedZone || userAssignedZone === 'All Zones' || userAssignedZone === 'Multiple Zones' || userAssignedZone === 'All Zones / Platform Wide';

  let displayZonesList: string[] = [];
  let canSelectAllZones = false;

  if (isSuperOrAdmin || isMultiZoneUser) {
    displayZonesList = filteredByPageType;
    canSelectAllZones = true;
  } else {
    // Strictly filter to the user's assigned zone(s) that match page type
    const allowed = userAssignedZone.split(',').map(s => s.trim()).filter(Boolean);
    const matched = filteredByPageType.filter(z => allowed.includes(z));
    displayZonesList = matched.length > 0 ? matched : allowed.filter(z => {
      const zObj = allZonesRaw.find(raw => raw.name === z);
      const zType = (zObj?.type || '').toLowerCase();
      const isServiceZone = zType.includes('service zone') || zType.includes('maintenance hub');
      return isMaintenancePage ? true : !isServiceZone;
    });
    canSelectAllZones = false;
  }

  // Handle Log Out
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of Evegah?')) {
      localStorage.removeItem('evegah_user_name');
      localStorage.removeItem('evegah_role');
      localStorage.removeItem('evegah_user_role_name');
      localStorage.removeItem('evegah_user_email');
      localStorage.removeItem('evegah_user_zone');
      localStorage.removeItem('evegah_active_zone');
      localStorage.removeItem('evegah_selected_zone');
      localStorage.removeItem('evegah_user_avatar');
      localStorage.removeItem('evegah_user_permissions');
      localStorage.removeItem('evegah_assigned_dashboard');
      window.dispatchEvent(new Event('evegah_role_changed'));
      router.push('/login');
    }
  };

  // Dynamic greeting: Clean up any hardcoded "Akash" or default to logged-in user
  const isHardcodedAkash = title && (title.toLowerCase().includes('akash') || title.toLowerCase().startsWith('hello'));
  const displayTitle = (isHardcodedAkash || !title) 
    ? `Hello, ${sessionName ? sessionName.split(' ')[0] : 'User'}` 
    : title;

  const isHardcodedRole = subtitle && (subtitle.toLowerCase().includes('akash') || subtitle === 'Zone Employee' || subtitle === 'Franchise Admin');
  const displaySubtitle = (isHardcodedRole || !subtitle) ? sessionRole : subtitle;
  const displayAvatar = propAvatar || sessionAvatar;
  const initials = sessionName ? getInitials(sessionName) : 'EV';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="ev-tb">
        {/* Hamburger */}
        <div 
          className="ev-tb-hamburger" 
          onClick={() => {
            if (onToggle) {
              onToggle();
            }
            const current = typeof window !== 'undefined' && localStorage.getItem('evegah_sidebar_collapsed') === 'true';
            const next = !current;
            localStorage.setItem('evegah_sidebar_collapsed', String(next));
            window.dispatchEvent(new Event('evegah_sidebar_toggle'));
          }}
          title="Toggle Sidebar (Expand / Collapse to Icons)"
        >
          <span />
          <span />
          <span />
        </div>

        {/* Left greeting / page title (Avatar removed from left, Name & Role kept intact) */}
        <div className="ev-tb-user">
          <div>
            <div className="ev-tb-hello">{displayTitle} {showHand && '👋'}</div>
            {displaySubtitle && <div className="ev-tb-role">{displaySubtitle}</div>}
          </div>
        </div>

        {/* Optional Search Bar */}
        {showSearch && (
          <div className="ev-tb-search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" className="ev-tb-search-inp" placeholder={searchPlaceholder} />
            <div className="ev-tb-search-kb">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
        )}

        <div className="ev-tb-spacer" />

        {/* Zone selector — strictly respects user's assigned zone */}
        {!hideZone && (
          <div style={{ position: 'relative' }} ref={zoneMenuRef}>
            <div 
              className="ev-tb-zone" 
              onClick={() => {
                setZoneDropdownOpen(!zoneDropdownOpen);
              }}
              title={!canSelectAllZones && displayZonesList.length === 1 ? `Operating Zone: ${activeZone} (Assigned)` : 'Select Operating Zone'}
            >
              <span style={{ color: '#2a195c' }}><IPin /></span>
              <span className="ev-tb-zone-t">
                {activeZone || (displayZonesList[0] || 'All Zones')}
              </span>
              <span style={{ color: '#9CA3AF' }}><IChevD /></span>
            </div>

            {zoneDropdownOpen && (
              <div className="ev-tb-zone-dd">
                {/* All Zones Option for Super Admin / Multi-Zone Roles only */}
                {canSelectAllZones && (
                  <button
                    className="ev-tb-zone-opt"
                    onClick={() => {
                      localStorage.setItem('evegah_active_zone', 'All Zones');
                      localStorage.setItem('evegah_selected_zone', 'All Zones');
                      window.dispatchEvent(new Event('evegah_active_zone_changed'));
                      window.dispatchEvent(new Event('evegah_zone_changed'));
                      setActiveZone('All Zones');
                      setZoneDropdownOpen(false);
                    }}
                    type="button"
                    style={{
                      color: activeZone === 'All Zones' || !activeZone ? '#FFF' : '#374151',
                      background: activeZone === 'All Zones' || !activeZone ? '#2a195c' : 'transparent',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    All Zones (Multi-Zone)
                  </button>
                )}

                {!canSelectAllZones && (
                  <div style={{ padding: '6px 10px', fontSize: '10.5px', fontWeight: '700', color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #F1F5F9' }}>
                    Assigned Operating Zone
                  </div>
                )}

                {displayZonesList.length === 0 && (
                  <div style={{ padding: '10px 12px', fontSize: '12px', color: '#94A3B8' }}>Loading assigned zones...</div>
                )}

                {displayZonesList.map(z => (
                  <button
                    key={z}
                    className="ev-tb-zone-opt"
                    onClick={() => {
                      localStorage.setItem('evegah_active_zone', z);
                      localStorage.setItem('evegah_selected_zone', z);
                      window.dispatchEvent(new Event('evegah_active_zone_changed'));
                      window.dispatchEvent(new Event('evegah_zone_changed'));
                      setActiveZone(z);
                      setZoneDropdownOpen(false);
                    }}
                    type="button"
                    style={{
                      color: activeZone === z ? '#FFF' : '#374151',
                      background: activeZone === z ? '#2a195c' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: activeZone === z ? '700' : '500'
                    }}
                  >
                    <IPin />
                    <span>{z}</span>
                    {!canSelectAllZones && (
                      <span style={{ marginLeft: 'auto', fontSize: '10px', background: activeZone === z ? 'rgba(255,255,255,0.2)' : '#EEF2FF', color: activeZone === z ? '#FFF' : '#6366F1', padding: '2px 6px', borderRadius: '4px' }}>
                        Assigned
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Date Range Filter Calendar (Same as Zone Admin across all pages) */}
        {!hideDateFilter && !pathname?.startsWith('/new-rider') && !pathname?.startsWith('/retain-rider') && (
          <DateRangeFilter onDateChange={onDateChange} />
        )}

        {/* Bell Notifications */}
        <div style={{ position: 'relative' }} ref={notifMenuRef}>
          <button className="ev-tb-bell" onClick={() => setIsNotifOpen(!isNotifOpen)}>
            <IBell />
            {unreadCount > 0 && (
              <span className="ev-tb-bell-dot">{unreadCount}</span>
            )}
          </button>

          {isNotifOpen && (
            <div className="ev-tb-zone-dd" style={{ width: '320px', padding: '10px', right: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>🔔 Live Telemetry Alerts</span>
                {unreadCount > 0 && (
                  <button
                    style={{ fontSize: '10.5px', color: '#6366F1', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer' }}
                    onClick={async () => {
                      try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                        await fetch(`${apiUrl}/notifications/mark-read`, { method: 'POST' });
                        setUnreadCount(0);
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      } catch (_) {}
                    }}
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '11.5px', color: '#94A3B8', textAlign: 'center', padding: '12px 0' }}>No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ background: n.read ? '#FAFBFD' : '#EEF2FF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>{n.title}</span>
                      <span style={{ fontSize: '11px', color: '#475569' }}>{n.message}</span>
                      <span style={{ fontSize: '9.5px', color: '#94A3B8', marginTop: '2px' }}>
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right User Profile — with Interactive Dropdown (Profile Edit & Log Out) */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <div className="ev-tb-profile" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                {sessionName || 'Himanshu'}
              </span>
              <span style={{ fontSize: '10.5px', color: '#9CA3AF', marginTop: '1px' }}>
                {sessionRole}
              </span>
            </div>
            <span style={{ color: '#9CA3AF', marginLeft: '4px' }}><IChevD /></span>
          </div>

          {userMenuOpen && (
            <div className="ev-tb-user-menu">
              {/* User Header Summary */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFD' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="ev-tb-av" style={{ width: '38px', height: '38px', background: sessionAvatar ? 'transparent' : 'linear-gradient(135deg,#2A195C,#6366F1)' }}>
                    {sessionAvatar ? (
                      <img src={sessionAvatar} alt={sessionName} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : initials}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sessionName || 'Himanshu'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sessionEmail || 'himanshu@evegah.com'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                    {sessionRole}
                  </span>
                  <span style={{ background: '#ECFDF5', color: '#059669', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <IPin /> {activeZone || userAssignedZone || 'Gotri Zone'}
                  </span>
                </div>
              </div>

              {/* Menu Actions */}
              <div style={{ padding: '6px' }}>
                <button 
                  type="button"
                  className="ev-tb-menu-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push('/users/profile');
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>Edit My Profile</span>
                </button>

                <button 
                  type="button"
                  className="ev-tb-menu-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push('/renters/profile');
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2"/><path d="M15 12h2"/><path d="M7 16h10"/></svg>
                  <span>Rider Profile / KYC</span>
                </button>

                <button 
                  type="button"
                  className="ev-tb-menu-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push('/settings');
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83-2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  <span>System Settings</span>
                </button>

                <div style={{ height: '1px', background: '#F1F5F9', margin: '6px 0' }} />

                <button 
                  type="button"
                  className="ev-tb-menu-item ev-tb-menu-logout"
                  onClick={handleLogout}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
