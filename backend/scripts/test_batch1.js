const http = require('http');

function postRequest(path, data, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...customHeaders,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getRequest(path, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'GET',
        headers: {
          ...customHeaders,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING BATCH 1 AUTOMATED VERIFICATION SUITE ===\n');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failCount++;
    }
  }

  try {
    // Test 1: Invalid login is rejected
    const invalidLogin = await postRequest('/api/users/login', {
      email: 'nonexistent@evegah.com',
      password: 'wrongpassword',
    });
    assert(
      invalidLogin.statusCode === 401 && invalidLogin.data.status === 'error',
      'Test 1: Invalid login is rejected with 401 error'
    );

    // Test 2: Valid login creates a usable authenticated session
    const validLogin = await postRequest('/api/users/login', {
      email: 'himanshu@evegah.com',
      password: 'G7r!pLk9@#X2s',
    });
    assert(
      validLogin.statusCode === 200 &&
        validLogin.data.status === 'success' &&
        validLogin.data.token &&
        validLogin.data.user.email === 'himanshu@evegah.com',
      'Test 2: Valid login creates a usable authenticated session with token and user details'
    );

    // Test 3: Phone number login reconciliation works
    const phoneLogin = await postRequest('/api/users/login', {
      email: '8128251172',
      password: 'G7r!pLk9@#X2s',
    });
    assert(
      phoneLogin.statusCode === 200 &&
        phoneLogin.data.status === 'success' &&
        phoneLogin.data.user.mobile.includes('8128251172'),
      'Test 3: Phone number login reconciles to correct user account'
    );

    const authToken = validLogin.data.token;
    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // Test 4: Attendance clock-in persists correctly
    const clockInRes = await postRequest('/api/attendance/clock-in', {
      employee_id: 'TEST-EMP-99',
      employee_name: 'Verification Bot',
      employee_role: 'QA Engineer',
      zone: 'Gotri Zone Hub',
      shift: 'Morning Shift',
      geofence_verified: true,
    }, authHeaders);
    assert(
      (clockInRes.statusCode === 200 || clockInRes.statusCode === 201) &&
        clockInRes.data.status === 'success' &&
        clockInRes.data.data.status === 'clocked_in',
      'Test 4: Attendance clock-in persists correctly'
    );

    // Test 5: Idempotent duplicate clock-in does not create conflicting session
    const dupClockInRes = await postRequest('/api/attendance/clock-in', {
      employee_id: 'TEST-EMP-99',
      employee_name: 'Verification Bot',
      employee_role: 'QA Engineer',
      zone: 'Gotri Zone Hub',
    }, authHeaders);
    assert(
      dupClockInRes.statusCode === 200 &&
        dupClockInRes.data.status === 'success' &&
        dupClockInRes.data.message.includes('already clocked in'),
      'Test 5: Duplicate clock-in is idempotent and prevents conflicting open sessions'
    );

    // Test 6: Attendance clock-out computes elapsed shift
    const clockOutRes = await postRequest('/api/attendance/clock-out', {
      employee_name: 'Verification Bot',
      notes: 'Completed verification test shift',
    }, authHeaders);
    assert(
      clockOutRes.statusCode === 200 &&
        clockOutRes.data.status === 'success' &&
        clockOutRes.data.data.status === 'clocked_out',
      'Test 6: Attendance clock-out updates record to clocked_out'
    );

    // Test 7: Franchise listing returns data
    const franchiseList = await getRequest('/api/franchises');
    assert(
      franchiseList.statusCode === 200 &&
        franchiseList.data.status === 'success' &&
        Array.isArray(franchiseList.data.data) &&
        franchiseList.data.data.length > 0,
      'Test 7: Franchise list API returns persistent franchise hubs'
    );

    // Test 8: Franchise expense creation and validation
    const testFranchiseId = franchiseList.data.data[0].id;
    const expenseRes = await postRequest('/api/franchises/expenses', {
      franchise_id: testFranchiseId,
      franchise_name: franchiseList.data.data[0].name,
      category: 'Maintenance',
      title: 'Automated Test EV Charger Repair',
      amount: 4500.0,
      payment_mode: 'UPI',
    }, authHeaders);
    assert(
      expenseRes.statusCode === 201 &&
        expenseRes.data.status === 'success' &&
        parseFloat(expenseRes.data.data.amount) === 4500.0,
      'Test 8: Franchise expense creation succeeds and validates amount'
    );

    // Test 9: Negative/Invalid expense amount is rejected
    const invalidExpense = await postRequest('/api/franchises/expenses', {
      category: 'Maintenance',
      title: 'Bad Amount',
      amount: -500,
    }, authHeaders);
    assert(
      invalidExpense.statusCode === 400 && invalidExpense.data.status === 'error',
      'Test 9: Invalid/Negative expense amount is rejected with 400 error'
    );

    // Test 10: Franchise expense retrieval reflects newly added expense
    const expenseList = await getRequest(`/api/franchises/expenses/all?franchise_id=${testFranchiseId}`, authHeaders);
    assert(
      expenseList.statusCode === 200 &&
        expenseList.data.status === 'success' &&
        expenseList.data.summary.totalExpense > 0,
      'Test 10: Franchise expense query retrieves persistent records and computes summary totals'
    );
  } catch (err) {
    console.error('Fatal suite execution error:', err);
    failCount++;
  }

  console.log(`\n=== RESULTS: ${passCount} PASSED, ${failCount} FAILED ===`);
  process.exit(failCount === 0 ? 0 : 1);
}

runTests();
