/* ---------------- shared calculations ---------------- */
const curWeekStart=()=>addDays(weekStartOf(today(),state.settings.weekStart),state.ui.weekOffset*7);
const weekOffsetFor=date=>Math.round((parse(weekStartOf(date,state.settings.weekStart))-parse(weekStartOf(today(),state.settings.weekStart)))/(7*864e5));
const mealsOn=d=>state.meals.filter(m=>m.date===d).sort((a,b)=>SLOTS.indexOf(a.slot)-SLOTS.indexOf(b.slot));
const weekMeals=start=>{const end=addDays(start,6);return state.meals.filter(m=>m.date>=start&&m.date<=end)};
const kcal=n=>state.settings.showCalories&&+n?`${Math.round(+n)} kcal`:'';
function weekLabel(start){const a=parse(start),b=parse(addDays(start,6));const same=a.getMonth()===b.getMonth();return `${a.toLocaleDateString(undefined,{day:'numeric',month:same?undefined:'short'})} – ${b.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}`}
function balance(meals){
 const tally=Object.fromEntries(GROUPS.map(g=>[g.k,0]));meals.forEach(m=>(m.groups||[]).forEach(k=>{if(k in tally)tally[k]++}));
 const main=meals.filter(m=>m.slot!=='Snack');
 const plant=meals.length?Math.round(meals.filter(m=>(m.groups||[]).some(k=>['veg','legumes','fruit','grains','nuts'].includes(k))&&!(m.groups||[]).includes('redmeat')).length/meals.length*100):0;
 return {tally,plant,total:meals.length,main:main.length};
}
function svgBars(labels,stacks,colors,{h=200,unit=''}={}){
 const W=560,pad=42,base=h-26,top=14,max=Math.max(1,...stacks.map(s=>s.reduce((a,b)=>a+b,0)));
 const bw=(W-pad*2)/labels.length,w=Math.min(34,bw*.5);
 let g='';for(let i=0;i<=3;i++){const y=base-(base-top)*i/3;g+=`<line class="gl" x1="${pad}" x2="${W-6}" y1="${y}" y2="${y}"/>`;if(i)g+=`<text x="${pad-6}" y="${y+4}" text-anchor="end">${(v=>v>=10000?Math.round(v/1000)+'k':v>=1000?(v/1000).toFixed(1)+'k':v)(Math.round(max*i/3))}</text>`}
 labels.forEach((l,i)=>{let y=base;const x=pad+bw*i+bw/2-w/2;stacks[i].forEach((v,j)=>{if(!v)return;const hh=(base-top)*v/max;y-=hh;g+=`<rect x="${x}" y="${y}" width="${w}" height="${Math.max(hh-1.5,1)}" rx="4" fill="${colors[j]}"><title>${esc(l.t)}: ${v}${unit}</title></rect>`});g+=`<text x="${x+w/2}" y="${h-7}" text-anchor="middle" style="${l.today?'fill:var(--accent-text);font-weight:700':''}">${esc(l.s)}</text>`});
 return `<svg class="svgchart" viewBox="0 0 ${W} ${h}" role="img" aria-label="Chart">${g}</svg>`;
}
const legend=items=>`<div class="row" style="flex-wrap:wrap;gap:14px;margin-top:8px">${items.map(([l,c])=>`<span class="row small muted" style="gap:6px"><span class="dot" style="background:${c}"></span>${l}</span>`).join('')}</div>`;
function mealChip(m){return `<button class="meal ${m.status==='Eaten'?'eaten':''}" style="--slot:${SLOT_COLOR[m.slot]}" data-meal="${m.id}"><img class="th" src="${mealImg(m)}" alt=""><span style="min-width:0"><span class="mt-t">${esc(m.title)}</span><span class="mt-s">${kcal(m.calories)}${gdots(m.groups)}</span></span></button>`}

/* ---------------- page router ---------------- */
function renderPage(p){({home:pHome,today:pToday,week:pWeek,recipes:pRecipes,shopping:pShopping,pantry:pPantry,balance:pBalance,prep:pPrep,goals:pGoals,calendar:pCalendar,journal:pJournal,settings:pSettings})[p]?.()}
const head=(title,sub,actions='')=>`<div class="page-h"><div><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div><div class="actions">${actions}</div></div>`;

/* ---------------- HOME ---------------- */
function pHome(){
 const t=today(),ws=weekStartOf(t,state.settings.weekStart),wm=weekMeals(ws),bal=balance(wm);
 const toBuy=state.shopping.filter(x=>!x.done).length,w=+state.water[t]||0,wg=state.settings.waterGoal;
 const name=state.profile.name?`, ${esc(state.profile.name)}`:'';
 const days=weekDays(ws);
 const stacks=days.map(d=>SLOTS.map(s=>mealsOn(d).filter(m=>m.slot===s).reduce((a,m)=>a+(state.settings.showCalories?(+m.calories||0):1),0)));
 const upcoming=state.meals.filter(m=>m.date>t||(m.date===t&&m.status!=='Eaten')).sort((a,b)=>a.date.localeCompare(b.date)||SLOTS.indexOf(a.slot)-SLOTS.indexOf(b.slot)).slice(0,5);
 const tasks=state.tasks.filter(x=>x.status!=='Done').sort((a,b)=>(a.date||'9').localeCompare(b.date||'9')||['High','Medium','Low'].indexOf(a.priority)-['High','Medium','Low'].indexOf(b.priority)).slice(0,5);
 const expiring=state.pantry.filter(p=>p.expiry&&p.expiry<=addDays(t,5)).sort((a,b)=>a.expiry.localeCompare(b.expiry)).slice(0,4);
 $('#page-home').innerHTML=`
 <div class="hero"><svg class="sprig" viewBox="0 0 64 64" aria-hidden="true">${SPRIG}</svg><div class="hero-in">
  <div class="eyebrow">${esc(fmtDate(t,'long'))}</div>
  <h2>${greeting()}${name}</h2>
  <p>${wm.length?`You have <b>${wm.length} meals</b> planned this week${toBuy?` and <b>${toBuy} items</b> on your shopping list`:''}.`:'Your week is a blank page. Start with a few dinners — you can fill in the rest later.'}</p>
  <div class="actions"><button class="btn solid" data-go="week">${ic('week')}Open week plan</button><button class="btn" data-action="genShopping">${ic('wand')}Build shopping list</button></div>
 </div></div>
 <div class="grid g4 mt">
  <div class="card stat"><span class="k">${ic('week')}Meals this week</span><span class="v">${wm.length}<small> / 28</small></span><div class="bar"><i style="width:${Math.min(100,wm.length/28*100)}%"></i></div></div>
  <div class="card stat"><span class="k">${ic('leaf')}Plant-forward</span><span class="v">${bal.plant}<small>%</small></span><div class="bar"><i style="width:${bal.plant}%;background:var(--olive)"></i></div></div>
  <div class="card stat"><span class="k">${ic('cart')}To buy</span><span class="v">${toBuy}<small> items</small></span><div class="bar"><i style="width:${state.shopping.length?(state.shopping.length-toBuy)/state.shopping.length*100:0}%;background:var(--terra)"></i></div></div>
  <div class="card stat"><span class="k">${ic('drop')}Water today</span><span class="v">${w}<small> / ${wg} glasses</small></span><div class="bar"><i style="width:${Math.min(100,w/wg*100)}%;background:#4FA3C7"></i></div></div>
 </div>
 <div class="card mt"><div class="card-h"><h3>Today’s plate</h3><button class="link" data-go="today">Open today →</button></div>
  <div class="slots">${SLOTS.map(s=>{const ms=mealsOn(t).filter(m=>m.slot===s);return `<div class="slot ${ms.length?'has':''}"><span class="sl"><span class="dot" style="background:${SLOT_COLOR[s]}"></span>${s}</span>${ms.map(mealChip).join('')}<button class="add" data-add-meal="${t}|${s}">+ Add</button></div>`}).join('')}</div>
 </div>
 <div class="grid g-main mt">
  <div class="card"><div class="card-h"><h3>${state.settings.showCalories?'Calories planned':'Meals planned'} this week</h3><button class="link" data-go="balance">Balance →</button></div>
   ${svgBars(days.map(d=>({s:fmtDate(d,'weekday'),t:fmtDate(d),today:d===t})),stacks,SLOTS.map(s=>SLOT_COLOR[s]),{unit:state.settings.showCalories?' kcal':' meals'})}
   ${legend(SLOTS.map(s=>[s,SLOT_COLOR[s]]))}
  </div>
  <div class="card"><div class="card-h"><h3>Up next</h3><button class="link" data-go="week">Week →</button></div>
   <div class="list">${upcoming.map(m=>`<div class="li"><img class="th" style="width:42px;height:42px;border-radius:10px;object-fit:cover" src="${mealImg(m)}" alt=""><div class="grow"><div class="t">${esc(m.title)}</div><div class="s">${relDay(m.date)} · ${m.slot}</div></div>${m.calories&&state.settings.showCalories?`<span class="pill">${Math.round(m.calories)} kcal</span>`:''}</div>`).join('')||emptyState('week','Nothing planned yet','Add a meal to see it here.',`<button class="btn sm primary" data-action="addMeal">${ic('plus')}Add meal</button>`)}</div>
  </div>
 </div>
 <div class="grid g2 mt">
  <div class="card"><div class="card-h"><h3>Prep list</h3><button class="link" data-go="prep">All tasks →</button></div><div class="list">${tasks.map(taskRow).join('')||emptyState('list','All caught up','Nothing left on your prep list.')}</div></div>
  <div class="card"><div class="card-h"><h3>Use it up</h3><button class="link" data-go="pantry">Pantry →</button></div><div class="list">${expiring.map(p=>`<div class="li"><div class="grow"><div class="t">${esc(p.name)}</div><div class="s">${esc(p.qty||'')} · ${esc(p.aisle)}</div></div>${expiryPill(p.expiry)}</div>`).join('')||emptyState('jar','Nothing expiring soon','Items expiring in the next 5 days show up here.')}</div></div>
 </div>`;
}
const SPRIG=`<path d="__STEM__" fill="none" stroke="#FBF6EC" stroke-width="2.4" stroke-linecap="round"/><path d="__LEAVES__" fill="#FBF6EC"/><path d="M27 40.6 Q28.5 43 28.6 44.5" fill="none" stroke="#FBF6EC" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="29.2" cy="48.6" rx="3.8" ry="4.9" transform="rotate(-18 29.2 48.6)" fill="#D9683A"/>`;

/* ---------------- TODAY ---------------- */
function pToday(){
 const t=today(),ms=mealsOn(t),w=+state.water[t]||0,wg=state.settings.waterGoal;
 const tasks=state.tasks.filter(x=>x.status!=='Done'&&x.date&&x.date<=t).concat(state.tasks.filter(x=>x.status==='Done'&&x.date===t));
 const tip=TIPS[(parse(t).getDate()+parse(t).getMonth())%TIPS.length];
 const cal=ms.reduce((a,m)=>a+(+m.calories||0),0);
 $('#page-today').innerHTML=head('Today',esc(fmtDate(t,'long')),`<button class="btn" data-action="addTask">${ic('plus')}Task</button><button class="btn primary" data-action="addMeal">${ic('plus')}Meal</button>`)+`
 <div class="grid g-main">
  <div class="card"><div class="card-h"><h3>Meals</h3>${state.settings.showCalories&&cal?`<span class="pill p">${cal} kcal planned</span>`:''}</div>
   <div class="list">${SLOTS.map(s=>{const x=ms.filter(m=>m.slot===s);return `<div class="li" style="align-items:flex-start"><span class="pill" style="min-width:86px;justify-content:center;margin-top:8px"><span class="dot" style="background:${SLOT_COLOR[s]}"></span>${s}</span><div class="grow" style="display:grid;gap:6px">${x.map(m=>`<div class="row"><input type="checkbox" class="chk" data-eat="${m.id}" ${m.status==='Eaten'?'checked':''} aria-label="Mark ${esc(m.title)} as eaten">${mealChip(m)}</div>`).join('')||`<button class="btn sm ghost" style="justify-self:start" data-add-meal="${t}|${s}">${ic('plus')}Add ${s.toLowerCase()}</button>`}</div></div>`}).join('')}</div>
  </div>
  <div style="display:grid;gap:16px;align-content:start">
   <div class="card"><div class="card-h"><h3>Water</h3><span class="pill p">${w} / ${wg}</span></div>
    <div class="row" style="gap:18px;align-items:center"><div class="ring" style="--p:${Math.min(100,Math.round(w/wg*100))}"><div><span><b>${Math.min(100,Math.round(w/wg*100))}%</b><br><small>of goal</small></span></div></div>
    <div class="glasses">${Array.from({length:Math.max(wg,w)},(_,i)=>`<button class="glass ${i<w?'on':''}" data-glass="${i+1}" aria-label="${i+1} glasses"><svg viewBox="0 0 30 40"><path class="fill" d="M6.5 12h17l-1.7 23.5a2 2 0 0 1-2 1.8h-9.6a2 2 0 0 1-2-1.8z"/><path class="outline" d="M4 4h22l-2.3 31.5a2.5 2.5 0 0 1-2.5 2.3H8.8a2.5 2.5 0 0 1-2.5-2.3z"/></svg></button>`).join('')}</div></div>
   </div>
   <div class="card"><div class="card-h"><h3>Tasks</h3><button class="link" data-go="prep">All →</button></div><div class="list">${tasks.map(taskRow).join('')||emptyState('check','Nothing due today','Enjoy your meals.')}</div></div>
   <div class="card" style="background:var(--tint);border-color:transparent"><div class="row" style="align-items:flex-start;gap:12px"><div style="color:var(--accent-text)">${ic('leaf','ti')}</div><div><b class="serif" style="font-size:16px">Tip of the day</b><p style="margin:4px 0 0">${tip}</p></div></div><style>.ti{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2}</style></div>
  </div>
 </div>`;
}
function addWater(n){const t=today();state.water[t]=Math.max(0,(+state.water[t]||0)+n);commit();toast(`${state.water[t]} glass${state.water[t]===1?'':'es'} of water today`)}

/* ---------------- WEEK PLAN ---------------- */
function pWeek(){
 const ws=curWeekStart(),days=weekDays(ws),t=today();
 let grid=`<div class="corner"></div>`+days.map(d=>`<div class="wh ${d===t?'today':''}"><b>${fmtDate(d,'weekday')}</b><span>${parse(d).getDate()}</span></div>`).join('');
 SLOTS.forEach(s=>{grid+=`<div class="ws"><span class="dot" style="background:${SLOT_COLOR[s]};margin-right:6px"></span>${s}</div>`+days.map(d=>`<div class="wc ${d===t?'today':''}">${mealsOn(d).filter(m=>m.slot===s).map(mealChip).join('')}<button class="plus" data-add-meal="${d}|${s}" aria-label="Add ${s} on ${fmtDate(d,'long')}">+</button></div>`).join('')});
 if(state.settings.showCalories)grid+=`<div class="wt" style="display:flex;align-items:center;justify-content:center">Total</div>`+days.map(d=>{const c=mealsOn(d).reduce((a,m)=>a+(+m.calories||0),0);return `<div class="wt">${c?`<b>${c}</b> kcal`:'—'}</div>`}).join('');
 const list=days.map(d=>{const ms=mealsOn(d);return `<div class="card" style="padding:14px"><div class="card-h" style="margin-bottom:8px"><h3 style="${d===t?'color:var(--accent-text)':''}">${relDay(d)}</h3>${state.settings.showCalories&&ms.length?`<span class="pill">${ms.reduce((a,m)=>a+(+m.calories||0),0)} kcal</span>`:''}</div><div style="display:grid;gap:6px">${SLOTS.map(s=>{const x=ms.filter(m=>m.slot===s);return x.length?x.map(mealChip).join(''):`<button class="btn sm ghost no-print" style="justify-content:flex-start;color:var(--muted)" data-add-meal="${d}|${s}">${ic('plus')}${s}</button>`}).join('')}</div></div>`}).join('');
 $('#page-week').innerHTML=`${printHead('Week plan · '+weekLabel(ws))}`+head('Week Plan','Plan breakfast to dinner. Tap any meal to edit it.',`<div class="week-nav"><button class="btn icon" data-week="-1" aria-label="Previous week">${ic('left')}</button><strong>${weekLabel(ws)}</strong><button class="btn icon" data-week="1" aria-label="Next week">${ic('right')}</button></div>${state.ui.weekOffset?`<button class="btn" data-week="0">This week</button>`:''}`)+`
 <div class="toolbar no-print"><button class="btn primary" data-action="addMeal">${ic('plus')}Add meal</button><button class="btn" data-action="genShopping">${ic('wand')}<span>Build shopping list</span></button><button class="btn" data-action="copyWeek">${ic('copy')}<span>Copy last week</span></button><button class="btn" data-action="printWeek">${ic('print')}<span class="lbl-sm">Print</span></button>${weekMeals(ws).length?`<button class="btn ghost" data-action="clearWeek" style="margin-left:auto;color:var(--bad)">${ic('trash')}<span class="lbl-sm">Clear week</span></button>`:''}</div>
 <div class="week">${grid}</div><div class="wlist">${list}</div>`;
}
function mealModal({id=null,date=null,slot=null,recipeId=null}={}){
 const old=id?state.meals.find(m=>m.id===id):null;const r0=recipeId?state.recipes.find(r=>r.id===recipeId):null;
 const v={title:old?.title||r0?.title||'',date:old?.date||date||today(),slot:old?.slot||slot||(r0&&SLOTS.includes(r0.category)?r0.category:'Dinner'),calories:old?.calories??r0?.calories??'',groups:old?.groups||r0?.groups||[],status:old?.status||'Planned',notes:old?.notes||'',recipeId:old?.recipeId||r0?.id||''};
 const m=openModal({title:old?'Edit meal':'Add meal',size:'wide',
  body:`<div class="form">
   <div class="field full"><label for="fTitle">What are you having?</label><input id="fTitle" list="recipeList" value="${esc(v.title)}" placeholder="Pick a recipe or type anything — e.g. Leftover soup" autocomplete="off"><datalist id="recipeList">${state.recipes.map(r=>`<option value="${esc(r.title)}">`).join('')}</datalist><span class="hint" id="fLinked">${v.recipeId?'Linked to your recipe — ingredients can go straight to your shopping list.':''}</span></div>
   <div class="field full"><span class="flabel">Meal</span>${segmented('fSlot',SLOTS,v.slot)}</div>
   ${fld('Date','fDate',v.date,'date')}${fld('Calories (optional)','fCal',v.calories,'number','min="0" step="10" inputmode="numeric"')}
   ${groupChips(v.groups)}
   ${area('Notes (optional)','fNotes',v.notes,2,'Leftovers for tomorrow’s lunch, double the recipe…')}
   <label class="row full"><input type="checkbox" class="chk" id="fEaten" ${v.status==='Eaten'?'checked':''}> <span>Mark as eaten</span></label>
  </div>`,
  left:old?`<button class="btn ghost" style="color:var(--bad)" id="mDel">${ic('trash')}Delete</button>`:'',
  buttons:[{label:'Cancel'},{label:old?'Save changes':'Add meal',cls:'primary',onClick:m=>{
   const title=$('#fTitle',m).value.trim();if(!title){$('#fTitle',m).focus();toast('Give the meal a name','err');return false}
   const rec=state.recipes.find(r=>r.title.toLowerCase()===title.toLowerCase());
   const obj={id:old?.id||uid(),title,date:$('#fDate',m).value||today(),slot:segVal(m,'fSlot'),calories:$('#fCal',m).value===''?'':+$('#fCal',m).value,groups:readChips(m),notes:$('#fNotes',m).value.trim(),status:$('#fEaten',m).checked?'Eaten':'Planned',recipeId:rec?.id||null,isSample:false};
   upsert('meals',obj);toast(old?'Meal updated':`Added to ${relDay(obj.date)}`);
  }}]});
 bindChips(m);bindSeg(m,'fSlot');
 $('#fTitle',m).addEventListener('input',e=>{const r=state.recipes.find(x=>x.title.toLowerCase()===e.target.value.trim().toLowerCase());$('#fLinked',m).textContent=r?'Linked to your recipe — ingredients can go straight to your shopping list.':'';if(r){if($('#fCal',m).value==='')$('#fCal',m).value=r.calories||'';if(!readChips(m).length)$$('#fGroups .chip',m).forEach(c=>{const on=r.groups.includes(c.dataset.g);c.classList.toggle('on',on);c.setAttribute('aria-pressed',on)})}});
 $('#mDel',m)?.addEventListener('click',()=>{closeModal();removeItem('meals',old.id,'Meal deleted')});
}
async function copyWeek(){
 const ws=curWeekStart(),prev=weekMeals(addDays(ws,-7));
 if(!prev.length){toast('Last week has no meals to copy','err');return}
 takeSnapshot();let n=0;
 prev.forEach(m=>{const d=addDays(m.date,7);if(!state.meals.some(x=>x.date===d&&x.slot===m.slot&&x.title===m.title)){state.meals.push({...m,id:uid(),date:d,status:'Planned',isSample:false});n++}});
 commit();toast(`Copied ${n} meal${n===1?'':'s'} from last week`,'',restoreSnapshot);
}
async function clearWeek(){
 const ws=curWeekStart(),ids=new Set(weekMeals(ws).map(m=>m.id));
 if(!await confirmBox(`Remove all ${ids.size} meals planned for ${weekLabel(ws)}?`,{title:'Clear this week?',ok:'Clear week',danger:true}))return;
 takeSnapshot();state.meals=state.meals.filter(m=>!ids.has(m.id));commit();toast('Week cleared','',restoreSnapshot);
}

/* ---------------- RECIPES ---------------- */
function pRecipes(){
 const f=state.ui.recipeFilter||'All',q=($('#rSearch')?.value||'').toLowerCase();
 const cats=['All','Favourites','Breakfast','Lunch','Dinner','Snack','Dessert','Side'];
 const rows=state.recipes.filter(r=>(f==='All'||(f==='Favourites'?r.fav:r.category===f))&&(!q||`${r.title} ${r.tags} ${r.ingredients.join(' ')}`.toLowerCase().includes(q))).sort((a,b)=>(b.fav-a.fav)||a.title.localeCompare(b.title));
 const hadFocus=document.activeElement?.id==='rSearch';
 $('#page-recipes').innerHTML=head('Recipes',`${state.recipes.length} recipe${state.recipes.length===1?'':'s'} in your collection`,`<button class="btn primary" data-action="addRecipe">${ic('plus')}New recipe</button>`)+`
 <div class="toolbar"><input id="rSearch" type="search" placeholder="Search by name or ingredient…" value="${esc(q)}"><div class="chips">${cats.map(c=>`<button class="chip ${c===f?'on':''}" data-rfilter="${c}">${c}</button>`).join('')}</div></div>
 <div class="rgrid">${rows.map(r=>`<div class="rwrap"><div class="card rcard" role="button" tabindex="0" data-recipe="${r.id}"><img class="img" src="${recipeImg(r)}" alt="" loading="lazy"><div class="bd"><span class="pill p" style="align-self:flex-start">${esc(r.category)}</span><h3>${esc(r.title)}</h3><div class="meta">${r.time?`<span class="row" style="gap:4px">${ic('clock','mi')}${esc(r.time)} min</span>`:''}${r.servings?`<span class="row" style="gap:4px">${ic('users','mi')}${esc(r.servings)}</span>`:''}${kcal(r.calories)?`<span>${kcal(r.calories)}</span>`:''}${gdots(r.groups)}</div></div></div><button class="fav ${r.fav?'on':''}" data-fav="${r.id}" aria-label="${r.fav?'Remove from':'Add to'} favourites" aria-pressed="${!!r.fav}">${STAR}</button></div>`).join('')||`<div style="grid-column:1/-1">${emptyState('book',q||f!=='All'?'No matching recipes':'Your recipe box is empty','Save the dishes you love and plan them in one tap.',`<button class="btn primary" data-action="addRecipe">${ic('plus')}Add your first recipe</button>`)}</div>`}</div>
 <style>.mi{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2}</style>`;
 const s=$('#rSearch');s.addEventListener('input',debounce(()=>pRecipes(),160));if(hadFocus){s.focus();s.setSelectionRange(s.value.length,s.value.length)}
}
function recipeDetail(id){
 const r=state.recipes.find(x=>x.id===id);if(!r)return;
 openModal({title:esc(r.title),size:'wide',body:`<div class="rdetail"><img class="img" src="${recipeImg(r)}" alt="">
  <div class="meta"><span class="pill p">${esc(r.category)}</span>${r.time?`<span class="pill">${ic('clock','mi')} ${esc(r.time)} min</span>`:''}${r.servings?`<span class="pill">Serves ${esc(r.servings)}</span>`:''}${kcal(r.calories)?`<span class="pill">${kcal(r.calories)} / serving</span>`:''}${(r.groups||[]).map(k=>`<span class="pill"><span class="dot" style="background:${G[k]?.color}"></span>${G[k]?.label||k}</span>`).join('')}</div>
  <div class="grid g2" style="gap:24px"><div><h4>Ingredients</h4>${r.ingredients.length?`<ul>${r.ingredients.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:'<p class="muted">No ingredients added yet.</p>'}</div>
  <div><h4>Method</h4>${r.method?`<ol>${r.method.split('\n').filter(Boolean).map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`:'<p class="muted">No method added yet.</p>'}</div></div>
  ${r.tags?`<p class="muted small" style="margin-top:18px">Tags: ${esc(r.tags)}</p>`:''}</div><style>.mi{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2}</style>`,
  left:`<button class="btn ghost" id="rEdit">${ic('edit')}Edit</button><button class="btn ghost" id="rPrint">${ic('print')}<span class="lbl-sm">Print</span></button>`,
  buttons:[{label:`${ic('cart')}<span class="lbl-sm">Add to shopping</span>`,onClick:()=>{addIngredients([r],`from ${r.title}`)}},{label:`${ic('week')}Plan it`,cls:'primary',onClick:()=>{setTimeout(()=>mealModal({recipeId:r.id}),30)}}]});
 $('#rEdit').onclick=()=>{closeModal();setTimeout(()=>recipeModal(r.id),30)};
 $('#rPrint').onclick=()=>printRecipe(r);
}
function recipeModal(id=null){
 const old=id?state.recipes.find(r=>r.id===id):null;let img=old?.image||'';
 const m=openModal({title:old?'Edit recipe':'New recipe',size:'wide',body:`<div class="form">
  ${fld('Recipe name','fTitle',old?.title||'','text','placeholder="e.g. Grandma’s lemon chicken"','full')}
  ${sel('Category','fCat',['Breakfast','Lunch','Dinner','Snack','Dessert','Side'],old?.category||'Dinner')}
  ${fld('Prep + cook time (minutes)','fTime',old?.time||'','number','min="0" inputmode="numeric"')}
  ${fld('Servings','fServ',old?.servings||2,'number','min="1" inputmode="numeric"')}
  ${fld('Calories per serving (optional)','fCal',old?.calories||'','number','min="0" inputmode="numeric"')}
  ${groupChips(old?.groups||[])}
  ${area('Ingredients — one per line','fIng',(old?.ingredients||[]).join('\n'),7,'1 can chickpeas\n2 tomatoes\n1 tbsp olive oil','')}
  ${area('Method — one step per line','fMethod',old?.method||'',7,'Chop the vegetables…\nWhisk the dressing…','')}
  ${fld('Tags (optional)','fTags',old?.tags||'','text','placeholder="quick, vegetarian, freezer friendly"','full')}
  <div class="field full"><span class="flabel">Photo (optional)</span><div class="imgdrop"><img id="fPrev" src="${img||recipeImg(old||{title:'?'})}" alt=""><div class="actions"><label class="btn sm">${ic('up')}Choose photo<input type="file" id="fImg" accept="image/*" hidden></label>${img?`<button type="button" class="btn sm ghost" id="fImgDel">Remove</button>`:''}</div></div><span class="hint">Photos are resized automatically so your planner stays fast.</span></div>
 </div>`,
 left:old?`<button class="btn ghost" style="color:var(--bad)" id="mDel">${ic('trash')}Delete</button>`:'',
 buttons:[{label:'Cancel'},{label:old?'Save recipe':'Add recipe',cls:'primary',onClick:m=>{
  const title=$('#fTitle',m).value.trim();if(!title){toast('Give the recipe a name','err');$('#fTitle',m).focus();return false}
  const obj={id:old?.id||uid(),title,category:$('#fCat',m).value,time:$('#fTime',m).value,servings:$('#fServ',m).value,calories:$('#fCal',m).value===''?'':+$('#fCal',m).value,groups:readChips(m),ingredients:$('#fIng',m).value.split('\n').map(s=>s.trim()).filter(Boolean),method:$('#fMethod',m).value.trim(),tags:$('#fTags',m).value.trim(),image:img,art:img?null:(old?.art||null),fav:old?.fav||false,isSample:false};
  upsert('recipes',obj);toast(old?'Recipe saved':'Recipe added');
 }}]});
 bindChips(m);
 $('#fImg',m).onchange=async e=>{const f=e.target.files[0];if(!f)return;try{$('#fPrev',m).style.opacity=.4;img=await compressImage(f);$('#fPrev',m).src=img;toast(`Photo ready (${fmtBytes(Math.round(img.length*.75))})`)}catch(err){toast(err.message,'err')}finally{$('#fPrev',m).style.opacity=1}};
 $('#fImgDel',m)?.addEventListener('click',()=>{img='';$('#fPrev',m).src=recipeImg({...old,image:''})});
 $('#mDel',m)?.addEventListener('click',async()=>{closeModal();const used=state.meals.filter(x=>x.recipeId===old.id).length;if(used&&!await confirmBox(`This recipe is used in ${used} planned meal${used===1?'':'s'}. The meals will stay, just unlinked.`,{title:'Delete recipe?',ok:'Delete',danger:true}))return;removeItem('recipes',old.id,'Recipe deleted')});
}

/* ---------------- SHOPPING ---------------- */
function parseIng(line){
 const m=/^\s*((?:\d+[\d\/.,]*|½|¼|¾|⅓|a|an|one|two|three)\s*(?:x\s*)?(?:g|kg|ml|l|litre|litres|liter|oz|lb|lbs|tbsp|tsp|cups?|cans?|tins?|cloves?|bunch(?:es)?|handful|pinch|slices?|fillets?|punnets?|jars?|packs?|bottles?)?\b\.?)\s*(?:of\s+)?(.+)$/i.exec(line);
 let qty='',name=line.trim();if(m&&m[2]){qty=m[1].trim();name=m[2].trim()}
 else{const v=/^\s*((?:a\s+)?(?:small\s+|large\s+|big\s+)?(?:handful|bunch|pinch|sprig|few sprigs|splash|drizzle|dash)s?)\s+(?:of\s+)?(.+)$/i.exec(line);if(v){qty=v[1].trim().toLowerCase();name=v[2].trim()}}
 name=name.replace(/,.*$/,'').replace(/^(of )/i,'').trim();
 return {qty,name:name.charAt(0).toUpperCase()+name.slice(1)};
}
function addIngredients(recipes,label){
 takeSnapshot();let added=0,skipped=0,dup=0;
 const pantry=state.pantry.map(p=>p.name.toLowerCase());
 recipes.forEach(r=>r.ingredients.forEach(line=>{
  const {qty,name}=parseIng(line);if(!name)return;const key=name.toLowerCase();
  if(pantry.some(p=>p&&(p.includes(key)||key.includes(p)))){skipped++;return}
  const ex=state.shopping.find(i=>!i.done&&i.name.toLowerCase()===key);
  if(ex){if(qty&&!String(ex.qty).includes(qty))ex.qty=ex.qty?`${ex.qty} + ${qty}`:qty;dup++;return}
  state.shopping.push({id:uid(),name,qty,aisle:guessAisle(name),done:false,isSample:false});added++;
 }));
 commit();
 toast(`${added} item${added===1?'':'s'} added ${label}${dup?` · ${dup} merged`:''}${skipped?` · ${skipped} already in pantry`:''}`,'',restoreSnapshot);
}
function genShopping(){
 const ws=curWeekStart(),ids=[...new Set(weekMeals(ws).map(m=>m.recipeId).filter(Boolean))];
 const recs=ids.map(id=>state.recipes.find(r=>r.id===id)).filter(r=>r&&r.ingredients.length);
 if(!recs.length){toast('Plan meals from your recipes first — their ingredients become your list.','err');return}
 addIngredients(recs,`from ${recs.length} recipe${recs.length===1?'':'s'}`);
 if(state.ui.page!=='shopping')go('shopping');
}
function pShopping(){
 const f=state.ui.shopFilter||'open',items=state.shopping.filter(i=>f==='all'||(f==='open'?!i.done:i.done));
 const total=state.shopping.length,done=state.shopping.filter(i=>i.done).length;
 const by=AISLES.map(a=>[a,items.filter(i=>i.aisle===a).sort((x,y)=>x.done-y.done||x.name.localeCompare(y.name))]).filter(x=>x[1].length);
 $('#page-shopping').innerHTML=printHead('Shopping list')+head('Shopping',total?`${done} of ${total} bought`:'Everything you need, sorted by aisle.',`<button class="btn" data-action="copyList">${ic('copy')}<span class="lbl-sm">Copy</span></button><button class="btn" data-action="printShopping">${ic('print')}<span class="lbl-sm">Print</span></button><button class="btn primary" data-action="genShopping">${ic('wand')}From week plan</button>`)+`
 <div class="card">
  <form class="addbar no-print" id="shopAdd" autocomplete="off"><input id="sName" placeholder="Add an item — e.g. Cherry tomatoes" aria-label="Item"><input id="sQty" placeholder="Qty" aria-label="Quantity"><select id="sAisle" aria-label="Aisle"><option value="">Auto aisle</option>${AISLES.map(a=>`<option>${a}</option>`).join('')}</select><button class="btn primary" type="submit">${ic('plus')}Add</button></form>
  ${total?`<div class="bar no-print" style="margin:14px 0 4px"><i style="width:${done/total*100}%"></i></div>`:''}
  <div class="toolbar no-print" style="margin:12px 0 0">${segmented('shopSeg',['To buy','Bought','All'],{open:'To buy',done:'Bought',all:'All'}[f])}${done?`<button class="btn sm ghost" data-action="clearBought" style="margin-left:auto">${ic('trash')}Clear bought (${done})</button>`:''}</div>
  ${by.map(([a,list])=>`<div class="aisle"><h4>${a} <span class="n">· ${list.length}</span></h4><div class="list">${list.map(i=>`<div class="li ${i.done?'done':''}"><input type="checkbox" class="chk" data-shop="${i.id}" ${i.done?'checked':''} aria-label="${esc(i.name)}"><div class="grow" data-shopedit="${i.id}" style="cursor:pointer"><div class="t">${esc(i.name)}</div>${i.qty?`<div class="s">${esc(i.qty)}</div>`:''}</div><button class="btn sm icon ghost no-print" data-del="shopping|${i.id}" aria-label="Delete ${esc(i.name)}">${ic('x')}</button></div>`).join('')}</div></div>`).join('')||emptyState('cart',f==='done'?'Nothing ticked off yet':'Your list is empty','Add items above, or build it from this week’s meal plan in one tap.')}
 </div>`;
 $('#shopAdd').onsubmit=e=>{e.preventDefault();const n=$('#sName').value.trim();if(!n)return;state.shopping.push({id:uid(),name:n,qty:$('#sQty').value.trim(),aisle:$('#sAisle').value||guessAisle(n),done:false,isSample:false});commit();$('#sName').focus()};
 $$('#shopSeg button').forEach(b=>b.onclick=()=>{state.ui.shopFilter={'To buy':'open',Bought:'done',All:'all'}[b.dataset.v];commit()});
 setTimeout(()=>{if(document.activeElement===document.body&&window.innerWidth>860)$('#sName')?.focus({preventScroll:true})},0);
}
function shopModal(id=null){
 const old=id?state.shopping.find(x=>x.id===id):null;
 openModal({title:old?'Edit item':'Add shopping item',size:'narrow',body:`<div class="form">${fld('Item','fName',old?.name||'','text','','full')}${fld('Quantity','fQty',old?.qty||'')}${sel('Aisle','fAisle',AISLES,old?.aisle||'Produce')}</div>`,
  left:old?`<button class="btn ghost" style="color:var(--bad)" id="mDel">${ic('trash')}</button>`:'',
  buttons:[{label:'Cancel'},{label:'Save',cls:'primary',onClick:m=>{const n=$('#fName',m).value.trim();if(!n)return false;upsert('shopping',{id:old?.id||uid(),name:n,qty:$('#fQty',m).value.trim(),aisle:old||$('#fAisle',m).value!=='Produce'?$('#fAisle',m).value:guessAisle(n),done:old?.done||false,isSample:false})}}]});
 $('#mDel')?.addEventListener('click',()=>{closeModal();removeItem('shopping',old.id,'Item removed')});
}
async function copyList(){
 const open=state.shopping.filter(i=>!i.done);if(!open.length){toast('Nothing left to buy','err');return}
 const txt=`🛒 Shopping list — ${fmtDate(today())}\n`+AISLES.map(a=>{const l=open.filter(i=>i.aisle===a);return l.length?`\n${a.toUpperCase()}\n`+l.map(i=>`☐ ${i.name}${i.qty?` (${i.qty})`:''}`).join('\n'):''}).join('')+'\n';
 try{await navigator.clipboard.writeText(txt);toast('Copied — paste it into Notes or a message')}catch(e){const t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();try{document.execCommand('copy');toast('Copied — paste it into Notes or a message')}catch(_){toast('Couldn’t copy on this browser','err')}t.remove()}
}

/* ---------------- PANTRY ---------------- */
function expiryPill(d){if(!d)return '';const t=today(),diff=Math.round((parse(d)-parse(t))/864e5);if(diff<0)return `<span class="pill bad">Expired</span>`;if(diff===0)return `<span class="pill warn">Today</span>`;if(diff<=5)return `<span class="pill warn">${diff} day${diff===1?'':'s'}</span>`;return `<span class="pill">${fmtDate(d,'short')}</span>`}
function pPantry(){
 const rows=state.pantry.slice().sort((a,b)=>(a.expiry||'9999').localeCompare(b.expiry||'9999'));
 $('#page-pantry').innerHTML=head('Pantry','What you already have — so you buy less and waste less.',`<button class="btn primary" data-action="addPantry">${ic('plus')}Add item</button>`)+`
 <div class="card tbl-wrap">${rows.length?`<table class="tbl"><thead><tr><th>Item</th><th>Aisle</th><th>Qty</th><th>Use by</th><th class="r"></th></tr></thead><tbody>${rows.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td class="muted">${esc(p.aisle)}</td><td>${esc(p.qty)}</td><td>${expiryPill(p.expiry)||'<span class="muted">—</span>'}</td><td class="r" style="white-space:nowrap"><button class="btn sm ghost" data-restock="${p.id}" title="Add to shopping list">${ic('cart')}<span class="lbl-sm">Restock</span></button><button class="btn sm icon ghost" data-pantryedit="${p.id}" aria-label="Edit">${ic('edit')}</button></td></tr>`).join('')}</tbody></table>`:emptyState('jar','Your pantry is empty','Track staples and use-by dates. Items here are skipped when you build a shopping list.',`<button class="btn primary" data-action="addPantry">${ic('plus')}Add item</button>`)}</div>`;
}
function pantryModal(id=null){
 const old=id?state.pantry.find(x=>x.id===id):null;
 openModal({title:old?'Edit pantry item':'Add pantry item',size:'narrow',body:`<div class="form">${fld('Item','fName',old?.name||'','text','','full')}${fld('Quantity','fQty',old?.qty||'')}${fld('Use by (optional)','fExp',old?.expiry||'','date')}${sel('Aisle','fAisle',AISLES,old?.aisle||'Legumes & Canned','full')}</div>`,
  left:old?`<button class="btn ghost" style="color:var(--bad)" id="mDel">${ic('trash')}</button>`:'',
  buttons:[{label:'Cancel'},{label:'Save',cls:'primary',onClick:m=>{const n=$('#fName',m).value.trim();if(!n)return false;upsert('pantry',{id:old?.id||uid(),name:n,qty:$('#fQty',m).value.trim(),expiry:$('#fExp',m).value,aisle:$('#fAisle',m).value,isSample:false})}}]});
 $('#mDel')?.addEventListener('click',()=>{closeModal();removeItem('pantry',old.id,'Item removed')});
}

/* ---------------- BALANCE ---------------- */
function pBalance(){
 const ws=curWeekStart(),days=weekDays(ws),wm=weekMeals(ws),b=balance(wm),t=today();
 const cal=days.map(d=>mealsOn(d).reduce((a,m)=>a+(+m.calories||0),0)),calDays=cal.filter(Boolean);
 const avg=calDays.length?Math.round(calDays.reduce((a,c)=>a+c,0)/calDays.length):0;
 const status=k=>{const g=GUIDES[k],v=b.tally[k];if(!g)return '';if(g.max!=null)return v<=g.max?'<span class="pill ok">On track</span>':'<span class="pill warn">A bit high</span>';return v>=g.min?'<span class="pill ok">On track</span>':`<span class="pill">${g.min-v} to go</span>`};
 const maxT=Math.max(4,...Object.values(b.tally));
 $('#page-balance').innerHTML=head('Balance','How this week’s plan lines up with a Mediterranean-style pattern.',`<div class="week-nav"><button class="btn icon" data-week="-1" aria-label="Previous week">${ic('left')}</button><strong>${weekLabel(ws)}</strong><button class="btn icon" data-week="1" aria-label="Next week">${ic('right')}</button></div>`)+`
 <div class="grid g4">
  <div class="card stat"><span class="k">${ic('leaf')}Plant-forward meals</span><span class="v">${b.plant}<small>%</small></span></div>
  <div class="card stat"><span class="k">${ic('fish')}Fish & seafood</span><span class="v">${b.tally.fish}<small> meals</small></span></div>
  <div class="card stat"><span class="k">${ic('jar')}Legume meals</span><span class="v">${b.tally.legumes}<small> meals</small></span></div>
  <div class="card stat"><span class="k">${ic('spark')}${state.settings.showCalories?'Avg calories / day':'Meals planned'}</span><span class="v">${state.settings.showCalories?(avg||'—'):b.total}${state.settings.showCalories&&avg?'<small> kcal</small>':''}</span></div>
 </div>
 <div class="grid g-main mt">
  <div class="card"><div class="card-h"><h3>Food groups this week</h3><span class="muted small">${b.total} meals</span></div>
   ${b.total?`<div class="list">${GROUPS.map(g=>`<div class="li"><span class="dot" style="background:${g.color}"></span><div class="grow"><div class="row" style="justify-content:space-between"><b style="font-weight:600">${g.label}</b><span class="small muted">${b.tally[g.k]} meal${b.tally[g.k]===1?'':'s'}${GUIDES[g.k]?` · ${GUIDES[g.k].txt}`:''}</span></div><div class="bar" style="margin-top:6px"><i style="width:${b.tally[g.k]/maxT*100}%;background:${g.color}"></i></div></div><div style="width:92px;text-align:right">${status(g.k)}</div></div>`).join('')}</div>`:emptyState('leaf','No meals this week yet','Plan a few meals and tag their food groups to see your balance.')}
  </div>
  <div style="display:grid;gap:16px;align-content:start">
   ${state.settings.showCalories?`<div class="card"><div class="card-h"><h3>Calories by day</h3></div>${svgBars(days.map(d=>({s:fmtDate(d,'weekday'),t:fmtDate(d),today:d===t})),cal.map(c=>[c]),['var(--primary)'],{h:180,unit:' kcal'})}</div>`:''}
   <div class="card" style="background:var(--tint);border-color:transparent"><h3 style="margin:0 0 8px;font-size:17px">How Balance works</h3><p class="small" style="margin:0 0 8px">Tag each meal or recipe with its food groups. Balance counts them across the week and compares them with common Mediterranean-style eating patterns: plenty of vegetables, legumes, whole grains and olive oil, fish a couple of times a week, and red meat only now and then.</p><p class="small muted" style="margin:0">This is a planning aid, not medical or nutritional advice. For personal dietary needs, talk to a qualified professional.</p></div>
  </div>
 </div>`;
}

/* ---------------- PREP LIST ---------------- */
const PRIO_C={High:'bad',Medium:'warn',Low:''};
function taskRow(tk){const over=tk.status!=='Done'&&tk.date&&tk.date<today();return `<div class="li ${tk.status==='Done'?'done':''}"><input type="checkbox" class="chk" data-task="${tk.id}" ${tk.status==='Done'?'checked':''} aria-label="${esc(tk.title)}"><div class="grow" data-taskedit="${tk.id}" style="cursor:pointer"><div class="t">${esc(tk.title)}</div><div class="s" style="${over?'color:var(--bad)':''}">${tk.date?(over?'Overdue · ':'')+relDay(tk.date):'No date'}</div></div><span class="pill ${PRIO_C[tk.priority]||''}">${esc(tk.priority)}</span></div>`}
function pPrep(){
 const open=state.tasks.filter(t=>t.status!=='Done').sort((a,b)=>(a.date||'9').localeCompare(b.date||'9')),done=state.tasks.filter(t=>t.status==='Done');
 $('#page-prep').innerHTML=head('Prep List','Soak, chop, marinate, batch-cook — your kitchen to-dos.',`<button class="btn primary" data-action="addTask">${ic('plus')}Add task</button>`)+`
 <div class="grid g2"><div class="card"><div class="card-h"><h3>To do</h3><span class="pill p">${open.length}</span></div><div class="list">${open.map(taskRow).join('')||emptyState('check','All done','Nothing left to prep.')}</div></div>
 <div class="card"><div class="card-h"><h3>Done</h3>${done.length?`<button class="link" data-action="clearDone">Clear</button>`:''}</div><div class="list">${done.map(taskRow).join('')||emptyState('list','Nothing finished yet','Completed tasks land here.')}</div></div></div>`;
}
function taskModal(id=null){
 const old=id?state.tasks.find(x=>x.id===id):null;
 const m=openModal({title:old?'Edit task':'Add prep task',size:'narrow',body:`<div class="form">${fld('Task','fTitle',old?.title||'','text','placeholder="e.g. Soak chickpeas overnight"','full')}${fld('Date','fDate',old?.date||today(),'date')}<div class="field"><span class="flabel">Priority</span>${segmented('fPrio',['High','Medium','Low'],old?.priority||'Medium')}</div></div>`,
  left:old?`<button class="btn ghost" style="color:var(--bad)" id="mDel">${ic('trash')}</button>`:'',
  buttons:[{label:'Cancel'},{label:'Save',cls:'primary',onClick:m=>{const t=$('#fTitle',m).value.trim();if(!t)return false;upsert('tasks',{id:old?.id||uid(),title:t,date:$('#fDate',m).value,priority:segVal(m,'fPrio'),status:old?.status||'Open',isSample:false})}}]});
 bindSeg(m,'fPrio');$('#mDel')?.addEventListener('click',()=>{closeModal();removeItem('tasks',old.id,'Task deleted')});
}

/* ---------------- GOALS & WATER ---------------- */
function pGoals(){
 const t=today(),days=Array.from({length:7},(_,i)=>addDays(t,i-6)),wg=state.settings.waterGoal;
 $('#page-goals').innerHTML=head('Goals & Water','Small, steady habits.',`<button class="btn primary" data-action="addGoal">${ic('plus')}New goal</button>`)+`
 <div class="grid g-main"><div class="grid g2" style="align-content:start">${state.goals.map(g=>`<div class="card"><div class="card-h" style="align-items:flex-start"><h3 style="cursor:pointer" data-goaledit="${g.id}">${esc(g.title)}</h3>${g.progress>=100?'<span class="pill ok">Done</span>':`<span class="pill p">${g.progress}%</span>`}</div>${g.description?`<p class="muted small" style="margin:-6px 0 12px">${esc(g.description)}</p>`:''}<div class="bar"><i style="width:${clamp(g.progress,0,100)}%;${g.progress>=100?'background:var(--ok)':''}"></i></div><div class="row" style="justify-content:space-between;margin-top:12px"><span class="small muted">${g.deadline?'By '+fmtDate(g.deadline):''}</span><div class="actions"><button class="btn sm icon" data-goal="${g.id}|-10" aria-label="Less progress">−</button><button class="btn sm icon" data-goal="${g.id}|10" aria-label="More progress">+</button></div></div></div>`).join('')||`<div class="card" style="grid-column:1/-1">${emptyState('target','No goals yet','Pick one small habit — like fish twice a week.',`<button class="btn primary" data-action="addGoal">${ic('plus')}New goal</button>`)}</div>`}</div>
 <div class="card" style="align-self:start"><div class="card-h"><h3>Water, last 7 days</h3><button class="btn sm primary" data-action="water">${ic('drop')}+1 glass</button></div>
  ${svgBars(days.map(d=>({s:fmtDate(d,'weekday'),t:fmtDate(d),today:d===t})),days.map(d=>[+state.water[d]||0]),['#4FA3C7'],{h:180,unit:' glasses'})}
  <p class="small muted" style="margin:10px 0 0">Daily goal: ${wg} glasses · change it in Settings.</p></div></div>`;
}
function goalModal(id=null){
 const old=id?state.goals.find(x=>x.id===id):null;
 openModal({title:old?'Edit goal':'New goal',body:`<div class="form">${fld('Goal','fTitle',old?.title||'','text','placeholder="e.g. Eat legumes 3 times a week"','full')}${area('Why it matters (optional)','fDesc',old?.description||'',2)}${fld('Target date','fDate',old?.deadline||addDays(today(),30),'date')}<div class="field"><label for="fProg">Progress: <b id="fProgV">${old?.progress||0}%</b></label><input id="fProg" type="range" min="0" max="100" step="5" value="${old?.progress||0}" style="padding:0;height:auto;border:0;box-shadow:none"></div></div>`,
  left:old?`<button class="btn ghost" style="color:var(--bad)" id="mDel">${ic('trash')}</button>`:'',
  buttons:[{label:'Cancel'},{label:'Save',cls:'primary',onClick:m=>{const t=$('#fTitle',m).value.trim();if(!t)return false;upsert('goals',{id:old?.id||uid(),title:t,description:$('#fDesc',m).value.trim(),deadline:$('#fDate',m).value,progress:+$('#fProg',m).value,status:'Active',isSample:false})}}]});
 $('#fProg').oninput=e=>$('#fProgV').textContent=e.target.value+'%';
 $('#mDel')?.addEventListener('click',()=>{closeModal();removeItem('goals',old.id,'Goal deleted')});
}

/* ---------------- CALENDAR ---------------- */
function pCalendar(){
 const now=new Date();if(state.ui.calMonth==null){state.ui.calMonth=now.getMonth();state.ui.calYear=now.getFullYear()}
 const y=state.ui.calYear,mo=state.ui.calMonth,first=new Date(y,mo,1),ws=state.settings.weekStart,lead=(first.getDay()-ws+7)%7,t=today();
 const start=ymd(new Date(y,mo,1-lead));const cells=Array.from({length:42},(_,i)=>addDays(start,i));const rows=cells.slice(35).every(d=>parse(d).getMonth()!==mo)?35:42;
 const dn=Array.from({length:7},(_,i)=>fmtDate(addDays(start,i),'weekday'));
 $('#page-calendar').innerHTML=head('Calendar','Your meals and prep at a glance. Tap a day to plan it.',`<div class="week-nav"><button class="btn icon" data-month="-1" aria-label="Previous month">${ic('left')}</button><strong>${first.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</strong><button class="btn icon" data-month="1" aria-label="Next month">${ic('right')}</button></div><button class="btn" data-month="0">Today</button>`)+`
 <div class="cal">${dn.map(d=>`<div class="ch">${d}</div>`).join('')}${cells.slice(0,rows).map(d=>{const ms=mealsOn(d),ts=state.tasks.filter(x=>x.date===d&&x.status!=='Done'),ev=[...ms.map(m=>`<span class="ev" style="border-left-color:${SLOT_COLOR[m.slot]}">${esc(m.title)}</span>`),...ts.map(x=>`<span class="ev task">${esc(x.title)}</span>`)];return `<button class="cd ${parse(d).getMonth()!==mo?'out':''} ${d===t?'today':''}" data-day="${d}" aria-label="${fmtDate(d,'long')}: ${ms.length} meals"><span class="n">${parse(d).getDate()}</span>${ev.slice(0,3).join('')}${ev.length>3?`<span class="more">+${ev.length-3} more</span>`:''}</button>`}).join('')}</div>
 ${legend([...SLOTS.map(s=>[s,SLOT_COLOR[s]]),['Prep task','var(--terra)']])}`;
}
function dayModal(d){
 const ms=mealsOn(d),ts=state.tasks.filter(x=>x.date===d);
 openModal({title:esc(fmtDate(d,'long')),body:`<div style="display:grid;gap:6px">${SLOTS.map(s=>{const x=ms.filter(m=>m.slot===s);return `<div class="flabel" style="margin-top:6px">${s}</div>`+(x.map(mealChip).join('')||`<button class="btn sm ghost" style="justify-self:start" data-add-meal="${d}|${s}">${ic('plus')}Add ${s.toLowerCase()}</button>`)}).join('')}${ts.length?`<div class="flabel" style="margin-top:10px">Prep</div><div class="list">${ts.map(taskRow).join('')}</div>`:''}</div>`,
  buttons:[{label:'Open this week',onClick:()=>{state.ui.weekOffset=weekOffsetFor(d);go('week')}}]});
}

/* ---------------- JOURNAL ---------------- */
function pJournal(){
 const rows=state.notes.slice().sort((a,b)=>(b.pinned-a.pinned)||String(b.date).localeCompare(String(a.date)));
 $('#page-journal').innerHTML=head('Journal','Meal ideas, reflections, family favourites.',`<button class="btn primary" data-action="addNote">${ic('plus')}New note</button>`)+
 (rows.length?`<div class="ngrid">${rows.map(n=>`<div class="card note" data-noteedit="${n.id}" role="button" tabindex="0">${n.pinned?`<span class="pin">${ic('pin')}</span>`:''}<h3>${esc(n.title)}</h3><p>${esc(n.text)}</p><small>${fmtDate(n.date)}</small></div>`).join('')}</div>`:`<div class="card">${emptyState('pen','No notes yet','Write down what worked, what the kids loved, or ideas for next week.',`<button class="btn primary" data-action="addNote">${ic('plus')}New note</button>`)}</div>`);
}
function noteModal(id=null){
 const old=id?state.notes.find(x=>x.id===id):null;
 openModal({title:old?'Edit note':'New note',body:`<div class="form">${fld('Title','fTitle',old?.title||'','text','','full')}${area('Note','fText',old?.text||'',8)}<label class="row full"><input type="checkbox" class="chk" id="fPin" ${old?.pinned?'checked':''}> Pin to top</label></div>`,
  left:old?`<button class="btn ghost" style="color:var(--bad)" id="mDel">${ic('trash')}</button>`:'',
  buttons:[{label:'Cancel'},{label:'Save',cls:'primary',onClick:m=>{const t=$('#fTitle',m).value.trim()||$('#fText',m).value.trim().split('\n')[0].slice(0,60);if(!t)return false;upsert('notes',{id:old?.id||uid(),title:t,text:$('#fText',m).value,pinned:$('#fPin',m).checked,date:old?.date||today(),isSample:false})}}]});
 $('#mDel')?.addEventListener('click',()=>{closeModal();removeItem('notes',old.id,'Note deleted')});
}

/* ---------------- SETTINGS ---------------- */
async function pSettings(){
 const s=state.settings,info=await storageInfo();
 const where={idb:'This browser’s app storage (IndexedDB)',local:'This browser’s local storage',memory:'Not saving — this browser blocks storage'}[Store.mode];
 $('#page-settings').innerHTML=head('Settings','Make Mediterranean Meal Planner yours, and keep your data safe.')+`
 <div class="grid g2" style="align-items:start">
  <div class="card"><div class="card-h"><h3>You</h3></div>
   <div class="set-row"><div class="lbl"><b>Your first name</b><span>Used in the greeting on Home</span></div><input type="text" id="sName" value="${esc(state.profile.name)}" placeholder="Optional"></div>
   <div class="set-row"><div class="lbl"><b>Planner title</b><span>Shown on printouts</span></div><input type="text" id="sPlanner" value="${esc(state.profile.plannerName)}"></div>
  </div>
  <div class="card"><div class="card-h"><h3>Appearance</h3></div>
   <div class="set-row"><div class="lbl"><b>Theme</b></div>${segmented('sTheme',['System','Light','Dark'],s.theme[0].toUpperCase()+s.theme.slice(1))}</div>
   <div class="set-row"><div class="lbl"><b>Accent colour</b><span>${ACCENTS[s.accent]?.[2]||''}</span></div><div class="swatches">${Object.entries(ACCENTS).map(([k,v])=>`<button class="${k===s.accent?'on':''}" style="background:${v[0]}" data-accent="${k}" aria-label="${v[2]}" title="${v[2]}"></button>`).join('')}</div></div>
  </div>
  <div class="card"><div class="card-h"><h3>Planning</h3></div>
   <div class="set-row"><div class="lbl"><b>Week starts on</b></div><select id="sWeek"><option value="1" ${s.weekStart===1?'selected':''}>Monday</option><option value="0" ${s.weekStart===0?'selected':''}>Sunday</option><option value="6" ${s.weekStart===6?'selected':''}>Saturday</option></select></div>
   <div class="set-row"><div class="lbl"><b>Date format</b></div><select id="sDate">${[['auto','Automatic'],['DMY','DD/MM/YYYY'],['MDY','MM/DD/YYYY'],['YMD','YYYY-MM-DD']].map(([v,l])=>`<option value="${v}" ${s.dateFormat===v?'selected':''}>${l}</option>`).join('')}</select></div>
   <div class="set-row"><div class="lbl"><b>Daily water goal</b><span>Glasses per day</span></div><input type="number" id="sWater" min="1" max="20" value="${s.waterGoal}" style="width:90px"></div>
   <div class="set-row"><div class="lbl"><b>Show calories</b><span>Hide them if you’d rather not count</span></div><label class="switch"><input type="checkbox" id="sCal" ${s.showCalories?'checked':''}><span></span></label></div>
  </div>
  <div class="card"><div class="card-h"><h3>Your data</h3><span class="pill ${Store.mode==='memory'?'bad':'ok'}">${Store.mode==='memory'?'Not saving':'Auto-saving'}</span></div>
   <p class="small" style="margin:0 0 4px"><b>Saved in:</b> ${where}</p>
   <p class="small muted" style="margin:0 0 12px">Using ${fmtBytes(info.used)}${info.quota?` of ${fmtBytes(info.quota)} available`:''} · Last backup: ${s.lastBackup?fmtDate(ymd(new Date(s.lastBackup))):'never'}</p>
   <div class="actions"><button class="btn primary" data-action="exportBackup">${ic('down')}Back up now</button><button class="btn" data-action="importBackup">${ic('up')}Restore backup</button><button class="btn" data-action="exportCSV">Export CSV</button></div>
   <input type="file" id="importFile" accept=".json,application/json" hidden>
   <div class="set-row" style="margin-top:6px"><div class="lbl"><b>Weekly backup reminder</b><span>A gentle nudge if it’s been over 7 days</span></div><label class="switch"><input type="checkbox" id="sRemind" ${s.backupRemind?'checked':''}><span></span></label></div>
   <p class="small muted" style="margin:6px 0 0">Your planner lives only on this device, in this browser. Nothing is uploaded anywhere. To move to another device, back up here and restore there.</p>
  </div>
  <div class="card"><div class="card-h"><h3>Start fresh</h3></div>
   <div class="set-row"><div class="lbl"><b>Sample data</b><span>${hasSamples()?'Example meals, recipes and lists are still here':'Cleared — the sample week has been removed'}</span></div><button class="btn" data-action="${hasSamples()?'clearSamples':'loadSamples'}">${hasSamples()?'Clear samples':'Load samples'}</button></div>
   <div class="set-row"><div class="lbl"><b>Erase everything</b><span>Deletes all your plans in this browser</span></div><button class="btn danger" data-action="eraseAll">Erase…</button></div>
  </div>
  <div class="card"><div class="card-h"><h3>Help</h3></div>
   <div class="set-row"><div class="lbl"><b>Welcome tour</b><span>See the quick introduction again</span></div><button class="btn" data-action="onboarding">Show</button></div>
   <div class="set-row"><div class="lbl"><b>Keyboard shortcuts</b><span><kbd>/</kbd> or <kbd>${$('#searchKbd').textContent}</kbd> search · <kbd>N</kbd> quick add · <kbd>Esc</kbd> close</span></div></div>
   <div class="set-row"><div class="lbl"><b>Check everything works</b><span>Runs a quick health check — doesn’t change your data</span></div><button class="btn" data-action="diagnostics">Run check</button></div>
   <p class="small muted" style="margin:12px 0 0">Mediterranean Meal Planner v${APP.version} · Designed by KaelLabs</p>
  </div>
 </div>`;
 const bindSet=(id,fn)=>$('#'+id).addEventListener('change',e=>{fn(e.target);save();applyTheme();renderNav();renderBanners()});
 bindSet('sName',el=>state.profile.name=el.value.trim());bindSet('sPlanner',el=>state.profile.plannerName=el.value.trim()||'My Mediterranean Planner');
 bindSet('sWeek',el=>{s.weekStart=+el.value;state.ui.weekOffset=0});bindSet('sDate',el=>s.dateFormat=el.value);
 bindSet('sWater',el=>s.waterGoal=clamp(parseInt(el.value)||8,1,20));bindSet('sCal',el=>s.showCalories=el.checked);bindSet('sRemind',el=>{s.backupRemind=el.checked});
 $$('#sTheme button').forEach(b=>b.onclick=()=>{s.theme=b.dataset.v.toLowerCase();applyTheme();commit()});
 $('#importFile').onchange=e=>{importBackup(e.target.files[0]);e.target.value=''};
}

/* ---------------- data actions ---------------- */
function upsert(coll,obj){const i=state[coll].findIndex(x=>x.id===obj.id);if(i<0)state[coll].push(obj);else state[coll][i]={...state[coll][i],...obj};commit()}
function removeItem(coll,id,msg){const i=state[coll].findIndex(x=>x.id===id);if(i<0)return;const [old]=state[coll].splice(i,1);commit();toast(msg,'',()=>{state[coll].splice(Math.min(i,state[coll].length),0,old);commit()})}
async function clearSamples(){
 if(!await confirmBox('All example meals, recipes and lists will be removed. Anything you added yourself stays.',{title:'Clear sample data?',ok:'Clear samples'}))return;
 takeSnapshot();COLLECTIONS.forEach(k=>state[k]=state[k].filter(x=>!x.isSample));state.water={};state.settings.sampleCleared=true;commit();toast('Sample data cleared — it’s all yours now','',restoreSnapshot);
}
function loadSamples(){const smp=sampleState();takeSnapshot();COLLECTIONS.forEach(k=>state[k]=state[k].concat(smp[k]));state.settings.sampleCleared=false;commit();toast('Sample week loaded','',restoreSnapshot)}
async function eraseAll(){
 if(!await confirmBox('This permanently deletes every meal, recipe, list and note in this browser. Make a backup first if you might want them later.',{title:'Erase everything?',ok:'Erase everything',danger:true}))return;
 const keep={theme:state.settings.theme,accent:state.settings.accent};takeSnapshot();state=blankState();Object.assign(state.settings,keep,{onboarded:true,sampleCleared:true});applyTheme();commit();go('home');toast('Planner erased','',restoreSnapshot);
}
function download(name,data,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function exportBackup(){state.settings.lastBackup=new Date().toISOString();state.ui.backupSnooze=null;download(`mediterranean-meal-planner-backup-${today()}.json`,JSON.stringify({app:'mediterranean-meal-planner',version:2,exportedAt:new Date().toISOString(),state},null,1),'application/json');commit();toast('Backup saved to your downloads')}
function exportCSV(){
 const q=v=>`"${String(v??'').replace(/"/g,'""')}"`,rows=[['Type','Date','Meal / Category','Title','Calories','Status / Qty','Details']];
 state.meals.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(m=>rows.push(['Meal',m.date,m.slot,m.title,m.calories,m.status,(m.groups||[]).map(k=>G[k]?.label).join('; ')]));
 state.recipes.forEach(r=>rows.push(['Recipe','',r.category,r.title,r.calories,'',r.ingredients.join('; ')]));
 state.shopping.forEach(i=>rows.push(['Shopping','',i.aisle,i.name,'',i.qty,i.done?'Bought':'To buy']));
 state.pantry.forEach(i=>rows.push(['Pantry',i.expiry,i.aisle,i.name,'',i.qty,'']));
 state.tasks.forEach(t=>rows.push(['Prep task',t.date,t.priority,t.title,'',t.status,'']));
 download(`mediterranean-meal-planner-${today()}.csv`,'﻿'+rows.map(r=>r.map(q).join(',')).join('\r\n'),'text/csv');toast('CSV exported — opens in Excel, Numbers or Sheets');
}
function importBackup(file){
 if(!file)return;if(file.size>60*1024*1024){toast('That file is too large to be a backup','err');return}
 const rd=new FileReader();rd.onload=async()=>{try{const x=migrate(JSON.parse(rd.result));const n=COLLECTIONS.reduce((a,k)=>a+x[k].length,0);
  if(!await confirmBox(`This backup has ${n} items. Restoring replaces what’s in this browser now.`,{title:'Restore backup?',ok:'Restore'}))return;
  takeSnapshot();x.settings.onboarded=true;state=x;applyTheme();await flush();go('home');toast('Backup restored','',restoreSnapshot)}catch(e){toast(e.message.includes('Mediterranean Meal Planner')?e.message:'That file couldn’t be read as a backup.','err')}};
 rd.onerror=()=>toast('Couldn’t read that file','err');rd.readAsText(file);
}

/* ---------------- print ---------------- */
function printHead(title){return `<div class="print-head" style="display:none"><svg viewBox="0 0 270 64" aria-hidden="true"><g transform="scale(1)"><rect width="64" height="64" rx="16" fill="#1D5673"/>${MARK_INNER}</g><g transform="translate(76 14) scale(1)" fill="#1E2A30"><path d="${WM_D}"/></g></svg><div style="text-align:right"><b class="serif" style="font-size:16px">${esc(title)}</b><br><span class="small muted">${esc(state.profile.plannerName)}</span></div></div>`}
function doPrint(kind,orient){
 document.body.dataset.print=kind;let st=$('#pageOrient');if(!st){st=document.createElement('style');st.id='pageOrient';document.head.appendChild(st)}
 st.textContent=`@page{size:${orient};margin:12mm}`;
 const done=()=>{delete document.body.dataset.print;st.textContent='';window.removeEventListener('afterprint',done)};
 window.addEventListener('afterprint',done);setTimeout(()=>window.print(),60);setTimeout(done,60000);
}
function printWeek(){if(state.ui.page!=='week')go('week');doPrint('week','landscape')}
function printShopping(){if(state.ui.page!=='shopping')go('shopping');doPrint('shopping','portrait')}
function printRecipe(r){
 $('#printRecipe').innerHTML=printHead(r.title)+`<div class="rdetail"><img class="img" style="max-height:240px" src="${recipeImg(r)}" alt=""><div class="meta">${[r.category,r.time&&r.time+' min',r.servings&&'Serves '+r.servings,kcal(r.calories)].filter(Boolean).map(x=>`<span class="pill">${esc(x)}</span>`).join('')}</div><div class="grid g2" style="gap:24px"><div><h4>Ingredients</h4><ul>${r.ingredients.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div><div><h4>Method</h4><ol>${(r.method||'').split('\n').filter(Boolean).map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div></div></div>`;
 closeModal();doPrint('recipe','portrait');
}

/* ---------------- onboarding ---------------- */
function onboarding(step=0){
 const steps=[
  ()=>`<div class="onb"><svg class="big" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="var(--primary)"/>${MARK_INNER}</svg><h2>Welcome to Mediterranean Meal Planner</h2><p>Your Mediterranean meal planner. Plan the week, keep your recipes, and turn meals into a shopping list in one tap.</p><div class="field" style="max-width:320px;margin:0 auto;text-align:left"><label for="oName">What should we call you? <span class="hint">(optional)</span></label><input id="oName" value="${esc(state.profile.name)}" placeholder="First name" autocomplete="given-name"></div></div>`,
  ()=>`<div class="onb"><h2>How saving works</h2><p>Mediterranean Meal Planner saves as you go. Everything stays private on this device — there’s no account and nothing is uploaded.</p><div class="tips">
   <div>${ic('shield')}<span><b>Use the same browser each time.</b> Your plans are saved in the browser you’re using now${location.protocol==='file:'?', for this file in its current folder. If you move the file, restore a backup':''}.</span></div>
   <div>${ic('down')}<span><b>Back up once a week.</b> Settings → Back up now saves a small file you can restore any time, on any device.</span></div>
   <div>${ic('heart')}<span><b>Bookmark this page</b> so it’s one click away.</span></div></div></div>`,
  ()=>`<div class="onb"><h2>How would you like to start?</h2><p>You can change your mind later in Settings.</p><div class="choice" id="oStart"><button class="on" data-v="sample"><b>Explore a sample week</b><span>See Mediterranean Meal Planner filled with meals, recipes and a shopping list.</span></button><button data-v="blank"><b>Start with a blank planner</b><span>Jump straight in with your own meals.</span></button></div></div>`
 ];
 const last=step===steps.length-1;
 const m=openModal({title:'<span class="sr-only">Welcome</span>',size:'',body:steps[step]()+`<div class="steps">${steps.map((_,i)=>`<i class="${i===step?'on':''}"></i>`).join('')}</div>`,
  buttons:[...(step?[{label:'Back',onClick:()=>{setTimeout(()=>onboarding(step-1),10)}}]:[]),{label:last?'Start planning':'Next',cls:'primary',onClick:m=>{
   if(step===0)state.profile.name=$('#oName',m).value.trim();
   if(last){const v=$('#oStart .on',m)?.dataset.v;state.settings.onboarded=true;if(v==='blank'&&hasSamples()){COLLECTIONS.forEach(k=>state[k]=state[k].filter(x=>!x.isSample));state.water={};state.settings.sampleCleared=true}commit();go('home');toast(v==='blank'?'All set — add your first meal':'Enjoy exploring!')}
   else setTimeout(()=>onboarding(step+1),10);
  }}],onClose:()=>{if(!state.settings.onboarded){state.settings.onboarded=true;save()}}});
 $$('#oStart button',m).forEach(b=>b.onclick=()=>{$$('#oStart button',m).forEach(x=>x.classList.remove('on'));b.classList.add('on')});
}

/* ---------------- diagnostics ---------------- */
async function diagnostics(){
 const r=[];const ok=(n,v)=>r.push([n,!!v]);
 try{const d=new Date(2026,0,31);ok('Dates use your local time',ymd(d)==='2026-01-31'&&addDays('2026-01-31',1)==='2026-02-01')}catch(e){ok('Dates use your local time',false)}
 ok('Week has 7 days',weekDays(curWeekStart()).length===7);
 try{await Store.set('__probe',Date.now());ok('Saving works ('+Store.mode+')',Store.mode!=='memory')}catch(e){ok('Saving works',false)}
 try{ok('Backup can be created',JSON.parse(JSON.stringify({app:'mediterranean-meal-planner',state})).app==='mediterranean-meal-planner')}catch(e){ok('Backup can be created',false)}
 try{ok('Backup can be restored',migrate(JSON.parse(JSON.stringify({app:'mediterranean-meal-planner',state}))).version===2)}catch(e){ok('Backup can be restored',false)}
 try{const c=document.createElement('canvas');ok('Photo resizing available',!!c.getContext('2d')&&c.toDataURL('image/jpeg').startsWith('data:image/jpeg'))}catch(e){ok('Photo resizing available',false)}
 ok('All pages present',PAGES.every(p=>$('#page-'+p[0])));
 ok('Shopping aisles sort correctly',guessAisle('Cherry tomatoes')==='Produce'&&guessAisle('Feta')==='Dairy & Eggs');
 const pass=r.every(x=>x[1]);
 openModal({title:pass?'Everything looks good':'Some checks need attention',size:'narrow',body:`<div class="list">${r.map(([n,v])=>`<div class="li"><div class="grow">${esc(n)}</div><span class="pill ${v?'ok':'bad'}">${v?'Pass':'Check'}</span></div>`).join('')}</div>${pass?'':'<p class="small muted">If saving fails, open the planner directly in Chrome, Safari, Edge or Firefox instead of a preview window.</p>'}`,buttons:[{label:'Close',cls:'primary'}]});
}

/* ---------------- event delegation ---------------- */
const ACTIONS={menu:openSidebar,toggleTheme:()=>{state.settings.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme();commit()},quickAdd,
 addMeal:()=>mealModal({}),addRecipe:()=>recipeModal(),addTask:()=>taskModal(),addGoal:()=>goalModal(),addNote:()=>noteModal(),addPantry:()=>pantryModal(),water:()=>addWater(1),
 genShopping,copyWeek,clearWeek,printWeek,printShopping,copyList,clearSamples,loadSamples,eraseAll,exportBackup,exportCSV,importBackup:()=>$('#importFile').click(),onboarding:()=>onboarding(0),diagnostics,
 snoozeBackup:()=>{state.ui.backupSnooze=addDays(today(),3);commit()},
 clearBought:()=>{takeSnapshot();const n=state.shopping.filter(i=>i.done).length;state.shopping=state.shopping.filter(i=>!i.done);commit();toast(`Cleared ${n} bought item${n===1?'':'s'}`,'',restoreSnapshot)},
 clearDone:()=>{takeSnapshot();state.tasks=state.tasks.filter(t=>t.status!=='Done');commit();toast('Finished tasks cleared','',restoreSnapshot)}};
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-action],[data-go],[data-meal],[data-add-meal],[data-week],[data-month],[data-recipe],[data-fav],[data-rfilter],[data-shopedit],[data-del],[data-restock],[data-pantryedit],[data-taskedit],[data-goal],[data-goaledit],[data-day],[data-noteedit],[data-glass],[data-accent]');
 if(!el)return;const d=el.dataset;
 if(d.action){ACTIONS[d.action]?.();return}
 if(d.go){e.preventDefault();if($('#overlay').classList.contains('open'))closeModal();go(d.go);return}
 if(d.meal){if($('#overlay').classList.contains('open'))closeModal();setTimeout(()=>mealModal({id:d.meal}),10);return}
 if(d.addMeal){const [date,slot]=d.addMeal.split('|');if($('#overlay').classList.contains('open'))closeModal();setTimeout(()=>mealModal({date,slot}),10);return}
 if(d.week!=null){state.ui.weekOffset=d.week==='0'?0:state.ui.weekOffset+(+d.week);commit();return}
 if(d.month!=null){if(d.month==='0'){state.ui.calMonth=new Date().getMonth();state.ui.calYear=new Date().getFullYear()}else{let mo=state.ui.calMonth+(+d.month),y=state.ui.calYear;if(mo<0){mo=11;y--}if(mo>11){mo=0;y++}state.ui.calMonth=mo;state.ui.calYear=y}commit();return}
 if(d.fav){const r=state.recipes.find(x=>x.id===d.fav);if(r){r.fav=!r.fav;commit()}return}
 if(d.recipe){recipeDetail(d.recipe);return}
 if(d.rfilter){state.ui.recipeFilter=d.rfilter;commit();return}
 if(d.shopedit){shopModal(d.shopedit);return}
 if(d.del){const [c,id]=d.del.split('|');removeItem(c,id,'Item removed');return}
 if(d.restock){const p=state.pantry.find(x=>x.id===d.restock);if(p){state.shopping.push({id:uid(),name:p.name,qty:'',aisle:p.aisle,done:false,isSample:false});commit();toast(`${p.name} added to shopping`)}return}
 if(d.pantryedit){pantryModal(d.pantryedit);return}
 if(d.taskedit){if($('#overlay').classList.contains('open'))closeModal();setTimeout(()=>taskModal(d.taskedit),10);return}
 if(d.goal){const [id,n]=d.goal.split('|');const g=state.goals.find(x=>x.id===id);if(g){g.progress=clamp((+g.progress||0)+(+n),0,100);commit();if(g.progress===100)toast('Goal reached — well done! 🎉')}return}
 if(d.goaledit){goalModal(d.goaledit);return}
 if(d.day){dayModal(d.day);return}
 if(d.noteedit){noteModal(d.noteedit);return}
 if(d.glass){const t=today(),n=+d.glass,cur=+state.water[t]||0;state.water[t]=n===cur?n-1:n;commit();return}
 if(d.accent){state.settings.accent=d.accent;applyTheme();commit();return}
});
document.addEventListener('change',e=>{
 const d=e.target.dataset;
 if(d.shop){const i=state.shopping.find(x=>x.id===d.shop);if(i){i.done=e.target.checked;commit()}}
 else if(d.task){const t=state.tasks.find(x=>x.id===d.task);if(t){t.status=e.target.checked?'Done':'Open';commit();if(t.status==='Done')toast('Nice — task done','',()=>{t.status='Open';commit()})}}
 else if(d.eat){const m=state.meals.find(x=>x.id===d.eat);if(m){m.status=e.target.checked?'Eaten':'Planned';commit()}}
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role=button][data-recipe],[role=button][data-noteedit]')){e.preventDefault();e.target.click()}});

/* ---------------- boot ---------------- */
async function boot(){
 $('#menuBtn').innerHTML=ic('menu');$('#quickBtn').innerHTML=`${ic('plus')}<span class="hide-sm">Quick add</span>`;
 await Store.init();
 let saved;try{saved=await Store.get('state')}catch(e){}
 if(!saved&&Store.mode==='idb'){try{const raw=localStorage.getItem('mediterranean-meal-planner:state');if(raw)saved=JSON.parse(raw)}catch(e){}}
 try{state=saved?migrate(saved):sampleState()}catch(e){state=sampleState()}
 applyTheme();
 const h=(location.hash.match(/^#\/(\w+)/)||[])[1];
 go(h||state.ui.page||'home',{push:false});
 if(!saved)await flush();
 if(!state.settings.onboarded)setTimeout(()=>onboarding(0),250);
 // Installable app when hosted online (service workers can't run from a downloaded file)
 if(/^https?:$/.test(location.protocol)){
  const l=document.createElement('link');l.rel='manifest';l.href='manifest.webmanifest';document.head.appendChild(l);
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
 }
 setInterval(()=>{if(state.ui.page==='home'||state.ui.page==='today'){const d=today();if(d!==boot.day){boot.day=d;refresh()}}},60000);boot.day=today();
}
boot();
