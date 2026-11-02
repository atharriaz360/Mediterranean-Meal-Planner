import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
CAP=HERE/'captures'
async def main():
 CAP.mkdir(exist_ok=True)
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  ctx=await browser.new_context(viewport={'width':1400,'height':1050},device_scale_factor=2,color_scheme='light')
  page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto((ROOT/'1-SELL-THIS/Mediterranean-Meal-Planner.html').as_uri());await page.wait_for_timeout(1000)
  for _ in range(6):
   if not await page.locator('#overlay.open').count():break
   await page.locator('#modal .m-f button').last.click();await page.wait_for_timeout(300)
  await page.wait_for_timeout(4500)
  async def shot(name):
   assert not await page.locator('.demo-bar:visible').count()
   assert not await page.locator('#overlay.open').count()
   await page.screenshot(path=str(CAP/(name+'.png')))
  await page.locator('[data-go="week"]').first.click();await page.wait_for_timeout(300)
  await shot('week-before')
  before=await page.evaluate('({total:state.shopping.length,done:state.shopping.filter(x=>x.done).length})')
  button=page.locator('#page-week [data-action="genShopping"]');box=await button.bounding_box()
  await button.click();await page.wait_for_timeout(350)
  after=await page.evaluate('({total:state.shopping.length,done:state.shopping.filter(x=>x.done).length})')
  assert after['total']>before['total'],(before,after)
  assert await page.locator('#page-shopping.active').count()
  toast=await page.locator('#toasts').inner_text() if await page.locator('#toasts').count() else ''
  await page.wait_for_timeout(4500);await shot('shopping-built')
  check=page.locator('#page-shopping input[type="checkbox"]:not(:checked)').first
  checkbox=await check.bounding_box();await check.click();await page.wait_for_timeout(300)
  ticked=await page.evaluate('({total:state.shopping.length,done:state.shopping.filter(x=>x.done).length})')
  assert ticked['done']==after['done']+1
  heading=await page.locator('#page-shopping').inner_text()
  assert f"{ticked['done']} of {ticked['total']} bought" in heading
  await shot('shopping-ticked')
  for name in ['home','today','recipes','pantry','balance','goals','calendar','prep','journal','settings']:
   await page.locator(f'[data-go="{name}"]').first.click();await page.wait_for_timeout(250);await shot(name)
  settings_text=await page.locator('#page-settings').inner_text()
  assert 'Back up now' in settings_text and 'Restore backup' in settings_text
  # Actual theme button, then real navigation captures in the same data session.
  await page.locator('#themeBtn').click();await page.wait_for_timeout(200)
  assert await page.evaluate('document.documentElement.dataset.theme')=='dark'
  await page.get_by_role('button',name='Back up now',exact=True).scroll_into_view_if_needed();await page.wait_for_timeout(250)
  await shot('settings-dark')
  await page.locator('[data-go="home"]').first.click();await page.wait_for_timeout(200);await shot('home-dark')
  await page.locator('#themeBtn').click();await page.wait_for_timeout(200)
  await page.set_viewport_size({'width':393,'height':852})
  cdp=await ctx.new_cdp_session(page)
  await cdp.send('Emulation.setDeviceMetricsOverride',{'width':393,'height':852,'deviceScaleFactor':3,'mobile':True})
  for name in ['shopping','pantry','goals','recipes']:
   # Phone navigation can hide sidebar items; use the app's own navigation function.
   await page.evaluate(f"go('{name}')");await page.wait_for_timeout(250);await shot(name+'-phone')
  report={'app':str(ROOT/'1-SELL-THIS/Mediterranean-Meal-Planner.html'),'before':before,'after_build':after,'after_tick':ticked,'build_button_bbox':box,'checkbox_bbox':checkbox,'confirmation':toast,'shopping_heading':heading[:300],'page_errors':errors,'same_session':True,'demo_bars_visible':False,'tablet_viewport':[1400,1050],'tablet_scale':2,'phone_viewport':[393,852],'phone_scale':3,'note':'Phone capture uses the same session and sample data; grocery generation and checkbox were real UI clicks. End card is the existing exact listing hero, which depicts the earlier sample snapshot.'}
  (HERE/'capture-report.json').write_text(json.dumps(report,indent=2));await browser.close()
  print(json.dumps({'VERIFIED':'Real grocery build and checkbox action','before':before,'after_build':after,'after_tick':ticked,'page_errors':errors}),flush=True)
asyncio.run(main())
