# PostHub 4.0 — Backup, Disaster Recovery & Data Retention

## 1. Objectives & SLA Targets
- **Recovery Point Objective (RPO)**: < 1 hour (maximum acceptable data loss during catastrophe).
- **Recovery Time Objective (RTO)**: < 30 minutes (maximum acceptable downtime to restore service).

---

## 2. Backup Architecture

### 2.1 MongoDB Atlas Automated Backups
- **Continuous Backups**: Oplog-based point-in-time recovery for the past 7 days.
- **Daily Snapshots**: Automated nightly snapshots retained for 30 days.
- **Geographic Redundancy**: Multi-region replica distribution across primary and secondary availability zones.

### 2.2 Cloudinary Media Durability
- Assets stored in Cloudinary are backed by redundant cloud object stores (AWS S3 / GCP Storage).
- Original assets are preserved with versioning enabled in Cloudinary Settings.

---

## 3. Step-by-Step Restoration Procedure

### 3.1 Point-in-Time Database Recovery
1. Open the **MongoDB Atlas Console**.
2. Navigate to **Clusters** -> **Backup** -> **Restore**.
3. Select **Point in Time** restore.
4. Specify the timestamp immediately prior to the failure/corruption event.
5. Choose either **Restore to existing cluster** or **Restore to new cluster**.
6. If restored to a new cluster, update the `MONGO_URI` environment variable in the Render Dashboard and trigger a service redeploy.

### 3.2 Audit Log Archival & Retention
- Administrative audit logs are retained in the `auditlogs` collection for a minimum of 90 days.
- High-volume collections (e.g. `refreshtokens`) utilize TTL indexes to auto-purge expired sessions without manual cron maintenance.
