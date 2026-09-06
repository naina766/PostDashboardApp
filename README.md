# PostHub

Modern full-stack social community platform.

> A portfolio-ready full-stack platform engineered for creators, developers, and collaborative networks with production-style architecture.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com/)
[![CI](https://github.com/naina766/PostDashboardApp/actions/workflows/ci.yml/badge.svg)](https://github.com/naina766/PostDashboardApp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. Overview

**PostHub** is an enterprise-patterned social community platform built to demonstrate end-to-end full-stack engineering proficiency. Designed around a decoupled architecture, PostHub features a high-performance React 19 single-page client coupled with an Express 5 REST API and MongoDB Atlas.

The system incorporates robust production practices: dual-token rotating authentication, explainable feed discovery, multi-media content creation with Cloudinary, interactive polls, deep social graph mechanics, real-time creator analytics, administrative moderation governance, containerization, and continuous integration.

---

## 2. Features

- **Authentication & Sessions**: Dual-token architecture (15-min JWT access token + 7-day rotating refresh token) with SHA-256 hashed database storage and automatic token-theft replay detection.
- **Rich Post Publishing**: Multi-media posts (up to 4 images via Cloudinary), interactive polls with real-time percentage calculations, markdown-friendly text, and link attachments.
- **Engagement Mechanics**: Race-condition-safe atomic like/unlike toggle, nested threaded comment replies, and personal bookmarks.
- **Explainable Feed Streams**: Four distinct feed perspectives (*For You*, *Following*, *Trending*, and *Latest*) powered by transparent signal criteria.
- **Social Graph Engine**: Follow/unfollow, block, and mute capabilities with follower/following directories.
- **Categorized Notifications**: Activity feeds grouped chronologically (*Today*, *Yesterday*, *Earlier*) with unread counts and batch mark-as-read.
- **Search & Discovery**: Server-side debounced full-text search across posts, user creators, and trending hashtags (`#tags`).
- **Creator Analytics Dashboard**: Telemetry dashboard computing engagement rates, format distribution (text, image, poll, link), and top-performing posts across 7D, 30D, 90D, and All-Time windows.
- **Moderation & Admin Console**: Role-based access control (Admin, Moderator, User) with content flagging, review queues, and audit trails.
- **Polished SaaS UI/UX**: Dark-mode palette (`#0b1120`), micro-animations, skeleton shimmers, and full responsiveness across desktop, tablet, and mobile.

---

## 3. Tech Stack

### Frontend Client
- **Core Framework**: React 19 + Vite 6
- **UI & Layout**: Bootstrap 5.3 + React-Bootstrap 2.10 (Strictly Vanilla CSS Tokens; Zero Tailwind)
- **Icons**: React Icons (Feather Icon pack)
- **HTTP Client**: Axios with automatic request correlation header (`x-request-id`) and 401 refresh token interceptors
- **Routing**: React Router 7 with protected routes and lazy loading

### Backend REST API
- **Runtime**: Node.js (v20+ LTS)
- **Web Framework**: Express 5
- **Database ODM**: Mongoose 8 + MongoDB Atlas
- **Security Middleware**: Helmet, Express-Rate-Limit, CORS, Mongo-Sanitize, HPP
- **Media Ingestion**: Cloudinary SDK + Multer memory storage
- **Logging & Telemetry**: Custom structured JSON logger with ISO timestamps and request duration tracking

### DevOps & Infrastructure
- **Containers**: Multi-stage Dockerfiles for backend and frontend with Docker Compose
- **Web Server**: Nginx Alpine reverse proxy configuration
- **CI/CD**: GitHub Actions workflow running tests, ESLint, and production build checks

---

## 4. Architecture

PostHub adopts a layered, domain-modular architecture enforcing separation of concerns between HTTP transport, business logic, persistence, and client presentation.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Tier (Vite / React 19)          │
│  - 3-Column Shell (Sidebar, Center Feed, Right Widgets)      │
│  - Axios Interceptors (x-request-id, Token Refresh Queue)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                  Express 5 Gateway & Middleware             │
│  - Helmet (CSP, HSTS, Sniff Guard)                          │
│  - CORS (Domain Whitelist)                                  │
│  - Rate Limiters (Auth, API, Content)                       │
│  - Structured Telemetry Logger                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Domain Service Layer                     │
│  ├── Auth & Session Service (Rotation & Replay Detection)   │
│  ├── Post & Feed Service (Cursor Pagination & Atomic Likes) │
│  ├── Social Graph Service (Follows, Blocks, Mutes)          │
│  ├── Analytics Engine (Creator KPIs & Format Distribution)  │
│  └── Admin & Moderation Service (Content Flagging & Logs)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Persistence & Edge Storage               │
│  ├── MongoDB Atlas (8 Collections, B-Tree Indexes)          │
│  └── Cloudinary CDN (Automated Optimization & Delivery)     │
└─────────────────────────────────────────────────────────────┘
```

For detailed architecture diagrams, database schemas, and data flow specifications, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 5. Project Structure

```
PostHub/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI workflow
├── backend/
│   ├── src/
│   │   ├── config/              # MongoDB, Cloudinary, and Env validators
│   │   ├── middlewares/         # Auth, RBAC, rate-limiting, logging, errors
│   │   ├── modules/             # Domain modules (auth, posts, users, etc.)
│   │   └── utils/               # Structured loggers, seed scripts
│   ├── test/                    # Automated integration & smoke tests
│   ├── Dockerfile               # Backend production container
│   ├── package.json
│   └── server.js                # Express app entry point
├── frontend/
│   ├── public/                  # Static assets and icons
│   ├── src/
│   │   ├── components/          # Reusable UI components & skeleton loaders
│   │   ├── context/             # Auth, User, Theme, and Toast state providers
│   │   ├── pages/               # Routed view components (Dashboard, Profile, etc.)
│   │   ├── services/            # Axios API domain adapters
│   │   ├── styles/              # Design tokens and custom CSS
│   │   ├── utils/               # Time formatting, token helpers
│   │   ├── App.jsx              # Application router and error boundary
│   │   └── main.jsx             # React entry point
│   ├── Dockerfile               # Frontend production container
│   ├── package.json
│   └── vite.config.js           # Vite bundler configuration
├── docs/
│   ├── ARCHITECTURE.md          # Complete system architecture specification
│   ├── API.md                   # REST API endpoints & request/response schemas
│   ├── DEPLOYMENT.md            # Cloud deployment guides (Render, Vercel, Docker)
│   ├── SECURITY.md              # Threat models, OWASP controls & session security
│   ├── TESTING.md               # Test plans, test execution & smoke tests
│   ├── SCALABILITY.md           # Caching, indexing, and scaling strategies
│   ├── CONTRIBUTING.md          # Development standards & PR guidelines
│   └── PROJECT_CLEANUP_AUDIT.md # Project audit & consolidation records
├── docker-compose.yml           # Local multi-service orchestration
├── Dockerfile.backend           # Root-level backend Docker buildfile
├── Dockerfile.frontend          # Root-level frontend Docker buildfile
├── nginx.conf                   # Production Nginx reverse proxy config
├── PostManagementApp.postman_collection.json # API collection for Postman
├── README.md                    # Project overview & documentation
└── LICENSE                      # MIT Open Source License
```

---

## 6. Authentication

PostHub implements an enterprise dual-token authentication pattern:
1. **Access Tokens**: Short-lived (15 minutes) signed JSON Web Tokens containing user identification and role claims.
2. **Refresh Tokens**: Long-lived (7 days) cryptographically generated 40-byte hex strings. The plain-text token is issued to the client while a **SHA-256 hash** is persisted to the database.
3. **Token Rotation**: Every refresh request atomically revokes the presented token and issues a fresh key pair.
4. **Replay Attack Defense**: If an expired or already-revoked refresh token is presented, the server detects the token theft, immediately revokes **all active sessions** across all devices for that user family, and emits a high-priority security audit log.

---

## 7. Post System

The Post system is engineered for flexible creator expression:
- **Multiple Formats**: Supports text-only, multi-image (up to 4 images per post), interactive polls (up to 6 options with expiration dates), and external link attachments.
- **Race-Condition-Safe Likes**: Uses MongoDB `$addToSet` and `$pull` atomic operators to prevent duplicate likes and race conditions.
- **Nested Threaded Comments**: Allows top-level comments and 1-level nested replies, each supporting comment liking and author deletion privileges.
- **Draft Persistence**: Auto-saves composition drafts to local storage, allowing creators to resume work seamlessly.

---

## 8. Social Graph

- **Follow & Unfollow**: Follow creators to tailor the personalized *Following* feed.
- **Blocking & Muting**: Users can block abusive accounts (preventing interactions and hiding content) or mute noisy accounts without unfollowing.
- **Creator Recommendations**: Algorithmic suggestion query matching users based on mutual follows, recent activity, and network relevance.

---

## 9. Notifications

- **Event-Driven Alerts**: Triggered on Likes, Comments, Replies, Follows, Mentions (`@username`), and Post Bookmarks.
- **Chronological Grouping**: Categorized cleanly into *Today*, *Yesterday*, and *Earlier*.
- **Batch Processing**: Single-click "Mark All as Read" operation and real-time unread badge counts polled at 30-second intervals.

---

## 10. Search & Explore

- **Server-Side Debounced Search**: Multi-entity global search across post titles, post body content, user creator profiles, and hashtag taxonomy.
- **Trending Hashtags**: Real-time aggregation pipeline ranking tags by post frequency over rolling 7-day windows.
- **Dynamic Filtering**: One-click tag search directly filtering the main feed by `#tag`.

---

## 11. Moderation

- **Content Flagging**: Users can report inappropriate content with structured reason codes (*spam*, *harassment*, *hate_speech*, *misinformation*, *other*).
- **Admin & Moderator Console**: Restricted UI allowing authorized staff to inspect reported content, take moderation actions (*hide*, *delete*, *dismiss*), and view historical resolution statuses.
- **Audit Logging**: All administrative decisions are permanently recorded in the `audit_logs` collection for compliance.

---

## 12. Analytics

- **Creator Telemetry**: Calculates true engagement rates `((likes + comments + saves) / posts)` using MongoDB aggregation pipelines.
- **Time Windowing**: Filter telemetry across 7-Day, 30-Day, 90-Day, and All-Time intervals.
- **Format Breakdown**: Real-time distribution telemetry highlighting creator performance across Text, Images, Polls, and Links.

---

## 13. Security

- **OWASP Top 10 Protections**: Implemented via Helmet security headers (Content Security Policy, frameguard, XSS filter, nosniff).
- **NoSQL Injection Prevention**: Automated parameter sanitization via `express-mongo-sanitize`.
- **HTTP Parameter Pollution (HPP)**: Guarded against repeated query array attacks.
- **Multi-Tier Rate Limiting**:
  - `authLimiter`: 10 attempts per 15 minutes on login/signup.
  - `apiLimiter`: 100 requests per 15 minutes across general endpoints.
  - `contentLimiter`: 30 create actions per hour for posts and comments.
- **Secret Protection**: All environment secrets (`JWT_SECRET`, `MONGODB_URI`, `CLOUDINARY_API_SECRET`) are strictly read from environment variables and protected by `.gitignore`.

For detailed security policies and threat models, see [docs/SECURITY.md](docs/SECURITY.md).

---

## 14. Testing

PostHub maintains automated integration and smoke test suites running with native Node.js test runner:

```bash
# Run backend test suite
cd backend
npm test

# Run backend smoke verification
npm run test:smoke

# Run frontend linting & build verification
cd ../frontend
npm test
npm run lint
npm run build
```

For testing methodologies, edge cases, and test catalogs, see [docs/TESTING.md](docs/TESTING.md).

---

## 15. Docker

PostHub provides multi-stage containerization for isolated development and deployment:

```bash
# Build and run entire stack locally with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop containers
docker-compose down
```

Services configured:
- `backend`: Node.js 20 Alpine container exposing port 5000.
- `frontend`: Nginx Alpine container serving optimized Vite build on port 80.

---

## 16. Deployment

PostHub is pre-configured for cost-effective deployment across modern cloud platforms:

- **Frontend**: Deployable to **Vercel** or **Netlify** with single-command Git integration.
- **Backend**: Deployable to **Render**, **Railway**, or **Fly.io** with native Docker support and health check probes (`/api/health`, `/api/ready`).
- **Database**: Managed **MongoDB Atlas** M0/M10 replica set with automated backups.
- **Media CDN**: Managed **Cloudinary** media library.

For comprehensive deployment walkthroughs, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 17. Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/posthub?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_access_jwt_key_at_least_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_at_least_32_chars
CLIENT_URL=https://your-frontend-domain.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=https://your-backend-domain.onrender.com
```

Refer to [`.env.example`](.env.example) and [`backend/.env.example`](backend/.env.example) for baseline templates.

---

## 18. Local Development

### Prerequisites
- Node.js v20.x or higher
- MongoDB Atlas cluster or local MongoDB instance
- Cloudinary developer account

### Step-by-Step Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/naina766/PostDashboardApp.git
   cd PostHub
   ```

2. **Configure Backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB and Cloudinary credentials
   npm install
   npm run seed    # Seeds demo creators and posts
   npm run dev     # Starts API on http://localhost:5000
   ```

3. **Configure Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev     # Starts Vite client on http://localhost:5173
   ```

---

## 19. API Documentation

Comprehensive REST API documentation, including URL schemas, headers, status codes, and JSON payloads, is documented in [docs/API.md](docs/API.md).

A ready-to-import Postman collection is also provided at [`PostManagementApp.postman_collection.json`](PostManagementApp.postman_collection.json).

### Primary Endpoints Summary
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service liveness probe | No |
| `GET` | `/api/ready` | Database readiness probe | No |
| `POST` | `/api/auth/register` | Create user account | No |
| `POST` | `/api/auth/login` | Authenticate & retrieve tokens | No |
| `POST` | `/api/auth/refresh` | Rotate refresh token | Yes (Refresh) |
| `GET` | `/api/posts` | Paginated social feed | Optional |
| `POST` | `/api/posts` | Create new post | Yes (Access) |
| `POST` | `/api/posts/:id/like` | Atomic like toggle | Yes (Access) |
| `POST` | `/api/posts/:id/comments` | Add comment to post | Yes (Access) |
| `GET` | `/api/explore/trending` | Fetch trending community posts | No |
| `GET` | `/api/users/analytics` | Creator performance metrics | Yes (Access) |

---

## 20. Future Improvements

While PostHub contains a complete portfolio-grade social architecture, potential roadmap extensions for high-traffic enterprise deployment include:
- **WebSocket Gateway**: Incorporate Socket.io or WebSockets for live typing indicators and instant notification toasts.
- **Redis Caching Layer**: Add Redis caching for hot feeds, trending hashtags, and session revocation blacklists.
- **Search Engine**: Introduce Elasticsearch or Meilisearch for phonetic search and auto-complete indexing.
- **Progressive Web App (PWA)**: Implement service worker offline caching and native web push notifications.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
