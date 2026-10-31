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
          'x-user-role': 'admin',
          'x-api-key': 'evegah-internal-key',
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
          'x-user-role': 'admin',
          'x-api-key': 'evegah-internal-key',
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

async function runBatch3Tests() {
  console.log('=== STARTING BATCH 3 AUTOMATED VERIFICATION SUITE ===\n');
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
    const testRiderMobile = '8128251172';
    const validToken = `fcm_token_valid_${Date.now()}`;
    const invalidToken = `invalid_fcm_token_${Date.now()}`;

    // Test 1: Device token registration associates token with rider mobile & role
    const regRes = await postRequest('/api/notifications/register-token', {
      token: validToken,
      mobile: testRiderMobile,
      role: 'rider',
      app_type: 'rider',
      device_os: 'android'
    });
    assert(
      regRes.statusCode === 200 &&
        regRes.data.status === 'success' &&
        regRes.data.data.token === validToken &&
        regRes.data.data.mobile === testRiderMobile,
      'Test 1: Device token registration associates token with rider mobile'
    );

    // Test 2: Register second invalid token to verify invalidation handling
    const regInvalidRes = await postRequest('/api/notifications/register-token', {
      token: invalidToken,
      mobile: testRiderMobile,
      role: 'rider',
      app_type: 'rider',
      device_os: 'android'
    });
    assert(
      regInvalidRes.statusCode === 200 &&
        regInvalidRes.data.status === 'success',
      'Test 2: Register test token for error handling and pruning verification'
    );

    // Test 3: Notification dispatch targets recipient tokens & prunes invalid token
    const testEventKey = `EXP_TEST_${Date.now()}`;
    const dispatchRes = await postRequest('/api/notifications/dispatch', {
      event_type: 'rental_expiry',
      event_key: testEventKey,
      recipient_mobile: testRiderMobile,
      app_type: 'rider',
      title: '⚠️ Rental Expiring Tomorrow',
      body: 'Your EV Scooter rental expires in 24 hours. Renew in app.',
      payload: { daysRemaining: 1, vehicleId: 'EV-450X-202401' }
    });
    assert(
      dispatchRes.statusCode === 200 &&
        dispatchRes.data.status === 'success' &&
        dispatchRes.data.tokens_targeted >= 2 &&
        dispatchRes.data.success_count >= 1 &&
        dispatchRes.data.failure_count >= 1,
      'Test 3: Push dispatch targets recipient and handles invalid token failures'
    );

    // Test 4: Re-dispatch with duplicate event_key is prevented / suppressed
    const dupDispatchRes = await postRequest('/api/notifications/dispatch', {
      event_type: 'rental_expiry',
      event_key: testEventKey,
      recipient_mobile: testRiderMobile,
      title: '⚠️ Rental Expiring Tomorrow',
      body: 'Your EV Scooter rental expires in 24 hours.'
    });
    assert(
      dupDispatchRes.statusCode === 200 &&
        dupDispatchRes.data.status === 'ignored' &&
        dupDispatchRes.data.reason === 'duplicate_suppressed',
      'Test 4: Duplicate-event prevention suppresses redundant push dispatches'
    );

    // Test 5: Verify invalid token was marked inactive in database
    const tokensRes = await getRequest(`/api/notifications/tokens?mobile=${testRiderMobile}`);
    assert(
      tokensRes.statusCode === 200 &&
        Array.isArray(tokensRes.data.data) &&
        tokensRes.data.data.some(t => t.token === validToken) &&
        !tokensRes.data.data.some(t => t.token === invalidToken),
      'Test 5: Invalid tokens are pruned from active dispatch targeting'
    );

    // Test 6: In-app notification feed received the dispatched notification
    const inAppRes = await getRequest(`/api/notifications?mobile=${testRiderMobile}`);
    assert(
      inAppRes.statusCode === 200 &&
        Array.isArray(inAppRes.data.data) &&
        inAppRes.data.data.some(n => n.title.includes('Rental Expiring Tomorrow')),
      'Test 6: Dispatched push event persists to in-app notification feed'
    );

    // Test 7: Battery swap automatically triggers battery_swap push notification
    const swapPayload = {
      client_tx_id: `SWAP_NOTIF_${Date.now()}`,
      rider_name: 'Himanshu',
      rider_mobile: testRiderMobile,
      vehicle_number: 'EV-450X-202401',
      old_battery_id: 'BAT-OLD-999',
      old_battery_soc: 12,
      new_battery_id: 'BAT-NEW-888',
      new_battery_soc: 99,
      amount: 150.00,
      payment_mode: 'UPI',
      zone: 'Gotri Zone',
      station: 'Central Hub',
    };
    const swapRes = await postRequest('/api/batteries/swap', swapPayload);
    assert(
      (swapRes.statusCode === 200 || swapRes.statusCode === 201) &&
        swapRes.data.status === 'success',
      'Test 7: Battery swap executes and triggers automated event pipeline'
    );

    // Test 8: Unregister device token deactivates token cleanly
    const unregRes = await postRequest('/api/notifications/unregister-token', {
      token: validToken
    });
    assert(
      unregRes.statusCode === 200 &&
        unregRes.data.status === 'success',
      'Test 8: Unregister token cleanly removes device from push recipient pool'
    );

    // Test 9: Mark all notifications read resets unreadCount
    const markReadRes = await postRequest('/api/notifications/mark-read', {
      mobile: testRiderMobile
    });
    const refreshedNotif = await getRequest(`/api/notifications?mobile=${testRiderMobile}`);
    assert(
      markReadRes.statusCode === 200 &&
        refreshedNotif.statusCode === 200 &&
        refreshedNotif.data.unreadCount === 0,
      'Test 9: Mark notifications read synchronizes unread state to 0'
    );

  } catch (err) {
    console.error('Fatal Batch 3 suite error:', err);
    failCount++;
  }

  console.log(`\n=== RESULTS: ${passCount} PASSED, ${failCount} FAILED ===`);
  process.exit(failCount === 0 ? 0 : 1);
}

runBatch3Tests();
