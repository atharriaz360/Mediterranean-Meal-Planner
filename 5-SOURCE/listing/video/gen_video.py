import json,re
src=open('/home/claude/mmp/5-SOURCE/listing/render_set.py').read()
src=src.replace("R=json.load(open(D+'rects.json'))","import collections;R=collections.defaultdict(lambda:collections.defaultdict(lambda:[0,0,0,0]))")
g={};exec(src[:src.index('def hero(')],g)
CSS,lap,phone=g['CSS'],g['lap'],g['phone']
BX=json.load(open('/home/claude/w/boxes.json'))
C='file:///home/claude/w/cap/'
LAPI=[f'lap-week{i}' for i in range(8)]+['lap-shop','lap-home']
PHI=['ph-week','ph-shop0','ph-shop1','ph-shop2','ph-recipes']
LX,LY,LW=640,600,1880
PX,PY,PW=2280,850,500
lh,(sx,sy,k)=lap(LAPI[0],LX,LY,LW)
lh=lh.replace(f'<img src="{C}{LAPI[0]}.png">','<div class="stk">'+''.join(f'<img id="L{i}" src="{C}{n}.png" style="{"position:relative" if i==0 else "position:absolute;left:0;top:0"};opacity:{1 if i==0 else 0}">' for i,n in enumerate(LAPI))+'<i id="GL" class="glint"></i></div>',1)
ph=phone(PHI[0],PX,PY,PW,shadowo=.5,cw=402,ch=815)
psw=PW-2*PW*.014-2*PW*.034;pk=psw/402
taps=''.join(f'<i class="tap" id="T{n}" style="left:{BX[n][0]*pk}px;top:{BX[n][1]*pk}px"></i>' for n in ['tab_shop','tick0','tick1','tab_rec'])
ph=ph.replace(f'<img src="{C}{PHI[0]}.png">','<div class="stk ps">'+''.join(f'<img id="P{i}" src="{C}{n}.png" style="{"position:relative" if i==0 else "position:absolute;left:0;top:0"};opacity:{1 if i==0 else 0}">' for i,n in enumerate(PHI))+taps+'</div>',1)
lc=(LX+LW/2,LY+700);pc=(PX+PW/2,PY+520)
html=f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS}
html,body{{width:2160px;height:1080px;overflow:hidden;margin:0}}
body{{position:relative;background:#e9dfcf;width:2160px;height:1080px}}
#stage{{position:absolute;left:0;top:0;width:3000px;height:2250px;transform-origin:0 0}}
#plate{{position:absolute;left:-1100px;top:-300px;width:5200px;height:2850px;background:url(file:///home/claude/w/plate_ext.jpg) 0 0/5200px 2850px}}
#wash{{position:absolute;left:-1100px;top:-300px;width:5200px;height:2850px;background:linear-gradient(180deg,rgba(250,244,234,.6) 300px,rgba(250,244,234,0) 930px),linear-gradient(90deg,rgba(255,196,120,.10) 1100px,rgba(255,196,120,0) 2300px)}}
.dev{{position:absolute;left:0;top:0;width:3000px;height:2250px;transform-origin:0 0;will-change:transform,opacity}}
.stk{{position:relative;overflow:hidden}}.stk img{{display:block;width:100%}}
.tap{{position:absolute;width:0;height:0}}.glint{{position:absolute;inset:0;background:linear-gradient(105deg,rgba(255,255,255,0) 38%,rgba(255,255,255,.35) 50%,rgba(255,255,255,0) 62%);pointer-events:none}}
.tap:before{{content:'';position:absolute;left:-46px;top:-46px;width:92px;height:92px;border-radius:50%;background:rgba(255,255,255,.55);box-shadow:0 0 0 3px rgba(168,116,47,.9),0 6px 18px rgba(60,30,10,.35);transform:scale(var(--s,0));opacity:var(--o,0)}}
#hero{{position:absolute;left:0;top:0;width:3000px;height:2250px;background:url(file:///home/claude/mmp/6-ETSY-LISTING/images/01-hero.jpg) 0 0/3000px 2250px;opacity:0;-webkit-mask-image:linear-gradient(90deg,transparent,#000 90px,#000 2910px,transparent),linear-gradient(180deg,#000,#000);-webkit-mask-composite:source-in}}
#cap{{position:absolute;left:648px;width:864px;top:58px;text-align:center;color:#2a1c13}}
#cap .st{{font:600 22px Inter;letter-spacing:.34em;color:#a8742f;text-indent:.34em}}
#cap .ln{{font:500 70px/1.04 G;margin-top:14px;letter-spacing:-.3px;text-shadow:0 0 30px rgba(250,244,234,.9)}}
#cap .ln em{{font-style:italic;color:#9b4a2b}}
#cap .ul{{height:3px;width:0;margin:16px auto 0;background:linear-gradient(90deg,rgba(168,116,47,0),#a8742f,rgba(168,116,47,0))}}
#mk{{position:absolute;right:46px;top:34px;font:600 30px G;color:#000}}#mk b{{color:#b8892f;font-weight:600}}
</style></head><body>
<div id="stage"><div id="plate"></div><div id="wash"></div>
<div class="dev" id="LAP">{lh}</div>
<div class="dev" id="PH">{ph}</div>
<div id="hero"></div></div>
<div id="cap"><div class="st" id="st"></div><div class="ln" id="ln"></div><div class="ul" id="ul"></div></div>
<div id="mk"><b>K</b>aelLabs</div>
<script>
const LC=[{lc[0]},{lc[1]}],PC=[{pc[0]},{pc[1]}];
const cl=x=>Math.min(1,Math.max(0,x)),E=x=>{{x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}},O=x=>1-Math.pow(1-cl(x),3),lerp=(a,b,p)=>a+(b-a)*p;
const $=id=>document.getElementById(id);
function key(t,K){{if(t<=K[0][0])return K[0][1];for(let i=1;i<K.length;i++)if(t<=K[i][0]){{const [t0,a]=K[i-1],[t1,b]=K[i];const p=E((t-t0)/(t1-t0));return a.map((v,j)=>lerp(v,b[j],p))}}return K[K.length-1][1]}}
const CAM=[[0,[.585,1580,1150]],[2.55,[.62,1580,1120]],[3.6,[.66,2030,1246]],[8.9,[.68,2030,1246]],[9.9,[.62,1580,1120]],[11.2,[.62,1580,1120]],[12.3,[.62,1640,1120]],[13.7,[.48,1500,1125]]];
const LK=[[0,[0,70,.975,0,1]],[0.9,[0,0,1,0,1]],[2.55,[0,0,1,0,1]],[3.55,[-2700,0,1,0,1]],[9.0,[-2700,0,1,0,1]],[9.95,[0,0,1,0,1]]];
const PK=[[0,[1800,0,1.2,-12,1]],[2.55,[1800,0,1.2,-12,1]],[3.6,[-500,0,1.2,0,1]],[8.9,[-500,0,1.2,0,1]],[9.9,[-950,40,1,0,1]],[11.25,[-950,40,1,0,1]],[12.3,[0,0,1,0,1]]];
const SEQ=[['01 · PLAN','Your whole week, <em>planned.</em>',-1,2.6],['02 · SHOP','One tap to <em>your list.</em>',3.55,5.3],['03 · SHOP','Tick it off <em>as you shop.</em>',5.3,7.05],['04 · COOK','Your recipes, <em>one tap away.</em>',7.05,8.95],['05 · ANYWHERE','Phone, tablet <em>&amp; desktop.</em>',9.6,12.6]];
function stack(pref,n,times,dur,slide){{for(let i=1;i<n;i++){{const p=times[i-1]==null?0:E((window.T-times[i-1])/dur);const el=$(pref+i);el.style.opacity=p;if(slide)el.style.transform=`translateX(${{(1-p)*28}}%)`}}}}
function tap(id,t0){{const p=(window.T-t0)/.5,el=$(id);if(p<0||p>1){{el.style.setProperty('--o',0);return}}el.style.setProperty('--s',.35+.9*O(p));el.style.setProperty('--o',p<.25?p/.25:1-(p-.25)/.75)}}
window.R=t=>{{window.T=t;
 const [s,cx,cy]=key(t,CAM);$('stage').style.transform=`translate(${{1080-cx*s}}px,${{540-cy*s}}px) scale(${{s}})`;
 const [lx,ly,ls,lr,lo]=key(t,LK);$('LAP').style.transform=`perspective(3000px) translate(${{lx}}px,${{ly}}px) translate(${{LC[0]}}px,${{LC[1]}}px) rotateX(${{lr}}deg) scale(${{ls}}) translate(${{-LC[0]}}px,${{-LC[1]}}px)`;$('LAP').style.opacity=lo;
 const [px,py,ps,pr,po]=key(t,PK);$('PH').style.transform=`perspective(2400px) translate(${{px}}px,${{py}}px) translate(${{PC[0]}}px,${{PC[1]}}px) rotateY(${{pr}}deg) scale(${{ps}}) translate(${{-PC[0]}}px,${{-PC[1]}}px)`;$('PH').style.opacity=po;
 // laptop screens: week fill, then shop at 9.4, home at 10.6
 const lt=[.3,.5,.7,.9,1.1,1.3,1.5,9.55,10.8];for(let i=1;i<10;i++){{const p=E((t-lt[i-1])/(i<8?.16:.4));$('L'+i).style.opacity=p}}
 // phone: week -> shop0 (tap shop 4.3) -> shop1 (tick 5.6) -> shop2 (tick 6.3) -> recipes (tap 7.2) -> back to week for hero 11.4
 tap('Ttab_shop',4.25);tap('Ttick0',5.6);tap('Ttick1',6.3);tap('Ttab_rec',7.25);
 const pt=[4.45,5.75,6.45,7.45];for(let i=1;i<5;i++){{const p=E((t-pt[i-1])/(i==1||i==4?.32:.14));const back=E((t-11.35)/.35);$('P'+i).style.opacity=p*(1-back);$('P'+i).style.transform=(i==1||i==4)?`translateX(${{(1-p)*30}}%)`:''}}
 $('P0').style.opacity=1;
 // captions
 let cur=null;for(const c of SEQ)if(t>=c[2]-.05&&t<c[3])cur=c;const cap=$('cap');
 if(cur){{const a=O((t-cur[2])/.45),b=1-E((t-(cur[3]-.3))/.3);if($('ln').dataset.k!==cur[1]){{$('ln').innerHTML=cur[1];$('st').textContent=cur[0];$('ln').dataset.k=cur[1]}}cap.style.opacity=Math.min(a,b);cap.style.transform=`translateY(${{(1-a)*18}}px)`;$('ul').style.width=(E((t-cur[2]-.2)/.6)*220)+'px'}}else cap.style.opacity=0;
 // final hero
 const h=E((t-13.45)/.75);$('hero').style.opacity=h;$('mk').style.opacity=1-E((t-12.9)/.6);const gp=(t-.15)/1.3;$('GL').style.transform=`translateX(${{-130+260*E(gp)}}%)`;$('GL').style.opacity=gp>0&&gp<1?1:0;
}};
R(0);
</script></body></html>'''
open('/home/claude/w/video.html','w').write(html)
print('ok',sx,sy,k,pk)
