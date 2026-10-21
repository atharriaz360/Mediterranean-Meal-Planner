import asyncio,pathlib,json
from playwright.async_api import async_playwright
F=((pathlib.Path(__file__).resolve().parent.parent/'dist'/'Mediterranean-Meal-Planner.html')).as_uri()
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch();c=await b.new_context();a=await c.new_page();await a.goto(F);await a.wait_for_timeout(1000);await a.evaluate('closeModal()');await a.wait_for_timeout(500)
  z=await c.new_page();await z.goto(F);await z.wait_for_timeout(1000)
  await a.evaluate("state.notes.push({id:'tab-a',title:'keep',text:'',date:today()});commit()");await a.wait_for_timeout(600)
  await z.evaluate("closeModal();state.notes.push({id:'tab-b',title:'stale',text:'',date:today()});commit()");await z.wait_for_timeout(600)
  assert await z.evaluate('Store.conflict'), 'stale tab blocked'
  await a.reload();await a.wait_for_timeout(1000);assert await a.evaluate("state.notes.some(n=>n.id==='tab-a')&&!state.notes.some(n=>n.id==='tab-b')")
  print('PASS concurrent tabs preserve saved data')
  await a.evaluate("closeModal();state.settings.theme='dark';applyTheme();commit()");await a.wait_for_timeout(500);await a.reload();await a.wait_for_timeout(900);assert await a.evaluate("document.documentElement.dataset.theme==='dark'");print('PASS dark theme survives reload')
  await a.evaluate("closeModal();noteModal()");await a.fill('#modal input','Double click');await a.evaluate("document.querySelector('#modal .m-f button:last-child').click();document.querySelector('#modal .m-f button:last-child').click()");await a.wait_for_timeout(500);assert await a.evaluate("state.notes.filter(n=>n.title==='Double click').length===1");print('PASS duplicate modal submission blocked')
  for width,theme,name in [(1440,'light','desktop-light'),(1440,'dark','desktop-dark'),(390,'light','phone')]:
   await a.set_viewport_size({'width':width,'height':900});await a.evaluate("t=>{closeModal();state.settings.theme=t;applyTheme();go('home')}",theme);await a.wait_for_timeout(300)
   assert await a.evaluate('document.documentElement.scrollWidth<=innerWidth'),name+' overflow'
   await a.screenshot(path='/private/tmp/meal-planner-'+name+'.png',full_page=True)
   for page in ['today','week','recipes','shopping','pantry','balance','prep','goals','calendar','journal','settings']:
    await a.evaluate('go',page);await a.wait_for_timeout(70);assert await a.evaluate('document.documentElement.scrollWidth<=innerWidth'),name+' '+page+' overflow'
  print('PASS all pages fit desktop light/dark and 390px phone')
  await c.close()
  c=await b.new_context();a=await c.new_page();await a.add_init_script("indexedDB.open=()=>{throw new Error('unavailable')};localStorage.setItem('mediterranean-meal-planner:state','{broken')");await a.goto(F);await a.wait_for_timeout(1500);assert await a.locator('.boot-block').count();assert await a.evaluate("localStorage.getItem('mediterranean-meal-planner:state')==='{broken'");print('PASS malformed fallback storage is preserved')
  await c.close()
  c=await b.new_context();a=await c.new_page();await a.goto(F);await a.wait_for_timeout(900)
  await a.evaluate("closeModal();go('shopping')");await a.fill('#sName','Preserve typing');await a.evaluate('addWater(1)');assert await a.locator('#sName').input_value()=='Preserve typing';assert await a.evaluate("document.activeElement.id==='sName'");print('PASS updates preserve focus and typed text')
  assert await a.evaluate("(()=>{const before={notes:[{id:'a',title:'old'}]},after={notes:[]},current={notes:[{id:'b',title:'new'}]};return undoChanges(before,after,current).notes.length===2})()");print('PASS undo preserves later additions')
  await a.evaluate("go('home')");await a.locator('.hm-main .chk').first.focus();await a.locator('.hm-main .chk').first.press('Space');assert await a.evaluate("document.activeElement.matches('.chk')");print('PASS checkbox updates preserve keyboard focus')
  await a.evaluate("recipeModal()");await a.fill('#fTitle','Invalid negative');await a.fill('#fCal','-1');await a.locator('#modal .m-f button').last.click();assert await a.locator('#overlay.open').count();assert not await a.evaluate("state.recipes.some(r=>r.title==='Invalid negative')");print('PASS invalid numeric form stays open')
  await a.evaluate("closeModal();state.notes.push({id:'csv-check',title:'=1+1',text:'',date:today()});state.tasks.push({id:'csv-task',title:'=1+1',date:today(),priority:'Low',status:'Open'});commit()")
  async with a.expect_download() as download:await a.evaluate('exportCSV()')
  path=await (await download.value).path();assert "'=1+1" in pathlib.Path(path).read_text();print('PASS CSV escapes formula prefixes')
  await a.evaluate("closeModal();Store.db.onversionchange()");assert not await a.evaluate('flush()');assert await a.evaluate("document.querySelector('#banners').innerText.includes('Reload before saving')");print('PASS version change closes connection and blocks writes')
  await c.close();c=await b.new_context();a=await c.new_page();await a.goto(F);await a.wait_for_timeout(900)
  await a.evaluate("async()=>{closeModal();clearTimeout(saveTimer);saveTimer=null;await Store.set('state',null)}");await a.reload();await a.wait_for_timeout(1000)
  assert await a.evaluate("(async()=>{const tx=Store.db.transaction('kv');const keys=await new Promise(r=>{const q=tx.objectStore('kv').getAllKeys();q.onsuccess=()=>r(q.result)});return keys.some(k=>String(k).startsWith('state_recovery_'))})()");print('PASS null saved data gets recovery copy')
  await a.evaluate("async()=>{closeModal();clearTimeout(saveTimer);saveTimer=null;await Store.set('state',{app:APP.key,state:[]})}")
  await a.add_init_script("const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(String(key).startsWith('state_recovery_'))throw new Error('Recovery storage full');return put.call(this,value,key)}")
  await a.reload();await a.wait_for_timeout(1000);assert await a.locator('.boot-block').count();assert await a.evaluate("Store.idbGet('state').then(s=>Array.isArray(s.state))");print('PASS failed recovery copy blocks overwrite')
  await b.close()
asyncio.run(main())
