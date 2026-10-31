'use client';

import { useState } from 'react';

// ── Icons ──────────────────────────────────────────────────────────────
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconChevronLeft = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const IconChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// Type icons
const IconNewRiderSm = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);

const IconRetainSm = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <polyline points="16 11 18 13 22 9"/>
  </svg>
);

const IconReturnSm = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.49"/>
  </svg>
);

const IconExtendSm = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
  </svg>
);

const IconBatterySm = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/>
    <line x1="7" y1="12" x2="11" y2="8"/><line x1="11" y1="8" x2="11" y2="12"/><line x1="11" y1="12" x2="15" y2="12"/>
  </svg>
);

// ── Type config ────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; iconClass: string; icon: React.ReactNode }> = {
  new_rider:    { label: 'New Rider',    iconClass: 'purple', icon: <IconNewRiderSm /> },
  retain_rider: { label: 'Retain Rider', iconClass: 'green',  icon: <IconRetainSm />  },
  return_ride:  { label: 'Return Ride',  iconClass: 'orange', icon: <IconReturnSm />  },
  extend_ride:  { label: 'Extend Ride',  iconClass: 'blue',   icon: <IconExtendSm />  },
  battery_swap: { label: 'Battery Swap', iconClass: 'teal',   icon: <IconBatterySm /> },
};

// ── Static fallback data ───────────────────────────────────────────────
const STATIC_REQUESTS = [
  { request_id: 'REQ-2024-0518-0012', type: 'new_rider',    rider_name: 'Amit Kumar',  rider_mobile: '+91 98765 43210', status: 'completed',   created_at: '2024-05-18T10:30:00Z' },
  { request_id: 'REQ-2024-0518-0011', type: 'retain_rider', rider_name: 'Neha Gupta',  rider_mobile: '+91 91254 56789', status: 'pending',     created_at: '2024-05-18T09:45:00Z' },
  { request_id: 'REQ-2024-0518-0010', type: 'return_ride',  rider_name: 'Rohit Singh', rider_mobile: '+91 99876 54321', status: 'in_progress', created_at: '2024-05-18T09:15:00Z' },
  { request_id: 'REQ-2024-0518-0009', type: 'extend_ride',  rider_name: 'Sneha Reddy', rider_mobile: '+91 87654 32109', status: 'completed',   created_at: '2024-05-18T08:30:00Z' },
  { request_id: 'REQ-2024-0518-0008', type: 'battery_swap', rider_name: 'Vikram Patel',rider_mobile: '+91 78945 61230', status: 'pending',     created_at: '2024-05-18T08:05:00Z' },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    + '\n' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'Completed',
    pending: 'Pending',
    in_progress: 'In Progress',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
  };
  return <span className={`status-badge ${status}`}>{map[status] ?? status}</span>;
}

interface Request {
  request_id: string;
  type: string;
  rider_name: string;
  rider_mobile: string;
  status: string;
  created_at: string;
}

interface RecentRequestsProps {
  requests?: Request[];
  total?: number;
}

export default function RecentRequestsTable({ requests = STATIC_REQUESTS, total = 12 }: RecentRequestsProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / 5);

  return (
    <div className="table-card">
      {/* Header */}
      <div className="table-card-header">
        <div className="table-card-title">My Recent Requests</div>
        <a href="/my-requests" className="view-all-link">View All</a>
      </div>

      {/* Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Type</th>
            <th>Rider Name</th>
            <th>Mobile Number</th>
            <th>Status</th>
            <th>Created On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((row) => {
            const typeConf = TYPE_CONFIG[row.type] ?? { label: row.type, iconClass: 'purple', icon: null };
            const [datePart, timePart] = formatDate(row.created_at).split('\n');
            return (
              <tr key={row.request_id}>
                <td className="request-id-cell">{row.request_id}</td>
                <td>
                  <div className="type-cell">
                    <div className={`type-icon-badge ${typeConf.iconClass}`}>{typeConf.icon}</div>
                    <span className="type-label">{typeConf.label}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{row.rider_name}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{row.rider_mobile}</td>
                <td><StatusBadge status={row.status} /></td>
                <td>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{datePart}</div>
                    <div>{timePart}</div>
                  </div>
                </td>
                <td>
                  <button className="action-btn" title="View details">
                    <IconEye />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer / Pagination */}
      <div className="table-footer">
        <span className="table-footer-label">Showing 1 to {requests.length} of {total} requests</span>
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <IconChevronLeft />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn ${page === p ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
