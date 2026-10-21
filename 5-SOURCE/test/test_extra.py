import asyncio
from playwright.async_api import async_playwright
import pathlib

F=(pathlib.Path(__file__).resolve().parent.parent/'dist').as_uri()+'/'

async def run():
    async with async_playwright() as p:
        # 1. WebKit Desktop
        bw = await p.webkit.launch()
        cw = await bw.new_context(viewport={'width':1440,'height':900})
        pw = await cw.new_page()
        ew = []
        pw.on('pageerror', lambda e: ew.append(str(e)))
        await pw.goto(F+'Mediterranean-Meal-Planner.html')
        await pw.wait_for_timeout(1000)
        print("WebKit Desktop Errors:", ew)
        
        # 2. iPhone (WebKit Mobile)
        iphone = p.devices['iPhone 13']
        ci = await bw.new_context(**iphone)
        pi = await ci.new_page()
        ei = []
        pi.on('pageerror', lambda e: ei.append(str(e)))
        await pi.goto(F+'Mediterranean-Meal-Planner.html')
        await pi.wait_for_timeout(1000)
        print("WebKit iPhone Errors:", ei)
        
        assert not ew and not ei, 'WebKit page errors'
        # PDF output is covered by test_print.py; WebKit does not support page.pdf().

        await bw.close()

asyncio.run(run())
