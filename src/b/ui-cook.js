/* ═══ Biscuit · mode cuisine et minuteur ═══ */

/* ── Minuteur (survit à la mise en veille : on garde l'heure de fin) ── */
let tmInt = 0, tmEndShown = 0;
function tmState(){ return S.timer && S.timer.end ? S.timer : null; }
function startTimer(min, label, ref){
  try { const C = window.AudioContext || window.webkitAudioContext; if (C && !window.__ac){ window.__ac = new C(); } if (window.__ac) window.__ac.resume(); } catch(e) {}
  S.timer = {end:Date.now() + min*60000, total:min*60000, label:label || "Minuteur", ref:ref || "", paused:0};
  save(); buzz(10); timerLoop(); toast("Minuteur lancé : " + timeLabel(min), IC.clock);
}
function stopTimer(silent){ S.timer = null; save(); timerLoop(); if (!silent) buzz(6); }
function pauseTimer(){
  const t = tmState(); if (!t) return;
  if (t.paused){ t.end = Date.now() + t.paused; t.paused = 0; } else { t.paused = Math.max(0, t.end - Date.now()); }
  save(); timerLoop();
}
function addTimer(sec){ const t = tmState(); if (!t) return; if (t.paused) t.paused += sec*1000; else t.end += sec*1000; t.total += sec*1000; save(); timerTick(); }
function tmLeft(){ const t = tmState(); if (!t) return 0; return t.paused ? t.paused : Math.max(0, t.end - Date.now()); }
const mmss = ms => { const s = Math.ceil(ms/1000); return Math.floor(s/60) + ":" + String(s%60).padStart(2,"0"); };
function timerLoop(){ clearInterval(tmInt); if (tmState()) tmInt = setInterval(timerTick, 250); timerTick(); }
function ringSVG(r, frac, w){
  const c = 2*Math.PI*r;
  return '<svg viewBox="0 0 ' + (2*r + w) + " " + (2*r + w) + '" aria-hidden="true"><circle class="tr" cx="' + (r + w/2) + '" cy="' + (r + w/2) + '" r="' + r + '"/><circle class="fg" cx="' + (r + w/2) + '" cy="' + (r + w/2) + '" r="' + r + '" style="stroke-dasharray:' + c.toFixed(1) + ";stroke-dashoffset:" + (c*(1 - frac)).toFixed(1) + '"/></svg>';
}
function timerTick(){
  const t = tmState(), pill = $("#tpill");
  if (!pill) return;
  const card = $("#tcard");
  if (!t){
    pill.hidden = true; pill.className = "";
    if (card) refreshTimerCard();
    return;
  }
  const left = tmLeft(), frac = t.total ? 1 - left/t.total : 0;
  // Pastille : cachée dans le mode cuisine quand la carte du minuteur est visible
  const showPill = !(card && card.dataset.ref === t.ref);
  if (showPill){
    if (pill.hidden){ pill.hidden = false; pill.className = "in"; }
    pill.innerHTML = '<span class="rg">' + ringSVG(13, frac, 4) + '</span><b>' + mmss(left) + '</b><span class="l">' + esc(t.paused ? "En pause · " + t.label : t.label) + '</span><button data-act="tpause" aria-label="' + (t.paused ? "Reprendre" : "Mettre en pause") + '">' + (t.paused ? IC.play : '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>') + '</button><button data-act="tstop" aria-label="Arrêter le minuteur">' + IC.close + "</button>";
  } else { pill.hidden = true; }
  if (card) updateTimerCard(left, frac, t);
  if (!t.paused && left <= 0){
    clearInterval(tmInt);
    S.timer = null; save();
    beep(); buzz([220,120,220,120,220]);
    toast("C'est l'heure ! " + t.label, IC.clock);
    pill.hidden = false; pill.className = "ring";
    pill.innerHTML = '<span class="rg">' + ringSVG(13, 1, 4) + '</span><b>0:00</b><span class="l">' + esc(t.label) + '</span><button data-act="tstop" aria-label="Fermer">' + IC.check + "</button>";
    clearTimeout(tmEndShown); tmEndShown = setTimeout(() => { if (!tmState()){ pill.hidden = true; pill.className = ""; } }, 8000);
    if (card) refreshTimerCard(true);
  }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") timerTick(); });

/* ── Mode cuisine ── */
const CK = {rid:null, people:1, slot:null, i:-1, steps:[], ann:[], ings:[], mep:[], done:[], dir:0};
function stepIngredients(r, steps, mult){
  const used = new Set();
  return steps.map(s => {
    const out = [];
    for (const [k, q] of r.i){
      if (used.has(k) || k === "eau" || !KWRE[k] || !I[k]) continue;
      if (KWRE[k].test(s)){ used.add(k); out.push([k, q*mult]); }
    }
    return out;
  });
}
function openCook(id, opts){
  const r = RBYID[id]; if (!r) return;
  opts = opts || {};
  const D = (typeof DETAILS !== "undefined" && DETAILS[id]) || null;
  const steps = D ? D.steps : r.s;
  Object.assign(CK, {rid:id, people:opts.people || S.people, slot:opts.slot, i:-1, steps, done:[], dir:0, mepDone:[]});
  CK.ann = annotateSteps(r, steps, CK.people);
  CK.ings = stepIngredients(r, steps, CK.people);
  CK.gest = steps.map(s => GX.match(s));
  if (SH.open) closeSheet();
  FULL.awake = true; keepAwake(true);
  openFull(cookHTML(), "dark cook", "cook");
  bindCookSwipe();
  timerTick();
}
function cookHead(r){
  const sub = CK.i < 0 ? "Avant de commencer · pour " + CK.people : CK.i >= CK.steps.length ? "C'est prêt" : "Étape " + (CK.i + 1) + " sur " + CK.steps.length + " · pour " + CK.people;
  return '<div class="fhead"><button class="iconb press" data-act="cookclose" aria-label="Quitter le mode cuisine">' + IC.close + '</button><div class="c"><b>' + esc(r.n) + "</b><span>" + sub + '</span></div><button class="iconb press" data-act="cookings" aria-label="Voir tous les ingrédients">' + IC.bullets + "</button></div>" +
    '<div class="segs" aria-hidden="true">' + CK.steps.map((_, j) => '<i class="' + (j < CK.i ? "d" : j === CK.i ? "c" : "") + '"><b></b></i>').join("") + "</div>";
}
function cookHTML(){
  const r = RBYID[CK.rid];
  return cookHead(r) + '<div class="fscroll" id="cscroll"><div class="stage" id="cstage">' + cookBody(r) + "</div></div>" + cookFoot();
}
function cookBody(r){
  const anim = CK.dir > 0 ? " anim-l" : CK.dir < 0 ? " anim-r" : "";
  if (CK.i < 0){
    const mep = miseEnPlace(r.i.map(([k,q]) => [k, q*CK.people]));
    let h = '<div class="wrapc intro' + anim + '"><figure class="fig photo">' + photo(r, "") + '<span class="tag white">' + IC.clock + timeLabel(r.t) + " · " + DIFF[r.d] + "</span></figure>";
    h += '<h2>On prépare tout avant d\'allumer le feu</h2><p>' + CK.steps.length + " étapes. Coche au fur et à mesure, puis lance-toi. L'écran reste allumé.</p>";
    if (mep.rows.length) h += '<div class="ckl">' + mep.rows.map((row, j) => '<button class="ck' + (CK.mepDone.includes(j) ? " done" : "") + '" data-act="cmep" data-i="' + j + '">' + box(false) + "<span><b>" + qtyLabel(row.k, row.q) + "</b> · " + esc(I[row.k].n) + "<small>" + row.verb + "</small></span></button>").join("") + "</div>";
    if (mep.staples.length) h += '<p class="hint2">À portée de main : ' + esc(mep.staples.join(", ")) + ".</p>";
    return h + "</div>";
  }
  if (CK.i >= CK.steps.length){
    const fav = S.favs.includes(r.id);
    return '<div class="finale' + anim + '" id="finale">' + mascot("jump") + "<h2>Bon appétit" + (S.name ? " " + esc(S.name) : "") + " !</h2><p>" + esc(r.n) + " est prêt. Tu as tout fait toi-même.</p>" +
      '<div class="acts"><button class="btnc nxt" data-act="cookdone">' + IC.check + 'Terminer</button><button class="btnc prev" data-act="cookfav" aria-pressed="' + fav + '">' + (fav ? IC.heartFill + "Dans tes favoris" : IC.heart + "Ajouter aux favoris") + "</button></div></div>";
  }
  const i = CK.i, txt = CK.steps[i], g = CK.gest[i], heat = GX.heat(txt), ings = CK.ings[i];
  const firstIng = ings.length ? I[ings[0][0]].n.toLowerCase() : "";
  const vq = g ? GX.G[g].v + (firstIng && !/four|servir|assaisonner|microondes/.test(g) ? " " + firstIng : "") : "recette " + r.n;
  let h = '<div class="wrapc' + anim + '"><figure class="fig' + (g ? "" : " photo") + '">' + (g ? GX.art(g, txt) : photo(r, "")) +
    ((heat || g) ? '<span class="tag white">' + (heat ? IC.fire + heat : esc(GX.G[g].t)) + "</span>" : "") +
    '<a class="ytb' + (/^(rouler|plier|couches)$/.test(g) ? " ic" : "") + '" aria-label="' + (g ? "Voir le geste en vidéo" : "Voir en vidéo") + '" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(vq) + '" target="_blank" rel="noopener">' + IC.video + '<span class="yl">' + (g ? "Voir le geste" : "Voir en vidéo") + "</span></a></figure>";
  h += '<div class="stepn"><span class="num" aria-hidden="true">' + (i + 1) + '</span><p class="stxt" aria-live="polite"><span class="sr">Étape ' + (i + 1) + " : </span>" + CK.ann[i] + "</p></div>";
  if (ings.length) h += '<div class="cings">' + ings.map(([k,q]) => "<div><b>" + qtyLabel(k, q) + "</b><span>" + esc(I[k].n) + "</span></div>").join("") + "</div>";
  const m = timerOf(txt);
  if (m) h += timerCardHTML(m, i);
  if (i + 1 < CK.steps.length) h += '<div class="next"><span class="kicker">Ensuite</span><span>' + esc(CK.steps[i + 1]) + "</span></div>";
  else h += '<div class="next"><span class="kicker">Ensuite</span><span>C\'est la dernière étape. Plus qu\'à servir !</span></div>';
  return h + "</div>";
}
function cookFoot(){
  if (CK.i < 0) return '<div class="ffoot"><button class="btnc nxt full1" data-act="cnext">' + IC.play + "C'est parti</button></div>";
  if (CK.i >= CK.steps.length) return '<div class="ffoot"><button class="btnc prev full1" data-act="cprev">' + IC.back + "Revoir la dernière étape</button></div>";
  const last = CK.i === CK.steps.length - 1;
  return '<div class="ffoot"><button class="btnc prev" data-act="cprev">Précédente</button><button class="btnc nxt" data-act="cnext">' + (last ? "Terminé" + IC.check : "Étape suivante" + IC.next) + "</button></div>";
}
/* Carte du minuteur dans l'étape */
function timerRef(i){ return CK.rid + ":" + i; }
function readyCue(txt){
  const m = txt.match(/jusqu'à ce qu(?:e |')([^.;]+)/i); if (m) return "Prêt quand " + m[1].trim().replace(/^(il|elle|ils|elles) /, "c'est ").replace(/\s+$/,"") + ".";
  const n = txt.match(/(\d+\s*(?:à\s*\d+\s*)?min(?:utes?)?)/); return n ? "Compte " + n[1].replace("minutes","min") + "." : "";
}
function timerCardHTML(min, i){
  return '<div class="tcard" id="tcard" data-ref="' + timerRef(i) + '" data-min="' + min + '"></div>';
}
function refreshTimerCard(ended){
  const c = $("#tcard"); if (!c) return;
  const t = tmState(), mine = t && t.ref === c.dataset.ref, min = +c.dataset.min, txt = CK.steps[CK.i] || "";
  const left = mine ? tmLeft() : min*60000, frac = mine && t.total ? 1 - left/t.total : 0;
  c.className = "tcard" + (mine ? " run" : "") + (ended ? " end" : "");
  c.innerHTML = '<div class="ring">' + ringSVG(26, frac, 6) + '<span id="tleft">' + mmss(left) + '</span></div><span class="tl">' + esc(ended ? "Temps écoulé ! Vérifie la cuisson." : readyCue(txt) || "Minuteur de " + timeLabel(min)) + "</span>" +
    (mine ? '<div class="acts"><button class="tb" data-act="tpause">' + (t.paused ? IC.play + "Reprendre" : "Pause") + '</button><button class="tb" data-act="tadd" aria-label="Ajouter une minute">+1</button></div>'
          : '<button class="tb go" data-act="ctimer" data-min="' + min + '">' + IC.play + "Lancer</button>");
}
function updateTimerCard(left, frac, t){
  const c = $("#tcard"); if (!c) return;
  if (t.ref !== c.dataset.ref) return;
  if (!c.classList.contains("run")){ refreshTimerCard(); return; }
  const s = $("#tleft"); if (s) s.textContent = mmss(left);
  const fg = c.querySelector(".fg"); if (fg){ const C = 2*Math.PI*26; fg.style.strokeDashoffset = (C*(1 - frac)).toFixed(1); }
}
function cookGo(d){
  const n = CK.steps.length, j = Math.max(-1, Math.min(n, CK.i + d));
  if (j === CK.i){ const st = $("#cstage"); if (st && !reduced()){ st.classList.remove("shake"); void st.offsetWidth; st.classList.add("shake"); } return; }
  CK.dir = d; CK.i = j; buzz(6);
  const r = RBYID[CK.rid], el = $("#full");
  el.innerHTML = cookHTML();
  const sc = $("#cscroll"); if (sc) sc.scrollTop = 0;
  bindCookSwipe(); hydrate(); refreshTimerCard(); timerTick();
  if (j >= n){
    const f = $("#finale .mascot"); const rc = f ? f.getBoundingClientRect() : {left:innerWidth/2, top:innerHeight/3, width:0, height:0};
    setTimeout(() => crumbs(rc.left + rc.width/2, rc.top + rc.height/2, 34), 180);
    buzz([12, 60, 12]);
  }
  CK.dir = 0;
}
/* Glisser à gauche / à droite pour changer d'étape (suit le doigt, puis ressort) */
function bindCookSwipe(){
  const st = $("#cstage"); if (!st) return;
  let x0 = 0, y0 = 0, dx = 0, lock = 0, samples = [], anim = null;
  const set = x => { st.style.transform = x ? "translate3d(" + x.toFixed(1) + "px,0,0)" : ""; };
  st.addEventListener("touchstart", e => { if (anim){ anim.stop(); anim = null; } const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; dx = 0; lock = 0; samples = [{x:x0, t:performance.now()}]; }, {passive:true});
  st.addEventListener("touchmove", e => {
    const t = e.touches[0], mx = t.clientX - x0, my = t.clientY - y0;
    if (!lock){ if (Math.abs(mx) > 10 && Math.abs(mx) > Math.abs(my)*1.2) lock = 1; else if (Math.abs(my) > 10) lock = -1; }
    if (lock !== 1) return;
    e.preventDefault();
    const atEdge = (mx > 0 && CK.i <= -1) || (mx < 0 && CK.i >= CK.steps.length);
    dx = atEdge ? rubber(mx, innerWidth*0.5) : mx;
    set(dx); samples.push({x:t.clientX, t:performance.now()}); if (samples.length > 6) samples.shift();
  }, {passive:false});
  const end = () => {
    if (lock !== 1){ lock = 0; return; }
    lock = 0;
    const a = samples[0], b = samples[samples.length - 1];
    const v = b && a && b.t > a.t ? (b.x - a.x)/((b.t - a.t)/1000) : 0;
    const proj = dx + project(v, 0.99), W = innerWidth;
    if (proj < -W*0.28 && CK.i < CK.steps.length){ animOut(-1, v); return; }
    if (proj > W*0.28 && CK.i > -1){ animOut(1, v); return; }
    anim = spring(dx, 0, {response:0.35, damping:0.82, velocity:v}, set, () => { anim = null; });
  };
  function animOut(sign, v){
    anim = spring(dx, sign*innerWidth*0.9, {response:0.22, damping:1, velocity:v}, x => { set(x); st.style.opacity = String(Math.max(0, 1 - Math.abs(x)/innerWidth)); }, () => { anim = null; cookGo(sign < 0 ? 1 : -1); });
  }
  st.addEventListener("touchend", end, {passive:true});
  st.addEventListener("touchcancel", end, {passive:true});
}
function openCookIngs(){
  const r = RBYID[CK.rid];
  let h = phead("Ingrédients pour " + CK.people) + '<div class="pbody"><div class="ings">' +
    r.i.filter(([k]) => k !== "eau" && I[k]).map(([k,q]) => '<div class="ing' + (I[k].fl.includes("S") ? " pl" : "") + '"><b>' + qtyLabel(k, q*CK.people) + "</b><span>" + esc(I[k].n) + "</span></div>").join("") + "</div>";
  h += '<div class="sec"><h2 class="h2">Toutes les étapes</h2><div class="picks">' + CK.steps.map((s, j) => '<button class="pick" data-act="cjump" data-i="' + j + '" style="grid-template-columns:34px minmax(0,1fr)"><span class="num" style="width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-weight:800;background:' + (j === CK.i ? "var(--green)" : "var(--surface2)") + ";color:" + (j === CK.i ? "#fff" : "inherit") + '">' + (j + 1) + '</span><span class="m" style="color:var(--ink2);font-size:14px;line-height:1.4">' + esc(s) + "</span></button>").join("") + "</div></div></div>";
  openSheet(h, {state:{kind:"cookings"}, label:"Ingrédients"});
}
function closeCook(){
  FULL.awake = false;
  closeFull();
}
