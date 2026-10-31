// backend/src/routes/kyc.js
// Aadhaar eKYC API Routes powered by Sandbox.co.in OKYC

const express = require('express');
const router = express.Router();
const db = require('../db');
const { delByPattern } = require('../redis');
const { 
  requestAadhaarOtp, 
  verifyAadhaarOtp, 
  testSandboxConnection,
  getSandboxConfig 
} = require('../utils/sandboxKyc');
const { 
  RIDER_KYC_STORE, 
  RIDER_DOCUMENTS_STORE, 
  AADHAAR_OTP_SESSIONS 
} = require('../utils/kycStore');

/**
 * Clean 10-digit mobile number helper
 */
function extractLast10Mobile(mobile) {
  if (!mobile) return '';
  const clean = String(mobile).replace(/\D/g, '');
  return clean.length >= 10 ? clean.slice(-10) : '';
}

/**
 * 1. Health / Diagnostics Endpoint
 * GET /api/kyc/health
 */
router.get('/health', async (req, res) => {
  try {
    const healthResult = await testSandboxConnection();
    res.json({
      status: healthResult.connected ? 'success' : 'warning',
      ...healthResult
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

/**
 * 2. Generate Aadhaar OKYC OTP
 * POST /api/kyc/aadhaar/otp
 * POST /api/kyc/aadhaar/generate-otp
 * POST /api/kyc/otp
 */
const handleGenerateOtp = async (req, res) => {
  try {
    const { aadhaar_number, mobile, consent, reason } = req.body;

    if (!aadhaar_number) {
      return res.status(400).json({
        status: 'error',
        message: 'Aadhaar number (12 digits) is required'
      });
    }

    const cleanAadhaar = String(aadhaar_number).replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Aadhaar number. Must contain exactly 12 numeric digits.'
      });
    }

    // Call Sandbox OKYC Generate OTP
    const otpResult = await requestAadhaarOtp({
      aadhaar_number: cleanAadhaar,
      consent: consent || 'y',
      reason: reason || 'For KYC'
    });

    const refId = String(otpResult.reference_id);
    const last10 = extractLast10Mobile(mobile || req.headers['x-user-mobile']);

    // Cache session in memory
    AADHAAR_OTP_SESSIONS[refId] = {
      reference_id: refId,
      mobile: last10,
      masked_aadhaar: `XXXX XXXX ${cleanAadhaar.slice(-4)}`,
      created_at: new Date()
    };

    return res.json({
      status: 'success',
      message: otpResult.message || 'OTP sent successfully to mobile linked with Aadhaar',
      data: {
        reference_id: refId,
        masked_aadhaar: `XXXX XXXX ${cleanAadhaar.slice(-4)}`,
        transaction_id: otpResult.transaction_id,
        message: otpResult.message
      }
    });
  } catch (err) {
    console.error('Sandbox Aadhaar Generate OTP Error:', err);
    const statusCode = err.status && err.status >= 400 && err.status < 600 ? err.status : 400;
    return res.status(statusCode).json({
      status: 'error',
      message: err.message || 'Failed to send Aadhaar OTP',
      details: err.details || null
    });
  }
};

router.post('/aadhaar/otp', handleGenerateOtp);
router.post('/aadhaar/generate-otp', handleGenerateOtp);
router.post('/otp', handleGenerateOtp);

/**
 * 3. Verify Aadhaar OKYC OTP
 * POST /api/kyc/aadhaar/verify
 * POST /api/kyc/aadhaar/verify-otp
 * POST /api/kyc/verify
 */
const VERIFY_IN_FLIGHT = new Set();

const handleVerifyOtp = async (req, res) => {
  const { reference_id, otp, mobile, rider_id, live_photo } = req.body;

  if (!reference_id) {
    return res.status(400).json({
      status: 'error',
      message: 'reference_id from OTP step is required'
    });
  }

  const cleanOtp = String(otp || '').replace(/\D/g, '');
  if (cleanOtp.length !== 6) {
    return res.status(400).json({
      status: 'error',
      message: 'OTP must be a 6-digit numeric code'
    });
  }

  const refKey = String(reference_id);
  if (VERIFY_IN_FLIGHT.has(refKey)) {
    return res.status(429).json({
      status: 'error',
      message: 'Verification is already in progress for this request. Please wait a moment.'
    });
  }

  VERIFY_IN_FLIGHT.add(refKey);

  try {
    // Call Sandbox OKYC Verify OTP
    const verifyResult = await verifyAadhaarOtp({
      reference_id: refKey,
      otp: cleanOtp
    });

    const session = AADHAAR_OTP_SESSIONS[String(reference_id)] || {};
    const effectiveMobile = mobile || session.mobile || req.headers['x-user-mobile'] || '';
    const last10 = extractLast10Mobile(effectiveMobile);
    const maskedAadhaar = session.masked_aadhaar || (last10 ? `XXXX XXXX ${last10.slice(-4)}` : 'XXXX XXXX 4492');

    // 1. Sync in-memory KYC store
    if (last10) {
      RIDER_KYC_STORE[last10] = {
        mobile: last10,
        rider_name: verifyResult.name || 'Rider',
        kyc_status: 'Verified',
        is_verified: true,
        ocr_details: {
          name: verifyResult.name,
          dob: verifyResult.date_of_birth,
          gender: verifyResult.gender,
          address: verifyResult.address,
          aadhaar_number: maskedAadhaar,
          care_of: verifyResult.care_of,
          split_address: verifyResult.split_address
        },
        live_photo: live_photo || verifyResult.photo_link || null,
        aadhaar_photo: verifyResult.photo_link || null,
        verified_via: 'Sandbox Aadhaar OKYC',
        updated_at: new Date()
      };
    }

    // 2. Persist in Postgres DB (renters, users, reservations)
    try {
      await delByPattern('renters:*');

      if (last10 || rider_id) {
        await db.query(`
          UPDATE renters 
          SET rider_name = COALESCE(NULLIF($1, ''), rider_name),
              kyc_status = 'Verified',
              date_of_birth = COALESCE(NULLIF($2, ''), date_of_birth),
              gender = COALESCE(NULLIF($3, ''), gender),
              address = COALESCE(NULLIF($4, ''), address),
              aadhaar_number = COALESCE(NULLIF($5, ''), aadhaar_number),
              avatar_url = COALESCE(NULLIF($6, ''), avatar_url)
          WHERE (mobile LIKE $7 OR id::text = $8)
        `, [
          verifyResult.name || '',
          verifyResult.date_of_birth || '',
          verifyResult.gender || '',
          verifyResult.address || '',
          maskedAadhaar,
          verifyResult.photo_link || live_photo || '',
          `%${last10}`,
          rider_id || ''
        ]);

        if (verifyResult.name && verifyResult.name.trim().length > 0) {
          await db.query(`
            UPDATE reservations
            SET customer_name = $1
            WHERE mobile LIKE $2
          `, [verifyResult.name.trim(), `%${last10}`]).catch(() => {});

          await db.query(`
            UPDATE users
            SET name = $1
            WHERE mobile LIKE $2
          `, [verifyResult.name.trim(), `%${last10}`]).catch(() => {});
        }
      }
    } catch (dbErr) {
      console.warn('DB update on Aadhaar KYC verify notice:', dbErr.message);
    }

    // Clean up temporary OTP session
    delete AADHAAR_OTP_SESSIONS[String(reference_id)];

    return res.json({
      status: 'success',
      message: 'Aadhaar eKYC verified successfully',
      data: {
        reference_id: verifyResult.reference_id,
        is_verified: true,
        kyc_status: 'Verified',
        name: verifyResult.name,
        date_of_birth: verifyResult.date_of_birth,
        gender: verifyResult.gender,
        care_of: verifyResult.care_of,
        address: verifyResult.address,
        split_address: verifyResult.split_address,
        photo: verifyResult.photo || verifyResult.photo_link,
        photo_link: verifyResult.photo_link || verifyResult.photo,
        masked_aadhaar: maskedAadhaar,
        mobile: last10 || undefined,
        transaction_id: verifyResult.transaction_id
      }
    });
  } catch (err) {
    console.error('Sandbox Aadhaar Verify OTP Error:', err);
    const statusCode = err.status && err.status >= 400 && err.status < 600 ? err.status : 400;
    return res.status(statusCode).json({
      status: 'error',
      message: err.message || 'Failed to verify Aadhaar OTP',
      details: err.details || null
    });
  } finally {
    VERIFY_IN_FLIGHT.delete(refKey);
  }
};

router.post('/aadhaar/verify', handleVerifyOtp);
router.post('/aadhaar/verify-otp', handleVerifyOtp);
router.post('/verify', handleVerifyOtp);

/**
 * 4. Get KYC Status by Mobile or Rider ID
 * GET /api/kyc/status
 */
router.get('/status', async (req, res) => {
  try {
    const rawMobile = req.query.mobile || req.headers['x-user-mobile'];
    const riderId = req.query.rider_id || req.query.id;
    const last10 = extractLast10Mobile(rawMobile);

    if (!last10 && !riderId) {
      return res.status(400).json({
        status: 'error',
        message: 'Provide mobile number or rider_id to query KYC status'
      });
    }

    // Check memory store
    const memKyc = last10 ? RIDER_KYC_STORE[last10] : null;

    // Check database
    let dbRenter = null;
    try {
      const q = await db.query(`
        SELECT id, rider_name, mobile, kyc_status, date_of_birth, gender, address, aadhaar_number, avatar_url, created_at
        FROM renters
        WHERE (mobile LIKE $1 OR id::text = $2)
        ORDER BY created_at DESC
        LIMIT 1
      `, [`%${last10}`, riderId || '']);
      dbRenter = q.rows[0] || null;
    } catch (dbErr) {
      console.warn('DB query in /api/kyc/status notice:', dbErr.message);
    }

    const currentStatus = dbRenter?.kyc_status || memKyc?.kyc_status || 'Pending';
    const isVerified = ['verified', 'approved'].includes((currentStatus || '').toLowerCase());

    return res.json({
      status: 'success',
      data: {
        mobile: last10,
        rider_id: dbRenter?.id || riderId || null,
        kyc_status: currentStatus,
        is_verified: isVerified,
        rider_name: dbRenter?.rider_name || memKyc?.rider_name || null,
        date_of_birth: dbRenter?.date_of_birth || memKyc?.ocr_details?.dob || null,
        gender: dbRenter?.gender || memKyc?.ocr_details?.gender || null,
        address: dbRenter?.address || memKyc?.ocr_details?.address || null,
        aadhaar_number: dbRenter?.aadhaar_number || memKyc?.ocr_details?.aadhaar_number || null,
        photo_url: dbRenter?.avatar_url || memKyc?.live_photo || null
      }
    });
  } catch (err) {
    console.error('Get KYC Status Error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
