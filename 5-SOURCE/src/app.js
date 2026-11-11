'use strict';
/* Mediterranean Meal Planner · v__VERSION__
   Single-file app. Your data is stored only in this browser (IndexedDB, with localStorage fallback). */
const APP={name:'Mediterranean Meal Planner',version:'__VERSION__',key:'mediterranean-meal-planner'};

/* ---------------- helpers ---------------- */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Keep matching records and controls in place so updates preserve focus and scroll. */
function updateHTML(root,html){
 const active=document.activeElement,selection=active&&'selectionStart' in active?[active.selectionStart,active.selectionEnd,active.selectionDirection]:null;
 const template=document.createElement('template');template.innerHTML=html;
 const attrs=['data-meal','data-recipe','data-shop','data-shopedit','data-pantryedit','data-task','data-taskedit','data-goaledit','data-noteedit','data-go','data-fav','data-day'];
 const key=node=>{if(node.nodeType!==1)return '';if(node.id)return 'id:'+node.id;for(const attr of attrs){if(node.hasAttribute(attr))return attr+':'+node.getAttribute(attr)}const child=node.matches('.li,.rwrap,.card')?node.querySelector(attrs.map(a=>'['+a+']').join(',')):null;return child?node.tagName+':'+attrs.filter(a=>child.hasAttribute(a)).map(a=>a+':'+child.getAttribute(a)).join('|'):''};
 const same=(a,b)=>a.nodeType===b.nodeType&&a.nodeName===b.nodeName;
 const sync=(target,source)=>{
  if(target.nodeType!==1){if(target.nodeValue!==source.nodeValue)target.nodeValue=source.nodeValue;return}
  const focused=target===document.activeElement;
  for(const attr of [...target.attributes])if(!source.hasAttribute(attr.name))target.removeAttribute(attr.name);
  for(const attr of source.attributes)if(target.getAttribute(attr.name)!==attr.value)target.setAttribute(attr.name,attr.value);
  children(target,source);
  if(target instanceof HTMLInputElement){if(target.type!=='file'&&!focused&&target.value!==source.value)target.value=source.value;if(target.checked!==source.checked)target.checked=source.checked}
  if((target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement)&&!focused&&target.value!==source.value)target.value=source.value;
 };
 const children=(target,source)=>{
  const old=[...target.childNodes],used=new Set(),keyed=new Map(old.map(n=>[key(n),n]).filter(([k])=>k));let cursor=target.firstChild;
  for(const fresh of [...source.childNodes]){const k=key(fresh);let node=k?keyed.get(k):old.find(n=>!used.has(n)&&!key(n)&&same(n,fresh));if(node&&(!same(node,fresh)||used.has(node)))node=null;
   if(node){used.add(node);if(node!==cursor)target.insertBefore(node,cursor);sync(node,fresh)}else{node=fresh.cloneNode(true);target.insertBefore(node,cursor)}cursor=node.nextSibling;
  }
  for(const node of old)if(!used.has(node))node.remove();
 };
 children(root,template.content);
 if(active?.isConnected&&document.activeElement!==active){active.focus({preventScroll:true});if(selection&&selection[0]!==null)active.setSelectionRange(...selection)}
}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const pad=n=>String(n).padStart(2,'0');
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
/* Local-time dates (never toISOString — that shifts the day in many timezones) */
const DEMO=__DEMO__,HOSTED=__HOSTED__,ETSY_URL='__ETSY__';
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');return m?new Date(+m[1],+m[2]-1,+m[3]):new Date(NaN)};
const today=()=>ymd(new Date());
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return ymd(d)};
const weekStartOf=(s,ws)=>{const d=parse(s);const diff=(d.getDay()-ws+7)%7;d.setDate(d.getDate()-diff);return ymd(d)};
const weekDays=start=>Array.from({length:7},(_,i)=>addDays(start,i));
const debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};
function fmtDate(s,style='medium'){
 const d=parse(s);if(isNaN(d))return '—';
 const f=state?.settings?.dateFormat||'auto';
 if(style==='weekday')return d.toLocaleDateString(undefined,{weekday:'short'});
 if(style==='long')return d.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
 if(f==='auto'){return style==='short'?d.toLocaleDateString(undefined,{day:'numeric',month:'short'}):d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}
 const D=pad(d.getDate()),M=pad(d.getMonth()+1),Y=d.getFullYear();
 const full=f==='DMY'?`${D}/${M}/${Y}`:f==='MDY'?`${M}/${D}/${Y}`:`${Y}-${M}-${D}`;
 if(style==='short')return f==='DMY'?`${D}/${M}`:f==='MDY'?`${M}/${D}`:`${M}-${D}`;
 return full;
}
function relDay(s){const t=today();if(s===t)return 'Today';if(s===addDays(t,1))return 'Tomorrow';if(s===addDays(t,-1))return 'Yesterday';return fmtDate(s,'weekday')+' '+fmtDate(s,'short')}
function greeting(){const h=new Date().getHours();return h<5?'Good evening':h<12?'Good morning':h<18?'Good afternoon':'Good evening'}

/* ---------------- icons (original line icons) ---------------- */
const IC={
 users:'<circle cx="9" cy="7" r="3"/><path d="M3 20v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3m1-16a3 3 0 0 1 0 6m2 3a4 4 0 0 1 3 4v3"/>',
 meal:'<circle cx="12" cy="12" r="5"/><path d="M2 3v7a2 2 0 0 0 4 0V3m-2 0v18M22 3c-3 1-3 6-3 9h3m0-9v18"/>',
 overview:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
 home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
 week:'<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M9 9.5v11M15 9.5v11M8 2.5v4M16 2.5v4"/>',
 book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/><path d="M9 7.5h7"/>',
 cart:'<path d="M3 4h2.2l2.3 11h10.8l2-8H6.3"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
 jar:'<rect x="5" y="7" width="14" height="14" rx="3"/><path d="M7 3.5h10v3.5H7z"/><path d="M5 12h14"/>',
 leaf:'<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19 14 10"/>',
 check:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="m8 12 3 3 5-6"/>',
 list:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/>',
 target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
 cal:'<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M7.5 13.5h.01M12 13.5h.01M16.5 13.5h.01M7.5 17h.01M12 17h.01"/>',
 pen:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 left:'<path d="m15 18-6-6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',
 print:'<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
 down:'<path d="M12 4v11M7 10.5l5 5 5-5"/><path d="M4 20h16"/>',up:'<path d="M12 16V5M7 9.5l5-5 5 5"/><path d="M4 20h16"/>',
 trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 edit:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>',
 heart:'<path d="M12 20s-7.5-4.6-9-9.3C2 7.4 4.2 4.5 7.4 4.5c2 0 3.5 1.1 4.6 2.7 1.1-1.6 2.6-2.7 4.6-2.7 3.2 0 5.4 2.9 4.4 6.2C19.5 15.4 12 20 12 20z"/>',
 drop:'<path d="M12 3.5s-6.5 7-6.5 11.2A6.5 6.5 0 0 0 12 21a6.5 6.5 0 0 0 6.5-6.3C18.5 10.5 12 3.5 12 3.5z"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',
 shield:'<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4.5"/>',
 copy:'<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
 spark:'<path d="M11 3c.6 4.2 2.4 6 6.6 6.6-4.2.6-6 2.4-6.6 6.6-.6-4.2-2.4-6-6.6-6.6C8.6 9 10.4 7.2 11 3z"/><path d="M18.5 14.5c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3z"/><path d="M5 17v4M3 19h4"/>',
 alert:'<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
 pin:'<path d="M9 3.5h6l-1 5 3.5 3.5h-11L10 8.5z"/><path d="M12 12v8.5"/>',
 moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
 wand:'<path d="m3 21 11.5-11.5M12.5 7.5l4 4"/><path d="M17.5 2.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/><path d="M8 2.5v3M6.5 4h3M20 13v3M18.5 14.5h3"/>',
 fish:'<path d="M3 12c3-4 7-5.5 11-5.5 3 0 5 2 7 5.5-2 3.5-4 5.5-7 5.5-4 0-8-1.5-11-5.5z"/><path d="M3 12 1.5 8.5M3 12l-1.5 3.5"/><circle cx="16" cy="11" r=".8"/>',
 info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.5h.01"/>',
 bell:'<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/>',
 bottle:'<path d="M10 3h4v3l1.5 2.5V20a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 8.5 20V8.5L10 6z"/><path d="M8.5 13h7"/>',
 egg:'<path d="M12 3.5c3.5 0 6 5.5 6 9.5a6 6 0 0 1-12 0c0-4 2.5-9.5 6-9.5z"/>',
 tomato:'<circle cx="12" cy="13.5" r="7"/><path d="M9 6.5c1.2.4 2 .1 3-1 1 1.1 1.8 1.4 3 1M12 5.5V3"/>',
 bowl:'<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M8 20.5h8"/><path d="M8 8c0-1.5 1-2 1-3.5M12 8c0-1.5 1-2 1-3.5M16 8c0-1.5 1-2 1-3.5"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 dash:'<rect x="3.5" y="3.5" width="7.5" height="9" rx="1.8"/><rect x="13" y="3.5" width="7.5" height="5" rx="1.8"/><rect x="13" y="10.5" width="7.5" height="10" rx="1.8"/><rect x="3.5" y="14.5" width="7.5" height="6" rx="1.8"/>',
 caldays:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" stroke-width="2.4"/>',
 calcheck:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15.2 2 2 4-4"/>',
 chef:'<path d="M7 14.5a4 4 0 0 1-.6-7.9 5.5 5.5 0 0 1 11.2 0A4 4 0 0 1 17 14.5"/><path d="M7 14.5V20h10v-5.5M7 17h10"/>',
 jar2:'<path d="M8 3.5h8v3H8z"/><path d="M7.5 6.5h9a2 2 0 0 1 2 2V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V8.5a2 2 0 0 1 2-2z"/><path d="M5.5 11h13M5.5 16h13"/>',
 clip:'<rect x="5" y="4.5" width="14" height="16.5" rx="2.2"/><path d="M9 3h6v3H9z"/><path d="M9 11h6M9 14.5h6M9 18h3.5"/>',
 pie:'<path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.6V13.5z"/><path d="M14 3.2a8.5 8.5 0 0 1 6.8 6.8H14z"/>',
 notebook:'<path d="M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z"/><path d="M6 3.5v17M3.5 8H6M3.5 12H6M3.5 16H6M10 9h5"/>',
 bag:'<path d="M5.5 8h13l-.9 12.5H6.4z"/><path d="M9 10.5V6.5a3 3 0 0 1 6 0v4"/>',
 dish:'<path d="M3 17.5h18M4.5 17.5a7.5 7.5 0 0 1 15 0"/><path d="M12 10V8.2M10.6 8h2.8"/><path d="M6 20.5h12"/>',
 chart:'<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M8 16.5v-4M12 16.5v-8M16 16.5v-6"/>',
 doc:'<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M9 12h6M9 15.5h6"/>',
 more:'<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>'
};
const ic=(n,cls='')=>`<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${IC[n]||''}</svg>`;
const STAR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg>';

/* ---------------- domain constants ---------------- */
const SLOTS=['Breakfast','Lunch','Dinner','Snack'];
const SLOT_COLOR={Breakfast:'#F2B84B',Lunch:'#6E9B3A',Dinner:'#1F4A38',Snack:'#D9683A'};
const GROUPS=[
 {k:'veg',label:'Vegetables',color:'#5E9442'},{k:'fruit',label:'Fruit',color:'#E0873A'},{k:'legumes',label:'Legumes',color:'#A77B45'},
 {k:'grains',label:'Whole grains',color:'#D2A64A'},{k:'fish',label:'Fish & seafood',color:'#3C8DB5'},{k:'oliveoil',label:'Olive oil',color:'#9AA63A'},
 {k:'nuts',label:'Nuts & seeds',color:'#8A6242'},{k:'dairy',label:'Yogurt & cheese',color:'#8E7BB5'},{k:'poultry',label:'Poultry & eggs',color:'#D9A05B'},{k:'redmeat',label:'Red meat',color:'#B5473A'}
];
const G=Object.fromEntries(GROUPS.map(g=>[g.k,g]));
/* General Mediterranean-style weekly patterns (guidance only, not medical advice) */
const GUIDES={veg:{min:14,txt:'Most meals'},legumes:{min:3,txt:'3+ meals a week'},fish:{min:2,txt:'2+ meals a week'},nuts:{min:3,txt:'A handful, 3+ times'},grains:{min:7,txt:'Daily'},fruit:{min:7,txt:'Daily'},oliveoil:{min:7,txt:'Your main fat'},redmeat:{max:2,txt:'Keep it occasional'}};
const AISLES=['Produce','Herbs & Spices','Bakery & Grains','Legumes & Canned','Fish & Meat','Dairy & Eggs','Oils & Condiments','Nuts & Seeds','Frozen','Other'];
const AISLE_WORDS=[
 ['Produce',/\b(green beans|broad beans|runner beans|fresh herbs)\b/i],
 ['Herbs & Spices',/\b(basil|parsley|dill|oregano|mint|thyme|rosemary|cumin|paprika|za.?atar|sumac|cinnamon|pepper flakes|chili flakes|chilli flakes|black pepper|salt|coriander|bay lea)/i],
 ['Legumes & Canned',/\b(chickpeas?|lentils?|beans?|cannellini|canned|tinned|can of|tuna|sardines?|anchov\w*|olives?(?! oil)|capers|chopped tomatoes|passata|artichoke hearts?)\b/i],
 ['Oils & Condiments',/\b(olive oil|oil|vinegar|tahini|honey|mustard|harissa|pesto|stock|broth|tomato paste)\b/i],
 ['Fish & Meat',/\b(salmon|fish|cod|shrimp|prawns?|sea bass|chicken|turkey|beef|lamb|mussels?)\b/i],
 ['Dairy & Eggs',/\b(yogh?urt|feta|cheese|halloumi|milk|eggs?|labneh|butter|parmesan|ricotta|mozzarella|hummus|tzatziki)\b/i],
 ['Bakery & Grains',/\b(bread|pitas?|oats?|bulgur|farro|quinoa|rice|pasta|couscous|barley|flour|wraps?)\b/i],
 ['Nuts & Seeds',/\b(walnuts?|almonds?|pistachios?|pine nuts?|seeds?|hazelnuts?|cashews?)\b/i],
 ['Frozen',/\bfrozen\b/i],
 ['Produce',/\b(tomato\w*|cucumbers?|onions?|garlic|lemons?|limes?|spinach|kale|lettuce|peppers?|zucchini|courgettes?|eggplants?|aubergines?|carrots?|potato\w*|berries|berry|apples?|oranges?|figs?|grapes?|avocados?|greens|rocket|arugula|herbs|fruit|vegetables?|mushrooms?|celery|leeks?|pomegranates?|bananas?|peach\w*)\b/i]
];
const guessAisle=name=>{for(const [a,re] of AISLE_WORDS)if(re.test(name))return a;return 'Other'};
const ACCENTS={forest:['#1F4A38','#163629','Forest green'],midnight:['#20395C','#162944','Midnight blue'],burgundy:['#6A2B3B','#4E1F2B','Burgundy']};
const TIPS=['Build each plate around vegetables first, then add grains and protein.','Cook a pot of beans or lentils on the weekend for quick lunches.','Keep a jar of mixed herbs and lemon zest for instant flavour.','A handful of nuts makes an easy afternoon snack.','Swap butter for extra virgin olive oil when roasting vegetables.','Plan fish twice a week — canned sardines and tuna count too.','Roast a big tray of vegetables to use across three meals.','Fruit and yogurt make a simple, satisfying dessert.','Freeze leftover soup in single portions for busy nights.','Shop the produce aisle first and fill half your basket there.'];

/* ---------------- illustrated sample dishes (original, generated SVG) ---------------- */
function rng(seed){let s=0;for(const c of seed)s=(s*31+c.charCodeAt(0))>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const ART={
 salad:{bg:'#E8DCC6',fill:'#DDE7C9',items:[[16,'leaf','#5E9442',20],[8,'circle','#D9483B',12],[7,'ring','#A9C77B',12],[14,'circle','#E6C891',6],[6,'square','#FBFAF4',9],[6,'olive','#3B2F3A',7]]},
 salmon:{bg:'#D8E4EA',fill:'#F3EFE6',center:'fillet',items:[[12,'leaf','#5E9442',16],[3,'lemon','#F4CF4F',17],[10,'dot','#2F5B2A',3]]},
 oats:{bg:'#F1E2CF',fill:'#EFE3CC',items:[[1,'swirl','#FFFFFF',60],[9,'circle','#3B4C8A',9],[7,'circle','#C8324A',8],[6,'walnut','#8A6242',11],[10,'dot','#E6D3B0',3]]},
 hummus:{bg:'#E5DECF',fill:'#E9D6AE',items:[[1,'swirl','#D9BE86',70],[1,'pool','#B9B23A',26],[14,'dot','#C0473A',2.6],[6,'stick','#E0873A',10],[5,'ring','#A9C77B',10],[4,'olive','#3B2F3A',7]],noScatterCenter:true},
 shakshuka:{bg:'#E3D6C8',fill:'#C8452F',pan:true,items:[[4,'egg','#FFFFFF',20],[14,'leaf','#4E8A3A',8],[10,'dot','#8E2A1C',3]]},
 lentil:{bg:'#E9D9C4',fill:'#D98A3D',items:[[1,'swirl','#F1D9A8',55],[12,'leaf','#4E8A3A',8],[2,'lemon','#F4CF4F',14],[10,'dot','#8B4A1C',2.5]]},
 tuna:{bg:'#DCE3E0',fill:'#EEF0E6',items:[[12,'leaf','#5E9442',16],[12,'circle','#F4EFE2',8],[8,'flake','#C99A8A',10],[6,'circle','#D9483B',10],[5,'olive','#3B2F3A',7]]},
 chickensalad:{bg:'#E6DDC9',fill:'#DCE6C6',items:[[18,'leaf','#5E9442',18],[7,'circle','#D9483B',10],[9,'chunk','#EBC999',15],[6,'ring','#A9C77B',11],[5,'olive','#3B2F3A',7],[5,'square','#FBFAF4',9]]},
 pasta:{bg:'#EFE3D0',fill:'#F6EAC4',items:[[26,'noodle','#E3C06C',26],[1,'pool','#F1DCA0',34],[12,'noodle','#F5E3AC',20],[7,'leaf','#4E8A3A',9],[9,'dot','#3B2F3A',2],[4,'circle','#D9483B',9]]},
 stirfry:{bg:'#E3D9C8',fill:'#F2E7CD',items:[[9,'chunk','#E2AE70',15],[8,'stick','#D9483B',9],[8,'stick','#5E9442',9],[6,'stick','#E0873A',9],[7,'circle','#3F7A2E',9],[16,'dot','#FFFFFF',2.2]]},
 pancakes:{bg:'#EFE0CC',fill:'#F7F0E3',center:'stack',items:[[5,'ring','#F6E2A0',9],[7,'dot','#C8324A',5],[5,'leaf','#5E9442',8]],noScatterCenter:true},
 peppers:{bg:'#EADFCB',fill:'#F3EFE6',items:[[1,'pepper','#D9483B',0],[1,'pepper2','#F2B84B',0],[10,'leaf','#4E8A3A',9],[8,'square','#FBFAF4',8]],noScatterCenter:true}
};
const artCache={};
function art(kind){
 if(PHOTOS[kind])return PHOTOS[kind];
 if(artCache[kind])return artCache[kind];
 const a=ART[kind]||ART.salad,r=rng(kind);let s='';
 const cx=200,cy=150;
 const pos=(min=0,max=82)=>{const ang=r()*Math.PI*2,d=min+Math.sqrt(r())*(max-min);return [cx+Math.cos(ang)*d,cy+Math.sin(ang)*d*.92]};
 const shape={
  circle:(x,y,z,c)=>`<circle cx="${x}" cy="${y}" r="${z}" fill="${c}"/>`,
  dot:(x,y,z,c)=>`<circle cx="${x}" cy="${y}" r="${z}" fill="${c}"/>`,
  ring:(x,y,z,c)=>`<circle cx="${x}" cy="${y}" r="${z}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${z*.62}" fill="#EEF4DD"/>`,
  leaf:(x,y,z,c)=>{const a2=r()*360;return `<path transform="translate(${x} ${y}) rotate(${a2})" d="M${-z} 0Q0 ${-z*.55} ${z} 0Q0 ${z*.55} ${-z} 0Z" fill="${c}" opacity="${.8+r()*.2}"/>`},
  square:(x,y,z,c)=>`<rect x="${x-z/2}" y="${y-z/2}" width="${z}" height="${z}" rx="2" fill="${c}" transform="rotate(${r()*90} ${x} ${y})"/>`,
  olive:(x,y,z,c)=>`<ellipse cx="${x}" cy="${y}" rx="${z}" ry="${z*.72}" fill="${c}" transform="rotate(${r()*180} ${x} ${y})"/>`,
  lemon:(x,y,z,c)=>`<circle cx="${x}" cy="${y}" r="${z}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${z*.8}" fill="#FBE7A0"/><path d="M${x-z*.8} ${y}H${x+z*.8}M${x} ${y-z*.8}V${y+z*.8}" stroke="${c}" stroke-width="1.5"/>`,
  walnut:(x,y,z,c)=>`<ellipse cx="${x}" cy="${y}" rx="${z}" ry="${z*.7}" fill="${c}"/><path d="M${x-z*.6} ${y}Q${x} ${y-z*.5} ${x+z*.6} ${y}" stroke="#5E3F28" fill="none"/>`,
  stick:(x,y,z,c)=>`<rect x="${x-z*2}" y="${y-z*.35}" width="${z*4}" height="${z*.7}" rx="${z*.35}" fill="${c}" transform="rotate(${r()*180} ${x} ${y})"/>`,
  egg:(x,y,z,c)=>`<path d="M${x-z} ${y}c0-${z*.8} ${z*.4}-${z} ${z}-${z}s${z*1.1} ${z*.3} ${z} ${z}-${z*.5} ${z}-${z} ${z}-${z}-${z*.3}-${z}-${z}z" fill="${c}"/><circle cx="${x}" cy="${y}" r="${z*.42}" fill="#F2B233"/>`,
  flake:(x,y,z,c)=>`<path d="M${x-z} ${y}q${z*.5}-${z} ${z} -${z*.4}q${z*.7}-${z*.3} ${z} ${z*.4}q-${z*.4} ${z*.9}-${z} ${z*.5}q-${z*.8} ${z*.2}-${z}-${z*.5}z" fill="${c}"/>`,
  swirl:(x,y,z,c)=>`<path d="M${cx-z} ${cy}a${z} ${z*.9} 0 1 1 ${z*2} 0a${z*.7} ${z*.6} 0 1 1 -${z*1.4} 0a${z*.4} ${z*.35} 0 1 1 ${z*.8} 0" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" opacity=".55"/>`,
  chunk:(x,y,z,c)=>`<rect x="${x-z/2}" y="${y-z*.3}" width="${z}" height="${z*.6}" rx="${z*.28}" fill="${c}" transform="rotate(${r()*180} ${x} ${y})"/>`,
  noodle:(x,y,z,c)=>`<path d="M${-z} 0q${z*.25}-${z*.5} ${z*.5} 0t${z*.5} 0t${z*.5} 0t${z*.5} 0" transform="translate(${x} ${y}) rotate(${r()*180})" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`,
  pool:(x,y,z,c)=>`<ellipse cx="${cx}" cy="${cy}" rx="${z}" ry="${z*.8}" fill="${c}" opacity=".85"/>`,
  pepper:()=>`<path d="M150 108c-26 6-36 38-28 62s30 36 50 30 30-30 26-56-22-42-48-36z" fill="#D9483B"/><path d="M146 110c6-10 16-14 24-12" stroke="#3F7A2E" stroke-width="7" stroke-linecap="round" fill="none"/><ellipse cx="160" cy="150" rx="20" ry="30" fill="#E6C891" opacity=".9"/>`,
  pepper2:()=>`<path d="M232 118c-22 4-32 32-26 54s26 32 44 28 26-28 22-50-18-36-40-32z" fill="#F2B84B"/><path d="M228 120c5-9 14-12 21-10" stroke="#3F7A2E" stroke-width="7" stroke-linecap="round" fill="none"/><ellipse cx="240" cy="158" rx="17" ry="26" fill="#E6C891" opacity=".9"/>`
 };
 s+=`<rect width="400" height="300" fill="${a.bg}"/>`;
 // linen stripes
 s+=`<g opacity=".18" stroke="#fff" stroke-width="10">${[40,90,140,190,240,290].map(y=>`<path d="M0 ${y}H400"/>`).join('')}</g>`;
 s+=`<ellipse cx="206" cy="160" rx="140" ry="126" fill="rgba(0,0,0,.10)"/>`;
 if(a.pan){s+=`<rect x="320" y="140" width="80" height="22" rx="10" fill="#2B2B2B"/><circle cx="${cx}" cy="${cy}" r="128" fill="#2E2E2E"/><circle cx="${cx}" cy="${cy}" r="112" fill="${a.fill}"/>`}
 else{s+=`<circle cx="${cx}" cy="${cy}" r="130" fill="#FFFFFF"/><circle cx="${cx}" cy="${cy}" r="128" fill="none" stroke="#EDE6DA" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="104" fill="${a.fill}"/>`}
 if(a.center==='fillet')s+=`<g transform="rotate(-18 200 150)"><rect x="140" y="118" width="130" height="64" rx="28" fill="#EE8C62"/><path d="M160 124c8 18 8 38 0 54M185 122c8 20 8 40 0 58M210 122c8 20 8 40 0 58M235 124c7 18 7 36 0 52" stroke="#F8C1A2" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
 if(a.center==='stack')s+=`<ellipse cx="200" cy="186" rx="84" ry="24" fill="#C98F46"/><ellipse cx="200" cy="170" rx="84" ry="24" fill="#E2AA5C"/><ellipse cx="200" cy="154" rx="84" ry="24" fill="#C98F46"/><ellipse cx="200" cy="138" rx="84" ry="24" fill="#E8B76C"/><ellipse cx="200" cy="134" rx="60" ry="15" fill="#F2CD8C" opacity=".85"/><path d="M168 130q32-12 64 0q-6 22-18 14q-14 14-28 0q-12 6-18-14z" fill="#A5601F" opacity=".85"/>`;
 for(const [n,type,c,z] of a.items){for(let i=0;i<n;i++){const [x,y]=a.noScatterCenter&&n>1?pos(40,86):(n===1?[cx,cy]:pos(0,84));s+=(shape[type]||shape.circle)(+x.toFixed(1),+y.toFixed(1),z,c)}}
 const uri='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">${s}</svg>`);
 return artCache[kind]=uri;
}
function tile(label,color){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${color}" opacity=".18"/><text x="20" y="26" text-anchor="middle" font-family="Georgia,serif" font-size="17" font-weight="700" fill="${color}">${esc((label||'?').trim().charAt(0).toUpperCase())}</text></svg>`)}
const SAMPLE_RECIPE_IMAGES={'Lemon Herb Chicken':'lemon-chicken','Tomato & Olive Pasta':'food-pasta','Lentil Soup':'food-lentil-soup'};
const recipeImg=r=>r?.image||(r?.isSample&&PHOTOS[SAMPLE_RECIPE_IMAGES[r.title]])||(r?.art?art(r.art):tile(r?.title,'#1F4A38'));
function mealImg(m){const r=m.recipeId&&state.recipes.find(x=>x.id===m.recipeId);if(r)return recipeImg(r);return tile(m.title,SLOT_COLOR[m.slot]||'#1F4A38')}

/* ---------------- storage: IndexedDB → localStorage → memory ---------------- */
const DATA_FLAG='mediterranean-meal-planner:has-idb-data';
const Store={
 mode:'memory',db:null,revision:0,conflict:false,
 async init(){
  try{
   if(!('indexedDB' in window))throw 0;
   const open=()=>new Promise((res,rej)=>{let settled=false;const fail=e=>{if(settled)return;settled=true;clearTimeout(t);rej(e)};const t=setTimeout(()=>fail(new Error('timeout')),4000);const q=indexedDB.open('mediterranean-meal-planner-planner',1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains('kv'))q.result.createObjectStore('kv')};q.onsuccess=()=>{if(settled){q.result.close();return}settled=true;clearTimeout(t);q.result.onversionchange=()=>{q.result.close();this.conflict=true;if(state){lastSaveOk=false;renderBanners();setSaveState('bad','Reload required')}};res(q.result)};q.onerror=()=>fail(q.error);q.onblocked=()=>fail(new Error('blocked'))});
   try{this.db=await open()}catch(e){await new Promise(r=>setTimeout(r,400));this.db=await open()}
   await this.idbSet('__probe',1);this.mode='idb';return;
  }catch(e){this.db=null}
  let hadIdb=false;try{hadIdb=localStorage.getItem(DATA_FLAG)==='1'}catch(e){}
  if(hadIdb){this.mode='unavailable';return}
  try{localStorage.setItem('__olv_probe','1');localStorage.removeItem('__olv_probe');this.mode='local'}catch(e){this.mode='memory'}
 },
 idbSet(k,v){return new Promise((res,rej)=>{
  const tx=this.db.transaction('kv','readwrite'),store=tx.objectStore('kv');let conflict=false,next=this.revision;
  if(k==='state'){
   const q=store.get(k);q.onsuccess=()=>{if((q.result?._storageRevision||0)!==this.revision){conflict=true;this.conflict=true;tx.abort();return}next=this.revision+1;store.put({...v,_storageRevision:next},k)};
  }else store.put(v,k);
  tx.oncomplete=()=>{if(k==='state'){this.revision=next;try{localStorage.setItem(DATA_FLAG,'1')}catch(e){}}res(true)};
  tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(conflict?new Error('Planner changed in another tab. Reload before saving.'):tx.error||new Error('aborted'));
 })},
 idbGet(k){return new Promise((res,rej)=>{const tx=this.db.transaction('kv','readonly');const q=tx.objectStore('kv').get(k);let v;q.onsuccess=()=>{v=q.result};tx.oncomplete=()=>res(v);tx.onerror=()=>rej(tx.error||q.error);tx.onabort=()=>rej(tx.error||new Error('aborted'))})},
 async get(k){
  if(this.mode==='idb'){const v=await this.idbGet(k);if(v!==undefined){if(k==='state')this.revision=v?._storageRevision||0;return v;}}
  const raw=localStorage.getItem('mediterranean-meal-planner:'+k);if(raw){const value=JSON.parse(raw);if(k==='state'&&this.mode==='local')this.revision=value?._storageRevision||0;return value}
  return undefined;
 },
 async set(k,v){
  if(this.conflict)throw new Error('Reload required before saving');
  if(this.mode==='idb'){await this.idbSet(k,v);return true}
  if(this.mode==='local'){const key='mediterranean-meal-planner:'+k;if(k==='state'){const current=JSON.parse(localStorage.getItem(key)||'null');if((current?._storageRevision||0)!==this.revision){this.conflict=true;throw new Error('Planner changed in another tab')}const next=this.revision+1;localStorage.setItem(key,JSON.stringify({...v,_storageRevision:next}));this.revision=next}else localStorage.setItem(key,JSON.stringify(v));return true}
  return false;
 }
};
async function storageInfo(){
 let used=new Blob([JSON.stringify(state)]).size,quota=null;
 try{if(navigator.storage?.estimate){const e=await navigator.storage.estimate();if(Store.mode==='idb'&&e.usage)used=Math.max(used,e.usage);quota=e.quota}}catch(e){}
 if(Store.mode==='local')quota=5*1024*1024;
 return {used,quota};
}
const fmtBytes=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(1)+' MB';

/* ---------------- images: resize + compress before saving ---------------- */
async function compressImage(file,max=1000,q=.8){
 if(!file)return '';
 if(!/^image\//.test(file.type)&&!/\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name))throw new Error('Please choose an image file.');
 if(file.size>25*1024*1024)throw new Error('That photo is over 25 MB. Please pick a smaller one.');
 const url=URL.createObjectURL(file);
 try{
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('This photo format isn’t supported by your browser. Try a JPG or PNG.'));i.src=url});
  const s=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
  const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*s);c.height=Math.round(img.naturalHeight*s);
  const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
  return c.toDataURL('image/jpeg',q);
 }finally{URL.revokeObjectURL(url)}
}

/* ---------------- state ---------------- */
let state=null;
const COLLECTIONS=['recipes','meals','shopping','pantry','tasks','goals','notes'];
function defaultWeekStart(){try{const l=navigator.language||'';return /^(en-US|en-CA|pt-BR|ja|he|en-PH)/.test(l)?0:1}catch(e){return 1}}
function blankState(){
 return {app:'mediterranean-meal-planner',version:2,createdAt:new Date().toISOString(),
  profile:{name:'',plannerName:'My Mediterranean Planner'},
  settings:{theme:'light',accent:'forest',weekStart:defaultWeekStart(),waterGoal:8,dateFormat:'auto',showCalories:true,backupRemind:true,lastBackup:null,onboarded:false,sampleCleared:false,sampleHintHidden:false},
  recipes:[],meals:[],shopping:[],pantry:[],tasks:[],goals:[],notes:[],water:{},
  ui:{page:'home',weekOffset:0,calMonth:null,calYear:null,recipeFilter:'All',shopFilter:'all',backupSnooze:null}};
}
function sampleState(){
 const s=blankState();const R=(o)=>Object.assign({id:uid(),isSample:true,fav:false,image:''},o);
 s.recipes=[
  R({title:'Lemon Herb Chicken',category:'Dinner',time:30,servings:2,calories:480,art:'stirfry',fav:true,groups:['poultry','veg','oliveoil'],tags:'popular, one pan',
   ingredients:['2 chicken breasts, sliced','1 lemon','2 garlic cloves','1 tsp dried oregano','1 red pepper','1 zucchini','200 g green beans','2 tbsp extra virgin olive oil','150 g bulgur wheat, to serve'],
   method:'Toss the chicken with olive oil, garlic, oregano and lemon zest.\nSear in a large pan for 6 minutes until golden.\nAdd the pepper, zucchini and green beans and cook 5 minutes more.\nSqueeze over the lemon and serve with bulgur.'}),
  R({title:'Mediterranean Bowl',category:'Lunch',time:25,servings:2,calories:510,art:'salad',fav:true,groups:['poultry','grains','veg','oliveoil'],tags:'popular, meal prep',
   ingredients:['150 g quinoa','2 chicken breasts','1 cucumber','200 g cherry tomatoes','handful of olives','60 g feta','1 lemon','2 tbsp extra virgin olive oil'],
   method:'Cook the quinoa and grill the seasoned chicken.\nChop the cucumber and tomatoes.\nBuild the bowls, top with olives and feta, and dress with lemon and olive oil.'}),
  R({title:'Greek Yogurt Pancakes',category:'Breakfast',time:20,servings:2,calories:420,art:'pancakes',fav:true,groups:['grains','fruit','dairy','nuts'],tags:'weekend, popular',
   ingredients:['150 g Greek yogurt','2 eggs','100 g wholemeal flour','1 tsp baking powder','1 tbsp honey','handful of berries','1 tbsp chopped walnuts'],
   method:'Whisk the yogurt and eggs, then fold in the flour and baking powder.\nCook ladlefuls in a pan with a little olive oil, 2 minutes per side.\nServe with berries, walnuts and a drizzle of honey.'}),
  R({title:'Tomato & Olive Pasta',category:'Dinner',time:25,servings:4,calories:540,art:'pasta',fav:true,groups:['grains','veg','oliveoil'],tags:'family, vegetarian',
   ingredients:['320 g wholewheat pasta','400 g cherry tomatoes','handful of Kalamata olives','3 garlic cloves','1 tbsp capers','handful of basil','2 tbsp extra virgin olive oil','50 g parmesan'],
   method:'Cook the pasta until al dente.\nSoften the garlic in olive oil, add the tomatoes and cook until they burst.\nStir in the olives and capers, then toss through the pasta with basil.\nFinish with parmesan.'}),
  R({title:'Grilled Chicken Bowl',category:'Lunch',time:30,servings:2,calories:520,art:'chickensalad',groups:['poultry','grains','veg','oliveoil'],tags:'high protein, meal prep',
   ingredients:['2 chicken breasts','150 g quinoa','1 avocado','200 g cherry tomatoes','handful of spinach','1 lemon','2 tbsp extra virgin olive oil','1 tsp sesame seeds'],
   method:'Cook the quinoa according to the pack.\nGrill the seasoned chicken for 6 minutes per side, rest, then slice.\nBuild the bowls with quinoa, spinach, tomatoes and avocado, top with the chicken.\nDress with lemon and olive oil, finish with sesame seeds.'}),
  R({title:'Veggie Pasta',category:'Dinner',time:25,servings:4,calories:520,art:'pasta',groups:['grains','veg','oliveoil'],tags:'family, vegetarian',
   ingredients:['320 g wholewheat pasta','250 g cherry tomatoes','1 zucchini','1 red pepper','2 garlic cloves','handful of basil','2 tbsp extra virgin olive oil','parmesan, to serve'],
   method:'Cook the pasta until al dente.\nSoften the garlic, zucchini and pepper in olive oil, add the tomatoes and cook until they burst.\nToss through the pasta with basil and parmesan.'}),
  R({title:'Salmon & Quinoa',category:'Dinner',time:25,servings:2,calories:560,art:'salmon',groups:['fish','grains','veg','oliveoil'],tags:'high protein, 30 minutes',
   ingredients:['2 salmon fillets','150 g quinoa','200 g asparagus','150 g cherry tomatoes','1 lemon','2 garlic cloves','small bunch of dill','1 tbsp extra virgin olive oil'],
   method:'Heat the oven to 200°C / 400°F.\nPlace the salmon on a tray with the asparagus and tomatoes, rub with olive oil, garlic, lemon zest and dill.\nRoast 12–15 minutes while the quinoa cooks.\nServe with lemon wedges.'}),
  R({title:'Mediterranean Wrap',category:'Lunch',time:20,servings:2,calories:420,art:'salad',groups:['grains','veg','dairy','oliveoil'],tags:'quick, vegetarian',
   ingredients:['2 wholemeal wraps','100 g hummus','1 cucumber','2 tomatoes','60 g feta','handful of olives','handful of spinach'],
   method:'Spread hummus over the wraps.\nLayer the vegetables, feta and olives.\nRoll tightly and slice in half.'}),
  R({title:'Lentil Soup',category:'Dinner',time:35,servings:4,calories:380,art:'lentil',groups:['legumes','veg','oliveoil'],tags:'batch cook, freezer friendly',
   ingredients:['250 g red lentils','1 onion','2 carrots','2 garlic cloves','1 tsp cumin','1 litre vegetable stock','1 lemon','2 tbsp extra virgin olive oil','parsley, to serve'],
   method:'Soften the onion and carrot in olive oil for 6–8 minutes.\nStir in the garlic and cumin, then add the lentils and stock.\nSimmer 20 minutes until the lentils collapse.\nSqueeze in the lemon, season, and top with parsley.'}),
  R({title:'Overnight Oats',category:'Breakfast',time:10,servings:1,calories:410,art:'oats',groups:['grains','fruit','nuts','dairy'],tags:'make ahead',
   ingredients:['50 g rolled oats','120 g Greek yogurt','80 ml milk','handful of mixed berries','1 tbsp chopped walnuts','1 tsp honey','pinch of cinnamon'],
   method:'Stir the oats, yogurt, milk and cinnamon together in a jar.\nCover and refrigerate overnight.\nTop with berries, walnuts and honey in the morning.'}),
  R({title:'Grilled Chicken Salad',category:'Lunch',time:20,servings:2,calories:420,art:'chickensalad',groups:['poultry','veg','oliveoil'],tags:'high protein, quick',
   ingredients:['2 grilled chicken breasts','100 g spinach','150 g cherry tomatoes','1 cucumber','1/2 red onion','1 lemon','2 tbsp extra virgin olive oil'],
   method:'Slice the chicken and combine with the spinach, tomatoes, cucumber and onion.\nWhisk the olive oil and lemon juice, toss through and season.'}),
  R({title:'Greek Yogurt & Berries',category:'Snack',time:5,servings:1,calories:180,art:'oats',groups:['dairy','fruit','nuts'],tags:'snack, no-cook',
   ingredients:['200 g Greek yogurt','handful of mixed berries','1 tsp honey','1 tbsp chopped walnuts'],
   method:'Spoon the yogurt into a bowl.\nTop with the berries, walnuts and honey.'}),
  R({title:'Shakshuka',category:'Breakfast',time:25,servings:2,calories:390,art:'shakshuka',groups:['poultry','veg','oliveoil'],tags:'weekend, one pan',
   ingredients:['4 eggs','400 g canned tomatoes','1 red pepper','1 onion','2 garlic cloves','1 tsp cumin','1 tsp paprika','handful of parsley','1 tbsp extra virgin olive oil'],
   method:'Soften the onion and pepper in olive oil for 6 minutes.\nAdd the garlic and spices, then the tomatoes, and simmer 8 minutes.\nMake four wells, crack in the eggs, cover and cook 5–7 minutes.\nScatter with parsley and serve with bread.'}),
  R({title:'Tuna & White Bean Salad',category:'Lunch',time:15,servings:2,calories:450,art:'tuna',fav:true,groups:['fish','legumes','veg','oliveoil'],tags:'no-cook, high protein',
   ingredients:['2 cans tuna in olive oil','400 g canned cannellini beans','1/2 red onion','150 g cherry tomatoes','handful of parsley','1 lemon','1 tbsp extra virgin olive oil'],
   method:'Drain the beans and tuna.\nToss with the sliced onion, tomatoes and parsley.\nDress with lemon and olive oil, then season.'}),
  R({title:'Stuffed Peppers',category:'Dinner',time:45,servings:4,calories:470,art:'peppers',groups:['grains','legumes','veg','dairy','oliveoil'],tags:'vegetarian, batch cook',
   ingredients:['4 large peppers','150 g bulgur wheat','400 g canned chickpeas','200 g canned tomatoes','1 onion','1 tsp smoked paprika','60 g feta','2 tbsp extra virgin olive oil'],
   method:'Heat the oven to 190°C / 375°F.\nCook the bulgur, then mix with the chickpeas, tomatoes, softened onion and paprika.\nHalve the peppers, fill them, drizzle with olive oil and bake 30 minutes.\nCrumble over the feta to serve.'}),
  R({title:'Hummus & Veggie Sticks',category:'Snack',time:10,servings:2,calories:220,art:'hummus',groups:['legumes','veg','oliveoil'],tags:'snack, no-cook',
   ingredients:['150 g hummus','2 carrots','1 cucumber','1 red pepper','pinch of paprika','1 tsp extra virgin olive oil'],
   method:'Cut the vegetables into sticks.\nSpoon the hummus into a bowl, drizzle with olive oil and dust with paprika.'})
 ];
 const rb=t=>s.recipes.find(r=>r.title===t);
 const ws=weekStartOf(today(),s.settings.weekStart),t=today(),ti=(parse(t).getDay()-s.settings.weekStart+7)%7;
 const MENU={Breakfast:['Overnight Oats','Shakshuka','Greek Yogurt Pancakes','Overnight Oats','Shakshuka','Greek Yogurt Pancakes','Overnight Oats'],
  Lunch:['Grilled Chicken Bowl','Mediterranean Wrap','Tuna & White Bean Salad','Grilled Chicken Salad','Mediterranean Bowl','Mediterranean Wrap','Tuna & White Bean Salad'],
  Dinner:['Veggie Pasta','Salmon & Quinoa','Lentil Soup','Lemon Herb Chicken','Stuffed Peppers','Salmon & Quinoa','Tomato & Olive Pasta'],
  Snack:['Hummus & Veggie Sticks','Greek Yogurt & Berries','Hummus & Veggie Sticks','Greek Yogurt & Berries','Hummus & Veggie Sticks','Greek Yogurt & Berries','Hummus & Veggie Sticks']};
 const meal=(date,slot,title,status)=>{const r=rb(title);return {id:uid(),date,slot,title,recipeId:r.id,calories:r.calories,groups:[...r.groups],status,notes:'',isSample:true}};
 let seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
 s.meals=[];
 const has=(slot,d)=>slot==='Dinner'||d===ti||(slot==='Lunch'&&d!==6)||(slot==='Breakfast'&&[1,3,5].includes(d))||(slot==='Snack'&&[2,4].includes(d));
 for(let d=0;d<7;d++)SLOTS.forEach(slot=>{if(!has(slot,d)||(d===ti&&slot==='Snack'))return;const st=d<ti?((slot==='Lunch'&&d===ti-1)||slot==='Snack'?'Planned':'Eaten'):(d===ti&&slot==='Breakfast'?'Eaten':'Planned');s.meals.push(meal(addDays(ws,d),slot,MENU[slot][d],st))});
 ['Lentil Soup','Lemon Herb Chicken','Stuffed Peppers','Tomato & Olive Pasta'].forEach((x,i)=>s.meals.push(meal(addDays(ws,7+i*2),'Dinner',x,'Planned')));
 for(let w=1;w<=26;w++){const n=Math.min(12,Math.max(4,Math.round(11-w*.25+rnd()*2)));for(let i=0;i<n;i++){const slot=i<7?'Dinner':'Lunch',d=i<7?i:(i-7)*2%7;s.meals.push(meal(addDays(ws,d-7*w),slot,MENU[slot][(d+w)%7],rnd()<.82?'Eaten':'Planned'))}}
 const shop=[['Salmon fillets','2'],['Quinoa','500 g'],['Asparagus','1 bunch'],['Cherry tomatoes','2 boxes'],['Greek yogurt','1 large tub'],['Baby spinach','1 bag'],['Lemons','4'],['Garlic','1 bulb'],['Chicken breast','500 g'],['Feta','200 g'],['Canned chickpeas','2 cans'],['Tuna in olive oil','2 cans'],['Red peppers','4'],['Fresh dill','1 bunch'],['Wholemeal wraps','1 pack'],['Walnuts','150 g']];
 s.shopping=shop.map(([n,q],i)=>({id:uid(),name:n,qty:q,aisle:guessAisle(n),done:[1,4,7,9,12].includes(i),isSample:true}));
 s.pantry=[['Extra virgin olive oil','Oils & Condiments','1 L',9],['Brown rice','Bakery & Grains','1 kg',60],['Wholewheat pasta','Bakery & Grains','500 g',45],['Red lentils','Legumes & Canned','750 g',120],['Canned chickpeas','Legumes & Canned','3 cans',200],['Tomatoes','Produce','6',4],['Feta','Dairy & Eggs','200 g',6],['Eggs','Dairy & Eggs','6',12],['Almonds','Nuts & Seeds','200 g',90]]
  .map(([n,a,q,d])=>({id:uid(),name:n,aisle:a,qty:q,expiry:addDays(t,d),isSample:true}));
 s.tasks=[['Marinate chicken for the bowls',t,'High','Open'],['Wash and chop salad vegetables',t,'Medium','Done'],['Batch-cook lentil soup',addDays(t,1),'Medium','Open'],['Soak chickpeas for hummus',addDays(t,1),'Low','Open'],['Roast a tray of peppers for wraps',addDays(t,2),'Medium','Open'],['Plan next week’s dinners',addDays(t,3),'Low','Open'],['Portion walnuts into snack jars',addDays(t,-1),'Low','Done']]
  .map(([title,date,priority,status])=>({id:uid(),title,date,priority,status,isSample:true}));
 s.goals=[{title:'Fish twice a week',description:'Salmon, sardines, tuna — fresh or canned all count.',progress:65,deadline:addDays(t,28)},{title:'Cook at home 5 nights a week',description:'Keep two easy fallback meals in the pantry.',progress:80,deadline:addDays(t,21)},{title:'Try one new recipe every week',description:'Explore a new vegetable, grain or legume each week.',progress:40,deadline:addDays(t,60)},{title:'Plant-forward lunches',description:'Beans, lentils or chickpeas in most weekday lunches.',progress:35,deadline:addDays(t,45)}]
  .map(g=>({id:uid(),status:'Active',isSample:true,...g}));
 s.notes=[{title:'Pantry staples to keep stocked',text:'Extra virgin olive oil\nCanned chickpeas & lentils\nCanned tomatoes\nWholegrain pasta & bulgur\nNuts and dried oregano',pinned:true,date:t},{title:'Sunday prep idea',text:'Roast a tray of peppers, zucchini and onion. Cook a pot of bulgur. Use them in salads, bowls and wraps through the week.',pinned:false,date:addDays(t,-2)},{title:'Family favourites',text:'Salmon & Quinoa was a hit — double the batch next time.',pinned:false,date:addDays(t,-5)},{title:'Shakshuka tweak',text:'Add a spoon of harissa and crumble feta on top. Ready in 25 minutes.',pinned:false,date:addDays(t,-9)},{title:'Quick lunch formula',text:'Grain + beans + chopped veg + lemon and olive oil. Works every time.',pinned:false,date:addDays(t,-14)}]
  .map(n=>({id:uid(),isSample:true,...n}));
 for(let i=1;i<=13;i++)s.water[addDays(t,-i)]=[6,7,5,7,6,4,7,5,6,7,6,5,7][i-1];s.water[t]=5;
 return s;
}
const ID_RE=/^[A-Za-z0-9_-]{1,64}$/,DATE_RE=/^\d{4}-\d{2}-\d{2}$/,IMG_RE=/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const RECIPE_CATS=['Breakfast','Lunch','Dinner','Snack','Dessert','Side'];
const isDate=v=>typeof v==='string'&&DATE_RE.test(v)&&ymd(parse(v))===v;
const str=(v,max=500)=>v==null?'':String(v).slice(0,max);
const numOr=(v,min,max)=>{if(v===''||v==null)return '';const n=+v;return Number.isFinite(n)?Math.min(max,Math.max(min,n)):''};
const oneOf=(v,list,d)=>list.includes(v)?v:d;
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const arr=v=>Array.isArray(v)?v:[];
const groupsOf=v=>[...new Set(arr(v).filter(k=>Object.hasOwnProperty.call(G,k)))];
/* Every record that enters state passes through here: ids, enums, dates and image data are whitelisted, so a crafted backup cannot inject markup or break views. */
function normalize(x){
 if(!x||typeof x!=='object'||Array.isArray(x))throw new Error('This file isn’t a Mediterranean Meal Planner backup.');
 const b=blankState(),P=obj(x.profile),S=obj(x.settings),U=obj(x.ui),seen=new Set(),idMap=Object.create(null);
 const cid=(v,map)=>{let id=typeof v==='string'&&ID_RE.test(v)&&!seen.has(v)?v:uid();while(seen.has(id))id=uid();seen.add(id);if(map&&typeof v==='string')map[v]=id;return id};
 const o=b;
 o.createdAt=typeof x.createdAt==='string'&&!isNaN(Date.parse(x.createdAt))?x.createdAt:b.createdAt;
 o.profile={name:str(P.name,60),plannerName:str(P.plannerName,80)||b.profile.plannerName};
 o.settings={theme:oneOf(S.theme,['system','light','dark'],b.settings.theme),accent:oneOf(S.accent,Object.keys(ACCENTS),'forest'),weekStart:oneOf(S.weekStart,[0,1,6],b.settings.weekStart),
  waterGoal:Math.round(numOr(S.waterGoal,1,30)||8),dateFormat:oneOf(S.dateFormat,['auto','DMY','MDY','YMD'],'auto'),showCalories:S.showCalories!==false,backupRemind:S.backupRemind!==false,
  lastBackup:typeof S.lastBackup==='string'&&!isNaN(Date.parse(S.lastBackup))?S.lastBackup:null,onboarded:!!S.onboarded,sampleCleared:!!S.sampleCleared,sampleHintHidden:!!S.sampleHintHidden};
 o.ui={page:oneOf(U.page,PAGES.map(p=>p[0]),'home'),weekOffset:Math.round(numOr(U.weekOffset,-520,520)||0),calMonth:Number.isInteger(U.calMonth)&&U.calMonth>=0&&U.calMonth<12?U.calMonth:null,
  calYear:Number.isInteger(U.calYear)&&U.calYear>1900&&U.calYear<3000?U.calYear:null,recipeFilter:oneOf(U.recipeFilter,['All','Favourites',...RECIPE_CATS],'All'),
  shopFilter:oneOf(U.shopFilter,['open','done','all'],'all'),backupSnooze:isDate(U.backupSnooze)?U.backupSnooze:null};
 o.recipes=arr(x.recipes).filter(r=>r&&typeof r==='object').map(r=>({id:cid(r.id,idMap),title:str(r.title,160).trim()||'Recipe',category:oneOf(r.category,RECIPE_CATS,'Dinner'),
  time:numOr(r.time===''?'':parseInt(r.time),0,1440),servings:numOr(r.servings===''?'':parseInt(r.servings),1,100),calories:numOr(r.calories,0,10000),groups:groupsOf(r.groups),
  tags:str(r.tags,300),ingredients:(Array.isArray(r.ingredients)?r.ingredients:String(r.ingredients||'').split('\n')).map(v=>str(v,300).trim()).filter(Boolean).slice(0,200),
  method:str(r.method,20000),image:typeof r.image==='string'&&r.image.length<4e6&&IMG_RE.test(r.image)?r.image:'',art:typeof r.art==='string'&&Object.hasOwnProperty.call(ART,r.art)?r.art:null,fav:!!r.fav,isSample:!!r.isSample}));
 o.meals=arr(x.meals).filter(m=>m&&typeof m==='object'&&isDate(m.date)).map(m=>({id:cid(m.id),date:m.date,slot:oneOf(m.slot,SLOTS,'Dinner'),title:str(m.title,160).trim()||'Meal',
  recipeId:typeof m.recipeId==='string'&&idMap[m.recipeId]?idMap[m.recipeId]:null,calories:numOr(m.calories,0,10000),groups:groupsOf(m.groups),status:m.status==='Eaten'?'Eaten':'Planned',notes:str(m.notes,2000),isSample:!!m.isSample}));
 o.shopping=arr(x.shopping).filter(i=>i&&typeof i==='object'&&str(i.name).trim()).map(i=>({id:cid(i.id),name:str(i.name,160).trim(),qty:str(i.qty,60),aisle:AISLES.includes(i.aisle)?i.aisle:guessAisle(str(i.name)),done:!!i.done,isSample:!!i.isSample}));
 o.pantry=arr(x.pantry).filter(i=>i&&typeof i==='object'&&str(i.name).trim()).map(i=>({id:cid(i.id),name:str(i.name,160).trim(),qty:str(i.qty,60),aisle:AISLES.includes(i.aisle)?i.aisle:guessAisle(str(i.name)),expiry:isDate(i.expiry)?i.expiry:'',isSample:!!i.isSample}));
 o.tasks=arr(x.tasks).filter(t=>t&&typeof t==='object').map(t=>({id:cid(t.id),title:str(t.title,200).trim()||'Task',date:isDate(t.date)?t.date:'',priority:oneOf(t.priority,['High','Medium','Low'],'Medium'),status:t.status==='Done'?'Done':'Open',isSample:!!t.isSample}));
 o.goals=arr(x.goals).filter(g=>g&&typeof g==='object').map(g=>({id:cid(g.id),title:str(g.title,160).trim()||'Goal',description:str(g.description,1000),progress:Math.round(numOr(g.progress,0,100)||0),deadline:isDate(g.deadline)?g.deadline:'',status:'Active',isSample:!!g.isSample}));
 o.notes=arr(x.notes).filter(n=>n&&typeof n==='object').map(n=>({id:cid(n.id),title:str(n.title,160).trim()||'Note',text:str(n.text,20000),pinned:!!n.pinned,date:isDate(n.date)?n.date:today(),isSample:!!n.isSample}));
 o.water={};for(const [k,v] of Object.entries(obj(x.water)))if(isDate(k)){const n=Math.round(numOr(v,0,40)||0);if(n)o.water[k]=n}
 o.version=2;o.app='mediterranean-meal-planner';
 return o;
}
/* Accepts Mediterranean Meal Planner backups and the earlier single-file planner format (v1) */
function migrate(x){
 if(x&&x.app==='mediterranean-meal-planner'&&'state' in x)return normalize(x.state);
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
let saveTimer=null,lastSaveOk=true,persistAsked=false,snapshot=null,saveQueue=Promise.resolve(),savingCount=0;
function setSaveState(kind,text){const el=$('#saveState');if(!el)return;el.className='save-state '+(kind||'');el.querySelector('span').textContent=text}
async function flush(){
 clearTimeout(saveTimer);saveTimer=null;
 if(DEMO){setSaveState('','Live demo · not saved');return true}
 try{
  const payload=JSON.parse(JSON.stringify(state));
  savingCount++;const pending=saveQueue.then(()=>Store.set('state',payload));saveQueue=pending.catch(()=>{});let ok;try{ok=await pending}finally{savingCount--}
  if(!ok){setSaveState('bad','Not saving — see banner');renderBanners();return false}
  if(!lastSaveOk){lastSaveOk=true;renderBanners()}setSaveState('','Saved in this browser');
  if(!persistAsked&&userCount()>0&&navigator.storage?.persist){persistAsked=true;try{await navigator.storage.persist()}catch(e){}}
  return true;
 }catch(e){
  lastSaveOk=false;setSaveState('bad','Couldn’t save');renderBanners();
  toast(/quota/i.test(String(e?.name||e))?'Your browser storage is full. Remove a few photos, then export a backup.':'Couldn’t save your last change. Export a backup from Settings.','err');
  return false;
 }
}
function save(){if(DEMO){setSaveState('','Live demo · not saved');return}setSaveState('warn','Saving…');clearTimeout(saveTimer);saveTimer=setTimeout(flush,250)}
window.addEventListener('beforeunload',e=>{if(!DEMO&&!Store.temporary&&Store.mode!=='memory'&&(saveTimer||savingCount||!lastSaveOk)){e.preventDefault();e.returnValue=''}});
window.addEventListener('pagehide',()=>{if(saveTimer)flush()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&saveTimer)flush()});
function commit(){save();refresh()}
function takeSnapshot(){snapshot=JSON.parse(JSON.stringify(state))}
function undoChanges(before,after,current){
 if(JSON.stringify(before)===JSON.stringify(after))return current;
 if(JSON.stringify(current)===JSON.stringify(after))return before;
 if(Array.isArray(before)&&Array.isArray(after)&&Array.isArray(current)){
  const old=new Map(before.map(x=>[x.id,x])),changed=new Map(after.map(x=>[x.id,x]));
  const result=current.flatMap(item=>{const id=item.id;if(!old.has(id)&&changed.has(id)&&JSON.stringify(item)===JSON.stringify(changed.get(id)))return [];return [old.has(id)&&changed.has(id)?undoChanges(old.get(id),changed.get(id),item):item]});
  before.forEach((item,i)=>{if(!changed.has(item.id)&&!result.some(x=>x.id===item.id))result.splice(Math.min(i,result.length),0,item)});return result;
 }
 if(before&&after&&current&&typeof before==='object'&&typeof after==='object'&&typeof current==='object'&&!Array.isArray(before)){
  const result={...current};for(const key of new Set([...Object.keys(before),...Object.keys(after)])){const value=undoChanges(before[key],after[key],current[key]);if(value===undefined)delete result[key];else result[key]=value}return result;
 }
 return current;
}
function restoreSnapshot(){if(!snapshot)return;state=snapshot;snapshot=null;applyTheme();commit();toast('Restored')}

/* ---------------- toasts ---------------- */
function toast(msg,type='',undo){
 const el=document.createElement('div');el.className='toast '+(type==='err'?'err':'');el.setAttribute('role',type==='err'?'alert':'status');
 const sp=document.createElement('span');sp.textContent=msg;el.appendChild(sp);
 if(undo){if(undo===restoreSnapshot){const captured=snapshot,after=JSON.parse(JSON.stringify(state));undo=()=>{if(!captured)return;state=undoChanges(captured,after,state);snapshot=null;applyTheme();commit();toast('Restored')}}const b=document.createElement('button');b.textContent='Undo';b.onclick=()=>{undo();el.remove()};el.appendChild(b)}
 $('#toasts').appendChild(el);setTimeout(()=>el.remove(),undo?6500:3800);
}

/* ---------------- modal ---------------- */
let modalReturnFocus=null,modalOnClose=null;
function openModal({title,body,buttons=[],size='',left=null,onClose=null}){
 const m=$('#modal');delete m.dataset.busy;modalReturnFocus=document.activeElement;modalOnClose=onClose;
 m.className='modal '+size;
 m.innerHTML=`<div class="m-h"><h2 id="mTitle">${title}</h2><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div><div class="m-b">${body}</div>${buttons.length||left?`<div class="m-f">${left?`<div class="left">${left}</div>`:''}${buttons.map((b,i)=>`<button class="btn ${b.cls||''}" data-mb="${i}">${b.label}</button>`).join('')}</div>`:''}`;
 buttons.forEach((b,i)=>m.querySelector(`[data-mb="${i}"]`).onclick=async e=>{if(m.dataset.busy==='true')return;m.dataset.busy='true';const button=e.currentTarget;button.disabled=true;try{if(b.onClick&&button.classList.contains('primary')&&![...m.querySelectorAll('input[type=number],input[type=date]')].every(input=>input.reportValidity()))return;const r=await b.onClick?.(m);if(r!==false)closeModal()}catch(err){toast(err?.message||'Couldn’t complete this action. Please try again.','err')}finally{delete m.dataset.busy;button.disabled=false}});
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
 ['home','dash','Overview'],['today','sun','Today'],['week','caldays','Week Plan'],['recipes','chef','Recipes'],['shopping','bag','Shopping'],['pantry','jar2','Pantry'],
 ['balance','pie','Balance'],['prep','clip','Prep List'],['goals','target','Goals & Water'],['calendar','calcheck','Calendar'],['journal','notebook','Journal'],['settings','gear','Settings']
];
const NAV_GROUPS=[['Plan',['home','today','week','calendar']],['Kitchen',['recipes','shopping','pantry','prep']],['Wellbeing',['balance','goals','journal']],['',['settings']]];
function renderNav(){
 const cnt={shopping:state.shopping.filter(x=>!x.done).length,prep:state.tasks.filter(t=>t.status!=='Done').length};
 updateHTML($('#nav'),NAV_GROUPS.map(([label,ids])=>`${label?`<div class="nav-label">${label}</div>`:'<div style="height:10px"></div>'}${ids.map(id=>{const p=PAGES.find(x=>x[0]===id);return `<button data-go="${id}" class="${state.ui.page===id?'active':''}" ${state.ui.page===id?'aria-current="page"':''}>${ic(p[1])}<span>${p[2]}</span>${cnt[id]?`<span class="count">${cnt[id]}</span>`:''}</button>`}).join('')}`).join(''));
 const profile=state.profile.name.trim();
 $('#topProfileName').textContent=profile||'Profile';
 $('#topProfileInitial').textContent=Array.from(profile)[0]?.toUpperCase()||'M';
 const sample=state.ui.page==='home';
 $('#search').placeholder=sample?'Search anything…':'Search planner…';
 const due=state.tasks.filter(x=>x.status!=='Done'&&x.date&&x.date<=today()).length;
 updateHTML($('#bellBtn'),ic('bell')+(due?`<i class="bdg">${due>9?'9+':due}</i>`:''));
 const bn=[['home','home','Home'],['week','week','Week'],['recipes','chef','Recipes'],['shopping','bag','Shop'],['more','more','More']];
 updateHTML($('#bottomNav'),bn.map(([id,icn,l])=>`<button ${id==='more'?'data-action="menu"':`data-go="${id}"`} class="${state.ui.page===id?'active':''}"${state.ui.page===id?' aria-current="page"':''}>${ic(icn)}<span>${l}</span></button>`).join(''));
}
function go(page,{push=true,persist=true}={}){
 if(!PAGES.some(p=>p[0]===page))page='home';
 state.ui.page=page;
 $$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));
 closeSidebar();renderPage(page);renderNav();renderBanners();
 if(push&&location.hash!=='#/'+page){try{history.pushState(null,'','#/'+page)}catch(e){location.hash='#/'+page}}
 document.title=`${PAGES.find(p=>p[0]===page)[2]} · Mediterranean Meal Planner`;
 window.scrollTo(0,0);if(persist)save();
}
window.addEventListener('popstate',()=>{const p=(location.hash.match(/^#\/(\w+)/)||[])[1];if(state&&p&&p!=='reference'&&p!=='planner'&&p!==state.ui.page)go(p,{push:false})});
function refresh(){renderPage(state.ui.page);renderNav();renderBanners()}
function openSidebar(){$('#sidebar').classList.add('open');$('#scrim').classList.add('open')}
function closeSidebar(){$('#sidebar').classList.remove('open');$('#scrim').classList.remove('open')}
$('#scrim').onclick=closeSidebar;

/* ---------------- theme ---------------- */
const mq=matchMedia('(prefers-color-scheme: dark)');
function applyTheme(){
 const t=state.settings.theme;try{localStorage.setItem(APP.key+':appearance',JSON.stringify({theme:t,accent:state.settings.accent}))}catch(e){}const dark=t==='dark'||(t==='system'&&mq.matches);
 document.documentElement.dataset.theme=dark?'dark':'light';
 const a=ACCENTS[state.settings.accent]||ACCENTS.forest;
 document.documentElement.style.setProperty('--primary',a[0]);document.documentElement.style.setProperty('--primary-deep',a[1]);
 $('meta[name=theme-color]')?.setAttribute('content',dark?'#211d17':'#f5ecdf');
 updateHTML($('#themeBtn'),ic(dark?'sun':'moon'));
}
mq.addEventListener?.('change',()=>{if(state?.settings.theme==='system'){applyTheme();refresh()}});

/* ---------------- banners ---------------- */
function renderBanners(){
 const b=[];const t=today();
 if(DEMO){updateHTML($('#banners'),'');return}
 if(Store.conflict)b.push(`<div class="banner warn" role="alert"><div class="grow"><b>Reload before saving</b>Another tab or app update changed storage. Export this tab’s changes before reloading.</div><button class="btn sm" data-action="exportBackup">Export backup</button><button class="btn sm primary" data-action="reload">Reload</button></div>`);
 else if(Store.temporary)b.push(`<div class="banner warn"><div class="ic">${ic('alert')}</div><div class="grow"><b>Temporary planner — nothing is being saved</b>Your saved plans couldn’t be opened just now and are untouched. Reload the page to try again.</div><button class="btn sm primary" data-action="reload">Reload</button></div>`);
 else if(Store.mode==='memory')b.push(`<div class="banner warn"><div class="ic">${ic('alert')}</div><div class="grow"><b>This browser can’t save your planner</b>Changes will be lost when you close this tab. Open the file in Chrome, Safari, Edge or Firefox — not a file preview — or use your online link.</div></div>`);
 else if(!lastSaveOk)b.push(`<div class="banner warn"><div class="ic">${ic('alert')}</div><div class="grow"><b>Your last change wasn’t saved</b>Storage may be full. Export a backup now, then remove a few large photos.</div><button class="btn sm primary" data-action="exportBackup">Export backup</button></div>`);
 if(Store.mode==='local')b.push(`<div class="banner warn"><div class="grow"><b>Using backup browser storage</b>Storage is limited and may not persist. Export backups regularly.</div></div>`);
 const lb=state.settings.lastBackup,uc=userCount();
 const due=state.settings.backupRemind&&uc>=5&&(!lb||(Date.now()-new Date(lb).getTime())>7*864e5)&&(!state.ui.backupSnooze||state.ui.backupSnooze<=t);
 if(due&&['home','settings','week'].includes(state.ui.page))b.push(`<div class="banner"><div class="ic">${ic('shield')}</div><div class="grow"><b>Time for a quick backup</b>${lb?'Your last backup was '+fmtDate(ymd(new Date(lb)))+'.':'You haven’t backed up yet.'} Save a copy so you never lose your plans.</div><button class="btn sm ghost" data-action="snoozeBackup">Later</button><button class="btn sm primary" data-action="exportBackup">${ic('down')}Back up</button></div>`);
 if(hasSamples()&&!state.settings.sampleHintHidden&&state.ui.page==='home')b.push(`<div class="banner sample"><div class="ic">${ic('spark')}</div><div class="grow"><b>You’re looking at a sample week</b>Explore how everything works, then clear the examples and make it yours.</div><button class="btn sm" data-action="clearSamples">Clear sample data</button><button class="btn sm icon ghost banner-x" data-action="hideSampleHint" aria-label="Dismiss sample week message" title="Dismiss">${ic('x')}</button></div>`);
 updateHTML($('#banners'),b.join(''));
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
 if(document.documentElement.classList.contains('reference-mode'))return;
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
const PANTRY_IC=n=>/oil|vinegar/i.test(n)?'bottle':/egg/i.test(n)?'egg':/tomato|pepper|spinach|garlic|onion|lemon|cucumber/i.test(n)?'tomato':/rice|pasta|oats|bulgur|bread|flour|couscous/i.test(n)?'bowl':/yogh?urt|milk|feta|cheese/i.test(n)?'drop':'jar';
const PANTRY_ART=[
 [/\bolive oil\b/i,'oil'],[/\bolives?\b/i,'olives'],[/\btomato(?:es)?\b/i,'tomato'],
 [/\bcucumbers?\b/i,'cucumber'],[/\bchickpeas?\b/i,'chickpeas'],[/\blentils?\b/i,'lentils'],
 [/\bgarlic\b/i,'garlic'],[/\bonions?\b/i,'onion'],[/\blemons?\b/i,'lemon'],
 [/\bfeta\b/i,'feta'],[/\byogh?urt\b/i,'yogurt'],[/\bbread\b/i,'bread'],
 [/\b(?:eggplants?|aubergines?)\b/i,'eggplant'],[/\b(?:bell )?peppers?\b/i,'pepper'],[/\bhummus\b/i,'hummus'],[/\b(?:fish|salmon|sardines?|tuna|cod)\b/i,'fish'],
 [/\balmonds?\b/i,'almonds'],[/\bwalnuts?\b/i,'walnuts'],[/\bnuts?\b/i,'nuts'],[/\b(?:pasta|spaghetti|penne)\b/i,'pasta'],[/\bbasil\b/i,'basil'],[/\brosemary\b/i,'rosemary'],
 [/\b(?:herbs?|parsley|oregano)\b/i,'herbs'],
 [/\b(?:rice|quinoa|bulgur|grains?)\b/i,'grains'],
];
function pantryIcon(name){
 const match=PANTRY_ART.find(([pattern])=>pattern.test(name));
 const src=match&&(PHOTOS['icon-'+match[1]]||PHOTOS['food-'+match[1]]);
 return src?`<img class="pantry-food" src="${src}" alt="">`:`<span class="pi" aria-hidden="true">${ic(PANTRY_IC(name))}</span>`;
}
function ring(p,val,label,col){
 const C=163.4;p=Math.max(0,Math.min(1,p||0));
 return `<div class="rg"><div class="rg-dial"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="rg-bg" cx="32" cy="32" r="26"/><circle class="rg-fg" cx="32" cy="32" r="26" style="stroke:${col};stroke-dashoffset:${(C*(1-p)).toFixed(1)};opacity:${p===0?0:1}"/></svg><b>${val}</b></div><span>${label}</span></div>`;
}
function dayCard(d,t){
 const ms=mealsOn(d),pick=['Dinner','Lunch','Breakfast','Snack'].map(s=>ms.find(m=>m.slot===s&&m.recipeId)).find(Boolean)||ms.find(m=>m.slot==='Dinner')||ms[0];
 const isT=d===t,r=pick&&pick.recipeId&&state.recipes.find(x=>x.id===pick.recipeId);
 const head=`<span class="dc-h"><b>${esc(fmtDate(d,'weekday'))}</b><span>${parse(d).getDate()}</span>${isT?'<em>Today</em>':''}</span>`;
 if(!pick)return `<button class="dcard empty ${isT?'today':''}" data-add-meal="${d}|Dinner">${head}<span class="dc-add">${ic('plus')}<small>Plan a meal</small></span></button>`;
 return `<button class="dcard ${isT?'today':''}" data-day="${d}">${head}<img src="${mealImg(pick)}" alt=""><span class="dc-t">${esc(pick.title)}</span><span class="dc-m">${pick.slot}${r&&+r.time?` • ${+r.time} min`:''}</span><span class="dc-v">View ${ic('arrow')}</span></button>`;
}
function planCard(slot,t){
 const m=mealsOn(t).find(x=>x.slot===slot),r=m&&m.recipeId&&state.recipes.find(x=>x.id===m.recipeId);
 if(!m)return `<button class="pcard empty" data-add-meal="${t}|${slot}"><span class="pc-slot"><i style="background:${SLOT_COLOR[slot]}"></i>${slot}</span><span class="pc-add">${ic('plus')}<small>Add ${slot.toLowerCase()}</small></span></button>`;
 const meta=[r&&+r.time?`${+r.time} min`:'',state.settings.showCalories&&m.calories?`${Math.round(m.calories)} kcal`:''].filter(Boolean).join(' • ');
 return `<button class="pcard ${m.status==='Eaten'?'eaten':''}" data-meal="${m.id}"><img src="${mealImg(m)}" alt=""><span class="pc-slot"><i style="background:${SLOT_COLOR[slot]}"></i>${slot}</span><span class="pc-b"><b>${esc(m.title)}</b>${meta?`<small>${meta}</small>`:''}</span></button>`;
}
let ovRange='week';
function melaChart(labels,series,aria){
 const W=640,H=210,x0=44,x1=W-16,top=14,y0=H-30,n=labels.length;
 const scale=Math.ceil(Math.max(4,...series.flatMap(s=>s[2]))/4)*4;
 const x=i=>n<2?(x0+x1)/2:x0+i*(x1-x0)/(n-1),y=v=>y0-v/scale*(y0-top),f=v=>v.toFixed(1);
 const curve=pts=>pts.reduce((p,[px,py],i)=>{if(!i)return `M${f(px)} ${f(py)}`;const [qx,qy]=pts[i-1],m=(qx+px)/2;return `${p} C${f(m)} ${f(qy)} ${f(m)} ${f(py)} ${f(px)} ${f(py)}`},'');
 return `<svg class="mela-chart overview-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">
  ${[0,1,2,3,4].map(i=>{const v=i*scale/4;return `<line class="gl" x1="${x0}" x2="${x1}" y1="${f(y(v))}" y2="${f(y(v))}"/><text x="${x0-10}" y="${f(y(v)+4)}" text-anchor="end">${v}</text>`}).join('')}
  ${labels.map((l,i)=>`<text x="${f(x(i))}" y="${H-8}" text-anchor="middle">${esc(l)}</text>`).join('')}
  ${series.map(([name,col,vals,fill])=>{const pts=vals.map((v,i)=>[x(i),y(v)]),d=curve(pts);return `${fill?`<path d="${d} L${f(x(n-1))} ${y0} L${x0} ${y0} Z" fill="${col}" opacity=".1"/>`:''}<path d="${d}" fill="none" stroke="${col}" stroke-width="2"/>${pts.map(([px,py],i)=>`<circle cx="${f(px)}" cy="${f(py)}" r="4" fill="${col}"><title>${esc(labels[i])}: ${vals[i]} ${name}</title></circle>`).join('')}`}).join('')}
 </svg>`;
}
function melaDonut(parts,total){
 const C=2*Math.PI*46;let off=0;
 const segs=total?parts.filter(p=>p[1]).map(([,v,c])=>{const len=v/total*C,s=`<circle cx="60" cy="60" r="46" fill="none" stroke="${c}" stroke-width="18" stroke-dasharray="${len.toFixed(2)} ${(C-len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 60 60)"/>`;off+=len;return s}).join(''):'';
 return `<svg class="mela-donut" viewBox="0 0 120 120" role="img" aria-label="${total} meals this month: ${parts.map(([n,v])=>`${n} ${v}`).join(', ')}"><circle cx="60" cy="60" r="46" fill="none" stroke="#efe4d3" stroke-width="18"/>${segs}<text x="60" y="61" text-anchor="middle" class="dn-v">${total}</text><text x="60" y="77" text-anchor="middle" class="dn-l">Meals</text></svg>`;
}
function ovBuckets(r,t){
 const ws=weekStartOf(t,state.settings.weekStart),mk=(a,b,l)=>({a,b,l});
 if(r==='week')return weekDays(ws).map(d=>mk(d,d,fmtDate(d,'weekday')));
 if(r==='month')return Array.from({length:6},(_,i)=>{const a=addDays(ws,(i-5)*7);return mk(a,addDays(a,6),parse(a).toLocaleDateString(undefined,{day:'numeric',month:'short'}))});
 const d=parse(t);return Array.from({length:6},(_,i)=>{const s=new Date(d.getFullYear(),d.getMonth()-5+i,1),e=new Date(s.getFullYear(),s.getMonth()+1,0);return mk(ymd(s),ymd(e),s.toLocaleDateString(undefined,{month:'short'}))});
}
function liveOverview(o){
 const {t,wm,planned,toBuy,shopDone,shopTotal,lowPantry,pop,cnt,name}=o;
 const todayN=mealsOn(t).length;
 const inR=(m,a,b)=>m.date>=a&&m.date<=b,bk=ovBuckets(ovRange,t),first=bk[0].a,last=bk[bk.length-1].b;
 const sched=bk.map(x=>state.meals.filter(m=>inR(m,x.a,x.b)).length),eat=bk.map(x=>state.meals.filter(m=>inR(m,x.a,x.b)&&m.status==='Eaten').length);
 const pa=ovRange==='year'?(()=>{const d=parse(first);return ymd(new Date(d.getFullYear(),d.getMonth()-6,1))})():addDays(first,ovRange==='week'?-7:-42);
 const cur=state.meals.filter(m=>inR(m,first,last)).length,prev=state.meals.filter(m=>inR(m,pa,addDays(first,-1))).length;
 const pct=prev?Math.round((cur-prev)/prev*100):null,chg=pct===null?'—':`${pct>0?'+':''}${pct}%`;
 const favs=state.recipes.filter(r=>r.fav).length;
 const stats=[['Days planned',`${planned}/7`,`${wm.length} meals this week`,'olives','week'],['To buy',toBuy,shopTotal?`${shopDone} of ${shopTotal} bought`:'List is empty','tomato','shopping'],['Expiring soon',lowPantry,'In the next 14 days','lemon','pantry'],['Recipes',state.recipes.length,`${favs} favourite${favs===1?'':'s'}`,'salad','recipes']];
 const SO={Breakfast:0,Lunch:1,Dinner:2,Snack:3};
 const recent=state.meals.filter(m=>m.date<=t).sort((a,b)=>b.date.localeCompare(a.date)||SO[b.slot]-SO[a.slot]).slice(0,4);
 const st=m=>m.status==='Eaten'?['Eaten','completed']:m.date===t?['Today','preparing']:['Not logged','cancelled'];
 const mon=state.meals.filter(m=>m.date.slice(0,7)===t.slice(0,7)),MC={Dinner:'#747a49',Lunch:'#b96445',Breakfast:'#e9cdaa',Snack:'#c9a24b'};
 const parts=['Dinner','Lunch','Breakfast','Snack'].map(s=>[s,mon.filter(m=>m.slot===s).length,MC[s]]);
 const tasks=state.tasks.filter(x=>x.status!=='Done').sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')).slice(0,3);
 return `<div class="sample-overview" aria-label="Meal planner overview">
  <div class="sample-mobile-title"><h1>Overview</h1><p>${greeting()}${name}!</p></div>
  ${PHOTOS['hero-salad']?`<section class="mela-hero" aria-label="Welcome"><img src="${PHOTOS['hero-salad']}" alt="Greek salad with tomatoes, cucumber, feta and olives on a sunny terrace above the sea"><div class="mh-in"><span class="mh-kicker">${ic('leaf')}Mediterranean Meal Planner</span><h2>${greeting()}${name}.</h2><p>${todayN?`${todayN} meal${todayN===1?'':'s'} planned for today`:'Nothing planned for today yet'} · ${planned}/7 days planned this week</p><div class="mh-act"><button class="mh-btn mh-primary" data-go="week">${ic('week')}Plan this week</button><button class="mh-btn mh-ghost" data-go="today">${ic('sun')}Today’s meals</button></div></div></section>`:''}
  <div class="sample-metrics">${stats.map(([label,value,sub,icon,go])=>`<button class="sample-metric" data-go="${go}"><span class="sample-stat-icon"><img src="${PHOTOS['icon-'+icon]||''}" alt=""></span><div><span>${label}</span><strong>${value}</strong><small>${esc(sub)}</small></div><span class="sample-kebab" aria-hidden="true">⠿</span></button>`).join('')}</div>
  <section class="sample-panel sample-sales"><div class="sample-sales-head"><div><h2>Meal Overview</h2><small>${{week:'This week',month:'Last 6 weeks',year:'Last 6 months'}[ovRange]}</small></div><div class="sample-period" role="group" aria-label="Chart period">${[['week','Week'],['month','Month'],['year','Year']].map(([k,l])=>`<button data-action="ov_${k}" aria-pressed="${ovRange===k}">${l}</button>`).join('')}</div><div class="sample-change"><strong>${chg}</strong><small>${pct===null?'no earlier data':'vs previous period'}</small></div></div>
   ${melaChart(bk.map(x=>x.l),[['planned','#b96445',sched,true],['eaten','#747a49',eat,false]],`Meals planned and eaten: ${bk.map((x,i)=>`${x.l} ${sched[i]} planned, ${eat[i]} eaten`).join('; ')}`)}
   <div class="sample-legend"><span class="sales-dot">Planned</span><span class="return-dot">Eaten</span></div>
  </section>
  <section class="sample-panel sample-menu overview-popular"><h2>Top Recipes <small>Most planned</small></h2>
   <ul>${pop.map(r=>`<li><button class="pr-b" data-recipe="${r.id}"><img src="${recipeImg(r)}" alt=""><b>${esc(r.title)}</b><span>${+r.time?`${+r.time} min`:esc(r.category||'')}</span></button></li>`).join('')||'<li class="sample-empty">No recipes yet.</li>'}</ul>
   <button class="sample-link" data-go="recipes">View all recipes →</button>
  </section>
  <section class="sample-panel sample-orders"><h2>Recent Meals</h2>
   ${recent.length?`<table><thead><tr>${['Date','Meal','Slot','Status'].map(s=>`<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>
    ${recent.map(m=>{const [s,c]=st(m);return `<tr><td>${esc(fmtDate(m.date,'short'))}</td><td><button data-meal="${m.id}" title="${esc(m.title)}">${esc(m.title)}</button></td><td>${m.slot}</td><td class="sample-${c}">${s}</td></tr>`}).join('')}
   </tbody></table>`:'<p class="sample-empty">No meals logged yet.</p>'}<button class="sample-link" data-go="week">View week plan →</button>
  </section>
  <section class="sample-panel sample-customers"><h2>Meal Mix <small>This month</small></h2>
   <div class="sample-donut">${melaDonut(parts,mon.length)}<div class="sample-legend mela-legend">${parts.map(([s,v,c])=>`<span style="--c:${c}">${s} ${mon.length?Math.round(v/mon.length*100):0}%</span>`).join('')}</div></div>
  </section>
  <section class="sample-panel sample-events"><h2>Upcoming Prep</h2>
   <ul>${tasks.map(x=>`<li><button data-taskedit="${x.id}">${ic('cal')}<div>${esc(x.title)}<small>${x.date?esc(fmtDate(x.date,'long')):'No date'}</small></div></button></li>`).join('')||'<li class="sample-empty">No open prep tasks.</li>'}</ul>
   <button class="sample-link" data-go="prep">View prep list →</button>
  </section>
  <footer class="sample-panel sample-footer"><div><q>Good food brings people together</q> <span aria-hidden="true">♡</span><small>— Mediterranean Meal Planner</small></div><div>${ic('leaf')}<i>Rooted in tradition. Made for today.</i></div></footer>
 </div>`;
}
function pHome(){
 const t=today(),ws=weekStartOf(t,state.settings.weekStart),wm=weekMeals(ws),days=weekDays(ws);
 const planned=days.filter(d=>mealsOn(d).some(m=>m.status!=='Eaten')).length;
 const shopTotal=state.shopping.length,shopDone=state.shopping.filter(x=>x.done).length,toBuy=shopTotal-shopDone;
 const name=state.profile.name?`, ${esc(state.profile.name)}`:'';
 const cnt={};state.meals.forEach(m=>{if(m.recipeId)cnt[m.recipeId]=(cnt[m.recipeId]||0)+1});
 const pop=state.recipes.slice().sort((a,b)=>(!!b.fav-!!a.fav)||(a.fav?0:(cnt[b.id]||0)-(cnt[a.id]||0))).slice(0,4);
 const lowPantry=state.pantry.filter(x=>x.expiry&&x.expiry<=addDays(t,14)).length;
 $('#overviewGreeting').textContent='Welcome back, let’s make today beautiful.';
 updateHTML($('#page-home'),`
 ${liveOverview({t,wm,planned,toBuy,shopDone,shopTotal,lowPantry,pop,cnt,name})}`);
}

/* ---------------- TODAY ---------------- */
function pToday(){
 const t=today(),ms=mealsOn(t),w=+state.water[t]||0,wg=state.settings.waterGoal;
 const tasks=state.tasks.filter(x=>x.status!=='Done'&&x.date&&x.date<=t).concat(state.tasks.filter(x=>x.status==='Done'&&x.date===t));
 const tip=TIPS[(parse(t).getDate()+parse(t).getMonth())%TIPS.length];
 const cal=ms.reduce((a,m)=>a+(+m.calories||0),0);
 updateHTML($('#page-today'),head('Today',esc(fmtDate(t,'long')),`<button class="btn" data-action="addTask">${ic('plus')}Task</button><button class="btn primary" data-action="addMeal">${ic('plus')}Meal</button>`)+`
 <div class="grid g-main">
  <div class="card"><div class="card-h"><h3>Meals</h3>${state.settings.showCalories&&cal?`<span class="pill p">${cal} kcal planned</span>`:''}</div>
   <div class="list">${SLOTS.map(s=>{const x=ms.filter(m=>m.slot===s);return `<div class="li" style="align-items:flex-start"><span class="pill" style="min-width:86px;justify-content:center;margin-top:8px"><span class="dot" style="background:${SLOT_COLOR[s]}"></span>${s}</span><div class="grow" style="display:grid;gap:6px">${x.map(m=>`<div class="row"><input type="checkbox" class="chk" data-eat="${m.id}" ${m.status==='Eaten'?'checked':''} aria-label="Mark ${esc(m.title)} as eaten">${mealChip(m)}</div>`).join('')||`<button class="btn sm ghost" style="justify-self:start" data-add-meal="${t}|${s}">${ic('plus')}Add ${s.toLowerCase()}</button>`}</div></div>`}).join('')}</div>
  </div>
  <div style="display:grid;gap:16px;align-content:start;grid-template-columns:minmax(0,1fr)">
   <div class="card"><div class="card-h"><h3>Water</h3><span class="pill p">${w} / ${wg}</span></div>
    <div class="row" style="gap:18px;align-items:center"><div class="today-ring">${themeRing(w/wg,`${Math.min(100,Math.round(w/wg*100))}%`,'of goal','#b96445')}</div>
    <div class="glasses">${Array.from({length:Math.min(100,Math.max(wg,w))},(_,i)=>`<button class="glass ${i<w?'on':''}" data-glass="${i+1}" aria-label="${i+1} glasses"><svg viewBox="0 0 30 40"><path class="fill" d="M6.5 12h17l-1.7 23.5a2 2 0 0 1-2 1.8h-9.6a2 2 0 0 1-2-1.8z"/><path class="outline" d="M4 4h22l-2.3 31.5a2.5 2.5 0 0 1-2.5 2.3H8.8a2.5 2.5 0 0 1-2.5-2.3z"/></svg></button>`).join('')}</div></div>
   </div>
   <div class="card"><div class="card-h"><h3>Tasks</h3><button class="link" data-go="prep">All →</button></div><div class="list">${tasks.map(taskRow).join('')||emptyState('check','Nothing due today','Enjoy your meals.')}</div></div>
   <div class="card" style="background:var(--tint);border-color:transparent"><div class="row" style="align-items:flex-start;gap:12px"><div style="color:var(--accent-text)">${ic('leaf','ti')}</div><div><b class="serif" style="font-size:16px">Tip of the day</b><p style="margin:4px 0 0">${tip}</p></div></div><style>.ti{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2}</style></div>
  </div>
 </div>`);
}
function addWater(n){const t=today();state.water[t]=clamp((+state.water[t]||0)+n,0,100);commit();toast(`${state.water[t]} glass${state.water[t]===1?'':'es'} of water today`)}

/* ---------------- WEEK PLAN ---------------- */
function pWeek(){
 const ws=curWeekStart(),days=weekDays(ws),t=today();
 let grid=`<div class="corner"></div>`+days.map(d=>`<div class="wh ${d===t?'today':''}"><b>${fmtDate(d,'weekday')}</b><span>${parse(d).getDate()}</span></div>`).join('');
 SLOTS.forEach(s=>{grid+=`<div class="ws"><span class="dot" style="background:${SLOT_COLOR[s]};margin-right:6px"></span>${s}</div>`+days.map(d=>`<div class="wc ${d===t?'today':''}">${mealsOn(d).filter(m=>m.slot===s).map(mealChip).join('')}<button class="plus" data-add-meal="${d}|${s}" aria-label="Add ${s} on ${fmtDate(d,'long')}">+</button></div>`).join('')});
 if(state.settings.showCalories)grid+=`<div class="wt" style="display:flex;align-items:center;justify-content:center">Total</div>`+days.map(d=>{const c=mealsOn(d).reduce((a,m)=>a+(+m.calories||0),0);return `<div class="wt">${c?`<b>${c}</b> kcal`:'—'}</div>`}).join('');
 const cal=state.settings.showCalories,wm=weekMeals(ws),dp=days.filter(d=>mealsOn(d).length).length,wk=wm.reduce((a,m)=>a+(+m.calories||0),0);
 const strip=`<nav class="wstrip no-print" aria-label="Jump to day">${days.map(d=>{const ms=mealsOn(d);return `<button class="wsd ${d===t?'today':''}" data-wjump="${d}" aria-label="${fmtDate(d,'long')}, ${ms.length} meal${ms.length===1?'':'s'}"><span>${fmtDate(d,'weekday')}</span><b>${parse(d).getDate()}</b><i>${[...new Set(ms.map(m=>m.slot))].map(x=>`<em style="background:${SLOT_COLOR[x]}"></em>`).join('')}</i></button>`}).join('')}</nav>`;
 const sum=`<div class="wk-sum no-print"><div><b>${dp}<small>/7</small></b><span>Days planned</span></div><div><b>${wm.length}</b><span>Meals</span></div>${cal?`<div><b>${dp?Math.round(wk/dp).toLocaleString():'—'}</b><span>Avg kcal / day</span></div>`:''}</div>`;
 const list=days.map(d=>{const ms=mealsOn(d),kc=ms.reduce((a,m)=>a+(+m.calories||0),0),ea=ms.filter(m=>m.status==='Eaten').length,rel=relDay(d);return `<div class="card wday ${d===t?'today':''}" id="wd-${d}"><div class="card-h"><div class="wd-t"><h3>${rel}</h3><small>${/^(Today|Tomorrow|Yesterday)$/.test(rel)?esc(fmtDate(d,'long'))+' · ':''}${ms.length?`${ea} of ${ms.length} eaten`:'Nothing planned yet'}</small></div>${cal&&ms.length?`<span class="pill">${kc.toLocaleString()} kcal</span>`:''}</div>${ms.length?`<div class="wd-bar" aria-hidden="true"><i style="width:${Math.round(ea/ms.length*100)}%"></i></div>`:''}<div class="wslots">${SLOTS.map(s=>{const x=ms.filter(m=>m.slot===s);return `<div class="wsl" style="--slot:${SLOT_COLOR[s]}"><div class="wsl-h"><span>${s}</span>${x.length?`<button class="wsl-add no-print" data-add-meal="${d}|${s}" aria-label="Add ${s} on ${fmtDate(d,'long')}">${ic('plus')}</button>`:''}</div>${x.length?x.map(mealChip).join(''):`<button class="btn sm ghost no-print" data-add-meal="${d}|${s}">${ic('plus')}Add ${s.toLowerCase()}</button>`}</div>`}).join('')}</div></div>`}).join('');
 updateHTML($('#page-week'),`${printHead('Week plan · '+weekLabel(ws))}`+head('Week Plan','',`<div class="week-nav"><button class="btn icon" data-week="-1" aria-label="Previous week">${ic('left')}</button><strong>${weekLabel(ws)}</strong><button class="btn icon" data-week="1" aria-label="Next week">${ic('right')}</button></div>${state.ui.weekOffset?`<button class="btn" data-week="0">This week</button>`:''}`)+`
 <div class="toolbar no-print"><button class="btn primary" data-action="addMeal">${ic('plus')}Add meal</button><button class="btn" data-action="genShopping">${ic('wand')}<span>Build shopping list</span></button><div class="wk-sec"><button class="btn" data-action="copyWeek">${ic('copy')}<span>Copy last week</span></button><button class="btn" data-action="printWeek">${ic('print')}<span class="lbl-sm">Print</span></button>${wm.length?`<button class="btn ghost wk-clear" data-action="clearWeek">${ic('trash')}<span class="lbl-sm">Clear week</span></button>`:''}</div></div>
 ${sum}${strip}<div class="week">${grid}</div><div class="wlist">${list}</div>`);
}
function mealModal({id=null,date=null,slot=null,recipeId=null}={}){
 const old=id?state.meals.find(m=>m.id===id):null;const r0=recipeId?state.recipes.find(r=>r.id===recipeId):null;
 const v={title:old?.title||r0?.title||'',date:old?.date||date||today(),slot:old?.slot||slot||(r0&&SLOTS.includes(r0.category)?r0.category:'Dinner'),calories:old?.calories??r0?.calories??'',groups:old?.groups||r0?.groups||[],status:old?.status||'Planned',notes:old?.notes||'',recipeId:old?.recipeId||r0?.id||''};
 const m=openModal({title:old?'Edit meal':'Add meal',size:'wide',
  body:`<div class="form">
   <div class="field full"><label for="fTitle">What are you having?</label><div class="combo"><input id="fTitle" value="${esc(v.title)}" placeholder="Pick a recipe or type anything — e.g. Leftover soup" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="recipeDrop"><button type="button" class="combo-tg" tabindex="-1" aria-label="Show recipes"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><ul id="recipeDrop" class="combo-list" role="listbox" hidden></ul></div><span class="hint" id="fLinked">${v.recipeId?'Linked to your recipe — ingredients can go straight to your shopping list.':''}</span></div>
   <div class="field full"><span class="flabel">Meal</span>${segmented('fSlot',SLOTS,v.slot)}</div>
   ${fld('Date','fDate',v.date,'date')}${fld('Calories (optional)','fCal',v.calories,'number','min="0" max="10000" inputmode="numeric"')}
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
 updateHTML($('#page-recipes'),head('Recipes',`${state.recipes.length} recipe${state.recipes.length===1?'':'s'} in your collection`,`<button class="btn primary" data-action="addRecipe">${ic('plus')}New recipe</button>`)+`
 <div class="toolbar"><input id="rSearch" type="search" placeholder="Search by name or ingredient…" value="${esc(q)}"><div class="chips">${cats.map(c=>`<button class="chip ${c===f?'on':''}" data-rfilter="${c}">${c}</button>`).join('')}</div></div>
 <div class="rgrid">${rows.map(r=>`<div class="rwrap"><div class="card rcard" role="button" tabindex="0" data-recipe="${r.id}"><img class="img" src="${recipeImg(r)}" alt="" loading="lazy"><div class="bd"><span class="pill p" style="align-self:flex-start">${esc(r.category)}</span><h3>${esc(r.title)}</h3><div class="meta">${r.time?`<span class="row" style="gap:4px">${ic('clock','mi')}${esc(r.time)} min</span>`:''}${r.servings?`<span class="row" style="gap:4px">${ic('users','mi')}${esc(r.servings)}</span>`:''}${kcal(r.calories)?`<span>${kcal(r.calories)}</span>`:''}${gdots(r.groups)}</div></div></div><button class="fav ${r.fav?'on':''}" data-fav="${r.id}" aria-label="${r.fav?'Remove from':'Add to'} favourites" aria-pressed="${!!r.fav}">${STAR}</button></div>`).join('')||`<div style="grid-column:1/-1">${emptyState('book',q||f!=='All'?'No matching recipes':'Your recipe box is empty','Save the dishes you love and plan them in one tap.',`<button class="btn primary" data-action="addRecipe">${ic('plus')}Add your first recipe</button>`)}</div>`}</div>
 <style>.mi{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2}</style>`);
 const s=$('#rSearch');if(!s.oninput)s.oninput=debounce(()=>pRecipes(),160);
}
function recipeDetail(id){
 const r=state.recipes.find(x=>x.id===id);if(!r)return;
 const steps=(r.method||'').split('\n').map(x=>x.trim()).filter(Boolean),gs=(r.groups||[]).filter(k=>G[k]),n=r.ingredients.length;
 const st=[['clock',r.time&&esc(r.time)+' min','Time'],['users',r.servings&&esc(r.servings),'Serves'],['spark',kcal(r.calories),'Per serving'],['list',n,'Ingredients']].filter(x=>x[1]);
 openModal({title:esc(r.title),size:'wide',body:`<div class="rdetail rd2"><div class="rd-hero"><img src="${recipeImg(r)}" alt=""><span class="pill rd-cat">${esc(r.category)}</span>${r.fav?`<span class="rd-fav" title="Favourite">${STAR}</span>`:''}</div>
  ${st.length?`<div class="rd-stats" style="grid-template-columns:repeat(${st.length},minmax(0,1fr))">${st.map(([i,v,k])=>`<div>${ic(i)}<b>${v}</b><span>${k}</span></div>`).join('')}</div>`:''}
  ${gs.length?`<div class="rd-groups">${gs.map(k=>`<span class="pill"><span class="dot" style="background:${G[k].color}"></span>${G[k].label}</span>`).join('')}</div>`:''}
  <div class="rd-cols"><section class="rd-ing"><h4>Ingredients<em>${n}</em></h4>${n?`<ul>${r.ingredients.map(i=>`<li><label><input type="checkbox"><span>${esc(i)}</span></label></li>`).join('')}</ul><p class="rd-hint">Tick items off as you cook.</p>`:'<p class="muted">No ingredients added yet.</p>'}</section>
  <section class="rd-steps"><h4>Method<em>${steps.length} step${steps.length===1?'':'s'}</em></h4>${steps.length?`<ol>${steps.map((x,k)=>`<li><i>${k+1}</i><p>${esc(x)}</p></li>`).join('')}</ol>`:'<p class="muted">No method added yet.</p>'}</section></div>
  ${r.tags?`<p class="muted small rd-tags">Tags: ${esc(r.tags)}</p>`:''}</div>`,
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
  ${fld('Prep + cook time (minutes)','fTime',old?.time??'','number','min="0" max="1440" inputmode="numeric"')}
  ${fld('Servings','fServ',old?.servings||2,'number','min="1" max="100" inputmode="numeric"')}
  ${fld('Calories per serving (optional)','fCal',old?.calories??'','number','min="0" max="10000" inputmode="numeric"')}
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
 const f=state.ui.shopFilter||'all',items=state.shopping.filter(i=>f==='all'||(f==='open'?!i.done:i.done));
 const total=state.shopping.length,done=state.shopping.filter(i=>i.done).length;
 const by=AISLES.map(a=>[a,items.filter(i=>i.aisle===a).sort((x,y)=>x.done-y.done||x.name.localeCompare(y.name))]).filter(x=>x[1].length);
 updateHTML($('#page-shopping'),printHead('Shopping list')+head('Shopping',total?`${done} of ${total} bought`:'Everything you need, sorted by aisle.',`<button class="btn" data-action="copyList">${ic('copy')}<span class="lbl-sm">Copy</span></button><button class="btn" data-action="printShopping">${ic('print')}<span class="lbl-sm">Print</span></button><button class="btn primary" data-action="genShopping">${ic('wand')}From week plan</button>`)+`
 <div class="card">
  <form class="addbar no-print" id="shopAdd" autocomplete="off"><input id="sName" placeholder="Add an item — e.g. Lemons" aria-label="Item"><input id="sQty" placeholder="Qty" aria-label="Quantity"><select id="sAisle" aria-label="Aisle"><option value="">Auto aisle</option>${AISLES.map(a=>`<option>${a}</option>`).join('')}</select><button class="btn primary" type="submit">${ic('plus')}Add</button></form>
  ${total?`<div class="shop-prog no-print"><div class="sp-t"><b>${Math.round(done/total*100)}%</b><span>${done} of ${total} bought · ${total-done} to go</span></div><div class="bar"><i style="width:${done/total*100}%"></i></div></div>`:''}
  <div class="toolbar shop-tb no-print">${segmented('shopSeg',['All','To buy','Bought'],{open:'To buy',done:'Bought',all:'All'}[f])}${done?`<button class="btn sm ghost shop-clear" data-action="clearBought">${ic('trash')}Clear bought (${done})</button>`:''}</div>
  ${by.map(([a,list])=>`<div class="aisle"><h4>${a} <span class="n" aria-label="${list.length} items">${list.length}</span></h4><div class="list">${list.map(i=>`<div class="li ${i.done?'done':''}"><input type="checkbox" class="chk" data-shop="${i.id}" ${i.done?'checked':''} aria-label="${esc(i.name)}"><div class="grow" data-shopedit="${i.id}" role="button" tabindex="0" style="cursor:pointer"><div class="t">${esc(i.name)}</div>${i.qty?`<div class="s">${esc(i.qty)}</div>`:''}</div><button class="btn sm icon ghost no-print" data-del="shopping|${i.id}" aria-label="Delete ${esc(i.name)}">${ic('x')}</button></div>`).join('')}</div></div>`).join('')||emptyState('cart',f==='done'?'Nothing ticked off yet':'Your list is empty','Add items above, or build it from this week’s meal plan in one tap.')}
 </div>`);
 $('#shopAdd').onsubmit=e=>{e.preventDefault();const n=$('#sName').value.trim();if(!n)return;state.shopping.push({id:uid(),name:n,qty:$('#sQty').value.trim(),aisle:$('#sAisle').value||guessAisle(n),done:false,isSample:false});commit();$('#sName').focus()};
 const sc={All:total,'To buy':total-done,Bought:done};$$('#shopSeg button').forEach(b=>b.insertAdjacentHTML('beforeend',`<span class="sc">${sc[b.dataset.v]}</span>`));
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
 const rows=state.pantry.slice().sort((a,b)=>(a.expiry||'9999').localeCompare(b.expiry||'9999')),t=today();
 const soon=rows.filter(p=>p.expiry&&(parse(p.expiry)-parse(t))/864e5<=5).length;
 updateHTML($('#page-pantry'),head('Pantry',rows.length?`${rows.length} item${rows.length===1?'':'s'} in stock${soon?` · <span class="pan-soon">${soon} to use soon</span>`:''}`:'',`<button class="btn primary" data-action="addPantry">${ic('plus')}Add item</button>`)+`
 <div class="card tbl-wrap pan-card">${rows.length?`<table class="tbl pan-tbl"><colgroup><col class="c-item"><col class="c-aisle"><col class="c-qty"><col class="c-exp"><col></colgroup><thead><tr><th>Item</th><th>Aisle</th><th>Qty</th><th>Use by</th><th class="r"><span class="sr-only">Actions</span></th></tr></thead><tbody>${rows.map(p=>`<tr><td><div class="pantry-item">${pantryIcon(p.name)}<b>${esc(p.name)}</b></div></td><td class="muted">${esc(p.aisle)}</td><td class="pan-qty">${esc(p.qty)||'<span class="muted">—</span>'}</td><td>${expiryPill(p.expiry)||'<span class="muted">—</span>'}</td><td class="r pan-act"><button class="btn sm" data-restock="${p.id}" title="Add to shopping list">${ic('cart')}<span class="lbl-sm">Restock</span></button><button class="btn sm icon ghost" data-pantryedit="${p.id}" aria-label="Edit ${esc(p.name)}">${ic('edit')}</button></td></tr>`).join('')}</tbody></table>`:emptyState('jar','Your pantry is empty','Track staples and use-by dates. Items here are skipped when you build a shopping list.',`<button class="btn primary" data-action="addPantry">${ic('plus')}Add item</button>`)}</div>`);
}
function pantryModal(id=null){
 const old=id?state.pantry.find(x=>x.id===id):null;
 openModal({title:old?'Edit pantry item':'Add pantry item',size:'narrow',body:`<div class="form">${fld('Item','fName',old?.name||'','text','','full')}${fld('Quantity','fQty',old?.qty||'')}${fld('Use by (optional)','fExp',old?.expiry||'','date')}${sel('Aisle','fAisle',AISLES,old?.aisle||'Legumes & Canned','full')}</div>`,
  left:old?`<button class="btn ghost" style="color:var(--bad)" id="mDel">${ic('trash')}</button>`:'',
  buttons:[{label:'Cancel'},{label:'Save',cls:'primary',onClick:m=>{const n=$('#fName',m).value.trim();if(!n)return false;upsert('pantry',{id:old?.id||uid(),name:n,qty:$('#fQty',m).value.trim(),expiry:$('#fExp',m).value,aisle:$('#fAisle',m).value,isSample:false})}}]});
 $('#mDel')?.addEventListener('click',()=>{closeModal();removeItem('pantry',old.id,'Item removed')});
}

/* ---------------- BALANCE ---------------- */
function ringDonut(parts,total,center,sub){
 const R=46,C=2*Math.PI*R,live=parts.filter(p=>p[1]);let off=0;
 const segs=total?live.map(([n,v,c])=>{const L=v/total*C,s=`<circle class="td-seg" cx="60" cy="60" r="${R}" stroke="${c}" stroke-dasharray="${L.toFixed(2)} ${(C-L).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 60 60)"><title>${esc(n)}: ${v}</title></circle>`;off+=L;return s}).join(''):'';
 return `<svg class="th-donut" viewBox="0 0 120 120" role="img" aria-label="${esc(sub)}: ${live.map(([n,v])=>`${esc(n)} ${v}`).join(', ')||'none yet'}"><circle class="td-track" cx="60" cy="60" r="${R}"/>${segs}<text x="60" y="62" text-anchor="middle" class="td-v">${center}</text><text x="60" y="78" text-anchor="middle" class="td-l">${esc(sub)}</text></svg>`;
}
function themeRing(p,center,sub,col='var(--primary)'){
 p=Math.max(0,Math.min(1,p||0));
 return ringDonut([[sub,p,col],['rest',0,'none']],1,center,sub).replace('<circle class="td-seg"',`<circle class="td-seg"${p?'':' style="display:none"'}`);
}
const TICK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const pctOf=(v,t)=>t?Math.round(v/t*100):0;
function pBalance(){
 const ws=curWeekStart(),days=weekDays(ws),wm=weekMeals(ws),b=balance(wm),t=today();
 const cal=days.map(d=>mealsOn(d).reduce((a,m)=>a+(+m.calories||0),0)),calDays=cal.filter(Boolean);
 const avg=calDays.length?Math.round(calDays.reduce((a,c)=>a+c,0)/calDays.length):0;
 const okK=k=>{const g=GUIDES[k],v=b.tally[k];return g.max!=null?v<=g.max:v>=g.min};
 const gk=Object.keys(GUIDES),onTrack=b.total?gk.filter(okK).length:0,miss=gk.filter(k=>!okK(k));
 const status=k=>{const g=GUIDES[k],v=b.tally[k];if(!g)return '';if(g.max!=null)return v<=g.max?`<span class="pill ok">${TICK}On track</span>`:'<span class="pill warn">A bit high</span>';return v>=g.min?`<span class="pill ok">${TICK}On track</span>`:`<span class="pill warn">${g.min-v} to go</span>`};
 const maxT=Math.max(4,...Object.values(b.tally),...gk.map(k=>GUIDES[k].min||GUIDES[k].max||0));
 const MIX={Breakfast:'#e9cdaa',Lunch:'#b96445',Dinner:'#747a49',Snack:'#c9a24b'},slotParts=SLOTS.map(s=>[s,wm.filter(m=>m.slot===s).length,MIX[s]]);
 const gl=k=>(GROUPS.find(g=>g.k===k)||{}).label||k,gc=k=>(GROUPS.find(g=>g.k===k)||{}).color||'var(--muted)';
 const sub=(k,txt)=>`<span class="sub ${b.total&&okK(k)?'ok':''}">${b.total&&okK(k)?TICK:''}${txt}</span>`;
 updateHTML($('#page-balance'),head('Balance','Your week against Mediterranean-style patterns',`<div class="week-nav"><button class="btn icon" data-week="-1" aria-label="Previous week">${ic('left')}</button><strong>${weekLabel(ws)}</strong><button class="btn icon" data-week="1" aria-label="Next week">${ic('right')}</button></div>`)+`
 <div class="bal-top">
  <div class="card bal-score">${themeRing(onTrack/gk.length,`${onTrack}<tspan class="td-of">/${gk.length}</tspan>`,"on track","#747a49")}<div class="bal-score-t"><span class="eyebrow">This week</span><h2>Guides on track</h2><p>${b.total?`${b.total} meals planned · ${b.plant}% plant-forward`:'Plan meals and tag their food groups to see your balance.'}</p>${b.total?(miss.length?`<p class="bal-focus"><span>Focus on</span>${miss.map(k=>`<i style="--c:${gc(k)}">${esc(gl(k))}</i>`).join('')}</p>`:'<p class="bal-focus ok">Every guide met this week</p>'):''}</div></div>
  <div class="card bal-mix"><div class="card-h"><h3>Meal mix</h3><span class="muted small">By meal slot</span></div><div class="bal-mix-b">${ringDonut(slotParts,b.total,b.total,'meals')}<ul class="bal-leg">${slotParts.map(([n,v,c])=>`<li style="--c:${c}"><span>${n}</span><b>${v}</b><em>${pctOf(v,b.total)}%</em></li>`).join('')}</ul></div></div>
 </div>
 <div class="grid g4 mt bal-stats">
  <div class="card stat"><span class="k">${ic('leaf')}Plant-forward meals</span><span class="v">${b.plant}<small>%</small></span><span class="sub">Meals led by plants</span></div>
  <div class="card stat"><span class="k">${ic('fish')}Fish & seafood</span><span class="v">${b.tally.fish}<small> meals</small></span>${sub('fish','Guide: 2+ a week')}</div>
  <div class="card stat"><span class="k">${ic('jar')}Legume meals</span><span class="v">${b.tally.legumes}<small> meals</small></span>${sub('legumes','Guide: 3+ a week')}</div>
  <div class="card stat"><span class="k">${ic('spark')}${state.settings.showCalories?'Avg calories / day':'Meals planned'}</span><span class="v">${state.settings.showCalories?(avg||'—'):b.total}${state.settings.showCalories&&avg?'<small> kcal</small>':''}</span><span class="sub">${state.settings.showCalories?`${calDays.length} of 7 days logged`:'This week'}</span></div>
 </div>
 <div class="grid g-main mt">
  <div class="card"><div class="card-h"><h3>Food groups this week</h3><span class="muted small">${b.total} meals</span></div>
   ${b.total?`<div class="list bal-list">${GROUPS.map(g=>{const G=GUIDES[g.k],tg=G?(G.min??G.max)/maxT*100:null;return `<div class="li"><span class="dot" style="background:${g.color}"></span><div class="grow"><div class="row" style="justify-content:space-between;gap:10px"><b>${g.label}</b><span class="small muted">${b.tally[g.k]} meal${b.tally[g.k]===1?'':'s'}${G?` · ${G.txt}`:''}</span></div><div class="bar tg"><i style="width:${b.tally[g.k]/maxT*100}%;background:${g.color}"></i>${tg!=null?`<em style="left:${Math.min(tg,99.4)}%" title="Guide: ${G.txt}"></em>`:''}</div></div><div class="st">${status(g.k)}</div></div>`}).join('')}</div><p class="small muted bal-key"><em></em>Guide marker</p>`:emptyState('leaf','No meals this week yet','Plan a few meals and tag their food groups to see your balance.')}
  </div>
  <div style="display:grid;gap:16px;align-content:start;grid-template-columns:minmax(0,1fr)">
   ${state.settings.showCalories?`<div class="card"><div class="card-h"><h3>Calories by day</h3>${avg?`<span class="pill">Avg ${avg} kcal</span>`:''}</div>${melaChart(days.map(d=>fmtDate(d,'weekday')),[['kcal','#b96445',cal,true]],'Calories by day')}</div>`:''}
   <div class="card bal-how"><h3>How Balance works</h3><p class="small">Tag each meal or recipe with its food groups. Balance counts them across the week and compares them with common Mediterranean-style eating patterns: plenty of vegetables, legumes, whole grains and olive oil, fish a couple of times a week, and red meat only now and then.</p><p class="small muted">This is a planning aid, not medical or nutritional advice. For personal dietary needs, talk to a qualified professional.</p></div>
  </div>
 </div>`);
}

/* ---------------- PREP LIST ---------------- */
const PRIO_C={High:'bad',Medium:'warn',Low:''};
function taskRow(tk){const over=tk.status!=='Done'&&tk.date&&tk.date<today();return `<div class="li ${tk.status==='Done'?'done':''}"><input type="checkbox" class="chk" data-task="${tk.id}" ${tk.status==='Done'?'checked':''} aria-label="${esc(tk.title)}"><div class="grow" data-taskedit="${tk.id}" role="button" tabindex="0" style="cursor:pointer"><div class="t">${esc(tk.title)}</div><div class="s" style="${over?'color:var(--bad)':''}">${tk.date?(over?'Overdue · ':'')+relDay(tk.date):'No date'}</div></div><span class="pill ${PRIO_C[tk.priority]||''}">${esc(tk.priority)}</span></div>`}
function pPrep(){
 const open=state.tasks.filter(t=>t.status!=='Done').sort((a,b)=>(a.date||'9').localeCompare(b.date||'9')),done=state.tasks.filter(t=>t.status==='Done');
 updateHTML($('#page-prep'),head('Prep List','',`<button class="btn primary" data-action="addTask">${ic('plus')}Add task</button>`)+`
 <div class="grid g2"><div class="card"><div class="card-h"><h3>To do</h3><span class="pill p">${open.length}</span></div><div class="list">${open.map(taskRow).join('')||emptyState('check','All done','Nothing left to prep.')}</div></div>
 <div class="card"><div class="card-h"><h3>Done</h3>${done.length?`<button class="link" data-action="clearDone">Clear</button>`:''}</div><div class="list">${done.map(taskRow).join('')||emptyState('list','Nothing finished yet','Completed tasks land here.')}</div></div></div>`);
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
 const t=today(),days=Array.from({length:7},(_,i)=>addDays(t,i-6)),wg=state.settings.waterGoal,w=+state.water[t]||0,vals=days.map(d=>+state.water[d]||0),avg=vals.reduce((a,v)=>a+v,0)/7,hit=vals.filter(v=>v>=wg).length;
 const done=state.goals.filter(g=>g.progress>=100).length;
 updateHTML($('#page-goals'),head('Goals & Water',state.goals.length?`${state.goals.length} goal${state.goals.length===1?'':'s'}${done?` · ${done} done`:''}`:'',`<button class="btn primary" data-action="addGoal">${ic('plus')}New goal</button>`)+`
 <div class="grid g-main gw">
  <div class="gw-goals">${state.goals.map(g=>{const p=clamp(g.progress,0,100);return `<div class="card goal ${p>=100?'done':''}"><div class="goal-h"><h3 role="button" tabindex="0" data-goaledit="${g.id}">${esc(g.title)}</h3><span class="goal-p">${p>=100?TICK+'Done':p+'%'}</span></div>${g.description?`<p class="goal-d">${esc(g.description)}</p>`:''}<div class="goal-bar"><i style="width:${p}%"></i></div><div class="goal-f"><span>${g.deadline?ic('cal')+'By '+fmtDate(g.deadline):''}</span><div class="stepper" role="group" aria-label="Adjust progress"><button data-goal="${g.id}|-10" aria-label="Less progress">−</button><button data-goal="${g.id}|10" aria-label="More progress">+</button></div></div></div>`}).join('')||`<div class="card" style="grid-column:1/-1">${emptyState('target','No goals yet','Pick one small habit — like fish twice a week.',`<button class="btn primary" data-action="addGoal">${ic('plus')}New goal</button>`)}</div>`}</div>
  <div class="card water-card"><div class="card-h"><h3>Water</h3><button class="btn sm primary" data-action="water">${ic('drop')}+1 glass</button></div>
   <div class="wc-top">${themeRing(w/wg,`${w}<tspan class="td-of">/${wg}</tspan>`,'today','#b96445')}<div class="wc-stats"><div><b>${avg.toFixed(1)}</b><span>Avg glasses / day</span></div><div><b>${hit}<small>/7</small></b><span>Days at goal</span></div></div></div>
   <div class="wc-chart"><div class="wc-ch"><span>Last 7 days</span><span class="muted small">Goal ${wg}</span></div>${melaChart(days.map(d=>fmtDate(d,'weekday')),[['glasses','#b96445',vals,true]],'Water, last 7 days')}</div>
   <p class="small muted wc-note">Change your daily goal in Settings.</p></div>
 </div>`);
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
 updateHTML($('#page-calendar'),head('Calendar','',`<div class="week-nav"><button class="btn icon" data-month="-1" aria-label="Previous month">${ic('left')}</button><strong>${first.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</strong><button class="btn icon" data-month="1" aria-label="Next month">${ic('right')}</button></div><button class="btn" data-month="0">Today</button>`)+`
 <div class="cal">${dn.map(d=>`<div class="ch">${d}</div>`).join('')}${cells.slice(0,rows).map(d=>{const ms=mealsOn(d),ts=state.tasks.filter(x=>x.date===d&&x.status!=='Done'),ev=[...ms.map(m=>`<span class="ev" style="border-left-color:${SLOT_COLOR[m.slot]}">${esc(m.title)}</span>`),...ts.map(x=>`<span class="ev task">${esc(x.title)}</span>`)];return `<button class="cd ${parse(d).getMonth()!==mo?'out':''} ${d===t?'today':''}" data-day="${d}" aria-label="${fmtDate(d,'long')}: ${ms.length} meals"><span class="n">${parse(d).getDate()}</span>${ev.slice(0,3).join('')}${ev.length>3?`<span class="more">+${ev.length-3} more</span>`:''}</button>`}).join('')}</div>
 ${legend([...SLOTS.map(s=>[s,SLOT_COLOR[s]]),['Prep task','var(--terra)']])}`);
}
function dayModal(d){
 const ms=mealsOn(d),ts=state.tasks.filter(x=>x.date===d);
 openModal({title:esc(fmtDate(d,'long')),body:`<div style="display:grid;gap:6px">${SLOTS.map(s=>{const x=ms.filter(m=>m.slot===s);return `<div class="flabel" style="margin-top:6px">${s}</div>`+(x.map(mealChip).join('')||`<button class="btn sm ghost" style="justify-self:start" data-add-meal="${d}|${s}">${ic('plus')}Add ${s.toLowerCase()}</button>`)}).join('')}${ts.length?`<div class="flabel" style="margin-top:10px">Prep</div><div class="list">${ts.map(taskRow).join('')}</div>`:''}</div>`,
  buttons:[{label:'Open this week',onClick:()=>{state.ui.weekOffset=weekOffsetFor(d);go('week')}}]});
}

/* ---------------- JOURNAL ---------------- */
function pJournal(){
 const rows=state.notes.slice().sort((a,b)=>(b.pinned-a.pinned)||String(b.date).localeCompare(String(a.date)));
 updateHTML($('#page-journal'),head('Journal',rows.length?`${rows.length} note${rows.length===1?'':'s'} · what worked, ideas and favourites`:'',`<button class="btn primary" data-action="addNote">${ic('plus')}New note</button>`)+
 (rows.length?`<div class="ngrid">${rows.map(n=>`<div class="card note ${n.pinned?'pinned':''}" data-noteedit="${n.id}" role="button" tabindex="0"><div class="note-m"><small>${fmtDate(n.date)}</small>${n.pinned?`<span class="pin" title="Pinned">${ic('pin')}</span>`:''}</div><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></div>`).join('')}</div>`:`<div class="card">${emptyState('pen','No notes yet','Write down what worked, what the kids loved, or ideas for next week.',`<button class="btn primary" data-action="addNote">${ic('plus')}New note</button>`)}</div>`));
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
 const where=DEMO?{memory:'Live demo — nothing is saved'}:{idb:'This browser’s app storage (IndexedDB)',local:'This browser’s local storage',memory:'Not saving — this browser blocks storage'}[Store.mode];
 updateHTML($('#page-settings'),head('Settings','')+`
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
 </div>`);
 const bindSet=(id,fn)=>{$('#'+id).onchange=e=>{fn(e.target);save();applyTheme();renderNav();renderBanners()}};
 bindSet('sName',el=>state.profile.name=el.value.trim());bindSet('sPlanner',el=>state.profile.plannerName=el.value.trim()||'My Mediterranean Planner');
 bindSet('sWeek',el=>{s.weekStart=+el.value;state.ui.weekOffset=0});bindSet('sDate',el=>s.dateFormat=el.value);
 bindSet('sWater',el=>s.waterGoal=clamp(parseInt(el.value)||8,1,20));bindSet('sCal',el=>s.showCalories=el.checked);bindSet('sRemind',el=>{s.backupRemind=el.checked});
 $$('#sTheme button').forEach(b=>b.onclick=()=>{s.theme=b.dataset.v.toLowerCase();applyTheme();commit()});
 $('#importFile').onchange=e=>{importBackup(e.target.files[0]);e.target.value=''};
}

/* ---------------- data actions ---------------- */
function upsert(coll,record){
 if(!COLLECTIONS.includes(coll))throw new Error('Unknown collection');
 const candidate={...state,[coll]:[record],recipes:coll==='recipes'?[record]:state.recipes};
 const value=normalize(candidate)[coll].find(x=>x.id===record.id);
 if(!value)throw new Error('Check the date and required fields.');
 const i=state[coll].findIndex(x=>x.id===value.id);if(i<0)state[coll].push(value);else state[coll][i]={...state[coll][i],...value};commit();
}
function removeItem(coll,id,msg){const i=state[coll].findIndex(x=>x.id===id);if(i<0)return;const [old]=state[coll].splice(i,1);commit();toast(msg,'',()=>{state[coll].splice(Math.min(i,state[coll].length),0,old);commit()})}
async function clearSamples(){
 if(!await confirmBox('All example meals, recipes and lists will be removed. Anything you added yourself stays.',{title:'Clear sample data?',ok:'Clear samples'}))return;
 takeSnapshot();COLLECTIONS.forEach(k=>state[k]=state[k].filter(x=>!x.isSample));state.water={};state.settings.sampleCleared=true;commit();toast('Sample data cleared — it’s all yours now','',restoreSnapshot);
}
function loadSamples(){const smp=sampleState();takeSnapshot();COLLECTIONS.forEach(k=>state[k]=state[k].filter(x=>!x.isSample).concat(smp[k]));state.water={...smp.water,...state.water};state.settings.sampleCleared=false;state.settings.sampleHintHidden=false;commit();toast('Sample week loaded','',restoreSnapshot)}
async function eraseAll(){
 if(!await confirmBox('This permanently deletes every meal, recipe, list and note in this browser. Make a backup first if you might want them later.',{title:'Erase everything?',ok:'Erase everything',danger:true}))return;
 const keep={theme:state.settings.theme,accent:state.settings.accent};takeSnapshot();state=blankState();Object.assign(state.settings,keep,{onboarded:true,sampleCleared:true});applyTheme();commit();go('home');toast('Planner erased','',restoreSnapshot);
}
function download(name,data,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function exportBackup(){if(DEMO)return toast('Backups are in the full version');state.settings.lastBackup=new Date().toISOString();state.ui.backupSnooze=null;download(`mediterranean-meal-planner-backup-${today()}.json`,JSON.stringify({app:'mediterranean-meal-planner',version:2,exportedAt:new Date().toISOString(),state},null,1),'application/json');commit();toast('Backup saved to your downloads')}
function exportCSV(){if(DEMO)return toast('Export is in the full version');
 const q=v=>{let text=String(v??'');if(/^[\s]*[=+@-]/.test(text)||/^[\t\r\n]/.test(text))text="'"+text;return `"${text.replace(/"/g,'""')}"`},rows=[['Type','Date','Meal / Category','Title','Calories','Status / Qty','Details']];
 state.meals.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(m=>rows.push(['Meal',m.date,m.slot,m.title,m.calories,m.status,(m.groups||[]).map(k=>G[k]?.label).join('; ')]));
 state.recipes.forEach(r=>rows.push(['Recipe','',r.category,r.title,r.calories,'',r.ingredients.join('; ')]));
 state.shopping.forEach(i=>rows.push(['Shopping','',i.aisle,i.name,'',i.qty,i.done?'Bought':'To buy']));
 state.pantry.forEach(i=>rows.push(['Pantry',i.expiry,i.aisle,i.name,'',i.qty,'']));
 state.tasks.forEach(t=>rows.push(['Prep task',t.date,t.priority,t.title,'',t.status,'']));
 download(`mediterranean-meal-planner-${today()}.csv`,'﻿'+rows.map(r=>r.map(q).join(',')).join('\r\n'),'text/csv');toast('CSV exported — opens in Excel, Numbers or Sheets');
}
function importBackup(file){
 if(DEMO)return toast('Restore is in the full version');if(!file)return;if(file.size>60*1024*1024){toast('That file is too large to be a backup','err');return}
 const rd=new FileReader();rd.onload=async()=>{try{const x=migrate(JSON.parse(rd.result));const n=COLLECTIONS.reduce((a,k)=>a+x[k].length,0);
  if(!await confirmBox(`This backup has ${n} items. Restoring replaces what’s in this browser now.`,{title:'Restore backup?',ok:'Restore'}))return;
  takeSnapshot();x.settings.onboarded=true;state=x;applyTheme();const saved=await flush();go('home');toast(saved?'Backup restored':'Backup loaded in this tab, but could not be saved. Export a copy before closing.',saved?'':'err',restoreSnapshot)}catch(e){toast(e.message.includes('Mediterranean Meal Planner')?e.message:'That file couldn’t be read as a backup.','err')}};
 rd.onerror=()=>toast('Couldn’t read that file','err');rd.readAsText(file);
}

/* ---------------- print ---------------- */
function printHead(title){return `<div class="print-head" style="display:none"><svg viewBox="0 0 270 64" aria-hidden="true"><g transform="scale(1)"><rect width="64" height="64" rx="16" fill="#1F4A38"/>${MARK_INNER}</g><g transform="translate(76 14) scale(1)" fill="#1E2A30"><path d="${WM_D}"/></g></svg><div style="text-align:right"><b class="serif" style="font-size:16px">${esc(title)}</b><br><span class="small muted">${esc(state.profile.plannerName)}</span></div></div>`}
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
const ACTIONS={jumpToPlanner:()=>$('#live-planner')?.scrollIntoView({block:'start'}),reload:()=>location.reload(),menu:openSidebar,toggleTheme:()=>{state.settings.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme();commit()},quickAdd,
 addMeal:()=>mealModal({}),addRecipe:()=>recipeModal(),addTask:()=>taskModal(),addGoal:()=>goalModal(),addNote:()=>noteModal(),addPantry:()=>pantryModal(),water:()=>addWater(1),
 genShopping,copyWeek,clearWeek,printWeek,printShopping,copyList,clearSamples,loadSamples,eraseAll,exportBackup,exportCSV,importBackup:()=>$('#importFile').click(),onboarding:()=>onboarding(0),diagnostics,
 hideSampleHint:()=>{state.settings.sampleHintHidden=true;commit();toast('Message hidden — manage samples in Settings','',()=>{state.settings.sampleHintHidden=false;commit()})},
 snoozeBackup:()=>{state.ui.backupSnooze=addDays(today(),3);commit()},
 clearBought:()=>{takeSnapshot();const n=state.shopping.filter(i=>i.done).length;state.shopping=state.shopping.filter(i=>!i.done);commit();toast(`Cleared ${n} bought item${n===1?'':'s'}`,'',restoreSnapshot)},
 clearDone:()=>{takeSnapshot();state.tasks=state.tasks.filter(t=>t.status!=='Done');commit();toast('Finished tasks cleared','',restoreSnapshot)}};
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-action],[data-go],[data-meal],[data-add-meal],[data-week],[data-wjump],[data-month],[data-recipe],[data-fav],[data-rfilter],[data-shopedit],[data-del],[data-restock],[data-pantryedit],[data-taskedit],[data-goal],[data-goaledit],[data-day],[data-noteedit],[data-glass],[data-accent]');
 if(!el)return;const d=el.dataset;
 if(d.action){ACTIONS[d.action]?.();return}
 if(d.go){e.preventDefault();if($('#overlay').classList.contains('open'))closeModal();go(d.go);return}
 if(d.meal){if($('#overlay').classList.contains('open'))closeModal();setTimeout(()=>mealModal({id:d.meal}),10);return}
 if(d.addMeal){const [date,slot]=d.addMeal.split('|');if($('#overlay').classList.contains('open'))closeModal();setTimeout(()=>mealModal({date,slot}),10);return}
 if(d.wjump){$('#wd-'+d.wjump)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return}
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
 if(d.shop){const i=state.shopping.find(x=>x.id===d.shop);if(i){const ix=$$('[data-shop]').indexOf(e.target);i.done=e.target.checked;commit();const all=$$('[data-shop]');(all.find(x=>x.dataset.shop===i.id)||all[Math.min(ix,all.length-1)])?.focus()}}
 else if(d.task){const t=state.tasks.find(x=>x.id===d.task);if(t){t.status=e.target.checked?'Done':'Open';commit();if(t.status==='Done')toast('Nice — task done','',()=>{t.status='Open';commit()})}}
 else if(d.eat){const m=state.meals.find(x=>x.id===d.eat);if(m){m.status=e.target.checked?'Eaten':'Planned';commit()}}
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role=button][data-recipe],[role=button][data-noteedit],[role=button][data-shopedit],[role=button][data-taskedit],[role=button][data-goaledit]')){e.preventDefault();e.target.click()}});

/* ---------------- boot ---------------- */
function bootBlocked(){return new Promise(res=>{const d=document.createElement('div');d.className='boot-block';d.setAttribute('role','alertdialog');d.setAttribute('aria-labelledby','bbT');
 d.innerHTML=`<div class="card"><h1 id="bbT">We can’t open your saved planner right now</h1><p>Your plans are still stored in this browser — nothing has been deleted. This usually clears up after closing other tabs of the planner, or restarting the browser.</p><div class="actions"><button class="btn primary" id="bbRetry">Try again</button><button class="btn" id="bbTemp">Use a temporary planner</button></div><p class="small">A temporary planner is not saved. Your real plans stay safe and load next time.</p></div>`;
 document.body.appendChild(d);d.querySelector('#bbRetry').onclick=()=>location.reload();d.querySelector('#bbTemp').onclick=()=>{d.remove();res()};d.querySelector('#bbRetry').focus()})}
async function boot(){
 $('#menuBtn').innerHTML=ic('menu');$('#quickBtn').innerHTML=`${ic('plus')}<span class="hide-sm">Plan Meals</span>`;
 if(DEMO)document.documentElement.classList.add('is-demo');else await Store.init();
 let saved,readFail=false,corrupt=false;
 if(!DEMO&&Store.mode!=='unavailable'){try{saved=await Store.get('state')}catch(e){readFail=true}}

 if(!DEMO&&(Store.mode==='unavailable'||readFail)){await bootBlocked();Store.mode='memory';Store.temporary=true;saved=undefined}
 try{state=saved!==undefined?migrate(saved):sampleState()}catch(e){corrupt=true;try{const key='state_recovery_'+Date.now();if(!await Store.set(key,saved)||JSON.stringify(await Store.get(key))!==JSON.stringify(saved))throw new Error('Recovery copy failed')}catch(_){await bootBlocked();Store.mode='memory';Store.temporary=true}state=sampleState();state.settings.onboarded=true}
 if(DEMO)state.settings.onboarded=true;
 let fresh=false;if(!DEMO&&saved!==undefined&&!corrupt&&hasSamples()&&!userCount()&&state.water[today()]==null){const f=sampleState(),w=state.water;COLLECTIONS.forEach(k=>state[k]=f[k]);state.water={...f.water,...w};fresh=true}
 applyTheme();
 const h=(location.hash.match(/^#\/(\w+)/)||[])[1];
 go((h==='planner'?null:h)||state.ui.page||'home',{push:false,persist:false});
 document.documentElement.classList.remove('booting');requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('no-transition')));
 if((saved===undefined||corrupt||fresh)&&!DEMO&&!Store.temporary)await flush();
 if(corrupt)setTimeout(()=>toast('Your saved planner couldn’t be read, so a fresh one was started. The damaged copy was kept safely in this browser — message us on Etsy and we’ll help you recover it.','err'),600);
 if(!state.settings.onboarded)setTimeout(()=>onboarding(0),250);
 // Installable app when hosted online (service workers can't run from a downloaded file)
 if(HOSTED&&/^https?:$/.test(location.protocol)){
  const l=document.createElement('link');l.rel='manifest';l.href='manifest.webmanifest';document.head.appendChild(l);
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
 }
 setInterval(()=>{if(state.ui.page==='home'||state.ui.page==='today'){const d=today();if(d!==boot.day){boot.day=d;refresh()}}},60000);boot.day=today();
}
['week','month','year'].forEach(k=>ACTIONS['ov_'+k]=()=>{ovRange=k;pHome()});
function comboShow(all){const i=$('#fTitle'),b=$('#recipeDrop');if(!i||!b)return;const q=i.value.trim().toLowerCase(),exact=state.recipes.some(r=>r.title.toLowerCase()===q);
 const list=state.recipes.filter(r=>all||exact||!q||r.title.toLowerCase().includes(q)).slice(0,60);
 b.innerHTML=list.map(r=>`<li role="option" data-pick="${esc(r.title)}" class="${r.title.toLowerCase()===q?'sel':''}"><img src="${recipeImg(r)}" alt=""><span>${esc(r.title)}</span><small>${esc(r.category||'')}</small></li>`).join('')||'<li class="none">No matching recipe — your own text is kept</li>';
 b.hidden=false;i.setAttribute('aria-expanded','true')}
function comboHide(){const b=$('#recipeDrop');if(b){b.hidden=true;$('#fTitle')?.setAttribute('aria-expanded','false')}}
function comboPick(li){const i=$('#fTitle');i.value=li.dataset.pick;i.dispatchEvent(new Event('input',{bubbles:true}));comboHide()}
document.addEventListener('input',e=>{if(e.target.id==='fTitle'&&$('#recipeDrop')&&document.activeElement===e.target)comboShow()});
document.addEventListener('focusout',e=>{if(e.target.id==='fTitle')setTimeout(()=>{if(document.activeElement?.id!=='fTitle')comboHide()},120)});
document.addEventListener('mousedown',e=>{const li=e.target.closest('#recipeDrop [data-pick]');if(li){e.preventDefault();comboPick(li);return}
 if(e.target.id==='fTitle'&&$('#recipeDrop')){if($('#recipeDrop').hidden)setTimeout(()=>comboShow(true));return}
 if(e.target.closest('.combo-tg')){e.preventDefault();const b=$('#recipeDrop');if(b.hidden){$('#fTitle').focus();comboShow(true)}else comboHide();return}
 if(!e.target.closest('.combo'))comboHide()});
document.addEventListener('keydown',e=>{if(e.target.id!=='fTitle')return;const b=$('#recipeDrop');if(!b)return;const it=$$('[data-pick]',b);let k=it.findIndex(x=>x.classList.contains('on'));
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(b.hidden)comboShow(true);const n=$$('[data-pick]',b);if(!n.length)return;k=e.key==='ArrowDown'?(k+1)%n.length:(k<=0?n.length-1:k-1);n.forEach((x,j)=>x.classList.toggle('on',j===k));n[k].scrollIntoView({block:'nearest'})}
 else if(e.key==='Enter'&&!b.hidden&&k>=0){e.preventDefault();e.stopPropagation();comboPick(it[k])}
 else if(e.key==='Escape'&&!b.hidden){e.stopPropagation();comboHide()}},true);
const referenceScreen=$('#reference-screen');
let liveStarted=false;
function syncReferenceScreen(){
 const show=false;
 const wasVisible=!referenceScreen.hidden;
 referenceScreen.hidden=!show;
 document.documentElement.classList.toggle('reference-mode',show);
 if(show){
  document.title='Mediterranean Meal Planner';
  window.scrollTo(0,0);
 }else if(!liveStarted){
  liveStarted=true;
  window.scrollTo(0,0);
  boot();
 }else if(wasVisible&&state){
  document.title=`${PAGES.find(p=>p[0]===state.ui.page)[2]} · Mediterranean Meal Planner`;
  window.scrollTo(0,0);
  $('#main').focus({preventScroll:true});
 }
}
window.addEventListener('hashchange',syncReferenceScreen);
syncReferenceScreen();
