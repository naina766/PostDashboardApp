# PostHub — Full-Stack System Architecture

> **"A scalable, production-style social community platform engineered for creators, developers, and collaborative networks."**

---

## 1. System Overview & Core Philosophy

PostHub is architected as a **modular monolith** that balances low operational complexity with strict domain boundaries. It avoids premature microservice overhead while enforcing clean separation between presentation (React 19), business logic (Express 5 modular services), persistent storage (MongoDB Atlas), and media distribution (Cloudinary CDN).

```
+-----------------------------------------------------------------------------------+
|                              CLIENT TIER (Vercel Edge)                            |
|  React 19 + Vite 7 + React-Bootstrap 2 + Semantic CSS Tokens                      |
|  [3-Column Responsive Shell: Left Navigation | Center Feed | Right Widgets]       |
+-----------------------------------------|-----------------------------------------+
                                          | HTTPS / REST API
+-----------------------------------------v-----------------------------------------+
|                          APPLICATION GATEWAY (Render Node 20)                     |
|  - Helmet Security Headers (CSP, FrameGuard, NoSniff)                             |
|  - Production CORS Whitelist Middleware                                           |
|  - Request Telemetry Logger (UUID Correlation ID: x-request-id)                   |
|  - Categorized Rate Limiters (Global, Auth, Content, Search, Reports)             |
|  - JWT Authentication Middleware & Role-Based Access Control (RBAC)               |
+-----------------------------------------|-----------------------------------------+
                                          |
+-----------------------------------------v-----------------------------------------+
|                             MODULAR DOMAIN SERVICES                               |
|  ├── auth.service.js       (Dual-token JWT, SHA-256 rotating refresh tokens)     |
|  ├── post.service.js       (Rich posts, media, polls, link previews, comments)    |
|  ├── feed.service.js       (Reverse-chronological & cursor pagination)             |
|  ├── explore.service.js    (Deterministic discovery signals & debounced search)   |
|  ├── user.service.js       (Social graph, follow/unfollow, block, mute)           |
|  ├── notification.service  (Aggregated alerts with preference filtering)          |
|  ├── analytics.service.js  (Creator telemetry: 7d, 30d, 90d, All Time)            |
|  └── admin.service.js      (Compliance audit trail & moderation governance)       |
+-----------------------------------------|-----------------------------------------+
                     |                                         |
+--------------------v--------------------+   +----------------v--------------------+
|       DATABASE TIER (MongoDB Atlas)     |   |         MEDIA CDN (Cloudinary)      |
|  - M0/M10 Cluster with Connection Pool  |   |  - Server-side authenticated stream |
|  - Compound Indexes for zero-sort feed  |   |  - WebP / AVIF auto-formatting      |
|  - TTL Auto-Expiration on session tokens|   |  - 5MB limit per image (max 4)      |
+-----------------------------------------+   +-------------------------------------+
```

---

## 2. Database Schema & Collections

PostHub organizes data across dedicated Mongoose collections adhering to the rule: **Embed small, bounded data (e.g. comments, poll options); reference unbounded relational entities (e.g. followers, notifications, audit logs)**.

| Collection | Schema Focus | Index Strategy | Purpose |
| :--- | :--- | :--- | :--- |
| **`users`** | Identity, bio, location, privacy, notification settings | `{ email: 1 }`, `{ username: 1 }` (unique) | Authentication & public profile resolution |
| **`posts`** | Text content, media URLs, polls, hashtags, metrics | `{ user: 1, createdAt: -1 }`, `{ hashtags: 1 }` | Fast creator feeds & hashtag discovery |
| **`refreshtokens`** | SHA-256 hashed session tokens, IP, user-agent | `{ token: 1 }` (unique), `{ expiresAt: 1 }` (TTL) | Session rotation & automatic expiration |
| **`follows`** | Relational edge between follower and following | `{ follower: 1, following: 1 }` (compound unique)| Social graph resolution & following feed |
| **`notifications`**| Aggregated interaction alerts (Like, Comment, Follow) | `{ recipient: 1, createdAt: -1 }` | Real-time notification feed |
| **`bookmarks`** | User saved post references | `{ user: 1, post: 1 }` (compound unique) | Personal bookmarked collection |
| **`reports`** | Content moderation flags & review status | `{ status: 1, createdAt: -1 }` | Admin moderation review queue |
| **`auditlogs`** | Tamper-evident admin & security action logs | `{ createdAt: -1 }` | Compliance and security tracking |

---

## 3. Explainable Discovery Engine Signals

Rather than relying on opaque black-box recommendations, PostHub provides **explainable signals** returned with each discovery post:
1. `"Because you follow this creator"`: Author is in direct social graph.
2. `"Trending in #tag"`: Trending engagement score exceeds 130 within an active topic.
3. `"Popular in your network"`: Community interactions exceed threshold.
4. `"Recently published"`: Fresh standard publication.

---

## 4. Frontend Architecture & Design System

### 4.1 3-Column Social Shell
- **Desktop ($\ge 1200$px)**: 3 columns (Left Navigation Sidebar: col-xl-3, Center Feed: col-xl-6, Right Widgets: col-xl-3).
- **Tablet (768px – 1199px)**: 2 columns (Left Sidebar + Center Feed).
- **Mobile ($< 768$px)**: 1 column full width with sticky 44px bottom navigation bar.

### 4.2 Semantic Token Hierarchy
Defined in `frontend/src/styles/main.css`:
- `--ph-bg`: `#0b1120` (Core viewport background)
- `--ph-bg-secondary`: `#0f172a` (Subtle container / input background)
- `--ph-surface`: `#111827` (Card and feed surface)
- `--ph-surface-elevated`: `#172033` (Modals, dropdowns, elevated cards)
- `--ph-border`: `rgba(148, 163, 184, 0.12)` (Card borders and dividers)
- `--ph-text`: `#f1f5f9` (Primary high-contrast text)
- `--ph-text-muted`: `#94a3b8` (Secondary metadata and timestamps)
- `--ph-primary`: `#6366f1` (Indigo brand accent)
- `--ph-primary-hover`: `#818cf8`
- `--ph-accent`: `#22d3ee` (Cyan micro-accent)

### 4.3 Performance & Zero Layout Shift
- **Route Code Splitting**: All secondary routes (`Dashboard`, `Explore`, `Profile`, `Analytics`, `Admin`, `Settings`) are loaded on-demand via `React.lazy()` and wrapped in a branded `Suspense` fallback.
- **Contextual Skeletons**: `PostSkeleton`, `ProfileSkeleton`, `NotificationSkeleton`, and `AnalyticsSkeleton` mirror exact dimensions to eliminate Cumulative Layout Shift (CLS).
