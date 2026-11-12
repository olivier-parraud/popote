/* ═══ Biscuit · ouverture et premier lancement ═══ */
function showSplash(done){
  const el = document.createElement("div"); el.id = "splash";
  el.innerHTML = mascot("") + logo("on-green", true);
  document.body.appendChild(el);
  const t = reduced() ? 250 : 1250;
  setTimeout(() => { el.classList.add("out"); if (done) done(); setTimeout(() => el.remove(), 520); }, t);
}

let OB = {step:1, dir:0};
let feasTimer = null, feasCache = {};
function showOnboarding(){ OB = {step:1, dir:0}; renderOB(true); }
function obTop(){
  return '<div class="top">' + mascot("jump") + logo("on-green") + "<p>Tes repas de la semaine, sans prise de tête.</p></div>";
}
function renderOB(first){
  const el = $("#onboard"); el.hidden = false;
  if (first || !el.querySelector(".sheetb")) el.innerHTML = obTop() + '<div class="sheetb"><div class="obs" id="obs"></div><div class="obf" id="obf"></div></div>';
  const dots = '<div class="dotsteps" aria-label="Étape ' + OB.step + ' sur 3">' + [1,2,3].map(i => '<i class="' + (i === OB.step ? "on" : "") + '"></i>').join("") + "</div>";
  const anim = OB.dir > 0 ? " anim-in" : OB.dir < 0 ? " anim-back" : "";
  let h = dots + '<div class="obstep' + anim + '" style="display:flex;flex-direction:column;gap:16px">';
  if (OB.step === 1){
    h += '<div style="display:flex;flex-direction:column;gap:6px"><h1 class="h1" style="font-size:28px">Où fais-tu tes courses ?</h1><p class="note" style="margin:0;font-size:15px">Pour estimer les prix au plus juste. Tu pourras changer plus tard.</p></div>';
    h += '<div class="stores" role="group" aria-label="Magasins">' + STORES.map(s => '<button class="storeb" data-act="obstore" data-k="' + s.id + '" aria-pressed="' + (S.store === s.id && OB.picked ? "true" : "false") + '">' + storeLogo(s, "") + '<span class="nm">' + esc(s.n) + "</span></button>").join("") + "</div>";
  } else if (OB.step === 2){
    h += '<div style="display:flex;flex-direction:column;gap:6px"><h1 class="h1" style="font-size:28px">Ta semaine</h1><p class="note" style="margin:0;font-size:15px">Ton budget courses et les repas à prévoir.</p></div>';
    h += '<div class="bigbudget"><button class="iconb" data-act="obbudget" data-d="-5" aria-label="Moins 5 euros">' + IC.minus + '</button><label class="sr" for="obb">Budget par semaine en euros</label><span class="v"><input id="obb" class="input" type="number" min="5" inputmode="numeric" value="' + S.budget + '" data-in="obb" style="width:3.2ch;height:auto;padding:0;border:0;background:none;font:inherit;text-align:center;letter-spacing:inherit">€</span><button class="iconb green" data-act="obbudget" data-d="5" aria-label="Plus 5 euros">' + IC.plus + "</button></div>";
    h += '<p class="note" style="text-align:center;margin:-8px 0 0">par semaine</p>';
    h += '<div class="group"><div class="row"><span class="grow"><span class="lbl">Personnes</span></span>' + stepper("obpeople", S.people, "Une personne de moins", "Une personne de plus") + "</div>" +
      [["P","Petit-déjeuner"],["M","Midi"],["S","Soir"]].map(([m,n]) => '<div class="row"><span class="grow"><span class="lbl">' + n + "</span></span>" + sw("obmeal", m, S.meals[m], n) + "</div>").join("") +
      '<div class="row" style="flex-direction:column;align-items:stretch;gap:10px;padding:12px"><span class="lbl">Jours à prévoir</span>' + seg("obdays", [[3,"3 jours"],[5,"5 jours"],[7,"7 jours"]], S.days, "sm") + "</div></div>";
    h += '<div id="feas">' + feasHTML() + "</div>";
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:6px"><h1 class="h1" style="font-size:28px">Des choses à éviter ?</h1><p class="note" style="margin:0;font-size:15px">Facultatif. Tout se change plus tard dans les réglages.</p></div>';
    h += seg("obdiet", Object.entries(DIETS).map(([k,n]) => [k, n.replace("Je mange de tout","Tout")]), S.diet, "sm");
    h += '<div style="display:flex;flex-direction:column;gap:8px"><span class="kicker">Allergies</span><div class="chips">' + Object.entries(ALLERGENS).map(([k,n]) => '<button class="chip" data-act="oballergy" data-k="' + k + '" aria-pressed="' + S.allergies.includes(k) + '">Sans ' + n.toLowerCase() + "</button>").join("") + "</div></div>";
    h += '<div style="display:flex;flex-direction:column;gap:8px"><span class="kicker">Cuisines que tu aimes</span><div class="chips">' + Object.entries(CUISINES).map(([k,c]) => '<button class="chip" data-act="obcuisine" data-k="' + k + '" aria-pressed="' + S.cuisines.includes(k) + '">' + c.n + "</button>").join("") + "</div></div>";
  }
  h += "</div>";
  $("#obs").innerHTML = h; $("#obs").scrollTop = 0;
  const back = OB.step > 1 ? '<button class="btn" data-act="obback" aria-label="Retour">' + IC.back + "</button>" : "";
  const next = OB.step === 1 ? '<button class="btn primary" data-act="obnext"' + (OB.picked ? "" : " disabled") + ">Continuer</button>"
    : OB.step === 2 ? '<button class="btn primary" id="obNext" data-act="obnext"' + (!S.meals.P && !S.meals.M && !S.meals.S ? " disabled" : "") + ">Continuer</button>"
    : '<button class="btn primary" data-act="obfinish">' + IC.sparkle + "Créer ma semaine</button>";
  $("#obf").innerHTML = back + next;
  OB.dir = 0;
  hydrate();
}
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
  else if (S.budget >= min*1.02){ cls = "tight"; txt = "<b>Serré mais faisable.</b> " + eur(per) + " par repas : je privilégierai les plats économiques."; }
  else { cls = "low"; txt = "<b>Trop juste.</b> Compte au moins " + Math.ceil(min) + " € pour ces repas chez " + esc(store().n) + "."; }
  return '<div class="feas ' + cls + '"><i></i><span>' + txt + "</span></div>";
}
function refreshFeas(){ const f = $("#feas"); if (f) f.innerHTML = feasHTML(); const n = $("#obNext"); if (n) n.disabled = !S.meals.P && !S.meals.M && !S.meals.S; }
function potSVG(){
  return '<svg class="pot" viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="108" rx="40" ry="5" fill="#000" fill-opacity=".12"/><rect x="14" y="58" width="14" height="9" rx="4.5" fill="#1B4D2E"/><rect x="92" y="58" width="14" height="9" rx="4.5" fill="#1B4D2E"/><rect x="24" y="50" width="72" height="54" rx="14" fill="#F2C27B"/><rect x="24" y="60" width="72" height="5" fill="#fff" fill-opacity=".25"/>' +
    '<g class="lid"><ellipse cx="60" cy="48" rx="40" ry="7" fill="#D99A4E"/><rect x="52" y="36" width="16" height="9" rx="4" fill="#6B3E1C"/></g>' +
    '<path class="wisp" d="M46 30c-4-5 4-8 0-13c-3-4 2-7 0-10" stroke="#fff" stroke-width="3.4" stroke-linecap="round" fill="none"/><path class="wisp wisp2" d="M74 30c-4-5 4-8 0-13c-3-4 2-7 0-10" stroke="#fff" stroke-width="3.4" stroke-linecap="round" fill="none"/></svg>';
}
function obFinish(){
  const el = $("#onboard");
  el.innerHTML = '<div class="cooking">' + potSVG() + '<h1 class="h1" style="color:#fff;font-size:27px">Je compose ta semaine…</h1><p style="margin:0;color:#E3F1E7;max-width:28ch;line-height:1.5">Des plats variés qui tiennent dans ' + eur(S.budget) + ", chez " + esc(store().n) + ".</p></div>";
  setTimeout(() => {
    if (generateWeek()){
      S.onboarded = true; save(); UI.tab = "today"; UI.enter = true; render(); SC().scrollTop = 0;
      el.style.transition = "opacity .5s var(--ease), transform .6s var(--ease)"; el.style.opacity = "0"; el.style.transform = "scale(1.05)";
      setTimeout(() => { el.hidden = true; el.innerHTML = ""; el.style.cssText = ""; }, 560);
      buzz([10, 50, 10]); toast("Ta semaine est prête");
    } else { OB.step = 3; renderOB(true); }
  }, reduced() ? 200 : 1400);
}
