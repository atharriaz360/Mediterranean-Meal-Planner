# Mediterranean Meal Planner (v1.0)

A rebuilt, rebranded version of the Mediterranean HTML planner, ready to sell on Etsy.

| Folder | What it's for |
|---|---|
| `1-SELL-THIS/` | Upload these 3 files to the Etsy listing (the zip is the same 3 files, handy for testing or other shops) |
| `2-HOST-ONLINE/` | Drag this whole folder onto Netlify Drop / GitHub Pages. This gives buyers the phone-installable, offline app link |
| `3-ETSY-LISTING/` | v2 (29 Sep 2026): 10 listing photos in `images/` (2400×3000, 4:5, the shape Etsy search uses), `video/` (15 s Etsy video + 38 s full feature tour), and `ETSY-LISTING-KIT.md` (diagnosis, title, 13 tags, description, settings, shop fixes). The old v1 files are in `_old-v1/` |
| `4-BRAND/` | Logo (dark/light, SVG + PNG), app icon, maskable icon |
| `5-SOURCE/` | Editable source. `npm i @fontsource/fraunces @fontsource/inter opentype.js playwright` then `python3 build.py` (outputs to `dist/`) |

**Before you publish:** host `2-HOST-ONLINE`, then run `node 5-SOURCE/guide/make-guide.js "https://your-link"` to put the link into the Start Here PDF.

The original `index.html` in the parent folder was not changed.
