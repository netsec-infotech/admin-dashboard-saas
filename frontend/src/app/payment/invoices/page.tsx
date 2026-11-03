'use client';
import { useEffect, useState } from 'react';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

export default function InvoicesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/invoices${q}`);
      setRows(res.data || []);
    } catch (e: any) {
      setErr(e.message || 'Failed to load invoices');
    }
  };

  useEffect(() => { load(); }, []);

  const open = async (invoiceNo: string) => {
    try {
      const res = await api.get(`/invoices/${encodeURIComponent(invoiceNo)}`);
      setSelected(res.data);
    } catch (e: any) {
      setErr(e.message || 'Failed to open invoice');
    }
  };

  return (
    <OpsPageShell
      title="GST Invoices"
      subtitle="Downloadable tax invoices with CGST / SGST / IGST breakdown linked to source transactions."
      actions={
        <div className="ops-row">
          <input className="ops-input" style={{ width: 220 }} placeholder="Search invoice / txn" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="ops-btn secondary" onClick={load}>Search</button>
        </div>
      }
    >
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}
      <div className="ops-grid" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
        <div className="ops-card">
          <table className="ops-table">
            <thead><tr><th>Invoice</th><th>Customer</th><th>Txn</th><th>Tax</th><th>Total</th><th>Type</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => open(r.invoice_no)}>
                  <td style={{ fontWeight: 700 }}>{r.invoice_no}</td>
                  <td>{r.customer_name}</td>
                  <td>{r.transaction_id}</td>
                  <td>C {r.cgst} / S {r.sgst} / I {r.igst}</td>
                  <td>₹{Number(r.total_amount).toFixed(2)}</td>
                  <td><span className={`ops-badge ${r.invoice_type === 'credit_note' ? 'warn' : 'info'}`}>{r.invoice_type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ops-card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Invoice detail</div>
          {!selected ? <p className="ops-muted">Select an invoice to inspect tax breakdown and source linkage.</p> : (
            <>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.invoice_no}</div>
              <p className="ops-muted">{selected.customer_name} · {selected.place_of_supply}</p>
              <div className="ops-stats" style={{ marginTop: 12 }}>
                <div className="ops-stat"><div className="ops-stat-lbl">Taxable</div><div className="ops-stat-val">₹{Number(selected.taxable_amount).toFixed(2)}</div></div>
                <div className="ops-stat"><div className="ops-stat-lbl">CGST</div><div className="ops-stat-val">₹{Number(selected.cgst).toFixed(2)}</div></div>
                <div className="ops-stat"><div className="ops-stat-lbl">SGST</div><div className="ops-stat-val">₹{Number(selected.sgst).toFixed(2)}</div></div>
                <div className="ops-stat"><div className="ops-stat-lbl">IGST</div><div className="ops-stat-val">₹{Number(selected.igst).toFixed(2)}</div></div>
              </div>
              <p style={{ marginTop: 12 }}>Reconciles to transaction <strong>{selected.reconciles_to || selected.transaction_id}</strong></p>
              {selected.pdf_uri ? <a className="ops-btn" href={selected.pdf_uri} target="_blank" rel="noreferrer">Download / view</a> : null}
            </>
          )}
        </div>
      </div>
    </OpsPageShell>
  );
}
