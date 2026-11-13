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
  [2, 'verser', 'Ajouter', 'Petits pois, rondelles de carotte et quartiers de tomate glissent du bol dans la cocotte, avec une petite éclaboussure. Plus de carrés.'],
  [4, 'bouillir', "Cuire à l'eau bouillante", "Les pâtes sortent de l'eau, dans la casserole : le bord avant passe devant elles."],
  [7, 'emincer', 'Émincer', 'Courgette : la main gauche en griffe tient le légume, le couteau tranche et les rondelles tombent sur la planche.', 'Version A'],
  [7, 'emincer_b', 'Émincer', 'Oignon : même geste, les lamelles en demi-lune basculent à côté.', 'Version B'],
  [8, 'melanger', 'Mélanger', 'Plus de carrés : la cuillère tourne dans la sauce et laisse un tourbillon.'],
  [11, 'reposer', 'Laisser reposer', 'Film étirable bien visible sur le bol, minuteur qui se remplit, flocon pour le frais. Le trait blanc a disparu.'],
  [12, 'disposer', 'Disposer', 'La main pose les morceaux un par un, bien rangés dans le plat.'],
  ['12b', 'couches', 'Monter en couches', "Nouveau, pour les lasagnes et gratins : les couches arrivent dans l'ordre et l'étape en cours s'allume en haut.", 'Nouveau'],
  [13, 'assaisonner', 'Assaisonner', "La main secoue la salière et le sel tombe en pluie sur l'assiette."],
  [20, 'retourner', 'Retourner', "La crêpe décrit un arc sans s'arrêter en l'air, et retombe côté doré."],
  [26, 'oeufs', 'Casser les œufs', "Le bol est vide au départ. L'œuf se fêle, s'ouvre, puis le jaune et le blanc tombent."],
  [27, 'rouler', 'Rouler', 'Wrap : garnir, replier le bas, rabattre les côtés, rouler. Une flèche montre chaque pli.', 'Version A'],
  [27, 'rouler_b', 'Rouler', 'Makis : la natte enroule la feuille, puis on coupe les tranches.', 'Version B'],
  [30, 'brochettes', 'Brochettes', 'Viande, poivron, oignon, courgette : chaque morceau glisse le long de la pique.'],
  [31, 'microondes', 'Au micro-ondes', "L'assiette ne bouge plus. Le minuteur descend de 1:30 à 0:00, puis ça sonne."],
  [35, 'plier', 'Plier les raviolis', 'Quatre étapes affichées en haut : garnir, mouiller le bord, plier en demi-lune, pincer.'],
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
<header><span class="kick">Biscuit · mode cuisine</span><h1>Gestes corrigés, à valider</h1><p>Les numéros sont ceux de la première galerie. Les dessins sont plus simples, avec des étapes affichées quand le geste en a plusieurs. Les autres gestes ne changent pas, sauf la main.</p></header>
<div class="bar"><div class="seg" role="group" aria-label="Fond"><button aria-pressed="true" data-bg="light">Fond clair</button><button aria-pressed="false" data-bg="cook">Comme en cuisine</button></div><div class="seg" role="group" aria-label="Vitesse"><button aria-pressed="true" data-sp="1">Vitesse normale</button><button aria-pressed="false" data-sp="0.4">Ralenti</button><button aria-pressed="false" data-sp="0">Pause</button></div></div>
<h2 class="sec">1 · La main</h2>
<p class="sub">Main refaite : poing qui serre vraiment le manche, doigts arrondis, plus de manche vert. Choisis A ou B : elle sera la même dans les 35 gestes.</p>
<section class="hands">${hands}</section>
<h2 class="sec">2 · Les gestes repris</h2>
<p class="sub">Dessinés ici avec la main A. Pour Émincer et Rouler, deux versions : garde celle que tu préfères.</p>
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
