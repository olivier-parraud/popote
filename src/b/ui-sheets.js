/* ═══ Biscuit · feuilles (recette, changer un plat, ce soir, réglages…) ═══ */
const phead = (title, right) => '<div class="phead"><h2 class="h1">' + esc(title) + "</h2>" + (right != null ? right : '<button class="iconb press" data-act="close" aria-label="Fermer">' + IC.close + "</button>") + "</div>";
const okBtn = '<button class="btn primary sm" data-act="close">OK</button>';

/* ── Fiche recette ── */
function keepInfo(r){
  const D = typeof DETAILS !== "undefined" ? DETAILS[r.id] : null, info = batchInfo(r);
  if (info.fridge) return [info.fridge + " jour" + (info.fridge > 1 ? "s" : ""), "au frigo"];
  if (info.freeze) return ["Oui", "se congèle"];
  const k = (D && D.keep) || "", m = k.match(/(\d+)\s*(jours?|semaines?)/);
  if (m) return [m[1] + " " + m[2].replace(/s$/, "") + (+m[1] > 1 ? "s" : ""), "se garde"];
  return ["Minute", "à manger tout de suite"];
}
function openRecipe(id, opts){
  const r = RBYID[id]; if (!r) return;
  opts = opts || {};
  const people = opts.people || (sheetState && sheetState.rid === id && sheetState.people) || (r.tg.includes("g") && opts.slot == null ? 8 : S.people);
  const stt = {kind:"recipe", rid:id, people, slot:opts.slot, from:opts.from, done:(sheetState && sheetState.rid === id && sheetState.done) || [], mep:(sheetState && sheetState.rid === id && sheetState.mep) || []};
  const fav = S.favs.includes(id), hid = S.dislikes.includes(id);
  const D = (typeof DETAILS !== "undefined" && DETAILS[id]) || null;
  const steps = D ? D.steps : r.s;
  const veg = !r.F.v && !r.F.f && !r.F.c;
  const alg = Object.keys(ALLERGENS).filter(a => r.F[a]).map(a => ALLERGENS[a].toLowerCase());
  const kp = keepInfo(r);
  let h = '<div class="rhero">' + photo(r, "hero") + '<div class="top"><button class="iconb white press" data-act="close" aria-label="Fermer">' + IC.back + "</button><div>" +
    '<button class="iconb white press" data-act="fav" data-id="' + esc(id) + '" aria-pressed="' + fav + '" aria-label="' + (fav ? "Retirer des favoris" : "Ajouter aux favoris") + '" style="color:' + (fav ? "var(--green)" : "#1A1A18") + '">' + (fav ? IC.heartFill : IC.heart) + "</button>" +
    (opts.slot != null ? '<button class="iconb white press" data-act="swap" data-slot="' + opts.slot + '" aria-label="Changer ce plat">' + IC.swap + "</button>" : "") + "</div></div></div>";
  h += '<div class="rsheet"><div style="display:flex;flex-direction:column;gap:10px"><div class="chips">' + CUIS_TAG(r.c) + (veg ? '<span class="tag green">Végé</span>' : "") + '<span class="tag green">' + DIFF[r.d] + "</span>" + (r.tg.includes("d") ? '<span class="tag caramel">Dessert</span>' : "") + "</div>" +
    '<h1 class="h1" style="font-size:34px">' + esc(r.n) + "</h1>" + (D && D.tips && D.tips[0] && D.tips[0].length < 140 ? '<p style="margin:0;line-height:1.5;color:var(--ink2)">' + esc(D.tips[0]) + "</p>" : "") +
    '<p class="note" id="credit" data-cid="' + esc(id) + '" style="font-size:11.5px"></p></div>';
  h += '<div class="stats3"><div><b>' + timeLabel(r.t) + '</b><span>en tout</span></div><div class="c2"><b>' + eur(r.cost) + '</b><span>' + (r.tg.includes("d") ? "la part" : "par personne") + '</span></div><div class="c3"><b>' + kp[0] + "</b><span>" + kp[1] + "</span></div></div>";
  const unit = r.tg.includes("d") ? " part" : " personne";
  h += '<div class="pillrow"><span>Pour ' + people + unit + (people > 1 ? "s" : "") + "</span>" + stepper("rpeople", people, "Une part de moins", "Une part de plus") + "</div>";
  // Ingrédients
  h += '<section class="sec"><h2 class="h2" style="font-size:23px">Ingrédients</h2><div class="ings">' +
    r.i.filter(([k]) => k !== "eau").map(([k,q]) => '<div class="ing' + (I[k].fl.includes("S") ? " pl" : "") + '"><b>' + qtyLabel(k, q*people) + "</b><span>" + esc(I[k].n) + "</span></div>").join("") + "</div>" +
    '<p class="note">Les tuiles beiges sont au placard.' + (alg.length ? " Contient : " + alg.join(", ") + "." : "") + (D && D.mat ? " Matériel : " + esc(D.mat.replace(/\.$/,"").toLowerCase()) + "." : "") + "</p></section>";
  // Mise en place
  const mep = miseEnPlace(r.i.map(([k,q]) => [k, q*people]));
  if (mep.rows.length){
    h += '<section class="sec"><h2 class="h2">Avant d\'allumer le feu</h2><div class="checklist">' + mep.rows.map((row, i) =>
      '<button class="ck' + (stt.mep.includes(i) ? " done" : "") + '" data-act="mep" data-i="' + i + '">' + box(stt.mep.includes(i)) + '<span class="t"><b>' + qtyLabel(row.k, row.q) + "</b> · " + esc(I[row.k].n) + "<small>" + row.verb + "</small></span></button>").join("") + "</div></section>";
  }
  // Étapes
  const ann = annotateSteps(r, steps, people);
  h += '<section class="sec"><div class="sec-h"><h2 class="h2" style="font-size:23px">Étapes</h2><span class="r"><span>' + steps.length + " étapes</span></span></div><div class=\"steps\">" +
    steps.map((s, i) => { const m = timerOf(s); return '<div class="step' + (stt.done.includes(i) ? " done" : "") + '" data-act="stepdone" data-i="' + i + '" role="button" tabindex="0"><span class="n">' + (i+1) + '</span><div class="tx"><span>' + ann[i] + "</span>" +
      (m ? '<button class="timer-chip press" data-act="timer" data-min="' + m + '" data-label="' + esc(r.n) + " · étape " + (i+1) + '">' + IC.clock + "Minuteur " + timeLabel(m) + "</button>" : "") + "</div></div>"; }).join("") + "</div>" +
    '<p class="note">Touche une étape quand elle est faite. Sel et poivre selon ton goût.</p></section>';
  if (D && D.tips && D.tips.length > (D.tips[0].length < 140 ? 1 : 0)) h += '<div class="tips"><b>ASTUCES</b>' + D.tips.slice(D.tips[0].length < 140 ? 1 : 0).map(t => "<span>" + esc(t) + "</span>").join("") + "</div>";
  if (D && D.keep) h += '<div class="tips" style="background:var(--green-tint);color:var(--green-ink)"><b>CONSERVATION</b><span>' + esc(D.keep) + "</span></div>";
  if (stt.from === "tonight"){
    const items = buildList([r], people, false).filter(it => !it.staple);
    h += '<section class="sec"><div class="sec-h"><h2 class="h2">Courses pour ' + people + '</h2><span class="r tnum">' + eur(items.reduce((s,it) => s + it.cost, 0)) + '</span></div><div class="aisle"><div class="items">' +
      items.map(it => '<div class="item"><span></span><span style="min-width:0;display:flex;flex-direction:column"><span class="nm">' + esc(it.g.n) + '</span><span class="q">' + qtyLabel(it.k, it.need) + " · " + packLabel(it) + '</span></span><span class="pr">' + eur(it.cost) + "</span></div>").join("") +
      '</div></div><button class="btn block" data-act="copyone" data-id="' + esc(id) + '" data-p="' + people + '">' + IC.copy + "Copier cette liste</button></section>";
  }
  h += '<div class="chips"><a class="chip" href="' + videoURL(r.n) + '" target="_blank" rel="noopener">' + IC.video + 'Vidéos</a><a class="chip" href="https://www.marmiton.org/recettes/recherche.aspx?aqt=' + encodeURIComponent(r.n) + '" target="_blank" rel="noopener">' + IC.search + "Marmiton</a>" +
    '<button class="chip" data-act="dislike" data-id="' + esc(id) + '">' + IC.thumbsdown + (hid ? "Reproposer ce plat" : "Ne plus proposer") + "</button>" + (r.custom ? '<button class="chip" data-act="editrecipe" data-id="' + esc(id) + '">' + IC.edit + "Modifier</button>" : "") + "</div><div style=\"height:8px\"></div></div>";
  h += '<div class="pfoot"><button class="btn primary" style="flex:1" data-act="cook" data-id="' + esc(id) + '"' + (opts.slot != null ? ' data-slot="' + opts.slot + '"' : "") + ' data-p="' + people + '">' + IC.play + "C'est parti, mode cuisine</button>" +
    '<a class="iconb press" style="width:52px;height:52px;background:var(--ink);color:var(--bg)" href="' + videoURL(r.n) + '" target="_blank" rel="noopener" aria-label="Voir des vidéos">' + IC.video + "</a></div>";
  openSheet(h, {state:stt, label:r.n, cls:"dark-grab"});
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
function pickRows(list, act, extra){
  return '<div class="picks">' + list.map(x => '<button class="pick" data-act="' + act + '" data-id="' + esc(x.r.id) + '"' + extra + ">" + photo(x.r, "") +
    '<span style="min-width:0;display:flex;flex-direction:column;gap:2px"><span class="n">' + esc(x.r.n) + '</span><span class="m">' + esc(x.m || (timeLabel(x.r.t) + " · " + DIFF[x.r.d])) + '</span></span><span class="r"><span class="tnum">' + eur(x.r.cost) + "</span>" + deltaTag(x.d) + "</span></button>").join("") + "</div>";
}
function openSwap(slot){
  const w = S.week, s = w.slots[slot], cur = RBYID[s.id];
  const scored = swapScored(slot, false);
  const fits = scored.filter(x => x.t <= S.budget + 0.01);
  const src = fits.length >= 6 ? fits : scored.slice().sort((a,b) => a.t - b.t).slice(0, 24);
  const sugg = shuffleWithSeed(src, UI.swapSeed + slot*31).slice(0, 6);
  let h = phead("Changer ce plat") + '<div class="pbody"><p class="note">' + MEALS[s.m] + " · " + esc(fmtDay(dayDate(w.start, s.d))) + ". Actuellement : <b>" + esc(cur ? cur.n : "") + "</b></p>";
  h += '<div class="search">' + IC.search + '<label class="sr" for="sq">Chercher une recette</label><input class="input" id="sq" type="search" placeholder="Chercher un plat" value="' + esc(UI.swapQ) + '" data-in="sq" autocomplete="off"></div>';
  h += '<div id="swaplist">' + swapListHTML(slot, sugg, scored, normW(UI.swapQ.trim())) + "</div></div>";
  openSheet(h, {state:{kind:"swap", slot}, label:"Changer ce plat"});
}
function swapListHTML(slot, sugg, scored, q){
  let list = sugg, h = '<div class="sec">';
  if (q){ list = scored.filter(x => normW(x.r.n).includes(q)).slice(0, 30); h += '<div class="sec-h"><span class="kicker">' + list.length + " résultat" + (list.length > 1 ? "s" : "") + "</span></div>"; }
  else h += '<div class="sec-h"><span class="kicker">Dans ton budget</span><button class="btn ghost sm dice" data-act="swapreroll" data-slot="' + slot + '">' + IC.dice + "Autres idées</button></div>";
  h += list.length ? pickRows(list, "doswap", ' data-slot="' + slot + '"') : '<p class="note">Aucun plat ne correspond.</p>';
  if (!q) h += '<p class="note">Le montant en vert ou orange indique ce que ça change sur tes courses.</p>';
  return h + "</div>";
}
function openBatchSwap(curId){
  const cur = RBYID[curId], n = batchDishes().counts[curId] || 0;
  const scored = batchSwapScored(curId);
  const fits = scored.filter(x => x.t <= S.budget + 0.01);
  const src = fits.length >= 6 ? fits : scored.slice().sort((a,b) => a.t - b.t).slice(0, 24);
  const sugg = shuffleWithSeed(src, UI.swapSeed + curId.length*17).slice(0, 6).map(x => ({...x, m: timeLabel(x.r.t) + " · " + (batchInfo(x.r).freeze ? "se congèle" : batchInfo(x.r).fridge + " j au frigo")}));
  let h = phead("Changer ce plat") + '<div class="pbody"><p class="note">Actuellement : <b>' + esc(cur ? cur.n : "") + "</b>, prévu pour " + n + " repas. Le plat choisi le remplace sur tous ces repas.</p>";
  h += '<div class="search">' + IC.search + '<label class="sr" for="bsq">Chercher</label><input class="input" id="bsq" type="search" placeholder="Un plat qui se conserve" value="' + esc(UI.swapQ) + '" data-in="bsq" autocomplete="off"></div>';
  h += '<div id="swaplist">' + batchSwapList(curId, sugg, scored, normW(UI.swapQ.trim())) + "</div></div>";
  openSheet(h, {state:{kind:"bswap", id:curId}, label:"Changer ce plat"});
}
function batchSwapList(curId, sugg, scored, q){
  let list = sugg, h = '<div class="sec">';
  if (q){ list = scored.filter(x => normW(x.r.n).includes(q)).slice(0, 30).map(x => ({...x, m: timeLabel(x.r.t) + " · " + (batchInfo(x.r).freeze ? "se congèle" : batchInfo(x.r).fridge + " j au frigo")})); h += '<div class="sec-h"><span class="kicker">' + list.length + " résultats</span></div>"; }
  else h += '<div class="sec-h"><span class="kicker">Se gardent bien</span><button class="btn ghost sm dice" data-act="bswapreroll" data-id="' + esc(curId) + '">' + IC.dice + "Autres idées</button></div>";
  h += list.length ? pickRows(list, "bswapdo", ' data-from="' + esc(curId) + '"') : '<p class="note">Aucun plat de batch cooking ne correspond.</p>';
  return h + "</div>";
}

/* ── Ce soir, on mange quoi ? ── */
function openTonight(roll){
  const t = S.tonight;
  const {list, relaxed} = tonightCandidates();
  const pick = shuffleWithSeed(list, UI.tonightSeed + 7).slice(0, 3);
  let h = phead("Ce soir, on mange quoi ?") + '<div class="pbody">';
  h += '<div class="pillrow"><span>On est combien ?</span>' + stepper("tpeople", t.people, "Une personne de moins", "Une personne de plus") + "</div>";
  h += '<div class="sec"><span style="font-weight:700">Tes envies</span><div class="chips" role="group" aria-label="Envies">' + Object.entries(MOODS).map(([k,n]) => '<button class="chip" data-act="mood" data-k="' + k + '" aria-pressed="' + t.moods.includes(k) + '">' + n + "</button>").join("") + "</div></div>";
  h += '<div class="sec"><div class="sec-h"><h2 class="h2">' + pick.length + " idée" + (pick.length > 1 ? "s" : "") + " pour " + t.people + '</h2><button class="btn tint sm dice" data-act="reroll">' + IC.dice + 'Autres idées</button></div><div class="sec ideas' + (roll ? " spin" : "") + '">' +
    pick.map(r => '<button class="idea" data-act="open" data-id="' + esc(r.id) + '" data-people="' + t.people + '">' + photo(r, "") + '<span style="min-width:0;display:flex;flex-direction:column;gap:3px"><span class="n">' + esc(r.n) + '</span><span class="m">' + timeLabel(r.t) + " · " + DIFF[r.d] + (!r.F.v && !r.F.f && !r.F.c ? " · Végé" : "") + '</span><span class="p">' + eur(r.cost*t.people) + " pour " + t.people + "</span></span>" + IC.chev + "</button>").join("") +
    "</div>" + (relaxed ? '<p class="note">Pas assez de plats pour toutes tes envies : j\'en ai assoupli une.</p>' : "") + "</div></div>";
  openSheet(h, {state:{kind:"tonight"}, label:"Ce soir, on mange quoi ?"});
}

/* ── Prix ── */
function openPrice(k){
  const g = I[k];
  const h = phead("Corriger un prix") + '<div class="pbody"><p style="margin:0;line-height:1.5">Prix de <b>' + esc(g.n) + "</b> chez " + esc(store().n) + ", pour " + priceBasis(g) + '.</p><div class="bigbudget"><label class="sr" for="pv">Prix</label><input id="pv" class="input" type="number" min="0" step="0.01" inputmode="decimal" value="' + packPrice(k).toFixed(2) + '" style="width:150px;height:72px;font-family:var(--f-head);font-size:38px;font-weight:800;text-align:center" data-autofocus><span style="font-family:var(--f-head);font-size:34px;font-weight:800">€</span></div>' +
    '<p class="note" style="text-align:center">Estimation de départ : ' + eur(g.price*store().k) + '</p><button class="btn primary block" data-act="saveprice" data-k="' + k + '">Enregistrer</button>' + (S.prices[k] != null ? '<button class="btn block" data-act="pricedel" data-k="' + k + '">Revenir à l\'estimation</button>' : "") + "</div>";
  openSheet(h, {state:{kind:"price", k}, fit:true, label:"Corriger un prix"});
}

/* ── Confirmations ── */
function openConfirm(title, text, btns){
  openSheet(phead(title) + '<div class="pbody"><p style="margin:0;line-height:1.5">' + text + '</p><div style="display:flex;flex-direction:column;gap:8px">' + btns + "</div></div>", {state:{kind:"confirm"}, fit:true, label:title});
}
function openReport(slot){
  const s = S.week.slots[slot], r = RBYID[s.id], key = slotKey(s), skipped = !!S.skipped[key];
  const ti = todayIndex();
  const fut = S.week.slots.map((x, i) => ({...x, i})).filter(x => x.m !== "P" && (x.d > ti || (x.d === ti && !slotPast(x)))).slice(0, 3);
  let b = skipped ? '<button class="btn primary block" data-act="eatenset" data-slot="' + slot + '" data-v="1">Finalement, je l\'ai mangé</button>'
                  : fut.map(x => '<button class="btn tint block" data-act="report" data-slot="' + slot + '" data-to="' + x.i + '">Le reporter à ' + esc((x.d === ti ? "ce " : x.d === ti + 1 ? "demain " : fmtDay(dayDate(S.week.start, x.d)) + " ") + MEALS[x.m].toLowerCase()) + "</button>").join("") +
                    '<button class="btn block" data-act="eatenset" data-slot="' + slot + '" data-v="0">Pas mangé, on oublie</button>';
  b += '<button class="btn ghost" data-act="open" data-id="' + esc(r.id) + '" data-slot="' + slot + '">Voir la recette</button>';
  openConfirm(esc(r.n), skipped ? "Tu avais indiqué ne pas l'avoir mangé." : "Tu l'as mangé ? Sinon, je peux le décaler : le plat prévu à ce moment-là passera à sa place.", b);
}

/* ── Réglages ── */
function openSettings(){
  const p = S;
  let h = phead("Réglages", okBtn) + '<div class="pbody">';
  if (UI.dirty && S.week) h += '<div class="hint" style="background:var(--green-tint);color:var(--green-ink);align-items:center">' + IC.sparkle + '<span style="flex:1">Tes réglages ont changé.</span><button class="btn primary xs" data-act="applyweek">Refaire ma semaine</button></div>';
  h += '<section><div class="gh">Ton prénom</div><input class="input" id="sname" data-in="sname" value="' + esc(p.name || "") + '" placeholder="Pour te dire bonjour (facultatif)" autocomplete="given-name"></section>';
  h += '<section><div class="gh">Mon magasin</div><div class="group" style="padding:12px"><div class="chips">' + STORES.map(s => '<button class="chip" data-act="setstore" data-k="' + s.id + '" aria-pressed="' + (p.store === s.id) + '" style="padding-left:5px">' + storeLogo(s, "sm") + esc(s.n) + "</button>").join("") + '</div></div><div class="gf">Les prix sont estimés pour cette enseigne. Corrige-les depuis la liste de courses ou en scannant un ticket.</div></section>';
  h += '<section><div class="gh">Ma semaine</div><div class="group">' +
    '<div class="row"><span class="grow"><span class="lbl">Budget</span><span class="sub2">par semaine</span></span>' + stepper("sbudget", eur(p.budget).replace(",00",""), "Budget moins 5 €", "Budget plus 5 €") + "</div>" +
    '<div class="row"><span class="grow"><span class="lbl">Personnes</span><span class="sub2">à chaque repas</span></span>' + stepper("speople", p.people, "Une personne de moins", "Une personne de plus") + "</div>" +
    '<div class="row"><span class="grow"><span class="lbl">Jours</span><span class="sub2">à prévoir</span></span>' + stepper("sdays", p.days, "Un jour de moins", "Un jour de plus") + "</div></div></section>";
  h += '<section><div class="gh">Mes repas</div><div class="group">' + ["P","M","S"].map(m => '<div class="row"><span class="grow"><span class="lbl">' + ({P:"Petit-déjeuner", M:"Midi", S:"Soir"})[m] + "</span></span>" +
    (p.meals[m] ? '<label class="sr" for="tm-' + m + '">Heure</label><input class="input" type="time" id="tm-' + m + '" data-in="stime" data-k="' + m + '" value="' + esc(p.times[m] || "12:00") + '" style="width:96px;height:38px;padding:0 10px;text-align:center;font-weight:700">' : "") + sw("smeal", m, p.meals[m], MEALS[m]) + "</div>").join("") + '</div><div class="gf">Les heures servent à l\'accueil : savoir ce qui vient ensuite et quand sortir les plats.</div></section>';
  h += '<section><div class="gh">Ce que je mange</div>' + seg("sdiet", Object.entries(DIETS).map(([k,n]) => [k, n.replace("Je mange de tout","Tout")]), p.diet, "sm") +
    '<div class="gh" style="margin-top:14px">Allergies</div><div class="chips">' + Object.entries(ALLERGENS).map(([k,n]) => '<button class="chip" data-act="sallergy" data-k="' + k + '" aria-pressed="' + p.allergies.includes(k) + '">Sans ' + n.toLowerCase() + "</button>").join("") + '</div><div class="gf">Repérées d\'après les ingrédients. Vérifie toujours les étiquettes.</div>' +
    '<div class="gh" style="margin-top:14px">Cuisines proposées</div><div class="chips">' + Object.entries(CUISINES).map(([k,c]) => '<button class="chip" data-act="scuisine" data-k="' + k + '" aria-pressed="' + p.cuisines.includes(k) + '">' + c.n + "</button>").join("") + "</div></section>";
  h += '<section><div class="gh">Affichage</div><div class="group" role="radiogroup" aria-label="Thème">' + [["auto","Comme l'iPhone","Clair le jour, sombre le soir, comme ton téléphone"],["light","Clair",""],["dark","Sombre",""]].map(([k,n,sub]) => '<button class="row link" role="radio" data-act="stheme" data-k="' + k + '" aria-checked="' + (p.theme === k) + '"><span class="grow"><span class="lbl">' + n + "</span>" + (sub ? '<span class="sub2">' + sub + "</span>" : "") + '</span><span class="ok">' + IC.check + "</span></button>").join("") +
    '</div><div class="group" style="margin-top:10px"><div class="row"><span class="grow"><span class="lbl">Moins d\'animations</span><span class="sub2">Suit aussi le réglage de ton téléphone</span></span>' + sw("smotion", "1", p.reduceMotion, "Moins d'animations") + "</div></div></section>";
  const stock = Object.keys(p.stock).filter(k => I[k] && p.stock[k] > 0), priced = Object.keys(p.prices).filter(k => I[k]);
  h += '<section><div class="gh">Mes données</div><div class="group">' +
    '<button class="row link" data-act="backup"><span class="iconb sm" style="background:var(--green-tint);color:var(--green-text)">' + IC.download + '</span><span class="grow"><span class="lbl">Sauvegarder mes données</span><span class="sub2">Un petit fichier à garder dans Fichiers</span></span>' + IC.chev + "</button>" +
    '<button class="row link" data-act="restore"><span class="iconb sm" style="background:var(--surface2)">' + IC.upload + '</span><span class="grow"><span class="lbl">Restaurer une sauvegarde</span><span class="sub2">Depuis un fichier ou un texte copié</span></span>' + IC.chev + "</button>" +
    '<button class="row link" data-act="pricesheet"><span class="grow"><span class="lbl">Mes prix corrigés</span></span><span class="muted">' + priced.length + "</span>" + IC.chev + "</button>" +
    '<button class="row link" data-act="stocksheet"><span class="grow"><span class="lbl">Mon stock</span><span class="sub2">Le reste des paquets après « Courses faites »</span></span><span class="muted">' + stock.length + "</span>" + IC.chev + "</button>" +
    '<button class="row link" data-act="resetask"><span class="grow"><span class="lbl" style="color:var(--warn-text)">Tout effacer</span></span></button></div>' +
    '<div class="gf">Tes données restent sur ce téléphone. Sauvegarde-les avant de supprimer l\'appli de ton écran d\'accueil.</div><input type="file" id="restoreFile" accept="application/json,.json,.txt" hidden></section>';
  h += '<p class="note" style="text-align:center;padding-bottom:6px">' + logo() + '<br>Biscuit · ' + RX.length + " recettes · version 2.0</p></div>";
  openSheet(h, {state:{kind:"settings"}, label:"Réglages", onClose:() => { if (UI.dirty && S.week){ UI.dirty = false; toast("Tes réglages serviront pour ta prochaine semaine", IC.sparkle); } keepY(render); }});
}
function openPriceList(){
  const priced = Object.keys(S.prices).filter(k => I[k]);
  let h = phead("Mes prix corrigés", '<button class="btn sm" data-act="settings">Retour</button>') + '<div class="pbody">';
  h += priced.length ? '<div class="group">' + priced.map(k => '<div class="row"><span class="grow"><span class="lbl">' + esc(I[k].n) + '</span><span class="sub2">' + priceBasis(I[k]) + '</span></span><span class="tnum" style="font-weight:700">' + eur(S.prices[k]) + '</span><button class="iconb sm" data-act="pricedel" data-k="' + k + '" aria-label="Revenir au prix estimé">' + IC.close + "</button></div>").join("") + "</div>"
    : '<div class="empty">' + mascot("art") + "<p>Aucun prix corrigé pour l'instant. Touche un prix dans ta liste de courses, ou scanne un ticket.</p></div>";
  openSheet(h + "</div>", {state:{kind:"prices"}, label:"Mes prix"});
}
function openStockList(){
  const stock = Object.keys(S.stock).filter(k => I[k] && S.stock[k] > 0).sort((a,b) => I[a].n.localeCompare(I[b].n, "fr"));
  let h = phead("Mon stock", '<button class="btn sm" data-act="settings">Retour</button>') + '<div class="pbody">';
  h += stock.length ? '<div class="group">' + stock.map(k => '<div class="row"><span class="grow"><span class="lbl">' + esc(I[k].n) + '</span></span><input class="input" type="number" min="0" step="any" value="' + Math.round(S.stock[k]*100)/100 + '" data-in="stock" data-k="' + k + '" aria-label="Quantité de ' + esc(I[k].n) + '" style="width:84px;height:38px;text-align:center"><span class="muted" style="width:24px">' + (I[k].u === "pc" ? "pc" : I[k].u) + '</span><button class="iconb sm" data-act="stockdel" data-k="' + k + '" aria-label="Retirer">' + IC.close + "</button></div>").join("") + "</div>"
    : '<div class="empty">' + mascot("art") + "<p>Vide pour l'instant. Après « Courses faites », le reste des paquets (riz, pâtes…) est noté ici et déduit de la liste suivante.</p></div>";
  openSheet(h + "</div>", {state:{kind:"stock"}, label:"Mon stock"});
}

/* ── Sauvegarde et restauration ── */
function backupData(){
  const data = JSON.stringify({app:"biscuit", v:2, date:new Date().toISOString(), state:S}, null, 1);
  const name = "biscuit-sauvegarde-" + todayISO() + ".json";
  let file = null;
  try { file = new File([data], name, {type:"application/json"}); } catch(e) {}
  if (file && navigator.canShare && navigator.canShare({files:[file]})){
    navigator.share({files:[file], title:"Sauvegarde Biscuit"}).then(() => toast("Sauvegarde prête"), err => { if (err && err.name !== "AbortError") downloadBlob(data, name); });
    return;
  }
  downloadBlob(data, name);
}
function downloadBlob(data, name){
  try {
    const url = URL.createObjectURL(new Blob([data], {type:"application/json"}));
    const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000); toast("Sauvegarde téléchargée");
  } catch(e){ copyText(data, "Sauvegarde copiée : colle-la dans une note"); }
}
function openRestore(){
  const h = phead("Restaurer", '<button class="btn sm" data-act="settings">Retour</button>') + '<div class="pbody"><p style="margin:0;line-height:1.5">Choisis le fichier de sauvegarde (biscuit-sauvegarde-….json), ou colle le texte d\'une sauvegarde.</p>' +
    '<button class="btn primary block" data-act="restorefile">' + IC.upload + "Choisir le fichier</button>" +
    '<div class="field"><label for="imp">Ou colle ta sauvegarde</label><textarea class="input" id="imp" placeholder="{&quot;app&quot;:&quot;biscuit&quot;…"></textarea></div><button class="btn block" data-act="restoretext">Restaurer depuis le texte</button>' +
    '<p class="note">Attention : tes données actuelles seront remplacées.</p><input type="file" id="restoreFile" accept="application/json,.json,.txt" hidden></div>';
  openSheet(h, {state:{kind:"restore"}, label:"Restaurer"});
}
function restoreFrom(text){
  try {
    const j = JSON.parse(text); const st = j && j.state ? j.state : j;
    if (!st || typeof st !== "object" || !("budget" in st)) throw 0;
    S = Object.assign(DEFAULT(), st); save(); rebuild(); applyTheme(); closeSheet(); render(); toast("Données restaurées");
  } catch(e){ toast("Ce fichier n'est pas une sauvegarde Biscuit valide", IC.close); }
}
function copyText(txt, okMsg){
  const done = () => toast(okMsg);
  const fallback = () => {
    const ta = document.createElement("textarea"); ta.value = txt; ta.setAttribute("readonly",""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch(e) {} ta.remove();
    if (ok) done(); else openSheet(phead("Copier") + '<div class="pbody"><p class="note">Sélectionne le texte ci-dessous et copie-le.</p><textarea class="input" readonly style="min-height:260px">' + esc(txt) + "</textarea></div>", {label:"Copier"});
  };
  try { navigator.clipboard.writeText(txt).then(done, fallback); } catch(e) { fallback(); }
}
function listText(items, title){
  let t = title + "\n";
  for (const a of AISLE_ORDER){
    const l = items.filter(it => it.g.r === a && it.counted && it.buy > 1e-9 && !S.checked[it.k]); if (!l.length) continue;
    t += "\n" + RAYONS[a].n.toUpperCase() + "\n" + l.map(it => "☐ " + it.g.n + " : " + qtyLabel(it.k, it.buy) + (packLabel(it) && !it.g.fl.includes("W") ? " (" + packLabel(it) + ")" : "")).join("\n") + "\n";
  }
  return t + "\nTotal estimé : " + eur(items.reduce((s,it) => s + (it.counted ? it.cost : 0), 0));
}

/* ── Ma recette (ajouter / modifier) ── */
function openRecipeForm(id){
  const ex = id ? S.custom.find(a => a[0] === id) : null;
  const d = ex ? {n:ex[1], e:ex[2], c:ex[3], m:ex[4], d:ex[5], t:ex[6], i:ex[8].map(x => x.slice()), s:ex[9].join("\n"), ph:ex[10] || ""} : {n:"", e:"🍽️", c:"fr", m:"MS", d:1, t:30, i:[["",0]], s:"", ph:""};
  sheetState = {kind:"form", id, d}; renderForm();
}
function renderForm(){
  const stt = sheetState, d = stt.d;
  const opts = IKEYS.slice().sort((a,b) => I[a].n.localeCompare(I[b].n,"fr")).map(k => '<option value="' + esc(I[k].n) + '"></option>').join("");
  let h = phead(stt.id ? "Modifier ma recette" : "Nouvelle recette") + '<div class="pbody">';
  h += '<div class="field"><label for="fn">Nom du plat</label><input class="input" id="fn" data-in="fn" value="' + esc(d.n) + '" placeholder="Ex. : Gratin de ma grand-mère"></div>';
  h += '<div class="field"><label for="fp">Photo (facultatif)</label><input class="input" id="fp" data-in="fp" type="url" value="' + esc(d.ph) + '" placeholder="Lien d\'une image"><span class="note">Sans lien, l\'appli cherche une photo du plat toute seule.</span></div>';
  h += '<div class="field"><label for="fc2">Cuisine</label><select class="input" id="fc2" data-in="fc2">' + Object.entries(CUISINES).map(([k,c]) => '<option value="' + k + '"' + (d.c === k ? " selected" : "") + ">" + c.n + "</option>").join("") + "</select></div>";
  h += '<div class="field"><label>Pour quel repas ?</label><div class="group">' + ["P","M","S"].map(m => '<div class="row"><span class="grow"><span class="lbl">' + MEALS[m] + "</span></span>" + sw("fmeal", m, d.m.includes(m), MEALS[m]) + "</div>").join("") + "</div></div>";
  h += '<div class="field"><label>Difficulté</label>' + seg("fdiff", [[1,"Facile"],[2,"Moyen"],[3,"Difficile"]], d.d, "sm") + "</div>";
  h += '<div class="field"><label for="ft">Temps total (minutes)</label><input class="input" id="ft" type="number" min="1" data-in="ft" value="' + d.t + '" style="width:130px"></div>';
  h += '<div class="field"><label>Ingrédients pour 1 personne</label><datalist id="inglist">' + opts + "</datalist>";
  d.i.forEach((x, j) => {
    const g = I[x[0]];
    h += '<div style="display:grid;grid-template-columns:minmax(0,1fr) 96px 40px;gap:8px;align-items:center"><input class="input" list="inglist" data-in="fi" data-j="' + j + '" value="' + esc(g ? g.n : (x[2] || "")) + '" placeholder="Ingrédient" aria-label="Ingrédient ' + (j+1) + '">' +
      '<input class="input" type="number" min="0" step="any" data-in="fq" data-j="' + j + '" value="' + (x[1] || "") + '" placeholder="' + (g ? (g.u === "pc" ? (g.lab || "pièce") : g.u) : "qté") + '" aria-label="Quantité"><button class="iconb sm" data-act="fidel" data-j="' + j + '" aria-label="Retirer">' + IC.close + "</button></div>";
  });
  h += '<button class="btn ghost sm" data-act="fiadd" style="align-self:flex-start">' + IC.plus + "Ajouter un ingrédient</button>";
  h += '<details><summary class="note" style="cursor:pointer;padding:6px 0">Un ingrédient manque dans la liste ?</summary><div class="field" style="margin-top:10px">' +
    '<input class="input" id="ni-n" placeholder="Nom (ex. : Haricots noirs)"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><select class="input" id="ni-u"><option value="g">vendu en g</option><option value="ml">vendu en ml</option><option value="pc">à la pièce</option></select>' +
    '<input class="input" id="ni-s" type="number" placeholder="Taille du paquet"><input class="input" id="ni-p" type="number" step="0.01" placeholder="Prix du paquet (€)"><select class="input" id="ni-r">' + AISLE_ORDER.map(a => '<option value="' + a + '">' + RAYONS[a].n + "</option>").join("") + '</select></div><button class="btn sm" data-act="niadd">Créer cet ingrédient</button></div></details></div>';
  h += '<div class="field"><label for="fs">Étapes (une par ligne)</label><textarea class="input" id="fs" data-in="fs" placeholder="Fais revenir l\'oignon…">' + esc(d.s) + "</textarea></div><div id=\"ferr\"></div>";
  h += '<button class="btn primary block" data-act="fsave">Enregistrer la recette</button>' + (stt.id ? '<button class="btn block" data-act="fdelete" style="color:var(--warn-text)">Supprimer</button>' : "") + "</div>";
  refreshSheet(() => openSheet(h, {state:stt, label:"Ma recette"}));
}
