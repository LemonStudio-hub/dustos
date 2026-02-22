#!/usr/bin/env python3
"""Capture screenshots of dustOS using requests + minimal browser simulation."""

import requests
import sys

# Fetch the page HTML
print("Fetching http://localhost:5173/...")
try:
    response = requests.get('http://localhost:5173/', timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Content length: {len(response.text)} bytes")
    
    # Save the HTML for inspection
    with open('/root/dustos/page_source.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
    
    print("HTML saved to /root/dustos/page_source.html")
    
    # Extract key style information
    print("\n=== Extracted Style Info ===")
    if 'icon-wrapper' in response.text:
        print("✓ Desktop icon-wrapper classes found")
    if 'taskbar-item' in response.text:
        print("✓ Taskbar item classes found")
    if 'app-icon' in response.text:
        print("✓ App icon classes found")
    if 'avatar' in response.text:
        print("✓ Avatar classes found")
        
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

print("\nNote: This is a basic HTML fetch. For visual verification, a browser-based tool is needed.")