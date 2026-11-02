import ast,json,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
sys.path.insert(0,str(ROOT/'5-SOURCE/listing'))
import render_listing as base
css=base.CSS
for node in ast.parse((ROOT/'5-SOURCE/listing/render_premium.py').read_text()).body:
 if isinstance(node,ast.AugAssign) and isinstance(node.target,ast.Attribute) and node.target.attr=='CSS':css+=ast.literal_eval(node.value)
report=json.loads((HERE/'capture-report.json').read_text())
def uri(p):return p.as_uri()
def device(name,kind='phone',second=False):
 asset=ROOT/'5-SOURCE/listing/assets'/('iphone-15-pro-photo.png' if kind=='phone' else 'ipad-pro-photo.png')
 return f'<div class="device {kind} {"second" if second else ""}"><img class="hardware" src="{uri(asset)}"><div class="display"><img src="{uri(HERE/"captures"/(name+".png"))}"></div>'+ (f'<img class="island" src="{uri(asset)}">' if kind=='phone' else '')+'</div>'
def scene(n,title,eyebrow,bg,content,dark=False):
 photo=ROOT/'5-SOURCE/canva-bg'/bg
 return f'<section id="s{n}" class="scene {"dark" if dark else ""}"><img class="bg" src="{uri(photo)}"><div class="wash"></div><header><div class="eyebrow">{eyebrow}</div><h1>{title}</h1></header>{content}</section>'
# CSS reuses the photographic device compositing from the final image set.
css+='''html,body{width:1440px;height:1080px;overflow:hidden;background:#10291c}.stage{width:3000px;height:2250px;position:relative;transform:scale(.48);transform-origin:0 0}.scene{position:absolute;inset:0;opacity:0;overflow:hidden}.scene header{left:320px;width:2360px;top:150px}.scene h1{font-size:170px;line-height:1.05;margin-top:32px}.scene h1 em{font-weight:400;color:#99722b}.scene.dark h1 em{color:#efd293}.scene .eyebrow{font-size:42px;letter-spacing:7px}.scene .tablet{left:420px;top:650px;width:1750px;height:1339px}.scene .phone{left:2090px;top:850px;width:470px;height:976px}.scene .wide{left:650px;top:650px;width:1700px;height:1301px}.scene .duophone{position:absolute;inset:0}.duophone .phone{left:820px;top:650px;width:590px;height:1225px}.duophone .phone.second{left:1600px;top:735px}.scene .subline{position:absolute;top:2030px;left:330px;width:2340px;text-align:center;font-size:52px;color:#254c39}.scene.dark .subline{color:#fff5dd}.mess{position:absolute;padding:50px 60px;background:#fff6df;color:#183e2d;font-size:58px;box-shadow:0 25px 60px #0004;border-radius:16px;max-width:900px}.mess.m1{left:460px;top:1060px;rotate:-7deg}.mess.m2{left:1660px;top:1100px;rotate:6deg}.mess.m3{left:1030px;top:1530px;rotate:-3deg}.cursor{position:absolute;z-index:9;filter:drop-shadow(0 5px 3px #0005);width:65px;height:85px}.tap{position:absolute;z-index:8;border:8px solid #dcb45c;border-radius:50%;width:120px;height:120px;pointer-events:none}.grid{left:450px;top:670px;width:2100px;grid-template-columns:repeat(4,1fr);gap:20px}.tile img{height:310px}.tile span{font-size:32px;padding:9px}.count{position:absolute;top:375px;left:0;right:0;text-align:center;font:400 190px Georgia;color:#fff5dd}.tools h1{font-size:125px}.grain{position:absolute;inset:0;pointer-events:none;opacity:.018;mix-blend-mode:soft-light;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Cpath fill='%23fff' filter='url(%23n)' d='M0 0h160v160H0z'/%3E%3C/svg%3E")}.end img{width:3000px;height:2250px;object-fit:cover;position:absolute;inset:0}.end{z-index:10}
'''
body=scene(0,'Still planning <em>everywhere?</em>','MEDITERRANEAN MEAL PLANNER','1.jpg','<div class="mess m1">Meals in notes</div><div class="mess m2">Recipes in tabs</div><div class="mess m3">Another shopping list</div>',True)
# Before and after states below were captured after real UI actions.
builddev=device('week-before','wide').replace('<div class="display">','<div class="display" id="action-display">')
builddev=builddev.replace('</div></div>',f'<img id="built" src="{uri(HERE/"captures/shopping-built.png")}" style="position:absolute;inset:0;width:100%;height:100%;opacity:0"><img id="ticked" src="{uri(HERE/"captures/shopping-ticked.png")}" style="position:absolute;inset:0;width:100%;height:100%;opacity:0"></div></div>')
cursor='<svg id="cursor" class="cursor" viewBox="0 0 30 40"><path d="M3 2V32l8-8 7 14 6-3-7-13 11-1Z" fill="white" stroke="#173e2b" stroke-width="2"/></svg><div id="tap" class="tap"></div>'
body+=scene(1,'Your grocery list. <em>One tap.</em>','FROM YOUR REAL WEEK PLAN','2.jpg',builddev+cursor+'<div class="subline" id="action-note">Choose meals → Build list → Tick as you shop</div>')
body+=scene(2,'Recipes, <em>all together.</em>','YOUR COOKING COLLECTION','4.jpg',device('recipes','tablet')+device('recipes-phone'))
body+=scene(3,'Know what’s <em>already there.</em>','PANTRY + USE-BY DATES','5.jpg',device('pantry','tablet')+device('pantry-phone'))
body+=scene(4,'Track your <em>daily habits.</em>','BALANCE · GOALS · WATER','3.jpg',device('balance','tablet')+device('goals-phone')+'<div class="subline">Planning aid · Not medical advice</div>')
body+=scene(5,'Your plans. <em>Your device.</em>','DARK MODE · BACKUP & RESTORE','6.jpg',device('settings-dark','tablet')+device('shopping-phone')+'<div class="subline">Local browser storage · Back up regularly</div>',True)
labels=[('home','Home'),('week-before','Week plan'),('home','Today*'),('calendar','Calendar'),('recipes','Recipes'),('shopping-ticked','Shopping'),('pantry','Pantry'),('prep','Prep'),('balance','Balance'),('goals','Goals & water'),('journal','Journal'),('settings','Settings')]
# Today is captured separately; no substituted UI in the overview.
labels[2]=('today','Today')
grid='<div class="grid">'+''.join(f'<div class="tile"><img src="{uri(HERE/"captures"/(n+".png"))}"><span>{l}</span></div>' for n,l in labels)+'</div>'
body+=scene(6,'One app. <em>Your daily tools.</em>','12 REAL APP VIEWS','6.jpg',grid,True)
hero=ROOT/'6-ETSY-LISTING/images/2026-11-01-premium/01-hero.jpg'
body+=f'<section id="s7" class="scene end"><img id="end-hero" src="{uri(hero)}"></section>'
box=report['build_button_bbox'];check=report['checkbox_bbox']
# Wide tablet display bounds in stage pixels: normalized photographic aperture.
def point(b):return [650+1700*.0409+(b['x']+b['width']/2)/1400*(1700*.9212),650+1301*.0529+(b['y']+b['height']/2)/1050*(1301*.8964)]
coords=json.dumps({'build':point(box),'tick':point(check)})
js='''const P=COORDS;const el=id=>document.getElementById(id),cl=x=>Math.min(1,Math.max(0,x));const ease=x=>1-Math.pow(1-cl(x),3);const smooth=x=>{x=cl(x);return x*x*(3-2*x)};
const starts=[0,1.65,5.3,6.8,8.3,9.8,11.1,12.3];
window.R=function(t){
 for(let i=0;i<8;i++){const a=starts[i],end=i<7?starts[i+1]+.35:15;const incoming=i===0?1:smooth((t-a)/.35),outgoing=i===7?1:1-smooth((t-end+.35)/.35);const s=el('s'+i);s.style.opacity=t<a||t>end?0:incoming*outgoing;
  const local=Math.max(0,t-a);const bg=s.querySelector('.bg');if(bg)bg.style.transform=`scale(${1+Math.min(local,5)*.01})`;
  for(const [j,sel] of [[0,'.eyebrow'],[1,'h1']]){const q=s.querySelector(sel);if(q){const k=i===0?1:ease((local-.08-j*.12)/.42);q.style.opacity=k;q.style.transform=`translateY(${40*(1-k)}px)`}}
  s.querySelectorAll('.device').forEach((d,j)=>{const k=ease((local-.12-j*.1)/.45);d.style.translate=j===1?`${(1-k)*350}px 0`:`0 ${(1-k)*100}px`});
 }
 document.querySelectorAll('.mess').forEach((e,i)=>{const k=ease((t-i*.12)/.45),bye=smooth((t-1.05)/.65);e.style.opacity=k*(1-bye);e.style.translate=`0 ${(1-k)*120+bye*80}px`;e.style.filter=`blur(${bye*12}px)`});
 el('built').style.opacity=smooth((t-2.95)/.22);el('ticked').style.opacity=smooth((t-4.15)/.18);
 let px=P.build[0],py=P.build[1];const travel=smooth((t-3.4)/.65);px+=(P.tick[0]-px)*travel;py+=(P.tick[1]-py)*travel;
 const zoom=1+.15*smooth((t-2.9)/1.3);const action=document.querySelector('#s1 .wide');action.style.transformOrigin='50% 50%';action.style.transform=`scale(${zoom})`;px=1500+(px-1500)*zoom;py=1300.5+(py-1300.5)*zoom;const cur=el('cursor');cur.style.left=px+'px';cur.style.top=py+'px';cur.style.opacity=t>2.25&&t<4.55?1:0;
 const q=t<3.4?(t-2.83)/.4:(t-4.05)/.4;const tap=el('tap');tap.style.left=(px-60)+'px';tap.style.top=(py-60)+'px';tap.style.scale=.5+cl(q)*1.0;tap.style.opacity=q>=0&&q<=1?1-q:0;
 el('end-hero').style.transform=`scale(${1.06-.06*ease((t-12.3)/.8)})`;
 if(t>=13.1){el('s7').style.opacity=1;el('end-hero').style.transform='scale(1)'}
};R(0);'''.replace('COORDS',coords)
(HERE/'video.html').write_text(f'<!doctype html><meta charset="utf-8"><style>{css}</style><div class="stage">{body}<div class="grain"></div></div><script>{js}</script>')
print('VERIFIED: video.html generated.')
