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
  // Main droite qui serre un manche horizontal centré en (0,0) ; le bras part vers la droite
  const GRIP = '<path d="M10-18L230-60L236-10L14 16Z" fill="' + CUF + '"/><path d="M10-18L21-21L25 15L14 16Z" fill="' + CUFD + '"/>' +
    '<path d="M-18-10C-18-20-6-24 6-22C16-20 20-14 20-6V6C20 13 12 16 2 16C-10 16-18 10-18 2Z" fill="' + SK + '"/>' +
    '<rect x="-20" y="2" width="9.5" height="16" rx="4.7" fill="' + SK + '"/><rect x="-11" y="3" width="9.5" height="16" rx="4.7" fill="' + SK + '"/><rect x="-2" y="3" width="9.5" height="15" rx="4.7" fill="' + SK + '"/><rect x="7" y="2" width="9" height="13" rx="4.5" fill="' + SK + '"/>' +
    '<path d="M0-17C-9-22-23-20-26-13C-27-8-22-6-17-8L-3-11Z" fill="' + SKL + '"/>';
  // Main gauche en griffe : bout des doigts repliés en (0,0), bras vers le haut à gauche
  const CLAW = '<path d="M-30-30L-180-150L-210-100L-46 0Z" fill="' + CUF + '"/><path d="M-30-30L-39-36L-55-4L-46 0Z" fill="' + CUFD + '"/>' +
    '<path d="M-40-22C-42-34-28-40-14-36C0-32 10-20 8-8C7 4-4 10-16 8C-30 6-40-6-40-22Z" fill="' + SK + '"/>' +
    '<rect x="-2" y="-24" width="16" height="10" rx="5" fill="' + SK + '"/><rect x="2" y="-14" width="16" height="10" rx="5" fill="' + SK + '"/><rect x="2" y="-4" width="15" height="10" rx="5" fill="' + SK + '"/>' +
    '<path d="M-30-28C-24-32-14-31-8-27" fill="none" stroke="' + SKL + '" stroke-width="2.6"/>';
  // Paume posée à plat (vue de côté), doigts vers la gauche, bras vers le haut à droite ; appui en (0,0)
  const PALM = '<path d="M14-22L160-110L190-70L26 8Z" fill="' + CUF + '"/><path d="M14-22L24-27L34 3L26 8Z" fill="' + CUFD + '"/>' +
    '<path d="M-34-2C-36-10-30-14-22-14H6C14-24 26-22 28-10C30 0 22 6 12 6H-28C-32 6-34 2-34-2Z" fill="' + SK + '"/>' +
    '<path d="M-26-6H2M-24 0H4" stroke="#DDA27C" stroke-width="1.4" fill="none"/><path d="M8-16C14-20 22-18 24-12" stroke="' + SKL + '" stroke-width="2.4" fill="none"/>';
  const hand = (kind, x, y, r, s, flip) => '<g' + T(x, y, r, s) + ">" + (flip ? '<g transform="scale(-1 1)">' + kind + "</g>" : kind) + "</g>";
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

  /* 1 · Émincer */
  A.emincer = {t:"Émincer", v:"comment émincer", c:["#F6DEBF","#FFF6E8"],
    d: () => boardBand(140) +
      '<path d="M50 162C50 114 76 92 110 92C144 92 168 114 168 162Z" fill="#F1D19C"/><path d="M68 162C68 124 86 106 110 106C134 106 150 124 150 162M88 162C88 134 98 120 110 120C122 120 130 134 130 162" fill="none" stroke="#C99A5C" stroke-width="1.6"/><path d="M62 126C72 108 88 101 102 100" fill="none" stroke="#FFF3DC" stroke-width="3.4"/>' +
      [0,1,2,3].map(i => g("sl sl" + i, '<path d="M' + (196 + i*22) + " 186c-2-16 6-28 20-32" + '" fill="none" stroke="' + L + '" stroke-width="7"/><path d="M' + (196 + i*22) + " 186c-2-16 6-28 20-32" + '" fill="none" stroke="#F6E2BC" stroke-width="3.4"/>')).join("") +
      hand(CLAW, 118, 104, -6, 1) +
      g("kn", knifeHand(176, 162, -36)),
    css: k => an(k, ".kn", "K", 1.4, E, "transform-origin:100% 0") + kf(k, "K", "0%,100%{transform:translate(4px,-22px) rotate(-6deg)}45%{transform:translate(0,0) rotate(0)}60%{transform:translate(0,0) rotate(0)}") +
      [0,1,2,3].map(i => an(k, ".sl" + i, "S", 5.6, EO, "animation-delay:" + (0.6 + i*1.4 - 5.6).toFixed(1) + "s")).join("") + kf(k, "S", "0%{opacity:0;transform:translateX(-18px) rotate(-10deg)}8%{opacity:1;transform:none}90%{opacity:1;transform:none}100%{opacity:0}")};

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
    d: () => stove(160, 80) + fire(160, 150, 7, 1.1) +
      g("pa", [-36,-22,-8,6,20,34].map((dx, i) => '<path d="M' + (160 + dx*0.25) + " 100L" + (160 + dx) + " " + (26 + Math.abs(dx)*0.5) + '" stroke="' + L + '" stroke-width="5.4"/><path d="M' + (160 + dx*0.25) + " 100L" + (160 + dx) + " " + (26 + Math.abs(dx)*0.5) + '" stroke="#F5D777" stroke-width="2.6"/>').join("")) +
      pot(160, 98, 86, 176) +
      [[106,0],[128,1],[152,2],[176,3],[200,4],[140,5],[188,6],[118,7],[212,8]].map(([x,i]) => '<circle class="bu" style="animation-delay:-' + (i*0.27).toFixed(2) + 's" cx="' + x + '" cy="100" r="6" fill="#EAF4FE" stroke-width="1.6"/>').join("") +
      steam(116, 82, 56, 0) + steam(160, 78, 62, 1) + steam(204, 82, 56, 2),
    css: k => an(k, ".bu", "Bu", 1.5, EI, "transform-origin:50% 50%") + kf(k, "Bu", "0%{transform:translateY(6px) scale(.2);opacity:0}30%{opacity:1}80%{transform:translateY(-2px) scale(1.1);opacity:1}100%{transform:translateY(-4px) scale(1.6);opacity:0}") +
      an(k, ".pa", "P", 3.6, E, "transform-origin:50% 100%") + kf(k, "P", "0%,100%{transform:none}50%{transform:translateY(8px) rotate(-3deg)}")};

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
      arrow("M96 96Q108 36 150 30Q192 36 204 96", "ar") +
      g("pn", pan(140, 134) + hand(GRIP, 290, 112, -18, 1)) +
      g("cr", '<ellipse cx="140" cy="128" rx="66" ry="18" fill="#E7A95A"/><ellipse cx="140" cy="126" rx="60" ry="14" fill="#F4CB86"/><circle cx="118" cy="125" r="3.6" fill="#D99A4E" stroke="none"/><circle cx="148" cy="121" r="3" fill="#D99A4E" stroke="none"/><circle cx="164" cy="129" r="3.2" fill="#D99A4E" stroke="none"/><circle cx="134" cy="132" r="2.4" fill="#D99A4E" stroke="none"/>'),
    css: k => ".gx-" + k + " .cr{transform-origin:50% 50%;animation:" + k + "C 2.6s infinite}" + kf(k, "C", "0%,22%{transform:none;animation-timing-function:cubic-bezier(.2,.7,.4,1)}48%{transform:translateY(-64px) scaleY(-.1);animation-timing-function:cubic-bezier(.6,0,.8,.5)}72%{transform:translateY(0) scaleY(-1)}78%{transform:translateY(-4px) scaleY(-.95)}84%,100%{transform:scaleY(-1)}") +
      an(k, ".pn", "P", 2.6, E, "transform-origin:90% 40%") + kf(k, "P", "0%,12%{transform:none}22%{transform:translateY(-10px) rotate(-4deg)}30%{transform:translateY(3px)}38%,66%{transform:none}74%{transform:translateY(4px)}82%,100%{transform:none}") +
      an(k, ".ar", "A", 2.6, "linear") + kf(k, "A", "0%,16%{opacity:0}30%,62%{opacity:1}80%,100%{opacity:0}")};

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
    d: () => table(176) + bowl(150, 128, 92, "#FFFFFF", "#FBF6EC", 0.55) +
      '<ellipse cx="150" cy="131" rx="56" ry="9" fill="#FFFDF8"/><ellipse cx="144" cy="131" rx="13" ry="5.4" fill="#F7B32B"/>' +
      g("ri", '<ellipse cx="150" cy="131" rx="22" ry="4.6" fill="none" stroke="#F7B32B" stroke-width="2.4"/>') +
      g("yo", '<ellipse cx="150" cy="96" rx="10" ry="11" fill="#F7B32B"/><ellipse cx="147" cy="92" rx="3.4" ry="3.8" fill="#FCD36A" stroke="none"/>') +
      g("eg", g("", g("hl", EGGH(1)) + g("hr", EGGH(-1)), T(150, 84)) + '<path class="ck" d="M150 56l-4 9 5 8-4 9" stroke="' + L + '" stroke-width="1.8" fill="none"/>' + hand(GRIP, 192, 70, -24, 0.9)),
    css: k => an(k, ".eg", "E", 3, "linear") + kf(k, "E", "0%{transform:translate(52px,-10px) rotate(14deg);animation-timing-function:" + EI + "}14%{transform:translate(52px,24px) rotate(14deg);animation-timing-function:" + EO + "}22%{transform:translate(52px,14px) rotate(14deg);animation-timing-function:" + E + "}40%,100%{transform:none}") +
      an(k, ".hl", "L", 3, E, "transform-origin:100% 100%") + kf(k, "L", "0%,40%{transform:none}56%,92%{transform:translate(-14px,-4px) rotate(-40deg)}100%{transform:none}") +
      an(k, ".hr", "R", 3, E, "transform-origin:0 100%") + kf(k, "R", "0%,40%{transform:none}56%,92%{transform:translate(14px,-4px) rotate(40deg)}100%{transform:none}") +
      an(k, ".ck", "Ck", 3, "linear") + kf(k, "Ck", "0%,13%{opacity:0}15%,40%{opacity:1}44%,100%{opacity:0}") +
      an(k, ".yo", "Y", 3, "linear") + kf(k, "Y", "0%,48%{opacity:0;transform:none}52%{opacity:1;transform:none;animation-timing-function:" + EI + "}68%{opacity:1;transform:translateY(34px) scale(.9,1.2)}72%,100%{opacity:0;transform:translateY(36px)}") +
      an(k, ".ri", "Ri", 3, EO, "transform-origin:50% 50%") + kf(k, "Ri", "0%,68%{opacity:0;transform:scale(.4)}72%{opacity:1}100%{opacity:0;transform:scale(2.2)}")};

  /* 16 · Mélanger */
  A.melanger = {t:"Mélanger", v:"bien mélanger", c:["#F5DCC2","#FFF3E6"],
    d: () => table(178) + '<path d="M54 102H266Q258 178 160 182Q62 178 54 102Z" fill="' + CUF + '"/><path d="M70 116Q76 160 120 172" stroke="#fff" stroke-opacity=".25" stroke-width="8" fill="none"/><ellipse cx="160" cy="102" rx="106" ry="20" fill="#3B8F5C"/><ellipse cx="160" cy="104" rx="96" ry="15" fill="#E8B04B"/>' +
      g("co", [[118,104,"#E86F55"],[142,108,"#5DB86A"],[166,101,"#F6EBCF"],[190,107,"#E86F55"],[210,103,"#5DB86A"],[130,99,"#F6EBCF"],[176,110,"#F6EBCF"]].map(([x,y,c]) => '<rect x="' + (x - 5) + '" y="' + (y - 5) + '" width="10" height="10" rx="2.6" fill="' + c + '" stroke-width="1.4"/>').join("")) +
      g("sp", g("", SPOON + hand(GRIP, -14, 0, 0, 1), T(240, 50, 38))),
    css: k => an(k, ".sp", "S", 1.8, "linear") + kf(k, "S", "0%{transform:translate(0,0)}25%{transform:translate(-30px,6px)}50%{transform:translate(-56px,0)}75%{transform:translate(-30px,-8px)}100%{transform:translate(0,0)}") +
      an(k, ".co", "C", 1.8, "linear", "transform-origin:50% 50%") + kf(k, "C", "0%{transform:translateX(0) scaleX(1)}50%{transform:translateX(-10px) scaleX(-1)}100%{transform:translateX(0) scaleX(1)}")};

  /* 17 · Ajouter / verser */
  A.verser = {t:"Ajouter", v:"ajouter les ingrédients en cuisine", c:["#F6DEBF","#FFF6E8"],
    d: () => stove(150, 70) + fire(150, 110, 5, 0.9) +
      '<rect x="60" y="118" width="24" height="12" rx="6" fill="#A8311D"/><rect x="216" y="118" width="24" height="12" rx="6" fill="#A8311D"/><path d="M76 110H224V162Q224 176 210 176H90Q76 176 76 162Z" fill="#C73A23"/><path d="M88 124V166" stroke="#fff" stroke-opacity=".28" stroke-width="8"/><ellipse cx="150" cy="110" rx="74" ry="14" fill="#A8311D"/><ellipse cx="150" cy="111" rx="66" ry="10" fill="#E07A3A"/>' +
      [[140,0,"#5DB86A"],[152,1,"#F6EBCF"],[132,2,"#E86F55"],[158,3,"#5DB86A"],[146,4,"#F2D27A"]].map(([x,i,c]) => '<rect class="pc pc' + i + '" x="' + x + '" y="62" width="10" height="10" rx="2.6" fill="' + c + '" stroke-width="1.4"/>').join("") +
      g("bo", '<path d="M150 46H224Q220 76 187 78Q154 76 150 46Z" fill="#fff"/><ellipse cx="187" cy="46" rx="37" ry="8" fill="#F1ECE3"/><ellipse cx="187" cy="47" rx="31" ry="5.4" fill="#E86F55"/>' + hand(GRIP, 232, 58, -10, 0.9)),
    css: k => an(k, ".bo", "B", 2.4, E, "transform-origin:0 50%") + kf(k, "B", "0%,100%{transform:rotate(0)}30%,70%{transform:rotate(-34deg)}") +
      [0,1,2,3,4].map(i => an(k, ".pc" + i, "P", 2.4, EI, "animation-delay:" + (0.12*i).toFixed(2) + "s;transform-origin:50% 50%")).join("") + kf(k, "P", "0%,28%{opacity:0;transform:none}34%{opacity:1}64%{opacity:1;transform:translateY(44px) rotate(120deg)}70%,100%{opacity:0;transform:translateY(48px) rotate(140deg)}")};

  /* 18 · Disposer en couches */
  A.disposer = {t:"Disposer", v:"monter un gratin en couches", c:["#F8E2CB","#FFF5EA"],
    d: () => table(178) + '<rect x="50" y="100" width="220" height="78" rx="16" fill="#DCEBF5" fill-opacity=".9"/>' +
      '<rect x="60" y="148" width="200" height="22" rx="6" fill="#FFF3D6"/><rect x="60" y="136" width="200" height="12" fill="#F2C27B"/><rect x="60" y="124" width="200" height="12" fill="#C24F2C"/>' +
      g("sa", '<rect x="60" y="112" width="200" height="12" rx="2" fill="#C24F2C"/>') +
      '<rect x="50" y="100" width="220" height="78" rx="16" fill="none" stroke-width="2.6"/><path d="M60 106H130" stroke="#fff" stroke-width="4" opacity=".8"/>' +
      g("sh", '<rect x="74" y="48" width="172" height="11" rx="4" fill="#F2C27B"/><path d="M84 53.5h152" stroke="#E2A65C" stroke-width="1.6" stroke-dasharray="6 8"/>'),
    css: k => an(k, ".sh", "S", 2.8, E) + kf(k, "S", "0%{transform:translateY(-30px);opacity:0}20%{opacity:1}55%,85%{transform:translateY(52px);opacity:1}100%{transform:translateY(52px);opacity:0}") +
      an(k, ".sa", "A", 2.8, EO, "transform-origin:0 50%") + kf(k, "A", "0%,10%{transform:scaleX(0)}45%,100%{transform:scaleX(1)}")};

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
  A.rouler = {t:"Rouler", v:"rouler un wrap ou des makis", c:["#E2EFE3","#F5FBF5"],
    d: () => table(178, "#E6D2AE") + '<rect x="16" y="110" width="288" height="66" rx="8" fill="#D9C28A"/>' + [30,50,70,90,110,130,150,170,190,210,230,250,270,290].map(x => '<path d="M' + x + ' 111v64" stroke="#B89A5C" stroke-width="1.8"/>').join("") +
      g("sh", '<rect x="78" y="118" width="214" height="50" rx="4" fill="#2F4A35"/><rect x="84" y="122" width="202" height="42" rx="3" fill="#FBF6EC"/><rect x="84" y="136" width="202" height="9" rx="4.5" fill="#E86F55"/><rect x="84" y="145" width="202" height="7" rx="3.5" fill="#5DB86A"/><rect x="84" y="130" width="202" height="6" rx="3" fill="#F2C27B"/>') +
      g("rl", '<circle r="31" fill="#2F4A35"/><circle r="25" fill="#FBF6EC"/><circle cx="-7" cy="-5" r="7" fill="#E86F55"/><circle cx="7" cy="6" r="6" fill="#5DB86A"/><circle cx="6" cy="-9" r="4.5" fill="#F2C27B"/><path d="M0 0m0-9a9 9 0 1 1-9 9a18 18 0 1 1 18 18" stroke="#D9C9A8" stroke-width="1.6" fill="none"/>', T(64, 140)) +
      arrow("M64 92Q160 58 256 92", "ar"),
    css: k => an(k, ".rl", "R", 3, E, "transform-origin:50% 50%") + kf(k, "R", "0%,8%{transform:translate(64px,140px) rotate(0)}70%,86%{transform:translate(262px,140px) rotate(370deg)}100%{transform:translate(64px,140px) rotate(0)}") +
      an(k, ".sh", "S", 3, E, "transform-origin:100% 50%") + kf(k, "S", "0%,8%{transform:scaleX(1)}70%,86%{transform:scaleX(.06)}100%{transform:scaleX(1)}")};

  /* 22 · Brochettes */
  A.brochettes = {t:"Monter les brochettes", v:"monter des brochettes", c:["#F5DCC2","#FFF3E6"],
    d: () => table(170) + '<path d="M20 108L262 92" stroke="' + WDD + '" stroke-width="5"/><path d="M20 108L262 92" stroke="' + WD + '" stroke-width="2"/>' +
      [[206,"#B5652C"],[178,"#E8562F"],[150,"#B5652C"],[122,"#F6EBCF"],[94,"#B5652C"],[66,"#5DB86A"]].map(([x,c], i) => g("cb cb" + i, '<rect x="' + (x - 11) + '" y="' + (97 - (x - 20)*0.066 - 9 + 10).toFixed(1) + '" width="22" height="22" rx="5" fill="' + c + '"/>')).join("") +
      hand(GRIP, 270, 92, -4, 0.95) + '<path d="M28 100L14 109L28 116" fill="#E7B579" stroke-width="1.6"/>',
    css: k => [0,1,2,3,4,5].map(i => an(k, ".cb" + i, "C", 4.2, EO, "animation-delay:" + (i*0.45 - 4.2).toFixed(2) + "s")).join("") + kf(k, "C", "0%{opacity:0;transform:translate(-90px,8px)}12%{opacity:1;transform:none}88%{opacity:1;transform:none}100%{opacity:0}")};

  /* 23 · Laisser reposer */
  A.reposer = {t:"Laisser reposer", v:"laisser mariner au frais", c:["#DCE8F7","#F3F8FE"],
    d: () => table(176, "#DCE3EA", "#C5CFD9") + bowl(130, 116, 90, "#FFFFFF", "#D9824A", 0.66) +
      '<path d="M40 116Q130 84 220 116" fill="#fff" fill-opacity=".55" stroke-width="2"/>' + g("sn", '<path d="M70 104Q96 94 124 92" stroke="#fff" stroke-width="5" fill="none"/>') +
      '<g' + T(254, 76) + '><circle r="34" fill="#fff"/><circle r="27" fill="#F4F3EF" stroke-width="1.4"/>' + [0,30,60,90,120,150,180,210,240,270,300,330].map(a => '<path d="M0-27v' + (a % 90 ? 4 : 7) + '" stroke-width="2" transform="rotate(' + a + ')"/>').join("") +
      '<path class="ha" d="M0 2V-20" stroke="#E8562F" stroke-width="3.4"/><path d="M0 0L10 6" stroke-width="3"/><circle r="3.4" fill="' + L + '"/><rect x="-8" y="-44" width="16" height="9" rx="3" fill="#AEB8C2"/></g>' +
      '<g' + T(48, 48) + '><g class="fz"><path d="M0-16V16M-14-8L14 8M-14 8L14-8" stroke="#6FA8E6" stroke-width="3.4"/><path d="M-4-12L0-8 4-12M-4 12L0 8 4 12" stroke="#6FA8E6" stroke-width="2.4" fill="none"/></g></g>',
    css: k => an(k, ".ha", "H", 4, "linear", "transform-origin:50% 100%") + kf(k, "H", "to{transform:rotate(360deg)}") +
      an(k, ".sn", "S", 3, E) + kf(k, "S", "0%,100%{opacity:.4;transform:translateX(-10px)}50%{opacity:1;transform:translateX(16px)}") +
      an(k, ".fz", "F", 3, E, "transform-origin:50% 50%") + kf(k, "F", "0%,100%{transform:rotate(0) scale(1)}50%{transform:rotate(30deg) scale(1.12)}")};

  /* 24 · Assaisonner */
  const SHAKER = (body, cap) => '<path d="M-16-26Q-16-42 0-42Q16-42 16-26V30Q16 40 6 40H-6Q-16 40-16 30Z" fill="' + body + '"/><path d="M-16-26Q-16-42 0-42Q16-42 16-26Z" fill="' + cap + '"/>' + [[-6,-32],[0,-36],[6,-32]].map(([x,y]) => '<circle cx="' + x + '" cy="' + y + '" r="1.8" fill="' + L + '" stroke="none"/>').join("");
  A.assaisonner = {t:"Assaisonner", v:"assaisonner et rectifier", c:["#EFEBE3","#FAF8F3"],
    d: () => table(176, "#E4DCCD", "#CFC5B3") + '<ellipse cx="150" cy="168" rx="104" ry="18" fill="#fff"/><ellipse cx="150" cy="165" rx="80" ry="12" fill="#F4F3EF"/><path d="M98 166Q150 140 202 166Z" fill="#C2622D"/>' +
      [0,1,2,3,4,5].map(i => '<circle class="gr gr' + (i % 3) + '" cx="' + (166 + i*7) + '" cy="' + (100 + (i % 2)*8) + '" r="2" fill="' + (i % 2 ? "#3B3632" : "#fff") + '" stroke-width="1"/>').join("") +
      g("sa", g("", SHAKER("#FFFFFF", "#C9D2DA") + hand(GRIP, 0, 12, 90, 0.85), T(206, 62, 217))),
    css: k => an(k, ".sa", "S", 0.55, E) + kf(k, "S", "0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(6px,-10px) rotate(-8deg)}") +
      [0,1,2].map(i => an(k, ".gr" + i, "G", 0.9, EI, "animation-delay:-" + (i*0.3).toFixed(1) + "s")).join("") + kf(k, "G", "0%{opacity:0;transform:none}15%{opacity:1}100%{opacity:0;transform:translateY(58px)}")};

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
      g("pl", '<ellipse cx="136" cy="140" rx="54" ry="10" fill="#fff" fill-opacity=".85"/><path d="M110 138Q112 116 136 114Q160 116 162 138Z" fill="#C2622D"/>') +
      '<rect x="228" y="52" width="40" height="22" rx="5" fill="#141412"/><text class="tm" x="248" y="68" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="12" font-weight="800" fill="#7EE0A1" stroke="none">1:30</text>' +
      '<circle cx="248" cy="96" r="9" fill="#55524B"/><circle cx="248" cy="124" r="9" fill="#55524B"/><rect x="232" y="144" width="32" height="12" rx="6" fill="#55524B"/>' +
      g("di", '<path d="M276 30l12-10M282 42l16-4M270 22l4-14" stroke="#F2A72B" stroke-width="3"/>'),
    css: k => an(k, ".pl", "P", 3, E, "transform-origin:50% 50%") + kf(k, "P", "0%,100%{transform:translateX(-12px) scaleX(.92)}50%{transform:translateX(12px) scaleX(1)}") +
      an(k, ".gl", "G", 1.5, E) + kf(k, "G", "0%,100%{opacity:1}50%{opacity:.8}") +
      an(k, ".di", "D", 3, EO, "transform-origin:0 100%") + kf(k, "D", "0%,80%{opacity:0;transform:scale(.6)}88%{opacity:1;transform:scale(1.1)}100%{opacity:0;transform:scale(1)}")};

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
  A.plier = {t:"Plier les raviolis", v:"plier des gyozas", c:["#E2EFE3","#F5FBF5"],
    d: () => boardBand(140) + '<circle cx="66" cy="160" r="30" fill="#FBF6EC"/><circle cx="66" cy="160" r="9" fill="#D9824A"/><circle cx="62" cy="157" r="2.6" fill="#5DB86A" stroke="none"/>' +
      '<path d="M120 164A40 40 0 0 0 200 164Z" fill="#FBF6EC"/><circle cx="160" cy="166" r="9" fill="#D9824A"/>' + g("fo", '<path d="M120 164A40 40 0 0 1 200 164Z" fill="#F4E8D2"/>') +
      g("pl", [0,1,2,3,4].map(i => '<path d="M' + (134 + i*8) + " " + (146 - (i === 2 ? 4 : i % 2 ? 2 : 0)) + 'l3 7" stroke-width="2"/>').join("")) +
      '<path d="M226 168Q254 128 282 168Z" fill="#F1E3C6"/><path d="M236 156l4 6M246 148l3 7M256 146v7M266 148l-3 7M276 156l-4 6" stroke-width="1.8"/>' +
      drop(160, 112, "#6FA8E6", "wt", 0),
    css: k => an(k, ".fo", "F", 3, E, "transform-origin:50% 100%") + kf(k, "F", "0%,15%{transform:scaleY(1)}45%,100%{transform:scaleY(-1)}") +
      an(k, ".pl", "P", 3, "linear") + kf(k, "P", "0%,50%{opacity:0}60%,95%{opacity:1}100%{opacity:0}") +
      an(k, ".wt", "W", 3, EI) + kf(k, "W", "0%{opacity:0;transform:none}5%{opacity:1}15%{opacity:0;transform:translateY(30px)}100%{opacity:0}")};

  /* 35 · Remplir le moule */
  A.moule = {t:"Remplir le moule", v:"verser la pâte dans le moule", c:["#FBEACB","#FFF7E8"],
    d: () => table(182) + shadowE(160, 184, 96, 6) + '<path d="M62 126H258L246 182H74Z" fill="#AEB8C2"/><path d="M62 126H258" stroke-width="5"/><path d="M76 136H244M78 150H242M80 164H240" stroke="#8E9BA7" stroke-width="1.4"/>' +
      g("ba", '<path d="M76 178H244L248 156H72Z" fill="#F2D27A"/><path d="M84 160Q120 154 160 160T236 160" stroke="#E7BF55" stroke-width="2" fill="none"/>') +
      '<path class="po" d="M146 70C144 96 150 124 156 170" stroke="#F2D27A" stroke-width="10" fill="none" stroke-dasharray="16 6"/>' +
      g("bo", '<path d="M146 52H234Q230 86 190 88Q150 86 146 52Z" fill="#fff"/><path d="M156 62Q160 80 182 84" stroke="#EDE7DC" stroke-width="5" fill="none"/><ellipse cx="190" cy="52" rx="44" ry="9" fill="#F1ECE3"/><ellipse cx="190" cy="53" rx="37" ry="6" fill="#F2D27A"/>' + hand(GRIP, 244, 66, -16, 0.9)),
    css: k => an(k, ".bo", "B", 3.4, E, "transform-box:view-box;transform-origin:146px 56px") + kf(k, "B", "0%,100%{transform:rotate(0)}22%,78%{transform:rotate(-32deg)}") +
      an(k, ".po", "P", 3.4, "linear") + kf(k, "P", "0%,22%{opacity:0;stroke-dashoffset:0}28%,74%{opacity:1}80%,100%{opacity:0;stroke-dashoffset:-132}") +
      an(k, ".ba", "F", 3.4, E, "transform-origin:50% 100%") + kf(k, "F", "0%,24%{transform:scaleY(.12)}78%,100%{transform:scaleY(1)}")};

  function svg(key){
    const a = A[key]; if (!a) return "";
    return '<svg class="art gx gx-' + key + '" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + a.t + '"><style>' + KIT + a.css(key) + "</style>" +
      stage(key, a.c[0], a.c[1]) + '<g stroke="' + L + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">' + a.d(key) + "</g></svg>";
  }
  return {A, svg, keys:Object.keys(A)};
})();
