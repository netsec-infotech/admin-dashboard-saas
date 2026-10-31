"use client";
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.io-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.io-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.io-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Map card */
.map-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 500px; }
.map-hdr { padding: 14px 18px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between; }
.map-title { font-size: 14px; font-weight: 800; color: #0F172A; }
.map-body { flex: 1; background: #F1F5F9; position: relative; overflow: hidden; }
.map-canvas-container { position: absolute; inset: 0; }

.map-tag { position: absolute; background: #fff; border: 1px solid #E2E8F0; border-radius: 6px; padding: 4px 8px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.tag-online { border-left: 3px solid #10B981; }
.tag-offline { border-left: 3px solid #64748B; }
.tag-dot { width: 5px; height: 5px; border-radius: 50%; }
.dot-online { background: #10B981; }
.dot-offline { background: #64748B; }

.map-controls { position: absolute; left: 16px; top: 16px; display: flex; flex-direction: column; gap: 6px; z-index: 5; }
.map-ctrl-btn { width: 30px; height: 30px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #475569; font-weight: bold; font-size: 16px; cursor: pointer; transition: all 0.15s; }
.map-ctrl-btn:hover { border-color: #6366F1; color: #6366F1; }
`;

export default function DeviceMapPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="io-shell">
        <Sidebar activePath="/iot-devices/map" />
        <div className="io-main">
          <TopBar title="IoT Device Map" subtitle="Geolocate all devices on the interactive coordinate system." showHand={false} />
          
          <div className="io-page">
            <div className="map-card">
              <div className="map-hdr">
                <span className="map-title">Device Telemetry Stream</span>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>● LIVE UPDATES</span>
              </div>
              <div className="map-body">
                <div className="map-controls">
                  <button className="map-ctrl-btn">+</button>
                  <button className="map-ctrl-btn">-</button>
                </div>

                <div className="map-canvas-container">
                  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                    {/* Geofence area */}
                    <polygon points="120 80, 220 50, 290 120, 190 160" fill="rgba(99, 102, 241, 0.06)" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
                    
                    {/* Grid lines */}
                    <path d="M 50 0 L 50 600 M 150 0 L 150 600 M 250 0 L 250 600 M 350 0 L 350 600" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    
                    {/* Track lines */}
                    <path d="M 80 140 C 130 100, 180 120, 230 150 C 270 170, 310 140, 350 180" fill="none" stroke="#6366F1" strokeWidth="1.8" strokeDasharray="4 4" />

                    {/* Nodes */}
                    <circle cx="80" cy="140" r="5" fill="#10B981" stroke="#fff" strokeWidth="1.5" />
                    <text x="80" y="155" fontSize="9" fill="#64748B" fontWeight="bold" textAnchor="middle">Hub Alpha</text>

                    <circle cx="230" cy="150" r="5" fill="#6366F1" stroke="#fff" strokeWidth="1.5" />
                    <text x="230" y="138" fontSize="9" fill="#1E293B" fontWeight="800" textAnchor="middle">Hub Beta</text>
                  </svg>

                  <div className="map-tag tag-online" style={{ left: '160px', top: '75px' }}>
                    <span className="tag-dot dot-online" />
                    <span>IOT-9182</span>
                  </div>

                  <div className="map-tag tag-online" style={{ left: '260px', top: '150px' }}>
                    <span className="tag-dot dot-online" />
                    <span>IOT-4821</span>
                  </div>

                  <div className="map-tag tag-offline" style={{ left: '90px', top: '220px' }}>
                    <span className="tag-dot dot-offline" />
                    <span>IOT-3011</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
