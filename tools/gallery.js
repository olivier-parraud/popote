// Galerie des gestes illustrés, pour validation : node tools/gallery.js sortie.html
const fs = require('fs'), path = require('path');
const d = require('./load.js');
const GX = new Function('esc', fs.readFileSync(path.join(__dirname, '../src/b/gestures.js'), 'utf8') + ';return GX;')(s => s);
const GA = new Function(fs.readFileSync(path.join(__dirname, '../src/b/gestures-art.js'), 'utf8') + ';return GART;')();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const use = {}, ex = {};
for (const id in d.DETAILS) for (const s of d.DETAILS[id].steps){ const k = GX.match(s); if (!k) continue; use[k] = (use[k] || 0) + 1; if (s.length > 40 && s.length < 120 && (!ex[k] || Math.abs(s.length - 80) < Math.abs(ex[k].length - 80))) ex[k] = s; }
const order = GA.keys.slice().sort((a, b) => (use[b] || 0) - (use[a] || 0));
const cards = order.map((k, i) => '<article class="card" id="g-' + k + '"><div class="art">' + GA.svg(k) + '</div><div class="meta"><div class="row1"><span class="num">' + (i + 1) + '</span><h2>' + esc(GA.A[k].t) + '</h2><span class="cnt">' + (use[k] || 0) + ' étape' + ((use[k] || 0) > 1 ? 's' : '') + '</span></div>' + (ex[k] ? '<p class="ex">«\u00a0' + esc(ex[k]) + '\u00a0»</p>' : '<p class="ex">Utilisé par les nouvelles recettes.</p>') + '</div></article>').join('\n');
const html = `<title>Gestes Biscuit</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap">
<style>
:root{--bg:#F4F3EF;--card:#FFFFFF;--ink:#1A1A18;--muted:#66655F;--line:#E4E1D8;--green:#2E7A4C;--green-tint:#E3F1E7;--caramel:#8F5420;--chip:#EDEBE5;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141412;--card:#1F1E1B;--ink:#F3F1EA;--muted:#A9A69C;--line:#2E2C28;--green:#5DB884;--green-tint:#1E3326;--caramel:#E3A260;--chip:#2A2925;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#141412;--card:#1F1E1B;--ink:#F3F1EA;--muted:#A9A69C;--line:#2E2C28;--green:#5DB884;--green-tint:#1E3326;--caramel:#E3A260;--chip:#2A2925;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 Inter,system-ui,-apple-system,sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding-block:28px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:flex;flex-direction:column;gap:22px}
header{display:flex;flex-direction:column;gap:10px;max-width:68ch}
.kick{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--caramel)}
h1{margin:0;font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:clamp(30px,5vw,44px);line-height:1.05;letter-spacing:-.02em;text-wrap:balance}
header p{margin:0;color:var(--muted);line-height:1.55}
.bar{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 0;background:var(--bg)}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);background:var(--bg);z-index:10}
.seg{display:inline-flex;padding:3px;border-radius:999px;background:var(--chip)}
.seg button{border:0;background:none;color:var(--ink);font:600 13.5px Inter,system-ui,sans-serif;height:34px;padding:0 14px;border-radius:999px;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--card);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr));gap:16px}
.card{background:var(--card);border-radius:24px;overflow:hidden;border:1px solid var(--line);display:flex;flex-direction:column;min-width:0}
.art{aspect-ratio:16/10;overflow:hidden;background:#F7E2C9}
.art svg{width:100%;height:100%;display:block}
body.cook .art{margin:10px 10px 0;border-radius:18px}
body.cook .card{background:#1A1A18;border-color:#2C2B27;color:#F3F1EA}
body.cook .card .ex{color:#B9B6AC}
.meta{padding:12px 16px 16px;display:flex;flex-direction:column;gap:6px;min-width:0}
.row1{display:flex;align-items:center;gap:10px}
.num{width:26px;height:26px;border-radius:50%;background:var(--green-tint);color:var(--green);font-weight:800;font-size:12.5px;display:grid;place-items:center;flex:none}
body.cook .num{background:#F4B860;color:#1A1A18}
h2{margin:0;font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:19px;line-height:1.2;flex:1;min-width:0}
.cnt{font-size:12.5px;color:var(--muted);white-space:nowrap}
body.cook .cnt{color:#8C8A83}
.ex{margin:0;font-size:13.5px;color:var(--muted);line-height:1.45}
.foot{color:var(--muted);font-size:13.5px}
</style>
<div class="wrap">
<header><span class="kick">Biscuit · mode cuisine</span><h1>Les 35 gestes, redessinés</h1><p>Nouveau style illustré, avec des mains qui font le geste et des mouvements plus doux. Ils sont classés du plus utilisé au moins utilisé dans les recettes. Dis-moi les numéros à reprendre, ou « tout est bon ».</p></header>
<div class="bar"><div class="seg" role="group" aria-label="Fond"><button aria-pressed="true" data-bg="light">Fond clair</button><button aria-pressed="false" data-bg="cook">Comme en cuisine</button></div><div class="seg" role="group" aria-label="Vitesse"><button aria-pressed="true" data-sp="1">Vitesse normale</button><button aria-pressed="false" data-sp="0.4">Ralenti</button><button aria-pressed="false" data-sp="0">Pause</button></div></div>
<section class="grid">
${cards}
</section>
<p class="foot">Avec le réglage « moins d'animations », chaque dessin reste figé dans sa pose de repos.</p>
</div>
<script>
const pick=(b)=>{b.parentNode.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b))};
let rate=1;const apply=()=>{for(const a of document.getAnimations()){if(rate===0)a.pause();else{a.playbackRate=rate;a.play();}}};
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
if(b.dataset.bg){pick(b);document.body.classList.toggle("cook",b.dataset.bg==="cook");}
if(b.dataset.sp!=null){pick(b);rate=+b.dataset.sp;apply();}});
</script>
`;
fs.writeFileSync(process.argv[2], html);
console.log(order.map(k => k + ':' + (use[k] || 0)).join(' '));
