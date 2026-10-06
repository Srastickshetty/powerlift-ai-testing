/**
 * packages/shared/src/interpreter/programDsl.interpreter.ts
 * Interprets and expands a Program DSL into concrete planned sessions and sets.
 * Also provides reverse-mapping (round-trip) capabilities.
 */

import {
  ProgramDsl,
  DslMeta,
  DslProgression,
  DslScheme,
  ProgramDslSchema
} from '../schemas/programDsl.schema';

export interface InterpreterContext {
  athleteId: string;
  startDate?: Date;
  e1rms?: Record<string, number>;
  roundToKg?: number;
}

export interface ExpandedPlannedSet {
  exerciseRef: string;
  slot: 'main' | 'variation' | 'accessory';
  targetMuscle?: string;
  setNumber: number;
  setType: 'WORKING' | 'WARMUP' | 'TOP_SINGLE' | 'BACKOFF' | 'DROPSET';
  targetWeightKg: number | null;
  targetReps: number | null;
  repRange: [number, number] | null;
  targetRpe: number | null;
  targetRir: number | null;
  restSec: number | null;
  tempo: string | null;
  technique: string;
  notes: string | null;
}

export interface ExpandedPlannedSession {
  athleteId: string;
  week: number;
  day: number;
  date: Date;
  name: string;
  phase: string;
  plannedSets: ExpandedPlannedSet[];
}

export class ProgramDslInterpreter {
  /**
   * Helper to round weight to the nearest increment (default 2.5kg).
   */
  static roundWeight(weightKg: number, roundTo = 2.5): number {
    if (!weightKg || weightKg <= 0) return 0;
    return Math.round(weightKg / roundTo) * roundTo;
  }

  /**
   * Calculates concrete weight in kg from load specification and e1RM.
   */
  static resolveWeightKg(
    scheme: DslScheme,
    e1rms?: Record<string, number>,
    exerciseRef?: string,
    roundTo = 2.5
  ): number | null {
    if (!scheme.load) return null;

    if (scheme.load.type === 'absolute_kg') {
      return this.roundWeight(scheme.load.v, roundTo);
    }

    if (scheme.load.type === 'pct_e1rm') {
      const e1rm = exerciseRef && e1rms ? e1rms[exerciseRef] : undefined;
      if (typeof e1rm === 'number' && e1rm > 0) {
        return this.roundWeight(e1rm * scheme.load.v, roundTo);
      }
    }

    return null;
  }

  /**
   * Expands a high-level ProgramDsl object into concrete planned sessions and sets.
   */
  static expand(dsl: ProgramDsl, context: InterpreterContext): ExpandedPlannedSession[] {
    const validated = ProgramDslSchema.parse(dsl);
    const startDate = context.startDate ? new Date(context.startDate) : new Date();
    const roundTo = context.roundToKg ?? 2.5;
    const e1rms = context.e1rms || {};

    const expandedSessions: ExpandedPlannedSession[] = [];

    for (const week of validated.weeks) {
      for (const day of week.days) {
        // Calculate session scheduled date: (week - 1) * 7 + (day - 1)
        const sessionDate = new Date(startDate);
        const dayOffset = (week.w - 1) * 7 + (day.d - 1);
        sessionDate.setDate(startDate.getDate() + dayOffset);

        const plannedSets: ExpandedPlannedSet[] = [];

        for (const slot of day.slots) {
          const count = slot.scheme.sets;
          const targetWeight = this.resolveWeightKg(slot.scheme, e1rms, slot.exerciseRef, roundTo);

          let setType: ExpandedPlannedSet['setType'] = 'WORKING';
          if (slot.scheme.technique === 'dropset') {
            setType = 'DROPSET';
          } else if (slot.slot === 'main' && slot.scheme.reps === 1 && (slot.scheme.rpe || 0) >= 8) {
            setType = 'TOP_SINGLE';
          }

          for (let s = 1; s <= count; s++) {
            plannedSets.push({
              exerciseRef: slot.exerciseRef,
              slot: slot.slot,
              targetMuscle: slot.targetMuscle,
              setNumber: plannedSets.length + 1,
              setType,
              targetWeightKg: targetWeight,
              targetReps: slot.scheme.reps ?? null,
              repRange: slot.scheme.repRange ?? null,
              targetRpe: slot.scheme.rpe ?? null,
              targetRir: slot.scheme.rir ?? null,
              restSec: slot.scheme.restSec ?? null,
              tempo: slot.scheme.tempo ?? null,
              technique: slot.scheme.technique,
              notes: slot.scheme.notes ?? null
            });
          }
        }

        expandedSessions.push({
          athleteId: context.athleteId,
          week: week.w,
          day: day.d,
          date: sessionDate,
          name: day.name,
          phase: week.phase,
          plannedSets
        });
      }
    }

    return expandedSessions;
  }

  /**
   * Reconstitutes a valid ProgramDsl from expanded sessions and meta.
   */
  static collapse(
    sessions: ExpandedPlannedSession[],
    meta: DslMeta,
    progression: DslProgression
  ): ProgramDsl {
    const weekMap = new Map<number, { phase: any; daysMap: Map<number, { name: string; sets: ExpandedPlannedSet[] }> }>();

    for (const s of sessions) {
      if (!weekMap.has(s.week)) {
        weekMap.set(s.week, { phase: s.phase, daysMap: new Map() });
      }
      const wEntry = weekMap.get(s.week)!;
      wEntry.daysMap.set(s.day, { name: s.name, sets: s.plannedSets });
    }

    const weeks: ProgramDsl['weeks'] = [];

    for (const [w, wData] of Array.from(weekMap.entries()).sort((a, b) => a[0] - b[0])) {
      const days: ProgramDsl['weeks'][0]['days'] = [];

      for (const [d, dData] of Array.from(wData.daysMap.entries()).sort((a, b) => a[0] - b[0])) {
        // Group consecutive sets of the same exercise and slot
        const slots: ProgramDsl['weeks'][0]['days'][0]['slots'] = [];
        let currentGroup: ExpandedPlannedSet[] = [];

        for (const set of dData.sets) {
          if (
            currentGroup.length > 0 &&
            (currentGroup[0].exerciseRef !== set.exerciseRef || currentGroup[0].slot !== set.slot)
          ) {
            slots.push(this.groupToSlot(currentGroup));
            currentGroup = [];
          }
          currentGroup.push(set);
        }
        if (currentGroup.length > 0) {
          slots.push(this.groupToSlot(currentGroup));
        }

        days.push({
          d,
          name: dData.name,
          slots
        });
      }

      weeks.push({
        w,
        phase: wData.phase,
        days
      });
    }

    const result: ProgramDsl = {
      meta,
      progression,
      weeks
    };

    return ProgramDslSchema.parse(result);
  }

  private static groupToSlot(sets: ExpandedPlannedSet[]): ProgramDsl['weeks'][0]['days'][0]['slots'][0] {
    const first = sets[0];
    const scheme: DslScheme = {
      sets: sets.length,
      technique: first.technique as any
    };

    if (first.targetReps) scheme.reps = first.targetReps;
    if (first.repRange) scheme.repRange = first.repRange;
    if (first.targetRpe) scheme.rpe = first.targetRpe;
    if (first.targetRir) scheme.rir = first.targetRir;
    if (first.restSec) scheme.restSec = first.restSec;
    if (first.tempo) scheme.tempo = first.tempo;
    if (first.notes) scheme.notes = first.notes;

    if (first.targetWeightKg) {
      scheme.load = {
        type: 'absolute_kg',
        v: first.targetWeightKg
      };
    }

    return {
      slot: first.slot,
      targetMuscle: first.targetMuscle,
      exerciseRef: first.exerciseRef,
      scheme
    };
  }
}
