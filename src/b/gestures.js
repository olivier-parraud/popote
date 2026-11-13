/* ═══ Biscuit · reconnaissance des gestes du mode cuisine ═══
   Les dessins animés sont dans gestures-art.js (GART) ; ici, les mots qui déclenchent chaque geste. */
const GX = (() => {
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
    couches:["couche","couches","superpose","monte les lasagnes","monte le gratin","monte les lasagnes"],
    disposer:["dépose","dispose","pose","range","remplis","farcis","monte les","monte le sandwich"],
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
  const G = GART.A;
  function art(k, text){
    if (!G[k]) return "";
    let h = GART.svg(k, "A");
    if (k === "four"){ const m = String(text || "").match(/(\d{3})\s*°/); h = h.replace(">200°</text>", ">" + (m ? m[1] : "180") + "°</text>"); }
    return h;
  }
  return {G, match, heat, art, keys:Object.keys(W)};
})();
