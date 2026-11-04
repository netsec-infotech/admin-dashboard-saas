/**
 * BAT-01 — Battery swap-station slot grid (8/12/16 cabinets).
 * BAT-02 — Health flags for cycle > 800 or SoH < 75%.
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles } = require('../middleware/auth');

const SLOT_STATES = ['ready', 'charging', 'faulty', 'over_temperature', 'empty', 'unlocked'];

async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS swap_stations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      zone VARCHAR(150),
      slot_count INT NOT NULL DEFAULT 12,
      address TEXT,
      status VARCHAR(40) DEFAULT 'online',
      last_update TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `).catch(() => {});

  await db.query(`
    CREATE TABLE IF NOT EXISTS swap_slots (
      id SERIAL PRIMARY KEY,
      station_id INT REFERENCES swap_stations(id) ON DELETE CASCADE,
      slot_number INT NOT NULL,
      state VARCHAR(40) NOT NULL DEFAULT 'empty',
      battery_id VARCHAR(100),
      soc INT DEFAULT 0,
      temperature DECIMAL(5,1) DEFAULT 28.0,
      eta_full_minutes INT,
      last_update TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(station_id, slot_number)
    )
  `).catch(() => {});

  const count = await db.query('SELECT COUNT(*)::int AS c FROM swap_stations').catch(() => ({ rows: [{ c: 0 }] }));
  if ((count.rows[0]?.c || 0) === 0) {
    const stations = [
      { name: 'Alkapuri Swap Hub', zone: 'Alkapuri', slots: 12 },
      { name: 'Fatehgunj Cabinet', zone: 'Fatehgunj', slots: 8 },
      { name: 'Manjalpur Grid', zone: 'Manjalpur', slots: 16 },
    ];
    for (const s of stations) {
      const st = await db.query(
        `INSERT INTO swap_stations (name, zone, slot_count, address) VALUES ($1,$2,$3,$4) RETURNING id`,
        [s.name, s.zone, s.slots, `${s.zone}, Vadodara`]
      );
      const stationId = st.rows[0].id;
      for (let i = 1; i <= s.slots; i++) {
        const roll = Math.random();
        let state = 'ready';
        let soc = 90 + Math.floor(Math.random() * 10);
        let temp = 28 + Math.random() * 6;
        let eta = null;
        let batteryId = `BAT-${s.zone.slice(0, 3).toUpperCase()}-${100 + i}`;
        if (roll < 0.15) {
          state = 'charging';
          soc = 20 + Math.floor(Math.random() * 60);
          eta = Math.round(((100 - soc) / 100) * 90);
        } else if (roll < 0.22) {
          state = 'faulty';
          soc = 40;
          temp = 48 + Math.random() * 8;
        } else if (roll < 0.28) {
          state = 'over_temperature';
          soc = 70;
          temp = 52 + Math.random() * 6;
        } else if (roll < 0.4) {
          state = 'empty';
          soc = 0;
          batteryId = null;
        } else if (roll < 0.45) {
          state = 'unlocked';
          soc = 95;
        }
        await db.query(
          `
          INSERT INTO swap_slots (station_id, slot_number, state, battery_id, soc, temperature, eta_full_minutes)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          `,
          [stationId, i, state, batteryId, soc, Number(temp.toFixed(1)), eta]
        );
      }
    }
  }
}
ensureTables();

router.get(
  '/',
  authenticate,
  async (req, res) => {
    try {
      const stations = await db.query(`SELECT * FROM swap_stations ORDER BY id`);
      res.json({ status: 'success', data: stations.rows, slot_states: SLOT_STATES });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.get(
  '/health/flags',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager', 'Mechanic', 'Battery Technician', 'Zone Operator'),
  async (req, res) => {
    try {
      const cycleThreshold = Number(req.query.cycle_threshold || 800);
      const sohThreshold = Number(req.query.soh_threshold || 75);
      let rows = [];
      try {
        const result = await db.query(
          `
          SELECT battery_id, status, soc, cycles, COALESCE(soh, health) AS soh, temp, zone, updated_at
          FROM batteries
          WHERE COALESCE(cycles,0) > $1 OR COALESCE(soh, health, 100) < $2
          ORDER BY COALESCE(soh, health, 100) ASC, cycles DESC
          LIMIT 200
          `,
          [cycleThreshold, sohThreshold]
        );
        rows = result.rows;
      } catch (_) {
        rows = [
          { battery_id: 'BAT-DEMO-901', cycles: 912, soh: 68, temp: 41, trigger: 'Review', zone: 'Alkapuri' },
          { battery_id: 'BAT-DEMO-744', cycles: 845, soh: 72, temp: 38, status: 'Review', zone: 'Fatehgunj' },
        ];
      }

      const data = rows.map((b) => {
        const cycles = Number(b.cycles || 0);
        const soh = Number(b.soh ?? b.health ?? 100);
        const triggers = [];
        if (cycles > cycleThreshold) triggers.push({ measure: 'cycle_count', value: cycles, threshold: cycleThreshold });
        if (soh < sohThreshold) triggers.push({ measure: 'state_of_health', value: soh, threshold: sohThreshold });
        return {
          ...b,
          triggers,
          flag: 'decommission_review',
          message: 'Flagged for decommissioning review',
        };
      });

      res.json({
        status: 'success',
        data,
        thresholds: { cycle_count: cycleThreshold, soh_percent: sohThreshold },
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.get(
  '/:id/slots',
  authenticate,
  async (req, res) => {
    try {
      const station = await db.query('SELECT * FROM swap_stations WHERE id = $1', [req.params.id]);
      if (!station.rows.length) {
        return res.status(404).json({ status: 'error', message: 'Station not found' });
      }
      const slots = await db.query(
        `SELECT * FROM swap_slots WHERE station_id = $1 ORDER BY slot_number`,
        [req.params.id]
      );
      const configured = station.rows[0].slot_count;
      if (slots.rows.length !== configured) {
        return res.status(500).json({
          status: 'error',
          message: `Cabinet layout mismatch: configured ${configured} slots, found ${slots.rows.length}`,
        });
      }
      res.json({
        status: 'success',
        data: {
          station: station.rows[0],
          slots: slots.rows.map((s) => ({
            ...s,
            state_label: String(s.state).replace(/_/g, ' '),
            is_ready: s.state === 'ready',
            is_fault: ['faulty', 'over_temperature'].includes(s.state),
          })),
        },
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

module.exports = router;
