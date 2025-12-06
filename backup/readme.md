# Backup & Restore Guide

This guide explains how to restore the environment and handle data issues.

## 1. Environment Restoration
If `.env` files are lost:
1. Copy `.env.example` to `.env`.
2. Fill in `MONGO_URI` (from Atlas or Docker).
3. Set `APP_ENV=development` for local work.

## 2. Database (MongoDB Atlas)
- **Backup**: Use Atlas Cloud Backups (configure in Atlas UI).
- **Restore**: Use `mongorestore` if you have a dump, or Atlas Point-in-Time recovery.
- **Connection**: Ensure your IP is whitelisted in Atlas Network Access.

## 3. Resetting Job Queue
If the queue is stuck (e.g., jobs stuck in `Processing`):
1. Connect to MongoDB via Compass or CLI.
2. Run:
   ```js
   db.jobs.updateMany(
     { status: "Processing" },
     { $set: { status: "Pending" } }
   );
   ```

## 4. Local Automation
- Ensure `venv` is active.
- Verify `chromedriver` matches your Chrome version.
- Check backend URL in `automation/.env`.
