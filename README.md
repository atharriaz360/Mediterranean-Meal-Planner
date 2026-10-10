# Mediterranean Meal Planner (v1.0) — by KaelLabs

Single-file, offline Mediterranean meal planner sold on Etsy.

| Folder | What it's for |
|---|---|
| `1-SELL-THIS/` | The 3 files buyers get: app `.html`, Start-Here `.pdf`, `LICENSE.txt` (+ the same 3 as a `.zip`, rebuilt automatically) |
| `2-HOST-ONLINE/` | Buyer-facing installable/offline app (`index.html`, `manifest.webmanifest`, `sw.js`, `icons/`). Host on Vercel; this is the link in the Start-Here PDF |
| `3-HOST-DEMO/` | `index.html` = **live demo** build (nothing is saved, backup/restore locked, "Get it on Etsy" button). Host on its own Vercel project and link it from the listing |
| `4-BRAND/` | Logo (dark/light), app icon, maskable icon (SVG + PNG) |
| `5-SOURCE/` | Source of truth: `src/app.js`, `src/styles.css`, `src/body.html`, `build.py`, `guide/`, `photos/`, `test/` |
| `6-ETSY-LISTING/` | Listing images, video, `ETSY-LISTING-KIT.md` |

## Rebuild (one command)
```
cd 5-SOURCE
python3 build.py --sync
```
Builds the full app, the hosted copy and the demo from the same source into `dist/`. With `--sync` it copies them into `1-SELL-THIS/`, `2-HOST-ONLINE/`, `3-HOST-DEMO/` and rebuilds the zip. Never edit the built HTML by hand — edit `src/` and rebuild.

## Start-Here PDF
Edit `5-SOURCE/guide/start-here.html`, then `node 5-SOURCE/guide/make-guide.js "https://your-online-link"` and copy the PDF into `1-SELL-THIS/` before `build.py --sync`.

## Tests (need `pip install playwright` + `python3 -m playwright install chromium`)
```
cd 5-SOURCE
python3 build.py
python3 test/functional_test.py     # 70 user-flow checks
python3 test/robustness_test.py     # security, data-safety, accessibility checks
```

## Photos
`5-SOURCE/photos/*.jpg` are embedded at build time by file name (`herobowl.jpg` = Home hero). Unused photos live in `photos/_unused/` (not embedded).

After a rebuild: redeploy both Vercel projects. Set `ETSY_URL` at the top of `build.py` if the listing URL changes.
