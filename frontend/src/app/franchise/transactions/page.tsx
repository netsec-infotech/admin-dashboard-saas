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

.tx-badge { display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #ECFDF5; color: #10B981; }
`;

export default function FranchiseTransactionsPage() {
  const transactions = [
    { id: 'TXN-9021', franchise: 'Koramangala Hub', method: 'Razorpay UPI', date: 'May 12, 2024', status: 'success', amount: '₹45,000' },
    { id: 'TXN-9018', franchise: 'South Depot Zone', method: 'Stripe Credit Card', date: 'May 10, 2024', status: 'success', amount: '₹25,000' },
    { id: 'TXN-8994', franchise: 'Indiranagar Hub', method: 'Bank Transfer NEFT', date: 'May 08, 2024', status: 'success', amount: '₹12,000' }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fr-shell">
        <Sidebar activePath="/franchise/transactions" />
        <div className="fr-main">
          <TopBar title="Franchise Transactions" subtitle="Track and audit billing settlements and deposit payments." showHand={false} />
          
          <div className="fr-page">
            <div className="fr-tcard">
              <table className="fr-dt">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Franchise Hub</th>
                    <th>Settlement Method</th>
                    <th>Total Settled</th>
                    <th>Settlement Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: '700', color: '#6366F1' }}>{t.id}</td>
                      <td style={{ fontWeight: '600' }}>{t.franchise}</td>
                      <td>{t.method}</td>
                      <td style={{ fontWeight: '800' }}>{t.amount}</td>
                      <td>{t.date}</td>
                      <td>
                        <span className="tx-badge">{t.status}</span>
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
