"use client";
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const CSS = `
.fr-shell { display: flex; min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; }
.fr-main { margin-left: 230px; display: flex; flex-direction: column; min-height: 100vh; width: calc(100% - 230px); }
.fr-page { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Table styling */
.fr-tcard { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.02); overflow: hidden; }
.fr-dt { width: 100%; border-collapse: collapse; }
.fr-dt th { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .06em; text-align: left; padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
.fr-dt td { padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.fr-dt tr:last-child td { border-bottom: none; }
.fr-dt tr:hover td { background: #F8FAFC; }

.sub-badge { display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #ECFDF5; color: #10B981; }
`;

export default function FranchiseSubscriptionsPage() {
  const subs = [
    { id: 'SUB-4011', franchise: 'Koramangala Hub', package: 'Enterprise Tier', status: 'active', renewal: 'June 01, 2024', amount: '₹45,000/mo' },
    { id: 'SUB-3022', franchise: 'South Depot Zone', package: 'Growth Tier', status: 'active', renewal: 'June 10, 2024', amount: '₹25,000/mo' },
    { id: 'SUB-2944', franchise: 'Indiranagar Hub', package: 'Basic Tier', status: 'active', renewal: 'June 15, 2024', amount: '₹12,000/mo' }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fr-shell">
        <Sidebar activePath="/franchise/subscriptions" />
        <div className="fr-main">
          <TopBar title="Franchise Subscriptions" subtitle="Track and manage recurring subscription accounts." showHand={false} />
          
          <div className="fr-page">
            <div className="fr-tcard">
              <table className="fr-dt">
                <thead>
                  <tr>
                    <th>Subscription ID</th>
                    <th>Franchise Hub</th>
                    <th>Billing Package</th>
                    <th>Monthly Price</th>
                    <th>Next Renewal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '700', color: '#6366F1' }}>{s.id}</td>
                      <td style={{ fontWeight: '600' }}>{s.franchise}</td>
                      <td style={{ fontWeight: '700' }}>{s.package}</td>
                      <td style={{ fontWeight: '800' }}>{s.amount}</td>
                      <td>{s.renewal}</td>
                      <td>
                        <span className="sub-badge">{s.status}</span>
                      </td>
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
