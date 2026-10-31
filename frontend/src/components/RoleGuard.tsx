'use client';
import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

interface RoleGuardProps {
  children: ReactNode;
  moduleName?: string;
}

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

export default function RoleGuard({ children, moduleName }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [roleName, setRoleName] = useState<string>('Super Admin');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawRole = localStorage.getItem('evegah_role') || 'super_admin';
    const roleNameVal = localStorage.getItem('evegah_user_role_name') || (rawRole === 'super_admin' ? 'Super Admin' : rawRole);
    setRoleName(roleNameVal);

    const normRole = rawRole.toLowerCase().replace(/[\s_-]+/g, '_');
    const normName = roleNameVal.toLowerCase().replace(/[\s_-]+/g, '_');

    if (
      normRole === 'super_admin' || 
      normName === 'super_admin' || 
      normRole === 'platform_admin' || 
      normName === 'sf_admin' || 
      normRole === 'sf_admin' || 
      normName === 'sf_001' || 
      normRole === 'sf_001' || 
      normRole === 'admin'
    ) {
      setIsAllowed(true);
      return;
    }

    // Determine module key from pathname if not explicitly provided
    let checkModule = moduleName;
    if (!checkModule) {
      if (pathname.startsWith('/users') || pathname.startsWith('/roles')) checkModule = 'Users & Roles';
      else if (pathname.startsWith('/vehicles')) checkModule = 'Vehicles';
      else if (pathname.startsWith('/renters')) checkModule = 'Riders';
      else if (pathname.startsWith('/zones')) checkModule = 'Zone Management';
      else if (pathname.startsWith('/franchise')) checkModule = 'Franchise';
      else if (pathname.startsWith('/battery')) checkModule = 'Battery';
      else if (pathname.startsWith('/maintenance')) checkModule = 'Maintenance';
      else if (pathname.startsWith('/iot-devices')) checkModule = 'IoT Devices';
      else if (pathname.startsWith('/payment')) checkModule = 'Payments';
      else if (pathname.startsWith('/reports')) checkModule = 'Reports';
      else if (pathname.startsWith('/alerts')) checkModule = 'Alerts';
      else if (pathname.startsWith('/settings')) checkModule = 'Settings';
      else if (pathname.startsWith('/new-rider') || pathname.startsWith('/retain-rider') || pathname.startsWith('/return-ride') || pathname.startsWith('/extend-ride')) checkModule = 'Registrations';
      else checkModule = 'Dashboard';
    }

    if (checkModule === 'Dashboard') {
      setIsAllowed(true);
      return;
    }

    try {
      const storedPerms = localStorage.getItem('evegah_user_permissions');
      if (storedPerms) {
        const perms = JSON.parse(storedPerms);
        if (perms[checkModule]) {
          setIsAllowed(perms[checkModule].access !== false);
          return;
        }
      }
    } catch (e) {
      console.error('Error parsing permissions in RoleGuard:', e);
    }

    const allowedList = DEFAULT_ROLE_PERMISSIONS[rawRole.toLowerCase()] || ['Dashboard'];
    setIsAllowed(allowedList.includes(checkModule));
  }, [pathname, moduleName]);

  if (isAllowed === null) {
    return null; // loading state
  }

  if (!isAllowed) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Sidebar />
        <div style={{ marginLeft: '230px', flex: 1, display: 'flex', flexDirection: 'column', width: 'calc(100% - 230px)' }}>
          <TopBar />
          <div style={{ padding: '60px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '18px', padding: '40px 32px', textAlign: 'center', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '64px', height: '64px', background: '#FEE2E2', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', fontFamily: "'Outfit', sans-serif" }}>Access Restricted</h2>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', margin: '0 0 24px' }}>
                Your current role (<strong>{roleName}</strong>) does not have permission to access the requested module. Please contact your Super Admin to update your access rights.
              </p>
              <button 
                onClick={() => router.push('/')} 
                style={{ background: '#6366F1', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}
              >
                Return to My Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
