# PostHub 4.0 — Production Authentication & Session Security

## 1. Authentication Architecture
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

---

## 2. Token Specifications & Security Controls

### 2.1 Short-Lived Access Tokens (JWT)
- **Lifetime**: 15 minutes (`15m`).
- **Signing Algorithm**: HMAC-SHA256 (`HS256`).
- **Payload**: Minimal non-sensitive claims (`{ id: user._id, role: user.role }`). Never includes passwords or sensitive credentials.
- **Verification**: Validated on every protected endpoint by `auth.middleware.js`.

### 2.2 Rotating Refresh Tokens
- **Entropy**: Cryptographically secure 40-byte random string (`crypto.randomBytes(40).toString("hex")`).
- **Lifetime**: 7 days (`7d`).
- **Storage in Database**: Hashed with **SHA-256** prior to MongoDB insertion. A read-only database compromise cannot expose valid refresh tokens to attackers.
- **Single-Use Invalidation**: Upon successful refresh, the presenting refresh token is immediately marked `revoked: true`.

---

## 3. Threat Mitigations

### 3.1 Replay Attack Detection & Session Revocation
If an attacker steals a previously used refresh token and attempts to replay it against `/api/auth/refresh`:
1. The server detects that `existingToken.revoked === true`.
2. The server recognizes that a token theft has occurred.
3. It immediately invalidates **ALL active sessions** for that user account (`RefreshToken.updateMany({ user: userId }, { revoked: true })`).
4. An administrative audit log entry is recorded (`REPLAY_ATTACK_DETECTED`).
5. Returns `401 Unauthorized` with protection notice.

### 3.2 Frontend Token Storage Tradeoffs
- **Current Approach**: Access tokens and refresh tokens are managed by an automated Axios interceptor queue in `src/services/api.js`.
- **Tradeoff Analysis**:
  - *LocalStorage*: Simplifies cross-origin architectures between separate domains (`frontend.vercel.app` and `backend.onrender.com`) without complex third-party cookie blocking issues.
  - *XSS Defense*: Mitigated by strict React JSX text escaping, input sanitization, CSP headers, and minimal attack surface.
  - *HttpOnly Cookies (Alternative)*: Recommended when frontend and backend share a common top-level domain (e.g. `app.posthub.com` and `api.posthub.com`).
