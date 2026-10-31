'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const PATH_MAP: Record<string, string> = {
  '/vehicles': 'Vehicles',
  '/renters': 'Riders',
  '/battery': 'Battery',
  '/iot-devices': 'IoT Devices',
  '/payment': 'Payments',
  '/reports': 'Reports',
  '/alerts': 'Alerts',
  '/zones': 'Zone Management',
  '/franchise': 'Franchise',
  '/settings': 'Settings',
  '/users': 'Settings',
  '/roles': 'Settings',
};

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Exclude login page from guard
    if (pathname === '/login') {
      setAuthorized(true);
      return;
    }

    const checkAuth = () => {
      const storedPerms = localStorage.getItem('evegah_user_permissions');
      const role = localStorage.getItem('evegah_role');

      // If no role, redirect to login
      if (!role) {
        router.push('/login');
        return;
      }

      // Super Admin has full rights and bypasses all guard checks
      if (role === 'super_admin') {
        setAuthorized(true);
        return;
      }

      // Other roles require permissions
      if (!storedPerms) {
        router.push('/login');
        return;
      }

      try {
        const perms = JSON.parse(storedPerms);
        
        // Determine the module required for the current path
        let requiredModule = 'Dashboard'; // default
        
        for (const [pathPrefix, moduleName] of Object.entries(PATH_MAP)) {
          if (pathname.startsWith(pathPrefix)) {
            requiredModule = moduleName;
            break;
          }
        }

        // If the permissions object has this module and access is false, redirect! (Except Dashboard)
        if (requiredModule !== 'Dashboard' && perms[requiredModule] && perms[requiredModule].access === false) {
          console.warn(`Access denied to ${pathname} (Requires ${requiredModule})`);
          router.push('/'); // Redirect back to dashboard if access is denied
          return;
        }

        setAuthorized(true);
      } catch (e) {
        console.error('Error parsing permissions in RouteGuard', e);
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Prevent flashing of unauthorized content
  if (!authorized && pathname !== '/login') {
    return <div style={{ height: '100vh', width: '100vw', background: '#F8F9FF' }} />;
  }

  return <>{children}</>;
}
