import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Load Test — Gym Peak Hour Concurrency
 * Simulates 500 concurrent lifters logging sets, querying today's workout, and calculating e1RM.
 * Target: p95 latency < 300 ms, error rate < 1%.
 */

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Warm-up ramp
    { duration: '1m', target: 500 },  // Peak gym concurrency (500 users)
    { duration: '30s', target: 0 }    // Cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests must complete below 300ms
    http_req_failed: ['rate<0.01']     // Error rate must remain below 1%
  }
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

export default function () {
  const userId = `vu_athlete_${__VU}`;
  const token = `Bearer dev_mock_${userId}_athlete_powerlifting`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: token
  };

  // 1. Fetch Today's Workout
  const resToday = http.get(`${BASE_URL}/training/today`, { headers });
  check(resToday, {
    'today workout fetched 200': (r) => r.status === 200
  });

  // 2. Pure Calculation Engine Execution: e1RM
  const e1rmPayload = JSON.stringify({
    loadKg: 140,
    reps: 5,
    rpe: 8
  });
  const resE1rm = http.post(`${BASE_URL}/analytics/e1rm`, e1rmPayload, { headers });
  check(resE1rm, {
    'e1rm computed 200': (r) => r.status === 200
  });

  // 3. Log Completed Set
  const setPayload = JSON.stringify({
    clientUuid: `k6_set_${__VU}_${__ITER}_${Date.now()}`,
    exerciseName: 'Competition Squat',
    setType: 'WORKING',
    weightKg: 140,
    reps: 5,
    rpe: 8,
    pain0To10: 0
  });
  const resLog = http.post(`${BASE_URL}/training/sets`, setPayload, { headers });
  check(resLog, {
    'set logged successfully': (r) => r.status === 200 || r.status === 201
  });

  sleep(1);
}
