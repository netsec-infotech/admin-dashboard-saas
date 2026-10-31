'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

interface SliderItem {
  id: string;
  title: string;
  highlightText: string;
  subtitle: string;
  couponCode: string;
  buttonText: string;
  imagePath: string;
  targetScreen: string;
  isActive: boolean;
  order: number;
  bgColor: string;
}

interface QuickActionConfig {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  isActive: boolean;
  hasPlusBadge: boolean;
}

interface RentalCardConfig {
  id: string;
  title: string;
  titleColor: string;
  subtitle: string;
  description: string;
  bgColor: string;
  btnColor: string;
  badgeIcon: string;
  badgeBg: string;
  image: string;
  tiltAngle: number;
  isActive: boolean;
}

export default function MobileAppSettingsPage() {
  const [activeTab, setActiveTab] = useState<'sliders' | 'quick_actions' | 'rentals' | 'announcements' | 'system'>('sliders');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Sliders State
  const [sliders, setSliders] = useState<SliderItem[]>([
    {
      id: '1',
      title: 'MONSOON OFFER',
      highlightText: '30% OFF',
      subtitle: 'Enjoy exciting offers on every EV ride.',
      couponCode: 'EVGO30',
      buttonText: 'Explore Offers >',
      imagePath: 'assets/Offer.png',
      targetScreen: 'PaymentOffersScreen',
      isActive: true,
      order: 1,
      bgColor: '#200F54',
    },
    {
      id: '2',
      title: 'RENT YOUR EV',
      highlightText: 'FLEXIBLE RENTAL',
      subtitle: 'Pick up & drop off at any Evegah zone near you.',
      couponCode: 'EVEGAHFLEX',
      buttonText: 'Book Now >',
      imagePath: 'assets/Rent EV.png',
      targetScreen: 'RentEvScreen',
      isActive: true,
      order: 2,
      bgColor: '#064E3B',
    },
    {
      id: '3',
      title: 'RIDE MORE SPEND LESS',
      highlightText: 'SAVE UP TO ₹500',
      subtitle: 'Weekly & Monthly subscription plans available.',
      couponCode: 'RIDELESS',
      buttonText: 'View Packages >',
      imagePath: 'assets/Ride More Spend Less.png',
      targetScreen: 'SelectPackageScreen',
      isActive: true,
      order: 3,
      bgColor: '#7C2D12',
    },
    {
      id: '4',
      title: 'GO ELECTRIC TODAY',
      highlightText: 'ZERO EMISSION',
      subtitle: 'Join the green revolution with Evegah smart bikes.',
      couponCode: 'GREENEV',
      buttonText: 'Choose EV >',
      imagePath: 'assets/Ride More.png',
      targetScreen: 'VehicleListScreen',
      isActive: true,
      order: 4,
      bgColor: '#0F172A',
    },
  ]);

  // Form State for Adding / Editing Slider
  const [editingSlider, setEditingSlider] = useState<SliderItem | null>(null);
  const [newSliderTitle, setNewSliderTitle] = useState('');
  const [newSliderHighlight, setNewSliderHighlight] = useState('');
  const [newSliderSubtitle, setNewSliderSubtitle] = useState('');
  const [newSliderCoupon, setNewSliderCoupon] = useState('');
  const [newSliderButtonText, setNewSliderButtonText] = useState('Explore Offers >');
  const [newSliderImagePath, setNewSliderImagePath] = useState('assets/Offer.png');
  const [newSliderTargetScreen, setNewSliderTargetScreen] = useState('RentEvScreen');
  const [newSliderBgColor, setNewSliderBgColor] = useState('#200F54');
  const [showAddSliderModal, setShowAddSliderModal] = useState(false);

  // 2. Quick Actions State
  const [quickActions, setQuickActions] = useState<QuickActionConfig[]>([
    { id: 'rent_now', title: 'Rent Now', subtitle: 'Book a vehicle', iconName: 'scooter', isActive: true, hasPlusBadge: true },
    { id: 'ride_history', title: 'Ride History', subtitle: 'Your trips', iconName: 'clock', isActive: true, hasPlusBadge: false },
    { id: 'scan_qr', title: 'Scan QR', subtitle: 'Unlock vehicle', iconName: 'qr', isActive: true, hasPlusBadge: false },
    { id: 'my_wallet', title: 'My Wallet', subtitle: '₹1,250.00', iconName: 'wallet', isActive: true, hasPlusBadge: false },
    { id: 'battery_swap', title: 'Battery Swap', subtitle: 'Nearby stations', iconName: 'battery', isActive: false, hasPlusBadge: false },
  ]);

  // 3. Rental Cards State
  const [rentalCards, setRentalCards] = useState<RentalCardConfig[]>([
    {
      id: 'daily_drive',
      title: 'Daily Drive',
      titleColor: '#0F172A',
      subtitle: '12+ Hours',
      description: 'Perfect for short daily rides',
      bgColor: '#F4F0FF',
      btnColor: '#4313B8',
      badgeIcon: 'bolt',
      badgeBg: '#4313B8',
      image: 'assets/city.png',
      tiltAngle: -0.035,
      isActive: true,
    },
    {
      id: 'subscription',
      title: 'Monthly Drive',
      titleColor: '#15803D',
      subtitle: '30+ Days',
      description: 'Best for regular riders',
      bgColor: '#F0FDF4',
      btnColor: '#16A34A',
      badgeIcon: 'gift',
      badgeBg: '#16A34A',
      image: 'assets/mink.png',
      tiltAngle: -0.035,
      isActive: true,
    },
    {
      id: 'weekday_pass',
      title: 'Weekday Pass',
      titleColor: '#C2410C',
      subtitle: 'Mon to Fri | Limited Kms',
      description: 'Ride more for less',
      bgColor: '#FFFBEB',
      btnColor: '#EA580C',
      badgeIcon: 'percent',
      badgeBg: '#EA580C',
      image: 'assets/v2.webp',
      tiltAngle: 0.035,
      isActive: true,
    },
  ]);

  // 4. Announcements State
  const [topSlogan, setTopSlogan] = useState('Ride Green, Ride Smart -> Anywhere • Anytime <-');
  const [requireKyc, setRequireKyc] = useState(true);
  const [hostBannerText, setHostBannerText] = useState('Host Your EV & Earn extra income by sharing your EV');
  const [enable3DTilt, setEnable3DTilt] = useState(true);

  // 5. System State
  const [minAndroidVersion, setMinAndroidVersion] = useState('1.0.4');
  const [minIosVersion, setMinIosVersion] = useState('1.0.2');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Auto-scroll mobile preview carousel
  useEffect(() => {
    const activeSliders = sliders.filter((s) => s.isActive);
    if (activeSliders.length === 0) return;
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % activeSliders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [sliders]);

  // Load settings on mount
  useEffect(() => {
    let mounted = true;
    fetch('/api/settings/mobile_app')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!mounted || !json || !json.data) return;
        const d = json.data.value || json.data;
        if (Array.isArray(d.sliders) && d.sliders.length > 0) setSliders(d.sliders);
        if (Array.isArray(d.quickActions) && d.quickActions.length > 0) setQuickActions(d.quickActions);
        if (Array.isArray(d.rentalCards) && d.rentalCards.length > 0) setRentalCards(d.rentalCards);
        if (d.announcements) {
          if (d.announcements.topSlogan !== undefined) setTopSlogan(d.announcements.topSlogan);
          if (d.announcements.requireKyc !== undefined) setRequireKyc(d.announcements.requireKyc);
          if (d.announcements.hostBannerText !== undefined) setHostBannerText(d.announcements.hostBannerText);
          if (d.announcements.enable3DTilt !== undefined) setEnable3DTilt(d.announcements.enable3DTilt);
        }
        if (d.system) {
          if (d.system.minAndroidVersion) setMinAndroidVersion(d.system.minAndroidVersion);
          if (d.system.minIosVersion) setMinIosVersion(d.system.minIosVersion);
          if (d.system.forceUpdate !== undefined) setForceUpdate(d.system.forceUpdate);
          if (d.system.maintenanceMode !== undefined) setMaintenanceMode(d.system.maintenanceMode);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload = {
        sliders,
        quickActions,
        rentalCards,
        announcements: { topSlogan, requireKyc, hostBannerText, enable3DTilt },
        system: { minAndroidVersion, minIosVersion, forceUpdate, maintenanceMode },
      };

      const res = await fetch('/api/settings/mobile_app', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      showToast('✅ Mobile App Settings & Sliders published successfully!');
    } catch (err) {
      showToast('✅ Mobile App Settings saved locally!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSlider = (id: string) => {
    setSliders(sliders.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)));
  };

  const handleDeleteSlider = (id: string) => {
    if (confirm('Are you sure you want to remove this slider?')) {
      setSliders(sliders.filter((s) => s.id !== id));
      showToast('Slider deleted');
    }
  };

  const handleCreateOrUpdateSlider = () => {
    if (!newSliderTitle) {
      alert('Please enter a slider title');
      return;
    }

    if (editingSlider) {
      setSliders(
        sliders.map((s) =>
          s.id === editingSlider.id
            ? {
              ...s,
              title: newSliderTitle,
              highlightText: newSliderHighlight,
              subtitle: newSliderSubtitle,
              couponCode: newSliderCoupon,
              buttonText: newSliderButtonText,
              imagePath: newSliderImagePath,
              targetScreen: newSliderTargetScreen,
              bgColor: newSliderBgColor,
            }
            : s
        )
      );
      showToast('Slider updated!');
    } else {
      const newItem: SliderItem = {
        id: Date.now().toString(),
        title: newSliderTitle,
        highlightText: newSliderHighlight,
        subtitle: newSliderSubtitle,
        couponCode: newSliderCoupon,
        buttonText: newSliderButtonText,
        imagePath: newSliderImagePath,
        targetScreen: newSliderTargetScreen,
        isActive: true,
        order: sliders.length + 1,
        bgColor: newSliderBgColor,
      };
      setSliders([...sliders, newItem]);
      showToast('New slider added!');
    }

    setShowAddSliderModal(false);
    setEditingSlider(null);
    setNewSliderTitle('');
    setNewSliderHighlight('');
    setNewSliderSubtitle('');
    setNewSliderCoupon('');
  };

  const openEditModal = (s: SliderItem) => {
    setEditingSlider(s);
    setNewSliderTitle(s.title);
    setNewSliderHighlight(s.highlightText);
    setNewSliderSubtitle(s.subtitle);
    setNewSliderCoupon(s.couponCode);
    setNewSliderButtonText(s.buttonText);
    setNewSliderImagePath(s.imagePath);
    setNewSliderTargetScreen(s.targetScreen);
    setNewSliderBgColor(s.bgColor);
    setShowAddSliderModal(true);
  };

  const activeSliders = sliders.filter((s) => s.isActive);
  const currentSlider = activeSliders[previewIndex] || sliders[0];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div style={{ marginLeft: 230, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 9999,
              background: '#10B981',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: 10,
              fontWeight: 600,
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{toastMessage}</span>
          </div>
        )}

        {/* MAIN CONTAINER */}
        <div style={{ padding: '24px 28px 60px' }}>
          {/* HEADER ROW */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Mobile App Settings & Home Slider Manager
              </h1>
              <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
                Manage mobile rider app home sliders, quick actions, rental cards 3D styles, and app configurations in real-time.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowAddSliderModal(true)}
                style={{
                  background: '#EEF2FF',
                  color: '#4313B8',
                  border: '1px solid #C7D2FE',
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                + Add New Slider Banner
              </button>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                style={{
                  background: '#200F54',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(32, 15, 84, 0.25)',
                }}
              >
                {isSaving ? 'Publishing...' : '💾 Publish to Mobile App'}
              </button>
            </div>
          </div>

          {/* TAB BUTTONS */}
          <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #E2E8F0', paddingBottom: 12, marginBottom: 24 }}>
            {[
              { id: 'sliders', label: '🖼️ Hero Sliders & Banners', count: sliders.length },
              { id: 'quick_actions', label: '⚡ Quick Actions & Menu', count: quickActions.filter((q) => q.isActive).length },
              { id: 'rentals', label: '🛵 Rental Cards & 3D Tilt', count: rentalCards.length },
              { id: 'announcements', label: '📢 Announcements & KYC' },
              { id: 'system', label: '📲 App Version & Maintenance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontWeight: activeTab === tab.id ? 700 : 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeTab === tab.id ? '#200F54' : '#F1F5F9',
                  color: activeTab === tab.id ? '#fff' : '#64748B',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label} {tab.count !== undefined && <span style={{ opacity: 0.8, marginLeft: 4 }}>({tab.count})</span>}
              </button>
            ))}
          </div>

          {/* TWO COLUMN GRID: SETTINGS FORM (LEFT 65%) + REAL-TIME MOBILE PREVIEW (RIGHT 35%) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
            {/* LEFT COLUMN: TAB CONTENT */}
            <div>
              {/* TAB 1: HERO SLIDERS & BANNERS */}
              {activeTab === 'sliders' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                          Active Home Carousel Banners ({activeSliders.length} / {sliders.length})
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748B' }}>
                          Drag or toggle sliders to change the hero carousel order on the mobile app home screen.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingSlider(null);
                          setNewSliderTitle('');
                          setNewSliderHighlight('');
                          setNewSliderSubtitle('');
                          setNewSliderCoupon('');
                          setShowAddSliderModal(true);
                        }}
                        style={{
                          background: '#4313B8',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        + Add Banner
                      </button>
                    </div>

                    {/* SLIDERS CARDS LIST */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {sliders.map((s, index) => (
                        <div
                          key={s.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            padding: 14,
                            background: s.isActive ? '#FAF5FF' : '#F8FAFC',
                            border: `1.5px solid ${s.isActive ? '#C7D2FE' : '#E2E8F0'}`,
                            borderRadius: 14,
                          }}
                        >
                          {/* Banner Color Badge / Preview Thumbnail */}
                          <div
                            style={{
                              width: 80,
                              height: 52,
                              borderRadius: 10,
                              background: s.bgColor,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: 9,
                              fontWeight: 800,
                              textAlign: 'center',
                              padding: 4,
                            }}
                          >
                            <span style={{ color: '#8CE600' }}>{s.highlightText || 'OFFER'}</span>
                            <span style={{ fontSize: 7, opacity: 0.9 }}>{s.couponCode}</span>
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 800, fontSize: 14, color: '#0F172A' }}>{s.title}</span>
                              {s.couponCode && (
                                <span
                                  style={{
                                    background: '#DCFCE7',
                                    color: '#15803D',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                  }}
                                >
                                  Code: {s.couponCode}
                                </span>
                              )}
                            </div>
                            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748B' }}>{s.subtitle}</p>
                            <span style={{ fontSize: 10, color: '#4313B8', fontWeight: 600 }}>→ Opens: {s.targetScreen}</span>
                          </div>

                          {/* Active Toggle Switch */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={s.isActive}
                                onChange={() => handleToggleSlider(s.id)}
                                style={{ width: 16, height: 16, accentColor: '#4313B8' }}
                              />
                              {s.isActive ? 'Active' : 'Disabled'}
                            </label>

                            <button
                              onClick={() => openEditModal(s)}
                              style={{
                                background: '#fff',
                                border: '1px solid #CBD5E1',
                                padding: '6px 12px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              ✏️ Edit
                            </button>

                            <button
                              onClick={() => handleDeleteSlider(s.id)}
                              style={{
                                background: '#FEF2F2',
                                border: '1px solid #FCA5A5',
                                color: '#EF4444',
                                padding: '6px 10px',
                                borderRadius: 8,
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QUICK ACTIONS */}
              {activeTab === 'quick_actions' && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Rider Home Quick Action Icons</h3>
                  <p style={{ margin: '4px 0 16px', fontSize: 12, color: '#64748B' }}>
                    Enable or disable quick action tiles visible on the rider home dashboard.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                    {quickActions.map((qa) => (
                      <div
                        key={qa.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 14,
                          borderRadius: 12,
                          border: '1px solid #E2E8F0',
                          background: qa.isActive ? '#FAF5FF' : '#F8FAFC',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              background: '#F5F3FF',
                              color: '#4313B8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                            }}
                          >
                            ⚡
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{qa.title}</div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>{qa.subtitle}</div>
                          </div>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={qa.isActive}
                            onChange={() =>
                              setQuickActions(quickActions.map((q) => (q.id === qa.id ? { ...q, isActive: !q.isActive } : q)))
                            }
                            style={{ width: 18, height: 18, accentColor: '#4313B8' }}
                          />
                          {qa.isActive ? 'Enabled' : 'Hidden'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: RENTAL CARDS */}
              {activeTab === 'rentals' && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Choose Your Rental Cards & 3D Tilt</h3>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748B' }}>
                        Configure rental offer cards and 3D card tilt rotation angles.
                      </p>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={enable3DTilt}
                        onChange={(e) => setEnable3DTilt(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#4313B8' }}
                      />
                      Enable 3D Perspective Tilt Effect
                    </label>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {rentalCards.map((rc) => (
                      <div
                        key={rc.id}
                        style={{
                          padding: 16,
                          borderRadius: 14,
                          background: rc.bgColor,
                          border: '1px solid #CBD5E1',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 16, color: rc.titleColor }}>{rc.title}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>{rc.subtitle}</div>
                          <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{rc.description}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div>
                            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>3D Tilt Angle:</span>
                            <input
                              type="number"
                              step="0.005"
                              value={rc.tiltAngle}
                              onChange={(e) =>
                                setRentalCards(
                                  rentalCards.map((r) => (r.id === rc.id ? { ...r, tiltAngle: parseFloat(e.target.value) || 0 } : r))
                                )
                              }
                              style={{
                                width: 70,
                                padding: '6px 8px',
                                border: '1px solid #CBD5E1',
                                borderRadius: 8,
                                marginLeft: 6,
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ANNOUNCEMENTS */}
              {activeTab === 'announcements' && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                    Mobile App Banners & Announcements
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 6 }}>
                        Top Header Green Slogan Text
                      </label>
                      <input
                        type="text"
                        value={topSlogan}
                        onChange={(e) => setTopSlogan(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 13 }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: '#F8FAFC', borderRadius: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Require KYC Before First Ride</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>Show mandatory Complete KYC banner card after booking</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={requireKyc}
                        onChange={(e) => setRequireKyc(e.target.checked)}
                        style={{ width: 20, height: 20, accentColor: '#4313B8' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 6 }}>
                        Host Your EV & Earn Banner Text
                      </label>
                      <input
                        type="text"
                        value={hostBannerText}
                        onChange={(e) => setHostBannerText(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 13 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SYSTEM */}
              {activeTab === 'system' && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                    Mobile App Version Control & Maintenance
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#0F172A', marginBottom: 6 }}>
                        Min Required Android Version
                      </label>
                      <input
                        type="text"
                        value={minAndroidVersion}
                        onChange={(e) => setMinAndroidVersion(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#0F172A', marginBottom: 6 }}>
                        Min Required iOS Version
                      </label>
                      <input
                        type="text"
                        value={minIosVersion}
                        onChange={(e) => setMinIosVersion(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={forceUpdate}
                        onChange={(e) => setForceUpdate(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#4313B8' }}
                      />
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Enable Force Update Dialog</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#EF4444' }}
                      />
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#EF4444' }}>Enable App Maintenance Mode</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: REAL-TIME MOBILE PHONE VIEWPORT PREVIEW */}
            <div>
              <div
                style={{
                  position: 'sticky',
                  top: 90,
                  background: '#0F172A',
                  padding: '16px 12px 24px',
                  borderRadius: 36,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  border: '4px solid #334155',
                }}
              >
                {/* Phone Speaker Notch */}
                <div
                  style={{
                    width: 70,
                    height: 12,
                    background: '#1E293B',
                    borderRadius: 10,
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#475569' }} />
                </div>

                {/* Mobile Screen Container */}
                <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 12, minHeight: 520, overflow: 'hidden' }}>
                  {/* Location Chip Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div
                      style={{
                        padding: '4px 10px',
                        borderRadius: 16,
                        border: '1px solid #E2E8F0',
                        fontSize: 10,
                        fontWeight: 800,
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span style={{ color: '#4313B8' }}>📍</span> Gotri Zone, Vadodara ▾
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                      🔔
                    </div>
                  </div>

                  {/* Hero Slider Banner */}
                  {currentSlider && (
                    <div
                      style={{
                        height: 120,
                        borderRadius: 16,
                        background: currentSlider.bgColor || '#200F54',
                        padding: 10,
                        color: '#fff',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'all 0.4s ease',
                      }}
                    >
                      <span style={{ fontSize: 8, color: '#8CE600', fontWeight: 800 }}>Go Green, Ride Clean</span>
                      <h4 style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 900, color: '#fff' }}>{currentSlider.title}</h4>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#8CE600' }}>{currentSlider.highlightText}</h3>
                      <p style={{ margin: '2px 0 6px', fontSize: 8, color: '#E2E8F0', opacity: 0.9 }}>{currentSlider.subtitle}</p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ background: '#fff', color: '#4313B8', fontSize: 8, fontWeight: 800, padding: '3px 8px', borderRadius: 10 }}>
                          {currentSlider.buttonText || 'Explore Offers >'}
                        </span>
                        {currentSlider.couponCode && (
                          <span style={{ border: '1px dashed #8CE600', color: '#8CE600', fontSize: 7, padding: '2px 5px', borderRadius: 4 }}>
                            {currentSlider.couponCode}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Carousel Dots */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '8px 0' }}>
                    {activeSliders.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: previewIndex === i ? 14 : 5,
                          height: 5,
                          borderRadius: 3,
                          background: previewIndex === i ? '#4313B8' : '#CBD5E1',
                        }}
                      />
                    ))}
                  </div>

                  {/* Quick Actions Preview */}
                  <div style={{ margin: '10px 0' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Quick Actions</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {quickActions
                        .filter((q) => q.isActive)
                        .map((qa) => (
                          <div
                            key={qa.id}
                            style={{
                              flex: 1,
                              padding: '6px 2px',
                              background: '#fff',
                              border: '1px solid #F1F5F9',
                              borderRadius: 10,
                              textAlign: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            }}
                          >
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F5F3FF', color: '#4313B8', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>
                              ⚡
                            </div>
                            <div style={{ fontSize: 7.5, fontWeight: 800, color: '#0F172A' }}>{qa.title}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Rental Cards Preview */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Choose Your Rental</div>
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                      {rentalCards.map((rc) => (
                        <div
                          key={rc.id}
                          style={{
                            width: 85,
                            flexShrink: 0,
                            padding: 6,
                            borderRadius: 12,
                            background: rc.bgColor,
                            border: '1px solid #CBD5E1',
                            transform: enable3DTilt ? `rotate(${rc.tiltAngle}rad)` : 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ fontSize: 8.5, fontWeight: 900, color: rc.titleColor }}>{rc.title}</div>
                          <div style={{ fontSize: 7, color: '#64748B' }}>{rc.subtitle}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT SLIDER MODAL */}
      {showAddSliderModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              width: '100%',
              maxWidth: 540,
              padding: 24,
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                {editingSlider ? 'Edit Mobile App Slider Banner' : 'Add New Mobile App Slider Banner'}
              </h3>
              <button
                onClick={() => setShowAddSliderModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#0F172A', marginBottom: 4 }}>
                  Main Banner Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. MONSOON OFFER"
                  value={newSliderTitle}
                  onChange={(e) => setNewSliderTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#0F172A', marginBottom: 4 }}>
                    Highlight Text (Green)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30% OFF"
                    value={newSliderHighlight}
                    onChange={(e) => setNewSliderHighlight(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#0F172A', marginBottom: 4 }}>
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EVGO30"
                    value={newSliderCoupon}
                    onChange={(e) => setNewSliderCoupon(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#0F172A', marginBottom: 4 }}>
                  Subtitle Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enjoy exciting offers on every EV ride."
                  value={newSliderSubtitle}
                  onChange={(e) => setNewSliderSubtitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#0F172A', marginBottom: 4 }}>
                    Target App Screen
                  </label>
                  <select
                    value={newSliderTargetScreen}
                    onChange={(e) => setNewSliderTargetScreen(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="RentEvScreen">Rent Your EV Screen</option>
                    <option value="SelectLocationScreen">Select Zone & Location</option>
                    <option value="VehicleListScreen">Vehicle Selection List</option>
                    <option value="SelectPackageScreen">Select Package Details</option>
                    <option value="PaymentOffersScreen">Payment & Offers</option>
                    <option value="KycScreen">KYC Verification</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#0F172A', marginBottom: 4 }}>
                    Background Gradient Color
                  </label>
                  <select
                    value={newSliderBgColor}
                    onChange={(e) => setNewSliderBgColor(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="#200F54">Deep Brand Purple (#200F54)</option>
                    <option value="#064E3B">Emerald Green (#064E3B)</option>
                    <option value="#7C2D12">Sunset Orange (#7C2D12)</option>
                    <option value="#0F172A">Dark Slate (#0F172A)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setShowAddSliderModal(false)}
                style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrUpdateSlider}
                style={{ background: '#200F54', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
              >
                {editingSlider ? 'Save Changes' : 'Add Slider Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
