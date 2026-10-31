"use client";
import React, { useState, useEffect, useRef } from 'react';

export interface DateRangeFilterProps {
  onDateChange?: (startDate: string, endDate: string, rangeText: string) => void;
  defaultPreset?: string;
  className?: string;
}

const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const toDisplay = (d: Date) => {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function DateRangeFilter({ onDateChange, defaultPreset = 'this_month', className = '' }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [datePreset, setDatePreset] = useState(defaultPreset);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [dateRangeText, setDateRangeText] = useState('This Month');
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize from localStorage or default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedStart = localStorage.getItem('evegah_filter_start_date');
      const storedEnd = localStorage.getItem('evegah_filter_end_date');
      const storedText = localStorage.getItem('evegah_filter_date_text');
      const storedPreset = localStorage.getItem('evegah_filter_preset');

      if (storedStart && storedEnd && storedText) {
        setStartDate(storedStart);
        setEndDate(storedEnd);
        setCustomStart(storedStart);
        setCustomEnd(storedEnd);
        setDateRangeText(storedText);
        if (storedPreset) setDatePreset(storedPreset);
        onDateChange?.(storedStart, storedEnd, storedText);
        return;
      }
    }

    // Default: This Month
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const s = toYMD(first);
    const e = toYMD(last);
    const txt = `${toDisplay(first)} - ${toDisplay(last)}`;
    setStartDate(s);
    setEndDate(e);
    setCustomStart(s);
    setCustomEnd(e);
    setDateRangeText(txt);
    onDateChange?.(s, e, txt);
  }, []);

  // Listen to external date changes
  useEffect(() => {
    const handleExternalChange = (e: any) => {
      if (e.detail) {
        const { startDate: s, endDate: eDate, dateRangeText: txt } = e.detail;
        if (s && eDate) {
          setStartDate(s);
          setEndDate(eDate);
          setCustomStart(s);
          setCustomEnd(eDate);
          if (txt) setDateRangeText(txt);
        }
      }
    };
    window.addEventListener('evegah_date_filter_changed', handleExternalChange);
    return () => window.removeEventListener('evegah_date_filter_changed', handleExternalChange);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const commitDateChange = (s: string, e: string, txt: string, preset: string) => {
    setStartDate(s);
    setEndDate(e);
    setDateRangeText(txt);
    setDatePreset(preset);
    setIsOpen(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem('evegah_filter_start_date', s);
      localStorage.setItem('evegah_filter_end_date', e);
      localStorage.setItem('evegah_filter_date_text', txt);
      localStorage.setItem('evegah_filter_preset', preset);
      window.dispatchEvent(new CustomEvent('evegah_date_filter_changed', {
        detail: { startDate: s, endDate: e, dateRangeText: txt, preset }
      }));
    }

    onDateChange?.(s, e, txt);
  };

  const applyPreset = (preset: string) => {
    const now = new Date();
    let s = '';
    let e = '';
    let txt = '';

    if (preset === 'today') {
      s = toYMD(now);
      e = toYMD(now);
      txt = `Today, ${toDisplay(now)}`;
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      s = toYMD(y);
      e = toYMD(y);
      txt = `Yesterday, ${toDisplay(y)}`;
    } else if (preset === 'last_7_days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      s = toYMD(past);
      e = toYMD(now);
      txt = `${toDisplay(past)} - ${toDisplay(now)}`;
    } else if (preset === 'this_month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      s = toYMD(first);
      e = toYMD(last);
      txt = `${toDisplay(first)} - ${toDisplay(last)}`;
    } else if (preset === 'all_time') {
      s = '2024-01-01';
      const f = new Date();
      f.setDate(f.getDate() + 30);
      e = toYMD(f);
      txt = 'All Time Records';
    }

    setCustomStart(s);
    setCustomEnd(e);
    commitDateChange(s, e, txt, preset);
  };

  const applyCustomDates = () => {
    if (!customStart || !customEnd) return;
    const sDate = new Date(customStart);
    const eDate = new Date(customEnd);
    const txt = `${toDisplay(sDate)} - ${toDisplay(eDate)}`;
    commitDateChange(customStart, customEnd, txt, 'custom');
  };

  return (
    <div className={`evegah-date-filter-wrap ${className}`} style={{ position: 'relative' }} ref={menuRef}>
      {/* Date Pill Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 14px',
          background: isOpen ? '#F1F5F9' : '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '10px',
          fontSize: '12.5px',
          fontWeight: 700,
          color: '#1E293B',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          userSelect: 'none'
        }}
        title="Filter by Date Range"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>{dateRangeText}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '310px',
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '14px',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.14)',
            padding: '16px',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Filter by Date Range
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: 1,
                padding: '2px 4px'
              }}
            >
              ×
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last_7_days', label: 'Last 7 Days' },
              { id: 'this_month', label: 'This Month' },
              { id: 'all_time', label: 'All Time' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'center',
                  border: '1.5px solid',
                  borderColor: datePreset === p.id ? '#4F46E5' : '#E2E8F0',
                  background: datePreset === p.id ? '#EEF2FF' : '#FFFFFF',
                  color: datePreset === p.id ? '#4338CA' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Custom Date Range
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>START</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    color: '#0F172A',
                    outline: 'none',
                    fontWeight: 500
                  }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>END</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    color: '#0F172A',
                    outline: 'none',
                    fontWeight: 500
                  }}
                />
              </div>
            </div>
            <button
              onClick={applyCustomDates}
              style={{
                padding: '8px',
                background: '#2A195C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '4px',
                transition: 'background 0.15s'
              }}
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
