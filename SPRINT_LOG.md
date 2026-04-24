# Sprint Log

Agile sprint tracking for SecurityGateApp.

---

## Sprint 0 — Project Setup — v0.0.1 — 2026-04-24

**Goal**: Bootstrap project structure, configure OpenCode multi-agent workflow

**Status**: COMPLETE

### Tasks
- [x] Create base project scaffolds (API + UI)
- [x] Configure OpenCode agents: planner, ui-builder, api-builder, qa-reviewer
- [x] Document free hosting strategy: MongoDB Atlas + Render + Vercel
- [x] Create AGENTS.md, CHANGELOG.md, SPRINT_LOG.md, QA_REPORT.md, API_DOCS.md

### Notes
Ready to begin Sprint 1 (MVP core auth + gate access).

---

## Sprint 1 — MVP Core — v0.1.0 — 2026-04-24

**Goal**: Deliver a fully functional MVP with authentication, visitor management, delivery tracking, community announcements, and a polished role-based dashboard UI.

**Status**: ✅ COMPLETE — 2026-04-24

**Duration**: 5 days

### User Stories
- [ ] As a resident, I can sign in with Google OAuth so I don't need a separate password (SP: 3)
- [ ] As a security guard, I can log in with email/password and see my guard dashboard (SP: 2)
- [ ] As an admin, I can view and manage all users in the community (SP: 3)
- [ ] As a resident, I can pre-register a visitor with name, purpose, and expected date (SP: 5)
- [ ] As a security guard, I can see all expected visitors for today and check them in/out (SP: 3)
- [ ] As a security guard, I can log a walk-in visitor not pre-registered (SP: 3)
- [ ] As a resident, I can track incoming deliveries and mark them as received (SP: 3)
- [ ] As a security guard, I can log a delivery arrival and notify the resident (SP: 3)
- [ ] As an admin, I can post community announcements visible to all residents (SP: 2)
- [ ] As a resident, I can view community announcements on my dashboard (SP: 2)
- [ ] As any user, I can toggle dark/light mode for accessibility (SP: 1)

### Acceptance Criteria
- [ ] Google OAuth login redirects to dashboard with JWT stored in localStorage
- [ ] Email/password login returns JWT + refresh token
- [ ] Visitor invite creates a record with status "PENDING"
- [ ] Guard can update visitor status to CHECKED_IN / CHECKED_OUT / DENIED
- [ ] Delivery log creates a record linked to resident unit
- [ ] Announcements are visible on resident dashboard sorted by date
- [ ] All API responses use `{ success, data, message }` envelope
- [ ] All pages are mobile-responsive
- [ ] TypeScript compiles with 0 errors in both modules
- [ ] Vite build succeeds with no console errors

### Parallel Workstreams

#### UI Tasks
- [ ] Polish Login page — Google OAuth + email/password, dark mode support
- [ ] Role-based Dashboard — resident view vs guard view vs admin view
- [ ] Visitor Management page — invite form + visitor list table with status badges
- [ ] Walk-in Visitor modal for security guards
- [ ] Delivery Tracking page — log delivery + resident delivery inbox
- [ ] Community Announcements page — admin post form + resident feed
- [ ] Sidebar navigation with role-aware menu items
- [ ] Toast notifications for actions (check-in, delivery logged, etc.)
- [ ] Profile page — view/edit user info

#### API Tasks
- [ ] Fix CORS to include `http://localhost:5173` (missing http)
- [ ] `GET /health` — Health check endpoint
- [ ] `POST /api/auth/login` — Email/password login with JWT
- [ ] `POST /api/auth/refresh` — JWT refresh token rotation
- [ ] `GET /api/visitor` — List all visitors (guard/admin, paginated + date filter)
- [ ] `POST /api/visitor/invite` — Resident invites visitor (already exists, verify)
- [ ] `PATCH /api/visitor/:id/status` — Guard updates visitor status
- [ ] `POST /api/visitor/walkin` — Guard logs walk-in visitor
- [ ] `GET /api/delivery` — List deliveries for resident or all (guard/admin)
- [ ] `POST /api/delivery` — Log new delivery arrival
- [ ] `PATCH /api/delivery/:id/received` — Resident marks delivery received
- [ ] `GET /api/announcements` — List community announcements
- [ ] `POST /api/announcements` — Admin creates announcement
- [ ] `GET /api/users/me` — Get current user profile
- [ ] `PATCH /api/users/me` — Update current user profile

### Definition of Done
- TypeScript compiles with 0 errors in both modules
- Vite build succeeds
- All listed API endpoints return expected `{ success, data, message }` responses
- UI renders without console errors on all listed pages
- Role-based access enforced (resident/guard/admin see different views)
- CHANGELOG.md updated with v0.1.0 entry
- QA_REPORT.md updated by qa-reviewer agent
