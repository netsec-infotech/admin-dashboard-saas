// backend/src/utils/sandboxKyc.js
// Sandbox.co.in Aadhaar OKYC Integration Service

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Resolves Sandbox configuration from environment
 */
function getSandboxConfig() {
  const apiKey = (
    process.env.SANDBOX_API_KEY ||
    process.env.Sanbox_API_Key ||
    process.env.SANDBOX_KEY ||
    ''
  ).trim();

  const apiSecret = (
    process.env.SANDBOX_API_SECRET ||
    process.env.Sandbox_API_Secret ||
    process.env.SANDBOX_SECRET ||
    ''
  ).trim();

  let baseUrl = (process.env.SANDBOX_BASE_URL || '').trim();
  if (!baseUrl) {
    // If the key starts with 'key_live_', Sandbox requires the live URL
    if (apiKey.startsWith('key_live_') || process.env.SANDBOX_ENV === 'production') {
      baseUrl = 'https://api.sandbox.co.in';
    } else {
      baseUrl = 'https://test-api.sandbox.co.in';
    }
  }

  // Strip trailing slashes
  baseUrl = baseUrl.replace(/\/+$/, '');

  return { apiKey, apiSecret, baseUrl };
}

/**
 * Retrieves a valid Sandbox JWT access token, renewing when needed
 */
async function getSandboxToken(forceRefresh = false) {
  const { apiKey, apiSecret, baseUrl } = getSandboxConfig();

  if (!apiKey || !apiSecret) {
    throw new Error('Sandbox API Key or API Secret is not configured in backend environment variables.');
  }

  const now = Date.now();
  if (!forceRefresh && cachedToken && tokenExpiresAt > now) {
    return cachedToken;
  }

  const authUrl = `${baseUrl}/authenticate`;
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'x-api-key': apiKey,
      'x-api-secret': apiSecret,
      'x-api-version': '1.0'
    }
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok || (resJson.code && resJson.code !== 200)) {
    const errMsg = resJson.message || resJson.error || `Failed to authenticate with Sandbox (HTTP ${response.status})`;
    throw new Error(errMsg);
  }

  const token = resJson.access_token || resJson.data?.access_token;
  if (!token) {
    throw new Error('Sandbox did not return an access token');
  }

  // Token valid for 24h, cache for 20 hours to be safe
  cachedToken = token;
  tokenExpiresAt = now + 20 * 60 * 60 * 1000;

  return cachedToken;
}

/**
 * Execute an authorized request to Sandbox with automatic retry on token expiry
 */
async function sandboxFetch(path, options = {}) {
  const { apiKey, baseUrl } = getSandboxConfig();
  let token = await getSandboxToken();

  const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

  const makeCall = async (authToken) => {
    const headers = {
      'Authorization': authToken,
      'x-api-key': apiKey,
      'x-api-version': '1.0.0',
      'Content-Type': 'application/json',
      'accept': 'application/json',
      ...(options.headers || {})
    };

    return fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body
    });
  };

  let res = await makeCall(token);

  // If token expired / unauthorized, attempt refreshing token once
  if (res.status === 401) {
    cachedToken = null;
    token = await getSandboxToken(true);
    res = await makeCall(token);
  }

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

/**
 * Step 1: Request Aadhaar OKYC OTP
 * @param {Object} params
 * @param {string} params.aadhaar_number - 12-digit Aadhaar number
 * @param {string} [params.consent='y']
 * @param {string} [params.reason='For KYC']
 */
async function requestAadhaarOtp({ aadhaar_number, consent = 'y', reason = 'For KYC' }) {
  if (!aadhaar_number) {
    throw new Error('Aadhaar number is required');
  }

  const cleanAadhaar = String(aadhaar_number).replace(/\D/g, '');
  if (cleanAadhaar.length !== 12) {
    throw new Error('Aadhaar number must be exactly 12 digits');
  }

  const payload = {
    '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
    aadhaar_number: cleanAadhaar,
    consent: (consent || 'y').toLowerCase(),
    reason: reason || 'For KYC'
  };

  const { status, ok, data } = await sandboxFetch('/kyc/aadhaar/okyc/otp', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!ok || (data.code && data.code >= 400)) {
    const rawMsg = data.message || `Aadhaar OTP request failed (Status ${status})`;
    let msg = rawMsg;
    if (/source unavailable/i.test(rawMsg)) {
      msg = 'UIDAI servers are temporarily busy. Please wait a few seconds and try again.';
    }
    const error = new Error(msg);
    error.status = status;
    error.details = data;
    throw error;
  }

  const reference_id = data.data?.reference_id || data.reference_id;
  const message = data.data?.message || data.message || 'OTP sent successfully to mobile linked with Aadhaar';

  return {
    reference_id: String(reference_id),
    message,
    transaction_id: data.transaction_id,
    timestamp: data.timestamp,
    raw: data
  };
}

/**
 * Step 2: Verify Aadhaar OKYC OTP with auto-retry on transient UIDAI "Source Unavailable"
 * @param {Object} params
 * @param {string|number} params.reference_id - Reference ID from OTP step
 * @param {string} params.otp - 6-digit OTP
 */
async function verifyAadhaarOtp({ reference_id, otp }) {
  if (!reference_id) {
    throw new Error('reference_id from OTP step is required');
  }

  const cleanOtp = String(otp || '').replace(/\D/g, '');
  if (cleanOtp.length !== 6) {
    throw new Error('OTP must be a 6-digit numeric code');
  }

  const payload = {
    '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
    reference_id: String(reference_id),
    otp: cleanOtp
  };

  // Send exactly one verify call to Sandbox / UIDAI.
  // Aadhaar OTPs are single-use; retrying the same OTP after a transient failure
  // causes UIDAI to invalidate the OTP and return "OTP expired".
  console.log(`[Sandbox KYC] Verifying Aadhaar OTP for reference_id: ${reference_id}`);
  const callRes = await sandboxFetch('/kyc/aadhaar/okyc/otp/verify', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const responseData = callRes.data || {};
  const responseStatus = callRes.status;
  const responseOk = callRes.ok;

  console.log(`[Sandbox KYC] Verify Response status: ${responseStatus}, body:`, JSON.stringify(responseData));

  const data = responseData;
  const innerData = data.data || {};
  const failureMsg = innerData.message || data.message || '';

  // Check if error status or failure message
  if (!responseOk || (data.code && data.code >= 400) || (innerData.status && innerData.status !== 'VALID' && !innerData.name)) {
    let friendlyMsg = failureMsg || `OTP verification failed (Status ${responseStatus})`;

    if (/source unavailable/i.test(failureMsg)) {
      friendlyMsg = 'UIDAI servers are temporarily busy. Please tap "Request Fresh OTP" to generate a new code and try again.';
    } else if (/otp expired/i.test(failureMsg)) {
      friendlyMsg = 'This OTP has expired or was already used. Please tap "Request Fresh OTP" to receive a fresh code.';
    } else if (/invalid reference_id/i.test(failureMsg)) {
      friendlyMsg = 'Verification session expired. Please tap "Request Fresh OTP" to restart.';
    } else if (/incorrect otp|invalid otp/i.test(failureMsg)) {
      friendlyMsg = 'Incorrect OTP entered. Please check your SMS and re-enter the 6-digit code.';
    }

    const error = new Error(friendlyMsg);
    error.status = responseStatus >= 400 ? responseStatus : 400;
    error.rawMessage = failureMsg;
    error.details = data;
    throw error;
  }

  // Check if inner data contains failure text
  if (innerData.message && innerData.status !== 'VALID' && !innerData.name) {
    let friendlyMsg = innerData.message;
    if (/source unavailable/i.test(innerData.message)) {
      friendlyMsg = 'UIDAI servers are temporarily busy. Please tap "Request Fresh OTP" to try again.';
    } else if (/otp expired/i.test(innerData.message)) {
      friendlyMsg = 'This OTP has expired. Please tap "Request Fresh OTP" for a fresh code.';
    } else if (/invalid reference_id/i.test(innerData.message)) {
      friendlyMsg = 'Verification session expired. Please tap "Request Fresh OTP".';
    } else if (/incorrect otp|invalid otp/i.test(innerData.message)) {
      friendlyMsg = 'Incorrect OTP entered. Please check your SMS and re-enter the 6-digit code.';
    }

    const error = new Error(friendlyMsg);
    error.status = 400;
    error.rawMessage = innerData.message;
    error.details = data;
    throw error;
  }

  // Format full address from split address or address object
  let fullAddress = innerData.full_address || '';
  if (!fullAddress && typeof innerData.address === 'string') {
    fullAddress = innerData.address;
  } else if (!fullAddress && typeof innerData.address === 'object' && innerData.address) {
    const a = innerData.address;
    fullAddress = [a.house, a.street, a.landmark, a.vtc || a.post_office, a.subdistrict, a.district, a.state, a.pincode, a.country].filter(Boolean).join(', ');
  } else if (!fullAddress && innerData.split_address) {
    const sp = innerData.split_address;
    fullAddress = [sp.house, sp.street, sp.landmark, sp.locality, sp.sub_district, sp.district, sp.state, sp.pincode, sp.country].filter(Boolean).join(', ');
  }

  const userPhoto = innerData.photo || innerData.photo_link || null;

  return {
    reference_id: String(innerData.reference_id || reference_id),
    status: innerData.status || 'VALID',
    is_verified: true,
    name: innerData.name || '',
    gender: innerData.gender === 'M' ? 'Male' : innerData.gender === 'F' ? 'Female' : (innerData.gender || ''),
    date_of_birth: innerData.date_of_birth || innerData.dob || '',
    year_of_birth: innerData.year_of_birth || '',
    care_of: innerData.care_of || '',
    address: fullAddress,
    split_address: innerData.address || innerData.split_address || null,
    photo: userPhoto,
    photo_link: userPhoto,
    message: innerData.message || 'Aadhaar eKYC verified successfully',
    transaction_id: data.transaction_id,
    timestamp: data.timestamp,
    raw: data
  };
}

/**
 * Diagnostic/Health check for Sandbox credentials
 */
async function testSandboxConnection() {
  const config = getSandboxConfig();
  if (!config.apiKey || !config.apiSecret) {
    return {
      connected: false,
      error: 'Sandbox API Key or Secret missing in .env',
      config: {
        baseUrl: config.baseUrl,
        hasKey: Boolean(config.apiKey),
        hasSecret: Boolean(config.apiSecret)
      }
    };
  }

  try {
    const token = await getSandboxToken(true);
    return {
      connected: true,
      baseUrl: config.baseUrl,
      tokenGenerated: Boolean(token),
      tokenPrefix: token ? token.substring(0, 15) + '...' : null,
      environment: config.baseUrl.includes('test-api') ? 'Sandbox Test' : 'Production Live'
    };
  } catch (err) {
    return {
      connected: false,
      baseUrl: config.baseUrl,
      error: err.message
    };
  }
}

module.exports = {
  getSandboxConfig,
  getSandboxToken,
  requestAadhaarOtp,
  verifyAadhaarOtp,
  testSandboxConnection
};
