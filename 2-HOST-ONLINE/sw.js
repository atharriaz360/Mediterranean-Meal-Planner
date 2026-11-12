// Mediterranean Meal Planner offline cache v1.0
const PREFIX='mediterranean-meal-planner:'+self.registration.scope+':';const C=PREFIX+'cf6e036eac1b';const FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith(PREFIX)&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.registration.scope))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();e.waitUntil(caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{}))}return r}).catch(()=>caches.open(C).then(async c=>(await c.match(e.request))||(e.request.mode==='navigate'?await c.match('./index.html'):null)||Response.error())))});
