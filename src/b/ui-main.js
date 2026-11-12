/* ═══ Biscuit · actions, événements, démarrage ═══ */
function toggleArr(a, k){ const i = a.indexOf(k); if (i >= 0) a.splice(i, 1); else a.push(k); }
function keepY(fn){ const sc = SC(), y = sc ? sc.scrollTop : 0; fn(); if (sc) sc.scrollTop = y; }
function cartSummary(){
  const d = listData(), nDone = d.toBuy.filter(it => S.checked[it.k]).length;
  const bar = $("#cartBar"), c = $("#cartCount");
  if (bar) bar.style.width = (d.toBuy.length ? nDone/d.toBuy.length*100 : 0) + "%";
  if (c) c.textContent = nDone + " sur " + d.toBuy.length + " dans le chariot · " + d.recipes.length + " repas";
  UI.badge = d.toBuy.length - nDone;
  const b = $('#tabbar .tab[data-tab="list"] .badge');
  if (b){ if (UI.badge){ b.textContent = UI.badge; b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); } else b.remove(); }
}
function settingsRefresh(dirty){ if (dirty) UI.dirty = true; save(); refreshSheet(openSettings); }
function regenWeek(){
  const ok = S.week && S.week.batch ? generateBatchWeek(batchDishes().order) : generateWeek();
  if (ok){ UI.enter = true; UI.lastTotal = null; UI.dirty = false; render(); SC().scrollTop = 0; toast("Nouvelle semaine prête"); buzz([8, 40, 8]); }
}
function doneShopping(){
  const recipes = weekIdx().filter(i => i >= 0).map(i => RX[i]);
  const items = buildList(recipes, S.people, true);
  S.week.stockBefore = JSON.parse(JSON.stringify(S.stock));
  for (const it of items){
    if (it.staple) continue;
    const g = it.g;
    if (!g.fl.includes("K")){ delete S.stock[it.k]; continue; }
    let bought = 0;
    if (it.buy > 1e-9) bought = g.fl.includes("W") ? (g.u === "pc" ? it.packs : it.buy) : it.packs * g.size;
    const left = (S.stock[it.k] || 0) + bought - it.need;
    if (left > 0.5) S.stock[it.k] = Math.round(left*100)/100; else delete S.stock[it.k];
  }
  S.week.done = true; save(); refreshPrices(); keepY(render);
  buzz([10, 50, 10]);
  openConfirm("Courses faites !", "Bien joué. Le reste des paquets est rangé dans ton placard pour la semaine prochaine.<br><br>Tu veux scanner ton ticket pour mettre les prix à jour ?",
    '<button class="btn caramel block" data-act="ticket">' + IC.scan + 'Scanner mon ticket</button><button class="btn block" data-act="close">Plus tard</button>');
}
function sheetRecipeRefresh(){ const st = sheetState; if (!st || st.kind !== "recipe") return; refreshSheet(() => openRecipe(st.rid, {slot:st.slot, people:st.people, from:st.from})); }

const A = {
  /* Navigation */
  tab: el => { buzz(5); go(el.dataset.tab); },
  settings: () => openSettings(),
  close: () => { closeSheet(); if (!FULL.kind) keepY(render); },
  "hint-close": () => { S.hints.biscuitOff = true; save(); hideBubble(); },
  day: el => { const d = +el.dataset.d; go("week"); setTimeout(() => { const b = $("#day-" + d); if (b){ b.scrollIntoView({block:"start", behavior: reduced() ? "auto" : "smooth"}); b.classList.add("pop"); } }, 60); },

  /* Semaine */
  "newweek-ask": () => openConfirm("Nouvelle semaine", "Je te prépare une semaine différente de celle-ci, toujours dans ton budget de " + eur(S.budget) + "." + (S.week && !S.week.done ? " Les cases cochées de ta liste seront remises à zéro." : ""),
    '<button class="btn primary block" data-act="newweek-go">' + IC.dice + 'Créer la nouvelle semaine</button><button class="btn block" data-act="close">Garder celle-ci</button>'),
  "newweek-go": () => { closeSheet(); regenWeek(); },
  applyweek: () => { UI.dirty = false; closeSheet(); regenWeek(); },
  wmode: el => {
    const k = el.dataset.k, cur = S.week && S.week.batch ? "batch" : "classic"; if (k === cur) return;
    openConfirm(k === "batch" ? "Passer en batch cooking ?" : "Revenir au mode classique ?",
      k === "batch" ? "Je choisis quelques plats qui se gardent bien, à cuisiner en une seule session, puis à réchauffer chaque jour en 3 minutes. Ta semaine actuelle sera remplacée." : "Je te prépare une semaine avec un plat différent à chaque repas. Ta semaine batch cooking sera remplacée.",
      '<button class="btn primary block" data-act="wmodego" data-k="' + k + '">' + IC.sparkle + (k === "batch" ? "Créer ma semaine batch cooking" : "Créer ma semaine classique") + '</button><button class="btn block" data-act="close">Garder ma semaine</button>');
  },
  wmodego: el => {
    closeSheet(); const ok = el.dataset.k === "batch" ? generateBatchWeek() : generateWeek();
    if (ok){ UI.enter = true; UI.lastTotal = null; render(); SC().scrollTop = 0; toast(el.dataset.k === "batch" ? "Semaine batch cooking prête" : "Semaine classique prête"); buzz([8, 40, 8]); }
  },
  bdays: el => {
    const d = +el.dataset.k; if (d === (S.batchDays || 5)) return;
    $$(".ndays button").forEach(b => b.setAttribute("aria-pressed", b === el ? "true" : "false"));
    S.batchDays = d; save(); buzz(6);
    if (S.week && S.week.batch){ const keep = batchDishes().order; setTimeout(() => { if (generateBatchWeek(keep)){ UI.lastTotal = null; keepY(render); toast("Batch cooking sur " + d + " jours"); } }, 200); }
  },
  swap: el => { UI.swapQ = ""; openSwap(+el.dataset.slot); },
  swapreroll: el => { UI.swapSeed++; buzz(6); const l = $("#swaplist"); if (l){ l.classList.remove("fade"); void l.offsetWidth; } refreshSheet(() => openSwap(+el.dataset.slot)); const l2 = $("#swaplist"); if (l2) l2.classList.add("fade"); },
  doswap: el => {
    const slot = +el.dataset.slot, r = RBYID[el.dataset.id]; if (!r) return;
    S.week.slots[slot].id = r.id; S.week.minCost = null; delete S.skipped[slotKey(S.week.slots[slot])]; save();
    closeSheet(); UI.pop = slot; keepY(render); buzz(10); toast("Remplacé par " + r.n);
  },
  bswap: el => { UI.swapQ = ""; openBatchSwap(el.dataset.id); },
  bswapreroll: el => { UI.swapSeed++; buzz(6); refreshSheet(() => openBatchSwap(el.dataset.id)); },
  bswapdo: el => {
    const from = el.dataset.from, to = el.dataset.id, r = RBYID[to]; if (!r) return;
    const {order, counts} = batchDishes();
    const set = order.map(id => RBYID[id === from ? to : id]).filter(Boolean), cnt = order.map(id => counts[id]);
    const keepP = {}; S.week.slots.forEach(s => { if (s.m === "P") keepP[s.d] = s.id; });
    fillBatchWeek(set, cnt, S.week.slots.map(s => ({d:s.d, m:s.m})), {keepP, start:S.week.start, keepProgress:true});
    if (S.batchDone) for (const k in S.batchDone) if (k.startsWith("st-" + from + "-") || k.startsWith("box-") || k.startsWith("mp-")) delete S.batchDone[k];
    S.week.sessionDone = false; save(); UI.pop = to; closeSheet(); keepY(render); buzz(10); toast("Remplacé par " + r.n);
  },
  session: () => openSession(),
  sessionclose: () => closeFull(),
  bdone: el => { S.batchDone = S.batchDone || {}; const k = el.dataset.k; if (S.batchDone[k]) delete S.batchDone[k]; else { S.batchDone[k] = 1; buzz(6); } save(); el.classList.toggle("done", !!S.batchDone[k]); sessionProgress(); },
  "bdone-reset": () => { S.batchDone = {}; S.week.sessionDone = false; save(); const el = $("#full"); el.innerHTML = sessionHTML(); hydrate(); },

  /* Repas mangé ou non */
  eaten: el => openReport(+el.dataset.slot),
  eatenset: el => {
    const s = S.week.slots[+el.dataset.slot], key = slotKey(s);
    if (el.dataset.v === "1") delete S.skipped[key]; else S.skipped[key] = 1;
    save(); closeSheet(); keepY(render); toast(el.dataset.v === "1" ? "Noté : mangé" : "Noté : pas mangé");
  },
  report: el => {
    const a = +el.dataset.slot, b = +el.dataset.to, w = S.week, sa = w.slots[a], sb = w.slots[b];
    const r = RBYID[sa.id]; [sa.id, sb.id] = [sb.id, sa.id];
    S.skipped[slotKey(sa)] = 1; delete S.skipped[slotKey(sb)]; save();
    closeSheet(); UI.pop = b; keepY(render); buzz(8);
    const ti = todayIndex(); toast(r.n + " : " + (sb.d === ti ? "ce " : sb.d === ti + 1 ? "demain " : fmtDay(dayDate(w.start, sb.d)) + " ") + MEALS[sb.m].toLowerCase());
  },

  /* Recette */
  open: el => openRecipe(el.dataset.id, {slot: el.dataset.slot != null ? +el.dataset.slot : undefined, people: el.dataset.people ? +el.dataset.people : undefined, from: el.dataset.people ? "tonight" : undefined}),
  fav: el => {
    const id = el.dataset.id, on = !S.favs.includes(id); toggleArr(S.favs, id); save(); buzz(on ? 10 : 5);
    sheetRecipeRefresh(); const b = $('#sheet [data-act="fav"]'); if (b && on && !reduced()) b.classList.add("bump");
    toast(on ? "Ajouté à tes favoris" : "Retiré de tes favoris", on ? IC.heartFill : IC.heart);
  },
  dislike: el => { const id = el.dataset.id, i = S.dislikes.indexOf(id); if (i >= 0){ S.dislikes.splice(i, 1); toast("Ce plat pourra de nouveau t'être proposé"); } else { S.dislikes.push(id); toast("Ce plat ne te sera plus proposé", IC.thumbsdown); } save(); sheetRecipeRefresh(); },
  rpeople: el => { const st = sheetState; if (!st) return; st.people = Math.max(1, Math.min(20, st.people + +el.dataset.d)); buzz(5); sheetRecipeRefresh(); },
  stepdone: (el, e) => { if (e && e.target.closest(".timer-chip")) return; const i = +el.dataset.i, st = sheetState; const j = st.done.indexOf(i); if (j >= 0) st.done.splice(j, 1); else { st.done.push(i); buzz(6); } el.classList.toggle("done"); },
  mep: el => { const i = +el.dataset.i, st = sheetState; const j = st.mep.indexOf(i); if (j >= 0) st.mep.splice(j, 1); else { st.mep.push(i); buzz(6); } el.classList.toggle("done"); },
  timer: el => startTimer(+el.dataset.min, el.dataset.label, ""),
  copyone: el => { const r = RBYID[el.dataset.id], p = +el.dataset.p || S.people; copyText(listText(buildList([r], p, false), r.n + " pour " + p), "Liste copiée"); },
  cook: el => {
    const id = el.dataset.id, st = sheetState;
    const people = el.dataset.p ? +el.dataset.p : (st && st.kind === "recipe" && st.rid === id ? st.people : S.people);
    openCook(id, {people, slot: el.dataset.slot != null ? +el.dataset.slot : (st && st.rid === id ? st.slot : undefined)});
  },

  /* Ce soir ? */
  tonight: () => { buzz(8); hideBubble(); S.hints.biscuitOff = true; save(); const m = $(".tab-mid"); if (m && !reduced()){ m.classList.remove("wiggle"); void m.offsetWidth; m.classList.add("wiggle"); } openTonight(); },
  tpeople: el => { S.tonight.people = Math.max(1, Math.min(20, S.tonight.people + +el.dataset.d)); save(); refreshSheet(() => openTonight()); },
  mood: el => { toggleArr(S.tonight.moods, el.dataset.k); UI.tonightSeed++; save(); buzz(5); refreshSheet(() => openTonight(true)); },
  reroll: () => { UI.tonightSeed++; buzz(8); refreshSheet(() => openTonight(true)); },

  /* Courses */
  lmode: el => { if (el.dataset.k === UI.listMode) return; segPick(el); UI.listMode = el.dataset.k; buzz(5); setTimeout(() => keepY(render), reduced() ? 0 : 200); },
  check: el => {
    const k = el.dataset.k, row = el.closest(".item"), on = !S.checked[k];
    if (on){ S.checked[k] = 1; buzz(8); } else delete S.checked[k];
    save();
    if (row){ row.classList.toggle("done", on); row.querySelectorAll('[data-act="check"]').forEach(b => b.setAttribute("aria-pressed", on)); }
    $$('.item[data-k="' + k + '"]').forEach(r2 => r2.classList.toggle("done", on));
    cartSummary();
  },
  tobuy: el => { const k = el.dataset.k; if (S.toBuy[k]) delete S.toBuy[k]; else S.toBuy[k] = 1; save(); refreshPrices(); buzz(6); keepY(render); },
  editprice: el => openPrice(el.dataset.k),
  saveprice: el => {
    const v = parseFloat(String($("#pv").value).replace(",", "."));
    if (!(v >= 0)){ toast("Entre un prix valide, par exemple 1,29", IC.close); const i = $("#pv"); if (i){ i.classList.remove("shake"); void i.offsetWidth; i.classList.add("shake"); } return; }
    S.prices[el.dataset.k] = Math.round(v*100)/100; save(); refreshPrices(); closeSheet(); keepY(render); toast("Prix enregistré");
  },
  pricedel: el => { delete S.prices[el.dataset.k]; save(); refreshPrices(); if (sheetState && sheetState.kind === "prices") refreshSheet(openPriceList); else { closeSheet(); } keepY(render); },
  copylist: () => { if (!S.week) return; const d = listData(); copyText(listText(d.items, "Courses Biscuit · " + store().n), "Liste copiée"); },
  done: () => doneShopping(),
  undodone: () => { if (S.week.stockBefore){ S.stock = S.week.stockBefore; delete S.week.stockBefore; } S.week.done = false; save(); refreshPrices(); keepY(render); },
  "store-open": () => { if (!S.week) return; openStore(); },
  storeclose: () => { closeStore(); },
  storedone: () => { closeStore(); setTimeout(doneShopping, 380); },
  sgo: el => { const i = +el.dataset.i; if (i === UI.store.i) return; UI.store.dir = i > UI.store.i ? 1 : -1; UI.store.i = i; UI.store.cart = false; buzz(5); storeRender(false); const s = $("#sscroll"); if (s) s.scrollTop = 0; },
  scheck: el => storeCheck(el),
  suncheck: el => { delete S.checked[el.dataset.k]; save(); buzz(5); storeRender(true); },
  scart: () => { UI.store.cart = !UI.store.cart; storeRender(true); },

  /* Ticket */
  ticket: () => openTicket(),
  ticketclose: () => closeFull(),
  tkpaste: () => { const t = ($("#tktext") || {}).value || ""; if (!t.trim()){ toast("Colle d'abord le texte du ticket", IC.close); return; } ticketFromText(t); },
  tkagain: () => { TK.status = "idle"; TK.lines = []; ticketRender(); },
  tkpick: el => openTicketPick(+el.dataset.j),
  tktoggle: el => { const l = TK.lines[+el.dataset.j]; l.on = !l.on; buzz(5); const sc = $("#full .fscroll"), y = sc ? sc.scrollTop : 0; ticketRender(); const s2 = $("#full .fscroll"); if (s2) s2.scrollTop = y; },
  tkset: el => {
    const l = TK.lines[sheetState.j], k = el.dataset.k; if (!l) return;
    Object.assign(l, {k, ign:false, old:packPrice(k)}); l.on = Math.abs(l.price - l.old) > 0.004; S.alias[normT(l.name)] = k; save();
    closeSheet(); const sc = $("#full .fscroll"), y = sc ? sc.scrollTop : 0; ticketRender(); const s2 = $("#full .fscroll"); if (s2) s2.scrollTop = y; toast("Associé à " + I[k].n);
  },
  tkignore: () => { const l = TK.lines[sheetState.j]; if (l) Object.assign(l, {k:null, ign:true, on:false}); closeSheet(); ticketRender(); },
  tkapply: () => { applyTicket(); keepY(render); },

  /* Mode cuisine */
  cookclose: () => closeCook(),
  cookings: () => openCookIngs(),
  cnext: () => cookGo(1),
  cprev: () => cookGo(-1),
  cjump: el => { closeSheet(); const j = +el.dataset.i; CK.dir = j >= CK.i ? 1 : -1; CK.i = j - (CK.dir > 0 ? 1 : -1); cookGo(CK.dir); },
  cmep: el => { const j = +el.dataset.i, i = CK.mepDone.indexOf(j); if (i >= 0) CK.mepDone.splice(i, 1); else { CK.mepDone.push(j); buzz(6); } el.classList.toggle("done"); },
  ctimer: el => { const r = RBYID[CK.rid]; startTimer(+el.dataset.min, r.n + " · étape " + (CK.i + 1), timerRef(CK.i)); refreshTimerCard(); },
  tpause: () => { pauseTimer(); refreshTimerCard(); },
  tstop: () => { stopTimer(); const p = $("#tpill"); if (p){ p.hidden = true; p.className = ""; } refreshTimerCard(); },
  tadd: () => { addTimer(60); buzz(5); },
  cookdone: () => { if (CK.slot != null && S.week && S.week.slots[CK.slot]){ delete S.skipped[slotKey(S.week.slots[CK.slot])]; save(); } closeCook(); toast("Bon appétit !"); },
  cookfav: () => { toggleArr(S.favs, CK.rid); save(); buzz(10); const el = $("#full"); el.innerHTML = cookHTML(); bindCookSwipe(); hydrate(); },

  /* Réglages */
  setstore: el => { S.store = el.dataset.k; refreshPrices(); buzz(5); settingsRefresh(false); keepY(render); },
  sbudget: el => { S.budget = Math.max(10, Math.min(500, S.budget + 5 * +el.dataset.d)); settingsRefresh(true); keepY(render); },
  speople: el => { S.people = Math.max(1, Math.min(12, S.people + +el.dataset.d)); settingsRefresh(true); keepY(render); },
  sdays: el => { S.days = Math.max(1, Math.min(7, S.days + +el.dataset.d)); settingsRefresh(true); },
  smeal: el => { const k = el.dataset.k; S.meals[k] = !S.meals[k]; if (!S.meals.P && !S.meals.M && !S.meals.S){ S.meals[k] = true; toast("Garde au moins un repas", IC.close); return; } buzz(5); settingsRefresh(true); },
  sdiet: el => { segPick(el); S.diet = el.dataset.k; setTimeout(() => settingsRefresh(true), 180); },
  sallergy: el => { toggleArr(S.allergies, el.dataset.k); settingsRefresh(true); },
  scuisine: el => { toggleArr(S.cuisines, el.dataset.k); if (!S.cuisines.length) S.cuisines.push(el.dataset.k); settingsRefresh(true); },
  stheme: el => { S.theme = el.dataset.k; save(); applyTheme(); buzz(5); $$('[data-act="stheme"]').forEach(b => b.setAttribute("aria-checked", b === el ? "true" : "false")); },
  smotion: el => { S.reduceMotion = !S.reduceMotion; el.setAttribute("aria-checked", S.reduceMotion); save(); applyTheme(); },
  pricesheet: () => openPriceList(),
  stocksheet: () => openStockList(),
  stockdel: el => { delete S.stock[el.dataset.k]; save(); refreshPrices(); refreshSheet(openStockList); keepY(render); },
  backup: () => backupData(),
  restore: () => openRestore(),
  restorefile: () => { const f = $("#sheet #restoreFile"); if (f) f.click(); },
  restoretext: () => { const t = ($("#imp") || {}).value || ""; if (!t.trim()){ toast("Colle d'abord ta sauvegarde", IC.close); return; } restoreFrom(t); },
  resetask: () => openConfirm("Tout effacer ?", "Ta semaine, tes recettes, tes prix et ton placard seront supprimés de ce téléphone. Pense à sauvegarder avant.",
    '<button class="btn block" data-act="resetgo" style="background:var(--warn);color:#fff">' + IC.trash + 'Oui, tout effacer</button><button class="btn block" data-act="settings">Annuler</button>'),
  resetgo: () => { S = DEFAULT(); S.launches = 1; save(); rebuild(); applyTheme(); closeSheet(); UI.tab = "today"; render(); showOnboarding(); },

  /* Ma recette */
  newrecipe: () => openRecipeForm(null),
  editrecipe: el => openRecipeForm(el.dataset.id),
  fmeal: el => { const d = sheetState.d, k = el.dataset.k; d.m = d.m.includes(k) ? d.m.replace(k, "") : d.m + k; el.setAttribute("aria-checked", d.m.includes(k)); buzz(5); },
  fdiff: el => { segPick(el); sheetState.d.d = +el.dataset.k; },
  fiadd: () => { sheetState.d.i.push(["", 0]); renderForm(); },
  fidel: el => { sheetState.d.i.splice(+el.dataset.j, 1); if (!sheetState.d.i.length) sheetState.d.i.push(["", 0]); renderForm(); },
  niadd: () => {
    const n = $("#ni-n").value.trim(), u = $("#ni-u").value, s = parseFloat($("#ni-s").value), p = parseFloat(String($("#ni-p").value).replace(",", ".")), r = $("#ni-r").value;
    if (!n || !(s > 0) || !(p >= 0)){ toast("Remplis le nom, la taille et le prix du paquet.", IC.close); return; }
    const k = "perso_" + Date.now().toString(36);
    S.customIng[k] = [n, u, s, p, r, ""]; save(); rebuild();
    const d = sheetState.d, empty = d.i.findIndex(x => !x[0]);
    if (empty >= 0) d.i[empty] = [k, 0]; else d.i.push([k, 0]);
    renderForm(); toast("Ingrédient créé");
  },
  fsave: () => {
    const d = sheetState.d;
    const ings = d.i.filter(x => x[0] && I[x[0]] && x[1] > 0).map(x => [x[0], +x[1]]);
    const steps = d.s.split("\n").map(s => s.trim()).filter(Boolean);
    const err = !d.n.trim() ? "Donne un nom à ta recette." : !d.m ? "Choisis au moins un repas." : !ings.length ? "Ajoute au moins un ingrédient avec sa quantité." : !steps.length ? "Écris au moins une étape." : "";
    if (err){ $("#ferr").innerHTML = '<div class="hint" style="background:var(--warn-tint);color:var(--warn-text)">' + IC.close + "<span>" + err + "</span></div>"; $("#ferr").scrollIntoView({block:"center", behavior: reduced() ? "auto" : "smooth"}); return; }
    const id = sheetState.id || "perso-" + Date.now().toString(36);
    const arr = [id, d.n.trim(), d.e || "🍽️", d.c, ["P","M","S"].filter(m => d.m.includes(m)).join(""), d.d, Math.max(1, +d.t || 20), "", ings, steps, (d.ph || "").trim()];
    const i = S.custom.findIndex(a => a[0] === id);
    if (i >= 0) S.custom[i] = arr; else S.custom.push(arr);
    save(); rebuild(); UI.tab = "recipes"; UI.rf = "mine"; render(); toast("Recette enregistrée"); openRecipe(id);
  },
  fdelete: () => {
    const id = sheetState.id; S.custom = S.custom.filter(a => a[0] !== id);
    if (S.week) S.week.slots.forEach(s => { if (s.id === id){ const alt = RX.find(r => !r.custom && r.m.includes(s.m) && allowed(r)); if (alt) s.id = alt.id; } });
    save(); rebuild(); closeSheet(); if (UI.rf === "mine" && !S.custom.length) UI.rf = "all"; keepY(render); toast("Recette supprimée");
  },
  rf: el => { if (UI.rf === el.dataset.k) return; UI.rf = el.dataset.k; $$('[data-act="rf"]').forEach(b => b.setAttribute("aria-pressed", b === el)); buzz(4); setTimeout(() => keepY(render), 0); },

  /* Premier lancement */
  obstore: el => { S.store = el.dataset.k; OB.picked = true; save(); $$(".storeb").forEach(b => b.setAttribute("aria-pressed", b === el ? "true" : "false")); buzz(8); const n = $('#obf [data-act="obnext"]'); if (n) n.disabled = false; setTimeout(() => { if (OB.step === 1){ OB.step = 2; OB.dir = 1; renderOB(); } }, reduced() ? 0 : 320); },
  obnext: () => { OB.step++; OB.dir = 1; renderOB(); },
  obback: () => { OB.step--; OB.dir = -1; renderOB(); },
  obbudget: el => { S.budget = Math.max(5, Math.min(500, (+S.budget || 0) + +el.dataset.d)); save(); const i = $("#obb"); if (i){ i.value = S.budget; i.classList.remove("bump"); void i.offsetWidth; i.classList.add("bump"); } buzz(4); refreshFeas(); },
  obpeople: el => { S.people = Math.max(1, Math.min(12, S.people + +el.dataset.d)); save(); const o = el.parentNode.querySelector("output"); if (o) o.textContent = S.people; buzz(4); refreshFeas(); },
  obmeal: el => { const k = el.dataset.k; S.meals[k] = !S.meals[k]; el.setAttribute("aria-checked", S.meals[k]); save(); buzz(5); refreshFeas(); },
  obdays: el => { segPick(el); S.days = +el.dataset.k; save(); refreshFeas(); },
  obdiet: el => { segPick(el); S.diet = el.dataset.k; save(); feasCache = {}; },
  oballergy: el => { toggleArr(S.allergies, el.dataset.k); el.setAttribute("aria-pressed", S.allergies.includes(el.dataset.k)); feasCache = {}; save(); },
  obcuisine: el => { toggleArr(S.cuisines, el.dataset.k); if (!S.cuisines.length) S.cuisines.push(el.dataset.k); el.setAttribute("aria-pressed", S.cuisines.includes(el.dataset.k)); feasCache = {}; save(); },
  obfinish: () => obFinish()
};

/* ── Événements ── */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  if (el.tagName === "A") return;
  const fn = A[el.dataset.act]; if (!fn) return;
  if (el.disabled) return;
  e.preventDefault(); fn(el, e);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape"){
    if (SH.open){ closeSheet(); if (!FULL.kind) keepY(render); return; }
    if (FULL.kind === "cook") return closeCook();
    if (FULL.kind === "store") return closeStore();
    if (FULL.kind) return closeFull();
  }
  if (FULL.kind === "cook" && !SH.open && !e.target.closest("input,textarea")){
    if (e.key === "ArrowRight"){ e.preventDefault(); cookGo(1); }
    if (e.key === "ArrowLeft"){ e.preventDefault(); cookGo(-1); }
  }
  if ((e.key === "Enter" || e.key === " ") && e.target.matches('[role="button"][data-act]')){ e.preventDefault(); const fn = A[e.target.dataset.act]; if (fn) fn(e.target, e); }
});
document.addEventListener("input", e => {
  const el = e.target, k = el.dataset.in; if (!k) return;
  if (k === "rq"){ UI.q = el.value; clearTimeout(UI.qt); UI.qt = setTimeout(() => { const pos = el.selectionStart; render(); const n = $("#rq"); if (n){ n.focus(); try { n.setSelectionRange(pos, pos); } catch(_){} } }, 120); }
  else if (k === "sq"){
    UI.swapQ = el.value; const slot = sheetState.slot;
    if (!UI.swapQ.trim()){ refreshSheet(() => openSwap(slot)); const n = $("#sq"); if (n) n.focus(); return; }
    $("#swaplist").innerHTML = swapListHTML(slot, [], swapScored(slot, true), normW(UI.swapQ.trim())); hydrate();
  }
  else if (k === "bsq"){
    UI.swapQ = el.value; const id = sheetState && sheetState.id; if (!id) return;
    if (!UI.swapQ.trim()){ refreshSheet(() => openBatchSwap(id)); const n = $("#bsq"); if (n) n.focus(); return; }
    $("#swaplist").innerHTML = batchSwapList(id, [], batchSwapScored(id), normW(UI.swapQ.trim())); hydrate();
  }
  else if (k === "tkq"){ const l = $("#tkpl"); if (l) l.innerHTML = tkPickList(el.value.trim()); }
  else if (k === "sname"){ S.name = el.value.trim().slice(0, 30); save(); }
  else if (k === "stime"){ if (/^\d{2}:\d{2}$/.test(el.value)){ S.times[el.dataset.k] = el.value; save(); } }
  else if (k === "obb"){ const v = parseFloat(el.value); if (v > 0){ S.budget = Math.min(500, v); save(); refreshFeas(); } }
  else if (k === "stock"){ const v = parseFloat(el.value); if (v >= 0){ S.stock[el.dataset.k] = v; save(); refreshPrices(); } }
  else if (sheetState && sheetState.kind === "form"){
    const d = sheetState.d;
    if (k === "fn") d.n = el.value; else if (k === "fp") d.ph = el.value; else if (k === "fc2") d.c = el.value;
    else if (k === "ft") d.t = +el.value; else if (k === "fs") d.s = el.value;
    else if (k === "fq") d.i[+el.dataset.j][1] = parseFloat(el.value) || 0;
    else if (k === "fi"){ const j = +el.dataset.j, name = el.value.trim().toLowerCase(); const key = IKEYS.find(x => I[x].n.toLowerCase() === name); d.i[j][0] = key || ""; d.i[j][2] = el.value; }
  }
});
document.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.in === "tkfile"){ const f = el.files && el.files[0]; if (f) ticketFromFile(f); el.value = ""; return; }
  if (el.id === "restoreFile"){ const f = el.files && el.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => restoreFrom(String(rd.result || "")); rd.onerror = () => toast("Impossible de lire ce fichier", IC.close); rd.readAsText(f); el.value = ""; return; }
  if (el.dataset.in === "fi" || el.dataset.in === "fc2"){ if (sheetState && sheetState.kind === "form") renderForm(); }
  if (el.dataset.in === "sname" || el.dataset.in === "stime" || el.dataset.in === "stock") keepY(render);
});

/* ── Démarrage ── */
function start(){
  rebuild(); shell(); applyTheme();
  S.launches = (S.launches || 0) + 1; save();
  if (S.onboarded && !S.week) generateWeek();
  render(); timerLoop();
  showSplash(() => { if (!S.onboarded) showOnboarding(); });
}
start();
window.__biscuit = {get S(){ return S; }, generateWeek, generateBatchWeek, weekTotal, minCostEstimate, buildList, RX:() => RX, I:() => I, render, go, GX, A, openCook, openRecipe, openStore, openTicket, ticketFromText};
