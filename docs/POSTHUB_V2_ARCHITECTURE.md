# PostHub 2.0 — Platform Architecture & Evolution Roadmap

## 1. Executive Summary

PostHub 2.0 represents the evolution of PostHub from an internship CRUD assignment into a **production-style social content & community platform**. The goal is to provide a rich, cohesive community experience—incorporating rich post formats (polls, multi-image, link previews), a scalable social graph (follow/unfollow, suggestions), threaded discussions (two-level comments/replies), personalized exploration, deterministic trending feeds, user notifications, creator analytics, bookmarks, content moderation, and an administrative control suite—all while retaining the clean modular architecture, stability, and Bootstrap-powered UI.

---

## 2. Current Architecture (PostHub 1.0 Audit)

### 2.1 Backend Monolith
- **Framework**: Express.js 5 on Node.js (ESM).
- **Database**: MongoDB with Mongoose ODM.
- **Collections**: Strictly 2 collections:
  - `users`: Basic credentials (`name`, `email`, `password`).
  - `posts`: Embedded `likes` array (`[{ userId, username }]`) and `comments` array (`[{ userId, username, text, createdAt }]`).
- **Media**: Cloudinary via `multer-storage-cloudinary` (single image per post).
- **Authentication**: Stateless JWT token passed in `Authorization: Bearer <token>`.

### 2.2 Frontend Client
- **Framework**: React 19 + Vite.
- **Styling**: Bootstrap 5 + React Bootstrap + Custom CSS design tokens (No Tailwind).
- **State Management**: React Context (`UserContext`, `ThemeContext`, `ToastContext`).
- **Routing**: React Router v7 with protected routes.
- **Feed**: Public social feed with server-side pagination, regex search, and sort dropdown.

### 2.3 Identified Bottlenecks & Limitations
1. **Monolithic User Document & Unbounded Post Embeddings**:
   - In 1.0, all comments and likes were embedded in post documents. While compliant with the 2-collection constraint, high-activity posts risk exceeding MongoDB's 16MB document size limit and degrade write throughput on concurrent comments.
2. **Missing Social Graph**:
   - No follow/follower relationships; every user sees the identical global feed without personalization or community curation.
3. **Flat Content Format**:
   - Posts are limited to single image and text; no support for multi-image galleries, link cards, interactive polls, or hashtag taxonomies.
4. **Shallow Discussion**:
   - Comments lack nested reply threads, pagination, or like reactions.
5. **Absence of Governance & Safety**:
   - No mechanism for content reporting, user blocking, or administrator moderation.
6. **Zero Observability & Health Checks**:
   - Missing `/api/health` and structured telemetry.

---

## 3. Proposed V2 Architecture (Modular Monolith)

PostHub 2.0 remains a **modular monolith** to avoid premature microservice overhead while delivering clean separation of concerns across domain boundaries.

```text
                                 [ Web Clients / Mobile Viewports ]
                                                 │
                                                 ▼
                                     [ Express Gateway / Security ]
                     (Helmet, Rate Limiters, Strict CORS, Request Logging)
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   │                             │                             │
                   ▼                             ▼                             ▼
           [ Auth & Users ]              [ Social Graph ]               [ Content Engine ]
          - Profiles & Bio              - Follow / Unfollow            - Multi-Media Posts
          - Roles (User/Admin)          - Followers / Following        - Polls & Link Previews
          - Avatars / Covers            - User Suggestions             - Hashtags & Mentions
                   │                             │                             │
                   ├─────────────────────────────┼─────────────────────────────┤
                   │                             │                             │
                   ▼                             ▼                             ▼
          [ Interactions ]               [ Discovery & Feed ]           [ Governance & Ops ]
          - Threaded Replies            - Deterministic Trending       - Reports & Moderation
          - Bookmarks                   - Explore Engine               - Admin Dashboard
          - Notifications               - Global Search                - Creator Analytics
                   │                             │                             │
                   └─────────────────────────────┴─────────────────────────────┘
                                                 │
                                                 ▼
                                      [ MongoDB Storage Engine ]
                       (users, posts, follows, notifications, bookmarks, reports)
```

---

## 4. Database Evolution

PostHub V2 transitions from the artificial 2-collection limit to a **clean, normalized 6-collection schema** engineered for high write throughput and scale:

### 4.1 Collections Overview

1. **`users`**:
   - `_id`, `name`, `username` (unique, indexed), `email` (unique, indexed), `password` (hashed).
   - Social profile: `avatar`, `coverImage`, `bio`, `location`, `website`, `skills` (array), `socialLinks` (`github`, `twitter`, `linkedin`).
   - Counts: `followersCount`, `followingCount`, `postsCount`.
   - Permissions: `role` (`user`, `moderator`, `admin`), `isVerified`, `isSuspended`.
   - Preferences: `blockedUsers` (array of ObjectIds).
   - `timestamps`.

2. **`posts`**:
   - `_id`, `author` (ref: `User`), `username`, `title`, `content`.
   - `media`: Array of `{ url: String, publicId: String }` (multi-image support).
   - `postType`: `TEXT`, `IMAGE`, `POLL`, `LINK`.
   - `poll`: `{ question: String, options: [{ text: String, votes: [{ type: ObjectId, ref: 'User' }] }], expiresAt: Date }`.
   - `linkPreview`: `{ url: String, title: String, description: String, image: String }`.
   - `hashtags`: Array of lowercase strings (indexed).
   - `mentions`: Array of usernames.
   - `likes`: Array of `{ userId: ObjectId, username: String }`.
   - Counts: `likesCount`, `commentsCount`, `sharesCount`, `savesCount`.
   - `trendingScore`: Float (indexed for explore engine).
   - `timestamps`.

3. **`follows`** (Dedicated social graph):
   - `_id`, `follower` (ref: `User`), `following` (ref: `User`), `createdAt`.
   - Unique compound index: `{ follower: 1, following: 1 }`.
   - Index on `{ following: 1 }` and `{ follower: 1 }`.

4. **`bookmarks`** (Saved posts):
   - `_id`, `user` (ref: `User`), `post` (ref: `Post`), `createdAt`.
   - Unique compound index: `{ user: 1, post: 1 }`.

5. **`notifications`**:
   - `_id`, `recipient` (ref: `User`), `actor` (ref: `User`), `type` (`LIKE`, `COMMENT`, `REPLY`, `FOLLOW`, `MENTION`).
   - `post`: Ref `Post` (optional).
   - `read`: Boolean (default: `false`).
   - `timestamps`.
   - Compound index: `{ recipient: 1, read: 1, createdAt: -1 }`.

6. **`reports`** (Moderation):
   - `_id`, `reporter` (ref: `User`), `targetType` (`POST`, `COMMENT`, `USER`), `targetId` (ObjectId).
   - `reason` (`SPAM`, `HARASSMENT`, `HATE`, `VIOLENCE`, `SEXUAL`, `MISLEADING`, `OTHER`), `details`: String.
   - `status`: `PENDING`, `RESOLVED`, `DISMISSED`.
   - `timestamps`.

---

## 5. API Evolution

### 5.1 Profile & Social Graph
- `GET /api/users/:username` — Public profile + engagement metrics.
- `PUT /api/users/profile` — Update bio, skills, location, social links.
- `POST /api/users/avatar` — Upload profile avatar via Cloudinary.
- `POST /api/users/cover` — Upload profile banner cover image.
- `POST /api/users/:id/follow` — Follow user & increment counters.
- `DELETE /api/users/:id/follow` — Unfollow user & decrement counters.
- `GET /api/users/:id/followers` — Paginated list of followers.
- `GET /api/users/:id/following` — Paginated list of users followed.
- `GET /api/users/suggestions` — Suggested members based on shared interests or activity.

### 5.2 Advanced Content & Threads
- `POST /api/posts` — Create rich post (text, multi-image, poll, link preview).
- `POST /api/posts/:id/vote` — Vote on an active poll option.
- `POST /api/posts/:id/comments` — Top-level comment or threaded reply (`parentId`).
- `DELETE /api/posts/:id/comments/:commentId` — Delete comment/reply.
- `POST /api/posts/:id/save` & `DELETE /api/posts/:id/save` — Bookmark management.
- `GET /api/users/me/saved` — Paginated saved posts.

### 5.3 Discovery, Trending & Notifications
- `GET /api/explore/trending` — Top-ranked posts using deterministic score.
- `GET /api/explore/hashtags/:tag` — Posts by hashtag with volume analytics.
- `GET /api/explore/search` — Unified search across People, Posts, and Hashtags.
- `GET /api/notifications` — Notification inbox with unread counts.
- `PATCH /api/notifications/read-all` — Mark all notifications as read.

### 5.4 Moderation & Admin
- `POST /api/reports` — File content or user report.
- `GET /api/admin/overview` — Platform vital signs & user growth.
- `GET /api/admin/reports` — Pending moderation queue.
- `PATCH /api/admin/reports/:id` — Resolve or dismiss report.
- `PATCH /api/admin/users/:id/status` — Suspend or restore user account.

### 5.5 Observability
- `GET /api/health` — Service readiness & uptime check.

---

## 6. Deterministic Trending Engine Algorithm

Rather than relying on vague AI or randomized feeds, PostHub 2.0 employs a transparent, reproducible engagement formula:

$$\text{TrendingScore} = (\text{likes} \times 1) + (\text{comments} \times 3) + (\text{shares} \times 4) + (\text{saves} \times 3) + \text{RecencyBonus}$$

Where:
- $\text{RecencyBonus} = \max(0, 100 - \text{hoursSinceCreation} \times 4)$
- Posts published within the last 24 hours receive a linear freshness boost to encourage emerging community conversations.

---

## 7. Security Architecture

1. **HTTP Headers**: Enforced via `helmet` (Strict-Transport-Security, X-Content-Type-Options, Frameguard).
2. **Rate Limiting**:
   - Auth endpoints (`/api/auth/*`): 10 requests / minute.
   - Mutation endpoints (posts/comments/likes): 60 requests / minute.
   - General reads: 200 requests / minute.
3. **Strict Parameter Validation**: Sanitization against NoSQL injection via Mongoose strict casting and regex escapers.
4. **Role-Based Access Control (RBAC)**: Middleware `roleMiddleware(['admin', 'moderator'])` protecting administrative routes on the server side.
5. **Upload Hardening**: Enforces 5MB maximum file size and strict MIME type whitelisting (`image/jpeg`, `image/png`, `image/webp`).

---

## 8. Implementation Roadmap (Phased Approach)

1. **Phase A**: Architecture documentation and schema contracts *(Completed)*.
2. **Phase B**: Extended user profile model, avatar/cover uploads, and profile UI.
3. **Phase C**: Social graph (Follow collection, follow/unfollow, follower lists, user suggestions).
4. **Phase D**: Advanced post types (multi-image, link previews, interactive polls, hashtag auto-extraction).
5. **Phase E**: Threaded 2-level comment & reply discussions.
6. **Phase F**: Bookmarks / Saved posts engine.
7. **Phase G & H**: Explore dashboard, deterministic trending score, and hashtag views.
8. **Phase I & J**: Real-time notification center and web sharing.
9. **Phase K & L**: Moderation reporting system and protected Admin Dashboard.
10. **Phase M**: Creator analytics dashboard with engagement visualizations.
11. **Phase N**: Production security hardening (`helmet`, `express-rate-limit`, sanitize).
12. **Phase O & P**: Expanded automated test suite and OpenAPI/Postman documentation.
13. **Phase Q & R**: Containerization (Docker, docker-compose) and GitHub Actions CI.
14. **Phase S & T**: Health endpoint, observability, and final audit pass.
