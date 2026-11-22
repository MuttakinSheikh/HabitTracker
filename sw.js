const CACHE='habittrackerx-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||!/^https?:/.test(r.url))return;
  const page=r.mode==='navigate';
  // Pages: network first (so updates arrive), cached copy when offline. Other files: cache first.
  e.respondWith((page?fetch(r).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))):caches.match(r).then(m=>m||fetch(r)))
    .then(res=>{if(res&&res.ok&&(res.type==='basic'||res.type==='cors')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res})
    .catch(()=>caches.match(r).then(m=>m||new Response('',{status:504}))));
});
