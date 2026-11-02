import asyncio,json,hashlib
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'6-ETSY-LISTING/images/2026-11-01-premium'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  ctx=await browser.new_context(viewport={'width':1500,'height':1125},device_scale_factor=2,color_scheme='light')
  page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto((ROOT/'1-SELL-THIS/Mediterranean-Meal-Planner.html').as_uri());await page.wait_for_timeout(1100)
  for _ in range(6):
   if not await page.locator('#overlay.open').count():break
   await page.locator('#modal .m-f button').last.click();await page.wait_for_timeout(300)
  await page.wait_for_timeout(4500)
  await page.locator('[data-go="home"]').first.click();await page.wait_for_timeout(400)
  assert await page.locator('#page-home.active').count()
  assert not await page.locator('#overlay.open').count()
  assert await page.evaluate('window.innerWidth')==1500
  await page.screenshot(path=str(OUT/'02-dashboard-unedited.png'))
  report={'source_app':str(ROOT/'1-SELL-THIS/Mediterranean-Meal-Planner.html'),'viewport':[1500,1125],'device_scale_factor':2,'pixels':[3000,2250],'page_errors':errors,'method':'Direct Playwright page.screenshot. Onboarding completed through UI; Home selected through UI. No injected CSS, crop, resize, framing, overlay or retouch. Stock sample data.','sha256':hashlib.sha256((OUT/'02-dashboard-unedited.png').read_bytes()).hexdigest()}
  (OUT/'dashboard-capture.json').write_text(json.dumps(report,indent=2))
  previewctx=await browser.new_context(viewport={'width':1230,'height':1360},device_scale_factor=1)
  preview=await previewctx.new_page();await preview.goto((OUT/'sources/contact.html').as_uri());await preview.screenshot(path=str(OUT/'contact-sheet.png'),full_page=True)
  await browser.close()
  print('VERIFIED: Direct dashboard recaptured at 1500x1125 @2x; no pixel edits; page errors:',errors)
asyncio.run(main())
