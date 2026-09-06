# PostHub 4.0 — Production Smoke-Test Matrix

This matrix defines the standard smoke-test verification protocol for validating newly deployed environments.

| Area | Test Description | Command / Trigger | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Health Check** | Process liveness & memory telemetry | `GET /api/health` | HTTP 200 `{ status: "ok", uptime: number }` | PASS |
| **Readiness Check** | Database connectivity probe | `GET /api/ready` | HTTP 200 `{ status: "ready", database: "connected" }` | PASS |
| **Security Headers** | Verify Helmet protection headers | `curl -I /api/health` | `x-content-type-options: nosniff`, `x-frame-options: SAMEORIGIN` | PASS |
| **Correlation ID** | Verify request tracing | Inspect response headers | `x-request-id: <uuid>` present | PASS |
| **Auth Validation** | Reject invalid login credentials | `POST /api/auth/login` `{}` | HTTP 400 with standard error envelope | PASS |
| **Public Feed** | Retrieve default community feed | `GET /api/posts?limit=1` | HTTP 200 `{ success: true, data: { posts: [...] } }` | PASS |
| **Trending Discovery** | Retrieve trending tags & ranking | `GET /api/explore/trending` | HTTP 200 with trending posts and tags | PASS |
| **RBAC Authorization** | Access control on admin endpoints | `GET /api/admin/stats` (no token) | HTTP 401 `{ success: false, message: "Authentication required" }` | PASS |
| **Token Rotation** | Refresh expired access token | `POST /api/auth/refresh` `{ refreshToken }` | HTTP 200 with new access & refresh tokens | PASS |
| **Replay Defense** | Replay an already-revoked refresh token | `POST /api/auth/refresh` `{ revokedToken }` | HTTP 401 & revokes all active user sessions | PASS |
| **Frontend Route SPA** | Deep link navigation | Open `/explore` or `/creator` directly | Vercel rewrite returns `index.html` without 404 | PASS |

---

## Automated Execution Command
To run this smoke test suite against any live environment:
```bash
# Against local environment:
npm run test:smoke

# Against live staging/production deployment:
SMOKE_TARGET_URL=https://your-backend.onrender.com npm run test:smoke
```
