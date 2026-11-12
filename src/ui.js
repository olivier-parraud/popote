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
const TITLES = {week:"Ta semaine", list:"Courses", tonight:"Ce soir ?", recipes:"Recettes"};
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
    [["week","Semaine",ICO.week],["list","Courses",ICO.cart],["tonight","Ce soir ?",ICO.moon],["recipes","Recettes",ICO.book]]
      .map(([k,n,ic]) => '<button class="tab" data-act="tab" data-tab="' + k + '">' + ic + n + "</button>").join("") +
    "</div></nav></div>";
  const sc = SC(), nav = $("#nav");
  sc.addEventListener("scroll", () => nav.classList.toggle("solid", sc.scrollTop > 36), {passive:true});
  document.addEventListener("touchstart", () => {}, {passive:true});
}
function render(){
  $("#storeName").textContent = store().n;
  $("#navTitle").textContent = TITLES[TAB];
  document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-current", b.dataset.tab === TAB ? "page" : "false"));
  $("#view").innerHTML = '<div class="wrap' + (UI.enter ? " enter" : "") + '">' + ({week:viewWeek, list:viewList, tonight:viewTonight, recipes:viewRecipes}[TAB])() + "</div>";
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
  h += '<div class="ings">' + r.i.map(([k,q]) => '<div class="ing"><span>' + esc(I[k].n) + (I[k].fl.includes("S") ? " <small>placard</small>" : "") + '</span><span class="q">' + qtyLabel(k, q*people) + "</span></div>").join("") + "</div>";
  if (alg.length) h += '<p class="note" style="margin:-6px 0 0">Contient : ' + alg.join(", ") + ".</p>";
  h += '<div class="section-h"><h3>Préparation</h3></div>';
  h += '<div class="steps">' + r.s.map((s,i) => '<button class="step ' + (st.done.includes(i) ? "done" : "") + '" data-act="stepdone" data-i="' + i + '"><span>' + esc(s) + "</span></button>").join("") + "</div>";
  h += '<p class="note" style="margin:0">Sel et poivre selon ton goût. Touche une étape quand elle est faite.</p>';
  if (st.from === "tonight"){
    const items = buildList([r], people, false).filter(it => !it.staple);
    h += '<div class="section-h"><h3>Courses pour ' + people + "</h3>" + pr(items.reduce((s,it) => s + it.cost, 0)) + "</div>";
    h += '<div class="ings">' + items.map(it => '<div class="ing"><span>' + esc(it.g.n) + " <small>· " + packLabel(it) + '</small></span><span class="q">' + qtyLabel(it.k, it.need) + "</span></div>").join("") + "</div>";
    h += '<button class="btn block" data-act="copyone" data-id="' + esc(id) + '">' + ICO.copy + "Copier cette liste</button>";
  }
  h += '<div class="links"><a class="btn sm" href="https://www.marmiton.org/recettes/recherche.aspx?aqt=' + encodeURIComponent(r.n) + '" target="_blank" rel="noopener">' + ICO.out + "Marmiton</a>" +
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

