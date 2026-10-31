'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default function ThemeSettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("sidebar_theme") || "light";
      setTheme(savedTheme as 'light' | 'dark');
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem("sidebar_theme", newTheme);
    window.dispatchEvent(new Event("sidebar_theme_changed"));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F4F9', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <main style={{ marginLeft: '230px', flex: 1, display: 'flex', flexDirection: 'column', width: 'calc(100% - 230px)' }}>
        <TopBar />
        <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Theme Settings</h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, fontWeight: 400 }}>Configure the appearance and visual branding of the Evegah dashboard.</p>
          </div>

          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,.02)', maxWidth: '700px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', margin: '0 0 4px' }}>Sidebar Customization</h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px' }}>Choose the background style and color mode for the main navigation panel.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Light Theme Card */}
              <div 
                onClick={() => handleThemeChange('light')}
                style={{
                  border: `2px solid ${theme === 'light' ? '#2a195c' : '#E2E8F0'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  background: '#FFF',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: theme === 'light' ? '0 4px 6px -1px rgba(42, 25, 92, 0.05)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>Light Appearance (Default)</span>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${theme === 'light' ? '#2a195c' : '#CBD5E1'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FFF'
                  }}>
                    {theme === 'light' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2a195c' }} />}
                  </div>
                </div>
                {/* Mock Sidebar Preview */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', height: '90px', display: 'flex', overflow: 'hidden' }}>
                  <div style={{ width: '45px', background: '#FFF', borderRight: '1px solid #E5E7EB', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ height: '7px', background: '#2a195c', borderRadius: '2px', width: '90%' }} />
                    <div style={{ height: '4px', background: '#E5E7EB', width: '80%', borderRadius: '1px' }} />
                    <div style={{ height: '4px', background: '#E5E7EB', width: '60%', borderRadius: '1px' }} />
                    <div style={{ height: '4px', background: '#E5E7EB', width: '70%', borderRadius: '1px' }} />
                  </div>
                  <div style={{ flex: 1, padding: '10px' }}>
                    <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '2px', width: '40%', marginBottom: '6px' }} />
                    <div style={{ height: '24px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>

              {/* Dark Theme Card */}
              <div 
                onClick={() => handleThemeChange('dark')}
                style={{
                  border: `2px solid ${theme === 'dark' ? '#2a195c' : '#E2E8F0'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  background: '#FFF',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: theme === 'dark' ? '0 4px 6px -1px rgba(42, 25, 92, 0.05)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>Dark Appearance (bg-2a195c)</span>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${theme === 'dark' ? '#2a195c' : '#CBD5E1'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FFF'
                  }}>
                    {theme === 'dark' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2a195c' }} />}
                  </div>
                </div>
                {/* Mock Sidebar Preview */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', height: '90px', display: 'flex', overflow: 'hidden' }}>
                  <div style={{ width: '45px', background: '#2a195c', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ height: '7px', background: '#FFF', borderRadius: '2px', width: '90%' }} />
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.3)', width: '80%', borderRadius: '1px' }} />
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.3)', width: '60%', borderRadius: '1px' }} />
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.3)', width: '70%', borderRadius: '1px' }} />
                  </div>
                  <div style={{ flex: 1, padding: '10px' }}>
                    <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '2px', width: '40%', marginBottom: '6px' }} />
                    <div style={{ height: '24px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
