/**
 * FLEET-04 — Shared validation for bulk vehicle import preview and commit.
 * Field-level errors; never silently create partial/duplicate rows on commit.
 */

function parseExcelOrStrDate(val) {
  if (!val || val === 'NA' || val === 'N/A' || val === '-') return null;
  if (typeof val === 'number') {
    const utcDays = val - 25569;
    const date = new Date(Math.round(utcDays * 86400 * 1000));
    return Number.isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }
  const s = String(val).trim();
  if (!s || s.toLowerCase() === 'na') return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

function pick(v, keys, fallback = '') {
  for (const k of keys) {
    if (v[k] !== undefined && v[k] !== null && String(v[k]).trim() !== '') {
      return String(v[k]).trim();
    }
  }
  return fallback;
}

function normalizeRow(v, rowNumber) {
  const fieldErrors = [];
  const code = pick(v, ['code', 'Vehicle Code*', 'Vehicle Code *', 'Vehicle Code', 'vehicle_code']);
  if (!code) fieldErrors.push({ field: 'code', message: 'Vehicle Code is required' });
  if (code && !/^[A-Za-z0-9_-]{3,40}$/.test(code)) {
    fieldErrors.push({ field: 'code', message: 'Vehicle Code must be 3–40 alphanumeric characters' });
  }

  let rawModel = pick(v, ['evegah_model_name', 'Model Name *', 'Model Name', 'model_name'], 'Mink');
  let modelName = rawModel;
  if (!modelName.toLowerCase().startsWith('evegah') && !modelName.toLowerCase().startsWith('evg')) {
    modelName = `Evegah ${modelName}`;
  }
  if (!rawModel) fieldErrors.push({ field: 'model', message: 'Model Name is required' });

  const zone = pick(v, ['zone', 'Zone'], 'Gotri Zone');
  if (!zone) fieldErrors.push({ field: 'zone', message: 'Zone is required' });

  const batteryPctRaw = v.battery_pct ?? v['Battery Pct'];
  if (batteryPctRaw !== undefined && batteryPctRaw !== null && batteryPctRaw !== '') {
    const bp = Number(batteryPctRaw);
    if (Number.isNaN(bp) || bp < 0 || bp > 100) {
      fieldErrors.push({ field: 'battery_pct', message: 'Battery Pct must be a number between 0 and 100' });
    }
  }

  const regNo = pick(v, ['registration_number', 'Registration Number']);
  const chassisNo = pick(v, ['chassis_number', 'Chassis Number']);
  const color = pick(v, ['color', 'Color'], 'Purple');
  const category = pick(v, ['vehicle_category', 'Category', 'category'], 'E-Vehicle');
  const vehicleType = pick(v, ['vehicle_type', 'Vehicle Type', 'vehicle_type'], 'Rental');
  const status = pick(v, ['vehicle_status', 'Vehicle Status', 'status'], 'Available');

  return {
    row: rowNumber,
    valid: fieldErrors.length === 0,
    field_errors: fieldErrors,
    normalized: {
      code,
      modelName,
      zone,
      regNo,
      chassisNo,
      color,
      category,
      vehicleType,
      status,
      batteryPct: parseInt(batteryPctRaw ?? 100, 10) || 100,
      purchaseDate: parseExcelOrStrDate(v.purchase_date || v['Purchase Date (YYYY-MM-DD)'] || v['Purchase Date']),
      warrantyDate: parseExcelOrStrDate(v.vehicle_warranty_expiry_date || v['Warranty Expiry (YYYY-MM-DD)'] || v['Warranty Expiry']),
      insExpiry: parseExcelOrStrDate(v.insurance_expiry_date || v['Insurance Expiry (YYYY-MM-DD)'] || v['Insurance Expiry']),
      franchise: pick(v, ['franchise_name', 'Franchise Name'], 'EVEGAH'),
      city: pick(v, ['inventory_city', 'Inventory City'], 'Vadodara'),
    },
  };
}

/**
 * Validate an array of vehicle rows. Marks duplicates within the file and
 * existing codes in DB as field-level errors when allowUpdate is false.
 */
async function validateVehicleImportRows(db, vehicles, { allowUpdate = false } = {}) {
  const seen = new Map();
  const results = [];
  const codes = [];

  vehicles.forEach((v, i) => {
    const row = normalizeRow(v, i + 1);
    const codeKey = (row.normalized.code || '').toUpperCase();
    if (codeKey) {
      if (seen.has(codeKey)) {
        row.valid = false;
        row.field_errors.push({
          field: 'code',
          message: `Duplicate Vehicle Code in file (also on row ${seen.get(codeKey)})`,
        });
      } else {
        seen.set(codeKey, row.row);
        codes.push(codeKey);
      }
    }
    results.push(row);
  });

  let existing = new Set();
  if (codes.length) {
    try {
      const res = await db.query(
        `SELECT UPPER(code) AS code FROM vehicles WHERE UPPER(code) = ANY($1::text[])`,
        [codes]
      );
      existing = new Set(res.rows.map((r) => r.code));
    } catch (_) {}
  }

  for (const row of results) {
    const codeKey = (row.normalized.code || '').toUpperCase();
    if (!codeKey) continue;
    row.exists_in_db = existing.has(codeKey);
    if (row.exists_in_db && !allowUpdate) {
      row.valid = false;
      row.field_errors.push({
        field: 'code',
        message: 'Vehicle Code already exists — refuse silent duplicate create',
      });
    }
  }

  const validRows = results.filter((r) => r.valid);
  const invalidRows = results.filter((r) => !r.valid);
  return {
    total: results.length,
    valid_count: validRows.length,
    invalid_count: invalidRows.length,
    rows: results,
    valid_rows: validRows,
    invalid_rows: invalidRows,
  };
}

module.exports = {
  parseExcelOrStrDate,
  normalizeRow,
  validateVehicleImportRows,
};
