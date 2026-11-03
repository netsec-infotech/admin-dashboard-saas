/**
 * FLEET-02 — Remote vehicle controls with two-step confirmation + PIN + audit.
 */
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles } = require('../middleware/auth');
const { remoteControlLimiter } = require('../middleware/rateLimit');
const { requireFields } = require('../middleware/validate');
const { writeAudit } = require('../utils/auditHelper');

const ALLOWED_ACTIONS = [
  'immobilize',
  'enable_ignition',
  'lock',
  'unlock',
  'battery_release',
];

// Short-lived confirmation tokens: token -> { vehicleCode, action, userId, expiresAt }
const pendingConfirms = new Map();
const PIN_ATTEMPTS = new Map(); // userId -> { count, lockedUntil }

const OPERATOR_PIN = process.env.REMOTE_CONTROL_PIN || '2468';
const CONFIRM_TTL_MS = 2 * 60 * 1000;
const PIN_LOCK_AFTER = 5;
const PIN_LOCK_MS = 10 * 60 * 1000;

function cleanupTokens() {
  const now = Date.now();
  for (const [k, v] of pendingConfirms.entries()) {
    if (v.expiresAt < now) pendingConfirms.delete(k);
  }
}

async function ensureCommandTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS vehicle_remote_commands (
      id SERIAL PRIMARY KEY,
      vehicle_code VARCHAR(100) NOT NULL,
      action VARCHAR(50) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      requested_by VARCHAR(150),
      actor_id VARCHAR(100),
      pin_verified BOOLEAN DEFAULT FALSE,
      result_message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `).catch(() => {});
}
ensureCommandTable();

// Step 1: request confirmation token
router.post(
  '/:code/commands/request',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager', 'Zone Operator', 'Zone Admin', 'Operations Manager'),
  remoteControlLimiter,
  requireFields(['action']),
  async (req, res) => {
    try {
      cleanupTokens();
      const { code } = req.params;
      const action = String(req.body.action || '').toLowerCase();
      if (!ALLOWED_ACTIONS.includes(action)) {
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_ACTION',
          message: `Action must be one of: ${ALLOWED_ACTIONS.join(', ')}`,
        });
      }

      const vehicle = await db.query(
        'SELECT code, vehicle_status, zone, evegah_model_name, vehicle_model FROM vehicles WHERE code = $1 LIMIT 1',
        [code]
      );
      if (!vehicle.rows.length) {
        return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
      }

      const confirmToken = crypto.randomBytes(24).toString('hex');
      pendingConfirms.set(confirmToken, {
        vehicleCode: code,
        action,
        userId: String(req.userId),
        vehicle: vehicle.rows[0],
        expiresAt: Date.now() + CONFIRM_TTL_MS,
      });

      await writeAudit({
        req,
        action: 'REMOTE_COMMAND_REQUEST',
        module: 'Fleet',
        entity_type: 'vehicle',
        entity_id: code,
        details: { action, step: 1 },
        outcome: 'pending',
      });

      res.json({
        status: 'success',
        data: {
          confirm_token: confirmToken,
          expires_in_seconds: CONFIRM_TTL_MS / 1000,
          vehicle: {
            code: vehicle.rows[0].code,
            status: vehicle.rows[0].vehicle_status,
            zone: vehicle.rows[0].zone,
            model: vehicle.rows[0].evegah_model_name || vehicle.rows[0].vehicle_model,
          },
          action,
          message: 'Confirm with operator PIN to execute this remote command.',
        },
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

// Step 2: confirm with PIN and execute
router.post(
  '/:code/commands/confirm',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager', 'Zone Operator', 'Zone Admin', 'Operations Manager'),
  remoteControlLimiter,
  requireFields([
    { name: 'confirm_token' },
    { name: 'pin', type: 'pin' },
    { name: 'action' },
  ]),
  async (req, res) => {
    const started = Date.now();
    let commandId = null;
    try {
      cleanupTokens();
      const { code } = req.params;
      const { confirm_token, pin, action } = req.body;
      const userKey = String(req.userId);

      const lockState = PIN_ATTEMPTS.get(userKey);
      if (lockState?.lockedUntil && lockState.lockedUntil > Date.now()) {
        return res.status(423).json({
          status: 'error',
          code: 'PIN_LOCKED',
          message: 'PIN retry lockout active. Try again later.',
          locked_until: new Date(lockState.lockedUntil).toISOString(),
        });
      }

      const pending = pendingConfirms.get(confirm_token);
      if (!pending || pending.expiresAt < Date.now()) {
        pendingConfirms.delete(confirm_token);
        return res.status(400).json({
          status: 'error',
          code: 'CONFIRM_EXPIRED',
          message: 'Confirmation token expired or invalid. Request again.',
        });
      }
      if (pending.vehicleCode !== code || pending.action !== String(action).toLowerCase()) {
        return res.status(400).json({
          status: 'error',
          code: 'CONFIRM_MISMATCH',
          message: 'Confirmation does not match requested vehicle/action.',
        });
      }
      if (pending.userId !== userKey && !(req.userRole || '').toLowerCase().includes('superadmin')) {
        return res.status(403).json({
          status: 'error',
          code: 'FORBIDDEN',
          message: 'Confirmation belongs to a different operator.',
        });
      }

      if (String(pin) !== String(OPERATOR_PIN)) {
        const attempts = PIN_ATTEMPTS.get(userKey) || { count: 0, lockedUntil: 0 };
        attempts.count += 1;
        if (attempts.count >= PIN_LOCK_AFTER) {
          attempts.lockedUntil = Date.now() + PIN_LOCK_MS;
          attempts.count = 0;
        }
        PIN_ATTEMPTS.set(userKey, attempts);
        await writeAudit({
          req,
          action: 'REMOTE_COMMAND_PIN_FAIL',
          module: 'Fleet',
          entity_type: 'vehicle',
          entity_id: code,
          details: { action, attempts: attempts.count },
          outcome: 'failure',
        });
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_PIN',
          message: 'Invalid operator PIN.',
          attempts_remaining: attempts.lockedUntil > Date.now() ? 0 : PIN_LOCK_AFTER - attempts.count,
        });
      }

      PIN_ATTEMPTS.delete(userKey);
      pendingConfirms.delete(confirm_token);

      const insert = await db.query(
        `
        INSERT INTO vehicle_remote_commands
          (vehicle_code, action, status, requested_by, actor_id, pin_verified, result_message)
        VALUES ($1,$2,'pending',$3,$4,TRUE,'Dispatching to device')
        RETURNING *
        `,
        [code, pending.action, req.user?.email || req.userRole, userKey]
      );
      commandId = insert.rows[0].id;

      // Simulate device acknowledgement with timeout window (production would use IoT gateway)
      const ackDelay = 400 + Math.floor(Math.random() * 600);
      await new Promise((r) => setTimeout(r, Math.min(ackDelay, 1500)));
      const timedOut = Date.now() - started > 8000;
      const success = !timedOut && Math.random() > 0.05;
      const finalStatus = timedOut ? 'timeout' : success ? 'success' : 'failure';
      const resultMessage = timedOut
        ? 'Device did not acknowledge within timeout window'
        : success
          ? `Command ${pending.action} acknowledged by tracker`
          : 'Device rejected command';

      const updated = await db.query(
        `
        UPDATE vehicle_remote_commands
        SET status = $1, result_message = $2, completed_at = NOW()
        WHERE id = $3
        RETURNING *
        `,
        [finalStatus, resultMessage, commandId]
      );

      // Persist immobilization / lock flags on vehicle when successful
      if (finalStatus === 'success') {
        if (pending.action === 'immobilize') {
          await db.query(
            `UPDATE vehicles SET vehicle_status = CASE
               WHEN LOWER(COALESCE(vehicle_status,'')) = 'in ride' THEN vehicle_status
               ELSE 'Immobilized' END,
               updated_at = NOW() WHERE code = $1`,
            [code]
          ).catch(() => {});
        }
        if (pending.action === 'enable_ignition') {
          await db.query(
            `UPDATE vehicles SET vehicle_status = 'Available', updated_at = NOW() WHERE code = $1 AND LOWER(vehicle_status) = 'immobilized'`,
            [code]
          ).catch(() => {});
        }
      }

      const audit = await writeAudit({
        req,
        action: `REMOTE_${pending.action.toUpperCase()}`,
        module: 'Fleet',
        entity_type: 'vehicle',
        entity_id: code,
        details: {
          command_id: commandId,
          action: pending.action,
          status: finalStatus,
          result: resultMessage,
        },
        outcome: finalStatus,
        after: updated.rows[0],
      });

      res.json({
        status: 'success',
        data: {
          command: updated.rows[0],
          audit_id: audit?.id || null,
          requested_action: pending.action,
          target_vehicle: code,
          result: finalStatus,
          message: resultMessage,
        },
      });
    } catch (err) {
      if (commandId) {
        await db.query(
          `UPDATE vehicle_remote_commands SET status='failure', result_message=$1, completed_at=NOW() WHERE id=$2`,
          [err.message, commandId]
        ).catch(() => {});
      }
      await writeAudit({
        req,
        action: 'REMOTE_COMMAND_ERROR',
        module: 'Fleet',
        entity_type: 'vehicle',
        entity_id: req.params.code,
        details: { error: err.message },
        outcome: 'failure',
      });
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

// Command history for a vehicle
router.get(
  '/:code/commands',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager', 'Zone Operator', 'Zone Admin', 'Operations Manager', 'Mechanic'),
  async (req, res) => {
    try {
      const result = await db.query(
        `SELECT * FROM vehicle_remote_commands WHERE vehicle_code = $1 ORDER BY created_at DESC LIMIT 50`,
        [req.params.code]
      );
      res.json({ status: 'success', data: result.rows });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

module.exports = router;
