/* ═══ Biscuit · gestes illustrés du mode cuisine ═══
   Chaque geste : titre, recherche vidéo, fond, dessin (200 × 120) et mots qui le déclenchent. */
const GX = (() => {
  const shd = (cx, cy, rx, ry) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + (ry || 5) + '" fill="#000" fill-opacity=".07"/>';
  const bg = c => '<rect width="200" height="120" fill="' + c + '"/>';
  const BOARD = '<rect x="20" y="72" width="160" height="34" rx="10" fill="#C99560"/><rect x="20" y="66" width="160" height="34" rx="10" fill="#E2B27A"/><circle cx="166" cy="83" r="5" fill="#C99560"/>';
  const fl = (x, y, i) => '<g class="g-flame" style="animation-delay:-' + (i*0.23).toFixed(2) + 's"><path d="M' + x + " " + y + 'c-6-6-4-12 0-18c4 6 6 12 0 18Z" fill="#FF8A3D"/><path d="M' + x + " " + (y-1) + 'c-3-4-2-7 0-11c2 4 3 7 0 11Z" fill="#FFD25A"/></g>';
  const fire = (xs, y) => xs.map((x, i) => fl(x, y || 103, i)).join("");
  const burner = (x, w) => '<rect x="' + x + '" y="101" width="' + w + '" height="7" rx="3.5" fill="#3A3936"/>';
  const steam = (x, y, i) => '<path class="g-steam" style="animation-delay:-' + (i*0.6).toFixed(1) + 's" d="M' + x + " " + y + 'q3-5 0-10q-3-5 0-10" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/>';
  const knife = (x, y, cls, rot) => '<g transform="translate(' + x + " " + y + ')' + (rot ? " rotate(" + rot + ")" : "") + '"><g class="' + (cls || "g-knife") + '"><path d="M0 0L68-20C72-21 74-18 72-15L6 8Z" fill="#DDE1E5"/><path d="M0 0L68-20" stroke="#F4F6F8" stroke-width="1.5"/><rect x="68" y="-27" width="26" height="10" rx="5" fill="#2B2A27" transform="rotate(-17 68 -22)"/></g></g>';
  const bowl = (cx, rim, w, fill, inside) => '<path d="M' + (cx-w) + " " + rim + "h" + (2*w) + "q-4 " + (w*0.72).toFixed(0) + " -" + w + " " + (w*0.76).toFixed(0) + "q-" + (w-4) + " -" + (w*0.04).toFixed(0) + " -" + w + " -" + (w*0.76).toFixed(0) + 'z" fill="' + fill + '"/><ellipse cx="' + cx + '" cy="' + rim + '" rx="' + w + '" ry="' + (w*0.18).toFixed(1) + '" fill="#F1ECE3"/><ellipse cx="' + cx + '" cy="' + (rim+1) + '" rx="' + (w-6) + '" ry="' + (w*0.12).toFixed(1) + '" fill="' + inside + '"/>';
  const cube = (x, y, c, t) => '<rect x="' + x + '" y="' + y + '" width="10" height="10" rx="2.5" fill="' + c + '"/><rect x="' + x + '" y="' + y + '" width="10" height="4" rx="2" fill="' + t + '"/>';
  const leaf = (x, y, a, c) => '<ellipse cx="' + x + '" cy="' + y + '" rx="5" ry="2.6" fill="' + c + '" transform="rotate(' + a + " " + x + " " + y + ')"/>';
  const drop = (x, y, c, i) => '<path class="g-drop" style="animation-delay:-' + (i*0.4).toFixed(1) + 's" d="M' + x + " " + y + 'c-2 3-3.5 5-2 7c1.5 1.5 3 1.5 4 0c1.5-2 0-4-2-7Z" fill="' + c + '"/>';
  const panTop = '<ellipse cx="100" cy="82" rx="56" ry="16" fill="#2B2A27"/><rect x="154" y="68" width="42" height="9" rx="4.5" fill="#2B2A27" transform="rotate(-12 154 72)"/><ellipse cx="100" cy="74" rx="58" ry="18" fill="#3A3936"/><ellipse cx="100" cy="75" rx="50" ry="13.5" fill="#5A554D"/><ellipse cx="84" cy="71" rx="17" ry="3.4" fill="#fff" fill-opacity=".16"/>';
  const steelPot = (top) => '<rect x="40" y="' + (top+10) + '" width="16" height="8" rx="4" fill="#6F8395"/><rect x="144" y="' + (top+10) + '" width="16" height="8" rx="4" fill="#6F8395"/><rect x="52" y="' + top + '" width="96" height="' + (104-top) + '" rx="10" fill="#9DB0C2"/><rect x="52" y="' + (top+10) + '" width="96" height="4" fill="#fff" fill-opacity=".18"/><ellipse cx="100" cy="' + (top+1) + '" rx="48" ry="8" fill="#B9C8D6"/>';

  const G = {
    emincer:{t:"Émincer", v:"comment émincer", b:"#FDF0D3", d: bg("#FDF0D3") + shd(100,108,84,6) + BOARD +
      '<path d="M44 88A24 24 0 0 1 92 88Z" fill="#F6EBCF"/><path d="M44 88A24 24 0 0 1 92 88" stroke="#C98F4E" stroke-width="3" fill="none"/><path d="M51 88A17 17 0 0 1 85 88M58 88A10 10 0 0 1 78 88" stroke="#E3C98F" stroke-width="2" fill="none"/>' +
      '<path d="M100 90a6 6 0 0 1 12 0M113 91a6 6 0 0 1 12 0M126 90a6 6 0 0 1 12 0" stroke="#F6EBCF" stroke-width="3.4" stroke-linecap="round" fill="none"/>' + knife(100,62)},
    des:{t:"Couper en dés", v:"couper en dés technique", b:"#FDF0D3", d: bg("#FDF0D3") + shd(100,108,84,6) + BOARD +
      [[40,80],[52,78],[46,88],[60,88],[34,90],[58,76],[70,86],[66,94]].map(([x,y]) => cube(x, y, "#E8742A", "#F59A55")).join("") +
      '<path d="M104 78h42q8 0 8 7t-8 7h-42z" fill="#E8742A"/><path d="M104 78h42q8 0 8 3h-50z" fill="#F59A55"/>' + knife(96,64)},
    hacher:{t:"Hacher", v:"hacher des herbes au couteau", b:"#E8F2EA", d: bg("#E8F2EA") + shd(100,108,84,6) + BOARD +
      [[64,84,20],[74,80,-30],[84,86,60],[94,82,10],[104,88,-40],[114,83,35],[124,87,-10],[78,90,45],[98,91,-20],[118,92,70],[88,78,-60],[108,79,25],[70,92,-15],[130,90,40]].map(([x,y,a], i) => leaf(x, y, a, i % 2 ? "#5DB86A" : "#3E9A4F")).join("") +
      knife(66,66,"g-rock")},
    eplucher:{t:"Éplucher", v:"éplucher avec un économe", b:"#FDF0D3", d: bg("#FDF0D3") + shd(100,108,84,6) + BOARD +
      '<path d="M44 82l-16-9M44 82h-18M44 82l-15 9" stroke="#3E9A4F" stroke-width="4" stroke-linecap="round"/><path d="M44 82q2-8 14-8l94 4q8 4 0 9l-94 4q-12 0-14-9z" fill="#E8742A"/><path d="M112 77l40 1q8 4 0 9l-40 1z" fill="#F59A55"/>' +
      '<path d="M100 94q4 4 8 0t8 0M124 96q4 4 8 0t8 0" stroke="#E8742A" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<g class="g-slide"><rect x="104" y="40" width="12" height="30" rx="6" fill="#2E7A4C"/><path d="M100 70h20v8h-20z" fill="none" stroke="#A9B4BF" stroke-width="3" stroke-linejoin="round"/></g>'},
    raper:{t:"Râper", v:"comment râper", b:"#E8F2EA", d: bg("#E8F2EA") + shd(100,108,70,9) + '<ellipse cx="100" cy="105" rx="66" ry="8" fill="#fff"/><ellipse cx="80" cy="102" rx="9" ry="3" fill="#EBCB8B"/><ellipse cx="92" cy="104" rx="7" ry="2.6" fill="#E3B85E"/><ellipse cx="72" cy="105" rx="6" ry="2.2" fill="#EBCB8B"/>' +
      '<path d="M120 26L132 100L139 96L127 24Z" fill="#A9B4BF"/><path d="M80 26L120 26L132 100L68 100Z" fill="#C9D2DA"/><path d="M88 26V17Q100 8 112 17V26" stroke="#2B2A27" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
      [[92,40],[100,40],[108,40],[88,53],[96,53],[104,53],[112,53],[86,66],[94,66],[102,66],[110,66],[118,66],[82,80],[90,80],[98,80],[106,80],[114,80],[122,80]].map(([x,y]) => '<ellipse cx="' + x + '" cy="' + y + '" rx="2.4" ry="1.4" fill="#8E9BA7"/>').join("") +
      '<g class="g-rub"><path d="M146 72c8-6 18-2 20 6c6 2 8 10 2 14c-4 6-14 4-18 0c-8 2-12-6-8-12c-2-4 0-8 4-8Z" fill="#E3C27A"/><path d="M152 80q6-2 10 2M150 88q6 2 12-1" stroke="#C9A35A" stroke-width="1.6" stroke-linecap="round" fill="none"/></g>'},
    ecraser:{t:"Écraser", v:"écraser à la fourchette", b:"#FBEBD8", d: bg("#FBEBD8") + shd(100,110,60,5) + bowl(100,66,56,"#fff","#F2D27A") +
      '<circle cx="84" cy="66" r="4" fill="#F7E2A3"/><circle cx="110" cy="68" r="3.5" fill="#E9C25F"/><circle cx="96" cy="64" r="3" fill="#F7E2A3"/>' +
      '<g transform="rotate(18 100 60)"><g class="g-press"><rect x="97" y="10" width="7" height="38" rx="3.5" fill="#A9B4BF"/><path d="M90 46h21v6q0 4-4 4h-13q-4 0-4-4z" fill="#C9D2DA"/><path d="M92 55v10M97.5 55v10M103 55v10M108.5 55v10" stroke="#C9D2DA" stroke-width="3" stroke-linecap="round"/></g></g>'},
    revenir:{t:"Faire revenir", v:"faire revenir", b:"#F7E2C9", d: bg("#F7E2C9") + shd(100,110,72,6) + fire([82,100,118],102) + '<rect x="58" y="100" width="84" height="7" rx="3.5" fill="#3A3936"/>' + panTop +
      '<g class="g-sizzle">' + [[82,74,20,"#F2DFA6"],[94,79,-15,"#E2AE55"],[106,72,35,"#F2DFA6"],[118,77,-25,"#E2AE55"],[102,80,10,"#F2DFA6"],[74,78,40,"#E9C77A"],[125,72,15,"#F2DFA6"]].map(([x,y,a,c]) => '<ellipse cx="' + x + '" cy="' + y + '" rx="5.5" ry="2.4" fill="' + c + '" transform="rotate(' + a + " " + x + " " + y + ')"/>').join("") + "</g>" +
      '<g class="g-spat"><path d="M54 22L91 69" stroke="#C98F4E" stroke-width="6" stroke-linecap="round"/><rect x="84" y="64" width="18" height="10" rx="3" fill="#B97C3F" transform="rotate(39 93 69)"/></g>' + steam(110,50,0) + steam(130,55,1)},
    mijoter:{t:"Laisser mijoter", v:"laisser mijoter à couvert", b:"#FDE7E1", d: bg("#FDE7E1") + shd(100,112,66,5) +
      '<path d="M100 110c-4-4-3-8 0-12c3 4 4 8 0 12ZM88 110c-2-2-1.5-4.5 0-6.5c1.5 2 2 4.5 0 6.5ZM112 110c-2-2-1.5-4.5 0-6.5c1.5 2 2 4.5 0 6.5Z" fill="#FF8A3D"/><rect x="62" y="104" width="76" height="6" rx="3" fill="#3A3936"/>' +
      '<rect x="42" y="64" width="16" height="9" rx="4.5" fill="#A8311D"/><rect x="142" y="64" width="16" height="9" rx="4.5" fill="#A8311D"/><rect x="54" y="54" width="92" height="50" rx="13" fill="#C73A23"/><rect x="54" y="62" width="92" height="4" fill="#fff" fill-opacity=".14"/><ellipse cx="128" cy="55" rx="15" ry="3.4" fill="#E07A3A"/><circle cx="124" cy="54" r="1.6" fill="#F7B27A"/><circle cx="133" cy="55" r="1.3" fill="#F7B27A"/>' +
      '<g transform="rotate(-9 64 52)"><g class="g-lid"><ellipse cx="98" cy="52" rx="48" ry="7" fill="#A8311D"/><rect x="92" y="42" width="12" height="7" rx="3" fill="#2B2A27"/></g></g>' + steam(132,40,0) + steam(144,44,1)},
    bouillir:{t:"Cuire à l'eau bouillante", v:"cuire des pâtes dans l'eau bouillante", b:"#E4ECFB", d: bg("#E4ECFB") + shd(100,112,62,5) + fire([80,100,120]) + burner(60,80) +
      '<path d="M88 52L76 16M95 52L89 13M102 52L102 12M109 52L114 14M116 52L126 18" stroke="#F2D27A" stroke-width="2.8" stroke-linecap="round"/>' + steelPot(48) + '<ellipse cx="100" cy="50" rx="43" ry="5.5" fill="#7FB2EC"/>' +
      [[72,50,0],[86,51,1],[100,49,2],[114,51,3],[128,50,4],[93,52,5],[108,48,6]].map(([x,y,i]) => '<circle class="g-bubble" style="animation-delay:-' + (i*0.27).toFixed(2) + 's" cx="' + x + '" cy="' + y + '" r="2.6" fill="#D7E8FB"/>').join("") + steam(70,36,0) + steam(134,38,1)},
    egoutter:{t:"Égoutter", v:"égoutter dans une passoire", b:"#E4ECFB", d: bg("#E4ECFB") + shd(100,112,60,5) + '<rect x="40" y="48" width="16" height="7" rx="3.5" fill="#8A9DAF"/><rect x="144" y="48" width="16" height="7" rx="3.5" fill="#8A9DAF"/><path d="M52 52L148 52Q144 98 100 102Q56 98 52 52Z" fill="#9DB0C2"/><rect x="84" y="99" width="32" height="6" rx="3" fill="#8A9DAF"/>' +
      [[70,66],[82,66],[94,66],[106,66],[118,66],[130,66],[76,78],[88,78],[100,78],[112,78],[124,78],[88,90],[100,90],[112,90]].map(([x,y]) => '<circle cx="' + x + '" cy="' + y + '" r="1.9" fill="#6F8395"/>').join("") +
      '<ellipse cx="100" cy="52" rx="50" ry="10" fill="#B9C8D6"/><ellipse cx="100" cy="53" rx="44" ry="7" fill="#E3BE73"/>' + [[80,53],[90,50],[101,53],[112,50],[122,54],[94,56],[108,57],[86,57]].map(([x,y]) => '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#F1D9A5"/>').join("") +
      drop(90,104,"#4F8FE0",0) + drop(104,106,"#4F8FE0",1) + drop(116,103,"#4F8FE0",2)},
    four:{t:"Au four", v:"préchauffer le four", b:"#FCF1D4", d: bg("#FCF1D4") + shd(100,114,62,4) + '<rect x="46" y="14" width="108" height="98" rx="12" fill="#2B2A27"/><path d="M58 14H142A12 12 0 0 1 154 26V36H46V26A12 12 0 0 1 58 14Z" fill="#3A3936"/><circle cx="62" cy="25" r="5" fill="#CFCDC5"/><circle cx="78" cy="25" r="5" fill="#CFCDC5"/><rect x="104" y="19" width="40" height="12" rx="3" fill="#141412"/>' +
      '<rect x="64" y="40" width="72" height="4" rx="2" fill="#CFCDC5"/><rect x="58" y="48" width="84" height="56" rx="8" fill="#F2A65A"/><rect class="g-glow" x="62" y="52" width="76" height="48" rx="6" fill="#F7C27D"/><path d="M68 58H132" stroke="#E8562F" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="72" y="80" width="56" height="13" rx="4" fill="#fff"/><rect x="76" y="75" width="48" height="9" rx="4.5" fill="#C24F2C"/><circle cx="86" cy="78" r="1.6" fill="#F6E9CF"/><circle cx="100" cy="77" r="1.6" fill="#F6E9CF"/><circle cx="114" cy="79" r="1.6" fill="#F6E9CF"/>' +
      '<text x="124" y="28.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="8.5" font-weight="700" fill="#FF8A3D" class="g-temp">°C</text>'},
    frire:{t:"Frire", v:"friture à la poêle sans danger", b:"#FDF0D3", d: bg("#FDF0D3") + shd(100,112,62,5) + fire([80,100,120]) + burner(60,80) +
      '<rect x="40" y="62" width="16" height="8" rx="4" fill="#2B2A27"/><rect x="144" y="62" width="16" height="8" rx="4" fill="#2B2A27"/><rect x="52" y="52" width="96" height="52" rx="12" fill="#3A3936"/><ellipse cx="100" cy="53" rx="48" ry="8" fill="#55524B"/><ellipse cx="100" cy="54" rx="43" ry="5.5" fill="#E9B949"/>' +
      '<rect x="76" y="49" width="16" height="6" rx="3" fill="#D98E2E" transform="rotate(-12 84 52)"/><rect x="104" y="51" width="18" height="6" rx="3" fill="#C97A22" transform="rotate(10 113 54)"/><rect x="92" y="53" width="14" height="5" rx="2.5" fill="#E3A43E"/>' +
      [[70,55,0],[86,57,1],[98,51,2],[118,56,3],[130,53,4]].map(([x,y,i]) => '<circle class="g-bubble" style="animation-delay:-' + (i*0.21).toFixed(2) + 's" cx="' + x + '" cy="' + y + '" r="1.8" fill="#FFF3C4"/>').join("") +
      '<g class="g-dip"><path d="M168 14L128 44" stroke="#2B2A27" stroke-width="5" stroke-linecap="round"/><ellipse cx="122" cy="47" rx="13" ry="5" fill="#8E9BA7" transform="rotate(-30 122 47)"/></g>'},
    retourner:{t:"Retourner", v:"retourner une crêpe", b:"#F7E2C9", d: bg("#F7E2C9") + shd(100,110,72,6) + fire([82,100,118],102) + '<rect x="58" y="100" width="84" height="7" rx="3.5" fill="#3A3936"/>' + panTop +
      '<path d="M60 34q-10-14 4-26M140 34q10-14-4-26" stroke="#C99560" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 5" fill="none"/>' +
      '<g class="g-flip"><ellipse cx="100" cy="48" rx="40" ry="9" fill="#F2C27B"/><ellipse cx="100" cy="47" rx="34" ry="6.5" fill="#F7D59A"/><circle cx="88" cy="47" r="2.2" fill="#D99A4E"/><circle cx="106" cy="45" r="1.8" fill="#D99A4E"/><circle cx="114" cy="49" r="2" fill="#D99A4E"/></g>'},
    fouetter:{t:"Fouetter", v:"fouetter au fouet", b:"#FBEBD8", d: bg("#FBEBD8") + shd(100,110,60,5) + bowl(100,66,56,"#fff","#F6E3B0") +
      '<path d="M76 67q12-4 24 0t24 0" stroke="#EBCB8B" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<g transform="rotate(22 126 40)"><g class="g-whisk"><rect x="122" y="2" width="9" height="30" rx="4.5" fill="#2B2A27"/><path d="M126.5 30C112 40 114 62 126.5 68C139 62 141 40 126.5 30ZM126.5 30C120 42 121 60 126.5 68C132 60 133 42 126.5 30Z" fill="none" stroke="#A9B4BF" stroke-width="2.4"/></g></g>'},
    oeufs:{t:"Casser les œufs", v:"casser un œuf proprement", b:"#FDF0D3", d: bg("#FDF0D3") + shd(100,114,56,4) + '<path d="M50 82h100q-4 28-50 30q-46-2-50-30z" fill="#fff"/><ellipse cx="100" cy="82" rx="50" ry="8" fill="#F1ECE3"/><ellipse cx="100" cy="83" rx="44" ry="5.5" fill="#FBF6EC"/><ellipse cx="94" cy="83" rx="9" ry="3.6" fill="#F7B32B"/>' +
      '<g transform="rotate(-24 92 36)"><path d="M92 22l-3 5 3 5-3 5 3 5-3 5 3 3C72 50 66 38 70 30C74 20 86 18 92 22Z" fill="#FFF8EE" stroke="#E2D3B8" stroke-width="2" stroke-linejoin="round"/></g>' +
      '<g transform="rotate(24 108 36)"><path d="M108 22l3 5-3 5 3 5-3 5 3 5-3 3C128 50 134 38 130 30C126 20 114 18 108 22Z" fill="#FFF8EE" stroke="#E2D3B8" stroke-width="2" stroke-linejoin="round"/></g>' +
      '<g class="g-fall"><ellipse cx="100" cy="60" rx="6.5" ry="7.5" fill="#F7B32B"/><ellipse cx="98" cy="58" rx="2" ry="2.4" fill="#FCD36A"/></g>'},
    melanger:{t:"Mélanger", v:"bien mélanger", b:"#F7E2C9", d: bg("#F7E2C9") + shd(100,112,66,5) +
      '<path d="M38 60h124q-6 46-62 48q-56-2-62-48z" fill="#2E7A4C"/><path d="M42 72h116" stroke="#fff" stroke-opacity=".16" stroke-width="4"/><ellipse cx="100" cy="60" rx="62" ry="11" fill="#3B8F5C"/><ellipse cx="100" cy="61" rx="56" ry="8" fill="#E8B04B"/>' +
      [[74,60,"#E86F55"],[90,63,"#5DB86A"],[104,59,"#F6EBCF"],[118,62,"#E86F55"],[132,60,"#5DB86A"],[84,57,"#F6EBCF"]].map(([x,y,c]) => '<rect x="' + (x-3) + '" y="' + (y-3) + '" width="6" height="6" rx="1.6" fill="' + c + '"/>').join("") +
      '<g class="g-stir"><path d="M150 6L112 56" stroke="#C98F4E" stroke-width="6" stroke-linecap="round"/><ellipse cx="108" cy="61" rx="7" ry="10" fill="#B97C3F" transform="rotate(37 108 61)"/></g>'},
    verser:{t:"Ajouter", v:"ajouter les ingrédients en cuisine", b:"#FDF0D3", d: bg("#FDF0D3") + shd(100,112,62,5) + fire([84,100,116],103) + burner(62,76) +
      '<rect x="44" y="70" width="14" height="8" rx="4" fill="#A8311D"/><rect x="142" y="70" width="14" height="8" rx="4" fill="#A8311D"/><rect x="54" y="62" width="92" height="42" rx="12" fill="#C73A23"/><ellipse cx="100" cy="63" rx="46" ry="8" fill="#A8311D"/><ellipse cx="100" cy="64" rx="40" ry="5.5" fill="#E07A3A"/>' +
      [[100,40,"#5DB86A",0],[108,48,"#E86F55",1],[95,52,"#F2D27A",2],[104,30,"#E86F55",3]].map(([x,y,c,i]) => '<rect class="g-fall" style="animation-delay:-' + (i*0.3).toFixed(1) + 's" x="' + x + '" y="' + y + '" width="6" height="6" rx="1.6" fill="' + c + '"/>').join("") +
      '<g transform="rotate(38 78 26)"><path d="M54 20h48q-2 20-24 21q-22-1-24-21z" fill="#fff"/><ellipse cx="78" cy="20" rx="24" ry="5" fill="#F1ECE3"/><ellipse cx="78" cy="21" rx="19" ry="3.2" fill="#E86F55"/></g>'},
    disposer:{t:"Disposer", v:"monter un gratin en couches", b:"#FBEBD8", d: bg("#FBEBD8") + shd(100,110,72,5) +
      '<rect x="34" y="56" width="132" height="50" rx="12" fill="#DCEBF5"/><rect x="40" y="64" width="120" height="8" rx="2" fill="#C24F2C"/><rect x="40" y="72" width="120" height="5" fill="#F2C27B"/><rect x="40" y="77" width="120" height="8" fill="#C24F2C"/><rect x="40" y="85" width="120" height="5" fill="#F2C27B"/><rect x="40" y="90" width="120" height="9" rx="3" fill="#FFF3D6"/>' +
      '<rect x="34" y="56" width="132" height="50" rx="12" fill="none" stroke="#B9C8D6" stroke-width="3"/><rect x="40" y="58" width="40" height="4" rx="2" fill="#fff" fill-opacity=".6"/>' +
      '<g class="g-place"><rect x="50" y="36" width="100" height="7" rx="3" fill="#F2C27B"/><path d="M58 39.5h84" stroke="#E2A65C" stroke-width="1.4" stroke-dasharray="4 6"/></g>'},
    tartiner:{t:"Tartiner", v:"tartiner", b:"#FDF0D3", d: bg("#FDF0D3") + shd(100,110,56,5) +
      '<path d="M58 104V58q0-16 18-18q6-12 24-12t24 12q18 2 18 18v46z" fill="#D99A4E"/><path d="M64 100V60q0-12 14-14q6-11 22-11t22 11q14 2 14 14v40z" fill="#F6DDB0"/><path d="M66 62q8-6 16 0t16 0t16 0t16 0v10q-8 5-16 0t-16 0t-16 0t-16 0z" fill="#F7D56A"/>' +
      '<g class="g-spread"><path d="M104 66L156 50q6-1 6 4q0 4-6 6L106 72Z" fill="#DDE1E5"/><rect x="156" y="44" width="28" height="10" rx="5" fill="#2E7A4C" transform="rotate(-17 156 49)"/></g>'},
    petrir:{t:"Étaler la pâte", v:"étaler une pâte au rouleau", b:"#FDF0D3", d: bg("#FDF0D3") + shd(100,108,84,6) + BOARD +
      [[36,74],[48,96],[160,76],[150,96],[60,70],[140,70]].map(([x,y]) => '<circle cx="' + x + '" cy="' + y + '" r="1.6" fill="#fff"/>').join("") + '<ellipse cx="100" cy="86" rx="58" ry="12" fill="#F6E3B0"/><ellipse cx="96" cy="84" rx="40" ry="6" fill="#FBEFD0"/>' +
      '<g class="g-roll"><rect x="22" y="65" width="22" height="8" rx="4" fill="#C99560"/><rect x="156" y="65" width="22" height="8" rx="4" fill="#C99560"/><rect x="40" y="62" width="120" height="14" rx="7" fill="#E9C189"/><rect x="40" y="64" width="120" height="3" rx="1.5" fill="#fff" fill-opacity=".35"/></g>'},
    rouler:{t:"Rouler", v:"rouler un wrap ou des makis", b:"#E8F2EA", d: bg("#E8F2EA") + shd(100,108,80,5) +
      '<rect x="22" y="84" width="156" height="20" rx="4" fill="#D9C28A"/>' + [34,48,62,76,90,104,118,132,146,160].map(x => '<path d="M' + x + ' 85v18" stroke="#C2A866" stroke-width="2"/>').join("") +
      '<g class="g-rollw"><rect x="36" y="62" width="114" height="30" rx="15" fill="#F1D9A5"/><path d="M46 66q50-6 100 0" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="150" cy="77" rx="12" ry="15" fill="#F6E6C2"/><circle cx="148" cy="72" r="3" fill="#5DB86A"/><circle cx="154" cy="78" r="2.6" fill="#E86F55"/><circle cx="147" cy="82" r="2.4" fill="#F7B32B"/><path d="M150 77m0-4a4 4 0 1 1-4 4a8 8 0 1 1 8 8" stroke="#D9B878" fill="none" stroke-width="1.6"/></g>'},
    brochettes:{t:"Monter les brochettes", v:"monter des brochettes", b:"#F7E2C9", d: bg("#F7E2C9") + shd(100,112,74,5) + fire([60,80,100,120,140],110) +
      '<rect x="26" y="86" width="148" height="6" rx="3" fill="#2B2A27"/>' + [40,62,84,106,128,150].map(x => '<rect x="' + x + '" y="80" width="4" height="16" rx="2" fill="#3A3936"/>').join("") +
      [[42,"#B5652C"],[58,"#E8562F"],[74,"#B5652C"],[90,"#F6EBCF"],[106,"#B5652C"],[122,"#5DB86A"],[138,"#B5652C"]].map(([x,c], i) => '<rect x="' + x + '" y="' + (56 - i*0.6).toFixed(1) + '" width="14" height="14" rx="3.5" fill="' + c + '"/>').join("") +
      '<path d="M26 64L176 58" stroke="#C99560" stroke-width="3" stroke-linecap="round"/>' +
      [[48,"#B5652C"],[64,"#5DB86A"],[80,"#B5652C"],[96,"#E8562F"],[112,"#B5652C"],[128,"#F6EBCF"],[144,"#B5652C"]].map(([x,c], i) => '<rect x="' + x + '" y="' + (32 - i*0.6).toFixed(1) + '" width="14" height="14" rx="3.5" fill="' + c + '"/>').join("") +
      '<path d="M32 40L182 34" stroke="#C99560" stroke-width="3" stroke-linecap="round"/>' + steam(70,26,0) + steam(130,22,1)},
    reposer:{t:"Laisser reposer", v:"laisser mariner au frais", b:"#E4ECFB", d: bg("#E4ECFB") + shd(92,112,56,5) + bowl(92,64,54,"#fff","#D9824A") +
      '<path d="M38 64q54-22 108 0" fill="#fff" fill-opacity=".45" stroke="#fff" stroke-width="2"/><path d="M56 56q20-8 40-8" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>' +
      '<circle cx="158" cy="34" r="20" fill="#fff" stroke="#2B2A27" stroke-width="3.4"/><path d="M158 18v3M158 47v3M142 34h3M171 34h3" stroke="#2B2A27" stroke-width="2.4" stroke-linecap="round"/><rect class="g-tick" x="156.6" y="21" width="2.8" height="14" rx="1.4" fill="#E8562F"/><circle cx="158" cy="34" r="2.6" fill="#2B2A27"/>'},
    assaisonner:{t:"Assaisonner", v:"assaisonner et rectifier", b:"#EFEBE3", d: bg("#EFEBE3") + shd(100,112,70,5) + '<ellipse cx="100" cy="104" rx="66" ry="10" fill="#fff"/><ellipse cx="100" cy="102" rx="50" ry="6" fill="#F4F3EF"/>' +
      '<g transform="rotate(-28 76 60)"><g class="g-shake"><path d="M60 42q0-14 16-14t16 14v40q0 8-8 8h-16q-8 0-8-8z" fill="#fff" stroke="#E2DED4" stroke-width="2"/><path d="M60 42q0-14 16-14t16 14z" fill="#C9D2DA"/><circle cx="72" cy="35" r="1.4" fill="#6F8395"/><circle cx="80" cy="35" r="1.4" fill="#6F8395"/><circle cx="76" cy="31" r="1.4" fill="#6F8395"/></g></g>' +
      '<g transform="rotate(24 124 60)"><g class="g-shake" style="animation-delay:-.3s"><path d="M108 42q0-14 16-14t16 14v40q0 8-8 8h-16q-8 0-8-8z" fill="#3A3936"/><path d="M108 42q0-14 16-14t16 14z" fill="#8E9BA7"/><circle cx="120" cy="35" r="1.4" fill="#2B2A27"/><circle cx="128" cy="35" r="1.4" fill="#2B2A27"/><circle cx="124" cy="31" r="1.4" fill="#2B2A27"/></g></g>' +
      [[96,70,"#fff",0],[100,80,"#fff",1],[104,74,"#3A3936",2],[108,84,"#3A3936",3],[92,86,"#fff",4]].map(([x,y,c,i]) => '<circle class="g-fall" style="animation-delay:-' + (i*0.22).toFixed(2) + 's" cx="' + x + '" cy="' + y + '" r="1.6" fill="' + c + '" stroke="#C9C4B8" stroke-width=".5"/>').join("")},
    servir:{t:"Servir", v:"dresser une belle assiette", b:"#E8F2EA", d: bg("#E8F2EA") + shd(100,108,76,6) + '<ellipse cx="100" cy="86" rx="74" ry="20" fill="#fff"/><ellipse cx="100" cy="84" rx="56" ry="14" fill="#F4F3EF"/>' +
      '<path d="M62 86q8-24 30-24t30 24z" fill="#FBF6EC"/><path d="M96 88q10-18 30-16q16 2 18 16z" fill="#C2622D"/><circle cx="112" cy="80" r="3" fill="#E39A52"/><circle cx="126" cy="78" r="2.6" fill="#E39A52"/>' +
      [[90,24,30,0],[104,14,-20,1],[118,30,60,2],[98,40,-50,3],[112,46,10,4]].map(([x,y,a,i]) => '<g class="g-fall" style="animation-delay:-' + (i*0.34).toFixed(2) + 's">' + leaf(x, y, a, i % 2 ? "#5DB86A" : "#3E9A4F") + "</g>").join("") +
      '<path d="M150 30l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#F2C27B" class="g-twinkle"/>'},
    toaster:{t:"Griller", v:"griller du pain", b:"#FDF0D3", d: bg("#FDF0D3") + shd(100,112,62,5) +
      '<g class="g-pop"><rect x="64" y="28" width="32" height="36" rx="8" fill="#D99A4E"/><rect x="67" y="31" width="26" height="32" rx="6" fill="#F2C98B"/><rect x="104" y="28" width="32" height="36" rx="8" fill="#D99A4E"/><rect x="107" y="31" width="26" height="32" rx="6" fill="#F2C98B"/></g>' +
      '<rect x="46" y="48" width="108" height="60" rx="20" fill="#9DB0C2"/><rect x="60" y="46" width="40" height="8" rx="4" fill="#6F8395"/><rect x="100" y="46" width="40" height="8" rx="4" fill="#6F8395"/><rect x="56" y="62" width="88" height="5" rx="2.5" fill="#fff" fill-opacity=".3"/><rect x="152" y="70" width="14" height="7" rx="3.5" fill="#2B2A27"/><circle cx="100" cy="90" r="6" fill="#6F8395"/>'},
    vapeur:{t:"Cuire à la vapeur", v:"cuisson à la vapeur", b:"#E4ECFB", d: bg("#E4ECFB") + shd(100,112,60,5) + fire([84,100,116],103) + burner(62,76) +
      '<rect x="56" y="74" width="88" height="28" rx="8" fill="#9DB0C2"/><rect x="50" y="56" width="100" height="20" rx="6" fill="#D9B878"/><rect x="50" y="62" width="100" height="3" fill="#C29A55"/><rect x="50" y="38" width="100" height="20" rx="6" fill="#E3C68C"/><rect x="50" y="44" width="100" height="3" fill="#C29A55"/>' +
      '<path d="M54 38q46-26 92 0z" fill="#D9B878"/><rect x="94" y="16" width="12" height="8" rx="3" fill="#C29A55"/>' + steam(66,30,0) + steam(134,30,1) + steam(100,14,2)},
    microondes:{t:"Au micro-ondes", v:"réchauffer au micro-ondes", b:"#EFEBE3", d: bg("#EFEBE3") + shd(100,110,70,5) +
      '<rect x="32" y="22" width="136" height="84" rx="14" fill="#3A3936"/><rect x="42" y="32" width="88" height="64" rx="8" fill="#2B2A27"/><rect class="g-glow" x="46" y="36" width="80" height="56" rx="6" fill="#F7D88A"/>' +
      '<g class="g-turn"><ellipse cx="86" cy="82" rx="30" ry="6" fill="#fff" fill-opacity=".7"/><path d="M70 80q0-12 16-12t16 12z" fill="#C2622D"/></g>' +
      '<rect x="138" y="34" width="22" height="12" rx="3" fill="#141412"/><text x="149" y="43" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="7.5" font-weight="700" fill="#7EE0A1">2:30</text><circle cx="149" cy="60" r="6" fill="#55524B"/><circle cx="149" cy="78" r="6" fill="#55524B"/>'},
    presser:{t:"Presser", v:"presser un citron", b:"#FDF5C8", d: bg("#FDF5C8") + shd(100,112,66,5) + '<ellipse cx="100" cy="96" rx="62" ry="13" fill="#DCEBF5"/><ellipse cx="100" cy="93" rx="54" ry="9" fill="#F7E89A"/>' +
      '<path d="M78 90Q100 46 122 90Z" fill="#EEF4F8"/><path d="M90 88L100 60M110 88L100 60" stroke="#C9D7E3" stroke-width="2"/>' +
      '<g class="g-press"><path d="M70 60q0-30 30-30t30 30z" fill="#F7D33F"/><rect x="70" y="58" width="60" height="5" rx="2.5" fill="#FBEA8C"/><path d="M80 44q6-8 16-9" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round" fill="none"/></g>' +
      drop(84,74,"#F7C531",0) + drop(116,76,"#F7C531",1) + '<g transform="translate(160 70)"><circle r="14" fill="#F7D33F"/><circle r="11" fill="#FBEA8C"/><path d="M0-10V10M-10 0H10M-7-7L7 7M7-7L-7 7" stroke="#F7D33F" stroke-width="1.4"/></g>'},
    laver:{t:"Laver", v:"bien laver les légumes", b:"#E4ECFB", d: bg("#E4ECFB") + shd(100,112,60,5) + '<rect x="24" y="14" width="18" height="18" rx="4" fill="#6F8395"/><path d="M40 23h46q10 0 10 10v8" stroke="#8E9BA7" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<path class="g-stream" d="M96 48V84" stroke="#7FB2EC" stroke-width="6" stroke-linecap="round" stroke-dasharray="7 6"/>' +
      '<path d="M52 72L148 72Q144 104 100 106Q56 104 52 72Z" fill="#9DB0C2"/><ellipse cx="100" cy="72" rx="50" ry="10" fill="#B9C8D6"/><ellipse cx="100" cy="73" rx="44" ry="7" fill="#5DB86A"/><circle cx="80" cy="70" r="6" fill="#E8562F"/><circle cx="116" cy="71" r="6" fill="#E8562F"/>' + leaf(96,70,-20,"#3E9A4F") + leaf(106,74,30,"#3E9A4F") +
      drop(72,90,"#4F8FE0",0) + drop(128,92,"#4F8FE0",1)},
    mixer:{t:"Mixer", v:"mixer une soupe", b:"#E8F2EA", d: bg("#E8F2EA") + shd(100,112,46,5) +
      '<g class="g-buzz"><path d="M72 22h56l-6 64h-44z" fill="#DCEBF5" fill-opacity=".9"/><path d="M75 50h50l-3.5 36h-43z" fill="#F08A3C"/><path d="M82 62q10-6 18 0t18 0" stroke="#F7B27A" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="68" y="16" width="64" height="9" rx="4.5" fill="#2B2A27"/><path d="M128 30h8q6 0 6 6v24q0 6-6 6h-10" stroke="#B9C8D6" stroke-width="5" fill="none"/><path d="M90 82l20-4M90 78l20 4" stroke="#8E9BA7" stroke-width="3" stroke-linecap="round"/></g>' +
      '<path d="M70 86h60l6 22H64z" fill="#2B2A27"/><circle cx="100" cy="98" r="5" fill="#7EE0A1"/>'},
    bainmarie:{t:"Bain-marie", v:"faire fondre du chocolat au bain-marie", b:"#FBEBD8", d: bg("#FBEBD8") + shd(100,112,62,5) + fire([84,100,116],103) + burner(62,76) +
      steelPot(66) + '<ellipse cx="100" cy="68" rx="43" ry="5.5" fill="#7FB2EC"/>' +
      '<path d="M50 56h100q-4 26-50 28q-46-2-50-28z" fill="#fff"/><ellipse cx="100" cy="56" rx="50" ry="9" fill="#F1ECE3"/><ellipse cx="100" cy="57" rx="44" ry="6.5" fill="#6B3E1C"/><path d="M78 57q10-4 20 0t20 0" stroke="#8A5530" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="84" y="52" width="10" height="7" rx="2" fill="#4E2A12" transform="rotate(-12 89 55)"/>' +
      '<g class="g-stir"><path d="M146 8L110 54" stroke="#C98F4E" stroke-width="6" stroke-linecap="round"/><rect x="100" y="50" width="16" height="10" rx="3" fill="#B97C3F" transform="rotate(38 108 55)"/></g>' + steam(52,50,0) + steam(148,48,1)},
    paner:{t:"Paner", v:"paner une escalope", b:"#FDF0D3", d: bg("#FDF0D3") + shd(100,108,86,6) +
      [[44,"#F7F3EA"],[100,"#F7D36A"],[156,"#E3B26A"]].map(([x,c]) => '<ellipse cx="' + x + '" cy="88" rx="27" ry="10" fill="#fff"/><ellipse cx="' + x + '" cy="86" rx="21" ry="6.5" fill="' + c + '"/>').join("") +
      [[150,85],[158,87],[163,84],[146,88],[155,83]].map(([x,y]) => '<circle cx="' + x + '" cy="' + y + '" r="1.5" fill="#C98F4E"/>').join("") + '<circle cx="104" cy="85" r="4" fill="#F2A72B"/>' +
      '<g class="g-hop"><path d="M84 52q14-12 32 0q4 6-2 10q-14 6-28 0q-6-4-2-10z" fill="#F0C9A5"/><path d="M90 54q10-6 22 0" stroke="#E2A97F" stroke-width="2" fill="none" stroke-linecap="round"/></g>' +
      '<path d="M58 66q16-18 30-14M118 52q16-4 26 14" stroke="#C99560" stroke-width="2.2" stroke-dasharray="3 5" fill="none" stroke-linecap="round"/>'},
    plier:{t:"Plier les raviolis", v:"plier des gyozas", b:"#E8F2EA", d: bg("#E8F2EA") + shd(100,108,84,6) + BOARD +
      '<circle cx="54" cy="82" r="20" fill="#FBF6EC"/><circle cx="54" cy="82" r="6" fill="#D9824A"/><circle cx="51" cy="80" r="2" fill="#5DB86A"/>' +
      '<g class="g-fold"><path d="M80 86a20 20 0 0 1 40 0z" fill="#F6EEDF"/></g><path d="M80 86a20 20 0 0 0 40 0z" fill="#FBF6EC"/><circle cx="100" cy="88" r="5" fill="#D9824A"/>' +
      '<path d="M128 90q18-24 36 0z" fill="#F1E3C6"/><path d="M134 84l3 4M140 79l2 5M147 77v5M154 79l-2 5M160 84l-3 4" stroke="#D9C49A" stroke-width="1.8" stroke-linecap="round"/>' + drop(100,58,"#7FB2EC",0)},
    moule:{t:"Remplir le moule", v:"verser la pâte dans le moule", b:"#FCF1D4", d: bg("#FCF1D4") + shd(100,112,70,5) +
      '<path d="M44 72h112l-8 34H52z" fill="#A9B4BF"/><path d="M44 72h112" stroke="#C9D2DA" stroke-width="5" stroke-linecap="round"/><path d="M50 80h100l-1.6 8H51.6z" fill="#F2D27A"/><path d="M54 92h92M56 99h88" stroke="#8E9BA7" stroke-width="1.4"/>' +
      '<path class="g-pour" d="M104 44C102 58 98 66 100 80" stroke="#F2D27A" stroke-width="7" stroke-linecap="round" fill="none"/>' +
      '<g transform="rotate(-38 118 30)"><path d="M94 22h52q-2 22-26 23q-24-1-26-23z" fill="#fff"/><ellipse cx="120" cy="22" rx="26" ry="5.5" fill="#F1ECE3"/><ellipse cx="120" cy="23" rx="21" ry="3.6" fill="#F2D27A"/></g>'}
  };

  /* Mots déclencheurs. Le premier geste qui apparaît dans la phrase l'emporte. */
  const W = {
    four:["préchauffe","allume le four","enfourne","au four","fais gratiner","gratine","passe sous le gril","sors du four","sors le plat","fais rôtir","fais-les rôtir","fais-le rôtir","fais-la rôtir","fais cuire au four","allume le gril"],
    bouillir:["porte à ébullition","porte une","porte de l'eau","porte à frémissement","eau bouillante","plonge","fais bouillir","blanchis","lance la cuisson","lance le riz","lance les pâtes","poche","porte le bouillon","porte l'eau","porte le lait",
      ...["pâtes","riz","spaghetti","penne","tagliatelles","linguine","fusilli","coquillettes","macaroni","nouilles","vermicelles","gnocchi","ravioli","pommes de terre","œufs","lentilles","semoule","quinoa","boulgour","haricots"].flatMap(x => ["fais cuire les " + x, "fais cuire le " + x, "fais cuire la " + x, "cuis les " + x, "cuis le " + x, "cuis la " + x])],
    egoutter:["égoutte","rince","passoire","essore","écumoire"],
    vapeur:["vapeur","cuit-vapeur","panier vapeur"],
    microondes:["micro-ondes","microondes"],
    frire:["fais frire","fais-le frire","fais-les frire","fais-la frire","friture","bain d'huile","huile bien chaude"],
    retourner:["retourne","retournant","de l'autre côté","sur l'autre face","minutes de chaque côté","minute de chaque côté","minutes par face","minute par face"],
    brochettes:["brochette","brochettes","pique les morceaux","enfile"],
    mijoter:["mijote","mijoter","laisse cuire","couvre","à couvert","feu doux","fais réduire","laisse réduire","réduis le feu","baisse le feu","laisse frémir"],
    revenir:["fais revenir","fais-les revenir","fais-la revenir","fais-le revenir","fais dorer","fais-les dorer","fais-la dorer","fais-le dorer","laisse dorer","dore","saisis","fais sauter","fais-les sauter","fais fondre","fais-les fondre","fais-le fondre","fais-la fondre","fais chauffer","chauffe","colore","poêle","wok","fais griller les épices"],
    emincer:["émince","cisèle","tranche","en lamelles","en rondelles","en fines tranches","en tranches","en quartiers","en lanières","en bâtonnets"],
    des:["en dés","en cubes","en morceaux","coupe","découpe","détaille"],
    hacher:["hache","concasse","effeuille"],
    eplucher:["épluche","pèle","équeute","épépine","évide","dénoyaute","écale"],
    raper:["râpe","zeste","prélève le zeste"],
    ecraser:["écrase","presse l'ail","presse-purée","réduis en purée","fourchette","mouline"],
    mixer:["mixe","mixeur","blender","mixer"],
    bainmarie:["bain-marie","au bain marie"],
    paner:["pane","panure","trois assiettes","passe dans la farine","passe-les dans la farine","passe chaque","enrobe de chapelure","dans la chapelure","passe le poulet dans la farine","passe le porc dans la farine"],
    plier:["pince les bords","plisse","soude les bords","en demi-lune","forme des chaussons","ferme les raviolis","ferme les gyozas"],
    moule:["verse la pâte dans le moule","dans le moule","beurre le moule","remplis les moules","moules à muffins","dans les moules","moule"],
    oeufs:["casse les œufs","casse l'œuf","casse-les","casse les oeufs","sépare les blancs"],
    fouetter:["fouette","bats","fouet","monte les blancs"],
    petrir:["pétris","étale la pâte","abaisse","rouleau","farine le plan","forme une boule","façonne","forme des boulettes","forme des galettes","déroule la pâte","sable"],
    tartiner:["tartine","beurre-les","beurre le","beurre la","beurre les","badigeonne","étale la sauce","étale le beurre","étale l'avocat","étale la ricotta","étale généreusement","étale le fromage","étale la pâte à tartiner"],
    rouler:["roule","roule-les","enroule","replie les bords","plie en deux","referme le wrap"],
    disposer:["dépose","dispose","pose","range","superpose","couche","remplis","farcis","monte les","monte le sandwich"],
    verser:["ajoute","verse","arrose","mouille","déglace","incorpore petit à petit"],
    melanger:["mélange","remue","incorpore","délaye","dilue","enrobe","tourne","détends","prépare la sauce","prépare la marinade","prépare la vinaigrette","prépare l'appareil"],
    reposer:["marine","laisse mariner","fais mariner","laisse reposer","laisse-la reposer","laisse-le reposer","laisse-les reposer","réserve au frais","au frigo","au réfrigérateur","laisse refroidir","laisse-le refroidir","laisse-la refroidir","laisse-les refroidir","laisse tiédir","laisse gonfler","fais tremper","laisse tremper","laisse poser","film alimentaire"],
    assaisonner:["sale","poivre","assaisonne","rectifie","goûte"],
    servir:["sers","dresse","parsème","décore","répartis","garnis","accompagne","nappe","saupoudre","déguste","termine par","termine avec","monte l'assiette","monte les assiettes","dans chaque bol","au fond des bols","dans les bols"],
    toaster:["toaste","grille-pain","fais griller le pain","fais griller","grille le","grille les"],
    presser:["presse le citron","presse le jus","presse les citrons","presse l'orange","presse"],
    laver:["lave","nettoie"]
  };
  const L = "a-zà-ÿœæ";
  const RE = Object.keys(W).map(k => [k, new RegExp("(^|[^" + L + "])(" + W[k].map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")(?![éèêa-zàâîôûç])", "g")]);
  const GEN = new Set(["verser","melanger","assaisonner","disposer"]);
  const PRIO = ["bainmarie","paner","plier","moule","brochettes","microondes"];
  const SLICE = /lamelle|rondelle|tranche|lanière|bâtonnet|en deux|quartier|émince/;
  function match(text){
    const t = String(text || "").toLowerCase().replace(/[’`]/g, "'");
    let best = null, spec = null; const all = {};
    for (const [k, re] of RE){
      re.lastIndex = 0; const m = re.exec(t); if (!m) continue;
      const x = {k, i:m.index + m[1].length, w:m[2]}; all[k] = x;
      if (!best || x.i < best.i) best = x;
      if (!GEN.has(k) && (!spec || x.i < spec.i)) spec = x;
    }
    if (!best) return null;
    const dot = t.search(/[.;:!?](\s|$)/);
    if (GEN.has(best.k) && spec && (dot < 0 || spec.i < dot)) best = spec;
    for (const k of PRIO){ const m = all[k]; if (m && (k !== "brochettes" && k !== "microondes" || dot < 0 || m.i < dot)){ best = m; break; } }
    const rest = t.slice(best.i, best.i + 70);
    if (best.k === "des" && /^(coupe|découpe|détaille)/.test(best.w) && SLICE.test(rest)) best.k = "emincer";
    if (best.k === "mijoter" && best.w === "couvre" && /film|frigo|réfrigérateur|torchon/.test(rest)) best.k = "reposer";
    return best.k;
  }
  function heat(text){
    const t = String(text || "").toLowerCase();
    const m = t.match(/(\d{3})\s*°\s*c/); if (m) return "Four " + m[1] + " °C";
    if (/feu vif|à feu fort|feu très vif/.test(t)) return "Feu vif";
    if (/feu moyen|feu moyen-vif/.test(t)) return "Feu moyen";
    if (/feu doux|feu très doux/.test(t)) return "Feu doux";
    return "";
  }
  function art(k, text){
    const g = G[k]; if (!g) return "";
    let d = g.d;
    if (k === "four"){ const m = String(text || "").match(/(\d{3})\s*°/); d = d.replace('class="g-temp">°C', 'class="g-temp">' + (m ? m[1] : "180") + " °C"); }
    return '<svg class="art gart" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + esc(g.t) + '">' + d + "</svg>";
  }
  return {G, match, heat, art, keys:Object.keys(G)};
})();
