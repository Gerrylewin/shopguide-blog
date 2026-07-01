import asyncio
from playwright.async_api import async_playwright
import os

async def verify_blog():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        url = "http://localhost:3000/blog/the-amazon-discovery-gap-high-sku-shopify"
        print(f"Visiting {url}...")

        try:
            await page.goto(url, wait_until="networkidle", timeout=60000)

            # Wait for redirect if it happens
            if "clerk-sync-keyless" in page.url:
                print("Detected Clerk redirect, waiting for sync...")
                await page.wait_for_url("**/blog/the-amazon-discovery-gap-high-sku-shopify", timeout=30000)

            # Wait for content to load
            await page.wait_for_selector("article", timeout=10000)

            os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

            # Full page screenshot to see everything
            await page.screenshot(path="/home/jules/verification/screenshots/full_blog_v3.png", full_page=True)
            print("Full page screenshot saved.")

            # Scroll to table and capture
            await page.locator("table").scroll_into_view_if_needed()
            await page.screenshot(path="/home/jules/verification/screenshots/table_v3.png")

            # Scroll to FAQ and capture
            await page.locator("h2:has-text('Frequently Asked Questions')").scroll_into_view_if_needed()
            await page.screenshot(path="/home/jules/verification/screenshots/faq_v3.png")

        except Exception as e:
            print(f"Error: {e}")
            await page.screenshot(path="/home/jules/verification/screenshots/error_v3.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_blog())
