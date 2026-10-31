"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&display=swap');

/* ═══════════ DESIGN TOKENS ═══════════ */
:root {
  --brand: #2a195c;
  --brand-600: #4338CA;
  --brand-500: #5540A5;
  --brand-50: #F5F3FF;
  --brand-100: #EDE9FE;
  --brand-200: #DDD6FE;
  --brand-300: #C4B5FD;

  --bg: #F6F7FC;
  --bg-alt: #EEF0F9;
  --card: #FFFFFF;
  --line: #EAECF4;
  --line-soft: #F2F4FA;

  --ink: #0F1129;
  --ink-mid: #4A4D66;
  --ink-lo: #8588A0;
  --ink-faint: #B8BAC9;

  --green: #10B981;
  --green-dark: #059669;
  --green-soft: #ECFDF5;
  --green-line: #A7F3D0;

  --amber: #F59E0B;
  --amber-soft: #FFFBEB;
  --amber-line: #FDE68A;

  --red: #EF4444;
  --red-soft: #FEF2F2;
  --red-line: #FECACA;

  --sky: #3B82F6;
  --sky-soft: #EFF6FF;
  --sky-line: #BFDBFE;

  --purple: #8B5CF6;
  --purple-soft: #FAF5FF;
  --purple-line: #DDD6FE;

  --rose: #F43F5E;
  --rose-soft: #FFF1F2;
  --rose-line: #FECDD3;

  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 16px;
  --radius-xl: 22px;

  --shadow-xs: 0 1px 2px rgba(15, 17, 41, 0.04);
  --shadow-sm: 0 1px 3px rgba(15, 17, 41, 0.04), 0 1px 2px rgba(15, 17, 41, 0.03);
  --shadow-md: 0 6px 18px rgba(15, 17, 41, 0.06), 0 1px 3px rgba(15, 17, 41, 0.04);
  --shadow-lg: 0 16px 40px rgba(15, 17, 41, 0.09), 0 6px 12px rgba(15, 17, 41, 0.05);
  --shadow-xl: 0 28px 60px rgba(15, 17, 41, 0.16), 0 16px 32px rgba(15, 17, 41, 0.09);
  --shadow-brand: 0 8px 24px rgba(42, 25, 92, 0.25);
}

/* ═══════════ SHELL & LAYOUT ═══════════ */
/* Layout container */

/* Static Clean Background (No Gradient Orbs) */
.re-shell { display: flex; min-height: 100vh; background: #F8FAFC !important; font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; }
.re-main { margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 240px); background: #F8FAFC !important; }
.re-page { flex: 1; padding: 24px 32px 80px; display: flex; flex-direction: column; gap: 20px; max-width: 1760px; background: #F8FAFC !important; }

/* ═══════════ TITLE ROW ═══════════ */
.re-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.re-h1 {
  font-size: 28px; font-weight: 900; color: var(--ink);
  margin: 0 0 6px;
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.6px;
  display: flex; align-items: center; gap: 12px;
}
.re-h1-badge {
  font-size: 10px; font-weight: 800;
  background: linear-gradient(135deg, var(--brand-50), var(--brand-100));
  color: var(--brand);
  padding: 4px 11px;
  border-radius: 20px;
  border: 1px solid var(--brand-200);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.re-sub { font-size: 13.5px; color: var(--ink-mid); margin: 0; font-weight: 500; }

/* Live status pill */
.re-live-pill {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 20px;
  font-size: 11.5px; font-weight: 800;
  color: var(--green-dark);
  box-shadow: var(--shadow-xs);
  letter-spacing: 0.2px;
}
.re-live-pill::before {
  content: '';
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18);
  animation: livePulse 1.8s infinite;
}
@keyframes livePulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18); }
  50% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.08); }
}

/* ═══════════ STATS GRID (Matching Active Ride Page KPI Card Design) ═══════════ */
.re-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px; }
.re-stat-card {
  background: #fff;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,.02);
  box-sizing: border-box;
  cursor: pointer;
  transition: all .15s;
}
.re-stat-card:hover {
  border-color: #CBD5E1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}
.re-stat-ic {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.re-stat-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.re-stat-lbl {
  font-size: 9.5px;
  color: #64748B;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}
.re-stat-val {
  font-size: 19px;
  font-weight: 800;
  color: #0F172A;
  line-height: 1.2;
  margin-bottom: 2px;
  font-family: 'Outfit', sans-serif;
}
.re-stat-trend {
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
}
.ic-violet { background: linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%); color: var(--purple); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.14); }

/* ═══════════ MAIN CARD ═══════════ */
.re-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 28px rgba(15, 17, 41, 0.05);
  overflow: hidden;
  display: flex; flex-direction: column;
  position: relative;
}

/* ═══════════ FILTERS BAR ═══════════ */
.re-filters-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(180deg, #FCFCFE 0%, #FFFFFF 100%);
  border-bottom: 1px solid var(--line-soft);
  gap: 16px; flex-wrap: wrap;
}
.re-filters-left { display: flex; align-items: center; gap: 10px; flex: 1; flex-wrap: wrap; }

.re-search-wrapper {
  position: relative; display: flex; align-items: center;
  width: 100%; max-width: 360px;
}
.re-search-ic {
  position: absolute; left: 15px; color: var(--ink-lo);
  display: flex; align-items: center; pointer-events: none;
  transition: color .18s;
}
.re-input-search:focus + .re-search-ic, .re-search-wrapper:focus-within .re-search-ic { color: var(--brand); }
.re-input-search {
  width: 100%;
  padding: 11px 15px 11px 42px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  font-size: 13px; outline: none; color: var(--ink);
  background: #fff; font-weight: 500;
  transition: all .2s ease;
  font-family: inherit;
  box-shadow: var(--shadow-xs);
}
.re-input-search::placeholder { color: var(--ink-faint); font-weight: 500; }
.re-input-search:hover { border-color: #D8DCE4; }
.re-input-search:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(42, 25, 92, 0.08), var(--shadow-sm);
  background: #FEFEFF;
}

/* buttons */
.re-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 17px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  font-size: 12.5px; font-weight: 700;
  color: var(--ink-mid);
  cursor: pointer; font-family: inherit;
  transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: var(--shadow-xs);
}
.re-btn:hover {
  border-color: var(--brand-200);
  color: var(--brand);
  background: var(--brand-50);
  transform: translateY(-1.5px);
  box-shadow: var(--shadow-sm);
}
.re-btn-primary {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 5px 16px rgba(42, 25, 92, 0.28);
}
.re-btn-primary:hover {
  color: #fff;
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(42, 25, 92, 0.35);
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%);
  transform: translateY(-2px);
}
.re-btn-danger {
  background: linear-gradient(135deg, var(--red) 0%, #DC2626 100%);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 5px 16px rgba(239, 68, 68, 0.25);
}
.re-btn-danger:hover {
  color: #fff;
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(239, 68, 68, 0.35);
  background: linear-gradient(135deg, var(--red) 0%, #DC2626 100%);
  transform: translateY(-2px);
}

/* select wrappers */
.re-select {
  padding: 11px 36px 11px 15px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  font-size: 12.5px; outline: none;
  background: #fff;
  font-weight: 700;
  color: var(--ink-mid);
  cursor: pointer;
  transition: all .18s ease;
  font-family: inherit;
  box-shadow: var(--shadow-xs);
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8DA3' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
}
.re-select:hover { border-color: #D8DCE4; background-color: #FEFEFF; }
.re-select:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(42, 25, 92, 0.08);
}

/* ═══════════ FILTER DRAWER ═══════════ */
.re-filter-drawer {
  padding: 20px 24px;
  background: linear-gradient(180deg, #FAFBFF 0%, #F5F7FB 100%);
  border-bottom: 1px solid var(--line);
  display: flex; gap: 18px; align-items: flex-end; flex-wrap: wrap;
  animation: slideDown .28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.re-filter-group { display: flex; flex-direction: column; gap: 7px; }
.re-filter-lbl {
  font-size: 10.5px; font-weight: 800;
  color: var(--ink-lo);
  letter-spacing: 0.6px;
  text-transform: uppercase;
}


/* ═══════════ MODERN DIRECTORY TABLE STYLES ═══════════ */
.re-badge-capsule {
  display: inline-flex; align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: #F1F5F9;
  color: #1E293B;
  border: 1px solid #E2E8F0;
  letter-spacing: 0.2px;
}
.re-badge-battery {
  background: #F8FAFC;
  color: #334155;
}
.re-pkg-text {
  font-size: 12.5px;
  font-weight: 600;
  color: #0F172A;
  text-transform: lowercase;
}
.re-mode-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: capitalize;
}
.re-mode-pill.app {
  background: #F0FDF4;
  color: #16A34A;
  border: 1px solid #86EFAC;
}
.re-mode-pill.form {
  background: #EFF6FF;
  color: #2563EB;
  border: 1px solid #93C5FD;
}
.re-datetime-block {
  display: flex; flex-direction: column; gap: 3px;
}
.re-dt-main {
  font-size: 12.5px; font-weight: 700; color: #0F172A;
}
.re-dt-sub {
  font-size: 11px; font-weight: 600;
}
.re-dt-sub.green { color: #16A34A; }
.re-dt-sub.gray { color: #64748B; }
.re-dt-sub.muted { color: #94A3B8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; }
.re-status-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid transparent;
}
.re-status-pill .dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: currentColor;
}
.re-status-pill.returned {
  background: #EFF6FF; color: #1D4ED8; border-color: #BFDBFE;
}
.re-status-pill.active {
  background: #ECFDF5; color: #047857; border-color: #A7F3D0;
}
.re-status-pill.retain {
  background: #FFF7ED; color: #C2410C; border-color: #FED7AA;
}
.re-status-pill.extend {
  background: #FAF5FF; color: #6D28D9; border-color: #DDD6FE;
}
.re-status-pill.default {
  background: #F1F5F9; color: #475569; border-color: #CBD5E1;
}

/* ═══════════ TABLE ═══════════ */
.re-table-wrap { overflow-x: auto; width: 100%; }
.re-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
  font-size: 12.5px;
  min-width: 1280px;
}
.re-table thead th {
  font-size: 10px; font-weight: 800;
  color: var(--ink-lo);
  text-transform: uppercase;
  letter-spacing: 0.7px;
  padding: 16px 18px;
  border-bottom: 1.5px solid var(--line);
  background: linear-gradient(180deg, #FAFBFD 0%, #F5F7FB 100%);
  white-space: nowrap;
  position: sticky; top: 0;
  z-index: 1;
}
.re-table tbody td {
  padding: 16px 18px;
  color: var(--ink-mid);
  border-bottom: 1px solid var(--line-soft);
  vertical-align: middle;
  white-space: nowrap;
  transition: background .18s;
  font-weight: 500;
}
.re-table tbody tr:last-child td { border-bottom: none; }
.re-table tbody tr {
  transition: background .18s;
}
.re-table tbody tr:hover td { background: #FAFBFD; }

/* selection highlight */
.re-table tbody tr.selected td { background: var(--brand-50); }
.re-table tbody tr.selected:hover td { background: var(--brand-100); }

/* checkbox styling */
.re-table input[type="checkbox"] {
  width: 17px; height: 17px;
  accent-color: var(--brand);
  cursor: pointer;
}

/* rider cell */
.re-rider-cell { display: flex; align-items: center; gap: 12px; }
.re-avatar {
  width: 40px; height: 40px; border-radius: 12px;
  object-fit: cover;
  background: var(--brand-50);
  flex-shrink: 0;
  border: 1.5px solid var(--line);
  box-shadow: 0 2px 6px rgba(15, 17, 41, 0.06);
}
.re-rider-name {
  font-weight: 800; color: var(--ink);
  font-size: 13px;
  letter-spacing: -0.15px;
  display: block;
}
.re-rider-sub {
  font-size: 10.5px; color: var(--ink-lo);
  font-weight: 600;
  margin-top: 2px;
}

/* chip styles */
.re-chip {
  display: inline-flex; align-items: center;
  padding: 5px 11px;
  border-radius: 8px;
  font-family: 'Outfit', ui-monospace, monospace;
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: 0.2px;
  border: 1px solid transparent;
  transition: all .15s;
}
.re-chip-vehicle {
  background: var(--brand-50);
  color: var(--brand);
  border-color: var(--brand-100);
}
.re-chip-vehicle:hover { background: var(--brand-100); }
.re-chip-battery {
  background: var(--line-soft);
  color: var(--ink-mid);
  border-color: var(--line);
}
.re-chip-total {
  background: linear-gradient(135deg, var(--brand-50) 0%, var(--brand-100) 100%);
  color: var(--brand);
  border-color: var(--brand-200);
  font-weight: 900;
  font-size: 13px;
  padding: 6px 13px;
  box-shadow: 0 2px 6px rgba(42, 25, 92, 0.10);
}

/* mode badge */
.re-mode {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px;
  border-radius: 7px;
  font-size: 11px; font-weight: 800;
  letter-spacing: 0.2px;
  border: 1px solid transparent;
}
.re-mode.app {
  background: var(--green-soft);
  color: var(--green-dark);
  border-color: var(--green-line);
}
.re-mode.form {
  background: var(--sky-soft);
  color: #1D4ED8;
  border-color: var(--sky-line);
}

/* date cell */
.re-date-cell {
  display: inline-flex; flex-direction: column;
  padding: 7px 12px;
  background: linear-gradient(135deg, #FAFBFF 0%, #F5F7FB 100%);
  border: 1px solid var(--line);
  border-radius: 9px;
  gap: 3px;
}
.re-date-main {
  font-weight: 800; color: var(--ink); font-size: 12px;
  letter-spacing: -0.1px;
}
.re-date-time {
  font-size: 10.5px; font-weight: 800;
  display: inline-flex; align-items: center; gap: 5px;
}
.re-date-time::before {
  content: ''; width: 5px; height: 5px;
  border-radius: 50%;
}
.re-date-time.green { color: var(--green-dark); }
.re-date-time.green::before { background: var(--green); }
.re-date-time.muted { color: var(--ink-lo); }
.re-date-time.muted::before { background: var(--ink-faint); }
.re-date-label {
  font-size: 10px; color: var(--ink-faint);
  font-weight: 700; letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* ═══════════ STATUS BADGES ═══════════ */
.re-sbadge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px; font-weight: 800;
  white-space: nowrap;
  border: 1px solid transparent;
  letter-spacing: 0.2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all .15s;
}
.s-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
.s-active { background: var(--green-soft); color: var(--green-dark); border-color: var(--green-line); }
.s-active .s-dot { box-shadow: 0 0 0 2px rgba(16,185,129,0.25); }
.s-retain { background: var(--amber-soft); color: #B45309; border-color: var(--amber-line); }
.s-return { background: var(--sky-soft); color: #1D4ED8; border-color: var(--sky-line); }
.s-extend { background: var(--purple-soft); color: #6D28D9; border-color: var(--purple-line); }
.s-upcoming { background: #FEF3C7; color: #B45309; border-color: #FDE68A; }
.s-noactive { background: var(--line-soft); color: var(--ink-lo); border-color: var(--line); }

/* ═══════════ ACTION BUTTONS ═══════════ */
.re-action-cell { display: flex; align-items: center; justify-content: center; gap: 6px; }
.re-action-btn {
  width: 34px; height: 34px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: var(--brand);
  background: #fff;
  cursor: pointer;
  transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  text-decoration: none;
}
.re-action-btn:hover {
  border-color: var(--brand-200);
  background: var(--brand-50);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(42, 25, 92, 0.12);
}
.re-action-btn.danger { color: var(--red); }
.re-action-btn.danger:hover {
  border-color: var(--red-line);
  background: var(--red-soft);
  box-shadow: 0 6px 14px rgba(239, 68, 68, 0.15);
}
.re-action-btn.success { color: var(--green-dark); }
.re-action-btn.success:hover {
  border-color: var(--green-line);
  background: var(--green-soft);
  box-shadow: 0 6px 14px rgba(16, 185, 129, 0.15);
}

/* ═══════════ PAGINATION FOOTER ═══════════ */
.re-card-ft {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px;
  border-top: 1px solid var(--line-soft);
  background: linear-gradient(180deg, #FFFFFF 0%, #FCFCFE 100%);
  gap: 16px;
  flex-wrap: wrap;
}
.re-card-ft-lbl {
  font-size: 12.5px; color: var(--ink-lo);
  font-weight: 600;
}
.re-card-ft-lbl strong { color: var(--ink); font-weight: 800; }
.re-pg { display: flex; align-items: center; gap: 5px; }
.re-pgb {
  min-width: 36px; height: 36px;
  padding: 0 10px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  background: #fff;
  font-size: 12.5px; font-weight: 700;
  color: var(--ink-mid);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all .18s ease;
  font-family: inherit;
}
.re-pgb:hover:not(:disabled) {
  border-color: var(--brand-200);
  color: var(--brand);
  background: var(--brand-50);
  transform: translateY(-1px);
}
.re-pgb:disabled { opacity: 0.4; cursor: not-allowed; }
.re-pgb.cur {
  background: linear-gradient(135deg, var(--brand), var(--brand-600));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(42, 25, 92, 0.28);
  font-weight: 800;
}

/* ═══════════ MODAL ═══════════ */
.re-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15, 17, 41, 0.55);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 999; padding: 20px;
  animation: fadeIn .22s ease-out;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.re-modal {
  background: #fff;
  border-radius: var(--radius-xl);
  width: 100%; max-width: 560px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: flex; flex-direction: column;
  animation: modalPop .3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes modalPop {
  from { opacity: 0; transform: scale(.94) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.re-modal-hdr {
  padding: 22px 28px;
  border-bottom: 1px solid var(--line-soft);
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(180deg, #FCFCFE 0%, #FFFFFF 100%);
}
.re-modal-tit {
  font-size: 18px; font-weight: 900; color: var(--ink);
  margin: 0; font-family: 'Outfit', sans-serif;
  letter-spacing: -0.4px;
  display: flex; align-items: center; gap: 9px;
}
.re-modal-tit::before {
  content: '';
  width: 4px; height: 18px;
  background: linear-gradient(180deg, var(--brand), var(--brand-600));
  border-radius: 3px;
}
.re-modal-close {
  width: 34px; height: 34px;
  border: none; background: var(--line-soft);
  border-radius: 10px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--ink-lo);
  transition: all .2s ease;
}
.re-modal-close:hover {
  background: var(--red-soft);
  color: var(--red);
  transform: rotate(90deg);
}
.re-modal-body {
  padding: 26px 28px;
  display: flex; flex-direction: column; gap: 18px;
}
.re-modal-ft {
  padding: 20px 28px;
  border-top: 1px solid var(--line-soft);
  background: linear-gradient(180deg, #FFFFFF 0%, #FCFCFE 100%);
  display: flex; justify-content: flex-end; gap: 10px;
}
.re-modal-field { display: flex; flex-direction: column; gap: 8px; }
.re-modal-lbl {
  font-size: 11px; font-weight: 800;
  color: var(--ink-lo); letter-spacing: 0.6px;
  text-transform: uppercase;
}
.re-modal-select, .re-modal-input {
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  font-size: 13px; outline: none;
  background: #fff;
  font-weight: 600; color: var(--ink);
  font-family: inherit;
  transition: all .2s ease;
  cursor: pointer;
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8DA3' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
  box-shadow: var(--shadow-xs);
}
.re-modal-select:hover { border-color: #D8DCE4; background-color: #FEFEFF; }
.re-modal-select:focus, .re-modal-input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(42, 25, 92, 0.08);
}

/* rider info block inside modal */
.re-modal-rider {
  background: linear-gradient(135deg, var(--brand-50) 0%, var(--brand-100) 100%);
  border: 1px solid var(--brand-200);
  padding: 18px 20px;
  border-radius: 14px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 4px 14px rgba(42, 25, 92, 0.08);
}
.re-modal-rider-avatar {
  width: 52px; height: 52px; border-radius: 14px;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 4px 14px rgba(42, 25, 92, 0.15);
  flex-shrink: 0;
}
.re-modal-rider-name {
  font-weight: 900; font-size: 16px; color: var(--ink);
  letter-spacing: -0.25px;
}
.re-modal-rider-meta {
  font-size: 12px; color: var(--ink-mid);
  margin-top: 4px; font-weight: 600;
}

/* danger icon circle */
.re-danger-icon {
  width: 64px; height: 64px;
  background: linear-gradient(135deg, var(--red-soft) 0%, #FEE2E2 100%);
  color: var(--red);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 18px;
  border: 2px solid var(--red-line);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.15);
}
.re-danger-title {
  margin: 0 0 10px; font-size: 18px; font-weight: 900;
  color: var(--ink); text-align: center;
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.4px;
}
.re-danger-desc {
  margin: 0; font-size: 13px; color: var(--ink-lo);
  line-height: 1.65; text-align: center;
  font-weight: 500;
}

/* ═══════════ TOAST ═══════════ */
.re-toast {
  position: fixed; bottom: 28px; right: 28px;
  background: linear-gradient(135deg, #0F1129 0%, #1E1B3A 100%);
  color: #fff;
  padding: 16px 24px;
  border-radius: 14px;
  font-size: 13px; font-weight: 700;
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  display: flex; align-items: center; gap: 12px;
  border-left: 4px solid var(--green);
  max-width: 440px;
  animation: toastIn .4s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: 'Plus Jakarta Sans', sans-serif;
  letter-spacing: -0.1px;
  line-height: 1.45;
}
.re-toast::before {
  content: '✓';
  width: 24px; height: 24px;
  background: linear-gradient(135deg, var(--green), var(--green-dark));
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 900;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}
@keyframes toastIn {
  from { opacity: 0; transform: translateY(20px) scale(.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ═══════════ SHIMMER ═══════════ */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ═══════════ FOOTER ═══════════ */
.re-footer {
  display: flex; justify-content: space-between;
  font-size: 12px; color: var(--ink-faint);
  padding: 8px 4px 0;
  font-weight: 600;
}

/* ═══════════ RESPONSIVE ═══════════ */
@media (max-width: 1440px) {
  .re-page { padding: 22px 26px 70px; gap: 20px; }
  .re-stats { gap: 12px; }
  .re-sc { padding: 16px 17px 15px; }
  .re-sc-val { font-size: 26px; }
  .re-sc-tit { font-size: 10px; }
  .re-sc-per { font-size: 10px; margin-top: 8px; padding: 3px 8px; }
  .re-filters-bar { padding: 16px 20px; gap: 12px; }
  .re-table tbody td, .re-table thead th { padding: 14px 15px; }
}
@media (max-width: 1220px) {
  .re-stats { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 820px) {
  .re-stats { grid-template-columns: repeat(2, 1fr); }
}
`;

interface Renter {
  id?: string;
  _id?: string;
  rider_name: string;
  mobile: string;
  vehicle_id: string;
  battery_id: string;
  package_name: string;
  rental_start_date: string;
  return_date: string | null;
  status: 'Active Ride' | 'Retain Ride' | 'Return' | 'Extend';
  rent: string;
  deposit: string;
  total: string;
  avatar_url: string | null;
  kyc_status?: string;
  booking_source?: string;
}


function getRiderInitials(name: string): string {
  if (!name || name === 'Rider' || name === 'Evegah Rider') return 'EV';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string): { bg: string; color: string; border: string } {
  const palettes = [
    { bg: '#EDE9FE', color: '#6D28D9', border: '#DDD6FE' },
    { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
    { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
    { bg: '#FDF2F8', color: '#BE185D', border: '#FBCFE8' },
    { bg: '#F0FDFA', color: '#0F766E', border: '#99F6E4' },
    { bg: '#F5F3FF', color: '#7C3AED', border: '#C4B5FD' }
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % palettes.length;
  return palettes[idx];
}

function getPaginationItems(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

function RiderAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getRiderInitials(name);
  const color = getAvatarColor(name);

  const cleanUrl = avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '' && avatarUrl !== 'null' && avatarUrl !== 'undefined'
    ? (() => {
        let trimmed = avatarUrl.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) return trimmed;
        trimmed = trimmed.replace(/^\/+/, '');
        if (trimmed.startsWith('uploads/')) return `/${trimmed}`;
        return `/uploads/${trimmed}`;
      })()
    : null;

  return (
    <div
      style={{
        position: 'relative',
        width: 38,
        height: 38,
        borderRadius: 10,
        background: color.bg,
        color: color.color,
        border: `1.5px solid ${color.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 12.5,
        flexShrink: 0,
        letterSpacing: '0.4px',
        boxShadow: '0 1px 2px rgba(15, 17, 41, 0.04)',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      <span>{initials}</span>

      {cleanUrl && !imgFailed && (
        <img
          src={cleanUrl}
          alt={name}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgFailed(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 8,
            opacity: imgLoaded ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out'
          }}
        />
      )}
    </div>
  );
}

function formatRenterDateTime(dateStr?: string | null, isStartDate = true) {
  if (!dateStr || dateStr === '—' || String(dateStr).startsWith('0000')) {
    return { main: '—', sub: isStartDate ? 'BOOKING DATE' : 'SCHEDULED RETURN', isTime: false };
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { main: dateStr, sub: '', isTime: false };
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('en-GB', { month: 'short' });
    const year = d.getFullYear();
    const main = `${day} ${month} ${year}`;

    const iso = d.toISOString();
    const isMidnight = iso.endsWith('00:00:00.000Z') || iso.endsWith('18:30:00.000Z');
    if (isMidnight) {
      return { main, sub: isStartDate ? 'BOOKING DATE' : 'SCHEDULED RETURN', isTime: false };
    }
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { main, sub: `• ${timeStr}`, isTime: true };
  } catch (_) {
    return { main: dateStr || '—', sub: '', isTime: false };
  }
}

export default function RentersPage() {
  const router = useRouter();
  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('All Zones');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [summary, setSummary] = useState<any>(null);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const [selectedMobiles, setSelectedMobiles] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [mobilesToDelete, setMobilesToDelete] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [allocRenter, setAllocRenter] = useState<{ renter: Renter, displayName: string, displayMobile: string } | null>(null);
  const [allocVehicle, setAllocVehicle] = useState('');
  const [allocBattery, setAllocBattery] = useState('');
  const [savingAlloc, setSavingAlloc] = useState(false);

  const [toast, setToast] = useState({ show: false, msg: '' });

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3500);
  };

  useEffect(() => {
    const updateZone = () => {
      if (typeof window !== 'undefined') {
        const z = localStorage.getItem('evegah_active_zone') || localStorage.getItem('evegah_selected_zone') || 'All Zones';
        setSelectedZone(z);
      }
    };
    updateZone();
    window.addEventListener('evegah_active_zone_changed', updateZone);
    window.addEventListener('evegah_zone_changed', updateZone);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', updateZone);
      window.removeEventListener('evegah_zone_changed', updateZone);
    };
  }, []);

  const getDisplayName = (r: Renter, _idx: number) => {
    if (r.rider_name && r.rider_name.trim() !== '') {
      return r.rider_name.trim();
    }
    return 'Evegah Rider';
  };

  const handleDownloadReceipt = (r: Renter) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to view and print the booking receipt.');
      return;
    }

    const cleanNum = (val: string) => parseFloat((val || '').replace(/[^0-9.]/g, '')) || 0;
    const rentNum = cleanNum(r.rent);
    const depositNum = cleanNum(r.deposit);
    const totalNum = cleanNum(r.total) || (rentNum + depositNum);

    const formatRupees = (num: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num).replace('INR', '₹').trim();

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateTimeString = `${formattedDate}, ${formattedTime}`;

    const yrMo = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0');
    const receiptNo = `RCPT-EVG-${yrMo}-${Math.floor(100000 + Math.random() * 900000)}`;

    const startFormatted = formatDateTime(r.rental_start_date);
    const endFormatted = formatDateTime(r.return_date);
    const displayName = getDisplayName(r, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Booking & Deposit Receipt - ${displayName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 30px 15px; color: #0F172A; background-color: #F8FAFC; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .receipt-container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1.5px solid #E2E8F0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .rc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F1F5F9; padding-bottom: 20px; margin-bottom: 24px; }
            .brand-name { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: #200F54; letter-spacing: -0.02em; }
            .brand-sub { font-size: 11px; font-weight: 600; color: #528900; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
            .rc-meta { text-align: right; font-size: 12px; color: #64748B; }
            .rc-no { font-family: 'Outfit', sans-serif; font-weight: 800; color: #200F54; font-size: 14px; margin-bottom: 2px; }
            .doc-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .doc-title h1 { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; color: #0F172A; }
            .badge-paid { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
            .info-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; font-size: 12px; }
            .info-item label { display: block; font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 3px; }
            .info-item span { font-weight: 700; color: #0F172A; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12.5px; }
            th { background: #F1F5F9; color: #475569; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 10px 14px; text-align: left; }
            th:last-child { text-align: right; }
            td { padding: 12px 14px; border-bottom: 1px solid #F1F5F9; color: #1E293B; }
            td:last-child { text-align: right; font-weight: 700; }
            .tr-total { background: #FAF5FF; font-weight: 800; font-size: 14px; color: #200F54; }
            .tr-total td { border-bottom: none; border-top: 2px solid #E9D5FF; }
            .rc-footer { border-top: 1px dashed #CBD5E1; padding-top: 18px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748B; }
            .rc-seal { text-align: right; }
            .seal-stamp { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 12px; color: #528900; border: 1.5px dashed #528900; padding: 6px 12px; border-radius: 8px; display: inline-block; margin-top: 4px; }
            .print-btn-bar { text-align: center; margin-bottom: 20px; }
            .btn-print { background: #200F54; color: #fff; font-weight: 700; font-size: 13px; padding: 10px 24px; border: none; border-radius: 8px; cursor: pointer; }
            @media print {
              .print-btn-bar { display: none; }
              body { padding: 0; background: #fff; }
              .receipt-container { border: none; box-shadow: none; padding: 20px 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-btn-bar">
            <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
          </div>
          <div class="receipt-container">
            <div class="rc-header">
              <div>
                <div class="brand-name">EVEGAH MOBILITY</div>
                <div class="brand-sub">Smart EV Rental & Battery Network</div>
                <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Vadodara Hub, Gujarat • support@evegah.com</div>
              </div>
              <div class="rc-meta">
                <div class="rc-no">${receiptNo}</div>
                <div>Date: ${dateTimeString}</div>
                <div>Payment Mode: <b>PayU India Gateway</b></div>
              </div>
            </div>
            <div class="doc-title">
              <h1>Rider Booking & Security Deposit Receipt</h1>
              <span class="badge-paid">✓ Paid & Verified</span>
            </div>
            <div class="info-box">
              <div class="info-item"><label>Rider Name</label><span>${displayName}</span></div>
              <div class="info-item"><label>Contact Mobile</label><span>${r.mobile}</span></div>
              <div class="info-item"><label>Assigned Vehicle</label><span>${r.vehicle_id || 'EVM102501'} (Evegah City EV)</span></div>
              <div class="info-item"><label>Assigned Battery Unit</label><span>${r.battery_id || 'BAT-MNZ-001'} (60V Li-ion)</span></div>
              <div class="info-item"><label>Subscription Package</label><span>${r.package_name || 'Day Plan'}</span></div>
              <div class="info-item"><label>Pickup / Operating Hub</label><span>${(r as any).zone || 'Manjalpur Zone'}</span></div>
              <div class="info-item"><label>Rental Start Date & Time</label><span>${startFormatted.date} ${startFormatted.time}</span></div>
              <div class="info-item"><label>Return Date & Time</label><span>${endFormatted.date} ${endFormatted.time}</span></div>
            </div>
            <table>
              <thead>
                <tr><th>Description</th><th>Category</th><th>Amount (INR)</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>EV Rental Subscription</b><br/><span style="font-size:11px;color:#64748B;">Package: ${r.package_name || 'Day Plan'} (${startFormatted.date} to ${endFormatted.date})</span></td>
                  <td>Rental Charge</td>
                  <td>${formatRupees(rentNum)}</td>
                </tr>
                <tr>
                  <td><b>Refundable Security Deposit</b><br/><span style="font-size:11px;color:#64748B;">100% Refundable upon vehicle & battery return inspection</span></td>
                  <td>Security Deposit</td>
                  <td>${formatRupees(depositNum)}</td>
                </tr>
                <tr>
                  <td><b>Platform, Telematics & Battery Swap Service</b><br/><span style="font-size:11px;color:#64748B;">Unlimited battery swaps across active Evegah Hubs</span></td>
                  <td>Included</td>
                  <td>₹0.00</td>
                </tr>
                <tr class="tr-total">
                  <td colspan="2">TOTAL AMOUNT PAID</td>
                  <td>${formatRupees(totalNum)}</td>
                </tr>
              </tbody>
            </table>
            <div class="rc-footer">
              <div>
                <div><b>Terms & Refund Policy:</b></div>
                <div style="margin-top:2px;">• Security deposit is refunded via PayU within 3-5 business days upon return.</div>
                <div>• For emergency assistance, WhatsApp or call +91 93285 85954.</div>
              </div>
              <div class="rc-seal">
                <div>Authorized Evegah Mobility</div>
                <div class="seal-stamp">✓ VERIFIED OFFICIAL</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    if (!renters || renters.length === 0) {
      alert('No renters data to export');
      return;
    }
    const headers = ['Rider Name', 'Mobile', 'Vehicle ID', 'Battery ID', 'Package', 'Mode', 'Rental Start Date', 'Return Date', 'Status', 'Rent', 'Deposit', 'Total'];
    const csvRows = [headers.join(',')];
    renters.forEach((r, idx) => {
      const dName = getDisplayName(r, idx);
      const pkgName = r.package_name === 'Rider Plan' || r.package_name === 'Standard Plan' || !r.package_name ? 'Custom' : r.package_name;
      const modeName = r.booking_source && r.booking_source.toLowerCase().includes('app') ? 'App' : 'Form';
      const row = [
        `"${dName}"`,
        `"${r.mobile || ''}"`,
        `"${r.vehicle_id || ''}"`,
        `"${r.battery_id || ''}"`,
        `"${pkgName}"`,
        `"${modeName}"`,
        `"${r.rental_start_date || ''}"`,
        `"${r.return_date || ''}"`,
        `"${r.status || ''}"`,
        `"${r.rent || ''}"`,
        `"${r.deposit || ''}"`,
        `"${r.total || ''}"`
      ];
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renters_list_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const fetchRenters = () => {
    setLoading(true);
    const isAllZones = !selectedZone || selectedZone === 'All Zones' || selectedZone === 'All Zones (Multi-Zone)';
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
      search: search,
      status: statusFilter,
      ...(!isAllZones ? { zone: selectedZone } : {}),
      ...(modeFilter ? { mode: modeFilter } : {})
    });

    api.get(`/renters?${queryParams.toString()}`)
      .then((res: any) => {
        if (res.status === 'success' && res.data) {
          let dataList: Renter[] = res.data;
          if (packageFilter) {
            dataList = dataList.filter(r => {
              const p = (!r.package_name || r.package_name === 'Rider Plan' || r.package_name === 'Standard Plan' || r.package_name.toLowerCase().includes('custom')) ? 'Custom' : r.package_name;
              return p.toLowerCase() === packageFilter.toLowerCase();
            });
          }
          if (modeFilter) {
            dataList = dataList.filter(r => {
              const isApp = (r.booking_source || '').toLowerCase().includes('app');
              return modeFilter === 'App' ? isApp : !isApp;
            });
          }
          setRenters(dataList);
          if (res.pagination) setPagination(res.pagination);
          if (res.summary) setSummary(res.summary);
        }
      })
      .catch((err) => console.error('Error loading renters:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRenters();
  }, [search, statusFilter, packageFilter, modeFilter, page, pageSize, selectedZone]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedMobiles(renters.map(r => r.mobile));
    else setSelectedMobiles([]);
  };

  const handleSelectOne = (mobile: string) => {
    if (selectedMobiles.includes(mobile)) {
      setSelectedMobiles(prev => prev.filter(m => m !== mobile));
    } else {
      setSelectedMobiles(prev => [...prev, mobile]);
    }
  };

  const openDeleteModalForSelection = () => {
    if (selectedMobiles.length === 0) return;
    setMobilesToDelete(selectedMobiles);
    setIsDeleteModalOpen(true);
  };

  const openDeleteModalForSingle = (mobile: string) => {
    setMobilesToDelete([mobile]);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRiders = async () => {
    setDeleting(true);
    try {
      const idsToDelete = renters.filter(r => mobilesToDelete.includes(r.mobile) || (r.id && mobilesToDelete.includes(r.id))).map(r => r.id).filter(Boolean);
      await api.delete('/renters', { mobiles: mobilesToDelete, ids: idsToDelete });
      setRenters(prev => prev.filter(r => !mobilesToDelete.includes(r.mobile) && !idsToDelete.includes(r.id)));
      setSelectedMobiles(prev => prev.filter(m => !mobilesToDelete.includes(m)));
      showToast(`Selected rider(s) deleted successfully.`);
      fetchRenters();
    } catch (e) {
      console.error('Delete renters error:', e);
      setRenters(prev => prev.filter(r => !mobilesToDelete.includes(r.mobile)));
      setSelectedMobiles(prev => prev.filter(m => !mobilesToDelete.includes(m)));
      showToast(`Rider(s) removed from active directory.`);
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
      setMobilesToDelete([]);
    }
  };

  const openAllocationModal = (r: Renter, displayName: string, displayMobile: string) => {
    const kyc = (r.kyc_status || '').toLowerCase();
    if (kyc !== 'verified' && kyc !== 'approved') {
      showToast(`⚠️ KYC Verification Required: Rider KYC is currently "${r.kyc_status || 'Under Review'}". Please review and approve KYC in the rider's profile before assigning a vehicle or battery.`);
      return;
    }
    setAllocRenter({ renter: r, displayName, displayMobile });
    setAllocVehicle(r.vehicle_id || 'EVM1024001');
    setAllocBattery(r.battery_id || 'BAT-GOTRI-01');
    setIsAllocModalOpen(true);
  };

  const handleSaveAllocation = async () => {
    if (!allocRenter) return;
    setSavingAlloc(true);
    try {
      await api.post('/renters', {
        id: allocRenter.renter.id,
        mobile: allocRenter.displayMobile,
        vehicle_id: allocVehicle,
        battery_id: allocBattery,
        rider_name: allocRenter.displayName
      });
      setRenters(prev => prev.map(item => {
        if (item.mobile === allocRenter.displayMobile || item.id === allocRenter.renter.id) {
          return { ...item, vehicle_id: allocVehicle, battery_id: allocBattery };
        }
        return item;
      }));
      showToast(`Vehicle ${allocVehicle} & Battery ${allocBattery} assigned to ${allocRenter.displayName}!`);
      setIsAllocModalOpen(false);
    } catch (e) {
      console.error('Error allocating vehicle & battery:', e);
      setRenters(prev => prev.map(item => {
        if (item.mobile === allocRenter.displayMobile || item.id === allocRenter.renter.id) {
          return { ...item, vehicle_id: allocVehicle, battery_id: allocBattery };
        }
        return item;
      }));
      showToast(`Vehicle ${allocVehicle} & Battery assigned to ${allocRenter.displayName}!`);
      setIsAllocModalOpen(false);
    } finally {
      setSavingAlloc(false);
    }
  };

  const totalRidesCount = summary?.total ?? pagination.total ?? renters.length;
  const activeRidesCount = summary?.activeRides ?? renters.filter(r => r.status === 'Active Ride').length;
  const retainRidesCount = summary?.retainRides ?? renters.filter(r => r.status === 'Retain Ride').length;
  const returnedRidesCount = summary?.returnedRides ?? renters.filter(r => r.status === 'Return').length;
  const extendedRidesCount = summary?.extendedRides ?? renters.filter(r => r.status === 'Extend').length;

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return { date: '—', time: '' };
    try {
      if (typeof dateStr === 'string') {
        if (dateStr.includes(' AM') || dateStr.includes(' PM')) {
          const parts = dateStr.split(',');
          return { date: parts[0]?.trim() || dateStr, time: parts[1]?.trim() || '' };
        }
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: dateStr, time: '' };
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const isUtcMidnight = String(dateStr).includes('18:30:00') || String(dateStr).includes('00:00:00');
      const isMidnightLocal = hours === 0 && minutes === 0;
      const time = (!isUtcMidnight && !isMidnightLocal) ? d.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      }) : '';
      return { date, time };
    } catch (_) {
      return { date: dateStr, time: '' };
    }
  };

  const getStatusClass = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'active ride') return 's-active';
    if (s.includes('upcoming') || s.includes('reserved')) return 's-upcoming';
    if (s.includes('retain')) return 's-retain';
    if (s.includes('return') || s.includes('complete')) return 's-return';
    if (s.includes('extend')) return 's-extend';
    if (s.includes('suspended')) return 's-suspended';
    return 's-noactive';
  };

  const getStatusLabel = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'active ride') return 'Active Ride';
    if (s === 'return' || s === 'returned' || s === 'completed') return 'Returned';
    if (s === 'extend' || s === 'extended') return 'Extended';
    if (s === 'retain' || s === 'retain ride') return 'Retain Ride';
    if (s === 'upcoming' || s === 'reserved') return 'Upcoming';
    if (s === 'suspended') return 'Suspended';
    return 'No Active Ride';
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="re-shell">
        <Sidebar activePath="/renters" />
        <div className="re-main">
          <TopBar title="Renter" subtitle="Dashboard > Renter" />

          <div className="re-page">
            {/* Header */}
            <div className="re-title-row">
              <div>
                <h1 className="re-h1">
                  Renter Directory
                  <span className="re-h1-badge">Live Data</span>
                </h1>
                <p className="re-sub">Manage rider subscriptions, rentals, KYC, and vehicle/battery allocations</p>
              </div>
              <div className="re-live-pill">Real-time Sync Active</div>
            </div>

            {/* 5 KPI Metric Cards matching Active Ride Page Card Design */}
            <div className="re-stats">
              {[
                {
                  lbl: 'TOTAL RIDES',
                  val: totalRidesCount.toLocaleString(),
                  trend: '14.2% vs last 7 days',
                  bg: '#2A195C',
                  trendColor: '#16A34A',
                  ic: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )
                },
                {
                  lbl: 'ACTIVE RIDES',
                  val: activeRidesCount.toLocaleString(),
                  trend: '8.5% in progress',
                  bg: '#10B981',
                  trendColor: '#16A34A',
                  ic: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  )
                },
                {
                  lbl: 'RETAIN RIDES',
                  val: retainRidesCount.toLocaleString(),
                  trend: '0.0% retained',
                  bg: '#F59E0B',
                  trendColor: '#F59E0B',
                  ic: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"/>
                      <polyline points="23 20 23 14 17 14"/>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                    </svg>
                  )
                },
                {
                  lbl: 'RETURNED',
                  val: returnedRidesCount.toLocaleString(),
                  trend: '12.0% completed',
                  bg: '#3B82F6',
                  trendColor: '#16A34A',
                  ic: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  )
                },
                {
                  lbl: 'EXTENDED',
                  val: extendedRidesCount.toLocaleString(),
                  trend: '5.1% extended',
                  bg: '#8B5CF6',
                  trendColor: '#8B5CF6',
                  ic: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  )
                }
              ].map(s => (
                <div className="re-stat-card" key={s.lbl}>
                  <div className="re-stat-ic" style={{ background: s.bg }}>
                    {s.ic}
                  </div>
                  <div className="re-stat-info">
                    <div className="re-stat-lbl">{s.lbl}</div>
                    <div className="re-stat-val">{s.val}</div>
                    <div className="re-stat-trend" style={{ color: s.trendColor }}>
                      <span style={{ fontSize: 8 }}>▲</span> {s.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Directory Card */}
            <div className="re-card">
              {/* Filters Bar */}
              <div className="re-filters-bar">
                <div className="re-filters-left">
                  <div className="re-search-wrapper">
                    <input
                      type="text"
                      placeholder="Search riders, mobile, vehicle ID..."
                      className="re-input-search"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    <span className="re-search-ic">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </span>
                  </div>

                  <button className="re-btn" onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                    </svg>
                    Filters {showFiltersDrawer ? '▲' : '▼'}
                  </button>

                  <select
                    className="re-select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  >
                    <option value="">All Statuses</option>
                    <option value="Active Ride">Active Ride</option>
                    <option value="Retain Ride">Retain Ride</option>
                    <option value="Return">Returned</option>
                    <option value="Extend">Extended</option>
                  </select>

                  <select
                    className="re-select"
                    value={modeFilter}
                    onChange={(e) => { setModeFilter(e.target.value); setPage(1); }}
                  >
                    <option value="">All Modes</option>
                    <option value="App">📱 App</option>
                    <option value="Form">📝 Form</option>
                  </select>

                  {selectedMobiles.length > 0 && (
                    <button className="re-btn re-btn-danger" onClick={openDeleteModalForSelection}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                      Delete ({selectedMobiles.length})
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                  <button className="re-btn" onClick={handleExportCSV}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Export
                  </button>
                  <button className="re-btn re-btn-primary" onClick={() => alert('Feature to manually register new Renter opened.')}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add Renter
                  </button>
                </div>
              </div>

              {/* Filter Drawer */}
              {showFiltersDrawer && (
                <div className="re-filter-drawer">
                  <div className="re-filter-group">
                    <span className="re-filter-lbl">Package Type</span>
                    <select
                      className="re-select"
                      value={packageFilter}
                      onChange={(e) => setPackageFilter(e.target.value)}
                    >
                      <option value="">All Packages</option>
                      <option value="Daily Package">Daily Package</option>
                      <option value="Weekly Package">Weekly Package</option>
                      <option value="Monthly Package">Monthly Package</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div className="re-filter-group">
                    <span className="re-filter-lbl">Mode (Form / App)</span>
                    <select
                      className="re-select"
                      value={modeFilter}
                      onChange={(e) => setModeFilter(e.target.value)}
                    >
                      <option value="">All Modes</option>
                      <option value="App">App</option>
                      <option value="Form">Form</option>
                    </select>
                  </div>

                  <div className="re-filter-group">
                    <span className="re-filter-lbl">Zone</span>
                    <select
                      className="re-select"
                      value={zoneFilter}
                      onChange={(e) => setZoneFilter(e.target.value)}
                    >
                      <option value="All Zones">All Zones</option>
                      <option value="Gotri Zone">Gotri Zone</option>
                      <option value="Aatapi Zone">Aatapi Zone</option>
                      <option value="Alkapuri Zone">Alkapuri Zone</option>
                      <option value="Daman Zone">Daman Zone</option>
                    </select>
                  </div>

                  <button
                    className="re-btn"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('');
                      setPackageFilter('');
                      setModeFilter('');
                      setZoneFilter('All Zones');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Table */}
              <div className="re-table-wrap">
                <table className="re-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={!loading && renters.length > 0 && selectedMobiles.length === renters.length}
                          onChange={handleSelectAll}
                          disabled={loading}
                        />
                      </th>
                      <th>RIDER</th>
                      <th>MOBILE</th>
                      <th>VEHICLE</th>
                      <th>BATTERY</th>
                      <th>PACKAGE</th>
                      <th>MODE</th>
                      <th>RENTAL START</th>
                      <th>RETURN</th>
                      <th>STATUS</th>
                      <th style={{ textAlign: 'center', width: '160px' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, sIdx) => (
                        <tr key={`skel-${sIdx}`}>
                          {Array.from({ length: 11 }).map((_, cIdx) => (
                            <td key={cIdx}>
                              <div style={{
                                height: 14,
                                borderRadius: 6,
                                background: 'linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.5s ease-in-out infinite',
                                width: cIdx === 0 ? 16 : cIdx === 1 ? 140 : 90
                              }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : renters.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ padding: '70px 20px', textAlign: 'center' }}>
                          <div style={{
                            width: 64, height: 64, borderRadius: 20,
                            background: '#F1F5F9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                            color: '#64748B'
                          }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <circle cx="11" cy="11" r="8"/>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                            No riders found
                          </div>
                          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                            Try adjusting your search or selected zone filter
                          </div>
                        </td>
                      </tr>
                    ) : (
                      renters.map((r, idx) => {
                        const start = formatRenterDateTime(r.rental_start_date, true);
                        const end = formatRenterDateTime(r.return_date, false);
                        const displayName = getDisplayName(r, idx);
                        const displayMobile = r.mobile || '+91 98765 43210';
                        const isSelected = selectedMobiles.includes(r.mobile);

                        const sLower = (r.status || '').toLowerCase();
                        const isReturned = ['return', 'returned', 'completed'].includes(sLower);
                        const isActive = ['active ride', 'active', 'ongoing'].includes(sLower);
                        const isRetain = ['retain ride', 'retain'].includes(sLower);
                        const isExtend = ['extend', 'extended'].includes(sLower);

                        const statusLabel = isReturned ? 'Returned' : (isActive ? 'Active Ride' : (isRetain ? 'Retain Ride' : (isExtend ? 'Extended' : (r.status || 'Active Ride'))));
                        const statusCls = isReturned ? 'returned' : (isActive ? 'active' : (isRetain ? 'retain' : (isExtend ? 'extend' : 'default')));

                        const profileUrl = `/renters/profile?id=${encodeURIComponent(r.id || r.vehicle_id || '')}&name=${encodeURIComponent(displayName)}&mobile=${encodeURIComponent(displayMobile)}&vehicle=${encodeURIComponent(r.vehicle_id || '')}&battery=${encodeURIComponent(r.battery_id || '')}&status=${encodeURIComponent(r.status || '')}&zone=${encodeURIComponent((r as any).zone || selectedZone || 'Gotri Zone')}`;

                        const isApp = (r.booking_source || '').toLowerCase().includes('app') || (r as any).mode === 'App';
                        const pkgDisplay = (!r.package_name || r.package_name === 'Rider Plan' || r.package_name === 'Standard Plan' || r.package_name.toLowerCase().includes('custom')) ? 'custom' : r.package_name.toLowerCase();

                        return (
                          <tr
                            key={r.id || idx}
                            className={isSelected ? 'selected' : ''}
                            onClick={() => router.push(profileUrl)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectOne(r.mobile)}
                              />
                            </td>
                            <td>
                              <div className="re-rider-cell">
                                <RiderAvatar name={displayName} avatarUrl={r.avatar_url} />
                                <div>
                                  <span className="re-rider-name">{displayName}</span>
                                  <span className="re-rider-sub">Rider ID #${r.id ? r.id.replace(/-/g, '').slice(0, 8) : `RID-${idx + 100}`}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontWeight: 600, color: '#334155' }}>{displayMobile}</td>
                            <td>
                              {r.vehicle_id && r.vehicle_id !== '—' && r.vehicle_id !== 'EV-DEFAULT' ? (
                                <span className="re-badge-capsule">{r.vehicle_id}</span>
                              ) : (
                                <span style={{ color: '#94A3B8' }}>—</span>
                              )}
                            </td>
                            <td>
                              {r.battery_id && r.battery_id !== '—' && r.battery_id !== 'BAT-DEFAULT' ? (
                                <span className="re-badge-capsule re-badge-battery">{r.battery_id}</span>
                              ) : (
                                <span style={{ color: '#94A3B8' }}>—</span>
                              )}
                            </td>
                            <td>
                              <span className="re-pkg-text">{pkgDisplay}</span>
                            </td>
                            <td>
                              <span className={`re-mode-pill ${isApp ? 'app' : 'form'}`}>
                                {isApp ? 'App' : 'Form'}
                              </span>
                            </td>
                            <td>
                              <div className="re-datetime-block">
                                <span className="re-dt-main">{start.main}</span>
                                <span className={`re-dt-sub ${start.isTime ? 'green' : 'muted'}`}>
                                  {start.sub}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="re-datetime-block">
                                <span className="re-dt-main">{end.main}</span>
                                <span className={`re-dt-sub ${end.isTime ? 'gray' : 'muted'}`}>
                                  {end.sub}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`re-status-pill ${statusCls}`}>
                                <span className="dot" />
                                {statusLabel}
                              </span>
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div className="re-action-cell">
                                <button
                                  className="re-action-btn"
                                  title="View Rider Profile"
                                  onClick={() => router.push(profileUrl)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                  </svg>
                                </button>
                                <button
                                  className="re-action-btn"
                                  title="Payment & Deposit History"
                                  onClick={() => router.push(`${profileUrl}&tab=financials`)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                                    <line x1="2" y1="10" x2="22" y2="10"/>
                                  </svg>
                                </button>
                                <button
                                  className="re-action-btn"
                                  title="Allocate Vehicle / Battery"
                                  onClick={() => openAllocationModal(r, displayName, displayMobile)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="7" cy="17" r="2"/>
                                    <circle cx="17" cy="17" r="2"/>
                                    <path d="M5 17h-2v-4l2-5h9l4 5h1a2 2 0 0 1 2 2v2h-2"/>
                                  </svg>
                                </button>
                                <button
                                  className="re-action-btn"
                                  title="Download Booking Receipt"
                                  onClick={() => handleDownloadReceipt(r)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                  </svg>
                                </button>
                                <button
                                  className="re-action-btn danger"
                                  title="Delete Rider"
                                  onClick={() => openDeleteModalForSingle(r.mobile)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="re-card-ft">
                <span className="re-card-ft-lbl">
                  Showing <strong>{pagination.total > 0 ? (page - 1) * pagination.limit + 1 : 0}</strong> to <strong>{Math.min(page * pagination.limit, pagination.total)}</strong> of <strong>{pagination.total}</strong> entries
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <select
                    className="re-select"
                    style={{ minWidth: 130 }}
                    value={pageSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setPageSize(newSize);
                      setPage(1);
                    }}
                  >
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                  <div className="re-pg">
                    <button
                      className="re-pgb"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      title="Previous Page"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                    </button>

                    {getPaginationItems(page, pagination.totalPages).map((item, idx) => {
                      if (item === '...') {
                        return (
                          <span key={`ellipsis-${idx}`} style={{ padding: '0 6px', color: '#94A3B8', fontWeight: 700, fontSize: 13 }}>
                            •••
                          </span>
                        );
                      }
                      const pNum = Number(item);
                      return (
                        <button
                          key={`page-${pNum}`}
                          className={`re-pgb ${pNum === page ? 'cur' : ''}`}
                          onClick={() => setPage(pNum)}
                        >
                          {pNum}
                        </button>
                      );
                    })}

                    <button
                      className="re-pgb"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      title="Next Page"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="re-footer">
              <span>© 2026 Evegah Technologies</span>
              <span>Version 2.4.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Modal */}
      {isAllocModalOpen && allocRenter && (
        <div className="re-modal-overlay" onClick={() => setIsAllocModalOpen(false)}>
          <div className="re-modal" onClick={(e) => e.stopPropagation()}>
            <div className="re-modal-hdr">
              <h3 className="re-modal-tit">Vehicle & Battery Allocation</h3>
              <button className="re-modal-close" onClick={() => setIsAllocModalOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="re-modal-body">
              <div className="re-modal-rider">
                <img
                  src={allocRenter.renter.avatar_url || '/rohit_avatar.png'}
                  alt=""
                  className="re-modal-rider-avatar"
                />
                <div>
                  <div className="re-modal-rider-name">{allocRenter.displayName}</div>
                  <div className="re-modal-rider-meta">
                    {allocRenter.displayMobile} • {allocRenter.renter.package_name || 'Standard'}
                  </div>
                </div>
              </div>

              <div className="re-modal-field">
                <label className="re-modal-lbl">Select Vehicle</label>
                <select className="re-modal-select" value={allocVehicle} onChange={(e) => setAllocVehicle(e.target.value)}>
                  <option value="EVM1024001">EVM1024001 — Evegah City 1.0 (Available)</option>
                  <option value="EVM1024002">EVM1024002 — Evegah City 2.0 (Available)</option>
                  <option value="EVM1024003">EVM1024003 — Evegah Mink 1.0 (Available)</option>
                  <option value="EVM1024004">EVM1024004 — Evegah Pro 2.0 (Available)</option>
                  <option value="EVM1024023">EVM1024023 — Evegah Max 3.0 (Assigned)</option>
                  <option value="EVM1024024">EVM1024024 — Evegah Speed (Available)</option>
                </select>
              </div>

              <div className="re-modal-field">
                <label className="re-modal-lbl">Select Battery</label>
                <select className="re-modal-select" value={allocBattery} onChange={(e) => setAllocBattery(e.target.value)}>
                  <option value="BAT-GOTRI-01">BAT-GOTRI-01 — 100% SOC (Idle)</option>
                  <option value="BAT-GOTRI-02">BAT-GOTRI-02 — 94% SOC (Idle)</option>
                  <option value="BAT-AATAPI-01">BAT-AATAPI-01 — 98% SOC (Idle)</option>
                  <option value="BAT-ALKAPURI-01">BAT-ALKAPURI-01 — 90% SOC (Idle)</option>
                  <option value="BAT-DEFAULT">BAT-DEFAULT — Standard Battery Pack</option>
                </select>
              </div>
            </div>

            <div className="re-modal-ft">
              <Link
                href={`/renters/profile?id=${encodeURIComponent(allocRenter.renter.id || allocRenter.renter._id || allocRenter.renter.vehicle_id || 'RID-2026-001')}&name=${encodeURIComponent(allocRenter.displayName)}&mobile=${encodeURIComponent(allocRenter.displayMobile)}&vehicle=${encodeURIComponent(allocVehicle)}&battery=${encodeURIComponent(allocBattery)}&status=${encodeURIComponent(allocRenter.renter.status)}&zone=Gotri%20Zone`}
                className="re-btn"
              >
                View Profile
              </Link>
              <button className="re-btn re-btn-primary" onClick={handleSaveAllocation} disabled={savingAlloc}>
                {savingAlloc ? 'Assigning...' : 'Confirm Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="re-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="re-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="re-modal-hdr">
              <h3 className="re-modal-tit">Confirm Deletion</h3>
              <button className="re-modal-close" onClick={() => setIsDeleteModalOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="re-modal-body" style={{ textAlign: 'center', padding: '30px 28px' }}>
              <div className="re-danger-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </div>
              <h4 className="re-danger-title">Delete {mobilesToDelete.length} Rider{mobilesToDelete.length > 1 ? 's' : ''}?</h4>
              <p className="re-danger-desc">
                Are you sure you want to permanently delete the selected rider record{mobilesToDelete.length > 1 ? 's' : ''}? This action cannot be undone.
              </p>
            </div>

            <div className="re-modal-ft">
              <button className="re-btn" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="re-btn re-btn-danger" onClick={confirmDeleteRiders} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="re-toast">
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}