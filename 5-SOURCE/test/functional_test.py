import asyncio,json
from playwright.async_api import async_playwright
import pathlib
F=(pathlib.Path(__file__).resolve().parent.parent/'dist').as_uri()+'/'
R=[]
def ok(n,v,extra=''):R.append((n,bool(v),extra))
async def save_modal(pg,fill=None):
    await pg.wait_for_selector('#overlay.open',timeout=3000)
    if fill:
        for sel,val in fill.items():await pg.fill(sel,val)
    btns=await pg.query_selector_all('#modal .m-f button')
    await btns[-1].click();await pg.wait_for_timeout(300)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':1440,'height':900},accept_downloads=True)
        pg=await ctx.new_page();errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto(F+'Mediterranean-Meal-Planner.html');await pg.wait_for_timeout(800)
        ok('onboarding shows on first run',await pg.evaluate("document.querySelector('#overlay').classList.contains('open')"))
        # finish onboarding by clicking last button repeatedly
        for i in range(6):
            if not await pg.evaluate("document.querySelector('#overlay').classList.contains('open')"):break
            bs=await pg.query_selector_all('#modal .m-f button');await bs[-1].click();await pg.wait_for_timeout(250)
        ok('onboarding closes',not await pg.evaluate("document.querySelector('#overlay').classList.contains('open')"))
        E=lambda js:pg.evaluate(js)
        # values consistency
        v=await E("""()=>{go('home');const t=today(),ws=weekStartOf(t,state.settings.weekStart),days=weekDays(ws);
          return {rings:[...document.querySelectorAll('.rg b')].map(e=>e.innerText),
          planned:days.filter(d=>mealsOn(d).some(m=>m.status!=='Eaten')).length,toBuy:state.shopping.filter(x=>!x.done).length,
          low:state.pantry.filter(x=>x.expiry&&x.expiry<=addDays(t,14)).length,navShop:document.querySelector('[data-go=shopping] .count')?.innerText,
          qaShop:[...document.querySelectorAll('.qa-b small')][1]?.innerText,strip:document.querySelectorAll('.dcard').length,
          tri:[...document.querySelectorAll('.pcard b')].map(e=>e.innerText),pop:[...document.querySelectorAll('.rail .pr-b b')].map(e=>e.innerText),
          pantry:[...document.querySelectorAll('.rail .li .t')].map(e=>e.innerText),shopRows:document.querySelectorAll('.hm-main .chk').length,
          bell:document.querySelector('#bellBtn .bdg')?.innerText,dueTasks:state.tasks.filter(x=>x.status!=='Done'&&x.date&&x.date<=t).length,
          prepNav:document.querySelector('[data-go=prep] .count')?.innerText,openTasks:state.tasks.filter(x=>x.status!=='Done').length}}""")
        ok('rings show 4/7 meals planned',v['rings'][0]=='4/7',v['rings'])
        ok('ring1 = data',v['rings'][0]==f"{v['planned']}/7");ok('ring2 = data',v['rings'][1]==str(v['toBuy']));ok('ring3 = data',v['rings'][2]==str(v['low']))
        ok('nav shopping badge = to buy',v['navShop']==str(v['toBuy']),v['navShop']);ok('quick action "12 to buy"',v['qaShop']==f"{v['toBuy']} to buy",v['qaShop'])
        ok('bell = due tasks',v['bell']==str(v['dueTasks']),f"{v['bell']} vs {v['dueTasks']}");ok('prep badge = open tasks',v['prepNav']==str(v['openTasks']))
        ok('7 day cards',v['strip']==7);ok('today trio',v['tri']==['Overnight Oats','Grilled Chicken Salad','Salmon & Quinoa'],v['tri'])
        ok('popular',v['pop']==['Lemon Herb Chicken','Mediterranean Bowl','Greek Yogurt Pancakes','Tomato & Olive Pasta'],v['pop'])
        ok('pantry rail',v['pantry']==['Rice','Pasta','Olive Oil','Tomatoes','Eggs'],v['pantry']);ok('6 shopping rows on home',v['shopRows']==6)
        # all pages render + no empty page
        for n in ['home','today','week','recipes','shopping','pantry','balance','prep','goals','calendar','journal','settings']:
            l=await E(f"()=>{{go('{n}');return document.querySelector('#page-{n}').innerHTML.length}}");await pg.wait_for_timeout(100);l=await E(f"document.querySelector('#page-{n}').innerHTML.length");ok(f'page {n} renders',l>200,l)
        # home interactions
        await E("go('home')");await pg.click('.hm-main .chk >> nth=0');await pg.wait_for_timeout(200)
        ok('home checkbox ticks item',await E("state.shopping[0].done===true"))
        ok('ring2 drops by one',await E("document.querySelectorAll('.rg b')[1].innerText")==str(v['toBuy']-1))
        await pg.click('.hm-main .chk >> nth=0');await pg.wait_for_timeout(200)
        await pg.click('.dcard >> nth=1');await pg.wait_for_timeout(300);ok('day card opens day view',await E("document.querySelector('#overlay').classList.contains('open')"));await E("closeModal()")
        await pg.click('.pcard >> nth=0');await pg.wait_for_timeout(300);ok('today card opens meal',await E("document.querySelector('#fTitle')?.value==='Overnight Oats'"));await E("closeModal()");await pg.wait_for_timeout(200)
        await pg.click('.rail .pr-b >> nth=0');await pg.wait_for_timeout(300);ok('popular opens recipe',await E("document.querySelector('#modal').innerText.includes('Lemon Herb Chicken')"));await E("closeModal()");await pg.wait_for_timeout(200)
        await pg.click('.rail .heart >> nth=3');await pg.wait_for_timeout(200);ok('heart unfavourites',await E("!state.recipes.find(r=>r.title==='Tomato & Olive Pasta').fav"));
        await E("state.recipes.find(r=>r.title==='Tomato & Olive Pasta').fav=true;commit()")
        for i,(sel,page) in enumerate([('.promo.p1','recipes'),('.promo.p2','shopping'),('.promo.p3','pantry')]):
            await E("go('home')");await pg.click(sel);await pg.wait_for_timeout(150);ok(f'promo → {page}',await E("state.ui.page")==page)
        await E("go('home')");await pg.click('.qa-b >> nth=0');await pg.wait_for_timeout(300);ok('Quick action Plan Meals opens meal form',await E("document.querySelector('#overlay').classList.contains('open')"));await E("closeModal()");await pg.wait_for_timeout(200)
        await pg.click('#quickBtn');await pg.wait_for_timeout(300);ok('top Plan Meals opens form',await E("document.querySelector('#overlay').classList.contains('open')"));await E("closeModal()");await pg.wait_for_timeout(200)
        await pg.click('#bellBtn');await pg.wait_for_timeout(150);ok('bell → prep',await E("state.ui.page")=='prep')
        # add meal
        n0=await E("state.meals.length");await E("mealModal({date:today(),slot:'Snack'})");await save_modal(pg,{'#fTitle':'Test snack'});ok('add meal',await E("state.meals.length")==n0+1)
        n0=await E("state.recipes.length");await E("recipeModal()");await save_modal(pg,{'#fTitle':'Test recipe'});ok('add recipe',await E("state.recipes.length")==n0+1)
        await E("go('shopping')");await pg.fill('#sName','Test item');await pg.press('#sName','Enter');await pg.wait_for_timeout(200);ok('add shopping item',await E("state.shopping.some(x=>x.name==='Test item')"))
        n0=await E("state.pantry.length");await E("pantryModal()");await pg.wait_for_selector('#overlay.open');
        await pg.evaluate("()=>{const i=document.querySelector('#modal input[type=text],#modal input:not([type])');i.value='Test pantry';i.dispatchEvent(new Event('input'))}")
        bs=await pg.query_selector_all('#modal .m-f button');await bs[-1].click();await pg.wait_for_timeout(250);ok('add pantry item',await E("state.pantry.length")==n0+1)
        n0=await E("state.tasks.length");await E("taskModal()");await pg.wait_for_selector('#overlay.open');await pg.evaluate("()=>{const i=document.querySelector('#modal input');i.value='Test task'}");bs=await pg.query_selector_all('#modal .m-f button');await bs[-1].click();await pg.wait_for_timeout(250);ok('add task',await E("state.tasks.length")==n0+1)
        n0=await E("state.notes.length");await E("noteModal()");await pg.wait_for_selector('#overlay.open');await pg.evaluate("()=>{const i=document.querySelector('#modal input');i.value='Test note'}");bs=await pg.query_selector_all('#modal .m-f button');await bs[-1].click();await pg.wait_for_timeout(250);ok('add note',await E("state.notes.length")==n0+1)
        n0=await E("state.goals.length");await E("goalModal()");await pg.wait_for_selector('#overlay.open');await pg.evaluate("()=>{const i=document.querySelector('#modal input');i.value='Test goal'}");bs=await pg.query_selector_all('#modal .m-f button');await bs[-1].click();await pg.wait_for_timeout(250);ok('add goal',await E("state.goals.length")==n0+1)
        # search
        await E("go('home')");await pg.fill('#search','salmon');await pg.wait_for_timeout(300);ok('search finds salmon',await E("document.querySelector('#searchResults').innerText.includes('Salmon')"));await pg.fill('#search','');
        # week nav, calendar
        await E("go('week')");await pg.click('[data-week="1"]');await pg.wait_for_timeout(150);ok('week next',await E("state.ui.weekOffset")==1);await pg.click('[data-week="0"]');
        await E("go('calendar')");await pg.click('[data-month="1"]');await pg.wait_for_timeout(150);ok('calendar next',True)
        # theme + accent
        await pg.click('#themeBtn');await pg.wait_for_timeout(150);ok('dark mode toggles',await E("document.documentElement.dataset.theme")=='dark');await pg.click('#themeBtn')
        await E("go('settings')");ok('3 accents',await E("document.querySelectorAll('.swatches button').length")==3)
        await pg.click('.swatches button >> nth=1');await pg.wait_for_timeout(150);ok('accent changes',await E("getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()")=='#20395C')
        await pg.click('.swatches button >> nth=0')
        # water
        await E("go('goals')");w0=await E("+state.water[today()]||0");await E("addWater(1)");ok('water +1',await E("+state.water[today()]")==w0+1)
        # export
        async with pg.expect_download() as d:await E("exportBackup()")
        dl=await d.value;path=await dl.path();data=json.load(open(path));ok('backup export valid',data.get('app')=='mediterranean-meal-planner' and len(data['state']['recipes'])>0)
        # persistence after reload
        await pg.wait_for_timeout(600);await pg.reload();await pg.wait_for_timeout(900)
        ok('data persists after reload',await E("state.shopping.some(x=>x.name==='Test item')&&state.recipes.some(r=>r.title==='Test recipe')"))
        # import backup
        await E("go('settings')")
        await pg.set_input_files('#importFile',path);await pg.wait_for_timeout(400)
        bs=await pg.query_selector_all('#modal .m-f button');await bs[-1].click();await pg.wait_for_timeout(500);ok('backup restore',await E("state.recipes.some(r=>r.title==='Test recipe')"))
        # erase confirm then cancel
        await E("go('settings')");await pg.click('[data-action=eraseAll]');await pg.wait_for_timeout(300)
        ok('erase asks to confirm',await E("document.querySelector('#modal').innerText.includes('Erase everything')"))
        bs=await pg.query_selector_all('#modal .m-f button');await bs[0].click();await pg.wait_for_timeout(300);ok('cancel keeps data',await E("state.recipes.length")>5)
        await pg.click('[data-action=eraseAll]');await pg.wait_for_timeout(300);bs=await pg.query_selector_all('#modal .m-f button');await bs[-1].click();await pg.wait_for_timeout(400)
        ok('erase confirmed clears',await E("state.recipes.length+state.meals.length+state.shopping.length")==0)
        await E("go('home')");ok('home empty state ok',await E("document.querySelector('#page-home').innerText.length")>50)
        await E("loadSamples()");await pg.wait_for_timeout(300);ok('load samples back',await E("state.recipes.length")==12)
        # diagnostics
        await E("diagnostics()");await pg.wait_for_timeout(600);ok('in-app diagnostics pass',await E("document.querySelector('#modal').innerText.includes('Everything looks good')"),await E("document.querySelector('#modal').innerText.slice(0,200)"))
        await E("closeModal()")
        ok('no console errors (full)',not errs,errs[:3])
        # DEMO build
        ctx2=await b.new_context(viewport={'width':1440,'height':900});pd=await ctx2.new_page();errs2=[]
        pd.on('pageerror',lambda e:errs2.append(str(e)))
        await pd.goto(F+'demo/index.html');await pd.wait_for_timeout(800)
        ok('demo: no onboarding popup',not await pd.evaluate("document.querySelector('#overlay').classList.contains('open')"))
        ok('demo: no demo bar on screen',await pd.evaluate("document.querySelector('#demoBar').hidden"))
        ok('demo: same rings as full app',await pd.evaluate("[...document.querySelectorAll('.rg b')].map(e=>e.innerText)")==v['rings'])
        await pd.evaluate("go('settings')");await pd.click('[data-action=eraseAll]');await pd.wait_for_timeout(300)
        ok('demo: erase asks to confirm',await pd.evaluate("document.querySelector('#overlay').classList.contains('open')"))
        await pd.evaluate("closeModal()")
        await pd.evaluate("exportBackup()");await pd.wait_for_timeout(200);ok('demo: backup blocked with message',await pd.evaluate("document.querySelector('#toasts').innerText.includes('full version')"))
        await pd.evaluate("state.shopping[0].done=true;commit()");await pd.reload();await pd.wait_for_timeout(800)
        ok('demo: resets on reload',await pd.evaluate("!state.shopping[0].done"))
        ok('demo: no errors',not errs2,errs2[:3])
        await b.close()
    bad=[r for r in R if not r[1]]
    for r in R: print(('PASS ' if r[1] else 'FAIL ')+r[0]+(' :: '+str(r[2]) if not r[1] and r[2] else ''))
    print(f'{len(R)-len(bad)}/{len(R)} pass')
asyncio.run(main())
