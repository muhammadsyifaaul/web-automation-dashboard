import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def perform_login(driver, email="dummy", password="*dummy"):
    """
    Performs the login action for AMS4U.
    This is a helper function to be used by other test cases (e.g. Add, Edit).
    It handles the navigation and authentication process.
    
    Args:
        driver: Selenium WebDriver instance
        email: Email to login with (default: "dummy")
        password: Password to login with (default: "dummy")
        
    Returns:
        bool: True if login successful (redirected to dashboard), False otherwise
    """
    print("[AMS4U] Performing Login...")
    
    try:
        # 1. Navigate
        # Check if we are already on the login page or dashboard to avoid reload if possible?
        # For now, just go to login page to be safe.
        driver.get("https://cms-ams4u-development-new.qbit.co.id/login")
        
        # 2. Input Credentials
        # Wait for elements to be present
        wait = WebDriverWait(driver, 10)
        email_input = wait.until(EC.presence_of_element_located((By.ID, "basic_email")))
        email_input.clear()
        email_input.send_keys(email)
        
        password_input = driver.find_element(By.ID, "basic_password")
        password_input.clear()
        password_input.send_keys(password)
        
        # 3. Click Login
        login_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_btn.click()
        
        # 4. Wait for redirect
        # Wait until URL contains dashboard or timeout
        try:
            wait.until(EC.url_contains("/dashboard"))
            print("[AMS4U] Login successful - Redirected to Dashboard")
            return True
        except:
            print(f"[AMS4U] Login verification failed. Current URL: {driver.current_url}")
            return False
            
    except Exception as e:
        print(f"[AMS4U] Error during login: {e}")
        return False
