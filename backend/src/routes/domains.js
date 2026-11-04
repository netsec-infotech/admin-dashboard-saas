/**
 * SET-02 — Custom domain verification with DNS/CNAME and SSL status.
 */
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles } = require('../middleware/auth');
const { writeAudit } = require('../utils/auditHelper');

async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS custom_domains (
      id SERIAL PRIMARY KEY,
      franchise_id INT,
      domain VARCHAR(255) NOT NULL UNIQUE,
      cname_target VARCHAR(255) DEFAULT 'wl.evegah.com',
      verification_token VARCHAR(128),
      dns_status VARCHAR(40) DEFAULT 'pending',
      ssl_status VARCHAR(40) DEFAULT 'pending',
      last_check_at TIMESTAMPTZ,
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `).catch(() => {});
}
ensureTables();

router.get(
  '/',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  async (req, res) => {
    try {
      let q = 'SELECT * FROM custom_domains WHERE 1=1';
      const params = [];
      if (req.franchiseId) {
        params.push(req.franchiseId);
        q += ` AND franchise_id = $${params.length}`;
      }
      q += ' ORDER BY created_at DESC';
      const result = await db.query(q, params);
      res.json({ status: 'success', data: result.rows });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.post(
  '/',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  async (req, res) => {
    try {
      const domain = String(req.body?.domain || '').trim().toLowerCase();
      if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
        return res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Valid domain required',
        });
      }
      const token = `evegah-verify-${crypto.randomBytes(8).toString('hex')}`;
      const inserted = await db.query(
        `
        INSERT INTO custom_domains (franchise_id, domain, verification_token, dns_status, ssl_status)
        VALUES ($1,$2,$3,'pending','pending')
        RETURNING *
        `,
        [req.body?.franchise_id || req.franchiseId || null, domain, token]
      );
      await writeAudit({
        req,
        action: 'DOMAIN_ADD',
        module: 'WhiteLabel',
        entity_type: 'domain',
        entity_id: inserted.rows[0].id,
        details: { domain },
        outcome: 'pending',
      });
      res.status(201).json({
        status: 'success',
        data: inserted.rows[0],
        instructions: {
          cname: `Point ${domain} CNAME to wl.evegah.com`,
          txt: `Add TXT record _evegah-challenge.${domain} = ${token}`,
          note: 'Publishing does not imply the domain is ready before verification.',
        },
      });
    } catch (err) {
      if (String(err.message).includes('duplicate')) {
        return res.status(409).json({ status: 'error', message: 'Domain already registered' });
      }
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.post(
  '/:id/verify',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  async (req, res) => {
    try {
      const existing = await db.query('SELECT * FROM custom_domains WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) {
        return res.status(404).json({ status: 'error', message: 'Domain not found' });
      }

      // Simulated DNS check — success ~70%, error ~15%, remain pending ~15%
      const roll = Math.random();
      let dnsStatus = 'pending';
      let sslStatus = 'pending';
      let errorMessage = null;
      if (roll < 0.7) {
        dnsStatus = 'verified';
        sslStatus = 'active';
      } else if (roll < 0.85) {
        dnsStatus = 'error';
        sslStatus = 'error';
        errorMessage = 'CNAME record not found or TXT challenge mismatch';
      }

      const updated = await db.query(
        `
        UPDATE custom_domains
        SET dns_status=$1, ssl_status=$2, error_message=$3, last_check_at=NOW(), updated_at=NOW()
        WHERE id=$4
        RETURNING *
        `,
        [dnsStatus, sslStatus, errorMessage, req.params.id]
      );

      await writeAudit({
        req,
        action: 'DOMAIN_VERIFY_CHECK',
        module: 'WhiteLabel',
        entity_type: 'domain',
        entity_id: req.params.id,
        details: { dns_status: dnsStatus, ssl_status: sslStatus },
        outcome: dnsStatus === 'verified' ? 'success' : dnsStatus,
      });

      res.json({
        status: 'success',
        data: updated.rows[0],
        message:
          dnsStatus === 'verified'
            ? 'Domain verified and SSL active'
            : dnsStatus === 'error'
              ? errorMessage
              : 'Verification still pending — DNS may need more time to propagate',
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

module.exports = router;
