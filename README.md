# Web Automation Test Dashboard

A modular, production-ready QA Automation Dashboard with strict Local vs. Production safety, Dark Mode, CI/CD automation, and fully isolated Selenium execution that only runs on the user's local machine.

---

# 🔰 GitHub Badges

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)]()
[![Backend](https://img.shields.io/badge/Backend-Go%20Fiber-brightgreen)]()
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)]()
[![Automation](https://img.shields.io/badge/Automation-Python%20%2B%20Selenium-yellow)]()
[![Status](https://img.shields.io/badge/Status-Development-orange)]()
[![License](https://img.shields.io/badge/License-MIT-lightgrey)]()

---

# 🚀 Overview

This system is designed with a **safe hybrid architecture**:

- **Backend + Frontend = Production**
- **Automation Runner = Local Only**

This ensures:
- No browser or Selenium execution ever occurs on public servers.
- Local machines execute tests and report results securely.
- Production remains lightweight, scalable, and server-safe.

---



# ✨ Features

- 🚫 **Production-Safe** — Selenium is forbidden in production.
- 🌙 **Dark Mode** with localStorage persistence.
- 📊 **Visual Reporting** — history, charts, failure screenshots.
- 🕒 **Daily Scheduler** — backend auto-creates jobs.
- 🔄 **Local Runner** — polls backend every 10s.
- 🧱 **Job Queue System** — clean separation between creation & execution.
- 📦 **MongoDB Atlas** — cloud database with no Docker requirement.
- ⚙ CI/CD — GitHub Pages deployment for frontend.

---

# 🛠️ Setup Instructions

## 1. Backend (Go)
cd backend
cp .env.example .env
go mod tidy
go run main.go
2. Frontend (React + Vite)
bash
Copy code
cd frontend
npm install
npm run dev
3. Automation (Python + Selenium)
bash
Copy code
cd automation
cp .env.example .env
pip install -r requirements.txt
python local_runner.py
🌍 Deployment
Frontend (GitHub Pages)
Push to main → GitHub Pages auto-deploys with CI/CD workflow.

Backend (Render or Railway)
Set environment variables:

ini
Copy code
APP_ENV=production
ENABLE_LOCAL_RUN_TEST=false
ALLOWED_ORIGIN=https://your-username.github.io/your-frontend
MONGO_URI=your-atlas-uri
⚠ Production can queue jobs, but cannot run Selenium.

Local Development Mode
ini
Copy code
ENABLE_LOCAL_RUN_TEST=true
APP_ENV=local
🔧 Environment Variables
Backend
MONGO_URI

APP_ENV

ENABLE_LOCAL_RUN_TEST

ALLOWED_ORIGIN

Frontend
VITE_ENV=local|production

VITE_API_URL_PROD

Automation
BACKEND_API_URL

LOCAL_RUNNER_KEY (optional)

🏗️ Project Status & Roadmap
The project is currently under active development.

🚧 Next Milestones:
Multi-project support

Multiple test cases per project

Dashboard Project List

Run automation per project

Parallel reporting

Advanced analytics charts


⭐ Contribute
Pull requests and issues are welcome.
Help improve this automation dashboard and expand the architecture!
