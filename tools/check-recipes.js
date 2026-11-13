// Vérifie toutes les recettes : ingrédients connus, détails, photos, quantités dans les étapes, gestes, coût
const fs = require('fs'), path = require('path');
const files = ['ingredients.js','r1-matin.js','r2-france.js','r3-italie-inde.js','r4-asie-mexique.js','r5-monde.js','r6-plus.js','photos.js','d1-matin.js','d2-france-a.js','d3-france-b.js','d4-italie.js','d5-inde.js','d6-asie.js','d7-mexique-orient.js','d8-med-us-afrique.js']
  .concat(fs.readdirSync(path.join(__dirname,'../data')).filter(f=>/^d(9|1\d)-.*\.js$/.test(f)).sort((a,b)=>parseInt(a.slice(1))-parseInt(b.slice(1))));
const code = files.map(f=>fs.readFileSync(path.join(__dirname,'../data',f),'utf8')).join('\n') + '\n' +
  fs.readFileSync(path.join(__dirname,'../src/b/core.js'),'utf8') + '\n' + fs.readFileSync(path.join(__dirname,'../src/b/gestures-art.js'),'utf8') + '\n' + fs.readFileSync(path.join(__dirname,'../src/b/gestures.js'),'utf8') +
  '\nfunction toast(){}\nrebuild();\nreturn {RX, I, DETAILS, PHOTOS, RECIPES, ING, KWRE, GX, annotateSteps, CUISINES};';
const E = new Function('localStorage','matchMedia','document','window', code)(undefined, undefined, {addEventListener(){}, querySelector(){ return null; }}, {});
const {RX, I, DETAILS, PHOTOS, RECIPES, ING, KWRE, GX, CUISINES} = E;
const onlyNew = process.argv.includes('--new');
const NEW = new Set(RECIPES.slice(203).map(a => a[0]));
let warn = 0; const ids = new Set(), gcount = {}; let miss = [];
for (const a of RECIPES){
  const id = a[0]; if (ids.has(id)) { console.log('DOUBLON', id); warn++; } ids.add(id);
  if (onlyNew && !NEW.has(id)) continue;
  for (const [k] of a[8]) if (!ING[k]) { console.log('INGRÉDIENT INCONNU', id, k); warn++; }
  if (!DETAILS[id]) { console.log('PAS DE DÉTAIL', id); warn++; continue; }
  if (!PHOTOS[id]) { console.log('PAS DE PHOTO', id); warn++; }
  const D = DETAILS[id], r = RX.find(x => x.id === id);
  if (!CUISINES[a[3]]) { console.log('CUISINE', id, a[3]); warn++; }
  const txt = D.steps.join(' ');
  for (const [k] of r.i){ if (k === 'eau' || I[k].fl.includes('S') && ['sel','poivre'].includes(k)) continue; if (!KWRE[k]) { console.log('PAS DE MOT-CLÉ', id, k); warn++; continue; } if (!KWRE[k].test(txt)) { console.log('NON CITÉ', id, k, '(' + I[k].n + ')'); warn++; } }
  if (!/\d+\s*jours?\s*au frigo|congélateur|tout de suite|dans la journée|semaines?|boîte/.test(D.keep||'')) { console.log('CONSERVATION ?', id, D.keep); }
  for (const s of D.steps){ const g = GX.match(s); if (g) gcount[g] = (gcount[g]||0) + 1; else miss.push(id + ': ' + s.slice(0, 90)); }
  if (r.cost < 0.2 || r.cost > 7) console.log('COÛT', id, r.cost.toFixed(2));
}
const ns = RECIPES.filter(a => !onlyNew || NEW.has(a[0])).reduce((n, a) => n + DETAILS[a[0]].steps.length, 0);
console.log('\nrecettes', RECIPES.length, '· nouvelles', NEW.size, '· alertes', warn);
console.log('gestes', Object.entries(gcount).sort((a,b)=>b[1]-a[1]).map(x=>x.join(':')).join(' '));
console.log('étapes sans geste', miss.length, '/', ns);
if (process.argv.includes('--miss')) miss.forEach(m => console.log('  -', m));
const byc = {}; for (const r of RX) byc[r.c] = (byc[r.c]||0) + 1; console.log(JSON.stringify(byc));
const costs = RX.filter(r => NEW.has(r.id)).map(r => [r.id, r.cost.toFixed(2)]); if (process.argv.includes('--cost')) console.log(costs.map(x => x.join(' ')).join(' | '));
