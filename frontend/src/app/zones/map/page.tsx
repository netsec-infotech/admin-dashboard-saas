"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.zm-page {
  display: flex;
  min-height: 100vh;
  background: #F8F9FF;
  font-family: 'Inter', sans-serif;
}
.zm-main {
  margin-left: 230px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100% - 230px);
}
.zm-body {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Breadcrumb */
.zm-bc {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}
.zm-bc-link {
  color: #2A195C;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}
.zm-bc-sep {
  color: #CBD5E1;
}
.zm-bc-cur {
  color: #0F172A;
  font-weight: 700;
}

/* Header Row */
.zm-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-top: -4px;
}
.zm-h1 {
  font-size: 24px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.02em;
}
.zm-sub {
  font-size: 13px;
  color: #64748B;
  margin: 4px 0 0;
  font-weight: 500;
}

/* Actions */
.zm-btn-primary {
  background: #2A195C;
  border: 1.5px solid #2A195C;
  color: #FFF;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  height: 40px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all .15s;
}
.zm-btn-primary:hover {
  background: #1E1145;
  border-color: #1E1145;
}

/* Map Container Layout */
.zm-map-container {
  height: calc(100vh - 200px);
  min-height: 500px;
  border-radius: 16px;
  border: 1.5px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0,0,0,.01);
  background: #EAEAEA;
  position: relative;
  overflow: hidden;
}
.zm-map-element {
  width: 100%;
  height: 100%;
}

/* Custom Marker Styles */
.zm-custom-marker {
  background: none;
  border: none;
}
.zm-marker-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  position: relative;
  border: 2px solid white;
}
.zm-marker-label {
  position: absolute;
  left: 38px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #0F172A;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  border: 1px solid #E2E8F0;
}

/* CP Bus popup label */
.zm-popup-card {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 8px;
  padding: 6px 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
  border: 1px solid #E2E8F0;
  text-align: center;
  z-index: 1000;
  white-space: nowrap;
}
.zm-popup-title {
  font-size: 11.5px;
  font-weight: 800;
  color: #0F172A;
}
.zm-popup-sub {
  font-size: 9.5px;
  color: #64748B;
  font-weight: 600;
  margin-top: 1px;
}

/* Control elements matching mockup */
.zm-ctrl-layers {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: white;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.zm-ctrl-zoom-box {
  position: absolute;
  bottom: 90px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.zm-ctrl-btn {
  background: white;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  font-size: 18px;
  font-weight: 600;
  color: #475569;
}
.zm-ctrl-btn:hover, .zm-ctrl-layers:hover {
  background: #F8FAFC;
  border-color: #2A195C;
  color: #2A195C;
}
.zm-ctrl-locate {
  position: absolute;
  bottom: 30px;
  right: 20px;
  z-index: 1000;
}
`;

export default function ZoneMapPage() {
  const router = useRouter();
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef<any>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded) return;
    const L = (window as any).L;
    if (!L) return;

    const container = document.getElementById('mockup-zone-map');
    if (!container || mapRef.current) return;

    // Center coordinates for Vadodara Gotri - Manjalpur - KPGU zones
    const cpCenter = [22.3072, 73.1812];

    const map = L.map('mockup-zone-map', {
      center: cpCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });
    mapRef.current = map;

    // Use light CartoDB Positron basemap matching mockup's light theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    // Manjalpur Zone Marker (Green, circular, "MJ")
    const kbIcon = L.divIcon({
      html: `
        <div class="zm-marker-circle" style="background: #10B981;">MJ</div>
        <div class="zm-marker-label">Manjalpur Zone</div>
      `,
      className: 'zm-custom-marker',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    L.marker([22.2700, 73.1950], { icon: kbIcon }).addTo(map);

    // KPGU Zone Marker (Red, circular, "KP")
    const pmIcon = L.divIcon({
      html: `
        <div class="zm-marker-circle" style="background: #EF4444;">KP</div>
        <div class="zm-marker-label">KPGU Zone</div>
      `,
      className: 'zm-custom-marker',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    L.marker([22.3400, 73.2200], { icon: pmIcon }).addTo(map);

    // Gotri Zone Marker (Purple, circular, Bus symbol, dashed radius, EVM1024011 popup label)
    const cpIcon = L.divIcon({
      html: `
        <div class="zm-marker-circle" style="background: #2A195C;">🛵</div>
        <div class="zm-marker-label" style="color: #2A195C; font-weight: 800;">Gotri Zone</div>
        <div class="zm-popup-card">
          <div class="zm-popup-title">EVM1024011</div>
          <div class="zm-popup-sub">● 25 km/h</div>
        </div>
      `,
      className: 'zm-custom-marker',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    L.marker([22.3160, 73.1550], { icon: cpIcon }).addTo(map);

    // Dashed radius circle surrounding Gotri Zone
    L.circle([22.3160, 73.1550], {
      color: '#3B82F6',
      fillColor: '#3B82F6',
      fillOpacity: 0.05,
      radius: 800,
      weight: 1.5,
      dashArray: '5, 5'
    }).addTo(map);

    // Polyline connector (Purple path Manjalpur -> Gotri -> KPGU)
    const routeCoords = [
      [22.2700, 73.1950], // Manjalpur
      [22.2900, 73.1700], // Midpoint curve
      [22.3160, 73.1550], // Gotri
      [22.3400, 73.2200]  // KPGU
    ];
    L.polyline(routeCoords, {
      color: '#2A195C',
      weight: 4.5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

  }, [leafletLoaded]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    mapRef.current?.setView([28.6304, 77.2177], 14);
  };

  return (
    <div className="zm-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Sidebar activePath="/zones/map" />

      <div className="zm-main">
        <TopBar 
          notificationCount={3}
          hideZone={false}
        />

        <div className="zm-body">
          {/* Breadcrumb */}
          <div className="zm-bc">
            <span className="zm-bc-link" onClick={() => router.push('/')}>Home</span>
            <span className="zm-bc-sep">&gt;</span>
            <span className="zm-bc-link" onClick={() => router.push('/zones')}>Zone Management</span>
            <span className="zm-bc-sep">&gt;</span>
            <span className="zm-bc-cur">Zone Map</span>
          </div>

          {/* Header Row */}
          <div className="zm-header-row">
            <div>
              <h1 className="zm-h1">Zone Map</h1>
              <p className="zm-sub">Real-time live map of active operational zones and transit vehicles.</p>
            </div>
            <div>
              <button className="zm-btn-primary" onClick={() => router.push('/zones/new')}>
                + Draw New Zone
              </button>
            </div>
          </div>

          {/* Map Container Element */}
          <div className="zm-map-container">
            <div id="mockup-zone-map" className="zm-map-element" />

            {/* Layer button top right */}
            <div className="zm-ctrl-layers" title="Map Layers">
              🥞
            </div>

            {/* Zoom controls bottom right */}
            <div className="zm-ctrl-zoom-box">
              <button className="zm-ctrl-btn" onClick={handleZoomIn} title="Zoom In">+</button>
              <button className="zm-ctrl-btn" onClick={handleZoomOut} title="Zoom Out">−</button>
            </div>

            {/* GPS re-center locator bottom right */}
            <div className="zm-ctrl-locate">
              <button className="zm-ctrl-btn" onClick={handleRecenter} title="Re-center Map">
                🎯
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
