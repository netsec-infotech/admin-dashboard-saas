// backend/scripts/test_batch5_security.js
// Batch 5 Production Security & Payment Integrity Test Suite

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest({ method = 'GET', path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json || data,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (details) console.error(`     Details: ${details}`);
  }
}

async function runSecurityTestSuite() {
  console.log('\n🔒 Starting Batch 5 Security & Payment Integrity Test Suite...\n');

  // ==========================================
  // SECTION 1: JWT AUTHENTICATION
  // ==========================================
  console.log('--- Test Section 1: JWT Authentication & Header Spoofing ---');

  // 1.1 Protected route rejects missing token
  const resNoAuth = await makeRequest({ method: 'GET', path: '/api/attendance/logs' });
  assert(resNoAuth.statusCode === 401, 'Protected route rejects unauthenticated request with 401', `Got status ${resNoAuth.statusCode}`);

  // 1.2 Protected route rejects invalid/forged Bearer token
  const resBadToken = await makeRequest({
    method: 'GET',
    path: '/api/attendance/logs',
    headers: { Authorization: 'Bearer forged.invalid.token' },
  });
  assert(resBadToken.statusCode === 401, 'Protected route rejects forged token with 401', `Got status ${resBadToken.statusCode}`);

  // 1.3 Spoofed client-supplied headers without valid token are rejected
  const resSpoofed = await makeRequest({
    method: 'GET',
    path: '/api/attendance/logs',
    headers: { 'x-user-id': '1', 'x-user-role': 'Super Admin' },
  });
  assert(resSpoofed.statusCode === 401, 'Protected route rejects spoofed x-user-id / x-user-role without JWT', `Got status ${resSpoofed.statusCode}`);

  // ==========================================
  // SECTION 2: PASSWORD SECURITY & AUTHENTICATION
  // ==========================================
  console.log('\n--- Test Section 2: Password Security & Login Token Generation ---');

  // 2.1 Login with correct password generates valid JWT
  const resLogin = await makeRequest({
    method: 'POST',
    path: '/api/users/login',
    body: { email: 'himanshu@evegah.com', password: 'G7r!pLk9@#X2s' },
  });
  const token = resLogin.body?.token;
  assert(resLogin.statusCode === 200 && Boolean(token), 'Login succeeds with valid credentials and issues JWT token', `Status: ${resLogin.statusCode}`);

  // 2.2 Login with wrong password is rejected
  const resBadPw = await makeRequest({
    method: 'POST',
    path: '/api/users/login',
    body: { email: 'himanshu@evegah.com', password: 'wrong_password_999' },
  });
  assert(resBadPw.statusCode === 401, 'Login rejects incorrect password with 401', `Status: ${resBadPw.statusCode}`);

  // 2.3 Access protected route with issued JWT
  const resWithJwt = await makeRequest({
    method: 'GET',
    path: '/api/attendance/logs',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(resWithJwt.statusCode === 200, 'Protected route permits authenticated request with issued JWT', `Status: ${resWithJwt.statusCode}`);

  // ==========================================
  // SECTION 3: ROLE-BASED ACCESS CONTROL (RBAC)
  // ==========================================
  console.log('\n--- Test Section 3: Role-Based Access Control (RBAC) ---');

  // Create an employee JWT token (non-admin)
  const { signToken } = require('../src/middleware/auth');
  const employeeToken = signToken({
    id: 9999,
    email: 'test_emp@evegah.com',
    role: 'Employee',
    evegahRole: 'employee',
    franchise_id: 'FR-GOTRI-01',
  });

  // 3.1 Employee cannot create a new franchise
  const resEmpCreateFranchise = await makeRequest({
    method: 'POST',
    path: '/api/franchises',
    headers: { Authorization: `Bearer ${employeeToken}` },
    body: { name: 'Unauthorized Hub', owner_name: 'Test', mobile: '9999999999', hub_address: 'Baroda' },
  });
  assert(resEmpCreateFranchise.statusCode === 403, 'Employee token rejected with 403 on franchise creation', `Status: ${resEmpCreateFranchise.statusCode}`);

  // 3.2 Employee cannot inward IoT batches
  const resEmpIotInward = await makeRequest({
    method: 'POST',
    path: '/api/iot/inward',
    headers: { Authorization: `Bearer ${employeeToken}` },
    body: { supplier: 'Test', invoice_no: 'INV-1' },
  });
  assert(resEmpIotInward.statusCode === 403, 'Employee token rejected with 403 on IoT inward', `Status: ${resEmpIotInward.statusCode}`);

  // 3.3 Employee cannot dispatch push notifications
  const resEmpNotif = await makeRequest({
    method: 'POST',
    path: '/api/notifications/dispatch',
    headers: { Authorization: `Bearer ${employeeToken}` },
    body: { title: 'Test', body: 'Test push' },
  });
  assert(resEmpNotif.statusCode === 403, 'Employee token rejected with 403 on push dispatch', `Status: ${resEmpNotif.statusCode}`);

  // 3.4 Super Admin CAN dispatch push or inward devices
  const resAdminIot = await makeRequest({
    method: 'POST',
    path: '/api/iot/devices/assign',
    headers: { Authorization: `Bearer ${token}` },
    body: { serial_number: 'TEST-SERIAL-NONE' },
  });
  // Should pass auth check (may 404 on device not found, but NOT 401 or 403)
  assert(resAdminIot.statusCode !== 401 && resAdminIot.statusCode !== 403, 'Admin token passes RBAC for IoT device management', `Status: ${resAdminIot.statusCode}`);

  // ==========================================
  // SECTION 4: FRANCHISE TENANT ISOLATION
  // ==========================================
  console.log('\n--- Test Section 4: Franchise Tenant Scope Isolation ---');

  // Franchise Manager A token
  const franchiseAToken = signToken({
    id: 8888,
    email: 'manager_a@evegah.com',
    role: 'Franchise Manager',
    evegahRole: 'franchise_manager',
    franchiseId: '11111111-1111-1111-1111-111111111111',
  });

  // Try accessing Franchise B's expenses
  const resCrossTenant = await makeRequest({
    method: 'GET',
    path: '/api/franchises/expenses/all?franchise_id=22222222-2222-2222-2222-222222222222',
    headers: { Authorization: `Bearer ${franchiseAToken}` },
  });
  assert(resCrossTenant.statusCode === 403, 'Cross-tenant access rejected with 403 when Franchise A queries Franchise B', `Status: ${resCrossTenant.statusCode}`);

  // Accessing own franchise expenses
  const resOwnTenant = await makeRequest({
    method: 'GET',
    path: '/api/franchises/expenses/all?franchise_id=11111111-1111-1111-1111-111111111111',
    headers: { Authorization: `Bearer ${franchiseAToken}` },
  });
  assert(resOwnTenant.statusCode === 200, 'Franchise manager successfully queries own franchise expenses', `Status: ${resOwnTenant.statusCode}`);

  // ==========================================
  // SECTION 5: PAYMENT INTEGRITY
  // ==========================================
  console.log('\n--- Test Section 5: Payment Integrity & Bank Reconciliation ---');

  // 5.1 Client cannot declare unverified payment SUCCESS on ICICI verify
  const fakeTxnId = `TXN_FAKE_${Date.now()}`;
  const resFakeIcici = await makeRequest({
    method: 'POST',
    path: '/api/payments/icici/verify',
    body: { tx_id: fakeTxnId, status: 'SUCCESS', amount: 850, purpose: 'ride' },
  });
  assert(
    resFakeIcici.statusCode === 400 && resFakeIcici.body?.code === 'PAYMENT_NOT_CONFIRMED',
    'ICICI /verify rejects client-declared SUCCESS without bank confirmation',
    `Status: ${resFakeIcici.statusCode}`
  );

  // 5.2 Client cannot declare unverified payment SUCCESS on PayU verify
  const resFakePayU = await makeRequest({
    method: 'POST',
    path: '/api/payments/payu/verify',
    body: { tx_id: fakeTxnId, status: 'SUCCESS', amount: 850, purpose: 'ride' },
  });
  assert(
    resFakePayU.statusCode === 400 && resFakePayU.body?.code === 'PAYMENT_NOT_CONFIRMED',
    'PayU /verify rejects client-declared SUCCESS without gateway verification',
    `Status: ${resFakePayU.statusCode}`
  );

  // 5.3 PayU /refund route requires authorized administrative role
  const resUnauthRefund = await makeRequest({
    method: 'POST',
    path: '/api/payments/payu/refund',
    headers: { Authorization: `Bearer ${employeeToken}` },
    body: { tx_id: 'TXN123', amount: 500 },
  });
  assert(resUnauthRefund.statusCode === 403, 'PayU /refund rejects non-finance/non-admin roles with 403', `Status: ${resUnauthRefund.statusCode}`);

  // ==========================================
  // FINAL SUMMARY
  // ==========================================
  console.log('\n==========================================');
  console.log(`📊 Batch 5 Test Results: ${passedTests}/${totalTests} Passed`);
  console.log('==========================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL BATCH 5 SECURITY & INTEGRITY TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE.\n');
    process.exit(1);
  }
}

runSecurityTestSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
