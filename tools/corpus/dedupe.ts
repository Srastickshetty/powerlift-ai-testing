/**
 * tools/corpus/dedupe.ts
 * Deduplication detector for program corpus.
 * Generates deterministic fingerprints and checks similarity scores.
 */

import { ProgramDsl } from '../../packages/shared/src/schemas/programDsl.schema';
import * as crypto from 'crypto';

export interface DedupeEntry {
  id: string;
  fingerprint: string;
  signature: string;
  dsl: ProgramDsl;
}

export class CorpusDeduplicator {
  /**
   * Generates a structural fingerprint representing the core program architecture.
   */
  static computeFingerprint(dsl: ProgramDsl): string {
    const mainExercises: string[] = [];

    for (const week of dsl.weeks) {
      for (const day of week.days) {
        for (const slot of day.slots) {
          if (slot.slot === 'main') {
            mainExercises.push(slot.exerciseRef.toLowerCase().trim());
          }
        }
      }
    }

    const uniqueMains = Array.from(new Set(mainExercises)).sort().join('|');
    const repr = `${dsl.meta.track}_${dsl.meta.level}_${dsl.meta.days}d_${dsl.meta.weeks}w_${dsl.progression.type}_${uniqueMains}`;
    return crypto.createHash('sha256').update(repr).digest('hex');
  }

  /**
   * Scans a collection of programs and identifies duplicates.
   */
  static findDuplicates(programs: ProgramDsl[]): { unique: ProgramDsl[]; duplicates: { id: string; duplicateOf: string }[] } {
    const seen = new Map<string, string>();
    const unique: ProgramDsl[] = [];
    const duplicates: { id: string; duplicateOf: string }[] = [];

    for (const p of programs) {
      const id = p.meta.id || p.meta.name;
      const fp = this.computeFingerprint(p);

      if (seen.has(fp)) {
        duplicates.push({ id, duplicateOf: seen.get(fp)! });
      } else {
        seen.set(fp, id);
        unique.push(p);
      }
    }

    return { unique, duplicates };
  }
}
