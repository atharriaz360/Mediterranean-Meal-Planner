# Mediterranean Meal Planner — Etsy Listing Kit (11 Oct 2026)
Listing: https://www.etsy.com/listing/4581630401 · Shop: KaelLabs
Current version only. Everything below matches the current build (forest green · gold · ivory).

## 0. What to upload (all rebuilt 11 Oct 2026)
| Item | File | Notes |
|---|---|---|
| Digital files | `1-SELL-THIS/Mediterranean-Meal-Planner-Digital-Download.zip` + `1-SELL-THIS/Mediterranean-Meal-Planner-Start-Here.pdf` | The zip holds the app (one HTML file), the PDF and `LICENSE.txt`; it is rebuilt automatically by `python3 build.py --sync` |
| Photos (10 + 1 alt hero) | `6-ETSY-LISTING/images-v2/01-hero.jpg` … `10-how-it-works.jpg` (+ `01b-hero-ipad.jpg`) | 3000×2250, 4:3, JPG, under 1 MB each. Order, A/B test + alt text in section 6 |
| Video | `6-ETSY-LISTING/video/Mediterranean-Meal-Planner-Etsy-Video-15s.mp4` | 15.0 s, 1920×1080, no audio. Details in section 7 |
| Online app (buyers) | `2-HOST-ONLINE/` → Vercel | Redeploy with the new build. This link is printed in the Start Here PDF |
| Live demo (shoppers) | `3-HOST-DEMO/` → its own Vercel project | Nothing is saved; "Get it on Etsy" button. Optional: add its link to the description once live |

## 1. Title (99/140, 13 words — passes Etsy's "14 words or less" check)
```
Mediterranean Meal Planner App, Weekly Menu, Recipe Organizer, Auto Grocery List, Works Offline
```

## 2. Tags (13/13, each ≤ 20 chars, none shared with any other KaelLabs kit; checked 2026-10-16)
```
mediterranean diet, weekly menu planner, grocery list app, mediterranean menu, greek meal planner, healthy eating plan, digital meal plan, recipe collection, pantry tracker, recipe book app, meal plan template, weekly dinner plan, offline meal app
```
Swapped out 4 tags that other kits also use: recipe organizer, meal prep planner, family meal plan (Weekly Meal Planner kit) and diet planner (LuxeForm kit).


## 3. Description (paste as-is)
Short and scannable. The first 2 lines show in search previews and Google. Every feature line was checked against the app.

```
Mediterranean Meal Planner app with weekly menu, recipes and a grocery list that builds itself. Works offline on phone, tablet and computer. Buy once, no subscription.

Plan the week, keep your recipes, shop with one list sorted by aisle. No account. Your data stays on your device.

━━ WHAT'S INSIDE ━━
✔ Weekly menu planner (breakfast to dinner, copy last week in one tap)
✔ Recipe organizer (ingredients, method, photos, favourites)
✔ Automatic grocery list: sorted by aisle, skips what's in your pantry
✔ Pantry with use-by reminders
✔ Plus Today view, prep list, balance tracker, goals & water, calendar, journal
✔ Print your week, shopping list or recipe cards
✔ Light & dark mode

━━ HOW IT WORKS ━━
1. Buy and download instantly
2. Computer: open the file in your browser (works in Chrome, Safari, Edge and Firefox)
3. Phone: open your link from the Start Here guide and tap "Add to Home Screen"
4. Plan your week. Works offline

━━ WHAT YOU GET ━━
• The app (one HTML file)
• Start Here guide (PDF)
• Personal-use licence

━━ GOOD TO KNOW ━━
• Digital download. Nothing is shipped
• Data saves in your browser. Use Backup often; clearing browser data can erase it
• No automatic sync between devices (move data with Backup → Restore)
• Personal use only. Not medical or diet advice
• Product name: Mediterranean Meal Planner (by KaelLabs)

━━ SUPPORT ━━
Questions or download trouble? Message me on Etsy. I reply as soon as possible.

Designed and built by me (KaelLabs). AI tools assisted with parts of the coding, images and listing copy, and the food photo on the Home screen was made with AI image tools. Every feature was reviewed and tested by hand. Photos show real app screens with example data.
```

## 4. Etsy listing fields
| Field | Value |
|---|---|
| Category | Planner Templates (Digital files). Remove Calendars & Planners |
| Type | Digital files → instant download (buyers download files right after purchase) |
| "This digital item is made to order" | OFF. Never tick it. Files are attached, so it's an instant download |
| Who made it | I did |
| What is it | A finished product |
| When made | 2020–2026 (not "Made to order") |
| How is this digital content created? | **With an AI generator** (matches AI line in description) |
| Files | `Mediterranean-Meal-Planner-Digital-Download.zip` + `Mediterranean-Meal-Planner-Start-Here.pdf` |
| Attributes | Primary colour: Green. Secondary colour: Gold. Occasion, Holiday, Celebration: EMPTY |
| Shop section | **Meal Planning** |
| Feature this listing | Off |
| Renewal | Automatic |
| GPSR info | Leave empty ("Add info" not clicked). Digital file, not a physical product |
| Photos | 10 photos from `images-v2/` at 3000×2250 (4:3), hero first (section 6) + the 15 s video |

**Fix on the live listing if still present:** GPSR "Add info" opened on a digital item → click "Remove info". Category must be Planner Templates (not the physical Calendars & Planners). Occasion / Holiday / Celebration attributes empty (removes the "Party decor" highlight).

## 5. Note to buyers (paste; plain text, no quote marks, which Etsy was showing as &quot;)
```
Open the Start Here PDF first. It shows how to open your app on computer and phone (Add to Home Screen). Unzip the download before opening the HTML file. Your data stays private on your device, so use the same browser each time and export a backup weekly. Need help? Message me on Etsy. Athar
```

## 6. Photos (v2 lifestyle set, 21 Oct 2026)
Folder: `6-ETSY-LISTING/images-v2/`. **3000×2250 px (4:3 landscape), JPG, sRGB, 550–960 KB each.** The old set stays in `images/` as a fallback.

Every device shows **real screenshots of the current build** (sample data). The backgrounds are AI-generated lifestyle scenes made in Canva (sources in `5-SOURCE/canva-bg/`); the food and props are styling only, and image 10 says so. This matches the AI line in the description.

Etsy rules these follow (Etsy Help + Seller Handbook + Creativity Standards):
- at least 2000 px wide and tall; first photo landscape; same 4:3 shape for every photo;
- hero devices and title sit inside the centre area that Etsy's crops keep; checked readable at thumbnail size;
- photos show the real item (real app screens), no stars, reviews or "bestseller" badges, no health or weight claims;
- the balance image says "not medical or diet advice"; image 10 says digital download, nothing shipped, food photos are styling only.

**Hero A/B test:** start with `01-hero.jpg` (laptop + iPhone). After 2–3 weeks, swap in `01b-hero-ipad.jpg` (iPad + iPhone in front) for 2–3 weeks and keep whichever gets more visits per impression (Stats → listing → views ÷ impressions). Change only the first photo during the test.

| # | File | Scene | Headline / job |
|---|------|-------|----------------|
| 1 | `01-hero.jpg` | Golden-hour Mediterranean table, laptop + iPhone | Mediterranean Meal Planner · *Calm weeks. Dinner, decided.* · icon badges: One-time purchase · No subscription · No account · No ads |
| 1b | `01b-hero-ipad.jpg` | Same table, iPad + iPhone in front | Alternate hero for the A/B test |
| 2 | `02-week-plan.jpg` | Sunday morning coffee table, laptop | *The whole week, handled.* Ten calm minutes on Sunday |
| 3 | `03-plan-to-list.jpg` | Market-basket flat-lay, two iPhones | *Your grocery list writes itself.* Merged · by aisle · skips pantry |
| 4 | `04-on-your-phone.jpg` | Sunny produce market, two iPhones | *Your whole plan, in your pocket.* Works offline · phone, tablet & computer |
| 5 | `05-recipes.jpg` | Lentil soup on a wooden board, two iPhones | *Every recipe, finally in one place.* |
| 6 | `06-pantry.jpg` | Pantry shelf with jars, two iPhones | *Use what you have. Waste less.* |
| 7 | `07-balance.jpg` | Sunlit wall, two iPhones | *See the colour of your week.* (not medical advice) |
| 8 | `08-12-tools.jpg` | Sunlit wall, 12 screens | *12 tools. One calm app.* |
| 9 | `09-private.jpg` | Forest green, dark mode laptop + iPhone | *Evenings are yours again.* No account · nothing uploaded |
| 10 | `10-how-it-works.jpg` | Sunlit wall, 3 step cards | Download · Open · Plan, what you receive, digital download note |

### Alt text (Etsy: Photos → hover the photo → "Add alt text"; each under 250 characters)
| # | Alt text |
|---|----------|
| 1 | Mediterranean Meal Planner digital app on a laptop and iPhone on a sunlit kitchen table with lemons and olive oil, showing the weekly meal dashboard and grocery list. One-time purchase, no subscription, no account, no ads |
| 1b | Mediterranean Meal Planner app on an iPad and iPhone on a sunlit wooden table with lemons and olive oil: weekly meal dashboard on the tablet, grocery list on the phone. One-time purchase, no subscription, no account, no ads |
| 2 | Weekly meal planner app on a laptop on a sunny Sunday morning table with coffee and a notebook, showing breakfast, lunch, dinner and snacks for every day of the week |
| 3 | Two iPhones on a linen cloth with fresh tomatoes, lemons, bread and chickpeas: the weekly meal plan and an automatic grocery list sorted by aisle that skips pantry items |
| 4 | Meal planner app on two iPhones at a sunny Mediterranean produce market, showing the grocery list and today's meals. Works offline on phone, tablet and computer |
| 5 | Lentil soup recipe with ingredients in the meal planner app on an iPhone beside a real bowl of lentil soup, with the recipe collection on a second phone |
| 6 | Two iPhones on a pantry shelf with jars of lentils, chickpeas and pasta, showing the pantry list with use-by dates and today's meals with prep tasks |
| 7 | Meal planner screens on two iPhones showing weekly food groups such as vegetables, fruit and legumes, plus goals and water tracking. A planning aid, not medical advice |
| 8 | Grid of 12 meal planner app screens: home, week plan, today, calendar, recipes, grocery list, pantry, prep list, balance, goals and water, journal and dark mode |
| 9 | Mediterranean Meal Planner in dark mode on a laptop and iPhone on a forest green background. No account, no subscription, nothing uploaded, light and dark mode |
| 10 | How it works in 3 steps: download, open in your browser or add to your phone home screen, plan your week. You receive the app file, a Start Here PDF guide and a licence |

## 7. Video
- File: `6-ETSY-LISTING/video/Mediterranean-Meal-Planner-Etsy-Video-15s.mp4` — 15.0 s, 1920×1080 (16:9), MP4/H.264, 30 fps, no audio track.
- Real app interactions played at 1.5× speed; no browser bar, no private link.
- Scenes (one benefit badge each): dashboard (*Your whole week at a glance*) → Week Plan, one tap (*One tap builds your grocery list*) → shopping list by aisle, 3 items ticked (*Sorted by aisle. Tick off as you shop*) → Lentil Soup recipe opens (*Every recipe in one place*) → pantry use-by highlight (*Use what you have. Waste less*) → dark mode (*Private. No account. No subscription*) → end card (Mediterranean Meal Planner · Plan meals. Simplify shopping. · no subscription · works offline · phone + computer).
- **Video spec used** (Etsy Help page could not be fetched on 11 Oct; these are the commonly cited Etsy limits — check the upload screen): 5–15 s, MP4/MOV, up to 100 MB, 1080p recommended, sound is removed by Etsy, so the video tells its story with on-screen badges only.
- Etsy has no alt-text field for videos.

## 8. Policy & compliance

- **AI disclosure:** Etsy's Creativity Standards ask sellers to disclose AI use. The description already ends with the disclosure line, and "How is this digital content created?" is set to *With an AI generator*. Keep them matching.
- **No health claims** anywhere (title, tags, photos, description): no "heart-healthy", "lose weight", "proven benefits", "lower cholesterol" and so on. "Mediterranean-style" and "planning tool" are safe.
- **Photos must show the real product.** All images use real screenshots of the current build. If the app design changes, re-take them (the image script lives with the source).
- **Hero food photo:** it came from your AI-generated mockup. Confirm you created it; the licence and AI line say so.
- **Keep your hosted link private.** Never show a browser address bar in screenshots or videos. The link belongs only inside the paid PDF.

## 9. Shop fixes (Shop Manager → Settings → Info & Appearance / Policies)

**About: headline**
```
Private, offline planner apps for real life
```


**FAQs (replace all the current ones)**
- *How do I get my files?* Right after payment, go to You → Purchases and reviews → Download files.
- *Do I need an app or an account?* No. The planner opens in any modern browser (Chrome, Safari, Edge, Firefox). On your phone, use the link in the Start Here guide and tap "Add to Home Screen".
- *Where is my data saved?* Only on your device, in your browser. Nothing is uploaded. Use the same browser each time, and back up from Settings.
- *Does it sync between my phone and laptop?* Not automatically. Export a backup on one device and restore it on the other.
- *Can I share it or resell it?* No. Each purchase is for personal use by one household.

## 10. Next 30 days
1. **Publish day:** upload the zip + PDF, 10 photos (in order, alt text), the video, title, tags, description and fields — all in one session. Redeploy both Vercel projects first.
2. **Leave the listing alone for 14 days.** Check Stats → Search terms weekly:
   - Low views → title or tags. Adjust only those.
   - Views but few clicks → thumbnail. Try a variant of photo 1.
   - Clicks but no sales → price, photos 2–4, first description lines.
3. **Share outside Etsy:** post the 15 s video as a Pinterest pin and an Instagram/TikTok reel linking to the listing.
4. **Reviews:** keep Etsy's automatic review request on. The Start Here PDF already asks kindly for a review.
5. **Etsy Ads (optional):** about €1–2/day for 2–3 weeks to get early click data; stop if no sales after ~3 weeks.
6. **Updates:** edit `5-SOURCE/src`, bump `VERSION` in `build.py`, run `python3 build.py --sync`, run both tests, re-upload. Tell buyers to export a backup in the old version first, then restore it in the new one.

## 11. Pre-publish checklist
- [ ] Hero food photo rights confirmed (you created the AI image)
- [ ] `2-HOST-ONLINE` redeployed; link opens; tested on iPhone + Android (Add to Home Screen, airplane mode)
- [ ] `3-HOST-DEMO` deployed (optional) and its link added to the description
- [ ] Start Here PDF shows the correct online link (no red placeholder)
- [ ] Zip + Start Here PDF uploaded; old files removed
- [ ] 10 photos uploaded in order, alt text on each, thumbnail crop centred
- [ ] Video uploaded
- [ ] Title (section 1), 13 tags (section 2), description (section 3) pasted
- [ ] Fields set (section 4); GPSR info removed; Occasion/Holiday/Celebration empty
- [ ] Note to buyers pasted (section 5)
- [ ] Shop About + FAQs updated (section 9)
- [ ] `python3 test/functional_test.py` and `python3 test/robustness_test.py` pass after the final build

## Change log
- 2026-10-16: new 2-page Start Here PDF (cream and navy, hosted link and QR). Tags: 4 swapped to remove overlap with other kits. Description: browser caveat removed, SUPPORT line added, project name bullet added. Alternative title removed. Zip rebuilt.
- 2026-10-11: sample recipes made fully Mediterranean (Lemon Herb Chicken, Greek Yogurt Pancakes, Tomato & Olive Pasta); new hero.
- 2026-10-11: redesign (green · gold · ivory); hero + 9 supporting photos at 3000×2250; 15 s video; shorter description; zip, PDF and licence rebuilt.
