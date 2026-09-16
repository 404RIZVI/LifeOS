# LifeOS — Build Progress

Status as of this checkpoint. "Done" means real, working code exists and was
syntax-validated (`py_compile` for Python; TypeScript was hand-reviewed but
**not** run through `tsc`, since no package manager has network access in
the build environment — see README "Known Limitations of This Checkpoint").
Nothing here has been executed against a live PostgreSQL/Redis instance yet.

| # | Phase | Status | Notes |
|---|---|---|---|
| 1 | Inspect workspace | Done | Confirmed empty; built from scratch |
| 2 | Project structure | Done | `backend/` (FastAPI) + `frontend/` (Next.js) |
| 3 | Backend foundation | Done | Config, logging, security headers, exception handling |
| 4 | PostgreSQL + SQLAlchemy + Alembic | Done | Cross-dialect UUID type; hand-written initial migration (autogenerate not runnable without network) |
| 5 | Secure authentication | Done | bcrypt, server-side sessions (hashed token in DB), lockout, rate limiting (fail-open if Redis is down) |
| 6 | User/profile system | Done | `GET/PUT /api/v1/profile/` |
| 7 | Frontend design system + shell | Partial | Tailwind CSS variables (dark/light), landing page, login/register pages. No sidebar app-shell yet |
| 8 | Dashboard with real data | Partial | Fetches real profile + today's tasks; no analytics/habit/goal widgets yet |
| 9 | Tasks | Done | Full CRUD, ownership-scoped, pagination (capped at 100/page), views (today/upcoming/overdue/completed), subtasks on create |
| 10 | Goals | Not started | |
| 11 | Habits | Not started | Server-side streak validation is a hard requirement per spec — flagging so it isn't rushed |
| 12 | Calendar | Not started | |
| 13 | Study | Not started | |
| 14 | Finance | Not started | |
| 15 | Career | Not started | |
| 16 | Notes | Not started | |
| 17 | Decisions | Not started | |
| 18 | Notifications | Not started | |
| 19 | Analytics | Not started | |
| 20 | AI Assistant | Not started | Must use controlled tool-calling, never raw SQL, per spec |
| 21 | LifeOS Voice | Not started | Depends on Phase 20 |
| 22 | Security hardening | Partial | Headers, CSRF-relevant SameSite cookies, rate limiting, lockout, secret redaction in logs done. CSRF token strategy for state-changing requests not yet added (currently relying on SameSite=Lax + custom header requirement, see README) |
| 23 | Testing | Partial | Auth + Tasks test suites written (incl. cross-user isolation tests) — **not yet executed**, no Python packages installable in this build environment |
| 24 | Docker/deployment | Partial | Dockerfile + docker-compose written, not built/run here |
| 25 | SEO/accessibility/performance | Partial | Landing page has semantic HTML, labeled forms, reduced-motion CSS; no sitemap/robots.txt/OG tags yet |
| 26 | Documentation | Partial | This file + README |
| 27 | Final production-readiness audit | Not started | Blocked on the above |

## Known gap to fix next: CSRF

SameSite=Lax cookies block CSRF for top-level navigation but state-changing
POST/PUT/DELETE from a malicious cross-site page (e.g. a hidden auto-submit
form or fetch with credentials) is only partially mitigated by SameSite
alone in all browsers. Before production launch, add a double-submit CSRF
token or verify a custom header (e.g. `X-Requested-With`) on all
state-changing routes. Tracked here rather than silently skipped.
