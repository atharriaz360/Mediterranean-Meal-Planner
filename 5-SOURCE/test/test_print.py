import asyncio
from playwright.async_api import async_playwright
import pathlib

F=(pathlib.Path(__file__).resolve().parent.parent/'dist').as_uri()+'/'

async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        c = await b.new_context(viewport={'width':1440,'height':900})
        pg = await c.new_page()
        await pg.goto(F+'Mediterranean-Meal-Planner.html')
        await pg.wait_for_timeout(1000)
        
        # Test basic mobile render
        is_open = await pg.evaluate("document.querySelector('#overlay').classList.contains('open')")
        if is_open:
            for _ in range(6):
                if not await pg.evaluate("document.querySelector('#overlay').classList.contains('open')"): break
                bs = await pg.query_selector_all('#modal .m-f button')
                if bs: await bs[-1].click()
                await pg.wait_for_timeout(300)
                
        await pg.pdf(path="dist/print_test.pdf", print_background=True)
        print("PDF printed to dist/print_test.pdf successfully.")
        await b.close()

asyncio.run(run())
