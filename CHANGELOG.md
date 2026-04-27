# Changelog

All notable changes to SecurityGateApp will be documented here.

Format: `## [vX.Y.Z] — YYYY-MM-DD`

---

## [Unreleased]

- OpenCode multi-agent workflow configured with 4 specialized agents
- Agile sprint pipeline: planner → ui-builder + api-builder (parallel) → qa-reviewer
- Free hosting stack defined: MongoDB Atlas + Render.com + Vercel

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
