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

---

## Sprint 2 — Community Modules — v0.2.0 — 2026-04-26

**Goal**: Build all remaining empty modules — Profile, Admin Panel, Complaints, SOS Emergency, Payments, Staff Management, Amenity Booking, Events & Polls, and Notifications

**Status**: IN PROGRESS

**Duration**: 5 days

### User Stories
- [ ] As a user, I can view and edit my profile (name, phone, unit) (SP: 2)
- [ ] As an admin, I can view all residents and change their roles (SP: 3)
- [ ] As an admin, I can view all staff members and manage them (SP: 3)
- [ ] As a resident, I can raise a complaint and track its status (SP: 3)
- [ ] As an admin, I can view and resolve complaints (SP: 3)
- [ ] As a resident, I can trigger an SOS emergency alert (SP: 5)
- [ ] As a security guard, I can see active SOS alerts on their dashboard (SP: 3)
- [ ] As a resident, I can view my payment history and pending dues (SP: 3)
- [ ] As an admin, I can record payments for residents (SP: 2)
- [ ] As a resident, I can book a community amenity (pool, gym, hall) (SP: 5)
- [ ] As an admin, I can manage amenity slots and approve bookings (SP: 3)
- [ ] As a resident, I can RSVP to community events (SP: 2)
- [ ] As an admin, I can create and manage events and polls (SP: 3)
- [ ] As a user, I can see my unread notifications (SP: 2)

### Parallel Workstreams

#### API Tasks
- [ ] `GET/PATCH /api/users/me` — profile (already exists, verify)
- [ ] `GET /api/admin/users` — list all users with role filter
- [ ] `PATCH /api/admin/users/:id/role` — change user role
- [ ] `GET/POST /api/complaints` — list + create complaints
- [ ] `PATCH /api/complaints/:id/status` — admin resolves complaint
- [ ] `GET/POST /api/sos` — list + trigger SOS alerts
- [ ] `PATCH /api/sos/:id/resolve` — guard resolves SOS
- [ ] `GET/POST /api/payments` — list + record payments
- [ ] `GET/POST /api/amenities` — list amenities + create booking
- [ ] `PATCH /api/amenities/bookings/:id/status` — approve/reject booking
- [ ] `GET/POST /api/events` — list + create events
- [ ] `POST /api/events/:id/rsvp` — resident RSVPs
- [ ] `GET/POST /api/polls` — list + create polls
- [ ] `POST /api/polls/:id/vote` — resident votes
- [ ] `GET /api/notifications` — user notifications
- [ ] `PATCH /api/notifications/:id/read` — mark as read

#### UI Tasks
- [ ] Profile page — view/edit name, phone, unit, avatar
- [ ] Admin Panel page — user table with role management
- [ ] Staff page — staff list with contact info
- [ ] Complaints page — resident raise + admin resolve
- [ ] SOS page — big emergency button + active alerts list
- [ ] Payments page — resident dues + payment history
- [ ] Amenity page — booking calendar + slot management
- [ ] Events page — event cards + RSVP button
- [ ] Polls page — active polls with vote UI
- [ ] Notifications page — unread/read notification feed
- [ ] Update App.tsx with all new routes
- [ ] Update SideNav with all new links

### Definition of Done
- TypeScript compiles with 0 errors
- Vite build succeeds
- All new API endpoints return `{ success, data, message }`
- All 10 new pages render without errors
- Deployed to Vercel + Render
- CHANGELOG.md updated with v0.2.0

---

## Sprint 2 (Hotfix) — Build Stabilisation — v0.2.0 — 2026-04-28

**Goal**: Resolve all TypeScript, ESLint, and runtime bugs blocking a clean build in both modules.

**Status**: ✅ COMPLETE — 2026-04-28

### Tasks Completed
- [x] Fix `auth.middleware.ts` — JWT extraction, envelope format, try/catch
- [x] Fix `visitor.controller.ts` filename (leading space bug)
- [x] Fix `visitor.routes.ts` import path
- [x] Rewrite `resident.controller.ts` — real DB queries, consistent format
- [x] Add `updateProfile` to `user.controller.ts` + route
- [x] Allow all roles on `/api/resident/dashboard`
- [x] Add `build`, `typecheck`, `start` scripts to API `package.json`
- [x] Add `render.yaml` for Render.com deployment
- [x] Add API `.env.example`
- [x] Update `AuthContext.tsx` — refreshToken support
- [x] Fix `OAuthSuccess.tsx` — read refreshToken from URL
- [x] Fix `src/api/resident.ts` — unwrap API envelope
- [x] Add `/visitor/logs` route to `App.tsx`
- [x] Add `vercel.json` for Vercel SPA routing
- [x] Add UI `.env.example`
- [x] Fix all ESLint errors (0 errors, 0 warnings)
- [x] API `npx tsc --noEmit` → 0 errors
- [x] UI `npm run build` → SUCCESS

---

## Sprint 3 — Full Community Modules — v0.3.0 — 2026-04-29

**Goal**: Complete all community module pages with real data, role-based views, and polished UX.

**Status**: ✅ COMPLETE — 2026-04-29

### Tasks Completed
- [x] Rewrite `visitor.controller.ts` — no `any`, consistent envelope, 5 endpoints
- [x] Add `GET /api/visitor/my` endpoint + route
- [x] Create `seedAll.ts` — seeds all 11 models with realistic data
- [x] Rewrite `VisitorDashboard` — role-based resident vs guard/admin views
- [x] Improve `Dashboard` — quick actions, announcements feed, events timeline
- [x] Improve `ComplaintsPage` — filters, admin resolve modal
- [x] Improve `PaymentsPage` — summary cards, month filter, confirm-pay
- [x] Improve `AmenityPage` — time slot grid, admin approve/reject
- [x] Improve `NotificationsPage` — date grouping, type icons, mark-all-read
- [x] Improve `SOSPage` — pulsing button, confirm modal, auto-refresh
- [x] Improve `CommunityPage` — events RSVP, polls with progress bars
- [x] Improve `StaffPage` — grouped by role, search
- [x] Improve `AdminPage` — inline role change, confirm dialog, stats
- [x] Fix `types/visitor.ts` — all optional fields, added Completed status
- [x] Fix `api/visitor.ts` — typed inviteVisitor, added getMyVisitors
- [x] Fix visitor components — optional checkInTime guards
- [x] API `npx tsc --noEmit` → 0 errors
- [x] UI `npm run lint` → 0 errors
- [x] UI `npm run build` → SUCCESS (4.2MB, 10.08s)

---

## Sprint 4 — v0.4.0 — 2026-04-30
**Goal**: Add SUPERUSER role with full platform access and live role impersonation
**Duration**: 1 day

### User Stories
- [x] As a superuser, I can access every page and endpoint without role restrictions (SP: 3)
- [x] As a superuser, I can switch my active role to see the app as any other role (SP: 5)
- [x] As a superuser, I can promote any user to superuser from the Admin panel (SP: 2)
- [x] As an admin, I can see platform-wide user stats on the Admin page (SP: 2)

### Acceptance Criteria
- [x] `UserRole.SUPERUSER` exists in both API model and UI types
- [x] `authorizeRoles` middleware short-circuits for SUPERUSER
- [x] `POST /api/admin/switch-role` issues a new JWT with `activeRole`
- [x] `RoleSwitcher` component visible only to superusers in NavBar
- [x] UserMenu shows role badge + crown icon for superuser
- [x] AdminPage shows platform stats banner for superuser
- [x] Seed script creates `super@gateapp.com / Super@123`
- [x] TypeScript 0 errors, build SUCCESS

### Files Changed
**API:**
- `src/models/user.model.ts` — added SUPERUSER + activeRole field
- `src/middlewares/role.middleware.ts` — SUPERUSER bypass + effectiveRole
- `src/middlewares/auth.middleware.ts` — pass activeRole through JWT
- `src/utils/jwt.ts` — activeRole in payload
- `src/controllers/admin.controller.ts` — switchActiveRole + getAdminStats
- `src/routes/admin.routes.ts` — new endpoints
- `src/controllers/amenity|complaint|payment|sos.controller.ts` — effectiveRole
- `src/scripts/seedAll.ts` — superuser seed account
- `src/types/express.d.ts` — global Express.User type

**UI:**
- `src/types/Auth.ts` — superuser role added
- `src/context/AuthContext.tsx` — isSuperuser, effectiveRole, switchRole
- `src/components/ui/layout/RoleSwitcher.tsx` — NEW component
- `src/components/ui/layout/NavBar.tsx` — RoleSwitcher added
- `src/components/ui/layout/UserMenu.tsx` — role badge + crown
- `src/components/ui/Dashboard/WelcomeBanner.tsx` — superuser greeting
- `src/page/Admin/AdminPage.tsx` — stats panel + superuser role assignment
- `src/api/admin.ts` — getAdminStats()

### Definition of Done ✅
- TypeScript compiles with 0 errors ✅
- Vite build succeeds ✅
- API compiled to dist/ ✅
- CHANGELOG updated ✅

---

## Sprint 5 — v0.5.0 — 2026-04-30
**Goal**: Implement all industry-standard security gate & community management features per product requirements
**Duration**: 1 day

### User Stories
- [x] As a resident, I can invite a visitor and share a QR gate pass + OTP for entry (SP: 5)
- [x] As a resident, I can approve my visitor's entry by entering their OTP in the app (SP: 3)
- [x] As a guard, I can verify a visitor's OTP at the gate before allowing entry (SP: 3)
- [x] As a guard, I can capture a visitor's photo at check-in (SP: 2)
- [x] As a resident, I can register domestic help and generate a vendor pass QR (SP: 3)
- [x] As a guard, I can log staff check-in/out with health status and temperature (SP: 3)
- [x] As a guard/admin, I can view a real-time gate dashboard with live activity feed and peak hours (SP: 5)
- [x] As a resident, I can post buy/sell/rent/lost-found items on the community feed (SP: 3)
- [x] As a guard, I can log incoming deliveries; resident approves/rejects remotely (SP: 3)
- [x] Amenity booking rejects duplicate time-slot bookings with 409 conflict (SP: 2)

### New Files
**API:** staff.model.ts, attendanceLog.model.ts, gateLog.model.ts, communityFeed.model.ts,
        staff.controller.ts, gate.controller.ts, communityFeed.controller.ts,
        staff.routes.ts, gate.routes.ts, communityFeed.routes.ts

**UI:** GateDashboardPage.tsx, StaffAttendancePage.tsx, CommunityFeedPage.tsx,
        api/gate.ts, api/staff.ts, api/feed.ts

### Definition of Done ✅
- TypeScript 0 errors (API + UI) ✅
- Vite build SUCCESS ✅
- API compiled to dist/ ✅
- All new routes mounted in app.ts ✅
- All new pages routed in App.tsx ✅
- SideNav updated with new links ✅
- CHANGELOG updated ✅
