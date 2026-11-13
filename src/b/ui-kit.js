/* ═══ Biscuit · boîte à outils de l'interface ═══ */
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const SC = () => document.getElementById("scroller");
const UI = {tab:"today", enter:true, pop:null, swapSeed:0, swapQ:"", q:"", rf:"all", listMode:"aisle", tonightSeed:0, lastTotal:null, scroll:{}, store:null};
let sheetState = null;

/* ── Icônes (traits 2 px, 24×24) ── */
const P = (d, w) => '<svg viewBox="0 0 24 24" width="' + (w||20) + '" height="' + (w||20) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
const IC = {
  today:P('<path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/><circle cx="12" cy="12" r="4"/>'),
  week:P('<rect x="4" y="4.5" width="16" height="15.5" rx="2.5"/><path d="M4 9.5h16M8.5 2.5v3.5M15.5 2.5v3.5"/>'),
  list:P('<path d="M3 4h2.2l2.3 11h10.2l2.1-8H6.4"/><circle cx="9" cy="19.5" r="1"/><circle cx="17" cy="19.5" r="1"/>'),
  book:P('<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19M9 7.5h6M9 11h4"/>'),
  settings:P('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  swap:P('<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>'),
  refresh:P('<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4"/>'),
  dice:P('<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/>'),
  play:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z"/></svg>',
  plus:P('<path d="M12 5v14M5 12h14"/>'), minus:P('<path d="M5 12h14"/>'),
  close:P('<path d="M6 6l12 12M18 6 6 18"/>', 18),
  chev:'<svg class="chev" viewBox="0 0 8 14" width="8" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m1 1 6 6-6 6"/></svg>',
  back:P('<path d="m15 5-7 7 7 7"/>'), next:P('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  heart:P('<path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 8.4 5.5c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2A4.4 4.4 0 0 1 20 9.9c0 5.9-8 10.6-8 10.6Z"/>'),
  heartFill:'<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 8.4 5.5c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2A4.4 4.4 0 0 1 20 9.9c0 5.9-8 10.6-8 10.6Z"/></svg>',
  copy:P('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
  scan:P('<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16"/>'),
  clock:P('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5l3 2"/>', 16),
  ice:P('<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5 4.2 16.5"/><path d="m9.6 4.6 2.4 1.6 2.4-1.6M9.6 19.4l2.4-1.6 2.4 1.6"/>', 16),
  check:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  fire:'<svg viewBox="0 0 24 24" width="14" height="14" fill="#E8562F" aria-hidden="true"><path d="M12 22c4.4 0 7-2.9 7-6.6 0-3.4-2.3-5.6-4-7.4-.5 2-1.6 3-2.6 3.2C13 8 12.2 4.6 9.6 2c.3 3.3-1.7 5.3-3.2 7.2C5 11 5 12.6 5 15.4 5 19.1 7.6 22 12 22Z"/></svg>',
  bullets:P('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>'),
  search:P('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>', 18),
  download:P('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'), upload:P('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>'),
  trash:P('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>'),
  edit:P('<path d="M4 20h4L18.6 9.4a2.3 2.3 0 0 0-3.2-3.2L4.8 16.8 4 20z"/><path d="m13.8 7.8 3.4 3.4"/>'),
  bell:P('<path d="M6.2 9.6a5.8 5.8 0 0 1 11.6 0c0 5.6 2.4 7.4 2.4 7.4H3.8s2.4-1.8 2.4-7.4"/><path d="M10 20.4a2.3 2.3 0 0 0 4 0"/>'),
  boxes:P('<path d="M3.5 13h7v7h-7zM13.5 13h7v7h-7zM8.5 4h7v7h-7z"/>'),
  video:P('<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="m16 10.5 5-3v9l-5-3"/>'),
  sparkle:P('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>'),
  thumbsdown:P('<path d="M17 3v11"/><path d="M17 14h2.5a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 19.5 3H8.2a2 2 0 0 0-1.95 1.55l-1.7 7A2 2 0 0 0 6.5 14H10l-.9 3.6a2.3 2.3 0 0 0 2.2 2.9h.2L17 14"/>'),
  store:P('<path d="M4 9.5 5.5 4h13L20 9.5M4 9.5v10h16v-10M4 9.5c0 1.5 1.3 2.5 2.7 2.5S9.3 11 9.3 9.5c0 1.5 1.3 2.5 2.7 2.5s2.7-1 2.7-2.5c0 1.5 1.3 2.5 2.6 2.5S20 11 20 9.5M10 19.5V15h4v4.5"/>')
};

/* ── Mascotte et logo ── */
function mascot(cls){
  return '<svg class="mascot ' + (cls||"") + '" viewBox="0 0 100 100" aria-hidden="true"><rect x="23" y="29" width="56" height="48" rx="8" fill="#000" fill-opacity=".16"/><g fill="#F2C27B"><rect x="22" y="26" width="56" height="48" rx="8"/>' +
    [28,39,50,61,72].map(x => '<circle cx="' + x + '" cy="26" r="5"/><circle cx="' + x + '" cy="74" r="5"/>').join("") +
    [38,50,62].map(y => '<circle cx="22" cy="' + y + '" r="5"/><circle cx="78" cy="' + y + '" r="5"/>').join("") +
    '</g><circle cx="35" cy="55" r="3.6" fill="#E86F55" fill-opacity=".55"/><circle cx="65" cy="55" r="3.6" fill="#E86F55" fill-opacity=".55"/>' +
    '<ellipse class="eye" cx="41" cy="46" rx="2.8" ry="3.4" fill="#6B3E1C"/><ellipse class="eye" cx="59" cy="46" rx="2.8" ry="3.4" fill="#6B3E1C"/>' +
    '<path class="smile" d="M42 56 Q50 63 58 56" stroke="#6B3E1C" stroke-width="3" stroke-linecap="round" fill="none"/></svg>';
}
const WISP = (r) => '<svg viewBox="0 0 20 26" aria-hidden="true"><path class="wisp' + (r ? " wisp2" : "") + '" d="M7 24 C3 19 11 16 7 11 C4 7 9 4 7 1" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/><path class="wisp' + (r ? "" : " wisp2") + '" d="M13.5 24 C9.5 19.5 17.5 16.5 13.5 12 C11 9 15 6.5 13.5 4" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/></svg>';
function logo(cls, letters){
  if (letters){
    const L = (c, t, d) => '<span class="l ' + c + '" style="animation-delay:' + d + 'ms">' + t + "</span>";
    return '<span class="logo ' + (cls||"") + '" role="img" aria-label="biscuit.">' + L("b1","b",320) + L("b1 ii","ı" + WISP(0),370) + L("b1","s",420) + L("b2","c",470) + L("b2","u",520) + L("b2 ii","ı" + WISP(1),570) + L("b2","t",620) + L("b1 dot",".",690) + "</span>";
  }
  return '<span class="logo ' + (cls||"") + '" role="img" aria-label="biscuit."><span class="b1">b<span class="ii">ı' + WISP(0) + '</span>s</span><span class="b2">cu<span class="ii">ı' + WISP(1) + '</span>t</span><span class="b1 dot">.</span></span>';
}

/* ── Enseignes : logo officiel chargé depuis le site du magasin ── */
const STORE_SITE = {lidl:"lidl.fr", aldi:"aldi.fr", leclerc:"e.leclerc", intermarche:"intermarche.com", carrefour:"carrefour.fr", superu:"magasins-u.com", auchan:"auchan.fr", netto:"netto.fr", carrefourmarket:"carrefour.fr", grandfrais:"grandfrais.com", casino:"supercasino.fr", monoprix:"monoprix.fr", franprix:"franprix.fr", biocoop:"biocoop.fr"};
function storeLogo(s, cls){
  const site = STORE_SITE[s.id];
  const img = site ? '<img alt="" src="https://www.google.com/s2/favicons?domain=' + site + '&amp;sz=64" onload="if(this.naturalWidth>16)this.classList.add(\'in\');else this.remove()" onerror="this.remove()">' : "";
  return '<span class="store-logo ' + (cls||"") + '" aria-hidden="true">' + esc(s.n.replace(/^E\./,"").charAt(0)) + img + "</span>";
}

/* ── Petites briques ── */
const st = i => ' style="--i:' + Math.min(i, 14) + '"';
function seg(act, opts, cur, extra){
  const i = Math.max(0, opts.findIndex(o => String(o[0]) === String(cur)));
  return '<div class="seg ' + (extra||"") + '" role="group" style="--n:' + opts.length + ";--i:" + i + '"><span class="ind" aria-hidden="true"></span>' +
    opts.map(([k,n]) => '<button data-act="' + act + '" data-k="' + esc(k) + '" aria-pressed="' + (String(k) === String(cur)) + '">' + n + "</button>").join("") + "</div>";
}
function segPick(btn){
  const s = btn.closest(".seg"); if (!s) return;
  const bs = [...s.querySelectorAll("button")];
  bs.forEach(b => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
  s.style.setProperty("--i", bs.indexOf(btn));
}
const sw = (act, k, on, label) => '<button class="switch" role="switch" data-act="' + act + '" data-k="' + esc(k) + '" aria-checked="' + !!on + '" aria-label="' + esc(label) + '"></button>';
const stepper = (act, val, lessLbl, moreLbl, k) => '<div class="stepper"><button data-act="' + act + '" data-d="-1"' + (k ? ' data-k="' + k + '"' : "") + ' aria-label="' + esc(lessLbl) + '">' + IC.minus + '</button><output class="tnum">' + val + '</output><button class="plus" data-act="' + act + '" data-d="1"' + (k ? ' data-k="' + k + '"' : "") + ' aria-label="' + esc(moreLbl) + '">' + IC.plus + "</button></div>";
const box = on => '<span class="box' + (on ? " on" : "") + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>';
function deltaTag(d){ if (Math.abs(d) < 0.01) return '<span class="delta faint">±0,00 €</span>'; return '<span class="delta ' + (d > 0 ? "up" : "down") + '">' + (d > 0 ? "+" : "−") + eur(Math.abs(d)) + "</span>"; }
const CUIS_TAG = c => '<span class="tag saffron">' + esc((CUISINES[c] || {}).n || "") + "</span>";
function dayShort(d){ return cap(d.toLocaleDateString("fr-FR",{weekday:"short"}).replace(".","")); }

/* ── Heures des repas et « où en est-on » ── */
const mins = hhmm => { const [h, m] = String(hhmm || "12:00").split(":").map(Number); return h*60 + (m||0); };
const hLabel = hhmm => { const [h, m] = String(hhmm).split(":").map(Number); return h + " h" + (m ? " " + String(m).padStart(2,"0") : ""); };
function todayIndex(){ if (!S.week) return -1; const a = new Date(S.week.start + "T12:00:00"), b = new Date(todayISO() + "T12:00:00"); return Math.round((b - a)/864e5); }
function nowMins(){ const d = new Date(); return d.getHours()*60 + d.getMinutes(); }
function slotPast(s){ const ti = todayIndex(); if (s.d < ti) return true; if (s.d > ti) return false; return nowMins() > mins(S.times[s.m]) + 75; }
const slotKey = s => S.week.start + ":" + s.d + ":" + s.m;

/* ── Thème, mouvement ── */
const MQ_DARK = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
function applyTheme(){
  const dark = S.theme === "dark" || (S.theme === "auto" && MQ_DARK && MQ_DARK.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.classList.toggle("rm", !!S.reduceMotion);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", dark ? "#121210" : "#FFFFFF");
}
if (MQ_DARK && MQ_DARK.addEventListener) MQ_DARK.addEventListener("change", applyTheme);

/* ── Message en haut de l'écran ── */
let toastTimer = 0;
function toast(msg, icon){
  const t = $("#toast"); if (!t) return;
  t.innerHTML = '<span class="ic">' + (icon || IC.check) + "</span><span>" + esc(msg) + "</span>";
  t.hidden = false; t.className = ""; void t.offsetWidth; t.className = "show";
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.className = "hide"; setTimeout(() => { if (t.className === "hide") t.hidden = true; }, 320); }, 2600);
}

/* ── Son, écran allumé, miettes ── */
function beep(){
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const ctx = new C();
    [0, 0.35, 0.7].forEach(t => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.25);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3); });
  } catch(e) {}
}
let wakeLock = null;
async function keepAwake(on){
  try {
    if (on && "wakeLock" in navigator && !wakeLock){ wakeLock = await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release", () => { wakeLock = null; }); }
    else if (!on && wakeLock){ await wakeLock.release(); wakeLock = null; }
  } catch(e) {}
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && FULL.awake) keepAwake(true); });
function crumbs(x, y, n){
  if (reduced()) return;
  const colors = ["#F2C27B","#D99A4E","#2E7A4C","#E86F55","#F4B860"];
  for (let i = 0; i < (n || 26); i++){
    const c = document.createElement("i"); c.className = "crumb";
    const a = Math.random()*Math.PI*2, d = 90 + Math.random()*170;
    c.style.left = x + "px"; c.style.top = y + "px"; c.style.background = colors[i % colors.length];
    c.style.setProperty("--dx", Math.cos(a)*d + "px"); c.style.setProperty("--dy", (Math.sin(a)*d + 120) + "px"); c.style.setProperty("--rot", (Math.random()*720 - 360) + "deg");
    c.style.animationDelay = (Math.random()*80) + "ms";
    document.body.appendChild(c); setTimeout(() => c.remove(), 1600);
  }
}

/* ── Feuilles qui glissent (ressorts, glisser pour fermer) ── */
const SH = {root:null, panel:null, scrim:null, y:0, H:0, anim:null, open:false, onClose:null};
function setSheetY(y){
  SH.y = y; if (!SH.panel) return;
  SH.panel.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
  const p = Math.max(0, Math.min(1, 1 - y/SH.H));
  SH.scrim.style.opacity = p.toFixed(3);
  const s = $("#stage");
  if (s && innerWidth < 760){ s.style.transform = p > 0.001 ? "translate3d(0," + (p*8).toFixed(2) + "px,0) scale(" + (1 - 0.06*p).toFixed(4) + ")" : ""; s.style.borderRadius = (14*p).toFixed(1) + "px"; }
}
function sheetTo(y, opt, done){ if (SH.anim) SH.anim.stop(); SH.anim = spring(SH.y, y, opt || {}, setSheetY, () => { SH.anim = null; if (done) done(); }); }
function openSheet(html, opts){
  opts = opts || {};
  sheetState = opts.state || {};
  const root = $("#sheet");
  const cls = "panel" + (opts.fit ? " fit" : "") + (opts.cls ? " " + opts.cls : "");
  const inner = '<span class="grabber" aria-hidden="true"></span><div class="pscroll">' + html + "</div>";
  if (SH.open && SH.panel){
    SH.panel.className = cls; SH.panel.setAttribute("aria-label", opts.label || "");
    SH.panel.innerHTML = inner; SH.panel.style.pointerEvents = "";
    if (SH.y > 1) sheetTo(0, {response:0.38, damping:1});
  } else {
    root.innerHTML = '<div class="scrim" data-act="close"></div><div class="' + cls + '" role="dialog" aria-modal="true" aria-label="' + esc(opts.label || "") + '">' + inner + "</div>";
    root.hidden = false;
    SH.root = root; SH.panel = root.querySelector(".panel"); SH.scrim = root.querySelector(".scrim"); SH.open = true;
    SH.H = SH.panel.getBoundingClientRect().height + 40 || innerHeight;
    setSheetY(SH.H); bindSheetDrag(); sheetTo(0, {response:0.44, damping:1});
  }
  SH.onClose = opts.onClose || null;
  const f = root.querySelector("[data-autofocus]"); if (f && innerWidth >= 760) setTimeout(() => f.focus(), 380);
  hydrate();
}
function closeSheet(velocity){
  sheetState = null;
  if (!SH.open) return;
  SH.open = false;
  const panel = SH.panel, cb = SH.onClose; SH.onClose = null;
  sheetTo(SH.H, {response:0.36, damping:1, velocity:velocity || 0}, () => {
    if (SH.open) return;
    SH.root.hidden = true; SH.root.innerHTML = ""; SH.panel = null;
    const s = $("#stage"); if (s){ s.style.transform = ""; s.style.borderRadius = ""; }
  });
  if (panel) panel.style.pointerEvents = "none";
  if (cb) cb();
}
function refreshSheet(fn){ const p = $("#sheet .pscroll"); const top = p ? p.scrollTop : 0; fn(); const p2 = $("#sheet .pscroll"); if (p2) p2.scrollTop = top; }
function bindSheetDrag(){
  const panel = SH.panel;
  let startY = 0, dragging = false, samples = [], base = 0, scrollEl = null, tracking = false;
  const begin = y => { if (SH.anim){ SH.anim.stop(); SH.anim = null; } startY = y; base = SH.y; samples = [{y, t:performance.now()}]; };
  const move = y => { let ny = base + (y - startY); if (ny < 0) ny = -rubber(-ny, SH.H*0.2); setSheetY(ny); samples.push({y, t:performance.now()}); if (samples.length > 6) samples.shift(); };
  const end = () => {
    const a = samples[0], b = samples[samples.length-1];
    const v = b && a && b.t > a.t ? (b.y - a.y) / ((b.t - a.t)/1000) : 0;
    if (SH.y + project(v, 0.99) > SH.H*0.36 && SH.y > 0){ closeSheet(v); afterSheetClose(); }
    else sheetTo(0, {response:0.38, damping:0.86, velocity:v});
  };
  panel.addEventListener("touchstart", e => { if (!SH.open) return; scrollEl = panel.querySelector(".pscroll"); tracking = true; dragging = false; startY = e.touches[0].clientY; base = SH.y; }, {passive:true});
  panel.addEventListener("touchmove", e => {
    if (!tracking || !SH.open) return;
    const t = e.touches[0], dy = t.clientY - startY;
    if (!dragging){
      if (dy > 8 && (!scrollEl || scrollEl.scrollTop <= 0) && !e.target.closest(".chips.scroll,.favs,input,textarea,select")){ dragging = true; begin(t.clientY); }
      else if (Math.abs(dy) > 8){ tracking = false; return; } else return;
    }
    e.preventDefault(); move(t.clientY);
  }, {passive:false});
  panel.addEventListener("touchend", () => { if (dragging) end(); dragging = false; tracking = false; }, {passive:true});
  panel.addEventListener("touchcancel", () => { if (dragging) end(); dragging = false; tracking = false; }, {passive:true});
  panel.addEventListener("pointerdown", e => {
    if (e.pointerType !== "mouse" || !e.target.closest(".grabber,.phead,.rhero") || e.target.closest("button,a")) return;
    panel.setPointerCapture(e.pointerId); dragging = true; begin(e.clientY);
  });
  panel.addEventListener("pointermove", e => { if (dragging && e.pointerType === "mouse") move(e.clientY); });
  panel.addEventListener("pointerup", e => { if (dragging && e.pointerType === "mouse"){ dragging = false; end(); } });
}
function afterSheetClose(){ render(); }

/* ── Plein écran (cuisine, magasin, session batch, ticket) ── */
const FULL = {el:null, kind:null, anim:null, y:0, awake:false};
function openFull(html, cls, kind){
  let el = $("#full");
  const fresh = !FULL.kind;
  el.className = "full " + (cls || ""); el.innerHTML = html; el.hidden = false; FULL.kind = kind; document.body.classList.add("has-full");
  $("#tabbar").classList.add("hide");
  if (fresh){
    const H = innerHeight; FULL.y = H; el.style.transform = "translate3d(0," + H + "px,0)";
    if (FULL.anim) FULL.anim.stop();
    FULL.anim = spring(H, 0, {response:0.46, damping:1}, y => { FULL.y = y; el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)"; }, () => { el.style.transform = ""; });
  }
  hydrate();
}
function closeFull(){
  const el = $("#full"); if (!FULL.kind) return;
  FULL.kind = null; keepAwake(false); FULL.awake = false; document.body.classList.remove("has-full");
  $("#tabbar").classList.remove("hide");
  if (FULL.anim) FULL.anim.stop();
  FULL.anim = spring(FULL.y || 0, innerHeight, {response:0.4, damping:1}, y => { FULL.y = y; el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)"; }, () => { el.hidden = true; el.innerHTML = ""; el.style.transform = ""; });
  render();
}
