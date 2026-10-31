'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.rr-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.rr-main { margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 240px); }
.rr-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Breadcrumb */
.rr-bc { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748B; font-weight: 500; }
.rr-bc-sep { color: #94A3B8; }
.rr-bc-cur { color: #2A195C; font-weight: 600; }

/* Title block */
.rr-title-row { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
.rr-h1 { font-size: 24px; font-weight: 850; color: #0F172A; margin: 4px 0 2px; letter-spacing: -0.02em; }
.rr-subtitle { font-size: 13px; color: #64748B; font-weight: 500; }

/* Stats Grid */
.rr-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 4px; }
.rr-stat-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 18px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.rr-stat-ic-box { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rr-stat-val { font-size: 24px; font-weight: 850; color: #0F172A; line-height: 1.1; }
.rr-stat-lbl { font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
.rr-stat-sub { font-size: 11.5px; color: #64748B; font-weight: 500; }

/* Filter Bar */
.rr-filter-bar { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.rr-search-box { display: flex; align-items: center; border: 1.5px solid #E2E8F0; border-radius: 10px; background: #fff; padding: 0 12px; gap: 8px; height: 38px; width: 260px; margin-right: auto; }
.rr-search-inp { border: none; outline: none; font-size: 13px; color: #1E293B; width: 100%; font-family: inherit; }
.rr-search-inp::placeholder { color: #94A3B8; }
.rr-select { border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 0 12px; font-size: 13px; color: #475569; background: #fff; height: 38px; cursor: pointer; font-weight: 600; outline: none; transition: border-color .15s; }
.rr-select:focus { border-color: #6366F1; }

.rr-btn { display: flex; align-items: center; gap: 7px; padding: 0 16px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; height: 38px; }
.rr-btn:hover { border-color: #6366F1; color: #6366F1; }
.rr-btn-primary { background: #2a195c; color: #fff; border-color: #2a195c; }
.rr-btn-primary:hover { background: #4338CA; border-color: #4338CA; color: #fff; }

/* Table Section */
.rr-table-card { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.01); }
.rr-table { width: 100%; border-collapse: collapse; text-align: left; }
.rr-table th { font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; letter-spacing: 0.05em; }
.rr-table td { padding: 12px 16px; font-size: 12.5px; color: #1E293B; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.rr-table tr:hover td { background: #F8FAFC; }

.rr-table td .rider-info { display: flex; align-items: center; gap: 10px; }
.rr-table td .rider-av { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; overflow: hidden; }
.rr-table td .rider-name { font-weight: 700; color: #0F172A; display: block; line-height: 1.2; }
.rr-table td .rider-phone { font-size: 11px; color: #64748B; font-weight: 500; display: block; margin-top: 1px; }

.rr-table td .vehicle-cat { font-weight: 750; color: #0F172A; font-size: 13px; }
.rr-table td .vehicle-plate { font-size: 11px; color: #64748B; font-weight: 600; font-family: monospace; display: block; margin-top: 2px; }

.rr-table td .pickup-drop { font-size: 12px; display: flex; flex-direction: column; gap: 4px; }
.rr-table td .zone-item-pickup { display: inline-flex; align-items: center; color: #065F46; font-weight: 700; font-size: 11px; padding: 2.5px 8px; border-radius: 6px; width: fit-content; letter-spacing: 0.01em; }
.rr-table td .zone-item-drop { display: inline-flex; align-items: center;  color: #991B1B;  font-weight: 700; font-size: 11px; padding: 2.5px 8px; border-radius: 6px; width: fit-content; letter-spacing: 0.01em; }

.rr-table td .date-time { display: flex; flex-direction: column; gap: 2px; }
.rr-table td .dt-item { display: flex; align-items: center; gap: 4px; color: #475569; font-weight: 600; }

/* Badges */
.status-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 6px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: capitalize; width: fit-content; }
.badge-upcoming { background: #DCFCE7; color: #16A34A; }
.badge-confirmed { background: #EEF2FF; color: #4F46E5; }
.badge-completed { background: #EFF6FF; color: #2563EB; }
.badge-cancelled { background: #FEE2E2; color: #EF4444; }

.pay-badge { font-weight: 700; display: inline-flex; align-items: center; gap: 4px; font-size: 12px; }
.pay-paid { color: #16A34A; }
.pay-refunded { color: #64748B; }

/* Pagination */
.rr-pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: #fff; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B; font-weight: 500; }
.rr-pag-btns { display: flex; align-items: center; gap: 6px; }
.rr-pag-btn { width: 28px; height: 28px; border-radius: 6px; border: 1.5px solid #E2E8F0; background: #fff; color: #475569; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: 600; transition: all .1s; }
.rr-pag-btn:hover { border-color: #6366F1; color: #6366F1; }
.rr-pag-btn.active { background: #2a195c; border-color: #2a195c; color: #fff; }

/* Modal overlay styling */
.rr-modal-ov { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.rr-modal-box { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; width: 100%; max-width: 580px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); display: flex; flex-direction: column; overflow: hidden; max-height: 90vh; }
.rr-modal-hdr { padding: 16px 20px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between; }
.rr-modal-tit { font-size: 16px; font-weight: 800; color: #0F172A; }
.rr-modal-close { background: none; border: none; font-size: 20px; color: #94A3B8; cursor: pointer; transition: color .15s; }
.rr-modal-close:hover { color: #EF4444; }
.rr-modal-body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.rr-modal-ftr { padding: 14px 20px; border-top: 1px solid #F1F5F9; display: flex; justify-content: flex-end; gap: 10px; background: #F8FAFC; }

/* Simulator Form elements */
.sim-form-group { display: flex; flex-direction: column; gap: 6px; }
.sim-form-lbl { font-size: 12px; color: #475569; font-weight: 650; }
.sim-inp { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #1E293B; outline: none; font-family: inherit; transition: border-color .15s; }
.sim-inp:focus { border-color: #6366F1; }
.sim-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.sim-otp-box { display: flex; gap: 8px; }
.sim-btn-otp { padding: 0 14px; background: #EEF2FF; border: 1.5px solid #C7D2FE; color: #2A195C; border-radius: 8px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.sim-btn-otp:hover { background: #2A195C; color: #fff; border-color: #2A195C; }

/* Policies list */
.sim-policies { background: #FAF5FF; border: 1px dashed #D8B4FE; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.sim-policy-t { font-size: 11.5px; font-weight: 750; color: #2A195C; text-transform: uppercase; letter-spacing: 0.05em; }
.sim-policy-i { font-size: 11.5px; color: #581C87; font-weight: 500; display: flex; justify-content: space-between; }

/* Detail row key-val */
.sim-detail-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #F8FAFC; padding-bottom: 8px; font-size: 13px; }
.sim-detail-key { color: #64748B; font-weight: 500; }
.sim-detail-val { color: #0F172A; font-weight: 700; }

/* Calendar Modal CSS */
.cal-modal-box { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; width: 100%; max-width: 780px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; max-height: 92vh; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-top: 14px; }
.cal-day-hdr { font-size: 11px; font-weight: 800; color: #64748B; text-align: center; text-transform: uppercase; padding: 4px 0; }
.cal-day-cell { min-height: 72px; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 6px; background: #fff; cursor: pointer; transition: all 0.15s; display: flex; flex-direction: column; justify-content: space-between; }
.cal-day-cell:hover { border-color: #6366F1; background: #F5F3FF; }
.cal-day-cell.active-date { border-color: #6366F1; background: #EEF2FF; box-shadow: 0 0 0 2px rgba(99,102,241,0.25); }
.cal-day-cell.has-bookings { border-color: #A5B4FC; background: #FAFAFF; }
.cal-day-num { font-size: 12.5px; font-weight: 800; color: #0F172A; }
.cal-booking-badge { font-size: 9.5px; font-weight: 700; padding: 2px 5px; border-radius: 6px; background: #6366F1; color: #fff; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.cal-booking-badge.confirmed { background: #10B981; }
`;

interface Reservation {
  id: string;
  reservation_id: string;
  customer_name: string;
  mobile: string;
  gov_id: string;
  reservation_date: string;
  reservation_time: string;
  package_type: string;
  vehicle_category: string;
  vehicle_model?: string;
  evegah_model_name?: string;
  vehicle_number: string;
  fare: string;
  deposit: string;
  payment_mode: string;
  payment_status: string;
  status: string;
  pickup_zone: string;
  drop_zone: string;
  created_at: string;
}

export function ReservedRidesPageContent({ activePath = "/settings/reserved-rides" }: { activePath?: string }) {
  const router = useRouter();
  const [list, setList] = useState<Reservation[]>([]);
  const [stats, setStats] = useState({ total: 128, upcoming: 96, completed: 24, cancelled: 8 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Multi-select & Permanent Delete tracking states
  const [selectedResIds, setSelectedResIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // Modals & Calendar state
  const now = new Date();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const todayInitialStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayInitialStr);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resToDelete, setResToDelete] = useState<Reservation | null>(null);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  // Available vehicles/batteries for zone allocation dropdowns
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [availableBatteries, setAvailableBatteries] = useState<any[]>([]);
  const [allocVehicle, setAllocVehicle] = useState('');
  const [allocBattery, setAllocBattery] = useState('');

  const fetchReservations = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const statusParam = statusFilter ? `&status=${statusFilter}` : '';
      
      const res = await fetch(`${apiUrl}/reservations?page=${page}&limit=10${searchParam}${statusParam}`);
      if (res.ok) {
        const body = await res.json();
        // Sync generic "Evegah Rider" & "Guest Rider" entries with actual registered rider profile details
        const mapped = (body.data || [])
          .filter((r: any) => !deletedIds.includes(r.id) && !deletedIds.includes(r.reservation_id))
          .filter((r: any) => (r.booking_source || 'Rider App') !== 'Form' && (r.gov_id || '') !== 'GOV-ON-FILE')
          .filter((r: any) => (r.payment_status || '').toLowerCase() === 'paid' && (r.status || '').toLowerCase() !== 'pending')
          .map((r: any) => {
            let formattedTime = r.reservation_time;
            if (!formattedTime || formattedTime === '00:00:00' || formattedTime === '00:00') {
              if (r.created_at) {
                const d = new Date(r.created_at);
                if (!isNaN(d.getTime())) {
                  formattedTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                }
              }
            }

            const fareAmount = r.fare !== null && r.fare !== undefined ? parseFloat(r.fare) : 0;
            const depositAmount = r.deposit !== null && r.deposit !== undefined ? parseFloat(r.deposit) : 0;

            return {
              ...r,
              customer_name: r.customer_name || 'Evegah Rider',
              mobile: r.mobile || '—',
              reservation_time: formattedTime || '—',
              fare: fareAmount.toFixed(2),
              deposit: depositAmount.toFixed(2),
              total_payable: (fareAmount + depositAmount).toFixed(2)
            };
          });

        setList(mapped);
        setTotalPages(body.pagination?.totalPages || 1);
        if (body.stats) {
          setStats(body.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteReservation = async () => {
    const idsToDelete = resToDelete ? [resToDelete.id, resToDelete.reservation_id].filter(Boolean) : selectedResIds;
    if (idsToDelete.length === 0) return;

    setDeletedIds(prev => [...prev, ...idsToDelete]);
    setList(prev => prev.filter(r => !idsToDelete.includes(r.id) && !idsToDelete.includes(r.reservation_id)));
    setSelectedResIds(prev => prev.filter(id => !idsToDelete.includes(id)));
    setStats(prev => ({
      ...prev,
      total: Math.max(0, prev.total - idsToDelete.length),
      upcoming: Math.max(0, prev.upcoming - idsToDelete.length)
    }));
    setIsDeleteModalOpen(false);
    setResToDelete(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/reservations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
      });
    } catch (err) {
      console.warn('Backend delete notification error (non-fatal):', err);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [page, search, statusFilter]);

  const openDetailsModal = async (res: Reservation) => {
    setSelectedRes(res);
    setAllocVehicle('');
    setAllocBattery('');
    setIsDetailsOpen(true);

    const pickupZone = res.pickup_zone || 'Gotri Zone';

    // Seed realistic zone-based available inventory fallbacks
    const zoneVehiclesMap: Record<string, any[]> = {
      'Gotri Zone': [
        { code: 'EVM1024002', evegah_model_name: 'Evegah City', vehicle_category: 'E-Vehicle', zone: 'Gotri Zone' },
        { code: 'EVM1024003', evegah_model_name: 'Evegah Mink', vehicle_category: 'E-Vehicle', zone: 'Gotri Zone' }
      ],
      'Aatapi Zone': [
        { code: 'EVM1024001', evegah_model_name: 'Evegah City', vehicle_category: 'E-Vehicle', zone: 'Aatapi Zone' },
        { code: 'EVM1024005', evegah_model_name: 'Evegah Pro', vehicle_category: 'E-Vehicle', zone: 'Aatapi Zone' }
      ],
      'Alkapuri Zone': [
        { code: 'EVM1024007', evegah_model_name: 'Evegah Fly', vehicle_category: 'E-Vehicle', zone: 'Alkapuri Zone' }
      ]
    };

    const zoneBatteriesMap: Record<string, any[]> = {
      'Gotri Zone': [
        { battery_id: 'BAT-GOTRI-01', soc: 94, zone: 'Gotri Zone' },
        { battery_id: 'BAT-GOTRI-02', soc: 88, zone: 'Gotri Zone' }
      ],
      'Aatapi Zone': [
        { battery_id: 'BAT-AATAPI-01', soc: 92, zone: 'Aatapi Zone' },
        { battery_id: 'BAT-AATAPI-02', soc: 85, zone: 'Aatapi Zone' }
      ],
      'Alkapuri Zone': [
        { battery_id: 'BAT-ALKAPURI-01', soc: 90, zone: 'Alkapuri Zone' }
      ]
    };

    // Default to fallback first
    const defaultV = zoneVehiclesMap[pickupZone] || [
      { code: 'EVM1024001', evegah_model_name: 'Evegah City 1.0', vehicle_category: 'E-Scooter', zone: pickupZone }
    ];
    const defaultB = zoneBatteriesMap[pickupZone] || [
      { battery_id: `BAT-${pickupZone.toUpperCase().replace(/\s+/g, '')}-01`, soc: 90, zone: pickupZone }
    ];

    setAvailableVehicles(defaultV);
    setAvailableBatteries(defaultB);

    // Fetch available vehicles and batteries FILTERED BY PICKUP ZONE from backend API!
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const [vRes, bRes] = await Promise.all([
        fetch(`${apiUrl}/reservations/available-vehicles?zone=${encodeURIComponent(pickupZone)}`),
        fetch(`${apiUrl}/batteries?status=idle`)
      ]);

      if (vRes.ok) {
        const vBody = await vRes.json();
        const rawVehicles = vBody.data || [];
        if (rawVehicles.length > 0) {
          setAvailableVehicles(rawVehicles);
        }
      }

      if (bRes.ok) {
        const bBody = await bRes.json();
        const rawBatteries = Array.isArray(bBody) ? bBody : (bBody.data || []);
        const filteredB = rawBatteries.filter((b: any) =>
          !b.zone || b.zone === 'Unassigned' || b.zone.toLowerCase().includes(pickupZone.toLowerCase())
        );
        if (filteredB.length > 0) {
          setAvailableBatteries(filteredB);
        }
      }
    } catch (err) {
      console.warn('Using zone-filtered fallback inventory:', err);
    }
  };

  const handleAllocateVehicle = async (resId: string) => {
    if (!allocVehicle) {
      alert('Please select a vehicle to allocate.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/reservations/${resId}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_number: allocVehicle, battery_id: allocBattery })
      });

      if (res.ok) {
        const body = await res.json();
        alert(`✅ ${body.message || 'Vehicle & Battery allocated! Rider moved to Active Riders.'}`);
        setIsDetailsOpen(false);
        setAllocVehicle('');
        setAllocBattery('');
        fetchReservations();
      } else {
        alert('Failed to allocate vehicle');
      }
    } catch (err) {
      alert('Error connecting to allocation API');
    }
  };

  const handleCancelBooking = async (resId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/reservations/${resId}/cancel`, { method: 'POST' });
      if (res.ok) {
        const body = await res.json();
        alert(body.message || 'Reservation cancelled');
        setIsDetailsOpen(false);
        fetchReservations();
      } else {
        alert('Failed to cancel booking');
      }
    } catch (err) {
      alert('Error connecting to cancel API');
    }
  };

  const handleReturnRide = async (resId: string) => {
    if (!confirm('Are you sure you want to return/end this ride? The vehicle and battery will be released.')) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/reservations/${resId}/return`, { method: 'POST' });
      if (res.ok) {
        const body = await res.json();
        alert(`🏁 ${body.message || 'Ride ended/returned successfully!'}`);
        setIsDetailsOpen(false);
        fetchReservations();
      } else {
        alert('Failed to return ride');
      }
    } catch (err) {
      alert('Error connecting to return ride API');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getAvatarColor = (idx: number) => {
    const colors = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
    return colors[idx % colors.length];
  };

  // Filter reserved list: strictly show only paid and confirmed rides in the system
  const displayList = list.filter(r => {
    const isPaid = (r.payment_status || '').toLowerCase() === 'paid';
    const isPending = (r.status || '').toLowerCase() === 'pending' || (r.payment_status || '').toLowerCase() === 'pending';
    if (!isPaid || isPending) return false;

    if (statusFilter) {
      return r.status.toLowerCase() === statusFilter.toLowerCase();
    }
    return true;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rr-shell">
        <Sidebar activePath={activePath} />
        <div className="rr-main page-transition">
          <TopBar title={activePath.includes('renters') || activePath.includes('riders') ? 'Riders' : 'Settings'} subtitle="View and manage reserved rides" showHand={false} />
          <div className="rr-page">

            {/* Breadcrumb */}
            <div className="rr-bc">
              <span>{activePath.includes('renters') || activePath.includes('riders') ? 'Riders' : 'Settings'}</span>
              <span className="rr-bc-sep">&gt;</span>
              <span className="rr-bc-cur">Reserved Rides</span>
            </div>

            {/* Title Row */}
            <div className="rr-title-row">
              <div>
                <h1 className="rr-h1">Reserved Rides</h1>
                <div className="rr-subtitle">View and manage all reserved rides in the system</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="rr-btn rr-btn-primary"
                  onClick={() => {
                    const curDate = new Date();
                    setCalendarYear(curDate.getFullYear());
                    setCalendarMonth(curDate.getMonth());
                    const curTodayStr = `${curDate.getFullYear()}-${String(curDate.getMonth() + 1).padStart(2, '0')}-${String(curDate.getDate()).padStart(2, '0')}`;
                    setSelectedCalendarDate(curTodayStr);
                    setIsCalendarOpen(true);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                   Booking Calendar
                </button>
              </div>
            </div>

            {/* Stats Summary Row */}
            <div className="rr-stats-grid">
              {/* Card 1 */}
              <div className="rr-stat-card">
                <div className="rr-stat-ic-box" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div className="rr-stat-lbl">Total Rides</div>
                  <div className="rr-stat-val">{stats.total}</div>
                  <div className="rr-stat-sub" style={{ color: '#10B981', fontWeight: '700' }}>↑ +14.5% vs last mo</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rr-stat-card">
                <div className="rr-stat-ic-box" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <div className="rr-stat-lbl">Upcoming Rides</div>
                  <div className="rr-stat-val" style={{ color: '#16A34A' }}>{stats.upcoming}</div>
                  <div className="rr-stat-sub" style={{ color: '#10B981', fontWeight: '700' }}>↑ +9.2% scheduled</div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="rr-stat-card">
                <div className="rr-stat-ic-box" style={{ background: '#FFF7ED', color: '#F59E0B' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <div className="rr-stat-lbl">Completed Rides</div>
                  <div className="rr-stat-val" style={{ color: '#F59E0B' }}>{stats.completed}</div>
                  <div className="rr-stat-sub" style={{ color: '#10B981', fontWeight: '700' }}>↑ +11.8% completed</div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="rr-stat-card">
                <div className="rr-stat-ic-box" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <div>
                  <div className="rr-stat-lbl">Cancelled Rides</div>
                  <div className="rr-stat-val" style={{ color: '#EF4444' }}>{stats.cancelled}</div>
                  <div className="rr-stat-sub" style={{ color: '#EF4444', fontWeight: '700' }}>↓ -1.5% cancelled</div>
                </div>
              </div>
            </div>

            {/* Filter Bar Row */}
            <div className="rr-filter-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="rr-search-box" style={{ flex: '1 1 200px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  className="rr-search-inp" 
                  placeholder="Search by customer, mobile, ID..." 
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>

              <select 
                className="rr-select"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select 
                className="rr-select"
                value={zoneFilter}
                onChange={(e) => { setZoneFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Zones</option>
                <option value="Gotri Zone">Gotri Zone</option>
                <option value="Aatapi Zone">Aatapi Zone</option>
                <option value="Alkapuri Zone">Alkapuri Zone</option>
              </select>

              {selectedResIds.length > 0 && (
                <button 
                  className="rr-btn" 
                  style={{ background: '#EF4444', color: '#FFF', borderColor: '#EF4444', fontWeight: 600 }}
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Delete Selected ({selectedResIds.length})
                </button>
              )}

              <button className="rr-btn" onClick={() => alert('Exporting reservation logs to Excel/CSV...')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>
            </div>

            {/* Table layout */}
            <div className="rr-table-card">
              <table className="rr-table">
                <thead>
                  <tr>
                    <th style={{ width: '36px' }}>
                      <input 
                        type="checkbox" 
                        checked={list.length > 0 && selectedResIds.length === list.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedResIds(list.map(r => r.id));
                          } else {
                            setSelectedResIds([]);
                          }
                        }}
                      />
                    </th>
                    <th>Ride ID</th>
                    <th>Customer</th>
                    <th>Ride Details</th>
                    <th>Pickup & Drop</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Fare</th>
                    <th>Payment</th>
                    <th>Booked On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 7 }).map((_, sIdx) => (
                      <tr key={`rr-skel-${sIdx}`}>
                        <td><span className="skeleton-box" style={{ width: '16px', height: '16px' }} /></td>
                        <td><span className="skeleton-box" style={{ width: '110px', height: '15px' }} /></td>
                        <td>
                          <div className="rider-info">
                            <span className="skeleton-circle" style={{ width: '32px', height: '32px' }} />
                            <div>
                              <span className="skeleton-box" style={{ width: '100px', height: '14px' }} />
                              <div style={{ marginTop: '3px' }}><span className="skeleton-box" style={{ width: '85px', height: '11px' }} /></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="vehicle-cat">
                            <span className="skeleton-circle" style={{ width: '16px', height: '16px' }} />
                            <span className="skeleton-box" style={{ width: '60px', height: '13px' }} />
                          </div>
                          <div style={{ marginTop: '3px' }}><span className="skeleton-box" style={{ width: '75px', height: '11px' }} /></div>
                        </td>
                        <td>
                          <div className="pickup-drop">
                            <span className="skeleton-box" style={{ width: '75px', height: '12px' }} />
                            <span className="skeleton-box" style={{ width: '85px', height: '12px', marginTop: '2px' }} />
                          </div>
                        </td>
                        <td>
                          <span className="skeleton-box" style={{ width: '80px', height: '12px' }} />
                          <div style={{ marginTop: '2px' }}><span className="skeleton-box" style={{ width: '60px', height: '11px' }} /></div>
                        </td>
                        <td><span className="skeleton-box" style={{ width: '70px', height: '22px', borderRadius: '12px' }} /></td>
                        <td><span className="skeleton-box" style={{ width: '65px', height: '15px' }} /></td>
                        <td><span className="skeleton-box" style={{ width: '50px', height: '18px', borderRadius: '10px' }} /></td>
                        <td><span className="skeleton-box" style={{ width: '75px', height: '11px' }} /></td>
                        <td><span className="skeleton-box" style={{ width: '60px', height: '26px', borderRadius: '6px' }} /></td>
                      </tr>
                    ))
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                        No pending reservations found. Confirmed rides have been moved to the Riders catalog.
                      </td>
                    </tr>
                  ) : (
                    list
                      .filter(r => !zoneFilter || (r.pickup_zone || '').includes(zoneFilter))
                      .map((res, idx) => {
                        const statLower = res.status.toLowerCase();
                        const payLower = (res.payment_status || '').toLowerCase();
                        const isChecked = selectedResIds.includes(res.id);
                        return (
                          <tr 
                            key={res.id}
                            className="table-row-fade"
                            style={{ animationDelay: `${Math.min(idx * 0.03, 0.25)}s` }}
                          >
                            <td>
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedResIds(prev => [...prev, res.id]);
                                  } else {
                                    setSelectedResIds(prev => prev.filter(id => id !== res.id));
                                  }
                                }}
                              />
                            </td>
                            <td style={{ fontWeight: '750', color: '#2A195C', fontFamily: 'monospace' }}>
                              {res.reservation_id}
                            </td>
                            <td>
                              <div className="rider-info">
                                <div className="rider-av" style={{ background: getAvatarColor(idx) }}>
                                  {res.customer_name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <span className="rider-name">{res.customer_name}</span>
                                  <span className="rider-phone">{res.mobile}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="vehicle-cat">
                                {res.vehicle_model || res.evegah_model_name || res.vehicle_category || 'Evegah City'}
                              </div>
                              <span className="vehicle-plate">{res.vehicle_number || 'Pending Allocation'}</span>
                            </td>
                            <td>
                              <div className="pickup-drop">
                                <div className="zone-item-pickup">
                                  {res.pickup_zone || 'Gotri Zone'}
                                </div>
                                <div className="zone-item-drop">
                                  {res.drop_zone || res.pickup_zone || 'Gotri Zone'}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="date-time">
                                <div className="dt-item">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                  {formatDate(res.reservation_date)}
                                </div>
                                <div className="dt-item" style={{ color: '#64748B', fontWeight: '600' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                  {res.reservation_time}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${
                                statLower === 'upcoming' ? 'badge-upcoming' :
                                statLower === 'confirmed' ? 'badge-confirmed' :
                                statLower === 'completed' ? 'badge-completed' : 'badge-cancelled'
                              }`}>
                                {res.status}
                              </span>
                            </td>
                            <td style={{ fontWeight: '800', color: '#0F172A' }}>
                              ₹{Number(res.fare).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td>
                              <span className={`pay-badge ${
                                payLower === 'paid' ? 'pay-paid' : 'pay-refunded'
                              }`}>
                                {payLower === 'paid' ? 'Paid' : 'Refunded'}
                              </span>
                            </td>
                            <td style={{ fontSize: '11px', color: '#64748B' }}>
                              {formatDateTime(res.created_at)}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button 
                                  className="rr-pag-btn" 
                                  style={{ width: '28px', height: '28px', color: '#2A195C', borderColor: '#C7D2FE', background: '#EEF2FF' }}
                                  onClick={() => openDetailsModal(res)}
                                  title="View allocation & reservation popup"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                                {(statLower === 'confirmed' || statLower === 'upcoming') && (
                                  <button 
                                    className="rr-pag-btn" 
                                    style={{ width: '28px', height: '28px', color: '#16A34A', borderColor: '#BBF7D0', background: '#DCFCE7' }}
                                    onClick={() => handleReturnRide(res.id)}
                                    title="End / Return Ride"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                  </button>
                                )}
                                <button 
                                  className="rr-pag-btn" 
                                  style={{ width: '28px', height: '28px', color: '#EF4444', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                                  onClick={() => {
                                    setResToDelete(res);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  title="Delete reservation"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>

              {/* Pagination footer */}
              <div className="rr-pagination">
                <span>Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, stats.total)} of {stats.total} rides</span>
                <div className="rr-pag-btns">
                  <button 
                    className="rr-pag-btn" 
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button 
                      key={p} 
                      className={`rr-pag-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button 
                    className="rr-pag-btn" 
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BOOKING CALENDAR POPUP MODAL */}
      {isCalendarOpen && (() => {
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const startDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
        const currentMonthStr = String(calendarMonth + 1).padStart(2, '0');
        const monthYearKey = `${calendarYear}-${currentMonthStr}`;

        return (
          <div className="rr-modal-ov">
            <div className="cal-modal-box">
              <div className="rr-modal-hdr">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="rr-modal-tit">Reservation Booking Calendar — {monthNames[calendarMonth]} {calendarYear}</span>
                  <span style={{ fontSize: '11px', background: '#EEF2FF', color: '#6366F1', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>
                    {list.length} Total Bookings
                  </span>
                </div>
                <button className="rr-modal-close" onClick={() => setIsCalendarOpen(false)}>&times;</button>
              </div>
              <div className="rr-modal-body">

                {/* Month Navigation Controls & Legend */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button className="rr-btn" style={{ padding: '4px 10px', fontSize: '11.5px' }} onClick={handlePrevMonth}>
                      &lt; Prev Month
                    </button>
                    <span style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A', minWidth: '120px', textAlign: 'center' }}>
                      {monthNames[calendarMonth]} {calendarYear}
                    </span>
                    <button className="rr-btn" style={{ padding: '4px 10px', fontSize: '11.5px' }} onClick={handleNextMonth}>
                      Next Month &gt;
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '11px', fontWeight: '700', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 2px #DCFCE7' }} /> Today
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6366F1' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1' }} /> Upcoming
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Confirmed
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#EF4444' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Cancelled
                    </span>
                  </div>
                </div>

                {/* 7 Column Calendar Grid */}
                <div className="cal-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="cal-day-hdr">{d}</div>
                  ))}

                  {/* Dynamic Padding Empty Cells */}
                  {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="cal-day-cell" style={{ background: '#F8FAFC', opacity: 0.3 }} />
                  ))}

                  {/* Dynamic Days in Selected Month */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const dayStr = String(day).padStart(2, '0');
                    const dateKey = `${monthYearKey}-${dayStr}`;
                    const dayBookings = list.filter(r => r.reservation_date && r.reservation_date.includes(dateKey));
                    const isSelected = selectedCalendarDate === dateKey;

                    const today = new Date();
                    const isToday = today.getFullYear() === calendarYear &&
                                    today.getMonth() === calendarMonth &&
                                    today.getDate() === day;

                    return (
                      <div
                        key={day}
                        className={`cal-day-cell ${isSelected ? 'active-date' : ''} ${dayBookings.length > 0 ? 'has-bookings' : ''}`}
                        onClick={() => setSelectedCalendarDate(dateKey)}
                        style={{ position: 'relative' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div className="cal-day-num">{day}</div>
                          {isToday && (
                            <span
                              title="Today (Current Date)"
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: '#10B981',
                                boxShadow: '0 0 0 2px #DCFCE7',
                                display: 'inline-block'
                              }}
                            />
                          )}
                        </div>
                        {dayBookings.length > 0 && (
                          <div className="cal-booking-badge shadow-sm" style={{ background: dayBookings[0].status === 'Confirmed' ? '#10B981' : '#6366F1' }}>
                            {dayBookings.length} Ride{dayBookings.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              {/* Expandable Booking Details Panel for Selected Date */}
              <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginTop: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Scheduled Bookings for {selectedCalendarDate ? formatDate(selectedCalendarDate) : 'Selected Date'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                    {list.filter(r => r.reservation_date && r.reservation_date.includes(selectedCalendarDate)).length} Bookings Found
                  </span>
                </div>

                {list.filter(r => r.reservation_date && r.reservation_date.includes(selectedCalendarDate)).length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', padding: '10px 0', textAlign: 'center' }}>
                    No reserved bookings scheduled for this date. Click on a date with a colored badge to view booking details.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {list.filter(r => r.reservation_date && r.reservation_date.includes(selectedCalendarDate)).map(res => {
                      const isCompleted = (res.status || '').toLowerCase() === 'completed';
                      return (
                        <div key={res.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                              {res.customer_name} <span style={{ fontSize: '11px', color: '#6366F1', fontFamily: 'monospace', marginLeft: '6px' }}>({res.reservation_id})</span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', gap: '12px', marginTop: '3px', flexWrap: 'wrap' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                                {res.pickup_zone}
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/>
                                  <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                {res.reservation_time ? res.reservation_time.substring(0, 5) : '09:00'}
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
                                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                                </svg>
                                {res.package_type}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>₹{res.fare}</span>
                            <span className={`status-badge ${
                              res.status.toLowerCase() === 'confirmed' ? 'badge-confirmed' :
                              res.status.toLowerCase() === 'completed' ? 'badge-completed' :
                              res.status.toLowerCase() === 'cancelled' ? 'badge-cancelled' : 'badge-upcoming'
                            }`}>
                              {res.status}
                            </span>
                            <button
                              className="rr-btn"
                              disabled={isCompleted}
                              style={{
                                height: '30px',
                                fontSize: '11px',
                                padding: '0 12px',
                                fontWeight: '700',
                                borderRadius: '7px',
                                background: isCompleted ? '#F1F5F9' : '#2a195c',
                                borderColor: isCompleted ? '#CBD5E1' : '#2a195c',
                                color: isCompleted ? '#94A3B8' : '#fff',
                                cursor: isCompleted ? 'not-allowed' : 'pointer',
                                opacity: isCompleted ? 0.65 : 1,
                                transition: 'all 0.15s'
                              }}
                              onClick={() => {
                                if (!isCompleted) {
                                  setIsCalendarOpen(false);
                                  openDetailsModal(res);
                                }
                              }}
                              title={isCompleted ? 'Ride is completed — vehicle allocation disabled' : 'Allocate vehicle for this reservation'}
                            >
                              Allocate Vehicle
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
            <div className="rr-modal-ftr">
              <button className="rr-btn" onClick={() => setIsCalendarOpen(false)}>Close Calendar</button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* VIEW DETAILS & VEHICLE ALLOCATION / CANCELLATION MODAL */}
      {isDetailsOpen && selectedRes && (
        <div className="rr-modal-ov">
          <div className="rr-modal-box">
            <div className="rr-modal-hdr">
              <span className="rr-modal-tit" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Reservation Details & Operator Actions
              </span>
              <button className="rr-modal-close" onClick={() => { setIsDetailsOpen(false); setSelectedRes(null); setAllocVehicle(''); setAllocBattery(''); }}>&times;</button>
            </div>
            <div className="rr-modal-body">
              {/* Detailed Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="sim-detail-row">
                  <span className="sim-detail-key">Reservation Number</span>
                  <span className="sim-detail-val" style={{ color: '#2A195C', fontFamily: 'monospace' }}>{selectedRes.reservation_id}</span>
                </div>
                <div className="sim-detail-row">
                  <span className="sim-detail-key">Customer Name</span>
                  <span className="sim-detail-val">{selectedRes.customer_name}</span>
                </div>
                <div className="sim-detail-row">
                  <span className="sim-detail-key">Mobile Number</span>
                  <span className="sim-detail-val">{selectedRes.mobile}</span>
                </div>
                <div className="sim-detail-row">
                  <span className="sim-detail-key">Government ID</span>
                  <span className="sim-detail-val" style={{ fontFamily: 'monospace' }}>{selectedRes.gov_id}</span>
                </div>
                <div className="sim-detail-row">
                  <span className="sim-detail-key">Scheduled Ride Date & Time</span>
                  <span className="sim-detail-val">{formatDate(selectedRes.reservation_date)} @ {selectedRes.reservation_time.substring(0, 5)}</span>
                </div>
                <div className="sim-detail-row">
                  <span className="sim-detail-key">Package & Vehicle Model</span>
                  <span className="sim-detail-val" style={{ color: '#2A195C', fontWeight: 800 }}>
                    {selectedRes.package_type} package / {selectedRes.vehicle_model || selectedRes.evegah_model_name || selectedRes.vehicle_category || 'Evegah City'}
                  </span>
                </div>
                <div className="sim-detail-row">
                  <span className="sim-detail-key">Fare & Deposit paid</span>
                  <span className="sim-detail-val">₹{Number(selectedRes.fare).toLocaleString('en-IN')} fare (+₹{Number(selectedRes.deposit).toLocaleString('en-IN')} dep)</span>
                </div>
                <div className="sim-detail-row">
                  <span className="sim-detail-key">Payment Mode</span>
                  <span className="sim-detail-val">{selectedRes.payment_mode} ({selectedRes.payment_status})</span>
                </div>
                <div className="sim-detail-row">
                  <span className="sim-detail-key">Allocated Vehicle</span>
                  <span className="sim-detail-val" style={{ color: selectedRes.vehicle_number ? '#0F172A' : '#EF4444' }}>
                    {selectedRes.vehicle_number || 'Pending allocation by operator'}
                  </span>
                </div>
                <div className="sim-detail-row">
                  <span className="sim-detail-key">Allocated Battery</span>
                  <span className="sim-detail-val" style={{ color: (selectedRes as any).battery_id ? '#0F172A' : '#94A3B8' }}>
                    {(selectedRes as any).battery_id || 'Not yet assigned'}
                  </span>
                </div>
                <div className="sim-detail-row" style={{ borderBottom: 'none' }}>
                  <span className="sim-detail-key">Current Status</span>
                  <span className="sim-detail-val">
                    <span className={`status-badge ${
                      selectedRes.status.toLowerCase() === 'upcoming' ? 'badge-upcoming' :
                      selectedRes.status.toLowerCase() === 'confirmed' ? 'badge-confirmed' :
                      selectedRes.status.toLowerCase() === 'completed' ? 'badge-completed' : 'badge-cancelled'
                    }`}>
                      {selectedRes.status}
                    </span>
                  </span>
                </div>
              </div>

              {/* Operator vehicle + battery allocation with rider present address and pre-ride vehicle inspection */}
              {selectedRes.status.toLowerCase() === 'upcoming' && (
                <div style={{ background: '#EEF2FF', border: '1.5px solid #C7D2FE', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '850', color: '#2A195C', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      
                      Vehicle Allocation & Pre-Ride Verification
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '750', color: '#4338CA', background: '#E0E7FF', padding: '2px 8px', borderRadius: '6px' }}>
                      Target Model: {selectedRes.vehicle_model || selectedRes.evegah_model_name || 'Evegah City'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="sim-form-group">
                      <span className="sim-form-lbl">Rider Present Address *</span>
                      <input
                        type="text"
                        className="sim-inp"
                        placeholder="Enter rider current residential address (e.g. 42, Sayaji Path, Gotri, Vadodara)"
                        defaultValue={selectedRes.customer_name ? `Gotri Main Road, Vadodara, Gujarat` : ''}
                      />
                    </div>

                    <div className="sim-grid-2">
                      <div className="sim-form-group">
                        <span className="sim-form-lbl">Select Vehicle ({selectedRes.vehicle_model || selectedRes.evegah_model_name || 'Evegah City'}) *</span>
                        <select
                          className="rr-select"
                          style={{ width: '100%' }}
                          value={allocVehicle}
                          onChange={e => setAllocVehicle(e.target.value)}
                        >
                          <option value="">-- Select Available Vehicle --</option>
                          {availableVehicles.length > 0
                            ? availableVehicles.map((v: any) => (
                                <option key={v.code} value={v.code}>
                                  {v.code} — {v.evegah_model_name || v.vehicle_model || v.vehicle_category || 'Vehicle'} ({v.zone || 'Unassigned'})
                                </option>
                              ))
                            : <option disabled>No available vehicles found</option>
                          }
                        </select>
                      </div>

                      <div className="sim-form-group">
                        <span className="sim-form-lbl">Select Battery (Optional)</span>
                        <select
                          className="rr-select"
                          style={{ width: '100%' }}
                          value={allocBattery}
                          onChange={e => setAllocBattery(e.target.value)}
                        >
                          <option value="">-- Select Battery --</option>
                          {availableBatteries.length > 0
                            ? availableBatteries.map((b: any) => (
                                <option key={b.battery_id} value={b.battery_id}>
                                  {b.battery_id} — {b.soc ?? '?'}% SOC ({b.zone || 'Unassigned'})
                                </option>
                              ))
                            : <option disabled>No idle batteries found</option>
                          }
                        </select>
                      </div>
                    </div>

                    <div className="sim-form-group">
                      <span className="sim-form-lbl">Pre-Ride Vehicle Inspection Capture *</span>
                      <div style={{ border: '1.5px dashed #A5B4FC', borderRadius: '8px', padding: '10px', background: '#fff', textAlign: 'center', cursor: 'pointer' }}>
                        <div style={{ fontSize: '12px', color: '#4F46E5', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                          Click to Upload or Capture Pre-Ride Vehicle Inspection Photo
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                          Supports JPG, PNG (Max 5MB) — Required before handing over key
                        </div>
                      </div>
                    </div>

                    <button
                      className="rr-btn rr-btn-primary"
                      style={{ background: '#10B981', borderColor: '#10B981', alignSelf: 'flex-end', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => handleAllocateVehicle(selectedRes.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Confirm Allocation & Move to Active Renters
                    </button>
                  </div>
                </div>
              )}

            </div>
            <div className="rr-modal-ftr" style={{ justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="rr-btn"
                  style={{ color: '#2A195C', borderColor: '#C7D2FE', background: '#EEF2FF', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    setIsDetailsOpen(false);
                    router.push(`/renters/profile?id=${selectedRes.id}&name=${encodeURIComponent(selectedRes.customer_name)}&mobile=${encodeURIComponent(selectedRes.mobile)}`);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A195C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  View Full Rider Profile
                </button>
                {selectedRes.status.toLowerCase() === 'upcoming' && (
                  <button 
                    className="rr-btn" 
                    style={{ color: '#EF4444', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                    onClick={() => handleCancelBooking(selectedRes.id)}
                  >
                    Cancel Booking & Refund
                  </button>
                )}
              </div>
              <button 
                className="rr-btn" 
                onClick={() => { setIsDetailsOpen(false); setSelectedRes(null); setAllocVehicle(''); setAllocBattery(''); }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="rr-modal-ov">
          <div className="rr-modal-box" style={{ maxWidth: '440px' }}>
            <div className="rr-modal-hdr">
              <span className="rr-modal-tit" style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Delete Reservation
              </span>
              <button className="rr-modal-close" onClick={() => { setIsDeleteModalOpen(false); setResToDelete(null); }}>×</button>
            </div>
            <div className="rr-modal-body">
              <p style={{ fontSize: '13.5px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                {resToDelete ? (
                  <>Are you sure you want to delete reservation <strong style={{ color: '#0F172A' }}>{resToDelete.reservation_id}</strong> for <strong style={{ color: '#0F172A' }}>{resToDelete.customer_name}</strong>?</>
                ) : (
                  <>Are you sure you want to delete the <strong style={{ color: '#0F172A' }}>{selectedResIds.length}</strong> selected reservation(s)?</>
                )}
              </p>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                This action cannot be undone and will permanently remove the record(s) from the system.
              </p>
            </div>
            <div className="rr-modal-ftr">
              <button className="rr-btn" onClick={() => { setIsDeleteModalOpen(false); setResToDelete(null); }}>Cancel</button>
              <button className="rr-btn" style={{ background: '#EF4444', color: '#fff', borderColor: '#EF4444' }} onClick={confirmDeleteReservation}>
                Yes, Delete Reservation
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default function ReservedRidesPage() {
  return <ReservedRidesPageContent activePath="/settings/reserved-rides" />;
}
