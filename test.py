from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options


def get_agent_url():
    options = Options()
    options.add_argument("--start-maximized")

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
        return driver.current_url

    finally:
        driver.quit()


if __name__ == "__main__":
    url = get_agent_url()
    print("Agent URL:", url)
