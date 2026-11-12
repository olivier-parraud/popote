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
      if (/^\s*\(/.test(after)) continue;
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
function generateBatchWeek(){
  rebuild();
  const slots = buildSlots(S.days, S.meals);
  const mains = slots.map((s,i) => ({...s, i})).filter(s => s.m !== "P");
  if (!mains.length){ toast("Coche le déjeuner ou le dîner dans les réglages."); return false; }
  const cand = RX.filter(r => r.m !== "P" && (r.m.includes("M") || r.m.includes("S")) && allowed(r) && batchInfo(r).ok);
  if (cand.length < 3){ toast("Pas assez de plats qui se conservent avec tes filtres."); return false; }
  const n = mains.length, K = Math.max(2, Math.min(6, Math.round(n/3), cand.length));
  const counts = Array.from({length:K}, (_, j) => Math.floor(n/K) + (j < n % K ? 1 : 0));
  const recent = recentMap(true), favs = new Set(S.favs);
  const pref = {}; cand.forEach(r => pref[r.id] = Math.random());
  function score(set){
    const ids = []; set.forEach((r, j) => { for (let c = 0; c < counts[j]; c++) ids.push(r.idx); });
    const C = totalFor(ids, S.people, true);
    let E = 0.3*C + (C > S.budget ? 8*(C - S.budget) + 5 : 0);
    const cu = {}, pt = {};
    for (const r of set){ cu[r.c] = (cu[r.c]||0) + 1; pt[r.prot] = (pt[r.prot]||0) + 1; if (recent[r.id]) E += 3; if (favs.has(r.id)) E -= 1; E -= 2*pref[r.id]; if (!batchInfo(r).freeze) E += 0.6; }
    for (const k in cu) if (cu[k] > 1) E += 2.5*(cu[k]-1);
    for (const k in pt) if (pt[k] > 1) E += 2*(pt[k]-1);
    return {E, C};
  }
  const pick = () => cand[(Math.random()*cand.length)|0];
  let best = null, bestS = null;
  for (let t = 0; t < 300; t++){
    const set = []; while (set.length < K){ const r = pick(); if (!set.includes(r)) set.push(r); }
    const sc = score(set); if (!best || sc.E < bestS.E){ best = set; bestS = sc; }
  }
  for (let t = 0; t < 600; t++){
    const set = best.slice(), j = (Math.random()*K)|0; const r = pick(); if (set.includes(r)) continue; set[j] = r;
    const sc = score(set); if (sc.E < bestS.E){ best = set; bestS = sc; }
  }
  // Répartition : les plats qui se congèlent mal en début de semaine, jamais deux fois de suite
  const left = best.map((r, j) => ({r, c:counts[j], info:batchInfo(r)}));
  const assign = [];
  let prev = null;
  for (const sl of mains){
    const day = sl.d + 1;
    const ok = left.filter(x => x.c > 0 && (x.info.freeze || day <= x.info.fridge));
    let pool = ok.filter(x => x.r !== prev); if (!pool.length) pool = ok.length ? ok : left.filter(x => x.c > 0);
    pool.sort((a,b) => (a.info.freeze - b.info.freeze) || (b.c - a.c));
    const x = pool[0]; x.c--; prev = x.r; assign.push(x.r.id);
  }
  const old = S.week;
  if (old && (old.done || old.start < addDaysISO(todayISO(), -4))) pushHistory(old);
  const pPool = poolFor("P").map(i => RX[i]);
  const pList = shuffleWithSeed(pPool, (Math.random()*1000)|0);
  let a = 0, pb = 0;
  S.week = {start:todayISO(), days:S.days, batch:true, minCost:null, done:false,
    slots:slots.map(s => ({d:s.d, m:s.m, id: s.m === "P" ? (pList.length ? pList[(pb++) % pList.length].id : "porridge-banane") : assign[a++]}))};
  if (bestS.C > S.budget + 0.01) S.week.minCost = bestS.C;
  S.checked = {}; S.batchDone = {};
  save();
  return true;
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
  if (!S.week || !S.week.batch){
    h += '<section class="sum stag"' + stg(0) + '><div class="cap">Le principe</div><div style="display:grid;gap:10px;font-size:15px;line-height:1.45">' +
      "<span><b>1.</b> L'appli choisit quelques plats qui se gardent bien au frigo ou au congélateur, et les multiplie pour couvrir toute la semaine.</span>" +
      "<span><b>2.</b> Tu fais les courses en une fois.</span>" +
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
  h += '<section class="sum stag"' + stg(0) + '><div class="facts" style="background:none;padding:0"><div class="fact"><span>Plats</span><b>' + dishes.length + '</b></div><div class="fact"><span>Repas</span><b>' + nMain + '</b></div><div class="fact"><span>Durée</span><b>≈ ' + timeLabel(est) + "</b></div></div>" +
       '<div class="links"><button class="btn sm" data-act="tab" data-tab="list">' + ICO.cart + 'Courses</button><button class="btn sm" data-act="batchgen-ask">' + ICO.dice + "Autres plats</button></div></section>";
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
  "bdone-reset": () => { S.batchDone = {}; save(); const y = SC().scrollTop; render(); SC().scrollTop = y; }
};

