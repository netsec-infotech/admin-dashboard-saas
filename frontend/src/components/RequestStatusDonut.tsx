'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

interface StatusData {
  total: number;
  completed: number;
  in_progress: number;
  pending: number;
  cancelled: number;
  rejected: number;
}

const LEGEND_CONFIG = [
  { key: 'completed',   label: 'Completed',   color: '#22C55E' },
  { key: 'in_progress', label: 'In Progress',  color: '#3B82F6' },
  { key: 'pending',     label: 'Pending',      color: '#F59E0B' },
  { key: 'cancelled',   label: 'Cancelled',    color: '#EF4444' },
  { key: 'rejected',    label: 'Rejected',     color: '#6B7280' },
];

export default function RequestStatusDonut({ data }: { data: StatusData }) {
  const values = [
    data.completed,
    data.in_progress,
    data.pending,
    data.cancelled,
    data.rejected,
  ];

  const chartData = {
    datasets: [
      {
        data: values,
        backgroundColor: LEGEND_CONFIG.map(c => c.color),
        borderColor: '#fff',
        borderWidth: 3,
        hoverBorderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { data: number[] }; dataIndex: number }) => {
            const pct = Math.round((ctx.dataset.data[ctx.dataIndex] / data.total) * 100);
            return ` ${LEGEND_CONFIG[ctx.dataIndex].label}: ${ctx.dataset.data[ctx.dataIndex]} (${pct}%)`;
          },
        },
      },
    },
    animation: { duration: 600 },
  };

  const pctLabel = (val: number) => `${Math.round((val / data.total) * 100)}%`;

  return (
    <div className="panel-card">
      <div className="panel-card-header">
        <div className="panel-card-title">Request Status Overview</div>
      </div>

      <div className="donut-section">
        {/* Donut + centre label */}
        <div className="donut-wrapper">
          <Doughnut data={chartData} options={options as never} />
          <div className="donut-center">
            <div className="donut-center-value">{data.total}</div>
            <div className="donut-center-label">Total</div>
          </div>
        </div>

        {/* Legend */}
        <div className="donut-legend">
          {LEGEND_CONFIG.map((item) => {
            const val = data[item.key as keyof StatusData] as number;
            return (
              <div key={item.key} className="donut-legend-item">
                <div className="donut-legend-left">
                  <div className="donut-legend-dot" style={{ background: item.color }} />
                  <span className="donut-legend-label">{item.label}</span>
                </div>
                <span className="donut-legend-value">
                  {val} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 11 }}>({pctLabel(val)})</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
