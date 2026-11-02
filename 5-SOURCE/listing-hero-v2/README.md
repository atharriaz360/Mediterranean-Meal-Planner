# Mediterranean Meal Planner — listing video v2

- VERIFIED: Green, gold and ivory brand; Georgia serif and system sans fonts. Uses the supplied Canva backgrounds and generated photographic device assets from the current listing image set.
- VERIFIED: Source app: `1-SELL-THIS/Mediterranean-Meal-Planner.html`. End card: `6-ETSY-LISTING/images/2026-11-01-premium/01-hero.jpg`.
- INFERENCE: Shorter secondary scenes suit the requested faster pace. Buyer response is UNKNOWN.

## Rebuild from project root

```sh
python3 -m pip install --target /tmp/kaellabs-video-deps imageio-ffmpeg
python3 5-SOURCE/listing-hero-v2/capture.py
python3 5-SOURCE/listing-hero-v2/make_video.py
python3 5-SOURCE/listing-hero-v2/render.py --preview
python3 5-SOURCE/listing-hero-v2/render.py
```

- VERIFIED: Requires Python Playwright with Chromium, Pillow for separate QA, and FFmpeg. Capture and rendering need permission to launch a local browser in restricted environments.
- VERIFIED: `video.html` has a 3000×2250 stage at 0.48 scale. `window.R(t)` sets animation state deterministically. No runtime network access is needed by the video page.
- VERIFIED: Frame files go to `/tmp/kaellabs-meal-video-v2/`. Captures, the HTML source, previews and evidence reports stay here. Movie output goes to `6-ETSY-LISTING/`.
- VERIFIED: `render.py --encode-only` encodes existing frames. `render.py --preview` creates 16 review frames and a contact sheet without encoding.
- VERIFIED: Grocery generation and checkbox actions are real UI clicks, checked against actual state and visible page text. Cursor motion in the marketing composition illustrates those verified clicks; screen changes crossfade to the captured after-states.
- VERIFIED: Every feature scene uses one capture session and the same sample dataset after those actions. The exact final listing hero depicts its earlier sample snapshot, rather than the modified grocery counts.
- VERIFIED: Phone captures are 393×852 at 3× density; tablet captures are 1400×1050 at 2× density to match the tablet display shape. No demo bars are visible.
- VERIFIED: The final hero is held at scale 1 for 1.7 seconds. It is re-encoded with the movie, so compressed pixels need not be byte-identical to the source JPG.
- UNKNOWN: Sales lift, three-second conversion performance, best-ever status and top-1% rank.

## Timeline (seconds)

- INFERENCE: 0–1.65: planning scattered across notes, tabs and lists.
- INFERENCE: 1.65–5.3: build a grocery list from the weekly plan, then tick an item.
- INFERENCE: 5.3–6.8: recipe collection on tablet and phone.
- INFERENCE: 6.8–8.3: pantry and use-by dates.
- INFERENCE: 8.3–9.8: balance, goals and water; planning-aid note.
- INFERENCE: 9.8–11.1: dark mode, local storage and visible backup/restore controls.
- INFERENCE: 11.1–12.3: twelve actual app views.
- INFERENCE: 12.3–14.8: exact listing hero, slow zoom-out, then hold.

## Evidence files

- `capture-report.json`: real before/after interaction checks and screenshot settings.
- `video-checks.json`: codec, duration, dimensions, frame count, size, faststart and complete decode log.
- `preview/`: 16 rendered checkpoints plus the decoded final frame.
