from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
from playwright.sync_api import sync_playwright
root = Path(__file__).resolve().parents[2]
app = root / '1-SELL-THIS/Mediterranean-Meal-Planner.html'
out = root / '6-ETSY-LISTING/images'
report = {'source_app':str(app), 'source_sha256':sha256(app.read_bytes()).hexdigest(), 'viewport':[1500,1125], 'device_scale_factor':2, 'page_errors':[], 'images':{}}
with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={'width':1500,'height':1125}, device_scale_factor=2, color_scheme='light', offline=True)
    page = ctx.new_page()
    page.on('pageerror',lambda error: report['page_errors'].append(str(error)))
    page.goto(app.as_uri())
    page.wait_for_timeout(1100)
    for _ in range(6):
        if not page.locator('#overlay.open').count():
            break
        page.locator('#modal .m-f button').last.click()
        page.wait_for_timeout(300)
    page.wait_for_timeout(4500)
    assert not page.locator('#overlay.open').count()
    for view, name in [('home','02-dashboard-unedited.jpg'),('week','visual preview or excerpt.jpg')]:
        page.locator(f'[data-go="{view}"]').first.click()
        page.locator(f'#page-{view}.active').wait_for()
        path = out / name
        page.screenshot(path=path, type='jpeg', quality=93)
        with Image.open(path) as im:
            assert im.size == (3000,2250)
        report['images'][name] = {'sha256':sha256(path.read_bytes()).hexdigest(),'pixels':[3000,2250],'bytes':path.stat().st_size}
    page.locator('#page-week [data-action="genShopping"]').click()
    page.locator('#page-shopping.active').wait_for()
    page.set_viewport_size({'width':393,'height':852})
    assert page.locator('.bottom-nav').is_visible()
    report['mobile_bottom_nav'] = page.locator('.bottom-nav').inner_text().splitlines()
    assert not report['page_errors'], report['page_errors']
    browser.close()
report['method'] = 'Direct Chromium JPEG screenshots from buyer HTML, offline, sample data, no crop, resize, overlay or retouch.'
(out / 'dashboard-capture.json').write_text(json.dumps(report,indent=2)+'\n')
