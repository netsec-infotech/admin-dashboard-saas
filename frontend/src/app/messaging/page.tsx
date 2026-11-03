'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

export default function MessagingPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({
    template_key: 'kyc_decision',
    channel: 'whatsapp',
    rider_mobile: '9876500011',
    rider_name: 'Aarav Shah',
    body: '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const [t, m] = await Promise.all([
        api.get('/messaging/templates'),
        api.get('/messaging'),
      ]);
      setTemplates(t.data || []);
      setRows(m.data || []);
    } catch (e: any) {
      setErr(e.message || 'Failed to load messaging');
    }
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    try {
      const res = await api.post('/messaging/send', {
        ...form,
        context: { event: form.template_key, transaction_id: `TXN-${Date.now()}` },
      });
      setMsg(res.message || 'Queued');
      setTimeout(load, 500);
    } catch (e: any) {
      setErr(e.message || 'Send failed');
    }
  };

  const selected = templates.find((t) => t.key === form.template_key);

  return (
    <OpsPageShell
      title="Operational Messaging"
      subtitle="Queue KYC, ride unlock, overdue, and deposit refund messages across WhatsApp, SMS, and push."
      actions={<button className="ops-btn" onClick={send}>Queue message</button>}
    >
      {msg ? <div className="ops-card" style={{ marginBottom: 12, background: '#ECFDF5' }}>{msg}</div> : null}
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}

      <div className="ops-card" style={{ marginBottom: 16 }}>
        <div className="ops-row">
          <div style={{ flex: 1 }}>
            <label className="ops-muted">Template</label>
            <select className="ops-select" value={form.template_key} onChange={(e) => setForm({ ...form, template_key: e.target.value, channel: (templates.find((t) => t.key === e.target.value)?.channels?.[0] || 'sms') })}>
              {templates.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ width: 160 }}>
            <label className="ops-muted">Channel</label>
            <select className="ops-select" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              {(selected?.channels || ['whatsapp', 'sms', 'push']).map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ width: 160 }}>
            <label className="ops-muted">Mobile</label>
            <input className="ops-input" value={form.rider_mobile} onChange={(e) => setForm({ ...form, rider_mobile: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="ops-muted">Rider name</label>
            <input className="ops-input" value={form.rider_name} onChange={(e) => setForm({ ...form, rider_name: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="ops-card">
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Delivery outbox</div>
        <table className="ops-table">
          <thead><tr><th>ID</th><th>Template</th><th>Channel</th><th>Rider</th><th>Preview</th><th>Status</th><th>Provider</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.template_key}</td>
                <td>{r.channel}</td>
                <td>{r.rider_name}<br /><span className="ops-muted">{r.rider_mobile}</span></td>
                <td>{r.body_preview}</td>
                <td><span className={`ops-badge ${r.delivery_status === 'delivered' ? 'ok' : r.delivery_status === 'failed' ? 'bad' : 'info'}`}>{r.delivery_status}</span></td>
                <td>{r.provider_ref || r.error_message || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
