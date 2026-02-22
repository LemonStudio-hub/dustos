#!/usr/bin/env python3
"""Test script to capture screenshots of dustOS flat design updates."""

import asyncio
from pyppeteer import launch
import sys

async def capture_screenshots():
    """Launch browser and capture screenshots of dustOS."""

    print("Launching browser...")
    browser = await launch(
        headless=True,
        args=['--no-sandbox', '--disable-setuid-sandbox']
    )

    try:
        page = await browser.newPage()
        await page.setViewport({'width': 1920, 'height': 1080})

        print("Navigating to http://localhost:5173/...")
        await page.goto('http://localhost:5173/', {'waitUntil': 'networkidle2', 'timeout': 30000})

        # Wait for Vue app to load
        await asyncio.sleep(3)

        # Screenshot 1: Full desktop view
        print("Capturing full desktop view...")
        await page.screenshot({'path': '/root/dustos/desktop-full.jpg', 'fullPage': True})

        # Screenshot 2: Focus on desktop icons area (top area)
        print("Capturing desktop icons area...")
        await page.screenshot({
            'path': '/root/dustos/desktop-icons.jpg',
            'clip': {'x': 0, 'y': 0, 'width': 1920, 'height': 600}
        })

        # Screenshot 3: Focus on taskbar (bottom area)
        print("Capturing taskbar area...")
        await page.screenshot({
            'path': '/root/dustos/taskbar.jpg',
            'clip': {'x': 0, 'y': 1020, 'width': 1920, 'height': 60}
        })

        print("\nScreenshots captured successfully!")
        print("  - desktop-full.jpg")
        print("  - desktop-icons.jpg")
        print("  - taskbar.jpg")

    except Exception as e:
        print(f"Error during screenshot capture: {e}")
        return False
    finally:
        await browser.close()

    return True

if __name__ == "__main__":
    result = asyncio.get_event_loop().run_until_complete(capture_screenshots())
    sys.exit(0 if result else 1)