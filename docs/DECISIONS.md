# Architecture & Security Decisions Log

## ADR-001: Removal of Unlicensed PDFs and Knowledge Base Purge
- **Date**: 2026-10-02
- **Context**: Code audit revealed unlicensed PDFs from `toaz.info` and `vdoc.pub` ingested into `processed_knowledge.json`.
- **Decision**: Purged all copyrighted PDFs and `processed_knowledge.json`. AI training logic and chat fall back to verified sports science heuristics and direct LLM prompt templates until Phase P5 re-architects the curated, licensed program dataset.
- **Consequences**: Zero legal liability or copyright infringement in production.

## ADR-002: Server-Side Firebase Authentication & Multi-Tenant Isolation
- **Date**: 2026-10-02
- **Context**: Prior API routes accepted client-supplied `:athleteId` and `:coachId` without token verification.
- **Decision**: Enforced `verifyAuth` globally across all non-health `/api/*` routes. Added `requireRole` and `requireSelfOrCoachOf` middleware so athletes can only access their own records and coaches can only access athletes who explicitly approved the relationship.
- **Consequences**: Complete multi-tenant privacy; URL parameter tampering blocked.

## ADR-003: Strict CORS Allowlist
- **Date**: 2026-10-02
- **Context**: Previous CORS allowed any origin containing the substring 'localhost'.
- **Decision**: Replaced substring matching with exact allowlist matching from `ALLOWED_ORIGINS` environment variable. Localhost origins are only allowed when `NODE_ENV !== 'production'`.
- **Consequences**: Prevents DNS rebinding and cross-origin exploitation from subdomains like `localhost.attacker.com`.
