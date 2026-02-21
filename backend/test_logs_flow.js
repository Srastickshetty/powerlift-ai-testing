/**
 * Test script to verify logs save/load flow
 * Run: node test_logs_flow.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
const TEST_ATHLETE_ID = 'test_athlete_' + Date.now();
const TEST_DAY = 'W1D1';

async function test() {
  console.log('\n=== LOGS FLOW TEST ===\n');
  
  try {
    // TEST 1: POST a log
    console.log('TEST 1: Saving logs...');
    const saveRes = await fetch(`${BASE_URL}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        athleteId: TEST_ATHLETE_ID,
        dayId: TEST_DAY,
        entries: {
          'Squat': { weight: 100, reps: 5 },
          'Bench': { weight: 80, reps: 5 }
        }
      })
    });
    
    const saveData = await saveRes.json();
    console.log('Save response:', saveData);
    console.log('Status:', saveRes.status);
    
    if (!saveRes.ok) {
      console.error('❌ Save failed!');
      return;
    }
    
    // TEST 2: GET logs
    console.log('\nTEST 2: Loading logs...');
    const loadRes = await fetch(`${BASE_URL}/logs/${TEST_ATHLETE_ID}`);
    const loadData = await loadRes.json();
    
    console.log('Load response:', loadData);
    console.log('Has W1D1?', TEST_DAY in loadData);
    
    if (loadRes.ok && loadData[TEST_DAY]) {
      console.log('✅ Logs retrieved successfully');
      console.log('Squat data:', loadData[TEST_DAY].Squat);
      console.log('Bench data:', loadData[TEST_DAY].Bench);
    } else {
      console.error('❌ Load failed or missing data!');
      return;
    }
    
    // TEST 3: DEBUG endpoint
    console.log('\nTEST 3: Debug endpoint...');
    const debugRes = await fetch(`${BASE_URL}/logs/debug/${TEST_ATHLETE_ID}`);
    const debugData = await debugRes.json();
    
    console.log('Raw Firestore documents:');
    debugData.documents?.forEach(doc => {
      console.log(`  - ${doc.id}:`, {
        day_id: doc.day_id,
        entries_keys: Object.keys(doc.entries || {})
      });
    });
    
    console.log('\n✅ ALL TESTS PASSED\n');
    
  } catch (err) {
    console.error('❌ TEST ERROR:', err.message);
  }
}

test();
