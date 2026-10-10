/* ---------------- state ---------------- */
let state=null;
const COLLECTIONS=['recipes','meals','shopping','pantry','tasks','goals','notes'];
function defaultWeekStart(){try{const l=navigator.language||'';return /^(en-US|en-CA|pt-BR|ja|he|en-PH)/.test(l)?0:1}catch(e){return 1}}
function blankState(){
 return {app:'mediterranean-meal-planner',version:2,createdAt:new Date().toISOString(),
  profile:{name:'',plannerName:'My Mediterranean Planner'},
  settings:{theme:'system',accent:'aegean',weekStart:defaultWeekStart(),waterGoal:8,dateFormat:'auto',showCalories:true,backupRemind:true,lastBackup:null,onboarded:false,sampleCleared:false},
  recipes:[],meals:[],shopping:[],pantry:[],tasks:[],goals:[],notes:[],water:{},
  ui:{page:'home',weekOffset:0,calMonth:null,calYear:null,recipeFilter:'All',shopFilter:'open',backupSnooze:null}};
}
function sampleState(){
 const s=blankState();const R=(o)=>Object.assign({id:uid(),isSample:true,fav:false,image:''},o);
 s.recipes=[
  R({title:'Greek Chickpea Salad',category:'Lunch',time:15,servings:2,calories:480,art:'salad',fav:true,groups:['veg','legumes','oliveoil','dairy'],tags:'no-cook, meal prep',
   ingredients:['1 can chickpeas, rinsed','2 tomatoes, chopped','1 cucumber, diced','1/2 red onion, thinly sliced','60 g feta','handful of Kalamata olives','2 tbsp extra virgin olive oil','1 lemon','1 tsp dried oregano'],
   method:'Add the chickpeas, tomatoes, cucumber and onion to a large bowl.\nWhisk the olive oil with the juice of half the lemon, the oregano and a pinch of salt.\nToss everything together, then crumble over the feta and scatter the olives.\nKeeps well in the fridge for 2 days, so it works for packed lunches.'}),
  R({title:'Lemon Herb Salmon with Greens',category:'Dinner',time:25,servings:2,calories:560,art:'salmon',fav:true,groups:['fish','veg','oliveoil'],tags:'high protein, 30 minutes',
   ingredients:['2 salmon fillets','1 lemon','2 garlic cloves','small bunch of dill','200 g green beans','100 g spinach','1 tbsp extra virgin olive oil'],
   method:'Heat the oven to 200°C / 400°F.\nPlace the salmon on a lined tray, rub with olive oil, grated garlic, lemon zest and chopped dill.\nAdd the green beans around the fish and roast for 12–15 minutes.\nWilt the spinach in a warm pan, then serve with lemon wedges.'}),
  R({title:'Overnight Oats with Berries & Walnuts',category:'Breakfast',time:5,servings:1,calories:410,art:'oats',groups:['grains','fruit','nuts','dairy'],tags:'make ahead',
   ingredients:['50 g rolled oats','120 g Greek yogurt','80 ml milk','handful of mixed berries','1 tbsp chopped walnuts','1 tsp honey','pinch of cinnamon'],
   method:'Stir the oats, yogurt, milk and cinnamon together in a jar.\nCover and refrigerate overnight.\nIn the morning, top with berries, walnuts and a drizzle of honey.'}),
  R({title:'Hummus & Crunchy Veg Plate',category:'Snack',time:10,servings:2,calories:290,art:'hummus',groups:['legumes','veg','oliveoil'],tags:'snack board',
   ingredients:['200 g hummus','2 carrots','1 cucumber','1 red pepper','handful of olives','1 tbsp extra virgin olive oil','pinch of smoked paprika'],
   method:'Spread the hummus on a plate and swirl with the back of a spoon.\nDrizzle with olive oil and dust with paprika.\nCut the vegetables into sticks and arrange around the hummus with the olives.'}),
  R({title:'Shakshuka with Fresh Herbs',category:'Breakfast',time:30,servings:2,calories:390,art:'shakshuka',groups:['veg','poultry','oliveoil'],tags:'weekend brunch, vegetarian',
   ingredients:['4 eggs','1 can chopped tomatoes','1 red pepper','1 onion','2 garlic cloves','1 tsp cumin','1 tsp paprika','small bunch of parsley','1 tbsp extra virgin olive oil','wholegrain bread, to serve'],
   method:'Soften the onion and pepper in olive oil for 8 minutes.\nAdd garlic and spices, cook for 1 minute, then pour in the tomatoes and simmer for 10 minutes.\nMake four wells, crack in the eggs, cover and cook until the whites are set.\nFinish with chopped parsley and serve with warm bread.'}),
  R({title:'Red Lentil & Lemon Soup',category:'Dinner',time:35,servings:4,calories:380,art:'lentil',groups:['legumes','veg','oliveoil'],tags:'batch cook, freezer friendly',
   ingredients:['250 g red lentils','1 onion','2 carrots','2 garlic cloves','1 tsp cumin','1 litre vegetable stock','1 lemon','2 tbsp extra virgin olive oil','parsley, to serve'],
   method:'Soften the onion and carrot in olive oil for 6–8 minutes.\nStir in the garlic and cumin, then add the lentils and stock.\nSimmer for 20 minutes until the lentils collapse.\nBlend until smooth, squeeze in the lemon and season. Top with parsley and a drizzle of oil.'}),
  R({title:'Tuna & White Bean Salad',category:'Lunch',time:10,servings:2,calories:450,art:'tuna',groups:['fish','legumes','veg','oliveoil'],tags:'pantry meal',
   ingredients:['1 can tuna in olive oil','1 can cannellini beans','100 g cherry tomatoes','1/2 red onion','handful of rocket','1 tbsp capers','1 lemon','1 tbsp extra virgin olive oil'],
   method:'Drain and rinse the beans; flake the tuna.\nHalve the tomatoes and finely slice the onion.\nToss everything with the capers, lemon juice and olive oil, then fold through the rocket.'}),
  R({title:'Bulgur-Stuffed Peppers with Feta',category:'Dinner',time:45,servings:4,calories:520,art:'peppers',groups:['veg','grains','dairy','oliveoil'],tags:'vegetarian, family',
   ingredients:['4 bell peppers','150 g bulgur wheat','1 can chopped tomatoes','1 zucchini','100 g feta','small bunch of mint','1 tsp dried oregano','2 tbsp extra virgin olive oil'],
   method:'Heat the oven to 190°C / 375°F. Halve and deseed the peppers.\nCook the bulgur according to the pack, then mix with diced zucchini, tomatoes, oregano and half the feta.\nFill the peppers, drizzle with olive oil and bake for 25 minutes.\nTop with the remaining feta and torn mint.'})
 ];
 const rb=t=>s.recipes.find(r=>r.title===t);
 const ws=weekStartOf(today(),s.settings.weekStart),t=today();
 const plan=[
  [0,'Breakfast','Overnight Oats with Berries & Walnuts'],[0,'Lunch','Greek Chickpea Salad'],[0,'Dinner','Lemon Herb Salmon with Greens'],
  [1,'Breakfast','Greek yogurt, figs & honey',320,['dairy','fruit','nuts']],[1,'Lunch','Tuna & White Bean Salad'],[1,'Dinner','Red Lentil & Lemon Soup'],[1,'Snack','Hummus & Crunchy Veg Plate'],
  [2,'Breakfast','Overnight Oats with Berries & Walnuts'],[2,'Lunch','Red Lentil & Lemon Soup'],[2,'Dinner','Bulgur-Stuffed Peppers with Feta'],
  [3,'Breakfast','Wholegrain toast, tomato & olive oil',330,['grains','veg','oliveoil']],[3,'Lunch','Greek Chickpea Salad'],[3,'Dinner','Herb chicken & roasted vegetables',590,['poultry','veg','oliveoil']],[3,'Snack','Apple & a handful of almonds',220,['fruit','nuts']],
  [4,'Breakfast','Shakshuka with Fresh Herbs'],[4,'Lunch','Hummus & Crunchy Veg Plate'],[4,'Dinner','Lemon Herb Salmon with Greens'],
  [5,'Breakfast','Shakshuka with Fresh Herbs'],[5,'Dinner','Lamb kofta, tabbouleh & tzatziki',640,['redmeat','grains','veg','dairy']],
  [6,'Lunch','Tuna & White Bean Salad'],[6,'Dinner','Bulgur-Stuffed Peppers with Feta']
 ];
 s.meals=plan.map(([d,slot,title,cal,groups])=>{const r=rb(title);const date=addDays(ws,d);return {id:uid(),date,slot,title,recipeId:r?.id||null,calories:r?r.calories:cal,groups:r?[...r.groups]:groups,status:date<t?'Eaten':'Planned',notes:'',isSample:true}});
 const shop=[['Chickpeas','2 cans'],['Tomatoes','6'],['Cucumbers','2'],['Feta','200 g'],['Salmon fillets','4'],['Lemons','4'],['Fresh dill','1 bunch'],['Greek yogurt','500 g'],['Mixed berries','2 punnets'],['Walnuts','100 g'],['Red lentils','250 g'],['Wholegrain bread','1 loaf'],['Extra virgin olive oil','1 bottle'],['Bell peppers','4']];
 s.shopping=shop.map(([n,q],i)=>({id:uid(),name:n,qty:q,aisle:guessAisle(n),done:i%5===2,isSample:true}));
 s.pantry=[['Extra virgin olive oil','Oils & Condiments','1 bottle',60],['Rolled oats','Bakery & Grains','750 g',120],['Red lentils','Legumes & Canned','500 g',180],['Canned tuna','Legumes & Canned','3 cans',300],['Greek yogurt','Dairy & Eggs','1 tub',3],['Feta','Dairy & Eggs','100 g',-1],['Dried oregano','Herbs & Spices','1 jar',240]]
  .map(([n,a,q,d])=>({id:uid(),name:n,aisle:a,qty:q,expiry:addDays(t,d),isSample:true}));
 s.tasks=[['Soak chickpeas for Thursday',t,'High'],['Batch-cook lentil soup',addDays(t,1),'Medium'],['Wash and chop salad vegetables',t,'Medium'],['Plan next week’s dinners',addDays(t,3),'Low'],['Portion walnuts into snack jars',addDays(t,-1),'Low']]
  .map(([title,date,priority],i)=>({id:uid(),title,date,priority,status:i===4?'Done':'Open',isSample:true}));
 s.goals=[{title:'Fish twice a week',description:'Salmon, sardines, tuna — fresh or canned all count.',progress:50,deadline:addDays(t,28)},{title:'Cook at home 5 nights a week',description:'Keep two easy fallback meals in the pantry.',progress:70,deadline:addDays(t,21)},{title:'Try one new recipe every week',description:'Explore a new vegetable, grain or legume each week.',progress:25,deadline:addDays(t,60)}]
  .map(g=>({id:uid(),status:'Active',isSample:true,...g}));
 s.notes=[{title:'Pantry staples to keep stocked',text:'Extra virgin olive oil\nCanned chickpeas & lentils\nCanned tomatoes\nWholegrain pasta & bulgur\nNuts and dried oregano',pinned:true},{title:'Sunday prep idea',text:'Roast a tray of peppers, zucchini and onion. Cook a pot of bulgur. Use them in salads, bowls and wraps through the week.',pinned:false},{title:'Family favourites',text:'Stuffed peppers were a hit — double the batch next time.',pinned:false}]
  .map(n=>({id:uid(),date:t,isSample:true,...n}));
 for(let i=1;i<=6;i++)s.water[addDays(t,-i)]=[6,8,5,7,8,4][i-1];s.water[t]=3;
 return s;
}
function normalize(x){
 const b=blankState();const o=Object.assign(b,x||{});
 o.profile=Object.assign(blankState().profile,x?.profile||{});
 o.settings=Object.assign(blankState().settings,x?.settings||{});
 o.ui=Object.assign(blankState().ui,x?.ui||{});
 for(const k of COLLECTIONS)if(!Array.isArray(o[k]))o[k]=[];
 if(!o.water||typeof o.water!=='object')o.water={};
 o.meals.forEach(m=>{if(!Array.isArray(m.groups))m.groups=[];if(!SLOTS.includes(m.slot))m.slot='Dinner'});
 o.recipes.forEach(r=>{if(!Array.isArray(r.groups))r.groups=[];if(!Array.isArray(r.ingredients))r.ingredients=String(r.ingredients||'').split('\n').filter(Boolean)});
 o.shopping.forEach(i=>{if(!AISLES.includes(i.aisle))i.aisle=guessAisle(i.name||'')});
 o.version=2;o.app='mediterranean-meal-planner';
 return o;
}
/* Accepts Mediterranean Meal Planner backups and the earlier single-file planner format (v1) */
function migrate(x){
 if(x&&x.app==='mediterranean-meal-planner'&&x.state)return normalize(x.state);
 if(x&&x.app==='mediterranean-meal-planner')return normalize(x);
 if(x&&x.version===1&&Array.isArray(x.meals)){
  const s=blankState();s.settings.onboarded=true;s.settings.sampleCleared=true;
  s.recipes=(x.recipes||[]).map(r=>({id:r.id||uid(),title:r.title||'Recipe',category:r.category||'Dinner',time:parseInt(r.time)||'',servings:2,calories:'',groups:[],tags:r.tags||'',ingredients:String(r.tags||'').split(',').map(v=>v.trim()).filter(Boolean),method:'',image:/^data:image\//.test(r.image||'')?r.image:'',fav:false,isSample:!!r.isSample}));
  s.meals=(x.meals||[]).map(m=>({id:m.id||uid(),date:m.date,slot:SLOTS.includes(m.type)?m.type:'Dinner',title:m.title||'Meal',recipeId:null,calories:+m.calories||'',groups:[],status:m.status==='Completed'?'Eaten':'Planned',notes:'',isSample:!!m.isSample}));
  s.shopping=(x.grocery||[]).map(g=>({id:g.id||uid(),name:g.name,qty:g.qty||'',aisle:guessAisle(g.name||''),done:!!g.done,isSample:!!g.isSample}));
  s.pantry=(x.pantry||[]).map(p=>({id:p.id||uid(),name:p.name,qty:p.qty||'',aisle:guessAisle(p.name||''),expiry:p.expiry||'',isSample:!!p.isSample}));
  s.tasks=(x.tasks||[]).map(t=>({id:t.id||uid(),title:t.title,date:t.date,priority:t.priority||'Medium',status:t.status==='Done'?'Done':'Open',isSample:!!t.isSample}));
  s.goals=(x.goals||[]).map(g=>({id:g.id||uid(),title:g.title,description:g.description||'',progress:+g.progress||0,deadline:g.deadline||'',status:'Active',isSample:!!g.isSample}));
  s.notes=(x.notes||[]).map(n=>({id:n.id||uid(),title:n.title,text:n.text||'',pinned:!!n.pinned,date:today(),isSample:!!n.isSample}));
  s.water=x.water||{};
  return normalize(s);
 }
 throw new Error('This file isn’t a Mediterranean Meal Planner backup.');
}
const hasSamples=()=>COLLECTIONS.some(k=>state[k].some(x=>x.isSample));
const userCount=()=>COLLECTIONS.reduce((n,k)=>n+state[k].filter(x=>!x.isSample).length,0);

/* ---------------- saving ---------------- */
let saveTimer=null,lastSaveOk=true,persistAsked=false,snapshot=null;
function setSaveState(kind,text){const el=$('#saveState');if(!el)return;el.className='save-state '+(kind||'');el.querySelector('span').textContent=text}
async function flush(){
 clearTimeout(saveTimer);saveTimer=null;
 try{
  const ok=await Store.set('state',state);
  if(!ok){setSaveState('bad','Not saving — see banner');return false}
  lastSaveOk=true;setSaveState('','Saved in this browser');
  if(!persistAsked&&userCount()>0&&navigator.storage?.persist){persistAsked=true;try{await navigator.storage.persist()}catch(e){}}
  return true;
 }catch(e){
  lastSaveOk=false;setSaveState('bad','Couldn’t save');
  toast(/quota/i.test(String(e?.name||e))?'Your browser storage is full. Remove a few photos, then export a backup.':'Couldn’t save your last change. Export a backup from Settings.','err');
  return false;
 }
}
function save(){setSaveState('warn','Saving…');clearTimeout(saveTimer);saveTimer=setTimeout(flush,250)}
window.addEventListener('pagehide',()=>{if(saveTimer)flush()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&saveTimer)flush()});
function commit(){save();refresh()}
function takeSnapshot(){snapshot=JSON.parse(JSON.stringify(state))}
function restoreSnapshot(){if(!snapshot)return;state=snapshot;snapshot=null;applyTheme();commit();toast('Restored')}
