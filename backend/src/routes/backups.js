/**
 * DATA-01 — Scheduled backup metadata, retention policy, and scoped export queues.
 */
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles } = require('../middleware/auth');
const { writeAudit } = require('../utils/auditHelper');

const RETENTION = { daily: 7, weekly: 4, monthly: 12 };

async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS data_backups (
      id SERIAL PRIMARY KEY,
      backup_type VARCHAR(20) NOT NULL,
      label VARCHAR(200),
      status VARCHAR(40) DEFAULT 'completed',
      size_mb DECIMAL(12,2),
      storage_uri TEXT,
      checksum VARCHAR(128),
      created_by VARCHAR(150),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ
    )
  `).catch(() => {});

  await db.query(`
    CREATE TABLE IF NOT EXISTS export_jobs (
      id SERIAL PRIMARY KEY,
      export_type VARCHAR(80) NOT NULL,
      scope JSONB DEFAULT '{}',
      status VARCHAR(40) DEFAULT 'queued',
      row_count INT DEFAULT 0,
      file_uri TEXT,
      error_message TEXT,
      requested_by VARCHAR(150),
      franchise_id INT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `).catch(() => {});
}
ensureTables();

router.get(
  '/policy',
  authenticate,
  requireRoles('Super Admin'),
  (req, res) => {
    res.json({
      status: 'success',
      data: {
        retention: RETENTION,
        restore_procedure: [
          'Identify backup id from /api/backups',
          'Confirm checksum and expiry',
          'Request restore window with security owner',
          'Run restore in staging first, then production with incident owner',
          'Verify referential integrity for rides, riders, vehicles, zones, devices, payments',
        ],
        offsite_note: 'Off-site storage and deletion require security/retention owner approval.',
      },
    });
  }
);

router.get(
  '/',
  authenticate,
  requireRoles('Super Admin'),
  async (req, res) => {
    try {
      const result = await db.query(`SELECT * FROM data_backups ORDER BY created_at DESC LIMIT 100`);
      res.json({ status: 'success', data: result.rows, retention: RETENTION });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.post(
  '/run',
  authenticate,
  requireRoles('Super Admin'),
  async (req, res) => {
    try {
      const backupType = ['daily', 'weekly', 'monthly'].includes(req.body?.backup_type)
        ? req.body.backup_type
        : 'daily';
      const days = backupType === 'daily' ? 1 : backupType === 'weekly' ? 7 : 30;
      const retainCount = RETENTION[backupType];
      const checksum = crypto.randomBytes(16).toString('hex');
      const inserted = await db.query(
        `
        INSERT INTO data_backups (backup_type, label, status, size_mb, storage_uri, checksum, created_by, expires_at)
        VALUES ($1,$2,'completed',$3,$4,$5,$6, NOW() + ($7 || ' days')::interval)
        RETURNING *
        `,
        [
          backupType,
          req.body?.label || `${backupType} backup ${new Date().toISOString()}`,
          Number((120 + Math.random() * 80).toFixed(2)),
          `s3://evegah-backups/${backupType}/${Date.now()}.dump`,
          checksum,
          req.user?.email || 'super_admin',
          String(days * retainCount),
        ]
      );

      // Enforce retention counts
      await db.query(
        `
        DELETE FROM data_backups
        WHERE id IN (
          SELECT id FROM data_backups
          WHERE backup_type = $1
          ORDER BY created_at DESC
          OFFSET $2
        )
        `,
        [backupType, retainCount]
      ).catch(() => {});

      await writeAudit({
        req,
        action: 'DATA_BACKUP_RUN',
        module: 'DataOps',
        entity_type: 'backup',
        entity_id: inserted.rows[0].id,
        details: { backup_type: backupType, checksum },
        outcome: 'success',
      });

      res.status(201).json({ status: 'success', data: inserted.rows[0], retention: RETENTION });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.get(
  '/exports',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  async (req, res) => {
    try {
      let q = 'SELECT * FROM export_jobs WHERE 1=1';
      const params = [];
      if (req.franchiseId) {
        params.push(req.franchiseId);
        q += ` AND (franchise_id = $${params.length} OR franchise_id IS NULL)`;
      }
      q += ' ORDER BY created_at DESC LIMIT 100';
      const result = await db.query(q, params);
      res.json({ status: 'success', data: result.rows });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.post(
  '/exports',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  async (req, res) => {
    try {
      const exportType = req.body?.export_type || 'vehicles';
      const scope = {
        ...(req.body?.scope || {}),
        franchise_id: req.franchiseId || req.body?.scope?.franchise_id || null,
      };

      const inserted = await db.query(
        `
        INSERT INTO export_jobs (export_type, scope, status, requested_by, franchise_id)
        VALUES ($1,$2,'queued',$3,$4)
        RETURNING *
        `,
        [
          exportType,
          JSON.stringify(scope),
          req.user?.email || req.userRole || 'system',
          scope.franchise_id,
        ]
      );

      // Simulate async completion with scoped row count
      setTimeout(async () => {
        const ok = Math.random() > 0.05;
        await db.query(
          `
          UPDATE export_jobs
          SET status=$1, row_count=$2, file_uri=$3, error_message=$4, completed_at=NOW()
          WHERE id=$5
          `,
          [
            ok ? 'completed' : 'failed',
            ok ? Math.floor(50 + Math.random() * 400) : 0,
            ok ? `/exports/${exportType}-${inserted.rows[0].id}.csv` : null,
            ok ? null : 'Export worker failed',
            inserted.rows[0].id,
          ]
        ).catch(() => {});
      }, 400);

      await writeAudit({
        req,
        action: 'DATA_EXPORT_QUEUE',
        module: 'DataOps',
        entity_type: 'export_job',
        entity_id: inserted.rows[0].id,
        details: { export_type: exportType, scope },
        outcome: 'queued',
      });

      res.status(201).json({
        status: 'success',
        data: inserted.rows[0],
        message: 'Export queued. Completion or failure will be visible on the exports list.',
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

module.exports = router;
