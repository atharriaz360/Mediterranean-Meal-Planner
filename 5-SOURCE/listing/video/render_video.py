import subprocess,sys
from playwright.sync_api import sync_playwright
FPS=30;N=int(16*FPS);only=[float(x) for x in sys.argv[1:]]
with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--allow-file-access-from-files'])
  p=b.new_page(viewport={'width':2160,'height':1080});p.goto('file:///home/claude/w/video.html');p.wait_for_load_state('networkidle');p.evaluate('document.fonts.ready');p.wait_for_timeout(800)
  if only:
    for t in only:p.evaluate(f'R({t})');p.screenshot(path=f'/tmp/v{t}.png')
  else:
    enc=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',str(FPS),'-i','-','-an','-c:v','libx264','-profile:v','high','-pix_fmt','yuv420p','-preset','veryfast','-crf','16','-movflags','+faststart','/home/claude/w/out.mp4'],stdin=subprocess.PIPE)
    for f in range(N):
      p.evaluate(f'R({f}/{FPS})');enc.stdin.write(p.screenshot(type='png'))
    enc.stdin.close();print('enc',enc.wait())
  b.close()
