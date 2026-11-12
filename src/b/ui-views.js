/* ═══ Biscuit · écrans principaux ═══ */
const TABS = [["today","Aujourd'hui","today"],["week","Semaine","week"],["mid"],["list","Courses","list"],["recipes","Recettes","book"]];
const TITLES = {today:"Aujourd'hui", week:"Ta semaine", list:"Courses", recipes:"Recettes"};

function shell(){
  $("#app").innerHTML =
    '<div id="stage"><header class="topbar" id="topbar" aria-hidden="true"><b id="topt"></b></header><div id="scroller"><main id="view" class="view"></main></div></div>' +
    '<nav class="tabbar" id="tabbar" aria-label="Onglets"></nav>' +
    '<div id="bubble"></div><div id="sheet" hidden></div><div id="full" class="full" hidden></div><div id="onboard" hidden></div><div id="tpill" role="timer" aria-live="off" hidden></div><div id="toast" role="status" aria-live="polite" hidden></div>';
  SC().addEventListener("scroll", onScroll, {passive:true});
}
let scrollRaf = 0;
function onScroll(){
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0;
    const y = SC().scrollTop, tb = $("#topbar");
    tb.classList.toggle("on", y > 64);
    const b = $("#bubble .bubble"); if (b && y > 40) hideBubble();
  });
}
function tabbarHTML(){
  const n = UI.badge;
  return TABS.map(t => {
    if (t[0] === "mid") return '<button class="tab-mid" data-act="tonight" aria-label="Ce soir, on mange quoi ? Une idée de plat">' + mascotMini() + "</button>";
    const cur = UI.tab === t[0];
    return '<button class="tab" data-act="tab" data-tab="' + t[0] + '"' + (cur ? ' aria-current="page"' : "") + ' aria-label="' + t[1] + '">' + IC[t[2]] + '<span class="lb">' + t[1] + "</span>" +
      (t[0] === "list" && n ? '<span class="badge">' + n + "</span>" : "") + "</button>";
  }).join("");
}
function mascotMini(){
  return '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#F2C27B"><rect x="22" y="26" width="56" height="48" rx="8"/>' +
    [28,39,50,61,72].map(x => '<circle cx="' + x + '" cy="26" r="5"/><circle cx="' + x + '" cy="74" r="5"/>').join("") +
    [38,50,62].map(y => '<circle cx="22" cy="' + y + '" r="5"/><circle cx="78" cy="' + y + '" r="5"/>').join("") +
    '</g><ellipse cx="41" cy="46" rx="3.4" ry="4" fill="#6B3E1C"/><ellipse cx="59" cy="46" rx="3.4" ry="4" fill="#6B3E1C"/><path d="M42 56 Q50 63 58 56" stroke="#6B3E1C" stroke-width="4" stroke-linecap="round" fill="none"/></svg>';
}

function render(){
  const v = $("#view"); if (!v) return;
  if (S.week){ const d = listData(); UI.badge = d.toBuy.filter(it => !S.checked[it.k]).length; } else UI.badge = 0;
  const views = {today:viewToday, week:viewWeek, list:viewList, recipes:viewRecipes};
  v.className = "view" + (UI.enter ? " enter" : "") + (UI.tab === "recipes" || UI.tab === "week" || UI.tab === "today" || UI.tab === "list" ? " wide" : "");
  v.innerHTML = views[UI.tab]();
  $("#topt").textContent = TITLES[UI.tab];
  $("#tabbar").innerHTML = tabbarHTML();
  UI.enter = false;
  hydrate();
  afterRender();
}
function afterRender(){
  const tot = $("#listTotal"); if (tot){ animateNum(tot, UI.lastTotal, +tot.dataset.v); UI.lastTotal = +tot.dataset.v; }
  if (UI.tab === "recipes") setupMore();
  if (UI.tab === "today") showBubble(); else hideBubble(true);
  if (UI.pop){
    const el = document.querySelector('[data-pop="' + UI.pop + '"]');
    if (el){ el.classList.add("pop"); requestAnimationFrame(() => { const r = el.getBoundingClientRect(); if (r.top < 70 || r.bottom > innerHeight - 100) el.scrollIntoView({block:"center", behavior: reduced() ? "auto" : "smooth"}); }); }
    UI.pop = null;
  }
}
function go(tab, keepScroll){
  if (tab === UI.tab && !keepScroll){ SC().scrollTo({top:0, behavior: reduced() ? "auto" : "smooth"}); return; }
  UI.scroll[UI.tab] = SC().scrollTop;
  UI.enter = tab !== UI.tab; UI.tab = tab; render();
  SC().scrollTop = keepScroll ? (UI.scroll[tab] || 0) : 0;
  onScroll();
}

/* ── Bulle « Touche le biscuit » ── */
function showBubble(){
  const n = S.hints.biscuit || 0;
  if (n >= 3 || S.hints.biscuitOff || UI.bubbleShown || !S.week) return;
  UI.bubbleShown = true; S.hints.biscuit = n + 1; save();
  $("#bubble").innerHTML = '<div class="bubble"><button data-act="hint-close" aria-label="Fermer l\'astuce">Pas d\'idée ? Touche le biscuit' + IC.close + "</button><i></i></div>";
}
function hideBubble(now){
  const b = $("#bubble .bubble"); if (!b) return;
  if (now){ b.remove(); return; }
  b.classList.add("out"); setTimeout(() => b.remove(), 320);
}

/* ═════════ Aujourd'hui ═════════ */
function nextMeal(){
  const w = S.week; if (!w) return null;
  const ti = todayIndex();
  const sl = w.slots.map((s, i) => ({...s, i}));
  const up = sl.filter(s => (s.d > ti || (s.d === ti && !slotPast(s))) && s.d >= 0);
  return up.length ? up[0] : null;
}
function frozenIn(r){ return r.i.filter(([k]) => I[k] && (I[k].r === "sg" || k === "colin" || k === "crevette")).map(([k]) => I[k].n.toLowerCase()); }
function hintFor(s){
  const r = RBYID[s.id]; if (!r) return null;
  if (S.week.batch && s.m !== "P"){
    const info = batchInfo(r), day = s.d + 1;
    const frigo = day <= Math.min(3, info.fridge || 0) || !info.freeze;
    return frigo ? {ice:false, t:"Ta boîte est prête au frigo : 2 à 3 minutes au micro-ondes en remuant à mi-temps."}
                 : {ice:true, t:"Ta boîte est au congélateur. Sors-la le matin au frigo, ou décongèle-la 6 à 8 minutes au micro-ondes."};
  }
  const fz = frozenIn(r);
  if (fz.length) return {ice:true, t:"À décongeler : " + fz.join(", ") + ". Si tu as oublié, passe-le en mode décongélation au micro-ondes."};
  const main = r.i.filter(([k]) => I[k] && !I[k].fl.includes("S") && I[k].r !== "fl").map(([k]) => I[k].n.toLowerCase());
  const fresh = r.i.filter(([k]) => I[k] && I[k].r === "fl").map(([k]) => I[k].n.toLowerCase());
  const take = main.concat(fresh).slice(0, 3);
  return {ice:false, t:"Rien à décongeler. Sors " + (take.length > 1 ? take.slice(0,-1).join(", ") + " et " + take[take.length-1] : take[0] || "tes ingrédients") + "."};
}
function tomorrowAlert(){
  const w = S.week; if (!w || w.batch) return null;
  const ti = todayIndex();
  const tm = w.slots.filter(s => s.d === ti + 1 && s.m !== "P");
  for (const s of tm){ const r = RBYID[s.id]; if (!r) continue; const fz = frozenIn(r); if (fz.length) return "Pour demain " + MEALS[s.m].toLowerCase() + " : sors " + fz.join(", ") + " du congélateur ce soir et mets-le au frigo."; }
  return null;
}
function viewToday(){
  const hour = new Date().getHours();
  const hello = hour < 5 ? "Bonne nuit" : hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const date = cap(new Date().toLocaleDateString("fr-FR",{weekday:"long", day:"numeric", month:"long"}));
  let h = '<header class="home-h st"' + st(0) + ">" + logo() + '<div class="who"><span>' + date + "</span><span>" + hello + (S.name ? " " + esc(S.name) : "") + '</span></div><button class="iconb press" data-act="settings" aria-label="Réglages">' + IC.settings + "</button></header>";
  if (!S.week) return h + emptyWeek();
  const w = S.week, ti = todayIndex();
  if (ti >= w.days){
    h += '<section class="card st"' + st(1) + '><div class="body" style="padding:22px;display:flex;flex-direction:column;gap:12px;align-items:flex-start"><span class="tag green">Semaine terminée</span><h2 class="h1" style="font-size:26px">Une nouvelle semaine ?</h2><p class="note">Je compose 7 nouveaux jours de repas variés dans ton budget de ' + eur(S.budget) + ".</p><button class=\"btn primary\" data-act=\"newweek-go\">" + IC.sparkle + "Créer ma nouvelle semaine</button></div></section>";
    return h + weekStrip(2);
  }
  const nm = nextMeal();
  const two = '<div class="two">';
  h += two + "<div>";
  if (nm){
    const r = RBYID[nm.id];
    const isToday = nm.d === ti, lab = (isToday ? (nm.m === "S" ? "Ce soir" : nm.m === "M" ? "Ce midi" : "Ce matin") : (nm.d === ti + 1 ? "Demain " + MEALS[nm.m].toLowerCase() : cap(fmtDay(dayDate(w.start, nm.d))) + " " + MEALS[nm.m].toLowerCase())) + " · " + hLabel(S.times[nm.m]);
    const hint = hintFor(nm);
    h += '<article class="card hero st"' + st(1) + ' data-pop="' + nm.i + '"><div class="media">' + photo(r, "hero") + '<span class="tag white">' + lab + '</span><button class="iconb white press" data-act="swap" data-slot="' + nm.i + '" aria-label="Changer ce plat">' + IC.swap + "</button></div>" +
      '<div class="body"><div class="ttl"><h2>' + esc(r.n) + '</h2><span class="meta">' + timeLabel(r.t) + ' · <span style="color:var(--caramel-text)">' + eur(r.cost*S.people) + "</span></span></div>" +
      (hint ? '<div class="hint' + (hint.ice ? " ice" : "") + '">' + (hint.ice ? IC.ice : IC.clock) + "<span>" + esc(hint.t) + "</span></div>" : "") +
      '<div class="actions"><button class="btn primary" data-act="cook" data-id="' + esc(r.id) + '" data-slot="' + nm.i + '">' + IC.play + 'Cuisiner</button><button class="btn" data-act="open" data-id="' + esc(r.id) + '" data-slot="' + nm.i + '">La recette</button></div></div></article>';
  }
  const alert = tomorrowAlert();
  if (alert) h += '<div class="hint ice st"' + st(2) + ">" + IC.ice + "<span>" + esc(alert) + "</span></div>";
  const others = w.slots.map((s, i) => ({...s, i})).filter(s => s.d === ti && (!nm || s.i !== nm.i));
  if (others.length){
    h += '<div class="sec st"' + st(3) + ">";
    for (const s of others){
      const r = RBYID[s.id]; if (!r) continue;
      const past = slotPast(s), skipped = S.skipped[slotKey(s)];
      const chip = past ? (skipped ? '<span class="tag warn">Pas mangé</span>' : '<span class="tag green">' + IC.check + "Mangé</span>") : '<span class="tag">' + hLabel(S.times[s.m]) + "</span>";
      h += '<button class="mini-meal press' + (past ? " past" : "") + '" data-act="' + (past ? "eaten" : "open") + '" data-id="' + esc(r.id) + '" data-slot="' + s.i + '">' + photo(r, "round") +
        '<span style="min-width:0;display:flex;flex-direction:column;gap:1px"><span class="k">' + (s.m === "M" ? "Ce midi" : s.m === "S" ? "Ce soir" : "Ce matin") + '</span><span class="n">' + esc(r.n) + "</span></span>" + chip + "</button>";
    }
    h += "</div>";
  }
  h += "</div><div>" + weekStrip(4) + "</div></div>";
  return h;
}
function weekStrip(i){
  const w = S.week, ti = todayIndex(), total = weekTotal(), over = total > S.budget + 0.01;
  let h = '<section class="sec st"' + st(i) + ' aria-label="Ta semaine"><div class="sec-h"><h2 class="h2">Ta semaine</h2><span class="r tnum">' + eur(total) + " <span>sur " + eur(S.budget) + "</span></span></div>" +
    '<div class="bar' + (over ? " over" : "") + '"><i style="width:' + Math.min(100, total/S.budget*100).toFixed(1) + '%"></i></div><div class="days" style="margin-top:4px">';
  for (let d = 0; d < w.days; d++){
    const date = dayDate(w.start, d), sl = w.slots.filter(s => s.d === d && s.m !== "P").slice(0, 2);
    const dots = sl.map(s => { const r = RBYID[s.id]; const src = r ? photoSrc(r) : ""; return '<i style="' + (src ? "background-image:url('" + esc(src) + "')" : "background:hsl(" + ((CUISINES[r && r.c] || {h:30}).h) + " 55% 62%)") + '"></i>'; }).join("");
    h += '<button class="day' + (d === ti ? " today" : d < ti ? " past" : "") + '" data-act="day" data-d="' + d + '" aria-label="' + esc(cap(fmtDay(date))) + '"><span class="dk">' + dayShort(date).toUpperCase().slice(0,3) + '</span><span class="dn">' + date.getDate() + '</span><span class="dots">' + dots + "</span></button>";
  }
  return h + "</div></section>";
}
function emptyWeek(){
  return '<div class="empty st"' + st(1) + ">" + mascot("art jump") + '<h2 class="h2">Pas encore de semaine</h2><p>Je compose tes repas de la semaine dans ton budget, en quelques secondes.</p><button class="btn primary" data-act="newweek-go">' + IC.sparkle + "Créer ma semaine</button></div>";
}

/* ═════════ Semaine ═════════ */
function viewWeek(){
  const w = S.week;
  let h = '<header class="vh st"' + st(0) + '><div class="t"><span class="sub">' + (w ? esc(fmtDM(dayDate(w.start,0))) + " → " + esc(fmtDM(dayDate(w.start, w.days-1))) + " · " : "") + esc(store().n) + '</span><h1 class="h1">Ta semaine</h1></div><button class="iconb press" data-act="newweek-ask" aria-label="Refaire une semaine">' + IC.refresh + "</button></header>";
  h += '<div class="st"' + st(1) + ">" + seg("wmode", [["classic","Classique"],["batch","Batch cooking"]], w && w.batch ? "batch" : "classic") + "</div>";
  if (!w) return h + emptyWeek();
  const total = weekTotal(), over = total > S.budget + 0.01;
  h += '<div class="budget-line st"' + st(2) + '><div class="sec-h"><span style="font-weight:700" class="tnum">' + eur(total) + ' <span class="muted" style="font-weight:500">sur ' + eur(S.budget) + "</span></span>" +
    (over ? '<span class="tag warn">Dépasse de ' + eur(total - S.budget) + "</span>" : '<span class="tag green">Reste ' + eur(S.budget - total) + "</span>") + '</div><div class="bar' + (over ? " over" : "") + '"><i style="width:' + Math.min(100, total/S.budget*100).toFixed(1) + '%"></i></div>' +
    (over && w.minCost ? '<p class="note">Avec ces filtres, la semaine la moins chère coûte environ ' + eur(w.minCost) + ". Change un plat ou augmente ton budget dans les réglages.</p>" : "") + "</div>";
  if (w.batch) h += batchTop(3);
  h += '<div class="weekgrid">';
  let k = w.batch ? 6 : 3;
  const ti = todayIndex();
  for (let d = 0; d < w.days; d++){
    const date = dayDate(w.start, d), sl = w.slots.map((s, i) => ({...s, i})).filter(s => s.d === d);
    const cost = totalFor(sl.map(s => RBYID[s.id] ? RBYID[s.id].idx : -1), S.people, false);
    h += '<section class="dayblock st"' + st(k++) + ' id="day-' + d + '"><div class="dayh"><span class="l"><span class="h3">' + esc(cap(fmtDay(date))) + " " + date.getDate() + "</span>" + (d === ti ? '<span class="tag green">Aujourd\'hui</span>' : "") + '</span><span class="c tnum">' + eur(cost) + '</span></div><div class="meals">';
    for (const s of sl){
      const r = RBYID[s.id]; if (!r) continue;
      const past = slotPast(s), skipped = S.skipped[slotKey(s)];
      const kk = MEALS[s.m] + " · " + (past ? (skipped ? "pas mangé" : "mangé") : timeLabel(r.t));
      h += '<div class="meal' + (past ? " past" : "") + '" data-pop="' + s.i + '" role="button" tabindex="0" data-act="open" data-id="' + esc(r.id) + '" data-slot="' + s.i + '">' + photo(r, "thumb") +
        '<span style="min-width:0;display:flex;flex-direction:column;gap:2px"><span class="k">' + kk + '</span><span class="n">' + esc(r.n) + '</span></span><span class="side"><span class="p">' + eur(r.cost*S.people) + "</span>" +
        (w.batch && s.m !== "P" ? "" : '<button class="swapb" data-act="swap" data-slot="' + s.i + '" aria-label="Changer ' + esc(r.n) + '">' + IC.swap + "</button>") + "</span></div>";
    }
    h += "</div></section>";
  }
  return h + "</div>";
}
function batchTop(i){
  const bd = S.batchDays || 5, dishes = batchPlan(), n = S.week.slots.filter(s => s.m !== "P").length;
  const sumT = dishes.reduce((s,x) => s + x.r.t, 0), maxT = Math.max(...dishes.map(x => x.r.t));
  const est = Math.round((Math.max(maxT, sumT*0.6) + 20)/5)*5;
  const freezer = S.week.slots.filter(s => { if (s.m === "P") return false; const r = RBYID[s.id]; if (!r) return false; const inf = batchInfo(r), day = s.d + 1; return !(day <= Math.min(3, inf.fridge || 0) || !inf.freeze); }).length;
  let h = '<div class="sec-h st"' + st(i) + '><span style="font-weight:600">Nombre de jours</span><div class="ndays" role="group" aria-label="Nombre de jours">' +
    [3,4,5,6,7].map(v => '<button data-act="bdays" data-k="' + v + '" aria-pressed="' + (v === bd) + '">' + v + "</button>").join("") + "</div></div>";
  h += '<section class="sec st"' + st(i+1) + '><div class="sec-h"><h2 class="h2">Tes plats</h2><span class="r">' + dishes.length + " plats · " + n + " repas</span></div><div class=\"meals\">";
  for (const x of dishes){
    const days = x.slots.map(sl => dayShort(dayDate(S.week.start, sl.d)) + " " + MEALS[sl.m].toLowerCase()).join(", ");
    const kc = x.info.freeze ? "var(--green-text)" : "var(--caramel-text)";
    h += '<div class="meal" data-pop="' + esc(x.r.id) + '" role="button" tabindex="0" data-act="open" data-id="' + esc(x.r.id) + '">' + photo(x.r, "thumb") +
      '<span style="min-width:0;display:flex;flex-direction:column;gap:2px"><span class="kbatch" style="color:' + kc + '">' + x.slots.length + " REPAS · " + (x.info.freeze ? "SE CONGÈLE" : x.info.fridge + " J AU FRIGO") + '</span><span class="n" style="font-weight:700">' + esc(x.r.n) + '</span><span class="k">' + esc(days) + "</span></span>" +
      '<span class="side"><button class="swapb" data-act="bswap" data-id="' + esc(x.r.id) + '" aria-label="Changer ' + esc(x.r.n) + '">' + IC.swap + "</button></span></div>";
  }
  h += '</div><p class="note">Touche ⇄ pour remplacer un plat sur tous ses repas.</p></section>';
  h += '<section class="session st"' + st(i+2) + '><div class="stats"><div><b>≈ ' + timeLabel(est) + '</b><span>de cuisine</span></div><div><b>' + n + '</b><span>boîtes</span></div><div><b>' + freezer + '</b><span>au congélo</span></div></div>' +
    '<button class="btn primary block" data-act="session">' + IC.play + (S.week.sessionDone ? "Revoir la session" : "Lancer la session") + "</button></section>";
  h += '<h2 class="h2 st"' + st(i+3) + ' style="margin-top:6px">Jour par jour</h2>';
  return h;
}

/* ═════════ Courses ═════════ */
function listData(){
  const recipes = weekIdx().filter(i => i >= 0).map(i => RX[i]);
  const items = buildList(recipes, S.people, true);
  return {recipes, items, toBuy:items.filter(it => !it.staple && it.buy > 1e-9), covered:items.filter(it => !it.staple && it.buy <= 1e-9), staples:items.filter(it => it.staple), total:items.reduce((s,it) => s + (it.counted ? it.cost : 0), 0)};
}
function itemHTML(it){
  const done = !!S.checked[it.k];
  return '<div class="item' + (done ? " done" : "") + '" data-k="' + it.k + '"><button class="press" data-act="check" data-k="' + it.k + '" aria-pressed="' + done + '" aria-label="' + esc(it.g.n) + ' dans le chariot" style="display:grid">' + box(false) + "</button>" +
    '<button data-act="check" data-k="' + it.k + '" tabindex="-1" style="min-width:0;display:flex;flex-direction:column;gap:1px;text-align:left"><span class="nm">' + esc(it.g.n) + '</span><span class="q">' + qtyLabel(it.k, it.need) + (packLabel(it) ? " · " + packLabel(it) : "") + (it.have > 0 ? " · <b>" + qtyLabel(it.k, it.have) + " au placard</b>" : "") + "</span></button>" +
    '<button class="pr" data-act="editprice" data-k="' + it.k + '" aria-label="Modifier le prix de ' + esc(it.g.n) + '">' + eur(it.cost) + "</button></div>";
}
function viewList(){
  const s = store();
  let h = '<header class="vh st"' + st(0) + '><div class="t"><span class="sub">' + storeLogo(s, "sm") + esc(s.n) + (S.week ? " · " + listData().toBuy.length + " articles" : "") + '</span><h1 class="h1">Courses</h1></div><button class="iconb press" data-act="copylist" aria-label="Copier la liste">' + IC.copy + "</button></header>";
  if (!S.week) return h + emptyWeek();
  const {recipes, toBuy, covered, staples, total} = listData();
  const nDone = toBuy.filter(it => S.checked[it.k]).length, over = total > S.budget + 0.01;
  h += '<section class="total st"' + st(1) + ' aria-label="Total"><div class="sec-h" style="align-items:flex-end;padding:0"><div style="display:flex;flex-direction:column;gap:1px"><span class="lab">Total estimé</span><span class="big" id="listTotal" data-v="' + total.toFixed(2) + '">' + eur(total) + "</span></div>" +
    (over ? '<span class="tag warn">Dépasse de ' + eur(total - S.budget) + "</span>" : '<span class="tag green">Reste ' + eur(S.budget - total) + "</span>") +
    '</div><div class="bar"><i id="cartBar" style="width:' + (toBuy.length ? nDone/toBuy.length*100 : 0) + '%"></i></div><span class="lab" id="cartCount">' + nDone + " sur " + toBuy.length + " dans le chariot · " + recipes.length + " repas</span></section>";
  h += '<div class="st two-btn" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px"' + st(2) + '><button class="btn tint" data-act="store-open" style="font-size:14.5px">' + IC.list + 'Au magasin</button><button class="btn caramel" data-act="ticket" style="font-size:14.5px">' + IC.scan + "Scanner un ticket</button></div>";
  h += '<div class="st"' + st(3) + ">" + seg("lmode", [["aisle","Par rayon"],["dish","Par plat"],["pantry","Mon placard"]], UI.listMode, "sm") + "</div>";
  let k = 4;
  if (UI.listMode === "aisle"){
    h += '<div class="aisles">';
    for (const a of AISLE_ORDER){
      const list = toBuy.filter(it => it.g.r === a); if (!list.length) continue;
      h += '<section class="aisle t-' + a + ' st"' + st(k++) + '><div class="ah"><span class="h3">' + RAYONS[a].n + '</span><span class="tnum">' + eur(list.reduce((s,it) => s + it.cost, 0)) + '</span></div><div class="items">' + list.map(itemHTML).join("") + "</div></section>";
    }
    h += "</div>";
    if (!toBuy.length) h += '<div class="empty">' + mascot("art") + "<p>Tout est déjà au placard pour cette semaine.</p></div>";
  } else if (UI.listMode === "dish"){
    const seen = new Set();
    h += '<div class="aisles">';
    for (const r of recipes){
      if (seen.has(r.id)) continue; seen.add(r.id);
      const n = recipes.filter(x => x.id === r.id).length;
      const mine = toBuy.filter(it => r.i.some(([kk]) => kk === it.k));
      if (!mine.length) continue;
      h += '<section class="aisle st"' + st(k++) + '><div class="ah"><span class="h3" style="min-width:0">' + esc(r.n) + '</span><span class="muted" style="font-size:13px;font-weight:600">' + (n > 1 ? n + " repas" : "") + '</span></div><div class="items">' + mine.map(itemHTML).join("") + "</div></section>";
    }
    h += '</div><p class="note">Un ingrédient qui sert à plusieurs plats apparaît sous chacun d\'eux, avec la quantité de toute la semaine.</p>';
  } else {
    h += '<section class="sec st"' + st(k++) + '><p class="note">Coché = tu l\'as déjà chez toi : ce n\'est pas compté dans le total. Touche un article s\'il t\'en manque.</p><div class="aisle"><div class="items">';
    for (const it of staples){
      const have = !S.toBuy[it.k];
      h += '<button class="item pantry press" data-act="tobuy" data-k="' + it.k + '" aria-pressed="' + have + '">' + box(have) + '<span style="min-width:0;display:flex;flex-direction:column;gap:1px"><span class="nm">' + esc(it.g.n) + '</span><span class="q">' + qtyLabel(it.k, it.need) + " cette semaine</span></span>" +
        (have ? '<span class="state ok">J\'en ai</span>' : '<span class="state buy">À acheter<small>' + eur(it.cost) + "</small></span>") + "</button>";
    }
    for (const it of covered) h += '<div class="item pantry">' + box(true) + '<span style="min-width:0;display:flex;flex-direction:column;gap:1px"><span class="nm">' + esc(it.g.n) + '</span><span class="q">' + qtyLabel(it.k, it.need) + ' pris dans ton stock</span></span><span class="state ok">Au placard</span></div>';
    h += "</div></div></section>";
  }
  h += '<div class="st" style="display:flex;flex-direction:column;gap:10px;margin-top:4px"' + st(k++) + ">" +
    (S.week.done ? '<div class="hint" style="background:var(--green-tint);color:var(--green-ink)">' + IC.check + '<span>Courses faites. Le reste des paquets est rangé dans ton placard pour la semaine prochaine.</span></div><button class="btn" data-act="undodone">Annuler « Courses faites »</button>'
                 : '<button class="btn primary block" data-act="done">' + IC.check + "Courses faites</button>") +
    '<p class="note" style="text-align:center">Prix estimés pour ' + esc(s.n) + ". Touche un prix pour le corriger : l'appli s'en souvient.</p></div>";
  return h;
}

/* ═════════ Recettes ═════════ */
const RF = {all:["Toutes", () => true], fav:["Favoris", r => S.favs.includes(r.id)], quick:["Rapide", r => r.t <= 25], vege:["Végé", r => !r.F.v && !r.F.f && !r.F.c], cheap:["Pas cher", r => r.cost <= 1.3], morning:["Petit-déj", r => r.m.includes("P")], dessert:["Desserts", r => r.tg.includes("d")], mine:["Mes recettes", r => r.custom]};
function recipeResults(){
  const q = normW(UI.q.trim()), f = UI.rf;
  let list = RX.filter(r => !S.dislikes.includes(r.id) || f === "mine");
  if (RF[f]) list = list.filter(RF[f][1]); else if (CUISINES[f]) list = list.filter(r => r.c === f);
  if (q) list = list.filter(r => normW(r.n).includes(q) || r.i.some(([k]) => I[k] && normW(I[k].n).includes(q)));
  return list.sort((a,b) => (S.favs.includes(b.id) - S.favs.includes(a.id)) || a.n.localeCompare(b.n, "fr"));
}
function rcard(r){
  const fav = S.favs.includes(r.id);
  return '<button class="rcard" data-act="open" data-id="' + esc(r.id) + '"><span class="wrap-ph" style="display:block">' + photo(r, "") + (fav ? '<span class="heart">' + IC.heartFill + "</span>" : "") + '</span><span class="tx"><span class="n">' + esc(r.n) + '</span><span class="m">' + timeLabel(r.t) + " · " + eur(r.cost) + "</span></span></button>";
}
function viewRecipes(){
  let h = '<header class="vh st"' + st(0) + '><div class="t"><span class="sub">' + RX.length + " recettes · " + Object.keys(CUISINES).length + ' cuisines</span><h1 class="h1">Recettes</h1></div><button class="iconb green press" data-act="newrecipe" aria-label="Ajouter ma recette">' + IC.plus + "</button></header>";
  h += '<div class="search st"' + st(1) + ">" + IC.search + '<label class="sr" for="rq">Chercher une recette</label><input class="input" id="rq" type="search" placeholder="Un plat, un ingrédient…" value="' + esc(UI.q) + '" data-in="rq" autocomplete="off" enterkeyhint="search"></div>';
  const chips = Object.keys(RF).filter(k => k !== "dessert" || RX.some(r => r.tg.includes("d"))).filter(k => k !== "mine" || S.custom.length).map(k => [k, RF[k][0]]).concat(Object.keys(CUISINES).map(k => [k, CUISINES[k].n]));
  h += '<div class="chips scroll st"' + st(2) + ' role="group" aria-label="Filtres">' + chips.map(([k,n]) => '<button class="chip dark" data-act="rf" data-k="' + k + '" aria-pressed="' + (UI.rf === k) + '">' + esc(n) + "</button>").join("") + "</div>";
  const favs = RX.filter(r => S.favs.includes(r.id));
  if (favs.length && !UI.q && UI.rf === "all"){
    h += '<section class="sec st"' + st(3) + '><h2 class="h2">Tes favoris</h2><div class="favs">' + favs.map(r => '<button class="fav" data-act="open" data-id="' + esc(r.id) + '">' + photo(r, "") + '<span class="tx"><span class="n">' + esc(r.n) + '</span><span class="m">' + timeLabel(r.t) + " · " + eur(r.cost) + "</span></span></button>").join("") + "</div></section>";
  }
  const res = recipeResults();
  UI.more = res; UI.shown = Math.min(res.length, 24);
  h += '<section class="sec st"' + st(4) + '><div class="sec-h"><h2 class="h2">' + (UI.q || UI.rf !== "all" ? res.length + " recette" + (res.length > 1 ? "s" : "") : "Toutes les recettes") + '</h2></div>' +
    (res.length ? '<div class="rgrid" id="rgrid">' + res.slice(0, UI.shown).map(rcard).join("") + '</div><div id="more" style="height:1px"></div>' : '<div class="empty">' + mascot("art") + "<p>Aucune recette ne correspond. Essaie un autre mot ou un autre filtre.</p></div>") + "</section>";
  return h;
}
let moreObs = null;
function setupMore(){
  if (moreObs) moreObs.disconnect();
  const el = $("#more"); if (!el || !("IntersectionObserver" in window)) return;
  moreObs = new IntersectionObserver(es => {
    if (!es[0].isIntersecting || !UI.more || UI.shown >= UI.more.length) return;
    const next = UI.more.slice(UI.shown, UI.shown + 24); UI.shown += next.length;
    $("#rgrid").insertAdjacentHTML("beforeend", next.map(rcard).join("")); hydrate();
  }, {root:SC(), rootMargin:"600px"});
  moreObs.observe(el);
}
