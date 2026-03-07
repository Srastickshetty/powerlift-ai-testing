/**
 * TITAN-AI REAL-TIME DEMO MODE
 * Pings every active endpoint with sample data
 * Outputs results in clean table format
 */

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:5001';
const ENDPOINTS = [
  {
    name: 'Universal Process',
    path: '/api/agents/process',
    method: 'POST',
    data: {
      dataType: 'training_session',
      data: {
        athleteData: {
          hrv: 65,
          restingHR: 60,
          sleepQuality: 8.0
        },
        baselineData: {
          hrv: 75,
          restingHR: 60,
          avgVelocity: 0.35
        },
        sessionData: {
          currentRPE: 7,
          currentVelocity: 0.4,
          targetVelocity: 0.35
        }
      },
      athleteId: 'test_athlete_001'
    }
  },
  {
    name: 'Sentiment Analysis',
    path: '/api/agents/sentiment/analyze',
    method: 'POST',
    data: {
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
      },
      voiceAnalysis: {
        pitchVariability: 0.75,
        speechRate: 0.85,
        jitter: 0.65,
        shimmer: 0.55,
        energyLevel: 0.25
      }
    }
  },
  {
    name: 'Recovery Analysis',
    path: '/api/agents/recovery/analyze',
    method: 'POST',
    data: {
      athleteId: 'test_athlete_001',
      biometricData: {
        hrv: 45,
        restingHR: 78,
        sleepQuality: 4.0,
        sleepData: {
          quality: 4.0,
          remHours: 3.0,
          deepSleepHours: 1.2
        }
      },
      trainingData: {
        intensity: 'high',
        volume: 'high',
        duration: 90
      },
      performanceData: {
        currentVelocity: 0.28,
        baselineVelocity: 0.35
      }
    }
  },
  {
    name: 'Meet Scout Search',
    path: '/api/agents/meet-scout/search',
    method: 'POST',
    data: {
      athleteId: 'test_athlete_001',
      searchParameters: {
        hashtags: ['#USAPL', '#USPA'],
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          radius_km: 100
        },
        timeframe: {
          start_date: '2024-06-01',
          end_date: '2024-12-31'
        }
      },
      athleteLocation: {
        city: 'New York',
        state: 'NY'
      },
      strengthClass: '83kg'
    }
  },
  {
    name: 'Biomechanics Analysis',
    path: '/api/agents/biomechanics/analyze',
    method: 'POST',
    data: {
      videoPath: '/uploads/test_squat.mp4',
      athleteId: 'test_athlete_001',
      analysisType: 'full_biomechanics'
    }
  },
  {
    name: 'Meet Logistics Monitor',
    path: '/api/agents/meet-logistics/monitor',
    method: 'POST',
    data: {
      athleteId: 'test_athlete_001',
      meetId: 'usapl_ny_2024',
      flightId: 'flight_c',
      platformId: 'platform_1'
    }
  },
  {
    name: 'Voice Analysis',
    path: '/api/agents/voice/analyze',
    method: 'POST',
    data: {
      audioPath: '/uploads/test_voice_log.wav',
      athleteId: 'test_athlete_001',
      sessionContext: {
        trainingType: 'heavy_squat',
        timeOfDay: 'morning',
        fatigueLevel: 'high'
      },
      voiceAnalysis: {
        pitchVariability: 0.8,
        speechRate: 0.9,
        jitter: 0.7,
        shimmer: 0.6,
        energyLevel: 0.2
      }
    }
  },
  {
    name: 'Agent Capabilities',
    path: '/api/agents/capabilities',
    method: 'GET'
  },
  {
    name: 'System Health Check',
    path: '/',
    method: 'GET'
  }
];

// Utility function to make HTTP requests
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const postData = options.data ? JSON.stringify(options.data) : null;
    
    const requestOptions = {
      hostname: 'localhost',
      port: 5001,
      path: options.path,
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: 'SUCCESS',
            statusCode: res.statusCode,
            latency,
            result: jsonData,
            error: null
          });
        } catch (parseError) {
          resolve({
            status: 'PARSE_ERROR',
            statusCode: res.statusCode,
            latency,
            result: data,
            error: parseError.message
          });
        }
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      resolve({
        status: 'CONNECTION_ERROR',
        statusCode: 0,
        latency,
        result: null,
        error: error.message
      });
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Format results into table
function formatTable(results) {
  console.log('\n📊 TITAN-AI SYSTEM INTEGRITY TEST RESULTS');
  console.log('='.repeat(60));
  console.log('Endpoint'.padEnd(25) + ' | Status'.padEnd(12) + ' | Latency'.padEnd(10) + ' | Result');
  console.log('-'.repeat(60));
  
  results.forEach((result, index) => {
    const endpoint = result.name.padEnd(25);
    const status = result.status.padEnd(12);
    const latency = `${result.latency}ms`.padEnd(10);
    let resultText = '';
    
    if (result.status === 'SUCCESS') {
      if (result.result && result.result.success === false) {
        resultText = '❌ API Error';
      } else {
        resultText = '✅ Success';
      }
    } else if (result.status === 'CONNECTION_ERROR') {
      resultText = '🔴 Server Down';
    } else if (result.status === 'PARSE_ERROR') {
      resultText = '⚠️ Parse Error';
    } else {
      resultText = '❓ Unknown';
    }
    
    console.log(`${endpoint} | ${status} | ${latency} | ${resultText}`);
  });
  
  console.log('='.repeat(60));
}

// Main test function
async function runSystemIntegrityTest() {
  console.log('🚀 TITAN-AI REAL-TIME DEMO MODE');
  console.log('================================');
  console.log(`Testing ${ENDPOINTS.length} endpoints...`);
  console.log(`Target Server: ${BASE_URL}`);
  console.log('');
  
  const results = [];
  
  // Run tests sequentially to avoid overwhelming the server
  for (let i = 0; i < ENDPOINTS.length; i++) {
    const endpoint = ENDPOINTS[i];
    console.log(`Testing ${i + 1}/${ENDPOINTS.length}: ${endpoint.name}...`);
    
    const result = await makeRequest(endpoint);
    result.name = endpoint.name;
    result.path = endpoint.path;
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Display results
  formatTable(results);
  
  // Summary statistics
  const successful = results.filter(r => r.status === 'SUCCESS').length;
  const connectionErrors = results.filter(r => r.status === 'CONNECTION_ERROR').length;
  const parseErrors = results.filter(r => r.status === 'PARSE_ERROR').length;
  const apiErrors = results.filter(r => r.status === 'SUCCESS' && r.result && r.result.success === false).length;
  
  console.log('\n📈 SUMMARY STATISTICS:');
  console.log('======================');
  console.log(`✅ Successful Requests: ${successful}/${ENDPOINTS.length} (${((successful/ENDPOINTS.length)*100).toFixed(1)}%)`);
  console.log(`🔴 Connection Errors: ${connectionErrors}/${ENDPOINTS.length} (${((connectionErrors/ENDPOINTS.length)*100).toFixed(1)}%)`);
  console.log(`⚠️ Parse Errors: ${parseErrors}/${ENDPOINTS.length} (${((parseErrors/ENDPOINTS.length)*100).toFixed(1)}%)`);
  console.log(`❌ API Errors: ${apiErrors}/${ENDPOINTS.length} (${((apiErrors/ENDPOINTS.length)*100).toFixed(1)}%)`);
  
  const overallHealth = connectionErrors === 0 ? '🟢 HEALTHY' : '🔴 UNHEALTHY';
  console.log(`\n🏥 Overall System Health: ${overallHealth}`);
  
  // Detailed error reporting
  const failedTests = results.filter(r => r.status !== 'SUCCESS' || (r.result && r.result.success === false));
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED ENDPOINTS DETAILS:');
    console.log('============================');
    failedTests.forEach(test => {
      console.log(`\n🔴 ${test.name}:`);
      console.log(`   Path: ${test.path}`);
      console.log(`   Status: ${test.status}`);
      console.log(`   Error: ${test.error || 'None'}`);
      if (test.statusCode) {
        console.log(`   HTTP Status: ${test.statusCode}`);
      }
    });
  }
  
  // Deployment readiness assessment
  console.log('\n🚀 DEPLOYMENT READINESS:');
  console.log('========================');
  
  const criticalEndpoints = ['/api/agents/process', '/api/agents/sentiment/analyze', '/api/agents/recovery/analyze'];
  const criticalWorking = criticalEndpoints.filter(path => {
    const result = results.find(r => r.path === path);
    return result && result.status === 'SUCCESS';
  }).length;
  
  const readinessScore = (criticalWorking / criticalEndpoints.length) * 100;
  const readinessStatus = readinessScore >= 80 ? '✅ ELITE DEPLOYMENT READY' : 
                       readinessScore >= 60 ? '⚠️ DEPLOYMENT WITH CAVEATS' : '❌ NOT DEPLOYMENT READY';
  
  console.log(`Critical Endpoints Working: ${criticalWorking}/${criticalEndpoints.length}`);
  console.log(`Readiness Score: ${readinessScore.toFixed(1)}%`);
  console.log(`Status: ${readinessStatus}`);
  
  return {
    results,
    summary: {
      total: ENDPOINTS.length,
      successful,
      connectionErrors,
      parseErrors,
      apiErrors,
      overallHealth,
      readinessScore,
      readinessStatus
    }
  };
}

// Check if server is running first
async function checkServerStatus() {
  console.log('🔍 Checking server status...');
  
  try {
    const result = await makeRequest({
      name: 'Health Check',
      path: '/',
      method: 'GET'
    });
    
    if (result.status === 'SUCCESS') {
      console.log('✅ Server is running');
      return true;
    } else {
      console.log('❌ Server is not responding');
      console.log('Please start the server with: npm start');
      return false;
    }
  } catch (error) {
    console.log('❌ Server check failed:', error.message);
    return false;
  }
}

// Run the test
async function main() {
  const serverRunning = await checkServerStatus();
  
  if (serverRunning) {
    await runSystemIntegrityTest();
  } else {
    console.log('\n💡 To start the server:');
    console.log('   cd backend');
    console.log('   npm start');
    console.log('\nThen run this test again.');
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error.message);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

// Run the test
main();
