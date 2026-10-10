import base64, json, re, pathlib
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
js = '\n'.join((W / f'src/{n}.js').read_text() for n in ['app'])
js = js.replace('__VERSION__', VERSION).replace('__STEM__', sprig['stem']).replace('__LEAVES__', sprig['leaves'])
js = f"const MARK_INNER={json.dumps(mark_inner)};const WM_D={json.dumps(wm['d'])};\n" + js
icon_svg = (W / 'brand/mediterranean-meal-planner-icon.svg').read_text()
favicon = 'data:image/svg+xml;base64,' + base64.b64encode(icon_svg.encode()).decode()
apple = 'data:image/png;base64,' + base64.b64encode((ICONS / 'icon-180.png').read_bytes()).decode()

def page(pwa=False):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Mediterranean Meal Planner</title>
<meta name="description" content="Mediterranean Meal Planner is a private, offline Mediterranean meal planner: weekly meal plan, recipes, shopping list, pantry, balance tracker and more.">
<meta name="theme-color" content="#1D5673">
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
host = out / 'online'
(host / 'icons').mkdir(parents=True, exist_ok=True)
(host / 'index.html').write_text(page())
for f in ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'icon-180.png']:
    (host / 'icons' / f).write_bytes((ICONS / f).read_bytes())
(host / 'manifest.webmanifest').write_text(json.dumps({
    "name": "Mediterranean Meal Planner", "short_name": "Mediterranean Meal Planner", "start_url": "./", "scope": "./",
    "display": "standalone", "background_color": "#FAF6EF", "theme_color": "#1D5673",
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
print('built', (out / 'Mediterranean-Meal-Planner.html').stat().st_size, 'bytes')
