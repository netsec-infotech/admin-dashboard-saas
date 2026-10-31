"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import FranchiseOnboard from "./franchise/onboard/page";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { api } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AnimatedCount({ value }: { value: string | number }) {
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  useEffect(() => {
    const str = String(value);
    const numericMatch = str.match(/[\d.]+/g);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }
    const numericStr = numericMatch.join('');
    const target = parseFloat(numericStr);
    if (isNaN(target)) {
      setDisplayValue(value);
      return;
    }
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(start + easeProgress * (target - start));
      let formatted = String(current);
      if (str.includes('₹')) {
        formatted = '₹' + current.toLocaleString('en-IN');
      } else if (str.includes(',')) {
        formatted = current.toLocaleString('en-US');
      } else if (str.includes('%')) {
        formatted = current + '%';
      }
      setDisplayValue(formatted);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}</>;
}

/* ──────────────────────────────────────────────────────── */
/* ── UNIFIED 1000% SUPER ADMIN DASHBOARD DESIGN SYSTEM ── */
/* ──────────────────────────────────────────────────────── */
const SUPER_DESIGN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.ev-shell {
  display: flex;
  min-height: 100vh;
  background: #F8FAFC;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0F172A;
}

.ev-main {
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100% - 240px);
  min-width: 0;
}

.ev-body {
  padding: 20px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Metric KPI cards matching Active Ride Page Design */
.ar-stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px; }
.ar-stat-card {
  background: #fff;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,.02);
  box-sizing: border-box;
  transition: all .15s;
}
.ar-stat-card:hover {
  border-color: #CBD5E1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}
.ar-stat-ic {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ar-stat-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.ar-stat-lbl {
  font-size: 9.5px;
  color: #64748B;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}
.ar-stat-val {
  font-size: 19px;
  font-weight: 800;
  color: #0F172A;
  line-height: 1.2;
  margin-bottom: 2px;
  font-family: 'Outfit', sans-serif;
}
.ar-stat-trend {
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
}

/* Sub header Date selection & export */
.sa-sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sa-sub-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sa-sub-title {
  font-size: 18px;
  font-weight: 800;
  color: #0F172A;
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.02em;
}

.sa-sub-desc {
  font-size: 12px;
  color: #64748B;
  font-weight: 500;
}

.sa-sub-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sa-date-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.sa-date-box:hover {
  border-color: #6366F1;
}

.sa-export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #2A195C;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 4px 12px rgba(42, 25, 92, 0.25);
  text-decoration: none;
}

.sa-export-btn:hover {
  background: #1e1142;
  transform: translateY(-1px);
}

.sa-refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #fff;
  color: #2A195C;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.sa-refresh-btn:hover {
  border-color: #2A195C;
  background: #F8FAFC;
}

.sa-action-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fff;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #2A195C;
  text-decoration: none;
  transition: all 0.15s;
}

.sa-action-pill:hover {
  border-color: #2A195C;
  background: #F5F3FF;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(42, 25, 92, 0.08);
}

/* KPI Cards 5 column row */
.sa-kpi-row-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.sa-kpi-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.sa-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
  border-color: #CBD5E1;
}

.sa-kpi-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sa-kpi-card-lbl {
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.sa-kpi-card-ic {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sa-kpi-card-val {
  font-size: 24px;
  font-weight: 800;
  color: #0F172A;
  margin: 10px 0 4px;
  font-family: 'Outfit', sans-serif;
}

.sa-kpi-card-bot {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 600;
  color: #64748B;
}

.sa-kpi-card-trend-up {
  color: #10B981;
  display: flex;
  align-items: center;
  gap: 2px;
  font-weight: 700;
}

.sa-kpi-card-trend-dn {
  color: #EF4444;
  display: flex;
  align-items: center;
  gap: 2px;
  font-weight: 700;
}

/* Grids */
.sa-row-1-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
}

.sa-row-2-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.sa-row-3-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.8fr;
  gap: 16px;
}

.sa-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sa-card-hdr {
  padding: 14px 18px;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sa-card-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #0F172A;
  font-family: 'Outfit', sans-serif;
}

.sa-card-body {
  padding: 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sa-select-light {
  padding: 4px 8px;
  border: 1.5px solid #E2E8F0;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  outline: none;
  background: #fff;
  cursor: pointer;
}

/* Donut chart styles */
.sa-donut-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.sa-donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
}

.sa-donut-num {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  font-family: 'Outfit', sans-serif;
}

.sa-donut-lbl {
  font-size: 8px;
  color: #94A3B8;
  margin-top: 2px;
  font-weight: 700;
  text-transform: uppercase;
}

.sa-donut-legends {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin-top: 14px;
}

.sa-donut-leg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10.5px;
  color: #475569;
  border-bottom: 1px solid #F1F5F9;
  padding-bottom: 4px;
}

.sa-donut-leg-row:last-child {
  border-bottom: none;
}

.sa-donut-leg-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sa-donut-leg-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sa-donut-leg-val {
  font-weight: 700;
  color: #0F172A;
}

/* Rank lists */
.sa-rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sa-rank-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.sa-rank-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sa-rank-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
}

.sa-rank-name {
  font-weight: 600;
  color: #334155;
}

.sa-rank-val {
  font-weight: 700;
  color: #0F172A;
}

/* 6 Small KPIs Row */
.sa-kpi-row-6 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

/* Tables */
.sa-table {
  width: 100%;
  border-collapse: collapse;
}

.sa-table th {
  font-size: 9.5px;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  padding: 9px 12px;
  background: #F8FAFC;
  border-bottom: 1px solid #F1F5F9;
}

.sa-table td {
  padding: 10px 12px;
  font-size: 12px;
  border-bottom: 1px solid #F1F5F9;
  vertical-align: middle;
  color: #334155;
}

.sa-table tr:last-child td {
  border-bottom: none;
}

.sa-table tr:hover td {
  background: #F8FAFC;
}

.sa-link-all {
  font-size: 11px;
  font-weight: 700;
  color: #6366F1;
  text-decoration: none;
}

.sa-link-all:hover {
  text-decoration: underline;
}

/* Badges */
.sa-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 10.5px;
  font-weight: 700;
}

.sa-badge-green { background: #DCFCE7; color: #15803D; }
.sa-badge-blue { background: #DBEAFE; color: #1D4ED8; }
.sa-badge-orange { background: #FEF9C3; color: #A16207; }
.sa-badge-purple { background: #F3E8FF; color: #7E22CE; }
.sa-badge-red { background: #FEE2E2; color: #B91C1C; }

/* Role Switcher FAB */
.role-switcher-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%);
  color: #fff;
  border: 1.5px solid rgba(255,255,255,0.15);
  border-radius: 30px;
  padding: 11px 20px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 25px rgba(15, 23, 42, 0.35);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Outfit', sans-serif;
}

.role-switcher-fab:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 16px 30px rgba(99, 102, 241, 0.4);
  border-color: #6366F1;
}

.role-dropdown-panel {
  position: fixed;
  bottom: 75px;
  right: 24px;
  background: #fff;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 25px 35px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.04);
  z-index: 9999;
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.role-dropdown-header {
  font-size: 10px;
  font-weight: 800;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding-bottom: 6px;
  border-bottom: 1px solid #F1F5F9;
  margin-bottom: 2px;
}

.role-opt {
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  background: none;
  width: 100%;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-opt:hover {
  background: #EEF2FF;
  color: #6366F1;
}

.role-opt.act {
  background: #6366F1;
  color: #fff;
}

/* Floating AI Assistant Chatbox */
.ai-chat-fab {
  position: fixed;
  bottom: 24px;
  right: 230px;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 11px 20px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Outfit', sans-serif;
}

.ai-chat-fab:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 15px 30px rgba(99, 102, 241, 0.5);
}

.ai-chat-panel {
  position: fixed;
  bottom: 75px;
  right: 230px;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15);
  z-index: 9999;
  width: 360px;
  height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-chat-header { background: #0F172A; color: #fff; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
.ai-chat-title { font-size: 13.5px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 6px; font-family: 'Outfit', sans-serif; }
.ai-chat-actions { display: flex; align-items: center; gap: 8px; }
.ai-chat-btn-icon { background: none; border: none; color: #E2E8F0; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 50%; }
.ai-chat-btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }
.ai-chat-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; background: #F8FAFC; }
.ai-msg { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 12.5px; line-height: 1.4; font-weight: 500; word-break: break-word; }
.ai-msg-user { background: #6366f1; color: #fff; align-self: flex-end; border-bottom-right-radius: 2px; }
.ai-msg-bot { background: #fff; color: #1E293B; align-self: flex-start; border-bottom-left-radius: 2px; border: 1px solid #E2E8F0; }
.ai-msg-error { background: #FEF2F2; color: #EF4444; align-self: center; border: 1px solid #FEE2E2; text-align: center; }
.ai-chat-footer { padding: 12px; background: #fff; border-top: 1px solid #E2E8F0; display: flex; flex-direction: column; gap: 8px; }
.ai-chat-input-row { display: flex; gap: 8px; }
.ai-chat-inp { flex: 1; padding: 9px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; font-weight: 500; outline: none; }
.ai-chat-inp:focus { border-color: #6366f1; }
.ai-chat-send { padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 700; cursor: pointer; }
.ai-chat-quick-tags { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
.ai-chat-tag { font-size: 10.5px; font-weight: 700; background: #EEF2FF; color: #6366f1; border: 1px solid #E0E7FF; padding: 4px 8px; border-radius: 15px; cursor: pointer; white-space: nowrap; }

/* Progress bar */
.sa-prog-bar-bg {
  height: 6px;
  background: #E2E8F0;
  border-radius: 3px;
  overflow: hidden;
}

/* ── Premium Mascot Banner ── */
.ev-mascot-banner {
  background: linear-gradient(135deg, #2A195C 0%, #1e1142 100%);
  border-radius: 16px;
  padding: 32px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px -10px rgba(42, 25, 92, 0.4);
}
.ev-mascot-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  pointer-events: none;
}
.ev-mascot-content {
  color: #fff;
  z-index: 2;
  max-width: 60%;
  animation: rowFadeIn 0.5s ease-out forwards;
}
.ev-mascot-title {
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}
.ev-mascot-desc {
  font-size: 15px;
  color: #cbd5e1;
  font-weight: 400;
  line-height: 1.5;
}
.ev-mascot-image-container {
  position: absolute;
  right: 20px;
  bottom: -20px;
  width: 320px;
  height: auto;
  z-index: 2;
  pointer-events: none;
}
.ev-mascot-image {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 20px 20px rgba(0,0,0,0.3));
  animation: mascotFloat 6s ease-in-out infinite;
  transform-origin: bottom center;
}
@keyframes mascotFloat {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

.sa-prog-bar-fill {
  height: 100%;
  background: #6366F1;
  border-radius: 3px;
}
`;


function MascotBanner({ userName, roleName }: { userName: string, roleName: string }) {
  return (
    <div className="ev-mascot-banner">
      <div className="ev-mascot-content">
        <h2 className="ev-mascot-title">Welcome back, {userName}! 👋</h2>
        <p className="ev-mascot-desc">Here is your {roleName} overview for today. Your platform is operating smoothly.</p>
        <button className="ev-btn-primary" style={{marginTop: "12px", background: "#10B981", borderColor: "#10B981"}}>View Live Fleet</button>
      </div>
      <div className="ev-mascot-image-container">
        <img src="/assets/scooter_hero_scene.png" alt="Evegah Mascot" className="ev-mascot-image" />
      </div>
    </div>
  );
}

export default function DynamicDashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const router = useRouter();

  // Chatbox State
  const [showChat, setShowChat] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'bot', text: 'Hello! I am your Evegah AI Assistant. I can help you automate dashboard operations like adding vehicles, assigning zones, and configuring pricing.' }
  ]);
  const [isSending, setIsSending] = useState(false);

  const loadRole = () => {
    const storedRole = localStorage.getItem("evegah_role");
    if (!storedRole) {
      router.push("/login");
      return;
    }
    setRole(storedRole);
  };

  useEffect(() => {
    loadRole();
    if (typeof window !== 'undefined') {
      window.addEventListener('evegah_role_changed', loadRole);
      return () => window.removeEventListener('evegah_role_changed', loadRole);
    }
  }, [router]);

  useEffect(() => {
    const savedKey = localStorage.getItem('evegah_gemini_key') || '';
    setGeminiKey(savedKey);
  }, []);

  const handleSwitchRole = (newRoleKey: string, newRoleLabel: string) => {
    localStorage.setItem("evegah_role", newRoleKey);
    localStorage.setItem("evegah_user_role_name", newRoleLabel);
    
    // Set role permissions for sidebar & route access
    const rolePermissionsMap: Record<string, any> = {
      super_admin: null,
      platform_admin: null,
      employee: { Dashboard: { access: true }, Registrations: { access: true }, Vehicles: { access: true }, Battery: { access: true }, Attendance: { access: true }, Payments: { access: true } },
      zone_admin: { Dashboard: { access: true }, Registrations: { access: true }, Vehicles: { access: true }, Riders: { access: true }, 'Zone Management': { access: true }, Maintenance: { access: true }, Reports: { access: true }, Alerts: { access: true }, Attendance: { access: true } },
      operations_manager: { Dashboard: { access: true }, Registrations: { access: true }, Vehicles: { access: true }, Battery: { access: true }, Maintenance: { access: true }, 'IoT Devices': { access: true }, Reports: { access: true }, Alerts: { access: true }, Attendance: { access: true } },
      franchise_manager: { Dashboard: { access: true }, Franchise: { access: true }, Riders: { access: true }, Vehicles: { access: true }, Payments: { access: true }, Reports: { access: true }, Settings: { access: true } },
      battery_technician: { Dashboard: { access: true }, Battery: { access: true }, 'IoT Devices': { access: true }, Maintenance: { access: true }, Alerts: { access: true } },
      support_executive: { Dashboard: { access: true }, Registrations: { access: true }, Riders: { access: true }, Alerts: { access: true }, Announcements: { access: true } },
      fleet_manager: { Dashboard: { access: true }, Vehicles: { access: true }, Maintenance: { access: true }, 'IoT Devices': { access: true }, Reports: { access: true } },
      field_technician: { Dashboard: { access: true }, Battery: { access: true }, Vehicles: { access: true }, Maintenance: { access: true } },
      finance_manager: { Dashboard: { access: true }, Payments: { access: true }, Franchise: { access: true }, Reports: { access: true }, Settings: { access: true } }
    };

    const perms = rolePermissionsMap[newRoleKey];
    if (perms) {
      localStorage.setItem("evegah_user_permissions", JSON.stringify(perms));
    } else {
      localStorage.removeItem("evegah_user_permissions");
    }

    setRole(newRoleKey);
    setShowRoleMenu(false);
    window.dispatchEvent(new Event("evegah_role_changed"));

    if (newRoleKey === 'employee') {
      router.push('/employee-dashboard');
    } else if (newRoleKey === 'super_admin') {
      router.push('/super-admin');
    }
  };

  const handleSaveKey = (val: string) => {
    setGeminiKey(val);
    localStorage.setItem('evegah_gemini_key', val);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim()) return;

    if (!customPrompt) {
      setChatInput('');
    }

    const userMsg = { role: 'user', text: textToSend };
    setChatMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const response = await api.post('/ai/automate', {
        prompt: textToSend,
        geminiKey: geminiKey
      });

      if (response && response.data && response.data.status === 'success') {
        setChatMessages(prev => [...prev, { role: 'bot', text: response.data.reply }]);
        if (response.data.intent !== 'CHITCHAT') {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else {
        setChatMessages(prev => [...prev, { role: 'bot', text: response?.data?.message || 'Failed to execute operation.', isError: true }]);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'An error occurred.';
      setChatMessages(prev => [...prev, { role: 'bot', text: errMsg, isError: true }]);
    } finally {
      setIsSending(false);
    }
  };

  if (role === null) return null;

  if (role === "first_time_franchise") {
    return <FranchiseOnboard />;
  }

  const roleList = [
    { key: "super_admin", label: "Super Admin", icon: "👑" },
    { key: "platform_admin", label: "Platform Admin", icon: "🛡️" },
    { key: "employee", label: "Zone Employee", icon: "🛠️" },
    { key: "zone_admin", label: "Zone Admin", icon: "📍" },
    { key: "operations_manager", label: "Operations Manager", icon: "⚡" },
    { key: "franchise_manager", label: "Franchise Manager", icon: "🏢" },
    { key: "battery_technician", label: "Battery Technician", icon: "🔋" },
    { key: "support_executive", label: "Support Executive", icon: "🎧" },
    { key: "fleet_manager", label: "Fleet Manager", icon: "🛵" },
    { key: "field_technician", label: "Field Technician", icon: "🛠️" },
    { key: "finance_manager", label: "Finance Manager", icon: "💳" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SUPER_DESIGN_CSS }} />

      {/* Floating AI Chatbox FAB */}
      <button className="ai-chat-fab" onClick={() => setShowChat(!showChat)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Evegah AI
      </button>

      {showChat && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: '#D2FC00' }}>
                <polygon points="12 2 2 22 22 22" />
              </svg>
              Evegah AI Automator
            </div>
            <div className="ai-chat-actions">
              <button className="ai-chat-btn-icon" onClick={() => setShowChatSettings(!showChatSettings)} title="AI Settings">
                ⚙️
              </button>
              <button className="ai-chat-btn-icon" onClick={() => setShowChat(false)}>✕</button>
            </div>
          </div>

          {showChatSettings && (
            <div className="ai-chat-settings" style={{ padding: '10px', background: '#FAF5FF', borderBottom: '1px solid #E9D5FF' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#2A195C' }}>Gemini API Key</label>
              <input 
                type="password" 
                className="ai-chat-inp"
                style={{ width: '100%', padding: '6px', marginTop: '4px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                placeholder="Enter Gemini API Key..." 
                value={geminiKey} 
                onChange={(e) => handleSaveKey(e.target.value)} 
              />
            </div>
          )}

          <div className="ai-chat-body">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`ai-msg ${msg.role === 'user' ? 'ai-msg-user' : msg.isError ? 'ai-msg-error' : 'ai-msg-bot'}`}>
                {msg.text}
              </div>
            ))}
            {isSending && (
              <div className="ai-msg ai-msg-bot" style={{ fontStyle: 'italic', color: '#94A3B8' }}>
                AI is processing request...
              </div>
            )}
          </div>

          <div className="ai-chat-footer">
            <div className="ai-chat-quick-tags">
              <span className="ai-chat-tag" onClick={() => handleSendMessage("Add vehicle EVM-999 with model Evegah Mink to Gotri Zone")}>Add Mink Vehicle</span>
              <span className="ai-chat-tag" onClick={() => handleSendMessage("Assign vehicle EVM-999 to Aatapi Zone")}>Assign EVM-999</span>
            </div>
            <div className="ai-chat-input-row">
              <input 
                type="text" 
                className="ai-chat-inp" 
                placeholder="Ask AI to automate..." 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
              />
              <button className="ai-chat-send" onClick={() => handleSendMessage()} disabled={isSending}>Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Render Selected Role Dashboard with strict Assigned Dashboard mapping */}
      {(() => {
        const assignedDash = typeof window !== 'undefined' ? localStorage.getItem('evegah_assigned_dashboard') : null;
        const roleName = typeof window !== 'undefined' ? localStorage.getItem('evegah_user_role_name') || '' : '';
        const normRoleName = roleName.toLowerCase();
        const normRole = (role || '').toLowerCase();

        // 0. Employee check FIRST - redirect immediately to employee dashboard
        if (
          assignedDash === 'Employee Operations Dashboard' ||
          (assignedDash && assignedDash.toLowerCase().includes('employee')) ||
          normRole.includes('employee') ||
          normRoleName.includes('employee')
        ) {
          if (typeof window !== 'undefined') {
            router.replace('/employee-dashboard');
          }
          return null;
        }

        if (
          assignedDash === 'Super Admin Dashboard' || 
          normRole === 'super_admin' || 
          normRoleName === 'super admin' || 
          normRoleName === 'platform admin'
        ) {
          return <SuperAdminRoleDashboard />;
        }
        
        if (
          assignedDash === 'Zone Admin Dashboard' || 
          normRole === 'zone_manager' || 
          normRoleName === 'zone admin' || 
          normRoleName === 'zone manager'
        ) {
          return <ZoneManagerRoleDashboard />;
        }

        if (
          assignedDash === 'Operations Dashboard' || 
          normRole === 'operations_manager' || 
          normRole === 'employee' || 
          normRoleName.includes('sf_admin') || 
          normRoleName.includes('sf_001') || 
          normRoleName.includes('operation') || 
          normRoleName.includes('employee')
        ) {
          return <GroundOperationsRoleDashboard />;
        }

        if (
          assignedDash === 'Franchise Dashboard' || 
          normRole === 'franchise_manager' || 
          normRoleName === 'franchise manager' || 
          normRoleName === 'franchise admin'
        ) {
          return <FranchiseAdminRoleDashboard />;
        }

        if (
          assignedDash === 'BMS Battery Dashboard' || 
          normRole === 'battery_technician' || 
          normRoleName.includes('battery') || 
          normRoleName.includes('technician')
        ) {
          return <MaintenanceTechnicianRoleDashboard />;
        }

        if (
          assignedDash === 'Finance & Accounts' || 
          normRole === 'finance_manager' || 
          normRoleName.includes('finance')
        ) {
          return <FinanceAccountsRoleDashboard />;
        }

        if (
          assignedDash === 'Support Executive' || 
          normRole === 'support_executive' || 
          normRoleName.includes('support')
        ) {
          return <SupportExecutiveRoleDashboard />;
        }

        return <GroundOperationsRoleDashboard />;
      })()}
    </>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── 1. SUPER ADMIN ROLE DASHBOARD ─────────────────────── */
/* ──────────────────────────────────────────────────────── */
function SuperAdminRoleDashboard() {
  const [liveStats, setLiveStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchSuperStats = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/stats/super-admin');
        if (res.status === 'success' && res.data) {
          setLiveStats(res.data);
        } else {
          setIsError(true);
        }
      } catch (e) {
        console.warn('SuperAdmin stats fetch error:', e);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuperStats();
  }, []);

  return (
    <div className="ev-shell">
      <Sidebar activePath="/" />
      <div className="ev-main">
        <TopBar title="Super Admin Dashboard" subtitle="Overview of SaaS Tenants, Subscriptions & Revenue Metrics" hideZone={false} />

        <div className="ev-body">
          <div className="sa-sub-header">
            <div className="sa-sub-title-group">
              <h2 className="sa-sub-title">SaaS Platform Performance</h2>
              <span className="sa-sub-desc">Multi-tenant subscription analytics and revenue health overview</span>
            </div>
            <div className="sa-sub-right">
              
              <button className="sa-export-btn">Export Report</button>
            </div>
          </div>

          <div className="ev-kpi-grid-5">
            {[
              { label: 'Total Users', val: liveStats ? liveStats.totalUsers.toLocaleString('en-US') : (isError ? '—' : 'Loading...'), change: '—', up: true, bg: '#EEF2FF', color: '#6366F1', ic: '👥' },
              { label: 'Total Franchises', val: liveStats ? (liveStats.totalFranchises || liveStats.totalTenants || 0).toString() : (isError ? '—' : 'Loading...'), change: '—', up: true, bg: '#EEF2FF', color: '#4F46E5', ic: '🏢' },
              { label: 'Active Subscriptions', val: liveStats ? liveStats.activeSubscriptions.toLocaleString('en-US') : (isError ? '—' : 'Loading...'), change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '⚡' },
              { label: 'MRR', val: liveStats ? liveStats.mrr : (isError ? '—' : 'Loading...'), change: '—', up: true, bg: '#EFF6FF', color: '#2563EB', ic: '₹' },
              { label: 'ARR', val: liveStats ? liveStats.arr : (isError ? '—' : 'Loading...'), change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '📈' }
            ].map(k => (
              <div key={k.label} className="ev-kpi-card">
                <div className="ev-kpi-top">
                  <span className="ev-kpi-label">{k.label}</span>
                  <span className="ev-kpi-icon" style={{ background: k.bg, color: k.color, fontWeight: 'bold' }}>{k.ic}</span>
                </div>
                <div className="ev-kpi-val"><AnimatedCount value={k.val} /></div>
                <div className="ev-kpi-bottom">
                  <span className="ev-kpi-trend-up">↑ {k.change}</span>
                  <span>vs last month</span>
                </div>
              </div>
            ))}
          </div>

          <div className="sa-row-1-grid">
            {/* Multi-spline Chart */}
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Revenue Growth (MRR vs ARR)</span>
                <select className="sa-select-light"><option>This Month</option></select>
              </div>
              <div className="sa-card-body">
                <div style={{ height: '180px', position: 'relative' }}>
                  <Line
                    data={{
                      labels: liveStats?.revenueOverview?.labels || [],
                      datasets: [
                        { label: 'MRR (₹)', data: liveStats?.revenueOverview?.mrrData || [], borderColor: '#6366F1', backgroundColor: 'rgba(99, 102, 241, 0.12)', fill: true, tension: 0.4 },
                        { label: 'ARR (₹)', data: liveStats?.revenueOverview?.arrData || [], borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.12)', fill: true, tension: 0.4 }
                      ]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' } } }}
                  />
                </div>
              </div>
            </div>

            {/* Doughnut Chart */}
            <div className="sa-card">
              <div className="sa-card-hdr"><span className="sa-card-title">Subscriptions Status</span></div>
              <div className="sa-card-body" style={{ alignItems: 'center' }}>
                <div className="sa-donut-wrap">
                  <Doughnut
                    data={{
                      labels: ['Active', 'Trial', 'Past Due', 'Canceled'],
                      datasets: [{ data: liveStats ? [liveStats.subscriptionStatus.active, liveStats.subscriptionStatus.trial, liveStats.subscriptionStatus.pastDue, liveStats.subscriptionStatus.canceled] : [], backgroundColor: ['#1E3A8A', '#84CC16', '#F97316', '#EF4444'] }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }}
                  />
                  <div className="sa-donut-center">
                    <span className="sa-donut-num">{liveStats ? liveStats.subscriptionStatus.total.toLocaleString('en-US') : '—'}</span>
                    <span className="sa-donut-lbl">Total</span>
                  </div>
                </div>
                <div className="sa-donut-legends">
                  <div className="sa-donut-leg-row"><span>Active</span><span className="sa-donut-leg-val">{liveStats ? liveStats.subscriptionStatus.active.toLocaleString('en-US') : '—'} </span></div>
                  <div className="sa-donut-leg-row"><span>Trial</span><span className="sa-donut-leg-val">{liveStats ? liveStats.subscriptionStatus.trial.toLocaleString('en-US') : '—'} </span></div>
                  <div className="sa-donut-leg-row"><span>Past Due</span><span className="sa-donut-leg-val">{liveStats ? liveStats.subscriptionStatus.pastDue.toLocaleString('en-US') : '—'} </span></div>
                  <div className="sa-donut-leg-row"><span>Canceled</span><span className="sa-donut-leg-val">{liveStats ? liveStats.subscriptionStatus.canceled.toLocaleString('en-US') : '—'} </span></div>
                </div>
              </div>
            </div>

            {/* Top Plans Rank List */}
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Top Plans by Revenue</span>
                <a href="/super-admin/subscriptions" className="sa-link-all">View All</a>
              </div>
              <div className="sa-card-body">
                {/* Real interactive horizontal bar graph */}
                <div style={{ height: '80px', width: '100%', marginBottom: '14px' }}>
                  <Bar
                    data={{
                      labels: liveStats?.topPlans?.labels || [],
                        datasets: [
                          {
                            data: liveStats?.topPlans?.data || [],
                          backgroundColor: ['#1E3A8A', '#10B981', '#F59E0B', '#6366F1'],
                          borderRadius: 4,
                          barThickness: 8
                        }
                      ]
                    }}
                    options={{
                      indexAxis: 'y' as const,
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx: any) => ` Revenue: ₹${ctx.raw?.toLocaleString()}`
                          }
                        }
                      },
                      scales: {
                        x: { display: false, grid: { display: false } },
                        y: {
                          grid: { display: false },
                          ticks: { font: { size: 9.5, weight: 'bold' as const }, color: '#64748B' }
                        }
                      }
                    }}
                  />
                </div>

                <div className="sa-rank-list">
                  {(liveStats?.topPlans || [
                    { name: 'Enterprise Plan', val: '₹45,67,890', color: '#1E3A8A' },
                    { name: 'Business Plan', val: '₹28,34,560', color: '#10B981' },
                    { name: 'Professional Plan', val: '₹12,45,230', color: '#F59E0B' },
                    { name: 'Starter Plan', val: '₹5,67,890', color: '#6366F1' }
                  ]).map((p: any, idx: number) => (
                    <div key={p.name} className="sa-rank-row">
                      <div className="sa-rank-left">
                        <span className="sa-rank-circle" style={{ background: p.color }}>{idx + 1}</span>
                        <span className="sa-rank-name">{p.name}</span>
                      </div>
                      <span className="sa-rank-val">{p.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 6 Small KPIs Row */}
          <div className="sa-kpi-row-6">
            {[
              { label: 'New Signups', val: '1,245', change: '—', up: true, bg: '#EEF2FF', color: '#6366F1', ic: '👤' },
              { label: 'Trial Conversions', val: '18.6%', change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '🎯' },
              { label: 'Churn Rate', val: '2.4%', change: '—', up: true, bg: '#FEF2F2', color: '#EF4444', ic: '📉' },
              { label: 'LTV', val: '₹24,850', change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '💎' },
              { label: 'CAC', val: '₹3,250', change: '—', up: true, bg: '#FFF7ED', color: '#F97316', ic: '🏷️' },
              { label: 'Active Tenants', val: '198', change: '—', up: true, bg: '#EEF2FF', color: '#6366F1', ic: '🏬' }
            ].map(k => (
              <div key={k.label} className="ev-kpi-card" style={{ padding: '12px' }}>
                <div className="ev-kpi-top">
                  <span className="ev-kpi-label" style={{ fontSize: '9.5px' }}>{k.label}</span>
                  <span className="ev-kpi-icon" style={{ width: '28px', height: '28px', background: k.bg, color: k.color }}>{k.ic}</span>
                </div>
                <div className="ev-kpi-val" style={{ fontSize: '18px', margin: '6px 0 2px' }}><AnimatedCount value={k.val} /></div>
                <div className="ev-kpi-bottom" style={{ fontSize: '9.5px' }}>
                  <span className={k.up ? 'sa-kpi-card-trend-up' : 'sa-kpi-card-trend-dn'}>{k.up ? '↑' : '↓'} {k.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tenants & Subscriptions Tables */}
          <div className="sa-row-3-grid">
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Tenant Overview</span>
                <a href="/franchise/list" className="sa-link-all">Manage Tenants</a>
              </div>
              <div className="sa-card-body" style={{ padding: 0 }}>
                <table className="ev-table">
                  <thead>
                    <tr><th>Tenant Name</th><th>Plan</th><th>Vehicles</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Gotri Mobility Hub', plan: 'Enterprise', vehicles: 450, st: 'Active', bg: 'sa-badge-green' },
                      { name: 'Manjalpur Hub', plan: 'Business', vehicles: 320, st: 'Active', bg: 'sa-badge-green' },
                      { name: 'KPGU Campus Hub', plan: 'Business', vehicles: 280, st: 'Active', bg: 'sa-badge-green' },
                      { name: 'Moti Daman Hub', plan: 'Starter', vehicles: 85, st: 'Trial', bg: 'sa-badge-orange' },
                      { name: 'Aatapi Eco Mobility', plan: 'Professional', vehicles: 190, st: 'Active', bg: 'sa-badge-green' }
                    ].map(t => (
                      <tr key={t.name}>
                        <td style={{ fontWeight: '700' }}>{t.name}</td>
                        <td>{t.plan}</td>
                        <td style={{ fontWeight: '600' }}>{t.vehicles} EV</td>
                        <td><span className={`sa-badge ${t.bg}`}>{t.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">System Infrastructure Status</span>
                <a href="/settings" className="sa-link-all">System Health</a>
              </div>
              <div className="sa-card-body" style={{ gap: '10px' }}>
                {[
                  { name: 'API Gateway & Services', status: 'Operational', pct: '99.98%' },
                  { name: 'MongoDB / PostgreSQL Cluster', status: 'Operational', pct: '100%' },
                  { name: 'MQTT Broker & IoT Ingestion', status: 'Operational', pct: '99.95%' },
                  { name: 'Push & Notification Service', status: 'Operational', pct: '99.91%' }
                ].map(s => (
                  <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700' }}>
                      <span>{s.name}</span>
                      <span style={{ color: '#10B981' }}>{s.status} ({s.pct})</span>
                    </div>
                    <div className="sa-prog-bar-bg"><div className="sa-prog-bar-fill" style={{ width: s.pct, background: '#10B981' }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr"><span className="sa-card-title">Quick Actions</span></div>
              <div className="sa-card-body" style={{ gap: '10px' }}>
                <a href="/super-admin/franchise-onboarding" className="sa-export-btn" style={{ justifyContent: 'center' }}>+ Onboard New Franchise</a>
                <a href="/super-admin/subscriptions" className="sa-date-box" style={{ justifyContent: 'center' }}>Configure Subscriptions</a>
                <a href="/super-admin/white-label" className="sa-date-box" style={{ justifyContent: 'center' }}>White Label Branding</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FranchiseAdminRoleDashboard() {
  const [fStats, setFStats] = useState<any>(null);
  const [liveVehicles, setLiveVehicles] = useState<any[]>([]);

  useEffect(() => {
    const fetchFranchiseData = async () => {
      try {
        const [statsRes, vRes] = await Promise.all([
          api.get('/stats/super-admin').catch(() => null),
          api.get('/vehicles').catch(() => null)
        ]);

        if (statsRes && statsRes.status === 'success' && statsRes.data) {
          setFStats(statsRes.data);
        }
        if (vRes && (Array.isArray(vRes) || vRes.data)) {
          setLiveVehicles(Array.isArray(vRes) ? vRes : (vRes.data || []));
        }
      } catch (e) {
        console.warn('Franchise stats fetch error:', e);
      }
    };
    fetchFranchiseData();
  }, []);

  return (
    <div className="ev-shell">
      <Sidebar activePath="/" />
      <div className="ev-main">
        <TopBar title="Franchise Admin Dashboard" subtitle="Real-time operations, fleet performance, and zone metrics across your franchise." hideZone={false} />

        <div className="ev-body">
          <div className="sa-sub-header">
            <div className="sa-sub-title-group">
              <h2 className="sa-sub-title">Fleet & Franchise Operations</h2>
              <span className="sa-sub-desc">Live performance summary across all managed zones</span>
            </div>
            <div className="sa-sub-right">
              
              <a href="/vehicles/all" className="sa-export-btn">+ Register New Vehicle</a>
            </div>
          </div>

          {/* 5 Top Real KPI Cards: Total Rent, Total Deposit, Riders, Reservations, Active Fleet */}
          <div className="ev-kpi-grid-5">
            {[
              { label: 'Total Rent Collected', val: fStats ? fStats.mrr : '—', change: '—', up: true, bg: '#EFF6FF', color: '#2563EB', ic: '₹' },
              { label: 'Total Deposit Held', val: '₹9,000', change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '🛡️' },
              { label: 'Total Riders Registered', val: (fStats?.totalRiders || '—').toString(), change: '—', up: true, bg: '#F3E8FF', color: '#7E22CE', ic: '👥' },
              { label: 'Total Reservations', val: (fStats?.activeSubscriptions || '—').toString(), change: '—', up: true, bg: '#EEF2FF', color: '#6366F1', ic: '⚡' },
              { label: 'Active Operational Fleet', val: (fStats?.totalVehicles?.value || '—'), change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '🚲' }
            ].map(k => (
              <div key={k.label} className="ev-kpi-card">
                <div className="ev-kpi-top">
                  <span className="ev-kpi-label">{k.label}</span>
                  <span className="ev-kpi-icon" style={{ background: k.bg, color: k.color, fontWeight: 'bold' }}>{k.ic}</span>
                </div>
                <div className="ev-kpi-val"><AnimatedCount value={k.val} /></div>
                <div className="ev-kpi-bottom">
                  <span className="ev-kpi-trend-up">↑ {k.change}</span>
                  <span>vs last period</span>
                </div>
              </div>
            ))}
          </div>

          <div className="sa-row-1-grid">
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Ride Operations & Revenue Trend</span>
                <select className="sa-select-light"><option>Last 7 Days</option></select>
              </div>
              <div className="sa-card-body">
                <div style={{ height: '180px', position: 'relative' }}>
                  <Line
                    data={{
                      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                      datasets: [
                        { label: 'Rides Completed', data: [2, 3, 5, 4, 6, 8, 9], borderColor: '#6366F1', backgroundColor: 'rgba(99, 102, 241, 0.12)', fill: true, tension: 0.4 },
                        { label: 'Revenue (₹)', data: [2400, 4500, 6800, 9200, 11500, 14200, 17065], borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.12)', fill: true, tension: 0.4 }
                      ]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' } } }}
                  />
                </div>
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr"><span className="sa-card-title">Fleet Availability Status</span></div>
              <div className="sa-card-body" style={{ alignItems: 'center' }}>
                <div className="sa-donut-wrap">
                  <Doughnut
                    data={{
                      labels: ['In Ride', 'Available', 'Charging', 'Maintenance'],
                      datasets: [{ data: [4, 4, 0, 0], backgroundColor: ['#6366F1', '#10B981', '#F59E0B', '#EF4444'] }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }}
                  />
                  <div className="sa-donut-center">
                    <span className="sa-donut-num">{liveVehicles.length || 8}</span>
                    <span className="sa-donut-lbl">Fleet</span>
                  </div>
                </div>
                <div className="sa-donut-legends">
                  <div className="sa-donut-leg-row"><span>In Ride</span><span className="sa-donut-leg-val">4 (50%)</span></div>
                  <div className="sa-donut-leg-row"><span>Available</span><span className="sa-donut-leg-val">4 (50%)</span></div>
                  <div className="sa-donut-leg-row"><span>Charging</span><span className="sa-donut-leg-val">0 (0%)</span></div>
                  <div className="sa-donut-leg-row"><span>Maintenance</span><span className="sa-donut-leg-val">0 (0%)</span></div>
                </div>
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Top Zones by Rides</span>
                <a href="/zones" className="sa-link-all">View All</a>
              </div>
              <div className="sa-card-body">
                <div className="sa-rank-list">
                  {[
                    { name: 'Gotri Zone', val: '4 Rides', color: '#6366F1' },
                    { name: 'Aatapi Zone', val: '2 Rides', color: '#10B981' },
                    { name: 'Daman Zone', val: '2 Rides', color: '#F59E0B' }
                  ].map((z, idx) => (
                    <div key={z.name} className="sa-rank-row">
                      <div className="sa-rank-left">
                        <span className="sa-rank-circle" style={{ background: z.color }}>{idx + 1}</span>
                        <span className="sa-rank-name">{z.name}</span>
                      </div>
                      <span className="sa-rank-val">{z.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="sa-row-2-grid">
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Active Fleet Operations</span>
                <a href="/vehicles/active" className="sa-link-all">Live Rides</a>
              </div>
              <div className="sa-card-body" style={{ padding: 0 }}>
                {liveVehicles.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                    No fleet vehicles registered in this franchise.
                  </div>
                ) : (
                  <table className="ev-table">
                    <thead>
                      <tr><th>Vehicle Plate</th><th>Rider Name</th><th>Current Zone</th><th>Battery %</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {liveVehicles.map((v: any) => (
                        <tr key={v.code || v.plate || v.id}>
                          <td style={{ fontWeight: '800', fontFamily: 'Outfit', color: '#2A195C' }}>{v.code || v.plate}</td>
                          <td style={{ fontWeight: '700' }}>{v.renter_name || v.rider || <span style={{ color: '#94A3B8', fontWeight: 500 }}>Available</span>}</td>
                          <td>{v.zone || 'Gotri Zone'}</td>
                          <td style={{ fontWeight: '700' }}>{v.battery_pct ? (v.battery_pct + (String(v.battery_pct).includes('%') ? '' : '%')) : '95%'}</td>
                          <td><span className={`sa-badge ${v.vehicle_status === 'In Ride' ? 'sa-badge-blue' : 'sa-badge-green'}`}>{v.vehicle_status || 'Available'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Franchise Staff & Role Assignment</span>
                <a href="/users" className="sa-link-all">Users & Roles</a>
              </div>
              <div className="sa-card-body" style={{ padding: 0 }}>
                <table className="ev-table">
                  <thead>
                    <tr><th>Staff Member</th><th>Role</th><th>Hub Assigned</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Karan Malhotra', role: 'Franchise Owner', hub: 'Koramangala Hub', st: 'Active', bg: 'sa-badge-purple' },
                      { name: 'Rohit Sharma', role: 'Operations Mgr', hub: 'South Depot Zone', st: 'Active', bg: 'sa-badge-green' },
                      { name: 'Vikram Singh', role: 'Technician Mgr', hub: 'Indiranagar Hub', st: 'Active', bg: 'sa-badge-blue' }
                    ].map(u => (
                      <tr key={u.name}>
                        <td style={{ fontWeight: '700' }}>{u.name}</td>
                        <td><span className="sa-badge sa-badge-purple">{u.role}</span></td>
                        <td>{u.hub}</td>
                        <td><span className={`sa-badge ${u.bg}`}>{u.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── 3. ZONE MANAGER ROLE DASHBOARD (SUPER ADMIN STYLE) ─── */
/* ──────────────────────────────────────────────────────── */
function ZoneManagerRoleDashboard() {
  const [activeZone, setActiveZone] = useState('Manjalpur Zone');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Date Filter State
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [dateRangeText, setDateRangeText] = useState<string>('This Month');

    const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3500);
    };

    // Fetch Stats from Backend API
    const fetchZoneStats = async (zoneName: string, start?: string, end?: string) => {
    try {
      setLoading(true);
      let query = `/stats/zone-admin?zone=${encodeURIComponent(zoneName)}`;
      if (start && end) {
        query += `&startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`;
      }
      const res = await api.get(query);
      if (res && res.status === 'success' && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load zone admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync with Active Zone and Date Filter
  useEffect(() => {
    const update = () => {
      if (typeof window !== 'undefined') {
        const storedZone = localStorage.getItem('evegah_active_zone') || localStorage.getItem('evegah_user_zone') || 'All Zones';
        setActiveZone(storedZone);
        fetchZoneStats(storedZone, startDate, endDate);
      }
    };
    update();
    window.addEventListener('evegah_active_zone_changed', update);
    window.addEventListener('evegah_zone_changed', update);
    return () => {
      window.removeEventListener('evegah_active_zone_changed', update);
      window.removeEventListener('evegah_zone_changed', update);
    };
  }, [startDate, endDate]);

  // CSV Export Function
  const handleExport = () => {
    if (!stats) return;
    const rows = [
      ['Evegah Mobility - Zone Performance Report'],
      ['Zone', activeZone],
      ['Date Range', dateRangeText],
      ['Report Generated At', new Date().toLocaleString('en-IN')],
      [],
      ['--- KPI OVERVIEW ---'],
      ['Metric', 'Value', 'Change'],
      ['Total Riders', stats.kpis?.totalRiders?.value ?? 0, stats.kpis?.totalRiders?.change ?? ''],
      ['Total Rentals', stats.kpis?.totalRentals?.value ?? 0, stats.kpis?.totalRentals?.change ?? ''],
      ['Revenue', stats.kpis?.revenue?.value ?? '₹0', stats.kpis?.revenue?.change ?? ''],
      ['Total Deposit', stats.kpis?.totalDeposit?.value ?? '₹0', stats.kpis?.totalDeposit?.change ?? ''],
      ['Active Rides', stats.kpis?.activeRides?.value ?? 0, stats.kpis?.activeRides?.change ?? ''],
      ['Zone Fleet', stats.kpis?.zoneFleet?.value ?? '0 EVs', stats.kpis?.zoneFleet?.change ?? ''],
      [],
      ['--- RECENT RESERVATIONS ---'],
      ['Reservation ID', 'Customer Name', 'Mobile', 'Vehicle', 'Package', 'Fare (INR)', 'Deposit (INR)', 'Payment Status', 'Status', 'Date'],
      ...(stats.recentReservations || []).map((r: any) => [
        r.reservation_id, `"${r.customer_name || ''}"`, r.mobile, r.vehicle_number || '-', r.package_type || '-', r.fare, r.deposit, r.payment_status, r.status, r.created_at
      ]),
      [],
      ['--- RIDER PAYMENT DUE ---'],
      ['Rider Name', 'Mobile', 'Vehicle', 'Package', 'Amount Due (INR)', 'Payment Status', 'Status'],
      ...(stats.riderPaymentDue || []).map((p: any) => [
        `"${p.rider_name || ''}"`, p.mobile, p.vehicle_id || '-', p.package_name || '-', p.amount_due, p.payment_status, p.status
      ]),
      [],
      ['--- DRAFT REGISTRATIONS ---'],
      ['Applicant Name', 'Mobile', 'Package', 'KYC Status', 'Status', 'Submission Date'],
      ...(stats.draftRegistrations || []).map((d: any) => [
        `"${d.rider_name || ''}"`, d.mobile, d.package_name || '-', d.kyc_status, d.status, d.created_at
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Zone_Report_${activeZone.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${activeZone} report successfully!`);
  };

  const kpis = stats?.kpis;
  const batteryStats = stats?.batteryStats || { total: 8, charged: 4, medium: 2, low: 0, charging: 2 };
  const recentReservations = stats?.recentReservations || [];
  const riderPaymentDue = stats?.riderPaymentDue || [];
  const draftRegistrations = stats?.draftRegistrations || [];
  const telemetryFleet = stats?.telemetryFleet || [];
  const hubs = stats?.hubs || [];

  return (
    <div className="ev-shell">
      <Sidebar activePath="/" />
      <div className="ev-main">
        <TopBar title="Zone Admin Dashboard" subtitle="Live Zone Monitoring, Battery Swap Cabinets, Fleet Telemetry & Zone Performance" hideZone={false} onDateChange={(s, e, text) => { setStartDate(s); setEndDate(e); setDateRangeText(text); }} />

        {/* Toast alert notification */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            top: 24,
            right: 24,
            background: '#10B981',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '13.5px',
            zIndex: 99999,
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✓</span> {toastMessage}
          </div>
        )}

        <div className="ev-body">
          {/* Sub Header with Interactive Date Range Filter & Export */}
          <div className="sa-sub-header" style={{ position: 'relative' }}>
            <div className="sa-sub-title-group">
              <h2 className="sa-sub-title">Zone Performance Overview</h2>
              <span className="sa-sub-desc">Live telemetry, rental conversions, deposits & fleet status</span>
            </div>

            <div className="sa-sub-right" style={{ position: 'relative' }}>

              <button className="sa-export-btn" onClick={handleExport}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export Zone Report
              </button>
            </div>
          </div>

          {/* 5 Top KPI Cards matching Active Ride Page Card Design */}
          <div className="ar-stats-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '16px' }}>
            {[
              {
                label: 'TOTAL RIDERS',
                val: kpis?.totalRiders?.value ?? 0,
                change: kpis?.totalRiders?.change ?? '12.4% vs last period',
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
                label: 'TOTAL RENTALS',
                val: kpis?.totalRentals?.value ?? 0,
                change: kpis?.totalRentals?.change ?? '15.2% vs last period',
                bg: '#10B981',
                trendColor: '#16A34A',
                ic: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="5.5" cy="17.5" r="3.5" />
                    <circle cx="18.5" cy="17.5" r="3.5" />
                    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" />
                    <path d="M5.5 17.5l4-8h4l2.5 8" />
                    <path d="M8.5 12h5" />
                  </svg>
                )
              },
              {
                label: 'REVENUE',
                val: kpis?.revenue?.value ?? '₹0',
                change: kpis?.revenue?.change ?? '18.5% vs last period',
                bg: '#2563EB',
                trendColor: '#16A34A',
                ic: (
                  <span style={{ fontSize: '18px', fontWeight: 800 }}>₹</span>
                )
              },
              {
                label: 'TOTAL DEPOSIT',
                val: kpis?.totalDeposit?.value ?? '₹0',
                change: kpis?.totalDeposit?.change ?? 'Secured',
                bg: '#059669',
                trendColor: '#16A34A',
                ic: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                )
              },
              {
                label: 'ACTIVE RIDES',
                val: `${kpis?.activeRides?.value ?? 0} Rides`,
                change: kpis?.activeRides?.change ?? 'On road now',
                bg: '#F97316',
                trendColor: '#16A34A',
                ic: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                )
              }
            ].map(k => (
              <div key={k.label} className="ar-stat-card">
                <div className="ar-stat-ic" style={{ background: k.bg }}>
                  {k.ic}
                </div>
                <div className="ar-stat-info">
                  <div className="ar-stat-lbl">{k.label}</div>
                  <div className="ar-stat-val">
                    <AnimatedCount value={k.val} />
                  </div>
                  <div className="ar-stat-trend" style={{ color: k.trendColor }}>
                    <span style={{ fontSize: 8 }}>▲</span> {k.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 1 Grid: Line Chart (Demand Trend) & Doughnut Chart (Battery SOC) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '16px', marginTop: '4px' }}>
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Ride Demand &amp; Active Trips (24h Trend)</span>
                <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>{dateRangeText}</span>
              </div>
              <div className="sa-card-body">
                <div style={{ height: '190px', position: 'relative' }}>
                  <Line
                    data={{
                      labels: stats?.demandTrend?.labels || ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00'],
                      datasets: [
                        {
                          label: 'Active Rides',
                          data: stats?.demandTrend?.activeRides || [1, 3, 5, 4, 6, 4, 2],
                          borderColor: '#6366F1',
                          backgroundColor: 'rgba(99, 102, 241, 0.12)',
                          fill: true,
                          tension: 0.4
                        },
                        {
                          label: 'Hourly Bookings',
                          data: stats?.demandTrend?.hourlyRentals || [0, 2, 3, 4, 5, 2, 1],
                          borderColor: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          fill: true,
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: { duration: 1200, easing: 'easeInOutQuart' },
                      plugins: { legend: { display: true, position: 'top' } }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr"><span className="sa-card-title">Battery SOC Distribution</span></div>
              <div className="sa-card-body" style={{ alignItems: 'center' }}>
                <div className="sa-donut-wrap">
                  <Doughnut
                    data={{
                      labels: ['Fully Charged (>80%)', 'Medium (40-80%)', 'Low Battery (<40%)', 'In Charging Station'],
                      datasets: [{
                        data: [
                          batteryStats.charged || 4,
                          batteryStats.medium || 2,
                          batteryStats.low || 0,
                          batteryStats.charging || 2
                        ],
                        backgroundColor: ['#10B981', '#6366F1', '#F97316', '#8B5CF6']
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '70%',
                      animation: { animateRotate: true, animateScale: true, duration: 1200 },
                      plugins: { legend: { display: false } }
                    }}
                  />
                  <div className="sa-donut-center">
                    <span className="sa-donut-num">{batteryStats.total || 8}</span>
                    <span className="sa-donut-lbl">Batteries</span>
                  </div>
                </div>
                <div className="sa-donut-legends">
                  <div className="sa-donut-leg-row"><span>Charged (&gt;80%)</span><span className="sa-donut-leg-val">{batteryStats.charged} Units</span></div>
                  <div className="sa-donut-leg-row"><span>Medium (40-80%)</span><span className="sa-donut-leg-val">{batteryStats.medium} Units</span></div>
                  <div className="sa-donut-leg-row"><span>Low (&lt;40%)</span><span className="sa-donut-leg-val">{batteryStats.low} Units</span></div>
                  <div className="sa-donut-leg-row"><span>Charging</span><span className="sa-donut-leg-val">{batteryStats.charging} Units</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ── TABLE 1: RECENT RESERVATIONS (FULL WIDTH EXECUTIVE TABLE) ──── */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="sa-card" style={{ marginTop: '4px' }}>
            <div className="sa-card-hdr">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="sa-card-title">Recent Reservations</span>
                <span style={{
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '11.5px',
                  fontWeight: 700
                }}>
                  {recentReservations.length} Bookings
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <a href="/renters/reserved" className="sa-link-all">View All Reservations →</a>
              </div>
            </div>
            <div className="sa-card-body" style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="ev-table">
                  <thead>
                    <tr>
                      <th>Reservation ID</th>
                      <th>Rider Name</th>
                      <th>Mobile</th>
                      <th>Vehicle Number</th>
                      <th>Package Plan</th>
                      <th>Fare</th>
                      <th>Deposit</th>
                      <th>Payment Status</th>
                      <th>Ride Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReservations.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                          No reservations found for this period.
                        </td>
                      </tr>
                    ) : (
                      recentReservations.map((r: any) => (
                        <tr key={r.id || r.reservation_id}>
                          <td style={{ fontWeight: 800, fontFamily: 'Outfit', color: '#4F46E5' }}>{r.reservation_id}</td>
                          <td style={{ fontWeight: 700, color: '#0F172A' }}>{r.customer_name}</td>
                          <td style={{ color: '#475569', fontSize: '12px' }}>{r.mobile}</td>
                          <td>
                            <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '11.5px' }}>
                              {r.vehicle_number || 'Pending'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{r.package_type}</td>
                          <td style={{ fontWeight: 800, color: '#0F172A' }}>₹{parseFloat(r.fare || 0).toLocaleString('en-IN')}</td>
                          <td style={{ fontWeight: 700, color: '#10B981' }}>₹{parseFloat(r.deposit || 0).toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`sa-badge ${r.payment_status === 'Paid' ? 'sa-badge-green' : 'sa-badge-orange'}`}>
                              {r.payment_status}
                            </span>
                          </td>
                          <td>
                            <span className={`sa-badge ${
                              r.status === 'Active Ride' ? 'sa-badge-green' :
                              r.status === 'Confirmed' ? 'sa-badge-blue' :
                              r.status === 'Completed' ? 'sa-badge-green' : 'sa-badge-orange'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td>
                            <a
                              href={`/renters/profile?mobile=${encodeURIComponent(r.mobile || '')}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                background: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#475569',
                                textDecoration: 'none'
                              }}
                            >
                              Details
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ── ROW 2: RIDER PAYMENT DUE (LEFT) & DRAFT REGISTRATIONS (RIGHT) ─ */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="sa-row-2-grid" style={{ marginTop: '4px' }}>
            {/* Table 2: Rider Payment Due */}
            <div className="sa-card">
              <div className="sa-card-hdr">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="sa-card-title">Rider Payment Due</span>
                  <span style={{
                    background: '#FEE2E2',
                    color: '#DC2626',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>
                    {riderPaymentDue.length} Overdue
                  </span>
                </div>
                <button
                  onClick={() => showToast('Payment reminders dispatched via WhatsApp to overdue riders!')}
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Send Reminders
                </button>
              </div>
              <div className="sa-card-body" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="ev-table">
                    <thead>
                      <tr>
                        <th>Rider Name</th>
                        <th>Contact</th>
                        <th>Vehicle</th>
                        <th>Amount Due</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riderPaymentDue.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
                            ✓ No pending payment dues.
                          </td>
                        </tr>
                      ) : (
                        riderPaymentDue.map((p: any) => (
                          <tr key={p.id || p.reservation_id}>
                            <td style={{ fontWeight: 700, color: '#0F172A' }}>{p.rider_name}</td>
                            <td style={{ color: '#475569', fontSize: '11.5px' }}>{p.mobile}</td>
                            <td>
                              <span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                {p.vehicle_id || 'EVM102504'}
                              </span>
                            </td>
                            <td style={{ fontWeight: 800, color: '#DC2626' }}>
                              ₹{parseFloat(p.amount_due || 0).toLocaleString('en-IN')}
                            </td>
                            <td>
                              <span className="sa-badge sa-badge-orange">{p.status || 'Payment Due'}</span>
                            </td>
                            <td>
                              <button
                                onClick={() => showToast(`Payment collection initiated for ${p.rider_name} (₹${p.amount_due})`)}
                                style={{
                                  padding: '4px 8px',
                                  background: '#6366F1',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Collect
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Table 3: Draft Registration */}
            <div className="sa-card">
              <div className="sa-card-hdr">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="sa-card-title">Draft Registrations &amp; Pending KYC</span>
                  <span style={{
                    background: '#FEF3C7',
                    color: '#D97706',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>
                    {draftRegistrations.length} In Review
                  </span>
                </div>
                <a href="/new-rider" className="sa-link-all">+ New Rider</a>
              </div>
              <div className="sa-card-body" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="ev-table">
                    <thead>
                      <tr>
                        <th>Applicant Name</th>
                        <th>Mobile</th>
                        <th>Plan</th>
                        <th>KYC Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
                            ✓ No pending draft applications.
                          </td>
                        </tr>
                      ) : (
                        draftRegistrations.map((d: any) => (
                          <tr key={d.id || d.mobile}>
                            <td style={{ fontWeight: 700, color: '#0F172A' }}>{d.rider_name}</td>
                            <td style={{ color: '#475569', fontSize: '11.5px' }}>{d.mobile}</td>
                            <td style={{ fontWeight: 600 }}>{d.package_name || 'Weekly Pro'}</td>
                            <td>
                              <span style={{
                                background: d.kyc_status === 'Under Review' ? '#FEF3C7' : '#EFF6FF',
                                color: d.kyc_status === 'Under Review' ? '#B45309' : '#1D4ED8',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}>
                                {d.kyc_status}
                              </span>
                            </td>
                            <td>
                              <a
                                href={`/new-rider?mobile=${encodeURIComponent(d.mobile || '')}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '4px 8px',
                                  background: '#10B981',
                                  color: '#fff',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textDecoration: 'none'
                                }}
                              >
                                Resume KYC
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ── ROW 3: LIVE FLEET TELEMETRY (CLEAN FULL WIDTH) ─────────────── */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="sa-card" style={{ marginTop: '4px' }}>
            <div className="sa-card-hdr">
              <span className="sa-card-title">Live Fleet Telemetry</span>
              <a href="/vehicles/all" className="sa-link-all">View All Fleet</a>
            </div>
            <div className="sa-card-body" style={{ padding: 0 }}>
              <table className="ev-table">
                <thead>
                  <tr>
                    <th>Vehicle Plate</th>
                    <th>Rider Name</th>
                    <th>Battery SOC</th>
                    <th>Current Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetryFleet.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
                        No EVs registered.
                      </td>
                    </tr>
                  ) : (
                    telemetryFleet.map((v: any) => (
                      <tr key={v.code}>
                        <td style={{ fontWeight: '800', fontFamily: 'Outfit', color: '#0F172A' }}>{v.code}</td>
                        <td>{v.renter_name || 'None (Available)'}</td>
                        <td style={{ fontWeight: '700', color: v.battery_pct > 50 ? '#10B981' : '#F97316' }}>
                          {v.battery_pct}%
                        </td>
                        <td>
                          <span className={`sa-badge ${v.vehicle_status === 'In Ride' ? 'sa-badge-green' : 'sa-badge-blue'}`}>
                            {v.vehicle_status}
                          </span>
                        </td>
                        <td>
                          <a
                            href={`/vehicles/detail?code=${encodeURIComponent(v.code)}`}
                            style={{
                              padding: '3px 8px',
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#334155',
                              textDecoration: 'none'
                            }}
                          >
                            Live GPS
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── 4. OPERATIONS MANAGER DASHBOARD (SUPER ADMIN STYLE) ─ */
/* ──────────────────────────────────────────────────────── */
function GroundOperationsRoleDashboard() {
  const [opsStats, setOpsStats] = useState<any>(null);
  const [todaySummary, setTodaySummary] = useState<any>(null);
  const [co2Stats, setCo2Stats] = useState<any>(null);
  const [fleetVehicles, setFleetVehicles] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentRidersList, setRecentRidersList] = useState<any[]>([]);
  const [currentZone, setCurrentZone] = useState<string>('All Zones');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');

  const fetchDashboardData = async (zoneName?: string) => {
    try {
      setIsRefreshing(true);
      const z = zoneName !== undefined ? zoneName : (typeof window !== 'undefined' ? (localStorage.getItem('evegah_active_zone') || localStorage.getItem('evegah_selected_zone') || 'All Zones') : 'All Zones');
      setCurrentZone(z);
      const queryParam = z && z !== 'All Zones' ? `?zone=${encodeURIComponent(z)}` : '';

      const [opsRes, empRes, todayRes, co2Res, vehRes, reqRes, ridersRes] = await Promise.all([
        api.get(`/stats/operations${queryParam}`).catch(() => null),
        api.get(`/stats/employee${queryParam}`).catch(() => null),
        api.get('/today-summary').catch(() => null),
        api.get('/stats/co2').catch(() => null),
        api.get('/vehicles').catch(() => null),
        api.get('/requests?limit=6').catch(() => null),
        api.get('/renters?limit=6').catch(() => null)
      ]);

      let mergedOps: any = {};
      if (opsRes && opsRes.status === 'success') {
        mergedOps = { ...opsRes.data };
      }
      if (empRes && empRes.status === 'success') {
        mergedOps = { ...mergedOps, ...empRes.data };
      }
      setOpsStats(mergedOps);

      if (todayRes && (todayRes.requestsCreated !== undefined || todayRes.data)) {
        setTodaySummary(todayRes.data || todayRes);
      }

      if (co2Res && (co2Res.co2_saved_kg !== undefined || co2Res.status === 'success')) {
        setCo2Stats(co2Res);
      }

      if (vehRes && (Array.isArray(vehRes) || vehRes.data)) {
        const list = Array.isArray(vehRes) ? vehRes : (vehRes.data || []);
        setFleetVehicles(list);
      }

      if (reqRes && (Array.isArray(reqRes) || reqRes.data)) {
        const reqList = Array.isArray(reqRes) ? reqRes : (reqRes.data || []);
        setRecentRequests(reqList);
      }

      if (ridersRes && (Array.isArray(ridersRes) || ridersRes.data)) {
        const rList = Array.isArray(ridersRes) ? ridersRes : (ridersRes.data || []);
        setRecentRidersList(rList);
      }

      setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.warn('Dashboard live data fetch error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const handleZoneChange = () => {
      const z = localStorage.getItem('evegah_active_zone') || localStorage.getItem('evegah_selected_zone') || 'All Zones';
      fetchDashboardData(z);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('evegah_active_zone_changed', handleZoneChange);
      window.addEventListener('evegah_zone_changed', handleZoneChange);
      return () => {
        window.removeEventListener('evegah_active_zone_changed', handleZoneChange);
        window.removeEventListener('evegah_zone_changed', handleZoneChange);
      };
    }
  }, []);

  const totalFleetCount = fleetVehicles.length || opsStats?.totalFleet || 0;
  const activeRentalsCount = fleetVehicles.filter(v => (v.vehicle_status || '').toLowerCase() === 'in ride').length || opsStats?.activeRides || 0;
  const availableEvsCount = fleetVehicles.filter(v => (v.vehicle_status || '').toLowerCase() === 'available').length || 0;
  const todaySwapsCount = todaySummary?.batterySwapRequests ?? opsStats?.swapsExecutedToday ?? 0;
  const co2SavedValue = co2Stats?.co2_saved_kg !== undefined ? `${co2Stats.co2_saved_kg} kg` : (co2Stats?.data?.kpis?.totalCo2SavedKg !== undefined ? `${co2Stats.data.kpis.totalCo2SavedKg} kg` : '—');

  return (
    <div className="ev-shell">
      <Sidebar activePath="/" />
      <div className="ev-main">
        <TopBar title="Fleet & Operations Dashboard" subtitle={`EV Rental Fleet Management, Battery Swapping & Dispatch Operations (${currentZone})`} hideZone={false} />

        <div className="ev-body">
          {/* Sub Header with Live Status & Refresh Action */}
          <div className="sa-sub-header">
            <div className="sa-sub-title-group">
              <h2 className="sa-sub-title">EV Rental Fleet & Franchise Operations</h2>
              <span className="sa-sub-desc">
                Real-time telematics, fleet battery levels, dispatch logs, and environmental impact
                {lastRefreshedAt && ` • Updated at ${lastRefreshedAt}`}
              </span>
            </div>
            <div className="sa-sub-right">
              <button 
                type="button" 
                onClick={() => fetchDashboardData()} 
                disabled={isRefreshing}
                className="sa-refresh-btn"
                title="Refresh live operations data"
              >
                <svg 
                  width="13" 
                  height="13" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5"
                  style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <a href="/new-rider" className="sa-export-btn">+ Register New Dispatch</a>
            </div>
          </div>

          {/* Quick Operations Action Bar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions:</span>
            <a href="/new-rider" className="sa-action-pill">
              <span style={{ fontSize: '14px' }}>⚡</span> Register Rider
            </a>
            <a href="/retain-rider" className="sa-action-pill">
              <span style={{ fontSize: '14px' }}>🔄</span> Extend / Retain Rental
            </a>
            <a href="/ride-operations/return" className="sa-action-pill">
              <span style={{ fontSize: '14px' }}>🛵</span> Process Return
            </a>
            <a href="/battery-swap" className="sa-action-pill">
              <span style={{ fontSize: '14px' }}>🔋</span> Battery Swap Desk
            </a>
            <a href="/vehicles/all" className="sa-action-pill">
              <span style={{ fontSize: '14px' }}>📋</span> Fleet Inventory
            </a>
            <a href="/reports" className="sa-action-pill">
              <span style={{ fontSize: '14px' }}>📊</span> Reports & Analytics
            </a>
          </div>

          {/* 5 Real KPI Cards */}
          <div className="ev-kpi-grid-5">
            {[
              { label: 'Total Fleet', val: `${totalFleetCount} EVs`, sub: `${availableEvsCount} Available for Rent`, up: true, bg: '#EEF2FF', color: '#6366F1', ic: '🛵' },
              { label: 'Active Rentals', val: `${activeRentalsCount} Rides`, sub: totalFleetCount > 0 ? `${Math.round((activeRentalsCount / totalFleetCount) * 100)}% Fleet Utilization` : 'Active on Road', up: true, bg: '#ECFDF5', color: '#10B981', ic: '🛣️' },
              { label: 'Available EVs', val: `${availableEvsCount} Ready`, sub: 'Ready at Hubs', up: true, bg: '#EFF6FF', color: '#2563EB', ic: '✅' },
              { label: "Today's Swaps", val: `${todaySwapsCount} Swaps`, sub: 'Battery Exchanges Today', up: true, bg: '#F3E8FF', color: '#7E22CE', ic: '⚡' },
              { label: 'CO₂ Saved', val: co2SavedValue, sub: `${co2Stats?.trees_equivalent || 1} Trees Equivalent`, up: true, bg: '#ECFDF5', color: '#059669', ic: '🌱' }
            ].map(k => (
              <div key={k.label} className="ev-kpi-card">
                <div className="ev-kpi-top">
                  <span className="ev-kpi-label">{k.label}</span>
                  <span className="ev-kpi-icon" style={{ background: k.bg, color: k.color, fontWeight: 'bold' }}>{k.ic}</span>
                </div>
                <div className="ev-kpi-val"><AnimatedCount value={k.val} /></div>
                <div className="ev-kpi-bottom">
                  <span className="ev-kpi-trend-up">●</span>
                  <span>{k.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Row 1 Grid: Operational Charts & Corridors */}
          <div className="sa-row-1-grid">
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Fleet Dispatch & Hourly Swaps</span>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Live Telemetry</span>
              </div>
              <div className="sa-card-body">
                <div style={{ height: '180px', position: 'relative' }}>
                  <Line
                    data={{
                      labels: opsStats?.telemetry?.hours || ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
                      datasets: [
                        { 
                          label: 'Dispatched Rides', 
                          data: opsStats?.telemetry?.dispatchedRides || [0, 1, 2, 2, 2, 1, 0], 
                          borderColor: '#2A195C', 
                          backgroundColor: 'rgba(42, 25, 92, 0.08)', 
                          fill: true, 
                          tension: 0.4 
                        },
                        { 
                          label: 'Swaps Processed', 
                          data: opsStats?.telemetry?.swapsProcessed || [0, 1, 3, 3, 3, 2, 0], 
                          borderColor: '#10B981', 
                          backgroundColor: 'rgba(16, 185, 129, 0.08)', 
                          fill: true, 
                          tension: 0.4 
                        }
                      ]
                    }}
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false, 
                      plugins: { legend: { display: true, position: 'top' } } 
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr"><span className="sa-card-title">Fleet Utilization Status</span></div>
              <div className="sa-card-body" style={{ alignItems: 'center' }}>
                <div className="sa-donut-wrap">
                  <Doughnut
                    data={{
                      labels: ['In Ride', 'Available', 'Charging', 'Maintenance'],
                      datasets: [{ 
                        data: [
                          activeRentalsCount,
                          availableEvsCount,
                          fleetVehicles.filter(v => (v.vehicle_status || '').toLowerCase().includes('charg')).length,
                          fleetVehicles.filter(v => (v.vehicle_status || '').toLowerCase().includes('maint')).length
                        ], 
                        backgroundColor: ['#2A195C', '#10B981', '#F59E0B', '#EF4444'],
                        borderWidth: 2,
                        borderColor: '#fff'
                      }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }}
                  />
                  <div className="sa-donut-center">
                    <span className="sa-donut-num">{totalFleetCount}</span>
                    <span className="sa-donut-lbl">Fleet</span>
                  </div>
                </div>
                <div className="sa-donut-legends">
                  <div className="sa-donut-leg-row">
                    <div className="sa-donut-leg-left"><span className="sa-donut-leg-dot" style={{ background: '#2A195C' }} /><span>In Ride</span></div>
                    <span className="sa-donut-leg-val">{activeRentalsCount}</span>
                  </div>
                  <div className="sa-donut-leg-row">
                    <div className="sa-donut-leg-left"><span className="sa-donut-leg-dot" style={{ background: '#10B981' }} /><span>Available</span></div>
                    <span className="sa-donut-leg-val">{availableEvsCount}</span>
                  </div>
                  <div className="sa-donut-leg-row">
                    <div className="sa-donut-leg-left"><span className="sa-donut-leg-dot" style={{ background: '#F59E0B' }} /><span>Charging</span></div>
                    <span className="sa-donut-leg-val">{fleetVehicles.filter(v => (v.vehicle_status || '').toLowerCase().includes('charg')).length}</span>
                  </div>
                  <div className="sa-donut-leg-row">
                    <div className="sa-donut-leg-left"><span className="sa-donut-leg-dot" style={{ background: '#EF4444' }} /><span>Maintenance</span></div>
                    <span className="sa-donut-leg-val">{fleetVehicles.filter(v => (v.vehicle_status || '').toLowerCase().includes('maint')).length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Today's Operational Summary</span>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 'bold' }}>{todaySummary?.date || 'Today'}</span>
              </div>
              <div className="sa-card-body" style={{ gap: '12px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Requests Created</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', fontFamily: 'Outfit' }}>{todaySummary?.requestsCreated ?? 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Requests Completed</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#10B981', fontFamily: 'Outfit' }}>{todaySummary?.requestsCompleted ?? 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Pending Queue</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#F59E0B', fontFamily: 'Outfit' }}>{todaySummary?.pendingRequests ?? 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7E22CE' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Battery Swap Desk</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#7E22CE', fontFamily: 'Outfit' }}>{todaySummary?.batterySwapRequests ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Live Operational Fleet Table & Recent Operational Requests */}
          <div className="sa-row-2-grid">
            {/* Live Fleet Telemetry Table */}
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Live Operational Fleet ({fleetVehicles.length} Vehicles)</span>
                <a href="/vehicles/all" className="sa-link-all">View All Fleet →</a>
              </div>
              <div className="sa-card-body" style={{ padding: 0 }}>
                {fleetVehicles.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                    No vehicles registered yet. <a href="/vehicles/all" style={{ color: '#2A195C', fontWeight: 'bold' }}>Register a Vehicle</a>
                  </div>
                ) : (
                  <table className="ev-table">
                    <thead>
                      <tr>
                        <th>Vehicle Code</th>
                        <th>Model</th>
                        <th>Assigned Rider</th>
                        <th>Battery SOC</th>
                        <th>Zone</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fleetVehicles.map((v: any) => {
                        const batteryNum = typeof v.battery_pct === 'number' ? v.battery_pct : parseInt(String(v.battery_pct || '0'), 10) || 0;
                        const batteryColor = batteryNum >= 60 ? '#10B981' : batteryNum >= 30 ? '#F59E0B' : '#EF4444';
                        const isRide = (v.vehicle_status || '').toLowerCase() === 'in ride';
                        return (
                          <tr key={v.id || v.code}>
                            <td style={{ fontWeight: '800', fontFamily: 'Outfit', color: '#2A195C' }}>{v.code}</td>
                            <td style={{ fontWeight: '600', color: '#475569' }}>{v.evegah_model_name || v.vehicle_model || 'Evegah EV'}</td>
                            <td style={{ fontWeight: '700' }}>{v.renter_name && v.renter_name !== 'None (Available)' ? v.renter_name : <span style={{ color: '#94A3B8', fontWeight: 500 }}>Unassigned</span>}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '45px', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${Math.min(batteryNum, 100)}%`, height: '100%', background: batteryColor }} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '11px', color: batteryColor }}>{batteryNum}%</span>
                              </div>
                            </td>
                            <td><span style={{ fontSize: '11.5px', color: '#64748B' }}>{v.zone || 'Gotri Zone'}</span></td>
                            <td>
                              <span className={`sa-badge ${isRide ? 'sa-badge-blue' : 'sa-badge-green'}`}>
                                {v.vehicle_status || 'Available'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Recent Requests & Activities */}
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Recent Activity & Operations Requests</span>
                <a href="/attendance" className="sa-link-all">View All →</a>
              </div>
              <div className="sa-card-body" style={{ padding: 0 }}>
                {recentRequests.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📥</div>
                    No pending operational requests at this moment.
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>All dispatch and return queues are clear.</div>
                  </div>
                ) : (
                  <table className="ev-table">
                    <thead>
                      <tr>
                        <th>Request Type</th>
                        <th>Requester / Rider</th>
                        <th>Created At</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((req: any, idx: number) => (
                        <tr key={req.id || idx}>
                          <td style={{ fontWeight: '700' }}>{req.type || req.request_type || 'Operations Request'}</td>
                          <td>{req.requester_name || req.rider_name || 'System'}</td>
                          <td style={{ fontSize: '11px', color: '#64748B' }}>{req.created_at ? new Date(req.created_at).toLocaleDateString() : '—'}</td>
                          <td>
                            <span className={`sa-badge ${req.status === 'Completed' ? 'sa-badge-green' : req.status === 'Pending' ? 'sa-badge-orange' : 'sa-badge-blue'}`}>
                              {req.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Active Riders & Rental Packages Overview */}
          <div className="sa-row-2-grid">
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Active Fleet Riders ({recentRidersList.length})</span>
                <a href="/renters" className="sa-link-all">All Riders & Rentals →</a>
              </div>
              <div className="sa-card-body" style={{ padding: 0 }}>
                {recentRidersList.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                    No active renters found.
                  </div>
                ) : (
                  <table className="ev-table">
                    <thead>
                      <tr>
                        <th>Rider Name</th>
                        <th>Contact</th>
                        <th>Assigned EV</th>
                        <th>Plan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRidersList.slice(0, 5).map((r: any) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: '700', color: '#0F172A' }}>{r.rider_name}</td>
                          <td style={{ fontSize: '11.5px', color: '#64748B' }}>{r.mobile}</td>
                          <td style={{ fontWeight: '800', fontFamily: 'Outfit', color: '#2A195C' }}>{r.vehicle_id && r.vehicle_id !== '—' ? r.vehicle_id : '—'}</td>
                          <td><span style={{ fontSize: '11.5px', fontWeight: 600 }}>{r.package_name || 'Standard'}</span></td>
                          <td>
                            <span className={`sa-badge ${r.status === 'Active Ride' ? 'sa-badge-green' : r.status === 'Return' ? 'sa-badge-blue' : 'sa-badge-orange'}`}>
                              {r.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Environmental Impact & Green Fleet Metrics</span>
                <a href="/co2-saving" className="sa-link-all">CO₂ Analytics →</a>
              </div>
              <div className="sa-card-body" style={{ gap: '14px', justifyContent: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '14px', background: '#ECFDF5', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>CO₂ Emissions Offset</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#047857', fontFamily: 'Outfit', margin: '4px 0' }}>
                      {co2Stats?.co2_saved_kg ?? 20} kg
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#065F46' }}>Based on ARAI / BEE EV standard</div>
                  </div>

                  <div style={{ padding: '14px', background: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>Petrol Fuel Avoided</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#1D4ED8', fontFamily: 'Outfit', margin: '4px 0' }}>
                      {co2Stats?.fuel_saved_litres ?? 5} Litres
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#1E40AF' }}>Direct fossil fuel reduction</div>
                  </div>

                  <div style={{ padding: '14px', background: '#FAF5FF', borderRadius: '12px', border: '1px solid #E9D5FF' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase' }}>Trees Equivalent</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#7E22CE', fontFamily: 'Outfit', margin: '4px 0' }}>
                      {co2Stats?.trees_equivalent ?? 1} Trees
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#6B21A8' }}>Annual tree absorption</div>
                  </div>

                  <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Total Clean Distance</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', fontFamily: 'Outfit', margin: '4px 0' }}>
                      {co2Stats?.total_km ?? 210} km
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748B' }}>Verified telemetry reading</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── 5. SUPPORT EXECUTIVE ROLE DASHBOARD (SUPER ADMIN) ─── */
/* ──────────────────────────────────────────────────────── */
function SupportExecutiveRoleDashboard() {
  return (
    <div className="ev-shell">
      <Sidebar activePath="/" />
      <div className="ev-main">
        <TopBar title="Support Executive Dashboard" subtitle="Customer Tickets, Rider Complaints, Reservation Assistance & Live Support Telemetry" hideZone={false} />

        <div className="ev-body">
          <div className="sa-sub-header">
            <div className="sa-sub-title-group">
              <h2 className="sa-sub-title">Rider Support & Service Telemetry</h2>
              <span className="sa-sub-desc">Real-time rider tickets, complaint resolution status & reservation desk</span>
            </div>
            <div className="sa-sub-right">
              
              <button className="sa-export-btn">+ Create Support Ticket</button>
            </div>
          </div>

          {/* 5 Top KPI Cards */}
          <div className="ev-kpi-grid-5">
            {[
              { label: 'Open Support Tickets', val: '—', change: '—', up: true, bg: '#FEF2F2', color: '#EF4444', ic: '🎧' },
              { label: 'Resolved Today', val: '—', change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '✅' },
              { label: 'Avg First Response', val: '—', change: '—', up: true, bg: '#EFF6FF', color: '#2563EB', ic: '⏱️' },
              { label: 'Customer Satisfaction', val: '—', change: '—', up: true, bg: '#EEF2FF', color: '#6366F1', ic: '⭐' },
              { label: 'Active Reservations', val: '—', change: '—', up: true, bg: '#F3E8FF', color: '#7E22CE', ic: '📅' }
            ].map(k => (
              <div key={k.label} className="ev-kpi-card">
                <div className="ev-kpi-top">
                  <span className="ev-kpi-label">{k.label}</span>
                  <span className="ev-kpi-icon" style={{ background: k.bg, color: k.color, fontWeight: 'bold' }}>{k.ic}</span>
                </div>
                <div className="ev-kpi-val"><AnimatedCount value={k.val} /></div>
                <div className="ev-kpi-bottom">
                  <span className="ev-kpi-trend-up">↑ {k.change}</span>
                  <span>vs last shift</span>
                </div>
              </div>
            ))}
          </div>

          {/* Row 1 Grid */}
          <div className="sa-row-1-grid">
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Support Ticket Volume & Resolution Speed</span>
                <select className="sa-select-light"><option>Today</option></select>
              </div>
              <div className="sa-card-body">
                <div style={{ height: '180px', position: 'relative' }}>
                  <Line
                    data={{
                      labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
                      datasets: [
                        { label: 'Incoming Tickets', data: [15, 32, 45, 50, 38, 24, 12], borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.12)', fill: true, tension: 0.4 },
                        { label: 'Resolved Tickets', data: [12, 30, 42, 48, 36, 22, 11], borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.12)', fill: true, tension: 0.4 }
                      ]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' } } }}
                  />
                </div>
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr"><span className="sa-card-title">Ticket Categories Breakdown</span></div>
              <div className="sa-card-body" style={{ alignItems: 'center' }}>
                <div className="sa-donut-wrap">
                  <Doughnut
                    data={{
                      labels: ['Unlock Issue (42%)', 'Payment Query (28%)', 'Swap Inquiry (18%)', 'General Info (12%)'],
                      datasets: [{ data: [65, 44, 28, 19], backgroundColor: ['#EF4444', '#6366F1', '#F59E0B', '#10B981'] }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }}
                  />
                  <div className="sa-donut-center">
                    <span className="sa-donut-num">156</span>
                    <span className="sa-donut-lbl">Today</span>
                  </div>
                </div>
                <div className="sa-donut-legends">
                  <div className="sa-donut-leg-row"><span>Unlock Issue</span><span className="sa-donut-leg-val">65 (41.7%)</span></div>
                  <div className="sa-donut-leg-row"><span>Payment Query</span><span className="sa-donut-leg-val">44 (28.2%)</span></div>
                  <div className="sa-donut-leg-row"><span>Swap Inquiry</span><span className="sa-donut-leg-val">28 (17.9%)</span></div>
                  <div className="sa-donut-leg-row"><span>General Info</span><span className="sa-donut-leg-val">19 (12.2%)</span></div>
                </div>
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Top Agent Performers</span>
                <a href="/users" className="sa-link-all">View All</a>
              </div>
              <div className="sa-card-body">
                <div className="sa-rank-list">
                  {[
                    { name: 'Amit Kumar', val: '48 Resolved', color: '#10B981' },
                    { name: 'Neha Singh', val: '42 Resolved', color: '#6366F1' },
                    { name: 'Priya Sharma', val: '36 Resolved', color: '#F59E0B' },
                    { name: 'Suresh Mehta', val: '28 Resolved', color: '#3B82F6' }
                  ].map((a, idx) => (
                    <div key={a.name} className="sa-rank-row">
                      <div className="sa-rank-left">
                        <span className="sa-rank-circle" style={{ background: a.color }}>{idx + 1}</span>
                        <span className="sa-rank-name">{a.name}</span>
                      </div>
                      <span className="sa-rank-val">{a.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 6 Small KPIs Row */}
          <div className="sa-kpi-row-6">
            {[
              { label: 'SLA Adherence', val: '99.1%', change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '🎯' },
              { label: 'Live Chat Queue', val: '3 Waiting', change: '—', up: true, bg: '#FFF7ED', color: '#F97316', ic: '💬' },
              { label: 'Pending Refunds', val: '₹4,200', change: '—', up: true, bg: '#EEF2FF', color: '#2563EB', ic: '💳' },
              { label: 'Call Volume', val: '86 Calls', change: '—', up: true, bg: '#EEF2FF', color: '#6366F1', ic: '📞' },
              { label: 'Escalated Tickets', val: '1 Escalated', change: '—', up: true, bg: '#FEF2F2', color: '#EF4444', ic: '🚨' },
              { label: 'App Feedback Score', val: '4.9 / 5', change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '⭐' }
            ].map(k => (
              <div key={k.label} className="ev-kpi-card" style={{ padding: '12px' }}>
                <div className="ev-kpi-top">
                  <span className="ev-kpi-label" style={{ fontSize: '9.5px' }}>{k.label}</span>
                  <span className="ev-kpi-icon" style={{ width: '28px', height: '28px', background: k.bg, color: k.color }}>{k.ic}</span>
                </div>
                <div className="ev-kpi-val" style={{ fontSize: '18px', margin: '6px 0 2px' }}><AnimatedCount value={k.val} /></div>
                <div className="ev-kpi-bottom" style={{ fontSize: '9.5px' }}>
                  <span className={k.up ? 'sa-kpi-card-trend-up' : 'sa-kpi-card-trend-dn'}>{k.up ? '↑' : '↓'} {k.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Table & Reservations Grid */}
          <div className="sa-row-3-grid">
            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Recent Rider Support Tickets</span>
                <a href="/alerts" className="sa-link-all">View All Tickets</a>
              </div>
              <div className="sa-card-body" style={{ padding: 0 }}>
                <table className="ev-table">
                  <thead>
                    <tr><th>Ticket ID</th><th>Rider Name</th><th>Issue Category</th><th>Priority</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {[
                      { id: '#TCK-9901', rider: 'Rajesh Kumar', category: 'Unlock Scooter Failure', priority: 'High', st: 'In Progress', bg: 'sa-badge-red' },
                      { id: '#TCK-9900', rider: 'Pooja Verma', category: 'Deposit Refund Status', priority: 'Medium', st: 'Open', bg: 'sa-badge-orange' },
                      { id: '#TCK-9899', rider: 'Vikram Singh', category: 'Swap Cabinet Door Jammed', priority: 'High', st: 'Resolved', bg: 'sa-badge-green' },
                      { id: '#TCK-9898', rider: 'Ananya Roy', category: 'Fare Discount Code Inquiry', priority: 'Low', st: 'Resolved', bg: 'sa-badge-green' }
                    ].map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: '800', fontFamily: 'Outfit' }}>{t.id}</td>
                        <td style={{ fontWeight: '700' }}>{t.rider}</td>
                        <td>{t.category}</td>
                        <td><span className={t.priority === 'High' ? 'sa-badge sa-badge-red' : 'sa-badge sa-badge-orange'}>{t.priority}</span></td>
                        <td><span className={`sa-badge ${t.bg}`}>{t.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr">
                <span className="sa-card-title">Upcoming Rider Reservations</span>
                <a href="/renters/reserved" className="sa-link-all">View Desk</a>
              </div>
              <div className="sa-card-body" style={{ padding: 0 }}>
                <table className="ev-table">
                  <thead>
                    <tr><th>Reservation ID</th><th>Customer Name</th><th>Vehicle Type</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                        No reservations found
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── 5. MAINTENANCE TECHNICIAN ROLE DASHBOARD ──────────── */
/* ──────────────────────────────────────────────────────── */
function MaintenanceTechnicianRoleDashboard() {
  return (
    <div className="ev-shell">
      <Sidebar activePath="/" />
      <div className="ev-main">
        <TopBar title="Maintenance & Fleet Engineer Dashboard" subtitle="Diagnostic telemetry, IoT device health, work order tickets, and battery swapping maintenance." hideZone={false} />

        <div className="ev-body">
          <div className="sa-sub-header">
            <div className="sa-sub-title-group">
              <h2 className="sa-sub-title">Fleet Diagnostics & Repairs</h2>
              <span className="sa-sub-desc">Active workshop tickets, hardware health, and maintenance schedule</span>
            </div>
            <div className="sa-sub-right">
              <a href="/maintenance" className="sa-export-btn">+ Create Work Order</a>
            </div>
          </div>

          <div className="ev-kpi-grid-5">
            {[
              { label: 'In Workshop', val: '—', change: '—', up: true, bg: '#FEF2F2', color: '#EF4444', ic: '🔧' },
              { label: 'Critical IoT Alerts', val: '—', change: '—', up: true, bg: '#FEF2F2', color: '#EF4444', ic: '🚨' },
              { label: 'Resolved Today', val: '—', change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '✓' },
              { label: 'Active Sensors', val: '—', change: '—', up: true, bg: '#EEF2FF', color: '#6366F1', ic: '📡' },
              { label: 'Battery Health', val: '—', change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '🔋' }
            ].map(k => (
              <div key={k.label} className="ev-kpi-card">
                <div className="ev-kpi-top">
                  <span className="ev-kpi-label">{k.label}</span>
                  <span className="ev-kpi-icon" style={{ background: k.bg, color: k.color, fontWeight: 'bold' }}>{k.ic}</span>
                </div>
                <div className="ev-kpi-val"><AnimatedCount value={k.val} /></div>
                <div className="ev-kpi-bottom">
                  <span className={k.up ? 'sa-kpi-card-trend-up' : 'sa-kpi-card-trend-dn'}>{k.change}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="sa-card">
            <div className="sa-card-hdr">
              <span className="sa-card-title">Active Work Order Tickets</span>
              <a href="/maintenance" className="sa-link-all">View All Orders</a>
            </div>
            <div className="sa-card-body" style={{ padding: 0 }}>
              <table className="ev-table">
                <thead>
                  <tr><th>Ticket ID</th><th>Vehicle Plate</th><th>Diagnostic Issue</th><th>Priority</th><th>Assigned Engineer</th><th>Status</th></tr>
                </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                        No active work orders
                      </td>
                    </tr>
                  </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── 6. FINANCE & ACCOUNTS ROLE DASHBOARD ──────────────── */
/* ──────────────────────────────────────────────────────── */
function FinanceAccountsRoleDashboard() {
  return (
    <div className="ev-shell">
      <Sidebar activePath="/" />
      <div className="ev-main">
        <TopBar title="Finance & Accounts Dashboard" subtitle="Financial analytics, billing collections, subscription payouts, and operational expenses." hideZone={false} />

        <div className="ev-body">
          <div className="sa-sub-header">
            <div className="sa-sub-title-group">
              <h2 className="sa-sub-title">Financial Summary & Revenue Collections</h2>
              <span className="sa-sub-desc">Monthly collections, payouts, and margin performance</span>
            </div>
            <div className="sa-sub-right">
              <a href="/franchise/expenses" className="sa-export-btn">View Expense Reports</a>
            </div>
          </div>

          <div className="ev-kpi-grid-5">
            {[
              { label: 'Total Revenue', val: '₹28,45,900', change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '₹' },
              { label: 'Monthly Collections', val: '₹12,40,000', change: '—', up: true, bg: '#EFF6FF', color: '#2563EB', ic: '💳' },
              { label: 'Pending Invoices', val: '₹1,15,000', change: '—', up: true, bg: '#FFF7ED', color: '#F97316', ic: '📜' },
              { label: 'Franchise Payouts', val: '₹8,90,000', change: '—', up: true, bg: '#EEF2FF', color: '#6366F1', ic: '🏦' },
              { label: 'Net Margin', val: '—', change: '—', up: true, bg: '#ECFDF5', color: '#10B981', ic: '📊' }
            ].map(k => (
              <div key={k.label} className="ev-kpi-card">
                <div className="ev-kpi-top">
                  <span className="ev-kpi-label">{k.label}</span>
                  <span className="ev-kpi-icon" style={{ background: k.bg, color: k.color, fontWeight: 'bold' }}>{k.ic}</span>
                </div>
                <div className="ev-kpi-val"><AnimatedCount value={k.val} /></div>
                <div className="ev-kpi-bottom">
                  <span className="ev-kpi-trend-up">↑ {k.change}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="sa-card">
            <div className="sa-card-hdr">
              <span className="sa-card-title">Recent Invoices & Transactions</span>
              <a href="/franchise/expenses" className="sa-link-all">View All</a>
            </div>
            <div className="sa-card-body" style={{ padding: 0 }}>
              <table className="ev-table">
                <thead>
                  <tr><th>Invoice No</th><th>Tenant / Customer</th><th>Payment Mode</th><th>Amount</th><th>Status</th></tr>
                </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                        No recent invoices found
                      </td>
                    </tr>
                  </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
