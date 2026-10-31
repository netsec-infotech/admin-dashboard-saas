'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

/* ──────────────────────────────────────────────────────────────
   STEP 4 · DOCUMENTS — Redesigned Premium Light Theme
   ────────────────────────────────────────────────────────────── */

const CSS = `
/* ═══════════ DESIGN TOKENS ═══════════ */
:root {
  --brand: #2a195c;
  --brand-600: #4338CA;
  --brand-50: #F5F3FF;
  --brand-100: #EDE9FE;
  --brand-200: #DDD6FE;

  --bg: #F7F8FC;
  --card: #FFFFFF;
  --line: #EDEFF5;
  --line-soft: #F3F5F9;

  --ink: #0F1129;
  --ink-mid: #4A4D66;
  --ink-lo: #8A8DA3;
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

  --radius-sm: 10px;
  --radius: 14px;
  --radius-lg: 18px;
  --radius-xl: 22px;

  --shadow-xs: 0 1px 2px rgba(15, 17, 41, 0.04);
  --shadow-sm: 0 1px 3px rgba(15, 17, 41, 0.05), 0 1px 2px rgba(15, 17, 41, 0.03);
  --shadow-md: 0 4px 14px rgba(15, 17, 41, 0.06), 0 1px 3px rgba(15, 17, 41, 0.04);
  --shadow-lg: 0 12px 32px rgba(15, 17, 41, 0.08), 0 4px 8px rgba(15, 17, 41, 0.04);
}

/* ═══════════ SHELL & LAYOUT ═══════════ */
.nr-shell { display: flex; min-height: 100vh; background: var(--bg); }
.nr-main  { margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 240px); }
.nr-page  { flex: 1; padding: 0 32px 100px; max-width: 1520px; }

/* ═══════════ BREADCRUMB ═══════════ */
.nr-bc {
  display: flex; align-items: center; gap: 8px;
  padding: 20px 0 0;
  font-size: 12.5px; color: var(--ink-lo);
}
.nr-bc a {
  color: var(--ink-lo); display: flex; align-items: center; gap: 5px;
  text-decoration: none; transition: color .15s;
  font-weight: 500;
}
.nr-bc a:hover { color: var(--brand); }
.nr-bc-sep { color: var(--ink-faint); font-weight: 400; }
.nr-bc-cur { color: var(--brand); font-weight: 700; }

/* ═══════════ TITLE ROW ═══════════ */
.nr-title-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin: 16px 0 24px; gap: 20px;
}
.nr-h1 {
  font-size: 26px; font-weight: 800; color: var(--ink);
  line-height: 1.15; margin: 0; letter-spacing: -0.5px;
}
.nr-sub { font-size: 13.5px; color: var(--ink-mid); margin-top: 6px; font-weight: 500; }
.nr-back-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  font-size: 13px; font-weight: 600; color: var(--ink-mid);
  cursor: pointer; white-space: nowrap; font-family: inherit;
  box-shadow: var(--shadow-sm);
  transition: all .18s ease; flex-shrink: 0; text-decoration: none;
}
.nr-back-btn:hover {
  border-color: var(--brand-200); color: var(--brand);
  box-shadow: var(--shadow-md); transform: translateY(-1px);
}

/* ═══════════ STEPPER ═══════════ */
.nr-stepper {
  display: flex; align-items: center;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 20px 26px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
}
.nr-step-wrap { display: flex; align-items: center; flex: 1; min-width: 0; }
.nr-step { display: flex; align-items: center; gap: 11px; }
.nr-step-num {
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; flex-shrink: 0;
  transition: all .2s ease;
}
.nr-step-num.active {
  background: linear-gradient(135deg, var(--brand), var(--brand-600));
  color: #fff;
  box-shadow: 0 4px 12px rgba(42, 25, 92, 0.3);
}
.nr-step-num.done {
  background: var(--green); color: #fff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.28);
}
.nr-step-num.pend { background: #fff; color: var(--ink-faint); border: 2px solid var(--line); }
.nr-step-label {
  font-size: 13px; font-weight: 700; color: var(--ink);
  white-space: nowrap; line-height: 1.2;
}
.nr-step-label.pend { color: var(--ink-lo); font-weight: 600; }
.nr-step-stat { font-size: 11.5px; margin-top: 3px; white-space: nowrap; font-weight: 500; }
.nr-step-stat.active-s { color: var(--brand); font-weight: 700; }
.nr-step-stat.done-s   { color: var(--green-dark); font-weight: 700; }
.nr-step-stat.pend-s   { color: var(--ink-faint); }
.nr-step-line {
  flex: 1; height: 2px;
  background: var(--line);
  margin: 0 16px; min-width: 20px; border-radius: 2px;
  transition: all .2s;
}
.nr-step-line.done-l {
  background: linear-gradient(90deg, var(--green) 0%, #4DD9A5 100%);
}

/* ═══════════ 2-COL LAYOUT ═══════════ */
.nr-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

/* ═══════════ MAIN CARD ═══════════ */
.nr-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 20px;
}
.nr-card-hdr {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 20px; padding: 24px 28px 22px;
  border-bottom: 1px solid var(--line-soft);
  background: linear-gradient(180deg, #FCFCFE 0%, #FFFFFF 100%);
}
.nr-card-hdr h2 {
  font-size: 19px; font-weight: 800; color: var(--ink);
  margin: 0 0 5px; letter-spacing: -0.3px;
}
.nr-card-hdr p { font-size: 13px; color: var(--ink-mid); margin: 0; line-height: 1.5; max-width: 560px; }

/* ═══════════ INFO BANNER ═══════════ */
.doc-banner {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
  border: 1px solid var(--sky-line);
  border-radius: var(--radius);
  padding: 13px 20px; margin-bottom: 26px;
  font-size: 12.5px; color: #1E40AF; font-weight: 500;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.05);
}
.doc-banner-sep { color: var(--sky-line); font-size: 14px; font-weight: 300; }

/* ═══════════ SECTION BODY ═══════════ */
.doc-sec-body { padding: 24px 28px 28px; }
.doc-sec-hd {
  font-size: 15px; font-weight: 800; color: var(--ink);
  margin-bottom: 6px; letter-spacing: -0.2px;
  display: flex; align-items: center; gap: 10px;
}
.doc-sec-hd::before {
  content: ''; width: 3px; height: 18px;
  background: linear-gradient(180deg, var(--brand) 0%, var(--brand-600) 100%);
  border-radius: 2px;
}
.doc-sec-sub { font-size: 12.5px; color: var(--ink-lo); margin-bottom: 20px; margin-left: 13px; font-weight: 500; line-height: 1.5; }

/* ═══════════ UPLOAD GRIDS ═══════════ */
.doc-grid-2 {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 20px; max-width: 720px;
}
.doc-grid-4 {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* ═══════════ DOCUMENT UPLOAD CARD (redesigned) ═══════════ */
.doc-card {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--card);
  transition: all .22s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.doc-card:hover {
  border-color: var(--brand-200);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
.doc-card.is-uploaded {
  border-color: var(--green-line);
  background: linear-gradient(180deg, #FCFEFD 0%, #FFFFFF 100%);
}

/* card header with icon */
.doc-card-top {
  padding: 14px 14px 10px;
  display: flex; align-items: flex-start; gap: 11px;
}
.doc-card-icon {
  width: 38px; height: 38px; border-radius: 11px;
  background: linear-gradient(135deg, var(--brand-50) 0%, var(--brand-100) 100%);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--brand);
  border: 1px solid var(--brand-100);
  transition: all .2s;
}
.doc-card.is-uploaded .doc-card-icon {
  background: linear-gradient(135deg, var(--green-soft) 0%, #D1FAE5 100%);
  border-color: var(--green-line);
  color: var(--green-dark);
}
.doc-card-icon-text { flex: 1; min-width: 0; }
.doc-card-label {
  font-size: 13px; font-weight: 800; color: var(--ink);
  line-height: 1.25; letter-spacing: -0.2px;
  display: flex; align-items: center;
}
.doc-card-sub {
  font-size: 10.5px; color: var(--ink-lo);
  margin-top: 3px; font-weight: 500; line-height: 1.4;
}

/* preview area */
.doc-preview {
  margin: 0 12px 12px;
  border-radius: var(--radius);
  overflow: hidden;
  height: 118px;
  background: linear-gradient(135deg, #F8FAFC 0%, #F3F5F9 100%);
  display: flex; align-items: center; justify-content: center;
  border: 1px dashed var(--line);
  position: relative;
  transition: all .2s;
}
.doc-preview.has-image {
  border-style: solid;
  border-color: var(--line);
  background: #FFFFFF;
}
.doc-preview img { width: 100%; height: 100%; object-fit: contain; }

/* upload badge overlay */
.doc-badge {
  position: absolute; top: 8px; right: 8px;
  padding: 4px 9px;
  background: var(--green);
  color: #fff;
  font-size: 9.5px; font-weight: 800;
  border-radius: 20px;
  display: flex; align-items: center; gap: 4px;
  box-shadow: 0 3px 8px rgba(16, 185, 129, 0.35);
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* action buttons row */
.doc-actions {
  padding: 10px 12px;
  display: flex; gap: 8px;
  background: var(--line-soft);
  border-top: 1px solid var(--line);
}
.doc-btn-upload, .doc-btn-camera {
  flex: 1; padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px; font-weight: 800;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  transition: all .18s ease;
  letter-spacing: 0.2px;
  font-family: inherit;
}
.doc-btn-upload {
  background: #FFFFFF;
  border: 1.5px solid var(--line);
  color: var(--ink-mid);
}
.doc-btn-upload:hover {
  border-color: var(--brand-200);
  color: var(--brand);
  background: var(--brand-50);
}
.doc-btn-camera {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%);
  border: none;
  color: #FFFFFF;
  box-shadow: 0 3px 10px rgba(42, 25, 92, 0.22);
}
.doc-btn-camera:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(42, 25, 92, 0.3);
}

/* status footer */
.doc-footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: 6px; padding: 10px 14px;
  border-top: 1px solid var(--line-soft);
  background: #FFFFFF;
}
.doc-uploaded {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; color: var(--green-dark);
  letter-spacing: 0.2px;
}
.doc-uploaded.ready {
  color: var(--ink-lo);
}
.doc-del {
  display: flex; align-items: center; gap: 4px;
  color: var(--red); cursor: pointer;
  font-size: 11px; font-weight: 700;
  border: none; background: none; padding: 4px 8px;
  border-radius: 6px;
  transition: background .15s;
}
.doc-del:hover {
  background: var(--red-soft);
  text-decoration: none !important;
}

/* ═══════════ VEHICLE ANGLE CARD (redesigned) ═══════════ */
.veh-card {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--card);
  transition: all .22s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.veh-card:hover {
  border-color: var(--brand-200);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
.veh-card.is-uploaded {
  border-color: var(--green-line);
}
.veh-card-label {
  padding: 12px 14px 8px;
  font-size: 12px; font-weight: 800; color: var(--ink);
  display: flex; align-items: center; gap: 3px;
  letter-spacing: -0.1px;
}
.veh-card-req { color: var(--red); }
.veh-preview {
  margin: 0 12px 12px;
  border-radius: var(--radius);
  overflow: hidden;
  height: 118px;
  background: linear-gradient(135deg, #F8FAFC 0%, #F3F5F9 100%);
  display: flex; align-items: center; justify-content: center;
  border: 1px dashed var(--line);
  position: relative;
  transition: all .2s;
}
.veh-preview.has-image {
  border-style: solid;
  background: #FFFFFF;
}
.veh-preview img { width: 100%; height: 100%; object-fit: contain; }
.veh-footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: 6px; padding: 10px 14px;
  border-top: 1px solid var(--line-soft);
  background: #FFFFFF;
}

/* ═══════════ TERMS & CONDITIONS ═══════════ */
.doc-terms-box {
  background: linear-gradient(180deg, #FCFCFE 0%, #FFFFFF 100%);
  border: 1.5px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  transition: all .2s;
}
.doc-cb-row {
  display: flex; align-items: flex-start; gap: 12px;
  margin-bottom: 14px; cursor: pointer;
  user-select: none;
}
.doc-cb {
  width: 22px; height: 22px; border-radius: 7px;
  border: 2px solid var(--line);
  background: #FFFFFF;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
  transition: all .18s cubic-bezier(0.4, 0, 0.2, 1);
  color: #fff;
}
.doc-cb.on {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%);
  border-color: var(--brand);
  box-shadow: 0 3px 10px rgba(42, 25, 92, 0.3);
}
.doc-cb-label {
  font-size: 13.5px; color: var(--ink-mid);
  line-height: 1.6; font-weight: 500;
}
.doc-cb-label strong {
  color: var(--brand); font-weight: 800;
}
.doc-terms-link {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 700; color: var(--brand);
  cursor: pointer; border: none; background: none;
  font-family: inherit; padding: 0; margin-bottom: 16px;
  transition: all .15s;
}
.doc-terms-link:hover {
  gap: 9px;
  text-decoration: underline;
}
.doc-confirm-banner {
  display: flex; align-items: flex-start; gap: 11px;
  background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
  border: 1px solid var(--green-line);
  border-radius: var(--radius);
  padding: 14px 18px;
  font-size: 12.5px; color: var(--green-dark); line-height: 1.6;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.06);
  animation: slideIn .3s ease-out;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ═══════════ FOOTER ACTIONS ═══════════ */
.nr-footer-actions {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 28px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.nr-prev-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 22px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 700; color: var(--ink-mid);
  cursor: pointer; font-family: inherit;
  transition: all .18s ease;
  text-decoration: none;
}
.nr-prev-btn:hover {
  border-color: var(--brand);
  color: var(--brand);
  background: var(--brand-50);
  transform: translateY(-1px);
}
.nr-continue-btn {
  display: flex; align-items: center; gap: 9px;
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 800; color: #fff;
  cursor: pointer; font-family: inherit;
  transition: all .18s ease;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(42, 25, 92, 0.28);
  letter-spacing: 0.1px;
}
.nr-continue-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(42, 25, 92, 0.35);
}

/* ═══════════ RIGHT PANEL ═══════════ */
.nr-rp {
  display: flex; flex-direction: column; gap: 18px;
  position: sticky; top: 24px;
}
.nr-rp-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.nr-rp-hdr {
  display: flex; align-items: center; gap: 10px;
  padding: 15px 20px;
  border-bottom: 1px solid var(--line-soft);
  background: linear-gradient(180deg, #FCFCFE 0%, #FFFFFF 100%);
}
.nr-rp-hdr-ic { display: flex; align-items: center; flex-shrink: 0; }
.nr-rp-title { font-size: 13.5px; font-weight: 800; color: var(--ink); letter-spacing: -0.2px; }

/* Rental summary */
.nr-sum-body {
  padding: 14px 16px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.nr-sum-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; font-size: 13px;
  background: var(--line-soft);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  transition: all .15s;
}
.nr-sum-row:hover {
  background: #F9FAFC;
  border-color: var(--line);
}
.nr-sum-row-img {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; font-size: 13px;
  background: var(--line-soft);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
}
.nr-sum-label { color: var(--ink-lo); font-weight: 600; }
.nr-sum-val {
  font-weight: 800; color: var(--ink);
  display: flex; align-items: center; gap: 8px;
  letter-spacing: -0.1px;
}
.nr-sum-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--line) 20%, var(--line) 80%, transparent);
  margin: 6px 0;
}
.nr-sum-total {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; margin-top: 4px;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--brand-50) 0%, var(--brand-100) 100%);
  border: 1.5px solid var(--brand-200);
}
.nr-sum-total-l {
  font-size: 12.5px; font-weight: 700; color: var(--ink-mid);
  letter-spacing: 0.1px;
}
.nr-sum-total-r {
  font-size: 19px; font-weight: 900; color: var(--brand);
  letter-spacing: -0.5px;
}

/* Checklist */
.doc-checklist-body { padding: 8px 0 12px; }
.doc-cl-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 20px; font-size: 12.5px;
  transition: background .15s;
}
.doc-cl-row:hover { background: var(--line-soft); }
.doc-cl-label {
  color: var(--ink-mid); font-weight: 500;
  display: flex; align-items: center; gap: 8px;
}
.doc-cl-label::before {
  content: ''; width: 5px; height: 5px;
  border-radius: 50%; background: var(--brand-200);
  flex-shrink: 0;
}
.doc-cl-status {
  display: flex; align-items: center; gap: 5px;
  color: var(--green-dark); font-weight: 800; font-size: 11.5px;
  letter-spacing: 0.2px;
}

/* Need help */
.nr-help-body { padding: 16px 20px 18px; }
.nr-help-sub {
  font-size: 12.5px; color: var(--ink-lo);
  margin-bottom: 14px; line-height: 1.55;
}
.nr-help-btn {
  width: 100%; padding: 11px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%);
  color: #fff; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 800;
  cursor: pointer; border: none; font-family: inherit;
  transition: all .18s ease;
  box-shadow: 0 4px 12px rgba(42, 25, 92, 0.25);
  letter-spacing: 0.1px;
}
.nr-help-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(42, 25, 92, 0.32);
}

/* Responsive */
@media (max-width: 1280px) {
  .doc-grid-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 1024px) {
  .nr-layout { grid-template-columns: 1fr; }
  .nr-rp { position: static; }
  .doc-grid-2, .doc-grid-4 { grid-template-columns: 1fr 1fr; max-width: none; }
}
@media (max-width: 640px) {
  .doc-grid-2, .doc-grid-4 { grid-template-columns: 1fr; }
}
`;

/* ═══════════ SVG Helpers ═══════════ */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 as number, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const SV = ({ s = 14, children, ...p }: { s?: number; children: React.ReactNode } & React.SVGProps<SVGSVGElement>) => (
  <svg width={s} height={s} viewBox="0 0 24 24" {...S} {...p}>{children}</svg>
);
const ILeft = () => <SV s={13}><polyline points="15 18 9 12 15 6" /></SV>;
const ICheck = ({ s = 13 }: { s?: number }) => <SV s={s}><polyline points="20 6 9 17 4 12" /></SV>;
const IInfo = ({ s = 14 }: { s?: number }) => <SV s={s}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></SV>;
const IHead = () => <SV s={15}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></SV>;
const IArr = ({ s = 12 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IReceipt = () => <SV s={14}><path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2z" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="12" y2="13" /></SV>;
const IFile = ({ s = 14 }: { s?: number }) => <SV s={s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></SV>;
const ITrash = ({ s = 12 }: { s?: number }) => <SV s={s}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></SV>;
const IExt = () => <SV s={12}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></SV>;
const ICheckList = () => <SV s={14}><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></SV>;
const IUpload = () => <SV s={12}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></SV>;
const ICamera = () => <SV s={12}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></SV>;
const IImage = () => <SV s={14}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></SV>;

/* ═══════════ Stepper ═══════════ */
const STEPS = [
  { n: 1, label: 'KYC Verification', stat: 'Completed', state: 'done' },
  { n: 2, label: 'Rental Details', stat: 'Completed', state: 'done' },
  { n: 3, label: 'Payment & Charges', stat: 'Completed', state: 'done' },
  { n: 4, label: 'Documents', stat: 'In Progress', state: 'active' },
  { n: 5, label: 'Review & Confirm', stat: 'Pending', state: 'pend' },
];

/* ═══════════ Document Upload Card ═══════════ */
interface DocCardProps {
  label: string;
  sub: string;
  defaultImg: string;
  storageKey: string;
}
function DocCard({ label, sub, defaultImg, storageKey }: DocCardProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setImageSrc(saved);
    } catch (e) {}
  }, [storageKey]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setImageSrc(res);
        try { localStorage.setItem(storageKey, res); } catch (e) {}
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setImageSrc(null);
    try { localStorage.removeItem(storageKey); } catch (e) {}
  };

  const hasImage = !!imageSrc;

  return (
    <div className={`doc-card ${hasImage ? 'is-uploaded' : ''}`}>
      <div className="doc-card-top">
        <div className="doc-card-icon"><IFile s={16} /></div>
        <div className="doc-card-icon-text">
          <div className="doc-card-label">
            {label}
            <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>
          </div>
          <div className="doc-card-sub">{sub}</div>
        </div>
      </div>

      <div className={`doc-preview ${hasImage ? 'has-image' : ''}`}>
        <img src={imageSrc || defaultImg} alt={label} />
        {hasImage && (
          <div className="doc-badge">
            <ICheck s={9} /> Uploaded
          </div>
        )}
      </div>

      <div className="doc-actions">
        <label className="doc-btn-upload">
          <IUpload /> Upload
          <input type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: 'none' }} />
        </label>
        <label className="doc-btn-camera">
          <ICamera /> Camera
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
        </label>
      </div>

      <div className="doc-footer">
        <span className={`doc-uploaded ${hasImage ? '' : 'ready'}`}>
          <ICheck s={11} /> {hasImage ? 'Verified' : 'Awaiting upload'}
        </span>
        {hasImage && (
          <button type="button" onClick={handleClear} className="doc-del">
            <ITrash s={11} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════ Vehicle Angle Card ═══════════ */
interface VehCardProps {
  label: string;
  defaultImg: string;
  storageKey: string;
}
function VehCard({ label, defaultImg, storageKey }: VehCardProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setImageSrc(saved);
    } catch (e) {}
  }, [storageKey]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setImageSrc(res);
        try { localStorage.setItem(storageKey, res); } catch (e) {}
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setImageSrc(null);
    try { localStorage.removeItem(storageKey); } catch (e) {}
  };

  const hasImage = !!imageSrc;

  return (
    <div className={`veh-card ${hasImage ? 'is-uploaded' : ''}`}>
      <div className="veh-card-label">
        {label}<span className="veh-card-req">*</span>
      </div>
      <div className={`veh-preview ${hasImage ? 'has-image' : ''}`}>
        <img src={imageSrc || defaultImg} alt={label} />
        {hasImage && (
          <div className="doc-badge">
            <ICheck s={9} /> Uploaded
          </div>
        )}
      </div>
      <div className="doc-actions">
        <label className="doc-btn-upload">
          <IUpload /> Upload
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </label>
        <label className="doc-btn-camera">
          <ICamera /> Camera
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
        </label>
      </div>
      <div className="veh-footer">
        <span className={`doc-uploaded ${hasImage ? '' : 'ready'}`}>
          <ICheck s={11} /> {hasImage ? 'Verified' : 'Awaiting upload'}
        </span>
        {hasImage && (
          <button type="button" onClick={handleClear} className="doc-del">
            <ITrash s={11} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════ Right Panel ═══════════ */
function RightPanel({ rentalData, paymentData }: { rentalData?: any; paymentData?: any }) {
  const CHECKLIST = [
    { l: 'Identity Document', s: 'Uploaded' },
    { l: 'Rider Profile Photo', s: 'Uploaded' },
    { l: 'Vehicle Photos (4)', s: 'Complete' },
    { l: 'Terms & Conditions', s: 'Agreed' },
  ];

  const vehicleNumber = rentalData?.vehicle_code || (rentalData?.vehicle_name?.match(/\((.*?)\)/)?.[1]) || rentalData?.vehicle_name || 'EVM102501';
  const vehicleModel = rentalData?.vehicle_model || rentalData?.vehicle_name?.replace(/\(.*?\)/, '').trim() || 'Evegah City';
  const batteryId = rentalData?.battery_id || 'BAT-MNZ-001';
  const planType = rentalData?.plan_type || 'Daily Plan';
  const baseRent = Number(rentalData?.plan_rate) || 0;
  const duration = Number(rentalData?.total_days) || 1;
  const deposit = Number(rentalData?.deposit_amount ?? 0);
  const discount = Number(paymentData?.discount) || 0;
  const totalPayable = paymentData?.total_payable || Math.max(0, baseRent + deposit - discount);

  return (
    <div className="nr-rp">
      {/* Rental Summary */}
      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: 'var(--brand)' }}><IReceipt /></span>
          <div className="nr-rp-title">Rental Summary</div>
        </div>
        <div className="nr-sum-body">
          <div className="nr-sum-row">
            <span className="nr-sum-label">Vehicle Number</span>
            <span className="nr-sum-val" style={{ fontWeight: 700 }}>{vehicleNumber}</span>
          </div>
          <div className="nr-sum-row">
            <span className="nr-sum-label">Vehicle Model</span>
            <span className="nr-sum-val" style={{ fontWeight: 700 }}>{vehicleModel}</span>
          </div>
          <div className="nr-sum-row-img">
            <span className="nr-sum-label">Battery</span>
            <span className="nr-sum-val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {batteryId}
              <img src="/ev_batttery.png" alt="Battery" style={{ width: 18, height: 24, objectFit: 'contain', borderRadius: 2 }} />
            </span>
          </div>
          {[
            { l: 'Plan', v: `${planType} (${duration} Day${duration > 1 ? 's' : ''})` },
            { l: 'Plan Rate', v: `₹${baseRent.toFixed(2)}` },
            { l: 'Refundable Deposit', v: `₹${deposit.toFixed(2)}` },
            ...(discount > 0 ? [{ l: 'Coupon Discount', v: `-₹${discount.toFixed(2)}` }] : []),
          ].map(r => (
            <div key={r.l} className="nr-sum-row">
              <span className="nr-sum-label">{r.l}</span>
              <span className="nr-sum-val">{r.v}</span>
            </div>
          ))}
          <div className="nr-sum-divider" />
          <div className="nr-sum-total">
            <span className="nr-sum-total-l">Total Payable (Zero GST)</span>
            <span className="nr-sum-total-r">₹{Number(totalPayable).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: 'var(--brand)' }}><ICheckList /></span>
          <div className="nr-rp-title">Document Checklist</div>
        </div>
        <div className="doc-checklist-body">
          {CHECKLIST.map(c => (
            <div key={c.l} className="doc-cl-row">
              <span className="doc-cl-label">{c.l}</span>
              <span className="doc-cl-status"><ICheck s={11} /> {c.s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Need Help */}
      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: 'var(--brand)' }}><IHead /></span>
          <div className="nr-rp-title">Need Help?</div>
        </div>
        <div className="nr-help-body">
          <div className="nr-help-sub">Facing issues uploading documents or have any questions?</div>
          <button className="nr-help-btn">Contact Support</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function DocumentsPage() {
  const [agreed, setAgreed] = useState(true);
  const [rentalData, setRentalData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    try {
      setRentalData(JSON.parse(localStorage.getItem('evegah_new_ride_rental') || '{}'));
      setPaymentData(JSON.parse(localStorage.getItem('evegah_new_ride_payment') || '{}'));
    } catch (e) {}
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="nr-shell">
        <Sidebar activePath="/new-rider" />
        <div className="nr-main">
          <TopBar />
          <div className="nr-page">

            {/* Breadcrumb */}
            <div className="nr-bc">
              <Link href="/"><ILeft /> Home</Link>
              <span className="nr-bc-sep">›</span>
              <a href="#">Rides / Rentals</a>
              <span className="nr-bc-sep">›</span>
              <span className="nr-bc-cur">New Ride Registration</span>
            </div>

            {/* Title */}
            <div className="nr-title-row">
              <div>
                <h1 className="nr-h1">New Ride Registration</h1>
                <p className="nr-sub">Upload documents and complete the final verification</p>
              </div>
              <Link href="/renters" className="nr-back-btn"><ILeft /> Back to Rides</Link>
            </div>

            {/* Stepper */}
            <div className="nr-stepper">
              {STEPS.map((s, i) => (
                <div key={s.n} className="nr-step-wrap">
                  <div className="nr-step">
                    <div className={`nr-step-num ${s.state}`}>
                      {s.state === 'done' ? <ICheck s={13} /> : s.n}
                    </div>
                    <div>
                      <div className={`nr-step-label ${s.state === 'pend' ? 'pend' : ''}`}>{s.label}</div>
                      <div className={`nr-step-stat ${s.state}-s`}>{s.stat}</div>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`nr-step-line ${s.state === 'done' ? 'done-l' : ''}`} />
                  )}
                </div>
              ))}
            </div>

            {/* 2-col layout */}
            <div className="nr-layout">
              <div>
                {/* Main card */}
                <div className="nr-card">
                  <div className="nr-card-hdr">
                    <div>
                      <h2>Step 4: Documents</h2>
                      <p>Upload rider documents, vehicle images and accept terms &amp; conditions.</p>
                    </div>
                  </div>

                  <div className="doc-sec-body">
                    {/* Info banner */}
                    <div className="doc-banner">
                      <span style={{ display: 'flex', flexShrink: 0 }}><IInfo s={14} /></span>
                      <span>Accepted formats: JPG, PNG, PDF</span>
                      <span className="doc-banner-sep">|</span>
                      <span>Max file size: 5MB per file</span>
                    </div>

                    {/* 1. Rider Documents */}
                    <div className="doc-sec-hd">1. Rider Documents</div>
                    <div className="doc-sec-sub">Upload clear copies of the rider's identity document and profile photo.</div>
                    <div className="doc-grid-2" style={{ marginBottom: 32 }}>
                      <DocCard
                        label="Identity Document"
                        sub="Aadhaar / Driving License / Voter ID / Passport"
                        defaultImg="/assets/aadhar.jpg"
                        storageKey="evegah_doc_identity"
                      />
                      <DocCard
                        label="Profile Photo"
                        sub="Recent passport size photo or live camera capture"
                        defaultImg="/rohit_avatar.png"
                        storageKey="evegah_doc_profile"
                      />
                    </div>

                    {/* 2. Vehicle Images */}
                    <div className="doc-sec-hd">2. Vehicle Images</div>
                    <div className="doc-sec-sub">Upload clear inspection photos of the vehicle from all 4 mandatory angles.</div>
                    <div className="doc-grid-4" style={{ marginBottom: 32 }}>
                      <VehCard label="Front View" defaultImg="/City-1.png" storageKey="evegah_veh_front" />
                      <VehCard label="Rear View" defaultImg="/City-2.png" storageKey="evegah_veh_rear" />
                      <VehCard label="Left Side View" defaultImg="/City-3.png" storageKey="evegah_veh_left" />
                      <VehCard label="Right Side View" defaultImg="/City-4.png" storageKey="evegah_veh_right" />
                    </div>

                    {/* 3. Terms & Conditions */}
                    <div className="doc-sec-hd">3. Rider Terms &amp; Conditions</div>
                    <div className="doc-sec-sub">Please read and accept the terms before continuing.</div>
                    <div className="doc-terms-box">
                      <div className="doc-cb-row" onClick={() => setAgreed(!agreed)}>
                        <div className={`doc-cb ${agreed ? 'on' : ''}`}>
                          {agreed && <ICheck s={13} />}
                        </div>
                        <span className="doc-cb-label">
                          I have read, understood and agree to the{' '}
                          <strong>Rider Terms &amp; Conditions</strong>, vehicle safety guidelines, and battery usage policy.
                        </span>
                      </div>
                      <button type="button" className="doc-terms-link">
                        View Terms &amp; Conditions <IExt />
                      </button>
                      {agreed && (
                        <div className="doc-confirm-banner">
                          <span style={{ display: 'flex', flexShrink: 0, marginTop: 1, color: 'var(--green)' }}><ICheck s={14} /></span>
                          By checking this agreement, I confirm that all rider documents and vehicle images submitted are accurate and legitimate.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="nr-footer-actions">
                  <Link href="/new-rider/payment" className="nr-prev-btn"><ILeft /> Previous</Link>
                  {agreed ? (
                    <Link href="/new-rider/review" className="nr-continue-btn">
                      Continue to Review &amp; Confirm <IArr s={12} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="nr-continue-btn"
                      style={{ background: '#CBD5E1', color: '#64748B', cursor: 'not-allowed', boxShadow: 'none', opacity: 0.75 }}
                    >
                      Continue to Review &amp; Confirm <IArr s={12} />
                    </button>
                  )}
                </div>
              </div>

              <RightPanel rentalData={rentalData} paymentData={paymentData} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}