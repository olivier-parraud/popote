/* ═══ Biscuit · dessins animés des gestes (v2, style illustré au trait) ═══
   Scène 320 × 200. Chaque geste : titre, recherche vidéo, dessin et animation (CSS propre au geste).
   Sans animation (réglage « moins d'animations »), la pose de repos reste lisible. */
const GART = (() => {
  const L = "#5B3A21";                                        // trait
  const SK = "#F4C9A5", SKL = "#FBE0CB", CUF = "#2E7A4C", CUFD = "#245F3C";
  const ST = "#E3E8EC", STD = "#AEB8C2", STL = "#FFFFFF";     // inox
  const WD = "#E7B579", WDD = "#C98F55";                      // bois
  const E = "cubic-bezier(.65,0,.35,1)", EO = "cubic-bezier(.22,1,.36,1)", EI = "cubic-bezier(.55,0,1,.45)";
  const T = (x, y, r, s) => ' transform="translate(' + x + " " + y + ')' + (r ? " rotate(" + r + ")" : "") + (s ? " scale(" + s + ")" : "") + '"';
  const g = (cls, inner, tf) => '<g' + (cls ? ' class="' + cls + '"' : "") + (tf || "") + ">" + inner + "</g>";
  const nl = ' stroke="none"';

  /* ── Décors ── */
  const stage = (k, c1, c2) => '<defs><radialGradient id="' + k + '-bg" cx="50%" cy="30%" r="85%"><stop offset="0" stop-color="' + c2 + '"/><stop offset="1" stop-color="' + c1 + '"/></radialGradient></defs><rect width="320" height="200" fill="url(#' + k + '-bg)" stroke="none"/>';
  const boardBand = y => '<path d="M-10 ' + y + 'H330V210H-10Z" fill="' + WD + '"/><path d="M14 ' + (y + 20) + "q64-7 128 0t150 0M40 " + (y + 44) + 'q70 7 140 0t120 0" stroke="' + WDD + '" stroke-width="1.6" fill="none"/>';
  const table = (y, c, d) => '<path d="M-10 ' + y + 'H330V210H-10Z" fill="' + (c || "#EBD3AE") + '"/><path d="M-10 ' + (y + 8) + 'H330" stroke="' + (d || "#D9BC91") + '" stroke-width="2" opacity=".6"/>';
  const stove = (cx, w) => '<path d="M-10 176H330V210H-10Z" fill="#3B3632"/><ellipse cx="' + cx + '" cy="180" rx="' + w + '" ry="6" fill="#24211E"' + nl + "/>";
  const flame = (x, y, s, i) => '<g' + T(x, y, 0, s) + '><g class="gk-fl" style="animation-delay:-' + (i*0.19).toFixed(2) + 's"><path d="M0 0C-9-7-8-17 0-28C8-17 9-7 0 0Z" fill="#FF7A2F"' + nl + '/><path d="M0-1C-5-5-5-11 0-18C5-11 5-5 0-1Z" fill="#FFB43B"' + nl + '/><path d="M0-2C-2-4-2-7 0-10C2-7 2-4 0-2Z" fill="#FFE27A"' + nl + "/></g></g>";
  const fire = (cx, w, n, s, y) => { let h = ""; for (let i = 0; i < n; i++) h += flame(cx - w/2 + (i + 0.5)*w/n, y || 180, s || 1, i); return h; };
  const steam = (x, y, h, i, w) => '<path class="gk-st" style="animation-delay:-' + (i*0.75).toFixed(2) + 's" d="M' + x + " " + y + "c-8-" + (h*0.18).toFixed(1) + " 8-" + (h*0.32).toFixed(1) + " 0-" + (h*0.5).toFixed(1) + "s8-" + (h*0.32).toFixed(1) + " 0-" + (h*0.5).toFixed(1) + '" stroke="#fff" stroke-width="' + (w || 5) + '" stroke-linecap="round" fill="none" pathLength="100"/>';
  const arrow = (d, cls) => '<path class="gk-ar ' + (cls || "") + '" d="' + d + '" stroke="' + L + '" stroke-opacity=".35" stroke-width="2.2" stroke-dasharray="5 7" fill="none"/>';
  const drop = (x, y, c, cls, i) => '<path class="' + cls + '" style="animation-delay:-' + (i*0.35).toFixed(2) + 's" d="M' + x + " " + y + 'c-3 4-5 7-3 10c2 2 4 2 6 0c2-3 0-6-3-10Z" fill="' + c + '" stroke-width="1.4"/>';

  /* ── Mains et ustensiles (coordonnées locales) ── */
  /* Mains : deux styles proposés. A = peau, B = schéma blanc façon notice */
  const HSTY = {A:{f:"#F4C9A5", l:"#FBE0CB", t:"#F7D3B6", d:"#D9A07A", o:L}, B:{f:"#FFFFFF", l:"#FFFFFF", t:"#FFFFFF", d:"#BDBDBD", o:"#3A3A3A"}};
  let HS = HSTY.A;
  const hg = inner => '<g stroke="' + HS.o + '">' + inner + "</g>";
  // Main droite qui serre un manche horizontal centré en (0,0) ; l'avant-bras part vers la droite
  const GRIP = () => hg('<path d="M26-20C44-30 80-38 220-48L224 0C140 4 70 8 30 14Z" fill="' + HS.f + '"/><path d="M34-18C50-25 70-29 96-31" stroke="' + HS.l + '" stroke-width="2.6" fill="none"/>' +
    '<path d="M30-21C18-27 2-26-8-19C-15-13-16-3-12 4L28 14C36 6 38-12 30-21Z" fill="' + HS.f + '"/><path d="M2-21C10-23 20-22 26-18" stroke="' + HS.l + '" stroke-width="2.2" fill="none"/>' +
    '<path d="M19-2h9a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z" fill="' + HS.f + '"/>' +
    '<path d="M8-4h10a5.5 5.5 0 0 1 5.5 5.5v9a5.5 5.5 0 0 1-5.5 5.5h-5a5.5 5.5 0 0 1-5.5-5.5z" fill="' + HS.f + '"/>' +
    '<path d="M-3-5h10a5.5 5.5 0 0 1 5.5 5.5v10a5.5 5.5 0 0 1-5.5 5.5h-5a5.5 5.5 0 0 1-5.5-5.5z" fill="' + HS.f + '"/>' +
    '<path d="M-14-4h10a5.5 5.5 0 0 1 5.5 5.5v9a5.5 5.5 0 0 1-5.5 5.5h-5a5.5 5.5 0 0 1-5.5-5.5z" fill="' + HS.f + '"/>' +
    '<path d="M-11 6q3 2 6 0M0 7q3 2 6 0M11 6q3 2 6 0M21 6q2 1.5 5 0" stroke="' + HS.d + '" stroke-width="1.6" fill="none"/>' +
    '<path d="M4-17C-6-22-22-20-30-13C-34-9-31-4-26-5L-6-7C0-8 6-11 4-17Z" fill="' + HS.t + '"/><path d="M-30-12c3-2 6-2 7 1c0 3-3 4-6 3" fill="' + HS.l + '" stroke="' + HS.d + '" stroke-width="1.4"/>');
  // Main gauche « en griffe » : bout des doigts repliés en (0,0), avant-bras vers le haut à gauche
  const CLAW = () => hg('<path d="M-36-40L-200-170L-226-120L-28-14Z" fill="' + HS.f + '"/><path d="M-44-40L-150-126" stroke="' + HS.l + '" stroke-width="2.6" fill="none"/>' +
    '<path d="M-42-36C-30-48-6-46 6-32C12-24 12-14 6-8L-26-6C-38-12-48-26-42-36Z" fill="' + HS.f + '"/><path d="M-30-40C-20-44-8-42 0-36" stroke="' + HS.l + '" stroke-width="2.4" fill="none"/>' +
    '<path d="M-2-30C11-28 16-16 12-6C9 2 0 3-3-5Z" fill="' + HS.f + '"/><path d="M-14-28C-2-26 3-14 0-4C-3 4-12 4-15-4Z" fill="' + HS.f + '"/><path d="M-26-24C-15-22-11-12-13-3C-15 4-24 4-27-3Z" fill="' + HS.f + '"/>' +
    '<path d="M4-20q3 2 5 6M-8-18q3 2 4 6M-20-14q2 2 3 5" stroke="' + HS.d + '" stroke-width="1.6" fill="none"/>');
  // Paume posée à plat, doigts vers la gauche, avant-bras vers le haut à droite ; appui en (0,0)
  const PALM = () => hg('<path d="M16-20L170-110L196-66L26 8Z" fill="' + HS.f + '"/>' +
    '<path d="M-38-2C-40-9-35-13-28-13H4C12-24 26-22 29-11C31-1 23 6 12 6H-32C-36 6-38 2-38-2Z" fill="' + HS.f + '"/>' +
    '<path d="M-30-6H0M-28 0H4" stroke="' + HS.d + '" stroke-width="1.6" fill="none"/><path d="M8-15C14-20 22-18 25-12" stroke="' + HS.l + '" stroke-width="2.4" fill="none"/>');
  const hand = (kind, x, y, r, s, flip) => { const k = typeof kind === "function" ? kind() : kind; return '<g' + T(x, y, r, s) + ">" + (flip ? '<g transform="scale(-1 1)">' + k + "</g>" : k) + "</g>"; };
  // Couteau : pointe en (0,0) vers la gauche ; centre du manche en (126,-5)
  const KNIFE = '<path d="M0 0Q2-12 14-16L96-18V6H24Q6 6 0 0Z" fill="' + ST + '"/><path d="M22-11L92-13" stroke="' + STL + '" stroke-width="3"/>' +
    '<rect x="94" y="-19" width="8" height="26" rx="2" fill="' + STD + '"/><rect x="100" y="-14" width="52" height="18" rx="8" fill="#3B3632"/>' +
    '<circle cx="114" cy="-5" r="2" fill="#C9D2DA"' + nl + '/><circle cx="128" cy="-5" r="2" fill="#C9D2DA"' + nl + '/><circle cx="142" cy="-5" r="2" fill="#C9D2DA"' + nl + "/>";
  const knifeHand = (x, y, r, cls) => g(cls, KNIFE + hand(GRIP, 128, -5, 0, 1), T(x, y, r));
  // Poêle vue de 3/4, centre (cx, cy), manche vers la droite
  const pan = (cx, cy) => '<path d="M' + (cx + 80) + " " + (cy - 4) + "L" + (cx + 168) + " " + (cy - 32) + "Q" + (cx + 178) + " " + (cy - 34) + " " + (cx + 179) + " " + (cy - 26) + "Q" + (cx + 180) + " " + (cy - 19) + " " + (cx + 171) + " " + (cy - 17) + "L" + (cx + 86) + " " + (cy + 12) + 'Z" fill="#3B3632"/>' +
    '<ellipse cx="' + cx + '" cy="' + (cy + 10) + '" rx="92" ry="30" fill="#2B2724"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="94" ry="31" fill="#3B3632"/><ellipse cx="' + cx + '" cy="' + (cy + 2) + '" rx="81" ry="24" fill="#5A534B"/>' +
    '<path d="M' + (cx - 58) + " " + (cy - 12) + "Q" + (cx - 30) + " " + (cy - 21) + " " + cx + " " + (cy - 21) + '" stroke="#fff" stroke-opacity=".18" stroke-width="5" fill="none"/>';
  // Casserole en inox vue de côté
  const pot = (cx, top, w, bottom, body, rim, inner) => {
    body = body || "#B8C6D3"; rim = rim || "#D5DEE6"; inner = inner || "#8EC1F0";
    return '<rect x="' + (cx - w - 22) + '" y="' + (top + 14) + '" width="26" height="11" rx="5.5" fill="#8A9DAF"/><rect x="' + (cx + w - 4) + '" y="' + (top + 14) + '" width="26" height="11" rx="5.5" fill="#8A9DAF"/>' +
      '<path d="M' + (cx - w) + " " + top + "H" + (cx + w) + "V" + (bottom - 14) + "Q" + (cx + w) + " " + bottom + " " + (cx + w - 14) + " " + bottom + "H" + (cx - w + 14) + "Q" + (cx - w) + " " + bottom + " " + (cx - w) + " " + (bottom - 14) + 'Z" fill="' + body + '"/>' +
      '<path d="M' + (cx - w + 12) + " " + (top + 16) + "V" + (bottom - 12) + '" stroke="#fff" stroke-opacity=".45" stroke-width="7"/><path d="M' + (cx + w - 14) + " " + (top + 12) + "V" + (bottom - 10) + '" stroke="#000" stroke-opacity=".08" stroke-width="10"/>' +
      '<ellipse cx="' + cx + '" cy="' + top + '" rx="' + w + '" ry="' + (w*0.19).toFixed(1) + '" fill="' + rim + '"/><ellipse cx="' + cx + '" cy="' + (top + 1.5) + '" rx="' + (w - 8) + '" ry="' + (w*0.14).toFixed(1) + '" fill="' + inner + '"/>';
  };
  // Bol vu de 3/4
  const bowl = (cx, rim, w, fill, inside, deep) => {
    const d = deep || 0.78;
    return '<ellipse cx="' + cx + '" cy="' + (rim + w*d + 4) + '" rx="' + (w*0.62) + '" ry="7" fill="#5A3A1A" fill-opacity=".12"' + nl + "/>" +
      '<path d="M' + (cx - w) + " " + rim + "Q" + (cx - w + 4) + " " + (rim + w*d) + " " + cx + " " + (rim + w*d) + "Q" + (cx + w - 4) + " " + (rim + w*d) + " " + (cx + w) + " " + rim + 'Z" fill="' + fill + '"/>' +
      '<path d="M' + (cx - w + 12) + " " + (rim + 12) + "Q" + (cx - w + 20) + " " + (rim + w*d*0.75) + " " + (cx - w*0.35) + " " + (rim + w*d*0.9) + '" stroke="#fff" stroke-opacity=".45" stroke-width="6" fill="none"/>' +
      '<ellipse cx="' + cx + '" cy="' + rim + '" rx="' + w + '" ry="' + (w*0.2).toFixed(1) + '" fill="#F1ECE3"/><ellipse cx="' + cx + '" cy="' + (rim + 2) + '" rx="' + (w - 9) + '" ry="' + (w*0.15).toFixed(1) + '" fill="' + inside + '"/>';
  };
  const shadowE = (cx, cy, rx, ry) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#5A3A1A" fill-opacity=".1" stroke="none"/>';
  const SPOON = '<path d="M0 0L-96 0" stroke="' + WDD + '" stroke-width="11"/><path d="M0 0L-96 0" stroke="' + WD + '" stroke-width="5.5"/><ellipse cx="-110" cy="0" rx="18" ry="11" fill="' + WD + '"/><ellipse cx="-112" cy="-2" rx="9" ry="5" fill="#F2CB95"' + nl + "/>";

  const KIT = ".gx .gk-fl{transform-box:fill-box;transform-origin:50% 100%;animation:gkFl 1.2s ease-in-out infinite}@keyframes gkFl{0%,100%{transform:scale(1,1)}30%{transform:scale(.86,1.14)}65%{transform:scale(1.07,.9)}}" +
    ".gx .gk-st{stroke-dasharray:60 140;stroke-dashoffset:60;animation:gkSt 3s cubic-bezier(.4,0,.3,1) infinite}@keyframes gkSt{0%{stroke-dashoffset:60;opacity:0}20%{opacity:.9}100%{stroke-dashoffset:-100;opacity:0}}" +
    ".gx .gk-ar{animation:gkAr 1.4s linear infinite}@keyframes gkAr{to{stroke-dashoffset:-24}}" +
    "@media (prefers-reduced-motion:reduce){.gx *{animation:none!important}.gx .gk-st{stroke-dasharray:none;opacity:.75}}" +
    "html.rm .gx *{animation:none!important}html.rm .gx .gk-st{stroke-dasharray:none;opacity:.75}";

  const A = {};
  const kf = (k, name, frames) => "@keyframes " + k + name + "{" + frames + "}";
  const an = (k, sel, name, dur, ease, extra) => ".gx-" + k + " " + sel + "{transform-box:fill-box;transform-origin:50% 50%;animation:" + k + name + " " + dur + "s " + (ease || E) + " infinite" + (extra ? ";" + extra : "") + "}";
  // Étapes affichées en haut du dessin ; la pastille active s'allume en vert pendant sa fenêtre (en % de la boucle)
  const chips = (k, items) => {
    const w = items.map(([t]) => 18 + t.length*6.3), gap = 6, tot = w.reduce((a, b) => a + b, 0) + gap*(items.length - 1);
    let x = 160 - tot/2, h = "";
    items.forEach(([t], i) => { h += '<g class="cp cp' + i + '"><rect x="' + x.toFixed(1) + '" y="10" width="' + w[i].toFixed(1) + '" height="22" rx="11" fill="#fff" stroke-width="1.6"/><text x="' + (x + w[i]/2).toFixed(1) + '" y="25" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11.5" font-weight="700" fill="' + L + '" stroke="none">' + t + "</text></g>" +
      '<g class="ca ca' + i + '"><rect x="' + x.toFixed(1) + '" y="10" width="' + w[i].toFixed(1) + '" height="22" rx="11" fill="#2E7A4C" stroke="#2E7A4C" stroke-width="1.6"/><text x="' + (x + w[i]/2).toFixed(1) + '" y="25" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11.5" font-weight="700" fill="#fff" stroke="none">' + t + "</text></g>"; x += w[i] + gap; });
    return h;
  };
  const chipsCss = (k, items, dur) => ".gx-" + k + " .ca{opacity:0}" + items.map(([, a, b], i) => ".gx-" + k + " .ca" + i + "{animation:" + k + "Ca" + i + " " + dur + "s linear infinite}@keyframes " + k + "Ca" + i + "{0%," + Math.max(0, a - 0.01) + "%{opacity:0}" + (a + 0.5) + "%," + (b - 0.5) + "%{opacity:1}" + b + "%,100%{opacity:0}}").join("");

  /* 1 · Émincer */
  A.emincer = {t:"Émincer", v:"couper en rondelles", c:["#F6DEBF","#FFF6E8"],
    d: () => boardBand(150) +
      '<path d="M200 116H44Q24 116 24 136Q24 156 44 156H200Z" fill="#4E9A5A"/><path d="M40 124H196M36 136H196M40 148H196" stroke="#7CC07F" stroke-width="2.4" fill="none"/><path d="M36 120Q28 136 36 152" stroke="#3E7F48" stroke-width="2.4" fill="none"/>' +
      '<ellipse cx="200" cy="136" rx="7" ry="20" fill="#E6F2CF"/><circle cx="200" cy="130" r="1.4" fill="#9CC48A" stroke="none"/><circle cx="201" cy="140" r="1.4" fill="#9CC48A" stroke="none"/>' +
      [0,1,2,3].map(i => g("sl sl" + i, '<g' + T(212, 136) + '><ellipse rx="7" ry="20" fill="#4E9A5A"/><ellipse rx="4.6" ry="16" fill="#E6F2CF" stroke-width="1.2"/><circle cy="-5" r="1.2" fill="#9CC48A" stroke="none"/><circle cy="5" r="1.2" fill="#9CC48A" stroke="none"/></g>')).join("") +
      g("ha", hand(CLAW, 176, 118, 0, 1)) +
      g("kn", knifeHand(184, 160, -50)),
    css: k => an(k, ".kn", "K", 1.2, E) + kf(k, "K", "0%,100%{transform:translate(20px,-26px)}42%,58%{transform:translate(0,0)}") +
      an(k, ".ha", "H", 1.2, E) + kf(k, "H", "0%,58%{transform:none}75%{transform:translateX(5px)}100%{transform:none}") +
      [0,1,2,3].map(i => an(k, ".sl" + i, "S" + i, 4.8, "linear", "animation-delay:" + (i*1.2 - 4.8 + 0.6).toFixed(1) + "s")).join("") +
      [0,1,2,3].map(i => kf(k, "S" + i, "0%{opacity:0;transform:none}2%{opacity:1;transform:none;animation-timing-function:" + EI + "}12%{opacity:1;transform:translate(" + (26 + i*16) + "px,22px) rotate(80deg);animation-timing-function:" + EO + "}16%,92%{opacity:1;transform:translate(" + (26 + i*16) + "px,22px) rotate(90deg)}100%{opacity:0;transform:translate(" + (26 + i*16) + "px,22px) rotate(90deg)}")).join("")};
  A.emincer_b = {t:"Émincer", v:"comment émincer un oignon", c:["#F6DEBF","#FFF6E8"],
    d: () => boardBand(150) +
      '<path d="M40 168C40 118 68 96 112 96C156 96 196 118 196 168Z" fill="#F1D19C"/><path d="M58 168C58 128 80 110 112 110C144 110 176 128 178 168M80 168C80 138 94 124 112 124C130 124 152 138 156 168" fill="none" stroke="#C99A5C" stroke-width="1.8"/><path d="M40 168C40 118 68 96 112 96C156 96 196 118 196 168" fill="none" stroke="#B9783A" stroke-width="4"/>' +
      [0,1,2,3].map(i => g("sl sl" + i, '<g' + T(208, 168) + '><path d="M0 0C0-34 12-56 20-60" fill="none" stroke="' + L + '" stroke-width="9"/><path d="M0 0C0-34 12-56 20-60" fill="none" stroke="#F6E2BC" stroke-width="5"/><path d="M0 0C0-34 12-56 20-60" fill="none" stroke="#E2C48C" stroke-width="1.2"/></g>')).join("") +
      g("ha", hand(CLAW, 166, 108, 10, 1)) +
      g("kn", knifeHand(192, 172, -52)),
    css: k => an(k, ".kn", "K", 1.2, E) + kf(k, "K", "0%,100%{transform:translate(20px,-26px)}42%,58%{transform:translate(0,0)}") +
      an(k, ".ha", "H", 1.2, E) + kf(k, "H", "0%,58%{transform:none}75%{transform:translateX(5px)}100%{transform:none}") +
      [0,1,2,3].map(i => an(k, ".sl" + i, "S" + i, 4.8, "linear", "animation-delay:" + (i*1.2 - 4.8 + 0.6).toFixed(1) + "s;transform-origin:0 100%")).join("") +
      [0,1,2,3].map(i => kf(k, "S" + i, "0%{opacity:0;transform:none}2%{opacity:1;transform:none;animation-timing-function:" + EO + "}14%,92%{opacity:1;transform:translate(" + (14 + i*20) + "px,0) rotate(" + (24 + i*6) + "deg)}100%{opacity:0;transform:translate(" + (14 + i*20) + "px,0) rotate(" + (24 + i*6) + "deg)}")).join("")};

  /* 2 · Couper en dés */
  A.des = {t:"Couper en dés", v:"couper en dés technique", c:["#F6DEBF","#FFF6E8"],
    d: () => boardBand(140) +
      '<path d="M40 136H150Q160 136 160 147Q160 158 150 158H40Q30 158 30 147Q30 136 40 136Z" fill="#F08A3C"/><path d="M42 141H150" stroke="#F8B27A" stroke-width="3"/><path d="M60 136v22M84 136v22M108 136v22" stroke="#D9692A" stroke-width="1.2"/>' +
      [[176,150,0],[194,152,1],[212,149,2],[184,136,3],[202,137,4],[222,154,5]].map(([x,y,i]) => g("cu cu" + i, '<path d="M' + x + " " + y + 'l9-5 9 5v10l-9 5-9-5z" fill="#F08A3C"/><path d="M' + x + " " + y + 'l9 5 9-5M' + (x + 9) + " " + (y + 5) + 'v10" stroke-width="1.4" fill="none"/><path d="M' + x + " " + y + 'l9-5 9 5-9 5z" fill="#F8B27A"/>')).join("") +
      hand(CLAW, 122, 132, -4, 0.95) +
      g("kn", knifeHand(164, 158, -70)),
    css: k => an(k, ".kn", "K", 0.8, E, "transform-origin:100% 0") + kf(k, "K", "0%,100%{transform:translateY(-26px)}50%{transform:translateY(0)}62%{transform:translateY(0)}") +
      [0,1,2,3,4,5].map(i => an(k, ".cu" + i, "C", 4.8, EO, "animation-delay:" + (0.4 + i*0.8 - 4.8).toFixed(1) + "s")).join("") + kf(k, "C", "0%{opacity:0;transform:translate(-22px,-6px) rotate(-30deg)}10%{opacity:1;transform:none}90%{opacity:1}100%{opacity:0}")};

  /* 3 · Hacher */
  const leaf = (x, y, a, c) => '<path d="M' + x + " " + y + 'c4-6 12-6 14 0c-2 6-10 6-14 0z" fill="' + c + '" stroke-width="1.3" transform="rotate(' + a + " " + (x + 7) + " " + y + ')"/>';
  A.hacher = {t:"Hacher", v:"hacher des herbes au couteau", c:["#E2EFE3","#F5FBF5"],
    d: () => boardBand(140) +
      g("hb", [[84,156,20],[100,150,-30],[116,158,60],[132,152,10],[148,158,-40],[164,151,35],[180,157,-10],[96,162,45],[124,163,-20],[152,164,70],[110,146,-60],[140,145,25],[170,163,-15],[186,148,40],[92,147,15]].map(([x,y,a], i) => g("lf lf" + (i % 4), leaf(x, y, a, i % 2 ? "#5DB86A" : "#3E9A4F"))).join("")) +
      g("kn", knifeHand(70, 154, -8)),
    css: k => an(k, ".kn", "K", 0.75, E, "transform-origin:0 100%") + kf(k, "K", "0%,100%{transform:rotate(0)}50%{transform:rotate(-14deg)}") +
      an(k, ".hb", "H", 3, E) + kf(k, "H", "0%,100%{transform:none}50%{transform:translateX(10px)}") +
      ".gx-" + k + " .lf{transform-box:fill-box;transform-origin:50% 50%}" + [0,1,2,3].map(i => an(k, ".lf" + i, "L", 0.75, E, "animation-delay:-" + (i*0.18).toFixed(2) + "s")).join("") + kf(k, "L", "0%,100%{transform:none}50%{transform:translateY(-4px) rotate(25deg)}")};

  /* 4 · Éplucher */
  A.eplucher = {t:"Éplucher", v:"éplucher avec un économe", c:["#F6DEBF","#FFF6E8"],
    d: () => boardBand(150) +
      '<g transform="rotate(-24 160 110)"><path d="M70 104L232 98Q246 106 232 116L70 118Q62 111 70 104Z" fill="#F08A3C"/><path d="M150 101L232 98Q246 106 232 116L150 117Z" fill="#F8A564"/><path d="M84 107L226 103" stroke="#FFC79A" stroke-width="3"/><path d="M70 104C58 96 48 90 40 92M70 108C56 108 46 112 40 118M70 112C60 118 54 126 54 132" stroke="#3E9A4F" stroke-width="5" fill="none"/></g>' +
      g("pe", '<path d="M170 170c8 6 18 6 24 0s16-6 22 0" stroke="' + L + '" stroke-width="6.5" fill="none"/><path d="M170 170c8 6 18 6 24 0s16-6 22 0" stroke="#F8A564" stroke-width="3" fill="none"/>') +
      hand(CLAW, 96, 128, 60, 0.9) +
      g("ec", '<g transform="rotate(-24 160 110)"><g' + T(170, 92) + '><path d="M-8 12H8V-6H-8Z" fill="none" stroke="' + STD + '" stroke-width="3.4"/><path d="M-6 12H6" stroke="' + L + '" stroke-width="2"/><rect x="-6" y="-40" width="12" height="36" rx="6" fill="' + CUF + '"/>' + hand(GRIP, 0, -24, -90, 0.85) + "</g></g>"),
    css: k => an(k, ".ec", "E", 1.3, E) + kf(k, "E", "0%,100%{transform:translate(-30px,-14px)}50%{transform:translate(40px,18px)}") +
      an(k, ".pe", "P", 1.3, EO) + kf(k, "P", "0%,45%{opacity:0;transform:translate(-30px,-26px) rotate(-20deg)}70%{opacity:1;transform:none}100%{opacity:0;transform:translateY(6px)}")};

  /* 5 · Râper */
  A.raper = {t:"Râper", v:"comment râper", c:["#E2EFE3","#F5FBF5"],
    d: () => table(170) + '<ellipse cx="150" cy="176" rx="78" ry="10" fill="#fff"/>' +
      g("pi", '<path d="M118 176q16-14 32-12t30 12z" fill="#F5D777"/><path d="M128 172l6-4M142 170l4-5M158 170l5-4M170 173l4-3" stroke="#E0B84A" stroke-width="1.6"/>') +
      '<path d="M112 168L124 40H176L188 168Z" fill="#D4DCE3"/><path d="M176 40L188 168H198L184 40Z" fill="#AEB8C2"/><path d="M134 40V24Q150 10 166 24V40" stroke="#3B3632" stroke-width="7" fill="none"/>' +
      [58,76,94,112,130,148].map((y, r) => [0,1,2,3].map(c => '<path d="M' + (130 + c*12 - r*1.2) + " " + y + 'q4-3 8 0" stroke="' + L + '" stroke-width="1.6" fill="none"/>').join("")).join("") +
      [0,1,2,3,4].map(i => '<path class="sh sh' + i + '" d="M' + (136 + i*7) + ' 120l2 7" stroke="#E0B84A" stroke-width="2.6"/>').join("") +
      g("ch", '<path d="M196 70L244 60L254 104L206 114Z" fill="#F5D777"/><path d="M196 70L244 60L248 66L200 76Z" fill="#FBE79F"/><circle cx="226" cy="90" r="4" fill="#E0B84A" stroke-width="1.2"/>' + hand(GRIP, 236, 88, -80, 0.95)),
    css: k => an(k, ".ch", "C", 0.7, E) + kf(k, "C", "0%,100%{transform:translate(-14px,-22px)}50%{transform:translate(-16px,28px)}") +
      [0,1,2,3,4].map(i => an(k, ".sh" + i, "S", 0.9, EI, "animation-delay:-" + (i*0.18).toFixed(2) + "s")).join("") + kf(k, "S", "0%{opacity:0;transform:none}20%{opacity:1}100%{opacity:0;transform:translateY(46px)}") +
      an(k, ".pi", "P", 4, EO, "transform-origin:50% 100%") + kf(k, "P", "0%{transform:scale(.6)}100%{transform:scale(1.05)}")};

  /* 6 · Écraser */
  A.ecraser = {t:"Écraser", v:"écraser à la fourchette ou au presse-purée", c:["#F8E2CB","#FFF5EA"],
    d: () => table(176) + bowl(160, 120, 96, "#FFFFFF", "#F2D27A", 0.62) +
      g("lu", [[120,118],[146,114],[176,118],[200,116],[160,124],[132,125],[190,126]].map(([x,y]) => '<ellipse cx="' + x + '" cy="' + y + '" rx="13" ry="7" fill="#F7E2A3"/>').join("")) +
      g("ma", '<path d="M126 108h68l-6-12-10 0-6 12-10-12-10 12-10-12-10 12z" fill="none" stroke="' + STD + '" stroke-width="4" stroke-linejoin="round"/><path d="M160 96V52" stroke="' + STD + '" stroke-width="6"/><rect x="152" y="20" width="16" height="36" rx="8" fill="' + CUF + '"/>' + hand(GRIP, 160, 36, -90, 0.95)),
    css: k => an(k, ".ma", "M", 1.1, E) + kf(k, "M", "0%,100%{transform:translateY(-26px)}48%{transform:translateY(4px)}60%{transform:translateY(4px)}") +
      an(k, ".lu", "L", 1.1, E, "transform-origin:50% 100%") + kf(k, "L", "0%,40%,100%{transform:scale(1,1)}52%,62%{transform:scale(1.06,.55)}")};

  /* 7 · Faire revenir */
  A.revenir = {t:"Faire revenir", v:"faire revenir", c:["#F5DCC2","#FFF3E6"],
    d: () => stove(150, 70) + fire(150, 130, 6, 1.05) + pan(140, 132) +
      g("pc", [[112,128,20,"#F2DFA6"],[128,136,-15,"#E2AE55"],[146,126,35,"#F2DFA6"],[164,134,-25,"#E9A94B"],[140,140,10,"#F2DFA6"],[100,138,40,"#E9C77A"],[178,126,15,"#F2DFA6"],[156,142,-40,"#E2AE55"],[120,121,-5,"#E9C77A"]].map(([x,y,a,c], i) =>
        g("b b" + (i % 3), '<ellipse cx="' + x + '" cy="' + y + '" rx="9" ry="4" fill="' + c + '" stroke-width="1.4" transform="rotate(' + a + " " + x + " " + y + ')"/>')).join("")) +
      g("sp", '<path d="M150 128L66 34" stroke="' + WDD + '" stroke-width="10"/><path d="M150 128L66 34" stroke="' + WD + '" stroke-width="5"/><path d="M138 120L162 140L170 130L148 110Z" fill="' + WD + '"/>' + hand(GRIP, 84, 54, -132, 0.95)) +
      steam(170, 108, 50, 0) + steam(196, 112, 44, 1) + steam(112, 106, 40, 2),
    css: k => an(k, ".sp", "S", 2, E) + kf(k, "S", "0%,100%{transform:translate(0,0)}25%{transform:translate(22px,-6px)}50%{transform:translate(30px,6px)}75%{transform:translate(8px,8px)}") +
      ".gx-" + k + " .b{transform-origin:50% 50%}" + [0,1,2].map(i => an(k, ".b" + i, "B", 1, E, "animation-delay:-" + (i*0.33).toFixed(2) + "s")).join("") + kf(k, "B", "0%,100%{transform:none}40%{transform:translateY(-9px) rotate(30deg)}70%{transform:none}")};

  /* 8 · Laisser mijoter */
  A.mijoter = {t:"Laisser mijoter", v:"laisser mijoter à couvert", c:["#F9DED6","#FFF3EF"],
    d: () => stove(160, 64) + fire(160, 70, 4, 0.6) +
      '<rect x="62" y="98" width="26" height="12" rx="6" fill="#A8311D"/><rect x="232" y="98" width="26" height="12" rx="6" fill="#A8311D"/><path d="M78 88H242V160Q242 176 226 176H94Q78 176 78 160Z" fill="#C73A23"/><path d="M90 104V164" stroke="#fff" stroke-opacity=".28" stroke-width="8"/>' +
      '<ellipse cx="160" cy="88" rx="82" ry="15" fill="#A8311D"/><ellipse cx="160" cy="89" rx="74" ry="11" fill="#D9682F"/>' +
      [0,1,2].map(i => '<circle class="bu bu' + i + '" cx="' + (196 + i*12) + '" cy="88" r="4" fill="#F3A15E"/>').join("") +
      g("li", '<g transform="rotate(-8 82 86)"><path d="M76 86Q160 50 244 86Z" fill="#C73A23"/><ellipse cx="160" cy="86" rx="84" ry="10" fill="#A8311D"/><rect x="148" y="56" width="24" height="12" rx="5" fill="#3B3632"/><path d="M100 76Q130 66 160 64" stroke="#fff" stroke-opacity=".3" stroke-width="5" fill="none"/></g>') +
      steam(214, 70, 46, 0) + steam(232, 76, 40, 1),
    css: k => an(k, ".li", "L", 2.4, E, "transform-origin:0 100%") + kf(k, "L", "0%,60%,100%{transform:rotate(0)}68%{transform:rotate(-3deg) translateY(-3px)}76%{transform:rotate(1deg)}84%{transform:rotate(-1.5deg)}") +
      [0,1,2].map(i => an(k, ".bu" + i, "B", 1.6, EO, "animation-delay:-" + (i*0.5).toFixed(1) + "s;transform-origin:50% 50%")).join("") + kf(k, "B", "0%{transform:scale(.2);opacity:0}40%{opacity:1}100%{transform:scale(1.4);opacity:0}")};

  /* 9 · Eau bouillante */
  A.bouillir = {t:"Cuire à l'eau bouillante", v:"cuire des pâtes dans l'eau bouillante", c:["#DCE8F7","#F3F8FE"],
    d: () => stove(160, 80) + fire(160, 150, 7, 1.1) + pot(160, 104, 86, 176) +
      g("pa", [-30,-18,-6,6,18,30].map((dx, i) => { const x0 = 160 + dx*0.9, y0 = 104 + 4 - Math.abs(dx)*0.06, x1 = 160 + dx*2.2, y1 = 34 + Math.abs(dx)*0.6; return '<path d="M' + x0 + " " + y0 + "L" + x1 + " " + y1 + '" stroke="' + L + '" stroke-width="5.6"/><path d="M' + x0 + " " + y0 + "L" + x1 + " " + y1 + '" stroke="#F5D777" stroke-width="2.8"/>'; }).join("")) +
      '<path d="M74 104A86 16.3 0 0 0 246 104" fill="none" stroke="' + L + '" stroke-width="9"/><path d="M74 104A86 16.3 0 0 0 246 104" fill="none" stroke="#D5DEE6" stroke-width="5"/>' +
      [[100,0],[124,1],[150,2],[176,3],[204,4],[136,5],[190,6],[112,7],[218,8]].map(([x,i]) => '<circle class="bu" style="animation-delay:-' + (i*0.27).toFixed(2) + 's" cx="' + x + '" cy="108" r="5" fill="#EAF4FE" stroke-width="1.5"/>').join("") +
      steam(116, 86, 52, 0) + steam(160, 82, 58, 1) + steam(204, 86, 52, 2),
    css: k => an(k, ".bu", "Bu", 1.5, EI) + kf(k, "Bu", "0%{transform:translateY(4px) scale(.2);opacity:0}30%{opacity:1}80%{transform:translateY(-1px) scale(1.1);opacity:1}100%{transform:translateY(-3px) scale(1.5);opacity:0}") +
      an(k, ".pa", "P", 3.6, E, "transform-origin:50% 100%") + kf(k, "P", "0%,100%{transform:none}50%{transform:translateY(5px) rotate(-2deg)}")};

  /* 10 · Égoutter */
  A.egoutter = {t:"Égoutter", v:"égoutter dans une passoire", c:["#DCE8F7","#F3F8FE"],
    d: () => '<path d="M-10 150H330V210H-10Z" fill="#C9D4DE"/><path d="M40 150H280V196Q280 204 272 204H48Q40 204 40 196Z" fill="#A7B6C4"/>' +
      '<path d="M86 104H234Q228 160 160 166Q92 160 86 104Z" fill="#B8C6D3"/>' + [[110,120],[130,124],[150,126],[170,126],[190,124],[210,120],[122,140],[142,144],[162,145],[182,144],[200,140],[150,158],[170,158]].map(([x,y]) => '<circle cx="' + x + '" cy="' + y + '" r="2.6" fill="#7E91A3" stroke="none"/>').join("") +
      '<ellipse cx="160" cy="104" rx="74" ry="13" fill="#D5DEE6"/><ellipse cx="160" cy="105" rx="66" ry="9" fill="#F1D9A5"/>' +
      [[132,103],[146,100],[160,104],[174,100],[188,104],[152,108],[168,108]].map(([x,y]) => '<circle cx="' + x + '" cy="' + y + '" r="5" fill="#F6E3B6" stroke-width="1.3"/>').join("") +
      [[130,0],[150,1],[170,2],[190,3],[160,4]].map(([x,i]) => drop(x, 166, "#6FA8E6", "dr", i)).join("") +
      g("po", '<g transform="rotate(-38 236 46)"><rect x="196" y="16" width="86" height="58" rx="10" fill="#B8C6D3"/><ellipse cx="196" cy="45" rx="10" ry="29" fill="#D5DEE6"/><ellipse cx="197" cy="45" rx="7" ry="24" fill="#8EC1F0"/><rect x="282" y="36" width="34" height="11" rx="5.5" fill="#8A9DAF"/></g>') +
      '<path class="wa" d="M196 80Q178 84 168 102" stroke="#8EC1F0" stroke-width="10" fill="none" stroke-dasharray="10 6"/>' + steam(214, 52, 40, 0) + steam(140, 92, 36, 1),
    css: k => an(k, ".po", "P", 3, E, "transform-origin:100% 100%") + kf(k, "P", "0%,100%{transform:rotate(-8deg)}30%,75%{transform:rotate(0)}") +
      an(k, ".wa", "W", 3, "linear") + kf(k, "W", "0%,22%{opacity:0;stroke-dashoffset:0}32%,72%{opacity:1}80%,100%{opacity:0;stroke-dashoffset:-96}") +
      an(k, ".dr", "D", 1.4, EI) + kf(k, "D", "0%{transform:none;opacity:0}15%{opacity:1}100%{transform:translateY(26px);opacity:0}")};

  /* 11 · Au four */
  A.four = {t:"Au four", v:"préchauffer le four", c:["#FBEACB","#FFF7E8"],
    d: () => table(184, "#E2CDA8") + '<rect x="70" y="20" width="180" height="168" rx="16" fill="#3B3632"/><path d="M82 20H238Q250 20 250 32V50H70V32Q70 20 82 20Z" fill="#4C4741"/>' +
      g("di", '<circle cx="96" cy="35" r="8" fill="#CFCDC5"/><path d="M96 35V29" stroke="' + L + '" stroke-width="2.4"/>') + '<circle cx="120" cy="35" r="8" fill="#CFCDC5"/><path d="M120 35l5-3" stroke="' + L + '" stroke-width="2.4"/><rect x="176" y="27" width="56" height="16" rx="4" fill="#141412"/>' +
      '<text class="tp" x="204" y="39.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="800" fill="#FF8A3D" stroke="none">200°</text>' +
      '<rect x="92" y="58" width="136" height="8" rx="4" fill="#CFCDC5"/><rect x="84" y="72" width="152" height="104" rx="12" fill="#2A2724"/>' +
      '<rect class="gl" x="90" y="78" width="140" height="92" rx="9" fill="#F7A65A" stroke="none"/><path class="re" d="M100 88H220M100 160H220" stroke="#FF5A2A" stroke-width="3.4"/>' +
      '<rect x="116" y="128" width="88" height="22" rx="6" fill="#fff"/><path d="M120 128Q160 106 200 128Z" fill="#C24F2C"/><circle cx="140" cy="121" r="3" fill="#F6E9CF" stroke="none"/><circle cx="160" cy="116" r="3" fill="#F6E9CF" stroke="none"/><circle cx="180" cy="121" r="3" fill="#F6E9CF" stroke="none"/>' +
      [0,1,2].map(i => '<path class="hw hw' + i + '" d="M' + (134 + i*26) + ' 110c-5-6 5-10 0-16c-4-5 4-9 0-14" stroke="#FFE0B5" stroke-width="2.6" fill="none"/>').join("") +
      '<path d="M92 72H228" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>',
    css: k => an(k, ".gl", "G", 2.4, E) + kf(k, "G", "0%,100%{opacity:1}50%{opacity:.78}") + an(k, ".re", "R", 2.4, E) + kf(k, "R", "0%,100%{opacity:.6}50%{opacity:1}") +
      [0,1,2].map(i => an(k, ".hw" + i, "H", 2.2, "ease-out", "animation-delay:-" + (i*0.7).toFixed(1) + "s")).join("") + kf(k, "H", "0%{opacity:0;transform:translateY(8px)}35%{opacity:.9}100%{opacity:0;transform:translateY(-10px)}") +
      an(k, ".di", "D", 4.8, E, "transform-origin:50% 50%") + kf(k, "D", "0%,100%{transform:rotate(-60deg)}30%,70%{transform:rotate(60deg)}")};

  /* 12 · Frire */
  A.frire = {t:"Frire", v:"friture à la poêle sans danger", c:["#F8E3C5","#FFF6E8"],
    d: () => stove(160, 80) + fire(160, 150, 7, 1) +
      '<rect x="56" y="112" width="26" height="12" rx="6" fill="#3B3632"/><rect x="238" y="112" width="26" height="12" rx="6" fill="#3B3632"/><path d="M76 100H244V160Q244 176 228 176H92Q76 176 76 160Z" fill="#3B3632"/><ellipse cx="160" cy="100" rx="84" ry="16" fill="#55524B"/><ellipse cx="160" cy="101" rx="76" ry="12" fill="#E9B949"/>' +
      [[110,98,-12],[148,103,8],[186,99,-4]].map(([x,y,a]) => '<rect x="' + (x - 13) + '" y="' + (y - 4) + '" width="26" height="9" rx="4.5" fill="#D98E2E" transform="rotate(' + a + " " + x + " " + y + ')"/>').join("") +
      [[96,0],[124,1],[136,2],[170,3],[200,4],[214,5],[160,6]].map(([x,i]) => '<circle class="bu" style="animation-delay:-' + (i*0.2).toFixed(1) + 's" cx="' + x + '" cy="102" r="3.4" fill="#FFF3C4" stroke-width="1.2"/>').join("") +
      g("sk", '<path d="M262 18L196 72" stroke="#3B3632" stroke-width="7"/><ellipse cx="186" cy="80" rx="24" ry="9" fill="#AEB8C2"/><path d="M168 78h36M172 83h28" stroke="#8E9BA7" stroke-width="1.4"/><rect x="174" y="70" width="24" height="8" rx="4" fill="#E9A23B"/>' + hand(GRIP, 250, 28, -40, 0.9)),
    css: k => an(k, ".bu", "B", 0.9, "ease-out", "transform-origin:50% 50%") + kf(k, "B", "0%{transform:scale(.3);opacity:0}40%{opacity:1}100%{transform:scale(1.4) translateY(-4px);opacity:0}") +
      an(k, ".sk", "S", 2.6, E) + kf(k, "S", "0%,100%{transform:translate(0,18px)}45%,60%{transform:translate(0,-12px)}")};

  /* 13 · Retourner */
  A.retourner = {t:"Retourner", v:"retourner une crêpe", c:["#F5DCC2","#FFF3E6"],
    d: () => stove(140, 70) + fire(140, 120, 5, 1) +
      arrow("M100 100Q110 50 140 46Q170 50 180 100", "ar") +
      g("pn", pan(140, 134) + hand(GRIP, 292, 110, -18, 1)) +
      g("cr", '<ellipse cx="140" cy="128" rx="66" ry="18" fill="#C9792F"/><ellipse cx="140" cy="126" rx="60" ry="14" fill="#E3A04E"/><circle cx="116" cy="124" r="4" fill="#B5652C" stroke="none"/><circle cx="150" cy="121" r="3.4" fill="#B5652C" stroke="none"/><circle cx="166" cy="129" r="3.6" fill="#B5652C" stroke="none"/><circle cx="132" cy="132" r="2.6" fill="#B5652C" stroke="none"/>' + g("cf", '<ellipse cx="140" cy="128" rx="66" ry="18" fill="#F2D9A2"/><ellipse cx="140" cy="126" rx="60" ry="14" fill="#FBEBC4"/><path d="M106 124q14-6 30 0" stroke="#fff" stroke-width="3" fill="none"/>')),

    css: k => an(k, ".cr", "C", 2.6, "linear") + kf(k, "C", "0%,18%{transform:none}22%{transform:translateY(-22px) scaleY(.85)}26%{transform:translateY(-40px) scaleY(.55)}30%{transform:translateY(-52px) scaleY(.2)}34%{transform:translateY(-56px) scaleY(-.2)}38%{transform:translateY(-52px) scaleY(-.55)}42%{transform:translateY(-40px) scaleY(-.85)}46%{transform:translateY(-20px) scaleY(-1)}50%{transform:translateY(0) scaleY(-1)}54%{transform:translateY(-3px) scaleY(-.97)}58%,100%{transform:scaleY(-1)}") +
      an(k, ".pn", "P", 2.6, E, "transform-origin:90% 40%") + kf(k, "P", "0%,10%{transform:none}18%{transform:translateY(-10px) rotate(-4deg)}24%{transform:translateY(2px)}30%,46%{transform:none}52%{transform:translateY(5px)}58%,100%{transform:none}") +
      an(k, ".cf", "Cf", 2.6, "linear") + kf(k, "Cf", "0%,31%{opacity:1}33%,90%{opacity:0}100%{opacity:1}") + an(k, ".ar", "A", 2.6, "linear") + kf(k, "A", "0%,16%{opacity:0}22%,48%{opacity:1}56%,100%{opacity:0}")};

  /* 14 · Fouetter */
  const WHISK = '<rect x="-6" y="-70" width="12" height="44" rx="6" fill="#3B3632"/><path d="M0-28C-18-12-16 18 0 28C16 18 18-12 0-28ZM0-28C-8-10-7 16 0 28C8 16 9-10 0-28Z" fill="none" stroke="' + STD + '" stroke-width="2.6"/><path d="M0-28V28" stroke="' + STD + '" stroke-width="2.2"/>';
  A.fouetter = {t:"Fouetter", v:"fouetter au fouet", c:["#F8E2CB","#FFF5EA"],
    d: () => table(178) + bowl(160, 118, 98, "#FFFFFF", "#F6E3B0") +
      g("sw", '<path d="M116 120Q160 104 204 120M128 127Q160 116 192 127" stroke="#E2C27A" stroke-width="2.6" fill="none"/>') +
      [0,1,2].map(i => '<circle class="fo fo' + i + '" cx="' + (138 + i*20) + '" cy="' + (118 + (i % 2)*5) + '" r="3" fill="#FFFBEF" stroke-width="1.2"/>').join("") +
      g("wh", g("", WHISK + hand(GRIP, 0, -50, -90, 1), T(160, 98, 16))),
    css: k => an(k, ".wh", "W", 0.8, "linear", "transform-origin:50% 100%") + kf(k, "W", "0%{transform:translate(-20px,2px) rotate(-10deg)}25%{transform:translate(0,7px) rotate(0)}50%{transform:translate(20px,2px) rotate(10deg)}75%{transform:translate(0,-4px) rotate(0)}100%{transform:translate(-20px,2px) rotate(-10deg)}") +
      an(k, ".sw", "S", 0.8, "linear", "transform-origin:50% 50%") + kf(k, "S", "0%,100%{transform:translateX(-8px) scaleX(.9)}50%{transform:translateX(8px) scaleX(1.06)}") +
      ".gx-" + k + " .fo{transform-origin:50% 50%}" + [0,1,2].map(i => an(k, ".fo" + i, "F", 1.2, "ease-out", "animation-delay:-" + (i*0.4).toFixed(1) + "s")).join("") + kf(k, "F", "0%{transform:scale(.2);opacity:0}50%{opacity:1}100%{transform:scale(1.5) translateY(-3px);opacity:0}")};

  /* 15 · Casser les œufs */
  const EGGH = side => '<path transform="scale(' + side + ' 1)" d="M0-30C-17-30-25-10-25 4C-25 19-14 28 0 28L-4 18 2 9-3 0 2-9-3-19 0-30Z" fill="#FFF8EE"/><path transform="scale(' + side + ' 1)" d="M-18-14C-16-22-10-26-4-27" stroke="#fff" stroke-width="3" fill="none"/>';
  A.oeufs = {t:"Casser les œufs", v:"casser un œuf proprement", c:["#F6DEBF","#FFF6E8"],
    d: () => table(176) + bowl(150, 128, 92, "#FFFFFF", "#F4EFE6", 0.55) +
      g("in", '<ellipse cx="150" cy="131" rx="40" ry="7" fill="#FFFDF8" stroke-width="1.6"/><ellipse cx="146" cy="131" rx="12" ry="5" fill="#F7B32B"/>') +
      g("ri", '<ellipse cx="150" cy="131" rx="22" ry="4.6" fill="none" stroke="#F7B32B" stroke-width="2.4"/>') +
      g("yo", '<ellipse cx="150" cy="96" rx="10" ry="11" fill="#F7B32B"/><ellipse cx="147" cy="92" rx="3.4" ry="3.8" fill="#FCD36A" stroke="none"/>') +
      g("eg", g("", g("hl", EGGH(1)) + g("hr", EGGH(-1)), T(150, 84)) + '<g class="ew"><ellipse cx="150" cy="83" rx="25" ry="29" fill="#FFF8EE"/><path d="M134 68C136 60 142 56 148 55" stroke="#fff" stroke-width="3" fill="none"/></g>' + '<path class="ck" d="M150 56l-4 9 5 8-4 9" stroke="' + L + '" stroke-width="1.8" fill="none"/>' + hand(GRIP, 192, 70, -24, 0.9)),
    css: k => an(k, ".eg", "E", 3.4, "linear") + kf(k, "E", "0%{transform:translate(52px,-10px) rotate(14deg);animation-timing-function:" + EI + "}14%{transform:translate(52px,24px) rotate(14deg);animation-timing-function:" + EO + "}22%{transform:translate(52px,14px) rotate(14deg);animation-timing-function:" + E + "}40%,100%{transform:none}") +
      an(k, ".hl", "L", 3.4, E, "transform-origin:100% 100%") + kf(k, "L", "0%,40%{transform:none}56%,92%{transform:translate(-14px,-4px) rotate(-40deg)}100%{transform:none}") +
      an(k, ".hr", "R", 3.4, E, "transform-origin:0 100%") + kf(k, "R", "0%,40%{transform:none}56%,92%{transform:translate(14px,-4px) rotate(40deg)}100%{transform:none}") +
      an(k, ".ew", "W", 3.4, "linear") + kf(k, "W", "0%,14%{opacity:1}15%,100%{opacity:0}") + an(k, ".ck", "Ck", 3.4, "linear") + kf(k, "Ck", "0%,13%{opacity:0}15%,40%{opacity:1}44%,100%{opacity:0}") +
      an(k, ".yo", "Y", 3.4, "linear") + kf(k, "Y", "0%,46%{opacity:0;transform:none}50%{opacity:1;transform:none;animation-timing-function:" + EI + "}64%{opacity:1;transform:translateY(34px) scale(.9,1.2)}66%,100%{opacity:0;transform:translateY(36px)}") +
      an(k, ".in", "I", 3.4, "linear") + kf(k, "I", "0%,63%{opacity:0;transform:scale(.3)}66%{opacity:1;transform:scale(.9);animation-timing-function:" + EO + "}74%,92%{opacity:1;transform:none}100%{opacity:0}") +
      an(k, ".ri", "Ri", 3.4, EO) + kf(k, "Ri", "0%,64%{opacity:0;transform:scale(.4)}68%{opacity:1}96%,100%{opacity:0;transform:scale(2.2)}")};

  /* 16 · Mélanger */
  A.melanger = {t:"Mélanger", v:"bien mélanger", c:["#F5DCC2","#FFF3E6"],
    d: () => table(180) + '<path d="M52 98H268Q260 180 160 184Q60 180 52 98Z" fill="' + CUF + '"/><path d="M68 112Q74 158 118 172" stroke="#fff" stroke-opacity=".25" stroke-width="8" fill="none"/><ellipse cx="160" cy="98" rx="108" ry="21" fill="#3B8F5C"/><ellipse cx="160" cy="100" rx="98" ry="16" fill="#F2C46A"/>' +
      '<g transform="translate(160 100) scale(1 .17)"><g class="vx"><path d="M0 0C14-8 30 4 26 22C20 44-12 50-30 34C-52 14-40-24-10-38C24-54 64-32 70 2C76 40 44 72 0 76C-46 78-82 48-84 8C-86-34-56-70-12-78" fill="none" stroke="#C98A34" stroke-width="3.6" vector-effect="non-scaling-stroke"/><path d="M0 0C14-8 30 4 26 22C20 44-12 50-30 34C-52 14-40-24-10-38C24-54 64-32 70 2C76 40 44 72 0 76C-46 78-82 48-84 8C-86-34-56-70-12-78" fill="none" stroke="#FFF1D0" stroke-width="1.6" vector-effect="non-scaling-stroke"/></g></g>' +
      g("sp", g("", SPOON + hand(GRIP, -14, 0, 0, 1), T(240, 34, -36))),
    css: k => an(k, ".vx", "V", 1.6, "linear", "transform-origin:50% 50%") + kf(k, "V", "to{transform:rotate(360deg)}") +
      an(k, ".sp", "S", 1.6, "linear") + kf(k, "S", Array.from({length:9}, (_, n) => { const a = n/8*2*Math.PI; return (n*12.5) + "%{transform:translate(" + (20 + 40*Math.cos(a)).toFixed(1) + "px," + (6*Math.sin(a)).toFixed(1) + "px)}"; }).join(""))};

  /* 17 · Ajouter / verser */
  const PEA = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="5" fill="#6BBF59" stroke-width="1.5"/><circle cx="' + (x - 1.6) + '" cy="' + (y - 1.6) + '" r="1.5" fill="#B8E3A8" stroke="none"/>';
  const CAR = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="7" fill="#F08A3C" stroke-width="1.5"/><circle cx="' + x + '" cy="' + y + '" r="3.4" fill="#F8B27A" stroke="none"/>';
  const TOM = (x, y) => '<path d="M' + (x - 8) + " " + (y + 3) + "A8 8 0 0 1 " + (x + 8) + " " + (y + 3) + 'Z" fill="#E8483A" stroke-width="1.5"/><circle cx="' + (x - 3) + '" cy="' + y + '" r="1.2" fill="#FBE3A0" stroke="none"/><circle cx="' + (x + 3) + '" cy="' + y + '" r="1.2" fill="#FBE3A0" stroke="none"/>';
  A.verser = {t:"Ajouter", v:"ajouter les ingrédients en cuisine", c:["#F6DEBF","#FFF6E8"],
    d: () => stove(150, 70) + fire(150, 110, 5, 0.9) +
      '<rect x="60" y="122" width="24" height="12" rx="6" fill="#A8311D"/><rect x="216" y="122" width="24" height="12" rx="6" fill="#A8311D"/><path d="M76 114H224V162Q224 176 210 176H90Q76 176 76 162Z" fill="#C73A23"/><path d="M88 128V166" stroke="#fff" stroke-opacity=".28" stroke-width="8"/><ellipse cx="150" cy="114" rx="74" ry="14" fill="#A8311D"/><ellipse cx="150" cy="115" rx="66" ry="10" fill="#E07A3A"/>' +
      PEA(122, 114) + CAR(170, 116) + TOM(146, 112) +
      [[PEA,138,0],[CAR,150,1],[TOM,160,2],[PEA,146,3],[CAR,134,4],[PEA,156,5]].map(([f,x,i]) => g("pc pc" + i, f(x, 70))).join("") +
      [0,1,2].map(i => '<circle class="spl spl' + i + '" cx="' + (140 + i*10) + '" cy="110" r="2.4" fill="#F3A15E" stroke-width="1"/>').join("") +
      g("bo", '<path d="M150 46H224Q220 76 187 78Q154 76 150 46Z" fill="#fff"/><ellipse cx="187" cy="46" rx="37" ry="8" fill="#F1ECE3"/><ellipse cx="187" cy="47" rx="31" ry="5.4" fill="#FBEFD9"/>' + PEA(176, 45) + CAR(192, 46) + TOM(204, 44) + hand(GRIP, 236, 60, -10, 0.9)),
    css: k => an(k, ".bo", "B", 3, E, "transform-box:view-box;transform-origin:187px 60px") + kf(k, "B", "0%,100%{transform:rotate(0)}25%,70%{transform:rotate(-36deg)}") +
      [0,1,2,3,4,5].map(i => an(k, ".pc" + i, "P", 3, "linear", "animation-delay:" + (0.1*i - 3).toFixed(2) + "s")).join("") +
      kf(k, "P", "0%,26%{opacity:0;transform:none}30%{opacity:1;transform:none;animation-timing-function:" + EI + "}52%{opacity:1;transform:translateY(42px) rotate(140deg)}56%,100%{opacity:0;transform:translateY(44px) rotate(150deg)}") +
      [0,1,2].map(i => an(k, ".spl" + i, "Sp", 3, EO, "animation-delay:" + (0.15*i - 3).toFixed(2) + "s")).join("") + kf(k, "Sp", "0%,50%{opacity:0;transform:none}54%{opacity:1}66%,100%{opacity:0;transform:translate(" + "0,-14px) scale(.6)}")};

  /* 18 · Disposer en couches */
  const DIS = [["Pâtes",4,22],["Sauce",24,42],["Pâtes",44,62],["Béchamel",64,82],["Fromage",84,96]];
  const POT = (x, y) => '<ellipse cx="' + x + '" cy="' + y + '" rx="17" ry="10" fill="#F2C94C"/><ellipse cx="' + (x - 4) + '" cy="' + (y - 3) + '" rx="7" ry="3" fill="#FBE3A0" stroke="none"/>';
  A.disposer = {t:"Disposer", v:"disposer les morceaux dans le plat", c:["#F8E2CB","#FFF5EA"],
    d: () => table(182) + shadowE(160, 184, 108, 6) + '<rect x="50" y="118" width="220" height="62" rx="14" fill="#E8F1F7"/><rect x="60" y="128" width="200" height="44" rx="9" fill="#F7E7CF" stroke-width="1.6"/><path d="M60 122H150" stroke="#fff" stroke-width="3.4"/>' +
      [0,1,2,3].map(i => g("pi pi" + i, POT(98 + i*42, 151))).join("") +
      g("hd", hand(GRIP, 266, 42, -34, 0.9) + g("hp", POT(250, 62))),
    css: k => ".gx-" + k + " .pi{opacity:0}" +
      an(k, ".hd", "H", 4.8, "linear") + kf(k, "H", [0,1,2,3].map(i => { const a = i*25, dx = 98 + i*42 - 250, dy = 89; return a + "%{transform:translate(0,0);animation-timing-function:" + E + "}" + (a + 11) + "%{transform:translate(" + dx + "px," + dy + "px)}" + (a + 15) + "%{transform:translate(" + dx + "px," + dy + "px);animation-timing-function:" + E + "}"; }).join("") + "100%{transform:translate(0,0)}") +
      an(k, ".hp", "P", 4.8, "linear") + kf(k, "P", [0,1,2,3].map(i => { const a = i*25; return a + "%,{opacity:1}".slice(1) && (a + "%{opacity:1}" + (a + 13) + "%{opacity:1}" + (a + 13.3) + "%{opacity:0}" + (a + 22) + "%{opacity:0}" + (a + 24) + "%{opacity:1}"); }).join("")) +
      [0,1,2,3].map(i => an(k, ".pi" + i, "I" + i, 4.8, "linear") + kf(k, "I" + i, "0%," + (i*25 + 13) + "%{opacity:0}" + (i*25 + 13.3) + "%,96%{opacity:1}100%{opacity:0}")).join("")};

  A.couches = {t:"Monter en couches", v:"monter des lasagnes en couches", c:["#F8E2CB","#FFF5EA"],
    d: k => table(182) + chips(k, DIS) +
      '<rect x="56" y="80" width="208" height="98" rx="14" fill="#E8F1F7"/>' +
      g("l0", '<rect x="66" y="158" width="188" height="10" rx="3" fill="#F2C27B"/><path d="M72 163H248" stroke="#E2A65C" stroke-width="1.6" stroke-dasharray="7 7"/>') +
      g("l1", '<path d="M66 158V150Q90 144 116 150T166 150T214 150T254 150V158Z" fill="#C24F2C"/>') +
      g("l2", '<rect x="66" y="140" width="188" height="10" rx="3" fill="#F2C27B"/><path d="M72 145H248" stroke="#E2A65C" stroke-width="1.6" stroke-dasharray="7 7"/>') +
      g("l3", '<path d="M66 140V130Q92 124 120 130T172 130T222 130T254 130V140Z" fill="#FFF3D6"/>') +
      g("l4", [76,96,116,136,156,176,196,216,236,90,130,170,210].map((x, i) => '<rect x="' + x + '" y="' + (122 + (i % 3)*2) + '" width="9" height="4" rx="2" fill="#F5C33B" stroke-width="1.2"/>').join("")) +
      '<rect x="56" y="80" width="208" height="98" rx="14" fill="none" stroke-width="2.6"/><path d="M66 88H140" stroke="#fff" stroke-width="4"/>',
    css: k => chipsCss(k, DIS, 6) +
      ".gx-" + k + " .l0,.gx-" + k + " .l2{opacity:0}" + an(k, ".l0", "A", 6, "linear") + an(k, ".l2", "C", 6, "linear") +
      kf(k, "A", "0%,4%{opacity:0;transform:translateY(-70px);animation-timing-function:" + EO + "}14%,95%{opacity:1;transform:none}100%{opacity:0}") +
      kf(k, "C", "0%,44%{opacity:0;transform:translateY(-70px);animation-timing-function:" + EO + "}54%,95%{opacity:1;transform:none}100%{opacity:0}") +
      an(k, ".l1", "B", 6, "linear", "transform-origin:50% 100%") + kf(k, "B", "0%,24%{opacity:0;transform:scaleX(0)}25%{opacity:1;transform:scaleX(.05);animation-timing-function:" + E + "}38%,95%{opacity:1;transform:scaleX(1)}100%{opacity:0}") +
      an(k, ".l3", "D", 6, "linear", "transform-origin:50% 100%") + kf(k, "D", "0%,64%{opacity:0;transform:scaleX(0)}65%{opacity:1;transform:scaleX(.05);animation-timing-function:" + E + "}78%,95%{opacity:1;transform:scaleX(1)}100%{opacity:0}") +
      an(k, ".l4", "F", 6, "linear") + kf(k, "F", "0%,84%{opacity:0;transform:translateY(-40px);animation-timing-function:" + EO + "}90%,95%{opacity:1;transform:none}100%{opacity:0}")};

  /* 19 · Tartiner */
  A.tartiner = {t:"Tartiner", v:"tartiner", c:["#F6DEBF","#FFF6E8"],
    d: () => table(170) + '<path d="M76 168V96Q76 70 104 66Q112 46 160 46Q208 46 216 66Q244 70 244 96V168Z" fill="#D99A4E"/><path d="M86 160V98Q86 78 108 76Q116 58 160 58Q204 58 212 76Q234 78 234 98V160Z" fill="#F6DDB0"/>' +
      g("bu", '<path d="M94 100Q120 92 160 96T226 100V124Q196 132 160 126T94 124Z" fill="#F7D56A" stroke-width="1.6"/>') +
      g("kn", '<path d="M200 112L258 96Q266 95 266 102Q266 108 258 110L202 120Z" fill="' + ST + '"/><rect x="264" y="94" width="40" height="14" rx="7" fill="' + CUF + '" transform="rotate(-14 264 101)"/>' + hand(GRIP, 286, 98, -14, 0.9)),
    css: k => an(k, ".kn", "K", 1.6, E) + kf(k, "K", "0%,100%{transform:translate(0,0)}50%{transform:translate(-104px,4px)}") +
      an(k, ".bu", "B", 1.6, E, "transform-origin:100% 50%") + kf(k, "B", "0%{transform:scaleX(.08)}50%{transform:scaleX(1)}85%,100%{transform:scaleX(1);opacity:1}")};

  /* 20 · Étaler la pâte */
  A.petrir = {t:"Étaler la pâte", v:"étaler une pâte au rouleau", c:["#F6DEBF","#FFF6E8"],
    d: () => boardBand(120) + [[40,132],[80,170],[250,140],[280,176],[60,190],[230,186]].map(([x,y]) => '<circle cx="' + x + '" cy="' + y + '" r="2.2" fill="#fff" stroke="none"/>').join("") +
      g("do", '<ellipse cx="160" cy="160" rx="96" ry="26" fill="#F6E3B0"/><ellipse cx="150" cy="156" rx="64" ry="12" fill="#FBEFD0" stroke="none"/>') +
      g("ro", '<rect x="60" y="128" width="200" height="22" rx="11" fill="#E9C189"/><path d="M68 134H252" stroke="#fff" stroke-opacity=".5" stroke-width="4"/><rect x="26" y="133" width="38" height="12" rx="6" fill="' + WDD + '"/><rect x="256" y="133" width="38" height="12" rx="6" fill="' + WDD + '"/>' + hand(GRIP, 274, 139, -30, 0.8) + hand(GRIP, 46, 139, 30, 0.8, true)) +
      [0,1].map(i => '<circle class="fl fl' + i + '" cx="' + (90 + i*140) + '" cy="152" r="6" fill="#fff" stroke="none"/>').join(""),
    css: k => an(k, ".ro", "R", 1.8, E) + kf(k, "R", "0%,100%{transform:translateY(-14px)}50%{transform:translateY(24px)}") +
      an(k, ".do", "D", 1.8, E, "transform-origin:50% 50%") + kf(k, "D", "0%,100%{transform:scale(1,1)}50%{transform:scale(1.07,1.12)}") +
      ".gx-" + k + " .fl{transform-origin:50% 50%}" + an(k, ".fl", "F", 1.8, "ease-out") + kf(k, "F", "0%,40%{opacity:0;transform:scale(.3)}55%{opacity:.8}100%{opacity:0;transform:scale(2.4) translateY(-6px)}")};

  /* 21 · Rouler */
  const WRAP = [["Garnir",0,20],["Replier",20,40],["Rabattre",40,60],["Rouler",60,92]];
  A.rouler = {t:"Rouler un wrap", v:"comment rouler un wrap", c:["#E2EFE3","#F5FBF5"],
    d: k => '<defs><clipPath id="' + k + '-c"><rect x="124" y="0" width="72" height="128"/></clipPath><clipPath id="' + k + '-s"><rect x="0" y="0" width="320" height="128"/></clipPath></defs>' +
      table(182, "#E6D2AE") + chips(k, WRAP) +
      g("fl", '<circle cx="160" cy="106" r="64" fill="#F1D9A5" clip-path="url(#' + k + '-c)"/>' +
        g("fr", '<path d="M196 53.1A64 64 0 0 1 196 158.9Z" fill="#E2BE7E" clip-path="url(#' + k + '-s)"/><path d="M196 56V128" stroke-dasharray="4 4" stroke-width="1.6"/>') +
        g("fL", '<path d="M124 53.1A64 64 0 0 0 124 158.9Z" fill="#E2BE7E" clip-path="url(#' + k + '-s)"/><path d="M124 56V128" stroke-dasharray="4 4" stroke-width="1.6"/>') +
        '<g stroke="none"><circle cx="138" cy="84" r="2.6" fill="#D9B06A"/><circle cx="184" cy="92" r="2.2" fill="#D9B06A"/><circle cx="150" cy="70" r="2" fill="#D9B06A"/></g>' +
        g("fi", '<rect x="124" y="100" width="72" height="12" rx="6" fill="#6BBF59"/><rect x="128" y="108" width="64" height="9" rx="4.5" fill="#B5652C"/><circle cx="140" cy="102" r="4" fill="#E8483A"/><circle cx="168" cy="101" r="4" fill="#E8483A"/>') +
        g("fb", '<path d="M100.6 128A64 64 0 0 0 219.4 128Z" fill="#E2BE7E"/><path d="M102 128H218" stroke-dasharray="4 4" stroke-width="1.6"/>')) +
      '<g class="fa1" stroke="#2E7A4C" stroke-width="3.2" fill="none"><path d="M160 164V124"/><path d="M151 133L160 122L169 133"/></g><g class="fa2" stroke="#2E7A4C" stroke-width="3.2" fill="none"><path d="M240 96H206"/><path d="M215 87L204 96L215 105"/><path d="M80 96H114"/><path d="M105 87L116 96L105 105"/></g>' +
      g("bu", '<g transform="rotate(-8 160 112)"><rect x="96" y="92" width="128" height="40" rx="20" fill="#F1D9A5"/><path d="M110 100Q160 92 210 100" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none"/><ellipse cx="222" cy="112" rx="10" ry="20" fill="#F6E6C2"/><circle cx="220" cy="106" r="3.6" fill="#6BBF59"/><circle cx="224" cy="115" r="3.4" fill="#B5652C"/><circle cx="219" cy="120" r="2.6" fill="#E8483A"/></g>'),
    css: k => chipsCss(k, WRAP, 6) +
      ".gx-" + k + " .fa1,.gx-" + k + " .fa2{opacity:0}" + an(k, ".fa1", "A1", 6, "linear") + kf(k, "A1", "0%,20%{opacity:0;transform:translateY(8px)}24%{opacity:1;transform:none}34%{opacity:1}38%,100%{opacity:0}") + an(k, ".fa2", "A2", 6, "linear") + kf(k, "A2", "0%,40%{opacity:0}44%,54%{opacity:1}58%,100%{opacity:0}") + an(k, ".fi", "I", 6, "linear") + kf(k, "I", "0%{opacity:0;transform:translateY(-24px)}3%{opacity:0;transform:translateY(-24px);animation-timing-function:" + EO + "}12%,100%{opacity:1;transform:none}") +
      an(k, ".fb", "B", 6, "linear", "transform-origin:50% 0") + kf(k, "B", "0%,22%{transform:scaleY(1)}23%{transform:scaleY(1);animation-timing-function:" + E + "}38%,100%{transform:scaleY(-1)}") +
      an(k, ".fL", "L", 6, "linear", "transform-origin:100% 50%") + kf(k, "L", "0%,42%{transform:scaleX(1)}43%{transform:scaleX(1);animation-timing-function:" + E + "}58%,100%{transform:scaleX(-1)}") +
      an(k, ".fr", "R", 6, "linear", "transform-origin:0 50%") + kf(k, "R", "0%,42%{transform:scaleX(1)}43%{transform:scaleX(1);animation-timing-function:" + E + "}58%,100%{transform:scaleX(-1)}") +
      an(k, ".fl", "F", 6, "linear") + kf(k, "F", "0%,60%{opacity:1;transform:none}61%{opacity:1;transform:none;animation-timing-function:" + EI + "}70%{opacity:0;transform:scale(.7,.4)}100%{opacity:0;transform:scale(.7,.4)}") +
      an(k, ".bu", "U", 6, "linear") + kf(k, "U", "0%,64%{opacity:0;transform:scale(.6,.5)}74%{opacity:1;transform:none;animation-timing-function:" + EO + "}94%{opacity:1;transform:none}100%{opacity:0}")};
  const MAKI = [["Garnir",0,22],["Rouler",22,70],["Couper",70,95]];
  A.rouler_b = {t:"Rouler des makis", v:"comment rouler des makis", c:["#E2EFE3","#F5FBF5"],
    d: k => table(184, "#E6D2AE") + chips(k, MAKI) + '<rect x="70" y="44" width="180" height="134" rx="6" fill="#D9C28A"/>' + [54,64,74,84,94,104,114,124,134,144,154,164,174].map(y => '<path d="M71 ' + y + 'H249" stroke="#B89A5C" stroke-width="1.6"/>').join("") +
      g("sh", '<rect x="90" y="50" width="140" height="112" rx="3" fill="#2F4A35"/><rect x="94" y="62" width="132" height="98" rx="3" fill="#FBF6EC"/>' + g("fi", '<rect x="94" y="132" width="132" height="10" rx="5" fill="#F08A5C"/><rect x="94" y="142" width="132" height="8" rx="4" fill="#6BBF59"/>')) +
      g("rl", '<rect x="88" y="0" width="144" height="30" rx="8" fill="#2F4A35"/><path d="M96 8H224M96 22H224" stroke="#4E6B54" stroke-width="2"/>', T(0, 140)) +
      g("cut", [100,134,168,202].map(x => '<g' + T(x + 8, 110) + '><circle r="16" fill="#2F4A35"/><circle r="12" fill="#FBF6EC" stroke-width="1.4"/><circle cx="-2" r="5" fill="#F08A5C" stroke-width="1.2"/><circle cx="4" cy="3" r="3" fill="#6BBF59" stroke-width="1.2"/></g>').join("")),
    css: k => chipsCss(k, MAKI, 6) +
      an(k, ".fi", "I", 6, "linear") + kf(k, "I", "0%{opacity:0}3%{opacity:0;transform:translateY(-20px);animation-timing-function:" + EO + "}12%,100%{opacity:1;transform:none}") +
      ".gx-" + k + " .rl{opacity:0}" + an(k, ".rl", "R", 6, "linear") + kf(k, "R", "0%,21%{opacity:0;transform:translate(0,140px)}22%{opacity:1;transform:translate(0,140px);animation-timing-function:" + E + "}66%{opacity:1;transform:translate(0,52px)}70%,100%{opacity:0;transform:translate(0,52px)}") +
      an(k, ".sh", "S", 6, "linear", "transform-origin:50% 0") + kf(k, "S", "0%,22%{opacity:1;transform:scaleY(1);animation-timing-function:" + E + "}66%{opacity:1;transform:scaleY(.08)}70%,100%{opacity:0;transform:scaleY(.08)}") +
      ".gx-" + k + " .cut{opacity:0}" + an(k, ".cut", "C", 6, "linear") + kf(k, "C", "0%,70%{opacity:0;transform:scale(.6)}78%{opacity:1;transform:none;animation-timing-function:" + EO + "}95%{opacity:1}100%{opacity:0}")};

  /* 22 · Brochettes */
  const MEAT = '<rect x="-12" y="-12" width="24" height="24" rx="6" fill="#A85A2A"/><path d="M-7-12L-12-7M3-12L-12 3M12-6L-6 12" stroke="#7A3E1A" stroke-width="2.4"/>';
  const PEP = '<path d="M-12-10Q0-16 12-10L12 10Q0 16-12 10Z" fill="#E8483A"/><path d="M-7-9Q0-12 7-9" stroke="#F7A39A" stroke-width="2.4" fill="none"/>';
  const ONI = '<path d="M-11-12Q0-16 11-12V12Q0 16-11 12Z" fill="#FBF3E1"/><path d="M-6-12V12M1-13V13" stroke="#E2C48C" stroke-width="1.6"/>';
  const ZUC = '<ellipse rx="8" ry="13" fill="#4E9A5A"/><ellipse rx="5.6" ry="10" fill="#E6F2CF" stroke-width="1.2"/>';
  A.brochettes = {t:"Monter les brochettes", v:"monter des brochettes", c:["#F5DCC2","#FFF3E6"],
    d: () => table(182) + '<path d="M58 46L262 158" stroke="' + WDD + '" stroke-width="6"/><path d="M58 46L262 158" stroke="' + WD + '" stroke-width="2.4"/><path d="M58 46L50 40" stroke="' + WDD + '" stroke-width="3"/>' +
      [MEAT, PEP, ONI, MEAT, ZUC, MEAT].map((p, i) => { const d = 210 - i*30, x = 58 + 0.877*d, y = 46 + 0.481*d; return g("pc pc" + i, '<g' + T(x.toFixed(1), y.toFixed(1), 29) + ">" + p + "</g>"); }).join("") +
      hand(GRIP, 262, 158, 29, 0.95),
    css: k => [0,1,2,3,4,5].map(i => { const d = 210 - i*30; return an(k, ".pc" + i, "C" + i, 5, "linear", "animation-delay:" + (i*0.6 - 5).toFixed(1) + "s") + kf(k, "C" + i, "0%{opacity:0;transform:translate(" + (-(d - 6)*0.877).toFixed(1) + "px," + (-(d - 6)*0.481).toFixed(1) + "px) scale(.4)}4%{opacity:1;transform:translate(" + (-(d - 6)*0.877).toFixed(1) + "px," + (-(d - 6)*0.481).toFixed(1) + "px) scale(1);animation-timing-function:" + E + "}16%,92%{opacity:1;transform:none}100%{opacity:0;transform:none}"); }).join("")};

  /* 23 · Laisser reposer */
  A.reposer = {t:"Laisser reposer", v:"laisser reposer ou mariner au frais", c:["#DCE8F7","#F3F8FE"],
    d: () => table(178, "#DCE3EA", "#C5CFD9") + bowl(120, 112, 90, "#FFFFFF", "#D9824A", 0.68) +
      '<path d="M28 112Q30 98 120 96Q210 98 212 112" fill="#EAF4FE" fill-opacity=".55" stroke="#8FB3D6" stroke-width="2"/><path d="M30 112Q120 124 210 112" fill="none" stroke="#8FB3D6" stroke-width="2"/>' +
      '<g' + T(254, 92) + '><circle r="40" fill="#fff"/><circle r="31" fill="#F4F3EF" stroke-width="1.6"/><circle class="pie" r="15.5" fill="none" stroke="#F2B45A" stroke-width="31" transform="rotate(-90)" pathLength="100"/>' +
      [0,30,60,90,120,150,180,210,240,270,300,330].map(a => '<path d="M0-31v' + (a % 90 ? 4 : 7) + '" stroke-width="2" transform="rotate(' + a + ')"/>').join("") +
      '<g class="ha"><path d="M0 0V-26" stroke="' + L + '" stroke-width="3.4"/></g><circle r="3.6" fill="' + L + '"/><rect x="-9" y="-52" width="18" height="10" rx="3.5" fill="#AEB8C2"/></g>' +
      '<g' + T(44, 46) + '><g class="fz"><path d="M0-16V16M-14-8L14 8M-14 8L14-8" stroke="#6FA8E6" stroke-width="3.4"/><path d="M-4-12L0-8 4-12M-4 12L0 8 4 12" stroke="#6FA8E6" stroke-width="2.4" fill="none"/></g></g>',
    css: k => ".gx-" + k + " .pie{stroke:#F2B45A;stroke-dasharray:0 100;animation:" + k + "Pi 5s linear infinite}" + kf(k, "Pi", "0%{stroke-dasharray:0 100}92%{stroke-dasharray:100 0;opacity:1}100%{stroke-dasharray:100 0;opacity:0}") +
      an(k, ".ha", "H", 5, "linear", "transform-box:view-box;transform-origin:0 0") + kf(k, "H", "to{transform:rotate(360deg)}") +
      an(k, ".fz", "F", 3, E) + kf(k, "F", "0%,100%{transform:rotate(0) scale(1)}50%{transform:rotate(30deg) scale(1.12)}")};

  /* 24 · Assaisonner */
  const SHAKER = (body, cap) => '<path d="M-16-26Q-16-42 0-42Q16-42 16-26V30Q16 40 6 40H-6Q-16 40-16 30Z" fill="' + body + '"/><path d="M-16-26Q-16-42 0-42Q16-42 16-26Z" fill="' + cap + '"/>' + [[-6,-32],[0,-36],[6,-32]].map(([x,y]) => '<circle cx="' + x + '" cy="' + y + '" r="1.8" fill="' + L + '" stroke="none"/>').join("");
  A.assaisonner = {t:"Assaisonner", v:"assaisonner et rectifier", c:["#EFEBE3","#FAF8F3"],
    d: () => table(176, "#E4DCCD", "#CFC5B3") + '<ellipse cx="140" cy="166" rx="112" ry="22" fill="#fff"/><ellipse cx="140" cy="162" rx="86" ry="14" fill="#F4F3EF"/>' +
      '<path d="M82 164Q86 138 120 134Q156 130 176 142Q196 150 196 164Z" fill="#C46B3A"/><path d="M98 150Q120 142 146 144" stroke="#E39A62" stroke-width="3" fill="none"/>' +
      [0,1,2,3,4,5,6,7].map(i => '<rect class="gr gr' + i + '" x="' + (150 + (i % 4)*6 - 9) + '" y="' + (86 + (i % 2)*4) + '" width="3.4" height="3.4" rx=".8" fill="#fff" stroke-width="1.1"/>').join("") +
      g("sa", g("", SHAKER("#FFFFFF", "#C9D2DA") + hand(GRIP, 0, 12, 90, 0.85), T(196, 46, 217))) +
      g("ml", '<path d="M228 40q8 6 0 14M238 34q12 10 0 24" stroke="' + L + '" stroke-opacity=".45" stroke-width="2.2" fill="none"/>'),
    css: k => an(k, ".sa", "S", 0.5, E) + kf(k, "S", "0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(6px,-10px) rotate(-7deg)}") +
      an(k, ".ml", "M", 0.5, E) + kf(k, "M", "0%,100%{opacity:.2}50%{opacity:1}") +
      [0,1,2,3,4,5,6,7].map(i => an(k, ".gr" + i, "G", 1, EI, "animation-delay:-" + (i*0.125).toFixed(3) + "s")).join("") +
      kf(k, "G", "0%{opacity:0;transform:none}12%{opacity:1}88%{opacity:1;transform:translate(-14px,52px) rotate(90deg)}100%{opacity:0;transform:translate(-15px,56px) rotate(100deg)}")};

  /* 25 · Servir */
  A.servir = {t:"Servir", v:"dresser une belle assiette", c:["#E2EFE3","#F5FBF5"],
    d: () => table(176, "#E6D9C0", "#D3C2A2") + '<ellipse cx="160" cy="160" rx="120" ry="30" fill="#fff"/><ellipse cx="160" cy="156" rx="92" ry="20" fill="#F4F3EF"/>' +
      '<path d="M100 158Q108 128 138 126Q168 128 176 158Z" fill="#FBF6EC"/><path d="M152 160Q164 136 190 136Q214 138 218 160Z" fill="#C2622D"/><circle cx="178" cy="148" r="4" fill="#E39A52"/><circle cx="198" cy="146" r="3.4" fill="#E39A52"/>' +
      [[132,40,30,0],[152,28,-20,1],[170,44,60,2],[144,58,-50,3],[164,62,10,4],[186,34,40,5]].map(([x,y,a,i]) => g("hb hb" + (i % 3), leaf(x, y, a, i % 2 ? "#5DB86A" : "#3E9A4F"))).join("") +
      g("tw", '<path d="M244 60l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#F2C27B"/>') + g("tw2", '<path d="M76 80l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#F2C27B"/>') +
      steam(138, 116, 36, 0) + steam(196, 124, 30, 1),
    css: k => [0,1,2].map(i => an(k, ".hb" + i, "H", 1.8, EI, "animation-delay:-" + (i*0.6).toFixed(1) + "s")).join("") + kf(k, "H", "0%{opacity:0;transform:translateY(-16px) rotate(0)}20%{opacity:1}85%{opacity:1;transform:translateY(80px) rotate(160deg)}100%{opacity:0;transform:translateY(84px) rotate(170deg)}") +
      an(k, ".tw", "T", 1.8, E, "transform-origin:50% 50%") + an(k, ".tw2", "T", 1.8, E, "transform-origin:50% 50%;animation-delay:-.9s") + kf(k, "T", "0%,100%{transform:scale(.3) rotate(0);opacity:.3}50%{transform:scale(1.1) rotate(45deg);opacity:1}")};

  /* 26 · Griller (grille-pain) */
  A.toaster = {t:"Griller", v:"griller du pain", c:["#F6DEBF","#FFF6E8"],
    d: () => table(178) + g("to", '<rect x="96" y="46" width="52" height="58" rx="12" fill="#D99A4E"/><rect x="101" y="51" width="42" height="50" rx="9" fill="#F2C98B"/><rect x="172" y="46" width="52" height="58" rx="12" fill="#D99A4E"/><rect x="177" y="51" width="42" height="50" rx="9" fill="#F2C98B"/>') +
      '<rect x="68" y="80" width="184" height="98" rx="34" fill="#9DB0C2"/><path d="M84 98Q160 88 236 98" stroke="#fff" stroke-opacity=".4" stroke-width="6" fill="none"/><rect x="92" y="78" width="60" height="10" rx="5" fill="#5F7184"/><rect x="168" y="78" width="60" height="10" rx="5" fill="#5F7184"/>' +
      g("gl", '<rect x="96" y="80" width="52" height="5" rx="2.5" fill="#FF8A3D" stroke="none"/><rect x="172" y="80" width="52" height="5" rx="2.5" fill="#FF8A3D" stroke="none"/>') +
      g("lv", '<rect x="250" y="112" width="24" height="10" rx="5" fill="#3B3632"/>') + '<circle cx="160" cy="146" r="10" fill="#5F7184"/><path d="M160 146l5-5" stroke="#fff" stroke-width="2.4"/>',
    css: k => an(k, ".to", "T", 3, "linear") + kf(k, "T", "0%,55%{transform:translateY(40px);animation-timing-function:cubic-bezier(.2,1.4,.4,1)}68%{transform:translateY(-14px);animation-timing-function:" + E + "}84%,100%{transform:translateY(40px)}") +
      an(k, ".lv", "L", 3, "linear") + kf(k, "L", "0%,55%{transform:translateY(18px)}60%,84%{transform:translateY(-20px)}90%,100%{transform:translateY(18px)}") +
      an(k, ".gl", "G", 3, E) + kf(k, "G", "0%,50%{opacity:1}58%,90%{opacity:0}100%{opacity:1}")};

  /* 27 · Vapeur */
  A.vapeur = {t:"Cuire à la vapeur", v:"cuisson à la vapeur", c:["#DCE8F7","#F3F8FE"],
    d: () => stove(160, 70) + fire(160, 110, 5, 0.9) + pot(160, 146, 74, 176, "#B8C6D3", "#D5DEE6", "#B8C6D3") +
      '<rect x="88" y="108" width="144" height="34" rx="8" fill="#D9B878"/><path d="M88 120H232M88 128H232" stroke="#B89A5C" stroke-width="1.6"/><rect x="88" y="72" width="144" height="36" rx="8" fill="#E3C68C"/><path d="M88 84H232M88 92H232" stroke="#B89A5C" stroke-width="1.6"/>' +
      g("li", '<path d="M86 72Q160 24 234 72Z" fill="#D9B878"/><path d="M110 60Q160 40 210 60" stroke="#B89A5C" stroke-width="1.6" fill="none"/><rect x="146" y="30" width="28" height="12" rx="5" fill="#B89A5C"/>') +
      steam(100, 64, 44, 0, 6) + steam(220, 64, 44, 1, 6) + steam(160, 32, 40, 2, 6),
    css: k => an(k, ".li", "L", 2.6, E, "transform-origin:0 100%") + kf(k, "L", "0%,55%,100%{transform:none}65%,80%{transform:translateY(-10px) rotate(-6deg)}")};

  /* 28 · Micro-ondes */
  A.microondes = {t:"Au micro-ondes", v:"réchauffer au micro-ondes", c:["#EFEBE3","#FAF8F3"],
    d: () => table(178, "#E4DCCD", "#CFC5B3") + '<rect x="40" y="34" width="240" height="144" rx="18" fill="#3B3632"/><rect x="56" y="50" width="160" height="112" rx="10" fill="#211E1B"/>' +
      '<rect class="gl" x="62" y="56" width="148" height="100" rx="8" fill="#F7D88A" stroke="none"/>' +
      '<ellipse cx="136" cy="140" rx="54" ry="10" fill="#fff" fill-opacity=".85"/><path d="M110 138Q112 116 136 114Q160 116 162 138Z" fill="#C2622D"/>' +
      [0,1,2].map(i => '<path class="hw hw' + i + '" d="M' + (122 + i*14) + ' 108c-5-6 5-10 0-16c-4-5 4-9 0-14" stroke="#fff" stroke-width="2.6" fill="none"/>').join("") +
      '<rect x="228" y="52" width="40" height="22" rx="5" fill="#141412"/>' + ["1:30","1:00","0:30","0:00"].map((t, i) => '<text class="tm tm' + i + '" x="248" y="68" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="12" font-weight="800" fill="#7EE0A1" stroke="none">' + t + "</text>").join("") +
      '<circle cx="248" cy="96" r="9" fill="#55524B"/><circle cx="248" cy="124" r="9" fill="#55524B"/><rect x="232" y="144" width="32" height="12" rx="6" fill="#55524B"/>' +
      g("di", '<path d="M276 30l12-10M282 42l16-4M270 22l4-14" stroke="#F2A72B" stroke-width="3"/>'),
    css: k => ".gx-" + k + " .tm{opacity:0}" + [0,1,2,3].map(i => an(k, ".tm" + i, "T" + i, 4, "linear") + kf(k, "T" + i, (i ? "0%," + (i*20 - 0.3) + "%{opacity:0}" : "") + (i*20) + "%," + (i < 3 ? i*20 + 20.3 : 99) + "%{opacity:1}" + (i < 3 ? (i*20 + 20.6) + "%," : "") + "100%{opacity:0}")).join("") +
      an(k, ".gl", "G", 4, "linear") + kf(k, "G", "0%,78%{opacity:1}82%,100%{opacity:.25}") +
      [0,1,2].map(i => an(k, ".hw" + i, "H", 1.6, "ease-out", "animation-delay:-" + (i*0.5).toFixed(1) + "s")).join("") + kf(k, "H", "0%{opacity:0;transform:translateY(6px)}35%{opacity:.9}100%{opacity:0;transform:translateY(-8px)}") +
      an(k, ".di", "D", 4, EO, "transform-origin:0 100%") + kf(k, "D", "0%,80%{opacity:0;transform:scale(.6)}86%{opacity:1;transform:scale(1.1)}100%{opacity:0;transform:scale(1)}")};

  /* 29 · Presser */
  A.presser = {t:"Presser", v:"presser un citron", c:["#FBF2C4","#FFFBE8"],
    d: () => table(178, "#EADBB8") + '<ellipse cx="160" cy="166" rx="94" ry="16" fill="#DCEBF5"/><path d="M66 150H254Q250 170 160 172Q70 170 66 150Z" fill="#DCEBF5"/><ellipse cx="160" cy="150" rx="94" ry="16" fill="#EEF5FA"/><ellipse cx="160" cy="152" rx="80" ry="11" fill="#F7E27A"/>' +
      '<path d="M126 148Q160 70 194 148Z" fill="#F3F7FA"/><path d="M146 146L160 92M174 146L160 92" stroke="#C9D7E3" stroke-width="2"/>' +
      g("le", '<path d="M118 100Q118 56 160 56Q202 56 202 100Z" fill="#F7D33F"/><rect x="118" y="96" width="84" height="8" rx="4" fill="#FBEA8C"/><path d="M132 74Q142 64 156 62" stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none"/>' + hand(PALM, 168, 56, 6, 1)) +
      [[136,0],[184,1],[150,2],[170,3]].map(([x,i]) => drop(x, 118, "#F7C531", "dr", i)).join("") +
      '<g' + T(268, 70) + '><circle r="26" fill="#F7D33F"/><circle r="21" fill="#FBEA8C"/><path d="M0-19V19M-19 0H19M-13-13L13 13M13-13L-13 13" stroke="#F7D33F" stroke-width="2"/></g>',
    css: k => an(k, ".le", "L", 1.4, E, "transform-origin:50% 100%") + kf(k, "L", "0%,100%{transform:translateY(-12px) rotate(-8deg)}45%,60%{transform:translateY(6px) rotate(8deg)}") +
      an(k, ".dr", "D", 1.2, EI) + kf(k, "D", "0%{opacity:0;transform:none}20%{opacity:1}100%{opacity:0;transform:translateY(30px)}")};

  /* 30 · Laver */
  A.laver = {t:"Laver", v:"bien laver les légumes", c:["#DCE8F7","#F3F8FE"],
    d: () => '<path d="M-10 150H330V210H-10Z" fill="#C9D4DE"/><path d="M50 150H270V198Q270 206 262 206H58Q50 206 50 198Z" fill="#A7B6C4"/>' +
      '<rect x="40" y="10" width="26" height="34" rx="6" fill="#8A9DAF"/><path d="M60 26H132Q150 26 150 44V56" stroke="' + L + '" stroke-width="18" fill="none"/><path d="M60 26H132Q150 26 150 44V56" stroke="#AEB8C2" stroke-width="12" fill="none"/>' +
      '<path class="wa" d="M150 62V122" stroke="#8EC1F0" stroke-width="10" stroke-dasharray="12 7"/>' +
      '<path d="M86 118H234Q228 166 160 170Q92 166 86 118Z" fill="#B8C6D3"/>' + [[112,134],[134,140],[160,142],[186,140],[208,134],[148,156],[172,156]].map(([x,y]) => '<circle cx="' + x + '" cy="' + y + '" r="2.8" fill="#7E91A3" stroke="none"/>').join("") +
      '<ellipse cx="160" cy="118" rx="74" ry="13" fill="#D5DEE6"/>' +
      g("ve", '<circle cx="130" cy="112" r="14" fill="#E8562F"/><path d="M126 99l4 4 4-4" stroke="#3E9A4F" stroke-width="2.4" fill="none"/><circle cx="188" cy="112" r="14" fill="#E8562F"/><path d="M184 99l4 4 4-4" stroke="#3E9A4F" stroke-width="2.4" fill="none"/>' + leaf(146, 110, -20, "#5DB86A") + leaf(160, 114, 30, "#3E9A4F")) +
      [[122,0],[198,1],[150,2],[172,3]].map(([x,i]) => drop(x, 98, "#6FA8E6", "sp", i)).join("") +
      [[130,0],[160,1],[190,2]].map(([x,i]) => drop(x, 170, "#6FA8E6", "dr", i)).join(""),
    css: k => an(k, ".wa", "W", 0.5, "linear") + kf(k, "W", "to{stroke-dashoffset:-19}") +
      an(k, ".ve", "V", 1, E) + kf(k, "V", "0%,100%{transform:none}50%{transform:translateY(3px)}") +
      an(k, ".sp", "S", 0.9, "ease-out") + kf(k, "S", "0%{opacity:0;transform:none}30%{opacity:1}100%{opacity:0;transform:translate(0,-16px)}") +
      an(k, ".dr", "D", 1.2, EI) + kf(k, "D", "0%{opacity:0;transform:none}20%{opacity:1}100%{opacity:0;transform:translateY(24px)}")};

  /* 31 · Mixer */
  A.mixer = {t:"Mixer", v:"mixer une soupe", c:["#E2EFE3","#F5FBF5"],
    d: () => table(178) + pot(150, 104, 84, 178, "#B8C6D3", "#D5DEE6", "#F08A3C") +
      g("vo", '<ellipse cx="150" cy="106" rx="50" ry="8" fill="none" stroke="#F7B27A" stroke-width="2.6"/><ellipse cx="150" cy="106" rx="26" ry="4.4" fill="none" stroke="#F7B27A" stroke-width="2.4"/>') +
      [0,1,2].map(i => '<circle class="sp sp' + i + '" cx="' + (120 + i*30) + '" cy="96" r="3.4" fill="#F08A3C" stroke-width="1.2"/>').join("") +
      g("mx", '<rect x="140" y="16" width="26" height="58" rx="11" fill="#FFFFFF"/><rect x="146" y="30" width="14" height="6" rx="3" fill="' + CUF + '"/><path d="M148 74H158V100H148Z" fill="#C9D2DA"/><path d="M140 100Q153 92 166 100L162 108H144Z" fill="#AEB8C2"/>' + hand(GRIP, 153, 50, -90, 0.9)),
    css: k => an(k, ".mx", "M", 0.12, "linear") + kf(k, "M", "0%,100%{transform:translateX(0)}50%{transform:translateX(1.4px)}") +
      an(k, ".vo", "V", 0.6, "linear", "transform-origin:50% 50%") + kf(k, "V", "0%{transform:scaleX(1)}50%{transform:scaleX(-1)}100%{transform:scaleX(1)}") +
      [0,1,2].map(i => an(k, ".sp" + i, "S", 1, "ease-out", "animation-delay:-" + (i*0.33).toFixed(2) + "s")).join("") + kf(k, "S", "0%{opacity:0;transform:none}30%{opacity:1}100%{opacity:0;transform:translateY(-22px)}")};

  /* 32 · Bain-marie */
  A.bainmarie = {t:"Bain-marie", v:"faire fondre du chocolat au bain-marie", c:["#F8E2CB","#FFF5EA"],
    d: () => stove(160, 70) + fire(160, 110, 5, 0.8) + pot(160, 128, 72, 176) +
      '<path d="M74 96H246Q240 146 160 150Q80 146 74 96Z" fill="#FFFFFF"/><path d="M88 108Q94 136 126 144" stroke="#EDE7DC" stroke-width="6" fill="none"/><ellipse cx="160" cy="96" rx="86" ry="17" fill="#F1ECE3"/><ellipse cx="160" cy="98" rx="76" ry="12" fill="#6B3E1C"/>' +
      g("ch", [[126,96],[150,92],[176,98],[196,94],[140,102]].map(([x,y], i) => g("pi pi" + i, '<rect x="' + (x - 7) + '" y="' + (y - 5) + '" width="14" height="10" rx="2.4" fill="#4E2A12" stroke-width="1.4"/>')).join("")) +
      g("sp", '<path d="M150 96L232 26" stroke="' + WDD + '" stroke-width="10"/><path d="M150 96L232 26" stroke="' + WD + '" stroke-width="5"/><path d="M140 92L158 108L166 98L150 84Z" fill="' + WD + '"/>' + hand(GRIP, 222, 34, -40, 0.9)) +
      steam(82, 122, 40, 0) + steam(238, 122, 40, 1),
    css: k => an(k, ".sp", "S", 2.2, E) + kf(k, "S", "0%,100%{transform:translate(0,0)}25%{transform:translate(-18px,2px)}50%{transform:translate(-30px,-2px)}75%{transform:translate(-12px,-4px)}") +
      ".gx-" + k + " .pi{transform-origin:50% 50%}" + [0,1,2,3,4].map(i => an(k, ".pi" + i, "P", 4.4, E, "animation-delay:-" + (i*0.5).toFixed(1) + "s")).join("") + kf(k, "P", "0%{transform:scale(1);opacity:1}70%{transform:scale(.2,.1);opacity:0}100%{transform:scale(.2,.1);opacity:0}")};

  /* 33 · Paner */
  A.paner = {t:"Paner", v:"paner une escalope", c:["#F6DEBF","#FFF6E8"],
    d: () => table(176) + [[58,"#F7F3EA"],[160,"#F7D36A"],[262,"#E3B26A"]].map(([x,c]) => shadowE(x, 176, 50, 6) + '<ellipse cx="' + x + '" cy="160" rx="50" ry="17" fill="#fff"/><ellipse cx="' + x + '" cy="157" rx="40" ry="11" fill="' + c + '"/>').join("") +
      [[252,155],[264,158],[272,153],[246,159],[258,152],[268,160]].map(([x,y]) => '<circle cx="' + x + '" cy="' + y + '" r="2.2" fill="#C98F4E" stroke="none"/>').join("") + '<circle cx="164" cy="155" r="6" fill="#F2A72B" stroke="none"/>' +
      [["Farine",58],["Œuf",160],["Chapelure",262]].map(([t,x]) => '<text x="' + x + '" y="194" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="700" fill="' + L + '" fill-opacity=".55" stroke="none">' + t + "</text>").join("") +
      arrow("M78 112Q109 64 140 112M180 112Q211 64 242 112", "ar") +
      g("cu", '<g transform="scale(1.45)"><path d="M-30-4Q-14-18 14-14Q32-10 30 2Q26 14 0 14Q-28 14-30-4Z" fill="#F0C9A5"/><path class="c1" d="M-30-4Q-14-18 14-14Q32-10 30 2Q26 14 0 14Q-28 14-30-4Z" fill="#FBF6EC"/><path class="c2" d="M-30-4Q-14-18 14-14Q32-10 30 2Q26 14 0 14Q-28 14-30-4Z" fill="#F6D27A"/><g class="c3"><path d="M-30-4Q-14-18 14-14Q32-10 30 2Q26 14 0 14Q-28 14-30-4Z" fill="#E3A85A"/><circle cx="-12" cy="-3" r="2" fill="#B97A30" stroke="none"/><circle cx="6" cy="4" r="2" fill="#B97A30" stroke="none"/><circle cx="16" cy="-4" r="1.8" fill="#B97A30" stroke="none"/></g></g>', T(58, 136)),
    css: k => an(k, ".cu", "C", 4.4, E, "transform-origin:50% 50%") + kf(k, "C", "0%,6%{transform:translate(58px,138px)}20%{transform:translate(109px,84px) rotate(-8deg)}32%,40%{transform:translate(160px,140px)}54%{transform:translate(211px,84px) rotate(8deg)}66%,82%{transform:translate(262px,140px)}92%{transform:translate(262px,140px);opacity:1}96%{opacity:0}100%{transform:translate(58px,138px);opacity:0}") +
      ".gx-" + k + " .c1,.gx-" + k + " .c2,.gx-" + k + " .c3{opacity:0}" + an(k, ".c1", "W", 4.4, "linear") + kf(k, "W", "0%,3%{opacity:0}7%,36%{opacity:1}40%,100%{opacity:0}") +
      an(k, ".c2", "Y", 4.4, "linear") + kf(k, "Y", "0%,36%{opacity:0}40%,66%{opacity:1}70%,100%{opacity:0}") + an(k, ".c3", "B", 4.4, "linear") + kf(k, "B", "0%,66%{opacity:0}70%,96%{opacity:1}100%{opacity:0}")};

  /* 34 · Plier les raviolis */
  const PLI = [["Garnir",0,20],["Mouiller",20,40],["Plier",40,60],["Pincer",60,95]];
  A.plier = {t:"Plier les raviolis", v:"plier des gyozas", c:["#E2EFE3","#F5FBF5"],
    d: k => boardBand(160) + chips(k, PLI) +
      '<path d="M90 112A70 70 0 0 0 230 112Z" fill="#FBF6EC"/><path d="M90 112A70 70 0 0 0 230 112" fill="none" stroke-width="2.4"/>' +
      g("tp", '<path d="M90 112A70 70 0 0 1 230 112Z" fill="#FBF6EC"/>') +
      g("ba", '<circle cx="160" cy="112" r="20" fill="#D9824A"/><circle cx="153" cy="106" r="3.4" fill="#6BBF59" stroke="none"/><circle cx="166" cy="116" r="3" fill="#F2B28A" stroke="none"/>') +
      '<circle class="wet" cx="160" cy="112" r="66" fill="none" stroke="#6FA8E6" stroke-width="4" stroke-dasharray="415" pathLength="415" stroke-linecap="round"/>' +
      g("tf", '<path d="M90 112A70 70 0 0 1 230 112Z" fill="#F1E3C6"/>') +
      [0,1,2,3,4].map(i => { const a = Math.PI*(0.22 + i*0.14), c = Math.cos(a), sn = Math.sin(a); const p = r => (160 - r*c).toFixed(1) + " " + (112 + r*sn).toFixed(1); return '<path class="pz pz' + i + '" d="M' + p(69) + "L" + p(54) + '" stroke-width="2.6"/>'; }).join(""),
    css: k => chipsCss(k, PLI, 6) +
      an(k, ".ba", "B", 6, "linear") + kf(k, "B", "0%{opacity:0;transform:scale(.2)}4%{opacity:0;transform:scale(.2);animation-timing-function:" + EO + "}14%,49%{opacity:1;transform:none}50%,100%{opacity:0}") +
      ".gx-" + k + " .wet{stroke-dashoffset:415;animation:" + k + "W 6s linear infinite}" + kf(k, "W", "0%,20%{stroke-dashoffset:415;opacity:1}38%{stroke-dashoffset:0;opacity:1}44%,100%{stroke-dashoffset:0;opacity:0}") +
      ".gx-" + k + " .tf{opacity:0}" + an(k, ".tf", "F", 6, "linear", "transform-origin:50% 100%") + kf(k, "F", "0%,42%{opacity:0;transform:scaleY(1)}43%{opacity:1;transform:scaleY(1);animation-timing-function:" + E + "}58%,95%{opacity:1;transform:scaleY(-1)}100%{opacity:0;transform:scaleY(-1)}") +
      an(k, ".tp", "T", 6, "linear") + kf(k, "T", "0%,42%{opacity:1}43%,96%{opacity:0}100%{opacity:1}") +
      ".gx-" + k + " .pz{opacity:0}" + [0,1,2,3,4].map(i => an(k, ".pz" + i, "P" + i, 6, "linear") + kf(k, "P" + i, "0%," + (62 + i*5) + "%{opacity:0}" + (64 + i*5) + "%,95%{opacity:1}100%{opacity:0}")).join("")};

  /* 35 · Remplir le moule */
  A.moule = {t:"Remplir le moule", v:"verser la pâte dans le moule", c:["#FBEACB","#FFF7E8"],
    d: () => table(182) + shadowE(160, 184, 96, 6) + '<path d="M62 126H258L246 182H74Z" fill="#AEB8C2"/><path d="M62 126H258" stroke-width="5"/><path d="M76 136H244M78 150H242M80 164H240" stroke="#8E9BA7" stroke-width="1.4"/>' +
      g("ba", '<path d="M76 178H244L248 156H72Z" fill="#F2D27A"/><path d="M84 160Q120 154 160 160T236 160" stroke="#E7BF55" stroke-width="2" fill="none"/>') +
      '<path class="po" d="M146 70C144 96 150 124 156 170" stroke="#F2D27A" stroke-width="10" fill="none" stroke-dasharray="16 6"/>' +
      g("bo", '<path d="M146 52H234Q230 86 190 88Q150 86 146 52Z" fill="#fff"/><path d="M156 62Q160 80 182 84" stroke="#EDE7DC" stroke-width="5" fill="none"/><ellipse cx="190" cy="52" rx="44" ry="9" fill="#F1ECE3"/><ellipse cx="190" cy="53" rx="37" ry="6" fill="#F2D27A"/>' + hand(GRIP, 244, 66, -16, 0.9)),
    css: k => an(k, ".bo", "B", 3.4, E, "transform-box:view-box;transform-origin:146px 56px") + kf(k, "B", "0%,100%{transform:rotate(0)}22%,78%{transform:rotate(-32deg)}") +
      an(k, ".po", "P", 3.4, "linear") + kf(k, "P", "0%,22%{opacity:0;stroke-dashoffset:0}28%,74%{opacity:1}80%,100%{opacity:0;stroke-dashoffset:-132}") +
      an(k, ".ba", "F", 3.4, E, "transform-origin:50% 100%") + kf(k, "F", "0%,24%{transform:scaleY(.12)}78%,100%{transform:scaleY(1)}")};

  function svg(key, hs){
    const a = A[key]; if (!a) return "";
    HS = HSTY[hs || "A"];
    return '<svg class="art gx gx-' + key + '" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + a.t + '"><style>' + KIT + a.css(key) + "</style>" +
      stage(key, a.c[0], a.c[1]) + '<g stroke="' + L + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">' + a.d(key) + "</g></svg>";
  }
  return {A, svg, keys:Object.keys(A)};
})();
