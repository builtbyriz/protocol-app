# Protocol App — Phased Development Roadmap

**Created:** 2026-02-15
**Status:** Active
**Version:** 0.1.0 → 1.0.0

---

## Project Assessment Summary

A full codebase audit was completed. Key findings:

| Area | Status | Details |
|------|--------|---------|
| Build | FAILING | `pg` driver incompatible with Edge runtime; `fs`/`path`/`stream` errors |
| Tests | NONE | 0 test files, no test framework configured, 0% coverage |
| Security | GAPS | Missing gym membership validation on `/api/chat`, DB URL exposed in health check, incomplete admin auth in server actions, in-memory rate limiter resets on restart |
| Monitoring | NONE | No error tracking, no observability, no structured logging |
| Docs vs Code | MISMATCH | Docs claim GPT-4o hybrid; code uses all-Gemini. Docs claim "production ready"; build fails |
| Dependencies | BROKEN | Missing `openai`, `@langchain/*` imports reference uninstalled packages |
| TypeScript | BYPASSED | `ignoreBuildErrors: true` in next.config.js masks type errors |
| ESLint | BYPASSED | `ignoreDuringBuilds: true` in next.config.js masks lint errors |
| TODOs in Code | 6 | Auth validation gaps in `admin.ts`, token tracking placeholder in chat API |

---

## Milestone 1: Stabilize & Secure (Foundation)

**Goal:** Make the build pass, close security holes, add baseline tests, and set up monitoring. Nothing ships to users until this milestone is complete.

### 1.1 — Fix Build Pipeline

| Task | File(s) | Details |
|------|---------|---------|
| Replace `pg` with `@neondatabase/serverless` | `lib/db.ts`, `package.json` | Swap `pg` Pool + `@prisma/adapter-pg` → `@neondatabase/serverless` Pool + `@prisma/adapter-neon` |
| Remove Node.js webpack fallbacks | `next.config.js` | Delete `webpack.resolve.fallback` and `webpack.externals` hacks |
| Remove or install missing packages | `package.json` | Audit all imports: remove dead `openai`/`@langchain` references or install them |
| Re-enable TypeScript checking | `next.config.js` | Set `typescript.ignoreBuildErrors: false`, fix all type errors |
| Re-enable ESLint checking | `next.config.js` | Set `eslint.ignoreDuringBuilds: false`, fix all lint errors |
| Verify clean build | CI | `npm run build` must exit 0 with no warnings suppressed |

**Acceptance:** `npm run build` passes with TypeScript strict mode and ESLint enabled. No `@ts-ignore` in auth callbacks.

### 1.2 — Security Hardening

| Task | Severity | File(s) | Details |
|------|----------|---------|---------|
| Add gym membership validation to chat API | HIGH | `app/api/chat/[gymId]/route.ts` | Verify authenticated user is a member of the target gym before processing. Currently any logged-in user can query any gym's RAG context |
| Remove DB URL from health check | MEDIUM | `app/api/debug/health/route.ts` | Delete `DATABASE_URL` preview from response. Expose only latency and status |
| Complete admin server action auth | MEDIUM | `app/actions/admin.ts:19,35` | Resolve both TODO comments — verify caller is admin of the target gym before mutations |
| Add rate limiting to auth endpoint | MEDIUM | `app/api/auth/[...nextauth]/route.ts` | Prevent credential stuffing with persistent rate limiting |
| Replace in-memory rate limiter | MEDIUM | `lib/rate-limit.ts` | Use Upstash Redis or Cloudflare KV for distributed rate limiting that survives restarts |
| Sanitize chat input | MEDIUM | `app/api/chat/[gymId]/route.ts` | Add input length limits and basic prompt injection guardrails on user messages |
| Fix @ts-ignore in auth | LOW | `lib/auth.ts:50,58` | Properly type NextAuth session/JWT callbacks instead of suppressing errors |
| Add CSRF protection | LOW | Server actions | Verify Next.js built-in CSRF handling or add explicit tokens |
| Audit .gitignore | LOW | `.gitignore` | Confirm `.env*`, credentials, and secrets are excluded from version control |

**Acceptance:** Penetration test of multi-tenancy boundaries passes. No data leakage across gym tenants. Auth endpoints rate-limited.

### 1.3 — Testing Foundation

| Task | File(s) | Details |
|------|---------|---------|
| Install and configure Vitest | `package.json`, `vitest.config.ts` | Set up Vitest with TypeScript, path aliases, and coverage reporting |
| Unit tests: auth functions | `lib/__tests__/auth.test.ts` | Test password hashing, JWT callbacks, session shape |
| Unit tests: rate limiter | `lib/__tests__/rate-limit.test.ts` | Test window expiry, limit enforcement, key isolation |
| Unit tests: PR detection | `lib/__tests__/pr-detection.test.ts` | Test personal record comparison logic |
| Unit tests: text splitter | `lib/__tests__/text-splitter.test.ts` | Test chunking edge cases (empty input, oversized docs) |
| Integration tests: API routes | `app/api/__tests__/` | Test auth enforcement, input validation, error responses on chat and analyze-form endpoints |
| Integration tests: RBAC | `app/[slug]/__tests__/` | Test admin layout redirects unauthorized users; member layout requires session |
| Multi-tenancy isolation tests | `__tests__/tenancy.test.ts` | Verify Gym A admin cannot access Gym B data through any endpoint |
| Add test scripts to package.json | `package.json` | `test`, `test:watch`, `test:coverage` scripts |
| Set up CI pipeline | `.github/workflows/ci.yml` | Run lint, type-check, test, and build on every push/PR |

**Acceptance:** >60% line coverage on `lib/` directory. All security boundaries have explicit tests. CI pipeline runs on every PR.

### 1.4 — Monitoring & Observability

| Task | File(s) | Details |
|------|---------|---------|
| Add error tracking (Sentry) | `lib/monitoring.ts`, `next.config.js` | Capture unhandled exceptions, API errors, and AI failures with context |
| Add structured logging | `lib/logger.ts` | Replace `console.log` with structured JSON logger (pino or similar) |
| Add API response time tracking | Middleware | Log request duration, status code, and route for all API calls |
| Add AI cost monitoring | `lib/ai/` | Track actual token usage in AIUsage table (currently hardcoded `tokensUsed: 0`) |
| Add health check improvements | `app/api/debug/health/route.ts` | Check DB connectivity, AI provider reachability, R2 bucket access — return structured status without leaking secrets |
| Add uptime monitoring | External | Configure external uptime check (e.g., Cloudflare health checks, UptimeRobot) hitting `/api/debug/health` |
| Environment validation at startup | `lib/env.ts` | Validate all required env vars (DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_AI_API_KEY, etc.) on app boot with clear error messages |

**Acceptance:** Errors surface in Sentry within 60s. AI token costs tracked per request. Structured logs available for all API routes. Startup fails fast with clear message if env vars missing.

---

## Milestone 2: Edge Runtime & Deployment

**Goal:** Complete the Cloudflare Pages deployment pipeline so the app runs on Edge.

### 2.1 — Edge Runtime Migration

| Task | Details |
|------|---------|
| Complete `@neondatabase/serverless` migration | Full replacement of `pg` driver (from 1.1) verified on Edge |
| Replace `pdf-parse` with Edge-compatible PDF extraction | Use `pdfjs-dist` standard build or Cloudflare Workers AI for text extraction |
| Verify Prisma on Edge | Test Prisma + Neon adapter with pgvector queries on Cloudflare Workers runtime |
| Validate R2 integration on Edge | Confirm video upload/signed URL flow works in Cloudflare Pages Functions |
| Update wrangler.toml | Ensure bindings, compatibility flags, and build output directory are correct |

### 2.2 — CI/CD & Deployment

| Task | Details |
|------|---------|
| GitHub Actions → Cloudflare Pages deploy | Auto-deploy on merge to `main` |
| Preview deployments | Deploy PRs to preview URLs for review |
| Database migrations in CI | Run `prisma migrate deploy` as part of deployment pipeline |
| Environment variable management | Use Cloudflare Pages environment variables (not `.env` files) |
| Rollback strategy | Document and test one-click rollback via Cloudflare Pages |

---

## Milestone 3: AI & Feature Completion

**Goal:** Resolve the model architecture, complete RAG pipeline, and ship remaining core features.

### 3.1 — AI Architecture Alignment

| Task | Details |
|------|---------|
| Decide GPT-4o vs Gemini for chat | Resolve doc/code mismatch — choose one model and document why |
| Implement actual token tracking | Replace `tokensUsed: 0` TODO with real usage from AI SDK response metadata |
| Add AI response quality guardrails | Implement output validation, toxicity filtering, and hallucination detection |
| Add conversation memory limits | Cap context window usage to control costs (sliding window or summarization) |

### 3.2 — RAG Pipeline Hardening

| Task | Details |
|------|---------|
| Complete PDF ingestion pipeline | Fix `lib/ingestion.ts` TODOs — reliable text extraction from uploaded gym documents |
| Add DOCX support | Implement document ingestion for Word files (referenced in TODO) |
| Optimize embedding chunking | Tune chunk size and overlap in `lib/text-splitter.ts` for gym content |
| Add RAG evaluation metrics | Measure retrieval relevance and answer quality with test queries |
| Google Drive sync reliability | Add retry logic, error handling, and sync status reporting to cron job |

### 3.3 — Feature Polish

| Task | Details |
|------|---------|
| Video analysis error handling | Add retry logic, better error messages, progress feedback to user |
| Proactive messaging reliability | Ensure absence detection and streak notifications fire correctly |
| Social features testing | Verify fistbumps, leaderboards, and community feed at scale |

---

## Milestone 4: Production Hardening

**Goal:** Scale, performance, and operational readiness for real gym deployments.

### 4.1 — Performance

| Task | Details |
|------|---------|
| Database query optimization | Add indexes for hot paths (member lookups, embedding similarity, workout history) |
| API response caching | Cache static gym data, workout templates, leaderboard snapshots |
| Bundle size optimization | Analyze and reduce First Load JS (currently 87.4 kB shared) |
| Image/asset optimization | Lazy loading, WebP conversion, CDN caching headers |

### 4.2 — Operational Readiness

| Task | Details |
|------|---------|
| Load testing | Simulate concurrent users per gym (target: 100 concurrent per tenant) |
| Database backup strategy | Automated daily backups with point-in-time recovery via Supabase |
| Incident response runbook | Document common failure modes and resolution steps |
| Secrets rotation procedure | Document how to rotate NEXTAUTH_SECRET, API keys, DB credentials |
| GDPR/privacy compliance | Data export, deletion endpoints, privacy policy for gym members |

### 4.3 — White-Label Readiness

| Task | Details |
|------|---------|
| Branding customization testing | Verify colors, logos, AI tone adapt per gym tenant |
| Custom domain mapping | DNS + SSL setup for gym-branded domains via Cloudflare |
| Onboarding flow for new gyms | Admin setup wizard, seed data, knowledge base initialization |
| Multi-tenant billing integration | Usage tracking per gym for SaaS billing |

---

## Milestone 5: Growth Features (v2.0)

**Goal:** Expand the platform with advanced capabilities.

| Feature | Details |
|---------|---------|
| Wearable integration | Apple Watch / Garmin heart rate sync during workouts |
| Nutrition tracking | AI-powered meal logging via photo recognition (GPT-4o Vision) |
| Advanced analytics | Member retention predictions, workout adherence trends, revenue dashboards |
| Mobile app wrapper | Capacitor or similar for App Store / Play Store distribution |
| Multi-language support | i18n for English, Malay, Mandarin (matching target markets) |

---

## Priority & Dependencies

```
Milestone 1 (Stabilize & Secure) ──► MUST complete before anything else
    │
    ├── 1.1 Build Pipeline ──► Unblocks everything
    ├── 1.2 Security ──► Unblocks deployment
    ├── 1.3 Testing ──► Unblocks confidence in changes
    └── 1.4 Monitoring ──► Unblocks production visibility
    │
    ▼
Milestone 2 (Edge & Deploy) ──► Depends on stable build
    │
    ▼
Milestone 3 (AI & Features) ──► Can partially overlap with M2
    │
    ▼
Milestone 4 (Production Hardening) ──► Depends on M2 + M3
    │
    ▼
Milestone 5 (Growth) ──► Depends on stable production
```

---

## Tracking

Progress on each milestone will be tracked via commits on the development branch. Each sub-task should be a single, focused commit with a clear message referencing the milestone (e.g., `fix(security): add gym membership validation to chat API [M1.2]`).
