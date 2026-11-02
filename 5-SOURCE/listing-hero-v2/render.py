import asyncio,json,subprocess,sys,os,shutil,hashlib,struct
from pathlib import Path
from playwright.async_api import async_playwright
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
OUT=ROOT/'6-ETSY-LISTING';VIDEO=OUT/'Mediterranean-Meal-Planner-Listing-Video-v2.mp4'
FRAMES=Path('/tmp/kaellabs-meal-video-v2');PRE=HERE/'preview'
FFMPEG=Path('/tmp/kaellabs-video-deps/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1')
if not FFMPEG.exists():
 candidates=list(Path('/tmp/kaellabs-video-deps/imageio_ffmpeg/binaries').glob('ffmpeg-*'))
 if candidates:FFMPEG=candidates[0]
FPS=30;DURATION=14.8;N=444
async def render(preview=False):
 FRAMES.mkdir(exist_ok=True);PRE.mkdir(exist_ok=True)
 async with async_playwright() as p:
  b=await p.chromium.launch();page=await b.new_page(viewport={'width':1440,'height':1080},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto((HERE/'video.html').as_uri());await page.evaluate('document.fonts.ready')
  assert await page.locator('img').evaluate_all('(xs)=>xs.every(x=>x.complete&&x.naturalWidth>0)')
  times=[0,.5,1.2,2.2,2.85,3.2,4.2,4.8,5.9,7.4,8.9,10.4,11.7,12.7,13.3,14.7666667]
  if preview:
   for i,t in enumerate(times):
    await page.evaluate('(t)=>R(t)',t);await page.screenshot(path=str(PRE/f'p{i:02}.png'))
   body=''.join(f'<div><img src="{(PRE/f"p{i:02}.png").as_uri()}"><p>{t:.2f} s</p></div>' for i,t in enumerate(times))
   contact=PRE/'contact.html';contact.write_text('<style>body{margin:0;background:#ddd;font:18px Arial;display:grid;grid-template-columns:repeat(4,480px);gap:8px}img{width:480px;height:360px}p{margin:4px}</style>'+body)
   await page.set_viewport_size({'width':1944,'height':1600});await page.goto(contact.as_uri());await page.screenshot(path=str(OUT/'Mediterranean-Meal-Planner-Video-v2-Contact-Sheet.png'),full_page=True)
  else:
   for i in range(N):
    await page.evaluate('(t)=>R(t)',i/FPS);await page.screenshot(path=str(FRAMES/f'f{i:04}.jpg'),type='jpeg',quality=95)
    if i%90==0:print(f'Rendered {i}/{N}',flush=True)
  assert not errors,errors
  await b.close()
def encode():
 assert FFMPEG.exists(),'FFmpeg package missing; see README.md'
 assert all((FRAMES/f'f{i:04}.jpg').exists() for i in range(N))
 if VIDEO.exists():
  archive=OUT/'video/archive';archive.mkdir(parents=True,exist_ok=True)
  shutil.copy2(VIDEO,archive/'Mediterranean-Meal-Planner-Listing-Video-v2-before-rebuild.mp4')
 cmd=[str(FFMPEG),'-y','-v','error','-framerate',str(FPS),'-i',str(FRAMES/'f%04d.jpg'),'-frames:v',str(N),'-vf','scale=in_range=full:out_range=tv,setsar=1','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart','-an',str(VIDEO)]
 subprocess.run(cmd,check=True)
 # Decode every frame as a corruption check and inspect the stream descriptors.
 verify=subprocess.run([str(FFMPEG),'-hide_banner','-i',str(VIDEO),'-f','null','-'],capture_output=True,text=True)
 assert verify.returncode==0,verify.stderr
 info=verify.stderr
 assert 'h264' in info and 'yuv420p' in info and '1440x1080' in info and '30 fps' in info
 assert 'Audio:' not in info
 assert '00:00:14.80' in info,info
 assert VIDEO.stat().st_size<100000000
 data=VIDEO.read_bytes();boxes=[];offset=0
 while offset+8<=len(data):
  n=struct.unpack('>I',data[offset:offset+4])[0];kind=data[offset+4:offset+8].decode('ascii',errors='replace');boxes.append(kind)
  if n<8:break
  offset+=n
 assert boxes.index('moov')<boxes.index('mdat'),boxes
 # Get the last decoded frame for visual inspection.
 subprocess.run([str(FFMPEG),'-y','-v','error','-sseof','-0.034','-i',str(VIDEO),'-frames:v','1',str(PRE/'last-decoded.png')],check=True)
 report={'file':str(VIDEO),'bytes':VIDEO.stat().st_size,'duration':DURATION,'frames':N,'fps':FPS,'dimensions':[1440,1080],'codec':'H.264','pixel_format':'yuv420p','audio_streams':0,'faststart':True,'all_frames_decoded':True,'sha256':hashlib.sha256(data).hexdigest(),'stream_log':info,'hero':str(ROOT/'6-ETSY-LISTING/images/2026-11-01-premium/01-hero.jpg'),'hero_hold_seconds':1.7,'frame_sources':str(FRAMES),'capture_report':str(HERE/'capture-report.json')}
 (HERE/'video-checks.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:report[k] for k in ['file','bytes','duration','frames','fps','dimensions','codec','pixel_format','audio_streams','faststart','all_frames_decoded']}),flush=True)
if '--preview' in sys.argv:asyncio.run(render(True))
elif '--encode-only' in sys.argv:encode()
else:asyncio.run(render());encode()
