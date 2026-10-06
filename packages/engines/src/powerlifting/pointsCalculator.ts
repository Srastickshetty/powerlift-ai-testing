/**
 * @powerlift/engines/powerlifting/pointsCalculator
 * Powerlifting platform coefficient formulas: DOTS, IPF GL, and Wilks.
 * Pure deterministic calculations.
 */

export type Gender = 'male' | 'female' | 'men' | 'women';

export interface ScorePointsResult {
  dots: number;
  ipfGl: number;
  wilks: number;
}

export function normalizeGender(gender: Gender): 'male' | 'female' {
  const g = gender.toLowerCase();
  return g === 'female' || g === 'women' ? 'female' : 'male';
}

/**
 * Calculate DOTS points (accepted internationally across USAPL, WRPF, IPF alternatives)
 */
export function calculateDots(bodyweightKg: number, totalKg: number, gender: Gender): number {
  if (bodyweightKg <= 0 || totalKg <= 0) return 0;
  const g = normalizeGender(gender);
  const w = bodyweightKg;

  let denom = 0;
  if (g === 'male') {
    const a = -307.272;
    const b = 24.3724;
    const c = -0.191875;
    const d = 0.000739073;
    const e = -0.000001093;
    denom = a + b * w + c * Math.pow(w, 2) + d * Math.pow(w, 3) + e * Math.pow(w, 4);
  } else {
    const a = -57.96288;
    const b = 13.6175032;
    const c = -0.11266554;
    const d = 0.0005158568;
    const e = -0.0000010706;
    denom = a + b * w + c * Math.pow(w, 2) + d * Math.pow(w, 3) + e * Math.pow(w, 4);
  }

  if (denom <= 0) return 0;
  return Math.round(((500 / denom) * totalKg) * 100) / 100;
}

/**
 * Calculate official IPF GoodLift (GL) Points (Classic / Raw)
 */
export function calculateIpfGl(bodyweightKg: number, totalKg: number, gender: Gender): number {
  if (bodyweightKg <= 0 || totalKg <= 0) return 0;
  const g = normalizeGender(gender);
  const w = bodyweightKg;

  let denom = 0;
  if (g === 'male') {
    const a = 1199.72839;
    const b = 1025.18162;
    const c = 0.00921;
    denom = a - b * Math.exp(-c * w);
  } else {
    const a = 610.32796;
    const b = 1045.59282;
    const c = 0.03048;
    denom = a - b * Math.exp(-c * w);
  }

  if (denom <= 0) return 0;
  return Math.round(((100 / denom) * totalKg) * 100) / 100;
}

/**
 * Calculate classic Wilks Points
 */
export function calculateWilks(bodyweightKg: number, totalKg: number, gender: Gender): number {
  if (bodyweightKg <= 0 || totalKg <= 0) return 0;
  const g = normalizeGender(gender);
  const w = bodyweightKg;

  let denom = 0;
  if (g === 'male') {
    const a = -216.0475144;
    const b = 16.2606339;
    const c = -0.002388645;
    const d = -0.00113732;
    const e = 7.01863e-06;
    const f = -1.291e-08;
    denom = a + b * w + c * Math.pow(w, 2) + d * Math.pow(w, 3) + e * Math.pow(w, 4) + f * Math.pow(w, 5);
  } else {
    const a = 594.31747775582;
    const b = -27.23842536447;
    const c = 0.82112226871;
    const d = -0.00930733913;
    const e = 4.731582e-05;
    const f = -9.054e-08;
    denom = a + b * w + c * Math.pow(w, 2) + d * Math.pow(w, 3) + e * Math.pow(w, 4) + f * Math.pow(w, 5);
  }

  if (denom <= 0) return 0;
  return Math.round(((500 / denom) * totalKg) * 100) / 100;
}

/**
 * Calculate all 3 primary coefficients at once
 */
export function calculateAllPoints(bodyweightKg: number, totalKg: number, gender: Gender): ScorePointsResult {
  return {
    dots: calculateDots(bodyweightKg, totalKg, gender),
    ipfGl: calculateIpfGl(bodyweightKg, totalKg, gender),
    wilks: calculateWilks(bodyweightKg, totalKg, gender)
  };
}
