"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.se-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; color: #0F172A; }
.se-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.se-page { flex: 1; padding: 28px 32px 80px; display: flex; flex-direction: column; gap: 24px; max-width: 1600px; }

/* Header title */
.se-title-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.se-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; letter-spacing: -0.025em; }
.se-sub { font-size: 13.5px; color: #64748B; margin: 0; font-weight: 500; }

.se-actions { display: flex; align-items: center; gap: 12px; }
.se-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 12px; font-size: 13px; font-weight: 700; color: #334155; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.se-btn:hover { border-color: #CBD5E1; background: #F8FAFC; color: #0F172A; transform: translateY(-1px); }
.se-btn-primary { background: #2A195C; color: #FFFFFF; border-color: #2A195C; box-shadow: 0 4px 14px rgba(42,25,92,0.25); }
.se-btn-primary:hover { background: #1F1147; border-color: #1F1147; color: #FFFFFF; box-shadow: 0 6px 20px rgba(42,25,92,0.35); transform: translateY(-1px); }
.se-btn-danger { background: #FEF2F2; color: #DC2626; border-color: #FEE2E2; }
.se-btn-danger:hover { background: #FEE2E2; border-color: #FCA5A5; }

/* Tabs categories */
.se-tabs-card { background: #FFFFFF; padding: 6px; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 1px 3px rgba(15,23,42,0.03); overflow-x: auto; scrollbar-width: none; }
.se-tabs-card::-webkit-scrollbar { display: none; }
.se-tabs-list { display: flex; gap: 6px; align-items: center; }
.se-tab { display: inline-flex; align-items: center; gap: 8px; padding: 9px 18px; font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer; border-radius: 10px; border: none; background: transparent; transition: all 0.18s ease-in-out; white-space: nowrap; }
.se-tab:hover { color: #2A195C; background: #F5F3FF; }
.se-tab.active { color: #FFFFFF; background: #2A195C; font-weight: 700; box-shadow: 0 2px 8px rgba(42,25,92,0.25); }

/* Layout Grids */
.se-three-columns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.se-column { display: flex; flex-direction: column; gap: 24px; }
.se-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.se-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.se-grid-all { grid-column: 1 / -1; }
.se-span-2 { grid-column: span 2; }

/* Panel cards */
.se-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 18px; padding: 22px 24px; box-shadow: 0 1px 3px rgba(15,23,42,0.03), 0 4px 16px -4px rgba(15,23,42,0.02); display: flex; flex-direction: column; gap: 18px; transition: border-color 0.2s, box-shadow 0.2s; }
.se-card:hover { border-color: #CBD5E1; }
.se-card-hdr { display: flex; align-items: center; gap: 14px; border-bottom: 1px solid #F1F5F9; padding-bottom: 16px; margin-bottom: 2px; }
.se-card-ic { width: 40px; height: 40px; border-radius: 12px; background: #F5F3FF; color: #2A195C; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 0 0 1px rgba(42,25,92,0.08); }
.se-card-text { display: flex; flex-direction: column; gap: 2px; }
.se-card-tit { font-size: 15px; font-weight: 800; color: #0F172A; letter-spacing: -0.01em; }
.se-card-sub { font-size: 12px; color: #64748B; font-weight: 500; }

/* Form Field Groups */
.se-field-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 8px 10px; border-radius: 12px; transition: background 0.15s; min-height: 44px; }
.se-field-row:hover { background: #F8FAFC; }
.se-field-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.se-field-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.se-field-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.se-field-tit { font-size: 13px; font-weight: 700; color: #1E293B; }
.se-field-desc { font-size: 11.5px; color: #64748B; line-height: 1.35; }
.se-field-control { display: flex; justify-content: flex-end; align-items: center; flex-shrink: 0; }

/* Inputs & Selects */
.se-input { height: 38px; padding: 0 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; outline: none; color: #0F172A; background: #FFFFFF; font-weight: 500; transition: all 0.15s ease; font-family: inherit; }
.se-input:hover { border-color: #CBD5E1; }
.se-input:focus { border-color: #2A195C; box-shadow: 0 0 0 3px rgba(42,25,92,0.1); }
.se-select { height: 38px; padding: 0 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; outline: none; background: #FFFFFF; color: #0F172A; cursor: pointer; font-weight: 500; transition: all 0.15s ease; font-family: inherit; }
.se-select:hover { border-color: #CBD5E1; }
.se-select:focus { border-color: #2A195C; box-shadow: 0 0 0 3px rgba(42,25,92,0.1); }

/* Input group with attached unit */
.se-input-group { display: flex; align-items: center; border: 1.5px solid #E2E8F0; border-radius: 10px; background: #FFFFFF; overflow: hidden; width: 150px; height: 38px; transition: border-color 0.15s; }
.se-input-group:focus-within { border-color: #2A195C; box-shadow: 0 0 0 3px rgba(42,25,92,0.1); }
.se-input-group .se-input { border: none; height: 100%; padding: 0 12px; font-size: 13px; outline: none; width: 100%; font-weight: 600; text-align: center; }
.se-input-unit { background: #F8FAFC; border-left: 1.5px solid #E2E8F0; padding: 0 12px; height: 100%; font-size: 11.5px; font-weight: 700; color: #64748B; white-space: nowrap; display: flex; align-items: center; justify-content: center; min-width: 48px; }

/* Radio groups */
.se-radio-group { display: flex; gap: 16px; }
.se-radio-opt { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #334155; font-weight: 600; cursor: pointer; }
.se-radio-opt input[type="radio"] { accent-color: #2A195C; width: 16px; height: 16px; }

/* Toggle Switch */
.se-switch { position: relative; display: inline-block; width: 42px; height: 22px; }
.se-switch input { opacity: 0; width: 0; height: 0; }
.se-slider { position: absolute; cursor: pointer; inset: 0; background-color: #CBD5E1; transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 20px; }
.se-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 2px; bottom: 2px; background-color: #FFFFFF; transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
input:checked + .se-slider { background-color: #2A195C; }
input:checked + .se-slider:before { transform: translateX(20px); }

/* Quick Actions List */
.se-qa-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border: 1px solid #F1F5F9; border-radius: 12px; cursor: pointer; transition: all 0.15s ease; background: #FFFFFF; }
.se-qa-row:hover { background: #F8FAFC; border-color: #2A195C; transform: translateX(2px); }
.se-qa-l { display: flex; align-items: center; gap: 12px; font-size: 13.5px; font-weight: 700; color: #0F172A; }
.se-qa-ic { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }

/* Status Badges */
.se-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-active { background: #DCFCE7; color: #15803D; border: 1px solid #BBF7D0; }
.badge-inactive { background: #F1F5F9; color: #64748B; border: 1px solid #E2E8F0; }
.badge-latest { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; }
.badge-success { background: #DCFCE7; color: #15803D; }

/* System Info grid */
.se-sys-info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.se-sys-val-lbl { font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.se-sys-val-val { font-size: 14px; font-weight: 800; color: #0F172A; margin-top: 4px; font-family: 'Inter', monospace; }

/* Progress bar */
.se-progress-bg { height: 8px; background: #F1F5F9; border-radius: 4px; overflow: hidden; width: 100%; margin-top: 8px; }
.se-progress-fill { height: 100%; background: #2A195C; border-radius: 4px; }

/* Weekly Off selection */
.se-day-btn { padding: 8px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; font-weight: 700; color: #475569; cursor: pointer; background: #FFFFFF; transition: all 0.15s ease; }
.se-day-btn.active { background: #2A195C; color: #FFFFFF; border-color: #2A195C; box-shadow: 0 2px 6px rgba(42,25,92,0.25); }

/* Payment Gateway cards */
.se-gateway-row { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border: 1.5px solid #F1F5F9; border-radius: 14px; background: #FFFFFF; transition: all 0.2s; }
.se-gateway-row:hover { border-color: #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.se-gateway-info { display: flex; align-items: center; gap: 16px; }
.se-gateway-name { font-size: 14.5px; font-weight: 800; color: #0F172A; }
.se-gateway-key { font-size: 12px; color: #64748B; font-family: monospace; }

/* Brand logotypes */
.se-brand-logo { font-weight: 900; font-size: 16px; font-style: italic; letter-spacing: -0.03em; }
.logo-payu { color: #528900; }
.logo-icici { color: #C94B00; }
.logo-razorpay { color: #002244; }
.logo-phonepe { color: #5f259f; }
.logo-paytm { color: #00baf2; }
.logo-cashfree { color: #0c74ff; }
.logo-default { color: #1e293b; }

.badge-primary { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; font-weight: 800; }
.badge-env { background: #F8FAFC; color: #475569; font-size: 11px; border: 1px solid #E2E8F0; font-weight: 600; }

/* Gateway Modal */
.se-modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px; }
.se-modal-card { background: #FFFFFF; border-radius: 20px; width: 100%; max-width: 560px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; animation: seModalPop 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes seModalPop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
.se-modal-hdr { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #F1F5F9; background: #FAFBFD; }
.se-modal-title { font-size: 17px; font-weight: 800; color: #0F172A; }
.se-modal-close { background: none; border: none; font-size: 20px; color: #64748B; cursor: pointer; padding: 4px; line-height: 1; border-radius: 6px; }
.se-modal-close:hover { color: #0F172A; background: #F1F5F9; }
.se-modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; max-height: 72vh; overflow-y: auto; }
.se-modal-footer { display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 18px 24px; border-top: 1px solid #F1F5F9; background: #FAFBFD; }
.se-form-group { display: flex; flex-direction: column; gap: 7px; }
.se-form-label { font-size: 12.5px; font-weight: 700; color: #334155; }
.se-form-input { padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; color: #0F172A; outline: none; transition: all 0.15s; font-family: inherit; font-weight: 500; }
.se-form-input:focus { border-color: #2A195C; box-shadow: 0 0 0 3px rgba(42,25,92,0.1); }
.se-form-hint { font-size: 11px; color: #64748B; font-weight: 500; }

/* Generic field rows in settings cards */
.se-field { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid #F8FAFC; }
.se-field:last-child { border-bottom: none; }
.se-field-info { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.se-field-info .se-field-tit { font-size: 13.5px; font-weight: 700; color: #1E293B; }
.se-field-info .se-field-desc { font-size: 11.5px; color: #64748B; line-height: 1.35; }

/* Payment Methods List */
.se-pm-list { display: flex; flex-direction: column; gap: 12px; }
.se-pm-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border: 1px solid #F1F5F9; border-radius: 12px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
.se-pm-left { display: flex; align-items: center; gap: 12px; }
.se-pm-drag { color: #94A3B8; cursor: grab; }
.se-pm-info { display: flex; flex-direction: column; gap: 2px; }
.se-pm-name { font-size: 13.5px; font-weight: 700; color: #0F172A; }
.se-pm-desc { font-size: 11.5px; color: #64748B; }

/* Notification preference Grid list */
.se-noti-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
.se-noti-table th { padding: 14px; font-size: 11.5px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1.5px solid #E2E8F0; }
.se-noti-table td { padding: 14px; border-bottom: 1px solid #F1F5F9; color: #1E293B; font-weight: 500; }
.se-noti-table tr:last-child td { border-bottom: none; }
.se-noti-ch { text-align: center; width: 80px; }
.se-noti-ch input[type="checkbox"] { width: 17px; height: 17px; accent-color: #2A195C; cursor: pointer; }

/* Notification Summary row cards */
.se-noti-sum-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.se-noti-sum-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.se-noti-sum-ic { width: 40px; height: 40px; border-radius: 12px; background: #F5F3FF; color: #2A195C; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.se-noti-sum-info { display: flex; flex-direction: column; gap: 2px; }
.se-noti-sum-lbl { font-size: 13px; font-weight: 700; color: #0F172A; }
.se-noti-sum-val { font-size: 11.5px; color: #64748B; }

/* Alerts boxes */
.se-alert-success { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 14px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
`;

function SettingsContent() {
  const [activeTab, setActiveTab] = useState('General');
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam) {
      const decoded = decodeURIComponent(tabParam);
      const validTabs = ['General', 'Ride & Rental', 'Payments', 'Notifications', 'Battery & Swapping', 'Documents', 'Security', 'System'];
      if (validTabs.includes(decoded)) {
        setActiveTab(decoded);
      }
    }
  }, [tabParam]);
  const [loading, setLoading] = useState(true);
  const [dbSettings, setDbSettings] = useState<any>(null);

  // Standard initial state values representing what's shown in the screenshots
  const [localSettings, setLocalSettings] = useState<any>({
    general: {
      zone_name: 'Gotri Zone',
      time_zone: '(UTC +05:30) Asia/Kolkata',
      date_format: 'DD MMM YYYY (31 May 2024)',
      time_format: '12 Hours (AM/PM)',
      currency: 'INR (₹) - Indian Rupee',
      auto_approve_registrations: true,
      email_notifications: true,
      sms_notifications: true,
      maintenance_mode: false,
      allow_bulk_operations: true,
      items_per_page: 25,
      default_language: 'English',
      map_provider: 'Google Maps',
      session_timeout: '30 Minutes',
      min_rental_duration: 1,
      max_rental_duration: 30,
      late_return_grace_period: 15,
      security_deposit: 500.00
    },
    ride_rental: {
      allow_ride_booking: true,
      min_ride_distance: 1.0,
      max_ride_distance: 100,
      ride_cancellation_limit: '15 Minutes',
      auto_complete_ride: true,
      ride_grace_time: 10,
      allow_rentals: true,
      min_rental_duration_hours: 1,
      max_rental_duration_days: 30,
      security_deposit_refundable: 500.00,
      advance_payment: 'No Advance',
      auto_extend_rental: true,
      base_fare: 20.00,
      per_km_charge: 8.00,
      plan_rate_type: 'Per Day',
      late_return_fee: 50.00,
      tax_percentage: 18,
      renter_wallet_deduction: true,
      operating_hours_ride_from: '06:00 AM',
      operating_hours_ride_to: '11:00 PM',
      operating_hours_rental_from: '06:00 AM',
      operating_hours_rental_to: '10:00 PM',
      weekly_off: ['Sun'],
      pickup_outside_zone: false,
      drop_outside_zone: false,
      extended_coverage_fee: 30.00,
      allow_multiple_vehicles: true,
      enable_rating_reviews: true,
      cleaner_fee: 100.00,
      toll_charges: 'Reimburse',
      smoking_penalty: 200.00
    },
    payments: {
      gateways: [
        {
          id: 'payu',
          name: 'PayU India',
          provider: 'payu',
          active: true,
          key_id: 'zWJFsB',
          key_secret: 'A9xN8x7qX2uH8a4a2L0vD3rJ7xB0lP9o',
          client_id: '8ecdb3a31264fb5b8c0ef026846a904d9aefcef39acdfb55d61225cdc06eb543',
          client_secret: 'd9c50d234985c580d2ac5ea6891cfb5d7f8f12dadb5b5afb6cc565b1b28ad7e4',
          environment: 'production',
          notes: 'PayU India Hosted Checkout, Dynamic UPI QR, Cards, NetBanking'
        },
        {
          id: 'phonepe',
          name: 'PhonePe',
          provider: 'phonepe',
          active: false,
          key_id: 'PGTESTxxxxxxxx',
          key_secret: '••••••••••••••••',
          environment: 'test',
          notes: 'PhonePe Payment Gateway'
        },
        {
          id: 'paytm',
          name: 'Paytm',
          provider: 'paytm',
          active: false,
          key_id: 'Mid_xxxxxxxxxxxxx',
          key_secret: '••••••••••••••••',
          environment: 'production',
          notes: 'Paytm All-in-one Gateway'
        },
        {
          id: 'razorpay',
          name: 'Razorpay',
          provider: 'razorpay',
          active: false,
          key_id: 'rzp_live_xxxxxxxxxxxxx',
          key_secret: '••••••••••••••••',
          environment: 'production',
          notes: 'Razorpay Payment Gateway'
        }
      ],
      primary_gateway: 'payu',
      default_payment_method: 'UPI',
      payment_capture: true,
      partial_payment: true,
      payment_retry: '3 Attempts',
      payment_timeout: '10 Minutes',
      auto_refund: true,
      refund_approval: true,
      refund_limit: 500.00,
      refund_processing_time: '3 - 5 Business Days',
      gst_applicable: true,
      gst_percentage: 18,
      service_fee: 10.00,
      convenience_fee: 5.00,
      methods_upi: true,
      methods_card: true,
      methods_netbanking: true,
      methods_wallets: true,
      methods_cash: false,
      payu_active: true,
      payu_key_id: 'WTi3jH',
      payu_key_secret: '9dascniXrfdMW22AJBbhmh2C7kuBibwb',
      payu_client_id: '8ecdb3a31264fb5b8c0ef026846a904d9aefcef39acdfb55d61225cdc06eb543',
      payu_client_secret: 'd9c50d234985c580d2ac5ea6891cfb5d7f8f12dadb5b5afb6cc565b1b28ad7e4',
      payu_env: 'test'
    },
    notifications: {
      channels_email: true,
      channels_sms: true,
      channels_inapp: true,
      quiet_hours_enabled: true,
      quiet_hours_from: '10:00 PM',
      quiet_hours_to: '07:00 AM',
      quiet_hours_timezone: '(UTC +05:30) Asia/Kolkata',
      prefs_ride_bookings: { email: true, sms: true, inapp: true },
      prefs_rental_bookings: { email: true, sms: true, inapp: true },
      prefs_payments: { email: true, sms: false, inapp: true },
      prefs_payouts: { email: true, sms: false, inapp: true },
      prefs_battery_alerts: { email: false, sms: true, inapp: true },
      prefs_vehicle_alerts: { email: true, sms: true, inapp: true },
      prefs_system_alerts: { email: true, sms: false, inapp: true },
      prefs_promotions: { email: false, sms: false, inapp: true }
    },
    battery_swapping: {
      soc_swap_threshold: 20,
      soc_alert_threshold: 15,
      max_cycles_limit: 500,
      temp_alert_threshold: 45,
      auto_station_allocation: true,
      require_swap_auth: true
    },
    documents: {
      require_aadhar: true,
      require_dl: true,
      require_pan: false,
      auto_verify_documents: true,
      max_file_size: 5,
      allowed_formats: 'PDF, PNG, JPG'
    },
    security: {
      two_factor_auth: false,
      strong_password_policy: true,
      max_login_attempts: 5,
      session_timeout_seconds: 1800,
      allow_concurrent_logins: false,
      refund_auth_mobile: '8128251172',
      refund_auth_password: 'Qatar@2022'
    },
    system: {
      system_time_zone: '(UTC +05:30) Asia/Kolkata',
      system_date_format: 'DD-MM-YYYY',
      system_time_format: '12 Hour (AM/PM)',
      system_language: 'English',
      system_automatic_updates: true,
      system_update_channel: 'Stable',
      system_last_checked: 'Today, 08:30 AM',
      system_version: 'v2.4.0',
      system_info: {
        server_name: 'evg-server-01',
        web_server: 'Nginx 1.24.0',
        environment: 'Production',
        php_version: '8.2.12',
        total_storage: 256,
        used_storage: 128,
        database_version: 'MySQL 8.0.34',
        active_users: 24,
        active_sessions: 37,
        uptime: '15 Days, 6 Hours'
      },
      auto_backup: true,
      backup_frequency: 'Daily',
      last_backup: 'Today, 02:00 AM',
      last_backup_status: 'Success',
      backup_size: '2.4 GB'
    }
  });

  // Load settings from backend database on mount
  useEffect(() => {
    setLoading(true);
    api.get('/settings')
      .then((res: any) => {
        if (res.status === 'success' && res.data) {
          setDbSettings(res.data);
        }
      })
      .catch((err: any) => {
        console.error('Failed to load settings from DB, using fallback mock data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Gateway modal state & handlers
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<any>(null);
  const [gatewayForm, setGatewayForm] = useState<any>({
    id: '',
    name: 'PayU India',
    provider: 'payu',
    key_id: 'WTi3jH',
    key_secret: '9dascniXrfdMW22AJBbhmh2C7kuBibwb',
    client_id: '8ecdb3a31264fb5b8c0ef026846a904d9aefcef39acdfb55d61225cdc06eb543',
    client_secret: 'd9c50d234985c580d2ac5ea6891cfb5d7f8f12dadb5b5afb6cc565b1b28ad7e4',
    vpa: '',
    payee_name: 'Evegah',
    environment: 'test',
    active: true,
    is_primary: false,
    notes: ''
  });

  const [showRefundPwd, setShowRefundPwd] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = (localStorage.getItem('evegah_role') || 'super_admin').toLowerCase();
      const roleName = (localStorage.getItem('evegah_user_role_name') || 'Super Admin').toLowerCase();
      setIsSuperAdmin(role.includes('super') || roleName.includes('super') || role === 'admin');
    }
  }, []);

  // Merge local state with database state cleanly
  const currentSettings = {
    ...localSettings,
    ...(dbSettings || {}),
    payments: {
      ...localSettings.payments,
      ...((dbSettings && dbSettings.payments) || {})
    },
    security: {
      ...localSettings.security,
      ...((dbSettings && dbSettings.security) || {})
    }
  };

  const handleOpenAddGateway = () => {
    setEditingGateway(null);
    setGatewayForm({
      id: '',
      name: 'PayU India',
      provider: 'payu',
      key_id: '',
      key_secret: '',
      client_id: '',
      client_secret: '',
      vpa: '',
      payee_name: 'Evegah',
      environment: 'test',
      active: true,
      is_primary: false,
      notes: ''
    });
    setGatewayModalOpen(true);
  };

  const handleOpenEditGateway = (gw: any) => {
    setEditingGateway(gw);
    setGatewayForm({
      id: gw.id,
      name: gw.name || '',
      provider: gw.provider || gw.id,
      key_id: gw.key_id || '',
      key_secret: gw.key_secret || '',
      client_id: gw.client_id || '',
      client_secret: gw.client_secret || '',
      vpa: gw.vpa || '',
      payee_name: gw.payee_name || 'Evegah',
      environment: gw.environment || 'production',
      active: gw.active !== false,
      is_primary: gw.id === (currentSettings.payments?.primary_gateway || 'payu'),
      notes: gw.notes || ''
    });
    setGatewayModalOpen(true);
  };

  const handleToggleGateway = async (gatewayId: string, currentActive: boolean) => {
    const newActive = !currentActive;
    const curGateways = Array.isArray(currentSettings.payments?.gateways)
      ? [...currentSettings.payments.gateways]
      : [...localSettings.payments.gateways];
    const updated = curGateways.map((g: any) => g.id === gatewayId ? { ...g, active: newActive } : g);
    updateField('payments', 'gateways', updated);

    // Persist immediately to backend
    try {
      await api.patch(`/payments/gateways/${gatewayId}/toggle`, { active: newActive });
    } catch (e) {
      console.warn('Backend toggle failed, saving whole payments object:', e);
      api.put('/settings/payments', { ...currentSettings.payments, gateways: updated }).catch(() => {});
    }
  };

  const handleSaveGateway = async () => {
    if (!gatewayForm.name) {
      alert('Gateway Name is required');
      return;
    }

    try {
      const res: any = await api.post('/payments/gateways', gatewayForm);
      if (res.status === 'success' && res.data) {
        if (res.data.gateways) {
          updateField('payments', 'gateways', res.data.gateways);
        }
        if (res.data.primary_gateway) {
          updateField('payments', 'primary_gateway', res.data.primary_gateway);
        }
        setGatewayModalOpen(false);
        alert(`Gateway '${gatewayForm.name}' configured and ${gatewayForm.active ? 'ACTIVATED' : 'saved'} successfully!`);
      }
    } catch (err: any) {
      console.error('Error saving gateway:', err);
      // Fallback: update local state & put /settings/payments
      const curGateways = Array.isArray(currentSettings.payments?.gateways)
        ? [...currentSettings.payments.gateways]
        : [...localSettings.payments.gateways];
      const gId = gatewayForm.id || gatewayForm.provider || gatewayForm.name.toLowerCase().replace(/\s+/g, '_');
      const idx = curGateways.findIndex((g: any) => g.id === gId);
      const gwObj = { ...gatewayForm, id: gId };
      if (idx >= 0) curGateways[idx] = gwObj;
      else curGateways.push(gwObj);
      updateField('payments', 'gateways', curGateways);
      if (gatewayForm.is_primary) updateField('payments', 'primary_gateway', gId);
      setGatewayModalOpen(false);
      alert(`Gateway '${gatewayForm.name}' configured successfully!`);
    }
  };

  const updateField = (category: string, field: string, value: any) => {
    if (dbSettings) {
      setDbSettings((prev: any) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      }));
    } else {
      setLocalSettings((prev: any) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      }));
    }
  };

  const handleSave = () => {
    const categoryKey = activeTab.toLowerCase().replace(' & ', '_');
    const dataToSave = currentSettings[categoryKey];
    
    if (!dataToSave) {
      alert('Active tab has no configured backend mapping.');
      return;
    }

    // Save active category configurations to Postgres
    api.put(`/settings/${categoryKey}`, dataToSave)
      .then(() => {
        alert('Configurations saved successfully in PostgreSQL database!');
      })
      .catch((err: any) => {
        console.error('Error saving settings:', err);
        alert('Failed to save to database: ' + err.message);
      });
  };

  const tabs = [
    'General',
    'Ride & Rental',
    'Payments',
    'Notifications',
    'Battery & Swapping',
    'Documents',
    'Security',
    'System'
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="se-shell">
        <Sidebar activePath="/settings" />
        <div className="se-main">
          <TopBar />

          <div className="se-page">
            {/* Header Title & Action */}
            <div className="se-title-row">
              <div>
                <h1 className="se-h1">Settings</h1>
                <p className="se-sub">Manage system preferences and configurations</p>
              </div>
              <div className="se-actions">
                <button className="se-btn se-btn-primary" onClick={handleSave}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 2 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Save Changes
                </button>
              </div>
            </div>

            {/* Tab switchers row */}
            <div className="se-tabs-card">
              <div className="se-tabs-list">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`se-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading system configurations...</div>
            ) : (
              <>
                {/* ─── TAB 1: GENERAL ─── */}
                {activeTab === 'General' && currentSettings.general && (
                  <div className="se-three-columns">
                    {/* Column 1 */}
                    <div className="se-column">
                      {/* General Settings */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">General Settings</span>
                            <span className="se-card-sub">Update your basic zone parameters.</span>
                          </div>
                        </div>

                        {/* Zone Name */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18M3 7v14M21 7v14M4 4h16v3H4zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Zone Name</span>
                              <span className="se-field-desc">Update your zone name.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <input
                              type="text"
                              className="se-input"
                              style={{ width: '150px' }}
                              value={currentSettings.general.zone_name}
                              onChange={(e) => updateField('general', 'zone_name', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Time Zone */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Time Zone</span>
                              <span className="se-field-desc">Set the time zone for this zone.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <select
                              className="se-select"
                              style={{ width: '180px' }}
                              value={currentSettings.general.time_zone}
                              onChange={(e) => updateField('general', 'time_zone', e.target.value)}
                            >
                              <option>(UTC +05:30) Asia/Kolkata</option>
                              <option>(UTC +00:00) UTC</option>
                            </select>
                          </div>
                        </div>

                        {/* Date Format */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Date Format</span>
                              <span className="se-field-desc">Select the date format for the system.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <select
                              className="se-select"
                              style={{ width: '180px' }}
                              value={currentSettings.general.date_format}
                              onChange={(e) => updateField('general', 'date_format', e.target.value)}
                            >
                              <option>DD MMM YYYY (31 May 2024)</option>
                              <option>YYYY-MM-DD</option>
                            </select>
                          </div>
                        </div>

                        {/* Time Format */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Time Format</span>
                              <span className="se-field-desc">Select the time format.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <div className="se-radio-group">
                              <label className="se-radio-opt">
                                <input
                                  type="radio"
                                  name="time_format"
                                  checked={currentSettings.general.time_format === '12 Hours (AM/PM)'}
                                  onChange={() => updateField('general', 'time_format', '12 Hours (AM/PM)')}
                                />
                                12 Hours (AM/PM)
                              </label>
                              <label className="se-radio-opt">
                                <input
                                  type="radio"
                                  name="time_format"
                                  checked={currentSettings.general.time_format === '24 Hours'}
                                  onChange={() => updateField('general', 'time_format', '24 Hours')}
                                />
                                24 Hours
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Currency */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M22 10h-6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h6"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Currency</span>
                              <span className="se-field-desc">Select the default currency.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <select
                              className="se-select"
                              style={{ width: '180px' }}
                              value={currentSettings.general.currency}
                              onChange={(e) => updateField('general', 'currency', e.target.value)}
                            >
                              <option>INR (₹) - Indian Rupee</option>
                              <option>USD ($) - US Dollar</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Ride & Rental Settings Box */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">Ride & Rental Settings</span>
                            <span className="se-card-sub">Configure base duration boundaries.</span>
                          </div>
                        </div>

                        {/* Min rental */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Minimum Rental Duration (Hours)</span>
                              <span className="se-field-desc">Set minimum duration for a new rental.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <div className="se-input-group">
                              <input
                                type="text"
                                className="se-input"
                                value={currentSettings.general.min_rental_duration}
                                onChange={(e) => updateField('general', 'min_rental_duration', parseInt(e.target.value) || 1)}
                              />
                              <span className="se-input-unit">Hour</span>
                            </div>
                          </div>
                        </div>

                        {/* Max rental */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 2h14M5 22h14M19 2v4a7 7 0 0 1-7 7 7 7 0 0 1-7-7V2M5 22v-4a7 7 0 0 1 7-7 7 7 0 0 1 7 7v4"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Maximum Rental Duration (Days)</span>
                              <span className="se-field-desc">Set maximum allowed rental duration.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <div className="se-input-group">
                              <input
                                type="text"
                                className="se-input"
                                value={currentSettings.general.max_rental_duration}
                                onChange={(e) => updateField('general', 'max_rental_duration', parseInt(e.target.value) || 30)}
                              />
                              <span className="se-input-unit">Days</span>
                            </div>
                          </div>
                        </div>

                        {/* Late return grace */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 2h14M5 22h14M19 2v4a7 7 0 0 1-7 7 7 7 0 0 1-7-7V2M5 22v-4a7 7 0 0 1 7-7 7 7 0 0 1 7 7v4"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Late Return Grace Period (Minutes)</span>
                              <span className="se-field-desc">Grace time before applying late fees.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <div className="se-input-group">
                              <input
                                type="text"
                                className="se-input"
                                value={currentSettings.general.late_return_grace_period}
                                onChange={(e) => updateField('general', 'late_return_grace_period', parseInt(e.target.value) || 15)}
                              />
                              <span className="se-input-unit">Minutes</span>
                            </div>
                          </div>
                        </div>

                        {/* Security deposit */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Security Deposit (Refundable)</span>
                              <span className="se-field-desc">Default refundable security deposit amount.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <div className="se-input-group">
                              <input
                                type="text"
                                className="se-input"
                                value={currentSettings.general.security_deposit}
                                onChange={(e) => updateField('general', 'security_deposit', parseFloat(e.target.value) || 500.00)}
                              />
                              <span className="se-input-unit">₹</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="se-column">
                      {/* System Preferences */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="3" width="20" height="14" rx="2" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">System Preferences</span>
                            <span className="se-card-sub">Configure core behavior parameters.</span>
                          </div>
                        </div>

                        {/* Auto Approve */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Auto Approve New Registrations</span>
                              <span className="se-field-desc">Automatically approve new rider registrations.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <label className="se-switch">
                              <input
                                 type="checkbox"
                                 checked={currentSettings.general.auto_approve_registrations}
                                 onChange={(e) => updateField('general', 'auto_approve_registrations', e.target.checked)}
                              />
                              <span className="se-slider" />
                            </label>
                          </div>
                        </div>

                        {/* Email notification */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Email Notifications</span>
                              <span className="se-field-desc">Enable email notifications for important events.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <label className="se-switch">
                              <input
                                 type="checkbox"
                                 checked={currentSettings.general.email_notifications}
                                 onChange={(e) => updateField('general', 'email_notifications', e.target.checked)}
                              />
                              <span className="se-slider" />
                            </label>
                          </div>
                        </div>

                        {/* SMS Notification */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">SMS Notifications</span>
                              <span className="se-field-desc">Enable SMS notifications for riders and renters.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <label className="se-switch">
                              <input
                                 type="checkbox"
                                 checked={currentSettings.general.sms_notifications}
                                 onChange={(e) => updateField('general', 'sms_notifications', e.target.checked)}
                              />
                              <span className="se-slider" />
                            </label>
                          </div>
                        </div>

                        {/* Maintenance Mode */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Maintenance Mode</span>
                              <span className="se-field-desc">Put the system in maintenance mode.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <label className="se-switch">
                              <input
                                 type="checkbox"
                                 checked={currentSettings.general.maintenance_mode}
                                 onChange={(e) => updateField('general', 'maintenance_mode', e.target.checked)}
                              />
                              <span className="se-slider" />
                            </label>
                          </div>
                        </div>

                        {/* Bulk operations */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Allow Bulk Operations</span>
                              <span className="se-field-desc">Allow bulk approve, reject and delete operations.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <label className="se-switch">
                              <input
                                 type="checkbox"
                                 checked={currentSettings.general.allow_bulk_operations}
                                 onChange={(e) => updateField('general', 'allow_bulk_operations', e.target.checked)}
                              />
                              <span className="se-slider" />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3 */}
                    <div className="se-column">
                      {/* Other Settings */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="3" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">Other Settings</span>
                            <span className="se-card-sub">Miscellaneous settings.</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Items Per Page</span>
                            <span className="se-field-desc">Select how many items to show per page.</span>
                          </div>
                          <select
                            className="se-select"
                            value={currentSettings.general.items_per_page}
                            onChange={(e) => updateField('general', 'items_per_page', parseInt(e.target.value))}
                          >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                          </select>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Default Language</span>
                            <span className="se-field-desc">Select the default language.</span>
                          </div>
                          <select
                            className="se-select"
                            value={currentSettings.general.default_language}
                            onChange={(e) => updateField('general', 'default_language', e.target.value)}
                          >
                            <option>English</option>
                            <option>Hindi</option>
                          </select>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Map Provider</span>
                            <span className="se-field-desc">Select map provider for location services.</span>
                          </div>
                          <select
                            className="se-select"
                            value={currentSettings.general.map_provider}
                            onChange={(e) => updateField('general', 'map_provider', e.target.value)}
                          >
                            <option>Google Maps</option>
                            <option>Mapbox</option>
                          </select>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Session Timeout</span>
                            <span className="se-field-desc">Automatically logout after inactivity.</span>
                          </div>
                          <select
                            className="se-select"
                            value={currentSettings.general.session_timeout}
                            onChange={(e) => updateField('general', 'session_timeout', e.target.value)}
                          >
                            <option>30 Minutes</option>
                            <option>1 Hour</option>
                          </select>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="se-card">
                        <span className="se-card-tit">Quick Actions</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div className="se-qa-row">
                            <div className="se-qa-l">
                              <div className="se-qa-ic" style={{ background: '#EEF2FF', color: '#2a195c' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
                              </div>
                              Backup Database
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#94A3B8' }}><polyline points="9 18 15 12 9 6"/></svg>
                          </div>

                          <div className="se-qa-row">
                            <div className="se-qa-l">
                              <div className="se-qa-ic" style={{ background: '#ECFDF5', color: '#10B981' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                              </div>
                              Clear Cache
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#94A3B8' }}><polyline points="9 18 15 12 9 6"/></svg>
                          </div>

                          <div className="se-qa-row">
                            <div className="se-qa-l">
                              <div className="se-qa-ic" style={{ background: '#EEF2FF', color: '#2a195c' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                              </div>
                              System Logs
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#94A3B8' }}><polyline points="9 18 15 12 9 6"/></svg>
                          </div>

                          <div className="se-qa-row">
                            <div className="se-qa-l">
                              <div className="se-qa-ic" style={{ background: '#FFF7ED', color: '#F97316' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                              </div>
                              API Integrations
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#94A3B8' }}><polyline points="9 18 15 12 9 6"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 2: RIDE & RENTAL ─── */}
                {activeTab === 'Ride & Rental' && currentSettings.ride_rental && (
                  <div className="se-three-columns">
                    {/* Column 1 */}
                    <div className="se-column">
                      {/* Ride Settings */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C20.3 11.1 20 10.4 20 9.8V8a2 2 0 0 0-2-2h-3.8c-.6 0-1.3-.3-1.6-.8L10.9 2.7C10.6 2.3 10 2 9.5 2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h2" /><circle cx="7.5" cy="18.5" r="2.5" /><circle cx="16.5" cy="18.5" r="2.5" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">Ride Settings</span>
                            <span className="se-card-sub">Enable or disable booking criteria.</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Allow Ride Booking</span>
                            <span className="se-field-desc">Enable or disable ride booking in this zone.</span>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.ride_rental.allow_ride_booking}
                              onChange={(e) => updateField('ride_rental', 'allow_ride_booking', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Minimum Ride Distance</span>
                            <span className="se-field-desc">Set the minimum distance allowed for a ride.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.min_ride_distance}
                              onChange={(e) => updateField('ride_rental', 'min_ride_distance', parseFloat(e.target.value) || 1.0)}
                            />
                            <span className="se-input-unit">km</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Maximum Ride Distance</span>
                            <span className="se-field-desc">Set the maximum distance allowed for a ride.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.max_ride_distance}
                              onChange={(e) => updateField('ride_rental', 'max_ride_distance', parseInt(e.target.value) || 100)}
                            />
                            <span className="se-input-unit">km</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Ride Cancellation Time Limit</span>
                            <span className="se-field-desc">Allow cancellation before the ride start time.</span>
                          </div>
                          <select
                            className="se-select"
                            value={currentSettings.ride_rental.ride_cancellation_limit}
                            onChange={(e) => updateField('ride_rental', 'ride_cancellation_limit', e.target.value)}
                          >
                            <option>15 Minutes</option>
                            <option>30 Minutes</option>
                          </select>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Auto Complete Ride</span>
                            <span className="se-field-desc">Automatically complete ride after renter drop-off.</span>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.ride_rental.auto_complete_ride}
                              onChange={(e) => updateField('ride_rental', 'auto_complete_ride', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Ride Grace Time (After Drop-off)</span>
                            <span className="se-field-desc">Extra time after drop-off before auto complete.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.ride_grace_time}
                              onChange={(e) => updateField('ride_rental', 'ride_grace_time', parseInt(e.target.value) || 10)}
                            />
                            <span className="se-input-unit">Minutes</span>
                          </div>
                        </div>
                      </div>

                      {/* Availability Settings */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">Availability Settings</span>
                            <span className="se-card-sub">Define active windows.</span>
                          </div>
                        </div>

                        {/* Operating Hours Ride */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Operating Hours (Ride)</span>
                              <span className="se-field-desc">Set daily operating hours for rides.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input type="text" className="se-input" style={{ width: '80px', textAlign: 'center' }} value={currentSettings.ride_rental.operating_hours_ride_from} onChange={(e) => updateField('ride_rental', 'operating_hours_ride_from', e.target.value)} />
                              <span style={{ fontSize: '11px', color: '#64748B' }}>to</span>
                              <input type="text" className="se-input" style={{ width: '80px', textAlign: 'center' }} value={currentSettings.ride_rental.operating_hours_ride_to} onChange={(e) => updateField('ride_rental', 'operating_hours_ride_to', e.target.value)} />
                            </div>
                          </div>
                        </div>

                        {/* Operating Hours Rental */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Operating Hours (Rental)</span>
                              <span className="se-field-desc">Set daily operating hours for rentals.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input type="text" className="se-input" style={{ width: '80px', textAlign: 'center' }} value={currentSettings.ride_rental.operating_hours_rental_from} onChange={(e) => updateField('ride_rental', 'operating_hours_rental_from', e.target.value)} />
                              <span style={{ fontSize: '11px', color: '#64748B' }}>to</span>
                              <input type="text" className="se-input" style={{ width: '80px', textAlign: 'center' }} value={currentSettings.ride_rental.operating_hours_rental_to} onChange={(e) => updateField('ride_rental', 'operating_hours_rental_to', e.target.value)} />
                            </div>
                          </div>
                        </div>

                        <div className="se-field-col">
                          <span className="se-field-tit">Weekly Off</span>
                          <span className="se-field-desc">Select days when rides/rentals are not allowed.</span>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => (
                              <button
                                key={day}
                                className={`se-day-btn ${currentSettings.ride_rental.weekly_off.includes(day) ? 'active' : ''}`}
                                onClick={() => {
                                  const newOff = currentSettings.ride_rental.weekly_off.includes(day)
                                    ? currentSettings.ride_rental.weekly_off.filter((d: string) => d !== day)
                                    : [...currentSettings.ride_rental.weekly_off, day];
                                  updateField('ride_rental', 'weekly_off', newOff);
                                }}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="se-column">
                      {/* Rental Settings */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">Rental Settings</span>
                            <span className="se-card-sub">Configure rental durations and parameters.</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Allow Rentals</span>
                            <span className="se-field-desc">Enable or disable rental functionality.</span>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.ride_rental.allow_rentals}
                              onChange={(e) => updateField('ride_rental', 'allow_rentals', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Minimum Rental Duration</span>
                            <span className="se-field-desc">Set the minimum duration for a rental.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.min_rental_duration_hours}
                              onChange={(e) => updateField('ride_rental', 'min_rental_duration_hours', parseInt(e.target.value) || 1)}
                            />
                            <span className="se-input-unit">Hour</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Maximum Rental Duration</span>
                            <span className="se-field-desc">Set the maximum duration for a rental.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.max_rental_duration_days}
                              onChange={(e) => updateField('ride_rental', 'max_rental_duration_days', parseInt(e.target.value) || 30)}
                            />
                            <span className="se-input-unit">Days</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Security Deposit (Refundable)</span>
                            <span className="se-field-desc">Default refundable deposit for rentals.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.security_deposit_refundable}
                              onChange={(e) => updateField('ride_rental', 'security_deposit_refundable', parseFloat(e.target.value) || 500.00)}
                            />
                            <span className="se-input-unit">₹</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Advance Payment</span>
                            <span className="se-field-desc">Require advance payment for rentals.</span>
                          </div>
                          <select
                            className="se-select"
                            value={currentSettings.ride_rental.advance_payment}
                            onChange={(e) => updateField('ride_rental', 'advance_payment', e.target.value)}
                          >
                            <option>No Advance</option>
                            <option>Full Advance</option>
                          </select>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Auto Extend Rental</span>
                            <span className="se-field-desc">Allow system to auto-extend on expiry.</span>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.ride_rental.auto_extend_rental}
                              onChange={(e) => updateField('ride_rental', 'auto_extend_rental', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>
                      </div>

                      {/* Geo & Zone Settings */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">Geo & Zone Settings</span>
                            <span className="se-card-sub">Define geographical parameters.</span>
                          </div>
                        </div>

                        {/* Service Zone */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Service Zone</span>
                              <span className="se-field-desc">Define the area where services are available.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <button className="se-btn" style={{ padding: '6px 12px', fontSize: '11.5px', color: '#2a195c', borderColor: '#2a195c', background: '#EEF2FF', fontWeight: 'bold' }}>View / Edit Zone</button>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Pickup Outside Zone</span>
                            <span className="se-field-desc">Allow pickup from outside the service zone.</span>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.ride_rental.pickup_outside_zone}
                              onChange={(e) => updateField('ride_rental', 'pickup_outside_zone', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Drop Outside Zone</span>
                            <span className="se-field-desc">Allow drop outside the service zone.</span>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.ride_rental.drop_outside_zone}
                              onChange={(e) => updateField('ride_rental', 'drop_outside_zone', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Extended Coverage Fee</span>
                            <span className="se-field-desc">Additional fee for outside zone drop.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.extended_coverage_fee}
                              onChange={(e) => updateField('ride_rental', 'extended_coverage_fee', parseFloat(e.target.value) || 30.00)}
                            />
                            <span className="se-input-unit">₹</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3 */}
                    <div className="se-column">
                      {/* Pricing & Charges */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">Pricing & Charges</span>
                            <span className="se-card-sub">Configure default rates.</span>
                          </div>
                        </div>
                        
                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Base Fare (Ride)</span>
                            <span className="se-field-desc">Base fare for any ride.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.base_fare}
                              onChange={(e) => updateField('ride_rental', 'base_fare', parseFloat(e.target.value) || 20.00)}
                            />
                            <span className="se-input-unit">₹</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Per Km Charge (Ride)</span>
                            <span className="se-field-desc">Charge per kilometer for a ride.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.per_km_charge}
                              onChange={(e) => updateField('ride_rental', 'per_km_charge', parseFloat(e.target.value) || 8.00)}
                            />
                            <span className="se-input-unit">₹</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Plan Rate Type</span>
                            <span className="se-field-desc">Select how plan rate is calculated.</span>
                          </div>
                          <select
                            className="se-select"
                            value={currentSettings.ride_rental.plan_rate_type}
                            onChange={(e) => updateField('ride_rental', 'plan_rate_type', e.target.value)}
                          >
                            <option>Per Day</option>
                            <option>Per Hour</option>
                          </select>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Late Return Fee (Per Hour)</span>
                            <span className="se-field-desc">Charge for late return after grace period.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.late_return_fee}
                              onChange={(e) => updateField('ride_rental', 'late_return_fee', parseFloat(e.target.value) || 50.00)}
                            />
                            <span className="se-input-unit">₹</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Tax (Percentage)</span>
                            <span className="se-field-desc">Applicable tax on rides and rentals.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.tax_percentage}
                              onChange={(e) => updateField('ride_rental', 'tax_percentage', parseInt(e.target.value) || 18)}
                            />
                            <span className="se-input-unit">%</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Renter Wallet Deduction</span>
                            <span className="se-field-desc">Deduct from wallet for rides & rentals.</span>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.ride_rental.renter_wallet_deduction}
                              onChange={(e) => updateField('ride_rental', 'renter_wallet_deduction', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>
                      </div>

                      {/* Other Settings */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="3" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">Other Settings</span>
                            <span className="se-card-sub">Miscellaneous parameters.</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Allow Multiple Vehicles Per Renter</span>
                            <span className="se-field-desc">Allow a renter to have more than one active booking.</span>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.ride_rental.allow_multiple_vehicles}
                              onChange={(e) => updateField('ride_rental', 'allow_multiple_vehicles', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Enable Rating & Reviews</span>
                            <span className="se-field-desc">Allow renters to give ratings and reviews.</span>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.ride_rental.enable_rating_reviews}
                              onChange={(e) => updateField('ride_rental', 'enable_rating_reviews', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Cleaner Fee</span>
                            <span className="se-field-desc">Apply cleaner fee if vehicle returned unclean.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.cleaner_fee}
                              onChange={(e) => updateField('ride_rental', 'cleaner_fee', parseFloat(e.target.value) || 100.00)}
                            />
                            <span className="se-input-unit">₹</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Toll Charges</span>
                            <span className="se-field-desc">Reimburse toll charges to renters.</span>
                          </div>
                          <select
                            className="se-select"
                            value={currentSettings.ride_rental.toll_charges}
                            onChange={(e) => updateField('ride_rental', 'toll_charges', e.target.value)}
                          >
                            <option>Reimburse</option>
                            <option>Charge Renter</option>
                          </select>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Smoking Penalty</span>
                            <span className="se-field-desc">Penalty for smoking inside the vehicle.</span>
                          </div>
                          <div className="se-input-group">
                            <input
                              type="text"
                              className="se-input"
                              value={currentSettings.ride_rental.smoking_penalty}
                              onChange={(e) => updateField('ride_rental', 'smoking_penalty', parseFloat(e.target.value) || 200.00)}
                            />
                            <span className="se-input-unit">₹</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 3: PAYMENTS ─── */}
                {activeTab === 'Payments' && currentSettings.payments && (
                  <div className="se-grid-3">
                    {/* Dynamic Multi-Payment Gateways */}
                    <div className="se-card se-span-2">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Payment Gateway Settings</span>
                          <span className="se-card-sub">Configure and activate multiple payment gateways dynamically from the backend.</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(Array.isArray(currentSettings.payments.gateways) && currentSettings.payments.gateways.length > 0
                          ? currentSettings.payments.gateways
                          : localSettings.payments.gateways
                        ).filter((gw: any) => gw.id !== 'icici' && gw.provider !== 'icici').map((gw: any) => {
                          const isPayU = gw.id === 'payu' || gw.provider === 'payu';
                          const isPhonePe = gw.id === 'phonepe' || gw.provider === 'phonepe';
                          const isPaytm = gw.id === 'paytm' || gw.provider === 'paytm';
                          const isRazorpay = gw.id === 'razorpay' || gw.provider === 'razorpay';
                          const isCashfree = gw.id === 'cashfree' || gw.provider === 'cashfree';
                          const isPrimary = gw.id === (currentSettings.payments.primary_gateway || 'payu');
                          
                          let logoClass = 'logo-default';
                          if (isPayU) logoClass = 'logo-payu';
                          else if (isPhonePe) logoClass = 'logo-phonepe';
                          else if (isPaytm) logoClass = 'logo-paytm';
                          else if (isRazorpay) logoClass = 'logo-razorpay';
                          else if (isCashfree) logoClass = 'logo-cashfree';

                          const keyLabel = isPayU ? 'Key' : 'Key ID';
                          const keyVal = gw.key_id ? (gw.key_id.length > 18 ? gw.key_id.slice(0, 18) + '...' : gw.key_id) : 'Not configured';

                          return (
                            <div key={gw.id} className="se-gateway-row">
                              <div className="se-gateway-info" style={{ flexWrap: 'wrap', gap: '10px' }}>
                                <span className={`se-brand-logo ${logoClass}`}>{gw.name}</span>
                                <span className={`se-badge ${gw.active ? 'badge-active' : 'badge-inactive'}`}>
                                  {gw.active ? 'Active' : 'Inactive'}
                                </span>
                                {isPrimary && <span className="se-badge badge-primary">Primary</span>}
                                <span className="se-badge badge-env">
                                  {gw.environment === 'test' ? 'Test Sandbox' : 'Production'}
                                </span>
                                <span className="se-gateway-key">
                                  {keyLabel}: {keyVal}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <label className="se-switch" title={gw.active ? 'Click to Deactivate' : 'Click to Activate'}>
                                  <input
                                    type="checkbox"
                                    checked={!!gw.active}
                                    onChange={() => handleToggleGateway(gw.id, !!gw.active)}
                                  />
                                  <span className="se-slider" />
                                </label>
                                <button
                                  className="se-btn"
                                  style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}
                                  onClick={() => handleOpenEditGateway(gw)}
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        className="se-btn"
                        style={{
                          justifyContent: 'center',
                          borderColor: '#C7D2FE',
                          color: '#2a195c',
                          background: '#F5F7FF',
                          fontWeight: 'bold',
                          marginTop: '6px'
                        }}
                        onClick={handleOpenAddGateway}
                      >
                        + Add New Gateway
                      </button>
                    </div>

                    {/* Payment Preferences */}
                    <div className="se-card">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Payment Preferences</span>
                          <span className="se-card-sub">Configure how payments are collected.</span>
                        </div>
                      </div>
                      
                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Primary Active Gateway</span>
                          <span className="se-field-desc">Default gateway used for payments & wallet top-ups.</span>
                        </div>
                        <select
                          className="se-select"
                          value={currentSettings.payments.primary_gateway === 'icici' ? 'payu' : (currentSettings.payments.primary_gateway || 'payu')}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateField('payments', 'primary_gateway', val);
                            api.post(`/payments/gateways/${val}/set-primary`, {}).catch(() => {});
                          }}
                        >
                          {(Array.isArray(currentSettings.payments.gateways) && currentSettings.payments.gateways.length > 0
                            ? currentSettings.payments.gateways
                            : localSettings.payments.gateways
                          ).filter((g: any) => g.id !== 'icici' && g.provider !== 'icici').map((g: any) => (
                            <option key={g.id} value={g.id}>
                              {g.name} ({g.active ? 'Active' : 'Inactive'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Default Payment Method</span>
                          <span className="se-field-desc">Preferred method for collecting payments.</span>
                        </div>
                        <select
                          className="se-select"
                          value={currentSettings.payments.default_payment_method}
                          onChange={(e) => updateField('payments', 'default_payment_method', e.target.value)}
                        >
                          <option>UPI</option>
                          <option>Card</option>
                          <option>Net Banking</option>
                          <option>Wallet</option>
                        </select>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Payment Capture</span>
                          <span className="se-field-desc">Capture payment automatically after completion.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.payments.payment_capture}
                            onChange={(e) => updateField('payments', 'payment_capture', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Partial Payment</span>
                          <span className="se-field-desc">Allow users to pay partially.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.payments.partial_payment}
                            onChange={(e) => updateField('payments', 'partial_payment', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Payment Retry</span>
                          <span className="se-field-desc">Automatically retry failed payments.</span>
                        </div>
                        <select
                          className="se-select"
                          value={currentSettings.payments.payment_retry}
                          onChange={(e) => updateField('payments', 'payment_retry', e.target.value)}
                        >
                          <option>3 Attempts</option>
                          <option>5 Attempts</option>
                        </select>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Payment Timeout</span>
                          <span className="se-field-desc">Time to wait before failure.</span>
                        </div>
                        <select
                          className="se-select"
                          value={currentSettings.payments.payment_timeout}
                          onChange={(e) => updateField('payments', 'payment_timeout', e.target.value)}
                        >
                          <option>10 Minutes</option>
                          <option>20 Minutes</option>
                        </select>
                      </div>
                    </div>

                    {/* Refund Settings */}
                    <div className="se-card">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Refund Settings</span>
                          <span className="se-card-sub">Configure refund rules.</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Auto Refund</span>
                          <span className="se-field-desc">Enable auto refund for cancelled bookings.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.payments.auto_refund}
                            onChange={(e) => updateField('payments', 'auto_refund', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Refund Approval</span>
                          <span className="se-field-desc">Require approval above a certain amount.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.payments.refund_approval}
                            onChange={(e) => updateField('payments', 'refund_approval', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Refund Limit</span>
                          <span className="se-field-desc">Maximum amount without approval.</span>
                        </div>
                        <div className="se-input-group">
                          <input
                            type="text"
                            className="se-input"
                            value={currentSettings.payments.refund_limit}
                            onChange={(e) => updateField('payments', 'refund_limit', parseFloat(e.target.value) || 500.00)}
                          />
                          <span className="se-input-unit">₹</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Refund Processing Time</span>
                          <span className="se-field-desc">Time taken to process refund.</span>
                        </div>
                        <select
                          className="se-select"
                          value={currentSettings.payments.refund_processing_time}
                          onChange={(e) => updateField('payments', 'refund_processing_time', e.target.value)}
                        >
                          <option>3 - 5 Business Days</option>
                          <option>Instant</option>
                        </select>
                      </div>
                    </div>

                    {/* Taxes & Charges */}
                    <div className="se-card">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Taxes & Charges</span>
                          <span className="se-card-sub">Configure tax structures.</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">GST Applicable</span>
                          <span className="se-field-desc">Enable GST on rides and rentals.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.payments.gst_applicable}
                            onChange={(e) => updateField('payments', 'gst_applicable', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">GST Percentage</span>
                          <span className="se-field-desc">GST percentage to apply.</span>
                        </div>
                        <div className="se-input-group">
                          <input
                            type="text"
                            className="se-input"
                            value={currentSettings.payments.gst_percentage}
                            onChange={(e) => updateField('payments', 'gst_percentage', parseInt(e.target.value) || 18)}
                          />
                          <span className="se-input-unit">%</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Service Fee</span>
                          <span className="se-field-desc">Additional platform service fee.</span>
                        </div>
                        <div className="se-input-group">
                          <input
                            type="text"
                            className="se-input"
                            value={currentSettings.payments.service_fee}
                            onChange={(e) => updateField('payments', 'service_fee', parseFloat(e.target.value) || 10.00)}
                          />
                          <span className="se-input-unit">₹</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Convenience Fee</span>
                          <span className="se-field-desc">Gateway convenience fee.</span>
                        </div>
                        <div className="se-input-group">
                          <input
                            type="text"
                            className="se-input"
                            value={currentSettings.payments.convenience_fee}
                            onChange={(e) => updateField('payments', 'convenience_fee', parseFloat(e.target.value) || 5.00)}
                          />
                          <span className="se-input-unit">₹</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="se-card">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Payment Methods</span>
                          <span className="se-card-sub">Manage available payment methods.</span>
                        </div>
                      </div>

                      <div className="se-pm-list">
                        <div className="se-pm-row">
                          <div className="se-pm-left">
                            <span className="se-pm-drag">☰</span>
                            <div className="se-pm-info">
                              <span className="se-pm-name">UPI</span>
                              <span className="se-pm-desc">Unified Payments Interface</span>
                            </div>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.payments.methods_upi}
                              onChange={(e) => updateField('payments', 'methods_upi', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-pm-row">
                          <div className="se-pm-left">
                            <span className="se-pm-drag">☰</span>
                            <div className="se-pm-info">
                              <span className="se-pm-name">Credit / Debit Cards</span>
                              <span className="se- pm-desc">Visa, Mastercard, Rupay</span>
                            </div>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.payments.methods_card}
                              onChange={(e) => updateField('payments', 'methods_card', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-pm-row">
                          <div className="se-pm-left">
                            <span className="se-pm-drag">☰</span>
                            <div className="se-pm-info">
                              <span className="se-pm-name">Net Banking</span>
                              <span className="se-pm-desc">All major banks supported</span>
                            </div>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.payments.methods_netbanking}
                              onChange={(e) => updateField('payments', 'methods_netbanking', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-pm-row">
                          <div className="se-pm-left">
                            <span className="se-pm-drag">☰</span>
                            <div className="se-pm-info">
                              <span className="se-pm-name">Wallets</span>
                              <span className="se-pm-desc">PhonePe, Paytm, Amazon Pay etc.</span>
                            </div>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.payments.methods_wallets}
                              onChange={(e) => updateField('payments', 'methods_wallets', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-pm-row">
                          <div className="se-pm-left">
                            <span className="se-pm-drag">☰</span>
                            <div className="se-pm-info">
                              <span className="se-pm-name">Cash</span>
                              <span className="se-pm-desc">Cash payments</span>
                            </div>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.payments.methods_cash}
                              onChange={(e) => updateField('payments', 'methods_cash', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>
                      </div>

                      <button className="se-btn" style={{ justifyContent: 'center', borderColor: '#C7D2FE', color: '#2a195c', background: '#F5F7FF', fontWeight: 'bold' }}>
                        + Add Payment Method
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── TAB 4: NOTIFICATIONS ─── */}
                {activeTab === 'Notifications' && currentSettings.notifications && (
                  <div className="se-grid-3">
                    {/* Left Column (spans 1) */}
                    <div className="se-column">
                      {/* Channels */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">Notification Channels</span>
                            <span className="se-card-sub">Choose channels to receive notifications.</span>
                          </div>
                        </div>
                        
                        {/* Email notification channel */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">Email Notifications</span>
                              <span className="se-field-desc">Receive notifications on email.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <label className="se-switch">
                              <input
                                type="checkbox"
                                checked={currentSettings.notifications.channels_email}
                                onChange={(e) => updateField('notifications', 'channels_email', e.target.checked)}
                              />
                              <span className="se-slider" />
                            </label>
                          </div>
                        </div>

                        {/* SMS notification channel */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">SMS Notifications</span>
                              <span className="se-field-desc">Receive important SMS alerts.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <label className="se-switch">
                              <input
                                type="checkbox"
                                checked={currentSettings.notifications.channels_sms}
                                onChange={(e) => updateField('notifications', 'channels_sms', e.target.checked)}
                              />
                              <span className="se-slider" />
                            </label>
                          </div>
                        </div>

                        {/* In-app notification channel */}
                        <div className="se-field-row">
                          <div className="se-field-left">
                            <div className="se-field-icon" style={{ background: '#FFF7ED', color: '#F97316' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                            </div>
                            <div className="se-field-text">
                              <span className="se-field-tit">In-App Notifications</span>
                              <span className="se-field-desc">Receive in-app alerts.</span>
                            </div>
                          </div>
                          <div className="se-field-control">
                            <label className="se-switch">
                              <input
                                type="checkbox"
                                checked={currentSettings.notifications.channels_inapp}
                                onChange={(e) => updateField('notifications', 'channels_inapp', e.target.checked)}
                              />
                              <span className="se-slider" />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Quiet Hours */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">Quiet Hours</span>
                            <span className="se-card-sub">Set silent time frames.</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Quiet Hours</span>
                            <span className="se-field-desc">Enable silent window.</span>
                          </div>
                          <label className="se-switch">
                            <input
                              type="checkbox"
                              checked={currentSettings.notifications.quiet_hours_enabled}
                              onChange={(e) => updateField('notifications', 'quiet_hours_enabled', e.target.checked)}
                            />
                            <span className="se-slider" />
                          </label>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Window Timing</span>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="text" className="se-input" style={{ width: '80px', textAlign: 'center' }} value={currentSettings.notifications.quiet_hours_from} onChange={(e) => updateField('notifications', 'quiet_hours_from', e.target.value)} />
                            <span style={{ fontSize: '11px', color: '#64748B' }}>to</span>
                            <input type="text" className="se-input" style={{ width: '80px', textAlign: 'center' }} value={currentSettings.notifications.quiet_hours_to} onChange={(e) => updateField('notifications', 'quiet_hours_to', e.target.value)} />
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Time Zone</span>
                          </div>
                          <select
                            className="se-select"
                            value={currentSettings.notifications.quiet_hours_timezone}
                            onChange={(e) => updateField('notifications', 'quiet_hours_timezone', e.target.value)}
                          >
                            <option>(UTC +05:30) Asia/Kolkata</option>
                          </select>
                        </div>
                      </div>

                      {/* Important Alerts */}
                      <div className="se-card">
                        <div className="se-card-hdr">
                          <div className="se-card-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit">Important Alerts</span>
                            <span className="se-card-sub">Always active critical logs.</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '12px', color: '#334155' }}>
                          <div><span style={{ color: '#10B981', marginRight: 6 }}>✔</span> Security alerts & login activity</div>
                          <div><span style={{ color: '#10B981', marginRight: 6 }}>✔</span> Payment failures & details</div>
                          <div><span style={{ color: '#10B981', marginRight: 6 }}>✔</span> System maintenance & downtime</div>
                          <div><span style={{ color: '#10B981', marginRight: 6 }}>✔</span> Legal notifications</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Columns (spans 2) */}
                    <div className="se-card se-span-2">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22c1.1 0 2-.9 2-2H10c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Notification Preferences</span>
                          <span className="se-card-sub">Select notification preferences.</span>
                        </div>
                      </div>
                      
                      <table className="se-noti-table">
                        <thead>
                          <tr>
                            <th>Notification Type</th>
                            <th className="se-noti-ch">Email</th>
                            <th className="se-noti-ch">SMS</th>
                            <th className="se-noti-ch">In-App</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ fontWeight: 'bold' }}>Ride Bookings</td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_ride_bookings.email} onChange={(e) => updateField('notifications', 'prefs_ride_bookings', { ...currentSettings.notifications.prefs_ride_bookings, email: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_ride_bookings.sms} onChange={(e) => updateField('notifications', 'prefs_ride_bookings', { ...currentSettings.notifications.prefs_ride_bookings, sms: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_ride_bookings.inapp} onChange={(e) => updateField('notifications', 'prefs_ride_bookings', { ...currentSettings.notifications.prefs_ride_bookings, inapp: e.target.checked })} /></td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 'bold' }}>Rental Bookings</td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_rental_bookings.email} onChange={(e) => updateField('notifications', 'prefs_rental_bookings', { ...currentSettings.notifications.prefs_rental_bookings, email: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_rental_bookings.sms} onChange={(e) => updateField('notifications', 'prefs_rental_bookings', { ...currentSettings.notifications.prefs_rental_bookings, sms: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_rental_bookings.inapp} onChange={(e) => updateField('notifications', 'prefs_rental_bookings', { ...currentSettings.notifications.prefs_rental_bookings, inapp: e.target.checked })} /></td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 'bold' }}>Payments</td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_payments.email} onChange={(e) => updateField('notifications', 'prefs_payments', { ...currentSettings.notifications.prefs_payments, email: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_payments.sms} onChange={(e) => updateField('notifications', 'prefs_payments', { ...currentSettings.notifications.prefs_payments, sms: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_payments.inapp} onChange={(e) => updateField('notifications', 'prefs_payments', { ...currentSettings.notifications.prefs_payments, inapp: e.target.checked })} /></td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 'bold' }}>Payouts</td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_payouts.email} onChange={(e) => updateField('notifications', 'prefs_payouts', { ...currentSettings.notifications.prefs_payouts, email: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_payouts.sms} onChange={(e) => updateField('notifications', 'prefs_payouts', { ...currentSettings.notifications.prefs_payouts, sms: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_payouts.inapp} onChange={(e) => updateField('notifications', 'prefs_payouts', { ...currentSettings.notifications.prefs_payouts, inapp: e.target.checked })} /></td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 'bold' }}>Battery Alerts</td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_battery_alerts.email} onChange={(e) => updateField('notifications', 'prefs_battery_alerts', { ...currentSettings.notifications.prefs_battery_alerts, email: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_battery_alerts.sms} onChange={(e) => updateField('notifications', 'prefs_battery_alerts', { ...currentSettings.notifications.prefs_battery_alerts, sms: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_battery_alerts.inapp} onChange={(e) => updateField('notifications', 'prefs_battery_alerts', { ...currentSettings.notifications.prefs_battery_alerts, inapp: e.target.checked })} /></td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 'bold' }}>Vehicle Alerts</td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_vehicle_alerts.email} onChange={(e) => updateField('notifications', 'prefs_vehicle_alerts', { ...currentSettings.notifications.prefs_vehicle_alerts, email: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_vehicle_alerts.sms} onChange={(e) => updateField('notifications', 'prefs_vehicle_alerts', { ...currentSettings.notifications.prefs_vehicle_alerts, sms: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_vehicle_alerts.inapp} onChange={(e) => updateField('notifications', 'prefs_vehicle_alerts', { ...currentSettings.notifications.prefs_vehicle_alerts, inapp: e.target.checked })} /></td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 'bold' }}>System Alerts</td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_system_alerts.email} onChange={(e) => updateField('notifications', 'prefs_system_alerts', { ...currentSettings.notifications.prefs_system_alerts, email: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_system_alerts.sms} onChange={(e) => updateField('notifications', 'prefs_system_alerts', { ...currentSettings.notifications.prefs_system_alerts, sms: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_system_alerts.inapp} onChange={(e) => updateField('notifications', 'prefs_system_alerts', { ...currentSettings.notifications.prefs_system_alerts, inapp: e.target.checked })} /></td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 'bold' }}>Promotions & Offers</td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_promotions.email} onChange={(e) => updateField('notifications', 'prefs_promotions', { ...currentSettings.notifications.prefs_promotions, email: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_promotions.sms} onChange={(e) => updateField('notifications', 'prefs_promotions', { ...currentSettings.notifications.prefs_promotions, sms: e.target.checked })} /></td>
                            <td className="se-noti-ch"><input type="checkbox" checked={currentSettings.notifications.prefs_promotions.inapp} onChange={(e) => updateField('notifications', 'prefs_promotions', { ...currentSettings.notifications.prefs_promotions, inapp: e.target.checked })} /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Summary row */}
                    <div className="se-card se-grid-all">
                      <span className="se-card-tit">Notification Summary</span>
                      <div className="se-noti-sum-row">
                        <div className="se-noti-sum-card">
                          <div className="se-noti-sum-ic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                          </div>
                          <div className="se-noti-sum-info">
                            <span className="se-noti-sum-lbl">Email</span>
                            <span className="se-noti-sum-val">6 of 8 enabled</span>
                            <span className="se-noti-sum-val" style={{ color: '#2a195c', fontWeight: '600' }}>{typeof window !== 'undefined' ? (localStorage.getItem('evegah_user_email') || 'himanshu@evegah.com') : 'himanshu@evegah.com'}</span>
                          </div>
                        </div>

                        <div className="se-noti-sum-card">
                          <div className="se-noti-sum-ic" style={{ background: '#ECFDF5', color: '#10B981' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          </div>
                          <div className="se-noti-sum-info">
                            <span className="se-noti-sum-lbl">SMS</span>
                            <span className="se-noti-sum-val">4 of 8 enabled</span>
                            <span className="se-noti-sum-val" style={{ color: '#10B981', fontWeight: '600' }}>+91 98765 43210</span>
                          </div>
                        </div>

                        <div className="se-noti-sum-card">
                          <div className="se-noti-sum-ic" style={{ background: '#FFF7ED', color: '#F97316' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                          </div>
                          <div className="se-noti-sum-info">
                            <span className="se-noti-sum-lbl">In-App</span>
                            <span className="se-noti-sum-val">8 of 8 enabled</span>
                            <span className="se-noti-sum-val" style={{ color: '#F97316', fontWeight: '600' }}>Will be shown in app</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 5: BATTERY & SWAPPING ─── */}
                {activeTab === 'Battery & Swapping' && currentSettings.battery_swapping && (
                  <div className="se-grid">
                    {/* Swapping Preferences */}
                    <div className="se-card">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="16" height="10" rx="2" ry="2" /><line x1="22" y1="11" x2="22" y2="13" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Swapping Preferences</span>
                          <span className="se-card-sub">Configure SoC levels and swap constraints.</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Swap Threshold (SoC)</span>
                          <span className="se-field-desc">SoC percentage below which battery swap is recommended.</span>
                        </div>
                        <div className="se-input-group">
                          <input
                            type="text"
                            className="se-input"
                            value={currentSettings.battery_swapping.soc_swap_threshold}
                            onChange={(e) => updateField('battery_swapping', 'soc_swap_threshold', parseInt(e.target.value) || 20)}
                          />
                          <span className="se-input-unit">%</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Alert Threshold (SoC)</span>
                          <span className="se-field-desc">SoC percentage below which critical alarms are triggered.</span>
                        </div>
                        <div className="se-input-group">
                          <input
                            type="text"
                            className="se-input"
                            value={currentSettings.battery_swapping.soc_alert_threshold}
                            onChange={(e) => updateField('battery_swapping', 'soc_alert_threshold', parseInt(e.target.value) || 15)}
                          />
                          <span className="se-input-unit">%</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Maximum Cycle Limit</span>
                          <span className="se-field-desc">Maximum charge/discharge cycles allowed before decommission recommendation.</span>
                        </div>
                        <div className="se-input-group" style={{ width: '160px' }}>
                          <input
                            type="text"
                            className="se-input"
                            value={currentSettings.battery_swapping.max_cycles_limit}
                            onChange={(e) => updateField('battery_swapping', 'max_cycles_limit', parseInt(e.target.value) || 500)}
                          />
                          <span className="se-input-unit">Cycles</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Alert Temperature Threshold</span>
                          <span className="se-field-desc">High battery temperature threshold for warnings.</span>
                        </div>
                        <div className="se-input-group">
                          <input
                            type="text"
                            className="se-input"
                            value={currentSettings.battery_swapping.temp_alert_threshold}
                            onChange={(e) => updateField('battery_swapping', 'temp_alert_threshold', parseInt(e.target.value) || 45)}
                          />
                          <span className="se-input-unit">°C</span>
                        </div>
                      </div>
                    </div>

                    {/* Smart Allocation */}
                    <div className="se-card">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Smart Allocation</span>
                          <span className="se-card-sub">IoT and swap security features.</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Automatic Station Allocation</span>
                          <span className="se-field-desc">Assign riders to nearest swap stations automatically.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.battery_swapping.auto_station_allocation}
                            onChange={(e) => updateField('battery_swapping', 'auto_station_allocation', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Require Swap Authentication</span>
                          <span className="se-field-desc">OTP verification required at smart cabinets before door opens.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.battery_swapping.require_swap_auth}
                            onChange={(e) => updateField('battery_swapping', 'require_swap_auth', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 6: DOCUMENTS ─── */}
                {activeTab === 'Documents' && currentSettings.documents && (
                  <div className="se-grid">
                    {/* Verification documents */}
                    <div className="se-card">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Required Verification Documents</span>
                          <span className="se-card-sub">Choose mandatory documents for rider onboarding.</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Require Aadhar Card</span>
                          <span className="se-field-desc">Mandatory Aadhar submission and verification.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.documents.require_aadhar}
                            onChange={(e) => updateField('documents', 'require_aadhar', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Require Driving License</span>
                          <span className="se-field-desc">Mandatory DL submission for active bookings.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.documents.require_dl}
                            onChange={(e) => updateField('documents', 'require_dl', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Require PAN Card</span>
                          <span className="se-field-desc">Require PAN Card upload for commercial tax.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.documents.require_pan}
                            onChange={(e) => updateField('documents', 'require_pan', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>
                    </div>

                    {/* Verification Settings */}
                    <div className="se-card">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Verification Settings</span>
                          <span className="se-card-sub">Upload rules and API validations.</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Automatic Document Verification</span>
                          <span className="se-field-desc">Auto-verify Aadhaar/DL details via external APIs.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.documents.auto_verify_documents}
                            onChange={(e) => updateField('documents', 'auto_verify_documents', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Maximum File Size</span>
                          <span className="se-field-desc">Limit document attachment size to avoid storage bloat.</span>
                        </div>
                        <div className="se-input-group">
                          <input
                            type="text"
                            className="se-input"
                            value={currentSettings.documents.max_file_size}
                            onChange={(e) => updateField('documents', 'max_file_size', parseInt(e.target.value) || 5)}
                          />
                          <span className="se-input-unit">MB</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Allowed Formats</span>
                          <span className="se-field-desc">Restricted file formats.</span>
                        </div>
                        <input
                          type="text"
                          className="se-input"
                          style={{ width: '160px' }}
                          value={currentSettings.documents.allowed_formats}
                          onChange={(e) => updateField('documents', 'allowed_formats', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 7: SECURITY ─── */}
                {activeTab === 'Security' && currentSettings.security && (
                  <div className="se-grid">
                    {/* Security Policy Settings */}
                    <div className="se-card se-grid-all">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Security Policy Settings</span>
                          <span className="se-card-sub">Maintain data integrity and authorization settings.</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Two-Factor Authentication (2FA)</span>
                          <span className="se-field-desc">Enforce two-factor authentication for employees and zone administrators.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.security.two_factor_auth}
                            onChange={(e) => updateField('security', 'two_factor_auth', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Strong Password Policy</span>
                          <span className="se-field-desc">Enforce symbols, numbers, and casing requirements.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.security.strong_password_policy}
                            onChange={(e) => updateField('security', 'strong_password_policy', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Maximum Login Attempts</span>
                          <span className="se-field-desc">Lock account momentarily after successive wrong passwords.</span>
                        </div>
                        <select
                          className="se-select"
                          value={currentSettings.security.max_login_attempts}
                          onChange={(e) => updateField('security', 'max_login_attempts', parseInt(e.target.value) || 5)}
                        >
                          <option value="3">3 Attempts</option>
                          <option value="5">5 Attempts</option>
                          <option value="10">10 Attempts</option>
                        </select>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Session Timeout Seconds</span>
                          <span className="se-field-desc">Duration of inactivity before automated signout.</span>
                        </div>
                        <div className="se-input-group" style={{ width: '180px' }}>
                          <input
                            type="text"
                            className="se-input"
                            value={currentSettings.security.session_timeout_seconds}
                            onChange={(e) => updateField('security', 'session_timeout_seconds', parseInt(e.target.value) || 1800)}
                          />
                          <span className="se-input-unit">Seconds</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Allow Concurrent Logins</span>
                          <span className="se-field-desc">Allow account to be authenticated on multiple devices.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.security.allow_concurrent_logins}
                            onChange={(e) => updateField('security', 'allow_concurrent_logins', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>
                    </div>

                    {/* Super Admin Only: Security Deposit Refund Authorization */}
                    {isSuperAdmin && (
                      <div className="se-card se-grid-all" style={{ border: '2px solid #2A195C', background: '#FCFAFF' }}>
                        <div className="se-card-hdr">
                          <div className="se-card-ic" style={{ background: '#2A195C', color: '#fff' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </div>
                          <div className="se-card-text">
                            <span className="se-card-tit" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              Deposit Refund Authorization Security
                              <span style={{ fontSize: '10.5px', background: '#2A195C', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>SUPER ADMIN ONLY</span>
                            </span>
                            <span className="se-card-sub">Configure the authorized mobile number for OTP approval and the master password required before any security deposit refund is processed.</span>
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Refund Authorization Mobile (for OTP)</span>
                            <span className="se-field-desc">System dispatches automated WhatsApp OTP to this number when a deposit refund is initiated.</span>
                          </div>
                          <div style={{ width: '220px' }}>
                            <input
                              type="text"
                              className="se-input"
                              placeholder="e.g. 8128251172"
                              value={currentSettings.security.refund_auth_mobile || '8128251172'}
                              onChange={(e) => updateField('security', 'refund_auth_mobile', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="se-field">
                          <div className="se-field-info">
                            <span className="se-field-tit">Refund Master Password</span>
                            <span className="se-field-desc">Master password that can alternatively be entered to instantly authorize refund transactions.</span>
                          </div>
                          <div style={{ width: '220px', position: 'relative' }}>
                            <input
                              type={showRefundPwd ? "text" : "password"}
                              className="se-input"
                              placeholder="Master Password"
                              value={currentSettings.security.refund_auth_password || 'Qatar@2022'}
                              onChange={(e) => updateField('security', 'refund_auth_password', e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => setShowRefundPwd(!showRefundPwd)}
                              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#64748B', fontWeight: 700 }}
                            >
                              {showRefundPwd ? "Hide" : "Show"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB 8: SYSTEM ─── */}
                {activeTab === 'System' && currentSettings.system && (
                  <div className="se-grid-3">
                    {/* System Preferences */}
                    <div className="se-card">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14H11V11H13zm0-7H11V7H13z"/></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">System Preferences</span>
                          <span className="se-card-sub">Configure core system behavior and preferences.</span>
                        </div>
                      </div>

                      {/* Timezone */}
                      <div className="se-field-row">
                        <div className="se-field-left">
                          <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          </div>
                          <div className="se-field-text">
                            <span className="se-field-tit">System Time Zone</span>
                            <span className="se-field-desc">Set the default time zone.</span>
                          </div>
                        </div>
                        <div className="se-field-control">
                          <select
                            className="se-select"
                            value={currentSettings.system.system_time_zone}
                            onChange={(e) => updateField('system', 'system_time_zone', e.target.value)}
                          >
                            <option>(UTC +05:30) Asia/Kolkata</option>
                          </select>
                        </div>
                      </div>

                      {/* Date Format */}
                      <div className="se-field-row">
                        <div className="se-field-left">
                          <div className="se-field-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          </div>
                          <div className="se-field-text">
                            <span className="se-field-tit">Date Format</span>
                            <span className="se-field-desc">Choose the default date format.</span>
                          </div>
                        </div>
                        <div className="se-field-control">
                          <select
                            className="se-select"
                            value={currentSettings.system.system_date_format}
                            onChange={(e) => updateField('system', 'system_date_format', e.target.value)}
                          >
                            <option>DD-MM-YYYY</option>
                          </select>
                        </div>
                      </div>

                      {/* Time format */}
                      <div className="se-field-row">
                        <div className="se-field-left">
                          <div className="se-field-icon" style={{ background: '#F5F3FF', color: '#2a195c' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          </div>
                          <div className="se-field-text">
                            <span className="se-field-tit">Time Format</span>
                            <span className="se-field-desc">Choose the default time format.</span>
                          </div>
                        </div>
                        <div className="se-field-control">
                          <select
                            className="se-select"
                            value={currentSettings.system.system_time_format}
                            onChange={(e) => updateField('system', 'system_time_format', e.target.value)}
                          >
                            <option>12 Hour (AM/PM)</option>
                            <option>24 Hour</option>
                          </select>
                        </div>
                      </div>

                      {/* Language */}
                      <div className="se-field-row">
                        <div className="se-field-left">
                          <div className="se-field-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          </div>
                          <div className="se-field-text">
                            <span className="se-field-tit">Language</span>
                            <span className="se-field-desc">Set the default system language.</span>
                          </div>
                        </div>
                        <div className="se-field-control">
                          <select
                            className="se-select"
                            value={currentSettings.system.system_language}
                            onChange={(e) => updateField('system', 'system_language', e.target.value)}
                          >
                            <option>English</option>
                            <option>Hindi</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* System Maintenance */}
                    <div className="se-card">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">System Maintenance</span>
                          <span className="se-card-sub">Tools to maintain and optimize system performance.</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Clear System Cache</span>
                          <span className="se-field-desc">Remove temporary files and cached data.</span>
                        </div>
                        <button className="se-btn" style={{ padding: '8px 16px' }}>Clear Cache</button>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Rebuild Search Index</span>
                          <span className="se-field-desc">Rebuild search index for better performance.</span>
                        </div>
                        <button className="se-btn" style={{ padding: '8px 16px' }}>Rebuild</button>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Database Optimization</span>
                          <span className="se-field-desc">Optimize database tables and performance.</span>
                        </div>
                        <button className="se-btn" style={{ padding: '8px 16px' }}>Optimize</button>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">System Logs</span>
                          <span className="se-field-desc">View and manage system logs.</span>
                        </div>
                        <button className="se-btn" style={{ padding: '8px 16px' }}>View Logs</button>
                      </div>
                    </div>

                    {/* System Updates */}
                    <div className="se-card">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">System Updates</span>
                          <span className="se-card-sub">Manage system updates and new features.</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Automatic Updates</span>
                          <span className="se-field-desc">Automatically install system updates.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.system.system_automatic_updates}
                            onChange={(e) => updateField('system', 'system_automatic_updates', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Update Channel</span>
                          <span className="se-field-desc">Choose the update channel.</span>
                        </div>
                        <select
                          className="se-select"
                          value={currentSettings.system.system_update_channel}
                          onChange={(e) => updateField('system', 'system_update_channel', e.target.value)}
                        >
                          <option>Stable</option>
                          <option>Beta</option>
                        </select>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Last Checked</span>
                          <span className="se-field-desc">Last time system updates were checked.</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{currentSettings.system.system_last_checked}</span>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Current Version</span>
                          <span className="se-field-desc">You are running the latest version.</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{currentSettings.system.system_version}</span>
                          <span className="se-badge badge-latest">Latest</span>
                        </div>
                      </div>
                    </div>

                    {/* System Information */}
                    <div className="se-card se-grid-all">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 16v-4M12 8h.01" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">System Information</span>
                          <span className="se-card-sub">Overview of your system environment and configuration.</span>
                        </div>
                      </div>
                      
                      <div className="se-sys-info-grid">
                        <div>
                          <span className="se-sys-val-lbl">System Name</span>
                          <div className="se-sys-val-val">Evegah Management System</div>
                        </div>
                        <div>
                          <span className="se-sys-val-lbl">Server Name</span>
                          <div className="se-sys-val-val">{currentSettings.system.system_info.server_name}</div>
                        </div>
                        <div>
                          <span className="se-sys-val-lbl">Web Server</span>
                          <div className="se-sys-val-val">{currentSettings.system.system_info.web_server}</div>
                        </div>
                        <div>
                          <span className="se-sys-val-lbl">Active Users</span>
                          <div className="se-sys-val-val">{currentSettings.system.system_info.active_users}</div>
                        </div>
                        <div>
                          <span className="se-sys-val-lbl">Environment</span>
                          <div className="se-sys-val-val"><span className="se-badge badge-active">{currentSettings.system.system_info.environment}</span></div>
                        </div>
                        <div>
                          <span className="se-sys-val-lbl">PHP Version</span>
                          <div className="se-sys-val-val">{currentSettings.system.system_info.php_version}</div>
                        </div>
                        <div>
                          <span className="se-sys-val-lbl">Total Storage</span>
                          <div className="se-sys-val-val">{currentSettings.system.system_info.total_storage} GB</div>
                        </div>
                        <div>
                          <span className="se-sys-val-lbl">Active Sessions</span>
                          <div className="se-sys-val-val">{currentSettings.system.system_info.active_sessions}</div>
                        </div>
                        <div>
                          <span className="se-sys-val-lbl">Server Time</span>
                          <div className="se-sys-val-val">21 May 2024, 10:30 AM</div>
                        </div>
                        <div>
                          <span className="se-sys-val-lbl">Database Version</span>
                          <div className="se-sys-val-val">{currentSettings.system.system_info.database_version}</div>
                        </div>
                        <div>
                          <span className="se-sys-val-lbl">Used Storage</span>
                          <div className="se-sys-val-val">{currentSettings.system.system_info.used_storage} GB (50%)</div>
                          <div className="se-progress-bg"><div className="se-progress-fill" style={{ width: '50%' }} /></div>
                        </div>
                        <div>
                          <span className="se-sys-val-lbl">System Uptime</span>
                          <div className="se-sys-val-val">{currentSettings.system.system_info.uptime}</div>
                        </div>
                      </div>
                    </div>

                    {/* Backup & Restore */}
                    <div className="se-card se-span-2">
                      <div className="se-card-hdr">
                        <div className="se-card-ic">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-3.1-3.1-5.4-6.2-5.7-4-.4-7.3 2.4-7.6 6.2-.1.9.1 1.8.4 2.6M2 17h10M5 14v4M12 11l4 4-4 4"/></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit">Backup & Restore</span>
                          <span className="se-card-sub">Manage system backups and restore points.</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Auto Backup</span>
                          <span className="se-field-desc">Automatically backup system data.</span>
                        </div>
                        <label className="se-switch">
                          <input
                            type="checkbox"
                            checked={currentSettings.system.auto_backup}
                            onChange={(e) => updateField('system', 'auto_backup', e.target.checked)}
                          />
                          <span className="se-slider" />
                        </label>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Backup Frequency</span>
                          <span className="se-field-desc">Set how often system backups are created.</span>
                        </div>
                        <select
                          className="se-select"
                          value={currentSettings.system.backup_frequency}
                          onChange={(e) => updateField('system', 'backup_frequency', e.target.value)}
                        >
                          <option>Daily</option>
                          <option>Weekly</option>
                        </select>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Last Backup</span>
                          <span className="se-field-desc">Last successful backup.</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{currentSettings.system.last_backup}</span>
                          <span className="se-badge badge-success">Success</span>
                        </div>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Backup Size</span>
                          <span className="se-field-desc">Size of the last backup.</span>
                        </div>
                        <span className="se-badge" style={{ background: '#F1F5F9', color: '#1E293B', fontSize: '12px' }}>{currentSettings.system.backup_size}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px' }}>
                        <button className="se-btn" style={{ justifyContent: 'center', fontSize: '12px' }}>Backup Now</button>
                        <button className="se-btn" style={{ justifyContent: 'center', fontSize: '12px' }}>Restore</button>
                        <button className="se-btn" style={{ justifyContent: 'center', fontSize: '12px' }}>Download</button>
                      </div>
                    </div>

                    {/* System Reset */}
                    <div className="se-card" style={{ border: '1px solid #FCA5A5' }}>
                      <div className="se-card-hdr">
                        <div className="se-card-ic" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
                        </div>
                        <div className="se-card-text">
                          <span className="se-card-tit" style={{ color: '#B91C1C' }}>System Reset</span>
                          <span className="se-card-sub">Reset system settings to default values.</span>
                        </div>
                      </div>

                      <div className="se-alert-success">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        All system settings have been reset to their default values successfully.
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Reset Type</span>
                          <span className="se-field-desc">Choose what you want to reset.</span>
                        </div>
                        <select className="se-select" style={{ width: '160px' }}>
                          <option>All Settings</option>
                          <option>Only General</option>
                        </select>
                      </div>

                      <div className="se-field">
                        <div className="se-field-info">
                          <span className="se-field-tit">Confirm Action</span>
                          <span className="se-field-desc">Type RESET to confirm.</span>
                        </div>
                        <input type="text" className="se-input" style={{ width: '100px' }} placeholder="RESET" />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button className="se-btn se-btn-danger" style={{ background: '#EF4444', color: '#fff' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 2 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          Reset System
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL: ADD / EDIT PAYMENT GATEWAY ─── */}
      {gatewayModalOpen && (
        <div className="se-modal-backdrop" onClick={() => setGatewayModalOpen(false)}>
          <div className="se-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="se-modal-hdr">
              <span className="se-modal-title">
                {editingGateway ? `Configure Gateway: ${gatewayForm.name}` : '+ Add New Payment Gateway'}
              </span>
              <button className="se-modal-close" onClick={() => setGatewayModalOpen(false)}>✕</button>
            </div>

            <div className="se-modal-body">
              <div className="se-form-group">
                <label className="se-form-label">Gateway Provider</label>
                <select
                  className="se-form-input"
                  value={gatewayForm.provider}
                  disabled={!!editingGateway}
                  onChange={(e) => {
                    const prov = e.target.value;
                    let defaultName = 'Custom Gateway';
                    let defaultEnv = 'production';
                    let keyId = '';
                    let secret = '';
                    let clientId = '';
                    let clientSecret = '';
                    let vpa = '';
                    if (prov === 'payu') {
                      defaultName = 'PayU India';
                      defaultEnv = 'production';
                      keyId = 'zWJFsB';
                      secret = 'A9xN8x7qX2uH8a4a2L0vD3rJ7xB0lP9o';
                      clientId = '8ecdb3a31264fb5b8c0ef026846a904d9aefcef39acdfb55d61225cdc06eb543';
                      clientSecret = 'd9c50d234985c580d2ac5ea6891cfb5d7f8f12dadb5b5afb6cc565b1b28ad7e4';
                    } else if (prov === 'phonepe') {
                      defaultName = 'PhonePe';
                      defaultEnv = 'test';
                    } else if (prov === 'paytm') {
                      defaultName = 'Paytm';
                    } else if (prov === 'razorpay') {
                      defaultName = 'Razorpay';
                    } else if (prov === 'cashfree') {
                      defaultName = 'Cashfree';
                    }
                    setGatewayForm((prev: any) => ({
                      ...prev,
                      provider: prov,
                      name: defaultName,
                      environment: defaultEnv,
                      key_id: keyId || prev.key_id,
                      key_secret: secret || prev.key_secret,
                      client_id: clientId || prev.client_id,
                      client_secret: clientSecret || prev.client_secret,
                      vpa: vpa || prev.vpa
                    }));
                  }}
                >
                  <option value="payu">PayU India</option>
                  <option value="phonepe">PhonePe</option>
                  <option value="paytm">Paytm</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="cashfree">Cashfree</option>
                  <option value="custom">Custom Gateway / UPI</option>
                </select>
              </div>

              <div className="se-form-group">
                <label className="se-form-label">Display Name</label>
                <input
                  type="text"
                  className="se-form-input"
                  value={gatewayForm.name}
                  onChange={(e) => setGatewayForm((prev: any) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. PayU India"
                />
              </div>

              <div className="se-form-group">
                <label className="se-form-label">
                  {gatewayForm.provider === 'payu' ? 'Merchant Key' : 'Key ID / Merchant ID'}
                </label>
                <input
                  type="text"
                  className="se-form-input"
                  value={gatewayForm.key_id}
                  onChange={(e) => setGatewayForm((prev: any) => ({ ...prev, key_id: e.target.value }))}
                  placeholder="Enter Key ID / Merchant Key"
                />
                <span className="se-form-hint">Used for merchant authentication and transaction initiation</span>
              </div>

              <div className="se-form-group">
                <label className="se-form-label">
                  {gatewayForm.provider === 'payu' ? 'Merchant Salt' : 'Key Secret / Salt'}
                </label>
                <input
                  type="text"
                  className="se-form-input"
                  value={gatewayForm.key_secret}
                  onChange={(e) => setGatewayForm((prev: any) => ({ ...prev, key_secret: e.target.value }))}
                  placeholder="Enter Key Secret / Salt"
                />
                <span className="se-form-hint">Used on the backend for secure SHA-512 checksum hashing</span>
              </div>

              {gatewayForm.provider === 'payu' && (
                <>
                  <div className="se-form-group">
                    <label className="se-form-label">PayU Client ID</label>
                    <input
                      type="text"
                      className="se-form-input"
                      value={gatewayForm.client_id || ''}
                      onChange={(e) => setGatewayForm((prev: any) => ({ ...prev, client_id: e.target.value }))}
                      placeholder="Enter PayU Client ID"
                    />
                  </div>
                  <div className="se-form-group">
                    <label className="se-form-label">PayU Client Secret</label>
                    <input
                      type="text"
                      className="se-form-input"
                      value={gatewayForm.client_secret || ''}
                      onChange={(e) => setGatewayForm((prev: any) => ({ ...prev, client_secret: e.target.value }))}
                      placeholder="Enter PayU Client Secret"
                    />
                  </div>
                </>
              )}

              {gatewayForm.provider === 'phonepe' && (
                <div className="se-form-group">
                  <label className="se-form-label">PhonePe Key Index (Salt Index)</label>
                  <input
                    type="text"
                    className="se-form-input"
                    value={gatewayForm.key_index || '1'}
                    onChange={(e) => setGatewayForm((prev: any) => ({ ...prev, key_index: e.target.value }))}
                    placeholder="1"
                  />
                  <span className="se-form-hint">Usually 1. Found in your PhonePe Business Dashboard Developer section</span>
                </div>
              )}

              <div className="se-form-group">
                <label className="se-form-label">Environment Mode</label>
                <select
                  className="se-form-input"
                  value={gatewayForm.environment}
                  onChange={(e) => setGatewayForm((prev: any) => ({ ...prev, environment: e.target.value }))}
                >
                  <option value="test">Test Sandbox (Sandbox Testing Mode)</option>
                  <option value="production">Live Production (Real Collections)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={gatewayForm.active}
                    onChange={(e) => setGatewayForm((prev: any) => ({ ...prev, active: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: '#2A195C' }}
                  />
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>Activate Gateway Immediately</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={gatewayForm.is_primary}
                    onChange={(e) => setGatewayForm((prev: any) => ({ ...prev, is_primary: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: '#2A195C' }}
                  />
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>Set as Primary / Default Gateway</span>
                </label>
              </div>
            </div>

            <div className="se-modal-footer">
              <button
                className="se-btn"
                style={{ background: '#F1F5F9', color: '#475569', border: 'none' }}
                onClick={() => setGatewayModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="se-btn se-btn-primary"
                onClick={handleSaveGateway}
              >
                {gatewayForm.active ? 'Save & Activate' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
