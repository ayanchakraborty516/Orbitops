# OrbitOps — Operations Command Center

OrbitOps is a commercial-grade, multi-tenant operations management SaaS web application designed for high-velocity software engineering teams. It unifies project management, issue tracking, service telemetry monitoring, incident war rooms, release pipelines, and team collaboration into an integrated operations dashboard.

---

## 🚀 Key Highlights & Architecture

- **Dark-First Modern UI**: Built with a dark-first graphite and charcoal surface palette (`#0B0F19`, `#111827`, `#161B22`), restrained violet (`#6366F1`) and blue (`#38BDF8`) accents, WCAG contrast compliance, and an instant Light/Dark theme switcher.
- **JavaScript & JSX Exclusively**: Built 100% in JavaScript (ES Modules) and JSX — strictly no TypeScript.
- **Real-Time Synchronization**: Native Socket.IO bidirectional events for issue status updates, new incidents, service alerts, and notifications.
- **Derived Progress**: Project progress bars are dynamically computed from active kanban issue completion states.
- **Verifiable Deployments**: Strictly prevents false success claims; deployments are recorded with real execution durations, commit hashes, and container compilation logs.
- **Multi-Tenant Workspace Isolation**: Strictly enforces workspace-scoped queries (`x-workspace-id`) preventing cross-tenant data leakage.
- **RBAC Governance**: Enforces 4 role tiers: `Owner`, `Admin`, `Member`, and `Viewer`.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Routing** | React Router v7 |
| **Server State** | TanStack Query v5 |
| **Real-Time** | Socket.IO Client |
| **Charts & Metrics** | Recharts (Area, Bar, Pie charts) |
| **Icons** | Lucide React |
| **Backend Framework** | Node.js v22 + Express 4 |
| **Database & ODM** | MongoDB + Mongoose 8 |
| **Security & Auth** | HTTP-Only Cookies, JWT, BcryptJS, Helmet, Rate Limiting, CORS |
| **Testing** | Node.js Native Test Runner (`node --test`) |

---

## 📂 Repository Structure

```text
orbitOps/
├── client/                     # Frontend Single Page Application (React + Vite)
│   ├── src/
│   │   ├── api/                # Centralized API client & endpoint services
│   │   │   ├── client.js       # Auto-attaches JWT & x-workspace-id header
│   │   │   ├── authApi.js
│   │   │   ├── projectApi.js
│   │   │   ├── issueApi.js
│   │   │   ├── incidentApi.js
│   │   │   ├── serviceApi.js
│   │   │   ├── releaseApi.js
│   │   │   └── notificationApi.js
│   │   ├── components/
│   │   │   ├── brand/Logo.jsx  # Original OrbitOps SVG logo mark
│   │   │   ├── layout/         # AppLayout, Sidebar, TopNav, PublicNavbar, Footer
│   │   │   └── ui/             # Button, Card, Badge, Modal, Drawer, Skeleton, EmptyState, ThemeToggle
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext, SocketContext
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── auth/           # Login, Register, ForgotPassword
│   │   │   ├── dashboard/      # Operations Command Center
│   │   │   ├── projects/       # Projects List & Project Details
│   │   │   ├── issues/         # Kanban Board (Drag-and-Drop)
│   │   │   ├── incidents/      # Incidents War Rooms & Service Status Page
│   │   │   ├── releases/       # Releases Checklists & Deployments Audit
│   │   │   ├── team/           # Team Directory & RBAC Roles
│   │   │   ├── notifications/  # Notification Center
│   │   │   ├── settings/       # Profile & Workspace Governance
│   │   │   └── system/         # 404 NotFound & 403 Unauthorized
│   │   └── routes/             # AppRoutes with ProtectedRoute guard
│   └── vite.config.js          # Proxies /api and /socket.io to backend port 5000
│
├── server/                     # Backend API & Real-time Server (Express + Mongoose)
│   ├── src/
│   │   ├── config/             # DB connection & environment schema
│   │   ├── models/             # 13 Mongoose entities (User, Workspace, Membership, Project, Issue, etc.)
│   │   ├── controllers/        # REST controllers with input validation & RBAC
│   │   ├── routes/             # Mounted under /api/v1
│   │   ├── middleware/         # Auth, workspace tenant isolation, error handler, rate limiters
│   │   ├── services/           # Aggregations, activity audits, notifications
│   │   ├── sockets/            # Socket.IO room subscriptions & workspace broadcasts
│   │   ├── scripts/seed.js     # Comprehensive database seed script
│   │   └── tests/api.test.js   # Automated integration test suite
│   ├── .env.example            # Placeholder environment template
│   └── package.json
│
├── package.json                # Root convenience scripts
└── README.md
```

---

## ⚡ Quick Start & Local Development

### 1. Prerequisites
- Node.js >= 18 (Tested on v22.19.0)
- MongoDB instance running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

### 2. Install Dependencies
```bash
# Install root convenience scripts
npm install

# Install client packages
cd client && npm install

# Install server packages
cd ../server && npm install
```

### 3. Configure Environment Variables
Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
Default `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/orbitops
JWT_SECRET=orbitops_default_development_secret_key_32chars
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
COOKIE_SECURE=false
```

### 4. Seed Demo Data
To populate realistic engineering projects, kanban issues, monitored services, incidents, and releases:
```bash
npm run seed
# or: cd server && npm run seed
```

#### Demo User Credentials:
| Name | Email | Password | Role |
|---|---|---|---|
| **Elena Rostova** | `admin@orbitops.dev` | `Password123!` | Workspace Owner / Architect |
| **Marcus Chen** | `marcus@orbitops.dev` | `Password123!` | Admin / Lead SRE |
| **Aria Vance** | `aria@orbitops.dev` | `Password123!` | Member / Senior Frontend |

*(Note: The login screen also includes 1-click demo fill buttons for immediate access.)*

### 5. Run the Application
In two terminal tabs (or via concurrently):

**Tab 1 (Server):**
```bash
npm run dev:server
# Running on http://localhost:5000
```

**Tab 2 (Client):**
```bash
npm run dev:client
# Running on http://localhost:3000
```

Open `http://localhost:3000` in your web browser.

---

## 🧪 Testing & Verification Results

Run the automated integration test suite:
```bash
npm run test:server
# or: cd server && npm test
```

### Actual Test Suite Output:
```text
TAP version 13
# [Database] MongoDB Connected: 127.0.0.1
# Subtest: GET /health returns 200 and healthy database status
ok 1 - GET /health returns 200 and healthy database status
# Subtest: POST /auth/login with valid demo credentials
ok 2 - POST /auth/login with valid demo credentials
# Subtest: POST /auth/login with invalid password fails with 401
ok 3 - POST /auth/login with invalid password fails with 401
# Subtest: Workspace authorization protects projects from unauthenticated requests
ok 4 - Workspace authorization protects projects from unauthenticated requests
# Subtest: Workspace-scoped queries reject unauthorized workspace IDs
ok 5 - Workspace-scoped queries reject unauthorized workspace IDs
# Subtest: Authenticated user with valid workspace can fetch dashboard stats
ok 6 - Authenticated user with valid workspace can fetch dashboard stats
1..6
# tests 6
# pass 6
# fail 0
```

---

## 🌐 API Endpoints Reference (`/api/v1`)

### Health
- `GET /api/v1/health` — System vitals and database connectivity status.

### Authentication
- `POST /api/v1/auth/register` — Create account and initial workspace.
- `POST /api/v1/auth/login` — Sign in and receive token/cookie.
- `POST /api/v1/auth/logout` — Safe session logout.
- `GET /api/v1/auth/me` — Current user profile and memberships.
- `PATCH /api/v1/auth/profile` — Update name, title, bio, and theme preference.
- `POST /api/v1/auth/forgot-password` — Password reset boundary.
- `POST /api/v1/auth/reset-password` — Update account credentials.

### Workspaces & RBAC
- `GET /api/v1/workspaces` — List workspaces user belongs to.
- `POST /api/v1/workspaces` — Provision a new workspace.
- `GET /api/v1/workspaces/:workspaceId` — Get workspace details.
- `PATCH /api/v1/workspaces/:workspaceId` — Update workspace settings (Owner/Admin).
- `GET /api/v1/workspaces/:workspaceId/members` — List members & invitations.
- `POST /api/v1/workspaces/:workspaceId/members/invite` — Invite member by email.
- `PATCH /api/v1/workspaces/:workspaceId/members/:memberId` — Update member role.
- `DELETE /api/v1/workspaces/:workspaceId/members/:memberId` — Remove member.

### Projects
- `GET /api/v1/projects` — Filter, search, and list projects with derived progress.
- `POST /api/v1/projects` — Create project with unique key.
- `GET /api/v1/projects/:projectId` — Project details with issue breakdown.
- `PATCH /api/v1/projects/:projectId` — Update project metadata.
- `DELETE /api/v1/projects/:projectId` — Delete project and cascade issues.

### Issues (Kanban)
- `GET /api/v1/issues` — Query issues with filters (projectId, status, priority, search).
- `POST /api/v1/issues` — Create task/bug/story. Auto-generates key (e.g. `PLAT-1`).
- `GET /api/v1/issues/:issueId` — Issue details and comments.
- `PATCH /api/v1/issues/:issueId` — Update issue attributes.
- `PATCH /api/v1/issues/:issueId/status` — Kanban drag-and-drop status update.
- `DELETE /api/v1/issues/:issueId` — Delete issue and associated comments.
- `POST /api/v1/issues/:issueId/comments` — Post operational comment.

### Dashboard
- `GET /api/v1/dashboard` — Live aggregation query for metrics, charts, and trends.

### Services (Observability)
- `GET /api/v1/services` — List monitored services and health statuses.
- `POST /api/v1/services` — Register microservice endpoint.
- `PATCH /api/v1/services/:serviceId` — Update status, latency, or uptime.
- `DELETE /api/v1/services/:serviceId` — Deregister service.

### Incidents (War Rooms)
- `GET /api/v1/incidents` — List active investigations and post-mortems.
- `POST /api/v1/incidents` — Declare incident and update impacted services.
- `GET /api/v1/incidents/:incidentId` — Full incident war room details.
- `POST /api/v1/incidents/:incidentId/timeline` — Post chronological timeline update.
- `DELETE /api/v1/incidents/:incidentId` — Delete incident.

### Releases & Deployments
- `GET /api/v1/releases` — List releases with checklist progress.
- `POST /api/v1/releases` — Draft new release version.
- `GET /api/v1/releases/:releaseId` — Release details and audit log.
- `PATCH /api/v1/releases/:releaseId/checklists/:itemId` — Toggle checklist signoff.
- `POST /api/v1/releases/:releaseId/deploy` — Trigger and verify deployment execution.
- `GET /api/v1/releases/deployments` — Multi-environment deployment history.

### Notifications
- `GET /api/v1/notifications` — User notifications and unread counter.
- `PATCH /api/v1/notifications/:notificationId/read` — Mark read.
- `POST /api/v1/notifications/mark-all-read` — Bulk mark read.

---

## 🚢 Production Deployment Guide

### 1. MongoDB Atlas Setup
1. Create a free M0 or production cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Database User with read/write permissions.
3. In Network Access, add your server's IP address (or `0.0.0.0/0` with secure credentials).
4. Copy the connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/orbitops?retryWrites=true&w=majority`.

### 2. Backend Deployment (Render, Fly.io, Railway, or AWS ECS)
1. Set the Root Directory to `/server`.
2. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=<your_mongodb_atlas_uri>`
   - `JWT_SECRET=<32_random_bytes_hex>`
   - `CLIENT_ORIGIN=https://orbitops.yourdomain.com`
   - `COOKIE_SECURE=true`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Verify health: `curl https://api.yourdomain.com/api/v1/health`.

### 3. Frontend Deployment (Vercel, Netlify, or Cloudflare Pages)
1. Set the Root Directory to `/client`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Single Page Application rewrite rule: `/*` -> `/index.html`.
5. Point proxy / API URL to your production backend.

---

## 📋 Feature Checklist

- [x] **Phase A**: Workspace inspected, design system established, dark-first charcoal theme, original SVG logo mark, Landing page, and component library.
- [x] **Phase B**: Express server, Mongoose models, DB connection, health check, CORS, Helmet, Rate Limiter, and centralized error handling.
- [x] **Phase C**: Authentication (Register, Login, Logout, Profile), multi-tenant Workspaces, Memberships, and RBAC authorization (`Owner`, `Admin`, `Member`, `Viewer`).
- [x] **Phase D**: Project CRUD with derived progress, Kanban issue board with HTML5 drag-and-drop, comments, activity log, and live DB dashboard aggregation.
- [x] **Phase E**: Monitored service fleet, incident war rooms with chronological timelines, release stage-gate checklists, verified deployment execution logs, and Socket.IO real-time sync.
- [x] **Phase F**: Automated integration tests passing, WCAG accessibility, keyboard navigation, responsive layout, and documentation.
- [x] **Phase G**: Application started and verified via HTTP tests.
- [x] **Phase H**: Production deployment guide, seed scripts, and API docs.
