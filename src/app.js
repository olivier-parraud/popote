(function(){
'use strict';

/* ════════════ Réglages fixes ════════════ */
const CUISINES = {
  fr:{n:"Française",h:30}, it:{n:"Italienne",h:130}, in:{n:"Indienne",h:46}, as:{n:"Asiatique",h:340},
  mx:{n:"Mexicaine",h:12}, or:{n:"Orientale",h:280}, me:{n:"Méditerranéenne",h:175}, us:{n:"Américaine",h:215},
  af:{n:"Africaine & créole",h:85}
};
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
  tonight:{people:3, moods:["vite"]}
});
function loadState(){
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch(e) {}
  if (!raw) raw = memCopy;
  if (!raw) return DEFAULT();
  try { return Object.assign(DEFAULT(), JSON.parse(raw)); } catch(e) { return DEFAULT(); }
}
let S = loadState();
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
  const [id,n,e,c,m,d,t,tg,ings,steps] = a;
  const i = ings.filter(x => I[x[0]]).map(x => x.slice(0,2));
  if (!custom) addBasics(id, i);
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

/* ════════════ Icônes ════════════ */
const ICO = {
  week:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M7.5 14h3M13.5 14h3M7.5 17.5h3"/></svg>',
  cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.5l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 8H6.3"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13h16a8 8 0 0 1-16 0Z"/><path d="M12 13V9M8.5 9.5 7 7M15.5 9.5 17 7M2.5 13h19"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 8h7M9 11.5h5"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/></svg>',
  swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10-7.5 10Z"/></svg>',
  heartOn:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10-7.5 10Z"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/></svg>',
  dice:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.4 6.4L3 16M3 21v-5h5"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  out:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/></svg>',
  ban:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/></svg>'
};

/* ════════════ Photos des plats ════════════ */
const PHKEY = "popote.photos.v2";
let PH = {};
try { PH = JSON.parse(localStorage.getItem(PHKEY)) || {}; } catch(e) {}
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
const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  if (REDUCED){ onStep(to); if (onDone) onDone(); return {stop(){}, get value(){ return to; }}; }
  raf = requestAnimationFrame(step);
  return {stop(){ stopped = true; cancelAnimationFrame(raf); }, get value(){ return x; }, get velocity(){ return v; }};
}
const project = (v, d = 0.998) => (v/1000) * d / (1 - d);
const rubber = (o, dim, c = 0.55) => (o*dim*c) / (dim + c*Math.abs(o));
function buzz(ms){ try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch(e) {} }
function animateNum(el, from, to){
  if (!el) return;
  if (REDUCED || from == null || Math.abs(from - to) < 0.005){ el.textContent = eur(to); return; }
  const t0 = performance.now(), d = 650;
  (function f(now){ const p = Math.min(1, (now - t0)/d), e = 1 - Math.pow(1-p, 3); el.textContent = eur(from + (to-from)*e); if (p < 1) requestAnimationFrame(f); })(t0);
}

/* ════════════ Interface ════════════ */
const $ = sel => document.querySelector(sel);
const SC = () => document.getElementById("scroller") || document.scrollingElement;
let TAB = "week";
const UI = {q:"", fc:"", ff:[], tonightSeed:0, swapSeed:0, swapQ:"", enter:true, pop:null, lastTotal:null, lastListTotal:null};
let sheetState = null;
const TITLES = {week:"Ta semaine", list:"Courses", batch:"Batch cooking", tonight:"Ce soir ?", recipes:"Recettes"};
const ICO2 = {
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5 5.5 4h13L20 9.5M4 9.5h16M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 12.5V20h13v-7.5M10 20v-4.5h4V20"/></svg>',
  chev:'<svg class="chev" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m1 1 6 6-6 6"/></svg>'
};
const pr = (x, suffix) => '<span class="pr">' + eur(x) + (suffix ? "<small> " + suffix + "</small>" : "") + "</span>";
const stg = i => ' style="--i:' + Math.min(i, 14) + '"';
function seg(act, opts, cur, extra){
  const i = Math.max(0, opts.findIndex(o => String(o[0]) === String(cur)));
  return '<div class="seg" role="group" style="--n:' + opts.length + ";--i:" + i + '"' + (extra||"") + '><span class="seg-ind" aria-hidden="true"></span>' +
    opts.map(([k,n]) => '<button data-act="' + act + '" data-k="' + k + '" aria-pressed="' + (String(k) === String(cur)) + '">' + n + "</button>").join("") + "</div>";
}
function segPick(btn){
  const s = btn.closest(".seg"); if (!s) return;
  const bs = [...s.querySelectorAll("button")];
  bs.forEach(b => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
  s.style.setProperty("--i", bs.indexOf(btn));
}
const sw = (act, k, on, label) => '<button class="switch" role="switch" data-act="' + act + '" data-k="' + k + '" aria-checked="' + !!on + '" aria-label="' + esc(label) + '"></button>';

function shell(){
  document.getElementById("app").innerHTML =
    '<div id="stage"><div id="scroller"><header class="nav" id="nav"><div class="wrap nav-in">' +
    '<div class="nav-left"><button class="pill-btn" data-act="settings" aria-label="Changer de magasin">' + ICO2.pin + '<span id="storeName"></span></button></div>' +
    '<div class="nav-title" id="navTitle"></div>' +
    '<div class="nav-right"><button class="icon-btn" data-act="settings" aria-label="Réglages">' + ICO.gear + "</button></div></div></header>" +
    '<main id="view"></main></div>' +
    '<nav class="tabs" aria-label="Sections"><div class="tabs-in">' +
    [["week","Semaine",ICO.week],["list","Courses",ICO.cart],["batch","Batch",ICO3.batch],["tonight","Ce soir ?",ICO.moon],["recipes","Recettes",ICO.book]]
      .map(([k,n,ic]) => '<button class="tab" data-act="tab" data-tab="' + k + '">' + ic + n + "</button>").join("") +
    "</div></nav></div>" +
    '<div id="timerPill" class="timer-pill" hidden role="timer"><span class="tp-ico">' + ICO3.timer + '</span><span class="tp-l"></span><span class="tp-t"></span><button data-act="timerstop" aria-label="Arrêter le minuteur">' + ICO.close + "</button></div>";
  const sc = SC(), nav = $("#nav");
  sc.addEventListener("scroll", () => nav.classList.toggle("solid", sc.scrollTop > 36), {passive:true});
  document.addEventListener("touchstart", () => {}, {passive:true});
}
function render(){
  $("#storeName").textContent = store().n;
  $("#navTitle").textContent = TITLES[TAB];
  document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-current", b.dataset.tab === TAB ? "page" : "false"));
  $("#view").innerHTML = '<div class="wrap' + (UI.enter ? " enter" : "") + '">' + ({week:viewWeek, list:viewList, batch:viewBatch, tonight:viewTonight, recipes:viewRecipes}[TAB])() + "</div>";
  UI.enter = false; UI.pop = null;
  if (TAB === "week" && $("#weekTotal")) animateNum($("#weekTotal"), UI.lastTotal, +$("#weekTotal").dataset.v);
  if (TAB === "list" && $("#listTotal")) animateNum($("#listTotal"), UI.lastListTotal, +$("#listTotal").dataset.v);
  if (TAB === "week" && $("#weekTotal")) UI.lastTotal = +$("#weekTotal").dataset.v;
  if (TAB === "list" && $("#listTotal")) UI.lastListTotal = +$("#listTotal").dataset.v;
  $("#nav").classList.toggle("solid", SC().scrollTop > 36);
  hydrate();
}
function go(tab){ if (tab !== TAB) UI.enter = true; TAB = tab; render(); SC().scrollTop = 0; $("#nav").classList.remove("solid"); }

/* ── Semaine ── */
function viewWeek(){
  if (!S.week) return '<div class="large"><h1>Ta semaine</h1></div><div class="empty"><p>Pas encore de semaine prévue.</p><button class="btn primary" data-act="newweek">Créer ma semaine</button></div>';
  const w = S.week, total = weekTotal(), B = S.budget, nMeals = w.slots.length, over = total > B + 0.01, nDays = w.days || S.days;
  let h = '<div class="large fade"><h1>Ta semaine</h1><p>Du ' + fmtDM(dayDate(w.start,0)) + " au " + fmtDM(dayDate(w.start, nDays-1)) + " · " + nMeals + " repas · " + S.people + " pers.</p></div>";
  h += '<section class="sum stag"' + stg(0) + ' aria-label="Budget"><div class="sum-top"><div><div class="cap">Courses estimées</div><div class="big" id="weekTotal" data-v="' + total.toFixed(2) + '">' + eur(total) + '</div></div><div><div class="cap" style="text-align:right">Budget</div><div class="mid">' + eur(B) + "</div></div></div>" +
       '<div class="bar ' + (over ? "over" : "") + '"><span style="width:' + Math.min(100, total/B*100).toFixed(1) + '%"></span></div>' +
       '<div class="sum-foot"><span class="' + (over ? "bad-txt" : "ok-txt") + '">' + (over ? "Dépasse de " + eur(total - B) : "Reste " + eur(B - total)) + "</span><span>≈ <b>" + eur(total / Math.max(1, nMeals*S.people)) + "</b> par repas</span></div>";
  if (over){
    const sug = Math.ceil(Math.max(total, w.minCost || total) + 2);
    h += '<div class="alert"><div><b>Budget trop juste.</b> Avec ces réglages, compte au moins ' + eur(Math.ceil(w.minCost || total)) + " pour " + nDays + " jours.</div>" +
         '<div><button class="btn sm primary" data-act="setbudget" data-v="' + sug + '">Passer à ' + sug + " €</button></div></div>";
  }
  if (w.batch) h += '<div class="alert ok"><div><b>Semaine batch cooking.</b> Tous ces repas se préparent en une seule session.</div><div><button class="btn sm primary" data-act="tab" data-tab="batch">Voir le plan de préparation</button></div></div>';
  if (w.done) h += '<div class="alert ok"><div><b>Courses faites.</b> Le reste des paquets est rangé au placard et sera déduit de la prochaine liste.</div></div>';
  h += "</section>";
  let k = 1;
  for (let d = 0; d < nDays; d++){
    const slots = w.slots.map((s,i) => ({...s, i})).filter(s => s.d === d);
    if (!slots.length) continue;
    const date = dayDate(w.start, d);
    h += '<h2 class="day-h stag"' + stg(k++) + ">" + (d === 0 && w.start === todayISO() ? "Aujourd'hui" : cap(fmtDay(date))) + "<span>" + fmtDM(date) + '</span></h2><div class="group stag"' + stg(k++) + ">";
    for (const s of slots){
      const r = RBYID[s.id]; if (!r) continue;
      h += '<div class="meal' + (UI.pop === s.i ? " pop" : "") + '" role="button" tabindex="0" data-act="open" data-id="' + esc(r.id) + '" data-slot="' + s.i + '">' + photo(r, "thumb") +
           '<div style="min-width:0"><div class="meal-k">' + MEALS[s.m] + '</div><div class="meal-n">' + esc(r.n) + '</div><div class="meta">' + timeLabel(r.t) + " · " + DIFF[r.d] + "</div></div>" +
           '<div class="side">' + pr(r.cost, "/pers.") + '<button class="swap" data-act="swap" data-slot="' + s.i + '" aria-label="Changer ce plat">' + ICO.swap + "</button></div></div>";
    }
    h += "</div>";
  }
  h += '<div class="actions"><button class="btn" data-act="newweek-ask">' + ICO.dice + 'Autre semaine</button><button class="btn primary" data-act="tab" data-tab="list">' + ICO.cart + "Courses</button></div>";
  return h;
}

/* ── Courses ── */
function listData(){
  const recipes = weekIdx().filter(i => i >= 0).map(i => RX[i]);
  const items = buildList(recipes, S.people, true);
  return {recipes, items, toBuy:items.filter(it => !it.staple && it.buy > 1e-9), covered:items.filter(it => !it.staple && it.buy <= 1e-9), staples:items.filter(it => it.staple), total:items.reduce((s,it) => s + (it.counted ? it.cost : 0), 0)};
}
function cartSummary(){
  const {toBuy} = listData(); const n = toBuy.filter(it => S.checked[it.k]).length;
  const c = $("#cartCount"), b = $("#cartBar");
  if (c) c.textContent = n + " sur " + toBuy.length + " dans le chariot";
  if (b) b.style.width = (toBuy.length ? n/toBuy.length*100 : 0) + "%";
}
function viewList(){
  if (!S.week) return '<div class="large"><h1>Courses</h1></div><div class="empty"><p>Crée d\'abord ta semaine : la liste se fait toute seule.</p><button class="btn primary" data-act="newweek">Créer ma semaine</button></div>';
  const {recipes, toBuy, covered, staples, total} = listData();
  const nDone = toBuy.filter(it => S.checked[it.k]).length, over = total > S.budget + 0.01;
  let h = '<div class="large fade"><h1>Courses</h1><p>' + toBuy.length + " articles pour " + recipes.length + " repas, chez " + esc(store().n) + ".</p></div>";
  h += '<section class="sum stag"' + stg(0) + '><div class="sum-top"><div><div class="cap">Total estimé</div><div class="big" id="listTotal" data-v="' + total.toFixed(2) + '">' + eur(total) + '</div></div><div><div class="cap" style="text-align:right">Budget</div><div class="mid">' + eur(S.budget) + "</div></div></div>" +
       '<div class="bar"><span id="cartBar" style="width:' + (toBuy.length ? nDone/toBuy.length*100 : 0) + '%"></span></div>' +
       '<div class="sum-foot"><span id="cartCount">' + nDone + " sur " + toBuy.length + ' dans le chariot</span><span class="' + (over ? "bad-txt" : "ok-txt") + '">' + (over ? "Dépasse de " + eur(total - S.budget) : "Reste " + eur(S.budget - total)) + "</span></div></section>";
  let k = 1;
  for (const a of AISLE_ORDER){
    const list = toBuy.filter(it => it.g.r === a);
    if (!list.length) continue;
    h += '<div class="group-h stag"' + stg(k++) + ">" + RAYONS[a].n + "<b>" + eur(list.reduce((s,it) => s + it.cost, 0)) + '</b></div><div class="group stag"' + stg(k++) + ">";
    for (const it of list){
      const done = !!S.checked[it.k];
      h += '<div class="item ' + (done ? "done" : "") + '" data-k="' + it.k + '"><button class="check" data-act="check" data-k="' + it.k + '" aria-label="' + esc(it.g.n) + '" aria-pressed="' + done + '">' + ICO.check + "</button>" +
           '<div style="min-width:0"><div class="item-n">' + esc(it.g.n) + '</div><div class="item-q">' + qtyLabel(it.k, it.need) + (packLabel(it) ? " · " + packLabel(it) : "") +
           (it.have > 0 ? " · <b>" + qtyLabel(it.k, it.have) + " au placard</b>" : "") + "</div></div>" +
           '<button class="cost" data-act="editprice" data-k="' + it.k + '" aria-label="Modifier le prix de ' + esc(it.g.n) + '">' + eur(it.cost) + "</button></div>";
    }
    h += "</div>";
  }
  if (covered.length){
    h += '<div class="group-h">Déjà au placard</div><div class="group">';
    for (const it of covered) h += '<div class="item done"><span class="check">' + ICO.check + '</span><div><div class="item-n">' + esc(it.g.n) + '</div><div class="item-q">' + qtyLabel(it.k, it.need) + " pris dans ton stock</div></div><span></span></div>";
    h += "</div>";
  }
  if (staples.length){
    h += '<div class="group-h">À vérifier dans ton placard</div><div class="group">';
    for (const it of staples){
      const on = !!S.toBuy[it.k];
      h += '<div class="item"><span></span><div><div class="item-n">' + esc(it.g.n) + '</div><div class="item-q">' + qtyLabel(it.k, it.need) + (on ? " · " + eur(it.cost) : "") + "</div></div>" +
           '<button class="mini-toggle" data-act="tobuy" data-k="' + it.k + '" aria-pressed="' + on + '">' + (on ? "À acheter" : "J'en ai") + "</button></div>";
    }
    h += '</div><div class="group-f">Huile, épices, sucre… Non comptés dans le total. Touche « J\'en ai » s\'il t\'en manque.</div>';
  }
  h += '<div class="actions"><button class="btn" data-act="copylist">' + ICO.copy + "Copier</button>" +
       (S.week.done ? '<button class="btn" data-act="undodone">Annuler</button>' : '<button class="btn primary" data-act="done">' + ICO.check + "Courses faites</button>") + "</div>";
  h += '<p class="note" style="margin:14px 4px 0">Prix estimés pour ' + esc(store().n) + ". Touche un prix pour le corriger avec celui de ton ticket : l'appli s'en souviendra.</p>";
  return h;
}

/* ── Ce soir ── */
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
function viewTonight(){
  const t = S.tonight;
  let h = '<div class="large fade"><h1>Ce soir ?</h1><p>Des idées pour une soirée improvisée, avec la liste de courses.</p></div>';
  h += '<div class="group stag"' + stg(0) + '><div class="cell"><span class="grow">On est combien ?</span><div class="stepper"><button data-act="tpeople" data-d="-1" aria-label="Une personne de moins">−</button><output>' + t.people + '</output><button data-act="tpeople" data-d="1" aria-label="Une personne de plus">+</button></div></div></div>';
  h += '<div style="margin-top:14px" class="chips scroll stag"' + stg(1) + ' role="group" aria-label="Envies">' + Object.entries(MOODS).map(([k,n]) => '<button class="chip" data-act="mood" data-k="' + k + '" aria-pressed="' + t.moods.includes(k) + '">' + n + "</button>").join("") + "</div>";
  const {list, relaxed} = tonightCandidates();
  const picks = shuffleWithSeed(list, UI.tonightSeed + 7).slice(0, 5);
  if (relaxed) h += '<p class="note" style="margin:10px 4px 0">Pas assez d\'idées avec toutes ces envies, j\'ai un peu élargi.</p>';
  h += '<div class="ideas" id="ideas">';
  picks.forEach((r, i) => {
    const c = buildList([r], t.people, false).reduce((s,it) => s + (it.counted ? it.cost : 0), 0);
    const why = [];
    if (r.t <= 25) why.push("Prêt en " + r.t + " min");
    if (r.d === 1) why.push("Facile");
    if (r.tg.includes("p")) why.push("Gourmand");
    if (r.tg.includes("x")) why.push("Se partage bien");
    if (r.cost < 1.6) why.push("Petit prix");
    h += '<button class="idea press stag"' + stg(i+2) + ' data-act="open" data-id="' + esc(r.id) + '" data-people="' + t.people + '">' + photo(r, "wide") +
         '<div class="idea-b"><div class="idea-k">' + CUISINES[r.c].n + '</div><div class="idea-n">' + esc(r.n) + "</div>" +
         '<div class="idea-row"><span>' + timeLabel(r.t) + " · " + DIFF[r.d] + "</span>" + pr(c, "pour " + t.people) + '</div><div class="why">' + why.slice(0,3).map(w => "<span>" + w + "</span>").join("") + "</div></div></button>";
  });
  h += '</div><div class="actions one"><button class="btn primary" data-act="reroll">' + ICO.dice + "Autres idées</button></div>";
  return h;
}

/* ── Recettes ── */
function viewRecipes(){
  const nq = normW(UI.q.trim());
  const list = RX.filter(r => {
    if (UI.fc && r.c !== UI.fc) return false;
    if (UI.ff.includes("fav") && !S.favs.includes(r.id)) return false;
    if (UI.ff.includes("rapide") && r.t > 25) return false;
    if (UI.ff.includes("facile") && r.d !== 1) return false;
    if (UI.ff.includes("matin") && !r.m.includes("P")) return false;
    if (UI.ff.includes("vege") && (r.F.v || r.F.f || r.F.c)) return false;
    if (UI.ff.includes("mine") && !r.custom) return false;
    if (UI.ff.includes("hidden") && !S.dislikes.includes(r.id)) return false;
    if (nq && !normW(r.n + " " + r.i.map(x => I[x[0]].n).join(" ")).includes(nq)) return false;
    return true;
  }).sort((a,b) => a.n.localeCompare(b.n,"fr"));
  let h = '<div class="large fade"><h1>Recettes</h1><p>' + RX.length + " plats, de l'omelette au tajine.</p></div>";
  h += '<div class="search"><label class="sr" for="rq">Chercher une recette</label>' + ICO.search + '<input class="input" id="rq" type="search" placeholder="Rechercher" value="' + esc(UI.q) + '" data-in="rq" autocomplete="off"></div>';
  h += '<div style="margin-top:12px" class="chips scroll" role="group" aria-label="Cuisine"><button class="chip" data-act="fc" data-k="" aria-pressed="' + (!UI.fc) + '">Toutes</button>' +
       Object.entries(CUISINES).map(([k,c]) => '<button class="chip" data-act="fc" data-k="' + k + '" aria-pressed="' + (UI.fc === k) + '">' + c.n + "</button>").join("") + "</div>";
  const ff = [["fav","Favoris"],["rapide","Rapide"],["facile","Facile"],["vege","Végé"],["matin","Petit-déj"],["mine","Mes recettes"],["hidden","Écartées"]];
  h += '<div style="margin-top:8px" class="chips scroll" role="group" aria-label="Filtres">' + ff.map(([k,n]) => '<button class="chip" data-act="ff" data-k="' + k + '" aria-pressed="' + UI.ff.includes(k) + '">' + n + "</button>").join("") + "</div>";
  h += '<div class="row" style="margin-top:14px"><span class="count">' + list.length + " recette" + (list.length > 1 ? "s" : "") + '</span><button class="btn plain sm" data-act="newrecipe">' + ICO.plus + "Ajouter</button></div>";
  h += '<div class="grid" id="rgrid">' + list.map((r, i) => '<button class="rcard press' + (i < 10 ? " stag" : "") + '"' + (i < 10 ? stg(i) : "") + ' data-act="open" data-id="' + esc(r.id) + '">' + photo(r, "card") +
       '<span class="rcard-n">' + esc(r.n) + (S.favs.includes(r.id) ? ' <span class="fav-dot">♥</span>' : "") + "</span>" +
       '<span class="meta">' + eur(r.cost) + " · " + timeLabel(r.t) + "</span></button>").join("") + "</div>";
  if (!list.length) h += '<div class="empty">Aucune recette ne correspond.</div>';
  return h;
}

/* ════════════ Ingrédients de base et quantités dans les étapes ════════════ */
const NO_SALT = new Set(["yaourt-granola","smoothie","bircher","fromage-blanc-noix","tartine-cacahuete","yaourt-pomme","muesli-maison","tartines-confiture"]);
const SALT_ONLY = new Set(["porridge-banane","porridge-choco","pancakes","pain-perdu","crepes"]);
function addBasics(id, list){
  const has = k => list.some(x => x[0] === k);
  if (!NO_SALT.has(id) && !has("sel")) list.push(["sel", 0.5]);
  if (!NO_SALT.has(id) && !SALT_ONLY.has(id) && !has("poivre")) list.push(["poivre", 0.2]);
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
  muscade:"muscade", poivre:"poivre", sel:"sel"
};
const KWRE = {};
for (const k in KW) KWRE[k] = new RegExp("(?<![\\p{L}-])(" + KW[k] + ")(?![\\p{L}])", "iu");
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
function openBatchSwap(curId){
  const cur = RBYID[curId], n = batchDishes().counts[curId] || 0;
  const scored = batchSwapScored(curId);
  const fits = scored.filter(x => x.t <= S.budget + 0.01);
  const src = fits.length >= 6 ? fits : scored.slice().sort((a,b) => a.t - b.t).slice(0, 24);
  const sugg = shuffleWithSeed(src, UI.swapSeed + curId.length*17).slice(0, 6);
  let h = '<p class="note" style="margin:0">Actuellement : <b>' + esc(cur ? cur.n : "") + "</b>, prévu pour " + n + " repas. Le plat choisi le remplacera sur tous ces repas.</p>";
  h += '<div class="search"><label class="sr" for="bsq">Chercher une recette</label>' + ICO.search + '<input class="input" id="bsq" type="search" placeholder="Rechercher un plat qui se conserve" value="' + esc(UI.swapQ) + '" data-in="bsq" autocomplete="off"></div>';
  h += '<div id="swaplist">' + batchSwapListHTML(curId, sugg, scored, normW(UI.swapQ.trim())) + "</div>";
  openSheet("Changer ce plat", h, {kind:"bswap", id:curId});
}
function batchSwapListHTML(curId, sugg, scored, q){
  const diff = d => '<span class="delta" style="color:var(' + (d > 0.01 ? "--orange-text" : "--green-text") + ')">' + (d > 0.01 ? "+" : d < -0.01 ? "−" : "±") + eur(Math.abs(d)) + "</span>";
  let list = sugg, h = "";
  if (q){
    list = scored.filter(x => normW(x.r.n).includes(q)).slice(0, 30);
    h += '<div class="group-h" style="padding-top:4px">' + list.length + " résultat" + (list.length > 1 ? "s" : "") + "</div>";
  } else h += '<div class="group-h" style="padding-top:4px">Se gardent bien<button class="btn plain sm" data-act="bswapreroll" data-id="' + esc(curId) + '" style="height:auto">' + ICO.dice + "Autres</button></div>";
  if (!list.length) h += '<div class="group-f">Aucun plat de batch cooking ne correspond. Essaie un autre mot.</div>';
  else h += '<div class="group">' + list.map(x => { const bi = batchInfo(x.r); return '<button class="rrow" data-act="bswapdo" data-from="' + esc(curId) + '" data-id="' + esc(x.r.id) + '">' + photo(x.r, "mini") +
       '<div style="min-width:0"><div class="rrow-n">' + esc(x.r.n) + '</div><div class="meta">' + timeLabel(x.r.t) + " · " + (bi.freeze ? "se congèle" : bi.fridge + " j au frigo") + "</div></div>" +
       '<div style="display:grid;justify-items:end;gap:2px">' + pr(x.r.cost, "/pers.") + diff(x.d) + "</div></button>"; }).join("") + "</div>";
  if (!q) h += '<div class="group-f">Seuls les plats qui tiennent au frigo ou se congèlent sont proposés. Le montant indique ce que ça change sur tes courses.</div>';
  return h;
}
function batchPlan(){
  const w = S.week; const byId = new Map();
  w.slots.forEach((s, i) => { if (s.m === "P") return; const r = RBYID[s.id]; if (!r) return; if (!byId.has(r.id)) byId.set(r.id, {r, slots:[]}); byId.get(r.id).slots.push({...s, i}); });
  const dishes = [...byId.values()].map(x => ({...x, mult:x.slots.length * S.people, info:batchInfo(x.r)}));
  dishes.sort((a,b) => b.r.t - a.r.t);
  return dishes;
}
function viewBatch(){
  let h = '<div class="large fade"><h1>Batch cooking</h1><p>Prépare tous les repas de ta semaine en une seule session, puis réchauffe-les chaque jour en 3 minutes.</p></div>';
  const bd = S.batchDays || 5;
  const daysSeg = '<div class="group stag"' + stg(0) + '><div class="cell"><span class="grow" style="white-space:nowrap">Nombre de jours</span><div style="width:180px;flex:none">' + seg("bdays", [[3,"3"],[4,"4"],[5,"5"],[6,"6"],[7,"7"]], bd) + "</div></div></div>" +
    '<div class="group-f">Repas prévus : ' + ["P","M","S"].filter(m => S.meals[m]).map(m => MEALS[m].toLowerCase()).join(", ") + " (à changer dans les réglages). Au-delà de 3 jours, une partie des plats ira au congélateur.</div>";
  if (!S.week || !S.week.batch){
    h += daysSeg;
    h += '<section class="sum stag" style="margin-top:16px"' + stg(1) + '><div class="cap">Le principe</div><div style="display:grid;gap:10px;font-size:15px;line-height:1.45">' +
      "<span><b>1.</b> L'appli choisit quelques plats qui se gardent bien au frigo ou au congélateur, et les multiplie pour couvrir les jours choisis.</span>" +
      "<span><b>2.</b> Tu changes les plats qui ne te plaisent pas, puis tu fais les courses en une fois.</span>" +
      "<span><b>3.</b> Un soir ou le dimanche, tu suis le plan pas à pas : tout est cuisiné en même temps, en 2 à 3 heures.</span>" +
      "<span><b>4.</b> Tu ranges tout en boîtes, avec ce qui va au frigo et ce qui va au congélateur.</span></div>" +
      '<button class="btn primary block" data-act="batchgen">' + ICO.dice + "Créer ma semaine batch cooking</button>" +
      (S.week ? '<p class="note" style="margin:0">Elle remplacera ta semaine actuelle, avec le même budget (' + eur(S.budget) + ").</p>" : "") + "</section>";
    h += '<div class="links" style="margin-top:16px"><a class="btn sm" href="' + "https://www.youtube.com/results?search_query=" + encodeURIComponent("batch cooking débutant semaine") + '" target="_blank" rel="noopener">' + ICO.out + "Vidéos pour débuter</a></div>";
    return h;
  }
  const w = S.week, dishes = batchPlan(), nMain = w.slots.filter(s => s.m !== "P").length;
  const sumT = dishes.reduce((s,x) => s + x.r.t, 0), maxT = Math.max(...dishes.map(x => x.r.t));
  const est = Math.round((Math.max(maxT, sumT*0.6) + 20)/5)*5;
  const done = S.batchDone || {};
  const ck = (key, inner) => '<button class="bcheck' + (done[key] ? " done" : "") + '" data-act="bdone" data-k="' + esc(key) + '"><span class="check">' + ICO.check + "</span><span>" + inner + "</span></button>";
  const total = weekTotal(), over = total > S.budget + 0.01;
  h += daysSeg;
  // Les plats de la semaine, en haut
  h += '<div class="group-h stag"' + stg(1) + ">Tes plats de la semaine<b>" + eur(total) + "</b></div><div class=\"group stag\"" + stg(2) + ">";
  for (const x of dishes){
    const days = x.slots.map(sl => cap(dayDate(w.start, sl.d).toLocaleDateString("fr-FR",{weekday:"short"}).replace(".","")) + " " + MEALS[sl.m].toLowerCase()).join(", ");
    h += '<div class="meal' + (UI.pop === x.r.id ? " pop" : "") + '" role="button" tabindex="0" data-act="open" data-id="' + esc(x.r.id) + '">' + photo(x.r, "thumb") +
         '<div style="min-width:0"><div class="meal-k">' + x.slots.length + " repas" + (x.info.freeze ? " · se congèle" : " · " + x.info.fridge + " j au frigo") + '</div><div class="meal-n">' + esc(x.r.n) + '</div><div class="meta">' + esc(days) + "</div></div>" +
         '<div class="side">' + pr(x.r.cost, "/pers.") + '<button class="swap" data-act="bswap" data-id="' + esc(x.r.id) + '" aria-label="Changer ce plat">' + ICO.swap + "</button></div></div>";
  }
  h += "</div>";
  h += '<div class="group-f">' + (over ? '<span class="bad-txt">Dépasse ton budget de ' + eur(total - S.budget) + ".</span> " : "Dans ton budget de " + eur(S.budget) + ". ") + "Touche ⇄ pour changer un plat qui ne te plaît pas.</div>";
  h += '<section class="sum stag" style="margin-top:16px"' + stg(3) + '><div class="facts" style="background:none;padding:0"><div class="fact"><span>Plats</span><b>' + dishes.length + '</b></div><div class="fact"><span>Repas</span><b>' + nMain + '</b></div><div class="fact"><span>Session</span><b>≈ ' + timeLabel(est) + "</b></div></div>" +
       '<div class="links"><button class="btn sm" data-act="tab" data-tab="list">' + ICO.cart + 'Courses</button><button class="btn sm" data-act="batchgen-ask">' + ICO.dice + "Tout changer</button></div></section>";
  // 1. Matériel
  h += '<div class="group-h stag"' + stg(1) + '>1 · Avant de commencer</div><div class="group stag"' + stg(2) + ">" +
       ck("mat-boites", "<b>" + nMain + " boîtes hermétiques</b> (une par repas" + (S.people > 1 ? ", " + S.people + " portions chacune" : "") + "), idéalement en verre, qui vont au micro-ondes") +
       ck("mat-etiquettes", "Du ruban adhésif et un feutre pour noter le plat et la date sur chaque boîte") +
       ck("mat-ustensiles", "Sors tes plus grandes casseroles, cocottes et plaques : tu vas cuisiner plusieurs plats en même temps") +
       ck("mat-place", "Fais de la place au frigo et au congélateur, et vide le lave-vaisselle pour ranger au fur et à mesure") + "</div>" +
       '<div class="group-f">Compte environ ' + timeLabel(est) + " en tout. Lance d'abord ce qui cuit longtemps et prépare le reste pendant que ça mijote.</div>";
  // 2. Mise en place groupée
  const agg = new Map();
  for (const x of dishes) for (const [k, q] of x.r.i){
    if (!agg.has(k)) agg.set(k, {q:0, who:[]}); const a = agg.get(k); a.q += q*x.mult; if (!a.who.includes(x.r.n)) a.who.push(x.r.n);
  }
  const mp = miseEnPlace([...agg.entries()].map(([k, a]) => [k, a.q]));
  h += '<div class="group-h">2 · Toute la préparation d\'un coup</div><div class="group">' +
       mp.rows.map(row => { const a = agg.get(row.k); return ck("mp-" + row.k, "<b>" + qtyLabel(row.k, row.q) + "</b> · " + esc(I[row.k].n) + '<small class="who">' + row.verb + " — pour " + esc(a.who.join(", ")) + "</small>"); }).join("") + "</div>" +
       '<div class="group-f">Épluche et coupe tous les légumes avant d\'allumer le feu : tu gagnes un temps énorme. À portée de main : ' + esc(mp.staples.join(", ")) + ".</div>";
  // 3. Cuissons
  h += '<div class="group-h">3 · Les cuissons, dans cet ordre</div>';
  dishes.forEach((x, j) => {
    const D = typeof DETAILS !== "undefined" ? DETAILS[x.r.id] : null;
    const steps = annotateSteps(x.r, D ? D.steps : x.r.s, x.mult);
    const label = j === 0 ? "À lancer en premier" : (x.r.t >= 40 ? "Puis lance" : "Pendant que ça cuit");
    h += '<details class="bdish"' + (j === 0 ? " open" : "") + "><summary>" + photo(x.r, "mini") + '<div style="min-width:0"><div class="meal-k">' + label + '</div><div class="rrow-n">' + esc(x.r.n) + '</div><div class="meta">' + x.slots.length + " repas · " + x.mult + " portion" + (x.mult > 1 ? "s" : "") + " · " + timeLabel(x.r.t) + "</div></div></summary>" +
         '<div class="bdish-b"><div class="ings">' + x.r.i.filter(([k]) => k !== "eau").map(([k,q]) => '<div class="ing"><span>' + esc(I[k].n) + '</span><span class="q">' + qtyLabel(k, q*x.mult) + "</span></div>").join("") + "</div>" +
         '<div class="steps">' + steps.map((s, i) => ck("st-" + x.r.id + "-" + i, s)).join("") + "</div>" +
         (x.mult >= 4 ? '<p class="note" style="margin:0">Grande quantité : prévois des temps de cuisson un peu plus longs et une casserole plus grande. Goûte avant de saler davantage.</p>' : "") +
         '<button class="btn sm" data-act="open" data-id="' + esc(x.r.id) + '">Voir la fiche complète</button></div></details>';
  });
  // 4. Mise en boîtes
  h += '<div class="group-h">4 · Mise en boîtes</div><div class="group">';
  w.slots.forEach((s, i) => {
    if (s.m === "P") return; const r = RBYID[s.id]; if (!r) return;
    const info = batchInfo(r), day = s.d + 1, date = dayDate(w.start, s.d);
    const frigo = day <= Math.min(3, info.fridge || 0) || !info.freeze;
    const where = frigo ? "Frigo" : "Congélateur";
    const when = frigo ? "à manger tel quel, réchauffé" : "à sortir la veille au soir pour le mettre au frigo";
    h += ck("box-" + i, "<b>" + cap(fmtDay(date)) + " " + MEALS[s.m].toLowerCase() + "</b> · " + esc(r.n) + '<small class="who"><span class="tag-' + (frigo ? "f" : "c") + '">' + where + "</span> " + when + "</small>");
  });
  h += '</div><div class="group-f">Laisse refroidir les plats 1 heure maximum avant de fermer les boîtes et de les ranger. Au frigo, pas plus de 3 jours ; ce qui est mangé plus tard va au congélateur. Pour réchauffer : 2 à 3 minutes au micro-ondes en remuant à mi-temps, ou à la casserole avec un trait d\'eau.</div>';
  h += '<div class="links" style="margin-top:16px"><a class="btn sm" href="https://www.youtube.com/results?search_query=' + encodeURIComponent("batch cooking semaine organisation") + '" target="_blank" rel="noopener">' + ICO.out + 'Vidéos d\'organisation</a><button class="btn sm" data-act="bdone-reset">Tout décocher</button></div>';
  return h;
}
const EXTRA_ACTIONS = {
  batchgen: () => { if (generateBatchWeek()){ UI.enter = true; UI.lastTotal = null; go("batch"); toast("Semaine batch cooking prête"); } },
  "batchgen-ask": () => {
    openSheet("Autres plats", "<p style=\"margin:0\">Je choisis d'autres plats pour ta session de batch cooking, toujours dans ton budget de " + eur(S.budget) + ".</p>" +
      '<div class="links"><button class="btn primary" data-act="batchgen-go">' + ICO.dice + 'Changer les plats</button><button class="btn" data-act="close">Garder ceux-ci</button></div>', {kind:"confirm"});
  },
  "batchgen-go": () => { closeSheet(); EXTRA_ACTIONS.batchgen(); },
  bdone: el => { S.batchDone = S.batchDone || {}; const k = el.dataset.k; if (S.batchDone[k]) delete S.batchDone[k]; else { S.batchDone[k] = 1; buzz(6); } save(); el.classList.toggle("done", !!S.batchDone[k]); },
  "bdone-reset": () => { S.batchDone = {}; save(); const y = SC().scrollTop; render(); SC().scrollTop = y; },
  bdays: el => {
    segPick(el); const d = +el.dataset.k; if (d === (S.batchDays || 5)) return;
    S.batchDays = d; save(); buzz(6);
    if (S.week && S.week.batch){
      const keep = batchDishes().order;
      setTimeout(() => { if (generateBatchWeek(keep)){ UI.lastTotal = null; const y = SC().scrollTop; render(); SC().scrollTop = y; toast("Batch cooking sur " + d + " jours"); } }, 220);
    }
  },
  bswap: el => { UI.swapQ = ""; openBatchSwap(el.dataset.id); },
  bswapreroll: el => { UI.swapSeed++; openBatchSwap(el.dataset.id); },
  bswapdo: el => {
    const from = el.dataset.from, to = el.dataset.id, r = RBYID[to]; if (!r) return;
    const {order, counts} = batchDishes();
    const set = order.map(id => RBYID[id === from ? to : id]).filter(Boolean);
    const cnt = order.map(id => counts[id]);
    const keepP = {}; S.week.slots.forEach(s => { if (s.m === "P") keepP[s.d] = s.id; });
    fillBatchWeek(set, cnt, S.week.slots.map(s => ({d:s.d, m:s.m})), {keepP, start:S.week.start, keepProgress:true});
    if (S.batchDone) for (const k in S.batchDone) if (k.startsWith("st-" + from + "-") || k.startsWith("box-") || k.startsWith("mp-")) delete S.batchDone[k];
    save(); UI.pop = to; closeSheet(); const y = SC().scrollTop; render(); SC().scrollTop = y;
    toast("Remplacé par : " + r.n);
  }
};

/* ════════════ Minuteur de cuisine ════════════ */
const ICO3 = {play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z"/></svg>', batch:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/><rect x="8" y="4" width="8" height="7" rx="1.5"/><path d="M5 13v-1M19 13v-1"/></svg>', timer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5M12 2.5V6"/></svg>'};
function timerOf(s){
  let m = s.match(/(\d+)\s*h(?:eures?)?\s*(\d+)?/);
  if (m && /\d+\s*h(\s|eure|\d|$)/.test(m[0] + " ")) return (+m[1])*60 + (+(m[2]||0));
  m = s.match(/(\d+)\s*(?:à\s*\d+\s*)?minutes?/);
  return m && +m[1] >= 2 ? +m[1] : 0;
}
const TM = {end:0, label:"", int:0};
function beep(){
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const ctx = new C();
    [0, 0.35, 0.7].forEach(t => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.25);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3); });
  } catch(e) {}
}
function timerTick(){
  const el = document.getElementById("timerPill"); if (!el) return;
  const left = Math.max(0, Math.round((TM.end - Date.now())/1000));
  if (!TM.end){ el.hidden = true; return; }
  el.hidden = false;
  el.querySelector(".tp-t").textContent = Math.floor(left/60) + ":" + String(left%60).padStart(2,"0");
  el.querySelector(".tp-l").textContent = TM.label;
  if (left <= 0){ clearInterval(TM.int); TM.end = 0; el.hidden = true; beep(); buzz([200,100,200]); toast("Minuteur terminé : " + TM.label); }
}
function startTimer(min, label){
  clearInterval(TM.int); TM.end = Date.now() + min*60000; TM.label = label;
  TM.int = setInterval(timerTick, 500); timerTick(); buzz(10);
  toast("Minuteur lancé : " + timeLabel(min));
}

/* ════════════ Feuilles iOS ════════════ */
const SH = {root:null, panel:null, scrim:null, y:0, H:0, anim:null, open:false};
function setSheetY(y){
  SH.y = y; if (!SH.panel) return;
  SH.panel.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
  const p = Math.max(0, Math.min(1, 1 - y/SH.H));
  SH.scrim.style.opacity = (0.35*p).toFixed(3);
  const st = $("#stage");
  if (st){ st.style.transform = p > 0.001 ? "translate3d(0," + (p*10).toFixed(2) + "px,0) scale(" + (1 - 0.065*p).toFixed(4) + ")" : ""; st.style.borderRadius = (12*p).toFixed(1) + "px"; }
}
function sheetTo(y, opt, done){ if (SH.anim) SH.anim.stop(); SH.anim = spring(SH.y, y, opt || {}, setSheetY, () => { SH.anim = null; if (done) done(); }); }
function openSheet(title, body, st, hero, white){
  sheetState = st || {};
  const top = hero
    ? '<div class="hero-wrap">' + hero + '<button class="close-float" data-act="close" aria-label="Fermer">' + ICO.close + "</button></div>"
    : '<div class="panel-bar"><h2>' + esc(title) + '</h2><button class="done-btn" data-act="close">OK</button></div>';
  const inner = '<span class="grabber" aria-hidden="true"></span><div class="panel-scroll">' + top + '<div class="wrap panel-body">' + body + "</div></div>";
  const root = $("#sheet");
  if (SH.open && SH.panel){
    SH.panel.className = "panel" + (white || hero ? " white" : "");
    SH.panel.setAttribute("aria-label", title);
    SH.panel.innerHTML = inner;
    if (SH.y > 1) sheetTo(0, {response:0.38, damping:1});
  } else {
    root.innerHTML = '<div class="scrim" data-act="close"></div><div class="panel' + (white || hero ? " white" : "") + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' + inner + "</div>";
    root.hidden = false;
    SH.root = root; SH.panel = root.querySelector(".panel"); SH.scrim = root.querySelector(".scrim"); SH.open = true;
    SH.H = SH.panel.getBoundingClientRect().height || innerHeight;
    setSheetY(SH.H);
    bindSheetDrag();
    sheetTo(0, {response:0.42, damping:1});
  }
  const f = root.querySelector("[data-autofocus]"); if (f) setTimeout(() => f.focus(), 350);
  hydrate();
}
function closeSheet(velocity){
  sheetState = null;
  if (!SH.open) return;
  SH.open = false;
  const panel = SH.panel;
  sheetTo(SH.H, {response:0.36, damping:1, velocity:velocity || 0}, () => {
    if (SH.open) return;
    SH.root.hidden = true; SH.root.innerHTML = ""; SH.panel = null;
    const st = $("#stage"); if (st){ st.style.transform = ""; st.style.borderRadius = ""; }
  });
  if (panel) panel.style.pointerEvents = "none";
}
function refreshSheet(fn){ const p = $("#sheet .panel-scroll"); const top = p ? p.scrollTop : 0; fn(); const p2 = $("#sheet .panel-scroll"); if (p2) p2.scrollTop = top; }
function bindSheetDrag(){
  const panel = SH.panel;
  let startY = 0, dragging = false, samples = [], base = 0, scrollEl = null, tracking = false;
  const begin = y => { if (SH.anim){ SH.anim.stop(); SH.anim = null; } startY = y; base = SH.y; samples = [{y, t:performance.now()}]; };
  const move = y => {
    const dy = y - startY;
    let ny = base + dy;
    if (ny < 0) ny = -rubber(-ny, SH.H*0.2);
    setSheetY(ny);
    samples.push({y, t:performance.now()}); if (samples.length > 6) samples.shift();
  };
  const end = () => {
    const a = samples[0], b = samples[samples.length-1];
    const v = b && a && b.t > a.t ? (b.y - a.y) / ((b.t - a.t)/1000) : 0;
    const projected = SH.y + project(v, 0.99);
    if (projected > SH.H*0.38 && SH.y > 0){ closeSheet(v); if (typeof render === "function") render(); }
    else sheetTo(0, {response:0.38, damping:0.86, velocity:v});
  };
  panel.addEventListener("touchstart", e => {
    if (!SH.open) return;
    scrollEl = panel.querySelector(".panel-scroll");
    const t = e.touches[0]; tracking = true; dragging = false;
    startY = t.clientY; base = SH.y;
  }, {passive:true});
  panel.addEventListener("touchmove", e => {
    if (!tracking || !SH.open) return;
    const t = e.touches[0], dy = t.clientY - startY;
    if (!dragging){
      if (dy > 8 && (!scrollEl || scrollEl.scrollTop <= 0) && !e.target.closest(".chips.scroll,input,textarea,select")){ dragging = true; begin(t.clientY - 0); startY = t.clientY; }
      else if (Math.abs(dy) > 8) { tracking = false; return; }
      else return;
    }
    e.preventDefault(); move(t.clientY);
  }, {passive:false});
  panel.addEventListener("touchend", () => { if (dragging) end(); dragging = false; tracking = false; }, {passive:true});
  panel.addEventListener("touchcancel", () => { if (dragging) end(); dragging = false; tracking = false; }, {passive:true});
  // Souris : glisser la poignée ou la barre du haut
  panel.addEventListener("pointerdown", e => {
    if (e.pointerType !== "mouse" || !e.target.closest(".grabber,.panel-bar,.hero-wrap") || e.target.closest("button")) return;
    panel.setPointerCapture(e.pointerId); dragging = true; begin(e.clientY);
  });
  panel.addEventListener("pointermove", e => { if (dragging && e.pointerType === "mouse") move(e.clientY); });
  panel.addEventListener("pointerup", e => { if (dragging && e.pointerType === "mouse"){ dragging = false; end(); } });
}

/* ── Détail d'une recette ── */
function openRecipe(id, opts){
  const r = RBYID[id]; if (!r) return;
  opts = opts || {};
  const people = opts.people || S.people;
  const st = {kind:"recipe", rid:id, people, slot:opts.slot, from:opts.from, done:(sheetState && sheetState.rid === id && sheetState.done) || []};
  const fav = S.favs.includes(id), hid = S.dislikes.includes(id);
  const alg = Object.keys(ALLERGENS).filter(a => r.F[a]).map(a => ALLERGENS[a].toLowerCase());
  let h = '<div><div class="r-kicker">' + CUISINES[r.c].n + " · " + r.m.split("").map(m => MEALS[m]).join(", ") + '</div><h1 class="r-title">' + esc(r.n) + "</h1></div>";
  h += '<p class="credit" id="credit" data-cid="' + esc(id) + '"></p>';
  h += '<div class="facts"><div class="fact"><span>Temps</span><b>' + timeLabel(r.t) + '</b></div><div class="fact"><span>Niveau</span><b>' + DIFF[r.d] + '</b></div><div class="fact"><span>Par pers.</span><b>' + eur(r.cost) + "</b></div></div>";
  h += '<div class="links"><button class="btn sm" data-act="fav" data-id="' + esc(id) + '" aria-pressed="' + fav + '"' + (fav ? ' style="color:var(--red)"' : "") + ">" + (fav ? ICO.heartOn : ICO.heart) + "Favori</button>" +
       (opts.slot != null ? '<button class="btn sm" data-act="swap" data-slot="' + opts.slot + '">' + ICO.swap + "Changer ce plat</button>" : "") + "</div>";
  h += '<div class="section-h"><h3>Ingrédients</h3><div class="stepper"><button data-act="rpeople" data-d="-1" aria-label="Une personne de moins">−</button><output>' + people + '</output><button data-act="rpeople" data-d="1" aria-label="Une personne de plus">+</button></div></div>';
  h += '<div class="ings">' + r.i.map(([k,q]) => '<div class="ing"><span>' + esc(I[k].n) + (I[k].fl.includes("S") && k !== "eau" ? " <small>placard</small>" : "") + '</span><span class="q">' + qtyLabel(k, q*people) + "</span></div>").join("") + "</div>";
  if (alg.length) h += '<p class="note" style="margin:-6px 0 0">Contient : ' + alg.join(", ") + ".</p>";
  const D = (typeof DETAILS !== "undefined" && DETAILS[id]) || null;
  const steps = D ? D.steps : r.s;
  if (D && D.mat) h += '<div class="tipbox"><b>Ce qu\'il te faut</b><span>' + esc(D.mat) + "</span></div>";
  const mep = miseEnPlace(r.i.map(([k,q]) => [k, q*people]));
  h += '<div class="section-h"><h3>Avant d\'allumer le feu</h3></div><div class="group">' + mep.rows.map(row => '<button class="bcheck" data-act="mepdone"><span class="check">' + ICO.check + "</span><span><b>" + qtyLabel(row.k, row.q) + "</b> · " + esc(I[row.k].n) + '<small class="who">' + row.verb + "</small></span></button>").join("") + "</div>" +
       (mep.staples.length ? '<p class="note" style="margin:-6px 0 0">À portée de main : ' + esc(mep.staples.join(", ")) + ".</p>" : "");
  const ann = annotateSteps(r, steps, people);
  h += '<div class="section-h"><h3>Préparation</h3><span class="note">' + steps.length + " étapes · pour " + people + " pers.</span></div>";
  h += '<div class="steps">' + steps.map((s,i) => {
    const m = timerOf(s);
    return '<div class="step-wrap"><button class="step ' + (st.done.includes(i) ? "done" : "") + '" data-act="stepdone" data-i="' + i + '"><span>' + ann[i] + "</span></button>" +
      (m ? '<button class="timer-chip" data-act="timer" data-min="' + m + '" data-label="' + esc(r.n) + " · étape " + (i+1) + '">' + ICO3.timer + "Minuteur " + timeLabel(m) + "</button>" : "") + "</div>";
  }).join("") + "</div>";
  h += '<p class="note" style="margin:0">Sel et poivre selon ton goût. Touche une étape quand elle est faite.</p>';
  if (D && D.tips && D.tips.length) h += '<div class="tipbox green"><b>Astuces</b>' + D.tips.map(t => "<span>" + esc(t) + "</span>").join("") + "</div>";
  if (D && D.keep) h += '<div class="tipbox"><b>Conservation</b><span>' + esc(D.keep) + "</span></div>";
  if (st.from === "tonight"){
    const items = buildList([r], people, false).filter(it => !it.staple);
    h += '<div class="section-h"><h3>Courses pour ' + people + "</h3>" + pr(items.reduce((s,it) => s + it.cost, 0)) + "</div>";
    h += '<div class="ings">' + items.map(it => '<div class="ing"><span>' + esc(it.g.n) + " <small>· " + packLabel(it) + '</small></span><span class="q">' + qtyLabel(it.k, it.need) + "</span></div>").join("") + "</div>";
    h += '<button class="btn block" data-act="copyone" data-id="' + esc(id) + '">' + ICO.copy + "Copier cette liste</button>";
  }
  h += '<div class="links"><a class="btn sm" href="' + videoURL(r.n) + '" target="_blank" rel="noopener">' + ICO3.play + "Vidéos</a>" + '<a class="btn sm" href="https://www.marmiton.org/recettes/recherche.aspx?aqt='  + encodeURIComponent(r.n) + '" target="_blank" rel="noopener">' + ICO.out + "Marmiton</a>" +
       '<button class="btn sm ' + (hid ? "" : "danger") + '" data-act="dislike" data-id="' + esc(id) + '">' + ICO.ban + (hid ? "Reproposer" : "Ne plus proposer") + "</button>" +
       (r.custom ? '<button class="btn sm" data-act="editrecipe" data-id="' + esc(id) + '">Modifier</button>' : "") + "</div>";
  openSheet(r.n, h, st, photo(r, "hero"));
  if (PH[id] && PH[id].src && !r.photo) loadCredit(id);
}

/* ── Changer un plat ── */
function swapScored(slot, anyCuisine){
  const w = S.week, s = w.slots[slot], ids = weekIdx(), base = totalFor(ids, S.people, true);
  const inWeek = new Set(w.slots.map(x => x.id));
  return RX.filter(r => r.m.includes(s.m) && allowed(r, {anyCuisine}) && !inWeek.has(r.id)).map(r => {
    const ids2 = ids.slice(); ids2[slot] = r.idx; const t = totalFor(ids2, S.people, true); return {r, t, d:t - base};
  });
}
function openSwap(slot){
  const w = S.week, s = w.slots[slot], cur = RBYID[s.id];
  const scored = swapScored(slot, false);
  const fits = scored.filter(x => x.t <= S.budget + 0.01);
  const src = fits.length >= 6 ? fits : scored.slice().sort((a,b) => a.t - b.t).slice(0, 24);
  const sugg = shuffleWithSeed(src, UI.swapSeed + slot*31).slice(0, 6);
  let h = '<p class="note" style="margin:0">' + MEALS[s.m] + " du " + fmtDay(dayDate(w.start, s.d)) + ". Actuellement : <b>" + esc(cur ? cur.n : "") + "</b></p>";
  h += '<div class="search"><label class="sr" for="sq">Chercher une recette</label>' + ICO.search + '<input class="input" id="sq" type="search" placeholder="Rechercher un plat" value="' + esc(UI.swapQ) + '" data-in="sq" autocomplete="off"></div>';
  h += '<div id="swaplist">' + swapListHTML(slot, sugg, scored, normW(UI.swapQ.trim())) + "</div>";
  openSheet("Changer ce plat", h, {kind:"swap", slot});
}
function swapListHTML(slot, sugg, scored, q){
  const diff = d => '<span class="delta" style="color:var(' + (d > 0.01 ? "--orange-text" : "--green-text") + ')">' + (d > 0.01 ? "+" : d < -0.01 ? "−" : "±") + eur(Math.abs(d)) + "</span>";
  let list = sugg, h = "";
  if (q){
    list = scored.filter(x => normW(x.r.n).includes(q)).slice(0, 30);
    h += '<div class="group-h" style="padding-top:4px">' + list.length + " résultat" + (list.length > 1 ? "s" : "") + "</div>";
  } else h += '<div class="group-h" style="padding-top:4px">Dans ton budget<button class="btn plain sm" data-act="swapreroll" data-slot="' + slot + '" style="height:auto">' + ICO.dice + "Autres</button></div>";
  h += '<div class="group">' + list.map(x => '<button class="rrow" data-act="doswap" data-slot="' + slot + '" data-id="' + esc(x.r.id) + '">' + photo(x.r, "mini") +
       '<div style="min-width:0"><div class="rrow-n">' + esc(x.r.n) + '</div><div class="meta">' + timeLabel(x.r.t) + " · " + DIFF[x.r.d] + "</div></div>" +
       '<div style="display:grid;justify-items:end;gap:2px">' + pr(x.r.cost, "/pers.") + diff(x.d) + "</div></button>").join("") + "</div>";
  if (!q) h += '<div class="group-f">Le montant en vert ou orange indique ce que ça change sur le total de tes courses.</div>';
  return h;
}

/* ── Réglages ── */
function openSettings(){
  const p = S;
  let h = '<div><div class="group-h" style="padding-top:0">Magasin de référence</div><div class="group" style="padding:12px"><div class="chips">' + STORES.map(s => '<button class="chip" data-act="setstore" data-k="' + s.id + '" aria-pressed="' + (p.store === s.id) + '">' + s.n + "</button>").join("") + "</div></div>" +
          '<div class="group-f">Prix estimés par enseigne. Corrige-les depuis ta liste de courses.</div></div>';
  h += '<div><div class="group-h">Ma semaine</div><div class="group">' +
       '<div class="cell"><label for="sb" class="grow">Budget par semaine</label><input class="input" id="sb" type="number" min="5" step="1" inputmode="decimal" value="' + p.budget + '" data-in="sb" style="width:90px"><span>€</span></div>' +
       '<div class="cell"><span class="grow">Personnes</span><div class="stepper"><button data-act="speople" data-d="-1" aria-label="Moins">−</button><output>' + p.people + '</output><button data-act="speople" data-d="1" aria-label="Plus">+</button></div></div>' +
       ["P","M","S"].map(m => '<div class="cell"><span class="grow">' + ({P:"Petit-déjeuner",M:"Déjeuner",S:"Dîner"})[m] + "</span>" + sw("smeal", m, p.meals[m], MEALS[m]) + "</div>").join("") +
       '<div class="cell"><span class="grow">Jours</span><div style="width:190px">' + seg("sdays", [[3,"3"],[5,"5"],[7,"7"]], p.days) + "</div></div>" +
       '</div><div style="margin-top:12px"><button class="btn primary block" data-act="applyweek">' + ICO.dice + "Recréer ma semaine</button></div></div>";
  h += '<div><div class="group-h">Ce que je mange</div><div class="group" style="padding:12px;display:grid;gap:12px"><div class="chips">' + Object.entries(DIETS).map(([k,n]) => '<button class="chip" data-act="sdiet" data-k="' + k + '" aria-pressed="' + (p.diet === k) + '">' + n + "</button>").join("") + "</div></div>" +
       '<div class="group-h">Allergies</div><div class="group" style="padding:12px"><div class="chips">' + Object.entries(ALLERGENS).map(([k,n]) => '<button class="chip" data-act="sallergy" data-k="' + k + '" aria-pressed="' + p.allergies.includes(k) + '">Sans ' + n.toLowerCase() + "</button>").join("") + "</div></div>" +
       '<div class="group-f">Repérées d\'après les ingrédients. Vérifie toujours les étiquettes.</div>' +
       '<div class="group-h">Cuisines à me proposer</div><div class="group" style="padding:12px"><div class="chips">' + Object.entries(CUISINES).map(([k,c]) => '<button class="chip" data-act="scuisine" data-k="' + k + '" aria-pressed="' + p.cuisines.includes(k) + '">' + c.n + "</button>").join("") + "</div></div></div>";
  const stockKeys = Object.keys(p.stock).filter(k => I[k] && p.stock[k] > 0).sort((a,b) => I[a].n.localeCompare(I[b].n,"fr"));
  h += '<div><div class="group-h">Mon placard</div><div class="group">' +
       (stockKeys.length ? stockKeys.map(k => '<div class="cell"><span class="grow">' + esc(I[k].n) + '</span><input class="input" id="st-' + k + '" type="number" min="0" step="any" value="' + Math.round(p.stock[k]*100)/100 + '" data-in="stock" data-k="' + k + '" aria-label="Quantité de ' + esc(I[k].n) + '" style="width:70px"><span class="note">' + (I[k].u === "pc" ? "pc" : I[k].u) + '</span><button class="icon-btn gray" data-act="stockdel" data-k="' + k + '" aria-label="Retirer">' + ICO.close + "</button></div>").join("")
         : '<div class="cell"><span class="note">Vide pour l\'instant.</span></div>') + '</div><div class="group-f">Le reste des paquets après « Courses faites », déduit de la liste suivante.</div></div>';
  const priced = Object.keys(p.prices).filter(k => I[k]);
  h += '<div><div class="group-h">Mes prix</div><div class="group">' + (priced.length ? priced.map(k => '<div class="cell"><span class="grow">' + esc(I[k].n) + '<div class="cell-sub">' + priceBasis(I[k]) + "</div></span>" + pr(p.prices[k]) + '<button class="icon-btn gray" data-act="pricedel" data-k="' + k + '" aria-label="Revenir au prix estimé">' + ICO.close + "</button></div>").join("")
       : '<div class="cell"><span class="note">Aucun prix corrigé pour l\'instant.</span></div>') + "</div></div>";
  h += '<div><div class="group-h">Sauvegarde</div><div class="group">' +
       '<button class="cell" data-act="export"><span class="grow" style="color:var(--green-text)">Copier ma sauvegarde</span></button>' +
       '<button class="cell" data-act="importask"><span class="grow" style="color:var(--green-text)">Importer une sauvegarde</span></button>' +
       '<button class="cell" data-act="resetask"><span class="grow" style="color:var(--red-text)">Tout réinitialiser</span></button></div><div id="iobox"></div><div id="resetbox"></div>' +
       '<div class="group-f">Tes données restent sur cet appareil.</div></div>';
  openSheet("Réglages", h, {kind:"settings"});
}

/* ── Modifier un prix ── */
function openPrice(k){
  const g = I[k];
  const h = '<p style="margin:0">Prix de <b>' + esc(g.n) + "</b> chez " + esc(store().n) + ", pour " + priceBasis(g) + ".</p>" +
    '<div class="big-budget" style="justify-content:center"><div class="val"><label class="sr" for="pv">Prix</label><input id="pv" type="number" min="0" step="0.01" inputmode="decimal" value="' + packPrice(k).toFixed(2) + '" style="width:4.2ch" data-autofocus><span>€</span></div></div>' +
    '<p class="note" style="margin:0;text-align:center">Estimation de départ : ' + eur(g.price*store().k) + "</p>" +
    '<button class="btn primary block" data-act="saveprice" data-k="' + k + '">Enregistrer</button>' + (S.prices[k] != null ? '<button class="btn block" data-act="pricedel" data-k="' + k + '">Revenir à l\'estimation</button>' : "");
  openSheet("Corriger un prix", h, {kind:"price", k});
}

/* ── Ajouter / modifier une recette ── */
function openRecipeForm(id){
  const ex = id ? S.custom.find(a => a[0] === id) : null;
  const d = ex ? {n:ex[1], e:ex[2], c:ex[3], m:ex[4], d:ex[5], t:ex[6], i:ex[8].map(x => x.slice()), s:ex[9].join("\n"), ph:ex[10] || ""} : {n:"", e:"🍽️", c:"fr", m:"MS", d:1, t:30, i:[["",0]], s:"", ph:""};
  sheetState = {kind:"form", id, d};
  renderForm();
}
function renderForm(){
  const d = sheetState.d;
  const opts = IKEYS.slice().sort((a,b) => I[a].n.localeCompare(I[b].n,"fr")).map(k => '<option value="' + esc(I[k].n) + '"></option>').join("");
  let h = '<div class="field"><label for="fn" class="cap">Nom du plat</label><input class="input" id="fn" data-in="fn" value="' + esc(d.n) + '" placeholder="Ex. : Gratin de ma grand-mère"></div>';
  h += '<div class="field"><label for="fp" class="cap">Photo (facultatif)</label><input class="input" id="fp" data-in="fp" type="url" value="' + esc(d.ph) + '" placeholder="Lien d\'une image"><span class="note">Sans lien, l\'appli cherche une photo du plat toute seule.</span></div>';
  h += '<div class="field"><label for="fc2" class="cap">Cuisine</label><select class="input" id="fc2" data-in="fc2">' + Object.entries(CUISINES).map(([k,c]) => '<option value="' + k + '"' + (d.c === k ? " selected" : "") + ">" + c.n + "</option>").join("") + "</select></div>";
  h += '<div><div class="cap" style="margin-bottom:6px">Pour quel repas ?</div><div class="group">' + ["P","M","S"].map(m => '<div class="cell"><span class="grow">' + MEALS[m] + "</span>" + sw("fmeal", m, d.m.includes(m), MEALS[m]) + "</div>").join("") + "</div></div>";
  h += '<div><div class="cap" style="margin-bottom:6px">Difficulté</div>' + seg("fdiff", [[1,"Facile"],[2,"Moyen"],[3,"Difficile"]], d.d) + "</div>";
  h += '<div class="field"><label for="ft" class="cap">Temps total (minutes)</label><input class="input" id="ft" type="number" min="1" data-in="ft" value="' + d.t + '" style="width:120px"></div>';
  h += '<div class="field"><div class="cap">Ingrédients pour 1 personne</div><datalist id="inglist">' + opts + "</datalist>";
  d.i.forEach((x, j) => {
    const g = I[x[0]];
    h += '<div class="form-ing"><input class="input" list="inglist" id="fi-' + j + '" data-in="fi" data-j="' + j + '" value="' + esc(g ? g.n : (x[2] || "")) + '" placeholder="Ingrédient" aria-label="Ingrédient ' + (j+1) + '">' +
         '<input class="input" type="number" min="0" step="any" id="fq-' + j + '" data-in="fq" data-j="' + j + '" value="' + (x[1] || "") + '" placeholder="' + (g ? g.u : "qté") + '" aria-label="Quantité">' +
         '<button class="icon-btn gray" data-act="fidel" data-j="' + j + '" aria-label="Retirer">' + ICO.close + "</button></div>";
    if (g) h += '<div class="note" style="margin-top:-4px">Unité : ' + (g.u === "pc" ? (g.lab || "pièce") : g.u) + "</div>";
  });
  h += '<button class="btn plain sm" data-act="fiadd" style="justify-self:start">' + ICO.plus + "Ajouter un ingrédient</button>";
  h += '<details><summary class="note" style="cursor:pointer">Un ingrédient manque dans la liste ?</summary><div class="field" style="margin-top:10px">' +
       '<input class="input" id="ni-n" placeholder="Nom (ex. : Haricots noirs)"><div class="row" style="gap:8px"><select class="input" id="ni-u" style="flex:1"><option value="g">vendu en g</option><option value="ml">vendu en ml</option><option value="pc">vendu à la pièce</option></select>' +
       '<input class="input" id="ni-s" type="number" placeholder="Taille du paquet" style="flex:1"></div><div class="row" style="gap:8px"><input class="input" id="ni-p" type="number" step="0.01" placeholder="Prix du paquet (€)" style="flex:1">' +
       '<select class="input" id="ni-r" style="flex:1">' + AISLE_ORDER.map(a => '<option value="' + a + '">' + RAYONS[a].n + "</option>").join("") + '</select></div><button class="btn sm" data-act="niadd">Créer cet ingrédient</button></div></details></div>';
  h += '<div class="field"><label for="fs" class="cap">Étapes (une par ligne)</label><textarea class="input" id="fs" data-in="fs" placeholder="Fais revenir l\'oignon…">' + esc(d.s) + "</textarea></div>";
  h += '<button class="btn primary block" data-act="fsave">Enregistrer la recette</button>' + (sheetState.id ? '<button class="btn block danger" data-act="fdelete">Supprimer</button>' : "") + '<div id="ferr"></div>';
  const st = sheetState;
  refreshSheet(() => openSheet(st.id ? "Modifier ma recette" : "Nouvelle recette", h, st));
}

/* ════════════ Accueil en 3 étapes ════════════ */
let OB = {step:1, dir:""};
function showOnboarding(){ OB = {step:1, dir:""}; renderOB(); }
function renderOB(){
  const el = $("#onboard"); el.hidden = false;
  const dotsH = '<div class="ob-dots" aria-label="Étape ' + OB.step + ' sur 3">' + [1,2,3].map(i => '<i class="' + (i === OB.step ? "on" : "") + '"></i>').join("") + "</div>";
  let h = '<div class="ob-in"><div class="ob-top">' + (OB.step > 1 ? '<button class="btn plain sm" data-act="obback" style="padding:0">‹ Retour</button>' : "<span></span>") + dotsH + '<span style="width:70px"></span></div><div class="ob-step ' + (OB.dir ? "from-" + OB.dir : "") + '">';
  if (OB.step === 1){
    const prev = ["carbonara","tikka-masala","pad-thai","tacos-boeuf"].map(id => RBYID[id]).filter(Boolean);
    h += '<div class="ob-preview" aria-hidden="true">' + prev.map(r => photo(r, "obph")).join("") + "</div>";
    h += '<div><h1>Bien manger toute la semaine, dans ton budget.</h1><p class="ob-lead">Pour commencer, où fais-tu tes courses ?</p></div>';
    h += '<div class="stores">' + STORES.map(s => '<button class="store" data-act="obstore" data-k="' + s.id + '" aria-pressed="' + (S.onboarded && S.store === s.id) + '">' + s.n + "</button>").join("") + "</div>";
  } else if (OB.step === 2){
    h += '<div><h1>Ta semaine</h1><p class="ob-lead">Ton budget courses et les repas à prévoir.</p></div>';
    h += '<div class="big-budget"><button class="rb" data-act="obbudget" data-d="-5" aria-label="Moins 5 euros">−</button><div class="val"><label class="sr" for="obb">Budget par semaine en euros</label><input id="obb" type="number" min="5" inputmode="numeric" value="' + S.budget + '" data-in="obb"><span>€</span></div><button class="rb" data-act="obbudget" data-d="5" aria-label="Plus 5 euros">+</button></div>';
    h += '<div class="group"><div class="cell"><span class="grow">Personnes</span><div class="stepper"><button data-act="obpeople" data-d="-1" aria-label="Moins">−</button><output id="obPeople">' + S.people + '</output><button data-act="obpeople" data-d="1" aria-label="Plus">+</button></div></div>' +
         [["P","Petit-déjeuner"],["M","Déjeuner"],["S","Dîner"]].map(([m,n]) => '<div class="cell"><span class="grow">' + n + "</span>" + sw("obmeal", m, S.meals[m], n) + "</div>").join("") +
         '<div class="cell"><span class="grow">Jours</span><div style="width:170px">' + seg("obdays", [[3,"3"],[5,"5"],[7,"7"]], S.days) + "</div></div></div>";
    h += '<div id="feas">' + feasHTML() + "</div>";
  } else {
    h += '<div><h1>Des choses à éviter ?</h1><p class="ob-lead">Facultatif. Tout se change plus tard dans les réglages.</p></div>';
    h += '<div class="chips">' + Object.entries(DIETS).map(([k,n]) => '<button class="chip" data-act="obdiet" data-k="' + k + '" aria-pressed="' + (S.diet === k) + '" style="background:' + (S.diet === k ? "" : "var(--bg)") + '">' + n + "</button>").join("") + "</div>";
    h += '<div><div class="cap" style="margin-bottom:8px">Allergies</div><div class="chips">' + Object.entries(ALLERGENS).map(([k,n]) => '<button class="chip" data-act="oballergy" data-k="' + k + '" aria-pressed="' + S.allergies.includes(k) + '" style="background:' + (S.allergies.includes(k) ? "" : "var(--bg)") + '">Sans ' + n.toLowerCase() + "</button>").join("") + "</div></div>";
    h += '<div><div class="cap" style="margin-bottom:8px">Cuisines que tu aimes</div><div class="chips">' + Object.entries(CUISINES).map(([k,c]) => '<button class="chip" data-act="obcuisine" data-k="' + k + '" aria-pressed="' + S.cuisines.includes(k) + '" style="background:' + (S.cuisines.includes(k) ? "" : "var(--bg)") + '">' + c.n + "</button>").join("") + "</div></div>";
  }
  h += '</div><div class="ob-foot">' +
       (OB.step === 2 ? '<button class="btn primary" id="obNext" data-act="obnext"' + (!S.meals.P && !S.meals.M && !S.meals.S ? " disabled" : "") + ">Continuer</button>" : "") +
       (OB.step === 3 ? '<button class="btn primary" data-act="obfinish">Créer ma semaine</button>' : "") + "</div></div>";
  el.innerHTML = h;
  OB.dir = "";
  hydrate();
}
let feasTimer = null, feasCache = {};
function feasKey(){ return [S.store,S.people,S.days,S.meals.P,S.meals.M,S.meals.S,S.diet,S.allergies.join(""),S.cuisines.join("")].join("|"); }
function feasHTML(){
  const nMeals = S.days * ((S.meals.P?1:0) + (S.meals.M?1:0) + (S.meals.S?1:0));
  if (!nMeals) return '<div class="feas low"><i></i><span>Choisis au moins un repas.</span></div>';
  const per = S.budget / (nMeals * S.people), k = feasKey(), min = feasCache[k];
  let cls = "", txt;
  if (!(k in feasCache)){
    clearTimeout(feasTimer);
    feasTimer = setTimeout(() => { feasCache[k] = minCostEstimate(S.people, S.meals, S.days); refreshFeas(); }, 150);
    txt = "Soit " + eur(per) + " par repas et par personne…";
  } else if (min === null){ cls = "low"; txt = "Aucune recette ne correspond à ces réglages."; }
  else if (S.budget >= min*1.25) txt = "<b>Confortable.</b> " + eur(per) + " par repas et par personne : de quoi varier et te faire plaisir.";
  else if (S.budget >= min*1.02){ cls = "tight"; txt = "<b>Serré mais faisable.</b> " + eur(per) + " par repas : l'appli privilégiera les plats économiques."; }
  else { cls = "low"; txt = "<b>Trop juste.</b> Compte au moins " + Math.ceil(min) + " € pour ces repas chez " + esc(store().n) + "."; }
  return '<div class="feas ' + cls + '"><i></i><span>' + txt + "</span></div>";
}
function refreshFeas(){ const f = $("#feas"); if (f) f.innerHTML = feasHTML(); const n = $("#obNext"); if (n) n.disabled = !S.meals.P && !S.meals.M && !S.meals.S; }

/* ── Actions propres à cette interface (sans tout redessiner, pour garder les animations) ── */
const UI_ACTIONS = {
  timer: el => { try { const C = window.AudioContext || window.webkitAudioContext; if (C) new C().resume(); } catch(e) {} startTimer(+el.dataset.min, el.dataset.label); },
  timerstop: () => { clearInterval(TM.int); TM.end = 0; timerTick(); },
  check: el => {
    const k = el.dataset.k, row = el.closest(".item");
    if (S.checked[k]) delete S.checked[k]; else { S.checked[k] = 1; buzz(8); }
    save();
    if (row){ row.classList.toggle("done", !!S.checked[k]); el.setAttribute("aria-pressed", !!S.checked[k]); }
    cartSummary();
  },
  tab: el => { buzz(5); go(el.dataset.tab); },
  close: () => { closeSheet(); render(); },
  doswap: el => {
    const slot = +el.dataset.slot; S.week.slots[slot].id = el.dataset.id; S.week.minCost = null; save();
    closeSheet(); UI.pop = slot; render(); buzz(10);
    toast("Remplacé par " + RBYID[el.dataset.id].n);
  },
  stepdone: el => { const i = +el.dataset.i, st = sheetState; const j = st.done.indexOf(i); if (j >= 0) st.done.splice(j,1); else { st.done.push(i); buzz(6); } el.classList.toggle("done"); },
  mood: el => { const k = el.dataset.k, m = S.tonight.moods; const i = m.indexOf(k); if (i >= 0) m.splice(i,1); else m.push(k); UI.tonightSeed++; save(); UI.enter = true; const y = SC().scrollTop; render(); SC().scrollTop = y; },
  reroll: () => { UI.tonightSeed++; UI.enter = true; const y = SC().scrollTop; render(); SC().scrollTop = y; buzz(8); },
  fc: el => { UI.fc = el.dataset.k; UI.enter = true; const y = SC().scrollTop; render(); SC().scrollTop = y; },
  ff: el => { const k = el.dataset.k, i = UI.ff.indexOf(k); if (i >= 0) UI.ff.splice(i,1); else UI.ff.push(k); UI.enter = true; const y = SC().scrollTop; render(); SC().scrollTop = y; },
  smeal: el => { const k = el.dataset.k; S.meals[k] = !S.meals[k]; el.setAttribute("aria-checked", S.meals[k]); save(); buzz(6); },
  sdays: el => { S.days = +el.dataset.k; segPick(el); save(); },
  obmeal: el => { const k = el.dataset.k; S.meals[k] = !S.meals[k]; el.setAttribute("aria-checked", S.meals[k]); save(); refreshFeas(); buzz(6); },
  obdays: el => { S.days = +el.dataset.k; segPick(el); save(); refreshFeas(); },
  obpeople: el => { S.people = Math.max(1, Math.min(12, S.people + +el.dataset.d)); save(); const o = $("#obPeople"); if (o) o.textContent = S.people; refreshFeas(); },
  obbudget: el => { S.budget = Math.max(5, (+S.budget||0) + +el.dataset.d); save(); const i = $("#obb"); if (i) i.value = S.budget; refreshFeas(); },
  obstore: el => { S.store = el.dataset.k; save(); document.querySelectorAll(".store").forEach(b => b.setAttribute("aria-pressed", b === el)); buzz(8); setTimeout(() => { OB.step = 2; OB.dir = "right"; renderOB(); }, 180); },
  obnext: () => { OB.step++; OB.dir = "right"; renderOB(); },
  obback: () => { OB.step--; OB.dir = "left"; renderOB(); },
  fmeal: el => { const d = sheetState.d, k = el.dataset.k; d.m = d.m.includes(k) ? d.m.replace(k,"") : d.m + k; el.setAttribute("aria-checked", d.m.includes(k)); },
  fdiff: el => { sheetState.d.d = +el.dataset.k; segPick(el); },
  obfinish: () => {
    const el = $("#onboard");
    el.innerHTML = '<div class="ob-in"><div class="cook"><div class="spin"></div><h1 style="font-size:24px">Je compose ta semaine…</h1><p class="ob-lead">Des plats variés qui tiennent dans ' + eur(S.budget) + ".</p></div></div>";
    setTimeout(() => {
      if (generateWeek()){
        S.onboarded = true; save(); TAB = "week"; UI.enter = true; render(); SC().scrollTop = 0;
        el.style.transition = "opacity .45s ease, transform .5s cubic-bezier(.2,.8,.2,1)"; el.style.opacity = "0"; el.style.transform = "scale(1.04)";
        setTimeout(() => { el.hidden = true; el.innerHTML = ""; el.style.cssText = ""; }, 480);
        buzz(12);
      } else { OB.step = 3; renderOB(); }
    }, 700);
  }
};

/* ════════════ Messages ════════════ */
let toastTimer = null;
function toast(msg){
  const t = $("#toast"); t.hidden = true; void t.offsetWidth; t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}
function copyText(txt, okMsg){
  const done = () => toast(okMsg);
  const fallback = () => {
    const ta = document.createElement("textarea"); ta.value = txt; ta.setAttribute("readonly",""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch(e) {}
    document.body.removeChild(ta);
    if (ok) done(); else showCopyBox(txt);
  };
  try { navigator.clipboard.writeText(txt).then(done, fallback); } catch(e) { fallback(); }
}
function showCopyBox(txt){
  openSheet("Copier", '<p class="note" style="margin:0">La copie automatique est bloquée ici. Sélectionne le texte ci-dessous et copie-le.</p><textarea class="input" readonly style="min-height:260px" data-autofocus>' + esc(txt) + "</textarea>", {kind:"copy"});
}
function listText(items, title){
  let t = title + "\n";
  for (const a of AISLE_ORDER){
    const l = items.filter(it => it.g.r === a && it.counted && it.buy > 1e-9 && !S.checked[it.k]);
    if (!l.length) continue;
    t += "\n" + RAYONS[a].n.toUpperCase() + "\n" + l.map(it => "☐ " + it.g.n + " : " + qtyLabel(it.k, it.buy) + (packLabel(it) && !it.g.fl.includes("W") ? " (" + packLabel(it) + ")" : "")).join("\n") + "\n";
  }
  const total = items.reduce((s,it) => s + (it.counted ? it.cost : 0), 0);
  return t + "\nTotal estimé : " + eur(total);
}

/* ════════════ Actions ════════════ */
const A = {
  tab: el => go(el.dataset.tab),
  settings: () => openSettings(),
  close: () => { closeSheet(); render(); },
  open: el => openRecipe(el.dataset.id, {slot: el.dataset.slot != null ? +el.dataset.slot : undefined, people: el.dataset.people ? +el.dataset.people : undefined, from: el.dataset.people ? "tonight" : undefined}),
  newweek: () => { if (generateWeek()) { UI.enter = true; UI.lastTotal = null; go("week"); toast("Nouvelle semaine prête"); } },
  "newweek-ask": () => {
    openSheet("Nouvelle semaine", '<p style="margin:0">Je te prépare une semaine différente de celle-ci, toujours dans ton budget de ' + eur(S.budget) + ".</p>" +
      (S.week && !S.week.done ? '<p class="note" style="margin:0">Les cases cochées de ta liste de courses seront remises à zéro.</p>' : "") +
      '<div class="links"><button class="btn primary" data-act="newweek-go">' + ICO.dice + 'Créer la nouvelle semaine</button><button class="btn" data-act="close">Garder celle-ci</button></div>', {kind:"confirm"});
  },
  "newweek-go": () => { closeSheet(); A.newweek(); },
  setbudget: el => { S.budget = +el.dataset.v; save(); A.newweek(); },
  swap: el => { UI.swapQ = ""; openSwap(+el.dataset.slot); },
  swapreroll: el => { UI.swapSeed++; openSwap(+el.dataset.slot); },
  doswap: el => {
    const slot = +el.dataset.slot; S.week.slots[slot].id = el.dataset.id; S.week.minCost = null; save(); closeSheet(); render();
    const r = RBYID[el.dataset.id]; toast("Remplacé par : " + r.n);
  },
  check: el => { const k = el.dataset.k; if (S.checked[k]) delete S.checked[k]; else S.checked[k] = 1; save(); const y = SC().scrollTop; render(); SC().scrollTop = y; },
  tobuy: el => { const k = el.dataset.k; if (S.toBuy[k]) delete S.toBuy[k]; else S.toBuy[k] = 1; save(); refreshPrices(); const y = SC().scrollTop; render(); SC().scrollTop = y; },
  editprice: el => openPrice(el.dataset.k),
  saveprice: el => {
    const v = parseFloat(String($("#pv").value).replace(",","."));
    if (!(v >= 0)){ toast("Entre un prix valide, par exemple 1,29"); return; }
    S.prices[el.dataset.k] = Math.round(v*100)/100; save(); refreshPrices(); closeSheet(); const y = SC().scrollTop; render(); SC().scrollTop = y; toast("Prix enregistré");
  },
  pricedel: el => { delete S.prices[el.dataset.k]; save(); refreshPrices(); if (sheetState && sheetState.kind === "settings") refreshSheet(openSettings); else { closeSheet(); } render(); },
  copylist: () => {
    const items = buildList(weekIdx().filter(i => i>=0).map(i => RX[i]), S.people, true);
    copyText(listText(items, "Courses Popote · " + store().n), "Liste copiée");
  },
  copyone: el => {
    const r = RBYID[el.dataset.id]; const p = sheetState.people;
    copyText(listText(buildList([r], p, false), r.n + " pour " + p), "Liste copiée");
  },
  done: () => {
    const recipes = weekIdx().filter(i => i>=0).map(i => RX[i]);
    const items = buildList(recipes, S.people, true);
    S.week.stockBefore = JSON.parse(JSON.stringify(S.stock));
    for (const it of items){
      if (it.staple) continue;
      const g = it.g;
      if (!g.fl.includes("K")){ delete S.stock[it.k]; continue; }
      let bought = 0;
      if (it.buy > 1e-9) bought = g.fl.includes("W") ? (g.u === "pc" ? it.packs : it.buy) : it.packs * g.size;
      const left = (S.stock[it.k]||0) + bought - it.need;
      if (left > 0.5) S.stock[it.k] = Math.round(left*100)/100; else delete S.stock[it.k];
    }
    S.week.done = true; save(); refreshPrices(); render(); toast("Bien joué ! Le reste est rangé au placard");
  },
  undodone: () => { if (S.week.stockBefore){ S.stock = S.week.stockBefore; delete S.week.stockBefore; } S.week.done = false; save(); refreshPrices(); render(); },
  tpeople: el => { S.tonight.people = Math.max(1, Math.min(20, S.tonight.people + +el.dataset.d)); save(); render(); },
  mood: el => { const k = el.dataset.k, m = S.tonight.moods; const i = m.indexOf(k); if (i>=0) m.splice(i,1); else m.push(k); UI.tonightSeed++; save(); render(); },
  reroll: () => { UI.tonightSeed++; render(); },
  fc: el => { UI.fc = el.dataset.k; render(); },
  ff: el => { const k = el.dataset.k, i = UI.ff.indexOf(k); if (i>=0) UI.ff.splice(i,1); else UI.ff.push(k); render(); },
  fav: el => { const id = el.dataset.id, i = S.favs.indexOf(id); if (i>=0) S.favs.splice(i,1); else S.favs.push(id); save(); const st = sheetState; refreshSheet(() => openRecipe(id, st)); },
  dislike: el => { const id = el.dataset.id, i = S.dislikes.indexOf(id); if (i>=0){ S.dislikes.splice(i,1); toast("Ce plat pourra de nouveau t'être proposé"); } else { S.dislikes.push(id); toast("Ce plat ne te sera plus proposé"); } save(); const st = sheetState; refreshSheet(() => openRecipe(id, st)); },
  rpeople: el => { const st = sheetState; st.people = Math.max(1, Math.min(20, st.people + +el.dataset.d)); refreshSheet(() => openRecipe(st.rid, st)); },
  stepdone: el => { const i = +el.dataset.i, st = sheetState; const j = st.done.indexOf(i); if (j>=0) st.done.splice(j,1); else st.done.push(i); el.classList.toggle("done"); },
  // Réglages
  setstore: el => { S.store = el.dataset.k; save(); refreshPrices(); refreshSheet(openSettings); render(); },
  speople: el => { S.people = Math.max(1, Math.min(12, S.people + +el.dataset.d)); save(); refreshSheet(openSettings); render(); },
  smeal: el => { S.meals[el.dataset.k] = !S.meals[el.dataset.k]; save(); refreshSheet(openSettings); },
  sdays: el => { S.days = +el.dataset.k; save(); refreshSheet(openSettings); },
  sdiet: el => { S.diet = el.dataset.k; save(); refreshSheet(openSettings); },
  sallergy: el => { toggleArr(S.allergies, el.dataset.k); save(); refreshSheet(openSettings); },
  scuisine: el => { toggleArr(S.cuisines, el.dataset.k); if (!S.cuisines.length) S.cuisines.push(el.dataset.k); save(); refreshSheet(openSettings); },
  applyweek: () => { closeSheet(); A.newweek(); },
  stockdel: el => { delete S.stock[el.dataset.k]; save(); refreshPrices(); refreshSheet(openSettings); render(); },
  export: () => copyText(JSON.stringify(S), "Sauvegarde copiée"),
  importask: () => { $("#iobox").innerHTML = '<div class="field" style="margin-top:6px"><label for="imp">Colle ta sauvegarde ici</label><textarea class="input" id="imp"></textarea><button class="btn sm primary" data-act="importgo">Importer</button></div>'; },
  importgo: () => {
    try { const d = JSON.parse($("#imp").value); if (!d || typeof d !== "object" || !("budget" in d)) throw 0; S = Object.assign(DEFAULT(), d); save(); rebuild(); closeSheet(); render(); toast("Sauvegarde importée"); }
    catch(e){ toast("Ce texte n'est pas une sauvegarde Popote valide."); }
  },
  resetask: () => { $("#resetbox").innerHTML = '<div class="alert"><div><b>Tout effacer ?</b> Ta semaine, tes recettes, tes prix et ton placard seront supprimés de cet appareil.<div class="links" style="margin-top:8px"><button class="btn sm primary" data-act="resetgo">Oui, tout effacer</button><button class="btn sm" data-act="resetno">Annuler</button></div></div></div>'; },
  resetno: () => { $("#resetbox").innerHTML = ""; },
  resetgo: () => { S = DEFAULT(); save(); rebuild(); closeSheet(); render(); showOnboarding(); },
  // Formulaire
  newrecipe: () => openRecipeForm(null),
  editrecipe: el => openRecipeForm(el.dataset.id),
  fmeal: el => { const d = sheetState.d, k = el.dataset.k; d.m = d.m.includes(k) ? d.m.replace(k,"") : d.m + k; renderForm(); },
  fdiff: el => { sheetState.d.d = +el.dataset.k; renderForm(); },
  fiadd: () => { sheetState.d.i.push(["",0]); renderForm(); },
  fidel: el => { sheetState.d.i.splice(+el.dataset.j, 1); if (!sheetState.d.i.length) sheetState.d.i.push(["",0]); renderForm(); },
  niadd: () => {
    const n = $("#ni-n").value.trim(), u = $("#ni-u").value, s = parseFloat($("#ni-s").value), p = parseFloat(String($("#ni-p").value).replace(",",".")), r = $("#ni-r").value;
    if (!n || !(s > 0) || !(p >= 0)){ toast("Remplis le nom, la taille et le prix du paquet."); return; }
    const k = "perso_" + Date.now().toString(36);
    S.customIng[k] = [n, u, s, p, r, ""]; save(); rebuild();
    const d = sheetState.d; const empty = d.i.findIndex(x => !x[0]);
    if (empty >= 0) d.i[empty] = [k, 0]; else d.i.push([k, 0]);
    renderForm(); toast("Ingrédient créé");
  },
  fsave: () => {
    const d = sheetState.d;
    const ings = d.i.filter(x => x[0] && I[x[0]] && x[1] > 0).map(x => [x[0], +x[1]]);
    const steps = d.s.split("\n").map(s => s.trim()).filter(Boolean);
    const err = !d.n.trim() ? "Donne un nom à ta recette." : !d.m ? "Choisis au moins un repas." : !ings.length ? "Ajoute au moins un ingrédient avec sa quantité." : !steps.length ? "Écris au moins une étape." : "";
    if (err){ $("#ferr").innerHTML = '<div class="alert">' + err + "</div>"; return; }
    const id = sheetState.id || "perso-" + Date.now().toString(36);
    const arr = [id, d.n.trim(), d.e || "🍽️", d.c, ["P","M","S"].filter(m => d.m.includes(m)).join(""), d.d, Math.max(1, +d.t || 20), "", ings, steps, (d.ph || "").trim()];
    const i = S.custom.findIndex(a => a[0] === id);
    if (i >= 0) S.custom[i] = arr; else S.custom.push(arr);
    save(); rebuild(); closeSheet(); TAB = "recipes"; render(); toast("Recette enregistrée"); openRecipe(id);
  },
  fdelete: () => {
    const id = sheetState.id; S.custom = S.custom.filter(a => a[0] !== id);
    if (S.week) S.week.slots.forEach(s => { if (s.id === id){ const alt = RX.find(r => !r.custom && r.m.includes(s.m) && allowed(r)); if (alt) s.id = alt.id; } });
    save(); rebuild(); closeSheet(); render(); toast("Recette supprimée");
  },
  // Accueil
  obstore: el => { S.store = el.dataset.k; save(); OB.step = 2; renderOB(); },
  obbudget: el => { S.budget = Math.max(5, (+S.budget||0) + +el.dataset.d); save(); renderOB(); },
  obpeople: el => { S.people = Math.max(1, Math.min(12, S.people + +el.dataset.d)); save(); renderOB(); },
  obmeal: el => { S.meals[el.dataset.k] = !S.meals[el.dataset.k]; save(); renderOB(); },
  obdays: el => { S.days = +el.dataset.k; save(); renderOB(); },
  obdiet: el => { S.diet = el.dataset.k; save(); feasCache = {}; renderOB(); },
  oballergy: el => { toggleArr(S.allergies, el.dataset.k); feasCache = {}; save(); renderOB(); },
  obcuisine: el => { toggleArr(S.cuisines, el.dataset.k); if (!S.cuisines.length) S.cuisines.push(el.dataset.k); feasCache = {}; save(); renderOB(); },
  obnext: () => { OB.step++; renderOB(); },
  obback: () => { OB.step--; renderOB(); },
  obfinish: () => {
    const el = $("#onboard");
    el.innerHTML = '<div class="ob-in"><div class="cook"><div class="pot">🍲</div><h1 style="font-size:26px">Je compose ta semaine…</h1><p class="ob-lead">Je cherche des plats variés qui tiennent dans ' + eur(S.budget) + ".</p></div></div>";
    setTimeout(() => {
      if (generateWeek()){ S.onboarded = true; save(); el.hidden = true; el.innerHTML = ""; TAB = "week"; render(); SC().scrollTop = 0; }
      else { OB.step = 3; renderOB(); }
    }, 500);
  }
};
function toggleArr(a, k){ const i = a.indexOf(k); if (i>=0) a.splice(i,1); else a.push(k); }

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const fn = A[el.dataset.act]; if (!fn) return;
  if (el.tagName === "A") return;
  e.preventDefault(); fn(el, e);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("#sheet").hidden){ closeSheet(); render(); }
  if ((e.key === "Enter" || e.key === " ") && e.target.matches('.meal[role="button"]') && !e.target.closest("button.swap")){ e.preventDefault(); A.open(e.target); }
});
document.addEventListener("input", e => {
  const el = e.target, k = el.dataset.in; if (!k) return;
  if (k === "rq"){ UI.q = el.value; const pos = el.selectionStart; render(); const n = $("#rq"); n.focus(); try { n.setSelectionRange(pos,pos); } catch(_){} }
  else if (k === "sq"){
    UI.swapQ = el.value; const slot = sheetState.slot;
    if (!UI.swapQ.trim()){ openSwap(slot); const n = $("#sq"); if (n) n.focus(); return; }
    $("#swaplist").innerHTML = swapListHTML(slot, [], swapScored(slot, true), normW(UI.swapQ.trim())); hydrate();
  }
  else if (k === "bsq"){
    UI.swapQ = el.value; const id = sheetState && sheetState.id; if (!id) return;
    if (!UI.swapQ.trim()){ openBatchSwap(id); const n = $("#bsq"); if (n) n.focus(); return; }
    $("#swaplist").innerHTML = batchSwapListHTML(id, [], batchSwapScored(id), normW(UI.swapQ.trim())); hydrate();
  }
  else if (k === "sb"){ const v = parseFloat(el.value); if (v > 0){ S.budget = v; save(); render(); } }
  else if (k === "obb"){ const v = parseFloat(el.value); if (v > 0){ S.budget = v; save(); const f = $("#feas"); if (f) f.innerHTML = feasHTML(); } }
  else if (k === "stock"){ const v = parseFloat(el.value); if (v >= 0){ S.stock[el.dataset.k] = v; save(); refreshPrices(); render(); } }
  else if (sheetState && sheetState.kind === "form"){
    const d = sheetState.d;
    if (k === "fn") d.n = el.value; else if (k === "fe") d.e = el.value; else if (k === "fp") d.ph = el.value; else if (k === "fc2") d.c = el.value;
    else if (k === "ft") d.t = +el.value; else if (k === "fs") d.s = el.value;
    else if (k === "fq") d.i[+el.dataset.j][1] = parseFloat(el.value) || 0;
    else if (k === "fi"){
      const j = +el.dataset.j, name = el.value.trim().toLowerCase();
      const key = IKEYS.find(x => I[x].n.toLowerCase() === name);
      d.i[j][0] = key || ""; d.i[j][2] = el.value;
    }
  }
});
document.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.in === "fi" || el.dataset.in === "fc2") { if (sheetState && sheetState.kind === "form") renderForm(); }
});

Object.assign(A, UI_ACTIONS, EXTRA_ACTIONS, {mepdone: el => { el.classList.toggle("done"); buzz(5); }});

/* ════════════ Démarrage ════════════ */
function start(){
  rebuild();
  shell();
  if (!S.onboarded) showOnboarding();
  else if (!S.week) generateWeek();
  render();
}
start();
window.__popote = {get S(){ return S; }, generateWeek, weekTotal, minCostEstimate, buildList, RX:() => RX, I:() => I, render, go};
})();
