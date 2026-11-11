import sys,numpy as np
from PIL import ImageCms,Image,ImageDraw,ImageFilter,ImageFont,ImageChops
W,H=3000,2250;R=Image.Resampling.LANCZOS
BG,LAP,PH,VH,OUT=sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4]),sys.argv[5]
F=lambda f,s:ImageFont.truetype('/root/w/'+f,s)
def grad(w,h,c0,c1,horiz=False):
  a=np.linspace(0,1,w if horiz else h)[None,:,None] if horiz else np.linspace(0,1,h)[:,None,None]
  g=np.array(c0)*(1-a)+np.array(c1)*a;g=np.broadcast_to(g,(h,w,3))
  return Image.fromarray(g.astype('uint8'))
def rmask(w,h,r,ss=3):
  m=Image.new('L',(w*ss,h*ss));ImageDraw.Draw(m).rounded_rectangle((0,0,w*ss-1,h*ss-1),r*ss,fill=255);return m.resize((w,h),R)
def shadow(c,box,blur,alpha,r=0,ell=False):
  l=Image.new('L',(W,H));d=ImageDraw.Draw(l)
  (d.ellipse if ell else (lambda b,fill:d.rounded_rectangle(b,r,fill=fill)))(box,fill=int(255*alpha))
  l=l.filter(ImageFilter.GaussianBlur(blur));c.paste(Image.new('RGB',(W,H),(38,28,18)),mask=l)
def glare(img,mask,a0=34,ang=True):
  w,h=img.size;yy,xx=np.mgrid[0:h,0:w];t=(xx/w*0.75+yy/h*0.55)
  g=np.clip(1-np.abs(t-0.38)/0.22,0,1)**2*a0+np.clip(0.3-t,0,1)/0.3*a0*0.5
  gl=Image.fromarray(g.astype('uint8'));gl=ImageChops.multiply(gl,mask)
  img.paste(Image.new('RGB',(w,h),(255,250,240)),mask=gl)
# background
bg=Image.open(BG).convert('RGB');bg=bg.resize((3182,3182),R);y0=932
c=bg.crop((91,y0,3091,y0+H))
n=np.random.default_rng(7).normal(0,3.2,(H,W,1));c=Image.fromarray(np.clip(np.asarray(c).astype(float)+n,0,255).astype('uint8'))
# ---- laptop
LW=1780;LX=int(1460-LW/2);LY=500;rim=6;sb,tb,bb=26,30,36
sw=LW-2*rim-2*sb;scr=Image.open(LAP).convert('RGB');sh=round(sw*scr.height/scr.width);scr=scr.resize((sw,sh),R)
LH=sh+2*rim+tb+bb;LB=LY+LH
deck=50;lip=26;bw0=LW+24;bw1=LW+150
shadow(c,(LX-60,LB+deck+lip-30,LX+LW+190,LB+deck+lip+40),38,0.55,ell=True)
shadow(c,(LX-70,LB+deck+lip-6,LX+LW+80,LB+deck+lip+14),7,0.9,r=8)
shadow(c,(LX+140,LB+deck+lip-10,LX+LW+380,LB+deck+lip+120),70,0.28,ell=True)
lid=Image.new('RGB',(LW,LH));lid.paste(grad(LW,LH,(214,214,218),(150,150,156),True))
lid.paste(grad(LW,LH,(232,232,236),(176,176,182)),mask=Image.new('L',(LW,LH),110))
inner=Image.new('RGB',(LW-2*rim,LH-2*rim),(12,12,13));ImageDraw.Draw(inner).ellipse(((LW-2*rim)//2-5,12,(LW-2*rim)//2+5,22),fill=(34,38,44))
inner.paste(scr,(sb,tb));im=rmask(LW-2*rim,LH-2*rim,26);lid.paste(inner,(rim,rim),im)
lm=rmask(LW,LH,32);glare(lid,lm,30)
ImageDraw.Draw(lid).line((32,1,LW-32,1),fill=(245,245,247),width=2)
# deck + lip (front perspective)
d=ImageDraw.Draw(c)
x0b=1460-bw0/2;x1b=1460+bw0/2;x0f=1460-bw1/2;x1f=1460+bw1/2;yb=LB-6;yf=LB+deck
dk=Image.new('RGB',(W,H));dk.paste(grad(W,deck+8,(150,150,155),(214,214,219)),(0,yb))
pm=Image.new('L',(W,H));ImageDraw.Draw(pm).polygon([(x0b,yb),(x1b,yb),(x1f,yf),(x0f,yf)],fill=255)
c.paste(dk,mask=pm.filter(ImageFilter.GaussianBlur(0.8)))
lipim=grad(int(bw1),lip,(206,206,211),(128,128,134));lm2=rmask(int(bw1),lip,12)
c.paste(lipim,(int(x0f),yf),lm2);d.line((x0f+10,yf+1,x1f-10,yf+1),fill=(246,246,248),width=2)
d.chord((1460-80,yf-7,1460+80,yf+9),0,180,fill=(158,158,164));d.arc((1460-80,yf-7,1460+80,yf+9),0,180,fill=(120,120,126),width=2)
c.paste(lid,(LX,LY),lm)
d.rectangle((LX+40,LB-4,LX+LW-40,LB+2),fill=(46,46,50))
# ---- phone
ps=Image.open(PH).convert('RGB');sc=ps.width/393;sbh=round((852-VH)*sc)
disp=Image.new('RGB',(ps.width,round(852*sc)),ps.getpixel((ps.width//2,4)));disp.paste(ps,(0,sbh))
dd=ImageDraw.Draw(disp);cx=disp.width//2;k=sc
dd.rounded_rectangle((cx-62*k,11*k,cx+62*k,48*k),19*k,fill=(6,6,7))
f=F('in600.ttf',int(17*k));dd.text((51*k,30*k),'9:41',font=f,fill=(20,20,20),anchor='mm')
bx=disp.width-36*k;dd.rounded_rectangle((bx-13*k,24*k,bx+12*k,36*k),4*k,outline=(20,20,20),width=int(1.4*k));dd.rounded_rectangle((bx-11*k,26*k,bx+7*k,34*k),2.5*k,fill=(20,20,20));dd.rectangle((bx+13.5*k,28*k,bx+15*k,32*k),fill=(20,20,20))
wx=bx-30*k
for i,r in enumerate([11,7.5,4]):dd.arc((wx-r*k,33*k-r*k,wx+r*k,33*k+r*k),225,315,fill=(20,20,20),width=int(2.2*k)) if i<2 else dd.ellipse((wx-2*k,31*k,wx+2*k,35*k),fill=(20,20,20))
sx=wx-30*k
for i in range(4):dd.rounded_rectangle((sx+i*5*k,(35-3-i*2.3)*k,sx+i*5*k+3*k,35*k),k,fill=(20,20,20))
dd.rounded_rectangle((cx-67*k,disp.height-13*k,cx+67*k,disp.height-8*k),3*k,fill=(24,24,24))
PSW=432;dh=round(PSW*disp.height/disp.width);disp=disp.resize((PSW,dh),R)
pb=13;pr=7;PW=PSW+2*(pb+pr);PHh=dh+2*(pb+pr);PX=2190-PW//2;PB=LB+deck+lip+70;PY=PB-PHh
shadow(c,(PX-10,PB-30,PX+PW+60,PB+26),22,0.6,ell=True)
shadow(c,(PX+18,PB-8,PX+PW-6,PB+12),7,0.9,r=10)
shadow(c,(PX+30,PY+60,PX+PW+90,PB+30),55,0.42,r=60)
ph=Image.new('RGB',(PW,PHh));ph.paste(grad(PW,PHh,(206,200,192),(118,112,106),True))
ph.paste(grad(PW,PHh,(226,220,212),(150,144,138)),mask=Image.new('L',(PW,PHh),90))
inn=Image.new('RGB',(PW-2*pr,PHh-2*pr),(8,8,9));dm=rmask(PSW,dh,48);inn.paste(disp,(pb,pb),dm)
ph.paste(inn,(pr,pr),rmask(PW-2*pr,PHh-2*pr,62));pm2=rmask(PW,PHh,69);glare(ph,pm2,26)
ImageDraw.Draw(ph).arc((2,2,140,140),180,270,fill=(240,236,230),width=2)
for y,hh in [(170,46),(236,80),(330,80)]:ImageDraw.Draw(c).rounded_rectangle((PX-4,PY+y,PX+3,PY+y+hh),3,fill=(150,144,136))
c.paste(ph,(PX,PY),pm2)
# ---- wordmark
fk=F('fr600.ttf',72);t='KaelLabs';tx=2400-ImageDraw.Draw(c).textlength(t,font=fk);ty=52
kw=ImageDraw.Draw(c).textlength('K',font=fk)
gm=Image.new('L',(W,H));ImageDraw.Draw(gm).text((tx,ty),'K',font=fk,fill=255,anchor='lt')
gold=grad(W,H,(0,0,0),(0,0,0));g2=grad(int(kw)+4,120,(214,176,92),(160,118,44));gold.paste(g2,(int(tx),ty-8))
c.paste(gold,mask=gm);ImageDraw.Draw(c).text((tx+kw,ty),'aelLabs',font=fk,fill=(18,18,18),anchor='lt')
c=c.convert('RGB');q=92
while True:
  c.save(OUT,quality=q,optimize=True,progressive=True,subsampling=0,icc_profile=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes())
  import os
  if os.path.getsize(OUT)<990000 or q<70:break
  q-=2
print(OUT,os.path.getsize(OUT),q,'lap',LX,LY,LW,LB+deck+lip,'phone',PX,PY,PW,PB)
