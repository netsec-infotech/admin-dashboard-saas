"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// CSS Stylesheet to inject for pixel perfect copy-to-copy matching
const CSS = `
.za-shell {
  display: flex;
  min-height: 100vh;
  background: #F8F9FF;
  font-family: 'Inter', sans-serif;
}
.za-main {
  margin-left: 230px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100% - 230px);
}
.za-page {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color:white;
}

/* Breadcrumbs */
.za-bc {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}
.za-bc-link {
  color: #2A195C;
  text-decoration: none;
  font-weight: 600;
  transition: color .15s;
}
.za-bc-link:hover {
  color: #4F46E5;
}
.za-bc-sep {
  color: #CBD5E1;
  font-weight: 600;
}
.za-bc-cur {
  color: #0F172A;
  font-weight: 700;
}

/* Header Row */
.za-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-top: -4px;
}
.za-h1 {
  font-size: 24px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.02em;
}
.za-sub {
  font-size: 13px;
  color: #64748B;
  margin: 4px 0 0;
  font-weight: 500;
}

/* Buttons */
.za-btn-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.za-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
  height: 42px;
  box-sizing: border-box;
}
.za-btn-outline {
  background: #FFF;
  border: 1.5px solid #2A195C;
  color: #2A195C;
}
.za-btn-outline:hover {
  background: #F5F3FF;
  border-color: #4F46E5;
  color: #4F46E5;
}
.za-btn-primary {
  background: #2A195C;
  border: 1.5px solid #2A195C;
  color: #FFF;
}
.za-btn-primary:hover {
  background: #1E1145;
  border-color: #1E1145;
}
.za-btn-green {
  background: #16A34A;
  border: 1.5px solid #16A34A;
  color: #FFF;
}
.za-btn-green:hover {
  background: #15803D;
  border-color: #15803D;
}
.za-btn-disabled {
  background: #E2E8F0;
  border: 1.5px solid #E2E8F0;
  color: #94A3B8;
  cursor: not-allowed;
}

/* Stepper progress */
.za-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,.02);
  gap: 16px;
}
.za-step-card {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1.5px solid transparent;
  transition: all 0.2s;
}
.za-step-card.active {
  background: #F5F3FF;
  border-color: #C084FC;
}
.za-step-card.inactive {
  background: #FFF;
}
.za-step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
  transition: all 0.2s;
}
.za-step-circle.active {
  background: #2A195C;
  color: #FFF;
}
.za-step-circle.completed {
  background: #10B981;
  color: #FFF;
}
.za-step-circle.inactive {
  border: 2px solid #CBD5E1;
  color: #64748B;
  background: #FFF;
}
.za-step-info {
  display: flex;
  flex-direction: column;
}
.za-step-title {
  font-size: 14px;
  font-weight: 700;
  color: #0F172A;
}
.za-step-desc {
  font-size: 11px;
  color: #64748B;
  margin-top: 2px;
  font-weight: 500;
}
.za-step-line {
  width: 48px;
  height: 2px;
  background: #E2E8F0;
  flex-shrink: 0;
}
.za-step-line.active {
  background: #C084FC;
}

/* Layout Grid */
.za-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}

/* Panels */
.za-card {
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,.02);
}
.za-card-title {
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 4px;
}
.za-card-sub {
  font-size: 12.5px;
  color: #64748B;
  margin: 0 0 20px;
  font-weight: 500;
}

/* Table Controls */
.za-table-ctrls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.za-search-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 0 14px;
  gap: 10px;
  background: #FFF;
  height: 40px;
  flex: 1;
  max-width: 320px;
  transition: all .15s;
}
.za-search-wrap:focus-within {
  border-color: #2A195C;
  box-shadow: 0 0 0 1px #2A195C;
}
.za-search-inp {
  border: none;
  outline: none;
  font-size: 12.5px;
  color: #1E293B;
  width: 100%;
  font-weight: 500;
}
.za-search-inp::placeholder {
  color: #94A3B8;
}
.za-filter-btn {
  height: 40px;
  width: 40px;
  border-radius: 10px;
  border: 1.5px solid #E2E8F0;
  background: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748B;
  transition: all .15s;
  flex-shrink: 0;
}
.za-filter-btn:hover {
  border-color: #2A195C;
  color: #2A195C;
}
.za-dropdown-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1.5px solid #E2E8F0;
  background: #FFF;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
  transition: all .15s;
}
.za-dropdown-btn:hover {
  border-color: #2A195C;
  color: #2A195C;
}

/* Tabs */
.za-tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1.5px solid #E2E8F0;
  margin-bottom: 20px;
}
.za-tab-btn {
  padding: 12px 2px 14px;
  font-size: 13.5px;
  font-weight: 700;
  color: #64748B;
  cursor: pointer;
  border: none;
  background: none;
  border-bottom: 3px solid transparent;
  transition: all 0.15s;
  margin-bottom: -1.5px;
}
.za-tab-btn.active {
  color: #2A195C;
  border-bottom-color: #2A195C;
  font-weight: 800;
}
.za-tab-btn:hover {
  color: #2A195C;
}

/* Table Design */
.za-table-container {
  overflow-x: auto;
}
.za-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.za-table th {
  font-size: 11.5px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  padding: 12px 16px;
  border-bottom: 1.5px solid #F1F5F9;
  letter-spacing: 0.03em;
}
.za-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #F1F5F9;
  font-size: 13px;
  color: #334155;
  vertical-align: middle;
}
.za-table tr.selected {
  background: #F8F7FF;
}
.za-table tr.selected td {
  border-bottom-color: #E2E8F0;
}
.za-row-clickable {
  cursor: pointer;
}
.za-radio-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all .15s;
}
.za-radio-circle.active {
  border-color: #2A195C;
}
.za-radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2A195C;
}
.za-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all .15s;
}
.za-checkbox.active {
  background: #2A195C;
  border-color: #2A195C;
}

/* Badges */
.za-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}
.za-badge-green {
  background: #DCFCE7;
  color: #15803D;
}
.za-badge-red {
  background: #FEE2E2;
  color: #B91C1C;
}
.za-badge-orange {
  background: #FFEDD5;
  color: #C2410C;
}
.za-badge-blue {
  background: #DBEAFE;
  color: #1D4ED8;
}
.za-badge-cyan {
  background: #ECFEFF;
  color: #0891B2;
}
.za-badge-purple {
  background: #F3E8FF;
  color: #7E22CE;
}

/* Pagination */
.za-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 12.5px;
  color: #64748B;
  font-weight: 500;
}
.za-pag-btns {
  display: flex;
  align-items: center;
  gap: 6px;
}
.za-pag-btn {
  height: 32px;
  width: 32px;
  border-radius: 8px;
  border: 1.5px solid #E2E8F0;
  background: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 700;
  color: #475569;
  font-size: 12.5px;
  transition: all .15s;
}
.za-pag-btn:hover {
  border-color: #2A195C;
  color: #2A195C;
}
.za-pag-btn.active {
  background: #2A195C;
  border-color: #2A195C;
  color: #FFF;
}

/* Right sidebar details */
.za-detail-box {
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.02);
}
.za-detail-hdr {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.za-detail-icon-box {
  height: 38px;
  width: 38px;
  border-radius: 10px;
  background: #F5F3FF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2A195C;
}
.za-detail-hdr-title {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
}
.za-detail-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.za-detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.za-detail-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.za-detail-val {
  font-size: 13px;
  color: #1E293B;
  font-weight: 600;
  line-height: 1.4;
}
.za-divider {
  height: 1px;
  background: #F1F5F9;
  margin: 18px 0;
}

/* Selected Items sidebar panel */
.za-selected-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.za-selected-title {
  font-size: 14px;
  font-weight: 800;
  color: #0F172A;
}
.za-selected-clear {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: #EF4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.za-selected-clear:hover {
  color: #DC2626;
}
.za-selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  margin-bottom: 24px;
}
.za-selected-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 12px;
}
.za-selected-card-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.za-selected-card-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.za-selected-card-name {
  font-size: 12px;
  font-weight: 700;
  color: #1E293B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.za-selected-card-desc {
  font-size: 10.5px;
  color: #64748B;
  margin-top: 1px;
}
.za-selected-card-del {
  background: none;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.za-selected-card-del:hover {
  color: #EF4444;
}

/* Summary Card */
.za-summary-box {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 16px;
  border: 1px dashed #CBD5E1;
}
.za-summary-title {
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  margin-bottom: 12px;
  letter-spacing: 0.03em;
}
.za-summary-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.za-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  color: #475569;
  font-weight: 500;
}
.za-summary-row-bold {
  font-weight: 700;
  color: #0F172A;
}

/* User Avatars */
.za-user-av {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E0E7FF;
  color: #4F46E5;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Bottom Bar */
.za-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFF;
  border-top: 1.5px solid #E2E8F0;
  padding: 16px 24px;
  margin-top: 10px;
  border-radius: 0 0 16px 16px;
}
.za-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #2A195C;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}
.za-back-btn:hover {
  color: #4F46E5;
}

/* Selected Chips List */
.za-chips-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid #F1F5F9;
}
.za-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: #EEF2FF;
  border: 1px solid #E0E7FF;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  color: #4F46E5;
}
.za-chip-close {
  background: none;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.za-chip-close:hover {
  color: #EF4444;
}

/* Success Modal */
.za-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.za-modal {
  background: #FFF;
  border-radius: 20px;
  padding: 40px 30px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.za-modal-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #DCFCE7;
  color: #10B981;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

/* Step 3 Styles */
.za-overview-box {
  display: flex;
  gap: 20px;
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 24px;
  align-items: start;
}
.za-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
  margin-top: 16px;
}
.za-alert-banner {
  background: #F5F3FF;
  border: 1px solid #DDD6FE;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6B21A8;
  font-size: 13px;
  font-weight: 600;
  margin-top: 20px;
}

/* Dashboard stats row */
.za-stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  width: 100%;
}
.za-stat-card {
  padding: 16px;
  border-radius: 16px;
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.01);
}
.za-stat-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.za-stat-info {
  display: flex;
  flex-direction: column;
}
.za-stat-label {
  font-size: 11px;
  color: #64748B;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.za-stat-val {
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  margin: 2px 0;
  line-height: 1;
}
.za-stat-sub {
  font-size: 10.5px;
  color: #94A3B8;
  font-weight: 500;
}

/* Charts Grid layout */
.za-charts-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
}
.za-chart-card {
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.01);
}
.za-chart-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.za-chart-title {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
}
.za-chart-legends {
  display: flex;
  align-items: center;
  gap: 12px;
}
.za-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
}
.za-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.za-dot-red { background: #EF4444; }
.za-dot-green { background: #22C55E; }
.za-dot-purple { background: #2A195C; }

/* Custom bar chart styles */
.za-bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 160px;
  padding-bottom: 8px;
  border-bottom: 1.5px solid #F1F5F9;
  position: relative;
}
.za-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 9%;
  height: 100%;
  justify-content: flex-end;
}
.za-bars-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 120px;
  width: 100%;
  justify-content: center;
}
.za-bar {
  width: 5px;
  border-radius: 2px 2px 0 0;
  min-height: 4px;
  transition: height 0.4s ease;
}
.za-bar-red { background: #EF4444; }
.za-bar-green { background: #22C55E; }
.za-bar-purple { background: #2A195C; }
.za-bar-label {
  font-size: 9.5px;
  font-weight: 600;
  color: #64748B;
  margin-top: 8px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Donut chart styles */
.za-donut-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 160px;
}
.donut-text {
  font-family: 'Inter', sans-serif;
  font-size: 7px;
  font-weight: 800;
  fill: #0F172A;
}
.za-donut-legend-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.za-donut-legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  font-weight: 600;
  color: #64748B;
}

/* Filter controls bar */
.za-overview-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 10px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.01);
}
.za-search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 6px 12px;
  height: 38px;
  box-sizing: border-box;
}
.za-search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 12.5px;
  color: #0F172A;
  font-weight: 500;
  width: 100%;
}
.za-select-filter {
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  padding: 0 12px;
  height: 38px;
  outline: none;
  cursor: pointer;
  min-width: 120px;
  box-sizing: border-box;
}
.za-btn-filter {
  background: #FFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  box-sizing: border-box;
}
.za-btn-filter:hover {
  background: #F8F9FF;
  border-color: #CBD5E1;
}
`;

// Helper SVGs to match mockups 1000% copy-to-copy
const ISearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const IChevD = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const ITrash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IClose = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ICheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IScooter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" /><path d="M3 10h12v8M16 8h4l3 5v5" />
  </svg>
);
const IBattery = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="13" x2="23" y2="11" />
  </svg>
);
const IResource = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

// Types
interface Zone {
  id: string;
  code: string;
  area: string;
  type: string;
  priority: string;
  status: string;
  totalResources: number;
  vehicles: number;
  batteries: number;
  users: number;
  description: string;
  effectiveFrom: string;
}

export default function AssignZonePage() {
  const router = useRouter();

  // Wizard Flow state
  const [step, setStep] = useState<number>(0);
  const [overviewSearch, setOverviewSearch] = useState("");
  const [overviewZoneType, setOverviewZoneType] = useState("All");
  const [overviewPriority, setOverviewPriority] = useState("All");
  const [overviewStatus, setOverviewStatus] = useState("All");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<"users" | "vehicles" | "batteries">("users");

  // Search/Filter states
  const [zoneSearch, setZoneSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [batterySearch, setBatterySearch] = useState("");

  const [zoneSort, setZoneSort] = useState("A-Z");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Raw loaded data from database
  const [rawZones, setRawZones] = useState<any[]>([]);
  const [rawUsers, setRawUsers] = useState<any[]>([]);
  const [rawBatteries, setRawBatteries] = useState<any[]>([]);
  const [rawVehicles, setRawVehicles] = useState<any[]>([]);

  // Modal view for allocated resources
  const [viewingZoneResources, setViewingZoneResources] = useState<any | null>(null);
  const [viewModalTab, setViewModalTab] = useState<'users' | 'vehicles' | 'batteries'>('users');

  // Dynamically compute zones list with real resource counts
  const zones = useMemo(() => {
    const ZONE_AREAS: Record<string, string> = {
      'Gotri Zone': '2.45 km²',
      'Manjalpur Zone': '1.80 km²',
      'KPGU Zone': '1.25 km²',
      'Aatapi Zone': '1.10 km²',
      'Moti Daman Zone': '1.05 km²'
    };
    return rawZones.map((z: any) => {
      const zNameLower = (z.name || '').trim().toLowerCase();
      const zoneVehicles = rawVehicles.filter((v: any) => (v.zone || '').trim().toLowerCase() === zNameLower).length;
      const zoneBatteries = rawBatteries.filter((b: any) => (b.zone || '').trim().toLowerCase() === zNameLower).length;
      const zoneUsers = rawUsers.filter((u: any) => 
        (u.zone || '').split(',').map((zn: string) => zn.trim().toLowerCase()).includes(zNameLower)
      ).length;
      return {
        id: z.name, // compares with selectedZoneId
        code: z.code || 'ZONE-CODE',
        area: ZONE_AREAS[z.name] || '2.00 km²',
        type: z.type || 'Operational',
        priority: z.priority || 'Medium',
        status: z.status === 'active' ? 'Active' : 'Inactive',
        totalResources: zoneVehicles + zoneBatteries + zoneUsers,
        vehicles: zoneVehicles,
        batteries: zoneBatteries,
        users: zoneUsers,
        description: z.description || '',
        effectiveFrom: z.start_date ? new Date(z.start_date).toLocaleDateString() : 'N/A'
      };
    });
  }, [rawZones, rawVehicles, rawUsers, rawBatteries]);

  // Dynamically compute total assigned stats for charts
  const totalStats = useMemo(() => {
    let vehicles = 0;
    let batteries = 0;
    let users = 0;
    zones.forEach(z => {
      vehicles += z.vehicles;
      batteries += z.batteries;
      users += z.users;
    });
    const total = vehicles + batteries + users;
    return {
      vehicles,
      batteries,
      users,
      total,
      vehPct: total > 0 ? (vehicles / total) * 100 : 0,
      batPct: total > 0 ? (batteries / total) * 100 : 0,
      usrPct: total > 0 ? (users / total) * 100 : 0
    };
  }, [zones]);

  const handleDeleteZoneRow = (id: string) => {
    if (confirm(`Are you sure you want to remove "${id}"?`)) {
      setRawZones(prev => prev.filter(z => z.name !== id));
      if (selectedZoneId === id) {
        setSelectedZoneId("");
      }
    }
  };

  const handleDeleteUserRow = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleDeleteVehicleRow = (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      setVehicles(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleDeleteBatteryRow = (id: string) => {
    if (confirm("Are you sure you want to delete this battery?")) {
      setBatteries(prev => prev.filter(b => b.id !== id));
    }
  };

  // Users Mock (Screen 4)
  const [users, setUsers] = useState<any[]>([]);

  // Vehicles State (Screen 2)
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Batteries Mock (Screen 3)
  const [batteries, setBatteries] = useState<any[]>([]);

  const handleDeleteZoneResources = async (zoneName: string) => {
    if (confirm(`Are you sure you want to unassign all resources (vehicles, users, and batteries) from "${zoneName}"?`)) {
      try {
        const zoneVehicles = rawVehicles.filter((v: any) => v.zone === zoneName);
        const zoneUsers = rawUsers.filter((u: any) => u.zone === zoneName);
        const zoneBatteries = rawBatteries.filter((b: any) => b.zone === zoneName);

        if (zoneVehicles.length > 0) {
          await Promise.all(zoneVehicles.map(v => 
            api.patch(`/vehicles/${v.id}/zone`, { zone: 'Unassigned' })
          ));
        }
        if (zoneUsers.length > 0) {
          await Promise.all(zoneUsers.map(u => 
            api.patch(`/users/${u.id}/zone`, { zone: 'Unassigned' })
          ));
        }
        if (zoneBatteries.length > 0) {
          await Promise.all(zoneBatteries.map(b => 
            api.patch(`/batteries/${b.id}/zone`, { zone: 'Unassigned' })
          ));
        }

        alert(`All resources unassigned successfully from "${zoneName}".`);
        fetchData();
      } catch (err: any) {
        console.error(err);
        alert('Failed to unassign resources: ' + (err.message || err));
      }
    }
  };

  const fetchData = () => {
    // Fetch live Zones
    api.get('/zones')
      .then(res => {
        let dbZones = (res && res.status === 'success' && res.data) ? res.data : [];
        if (dbZones.length === 0) {
          dbZones = [
            { name: 'Gotri Zone', code: 'ZONE-GT-001', type: 'Operational', priority: 'High', status: 'active', start_date: '2024-04-15' },
            { name: 'Manjalpur Zone', code: 'ZONE-MJ-002', type: 'Operational', priority: 'Medium', status: 'active', start_date: '2024-04-16' },
            { name: 'KPGU Zone', code: 'ZONE-KP-003', type: 'Operational', priority: 'Medium', status: 'active', start_date: '2024-04-17' },
          ];
        }
        setRawZones(dbZones);
        if (dbZones.length > 0 && !selectedZoneId) {
          setSelectedZoneId(dbZones[0].name);
        }
      })
      .catch(err => console.error('Error fetching zones:', err));

    // Fetch live Users
    api.get('/users')
      .then(res => {
        if (res && res.status === 'success' && res.data) {
          const mappedUsers = res.data.map((u: any) => ({
            id: String(u.id),
            name: u.name,
            initials: u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2),
            role: u.role || 'Zone Employee',
            email: u.email || '',
            phone: u.mobile || '',
            department: 'Operations',
            status: u.status === 'active' ? 'Active' : 'Inactive',
            lastActive: u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
            zone: u.zone || 'Unassigned',
            checked: false
          }));
          setRawUsers(mappedUsers);
          // Set unassigned users for Step 2 checkable selection list
          setUsers(mappedUsers.filter((u: any) => !u.zone || u.zone === 'Unassigned' || u.zone === ''));
        }
      })
      .catch(err => console.error('Error fetching users:', err));

    // Fetch live Batteries
    api.get('/batteries')
      .then(res => {
        if (res && Array.isArray(res)) {
          const mappedBatteries = res.map((b: any) => ({
            id: b.battery_id,
            serial: b.serial_number || b.serial_no || b.battery_id,
            capacity: b.capacity || '60V / 30Ah',
            health: `${b.health || b.soh || 100}%`,
            status: b.status === 'charging' ? 'Charging' : ((b.status || '').toLowerCase().includes('use') ? 'In Use' : 'Available'),
            lastActive: b.updated_at ? new Date(b.updated_at).toLocaleString() : 'Active',
            zone: b.zone || 'Unassigned',
            checked: false
          }));
          setRawBatteries(mappedBatteries);
          setBatteries(mappedBatteries.filter((b: any) => !b.zone || b.zone.toLowerCase() === 'unassigned' || b.zone === ''));
        }
      })
      .catch(err => console.error('Error fetching batteries:', err));

    // Fetch live Vehicles
    api.get('/vehicles')
      .then(res => {
        if (res && res.status === 'success' && res.data) {
          const mappedVehicles = res.data.map((v: any) => ({
            id: String(v.id),
            name: `${v.evegah_model_name || 'Evegah Vehicle'} (${v.code})`,
            number: v.code,
            model: v.evegah_model_name || 'City',
            status: v.vehicle_status || 'Available',
            lastActive: 'Active now',
            zone: v.zone || 'Unassigned',
            checked: false
          }));
          setRawVehicles(mappedVehicles);
          // Set unassigned vehicles for Step 2 checkable selection list
          setVehicles(mappedVehicles.filter((v: any) => !v.zone || v.zone === 'Unassigned' || v.zone === ''));
        }
      })
      .catch(err => console.error('Error fetching vehicles:', err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedZoneId) {
      setVehicles(rawVehicles.filter(v => !v.zone || v.zone === 'Unassigned' || v.zone === ''));
      setUsers(rawUsers.filter(u => !u.zone || u.zone === 'Unassigned' || u.zone === ''));
      setBatteries(rawBatteries.filter(b => !b.zone || b.zone === 'Unassigned' || b.zone === ''));
      return;
    }

    const selZoneLower = selectedZoneId.trim().toLowerCase();

    setVehicles(rawVehicles
      .filter(v => {
        const vz = (v.zone || '').trim().toLowerCase();
        return !vz || vz === 'unassigned' || vz === '' || vz === selZoneLower;
      })
      .map(v => ({
        ...v,
        checked: (v.zone || '').trim().toLowerCase() === selZoneLower
      }))
    );

    setUsers(rawUsers.map(u => {
      const userZones = (u.zone || '').split(',').map((z: string) => z.trim().toLowerCase());
      return {
        ...u,
        checked: userZones.includes(selZoneLower)
      };
    }));

    setBatteries(rawBatteries
      .filter(b => {
        const bz = (b.zone || '').trim().toLowerCase();
        return !bz || bz === 'unassigned' || bz === '' || bz === selZoneLower;
      })
      .map(b => ({
        ...b,
        checked: (b.zone || '').trim().toLowerCase() === selZoneLower
      }))
    );
  }, [selectedZoneId, rawVehicles, rawUsers, rawBatteries]);

  const handleSelectAllUsers = () => {
    const allSelected = filteredUsers.length > 0 && filteredUsers.every(u => u.checked);
    const filteredIds = new Set(filteredUsers.map(u => u.id));
    setUsers(prev => prev.map(u => {
      if (filteredIds.has(u.id)) {
        return { ...u, checked: !allSelected };
      }
      return u;
    }));
  };

  const handleSelectAllVehicles = () => {
    const allSelected = filteredVehicles.length > 0 && filteredVehicles.every(v => v.checked);
    const filteredIds = new Set(filteredVehicles.map(v => v.id));
    setVehicles(prev => prev.map(v => {
      if (filteredIds.has(v.id)) {
        return { ...v, checked: !allSelected };
      }
      return v;
    }));
  };

  const handleSelectAllBatteries = () => {
    const allSelected = filteredBatteries.length > 0 && filteredBatteries.every(b => b.checked);
    const filteredIds = new Set(filteredBatteries.map(b => b.id));
    setBatteries(prev => prev.map(b => {
      if (filteredIds.has(b.id)) {
        return { ...b, checked: !allSelected };
      }
      return b;
    }));
  };

  // Active Zone Selection Detail helper
  const selectedZone = useMemo(() => {
    return zones.find(z => z.id === selectedZoneId) || zones[0] || {
      id: "Loading...",
      code: "N/A",
      area: "0 km²",
      type: "N/A",
      priority: "N/A",
      status: "N/A",
      totalResources: 0,
      description: "Loading...",
      effectiveFrom: "N/A"
    };
  }, [selectedZoneId, zones]);

  // Filtered lists
  const filteredZones = useMemo(() => {
    let result = zones.filter(z =>
      z.id.toLowerCase().includes(zoneSearch.toLowerCase()) ||
      z.code.toLowerCase().includes(zoneSearch.toLowerCase())
    );
    if (zoneSort === "A-Z") {
      result.sort((a, b) => a.id.localeCompare(b.id));
    } else {
      result.sort((a, b) => b.id.localeCompare(a.id));
    }
    return result;
  }, [zoneSearch, zoneSort, zones]);

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch)
    );
  }, [userSearch, users]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v =>
      v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.number.toLowerCase().includes(vehicleSearch.toLowerCase())
    );
  }, [vehicleSearch, vehicles]);

  const filteredBatteries = useMemo(() => {
    return batteries.filter(b =>
      b.id.toLowerCase().includes(batterySearch.toLowerCase()) ||
      b.serial.toLowerCase().includes(batterySearch.toLowerCase())
    );
  }, [batterySearch, batteries]);

  // Selected Resources Helpers
  const selectedUsers = useMemo(() => users.filter(u => u.checked), [users]);
  const selectedVehicles = useMemo(() => vehicles.filter(v => v.checked), [vehicles]);
  const selectedBatteries = useMemo(() => batteries.filter(b => b.checked), [batteries]);

  // Summary Metrics
  const userSummary = useMemo(() => {
    return {
      total: 12,
      selected: selectedUsers.length,
      employees: users.filter(u => u.role === "Zone Employee").length,
      supervisors: users.filter(u => u.role === "Zone Supervisor").length,
      staff: users.filter(u => u.role === "Support Staff").length,
      active: users.filter(u => u.status === "Active").length,
      inactive: users.filter(u => u.status === "Inactive").length,
    };
  }, [users, selectedUsers]);

  const vehicleSummary = useMemo(() => {
    return {
      selected: selectedVehicles.length,
      mink: selectedVehicles.filter(v => v.model === "Mink").length,
      city: selectedVehicles.filter(v => v.model === "City").length,
      king: selectedVehicles.filter(v => v.model === "King").length,
      active: selectedVehicles.filter(v => v.status === "Active").length,
      inactive: selectedVehicles.filter(v => v.status === "Inactive").length,
    };
  }, [selectedVehicles]);

  const batterySummary = useMemo(() => {
    const totalCap = selectedBatteries.length * 3.2;
    const avgHealth = selectedBatteries.length > 0
      ? (selectedBatteries.reduce((sum, b) => sum + parseInt(b.health), 0) / selectedBatteries.length).toFixed(1)
      : "0";
    return {
      selected: selectedBatteries.length,
      capacity: `${totalCap.toFixed(1)} kWh`,
      health: `${avgHealth}%`,
      healthy: selectedBatteries.filter(b => b.status === "Healthy").length,
      charging: selectedBatteries.filter(b => b.status === "Charging").length,
      low: selectedBatteries.filter(b => b.status === "Low").length,
      inactive: 0
    };
  }, [selectedBatteries]);

  // Toggle checks
  const toggleUserCheck = (id: string) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, checked: !u.checked } : u));
  };
  const toggleVehicleCheck = (id: string) => {
    setVehicles(p => p.map(v => v.id === id ? { ...v, checked: !v.checked } : v));
  };
  const toggleBatteryCheck = (id: string) => {
    setBatteries(p => p.map(b => b.id === id ? { ...b, checked: !b.checked } : b));
  };

  // Clear selections
  const clearAllUsers = () => {
    setUsers(p => p.map(u => ({ ...u, checked: false })));
  };
  const clearAllVehicles = () => {
    setVehicles(p => p.map(v => ({ ...v, checked: false })));
  };
  const clearAllBatteries = () => {
    setBatteries(p => p.map(b => ({ ...b, checked: false })));
  };

  // Navigation handlers
  const handleNext = () => {
    if (step === 1) {
      if (selectedZoneId) setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setShowSuccessModal(true);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel the zone assignment process?")) {
      setSelectedZoneId("");
      setStep(0);
    }
  };

  const handleConfirmAssignment = async () => {
    const originallyAssignedVehicles = rawVehicles.filter(v => v.zone === selectedZoneId);
    const originallyAssignedUsers = rawUsers.filter(u => u.zone === selectedZoneId);
    const originallyAssignedBatteries = rawBatteries.filter(b => b.zone === selectedZoneId);

    const selectedVehicles = vehicles.filter(v => v.checked);
    const selectedUsers = users.filter(u => u.checked);
    const selectedBatteries = batteries.filter(b => b.checked);

    const unassignedVehicles = originallyAssignedVehicles.filter(ov => {
      const currentLoc = vehicles.find(v => v.id === ov.id);
      return currentLoc && !currentLoc.checked;
    });
    const unassignedUsers = originallyAssignedUsers.filter(ou => {
      const currentLoc = users.find(u => u.id === ou.id);
      return currentLoc && !currentLoc.checked;
    });
    const unassignedBatteries = originallyAssignedBatteries.filter(ob => {
      const currentLoc = batteries.find(b => b.id === ob.id);
      return currentLoc && !currentLoc.checked;
    });

    try {
      if (selectedVehicles.length > 0) {
        await Promise.all(selectedVehicles.map(v => 
          api.patch(`/vehicles/${v.id}/zone`, { zone: selectedZoneId })
        ));
      }
      if (selectedUsers.length > 0) {
        await Promise.all(selectedUsers.map(u => {
          const rawUser = rawUsers.find(ru => ru.id === u.id);
          const currentZones = (rawUser?.zone || '').split(',').map((z: string) => z.trim()).filter(Boolean);
          if (!currentZones.includes(selectedZoneId)) {
            currentZones.push(selectedZoneId);
          }
          const updatedZoneStr = currentZones.filter((z: string) => z !== 'Unassigned').join(', ') || selectedZoneId;
          return api.patch(`/users/${u.id}/zone`, { zone: updatedZoneStr });
        }));
      }
      if (selectedBatteries.length > 0) {
        await Promise.all(selectedBatteries.map(b => 
          api.patch(`/batteries/${b.id}/zone`, { zone: selectedZoneId })
        ));
      }

      if (unassignedVehicles.length > 0) {
        await Promise.all(unassignedVehicles.map(v => 
          api.patch(`/vehicles/${v.id}/zone`, { zone: 'Unassigned' })
        ));
      }
      if (unassignedUsers.length > 0) {
        await Promise.all(unassignedUsers.map(u => {
          const rawUser = rawUsers.find(ru => ru.id === u.id);
          const currentZones = (rawUser?.zone || '').split(',').map((z: string) => z.trim()).filter(Boolean);
          const remainingZones = currentZones.filter((z: string) => z !== selectedZoneId && z !== 'Unassigned');
          const updatedZoneStr = remainingZones.join(', ') || 'Unassigned';
          return api.patch(`/users/${u.id}/zone`, { zone: updatedZoneStr });
        }));
      }
      if (unassignedBatteries.length > 0) {
        await Promise.all(unassignedBatteries.map(b => 
          api.patch(`/batteries/${b.id}/zone`, { zone: 'Unassigned' })
        ));
      }

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setSelectedZoneId("");
        setStep(0);
        fetchData();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      alert('Failed to assign resources to zone: ' + (err.message || err));
    }
  };

  return (
    <div className="za-shell">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Sidebar activePath="/zones" />

      <div className="za-main">
        <TopBar
          notificationCount={3}
          hideZone={false}
        />

        <div className="za-body za-page">
          {/* Breadcrumbs */}
          <div className="za-bc">
            <span className="za-bc-link" style={{ cursor: 'pointer' }} onClick={() => router.push('/zones')}>Zone Management</span>
            <span className="za-bc-sep">&gt;</span>
            <span className="za-bc-link" style={{ cursor: 'pointer' }} onClick={() => setStep(0)}>Assign Zone</span>
            {step > 0 && (
              <>
                <span className="za-bc-sep">&gt;</span>
                <span className="za-bc-cur">
                  {step === 1 ? "Select Zone" : step === 2 ? "Assign Resources" : "Review & Confirm"}
                </span>
              </>
            )}
          </div>

          {/* Title and Header Actions Row */}
          <div className="za-header-row">
            <div>
              <h1 className="za-h1">{step === 0 ? "Zone Assign Overview" : step === 1 ? "Select Zone" : "Assign Zone"}</h1>
              <p className="za-sub">
                {step === 0 
                  ? "View and manage all the resources assigned to zones." 
                  : `Zone Management > Assign Zone ${step === 1 ? "> Select Zone" : ""}`}
              </p>
            </div>
            {step === 0 ? (
              <button className="za-btn" onClick={() => setStep(1)} style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>
                + Assign Resources
              </button>
            ) : (
              <div className="za-btn-group">
                <button className="za-btn za-btn-outline" onClick={handleCancel}>Cancel</button>
                {step === 1 && (
                  <button
                    className={`za-btn ${selectedZoneId ? 'za-btn-primary' : 'za-btn-disabled'}`}
                    onClick={handleNext}
                    disabled={!selectedZoneId}
                  >
                    Next: Assign Resources &gt;
                  </button>
                )}
                {step === 2 && (
                  <button className="za-btn za-btn-green" onClick={handleNext}>
                    Next: Review & Confirm &gt;
                  </button>
                )}
                {step === 3 && (
                  <button className="za-btn za-btn-green" onClick={handleConfirmAssignment}>
                    Confirm & Assign &gt;
                  </button>
                )}
              </div>
            )}
          </div>

          {step === 0 ? (
            /* OVERVIEW DASHBOARD VIEW */
            <>
              {/* Stats overview cards row */}
              <div className="za-stats-row" style={{ marginTop: '8px' }}>
                <div className="za-stat-card">
                  <div className="za-stat-icon-wrapper" style={{ background: 'rgba(124, 58, 237, 0.08)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="za-stat-info">
                    <span className="za-stat-label">Total Zones</span>
                    <span className="za-stat-val">{zones.length}</span>
                    <span className="za-stat-sub">Active Zones</span>
                  </div>
                </div>

                <div className="za-stat-card">
                  <div className="za-stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" /><path d="M3 10h12v8M16 8h4l3 5v5" />
                    </svg>
                  </div>
                  <div className="za-stat-info">
                    <span className="za-stat-label">Vehicles Assigned</span>
                    <span className="za-stat-val">{totalStats.vehicles}</span>
                    <span className="za-stat-sub">Across {zones.length} Zones</span>
                  </div>
                </div>

                <div className="za-stat-card">
                  <div className="za-stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.08)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="13" x2="23" y2="11" />
                    </svg>
                  </div>
                  <div className="za-stat-info">
                    <span className="za-stat-label">Batteries Assigned</span>
                    <span className="za-stat-val">{totalStats.batteries}</span>
                    <span className="za-stat-sub">Across {zones.length} Zones</span>
                  </div>
                </div>

                <div className="za-stat-card">
                  <div className="za-stat-icon-wrapper" style={{ background: 'rgba(249, 115, 22, 0.08)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="za-stat-info">
                    <span className="za-stat-label">Users Assigned</span>
                    <span className="za-stat-val">{totalStats.users}</span>
                    <span className="za-stat-sub">Across {zones.length} Zones</span>
                  </div>
                </div>

                <div className="za-stat-card" style={{ background: 'rgba(59, 130, 246, 0.02)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                  <div className="za-stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.08)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="za-stat-info">
                    <span className="za-stat-label">Total Resources</span>
                    <span className="za-stat-val">{totalStats.total}</span>
                    <span className="za-stat-sub">All Resources</span>
                  </div>
                </div>
              </div>

              {/* Filters row */}
              <div className="za-overview-filters">
                <div className="za-search-wrapper">
                  <ISearch />
                  <input
                    type="text"
                    className="za-search-input"
                    placeholder="Search zone by name, code or area..."
                    value={overviewSearch}
                    onChange={(e) => setOverviewSearch(e.target.value)}
                  />
                </div>
                <select className="za-select-filter" value={overviewZoneType} onChange={e => setOverviewZoneType(e.target.value)}>
                  <option value="All">All Zone Types</option>
                  <option value="Operational">Operational Zone</option>
                  <option value="No Parking">No Parking Zone</option>
                </select>
                <select className="za-select-filter" value={overviewPriority} onChange={e => setOverviewPriority(e.target.value)}>
                  <option value="All">All Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <select className="za-select-filter" value={overviewStatus} onChange={e => setOverviewStatus(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <button className="za-btn-filter">
                  <IFilter /> Filter
                </button>
              </div>

              {/* Zones Resource Table */}
              <div className="za-card" style={{ padding: '0px', overflow: 'hidden' }}>
                <div className="za-table-container">
                  <table className="za-table">
                    <thead>
                      <tr>
                        <th>ZONE NAME</th>
                        <th>ZONE CODE</th>
                        <th>AREA</th>
                        <th>ZONE TYPE</th>
                        <th style={{ textAlign: 'center' }}>VEHICLES</th>
                        <th style={{ textAlign: 'center' }}>BATTERIES</th>
                        <th style={{ textAlign: 'center' }}>USERS</th>
                        <th>STATUS</th>
                        <th style={{ width: '80px', textAlign: 'center' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zones
                        .filter(z => {
                          const matchesSearch = z.id.toLowerCase().includes(overviewSearch.toLowerCase()) || z.code.toLowerCase().includes(overviewSearch.toLowerCase()) || z.area.toLowerCase().includes(overviewSearch.toLowerCase());
                          const matchesType = overviewZoneType === 'All' || z.type.toLowerCase().includes(overviewZoneType.toLowerCase());
                          const matchesStatus = overviewStatus === 'All' || z.status.toLowerCase() === overviewStatus.toLowerCase();
                          return matchesSearch && matchesType && matchesStatus;
                        })
                        .map(z => (
                          <tr key={z.id}>
                            <td style={{ fontWeight: 700, color: '#0F172A' }}>{z.id}</td>
                            <td style={{ fontWeight: 600, color: '#475569' }}>{z.code}</td>
                            <td style={{ color: '#475569', fontSize: '12px' }}>{z.area}</td>
                            <td>
                              <span className="za-badge za-badge-cyan" style={{ fontSize: '11px', fontWeight: 600 }}>{z.type}</span>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: '#ef4444' }}>{z.vehicles}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: '#22c55e' }}>{z.batteries}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: '#2A195C' }}>{z.users}</td>
                            <td>
                              <span className={`za-badge ${z.status === 'Active' ? 'za-badge-green' : 'za-badge-red'}`} style={{ fontSize: '11px', fontWeight: 700 }}>
                                {z.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <button
                                  onClick={() => {
                                    setViewingZoneResources(z);
                                    setViewModalTab('users');
                                  }}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: '#64748B',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = '#10B981')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
                                  title="View Allocated Resources"
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedZoneId(z.id);
                                    setStep(1);
                                  }}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: '#64748B',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = '#2A195C')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
                                  title="Edit Zone Resources"
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteZoneResources(z.id)}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: '#64748B',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
                                  title="Unassign All Resources"
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic Charts Grid Rendered Below Table */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
                <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Zone Resource Distribution</h3>
                      <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>Allocated vehicles, swappable batteries & active users across zones</p>
                    </div>
                  </div>
                  <div style={{ height: '280px', width: '100%', position: 'relative' }}>
                    <Bar
                      data={{
                        labels: zones.slice(0, 7).map(z => z.id.replace(/ Zone| Vadodara/gi, '')),
                        datasets: [
                          {
                            label: 'Vehicles',
                            data: zones.slice(0, 7).map(z => z.vehicles),
                            backgroundColor: '#3B82F6',
                            borderRadius: 6,
                            barPercentage: 0.6,
                            categoryPercentage: 0.7
                          },
                          {
                            label: 'Batteries',
                            data: zones.slice(0, 7).map(z => z.batteries),
                            backgroundColor: '#10B981',
                            borderRadius: 6,
                            barPercentage: 0.6,
                            categoryPercentage: 0.7
                          },
                          {
                            label: 'Users',
                            data: zones.slice(0, 7).map(z => z.users),
                            backgroundColor: '#8B5CF6',
                            borderRadius: 6,
                            barPercentage: 0.6,
                            categoryPercentage: 0.7
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                            align: 'end' as const,
                            labels: {
                              font: { family: 'Inter', size: 12, weight: 'bold' as const },
                              usePointStyle: true,
                              boxWidth: 8,
                              padding: 16
                            }
                          },
                          tooltip: {
                            backgroundColor: '#0F172A',
                            titleFont: { family: 'Inter', size: 12, weight: 'bold' as const },
                            bodyFont: { family: 'Inter', size: 12 },
                            padding: 10,
                            cornerRadius: 8
                          }
                        },
                        scales: {
                          x: {
                            grid: { display: false },
                            ticks: { font: { family: 'Inter', size: 11, weight: 'bold' as const }, color: '#64748B' }
                          },
                          y: {
                            beginAtZero: true,
                            grid: { color: '#F1F5F9' },
                            ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8' }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Resource Summary</h3>
                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>Overall inventory proportion</p>
                  </div>
                  <div style={{ height: '190px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Doughnut
                      data={{
                        labels: ['Vehicles', 'Batteries', 'Users'],
                        datasets: [
                          {
                            data: [totalStats.vehicles || 1, totalStats.batteries || 1, totalStats.users || 1],
                            backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6'],
                            borderWidth: 3,
                            borderColor: '#FFFFFF'
                          }
                        ]
                      }}
                      options={{
                        cutout: '72%',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: '#0F172A',
                            padding: 10,
                            cornerRadius: 8
                          }
                        }
                      }}
                    />
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                      <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{totalStats.total}</span>
                      <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, marginTop: '3px' }}>TOTAL ASSETS</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 10px', background: '#EFF6FF', borderRadius: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#1E40AF' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span>
                        Vehicles
                      </span>
                      <span style={{ fontWeight: 800, color: '#1E40AF' }}>{totalStats.vehicles} ({totalStats.vehPct?.toFixed(1) || 0}%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 10px', background: '#ECFDF5', borderRadius: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#065F46' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                        Batteries
                      </span>
                      <span style={{ fontWeight: 800, color: '#065F46' }}>{totalStats.batteries} ({totalStats.batPct?.toFixed(1) || 0}%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 10px', background: '#F5F3FF', borderRadius: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#5B21B6' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }}></span>
                        Users
                      </span>
                      <span style={{ fontWeight: 800, color: '#5B21B6' }}>{totalStats.users} ({totalStats.usrPct?.toFixed(1) || 0}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ORIGINAL WIZARD VIEW */
            <>
              {/* Custom Stepper Header matching Mockup */}
              <div className="za-stepper">
            {/* Step 1 Card */}
            <div className={`za-step-card ${step === 1 ? 'active' : 'inactive'}`} onClick={() => setStep(1)} style={{ cursor: 'pointer' }}>
              <div className={`za-step-circle ${step > 1 ? 'completed' : (step === 1 ? 'active' : 'inactive')}`}>
                {step > 1 ? <ICheck /> : "1"}
              </div>
              <div className="za-step-info">
                <span className="za-step-title">Select Zone</span>
                <span className="za-step-desc">{step > 1 ? "Zone selected" : "Choose the zone to assign resources"}</span>
              </div>
            </div>

            <div className={`za-step-line ${step > 1 ? 'active' : ''}`} />

            {/* Step 2 Card */}
            <div className={`za-step-card ${step === 2 ? 'active' : 'inactive'}`} onClick={() => { if (selectedZoneId) setStep(2); }} style={{ cursor: selectedZoneId ? 'pointer' : 'not-allowed' }}>
              <div className={`za-step-circle ${step > 2 ? 'completed' : (step === 2 ? 'active' : 'inactive')}`}>
                {step > 2 ? <ICheck /> : "2"}
              </div>
              <div className="za-step-info">
                <span className="za-step-title">Assign To</span>
                <span className="za-step-desc">Assign users, vehicles & batteries</span>
              </div>
            </div>

            <div className={`za-step-line ${step > 2 ? 'active' : ''}`} />

            {/* Step 3 Card */}
            <div className={`za-step-card ${step === 3 ? 'active' : 'inactive'}`}>
              <div className={`za-step-circle ${step === 3 ? 'active' : 'inactive'}`}>
                3
              </div>
              <div className="za-step-info">
                <span className="za-step-title">Review & Confirm</span>
                <span className="za-step-desc">Review and confirm assignment</span>
              </div>
            </div>
          </div>

          {/* STEP 1 Layout */}
          {step === 1 && (
            <div className="za-grid">
              {/* Left Card: Available Zones Table */}
              <div className="za-card">
                <h2 className="za-card-title">Available Zones</h2>
                <p className="za-card-sub">Select the zone where you want to assign users, vehicles and batteries.</p>

                {/* Table search controls */}
                <div className="za-table-ctrls">
                  <div className="za-search-wrap">
                    <span style={{ color: '#94A3B8' }}><ISearch /></span>
                    <input
                      type="text"
                      className="za-search-inp"
                      placeholder="Search zone by name, code or area..."
                      value={zoneSearch}
                      onChange={(e) => setZoneSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="za-filter-btn"><IFilter /></button>
                    <button className="za-dropdown-btn" onClick={() => setZoneSort(p => p === 'A-Z' ? 'Z-A' : 'A-Z')}>
                      Sort by: Zone Name ({zoneSort === 'A-Z' ? 'A-Z' : 'Z-A'}) <IChevD />
                    </button>
                  </div>
                </div>

                {/* Table list */}
                <div className="za-table-container">
                  <table className="za-table">
                    <thead>
                      <tr>
                        <th style={{ width: '48px' }}></th>
                        <th>Zone Name</th>
                        <th>Zone Code</th>
                        <th>Area</th>
                        <th>Zone Type</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Total Resources</th>
                        <th style={{ width: '48px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredZones.map(zone => {
                        const isSelected = selectedZoneId === zone.id;
                        return (
                          <tr
                            key={zone.id}
                            className={`za-row-clickable ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedZoneId(zone.id)}
                          >
                            <td>
                              <div className={`za-radio-circle ${isSelected ? 'active' : ''}`}>
                                {isSelected && <div className="za-radio-dot" />}
                              </div>
                            </td>
                            <td style={{ fontWeight: 700, color: '#0F172A' }}>{zone.id}</td>
                            <td style={{ fontWeight: 600, color: '#475569' }}>{zone.code}</td>
                            <td style={{ fontWeight: 600, color: '#0F172A' }}>{zone.area}</td>
                            <td>
                              <span className="za-badge za-badge-green">{zone.type}</span>
                            </td>
                            <td>
                              <span className={`za-badge ${zone.priority === 'High' ? 'za-badge-red' :
                                  (zone.priority === 'Medium' ? 'za-badge-orange' : 'za-badge-blue')
                                }`}>
                                {zone.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`za-badge ${zone.status === 'Active' ? 'za-badge-green' : 'za-badge-red'}`}>
                                {zone.status}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700, color: '#2A195C', textAlign: 'center' }}>{zone.totalResources}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteZoneRow(zone.id);
                                }}
                                title="Delete Zone"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="za-pagination">
                  <span>Showing 1 to {filteredZones.length} of {zones.length} zones</span>
                  <div className="za-pag-btns">
                    <button className="za-pag-btn">&lt;</button>
                    <button className="za-pag-btn active">1</button>
                    <button className="za-pag-btn">2</button>
                    <button className="za-pag-btn">3</button>
                    <button className="za-pag-btn">&gt;</button>
                  </div>
                </div>
              </div>

              {/* Right Card: Zone Details */}
              <div className="za-detail-box">
                <div className="za-detail-hdr">
                  <div className="za-detail-icon-box"><IPin /></div>
                  <h2 className="za-detail-hdr-title">Zone Details</h2>
                </div>

                <div className="za-detail-list">
                  <div className="za-detail-item">
                    <span className="za-detail-label">Zone Name</span>
                    <span className="za-detail-val">{selectedZone.id}</span>
                  </div>
                  <div className="za-detail-item">
                    <span className="za-detail-label">Zone Code</span>
                    <span className="za-detail-val">{selectedZone.code}</span>
                  </div>
                  <div className="za-detail-item">
                    <span className="za-detail-label">Zone Type</span>
                    <span className="za-detail-val">{selectedZone.type} Zone</span>
                  </div>
                  <div className="za-detail-item">
                    <span className="za-detail-label">Area</span>
                    <span className="za-detail-val">{selectedZone.area}</span>
                  </div>
                  <div className="za-detail-item">
                    <span className="za-detail-label">Priority</span>
                    <span className="za-detail-val">{selectedZone.priority}</span>
                  </div>
                  <div className="za-detail-item">
                    <span className="za-detail-label">Time Zone</span>
                    <span className="za-detail-val">(GMT+05:30) Asia/Kolkata</span>
                  </div>
                  <div className="za-detail-item">
                    <span className="za-detail-label">Description</span>
                    <span className="za-detail-val" style={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}>{selectedZone.description}</span>
                  </div>
                </div>

                <div className="za-divider" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="za-detail-label">Effective From</span>
                    <span className="za-detail-val" style={{ fontSize: '12.5px' }}>{selectedZone.effectiveFrom}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="za-detail-label">Status</span>
                    <span className={`za-badge ${selectedZone.status === 'Active' ? 'za-badge-green' : 'za-badge-red'}`}>{selectedZone.status}</span>
                  </div>
                </div>

                <div className="za-divider" />

                <div className="za-summary-box">
                  <h3 className="za-summary-title">Total Resources</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="za-summary-row za-summary-row-bold">
                      <span>Total Resources</span>
                      <span>{selectedZone.totalResources}</span>
                    </div>
                    <div className="za-summary-row">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IUser /> Users</span>
                      <span>12</span>
                    </div>
                    <div className="za-summary-row">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IScooter /> Vehicles</span>
                      <span>7</span>
                    </div>
                    <div className="za-summary-row">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IBattery /> Batteries</span>
                      <span>4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 Layout */}
          {step === 2 && (
            <div className="za-grid">
              {/* Left Card: Resources Manager */}
              <div className="za-card">
                <h2 className="za-card-title">Assign Resources</h2>
                <p className="za-card-sub">Assign users, vehicles and batteries to the selected zone.</p>

                {/* Resource tab selectors */}
                <div className="za-tabs">
                  <button
                    className={`za-tab-btn ${selectedTab === 'users' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('users')}
                  >
                    Users ({users.length})
                  </button>
                  <button
                    className={`za-tab-btn ${selectedTab === 'vehicles' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('vehicles')}
                  >
                    Vehicles ({vehicles.length})
                  </button>
                  <button
                    className={`za-tab-btn ${selectedTab === 'batteries' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('batteries')}
                  >
                    Batteries ({batteries.length})
                  </button>
                </div>

                {/* USER TAB CONTENT */}
                {selectedTab === 'users' && (
                  <div>
                    <div className="za-table-ctrls">
                      <div className="za-search-wrap">
                        <span style={{ color: '#94A3B8' }}><ISearch /></span>
                        <input
                          type="text"
                          className="za-search-inp"
                          placeholder="Search users by name, email or phone..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="za-filter-btn"><IFilter /></button>
                        <button className="za-dropdown-btn">Bulk Assign <IChevD /></button>
                        <button className="za-btn za-btn-primary" style={{ height: '40px', borderRadius: '10px' }}>+ Add User</button>
                      </div>
                    </div>

                    <div className="za-table-container">
                      <table className="za-table">
                        <thead>
                          <tr>
                            <th style={{ width: '48px' }}>
                              <div 
                                className={`za-checkbox ${filteredUsers.length > 0 && filteredUsers.every(u => u.checked) ? 'active' : ''}`}
                                onClick={handleSelectAllUsers}
                                style={{ cursor: 'pointer' }}
                              >
                                {filteredUsers.length > 0 && filteredUsers.every(u => u.checked) && <ICheck />}
                              </div>
                            </th>
                            <th>User</th>
                            <th>Role</th>
                            <th>Email / Phone</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Last Active</th>
                            <th style={{ width: '32px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map(user => (
                            <tr key={user.id} className={user.checked ? 'selected' : ''}>
                              <td>
                                <div
                                  className={`za-checkbox ${user.checked ? 'active' : ''}`}
                                  onClick={() => toggleUserCheck(user.id)}
                                >
                                  {user.checked && <ICheck />}
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div className="za-user-av">{user.initials}</div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{user.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`za-badge ${user.role.includes('Supervisor') ? 'za-badge-green' :
                                    (user.role.includes('Staff') ? 'za-badge-cyan' : 'za-badge-purple')
                                  }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td style={{ fontWeight: 500, color: '#475569' }}>
                                <div>{user.email}</div>
                                <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>{user.phone}</div>
                              </td>
                              <td style={{ fontWeight: 600, color: '#0F172A' }}>{user.department}</td>
                              <td>
                                <span className={`za-badge ${user.status === 'Active' ? 'za-badge-green' : 'za-badge-red'}`}>
                                  {user.status}
                                </span>
                              </td>
                              <td style={{ fontWeight: 500, color: '#64748B' }}>{user.lastActive}</td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUserRow(user.id);
                                  }}
                                  title="Delete User"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* VEHICLES TAB CONTENT */}
                {selectedTab === 'vehicles' && (
                  <div>
                    <div className="za-table-ctrls">
                      <div className="za-search-wrap">
                        <span style={{ color: '#94A3B8' }}><ISearch /></span>
                        <input
                          type="text"
                          className="za-search-inp"
                          placeholder="Search by vehicle number or name..."
                          value={vehicleSearch}
                          onChange={(e) => setVehicleSearch(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="za-filter-btn"><IFilter /></button>
                        <button className="za-dropdown-btn">Bulk Assign <IChevD /></button>
                        <button className="za-btn za-btn-primary" style={{ height: '40px', borderRadius: '10px' }}>+ Add Vehicle</button>
                      </div>
                    </div>

                    <div className="za-table-container">
                      <table className="za-table">
                        <thead>
                          <tr>
                            <th style={{ width: '48px' }}>
                              <div 
                                className={`za-checkbox ${filteredVehicles.length > 0 && filteredVehicles.every(v => v.checked) ? 'active' : ''}`}
                                onClick={handleSelectAllVehicles}
                                style={{ cursor: 'pointer' }}
                              >
                                {filteredVehicles.length > 0 && filteredVehicles.every(v => v.checked) && <ICheck />}
                              </div>
                            </th>
                            <th>Vehicle</th>
                            <th>Vehicle Number</th>
                            <th>Model</th>
                            <th>Status</th>
                            <th>Last Active</th>
                            <th style={{ width: '32px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredVehicles.map(v => (
                            <tr key={v.id} className={v.checked ? 'selected' : ''}>
                              <td>
                                <div
                                  className={`za-checkbox ${v.checked ? 'active' : ''}`}
                                  onClick={() => toggleVehicleCheck(v.id)}
                                >
                                  {v.checked && <ICheck />}
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ color: '#4F46E5' }}><IScooter /></div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{v.model}</div>
                                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>{v.number}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontWeight: 700, color: '#1E293B' }}>{v.number}</td>
                              <td style={{ fontWeight: 600, color: '#475569' }}>{v.model}</td>
                              <td>
                                <span className={`za-badge ${v.status === 'Active' ? 'za-badge-green' : 'za-badge-red'}`}>
                                  {v.status}
                                </span>
                              </td>
                              <td style={{ fontWeight: 500, color: '#64748B' }}>{v.lastActive}</td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteVehicleRow(v.id);
                                  }}
                                  title="Delete Vehicle"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* BATTERIES TAB CONTENT */}
                {selectedTab === 'batteries' && (
                  <div>
                    <div className="za-table-ctrls">
                      <div className="za-search-wrap">
                        <span style={{ color: '#94A3B8' }}><ISearch /></span>
                        <input
                          type="text"
                          className="za-search-inp"
                          placeholder="Search batteries by ID or serial number..."
                          value={batterySearch}
                          onChange={(e) => setBatterySearch(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="za-filter-btn"><IFilter /></button>
                        <button className="za-dropdown-btn">Bulk Assign <IChevD /></button>
                        <button className="za-btn za-btn-primary" style={{ height: '40px', borderRadius: '10px' }}>+ Add Battery</button>
                      </div>
                    </div>

                    <div className="za-table-container">
                      <table className="za-table">
                        <thead>
                          <tr>
                            <th style={{ width: '48px' }}>
                              <div 
                                className={`za-checkbox ${filteredBatteries.length > 0 && filteredBatteries.every(b => b.checked) ? 'active' : ''}`}
                                onClick={handleSelectAllBatteries}
                                style={{ cursor: 'pointer' }}
                              >
                                {filteredBatteries.length > 0 && filteredBatteries.every(b => b.checked) && <ICheck />}
                              </div>
                            </th>
                            <th>Battery ID</th>
                            <th>Serial No.</th>
                            <th>Capacity</th>
                            <th>Health</th>
                            <th>Status</th>
                            <th>Last Active</th>
                            <th style={{ width: '32px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBatteries.map(b => (
                            <tr key={b.id} className={b.checked ? 'selected' : ''}>
                              <td>
                                <div
                                  className={`za-checkbox ${b.checked ? 'active' : ''}`}
                                  onClick={() => toggleBatteryCheck(b.id)}
                                >
                                  {b.checked && <ICheck />}
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ color: '#10B981' }}><IBattery /></div>
                                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{b.id}</div>
                                </div>
                              </td>
                              <td style={{ fontWeight: 600, color: '#475569' }}>{b.serial}</td>
                              <td style={{ fontWeight: 700, color: '#1E293B' }}>{b.capacity}</td>
                              <td>
                                <span className={`za-badge ${parseInt(b.health) >= 90 ? 'za-badge-green' :
                                    (parseInt(b.health) >= 40 ? 'za-badge-orange' : 'za-badge-red')
                                  }`}>
                                  {b.health}
                                </span>
                              </td>
                              <td>
                                <span className={`za-badge ${b.status === 'Healthy' ? 'za-badge-green' :
                                    (b.status === 'Charging' ? 'za-badge-blue' : 'za-badge-red')
                                  }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td style={{ fontWeight: 500, color: '#64748B' }}>{b.lastActive}</td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBatteryRow(b.id);
                                  }}
                                  title="Delete Battery"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pagination (dynamic counts) */}
                <div className="za-pagination">
                  <span>
                    Showing 1 to {
                      selectedTab === 'users' ? filteredUsers.length :
                        (selectedTab === 'vehicles' ? filteredVehicles.length : filteredBatteries.length)
                    } of {
                      selectedTab === 'users' ? users.length :
                        (selectedTab === 'vehicles' ? vehicles.length : batteries.length)
                    } items
                  </span>
                  <div className="za-pag-btns">
                    <button className="za-pag-btn">&lt;</button>
                    <button className="za-pag-btn active">1</button>
                    <button className="za-pag-btn">2</button>
                    <button className="za-pag-btn">&gt;</button>
                  </div>
                </div>

                {/* Bottom Selected Chips List (Mockup 3 Feature) */}
                {selectedTab === 'batteries' && selectedBatteries.length > 0 && (
                  <div className="za-chips-row">
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Selected Batteries {selectedBatteries.length}</span>
                    {selectedBatteries.map(b => (
                      <div key={b.id} className="za-chip">
                        <span>{b.id}</span>
                        <button className="za-chip-close" onClick={() => toggleBatteryCheck(b.id)}><IClose /></button>
                      </div>
                    ))}
                    <button className="za-selected-clear" onClick={clearAllBatteries}>Clear All</button>
                  </div>
                )}
              </div>

              {/* Right Panel: Selected Resource list & Summary */}
              <div className="za-detail-box">
                {/* Users List Sidebar */}
                {selectedTab === 'users' && (
                  <div>
                    <div className="za-selected-hdr">
                      <h2 className="za-selected-title">Selected Users ({selectedUsers.length})</h2>
                      {selectedUsers.length > 0 && (
                        <button className="za-selected-clear" onClick={clearAllUsers}>
                          <ITrash /> Clear All
                        </button>
                      )}
                    </div>

                    <div className="za-selected-list">
                      {selectedUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8', fontSize: '12px', fontWeight: 500 }}>No users selected</div>
                      ) : (
                        selectedUsers.map(user => (
                          <div key={user.id} className="za-selected-card">
                            <div className="za-selected-card-info">
                              <div className="za-user-av" style={{ width: '28px', height: '28px', fontSize: '10px' }}>{user.initials}</div>
                              <div style={{ minWidth: 0 }}>
                                <div className="za-selected-card-name">{user.name}</div>
                                <div className="za-selected-card-desc">{user.role}</div>
                              </div>
                            </div>
                            <button className="za-selected-card-del" onClick={() => toggleUserCheck(user.id)}><IClose /></button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="za-summary-box">
                      <h3 className="za-summary-title">User Summary</h3>
                      <div className="za-summary-grid">
                        <div className="za-summary-row za-summary-row-bold">
                          <span>Total Selected</span>
                          <span>{userSummary.selected}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Zone Employees</span>
                          <span>{userSummary.employees}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Zone Supervisors</span>
                          <span>{userSummary.supervisors}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Support Staff</span>
                          <span>{userSummary.staff}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Active Users</span>
                          <span>{userSummary.active}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Inactive Users</span>
                          <span>{userSummary.inactive}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vehicles List Sidebar */}
                {selectedTab === 'vehicles' && (
                  <div>
                    <div className="za-selected-hdr">
                      <h2 className="za-selected-title">Selected Vehicles ({selectedVehicles.length})</h2>
                      {selectedVehicles.length > 0 && (
                        <button className="za-selected-clear" onClick={clearAllVehicles}>
                          <ITrash /> Clear All
                        </button>
                      )}
                    </div>

                    <div className="za-selected-list">
                      {selectedVehicles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8', fontSize: '12px', fontWeight: 500 }}>No vehicles selected</div>
                      ) : (
                        selectedVehicles.map(v => (
                          <div key={v.id} className="za-selected-card">
                            <div className="za-selected-card-info">
                              <div className="za-selected-card-icon" style={{ color: '#4F46E5' }}><IScooter /></div>
                              <div style={{ minWidth: 0 }}>
                                <div className="za-selected-card-name">{v.model}</div>
                                <div className="za-selected-card-desc">{v.number}</div>
                              </div>
                            </div>
                            <button className="za-selected-card-del" onClick={() => toggleVehicleCheck(v.id)}><IClose /></button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="za-summary-box">
                      <h3 className="za-summary-title">Vehicle Summary</h3>
                      <div className="za-summary-grid">
                        <div className="za-summary-row za-summary-row-bold">
                          <span>Total Selected</span>
                          <span>{vehicleSummary.selected}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Mink</span>
                          <span>{vehicleSummary.mink}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>City</span>
                          <span>{vehicleSummary.city}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>King</span>
                          <span>{vehicleSummary.king}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Active Vehicles</span>
                          <span>{vehicleSummary.active}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Inactive Vehicles</span>
                          <span>{vehicleSummary.inactive}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Batteries List Sidebar */}
                {selectedTab === 'batteries' && (
                  <div>
                    <div className="za-selected-hdr">
                      <h2 className="za-selected-title">Selected Batteries ({selectedBatteries.length})</h2>
                      {selectedBatteries.length > 0 && (
                        <button className="za-selected-clear" onClick={clearAllBatteries}>
                          <ITrash /> Clear All
                        </button>
                      )}
                    </div>

                    <div className="za-selected-list">
                      {selectedBatteries.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8', fontSize: '12px', fontWeight: 500 }}>No batteries selected</div>
                      ) : (
                        selectedBatteries.map(b => (
                          <div key={b.id} className="za-selected-card">
                            <div className="za-selected-card-info">
                              <div className="za-selected-card-icon" style={{ color: '#10B981' }}><IBattery /></div>
                              <div style={{ minWidth: 0 }}>
                                <div className="za-selected-card-name">{b.id}</div>
                                <div className="za-selected-card-desc">{b.health} Health</div>
                              </div>
                            </div>
                            <button className="za-selected-card-del" onClick={() => toggleBatteryCheck(b.id)}><IClose /></button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="za-summary-box">
                      <h3 className="za-summary-title">Battery Summary</h3>
                      <div className="za-summary-grid">
                        <div className="za-summary-row za-summary-row-bold">
                          <span>Total Selected</span>
                          <span>{batterySummary.selected}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Total Capacity</span>
                          <span>{batterySummary.capacity}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Average Health</span>
                          <span>{batterySummary.health}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Healthy</span>
                          <span>{batterySummary.healthy}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Charging</span>
                          <span>{batterySummary.charging}</span>
                        </div>
                        <div className="za-summary-row">
                          <span>Low Status</span>
                          <span>{batterySummary.low}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 Layout: Review & Confirm */}
          {step === 3 && (
            <div className="za-grid">
              {/* Left Side: Summary overview details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="za-card">
                  <h2 className="za-card-title">Zone Overview</h2>
                  <p className="za-card-sub" style={{ marginBottom: '14px' }}>Detailed parameters of the target zone.</p>

                  <div className="za-overview-box">
                    <div className="za-detail-icon-box" style={{ height: '42px', width: '42px', borderRadius: '12px' }}><IPin /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{selectedZone.id}</h3>
                        <span className="za-badge za-badge-green" style={{ fontSize: '10px' }}>{selectedZone.type} Zone</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>New Delhi, Delhi, India</span>

                      <div className="za-overview-grid">
                        <div className="za-detail-item">
                          <span className="za-detail-label">Zone Code</span>
                          <span className="za-detail-val">{selectedZone.code}</span>
                        </div>
                        <div className="za-detail-item">
                          <span className="za-detail-label">Zone Priority</span>
                          <span className="za-detail-val">{selectedZone.priority}</span>
                        </div>
                        <div className="za-detail-item">
                          <span className="za-detail-label">Zone Area</span>
                          <span className="za-detail-val">{selectedZone.area}</span>
                        </div>
                        <div className="za-detail-item">
                          <span className="za-detail-label">Time Zone</span>
                          <span className="za-detail-val" style={{ fontSize: '11px' }}>(GMT+05:30) Asia/Kolkata</span>
                        </div>
                        <div className="za-detail-item" style={{ gridColumn: 'span 2' }}>
                          <span className="za-detail-label">Description</span>
                          <span className="za-detail-val" style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>{selectedZone.description}</span>
                        </div>
                        <div className="za-detail-item">
                          <span className="za-detail-label">Effective From</span>
                          <span className="za-detail-val">{selectedZone.effectiveFrom}</span>
                        </div>
                        <div className="za-detail-item">
                          <span className="za-detail-label">Status</span>
                          <span className={`za-badge ${selectedZone.status === 'Active' ? 'za-badge-green' : 'za-badge-red'}`} style={{ width: 'fit-content' }}>{selectedZone.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="za-card">
                  {/* Tabs row for step 3 details view */}
                  <div className="za-tabs" style={{ marginBottom: '16px' }}>
                    <button
                      className={`za-tab-btn ${selectedTab === 'users' ? 'active' : ''}`}
                      onClick={() => setSelectedTab('users')}
                    >
                      Users ({selectedUsers.length})
                    </button>
                    <button
                      className={`za-tab-btn ${selectedTab === 'vehicles' ? 'active' : ''}`}
                      onClick={() => setSelectedTab('vehicles')}
                    >
                      Vehicles ({selectedVehicles.length})
                    </button>
                    <button
                      className={`za-tab-btn ${selectedTab === 'batteries' ? 'active' : ''}`}
                      onClick={() => setSelectedTab('batteries')}
                    >
                      Batteries ({selectedBatteries.length})
                    </button>
                  </div>

                  {/* Users selected to assign */}
                  {selectedTab === 'users' && (
                    <div>
                      <h3 className="za-card-title" style={{ fontSize: '14px', marginBottom: '14px' }}>Users to be Assigned</h3>
                      <div className="za-table-container">
                        <table className="za-table">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Role</th>
                              <th>Email / Phone</th>
                              <th>Department</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUsers.map(user => (
                              <tr key={user.id}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="za-user-av">{user.initials}</div>
                                    <div>
                                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{user.name}</div>
                                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className={`za-badge ${user.role.includes('Supervisor') ? 'za-badge-green' :
                                      (user.role.includes('Staff') ? 'za-badge-cyan' : 'za-badge-purple')
                                    }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 500, color: '#475569' }}>
                                  <div>{user.email}</div>
                                  <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>{user.phone}</div>
                                </td>
                                <td style={{ fontWeight: 600, color: '#0F172A' }}>{user.department}</td>
                                <td>
                                  <span className={`za-badge ${user.status === 'Active' ? 'za-badge-green' : 'za-badge-red'}`}>
                                    {user.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="za-alert-banner">
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>ⓘ</span>
                        <span>{selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} will be assigned to this zone.</span>
                      </div>
                    </div>
                  )}

                  {/* Vehicles selected to assign */}
                  {selectedTab === 'vehicles' && (
                    <div>
                      <h3 className="za-card-title" style={{ fontSize: '14px', marginBottom: '14px' }}>Vehicles to be Assigned</h3>
                      <div className="za-table-container">
                        <table className="za-table">
                          <thead>
                            <tr>
                              <th>Vehicle</th>
                              <th>Vehicle Number</th>
                              <th>Model</th>
                              <th>Status</th>
                              <th>Last Active</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedVehicles.map(v => (
                              <tr key={v.id}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ color: '#4F46E5' }}><IScooter /></div>
                                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{v.model}</div>
                                  </div>
                                </td>
                                <td style={{ fontWeight: 700, color: '#1E293B' }}>{v.number}</td>
                                <td style={{ fontWeight: 600, color: '#475569' }}>{v.model}</td>
                                <td>
                                  <span className={`za-badge ${v.status === 'Active' ? 'za-badge-green' : 'za-badge-red'}`}>
                                    {v.status}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 500, color: '#64748B' }}>{v.lastActive}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="za-alert-banner">
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>ⓘ</span>
                        <span>{selectedVehicles.length} vehicle{selectedVehicles.length > 1 ? 's' : ''} will be assigned to this zone.</span>
                      </div>
                    </div>
                  )}

                  {/* Batteries selected to assign */}
                  {selectedTab === 'batteries' && (
                    <div>
                      <h3 className="za-card-title" style={{ fontSize: '14px', marginBottom: '14px' }}>Batteries to be Assigned</h3>
                      <div className="za-table-container">
                        <table className="za-table">
                          <thead>
                            <tr>
                              <th>Battery ID</th>
                              <th>Serial No.</th>
                              <th>Capacity</th>
                              <th>Health</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedBatteries.map(b => (
                              <tr key={b.id}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ color: '#10B981' }}><IBattery /></div>
                                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{b.id}</div>
                                  </div>
                                </td>
                                <td style={{ fontWeight: 600, color: '#475569' }}>{b.serial}</td>
                                <td style={{ fontWeight: 700, color: '#1E293B' }}>{b.capacity}</td>
                                <td>
                                  <span className={`za-badge ${parseInt(b.health) >= 90 ? 'za-badge-green' :
                                      (parseInt(b.health) >= 40 ? 'za-badge-orange' : 'za-badge-red')
                                    }`}>
                                    {b.health}
                                  </span>
                                </td>
                                <td>
                                  <span className={`za-badge ${b.status === 'Healthy' ? 'za-badge-green' :
                                      (b.status === 'Charging' ? 'za-badge-blue' : 'za-badge-red')
                                    }`}>
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="za-alert-banner">
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>ⓘ</span>
                        <span>{selectedBatteries.length} battery packs will be assigned to this zone.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Step 3 Review Summaries */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Summary totals */}
                <div className="za-detail-box">
                  <div className="za-detail-hdr" style={{ marginBottom: '16px' }}>
                    <div className="za-detail-icon-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}><IResource /></div>
                    <h2 className="za-detail-hdr-title">Assignment Summary</h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 500 }}><IUser /> Users Assigned</span>
                      <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>{selectedUsers.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 500 }}><IScooter /> Vehicles Assigned</span>
                      <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>{selectedVehicles.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 500 }}><IBattery /> Batteries Assigned</span>
                      <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>{selectedBatteries.length}</span>
                    </div>

                    <div className="za-divider" style={{ margin: '10px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2A195C', fontWeight: 700 }}><IResource /> Total Resources</span>
                      <span style={{ fontWeight: 800, color: '#2A195C', fontSize: '16px' }}>
                        {selectedUsers.length + selectedVehicles.length + selectedBatteries.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Zone Parameters summary */}
                <div className="za-detail-box">
                  <div className="za-detail-hdr" style={{ marginBottom: '16px' }}>
                    <div className="za-detail-icon-box"><IPin /></div>
                    <h2 className="za-detail-hdr-title">Zone Details</h2>
                  </div>

                  <div className="za-detail-list" style={{ gap: '12px' }}>
                    <div className="za-detail-item">
                      <span className="za-detail-label">Zone Code</span>
                      <span className="za-detail-val" style={{ fontSize: '12.5px' }}>{selectedZone.code}</span>
                    </div>
                    <div className="za-detail-item">
                      <span className="za-detail-label">Zone Type</span>
                      <span className="za-detail-val" style={{ fontSize: '12.5px' }}>{selectedZone.type} Zone</span>
                    </div>
                    <div className="za-detail-item">
                      <span className="za-detail-label">Zone Priority</span>
                      <span className="za-detail-val" style={{ fontSize: '12.5px' }}>{selectedZone.priority}</span>
                    </div>
                    <div className="za-detail-item">
                      <span className="za-detail-label">Area</span>
                      <span className="za-detail-val" style={{ fontSize: '12.5px' }}>{selectedZone.area}</span>
                    </div>
                    <div className="za-detail-item">
                      <span className="za-detail-label">Time Zone</span>
                      <span className="za-detail-val" style={{ fontSize: '11px', color: '#475569' }}>(GMT+05:30) Asia/Kolkata</span>
                    </div>
                    <div className="za-detail-item">
                      <span className="za-detail-label">Description</span>
                      <span className="za-detail-val" style={{ fontSize: '11.5px', color: '#475569', fontWeight: 500 }}>{selectedZone.description}</span>
                    </div>
                  </div>
                  <div className="za-divider" style={{ margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="za-detail-label">Effective From</span>
                    <span className="za-detail-val" style={{ fontSize: '12.5px' }}>{selectedZone.effectiveFrom}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation Buttons Footer Bar */}
          {step > 0 && (
            <div className="za-bottom-bar">
              {step > 1 ? (
                <button className="za-back-btn" onClick={handleBack}>
                  &larr; Back: {step === 3 ? "Assign To" : "Select Zone"}
                </button>
              ) : (
                <div />
              )}

              <div className="za-btn-group">
                <button className="za-btn za-btn-outline" onClick={handleCancel}>Cancel</button>
                {step === 1 && (
                  <button
                    className={`za-btn ${selectedZoneId ? 'za-btn-primary' : 'za-btn-disabled'}`}
                    onClick={handleNext}
                    disabled={!selectedZoneId}
                  >
                    Next: Assign Resources &rarr;
                  </button>
                )}
                {step === 2 && (
                  <button className="za-btn za-btn-green" onClick={handleNext}>
                    Next: Review & Confirm &rarr;
                  </button>
                )}
                {step === 3 && (
                  <button className="za-btn za-btn-green" onClick={handleConfirmAssignment}>
                    Confirm & Assign &rarr;
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </div>
      {/* Success Modal Popup on assignment confirm */}
      {showSuccessModal && (
        <div className="za-modal-backdrop">
          <div className="za-modal">
            <div className="za-modal-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>Assignment Successful!</h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
              Resources have been successfully assigned to {selectedZone.id}.
            </p>
          </div>
        </div>
      )}

      {/* View Allocated Resources Modal */}
      {viewingZoneResources && (
        <div className="za-modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="za-modal" style={{ width: '600px', maxWidth: '95%', padding: '24px', borderRadius: '16px', background: '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Allocated Resources</h2>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0', fontWeight: 600 }}>Zone: {viewingZoneResources.id}</p>
              </div>
              <button
                onClick={() => setViewingZoneResources(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {/* Tabs for modal */}
            <div className="za-tabs" style={{ marginBottom: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
              <button
                className={`za-tab-btn ${viewModalTab === 'users' ? 'active' : ''}`}
                onClick={() => setViewModalTab('users')}
                style={{ padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: viewModalTab === 'users' ? '2.5px solid #2A195C' : 'none', fontWeight: 700 }}
              >
                Users ({rawUsers.filter((u: any) => u.zone === viewingZoneResources.id).length})
              </button>
              <button
                className={`za-tab-btn ${viewModalTab === 'vehicles' ? 'active' : ''}`}
                onClick={() => setViewModalTab('vehicles')}
                style={{ padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: viewModalTab === 'vehicles' ? '2.5px solid #2A195C' : 'none', fontWeight: 700 }}
              >
                Vehicles ({rawVehicles.filter((v: any) => v.zone === viewingZoneResources.id).length})
              </button>
              <button
                className={`za-tab-btn ${viewModalTab === 'batteries' ? 'active' : ''}`}
                onClick={() => setViewModalTab('batteries')}
                style={{ padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: viewModalTab === 'batteries' ? '2.5px solid #2A195C' : 'none', fontWeight: 700 }}
              >
                Batteries ({rawBatteries.filter((b: any) => b.zone === viewingZoneResources.id).length})
              </button>
            </div>

            {/* List based on selected tab */}
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {viewModalTab === 'users' && (
                <div className="za-table-container" style={{ border: 'none' }}>
                  <table className="za-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawUsers.filter((u: any) => (u.zone || '').split(',').map((zn: string) => zn.trim().toLowerCase()).includes(viewingZoneResources.id.toLowerCase())).length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', color: '#94A3B8', padding: '20px' }}>No users allocated</td>
                        </tr>
                      ) : (
                        rawUsers.filter((u: any) => (u.zone || '').split(',').map((zn: string) => zn.trim().toLowerCase()).includes(viewingZoneResources.id.toLowerCase())).map((u: any) => (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 700 }}>{u.name}</td>
                            <td>{u.role}</td>
                            <td>{u.email}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {viewModalTab === 'vehicles' && (
                <div className="za-table-container" style={{ border: 'none' }}>
                  <table className="za-table">
                    <thead>
                      <tr>
                        <th>Vehicle</th>
                        <th>Number</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawVehicles.filter((v: any) => v.zone === viewingZoneResources.id).length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', color: '#94A3B8', padding: '20px' }}>No vehicles allocated</td>
                        </tr>
                      ) : (
                        rawVehicles.filter((v: any) => v.zone === viewingZoneResources.id).map((v: any) => (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 700 }}>{v.model}</td>
                            <td>{v.number}</td>
                            <td>
                              <span className="za-badge za-badge-green">{v.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {viewModalTab === 'batteries' && (
                <div className="za-table-container" style={{ border: 'none' }}>
                  <table className="za-table">
                    <thead>
                      <tr>
                        <th>Battery ID</th>
                        <th>Serial</th>
                        <th>Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawBatteries.filter((b: any) => b.zone === viewingZoneResources.id).length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', color: '#94A3B8', padding: '20px' }}>No batteries allocated</td>
                        </tr>
                      ) : (
                        rawBatteries.filter((b: any) => b.zone === viewingZoneResources.id).map((b: any) => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 700 }}>{b.id}</td>
                            <td>{b.serial}</td>
                            <td>
                              <span className="za-badge za-badge-green">{b.health}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
