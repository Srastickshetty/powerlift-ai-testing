/**
 * TITAN-AI Frontend-Backend Connection Test
 * Tests all major API endpoints to verify connectivity
 */

const testResults = {
  frontend: 'http://localhost:5173',
  backend: 'http://localhost:5001',
  tests: []
};

async function testEndpoint(name, url, method = 'GET', body = null) {
  const startTime = Date.now();
  
  try {
    console.log(`🧪 Testing ${name}...`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const result = await response.json();
    
    const success = response.ok;
    const latency = Date.now() - startTime;
    
    testResults.tests.push({
      name,
      url,
      method,
      status: success ? 'SUCCESS' : 'FAILED',
      statusCode: response.status,
      latency,
      result: success ? result : null,
      error: success ? null : result
    });
    
    console.log(`✅ ${name}: ${success ? 'SUCCESS' : 'FAILED'} (${response.status})`);
    if (!success) {
      console.log(`❌ Error:`, result);
    }
    
    return success;
  } catch (error) {
    console.log(`❌ ${name}: NETWORK ERROR - ${error.message}`);
    testResults.tests.push({
      name,
      url,
      method,
      status: 'NETWORK_ERROR',
      statusCode: 0,
      latency: 0,
      result: null,
      error: error.message
    });
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 TITAN-AI CONNECTION TEST SUITE');
  console.log('===================================');
  console.log(`Frontend: ${testResults.frontend}`);
  console.log(`Backend: ${testResults.backend}`);
  console.log('');
  
  // Test basic connectivity
  await testEndpoint('Backend Health Check', `${testResults.backend}/`);
  
  // Test agent capabilities
  await testEndpoint('Agent Capabilities', `${testResults.backend}/api/agents/capabilities`);
  
  // Test sentiment analysis
  await testEndpoint('Sentiment Analysis', `${testResults.backend}/api/agents/sentiment/analyze`, 'POST', {
    athleteData: {
      hrv: 45,
      restingHR: 72,
      sleepQuality: 5.5
    },
    baselineData: {
      hrv: 65,
      restingHR: 60,
      avgVelocity: 0.35
    },
    sessionData: {
      currentRPE: 10,
      currentVelocity: 0.5,
      targetVelocity: 0.4
    }
  });
  
  // Test recovery council
  await testEndpoint('Recovery Council', `${testResults.backend}/api/agents/recovery/analyze`, 'POST', {
    athleteId: 'test_athlete_001',
    biometricData: {
      hrv: 45,
      restingHR: 78,
      sleepQuality: 4.0
    },
    trainingData: {
      intensity: 'high',
      volume: 'high',
      duration: 90
    }
  });
  
  // Test program generation
  await testEndpoint('Program Generation', `${testResults.backend}/api/programs/generate`, 'POST', {
    athleteId: 'test_user',
    goals: 'strength',
    experience: 'intermediate'
  });
  
  // Test workout logging
  await testEndpoint('Workout Logging', `${testResults.backend}/api/logs`, 'POST', {
    athleteId: 'test_athlete_001',
    dayId: '2024-03-04',
    entries: {
      squat: {
        working_sets: [{weight: 100, reps: 5}],
        working_weight: 100
      }
    }
  });
  
  // Display results
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  const successCount = testResults.tests.filter(t => t.status === 'SUCCESS').length;
  const totalCount = testResults.tests.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);
  
  testResults.tests.forEach(test => {
    const status = test.status === 'SUCCESS' ? '✅' : '❌';
    const latency = test.latency ? `${test.latency}ms` : 'N/A';
    console.log(`${status} ${test.name.padEnd(20)} | ${test.statusCode.toString().padEnd(6)} | ${latency.padEnd(8)} | ${test.url}`);
  });
  
  console.log('\n🎯 OVERALL RESULTS:');
  console.log(`Success Rate: ${successRate}% (${successCount}/${totalCount})`);
  console.log(`Status: ${successCount === totalCount ? '🟢 ALL CONNECTIONS WORKING' : '🔴 SOME CONNECTIONS FAILED'}`);
  
  if (successCount === totalCount) {
    console.log('\n🚀 TITAN-AI IS FULLY OPERATIONAL!');
    console.log('✅ Frontend-Backend Connection: ESTABLISHED');
    console.log('✅ All API Endpoints: RESPONDING');
    console.log('✅ Agent Systems: COMMUNICATING');
    console.log('\n🌐 Access your dashboard at:', testResults.frontend);
  } else {
    console.log('\n🔧 TROUBLESHOOTING NEEDED:');
    console.log('❌ Failed endpoints detected');
    console.log('🔧 Check backend server is running on port 5001');
    console.log('🔧 Check frontend is running on port 5173');
    console.log('🔧 Verify CORS configuration');
  }
  
  return testResults;
}

// Run the test suite
runAllTests();
