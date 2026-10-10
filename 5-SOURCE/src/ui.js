/* ---------------- toasts ---------------- */
function toast(msg,type='',undo){
 const el=document.createElement('div');el.className='toast '+(type==='err'?'err':'');el.setAttribute('role',type==='err'?'alert':'status');
 const sp=document.createElement('span');sp.textContent=msg;el.appendChild(sp);
 if(undo){const b=document.createElement('button');b.textContent='Undo';b.onclick=()=>{undo();el.remove()};el.appendChild(b)}
 $('#toasts').appendChild(el);setTimeout(()=>el.remove(),undo?6500:3800);
}

/* ---------------- modal ---------------- */
let modalReturnFocus=null,modalOnClose=null;
function openModal({title,body,buttons=[],size='',left=null,onClose=null}){
 const m=$('#modal');modalReturnFocus=document.activeElement;modalOnClose=onClose;
 m.className='modal '+size;
 m.innerHTML=`<div class="m-h"><h2 id="mTitle">${title}</h2><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div><div class="m-b">${body}</div>${buttons.length||left?`<div class="m-f">${left?`<div class="left">${left}</div>`:''}${buttons.map((b,i)=>`<button class="btn ${b.cls||''}" data-mb="${i}">${b.label}</button>`).join('')}</div>`:''}`;
 buttons.forEach((b,i)=>m.querySelector(`[data-mb="${i}"]`).onclick=async()=>{const r=await b.onClick?.(m);if(r!==false)closeModal()});
 m.querySelector('[data-close]').onclick=closeModal;
 $('#overlay').classList.add('open');document.body.style.overflow='hidden';
 setTimeout(()=>{const f=m.querySelector('[autofocus]')||m.querySelector('.m-b input:not([type=file]):not([type=checkbox]),.m-b textarea,.m-b select');(f||m.querySelector('[data-close]')).focus()},40);
 return m;
}
function closeModal(){if(!$('#overlay').classList.contains('open'))return;$('#overlay').classList.remove('open');document.body.style.overflow='';const cb=modalOnClose;modalOnClose=null;cb?.();modalReturnFocus?.focus?.()}
$('#overlay').addEventListener('mousedown',e=>{if(e.target.id==='overlay')closeModal()});
function confirmBox(msg,{title='Are you sure?',ok='Confirm',danger=false}={}){
 return new Promise(res=>{let done=false;openModal({title,size:'narrow',body:`<p style="margin:0">${msg}</p>`,onClose:()=>{if(!done)res(false)},
  buttons:[{label:'Cancel',onClick:()=>{done=true;res(false)}},{label:ok,cls:danger?'danger':'primary',onClick:()=>{done=true;res(true)}}]})});
}
// focus trap
document.addEventListener('keydown',e=>{
 if(e.key!=='Tab'||!$('#overlay').classList.contains('open'))return;
 const f=$$('#modal button,#modal input,#modal select,#modal textarea,#modal [tabindex]:not([tabindex="-1"])').filter(x=>!x.disabled&&x.offsetParent!==null);
 if(!f.length)return;const a=f[0],z=f[f.length-1];
 if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
});

/* ---------------- form helpers ---------------- */
const fld=(label,id,value='',type='text',attrs='',cls='')=>`<div class="field ${cls}"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}" ${attrs}></div>`;
const sel=(label,id,opts,value,cls='')=>`<div class="field ${cls}"><label for="${id}">${label}</label><select id="${id}">${opts.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(l)}</option>`}).join('')}</select></div>`;
const area=(label,id,value='',rows=4,ph='',cls='full')=>`<div class="field ${cls}"><label for="${id}">${label}</label><textarea id="${id}" rows="${rows}" placeholder="${esc(ph)}">${esc(value)}</textarea></div>`;
const groupChips=(sel=[])=>`<div class="field full"><span class="flabel">Food groups <span class="hint">— used for your weekly Balance</span></span><div class="chips" id="fGroups">${GROUPS.map(g=>`<button type="button" class="chip ${sel.includes(g.k)?'on':''}" data-g="${g.k}" aria-pressed="${sel.includes(g.k)}"><span class="dot" style="background:${g.color}"></span> ${g.label}</button>`).join('')}</div></div>`;
function bindChips(m){$$('#fGroups .chip',m).forEach(c=>c.onclick=()=>{c.classList.toggle('on');c.setAttribute('aria-pressed',c.classList.contains('on'))})}
const readChips=m=>$$('#fGroups .chip.on',m).map(c=>c.dataset.g);
const segmented=(id,opts,val)=>`<div class="segmented" id="${id}" role="radiogroup">${opts.map(o=>`<button type="button" role="radio" aria-checked="${o===val}" class="${o===val?'on':''}" data-v="${o}">${o}</button>`).join('')}</div>`;
function bindSeg(m,id){$$(`#${id} button`,m).forEach(b=>b.onclick=()=>{$$(`#${id} button`,m).forEach(x=>{x.classList.remove('on');x.setAttribute('aria-checked','false')});b.classList.add('on');b.setAttribute('aria-checked','true')})}
const segVal=(m,id)=>$(`#${id} .on`,m)?.dataset.v;
const emptyState=(icon,title,text,btn='')=>`<div class="empty">${ic(icon)}<b>${title}</b>${text}${btn?`<div style="margin-top:14px">${btn}</div>`:''}</div>`;
const gdots=groups=>groups?.length?`<span class="gdots">${groups.slice(0,5).map(k=>G[k]?`<i style="background:${G[k].color}" title="${G[k].label}"></i>`:'').join('')}</span>`:'';

/* ---------------- navigation ---------------- */
const PAGES=[
 ['home','home','Home'],['today','sun','Today'],['week','week','Week Plan'],['recipes','book','Recipes'],['shopping','cart','Shopping'],['pantry','jar','Pantry'],
 ['balance','leaf','Balance'],['prep','list','Prep List'],['goals','target','Goals & Water'],['calendar','cal','Calendar'],['journal','pen','Journal'],['settings','gear','Settings']
];
const NAV_GROUPS=[['Plan',['home','today','week','calendar']],['Kitchen',['recipes','shopping','pantry','prep']],['Wellbeing',['balance','goals','journal']],['',['settings']]];
function renderNav(){
 const cnt={shopping:state.shopping.filter(x=>!x.done).length,prep:state.tasks.filter(t=>t.status!=='Done').length};
 $('#nav').innerHTML=NAV_GROUPS.map(([label,ids])=>`${label?`<div class="nav-label">${label}</div>`:'<div style="height:10px"></div>'}${ids.map(id=>{const p=PAGES.find(x=>x[0]===id);return `<button data-go="${id}" class="${state.ui.page===id?'active':''}" ${state.ui.page===id?'aria-current="page"':''}>${ic(p[1])}<span>${p[2]}</span>${cnt[id]?`<span class="count">${cnt[id]}</span>`:''}</button>`}).join('')}`).join('');
 const bn=[['home','home','Home'],['week','week','Week'],['recipes','book','Recipes'],['shopping','cart','Shop'],['more','more','More']];
 $('#bottomNav').innerHTML=bn.map(([id,icn,l])=>`<button ${id==='more'?'data-action="menu"':`data-go="${id}"`} class="${state.ui.page===id?'active':''}">${ic(icn)}<span>${l}</span></button>`).join('');
}
function go(page,{push=true}={}){
 if(!PAGES.some(p=>p[0]===page))page='home';
 state.ui.page=page;
 $$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));
 closeSidebar();renderPage(page);renderNav();renderBanners();
 if(push&&location.hash!=='#/'+page){try{history.pushState(null,'','#/'+page)}catch(e){location.hash='#/'+page}}
 document.title=`${PAGES.find(p=>p[0]===page)[2]} · Mediterranean Meal Planner`;
 window.scrollTo(0,0);save();
}
window.addEventListener('popstate',()=>{const p=(location.hash.match(/^#\/(\w+)/)||[])[1];if(p&&p!==state.ui.page)go(p,{push:false})});
function refresh(){renderPage(state.ui.page);renderNav();renderBanners()}
function openSidebar(){$('#sidebar').classList.add('open');$('#scrim').classList.add('open')}
function closeSidebar(){$('#sidebar').classList.remove('open');$('#scrim').classList.remove('open')}
$('#scrim').onclick=closeSidebar;

/* ---------------- theme ---------------- */
const mq=matchMedia('(prefers-color-scheme: dark)');
function applyTheme(){
 const t=state.settings.theme;const dark=t==='dark'||(t==='system'&&mq.matches);
 document.documentElement.dataset.theme=dark?'dark':'light';
 const a=ACCENTS[state.settings.accent]||ACCENTS.aegean;
 document.documentElement.style.setProperty('--primary',a[0]);document.documentElement.style.setProperty('--primary-deep',a[1]);
 $('meta[name=theme-color]')?.setAttribute('content',dark?'#0E181D':a[0]);
 $('#themeBtn').innerHTML=ic(dark?'sun':'moon');
}
mq.addEventListener?.('change',()=>{if(state.settings.theme==='system'){applyTheme();refresh()}});

/* ---------------- banners ---------------- */
function renderBanners(){
 const b=[];const t=today();
 if(Store.mode==='memory')b.push(`<div class="banner warn"><div class="ic">${ic('alert')}</div><div class="grow"><b>This browser can’t save your planner</b>Changes will be lost when you close this tab. Open the file in Chrome, Safari, Edge or Firefox — not a file preview — or use your online link.</div></div>`);
 else if(!lastSaveOk)b.push(`<div class="banner warn"><div class="ic">${ic('alert')}</div><div class="grow"><b>Your last change wasn’t saved</b>Storage may be full. Export a backup now, then remove a few large photos.</div><button class="btn sm primary" data-action="exportBackup">Export backup</button></div>`);
 const lb=state.settings.lastBackup,uc=userCount();
 const due=state.settings.backupRemind&&uc>=5&&(!lb||(Date.now()-new Date(lb).getTime())>7*864e5)&&(!state.ui.backupSnooze||state.ui.backupSnooze<=t);
 if(due&&['home','settings','week'].includes(state.ui.page))b.push(`<div class="banner"><div class="ic">${ic('shield')}</div><div class="grow"><b>Time for a quick backup</b>${lb?'Your last backup was '+fmtDate(ymd(new Date(lb)))+'.':'You haven’t backed up yet.'} Save a copy so you never lose your plans.</div><button class="btn sm ghost" data-action="snoozeBackup">Later</button><button class="btn sm primary" data-action="exportBackup">${ic('down')}Back up</button></div>`);
 if(hasSamples()&&state.ui.page==='home')b.push(`<div class="banner"><div class="ic">${ic('spark')}</div><div class="grow"><b>You’re looking at a sample week</b>Explore how everything works, then clear the examples and make it yours.</div><button class="btn sm" data-action="clearSamples">Clear sample data</button></div>`);
 $('#banners').innerHTML=b.join('');
}

/* ---------------- global search ---------------- */
let searchHits=[],searchIdx=-1;
function runSearch(q){
 q=q.trim().toLowerCase();const box=$('#searchResults');
 if(!q){box.classList.remove('open');box.innerHTML='';searchHits=[];return}
 const hits=[];const push=(page,type,rec,title,sub)=>hits.push({page,type,id:rec.id,title,sub});
 state.recipes.forEach(r=>{if(`${r.title} ${r.tags} ${r.ingredients.join(' ')}`.toLowerCase().includes(q))push('recipes','recipe',r,r.title,'Recipe')});
 state.meals.forEach(m=>{if(m.title.toLowerCase().includes(q))push('week','meal',m,m.title,`${m.slot} · ${relDay(m.date)}`)});
 state.shopping.forEach(i=>{if(i.name.toLowerCase().includes(q))push('shopping','shop',i,i.name,i.done?'Shopping · bought':'Shopping')});
 state.pantry.forEach(i=>{if(i.name.toLowerCase().includes(q))push('pantry','pantry',i,i.name,'Pantry')});
 state.tasks.forEach(i=>{if(i.title.toLowerCase().includes(q))push('prep','task',i,i.title,'Prep list')});
 state.goals.forEach(i=>{if(i.title.toLowerCase().includes(q))push('goals','goal',i,i.title,'Goal')});
 state.notes.forEach(i=>{if(`${i.title} ${i.text}`.toLowerCase().includes(q))push('journal','note',i,i.title,'Journal')});
 searchHits=hits.slice(0,12);searchIdx=searchHits.length?0:-1;
 box.innerHTML=searchHits.length?searchHits.map((h,i)=>`<button role="option" data-hit="${i}" class="${i===0?'hl':''}"><span>${esc(h.title)}</span><small>${esc(h.sub)}</small></button>`).join(''):`<div class="empty" style="padding:18px">No matches for “${esc(q)}”</div>`;
 box.classList.add('open');
}
function openHit(h){
 $('#searchResults').classList.remove('open');$('#search').value='';$('#search').blur();
 if(h.type==='meal'){const m=state.meals.find(x=>x.id===h.id);if(m){state.ui.weekOffset=weekOffsetFor(m.date)}}
 go(h.page);
 setTimeout(()=>{({recipe:()=>recipeDetail(h.id),meal:()=>mealModal({id:h.id}),shop:()=>shopModal(h.id),pantry:()=>pantryModal(h.id),task:()=>taskModal(h.id),goal:()=>goalModal(h.id),note:()=>noteModal(h.id)})[h.type]?.()},60);
}
$('#search').addEventListener('input',e=>runSearch(e.target.value));
$('#search').addEventListener('keydown',e=>{
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!searchHits.length)return;searchIdx=(searchIdx+(e.key==='ArrowDown'?1:-1)+searchHits.length)%searchHits.length;$$('#searchResults button').forEach((b,i)=>b.classList.toggle('hl',i===searchIdx))}
 else if(e.key==='Enter'&&searchHits[searchIdx]){e.preventDefault();openHit(searchHits[searchIdx])}
 else if(e.key==='Escape'){e.target.value='';runSearch('');e.target.blur()}
});
$('#searchResults').addEventListener('mousedown',e=>{const b=e.target.closest('[data-hit]');if(b){e.preventDefault();openHit(searchHits[+b.dataset.hit])}});
$('#search').addEventListener('blur',()=>setTimeout(()=>$('#searchResults').classList.remove('open'),120));
$('#searchKbd').textContent=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent)?'⌘K':'Ctrl K';

/* ---------------- keyboard ---------------- */
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&$('#overlay').classList.contains('open')){closeModal();return}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#search').focus();return}
 const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)||$('#overlay').classList.contains('open');
 if(typing)return;
 if(e.key==='/'){e.preventDefault();$('#search').focus()}
 else if(e.key.toLowerCase()==='n'&&!e.metaKey&&!e.ctrlKey){e.preventDefault();quickAdd()}
});

/* ---------------- quick add ---------------- */
function quickAdd(){
 const opts=[['meal','week','Meal','Plan a meal'],['recipe','book','Recipe','Save a recipe'],['shop','cart','Shopping item','Add to your list'],['pantry','jar','Pantry item','Track what you have'],['task','list','Prep task','Kitchen to-do'],['goal','target','Goal','Set a target'],['note','pen','Journal note','Jot it down'],['water','drop','+1 glass of water','Log it now']];
 openModal({title:'Quick add',body:`<div class="choice" style="grid-template-columns:repeat(2,minmax(0,1fr))">${opts.map(o=>`<button data-q="${o[0]}"><b style="display:flex;align-items:center;gap:8px">${ic(o[1],'qi')}${o[2]}</b><span>${o[3]}</span></button>`).join('')}</div><style>.qi{width:18px;height:18px;stroke:var(--accent-text);fill:none;stroke-width:2}</style>`});
 $$('#modal [data-q]').forEach(b=>b.onclick=()=>{const k=b.dataset.q;closeModal();setTimeout(()=>({meal:()=>mealModal({}),recipe:()=>recipeModal(),shop:()=>shopModal(),pantry:()=>pantryModal(),task:()=>taskModal(),goal:()=>goalModal(),note:()=>noteModal(),water:()=>addWater(1)})[k](),30)});
}
