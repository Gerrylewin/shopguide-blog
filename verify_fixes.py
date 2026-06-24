import asyncio
from playwright.async_api import async_playwright
import time

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Start the dev server in the background
        import subprocess
        process = subprocess.Popen(["npm", "run", "dev"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Wait for the server to be ready
        time.sleep(15)

        url = "http://localhost:3000/blog/the-frictionless-frontier-high-sku-shopify-agentic-discovery"
        try:
            response = await page.goto(url)
            print(f"Status: {response.status}")

            # Take a screenshot
            await page.screenshot(path="fixes_verification.png", full_page=True)

            # Check for specific elements
            title = await page.inner_text("h1")
            print(f"Title: {title}")

            callout = await page.inner_text(".prose") # Assuming callout is in prose or has specific class
            print("Page content checked.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()
            process.terminate()

if __name__ == "__main__":
    asyncio.run(main())
