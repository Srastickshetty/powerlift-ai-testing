/**
 * FINAL VERIFICATION - TITAN-OS Feature Visibility Check
 * Ruthless audit to ensure ALL features are visible and working
 */

const http = require('http');
const https = require('https');

const BACKEND_URL = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:5173';

// Critical routes that MUST show TITAN-OS features
const CRITICAL_ROUTES = [
  { path: '/', description: 'Home/Landing - MUST show TITAN-OS war room' },
  { path: '/login', description: 'Login - MUST show TITAN-OS branding' },
  { path: '/register', description: 'Register - MUST show TITAN-OS features' },
  { path: '/profile-setup', description: 'Profile Setup - MUST show TITAN-OS features' },
  { path: '/dashboard', description: 'Dashboard - MUST show new command center' },
  { path: '/titan-demo', description: 'Demo - MUST show all features' }
];

const TITAN_OS_KEYWORDS = [
  'TITAN-OS', 'God-Level', 'Powerlifting Platform',
  'AI Agents', 'Voice Assistant', 'Biomechanics Lab',
  'Competition Engine', 'Real-time', 'YOLO-Pose',
  'TARS-D', 'Sentiment Analysis', 'Recovery Council'
];

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

async function checkRouteForTitanFeatures(route) {
  try {
    const url = `${FRONTEND_URL}${route.path}`;
    const response = await makeRequest(url);

    if (response.statusCode !== 200) {
      return {
        route: route.description,
        status: 'FAIL',
        statusCode: response.statusCode,
        titanFeatures: [],
        issues: [`HTTP ${response.statusCode} - Route not accessible`]
      };
    }

    // Check for TITAN-OS keywords in the HTML
    const html = response.data.toLowerCase();
    const foundFeatures = TITAN_OS_KEYWORDS.filter(keyword =>
      html.includes(keyword.toLowerCase())
    );

    // Specific checks for each route
    const issues = [];
    const criticalChecks = {
      '/': ['TITAN-OS', 'War Room', 'AI Agents'],
      '/login': ['TITAN-OS', 'God-Level', 'AI Agents'],
      '/register': ['TITAN-OS', 'AI Agents', 'Voice Assistant'],
      '/profile-setup': ['TITAN-OS', 'AI Agents', 'Biomechanics'],
      '/dashboard': ['Command Center', 'TARS-D', 'Biomechanics'],
      '/titan-demo': ['TITAN-OS', 'Interactive Demo']
    };

    const requiredFeatures = criticalChecks[route.path] || [];
    const missingFeatures = requiredFeatures.filter(feature =>
      !foundFeatures.includes(feature)
    );

    if (missingFeatures.length > 0) {
      issues.push(`MISSING CRITICAL FEATURES: ${missingFeatures.join(', ')}`);
    }

    if (foundFeatures.length === 0) {
      issues.push('NO TITAN-OS FEATURES DETECTED - Page shows old content');
    }

    return {
      route: route.description,
      status: issues.length === 0 ? 'PASS' : 'FAIL',
      statusCode: response.statusCode,
      titanFeatures: foundFeatures,
      issues: issues,
      htmlLength: response.data.length
    };

  } catch (error) {
    return {
      route: route.description,
      status: 'ERROR',
      statusCode: null,
      titanFeatures: [],
      issues: [`Request failed: ${error.message}`]
    };
  }
}

async function runFinalVerification() {
  console.log('🔥 RUTHLESS TITAN-OS FEATURE VERIFICATION');
  console.log('='.repeat(80));
  console.log('Ensuring EVERY page shows TITAN-OS features...\n');

  const results = {
    timestamp: new Date().toISOString(),
    routes: [],
    summary: {
      total: CRITICAL_ROUTES.length,
      pass: 0,
      fail: 0,
      error: 0,
      successRate: 0
    }
  };

  console.log('📊 CHECKING CRITICAL ROUTES FOR TITAN-OS FEATURES');
  console.log('-'.repeat(80));

  for (const route of CRITICAL_ROUTES) {
    console.log(`🔍 Checking: ${route.description}`);
    const result = await checkRouteForTitanFeatures(route);
    results.routes.push(result);

    console.log(`   Status: ${result.status}`);
    console.log(`   Features Found: ${result.titanFeatures.length}`);
    if (result.titanFeatures.length > 0) {
      console.log(`   ✅ Features: ${result.titanFeatures.slice(0, 3).join(', ')}${result.titanFeatures.length > 3 ? '...' : ''}`);
    }
    if (result.issues.length > 0) {
      console.log(`   ❌ Issues: ${result.issues.join('; ')}`);
    }
    console.log('');
  }

  // Calculate summary
  results.summary.pass = results.routes.filter(r => r.status === 'PASS').length;
  results.summary.fail = results.routes.filter(r => r.status === 'FAIL').length;
  results.summary.error = results.routes.filter(r => r.status === 'ERROR').length;
  results.summary.successRate = (results.summary.pass / results.summary.total * 100).toFixed(1);

  // Print final report
  console.log('📈 FINAL VERIFICATION REPORT');
  console.log('='.repeat(80));
  console.log(`Total Routes: ${results.summary.total}`);
  console.log(`✅ PASS: ${results.summary.pass}`);
  console.log(`❌ FAIL: ${results.summary.fail}`);
  console.log(`🔥 ERROR: ${results.summary.error}`);
  console.log(`📊 Success Rate: ${results.summary.successRate}%`);
  console.log('');

  // Critical issues
  const criticalIssues = results.routes.filter(r => r.status !== 'PASS');

  if (criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES FOUND:');
    criticalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.route}: ${issue.issues.join('; ')}`);
    });
    console.log('');

    console.log('💥 RUTHLESS DIAGNOSIS:');
    console.log('   - If routes are accessible but no TITAN-OS features: Authentication/routing issue');
    console.log('   - If routes return 404: Component import/route definition issue');
    console.log('   - If features missing: Component not rendering or old content cached');
    console.log('');
  }

  // Success conditions
  const allRoutesAccessible = results.routes.every(r => r.statusCode === 200);
  const titanFeaturesPresent = results.routes.some(r => r.titanFeatures.length > 0);
  const criticalRoutesWorking = results.routes.filter(r => ['/', '/login', '/register'].includes(r.path.split('/')[1] || '/')).every(r => r.status === 'PASS');

  console.log('🎯 VERIFICATION RESULTS:');
  console.log(`   ✅ Routes Accessible: ${allRoutesAccessible ? 'YES' : 'NO'}`);
  console.log(`   ✅ TITAN-OS Features Present: ${titanFeaturesPresent ? 'YES' : 'NO'}`);
  console.log(`   ✅ Critical Routes Working: ${criticalRoutesWorking ? 'YES' : 'NO'}`);
  console.log('');

  if (results.summary.successRate >= 90 && allRoutesAccessible && titanFeaturesPresent) {
    console.log('🎉 SUCCESS: TITAN-OS features are VISIBLE and WORKING!');
    console.log('   All routes show TITAN-OS branding and features.');
  } else if (results.summary.successRate >= 70) {
    console.log('⚠️  PARTIAL: Some routes working, features partially visible.');
    console.log('   Check failing routes and ensure authentication flow.');
  } else {
    console.log('💥 FAILURE: TITAN-OS features NOT VISIBLE!');
    console.log('   Major issues with routing, authentication, or component rendering.');
    console.log('   Users will see OLD content, not new TITAN-OS features.');
  }

  console.log('\n' + '='.repeat(80));
  console.log('🔥 RUTHLESS VERIFICATION COMPLETE');
  console.log('='.repeat(80));

  // Save detailed report
  const fs = require('fs');
  const reportPath = './titan-os-visibility-report.json';

  try {
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
  } catch (error) {
    console.log(`\n❌ Failed to save report: ${error.message}`);
  }

  return results;
}

// Run verification if executed directly
if (require.main === module) {
  runFinalVerification().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

module.exports = { runFinalVerification };
