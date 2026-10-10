# 0. FINAL LISTING SETUP (1 Oct 2026) — THIS SECTION WINS
Anything further down that disagrees with section 0 is old. Section 0 is the source of truth.

## 0.1 Problems found on live listing
- GPSR "Add info" was opened on a digital item (empty Manufacturer/Safety boxes). Click "Remove info".
- Category Calendars & Planners is physical-paper (Magnetic/Width fields). Move to Planner Templates. "Party decor" highlight also shows on Planner Templates listings (Kindling), so check Occasion/Celebration attributes are empty.
- 5 overlapping tags: meal planner app, meal planning app, digital meal planner, grocery list app, shopping list app. Two wasted slots.
- Title ended "| Digital Download" (wasted) and used pipes.
- Old kit said "[AI disclosure line, see section 7]" placeholder and "don't upload the ZIP". Now: AI line filled, files = zip + pdf like every other listing.
- No health claims: never "heart healthy", "anti inflammatory", "weight loss", "proven benefits".

## 0.2 Title (105/140, 14 words, no repeated word)
```
Mediterranean Meal Planner App, Weekly Menu, Recipe Organizer, Auto Grocery List, Pantry Tracker, Offline
```

## 0.3 Tags (13/13, each ≤ 20 chars, no tag shared with any other shop listing)
```
mediterranean diet, mediterranean meals, meal planner app, weekly meal planner, weekly menu planner, recipe organizer, grocery list app, meal prep planner, pantry inventory, food planner, healthy meal planner, batch cooking, digital recipe book
```
Removed from live: digital meal planner, meal planning app, shopping list app

## 0.4 Description changes
Keep the section 4 description below, with these edits:
1. First 2 lines (show in search + Google) become:
```
🫒 Mediterranean meal planner app: plan your week, keep your recipes, and turn meals into a grocery list sorted by aisle in one tap.
Instant download for phone, tablet and computer. Works offline. No subscription, no account.
```
2. Replace the "what you get / what you'll receive" block with:
```
📦 WHAT YOU GET (instant download)
• Mediterranean-Meal-Planner-Digital-Download.zip: the app (one HTML file), Start Here guide (PDF) and personal-use licence
• Mediterranean-Meal-Planner-Start-Here.pdf: the same guide as a loose file, so you can open it on your phone without unzipping
This is a digital download. Nothing will be shipped.
```
3. Last lines must be (AI disclosure, required by Etsy Creativity Standards):
```
Designed and built by me (KaelLabs). AI tools assisted with parts of the coding, images and listing copy. Every feature was reviewed and tested by hand. App screens in the photos are real screenshots with example data.
```

## 0.5 Etsy fields
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
| Attributes | Primary colour: Green. Secondary colour: Blue. Occasion, Holiday, Celebration: EMPTY |
| Shop section | **Meal Planning** |
| Feature this listing | Off |
| Renewal | Automatic |
| GPSR info | Leave empty ("Add info" not clicked). Digital file, not a physical product |
| Photos | Keep current 10 (4:5 set, hero first) + 15 s video |

## 0.6 Note to buyers (paste; plain text, no quote marks, which Etsy was showing as &quot;)
```
Open the Start Here PDF first. It shows how to open your app on computer and phone (Add to Home Screen). Unzip the download before opening the HTML file. Your data stays private on your device, so use the same browser each time and export a backup weekly. Need help? Message me on Etsy. Athar
```

## 0.7 After saving
Make all edits in one session, then leave listing alone 14 days. Check Stats → Search terms weekly. Low views → tags/title. Views but no clicks → photo 1. Clicks but no sales → price, photos 2–4, first description lines.

---

# Mediterranean Meal Planner: Etsy Listing Kit (v2, 29 Sep 2026)

Live listing: https://www.etsy.com/listing/4581630401 (listed 24 Sep 2026)

This version replaces the v1 kit. Section 1 explains why the listing isn't ranking. Sections 2–9 are ready to copy and paste.

---

## 1. Why it isn't ranking: what I found

Checked on 29 Sep 2026 against the live listing, the shop page and Etsy search.

### A. Problems in the listing (fix now)

| # | Problem | Why it hurts | Fix |
|---|---------|--------------|-----|
| 1 | **Your video shows your private app link.** The screen recording includes the Chrome address bar with `olivora-app-7k2q.netlify.app`. | Anyone watching can use the full app for free. | Delete that video from the listing now. Rename the Netlify site to a new hidden name, regenerate the Start Here PDF with it (`node 5-SOURCE/guide/make-guide.js "https://NEW-LINK"`) and re-upload the PDF. Upload `video/Mediterranean-Meal-Planner-Etsy-Video-15s.mp4` instead. It shows no URLs. |
| 2 | **Photo 1 (thumbnail) is the AI-generated "Premium hero".** It has garbled text ("MEAMEANER", "Good morning, Ma") and a real food photo that doesn't exist in the app. | Etsy requires photos to show the actual item. A thumbnail that looks fake lowers clicks, and clicks are one of Etsy's strongest ranking signals. | Replace it with `images/01-hero.jpg`, which is built only from real app screenshots. |
| 3 | **Wrong image shape for search.** Etsy search now shows thumbnails as **4:5 portrait** (measured at 255×319 px, center-cropped). The old images were 4:3 landscape. | In search, the left and right edges are cut off, so your headline text disappears. | All 10 new images are **2400×3000 (4:5)**. The hero keeps its key content inside a square safe zone, so it also works on square surfaces. |
| 4 | **Health claims in the description**: "proven benefits of the Mediterranean diet", "heart-healthy meal ideas". | Etsy prohibits medical and health claims and can suppress or remove listings that make them. | Use the new description in section 4. It keeps the planner benefits and drops the health claims. |
| 5 | **Promises more recipes than you ship.** "Weekly Meal Planner with Mediterranean-style recipes" reads like a recipe pack. The app ships with 8 sample recipes. | Buyers expecting 100+ recipes leave bad reviews, which hurts future ranking. | The new copy says exactly what's included: 8 sample recipes, and you add unlimited recipes of your own. |
| 6 | **"Party decor for gatherings and celebrations"** appears under Highlights. | Wrong attributes confuse Etsy about who the item is for. | In the listing editor, clear any Occasion, Celebration or Holiday attribute. Set the category and attributes as in section 5. |
| 7 | **The ZIP duplicates the other files** (the listing shows 1 PDF, 1 TXT, 1 ZIP, 1 other file). | Buyers can't tell which file is the product, which leads to more "it doesn't work" messages. | Upload only 3 files: `Mediterranean-Meal-Planner.html`, `Mediterranean-Meal-Planner-Start-Here.pdf` and `LICENSE.txt`. |

### B. Shop-level problems (these affect all 6 listings)

| # | Problem | Fix |
|---|---------|-----|
| 8 | Your **About section** still says "Website Templates & Digital Designs for Small Business", but every product in the shop is a planner app. | Use the About text in section 8. |
| 9 | All **FAQ questions** are titled "Custom and personalised orders", and one answer talks about editing CSS variables and Canva. | Replace them with the FAQs in section 8. |
| 10 | **Manufacturer info** shows a personal email and a hostel address to the public. | EU product-safety rules need a contact point. Consider a business email and a business or PO-box address. |

### C. Things that are normal (don't panic)

- **The shop is 5 days old, with 0 sales and 0 reviews.** Etsy has almost no data on new listings. It learns from clicks, favourites and sales, so the first 2–6 weeks are always slow. Better photos and copy speed this up, but they can't skip it.
- **Changing images doesn't get you "penalised".** Changing them every day does make it impossible to tell what works, though. After this update, leave the listing alone for **14 days**, then check Stats.
- **Your search competition** for "mediterranean meal plan" is mostly bold, text-heavy printables (for example, "365 days", "120+ recipes"). Your advantage is that Mediterranean Meal Planner is an app, so the new images lead with **"Digital App · Auto Grocery List"** and include an "App vs PDF" comparison (image 10).

---

## 2. Title (131 characters, main keyword first)

```
OLD, replaced. Use section 0.
```

Shorter alternative, if you'd rather keep it tight:

```
OLD, replaced. Use section 0.
```

## 3. The 13 tags (all ≤ 20 characters, none repeat the title word for word)

```
OLD, replaced. Use section 0.
```

Don't use other brand names (Notion, Canva, Mealime, etc.) as tags.

## 4. Description (paste as-is)

The first 2 lines matter most, because they show in search previews and Google.

```
Mediterranean meal planner app: plan your week, keep your recipes, and turn your meals into a sorted grocery list in one tap. Instant digital download for phone, tablet and computer. No subscription, no account.

Mediterranean Meal Planner is a real interactive app, not a printable PDF. Open it on your computer, or add it to your phone's Home Screen and use it like an app. It works offline, and everything you enter stays private on your device.

━━━━━━━━━━━━━━━━━━
★ WHAT'S INSIDE: 12 TOOLS IN ONE APP
━━━━━━━━━━━━━━━━━━
• WEEK PLAN: breakfast, lunch, dinner and snacks for every day. Copy last week in one tap.
• RECIPES: ingredients, method, photos, favourites and category filters. Add as many as you like.
• SHOPPING LIST: built automatically from your planned meals, sorted by aisle. It skips what's already in your pantry and merges duplicates.
• PANTRY: track what you have, with use-by alerts so less food goes to waste.
• BALANCE: tag meals with food groups (vegetables, legumes, fish, whole grains, olive oil and more) and see how your week lines up with Mediterranean-style eating.
• TODAY: today's meals, water tracker and tasks at a glance.
• PREP LIST: soak, chop and batch-cook reminders.
• GOALS & WATER, CALENDAR and JOURNAL.
• PRINT your week (landscape), shopping list or any recipe card.
• BACKUP & RESTORE: one-tap backup file with a weekly reminder. CSV export.
• Light and dark mode, 5 accent colours, and an option to hide calories.

Starts with a sample week and 8 Mediterranean-style sample recipes so you can explore. Clear them in one tap and add your own.

━━━━━━━━━━━━━━━━━━
★ WHY AN APP INSTEAD OF A PRINTABLE?
━━━━━━━━━━━━━━━━━━
✔ Your grocery list writes itself from your meal plan
✔ Search every recipe and meal
✔ Plan on your laptop, shop from your phone
✔ You can still print whenever you want

━━━━━━━━━━━━━━━━━━
★ WORKS ON
━━━━━━━━━━━━━━━━━━
iPhone, iPad, Android, Mac, Windows and Chromebook, in Chrome, Safari, Edge or Firefox.
On your phone, open your personal link (in the Start Here guide) and tap "Add to Home Screen".

━━━━━━━━━━━━━━━━━━
★ WHAT YOU'LL RECEIVE
━━━━━━━━━━━━━━━━━━
1. Mediterranean-Meal-Planner.html: the app
2. Start Here guide (PDF): 1-minute setup, phone install and your personal online link
3. Licence (personal use)

This is a digital download. No physical item will be shipped.

━━━━━━━━━━━━━━━━━━
★ GOOD TO KNOW
━━━━━━━━━━━━━━━━━━
• Your data is saved in the browser you use. Use the same browser each time, and back up weekly (Mediterranean Meal Planner reminds you).
• Mediterranean Meal Planner doesn't sync automatically between devices. To move your plans, export a backup on one device and restore it on the other.
• Mediterranean Meal Planner is a planning tool. It does not give medical or nutritional advice.
• For personal use only. Please don't share or resell.
• Because this is a digital product, returns aren't accepted, but I'm always happy to help. Just send me a message.

Designed and built by me (KaelLabs). AI tools assisted with parts of the coding, images and listing copy. Every feature was reviewed and tested by hand. App screens in the photos are real screenshots with example data.

Made by Athar at KaelLabs. Explore my other offline planner apps in the shop.
```

## 5. Listing settings

- **About this listing:** Who made it: *I did*. What is it: *A finished product*. When was it made: *2020–2026*.
- **Type:** Digital files.
- **Category:** Planner Templates (see section 0). Your current category is Stationery → Design & Templates → Templates → Planner Templates, which is for editable templates. If Etsy suggests a different planner category while you type "meal planner", pick that one.
- **Attributes:** fill in every planner-related one Etsy offers (for example, *Planner type: meal / food*, *Time frame: weekly*, *Digital format*). Leave **Occasion, Holiday and Celebration empty**. That's what shows "Party decor" today.
- **Files (3):** `Mediterranean-Meal-Planner.html`, `Mediterranean-Meal-Planner-Start-Here.pdf` (regenerated with your NEW link), `LICENSE.txt`. Upload the ZIP + PDF (see section 0).
- **Photos:** upload all 10 from `3-ETSY-LISTING/images`, **in order** (section 6). Leave Etsy's thumbnail crop centred.
- **Video:** `3-ETSY-LISTING/video/Mediterranean-Meal-Planner-Etsy-Video-15s.mp4`. It's a 15 s real screen recording of the live app (1920×1200, no browser bar, no audio). It starts on Week Plan and adds a meal live, then goes Calendar → Recipes → Shopping → Pantry → Balance → Goals & Water → Settings (accent colours + dark mode) → Home, and ends on a brand card.
- **Price:** your current €21.14 → €10.36 (51% off) sale is fine. When the sale ends, renew it at 40–50% off rather than dropping the list price. Keep it until you have 5+ reviews.
- **Quantity:** 999, with auto-renew on. **Personalisation:** off.

## 6. Photo order: what each image is for

All images are 2400×3000 px (4:5), JPG, under 600 KB, and made only from real screenshots of the app with sample data.

| # | File | Job |
|---|------|-----|
| 1 | `01-hero.jpg` | Thumbnail. Big readable keyword "Mediterranean Meal Planner", marked as a DIGITAL APP, laptop + phone. |
| 2 | `02-week-plan.jpg` | The main feature: the full week grid. |
| 3 | `03-recipes-to-list.jpg` | The "wow" moment: recipe → grocery list in one tap. |
| 4 | `04-on-your-phone.jpg` | Answers "does it work on my phone?" |
| 5 | `05-balance.jpg` | The Mediterranean-specific feature. |
| 6 | `06-pantry-prep.jpg` | Pantry use-by alerts + prep list. |
| 7 | `07-12-tools.jpg` | Everything included. |
| 8 | `08-private-dark.jpg` | Privacy, backups, dark mode. |
| 9 | `09-how-it-works.jpg` | 3 steps + what you receive + devices. Cuts down on pre-sale questions. |
| 10 | `10-app-vs-printable.jpg` | Why it's worth more than a €3 PDF. |

### Alt text for each photo (paste into Etsy: Photos → hover the photo → "Add alt text")

Alt text helps buyers who use screen readers, and Google Images can read it. Each line below describes what the image shows, uses the main keywords naturally and stays under 250 characters. Don't copy-paste the same text onto every photo.

| # | File | Alt text |
|---|------|----------|
| 1 | `01-hero.jpg` | Mediterranean meal planner digital app shown on a laptop week plan and a phone home screen, with the text Digital App, Auto Grocery List, recipes and weekly plan, works on phone and computer, no subscription |
| 2 | `02-week-plan.jpg` | Weekly meal planner grid showing breakfast, lunch, dinner and snacks for Sunday to Saturday, with Mediterranean meals like Greek chickpea salad, lentil soup and lemon herb salmon, plus add meal, shopping list, copy last week and print buttons |
| 3 | `03-recipes-to-list.jpg` | Two phone screens: a Greek chickpea salad recipe with ingredients and a Plan it button, and the grocery list it creates, sorted by aisle, skipping pantry items and merging duplicates |
| 4 | `04-on-your-phone.jpg` | Three phone screens of the Mediterranean Meal Planner meal planner app, showing today's meals and water tracker, the home dashboard with meals planned this week, and the shopping list, on a blue background |
| 5 | `05-balance.jpg` | Balance screen of the Mediterranean meal planner showing food groups this week (vegetables, fruit, legumes, whole grains, fish and olive oil) with progress bars and a calories-by-day chart |
| 6 | `06-pantry-prep.jpg` | Two phone screens: a pantry inventory with use-by date alerts for items like feta, yogurt and olive oil, and a meal prep to-do list for soaking, chopping and batch-cooking |
| 7 | `07-12-tools.jpg` | Grid of 12 tools in the meal planner app: week plan, today, recipes, shopping list, pantry, balance, prep list, goals and water, calendar, journal, backup and dark mode |
| 8 | `08-private-dark.jpg` | Meal planner app in dark mode on a phone, with the points: no account or login, nothing uploaded, one-tap backups, light and dark mode with 5 accent colours, and works offline |
| 9 | `09-how-it-works.jpg` | Three steps to use the digital meal planner (download, open, plan), what you receive (HTML planner app, Start Here PDF guide, licence) and supported devices: iPhone, iPad, Android, Mac, Windows, Chromebook |
| 10 | `10-app-vs-printable.jpg` | Comparison table of the Mediterranean Meal Planner meal planner app vs a PDF printable planner: automatic grocery list, sorted by aisle, copy last week, search recipes, use on phone and computer, and print your week |

**Video:** Etsy has no alt-text field for videos, so nothing to add there.

**Videos**
- `video/Mediterranean-Meal-Planner-Etsy-Video-15s.mp4`: for the Etsy listing (Etsy allows 5–15 s). It's a real, fast-cut screen recording of every section of the app.
- `video/Mediterranean-Meal-Planner-Feature-Tour-Full.mp4` (38 s, every feature graphic): for Pinterest idea pins, Instagram Reels and TikTok. Etsy won't accept it, because it's longer than 15 s.

## 7. Policy & compliance

- **AI disclosure:** Etsy's Creativity Standards ask sellers to disclose when AI tools were used to create an item. If AI helped build Mediterranean Meal Planner, add a line such as: *"Designed and built by me; AI-assisted tools were used during development."* That's your call, but Etsy enforces it.
- **No health claims** anywhere (title, tags, photos, description): no "heart-healthy", "lose weight", "proven benefits", "lower cholesterol" and so on. "Mediterranean-style" and "planning tool" are safe.
- **Photos must show the real product.** Don't go back to AI-generated mockups with food photography the app doesn't contain.
- **Keep your hosted link private.** Never show a browser address bar in screenshots or videos. The link belongs only inside the paid PDF.

## 8. Shop fixes (Shop Manager → Settings → Info & Appearance / Policies)

**About: headline**
```
Private, offline planner apps for real life
```

**About: story**
```
Hi, I'm Athar, a software engineer and UI designer. I build calm, beautiful planner apps you download once and keep: meal planning, family organising, ADHD-friendly planning, wedding planning and more.

Every planner works offline in your browser on phone, tablet or computer. There's no account and no subscription, and your data stays on your own device.

Questions before you buy? Send me a message. I usually reply within a day.
```

**FAQs (replace all the current ones)**
- *How do I get my files?* Right after payment, go to You → Purchases and reviews → Download files.
- *Do I need an app or an account?* No. The planner opens in any modern browser (Chrome, Safari, Edge, Firefox). On your phone, use the link in the Start Here guide and tap "Add to Home Screen".
- *Where is my data saved?* Only on your device, in your browser. Nothing is uploaded. Use the same browser each time, and back up from Settings.
- *Does it sync between my phone and laptop?* Not automatically. Export a backup on one device and restore it on the other.
- *Can I share it or resell it?* No. Each purchase is for personal use by one household.

## 9. The next 30 days

1. **Today:** delete the old video, rotate the Netlify link, re-upload the PDF, then swap in the new photos, video, title, tags, description and attributes (all at once).
2. **Then leave the listing alone for 14 days.** Check Stats weekly:
   - Low views → the title or tags are the problem. Adjust only those.
   - Views but few clicks → the thumbnail is the problem. Try a variant of photo 1.
   - Clicks but no sales → look at price, photos 2–4, and the description's opening lines.
3. **Share outside Etsy:** post the full feature-tour video as a Pinterest pin and an Instagram/TikTok reel, linking to the listing. Meal-planning content does well on Pinterest, and outside traffic that converts helps your Etsy ranking.
4. **Reviews:** turn on Etsy's automatic review request. Your first 5 reviews matter most.
5. **Etsy Ads (optional):** a small daily budget (about €1–2) for 2–3 weeks gives Etsy early click data. Turn it off if it gets no sales after about 3 weeks.
6. **Version updates:** bump `VERSION` in `build.py`, rebuild and re-upload. Tell buyers to **Export backup** in the old version before opening the new file, then **Restore backup**.

## 10. Pre-publish checklist

- [ ] Old video deleted from the listing
- [ ] Netlify site renamed (old link dead); new link tested on iPhone + Android (Add to Home Screen, airplane mode)
- [ ] `Mediterranean-Meal-Planner-Start-Here.pdf` regenerated with the new link (no red placeholder) and re-uploaded
- [ ] ZIP + Start Here PDF uploaded (see section 0)
- [ ] 10 new photos uploaded in order, thumbnail crop centred
- [ ] Alt text added to all 10 photos (section 6)
- [ ] `Mediterranean-Meal-Planner-Etsy-Video-15s.mp4` uploaded
- [ ] New title, 13 tags and description pasted (AI line decided)
- [ ] Category changed; Occasion/Holiday/Celebration attributes empty ("Party decor" gone)
- [ ] Shop About + FAQs updated
- [ ] Hands off for 14 days, then review Stats



########################################################################################################################################################################################### Latest

# Mediterranean Meal Planner — KIT
Listing: https://www.etsy.com/listing/4581630401
Priority: Medium
Updated: 2026-10-07 | Status: live, 0 sales

> CHECK: delete any feature line below that the app does not have.

## Step 1 — Title (10 words)
```
Mediterranean Meal Planner with Weekly Menu, Recipes and Grocery List
```

## Step 2 — Tags (13)
```
meal planner, mediterranean diet, weekly meal planner, menu planner, recipe organizer, grocery list, meal prep planner, healthy eating, digital meal plan, food planner, recipe book, diet planner, shopping list
```

## Step 3 — Description
```
Mediterranean Meal Planner with weekly menu, recipes and grocery list in one place. Works offline on phone, tablet and computer. Buy once, no subscription.

Mediterranean Meal Planner makes healthy eating simple: plan the week, keep your recipes, shop with one list. No account. Your data stays on your device.

━━ WHAT'S INSIDE ━━
✔ Weekly menu planner
✔ Recipe organizer
✔ Grocery list

━━ HOW IT WORKS ━━
1. Buy and download instantly
2. Open the file in Chrome, Safari or Edge
3. Plan your week. Works offline

━━ GOOD TO KNOW ━━
• Digital download. Nothing is shipped
• Needs a modern browser (Chrome, Safari, Edge)
• Data saves in your browser. Use Export/Backup often; clearing browser data can erase it
• Personal use only. Not medical or diet advice
• Questions? Message me, I reply fast

Designed and built by me (KaelLabs). AI tools assisted with parts of the coding, images and listing copy. Every feature was reviewed and tested by hand. Photos show real app screens with example data.

More planners: https://kaellabs.etsy.com
```

## Step 4 — Price
$9.99

## Step 5 — Photos (10) + video
1. Thumbnail: olive/green tones, phone + laptop, big text "MEDITERRANEAN MEAL PLANNER"
2. Weekly menu screen
3. Recipe screen
4. Grocery list screen
5. Feature grid
6. "Plan once, shop once"
7. "Works on phone, tablet, computer. No subscription"
8. Dark mode
9. Phone in kitchen mockup
10. "How to use" 3 steps
Video: 10 sec scroll

## Step 6 — Section: Meal Planners

## Change log
- 2026-10-07: new title, tags, description, photo plan.
- 2026-10-07: short title (Etsy tip). Added AI disclosure line.