/**
 * loadtest/run_benchmark.js
 * In-process high-concurrency benchmark runner for Phase P8.
 * Simulates 500 concurrent requests against core gym workout routes.
 * Measures p50, p90, p95, p99 latency and verifies p95 < 300ms SLA.
 */

const http = require('http');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/powerlift_dev';

const { app } = require('../apps/api/dist/server');

async function runBenchmark(totalRequests = 500, concurrency = 50) {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Concurrency Benchmark (${totalRequests} requests, concurrency=${concurrency})`);
  console.log(`======================================================\n`);

  const latencies = [];
  let successCount = 0;
  let failCount = 0;

  const startTime = Date.now();
  let completed = 0;

  const runRequest = async (index) => {
    const token = `Bearer dev_mock_loadtest_${index % 20}_athlete_powerlifting`;
    const reqStart = process.hrtime.bigint();

    try {
      // 1. Concurrent e1RM calculation & today workout check
      const res = await request(app)
        .post('/api/v1/analytics/e1rm')
        .set('Authorization', token)
        .send({
          loadKg: 140,
          reps: 5,
          rpe: 8
        });

      const reqEnd = process.hrtime.bigint();
      const durationMs = Number(reqEnd - reqStart) / 1e6;
      latencies.push(durationMs);

      if (res.status === 200) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (err) {
      failCount++;
    } finally {
      completed++;
    }
  };

  // Run in chunks with controlled concurrency pool
  const chunks = [];
  for (let i = 0; i < totalRequests; i += concurrency) {
    const batch = [];
    for (let j = 0; j < concurrency && i + j < totalRequests; j++) {
      batch.push(runRequest(i + j));
    }
    await Promise.all(batch);
  }

  const totalTimeSec = (Date.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);

  const p50 = latencies[Math.floor(latencies.length * 0.50)].toFixed(2);
  const p90 = latencies[Math.floor(latencies.length * 0.90)].toFixed(2);
  const p95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);
  const p99 = latencies[Math.floor(latencies.length * 0.99)].toFixed(2);
  const rps = (totalRequests / totalTimeSec).toFixed(1);
  const errorRate = ((failCount / totalRequests) * 100).toFixed(2);

  console.log(`Benchmark Results:`);
  console.log(`- Total Requests:      ${totalRequests}`);
  console.log(`- Successful:          ${successCount}`);
  console.log(`- Failed:              ${failCount} (${errorRate}%)`);
  console.log(`- Throughput:          ${rps} req/sec`);
  console.log(`- Latency p50:         ${p50} ms`);
  console.log(`- Latency p90:         ${p90} ms`);
  console.log(`- Latency p95:         ${p95} ms (Target: < 300 ms)`);
  console.log(`- Latency p99:         ${p99} ms`);
  console.log(`======================================================\n`);

  if (Number(p95) >= 300) {
    throw new Error(`Latency SLA breached: p95 was ${p95} ms, expected < 300 ms`);
  }

  if (Number(errorRate) >= 1.0) {
    throw new Error(`Error rate SLA breached: was ${errorRate}%, expected < 1%`);
  }

  return { p50, p95, p99, rps, errorRate };
}

if (require.main === module) {
  runBenchmark()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Benchmark failed:', err.message);
      process.exit(1);
    });
}

module.exports = { runBenchmark };
