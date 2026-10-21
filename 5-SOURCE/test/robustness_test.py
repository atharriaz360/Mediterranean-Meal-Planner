"""Security / data-integrity / accessibility regression tests. Run after `python3 build.py`."""
import asyncio,json,pathlib,tempfile,os
from playwright.async_api import async_playwright
F=(pathlib.Path(__file__).resolve().parent.parent/'dist'/'Mediterranean-Meal-Planner.html').as_uri()
TMP=tempfile.mkdtemp();R=[]
def ok(n,v,extra=''):R.append((n,bool(v),extra))
def wf(name,obj):p=os.path.join(TMP,name);open(p,'w').write(obj if isinstance(obj,str) else json.dumps(obj));return p
async def page(b,init=None,**kw):
    ctx=await b.new_context(viewport={'width':1440,'height':900},**kw);pg=await ctx.new_page();errs=[];reqs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('request',lambda r:reqs.append(r.url))
    pg.on('dialog',lambda d:asyncio.ensure_future(d.dismiss()))
    if init:await pg.add_init_script(init)
    return ctx,pg,errs,reqs
async def restore(pg,path):
    await pg.evaluate("closeModal();go('settings')");await pg.wait_for_timeout(250)
    await pg.set_input_files('#importFile',path);await pg.wait_for_timeout(400)
    opened=await pg.evaluate("document.querySelector('#overlay').classList.contains('open')")
    if opened:
        bs=await pg.query_selector_all('#modal .m-f button');await bs[-1].click();await pg.wait_for_timeout(400)
    return opened
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    ctx,pg,errs,reqs=await page(b)
    await pg.goto(F);await pg.wait_for_timeout(900)
    ok('no network requests on load',not [r for r in reqs if not r.startswith(('file:','data:','blob:'))])
    X='<img src=x onerror="window.__x=1">"\'><svg onload=window.__x=2>'
    await pg.evaluate("""X=>{closeModal();state.recipes.push({id:'r1',title:X,category:'Dinner',time:5,servings:2,calories:'',groups:[],tags:X,ingredients:[X],method:X,fav:true,image:''});
      state.meals.push({id:'m1',date:today(),slot:'Dinner',title:X,recipeId:null,calories:'',groups:[],status:'Planned',notes:X});
      state.shopping.unshift({id:'s1',name:X,qty:X,aisle:'Other',done:false});state.pantry.unshift({id:'p1',name:X,qty:X,aisle:'Other',expiry:today()});
      state.notes.push({id:'n1',title:X,text:X,date:today(),pinned:true});state.tasks.push({id:'t1',title:X,date:today(),priority:'High',status:'Open'});
      state.goals.push({id:'g1',title:X,description:X,progress:10,deadline:today(),status:'Active'});state.profile.name=X;commit()}""",X)
    for n in ['home','today','week','recipes','shopping','pantry','balance','prep','goals','calendar','journal','settings']:
        await pg.evaluate(f"go('{n}')");await pg.wait_for_timeout(120)
    await pg.evaluate("recipeDetail('r1')");await pg.wait_for_timeout(200);await pg.evaluate("closeModal()")
    await pg.fill('#search','img');await pg.wait_for_timeout(300)
    ok('typed script payloads never run',not await pg.evaluate("window.__x"))
    evil={'app':'mediterranean-meal-planner','version':2,'state':{'settings':{'onboarded':True,'accent':'x"><img src=x onerror=window.__y=9>','theme':'<b>'},'ui':{'page':'nope'},
      'recipes':[{'id':'a" onmouseover="window.__y=1','title':'Evil','category':'<x>','time':'5"','groups':['veg','<x>'],'ingredients':['a'],'method':'m','image':'x" onerror="window.__y=2','art':'"><x','fav':True}],
      'meals':[{'id':'b"><img src=x onerror=window.__y=3>','date':'2026-10-11','slot':'Dinner"><x','title':'E','recipeId':'a" onmouseover="window.__y=1','status':'Planned'},{'id':'bad-date','date':'2026-02-31','slot':'Lunch','title':'X'}],
      'shopping':[{'id':'c"><img src=x onerror=window.__y=4>','name':'n','qty':'1','aisle':'Other<img src=x onerror=window.__y=5>','done':False}],'pantry':[{'name':'p','expiry':'"><x'}],'tasks':[{'title':'t','priority':'<x>'}],'goals':[{'title':'g','progress':'999'}],'notes':[{'title':'n','date':'x'}],'water':{'"><x':3,'2026-10-11':'5'}}}
    await restore(pg,wf('evil.json',evil))
    for n in ['home','today','week','recipes','shopping','pantry','calendar','prep','goals','journal','settings']:
        await pg.evaluate(f"go('{n}')");await pg.wait_for_timeout(150)
    await pg.evaluate("document.querySelectorAll('*').forEach(e=>e.dispatchEvent(new MouseEvent('mouseover')))")
    await pg.wait_for_timeout(300)
    ok('crafted backup cannot inject handlers',await pg.evaluate("document.querySelectorAll('[onmouseover],[onerror],[onload]').length")==0)
    ok('crafted backup cannot run code',not await pg.evaluate("window.__y"))
    v=await pg.evaluate("({r:state.recipes[0],m:state.meals,s:state.shopping[0],set:state.settings,w:state.water,g:state.goals[0].progress,ui:state.ui.page})")
    ok('ids rewritten to safe values',all(c.isalnum() or c in '-_' for c in v['r']['id']+v['s']['id']))
    ok('meal kept its recipe link after id rewrite',v['m'][0]['recipeId']==v['r']['id'])
    ok('invalid calendar date dropped (Feb 31)',len(v['m'])==1)
    ok('unsafe image removed',v['r']['image']=='');ok('enum fields whitelisted',v['r']['category']=='Dinner' and v['m'][0]['slot']=='Dinner' and v['s']['aisle'] in ['Produce','Other'] and v['set']['accent']=='forest' and v['set']['theme']=='system')
    ok('numbers clamped',v['g']==100 and v['w']=={'2026-10-11':5},(v['g'],v['w']))
    for name,content in [('notjson.json','{oops'),('wrongapp.json',{'app':'other'}),('array.json',[1,2]),('nullstate.json',{'app':'mediterranean-meal-planner','state':None}),('arraystate.json',{'app':'mediterranean-meal-planner','state':[1]})]:
        await pg.evaluate("loadSamples()");n0=await pg.evaluate("state.recipes.length")
        opened=await restore(pg,wf(name,content))
        ok(f'rejects malformed backup: {name}',not opened and await pg.evaluate("state.recipes.length")==n0)
    await restore(pg,wf('v1.json',{'version':1,'meals':[{'id':'x1','date':'2026-10-12','type':'Dinner','title':'Old meal','calories':'500'}],'recipes':[{'title':'Old recipe','time':'20 min'}],'grocery':[{'name':'Feta','qty':'1'}]}))
    ok('migrates v1 (pre-rename) backups',await pg.evaluate("state.meals.length===1&&state.recipes[0].title==='Old recipe'&&state.shopping[0].aisle==='Dairy & Eggs'"))
    await pg.evaluate("loadSamples();go('home')");await pg.wait_for_timeout(200)
    small=await pg.evaluate("""()=>[...document.querySelectorAll('#page-home .chk,#page-home .heart,#page-home .link')].filter(e=>{const r=e.getBoundingClientRect();return r.width<44||r.height<44}).length""")
    ok('home checkboxes/hearts/links have 44px hit areas',small==0,small)
    await ctx.close()
    # storage cannot open but data existed -> no samples, no overwrite
    ctx,pg,errs,reqs=await page(b)
    await pg.goto(F);await pg.wait_for_timeout(900);await pg.evaluate("closeModal();state.recipes.push({id:'KEEP',title:'Mine',category:'Dinner',groups:[],ingredients:[]});commit()");await pg.wait_for_timeout(800)
    p2=await ctx.new_page();await p2.add_init_script("indexedDB.open=function(){const r={};setTimeout(()=>r.onerror&&r.onerror({}),5);return r}")
    await p2.goto(F);await p2.wait_for_timeout(1500)
    ok('storage failure shows recovery screen (not samples)',await p2.evaluate("!!document.querySelector('.boot-block')"))
    await p2.click('#bbTemp');await p2.wait_for_timeout(500)
    ok('temporary planner is labelled and does not save',await p2.evaluate("Store.mode==='memory'&&document.querySelector('#banners').innerText.includes('Temporary planner')"))
    await p2.evaluate("state.recipes=[];commit()");await p2.wait_for_timeout(600);await p2.close()
    p3=await ctx.new_page();await p3.goto(F);await p3.wait_for_timeout(1000)
    ok('real data intact after storage recovers',await p3.evaluate("state.recipes.some(r=>r.id==='KEEP')"))
    # read error on open db
    p4=await ctx.new_page();await p4.add_init_script("const g=IDBObjectStore.prototype.get;IDBObjectStore.prototype.get=function(k){if(k==='state')throw new Error('read fail');return g.call(this,k)}")
    await p4.goto(F);await p4.wait_for_timeout(1200);ok('read error does not overwrite saved data',await p4.evaluate("!!document.querySelector('.boot-block')"));await p4.close()
    p5=await ctx.new_page();await p5.goto(F);await p5.wait_for_timeout(1000);ok('...still intact',await p5.evaluate("state.recipes.some(r=>r.id==='KEEP')"));await ctx.close()
    # corrupt saved data -> kept + fresh start
    ctx,pg,errs,reqs=await page(b)
    await pg.goto(F);await pg.wait_for_timeout(900);await pg.evaluate("closeModal()");await pg.wait_for_timeout(800);await pg.evaluate("clearTimeout(saveTimer);save=()=>{};Store.set('state',{app:'mediterranean-meal-planner',state:[1]})");await pg.wait_for_timeout(300)
    await pg.reload();await pg.wait_for_timeout(1200)
    keys=await pg.evaluate("new Promise(r=>{const q=indexedDB.open('mediterranean-meal-planner-planner');q.onsuccess=()=>{const k=q.result.transaction('kv').objectStore('kv').getAllKeys();k.onsuccess=()=>r(k.result)}})")
    ok('corrupt save is kept as recovery copy',any(str(k).startswith('state_recovery_') for k in keys),keys)
    await ctx.close()
    # quota error banner
    ctx,pg,errs,reqs=await page(b)
    await pg.goto(F);await pg.wait_for_timeout(900);await pg.evaluate("closeModal();Store.set=async()=>{const e=new Error('q');e.name='QuotaExceededError';throw e};state.notes.push({id:'q',title:'q',text:'',date:today()});commit()");await pg.wait_for_timeout(800)
    ok('quota error shows banner immediately',await pg.evaluate("document.querySelector('#banners').innerText.includes('wasn’t saved')"))
    await ctx.close()
    ctx,pg,errs,reqs=await page(b,offline=True)
    await ctx.set_offline(True);await pg.goto(F);await pg.wait_for_timeout(900)
    ok('works offline',await pg.evaluate("document.querySelector('#page-home').innerHTML.length>500"));ok('no page errors offline',not errs,errs[:2])
    await ctx.close();await b.close()
  bad=[r for r in R if not r[1]]
  for r in R:print(('PASS ' if r[1] else 'FAIL ')+r[0]+(' :: '+str(r[2]) if not r[1] and r[2]!='' else ''))
  print(f'{len(R)-len(bad)}/{len(R)} pass')
asyncio.run(main())
if any(not result[1] for result in R):raise SystemExit(1)
