# P5 — AI engine (legal, evaluated)
Read: docs/04 fully.
## Tasks
1. Program DSL zod schema in `packages/shared`; interpreter that expands DSL → planned sessions/sets; round-trip tests.
2. Corpus tooling `tools/corpus/`: importer for structured programs (JSON/CSV), licence/source fields mandatory, validator, dedupe. Seed ≥30 original programs per track now (author them from first principles using docs/01), target 150 later. **No scraping of copyrighted text, no pirated PDFs.** If a scraper is added, it must respect robots.txt + ToS, store structured facts only, and be disabled by default.
3. Generator v1 (docs/04 Phase B): athlete vector → retrieve → adapt → safety validate → explain. LLM only for explanation, via JSON-in/text-out template; numbers immutable.
4. Replace `aiProgramBrain.js`, `programClusterer`, KMeans path; keep useful pieces as engines.
5. pgvector knowledge base from original content for "Coach Deva"; tool-calling limited to allowed API actions with user auth; crisis/medical fixed responses; quotas; `ai_events` logging; provider fallback chain.
6. Eval harness: `eval/` with 60 personas, property tests, CI gate, coach-rating sheet template, report output `eval/report.md`.
7. UI: "Why this change" panel, accept/reject, version diff.
## Acceptance checklist
- [ ] Eval: safety 100% pass; property tests ≥95%; human mean ≥4.0 (record)
- [ ] No copyrighted source in repo; `docs/DATA_SOURCES.md` lists every source+licence
- [ ] Every AI output has stored rationale + validator result
