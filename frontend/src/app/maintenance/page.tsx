"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MaintenanceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/maintenance/overview');
  }, [router]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F8F9FF', fontFamily: 'sans-serif', color: '#64748B' }}>
      Redirecting to Maintenance Overview...
    </div>
  );
}
