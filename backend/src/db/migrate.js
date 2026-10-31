require('dotenv').config();
const db = require('../db');

const migrate = async () => {
  console.log('Running migrations...');

  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      role VARCHAR(50) DEFAULT 'Employee',
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS riders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS requests (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      request_id VARCHAR(30) UNIQUE NOT NULL,
      type VARCHAR(50) NOT NULL,
      rider_id UUID REFERENCES riders(id),
      employee_id UUID REFERENCES users(id),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS batteries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      battery_id VARCHAR(50) UNIQUE NOT NULL,
      status VARCHAR(30) DEFAULT 'idle',
      soc INT DEFAULT 100,
      voltage NUMERIC(5, 2),
      current NUMERIC(5, 2),
      temp NUMERIC(4, 1),
      cycles INT DEFAULT 0,
      health INT DEFAULT 100,
      lat NUMERIC(9, 6),
      lng NUMERIC(9, 6),
      serial_number VARCHAR(100),
      battery_type VARCHAR(50) DEFAULT 'Li-ion',
      capacity VARCHAR(30),
      make VARCHAR(100),
      model VARCHAR(100),
      location VARCHAR(150),
      zone VARCHAR(150),
      assigned_to VARCHAR(100),
      vehicle_number VARCHAR(50),
      rider_name VARCHAR(100),
      purchase_date DATE,
      warranty_valid_till DATE,
      supplier VARCHAR(150),
      cost NUMERIC(10, 2),
      invoice_number VARCHAR(100),
      notes TEXT,
      cells JSONB DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS battery_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      battery_id VARCHAR(50) REFERENCES batteries(battery_id) ON DELETE CASCADE,
      soc INT,
      voltage NUMERIC(5, 2),
      current NUMERIC(5, 2),
      temp NUMERIC(4, 1),
      lat NUMERIC(9, 6),
      lng NUMERIC(9, 6),
      status VARCHAR(30),
      cells JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS settings (
      category VARCHAR(50) PRIMARY KEY,
      values JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS renters (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      rider_name VARCHAR(100) NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      vehicle_id VARCHAR(50) NOT NULL,
      battery_id VARCHAR(50) NOT NULL,
      package_name VARCHAR(100) NOT NULL,
      rental_start_date DATE NOT NULL,
      return_date DATE,
      status VARCHAR(30) DEFAULT 'Active Ride',
      rent NUMERIC(10, 2) NOT NULL,
      deposit NUMERIC(10, 2) NOT NULL,
      total NUMERIC(10, 2) NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      reservation_id VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(100) NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      gov_id VARCHAR(50) NOT NULL,
      reservation_date DATE NOT NULL,
      reservation_time TIME NOT NULL,
      package_type VARCHAR(50) NOT NULL,
      vehicle_category VARCHAR(50) NOT NULL,
      vehicle_number VARCHAR(50),
      battery_id VARCHAR(50),
      id_card_url TEXT,
      inspection_media_url TEXT,
      fare NUMERIC(10, 2) NOT NULL,
      deposit NUMERIC(10, 2) NOT NULL,
      payment_mode VARCHAR(50) NOT NULL,
      payment_status VARCHAR(30) DEFAULT 'Paid',
      status VARCHAR(30) DEFAULT 'Upcoming',
      pickup_zone VARCHAR(100),
      drop_zone VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE reservations ADD COLUMN IF NOT EXISTS battery_id VARCHAR(50);
    ALTER TABLE reservations ADD COLUMN IF NOT EXISTS id_card_url TEXT;
    ALTER TABLE reservations ADD COLUMN IF NOT EXISTS inspection_media_url TEXT;

    CREATE TABLE IF NOT EXISTS zones (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      country VARCHAR(100),
      state VARCHAR(100),
      city VARCHAR(100),
      locality VARCHAR(100),
      type VARCHAR(50),
      priority VARCHAR(50),
      status VARCHAR(30) DEFAULT 'active',
      timezone VARCHAR(50),
      description TEXT,
      start_date DATE,
      end_date DATE,
      max_vehicles INT,
      notes TEXT,
      map_link TEXT,
      points JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL UNIQUE,
      code VARCHAR(50) NOT NULL UNIQUE,
      description TEXT,
      reporting_to VARCHAR(100),
      status VARCHAR(30) DEFAULT 'Active',
      permissions JSONB DEFAULT '{}'::jsonb,
      custom_permissions JSONB DEFAULT '[]'::jsonb,
      users_count INT DEFAULT 0,
      last_updated TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS zone VARCHAR(150);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'Active';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_read_at TIMESTAMPTZ;
    ALTER TABLE zones ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE zones ADD COLUMN IF NOT EXISTS image_url TEXT;
    ALTER TABLE zones ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '{}'::jsonb;
    CREATE TABLE IF NOT EXISTS vehicles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(50) UNIQUE NOT NULL,
      vehicle_image VARCHAR(255) DEFAULT '/3d_scooter_rider.png',
      vehicle_category VARCHAR(100) DEFAULT 'E-Scooter',
      vehicle_type VARCHAR(100) DEFAULT 'Rental',
      evegah_model_name VARCHAR(100) DEFAULT 'Evegah City',
      vehicle_model VARCHAR(100),
      vehicle_manufacturer VARCHAR(100),
      manufacturing_date DATE,
      chassis_number VARCHAR(100),
      motor_number VARCHAR(100),
      controller_number VARCHAR(100),
      registration_number VARCHAR(100),
      color VARCHAR(50),
      purchase_date DATE,
      vehicle_warranty_expiry_date DATE,
      insurance_policy_number VARCHAR(100),
      insurance_provider VARCHAR(100),
      insurance_expiry_date DATE,
      current_km_reading NUMERIC(12, 2) DEFAULT 0,
      total_km_covered NUMERIC(12, 2) DEFAULT 0,
      vehicle_status VARCHAR(50) DEFAULT 'Available',
      vehicle_document VARCHAR(255),
      vehicle_qr_code TEXT,
      zone VARCHAR(150) DEFAULT 'Unassigned',
      
      -- Standard tracking fields
      status VARCHAR(30) DEFAULT 'Online',
      battery_pct INT DEFAULT 100,
      speed NUMERIC(5, 2) DEFAULT 0,
      renter_name VARCHAR(100) DEFAULT 'None (Available)',
      last_seen TIMESTAMPTZ DEFAULT NOW(),
      lat NUMERIC(9, 6) DEFAULT 28.6304,
      lng NUMERIC(9, 6) DEFAULT 77.2177,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      discount_type VARCHAR(50) NOT NULL,
      discount_value NUMERIC(10, 2) NOT NULL,
      min_order NUMERIC(10, 2) DEFAULT 0.00,
      redemption_limit INT DEFAULT 100,
      per_user_limit INT DEFAULT 1,
      start_date TIMESTAMPTZ DEFAULT NOW(),
      end_date TIMESTAMPTZ,
      status VARCHAR(30) DEFAULT 'Active',
      applicable_on VARCHAR(100) DEFAULT 'All Rentals',
      selected_zones JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID,
      user_name VARCHAR(100),
      action VARCHAR(50) NOT NULL,
      module VARCHAR(100) NOT NULL,
      details TEXT NOT NULL,
      performed_by VARCHAR(100),
      ip_address VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS maintenance_orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      ticket_id VARCHAR(50) UNIQUE NOT NULL,
      vehicle_code VARCHAR(50) NOT NULL,
      issue_category VARCHAR(100) NOT NULL,
      description TEXT,
      assigned_technician VARCHAR(100),
      priority VARCHAR(30) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'In Progress',
      estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
      zone VARCHAR(150),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS franchises (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      owner_name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE,
      mobile VARCHAR(20) NOT NULL,
      hub_address TEXT NOT NULL,
      city VARCHAR(100) DEFAULT 'Vadodara',
      state VARCHAR(100) DEFAULT 'Gujarat',
      zone VARCHAR(150) DEFAULT 'Gotri Zone',
      revenue_share NUMERIC(5, 2) DEFAULT 80.00,
      assigned_vehicles INT DEFAULT 0,
      assigned_batteries INT DEFAULT 0,
      status VARCHAR(30) DEFAULT 'Active',
      operating_hours VARCHAR(100) DEFAULT '08:00 AM - 10:00 PM',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS franchise_expenses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
      franchise_name VARCHAR(150) NOT NULL,
      category VARCHAR(100) NOT NULL,
      title VARCHAR(200) NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
      payment_mode VARCHAR(50) DEFAULT 'UPI',
      invoice_number VARCHAR(100),
      notes TEXT,
      status VARCHAR(30) DEFAULT 'Approved',
      created_by VARCHAR(100) DEFAULT 'Admin',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      employee_id VARCHAR(50),
      employee_name VARCHAR(100) NOT NULL,
      employee_role VARCHAR(100) DEFAULT 'Operations Staff',
      zone VARCHAR(150) DEFAULT 'Gotri Zone Hub',
      shift VARCHAR(100) DEFAULT 'Morning Shift',
      clock_in_time TIMESTAMPTZ NOT NULL,
      clock_out_time TIMESTAMPTZ,
      elapsed_minutes INT DEFAULT 0,
      status VARCHAR(30) DEFAULT 'clocked_in',
      geofence_verified BOOLEAN DEFAULT true,
      clock_in_lat NUMERIC(9, 6),
      clock_in_lng NUMERIC(9, 6),
      clock_out_lat NUMERIC(9, 6),
      clock_out_lng NUMERIC(9, 6),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_franchise_expenses_franchise ON franchise_expenses(franchise_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_user_status ON attendance_logs(user_id, status);

    CREATE TABLE IF NOT EXISTS device_tokens (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      token TEXT UNIQUE NOT NULL,
      user_id VARCHAR(100),
      mobile VARCHAR(50),
      role VARCHAR(50) DEFAULT 'rider',
      app_type VARCHAR(50) DEFAULT 'rider',
      tenant_id VARCHAR(100),
      device_os VARCHAR(30) DEFAULT 'android',
      is_active BOOLEAN DEFAULT true,
      last_active_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_device_tokens_mobile ON device_tokens(mobile);
    CREATE INDEX IF NOT EXISTS idx_device_tokens_role ON device_tokens(role);
    CREATE INDEX IF NOT EXISTS idx_device_tokens_app ON device_tokens(app_type);

    CREATE TABLE IF NOT EXISTS push_notifications_log (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_type VARCHAR(50) NOT NULL,
      event_key VARCHAR(100),
      recipient_mobile VARCHAR(50),
      recipient_role VARCHAR(50),
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      payload JSONB DEFAULT '{}'::jsonb,
      tokens_targeted INT DEFAULT 0,
      success_count INT DEFAULT 0,
      failure_count INT DEFAULT 0,
      status VARCHAR(30) DEFAULT 'dispatched',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_push_event_key ON push_notifications_log(event_key) WHERE event_key IS NOT NULL;

    CREATE TABLE IF NOT EXISTS iot_inward_batches (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      inward_no VARCHAR(50) UNIQUE NOT NULL,
      invoice_no VARCHAR(100) NOT NULL,
      invoice_date DATE DEFAULT CURRENT_DATE,
      supplier VARCHAR(150) NOT NULL,
      po_no VARCHAR(100),
      device_type VARCHAR(100) NOT NULL,
      device_model VARCHAR(100) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      received_on TIMESTAMPTZ DEFAULT NOW(),
      status VARCHAR(50) DEFAULT 'Completed',
      qc_status VARCHAR(50) DEFAULT 'Accepted',
      notes TEXT,
      created_by VARCHAR(100) DEFAULT 'Admin',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS iot_devices (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      serial_number VARCHAR(100) UNIQUE NOT NULL,
      device_type VARCHAR(100) NOT NULL,
      device_model VARCHAR(100) NOT NULL,
      supplier VARCHAR(150) NOT NULL,
      invoice_no VARCHAR(100),
      inward_batch_id UUID REFERENCES iot_inward_batches(id) ON DELETE SET NULL,
      inward_no VARCHAR(50),
      firmware_version VARCHAR(50) DEFAULT 'v1.0.4',
      hardware_version VARCHAR(50) DEFAULT 'revB',
      status VARCHAR(50) DEFAULT 'In Stock',
      qc_status VARCHAR(50) DEFAULT 'Accepted',
      assigned_vehicle_code VARCHAR(100),
      assigned_battery_id VARCHAR(100),
      installed_at TIMESTAMPTZ,
      last_heartbeat TIMESTAMPTZ,
      is_simulated BOOLEAN DEFAULT false,
      received_on TIMESTAMPTZ DEFAULT NOW(),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_iot_devices_serial ON iot_devices(serial_number);
    CREATE INDEX IF NOT EXISTS idx_iot_devices_vehicle ON iot_devices(assigned_vehicle_code);
    CREATE INDEX IF NOT EXISTS idx_iot_devices_status ON iot_devices(status);
  `);

  // Seed default franchise if none exists
  const existingFranchises = await db.query('SELECT COUNT(*) FROM franchises');
  if (parseInt(existingFranchises.rows[0].count) === 0) {
    await db.query(`
      INSERT INTO franchises (code, name, owner_name, email, mobile, hub_address, zone, revenue_share, assigned_vehicles, assigned_batteries, status)
      VALUES 
        ('FR-ALKP-001', 'Alkapuri Evegah Hub', 'Vikram Desai', 'vikram@evegah.com', '+91 98250 11223', 'Shop 4, RC Dutt Road, Alkapuri', 'Alkapuri Zone', 80.00, 25, 50, 'Active'),
        ('FR-GOTR-002', 'Gotri Central Hub', 'Ananya Verma', 'ananya@evegah.com', '+91 91234 56789', 'Gotri Main Road, Opp. Iscon Temple', 'Gotri Zone', 85.00, 40, 80, 'Active')
      ON CONFLICT DO NOTHING
    `);
  }

  // Seed default coupons
  const existingCoupons = await db.query('SELECT COUNT(*) FROM coupons');
  if (parseInt(existingCoupons.rows[0].count) === 0) {
    await db.query(`
      INSERT INTO coupons (code, title, description, discount_type, discount_value, min_order, status, end_date)
      VALUES 
        ('GET100', 'Flat ₹100 OFF on All Rentals', 'Flat ₹100 off on your booking', 'Flat', 100.00, 300.00, 'Active', '2026-12-31'),
        ('WELCOME50', 'Flat ₹50 OFF for New Users', 'Get ₹50 off on your first ride', 'Flat', 50.00, 0.00, 'Active', '2026-12-31'),
        ('RIDER50', 'Save ₹50 on Next 3 Rides', 'Save ₹50 off on next rides', 'Flat', 50.00, 150.00, 'Active', '2026-12-31')
      ON CONFLICT DO NOTHING
    `);
  }

  // Seed default predefined roles with auto-assigned Dashboard permission
  const defaultDashPerm = JSON.stringify({ Dashboard: { access: true, create: true, view: true, edit: true, delete: true, export: true } });
  const existingRoles = await db.query('SELECT COUNT(*) FROM roles');
  if (parseInt(existingRoles.rows[0].count) === 0) {
    await db.query(`
      INSERT INTO roles (name, code, description, reporting_to, status, permissions, users_count)
      VALUES 
        ('Super Admin', 'SUPER_ADMIN', 'Full system control and unrestricted platform access', NULL, 'Active', '${defaultDashPerm}'::jsonb, 1),
        ('Platform Admin', 'PLATFORM_ADMIN', 'System configuration, analytics, and platform oversight', 'Super Admin', 'Active', '${defaultDashPerm}'::jsonb, 1),
        ('Zone Admin', 'ZONE_ADMIN', 'Manages local zone operations, hub staff, and rides', 'Platform Admin', 'Active', '${defaultDashPerm}'::jsonb, 2),
        ('Operations Manager', 'OPERATIONS_MANAGER', 'Manages fleet dispatch, active rides, and daily logistics', 'Zone Admin', 'Active', '${defaultDashPerm}'::jsonb, 2),
        ('Franchise Manager', 'FRANCHISE_MANAGER', 'Manages franchise partners, hubs, and revenue logs', 'Platform Admin', 'Active', '${defaultDashPerm}'::jsonb, 1),
        ('Battery Technician', 'BATTERY_TECHNICIAN', 'Battery inward, charging, and BMS health monitoring', 'Operations Manager', 'Active', '${defaultDashPerm}'::jsonb, 1),
        ('Support Executive', 'SUPPORT_EXECUTIVE', 'Rider support, complaints, and reservation assistance', 'Zone Admin', 'Active', '${defaultDashPerm}'::jsonb, 1),
        ('Fleet Manager', 'FLEET_MANAGER', 'Vehicle inventory, documents, and maintenance tracking', 'Operations Manager', 'Active', '${defaultDashPerm}'::jsonb, 1),
        ('Field Technician', 'FIELD_TECHNICIAN', 'On-field battery swapping and roadside assistance', 'Operations Manager', 'Active', '${defaultDashPerm}'::jsonb, 1),
        ('Finance Manager', 'FINANCE_MANAGER', 'Revenue accounting, payouts, and deposit refunds', 'Platform Admin', 'Active', '${defaultDashPerm}'::jsonb, 1)
      ON CONFLICT (code) DO NOTHING
    `);
  }

  // Ensure all existing roles in database have Dashboard permission auto-assigned
  await db.query(`
    UPDATE roles 
    SET permissions = jsonb_set(
      COALESCE(permissions, '{}'::jsonb), 
      '{Dashboard}', 
      '{"access": true, "create": true, "view": true, "edit": true, "delete": true, "export": true}'::jsonb
    ) 
    WHERE permissions->'Dashboard' IS NULL OR permissions->'Dashboard'->>'access' = 'false';
  `);

  // Ensure users table has franchise_id column for multi-tenant isolation
  await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS franchise_id UUID REFERENCES franchises(id) ON DELETE SET NULL`);

  // Migrate legacy plaintext passwords to bcrypt
  try {
    const { hashPassword, isBcryptHash } = require('../utils/passwords');
    const unhashedUsers = await db.query('SELECT id, password FROM users WHERE password IS NOT NULL');
    for (const u of unhashedUsers.rows) {
      if (u.password && !isBcryptHash(u.password)) {
        const hashed = await hashPassword(u.password);
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, u.id]);
      }
    }
  } catch (pwErr) {
    console.warn('Password migration warning:', pwErr.message);
  }

  // Seed default predefined users
  const existingUsersCount = await db.query('SELECT COUNT(*) FROM users');
  if (parseInt(existingUsersCount.rows[0].count) === 0) {
    const { hashPassword } = require('../utils/passwords');
    const initialHashedPassword = await hashPassword('admin123');
    await db.query(`
      INSERT INTO users (name, email, role, mobile, zone, status, password)
      VALUES 
        ('Himanshu', 'himanshu@evegah.com', 'Super Admin', '+91 81282 51172', 'Multiple Zones', 'Active', $1)
      ON CONFLICT (email) DO NOTHING
    `, [initialHashedPassword]);
  }

  // Seed default audit logs
  const existingAuditLogs = await db.query('SELECT COUNT(*) FROM audit_logs');
  if (parseInt(existingAuditLogs.rows[0].count) === 0) {
    await db.query(`
      INSERT INTO audit_logs (action, module, details, performed_by, ip_address, created_at)
      VALUES
        ('LOGIN', 'Authentication', 'User logged in to the system', 'Rohit Sharma', '103.21.244.12', NOW() - INTERVAL '2 hours'),
        ('UPDATE', 'Riders', 'Updated rider assignment for Rider ID: RD-1256', 'Rohit Sharma', '103.21.244.12', NOW() - INTERVAL '3 hours'),
        ('CREATE', 'Reports', 'Generated zone performance report', 'Rohit Sharma', '103.21.244.12', NOW() - INTERVAL '1 day'),
        ('UPDATE', 'Battery', 'Updated battery inventory (Battery ID: BT-9876)', 'Rohit Sharma', '103.21.244.12', NOW() - INTERVAL '1 day 2 hours'),
        ('CREATE', 'Support', 'Created support ticket #ST-5582', 'Rohit Sharma', '103.21.244.12', NOW() - INTERVAL '2 days'),
        ('DELETE', 'Alerts', 'Deleted alert ID: AL-3342', 'Rohit Sharma', '103.21.244.12', NOW() - INTERVAL '2 days 1 hour'),
        ('UPDATE', 'Vehicles', 'Updated vehicle details (Vehicle ID: EVM1024008)', 'Himanshu', '192.168.1.45', NOW() - INTERVAL '3 days')
    `);
  }

  await db.query(`
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(100);
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS vehicle_category VARCHAR(100);
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS km_reading VARCHAR(50);
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS service_center VARCHAR(150);
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ;
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS last_service_date TIMESTAMPTZ;
  `);

  // Seed default maintenance orders
  const existingMaint = await db.query('SELECT COUNT(*) FROM maintenance_orders');
  if (parseInt(existingMaint.rows[0].count) === 0) {
    await db.query(`
      INSERT INTO maintenance_orders (ticket_id, vehicle_code, vehicle_model, vehicle_category, km_reading, issue_category, description, assigned_technician, service_center, scheduled_date, due_date, last_service_date, priority, status, estimated_cost, zone)
      VALUES
        ('MAIN-2026-00045', 'GJ06EV1234', 'Ather 450X', 'E-Scooter', '12,450 km', 'Battery Check', 'Battery cell balancing and telemetry sync', 'Ramesh Patel', 'Alkapuri Service Center', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 hours', NOW() - INTERVAL '7 days', 'Medium', 'Scheduled', 850.00, 'Alkapuri Zone'),
        ('MAIN-2026-00046', 'GJ06EV5678', 'Hero Lectro', 'E-Bike', '8,900 km', 'General Service', 'Chain lubrication and brake adjustment', 'Suresh Yadav', 'Manjalpur Service Center', NOW() + INTERVAL '6 hours', NOW() + INTERVAL '6 hours', NOW() - INTERVAL '8 days', 'Medium', 'Scheduled', 600.00, 'Manjalpur Zone'),
        ('MAIN-2026-00047', 'GJ06EV9012', 'Ola S1 Pro', 'E-Scooter', '9,230 km', 'Tyre Replacement', 'Rear tubeless tyre replacement', 'Mahesh Singh', 'Waghodia Service Center', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day', NOW() - INTERVAL '13 days', 'High', 'Scheduled', 1200.00, 'Waghodia Zone'),
        ('MAIN-2026-00048', 'GJ06EV3456', 'EMotorad', 'E-Cycle', '7,150 km', 'Brake Check', 'Hydraulic brake fluid flush and lever tightening', 'Ramesh Patel', 'Alkapuri Service Center', NOW() + INTERVAL '1 day 4 hours', NOW() + INTERVAL '1 day 4 hours', NOW() - INTERVAL '17 days', 'High', 'Overdue', 500.00, 'Alkapuri Zone'),
        ('MAIN-2026-00049', 'GJ06EV7890', 'Ather 450X', 'E-Scooter', '10,230 km', 'Battery Check', 'State of charge diagnostic', 'Suresh Yadav', 'Manjalpur Service Center', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days', NOW() - INTERVAL '7 days', 'Low', 'Scheduled', 850.00, 'Manjalpur Zone'),
        ('MAIN-2026-00050', 'GJ06EV1122', 'Hero Lectro', 'E-Bike', '6,800 km', 'Chain Lube', 'Drive train cleaning and lubing', 'Mahesh Singh', 'Waghodia Service Center', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days', NOW() - INTERVAL '7 days', 'Low', 'Scheduled', 300.00, 'Waghodia Zone'),
        ('MAIN-2026-00051', 'GJ06EV3344', 'Ola S1 Pro', 'E-Scooter', '11,450 km', 'General Service', 'Motor controller inspection and wiring review', 'Ramesh Patel', 'Alkapuri Service Center', NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days', NOW() - INTERVAL '4 days', 'Medium', 'In Progress', 600.00, 'Alkapuri Zone'),
        ('MAIN-2026-00052', 'GJ06EV5566', 'EMotorad', 'E-Cycle', '9,120 km', 'Tyre Replacement', 'Front tyre tread check and replacement', 'Suresh Yadav', 'Manjalpur Service Center', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days', NOW() - INTERVAL '15 days', 'High', 'Completed', 1200.00, 'Manjalpur Zone')
    `);
  }

  console.log('Migrations complete!');
  process.exit(0);
};

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
