const http = require('http');

function postRequest(path, data) {
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

function getRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'GET',
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

async function runBatch2Tests() {
  console.log('=== STARTING BATCH 2 AUTOMATED VERIFICATION SUITE ===\n');
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
    // Test 1: Fetch ride history for rider via GET /api/rides/history/:identifier
    const historyRes = await getRequest('/api/rides/history/8128251172');
    assert(
      historyRes.statusCode === 200 &&
        historyRes.data.status === 'success' &&
        Array.isArray(historyRes.data.data),
      'Test 1: GET /api/rides/history/:identifier returns 200 and formatted ride list'
    );

    // Test 2: Battery swap API POST /api/batteries/swap succeeds and assigns fresh battery
    const swapPayload = {
      client_tx_id: `SWAP_TEST_${Date.now()}`,
      rider_name: 'Himanshu',
      rider_mobile: '8128251172',
      vehicle_number: 'EV-450X-202401',
      old_battery_id: 'BAT-450X-12340001',
      old_battery_soc: 18,
      new_battery_id: 'BAT-450X-12340002',
      new_battery_soc: 100,
      amount: 150.00,
      payment_mode: 'UPI',
      zone: 'Gotri Zone',
      station: 'Gotri Central Hub',
    };

    const swapRes = await postRequest('/api/batteries/swap', swapPayload);
    assert(
      (swapRes.statusCode === 200 || swapRes.statusCode === 201) &&
        swapRes.data.status === 'success' &&
        swapRes.data.swap &&
        swapRes.data.swap.new_battery_id === 'BAT-450X-12340002',
      'Test 2: Battery swap API records swap event and updates battery lifecycle'
    );

    // Test 3: Swap history query reflects the newly committed swap
    const swapHistRes = await getRequest('/api/batteries/swap-history');
    assert(
      swapHistRes.statusCode === 200 &&
        Array.isArray(swapHistRes.data.data) &&
        swapHistRes.data.data.some(s => s.new_battery_id === 'BAT-450X-12340002'),
      'Test 3: Battery swap history contains the newly processed swap record'
    );

    // Test 4: Re-query ride history confirms active rental has updated details
    const refreshedHistory = await getRequest('/api/rides/history/8128251172');
    assert(
      refreshedHistory.statusCode === 200 &&
        refreshedHistory.data.status === 'success',
      'Test 4: Rider ride history remains queryable after battery swap'
    );

  } catch (err) {
    console.error('Fatal Batch 2 suite error:', err);
    failCount++;
  }

  console.log(`\n=== RESULTS: ${passCount} PASSED, ${failCount} FAILED ===`);
  process.exit(failCount === 0 ? 0 : 1);
}

runBatch2Tests();
