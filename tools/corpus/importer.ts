/**
 * tools/corpus/importer.ts
 * CLI and programmatic importer for structured training programs.
 * Reads JSON/CSV files, enforces legal provenance, validates against DSL schema,
 * runs deduplication, and commits verified programs into the corpus.
 */

import * as fs from 'fs';
import * as path from 'path';
import { CorpusValidator } from './validator';
import { CorpusDeduplicator } from './dedupe';
import { ProgramDsl } from '../../packages/shared/src/schemas/programDsl.schema';

export interface ImportOptions {
  sourcePath: string;
  targetDir?: string;
  dryRun?: boolean;
}

export class CorpusImporter {
  /**
   * Imports a single program or directory of program files.
   */
  static importFromPath(options: ImportOptions) {
    const { sourcePath, dryRun = false } = options;
    const targetDir = options.targetDir || path.resolve(__dirname, '../../corpus');

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source path not found: ${sourcePath}`);
    }

    const files: string[] = [];
    const stat = fs.statSync(sourcePath);
    if (stat.isDirectory()) {
      const entries = fs.readdirSync(sourcePath);
      for (const entry of entries) {
        if (entry.endsWith('.json')) {
          files.push(path.join(sourcePath, entry));
        }
      }
    } else if (sourcePath.endsWith('.json')) {
      files.push(sourcePath);
    }

    console.log(`[IMPORTER] Processing ${files.length} candidate files from ${sourcePath}...`);

    const validPrograms: ProgramDsl[] = [];
    const rejected: Array<{ file: string; errors: string[] }> = [];

    for (const file of files) {
      try {
        const rawContent = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(rawContent);

        // Can handle array of programs or single program
        const candidates: any[] = Array.isArray(parsed) ? parsed : [parsed];

        for (const candidate of candidates) {
          const report = CorpusValidator.validate(candidate);
          if (report.valid) {
            validPrograms.push(candidate);
          } else {
            rejected.push({ file: path.basename(file), errors: report.errors });
          }
        }
      } catch (err: any) {
        rejected.push({ file: path.basename(file), errors: [err.message] });
      }
    }

    // Deduplication check
    const { unique, duplicates } = CorpusDeduplicator.findDuplicates(validPrograms);

    console.log(`[IMPORTER] Results:`);
    console.log(`- Valid & Unique: ${unique.length}`);
    console.log(`- Duplicates:     ${duplicates.length}`);
    console.log(`- Rejected:       ${rejected.length}`);

    if (rejected.length > 0) {
      console.warn(`[IMPORTER] Rejected entries:`, rejected.slice(0, 5));
    }

    if (!dryRun && unique.length > 0) {
      for (const p of unique) {
        const subDir = path.join(targetDir, p.meta.track);
        fs.mkdirSync(subDir, { recursive: true });
        const filePath = path.join(subDir, `${p.meta.id || p.meta.name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(p, null, 2), 'utf8');
      }
      console.log(`[IMPORTER] Successfully imported ${unique.length} programs into ${targetDir}`);
    }

    return { unique, duplicates, rejected };
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const src = args[0] || path.resolve(__dirname, '../../corpus');
  CorpusImporter.importFromPath({ sourcePath: src, dryRun: false });
}
