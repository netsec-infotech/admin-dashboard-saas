"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Clear previous role session on mount
  useEffect(() => {
    localStorage.removeItem("evegah_role");
  }, []);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const result = await response.json();

      // Check success cleanly across both backend formats
      const isSuccess = response.ok && (result.success === true || result.status === 'success');

      if (!isSuccess) {
        setErrorMessage(
          result.message ||
          result.error ||
          'Access Denied: Invalid credentials or account not authorized.'
        );
        setLoading(false);
        return;
      }

      // Extract user information safely from root or data payload
      const user = result.user || result.data?.user || {};
      const evegahRole = result.evegahRole || result.data?.evegahRole || user.evegahRole || 'super_admin';
      const userRole = user.role || (evegahRole === 'super_admin' ? 'Super Admin' : evegahRole === 'employee' ? 'Zone Employee' : 'Zone Admin');
      const defaultAssignedDash = result.defaultDashboard || result.data?.defaultDashboard || 'Super Admin Dashboard';
      const assignedZone = user.zone || 'Gotri Zone';
      const token = result.token || result.data?.token || `EVG_TOKEN_${Date.now()}`;
      const permissions = result.permissions || result.data?.permissions;

      // Save user session
      localStorage.setItem("evegah_role", evegahRole);
      localStorage.setItem("evegah_user_role_name", userRole);
      localStorage.setItem("evegah_assigned_dashboard", defaultAssignedDash);
      localStorage.setItem("evegah_user_name", user.name || email.split('@')[0]);
      localStorage.setItem("evegah_user_email", user.email || email);
      localStorage.setItem("evegah_user_zone", assignedZone);
      localStorage.setItem("evegah_active_zone", assignedZone);
      localStorage.setItem("evegah_selected_zone", assignedZone);
      localStorage.setItem("evegah_token", token);

      if (user.avatar_url) {
        localStorage.setItem("evegah_user_avatar", user.avatar_url);
      }
      if (permissions) {
        localStorage.setItem("evegah_user_permissions", JSON.stringify(permissions));
      }

      window.dispatchEvent(new Event("evegah_role_changed"));

      // Direct to corresponding dashboard based on backend assigned role
      const isEmployee = 
        evegahRole === 'employee' || 
        evegahRole === 'zone_employee' || 
        evegahRole === 'employee_dashboard' || 
        userRole.toLowerCase().includes('employee') || 
        defaultAssignedDash.toLowerCase().includes('employee');

      if (isEmployee) {
        router.push('/employee-dashboard');
      } else if (evegahRole === 'super_admin' || userRole.toLowerCase().includes('super')) {
        router.push('/super-admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage('Unable to connect to authentication server. Please check your network or ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&display=swap');

        .login-page-root {
          min-height: 100vh;
          width: 100%;
          background: #FFFFFF;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow-x: hidden;
          color: #0F172A;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Top Header Bar */
        .login-top-bar {
          width: 100%;
          padding: 24px 48px 12px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 20;
          box-sizing: border-box;
        }

        .login-brand-logo {
          height: 38px;
          object-fit: contain;
          image-rendering: -webkit-optimize-contrast;
        }

        .login-header-right {
          font-size: 13px;
          color: #475569;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .login-contact-btn {
          color: #16A34A;
          font-weight: 700;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          transition: all 0.2s ease;
          text-decoration: none;
          font-family: inherit;
        }

        .login-contact-btn:hover {
          color: #15803D;
          text-decoration: underline;
        }

        /* Main Center Layout */
        .login-main-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 48px 24px 48px;
          position: relative;
          z-index: 10;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
          gap: 40px;
        }

        /* Left Hero Column */
        .login-hero-col {
          flex: 1.15;
          max-width: 650px;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 5;
        }

        .hero-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 44px;
          font-weight: 800;
          color: #1E1548;
          line-height: 1.14;
          letter-spacing: -0.025em;
          margin: 0 0 14px 0;
        }

        .hero-green-highlight {
          color: #22C55E;
          display: inline;
        }

        .hero-subtext {
          font-size: 14px;
          color: #64748B;
          line-height: 1.55;
          margin: 0 0 28px 0;
          max-width: 530px;
          font-weight: 500;
        }

        /* 4 Feature Badges in a Row */
        .hero-badges-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 28px;
        }

        .hero-badge-card {
          background: #FFFFFF;
          border: 1px solid #F1F5F9;
          border-radius: 14px;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hero-badge-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px -4px rgba(15, 23, 42, 0.08);
        }

        .hero-badge-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          font-size: 18px;
        }

        .badge-icon-purple { background: #EEF2FF; color: #6366F1; }
        .badge-icon-blue { background: #E0F2FE; color: #0284C7; }
        .badge-icon-teal { background: #D1FAE5; color: #059669; }
        .badge-icon-green { background: #DCFCE7; color: #16A34A; }

        .hero-badge-name {
          font-size: 12px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1.25;
          margin-bottom: 3px;
        }

        .hero-badge-desc {
          font-size: 10.5px;
          color: #64748B;
          line-height: 1.25;
          font-weight: 500;
        }

        /* Vehicle & Waterfront Scenic Showcase */
        .hero-scenic-frame {
          width: 100%;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.12);
          border: 1px solid rgba(226, 232, 240, 0.8);
          background: #F8FAFC;
        }

        .hero-scenic-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
          transform: scale(1.005);
          transition: transform 0.5s ease;
        }

        .hero-scenic-frame:hover .hero-scenic-img {
          transform: scale(1.02);
        }

        /* Right Card Column */
        .login-card-col {
          flex: 0.95;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 15;
          max-width: 470px;
          width: 100%;
        }

        .login-card {
          background: #FFFFFF;
          border-radius: 26px;
          padding: 34px 38px 26px 38px;
          box-shadow: 0 25px 65px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.04);
          width: 100%;
          box-sizing: border-box;
          position: relative;
        }

        .card-header-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #1E1548;
          text-align: center;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .card-header-subtitle {
          font-size: 13.5px;
          color: #64748B;
          text-align: center;
          margin: 0 0 22px 0;
          font-weight: 500;
        }

        .login-field {
          margin-bottom: 14px;
        }

        .login-label {
          display: block;
          font-size: 12.5px;
          font-weight: 700;
          color: #1E293B;
          margin-bottom: 6px;
        }

        .login-input-box {
          position: relative;
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 11px;
          transition: all 0.2s ease;
        }

        .login-input-box:focus-within {
          border-color: #22C55E;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
        }

        .input-icon-left {
          position: absolute;
          left: 14px;
          color: #94A3B8;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .login-input-control {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-size: 13.5px;
          color: #0F172A;
          padding: 12px 14px 12px 42px;
          font-weight: 500;
          font-family: inherit;
        }

        .login-input-control::placeholder {
          color: #94A3B8;
          font-weight: 400;
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          padding: 4px;
          color: #94A3B8;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .password-toggle-btn:hover {
          color: #475569;
        }

        /* Checkbox & Forgot Password */
        .login-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 12px 0 18px 0;
          font-size: 13px;
        }

        .remember-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          cursor: pointer;
          font-weight: 500;
        }

        .remember-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #22C55E;
          border-radius: 4px;
          cursor: pointer;
        }

        .forgot-link {
          color: #16A34A;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.15s;
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
        }

        .forgot-link:hover {
          color: #15803D;
          text-decoration: underline;
        }

        /* Sign In Main Button */
        .signin-submit-btn {
          width: 100%;
          background: #1E1548;
          color: #FFFFFF;
          border: none;
          border-radius: 11px;
          padding: 13px 20px;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(30, 21, 72, 0.25);
          font-family: inherit;
        }

        .signin-submit-btn:hover {
          background: #2D1F68;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(30, 21, 72, 0.35);
        }

        .signin-submit-btn:active {
          transform: translateY(0);
        }

        .signin-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Bottom Help Pill */
        .help-support-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 13px;
          padding: 11px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .help-support-card:hover {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }

        .help-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .help-headset-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #DCFCE7;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #16A34A;
          flex-shrink: 0;
        }

        .help-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #1E293B;
          line-height: 1.2;
        }

        .help-subtitle {
          font-size: 11px;
          color: #64748B;
          line-height: 1.2;
          margin-top: 2px;
        }

        .help-right {
          display: flex;
          align-items: center;
          gap: 6px;
          text-align: right;
        }

        .help-email {
          font-size: 11px;
          font-weight: 600;
          color: #334155;
          line-height: 1.2;
        }

        .help-phone {
          font-size: 11.5px;
          font-weight: 700;
          color: #1E293B;
          line-height: 1.2;
          margin-top: 2px;
        }

        .help-chevron {
          color: #94A3B8;
        }

        /* Below Card Copyright */
        .login-card-footer {
          margin-top: 16px;
          text-align: center;
        }

        .copyright-text {
          font-size: 11.5px;
          color: #64748B;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .legal-links {
          font-size: 11px;
          color: #64748B;
          font-weight: 500;
        }

        .legal-links a {
          color: #64748B;
          text-decoration: none;
          transition: color 0.15s;
        }

        .legal-links a:hover {
          color: #1E293B;
          text-decoration: underline;
        }

        /* Right Curved Decorative Panel */
        .right-curve-container {
          position: absolute;
          top: 0;
          right: 0;
          width: 480px;
          height: 100%;
          pointer-events: none;
          z-index: 2;
          overflow: hidden;
        }

        .right-curve-svg {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
        }

        .right-strip-items {
          position: absolute;
          top: 32%;
          right: 22px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          z-index: 3;
          pointer-events: auto;
        }

        .strip-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          color: #FFFFFF;
          cursor: default;
        }

        .strip-icon {
          width: 24px;
          height: 24px;
          color: #FFFFFF;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
        }

        .strip-label {
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.92);
          line-height: 1.25;
          text-align: center;
        }

        /* Bottom Right Go Green Badge */
        .bottom-right-badge {
          position: absolute;
          bottom: 18px;
          right: 28px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 8px;
          pointer-events: none;
        }

        .go-green-badge-img {
          height: 48px;
          object-fit: contain;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1100px) {
          .right-curve-container {
            display: none;
          }
          .login-main-container {
            flex-direction: column;
            align-items: center;
            padding: 10px 24px;
          }
          .login-hero-col {
            max-width: 100%;
            text-align: center;
            align-items: center;
          }
          .hero-badges-row {
            width: 100%;
          }
          .login-top-bar {
            padding: 20px 24px;
          }
          .bottom-right-badge {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 32px;
          }
          .hero-badges-row {
            grid-template-columns: repeat(2, 1fr);
          }
          .login-card {
            padding: 24px 20px;
            border-radius: 20px;
          }
        }
      `}</style>

      {/* Top Header */}
      <header className="login-top-bar">
        <div className="login-brand-group">
          <img src="/evegah_logo_clean.png" alt="Evegah" className="login-brand-logo" />
        </div>

        <div className="login-header-right">
          <span>Don&apos;t have an account?</span>
          <button
            type="button"
            className="login-contact-btn"
            onClick={() => setSupportModalOpen(true)}
          >
            Contact Admin
          </button>
        </div>
      </header>

      {/* Right Decorative Curve & Feature Strip */}
      <aside className="right-curve-container" aria-hidden="true">
        <svg
          className="right-curve-svg"
          viewBox="0 0 480 900"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Deep Navy/Purple Organic Curved Shape */}
          <path
            d="M210 0 C140 180 180 340 260 520 C340 700 480 820 480 900 L480 0 Z"
            fill="url(#curveGradient)"
          />
          {/* Glowing Green Rim Accent */}
          <path
            d="M210 0 C140 180 180 340 260 520 C340 700 480 820 480 900"
            stroke="#22C55E"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="curveGradient" x1="210" y1="0" x2="480" y2="900" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1B1240" />
              <stop offset="0.6" stopColor="#241554" />
              <stop offset="1" stopColor="#140D33" />
            </linearGradient>
          </defs>
        </svg>

        {/* 3 Right Vertical Features */}
        <div className="right-strip-items">
          {/* Item 1: Cleaner Environment */}
          <div className="strip-item">
            <svg className="strip-icon" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 4 13C4 8.5 7.5 4 14 3c0 0 0 3-1 6" />
              <path d="M11 20c4.5 0 8.5-3.5 9.5-10 0 0-3 0-6 1" />
              <path d="M11 20v-7" />
            </svg>
            <span className="strip-label">Cleaner<br />Environment</span>
          </div>

          {/* Item 2: Smarter Operations */}
          <div className="strip-item">
            <svg className="strip-icon" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="strip-label">Smarter<br />Operations</span>
          </div>

          {/* Item 3: Brighter Tomorrow */}
          <div className="strip-item">
            <svg className="strip-icon" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span className="strip-label">Brighter<br />Tomorrow</span>
          </div>
        </div>
      </aside>

      {/* Main Center Content */}
      <main className="login-main-container">
        {/* Left Hero Section */}
        <section className="login-hero-col">
          <h1 className="hero-title">
            Smart Mobility<br />
            for a <span className="hero-green-highlight">Greener</span> Tomorrow
          </h1>

          <p className="hero-subtext">
            Manage your entire EV ecosystem — riders, fleets, rentals, battery operations and more, all in one powerful platform.
          </p>

          {/* 4 Feature Badges in a Row */}
          <div className="hero-badges-row">
            <div className="hero-badge-card">
              <div className="hero-badge-icon badge-icon-purple">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="hero-badge-name">Real-time Analytics</div>
              <div className="hero-badge-desc">Data-driven decisions</div>
            </div>

            <div className="hero-badge-card">
              <div className="hero-badge-icon badge-icon-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="hero-badge-name">Role-based Access</div>
              <div className="hero-badge-desc">Secure &amp; scalable</div>
            </div>

            <div className="hero-badge-card">
              <div className="hero-badge-icon badge-icon-teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 11 12 14 16 10" />
                </svg>
              </div>
              <div className="hero-badge-name">Operations Control</div>
              <div className="hero-badge-desc">Manage fleets, rentals &amp; swaps</div>
            </div>

            <div className="hero-badge-card">
              <div className="hero-badge-icon badge-icon-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 20A7 7 0 0 1 4 13C4 8.5 7.5 4 14 3c0 0 0 3-1 6" />
                  <path d="M11 20c4.5 0 8.5-3.5 9.5-10 0 0-3 0-6 1" />
                  <path d="M11 20v-7" />
                </svg>
              </div>
              <div className="hero-badge-name">Sustainable Impact</div>
              <div className="hero-badge-desc">Cleaner cities together</div>
            </div>
          </div>

          {/* EV Vehicle, Charging Station & Waterfront Cityscape */}
          <div className="hero-scenic-frame">
            <img
              src="/evegah_hero_scene_hd.png"
              alt="Evegah Smart EV Scooter and Charging Station"
              className="hero-scenic-img"
            />
          </div>
        </section>

        {/* Right Login Card */}
        <section className="login-card-col">
          <div className="login-card">
            <h2 className="card-header-title">Welcome Back!</h2>
            <p className="card-header-subtitle">Sign in to your Evegah Admin Dashboard</p>

            {errorMessage && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  color: '#991B1B',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div style={{ fontWeight: 600 }}>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              {/* Email Address */}
              <div className="login-field">
                <label className="login-label">Email Address</label>
                <div className="login-input-box">
                  <span className="input-icon-left">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    className="login-input-control"
                    placeholder="Enter your registered email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <label className="login-label">Password</label>
                <div className="login-input-box">
                  <span className="input-icon-left">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="login-input-control"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="login-actions-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    className="remember-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => setSupportModalOpen(true)}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button type="submit" className="signin-submit-btn" disabled={loading}>
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>

              {/* Enterprise Security Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 14px',
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px dashed #CBD5E1',
                  margin: '18px 0 14px 0',
                  color: '#64748B',
                  fontSize: '11px',
                  fontWeight: 600
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Authorized System Login Only &bull; Role &amp; Zone Protected</span>
              </div>

              {/* Bottom Help Support Banner */}
              <div
                className="help-support-card"
                onClick={() => setSupportModalOpen(true)}
              >
                <div className="help-left">
                  <div className="help-headset-circle">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="help-title">Need help?</div>
                    <div className="help-subtitle">Contact our support team</div>
                  </div>
                </div>

                <div className="help-right">
                  <div>
                    <div className="help-email">support@evegah.com</div>
                    <div className="help-phone">+91 98765 43210</div>
                  </div>
                  <svg className="help-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Copyright */}
          <div className="login-card-footer">
            <div className="copyright-text">
              &copy; 2026 Evegah Technologies Pvt. Ltd. All rights reserved.
            </div>
            <div className="legal-links">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Evegah Technologies Pvt. Ltd. Privacy Policy"); }}>Privacy Policy</a>
              <span> &nbsp;|&nbsp; </span>
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Evegah Technologies Pvt. Ltd. Terms of Service"); }}>Terms of Service</a>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Right "Go Green Go Further" Badge */}
      <div className="bottom-right-badge">
        <img
          src="/go_green_badge_transparent.png"
          alt="Go Green Go Further"
          className="go-green-badge-img"
        />
      </div>

      {/* Contact Support / Admin Modal */}
      {supportModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setSupportModalOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E1548', margin: 0 }}>Evegah Support &amp; Admin</h3>
              </div>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                onClick={() => setSupportModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Need an administrator account or assistance accessing your dashboard? Our technical operations desk is available 24/7.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Direct Phone</span>
                <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: '700' }}>+91 98765 43210</span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Official Email</span>
                <span style={{ fontSize: '13px', color: '#16A34A', fontWeight: '700' }}>support@evegah.com</span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Headquarters</span>
                <span style={{ fontSize: '12.5px', color: '#1E293B', fontWeight: '600' }}>Gotri Tech Hub, Vadodara</span>
              </div>
            </div>

            <button
              type="button"
              style={{
                width: '100%',
                background: '#1E1548',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '13.5px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setSupportModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
