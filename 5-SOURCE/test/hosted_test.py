"""Hosted service-worker offline regression. Build first; no external requests."""
import asyncio, functools, http.server, pathlib, threading
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent/'dist'/'online'
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
async def main():
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        async with async_playwright() as p:
            browser=await p.chromium.launch();context=await browser.new_context();page=await context.new_page();errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            await page.goto(f'http://127.0.0.1:{server.server_port}/');await page.wait_for_selector('#page-home.active')
            await page.evaluate("async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}))}")
            await page.evaluate("closeModal()");await page.wait_for_timeout(600)
            await context.set_offline(True);await page.reload();await page.wait_for_selector('#page-home.active');assert await page.locator('#page-home').inner_text();assert not errors,errors
            print('PASS hosted app reloads offline through service worker')
            await browser.close()
    finally:server.shutdown();server.server_close()
asyncio.run(main())
