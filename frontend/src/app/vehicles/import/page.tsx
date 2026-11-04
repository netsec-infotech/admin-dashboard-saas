'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import OpsPageShell from '@/components/OpsPageShell';
import { api } from '@/lib/api';

export default function VehicleBulkImportPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [preview, setPreview] = useState<any | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File) => {
    setErr('');
    setMsg('');
    setPreview(null);
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    setRows(json);
  };

  const runPreview = async () => {
    setBusy(true);
    setErr('');
    try {
      const res = await api.post('/vehicles/bulk-import/preview', { vehicles: rows, allow_update: false });
      setPreview(res.data);
      setMsg(res.data?.summary || 'Preview ready');
    } catch (e: any) {
      setErr(e.message || 'Preview failed');
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    if (!preview || preview.invalid_count > 0) {
      setErr('Commit blocked until all rows are valid. Fix field-level errors first.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post('/vehicles/bulk-import', { vehicles: rows, allow_update: false });
      setMsg(res.message || 'Import committed');
      setPreview(null);
      setRows([]);
    } catch (e: any) {
      setErr(e.message || 'Import blocked');
    } finally {
      setBusy(false);
    }
  };

  return (
    <OpsPageShell
      title="Bulk Vehicle Import / Export"
      subtitle="Preview validates every row with field-level errors. Invalid or duplicate codes never create partial fleets."
      actions={
        <div className="ops-row">
          <a className="ops-btn secondary" href={(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/vehicles/sample-excel'}>Sample Excel</a>
          <a className="ops-btn secondary" href={(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/vehicles/export'}>Export CSV</a>
        </div>
      }
    >
      {msg ? <div className="ops-card" style={{ marginBottom: 12, background: '#ECFDF5' }}>{msg}</div> : null}
      {err ? <div className="ops-card" style={{ marginBottom: 12, background: '#FEF2F2' }}>{err}</div> : null}

      <div className="ops-card" style={{ marginBottom: 16 }}>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <div className="ops-row" style={{ marginTop: 12 }}>
          <button className="ops-btn secondary" disabled={!rows.length || busy} onClick={runPreview}>Preview validation</button>
          <button className="ops-btn" disabled={!preview || preview.invalid_count > 0 || busy} onClick={commit}>Commit valid import</button>
          <span className="ops-muted">{rows.length} file rows loaded</span>
        </div>
      </div>

      {preview ? (
        <div className="ops-card">
          <div className="ops-stats">
            <div className="ops-stat"><div className="ops-stat-lbl">Valid</div><div className="ops-stat-val">{preview.valid_count}</div></div>
            <div className="ops-stat"><div className="ops-stat-lbl">Invalid</div><div className="ops-stat-val">{preview.invalid_count}</div></div>
            <div className="ops-stat"><div className="ops-stat-lbl">Total</div><div className="ops-stat-val">{preview.total}</div></div>
          </div>
          <table className="ops-table">
            <thead><tr><th>Row</th><th>Code</th><th>Model</th><th>Zone</th><th>State</th><th>Field errors</th></tr></thead>
            <tbody>
              {(preview.rows || []).map((r: any) => (
                <tr key={r.row}>
                  <td>{r.row}</td>
                  <td style={{ fontWeight: 700 }}>{r.code || '—'}</td>
                  <td>{r.model}</td>
                  <td>{r.zone}</td>
                  <td><span className={`ops-badge ${r.valid ? 'ok' : 'bad'}`}>{r.valid ? (r.exists_in_db ? 'update' : 'new') : 'invalid'}</span></td>
                  <td className="ops-muted">{(r.field_errors || []).map((fe: any) => `${fe.field}: ${fe.message}`).join('; ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </OpsPageShell>
  );
}
