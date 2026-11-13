// Page de validation des gestes corrigés : node tools/proposals.js sortie.html
const fs = require('fs'), path = require('path');
const GA = new Function(fs.readFileSync(path.join(__dirname, '../src/b/gestures-art.js'), 'utf8') + ';return GART;')();
const gsrc = fs.readFileSync(path.join(__dirname, 'gallery.js'), 'utf8');
const css = gsrc.slice(gsrc.indexOf('<style>') + 7, gsrc.indexOf('</style>'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const card = (num, key, title, note, tag, hs) => '<article class="card"><div class="art">' + GA.svg(key, hs) + '</div><div class="meta"><div class="row1"><span class="num">' + num + '</span><h2>' + esc(title) + '</h2>' + (tag ? '<span class="tag">' + tag + '</span>' : '') + '</div><p class="ex">' + esc(note) + '</p></div></article>';

const hands = ['A', 'B'].map(h => '<div class="hcol"><h3>' + (h === 'A' ? 'Main A · dessinée en couleur' : 'Main B · blanche, façon notice') + '</h3><div class="hgrid">' +
  [['revenir', 1], ['fouetter', 15], ['emincer', 7]].map(([k, n]) => '<div class="art sm">' + GA.svg(k, h) + '</div>').join('') + '</div></div>').join('');

const P = [
  [11, 'reposer', 'Laisser reposer', "Le film étirable couvre maintenant tout le bol et retombe sur les bords. Le minuteur est remplacé par un sablier qui s'écoule puis se retourne."],
  [27, 'rouler', 'Rouler', "Le bas se replie, puis les deux côtés se rabattent sur toute la hauteur, par-dessus le bas replié. On roule ensuite depuis le bas : le paquet devient un rouleau bien fermé."],
  [30, 'brochettes', 'Brochettes', "La pique est vide au départ. Les morceaux s'enfilent un par un, puis tout disparaît ensemble avant la boucle suivante."],
];
const cards = P.map(([n, k, t, note, tag]) => card(n, k, t, note, tag)).join('\n');

const html = `<title>Gestes corrigés</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap">
<style>${css}
h2.sec{font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:24px;margin:10px 0 0;letter-spacing:-.01em}
.sub{margin:0;color:var(--muted);max-width:68ch}
.hands{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:16px}
.hcol{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:14px;display:flex;flex-direction:column;gap:10px;min-width:0}
.hcol h3{margin:0;font-size:16px}
.hgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.art.sm{border-radius:14px}
.tag{font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:var(--chip);color:var(--ink);white-space:nowrap}
body.cook .hcol{background:#1A1A18;border-color:#2C2B27;color:#F3F1EA}
body.cook .tag{background:#2C2B27;color:#F3F1EA}
</style>
<div class="wrap">
<header><span class="kick">Biscuit · mode cuisine</span><h1>Gestes corrigés, à valider</h1><p>Les trois gestes encore à reprendre, avec les numéros de la première galerie.</p></header>
<div class="bar"><div class="seg" role="group" aria-label="Fond"><button aria-pressed="true" data-bg="light">Fond clair</button><button aria-pressed="false" data-bg="cook">Comme en cuisine</button></div><div class="seg" role="group" aria-label="Vitesse"><button aria-pressed="true" data-sp="1">Vitesse normale</button><button aria-pressed="false" data-sp="0.4">Ralenti</button><button aria-pressed="false" data-sp="0">Pause</button></div></div>
<h2 class="sec">Deuxième essai</h2>
<p class="sub">Main A partout, Émincer en version A. Les autres gestes sont validés et ne bougent plus.</p>
<section class="grid">
${cards}
</section>
<p class="foot">Avec le réglage « moins d'animations », chaque dessin reste figé dans sa pose de repos.</p>
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
console.log('ok', P.length, 'cartes');
