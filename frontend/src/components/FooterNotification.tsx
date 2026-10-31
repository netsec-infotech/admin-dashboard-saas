'use client';

import Link from 'next/link';

const IconInfo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function FooterNotification() {
  return (
    <div className="footer-notif">
      <div className="footer-notif-left">
        <span className="footer-notif-icon"><IconInfo /></span>
        <span className="footer-notif-text">
          Make sure to collect all required documents and verify rider details before submitting any request.
        </span>
      </div>
      <Link href="/knowledge/guidelines" className="footer-notif-link">
        View Guidelines <IconArrowRight />
      </Link>
    </div>
  );
}
