// Generates 1-SELL-THIS/Mediterranean-Meal-Planner-Start-Here.pdf: 2-page A4 forest green + sun gold guide.
// Run from project root: node 5-SOURCE/guide/make-guide.cjs   (needs playwright; set PW_EXE to Chrome if needed)
// Then: cd 5-SOURCE && python3 build.py --sync   (rebuilds the buyer ZIP with this PDF)
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const G = __dirname;
const root = process.env.ROOT || path.resolve(G, '../..');
const out = process.env.OUT || path.join(root, '1-SELL-THIS/Mediterranean-Meal-Planner-Start-Here.pdf');
const URL = 'https://mediterranean-meal-planner-2-host.vercel.app/';
const SHOW = 'mediterranean-meal-planner-2-host.vercel.app';
const b64 = p => fs.readFileSync(p).toString('base64');
const FS = path.join(G, '../node_modules/@fontsource');
const face = (family, weight, style, file) => {
  const f = path.join(FS, file);
  if (!fs.existsSync(f)) { console.warn('missing font', file); return ''; }
  return `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};src:url(data:font/woff2;base64,${b64(f)}) format('woff2');}`;
};
const fonts = [
  face('Fraunces', 500, 'normal', 'fraunces/files/fraunces-latin-500-normal.woff2'),
  face('Fraunces', 600, 'normal', 'fraunces/files/fraunces-latin-600-normal.woff2'),
  face('Fraunces', 600, 'italic', 'fraunces/files/fraunces-latin-600-italic.woff2'),
  face('Inter', 400, 'normal', 'inter/files/inter-latin-400-normal.woff2'),
  face('Inter', 600, 'normal', 'inter/files/inter-latin-600-normal.woff2'),
  face('Inter', 700, 'normal', 'inter/files/inter-latin-700-normal.woff2'),
].join('\n');
const qr = fs.existsSync(path.join(G, 'qr-online.png')) ? `data:image/png;base64,${b64(path.join(G, 'qr-online.png'))}` : '';

// App icon (same as 4-BRAND/mediterranean-meal-planner-icon.svg)
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1F4A38"/><rect x=".5" y=".5" width="63" height="63" rx="15.5" fill="none" stroke="#E6CB84" stroke-opacity=".55"/><circle cx="34" cy="29" r="16" fill="#F2B84B"/><path d="M16 50 C26 42 36 32 46 17" fill="none" stroke="#FBF6EC" stroke-width="2.4" stroke-linecap="round"/><path d="M21 46Q24.31 38.31 18.57 32.21Q15.25 39.91 21 46ZM24.5 43.5Q31.07 48.69 38.45 44.72Q31.87 39.53 24.5 43.5ZM29.5 39Q32 31.34 26.01 25.96Q23.5 33.62 29.5 39ZM33 35.6Q39.5 39.9 46 35.6Q39.5 31.3 33 35.6ZM38 29.6Q39.95 22.66 34.29 18.19Q32.34 25.13 38 29.6ZM41 25.5Q47.07 28.88 52.46 24.5Q46.39 21.11 41 25.5ZM46 17Q51.39 15.8 52.02 10.31Q46.63 11.51 46 17Z" fill="#FBF6EC"/><path d="M27 40.6 Q28.5 43 28.6 44.5" fill="none" stroke="#FBF6EC" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="29.2" cy="48.6" rx="3.8" ry="4.9" transform="rotate(-18 29.2 48.6)" fill="#D9683A"/></svg>`;
// KaelLabs shop mark (same as ADHD Budget guide)
const kmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect width="800" height="800" fill="#f5f0e8"/><polygon points="216,104 305,104 305,697 216,697" fill="#0e1e3f"/><polygon points="305,340 305,463 527,650 580,587 340,395" fill="#0e1e3f"/><polygon points="267,369 527,149 580,212 320,431" fill="#c8a862"/></svg>`;
// Decorative olive sprig (page corners)
const sprig = `<svg class="sprig" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 50 C26 42 36 32 46 17" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M21 46Q24.31 38.31 18.57 32.21Q15.25 39.91 21 46ZM24.5 43.5Q31.07 48.69 38.45 44.72Q31.87 39.53 24.5 43.5ZM29.5 39Q32 31.34 26.01 25.96Q23.5 33.62 29.5 39ZM33 35.6Q39.5 39.9 46 35.6Q39.5 31.3 33 35.6ZM38 29.6Q39.95 22.66 34.29 18.19Q32.34 25.13 38 29.6ZM41 25.5Q47.07 28.88 52.46 24.5Q46.39 21.11 41 25.5ZM46 17Q51.39 15.8 52.02 10.31Q46.63 11.51 46 17Z" fill="currentColor"/><ellipse cx="29.2" cy="48.6" rx="3.8" ry="4.9" transform="rotate(-18 29.2 48.6)" fill="#D9683A" fill-opacity=".9"/></svg>`;
const SERIF = `'Fraunces', Georgia, serif`, SANS = `'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Mediterranean Meal Planner - Start Here</title><style>
${fonts}
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; background: #0E2219; color: #FBF6EC; font-family: ${SANS}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.pg { width: 210mm; height: 297mm; padding: 13mm 15mm; position: relative; overflow: hidden; page-break-after: always;
  background: radial-gradient(ellipse at 88% 0%, #2E5C47 0%, #1F4A38 44%, #0F251B 92%); }
.pg:last-child { page-break-after: auto; }
.glow { position: absolute; top: -70mm; right: -50mm; width: 170mm; height: 170mm; border-radius: 50%; background: radial-gradient(circle, rgba(242,184,75,.22) 0%, rgba(242,184,75,0) 64%); }
.glow.b { top: auto; right: auto; bottom: -85mm; left: -65mm; background: radial-gradient(circle, rgba(217,104,58,.14) 0%, rgba(217,104,58,0) 64%); }
.sprig { position: absolute; color: rgba(230,203,132,.10); width: 62mm; height: 62mm; right: -10mm; bottom: 4mm; transform: rotate(-8deg); }
.logo-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4.2mm; position: relative; }
.logo-left { display: flex; align-items: center; gap: 3.5mm; }
.svg-box { width: 14mm; height: 14mm; filter: drop-shadow(0 2px 6px rgba(0,0,0,.35)); } .svg-box svg { width: 100%; height: 100%; display: block; }
.logo-left .n { font: 600 21pt/1 ${SERIF}; color: #FFFAF0; letter-spacing: -.01em; }
.logo-left .t { font: 700 7pt ${SANS}; letter-spacing: .22em; text-transform: uppercase; color: #E6CB84; margin-top: 1.4mm; }
.pill { display: flex; align-items: center; gap: 2.6mm; padding: 1.6mm 3.2mm; border-radius: 4mm; background: rgba(16,40,30,.6); border: 1px solid rgba(230,203,132,.32); }
.kbox { width: 6.5mm; height: 6.5mm; border-radius: 1.5mm; overflow: hidden; box-shadow: 0 0 0 1px rgba(230,203,132,.4); } .kbox svg { width: 100%; height: 100%; display: block; }
.pill span { font: 600 10.5pt ${SERIF}; color: #E6CB84; }
h1 { font: 600 26pt/1.13 ${SERIF}; margin: 0 0 2mm; color: #FFFAF0; position: relative; letter-spacing: -.01em; }
h1 em { color: #F2C66A; font-style: italic; }
.subtitle { margin: 0 0 4.2mm; font-size: 9.8pt; line-height: 1.5; color: #DCE5DC; position: relative; max-width: 168mm; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 3.2mm; margin-bottom: 3.2mm; position: relative; }
.box { position: relative; background: rgba(14,36,27,.72); border: 1px solid rgba(230,203,132,.26); border-radius: 3.8mm; padding: 3.6mm 4.4mm; font-size: 8.8pt; line-height: 1.47; color: #E9EDE4; box-shadow: 0 3px 12px rgba(4,12,8,.35); margin-bottom: 3.2mm; }
.row .box { margin-bottom: 0; }
.box h2 { font: 600 13.5pt/1 ${SERIF}; color: #F0D592; margin: 0 0 2.3mm; display: flex; align-items: center; gap: 2mm; }
.box h2 i { width: 1.8mm; height: 1.8mm; border-radius: 50%; background: #D9683A; flex: 0 0 1.8mm; }
.box ol, .box ul { margin: 0; padding-left: 4.8mm; } .box li { margin-bottom: 1.4mm; } .box li:last-child { margin-bottom: 0; }
.box ol li::marker { color: #E6CB84; font-weight: 700; } .box ul li::marker { color: #D9683A; }
.box b { color: #FFFAF0; }
.warn { border-color: rgba(230,203,132,.55); background: rgba(12,30,22,.88); border-left: 1.6mm solid #D9683A; }
.link-box { position: relative; border: 1.5px solid rgba(230,203,132,.5); border-radius: 4mm; padding: 3.6mm 4.6mm; background: linear-gradient(135deg, rgba(46,92,71,.94), rgba(18,44,32,.97)); margin-bottom: 3.2mm; display: flex; align-items: center; gap: 5mm; box-shadow: 0 4px 16px rgba(4,12,8,.4); }
.link-left { flex: 1; }
.link-cap { font-size: 7.2pt; letter-spacing: .2em; text-transform: uppercase; color: #F0D592; font-weight: 700; margin-bottom: 1.5mm; }
.link-url { font: 700 11pt/1.2 ${SANS}; color: #fff; margin-bottom: 2.2mm; word-break: break-all; }
.link-btn { display: inline-block; background: linear-gradient(135deg, #F6E2AE, #E0B65A 55%, #B08A36); color: #163629; font: 700 8.8pt ${SANS}; padding: 1.8mm 4.4mm; border-radius: 3mm; text-decoration: none; margin-bottom: 2mm; }
.link-desc { margin: 0; font-size: 8.2pt; line-height: 1.42; color: #DCE5DC; }
.link-qr { text-align: center; flex-shrink: 0; }
.link-qr .q { width: 25mm; height: 25mm; background: #FFFCF6; padding: 1.2mm; border-radius: 2.5mm; } .link-qr img { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
.link-qr small { display: block; margin-top: 1.3mm; font-size: 6.8pt; letter-spacing: .14em; text-transform: uppercase; color: #E6CB84; font-weight: 700; }
.p2-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4mm; position: relative; }
.p2-head h2 { font: 600 24pt/1 ${SERIF}; color: #FFFAF0; margin: 0; }
.p2-head h2 em { color: #F2C66A; font-style: italic; }
.q b.h { display: block; margin-top: 2.4mm; color: #F0D592; font-size: 9.2pt; } .q b.h:first-of-type { margin-top: 0; }
.thanks { position: relative; margin-top: 3.4mm; padding: 4.2mm 5.5mm; border-radius: 3.8mm; background: linear-gradient(135deg, rgba(46,92,71,.9), rgba(16,40,30,.96)); border: 1px solid rgba(230,203,132,.45); text-align: center; }
.thanks .ttl { font: 600 16.5pt/1 ${SERIF}; color: #F0D592; margin-bottom: 2mm; }
.thanks .body { font-size: 9.2pt; line-height: 1.48; color: #E9EDE4; max-width: 155mm; margin: 0 auto; } .thanks .body b { color: #FFFAF0; }
.thanks .olives { display: flex; justify-content: center; gap: 3.2mm; margin-top: 2.4mm; }
.thanks .olives span { width: 2.2mm; height: 2.8mm; border-radius: 50%; background: #8A9A4A; transform: rotate(-18deg); }
.thanks .olives span:nth-child(3) { background: #D9683A; }
.thanks .step { font-size: 8.2pt; color: #E6CB84; margin-top: 2mm; }
.foot { position: absolute; left: 15mm; right: 15mm; bottom: 8.5mm; font-size: 8.4pt; color: #AFC0B4; display: flex; justify-content: space-between; border-top: 1px solid rgba(230,203,132,.22); padding-top: 2.5mm; }
.pg + .pg .box { font-size: 9pt; line-height: 1.5; padding: 4mm 4.8mm; margin-bottom: 3.4mm; }
.pg + .pg .row .box { margin-bottom: 0; } .pg + .pg .box h2 { font-size: 14.5pt; }
.stack > .box + .box { margin-top: 3.4mm; }
.mut { margin: 2mm 0 0; font-size: 8.5pt; color: #C4D0C6; }
.kbd { display: inline-block; min-width: 4.2mm; padding: 0 1.2mm; border: 1px solid rgba(230,203,132,.45); border-radius: 1.2mm; font: 700 8pt ${SANS}; color: #FFFAF0; text-align: center; }
</style></head><body>

<div class="pg"><div class="glow"></div><div class="glow b"></div>${sprig}
  <div class="logo-bar">
    <div class="logo-left"><div class="svg-box">${mark}</div><div><div class="n">Mediterranean Meal Planner</div><div class="t">Plan &middot; Cook &middot; Shop</div></div></div>
    <div class="pill"><div class="kbox">${kmark}</div><span>by KaelLabs</span></div>
  </div>
  <h1>Welcome to your Mediterranean kitchen.<br>Plan, cook &amp; shop <em>in one calm app.</em></h1>
  <p class="subtitle">Thank you for your purchase. You'll be planning your first meal in about a minute. There's no account, no subscription and nothing to install.</p>
  <div class="row">
    <div class="box"><h2><i></i>On your computer</h2><ol>
      <li>Unzip <b>Mediterranean-Meal-Planner-Digital-Download.zip</b>. Keep the extracted folder somewhere permanent, like Documents. Don't open the file from inside the zip.</li>
      <li>Double-click <b>Mediterranean-Meal-Planner.html</b>. It opens in your web browser and works offline.</li>
      <li>Bookmark it and use the <b>same browser</b> each time.</li></ol></div>
    <div class="box"><h2><i></i>On your phone or tablet</h2><ol>
      <li>Open your online link (below) in <b>Safari</b> (iPhone, iPad) or <b>Chrome</b> (Android). Or scan the code.</li>
      <li>iPhone: Share &rarr; <b>Add to Home Screen</b>.<br>Android: menu &vellip; &rarr; <b>Install app</b> or <b>Add to Home screen</b>.</li>
      <li>It then opens from your Home Screen, just like an app.</li></ol></div>
  </div>
  <div class="link-box">
    <div class="link-left"><div class="link-cap">Your online link</div><div class="link-url">${SHOW}</div>
      <a class="link-btn" href="${URL}">Open Online &rarr;</a>
      <p class="link-desc">Tap the button, type the link or scan the code. What you enter is saved in your browser on that device. There is no account and no cloud sync. Each device keeps its own planner: move it with a backup file. Please keep this link to yourself.</p></div>
    ${qr ? `<div class="link-qr"><div class="q"><img src="${qr}" alt="QR code for your online link"></div><small>Scan on phone</small></div>` : ''}
  </div>
  <div class="box"><h2><i></i>Your first five minutes</h2><ol>
    <li><b>Look around.</b> Your planner opens with a <b>sample week</b>. Click through Week Plan, Recipes and Shopping.</li>
    <li><b>Plan a meal.</b> Open any recipe and tap <b>Plan it</b>, or tap an empty slot in Week Plan.</li>
    <li><b>Build your list.</b> In Week Plan tap <b>Build shopping list</b>. Ingredients appear sorted by aisle. Anything in your <b>Pantry</b> is skipped.</li>
    <li><b>Repeat a good week.</b> <b>Copy last week</b> fills the new week in one tap.</li>
    <li><b>Make it yours.</b> Settings &rarr; <b>Clear sample data</b>. Anything you added yourself stays.</li></ol>
    <p class="mut">Sample recipes and meals are examples only. They aren't a diet plan.</p></div>
  <div class="box warn"><h2><i></i>The one rule: your planner lives in your browser</h2>
    <p style="margin:0">Mediterranean Meal Planner saves automatically, in the browser you open it in, on that device only. So <b>open it from the same place, in the same browser, each time</b>. It doesn't sync between devices. Private or Incognito windows, clearing browser data, or moving the file can make your plans unavailable. Go to Settings &rarr; <b>Back up now</b> once a week, and use <b>Restore backup</b> to move your planner to another browser or device.</p></div>
  <div class="foot"><span>Mediterranean Meal Planner &middot; Plan, cook &amp; shop</span><span>Page 1 of 2</span></div>
</div>

<div class="pg"><div class="glow"></div><div class="glow b"></div>
  <div class="p2-head"><h2>Good <em>to know</em></h2><div class="pill"><div class="kbox">${kmark}</div><span>Mediterranean Meal Planner by KaelLabs</span></div></div>
  <div class="row" style="align-items:start">
    <div class="stack">
      <div class="box"><h2><i></i>What's inside</h2><ul>
        <li><b>Home</b> and <b>Today</b>: your week and today's meals at a glance.</li>
        <li><b>Week Plan</b> and <b>Calendar</b>: plan breakfast to dinner, copy last week, print.</li>
        <li><b>Recipes</b>: ingredients, method, photos and favourites.</li>
        <li><b>Shopping</b>: built from your plan, sorted by aisle, tick off as you go.</li>
        <li><b>Pantry</b>: staples and use-by dates; skipped when you build a list.</li>
        <li><b>Prep List</b>: soak, chop, marinate, batch-cook.</li>
        <li><b>Balance</b>: your week by food group, next to a general Mediterranean pattern.</li>
        <li><b>Goals &amp; Water</b>, plus a <b>Journal</b> for meal ideas and favourites.</li>
        <li><b>Settings</b>: backup and restore, CSV export, light and dark modes.</li></ul></div>
      <div class="box"><h2><i></i>Works on</h2><p style="margin:0">Your computer with the downloaded file (Chrome, Edge, Safari or Firefox), and your iPhone, iPad or Android with your online link. Keyboard: <span class="kbd">/</span> search &middot; <span class="kbd">N</span> quick add &middot; <span class="kbd">Esc</span> close.</p></div>
    </div>
    <div class="stack">
      <div class="box q"><h2><i></i>Troubleshooting</h2>
        <b class="h">&ldquo;My planner is empty!&rdquo;</b>You probably opened it in a different browser, from a moved or copied file, or in a Private window. Open it the way you did before, or restore your latest backup.
        <b class="h">New phone or computer?</b>On the old device: Settings &rarr; <b>Back up now</b>. On the new one: open the planner &rarr; Settings &rarr; <b>Restore backup</b>.
        <b class="h">It says &ldquo;Not saving&rdquo;.</b>You're in a preview window (Files app, email, zip) or private browsing. Open the file in Safari, Chrome, Edge or Firefox, or use your online link.
        <b class="h">&ldquo;Storage is full&rdquo;?</b>Remove a few recipe photos, then back up.
        <b class="h">Check everything works</b>Settings &rarr; <b>Run check</b>.</div>
      <div class="box"><h2><i></i>Print &amp; make it yours</h2><p style="margin:0">Week Plan &rarr; <b>Print</b> for the fridge. Shopping &rarr; <b>Print</b> for a tick-off list. Any recipe &rarr; <b>Print</b> for a recipe card. Settings has light and dark modes, 3 accent colours, week start day, water goal, and an option to hide calories.</p></div>
    </div>
  </div>
  <div class="box" style="font-size:9.1pt"><b style="color:#F0D592">Need a hand?</b> Message KaelLabs through Etsy any time, with a screenshot if you can. I'm happy to help you get set up.</div>
  <div class="box" style="font-size:8.6pt;line-height:1.5"><b style="color:#F0D592">Private by design.</b> No login, analytics or sync service; your plans stay in your browser. <b style="color:#F0D592">Not medical advice.</b> Balance compares your plan with general Mediterranean-style eating patterns. It is not nutritional or medical advice; for personal dietary needs, speak to a qualified professional. <b style="color:#F0D592">Licence.</b> Personal use only. No resale or sharing (see LICENSE.txt). <b style="color:#F0D592">AI.</b> AI assistance was used for parts of the app code, text and images; food photos and illustrations were made with AI image tools. Digital product; nothing physical is shipped.</div>
  <div class="thanks"><div class="ttl">Thank you for supporting a small maker!</div>
    <div class="body">I built Mediterranean Meal Planner to make a week of good meals feel simple. If it helps your kitchen, <b>an honest review on Etsy</b> means a lot to a small shop and helps others find it.</div>
    <div class="olives"><span></span><span></span><span></span><span></span><span></span></div>
    <div class="step">Etsy &rarr; You &rarr; Purchases and orders &rarr; Leave a review</div></div>
  <div class="foot"><span>Mediterranean Meal Planner v1.0 &middot; KaelLabs &middot; 2026</span><span>Page 2 of 2</span></div>
</div>
</body></html>`;

(async () => {
  const b = await chromium.launch({ headless: true, executablePath: process.env.PW_EXE || undefined });
  try {
    const p = await b.newPage();
    await p.setContent(html);
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
    const fit = await p.evaluate(() => [...document.querySelectorAll('.pg')].map(pg => {
      const f = pg.querySelector('.foot').getBoundingClientRect().top, r = pg.getBoundingClientRect();
      const kids = [...pg.children].filter(c => !c.classList.contains('foot') && !c.classList.contains('glow') && !c.classList.contains('sprig'));
      const bottom = Math.max(...kids.map(k => k.getBoundingClientRect().bottom));
      return { lastBottom: Math.round(bottom - r.top), footTop: Math.round(f - r.top), fits: bottom < f - 4 };
    }));
    console.log('fit:', JSON.stringify(fit));
    if (!fit.every(x => x.fits)) throw new Error('Guide content overlaps footer');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await p.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
    console.log('Generated', out);
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
