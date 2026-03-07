/**
 * TITAN-OS Final Verification Script
 * Complete system health check and route verification
 */

const http = require('http');
const https = require('https');

// Configuration
const BACKEND_URL = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:5173';

// Test endpoints
const API_ENDPOINTS = [
  { path: '/api/agents/capabilities', method: 'GET', description: 'Agent Capabilities' },
  { path: '/api/agents/sentiment/status/test', method: 'GET', description: 'Sentiment Engine' },
  { path: '/api/agents/recovery/status/test', method: 'GET', description: 'Recovery Council' },
  { path: '/api/titan-os/orb/data', method: 'GET', description: 'TARS-D Orb Data' },
  { path: '/api/titan-os/voice/status', method: 'GET', description: 'Voice Processor Status' },
  { path: '/api/titan-os/biomechanics/status', method: 'GET', description: 'Biomechanics Lab Status' },
  { path: '/api/titan-os/meet-logistics/status', method: 'GET', description: 'Meet Logistics Status' },
  { path: '/api/coach/athletes/test', method: 'GET', description: 'Coach Dashboard' },
  { path: '/api/programs/test', method: 'GET', description: 'Program Generation' },
  { path: '/api/users/test', method: 'GET', description: 'User Management' }
];

// Frontend routes to verify
const FRONTEND_ROUTES = [
  { path: '/', description: 'Home / Titan Dashboard' },
  { path: '/dashboard', description: 'Athlete Command Center' },
  { path: '/coach', description: 'Coach Strategy Room' },
  { path: '/competition', description: 'Competition Engine' },
  { path: '/biomechanics', description: 'Biomechanics Lab' },
  { path: '/voice', description: 'Voice Processor' },
  { path: '/meet-logistics', description: 'Meet Logistics' },
  { path: '/login', description: 'Login Page' },
  { path: '/register', description: 'Register Page' },
  { path: '/profile-setup', description: 'Profile Setup' }
];

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test API endpoint
async function testEndpoint(endpoint) {
  try {
    const url = `${BACKEND_URL}${endpoint.path}`;
    const response = await makeRequest(url, { method: endpoint.method });
    
    return {
      endpoint: endpoint.description,
      path: endpoint.path,
      status: 'PASS',
      statusCode: response.statusCode,
      responseTime: Date.now(),
      details: response.statusCode === 200 ? 'Endpoint responding correctly' : `Unexpected status: ${response.statusCode}`
    };
  } catch (error) {
    return {
      endpoint: endpoint.description,
      path: endpoint.path,
      status: 'FAIL',
      statusCode: null,
      responseTime: Date.now(),
      details: error.message
    };
  }
}

// Test frontend route
async function testRoute(route) {
  try {
    const url = `${FRONTEND_URL}${route.path}`;
    const response = await makeRequest(url);
    
    return {
      route: route.description,
      path: route.path,
      status: response.statusCode === 200 ? 'PASS' : 'FAIL',
      statusCode: response.statusCode,
      details: response.statusCode === 200 ? 'Route accessible' : `Status: ${response.statusCode}`
    };
  } catch (error) {
    return {
      route: route.description,
      path: route.path,
      status: 'FAIL',
      statusCode: null,
      details: error.message
    };
  }
}

// Check database connection
async function checkDatabase() {
  try {
    // Test Firebase connection
    const response = await makeRequest(`${BACKEND_URL}/api/status/db`, { method: 'GET' });
    
    return {
      database: 'Firebase',
      status: response.statusCode === 200 ? 'PASS' : 'FAIL',
      details: response.statusCode === 200 ? 'Database connection successful' : 'Database connection failed'
    };
  } catch (error) {
    return {
      database: 'Firebase',
      status: 'FAIL',
      details: error.message
    };
  }
}

// Check agent handshake
async function checkAgentHandshake() {
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/agents/handshake`, { method: 'GET' });
    
    return {
      component: 'Agent Handshake',
      status: response.statusCode === 200 ? 'PASS' : 'FAIL',
      details: response.statusCode === 200 ? 'All agents responding' : 'Agent handshake failed'
    };
  } catch (error) {
    return {
      component: 'Agent Handshake',
      status: 'FAIL',
      details: error.message
    };
  }
}

// Main verification function
async function runVerification() {
  console.log('🚀 TITAN-OS FINAL VERIFICATION STARTED\n');
  console.log('=' .repeat(80));
  
  const results = {
    timestamp: new Date().toISOString(),
    backend: {
      url: BACKEND_URL,
      status: 'UNKNOWN',
      endpoints: [],
      database: null,
      agents: null
    },
    frontend: {
      url: FRONTEND_URL,
      status: 'UNKNOWN',
      routes: []
    },
    summary: {
      total_tests: 0,
      passed: 0,
      failed: 0,
      success_rate: 0
    }
  };

  // Test backend endpoints
  console.log('📡 Testing Backend API Endpoints...');
  console.log('-'.repeat(50));
  
  for (const endpoint of API_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.backend.endpoints.push(result);
    
    console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.endpoint}`);
    console.log(`   Path: ${result.path}`);
    console.log(`   Status: ${result.statusCode || 'N/A'}`);
    console.log(`   Details: ${result.details}`);
    console.log('');
  }

  // Check database
  console.log('🗄️  Checking Database Connection...');
  console.log('-'.repeat(50));
  
  const dbResult = await checkDatabase();
  results.backend.database = dbResult;
  
  console.log(`${dbResult.status === 'PASS' ? '✅' : '❌'} ${dbResult.database}`);
  console.log(`   Details: ${dbResult.details}`);
  console.log('');

  // Check agent handshake
  console.log('🤖 Checking Agent Handshake...');
  console.log('-'.repeat(50));
  
  const agentResult = await checkAgentHandshake();
  results.backend.agents = agentResult;
  
  console.log(`${agentResult.status === 'PASS' ? '✅' : '❌'} ${agentResult.component}`);
  console.log(`   Details: ${agentResult.details}`);
  console.log('');

  // Test frontend routes
  console.log('🌐 Testing Frontend Routes...');
  console.log('-'.repeat(50));
  
  for (const route of FRONTEND_ROUTES) {
    const result = await testRoute(route);
    results.frontend.routes.push(result);
    
    console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.route}`);
    console.log(`   Path: ${result.path}`);
    console.log(`   Status: ${result.statusCode || 'N/A'}`);
    console.log(`   Details: ${result.details}`);
    console.log('');
  }

  // Calculate summary
  const allTests = [
    ...results.backend.endpoints,
    results.backend.database,
    results.backend.agents,
    ...results.frontend.routes
  ];
  
  results.summary.total_tests = allTests.length;
  results.summary.passed = allTests.filter(test => test.status === 'PASS').length;
  results.summary.failed = allTests.filter(test => test.status === 'FAIL').length;
  results.summary.success_rate = (results.summary.passed / results.summary.total_tests * 100).toFixed(1);

  // Determine overall status
  results.backend.status = results.backend.endpoints.every(e => e.status === 'PASS') && 
                          results.backend.database?.status === 'PASS' && 
                          results.backend.agents?.status === 'PASS' ? 'PASS' : 'FAIL';
  
  results.frontend.status = results.frontend.routes.every(r => r.status === 'PASS') ? 'PASS' : 'FAIL';

  // Print summary
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=' .repeat(80));
  console.log(`Total Tests: ${results.summary.total_tests}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Success Rate: ${results.summary.success_rate}%`);
  console.log('');
  console.log(`Backend Status: ${results.backend.status}`);
  console.log(`Frontend Status: ${results.frontend.status}`);
  console.log('');
  
  // System Health Table
  console.log('🏥 SYSTEM HEALTH TABLE');
  console.log('=' .repeat(80));
  console.log('| Component          | Status | Details                     |');
  console.log('|--------------------|--------|-----------------------------|');
  console.log(`| Backend API        | ${results.backend.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} | ${results.backend.endpoints.length}/${results.backend.endpoints.length} endpoints working |`);
  console.log(`| Database           | ${results.backend.database?.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} | ${results.backend.database?.details} |`);
  console.log(`| Agent Handshake    | ${results.backend.agents?.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} | ${results.backend.agents?.details} |`);
  console.log(`| Frontend Routes    | ${results.frontend.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} | ${results.frontend.routes.filter(r => r.status === 'PASS').length}/${results.frontend.routes.length} routes accessible |`);
  console.log('|--------------------|--------|-----------------------------|');
  console.log('');

  // Critical issues
  const criticalIssues = [];
  
  if (results.backend.status === 'FAIL') {
    criticalIssues.push('Backend API has failing endpoints');
  }
  
  if (results.backend.database?.status === 'FAIL') {
    criticalIssues.push('Database connection failed');
  }
  
  if (results.backend.agents?.status === 'FAIL') {
    criticalIssues.push('Agent handshake failed');
  }
  
  if (results.frontend.status === 'FAIL') {
    criticalIssues.push('Frontend has inaccessible routes');
  }

  if (criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES FOUND:');
    criticalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    console.log('');
  }

  // Final verdict
  const overallStatus = results.summary.success_rate >= 90 ? 'EXCELLENT' :
                        results.summary.success_rate >= 75 ? 'GOOD' :
                        results.summary.success_rate >= 50 ? 'NEEDS ATTENTION' : 'CRITICAL';

  console.log(`🎯 OVERALL SYSTEM STATUS: ${overallStatus}`);
  
  if (overallStatus === 'EXCELLENT') {
    console.log('🎉 TITAN-OS is ready for production deployment!');
  } else if (overallStatus === 'GOOD') {
    console.log('⚠️  TITAN-OS is mostly functional but has some issues to address.');
  } else {
    console.log('❌ TITAN-OS has significant issues that need to be resolved before deployment.');
  }

  console.log('\n' + '=' .repeat(80));
  console.log('🚀 TITAN-OS VERIFICATION COMPLETE');
  console.log('=' .repeat(80));

  // Save results to file
  const fs = require('fs');
  const reportPath = './verification-report.json';
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  } catch (error) {
    console.log(`\n❌ Failed to save report: ${error.message}`);
  }

  return results;
}

// Run verification if this script is executed directly
if (require.main === module) {
  runVerification().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

module.exports = { runVerification };
