'use client';

import Link from 'next/link';

const IconArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconClipboard = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconClock = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconBattery = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/>
  </svg>
);

interface SummaryData {
  date: string;
  requestsCreated: number;
  requestsCompleted: number;
  pendingRequests: number;
  batterySwapRequests: number;
}

export default function TodaysSummary({ data }: { data: SummaryData }) {
  const items = [
    { icon: <IconClipboard />, iconClass: 'purple', label: 'Requests Created',   value: data.requestsCreated },
    { icon: <IconCheckCircle />, iconClass: 'green', label: 'Requests Completed', value: data.requestsCompleted },
    { icon: <IconClock />,      iconClass: 'orange', label: 'Pending Requests',   value: data.pendingRequests },
    { icon: <IconBattery />,    iconClass: 'teal',   label: 'Battery Swap Requests', value: data.batterySwapRequests },
  ];

  return (
    <div className="panel-card">
      <div className="panel-card-header">
        <div className="panel-card-title">Today&apos;s Summary</div>
        <div className="panel-card-date">{data.date}</div>
      </div>

      <div className="summary-list">
        {items.map((item) => (
          <div key={item.label} className="summary-item">
            <div className="summary-item-left">
              <div className={`summary-item-icon ${item.iconClass}`}>{item.icon}</div>
              <span className="summary-item-label">{item.label}</span>
            </div>
            <span className="summary-item-value">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="summary-view-report">
        <Link href="/reports">
          View Full Report <IconArrowRight />
        </Link>
      </div>
    </div>
  );
}
