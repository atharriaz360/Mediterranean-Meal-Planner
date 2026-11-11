import sys,json
from playwright.sync_api import sync_playwright
APP='file:///home/claude/w/app.html';O='/home/claude/w/cap/';import os;os.makedirs(O,exist_ok=True);err=[]
DISMISS="""()=>{for(const b of document.querySelectorAll('button')){const t=b.textContent.trim();const r=b.getBoundingClientRect();if(!r.width)continue;
 if(t==='Later'){b.click();continue}
 const box=b.closest('div,section');if(box&&/sample week/.test(box.textContent)&&(t==='×'||t==='✕'||/close|dismiss/i.test(b.getAttribute('aria-label')||'')||t===''))b.click()}}"""
def boot(b,vw,vh,sc,mob=False):
  c=b.new_context(viewport={'width':vw,'height':vh},device_scale_factor=sc,color_scheme='light',offline=True,is_mobile=mob,has_touch=mob)
  p=c.new_page();p.on('pageerror',lambda e:err.append(str(e)));p.goto(APP);p.wait_for_timeout(1100)
  for _ in range(6):
    if not p.locator('#overlay.open').count():break
    p.locator('#modal .m-f button').last.click();p.wait_for_timeout(300)
  p.wait_for_timeout(4500);p.evaluate(DISMISS);p.wait_for_timeout(400);p.evaluate(DISMISS)
  return p
def quiet(p):
  try:p.locator('#toasts .toast').first.wait_for(state='hidden',timeout=12000)
  except Exception:pass
  p.evaluate(DISMISS);p.wait_for_timeout(250)
def go(p,n):
  ok=p.evaluate(f"(()=>{{const e=[...document.querySelectorAll('[data-go=\"{n}\"]')].find(x=>x.getBoundingClientRect().width);if(e){{e.click();return 1}}return 0}})()")
  if not ok:p.evaluate(f"location.hash='{n}'")
  p.wait_for_timeout(500);p.evaluate("scrollTo(0,0)");p.wait_for_timeout(200);return ok
def shop(p):
  go(p,'week');p.evaluate("(()=>{const e=document.querySelector('#page-week [data-action=genShopping]');e&&e.click()})()");p.wait_for_timeout(700)
  for _ in range(3):
    if p.locator('#overlay.open').count():p.locator('#modal .m-f button').last.click();p.wait_for_timeout(300)
  quiet(p)
SCAN="""(sel)=>{const H=innerHeight;const nav=document.querySelector('.bottom-nav');const nt=nav?nav.getBoundingClientRect().top:H;const hdr=document.querySelector('header,.topbar,.m-top');const hb=hdr?hdr.getBoundingClientRect().bottom:0;
 const pg=document.querySelector('.page.active,[id^=page-]:not([hidden])');const el=sel?document.querySelector(sel):null;const tgt=el?el.getBoundingClientRect().top+scrollY-hb-14:0;const MX=document.documentElement.scrollHeight-H;const ok=[];
 for(let y=0;y<=MX;y+=2){scrollTo(0,y);const L=[...pg.querySelectorAll('*:not(option)')].filter(e=>!e.children.length||e.tagName=='BUTTON'||e.tagName=='INPUT').map(e=>e.getBoundingClientRect()).filter(r=>r.height>2&&r.width>2);
  if(!L.some(r=>(r.top<hb+2&&r.bottom>hb-2)||(r.top<nt+2&&r.bottom>nt-6)))ok.push(y)}
 let y=ok.length?ok.reduce((a,v)=>Math.abs(v-tgt)<Math.abs(a-tgt)?v:a):0;scrollTo(0,y);return {hb,nt,tgt,y,n:ok.length}}"""
with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  p=boot(b,1512,982,2)
  print('go-sidebar',{n:p.evaluate(f"document.querySelectorAll('[data-go=\"{n}\"]').length") for n in ['home','today','week','calendar','recipes','shopping','pantry','prep','balance','goals','journal','settings']})
  shop(p)
  for n in ['home','week','calendar','recipes','shopping','pantry','prep','balance','goals','journal','settings','today']:
    go(p,n);quiet(p);p.screenshot(path=O+f'lap-{n}.png',animations='disabled')
  p.context.close()
  t=boot(b,1180,820,2,True);shop(t)
  for n in ['shopping','balance','recipes','home']:
    go(t,n);quiet(t);t.screenshot(path=O+f'tab-{n}.png',animations='disabled')
  t.context.close()
  m=boot(b,393,772,3,True);shop(m)
  for n,sel in [('home',None),('today',None),('week',None),('recipes',None),('shopping','#page-shopping .aisle'),('pantry',None),('settings',None)]:
    go(m,n);quiet(m);r=m.evaluate(SCAN,sel);print(n,r);m.wait_for_timeout(200);m.screenshot(path=O+f'ph-{n}.png',animations='disabled')
  m.context.close();b.close()
print('errors',err)
