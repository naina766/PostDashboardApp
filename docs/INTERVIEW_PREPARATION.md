# PostHub 4.0 — Technical Interview Preparation Guide

Technical Q&A grounded strictly in the actual PostHub codebase and architecture.

---

## 1. Authentication & Security

### Q1: Why did you implement dual tokens instead of a single long-lived JWT?
**Answer:**
A single long-lived JWT cannot be revoked before expiration without maintaining a server-side blacklist for every request, which undermines the stateless benefit of JWTs. In PostHub, access tokens are short-lived (15 minutes). If intercepted, the exposure window is narrow. Refresh tokens last 7 days, are stored as SHA-256 hashes in MongoDB, and rotate on every use. This provides both stateless authentication for high-speed API endpoints and centralized session revocation when necessary.

**Follow-up: How do you handle refresh token replay attacks?**
In `auth.service.js`, if a refresh token that has already been marked `revoked: true` is presented to `/api/auth/refresh`, the server detects that the token has been replayed. Assuming a token theft occurred, the system immediately revokes all active sessions for that user account (`updateMany({ user: id }, { revoked: true })`), logs an administrative security alert, and returns a 401 Unauthorized.

---

## 2. Database & Data Modeling

### Q2: How did you design your MongoDB indexes to optimize feed and user queries?
**Answer:**
We created compound and specialized indexes aligned with our primary query patterns:
1. For creator profile posts: A compound index `{ user: 1, createdAt: -1 }` fulfills the equality filter on `user` and the sort on `createdAt` directly from the B-tree index, avoiding expensive in-memory sorts.
2. For trending feeds: An index on `{ likesCount: -1 }` combined with date filters.
3. For full-text search: A MongoDB text index on `{ title: "text", content: "text" }`.
4. For refresh tokens: A TTL index on `expiresAt` with `expireAfterSeconds: 0`, enabling MongoDB to purge expired session documents automatically in the background.

---

## 3. Frontend Architecture & React 19

### Q3: How do you avoid Cumulative Layout Shift (CLS) and redundant re-renders?
**Answer:**
1. **Targeted Skeletons**: Rather than showing generic spinners that collapse the layout, components like `PostSkeleton`, `ProfileSkeleton`, and `AnalyticsSkeleton` mirror the exact bounding dimensions and aspect ratios of the loaded content.
2. **Route-Level Code Splitting**: Using `React.lazy` and `Suspense` in `App.jsx`, each page (Dashboard, Explore, Analytics, Settings, Admin) is compiled into a separate chunk. The initial entry chunk is kept under 115 kB gzip.
3. **Debounced Global Search**: Search input handlers employ a 350ms trailing debounce timer with cleanup refs, preventing server query thrashing on every keystroke.
4. **Optimistic Mutations**: Social actions like Likes and Bookmarks update UI state immediately. If the API fails, the state rolls back to previous values and displays a danger toast.

---

## 4. DevOps, Docker & CI/CD

### Q4: What security and performance hardening was applied to the Docker containers?
**Answer:**
1. **Multi-Stage Builds**: For the frontend, Stage 1 builds the Vite app in Node 20, and Stage 2 copies only the compiled static assets into an Nginx Alpine container, minimizing image footprint.
2. **SPA Routing in Nginx**: Configured `try_files $uri $uri/ /index.html;` in `nginx.conf` so client-side routing works on hard refresh without 404s.
3. **Non-Root Execution**: In `Dockerfile.backend`, the container drops root privileges and executes as `USER node`.
4. **Container Health Checks**: Both containers define `HEALTHCHECK` directives pinging `/api/health` or port 80 to enable automatic container recovery by orchestrators.
