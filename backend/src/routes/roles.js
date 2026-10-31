const express = require('express');
const router = express.Router();
const db = require('../db');

const DEFAULT_ROLES = [
  {
    name: 'Super Admin',
    code: 'SUPER_ADMIN',
    description: 'Master system administrator with unrestricted access to all modules, financial settings, and platform configuration.',
    status: 'Active',
    permissions: {
      Dashboard: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Registrations: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Riders: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Vehicles: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Battery: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Maintenance: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Reports: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Alerts: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      'Zone Management': { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Franchise: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      'Users & Roles': { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Settings: { access: true, create: true, view: true, edit: true, delete: true, export: true }
    }
  },
  {
    name: 'Platform Admin',
    code: 'ADMIN',
    description: 'Platform administrator with operational authority over zones, vehicles, battery inventory, and rider accounts.',
    status: 'Active',
    permissions: {
      Dashboard: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Registrations: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Riders: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Vehicles: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Battery: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Maintenance: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Reports: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Alerts: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      'Zone Management': { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Franchise: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      'Users & Roles': { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Settings: { access: true, create: true, view: true, edit: true, delete: false, export: true }
    }
  },
  {
    name: 'Zone Admin',
    code: 'ZONE_ADMIN',
    description: 'Zone administrator responsible for managing single or multiple assigned hub stations, vehicle check-ins, and local inventory.',
    status: 'Active',
    permissions: {
      Dashboard: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Registrations: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Riders: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Vehicles: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Battery: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Maintenance: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Reports: { access: true, create: false, view: true, edit: false, delete: false, export: true },
      Alerts: { access: true, create: true, view: true, edit: true, delete: false, export: false },
      'Zone Management': { access: true, create: false, view: true, edit: false, delete: false, export: false }
    }
  },
  {
    name: 'Operations Manager',
    code: 'OPS_MANAGER',
    description: 'Manages live ride tracking, fleet allocations, turnaround times, and operational performance metrics.',
    status: 'Active',
    permissions: {
      Dashboard: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Registrations: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Riders: { access: true, create: false, view: true, edit: false, delete: false, export: true },
      Vehicles: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Battery: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Maintenance: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Reports: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Alerts: { access: true, create: true, view: true, edit: true, delete: true, export: true }
    }
  },
  {
    name: 'Franchise Manager',
    code: 'FRANCHISE_MANAGER',
    description: 'Oversees franchise partner hubs, vehicle deployments, package allocations, and revenue splits.',
    status: 'Active',
    permissions: {
      Dashboard: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Registrations: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Riders: { access: true, create: false, view: true, edit: false, delete: false, export: true },
      Vehicles: { access: true, create: false, view: true, edit: false, delete: false, export: true },
      Franchise: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Reports: { access: true, create: false, view: true, edit: false, delete: false, export: true }
    }
  },
  {
    name: 'Battery Technician',
    code: 'BATTERY_TECH',
    description: 'Technician managing battery inventory, health diagnostics, charging schedules, and swap station operations.',
    status: 'Active',
    permissions: {
      Dashboard: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Battery: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Maintenance: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Alerts: { access: true, create: true, view: true, edit: false, delete: false, export: false }
    }
  },
  {
    name: 'Zone Employee',
    code: 'EMPLOYEE',
    description: 'On-ground station staff handling rider KYC verification, bike handovers, inspections, and returns.',
    status: 'Active',
    permissions: {
      Dashboard: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Registrations: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Riders: { access: true, create: true, view: true, edit: false, delete: false, export: false },
      Vehicles: { access: true, create: false, view: true, edit: false, delete: false, export: false }
    }
  },
  {
    name: 'Employee Dashboard',
    code: 'EMPLOYEE_DASHBOARD',
    description: 'Ground staff executing rider registrations, vehicle dispatches, swaps, returns, and dues collection.',
    status: 'Active',
    permissions: {
      Dashboard: { access: true, create: true, view: true, edit: true, delete: true, export: true },
      Registrations: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Riders: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Vehicles: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Battery: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Attendance: { access: true, create: true, view: true, edit: true, delete: false, export: true },
      Payments: { access: true, create: true, view: true, edit: true, delete: false, export: true }
    }
  }
];

const initDefaultRoles = async () => {
  try {
    for (const r of DEFAULT_ROLES) {
      const existing = await db.query('SELECT id FROM roles WHERE name = $1 OR code = $2', [r.name, r.code]);
      if (existing.rows.length === 0) {
        await db.query(`
          INSERT INTO roles (name, code, description, status, permissions, custom_permissions)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [r.name, r.code, r.description, r.status, JSON.stringify(r.permissions), JSON.stringify([])]);
        console.log('Seeded default role:', r.name);
      }
    }
  } catch (e) {
    console.error('Error initializing default roles:', e);
  }
};

initDefaultRoles();

// GET /api/roles - List all roles with dynamic user counts
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT r.id, r.name, r.code, r.description, r.reporting_to, r.status, 
             r.permissions, r.custom_permissions, r.created_at, r.last_updated,
             COUNT(u.id)::int as users_count
      FROM roles r
      LEFT JOIN users u ON u.role = r.name OR u.role = r.code
      GROUP BY r.id
      ORDER BY r.created_at ASC
    `;
    let result = await db.query(query);
    if (!result.rows || result.rows.length === 0) {
      await initDefaultRoles();
      result = await db.query(query);
    }
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/roles/:id - Get single role
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, name, code, description, reporting_to, status, permissions, custom_permissions, created_at, last_updated FROM roles WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }

    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching role:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/roles - Create new role
router.post('/', async (req, res) => {
  try {
    const { name, code, description, reporting_to, status, permissions, custom_permissions } = req.body;

    if (!name || !code) {
      return res.status(400).json({ status: 'error', message: 'Name and code are required' });
    }

    // Check if role name or code exists
    const checkExist = await db.query(
      'SELECT id FROM roles WHERE name = $1 OR code = $2',
      [name, code.toUpperCase()]
    );
    if (checkExist.rows.length > 0) {
      return res.status(400).json({ status: 'error', message: 'Role name or code already exists' });
    }

    // Ensure Dashboard permission is auto-assigned for all roles
    const finalPermissions = permissions || {};
    if (!finalPermissions.Dashboard || finalPermissions.Dashboard.access === false) {
      finalPermissions.Dashboard = {
        access: true,
        create: true,
        view: true,
        edit: true,
        delete: true,
        export: true
      };
    }

    const result = await db.query(`
      INSERT INTO roles (name, code, description, reporting_to, status, permissions, custom_permissions)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, code, description, reporting_to, status, permissions, custom_permissions, created_at
    `, [
      name,
      code.toUpperCase(),
      description || '',
      reporting_to || null,
      status || 'Active',
      JSON.stringify(finalPermissions),
      JSON.stringify(custom_permissions || [])
    ]);

    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error creating role:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PUT /api/roles/:id - Update existing role
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, reporting_to, status, permissions, custom_permissions } = req.body;

    // Check if role exists
    const checkRole = await db.query('SELECT name FROM roles WHERE id = $1', [id]);
    if (checkRole.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }

    const oldName = checkRole.rows[0].name;

    // Ensure Dashboard permission is auto-assigned for all roles
    const finalPermissions = permissions || {};
    if (!finalPermissions.Dashboard || finalPermissions.Dashboard.access === false) {
      finalPermissions.Dashboard = {
        access: true,
        create: true,
        view: true,
        edit: true,
        delete: true,
        export: true
      };
    }

    const result = await db.query(`
      UPDATE roles
      SET name = $1, code = $2, description = $3, reporting_to = $4, status = $5, 
          permissions = $6, custom_permissions = $7, last_updated = NOW()
      WHERE id = $8
      RETURNING id, name, code, description, reporting_to, status, permissions, custom_permissions, last_updated
    `, [
      name,
      code.toUpperCase(),
      description || '',
      reporting_to || null,
      status || 'Active',
      JSON.stringify(finalPermissions),
      JSON.stringify(custom_permissions || []),
      id
    ]);

    // If role name changed, update the user roles in users table
    if (name && oldName !== name) {
      await db.query('UPDATE users SET role = $1 WHERE role = $2', [name, oldName]);
    }

    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE /api/roles/:id - Delete a role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const checkRole = await db.query('SELECT name, code FROM roles WHERE id = $1', [id]);
    if (checkRole.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }

    const { name, code } = checkRole.rows[0];

    // Check if any users are assigned to this role
    const checkUsers = await db.query(
      'SELECT id FROM users WHERE role = $1 OR role = $2 LIMIT 1',
      [name, code]
    );
    if (checkUsers.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete role because it is currently assigned to users'
      });
    }

    await db.query('DELETE FROM roles WHERE id = $1', [id]);
    res.json({ status: 'success', message: 'Role deleted successfully' });
  } catch (err) {
    console.error('Error deleting role:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
