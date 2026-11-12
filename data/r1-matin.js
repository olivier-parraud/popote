// Recettes — quantités pour 1 personne.
// [id, nom, emoji, cuisine, repas (P matin · M midi · S soir), difficulté 1-3, minutes, tags (p plaisir · x à partager), ingrédients, étapes]
const RECIPES = [];
const R = (...a) => RECIPES.push(a);

// ───────── Petit-déjeuner ─────────
R("porridge-banane","Porridge banane-cannelle","🥣","fr","P",1,10,"",
 [["flocons_avoine",50],["lait",200],["banane",0.5],["miel",10],["cannelle",0.5]],
 ["Verse les flocons et le lait dans une casserole.","Fais cuire 4 à 5 minutes à feu doux en remuant, jusqu'à ce que ça épaississe.","Ajoute la cannelle, verse dans un bol et garnis de rondelles de banane et d'un filet de miel."]);
R("tartines-confiture","Tartines beurre-confiture","🍞","fr","P",1,5,"",
 [["baguette",0.33],["beurre",10],["confiture",25]],
 ["Coupe la baguette en deux dans la longueur, puis en tronçons.","Fais-les griller quelques minutes si tu aimes le croustillant.","Tartine de beurre puis de confiture."]);
R("yaourt-granola","Bol yaourt grec, granola & fruits rouges","🫐","fr","P",1,5,"",
 [["yaourt_grec",150],["granola",40],["fruits_rouges",60],["miel",5]],
 ["Sors les fruits rouges du congélateur la veille, ou passe-les 1 minute au micro-ondes.","Verse le yaourt dans un bol.","Ajoute les fruits, le granola et un filet de miel juste avant de manger pour garder le croquant."]);
R("oeufs-brouilles","Œufs brouillés & toasts","🍳","fr","P",1,10,"",
 [["oeuf",2],["beurre",8],["pain_mie",50],["ciboulette",0.1]],
 ["Bats les œufs avec du sel et du poivre.","Fais fondre le beurre à feu doux, verse les œufs et remue sans arrêt avec une spatule.","Retire du feu quand ils sont encore crémeux, la chaleur finit la cuisson.","Sers sur le pain grillé avec la ciboulette ciselée."]);
R("pancakes","Pancakes moelleux","🥞","us","P",2,25,"p",
 [["farine",60],["lait",80],["oeuf",0.5],["sucre",8],["levure",2],["beurre",8],["confiture",20]],
 ["Mélange la farine, le sucre et la levure, puis ajoute l'œuf battu et le lait petit à petit pour éviter les grumeaux.","Laisse reposer la pâte 10 minutes.","Fais chauffer une poêle légèrement beurrée et verse une petite louche de pâte.","Retourne quand des bulles apparaissent à la surface, puis laisse dorer 1 minute de l'autre côté.","Sers avec la confiture ou un reste de miel."]);
R("smoothie","Smoothie banane-fruits rouges","🥤","fr","P",1,5,"",
 [["banane",1],["fruits_rouges",80],["yaourt",1],["lait",100],["miel",5]],
 ["Mets tous les ingrédients dans un blender.","Mixe 1 minute jusqu'à obtenir une texture bien lisse.","Ajoute un peu de lait si c'est trop épais et bois tout de suite."]);
R("pain-perdu","Pain perdu à la cannelle","🍞","fr","P",1,15,"p",
 [["pain_mie",80],["oeuf",1],["lait",80],["sucre",10],["beurre",10],["cannelle",0.5]],
 ["Bats l'œuf avec le lait, le sucre et la cannelle dans une assiette creuse.","Trempe les tranches de pain des deux côtés.","Fais-les dorer 2 minutes de chaque côté dans le beurre chaud.","Saupoudre d'un peu de sucre au moment de servir."]);
R("bircher","Bircher muesli pomme-raisins","🍏","fr","P",1,10,"",
 [["flocons_avoine",50],["yaourt",1],["lait",80],["pomme",0.5],["raisin_sec",10],["miel",5]],
 ["La veille, mélange les flocons, le yaourt, le lait et les raisins secs dans un bocal.","Laisse gonfler toute la nuit au frigo.","Le matin, râpe la pomme par-dessus et ajoute le miel."]);
R("tartine-avocat","Tartine avocat & œuf","🥑","fr","P",1,10,"",
 [["pain_mie",60],["avocat",0.5],["oeuf",1],["citron",0.1],["piment",0.2]],
 ["Fais cuire l'œuf 6 minutes dans l'eau bouillante, puis passe-le sous l'eau froide.","Écrase l'avocat avec un filet de citron, du sel et du poivre.","Étale sur le pain grillé et pose l'œuf écalé coupé en deux.","Termine par une pincée de piment."]);
R("fromage-blanc-noix","Fromage blanc, miel & noix","🍯","fr","P",1,3,"",
 [["fromage_blanc",150],["miel",10],["noix",15],["banane",0.5]],
 ["Verse le fromage blanc dans un bol.","Ajoute la banane en rondelles et les noix concassées.","Arrose de miel."]);
R("crepes","Crêpes sucrées","🥞","fr","P",2,30,"p",
 [["farine",50],["lait",110],["oeuf",0.5],["sucre",8],["beurre",8],["confiture",25]],
 ["Mélange la farine et le sucre, ajoute l'œuf puis le lait petit à petit en fouettant.","Ajoute le beurre fondu et laisse reposer 15 minutes si tu as le temps.","Verse une fine couche de pâte dans une poêle chaude huilée et fais cuire 1 minute de chaque côté.","Garnis de confiture et roule les crêpes."]);
R("omelette-herbes","Omelette aux fines herbes","🍳","fr","P",1,10,"",
 [["oeuf",2],["beurre",5],["ciboulette",0.15],["persil",0.1],["baguette",0.25]],
 ["Bats les œufs avec les herbes ciselées, du sel et du poivre.","Verse dans le beurre chaud et ramène les bords vers le centre pendant la cuisson.","Plie l'omelette quand le dessus est encore baveux et sers avec du pain."]);
R("tartine-cacahuete","Tartine beurre de cacahuète & banane","🥜","us","P",1,5,"",
 [["pain_mie",60],["beurre_cacahuete",20],["banane",0.5]],
 ["Fais griller le pain.","Étale le beurre de cacahuète.","Couvre de rondelles de banane."]);
R("yaourt-pomme","Yaourt aux pommes poêlées","🍎","fr","P",1,10,"",
 [["yaourt",1],["pomme",1],["beurre",5],["sucre",5],["cannelle",0.5],["granola",20]],
 ["Coupe la pomme en petits dés.","Fais-la revenir 5 minutes dans le beurre avec le sucre et la cannelle.","Verse sur le yaourt et ajoute le granola."]);
R("porridge-choco","Porridge chocolat-banane","🍫","fr","P",1,10,"p",
 [["flocons_avoine",50],["lait",200],["chocolat",10],["banane",0.5]],
 ["Fais cuire les flocons dans le lait 4 à 5 minutes en remuant.","Ajoute le chocolat en morceaux hors du feu et mélange jusqu'à ce qu'il fonde.","Garnis de rondelles de banane."]);
R("oeuf-coque","Œuf à la coque & mouillettes","🥚","fr","P",1,8,"",
 [["oeuf",2],["baguette",0.25],["beurre",10]],
 ["Plonge les œufs dans l'eau bouillante pour 3 minutes pile.","Pendant ce temps, coupe le pain en bâtonnets et beurre-les.","Décalotte les œufs et trempe les mouillettes."]);
R("muesli-maison","Muesli maison au lait","🥣","fr","P",1,3,"",
 [["flocons_avoine",40],["raisin_sec",10],["noix",10],["lait",150],["pomme",0.5]],
 ["Mélange les flocons, les raisins et les noix concassées.","Ajoute la pomme en dés.","Verse le lait froid."]);
