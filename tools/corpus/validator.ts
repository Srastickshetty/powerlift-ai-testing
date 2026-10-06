/**
 * tools/corpus/validator.ts
 * Rigorous validator for candidate program DSL files.
 * Enforces schema compliance, mandatory licence & source provenance,
 * track validity, and sports science structural consistency.
 */

import { ProgramDsl, ProgramDslSchema } from '../../packages/shared/src/schemas/programDsl.schema';

export interface ValidationReport {
  valid: boolean;
  programId?: string;
  name?: string;
  track?: string;
  errors: string[];
  warnings: string[];
}

const BANNED_SOURCE_SUBSTRINGS = [
  'toaz.info',
  'vdoc.pub',
  'libgen',
  'pirate',
  'scraped',
  'leaked'
];

export class CorpusValidator {
  /**
   * Validates a candidate raw JSON program against ProgramDsl schema and legal requirements.
   */
  static validate(raw: unknown): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Zod schema validation
    const parsed = ProgramDslSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        valid: false,
        errors: parsed.error.issues.map((i) => `[${i.path.join('.')}]: ${i.message}`),
        warnings
      };
    }

    const dsl = parsed.data;

    // 2. Legal provenance check
    const sourceLower = (dsl.meta.source || '').toLowerCase();
    for (const banned of BANNED_SOURCE_SUBSTRINGS) {
      if (sourceLower.includes(banned)) {
        errors.push(`ILLEGAL_SOURCE: Source contains prohibited copyright/piracy reference: "${banned}"`);
      }
    }

    if (!dsl.meta.licence || dsl.meta.licence.trim().length === 0) {
      errors.push('MANDATORY_FIELD_MISSING: meta.licence must be specified.');
    }

    // 3. Structural checks
    if (dsl.weeks.length !== dsl.meta.weeks) {
      warnings.push(`Week count mismatch: meta declares ${dsl.meta.weeks} weeks, but array has ${dsl.weeks.length}`);
    }

    for (const week of dsl.weeks) {
      if (week.days.length !== dsl.meta.days) {
        warnings.push(`Week ${week.w} has ${week.days.length} days, but meta declares ${dsl.meta.days} days/week`);
      }

      for (const day of week.days) {
        if (!day.slots || day.slots.length === 0) {
          errors.push(`Week ${week.w} Day ${day.d} has no exercise slots.`);
        }

        // Slot checks
        for (const slot of day.slots) {
          if (!slot.exerciseRef) {
            errors.push(`Week ${week.w} Day ${day.d} has slot missing exerciseRef`);
          }
          if (slot.scheme.sets <= 0) {
            errors.push(`Week ${week.w} Day ${day.d} slot ${slot.exerciseRef} has invalid sets (${slot.scheme.sets})`);
          }

          // Track specific consistency
          if (dsl.meta.track === 'powerlifting' && slot.slot === 'main') {
            if (!slot.scheme.load && !slot.scheme.rpe) {
              warnings.push(`PL main slot ${slot.exerciseRef} (W${week.w}D${day.d}) has neither % load nor target RPE`);
            }
          }

          if (dsl.meta.track === 'bodybuilding' && !slot.targetMuscle && !slot.scheme.repRange) {
            warnings.push(`BB slot ${slot.exerciseRef} (W${week.w}D${day.d}) should specify targetMuscle and repRange`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      programId: dsl.meta.id || dsl.meta.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: dsl.meta.name,
      track: dsl.meta.track,
      errors,
      warnings
    };
  }
}
