"""Capture buyer HTML offline and render the Etsy flatlay with real app screens."""
import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path

from PIL import Image, ImageCms, ImageDraw, ImageFilter, ImageFont
from playwright.sync_api import sync_playwright

SIZE = (3000, 2250)
MAC_FONTS = Path('/System/Library/Fonts/Supplemental')
LINUX_FONTS = Path('/usr/share/fonts/truetype/dejavu')


def font(size, serif=False, bold=False):
    if serif:
        mac, linux = 'Georgia Bold.ttf', 'DejaVuSerif-Bold.ttf'
    elif bold:
        mac, linux = 'Arial Bold.ttf', 'DejaVuSans-Bold.ttf'
    else:
        mac, linux = 'Arial.ttf', 'DejaVuSans.ttf'
    path = MAC_FONTS / mac if MAC_FONTS.exists() else LINUX_FONTS / linux
    return ImageFont.truetype(str(path), size)


def screenshot(page):
    return Image.open(BytesIO(page.screenshot(animations='disabled'))).convert('RGB')


def capture(app):
    errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(
            viewport={'width': 1440, 'height': 900},
            device_scale_factor=2, color_scheme='light', offline=True,
        )
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(app.as_uri())
        page.wait_for_timeout(1100)
        for _ in range(6):
            if not page.locator('#overlay.open').count():
                break
            page.locator('#modal .m-f button').last.click()
            page.wait_for_timeout(300)
        page.wait_for_timeout(4500)
        page.locator('#overlay.open').wait_for(state='hidden')
        page.locator('[data-go="week"]').first.click()
        page.locator('#page-week.active').wait_for()
        page.wait_for_timeout(800)
        desktop = screenshot(page)

        page.locator('#page-week [data-action="genShopping"]').click()
        page.locator('#page-shopping.active').wait_for()
        page.set_viewport_size({'width': 393, 'height': 852})
        nav = page.locator('.bottom-nav')
        nav.wait_for(state='visible')
        labels = nav.inner_text().splitlines()
        assert labels == ['Home', 'Week', 'Recipes', 'Shop', 'More'], labels
        nav_box = nav.bounding_box()
        assert nav_box and nav_box['y'] + nav_box['height'] <= 852, nav_box
        page.locator('#toasts .toast').first.wait_for(state='hidden', timeout=15000)
        mobile = screenshot(page)
        assert not errors, errors
        browser.close()
    return desktop, mobile, labels


def device(canvas, capture_image, position, screen_width, phone=False):
    screen_height = round(capture_image.height * screen_width / capture_image.width)
    screen = capture_image.resize((screen_width, screen_height), Image.Resampling.LANCZOS)
    if phone:
        # Reserve hardware safe areas around the intact browser capture.
        status_height, home_height = 66, 31
        display = Image.new('RGB', (screen_width, screen_height + status_height + home_height))
        ui_top = screen.getpixel((screen_width // 2, 0))
        ui_bottom = screen.getpixel((screen_width // 2, screen_height - 1))
        glass = ImageDraw.Draw(display)
        glass.rectangle((0, 0, screen_width, status_height), fill=ui_top)
        glass.rectangle((0, status_height + screen_height, screen_width, display.height),
                        fill=ui_bottom)
        display.paste(screen, (0, status_height))
        cx = screen_width // 2
        glass.rounded_rectangle((cx - 61, 14, cx + 61, 48), 17, fill='#111214')
        glass.ellipse((cx + 39, 25, cx + 50, 36), fill='#242a31')
        y = display.height - 15
        glass.rounded_rectangle((cx - 66, y, cx + 66, y + 5), 3, fill='#202421')
        screen = display
        screen_height = display.height
    bezel = 12 if phone else 23
    top = 12 if phone else 37
    bottom = 12 if phone else 32
    width, height = screen_width + 2 * bezel, screen_height + top + bottom
    frame = Image.new('RGBA', (width, height))
    draw = ImageDraw.Draw(frame)
    radius = 69 if phone else 34
    metal_mask = Image.new('L', (width, height))
    ImageDraw.Draw(metal_mask).rounded_rectangle((0, 0, width - 1, height - 1), radius, fill=255)
    metal = Image.new('RGB', (width, height))
    brush = ImageDraw.Draw(metal)
    for y in range(height):
        tone = 108 - round(57 * y / height) + (y % 3 - 1)
        brush.line((0, y, width, y), fill=(tone + 4, tone + 2, tone))
    frame.paste(metal, mask=metal_mask)
    draw.rounded_rectangle((3, 3, width - 4, height - 4), radius - 3, fill='#181817')
    draw.line((radius, 2, width - radius, 2), fill='#aaa296')
    if phone:
        # Clip the display glass to the inner frame radius. App controls stay in bounds.
        scale = 3
        mask = Image.new('L', (screen.width * scale, screen.height * scale))
        ImageDraw.Draw(mask).rounded_rectangle(
            (0, 0, mask.width - 1, mask.height - 1), (radius - bezel) * scale, fill=255,
        )
        frame.paste(screen, (bezel, top), mask.resize(screen.size, Image.Resampling.LANCZOS))
    else:
        frame.paste(screen, (bezel, top))
    if not phone:
        cx = width // 2
        draw.ellipse((cx - 5, 15, cx + 5, 25), fill='#3b4652')
    x, y = position
    shadow = Image.new('L', SIZE)
    shadow.paste(frame.getchannel('A').point(lambda alpha: alpha * 3 // 5), (x + 12, y + 22))
    shade = Image.new('RGBA', SIZE)
    shade.putalpha(shadow.filter(ImageFilter.GaussianBlur(24)))
    canvas.alpha_composite(shade)
    canvas.alpha_composite(frame, position)
    if not phone:
        bottom_y = y + height - 5
        left, right = x - 27, x + width + 27
        lip = Image.new('RGBA', SIZE)
        surface = ImageDraw.Draw(lip)
        surface.polygon([(x, bottom_y), (x + width, bottom_y),
                         (right, bottom_y + 19), (left, bottom_y + 19)], fill='#77746d')
        surface.rounded_rectangle((left, bottom_y + 16, right, bottom_y + 31),
                                  6, fill='#514f4b')
        surface.line((left + 7, bottom_y + 18, right - 7, bottom_y + 18),
                     fill='#a7a095', width=2)
        surface.rounded_rectangle((x + width // 2 - 66, bottom_y + 16,
                                   x + width // 2 + 66, bottom_y + 23), 3, fill='#363533')
        canvas.alpha_composite(lip)


def render(background, desktop, phone):
    canvas = Image.open(background).convert('RGBA')
    assert canvas.size == SIZE, canvas.size
    device(canvas, desktop, (633, 658), 1210)
    device(canvas, phone, (1883, 567), 472, phone=True)

    draw = ImageDraw.Draw(canvas)
    for size in range(24, 11, -1):
        wordmark = font(size, bold=True)
        k_width = draw.textlength('K', font=wordmark)
        mark_width = k_width + draw.textlength('aelLabs', font=wordmark)
        if mark_width <= SIZE[0] * .035:
            break
    assert mark_width <= SIZE[0] * .035, mark_width
    x = 2340 - mark_width
    draw.text((x, 148), 'K', font=wordmark, fill='#e8bd60', anchor='lt')
    draw.text((x + k_width, 148), 'aelLabs', font=wordmark, fill='#ffffff', anchor='lt')
    draw.text((1500, 226), 'Mediterranean Meal Planner', font=font(100, serif=True),
              fill='#fff9eb', anchor='mt', stroke_width=1, stroke_fill='#293024')
    draw.text((1500, 370), 'Turn your week plan into a grocery list', font=font(57),
              fill='#ffffff', anchor='mt')
    draw.text((1500, 1920), 'Digital download  •  Sample data shown', font=font(44, bold=True),
              fill='#fff9eb', anchor='mt')
    return canvas.convert('RGB')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--out', type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    out = args.out or root / '6-ETSY-LISTING/images'
    app = root / '1-SELL-THIS/Mediterranean-Meal-Planner.html'
    app_hash = sha256(app.read_bytes()).hexdigest()
    desktop, phone, labels = capture(app)
    assert sha256(app.read_bytes()).hexdigest() == app_hash
    rgb = render(root / '5-SOURCE/canva-bg/Premium Food Flat Lay Background.jpg', desktop, phone)
    profile = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
    for quality in range(94, 49, -2):
        encoded = BytesIO()
        rgb.save(encoded, 'JPEG', quality=quality, optimize=True, icc_profile=profile)
        if encoded.tell() < 1_000_000:
            break
    else:
        raise ValueError('Hero exceeds 1 MB')
    payload = encoded.getvalue()
    (out / 'hero-flatlay.jpg').write_bytes(payload)
    report = {
        'source_app': str(app.relative_to(root)), 'source_sha256': app_hash,
        'hero_sha256': sha256(payload).hexdigest(), 'pixels': list(rgb.size),
        'bytes': len(payload), 'quality': quality,
        'desktop_viewport': [1440, 900], 'phone_viewport': [393, 852],
        'mobile_bottom_nav': labels, 'page_errors': [],
        'method': 'Direct Chromium captures from buyer HTML offline; same sample session; phone Shopping opened via Build shopping list. Phone capture fitted below a simulated Dynamic Island with a separate home-indicator area. Rounded glass masks only the display corners.',
    }
    (out / 'hero-flatlay-capture.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
