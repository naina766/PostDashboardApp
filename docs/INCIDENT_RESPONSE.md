# PostHub 4.0 — Incident Response Runbook

## 1. Incident Severity Levels
- **SEV-1 (Critical)**: Complete outage (API down, database unreachable, widespread 500 errors).
- **SEV-2 (Major)**: Degraded core functionality (image uploads failing, auth tokens failing rotation).
- **SEV-3 (Moderate)**: Isolated non-blocking issue (analytics latency, non-critical styling bug).

---

## 2. 4-Phase Response Protocol: Detect → Contain → Recover → Review

```
[1. DETECT]
Triggered by: Uptime monitoring alert, /api/health returning non-200, or user reports.
Identify: Impacted subsystem (Render, Mongo, Cloudinary, Vercel).
    │
    ▼
[2. CONTAIN]
Isolate: If compromise or security breach, rotate JWT_SECRET immediately.
Mitigate: If database overload, adjust connection pool or scale Atlas tier.
    │
    ▼
[3. RECOVER]
Restore: Follow roll-back or snapshot restore runbook.
Verify: Run 'npm run test:smoke' against live environment.
    │
    ▼
[4. REVIEW]
Root Cause Analysis (RCA): Document what happened, why it happened, and preventative action items.
```

---

## 3. Incident Playbooks

### Scenario A: Backend Outage on Render (502 / 503)
1. Inspect Render logs via dashboard.
2. Check for memory spikes or exit code 1.
3. Verify `/api/health` and `/api/ready`.
4. If a regression was introduced in the latest release, perform an instant rollback to the previous deployment.

### Scenario B: Database Disconnection (MongoDB Atlas Outage)
1. Check MongoDB Atlas cluster metrics and alerts.
2. Verify Network Access list allows current outbound IPs.
3. PostHub backend will automatically log reconnection attempts. Once Atlas recovers, connections resume without restarting the Node.js server.

### Scenario C: Leaked Secret (JWT / Cloudinary)
1. Generate new secrets via CLI:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update environment variables in Render Dashboard.
3. Redeploy service. (Note: Rotating `JWT_SECRET` invalidates all existing client access tokens, forcing clean re-authentication).
4. Run `revokeAllUserSessions` or clear `refreshtokens` collection to guarantee zero active attacker sessions.
