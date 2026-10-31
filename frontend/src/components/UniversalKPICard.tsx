'use client';

import React from 'react';

export interface KPICardItem {
  label: string;
  val: string | number;
  change?: string;
  up?: boolean;
  bg?: string;
  color?: string;
  ic?: React.ReactNode | string;
  sub?: string;
}

interface UniversalKPICardProps {
  item: KPICardItem;
  isLoading?: boolean;
}

export function UniversalKPICard({ item, isLoading }: UniversalKPICardProps) {
  return (
    <div className="ev-kpi-card" style={{
      background: '#ffffff',
      border: '1px solid #E2E8F0',
      borderRadius: '14px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '124px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#64748B',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1.3
        }}>
          {item.label}
        </span>
        {item.ic && (
          <span style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: item.bg || '#EEF2FF',
            color: item.color || '#4F46E5',
            fontSize: '14px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            {item.ic}
          </span>
        )}
      </div>

      <div style={{ margin: '8px 0 4px' }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 800,
          fontFamily: 'Outfit, sans-serif',
          color: '#0F172A',
          letterSpacing: '-0.02em',
          lineHeight: 1.2
        }}>
          {isLoading ? (
            <span style={{ color: '#94A3B8', fontSize: '18px' }}>Loading...</span>
          ) : (
            item.val ?? '—'
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', minHeight: '16px' }}>
        {item.sub ? (
          <span style={{ color: '#64748B', fontWeight: 500 }}>{item.sub}</span>
        ) : item.change && item.change !== '—' ? (
          <>
            <span style={{
              color: item.up ? '#10B981' : '#EF4444',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              {item.up ? '↑' : '↓'} {item.change}
            </span>
            <span style={{ color: '#94A3B8' }}>vs last period</span>
          </>
        ) : (
          <span style={{ color: '#94A3B8' }}>—</span>
        )}
      </div>
    </div>
  );
}

export function UniversalKPIGrid({
  items,
  columns = 5,
  isLoading = false
}: {
  items: KPICardItem[];
  columns?: number;
  isLoading?: boolean;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: '16px',
      marginBottom: '20px'
    }}>
      {items.map((item, idx) => (
        <UniversalKPICard key={item.label || idx} item={item} isLoading={isLoading} />
      ))}
    </div>
  );
}

export default UniversalKPICard;
