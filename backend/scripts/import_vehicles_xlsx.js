/**
 * Evegah Vehicles Importer from vehicles.xlsx
 * Imports all vehicles from vehicles.xlsx into the 'vehicles' table,
 * links active vehicles to live riders/reservations,
 * backfills missing pickup_zone on reservations and renters,
 * and clears cache for real-time fleet & reports sync.
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function excelDateToDate(serial) {
  if (!serial || serial === 'NA' || serial === 'N/A' || serial === '-') return null;
  if (typeof serial === 'number') {
    // Excel base date Dec 30, 1899
    const utcDays = serial - 25569;
    const date = new Date(Math.round(utcDays * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const str = String(serial).trim();
  if (!str || str.toLowerCase() === 'na') return null;
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return null;
}

function resolveModelImage(modelName) {
  const m = (modelName || '').toLowerCase();
  if (m.includes('mink')) return '/assets/mink.png';
  if (m.includes('city')) return '/assets/city.png';
  if (m.includes('pro')) return '/assets/Pro_Banner.png';
  if (m.includes('fly')) return '/assets/fly-1.png';
  if (m.includes('king') || m.includes('mihos')) return '/assets/v1.webp';
  return '/assets/v1.webp';
}

function normalizeModelName(raw) {
  let name = String(raw || 'Mink').trim();
  if (!name.toLowerCase().startsWith('evegah') && !name.toLowerCase().startsWith('evg')) {
    name = `Evegah ${name}`;
  }
  return name;
}

async function runImport() {
  console.log('=====================================================');
  console.log('🚀 Evegah Vehicles Fleet Importer (vehicles.xlsx)');
  console.log('=====================================================');

  // 1. Locate vehicles.xlsx
  const candidatePaths = [
    path.join(__dirname, '../../vehicles.xlsx'),
    path.join(__dirname, '../vehicles.xlsx'),
    path.join(__dirname, 'vehicles.xlsx'),
    path.resolve('vehicles.xlsx'),
    path.resolve('backend/vehicles.xlsx'),
    '/home/evegah/saas-full/vehicles.xlsx'
  ];

  let xlsxPath = null;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      xlsxPath = p;
      break;
    }
  }

  if (!xlsxPath) {
    console.error('❌ Could not find vehicles.xlsx in candidate paths:', candidatePaths);
    process.exit(1);
  }

  console.log(`📁 Found vehicles.xlsx at: ${xlsxPath}`);

  const wb = xlsx.readFile(xlsxPath);
  const sheetName = wb.SheetNames.includes('Vehicles_Template') ? 'Vehicles_Template' : wb.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
  console.log(`📄 Loaded ${rows.length} rows from sheet "${sheetName}".`);

  const client = await pool.connect();

  try {
    // 2. Fetch active riders and reservations to determine live vehicle status
    console.log('🔍 Checking active riders and ongoing reservations...');
    const activeRentersRes = await client.query(`
      SELECT rider_name, mobile, vehicle_id, zone
      FROM renters
      WHERE status IN ('Active', 'In Ride', 'Active Ride', 'Ongoing')
        AND vehicle_id IS NOT NULL AND vehicle_id != ''
    `);

    const activeResvRes = await client.query(`
      SELECT customer_name, mobile, vehicle_number, pickup_zone
      FROM reservations
      WHERE status IN ('Active', 'In Ride', 'Active Ride', 'Ongoing')
        AND vehicle_number IS NOT NULL AND vehicle_number != ''
    `);

    const activeVehicleMap = new Map();

    for (const r of activeRentersRes.rows) {
      activeVehicleMap.set(r.vehicle_id.trim().toUpperCase(), {
        riderName: r.rider_name || 'Active Rider',
        mobile: r.mobile,
        zone: r.zone || 'Gotri Zone'
      });
    }

    for (const r of activeResvRes.rows) {
      const code = r.vehicle_number.trim().toUpperCase();
      if (!activeVehicleMap.has(code)) {
        activeVehicleMap.set(code, {
          riderName: r.customer_name || 'Active Rider',
          mobile: r.mobile,
          zone: r.pickup_zone || 'Gotri Zone'
        });
      }
    }

    console.log(`ℹ️ Detected ${activeVehicleMap.size} vehicles currently in active rides.`);

    // 3. Import each vehicle from Excel
    let inserted = 0;
    let updated = 0;
    const importedCodes = new Set();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rawCode = row['Vehicle Code*'] || row['Vehicle Code *'] || row['Vehicle Code'] || row['vehicle_code'] || row.code;
      if (!rawCode) continue;

      const code = String(rawCode).trim();
      importedCodes.add(code.toUpperCase());

      const rawModel = row['Model Name *'] || row['Model Name'] || row.model_name || 'Mink';
      const modelName = normalizeModelName(rawModel);
      const category = String(row['Category'] || row.category || 'E-Vehicle').trim();
      const vehicleType = String(row['Vehicle Type'] || row.vehicle_type || 'Rental').trim();
      const chassisNo = String(row['Chassis Number'] || row.chassis_number || '').trim();
      const manufacturer = String(row['Manufacturer_1'] || row['Manufacturer'] || row.manufacturer || 'Evegah Motors').trim();
      const batteryType = String(row['Battery Type'] || row.battery_type || 'Swappable').trim();
      const motorCapacity = String(row['Motor Capacity'] || row.motor_capacity || '350 Watt').trim();
      const motorNo = String(row['Motor Number'] || row.motor_number || '').trim();
      const motorMfr = String(row['Motor Manufacturer'] || row.motor_manufacturer || 'XERO').trim();
      const ctlNo = String(row['Controller Number'] || row.controller_number || '').trim();
      const ctlMfr = String(row['Controller Manufacturer'] || row.controller_manufacturer || 'XERO').trim();
      const color = String(row['Color'] || row.color || 'Purple').trim();
      const city = String(row['Inventory City'] || row.inventory_city || 'Vadodara').trim();
      const zone = String(row['Zone'] || row.zone || 'Gotri Zone').trim();
      const franchise = String(row['Franchise Name'] || row.franchise_name || 'EVEGAH').trim();
      const depDate = excelDateToDate(row['Deployment Date']);
      const iotInstalled = String(row['IOT Installed'] || 'Yes').trim();
      const iotNumber = String(row['IOT Number'] || `IOT-${code}`).trim();
      const batteryPct = parseInt(row['Battery Pct'] ?? 100, 10) || 100;
      const voltage = parseFloat(row['Voltage (V)'] ?? 48) || 48;
      const currentAmp = parseFloat(row['Current (A)'] ?? 31) || 31;
      const kmRange = parseFloat(row['KM Range'] ?? 80) || 80;
      const purchaseDate = excelDateToDate(row['Purchase Date (YYYY-MM-DD)']);
      const warrantyMonths = parseInt(row['Warranty in Months'] ?? 12, 10) || 12;
      
      const insPolicy = String(row['Insurance Policy Number'] || '').trim();
      const validInsPolicy = insPolicy && insPolicy.toUpperCase() !== 'NA' ? insPolicy : null;
      
      const insProvider = String(row['Insurance Provider'] || '').trim();
      const validInsProvider = insProvider && insProvider.toUpperCase() !== 'NA' ? insProvider : null;
      
      const insExpiry = excelDateToDate(row['Insurance Expiry (YYYY-MM-DD)']);
      const image = resolveModelImage(modelName);

      // Determine live ride status
      const activeInfo = activeVehicleMap.get(code.toUpperCase());
      const isRideActive = !!activeInfo;
      const vehicleStatus = isRideActive ? 'In Ride' : (String(row['Vehicle Status'] || 'Available').trim());
      const renterName = isRideActive ? activeInfo.riderName : null;

      const res = await client.query(`
        INSERT INTO vehicles (
          code, evegah_model_name, vehicle_model, vehicle_category, vehicle_type,
          chassis_number, motor_number, motor_capacity, motor_manufacturer,
          controller_number, controller_manufacturer, color, inventory_city,
          zone, franchise_name, deployment_date, iot_installed, iot_number,
          battery_type, battery_pct, voltage, current_amp, km_range,
          vehicle_manufacturer, purchase_date, warranty_months,
          insurance_policy_number, insurance_provider, insurance_expiry_date,
          vehicle_image, vehicle_status, status, renter_name, created_at
        )
        VALUES (
          $1, $2, $2, $3, $4,
          $5, $6, $7, $8,
          $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22,
          $23, $24, $25,
          $26, $27, $28,
          $29, $30, $30, $31, NOW()
        )
        ON CONFLICT (code) DO UPDATE SET
          evegah_model_name = EXCLUDED.evegah_model_name,
          vehicle_model = EXCLUDED.vehicle_model,
          vehicle_category = EXCLUDED.vehicle_category,
          vehicle_type = EXCLUDED.vehicle_type,
          chassis_number = EXCLUDED.chassis_number,
          motor_number = EXCLUDED.motor_number,
          motor_capacity = EXCLUDED.motor_capacity,
          motor_manufacturer = EXCLUDED.motor_manufacturer,
          controller_number = EXCLUDED.controller_number,
          controller_manufacturer = EXCLUDED.controller_manufacturer,
          color = EXCLUDED.color,
          inventory_city = EXCLUDED.inventory_city,
          zone = EXCLUDED.zone,
          franchise_name = EXCLUDED.franchise_name,
          deployment_date = COALESCE(EXCLUDED.deployment_date, vehicles.deployment_date),
          iot_installed = EXCLUDED.iot_installed,
          iot_number = EXCLUDED.iot_number,
          battery_type = EXCLUDED.battery_type,
          battery_pct = EXCLUDED.battery_pct,
          voltage = EXCLUDED.voltage,
          current_amp = EXCLUDED.current_amp,
          km_range = EXCLUDED.km_range,
          vehicle_manufacturer = EXCLUDED.vehicle_manufacturer,
          purchase_date = COALESCE(EXCLUDED.purchase_date, vehicles.purchase_date),
          warranty_months = EXCLUDED.warranty_months,
          insurance_policy_number = COALESCE(EXCLUDED.insurance_policy_number, vehicles.insurance_policy_number),
          insurance_provider = COALESCE(EXCLUDED.insurance_provider, vehicles.insurance_provider),
          insurance_expiry_date = COALESCE(EXCLUDED.insurance_expiry_date, vehicles.insurance_expiry_date),
          vehicle_image = COALESCE(vehicles.vehicle_image, EXCLUDED.vehicle_image),
          vehicle_status = EXCLUDED.vehicle_status,
          status = EXCLUDED.status,
          renter_name = EXCLUDED.renter_name
        RETURNING (xmax = 0) AS inserted
      `, [
        code, modelName, category, vehicleType,
        chassisNo, motorNo, motorCapacity, motorMfr,
        ctlNo, ctlMfr, color, city,
        zone, franchise, depDate, iotInstalled, iotNumber,
        batteryType, batteryPct, voltage, currentAmp, kmRange,
        manufacturer, purchaseDate, warrantyMonths,
        validInsPolicy, validInsProvider, insExpiry,
        image, vehicleStatus, renterName
      ]);

      if (res.rows[0]?.inserted) {
        inserted++;
      } else {
        updated++;
      }
    }

    console.log(`✅ Vehicles imported from Excel: ${inserted} newly added, ${updated} updated.`);

    // 4. Ensure any remaining active vehicles assigned to renters exist in the table
    let additionalCreated = 0;
    for (const [code, info] of activeVehicleMap.entries()) {
      if (!importedCodes.has(code)) {
        await client.query(`
          INSERT INTO vehicles (
            code, evegah_model_name, vehicle_model, vehicle_category, vehicle_type,
            zone, vehicle_status, status, renter_name, battery_pct, km_range,
            vehicle_image, created_at
          )
          VALUES ($1, 'Evegah City', 'Evegah City', 'E-Vehicle', 'Rental', $2, 'In Ride', 'In Ride', $3, 90, 80, '/assets/city.png', NOW())
          ON CONFLICT (code) DO UPDATE SET
            vehicle_status = 'In Ride',
            status = 'In Ride',
            renter_name = EXCLUDED.renter_name
        `, [code, info.zone, info.riderName]);
        additionalCreated++;
      }
    }

    if (additionalCreated > 0) {
      console.log(`➕ Added ${additionalCreated} additional active vehicles from live rides.`);
    }

    // 5. Backfill pickup_zone on reservations
    console.log('🔄 Backfilling reservations pickup_zone from renters...');
    const backfillRes = await client.query(`
      UPDATE reservations res
      SET pickup_zone = COALESCE(r.zone, 'Gotri Zone'),
          drop_zone = COALESCE(res.drop_zone, r.zone, 'Gotri Zone')
      FROM renters r
      WHERE RIGHT(REGEXP_REPLACE(res.mobile, '[^0-9]', '', 'g'), 10) = RIGHT(REGEXP_REPLACE(r.mobile, '[^0-9]', '', 'g'), 10)
        AND (res.pickup_zone IS NULL OR res.pickup_zone = '');
    `);
    console.log(`✅ Backfilled ${backfillRes.rowCount} reservations with zone.`);

    // Fallback for any remaining reservations
    const fallbackRes = await client.query(`
      UPDATE reservations
      SET pickup_zone = 'Gotri Zone',
          drop_zone = COALESCE(drop_zone, 'Gotri Zone')
      WHERE pickup_zone IS NULL OR pickup_zone = '';
    `);
    if (fallbackRes.rowCount > 0) {
      console.log(`✅ Assigned default zone to ${fallbackRes.rowCount} remaining reservations.`);
    }

    // Backfill renters zone
    const renterZoneRes = await client.query(`
      UPDATE renters
      SET zone = 'Gotri Zone'
      WHERE zone IS NULL OR zone = '';
    `);
    if (renterZoneRes.rowCount > 0) {
      console.log(`✅ Assigned default zone to ${renterZoneRes.rowCount} renters.`);
    }

    // 6. Summary check
    const totalVehiclesRes = await client.query('SELECT count(*) FROM vehicles');
    const inRideVehiclesRes = await client.query("SELECT count(*) FROM vehicles WHERE vehicle_status = 'In Ride'");
    const availableVehiclesRes = await client.query("SELECT count(*) FROM vehicles WHERE vehicle_status = 'Available'");

    console.log('=====================================================');
    console.log('📊 IMPORT SUMMARY:');
    console.log(`- Total Fleet in Database: ${totalVehiclesRes.rows[0].count}`);
    console.log(`- Active / In Ride: ${inRideVehiclesRes.rows[0].count}`);
    console.log(`- Available in Hubs: ${availableVehiclesRes.rows[0].count}`);
    console.log('=====================================================');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runImport();
