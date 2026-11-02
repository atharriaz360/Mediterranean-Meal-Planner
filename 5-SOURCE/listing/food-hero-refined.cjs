const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'6-ETSY-LISTING/images/2026-11-01-food-heroes'),src=path.join(root,'6-ETSY-LISTING/images/2026-11-01-premium/sources');
const img=p=>'data:image/png;base64,'+fs.readFileSync(p).toString('base64');
(async()=>{const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:2800,height:2100},deviceScaleFactor:1});
for(const [name,t,p] of [['refined',[373,401,690,464],[953,535,195,408]]]){
const box=(a,file,r)=>`<img src="${img(path.join(src,file))}" style="position:absolute;left:${a[0]}px;top:${a[1]}px;width:${a[2]}px;height:${a[3]}px;border-radius:${r}px;${file==='week.png'?'clip-path:polygon(0 0,100% 0,100% 20%,82% 20%,82% 100%,24% 100%,20% 87%,15% 79%,8% 74%,0 73%)':''}">`;
const html=`<html><body style="margin:0;background:${name==='dark'?'#1b291b':'#f3ecdb'}"><div style="position:relative;width:1448px;height:1086px;transform:scale(${2800/1448});transform-origin:top left"><img src="${img(path.join(out,name+'-generated.png'))}" style="position:absolute;width:1448px;height:1086px">${box(t,'week.png',9)}${box(p,'shopping-mobile.png',12)}</div></body></html>`;
fs.writeFileSync(path.join(out,name+'.html'),html);await page.setContent(html);await page.locator('img').evaluateAll(ims=>Promise.all(ims.map(i=>i.decode())));await page.screenshot({path:path.join(out,'hero-'+name+'.jpg'),type:'jpeg',quality:92});}
await browser.close()})();
