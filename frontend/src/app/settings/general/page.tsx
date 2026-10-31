'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GeneralRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/settings?tab=General');
  }, [router]);
  return null;
}
