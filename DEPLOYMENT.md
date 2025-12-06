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

## 2. Backend Deployment (Render.com)
1.  Push your code to GitHub.
2.  Go to [Render Dashboard](https://dashboard.render.com).
3.  Click **New +** > **Web Service**.
4.  Connect your GitHub repository.
5.  **Configuration**:
    *   **Root Directory**: `backend` (Important!)
    *   **Runtime**: Go
    *   **Build Command**: `go build -o server`
    *   **Start Command**: `./server`
6.  **Environment Variables**:
    *   `PORT`: `10000` (Render default)
    *   `APP_ENV`: `production`
    *   `MONGO_URI`: (Paste your Atlas URI here)
    *   `ALLOWED_ORIGIN`: `https://<your-username>.github.io` (Your future frontend URL)
    *   `ENABLE_LOCAL_RUN_TEST`: `false`
7.  Click **Deploy**.
8.  **Copy the Backend URL** (e.g., `https://backend-xyz.onrender.com`).

---

## 3. Frontend Deployment (GitHub Pages)
1.  Wait for the Backend to deploy.
2.  Update the **Production Environment Variable** locally:
    *   Create `frontend/.env.production` (if not exists) or just ensure the build knows the URL.
    *   Wait, the best way is to set it in the Repository Secrets!
3.  **Go to GitHub Repo Settings** > **Secrets and variables** > **Actions**.
4.  Add New Repository Secret:
    *   Name: `VITE_API_URL`
    *   Value: (Your Render Backend URL, e.g., `https://backend-xyz.onrender.com/api`)
5.  **Trigger Deployment**:
    *   Make a small change or re-run the "Frontend CI/CD" Action content in `.github/workflows/frontend.yml`.
    *   Wait for the action to finish.
6.  **Verify**:
    *   Go to GitHub Repo **Settings** > **Pages**.
    *   Your site should be live at `https://<username>.github.io/<repo-name>/`.
    *   Check that "All Results" loads (it connects to backend).

---

## 4. Automation Setup (Your PC)
Automation **NEVER** runs on Render. It runs on your computer.

1.  Make sure you have Python and Chrome installed.
2.  Create/Update `automation/.env`:
    ```bash
    BACKEND_URL=https://backend-xyz.onrender.com/api  # Your RENDER URL
    ```
3.  Run the worker:
    ```bash
    cd automation
    python local_runner.py
    ```
4.  **Done!** failed tests/screenshots will appear on your live website.
