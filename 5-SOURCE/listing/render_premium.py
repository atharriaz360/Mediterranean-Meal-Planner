"""Photographic device asset compositions, replacing the initial flat CSS frames."""
import asyncio, json, subprocess, shutil, hashlib, sys, struct
from pathlib import Path
from PIL import Image
import render_listing as r
r.OUT=r.ROOT/'6-ETSY-LISTING/images/2026-11-01-premium'
r.CAP=r.OUT/'sources'
ASSETS=r.ROOT/'5-SOURCE/listing/assets'
r.CSS+='''
/* All hardware pixels below are photographic raster assets, not drawn borders. */
.device{background:none;border:0;border-radius:0;padding:0;box-shadow:none;overflow:visible;filter:drop-shadow(12px 32px 23px #0003)}
.device>.hardware{position:absolute;max-width:none;object-fit:fill;z-index:1;pointer-events:none}
.device>.display{position:absolute;overflow:hidden;z-index:2;background:#f7f1e5}
.device>.display>img{width:100%;height:100%;object-fit:fill;display:block}
.device>.display:after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,#ffffff09,transparent 35%,transparent 80%,#ffffff04)}
.tablet,.wide{width:1580px;height:1209px;top:780px;left:650px}
.wide{width:1680px;height:1286px;top:780px;left:660px}
.tablet>.hardware,.wide>.hardware{width:109.09%;height:115.64%;left:-4.242%;top:-7.611%}
.tablet>.display,.wide>.display{left:4.09%;top:5.29%;width:92.12%;height:89.64%;border-radius:1.4%}
.phone{width:480px;height:997px;top:1115px;left:1850px}
.phone>.hardware{width:161.514%;height:118.61%;left:-30.915%;top:-9.266%}
.phone>.display{left:5.52%;top:2.39%;width:88.8%;height:95.2%;border-radius:11.2% / 5.2%}
.phone>.display>img{position:absolute;top:6%;height:94%;object-fit:fill}
.phone>.island{position:absolute;max-width:none;object-fit:fill;z-index:3;width:161.514%;height:118.61%;left:-30.915%;top:-9.266%;clip-path:inset(10.68% 41.21% 85.98% 41.50% round 30px)}
.phone:after{display:none}
.duo .phone{width:570px;height:1184px;top:825px;left:850px}
.duo .phone.second{top:895px;left:1580px}
header{top:115px}h1{font-size:143px;line-height:1.04;margin:29px 0}.badge{font-size:54px;letter-spacing:2px;padding:19px 35px}.sub{font-size:46px}
.hero header h1{font-size:165px}.hero .foot{display:none}.hero .tablet{top:805px}.hero .phone{top:1080px}
'''
def photo_device(name,kind='phone',extra=''):
 asset=ASSETS/('iphone-15-pro-photo.png' if kind=='phone' else 'ipad-pro-photo.png')
 photo=f'<img class="hardware" src="{r.uri(asset)}">'
 screen=f'<div class="display"><img src="{r.uri(r.CAP/(name+".png"))}"></div>'
 island=f'<img class="island" src="{r.uri(asset)}">' if kind=='phone' else ''
 return f'<div class="device {kind} {extra}">{photo}{screen}{island}</div>'
r.device=photo_device
orig_slide=r.slide
def premium_slide(*args,**kwargs):
 filename,content=orig_slide(*args,**kwargs)
 if filename=='01-hero.jpg':content=content.replace('class="slide dark ', 'class="slide dark hero ')
 return filename,content
r.slide=premium_slide
async def main():
 if "--export-only" not in sys.argv:
  await r.main()
 # Raw dashboard: direct 1500x1125 viewport capture at 2x pixel density.
 raw=r.OUT/'02-dashboard-unedited.png'
 profile='/System/Library/ColorSync/Profiles/sRGB Profile.icc'
 jpgs=sorted(r.OUT.glob('*.jpg'))
 # Encoding only: add an explicit sRGB profile. No retouching of the raw PNG.
 subprocess.run(['sips','--embedProfile',profile,'-s','format','jpeg','-s','formatOptions','88',str(r.OUT/raw.name),'--out',str(r.OUT/'02-dashboard-unedited.jpg')],check=True,stdout=subprocess.DEVNULL)
 jpgs=sorted(r.OUT.glob('*.jpg'))
 report=[]
 for p in jpgs:
  subprocess.run(['sips','--embedProfile',profile,str(p)],check=True,stdout=subprocess.DEVNULL)
  quality=86
  while p.stat().st_size>=1000000 and quality>=65:
   subprocess.run(['sips','-s','formatOptions',str(quality),'-s','format','jpeg',str(p),'--out',str(p)],check=True,stdout=subprocess.DEVNULL)
   quality-=4
  # Insert standard JPEG APP2 ICC metadata without changing image pixels.
  data=p.read_bytes()
  if b'ICC_PROFILE\0' not in data:
   payload=b'ICC_PROFILE\0'+bytes([1,1])+Path(profile).read_bytes()
   p.write_bytes(data[:2]+b'\xff\xe2'+struct.pack('>H',len(payload)+2)+payload+data[2:])
  with Image.open(p) as im:
   assert im.size==(3000,2250),(p.name,im.size)
   assert im.format=='JPEG'
   assert im.info.get('icc_profile'),p.name
   icc=im.info['icc_profile']
   assert b'sRGB' in icc,p.name
  assert p.stat().st_size<1000000,p.name
  report.append({'file':p.name,'bytes':p.stat().st_size,'size':[3000,2250],'format':'JPEG','icc':'sRGB'})
 assert len(report)==11
 with Image.open(raw) as im:
  assert im.size==(3000,2250)
 (r.OUT/'file-checks.json').write_text(json.dumps({'files':report,'raw_dashboard_sha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'raw_dashboard_direct_capture':True,'dashboard_viewport':[1500,1125],'dashboard_device_scale_factor':2},indent=2))
 print('VERIFIED: 11 JPGs, 3000x2250, embedded sRGB, each <1,000,000 bytes; raw dashboard is a direct 1500x1125 capture at 2x.',flush=True)
asyncio.run(main())
