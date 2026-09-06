# PostHub — Automated Testing & Verification Strategy

PostHub employs a multi-tiered automated testing architecture running natively on Node.js without heavy test framework overhead.

---

## 1. Test Suite Overview

| Tier | File Path | Test Count | Scope |
| :--- | :--- | :---: | :--- |
| **Backend Integration** | `backend/test/api.test.js` | 24 | Social models, auth validation, hashtags, polls, social graph, safety, discovery signals |
| **Live Smoke Tests** | `backend/test/smoke.test.js` | 6 | Liveness `/api/health`, readiness `/api/ready`, security headers, RBAC 401, public feed |
| **Frontend Contracts** | `frontend/test/frontend.test.js` | 7 | `timeAgo` timestamp formatting, API response envelope contract validation |

---

## 2. Test Execution Commands

```bash
# 1. Run Backend Automated Test Suite
cd backend
npm test

# 2. Run Production Smoke-Test Suite (Against local or live deployment)
npm run test:smoke
# Or against deployed URL:
# SMOKE_TARGET_URL=https://your-api.onrender.com npm run test:smoke

# 3. Run Frontend Contract Tests
cd ../frontend
npm test

# 4. Run ESLint Quality Check
npm run lint

# 5. Run Production Vite Build
npm run build
```

---

## 3. Production Smoke-Test Matrix

| Area | Probe / Endpoint | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **Liveness Probe** | `GET /api/health` | HTTP 200 `{ status: "ok", uptime: number }` | PASS |
| **Readiness Probe** | `GET /api/ready` | HTTP 200 `{ status: "ready", database: "connected" }` | PASS |
| **Security Headers** | `curl -I /api/health` | `x-content-type-options: nosniff`, `x-frame-options: SAMEORIGIN` | PASS |
| **Correlation ID** | Response headers | `x-request-id: <uuid>` present | PASS |
| **RBAC Authorization** | `GET /api/admin/stats` | HTTP 401 Unauthorized without admin token | PASS |
| **Public Feed** | `GET /api/posts?limit=1` | HTTP 200 `{ success: true, data: { posts: [...] } }` | PASS |

---

## 4. GitHub Actions CI Integration

The automated CI workflow (`.github/workflows/ci.yml`) executes on all pull requests and pushes to `main`:
1. `backend-test`: Checks out code, caches npm packages, runs `npm test`.
2. `frontend-build-lint`: Runs `npm run lint`, `npm test`, and `npm run build`.
