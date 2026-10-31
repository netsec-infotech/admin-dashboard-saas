"use client";
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.usr-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.usr-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.usr-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Table styling */
.usr-tcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; }
.usr-dt { width: 100%; border-collapse: collapse; }
.usr-dt th { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .06em; text-align: left; padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
.usr-dt td { padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.usr-dt tr:last-child td { border-bottom: none; }
.usr-dt tr:hover td { background: #F8FAFC; }

.role-badge { display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #EEF2FF; color: #6366F1; }
`;

export default function FranchiseUsersPage() {
  const users = [
    { name: 'Karan Malhotra', email: 'karan@evegah.com', role: 'Franchise Owner', hub: 'Koramangala Hub', status: 'Active' },
    { name: 'Rohit Sharma', email: 'rohit@evegah.com', role: 'Operations Manager', hub: 'South Depot Zone', status: 'Active' },
    { name: 'Vikram Singh', email: 'vikram@evegah.com', role: 'Technician Manager', hub: 'Indiranagar Hub', status: 'Active' }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="usr-shell">
        <Sidebar activePath="/franchise-users" />
        <div className="usr-main">
          <TopBar title="Franchise Staff & Users" subtitle="Manage all registered operators and staff members." showHand={false} />
          
          <div className="usr-page">
            <div className="usr-tcard">
              <table className="usr-dt">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Designated Role</th>
                    <th>Assigned Hub</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.email}>
                      <td style={{ fontWeight: '700' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="role-badge">{u.role}</span>
                      </td>
                      <td style={{ fontWeight: '600', color: '#475569' }}>{u.hub}</td>
                      <td style={{ fontWeight: '700', color: '#10B981' }}>{u.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
