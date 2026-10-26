# AGENTS.md — SkillBridge BD

Read `PROJECT_SPEC.md` before starting any task. It is the source of truth.

## Stack
Next.js (App Router) · TypeScript (strict) · Tailwind CSS · Prisma + PostgreSQL (Neon) · Auth.js (credentials) · Zod · Vitest · Playwright.
Check the installed version's official docs before using a library API. Do not guess APIs from memory.

## Working rules
1. Do **only** the task in the prompt. Do not add features, pages, or dependencies that were not asked for.
2. Before writing code for a large task, state a short plan (files to create or change) and wait if the task touches the database schema.
3. Only edit files inside the area named in the prompt. If you must change `prisma/schema.prisma`, `src/lib/auth/*`, or `middleware.ts`, say so first and explain why.
4. After finishing, run `npm run lint`, `npx tsc --noEmit`, and `npm run test` (if tests exist). Fix what you broke. Report the results honestly.
5. Never claim something works unless you ran it. If you could not run it, say so.
6. Small, focused changes. No unrelated refactors. No leftover debug code or commented-out blocks.
7. At the end, list: files changed, how to run/verify it manually, and anything left undone.

## Code conventions
- Folder layout: `src/app` (routes), `src/components` (shared UI), `src/lib` (logic: `auth`, `db`, `skills`, `validation`), `prisma/`, `tests/`.
- Business logic lives in `src/lib`, not inside page components. Keep pure functions pure and unit-tested.
- Validate every input with a Zod schema in `src/lib/validation/`. Reuse schemas between forms and server actions.
- Use Server Actions for form mutations and Route Handlers only when an HTTP API is needed.
- One Prisma client singleton in `src/lib/db.ts`.
- Name files in kebab-case, components in PascalCase, and use named exports for non-page components.
- Tailwind only; mobile-first; accessible (labels, focus states, semantic HTML, sufficient contrast).
- Every form shows loading, error, and success states. Every list shows an empty state.

## Security rules (never violate)
- Check role **and ownership** on the server inside every Server Action / Route Handler. Never trust the client or hidden form fields.
- Never return `passwordHash` or other secrets from queries. Use `select` to pick safe fields.
- No raw SQL built from user input. No `dangerouslySetInnerHTML` with user content.
- Secrets live in `.env` (git-ignored). Keep `.env.example` updated with variable names only.
- Admin accounts come from the seed script only.

## Product rules
- No scores, no ranking, no AI hiring decisions. Skill comparison shows matched / missing / additional lists only.
- Never label an employer or job as "verified" or "safe".
- Seed data is fictional.

## Git
- Work on the branch you were given. Never commit to `main`.
- Commit messages: `feat(area): short description`, `fix(area): ...`, `test(area): ...`.
- Do not commit `.env`, `node_modules`, or `.next`.
