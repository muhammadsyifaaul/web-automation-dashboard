import time
import traceback
from selenium import webdriver
from selenium.webdriver.common.by import By
from utils import resize_and_encode_screenshot

def run_login_test(driver):
    """
    Executes the login test for Practice Test Automation.
    """
    result = {
        "testName": "Login Test (Practice Automation)",
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
        driver.get("https://practicetestautomation.com/practice-test-login/")
        
        # 2. Input Credentials
        driver.find_element(By.ID, "username").send_keys("student")
        driver.find_element(By.ID, "password").send_keys("Password123")
        
        # 3. Click Login
        driver.find_element(By.ID, "submit").click()
        
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
