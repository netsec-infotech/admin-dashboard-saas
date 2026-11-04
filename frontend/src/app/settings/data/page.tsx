'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

export default function DataOpsPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [exports, setExports] = useState<any[]>([]);
  const [policy, setPolicy] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const [b, e, p] = await Promise.all([
        api.get('/backups'),
        api.get('/backups/exports'),
        api.get('/backups/policy'),
      ]);
      setBackups(b.data || []);
      setExports(e.data || []);
      setPolicy(p.data || null);
    } catch (e: any) {
      setErr(e.message || 'Failed to load data ops');
    }
  };

  useEffect(() => { load(); }, []);

  const runBackup = async (backup_type: string) => {
    try {
      const res = await api.post('/backups/run', { backup_type });
      setMsg(`${backup_type} backup #${res.data?.id} completed`);
      await load();
    } catch (e: any) {
      setErr(e.message || 'Backup failed');
    }
  };

  const queueExport = async () => {
    try {
      const res = await api.post('/backups/exports', { export_type: 'vehicles', scope: { zone: 'all' } });
      setMsg(`Export job #${res.data?.id} queued`);
      setTimeout(load, 600);
    } catch (e: any) {
      setErr(e.message || 'Export queue failed');
    }
  };

  return (
    <OpsPageShell
      title="Data Integrity & Backups"
      subtitle="Retention: 7 daily, 4 weekly, 12 monthly. Export queues obey access scope."
      actions={
        <div className="ops-row">
          <button className="ops-btn" onClick={() => runBackup('daily')}>Backup now</button>
          <button className="ops-btn secondary" onClick={queueExport}>Queue fleet export</button>
        </div>
      }
    >
      {msg ? <div className="ops-card" style={{ marginBottom: 12, background: '#ECFDF5' }}>{msg}</div> : null}
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}

      {policy ? (
        <div className="ops-card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Restore procedure</div>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {(policy.restore_procedure || []).map((step: string) => <li key={step} className="ops-muted" style={{ marginBottom: 4 }}>{step}</li>)}
          </ol>
        </div>
      ) : null}

      <div className="ops-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="ops-card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Backups</div>
          <table className="ops-table">
            <thead><tr><th>ID</th><th>Type</th><th>Size</th><th>Checksum</th><th>Status</th><th>Expires</th></tr></thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.backup_type}</td>
                  <td>{b.size_mb} MB</td>
                  <td className="ops-muted">{String(b.checksum || '').slice(0, 12)}…</td>
                  <td><span className="ops-badge ok">{b.status}</span></td>
                  <td>{b.expires_at ? new Date(b.expires_at).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ops-card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Export queue</div>
          <table className="ops-table">
            <thead><tr><th>ID</th><th>Type</th><th>Rows</th><th>Status</th><th>File</th></tr></thead>
            <tbody>
              {exports.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.export_type}</td>
                  <td>{e.row_count}</td>
                  <td><span className={`ops-badge ${e.status === 'completed' ? 'ok' : e.status === 'failed' ? 'bad' : 'info'}`}>{e.status}</span></td>
                  <td className="ops-muted">{e.file_uri || e.error_message || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </OpsPageShell>
  );
}
