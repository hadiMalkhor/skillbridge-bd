# SkillBridge BD — Project Spec

> Source of truth for the build. Derived from the approved IDP proposal (BAIUST, Fall 2026).
> If a request conflicts with this file, stop and ask. Do not add features not listed here.

## 1. What we are building

A responsive full-stack web app that helps early-career job seekers in Bangladesh show skills with
project evidence, find vacancies, and apply. Employers post jobs and review applicants. Admins review
reports on suspicious listings.

**Unique features (the reason this project exists):**
1. **Skill Evidence Profile** — every skill on a candidate profile can be linked to one or more projects / portfolio items.
2. **Explainable Skill Match** — on a job page, show matched / missing / additional skills and which matched skills have evidence. **No hidden score, no AI ranking.**
3. **Listing Report** — users report a job; an admin records an outcome (no action / warning / removal).

## 2. Roles

| Role | Can do |
|---|---|
| CANDIDATE | Register, manage profile, skills, projects, evidence links; search jobs; see skill comparison; apply; track application status; report a listing |
| EMPLOYER | Manage organization profile; create / edit / publish / close jobs; view applicants for **own** jobs; update application status |
| ADMIN | View reports; record outcome + note; (outcome REMOVAL sets the job status to REMOVED) |

Admin accounts are created by seed script only (no public admin signup).

## 3. Tech stack (fixed)

Next.js (App Router) + React + TypeScript · Tailwind CSS (mobile-first) · Route Handlers + Server Actions ·
PostgreSQL (Neon) · Prisma · Auth.js (credentials, bcrypt hashing, JWT/database sessions) · Zod ·
Vitest (unit) · Playwright (e2e) · Vercel (deploy).
Before using any library API, check the **installed version's** current docs; do not rely on memory.

## 4. Data model (Prisma entities)

- **User**: id, email (unique), passwordHash, name, role (CANDIDATE | EMPLOYER | ADMIN), createdAt
- **CandidateProfile**: userId (unique), headline, bio, location, phone? (optional), links
- **Skill**: id, name (unique, canonical), slug (unique)
- **SkillAlias**: alias (unique, lowercase), skillId  — e.g. "js" → JavaScript, "reactjs" → React
- **CandidateSkill**: candidateProfileId, skillId, unique(candidateProfileId, skillId)
- **Project**: candidateProfileId, title, description, url?, kind (PROJECT | PORTFOLIO)
- **SkillEvidence**: candidateSkillId, projectId, unique pair (many-to-many link)
- **Organization**: ownerUserId (unique), name, description, website?, location
- **Job**: organizationId, title, description, experienceLevel (INTERN | ENTRY | JUNIOR | MID | SENIOR),
  jobType (FULL_TIME | PART_TIME | INTERNSHIP | CONTRACT), workArrangement (ONSITE | REMOTE | HYBRID),
  location, deadline?, status (DRAFT | PUBLISHED | CLOSED | REMOVED), createdAt
- **JobSkill**: jobId, skillId, unique pair (required skills)
- **Application**: jobId, candidateProfileId, coverNote?, status (SUBMITTED | UNDER_REVIEW | SHORTLISTED | REJECTED), createdAt, unique(jobId, candidateProfileId)
- **ApplicationStatusHistory** *(Should)*: applicationId, status, changedByUserId, changedAt
- **Report**: jobId, reporterUserId, reason, details?, status (OPEN | IN_REVIEW | RESOLVED), outcome? (NO_ACTION | WARNING | REMOVAL), adminNote?, reviewedByUserId?, createdAt

Add indexes on Job (status, experienceLevel, jobType, workArrangement, location) and on JobSkill.skillId.

## 5. Skill comparison logic (exact behaviour)

Pure TypeScript functions in `src/lib/skills/` with unit tests.

1. **normalise(input)** — trim, lowercase, look up in canonical names + aliases → canonical Skill or `null`. Skills are chosen from the controlled list; free text is never stored.
2. **compare(R, C)** where R = required skill ids of the job, C = candidate skills `{ skillId, evidenceCount }`:
   - matched = R ∩ C, each with `evidenced = evidenceCount >= 1`
   - missing = R − C
   - additional = C − R (informational only)
3. **summary** string, e.g. `You match 4 of 6 required skills; 3 of them are backed by project evidence.`
   - If R is empty: `This job lists no required skills.`
4. No weights, no score, no ranking. Required test cases: no matches, full match, aliases, empty candidate skills, empty job skills, duplicates.

## 6. Pages and routes

Public: `/` · `/jobs` (search + filters) · `/jobs/[id]` · `/login` · `/register`
Candidate: `/candidate/profile` · `/candidate/skills` · `/candidate/projects` · `/candidate/applications`
Employer: `/employer/organization` · `/employer/jobs` · `/employer/jobs/new` · `/employer/jobs/[id]/edit` · `/employer/jobs/[id]/applicants`
Admin: `/admin/reports` · `/admin/reports/[id]`

Job search filters: keyword (title/description), skill, job type, location, work arrangement, experience level. Paginated.
Job detail for a logged-in candidate shows the Skill Match panel and Apply / Report buttons. Logged-out visitors can browse jobs but must log in to apply or compare.

## 7. Security requirements (non-negotiable)

- Passwords hashed with bcrypt; never logged or returned.
- **Authorization is enforced on the server** in every Server Action and Route Handler (role check + ownership check). Middleware is only a convenience redirect.
- A user can only read or edit their own data. Employers see applicants only for jobs their organization owns.
- All input validated with Zod on the server. Prisma only (no raw SQL with user input).
- Never expose `passwordHash` in any query result sent to the client.
- Secrets only in env vars. `.env` is git-ignored; `.env.example` is committed.

## 8. Priorities (MoSCoW)

**Must:** auth, RBAC, candidate profile + Skill Evidence, job posting, job search + filters, skill comparison, applications + status tracking, listing report, admin review.
**Should:** organization profile editing, deadline handling (hide / block apply after deadline), application status history.
**Could (only if everything else is done):** email notifications, saved jobs, dashboard summaries.

## 9. Out of scope (do not build)

AI hiring decisions or hidden ranking · identity / background verification · payments · chat / social feed / forums · mobile app · analytics or enterprise integrations · any claim that an employer or job is verified.

## 10. UX copy rules

- Skill match is explained as information, never as a hiring verdict or proof of competence.
- Report outcomes are described as "reviewed", never "employer verified".
- Use test data only in seeds. Sample companies are fictional.
