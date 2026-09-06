# PostHub — Security Architecture & Production Checklist

## 1. Authentication & Session Architecture

PostHub implements a dual-token JWT authentication architecture with rotating refresh tokens and automated replay attack detection.

```
Client (React 19)                   Express 5 Server                 MongoDB Atlas
       |                                   |                               |
       |--- POST /api/auth/login --------->|                               |
       |    { email, password }            |--- Validate bcrypt hash ----->|
       |                                   |<-- Validated -----------------|
       |                                   |--- Generate Tokens:           |
       |                                   |    - Access (15m JWT)         |
       |                                   |    - Refresh (7d random hex)  |
       |                                   |--- Save SHA-256(refresh) ---->|
       |<-- { token, refreshToken } -------|                               |
       |                                   |                               |
[Normal API Requests with Bearer token]     |                               |
       |--- GET /api/posts (Bearer) ------>|                               |
       |<-- 200 OK ------------------------|                               |
       |                                   |                               |
[When Access Token Expires (401)]          |                               |
       |--- POST /api/auth/refresh ------->|--- Verify Hash(token) ------->|
       |    { refreshToken }               |    Check revoked === false    |
       |                                   |--- Mark Old Token Revoked --->|
       |                                   |--- Create New Token Pair ---->|
       |<-- New { token, refreshToken } ---|                               |
```

### 1.1 Token Specifications
- **Access Tokens**: Short-lived (15 minutes), signed with `JWT_SECRET` via HMAC-SHA256 (`HS256`).
- **Refresh Tokens**: Cryptographically secure 40-byte random strings hashed with **SHA-256** before database insertion.
- **Replay Attack Defense**: If an already-revoked refresh token is replayed, PostHub detects session theft, invalidates **all active sessions** for that user account (`updateMany({ user: id }, { revoked: true })`), logs an administrative audit alert, and rejects the request with 401 Unauthorized.

---

## 2. Network & Transport Security

### 2.1 Production CORS Policy
- `cors.middleware.js` dynamically checks incoming `Origin` headers against the configured `FRONTEND_URL` environment variable.
- Wildcard `*` origins with credentials are strictly disallowed.
- Localhost origins are permitted only when `NODE_ENV !== "production"`.

### 2.2 Security Headers (Helmet)
| Header | Production Directive | Threat Mitigated |
| :--- | :--- | :--- |
| **X-Frame-Options** | `SAMEORIGIN` | Clickjacking attacks, preventing unauthorized framing. |
| **X-Content-Type-Options** | `nosniff` | MIME sniffing; forces user agents to respect declared `Content-Type`. |
| **X-XSS-Protection** | `1; mode=block` | Reflective XSS defense. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Strips path and query string when navigating cross-origin. |

### 2.3 Categorized Rate Limiting
- **Global API**: 1000 requests per 15 minutes.
- **Authentication**: 35 login/registration requests per 15 minutes.
- **Content Creation**: 40 post creations per 15 minutes.
- **Comments & Replies**: 80 per 15 minutes.
- **Search**: 120 queries per 1 minute.
- **Moderation Reports**: 15 reports per 1 hour.

---

## 3. Production Security Checklist (All Verified)

| Control | Status | Verification Evidence |
| :--- | :---: | :--- |
| **Secrets Excluded from Git** | ✅ | `.gitignore` excludes `.env*`. Only `.env.example` templates committed. |
| **Production CORS Restricted** | ✅ | `cors.middleware.js` enforces explicit domain whitelist. |
| **Strong JWT Secret Enforced** | ✅ | `env.validator.js` validates `JWT_SECRET` length ($\ge 32$ chars). |
| **Token Rotation & Replay Defense** | ✅ | Single-use refresh token rotation + automatic family revocation. |
| **Password Hashing** | ✅ | Bcrypt with 10 salt rounds; plaintext passwords never stored. |
| **Role-Based Access Control** | ✅ | `requireAuth` and `requireRole("admin")` guard governance endpoints. |
| **Input Validation** | ✅ | Email normalization, regex username filtering, and length caps. |
| **NoSQL Injection Defense** | ✅ | Mongoose strict schema casting prevents query operator injection. |
| **Upload Restrictions** | ✅ | Multer enforces 5MB limit, max 4 files, and JPEG/PNG/WEBP whitelist. |
| **Security Headers** | ✅ | Helmet configured on Express; edge headers configured in `vercel.json`. |
| **Sensitive Field Exclusion** | ✅ | MongoDB projections use `.select("-password")`. |
| **Compliance Audit Trail** | ✅ | Administrative actions logged in `auditlogs` collection. |
| **Dependency Audits** | ✅ | `npm audit` reveals 0 high-severity vulnerabilities. |
