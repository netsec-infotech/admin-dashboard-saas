// backend/src/utils/kycStore.js
// Shared in-memory store for Rider KYC data, folder-wise documents, and active eKYC OTP sessions

const RIDER_KYC_STORE = {};
const RIDER_DOCUMENTS_STORE = {};
const AADHAAR_OTP_SESSIONS = {};

module.exports = {
  RIDER_KYC_STORE,
  RIDER_DOCUMENTS_STORE,
  AADHAAR_OTP_SESSIONS
};
