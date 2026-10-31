// backend/src/utils/passwords.js
// Safe Password Hashing, Verification, and Reversible Transparent Migration

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Check if a password string is already a valid bcrypt hash
 */
function isBcryptHash(str) {
  if (typeof str !== 'string') return false;
  return /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(str);
}

/**
 * Hash a plaintext password with bcrypt (minimum 10 rounds, default 12)
 */
async function hashPassword(plaintext) {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Compare password against stored hash with auto-migration support.
 * If stored password is still legacy plaintext, compares directly and flags for upgrade.
 * @param {string} candidate Plaintext password entered by user
 * @param {string} stored Stored hash or legacy plaintext from DB
 * @returns {Promise<{ isValid: boolean, needsRehash: boolean }>}
 */
async function verifyPassword(candidate, stored) {
  if (!candidate || !stored) {
    return { isValid: false, needsRehash: false };
  }

  // Case 1: Stored password is a proper bcrypt hash
  if (isBcryptHash(stored)) {
    const isValid = await bcrypt.compare(candidate, stored);
    return { isValid, needsRehash: false };
  }

  // Case 2: Legacy plaintext password in database
  // Compare safely
  const isValid = candidate === stored;
  return { isValid, needsRehash: isValid };
}

module.exports = {
  isBcryptHash,
  hashPassword,
  verifyPassword,
  SALT_ROUNDS,
};
