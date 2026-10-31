'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/settings?tab=Payments');
  }, [router]);
  return null;
}
