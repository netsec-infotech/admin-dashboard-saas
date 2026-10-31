'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

/* ──────────────────────────────────────────────────────────────
   NEW RIDE REGISTRATION  ·  Premium Redesign
   ────────────────────────────────────────────────────────────── */

const CSS = `
/* ═══════════════ DESIGN TOKENS ═══════════════ */
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

  --orange: #F97316;
  --orange-soft: #FFF7ED;
  --orange-line: #FED7AA;

  --radius-sm: 10px;
  --radius: 14px;
  --radius-lg: 18px;
  --radius-xl: 22px;

  --shadow-xs: 0 1px 2px rgba(15, 17, 41, 0.04);
  --shadow-sm: 0 1px 3px rgba(15, 17, 41, 0.05), 0 1px 2px rgba(15, 17, 41, 0.03);
  --shadow-md: 0 4px 14px rgba(15, 17, 41, 0.06), 0 1px 3px rgba(15, 17, 41, 0.04);
  --shadow-lg: 0 12px 32px rgba(15, 17, 41, 0.08), 0 4px 8px rgba(15, 17, 41, 0.04);
  --shadow-brand: 0 8px 24px rgba(42, 25, 92, 0.22);
}

/* ═══════════════ SHELL & LAYOUT ═══════════════ */
.nr-shell { display: flex; min-height: 100vh; background: var(--bg); }
.nr-main  { margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 240px); }
.nr-page  { flex: 1; padding: 0 32px 100px; max-width: 1520px; }

/* ═══════════════ BREADCRUMB ═══════════════ */
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

/* ═══════════════ TITLE ROW ═══════════════ */
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
  transition: all .18s ease;
  flex-shrink: 0; text-decoration: none;
}
.nr-back-btn:hover {
  border-color: var(--brand-200); color: var(--brand);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* ═══════════════ STEPPER ═══════════════ */
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
.nr-step-num.done { background: var(--green); color: #fff; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.28); }
.nr-step-num.pend { background: #fff; color: var(--ink-faint); border: 2px solid var(--line); }
.nr-step-label {
  font-size: 13px; font-weight: 700; color: var(--ink);
  white-space: nowrap; line-height: 1.2;
}
.nr-step-label.pend { color: var(--ink-lo); font-weight: 600; }
.nr-step-stat { font-size: 11.5px; margin-top: 3px; white-space: nowrap; font-weight: 500; }
.nr-step-stat.active-s { color: var(--brand); font-weight: 700; }
.nr-step-stat.pend-s   { color: var(--ink-faint); }
.nr-step-line {
  flex: 1; height: 2px;
  background: linear-gradient(90deg, var(--line) 0%, var(--line-soft) 100%);
  margin: 0 16px; min-width: 20px; border-radius: 2px;
}

/* ═══════════════ 2-COL LAYOUT ═══════════════ */
.nr-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}

/* ═══════════════ CARDS ═══════════════ */
.nr-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 18px;
}

/* ═══ STEP CARD HEADER ═══ */
.nr-card-hdr {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 20px; padding: 22px 26px 20px;
  border-bottom: 1px solid var(--line-soft);
  background: linear-gradient(180deg, #FCFCFE 0%, #FFFFFF 100%);
}
.nr-card-hdr h2 {
  font-size: 18px; font-weight: 800; color: var(--ink);
  margin: 0 0 5px; letter-spacing: -0.3px;
}
.nr-card-hdr p { font-size: 13px; color: var(--ink-mid); margin: 0; line-height: 1.5; max-width: 520px; }

.nr-pow-row { display: flex; align-items: center; gap: 10px; flex-shrink: 0; flex-wrap: wrap; }
.nr-pow-lbl { font-size: 11px; color: var(--ink-lo); white-space: nowrap; font-weight: 500; }
.nr-digi-brand { display: flex; align-items: center; gap: 6px; }
.nr-digi-name  { font-size: 13.5px; font-weight: 800; color: #1B4FBB; letter-spacing: -0.2px; }

.nr-verified-tag, .nr-manual-tag {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 700;
  border-radius: 8px; padding: 5px 11px;
  white-space: nowrap;
}
.nr-verified-tag {
  color: var(--green-dark); background: var(--green-soft);
  border: 1px solid var(--green-line);
}
.nr-manual-tag {
  color: #B45309; background: var(--amber-soft);
  border: 1px solid var(--amber-line);
}

/* ═══ GREEN BANNER ═══ */
.nr-green-banner {
  display: flex; align-items: flex-start; gap: 12px;
  background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
  border: 1px solid var(--green-line);
  border-radius: var(--radius);
  padding: 16px 20px; margin: 20px 26px 0;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.06);
}
.nr-green-ic {
  width: 24px; height: 24px; background: var(--green);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
  box-shadow: 0 3px 8px rgba(16, 185, 129, 0.3);
  color: #fff;
}
.nr-green-t { font-size: 13.5px; font-weight: 800; color: var(--green-dark); margin-bottom: 4px; }
.nr-green-s { font-size: 12.5px; color: var(--green-dark); opacity: 0.85; line-height: 1.5; }

/* ═══ METHOD CARDS GRID ═══ */
.nr-methods {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 18px; padding: 20px 26px;
}
.nr-mc {
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  padding: 22px;
  cursor: pointer;
  transition: all .22s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; min-height: 300px;
  background: #FFFFFF;
  position: relative;
}
.nr-mc:hover:not(.sel) {
  border-color: var(--brand-200);
  background: #FEFEFF;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.nr-mc.sel {
  border-color: var(--brand);
  background: linear-gradient(180deg, #FAFAFF 0%, #F5F3FF 100%);
  box-shadow: 0 8px 24px rgba(42, 25, 92, 0.10);
}
.nr-mc.sel::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--brand), var(--brand-600));
  border-radius: var(--radius) var(--radius) 0 0;
}

.nr-mc-top { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.nr-radio {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid #D1D5DB; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .18s ease;
}
.nr-radio.on { border-color: var(--brand); background: var(--brand); box-shadow: 0 0 0 4px rgba(42, 25, 92, 0.10); }
.nr-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
.nr-mc-title { font-size: 14.5px; font-weight: 800; color: var(--ink); letter-spacing: -0.2px; }
.nr-rec-badge {
  background: linear-gradient(135deg, var(--brand), var(--brand-600));
  color: #fff; border-radius: 6px;
  font-size: 10.5px; font-weight: 800; padding: 3px 9px;
  white-space: nowrap; letter-spacing: 0.3px;
  box-shadow: 0 2px 6px rgba(42, 25, 92, 0.25);
}
.nr-mc-desc { font-size: 12.5px; color: var(--ink-mid); margin-bottom: 16px; line-height: 1.55; }
.nr-bullets { display: flex; flex-direction: column; gap: 9px; margin-bottom: 18px; }
.nr-bullet { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: var(--ink-mid); font-weight: 500; }
.nr-bullet-ic { display: flex; align-items: center; flex-shrink: 0; }

/* ═══ DIGILOCKER ILLUSTRATION ═══ */
.nr-digi-illus {
  background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%);
  border-radius: var(--radius);
  padding: 18px 14px;
  display: flex; align-items: center; justify-content: center;
  gap: 18px; margin-bottom: 18px; flex: 1;
  border: 1px solid var(--brand-100);
}
.nr-doc {
  width: 56px; height: 74px; background: #fff;
  border-radius: 8px; border: 1.5px solid var(--brand-200);
  display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(42, 25, 92, 0.08);
}
.nr-doc-hd {
  height: 20px;
  background: linear-gradient(135deg, var(--brand), var(--brand-600));
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.nr-doc-bd { flex: 1; padding: 6px; display: flex; flex-direction: column; gap: 3px; }
.nr-doc-photo { width: 14px; height: 18px; background: var(--brand-200); border-radius: 2px; margin-bottom: 3px; align-self: flex-end; object-fit: cover; }
.nr-doc-ln { height: 3px; background: var(--line); border-radius: 2px; }
.nr-digi-logo-badge {
  width: 56px; height: 56px; background: #fff;
  border-radius: 14px; border: 1.5px solid var(--line);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(15, 17, 41, 0.06);
}

/* ═══ BUTTONS ═══ */
.nr-btn-pri {
  width: 100%; padding: 13px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 13.5px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  cursor: pointer; border: none; font-family: inherit;
  transition: all .18s ease;
  box-shadow: 0 4px 14px rgba(42, 25, 92, 0.28);
  letter-spacing: 0.1px;
}
.nr-btn-pri:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(42, 25, 92, 0.35);
}
.nr-btn-pri:active { transform: translateY(0); }

.nr-btn-out {
  width: 100%; padding: 13px;
  background: #fff; color: var(--ink-mid);
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 13.5px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  cursor: pointer; font-family: inherit;
  transition: all .18s ease;
  margin-top: auto;
}
.nr-btn-out:hover {
  border-color: var(--brand);
  color: var(--brand);
  background: var(--brand-50);
}
.nr-mc-note {
  font-size: 11.5px; color: var(--ink-lo);
  text-align: center; margin-top: 10px; line-height: 1.5;
}

/* ═══ DO KYC LATER ═══ */
.nr-later {
  display: flex; align-items: center; justify-content: space-between; gap: 18px;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFFBF5 100%);
  border: 1px solid var(--orange-line);
  border-radius: var(--radius);
  padding: 18px 22px; margin-bottom: 18px;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.nr-later-l { display: flex; align-items: flex-start; gap: 12px; }
.nr-later-ic { color: var(--orange); display: flex; align-items: center; flex-shrink: 0; margin-top: 2px; }
.nr-later-t { font-size: 13.5px; font-weight: 800; color: #9A3412; margin-bottom: 4px; letter-spacing: -0.2px; }
.nr-later-s { font-size: 12.5px; color: #B45309; line-height: 1.55; max-width: 540px; }
.nr-later-btn {
  padding: 10px 20px; background: #fff;
  border: 1.5px solid var(--orange);
  border-radius: var(--radius-sm);
  color: var(--orange); font-size: 13px; font-weight: 800;
  cursor: pointer; white-space: nowrap; flex-shrink: 0; font-family: inherit;
  transition: all .18s ease;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.1);
}
.nr-later-btn:hover {
  background: var(--orange-soft);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
}

/* ═══ INFO NOTE ═══ */
.nr-info-note {
  display: flex; align-items: flex-start; gap: 11px;
  background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
  border: 1px solid var(--sky-line);
  border-radius: var(--radius);
  padding: 15px 20px; margin-bottom: 18px;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.nr-info-note-t { font-size: 13px; color: #1E40AF; line-height: 1.55; font-weight: 500; }

/* ═══ FOOTER ACTIONS ═══ */
.nr-footer-actions {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 26px; background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.nr-cancel {
  padding: 11px 24px; background: #fff;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 700; color: var(--ink-mid);
  cursor: pointer; font-family: inherit;
  transition: all .18s ease;
}
.nr-cancel:hover { border-color: var(--ink-lo); color: var(--ink); background: var(--line-soft); }
.nr-save {
  padding: 11px 24px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%);
  border: none; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 800; color: #fff; cursor: pointer;
  display: flex; align-items: center; gap: 9px; font-family: inherit;
  transition: all .22s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(42, 25, 92, 0.28);
  letter-spacing: 0.1px;
}
.nr-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(42, 25, 92, 0.36);
}
.nr-save:active:not(:disabled) { transform: translateY(0); }
.nr-save:disabled {
  background: #CBD5E1;
  color: #64748B;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.75;
  transform: none;
}

@keyframes nrFadeSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.nr-card, .nr-rp-card, .nr-stepper {
  animation: nrFadeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.nr-inp.is-valid, .nr-sel.is-valid, .nr-ph.is-valid {
  border-color: #10B981;
}
.nr-inp.is-invalid, .nr-sel.is-invalid, .nr-ph.is-invalid {
  border-color: #EF4444;
  background: #FEF2F2;
}
.nr-err-msg {
  font-size: 11px;
  color: #EF4444;
  font-weight: 600;
  margin-top: 5px;
  animation: nrFadeSlideUp 0.2s ease both;
}

/* ═══════════════ MANUAL FORM ═══════════════ */
.nr-form { padding: 22px 26px; animation: nrFadeSlideUp 0.3s ease both; }
.nr-sec-hd {
  font-size: 14.5px; font-weight: 800; color: var(--ink);
  padding-bottom: 12px; border-bottom: 1.5px solid var(--line-soft);
  margin-bottom: 18px; letter-spacing: -0.2px;
  display: flex; align-items: center; gap: 9px;
}
.nr-sec-hd::before {
  content: ''; width: 3px; height: 16px;
  background: linear-gradient(180deg, var(--brand), var(--brand-600));
  border-radius: 2px;
}
.nr-row { display: grid; gap: 18px; margin-bottom: 18px; }
.nr-row-3 { grid-template-columns: 1fr 1fr 1fr; }
.nr-row-2 { grid-template-columns: 1fr 1fr; }

.nr-fld label {
  display: block; font-size: 12px; font-weight: 700;
  color: var(--ink-mid); margin-bottom: 7px;
  letter-spacing: 0.1px;
}
.nr-fld .req { color: var(--red); margin-left: 2px; font-weight: 800; }
.nr-fld .opt { color: var(--ink-faint); font-size: 11px; font-weight: 500; margin-left: 4px; }

.nr-inp {
  width: 100%; padding: 11px 14px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 13px; color: var(--ink);
  font-family: inherit; outline: none;
  transition: all .18s ease; background: #fff;
  box-sizing: border-box; font-weight: 500;
}
.nr-inp::placeholder { color: var(--ink-faint); font-weight: 400; }
.nr-inp:hover:not(:disabled) { border-color: #D8DCE4; }
.nr-inp:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(42, 25, 92, 0.08);
  background: #FEFEFF;
}
.nr-inp:disabled {
  background: var(--line-soft); color: var(--ink-lo);
  cursor: not-allowed;
}

.nr-sel {
  width: 100%; padding: 11px 14px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 13px; color: var(--ink);
  font-family: inherit; outline: none;
  transition: all .18s ease; background: #fff;
  cursor: pointer; font-weight: 500;
  -webkit-appearance: none; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8DA3' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 14px center;
  padding-right: 38px; box-sizing: border-box;
}
.nr-sel:hover:not(:disabled) { border-color: #D8DCE4; }
.nr-sel:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(42, 25, 92, 0.08);
}
.nr-sel:disabled { background: var(--line-soft); color: var(--ink-lo); cursor: not-allowed; }

.nr-ph {
  display: flex; border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  overflow: hidden; background: #fff;
  transition: all .18s ease;
}
.nr-ph:hover { border-color: #D8DCE4; }
.nr-ph:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(42, 25, 92, 0.08);
}
.nr-ph-pre {
  padding: 11px 12px; background: var(--line-soft);
  border-right: 1.5px solid var(--line);
  font-size: 13px; font-weight: 700; color: var(--ink-mid);
  display: flex; align-items: center; gap: 5px; white-space: nowrap; flex-shrink: 0;
}
.nr-ph input {
  flex: 1; padding: 11px 14px; border: none; outline: none;
  font-size: 13px; font-family: inherit; background: transparent;
  min-width: 0; font-weight: 500; color: var(--ink);
}
.nr-ph input::placeholder { color: var(--ink-faint); font-weight: 400; }

.nr-inp-wrap { position: relative; }
.nr-inp-wrap .nr-inp { padding-right: 40px; }
.nr-inp-wrap-ic {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: var(--ink-lo); pointer-events: none; display: flex;
}

.nr-form-note {
  display: flex; align-items: flex-start; gap: 11px;
  background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
  border: 1px solid var(--sky-line);
  border-radius: var(--radius-sm);
  padding: 14px 18px; margin-top: 8px;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.05);
}
.nr-form-note-t { font-size: 13px; color: #1E40AF; line-height: 1.55; font-weight: 500; }

/* ═══════════════ RIGHT PANEL ═══════════════ */
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

/* ═══ KYC PROGRESS LIST ═══ */
.nr-prog-list { padding: 8px 0; }
.nr-prog-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 20px; position: relative;
}
.nr-prog-row:not(:last-child)::after {
  content: ''; position: absolute;
  left: 31px; top: 40px;
  width: 2px; height: calc(100% - 18px);
  background: var(--line); border-radius: 1px;
}
.nr-prog-row.act::after {
  background: linear-gradient(180deg, var(--brand) 0%, var(--brand-200) 100%);
}
.nr-prog-dot {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11.5px; font-weight: 800; flex-shrink: 0;
  transition: all .2s ease;
}
.nr-prog-dot.active {
  background: linear-gradient(135deg, var(--brand), var(--brand-600));
  color: #fff; box-shadow: 0 3px 10px rgba(42, 25, 92, 0.3);
}
.nr-prog-dot.done { background: var(--green); color: #fff; box-shadow: 0 3px 10px rgba(16, 185, 129, 0.28); }
.nr-prog-dot.pend { background: #fff; color: var(--ink-faint); border: 2px solid var(--line); }
.nr-prog-name { font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 3px; }
.nr-prog-name.pend { color: var(--ink-lo); font-weight: 600; }
.nr-prog-sub { font-size: 11.5px; margin-top: 2px; font-weight: 500; }
.nr-prog-sub.active-s { color: var(--brand); font-weight: 700; }
.nr-prog-sub.pend-s   { color: var(--ink-faint); }

/* ═══ WHY KYC ═══ */
.nr-why-list { padding: 10px 0 6px; }
.nr-why-row {
  display: flex; align-items: center; gap: 11px;
  padding: 8px 20px; font-size: 12.5px; color: var(--ink-mid);
  font-weight: 500; line-height: 1.4;
}
.nr-why-ic { color: var(--brand); display: flex; align-items: center; flex-shrink: 0; }

/* ═══ IMPORTANT NOTES ═══ */
.nr-imp-body { padding: 14px 20px 16px; }
.nr-imp-item {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 12.5px; color: #B45309; margin-bottom: 8px; line-height: 1.5;
  font-weight: 500;
}
.nr-imp-item:last-child { margin-bottom: 0; }

/* ═══ NEED HELP ═══ */
.nr-help-body { padding: 16px 20px 18px; }
.nr-help-sub { font-size: 12.5px; color: var(--ink-lo); margin-bottom: 12px; line-height: 1.5; }
.nr-help-btn {
  width: 100%; padding: 11px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%);
  color: #fff; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 800;
  cursor: pointer; border: none; font-family: inherit;
  transition: all .18s ease;
  box-shadow: 0 4px 12px rgba(42, 25, 92, 0.25);
}
.nr-help-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(42, 25, 92, 0.32);
}
`;

/* ── icons ── */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 as number, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const SV = ({ s = 14, children, ...p }: { s?: number; children: React.ReactNode } & React.SVGProps<SVGSVGElement>) => (
  <svg width={s} height={s} viewBox="0 0 24 24" {...S} {...p}>{children}</svg>
);

const ILeft = () => <SV s={13}><polyline points="15 18 9 12 15 6" /></SV>;
const IRight = () => <SV s={13}><polyline points="9 18 15 12 9 6" /></SV>;
const ICheck = ({ s = 13 }: { s?: number }) => <SV s={s}><polyline points="20 6 9 17 4 12" /></SV>;
const IShield = () => <SV s={15}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></SV>;
const IHead = () => <SV s={15}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></SV>;
const IInfo = ({ s = 14 }: { s?: number }) => <SV s={s}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></SV>;
const IClock = ({ s = 14 }: { s?: number }) => <SV s={s}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></SV>;
const ICal = ({ s = 14 }: { s?: number }) => <SV s={s}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></SV>;
const IArr = ({ s = 12 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IScan = () => <SV s={14}><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="13" y2="14" /></SV>;
const ICircle = () => <SV s={12}><circle cx="12" cy="12" r="10" /></SV>;

/* ── stepper data ── */
const STEPS = [
  { n: 1, label: 'KYC Verification', stat: 'In Progress', active: true },
  { n: 2, label: 'Rental Details', stat: 'Pending', active: false },
  { n: 3, label: 'Payment & Charges', stat: 'Pending', active: false },
  { n: 4, label: 'Documents', stat: 'Pending', active: false },
  { n: 5, label: 'Review & Confirm', stat: 'Pending', active: false },
];

/* ── DigiLocker illustration ── */
const DigiIllus = () => (
  <div className="nr-digi-illus">
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#2a195c', marginBottom: 4, letterSpacing: 0.2 }}>
        Fetching documents…
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {[0, 1].map(i => (
          <div key={i} className="nr-doc">
            <div className="nr-doc-hd">
              <div style={{ width: 14, height: 9, background: 'rgba(255,255,255,.5)', borderRadius: 2 }} />
            </div>
            <div className="nr-doc-bd">
              <img src="/assets/aadhar.jpg" alt="Aadhaar" className="nr-doc-photo" />
              {[0, 1, 2].map(j => <div key={j} className="nr-doc-ln" style={{ width: j === 2 ? '55%' : '88%' }} />)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 4, fontWeight: 500 }}>
        Aadhaar &amp; Driving License
      </div>
    </div>
    <div className="nr-digi-logo-badge">
      <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#1B4FBB" />
        <text x="5" y="33" fontFamily="Arial Black,sans-serif" fontSize="20" fontWeight="900" fill="#fff">Di</text>
        <circle cx="40" cy="14" r="8" fill="#F0B429" />
        <text x="35.5" y="18.5" fontFamily="Arial,sans-serif" fontSize="9" fontWeight="700" fill="#fff">gi</text>
      </svg>
    </div>
  </div>
);

/* ── Manual form ── */
function ManualForm({
  formData,
  setFormData,
  mobileRegistered,
  setMobileRegistered,
  touched,
  setTouched,
}: {
  formData: any;
  setFormData: (fn: any) => void;
  mobileRegistered: any;
  setMobileRegistered: (val: any) => void;
  touched: Record<string, boolean>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const router = useRouter();
  const chevSvg = (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8A8DA3" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  const sameAsPresent = Boolean(formData.sameAsPresent);

  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: string, value: any) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: value };
      if (prev.sameAsPresent) {
        if (field === 'address1') updated.permAddress1 = value;
        if (field === 'address2') updated.permAddress2 = value;
        if (field === 'city') updated.permCity = value;
        if (field === 'state') updated.permState = value;
        if (field === 'pincode') updated.permPincode = value;
      }
      return updated;
    });

    if (field === 'mobile') {
      const clean = value.replace(/\D/g, '');
      if (clean.length === 10) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        fetch(`${apiUrl}/renters/check-mobile/${clean}`)
          .then(res => res.json())
          .then(res => {
            if (res && res.is_registered) {
              setMobileRegistered(res.renter);
            } else {
              setMobileRegistered(null);
            }
          }).catch(() => {});
      } else {
        setMobileRegistered(null);
      }
    }
  };

  const handleSameAsPresentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormData((prev: any) => ({
      ...prev,
      sameAsPresent: checked,
      permAddress1: checked ? (prev.address1 || '') : prev.permAddress1,
      permAddress2: checked ? (prev.address2 || '') : prev.permAddress2,
      permCity: checked ? (prev.city || '') : prev.permCity,
      permState: checked ? (prev.state || '') : prev.permState,
      permPincode: checked ? (prev.pincode || '') : prev.permPincode
    }));
  };

  const getAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 0;
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = getAge(formData.dob);
  const isUnderage = Boolean(formData.dob) && currentAge < 16;

  return (
    <div className="nr-form">
      {mobileRegistered && (
        <div style={{
          background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
          border: '1.5px solid #FCA5A5',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
        }}>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚠️ Rider Already Registered!
            </div>
            <div style={{ fontSize: '12.5px', color: '#B91C1C', marginTop: '3px', lineHeight: 1.5 }}>
              Mobile number <strong>+91 {formData.mobile}</strong> is registered under <strong>{mobileRegistered.rider_name}</strong> with an active subscription.
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/retain-rider')}
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
              color: '#FFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              letterSpacing: '0.1px'
            }}
          >
            Fill Retain Rider Form ›
          </button>
        </div>
      )}

      <div className="nr-sec-hd">1. Personal Details</div>
      <div className="nr-row nr-row-3">
        <div className="nr-fld">
          <label>Full Name<span className="req"> *</span></label>
          <input
            className={`nr-inp ${(formData.fullName || '').trim().length >= 2 ? 'is-valid' : touched.fullName ? 'is-invalid' : ''}`}
            placeholder="Enter full name"
            value={formData.fullName || ''}
            onBlur={() => markTouched('fullName')}
            onChange={e => handleChange('fullName', e.target.value)}
          />
          {touched.fullName && (formData.fullName || '').trim().length < 2 && (
            <div className="nr-err-msg">Please enter rider&apos;s full name (min 2 chars).</div>
          )}
        </div>
        <div className="nr-fld">
          <label>Date of Birth (Minimum 16 Years)<span className="req"> *</span></label>
          <div className="nr-inp-wrap">
            <input
              type="date"
              className={`nr-inp ${formData.dob && !isUnderage ? 'is-valid' : (touched.dob || isUnderage) ? 'is-invalid' : ''}`}
              value={formData.dob || ''}
              onBlur={() => markTouched('dob')}
              onChange={e => handleChange('dob', e.target.value)}
            />
          </div>
          {isUnderage && (
            <div className="nr-err-msg">
              ⚠️ Rider must be at least 16 years old (Current: {currentAge} yrs).
            </div>
          )}
          {touched.dob && !formData.dob && (
            <div className="nr-err-msg">Date of birth is required.</div>
          )}
        </div>
        <div className="nr-fld">
          <label>Gender<span className="req"> *</span></label>
          <select
            className={`nr-sel ${formData.gender ? 'is-valid' : touched.gender ? 'is-invalid' : ''}`}
            value={formData.gender || ''}
            onBlur={() => markTouched('gender')}
            onChange={e => handleChange('gender', e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="nr-row nr-row-3">
        <div className="nr-fld">
          <label>Mobile Number<span className="req"> *</span></label>
          <div className={`nr-ph ${(formData.mobile || '').length === 10 && !mobileRegistered ? 'is-valid' : touched.mobile && (formData.mobile || '').length < 10 ? 'is-invalid' : ''}`}>
            <div className="nr-ph-pre"><span style={{ fontSize: 13 }}>🇮🇳</span>+91 {chevSvg}</div>
            <input
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              value={formData.mobile || ''}
              onBlur={() => markTouched('mobile')}
              onChange={e => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
            />
          </div>
          {touched.mobile && (formData.mobile || '').length < 10 && (
            <div className="nr-err-msg">Enter a valid 10-digit mobile number.</div>
          )}
        </div>
        <div className="nr-fld">
          <label>Email Address<span className="opt">(Optional)</span></label>
          <input
            className="nr-inp"
            placeholder="Enter email address"
            type="email"
            value={formData.email || ''}
            onChange={e => handleChange('email', e.target.value)}
          />
        </div>
        <div className="nr-fld">
          <label>Father / Guardian Name<span className="req"> *</span></label>
          <input
            className={`nr-inp ${(formData.fatherName || '').trim().length >= 2 ? 'is-valid' : touched.fatherName ? 'is-invalid' : ''}`}
            placeholder="Enter father / guardian name"
            value={formData.fatherName || ''}
            onBlur={() => markTouched('fatherName')}
            onChange={e => handleChange('fatherName', e.target.value)}
          />
          {touched.fatherName && (formData.fatherName || '').trim().length < 2 && (
            <div className="nr-err-msg">Father / guardian name is required.</div>
          )}
        </div>
      </div>

      <div className="nr-row nr-row-3">
        <div className="nr-fld">
          <label>Reference Name<span className="req"> *</span></label>
          <input
            className={`nr-inp ${(formData.refName || '').trim().length >= 2 ? 'is-valid' : touched.refName ? 'is-invalid' : ''}`}
            placeholder="Enter reference person name"
            value={formData.refName || ''}
            onBlur={() => markTouched('refName')}
            onChange={e => handleChange('refName', e.target.value)}
          />
          {touched.refName && (formData.refName || '').trim().length < 2 && (
            <div className="nr-err-msg">Reference person name is required.</div>
          )}
        </div>
        <div className="nr-fld">
          <label>Reference Mobile / Number<span className="req"> *</span></label>
          <div className={`nr-ph ${(formData.refNumber || '').length === 10 ? 'is-valid' : touched.refNumber ? 'is-invalid' : ''}`}>
            <div className="nr-ph-pre"><span style={{ fontSize: 13 }}>🇮🇳</span>+91 {chevSvg}</div>
            <input
              placeholder="Enter 10-digit reference number"
              maxLength={10}
              value={formData.refNumber || ''}
              onBlur={() => markTouched('refNumber')}
              onChange={e => handleChange('refNumber', e.target.value.replace(/\D/g, ''))}
            />
          </div>
          {touched.refNumber && (formData.refNumber || '').length < 10 && (
            <div className="nr-err-msg">10-digit reference contact number is required.</div>
          )}
        </div>
        <div className="nr-fld">
          <label>Emergency Contact<span className="req"> *</span></label>
          <div className={`nr-ph ${(formData.altMobile || '').length === 10 ? 'is-valid' : touched.altMobile ? 'is-invalid' : ''}`}>
            <div className="nr-ph-pre"><span style={{ fontSize: 13 }}>🇮🇳</span>+91 {chevSvg}</div>
            <input
              placeholder="Enter 10-digit emergency number"
              maxLength={10}
              value={formData.altMobile || ''}
              onBlur={() => markTouched('altMobile')}
              onChange={e => handleChange('altMobile', e.target.value.replace(/\D/g, ''))}
            />
          </div>
          {touched.altMobile && (formData.altMobile || '').length < 10 && (
            <div className="nr-err-msg">10-digit emergency contact number is required.</div>
          )}
        </div>
      </div>

      <div className="nr-sec-hd" style={{ marginTop: 14 }}>2. Present Address Details</div>
      <div className="nr-row nr-row-2">
        <div className="nr-fld">
          <label>Address Line 1<span className="req"> *</span></label>
          <input
            className={`nr-inp ${(formData.address1 || '').trim().length >= 3 ? 'is-valid' : touched.address1 ? 'is-invalid' : ''}`}
            placeholder="House / Flat / Building, Street"
            value={formData.address1 || ''}
            onBlur={() => markTouched('address1')}
            onChange={e => handleChange('address1', e.target.value)}
          />
          {touched.address1 && (formData.address1 || '').trim().length < 3 && (
            <div className="nr-err-msg">Present address line 1 is required.</div>
          )}
        </div>
        <div className="nr-fld">
          <label>Address Line 2<span className="opt">(Optional)</span></label>
          <input
            className="nr-inp"
            placeholder="Area / Landmark"
            value={formData.address2 || ''}
            onChange={e => handleChange('address2', e.target.value)}
          />
        </div>
      </div>
      <div className="nr-row nr-row-3">
        <div className="nr-fld">
          <label>City<span className="req"> *</span></label>
          <input
            className={`nr-inp ${(formData.city || '').trim().length >= 2 ? 'is-valid' : touched.city ? 'is-invalid' : ''}`}
            placeholder="Enter present city"
            value={formData.city || ''}
            onBlur={() => markTouched('city')}
            onChange={e => handleChange('city', e.target.value)}
          />
        </div>
        <div className="nr-fld">
          <label>State<span className="req"> *</span></label>
          <select
            className={`nr-sel ${formData.state ? 'is-valid' : touched.state ? 'is-invalid' : ''}`}
            value={formData.state || ''}
            onBlur={() => markTouched('state')}
            onChange={e => handleChange('state', e.target.value)}
          >
            <option value="">Select state</option>
            {['Gujarat', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Rajasthan', 'West Bengal', 'Telangana', 'Kerala'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="nr-fld">
          <label>Pincode<span className="req"> *</span></label>
          <input
            className={`nr-inp ${(formData.pincode || '').length === 6 ? 'is-valid' : touched.pincode ? 'is-invalid' : ''}`}
            placeholder="Enter 6 digit pincode"
            maxLength={6}
            value={formData.pincode || ''}
            onBlur={() => markTouched('pincode')}
            onChange={e => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
          />
          {touched.pincode && (formData.pincode || '').length < 6 && (
            <div className="nr-err-msg">6-digit pincode is required.</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 }}>
        <div className="nr-sec-hd" style={{ margin: 0, border: 0, paddingBottom: 0 }}>3. Permanent Address Details</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#2A195C', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={sameAsPresent}
            onChange={handleSameAsPresentToggle}
            style={{ width: 16, height: 16, accentColor: '#2A195C' }}
          />
          Same as Present Address
        </label>
      </div>

      <div className="nr-row nr-row-2">
        <div className="nr-fld">
          <label>Address Line 1<span className="req"> *</span></label>
          <input
            className="nr-inp"
            placeholder="Permanent House / Flat, Street"
            value={sameAsPresent ? (formData.address1 || '') : (formData.permAddress1 || '')}
            disabled={sameAsPresent}
            onChange={e => handleChange('permAddress1', e.target.value)}
          />
        </div>
        <div className="nr-fld">
          <label>Address Line 2<span className="opt">(Optional)</span></label>
          <input
            className="nr-inp"
            placeholder="Permanent Area / Landmark"
            value={sameAsPresent ? (formData.address2 || '') : (formData.permAddress2 || '')}
            disabled={sameAsPresent}
            onChange={e => handleChange('permAddress2', e.target.value)}
          />
        </div>
      </div>
      <div className="nr-row nr-row-3">
        <div className="nr-fld">
          <label>City<span className="req"> *</span></label>
          <input
            className="nr-inp"
            placeholder="Enter permanent city"
            value={sameAsPresent ? (formData.city || '') : (formData.permCity || '')}
            disabled={sameAsPresent}
            onChange={e => handleChange('permCity', e.target.value)}
          />
        </div>
        <div className="nr-fld">
          <label>State<span className="req"> *</span></label>
          <select
            className="nr-sel"
            value={sameAsPresent ? (formData.state || '') : (formData.permState || '')}
            disabled={sameAsPresent}
            onChange={e => handleChange('permState', e.target.value)}
          >
            <option value="">Select state</option>
            {['Gujarat', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Rajasthan', 'West Bengal', 'Telangana', 'Kerala'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="nr-fld">
          <label>Pincode<span className="req"> *</span></label>
          <input
            className="nr-inp"
            placeholder="Enter 6 digit pincode"
            maxLength={6}
            value={sameAsPresent ? (formData.pincode || '') : (formData.permPincode || '')}
            disabled={sameAsPresent}
            onChange={e => handleChange('permPincode', e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      <div className="nr-sec-hd" style={{ marginTop: 14 }}>4. Identity Proof Details</div>
      <div className="nr-row nr-row-3">
        <div className="nr-fld">
          <label>Identity Type<span className="req"> *</span></label>
          <select
            className="nr-sel is-valid"
            value={formData.idType || 'Aadhaar Card'}
            onChange={e => handleChange('idType', e.target.value)}
          >
            <option value="Aadhaar Card">Aadhaar Card</option>
            <option value="Driving License">Driving License</option>
            <option value="Voter ID">Voter ID</option>
            <option value="Passport">Passport</option>
          </select>
        </div>
        <div className="nr-fld">
          <label>Identity Number<span className="req"> *</span></label>
          <input
            className={`nr-inp ${(formData.idNumber || '').trim().length >= 4 ? 'is-valid' : touched.idNumber ? 'is-invalid' : ''}`}
            placeholder={formData.idType === 'Aadhaar Card' ? 'Enter 12-digit Aadhaar number' : 'Enter identity number'}
            value={formData.idNumber || ''}
            onBlur={() => markTouched('idNumber')}
            onChange={e => handleChange('idNumber', e.target.value)}
          />
          {touched.idNumber && (formData.idNumber || '').trim().length < 4 && (
            <div className="nr-err-msg">Identity document number is required.</div>
          )}
        </div>
      </div>

      <div className="nr-form-note">
        <span style={{ color: '#2563EB', display: 'flex', flexShrink: 0 }}><IInfo s={14} /></span>
        <span className="nr-form-note-t">Documents can be uploaded in Step 4. All required (*) fields must be filled to unlock Step 2.</span>
      </div>
    </div>
  );
}

/* ── Right Panel ── */
const PROG = [
  { n: 1, label: 'KYC Verification', sub: 'In Progress', active: true },
  { n: 2, label: 'Rental Details', sub: 'Pending', active: false },
  { n: 3, label: 'Payment & Charges', sub: 'Pending', active: false },
  { n: 4, label: 'Documents', sub: 'Pending', active: false },
  { n: 5, label: 'Review & Confirm', sub: 'Pending', active: false },
];

function RightPanel({ mode, completionPct, missingFields }: { mode: 'select' | 'manual'; completionPct: number; missingFields: string[] }) {
  return (
    <div className="nr-rp">
      <div className="nr-rp-card">
        <div className="nr-rp-hdr" style={{ justifyContent: 'space-between' }}>
          <div className="nr-rp-title">KYC Progress</div>
          <span style={{
            fontSize: '11.5px',
            fontWeight: 800,
            color: completionPct === 100 ? '#059669' : '#2a195c',
            background: completionPct === 100 ? '#ECFDF5' : '#F5F3FF',
            padding: '3px 9px',
            borderRadius: '999px'
          }}>
            {completionPct}% Complete
          </span>
        </div>
        <div style={{ padding: '12px 20px 4px' }}>
          <div style={{ height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${completionPct}%`,
              background: completionPct === 100
                ? 'linear-gradient(90deg, #10B981, #059669)'
                : 'linear-gradient(90deg, #2a195c, #4338CA)',
              borderRadius: 999,
              transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
          {missingFields.length > 0 && (
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: 8, lineHeight: 1.45 }}>
              <strong style={{ color: '#0F172A' }}>Required to continue:</strong> {missingFields.slice(0, 4).join(', ')}{missingFields.length > 4 ? ` +${missingFields.length - 4} more` : ''}
            </div>
          )}
        </div>
        <div className="nr-prog-list">
          {PROG.map((p, i) => (
            <div key={p.n} className={`nr-prog-row ${p.active && i < PROG.length - 1 ? 'act' : ''}`}>
              <div className={`nr-prog-dot ${p.active ? (completionPct === 100 ? 'done' : 'active') : 'pend'}`}>
                {p.active && completionPct === 100 ? <ICheck s={12} /> : p.n}
              </div>
              <div>
                <div className={`nr-prog-name ${!p.active ? 'pend' : ''}`}>{p.label}</div>
                <div className={`nr-prog-sub ${p.active ? 'active-s' : 'pend-s'}`}>
                  {p.active ? (completionPct === 100 ? 'Ready to Continue' : 'In Progress') : p.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {mode === 'manual' && (
        <div className="nr-rp-card">
          <div className="nr-rp-hdr">
            <span className="nr-rp-hdr-ic" style={{ color: '#D97706' }}><IInfo s={14} /></span>
            <div className="nr-rp-title">Important Notes</div>
          </div>
          <div className="nr-imp-body">
            {[
              'Please enter details exactly as per Aadhaar.',
              'Incorrect details may lead to verification failure.',
              'You can edit details before final submission.',
            ].map((n, i) => (
              <div key={i} className="nr-imp-item">
                <span style={{ color: '#D97706', fontWeight: 700, marginTop: 1 }}>•</span>
                <span>{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: '#2a195c' }}><IShield /></span>
          <div className="nr-rp-title">Why KYC is Important?</div>
        </div>
        <div className="nr-why-list">
          {[
            'Ensures rider identity authenticity',
            'Helps prevent fraud and misuse',
            'Complies with government regulations',
            'Ensures a safe experience for everyone',
          ].map(w => (
            <div key={w} className="nr-why-row">
              <span className="nr-why-ic"><ICheck s={14} /></span>
              {w}
            </div>
          ))}
        </div>
      </div>

      <div className="nr-rp-card">
        <div className="nr-rp-hdr">
          <span className="nr-rp-hdr-ic" style={{ color: '#2a195c' }}><IHead /></span>
          <div className="nr-rp-title">Need Help?</div>
        </div>
        <div className="nr-help-body">
          <div className="nr-help-sub">Facing issues with KYC?</div>
          <button className="nr-help-btn">Contact Support</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function NewRiderPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'select' | 'manual'>('manual');
  const [method, setMethod] = useState<'digi' | 'manual'>('manual');
  const [mobileRegistered, setMobileRegistered] = useState<any>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<any>(() => {
    const defaults = {
      fullName: '',
      dob: '2000-01-01',
      gender: 'Male',
      mobile: '',
      email: '',
      fatherName: '',
      refName: '',
      refNumber: '',
      altMobile: '',
      address1: '',
      address2: '',
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: '',
      sameAsPresent: true,
      permAddress1: '',
      permAddress2: '',
      permCity: 'Vadodara',
      permState: 'Gujarat',
      permPincode: '',
      idType: 'Aadhaar Card',
      idNumber: ''
    };
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('evegah_new_ride_kyc') || '{}');
        if (saved && typeof saved === 'object') {
          if (saved.fullName === 'Akash Verma') {
            localStorage.removeItem('evegah_new_ride_kyc');
            return defaults;
          }
          const validDob = saved.dob && /^\d{4}-\d{2}-\d{2}$/.test(saved.dob) ? saved.dob : defaults.dob;
          return { ...defaults, ...saved, dob: validDob };
        }
      } catch (_) {}
    }
    return defaults;
  });

  // Automatically persist KYC form changes to localStorage so downstream steps always have actual rider details
  useEffect(() => {
    try {
      localStorage.setItem('evegah_new_ride_kyc', JSON.stringify({
        ...formData,
        verified: mode === 'select' ? 'Verified (DigiLocker)' : 'Manual Entry'
      }));
    } catch (_) {}
  }, [formData, mode]);

  const goManual = () => { setMethod('manual'); setMode('manual'); };

  // Calculate age & required field completion
  const getAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 0;
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = getAge(formData.dob);
  const checks = [
    { label: 'Full Name', ok: (formData.fullName || '').trim().length >= 2 },
    { label: 'Date of Birth (16+ yrs)', ok: Boolean(formData.dob) && age >= 16 },
    { label: 'Gender', ok: Boolean(formData.gender) },
    { label: '10-digit Mobile Number', ok: (formData.mobile || '').replace(/\D/g, '').length === 10 && !mobileRegistered },
    { label: 'Father / Guardian Name', ok: (formData.fatherName || '').trim().length >= 2 },
    { label: 'Reference Name', ok: (formData.refName || '').trim().length >= 2 },
    { label: 'Reference Mobile', ok: (formData.refNumber || '').replace(/\D/g, '').length === 10 },
    { label: 'Emergency Contact', ok: (formData.altMobile || '').replace(/\D/g, '').length === 10 },
    { label: 'Present Address', ok: (formData.address1 || '').trim().length >= 3 },
    { label: 'City & State', ok: (formData.city || '').trim().length >= 2 && Boolean(formData.state) },
    { label: '6-digit Pincode', ok: (formData.pincode || '').replace(/\D/g, '').length === 6 },
    {
      label: 'Permanent Address',
      ok: Boolean(formData.sameAsPresent) || (
        (formData.permAddress1 || '').trim().length >= 3 &&
        (formData.permCity || '').trim().length >= 2 &&
        Boolean(formData.permState) &&
        (formData.permPincode || '').replace(/\D/g, '').length === 6
      )
    },
    { label: 'Identity Number', ok: (formData.idNumber || '').trim().length >= 4 },
  ];

  const passedCount = checks.filter(c => c.ok).length;
  const completionPct = Math.round((passedCount / checks.length) * 100);
  const missingFields = checks.filter(c => !c.ok).map(c => c.label);
  const isStep1Valid = missingFields.length === 0;

  const handleNextStep = () => {
    if (!isStep1Valid) {
      setMode('manual');
      setTouched({
        fullName: true,
        dob: true,
        gender: true,
        mobile: true,
        fatherName: true,
        refName: true,
        refNumber: true,
        altMobile: true,
        address1: true,
        city: true,
        state: true,
        pincode: true,
        idNumber: true,
      });
      return;
    }

    localStorage.setItem('evegah_new_ride_kyc', JSON.stringify({
      ...formData,
      permAddress1: formData.sameAsPresent ? formData.address1 : formData.permAddress1,
      permAddress2: formData.sameAsPresent ? formData.address2 : formData.permAddress2,
      permCity: formData.sameAsPresent ? formData.city : formData.permCity,
      permState: formData.sameAsPresent ? formData.state : formData.permState,
      permPincode: formData.sameAsPresent ? formData.pincode : formData.permPincode,
      verified: mode === 'select' ? 'Verified (DigiLocker)' : 'Manual Entry'
    }));
    router.push('/new-rider/rental');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="nr-shell">
        <Sidebar activePath="/new-rider" />

        <div className="nr-main">
          <TopBar />

          <div className="nr-page">

            <div className="nr-bc">
              <Link href="/"><ILeft /> Home</Link>
              <span className="nr-bc-sep">›</span>
              <a href="#">Rides / Rentals</a>
              <span className="nr-bc-sep">›</span>
              <span className="nr-bc-cur">New Ride Registration</span>
            </div>

            <div className="nr-title-row">
              <div>
                <h1 className="nr-h1">New Ride Registration</h1>
                <p className="nr-sub">Register a new rider and assign EV assets</p>
              </div>
              <Link href="/renters" className="nr-back-btn"><ILeft /> Back to Rides</Link>
            </div>

            <div className="nr-stepper">
              {STEPS.map((s, i) => (
                <div key={s.n} className="nr-step-wrap">
                  <div className="nr-step">
                    <div className={`nr-step-num ${s.active ? (isStep1Valid ? 'done' : 'active') : 'pend'}`}>
                      {s.active && isStep1Valid ? <ICheck s={14} /> : s.n}
                    </div>
                    <div>
                      <div className={`nr-step-label ${!s.active ? 'pend' : ''}`}>{s.label}</div>
                      <div className={`nr-step-stat ${s.active ? 'active-s' : 'pend-s'}`}>
                        {s.active ? (isStep1Valid ? 'Completed' : `${completionPct}% Complete`) : s.stat}
                      </div>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && <div className="nr-step-line" />}
                </div>
              ))}
            </div>

            <div className="nr-layout">

              <div>
                <div className="nr-card">

                  <div className="nr-card-hdr">
                    <div>
                      <h2>Step 1: KYC Verification</h2>
                      <p>
                        {mode === 'manual'
                          ? 'Fill in the rider details manually. Make sure the information matches the original documents.'
                          : 'Verify rider identity to ensure a safe and compliant onboarding.'}
                      </p>
                    </div>
                    <div className="nr-pow-row">
                      <button
                        type="button"
                        onClick={() => setMode(mode === 'manual' ? 'select' : 'manual')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #DDD6FE',
                          background: '#F5F3FF',
                          color: '#2A195C',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {mode === 'manual' ? 'Switch to DigiLocker' : 'Enter Details Manually'}
                      </button>
                      {mode === 'manual'
                        ? <div className="nr-manual-tag"><IClock s={12} /> Manual Entry</div>
                        : <div className="nr-verified-tag"><ICheck s={12} /> Verified</div>
                      }
                    </div>
                  </div>

                  {mode === 'select' ? (
                    <>
                      <div className="nr-green-banner">
                        <div className="nr-green-ic"><ICheck s={12} /></div>
                        <div>
                          <div className="nr-green-t">Use DigiLocker to verify instantly (Recommended)</div>
                          <div className="nr-green-s">Secure, fast and paperless verification. Details are auto-fetched and cannot be edited.</div>
                        </div>
                      </div>

                      <div className="nr-methods">

                        <div className={`nr-mc ${method === 'digi' ? 'sel' : ''}`} onClick={() => setMethod('digi')}>
                          <div className="nr-mc-top">
                            <div className={`nr-radio ${method === 'digi' ? 'on' : ''}`}>
                              {method === 'digi' && <div className="nr-radio-dot" />}
                            </div>
                            <span className="nr-mc-title">Verify Now with DigiLocker</span>
                            <span className="nr-rec-badge">Recommended</span>
                          </div>
                          <div className="nr-bullets">
                            {['Auto fetch Aadhar and Driving License', 'Secure & government verified', 'Faster onboarding'].map(b => (
                              <div key={b} className="nr-bullet">
                                <span className="nr-bullet-ic" style={{ color: '#2a195c' }}><ICheck s={13} /></span>
                                {b}
                              </div>
                            ))}
                          </div>
                          <DigiIllus />
                          <button className="nr-btn-pri" type="button" onClick={e => { e.stopPropagation(); goManual(); }}>
                            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                              <rect width="48" height="48" rx="8" fill="rgba(255,255,255,.25)" />
                              <text x="5" y="33" fontFamily="Arial Black,sans-serif" fontSize="20" fontWeight="900" fill="#fff">D</text>
                            </svg>
                            Verify with DigiLocker
                          </button>
                          <div className="nr-mc-note">You will be redirected to DigiLocker to fetch your documents</div>
                        </div>

                        <div className={`nr-mc ${method === 'manual' ? 'sel' : ''}`} onClick={() => setMethod('manual')}>
                          <div className="nr-mc-top">
                            <div className={`nr-radio ${method === 'manual' ? 'on' : ''}`}>
                              {method === 'manual' && <div className="nr-radio-dot" />}
                            </div>
                            <span className="nr-mc-title">Enter Details Manually</span>
                          </div>
                          <p className="nr-mc-desc">Fill rider details and upload documents manually.</p>
                          <div className="nr-bullets">
                            {['Enter details manually', 'Upload documents', 'Verification will be done later'].map(b => (
                              <div key={b} className="nr-bullet">
                                <span className="nr-bullet-ic" style={{ color: '#9CA3AF' }}><ICircle /></span>
                                {b}
                              </div>
                            ))}
                          </div>
                          <button
                            className="nr-btn-out"
                            type="button"
                            onClick={e => { e.stopPropagation(); goManual(); }}
                          >
                            Enter Manually
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <ManualForm
                      formData={formData}
                      setFormData={setFormData}
                      mobileRegistered={mobileRegistered}
                      setMobileRegistered={setMobileRegistered}
                      touched={touched}
                      setTouched={setTouched}
                    />
                  )}
                </div>

                <div className="nr-footer-actions">
                  <button className="nr-cancel" type="button" onClick={() => router.push('/renters')}>Cancel</button>
                  <button
                    className="nr-save"
                    type="button"
                    disabled={!isStep1Valid}
                    onClick={handleNextStep}
                    title={!isStep1Valid ? `Complete required fields: ${missingFields.join(', ')}` : 'Save & Continue to Rental Details'}
                  >
                    Save &amp; Continue <IArr s={12} />
                  </button>
                </div>
              </div>

              <RightPanel mode={mode} completionPct={completionPct} missingFields={missingFields} />

            </div>
          </div>
        </div>
      </div>
    </>
  );
}