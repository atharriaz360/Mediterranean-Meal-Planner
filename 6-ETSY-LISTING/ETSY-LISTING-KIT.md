# ETSY LISTING KIT — MEDITERRANEAN MEAL PLANNER

Final recommended copy is under “Recommended copy” below. Audit notes are internal and are not part of the description. Nothing has been published.

## Supplied baseline

- Listing: https://www.etsy.com/listing/4581630401/mediterranean-meal-planner-app-weekly
- Original title: Mediterranean Diet Meal Planner App with Grocery List & Recipe Organizer
- Original tags: mediterranean diet, meal prep planner, recipe collection, pantry tracker, grocery list, recipe organizer, meal planner app, shopping list, digital meal planner, weekly meal plan, meal planning app, offline meal planner, meal plan organizer
- Original description and listing-editor details were supplied in this chat; they are superseded by the final copy below.

## Audit — current review

Review date: 2026-11-03. Preliminary review; keyword research and full runtime audit remain open. The original title and tags are preserved above as a compact baseline. Final copy below incorporates both supplied keyword batches.

### Evidence and baseline

- VERIFIED — Brave Browser is signed into eRank as KaelLabs. Listings and Bulk Keyword Tool inspected; USA selected. The existing bulk results concern ADHD terms, not this meal planner. No meal-planner keyword results collected yet.
- VERIFIED — Supplied export and live eRank Listings show listing 4581630401: 37 total views, 0 total sales, grade A, $14.27 item price, 11 images, 13 tags. Export reports age 41 days, created 2026-09-24, last updated 2026-11-02. Source: supplied eRank export and Brave eRank Listings on review date. These are total metrics, not last-30-day visits or impressions.
- VERIFIED — Supplied Etsy search screenshot shows €7.91 and 51% off for KaelLabs. This is a different currency/display context from eRank; it is not a verified USD sale price.
- UNKNOWN — Impressions, listing visits, traffic sources, search terms, favorites, orders by date range, current US checkout price, and Search Visibility warnings. No CTR or conversion rate can be calculated from the supplied totals.
- INFERENCE — 37 total views is too little evidence to isolate poor conversion as the cause. Visibility, buyer intent, setup friction and image appeal all remain hypotheses. Grade A does not establish demand.

### Product truth — observed, not runtime-tested

Source: README.md, existing listing description and 5-SOURCE/src/app.js.

| Claim | Evidence | Status / limit |
|---|---|---|
| Single-file browser app | README and 1-SELL-THIS/Mediterranean-Meal-Planner.html | VERIFIED file exists; not opened in this review |
| Week plan to grocery list | genShopping action and From week plan control in app.js | VERIFIED implementation observed; output correctness untested |
| Backup / restore / CSV | exportBackup, importBackup and exportCSV controls in app.js | VERIFIED implementation observed; round trip untested |
| Local saving | Browser storage code and settings disclosure in app.js | VERIFIED implementation observed; reopen persistence untested |
| Device transfer | Settings instruct backup here, restore there | VERIFIED wording; automatic sync must not be implied |
| Offline / phone access | README separates downloadable app, hosted app and demo | UNKNOWN runtime offline and phone setup in this review |

Buyer: INFERENCE — someone who wants to plan Mediterranean meals and turn them into an organized grocery list without maintaining separate tools. Setup effort matters more than luxury device styling.

Data-loss disclosure: VERIFIED code warns that local-file moves may need backup restoration, browser storage may be limited, and backups should be exported. Keep these limits visible in buyer guidance. Cross-browser compatibility, accessibility, shipped ZIP/PDF contents, hosted behavior and support promises still need validation. No test suite was run in this review.

### Hero review

Sources: images/hero-refined.jpg, supplied Etsy grid screenshot, temporary 300 px and 150 px previews. All scores below are INFERENCE: visual judgments, not measured conversion results.

| Requested factor | Score / answer | Short reason |
|---|---|---|
| 1. 3-Second Winner Power | 7/10 | Product category reads quickly; distinct buying reason is less immediate. |
| 2. Premium / Luxury Feel | 8/10 | Warm stone, dark green and restrained styling feel polished. |
| 3. Psychological Conversion Strength | 6/10 | Calm mood helps; the busy calendar and technical browser badge add effort. |
| 4. Thumbnail Clarity / Readability | 6/10 | Headline survives; meaningful screen text and footer disappear at 150 px. |
| 5. Hierarchy / Information Flow | 7/10 | Name, benefit, screens is logical; grocery-list proof receives too little space. |
| 6. Contrast / Grid Visibility | 6/10 | Strong dark text, but cream and green are common in the supplied grid. |
| 7. Emotional Appeal / Trust | 7/10 | Calm food setting and visible UI help; mockup polish alone proves no usability. |
| 8. CTA / Benefit Clarity | 7/10 | Week planning and groceries are named; the connection could be clearer. No button CTA is necessary. |
| 9. Overall Conversion Potential | 6/10 | Plausible visual candidate; setup, saving and proof remain purchase questions. Actual conversion is UNKNOWN. |
| 10. Currently top 1%? | No substantiated claim | UNKNOWN percentile; no representative benchmark or conversion dataset. |
| 11. Really convincing / catchy / suited? | Partly | Mediterranean styling fits. Useful offer, but not a proven instant winner. |

Overall subjective score: INFERENCE — 6.7/10. Verdict: average-premium; needs testing. Not a verified three-second winner.

Top strengths:
- Clear, large product name.
- Calm, niche-appropriate palette and food setting.
- Week plan and grocery list appear together.

Top weaknesses:
- The product's useful details collapse at search-thumbnail size.
- Large props and full calendar compete with benefit proof.
- Browser-app wording leads with technology rather than ease or outcome.

Ranked improvements — proposals, not claims of measured uplift:
1. Make the meal-plan-to-list relationship visually obvious with a larger real grocery list and a simple directional cue. Show fewer details at larger size.
2. Reduce decorative food/foliage and unused calendar area. Keep the existing readable product name; enlarge the benefit line.
3. Test a short, plain format label and one verified reassurance. Avoid a wall of badges or unsupported sync / family-sharing claims.
4. Check square and portrait crops in Etsy's thumbnail editor before upload. The supplied search screenshot has a tall crop; it is not proof of every mobile crop.
5. Ask five unfamiliar people to view the 150 px image for three seconds, then identify product format and main benefit. Use this only as a comprehension check. A sales test needs real traffic and orders.

### Actual technical check

VERIFIED from sips and file stat on images/hero-refined.jpg:
- 3000 × 2250 px, exactly 4:3.
- JPEG, RGB, embedded sRGB IEC61966-2.1 profile.
- 710,719 bytes; under 1 MB.

These meet our production targets. 8K detail is not a property of this 3000 × 2250 export. Exact iPhone 15 Pro or iPad model proportions were not measured; Apple model accuracy is UNKNOWN. INFERENCE: devices look plausible, but the screens have a composited/mockup feel rather than verified physical product photography. Do not add reflections or grain over the UI; readability takes priority.

Image direction: natural device materials, subtle edge reflections, soft daylight, restrained texture and real app screenshots. Use accurate device frames only after verifying proportions. Keep the calm lifestyle mood; avoid glossy plastic surfaces, heavy cinematic effects and fake UI. “Best ever on Etsy” remains UNKNOWN.

### Observed competitor context

VERIFIED — Supplied screenshot, not a fresh US search session:
- FinNestStudio: €11.02, 25% off; visible grocery-list hook and 64-recipe badge. Adjacent meal-planner app. Its sharing claim is not a KaelLabs feature.
- SystemifyStudio: €9.85, 40% off; large dashboard and multiple tool labels. Adjacent app.
- UdexShop: €3.96, 50% off; dark green/gold, dense dashboard presentation. Adjacent HTML planner.
- DataDeskHQ: €8.83, 40% off; purple dashboard, large weekly-meal-planner heading. Adjacent app.
- HtmlSystemsPlanners: €4.42; light lifestyle scene and recipe-count badge. Adjacent HTML app.
- TrustPrintPlan: €5.37, 40% off; 128-meal and grocery-list hook. Different format: printable meal-plan bundle.

INFERENCE — FinNestStudio states a concrete convenience benefit more strongly; KaelLabs has a cleaner headline than several dense rivals. Current screenshot review counts are not verified listing-level sales evidence. Search query, country, capture date, personalization, ad placement and full listing details are UNKNOWN. No universal rank or competitor performance claim is supported.

ADHD budget / digital planner comparison: UNKNOWN best-performing listings. Public Etsy market pages show mixed PDFs, spreadsheets and apps; search snippets and review totals cannot verify current best sellers or conversion. Do not borrow their feature density or ADHD positioning without product and buyer evidence. A valid live comparison remains open.

### Image sequence

VERIFIED — images/contact-sheet.png shows workflow, week, phone, recipes, pantry, balance, tools, privacy and setup panels. Its first tile is labeled 01-hero.jpg and differs from hero-refined.jpg; treat that sheet as stale for hero selection.

INFERENCE — The sequence covers features better than objections. Saving/backup, no automatic sync, phone setup and exact included files deserve a readable panel rather than fine print. Video has not been watched in this review. Full-size checks for all secondary images remain open.

### Current official guidance checked

- VERIFIED — Etsy recommends images at least 2000 px in both dimensions and conversion to sRGB. It warns that files above 1 MB may have upload trouble. 3000 × 2250 and under 1 MB are our targets, not a universal Etsy format mandate. Source: https://help.etsy.com/hc/en-gb/articles/115015663347-Requirements-and-Best-Practices-for-Images-in-Your-Etsy-Shop
- VERIFIED — Digital downloads with visual content should include an actual visual preview or excerpt; images must not mislead. The digital-download rule is distinct from the general physical-photo rule. Source: https://www.etsy.com/legal/policy/listing-image-requirements/253962679005
- VERIFIED — Etsy offers buyer-friendly title guidance; title length advice should not be presented as proof of demand or a blanket policy violation. Source: https://www.etsy.com/au/seller-handbook/article/1399426136697
- UNKNOWN — Complete current rules review for discounts, external demo links, digital delivery and AI-created product disclosure remains open. No demo or pricing change recommended yet.

### Keyword evidence — first batch received

VERIFIED transcription — User-supplied eRank results, Etsy / USA as requested, received 2026-11-03. Not independently rerun. Trend cells refer to October 2026; the exact averaging window for Avg. Searches / Clicks is UNKNOWN. Do not treat the trend cell as the average, or eRank estimates as exact Etsy counts. Google searches are a separate source and do not establish Etsy demand.

| Keyword | Search Trend | Avg. Searches | Avg. Clicks | Avg. CTR | Etsy Competition | KD | Google Searches |
|---|---|---|---|---|---|---|---|
| mediterranean meal planner | Oct 2026 10 | < 20 | < 20 | < 20% | 152 | 70 | - |
| mediterranean diet planner | Oct 2026 0 | < 20 | - | - | 167 | 96 | - |
| meal planner app | Oct 2026 10 | < 20 | - | - | 176 | 100 | - |
| weekly meal planner | Oct 2026 10 | 434 | 538 | 124% | 26,757 | 89 | 9,900 |
| digital meal planner | Oct 2026 10 | 298 | 199 | 67% | 30,523 | 100 | 170 |
| meal planning app | Oct 2026 0 | Unknown | - | - | 395 |  | - |
| grocery list planner | Oct 2026 10 | < 20 | < 20 | < 20% | 22,444 | 100 | - |
| recipe organizer | Oct 2026 10 | 203 | 195 | 96% | 5,536 | 72 | 880 |

INFERENCE — Recommended direction:
- Lead with weekly meal planner, while keeping App visible so printable-only buyers can self-select. This is the highest-demand phrase in this batch, but competition is substantial and the results do not prove app-specific intent.
- Keep recipe organizer as the second supported angle: 203 estimated average searches and 5,536 competing listings. This is a comparatively useful balance within this batch, not a promise of easier ranking.
- Keep Mediterranean as the product's distinguishing theme. Both researched Mediterranean phrases show low estimated demand; that does not make them irrelevant or useless.
- Digital meal planner has observed demand but may attract Goodnotes/PDF buyers. Explain the browser-app format early.
- Meal planning app has missing search evidence, not proven zero demand. Grocery list planner shows low estimated demand and high competition; do not lead with it.
- 124% is eRank's keyword CTR estimate, not this listing's CTR or conversion rate. More than one click per search can produce a value above 100%.

### Keyword evidence — second batch and final decision

VERIFIED transcription — User-supplied second eRank batch, received 2026-11-03, USA requested. Trend strings below preserve the pasted spacing exactly. The average measurement window remains unspecified; these are not October-only average counts.

| Keyword | Search Trend as supplied | Avg. Searches | Avg. Clicks | Avg. CTR | Etsy Competition | KD | Google Searches |
|---|---|---|---|---|---|---|---|
| mediterranean diet | Oct 20261,670 | 1,244 | 1,276 | 103% | 923 | 1 | 673,000 |
| meal prep planner | Oct 202610 | 343 | 366 | 107% | 13,418 | 80 | 2,400 |
| pantry tracker | Oct 20260 | < 20 | < 20 | < 20% | 1,006 | 100 | 320 |
| grocery list | Oct 20261,370 | 914 | 951 | 104% | 29,407 | 75 | 60,500 |
| shopping list | Oct 202610 | 43 | 53 | 123% | 28,244 | 100 | 22,200 |
| recipe collection | Oct 202610 | 87 | - | - | 4,638 | 86 | - |
| offline meal planner | Oct 20260 | Unknown | - | - | 222 |  | - |
| meal plan organizer | Oct 20260 | < 20 | - | - | 5,712 | 100 | - |
| weekly meal plan | Oct 202610 | 93 | < 20 | < 20% | 17,860 | 100 | 9,900 |
| recipe planner | Oct 20260 | < 20 | < 20 | < 20% | 16,420 | 100 | 170 |
| grocery list app | Oct 20260 | Unknown | - | - | 36 |  | - |
| meal prep app | Oct 20260 | Unknown | - | - | < 20 |  | - |

INFERENCE — The second batch changes the lead recommendation: Mediterranean diet has the strongest estimated search demand and lowest displayed KD in these two batches. Keep that accurate theme at the start, immediately qualified by Meal Planner App. Broad diet demand includes food guides, recipe books and ready-made plans; it does not prove demand for a browser app. Weekly meal planner, grocery list, recipe organizer and meal prep planner support the offer. Keep the 13-tag set; do not replace relevant feature tags with unrelated high-volume terms. Unknown app-term data is not proof of zero demand. No more keyword research is required for this copy revision.

### Recommended copy — ready to paste, not published

This section supersedes the copy in the raw listing-editor baseline above. Runtime and compatibility checks listed in the audit remain open. The wording stays within existing product claims and inspected implementation; no new recipe counts, sync, sharing, medical outcomes or device guarantees added.

Recommended title:

Mediterranean Diet Meal Planner App: Weekly Plan, Grocery List & Recipe Organizer

81 characters; 12 whitespace-separated words (including &).

Alternative:

Weekly Meal Planner App: Mediterranean Diet, Grocery List & Recipe Organizer

76 characters; 11 whitespace-separated words (including &).

Exactly 13 recommended tags:

```text
weekly meal planner, recipe organizer, digital meal planner, mediterranean diet, meal planner app, meal prep planner, pantry tracker, grocery list, shopping list, recipe collection, offline meal planner, meal plan organizer, weekly meal plan
```

Tag evidence: All 13 exact recommended tags now have supplied eRank results. Unknown and low-volume results are preserved; feature relevance still matters. These are estimates, not listing performance.

| Tag | Characters | Searches / clicks / CTR / competition / KD | Buyer intent |
|---|---:|---|---|
| weekly meal planner | 19 | 434 / 538 / 124% / 26,757 / 89 | Plan a week of meals |
| recipe organizer | 16 | 203 / 195 / 96% / 5,536 / 72 | Keep personal recipes |
| digital meal planner | 20 | 298 / 199 / 67% / 30,523 / 100 | Use a digital planning tool |
| mediterranean diet | 18 | 1,244 / 1,276 / 103% / 923 / 1 | Mediterranean eating theme |
| meal planner app | 16 | < 20 / - / - / 176 / 100 | Find an app rather than paper |
| meal prep planner | 17 | 343 / 366 / 107% / 13,418 / 80 | Organize meal preparation |
| pantry tracker | 14 | < 20 / < 20 / < 20% / 1,006 / 100 | Keep track of pantry items |
| grocery list | 12 | 914 / 951 / 104% / 29,407 / 75 | Build a grocery list |
| shopping list | 13 | 43 / 53 / 123% / 28,244 / 100 | Organize shopping |
| recipe collection | 17 | 87 / - / - / 4,638 / 86 | Collect recipes |
| offline meal planner | 20 | Unknown / - / - / 222 / — | Plan without a continuing connection after setup |
| meal plan organizer | 19 | < 20 / - / - / 5,712 / 100 | Organize meal plans |
| weekly meal plan | 16 | 93 / < 20 / < 20% / 17,860 / 100 | Plan weekly meals |

Only tag-set substitution versus supplied baseline: weekly meal planner replaces meal planning app. This trades a phrase with missing demand data for a researched relevant phrase. Tag order itself is not claimed to improve ranking. No final category/attribute redundancy finding is possible without the available attribute choices; do not add inaccurate attributes.

Ready-to-paste description:

Mediterranean diet meal planner app for weekly meal planning, a grocery list and recipe organization. Keep your meals, recipes and pantry together in one browser app, without a spreadsheet or monthly subscription.

Plan meals from your saved recipes, then use From week plan to build a shopping list from their ingredients. Review the list before shopping: it uses each linked recipe once per week, skips matching pantry items and does not automatically scale quantities for repeated meals or household servings. Meals entered without a linked recipe do not supply ingredients.

WHAT YOU CAN DO
- Plan breakfast, lunch, dinner and snacks in a weekly meal planner
- Copy meals from the previous week and view your calendar
- Save your own recipes, ingredients, methods, photos and favorites
- Explore the included Mediterranean starter recipes and sample week
- Build a grocery list from recipes linked to your week plan
- Add shopping items yourself, organize them by aisle and tick off purchases
- Track pantry items and use-by dates
- Keep a prep list, goals, water log and journal
- Review food-group balance and optional calorie entries
- Choose light or dark mode
- Print week plans, shopping lists and recipe cards from the app
- Export meal and recipe records as CSV, or save a full backup for restoration

WHAT YOU GET
- Mediterranean-Meal-Planner-Digital-Download.zip containing Mediterranean-Meal-Planner.html, the Start Here PDF and LICENSE.txt
- Mediterranean-Meal-Planner-Start-Here.pdf supplied separately for easy access
- No physical item, device, printed planner or spreadsheet is included

HOW TO START
1. Download your files from Etsy and unzip the ZIP on your computer
2. Open Mediterranean-Meal-Planner.html in your browser
3. Explore the sample data, or clear it and add your own meals and recipes
4. For phone or tablet setup, follow the hosted-link instructions in the Start Here guide
5. Link recipes to your planned meals, then choose From week plan to build your grocery list

OFFLINE, STORAGE AND BACKUPS
- One-time purchase. No subscription or planner account
- The downloaded HTML app is designed to work offline on your computer
- The setup guide covers Chrome, Edge, Safari and Firefox on computer; Safari on iPhone/iPad and Chrome on Android for hosted access
- Phone and tablet setup needs internet for the first hosted load. Follow the guide to add the app to your home screen; load it fully before relying on offline access
- Entries save in your browser on your device
- Devices do not sync automatically; there is no live shared shopping list
- Use Settings → Back up now regularly. Use Restore backup to move a copy to another browser or device
- Restoring a backup replaces the planner data currently in that browser
- Clearing browser data, private browsing or storage limits can remove or prevent saved data. Keep downloaded backups
- Use the same browser and file location. Moving the downloaded HTML file may require restoring a backup

GOOD TO KNOW
- Browser app; not an App Store, Google Play, Goodnotes, Canva, Notion or Google Sheets product
- A flexible meal-planning tool, not a prescribed diet, nutrition calculator or personalized meal-plan service
- Calorie figures come from sample recipes or your entries; they are not calculated automatically from ingredients
- The Balance view compares logged food groups with general Mediterranean-style patterns. It is not medical or nutrition advice
- Check ingredient amounts, pantry availability, allergens and your own dietary needs before cooking or shopping
- Personal and household use on devices you own. No sharing, resale or redistribution of the app, guide or hosted link
- Digital download. Nothing is shipped

ABOUT THE PHOTOS
Designed and built by KaelLabs. AI tools assisted with parts of the coding, listing copy and images. Listing images use app screens with fictional sample data and digital device or lifestyle mockups, including AI-assisted scenes. AI-generated mockups may alter small screen details; the separate direct app screenshot shows the interface. Devices are not included. Lifestyle scenes are illustrative, not customer testimonials.

NEED HELP?
Message KaelLabs through Etsy if you need help opening your files or following the setup guide.

OTHER KAELLABS TOOLS
For household budgeting with printable PDFs, see Budget Planner App + Printable PDFs in this shop. For daily tasks and brain dumps, see ADHD Digital Planner App in this shop.

### Priorities

- Fix before any new sales claims: validate shipped files, phone setup, grocery-list behavior, save/reopen and backup/restore. Expected benefit is fewer false expectations; check actual runtime results.
- Improve next: larger benefit proof in hero; readable setup and saving limits in image sequence. Expected benefit is better understanding; check three-second recall first.
- Test later: one hero change at a time with title, price and tags held steady. Record date, traffic source, impressions when available, visits, orders and profit. Choose a review window by traffic volume; no promised uplift or deadline.

Verified: baseline totals, account access, actual hero export properties, observed UI/code and supplied grid appearance.
Unchecked: full runtime audit, current US competitor session, actual conversion, demand for unresearched tags, video and complete policy review.
One next action: use the final recommended title, tags and description when ready to update Etsy. No live listing was changed.


## Final copy verification notes — internal

- VERIFIED — ZIP listing contains exactly the named HTML app, Start Here PDF and LICENSE.txt. License allows personal/household use and printing; prohibits sharing files or hosted link. Inspected 2026-11-03.
- VERIFIED — Source guide names computer browsers and Safari iPhone/iPad / Chrome Android setup. Hosted sw.js implements offline caching after initial loading. This establishes intended support, not a completed physical-device test.
- VERIFIED — app.js implements printing, CSV, JSON backup/restore, sample clearing, recipes, shopping and local storage. genShopping deduplicates recipe IDs per week; addIngredients skips matching pantry names and does not scale ingredients. These limits are now in the description.
- VERIFIED — Browser runtime check was attempted in an isolated temporary profile but Chromium could not launch under the sandbox: bootstrap_check_in Permission denied (1100). No runtime test passed; physical-device, offline, save/reopen and restore testing remain unchecked. No runtime success is claimed.
- VERIFIED — Other KaelLabs tools named in the description exist in the supplied listing export. No invented cross-sell or lifetime-update/support-time promise added.
- Removed the [ADD ONLY IF TRUE AND TESTED] block. Unsupported promises are omitted from customer copy rather than left as placeholders.
- No new image generated. Existing final deliverable: images/hero-v2.jpg, 3000 × 2250, JPEG, sRGB, 985,486 bytes; center 4:5 preview was visually checked. The earlier hero-refined.jpg review describes the old image.

## Image alt text — ready to paste

Use entries 1–11 for the final listing sequence. Match each entry to its filename. The previous hero is listed separately, not as an extra listing photo. Text describes the inspected images and sample data.

### 1 — Hero — `hero-v2.jpg`

Mediterranean meal planner mockup with a weekly plan on a tablet and grocery list on a phone in a warm kitchen. Olives, lemon, tomatoes and basil sit in front. Text: Your week becomes your grocery list. Devices not included.

### 2 — Dashboard — `02-dashboard-unedited.jpg`

 Unedited Direct app screenshot with sample weekly meals, shopping and pantry counts, recipe favorites and quick actions. A banner explains that buyers can clear the sample data and add their own.

### 3 — Plan to shopping list — `03-plan-to-list.jpg`

Week Plan and Shopping screens in two phone mockups on linen beside chickpeas, tomatoes and lemons. Text: Your week becomes your shopping list. One tap, grouped by aisle, pantry-aware.

### 4 — Weekly plan — `04-week-plan.jpg`

Weekly meal calendar with sample breakfasts, lunches, dinners and snacks in a tablet mockup beside coffee and a notebook. Controls include Add meal, Build shopping list, Copy last week and Print.

### 5 — Phone use — `05-on-your-phone.jpg`

Shopping checklist and weekly meal plan in two phone mockups against a produce-market background. Text: Take your list to the shops. Phone setup steps are in your Start Here guide.

### 6 — Recipes — `06-recipes.jpg`

Recipe collection in a tablet mockup with illustrated sample recipe cards, search, category filters and favorites. Text: Keep your recipes together. Starter recipes and space for your own favorites.

### 7 — Pantry — `07-pantry.jpg`

Pantry and Shopping screens in phone mockups beside jars of dry ingredients and olive oil. The pantry table shows sample items, quantities, aisles and use-by dates. Text: See what you already have.

### 8 — Balance, goals and water — `08-balance.jpg`

Balance and Goals & Water screens in two phone mockups, showing sample food-group summaries and goal progress. Text: See your week at a glance. Planning aid, not medical advice.

### 9 — App views — `09-tools.jpg`

Twelve sample app views: Home, Week plan, Today, Calendar, Recipes, Shopping, Pantry, Prep list, Balance, Goals & water, Journal and Settings. Text: One app. Your daily tools.

### 10 — Dark mode — `10-private.jpg`

Dark-mode meal planner dashboard in a tablet mockup beside a candle and olive branches. Sample meals, recipes and shopping counts are visible. Text: No account, local browser storage, dark mode.

### 11 — Setup and included files — `11-how-it-works.jpg`

Three setup steps: download the ZIP and Start Here PDF, unzip on computer or follow phone setup, then choose meals and build a list. Includes HTML app, setup PDF and personal-use licence. Nothing ships.


## Latest hero revision

Revised images/hero-v2.jpg in place. Same warm kitchen, larger tablet and phone screens, with olives, lemon, tomatoes and basil moved into the central foreground. Built-in imagegen used for one revision; no extra variants generated.

VERIFIED — 3000 × 2250 px, JPEG, embedded sRGB, 989140 bytes. The earlier 985,486-byte file and its crop check describe the previous version. The larger devices extend beyond the strict centered 4:5 safe area; food and headline remain central. Use Etsy’s thumbnail adjustment to check the uploaded crop. Small UI details are AI-rendered from reference screenshots, not guaranteed pixel-identical.

Edit brief: preserve the kitchen and wording; make the iPad taller at natural proportions, enlarge readable week-plan and shopping screens, and bring olives, lemon, tomatoes and basil into the central foreground.
