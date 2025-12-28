from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from urllib.parse import urlparse, parse_qs


def get_agent_url():
    options = Options()

    # 🔒 Run Chrome in background (headless)
    options.add_argument("--headless=new")  # use "--headless" if older Chrome
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    wait = WebDriverWait(driver, 30)

    try:
        # 1️⃣ Open ADK dev UI
        driver.get("http://127.0.0.1:8000/dev-ui/")

        # 2️⃣ Click mat-select (Select an agent)
        mat_select = wait.until(
            EC.element_to_be_clickable((
                By.XPATH,
                "//mat-select[@role='combobox']"
            ))
        )
        mat_select.click()

        # 3️⃣ Wait for overlay panel and click "agents"
        agents_option = wait.until(
            EC.element_to_be_clickable((
                By.XPATH,
                "//mat-option//span[normalize-space()='agents']"
            ))
        )
        agents_option.click()

        # 4️⃣ Wait for route change
        wait.until(lambda d: "session" in d.current_url)

        # 5️⃣ Capture final URL
        good_url = driver.current_url
        parsed_url = urlparse(good_url)
        query_params = parse_qs(parsed_url.query)

        session = query_params.get("session", [None])[0]
        return session

    finally:
        driver.quit()
