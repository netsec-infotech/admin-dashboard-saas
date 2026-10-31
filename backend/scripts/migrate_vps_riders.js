#!/usr/bin/env node

/**
 * Migration Script: Migrate Riders, Rentals, Deposits & Transactions from Source DB (5432) to evegah.cloud Target DB (5433)
 * 
 * Usage on VPS:
 *   node scripts/migrate_vps_riders.js
 * 
 * Options:
 *   --dry-run      Preview actions without modifying the target database
 *   --source=URL   Custom source database URL (default: postgresql://evegah:Evegah%402026@127.0.0.1:5432/evegah)
 *   --target=URL   Custom target database URL (default: postgresql://evegah_admin:Secure_DB_Password_ChangeMe@127.0.0.1:5433/evegah_prod)
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const crypto = require('crypto');

// Parse CLI flags
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const getArgValue = (prefix) => {
  const arg = args.find((a) => a.startsWith(prefix));
  return arg ? arg.split('=')[1] : null;
};

// Database Connection URLs
const SOURCE_DB_URL =
  getArgValue('--source') ||
  process.env.SOURCE_DB_URL ||
  'postgresql://evegah:Evegah%402026@127.0.0.1:5432/evegah';

const TARGET_DB_URL =
  getArgValue('--target') ||
  process.env.TARGET_DB_URL ||
  process.env.DATABASE_URL ||
  'postgresql://evegah_admin:Secure_DB_Password_ChangeMe@127.0.0.1:5433/evegah_prod';

function cleanPhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return null;
}

function formatPhoneDisplay(last10) {
  if (!last10) return null;
  return `+91 ${last10}`;
}

function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

async function run() {
  console.log('=====================================================');
  console.log('🚀 Evegah Riders, Rentals & Transactions Migration Tool');
  console.log(`Source: ${SOURCE_DB_URL.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`Target: ${TARGET_DB_URL.replace(/:[^:@]+@/, ':****@')}`);
  if (isDryRun) {
    console.log('⚠️  MODE: DRY-RUN (No changes will be saved to target)');
  }
  console.log('=====================================================\n');

  const sourcePool = new Pool({ connectionString: SOURCE_DB_URL, connectionTimeoutMillis: 10000 });
  const targetPool = new Pool({ connectionString: TARGET_DB_URL, connectionTimeoutMillis: 10000 });

  const exportDir = path.join(__dirname, '..', 'exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  try {
    // 1. Connect & Test Connections
    console.log('📡 Testing connection to Source Database...');
    await sourcePool.query('SELECT 1');
    console.log('✅ Connected to Source Database (evegah:5432)');

    console.log('📡 Testing connection to Target Database (evegah.cloud)...');
    await targetPool.query('SELECT 1');
    console.log('✅ Connected to Target Database (evegah_prod:5433)\n');

    // 2. Discover Source Tables
    console.log('🔍 Discovering available tables in Source Database...');
    const sourceTablesRes = await sourcePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    const sourceTables = sourceTablesRes.rows.map((r) => r.table_name);
    console.log(`Found ${sourceTables.length} tables in source:`, sourceTables.join(', '));

    // =========================================================================
    // PART 1: RIDERS & RENTERS MIGRATION
    // =========================================================================
    console.log('\n--- [PART 1/3] MIGRATING RIDERS & RENTERS ---');
    const riderTables = ['riders', 'renters', 'users'].filter((t) => sourceTables.includes(t));

    const sourceRidersById = new Map();
    const sourceRidersByPhone = new Map();
    let allExtractedRiders = [];
    const seenMobiles = new Set();

    for (const tableName of riderTables) {
      console.log(`Reading riders from '${tableName}'...`);
      const rowsRes = await sourcePool.query(`SELECT * FROM "${tableName}"`);
      console.log(`Found ${rowsRes.rows.length} rows in '${tableName}'.`);

      for (const row of rowsRes.rows) {
        const rawPhone = row.mobile || row.phone || row.phone_number || row.mobile_number || row.contact;
        const phone10 = cleanPhone(rawPhone);
        if (!phone10) continue;

        const riderName =
          row.full_name ||
          row.rider_name ||
          row.name ||
          (row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : null) ||
          'Evegah Rider';

        const email =
          row.email && !row.email.endsWith('@example.com')
            ? row.email
            : `${phone10}@evegah.com`;

        const kycStatus = row.kyc_status || (row.is_verified || row.status === 'active' ? 'Verified' : 'Pending');

        const riderObj = {
          source_table: tableName,
          original_id: row.id || null,
          rider_name: riderName.trim(),
          mobile: formatPhoneDisplay(phone10),
          mobile_raw: phone10,
          email: email.trim().toLowerCase(),
          date_of_birth: row.dob || row.date_of_birth || null,
          address: row.permanent_address || row.address || null,
          present_address: row.temporary_address || row.present_address || null,
          gender: row.gender || null,
          status: row.status || 'Active',
          kyc_status: kycStatus,
          aadhaar_number: row.aadhaar || row.aadhaar_number || null,
          created_at: row.created_at || new Date()
        };

        if (row.id) sourceRidersById.set(String(row.id), riderObj);
        sourceRidersByPhone.set(phone10, riderObj);

        if (!seenMobiles.has(phone10)) {
          seenMobiles.add(phone10);
          allExtractedRiders.push(riderObj);
        }
      }
    }

    // Export Riders to JSON & CSV
    const ridersJsonPath = path.join(exportDir, `riders_export_${timestamp}.json`);
    const ridersCsvPath = path.join(exportDir, `riders_export_${timestamp}.csv`);
    fs.writeFileSync(ridersJsonPath, JSON.stringify(allExtractedRiders, null, 2), 'utf8');
    if (allExtractedRiders.length > 0) {
      const keys = Object.keys(allExtractedRiders[0]);
      const csv = [keys.join(','), ...allExtractedRiders.map((r) => keys.map((k) => escapeCsvField(r[k])).join(','))].join('\n');
      fs.writeFileSync(ridersCsvPath, csv, 'utf8');
    }
    console.log(`📁 Exported Riders: ${allExtractedRiders.length} records to ${ridersCsvPath}`);

    // Insert / update target renters
    const targetRentersRes = await targetPool.query('SELECT id, mobile, rider_name FROM renters');
    const existingTargetRenterMap = new Map();
    for (const r of targetRentersRes.rows) {
      const p10 = cleanPhone(r.mobile);
      if (p10) existingTargetRenterMap.set(p10, r);
    }

    let ridersInserted = 0;
    let ridersUpdated = 0;

    for (const rider of allExtractedRiders) {
      const existing = existingTargetRenterMap.get(rider.mobile_raw);
      if (existing) {
        if (!isDryRun) {
          await targetPool.query(
            `UPDATE renters SET
              rider_name = COALESCE(NULLIF(rider_name, 'Evegah Rider'), $1),
              email = COALESCE(NULLIF(email, ''), $2),
              date_of_birth = COALESCE(date_of_birth, $3),
              address = COALESCE(address, $4),
              present_address = COALESCE(present_address, $5),
              gender = COALESCE(gender, $6),
              aadhaar_number = COALESCE(aadhaar_number, $7)
            WHERE id = $8`,
            [
              rider.rider_name, rider.email, rider.date_of_birth,
              rider.address, rider.present_address, rider.gender,
              rider.aadhaar_number, existing.id
            ]
          );
        }
        ridersUpdated++;
      } else {
        if (!isDryRun) {
          const newId = crypto.randomUUID();
          await targetPool.query(
            `INSERT INTO renters (
              id, rider_name, mobile, email, date_of_birth, address, present_address,
              gender, status, kyc_status, aadhaar_number, booking_source, created_at,
              package_name, rent, deposit, total, wallet_balance, bonus_balance
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7,
              $8, $9, $10, $11, 'Migrated', $12,
              'Daily Pass', 0, 0, 0, 0, 0
            )`,
            [
              newId, rider.rider_name, rider.mobile, rider.email, rider.date_of_birth,
              rider.address, rider.present_address, rider.gender, rider.status,
              rider.kyc_status, rider.aadhaar_number, rider.created_at
            ]
          );
          existingTargetRenterMap.set(rider.mobile_raw, { id: newId, mobile: rider.mobile, rider_name: rider.rider_name });
        }
        ridersInserted++;
      }
    }
    console.log(`✅ Riders Migration: ${ridersInserted} inserted, ${ridersUpdated} updated.`);

    // =========================================================================
    // PART 2: RENTALS, DEPOSITS & RETURNS MIGRATION
    // =========================================================================
    console.log('\n--- [PART 2/3] MIGRATING RENTALS, DEPOSITS & RETURNS ---');

    let rentalsCsvPath = null;
    let txCsvPath = null;
    let allExtractedRentals = [];
    let reservationsInserted = 0;
    let walletTxInserted = 0;

    if (sourceTables.includes('rentals')) {
      // 1. Fetch returns from source
      const returnsByRentalId = new Map();
      if (sourceTables.includes('returns')) {
        const returnsRes = await sourcePool.query('SELECT * FROM returns');
        for (const ret of returnsRes.rows) {
          if (ret.rental_id) returnsByRentalId.set(String(ret.rental_id), ret);
        }
        console.log(`Loaded ${returnsByRentalId.size} return records from source.`);
      }

      // 2. Fetch rentals from source
      const rentalsRes = await sourcePool.query('SELECT * FROM rentals ORDER BY start_time ASC');
      console.log(`Found ${rentalsRes.rows.length} rentals in source database.`);

      // Target reservations check
      const targetResvRes = await targetPool.query('SELECT id, reservation_id, mobile FROM reservations');
      const existingResvIds = new Set(targetResvRes.rows.map((r) => String(r.id)));
      const existingReservationCodes = new Set(targetResvRes.rows.map((r) => String(r.reservation_id)));

      // Clean up legacy split DEP-% and RENT-% duplicates
      if (!isDryRun) {
        console.log('Cleaning up duplicate split DEP-% and RENT-% wallet transactions...');
        await targetPool.query("DELETE FROM wallet_transactions WHERE transaction_id LIKE 'DEP-%' OR transaction_id LIKE 'RENT-%'").catch(() => {});
      }

      // Target wallet transactions check
      const targetTxRes = await targetPool.query('SELECT transaction_id FROM wallet_transactions WHERE transaction_id IS NOT NULL');
      const existingTxIds = new Set(targetTxRes.rows.map((r) => String(r.transaction_id)));

      for (let i = 0; i < rentalsRes.rows.length; i++) {
        const r = rentalsRes.rows[i];
        // Resolve Rider
        const rider = sourceRidersById.get(String(r.rider_id)) || {
          rider_name: 'Evegah Rider',
          mobile: '+91 0000000000',
          mobile_raw: '0000000000'
        };

        const ret = returnsByRentalId.get(String(r.id));
        const isReturned = Boolean(ret || r.end_time);
        const rentAmount = Number(r.rental_amount || 0);
        const depAmount = Number(r.deposit_amount || 0);
        const totAmount = Number(r.total_amount || (rentAmount + depAmount));
        const vehicleNum = r.vehicle_number || r.bike_id || 'EVM1024012';
        const batteryId = r.battery_id || 'BAT-DEFAULT';
        const pkgName = r.rental_package || 'Daily Pass';
        const paymentMode = r.payment_mode || 'ICICI UPI';

        const startTime = r.start_time ? new Date(r.start_time) : new Date(r.created_at || Date.now());
        const endTime = ret?.returned_at ? new Date(ret.returned_at) : (r.end_time ? new Date(r.end_time) : null);

        let resvId = `RID-${startTime.getFullYear()}-${String(i + 1).padStart(5, '0')}-${String(r.id).slice(0, 6).toUpperCase()}`;
        let collisionCounter = 1;
        while (existingReservationCodes.has(resvId)) {
          resvId = `RID-${startTime.getFullYear()}-${String(i + 1).padStart(5, '0')}-${String(r.id).slice(0, 6).toUpperCase()}-${collisionCounter++}`;
        }
        existingReservationCodes.add(resvId);

        const rentalData = {
          rental_id: r.id,
          reservation_id: resvId,
          rider_name: rider.rider_name,
          mobile: rider.mobile,
          package_name: pkgName,
          vehicle_number: vehicleNum,
          battery_id: batteryId,
          rental_amount: rentAmount,
          deposit_amount: depAmount,
          total_amount: totAmount,
          payment_mode: paymentMode,
          start_time: startTime.toISOString(),
          end_time: endTime ? endTime.toISOString() : null,
          status: isReturned ? 'Completed' : 'Ongoing',
          deposit_status: isReturned ? 'Refunded' : (depAmount > 0 ? 'Held' : 'None'),
          refund_amount: isReturned ? depAmount : 0,
          returned_at: endTime ? endTime.toISOString() : null,
          condition_notes: ret?.condition_notes || null
        };
        allExtractedRentals.push(rentalData);

        // A. Insert into reservations table
        if (!existingResvIds.has(String(r.id))) {
          if (!isDryRun) {
            try {
              await targetPool.query(
                `INSERT INTO reservations (
                  id, reservation_id, customer_name, mobile, package_type,
                  vehicle_category, vehicle_number, battery_id, fare, deposit,
                  total_payable, payment_mode, payment_status, status,
                  deposit_status, refund_amount, pickup_datetime, drop_datetime,
                  returned_at, return_notes, booking_source, created_at,
                  reservation_date, reservation_time
                ) VALUES (
                  $1, $2, $3, $4, $5,
                  'E-Vehicle', $6, $7, $8, $9,
                  $10, $11, 'Paid', $12,
                  $13, $14, $15, $16,
                  $17, $18, 'Migrated', $19,
                  $20, $21
                ) ON CONFLICT (id) DO UPDATE SET
                  fare = EXCLUDED.fare,
                  deposit = EXCLUDED.deposit,
                  total_payable = EXCLUDED.total_payable,
                  status = EXCLUDED.status,
                  deposit_status = EXCLUDED.deposit_status,
                  returned_at = EXCLUDED.returned_at`,
                [
                  r.id, resvId, rider.rider_name, rider.mobile, pkgName,
                  vehicleNum, batteryId, rentAmount, depAmount,
                  totAmount, paymentMode, rentalData.status,
                  rentalData.deposit_status, rentalData.refund_amount,
                  rentalData.start_time, rentalData.end_time,
                  rentalData.returned_at, rentalData.condition_notes,
                  startTime,
                  startTime.toISOString().split('T')[0],
                  startTime.toTimeString().split(' ')[0]
                ]
              );
              existingResvIds.add(String(r.id));
              reservationsInserted++;
            } catch (resvErr) {
              console.warn(`[Reservations] Notice on rental ${r.id}:`, resvErr.message);
            }
          } else {
            existingResvIds.add(String(r.id));
            reservationsInserted++;
          }
        }

        // B. Note: Consolidated booking is recorded in reservations table (rent + deposit + total in 1 single transaction).
        // Avoid inserting separate DEP- and RENT- duplicates so each rental has exactly 1 unified transaction entry.
        const refTxId = `REF-${String(r.id).slice(0, 8).toUpperCase()}`;

        // 3) Security Deposit Refund Transaction (if return exists)
        if (isReturned && depAmount > 0 && !existingTxIds.has(refTxId)) {
          if (!isDryRun) {
            await targetPool.query(
              `INSERT INTO wallet_transactions (
                mobile, title, subtitle, amount, type, status, payment_method, transaction_id, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                rider.mobile_raw,
                'Security Deposit Refund',
                `Security Deposit Refunded (${vehicleNum})`,
                depAmount,
                'Debit',
                'Success',
                'Instant Refund',
                refTxId,
                endTime || startTime
              ]
            );
          }
          existingTxIds.add(refTxId);
          walletTxInserted++;
        }

        // C. Update Renter Profile with active rental status or latest rental
        if (!isDryRun && rider.mobile_raw) {
          const renterRow = existingTargetRenterMap.get(rider.mobile_raw);
          if (renterRow) {
            await targetPool.query(
              `UPDATE renters SET
                vehicle_id = COALESCE(vehicle_id, $1),
                battery_id = COALESCE(battery_id, $2),
                package_name = COALESCE(NULLIF(package_name, 'Daily Pass'), $3),
                rent = CASE WHEN rent = 0 THEN $4 ELSE rent END,
                deposit = CASE WHEN deposit = 0 THEN $5 ELSE deposit END,
                total = CASE WHEN total = 0 THEN $6 ELSE total END,
                rental_start_date = COALESCE(rental_start_date, $7),
                return_date = COALESCE(return_date, $8),
                status = CASE 
                  WHEN $9 = false THEN 'Active Ride'
                  WHEN status = 'Active' THEN 'Return'
                  ELSE status
                END
              WHERE id = $10`,
              [
                vehicleNum, batteryId, pkgName,
                rentAmount, depAmount, totAmount,
                startTime, endTime, isReturned,
                renterRow.id
              ]
            );
          }
        }
      }

      // Export Rentals to JSON & CSV
      const rentalsJsonPath = path.join(exportDir, `rentals_export_${timestamp}.json`);
      rentalsCsvPath = path.join(exportDir, `rentals_export_${timestamp}.csv`);
      fs.writeFileSync(rentalsJsonPath, JSON.stringify(allExtractedRentals, null, 2), 'utf8');
      if (allExtractedRentals.length > 0) {
        const keys = Object.keys(allExtractedRentals[0]);
        const csv = [keys.join(','), ...allExtractedRentals.map((r) => keys.map((k) => escapeCsvField(r[k])).join(','))].join('\n');
        fs.writeFileSync(rentalsCsvPath, csv, 'utf8');
      }
      console.log(`📁 Exported Rentals: ${allExtractedRentals.length} records to ${rentalsCsvPath}`);
      console.log(`✅ Rentals Migration: ${reservationsInserted} reservations inserted, ${walletTxInserted} wallet transactions created.`);
    } else {
      console.log('No rentals table in source database.');
    }

    // =========================================================================
    // PART 3: PAYMENT TRANSACTIONS & NOTIFICATIONS MIGRATION
    // =========================================================================
    console.log('\n--- [PART 3/3] MIGRATING PAYMENT GATEWAY TRANSACTIONS ---');

    let allExtractedPayments = [];
    let iciciPaymentsInserted = 0;

    const rentalsById = new Map();
    for (const r of allExtractedRentals) {
      if (r.rental_id) rentalsById.set(String(r.rental_id), r);
    }

    const paymentTables = ['payment_transactions', 'payment_notifications'].filter((t) => sourceTables.includes(t));

    for (const pTable of paymentTables) {
      console.log(`Reading payments from '${pTable}'...`);
      const pRows = await sourcePool.query(`SELECT * FROM "${pTable}"`);
      console.log(`Found ${pRows.rows.length} rows in '${pTable}'.`);

      for (const row of pRows.rows) {
        const txId = row.merchant_tran_id || row.transaction_id || row.ref_id || row.reference || (row.id ? `NOTIF-${String(row.id).slice(0, 8)}` : null);
        if (!txId) continue;

        let rider = null;
        if (row.rider_id) rider = sourceRidersById.get(String(row.rider_id));
        if (!rider && row.rental_id) {
          const rental = rentalsById.get(String(row.rental_id));
          if (rental) rider = { rider_name: rental.rider_name, mobile: rental.mobile };
        }

        const amount = Number(row.amount || 0);
        const status = (row.status || 'SUCCESS').toUpperCase();
        const rrn = row.bank_rrn || row.reference || null;
        const pType = row.transaction_type || row.payment_method || 'NEW_RIDER';
        const createdAt = row.created_at ? new Date(row.created_at) : new Date();

        allExtractedPayments.push({
          source_table: pTable,
          tx_id: txId,
          rider_name: rider?.rider_name || 'Rider',
          mobile: rider?.mobile || '',
          amount,
          status,
          upi_ref_no: rrn,
          purpose: pType,
          created_at: createdAt.toISOString()
        });

        if (!isDryRun) {
          try {
            await targetPool.query(
              `INSERT INTO icici_payments (
                tx_id, merchant_id, amount, rider_name, mobile, status, upi_ref_no, purpose, created_at
              ) VALUES ($1, '9496988', $2, $3, $4, $5, $6, $7, $8)
              ON CONFLICT (id) DO NOTHING`,
              [
                txId, amount, rider?.rider_name || 'Rider', rider?.mobile || '',
                status, rrn, pType, createdAt
              ]
            );
            iciciPaymentsInserted++;
          } catch (_) {}
        }
      }
    }

    // Export Transactions to JSON & CSV
    const txJsonPath = path.join(exportDir, `transactions_export_${timestamp}.json`);
    txCsvPath = path.join(exportDir, `transactions_export_${timestamp}.csv`);
    fs.writeFileSync(txJsonPath, JSON.stringify(allExtractedPayments, null, 2), 'utf8');
    if (allExtractedPayments.length > 0) {
      const keys = Object.keys(allExtractedPayments[0]);
      const csv = [keys.join(','), ...allExtractedPayments.map((r) => keys.map((k) => escapeCsvField(r[k])).join(','))].join('\n');
      fs.writeFileSync(txCsvPath, csv, 'utf8');
    }
    console.log(`📁 Exported Payments: ${allExtractedPayments.length} records to ${txCsvPath}`);
    console.log(`✅ Payments Migration: ${iciciPaymentsInserted} ICICI records processed.`);

    // =========================================================================
    // PART 4: MIGRATING DOCUMENTS & RIDER PHOTOS
    // =========================================================================
    console.log('\n--- [PART 4/4] MIGRATING DOCUMENTS & RIDER PHOTOS ---');

    let allExtractedDocs = [];
    let docsMigrated = 0;
    let avatarsUpdated = 0;
    let docsCsvPath = null;

    if (!isDryRun) {
      // Ensure documents table and target columns exist
      await targetPool.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          rider_id UUID,
          rental_id UUID,
          return_id UUID,
          mobile VARCHAR(20),
          kind VARCHAR(100),
          file_name VARCHAR(255),
          mime_type VARCHAR(100),
          url TEXT NOT NULL,
          meta JSONB,
          status VARCHAR(50) DEFAULT 'Verified',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE renters ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE reservations ADD COLUMN IF NOT EXISTS id_card_url TEXT;
        ALTER TABLE reservations ADD COLUMN IF NOT EXISTS inspection_media_url TEXT;
      `);
    }

    if (sourceTables.includes('documents')) {
      console.log("Reading documents from source 'documents' table...");
      const docColsRes = await sourcePool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'documents'
      `);
      const docCols = docColsRes.rows.map((r) => r.column_name);
      console.log(`Columns in source 'documents':`, docCols.join(', '));

      const docsRes = await sourcePool.query('SELECT * FROM "documents"');
      console.log(`Found ${docsRes.rows.length} rows in 'documents'.`);

      for (const row of docsRes.rows) {
        const url = row.url || row.file_path || row.path || row.link || row.s3_url || '';
        if (!url || typeof url !== 'string' || url.trim() === '') continue;

        const kind = (row.kind || row.type || row.document_type || 'document').toLowerCase();
        const docId = row.id || crypto.randomUUID();
        const riderId = row.rider_id || null;
        const rentalId = row.rental_id || null;
        const returnId = row.return_id || null;
        const fileName = row.file_name || row.filename || row.name || path.basename(url);
        const mimeType = row.mime_type || row.mimetype || 'image/jpeg';
        const createdAt = row.created_at ? new Date(row.created_at) : new Date();

        // Map to rider mobile
        let phone10 = null;
        if (riderId && sourceRidersById.has(String(riderId))) {
          phone10 = sourceRidersById.get(String(riderId)).mobile_raw;
        }
        if (!phone10 && rentalId && rentalsById.has(String(rentalId))) {
          phone10 = cleanPhone(rentalsById.get(String(rentalId)).mobile);
        }
        if (!phone10 && row.mobile) {
          phone10 = cleanPhone(row.mobile);
        }

        const docObj = {
          doc_id: docId,
          rider_id: riderId,
          rental_id: rentalId,
          mobile: formatPhoneDisplay(phone10),
          mobile_raw: phone10,
          kind,
          file_name: fileName,
          url,
          mime_type: mimeType,
          created_at: createdAt.toISOString()
        };
        allExtractedDocs.push(docObj);

        if (!isDryRun) {
          // 1. Insert into target documents table
          try {
            await targetPool.query(`
              INSERT INTO documents (
                id, rider_id, rental_id, return_id, mobile, kind, file_name, mime_type, url, meta, status, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Verified', $11)
              ON CONFLICT (id) DO UPDATE SET
                url = EXCLUDED.url,
                kind = EXCLUDED.kind,
                mobile = EXCLUDED.mobile
            `, [
              docId, riderId, rentalId, returnId, formatPhoneDisplay(phone10), kind, fileName, mimeType, url, row.meta ? JSON.stringify(row.meta) : null, createdAt
            ]);
            docsMigrated++;
          } catch (e) {
            try {
              await targetPool.query(`
                INSERT INTO documents (
                  id, rider_id, rental_id, return_id, mobile, kind, file_name, mime_type, url, meta, status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Verified', $11)
              `, [
                crypto.randomUUID(), riderId, rentalId, returnId, formatPhoneDisplay(phone10), kind, fileName, mimeType, url, row.meta ? JSON.stringify(row.meta) : null, createdAt
              ]);
              docsMigrated++;
            } catch (_) {}
          }

          // 2. If it's a rider photo / selfie / avatar, update renters.avatar_url
          const isAvatar = kind.includes('rider') || kind.includes('photo') || kind.includes('selfie') || kind.includes('avatar') || kind.includes('profile');
          if (isAvatar && phone10) {
            const upRes = await targetPool.query(`
              UPDATE renters 
              SET avatar_url = $1 
              WHERE (mobile LIKE $2 OR id::text = $3)
            `, [url, `%${phone10}`, String(riderId || '')]);
            if (upRes.rowCount > 0) avatarsUpdated += upRes.rowCount;
          }

          // 3. If it's Aadhaar / government ID, update reservations.id_card_url
          const isIdCard = kind.includes('aadhaar') || kind.includes('government') || kind.includes('id_');
          if (isIdCard && phone10) {
            await targetPool.query(`
              UPDATE reservations 
              SET id_card_url = $1 
              WHERE mobile LIKE $2 AND (id_card_url IS NULL OR id_card_url = '')
            `, [url, `%${phone10}`]);
          }
        }
      }
    }

    // Also scan source riders table's 'meta' column for photo / selfie / Aadhaar URLs
    if (sourceTables.includes('riders')) {
      console.log("Scanning source riders 'meta' column for profile photos & KYC documents...");
      try {
        const metaRidersRes = await sourcePool.query(`SELECT id, mobile, full_name, meta, created_at FROM riders WHERE meta IS NOT NULL`);
        for (const rRow of metaRidersRes.rows) {
          if (!rRow.meta) continue;
          let meta = rRow.meta;
          if (typeof meta === 'string') {
            try { meta = JSON.parse(meta); } catch (_) { meta = {}; }
          }
          if (typeof meta !== 'object') continue;

          const phone10 = cleanPhone(rRow.mobile);
          const photoUrl = meta.selfie || meta.photo || meta.avatar_url || meta.profile_photo || meta.image_url || meta.live_photo || null;
          const aadhaarFrontUrl = meta.aadhaar_front || meta.aadhaar_front_url || meta.aadhaar_card_front || null;
          const aadhaarBackUrl = meta.aadhaar_back || meta.aadhaar_back_url || meta.aadhaar_card_back || null;

          if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '') {
            allExtractedDocs.push({
              doc_id: crypto.randomUUID(),
              rider_id: rRow.id,
              mobile: formatPhoneDisplay(phone10),
              mobile_raw: phone10,
              kind: 'rider_photo',
              file_name: 'rider_selfie.jpg',
              url: photoUrl,
              mime_type: 'image/jpeg',
              created_at: rRow.created_at || new Date().toISOString()
            });

            if (!isDryRun && phone10) {
              const upRes = await targetPool.query(`
                UPDATE renters 
                SET avatar_url = $1 
                WHERE (mobile LIKE $2 OR id::text = $3)
              `, [photoUrl, `%${phone10}`, String(rRow.id || '')]);
              if (upRes.rowCount > 0) avatarsUpdated += upRes.rowCount;

              await targetPool.query(`
                INSERT INTO documents (
                  id, rider_id, mobile, kind, file_name, mime_type, url, status, created_at
                ) VALUES ($1, $2, $3, 'rider_photo', 'rider_selfie.jpg', 'image/jpeg', $4, 'Verified', $5)
              `, [crypto.randomUUID(), rRow.id, formatPhoneDisplay(phone10), photoUrl, rRow.created_at || new Date()]).catch(() => {});
              docsMigrated++;
            }
          }

          if (aadhaarFrontUrl && typeof aadhaarFrontUrl === 'string' && aadhaarFrontUrl.trim() !== '') {
            allExtractedDocs.push({
              doc_id: crypto.randomUUID(),
              rider_id: rRow.id,
              mobile: formatPhoneDisplay(phone10),
              mobile_raw: phone10,
              kind: 'aadhaar_front',
              file_name: 'aadhaar_front.jpg',
              url: aadhaarFrontUrl,
              mime_type: 'image/jpeg',
              created_at: rRow.created_at || new Date().toISOString()
            });

            if (!isDryRun && phone10) {
              await targetPool.query(`
                INSERT INTO documents (
                  id, rider_id, mobile, kind, file_name, mime_type, url, status, created_at
                ) VALUES ($1, $2, $3, 'aadhaar_front', 'aadhaar_front.jpg', 'image/jpeg', $4, 'Verified', $5)
              `, [crypto.randomUUID(), rRow.id, formatPhoneDisplay(phone10), aadhaarFrontUrl, rRow.created_at || new Date()]).catch(() => {});
              docsMigrated++;
            }
          }

          if (aadhaarBackUrl && typeof aadhaarBackUrl === 'string' && aadhaarBackUrl.trim() !== '') {
            allExtractedDocs.push({
              doc_id: crypto.randomUUID(),
              rider_id: rRow.id,
              mobile: formatPhoneDisplay(phone10),
              mobile_raw: phone10,
              kind: 'aadhaar_back',
              file_name: 'aadhaar_back.jpg',
              url: aadhaarBackUrl,
              mime_type: 'image/jpeg',
              created_at: rRow.created_at || new Date().toISOString()
            });

            if (!isDryRun && phone10) {
              await targetPool.query(`
                INSERT INTO documents (
                  id, rider_id, mobile, kind, file_name, mime_type, url, status, created_at
                ) VALUES ($1, $2, $3, 'aadhaar_back', 'aadhaar_back.jpg', 'image/jpeg', $4, 'Verified', $5)
              `, [crypto.randomUUID(), rRow.id, formatPhoneDisplay(phone10), aadhaarBackUrl, rRow.created_at || new Date()]).catch(() => {});
              docsMigrated++;
            }
          }
        }
      } catch (metaErr) {
        console.warn('Notice scanning riders meta:', metaErr.message);
      }
    }

    // Also scan source returns table for vehicle return inspection photos
    if (sourceTables.includes('returns')) {
      console.log("Scanning source 'returns' table for return inspection media...");
      try {
        const retRes = await sourcePool.query('SELECT * FROM returns');
        for (const retRow of retRes.rows) {
          const rentalId = retRow.rental_id || null;
          let phone10 = null;
          if (rentalId && rentalsById.has(String(rentalId))) {
            phone10 = cleanPhone(rentalsById.get(String(rentalId)).mobile);
          }
          if (!phone10 && retRow.rider_id && sourceRidersById.has(String(retRow.rider_id))) {
            phone10 = sourceRidersById.get(String(retRow.rider_id)).mobile_raw;
          }

          const possiblePhotos = [];
          if (retRow.photo_url) possiblePhotos.push(retRow.photo_url);
          if (retRow.image_url) possiblePhotos.push(retRow.image_url);
          if (retRow.meter_reading_photo) possiblePhotos.push(retRow.meter_reading_photo);
          if (retRow.inspection_photo) possiblePhotos.push(retRow.inspection_photo);
          if (retRow.vehicle_photo) possiblePhotos.push(retRow.vehicle_photo);

          if (retRow.meta) {
            let meta = retRow.meta;
            if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch (_) {} }
            if (typeof meta === 'object' && meta !== null) {
              if (meta.photos && Array.isArray(meta.photos)) possiblePhotos.push(...meta.photos);
              if (meta.images && Array.isArray(meta.images)) possiblePhotos.push(...meta.images);
              if (meta.photo_url) possiblePhotos.push(meta.photo_url);
              if (meta.inspection_photo) possiblePhotos.push(meta.inspection_photo);
            }
          }

          for (let pIdx = 0; pIdx < possiblePhotos.length; pIdx++) {
            const rawPhoto = possiblePhotos[pIdx];
            if (!rawPhoto || typeof rawPhoto !== 'string' || rawPhoto.trim() === '') continue;
            const photoUrl = rawPhoto.trim();

            allExtractedDocs.push({
              doc_id: crypto.randomUUID(),
              rental_id: rentalId,
              rider_id: retRow.rider_id || null,
              mobile: formatPhoneDisplay(phone10),
              mobile_raw: phone10,
              kind: 'return_inspection',
              file_name: `return_inspection_${pIdx + 1}.jpg`,
              url: photoUrl,
              mime_type: 'image/jpeg',
              created_at: retRow.returned_at || retRow.created_at || new Date().toISOString()
            });

            if (!isDryRun) {
              await targetPool.query(`
                INSERT INTO documents (
                  id, rider_id, rental_id, return_id, mobile, kind, file_name, mime_type, url, status, created_at
                ) VALUES ($1, $2, $3, $4, $5, 'return_inspection', $6, 'image/jpeg', $7, 'Verified', $8)
              `, [
                crypto.randomUUID(), retRow.rider_id || null, rentalId, retRow.id || null,
                formatPhoneDisplay(phone10), `return_inspection_${pIdx + 1}.jpg`, photoUrl, retRow.returned_at || retRow.created_at || new Date()
              ]).catch(() => {});
              docsMigrated++;

              if (rentalId) {
                await targetPool.query(`
                  UPDATE reservations 
                  SET inspection_media_url = $1 
                  WHERE id = $2 AND (inspection_media_url IS NULL OR inspection_media_url = '')
                `, [photoUrl, rentalId]).catch(() => {});
              }
            }
          }
        }
      } catch (retErr) {
        console.warn('Notice scanning returns table for media:', retErr.message);
      }
    }

    // Export Documents to JSON & CSV
    const docsJsonPath = path.join(exportDir, `documents_export_${timestamp}.json`);
    docsCsvPath = path.join(exportDir, `documents_export_${timestamp}.csv`);
    fs.writeFileSync(docsJsonPath, JSON.stringify(allExtractedDocs, null, 2), 'utf8');
    if (allExtractedDocs.length > 0) {
      const keys = Object.keys(allExtractedDocs[0]);
      const csv = [keys.join(','), ...allExtractedDocs.map((r) => keys.map((k) => escapeCsvField(r[k])).join(','))].join('\n');
      fs.writeFileSync(docsCsvPath, csv, 'utf8');
    }
    console.log(`📁 Exported Documents: ${allExtractedDocs.length} records to ${docsCsvPath}`);
    console.log(`✅ Documents Migration: ${docsMigrated} documents migrated, ${avatarsUpdated} rider avatars updated.`);

    // =========================================================================
    // FINAL SUMMARY
    // =========================================================================
    const [finalRenters, finalResv, finalTx, finalDocs, finalAvatars] = await Promise.all([
      targetPool.query('SELECT count(*) FROM renters'),
      targetPool.query('SELECT count(*) FROM reservations'),
      targetPool.query('SELECT count(*) FROM wallet_transactions'),
      targetPool.query('SELECT count(*) FROM documents').catch(() => ({ rows: [{ count: 0 }] })),
      targetPool.query("SELECT count(*) FROM renters WHERE avatar_url IS NOT NULL AND avatar_url != ''").catch(() => ({ rows: [{ count: 0 }] }))
    ]);

    console.log('\n=====================================================');
    console.log('🎉 COMPLETE MIGRATION & EXPORT SUMMARY:');
    console.log(`- Total Renters in evegah.cloud: ${finalRenters.rows[0].count}`);
    console.log(`- Total Renters with Live Photos/Avatars: ${finalAvatars.rows[0].count}`);
    console.log(`- Total Documents Migrated: ${finalDocs.rows[0].count}`);
    console.log(`- Total Reservations in evegah.cloud: ${finalResv.rows[0].count}`);
    console.log(`- Total Wallet/Deposit Transactions: ${finalTx.rows[0].count}`);
    console.log(`- Export Directory: ${exportDir}`);
    if (ridersCsvPath) console.log(`  * ${ridersCsvPath}`);
    if (rentalsCsvPath) console.log(`  * ${rentalsCsvPath}`);
    if (txCsvPath) console.log(`  * ${txCsvPath}`);
    if (docsCsvPath) console.log(`  * ${docsCsvPath}`);
    console.log('=====================================================\n');
  } catch (err) {
    console.error('❌ Migration Error:', err);
  } finally {
    await sourcePool.end().catch(() => {});
    await targetPool.end().catch(() => {});
  }
}

run();
