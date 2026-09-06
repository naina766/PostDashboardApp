# PostHub — Production Deployment, DevOps & Operations Runbook

## 1. Cloud Architecture & Infrastructure Targets

```
Frontend (Vercel Edge)   <--->   Backend API (Render Node.js)   <--->   Database (MongoDB Atlas)
                                              |
                                              +----->   Media CDN (Cloudinary)
```

- **Frontend**: **Vercel** (Global Edge CDN with SPA rewrites via `vercel.json`).
- **Backend**: **Render** (Containerized Node.js service with automated health probing).
- **Database**: **MongoDB Atlas** (Managed replica set with automated backups).
- **Media Storage**: **Cloudinary** (Secure asset storage with on-the-fly transformations).

---

## 2. Step-by-Step Deployment Runbook

### 2.1 MongoDB Atlas Cluster Setup
1. Create a free M0 cluster in your preferred region.
2. In **Network Access**, whitelist Render's outbound IP ranges or `0.0.0.0/0`.
3. Create a dedicated database user (e.g. `posthub_app`).
4. Copy the connection URI:
   ```text
   mongodb+srv://posthub_app:<password>@cluster0.mongodb.net/posthub?retryWrites=true&w=majority
   ```

### 2.2 Render Backend Deployment
1. Create a **New Web Service** connected to your repository.
2. Set configuration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
3. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: (Supplied automatically by Render; application dynamically listens on `process.env.PORT || 5000`)
   - `MONGODB_URI` (or `MONGO_URI`): `[MongoDB Atlas connection string]`
   - `JWT_SECRET`: `[Cryptographic 64-character secret key]`
   - `CLIENT_URL` (or `FRONTEND_URL`): `https://[your-frontend].vercel.app`
   - `CLOUDINARY_CLOUD_NAME`: `[Your Cloudinary Cloud Name]`
   - `CLOUDINARY_API_KEY`: `[Your Cloudinary API Key]`
   - `CLOUDINARY_API_SECRET`: `[Your Cloudinary API Secret]`

4. Health Probes:
   - **Liveness Probe**: `GET /api/health` returns HTTP 200 with service uptime, memory, and status.
   - **Readiness Probe**: `GET /api/ready` returns HTTP 200 when database connectivity is verified (HTTP 503 if warming up).

### 2.3 Vercel Frontend Deployment
1. Import repository in [Vercel](https://vercel.com).
2. Set configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   - `VITE_API_URL`: `https://[your-backend].onrender.com`
4. Deploy. `vercel.json` provides automated SPA fallback routing for client-side navigation.

---

## 3. Docker Containerization

```bash
# Start full stack locally via Docker Compose:
docker compose up --build

# Backend runs on: http://localhost:5000
# Frontend runs on: http://localhost:3000
# MongoDB runs on:  localhost:27017
```

### Container Hardening
- **Backend Container (`Dockerfile.backend`)**: Multi-stage build, unprivileged `USER node`, automated `HEALTHCHECK` probe against `/api/health`.
- **Frontend Container (`Dockerfile.frontend`)**: Multi-stage build, Nginx Alpine image, custom `nginx.conf` with gzip compression and `try_files $uri $uri/ /index.html;`.

---

## 4. Backup, Disaster Recovery & Incident Response

### 4.1 Backup & SLAs
- **RPO (Recovery Point Objective)**: < 1 hour.
- **RTO (Recovery Time Objective)**: < 30 minutes.
- **MongoDB Atlas Snapshots**: Automated continuous oplog backups (7-day retention) + daily snapshots (30-day retention).

### 4.2 Incident Response Protocol (Detect → Contain → Recover → Review)
- **Backend Outage**: Check Render deployment logs, verify `/api/health`, rollback to prior deployment in 1 click if regression detected.
- **Database Connectivity Interruption**: PostHub connection pool automatically retries socket connections until re-established without restarting Node.
- **Leaked Secret**: Rotate `JWT_SECRET` in Render dashboard. This instantly invalidates all client sessions and prevents unauthorized access.
