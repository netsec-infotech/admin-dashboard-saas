'use client';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { ReactNode } from 'react';


const shellCss = `
.ops-shell{display:flex;min-height:100vh;background:#F3F4F9;font-family:'Plus Jakarta Sans',Inter,sans-serif;color:#0F172A;}
.ops-main{margin-left:240px;display:flex;flex-direction:column;min-height:100vh;width:calc(100% - 240px);}
.ops-page{flex:1;padding:20px 28px 60px;}
.ops-bc{display:flex;align-items:center;gap:6px;font-size:12px;color:#9CA3AF;margin-bottom:10px;}
.ops-bc a{color:#9CA3AF;text-decoration:none;}
.ops-h1{font-size:22px;font-weight:800;margin:0 0 4px;color:#111827;}
.ops-sub{font-size:13px;color:#6B7280;margin:0 0 18px;}
.ops-card{background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(0,0,0,.05);}
.ops-grid{display:grid;gap:14px;}
.ops-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px;}
.ops-stat{background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:12px 14px;}
.ops-stat-lbl{font-size:11px;color:#9CA3AF;font-weight:600;margin-bottom:4px;}
.ops-stat-val{font-size:20px;font-weight:800;color:#111827;}
.ops-btn{border:none;border-radius:10px;padding:9px 14px;font-weight:700;font-size:13px;cursor:pointer;background:#2A195C;color:#fff;}
.ops-btn.secondary{background:#fff;color:#2A195C;border:1.5px solid #E5E7EB;}
.ops-btn.danger{background:#DC2626;}
.ops-btn:disabled{opacity:.55;cursor:not-allowed;}
.ops-table{width:100%;border-collapse:collapse;font-size:13px;}
.ops-table th{text-align:left;padding:10px 8px;border-bottom:1px solid #E5E7EB;color:#6B7280;font-size:11px;text-transform:uppercase;letter-spacing:.04em;}
.ops-table td{padding:10px 8px;border-bottom:1px solid #F3F4F6;vertical-align:top;}
.ops-badge{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;}
.ops-badge.ok{background:#ECFDF5;color:#047857;}
.ops-badge.warn{background:#FFFBEB;color:#B45309;}
.ops-badge.bad{background:#FEF2F2;color:#B91C1C;}
.ops-badge.muted{background:#F3F4F6;color:#4B5563;}
.ops-badge.info{background:#EEF2FF;color:#3730A3;}
.ops-input,.ops-select,.ops-textarea{width:100%;border:1.5px solid #E5E7EB;border-radius:10px;padding:9px 12px;font-size:13px;outline:none;}
.ops-textarea{min-height:80px;resize:vertical;}
.ops-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
.ops-muted{color:#6B7280;font-size:12px;}
@media (max-width:900px){.ops-main{margin-left:0;width:100%;}.ops-page{padding:16px;}}
`;

export default function OpsPageShell({
  title,
  subtitle,
  breadcrumb,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="ops-shell">
      <style>{shellCss}</style>
      <Sidebar />
      <div className="ops-main">
        <TopBar />
        <div className="ops-page">
          {breadcrumb || <div className="ops-bc"><a href="/">Dashboard</a><span>/</span><span>{title}</span></div>}
          <div className="ops-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <h1 className="ops-h1">{title}</h1>
              {subtitle ? <p className="ops-sub">{subtitle}</p> : null}
            </div>
            {actions}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
