import os
import sys
import time
import requests
import atexit
import signal
import traceback
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from dotenv import load_dotenv

# Import Test Cases
from login_test import run_login_test

# Load Env
load_dotenv()

# For local polling, we assume dev mode or user explicitly running this script
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000/api")
POLL_INTERVAL = 10 # Seconds

# Test Registry
TEST_REGISTRY = {
    "FullSuite": [run_login_test],
    "LoginTest": [run_login_test]
}

driver = None

def cleanup_driver():
    global driver
    if driver:
        print("Closing driver via cleanup...")
        try:
            driver.quit()
        except Exception as e:
            print(f"Error closing driver: {e}")
        finally:
            driver = None

def signal_handler(sig, frame):
    print(f"Received signal {sig}. Cleaning up...")
    cleanup_driver()
    sys.exit(0)

# Register cleanup handlers
atexit.register(cleanup_driver)
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

def get_next_job():
    try:
        resp = requests.get(f"{BACKEND_URL}/jobs/next")
        if resp.status_code == 200:
            data = resp.json()
            if data['success'] and data['data']:
                return data['data']
        elif resp.status_code == 204:
            return None # No jobs
    except Exception as e:
        print(f"Error polling backend: {e}")
    return None

def update_job_status(job_id, status):
    try:
        requests.post(f"{BACKEND_URL}/jobs/update-status", json={"id": job_id, "status": status})
    except Exception as e:
        print(f"Error updating job status: {e}")

def run_tests(job):
    global driver
    job_type = job.get("type", "FullSuite")
    tests = TEST_REGISTRY.get(job_type, TEST_REGISTRY["FullSuite"])
    
    print(f"Processing Job {job['id']} (Type: {job_type})...")
    
    # Initialize Driver (if not open, or reuse? Better to reuse for stability, or fresh for clean slate? 
    # Requirement: "Run Selenium tests locally only" - implies running logic.
    # Reuse is faster. We'll reuse but restart if missing.
    if not driver:
        try:
            options = Options()
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            driver = webdriver.Chrome(options=options)
        except Exception as e:
            print(f"Failed to start driver: {e}")
            update_job_status(job['id'], "Failed")
            return

    all_passed = True
    
    for test_func in tests:
        test_name = test_func.__name__
        print(f" Running {test_name}...")
        try:
            result = test_func(driver)
            
            # Post Result
            print(f"  Result: {result['status']}. Uploading...")
            requests.post(f"{BACKEND_URL}/save-result", json=result)
            
            if result['status'] != "PASS":
                all_passed = False
                
        except Exception as e:
            print(f"  Error in {test_name}: {e}")
            traceback.print_exc()
            all_passed = False
            
    final_status = "Completed" if all_passed else "Failed"
    update_job_status(job['id'], final_status)
    print(f"Job {job['id']} finished: {final_status}")


def main():
    print(f"Starting Automation Worker. Polling polling '{BACKEND_URL}' every {POLL_INTERVAL}s...")
    
    while True:
        try:
            job = get_next_job()
            if job:
                run_tests(job)
            else:
                pass # No jobs
        except Exception as e:
            print(f"Main loop error: {e}")
            
        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()
