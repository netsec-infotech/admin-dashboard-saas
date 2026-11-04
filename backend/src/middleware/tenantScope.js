/**
 * SEC-01 — prevent cross-tenant reads/mutations via ID/URL tampering.
 */
const db = require('../db');

function isSuper(req) {
  const role = String(req.userRole || req.user?.role || req.user?.evegahRole || '').toLowerCase().replace(/[\s_-]+/g, '');
  return role.includes('superadmin') || role.includes('platformadmin') || !!req.user?.isInternalService;
}

function scopedFranchiseId(req) {
  return req.scopedFranchiseId || req.franchiseId || req.user?.franchiseId || null;
}

async function assertVehicleInScope(req, vehicleCode) {
  if (isSuper(req)) return { ok: true };
  const franchiseId = scopedFranchiseId(req);
  const zone = req.userZone || req.user?.zone || null;
  if (!franchiseId && !zone) return { ok: true };

  const result = await db.query(
    `SELECT code, franchise_name, zone FROM vehicles WHERE code = $1 OR registration_number = $1 LIMIT 1`,
    [vehicleCode]
  );
  if (!result.rows.length) return { ok: false, status: 404, message: 'Vehicle not found' };
  const v = result.rows[0];
  if (zone && zone !== 'All Zones' && v.zone && !String(v.zone).toLowerCase().includes(String(zone).toLowerCase().replace(/ zone$/i, ''))) {
    return { ok: false, status: 403, message: 'Forbidden: vehicle outside assigned zone scope' };
  }
  if (franchiseId && v.franchise_name && String(v.franchise_name) !== String(franchiseId) && String(v.franchise_name) !== String(req.user?.franchiseName || '')) {
    // franchise_id numeric vs name — soft match on name when present
    const fname = String(req.user?.franchiseName || '').toLowerCase();
    if (fname && !String(v.franchise_name).toLowerCase().includes(fname)) {
      return { ok: false, status: 403, message: 'Forbidden: vehicle outside assigned franchise scope' };
    }
  }
  return { ok: true, vehicle: v };
}

async function assertRiderInScope(req, riderKey) {
  if (isSuper(req)) return { ok: true };
  const franchiseId = scopedFranchiseId(req);
  const zone = req.userZone || req.user?.zone || null;
  if (!franchiseId && !zone) return { ok: true };

  await ensureRestrictionColumns();
  const result = await db.query(
    `SELECT id, mobile, zone, franchise_id, status, restriction_reason FROM renters
     WHERE id::text = $1 OR mobile LIKE $2
     ORDER BY created_at DESC LIMIT 1`,
    [String(riderKey), `%${String(riderKey).replace(/\D/g, '').slice(-10)}%`]
  );
  if (!result.rows.length) return { ok: false, status: 404, message: 'Rider not found' };
  const r = result.rows[0];
  if (franchiseId && r.franchise_id && String(r.franchise_id) !== String(franchiseId)) {
    return { ok: false, status: 403, message: 'Forbidden: rider outside assigned franchise scope' };
  }
  if (zone && zone !== 'All Zones' && r.zone && !String(r.zone).toLowerCase().includes(String(zone).toLowerCase().replace(/ zone$/i, ''))) {
    return { ok: false, status: 403, message: 'Forbidden: rider outside assigned zone scope' };
  }
  return { ok: true, rider: r };
}

async function ensureRestrictionColumns() {
  await db.query('ALTER TABLE renters ADD COLUMN IF NOT EXISTS restriction_reason VARCHAR(80)').catch(() => {});
  await db.query('ALTER TABLE renters ADD COLUMN IF NOT EXISTS restriction_notes TEXT').catch(() => {});
  await db.query('ALTER TABLE renters ADD COLUMN IF NOT EXISTS restricted_at TIMESTAMPTZ').catch(() => {});
}

async function assertRiderBookable(mobileOrId) {
  await ensureRestrictionColumns();
  const last10 = String(mobileOrId || '').replace(/\D/g, '').slice(-10);
  const result = await db.query(
    `SELECT id, status, restriction_reason, restriction_notes FROM renters
     WHERE mobile LIKE $1 OR id::text = $2
     ORDER BY created_at DESC LIMIT 1`,
    [`%${last10}%`, String(mobileOrId)]
  );
  if (!result.rows.length) return { ok: true };
  const r = result.rows[0];
  if (String(r.status || '').toLowerCase() === 'suspended' || r.restriction_reason) {
    return {
      ok: false,
      status: 403,
      code: 'RIDER_RESTRICTED',
      message: `Booking blocked: rider restricted (${r.restriction_reason || 'suspended'})`,
      restriction: r,
    };
  }
  return { ok: true, rider: r };
}

module.exports = {
  isSuper,
  scopedFranchiseId,
  assertVehicleInScope,
  assertRiderInScope,
  assertRiderBookable,
};
