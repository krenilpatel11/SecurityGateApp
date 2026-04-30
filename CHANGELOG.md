# Changelog

All notable changes to SecurityGateApp will be documented here.

Format: `## [vX.Y.Z] — YYYY-MM-DD`

---

## [Unreleased]

- OpenCode multi-agent workflow configured with 4 specialized agents
- Agile sprint pipeline: planner → ui-builder + api-builder (parallel) → qa-reviewer
- Free hosting stack defined: MongoDB Atlas + Render.com + Vercel

## [v0.3.0] — 2026-04-29 — Sprint 3: Full Community Modules ✅

### Added — API
- ✅ `GET /api/visitor/my` — resident views all their own invited visitors
- ✅ `src/scripts/seedAll.ts` — comprehensive seed script (5 users, 6 visitors, 5 payments, 5 complaints, 3 announcements, 4 amenities, 3 bookings, 3 events, 2 polls, 2 SOS, 7 notifications)
- ✅ `visitor.controller.ts` fully rewritten — no `any` types, consistent `{ success, data, message }` envelope on all 5 endpoints

### Improved — UI Pages (all fully functional, role-aware, with loading/empty states)
- ✅ `VisitorDashboard` — role-based: resident (invite form + my visitors list) vs guard/admin (full table with check-in/out/deny actions + walk-in modal)
- ✅ `Dashboard` — quick actions row, real announcements feed, upcoming events timeline, colored stats cards
- ✅ `ComplaintsPage` — category filter tabs, status filter, colored badges, admin update/resolve modal with resolution notes
- ✅ `PaymentsPage` — summary cards (due/paid/total), month filter, confirm-pay modal, admin record payment with resident selector
- ✅ `AmenityPage` — amenity cards with capacity badge, visual time slot grid booking modal, admin approve/reject bookings
- ✅ `NotificationsPage` — grouped by date (Today/Yesterday/Earlier), unread count badge, type icons, mark-all-read
- ✅ `SOSPage` — pulsing red SOS button for residents, confirm modal, active alerts with resolve button, auto-refresh 15s
- ✅ `CommunityPage` — events with RSVP tracking, polls with progress bars + vote buttons, admin create modals
- ✅ `StaffPage` — grouped by role (Security/Staff), search, on-duty indicator
- ✅ `AdminPage` — user table with inline role change, confirm dialog, stats row, search

### Fixed — Types
- ✅ `types/visitor.ts` — `checkInTime`, `checkOutTime`, `unit`, `photoUrl`, `invitedBy` all made optional; added `Completed` status
- ✅ `api/visitor.ts` — `inviteVisitor` now accepts `visitDate`/`visitTime` instead of `checkInTime`; added `getMyVisitors`
- ✅ Visitor components — `checkInTime ?? ''` guard on all `new Date()` calls

### Build Status
- API: `npx tsc --noEmit` → ✅ 0 errors
- UI: `npm run lint` → ✅ 0 errors, 0 warnings
- UI: `npm run build` → ✅ SUCCESS (4.2MB bundle, 10.08s)

## [v0.2.0] — 2026-04-28 — Sprint 2: Bug Fixes & Build Stabilisation ✅

### Fixed — API
- ✅ `auth.middleware.ts` rewritten — proper JWT extraction, `{ success, data, message }` envelope, try/catch
- ✅ `visitor.controller.ts` — renamed from ` visitor.controller.ts` (leading space bug fixed)
- ✅ `visitor.routes.ts` — import path corrected
- ✅ `resident.controller.ts` — real DB queries for dashboard counts, consistent response format
- ✅ `user.controller.ts` — added `updateProfile`, consistent envelope
- ✅ `user.routes.ts` — added `PUT /api/users/profile`
- ✅ `resident.routes.ts` — all roles allowed for dashboard (not just RESIDENT)
- ✅ `package.json` — added `build` and `typecheck` scripts, fixed `start` to `node dist/server.js`
- ✅ `render.yaml` — Render.com free-tier deployment config added
- ✅ `.env.example` — API environment variable template added

### Fixed — UI
- ✅ `AuthContext.tsx` — `login()` accepts optional `refreshToken`, stores in localStorage
- ✅ `OAuthSuccess.tsx` — reads both `token` and `refreshToken` from OAuth redirect URL params
- ✅ `src/api/resident.ts` — unwraps `{ success, data }` envelope from API responses
- ✅ `App.tsx` — added `/visitor/logs` route with `VisitorLogs` page
- ✅ `vercel.json` — SPA rewrite rule added for Vercel deployment
- ✅ `.env.example` — UI environment variable template added
- ✅ All ESLint errors resolved (0 errors): `any` types replaced, unused vars removed, fast-refresh directives added
- ✅ `AzureChatBot.tsx` — fixed ref cleanup pattern, removed unused destructured props

### Build Status
- API: `npx tsc --noEmit` → ✅ 0 errors
- UI: `npm run lint` → ✅ 0 errors (1 harmless warning suppressed)
- UI: `npm run build` → ✅ SUCCESS (4.2MB bundle, 11.02s)

--- — Sprint 1: MVP Core

### Added — API
- ✅ Fixed CORS config to include `http://localhost:5173`
- ✅ `GET /health` health check endpoint
- ✅ `POST /api/auth/login` — email/password login with JWT + refresh token
- ✅ `POST /api/auth/refresh` — JWT refresh token rotation
- ✅ `POST /api/auth/logout` — session logout
- ✅ `PATCH /api/visitor/:id/status` — guard updates visitor check-in/out/deny status
- ✅ `POST /api/visitor/walkin` — guard logs walk-in visitor
- ✅ `GET /api/delivery` — guard/admin: all deliveries
- ✅ `POST /api/delivery` — guard logs new delivery arrival
- ✅ `PATCH /api/delivery/:id/received` — resident marks delivery received
- ✅ `GET /api/announcements` — all authenticated users
- ✅ `POST /api/announcements` — admin creates announcement
- ✅ `PATCH /api/announcements/:id` — admin updates announcement
- ✅ `DELETE /api/announcements/:id` — admin deletes announcement
- ✅ `GET /api/users/me` — current user profile
- ✅ `PATCH /api/users/me` — update current user profile
- ✅ `generateRefreshToken` + `verifyRefreshToken` added to JWT utils
- ✅ `Announcement` model created

### Added — UI
- ✅ Login page — Google OAuth + email/password form with error handling
- ✅ Delivery page — resident view (pending + history + mark received) + guard view (log delivery form + all deliveries)
- ✅ Announcements page — feed with pinned support + admin post/delete modal
- ✅ SideNav updated — added Visitors and Deliveries links, removed `any` types
- ✅ App.tsx — added `/delivery` and `/announcements` routes
- ✅ `src/api/announcements.ts` — typed API client for announcements
- ✅ `src/api/delivery.ts` — typed API client for deliveries
- ✅ `src/api/visitor.ts` — extended with `updateVisitorStatus` and `logWalkIn`
- ✅ Fixed TypeScript errors: `JwtPayload.role` now includes `"security"`, unused imports removed

### Build Status
- API: `npx tsc --noEmit` → ✅ 0 errors
- UI: `npm run build` → ✅ SUCCESS (4.1MB bundle, 9.04s)

---

## [v0.0.1] — 2026-04-24

### Added
- Initial project scaffold: `SecurityGateCommunityHub-js-API` (Node/Express/Mongoose)
- Initial project scaffold: `SecurityGateCommunityManegmentUI/gate-community-hub` (React/Vite/Tailwind)
- OpenCode configuration: `opencode.json` with 4 custom agents
- Agent definitions: planner, ui-builder, api-builder, qa-reviewer
- Project documentation: AGENTS.md, CHANGELOG.md, SPRINT_LOG.md, QA_REPORT.md, API_DOCS.md

## [v0.4.0] — 2026-04-30 — Sprint 4: SUPERUSER Role + Cycling Improvement

### Added
- **SUPERUSER role** (`UserRole.SUPERUSER`) — new top-level role that bypasses all `authorizeRoles` checks
- **Role impersonation** — SUPERUSER can act as any role (admin/security/resident/staff) via `POST /api/admin/switch-role`; issues a new JWT with `activeRole` set
- **`GET /api/admin/stats`** — platform-wide user count breakdown (total, residents, security, staff, superusers)
- **`RoleSwitcher` component** — purple pill in the NavBar, only visible to superusers; dropdown to switch active role with live token refresh
- **`UserMenu` role badge** — shows current role with colour-coded badge; superuser shows crown icon + "Acting as X" when impersonating
- **`WelcomeBanner` superuser greeting** — crown icon, role-specific greeting, impersonation hint
- **AdminPage superuser panel** — platform overview stats banner, superuser-only role assignment (can promote to superuser), crown icon on superuser rows
- **`activeRole` in JWT payload** — both `generateToken` and `generateRefreshToken` now embed `activeRole`
- **Global Express user type** — `src/types/express.d.ts` declares `Express.User` with `activeRole?`
- **Seed superuser** — `super@gateapp.com / Super@123` seeded as first user

### Changed
- `role.middleware.ts` — SUPERUSER short-circuits all role checks; other roles use `activeRole ?? role` as effective role
- `auth.middleware.ts` — passes `activeRole` through from JWT to `req.user`
- `admin.controller.ts` — added `switchActiveRole` + `getAdminStats` exports
- `admin.routes.ts` — added `POST /switch-role`, `GET /stats`; both admin + superuser can list/update users
- `amenity/complaint/payment/sos` controllers — use `effectiveRole` instead of raw `user.role` for filter scoping
- `AuthContext` — added `isSuperuser`, `effectiveRole`, `switchRole`, `isSwitchingRole` to context
- `types/Auth.ts` — `JwtPayload.role` and `UserRole` now include `"superuser"`
- `api/admin.ts` — added `getAdminStats()`

### Build
- `npx tsc --noEmit` → 0 errors (API + UI)
- `npm run build` → SUCCESS (UI: 4.2MB, API: compiled to dist/)

## [v0.5.0] — 2026-04-30 — Sprint 5: Industry-Standard Feature Completeness

### Added — API
- **`Staff` model** — name, phone, type (Maid/Driver/Gardener/Cook/etc.), assignedTo, unit, status, vendorPassUrl (QR)
- **`AttendanceLog` model** — daily check-in/out, workedHours, healthStatus, temperature, notes
- **`GateLog` model** — indexed audit trail for all gate events (visitor_checkin, delivery_approved, staff_checkin, sos_triggered, etc.)
- **`CommunityFeed` model** — buy/sell/rent/lost-found/announcement posts with likes
- **`staff.controller.ts`** — registerStaff (auto-generates vendor pass QR), getStaff, staffCheckIn (health log), staffCheckOut (auto-computes workedHours), getAttendanceLogs, updateStaffStatus
- **`gate.controller.ts`** — getGateDashboard (real-time stats + peak hours + action breakdown), getGateLogs (paginated), createGateLog
- **`communityFeed.controller.ts`** — getFeed, createPost, updatePostStatus, toggleLike, deletePost
- **`staff.routes.ts`** — full CRUD + check-in/out/attendance
- **`gate.routes.ts`** — dashboard, logs, manual log
- **`communityFeed.routes.ts`** — full feed CRUD
- **`delivery.routes.ts`** — rewritten: guard creates delivery, resident approves/rejects, leave-at-gate, club deliveries
- **`visitor.routes.ts`** — OTP verify, photo capture, public gate pass, walk-in with vehicle number

### Added — Visitor Upgrades
- **OTP-based approval** — `inviteVisitor` generates 6-digit OTP + embeds in QR; `POST /visitor/:id/verify-otp` verifies
- **Photo capture** — `PATCH /visitor/:id/photo` for guard to capture visitor photo at gate
- **Public gate pass** — `GET /visitor/gate-pass/:id` (no auth) — shareable link for visitors
- **New fields** — `phone`, `vehicleNumber`, `otp`, `otpExpiresAt`, `otpVerified` on Visitor model
- **New statuses** — `OTP Sent`, `Denied` added to VisitorStatus enum
- **New category** — `Vendor` added to VisitorCategory enum

### Added — UI
- **`GateDashboardPage`** — live stats (visitors today, active, pending, deliveries), activity feed with action badges, today's breakdown, peak hours bar chart (auto-refreshes every 30s)
- **`StaffAttendancePage`** — register staff, view vendor pass QR, guard check-in/out with health status, attendance log panel per staff member
- **`CommunityFeedPage`** — grid of buy/sell/rent/lost-found posts, category filter, search, create post modal, like toggle, mark sold/close, delete own posts
- **`VisitorDashboard` upgraded** — OTP approval modal (resident), gate pass share modal, vehicle number field, photo display, OTP verify modal (guard), Denied status, auto-refresh every 20s
- **`SideNav` updated** — Gate Dashboard + Community Feed + Staff links added
- **`App.tsx` updated** — `/gate`, `/feed`, `/staff` routes wired

### Changed
- `delivery.controller.ts` — removed all `any`, full envelope, guard-side `createDelivery`, GateLog integration
- `amenity.controller.ts` — time-slot conflict check (409 if slot already booked)
- `app.ts` — mounted `/api/staff`, `/api/gate`, `/api/feed`
- `api/visitor.ts` (UI) — `verifyVisitorOTP`, `captureVisitorPhoto`, `getGatePass`, `vehicleNumber` param
- `types/visitor.ts` — all new fields, OTP Sent + Denied statuses, Vendor category

### Build
- `npx tsc --noEmit` → 0 errors (API + UI)
- `npm run build` → SUCCESS (UI: 4.24MB, API: compiled to dist/)
