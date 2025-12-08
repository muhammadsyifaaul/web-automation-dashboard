import os
import sys
import time
import requests
import atexit
import signal
import traceback
import importlib.util
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from dotenv import load_dotenv

# Load Env
load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000/api")
POLL_INTERVAL = 10  # Seconds
DRIVER_INSTANCE = None

def cleanup_driver():
    global DRIVER_INSTANCE
    if DRIVER_INSTANCE:
        print("Closing driver via cleanup...")
        try:
            DRIVER_INSTANCE.quit()
        except Exception as e:
            print(f"Error closing driver: {e}")
        finally:
            DRIVER_INSTANCE = None

def signal_handler(sig, frame):
    print(f"Received signal {sig}. Cleaning up...")
    cleanup_driver()
    sys.exit(0)

atexit.register(cleanup_driver)
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

def get_next_job():
    try:
        resp = requests.get(f"{BACKEND_URL}/jobs/next")
        if resp.status_code == 200:
            data = resp.json()
            if data.get('success') and data.get('data'):
                return data['data']
        elif resp.status_code == 204:
            return None
    except Exception as e:
        print(f"Error polling backend: {e}")
    return None

def update_job_status(job_id, status):
    try:
        requests.post(f"{BACKEND_URL}/jobs/update-status", json={"id": job_id, "status": status})
    except Exception as e:
        print(f"Error updating job status: {e}")

def get_project_details(project_id):
    if not project_id:
        return None
    try:
        resp = requests.get(f"{BACKEND_URL}/projects/{project_id}")
        if resp.status_code == 200:
            data = resp.json()
            if data.get('success'):
                return data['data']
    except Exception as e:
        print(f"Error fetching project details: {e}")
    return None

def sanitize_project_name(name):
    return name.lower().replace(" ", "_").replace("-", "_")

def load_project_module(project_slug):
    # Dynamic import of tests.py from automation/projects/<slug>/tests.py
    project_path = os.path.join(os.path.dirname(__file__), "projects", project_slug, "tests.py")
    if not os.path.exists(project_path):
        print(f"No test script found at {project_path}")
        return None
    
    spec = importlib.util.spec_from_file_location(f"projects.{project_slug}.tests", project_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module

def run_job(job):
    global DRIVER_INSTANCE
    
    print(f"Processing Job {job['id']}...")
    
    # 1. Identify Project
    project_id = job.get('projectId')
    if not project_id:
        print("Job has no Project ID. Cannot execute.")
        update_job_status(job['id'], "Failed")
        return

    project = get_project_details(project_id)
    if not project:
        print(f"Project {project_id} not found.")
        update_job_status(job['id'], "Failed")
        return

    project_slug = sanitize_project_name(project['name'])
    print(f"Project: {project['name']} -> Slug: {project_slug}")

    # 2. Load Script
    module = load_project_module(project_slug)
    if not module:
        print(f"Could not load test module for {project_slug}. Please create 'automation/projects/{project_slug}/tests.py'.")
        
        # Fallbacks
        if "demo" in project_slug:
            print("Trying fallback to 'demo_e_commerce'...")
            module = load_project_module("demo_e_commerce")
        elif "ams4u" in project_slug:
             print("Trying fallback to 'ams4u_cms_auto'...")
             module = load_project_module("ams4u_cms_auto")

    if not module:
        update_job_status(job['id'], "Failed")
        return

    # 3. Initialize Driver
    if not DRIVER_INSTANCE:
        try:
            options = Options()
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            # options.add_argument("--headless") # Optional
            DRIVER_INSTANCE = webdriver.Chrome(options=options)
        except Exception as e:
            print(f"Failed to start driver: {e}")
            update_job_status(job['id'], "Failed")
            return

    # 4. Execute Tests
    # We expect the module to have a function `run_tests(driver)` or we look for functions starting with `run_`
    # For backward compatibility with the previous `run_login_test` style
    
    all_passed = True
    test_functions = [func for name, func in vars(module).items() if callable(func) and name.startswith("run_")]
    
    if not test_functions:
        print("No 'run_*' functions found in test script.")
        update_job_status(job['id'], "Failed")
        return

    for test_func in test_functions:
        test_name = test_func.__name__
        print(f" Running {test_name}...")
        try:
            # Execute
            result = test_func(DRIVER_INSTANCE) # Expects {status: 'PASS'/'FAIL', ...}
            
            # Enrich Result with Project ID
            result['projectId'] = project_id
            
            # Post Result
            print(f"  Result: {result['status']}. Uploading...")
            requests.post(f"{BACKEND_URL}/save-result", json=result)
            
            if result['status'] != "PASS":
                all_passed = False
        except Exception as e:
            print(f"  Error running {test_name}: {e}")
            traceback.print_exc()
            all_passed = False

    final_status = "Completed" if all_passed else "Failed"
    update_job_status(job['id'], final_status)
    print(f"Job Finished: {final_status}")
    cleanup_driver()

def main():
    print(f"Starting Multi-Project Automation Worker.")
    print(f"Backend: {BACKEND_URL}")
    print(f"Polling every {POLL_INTERVAL}s...")

    while True:
        try:
            # Send Heartbeat
            try:
                requests.post(f"{BACKEND_URL}/worker-heartbeat")
            except:
                pass

            job = get_next_job()
            if job:
                run_job(job)
            else:
                print(f"[{time.strftime('%H:%M:%S')}] No pending jobs. Waiting...", end='\r')
        except Exception as e:
            print(f"Main loop error: {e}")
            traceback.print_exc()
        
        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()
