'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

/* ──────────────────────────────────────────────────────────────
   VEHICLE MODELS & MEDIA MANAGER PAGE
   ────────────────────────────────────────────────────────────── */

interface VehicleModelData {
  id?: number;
  name: string;
  category: string;
  tagline: string;
  rating: number;
  reviews_count: number;
  description: string;
  range: string;
  top_speed: string;
  battery_capacity: string;
  brakes: string;
  motor_power: string;
  battery_type: string;
  wheel_size: string;
  water_resistance: string;
  charging_time: string;
  load_capacity: string;
  warranty: string;
  main_image: string;
  gallery_images: string[];
  video_url: string;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
.vm-shell{display:flex;min-height:100vh;background:#F8FAFC;font-family:'Plus Jakarta Sans',sans-serif;color:#0F172A;}
.vm-main{margin-left:230px;display:flex;flex-direction:column;min-height:100vh;width:calc(100% - 230px);}
.vm-page{flex:1;padding:24px 28px 60px;}

.vm-bc{display:flex;align-items:center;gap:6px;font-size:12px;color:#64748B;font-weight:500;margin-bottom:8px;}
.vm-bc a{color:#64748B;text-decoration:none;}
.vm-bc a:hover{color:#6366F1;}
.vm-bc-sep{color:#CBD5E1;}
.vm-bc-cur{color:#0F172A;font-weight:700;}

.vm-title-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;gap:16px;flex-wrap:wrap;}
.vm-h1{font-size:24px;font-weight:800;color:#0F172A;margin:0 0 4px;font-family:'Outfit',sans-serif;letter-spacing:-0.02em;}
.vm-sub{font-size:13px;color:#64748B;margin:0;font-weight:500;}

.vm-hdr-actions{display:flex;align-items:center;gap:10px;}
.vm-btn-primary{display:flex;align-items:center;gap:6px;padding:9px 18px;background:#6366F1;color:#fff;border-radius:10px;font-size:12.5px;font-weight:700;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,0.25);transition:all .15s;}
.vm-btn-primary:hover{background:#4f46e5;}

.vm-view-toggle{display:flex;align-items:center;background:#E2E8F0;padding:3px;border-radius:10px;}
.vm-toggle-btn{padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;border:none;cursor:pointer;background:transparent;color:#64748B;transition:all .15s;}
.vm-toggle-btn.active{background:#fff;color:#0F172A;box-shadow:0 1px 3px rgba(0,0,0,0.1);}

/* Table View */
.vm-table-card{background:#fff;border:1px solid #E2E8F0;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.02);overflow:hidden;margin-bottom:30px;}
.vm-table{width:100%;border-collapse:collapse;text-align:left;}
.vm-table th{background:#F8FAFC;padding:14px 18px;font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #E2E8F0;}
.vm-table td{padding:14px 18px;font-size:13px;color:#334155;border-bottom:1px solid #F1F5F9;vertical-align:middle;}
.vm-table tr:hover td{background:#F8FAFC;}

/* Grid View */
.vm-models-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:20px;margin-bottom:30px;}
.vm-model-card{background:#fff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.02);transition:all .2s;}
.vm-model-card:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgba(0,0,0,0.06);border-color:#CBD5E1;}

.vm-card-img-box{height:160px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.vm-card-img{width:auto;height:140px;object-fit:contain;transition:transform .3s;}
.vm-model-card:hover .vm-card-img{transform:scale(1.06);}

.vm-card-body{padding:18px;}
.vm-card-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.vm-card-title{font-size:18px;font-weight:800;color:#0F172A;margin:0;font-family:'Outfit',sans-serif;}
.vm-card-badge{font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:20px;background:#EEF2FF;color:#6366F1;}

.vm-card-tagline{font-size:12px;color:#64748B;margin:0 0 14px;font-weight:500;}

.vm-specs-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px;background:#F8FAFC;border-radius:10px;margin-bottom:14px;}
.vm-spec-item{font-size:11.5px;}
.vm-spec-lbl{color:#64748B;font-weight:500;display:block;margin-bottom:2px;}
.vm-spec-val{color:#0F172A;font-weight:700;}

.vm-card-actions{display:flex;align-items:center;gap:10px;}
.vm-btn-edit{flex:1;padding:8px;background:#EEF2FF;color:#6366F1;border:1px solid #C7D2FE;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;text-align:center;transition:all .15s;}
.vm-btn-edit:hover{background:#6366F1;color:#fff;}
.vm-btn-del{padding:8px 12px;background:#FEF2F2;color:#EF4444;border:1px solid #FCA5A5;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;}
.vm-btn-del:hover{background:#EF4444;color:#fff;}

/* Modal Form Styles */
.vm-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;}
.vm-modal-content{background:#fff;border-radius:20px;width:100%;max-width:820px;max-height:90vh;overflow-y:auto;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);padding:26px;}

.vm-form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px;}
.vm-form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px;}
.vm-form-row-4{display:grid;grid-template-columns:repeat(4, 1fr);gap:12px;margin-bottom:14px;}

.vm-field{display:flex;flex-direction:column;gap:5px;}
.vm-label{font-size:12px;font-weight:700;color:#334155;}
.vm-input{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:12.5px;color:#0F172A;outline:none;background:#fff;font-weight:500;}
.vm-input:focus{border-color:#6366F1;}

.vm-tag-chip{font-size:11px;font-weight:600;padding:3px 8px;border-radius:12px;background:#F1F5F9;color:#475569;border:1px solid #CBD5E1;cursor:pointer;transition:all .15s;}
.vm-tag-chip:hover{background:#6366F1;color:#fff;border-color:#6366F1;}

/* Upload Box */
.vm-upload-box{border:1.5px dashed #A855F7;background:#FAF5FF;border-radius:12px;padding:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;text-align:center;transition:background .15s;position:relative;}
.vm-upload-box:hover{background:#F3E8FF;}
.vm-upload-preview{width:90px;height:70px;object-fit:contain;margin-bottom:4px;border-radius:6px;}

.vm-gallery-thumb-container{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;}
.vm-gallery-thumb-wrapper{position:relative;width:55px;height:55px;}
.vm-gallery-thumb-img{width:100%;height:100%;object-fit:cover;border-radius:8px;border:1px solid #CBD5E1;}
.vm-gallery-thumb-del{position:absolute;top:-6px;right:-6px;width:18px;height:18px;background:#EF4444;color:#fff;border-radius:50%;border:none;font-size:10px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;}
`;

export default function VehicleModelsPage() {
  const [modelsList, setModelsList] = useState<VehicleModelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<VehicleModelData>({
    name: 'Evegah City',
    category: 'E-Vehicle',
    tagline: 'Stylish. Powerful. Eco-friendly.',
    rating: 4.6,
    reviews_count: 128,
    description: 'Evegah City is built for the modern commuter. It combines performance, comfort and style with zero emissions.',
    range: '90–110 km',
    top_speed: '60 km/h',
    battery_capacity: '2.3 kWh',
    brakes: 'Disc Brakes (Front & Rear)',
    motor_power: '2500 W',
    battery_type: 'Lithium-ion',
    wheel_size: '12 inch',
    water_resistance: 'IP67',
    charging_time: '4 – 5 Hours',
    load_capacity: '150 kg',
    warranty: '1 Year Warranty',
    main_image: 'assets/City-1.png',
    gallery_images: ['assets/City-1.png', 'assets/ev_baroda.png', 'assets/mink_banner.png', 'assets/Pro_Banner.png'],
    video_url: 'assets/ev_video.mp4',
  });

  const fetchModels = () => {
    api.get('/vehicles/models')
      .then(res => {
        if (res && res.status === 'success' && res.data) {
          setModelsList(res.data);
        }
      })
      .catch(err => console.error('Failed to fetch vehicle models:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'main_image' | 'video_url') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [fieldName]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      let loaded = 0;
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newImages.push(reader.result as string);
          }
          loaded++;
          if (loaded === files.length) {
            setFormData(prev => ({
              ...prev,
              gallery_images: [...prev.gallery_images, ...newImages]
            }));
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleOpenEdit = (model: VehicleModelData) => {
    setFormData({
      ...model,
      gallery_images: Array.isArray(model.gallery_images) ? model.gallery_images : []
    });
    setIsEditing(true);
  };

  const handleDeleteModel = async (model: VehicleModelData) => {
    if (confirm(`Are you sure you want to delete vehicle model "${model.name}"?`)) {
      try {
        if (model.id) {
          await api.delete(`/vehicles/models/${model.id}`);
        } else {
          await api.delete(`/vehicles/models/by-name/${encodeURIComponent(model.name)}`);
        }
        alert(`Model "${model.name}" deleted successfully.`);
        fetchModels();
      } catch (err: any) {
        alert(`Failed to delete model: ${err.message || err}`);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a vehicle model name');
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/vehicles/models', {
        ...formData,
        reviewsCount: formData.reviews_count,
        topSpeed: formData.top_speed,
        batteryCapacity: formData.battery_capacity,
        motorPower: formData.motor_power,
        batteryType: formData.battery_type,
        wheelSize: formData.wheel_size,
        waterResistance: formData.water_resistance,
        chargingTime: formData.charging_time,
        loadCapacity: formData.load_capacity,
        mainImage: formData.main_image,
        galleryImages: formData.gallery_images,
        videoUrl: formData.video_url,
      });
      alert(`Vehicle Model "${formData.name}" saved successfully!`);
      setIsEditing(false);
      fetchModels();
    } catch (err: any) {
      alert(`Error saving model: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const resolveImg = (src: string) => {
    if (!src) return '/assets/city.png';
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return src;
    let clean = src.trim();
    if (clean.startsWith('/assets/')) return clean;
    if (clean.startsWith('assets/')) return `/${clean}`;
    if (clean.startsWith('/')) return clean;
    return `/assets/${clean}`;
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="vm-shell">
        <Sidebar activePath="/vehicles/models" />
        <div className="vm-main">
          <TopBar />
          <div className="vm-page">

            {/* Breadcrumb */}
            <div className="vm-bc">
              <Link href="/">Home</Link>
              <span className="vm-bc-sep">›</span>
              <Link href="/vehicles/all">Vehicles</Link>
              <span className="vm-bc-sep">›</span>
              <span className="vm-bc-cur">Vehicle Models & Media</span>
            </div>

            {/* Header Title Row */}
            <div className="vm-title-row">
              <div>
                <h1 className="vm-h1">Vehicle Models & Media Catalog</h1>
                <p className="vm-sub">Configure specs, video URL, tagline, rating, and gallery images for each model in the Rider App.</p>
              </div>
              <div className="vm-hdr-actions">
                <div className="vm-view-toggle">
                  <button 
                    className={`vm-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                  >
                    📋 Table View
                  </button>
                  <button 
                    className={`vm-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => setViewMode('cards')}
                  >
                    🎴 Cards View
                  </button>
                </div>
                <button 
                  className="vm-btn-primary"
                  onClick={() => {
                    setFormData({
                      name: '',
                      category: 'E-Scooter',
                      tagline: 'Stylish & Reliable EV',
                      rating: 4.5,
                      reviews_count: 50,
                      description: '',
                      range: '80–100 km',
                      top_speed: '55 km/h',
                      battery_capacity: '2.0 kWh',
                      brakes: 'Disc Brakes',
                      motor_power: '2000 W',
                      battery_type: 'Li-ion',
                      wheel_size: '12 inch',
                      water_resistance: 'IP67',
                      charging_time: '4 Hours',
                      load_capacity: '150 kg',
                      warranty: '1 Year Warranty',
                      main_image: 'assets/City-1.png',
                      gallery_images: ['assets/City-1.png'],
                      video_url: 'assets/ev_video.mp4',
                    });
                    setIsEditing(true);
                  }}
                >
                  + Add New Model
                </button>
              </div>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748B', fontWeight: 600 }}>Loading vehicle models catalog...</div>
            ) : viewMode === 'table' ? (

              /* TABLE VIEW OF ALL MODELS */
              <div className="vm-table-card">
                <table className="vm-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Graphic</th>
                      <th>Model Name</th>
                      <th>Category</th>
                      <th>Range</th>
                      <th>Top Speed</th>
                      <th>Battery</th>
                      <th>Gallery Photos</th>
                      <th>Rating</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelsList.map((model) => (
                      <tr key={model.name}>
                        <td>
                          <div style={{ width: '46px', height: '36px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img 
                              src={resolveImg(model.main_image)} 
                              alt={model.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e: any) => { e.target.src = '/City-1.png'; }}
                            />
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>{model.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{model.tagline}</div>
                        </td>
                        <td>
                          <span className="vm-card-badge">{model.category}</span>
                        </td>
                        <td><span style={{ fontWeight: 700 }}>{model.range}</span></td>
                        <td><span style={{ fontWeight: 700 }}>{model.top_speed}</span></td>
                        <td><span style={{ fontWeight: 700 }}>{model.battery_capacity}</span></td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#6366F1' }}>
                            📷 {Array.isArray(model.gallery_images) ? model.gallery_images.length : 0} Photos
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: '#D97706' }}>
                            ★ {model.rating} ({model.reviews_count})
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="vm-btn-edit" style={{ flex: 'none', padding: '6px 12px' }} onClick={() => handleOpenEdit(model)}>
                              ✏️ Edit
                            </button>
                            <button className="vm-btn-del" onClick={() => handleDeleteModel(model)}>
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {modelsList.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                          No vehicle models configured yet. Click "+ Add New Model" above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            ) : (

              /* CARDS GRID VIEW OF ALL MODELS */
              <div className="vm-models-grid">
                {modelsList.map((model) => (
                  <div key={model.name} className="vm-model-card">
                    <div className="vm-card-img-box">
                      <img 
                        src={resolveImg(model.main_image)} 
                        alt={model.name} 
                        className="vm-card-img"
                        onError={(e: any) => { e.target.src = '/City-1.png'; }}
                      />
                    </div>
                    <div className="vm-card-body">
                      <div className="vm-card-hdr">
                        <h3 className="vm-card-title">{model.name}</h3>
                        <span className="vm-card-badge">{model.category}</span>
                      </div>
                      <p className="vm-card-tagline">{model.tagline}</p>

                      <div className="vm-specs-grid">
                        <div className="vm-spec-item">
                          <span className="vm-spec-lbl">Range</span>
                          <span className="vm-spec-val">{model.range}</span>
                        </div>
                        <div className="vm-spec-item">
                          <span className="vm-spec-lbl">Top Speed</span>
                          <span className="vm-spec-val">{model.top_speed}</span>
                        </div>
                        <div className="vm-spec-item">
                          <span className="vm-spec-lbl">Battery</span>
                          <span className="vm-spec-val">{model.battery_capacity}</span>
                        </div>
                        <div className="vm-spec-item">
                          <span className="vm-spec-lbl">Brakes</span>
                          <span className="vm-spec-val">{model.brakes}</span>
                        </div>
                      </div>

                      <div className="vm-card-actions">
                        <button className="vm-btn-edit" onClick={() => handleOpenEdit(model)}>
                          ✏️ Edit Specs & Media
                        </button>
                        <button className="vm-btn-del" onClick={() => handleDeleteModel(model)}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* --- EDIT / ADD MODEL MODAL FORM WITH FILE UPLOADS & TEXT INPUT --- */}
        {isEditing && (
          <div className="vm-modal-overlay">
            <div className="vm-modal-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                    {formData.id || formData.name ? `Edit Specs: ${formData.name || 'Vehicle Model'}` : 'Add New Vehicle Model'}
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                    Upload vehicle images, video, specs, and features for the Rider App detail page.
                  </p>
                </div>
                <button 
                  onClick={() => setIsEditing(false)}
                  style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Model Name (Text Field with Preset Tags) & Category */}
                <div className="vm-form-row">
                  <div className="vm-field">
                    <label className="vm-label">Vehicle Model Name (Text Input)</label>
                    <input 
                      type="text" 
                      className="vm-input" 
                      placeholder="e.g. Evegah City, Evegah Cyber, EV-Pro..."
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                      required 
                    />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#64748B', alignSelf: 'center' }}>Presets:</span>
                      {['Evegah City', 'Evegah Pro', 'Evegah Fly', 'Evegah Mink', 'Evegah Cyber'].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          className="vm-tag-chip"
                          onClick={() => setFormData({ ...formData, name: preset })}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="vm-field">
                    <label className="vm-label">Category Badge</label>
                    <input 
                      type="text" 
                      className="vm-input" 
                      placeholder="e.g. E-Vehicle, E-Scooter, E-Cargo"
                      value={formData.category} 
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                    />
                  </div>
                </div>

                {/* Tagline, Rating, Reviews */}
                <div className="vm-form-row-3">
                  <div className="vm-field">
                    <label className="vm-label">Tagline Subtitle</label>
                    <input 
                      type="text" 
                      className="vm-input" 
                      value={formData.tagline} 
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} 
                    />
                  </div>
                  <div className="vm-field">
                    <label className="vm-label">Rating (★)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="vm-input" 
                      value={formData.rating} 
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.5 })} 
                    />
                  </div>
                  <div className="vm-field">
                    <label className="vm-label">Reviews Count</label>
                    <input 
                      type="number" 
                      className="vm-input" 
                      value={formData.reviews_count} 
                      onChange={(e) => setFormData({ ...formData, reviews_count: parseInt(e.target.value, 10) || 100 })} 
                    />
                  </div>
                </div>

                {/* Overview Description */}
                <div className="vm-field">
                  <label className="vm-label">Overview Description</label>
                  <textarea 
                    className="vm-input" 
                    style={{ height: '70px', resize: 'none' }}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Technical Specs Rows */}
                <div className="vm-form-row-4">
                  <div className="vm-field"><label className="vm-label">Range</label><input type="text" className="vm-input" value={formData.range} onChange={(e) => setFormData({ ...formData, range: e.target.value })} /></div>
                  <div className="vm-field"><label className="vm-label">Top Speed</label><input type="text" className="vm-input" value={formData.top_speed} onChange={(e) => setFormData({ ...formData, top_speed: e.target.value })} /></div>
                  <div className="vm-field"><label className="vm-label">Battery Capacity</label><input type="text" className="vm-input" value={formData.battery_capacity} onChange={(e) => setFormData({ ...formData, battery_capacity: e.target.value })} /></div>
                  <div className="vm-field"><label className="vm-label">Brakes</label><input type="text" className="vm-input" value={formData.brakes} onChange={(e) => setFormData({ ...formData, brakes: e.target.value })} /></div>
                </div>

                <div className="vm-form-row-4">
                  <div className="vm-field"><label className="vm-label">Motor Power</label><input type="text" className="vm-input" value={formData.motor_power} onChange={(e) => setFormData({ ...formData, motor_power: e.target.value })} /></div>
                  <div className="vm-field"><label className="vm-label">Battery Type</label><input type="text" className="vm-input" value={formData.battery_type} onChange={(e) => setFormData({ ...formData, battery_type: e.target.value })} /></div>
                  <div className="vm-field"><label className="vm-label">Wheel Size</label><input type="text" className="vm-input" value={formData.wheel_size} onChange={(e) => setFormData({ ...formData, wheel_size: e.target.value })} /></div>
                  <div className="vm-field"><label className="vm-label">Charging Time</label><input type="text" className="vm-input" value={formData.charging_time} onChange={(e) => setFormData({ ...formData, charging_time: e.target.value })} /></div>
                </div>

                {/* --- FILE UPLOAD SECTIONS (REPLACING PLAIN TEXT URLS) --- */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '6px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    📷 Vehicle Media & Image Uploads
                  </h4>

                  <div className="vm-form-row">
                    {/* Main Image File Upload */}
                    <div className="vm-field">
                      <label className="vm-label">Main Vehicle Cutout Graphic (Upload Image)</label>
                      <label className="vm-upload-box">
                        {formData.main_image ? (
                          <img 
                            src={resolveImg(formData.main_image)} 
                            alt="Main Preview" 
                            className="vm-upload-preview" 
                            onError={(e: any) => { e.target.src = '/City-1.png'; }}
                          />
                        ) : (
                          <div style={{ fontSize: '28px' }}>🖼️</div>
                        )}
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#6366F1' }}>
                          Click to Browse / Upload Main Image
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(e, 'main_image')}
                        />
                      </label>
                    </div>

                    {/* Video File Upload */}
                    <div className="vm-field">
                      <label className="vm-label">Promo Video File (Upload MP4 / WebM)</label>
                      <label className="vm-upload-box">
                        <div style={{ fontSize: '28px' }}>🎥</div>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#A855F7' }}>
                          Click to Select Video File
                        </span>
                        {formData.video_url && (
                          <span style={{ fontSize: '10px', color: '#64748B', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {formData.video_url.slice(0, 35)}
                          </span>
                        )}
                        <input 
                          type="file" 
                          accept="video/*" 
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(e, 'video_url')}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Gallery Images Upload */}
                  <div className="vm-field" style={{ marginTop: '12px' }}>
                    <label className="vm-label">Gallery Photos (Multiple Image Uploads)</label>
                    <div className="vm-upload-box" style={{ minHeight: '110px' }}>
                      {formData.gallery_images && formData.gallery_images.length > 0 && (
                        <div className="vm-gallery-thumb-container">
                          {formData.gallery_images.map((img, idx) => (
                            <div key={idx} className="vm-gallery-thumb-wrapper">
                              <img 
                                src={resolveImg(img)} 
                                alt={`Gallery ${idx}`}
                                className="vm-gallery-thumb-img"
                                onError={(e: any) => { e.target.src = '/City-1.png'; }}
                              />
                              <button 
                                type="button" 
                                className="vm-gallery-thumb-del" 
                                title="Remove photo"
                                onClick={() => handleRemoveGalleryImage(idx)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#6366F1' }}>
                          + Add Gallery Images (Select Multiple Files)
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          style={{ display: 'none' }}
                          onChange={handleGalleryUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit / Cancel Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#6366F1', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
                  >
                    {isSaving ? 'Saving Model...' : 'Save Model & Media'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
