// backend/src/utils/envValidator.js
// Validates presence of critical environment variables and provides fail-closed guards

function validateEnvironment() {
  const warnings = [];
  const errors = [];

  // Critical security settings
  if (!process.env.JWT_SECRET) {
    warnings.push('JWT_SECRET is unset; falling back to default development secret. DO NOT USE IN PRODUCTION.');
  }

  // Database settings
  if (!process.env.DATABASE_URL && (!process.env.DB_HOST && !process.env.PGHOST)) {
    warnings.push('DATABASE_URL or PGHOST is unset; using local postgres fallback.');
  }

  // Payment gateways
  if (!process.env.PAYU_MERCHANT_KEY || !process.env.PAYU_MERCHANT_SALT) {
    warnings.push('PAYU_MERCHANT_KEY or PAYU_MERCHANT_SALT is not configured. PayU checkout will require credentials in DB settings or fail-closed.');
  }

  if (!process.env.ICICI_MID || !process.env.ICICI_API_KEY) {
    warnings.push('ICICI_MID or ICICI_API_KEY is not configured. ICICI Bank UPI integration is running in offline/read-only mode.');
  }

  // Sandbox Aadhaar eKYC
  const sandboxKey = process.env.SANDBOX_API_KEY || process.env.Sanbox_API_Key || process.env.SANDBOX_KEY;
  const sandboxSecret = process.env.SANDBOX_API_SECRET || process.env.Sandbox_API_Secret || process.env.SANDBOX_SECRET;
  if (!sandboxKey || !sandboxSecret) {
    warnings.push('SANDBOX_API_KEY or SANDBOX_API_SECRET is not configured. Aadhaar eKYC is disabled or offline.');
  }

  if (errors.length > 0) {
    console.error('❌ Critical Environment Validation Failure:');
    errors.forEach(e => console.error(`   - ${e}`));
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment Notice:');
    warnings.forEach(w => console.warn(`   - ${w}`));
  }

  return { isValid: errors.length === 0, errors, warnings };
}

module.exports = { validateEnvironment };
