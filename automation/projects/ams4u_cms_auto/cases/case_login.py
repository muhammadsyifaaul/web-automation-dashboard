
import time
import traceback
from selenium.webdriver.common.by import By
from utils import resize_and_encode_screenshot

def login_case(driver):
    """
    Executes the login test for AMS4U.
    """
    result = {
        "testName": "Login Test (AMS4U)",
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
        driver.get("https://cms-ams4u-development-new.qbit.co.id/login")
        
        # 2. Input Credentials
        driver.find_element(By.ID, "basic_email").send_keys("dummy")
        driver.find_element(By.ID, "basic_password").send_keys("dummy")
        
        # 3. Click Login
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        # 4. Verify Success
        time.sleep(3) # Wait for redirect
        current_url = driver.current_url
        if "/dashboard" in current_url:
            result["status"] = "PASS"
            result["message"] = "Login successful"
        else:
            result["status"] = "FAIL"
            result["message"] = f"Login failed: Expected /dashboard, got {current_url}"
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
