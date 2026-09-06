# PostHub 4.0 — Production Deployment Runbook

## 1. Deployment Topology
PostHub 4.0 utilizes a modern decoupled cloud architecture:
- **Frontend**: **Vercel** (Static global Edge CDN with SPA rewrites).
- **Backend API**: **Render** (Node.js Web Service with automatic HTTPS and health monitoring).
- **Database**: **MongoDB Atlas** (Managed M0/M10 replica set with automated backups).
- **Media CDN**: **Cloudinary** (Managed cloud storage & image transformations).

---

## 2. Step-by-Step Deployment Guide

### Step 1: MongoDB Atlas Setup
1. Create a free M0 cluster in your preferred region.
2. Under **Network Access**, add `0.0.0.0/0` (or Render's outbound IP ranges) to allow backend connections.
3. Under **Database Access**, create a dedicated database user (e.g. `posthub_app`).
4. Copy the SRV connection URI:
   ```text
   mongodb+srv://posthub_app:<password>@cluster0.mongodb.net/posthub?retryWrites=true&w=majority
   ```

### Step 2: Render Backend Deployment
1. Log in to [Render](https://render.com) and create a **New Web Service**.
2. Connect your PostHub GitHub repository.
3. Configure service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter
4. Add Environment Variables in Render Dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: `[Your MongoDB Atlas URI]`
   - `JWT_SECRET`: `[64-character hex secret]`
   - `FRONTEND_URL`: `https://[your-vercel-app].vercel.app`
   - `CLOUDINARY_CLOUD_NAME`: `[Your Cloudinary Name]`
   - `CLOUDINARY_API_KEY`: `[Your Cloudinary Key]`
   - `CLOUDINARY_API_SECRET`: `[Your Cloudinary Secret]`
5. Set Health Check Path to: `/api/health`.
6. Deploy the service and note your assigned URL: `https://posthub-backend.onrender.com`.

### Step 3: Vercel Frontend Deployment
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your PostHub GitHub repository.
3. Configure project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://posthub-backend.onrender.com`
5. Deploy. `vercel.json` will automatically configure SPA client rewrites for client routes.

---

## 3. Post-Deployment Smoke Testing & Verification
After both services are live, verify using the smoke test suite:
```bash
SMOKE_TARGET_URL=https://posthub-backend.onrender.com npm run test:smoke
```

## 4. Rollback Strategy
- **Render**: Navigate to **Deploy History** -> select the previous successful build -> click **Rollback to this build**.
- **Vercel**: Navigate to **Deployments** -> select the previous instant deployment -> click **Promote to Production**.
