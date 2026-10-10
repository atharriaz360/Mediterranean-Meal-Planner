// Usage: node make-guide.js "https://your-online-link"   → writes Mediterranean-Meal-Planner-Start-Here.pdf
const { chromium } = require('playwright');const fs=require('fs'),path=require('path');
const link=process.argv[2]||'';
(async()=>{let h=fs.readFileSync(path.join(__dirname,'start-here.html'),'utf8');
 h=h.replace(/{{LINK}}/g,link?`<a href="${link}">${link.replace(/^https?:\/\//,'')}</a>`:'<span style="color:#C0473A">[add your online link — run make-guide.js with it]</span>');
 const tmp=path.join(__dirname,'_render.html');fs.writeFileSync(tmp,h);
 const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+tmp);await p.waitForTimeout(600);
 await p.pdf({path:path.join(__dirname,'Mediterranean-Meal-Planner-Start-Here.pdf'),format:'A4',printBackground:true,margin:{top:'0',bottom:'0',left:'0',right:'0'}});await b.close();fs.unlinkSync(tmp);console.log('ok')})();
