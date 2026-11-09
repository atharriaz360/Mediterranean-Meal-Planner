"""Hero on canva-bg/Premium Food Flat Lay Background.jpg (dark olive, 3000x2250). Real captures, code-drawn devices (straight bezels), one resample per screen.
Run from project root: python3 5-SOURCE/hero-flatlay/render.py"""
import io, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'5-SOURCE'; CAP=SRC/'listing-hero-v2/captures'
OUT=ROOT/'6-ETSY-LISTING/images/hero-flatlay.jpg'; QA=SRC/'hero-flatlay'
LOGO=Path.home()/'mnt/KLabs/kaellabs-lockup-on-dark.svg'
if len(sys.argv)>1: LOGO=Path(sys.argv[1])
W,H=3000,2250; SS=4
F_SERIF='/usr/share/fonts/opentype/urw-base35/C059-Bold.otf'
F_SANS_B='/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf'
F_SANS='/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf'

def rr_mask(w,h,r):
    m=Image.new('L',(w*SS,h*SS),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w*SS-1,h*SS-1),r*SS,fill=255)
    return m.resize((w,h),Image.LANCZOS)

def vgrad(w,h,c1,c2):
    a=np.linspace(0,1,h)[:,None,None]; g=np.array(c1)*(1-a)+np.array(c2)*a
    return Image.fromarray(np.repeat(g,w,1).astype('uint8'),'RGB')

def device(screen,frame_px,bezel,r_screen,frame_c,island=None,camera=None):
    sw,sh=screen.size; bw,bh=sw+2*bezel,sh+2*bezel; fw,fh=bw+2*frame_px,bh+2*frame_px
    r_b=r_screen+bezel; r_f=r_b+frame_px
    dev=Image.new('RGBA',(fw,fh),(0,0,0,0))
    frame=vgrad(fw,fh,*frame_c).convert('RGBA'); dev.paste(frame,(0,0),rr_mask(fw,fh,r_f))
    # thin highlight ring on frame edge
    ring=Image.new('RGBA',(fw,fh),(255,255,255,0)); hm=rr_mask(fw,fh,r_f); inner=Image.new('L',(fw,fh),0)
    inner.paste(rr_mask(fw-4,fh-4,r_f-2),(2,2)); ring.putalpha(ImageChops.subtract(hm,inner).point(lambda v:v*0.55))
    dev.alpha_composite(ring)
    dev.paste(Image.new('RGBA',(bw,bh),(10,10,11,255)),(frame_px,frame_px),rr_mask(bw,bh,r_b))
    scr=screen.convert('RGBA'); sm=rr_mask(sw,sh,r_screen)
    # subtle glass reflection, top-left diagonal
    x=np.linspace(0,1,sw)[None,:]; y=np.linspace(0,1,sh)[:,None]; d=np.clip(1-(x+y)/0.9,0,1)
    gl=Image.new('RGBA',(sw,sh),(255,255,255,0)); gl.putalpha(Image.fromarray((d*16).astype('uint8')))
    scr.alpha_composite(gl)
    o=frame_px+bezel; dev.paste(scr,(o,o),sm)
    dr=ImageDraw.Draw(dev)
    if island:
        iw,ih,it=island; big=Image.new('L',(iw*SS,ih*SS),0); ImageDraw.Draw(big).rounded_rectangle((0,0,iw*SS-1,ih*SS-1),ih*SS//2,fill=255)
        dev.paste(Image.new('RGBA',(iw,ih),(0,0,0,255)),(o+(sw-iw)//2,o+it),big.resize((iw,ih),Image.LANCZOS))
    if camera:
        cx=fw//2; cy=frame_px+bezel//2; dr.ellipse((cx-camera,cy-camera,cx+camera,cy+camera),fill=(28,31,38,255))
    return dev

def shadow(canvas,dev,xy,blur,off,alpha):
    a=dev.split()[3].point(lambda v:int(v*alpha)); pad=blur*3
    s=Image.new('L',(dev.width+2*pad,dev.height+2*pad),0); s.paste(a,(pad,pad)); s=s.filter(ImageFilter.GaussianBlur(blur))
    blk=Image.new('RGBA',s.size,(0,0,0,0)); blk.putalpha(s)
    canvas.alpha_composite(blk,(xy[0]-pad+off[0],xy[1]-pad+off[1]))

def phone_screen(sw,sh):
    cap=Image.open(CAP/'shopping-phone.png').convert('RGB')   # 786x1704 = 393x852 pt @2x
    k=sw/393; sb=round(54*k)                                   # status-bar safe area
    body=cap.crop((0,0,786,round(1704-54*2))).resize((sw,sh-sb),Image.LANCZOS)   # single resample
    scr=Image.new('RGB',(sw,sh),cap.getpixel((5,5))); scr.paste(body,(0,sb))
    d=ImageDraw.Draw(scr); ink=(20,20,20)
    d.text((round(46*k),round(29*k)),'9:41',font=ImageFont.truetype(F_SANS_B,round(17*k)),fill=ink,anchor='mm')
    bx=sw-round(42*k); by=round(23*k)                            # battery
    d.rounded_rectangle((bx,by,bx+round(25*k),by+round(12*k)),round(3.5*k),outline=ink,width=max(2,round(1.2*k)))
    d.rounded_rectangle((bx+round(2.4*k),by+round(2.4*k),bx+round(20*k),by+round(9.6*k)),round(2*k),fill=ink)
    for i in range(4):                                         # signal
        x0=sw-round((100-i*5.5)*k); hgt=round((4+i*2.6)*k)
        d.rounded_rectangle((x0,by+round(12*k)-hgt,x0+round(3.6*k),by+round(12*k)),1,fill=ink)
    return scr

def text_c(d,cx,y,s,font,fill,track=0):
    if not track: d.text((cx,y),s,font=font,fill=fill,anchor='mt'); return
    w=sum(font.getlength(c) for c in s)+track*(len(s)-1); x=cx-w/2
    for c in s: d.text((x,y),c,font=font,fill=fill); x+=font.getlength(c)+track

def main():
    c=Image.open(SRC/'canva-bg/Premium Food Flat Lay Background.jpg').convert('RGB')   # already 3000x2250, no scaling
    # gentle warm vignette for depth
    x=np.linspace(-1,1,W)[None,:]; y=np.linspace(-1,1,H)[:,None]; v=1-0.10*np.clip((x**2*0.8+y**2)-0.25,0,1)
    arr=np.asarray(c).astype(float)*v[...,None]
    rng=np.random.default_rng(7); arr+=rng.normal(0,2.2,(H,W,1))   # fine film grain (background only)
    canvas=Image.fromarray(np.clip(arr,0,255).astype('uint8')).convert('RGBA')

    # iPad: real Week Plan capture 2800x2100 -> screen 1434x1076 (one LANCZOS)
    tab_s=Image.open(CAP/'week-before.png').convert('RGB').resize((1434,1076),Image.LANCZOS)
    ipad=device(tab_s,frame_px=7,bezel=46,r_screen=24,frame_c=((92,92,96),(48,48,52)),camera=7)
    # iPhone: real Shopping capture -> screen 614x1330
    ph_s=phone_screen(614,1330)
    iph=device(ph_s,frame_px=9,bezel=17,r_screen=86,frame_c=((92,92,96),(48,48,52)),island=(196,58,17))
    IP=(630,600); PH=(2370-iph.width,700)
    for dev,xy in ((ipad,IP),(iph,PH)):
        shadow(canvas,dev,xy,46,(34,44),0.55); shadow(canvas,dev,xy,10,(8,10),0.45)
        canvas.alpha_composite(dev,xy)

    cx=1500
    def headline(dd,col):
        text_c(dd,cx,190,'A REAL APP  •  NOT A PDF',ImageFont.truetype(F_SANS_B,44),col or (200,168,98),track=7)
        tf=ImageFont.truetype(F_SERIF,112); p1,p2='Mediterranean ','Meal Planner'
        x0=cx-tf.getlength(p1+p2)/2
        dd.text((x0,262),p1,font=tf,fill=col or (230,204,138))          # light gold accent
        dd.text((x0+tf.getlength(p1),262),p2,font=tf,fill=col or (245,240,232))
        text_c(dd,cx,410,'Build your grocery list in one tap',ImageFont.truetype(F_SANS,64),col or (226,220,206))
        text_c(dd,cx,2128,'ONE-TIME PURCHASE  •  WORKS OFFLINE & ONLINE',ImageFont.truetype(F_SANS_B,46),col or (200,168,98),track=5)
    sl=Image.new('L',(W,H),0); headline(ImageDraw.Draw(sl),255)
    sh2=Image.new('RGBA',(W,H),(0,0,0,0)); sh2.putalpha(sl.filter(ImageFilter.GaussianBlur(14)).point(lambda v:int(v*0.75)))
    canvas.alpha_composite(sh2,(0,5))
    d=ImageDraw.Draw(canvas)
    headline(d,None)
    d.text((640,1806),'Sample data shown',font=ImageFont.truetype(F_SANS,34),fill=(196,190,172))

    # logo: right edge 2360, top 46, height 93, no box, soft shadow only
    png=subprocess.run(['convert','-background','none','-density','600',str(LOGO),'png:-'],capture_output=True,check=True).stdout
    lg=Image.open(io.BytesIO(png)).convert('RGBA'); lw=round(lg.width*93/lg.height); lg=lg.resize((lw,93),Image.LANCZOS)
    LX,LY=2360-lw,46
    sh=Image.new('RGBA',(lw+80,93+80),(0,0,0,0)); a=Image.new('L',sh.size,0); a.paste(lg.split()[3],(40,43))
    sh.putalpha(a.filter(ImageFilter.GaussianBlur(7)).point(lambda v:int(v*0.55))); canvas.alpha_composite(sh,(LX-40,LY-40))
    canvas.alpha_composite(lg,(LX,LY))

    rgb=canvas.convert('RGB')
    for q in (92,90,88,86,84,82,80):
        b=io.BytesIO(); rgb.save(b,'JPEG',quality=q,subsampling=0 if q>=88 else 2,optimize=True,progressive=True)
        if b.tell()<1_000_000: break
    OUT.write_bytes(b.getvalue())
    print('out',OUT,b.tell(),'q',q,'logo',(LX,LY,lw,93),'ipad',IP,ipad.size,'iphone',PH,iph.size)
    # QA crops + small contact
    sq=rgb.crop((375,0,2625,2250)); p45=rgb.crop((600,0,2400,2250))
    th=[rgb.resize((400,300),Image.LANCZOS),sq.resize((300,300),Image.LANCZOS),p45.resize((240,300),Image.LANCZOS)]
    cs=Image.new('RGB',(960,300),'white'); x=0
    for t in th: cs.paste(t,(x,0)); x+=t.width+10
    cs.save(QA/'qa-contact.jpg',quality=70); rgb.crop((1650,750,2400,1400)).save(QA/'qa-zoom.jpg',quality=80)
main()
