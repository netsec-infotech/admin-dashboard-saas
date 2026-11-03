'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

export default function DomainsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [domain, setDomain] = useState('franchise.example.com');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/domains');
      setRows(res.data || []);
    } catch (e: any) {
      setErr(e.message || 'Failed to load domains');
    }
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      const res = await api.post('/domains', { domain });
      setMsg(res.instructions?.note || 'Domain added — verification required before publish readiness.');
      await load();
    } catch (e: any) {
      setErr(e.message || 'Add failed');
    }
  };

  const verify = async (id: number) => {
    try {
      const res = await api.post(`/domains/${id}/verify`, {});
      setMsg(res.message || 'Check complete');
      await load();
    } catch (e: any) {
      setErr(e.message || 'Verify failed');
    }
  };

  return (
    <OpsPageShell
      title="Custom Domain Verification"
      subtitle="DNS/CNAME verification and SSL status for franchise white-label domains."
      actions={<button className="ops-btn" onClick={add}>Add domain</button>}
    >
      {msg ? <div className="ops-card" style={{ marginBottom: 12, background: '#ECFDF5' }}>{msg}</div> : null}
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}

      <div className="ops-card" style={{ marginBottom: 16 }}>
        <label className="ops-muted">Domain</label>
        <div className="ops-row">
          <input className="ops-input" style={{ maxWidth: 360 }} value={domain} onChange={(e) => setDomain(e.target.value)} />
          <span className="ops-muted">Publishing does not imply the domain is ready before verification.</span>
        </div>
      </div>

      <div className="ops-card">
        <table className="ops-table">
          <thead><tr><th>Domain</th><th>DNS</th><th>SSL</th><th>Last check</th><th>Token</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 700 }}>{r.domain}</td>
                <td><span className={`ops-badge ${r.dns_status === 'verified' ? 'ok' : r.dns_status === 'error' ? 'bad' : 'warn'}`}>{r.dns_status}</span></td>
                <td><span className={`ops-badge ${r.ssl_status === 'active' ? 'ok' : r.ssl_status === 'error' ? 'bad' : 'warn'}`}>{r.ssl_status}</span></td>
                <td>{r.last_check_at ? new Date(r.last_check_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Never'}</td>
                <td className="ops-muted">{r.verification_token}</td>
                <td><button className="ops-btn secondary" onClick={() => verify(r.id)}>Re-check</button></td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={6} className="ops-muted">No custom domains yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
