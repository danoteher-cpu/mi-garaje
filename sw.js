const CACHE='mi-garaje-v2';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // Lector de números (CDN y modelos): caché primero, no cambian
  if(url.hostname==='cdn.jsdelivr.net'||url.pathname.includes('/ocr/')){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res})));
    return;
  }
  if(url.origin!==self.location.origin)return;
  // App: red primero (para recibir actualizaciones), caché si no hay conexión
  e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r})
    .catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
});
