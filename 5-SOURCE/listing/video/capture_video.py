from playwright.sync_api import sync_playwright
import json
APP='file:///home/claude/mmp/1-SELL-THIS/Mediterranean-Meal-Planner.html';O='/home/claude/w/cap/';err=[];box={}
SCAN2="""(n)=>{const H=innerHeight,nav=document.querySelector('.bottom-nav'),nr=nav.getBoundingClientRect(),nt=nr.top,nbt=nr.bottom;const hdr=document.querySelector('header,.topbar,.m-top');const hb=hdr?hdr.getBoundingClientRect().bottom:0;const pg=document.querySelector('#page-'+n);const MX=document.documentElement.scrollHeight-H;
 const bad=()=>[...pg.querySelectorAll('*')].filter(e=>!e.children.length||/^(BUTTON|INPUT|IMG|SELECT|LABEL)$/.test(e.tagName)).map(e=>e.getBoundingClientRect()).filter(r=>r.height>2&&r.width>2).some(r=>(r.top<nt+1&&r.bottom>nt-4)||(r.top<hb-1&&r.bottom>hb+1)||(r.top>nbt-2&&r.top<H&&r.bottom>H+1));
 for(let y=0;y<=Math.min(MX,400);y+=2){scrollTo(0,y);if(!bad())return {y,nt}}scrollTo(0,0);return {y:-1,nt}}"""
def bb(p,sel):
  return p.evaluate(f"(()=>{{const e=[...document.querySelectorAll({json.dumps(sel)})].find(x=>{{const r=x.getBoundingClientRect();return r.width&&r.top>=0&&r.bottom<=innerHeight}});if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}})()")
with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  c=b.new_context(viewport={'width':402,'height':815},device_scale_factor=3,color_scheme='light',offline=True,is_mobile=True,has_touch=True)
  p=c.new_page();p.on('pageerror',lambda e:err.append(str(e)));p.goto(APP);p.wait_for_timeout(1100)
  for _ in range(6):
    if not p.locator('#overlay.open').count():break
    p.locator('#modal .m-f button').last.click();p.wait_for_timeout(300)
  p.wait_for_timeout(4500);p.evaluate("state.settings.sampleHintHidden=true;commit()")
  try:p.locator('#toasts .toast').first.wait_for(state='hidden',timeout=12000)
  except Exception:pass
  def go(n,fixed=None):
    p.evaluate(f"(()=>{{const e=[...document.querySelectorAll('[data-go=\"{n}\"]')].find(x=>x.getBoundingClientRect().width);e.click()}})()");p.wait_for_timeout(800)
    if fixed is not None:p.evaluate(f"scrollTo(0,{fixed})");box['scan_'+n]={'y':fixed}
    else:box['scan_'+n]=p.evaluate(SCAN2,n)
    p.wait_for_timeout(300)
  go('week',2);p.screenshot(path=O+'ph-week.png');box['tab_shop']=bb(p,'.bottom-nav [data-go="shopping"]')
  go('shopping');p.screenshot(path=O+'ph-shop0.png')
  for j in range(2):
    r=p.evaluate("(()=>{const cb=[...document.querySelectorAll('#page-shopping .chk[data-shop]')].find(e=>{const r=e.getBoundingClientRect();return !e.checked&&r.width&&r.top>60&&r.bottom<700});if(!cb)return null;const r=cb.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()")
    box[f'tick{j}']=r;p.mouse.click(r[0],r[1]);p.wait_for_timeout(450);p.evaluate(f"scrollTo(0,{box['scan_shopping']['y']})");p.wait_for_timeout(300)
    try:p.locator('#toasts .toast').first.wait_for(state='hidden',timeout=8000)
    except Exception:pass
    p.screenshot(path=O+f'ph-shop{j+1}.png')
  box['tab_rec']=bb(p,'.bottom-nav [data-go="recipes"]')
  go('recipes');p.screenshot(path=O+'ph-recipes.png')
  b.close()
print(json.dumps(box),err)
json.dump(box,open('/home/claude/w/boxes.json','w'))
