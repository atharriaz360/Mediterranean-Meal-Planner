import sys,os,json,io
from PIL import Image,ImageCms
from playwright.sync_api import sync_playwright
D='/home/claude/w/';C='file://'+D+'cap/';OUT=D+'out/';os.makedirs(OUT,exist_ok=True)
F='file://'+D+'fonts/package/files/eb-garamond-latin-'
R=json.load(open(D+'rects.json'))
CSS=f"""
@font-face{{font-family:G;src:url({F}500-normal.woff2);font-weight:500}}
@font-face{{font-family:G;src:url({F}600-normal.woff2);font-weight:600}}
@font-face{{font-family:G;src:url({F}500-italic.woff2);font-weight:500;font-style:italic}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:3000px;height:2250px;overflow:hidden;position:relative;font-family:Inter;color:#2a1c13;-webkit-font-smoothing:antialiased}}
.bg{{position:absolute;inset:0;background-repeat:no-repeat}}
.dk h1{{color:#f6efe3}} .dk h1 em{{color:#e5c58c}} .dk .sub{{color:#e6dac8}} .dk .ck b{{color:#f6efe3}} .dk .ck span{{color:#d6c8b4}} .dk .eb{{color:#dcb867}} .dk .ck i{{background:rgba(232,238,224,.92)}}
.bg.f{{transform:scaleX(-1)}}
.wash{{position:absolute;inset:0}}
.a{{position:absolute}}
h1{{font-family:G;font-weight:500;font-size:150px;line-height:1.02;letter-spacing:-1px;color:#2a1c13}}
h1 em,.em{{font-style:italic;color:#9b4a2b}}
.eb{{font:600 30px Inter;letter-spacing:.3em;color:#a8742f;text-transform:uppercase;margin-bottom:34px}}
.sub{{font:400 46px/1.38 Inter;color:#6b5646;margin-top:40px}}
.ck{{display:flex;gap:34px;margin-top:62px;align-items:flex-start}}
.ck i{{flex:none;width:80px;height:80px;border-radius:50%;background:#e8eee0;border:2px solid #cddbc3;display:grid;place-items:center}}
.ck b{{display:block;font:600 52px/1.15 Inter;color:#2a1c13;letter-spacing:-.3px}}
.ck span{{display:block;font:400 41px/1.35 Inter;color:#6d5a4b;margin-top:8px}}
.lap{{position:absolute}}
.lid{{position:relative;background:#0b0b0c;border-radius:var(--r) var(--r) calc(var(--r)*.35) calc(var(--r)*.35);box-shadow:inset 0 0 0 var(--rim) #b8b8bd,inset 0 0 0 calc(var(--rim)*2) #2a2a2d,0 0 0 1px #6d6d72}}
.lid .s{{position:relative;overflow:hidden;border-radius:calc(var(--r)*.3)}}
.lid .s img{{display:block;width:100%}}
.s:after{{content:'';position:absolute;inset:0;background:linear-gradient(118deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,.04) 30%,rgba(255,255,255,0) 46%)}}
.cam{{position:absolute;left:50%;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:#1f2229;box-shadow:inset 0 0 0 3px #15171c}}
.hinge{{height:var(--hg);margin:0 1.5%;background:linear-gradient(#3a3a3e,#151517);border-radius:0 0 6px 6px}}
.base{{position:relative;height:var(--bh);margin:0 -5.5%;background:linear-gradient(180deg,#f2f2f4 0%,#d6d6da 30%,#b3b3b8 70%,#8b8b90 100%);border-radius:4px 4px calc(var(--bh)*1.2) calc(var(--bh)*1.2)/4px 4px var(--bh) var(--bh);box-shadow:0 2px 0 #6f6f74 inset,0 -1px 0 #fff inset}}
.base:before{{content:'';position:absolute;left:43%;right:43%;top:0;height:42%;background:linear-gradient(#a8a8ad,#c9c9ce);border-radius:0 0 14px 14px}}
.sh{{position:absolute;border-radius:50%;filter:blur(var(--b));background:rgba(46,30,16,var(--o))}}
.ph{{position:absolute;border-radius:var(--r);padding:var(--t);background:linear-gradient(135deg,#e7e2da,#9e978e 22%,#d9d3ca 50%,#8a847b 78%,#d0cac1);box-shadow:inset 0 0 0 2px rgba(255,255,255,.5)}}
.ph .bz{{background:#050506;border-radius:calc(var(--r) - var(--t));padding:var(--z)}}
.ph .sc{{position:relative;overflow:hidden;border-radius:calc(var(--r) - var(--t) - var(--z));background:#f8f3e9}}
.ph .sc img{{display:block;width:100%}}
.sb{{position:relative;display:flex;align-items:center;justify-content:space-between;padding:0 9%}}
.sb b{{font:600 var(--fs) Inter;color:#111}}
.isl{{position:absolute;left:50%;top:22%;width:32%;height:52%;transform:translateX(-50%);background:#000;border-radius:999px}}
.hi{{display:flex;justify-content:center;align-items:center;background:#f8f3e9}}
.hi i{{width:36%;height:22%;border-radius:9px;background:#151515}}
.btn{{position:absolute;width:7px;border-radius:3px;background:linear-gradient(90deg,#7c766d,#cfc9c0)}}
.tb{{position:absolute;border-radius:var(--r);padding:var(--t);background:linear-gradient(135deg,#e2e2e5,#9a9a9f 30%,#d8d8dc 60%,#8e8e93);}}
.tb .bz{{background:#060607;border-radius:calc(var(--r) - var(--t));padding:var(--z);position:relative}}
.tb .sc{{position:relative;overflow:hidden;border-radius:calc(var(--r)*.45)}}
.tb .sc img{{display:block;width:100%}}
.card{{position:absolute;background:rgba(255,252,246,.94);border-radius:30px;box-shadow:0 30px 60px -20px rgba(70,45,20,.28),0 2px 0 rgba(255,255,255,.8) inset;border:1px solid rgba(160,120,80,.14)}}
.co{{position:absolute;background:#fffaf2;border-radius:26px;padding:30px 38px;box-shadow:0 24px 50px -16px rgba(70,45,20,.32);border:1px solid rgba(160,120,80,.16)}}
.co b{{display:block;font:500 52px/1.1 G;color:#9b4a2b}}
.co span{{display:block;font:400 36px/1.35 Inter;color:#5d4a3c;margin-top:8px}}
"""
TICK='<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3e6b46" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
def bg(flip=False,x=-420,wash='',sz=4000,y=-995,hx=-960,f='bg3.jpg'):
  return f'<div class="bg{" f" if flip else ""}" style="background-image:url(file://{D}{f});background-size:{sz}px auto;background-position:{hx}px {y}px"></div><div class="wash" style="background:{wash}"></div>'
def shadow(x,y,w,h,b=30,o=.35):return f'<div class="sh" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;--b:{b}px;--o:{o}"></div>'
def lap(img,x,y,W):
  side=W*.017;top=W*.026;bot=W*.022;sw=W-2*side;sh=sw*1964/3024;H=sh+top+bot;bh=W*.024
  s=shadow(x-W*.02,y+H+bh*.4,W*1.14-W*.06,bh*1.6,b=W*.012,o=.55)+shadow(x+W*.05,y+H+bh*.2,W*.95,bh*3,b=W*.035,o=.28)
  return s+f'''<div class="lap" style="left:{x}px;top:{y}px;width:{W}px;--r:{W*.036}px;--rim:{max(3,W*.0016)}px;--hg:{W*.006}px;--bh:{bh}px">
<div class="lid" style="padding:{top}px {side}px {bot}px"><i class="cam" style="top:{top*.38}px"></i><div class="s"><img src="{C}{img}.png"></div></div>
<div class="hinge"></div><div class="base"></div></div>''',(x+side,y+top,sw/1512)
def phone(img,x,y,w,shadowo=.42,cw=393,ch=772):
  t=w*.014;z=w*.034;sw=w-2*t-2*z;k=sw/cw;sbh=59*k;hib=21*k if cw==393 else 0;H=sbh+ch*k+hib+2*(t+z)
  s=shadow(x+w*.08,y+H-w*.06,w*.95,w*.13,b=w*.05,o=shadowo)+shadow(x+w*.2,y+w*.3,w*.9,H*.95,b=w*.12,o=.22)
  btns=''.join(f'<div class="btn" style="left:{x-5}px;top:{y+H*a}px;height:{H*b}px"></div>' for a,b in [(.17,.05),(.25,.085),(.35,.085)])+f'<div class="btn" style="left:{x+w-2}px;top:{y+H*.27}px;height:{H*.13}px"></div>'
  sig='<svg width="%d" height="%d" viewBox="0 0 70 22"><g fill="#111"><rect x="0" y="14" width="5" height="8" rx="1.3"/><rect x="7" y="10" width="5" height="12" rx="1.3"/><rect x="14" y="6" width="5" height="16" rx="1.3"/><rect x="21" y="2" width="5" height="20" rx="1.3"/><path d="M38 9a12 12 0 0 1 16 0l-2 2.3a9 9 0 0 0-12 0z M41.5 13a7 7 0 0 1 9 0L46 18z"/><rect x="58" y="5" width="22" height="12" rx="3.5" fill="none" stroke="#111" stroke-width="1.6"/></g><rect x="60.5" y="7.5" width="15" height="7" rx="1.8" fill="#111"/></svg>'%(70*k*.95,22*k*.95)
  return s+btns+f'''<div class="ph" style="left:{x}px;top:{y}px;width:{w}px;--r:{w*.165}px;--t:{t}px;--z:{z}px"><div class="bz"><div class="sc">
<div class="sb" style="height:{sbh}px;background:#f4eadc;--fs:{17*k}px"><b>9:41</b><i class="isl"></i>{sig}</div>
<img src="{C}{img}.png">'''+(f'<div class="hi" style="height:{hib}px"><i></i></div>' if hib else f'<i style="position:absolute;left:34%;right:34%;bottom:{8*k}px;height:{5*k}px;border-radius:9px;background:#151515"></i>')+'</div></div></div>'
def tab(img,x,y,W,ar=820/1180):
  t=W*.006;z=W*.024;sw=W-2*t-2*z;H=sw*ar+2*t+2*z
  s=shadow(x+W*.04,y+H-W*.02,W*.92,W*.05,b=W*.025,o=.45)+shadow(x+W*.1,y+W*.1,W*.9,H*.9,b=W*.06,o=.2)
  return s+f'''<div class="tb" style="left:{x}px;top:{y}px;width:{W}px;--r:{W*.045}px;--t:{t}px;--z:{z}px"><div class="bz"><i class="cam" style="top:{z*.35}px;width:10px;height:10px;margin-left:-5px"></i><div class="sc s"><img src="{C}{img}.png"></div></div></div>'''
def text(x,y,w,eb,h,sub,checks=(),hs=150,cl=''):
  c=''.join(f'<div class="ck"><i>{TICK}</i><div><b>{a}</b><span>{b}</span></div></div>' for a,b in checks)
  return f'<div class="a {cl}" style="left:{x}px;top:{y}px;width:{w}px">{f"<div class=eb>{eb}</div>" if eb else ""}<h1 style="font-size:{hs}px">{h}</h1><div class="sub">{sub}</div>{c}</div>'
def callout(bx,by,bw,title,desc,px,py,side):
  ax=bx+(bw if side=='l' else 0);ay=by+70
  return f'<div class="co" style="left:{bx}px;top:{by}px;width:{bw}px"><b>{title}</b><span>{desc}</span></div>',(ax,ay,px,py)
def lines(L):
  p=''.join(f'<path d="M{a} {b} L{(a+c)/2} {b} L{(a+c)/2} {d} L{c} {d}" fill="none" stroke="#b8892f" stroke-width="4"/><circle cx="{c}" cy="{d}" r="15" fill="#b8892f" stroke="#fffaf2" stroke-width="6"/>' for a,b,c,d in L)
  return f'<svg class="a" style="left:0;top:0" width="3000" height="2250">{p}</svg>'
LW='linear-gradient(90deg,rgba(250,244,234,.55) 0%,rgba(250,244,234,.25) 42%,rgba(250,244,234,0) 60%)'
RW='linear-gradient(270deg,rgba(250,244,234,.55) 0%,rgba(250,244,234,.25) 42%,rgba(250,244,234,0) 60%)'
S={}
# 01 hero
def hero(bgh,dark=False,lx=300,lw=2060,px=2130,pw=560):
  l,_=lap('lap-home',lx,600,lw);ink='#f6efe3' if dark else '#2a1c13';rest='#f6efe3' if dark else '#000';sub='#e6dac8' if dark else '#6b5646'
  return bgh+f'''
<div class="a" style="left:600px;top:96px;font:700 58px Inter;letter-spacing:.07em;color:{ink}">PLAN THE WEEK · <span style="color:{'#e0b95f' if dark else '#b07d22'}">SHOP IN ONE TAP</span></div>
<div class="a" style="right:600px;top:102px;font:600 50px G;color:{rest};letter-spacing:.5px"><span style="color:#b8892f">K</span>aelLabs</div>
<div class="a {'dk' if dark else ''}" style="left:0;right:0;top:205px;text-align:center"><h1 style="font-size:176px;letter-spacing:-2px">Mediterranean <em>Meal Planner</em></h1></div>
<div class="a" style="left:0;right:0;top:418px;text-align:center;font:400 54px Inter;color:{sub}">Week plan · grocery list · recipes · pantry</div>
'''+l+phone('ph-shopping',px,870,pw)+'''
<div class="a" style="left:0;right:0;top:2140px;text-align:center"><span style="display:inline-block;font:600 46px Inter;letter-spacing:.16em;color:#fff;background:#2f5a3a;padding:20px 64px;border-radius:999px;box-shadow:0 14px 30px -10px rgba(30,60,35,.5)">INSTANT DOWNLOAD</span></div>'''
LEAF='<svg width="150" height="40" viewBox="0 0 150 40"><g fill="none" stroke="#a07a3a" stroke-width="2.4"><path d="M20 20 H62"/><path d="M88 20 H130"/></g><g fill="#7e8f5a"><path d="M75 6c6 6 6 18 0 28c-6-10-6-22 0-28z"/><path d="M75 20c8-8 16-9 22-6c-6 8-14 9-22 6z" opacity=".8"/><path d="M75 20c-8-8-16-9-22-6c6 8 14 9 22 6z" opacity=".8"/></g></svg>'
def heroD():
  l,_=lap('lap-home',560,640,1880)
  return bg(f='bgsea.jpg',sz=3000,hx=0,y=0)+f'''
<div class="a" style="left:600px;top:92px;font:700 54px Inter;letter-spacing:.07em;color:#2a1c13">PLAN THE WEEK · <span style="color:#a8741c">SHOP IN ONE TAP</span></div>
<div class="a" style="right:600px;top:98px;font:600 50px G;color:#000"><span style="color:#b8892f">K</span>aelLabs</div>
<div class="a" style="left:0;right:0;top:175px;text-align:center;color:#3a2618">
<div style="font:500 italic 140px/1 G;color:#3a2618">Mediterranean</div>
<div style="font:500 168px/1 G;letter-spacing:.06em;margin-top:6px;color:#2a1c13">MEAL PLANNER</div>
<div style="margin-top:22px">{LEAF}</div>
<div style="font:500 40px Inter;letter-spacing:.32em;color:#5a4232;margin-top:10px">WEEK PLAN · GROCERY LIST · RECIPES · PANTRY</div></div>
'''+l+phone('ph-shopping',2180,940,470)+'''
<div class="a" style="left:0;right:0;top:2140px;text-align:center"><span style="display:inline-block;font:600 46px Inter;letter-spacing:.16em;color:#fff;background:#2f5a3a;padding:20px 64px;border-radius:999px;box-shadow:0 14px 30px -10px rgba(30,60,35,.5)">INSTANT DOWNLOAD</span></div>'''
S['01-hero-D']=heroD()
LEAFW='<svg width="120" height="70" viewBox="0 0 120 70"><g fill="#fffaf0"><path d="M60 66 C58 44 66 22 86 6 C88 26 78 46 60 66z"/><path d="M60 66 C50 50 40 40 22 36 C30 52 44 62 60 66z" opacity=".9"/></g></svg>'
def heroE():
  l,_=lap('lap-home',640,700,1720)
  sh='text-shadow:0 3px 24px rgba(90,45,10,.45),0 1px 2px rgba(90,45,10,.35)'
  return bg(f='bgsun.jpg',sz=3000,hx=0,y=0,wash='linear-gradient(180deg,rgba(40,30,25,.10),rgba(40,30,25,0) 20%)')+f'''
<div class="a" style="left:600px;top:84px;font:700 54px Inter;letter-spacing:.07em;color:#fffaf0;{sh}">PLAN THE WEEK · <span style="color:#f2c66a">SHOP IN ONE TAP</span></div>
<div class="a" style="right:600px;top:90px;font:600 50px G;color:#000"><span style="color:#b8892f">K</span>aelLabs</div>
<div class="a" style="left:0;right:0;top:150px;text-align:center;color:#fffaf0;{sh}">
<div style="height:70px">{LEAFW}</div>
<div style="font:500 196px/1 G;letter-spacing:.01em;margin-top:-4px">Mediterranean</div>
<div style="display:flex;align-items:center;justify-content:center;gap:18px;margin-top:22px"><i style="width:420px;height:3px;background:#fffaf0;opacity:.9"></i><i style="width:16px;height:16px;background:#fffaf0;transform:rotate(45deg)"></i><i style="width:420px;height:3px;background:#fffaf0;opacity:.9"></i></div>
<div style="font:500 60px Inter;letter-spacing:.34em;margin-top:22px">MEAL PLANNER</div></div>
'''+l+phone('ph-shopping',2190,975,470,shadowo=.5)+'''
<div class="a" style="left:0;right:0;top:2140px;text-align:center"><span style="display:inline-block;font:600 46px Inter;letter-spacing:.16em;color:#fff;background:#2f5a3a;padding:20px 64px;border-radius:999px;box-shadow:0 14px 30px -10px rgba(30,60,35,.5)">INSTANT DOWNLOAD</span></div>'''
S['01-hero-E']=heroE()
def heroF():
  l,_=lap('lap-home_s',640,600,1880)
  return bg(f='bgsun.jpg',sz=3000,hx=0,y=0,wash='linear-gradient(180deg,rgba(250,244,234,.62) 0%,rgba(250,244,234,.38) 16%,rgba(250,244,234,0) 30%)')+'''
<div class="a" style="left:600px;top:96px;font:700 58px Inter;letter-spacing:.07em;color:#2a1c13">PLAN THE WEEK · <span style="color:#a8741c">SHOP IN ONE TAP</span></div>
<div class="a" style="right:600px;top:102px;font:600 50px G;color:#000"><span style="color:#b8892f">K</span>aelLabs</div>
<div class="a" style="left:0;right:0;top:205px;text-align:center"><h1 style="font-size:176px;letter-spacing:-2px;text-shadow:0 0 40px rgba(250,244,234,.6)">Mediterranean <em>Meal Planner</em></h1></div>
<div class="a" style="left:0;right:0;top:418px;text-align:center;font:500 54px Inter;color:#4a3526;text-shadow:0 0 24px rgba(250,244,234,.8)">Week plan · grocery list · recipes · pantry</div>
'''+l+phone('ph402-week_s',2280,850,500,shadowo=.5,cw=402,ch=815)+'''
<div class="a" style="left:0;right:0;top:2140px;text-align:center"><span style="display:inline-block;font:600 46px Inter;letter-spacing:.16em;color:#fff;background:#2f5a3a;padding:20px 64px;border-radius:999px;box-shadow:0 14px 30px -10px rgba(30,60,35,.5)">INSTANT DOWNLOAD</span></div>'''
S['01-hero-F']=heroF()
S['01-hero-A']=hero(bg(sz=3600,hx=-300,y=-700,wash='linear-gradient(180deg,rgba(250,244,234,.5),rgba(250,244,234,0) 30%)'))
S['01-hero-B']=hero(bg(f='bg5.jpg',sz=3002,hx=0,y=-560,wash='linear-gradient(180deg,rgba(250,244,234,.6),rgba(250,244,234,0) 28%),linear-gradient(90deg,rgba(255,196,120,.10),rgba(255,196,120,0) 40%)'),lx=640,lw=1880,px=2280,pw=500)
S['01-hero-C']=hero(bg(f='bg1.jpg',sz=3600,hx=-300,y=-880,wash='linear-gradient(180deg,rgba(10,25,18,.35),rgba(10,25,18,0) 30%)'),True)
# 02 grid
cards=[('lap-week','Week Plan','Breakfast to snacks, all 7 days'),('lap-shopping','Shopping List','Built from your week, by aisle'),('lap-recipes','Recipes','Starter recipes + your own'),('lap-pantry','Pantry','Items and use-by dates'),('lap-balance','Balance','Food groups across your week'),('lap-goals','Goals & Water','Goals, water log, journal')]
g=''
for i,(im,t,d) in enumerate(cards):
  cx=150+(i%3)*(870+45);cy=470+(i//3)*(800);g+=f'<div class="card" style="left:{cx}px;top:{cy}px;width:870px;height:750px;padding:26px"><div class="s" style="border-radius:16px;overflow:hidden;border:1px solid rgba(90,60,30,.15);position:relative"><img src="{C}{im}.png" style="width:100%;display:block"></div><div style="display:flex;gap:24px;align-items:baseline;margin:30px 10px 0"><span style="font:600 44px G;color:#b8892f">0{i+1}</span><div><div style="font:500 60px/1 G">{t}</div><div style="font:400 34px Inter;color:#6d5a4b;margin-top:12px">{d}</div></div></div></div>'
S['02-what-you-get']=bg(x=-500,wash='rgba(250,244,234,.18)')+f'<div class="a" style="left:0;right:0;top:120px;text-align:center"><h1 style="font-size:150px">Six tools. <em>One calm kitchen.</em></h1><div class="sub" style="margin-top:26px">Every section, shown exactly as it appears in the planner.</div></div>'+g
# 03 mobile
S['03-on-your-phone']=bg(x=-200,wash=LW)+text(150,430,1250,'On your phone','Your planner, <em>in your pocket</em>','Open it on your phone at the store or in the kitchen.',[('Today at a glance','Meals, tasks and water for the day.'),('Tick off what you ate','Each meal marks as eaten.'),('Easy tab bar','Home, Week, Recipes, Shop, More.')])+phone('ph-recipes',1600,420,620)+phone('ph-today',2250,640,620)
# 04 week plan bleed left
l,(sx,sy,k)=lap('lap-week',-600,520,2320)
bsl=R['week']['Build shopping list'];px=sx+(bsl[0]+bsl[2]/2)*k;py=sy+(bsl[1]-14)*k
co,ln=callout(60,170,720,'Build shopping list','Turns your planned meals into a grocery list.',px,py,'r')
S['04-week-plan']=bg(flip=True,x=-500,wash=RW)+l+co+f'<svg class="a" style="left:0;top:0" width="3000" height="2250"><path d="M{px} {390} L{px} {py-18}" stroke="#b8892f" stroke-width="4"/><circle cx="{px}" cy="{py}" r="16" fill="#b8892f" stroke="#fffaf2" stroke-width="6"/></svg>'+text(1860,470,1060,'Week plan','Plan every meal, <em>all week</em>','Breakfast, lunch, dinner and snacks on one board.',[('Copy last week','Reuse a week you liked in one click.'),('Daily totals','Calories per day from recipes or your entries.'),('Print your week','A clean printout for the fridge.')],hs=140)
# 05 shopping right bleed
l,_=lap('lap-shopping',1520,560,2320)
S['05-shopping-list']=bg(wash=LW)+l+text(150,470,1280,'Shopping list','Your week becomes <em>a grocery list</em>','One tap fills it from your planned meals.',[('Grouped by aisle','Produce, herbs, bakery and more.'),('Tick off as you shop','See what is bought and what is left.'),('Add your own items','With quantity and aisle.')],hs=140)
# 06 overview
LX,LY,LW2=640,520,1720
l,(sx,sy,k)=lap('lap-home',LX,LY,LW2)
h=R['home'];P=lambda key,dx=0,dy=0:(sx+(h[key][0]+dx)*k,sy+(h[key][1]+h[key][3]/2+dy)*k)
items=[('l',560,'Days planned','How much of your week is planned.',P('Days planned')),('l',1010,'To buy & expiring','Shopping and pantry counts.',P('To buy')),('l',1460,'Meal overview','Planned vs eaten this week.',P('Meal Overview')),
('r',560,'Good evening','Your name and today’s meals.',P('Good evening',h['Good evening'][2])),('r',1010,'Top recipes','Your most planned dishes.',(sx+1180*k,sy+545*k)),('r',1460,'Upcoming prep','Tasks from your prep list.',P('Upcoming Prep',200))]
cs='';L=[]
for sd,yy,t,d,(px,py) in items:
  bx=90 if sd=='l' else 2450;c,ln=callout(bx,yy,460,t,d,px,py,sd);cs+=c;L.append(ln)
S['06-overview']=bg(x=-500,wash='rgba(250,244,234,.15)')+f'<div class="a" style="left:0;right:0;top:110px;text-align:center"><h1 style="font-size:150px">Everything on <em>one dashboard</em></h1><div class="sub" style="margin-top:24px">Your week, shopping, pantry and recipes at a glance.</div></div>'+l+lines(L)+cs
# 07 recipes green kitchen
S['07-recipes']=bg(f='bg1.jpg',sz=3300,hx=-300,y=-795,wash='linear-gradient(90deg,rgba(8,22,15,.45),rgba(8,22,15,0) 55%)')+tab('tabp-recipe',1620,250,1130,1180/820)+text(150,300,1300,'In your kitchen','Cook straight from <em>your recipe</em>','Ingredients to tick off and numbered steps.',[('Tick off ingredients','Check items as you cook.'),('Plan it or shop it','One tap to your week or your list.'),('Print any recipe','A clean copy for the counter.')],hs=140,cl='dk')
# 09 every screen
l,_=lap('lap-home',560,560,1880)
S['09-every-screen']=bg(x=-500,wash='rgba(250,244,234,.15)')+f'<div class="a" style="left:0;right:0;top:120px;text-align:center"><h1 style="font-size:150px">One planner. <em>Every screen.</em></h1><div class="sub" style="margin-top:24px">Computer, tablet or phone. The Start Here guide shows you how.</div></div>'+l+tab('tab-recipes',150,1150,1000)+phone('ph-week',2330,880,500)
# 10 pantry shelf
l,_=lap('lap-pantry',80,700,1820)
S['10-pantry-prep']=bg(f='bg5.jpg',flip=True,sz=3002,hx=0,y=-500,wash='linear-gradient(180deg,rgba(250,244,234,.35),rgba(250,244,234,0) 35%)')+l+text(1960,230,960,'Pantry & prep','Know what is <em>in your kitchen</em>','Use-by dates and one-tap restock.',(),hs=118)
# 11 balance
S['11-balance']=bg(x=-200,wash=LW)+text(150,470,1080,'Balance','See your week’s <em>balance</em>','Logged food groups next to general Mediterranean-style patterns.',[('Food groups','Vegetables, legumes, fish, olive oil and more.'),('Goals & water','Set goals and log glasses.'),('Journal','Notes, ideas and favourite tweaks.')],hs=140)+tab('tab-balance',1300,600,1580)+'<div class="a" style="left:150px;top:2150px;font:400 30px Inter;color:#8a7766">Planning aid only.</div>'
# 12 private
l,_=lap('lap-settings',110,640,1700)
S['12-private-offline']=bg(flip=True,x=-500,wash=RW)+l+phone('ph-settings',1480,1010,460)+text(2080,470,830,'Private by design','Private. Offline. <em>Yours.</em>','Runs in your browser. No account, no sign-up.',[('Saves on your device','Your data stays in this browser.'),('Back up & restore','Download a full backup any time.'),('Light & dark mode','Switch any time in Settings.')],hs=124)
# 13 final
fl=[('Mediterranean-Meal-Planner.html','The planner app. Opens in your browser.'),('Mediterranean-Meal-Planner-Start-Here.pdf','Setup guide for computer, phone and tablet.'),('LICENSE.txt','Personal use only.')]
rows=''.join(f'<div style="display:flex;gap:30px;align-items:center;background:#fffaf2;border:1px solid rgba(160,120,80,.18);border-radius:24px;padding:30px 40px;margin-top:26px;box-shadow:0 16px 34px -18px rgba(70,45,20,.3)"><i style="flex:none;width:66px;height:66px;border-radius:50%;background:#e8eee0;display:grid;place-items:center">{TICK}</i><div><b style="font:600 42px Inter">{a}</b><div style="font:400 34px Inter;color:#6d5a4b;margin-top:6px">{b}</div></div></div>' for a,b in fl)
S['13-digital-download']=bg(x=-500,wash='rgba(250,244,234,.35)')+f'''<div class="a" style="left:0;right:0;top:300px;text-align:center"><div style="font:500 italic 90px G;color:#9b4a2b">Mediterranean Meal Planner</div>
<div style="font:600 104px G;letter-spacing:.05em;margin-top:60px;color:#2a1c13">DIGITAL DOWNLOAD · NOTHING IS SHIPPED</div>
<div style="width:900px;height:3px;background:linear-gradient(90deg,transparent,#b8892f,transparent);margin:70px auto 0"></div></div>
<div class="a" style="left:850px;width:1300px;top:1020px"><div style="text-align:center;font:600 34px Inter;letter-spacing:.3em;color:#a8742f">INSIDE YOUR ZIP</div>{rows}</div>'''
only=sys.argv[1:]
icc=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--allow-file-access-from-files'])
  p=b.new_page(viewport={'width':3000,'height':2250},device_scale_factor=1)
  for n,body in S.items():
    if only and not any(o in n for o in only):continue
    open(D+'tpl.html','w').write(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{body}</body></html>')
    p.goto('file://'+D+'tpl.html');p.wait_for_load_state('networkidle');p.evaluate('document.fonts.ready');p.wait_for_timeout(300)
    im=Image.open(io.BytesIO(p.screenshot(type='png'))).convert('RGB');q=93
    while True:
      bb=io.BytesIO();im.save(bb,'JPEG',quality=q,optimize=True,progressive=True,subsampling=0,icc_profile=icc)
      if bb.tell()<980000 or q<=70:break
      q-=3
    open(OUT+n+'.jpg','wb').write(bb.getvalue());print(n,bb.tell(),q)
  b.close()
