"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import RoleGuard from '@/components/RoleGuard';
import { api } from '@/lib/api';

function AnimatedCount({ value }: { value: string | number }) {
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  useEffect(() => {
    const str = String(value);
    const numericMatch = str.match(/[\d.]+/g);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }
    const numericStr = numericMatch.join('');
    const target = parseFloat(numericStr);
    if (isNaN(target)) {
      setDisplayValue(value);
      return;
    }
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(start + easeProgress * (target - start));
      let formatted = String(current);
      if (str.includes('₹')) {
        formatted = '₹' + current.toLocaleString('en-IN');
      } else if (str.includes(',')) {
        formatted = current.toLocaleString('en-US');
      } else if (str.includes('%')) {
        formatted = current + '%';
      }
      setDisplayValue(formatted);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}</>;
}

const CSS = `

.usr-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; }
.usr-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.usr-body { padding: 20px 24px 60px; display: flex; flex-direction: column; gap: 20px; flex: 1; }

/* Breadcrumb */
.usr-bc { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748B; font-weight: 500; }
.usr-bc a { color: #64748B; text-decoration: none; font-weight: 500; }
.usr-bc a:hover { color: #6366F1; }
.usr-bc-sep { color: #CBD5E1; }
.usr-bc-cur { color: #0F172A; font-weight: 700; }

/* Title row */
.usr-title-row { display: flex; align-items: flex-start; justify-content: space-between; margin-top: -4px; }
.usr-h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0; font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; }
.usr-sub { font-size: 12.5px; color: #64748B; margin-top: 4px; font-weight: 500; }

/* KPI Stats cards */
.usr-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 4px; }
.usr-stat-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); transition: all .15s; }
.usr-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.04); border-color: #CBD5E1; }
.usr-stat-ic { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 800; }
.ic-purple { background: #EEF2FF; color: #6366F1; }
.ic-green { background: #ECFDF5; color: #10B981; }
.ic-orange { background: #FFF7ED; color: #F97316; }
.ic-blue { background: #EFF6FF; color: #2563EB; }

.usr-stat-info { flex: 1; display: flex; flex-direction: column; }
.usr-stat-lbl { font-size: 10.5px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
.usr-stat-val { font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1.2; margin-top: 2px; font-family: 'Outfit', sans-serif; }
.usr-growth { display: flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 700; margin-top: 4px; }
.usr-growth.up { color: #10B981; }
.usr-growth.down { color: #EF4444; }
.usr-growth.neutral { color: #64748B; }

/* Tab Switcher Row */
.usr-tab-row { display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #E2E8F0; margin-top: 10px; margin-bottom: 4px; }
.usr-tabs { display: flex; gap: 28px; }
.usr-tab-btn { padding: 12px 8px; font-size: 13.5px; font-weight: 700; color: #64748B; border: none; background: none; cursor: pointer; transition: all .15s; border-bottom: 3px solid transparent; margin-bottom: -1.5px; }
.usr-tab-btn:hover { color: #6366F1; }
.usr-tab-btn.active { color: #6366F1; border-bottom-color: #6366F1; font-weight: 800; }

/* Primary Button */
.usr-btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #6366F1; color: #fff; border: none; border-radius: 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all .15s; box-shadow: 0 4px 12px rgba(99,102,241,0.25); }
.usr-btn-primary:hover { background: #4f46e5; }

/* Filters Panel */
.usr-filter-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.usr-filter-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; align-items: center; }
.usr-search-wrap { position: relative; display: flex; align-items: center; }
.usr-search-input { width: 100%; padding: 8px 12px 8px 34px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; outline: none; transition: border-color .15s; font-weight: 500; }
.usr-search-input:focus { border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.usr-search-icon { position: absolute; left: 12px; color: #94A3B8; display: flex; align-items: center; }
.usr-select { padding: 8px 12px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 12.5px; outline: none; background: #fff; color: #334155; cursor: pointer; font-weight: 600; }
.usr-select:focus { border-color: #6366F1; }
.usr-reset-btn { font-size: 12.5px; font-weight: 700; color: #EF4444; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.usr-reset-btn:hover { text-decoration: underline; }

/* Table styling */
.usr-tcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; }
.usr-dt { width: 100%; border-collapse: collapse; }
.usr-dt th { font-size: 9.5px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: .05em; text-align: left; padding: 12px 18px; background: #F8FAFC; border-bottom: 1.5px solid #F1F5F9; }
.usr-dt td { padding: 12px 18px; font-size: 12.5px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.usr-dt tr:last-child td { border-bottom: none; }
.usr-dt tr:hover td { background: #F8FAFC; }

.usr-profile-cell { display: flex; align-items: center; gap: 10px; }
.usr-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.usr-avatar.purple { background: #8B5CF6; color: #fff; }
.usr-avatar.green { background: #10B981; color: #fff; }
.usr-avatar.orange { background: #F97316; color: #fff; }
.usr-avatar.blue { background: #3B82F6; color: #fff; }
.usr-avatar.pink { background: #FDF2F8; color: #DB2777; border: 1px solid #FBCFE8; }

.usr-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; border: 1px solid transparent; }
.badge-active { background: #DCFCE7; color: #15803D; border-color: #BBF7D0; }
.badge-inactive { background: #FEE2E2; color: #991B1B; border-color: #FCA5A5; }

/* Custom Role badges */
.role-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; border: 1px solid transparent; }
.role-badge.purple { background: #8B5CF6; color: #fff; }
.role-badge.blue { background: #3B82F6; color: #fff; }
.role-badge.orange { background: #F97316; color: #fff; }
.role-badge.teal { background: #14B8A6; color: #fff; }
.role-badge.indigo { background: #EEF2FF; color: #4338CA; border-color: #E0E7FF; }

/* Action Buttons */
.usr-act-btn { width: 30px; height: 30px; border: 1.5px solid #E2E8F0; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: #64748B; background: #fff; cursor: pointer; transition: all .15s; }
.usr-act-btn:hover { border-color: #2a195c; color: #2a195c; background: #F8FAFC; }
.usr-act-btn-group { display: flex; gap: 6px; }

/* Pagination footer */
.usr-tcard-ft { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-top: 1.5px solid #E2E8F0; background: #FAFBFD; }
.usr-tcard-ft-lbl { font-size: 12px; color: #64748B; font-weight: 500; }
.usr-pg { display: flex; align-items: center; gap: 4px; }
.usr-pgb { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 600; color: #64748B; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
.usr-pgb:hover:not(:disabled) { border-color: #2a195c; color: #2a195c; }
.usr-pgb.cur { background: #2a195c; color: #fff; border-color: #2a195c; }
.usr-pgb:disabled { opacity: 0.5; cursor: not-allowed; }
.usr-pg-select { padding: 4px 8px; border: 1.5px solid #E2E8F0; border-radius: 6px; font-size: 12px; outline: none; font-weight: 500; background: #fff; height: 28px; cursor: pointer; }

/* Roles section header */
.usr-roles-hdr { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; margin-bottom: 16px; }
.usr-roles-tit { font-size: 16px; font-weight: 800; color: #0F172A; margin: 0; }

@keyframes drawPath {
  to { stroke-dashoffset: 0; }
}
@keyframes growBar {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-draw {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawPath 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.animate-draw-large {
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: drawPath 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.animate-scale-in {
  transform-origin: center;
  animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.animate-grow-bar {
  transform-origin: bottom;
  animation: growBar 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
`;

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  zone: string;
  status: 'Active' | 'Inactive';
  last_login: string | null;
  avatar_url?: string;
}

interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  users_count: number;
  last_updated: string;
}

export default function UsersPage({ defaultTab = 0 }: { defaultTab?: number } = {}) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'users' | 'roles'>(() => {
    if (defaultTab === 1) return 'roles';
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('tab') === '1' || p.get('tab') === 'roles') return 'roles';
    }
    return 'users';
  });
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedZone, setSelectedZone] = useState('All Zones');

  const [selectedRoleMatrix, setSelectedRoleMatrix] = useState<any | null>(null);
  const [isRoleMatrixOpen, setIsRoleMatrixOpen] = useState(false);

  const openRoleMatrixModal = (role: any) => {
    setSelectedRoleMatrix(role);
    setIsRoleMatrixOpen(true);
  };

  const fetchUsers = async () => {
    try {
      const data = await api.get('/users');
      if (data && data.data) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await api.get('/roles');
      if (data && data.data) {
        setRoles(data.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Filter logic
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const nameVal = u.name || '';
      const emailVal = u.email || '';
      const mobileVal = u.mobile || '';
      const idVal = u.id || '';
      const matchesSearch = 
        nameVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emailVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mobileVal.includes(searchQuery) ||
        idVal.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = selectedRole === 'All Roles' || u.role === selectedRole;
      const matchesStatus = selectedStatus === 'All Status' || u.status === selectedStatus;
      const matchesZone = selectedZone === 'All Zones' || (u.zone && u.zone.includes(selectedZone));

      return matchesSearch && matchesRole && matchesStatus && matchesZone;
    });
  }, [users, searchQuery, selectedRole, selectedStatus, selectedZone]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRole('All Roles');
    setSelectedStatus('All Status');
    setSelectedZone('All Zones');
  };

  // Avatar helper
  const getAvatarConfig = (id: string, name: string, avatarUrl?: string) => {
    const initials = name ? name.split(' ').map(n=>n[0]).join('').toUpperCase() : '?';
    if (avatarUrl) {
      return { isImage: true, url: avatarUrl, initials };
    }
    let cls = 'pink';
    if (id && id.endsWith('1')) cls = 'purple';
    else if (id && id.endsWith('2')) cls = 'green';
    else if (id && id.endsWith('3')) cls = 'orange';
    else if (id && id.endsWith('4')) cls = 'blue';
    return { isImage: false, cls, text: initials };
  };

  // Role style helper
  const getRoleStyleClass = (roleName: string) => {
    if (roleName === 'Zone Admin') return 'purple';
    if (roleName === 'Operations Manager') return 'blue';
    if (roleName === 'Franchise Manager') return 'orange';
    if (roleName === 'Battery Technician') return 'teal';
    return 'indigo';
  };

  const handleEditUser = (id: string) => {
    router.push(`/users/add?edit=${id}`);
  };

  const handleViewUser = (id: string) => {
    router.push(`/users/detail?id=${id}`);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm(`Are you sure you want to delete user ${id}?`)) {
      try {
        await api.delete(`/users/${id}`);
        alert('User deleted successfully!');
        fetchUsers();
        fetchRoles();
      } catch (err: any) {
        console.error(err);
        alert(`Error: ${err.message || 'Failed to delete user'}`);
      }
    }
  };

  const handleDeleteRole = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete role "${name}"?`)) {
      try {
        await api.delete(`/roles/${id}`);
        alert('Role deleted successfully!');
        fetchRoles();
      } catch (err: any) {
        console.error(err);
        alert(`Error: ${err.message || 'Failed to delete role'}`);
      }
    }
  };

  return (
    <RoleGuard moduleName="Users & Roles">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="usr-shell">
        <Sidebar activePath={activeSection === 'roles' ? '/roles' : '/users'} />
        
        <div className="usr-main">
          
          <TopBar 
            notificationCount={3}
            showSearch={false}
            hideZone={false}
          />
          
          <div className="usr-body">
            
            {/* Breadcrumb */}
            <div className="usr-bc">
              <a href="#">Settings</a>
              <span className="usr-bc-sep">&gt;</span>
              <a href="#">Users &amp; Roles</a>
              <span className="usr-bc-sep">&gt;</span>
              <span className="usr-bc-cur">Users</span>
            </div>

            {/* Title Section */}
            <div className="usr-title-row">
              <div>
                <h1 className="usr-h1">User &amp; Role Management</h1>
                <p className="usr-sub">Manage platform users and roles, permissions and access</p>
              </div>
            </div>

            {/* Tab Swi & Actions */}
            <div className="usr-tab-row">
              <div className="usr-tabs">
                <button 
                  className={`usr-tab-btn ${activeSection === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveSection('users')}
                >
                  Users
                </button>
                <button 
                  className={`usr-tab-btn ${activeSection === 'roles' ? 'active' : ''}`}
                  onClick={() => setActiveSection('roles')}
                >
                  Roles
                </button>
              </div>
              <div>
                {activeSection === 'users' ? (
                  <button className="usr-btn-primary" onClick={() => router.push('/users/add')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Add User</span>
                  </button>
                ) : (
                  <button className="usr-btn-primary" onClick={() => router.push('/roles/add')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Add Role</span>
                  </button>
                )}
              </div>
            </div>

            {/* Conditional Tab Rendering */}
            {activeSection === 'users' ? (
              <div id="users-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Users KPI Stats cards */}
                <div className="usr-stats-row">
                  <div className="usr-stat-card">
                    <div className="usr-stat-ic ic-purple">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className="usr-stat-info">
                      <span className="usr-stat-lbl">Total Users</span>
                      <span className="usr-stat-val"><AnimatedCount value={users.length} /></span>
                      <div className="usr-growth up">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                        <span>Active members live</span>
                      </div>
                    </div>
                  </div>

                  <div className="usr-stat-card">
                    <div className="usr-stat-ic ic-green">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <polyline points="16 11 18 13 22 9" />
                      </svg>
                    </div>
                    <div className="usr-stat-info">
                      <span className="usr-stat-lbl">Active Users</span>
                      <span className="usr-stat-val"><AnimatedCount value={users.filter(u => u.status === 'Active').length} /></span>
                      <div className="usr-growth up">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                        <span>System online</span>
                      </div>
                    </div>
                  </div>

                  <div className="usr-stat-card">
                    <div className="usr-stat-ic ic-orange">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <div className="usr-stat-info">
                      <span className="usr-stat-lbl">Inactive Users</span>
                      <span className="usr-stat-val"><AnimatedCount value={users.filter(u => u.status === 'Inactive').length} /></span>
                      <div className="usr-growth down">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                        <span>Suspended / offline</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users filters */}
                <div className="usr-filter-card">
                  <div className="usr-filter-grid">
                    <div className="usr-search-wrap">
                      <span className="usr-search-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </span>
                      <input 
                        type="text" 
                        placeholder="Search by name, email or mobile" 
                        className="usr-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <select className="usr-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                      <option value="All Roles">All Roles</option>
                      {roles.map(r => (
                        <option key={r.id || r.name} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                    <select className="usr-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                      <option value="All Status">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <select className="usr-select" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
                      <option value="All Zones">All Zones</option>
                      <option value="Gotri Zone">Gotri Zone</option>
                      <option value="Lekki Phase 1">Lekki Phase 1</option>
                      <option value="Vadodara Main Zone">Vadodara Main Zone</option>
                      <option value="Alkapuri Zone">Alkapuri Zone</option>
                      <option value="Subhanpura Zone">Subhanpura Zone</option>
                      <option value="Akota Zone">Akota Zone</option>
                      <option value="Daman Zone">Daman Zone</option>
                      <option value="Multiple Zones">Multiple Zones</option>
                    </select>
                    <div>
                      {(searchQuery || selectedRole !== 'All Roles' || selectedStatus !== 'All Status' || selectedZone !== 'All Zones') && (
                        <button className="usr-reset-btn" onClick={resetFilters}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.56-.56"/></svg>
                          <span>Reset</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Users table */}
                <div className="usr-tcard">
                  <table className="usr-dt">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Zone / Scope</th>
                        <th>Mobile / Email</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                            No users match the active filters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => {
                          const av = getAvatarConfig(u.id, u.name, u.avatar_url);
                          const rCls = getRoleStyleClass(u.role);
                          
                          let lastLoginText = 'Never logged in';
                          if (u.last_login) {
                            lastLoginText = new Date(u.last_login).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            });
                          }

                          return (
                            <tr key={u.id}>
                              <td>
                                <div className="usr-profile-cell">
                                  {av.isImage ? (
                                    <img src={av.url} className="usr-avatar" style={{ objectFit: 'cover', border: '1px solid #E2E8F0' }} alt="User avatar" />
                                  ) : (
                                    <div className={`usr-avatar ${av.cls}`}>{av.text}</div>
                                  )}
                                  <div>
                                    <div style={{ fontWeight: '700', color: '#0F172A' }}>{u.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1.5px' }}>
                                      ID: {u.id.substring(0, 8)}...
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`role-badge ${rCls}`}>{u.role}</span>
                              </td>
                              <td style={{ fontWeight: '500' }}>{u.zone || 'Global'}</td>
                              <td>
                                <div style={{ fontWeight: '600', color: '#334155' }}>{u.mobile || 'N/A'}</div>
                                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2.5px' }}>{u.email}</div>
                              </td>
                              <td>
                                <span className={`usr-badge ${u.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                                  {u.status}
                                </span>
                              </td>
                              <td style={{ fontSize: '12.5px', color: '#334155', fontWeight: '500' }}>{lastLoginText}</td>
                              <td>
                                <div className="usr-act-btn-group">
                                  <button className="usr-act-btn" title="View details" onClick={() => handleViewUser(u.id)}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                  </button>
                                  <button className="usr-act-btn" title="Edit details" onClick={() => handleEditUser(u.id)}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  </button>
                                  <button className="usr-act-btn" title="Delete account" onClick={() => handleDeleteUser(u.id)}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {/* Table pagination */}
                  <div className="usr-tcard-ft">
                    <div className="usr-tcard-ft-lbl">Showing 1 to {filteredUsers.length} of {users.length} users</div>
                    <div className="usr-pg">
                      <button className="usr-pgb" disabled>&lt;</button>
                      <button className="usr-pgb cur">1</button>
                      <button className="usr-pgb">&gt;</button>
                      <select className="usr-pg-select" defaultValue="50 / page">
                        <option>10 / page</option>
                        <option>20 / page</option>
                        <option>50 / page</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div id="roles-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Roles KPI Stats cards */}
                <div className="usr-stats-row">
                  <div className="usr-stat-card">
                    <div className="usr-stat-ic ic-blue">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div className="usr-stat-info">
                      <span className="usr-stat-lbl">Total Roles</span>
                      <span className="usr-stat-val"><AnimatedCount value={roles.length} /></span>
                      <div className="usr-growth neutral">
                        <span>Access templates</span>
                      </div>
                    </div>
                  </div>

                  <div className="usr-stat-card">
                    <div className="usr-stat-ic ic-green">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div className="usr-stat-info">
                      <span className="usr-stat-lbl">Active Roles</span>
                      <span className="usr-stat-val"><AnimatedCount value={roles.filter(r => r.users_count > 0).length} /></span>
                      <div className="usr-growth up">
                        <span>Roles in use</span>
                      </div>
                    </div>
                  </div>

                  <div className="usr-stat-card">
                    <div className="usr-stat-ic ic-orange">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <div className="usr-stat-info">
                      <span className="usr-stat-lbl">Unused Roles</span>
                      <span className="usr-stat-val"><AnimatedCount value={roles.filter(r => r.users_count === 0).length} /></span>
                      <div className="usr-growth neutral">
                        <span>Ready to assign</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Roles Table card */}
                <div className="usr-tcard" style={{ marginBottom: '40px' }}>
                  <table className="usr-dt">
                    <thead>
                      <tr>
                        <th>Role Name</th>
                        <th style={{ width: '45%' }}>Description</th>
                        <th>Users Assigned</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                            No roles defined.
                          </td>
                        </tr>
                      ) : (
                        roles.map(r => {
                          let lastUpdatedText = 'N/A';
                          if (r.last_updated) {
                            lastUpdatedText = new Date(r.last_updated).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            });
                          }

                          return (
                            <tr key={r.id}>
                              <td style={{ fontWeight: '700', color: '#0F172A' }}>
                                <div>{r.name}</div>
                                <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '500', marginTop: '2px' }}>CODE: {r.code}</div>
                              </td>
                              <td style={{ color: '#475569', fontWeight: '500' }}>{r.description || 'No description provided.'}</td>
                              <td style={{ fontWeight: '700', color: '#2a195c' }}>{r.users_count}</td>
                              <td style={{ fontWeight: '500', color: '#334155' }}>{lastUpdatedText}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button 
                                    className="role-btn-edit"
                                    onClick={() => router.push(`/roles/add?id=${r.id}`)}
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
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit Role
                                  </button>
                                  <button 
                                    className="usr-act-btn" 
                                    title="Delete role" 
                                    onClick={() => handleDeleteRole(r.id, r.name)}
                                    style={{
                                      border: '1.5px solid #FEE2E2',
                                      color: '#EF4444'
                                    }}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {/* Roles table pagination footer */}
                  <div className="usr-tcard-ft">
                    <div className="usr-tcard-ft-lbl">Showing 1 to {roles.length} of {roles.length} roles</div>
                    <div className="usr-pg">
                      <button className="usr-pgb" disabled>&lt;</button>
                      <button className="usr-pgb cur">1</button>
                      <button className="usr-pgb">&gt;</button>
                      <select className="usr-pg-select" defaultValue="50 / page">
                        <option>50 / page</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      {/* ROLE PERMISSIONS & MODULE ACCESS MATRIX MODAL */}
      {isRoleMatrixOpen && selectedRoleMatrix && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1.5px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>🛡️ Role Permissions Matrix — {selectedRoleMatrix.name}</span>
                <span style={{ marginLeft: '10px', fontSize: '11px', background: '#EEF2FF', color: '#6366F1', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                  {selectedRoleMatrix.code || 'ROLE'}
                </span>
              </div>
              <button style={{ border: 'none', background: 'none', fontSize: '20px', color: '#94A3B8', cursor: 'pointer' }} onClick={() => { setIsRoleMatrixOpen(false); setSelectedRoleMatrix(null); }}>&times;</button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12.5px', color: '#475569' }}>
                  <strong>Role Description:</strong> {selectedRoleMatrix.description || 'Configured access template.'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', minWidth: '160px' }}>Assigned Dashboard View:</label>
                  <select 
                    style={{ flex: 1, padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', fontWeight: '600', color: '#1E293B', background: '#fff', outline: 'none' }}
                    defaultValue="Super Admin Dashboard"
                  >
                    <option value="Super Admin Dashboard">Super Admin Dashboard</option>
                    <option value="Zone Admin Dashboard">Zone Admin Dashboard</option>
                    <option value="Operations Manager Dashboard">Operations Manager Dashboard</option>
                    <option value="Support Executive Dashboard">Support Executive Dashboard</option>
                    <option value="Franchise Manager Dashboard">Franchise Manager Dashboard</option>
                    <option value="BMS Battery Dashboard">BMS Battery Dashboard</option>
                    <option value="Fleet Manager Dashboard">Fleet Manager Dashboard</option>
                    <option value="Finance Manager Dashboard">Finance Manager Dashboard</option>
                  </select>
                </div>
              </div>

              {/* Module Access Matrix Table */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#FAFBFD', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '700', color: '#64748B', padding: '10px 14px', textAlign: 'left' }}>Module Name</th>
                      <th style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '700', color: '#64748B', padding: '10px 14px', textAlign: 'center' }}>View</th>
                      <th style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '700', color: '#64748B', padding: '10px 14px', textAlign: 'center' }}>Create</th>
                      <th style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '700', color: '#64748B', padding: '10px 14px', textAlign: 'center' }}>Edit</th>
                      <th style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '700', color: '#64748B', padding: '10px 14px', textAlign: 'center' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      'Dashboard (Auto-Assigned)',
                      'Users & System Roles',
                      'Registrations & Returns',
                      'Vehicles Catalog & Active Rides',
                      'Riders & Reserved Rides',
                      'Zone Management & Geofence',
                      'Franchise & Subscriptions',
                      'Battery Inventory & BMS',
                      'Fleet Maintenance & Service Logs',
                      'IoT Devices & GPS Telemetry',
                      'Financials & Payments Ledger',
                      'Staff Attendance & Shifts',
                      'Analytics & Reports',
                      'System Alerts Telemetry',
                      'Announcements & Broadcasts',
                      'Co2 Saving & Carbon Credits',
                      'System Settings & Preferences'
                    ].map((mod, idx) => {
                      const isFullAdmin = selectedRoleMatrix.code === 'SUPER_ADMIN' || selectedRoleMatrix.code === 'ADMIN' || selectedRoleMatrix.code === 'SF_001';
                      const isDash = idx === 0;
                      return (
                        <tr key={mod} style={{ borderBottom: '1px solid #F1F5F9', background: isDash ? '#F5F3FF' : 'transparent' }}>
                          <td style={{ padding: '10px 14px', fontWeight: '700', color: isDash ? '#6366F1' : '#0F172A' }}>{mod}</td>
                          <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked={true} disabled={isDash || isFullAdmin} /></td>
                          <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked={isDash || isFullAdmin || idx % 2 === 0} disabled={isDash || isFullAdmin} /></td>
                          <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked={isDash || isFullAdmin || idx < 8} disabled={isDash || isFullAdmin} /></td>
                          <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked={isDash || isFullAdmin} disabled={isDash || isFullAdmin} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1.5px solid #F1F5F9', background: '#FAFBFD', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="usr-btn-outline" onClick={() => { setIsRoleMatrixOpen(false); setSelectedRoleMatrix(null); }}>Cancel</button>
              <button className="usr-btn-primary" onClick={async () => {
                try {
                  await api.put(`/roles/${selectedRoleMatrix.id}`, {
                    name: selectedRoleMatrix.name,
                    code: selectedRoleMatrix.code,
                    description: selectedRoleMatrix.description,
                    permissions: {
                      Dashboard: { access: true, create: true, view: true, edit: true, delete: true, export: true },
                      ...(selectedRoleMatrix.permissions || {})
                    }
                  });
                  alert(`Role matrix & dashboard permissions updated for ${selectedRoleMatrix.name}!`);
                  fetchRoles();
                } catch (e) {
                  console.error(e);
                }
                setIsRoleMatrixOpen(false);
                setSelectedRoleMatrix(null);
              }}>Save Role Matrix</button>
            </div>
          </div>
        </div>
      )}

      </div>
    </RoleGuard>
  );
}
