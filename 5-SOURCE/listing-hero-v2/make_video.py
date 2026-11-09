"""Build the Etsy video from fresh buyer HTML captures and the current hero."""
import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import subprocess

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageStat
from playwright.sync_api import sync_playwright

WIDTH, HEIGHT, FPS, FRAMES = 2160, 1080, 30, 444
SPEED = 1.3
SIZE = (WIDTH, HEIGHT)
SAFE = (432, 1728)
VIDEO = 'Mediterranean-Meal-Planner-Listing-Video-v2.mp4'
SHEET = 'Mediterranean-Meal-Planner-Video-v2-Contact-Sheet.png'
SCREEN_X, SCREEN_Y, SCREEN_W = 450, 238, 820


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def font(size, serif=False):
    mac = Path('/System/Library/Fonts/Supplemental')
    if mac.exists():
        path = mac / ('Georgia Bold.ttf' if serif else 'Arial Bold.ttf')
    else:
        path = Path('/usr/share/fonts/truetype/dejavu') / (
            'DejaVuSerif-Bold.ttf' if serif else 'DejaVuSans-Bold.ttf')
    return ImageFont.truetype(str(path), size)


def shot(page):
    return Image.open(BytesIO(page.screenshot(animations='disabled'))).convert('RGB')


def capture(app):
    errors = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1280, 'height': 850},
                                device_scale_factor=1, offline=True, color_scheme='light')
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
        page.wait_for_timeout(650)
        week = shot(page)
        build = page.locator('#page-week [data-action="genShopping"]')
        build_box = build.bounding_box()
        before = page.evaluate('state.shopping.length')
        build.click()
        page.locator('#page-shopping.active').wait_for()
        page.locator('#toasts .toast').first.wait_for(state='visible')
        toast = page.locator('#toasts .toast').first.inner_text()
        built_toast = shot(page)
        after = page.evaluate('state.shopping.length')
        assert after > before, (before, after)
        page.locator('#toasts .toast').first.wait_for(state='hidden', timeout=15000)
        built = shot(page)
        check = page.locator('#page-shopping input[type=checkbox]:not(:checked)').first
        tick_box = check.bounding_box()
        count_before = page.evaluate('state.shopping.filter(item => item.done).length')
        check.click()
        count_after = page.evaluate('state.shopping.filter(item => item.done).length')
        assert count_after == count_before + 1
        ticked = shot(page)
        page.locator('[data-go="recipes"]').first.click()
        page.locator('#page-recipes.active').wait_for()
        page.wait_for_timeout(400)
        recipes = shot(page)
        assert not errors, errors
        browser.close()
    return (week, built_toast, built, ticked, recipes), (build_box, tick_box), {
        'shopping_items': [before, after], 'checked_items': [count_before, count_after],
        'actual_build_confirmation': toast, 'page_errors': errors,
    }


def blend(a, b, progress):
    progress = min(1, max(0, progress))
    return Image.blend(a, b, progress * progress * (3 - 2 * progress))


def compose(hero, photos, boxes):
    backdrop = hero.resize(SIZE, Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(55))
    backdrop = Image.blend(backdrop, Image.new('RGB', SIZE, '#16241c'), .78)
    end = backdrop.copy()
    end.paste(hero.resize((1296, 972), Image.Resampling.LANCZOS), (432, 54))

    hook = backdrop.copy()
    hook.paste(hero.resize((1120, 840), Image.Resampling.LANCZOS), (520, 148))
    heading = font(64, True)
    accent = '#f0c777'
    d = ImageDraw.Draw(hook)
    d.text((1080, 39), 'Still planning everywhere?', font=heading, fill='#fff9ec', anchor='mt')

    def panel(photo, lines, step):
        scene = backdrop.copy()
        d = ImageDraw.Draw(scene)
        height = round(photo.height * SCREEN_W / photo.width)
        d.rounded_rectangle((SCREEN_X - 10, SCREEN_Y - 10,
                             SCREEN_X + SCREEN_W + 10, SCREEN_Y + height + 10),
                            14, fill='#242923', outline='#7e7766', width=2)
        scene.paste(photo.resize((SCREEN_W, height), Image.Resampling.LANCZOS),
                    (SCREEN_X, SCREEN_Y))
        x = 1306
        d.text((x, 328), step, font=font(64), fill=accent, anchor='lt')
        d.rectangle((x, 407, x + 95, 411), fill=accent)
        for i, line in enumerate(lines):
            assert x + d.textlength(line, font=heading) <= SAFE[1], line
            d.text((x, 461 + 76 * i), line, font=heading,
                   fill=accent if i else '#fff9ec', anchor='lt')
        return scene

    week, toast, built, ticked, recipes = photos
    scenes = [
        panel(week, ['Plan your', 'week'], 'STEP 1'),
        panel(toast, ['Plan your', 'week'], 'STEP 1'),
        panel(built, ['Build your', 'grocery list'], 'STEP 2'),
        panel(ticked, ['Tick as', 'you shop'], 'STEP 3'),
        panel(recipes, ['Save your', 'recipes'], 'STEP 4'),
    ]

    def ripple(scene, box, progress):
        if not 0 <= progress < 1:
            return scene
        x = SCREEN_X + (box['x'] + box['width'] / 2) * SCREEN_W / 1280
        y = SCREEN_Y + (box['y'] + box['height'] / 2) * SCREEN_W / 1280
        layer = Image.new('RGBA', SIZE)
        radius = 10 + 38 * (1 - (1 - progress)**3)
        ImageDraw.Draw(layer).ellipse((x-radius, y-radius, x+radius, y+radius),
                                      outline=(240, 199, 119, round(245*(1-progress))), width=4)
        return Image.alpha_composite(scene.convert('RGBA'), layer).convert('RGB')

    def end_push(progress):
        scale = .975 + .025 * (1 - (1 - progress)**3)
        width = round(1296 * scale)
        height = round(972 * scale)
        image = backdrop.copy()
        image.paste(hero.resize((width, height), Image.Resampling.LANCZOS),
                    ((WIDTH - width) // 2, (HEIGHT - height) // 2))
        return image

    panel_box = (440, 228, 1281, 794)
    panel_images = [scene.crop(panel_box) for scene in scenes]

    def drift(scene_index, authored_elapsed, duration):
        # Hold captions still and ease the app panel toward the viewer.
        progress = min(1, max(0, authored_elapsed / duration))
        scale = 1 + .018 * (4 * progress * (1 - progress))
        panel_image = panel_images[scene_index]
        w, h = panel_image.size
        scaled = panel_image.resize((round(w * scale), round(h * scale)),
                                    Image.Resampling.BICUBIC)
        scene = scenes[scene_index].copy()
        scene.paste(scaled, (panel_box[0] - (scaled.width - w) // 2,
                             panel_box[1] - (scaled.height - h) // 2))
        return scene

    def frame(index):
        # The scene is authored at normal speed, then sampled 1.3 times faster.
        t = index / FPS * SPEED
        def since(seconds):
            return (t - seconds * SPEED) / SPEED
        if since(1.8) < 0:
            return hook
        if since(3.35) < 0:
            scene = blend(hook, scenes[0], since(1.8) / .27) if since(2.07) < 0 else scenes[0]
            if since(2.07) >= 0 and since(3.20) < 0:
                return drift(0, since(2.07) * SPEED, 1.13 * SPEED)
            return ripple(scene, boxes[0], since(3.20) / .25)
        if since(4.2) < 0:
            return ripple(scenes[1], boxes[0], since(3.20) / .25)
        if since(6.5) < 0:
            scene = blend(scenes[1], scenes[2], since(4.2) / .27) if since(4.47) < 0 else scenes[2]
            if since(4.47) >= 0 and since(6.35) < 0:
                return drift(2, since(4.47) * SPEED, 1.88 * SPEED)
            return ripple(scene, boxes[1], since(6.35) / .25)
        if since(8.6) < 0:
            return ripple(scenes[3], boxes[1], since(6.35) / .25)
        if since(11.4) < 0:
            return blend(scenes[3], scenes[4], since(8.6) / (.35 / SPEED)) if since(8.87) < 0 else drift(4, since(8.87) * SPEED, 2.53 * SPEED)
        if since(11.67) < 0:
            return blend(scenes[4], end_push(0), since(11.4) / (.35 / SPEED))
        if since(12.15) < 0:
            return end_push(since(11.67) / (.624 / SPEED))
        return end
    return frame, end


def export(out, frame, end):
    video = out / VIDEO
    command = [
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo',
        '-pixel_format', 'rgb24', '-video_size', '2160x1080', '-framerate', str(FPS),
        '-i', '-', '-an', '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
        '-preset', 'fast', '-crf', '19', '-movflags', '+faststart', str(video),
    ]
    with subprocess.Popen(command, stdin=subprocess.PIPE) as encoder:
        last_image = last_bytes = None
        for i in range(FRAMES):
            image = frame(i)
            if image is not last_image:
                last_image, last_bytes = image, image.tobytes()
            encoder.stdin.write(last_bytes)
        encoder.stdin.close()
        if encoder.wait():
            raise RuntimeError('FFmpeg encode failed')

    data = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video),
    ]))
    stream, = data['streams']
    assert stream['codec_type'] == 'video' and stream['codec_name'] == 'h264'
    assert stream['profile'] == 'High' and stream['pix_fmt'] == 'yuv420p'
    assert (stream['width'], stream['height'], stream['r_frame_rate']) == (WIDTH, HEIGHT, '30/1')
    assert int(stream['nb_frames']) == FRAMES and float(data['format']['duration']) == 14.8
    payload = video.read_bytes()
    assert len(payload) < 12_000_000 and 0 < payload.find(b'moov') < payload.find(b'mdat')

    samples = [round(i * (FRAMES-1) / 15) for i in range(16)]
    select = '+'.join(f'eq(n,{i})' for i in samples)
    decoded = subprocess.check_output([
        'ffmpeg', '-v', 'error', '-i', str(video), '-vf', f"select='{select}',scale=432:216",
        '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-',
    ])
    stride = 432 * 216 * 3
    assert len(decoded) == 16 * stride
    sheet = Image.new('RGB', (1728, 976), '#101712')
    draw = ImageDraw.Draw(sheet)
    for i, number in enumerate(samples):
        x, y = i % 4 * 432, i // 4 * 244
        tile = Image.frombytes('RGB', (432, 216), decoded[i*stride:(i+1)*stride])
        sheet.paste(tile, (x, y))
        draw.text((x+9, y+220), f'{number / FPS:.2f}s', font=font(17), fill='white')
    sheet.save(out / SHEET)
    decoded_last = Image.frombytes('RGB', (432, 216), decoded[-stride:])
    expected_last = end.resize((432, 216), Image.Resampling.LANCZOS)
    mean_error = max(ImageStat.Stat(ImageChops.difference(decoded_last, expected_last)).mean)
    assert mean_error < 3, mean_error
    return {'duration_seconds': 14.8, 'frames': FRAMES, 'fps': FPS,
            'dimensions': [WIDTH, HEIGHT], 'profile': 'H.264 High / yuv420p',
            'audio_streams': 0, 'faststart': True, 'bytes': len(payload),
            'video_sha256': digest(video), 'contact_frames': 16,
            'hero_hold_seconds': 2.63, 'last_frame_max_mean_channel_error': round(mean_error, 3), 'motion_timing_multiplier': SPEED}


def main():
    cli = argparse.ArgumentParser()
    cli.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[2])
    cli.add_argument('--out', type=Path)
    args = cli.parse_args()
    root = args.root.resolve()
    out = args.out or root / '6-ETSY-LISTING'
    app = root / '1-SELL-THIS/Mediterranean-Meal-Planner.html'
    hero_file = root / '6-ETSY-LISTING/images/01-hero-flatlay.jpg'
    hero_report = json.loads(hero_file.with_name('hero-flatlay-capture.json').read_text())
    assert digest(app) == hero_report['source_sha256']
    assert digest(hero_file) == hero_report['hero_sha256']
    photos, boxes, interactions = capture(app)
    assert digest(app) == hero_report['source_sha256']
    assert digest(hero_file) == hero_report['hero_sha256']
    hero = Image.open(hero_file).convert('RGB')
    frame, end = compose(hero, photos, boxes)
    report = export(out, frame, end)
    report.update(interactions, buyer_html_sha256=digest(app), hero_sha256=digest(hero_file),
                  end_card='Current hero fitted intact within 20–80% safe width, held without overlays.')
    (out / 'video-checks.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
