"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.ev-shell { display: flex; min-height: 100vh; background: #F3F4F9; font-family: 'Inter', sans-serif; }
.ev-main { margin-left: var(--ev-sidebar-width, 240px); display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - var(--ev-sidebar-width, 240px)); }
.ev-body { padding: 20px 22px 50px; flex: 1; display: flex; flex-direction: column; gap: 20px; }

/* Top Bar Styling */
.sa-tb { background: #fff; padding: 14px 24px; border-bottom: 1.5px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
.sa-tb-hello { font-size: 18px; font-weight: 800; color: #1E293B; margin: 0; }
.sa-tb-sub { font-size: 12px; color: #64748B; margin: 4px 0 0 0; }
.sa-tb-right { display: flex; align-items: center; gap: 16px; }
.sa-tb-prof { display: flex; align-items: center; gap: 10px; }
.sa-tb-prof-av { width: 34px; height: 34px; border-radius: 50%; background: #2a195c; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.sa-tb-prof-info { display: flex; flex-direction: column; }
.sa-tb-prof-name { font-size: 13px; font-weight: 700; color: #1E293B; }
.sa-tb-prof-role { font-size: 11px; color: #64748B; }

/* Breadcrumbs */
.fr-bc { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748B; font-weight: 500; }
.fr-bc a { color: #64748B; text-decoration: none; }
.fr-bc a:hover { color: #2a195c; }
.fr-bc-sep { color: #94A3B8; }
.fr-bc-cur { color: #2a195c; font-weight: 700; }

/* White Label Header */
.wl-hdr { display: flex; justify-content: space-between; align-items: flex-start; }
.wl-title-h1 { font-size: 22px; font-weight: 800; color: #1E293B; margin: 0; }
.wl-title-sub { font-size: 12.5px; color: #64748B; margin-top: 4px; }
.wl-hdr-actions { display: flex; gap: 10px; }

.wl-btn { display: flex; align-items: center; gap: 6px; padding: 9px 16px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; font-weight: 700; color: #475569; background: #fff; cursor: pointer; transition: all 0.15s; font-family: inherit; }
.wl-btn:hover { border-color: #6366F1; color: #6366F1; }
.wl-btn-primary { background: #6366F1; color: #fff; border-color: #6366F1; }
.wl-btn-primary:hover { background: #2A195C; border-color: #2A195C; }

/* Tabs Selector */
.wl-tabs { display: flex; border-bottom: 1.5px solid #E2E8F0; gap: 24px; margin-top: 6px; }
.wl-tab { font-size: 12.5px; font-weight: 700; color: #64748B; padding-bottom: 10px; cursor: pointer; background: none; border-top: none; border-left: none; border-right: none; border-bottom: 2px solid transparent; transition: all 0.15s; font-family: inherit; }
.wl-tab:hover { color: #0F172A; }
.wl-tab.act { color: #6366F1; border-color: #6366F1; }

/* Layout Grid */
.wl-layout { display: grid; grid-template-columns: 1fr 350px; gap: 20px; align-items: start; }
.wl-panel { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); overflow: hidden; display: flex; flex-direction: column; }
.wl-panel-hdr { padding: 14px 18px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between; }
.wl-panel-tit { font-size: 13.5px; font-weight: 700; color: #0F172A; }
.wl-panel-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

/* Form components */
.wl-form-sec { display: flex; flex-direction: column; gap: 12px; }
.wl-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.wl-form-group { display: flex; flex-direction: column; gap: 6px; }
.wl-form-group.full { grid-column: span 2; }
.wl-lbl { font-size: 11.5px; font-weight: 700; color: #475569; }
.wl-lbl span { color: #EF4444; }
.wl-inp { padding: 9px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #1E293B; transition: border-color 0.15s; font-family: inherit; }
.wl-inp:focus { border-color: #6366F1; }
.wl-inp::placeholder { color: #94A3B8; }
.wl-select { cursor: pointer; }

/* Logo upload items */
.logo-upload-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 8px; background: #FAFBFD; }
.logo-preview-box { width: 100px; height: 32px; border-radius: 6px; border: 1px solid #E2E8F0; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 4px; }
.logo-preview-box img { max-width: 100%; max-height: 100%; object-fit: contain; }

/* Color pickers */
.color-picker-row { display: flex; align-items: center; gap: 10px; }
.color-picker-box { width: 28px; height: 28px; border-radius: 6px; border: 1.5px solid #E2E8F0; cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.color-picker-box input { opacity: 0; width: 100%; height: 100%; cursor: pointer; }

/* Preview Right Panels */
.prev-tabs { display: flex; gap: 12px; border-bottom: 1.5px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 12px; }
.prev-tab { font-size: 11.5px; font-weight: 700; color: #64748B; cursor: pointer; border: none; background: none; padding-bottom: 4px; border-bottom: 2px solid transparent; }
.prev-tab.act { color: #6366F1; border-color: #6366F1; }

/* Mocks Previews */
.mock-dashboard { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px; background: #F8FAFC; transform: scale(0.98); transform-origin: top center; }
.mock-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.mock-kpi { background: #fff; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px; display: flex; flex-direction: column; gap: 2px; }
.mock-kpi-lbl { font-size: 8px; color: #64748B; font-weight: 600; }
.mock-kpi-val { font-size: 12px; font-weight: 800; color: #0F172A; }
.mock-kpi-sub { font-size: 8px; color: #10B981; font-weight: 600; }

.mock-app-screen { width: 100%; height: 260px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; padding: 24px; text-align: center; position: relative; overflow: hidden; }
.mock-app-inp { width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.15); font-size: 11px; margin-top: 14px; text-align: center; color: #fff; outline: none; }
.mock-app-inp::placeholder { color: rgba(255,255,255,0.7); }

/* Switch switches */
.wl-switch-wrap { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F1F5F9; }
.wl-switch-wrap:last-child { border-bottom: none; }
.wl-switch-lbl { font-size: 12px; font-weight: 700; color: #334155; }
.switch-slider { width: 32px; height: 18px; background: #CBD5E1; border-radius: 20px; position: relative; cursor: pointer; transition: background 0.15s; }
.switch-slider::after { content: ''; position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #fff; top: 2px; left: 2px; transition: transform 0.15s; }
.switch-inp { display: none; }
.switch-inp:checked + .switch-slider { background: #10B981; }
.switch-inp:checked + .switch-slider::after { transform: translateX(14px); }

/* Email preview */
.mock-email { border: 1.5px solid #E2E8F0; border-radius: 10px; background: #fff; display: flex; flex-direction: column; overflow: hidden; font-size: 11px; }
.mock-email-hdr { padding: 12px; text-align: center; color: #fff; font-weight: bold; }
.mock-email-body { padding: 20px; color: #334155; line-height: 1.5; }

/* Domain cards */
.domain-card { border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; background: #F8FAFC; display: flex; align-items: center; justify-content: space-between; }
.domain-subcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 4px; flex: 1; text-align: center; }

/* Browser Mockup */
.browser-mock { border: 2px solid #E2E8F0; border-radius: 10px; overflow: hidden; background: #fff; }
.browser-bar { background: #FAFBFD; border-bottom: 1.5px solid #E2E8F0; padding: 6px 12px; display: flex; align-items: center; gap: 8px; }
.browser-dot { width: 8px; height: 8px; border-radius: 50%; background: #CBD5E1; }
.browser-url { background: #fff; border: 1px solid #E2E8F0; border-radius: 6px; padding: 3px 10px; font-size: 10.5px; color: #64748B; flex: 1; text-align: center; font-family: monospace; }
.browser-screen { height: 260px; background: #F3F4F9; display: flex; align-items: center; justify-content: center; padding: 20px; }

/* Invoice Preview Layout */
.invoice-paper { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 20px; font-size: 10.5px; color: #334155; line-height: 1.4; }
.invoice-hdr { display: flex; justify-content: space-between; border-bottom: 1.5px solid #E2E8F0; padding-bottom: 10px; margin-bottom: 12px; }
.invoice-tit { font-size: 15px; font-weight: 800; color: #0F172A; }
.invoice-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.invoice-table th { background: #F8FAFC; border-bottom: 1.5px solid #E2E8F0; padding: 6px 8px; font-size: 9px; text-transform: uppercase; text-align: left; }
.invoice-table td { padding: 8px; border-bottom: 1px solid #F1F5F9; }
.invoice-sum { display: flex; justify-content: flex-end; margin-top: 12px; }
.invoice-sum-table { width: 180px; }
.invoice-sum-table td { padding: 4px 0; }

/* Badge tags */
.wl-tag { display: inline-flex; align-items: center; gap: 4px; background: #F1F5F9; color: #475569; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.wl-tag-del { border: none; background: none; color: #EF4444; cursor: pointer; font-size: 12px; padding: 0; }

.badge-pill { font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: 800; text-transform: uppercase; }
.badge-active { background: #ECFDF5; color: #10B981; }
.badge-expired { background: #FEE2E2; color: #EF4444; }

/* App Sliders Manager Styles */
.slider-mgmt-wrap { display: flex; flex-direction: column; gap: 16px; }
.slider-screen-pills { display: flex; gap: 6px; background: #F1F5F9; padding: 4px; border-radius: 10px; width: fit-content; }
.slider-screen-btn { padding: 7px 16px; border-radius: 8px; border: none; font-size: 12.5px; font-weight: 700; cursor: pointer; color: #64748B; background: transparent; transition: all 0.15s; }
.slider-screen-btn.act { background: #fff; color: #1E293B; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.slider-card-box { border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 18px; background: #FAFBFD; display: flex; flex-direction: column; gap: 14px; position: relative; transition: all 0.15s; }
.slider-card-box.active-card { border-color: #6366F1; background: #FFFFFF; box-shadow: 0 4px 12px rgba(99,102,241,0.08); }
.slider-card-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; }
.slider-num-badge { width: 24px; height: 24px; border-radius: 12px; background: #1E293B; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; }
.slider-asset-drop { border: 1.5px dashed #CBD5E1; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 12px; background: #F8FAFC; cursor: pointer; transition: all 0.15s; }
.slider-asset-drop:hover { border-color: #6366F1; background: #F1F5F9; }
.slider-asset-thumb { width: 68px; height: 46px; border-radius: 6px; border: 1px solid #CBD5E1; object-fit: cover; background: #fff; }
.phone-mock-frame { width: 310px; height: 570px; border: 10px solid #0F172A; border-radius: 40px; background: #000; box-shadow: 0 16px 36px rgba(0,0,0,0.22); position: relative; overflow: hidden; display: flex; flex-direction: column; margin: 0 auto; }
.phone-mock-notch { width: 100px; height: 18px; background: #0F172A; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; position: absolute; top: 0; left: 50%; transform: translateX(-50%); z-index: 30; }
.phone-mock-screen { flex: 1; background: #F4F6FB; position: relative; display: flex; flex-direction: column; overflow: hidden; }
.phone-hero-slider { height: 250px; width: 100%; position: relative; overflow: hidden; background: #F8FAFC; }
.phone-slide-bg { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; }
.phone-slide-grad { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.72) 55%, transparent 100%); }
.phone-slide-copy { position: absolute; left: 14px; bottom: 18px; z-index: 10; max-width: 60%; }
.phone-tag-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 6px; background: rgba(30,27,75,0.08); border: 1px solid rgba(30,27,75,0.18); font-size: 8px; font-weight: 900; color: #1E1B4B; letter-spacing: 0.5px; margin-bottom: 4px; }
.phone-slide-h1 { font-size: 14.5px; font-weight: 900; color: #0F172A; line-height: 1.22; margin: 0 0 3px 0; letter-spacing: -0.3px; }
.phone-slide-p { font-size: 9px; font-weight: 700; color: #475569; margin: 0 0 8px 0; line-height: 1.3; }
.phone-slide-cta { display: inline-block; padding: 5px 12px; border-radius: 12px; background: #1E1B4B; color: #fff; font-size: 9px; font-weight: 800; border: none; }
.phone-slide-front { position: absolute; right: 4px; bottom: 8px; height: 175px; max-width: 145px; object-fit: contain; z-index: 8; }
.phone-dots { position: absolute; right: 12px; bottom: 8px; z-index: 15; display: flex; gap: 4px; align-items: center; }
.phone-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(15,23,42,0.22); }
.phone-dot.act { width: 14px; border-radius: 4px; background: #1E1B4B; }
`;

function normalizeImageUrl(url?: string): string {
  if (!url) return '';
  const s = String(url).trim();
  if (!s) return '';
  if (s.startsWith('/uploads/')) return `/api${s}`;
  if (s.includes('evegah.cloud/uploads/')) return s.replace('evegah.cloud/uploads/', 'evegah.cloud/api/uploads/');
  return s;
}

const compressImageForUpload = (file: File, isCutout: boolean): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (re) => {
      const rawDataUrl = (re.target?.result as string) || '';
      if (!rawDataUrl) return resolve('');
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = isCutout ? 900 : 1440;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(rawDataUrl);

          ctx.drawImage(img, 0, 0, width, height);

          // For cutout, preserve PNG alpha; for banner background, encode as JPEG 0.85
          const mime = isCutout ? 'image/png' : 'image/jpeg';
          const quality = isCutout ? 0.9 : 0.85;
          const compressed = canvas.toDataURL(mime, quality);
          resolve(compressed);
        } catch (_) {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export default function WhiteLabelManagement() {
  const [activeTab, setActiveTab] = useState('brand');
  
  // Brand Identity states
  const [companyName, setCompanyName] = useState('E-Vegah Mobility Private Limited');
  const [platformName, setPlatformName] = useState('Evegah');
  const [tagline, setTagline] = useState('Smart. Green. Reliable.');
  const [supportEmail, setSupportEmail] = useState('support@evegah.com');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  
  const [primaryColor, setPrimaryColor] = useState('#6C38FF');
  const [secondaryColor, setSecondaryColor] = useState('#00B67A');
  const [accentColor, setAccentColor] = useState('#FF8A00');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [buttonStyle, setButtonStyle] = useState('rounded');
  const [copyrightText, setCopyrightText] = useState('© 2024 Evegah. All rights reserved.');
  const [footerDesc, setFooterDesc] = useState('Evegah provides sustainable battery swapping solutions to power a cleaner and greener future.');
  const [quickLinks, setQuickLinks] = useState([
    { label: 'Privacy Policy', url: '#' },
    { label: 'Terms & Conditions', url: '#' },
    { label: 'Refund Policy', url: '#' }
  ]);
  const [newLinkLabel, setNewLinkLabel] = useState('');

  // Domain & App states
  const [primaryDomain, setPrimaryDomain] = useState('dashboard.evegah.com');
  const [appName, setAppName] = useState('Evegah Rider');
  const [packageName, setPackageName] = useState('io.ionic.evegah');
  const [appVersion, setAppVersion] = useState('2.4.1');
  const [activeAppTab, setActiveAppTab] = useState('android');

  // Invoice & Docs states
  const [invoiceTitle, setInvoiceTitle] = useState('Tax Invoice');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [invoiceFooter, setInvoiceFooter] = useState('Thank you for choosing Evegah. Smart. Green. Reliable.');
  const [gstNo, setGstNo] = useState('07ABCDE1234F1Z5');
  const [panNo, setPanNo] = useState('ABCDE1234F');
  const [invoiceAddress, setInvoiceAddress] = useState('Shop No. 12, Gotri Road, Vadodara - 390021, Gujarat, India');
  const [activeInvoiceTab, setActiveInvoiceTab] = useState('invoice');

  // Preview tab state
  const [brandPreviewTab, setBrandPreviewTab] = useState('dashboard');

  // SMTP Settings
  const [smtpServer, setSmtpServer] = useState('smtp.evegah.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('smtp@evegah.com');

  // Custom code inputs
  const [customCSS, setCustomCSS] = useState('');
  const [customJS, setCustomJS] = useState('');

  // App Sliders state (Home & Rent dynamic banners)
  const [sliderScreen, setSliderScreen] = useState<'rent' | 'home'>('rent');
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number>(0);
  const [homeSliders, setHomeSliders] = useState<any[]>([
    {
      id: 'slide_home_1',
      tag: 'Slider 1',
      title: 'Ride Smarter, Go Farther',
      subtitle: 'High-performance electric vehicles designed for delivery and daily city commute.',
      cta: 'Rent EV Now',
      bg: '',
      front: '',
      active: true
    },
    {
      id: 'slide_home_2',
      tag: 'Slider 2',
      title: 'Swap & Go in 60s',
      subtitle: 'Never wait for charging. Fast automated battery swapping stations across Vadodara.',
      cta: 'Find Station',
      bg: '',
      front: '',
      active: true
    },
    {
      id: 'slide_home_3',
      tag: 'Slider 3',
      title: 'Zero Emission Mobility',
      subtitle: 'Reduce carbon footprint with certified green energy battery swaps.',
      cta: 'Explore Fleet',
      bg: '',
      front: '',
      active: true
    }
  ]);
  const [rentSliders, setRentSliders] = useState<any[]>([
    {
      id: 'slide_rent_1',
      tag: 'Slider 1',
      title: 'Rent at L&T Knowledge City',
      subtitle: 'Instant unlock at Main Gate hub. Smooth ride to office.',
      cta: 'Book This Zone',
      bg: '',
      front: '',
      active: true
    },
    {
      id: 'slide_rent_2',
      tag: 'Slider 2',
      title: 'Parul University Campus Fleet',
      subtitle: 'Zero deposit student & staff plans. Swap batteries inside campus.',
      cta: 'Select Campus Zone',
      bg: '',
      front: '',
      active: true
    },
    {
      id: 'slide_rent_3',
      tag: 'Slider 3',
      title: 'Zepto Dark Store Hub',
      subtitle: 'High payload commercial EVs. Unlimited battery swaps.',
      cta: 'Start Earning',
      bg: '',
      front: '',
      active: true
    }
  ]);
  const [isSavingSliders, setIsSavingSliders] = useState<boolean>(false);
  const [sliderSaveMsg, setSliderSaveMsg] = useState<string>('');
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch('/api/settings/app_slider');
        if (res.ok) {
          const json = await res.json();
          if (json && (json.success || json.status === 'success') && json.data) {
            const val = json.data.value || json.data;
            if (Array.isArray(val.home_sliders) && val.home_sliders.length > 0) {
              setHomeSliders(val.home_sliders.map((s: any) => ({
                ...s,
                bg: normalizeImageUrl(s.bg),
                front: normalizeImageUrl(s.front),
              })));
            }
            if (Array.isArray(val.rent_sliders) && val.rent_sliders.length > 0) {
              setRentSliders(val.rent_sliders.map((s: any) => ({
                ...s,
                bg: normalizeImageUrl(s.bg),
                front: normalizeImageUrl(s.front),
              })));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load sliders from settings:', err);
      }
    };
    fetchSliders();
  }, []);

  const currentSliderList = sliderScreen === 'home' ? homeSliders : rentSliders;
  const setCurrentSliderList = (updater: any) => {
    if (sliderScreen === 'home') {
      setHomeSliders(updater);
    } else {
      setRentSliders(updater);
    }
  };

  const handleUpdateSlide = (idx: number, field: string, val: any) => {
    setCurrentSliderList((prev: any[]) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleAddSlide = () => {
    const nextIdx = currentSliderList.length + 1;
    const newSlide = {
      id: `slide_${sliderScreen}_${Date.now()}`,
      tag: `Slider ${nextIdx}`,
      title: `Special EV Campaign ${nextIdx}`,
      subtitle: 'High-performance electric mobility with seamless battery swap access.',
      cta: 'Explore Details',
      bg: '',
      front: '',
      active: true
    };
    setCurrentSliderList((prev: any[]) => [...prev, newSlide]);
    setSelectedSlideIdx(currentSliderList.length);
  };

  const handleDeleteSlide = (idx: number) => {
    if (currentSliderList.length <= 1) {
      alert('You must keep at least 1 slide in the carousel.');
      return;
    }
    setCurrentSliderList((prev: any[]) => prev.filter((_, i) => i !== idx));
    if (selectedSlideIdx >= idx && selectedSlideIdx > 0) {
      setSelectedSlideIdx(selectedSlideIdx - 1);
    }
  };

  const handleUploadSliderFile = async (slideIdx: number, field: 'bg' | 'front', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(`${slideIdx}-${field}`);
    try {
      const isCutout = field === 'front';
      const compressedDataUrl = await compressImageForUpload(file, isCutout);
      if (!compressedDataUrl) throw new Error('Could not read image file');

      const res = await fetch('/api/settings/upload-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: compressedDataUrl,
          dataUrl: compressedDataUrl,
          name: file.name,
          filename: file.name
        })
      });
      const resJson = await res.json();
      if ((resJson.success || resJson.status === 'success') && resJson.url) {
        const cleanUrl = normalizeImageUrl(resJson.url);
        handleUpdateSlide(slideIdx, field, cleanUrl);
      } else {
        alert('Asset upload failed: ' + (resJson.message || resJson.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveSliders = async () => {
    setIsSavingSliders(true);
    setSliderSaveMsg('');
    try {
      const res = await fetch('/api/settings/app_slider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: {
            home_sliders: homeSliders,
            rent_sliders: rentSliders
          }
        })
      });
      const data = await res.json();
      if (data.success || data.status === 'success') {
        setSliderSaveMsg('App sliders successfully saved & published to mobile app!');
        setTimeout(() => setSliderSaveMsg(''), 5000);
      } else {
        alert('Failed to save sliders: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error saving sliders: ' + err.message);
    } finally {
      setIsSavingSliders(false);
    }
  };


  const addQuickLink = () => {
    if (!newLinkLabel) return;
    setQuickLinks([...quickLinks, { label: newLinkLabel, url: '#' }]);
    setNewLinkLabel('');
  };

  const removeQuickLink = (idx: number) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== idx));
  };

  // PDF report and rider receipt generator function
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isReceipt = activeInvoiceTab === 'receipt';

    const htmlContent = `
      <html>
        <head>
          <title>${isReceipt ? 'Rider Receipt' : invoiceTitle} - ${companyName}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #334155; line-height: 1.5; }
            .inv-card { max-width: 800px; margin: 0 auto; border: 1px solid #E2E8F0; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .inv-header { display: flex; justify-content: space-between; border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; }
            .inv-title { font-size: 26px; font-weight: 800; color: #0F172A; }
            .company-info { font-size: 11.5px; line-height: 1.5; text-align: right; }
            .bill-to { margin-top: 30px; display: flex; justify-content: space-between; font-size: 13px; }
            .inv-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .inv-table th { background: #F8FAFC; border-bottom: 2px solid #E2E8F0; padding: 12px 10px; font-size: 11px; text-transform: uppercase; text-align: left; color: #64748B; }
            .inv-table td { border-bottom: 1px solid #F1F5F9; padding: 12px 10px; font-size: 12.5px; }
            .inv-summary { display: flex; justify-content: flex-end; margin-top: 30px; }
            .inv-summary-table { width: 260px; font-size: 13px; }
            .inv-summary-table td { padding: 6px 0; }
            .footer-banner { margin-top: 60px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 20px; }
            .sign-block { margin-top: 40px; display: flex; flex-direction: column; align-items: flex-end; }
            .sign-line { width: 180px; border-top: 1px solid #64748B; margin-top: 40px; }
            @media print {
              body { padding: 0; }
              .inv-card { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="inv-card">
            <div class="inv-header">
              <div>
                <div class="inv-title">${isReceipt ? 'Rider Swap Receipt' : invoiceTitle}</div>
                <div style="font-size: 13px; margin-top: 6px; font-weight: bold; color: ${primaryColor};">
                  ${isReceipt ? 'RCPT' : invoicePrefix}-2024-000123
                </div>
              </div>
              <div class="company-info">
                <strong>${companyName}</strong><br/>
                ${invoiceAddress}<br/>
                GSTIN: ${gstNo} | PAN: ${panNo}
              </div>
            </div>

            <div class="bill-to">
              <div>
                <strong style="color: #64748B; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 4px;">Bill To:</strong>
                <strong>Rahul Sharma</strong><br/>
                Gotri Road, Vadodara - 390021<br/>
                Mobile: +91 98765 43210
              </div>
              <div style="text-align: right;">
                <strong>Date of Issue:</strong> 20 Jun 2024<br/>
                ${isReceipt ? '' : '<strong>Due Date:</strong> 30 Jun 2024<br/>'}
                <strong>Place of Supply:</strong> Supply Zone (07)
              </div>
            </div>

            <table class="inv-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>HSN/SAC</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Rate (₹)</th>
                  <th style="text-align: right;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${isReceipt ? `
                  <tr>
                    <td>Battery Swap Service Fee (60V 45Ah Pack)</td>
                    <td>9987</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">250.00</td>
                    <td style="text-align: right;">250.00</td>
                  </tr>
                  <tr>
                    <td>Rider Wallet Top-up Accent</td>
                    <td>9987</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">1,000.00</td>
                    <td style="text-align: right;">1,000.00</td>
                  </tr>
                ` : `
                  <tr>
                    <td>EV Battery Pack 60V 45Ah</td>
                    <td>8507</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">25,000.00</td>
                    <td style="text-align: right;">25,000.00</td>
                  </tr>
                  <tr>
                    <td>Battery Charger 60V 10A</td>
                    <td>8504</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">2,500.00</td>
                    <td style="text-align: right;">2,500.00</td>
                  </tr>
                  <tr>
                    <td>Installation & Services</td>
                    <td>9987</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">1,000.00</td>
                    <td style="text-align: right;">1,000.00</td>
                  </tr>
                `}
              </tbody>
            </table>

            <div class="inv-summary">
              <table class="inv-summary-table">
                <tr>
                  <td>Sub Total:</td>
                  <td style="text-align: right; font-weight: bold;">₹${isReceipt ? '1,250.00' : '28,500.00'}</td>
                </tr>
                <tr>
                  <td>CGST (9%):</td>
                  <td style="text-align: right;">₹${isReceipt ? '112.50' : '2,565.00'}</td>
                </tr>
                <tr>
                  <td>SGST (9%):</td>
                  <td style="text-align: right;">₹${isReceipt ? '112.50' : '2,565.00'}</td>
                </tr>
                <tr style="border-top: 1.5px solid #000; font-weight: bold; font-size: 15px;">
                  <td style="padding-top: 10px;">Total Amount:</td>
                  <td style="text-align: right; padding-top: 10px; color: ${primaryColor};">₹${isReceipt ? '1,475.00' : '33,630.00'}</td>
                </tr>
              </table>
            </div>

            <div class="sign-block">
              <div style="font-family: 'Georgia', serif; font-size: 16px; font-style: italic;">Akash Verma</div>
              <div class="sign-line"></div>
              <span style="font-size: 11px; color: #64748B; font-weight: bold; margin-top: 6px;">Authorized Signatory</span>
            </div>

            <div class="footer-banner">
              ${invoiceFooter}
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleSave = () => {
    if (activeTab === 'mobile') {
      handleSaveSliders();
    } else {
      alert('White-label portal configuration details successfully saved and deployed!');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ev-shell">
        <Sidebar activePath="/settings/white-label" />
        <div className="ev-main">
          
          <TopBar 
            title="White Label Management" 
            subtitle="Customize your brand identity across platform, mobile apps, invoices and communications." 
          />

          <div className="ev-body">
            
            {/* Breadcrumb */}
            <div className="fr-bc">
              <a href="/">Home</a>
              <span className="fr-bc-sep">&gt;</span>
              <a href="/settings">Settings</a>
              <span className="fr-bc-sep">&gt;</span>
              <span className="fr-bc-cur">White Label</span>
            </div>

            {/* Stepper / Tab headers */}
            <div className="wl-tabs">
              {[
                { key: 'brand', label: 'Brand Identity' },
                { key: 'domain', label: 'Domain & App' },
                { key: 'sliders', label: 'App Sliders' },
                { key: 'email', label: 'Email & Notifications' },
                { key: 'invoice', label: 'Invoice & Docs' },
                { key: 'advanced', label: 'Advanced' }
              ].map(t => (
                <button 
                  key={t.key} 
                  className={`wl-tab ${activeTab === t.key ? 'act' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Title section with Save action */}
            <div className="wl-hdr" style={{ marginTop: '4px' }}>
              <div>
                <h2 className="wl-title-h1">White Label Settings</h2>
                <p className="wl-title-sub">Configure platform logos, SMTP receipts and client portals settings.</p>
              </div>
              <div className="wl-hdr-actions">
                <button className="wl-btn" onClick={() => alert('Opening live site preview...')}>Preview Live Site ↗</button>
                <button className="wl-btn wl-btn-primary" onClick={handleSave}>Save & Publish</button>
              </div>
            </div>

            {/* Render active tab content */}
            {activeTab === 'brand' && (
              <div className="wl-layout">
                {/* Left Forms column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Brand info */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Brand Information</span>
                    </div>
                    <div className="wl-panel-body">
                      <div className="wl-form-group">
                        <label className="wl-lbl">Company Name <span>*</span></label>
                        <input type="text" className="wl-inp" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                      </div>
                      <div className="wl-form-row">
                        <div className="wl-form-group">
                          <label className="wl-lbl">Platform Name <span>*</span></label>
                          <input type="text" className="wl-inp" value={platformName} onChange={e => setPlatformName(e.target.value)} />
                        </div>
                        <div className="wl-form-group">
                          <label className="wl-lbl">Tagline</label>
                          <input type="text" className="wl-inp" value={tagline} onChange={e => setTagline(e.target.value)} />
                        </div>
                      </div>
                      <div className="wl-form-row">
                        <div className="wl-form-group">
                          <label className="wl-lbl">Support Email <span>*</span></label>
                          <input type="email" className="wl-inp" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
                        </div>
                        <div className="wl-form-group">
                          <label className="wl-lbl">Support Phone <span>*</span></label>
                          <input type="text" className="wl-inp" value={supportPhone} onChange={e => setSupportPhone(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo Icon Management */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Logo & Icon Management</span>
                    </div>
                    <div className="wl-panel-body" style={{ gap: '10px' }}>
                      {[
                        { label: 'Light Logo', desc: 'Used on light backgrounds (min 200x50px)' },
                        { label: 'Dark Logo', desc: 'Used on dark backgrounds (min 200x50px)' },
                        { label: 'Favicon (32x32)', desc: 'Used in browser tabs (ICO/PNG format)' },
                        { label: 'Mobile Splash Logo', desc: 'Used on app loading screens (PNG/SVG format)' }
                      ].map(logo => (
                        <div className="logo-upload-row" key={logo.label}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>{logo.label}</span>
                            <span style={{ fontSize: '10px', color: '#64748B' }}>{logo.desc}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="logo-preview-box" style={{ background: logo.label === 'Dark Logo' ? '#1E293B' : '#fff' }}>
                              <span style={{ fontSize: '9px', fontWeight: 'bold', color: logo.label === 'Dark Logo' ? '#fff' : primaryColor }}>{platformName}</span>
                            </div>
                            <button className="wl-btn" style={{ padding: '6px 12px', fontSize: '11px' }}>Upload</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Theme Customization */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Theme Customization</span>
                    </div>
                    <div className="wl-panel-body">
                      <div className="wl-form-row">
                        <div className="wl-form-group">
                          <label className="wl-lbl">Primary Color</label>
                          <div className="color-picker-row">
                            <span className="color-picker-box" style={{ background: primaryColor }}>
                              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                            </span>
                            <input type="text" className="wl-inp" style={{ flex: 1 }} value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                          </div>
                        </div>
                        <div className="wl-form-group">
                          <label className="wl-lbl">Secondary Color</label>
                          <div className="color-picker-row">
                            <span className="color-picker-box" style={{ background: secondaryColor }}>
                              <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} />
                            </span>
                            <input type="text" className="wl-inp" style={{ flex: 1 }} value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <div className="wl-form-row">
                        <div className="wl-form-group">
                          <label className="wl-lbl">Accent Color</label>
                          <div className="color-picker-row">
                            <span className="color-picker-box" style={{ background: accentColor }}>
                              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
                            </span>
                            <input type="text" className="wl-inp" style={{ flex: 1 }} value={accentColor} onChange={e => setAccentColor(e.target.value)} />
                          </div>
                        </div>
                        <div className="wl-form-group">
                          <label className="wl-lbl">Font Family</label>
                          <select className="wl-inp wl-select" value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                            <option>Inter</option>
                            <option>Roboto</option>
                            <option>Outfit</option>
                          </select>
                        </div>
                      </div>

                      <div className="wl-form-row">
                        <div className="wl-form-group">
                          <label className="wl-lbl">Button Style</label>
                          <div style={{ display: 'flex', gap: '14px', padding: '6px 0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                              <input type="radio" checked={buttonStyle === 'rounded'} onChange={() => setButtonStyle('rounded')} />
                              Rounded
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                              <input type="radio" checked={buttonStyle === 'square'} onChange={() => setButtonStyle('square')} />
                              Square
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social and Contact links */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Social & Contact Links</span>
                    </div>
                    <div className="wl-panel-body">
                      {[
                        { label: 'Website', placeholder: 'https://www.evegah.com' },
                        { label: 'Facebook', placeholder: 'https://facebook.com/evegah' },
                        { label: 'Instagram', placeholder: 'https://instagram.com/evegah' },
                        { label: 'LinkedIn', placeholder: 'https://linkedin.com/company/evegah' }
                      ].map(link => (
                        <div className="wl-form-group" key={link.label}>
                          <label className="wl-lbl">{link.label}</label>
                          <input type="text" className="wl-inp" placeholder={link.placeholder} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer configuration */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Footer Configuration</span>
                    </div>
                    <div className="wl-panel-body">
                      <div className="wl-form-group">
                        <label className="wl-lbl">Copyright Text</label>
                        <input type="text" className="wl-inp" value={copyrightText} onChange={e => setCopyrightText(e.target.value)} />
                      </div>
                      <div className="wl-form-group">
                        <label className="wl-lbl">Footer Description</label>
                        <textarea className="wl-inp" style={{ height: '60px', resize: 'none' }} value={footerDesc} onChange={e => setFooterDesc(e.target.value)} />
                      </div>
                      <div className="wl-form-group">
                        <label className="wl-lbl">Quick Links</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                          {quickLinks.map((link, idx) => (
                            <span key={idx} className="wl-tag">
                              {link.label}
                              <button className="wl-tag-del" onClick={() => removeQuickLink(idx)}>×</button>
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            className="wl-inp" 
                            placeholder="Add new link label" 
                            style={{ flex: 1 }} 
                            value={newLinkLabel} 
                            onChange={e => setNewLinkLabel(e.target.value)} 
                          />
                          <button className="wl-btn wl-btn-primary" onClick={addQuickLink}>+ Add</button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Preview column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Live preview */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Live Brand Preview</span>
                    </div>
                    <div className="wl-panel-body">
                      <div className="prev-tabs">
                        <button className={`prev-tab ${brandPreviewTab === 'dashboard' ? 'act' : ''}`} onClick={() => setBrandPreviewTab('dashboard')}>Dashboard</button>
                        <button className={`prev-tab ${brandPreviewTab === 'rider' ? 'act' : ''}`} onClick={() => setBrandPreviewTab('rider')}>Rider App</button>
                      </div>

                      {brandPreviewTab === 'dashboard' ? (
                        <div className="mock-dashboard">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                            <span style={{ color: primaryColor, fontSize: '12px' }}>{platformName}</span>
                            <span>Akash Verma</span>
                          </div>
                          <div className="mock-kpis">
                            <div className="mock-kpi">
                              <span className="mock-kpi-lbl">Revenue MTD</span>
                              <span className="mock-kpi-val">₹28,75,450</span>
                              <span className="mock-kpi-sub">↑ 16.2%</span>
                            </div>
                            <div className="mock-kpi">
                              <span className="mock-kpi-lbl">Franchises</span>
                              <span className="mock-kpi-val">42</span>
                              <span className="mock-kpi-sub">↑ 10.2%</span>
                            </div>
                            <div className="mock-kpi">
                              <span className="mock-kpi-lbl">Total Rides</span>
                              <span className="mock-kpi-val">1,842</span>
                              <span className="mock-kpi-sub">↑ 12.5%</span>
                            </div>
                          </div>
                          <button style={{ width: '100%', padding: '6px', background: primaryColor, color: '#fff', border: 'none', borderRadius: buttonStyle === 'rounded' ? '20px' : '4px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Primary Button
                          </button>
                        </div>
                      ) : (
                        <div className="mock-app-screen" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #1e1b4b 100%)` }}>
                          <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>{platformName}</div>
                          <div style={{ fontSize: '9px', opacity: 0.8 }}>{tagline}</div>
                          <input type="text" className="mock-app-inp" placeholder="Enter Mobile Number" disabled />
                          <button style={{ width: '100%', padding: '8px', background: secondaryColor, color: '#fff', border: 'none', borderRadius: buttonStyle === 'rounded' ? '20px' : '4px', fontSize: '10px', fontWeight: 'bold', marginTop: '10px' }}>
                            Get OTP
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Brand Color Preview */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Brand Color Preview</span>
                    </div>
                    <div className="wl-panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 'bold' }}>Primary</span>
                        <div style={{ height: '34px', background: primaryColor, borderRadius: '6px' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 'bold' }}>Secondary</span>
                        <div style={{ height: '34px', background: secondaryColor, borderRadius: '6px' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 'bold' }}>Accent</span>
                        <div style={{ height: '34px', background: accentColor, borderRadius: '6px' }} />
                      </div>
                    </div>
                  </div>

                  {/* Typography Preview */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Typography Preview</span>
                    </div>
                    <div className="wl-panel-body" style={{ fontFamily: fontFamily }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <strong style={{ fontSize: '24px' }}>Aa</strong>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{fontFamily}</span>
                          <span style={{ fontSize: '10px', color: '#64748B' }}>The quick brown fox jumps over the lazy dog.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Button Preview */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Button Preview</span>
                    </div>
                    <div className="wl-panel-body" style={{ display: 'flex', gap: '12px' }}>
                      <button style={{ flex: 1, padding: '9px', background: primaryColor, color: '#fff', border: 'none', borderRadius: buttonStyle === 'rounded' ? '20px' : '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        Primary Button
                      </button>
                      <button style={{ flex: 1, padding: '9.5px', background: '#fff', border: `1.5px solid ${secondaryColor}`, color: secondaryColor, borderRadius: buttonStyle === 'rounded' ? '20px' : '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        Secondary Button
                      </button>
                    </div>
                  </div>

                  {/* Modules visibility */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Platform Modules Visibility</span>
                    </div>
                    <div className="wl-panel-body" style={{ padding: '10px 16px' }}>
                      {[
                        { label: 'Battery Swapping', checked: true },
                        { label: 'Vehicle Rental', checked: true },
                        { label: 'Rider App Portal', checked: true },
                        { label: 'Franchise Management', checked: true },
                        { label: 'System Analytics & Reports', checked: true },
                        { label: 'Announcements Module', checked: true }
                      ].map(mod => (
                        <div className="wl-switch-wrap" key={mod.label}>
                          <span className="wl-switch-lbl">{mod.label}</span>
                          <label style={{ display: 'flex' }}>
                            <input type="checkbox" className="switch-inp" defaultChecked={mod.checked} />
                            <span className="switch-slider" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email branding preview */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Email Branding Preview</span>
                    </div>
                    <div className="wl-panel-body">
                      <div className="mock-email">
                        <div className="mock-email-hdr" style={{ background: primaryColor }}>
                          {platformName}
                        </div>
                        <div className="mock-email-body">
                          <strong>Hi [User Name],</strong><br/>
                          <p style={{ margin: '8px 0 14px' }}>This is a system generated transactional email from the platform.</p>
                          <span>Thank you,<br/><strong>{platformName} Team</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'domain' && (
              <div className="wl-layout">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Domain Configuration */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Domain Management</span>
                      <button className="wl-btn wl-btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => alert('Initializing DNS management...')}>Manage DNS</button>
                    </div>
                    <div className="wl-panel-body">
                      <div className="wl-form-group">
                        <label className="wl-lbl">Primary Portal URL</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" className="wl-inp" style={{ flex: 1 }} value={primaryDomain} onChange={e => setPrimaryDomain(e.target.value)} />
                          <span className="badge-pill badge-active" style={{ display: 'inline-flex', alignItems: 'center', height: '34px' }}>Verified</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <div className="domain-subcard">
                          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 'bold' }}>DNS Setup</span>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: '#10B981', display: 'block', marginTop: '4px' }}>Verified</span>
                        </div>
                        <div className="domain-subcard">
                          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 'bold' }}>SSL Certificate</span>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: '#3B82F6', display: 'block', marginTop: '4px' }}>Active</span>
                        </div>
                        <div className="domain-subcard">
                          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 'bold' }}>SSL Expiry</span>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#8B5CF6', display: 'block', marginTop: '6px' }}>15 May 2025 (89d)</span>
                        </div>
                        <div className="domain-subcard">
                          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 'bold' }}>HTTPS Redirect</span>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: '#10B981', display: 'block', marginTop: '4px' }}>Enabled</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subdomain Configurations */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Subdomain Configuration (Optional)</span>
                      <button className="wl-btn" style={{ padding: '6px 12px', fontSize: '11.5px', color: '#6366F1', borderColor: '#6366F1' }} onClick={() => alert('New subdomain popup')}>+ Add Sub Domain</button>
                    </div>
                    <div className="wl-panel-body" style={{ padding: 0 }}>
                      <table className="sub-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#F8FAFC' }}>
                            <th style={{ fontSize: '10px', padding: '10px 16px', textTransform: 'uppercase', textAlign: 'left', color: '#94A3B8' }}>Sub Domain</th>
                            <th style={{ fontSize: '10px', padding: '10px', textTransform: 'uppercase', textAlign: 'left', color: '#94A3B8' }}>Module</th>
                            <th style={{ fontSize: '10px', padding: '10px', textTransform: 'uppercase', textAlign: 'left', color: '#94A3B8' }}>Status</th>
                            <th style={{ fontSize: '10px', padding: '10px', textTransform: 'uppercase', textAlign: 'right', color: '#94A3B8', paddingRight: '16px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { sd: 'rider.evegah.com', mod: 'Rider App', st: 'Active' },
                            { sd: 'franchise.evegah.com', mod: 'Franchise Portal', st: 'Active' },
                            { sd: 'api.evegah.com', mod: 'API Services', st: 'Active' },
                            { sd: 'docs.evegah.com', mod: 'Documentation', st: 'Inactive' }
                          ].map(row => (
                            <tr key={row.sd}>
                              <td style={{ padding: '12px 16px', fontSize: '12.5px', fontWeight: 'bold' }}>{row.sd}</td>
                              <td style={{ padding: '12px 10px', fontSize: '12.5px', color: '#475569' }}>{row.mod}</td>
                              <td style={{ padding: '12px 10px' }}>
                                <span className={`badge-pill ${row.st === 'Active' ? 'badge-active' : 'badge-expired'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>{row.st}</span>
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', marginRight: '8px' }}>✏</button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>🗑</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile App Configuration */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Mobile App Configuration</span>
                    </div>
                    <div className="wl-panel-body">
                      <div className="prev-tabs">
                        <button className={`prev-tab ${activeAppTab === 'android' ? 'act' : ''}`} onClick={() => setActiveAppTab('android')}>Android App</button>
                        <button className={`prev-tab ${activeAppTab === 'ios' ? 'act' : ''}`} onClick={() => setActiveAppTab('ios')}>iOS App</button>
                      </div>

                      <div className="wl-form-row">
                        <div className="wl-form-group">
                          <label className="wl-lbl">App Name <span>*</span></label>
                          <input type="text" className="wl-inp" value={appName} onChange={e => setAppName(e.target.value)} />
                        </div>
                        <div className="wl-form-group">
                          <label className="wl-lbl">Package Name / Bundle ID <span>*</span></label>
                          <input type="text" className="wl-inp" value={packageName} onChange={e => setPackageName(e.target.value)} />
                        </div>
                      </div>

                      <div className="wl-form-row">
                        <div className="wl-form-group">
                          <label className="wl-lbl">Version <span>*</span></label>
                          <input type="text" className="wl-inp" value={appVersion} onChange={e => setAppVersion(e.target.value)} />
                        </div>
                        <div className="wl-form-group">
                          <label className="wl-lbl">Minimum OS Version <span>*</span></label>
                          <select className="wl-inp wl-select">
                            <option>{activeAppTab === 'android' ? 'Android 7.0 (API 24)' : 'iOS 13.0'}</option>
                            <option>{activeAppTab === 'android' ? 'Android 8.0 (API 26)' : 'iOS 14.0'}</option>
                          </select>
                        </div>
                      </div>

                      <div className="wl-form-row" style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span className="wl-lbl">App Icon</span>
                          <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: '8px', padding: '16px', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer' }}>
                            <span style={{ fontSize: '18px' }}>📤</span>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2A195C', marginTop: '4px' }}>Upload Icon</div>
                            <span style={{ fontSize: '8.5px', color: '#94A3B8' }}>PNG, 512x512px</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span className="wl-lbl">Splash Screen</span>
                          <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: '8px', padding: '16px', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer' }}>
                            <span style={{ fontSize: '18px' }}>📤</span>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2A195C', marginTop: '4px' }}>Upload Splash</div>
                            <span style={{ fontSize: '8.5px', color: '#94A3B8' }}>PNG, 1080x1920px</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button className="wl-btn wl-btn-primary" onClick={() => alert('Mobile app configuration saved!')}>Save App Details</button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right side custom domain preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">App Download Information</span>
                    </div>
                    <div className="wl-panel-body" style={{ gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <div>
                          <strong>Android App</strong>
                          <span className="badge-pill badge-active" style={{ marginLeft: '6px' }}>Active</span>
                        </div>
                        <a href="#" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 'bold' }}>Play Store ↗</a>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <div>
                          <strong>iOS App</strong>
                          <span className="badge-pill badge-active" style={{ marginLeft: '6px' }}>Active</span>
                        </div>
                        <a href="#" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 'bold' }}>App Store ↗</a>
                      </div>
                    </div>
                  </div>

                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Custom Domain Preview</span>
                    </div>
                    <div className="wl-panel-body">
                      <div className="browser-mock">
                        <div className="browser-bar">
                          <span className="browser-dot" />
                          <span className="browser-dot" />
                          <span className="browser-dot" />
                          <span className="browser-url">https://{primaryDomain}</span>
                        </div>
                        <div className="browser-screen">
                          <div style={{ background: primaryColor, borderRadius: '8px', padding: '20px', width: '100%', maxWidth: '200px', color: '#fff', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Welcome Back!</span>
                            <div style={{ background: '#fff', color: '#000', padding: '6px', borderRadius: '4px', marginTop: '16px', fontSize: '10px' }}>Sign In</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Domain Setup Guide</span>
                    </div>
                    <div className="wl-panel-body" style={{ fontSize: '11.5px', color: '#475569', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ background: '#EEF2FF', color: '#6366F1', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', flexShrink: 0 }}>1</span>
                        <span>Add CNAME record pointing to <code>cname.evegah.com</code> in DNS settings.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ background: '#EEF2FF', color: '#6366F1', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', flexShrink: 0 }}>2</span>
                        <span>SSL certificates are automatically generated and renewed.</span>
                      </div>
                    </div>
                  </div>

                  <div className="wl-panel" style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'flex-start', background: '#FAF5FF', borderColor: '#E9D5FF', padding: '16px' }}>
                    <span style={{ fontSize: '18px' }}>📞</span>
                    <div style={{ fontSize: '11.5px', color: '#6B7280', lineHeight: '1.4' }}>
                      <strong style={{ display: 'block', color: '#2A195C', marginBottom: '2px' }}>Need Help?</strong>
                      Facing issues with custom domain setup?
                      <button style={{ marginTop: '8px', display: 'block', padding: '6px 12px', background: '#2A195C', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => alert('Contacting network team...')}>Contact Support</button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'sliders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Sliders Top Controller Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1.5px solid #E2E8F0', padding: '14px 20px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="slider-screen-pills">
                      <button
                        className={`slider-screen-btn ${sliderScreen === 'rent' ? 'act' : ''}`}
                        onClick={() => { setSliderScreen('rent'); setSelectedSlideIdx(0); }}
                      >
                        RentScreen Sliders <span style={{ marginLeft: '4px', padding: '1px 6px', borderRadius: '10px', background: sliderScreen === 'rent' ? '#EEF2FF' : '#E2E8F0', color: sliderScreen === 'rent' ? '#4F46E5' : '#64748B', fontSize: '10.5px' }}>{rentSliders.length}</span>
                      </button>
                      <button
                        className={`slider-screen-btn ${sliderScreen === 'home' ? 'act' : ''}`}
                        onClick={() => { setSliderScreen('home'); setSelectedSlideIdx(0); }}
                      >
                        HomeScreen Sliders <span style={{ marginLeft: '4px', padding: '1px 6px', borderRadius: '10px', background: sliderScreen === 'home' ? '#EEF2FF' : '#E2E8F0', color: sliderScreen === 'home' ? '#4F46E5' : '#64748B', fontSize: '10.5px' }}>{homeSliders.length}</span>
                      </button>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      Configure promotional banners, background artwork, and vehicle cutouts synchronized with the rider app.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      className="wl-btn"
                      onClick={handleAddSlide}
                      style={{ fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Add Slide</span>
                    </button>
                    <button
                      className="wl-btn wl-btn-primary"
                      onClick={handleSaveSliders}
                      disabled={isSavingSliders}
                      style={{ fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>{isSavingSliders ? 'Publishing...' : 'Save & Publish Sliders'}</span>
                    </button>
                  </div>
                </div>

                {sliderSaveMsg && (
                  <div style={{ background: '#ECFDF5', border: '1.5px solid #A7F3D0', padding: '12px 16px', borderRadius: '10px', color: '#065F46', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{sliderSaveMsg}</span>
                  </div>
                )}

                <div className="wl-layout">
                  {/* Left Column: Slide Cards Editor */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {currentSliderList.map((slide: any, idx: number) => {
                      const isSelected = selectedSlideIdx === idx;
                      const slideLabel = `Slider ${idx + 1}`;
                      return (
                        <div
                          key={slide.id || idx}
                          className={`slider-card-box ${isSelected ? 'active-card' : ''}`}
                          onClick={() => setSelectedSlideIdx(idx)}
                        >
                          <div className="slider-card-head">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="slider-num-badge">{idx + 1}</div>
                              <div>
                                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                                  {slideLabel}
                                </span>
                                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '1px' }}>
                                  Key ID: {slide.id}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }} onClick={e => e.stopPropagation()}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                                <span>Active</span>
                                <input
                                  type="checkbox"
                                  className="switch-inp"
                                  checked={slide.active !== false}
                                  onChange={e => handleUpdateSlide(idx, 'active', e.target.checked)}
                                />
                                <span className="switch-slider" />
                              </label>

                              <button
                                className="wl-tag-del"
                                title="Delete Slide"
                                style={{ padding: '5px 10px', borderRadius: '6px', background: '#FEE2E2', color: '#DC2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                onClick={() => handleDeleteSlide(idx)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          {/* Inputs */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="wl-form-group">
                              <label className="wl-lbl">Tag / Category Badge <span>*</span></label>
                              <input
                                type="text"
                                className="wl-inp"
                                value={slide.tag || ''}
                                onChange={e => handleUpdateSlide(idx, 'tag', e.target.value)}
                                placeholder={slideLabel}
                              />
                            </div>

                            <div className="wl-form-group">
                              <label className="wl-lbl">Call to Action (CTA) Button Text</label>
                              <input
                                type="text"
                                className="wl-inp"
                                value={slide.cta || ''}
                                onChange={e => handleUpdateSlide(idx, 'cta', e.target.value)}
                                placeholder="Book This Zone"
                              />
                            </div>
                          </div>

                          <div className="wl-form-group">
                            <label className="wl-lbl">Title / Headline (Dark &amp; Stylish) <span>*</span></label>
                            <input
                              type="text"
                              className="wl-inp"
                              value={slide.title || ''}
                              onChange={e => handleUpdateSlide(idx, 'title', e.target.value)}
                              placeholder="Rent at L&T Knowledge City"
                            />
                          </div>

                          <div className="wl-form-group">
                            <label className="wl-lbl">Subtitle / Description</label>
                            <textarea
                              className="wl-inp"
                              style={{ height: '56px', resize: 'vertical' }}
                              value={slide.subtitle || ''}
                              onChange={e => handleUpdateSlide(idx, 'subtitle', e.target.value)}
                              placeholder="Instant unlock at Main Gate hub. Smooth ride to office."
                            />
                          </div>

                          {/* Image Assets Section: Background & Front Cutout */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                            {/* Background Image */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label className="wl-lbl">Background Image Asset</label>
                              <div className="slider-asset-drop" onClick={e => e.stopPropagation()}>
                                {slide.bg ? (
                                  <img
                                    src={normalizeImageUrl(slide.bg)}
                                    alt="Background preview"
                                    className="slider-asset-thumb"
                                    onError={(e: any) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div style={{ width: '68px', height: '46px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>
                                    Default BG
                                  </div>
                                )}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#4F46E5' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                      <polyline points="17 8 12 3 7 8"/>
                                      <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    <span>{uploadingField === `${idx}-bg` ? 'Uploading...' : 'Upload BG Photo'}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      style={{ display: 'none' }}
                                      onChange={e => handleUploadSliderFile(idx, 'bg', e)}
                                    />
                                  </label>
                                  <input
                                    type="text"
                                    className="wl-inp"
                                    style={{ fontSize: '10.5px', padding: '4px 8px' }}
                                    placeholder="or paste image URL"
                                    value={slide.bg || ''}
                                    onChange={e => handleUpdateSlide(idx, 'bg', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Front Cutout Asset */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label className="wl-lbl">Front Asset Cutout (Scooter / Mascot)</label>
                              <div className="slider-asset-drop" onClick={e => e.stopPropagation()}>
                                {slide.front ? (
                                  <img
                                    src={normalizeImageUrl(slide.front)}
                                    alt="Front preview"
                                    className="slider-asset-thumb"
                                    style={{ objectFit: 'contain' }}
                                    onError={(e: any) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div style={{ width: '68px', height: '46px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>
                                    Default EV
                                  </div>
                                )}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#4F46E5' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                      <polyline points="17 8 12 3 7 8"/>
                                      <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    <span>{uploadingField === `${idx}-front` ? 'Uploading...' : 'Upload Cutout PNG'}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      style={{ display: 'none' }}
                                      onChange={e => handleUploadSliderFile(idx, 'front', e)}
                                    />
                                  </label>
                                  <input
                                    type="text"
                                    className="wl-inp"
                                    style={{ fontSize: '10.5px', padding: '4px 8px' }}
                                    placeholder="or paste image URL"
                                    value={slide.front || ''}
                                    onChange={e => handleUpdateSlide(idx, 'front', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      className="wl-btn"
                      style={{ borderStyle: 'dashed', padding: '14px', justifyContent: 'center', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={handleAddSlide}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Add New Slide to {sliderScreen === 'home' ? 'HomeScreen' : 'RentScreen'}</span>
                    </button>
                  </div>

                  {/* Right Column: Exact Mobile Phone Screen Layout Preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="wl-panel" style={{ position: 'sticky', top: '20px' }}>
                      <div className="wl-panel-hdr">
                        <span className="wl-panel-tit">Rider Mobile Screen Preview</span>
                        <span className="badge-pill badge-active">Live Synchronized</span>
                      </div>

                      <div className="wl-panel-body" style={{ alignItems: 'center', background: '#F8FAFC', padding: '20px 16px' }}>
                        {/* Slide switcher selector pills */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {currentSliderList.map((_, i: number) => (
                            <button
                              key={i}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '16px',
                                border: '1px solid',
                                borderColor: selectedSlideIdx === i ? '#1E1B4B' : '#CBD5E1',
                                background: selectedSlideIdx === i ? '#1E1B4B' : '#fff',
                                color: selectedSlideIdx === i ? '#fff' : '#475569',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                              onClick={() => setSelectedSlideIdx(i)}
                            >
                              Slide {i + 1}
                            </button>
                          ))}
                        </div>

                        {/* Real Mobile App Phone Frame */}
                        {(() => {
                          const activeSlide = currentSliderList[selectedSlideIdx] || currentSliderList[0] || {};
                          const currentTag = activeSlide.tag || `Slider ${selectedSlideIdx + 1}`;
                          return (
                            <div className="phone-mock-frame">
                              <div className="phone-mock-notch" />
                              <div className="phone-mock-screen">
                                {/* Status bar with real SVG indicators */}
                                <div style={{ height: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px 4px', fontSize: '10px', fontWeight: 800, color: '#0F172A', zIndex: 25 }}>
                                  <span>9:41</span>
                                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                    {/* Cellular */}
                                    <svg width="12" height="10" viewBox="0 0 16 12" fill="#0F172A">
                                      <rect x="0" y="8" width="2.5" height="4" rx="0.5"/>
                                      <rect x="4" y="6" width="2.5" height="6" rx="0.5"/>
                                      <rect x="8" y="3" width="2.5" height="9" rx="0.5"/>
                                      <rect x="12" y="0" width="2.5" height="12" rx="0.5"/>
                                    </svg>
                                    {/* WiFi */}
                                    <svg width="12" height="10" viewBox="0 0 16 12" fill="#0F172A">
                                      <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                                      <path d="M4.5 5.5a5 5 0 017 0" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                                      <path d="M2 3a8.5 8.5 0 0112 0" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                                    </svg>
                                    {/* Battery */}
                                    <svg width="16" height="9" viewBox="0 0 22 12" fill="none" stroke="#0F172A" strokeWidth="1.5">
                                      <rect x="1" y="1" width="17" height="10" rx="2.5"/>
                                      <rect x="3" y="3" width="11" height="6" rx="1" fill="#0F172A"/>
                                      <path d="M19 4v4" strokeLinecap="round"/>
                                    </svg>
                                  </div>
                                </div>

                                {/* Real Screen Header */}
                                {sliderScreen === 'rent' ? (
                                  <div style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div style={{ width: '28px', height: '28px', borderRadius: '14px', background: 'rgba(255,255,255,0.9)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                                        ‹
                                      </div>
                                      <div>
                                        <div style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>Rent EV</div>
                                        <div style={{ fontSize: '8px', color: '#64748B' }}>Vadodara Knowledge City</div>
                                      </div>
                                    </div>
                                    <span style={{ fontSize: '8.5px', fontWeight: 800, background: 'rgba(108,56,255,0.08)', color: '#6C38FF', padding: '3px 7px', borderRadius: '10px', border: '1px solid rgba(108,56,255,0.18)' }}>
                                      ● Active Zone
                                    </span>
                                  </div>
                                ) : (
                                  <div style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#6C38FF" stroke="#6C38FF" strokeWidth="2">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                                        <circle cx="12" cy="9" r="2.5" fill="#fff"/>
                                      </svg>
                                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>Gotri Zone, Vadodara ▾</span>
                                    </div>
                                    <div style={{ width: '26px', height: '26px', borderRadius: '13px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                      </svg>
                                    </div>
                                  </div>
                                )}

                                {/* Dynamic Slider with Real Layout & Styling */}
                                <div className="phone-hero-slider">
                                  {/* Background Image */}
                                  {activeSlide.bg ? (
                                    <img
                                      src={normalizeImageUrl(activeSlide.bg)}
                                      alt="Slide BG"
                                      className="phone-slide-bg"
                                    />
                                  ) : (
                                    <div
                                      className="phone-slide-bg"
                                      style={{
                                        background: sliderScreen === 'rent'
                                          ? 'radial-gradient(circle at 80% 20%, #EDE9FE 0%, #E0E7FF 40%, #F1F5F9 100%)'
                                          : 'radial-gradient(circle at 80% 20%, #CCFBF1 0%, #E0E7FF 40%, #F8FAFC 100%)'
                                      }}
                                    />
                                  )}

                                  {/* Soft luminous gradient overlay for dark typography */}
                                  <div className="phone-slide-grad" />

                                  {/* Left Copy (Dark Luxury Typography) */}
                                  <div className="phone-slide-copy">
                                    <span className="phone-tag-badge">
                                      {currentTag}
                                    </span>
                                    <h3 className="phone-slide-h1">
                                      {activeSlide.title || 'Rent at L&T Knowledge City'}
                                    </h3>
                                    <p className="phone-slide-p">
                                      {activeSlide.subtitle || 'Instant unlock at Main Gate hub. Smooth ride to office.'}
                                    </p>
                                    <button className="phone-slide-cta">
                                      {activeSlide.cta || 'Book This Zone'} ➔
                                    </button>
                                  </div>

                                  {/* Front Asset Cutout */}
                                  {activeSlide.front ? (
                                    <img
                                      src={normalizeImageUrl(activeSlide.front)}
                                      alt="Slide Front"
                                      className="phone-slide-front"
                                    />
                                  ) : (
                                    <div className="phone-slide-front" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <svg width="125" height="125" viewBox="0 0 200 180" fill="none">
                                        <circle cx="50" cy="140" r="28" fill="#1E1B4B" stroke="#6C38FF" strokeWidth="5"/>
                                        <circle cx="50" cy="140" r="14" fill="#E2E8F0"/>
                                        <circle cx="155" cy="140" r="28" fill="#1E1B4B" stroke="#6C38FF" strokeWidth="5"/>
                                        <circle cx="155" cy="140" r="14" fill="#E2E8F0"/>
                                        <path d="M45 130 Q70 120 100 125 L145 130" stroke="#0F172A" strokeWidth="11" strokeLinecap="round"/>
                                        <path d="M75 125 L95 85 L140 100 L145 130 Z" fill="#6C38FF"/>
                                        <path d="M60 85 Q90 80 115 85" stroke="#1E1B4B" strokeWidth="9" strokeLinecap="round"/>
                                        <path d="M135 125 L160 50" stroke="#0F172A" strokeWidth="7" strokeLinecap="round"/>
                                        <path d="M148 48 L170 48" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round"/>
                                        <circle cx="168" cy="52" r="5" fill="#00D26A"/>
                                      </svg>
                                    </div>
                                  )}

                                  {/* Pagination Dots */}
                                  <div className="phone-dots">
                                    {currentSliderList.map((_, dotIdx: number) => (
                                      <span
                                        key={dotIdx}
                                        className={`phone-dot ${selectedSlideIdx === dotIdx ? 'act' : ''}`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                {/* Real Screen Body Content Below Slider */}
                                {sliderScreen === 'rent' ? (
                                  <div style={{ flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {/* Operational hours notice */}
                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                                      <span style={{ fontSize: '8px', fontWeight: 700, color: '#334155' }}>Operational: 06:00 AM – 11:00 PM (Daily)</span>
                                    </div>

                                    {/* Real Rent Schedule Selector Card */}
                                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '9px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#0F172A' }}>Select Rental Schedule</span>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                        <div style={{ background: '#F8FAFC', borderRadius: '6px', padding: '6px', border: '1px solid #F1F5F9' }}>
                                          <div style={{ fontSize: '7px', color: '#64748B', fontWeight: 800 }}>PICKUP</div>
                                          <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#0F172A' }}>Today, 10:00 AM</div>
                                        </div>
                                        <div style={{ background: '#F8FAFC', borderRadius: '6px', padding: '6px', border: '1px solid #F1F5F9' }}>
                                          <div style={{ fontSize: '7px', color: '#64748B', fontWeight: 800 }}>DROPOFF</div>
                                          <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#0F172A' }}>Tomorrow, 10:00 AM</div>
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px dashed #E2E8F0' }}>
                                        <span style={{ fontSize: '8px', color: '#475569' }}>Selected: <strong>Daily Pass (24 hrs)</strong></span>
                                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#6C38FF' }}>₹149/day</span>
                                      </div>
                                    </div>

                                    {/* Action button */}
                                    <div style={{ background: '#6C38FF', color: '#fff', borderRadius: '10px', padding: '9px', textAlign: 'center', fontSize: '10.5px', fontWeight: 800, marginTop: '2px', boxShadow: '0 4px 10px rgba(108,56,255,0.25)' }}>
                                      Continue to Vehicle Selection ➔
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {/* Real HomeScreen Booking Sheet */}
                                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#0F172A' }}>Find Zones near to you</span>
                                      <div style={{ background: '#F8FAFC', borderRadius: '6px', padding: '6px 8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '9px' }}>📍</span>
                                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#1E293B' }}>Gotri Zone Central Hub</span>
                                      </div>
                                      <div style={{ background: '#6C38FF', color: '#fff', borderRadius: '8px', padding: '8px', textAlign: 'center', fontSize: '9.5px', fontWeight: 800, marginTop: '2px' }}>
                                        Rent Your EV ➔
                                      </div>
                                    </div>

                                    {/* Real Fleet Card */}
                                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                        <div style={{ fontSize: '9px', fontWeight: 800, color: '#0F172A' }}>Evegah City 60V</div>
                                        <div style={{ fontSize: '7.5px', color: '#10B981', fontWeight: 700 }}>● 8 Vehicles Available Now</div>
                                      </div>
                                      <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#6C38FF' }}>From ₹149</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        <p style={{ fontSize: '10.5px', color: '#64748B', textAlign: 'center', marginTop: '14px', maxWidth: '280px', lineHeight: 1.4 }}>
                          Real-time preview matching the exact layout, aspect ratio, and typography delivered to mobile riders.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="wl-layout">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* SMTP Server Configuration */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">SMTP Server Setup</span>
                    </div>
                    <div className="wl-panel-body">
                      <div className="wl-form-row">
                        <div className="wl-form-group">
                          <label className="wl-lbl">SMTP Server <span>*</span></label>
                          <input type="text" className="wl-inp" value={smtpServer} onChange={e => setSmtpServer(e.target.value)} />
                        </div>
                        <div className="wl-form-group">
                          <label className="wl-lbl">SMTP Port <span>*</span></label>
                          <input type="text" className="wl-inp" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} />
                        </div>
                      </div>
                      <div className="wl-form-row">
                        <div className="wl-form-group">
                          <label className="wl-lbl">Username <span>*</span></label>
                          <input type="text" className="wl-inp" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} />
                        </div>
                        <div className="wl-form-group">
                          <label className="wl-lbl">Password <span>*</span></label>
                          <input type="password" className="wl-inp" defaultValue="••••••••" />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button className="wl-btn" onClick={() => alert('Sending test email...')}>Send Test Email</button>
                        <button className="wl-btn wl-btn-primary" onClick={() => alert('SMTP settings saved!')}>Save SMTP</button>
                      </div>
                    </div>
                  </div>

                  {/* Email Templates */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Custom Email Templates</span>
                    </div>
                    <div className="wl-panel-body">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          { name: 'Welcome Email Template', trigger: 'Trigger: On Rider Onboarding' },
                          { name: 'Swap Invoice Receipt Template', trigger: 'Trigger: On Battery Swap' },
                          { name: 'Password Reset Verification', trigger: 'Trigger: On Forgot Password' },
                          { name: 'Monthly Bill Summary Template', trigger: 'Trigger: Monthly Cycles' }
                        ].map((tpl, i) => (
                          <div className="logo-upload-row" key={i}>
                            <div>
                              <strong>{tpl.name}</strong>
                              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>{tpl.trigger}</div>
                            </div>
                            <button className="wl-btn" style={{ padding: '6px 12px' }} onClick={() => alert(`Opening template editor for: ${tpl.name}`)}>Edit Template ✏</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Notification Channels</span>
                    </div>
                    <div className="wl-panel-body">
                      {[
                        { label: 'Email Notifications', checked: true },
                        { label: 'SMS Gateway Alerts', checked: true },
                        { label: 'WhatsApp Receipts Integration', checked: false },
                        { label: 'Firebase Push Notifications', checked: true }
                      ].map((item, idx) => (
                        <div className="wl-switch-wrap" key={idx}>
                          <span className="wl-switch-lbl">{item.label}</span>
                          <label style={{ display: 'flex' }}>
                            <input type="checkbox" className="switch-inp" defaultChecked={item.checked} />
                            <span className="switch-slider" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'invoice' && (
              <div className="wl-layout">
                {/* Left Invoice config */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Invoice & Receipt Customization</span>
                    </div>
                    <div className="wl-panel-body">
                      <div className="wl-form-group">
                        <label className="wl-lbl">Invoice Title <span>*</span></label>
                        <input type="text" className="wl-inp" value={invoiceTitle} onChange={e => setInvoiceTitle(e.target.value)} />
                      </div>
                      <div className="wl-form-row">
                        <div className="wl-form-group">
                          <label className="wl-lbl">Invoice Prefix <span>*</span></label>
                          <input type="text" className="wl-inp" value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} />
                        </div>
                        <div className="wl-form-group">
                          <label className="wl-lbl">GST Number <span>*</span></label>
                          <input type="text" className="wl-inp" value={gstNo} onChange={e => setGstNo(e.target.value)} />
                        </div>
                      </div>
                      <div className="wl-form-row">
                        <div className="wl-form-group">
                          <label className="wl-lbl">PAN Number <span>*</span></label>
                          <input type="text" className="wl-inp" value={panNo} onChange={e => setPanNo(e.target.value)} />
                        </div>
                      </div>
                      <div className="wl-form-group">
                        <label className="wl-lbl">Company Billing Address <span>*</span></label>
                        <input type="text" className="wl-inp" value={invoiceAddress} onChange={e => setInvoiceAddress(e.target.value)} />
                      </div>
                      <div className="wl-form-group">
                        <label className="wl-lbl">Footer Declaration / Policy Text</label>
                        <textarea className="wl-inp" style={{ height: '60px', resize: 'none' }} value={invoiceFooter} onChange={e => setInvoiceFooter(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Document Templates</span>
                    </div>
                    <div className="wl-panel-body" style={{ gridTemplateColumns: 'repeat(3, 1fr)', display: 'grid', gap: '12px' }}>
                      {[
                        { label: 'Tax Invoice', active: true },
                        { label: 'Customer Receipt', active: true },
                        { label: 'Quotation / Estimate', active: false }
                      ].map(doc => (
                        <div key={doc.label} style={{ padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{doc.label}</span>
                          <span style={{ fontSize: '9px', color: doc.active ? '#10B981' : '#64748B', fontWeight: '700' }}>{doc.active ? 'Template Active' : 'Inactive'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column Invoice Live PDF Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Live Template Preview</span>
                      <button className="wl-btn wl-btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={handleDownloadPDF}>
                        Generate PDF
                      </button>
                    </div>
                    <div className="wl-panel-body">
                      
                      <div className="prev-tabs">
                        <button className={`prev-tab ${activeInvoiceTab === 'invoice' ? 'act' : ''}`} onClick={() => setActiveInvoiceTab('invoice')}>Tax Invoice</button>
                        <button className={`prev-tab ${activeInvoiceTab === 'receipt' ? 'act' : ''}`} onClick={() => setActiveInvoiceTab('receipt')}>Swap Receipt</button>
                      </div>

                      {/* Invoice paper design */}
                      <div className="invoice-paper">
                        <div className="invoice-hdr">
                          <div>
                            <span className="invoice-tit">{activeInvoiceTab === 'receipt' ? 'Rider Receipt' : invoiceTitle}</span>
                            <span style={{ display: 'block', fontSize: '9px', color: '#64748B', fontWeight: 'bold', marginTop: '2px' }}>
                              {activeInvoiceTab === 'receipt' ? 'RCPT' : invoicePrefix}-2024-000123
                            </span>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '9px' }}>
                            <strong>{companyName}</strong><br/>
                            GSTIN: {gstNo}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', borderBottom: '1px dashed #E2E8F0', paddingBottom: '8px' }}>
                          <div>
                            <strong>Bill To:</strong><br/>
                            Rahul Sharma<br/>
                            Delhi - 110001
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            Date: 20 Jun 2024
                          </div>
                        </div>

                        {/* Invoice Table */}
                        <table className="invoice-table">
                          <thead>
                            <tr>
                              <th>Description</th>
                              <th style={{ textAlign: 'center' }}>Qty</th>
                              <th style={{ textAlign: 'right' }}>Rate (₹)</th>
                              <th style={{ textAlign: 'right' }}>Total (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeInvoiceTab === 'receipt' ? (
                              <>
                                <tr>
                                  <td>Battery Swap Service Fee (60V 45Ah Pack)</td>
                                  <td style={{ textAlign: 'center' }}>1</td>
                                  <td style={{ textAlign: 'right' }}>250.00</td>
                                  <td style={{ textAlign: 'right' }}>250.00</td>
                                </tr>
                                <tr>
                                  <td>Rider Wallet Top-up Accent</td>
                                  <td style={{ textAlign: 'center' }}>1</td>
                                  <td style={{ textAlign: 'right' }}>1,000.00</td>
                                  <td style={{ textAlign: 'right' }}>1,000.00</td>
                                </tr>
                              </>
                            ) : (
                              <>
                                <tr>
                                  <td>EV Battery Pack 60V 45Ah</td>
                                  <td style={{ textAlign: 'center' }}>1</td>
                                  <td style={{ textAlign: 'right' }}>25,000.00</td>
                                  <td style={{ textAlign: 'right' }}>25,000.00</td>
                                </tr>
                                <tr>
                                  <td>Battery Charger 60V 10A</td>
                                  <td style={{ textAlign: 'center' }}>1</td>
                                  <td style={{ textAlign: 'right' }}>2,500.00</td>
                                  <td style={{ textAlign: 'right' }}>2,500.00</td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>

                        <div className="invoice-sum">
                          <table className="invoice-sum-table">
                            <tr>
                              <td>Sub Total:</td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{activeInvoiceTab === 'receipt' ? '1,250.00' : '27,500.00'}</td>
                            </tr>
                            <tr>
                              <td>CGST (9%):</td>
                              <td style={{ textAlign: 'right' }}>₹{activeInvoiceTab === 'receipt' ? '112.50' : '2,475.00'}</td>
                            </tr>
                            <tr>
                              <td>SGST (9%):</td>
                              <td style={{ textAlign: 'right' }}>₹{activeInvoiceTab === 'receipt' ? '112.50' : '2,475.00'}</td>
                            </tr>
                            <tr style={{ borderTop: '1px solid #000', fontWeight: 'bold' }}>
                              <td style={{ paddingTop: '6px' }}>Total Payable:</td>
                              <td style={{ textAlign: 'right', paddingTop: '6px', color: primaryColor }}>₹{activeInvoiceTab === 'receipt' ? '1,475.00' : '32,450.00'}</td>
                            </tr>
                          </table>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="wl-layout">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Code Injection */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">Custom Code Injection (CSS/JS)</span>
                    </div>
                    <div className="wl-panel-body">
                      <div className="wl-form-group">
                        <label className="wl-lbl">Head Custom CSS</label>
                        <textarea 
                          className="wl-inp" 
                          style={{ height: '80px', fontFamily: 'monospace', fontSize: '12px' }} 
                          placeholder="/* Add style overrides here */"
                          value={customCSS}
                          onChange={e => setCustomCSS(e.target.value)}
                        />
                      </div>
                      <div className="wl-form-group">
                        <label className="wl-lbl">Body Script Inject (Analytics / Trackers)</label>
                        <textarea 
                          className="wl-inp" 
                          style={{ height: '80px', fontFamily: 'monospace', fontSize: '12px' }} 
                          placeholder="<script> // Analytics tools </script>"
                          value={customJS}
                          onChange={e => setCustomJS(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="wl-btn wl-btn-primary" onClick={() => alert('Custom injection scripts saved!')}>Save Scripts</button>
                      </div>
                    </div>
                  </div>

                  {/* System Settings */}
                  <div className="wl-panel">
                    <div className="wl-panel-hdr">
                      <span className="wl-panel-tit">System Maintenance Operations</span>
                    </div>
                    <div className="wl-panel-body" style={{ gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '12.5px', color: '#1E293B', display: 'block' }}>Maintenance Mode</strong>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>Enable this to show a maintenance page to all users.</span>
                        </div>
                        <label style={{ display: 'flex' }}>
                          <input type="checkbox" className="switch-inp" />
                          <span className="switch-slider" />
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                        <button className="wl-btn" style={{ flex: 1, borderColor: '#EF4444', color: '#EF4444' }} onClick={() => alert('Purged application cache!')}>Purge Cache</button>
                        <button className="wl-btn" style={{ flex: 1 }} onClick={() => alert('Database export started...')}>Export Database Backups</button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* General bottom notification banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#475569', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 14px', borderRadius: '8px' }}>
              <span>ℹ</span>
              <span>Changes will be applied to the platform after publishing.</span>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
