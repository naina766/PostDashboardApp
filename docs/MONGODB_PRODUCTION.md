# PostHub 4.0 — MongoDB Production Configuration & Indexing Strategy

## 1. Production Connection Settings
PostHub connects to MongoDB using Mongoose 9+ with resilient connection pooling and timeouts configured in `backend/src/config/db.js`:

```javascript
const options = {
  serverSelectionTimeoutMS: 5000, // Fail fast after 5s if replica set is unreachable
  connectTimeoutMS: 10000,        // 10s initial socket handshake
  maxPoolSize: 10,                // Concurrency budget per container instance
  minPoolSize: 2,                 // Pre-warmed sockets
  socketTimeoutMS: 45000,         // Cleanly close idle sockets
};
```

---

## 2. Production Index Audit & Verification

Every index in the PostHub database schema is purpose-built to accelerate high-frequency queries and prevent full collection scans.

| Collection | Indexed Fields | Index Type | Query Accelerated / Purpose |
| :--- | :--- | :--- | :--- |
| **users** | `{ email: 1 }` | Unique | User login lookup and duplicate registration check |
| **users** | `{ username: 1 }` | Unique | User profile lookup (`/profile/:username`) and mentions |
| **users** | `{ followers: 1 }` | Single-field | Social graph follower resolution |
| **users** | `{ following: 1 }` | Single-field | Following feed resolution and suggestions |
| **posts** | `{ createdAt: -1 }` | Descending | Reverse-chronological public & latest feed queries |
| **posts** | `{ user: 1, createdAt: -1 }` | Compound | Creator profile post stream |
| **posts** | `{ hashtags: 1 }` | Multi-key | Hashtag discovery queries (`/explore?tag=javascript`) |
| **posts** | `{ likesCount: -1 }` | Descending | Trending score sorting engine |
| **posts** | `{ title: "text", content: "text" }` | Text | Keyword full-text search index |
| **refreshtokens** | `{ token: 1 }` | Unique | Refresh token lookup on session rotation |
| **refreshtokens** | `{ user: 1 }` | Single-field | Revoke-all-sessions queries during password change / replay |
| **refreshtokens** | `{ expiresAt: 1 }` | TTL Index (`expires: 0`) | MongoDB automated background expiration & cleanup |
| **notifications** | `{ recipient: 1, createdAt: -1 }` | Compound | User notification inbox query |
| **auditlogs** | `{ createdAt: -1 }` | Descending | Administrative compliance audit trail stream |

---

## 3. High-Frequency Query Execution Strategies

### 3.1 Following Feed Pipeline
- **Pattern**: Queries posts authored by the set of users present in `currentUser.following`.
- **Query**: `Post.find({ user: { $in: currentUser.following } }).sort({ createdAt: -1 }).limit(10)`
- **Index Used**: `{ user: 1, createdAt: -1 }` compound index fulfills both matching and sort without an in-memory memory sort.

### 3.2 Trending Algorithm
- **Formula**: `score = (likesCount * 2 + commentsCount * 3) / ((hoursSinceCreation + 2) ^ 1.5)`
- **Query**: Prefilters posts from the last 72 hours using `{ createdAt: { $gte: cutoff } }` before applying scoring in memory.

---

## 4. Backup & Disaster Recovery Strategy
1. **Automated Continuous Backup**: Enable MongoDB Atlas Continuous Cloud Backups (Point-in-Time Recovery with 7-day retention).
2. **Scheduled Snapshots**: Nightly snapshot retained for 30 days.
3. **Recovery Target**:
   - **RPO (Recovery Point Objective)**: < 1 hour.
   - **RTO (Recovery Time Objective)**: < 30 minutes.
