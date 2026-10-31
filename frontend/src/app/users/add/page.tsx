"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.ua-shell { display: flex; min-height: 100vh; background: #fff; font-family: 'Inter', sans-serif; }
.ua-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.ua-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; flex: 1; }

/* Breadcrumb */
.ua-bc { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748B; font-weight: 500; }
.ua-bc a { color: #8B5CF6; text-decoration: none; font-weight: 600; transition: color .15s; }
.ua-bc a:hover { color: #6D28D9; }
.ua-bc-sep { color: #D8B4FE; font-weight: 600; }
.ua-bc-cur { color: #0F172A; font-weight: 700; }

/* Title row */
.ua-title-row { display: flex; align-items: flex-start; justify-content: space-between; margin-top: -4px; }
.ua-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0; }
.ua-sub { font-size: 13.5px; color: #64748B; margin-top: 4px; font-weight: 500; }

/* Content grid */
.ua-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; margin-top: 8px; }
.ua-left-col { display: flex; flex-direction: column; gap: 24px; }
.ua-right-col { display: flex; flex-direction: column; gap: 24px; }

/* Card */
.ua-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.ua-sec-title { font-size: 14.5px; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 10px; margin: 0; }
.ua-icon-circle { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ua-icon-circle.purple { background: #8B5CF6; color: #fff; }
.ua-icon-circle.blue { background: #3B82F6; color: #fff; }
.ua-icon-circle.pink { background: #FDF2F8; color: #EC4899; }

/* Form inputs */
.ua-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ua-form-field { display: flex; flex-direction: column; gap: 6px; }
.ua-form-lbl { font-size: 12.5px; font-weight: 700; color: #475569; }
.ua-input-wrap { position: relative; display: flex; align-items: center; width: 100%; }
.ua-input-icon { position: absolute; left: 12px; color: #94A3B8; display: flex; align-items: center; }
.ua-inp { width: 100%; padding: 10px 12px 10px 34px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13.5px; outline: none; transition: border-color .15s; background: #fff; color: #334155; font-weight: 500; }
.ua-inp:focus { border-color: #2a195c; box-shadow: 0 0 0 1px #2a195c; }
.ua-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 11px; padding-right: 32px; cursor: pointer; }

/* Phone field */
.ua-phone-row { display: grid; grid-template-columns: 80px 1fr; gap: 8px; width: 100%; }
.ua-phone-prefix { width: 100%; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13.5px; outline: none; background: #fff; color: #334155; font-weight: 600; text-align: center; }
.ua-phone-inp { width: 100%; padding: 10px 12px 10px 34px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13.5px; outline: none; background: #fff; color: #334155; font-weight: 500; }

/* Status selector card */
.ua-status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ua-status-card { border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; cursor: pointer; background: #fff; transition: all .15s; }
.ua-status-card.active { border-color: #2A195C; background: #FAF5FF; }
.ua-status-card-text { font-size: 13px; font-weight: 700; color: #1E293B; }
.ua-status-indicator { width: 8px; height: 8px; border-radius: 50%; }
.ua-status-indicator.green { background: #10B981; color: #fff; }
.ua-status-indicator.red { background: #EF4444; color: #fff; }
.ua-status-radio { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #CBD5E1; display: flex; align-items: center; justify-content: center; margin-left: auto; }
.ua-status-radio.active { border-color: #2A195C; background: #2A195C; }
.ua-status-radio-dot { width: 6px; height: 6px; background: #fff; border-radius: 50%; }

/* Password field */
.ua-pwd-wrap { position: relative; display: flex; align-items: center; width: 100%; }
.ua-pwd-inp { width: 100%; padding: 10px 70px 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13.5px; outline: none; font-family: monospace; font-weight: 600; color: #334155; }
.ua-pwd-actions { position: absolute; right: 12px; display: flex; gap: 10px; color: #94A3B8; }
.ua-pwd-btn { background: none; border: none; cursor: pointer; color: #94A3B8; display: flex; align-items: center; justify-content: center; padding: 2px; }
.ua-pwd-btn:hover { color: #2a195c; }

/* Checkbox */
.ua-checkbox-row { display: flex; align-items: flex-start; gap: 10px; margin-top: 4px; }
.ua-checkbox { width: 18px; height: 18px; border: 1.5px solid #CBD5E1; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; margin-top: 1px; flex-shrink: 0; }
.ua-checkbox.active { border-color: #2A195C; background: #2A195C; color: #fff; }
.ua-checkbox-t { font-size: 13px; font-weight: 700; color: #1E293B; }
.ua-checkbox-s { font-size: 11.5px; color: #64748B; margin-top: 2px; line-height: 1.4; }

/* Action row buttons */
.ua-action-row { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #F1F5F9; padding-top: 20px; }
.ua-btn-outline { padding: 10px 24px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; font-weight: 700; color: #475569; background: #fff; cursor: pointer; transition: all .15s; }
.ua-btn-outline:hover { background: #F8FAFC; border-color: #94A3B8; }
.ua-btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; background: #2a195c; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
.ua-btn-primary:hover { background: #4338CA; }

/* Right Column Widgets */
.ua-right-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 16px; }
.ua-right-title { font-size: 13.5px; font-weight: 800; color: #0F172A; margin: 0; display: flex; align-items: center; gap: 8px; }
.ua-right-title-ic { color: #2A195C; background: #F5F3FF; width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* Stepper steps */
.ua-steps { display: flex; flex-direction: column; gap: 20px; position: relative; margin-top: 6px; }
.ua-steps::before { content: ''; position: absolute; left: 13px; top: 10px; bottom: 10px; width: 1.5px; border-left: 1.5px dashed #E2E8F0; z-index: 1; }
.ua-step-item { display: flex; gap: 14px; position: relative; z-index: 2; }
.ua-step-circle { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #E2E8F0; background: #fff; display: flex; align-items: center; justify-content: center; color: #2A195C; flex-shrink: 0; font-size: 11px; }
.ua-step-text { font-size: 12.5px; color: #475569; font-weight: 500; line-height: 1.45; }

/* Tip card */
.ua-tip-card { background: #FFFDF5; border: 1px solid #FEF3C7; border-radius: 12px; padding: 16px; display: flex; gap: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.01); }
.ua-tip-ic { color: #D97706; display: flex; align-items: flex-start; margin-top: 2px; }
.ua-tip-t { font-size: 12.5px; font-weight: 700; color: #B45309; }
.ua-tip-desc { font-size: 11.5px; color: #D97706; line-height: 1.45; margin-top: 4px; }
`;

function AddUserPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editUserId = searchParams.get('edit');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Select role');
  const [assignedDashboard, setAssignedDashboard] = useState('Auto-Detect from Role');
  const [zone, setZone] = useState('Select zone or scope');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [password, setPassword] = useState('G7r!pLk9@#X2s');
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  
  // New States for profile image, dynamic roles, and live multi-zone scope
  const [avatarUrl, setAvatarUrl] = useState('');
  const [roles, setRoles] = useState<any[]>([]);
  const [liveZones, setLiveZones] = useState<string[]>([
    'All Zones / Platform Wide',
    'Gotri Zone',
    'Vadodara Main Zone',
    'Alkapuri Zone',
    'Subhanpura Zone',
    'Akota Zone',
    'Daman Zone',
    'Lekki Phase 1'
  ]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  // Load roles list & live zones list on component mount
  useEffect(() => {
    const fetchRolesAndZones = async () => {
      try {
        const result: any = await api.get('/roles');
        setRoles(result.data || []);
      } catch (err) {
        console.error('Error fetching roles:', err);
      }

      try {
        const resultZ: any = await api.get('/zones');
        if (resultZ.data && Array.isArray(resultZ.data)) {
          const names = resultZ.data.map((z: any) => z.name || z.locality).filter(Boolean);
          setLiveZones(Array.from(new Set<string>(['All Zones / Platform Wide', ...names])));
        }
      } catch (err) {
        console.error('Error fetching zones:', err);
      }
    };
    fetchRolesAndZones();
  }, []);

  // Load user details if in edit mode
  useEffect(() => {
    if (editUserId) {
      const fetchUser = async () => {
        try {
          const result: any = await api.get(`/users/${editUserId}`);
          const u = result.data;
          if (u) {
            setFullName(u.name || '');
            setEmail(u.email || '');
            setPhone(u.mobile || '');
            setRole(u.role || 'Select role');
            setZone(u.zone || 'Select zone or scope');
            if (u.zone) {
              const parts = u.zone.split(',').map((s: string) => s.trim()).filter(Boolean);
              setSelectedZones(parts);
            }
            setStatus(u.status === 'Active' ? 'Active' : 'Inactive');
            setAvatarUrl(u.avatar_url || '');
          }
        } catch (err) {
          console.error('Error fetching user details:', err);
        }
      };
      fetchUser();
    }
  }, [editUserId]);

  const toggleZoneSelection = (zName: string) => {
    if (zName === 'All Zones / Platform Wide') {
      if (selectedZones.includes('All Zones / Platform Wide')) {
        setSelectedZones([]);
        setZone('');
      } else {
        setSelectedZones(['All Zones / Platform Wide']);
        setZone('All Zones / Platform Wide');
      }
      return;
    }

    let next = selectedZones.filter(z => z !== 'All Zones / Platform Wide');
    if (next.includes(zName)) {
      next = next.filter(z => z !== zName);
    } else {
      next.push(zName);
    }
    setSelectedZones(next);
    setZone(next.join(', '));
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'Select role') {
      alert('Please select a valid role.');
      return;
    }
    if (selectedZones.length === 0 && (!zone || zone === 'Select zone or scope')) {
      alert('Please select at least one zone or scope.');
      return;
    }

    const payload = {
      name: fullName,
      email,
      mobile: phone,
      role,
      zone,
      status,
      password,
      avatar_url: avatarUrl
    };

    try {
      const resData: any = editUserId
        ? await api.put(`/users/${editUserId}`, payload)
        : await api.post('/users', payload);

      alert(editUserId ? 'User details updated successfully!' : 'User account registered successfully!');
      router.push('/users');
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to save user details.');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ua-shell">
        <Sidebar activePath="/users" />

        <div className="ua-main">
          
          <TopBar 
            notificationCount={3}
            showSearch={false}
            hideZone={false}
          />

          <div className="ua-body">
            
            {/* Breadcrumb */}
            <div className="ua-bc">
              <a href="#">Settings</a>
              <span className="ua-bc-sep">&gt;</span>
              <a href="/users">Users &amp; Roles</a>
              <span className="ua-bc-sep">&gt;</span>
              <a href="/users">Users</a>
              <span className="ua-bc-sep">&gt;</span>
              <span className="ua-bc-cur">{editUserId ? 'Edit User' : 'Add User'}</span>
            </div>

            {/* Title Section */}
            <div className="ua-title-row">
              <div>
                <h1 className="ua-h1">{editUserId ? 'Edit User' : 'Add User'}</h1>
                <p className="ua-sub">
                  {editUserId ? 'Update employee login status, zone access, and permissions scope.' : 'Create a new user account and assign role and access.'}
                </p>
              </div>
            </div>

            {/* Double column grid */}
            <form onSubmit={handleSave} className="ua-grid">
              
              {/* Left Column Forms */}
              <div className="ua-left-col">
                
                {/* 1. Personal Information */}
                <div className="ua-card">
                  <h3 className="ua-sec-title">
                    <div className="ua-icon-circle purple">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <span>Personal Information</span>
                  </h3>

                  {/* Profile Picture Upload Section */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px', marginBottom: '4px' }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', flexShrink: 0 }}>
                      {avatarUrl ? (
                        <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar preview" />
                      ) : (
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#94A3B8' }}>
                          {fullName ? fullName.split(' ').map(n=>n[0]).join('').toUpperCase() : '?'}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#2a195c', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={handleFileChange}
                        />
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span>Upload Photo</span>
                      </label>
                      {avatarUrl && (
                        <button 
                          type="button" 
                          style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', width: 'fit-content', textAlign: 'left', padding: 0 }}
                          onClick={() => setAvatarUrl('')}
                        >
                          Remove Photo
                        </button>
                      )}
                      <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>JPG, PNG or JPEG. Max size 2MB.</span>
                    </div>
                  </div>

                  <div className="ua-form-row">
                    <div className="ua-form-field">
                      <label className="ua-form-lbl">Full Name *</label>
                      <div className="ua-input-wrap">
                        <span className="ua-input-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </span>
                        <input 
                          type="text" 
                          placeholder="Enter full name" 
                          className="ua-inp" 
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="ua-form-field">
                      <label className="ua-form-lbl">Email Address *</label>
                      <div className="ua-input-wrap">
                        <span className="ua-input-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </span>
                        <input 
                          type="email" 
                          placeholder="Enter email address" 
                          className="ua-inp" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ua-form-field">
                    <label className="ua-form-lbl">Phone Number *</label>
                    <div className="ua-phone-row">
                      <select className="ua-phone-prefix">
                        <option>+91</option>
                      </select>
                      <div className="ua-input-wrap">
                        <span className="ua-input-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </span>
                        <input 
                          type="text" 
                          placeholder="Enter phone number" 
                          className="ua-phone-inp" 
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Role & Access */}
                <div className="ua-card">
                  <h3 className="ua-sec-title">
                    <div className="ua-icon-circle blue">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <span>Role &amp; Access</span>
                  </h3>

                  <div className="ua-form-row">
                    <div className="ua-form-field">
                      <label className="ua-form-lbl">Role *</label>
                      <select 
                        className="ua-inp ua-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option disabled value="Select role">Select role</option>
                        {roles.length > 0 ? (
                          roles.map((r: any) => (
                            <option key={r.id || r.name} value={r.name}>{r.name}</option>
                          ))
                        ) : (
                          <>
                            <option value="Super Admin">Super Admin</option>
                            <option value="Platform Admin">Platform Admin</option>
                            <option value="Employee Dashboard">Employee Dashboard</option>
                            <option value="Zone Admin">Zone Admin</option>
                            <option value="Operations Manager">Operations Manager</option>
                            <option value="Franchise Manager">Franchise Manager</option>
                            <option value="Battery Technician">Battery Technician</option>
                            <option value="Support Executive">Support Executive</option>
                            <option value="Fleet Manager">Fleet Manager</option>
                            <option value="Field Technician">Field Technician</option>
                            <option value="Finance Manager">Finance Manager</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="ua-form-field">
                      <label className="ua-form-lbl">Assigned Dashboard View *</label>
                      <select 
                        className="ua-inp ua-select"
                        value={assignedDashboard}
                        onChange={(e) => setAssignedDashboard(e.target.value)}
                      >
                        <option value="Auto-Detect from Role">Auto-Detect from Role</option>
                        <option value="Super Admin Dashboard">Super Admin Dashboard</option>
                        <option value="Employee Operations Dashboard">Employee Operations Dashboard</option>
                        <option value="Zone Admin Dashboard">Zone Admin Dashboard</option>
                        <option value="Operations Manager Dashboard">Operations Manager Dashboard</option>
                        <option value="Support Executive Dashboard">Support Executive Dashboard</option>
                        <option value="Franchise Manager Dashboard">Franchise Manager Dashboard</option>
                        <option value="BMS Battery Dashboard">BMS Battery Dashboard</option>
                        <option value="Fleet Manager Dashboard">Fleet Manager Dashboard</option>
                        <option value="Finance Manager Dashboard">Finance Manager Dashboard</option>
                      </select>
                    </div>

                    <div className="ua-form-field" style={{ gridColumn: 'span 2' }}>
                      <label className="ua-form-lbl">Zone / Scope (Select One or Multiple Zones) *</label>
                      
                      {/* Active Selected Zone Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {selectedZones.length === 0 ? (
                          <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>No zones selected yet. Click below to add access scopes.</span>
                        ) : (
                          selectedZones.map(z => (
                            <span 
                              key={z} 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '4px 10px', 
                                background: z === 'All Zones / Platform Wide' ? '#FAF5FF' : '#EEF2FF', 
                                color: z === 'All Zones / Platform Wide' ? '#6D28D9' : '#4338CA', 
                                border: `1px solid ${z === 'All Zones / Platform Wide' ? '#D8B4FE' : '#C7D2FE'}`, 
                                borderRadius: '20px', 
                                fontSize: '12px', 
                                fontWeight: 700 
                              }}
                            >
                              {z}
                              <button 
                                type="button"
                                onClick={() => toggleZoneSelection(z)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 800, padding: 0, fontSize: '13px' }}
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Multi-Select Checkboxes Grid */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat( auto-fill, minmax(180px, 1fr) )', 
                        gap: '8px', 
                        maxHeight: '180px', 
                        overflowY: 'auto', 
                        padding: '12px', 
                        border: '1.5px solid #E2E8F0', 
                        borderRadius: '10px', 
                        background: '#FFF' 
                      }}>
                        {liveZones.map(zName => {
                          const isChecked = selectedZones.includes(zName);
                          return (
                            <label 
                              key={zName} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                fontSize: '12.5px', 
                                fontWeight: isChecked ? 700 : 500, 
                                color: isChecked ? '#2A195C' : '#475569', 
                                padding: '6px 8px', 
                                borderRadius: '6px', 
                                background: isChecked ? '#F5F3FF' : 'transparent', 
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleZoneSelection(zName)}
                                style={{ accentColor: '#2A195C', width: '15px', height: '15px' }}
                              />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{zName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    The selected zone or scope will determine the user&apos;s data access.
                  </span>
                </div>

                {/* 3. Account Information */}
                <div className="ua-card">
                  <h3 className="ua-sec-title">
                    <div className="ua-icon-circle pink">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <span>Account Information</span>
                  </h3>

                  <div className="ua-form-row">
                    
                    {/* Status */}
                    <div className="ua-form-field">
                      <label className="ua-form-lbl">Account Status *</label>
                      <div className="ua-status-grid">
                        <div 
                          className={`ua-status-card ${status === 'Active' ? 'active' : ''}`}
                          onClick={() => setStatus('Active')}
                        >
                          <span className="ua-status-indicator green" />
                          <span className="ua-status-card-text">Active</span>
                          <div className={`ua-status-radio ${status === 'Active' ? 'active' : ''}`}>
                            {status === 'Active' && <span className="ua-status-radio-dot" />}
                          </div>
                        </div>
                        <div 
                          className={`ua-status-card ${status === 'Inactive' ? 'active' : ''}`}
                          onClick={() => setStatus('Inactive')}
                        >
                          <span className="ua-status-indicator red" />
                          <span className="ua-status-card-text">Inactive</span>
                          <div className={`ua-status-radio ${status === 'Inactive' ? 'active' : ''}`}>
                            {status === 'Inactive' && <span className="ua-status-radio-dot" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Temporary Password */}
                    <div className="ua-form-field">
                      <label className="ua-form-lbl">Temporary Password *</label>
                      <div className="ua-pwd-wrap">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          className="ua-pwd-inp"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="ua-pwd-actions">
                          <button 
                            type="button" 
                            className="ua-pwd-btn" 
                            title="Toggle password view"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            )}
                          </button>
                          <button 
                            type="button" 
                            className="ua-pwd-btn" 
                            title="Regenerate password"
                            onClick={generatePassword}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.56-.56"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  <span style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', marginTop: '-4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    User will be required to change password on first login.
                  </span>

                  {/* Send credentials via email checkbox */}
                  <div className="ua-checkbox-row" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '4px' }}>
                    <div 
                      className={`ua-checkbox ${sendEmail ? 'active' : ''}`}
                      onClick={() => setSendEmail(!sendEmail)}
                    >
                      {sendEmail && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="ua-checkbox-t" onClick={() => setSendEmail(!sendEmail)}>Send login credentials via email</div>
                      <div className="ua-checkbox-s">An email with login details and temporary password will be sent to the user.</div>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="ua-action-row">
                  <button 
                    type="button" 
                    className="ua-btn-outline"
                    onClick={() => router.push('/users')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="ua-btn-primary"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    <span>{editUserId ? 'Save Changes' : 'Create User'}</span>
                  </button>
                </div>

              </div>

              {/* Right Column widgets */}
              <div className="ua-right-col">
                
                {/* Stepper Card */}
                <div className="ua-right-card">
                  <h3 className="ua-right-title">
                    <div className="ua-right-title-ic">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <span>What happens next?</span>
                  </h3>

                  <div className="ua-steps">
                    <div className="ua-step-item">
                      <div className="ua-step-circle">1</div>
                      <span className="ua-step-text">User will receive an email with login credentials.</span>
                    </div>
                    <div className="ua-step-item">
                      <div className="ua-step-circle">2</div>
                      <span className="ua-step-text">User logs in with the temporary password.</span>
                    </div>
                    <div className="ua-step-item">
                      <div className="ua-step-circle">3</div>
                      <span className="ua-step-text">User will be prompted to set a new password.</span>
                    </div>
                    <div className="ua-step-item">
                      <div className="ua-step-circle">4</div>
                      <span className="ua-step-text">User can access the system based on their role and permissions.</span>
                    </div>
                  </div>
                </div>

                {/* Tip box */}
                <div className="ua-tip-card">
                  <div className="ua-tip-ic">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5h4z"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/></svg>
                  </div>
                  <div>
                    <span className="ua-tip-t">Tip</span>
                    <p className="ua-tip-desc">Assign the right role and zone to ensure users have appropriate access.</p>
                  </div>
                </div>

              </div>

            </form>

          </div>
        </div>

      </div>
    </>
  );
}

export default function AddUserPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
        <div style={{ fontSize: '14px', fontWeight: '600' }}>Loading...</div>
      </div>
    }>
      <AddUserPageContent />
    </Suspense>
  );
}
