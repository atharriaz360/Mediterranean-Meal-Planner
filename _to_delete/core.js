'use strict';
/* Mediterranean Meal Planner · v__VERSION__
   Single-file app. Your data is stored only in this browser (IndexedDB, with localStorage fallback). */
const APP={name:'Mediterranean Meal Planner',version:'__VERSION__',key:'mediterranean-meal-planner'};

/* ---------------- helpers ---------------- */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const pad=n=>String(n).padStart(2,'0');
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
/* Local-time dates (never toISOString — that shifts the day in many timezones) */
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
 spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
 alert:'<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
 pin:'<path d="M9 3.5h6l-1 5 3.5 3.5h-11L10 8.5z"/><path d="M12 12v8.5"/>',
 moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
 wand:'<path d="m4 20 11-11M14 4v3M17 7h3M18.5 3.5l-1.5 1.5M11 5.5 12.5 7"/>',
 fish:'<path d="M3 12c3-4 7-5.5 11-5.5 3 0 5 2 7 5.5-2 3.5-4 5.5-7 5.5-4 0-8-1.5-11-5.5z"/><path d="M3 12 1.5 8.5M3 12l-1.5 3.5"/><circle cx="16" cy="11" r=".8"/>',
 info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.5h.01"/>',
 more:'<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>'
};
const ic=(n,cls='')=>`<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${IC[n]||''}</svg>`;
const STAR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg>';

/* ---------------- domain constants ---------------- */
const SLOTS=['Breakfast','Lunch','Dinner','Snack'];
const SLOT_COLOR={Breakfast:'#F2B84B',Lunch:'#6E9B3A',Dinner:'#1D5673',Snack:'#D9683A'};
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
const ACCENTS={aegean:['#1D5673','#143F55','Aegean'],olive:['#56652A','#3F4B1D','Olive'],terracotta:['#B0502A','#873C1E','Terracotta'],lavender:['#5E5188','#443A66','Lavender'],charcoal:['#33434A','#222E33','Charcoal']};
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
 peppers:{bg:'#EADFCB',fill:'#F3EFE6',items:[[1,'pepper','#D9483B',0],[1,'pepper2','#F2B84B',0],[10,'leaf','#4E8A3A',9],[8,'square','#FBFAF4',8]],noScatterCenter:true}
};
const artCache={};
function art(kind){
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
 for(const [n,type,c,z] of a.items){for(let i=0;i<n;i++){const [x,y]=a.noScatterCenter&&n>1?pos(40,86):(n===1?[cx,cy]:pos(0,84));s+=(shape[type]||shape.circle)(+x.toFixed(1),+y.toFixed(1),z,c)}}
 const uri='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">${s}</svg>`);
 return artCache[kind]=uri;
}
function tile(label,color){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${color}" opacity=".18"/><text x="20" y="26" text-anchor="middle" font-family="Georgia,serif" font-size="17" font-weight="700" fill="${color}">${esc((label||'?').trim().charAt(0).toUpperCase())}</text></svg>`)}
const recipeImg=r=>r?.image||(r?.art?art(r.art):tile(r?.title,'#1D5673'));
function mealImg(m){const r=m.recipeId&&state.recipes.find(x=>x.id===m.recipeId);if(r)return recipeImg(r);return tile(m.title,SLOT_COLOR[m.slot]||'#1D5673')}

/* ---------------- storage: IndexedDB → localStorage → memory ---------------- */
const Store={
 mode:'memory',db:null,
 async init(){
  try{
   if(!('indexedDB' in window))throw 0;
   this.db=await new Promise((res,rej)=>{const t=setTimeout(()=>rej('timeout'),2500);const q=indexedDB.open('mediterranean-meal-planner-planner',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>{clearTimeout(t);res(q.result)};q.onerror=()=>{clearTimeout(t);rej(q.error)};q.onblocked=()=>{clearTimeout(t);rej('blocked')}});
   await this.idbSet('__probe',1);this.mode='idb';return;
  }catch(e){this.db=null}
  try{localStorage.setItem('__olv_probe','1');localStorage.removeItem('__olv_probe');this.mode='local'}catch(e){this.mode='memory'}
 },
 idbSet(k,v){return new Promise((res,rej)=>{const tx=this.db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=()=>res(true);tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error||new Error('aborted'))})},
 idbGet(k){return new Promise((res,rej)=>{const tx=this.db.transaction('kv','readonly');const q=tx.objectStore('kv').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})},
 async get(k){
  if(this.mode==='idb'){const v=await this.idbGet(k);if(v!==undefined)return v;}
  try{const raw=localStorage.getItem('mediterranean-meal-planner:'+k);if(raw)return JSON.parse(raw)}catch(e){}
  return undefined;
 },
 async set(k,v){
  if(this.mode==='idb'){await this.idbSet(k,v);return true}
  if(this.mode==='local'){localStorage.setItem('mediterranean-meal-planner:'+k,JSON.stringify(v));return true}
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
