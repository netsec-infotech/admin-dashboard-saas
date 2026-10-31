'use client';

// Tiny inline sparkline SVGs matching the screenshot
function Sparkline({ color, points, trend }: { color: string; points: string; trend: 'up' | 'down' }) {
  return (
    <svg width="80" height="36" viewBox="0 0 80 36" fill="none">
      <polyline
        points={points}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const IconTrendUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const IconTrendDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
);

interface StatCardProps {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  sparkColor: string;
  sparkPoints: string;
}

function StatCard({ icon, iconClass, title, period, value, change, trend, sparkColor, sparkPoints }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div>
          <div className="stat-card-title">{title}</div>
          <div className="stat-card-period">{period}</div>
        </div>
        <div className={`stat-card-icon ${iconClass}`}>{icon}</div>
      </div>

      <div className="stat-card-body">
        <div>
          <div className="stat-card-value">{value.toLocaleString()}</div>
          <div className="stat-card-change" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className={`stat-card-change ${trend}`}>
              {trend === 'up' ? <IconTrendUp /> : <IconTrendDown />}
              &nbsp;{Math.abs(change)}%
            </span>
            <span className="stat-card-change-label">from last month</span>
          </div>
        </div>
        <div className="stat-card-sparkline">
          <Sparkline color={sparkColor} points={sparkPoints} trend={trend} />
        </div>
      </div>
    </div>
  );
}

const IconClipboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconPeople = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

interface StatsData {
  requestsCreated: { value: number; change: number; trend: 'up' | 'down' };
  completedRequests: { value: number; change: number; trend: 'up' | 'down' };
  pendingRequests: { value: number; change: number; trend: 'up' | 'down' };
  totalRiders: { value: number; change: number; trend: 'up' | 'down' };
}

export default function StatCards({ stats }: { stats: StatsData }) {
  const cards = [
    {
      icon: <IconClipboard />,
      iconClass: 'purple',
      title: 'Requests Created',
      period: 'This Month',
      value: stats.requestsCreated.value,
      change: stats.requestsCreated.change,
      trend: stats.requestsCreated.trend,
      sparkColor: '#6366F1',
      sparkPoints: '0,28 10,24 20,18 30,22 40,12 50,16 60,8 70,12 80,6',
    },
    {
      icon: <IconCheckCircle />,
      iconClass: 'green',
      title: 'Completed Requests',
      period: 'This Month',
      value: stats.completedRequests.value,
      change: stats.completedRequests.change,
      trend: stats.completedRequests.trend,
      sparkColor: '#22C55E',
      sparkPoints: '0,30 10,26 20,20 30,14 40,18 50,10 60,14 70,8 80,4',
    },
    {
      icon: <IconClock />,
      iconClass: 'orange',
      title: 'Pending Requests',
      period: 'Currently',
      value: stats.pendingRequests.value,
      change: stats.pendingRequests.change,
      trend: stats.pendingRequests.trend,
      sparkColor: '#F59E0B',
      sparkPoints: '0,8 10,12 20,10 30,18 40,14 50,20 60,16 70,22 80,18',
    },
    {
      icon: <IconPeople />,
      iconClass: 'teal',
      title: 'Total Riders',
      period: 'Managed',
      value: stats.totalRiders.value,
      change: stats.totalRiders.change,
      trend: stats.totalRiders.trend,
      sparkColor: '#14B8A6',
      sparkPoints: '0,22 10,20 20,24 30,16 40,20 50,14 60,18 70,10 80,14',
    },
  ];

  return (
    <div className="stat-cards-grid">
      {cards.map((card) => (
        <StatCard key={card.title} {...(card as StatCardProps)} />
      ))}
    </div>
  );
}
