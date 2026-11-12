/* ═══ Biscuit · cœur (données, prix, optimiseur, photos, mouvement) ═══ */
/* ════════════ Réglages fixes ════════════ */
const CUISINES = {
  fr:{n:"Française",h:30}, it:{n:"Italienne",h:130}, in:{n:"Indienne",h:46}, as:{n:"Asiatique",h:340},
  mx:{n:"Mexicaine",h:12}, or:{n:"Orientale",h:280}, me:{n:"Méditerranéenne",h:175}, us:{n:"Américaine",h:215},
  af:{n:"Africaine & créole",h:85}, jp:{n:"Japonaise",h:352}, kr:{n:"Coréenne",h:8}, lb:{n:"Libanaise",h:95},
  gr:{n:"Grecque",h:205}, an:{n:"Antillaise",h:160}, br:{n:"Brésilienne",h:120}
};
// Recettes d'origine rangées dans les nouvelles cuisines
const RETAG = {teriyaki:"jp", oyakodon:"jp", ramen:"jp", "katsu-curry":"jp", "poke-saumon":"jp", "saumon-laque":"jp", bibimbap:"kr", pajeon:"kr",
  moussaka:"gr", souvlaki:"gr", "salade-grecque":"gr", "haricots-grecs":"gr", "tarte-epinards-feta":"gr", "feta-bake":"gr",
  falafels:"lb", "houmous-pita":"lb", chawarma:"lb", mujaddara:"lb", tabboule:"lb", colombo:"an"};
const NEW_CUISINES = ["jp","kr","lb","gr","an","br"];
const MEALS = {P:"Matin", M:"Midi", S:"Soir"};
const DIFF = ["","Facile","Moyen","Difficile"];
const ALLERGENS = {G:"Gluten", L:"Lactose", O:"Œufs", N:"Fruits à coque", f:"Poisson", c:"Crustacés"};
const DIETS = {"":"Je mange de tout", sansporc:"Sans porc", pesco:"Pescétarien", vege:"Végétarien"};
const AISLE_ORDER = ["fl","vi","po","cr","bo","ep","su","sg","pl"];
const BEEF = new Set(["boeuf","boeuf_hache","boeuf_emince","agneau","merguez"]);
const BIRD = new Set(["poulet","cuisse_poulet","dinde"]);
const SPOON_ML = new Set(["huile","huile_olive","vinaigre","sauce_soja","sauce_huitre","nuoc_mam"]);
const MOODS = {vite:"Vite fait", facile:"Facile", eco:"Pas cher", plaisir:"Se faire plaisir", partage:"À partager", vege:"Végé"};

/* ════════════ Sauvegarde ════════════ */
const KEY = "popote.v1";
let memCopy = null;
const DEFAULT = () => ({
  v:1, onboarded:false, store:"leclerc", budget:50, people:1, meals:{P:false,M:true,S:true}, days:7,
  diet:"", allergies:[], cuisines:Object.keys(CUISINES),
  week:null, history:[], favs:[], dislikes:[], custom:[], customIng:{}, prices:{}, stock:{}, toBuy:{}, checked:{}, batchDone:{}, batchDays:5,
  tonight:{people:3, moods:["vite"]},
  times:{P:"08:00", M:"12:30", S:"19:30"}, theme:"auto", reduceMotion:false, skipped:{}, hints:{}, alias:{}, launches:0
});
function loadState(){
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch(e) {}
  if (!raw) raw = memCopy;
  if (!raw) return DEFAULT();
  try { return Object.assign(DEFAULT(), JSON.parse(raw)); } catch(e) { return DEFAULT(); }
}
let S = loadState();
if (!S.cuisV2){ for (const k of NEW_CUISINES) if (!S.cuisines.includes(k)) S.cuisines.push(k); S.cuisV2 = 1; }
function save(){
  const s = JSON.stringify(S); memCopy = s;
  try { localStorage.setItem(KEY, s); } catch(e) {}
}

/* ════════════ Ingrédients & recettes ════════════ */
let I = {}, IKEYS = [], IIDX = {};
function buildIngredients(){
  I = {};
  const add = (k, a, custom) => { I[k] = {k, n:a[0], u:a[1], size:a[2], price:a[3], r:a[4], fl:a[5]||"", lab:a[6]||"", custom:!!custom}; };
  for (const k in ING) add(k, ING[k]);
  for (const k in S.customIng) add(k, S.customIng[k], true);
  IKEYS = Object.keys(I); IIDX = {}; IKEYS.forEach((k,i) => IIDX[k] = i);
}
let RX = [], RBYID = {};
function mkRecipe(a, custom){
  const [id,n,e,c0,m,d,t,tg,ings,steps] = a;
  const c = !custom && RETAG[id] ? RETAG[id] : c0;
  const i = ings.filter(x => I[x[0]]).map(x => x.slice(0,2));
  if (!custom) addBasics(id, i, tg);
  const F = {};
  for (const [k] of i) for (const ch of I[k].fl) F[ch] = 1;
  let prot = "vege";
  if (F.f || F.c) prot = "poisson";
  else if (i.some(x => BEEF.has(x[0]))) prot = "boeuf";
  else if (F.p) prot = "porc";
  else if (i.some(x => BIRD.has(x[0]))) prot = "volaille";
  return {id, n, photo:a[10]||"", e:e||"🍽️", c:CUISINES[c]?c:"fr", m, d:+d||1, t:+t||20, tg:tg||"", i, s:steps||[], F, prot, custom:!!custom,
    ix: i.map(([k,q]) => [IIDX[k], q])};
}
function buildRecipes(){
  RX = RECIPES.map(a => mkRecipe(a,false)).concat(S.custom.map(a => mkRecipe(a,true)));
  RBYID = {}; RX.forEach((r,idx) => { r.idx = idx; RBYID[r.id] = r; });
}
function rebuild(){ buildIngredients(); buildRecipes(); refreshPrices(); }

/* ════════════ Prix ════════════ */
function store(){ return STORES.find(s => s.id === S.store) || STORES[2]; }
function packPrice(k){ const c = S.prices[k]; return c != null ? c : I[k].price * store().k; }
function unitPrice(k){ return packPrice(k) / I[k].size; }
function serving(r){ return r.i.reduce((s,[k,q]) => s + q*unitPrice(k), 0); }
let PP=[], UP=[], SZ=[], ISW=[], ISPC=[], ISS=[], ISK=[], STK=[], TB=[];
function refreshPrices(){
  const n = IKEYS.length;
  PP = new Float64Array(n); UP = new Float64Array(n); SZ = new Float64Array(n); STK = new Float64Array(n);
  ISW = new Uint8Array(n); ISPC = new Uint8Array(n); ISS = new Uint8Array(n); ISK = new Uint8Array(n); TB = new Uint8Array(n);
  IKEYS.forEach((k,i) => {
    const g = I[k]; PP[i] = packPrice(k); SZ[i] = g.size; UP[i] = PP[i]/g.size;
    ISW[i] = g.fl.includes("W") ? 1 : 0; ISPC[i] = g.u === "pc" ? 1 : 0;
    ISS[i] = g.fl.includes("S") ? 1 : 0; ISK[i] = g.fl.includes("K") ? 1 : 0;
    STK[i] = S.stock[k] || 0; TB[i] = S.toBuy[k] ? 1 : 0;
  });
  RX.forEach(r => r.cost = serving(r));
}
function buyCost(i, buy){
  if (buy <= 1e-9) return 0;
  if (ISW[i]) return ISPC[i] ? Math.max(1, Math.ceil(buy - 0.05)) * PP[i] : buy * UP[i];
  return Math.max(1, Math.ceil(buy / SZ[i] - 0.08)) * PP[i];
}

/* ════════════ Optimiseur de semaine ════════════ */
const NEED = new Float64Array(4096); const TOUCH = [];
function totalFor(ids, people, useStock){
  TOUCH.length = 0;
  for (const id of ids){ if (id < 0) continue; for (const [i,q] of RX[id].ix){ if (NEED[i] === 0) TOUCH.push(i); NEED[i] += q*people; } }
  let t = 0;
  for (const i of TOUCH){
    if (!ISS[i] || TB[i]) t += buyCost(i, NEED[i] - (useStock ? STK[i] : 0));
    NEED[i] = 0;
  }
  return t;
}
const PROTS = ["vege","volaille","boeuf","porc","poisson"];
function optimize(o){
  const {slots, pools, budget, people} = o;
  const n = slots.length, costOnly = !!o.costOnly;
  const pref = new Float64Array(RX.length);
  for (let k=0;k<RX.length;k++) pref[k] = Math.random();
  const recent = o.recent || {}, favs = new Set(o.favs || []);
  const mains = []; slots.forEach((s,i) => { if (s.m !== "P") mains.push(i); });
  const nMain = mains.length;
  const cKeys = Object.keys(CUISINES);
  const capC = Math.max(2, Math.ceil(nMain*0.35)), capP = Math.max(2, Math.ceil(nMain*0.3));
  const cnt = new Map();
  function energy(ids){
    const C = totalFor(ids, people, true);
    let E = costOnly ? C : 0.3*C;
    if (!costOnly && C > budget) E += 8*(C - budget) + 5;
    cnt.clear(); let dup = 0;
    for (const id of ids){ const v = (cnt.get(id)||0) + 1; cnt.set(id,v); if (v > 1) dup++; }
    E += 50*dup;
    let V = 0;
    const cc = {}, pc = {};
    for (let j=0;j<nMain;j++){
      const r = RX[ids[mains[j]]];
      cc[r.c] = (cc[r.c]||0) + 1; pc[r.prot] = (pc[r.prot]||0) + 1;
      if (j>0){ const p = RX[ids[mains[j-1]]];
        if (p.c === r.c) V += r.c === "fr" ? 0.6 : 1.4;
        if (p.prot === r.prot && r.prot !== "vege") V += 0.9;
      }
      const sl = slots[mains[j]];
      if (sl.m === "M" && r.t > 40) V += 1.4;
      if (sl.m === "S" && r.t > 90) V += 0.8;
    }
    for (const k of cKeys) if ((cc[k]||0) > capC) V += 2*((cc[k]) - capC);
    for (const k of PROTS) if ((pc[k]||0) > capP) V += 2*((pc[k]) - capP);
    for (const id of ids){
      const r = RX[id]; const w = recent[r.id];
      if (w === 1) V += 5; else if (w === 2) V += 3; else if (w) V += 1.5;
      if (favs.has(r.id)) V -= 1;
      if (!costOnly) V -= 1.5*pref[id];
    }
    return E + (costOnly ? 0.25 : 1)*V;
  }
  const pick = arr => arr[(Math.random()*arr.length)|0];
  const locked = o.locked || [];
  let cur = [];
  const used = new Set();
  for (let i=0;i<n;i++){
    if (locked[i] != null){ cur.push(locked[i]); used.add(locked[i]); continue; }
    const pool = pools[slots[i].m];
    let c = pick(pool), tries = 0;
    while (used.has(c) && tries++ < 20) c = pick(pool);
    cur.push(c); used.add(c);
  }
  const free = []; for (let i=0;i<n;i++) if (locked[i] == null) free.push(i);
  let curE = energy(cur), best = cur.slice(), bestE = curE;
  if (!free.length) return {ids:best, cost:totalFor(best, people, true)};
  const iters = o.iters || (900 + 260*n), T0 = 3, T1 = 0.04;
  for (let it=0; it<iters; it++){
    const T = T0*Math.pow(T1/T0, it/iters);
    const i = free[(Math.random()*free.length)|0];
    const pool = pools[slots[i].m];
    const c = pick(pool); if (c === cur[i]) continue;
    const old = cur[i]; cur[i] = c;
    const e = energy(cur), d = e - curE;
    if (d < 0 || Math.random() < Math.exp(-d/T)){ curE = e; if (e < bestE){ bestE = e; best = cur.slice(); } }
    else cur[i] = old;
  }
  return {ids:best, cost:totalFor(best, people, true)};
}

/* ════════════ Filtres ════════════ */
function allowed(r, opts){
  opts = opts || {};
  if (!opts.ignoreDislikes && S.dislikes.includes(r.id)) return false;
  const F = r.F;
  if (S.diet === "vege" && (F.v || F.f || F.c)) return false;
  if (S.diet === "pesco" && F.v) return false;
  if (S.diet === "sansporc" && F.p) return false;
  for (const a of S.allergies) if (F[a]) return false;
  if (!opts.anyCuisine && r.m !== "P" && !S.cuisines.includes(r.c)) return false;
  return true;
}
function poolFor(m){ return RX.filter(r => r.m.includes(m) && allowed(r)).map(r => r.idx); }
function buildSlots(days, meals){
  const slots = [];
  for (let d=0; d<days; d++) for (const m of ["P","M","S"]) if (meals[m]) slots.push({d,m});
  return slots;
}
function recentMap(includeCurrent){
  const map = {};
  const hist = S.history.slice(-4).reverse();
  hist.forEach((w,i) => w.ids.forEach(id => { if (!map[id]) map[id] = i+1; }));
  if (includeCurrent && S.week) S.week.slots.forEach(s => { map[s.id] = 1; });
  return map;
}

/* ════════════ Semaine ════════════ */
function todayISO(){ const d = new Date(); d.setHours(12,0,0,0); return d.toISOString().slice(0,10); }
function dayDate(start, i){ const d = new Date(start + "T12:00:00"); d.setDate(d.getDate()+i); return d; }
const fmtDay = d => d.toLocaleDateString("fr-FR",{weekday:"long"});
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const fmtDM = d => d.toLocaleDateString("fr-FR",{day:"numeric", month:"short"});

function minCostEstimate(people, meals, days){
  rebuild();
  const slots = buildSlots(days, meals);
  if (!slots.length) return 0;
  const pools = {}; for (const m of ["P","M","S"]) pools[m] = poolFor(m);
  for (const s of slots) if (!pools[s.m].length) return null;
  const saveStk = STK; STK = new Float64Array(IKEYS.length);
  const res = optimize({slots, pools, budget:1e9, people, costOnly:true, iters:600 + 160*slots.length});
  STK = saveStk;
  return res.cost;
}
function generateWeek(keepIds){
  rebuild();
  const slots = buildSlots(S.days, S.meals);
  if (!slots.length){ toast("Coche au moins un repas dans les réglages."); return false; }
  const pools = {};
  for (const m of ["P","M","S"]) pools[m] = poolFor(m);
  for (const s of slots) if (!pools[s.m].length){ toast("Aucune recette ne correspond à tes filtres pour le repas du " + MEALS[s.m].toLowerCase() + "."); return false; }
  const old = S.week;
  if (old && (old.done || old.start < addDaysISO(todayISO(), -4))) pushHistory(old);
  const locked = keepIds ? slots.map((s,i) => keepIds[i] != null ? keepIds[i] : null) : [];
  const res = optimize({slots, pools, budget:S.budget, people:S.people, recent:recentMap(true), favs:S.favs, locked});
  S.week = {start: todayISO(), days: S.days, slots: slots.map((s,i) => ({d:s.d, m:s.m, id:RX[res.ids[i]].id})), done:false, minCost:null};
  if (res.cost > S.budget + 0.01){
    const r2 = optimize({slots, pools, budget:S.budget, people:S.people, costOnly:true});
    S.week.minCost = Math.min(res.cost, r2.cost);
    if (r2.cost < res.cost - 0.5) S.week.slots = slots.map((s,i) => ({d:s.d, m:s.m, id:RX[r2.ids[i]].id}));
  }
  S.checked = {};
  save();
  return true;
}
function addDaysISO(iso, n){ const d = new Date(iso+"T12:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
function pushHistory(w){
  if (!w || !w.slots) return;
  S.history.push({start:w.start, ids:w.slots.map(s => s.id)});
  S.history = S.history.slice(-8);
}
function weekIdx(){ return S.week ? S.week.slots.map(s => RBYID[s.id] ? RBYID[s.id].idx : -1) : []; }
function weekTotal(){ return totalFor(weekIdx(), S.people, true); }

/* ════════════ Liste de courses ════════════ */
function buildList(recipes, people, useStock){
  const need = {};
  for (const r of recipes) for (const [k,q] of r.i) need[k] = (need[k]||0) + q*people;
  const items = [];
  for (const k in need){
    if (I[k].fl.includes("Z")) continue;
    const g = I[k], i = IIDX[k];
    const staple = g.fl.includes("S");
    const have = useStock ? (S.stock[k]||0) : 0;
    const buy = Math.max(0, need[k] - have);
    const cost = buyCost(i, buy);
    let packs = 0;
    if (buy > 1e-9){
      if (ISW[i]) packs = ISPC[i] ? Math.max(1, Math.ceil(buy - 0.05)) : buy/g.size;
      else packs = Math.max(1, Math.ceil(buy/g.size - 0.08));
    }
    items.push({k, g, need:need[k], have:Math.min(have, need[k]), buy, packs, cost, staple, counted: !staple || !!S.toBuy[k]});
  }
  items.sort((a,b) => a.g.n.localeCompare(b.g.n, "fr"));
  return items;
}

/* ════════════ Formats ════════════ */
const EUR = new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"});
const eur = x => EUR.format(Math.round(x*100)/100);
const num = x => (Math.round(x*100)/100).toLocaleString("fr-FR");
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function frac(x){
  if (x <= 0) return "0";
  let w = Math.floor(x + 1e-6); const r = x - w;
  const opts = [[0,""],[0.25,"¼"],[1/3,"⅓"],[0.5,"½"],[2/3,"⅔"],[0.75,"¾"],[1,""]];
  let best = 0, bd = 9;
  opts.forEach((o,i) => { const dd = Math.abs(r - o[0]); if (dd < bd){ bd = dd; best = i; } });
  if (best === 6) return String(w + 1);
  const f = opts[best][1];
  if (!f) return w ? String(w) : "¼";
  return (w ? w + " " : "") + f;
}
function plural(lab, x){ if (x <= 1.0001 || !lab) return lab; return lab.endsWith("eau") ? lab + "x" : lab + "s"; }
function spoons(ml){
  if (ml < 7.5){ const t = Math.max(0.5, Math.round(ml/5*2)/2); return frac(t) + " c. à café"; }
  const T = Math.max(1, Math.round(ml/15*2)/2); return frac(T) + " c. à soupe";
}
function qtyLabel(k, q){
  const g = I[k];
  if (g.u === "pc"){ const f = frac(q); return g.lab ? f + " " + plural(g.lab, q) : f; }
  if (g.u === "ml"){
    if (SPOON_ML.has(k) && q <= 45) return spoons(q);
    if (q >= 1000) return num(q/1000) + " L";
    if (q >= 100) return num(Math.round(q/10)) + " cl";
    return Math.round(q) + " ml";
  }
  if (g.r === "pl" && k !== "sucre"){
    if (q < 0.6) return "1 pincée";
    if (q < 1.5) return "½ c. à café";
    if (q < 3) return "1 c. à café";
    if (q < 6) return "2 c. à café";
    return frac(Math.round(q/7*2)/2) + " c. à soupe";
  }
  if (q >= 1000) return num(Math.round(q/10)/100) + " kg";
  if (q >= 100) return Math.round(q/10)*10 + " g";
  if (q >= 20) return Math.round(q/5)*5 + " g";
  return Math.max(1, Math.round(q)) + " g";
}
function sizeLabel(g){
  if (g.u === "pc") return g.size > 1 ? "boîte de " + g.size : "pièce";
  if (g.u === "ml") return g.size >= 1000 ? (g.size/1000) + " L" : (g.size/10) + " cl";
  return g.size >= 1000 ? (g.size/1000).toLocaleString("fr-FR") + " kg" : g.size + " g";
}
function packLabel(it){
  const g = it.g;
  if (it.buy <= 1e-9) return "";
  if (g.fl.includes("W")) return g.u === "pc" ? it.packs + (it.packs > 1 ? " pièces" : " pièce") : "au poids";
  return it.packs + " × " + sizeLabel(g);
}
function priceBasis(g){
  if (g.fl.includes("W")) return g.u === "pc" ? "la pièce" : (g.u === "g" ? "le kilo" : "le litre");
  return "le " + (g.u === "pc" ? (g.size > 1 ? "paquet de " + g.size : "lot") : "paquet de " + sizeLabel(g));
}
function timeLabel(t){ return t >= 60 ? Math.floor(t/60) + " h" + (t%60 ? String(t%60).padStart(2,"0") : "") : t + " min"; }

/* ════════════ Photos des plats ════════════ */
const PHKEY = "popote.photos.v2";
let PH = {};
try { PH = JSON.parse(localStorage.getItem(PHKEY)) || {}; } catch(e) {}
// Photos corrigées : on oublie l'ancienne trouvaille une seule fois
try { if (localStorage.getItem("biscuit.phfix") !== "1"){ ["tamagoyaki","tofu-braise","keftedes","gratin-patate-douce","accras","alloco-poisson","tartines-chevre-miel","mug-cake","ndambe","galettes-avoine-legumes","tofu-brocoli"].forEach(id => delete PH[id]); savePH(); localStorage.setItem("biscuit.phfix", "1"); } } catch(e) {}
let phBusy = false, phDead = false;
const phWant = new Set();
function savePH(){ try { localStorage.setItem(PHKEY, JSON.stringify(PH)); } catch(e) {} }
function phCandidates(id){
  const s = PHOTOS[id]; if (!s) return [];
  return s.split("|").map(x => { const i = x.indexOf(":"); return {lang:x.slice(0,i), title:x.slice(i+1)}; });
}
function photoSrc(r){ if (r.photo) return r.photo; const p = PH[r.id]; return p && p.src ? p.src : ""; }
function bigSrc(src){ return src.replace(/\/(\d+)px-/, "/960px-"); }
function photo(r, cls){
  const src = photoSrc(r), hero = (cls||"").includes("hero");
  const dead = !src && (phDead || (PH[r.id] && PH[r.id].none));
  const img = src ? '<img src="' + esc(hero ? bigSrc(src) : src) + '" data-small="' + esc(src) + '" alt="" decoding="async"' + (hero ? "" : ' loading="lazy"') + ">" : "";
  return '<span class="ph ' + (cls||"") + (dead ? " noimg" : "") + '" data-pid="' + esc(r.id) + '"><span class="ph-fb" aria-hidden="true">' + (src ? "" : esc(r.e)) + "</span>" + img + "</span>";
}
function paintPhoto(id){
  const r = RBYID[id]; if (!r) return;
  const src = photoSrc(r);
  document.querySelectorAll(".ph[data-pid]").forEach(el => {
    if (el.dataset.pid !== id) return;
    if (!src){ el.classList.add("noimg"); return; }
    if (el.querySelector("img")) return;
    const img = document.createElement("img");
    const hero = el.classList.contains("hero");
    img.alt = ""; img.decoding = "async"; img.dataset.small = src; img.src = hero ? bigSrc(src) : src;
    el.appendChild(img);
  });
  const c = document.getElementById("credit"); if (c && c.dataset.cid === id) loadCredit(id);
}
function hydrate(){
  document.querySelectorAll(".ph[data-pid]").forEach(el => {
    const id = el.dataset.pid, r = RBYID[id]; if (!r || r.photo) return;
    const p = PH[id];
    if (p && p.src){ if (!el.querySelector("img")) paintPhoto(id); }
    else if (!p || (p.none && Date.now() - p.t > 7*864e5)) phWant.add(id);
  });
  if (phWant.size && !phBusy && !phDead) resolvePhotos();
}
async function wikiQuery(lang, params){
  const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const tm = ctl ? setTimeout(() => ctl.abort(), 10000) : 0;
  try {
    const res = await fetch("https://" + lang + ".wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*&" + params, ctl ? {signal:ctl.signal} : {});
    if (!res.ok) throw new Error("http " + res.status);
    return await res.json();
  } finally { if (tm) clearTimeout(tm); }
}
async function pageImages(lang, titles){
  const j = await wikiQuery(lang, "redirects=1&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=500&titles=" + encodeURIComponent(titles.join("|")));
  const q = j.query || {}, map = {}, out = {};
  for (const pg of (q.pages || [])) if (pg.thumbnail && pg.thumbnail.source && pg.pageimage) map[pg.title] = {src:pg.thumbnail.source, file:pg.pageimage};
  for (const t of titles){
    let cur = t;
    for (const n of (q.normalized || [])) if (n.from === cur) cur = n.to;
    for (const r of (q.redirects || [])) if (r.from === cur) cur = r.to;
    if (map[cur]) out[t] = map[cur];
  }
  return out;
}
const STOPW = new Set(["avec","pour","sauce","façon","facon","maison","aux","des","les","une","dans","plat"]);
const normW = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
async function searchImage(r){
  const words = normW(r.n).split(/[^a-z]+/).filter(w => w.length >= 4 && !STOPW.has(w));
  if (!words.length) return null;
  const j = await wikiQuery("fr", "generator=search&gsrlimit=3&gsrnamespace=0&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=500&gsrsearch=" + encodeURIComponent(r.n));
  const pages = ((j.query && j.query.pages) || []).sort((a,b) => (a.index||0) - (b.index||0));
  for (const pg of pages){
    if (!pg.thumbnail || !pg.pageimage) continue;
    const t = normW(pg.title);
    if (words.some(w => t.includes(w.slice(0, Math.max(4, w.length - 2))))) return {src:pg.thumbnail.source, file:pg.pageimage, lang:"fr"};
  }
  return null;
}
async function resolvePhotos(){
  phBusy = true;
  try {
    while (phWant.size){
      const ids = [...phWant]; phWant.clear();
      let pending = ids.map(id => ({id, k:0}));
      while (pending.length){
        const groups = {}, next = [], noCand = [];
        for (const p of pending){
          const c = phCandidates(p.id)[p.k];
          if (!c){ noCand.push(p.id); continue; }
          (groups[c.lang] = groups[c.lang] || []).push(p);
        }
        for (const lang in groups){
          const list = groups[lang];
          for (let i = 0; i < list.length; i += 25){
            const chunk = list.slice(i, i+25);
            const found = await pageImages(lang, [...new Set(chunk.map(p => phCandidates(p.id)[p.k].title))]);
            for (const p of chunk){
              const f = found[phCandidates(p.id)[p.k].title];
              if (f){ PH[p.id] = {src:f.src, file:f.file, lang}; paintPhoto(p.id); }
              else next.push({id:p.id, k:p.k+1});
            }
          }
        }
        for (const id of noCand){
          const r = RBYID[id]; const f = r ? await searchImage(r) : null;
          PH[id] = f || {none:true, t:Date.now()};
          paintPhoto(id);
        }
        pending = next;
      }
      savePH();
    }
  } catch(e) {
    phDead = true;
    document.querySelectorAll(".ph[data-pid]").forEach(el => { if (!el.querySelector("img")) el.classList.add("noimg"); });
  }
  phBusy = false;
}
async function loadCredit(id){
  const p = PH[id];
  if (p && p.file && !p.credit){
    try {
      const j = await wikiQuery(p.lang, "prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=Artist%7CLicenseShortName&titles=" + encodeURIComponent("File:" + p.file));
      const pg = ((j.query && j.query.pages) || [])[0];
      const md = (pg && pg.imageinfo && pg.imageinfo[0] && pg.imageinfo[0].extmetadata) || {};
      const strip = h => h ? new DOMParser().parseFromString(h, "text/html").body.textContent.replace(/\s+/g," ").trim() : "";
      p.credit = {a:strip(md.Artist && md.Artist.value).slice(0,80), l:(md.LicenseShortName && md.LicenseShortName.value) || ""};
      savePH();
    } catch(e) {}
  }
  const el = document.getElementById("credit");
  if (!el || el.dataset.cid !== id || !p || !p.src) return;
  const c = p.credit || {};
  el.innerHTML = "Photo : " + (c.a ? esc(c.a) + " · " : "") + (c.l ? esc(c.l) + " · " : "") +
    '<a href="https://' + p.lang + ".wikipedia.org/wiki/File:" + encodeURIComponent(p.file) + '" target="_blank" rel="noopener">Wikimedia Commons</a>';
}
document.addEventListener("load", e => {
  const t = e.target;
  if (t && t.tagName === "IMG" && t.parentNode && t.parentNode.classList && t.parentNode.classList.contains("ph")){
    t.classList.add("in"); t.parentNode.classList.add("loaded");
    const fb = t.parentNode.querySelector(".ph-fb"); if (fb) fb.textContent = "";
  }
}, true);
document.addEventListener("error", e => {
  const t = e.target; if (!t || t.tagName !== "IMG" || !t.parentNode || !t.parentNode.classList || !t.parentNode.classList.contains("ph")) return;
  if (t.dataset.small && t.getAttribute("src") !== t.dataset.small) t.setAttribute("src", t.dataset.small);
  else { const ph = t.parentNode; t.remove(); ph.classList.add("noimg"); const r = RBYID[ph.dataset.pid]; const fb = ph.querySelector(".ph-fb"); if (fb && r) fb.textContent = r.e; }
}, true);

/* ════════════ Mouvement ════════════ */
const SYS_REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const reduced = () => SYS_REDUCED || !!S.reduceMotion;
// Ressort façon Apple : « response » (s) et amortissement (1 = sans rebond). Part de la valeur actuelle et garde la vitesse.
function spring(from, to, opt, onStep, onDone){
  let x = from, v = opt.velocity || 0, last = performance.now(), raf = 0, stopped = false;
  const T = opt.response || 0.4, z = opt.damping == null ? 1 : opt.damping;
  const k = Math.pow(2*Math.PI/T, 2), c = 4*Math.PI*z/T;
  function step(now){
    if (stopped) return;
    const dt = Math.min(0.034, (now - last)/1000); last = now;
    for (let i = 0; i < 4; i++){ const h = dt/4; v += (-k*(x - to) - c*v)*h; x += v*h; }
    if (Math.abs(x - to) < 0.4 && Math.abs(v) < 8){ onStep(to); if (onDone) onDone(); return; }
    onStep(x); raf = requestAnimationFrame(step);
  }
  if (reduced()){ onStep(to); if (onDone) onDone(); return {stop(){}, get value(){ return to; }}; }
  raf = requestAnimationFrame(step);
  return {stop(){ stopped = true; cancelAnimationFrame(raf); }, get value(){ return x; }, get velocity(){ return v; }};
}
const project = (v, d = 0.998) => (v/1000) * d / (1 - d);
const rubber = (o, dim, c = 0.55) => (o*dim*c) / (dim + c*Math.abs(o));
function buzz(ms){ try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch(e) {} }
function animateNum(el, from, to){
  if (!el) return;
  if (reduced() || from == null || Math.abs(from - to) < 0.005){ el.textContent = eur(to); return; }
  const t0 = performance.now(), d = 650;
  (function f(now){ const p = Math.min(1, (now - t0)/d), e = 1 - Math.pow(1-p, 3); el.textContent = eur(from + (to-from)*e); if (p < 1) requestAnimationFrame(f); })(t0);
}

function tonightCandidates(){
  const moods = S.tonight.moods;
  const tests = {vite:r => r.t <= 25, facile:r => r.d === 1, plaisir:r => r.tg.includes("p"), partage:r => r.tg.includes("x"), vege:r => !r.F.v && !r.F.f && !r.F.c};
  let list = RX.filter(r => r.m.includes("S") && allowed(r, {anyCuisine:true})), relaxed = false;
  for (const m of moods){ if (!tests[m]) continue; const next = list.filter(tests[m]); if (next.length >= 3) list = next; else relaxed = true; }
  if (moods.includes("eco")){ list = list.slice().sort((a,b) => a.cost - b.cost); list = list.slice(0, Math.max(9, Math.ceil(list.length*0.35))); }
  return {list, relaxed};
}
function shuffleWithSeed(arr, seed){
  const a = arr.slice(); let s = seed*9301 + 49297;
  for (let i = a.length-1; i > 0; i--){ s = (s*9301 + 49297) % 233280; const j = Math.floor(s/233280*(i+1)); [a[i],a[j]] = [a[j],a[i]]; }
  return a;
}

/* ════════════ Ingrédients de base et quantités dans les étapes ════════════ */
const NO_SALT = new Set(["yaourt-granola","smoothie","bircher","fromage-blanc-noix","tartine-cacahuete","yaourt-pomme","muesli-maison","tartines-confiture"]);
const SALT_ONLY = new Set(["porridge-banane","porridge-choco","pancakes","pain-perdu","crepes"]);
function addBasics(id, list, tg){
  const has = k => list.some(x => x[0] === k);
  const sweet = NO_SALT.has(id) || /[dn]/.test(tg || ""), saltOnly = SALT_ONLY.has(id) || /s/.test(tg || "");
  if (!sweet && !has("sel")) list.push(["sel", 0.5]);
  if (!sweet && !saltOnly && !has("poivre")) list.push(["poivre", 0.2]);
  const D = typeof DETAILS !== "undefined" ? DETAILS[id] : null;
  if (D && !has("eau")){
    for (const st of D.steps){ const m = st.match(/(\d+)\s*ml d'eau[^.]*?par personne/); if (m){ list.push(["eau", +m[1]]); break; } }
  }
}
// Mots qui désignent chaque ingrédient dans le texte des étapes
const KW = {
  oignon:"oignons?(?! (?:rouges?|nouveaux))", oignon_r:"oignons? rouges?", echalote:"échalotes?", ail:"ail", gingembre:"gingembre",
  carotte:"carottes?", pdt:"pommes? de terre", patate_douce:"patates? douces?", tomate:"tomates?(?! cerises?)", tomate_cerise:"tomates? cerises?",
  courgette:"courgettes?", aubergine:"aubergines?", poivron:"poivrons?", brocoli:"brocolis?", chou_fleur:"chou-fleur", champignon:"champignons?",
  poireau:"poireaux?", endive:"endives?", concombre:"concombres?", salade:"salade(?! (?:niçoise|grecque|composée|lyonnaise|de))", avocat:"avocats?",
  citron:"citron(?! vert)", citron_vert:"citron vert", banane:"bananes?", pomme:"pommes?(?! de terre)", coriandre:"coriandre", persil:"persil",
  basilic:"basilic", menthe:"menthe", ciboulette:"ciboulette", cebette:"oignons nouveaux", chou:"chou(?!-fleur)", courge:"courge", soja:"(?<!sauce )soja",
  epinards:"épinards", haricots_verts:"haricots verts", petits_pois:"petits pois", legumes_wok:"légumes", fruits_rouges:"fruits(?: rouges)?", frites:"frites",
  colin:"(?:poisson|colin)", crevette:"crevettes?", poulet:"poulet", cuisse_poulet:"poulet", dinde:"(?:dinde|escalopes?)", boeuf_hache:"(?:viande|bœuf|steak)",
  boeuf:"(?:viande|bœuf)", boeuf_emince:"bœuf", porc:"porc", lardons:"lardons", jambon:"jambon", chorizo:"chorizo", saucisse:"saucisses?", merguez:"merguez",
  agneau:"agneau", saumon:"saumon", moule:"moules", oeuf:"(?:œufs?|jaune)", beurre:"beurre(?! de cacahu)", lait:"lait(?! de coco)", creme:"crème(?! de (?:cajou|sésame))",
  creme_liq:"crème(?! de (?:cajou|sésame))", yaourt:"yaourts?", fromage_blanc:"fromage blanc", yaourt_grec:"yaourt", emmental:"(?:fromage|emmental)",
  parmesan:"parmesan", mozza:"mozzarella", feta:"feta", chevre:"chèvre", cheddar:"(?:cheddar|fromage)", ricotta:"ricotta", reblochon:"reblochon",
  pate_brisee:"pâte", pate_feuil:"pâte", pate_pizza:"pâte", gnocchi:"gnocchis?", tofu:"tofu", baguette:"(?:pain|baguette)", pain_mie:"pain", pain_burger:"pains?",
  pita:"pitas?", tortilla:"tortillas?", spaghetti:"(?:spaghetti|pâtes)", penne:"(?:penne|pâtes)", coquillette:"(?:coquillettes|pâtes)", tagliatelle:"(?:tagliatelles|pâtes)",
  lasagne:"(?:feuilles de lasagnes|lasagnes)", nouilles:"nouilles", nouilles_riz:"nouilles", riz:"riz", riz_rond:"riz", semoule:"semoule", boulgour:"boulgour",
  lentilles:"lentilles", lentilles_corail:"lentilles", farine:"farine", farine_sarrasin:"farine", chapelure:"chapelure", pois_chiche:"pois chiches",
  haricot_rouge:"haricots(?: rouges)?", haricot_blanc:"haricots", tomate_boite:"tomates", passata:"coulis", concentre:"concentré", mais:"maïs", thon:"thon",
  olive:"olives", lait_coco:"lait de coco", pate_curry:"pâte de curry", sauce_soja:"sauce soja", sauce_huitre:"sauce d'huître", nuoc_mam:"nuoc-mâm",
  beurre_cacahuete:"beurre de cacahuète", cacahuete:"cacahuètes", cajou:"(?:noix de cajou|cajou)", tahini:"tahini", pesto:"pesto", sesame:"sésame",
  mayo:"mayonnaise", ketchup:"ketchup", moutarde:"moutarde", flocons_avoine:"flocons", granola:"granola", confiture:"confiture", miel:"miel",
  chocolat:"chocolat", raisin_sec:"raisins", noix:"noix(?! de)", sucre:"sucre", huile:"huile", huile_olive:"huile", vinaigre:"vinaigre",
  bouillon:"(?:bouillon|cube)", levure:"levure", cumin:"cumin", paprika:"paprika", curry:"curry(?! (?:vert|rouge))", curcuma:"curcuma",
  garam:"(?:garam masala|épices)", ras:"(?:ras el hanout|épices)", cannelle:"cannelle", piment:"piment", herbes:"herbes", origan:"origan", thym:"thym",
  muscade:"muscade", poivre:"poivre", sel:"sel",
  nori:"(?:feuilles? de )?nori", vinaigre_riz:"vinaigre de riz", miso:"(?:pâte )?miso", kimchi:"kimchi", gochujang:"(?:pâte de piment(?: coréenne)?|gochujang)", huile_sesame:"huile de sésame",
  udon:"(?:nouilles )?udon", feuilles_gyoza:"feuilles? (?:à|de) raviolis", colombo_ep:"(?:poudre à )?colombo", plantain:"bananes? plantains?", haricot_noir:"haricots noirs",
  lait_concentre:"lait concentré", cacao:"cacao", mascarpone:"mascarpone", boudoirs:"biscuits(?: cuillère)?", cafe:"café soluble", maizena:"(?:maïzena|fécule)",
  pois_casses:"pois cassés", sardine:"sardines?", pate_filo:"(?:feuilles de )?(?:pâte )?filo", sucre_vanille:"sucre vanillé", coco_rapee:"(?:noix de )?coco râpée",
  pain_complet:"pain", saumon_fume:"saumon"
};
const KWRE = {};
for (const k in KW){
  try { KWRE[k] = new RegExp("(?<![\\p{L}-])(" + KW[k] + ")(?![\\p{L}])", "iu"); }
  catch(e){ KWRE[k] = new RegExp("(?:^|[^a-zà-ÿœæ-])(" + KW[k].replace(/\(\?<![^)]*\)/g, "") + ")(?![a-zà-ÿœæ])", "i"); } // anciens iPhone (avant iOS 16.4)
}
function fmtWater(ml){ return ml >= 1000 ? num(Math.round(ml/100)/10) + " L" : (ml >= 100 ? Math.round(ml/10) + " cl" : Math.round(ml) + " ml"); }
// Insère les quantités (calculées pour « mult » personnes ou portions) à la première mention de chaque ingrédient
function annotateSteps(r, steps, mult){
  const used = new Set();
  return steps.map(raw => {
    let s = raw.replace(/(environ )?(\d+)\s*ml ((?:d'eau|de lait)[^.,;]*?) par personne/g, (m0, env, n, what) => (env || "") + "\u0001" + fmtWater(+n*mult) + "\u0002 " + what);
    for (const [k, q] of r.i){
      if (used.has(k) || k === "eau" || !KWRE[k]) continue;
      const m = KWRE[k].exec(s);
      if (!m) continue;
      const after = s.slice(m.index + m[0].length);
      if (/^\s*\(/.test(after) || /^[^.:;]{0,30}(?:sont|est) (?:déjà )?salée?s?/.test(after)) continue;
      used.add(k);
      s = s.slice(0, m.index + m[0].length) + " \u0003" + qtyLabel(k, q*mult) + "\u0004" + after;
    }
    return esc(s).replace(/\u0001/g, '<b class="qt">').replace(/\u0002/g, "</b>").replace(/\u0003/g, '<b class="qt">(').replace(/\u0004/g, ")</b>");
  });
}
// Mise en place : ce qu'il faut préparer avant d'allumer le feu
const PEEL = new Set(["oignon","oignon_r","echalote","ail","carotte","pdt","patate_douce","gingembre","courge","banane","avocat"]);
const HERBS = new Set(["coriandre","persil","basilic","menthe","ciboulette","cebette"]);
function prepVerb(k){
  const g = I[k];
  if (g.r === "fl"){ if (PEEL.has(k)) return "À éplucher"; if (HERBS.has(k)) return "À laver et sécher"; if (k === "champignon") return "À nettoyer"; return "À laver"; }
  if (k === "colin" || k === "crevette") return "À décongeler (la veille au frigo)";
  if (g.r === "sg") return "À sortir du congélateur au moment de cuire";
  if (g.r === "vi" || g.r === "po" || g.r === "cr") return "À sortir du frigo";
  return "À peser ou mesurer";
}
function miseEnPlace(entries){
  const rows = [], staples = [];
  for (const [k, q] of entries){
    const g = I[k]; if (!g || k === "eau") continue;
    if (g.fl.includes("S")){ staples.push(g.n.toLowerCase()); continue; }
    rows.push({k, q, verb:prepVerb(k)});
  }
  const order = ["À décongeler (la veille au frigo)","À éplucher","À laver","À nettoyer","À laver et sécher","À sortir du frigo","À sortir du congélateur au moment de cuire","À peser ou mesurer"];
  rows.sort((a,b) => order.indexOf(a.verb) - order.indexOf(b.verb));
  return {rows, staples};
}
const videoURL = n => "https://www.youtube.com/results?search_query=" + encodeURIComponent("recette " + n);

/* ════════════ Batch cooking ════════════ */
function batchInfo(r){
  const D = typeof DETAILS !== "undefined" ? DETAILS[r.id] : null, k = (D && D.keep) || "";
  const m = k.match(/(\d+)\s*jours?\s*au frigo/);
  const fridge = m ? +m[1] : 0, freeze = /congélateur/.test(k) && !/sans/.test(k.split("congélateur")[0].slice(-20));
  return {fridge, freeze, ok:fridge >= 3 || freeze};
}
function batchCandidates(){ return RX.filter(r => r.m !== "P" && (r.m.includes("M") || r.m.includes("S")) && allowed(r) && batchInfo(r).ok); }
function batchSlots(){ return buildSlots(S.batchDays || 5, S.meals); }
function generateBatchWeek(keep){
  rebuild();
  const slots = batchSlots();
  const n = slots.filter(s => s.m !== "P").length;
  if (!n){ toast("Coche le déjeuner ou le dîner dans les réglages."); return false; }
  const cand = batchCandidates();
  if (cand.length < 3){ toast("Pas assez de plats qui se conservent avec tes filtres."); return false; }
  const K = Math.max(2, Math.min(6, Math.round(n/3), cand.length));
  const counts = Array.from({length:K}, (_, j) => Math.floor(n/K) + (j < n % K ? 1 : 0));
  const keepIds = (keep || []).map(r => r && (r.id || r)); const fixed = cand.filter(r => keepIds.includes(r.id)).sort((a,b) => keepIds.indexOf(a.id) - keepIds.indexOf(b.id)).slice(0, K);
  const recent = recentMap(true), favs = new Set(S.favs);
  const pref = {}; cand.forEach(r => pref[r.id] = Math.random());
  function score(set){
    const ids = []; set.forEach((r, j) => { for (let c = 0; c < counts[j]; c++) ids.push(r.idx); });
    const C = totalFor(ids, S.people, true);
    let E = 0.3*C + (C > S.budget ? 8*(C - S.budget) + 5 : 0);
    const cu = {}, pt = {};
    for (const r of set){ cu[r.c] = (cu[r.c]||0) + 1; pt[r.prot] = (pt[r.prot]||0) + 1; if (recent[r.id] && !fixed.includes(r)) E += 3; if (favs.has(r.id)) E -= 1; E -= 2*pref[r.id]; if (!batchInfo(r).freeze) E += 0.6; }
    for (const k in cu) if (cu[k] > 1) E += 2.5*(cu[k]-1);
    const words = set.map(r => new Set(normW(r.n).split(/[^a-z]+/).filter(x => x.length >= 5)));
    for (let x = 0; x < set.length; x++) for (let y = x+1; y < set.length; y++) for (const w of words[x]) if (words[y].has(w)) { E += 3; break; }
    for (const k in pt) if (pt[k] > 1) E += 2*(pt[k]-1);
    return {E, C};
  }
  const pick = () => cand[(Math.random()*cand.length)|0];
  let best = null, bestS = null;
  for (let t = 0; t < 300; t++){
    const set = fixed.slice(); while (set.length < K){ const r = pick(); if (!set.includes(r)) set.push(r); }
    const sc = score(set); if (!best || sc.E < bestS.E){ best = set; bestS = sc; }
  }
  if (fixed.length < K) for (let t = 0; t < 600; t++){
    const set = best.slice(), j = fixed.length + ((Math.random()*(K - fixed.length))|0); const r = pick(); if (set.includes(r)) continue; set[j] = r;
    const sc = score(set); if (sc.E < bestS.E){ best = set; bestS = sc; }
  }
  const old = S.week;
  if (old && (old.done || old.start < addDaysISO(todayISO(), -4))) pushHistory(old);
  fillBatchWeek(best, counts, slots);
  return true;
}
// Répartit les plats sur les repas : ceux qui se congèlent mal en début de semaine, jamais deux fois de suite
function fillBatchWeek(set, counts, slots, opt){
  opt = opt || {};
  const mains = slots.filter(s => s.m !== "P");
  const left = set.map((r, j) => ({r, c:counts[j], info:batchInfo(r)}));
  const assign = [];
  let prev = null;
  for (const sl of mains){
    const day = sl.d + 1;
    const ok = left.filter(x => x.c > 0 && (x.info.freeze || day <= x.info.fridge));
    let pool = ok.filter(x => x.r !== prev); if (!pool.length) pool = ok.length ? ok : left.filter(x => x.c > 0);
    pool.sort((a,b) => (a.info.freeze - b.info.freeze) || (b.c - a.c));
    const x = pool[0]; x.c--; prev = x.r; assign.push(x.r.id);
  }
  const pList = shuffleWithSeed(poolFor("P").map(i => RX[i]), (Math.random()*1000)|0);
  let a = 0, pb = 0;
  const keepP = opt.keepP || {};
  S.week = {start:opt.start || todayISO(), days:S.batchDays || 5, batch:true, minCost:null, done:false,
    slots:slots.map(s => ({d:s.d, m:s.m, id: s.m === "P" ? (keepP[s.d] || (pList.length ? pList[(pb++) % pList.length].id : "porridge-banane")) : assign[a++]}))};
  const tot = weekTotal(); if (tot > S.budget + 0.01) S.week.minCost = tot;
  if (!opt.keepProgress){ S.checked = {}; S.batchDone = {}; }
  save();
}
function batchDishes(){
  const order = [], counts = {};
  S.week.slots.forEach(s => { if (s.m === "P") return; if (!(s.id in counts)){ order.push(s.id); counts[s.id] = 0; } counts[s.id]++; });
  return {order, counts};
}
function batchSwapScored(curId){
  const {order} = batchDishes(), inSet = new Set(order), ids = weekIdx(), base = totalFor(ids, S.people, true);
  const pos = S.week.slots.map((s, i) => s.id === curId ? i : -1).filter(i => i >= 0);
  return batchCandidates().filter(r => !inSet.has(r.id)).map(r => {
    const ids2 = ids.slice(); pos.forEach(i => ids2[i] = r.idx); const t = totalFor(ids2, S.people, true); return {r, t, d:t - base};
  });
}
function batchPlan(){
  const w = S.week; const byId = new Map();
  w.slots.forEach((s, i) => { if (s.m === "P") return; const r = RBYID[s.id]; if (!r) return; if (!byId.has(r.id)) byId.set(r.id, {r, slots:[]}); byId.get(r.id).slots.push({...s, i}); });
  const dishes = [...byId.values()].map(x => ({...x, mult:x.slots.length * S.people, info:batchInfo(x.r)}));
  dishes.sort((a,b) => b.r.t - a.r.t);
  return dishes;
}

function timerOf(s){
  let m = s.match(/(\d+)\s*h(?:eures?)?\s*(\d+)?/);
  if (m && /\d+\s*h(\s|eure|\d|$)/.test(m[0] + " ")) return (+m[1])*60 + (+(m[2]||0));
  m = s.match(/(\d+)\s*(?:à\s*\d+\s*)?minutes?/);
  return m && +m[1] >= 2 ? +m[1] : 0;
}
const TM = {end:0, label:"", int:0};
