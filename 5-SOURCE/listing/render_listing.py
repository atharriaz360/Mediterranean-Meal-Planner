"""Render code-native listing layouts using supplied Canva photos and real app captures."""
import asyncio, json, html
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'6-ETSY-LISTING/images/2026-11-01'
CAP=OUT/'sources'
CSS='''*{box-sizing:border-box}body{margin:0;background:#f7f1e5;color:#193d2e;font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif}.slide{position:relative;width:3000px;height:2250px;overflow:hidden}.bg{position:absolute;width:100%;height:100%;object-fit:cover;object-position:center 65%}.wash{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,250,239,.96),rgba(255,250,239,.65) 29%,transparent 55%)}.dark{color:#fff8e7}.dark .wash{background:linear-gradient(180deg,rgba(10,30,21,.8),rgba(10,30,21,.4) 35%,transparent 65%)}header{position:absolute;left:650px;top:130px;width:1700px;text-align:center}.eyebrow{font-size:42px;font-weight:700;letter-spacing:7px;text-transform:uppercase;color:#8a6523}h1{font-family:Georgia,serif;font-weight:400;font-size:126px;line-height:1.08;letter-spacing:-4px;margin:35px 0 24px}.sub{font-size:43px;line-height:1.4}.dark .eyebrow{color:#f0ce84}.badge{display:inline-block;border:2px solid #e5c67f;border-radius:80px;padding:19px 37px;font-size:43px;letter-spacing:3px;font-weight:750;background:#e7c87d;color:#123527}.device{position:absolute;background:#161a18;border:5px solid #737a71;box-shadow:0 55px 85px #0005;overflow:hidden}.device img{display:block;width:100%;height:100%;object-fit:cover;object-position:top}.tablet{left:660px;top:890px;width:1440px;height:1050px;border-radius:53px;padding:28px}.phone{left:1850px;top:1070px;width:480px;height:1020px;border-radius:62px;padding:15px;border:5px solid #868c84}.phone:after{content:'';position:absolute;top:25px;left:170px;width:130px;height:27px;border-radius:25px;background:#161a18}.duo .phone{top:830px;left:850px;width:570px;height:1225px}.duo .phone.second{left:1580px;top:900px}.duo .phone:after{left:210px}.foot{position:absolute;bottom:65px;left:650px;width:1700px;text-align:center;font-size:29px;letter-spacing:2px}.wide{left:660px;top:850px;width:1680px;height:1167px;padding:27px;border-radius:48px}.grid{position:absolute;left:660px;top:735px;width:1680px;display:grid;grid-template-columns:repeat(4,1fr);gap:25px}.tile{background:#fff9ef;padding:12px;border:1px solid #d8ceba;border-radius:20px;box-shadow:0 10px 24px #17352615}.tile img{width:100%;height:300px;object-fit:cover;object-position:top;border-radius:9px}.tile span{display:block;text-align:center;font-size:26px;padding:15px}.steps{position:absolute;left:660px;top:790px;width:1680px;display:grid;gap:40px}.step{padding:45px 55px;border:1px solid #d7ccb6;border-radius:28px;background:#fffaf1;display:flex;gap:40px;align-items:center}.num{background:#1f4a38;color:#f6e2ae;border-radius:50%;width:110px;height:110px;display:grid;place-items:center;font-size:55px;flex-shrink:0}.step b{font-family:Georgia;font-size:62px;font-weight:400}.step p{font-size:35px;line-height:1.4;margin:15px 0 0}.delivery{position:absolute;top:1830px;left:660px;width:1680px;text-align:center;font-size:36px;line-height:1.65}'''
def uri(p): return Path(p).as_uri()
def device(name,kind='phone',extra=''):
 return f'<div class="device {kind} {extra}"><img src="{uri(CAP/(name+".png"))}"></div>'
def slide(file,title,sub,bg=None,kind='wide',screens=None,dark=False,eyebrow='MEDITERRANEAN MEAL PLANNER'):
 body=(f'<img class="bg" src="{uri(ROOT/"5-SOURCE/canva-bg"/bg)}"><div class="wash"></div>' if bg else '')
 head=f'<div class="eyebrow">{eyebrow}</div><h1>{title}</h1><div class="sub">{sub}</div>'
 if kind=='hero':
  head=f'<div class="badge">A REAL APP · NOT A PDF</div><h1>Mediterranean<br>Meal Planner</h1><div class="sub">Build your grocery list in one tap</div>'
  body+=device('week','tablet')+device('shopping-mobile')
 elif kind=='duo':body+=device(screens[0])+device(screens[1],extra='second')
 elif kind=='wide':body+=device(screens[0],'wide')
 elif kind=='grid':
  labels=['Home','Week plan','Today','Calendar','Recipes','Shopping','Pantry','Prep list','Balance','Goals & water','Journal','Settings']
  names=['home','week','today','calendar','recipes','shopping','pantry','prep','balance','goals','journal','settings']
  body+='<div class="grid">'+''.join(f'<div class="tile"><img src="{uri(CAP/(n+".png"))}"><span>{l}</span></div>' for n,l in zip(names,labels))+'</div>'
 elif kind=='steps':
  body+='<div class="steps">'+''.join(f'<div class="step"><div class="num">{i}</div><div><b>{a}</b><p>{b}</p></div></div>' for i,a,b in [(1,'Download','Get your ZIP and Start Here PDF from Etsy.'),(2,'Open','Unzip on computer. Follow the guide for phone setup.'),(3,'Plan','Choose meals. Tap From week plan to build your list.')])+'</div><div class="delivery">HTML app + setup PDF + personal-use licence<br>Digital download · Nothing ships<br><small>Food and props are background styling only.</small></div>'
 footer='KaelLabs · Real app screens · Sample data' if kind!='steps' else 'KaelLabs · Mediterranean Meal Planner'
 return file,f'<!doctype html><meta charset="utf-8"><style>{CSS}</style><div class="slide {"dark" if dark else ""} {"duo" if kind=="duo" else ""}">{body}<header>{head}</header><div class="foot">{footer}</div></div>'
async def main():
 OUT.mkdir(parents=True,exist_ok=True);CAP.mkdir(exist_ok=True)
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  ctx=await browser.new_context(viewport={'width':1400,'height':1050},device_scale_factor=2,color_scheme='light')
  pg=await ctx.new_page(); errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  await pg.goto(uri(ROOT/'1-SELL-THIS/Mediterranean-Meal-Planner.html'));await pg.wait_for_timeout(1100)
  for _ in range(6):
   if not await pg.locator('#overlay.open').count():break
   await pg.locator('#modal .m-f button').last.click();await pg.wait_for_timeout(300)
  await pg.wait_for_timeout(4500)
  for name in ['home','week','today','calendar','recipes','shopping','pantry','prep','balance','goals','journal','settings']:
   await pg.evaluate(f"go('{name}')");await pg.wait_for_timeout(250)
   await pg.screenshot(path=str(CAP/(name+'.png')))
  await pg.set_viewport_size({'width':1500,'height':1125});await pg.evaluate("go('home')");await pg.wait_for_timeout(400)
  await pg.screenshot(path=str(OUT/'02-dashboard-unedited.png'))
  await pg.set_viewport_size({'width':393,'height':808})
  for name in ['week','shopping','recipes','pantry','balance','goals']:
   await pg.evaluate(f"go('{name}')");await pg.wait_for_timeout(250)
   await pg.screenshot(path=str(CAP/(name+'-mobile.png')))
  await pg.set_viewport_size({'width':1400,'height':1050});await pg.evaluate("state.settings.theme='dark';applyTheme();go('home')");await pg.wait_for_timeout(300);await pg.screenshot(path=str(CAP/'dark.png'))
  layouts=[slide('01-hero.jpg','','','1.jpg','hero',dark=True),slide('03-plan-to-list.jpg','Your week becomes<br>your shopping list.','One tap · Grouped by aisle · Pantry-aware','2.jpg','duo',['week-mobile','shopping-mobile']),slide('04-week-plan.jpg','The whole week,<br>in one place.','Breakfast, lunch, dinner and the bits between.','3.jpg',screens=['week']),slide('05-on-your-phone.jpg','Take your list<br>to the shops.','Phone setup steps are in your Start Here guide.','6.png','duo',['shopping-mobile','week-mobile']),slide('06-recipes.jpg','Keep your recipes<br>together.','Starter recipes and space for your own favorites.','4.jpg',screens=['recipes']),slide('07-pantry.jpg','See what you<br>already have.','Pantry staples and use-by dates, together.','5.jpg','duo',['pantry-mobile','shopping-mobile']),slide('08-balance.jpg','See your week<br>at a glance.','Food groups, goals and water tracking.',None,'duo',['balance-mobile','goals-mobile'],eyebrow='PLANNING AID · NOT MEDICAL ADVICE'),slide('09-tools.jpg','One app.<br>Your daily tools.','Plan · Cook · Shop · Keep track',kind='grid'),slide('10-private.jpg','A quieter way<br>to plan.','No account · Local browser storage · Dark mode','6.jpg',screens=['dark'],dark=True),slide('11-how-it-works.jpg','Download.<br>Open. Plan.','Buy once · No subscription',kind='steps')]
  compctx=await browser.new_context(device_scale_factor=1);comp=await compctx.new_page();await comp.set_viewport_size({'width':3000,'height':2250})
  for filename,content in layouts:
   layout=CAP/(filename+'.html');layout.write_text(content)
   await comp.goto(uri(layout));await comp.evaluate('document.fonts.ready');await comp.wait_for_timeout(150)
   assert await comp.locator('img').evaluate_all('(imgs)=>imgs.every(i=>i.complete&&i.naturalWidth>0)'),filename
   await comp.screenshot(path=str(OUT/filename),type='jpeg',quality=91)
   print('Rendered '+filename,flush=True)
  # Preview sheet and centered crop: browser-rendered, no retouch of the raw dashboard.
  thumbs=''.join(f'<div><img src="{uri(OUT/f)}"><p>{f}</p></div>' for f in ['01-hero.jpg','02-dashboard-unedited.png']+[a[0] for a in layouts[1:]])
  preview=CAP/'contact.html';preview.write_text('<style>body{margin:0;background:#ddd;font:15px Arial;display:grid;grid-template-columns:repeat(3,400px);gap:10px}img{width:400px;height:300px;object-fit:contain}p{margin:4px}</style>'+thumbs)
  await comp.set_viewport_size({'width':1230,'height':1360});await comp.goto(uri(preview));await comp.screenshot(path=str(OUT/'contact-sheet.png'),full_page=True)
  await comp.set_viewport_size({'width':3000,'height':2250});await comp.goto(uri(CAP/'01-hero.jpg.html'));await comp.screenshot(path=str(OUT/'hero-center-crop-preview.png'),clip={'x':600,'y':0,'width':1800,'height':2250})
  (OUT/'render-report.json').write_text(json.dumps({'app_page_errors':errors,'listing_images':11,'canvas':[3000,2250],'dashboard':'Direct viewport screenshot; no crop, frame, overlay or retouch','source_app':str(ROOT/'1-SELL-THIS/Mediterranean-Meal-Planner.html')},indent=2))
  await browser.close()
if __name__ == '__main__':
 asyncio.run(main())
