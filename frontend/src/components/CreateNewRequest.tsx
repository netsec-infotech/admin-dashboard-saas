'use client';

import Link from 'next/link';

const IconArrowRight = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// Icons for each card
const IconNewRider = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);

const IconRetainRider = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <polyline points="16 11 18 13 22 9"/>
  </svg>
);

const IconReturnRide = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.49"/>
  </svg>
);

const IconExtendRide = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="12" y1="14" x2="12" y2="18"/>
    <line x1="10" y1="16" x2="14" y2="16"/>
  </svg>
);

const IconBatterySwap = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/>
    <line x1="23" y1="13" x2="23" y2="11"/>
    <line x1="7" y1="12" x2="11" y2="8"/>
    <line x1="11" y1="8" x2="11" y2="12"/>
    <line x1="11" y1="12" x2="15" y2="12"/>
  </svg>
);

const REQUEST_TYPES = [
  {
    id: 'new-rider',
    icon: <IconNewRider />,
    iconClass: 'purple',
    title: 'New Rider',
    desc: 'Onboard a new rider and create a new ride.',
    linkLabel: 'Create New Rider',
    linkClass: 'purple',
    href: '/new-rider',
  },
  {
    id: 'retain-rider',
    icon: <IconRetainRider />,
    iconClass: 'green',
    title: 'Retain Rider',
    desc: 'Retain existing rider and start a new ride.',
    linkLabel: 'Retain Rider',
    linkClass: 'green',
    href: '/retain-rider',
  },
  {
    id: 'return-ride',
    icon: <IconReturnRide />,
    iconClass: 'orange',
    title: 'Return Ride',
    desc: 'Complete the ride and initiate return.',
    linkLabel: 'Return Ride',
    linkClass: 'orange',
    href: '/return-ride',
  },
  {
    id: 'extend-ride',
    icon: <IconExtendRide />,
    iconClass: 'blue',
    title: 'Extend Ride',
    desc: 'Extend the current ride duration.',
    linkLabel: 'Extend Ride',
    linkClass: 'blue',
    href: '/extend-ride',
  },
  {
    id: 'battery-swap',
    icon: <IconBatterySwap />,
    iconClass: 'teal',
    title: 'Battery Swap',
    desc: 'Request battery swap for active ride.',
    linkLabel: 'Battery Swap',
    linkClass: 'teal',
    href: '/battery-swap',
  },
];

export default function CreateNewRequest() {
  return (
    <div className="mb-6">
      <div className="section-header">
        <div className="section-title">Create New Request</div>
        <div className="section-subtitle">Select the type of request you want to create on behalf of the rider.</div>
      </div>

      <div className="create-request-grid">
        {REQUEST_TYPES.map((card) => (
          <Link key={card.id} href={card.href} className="request-card">
            <div className={`request-card-icon-wrap ${card.iconClass}`}>
              {card.icon}
            </div>
            <div className="request-card-title">{card.title}</div>
            <div className="request-card-desc">{card.desc}</div>
            <span className={`request-card-link ${card.linkClass}`}>
              {card.linkLabel} <IconArrowRight />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
