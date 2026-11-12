// ═══ Biscuit · nouvelles recettes ═══
// Chaque recette tient en un bloc : fiche (comme R), matériel, étapes détaillées, astuces, conservation, photo.
// Tags : p plaisir · x à partager · d dessert · n sucré (pas de sel ni poivre) · s sel seulement
const NR = (r, mat, steps, tips, keep, photo) => { R(...r, steps); X(r[0], mat, steps, tips, keep); PHOTOS[r[0]] = photo; };

Object.assign(ING, {
  nori:["Feuilles de nori","pc",10,2.49,"ep","K","feuille"],
  vinaigre_riz:["Vinaigre de riz","ml",250,1.99,"ep","K"],
  miso:["Pâte miso","g",300,3.49,"ep","K"],
  kimchi:["Kimchi (bocal)","g",400,3.99,"cr","K"],
  gochujang:["Pâte de piment coréenne (gochujang)","g",250,3.49,"ep","K"],
  huile_sesame:["Huile de sésame","ml",250,2.99,"ep","K"],
  udon:["Nouilles udon","g",600,2.79,"ep","GK"],
  feuilles_gyoza:["Feuilles à raviolis (gyoza)","pc",30,2.99,"sg","GK","feuille"],
  colombo_ep:["Poudre à colombo","g",50,1.99,"ep","K"],
  plantain:["Banane plantain","pc",1,0.79,"fl","W","banane"],
  haricot_noir:["Haricots noirs (boîte)","g",250,1.29,"ep",""],
  lait_concentre:["Lait concentré sucré","g",397,1.89,"su","LK"],
  cacao:["Cacao en poudre non sucré","g",250,2.49,"su","K"],
  mascarpone:["Mascarpone","g",250,2.19,"cr","L"],
  boudoirs:["Biscuits cuillère","g",200,1.59,"su","GOK"],
  cafe:["Café soluble","g",100,3.49,"su","K"],
  maizena:["Fécule de maïs (Maïzena)","g",400,1.79,"ep","K"],
  pois_casses:["Pois cassés","g",500,1.49,"ep","K"],
  sardine:["Sardines à l'huile (boîte)","pc",1,1.29,"ep","fK","boîte"],
  pate_filo:["Pâte filo","g",250,2.29,"cr","G"],
  sucre_vanille:["Sucre vanillé","g",75,0.99,"su","K"],
  coco_rapee:["Noix de coco râpée","g",200,1.79,"su","K"]
});

// ───────── Petits-déjeuners ─────────
NR(["overnight-oats","Overnight oats pomme-cannelle","🥣","us","P",1,5,"n",
 [["flocons_avoine",50],["lait",120],["yaourt",0.5],["pomme",0.5],["cannelle",0.5],["miel",10]]],
 "Un bocal ou un bol avec couvercle, une râpe.",
 ["La veille au soir, verse les flocons dans le bocal avec le lait, le yaourt et la cannelle.",
  "Râpe la pomme avec la peau et ajoute-la. Mélange bien.",
  "Ferme le bocal et réserve au frigo toute la nuit : les flocons gonflent et deviennent crémeux.",
  "Le matin, mélange, ajoute un filet de miel et déguste froid, ou 1 minute au micro-ondes si tu le préfères tiède."],
 ["Prépare 3 bocaux d'un coup le dimanche soir : ton petit-déjeuner est prêt jusqu'à mercredi.","Ajoute une poignée de noix ou de raisins secs pour le croquant."],
 "3 jours au frigo.", "en:Overnight oats|en:Muesli|fr:Muesli");

NR(["oeufs-cocotte","Œufs cocotte aux épinards","🍳","fr","PM",1,20,"",
 [["oeuf",2],["epinards",80],["creme",30],["emmental",15],["baguette",0.25]]],
 "Deux ramequins, une petite poêle, un plat à four (pour le bain-marie).",
 ["Préchauffe le four à 180 °C et fais chauffer de l'eau à la bouilloire.",
  "Fais décongeler les épinards 3 minutes à la poêle, sans matière grasse, jusqu'à ce que l'eau s'évapore. Sale, poivre.",
  "Répartis les épinards au fond des ramequins, ajoute une cuillère de crème, puis casse un œuf dans chaque ramequin.",
  "Parsème de fromage. Pose les ramequins dans le plat et verse l'eau chaude jusqu'à mi-hauteur.",
  "Enfourne 12 à 14 minutes : le blanc doit être pris et le jaune encore coulant.",
  "Sers aussitôt avec des mouillettes de pain grillé."],
 ["Le blanc tremblote encore au centre ? Laisse 1 minute de plus, pas davantage, sinon le jaune durcit."],
 "À manger tout de suite.", "fr:Œufs cocotte|en:Shirred eggs");

NR(["muffins-oeufs","Muffins aux œufs, épinards & fromage","🧁","us","P",1,30,"",
 [["oeuf",2],["epinards",40],["jambon",30],["emmental",20],["lait",20]]],
 "Un moule à muffins, un saladier, un fouet.",
 ["Préchauffe le four à 180 °C. Huile ou beurre les empreintes du moule à muffins.",
  "Fais décongeler les épinards au micro-ondes 2 minutes et presse-les pour enlever l'eau.",
  "Dans le saladier, bats les œufs avec le lait, du sel et du poivre.",
  "Ajoute les épinards, le jambon coupé en petits dés et le fromage. Mélange.",
  "Remplis les moules aux trois quarts, pas plus : ils gonflent à la cuisson.",
  "Enfourne 18 à 20 minutes, jusqu'à ce qu'ils soient gonflés et dorés. Laisse tiédir 5 minutes avant de démouler."],
 ["Ils se réchauffent 30 secondes au micro-ondes : parfait pour un petit-déjeuner salé en semaine.","Remplace le jambon par des poivrons pour une version végé."],
 "3 jours au frigo, 2 mois au congélateur.", "en:Egg muffin|en:Frittata");

NR(["tamagoyaki","Omelette roulée japonaise","🍳","jp","PM",2,15,"",
 [["oeuf",3],["sauce_soja",5],["sucre",5],["huile",5],["riz",60]]],
 "Une petite poêle (idéalement carrée), une spatule fine, un bol.",
 ["Lance la cuisson du riz si tu le sers en accompagnement.",
  "Bats les œufs avec la sauce soja, le sucre et une cuillère d'eau, sans faire trop mousser.",
  "Chauffe la poêle à feu moyen et essuie-la avec un papier huilé.",
  "Verse un tiers des œufs en couche fine. Quand le dessus est presque pris, roule l'omelette sur elle-même vers toi.",
  "Pousse le rouleau au fond de la poêle, huile à nouveau, verse un autre tiers en soulevant le rouleau pour que l'œuf coule dessous.",
  "Roule à nouveau autour du premier rouleau. Recommence avec le reste.",
  "Laisse reposer 2 minutes sur une planche, puis coupe en tranches épaisses."],
 ["Le feu ne doit pas être trop fort : l'œuf doit rester jaune, sans coloration.","Un rouleau imparfait ? Serre-le dans un torchon propre 2 minutes, il prend une jolie forme."],
 "1 jour au frigo, à manger froid.", "en:Omelette|fr:Omelette");

NR(["smoothie-bowl","Smoothie bowl aux fruits rouges","🍓","us","P",1,10,"n",
 [["fruits_rouges",100],["banane",1],["yaourt",1],["granola",30],["miel",5]]],
 "Un mixeur ou un blender, un bol.",
 ["Coupe la banane en rondelles et garde quelques rondelles pour la déco.",
  "Mixe les fruits rouges encore surgelés avec le reste de banane et le yaourt, jusqu'à obtenir une crème épaisse.",
  "Verse dans un bol : la texture doit tenir à la cuillère, plus épaisse qu'un smoothie à boire.",
  "Décore avec les rondelles de banane, le granola et un filet de miel."],
 ["Les fruits doivent rester surgelés : c'est ce qui donne la texture de glace.","Si ça bloque le mixeur, ajoute une cuillère de lait, pas plus."],
 "À manger tout de suite.", "en:Smoothie bowl|en:Smoothie");

NR(["tartine-ricotta","Tartine ricotta, miel & noix","🍯","it","P",1,5,"n",
 [["baguette",0.33],["ricotta",60],["miel",10],["noix",10],["pomme",0.5]]],
 "Un grille-pain ou une poêle, un couteau.",
 ["Coupe la baguette en deux dans l'épaisseur et fais-la griller.",
  "Étale généreusement la ricotta sur le pain chaud.",
  "Ajoute la pomme en fines lamelles, puis les noix concassées.",
  "Termine par un filet de miel et une pincée de cannelle si tu en as."],
 ["La ricotta se garde 3 jours après ouverture : sers-t'en aussi dans les pâtes."],
 "À manger tout de suite.", "en:Ricotta|fr:Ricotta");

NR(["pancakes-banane","Pancakes banane-avoine","🥞","us","P",1,15,"s",
 [["banane",1],["oeuf",1],["flocons_avoine",40],["lait",30],["huile",5],["miel",10]]],
 "Un saladier, une fourchette, une poêle.",
 ["Écrase la banane à la fourchette dans le saladier, jusqu'à obtenir une purée.",
  "Ajoute l'œuf, les flocons, le lait et une pincée de sel. Mélange : la pâte est épaisse.",
  "Chauffe la poêle à feu moyen avec un peu d'huile.",
  "Dépose des petits tas de pâte et étale-les légèrement avec le dos de la cuillère.",
  "Laisse cuire 2 minutes, retourne délicatement, puis encore 1 à 2 minutes.",
  "Sers avec un filet de miel."],
 ["Plus la banane est mûre (avec des taches noires), plus les pancakes sont sucrés.","Fais-les petits : ils se retournent bien plus facilement."],
 "2 jours au frigo. Réchauffe-les à la poêle.", "en:Pancake|fr:Pancake");

NR(["congee","Congee au poulet & gingembre","🍚","as","PM",1,40,"",
 [["riz",50],["poulet",70],["gingembre",8],["bouillon",0.5],["cebette",0.2],["sauce_soja",8],["huile_sesame",3]]],
 "Une casserole, une planche.",
 ["Rince le riz, puis mets-le dans la casserole avec le bouillon émietté et environ 600 ml d'eau par personne.",
  "Ajoute le gingembre en fines lamelles et porte à ébullition.",
  "Laisse cuire 30 minutes à feu doux à demi-couvert, en remuant de temps en temps : le riz éclate et donne une soupe épaisse.",
  "Ajoute le poulet coupé en petits morceaux et laisse cuire encore 8 minutes.",
  "Sers dans un bol avec un trait de sauce soja, quelques gouttes d'huile de sésame et les oignons nouveaux émincés."],
 ["C'est le petit-déjeuner chinois réconfortant par excellence, et un plat idéal quand on est patraque.","Ajoute de l'eau si ça épaissit trop : la texture doit rester nappante."],
 "2 jours au frigo. Détends-le avec un peu d'eau en le réchauffant.", "en:Congee|fr:Congee");

NR(["labneh-pita","Assiette labneh, concombre & pita","🫓","lb","P",1,10,"",
 [["yaourt_grec",100],["pita",1],["concombre",0.25],["tomate",80],["olive",15],["menthe",0.1],["huile_olive",8]]],
 "Une assiette, un couteau, une poêle ou un grille-pain.",
 ["Étale le yaourt grec dans l'assiette en faisant un creux au centre avec le dos de la cuillère. Sale légèrement.",
  "Verse l'huile d'olive dans le creux et ajoute quelques feuilles de menthe.",
  "Coupe le concombre et la tomate en morceaux, et dispose-les autour avec les olives.",
  "Fais chauffer la pita 1 minute à la poêle et coupe-la en triangles pour tremper dans le labneh."],
 ["Pour un vrai labneh, laisse égoutter le yaourt une nuit dans un torchon au-dessus d'un bol : il devient épais comme un fromage frais."],
 "Le labneh se garde 4 jours au frigo.", "en:Strained yogurt|en:Labneh|fr:Labné");

NR(["vitamina","Vitamina de banane","🍌","br","P",1,5,"n",
 [["banane",1],["lait",200],["flocons_avoine",20],["miel",10],["cannelle",0.3]]],
 "Un blender ou un mixeur plongeant, un grand verre.",
 ["Coupe la banane en morceaux.",
  "Mets-la dans le blender avec le lait, les flocons, le miel et la cannelle.",
  "Mixe 1 minute, jusqu'à ce que ce soit bien lisse et mousseux.",
  "Sers aussitôt, bien frais."],
 ["Au Brésil, on la prépare avec une banane bien mûre et parfois un peu de papaye.","Les flocons rendent la boisson rassasiante jusqu'au midi."],
 "À boire tout de suite.", "pt:Vitamina (bebida)|en:Smoothie");

NR(["toast-coreen","Toast coréen à l'omelette","🥪","kr","PM",1,15,"",
 [["pain_mie",60],["oeuf",1],["chou",40],["carotte",20],["jambon",20],["cheddar",20],["beurre",8],["ketchup",10],["sucre",3]]],
 "Une poêle, un bol, une râpe.",
 ["Râpe la carotte et émince le chou très finement.",
  "Bats l'œuf dans le bol avec les légumes et une pincée de sel.",
  "Fais fondre la moitié du beurre dans la poêle et verse le mélange en lui donnant la forme d'une tranche de pain. Laisse cuire 2 minutes de chaque côté.",
  "À côté, fais dorer les tranches de pain dans le reste du beurre.",
  "Monte le toast : pain, omelette, jambon, fromage, une pincée de sucre, un trait de ketchup, puis la deuxième tranche.",
  "Coupe en deux et mange chaud."],
 ["La pincée de sucre avec le ketchup, c'est le secret du toast des marchands de rue de Séoul."],
 "À manger tout de suite.", "en:Gilgeori toast|en:Toast sandwich|fr:Croque-monsieur");

NR(["granola-maison","Granola maison aux noix","🥣","fr","P",1,35,"n",
 [["flocons_avoine",50],["noix",10],["miel",12],["huile",6],["raisin_sec",10],["cannelle",0.3],["yaourt",1]]],
 "Une plaque de four, du papier cuisson, un saladier.",
 ["Préchauffe le four à 160 °C.",
  "Dans le saladier, mélange les flocons, les noix concassées et la cannelle.",
  "Ajoute le miel et l'huile, et mélange bien pour que tous les flocons soient enrobés.",
  "Étale sur la plaque en couche fine et enfourne 20 minutes, en remuant à mi-cuisson.",
  "Laisse refroidir complètement sur la plaque : c'est en refroidissant qu'il devient croustillant. Ajoute les raisins secs.",
  "Sers avec le yaourt."],
 ["Fais-en 5 fois plus d'un coup : il se garde 3 semaines dans un bocal fermé.","Surveille la fin de cuisson : le miel brûle vite."],
 "3 semaines dans un bocal bien fermé.", "en:Granola|fr:Granola");

NR(["oeufs-tomate","Œufs brouillés à la tomate","🍅","as","PM",1,15,"",
 [["oeuf",2],["tomate",150],["cebette",0.15],["sucre",3],["huile",10],["riz",70]]],
 "Une poêle, un bol, une casserole pour le riz.",
 ["Lance la cuisson du riz.",
  "Bats les œufs avec une pincée de sel. Coupe les tomates en quartiers.",
  "Chauffe la moitié de l'huile à feu vif et verse les œufs. Remue doucement 30 secondes : ils doivent rester baveux. Réserve-les dans le bol.",
  "Remets le reste d'huile et fais revenir les tomates 3 minutes avec le sucre et une pincée de sel, jusqu'à ce qu'elles rendent leur jus.",
  "Remets les œufs, mélange 30 secondes et parsème d'oignons nouveaux émincés.",
  "Sers sur le riz."],
 ["C'est l'un des plats familiaux les plus populaires de Chine, prêt en 10 minutes."],
 "À manger tout de suite.", "en:Stir-fried tomato and scrambled eggs");

NR(["menemen","Menemen (œufs aux poivrons)","🍳","or","PM",1,20,"",
 [["oeuf",2],["poivron",0.5],["tomate",150],["oignon",0.25],["piment",0.2],["huile_olive",10],["pita",1]]],
 "Une poêle, une planche.",
 ["Émince l'oignon et coupe le poivron en fines lanières.",
  "Fais-les revenir dans l'huile d'olive 5 minutes à feu moyen.",
  "Ajoute les tomates coupées en dés et le piment. Laisse cuire 5 minutes, jusqu'à ce que ça devienne une sauce.",
  "Casse les œufs dans la poêle et remue doucement : ils doivent rester crémeux, pas secs.",
  "Sale, poivre et sers aussitôt avec la pita chaude."],
 ["En Turquie, on le mange directement dans la poêle, au milieu de la table.","Ajoute un peu de feta émiettée à la fin si tu en as."],
 "À manger tout de suite.", "en:Menemen (food)|fr:Menemen");
