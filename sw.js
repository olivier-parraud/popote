const C="biscuit-v1-2.0.0";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  // La page : réseau d'abord (mises à jour rapides), sinon la copie hors ligne
  if(e.request.mode==="navigate"){
    const net=fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put("./index.html",c));}return r;});
    const slow=new Promise(ok=>setTimeout(ok,2500)).then(()=>caches.match("./index.html"));
    e.respondWith(Promise.race([net.catch(()=>caches.match("./index.html")),slow.then(r=>r||net)]));return;}
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    if(res.ok||res.type==="opaque"){const copy=res.clone();caches.open(C).then(c=>c.put(e.request,copy));}
    return res;
  }).catch(()=>caches.match("./index.html"))));
});
