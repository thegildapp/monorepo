#!/usr/bin/env python3
"""
BoatTrader scraper using undetected ChromeDriver
"""

import undetected_chromedriver as uc
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException


def create_driver():
    """Create and configure undetected ChromeDriver"""
    options = uc.ChromeOptions()
    
    # Optional: Run in headless mode (uncomment if needed)
    # options.add_argument('--headless')
    
    # Additional options for better stealth
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    # Create driver
    driver = uc.Chrome(options=options)
    
    # Execute script to remove webdriver property
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return driver


def scrape_boat_trader(url):
    """Navigate to BoatTrader URL and scrape data"""
    driver = create_driver()
    
    try:
        print(f"Navigating to: {url}")
        driver.get(url)
        
        # Wait for page to load
        wait = WebDriverWait(driver, 10)
        
        # Wait for listings to appear
        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='listing-card']")))
            print("Page loaded successfully!")
        except TimeoutException:
            print("Timeout waiting for listings to load")
        
        # Get page title
        print(f"Page title: {driver.title}")
        
        # Example: Extract listing information
        try:
            listings = driver.find_elements(By.CSS_SELECTOR, "[data-testid='listing-card']")
            print(f"Found {len(listings)} listings")
            
            for i, listing in enumerate(listings[:5]):  # Show first 5 listings
                try:
                    title_element = listing.find_element(By.CSS_SELECTOR, "h3")
                    price_element = listing.find_element(By.CSS_SELECTOR, "[data-testid='listing-price']")
                    
                    title = title_element.text.strip()
                    price = price_element.text.strip()
                    
                    print(f"Listing {i+1}: {title} - {price}")
                except NoSuchElementException:
                    print(f"Could not extract data for listing {i+1}")
                    
        except NoSuchElementException:
            print("No listings found on page")
        
        # Keep browser open for a moment to verify it's working
        print("Pausing for 5 seconds...")
        time.sleep(5)
        
    except Exception as e:
        print(f"Error occurred: {e}")
    
    finally:
        driver.quit()
        print("Browser closed")


if __name__ == "__main__":
    url = "https://www.boattrader.com/boats/state-wa/city-seattle/zip-98178/radius-100/"
    scrape_boat_trader(url)