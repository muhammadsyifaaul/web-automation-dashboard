# V2.0 System Architecture - Hybrid Automation

## 1. System Overview
The system adopts a hybrid architecture to ensure security and flexibility. 
- **Frontend** (React/Vite) runs in production (e.g., Vercel/GitHub Pages).
- **Backend** (Go/Fiber + MongoDB) runs in the cloud (e.g., Render/Railway).
- **Automation** (Python + Selenium) runs **strictly locally** on the user's machine.

## 2. Updated Architecture Diagram

```mermaid
graph TD
    User[User / Browser] -- HTTPS --> FE[Frontend (Production)]
    User -- HTTPS --> BE[Backend (Cloud)]
    FE -- HTTPS --> BE
    
    subgraph "Local User Machine"
        LR[Local Runner (Python)]
        LR_API[Local Runner API :5005]
        Browser[Chrome/Selenium]
        Files[Test Scripts]
    end

    LR -- Polls Jobs --> BE
    LR -- Posts Results --> BE
    
    FE -- 1. List Tests (Direct CORS) --> LR_API
    LR_API -- Reads --> Files
    
    FE -- 2. Queue Job --> BE
    BE -- 3. Job Pending --> DB[(MongoDB)]
    LR -- 4. Fetch Job --> BE
    LR -- 5. Execute --> Browser
```

## 3. Backend API Updates (Go)

### Modified Job Schema
```go
type Job struct {
    ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
    ProjectID primitive.ObjectID `json:"projectId" bson:"projectId"`
    Type      string             `json:"type" bson:"type"` // "single", "multiple", "full"
    TestName  string             `json:"testName,omitempty" bson:"testName,omitempty"` // For "single"
    Tests     []string           `json:"tests,omitempty" bson:"tests,omitempty"`       // For "multiple"
    Status    JobStatus          `json:"status" bson:"status"`
    // ...
}
```

## 4. Local Runner Updates (Python)
The Local Runner now runs a **Flask Server** on port `5005` in addition to its polling loop.

### New Endpoint: `GET /list-tests/<project_slug>`
- Scans `automation/projects/<slug>/tests.py`
- Returns: `["run_login", "run_checkout", ...]`

### Job Execution Logic
- **Full**: Runs all tests.
- **Single**: Runs only `testName`.
- **Multiple**: Runs only tests in `tests` list.

## 5. Frontend Flow (React)
1. User clicks **"View Tests"** on Project Detail.
2. Frontend requests `http://localhost:5005/list-tests/<slug>`.
3. Displays Checkbox List.
4. User selects tests -> Clicks **"Run Selected"**.
5. Frontend calls Backend `POST /queue-job` with `{ type: "multiple", tests: [...] }`.

## 6. Security & Environment
- **CORS**: Local Runner must allow CORS from the Production Frontend domain.
- **No Cloud Execution**: Backend never sees the test code. It only orchestrates.
- **Environment Vars**: `TARGET_URL` is injected by Runner based on ProjectDB config.

## 7. Migration Steps
1. Install `flask` and `flask-cors` in `automation/`.
2. run `pip install -r requirements.txt`.
3. Restart `local_runner.py`.
