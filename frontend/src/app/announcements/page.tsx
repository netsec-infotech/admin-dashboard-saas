"use client";
import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Link from 'next/link';

const CSS = `
.an-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.an-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.an-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Custom top bar for announcements user welcome */
.an-top-info { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: #fff; border-bottom: 1px solid #E2E8F0; }
.an-user-greet { display: flex; align-items: center; gap: 10px; }
.an-user-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; background: #2a195c; color: #fff; font-size: 13px; font-weight: bold; display: flex; align-items: center; justify-content: center; }
.an-user-text { display: flex; flex-direction: column; }
.an-user-name { font-size: 13.5px; font-weight: 700; color: #1E293B; }
.an-user-role { font-size: 11.5px; color: #64748B; }

.an-top-actions { display: flex; align-items: center; gap: 16px; }
.an-zone-select { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #334155; background: #fff; cursor: pointer; }
.an-bell-btn { position: relative; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #E2E8F0; display: flex; align-items: center; justify-content: center; color: #475569; background: #fff; cursor: pointer; }
.an-bell-badge { position: absolute; top: -2px; right: -2px; width: 16px; height: 16px; border-radius: 50%; background: #2a195c; color: #fff; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }

/* Header title */
.an-title-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 4px; }
.an-header-title-wrap { display: flex; align-items: center; gap: 14px; }
.an-header-ic { width: 44px; height: 44px; border-radius: 10px; background: #EEF2FF; color: #2A195C; display: flex; align-items: center; justify-content: center; }
.an-h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; letter-spacing: -0.02em; }
.an-sub { font-size: 13px; color: #64748B; margin: 0; font-weight: 400; }

.an-btn { display: flex; align-items: center; gap: 7px; padding: 10px 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; }
.an-btn:hover { border-color: #2a195c; color: #2a195c; }
.an-btn-primary { background: #2A195C; color: #fff; border-color: #2A195C; }
.an-btn-primary:hover { background: #4338CA; border-color: #4338CA; color: #fff; }

/* Tabs categories */
.an-tabs-card { border-bottom: 1px solid #E2E8F0; margin-bottom: 4px; overflow-x: auto; }
.an-tabs-list { display: flex; gap: 24px; }
.an-tab { padding: 12px 4px 14px; font-size: 13.5px; font-weight: 600; color: #64748B; cursor: pointer; border-bottom: 2.5px solid transparent; transition: all .15s; white-space: nowrap; background: transparent; border-top: none; border-left: none; border-right: none; }
.an-tab:hover { color: #2A195C; }
.an-tab.active { color: #2A195C; border-color: #2A195C; font-weight: 700; }

/* Filter bar panel */
.an-filter-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.an-filter-grid { display: grid; grid-template-columns: 2.5fr 1.25fr 1.25fr 1.25fr 1.25fr auto auto; gap: 10px; align-items: center; }
.an-search-wrap { position: relative; }
.an-search-input { width: 100%; padding: 8px 12px 8px 34px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; outline: none; transition: border-color .15s; }
.an-search-input:focus { border-color: #2A195C; }
.an-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94A3B8; display: flex; align-items: center; }

.an-select { width: 100%; padding: 8px 10px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12.5px; outline: none; background: #fff; color: #334155; cursor: pointer; }
.an-select:focus { border-color: #2A195C; }

.an-filter-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; color: #64748B; cursor: pointer; }
.an-filter-btn:hover { border-color: #2A195C; color: #2A195C; }

/* Layout Grid */
.an-layout-grid { display: grid; grid-template-columns: 2.2fr 1fr; gap: 20px; align-items: start; }
.an-left-col { display: flex; flex-direction: column; gap: 16px; }

/* Table styling */
.an-tcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; display: flex; flex-direction: column; }
.an-tbl-wrap { overflow-x: auto; }
.an-tbl { width: 100%; border-collapse: collapse; min-width: 900px; }
.an-tbl th { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: .06em; text-align: left; padding: 12px 14px; background: #FAFBFD; border-bottom: 1px solid #E2E8F0; }
.an-tbl td { padding: 12px 14px; font-size: 12.5px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.an-tbl tr:last-child td { border-bottom: none; }
.an-tbl tr:hover td { background: #F8FAFC; }

/* Custom columns */
.an-cell-chk { width: 40px; text-align: center; }
.an-cell-ann { display: flex; align-items: flex-start; gap: 12px; }
.an-ann-ic { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ic-general { background: #8B5CF6; color: #fff; }
.ic-update { background: #10B981; color: #fff; }
.ic-alert { background: #EF4444; color: #fff; }
.ic-maintenance { background: #3B82F6; color: #fff; }

.an-ann-info { display: flex; flex-direction: column; min-width: 0; }
.an-ann-title { font-size: 13px; font-weight: 700; color: #1E293B; }
.an-ann-desc { font-size: 11.5px; color: #64748B; margin-top: 2px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 250px; }

/* Badges */
.an-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
.badge-general { background: #F3E8FF; color: #7E22CE; }
.badge-update { background: #ECFDF5; color: #059669; }
.badge-alert { background: #FFF7ED; color: #C2410C; }
.badge-maintenance { background: #EFF6FF; color: #1D4ED8; }

.badge-users { background: #EFF6FF; color: #1D4ED8; }
.badge-employees { background: #F1F5F9; color: #475569; }
.badge-staff { background: #FFF1F2; color: #E11D48; }

.badge-high { background: #FEE2E2; color: #B91C1C; }
.badge-medium { background: #FEF3C7; color: #D97706; }
.badge-low { background: #F1F5F9; color: #475569; }

.badge-published { background: #DCFCE7; color: #15803D; }
.badge-scheduled { background: #EFF6FF; color: #1D4ED8; }
.badge-draft { background: #F1F5F9; color: #475569; }
.badge-expired { background: #FEE2E2; color: #B91C1C; }

/* Table Actions buttons */
.an-action-row { display: flex; align-items: center; gap: 6px; }
.an-eye-btn { width: 26px; height: 26px; border: 1.5px solid #E2E8F0; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #64748B; background: #fff; cursor: pointer; }
.an-eye-btn:hover { border-color: #2A195C; color: #2A195C; }
.an-dots-btn { background: none; border: none; color: #94A3B8; cursor: pointer; display: flex; align-items: center; font-size: 16px; }

.an-tcard-ft { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-top: 1px solid #E2E8F0; background: #FAFBFD; }
.an-tcard-ft-lbl { font-size: 12.5px; color: #64748B; font-weight: 500; }
.an-pg { display: flex; align-items: center; gap: 4px; }
.an-pgb { width: 28px; height: 28px; border: 1.5px solid #E2E8F0; border-radius: 6px; background: #fff; font-size: 12.5px; font-weight: 700; color: #475569; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
.an-pgb:hover:not(:disabled) { border-color: #2A195C; color: #2A195C; }
.an-pgb.cur { background: #2A195C; color: #fff; border-color: #2A195C; }
.an-pgb:disabled { opacity: 0.5; cursor: not-allowed; }

.an-limit-select { padding: 6px 10px; border: 1.5px solid #E2E8F0; border-radius: 6px; font-size: 12px; font-weight: 600; outline: none; background: #fff; color: #475569; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; background-size: 10px; padding-right: 24px; }

/* Right Column Sidebar */
.an-sidebar { display: flex; flex-direction: column; gap: 16px; }
.an-side-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.02); }
.an-side-tit { font-size: 13.5px; font-weight: 700; color: #0F172A; margin-bottom: 12px; display:block; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px; }

/* Summary List items */
.an-sum-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F8FAFC; }
.an-sum-item:last-child { border-bottom: none; }
.an-sum-l { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #475569; font-weight: 500; }
.an-sum-ic { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.an-sum-val { font-size: 13px; font-weight: 700; color: #1E293B; }

/* Quick actions */
.an-qa-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F8FAFC; cursor: pointer; }
.an-qa-row:last-child { border-bottom: none; }
.an-qa-row:hover .an-qa-name { color: #2A195C; }
.an-qa-ic { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #EEF2FF; color: #2A195C; }
.an-qa-meta { display: flex; flex-direction: column; }
.an-qa-name { font-size: 12.5px; font-weight: 700; color: #1E293B; transition: color .12s; }
.an-qa-sub { font-size: 11px; color: #64748B; margin-top: 1px; }

/* Recent Announcements */
.an-rec-row { display: flex; flex-direction: column; gap: 4px; padding: 8px 0; border-bottom: 1px solid #F8FAFC; }
.an-rec-row:last-child { border-bottom: none; }
.an-rec-t { font-size: 12.5px; font-weight: 700; color: #1E293B; display: flex; align-items: center; gap: 6px; }
.an-rec-dot { width: 6px; height: 6px; border-radius: 50%; }
.an-rec-d { font-size: 11px; color: #94A3B8; font-weight: 500; }
`;

interface AnnouncementRow {
  title: string;
  desc: string;
  type: 'General' | 'Update' | 'Alert' | 'Maintenance';
  audience: 'All Users' | 'Employees' | 'Zone Staff';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Published' | 'Scheduled' | 'Draft' | 'Expired';
  publishedOn: string;
  expiresOn: string;
  createdBy: string;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementRow[] = [
  {
    title: 'New Service Center Launched in JP Nagar',
    desc: 'We are excited to announce the launch of our service center in JP Nagar to serve you better.',
    type: 'General',
    audience: 'All Users',
    priority: 'High',
    status: 'Published',
    publishedOn: 'May 17, 2024 10:30 AM',
    expiresOn: 'May 31, 2024 11:59 PM',
    createdBy: 'John Doe'
  },
  {
    title: 'Battery Maintenance Guidelines',
    desc: 'Please follow the updated battery maintenance guidelines to ensure optimal performance.',
    type: 'Update',
    audience: 'Employees',
    priority: 'Medium',
    status: 'Published',
    publishedOn: 'May 15, 2024 09:15 AM',
    expiresOn: 'Jun 15, 2024 11:59 PM',
    createdBy: 'John Doe'
  },
  {
    title: 'High Temperature Alert',
    desc: 'High temperatures are expected in the next few days. Please take necessary precautions.',
    type: 'Alert',
    audience: 'All Users',
    priority: 'High',
    status: 'Published',
    publishedOn: 'May 14, 2024 02:00 PM',
    expiresOn: 'May 20, 2024 11:59 PM',
    createdBy: 'John Doe'
  },
  {
    title: 'System Maintenance Scheduled',
    desc: 'Our system will undergo maintenance on May 20, 2024 from 10:00 PM to 12:00 AM.',
    type: 'Maintenance',
    audience: 'All Users',
    priority: 'Medium',
    status: 'Scheduled',
    publishedOn: '—',
    expiresOn: 'May 20, 2024 11:59 PM',
    createdBy: 'John Doe'
  },
  {
    title: 'New Inward Process Update',
    desc: 'The inward process has been updated for better tracking and faster processing. Please review.',
    type: 'Update',
    audience: 'Employees',
    priority: 'Low',
    status: 'Draft',
    publishedOn: '—',
    expiresOn: '—',
    createdBy: 'John Doe'
  },
  {
    title: 'Evegah 2nd Anniversary Celebration',
    desc: 'Thank you for being a part of our journey. Join us in celebrating our 2nd anniversary!',
    type: 'General',
    audience: 'All Users',
    priority: 'Low',
    status: 'Scheduled',
    publishedOn: '—',
    expiresOn: 'May 25, 2024 11:59 PM',
    createdBy: 'John Doe'
  },
  {
    title: 'Geofence Boundary Update',
    desc: 'New geofence boundaries have been updated for South Depot zone. Please check the map.',
    type: 'Update',
    audience: 'Zone Staff',
    priority: 'High',
    status: 'Expired',
    publishedOn: 'May 01, 2024 10:00 AM',
    expiresOn: 'May 10, 2024 11:59 PM',
    createdBy: 'John Doe'
  },
  {
    title: 'Holiday Notice',
    desc: 'Offices will remain closed on May 19, 2024 on account of regional holiday.',
    type: 'General',
    audience: 'Employees',
    priority: 'Low',
    status: 'Expired',
    publishedOn: 'Apr 25, 2024 04:30 PM',
    expiresOn: 'May 19, 2024 11:59 PM',
    createdBy: 'John Doe'
  }
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Announcements');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [audienceFilter, setAudienceFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAnnouncements = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/announcements`);
      if (res.ok) {
        const body = await res.json();
        setAnnouncements(body.data || []);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all announcements?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/announcements/clear-all`, { method: 'POST' });
      setAnnouncements([]);
      alert('All announcements cleared!');
    } catch (_) {
      alert('Failed to clear announcements');
    }
  };

  // Filter logic
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const title = a.title || '';
      const desc = a.description || a.desc || '';
      const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || desc.toLowerCase().includes(search.toLowerCase());

      const type = a.category || a.type || 'General';
      const audience = a.target_audience || a.audience || 'All Users';
      const priority = a.priority || 'Medium';
      const status = a.status || 'Published';

      const matchType = typeFilter === 'All' || type === typeFilter;
      const matchAudience = audienceFilter === 'All' || audience === audienceFilter;
      const matchPriority = priorityFilter === 'All' || priority === priorityFilter;
      
      let matchStatus = true;
      if (statusFilter !== 'All') {
        matchStatus = status === statusFilter;
      } else if (activeTab !== 'All Announcements') {
        matchStatus = status === activeTab;
      }

      return matchSearch && matchType && matchAudience && matchPriority && matchStatus;
    });
  }, [announcements, search, typeFilter, audienceFilter, priorityFilter, statusFilter, activeTab]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="an-shell">
        <Sidebar activePath="/announcements" />
        <div className="an-main">
          <TopBar />

          <div className="an-page">
            {/* Header section */}
            <div className="an-title-row">
              <div className="an-header-title-wrap">
                <div className="an-header-ic">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div>
                  <h1 className="an-h1">Announcements</h1>
                  <p className="an-sub">Create, manage and publish important updates and announcements.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="an-btn"
                  style={{ color: '#EF4444', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                  onClick={handleClearAll}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Clear All Announcements
                </button>
                <Link href="/announcements/new" className="an-btn an-btn-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 2 }}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create Announcement
                </Link>
              </div>
            </div>

            {/* Category tabs */}
            <div className="an-tabs-card">
              <div className="an-tabs-list">
                {['All Announcements', 'Published', 'Scheduled', 'Drafts', 'Expired'].map((tab) => (
                  <button
                    key={tab}
                    className={`an-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => { setActiveTab(tab); setStatusFilter('All'); }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Split Grid */}
            <div className="an-layout-grid">
              {/* Left Column list */}
              <div className="an-left-col">
                {/* Filters card */}
                <div className="an-filter-card">
                  <div className="an-filter-grid">
                    <div className="an-search-wrap">
                      <span className="an-search-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        className="an-search-input"
                        placeholder="Search by title or content..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    <div>
                      <select className="an-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="All">All Types</option>
                        <option value="General">General</option>
                        <option value="Update">Update</option>
                        <option value="Alert">Alert</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div>
                      <select className="an-select" value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value)}>
                        <option value="All">All Audience</option>
                        <option value="All Users">All Users</option>
                        <option value="Employees">Employees</option>
                        <option value="Zone Staff">Zone Staff</option>
                      </select>
                    </div>

                    <div>
                      <select className="an-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                        <option value="All">All Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div>
                      <select className="an-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} disabled={activeTab !== 'All Announcements'}>
                        <option value="All">All Status</option>
                        <option value="Published">Published</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Draft">Draft</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>

                    <button className="an-filter-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                      </svg>
                    </button>

                    <button className="an-filter-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Table list */}
                <div className="an-tcard">
                  <div className="an-tbl-wrap">
                    <table className="an-tbl">
                      <thead>
                        <tr>
                          <th className="an-cell-chk">
                            <input type="checkbox" />
                          </th>
                          <th style={{ minWidth: '220px' }}>Announcement</th>
                          <th>Type</th>
                          <th>Audience</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Published On</th>
                          <th>Expires On</th>
                          <th>Created By</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAnnouncements.length === 0 ? (
                          <tr>
                            <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                              No announcements found matching the filters.
                            </td>
                          </tr>
                        ) : (
                          filteredAnnouncements.map((row, idx) => {
                            const type = row.type || row.category || 'General';
                            const audience = row.audience || row.target_audience || 'All Users';
                            const priority = row.priority || 'Medium';
                            const status = row.status || 'Published';
                            const publishedOn = row.publishedOn || (row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : '—');
                            const expiresOn = row.expiresOn || '—';
                            const createdBy = row.createdBy || row.author || 'System';
                            
                            return (
                            <tr key={idx}>
                              <td className="an-cell-chk">
                                <input type="checkbox" />
                              </td>
                              <td>
                                <div className="an-cell-ann">
                                  <div className={`an-ann-ic ${type === 'General' ? 'ic-general' : type === 'Update' ? 'ic-update' : type === 'Alert' ? 'ic-alert' : 'ic-maintenance'}`}>
                                    {type === 'General' && (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><circle cx="12" cy="12" r="3" />
                                      </svg>
                                    )}
                                    {type === 'Update' && (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                      </svg>
                                    )}
                                    {type === 'Alert' && (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                      </svg>
                                    )}
                                    {type === 'Maintenance' && (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="an-ann-info">
                                    <span className="an-ann-title">{row.title}</span>
                                    <span className="an-ann-desc">{row.desc || row.description}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`an-badge badge-${type.toLowerCase()}`}>{type}</span>
                              </td>
                              <td>
                                <span className={`an-badge ${audience === 'All Users' ? 'badge-users' : audience === 'Employees' ? 'badge-employees' : 'badge-staff'}`}>
                                  {audience}
                                </span>
                              </td>
                              <td>
                                <span className={`an-badge badge-${priority.toLowerCase()}`}>{priority}</span>
                              </td>
                              <td>
                                <span className={`an-badge badge-${status.toLowerCase()}`}>{status}</span>
                              </td>
                              <td style={{ color: '#64748B', fontWeight: '500' }}>{publishedOn}</td>
                              <td style={{ color: '#64748B', fontWeight: '500' }}>{expiresOn}</td>
                              <td style={{ color: '#1E293B', fontWeight: '600' }}>
                                {createdBy}
                                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 'normal', marginTop: '1px' }}>Zone Manager</div>
                              </td>
                              <td>
                                <div className="an-action-row">
                                  {status === 'Draft' || status === 'Scheduled' ? (
                                    <button className="an-eye-btn" title="Edit">
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                      </svg>
                                    </button>
                                  ) : (
                                    <button className="an-eye-btn" title="View">
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                      </svg>
                                    </button>
                                  )}
                                  <button className="an-dots-btn">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )})
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="an-tcard-ft">
                    <span className="an-tcard-ft-lbl">Showing 1 to {filteredAnnouncements.length} of 24 announcements</span>
                    <div className="an-pg">
                      <button className="an-pgb" disabled>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button className="an-pgb cur">1</button>
                      <button className="an-pgb">2</button>
                      <button className="an-pgb">3</button>
                      <span style={{ padding: '0 4px', color: '#64748B' }}>...</span>
                      <button className="an-pgb">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>

                    <div>
                      <select className="an-limit-select" defaultValue="10">
                        <option value="10">10 / page</option>
                        <option value="25">25 / page</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Summary & Actions */}
              <div className="an-sidebar">
                {/* Announcement Summary */}
                <div className="an-side-card">
                  <span className="an-side-tit">Announcement Summary</span>
                  <div className="an-summary-list">
                    <div className="an-sum-item">
                      <div className="an-sum-l">
                        <div className="an-sum-ic" style={{ background: '#EEF2FF', color: '#2A195C' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                          </svg>
                        </div>
                        Total Announcements
                      </div>
                      <span className="an-sum-val">24</span>
                    </div>

                    <div className="an-sum-item">
                      <div className="an-sum-l">
                        <div className="an-sum-ic" style={{ background: '#ECFDF5', color: '#059669' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        Published
                      </div>
                      <span className="an-sum-val">12</span>
                    </div>

                    <div className="an-sum-item">
                      <div className="an-sum-l">
                        <div className="an-sum-ic" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>
                        Scheduled
                      </div>
                      <span className="an-sum-val">4</span>
                    </div>

                    <div className="an-sum-item">
                      <div className="an-sum-l">
                        <div className="an-sum-ic" style={{ background: '#F1F5F9', color: '#475569' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          </svg>
                        </div>
                        Drafts
                      </div>
                      <span className="an-sum-val">3</span>
                    </div>

                    <div className="an-sum-item">
                      <div className="an-sum-l">
                        <div className="an-sum-ic" style={{ background: '#FEE2E2', color: '#B91C1C' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        </div>
                        Expired
                      </div>
                      <span className="an-sum-val">5</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="an-side-card">
                  <span className="an-side-tit">Quick Actions</span>
                  <div>
                    <Link href="/announcements/new" className="an-qa-row" style={{ textDecoration: 'none' }}>
                      <div className="an-qa-ic">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </div>
                      <div className="an-qa-meta">
                        <span className="an-qa-name">Create Announcement</span>
                        <span className="an-qa-sub">Draft a new announcement</span>
                      </div>
                    </Link>

                    <div className="an-qa-row">
                      <div className="an-qa-ic" style={{ background: '#FFF7ED', color: '#C2410C' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                        </svg>
                      </div>
                      <div className="an-qa-meta">
                        <span className="an-qa-name">Schedule Announcement</span>
                        <span className="an-qa-sub">Plan for future publishing</span>
                      </div>
                    </div>

                    <div className="an-qa-row">
                      <div className="an-qa-ic" style={{ background: '#F5F3FF', color: '#7E22CE' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <polygon points="12 2 2 7 12 12 22 7 12 2" /><polygon points="2 17 12 22 22 17 2 17" />
                        </svg>
                      </div>
                      <div className="an-qa-meta">
                        <span className="an-qa-name">Announcement Templates</span>
                        <span className="an-qa-sub">Use pre-built templates</span>
                      </div>
                    </div>

                    <div className="an-qa-row">
                      <div className="an-qa-ic" style={{ background: '#ECFDF5', color: '#059669' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                      </div>
                      <div className="an-qa-meta">
                        <span className="an-qa-name">Bulk Announcements</span>
                        <span className="an-qa-sub">Send to multiple audiences</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Announcements */}
                <div className="an-side-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
                    <span className="an-preview-tit" style={{ margin: 0, fontSize: '13.5px', fontWeight: 'bold' }}>Recent Announcements</span>
                    <Link href="/announcements" style={{ fontSize: '11px', fontWeight: '700', color: '#2A195C', textDecoration: 'none' }}>View All</Link>
                  </div>
                  <div>
                    <div className="an-rec-row">
                      <span className="an-rec-t">
                        <span className="an-rec-dot" style={{ background: '#10B981' }} />
                        New Service Center Launched...
                      </span>
                      <span className="an-rec-d">May 17, 2024 · 10:30 AM</span>
                    </div>

                    <div className="an-rec-row">
                      <span className="an-rec-t">
                        <span className="an-rec-dot" style={{ background: '#10B981' }} />
                        Battery Maintenance Guidelines
                      </span>
                      <span className="an-rec-d">May 15, 2024 · 09:15 AM</span>
                    </div>

                    <div className="an-rec-row">
                      <span className="an-rec-t">
                        <span className="an-rec-dot" style={{ background: '#EF4444' }} />
                        High Temperature Alert
                      </span>
                      <span className="an-rec-d">May 14, 2024 · 02:00 PM</span>
                    </div>

                    <div className="an-rec-row">
                      <span className="an-rec-t">
                        <span className="an-rec-dot" style={{ background: '#3B82F6' }} />
                        System Maintenance Scheduled
                      </span>
                      <span className="an-rec-d">May 13, 2024 · 11:45 AM</span>
                    </div>

                    <div className="an-rec-row">
                      <span className="an-rec-t">
                        <span className="an-rec-dot" style={{ background: '#6B7280' }} />
                        New Inward Process Update
                      </span>
                      <span className="an-rec-d">May 12, 2024 · 09:30 AM</span>
                    </div>
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
