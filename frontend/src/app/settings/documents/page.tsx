'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DocumentsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/settings?tab=Documents');
  }, [router]);
  return null;
}
