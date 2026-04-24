# SecurityGateApp — Project Context for OpenCode

## Project Overview

**SecurityGateApp** is a full-stack security gate and community management platform for residential communities. It enables security personnel to manage visitor access, residents to receive notifications, and administrators to monitor gate activity.

## Repository Structure

```
SecurityGateApp/
├── opencode.json                          # OpenCode configuration
├── AGENTS.md                              # This file — project context
├── CHANGELOG.md                           # Version history
├── SPRINT_LOG.md                          # Agile sprint records
├── QA_REPORT.md                           # QA review reports
├── API_DOCS.md                            # API endpoint documentation
├── .opencode/
│   ├── agents/                            # Custom agent definitions
│   │   ├── planner.md                     # Agent 1: Agile planner
│   │   ├── ui-builder.md                  # Agent 2: UI developer
│   │   ├── api-builder.md                 # Agent 3: API developer
│   │   └── qa-reviewer.md                 # Agent 4: QA & deployment
│   └── prompts/                           # Agent system prompts
├── SecurityGateCommunityHub-js-API/       # Backend module
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       ├── controllers/
│       ├── features/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── scripts/
│       └── utils/
└── SecurityGateCommunityManegmentUI/      # Frontend module
    └── gate-community-hub/
        └── src/
```

## Agent Workflow (Agile Process)

```
[User Prompt]
      |
      v
[1. planner agent]          <-- Primary agent (lightweight: claude-haiku)
   - Analyzes codebase
   - Creates sprint plan
   - Generates feature ideas
   - Assigns version tag
   - Logs to SPRINT_LOG.md
      |
      |---- invokes in parallel ----
      |                             |
      v                             v
[2. ui-builder agent]     [3. api-builder agent]   <-- Subagents (claude-sonnet-4-6)
   React/Vite/Tailwind         Node/Express/MongoDB
   SecurityGateCommunityUI     SecurityGateCommunityAPI
      |                             |
      |---- both complete ----------|
      v
[4. qa-reviewer agent]      <-- Subagent (lightweight: claude-haiku)
   - Runs builds
   - Checks lint/types
   - Validates integration
   - Appends to QA_REPORT.md
   - Provides hosting URLs
```

## Free Infrastructure Stack ($0/month)

| Layer     | Service        | Free Limits                        | URL Pattern                          |
|-----------|----------------|------------------------------------|--------------------------------------|
| Database  | MongoDB Atlas  | M0 cluster, 512MB, shared          | `cluster.mongodb.net`                |
| API       | Render.com     | 750 hrs/month, auto-sleep 15min    | `project.onrender.com`               |
| Frontend  | Vercel         | Unlimited deploys, CDN, HTTPS      | `project.vercel.app`                 |
| Auth      | Google OAuth   | Free                               | Via Passport + JWT                   |
| CI/CD     | GitHub Actions | Free for public repos (2000 min)   | Auto-deploy on push                  |

## Tech Stack Summary

### API (`SecurityGateCommunityHub-js-API/`)
- Node.js + TypeScript 5 (strict)
- Express 5
- Mongoose 8 (MongoDB)
- jsonwebtoken + Passport Google OAuth2
- express-session + bcryptjs
- qrcode (visitor pass generation)
- botframework-webchat (chatbot integration)

### UI (`SecurityGateCommunityManegmentUI/gate-community-hub/`)
- React 19 + TypeScript 5
- Vite 7
- Tailwind CSS v4
- Radix UI primitives
- TanStack React Query v5
- React Router v7
- Lucide React + React Icons
- next-themes (dark/light mode)
- Axios

## Agile Versioning

| Version Pattern | Meaning                              |
|-----------------|--------------------------------------|
| v0.1.0          | MVP — Core auth + gate access        |
| v0.2.0          | Visitor management + QR codes        |
| v0.3.0          | Community announcements + dashboard  |
| v0.4.0          | Real-time notifications (WebSocket)  |
| v0.5.0          | Analytics + audit trail              |
| v1.0.0          | Production-ready, full feature set   |

## Coding Conventions

1. TypeScript strict mode in both modules — no `any`
2. Environment variables via `.env` — never hardcode secrets
3. API responses always use envelope: `{ success, data, message }`
4. React components: PascalCase, custom hooks: `useXxx`
5. Commit messages: `feat:`, `fix:`, `chore:`, `docs:` prefixes
6. Every PR/commit must update `CHANGELOG.md`

## Key Domain Models

- **User**: residents, security guards, admins
- **Gate**: physical gate units with ID and location
- **Visitor**: visitor registration with host/purpose
- **VisitorPass**: time-limited QR access token
- **GateLog**: audit trail of all gate events
- **Announcement**: community bulletin board entries
- **Community**: top-level tenant (multi-community support)

## Environment Variables Required

### API `.env`
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=
JWT_REFRESH_SECRET=
SESSION_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
FRONTEND_URL=
PORT=3000
NODE_ENV=development
```

### UI `.env`
```
VITE_API_BASE_URL=http://localhost:3000
```

## Logging Protocol

Every agent operation MUST log:

```
[TIMESTAMP] [AGENT] [ACTION] [FILE/ENDPOINT] — [RESULT]
```

Example:
```
[2026-04-24T10:30:00Z] [ui-builder] [CREATE] src/pages/VisitorManagement.tsx — Added visitor list page with React Query
[2026-04-24T10:31:00Z] [api-builder] [CREATE] src/routes/visitor.ts — Added GET /api/v1/visitors endpoint
[2026-04-24T10:45:00Z] [qa-reviewer] [BUILD] UI production build — SUCCESS (342KB gzipped)
```

Logs go to:
- `CHANGELOG.md` — per version, human-readable summary
- `SPRINT_LOG.md` — per sprint, task tracking
- `QA_REPORT.md` — per review cycle, build/test results
