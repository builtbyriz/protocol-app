# Edge Runtime Migration Plan

## Goal
Replace Node.js-only libraries (`pg`, `pdf-parse`) with Edge-compatible alternatives (`@neondatabase/serverless`, `pdf-lib`) to resolve Cloudflare Pages deployment issues without relying on fragile Webpack hacks.

## User Review Required
> [!IMPORTANT]
> **Database Connection String**: The connection string in Cloudflare must be updated to use the pooled connection (port 6543) with `?pgbouncer=true` if not already set. The Neon driver works best with this configuration.

## Proposed Changes

### Dependencies
#### [DELETE]
- `pg`
- `@types/pg`
- `@prisma/adapter-pg`
- `pdf-parse`
- `@types/pdf-parse`

#### [NEW]
- `@neondatabase/serverless`
- `@prisma/adapter-neon`
- `pdf-lib` (already in package.json but verify version/usage)

### Configuration
#### [MODIFY] [next.config.js](file:///c:/Users/irfan/OneDrive/Documents/Protocol%20App/next.config.js)
- Remove complex `webpack.resolve.fallback` (fs, net, tls, etc.).
- Remove `webpack.externals` (dns, crypto, etc.).
- Keep minimal config: `config.resolve.fallback = { 'pg-native': false }`.

### Database Layer
#### [MODIFY] [lib/db.ts](file:///c:/Users/irfan/OneDrive/Documents/Protocol%20App/lib/db.ts)
- Replace `pg` Pool and `PrismaPg` adapter with `Pool` from `@neondatabase/serverless` and `PrismaNeon` adapter.

### Ingestion Layer
#### [MODIFY] [lib/ingestion.ts](file:///c:/Users/irfan/OneDrive/Documents/Protocol%20App/lib/ingestion.ts)
- Implement PDF text extraction using `pdf-lib` (or `pdfjs-dist` if `pdf-lib` is only for creation/modification - *Correction*: `pdf-lib` is mainly for modification. For text extraction on Edge, `pdfjs-dist` is better, but the user explicitly requested `pdf-lib`. I will check if `pdf-lib` supports text extraction. If not, I will stick to the user's request but might need to warn them. *Self-correction*: The user said "Use pdf-lib". I will try to use it, but standard `pdf-lib` doesn't extract text easily. I might need `pdfjs-dist` standard build. However, I will follow the user's explicit instruction first or clarify. Actually, `pdf-lib` is for *manipulation*. `pdfjs-dist` is for *extraction*. The user might be mistaken. I will check `package.json` to see what's available. `pdf-parse` was used for extraction. I will assume the goal is "Edge Compatible PDF Extraction". I'll try to use `pdf-lib` if possible, otherwise I'll use `pdfjs-dist` which is the standard for this.)
- *Refined Plan for PDF*: The user explicitly said "Use pdf-lib". I will check if I can extract text with it. If not, I will use `pdfjs-dist` (which is also Edge compatible) and explain why.

## Verification Plan
### Automated Tests
- Run `npm run build` locally (if possible with edge runtime emulation) or rely on Cloudflare deployment.
- Verify `lib/db.ts` initializes correctly.

### Manual Verification
- Deploy to Cloudflare.
- Check logs for successful build.
- Test "Sync Drive" cron job to verify database insertion and PDF parsing.
