# 🚀 Deployment Guide

Follow these steps to deploy your **Web Automation Dashboard** to production.

## 1. Database Setup (MongoDB Atlas)
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a free cluster.
3.  **Network Access**: specific your IP (for local) AND `0.0.0.0/0` (to allow Render/Railway to connect).
4.  **Database Access**: Create a user (e.g., `admin`) and password.
5.  **Get Connection String**:
    *   Click "Connect" > "Drivers".
    *   Copy the URI (e.g., `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`).
    *   *Keep this safe!*

---

## 2. Backend Deployment (Railway)
1.  Push your code to GitHub.
2.  Go to [Railway Dashboard](https://railway.app).
3.  Click **New Project** > **Deploy from GitHub repo**.
4.  Select your repository.
5.  **Configuration**:
    *   Click on the new service card > **Settings**.
    *   **Root Directory**: `backend` (Important!)
    *   **Build Command**: `go build -o server`
    *   **Start Command**: `./server`
6.  **Variables** (Environment):
    *   `PORT`: `3000` (Railway will expose this)
    *   `APP_ENV`: `production`
    *   `MONGO_URI`: (Paste your Atlas URI here)
    *   `ALLOWED_ORIGIN`: `https://<your-username>.github.io` (Your future frontend URL)
    *   `ENABLE_LOCAL_RUN_TEST`: `false`
7.  **Generate Domain**:
    *   Go to **Settings** > **Networking**.
    *   Click **Generate Domain**.
    *   Copy the URL (e.g., `web-automation-dashboard-production.up.railway.app`).

---

## 3. Frontend Deployment (GitHub Pages)
1.  Wait for the Backend to deploy.
2.  **Update Repository Secrets**:
    *   Go to GitHub Repo **Settings** > **Secrets and variables** > **Actions**.
    *   Add/Update Secret: `VITE_API_URL`
    *   Value: (Your Railway Backend URL + `/api`, e.g., `https://web-automation-production.up.railway.app/api`)
3.  **Trigger Deployment**:
    *   Re-run the "Frontend CI/CD" Action.
4.  **Verify**:
    *   Your site should be live at `https://<username>.github.io/<repo-name>/`.

---

## 4. Automation Setup (Your PC)
Automation **NEVER** runs on Render. It runs on your computer.

1.  Make sure you have Python and Chrome installed.
2.  Create/Update `automation/.env`:
    ```bash
    BACKEND_URL=https://web-automation-dashboard-production.up.railway.app/api
    ```
3.  Run the worker:
    ```bash
    cd automation
    python local_runner.py
    ```
4.  **Done!** failed tests/screenshots will appear on your live website.
