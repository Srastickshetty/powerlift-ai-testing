/**
 * packages/shared/test/programDsl.test.js
 * Unit and round-trip tests for Program DSL Schema and Interpreter.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

const {
  ProgramDslSchema,
  ProgramDslInterpreter
} = require('../dist/index');

describe('Program DSL & Interpreter Test Suite', () => {
  const samplePlDsl = {
    meta: {
      name: 'IPF 4-Day Peaking Cycle',
      track: 'powerlifting',
      level: 'intermediate',
      days: 4,
      weeks: 3,
      goal: 'meet_peak',
      source: 'PowerLift Science Team',
      licence: 'CC-BY-4.0',
      description: 'Standard 3-week realization and taper block for competition preparation.'
    },
    progression: {
      type: 'block',
      params: { cycleWeeks: 3 }
    },
    weeks: [
      {
        w: 1,
        phase: 'realization',
        days: [
          {
            d: 1,
            name: 'Squat Heavy & Bench Volume',
            slots: [
              {
                slot: 'main',
                pattern: 'squat',
                exerciseRef: 'Competition Barbell Squat',
                scheme: {
                  sets: 3,
                  reps: 3,
                  load: { type: 'pct_e1rm', v: 0.85 },
                  rpe: 8,
                  restSec: 180,
                  technique: 'straight'
                }
              },
              {
                slot: 'variation',
                pattern: 'bench',
                exerciseRef: 'Pause Bench Press',
                scheme: {
                  sets: 4,
                  reps: 5,
                  load: { type: 'pct_e1rm', v: 0.75 },
                  rpe: 7,
                  restSec: 150,
                  technique: 'pause'
                }
              },
              {
                slot: 'accessory',
                targetMuscle: 'quads',
                exerciseRef: 'Leg Press',
                scheme: {
                  sets: 3,
                  repRange: [8, 12],
                  rir: 2,
                  restSec: 90,
                  technique: 'straight'
                }
              }
            ]
          },
          {
            d: 2,
            name: 'Deadlift Realization',
            slots: [
              {
                slot: 'main',
                pattern: 'deadlift',
                exerciseRef: 'Competition Conventional Deadlift',
                scheme: {
                  sets: 2,
                  reps: 2,
                  load: { type: 'pct_e1rm', v: 0.88 },
                  rpe: 8.5,
                  restSec: 240,
                  technique: 'straight'
                }
              }
            ]
          }
        ]
      }
    ]
  };

  const sampleBbDsl = {
    meta: {
      name: 'Hypertrophy PPL Cycle',
      track: 'bodybuilding',
      level: 'advanced',
      days: 3,
      weeks: 2,
      goal: 'hypertrophy',
      source: 'Natural Bodybuilding Protocol Archive',
      licence: 'MIT',
      description: 'Push-Pull-Legs double progression mesocycle.'
    },
    progression: {
      type: 'double_prog',
      params: { rirClimb: true }
    },
    weeks: [
      {
        w: 1,
        phase: 'accumulation',
        days: [
          {
            d: 1,
            name: 'Push Hypertrophy',
            slots: [
              {
                slot: 'main',
                targetMuscle: 'chest',
                exerciseRef: 'Incline Dumbbell Press',
                scheme: {
                  sets: 3,
                  repRange: [8, 12],
                  rir: 2,
                  tempo: '3-1-0',
                  technique: 'straight'
                }
              },
              {
                slot: 'accessory',
                targetMuscle: 'triceps',
                exerciseRef: 'Cable Tricep Pushdown',
                scheme: {
                  sets: 3,
                  repRange: [12, 15],
                  rir: 1,
                  technique: 'dropset'
                }
              }
            ]
          }
        ]
      }
    ]
  };

  it('Validates Powerlifting DSL schema successfully', () => {
    const parsed = ProgramDslSchema.parse(samplePlDsl);
    assert.strictEqual(parsed.meta.track, 'powerlifting');
    assert.strictEqual(parsed.meta.level, 'intermediate');
    assert.strictEqual(parsed.weeks.length, 1);
  });

  it('Validates Bodybuilding DSL schema successfully', () => {
    const parsed = ProgramDslSchema.parse(sampleBbDsl);
    assert.strictEqual(parsed.meta.track, 'bodybuilding');
    assert.strictEqual(parsed.weeks[0].days[0].slots[1].scheme.technique, 'dropset');
  });

  it('Rejects DSL missing mandatory source or licence', () => {
    const invalid = JSON.parse(JSON.stringify(samplePlDsl));
    delete invalid.meta.source;
    assert.throws(() => ProgramDslSchema.parse(invalid));
  });

  it('Expands DSL into concrete planned sessions and sets with e1RM loads', () => {
    const context = {
      athleteId: 'ath-123',
      startDate: new Date('2026-10-01T00:00:00Z'),
      e1rms: {
        'Competition Barbell Squat': 200,
        'Pause Bench Press': 140,
        'Competition Conventional Deadlift': 250
      },
      roundToKg: 2.5
    };

    const expanded = ProgramDslInterpreter.expand(samplePlDsl, context);

    assert.strictEqual(expanded.length, 2); // 2 days in week 1
    assert.strictEqual(expanded[0].week, 1);
    assert.strictEqual(expanded[0].day, 1);
    assert.strictEqual(expanded[0].plannedSets.length, 10); // 3 squat + 4 bench + 3 leg press

    // Check Squat calculation: 200kg * 0.85 = 170kg
    const squatSet1 = expanded[0].plannedSets[0];
    assert.strictEqual(squatSet1.exerciseRef, 'Competition Barbell Squat');
    assert.strictEqual(squatSet1.targetWeightKg, 170);
    assert.strictEqual(squatSet1.targetReps, 3);
    assert.strictEqual(squatSet1.targetRpe, 8);

    // Check Pause Bench calculation: 140kg * 0.75 = 105kg
    const benchSet1 = expanded[0].plannedSets[3];
    assert.strictEqual(benchSet1.exerciseRef, 'Pause Bench Press');
    assert.strictEqual(benchSet1.targetWeightKg, 105);
    assert.strictEqual(benchSet1.targetReps, 5);

    // Check Leg Press rep range
    const legPressSet = expanded[0].plannedSets[7];
    assert.deepStrictEqual(legPressSet.repRange, [8, 12]);
    assert.strictEqual(legPressSet.targetRir, 2);

    // Check Day 2 Deadlift: 250kg * 0.88 = 220kg
    const deadliftSet = expanded[1].plannedSets[0];
    assert.strictEqual(deadliftSet.targetWeightKg, 220);
    assert.strictEqual(deadliftSet.targetReps, 2);
  });

  it('Round-trip: expands and collapses preserving structure and sets', () => {
    const context = {
      athleteId: 'ath-roundtrip',
      startDate: new Date('2026-10-05T00:00:00Z'),
      e1rms: { 'Competition Barbell Squat': 100, 'Pause Bench Press': 100 },
      roundToKg: 2.5
    };

    const expanded = ProgramDslInterpreter.expand(samplePlDsl, context);
    const collapsed = ProgramDslInterpreter.collapse(
      expanded,
      samplePlDsl.meta,
      samplePlDsl.progression
    );

    assert.strictEqual(collapsed.meta.name, samplePlDsl.meta.name);
    assert.strictEqual(collapsed.weeks.length, samplePlDsl.weeks.length);
    assert.strictEqual(collapsed.weeks[0].days.length, samplePlDsl.weeks[0].days.length);

    // Validate collapsed DSL with zod schema
    const revalidated = ProgramDslSchema.parse(collapsed);
    assert.ok(revalidated);
    assert.strictEqual(revalidated.weeks[0].days[0].slots[0].scheme.sets, 3);
  });
});
