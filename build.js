// Construit Biscuit : page d'artefact, fichier autonome et appli installable (PWA)
const fs = require('fs'), path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, p), 'utf8');
const VERSION = '2.0.0', CACHE = 'biscuit-v1';
const DATA = ['ingredients.js','r1-matin.js','r2-france.js','r3-italie-inde.js','r4-asie-mexique.js','r5-monde.js','r6-plus.js']
  .concat(fs.readdirSync(path.join(__dirname, 'data')).filter(f => /^r[7-9]-.*\.js$/.test(f)).sort())
  .concat(['photos.js','d1-matin.js','d2-france-a.js','d3-france-b.js','d4-italie.js','d5-inde.js','d6-asie.js','d7-mexique-orient.js','d8-med-us-afrique.js'])
  .concat(fs.readdirSync(path.join(__dirname, 'data')).filter(f => /^d(9|1\d)-.*\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))));
const SRC = ['core.js','gestures.js','ui-kit.js','ui-views.js','ui-sheets.js','ui-cook.js','ui-modes.js','ui-onboard.js','ui-main.js'];
const data = DATA.map(f => R('data/' + f)).join('\n');
const app = SRC.map(f => '/* ── ' + f + ' ── */\n' + R('src/b/' + f)).join('\n');
const b64 = f => fs.readFileSync(path.join(__dirname, 'fonts', f)).toString('base64');
const UR = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const face = (fam, file, w) => `@font-face{font-family:"${fam}";font-style:normal;font-display:swap;font-weight:${w};src:url(data:font/woff2;base64,${b64(file)}) format("woff2");unicode-range:${UR}}`;
const fonts = [face('Inter','inter-latin-wght-normal.woff2','100 900'), face('Bricolage Grotesque','bricolage-grotesque-latin-wght-normal.woff2','200 800'), face('Fredoka','fredoka-latin-wght-normal.woff2','300 700')].join('\n');
const css = fonts + '\n' + R('src/b/biscuit.css');
const icon = R('src/b/icon.svg').trim();
const iconURI = 'data:image/svg+xml,' + encodeURIComponent(icon);
const script = `<script>\n(function(){\n${data}\n${app}\n})();\n</script>`;
const body = `<div id="app"></div>\n${script}`;
const head = `<title>Biscuit</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n${css}\n</style>`;
const meta = pwa => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#FFFFFF">
<meta name="description" content="Tes repas de la semaine dans ton budget, avec les courses et un mode cuisine illustré.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Biscuit">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="format-detection" content="telephone=no">
${pwa ? '<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">\n<link rel="icon" href="icon-192.png">' : '<link rel="icon" href="' + iconURI + '">'}
`;
const full = pwa => `<!doctype html>
<html lang="fr">
<head>
${meta(pwa)}${head}
</head>
<body>
${body}
${pwa ? `<script>if("serviceWorker" in navigator){addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(){})})}</script>` : ''}
</body>
</html>
`;
fs.mkdirSync(path.join(__dirname, 'dist/installable'), {recursive:true});
fs.writeFileSync(path.join(__dirname, 'dist/biscuit-artifact.html'), head + '\n' + body + '\n');
fs.writeFileSync(path.join(__dirname, 'dist/Biscuit.html'), full(false));
fs.writeFileSync(path.join(__dirname, 'dist/installable/index.html'), full(true));
fs.writeFileSync(path.join(__dirname, 'dist/installable/manifest.webmanifest'), JSON.stringify({
  name:"Biscuit", short_name:"Biscuit", description:"Tes repas de la semaine, dans ton budget.", lang:"fr", id:"./",
  start_url:"./", scope:"./", display:"standalone", background_color:"#2E7A4C", theme_color:"#FFFFFF",
  icons:[{src:"icon-192.png",sizes:"192x192",type:"image/png"},{src:"icon-512.png",sizes:"512x512",type:"image/png"},{src:"icon-maskable.png",sizes:"512x512",type:"image/png",purpose:"maskable"}]
}, null, 2));
fs.writeFileSync(path.join(__dirname, 'dist/installable/sw.js'), `const C="${CACHE}-${VERSION}";
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
`);
fs.writeFileSync(path.join(__dirname, 'dist/installable/version.txt'), VERSION + '\n');
console.log('ok', (fs.statSync(path.join(__dirname, 'dist/Biscuit.html')).size/1024).toFixed(0) + ' Ko');
