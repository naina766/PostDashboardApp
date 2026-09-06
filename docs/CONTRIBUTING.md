# PostHub — Contributing & Engineering Guide

## 1. Development Environment Setup

### 1.1 Prerequisites
- Node.js 20.x or higher
- Local MongoDB or MongoDB Atlas cluster connection
- Cloudinary credentials (for image upload testing)

### 1.2 Installation & Seeding
```bash
# Clone the repository
git clone https://github.com/naina766/PostDashboardApp.git
cd PostDashboardApp

# Install backend dependencies
cd backend
cp .env.example .env
npm install

# Run database seeder (seeds demo users, hashtags, posts)
npm run seed

# Install frontend dependencies
cd ../frontend
cp .env.example .env
npm install
```

---

## 2. Code Quality & Contribution Standards

1. **Strict Zero-Tailwind Rule**: PostHub uses Bootstrap 5 + React-Bootstrap + Semantic CSS variables (`--ph-*`) located in `frontend/src/styles/main.css`. Do NOT add TailwindCSS.
2. **Standard API Envelopes**: All backend endpoints must return standard response structures:
   - Success: `{ success: true, message: "...", data: {} }`
   - Failure: `{ success: false, message: "...", error: { code: "...", message: "..." } }`
3. **Pre-Commit Verification**:
   Before committing, always ensure:
   - `npm test` in `backend/` passes (24/24 tests)
   - `npm test` in `frontend/` passes (7/7 tests)
   - `npm run lint` in `frontend/` reports 0 errors and 0 warnings
   - `npm run build` in `frontend/` succeeds without errors

---

## 3. Engineering Portfolio Presentation Guide

### 30-Second Elevator Pitch
> "PostHub is a modern full-stack social platform built with React 19, Express 5, and MongoDB Atlas. It features dual-token JWT authentication with rotating refresh tokens and automated replay attack detection, a responsive 3-column feed with explainable algorithmic discovery, creator analytics, role-based moderation, and production DevOps with Docker and GitHub Actions CI."

### Architectural Highlights for Interviews
- **Session Security**: 15-minute access tokens + 7-day SHA-256 hashed refresh tokens with single-use rotation and replay detection.
- **Explainable Discovery**: Transparent recommendation signals (`"Because you follow this creator"`, `"Trending in #tag"`).
- **Zero Layout Shifts**: Bespoke shimmer skeletons (`PostSkeleton`, `ProfileSkeleton`, `NotificationSkeleton`, `AnalyticsSkeleton`).
- **Resilient Operations**: Mongoose connection pooling with 5s fail-fast timeout, structured logging with correlation IDs (`x-request-id`), and graceful shutdown on `SIGTERM`/`SIGINT`.
