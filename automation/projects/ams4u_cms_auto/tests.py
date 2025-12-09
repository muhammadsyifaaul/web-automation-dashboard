import time
import traceback
from selenium import webdriver
from selenium.webdriver.common.by import By
from utils import resize_and_encode_screenshot

def run_login_test(driver):
    """
    Executes the login test scenarios.
    Returns a dict with test results.
    """
    result = {
        "testName": "Login Test",
        "status": "FAIL",
        "message": "",
        "duration": 0,
        "screenshotBase64": "",
        "errorStack": "",
        "browser": driver.name,
        "environment": "local"
    }
    
    start_time = time.time()
    
    try:
        # 1. Navigate
        # 1. Navigate
        target_url = os.getenv("TARGET_URL")
        if not target_url:
             target_url = "https://cms-ams4u-development-new.qbit.co.id" # Fallback
        
        driver.get(target_url + "/login")
        
        # 2. Input Credentials
        driver.find_element(By.ID, "basic_email").send_keys("dummykeys")
        driver.find_element(By.ID, "basic_password").send_keys("dummykeys")
        
        # 3. Click Login
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        # 4. Verify Success
        time.sleep(2) # Wait for load
        if "Logged In Successfully" in driver.page_source:
            result["status"] = "PASS"
            result["message"] = "Login successful"
        else:
            result["status"] = "FAIL"
            result["message"] = "Login failed: Success message not found"
            result["screenshotBase64"] = resize_and_encode_screenshot(driver)

    except Exception as e:
        result["status"] = "FAIL"
        result["message"] = str(e)
        result["errorStack"] = traceback.format_exc()
        try:
            result["screenshotBase64"] = resize_and_encode_screenshot(driver)
        except:
            pass

    result["duration"] = round(time.time() - start_time, 2)
    return result
