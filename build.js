const fs=require('fs'),path=require('path');
const R=p=>fs.readFileSync(path.join(__dirname,p),'utf8');
const data=['ingredients.js','r1-matin.js','r2-france.js','r3-italie-inde.js','r4-asie-mexique.js','r5-monde.js','r6-plus.js','photos.js','d1-matin.js','d2-france-a.js','d3-france-b.js','d4-italie.js','d5-inde.js','d6-asie.js','d7-mexique-orient.js','d8-med-us-afrique.js'].map(f=>R('data/'+f)).join('\n');
const css=R('src/styles.css'), app=R('src/app.js'), icon=R('src/icon.svg').trim();
const iconURI='data:image/svg+xml,'+encodeURIComponent(icon);
const fonts='';
const body=`<div id="app"></div>
<div id="sheet" class="sheet" hidden></div>
<div id="onboard" class="ob" hidden></div>
<div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
<script>
${data}
${app}
</script>`;
const head=(extra)=>`<title>Popote</title>
<meta name="claude:viewport-fit-sides" content="cover">
${extra||''}${fonts}
<style>
${css}
</style>`;
const standaloneMeta=(pwa)=>`<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#F2F2F7">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Popote">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
${pwa?'<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">\n<link rel="icon" href="icon-192.png">':'<link rel="icon" href="'+iconURI+'">'}
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}</style>
`;
fs.mkdirSync(path.join(__dirname,'dist/installable'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'dist/popote-artifact.html'),head('')+'\n'+body+'\n');
const full=(pwa)=>`<!doctype html>
<html lang="fr">
<head>
${standaloneMeta(pwa)}${head('')}
</head>
<body>
${body}
${pwa?`<script>if("serviceWorker" in navigator){addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(){})})}</script>`:''}
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname,'dist/Popote.html'),full(false));
fs.writeFileSync(path.join(__dirname,'dist/installable/index.html'),full(true));
fs.writeFileSync(path.join(__dirname,'dist/installable/manifest.webmanifest'),JSON.stringify({
  name:"Popote",short_name:"Popote",description:"Tes repas de la semaine, dans ton budget.",lang:"fr",
  start_url:"./",scope:"./",display:"standalone",background_color:"#F2F2F7",theme_color:"#F2F2F7",
  icons:[{src:"icon-192.png",sizes:"192x192",type:"image/png"},{src:"icon-512.png",sizes:"512x512",type:"image/png"},{src:"icon-512.png",sizes:"512x512",type:"image/png",purpose:"maskable"}]
},null,2));
fs.writeFileSync(path.join(__dirname,'dist/installable/sw.js'),`const C="popote-v6";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    if(res.ok||res.type==="opaque"){const copy=res.clone();caches.open(C).then(c=>c.put(e.request,copy));}
    return res;
  }).catch(()=>caches.match("./index.html"))));
});
`);
console.log('ok', fs.statSync(path.join(__dirname,'dist/Popote.html')).size);
