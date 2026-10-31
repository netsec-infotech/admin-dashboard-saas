'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default function VehiclesHubPage() {
  const [stats] = useState({
    total: 124,
    available: 86,
    onRide: 29,
    maintenance: 9,
    lowBattery: 4
  });

  const cards = [
    {
      title: 'Vehicle Fleet List',
      description: 'Manage individual vehicles, VIN numbers, registration, IoT devices and telemetry status.',
      href: '/vehicles/all',
      badge: 'All Vehicles',
      badgeColor: '#EEF2FF',
      badgeTextColor: '#4F46E5',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      )
    },
    {
      title: 'Vehicle Models & Media',
      description: 'Configure EV scooter models, battery capacity specs, marketing brochures, and gallery images.',
      href: '/vehicles/models',
      badge: 'Catalog & Specs',
      badgeColor: '#ECFDF5',
      badgeTextColor: '#059669',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 5.5l3-5.5h3" />
          <path d="M5.5 17.5l4-8h4l2.5 8" />
        </svg>
      )
    },
    {
      title: 'Live GPS Vehicle Map',
      description: 'Real-time telemetry, live fleet locations, geofence status, and active route traces.',
      href: '/vehicles/map',
      badge: 'Real-time Map',
      badgeColor: '#EFF6FF',
      badgeTextColor: '#2563EB',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      )
    },
    {
      title: 'Active Rides Tracker',
      description: 'Live ongoing rentals, current rider info, elapsed duration, battery levels and geofence alerts.',
      href: '/vehicles/active',
      badge: 'Live Trips',
      badgeColor: '#FEF3C7',
      badgeTextColor: '#D97706',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      title: 'Ride & Battery History',
      description: 'Comprehensive historical ride logs, trip mileage, battery consumption curves and revenue generated.',
      href: '/vehicles/history',
      badge: 'Historical Logs',
      badgeColor: '#F3E8FF',
      badgeTextColor: '#7C3AED',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20v-6M6 20V10M18 20V4" />
        </svg>
      )
    },
    {
      title: 'Add New EV Vehicle',
      description: 'Inward a newly procured electric vehicle into your zone with plate, chassis, and IoT assignment.',
      href: '/vehicles/add',
      badge: 'Inward Unit',
      badgeColor: '#DCFCE7',
      badgeTextColor: '#16A34A',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        
        <main style={{ padding: '24px 32px 60px', flex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Dashboard</Link>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: 700 }}>Vehicles Fleet Hub</span>
          </div>

          {/* Title Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E1548', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                Vehicles Fleet Management
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                Centralized operations center for EV scooter models, fleet inventory, active trips, and real-time GPS tracking.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link
                href="/vehicles/models"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '10px',
                  color: '#1E1548',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <span>🛵 View Models</span>
              </Link>

              <Link
                href="/vehicles/all"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#1E1548',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(30, 21, 72, 0.25)'
                }}
              >
                <span>Open Vehicle List &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Fleet</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E1548', marginTop: '4px' }}>{stats.total}</div>
              <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginTop: '2px' }}>100% EV Ready</div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available at Hubs</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>{stats.available}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Ready for dispatch</div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active on Road</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>{stats.onRide}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Live rented scooters</div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Service / Bay</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>{stats.maintenance}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Routine inspection</div>
            </div>
          </div>

          {/* Module Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {cards.map((card, idx) => (
              <Link
                key={idx}
                href={card.href}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '22px',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: card.badgeColor,
                      color: card.badgeTextColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {card.icon}
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: card.badgeColor,
                      color: card.badgeTextColor
                    }}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1E1548', margin: '0 0 8px 0' }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                    {card.description}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '20px',
                  paddingTop: '14px',
                  borderTop: '1px solid #F1F5F9',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#16A34A'
                }}>
                  <span>Access Module</span>
                  <span>&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
