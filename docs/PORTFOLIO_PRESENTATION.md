# PostHub 4.0 — Engineering Portfolio Presentation Guide

How to explain PostHub in technical interviews, portfolio presentations, and code walkthroughs.

---

## 1. Elevator Pitches

### 30-Second Overview
> "PostHub is a modern, full-stack social community platform built with React 19, Express 5, and MongoDB Atlas. Beyond typical CRUD features, it features dual-token JWT authentication with rotating refresh tokens and automated replay detection, a responsive 3-column feed with explainable algorithmic discovery, creator analytics, role-based moderation, and production DevOps with Docker and GitHub Actions CI."

### 2-Minute Architecture Walkthrough
> "I designed PostHub to reflect the engineering realities of high-scale community applications. On the frontend, we use React 19 and Vite with custom semantic CSS tokens, implementing route-level code splitting, debounced search, optimistic mutations with rollback, and skeleton loaders to eliminate layout shifts. On the backend, we built a modular Express 5 API adhering to standardized response envelopes and cursor-based pagination. For data integrity and security, we implemented SHA-256 hashed refresh token storage in MongoDB with TTL auto-expiration, a multi-tiered rate limiting strategy, and non-root containerized deployment ready for Render and Vercel."

---

## 2. 5-Minute Technical Deep Dive

### Architectural Highlights
1. **Explainable Discovery Engine**: Instead of an opaque algorithm, every post surfaced in explore or trending provides clear signals: *"Trending in #javascript"*, *"Because you follow this creator"*, or *"Popular in your network"*.
2. **Session Lifecycle & Replay Defense**:
   - Access tokens expire in 15 minutes to limit exposure windows.
   - Refresh tokens are single-use: upon refreshing, the old token is marked revoked and a new pair is issued.
   - If an attacker intercepts a spent token and attempts to replay it, PostHub detects the replay, invalidates all sessions belonging to that user family, records an audit log, and rejects the request.
3. **Database Indexing & Query Optimization**:
   - Compound indexes such as `{ user: 1, createdAt: -1 }` allow user profile feeds to be served directly from index keys without in-memory sorting.
   - Refresh tokens use a TTL index on `expiresAt` so expired sessions are purged by MongoDB's background threads without custom cron jobs.
4. **Resilient Production Shell**:
   - Structured request logging attaches correlation IDs (`x-request-id`) to every transaction.
   - Connection pooling with 5s fail-fast timeout prevents thread starvation during network partitions.
   - Graceful shutdown intercepts `SIGTERM`/`SIGINT`, drains inflight HTTP requests, and closes MongoDB connections cleanly.

---

## 3. Engineering Decisions & Tradeoffs

| Decision | Alternative Considered | Rationale & Tradeoff |
| :--- | :--- | :--- |
| **Modular Monolith** | Microservices | A modular monolith inside Node.js is much simpler to test, deploy, and reason about for this scale, avoiding network latency and distributed transaction overhead. |
| **Bootstrap 5 + Custom Tokens** | TailwindCSS | Kept the styling system lightweight and unified with native CSS variables (`--ph-*`), giving full dark/light theme parity without utility-class bloat. |
| **Local JWT + MongoDB Refresh Session** | Redis Session Store | MongoDB's TTL index provides automatic session expiration without needing an additional Redis infrastructure dependency. |
| **Axios Interceptor Queue** | Direct fetch per call | Centralizing request and response interceptors allowed automatic token refresh queuing (`failedQueue`), preventing multiple concurrent 401s from triggering multiple refresh requests. |

---

## 4. Known Limitations & Roadmap
- **Real-Time Delivery**: Currently uses polling and refresh triggers. The next logical phase is WebSocket / SSE integration for instant "New Posts Available" live banners.
- **Offline Storage**: Service Worker PWA caching for offline saved post reading.
