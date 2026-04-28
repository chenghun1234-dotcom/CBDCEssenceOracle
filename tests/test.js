/**
 * Local Test Script for GEPA API
 * Usage: node tests/test.js
 */

const BASE_URL = 'http://localhost:8787';

async function runTests() {
  console.log('🚀 Starting GEPA API Tests...\n');

  try {
    // 1. Health Check
    console.log('--- [GET /] Health Check ---');
    const health = await fetch(`${BASE_URL}/`).then(r => r.json());
    console.log(JSON.stringify(health, null, 2));
    console.log('✅ Success\n');

    // 2. Market Prices
    console.log('--- [GET /v1/market/prices] KRW-C Meat ---');
    const prices = await fetch(`${BASE_URL}/v1/market/prices?currency=KRW-C&category=meat`, {
      headers: { 'X-RapidAPI-Key': 'test-key' }
    }).then(r => r.json());
    console.log(`Found ${prices.count} items in ${prices.currency}`);
    console.log('Sample item:', JSON.stringify(prices.data[0], null, 2));
    console.log('✅ Success\n');

    // 3. AI Prediction
    console.log('--- [GET /v1/market/predict] Beef Prediction ---');
    const predict = await fetch(`${BASE_URL}/v1/market/predict?item_id=MEAT_BEEF_001&currency=KRW-C`, {
      headers: { 'X-RapidAPI-Key': 'test-key' }
    }).then(r => r.json());
    console.log(JSON.stringify(predict, null, 2));
    console.log('✅ Success\n');

    // 4. Settlement Calculation
    console.log('--- [POST /v1/settlement/calculate] ---');
    const settle = await fetch(`${BASE_URL}/v1/settlement/calculate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': 'test-key'
      },
      body: JSON.stringify({
        item_id: 'MEAT_BEEF_001',
        quantity: 500,
        currency: 'KRW-C',
        lock_rate: true
      })
    }).then(r => r.json());
    console.log(JSON.stringify(settle, null, 2));
    console.log('✅ Success\n');

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure to run "wrangler dev" in another terminal before testing.');
  }
}

runTests();
