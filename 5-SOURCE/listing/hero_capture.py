import sys
from playwright.sync_api import sync_playwright
app,out=sys.argv[1],sys.argv[2];err=[]
DISMISS="""()=>{for(const b of document.querySelectorAll('button')){const t=b.textContent.trim();const r=b.getBoundingClientRect();if(!r.width)continue;
 if(t==='Later'){b.click();continue}
 const box=b.closest('div,section');if(box&&/sample week/.test(box.textContent)&&(t==='×'||t==='✕'||/close|dismiss/i.test(b.getAttribute('aria-label')||'')||t===''))b.click()}}"""
SCAN="""()=>{const H=innerHeight;const nav=document.querySelector('.bottom-nav').getBoundingClientRect();const hb=62;
 const prod=document.querySelector('#page-shopping .aisle').getBoundingClientRect().top+scrollY;const MX=document.documentElement.scrollHeight-H;
 const ok=[];for(let y=0;y<=MX;y++){scrollTo(0,y);const L=[...document.querySelectorAll('#page-shopping *:not(option)')].filter(e=>!e.children.length||e.tagName=='BUTTON'||e.tagName=='INPUT').map(e=>e.getBoundingClientRect()).filter(r=>r.height>2);
  const bad=L.some(r=>(r.top<hb+2&&r.bottom>hb-2)||(r.top<nav.top+2&&r.bottom>nav.top-6)||(r.bottom>nav.bottom-1&&r.top<H));if(!bad)ok.push(y)}
 return {prod,ok}}"""
def boot(b,vw,vh,sc,mob=False):
  c=b.new_context(viewport={'width':vw,'height':vh},device_scale_factor=sc,color_scheme='light',offline=True,is_mobile=mob,has_touch=mob)
  p=c.new_page();p.on('pageerror',lambda e:err.append(str(e)));p.goto('file://'+app);p.wait_for_timeout(1100)
  for _ in range(6):
    if not p.locator('#overlay.open').count():break
    p.locator('#modal .m-f button').last.click();p.wait_for_timeout(300)
  p.wait_for_timeout(4500);p.evaluate(DISMISS);p.wait_for_timeout(500);p.evaluate(DISMISS);p.wait_for_timeout(400)
  try:p.locator('#toasts .toast').first.wait_for(state='hidden',timeout=15000)
  except Exception:pass
  return p
with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  if 'lap' in sys.argv[3:]:
    p=boot(b,1512,982,2);p.wait_for_timeout(500);p.screenshot(path=out+'/lap-home.png',animations='disabled');p.context.close()
  best=None
  for vh in range(788,802):
    m=boot(b,393,vh,3,True)
    m.evaluate("document.querySelector('.bottom-nav [data-go=week]').click()");m.wait_for_timeout(400)
    m.evaluate("document.querySelector('#page-week [data-action=genShopping]').click()");m.wait_for_timeout(800)
    try:m.locator('#toasts .toast').first.wait_for(state='hidden',timeout=15000)
    except Exception:pass
    m.evaluate(DISMISS);r=m.evaluate(SCAN);tgt=r['prod']-62-14
    if r['ok']:
      y=min(r['ok'],key=lambda v:abs(v-tgt));d=abs(y-tgt);print(vh,y,round(d))
      if best is None or d<best[2]:
        best=(vh,y,d);m.evaluate(f"scrollTo(0,{y})");m.wait_for_timeout(300);m.screenshot(path=out+'/ph-shop.png',animations='disabled')
    m.context.close()
  print('pick',best,'errors',err);b.close()
