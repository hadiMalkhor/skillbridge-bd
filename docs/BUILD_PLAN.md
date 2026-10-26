# SkillBridge BD — Build Plan

Three parts: **(1) Divide the work · (2) Set up the environment · (3) Prompts and workflow.**
Keep this file in your repo under `docs/BUILD_PLAN.md`. `PROJECT_SPEC.md` and `AGENTS.md` go in the repo root.

---

# PART 1 — DIVIDE THE WORK

## 1.1 Team split (matches the proposal: candidate side / employer side / admin + database)

| | Member A — Candidate | Member B — Employer | Member C — Platform (DB, Auth, Admin) |
|---|---|---|---|
| **Owns folders** | `src/app/candidate/`, `src/app/jobs/`, `src/lib/skills/` | `src/app/employer/`, `src/lib/jobs/` | `prisma/`, `src/lib/auth/`, `src/lib/db.ts`, `middleware.ts`, `src/app/(auth)/`, `src/app/admin/`, `src/lib/reports/` |
| **Features** | Profile, skills, projects, evidence links · job search + filters · job detail · **skill comparison** · apply + track status · report-a-listing form | Organization profile · create / edit / publish / close jobs · applicant list · change application status · status history | Schema + migrations · seed (skills, aliases, demo data, admin) · register / login / logout · role guards · admin report review · deployment |
| **Tests they write** | Unit tests for compare + normalise (most important unit tests in the project) · e2e: candidate flow | e2e: employer flow | e2e: report → admin review · access-control / security tests |
| **Sprint 0 role** | Reviewer | Reviewer | Does the work |

**Everyone shares:** testing, usability sessions, final report. Roles can be swapped among yourselves; the point is that **each person owns separate folders**.

## 1.2 Rules that prevent merge conflicts (important)

1. **Only Member C edits `prisma/schema.prisma`.** If A or B needs a field, they open a GitHub issue; C adds it in a small PR and everyone pulls.
2. Nobody edits another member's owned folders without telling them. Shared UI (`src/components/`) is additive only: add new components, don't rewrite existing ones.
3. `main` is protected. Everything goes through a pull request reviewed by a teammate.
4. Pull `main` into your branch **before** starting every new task.

## 1.3 Sprints (two weeks each, as in the proposal)

Adjust the lengths to your real deadline. Order matters more than dates.

| Sprint | Goal | Member A | Member B | Member C |
|---|---|---|---|---|
| **0** (3–4 days) | Foundation everyone depends on | review | review | Scaffold, schema, seed, auth, role guards, base layout, **first Vercel deploy** |
| **1** | Core data in the system | Candidate profile, skills, projects, evidence linking | Organization profile, job create / edit / publish / close | Admin shell, `/admin/reports` list, dashboard nav per role |
| **2** | The main loop works end to end | Job search + filters, job detail, **skill comparison**, apply | Applicant list, status updates | Support A and B with schema changes; apply/report rules; seed more jobs |
| **3** | Trust + should-haves | Application tracking page, report form | Deadline handling, status history | Report review + outcomes; REMOVAL hides job |
| **4** | Quality | Unit tests, candidate e2e, responsive pass | Employer e2e, UI polish | Security tests, final deploy, docs |
| After | Usability testing (10–15 people, SUS), fixes, final report | all | all | all |

**Could-haves** (email notifications, saved jobs, dashboard summaries): only after Sprint 4, and only if time remains.

## 1.4 GitHub setup for the team
- One repo `skillbridge-bd`. Add teammates as collaborators.
- Branch names: `feat/candidate-profile`, `feat/employer-jobs`, `fix/job-filter-bug`.
- GitHub Projects (Kanban): columns **Backlog → In progress → In review → Done**. One card per prompt/task below.
- Branch protection on `main`: require a pull request before merging.

---

# PART 2 — SET UP THE ENVIRONMENT

## 2.1 Accounts to create (all have free tiers)
1. **GitHub** — repo for the team.
2. **Neon** (neon.tech) — free PostgreSQL. Each member can use their own dev database branch/project, or share one dev DB (simpler: one DB per member to avoid migration clashes).
3. **Vercel** — connect with your GitHub account.

## 2.2 Software on every member's laptop
- **Node.js LTS** (`node -v` should print a current LTS version) and npm
- **Git** (`git --version`)
- **Antigravity IDE** (already installed) — sign in with your Google account
- Optional: Postman (API checks), a PostgreSQL GUI like TablePlus/DBeaver

## 2.3 Create the project (Member C, once)

```bash
npx create-next-app@latest skillbridge-bd --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd skillbridge-bd

# runtime dependencies
npm install @prisma/client zod bcryptjs next-auth
# dev dependencies
npm install -D prisma @types/bcryptjs tsx vitest @playwright/test
npx playwright install

# database
npx prisma init
```

Notes:
- Prisma and Auth.js change between major versions. The generated `prisma init` output and the official docs for the **installed** version win over anything in this plan. `AGENTS.md` already tells the agent to check docs.
- Accept the `create-next-app` defaults for anything not listed.

Then:
1. Copy `PROJECT_SPEC.md` and `AGENTS.md` into the repo root, and this file into `docs/`.
2. Make sure `.gitignore` contains `.env` (create-next-app does this).
3. Create `.env.example`:
   ```
   DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
   DIRECT_URL="postgresql://user:password@host/db?sslmode=require"
   AUTH_SECRET="generate-with: npx auth secret"
   ```
4. Put the real values in `.env` (Neon gives a *pooled* and a *direct* connection string; use direct for migrations if Prisma asks for it).
5. Add scripts to `package.json`: `"test": "vitest run"`, `"test:e2e": "playwright test"`, `"db:seed": "tsx prisma/seed.ts"`.
6. `git init`, first commit, create the GitHub repo, push to `main`.
7. Teammates: `git clone`, `npm install`, create their own `.env`, then `npm run dev` → http://localhost:3000.

## 2.4 Open it in Antigravity
1. File → Open Folder → the repo.
2. Antigravity reads `AGENTS.md` in the repo root automatically (supported in recent versions; if your build doesn't, create `.agent/rules/project.md` and paste the same content, or start each chat with "read AGENTS.md and PROJECT_SPEC.md"). Rule files have a 12,000-character limit, which the provided `AGENTS.md` fits within.
3. Use the **Agent panel** for tasks. Use planning mode for big prompts and fast mode for small fixes.

## 2.5 Free-tier habits that save your quota
- **One prompt = one conversation.** Start a fresh agent chat for each prompt so context stays small.
- Never ask for "the whole app". Use the prompts below in order.
- Do the boring things yourself (commands, installs, git, copying files).
- When the quota runs out, stop, commit, and continue after the reset. Nothing is lost because the spec, rules and Git hold the state.
- Bring tricky problems (schema design, auth bugs, failing tests) to Claude here instead of burning agent quota.

## 2.6 Definition of done for every task
`npm run lint` passes · `npx tsc --noEmit` passes · `npm run test` passes · you clicked through the feature in the browser as the right role · committed on your branch · PR opened.

---

# PART 3 — PROMPTS AND WORKFLOW

## 3.1 The loop (repeat for every prompt)
1. `git checkout main && git pull`, then `git checkout -b feat/<name>`
2. Open a **new** agent chat in Antigravity
3. Paste the prompt (fill in anything in `[brackets]`)
4. Read the agent's plan; correct it if it strays outside your folders or the spec
5. Let it build; run `npm run dev` and test it yourself
6. Paste any error back to the agent (or to Claude here)
7. Run lint / tsc / tests, commit, push, open PR
8. Teammate reviews and merges, then everyone pulls

## 3.2 Prompt template (use for any new task)

```
Read PROJECT_SPEC.md and AGENTS.md first.
TASK: [one sentence]
AREA (only edit these paths): [folders]
DETAILS: [bullet list, copied from the spec]
DONE WHEN: [observable result, e.g. "a candidate can add a skill and see it listed"]
First give a short plan (files you will create/change). Then implement.
At the end, run lint, tsc and tests, and report results plus how I can verify it manually.
```

## 3.3 The prompts

### SPRINT 0 — Member C

**P0.1 — Prisma schema**
```
Read PROJECT_SPEC.md and AGENTS.md first.
TASK: Create the complete Prisma schema from section 4 of the spec, and the first migration.
AREA: prisma/ and src/lib/db.ts
DETAILS: all entities, enums, relations, unique constraints and indexes from the spec; Prisma client singleton in src/lib/db.ts. Follow the docs of the installed Prisma version for setup.
DONE WHEN: `npx prisma migrate dev` succeeds against my Neon database and `npx prisma studio` shows every table.
Give a short plan first, wait for my OK, then implement.
Also: this project uses Prisma 7. Open the prisma config file in the project root, make sure it loads .env (import "dotenv/config") and points the datasource at DATABASE_URL, and set up the Prisma client with the driver adapter that the installed Prisma 7 docs require for PostgreSQL. Follow the current docs, not older examples.
```

**P0.2 — Seed script**
```
TASK: Create prisma/seed.ts (run with `npm run db:seed`).
DETAILS: ~60 skills for tech/digital jobs with aliases (e.g. JavaScript: js; React: reactjs, react.js; PostgreSQL: postgres, psql; Python; SQL; Figma; Git; Docker; Node.js; TypeScript; Tailwind CSS; Excel; Digital Marketing; SEO; Content Writing; Graphic Design...). 1 admin user (credentials from env vars ADMIN_EMAIL / ADMIN_PASSWORD, bcrypt hashed), 2 fictional employers with organizations, 10 fictional published jobs across experience levels, job types, work arrangements, and Bangladesh locations (Dhaka, Chattogram, Cumilla, Sylhet, Remote), each with 3–6 required skills, and 2 demo candidates with skills and projects.
The seed must be safe to run twice (upsert).
DONE WHEN: running it twice produces no errors and no duplicates.
```

**P0.3 — Authentication and roles**
```
TASK: Implement registration, login, logout with Auth.js credentials provider, bcrypt hashing, and role-based access.
AREA: src/lib/auth/, src/lib/validation/auth.ts, src/app/(auth)/, middleware.ts, src/types/
DETAILS: register page lets the user choose CANDIDATE or EMPLOYER (never ADMIN); creating a CANDIDATE also creates an empty CandidateProfile; Zod validation; session contains user id and role; helper functions `requireUser()` and `requireRole(role)` for use in Server Actions and pages; middleware redirects unauthenticated users away from /candidate, /employer, /admin, and wrong-role users to a "not allowed" page. Remember middleware is a convenience only: server-side checks are the real protection.
DONE WHEN: I can register a candidate and an employer, log in/out, and a candidate cannot open /employer or /admin.
Give a plan first.
```

**P0.4 — Layout and navigation**
```
TASK: Build the base layout and navigation.
AREA: src/app/layout.tsx, src/components/
DETAILS: responsive header (logo text "SkillBridge BD"), nav links that change by role (visitor: Jobs, Login, Register; candidate: Jobs, Profile, Applications; employer: My Jobs, Organization; admin: Reports), logout button, footer with a disclaimer line "Skill comparison is informational. It is not a hiring decision." Home page with short intro and "Browse jobs" button. Clean Tailwind design, mobile-first.
DONE WHEN: it looks good at 375px, 768px and 1280px wide for every role.
```

**P0.5 — First deploy (do this one yourself with my steps)**
Push to GitHub → Vercel "Add New Project" → import repo → set env vars (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, plus the Auth.js URL variable if the docs require it) → deploy. Run the migration against the production database from your laptop (`npx prisma migrate deploy` with the production URL), then run the seed once. Ask Claude here if the build fails; paste the Vercel log.

---

### SPRINT 1

**P1.1 — Candidate profile (A)**
```
TASK: Candidate profile page.
AREA: src/app/candidate/profile/, src/lib/validation/candidate.ts
DETAILS: view and edit headline, bio, location, phone (optional), links. Server Action with requireRole("CANDIDATE"), Zod validation, update only the logged-in user's profile. Success and error messages.
DONE WHEN: a candidate edits the profile, refreshes, and sees the saved data; another user cannot change it.
```

**P1.2 — Skills and projects (A)**
```
TASK: Candidate skills and projects management.
AREA: src/app/candidate/skills/, src/app/candidate/projects/, src/lib/skills/
DETAILS: (1) Projects: add / edit / delete with title, description, url, kind (PROJECT or PORTFOLIO). (2) Skills: add skills ONLY by choosing from the controlled skill list (searchable select). Typing an alias like "js" must resolve to the canonical skill via normalise(). Remove skill. Ownership checks on every action.
DONE WHEN: I can add JavaScript by typing "js" and cannot add a skill that is not in the list.
```

**P1.3 — Skill Evidence linking (A)**
```
TASK: Link each candidate skill to one or more projects (Skill Evidence).
AREA: src/app/candidate/skills/
DETAILS: on each skill row show linked projects and an "Add evidence" control that links an existing project; allow unlinking; show a clear badge "Evidenced (n)" or "Declared only". Only the owner can link; the project must belong to the same candidate.
DONE WHEN: linking and unlinking works, badges update, and tampering with ids from another account is rejected.
```

**P1.4 — Organization profile (B)**
```
TASK: Employer organization profile.
AREA: src/app/employer/organization/, src/lib/validation/organization.ts
DETAILS: employer creates and edits organization (name, description, website, location). An employer must have an organization before creating a job; redirect to this page otherwise.
DONE WHEN: creating and editing works and persists.
```

**P1.5 — Job create / edit / publish / close (B)**
```
TASK: Employer job management.
AREA: src/app/employer/jobs/, src/lib/jobs/, src/lib/validation/job.ts
DETAILS: list own jobs with status; create/edit form with title, description, experience level, job type, work arrangement, location, optional deadline, required skills (multi-select from controlled list); buttons Publish, Close, Save as draft. Employers can only touch jobs owned by their organization.
DONE WHEN: an employer creates a job, publishes it, and it appears in the database as PUBLISHED with its required skills.
```

**P1.6 — Admin shell (C)**
```
TASK: Admin area skeleton.
AREA: src/app/admin/
DETAILS: /admin/reports lists reports (status, job title, date) with filter by status; empty state. Admin only.
DONE WHEN: seeded admin can open it; candidate/employer cannot.
```

---

### SPRINT 2

**P2.1 — Job search and filters (A)**
```
TASK: Public job search page /jobs.
AREA: src/app/jobs/, src/lib/jobs/search.ts (create if missing; coordinate with Member B's folder)
DETAILS: only PUBLISHED jobs whose deadline has not passed; keyword search (title and description); filters for skill, job type, location, work arrangement, experience level; filters stored in URL query params; pagination (10 per page); job cards show title, organization, location, arrangement, level, top skills; empty state.
DONE WHEN: combining filters returns correct results from the seed data.
```

**P2.2 — Skill comparison logic + tests (A) — do this BEFORE the UI**
```
TASK: Implement skill normalisation and comparison exactly as in section 5 of the spec.
AREA: src/lib/skills/normalise.ts, src/lib/skills/compare.ts, src/lib/skills/*.test.ts
DETAILS: pure functions, no database access inside them. Vitest tests for: no matches, full match, partial match, aliases, case/whitespace, empty candidate skills, empty job skills, duplicates, evidenced vs declared-only, summary text.
DONE WHEN: `npm run test` passes and every case in the spec is covered.
```

**P2.3 — Job detail + Skill Match panel (A)**
```
TASK: Job detail page with skill comparison.
AREA: src/app/jobs/[id]/, src/components/skill-match.tsx
DETAILS: show full job info and organization. If the viewer is a logged-in candidate, load their skills with evidence counts, call compare(), and show three lists: Matched (with Evidenced / Declared only badge), Missing, Additional, plus the summary sentence. No score. Include the informational disclaimer. Logged-out visitors see a "Log in to compare your skills" prompt. Non-published jobs return 404 unless viewer is owner or admin.
```

**P2.4 — Apply (A)**
```
TASK: Apply to a job.
AREA: src/app/jobs/[id]/, src/lib/applications/
DETAILS: candidate applies with optional cover note; one application per job per candidate (handle duplicate gracefully); cannot apply to closed, removed, draft, or past-deadline jobs; initial status SUBMITTED (also write a status history row if that model exists).
```

**P2.5 — Applicant review (B)**
```
TASK: Employer applicant list and status update.
AREA: src/app/employer/jobs/[id]/applicants/
DETAILS: employer sees applicants for their own job only: name, headline, submitted date, status, link to read-only candidate profile view showing skills with evidence badges and projects; change status among UNDER_REVIEW, SHORTLISTED, REJECTED; write ApplicationStatusHistory on each change.
DONE WHEN: an employer cannot open applicants of another employer's job even by editing the URL.
```

---

### SPRINT 3

**P3.1 — My applications (A)**
```
TASK: Candidate applications page showing each application, job link, current status, and status history timeline.
AREA: src/app/candidate/applications/
```

**P3.2 — Report a listing (A)**
```
TASK: "Report this listing" on the job detail page.
AREA: src/components/report-listing.tsx, src/lib/reports/ (coordinate with Member C)
DETAILS: logged-in users choose a reason (suspicious payment request, misleading information, fake company, discriminatory, other) and optional details; one open report per user per job; confirmation message that says reports are reviewed by admins and are not proof of wrongdoing.
```

**P3.3 — Admin report review (C)**
```
TASK: Admin report detail and outcome recording.
AREA: src/app/admin/reports/, src/lib/reports/
DETAILS: view report and the reported job; set status (OPEN, IN_REVIEW, RESOLVED) and outcome (NO_ACTION, WARNING, REMOVAL) with an admin note; REMOVAL sets Job.status = REMOVED so it disappears from search; record reviewer and timestamp. Use neutral wording: "reviewed", never "verified".
```

**P3.4 — Should-haves (B)**
```
TASK: Deadline handling and status history display.
DETAILS: hide jobs from search after deadline; show "Closed" on detail page; block applying; show status history timeline to employer on each application.
```

---

### SPRINT 4 — Quality

**P4.1 — Playwright e2e (each member for their flow)**
```
TASK: Write Playwright tests for [candidate flow | employer flow | report → admin flow] as described in section "Testing Plan" of the proposal.
AREA: tests/e2e/
DETAILS: use seeded accounts; tests must be independent and reset or use unique data.
```

**P4.2 — Security review (C, with everyone)**
```
TASK: Audit the whole codebase for access-control problems and report them (do not fix silently).
DETAILS: for every Server Action and Route Handler list: required role, ownership check present?, Zod validation present?, any query returning passwordHash? Also try: candidate calling employer actions, employer opening another employer's applicants, editing another user's project via tampered ids. Output a table of findings, then fix in a separate step after I approve.
```

**P4.3 — Responsive and accessibility pass**
```
TASK: Review every page at 375px / 768px / 1280px; fix overflow, tap target size, missing labels, focus states, and color contrast. No new features.
```

**P4.4 — Documentation**
```
TASK: Write README.md: project overview, tech stack, setup steps, env variables, seed accounts, scripts, deploy steps, folder structure, known limitations.
```

## 3.4 When something breaks
Paste to the agent: the exact error text, the file it's in, and "do not change anything else". If two attempts fail, stop, commit your working state, and bring the error to Claude here with the relevant file.

## 3.5 After the build
- Usability test: 10–15 people, task list, record success and time, SUS questionnaire, consent form (per the proposal).
- Screenshot every main screen for the final report. Keep demo accounts and fictional data only.
