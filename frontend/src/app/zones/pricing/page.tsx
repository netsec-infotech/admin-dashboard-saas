"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Link from 'next/link';
import { api } from '@/lib/api';

const DEFAULT_PRICING_CONFIGS: any[] = [];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.zp-shell { display: flex; min-height: 100vh; background: #F8F9FF; font-family: 'Inter', sans-serif; }
.zp-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.zp-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Breadcrumb */
.zp-bc { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748B; font-weight: 500; }
.zp-bc a { color: #8B5CF6; text-decoration: none; font-weight: 600; transition: color .15s; }
.zp-bc a:hover { color: #6D28D9; }
.zp-bc-sep { color: #D8B4FE; font-weight: 600; }
.zp-bc-cur { color: #0F172A; font-weight: 700; }

/* Header title */
.zp-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-top: -4px; }
.zp-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 6px; letter-spacing: -0.02em; }
.zp-sub { font-size: 13.5px; color: #64748B; margin: 0; font-weight: 500; }

.zp-btn-primary { 
  display: inline-flex; 
  align-items: center; 
  gap: 8px; 
  padding: 10px 18px; 
  background: #2a195c; 
  color: #fff; 
  border: 1.5px solid #2a195c; 
  border-radius: 8px; 
  font-size: 13px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: all .15s; 
  text-decoration: none;
}
.zp-btn-primary:hover { background: #1e1145; border-color: #1e1145; }

/* Filters Bar */
.zp-filters-row { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
.zp-search-wrap { position: relative; width: 280px; }
.zp-search-ic { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94A3B8; display: flex; align-items: center; }
.zp-search-inp { width: 100%; padding: 10px 12px 10px 36px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; font-weight: 500; color: #1E293B; transition: border-color .15s; }
.zp-search-inp:focus { border-color: #2a195c; }
.zp-search-inp::placeholder { color: #94A3B8; }

.zp-btn-filter { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; transition: all .15s; }
.zp-btn-filter:hover { border-color: #2a195c; color: #2a195c; background: #FAFBFD; }

/* Table Section */
.zp-table-container { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.zp-table { width: 100%; border-collapse: collapse; text-align: left; }
.zp-table th { background: #FAFBFD; border-bottom: 1.5px solid #E2E8F0; padding: 14px 18px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
.zp-table td { padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #1E293B; vertical-align: middle; }
.zp-table tr:last-child td { border-bottom: none; }
.zp-table tr:hover td { background-color: #FAFBFD; }

/* Subtitle/Sublabel for columns */
.zp-cell-title { font-weight: 700; color: #1F2937; }
.zp-cell-sub { font-size: 11px; color: #6B7280; font-weight: 500; margin-top: 2px; }

/* Badges */
.zp-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.zp-badge-hourly { background: #DEF7EC; color: #03543F; }
.zp-badge-package { background: #E1EFFE; color: #1E429F; }
.zp-badge-minute { background: #FAF5FF; color: #6D28D9; border: 1px solid #DDD6FE; }

.zp-status { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.zp-status-active { background: #DEF7EC; color: #03543F; }
.zp-status-inactive { background: #FDE8E8; color: #9B1C1C; }

/* Action dots button */
.zp-action-btn { background: none; border: none; cursor: pointer; color: #64748B; width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; }
.zp-action-btn:hover { background: #F1F5F9; color: #0F172A; }

.zp-action-wrap { position: relative; display: inline-block; }
.zp-dropdown { position: absolute; right: 0; top: 100%; width: 140px; background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,.08); z-index: 50; padding: 6px 0; margin-top: 4px; }
.zp-dropdown-item { width: 100%; text-align: left; padding: 8px 12px; background: none; border: none; font-size: 12.5px; font-weight: 600; color: #374151; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.zp-dropdown-item:hover { background: #F5F3FF; color: #6D28D9; }
.zp-dropdown-item-danger { color: #EF4444; }
.zp-dropdown-item-danger:hover { background: #FEF2F2; color: #EF4444; }

/* Pagination */
.zp-pag-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-top: 1px solid #E2E8F0; background: #fff; font-size: 12.5px; color: #475569; font-weight: 500; }
.zp-pag-controls { display: flex; align-items: center; gap: 6px; }
.zp-pag-btn { width: 30px; height: 30px; border-radius: 6px; border: 1.5px solid #E2E8F0; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12.5px; font-weight: 700; color: #475569; transition: all .15s; }
.zp-pag-btn:hover { border-color: #2a195c; color: #2a195c; }
.zp-pag-btn.active { background: #2a195c; border-color: #2a195c; color: #fff; }
.zp-pag-btn:disabled { opacity: 0.5; cursor: not-allowed; border-color: #E2E8F0; color: #94A3B8; }
.zp-pag-select { padding: 6px 10px; border: 1.5px solid #E2E8F0; border-radius: 6px; font-size: 12.5px; font-weight: 600; color: #475569; background: #fff; cursor: pointer; outline: none; }
.zp-pag-select:focus { border-color: #2a195c; }

.zp-select-filter {
  padding: 10px 16px;
  background: #fff;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  outline: none;
  transition: all .15s;
}
.zp-select-filter:focus {
  border-color: #2a195c;
}
`;

export default function ZonePricingPage() {
  const router = useRouter();
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pricingModelFilter, setPricingModelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [detailConfig, setDetailConfig] = useState<any | null>(null);

  const fetchZones = () => {
    setLoading(true);
    api.get('/zones')
      .then(res => {
        if (res && res.data) {
          setZones(res.data);
        }
      })
      .catch(err => {
        console.error('Error fetching zones:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const closeAll = () => setActiveMenuId(null);
    document.addEventListener('click', closeAll);
    return () => document.removeEventListener('click', closeAll);
  }, []);

  const handleActionClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this pricing configuration?')) {
      try {
        const zone = zones.find(z => String(z.id) === String(id));
        if (!zone) return;
        const payload = { ...zone, pricing: {} };
        const res = await api.put(`/zones/${id}`, payload);
        if (res && res.status === 'success') {
          alert('Pricing configuration deleted successfully!');
          fetchZones();
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete pricing');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete the pricing configurations for the ${selectedIds.length} selected zones?`)) {
      try {
        for (const id of selectedIds) {
          const zone = zones.find(z => String(z.id) === String(id));
          if (zone) {
            const payload = { ...zone, pricing: {} };
            await api.put(`/zones/${id}`, payload);
          }
        }
        alert('Selected pricing configurations deleted successfully!');
        setSelectedIds([]);
        fetchZones();
      } catch (err) {
        console.error(err);
        alert('Failed to complete bulk delete');
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredConfigs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredConfigs.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Map database zones to configs format
  const configs = useMemo(() => {
    return zones
      .filter(z => z.pricing && z.pricing.pricingModel)
      .map(z => ({
        id: String(z.id),
        zoneName: z.name,
        city: z.city || 'N/A',
        pricingModel: z.pricing.pricingModel,
        basePrice: z.pricing.basePrice,
        extraPrice: z.pricing.extraPrice,
        ratePerMinute: z.pricing.ratePerMinute || z.pricing.basePrice,
        unlockFee: z.pricing.unlockFee || z.pricing.extraPrice,
        minMinutes: z.pricing.minMinutes,
        gracePeriod: z.pricing.gracePeriod,
        packageDetails: z.pricing.packageDetails || [],
        status: z.status === 'active' ? 'Active' : 'Inactive',
        lastUpdated: z.updated_at ? new Date(z.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
        updatedBy: z.manager || 'Admin',
        notes: z.pricing.notes || '',
        hourlyPricing: z.pricing.hourlyPricing || [],
        packages: z.pricing.packages || []
      }));
  }, [zones]);

  // Filter and Search Logic
  const filteredConfigs = useMemo(() => {
    return configs.filter(c => {
      const matchesSearch = c.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModel = pricingModelFilter === 'All' || c.pricingModel === pricingModelFilter;
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesModel && matchesStatus;
    });
  }, [configs, searchQuery, pricingModelFilter, statusFilter]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="zp-shell">
        <Sidebar activePath="/zones/pricing" />
        <div className="zp-main">
          <TopBar />
          
          <div className="zp-page">
            {/* Breadcrumb */}
            <div className="zp-bc">
              <Link href="/">Dashboard</Link>
              <span className="zp-bc-sep">&gt;</span>
              <span>Operations</span>
              <span className="zp-bc-sep">&gt;</span>
              <span className="zp-bc-cur">Zone Pricing</span>
            </div>

            {/* Title Row */}
            <div className="zp-title-row">
              <div>
                <h1 className="zp-h1">Zone Based Price Configuration</h1>
                <p className="zp-sub">Configure pricing model and rates for each zone. Choose between hourly based or package based pricing.</p>
              </div>
              <button 
                onClick={() => router.push('/zones/pricing/new')}
                className="zp-btn-primary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span style={{ verticalAlign: 'middle' }}>Add Zone Pricing</span>
              </button>
            </div>

            {/* Filters Row */}
            <div className="zp-filters-row">
              <div className="zp-search-wrap">
                <span className="zp-search-ic">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  className="zp-search-inp" 
                  placeholder="Search by zone name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select 
                className="zp-select-filter" 
                value={pricingModelFilter} 
                onChange={(e) => setPricingModelFilter(e.target.value)}
              >
                <option value="All">All Pricing Models</option>
                <option value="Hourly Based">Hourly Based</option>
                <option value="Minute Based">Minute Based</option>
                <option value="Package Based">Package Based</option>
              </select>

              <select 
                className="zp-select-filter" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              {selectedIds.length > 0 && (
                <button 
                  className="zp-btn-filter" 
                  onClick={handleBulkDelete}
                  style={{ borderColor: '#EF4444', color: '#EF4444', background: '#FEF2F2' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete Selected ({selectedIds.length})
                </button>
              )}
            </div>

            {/* Table */}
            <div className="zp-table-container">
              <table className="zp-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={filteredConfigs.length > 0 && selectedIds.length === filteredConfigs.length} 
                        onChange={toggleSelectAll} 
                        style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                      />
                    </th>
                    <th>Zone Name</th>
                    <th>Pricing Model</th>
                    <th>Base Price</th>
                    <th>Extra Price</th>
                    <th>Package Details</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontWeight: 500 }}>
                        Loading configurations...
                      </td>
                    </tr>
                  ) : filteredConfigs.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontWeight: 500 }}>
                        No zone pricing configurations found.
                      </td>
                    </tr>
                  ) : (
                    filteredConfigs.map((config) => (
                      <tr key={config.id}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(config.id)} 
                            onChange={() => toggleSelect(config.id)} 
                            style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                          />
                        </td>
                        <td>
                          <div className="zp-cell-title">{config.zoneName}</div>
                          <div className="zp-cell-sub">{config.city}</div>
                        </td>
                        <td>
                          <span className={`zp-badge ${config.pricingModel === 'Hourly Based' ? 'zp-badge-hourly' : config.pricingModel === 'Minute Based' ? 'zp-badge-minute' : 'zp-badge-package'}`}>
                            {config.pricingModel}
                          </span>
                        </td>
                        <td>
                          {config.pricingModel === 'Hourly Based' ? (
                            <div>
                              <span style={{ fontWeight: 700 }}>₹{config.basePrice}</span>
                              <div className="zp-cell-sub">Per Hour</div>
                            </div>
                          ) : config.pricingModel === 'Minute Based' ? (
                            <div>
                              <span style={{ fontWeight: 700 }}>₹{config.ratePerMinute || config.basePrice || '1.50'}</span>
                              <div className="zp-cell-sub">Per Minute</div>
                            </div>
                          ) : (
                            <span style={{ color: '#9CA3AF', fontWeight: 500 }}>-</span>
                          )}
                        </td>
                        <td>
                          {config.pricingModel === 'Hourly Based' ? (
                            <div>
                              <span style={{ fontWeight: 700 }}>₹{config.extraPrice}</span>
                              <div className="zp-cell-sub">Per Extra 15 min</div>
                            </div>
                          ) : config.pricingModel === 'Minute Based' ? (
                            <div>
                              <span style={{ fontWeight: 700 }}>₹{config.unlockFee || '10'}</span>
                              <div className="zp-cell-sub">Unlock Base Fee</div>
                            </div>
                          ) : (
                            <span style={{ color: '#9CA3AF', fontWeight: 500 }}>-</span>
                          )}
                        </td>
                        <td>
                          {config.pricingModel === 'Package Based' && config.packageDetails && config.packageDetails.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {config.packageDetails.slice(0, 3).map((det: string, idx: number) => (
                                <div key={idx} style={{ fontWeight: 600, fontSize: '12.5px' }}>{det}</div>
                              ))}
                              {config.packageDetails.length > 3 && (
                                <div className="zp-cell-sub" style={{ fontWeight: 600 }}>+{config.packageDetails.length - 3} more packages</div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#9CA3AF', fontWeight: 500 }}>-</span>
                          )}
                        </td>
                        <td>
                          <span className={`zp-status ${config.status === 'Active' ? 'zp-status-active' : 'zp-status-inactive'}`}>
                            {config.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{config.lastUpdated}</div>
                          <div className="zp-cell-sub">{config.updatedBy}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button 
                              onClick={() => router.push(`/zones/pricing/new?id=${config.id}`)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                background: '#EEF2FF',
                                border: '1.5px solid #C7D2FE',
                                borderRadius: '8px',
                                color: '#2a195c',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Edit Pricing
                            </button>
                            <button 
                              onClick={() => setDetailConfig(config)}
                              title="View Details"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                border: '1.5px solid #E2E8F0',
                                background: '#fff',
                                color: '#64748B',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(config.id)}
                              title="Delete Pricing"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                border: '1.5px solid #FEE2E2',
                                background: '#fff',
                                color: '#EF4444',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="zp-pag-row">
                <div>
                  Showing 1 to {filteredConfigs.length} of {filteredConfigs.length} zone pricing configurations
                </div>
                <div className="zp-pag-controls">
                  <button className="zp-pag-btn" disabled>&lt;</button>
                  <button className="zp-pag-btn active">1</button>
                  <button className="zp-pag-btn" disabled>&gt;</button>
                  <select className="zp-pag-select" defaultValue="10 per page" onChange={() => {}}>
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {detailConfig && (
        <div className="za-modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="za-modal" style={{ width: '500px', maxWidth: '95%', padding: '24px', borderRadius: '16px', background: '#FFF', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Pricing Details</h2>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0', fontWeight: 600 }}>Zone: {detailConfig.zoneName}</p>
              </div>
              <button
                onClick={() => setDetailConfig(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: '#64748B' }}>City:</span>
                <span style={{ fontWeight: 700 }}>{detailConfig.city}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: '#64748B' }}>Pricing Model:</span>
                <span className={`zp-badge ${detailConfig.pricingModel === 'Hourly Based' ? 'zp-badge-hourly' : 'zp-badge-package'}`} style={{ margin: 0 }}>
                  {detailConfig.pricingModel}
                </span>
              </div>

              <div>
                <span style={{ fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '6px' }}>Rate Configuration:</span>
                {detailConfig.pricingModel === 'Hourly Based' ? (
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Base Price:</span>
                      <span style={{ fontWeight: 700 }}>₹{detailConfig.basePrice} / hour</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Extra Price:</span>
                      <span style={{ fontWeight: 700 }}>₹{detailConfig.extraPrice} / 15 mins</span>
                    </div>
                    {detailConfig.hourlyPricing && detailConfig.hourlyPricing.length > 0 && (
                      <div style={{ marginTop: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                        <div style={{ fontWeight: 600, fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Hourly Config:</div>
                        {detailConfig.hourlyPricing.map((hp: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span>{hp.model}:</span>
                            <span style={{ fontWeight: 600 }}>₹{hp.basePrice}/hr {hp.deposit ? `(Dep: ₹${hp.deposit})` : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {detailConfig.packages && detailConfig.packages.length > 0 ? (
                      detailConfig.packages.map((pkg: any, idx: number) => (
                        <div key={idx} style={{ borderBottom: idx < detailConfig.packages.length - 1 ? '1px dashed #E2E8F0' : 'none', paddingBottom: idx < detailConfig.packages.length - 1 ? '6px' : '0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px' }}>
                            <span>{pkg.name} ({pkg.model})</span>
                            <span>₹{pkg.price}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            <span>Duration: {pkg.duration} days</span>
                            {pkg.deposit !== undefined && <span>Deposit: ₹{pkg.deposit}</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      detailConfig.packageDetails && detailConfig.packageDetails.map((det: string, idx: number) => (
                        <div key={idx} style={{ fontWeight: 600 }}>{det}</div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: 600, color: '#64748B' }}>Notes:</span>
                <p style={{ margin: 0, padding: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontStyle: 'italic', fontSize: '13px', color: '#475569' }}>
                  {detailConfig.notes || 'No notes available.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
