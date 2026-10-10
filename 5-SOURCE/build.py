import base64, json, re, pathlib, shutil, sys
ETSY_URL = 'https://www.etsy.com/listing/4581630401'  # live-demo "Get it on Etsy" button; set '' to hide
SYNC = '--sync' in sys.argv  # copy builds into the delivery folders (1-SELL-THIS, 3-HOST-DEMO, 2-HOST-ONLINE)
W = pathlib.Path(__file__).parent
ICONS = (W / 'dist/icons') if (W / 'dist/icons/icon-180.png').exists() else (W / '../2-HOST-ONLINE/icons')
VERSION = '1.0'
b64 = lambda p: base64.b64encode((W / p).read_bytes()).decode()
css = (W / 'src/styles.css').read_text().replace('__FRAUNCES__', b64('node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff2'))
body = (W / 'src/body.html').read_text()
wm = json.loads((W / 'brand/wordmark-path.json').read_text())
mark_inner = (W / 'brand/mark-inner.txt').read_text()
gen = (W / 'brand/gen.js').read_text()
import subprocess
sprig = json.loads(subprocess.check_output(['node', '-e', "const g=require('./brand/gen.js');console.log(JSON.stringify(g))"], cwd=W))
body = body.replace('__MARK_INNER__', mark_inner).replace('__WM_W__', str(wm['w'] + 2)).replace('__WM_D__', wm['d'])
js_src = '\n'.join((W / f'src/{n}.js').read_text() for n in ['app'])
js_src = js_src.replace('__VERSION__', VERSION).replace('__STEM__', sprig['stem']).replace('__LEAVES__', sprig['leaves'])
photos = {}
for f in sorted((W / 'photos').glob('*.jpg')) if (W / 'photos').exists() else []:
    photos[f.stem] = 'data:image/jpeg;base64,' + base64.b64encode(f.read_bytes()).decode()
    if f.stat().st_size > 90_000: print(f'warning: photos/{f.name} is {f.stat().st_size // 1024} KB; resize to 800x600, quality ~70')
js_base = f"const PHOTOS={json.dumps(photos)};\nconst MARK_INNER={json.dumps(mark_inner)};const WM_D={json.dumps(wm['d'])};\n" + js_src
icon_svg = (W / 'brand/mediterranean-meal-planner-icon.svg').read_text()
favicon = 'data:image/svg+xml;base64,' + base64.b64encode(icon_svg.encode()).decode()
apple = 'data:image/png;base64,' + base64.b64encode((ICONS / 'icon-180.png').read_bytes()).decode()

def page(demo=False):
    js = js_base.replace('__DEMO__', '1' if demo else '0').replace('__ETSY__', ETSY_URL if demo else '')
    title = 'Mediterranean Meal Planner · Live Demo' if demo else 'Mediterranean Meal Planner'
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="Mediterranean Meal Planner is a private, offline Mediterranean meal planner: weekly meal plan, recipes, shopping list, pantry, balance tracker and more.">
<meta name="theme-color" content="#1F4A38">
<meta name="color-scheme" content="light dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Mediterranean Meal Planner">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="icon" type="image/svg+xml" href="{favicon}">
<link rel="apple-touch-icon" href="{apple}">
<!--
  Mediterranean Meal Planner v{VERSION}
  Designed by KaelLabs. Licensed for personal use by the original purchaser; see LICENSE.txt.
  Heading font: Fraunces, © The Fraunces Project Authors, SIL Open Font License 1.1.
  All illustrations and icons are original to this product.
-->
<style>
{css}
</style>
</head>
<body>
{body}
<script>
{js}
</script>
</body>
</html>
'''

out = W / 'dist'
out.mkdir(exist_ok=True)
(out / 'Mediterranean-Meal-Planner.html').write_text(page())
(out / 'demo').mkdir(exist_ok=True)
(out / 'demo' / 'index.html').write_text(page(demo=True))
host = out / 'online'
(host / 'icons').mkdir(parents=True, exist_ok=True)
(host / 'index.html').write_text(page())
for f in ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'icon-180.png']:
    (host / 'icons' / f).write_bytes((ICONS / f).read_bytes())
(host / 'manifest.webmanifest').write_text(json.dumps({
    "name": "Mediterranean Meal Planner", "short_name": "Mediterranean Meal Planner", "start_url": "./", "scope": "./",
    "display": "standalone", "background_color": "#FAF6EF", "theme_color": "#1F4A38",
    "description": "Plan Mediterranean meals, recipes and shopping — private and offline.",
    "icons": [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
              {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
              {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}, indent=1))
(host / 'sw.js').write_text(f'''// Mediterranean Meal Planner offline cache v{VERSION}
const C='mediterranean-meal-planner-v{VERSION}';const FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))}});
self.addEventListener('activate',e=>{{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))}});
self.addEventListener('fetch',e=>{{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))}});
''')
if SYNC:
    R = W.parent
    shutil.copy(out / 'Mediterranean-Meal-Planner.html', R / '1-SELL-THIS/Mediterranean-Meal-Planner.html')
    (R / '3-HOST-DEMO').mkdir(exist_ok=True); shutil.copy(out / 'demo/index.html', R / '3-HOST-DEMO/index.html')
    (R / '2-HOST-ONLINE').mkdir(exist_ok=True)
    for f in ['index.html', 'manifest.webmanifest', 'sw.js']: shutil.copy(host / f, R / '2-HOST-ONLINE' / f)
    import zipfile
    sell = R / '1-SELL-THIS'
    with zipfile.ZipFile(sell / 'Mediterranean-Meal-Planner-Digital-Download.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for f in ['Mediterranean-Meal-Planner.html', 'Mediterranean-Meal-Planner-Start-Here.pdf', 'LICENSE.txt']:
            z.write(sell / f, f)
    print('synced to delivery folders + zip rebuilt')
print('photos embedded:', len(photos), sorted(photos))
print('built', (out / 'Mediterranean-Meal-Planner.html').stat().st_size, 'bytes')
