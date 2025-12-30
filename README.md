# Multi-Project Automation Dashboard (v2.1) (BE is under maintain)

A modular, production-ready QA Automation Platform. Manage multiple websites, queue tests in the cloud, and execute them safely on local machines.

## 🚀 Key Features (v2.1)
-   **Case Management System**: Define specific test cases (e.g., `/login`, `/add-item`) and execute them individually or as a suite.
-   **Multi-Project Support**: Manage independent test suites for different websites.
-   **Hybrid Architecture**:
    -   **Backend/Frontend**: Deployed to Cloud (Render/GitHub Pages).
    -   **Automation**: Runs **LOCALLY** (Secure, no headless servers needed).
-   **Dispatcher Pattern**: Smart routing of jobs to specific test files based on case identifiers.
-   **Job Queue**: Backend queues jobs; Local Worker polls and executes them.
-   **Visual Notifications**: Real-time alerts for worker status and job queuing.
-   **Dark Mode**: Sleek UI with persistence.



## 🛠️ Setup Instructions

### 1. Backend (Go)

cd backend
# Create .env from example
cp .env.example .env
# Run
go mod tidy
go run main.go


### 2. Frontend (React)

cd frontend
npm install
npm run dev


### 3. Automation (Python)

cd automation
# Setup Env
cp .env.example .env
# Install
pip install -r requirements.txt
# Run Worker
python local_runner.py


## 🧪 How to Add a New Project
1.  **Dashboard**: click "New Project" and add details.
2.  **Automation**: Create `automation/projects/<snake_case_name>/`.
3.  **Dispatcher**: Create `tests.py` using the dispatcher template (see `ams4u_cms_auto/tests.py`).
4.  **Cases**: Create a `cases/` folder and add `case_<name>.py` files.
5.  **UI**: Go to Project Details in the dashboard, click "Add Case", and define your cases!
6.  **Run**: Click "Run" on a specific case or "Run All Cases".

## 🌍 Deployment
-   **Frontend**: Deployed via GitHub Actions to GitHub Pages.
-   **Backend**: Deploy to Railway/Render.
-   **Automation**: ALWAYS run on a local machine (or a secure worker node), NEVER on the web server.

## ⚠️ Important Notice

-   Automation tests cannot run in production(For Now).

-   The backend only queues jobs.

-   Actual test execution requires the developer’s local machine.

## 📌 Development Roadmap (Next Version)
1.  **Improve reporting & tracker**
2.  **Daily scheduled test**

## 📜 License
AGPL-3.0 license
