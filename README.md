# Web Automation Test Dashboard

A modular, production-ready QA Automation Dashboard with strict Local vs. Production safety, Dark Mode, and CI/CD.

## Architecture

- **Frontend**: React + TypeScript + Vite (Deployed on GitHub Pages)
- **Backend**: Go + Fiber (Deployed on Render/Railway)
- **Database**: MongoDB Atlas
- **Automation**: Python + Selenium (Runs LOCALLY only)

## Features

- **Environment Safety**: Automation execution is strictly blocked in production environments.
- **Dark Mode**: Fully supported with persistence.
- **Visual Reporting**: Charts, stats, and screenshot viewer for failures.
- **CI/CD**: Automated workflows for building and deploying.

## Setup Instructions

### 1. Backend (Go)

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
go mod tidy
go run main.go
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### 3. Automation (Python)

```bash
cd automation
cp .env.example .env
pip install -r requirements.txt
python local_runner.py
```

## Deployment

- **Frontend**: Push to `main` branch to trigger GitHub Pages deployment (ensure Workflow permissions are enabled).
- **Backend**: Connect your repo to Render/Railway. Set `ENABLE_LOCAL_RUN_TEST=false` in production env vars.

## Environment Variables

### Backend
- `ENABLE_LOCAL_RUN_TEST`: Set to `true` for local dev, `false` for production.
- `ALLOWED_ORIGIN`: Set to your frontend URL in production.

### Frontend
- `VITE_ENV`: `local` or `production`.
- `VITE_API_URL_PROD`: Your production backend URL.
