/* ═══ Biscuit · modes plein écran : magasin, session batch, ticket ═══ */

/* ───────── Au magasin ───────── */
function storeAisles(){
  const {toBuy} = listData();
  return AISLE_ORDER.map(a => ({a, items:toBuy.filter(it => it.g.r === a)})).filter(x => x.items.length);
}
function openStore(){
  const A = storeAisles();
  const first = A.findIndex(x => x.items.some(it => !S.checked[it.k]));
  UI.store = {i:first < 0 ? 0 : first, cart:false, dir:0};
  FULL.awake = true; keepAwake(true);
  openFull(storeHTML(), "store", "store");
}
function storeHTML(){
  const s = store(), d = listData(), A = storeAisles();
  const all = d.toBuy, nDone = all.filter(it => S.checked[it.k]).length, N = all.length;
  const st = UI.store; if (st.i >= A.length) st.i = Math.max(0, A.length - 1);
  const over = d.total > S.budget + 0.01;
  let h = '<div class="fhead2"><div style="display:flex;flex-direction:column;gap:3px;min-width:0"><span class="sub" style="display:flex;align-items:center;gap:6px">' + storeLogo(s, "sm") + esc(s.n) + ' · rayon par rayon</span><h1 class="h1">Au magasin</h1></div><button class="btn sm" data-act="storeclose">Terminer</button></div>';
  h += '<div class="fscroll" id="sscroll"><div class="wraps">';
  h += '<section class="ringcard" aria-label="Avancement"><div class="rg">' + ringSVG(30, N ? nDone/N : 0, 7) + "<span>" + nDone + "/" + N + "</span></div><div><b>" + eur(d.total) + " estimé</b><small>Budget " + eur(S.budget).replace(",00","") + " · " + (over ? "dépasse de " + eur(d.total - S.budget) : "il reste " + eur(S.budget - d.total)) + "</small></div></section>";
  if (nDone === N){
    h += '<div class="alldone" id="alldone">' + mascot("jump") + "<h2>Tout est dans le chariot !</h2><p class=\"note\">Passe en caisse, puis valide tes courses : le reste des paquets ira dans ton placard.</p>" +
      '<div style="display:flex;flex-direction:column;gap:8px;width:min(100%,340px)"><button class="btn primary block" data-act="storedone">' + IC.check + 'Courses faites</button><button class="btn caramel block" data-act="ticket">' + IC.scan + "Scanner le ticket</button></div></div>";
    return h + "</div></div>";
  }
  if (A.length > 1) h += '<div class="adots" role="group" aria-label="Rayons">' + A.map((x, j) => { const ok = x.items.every(it => S.checked[it.k]); return '<button data-act="sgo" data-i="' + j + '"' + (j === st.i ? ' aria-current="true"' : "") + (ok ? ' class="ok"' : "") + ">" + (ok ? "✓ " : "") + esc(RAYONS[x.a].n.split(/[ ,&]/)[0]) + "</button>"; }).join("") + "</div>";
  const cur = A[st.i], todo = cur.items.filter(it => !S.checked[it.k]), got = cur.items.filter(it => S.checked[it.k]);
  h += '<section class="aislec t-' + cur.a + (st.dir > 0 ? " slide-in" : st.dir < 0 ? " slide-back" : "") + '" aria-label="Rayon en cours"><div class="ahd"><div style="display:flex;flex-direction:column;gap:1px;min-width:0"><span class="k">RAYON ' + (st.i + 1) + " SUR " + A.length + '</span><span class="n">' + esc(RAYONS[cur.a].n) + '</span></div><span class="c">' + (todo.length ? todo.length + " restant" + (todo.length > 1 ? "s" : "") : "Rayon terminé") + "</span></div>";
  h += todo.map(it => '<button class="bigitem" data-act="scheck" data-k="' + it.k + '" aria-label="' + esc(it.g.n) + ' : dans le chariot">' + box(false) + '<span style="min-width:0;display:flex;flex-direction:column;gap:2px"><span class="nm">' + esc(it.g.n) + '</span><span class="q">' + qtyLabel(it.k, it.need) + (packLabel(it) ? " · " + packLabel(it) : "") + '</span></span><span class="pr">' + eur(it.cost) + "</span></button>").join("");
  if (!todo.length) h += '<div class="bigitem" style="justify-content:center;grid-template-columns:1fr;text-align:center;color:var(--green-text);font-weight:700">' + IC.check + " Tout est pris dans ce rayon</div>";
  h += "</section>";
  const inCart = all.filter(it => S.checked[it.k]);
  if (inCart.length){
    h += '<button class="cart" data-act="scart" aria-expanded="' + st.cart + '"><span class="ic">' + IC.check + '</span><span style="display:flex;flex-direction:column;gap:1px;min-width:0"><span style="font-weight:700">Dans le chariot · ' + inCart.length + '</span><span style="font-size:13px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(inCart.slice(-4).reverse().map(it => it.g.n).join(", ")) + "</span></span>" + IC.chev + "</button>";
    if (st.cart) h += '<div class="incart">' + inCart.map(it => '<button class="bigitem done" data-act="suncheck" data-k="' + it.k + '" aria-label="Retirer ' + esc(it.g.n) + ' du chariot">' + box(true) + '<span style="min-width:0"><span class="nm">' + esc(it.g.n) + '</span></span><span class="pr" style="color:var(--muted)">' + eur(it.cost) + "</span></button>").join("") + "</div>";
  }
  h += "</div></div>";
  const nextI = A.findIndex((x, j) => j > st.i && x.items.some(it => !S.checked[it.k]));
  const ni = nextI >= 0 ? nextI : A.findIndex(x => x.items.some(it => !S.checked[it.k]) && x !== cur);
  if (ni >= 0){
    const nx = A[ni], left = nx.items.filter(it => !S.checked[it.k]).length;
    h += '<div style="padding:10px var(--gut) calc(var(--safe-b) + 16px);max-width:640px;width:100%;margin:0 auto"><button class="nextaisle" data-act="sgo" data-i="' + ni + '"><span style="display:flex;flex-direction:column;align-items:flex-start;gap:1px"><small>' + (ni > st.i ? "RAYON SUIVANT" : "IL RESTE") + "</small>" + esc(RAYONS[nx.a].n) + " · " + left + " article" + (left > 1 ? "s" : "") + "</span>" + IC.next + "</button></div>";
  }
  return h;
}
function storeRender(keep){
  const el = $("#full"); if (!el || FULL.kind !== "store") return;
  const sc = $("#sscroll"), y = sc ? sc.scrollTop : 0;
  el.innerHTML = storeHTML(); hydrate();
  const sc2 = $("#sscroll"); if (sc2 && keep) sc2.scrollTop = y;
  UI.store.dir = 0;
}
function storeCheck(el){
  const k = el.dataset.k; if (S.checked[k]) return;
  S.checked[k] = 1; save(); buzz(8);
  el.classList.add("done");
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => {
      const A = storeAisles(), cur = A[UI.store.i];
      const aisleDone = cur && cur.items.every(it => S.checked[it.k]);
      const allDone = A.every(x => x.items.every(it => S.checked[it.k]));
      if (allDone){ storeRender(false); const m = $("#alldone .mascot"); if (m){ const r = m.getBoundingClientRect(); crumbs(r.left + r.width/2, r.top + r.height/2, 30); } buzz([12,60,12]); return; }
      if (aisleDone){
        storeRender(true);
        setTimeout(() => {
          const A2 = storeAisles(), nx = A2.findIndex((x, j) => j > UI.store.i && x.items.some(it => !S.checked[it.k]));
          const ni = nx >= 0 ? nx : A2.findIndex(x => x.items.some(it => !S.checked[it.k]));
          if (ni >= 0 && FULL.kind === "store"){ UI.store.dir = ni > UI.store.i ? 1 : -1; UI.store.i = ni; storeRender(false); const s = $("#sscroll"); if (s) s.scrollTop = 0; toast("Rayon terminé"); }
        }, 650);
      } else storeRender(true);
    }, reduced() ? 0 : 260);
  }, reduced() ? 0 : 180);
}
function closeStore(){ FULL.awake = false; closeFull(); }

/* ───────── Session batch cooking ───────── */
function openSession(){
  FULL.awake = true; keepAwake(true);
  openFull(sessionHTML(), "batchs", "session");
}
function sessionKeys(){ return $$("#full [data-act='bdone']").map(b => b.dataset.k); }
function sessionHTML(){
  const w = S.week, dishes = batchPlan(), nMain = w.slots.filter(s => s.m !== "P").length;
  const sumT = dishes.reduce((s,x) => s + x.r.t, 0), maxT = Math.max(...dishes.map(x => x.r.t));
  const est = Math.round((Math.max(maxT, sumT*0.6) + 20)/5)*5;
  const done = S.batchDone || {};
  const ck = (key, inner) => '<button class="ck' + (done[key] ? " done" : "") + '" data-act="bdone" data-k="' + esc(key) + '">' + box(false) + '<span class="t">' + inner + "</span></button>";
  let body = "";
  body += '<section class="phase"><h2 class="h2"><span>1 ·</span> Avant de commencer</h2><div class="checklist">' +
    ck("mat-boites", "<b>" + nMain + " boîtes hermétiques</b>, une par repas" + (S.people > 1 ? " (" + S.people + " portions chacune)" : "") + "<small>Idéalement en verre, qui vont au micro-ondes</small>") +
    ck("mat-etiquettes", "Du ruban adhésif et un feutre<small>Pour noter le plat et la date sur chaque boîte</small>") +
    ck("mat-ustensiles", "Tes plus grandes casseroles, cocottes et plaques<small>Tu vas cuisiner plusieurs plats en même temps</small>") +
    ck("mat-place", "De la place au frigo et au congélateur<small>Et un lave-vaisselle vide pour ranger au fur et à mesure</small>") + "</div></section>";
  const agg = new Map();
  for (const x of dishes) for (const [k, q] of x.r.i){ if (!agg.has(k)) agg.set(k, {q:0, who:[]}); const a = agg.get(k); a.q += q*x.mult; if (!a.who.includes(x.r.n)) a.who.push(x.r.n); }
  const mp = miseEnPlace([...agg.entries()].map(([k, a]) => [k, a.q]));
  body += '<section class="phase"><h2 class="h2"><span>2 ·</span> Toute la préparation d\'un coup</h2><p class="note">Épluche et coupe tout avant d\'allumer le feu : tu gagnes un temps énorme.</p><div class="checklist">' +
    mp.rows.map(row => { const a = agg.get(row.k); return ck("mp-" + row.k, "<b>" + qtyLabel(row.k, row.q) + "</b> · " + esc(I[row.k].n) + "<small>" + row.verb + " · pour " + esc(a.who.join(", ")) + "</small>"); }).join("") + "</div>" +
    (mp.staples.length ? '<p class="note">À portée de main : ' + esc(mp.staples.join(", ")) + ".</p>" : "") + "</section>";
  body += '<section class="phase"><h2 class="h2"><span>3 ·</span> Les cuissons, dans cet ordre</h2>';
  dishes.forEach((x, j) => {
    const D = typeof DETAILS !== "undefined" ? DETAILS[x.r.id] : null;
    const steps = annotateSteps(x.r, D ? D.steps : x.r.s, x.mult);
    const label = j === 0 ? "À lancer en premier" : (x.r.t >= 40 ? "Puis lance" : "Pendant que ça cuit");
    const nd = steps.filter((_, i) => done["st-" + x.r.id + "-" + i]).length;
    body += '<details class="bdish"' + (j === 0 ? " open" : "") + "><summary>" + photo(x.r, "") + '<span style="min-width:0;display:flex;flex-direction:column;gap:2px"><span class="kicker" style="color:var(--caramel-text)">' + label + '</span><span style="font-weight:700">' + esc(x.r.n) + '</span><span class="note" style="font-size:13px">' + x.slots.length + " repas · " + x.mult + " portion" + (x.mult > 1 ? "s" : "") + " · " + timeLabel(x.r.t) + " · " + nd + "/" + steps.length + "</span></span>" + IC.chev + "</summary>" +
      '<div class="bb"><div class="ings">' + x.r.i.filter(([k]) => k !== "eau" && I[k]).map(([k,q]) => '<div class="ing' + (I[k].fl.includes("S") ? " pl" : "") + '"><b>' + qtyLabel(k, q*x.mult) + "</b><span>" + esc(I[k].n) + "</span></div>").join("") + "</div>" +
      '<div class="checklist">' + steps.map((s, i) => ck("st-" + x.r.id + "-" + i, s)).join("") + "</div>" +
      (x.mult >= 4 ? '<p class="note">Grande quantité : prévois une casserole plus grande et un peu plus de temps de cuisson. Goûte avant de saler davantage.</p>' : "") +
      '<button class="btn sm" data-act="cook" data-id="' + esc(x.r.id) + '" data-p="' + x.mult + '">' + IC.play + "Mode cuisine pour ce plat</button></div></details>";
  });
  body += "</section>";
  body += '<section class="phase"><h2 class="h2"><span>4 ·</span> Mise en boîtes</h2><div class="checklist">';
  w.slots.forEach((s, i) => {
    if (s.m === "P") return; const r = RBYID[s.id]; if (!r) return;
    const info = batchInfo(r), day = s.d + 1, date = dayDate(w.start, s.d);
    const frigo = day <= Math.min(3, info.fridge || 0) || !info.freeze;
    body += ck("box-" + i, "<b>" + esc(cap(fmtDay(date))) + " " + MEALS[s.m].toLowerCase() + "</b> · " + esc(r.n) + '<small><span class="where ' + (frigo ? "f" : "c") + '">' + (frigo ? "FRIGO" : "CONGÉLATEUR") + "</span> " + (frigo ? "à réchauffer le jour J" : "à sortir la veille au soir, au frigo") + "</small>");
  });
  body += '</div><p class="note">Laisse refroidir 1 heure maximum avant de fermer les boîtes. Au frigo, pas plus de 3 jours ; le reste va au congélateur. Pour réchauffer : 2 à 3 minutes au micro-ondes en remuant à mi-temps.</p></section>';
  body += '<div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn sm" href="https://www.youtube.com/results?search_query=' + encodeURIComponent("batch cooking semaine organisation") + '" target="_blank" rel="noopener">' + IC.video + 'Vidéos d\'organisation</a><button class="btn sm ghost" data-act="bdone-reset">Tout décocher</button></div>';
  const total = 4 + mp.rows.length + dishes.reduce((s, x) => s + (D => (D ? D.steps : x.r.s).length)(typeof DETAILS !== "undefined" ? DETAILS[x.r.id] : null), 0) + nMain;
  const nDone = Object.keys(done).length;
  return '<div class="fhead"><button class="iconb press" data-act="sessionclose" aria-label="Fermer la session">' + IC.close + '</button><div class="c"><b>Session batch cooking</b><span>≈ ' + timeLabel(est) + " · " + nMain + ' boîtes</span></div><span></span></div>' +
    '<div class="topprog"><div class="progress"><i id="bprog" style="width:' + Math.min(100, nDone/total*100).toFixed(1) + '%"></i></div><span class="note" id="bprogt" style="font-size:12.5px" data-total="' + total + '">' + Math.min(nDone, total) + " sur " + total + " cases cochées</span></div>" +
    '<div class="fscroll"><div class="wraps">' + body + "</div></div>";
}
function sessionProgress(){
  const t = $("#bprogt"); if (!t) return;
  const total = +t.dataset.total, n = sessionKeys().filter(k => S.batchDone[k]).length;
  t.textContent = n + " sur " + total + " cases cochées";
  $("#bprog").style.width = Math.min(100, n/total*100).toFixed(1) + "%";
  if (n >= total && !S.week.sessionDone){ S.week.sessionDone = true; save(); crumbs(innerWidth/2, innerHeight/3, 36); buzz([12,60,12]); toast("Session terminée, bravo !"); }
}

/* ───────── Scanner un ticket de caisse ───────── */
const TK = {img:null, lines:[], status:"idle", prog:0, err:""};
const TESS = "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js";
function openTicket(){
  Object.assign(TK, {img:null, lines:[], status:"idle", prog:0, err:""});
  if (SH.open) closeSheet();
  if (FULL.kind) { const el = $("#full"); el.className = "full ticket"; FULL.kind = "ticket"; el.innerHTML = ticketHTML(); hydrate(); return; }
  openFull(ticketHTML(), "ticket", "ticket");
}
function ticketRender(){ const el = $("#full"); if (el && FULL.kind === "ticket"){ el.innerHTML = ticketHTML(); } }
function ticketHTML(){
  const s = store();
  let h = '<div class="fhead2" style="flex-direction:column;align-items:flex-start;gap:10px"><button class="btn sm ghost" data-act="ticketclose" style="padding:0 6px;height:36px">' + IC.back + 'Courses</button><div style="display:flex;flex-direction:column;gap:3px"><h1 class="h1">Ton ticket</h1><span class="sub">' + esc(s.n) + " · " + esc(new Date().toLocaleDateString("fr-FR",{weekday:"long", day:"numeric", month:"long"})) + "</span></div></div>";
  h += '<div class="fscroll"><div class="wraps">';
  if (TK.status === "idle"){
    h += '<div class="drop">' + mascot("") + '<b style="font-family:var(--f-head);font-size:20px">Prends ton ticket en photo</b><p class="note" style="margin:0;max-width:34ch">Bien à plat, avec de la lumière. Je lis les prix et je mets à jour ceux de l\'appli. La photo reste sur ton téléphone.</p>' +
      '<label class="btn primary block" style="cursor:pointer">' + IC.scan + 'Prendre la photo<input type="file" accept="image/*" capture="environment" data-in="tkfile" hidden></label>' +
      '<label class="btn block" style="cursor:pointer">Choisir une photo<input type="file" accept="image/*" data-in="tkfile" hidden></label></div>';
    h += '<div class="field"><label for="tktext">Ou colle le texte du ticket</label><textarea class="input" id="tktext" placeholder="POULET FILET 500G   5,29&#10;RIZ BASMATI 1KG    1,99"></textarea><button class="btn block" data-act="tkpaste">Lire ce texte</button></div>';
    if (TK.err) h += '<div class="hint" style="background:var(--warn-tint);color:var(--warn-text)">' + IC.close + "<span>" + esc(TK.err) + "</span></div>";
  } else if (TK.status === "reading"){
    h += '<div class="scanbox">' + (TK.img ? '<img src="' + TK.img + '" alt="Ton ticket">' : "") + '<span class="laser"></span></div><div style="display:flex;flex-direction:column;gap:8px"><b id="tkst">' + esc(TK.step || "Lecture du ticket…") + '</b><div class="progress"><i id="tkpr" style="width:' + Math.round(TK.prog*100) + '%"></i></div><p class="note" style="margin:0">La première fois, je télécharge l\'outil de lecture (quelques secondes).</p></div>';
  } else {
    const L = TK.lines, chg = L.filter(l => l.k && l.on && Math.abs(l.price - l.old) > 0.004).length, ask = L.filter(l => !l.k && !l.ign).length;
    h += '<div class="sumc"><span class="ic">' + IC.scan + '</span><div style="display:flex;flex-direction:column;gap:4px"><b>' + L.length + " ligne" + (L.length > 1 ? "s" : "") + " lue" + (L.length > 1 ? "s" : "") + '</b><span class="note" style="font-size:13.5px">' + (chg ? chg + " prix " + (chg > 1 ? "ont" : "a") + " changé" : "Aucun prix n'a changé") + (ask ? ", " + ask + " ligne" + (ask > 1 ? "s" : "") + " à associer" : "") + '.</span><button class="btn xs ghost" data-act="tkagain" style="align-self:flex-start;padding:0">Reprendre la photo</button></div></div>';
    if (!L.length) h += '<p class="note">Je n\'ai trouvé aucun prix sur ce ticket. Essaie avec plus de lumière, ou colle le texte.</p>';
    else h += '<div class="tlines">' + L.map((l, j) => {
      let d, cls;
      if (l.ign){ d = "ignoré"; cls = "mute"; }
      else if (!l.k){ d = "à associer"; cls = "ask"; }
      else if (Math.abs(l.price - l.old) < 0.005){ d = "inchangé"; cls = "mute"; }
      else { d = eur(l.old) + " → " + eur(l.price) + (l.price > l.old ? " ▲" : " ▼"); cls = l.price > l.old ? "up" : "down"; }
      const right = l.ign ? '<button class="tb" data-act="tkpick" data-j="' + j + '">Associer</button>' : !l.k ? '<button class="tb" data-act="tkpick" data-j="' + j + '">Choisir</button>' : cls === "mute" ? "<span></span>" :
        '<button class="tgl" data-act="tktoggle" data-j="' + j + '" aria-pressed="' + l.on + '" aria-label="Mettre à jour ' + esc(I[l.k].n) + '">' + box(l.on) + "</button>";
      return '<div class="tline' + (l.ign ? " ign" : "") + '"><div style="min-width:0;display:flex;flex-direction:column;gap:2px"><span class="raw">' + esc(l.raw) + '</span><span style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap"><button class="nm" data-act="tkpick" data-j="' + j + '" style="text-align:left">' + esc(l.k ? I[l.k].n : l.ign ? "Pas un ingrédient" : "?") + '</button><span class="d ' + cls + '">' + d + "</span></span></div>" + right + "</div>";
    }).join("") + "</div>";
    const n = L.filter(l => l.k && l.on && Math.abs(l.price - l.old) > 0.004).length;
    h += '<button class="btn primary block" data-act="tkapply"' + (n ? "" : " disabled") + ">" + IC.check + (n ? "Mettre à jour " + n + " prix" : "Rien à mettre à jour") + "</button>";
    h += '<p class="note" style="text-align:center">Les noms abrégés que tu associes sont retenus pour les prochains tickets.</p>';
  }
  return h + "</div></div>";
}
function loadScript(src){
  return new Promise((ok, ko) => { if (window.Tesseract) return ok(); const s = document.createElement("script"); s.src = src; s.async = true; s.onload = ok; s.onerror = () => ko(new Error("load")); document.head.appendChild(s); });
}
async function ticketFromFile(file){
  if (!file) return;
  TK.status = "reading"; TK.prog = 0; TK.step = "Préparation de la photo…"; TK.err = "";
  try { TK.img = await shrinkImage(file, 1700); } catch(e){ TK.img = null; }
  ticketRender();
  try {
    if (!navigator.onLine && !window.Tesseract) throw new Error("offline");
    await loadScript(TESS);
    const labels = {"loading tesseract core":"Chargement de l'outil de lecture…", "initializing tesseract":"Démarrage…", "loading language traineddata":"Chargement du français…", "initializing api":"Démarrage…", "recognizing text":"Lecture du ticket…"};
    const worker = await Tesseract.createWorker("fra", 1, {logger: m => {
      const st = $("#tkst"), pr = $("#tkpr");
      const base = m.status === "recognizing text" ? 0.35 + 0.65*(m.progress || 0) : 0.35*(m.progress || 0);
      TK.prog = Math.max(TK.prog, base); TK.step = labels[m.status] || TK.step;
      if (st) st.textContent = TK.step; if (pr) pr.style.width = Math.round(TK.prog*100) + "%";
    }});
    const res = await worker.recognize(TK.img || file);
    await worker.terminate();
    ticketFromText(res.data.text || "");
  } catch(e){
    TK.status = "idle";
    TK.err = e && e.message === "offline" ? "Il faut une connexion la première fois pour lire un ticket. Tu peux aussi coller le texte." : "Je n'ai pas réussi à lire cette photo. Réessaie avec plus de lumière, ou colle le texte.";
    ticketRender();
  }
}
function shrinkImage(file, max){
  return new Promise((ok, ko) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const s = Math.min(1, max/Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width*s); c.height = Math.round(img.height*s);
      const g = c.getContext("2d"); g.filter = "grayscale(1) contrast(1.25)"; g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); ok(c.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => { URL.revokeObjectURL(url); ko(new Error("img")); };
    img.src = url;
  });
}
/* Lecture des lignes : « LIBELLÉ … 1,29 » ; ignore totaux, paiements, TVA */
const TK_SKIP = /total|sous[- ]?tot|tva|carte|cb\b|esp[eè]ces|rendu|monnaie|paiement|montant|ticket|merci|avantage|fid[eé]lit|remise|bon d|net a payer|à payer|a payer|siret|tel\b|caisse|articles?\b|points?\b|solde|achat|visa|mastercard|contact|emv/i;
const TK_NONFOOD = /sac\b|cabas|consigne|piles?|sopalin|essuie|papier toil|lessive|liquide vais|eponge|éponge|shampo|gel douche|dentifrice/i;
const normT = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
function parseTicket(text){
  const out = [];
  const rows = String(text).split(/\r?\n/).map(l => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  for (let j = 0; j < rows.length; j++){
    const raw = rows[j];
    if (TK_SKIP.test(raw)) continue;
    // « 2 X 1,15   2,30 » sous le libellé : prix unitaire de la ligne du dessus
    const ql = raw.match(/^(\d+)\s*[xX*]\s*(\d+[.,]\d{2})/);
    if (ql && j > 0 && /[A-Za-zÀ-ÿ]{3}/.test(rows[j-1]) && !/\d[.,]\d{2}\s*\S{0,3}\s*$/.test(rows[j-1]) && !TK_SKIP.test(rows[j-1])){
      out.push({raw:rows[j-1] + " · " + raw, name:rows[j-1].replace(/^\d+\s+/, ""), price:parseFloat(ql[2].replace(",", ".")), perKg:0}); continue;
    }
    const m = raw.match(/^(.*?[A-Za-zÀ-ÿ].*?)\s+(-?\d{1,3}[.,]\d{2})\s*(?:€|eur)?(?:\s*(?:[A-Za-zÀ-ÿ*]{1,2}|\d{1,2})){0,2}\s*$/i);
    if (!m) continue;
    let name = m[1].replace(/\s+\d+\s*[xX*]\s*\d+[.,]\d{2}.*$/, "").trim(), price = parseFloat(m[2].replace(",", "."));
    if (!(price > 0) || price > 80) continue;
    const q = raw.match(/(\d+)\s*[xX*]\s*(\d+[.,]\d{2})/); if (q) price = parseFloat(q[2].replace(",", "."));
    const kg = raw.match(/(\d+[.,]\d{3})\s*kg\s*[xX*]?\s*(\d+[.,]\d{2})/i);
    name = name.replace(/^\d+\s+/, "").replace(/\s{2,}/g, " ");
    if (name.replace(/[^A-Za-zÀ-ÿ]/g, "").length < 3) continue;
    out.push({raw, name, price, perKg: kg ? parseFloat(kg[2].replace(",", ".")) : 0});
  }
  return out;
}
function matchIng(name, weekKeys){
  const n = normT(name); if (S.alias && S.alias[n]) return {k:S.alias[n], sure:true};
  const toks = n.split(" ").filter(t => t.length >= 3 && !/^\d/.test(t) && !/^(les|des|aux|pour|avec|bio|lot|pack|bte|boite|sachet|barq|frais|fraiche|extra|marque|repere|cora|lidl|aldi|eco|prix)$/.test(t));
  if (!toks.length) return null;
  let best = null;
  for (const k of IKEYS){
    const g = I[k]; if (!g) continue;
    const ws = normT(g.n).split(" ").filter(w => w.length >= 3 && !/^(les|des|aux|pour|avec|boite|sachet|frais|fraiche)$/.test(w));
    if (!ws.length) continue;
    let hit = 0;
    for (const w of ws) if (toks.some(t => w.startsWith(t) || t.startsWith(w) || (t.length >= 4 && w.startsWith(t.slice(0, 4))))) hit++;
    if (!hit) continue;
    let sc = hit/ws.length + (toks.some(t => ws[0].startsWith(t) || t.startsWith(ws[0])) ? 0.25 : 0) + (weekKeys.has(k) ? 0.2 : 0);
    if (!best || sc > best.sc) best = {k, sc};
  }
  return best && best.sc >= 0.75 ? {k:best.k, sure:best.sc >= 1} : null;
}
function ticketFromText(text){
  const weekKeys = new Set(S.week ? listData().items.map(it => it.k) : []);
  TK.lines = parseTicket(text).map(l => {
    const m = matchIng(l.name, weekKeys), ign = !m && TK_NONFOOD.test(l.name);
    const k = m ? m.k : null;
    let price = l.price;
    if (k && l.perKg && I[k].u === "g") price = Math.round(l.perKg*I[k].size/10)/100;
    const old = k ? packPrice(k) : 0;
    return {raw:l.raw, name:l.name, price, k, ign, on:!!k && Math.abs(price - old) > 0.004, old};
  });
  TK.status = "done"; ticketRender();
}
function openTicketPick(j){
  const l = TK.lines[j]; if (!l) return;
  UI.tkq = ""; UI.tkj = j;
  const h = phead("Associer cette ligne") + '<div class="pbody"><p class="note" style="margin:0"><span class="raw" style="font-family:ui-monospace,Menlo,monospace">' + esc(l.raw) + "</span><br>Quel ingrédient de l'appli est-ce ? Je m'en souviendrai pour les prochains tickets.</p>" +
    '<div class="search">' + IC.search + '<label class="sr" for="tkq">Chercher un ingrédient</label><input class="input" id="tkq" type="search" placeholder="Ex. : pain de mie" data-in="tkq" autocomplete="off"></div><div id="tkpl" class="pickl">' + tkPickList("") + '</div><button class="btn block" data-act="tkignore">Ce n\'est pas un ingrédient</button></div>';
  openSheet(h, {state:{kind:"tkpick", j}, label:"Associer cette ligne"});
}
function tkPickList(q){
  const l = TK.lines[UI.tkj], guess = normT(q || l.name).split(" ").filter(t => t.length >= 3);
  let list = IKEYS.filter(k => I[k]);
  if (q) list = list.filter(k => normT(I[k].n).includes(normT(q)));
  else list = list.map(k => ({k, s:guess.filter(t => normT(I[k].n).split(" ").some(w => w.startsWith(t.slice(0, 3)))).length})).filter(x => x.s > 0).sort((a,b) => b.s - a.s).map(x => x.k);
  list = list.slice(0, 30);
  if (!list.length) return '<p class="note">Aucun ingrédient ne correspond. Essaie un autre mot.</p>';
  return '<div class="picks">' + list.map(k => '<button class="pick" data-act="tkset" data-k="' + k + '" style="grid-template-columns:minmax(0,1fr) auto"><span class="n">' + esc(I[k].n) + '</span><span class="tnum muted">' + eur(packPrice(k)) + "</span></button>").join("") + "</div>";
}
function applyTicket(){
  let n = 0;
  for (const l of TK.lines){
    if (!l.k) continue;
    S.alias[normT(l.name)] = l.k;
    if (!l.on || Math.abs(l.price - l.old) < 0.005) continue;
    S.prices[l.k] = Math.round(l.price*100)/100; n++;
  }
  save(); refreshPrices(); closeFull();
  toast(n ? n + " prix mis à jour" : "Ticket lu, les prix étaient déjà bons");
}
