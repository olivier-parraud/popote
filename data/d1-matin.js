// Recettes détaillées : [matériel, étapes, astuces, conservation]
const DETAILS = {};
const X = (id, mat, steps, tips, keep) => { DETAILS[id] = {mat, steps, tips, keep}; };

X("porridge-banane","Une petite casserole, une cuillère en bois, un bol.",[
 "Verse les flocons d'avoine dans la casserole, sans rien d'autre. Fais-les griller 1 minute à feu moyen en remuant : ils sentent légèrement la noisette, ça donne beaucoup plus de goût.",
 "Ajoute le lait froid et une pincée de sel. Le sel ne se sent pas mais réveille le sucré.",
 "Porte à petite ébullition à feu moyen, puis baisse sur feu doux dès que les premières bulles apparaissent, sinon le lait déborde.",
 "Laisse cuire 4 à 5 minutes en remuant souvent, surtout au fond de la casserole. Le porridge est prêt quand il nappe la cuillère et que les flocons sont tendres.",
 "Hors du feu, ajoute la cannelle et la moitié de la banane écrasée à la fourchette : elle sucre naturellement et rend le porridge crémeux.",
 "Verse dans le bol, coupe le reste de banane en rondelles par-dessus et termine par le filet de miel. S'il a trop épaissi, détends-le avec un trait de lait."
],["Le porridge épaissit en refroidissant : arrête la cuisson quand il te semble encore un peu trop liquide.","Tu peux le préparer au micro-ondes : 2 minutes à pleine puissance, tu remues, puis encore 1 minute."],"Se garde 2 jours au frigo. Réchauffe avec un peu de lait.");
X("tartines-confiture","Un couteau à pain, un grille-pain ou une poêle.",[
 "Sors le beurre du frigo 10 minutes avant si tu peux : il s'étale sans déchirer le pain.",
 "Coupe le morceau de baguette en deux dans l'épaisseur, puis chaque moitié en deux tronçons.",
 "Fais griller 2 à 3 minutes au grille-pain, ou à sec dans une poêle chaude, face coupée contre le fond, jusqu'à ce que le pain soit doré et croustillant.",
 "Tartine aussitôt le beurre sur le pain encore chaud pour qu'il fonde légèrement.",
 "Étale la confiture par-dessus, jusqu'aux bords."
],["Une baguette de la veille devient parfaite une fois grillée.","Une pincée de fleur de sel sur le beurre, avant la confiture, change tout."],"La baguette se congèle coupée en tronçons ; elle passe directement du congélateur au grille-pain.");
X("yaourt-granola","Un bol, une cuillère.",[
 "La veille au soir, mets les fruits rouges dans un petit récipient au frigo pour qu'ils décongèlent doucement. Sinon, passe-les 40 à 60 secondes au micro-ondes.",
 "Écrase la moitié des fruits à la fourchette avec leur jus : ça fait une sauce express.",
 "Verse le yaourt dans le bol et lisse le dessus avec le dos de la cuillère.",
 "Dépose la sauce aux fruits, puis les fruits entiers.",
 "Ajoute le granola au dernier moment, juste avant de manger, pour qu'il reste croquant, et termine par le filet de miel."
],["Pour l'emporter, mets le granola dans un sachet à part et ajoute-le au moment de manger."],"À manger tout de suite une fois monté. Les fruits décongelés se gardent 2 jours au frigo.");
X("oeufs-brouilles","Une petite poêle antiadhésive, une spatule souple, un bol, un fouet ou une fourchette.",[
 "Casse les œufs dans le bol. Bats-les à la fourchette 30 secondes, jusqu'à ce que le blanc et le jaune soient bien mélangés. Sale légèrement.",
 "Fais fondre le beurre dans la poêle à feu doux. Il doit mousser doucement, sans brunir.",
 "Verse les œufs et laisse-les 20 secondes sans toucher.",
 "Avec la spatule, ramène doucement les bords vers le centre en continu, en grattant bien le fond. Garde le feu doux : la cuisson prend 3 à 4 minutes.",
 "Pendant ce temps, fais griller le pain.",
 "Retire la poêle du feu quand les œufs sont encore brillants et un peu baveux : ils finissent de cuire avec la chaleur de la poêle.",
 "Dresse sur les toasts, poivre et parsème de ciboulette ciselée aux ciseaux."
],["Le secret, c'est le feu doux : des œufs brouillés cuits trop fort deviennent secs et granuleux.","Une cuillère de crème ou un petit morceau de beurre froid ajouté à la fin les rend encore plus crémeux."],"À manger tout de suite.");
X("pancakes","Un saladier, un fouet, une louche, une poêle antiadhésive, une spatule.",[
 "Dans le saladier, mélange la farine, le sucre, la levure et une pincée de sel.",
 "Creuse un puits au centre, casse l'œuf dedans et commence à fouetter en versant le lait petit à petit. Fouette juste ce qu'il faut : quelques petits grumeaux, ce n'est pas grave.",
 "Fais fondre le beurre et incorpore-le à la pâte. Laisse reposer 10 minutes : la levure commence à agir et les pancakes seront plus épais.",
 "Chauffe la poêle à feu moyen, sans matière grasse ou avec un essuie-tout à peine huilé.",
 "Verse une petite louche de pâte (environ 2 cuillères à soupe) sans l'étaler. Elle forme un disque épais d'environ 10 cm.",
 "Attends que des bulles apparaissent à la surface et que les bords paraissent secs, environ 2 minutes. Retourne d'un coup de spatule.",
 "Laisse cuire 1 minute de l'autre côté, jusqu'à ce qu'il soit doré. Garde les pancakes au chaud sous un torchon pendant que tu fais les autres.",
 "Sers en pile avec la confiture, du miel ou du sirop."
],["Si les pancakes brunissent avant que les bulles n'apparaissent, la poêle est trop chaude : baisse le feu.","Le premier pancake est souvent raté, c'est normal : il sert à régler la température."],"Les pancakes cuits se gardent 2 jours au frigo ou 2 mois au congélateur. Réchauffe-les au grille-pain.");
X("smoothie","Un blender (ou un mixeur plongeant et un grand verre haut).",[
 "Épluche la banane et coupe-la en tronçons.",
 "Mets dans le blender d'abord le lait et le yaourt (les liquides en premier évitent que les lames tournent à vide), puis la banane et les fruits rouges encore surgelés.",
 "Ajoute le miel.",
 "Mixe 30 secondes à petite vitesse, puis 1 minute à pleine vitesse, jusqu'à ce que ce soit parfaitement lisse.",
 "Goûte : ajoute un peu de miel si c'est trop acide, ou un trait de lait si c'est trop épais. Bois aussitôt."
],["Les fruits surgelés rendent le smoothie bien frais sans glaçons.","Une banane bien mûre (avec des taches brunes) le sucre davantage."],"À boire tout de suite : il se sépare au bout de quelques heures.");
X("pain-perdu","Une assiette creuse, une fourchette, une poêle, une spatule.",[
 "Dans l'assiette creuse, bats l'œuf avec le lait, le sucre et la cannelle jusqu'à ce que le mélange soit homogène.",
 "Trempe chaque tranche de pain 10 à 15 secondes de chaque côté : elle doit être imbibée mais pas en train de se déchirer. Le pain un peu rassis absorbe mieux.",
 "Fais fondre le beurre dans la poêle à feu moyen jusqu'à ce qu'il mousse.",
 "Dépose les tranches et laisse dorer 2 à 3 minutes sans y toucher, jusqu'à ce que le dessous soit bien doré et caramélisé.",
 "Retourne et laisse encore 2 minutes. L'intérieur doit être moelleux, comme un flan.",
 "Saupoudre d'une pincée de sucre dès la sortie de la poêle : il fond et fait une fine croûte."
],["C'est la recette parfaite pour finir du pain dur, brioche ou pain de mie.","Feu moyen, pas plus : le sucre brûle vite."],"À manger chaud, tout de suite.");
X("bircher","Un bocal ou un bol avec couvercle, une râpe.",[
 "La veille au soir, verse les flocons dans le bocal.",
 "Ajoute le yaourt, le lait et les raisins secs, puis mélange bien pour que tous les flocons soient mouillés.",
 "Ferme et mets au frigo toute la nuit, au moins 6 heures. Les flocons gonflent et deviennent crémeux, comme un riz au lait froid.",
 "Le matin, râpe la demi-pomme avec la peau, directement dans le bocal. Mélange vite pour qu'elle ne noircisse pas.",
 "Ajoute le miel et, si c'est trop épais, un trait de lait."
],["Tu peux préparer 3 bocaux d'un coup le dimanche : ils se gardent 3 jours.","Une pincée de cannelle ou quelques noix ajoutent du croquant."],"3 jours au frigo, sans la pomme (ajoute-la le matin même).");
X("tartine-avocat","Une petite casserole, une fourchette, une assiette, un grille-pain.",[
 "Porte une petite casserole d'eau à ébullition. Plonge l'œuf délicatement avec une cuillère et lance un minuteur de 6 minutes pour un jaune coulant (7 minutes pour un jaune juste pris).",
 "Pendant ce temps, coupe l'avocat en deux, retire le noyau et récupère la chair à la cuillère.",
 "Écrase-la à la fourchette dans une assiette avec quelques gouttes de citron, du sel et du poivre. Garde quelques morceaux pour la texture.",
 "Fais griller le pain.",
 "À la fin du minuteur, passe l'œuf sous l'eau froide 1 minute, puis écale-le en tapotant la coquille partout.",
 "Étale l'avocat sur le pain, pose l'œuf coupé en deux et termine par une pincée de piment et un tour de poivre."
],["Le citron empêche l'avocat de noircir.","Un avocat est mûr quand il cède légèrement sous le doigt, près de la queue."],"La demi-moitié d'avocat restante se garde 1 jour au frigo avec son noyau, filmée et arrosée de citron.");
X("fromage-blanc-noix","Un bol, un couteau.",[
 "Concasse grossièrement les noix au couteau, ou casse-les avec les doigts.",
 "Fais-les griller 2 minutes à sec dans une poêle chaude si tu as le temps : elles deviennent beaucoup plus parfumées.",
 "Verse le fromage blanc dans le bol.",
 "Ajoute la banane coupée en rondelles et les noix.",
 "Arrose de miel en filet."
],["Un fromage blanc à 3 % de matière grasse est plus crémeux et rassasie plus longtemps."],"À manger tout de suite.");
X("crepes","Un saladier, un fouet, une louche, une poêle à crêpes ou une grande poêle antiadhésive, une spatule.",[
 "Dans le saladier, mélange la farine, le sucre et une pincée de sel. Creuse un puits.",
 "Casse l'œuf au centre et commence à fouetter en versant un tiers du lait. Tu obtiens une pâte épaisse et lisse, sans grumeaux.",
 "Verse le reste du lait petit à petit en fouettant. La pâte doit avoir la consistance d'une crème liquide.",
 "Fais fondre le beurre et ajoute-le à la pâte. Laisse reposer 30 minutes si tu peux : les crêpes seront plus souples.",
 "Chauffe la poêle à feu moyen à vif et graisse-la avec un essuie-tout huilé.",
 "Verse une petite louche de pâte en inclinant la poêle dans tous les sens pour couvrir tout le fond d'une couche très fine.",
 "Laisse cuire 1 minute, jusqu'à ce que les bords se décollent et dorent. Retourne avec la spatule et laisse 30 secondes de l'autre côté.",
 "Empile les crêpes sur une assiette au fur et à mesure. Garnis de confiture et roule ou plie en quatre."
],["Si la pâte a des grumeaux, un coup de mixeur plongeant règle le problème.","La première crêpe sert à régler la poêle, c'est normal qu'elle soit moins belle."],"Les crêpes cuites se gardent 3 jours au frigo, filmées. Réchauffe-les 20 secondes à la poêle.");
X("omelette-herbes","Un bol, une fourchette, une poêle antiadhésive de 20 cm, une spatule.",[
 "Rince et sèche les herbes, puis cisèle-les aux ciseaux.",
 "Casse les œufs dans le bol, ajoute les herbes, sel et poivre, et bats 30 secondes à la fourchette.",
 "Fais fondre le beurre dans la poêle à feu moyen jusqu'à ce qu'il mousse.",
 "Verse les œufs. Pendant 1 minute, ramène les bords vers le centre avec la spatule et incline la poêle pour que l'œuf liquide coule sur les parties libres.",
 "Arrête de remuer quand le dessus est encore légèrement baveux. Laisse 30 secondes pour que le dessous prenne.",
 "Plie l'omelette en deux avec la spatule et fais-la glisser sur l'assiette. Sers avec le pain."
],["Une omelette se cuit vite : 2 minutes en tout, pas plus, sinon elle devient caoutchouteuse."],"À manger tout de suite.");
X("tartine-cacahuete","Un grille-pain, un couteau.",[
 "Fais griller le pain jusqu'à ce qu'il soit bien doré.",
 "Étale le beurre de cacahuète sur le pain encore chaud : il fond légèrement et s'étale mieux.",
 "Coupe la banane en rondelles fines et dispose-les en les faisant se chevaucher.",
 "Ajoute une pincée de cannelle ou un filet de miel si tu aimes."
],["Choisis un beurre de cacahuète sans sucre ajouté : la banane suffit à sucrer."],"À manger tout de suite.");
X("yaourt-pomme","Une petite poêle, une spatule, un couteau, un bol.",[
 "Épluche la pomme (ou garde la peau), retire le cœur et coupe-la en dés d'environ 1 cm.",
 "Fais fondre le beurre dans la poêle à feu moyen.",
 "Ajoute les dés de pomme, le sucre et la cannelle. Fais-les revenir 5 à 6 minutes en remuant de temps en temps, jusqu'à ce qu'ils soient tendres et légèrement caramélisés.",
 "Verse le yaourt dans le bol.",
 "Dépose les pommes chaudes par-dessus et termine par le granola."
],["Le contraste entre les pommes chaudes et le yaourt froid est tout l'intérêt de ce bol.","Les pommes poêlées se préparent la veille et se réchauffent 30 secondes au micro-ondes."],"Les pommes poêlées se gardent 3 jours au frigo.");
X("porridge-choco","Une petite casserole, une cuillère en bois, un bol.",[
 "Verse les flocons et le lait dans la casserole avec une pincée de sel.",
 "Porte à frémissement à feu moyen, puis baisse sur feu doux.",
 "Laisse cuire 4 à 5 minutes en remuant souvent, jusqu'à ce que le porridge soit épais et crémeux.",
 "Hors du feu, ajoute le chocolat cassé en petits morceaux. Attends 30 secondes puis mélange : il fond tout seul.",
 "Verse dans le bol et ajoute la banane en rondelles."
],["Garde un carré de chocolat pour le râper par-dessus au moment de servir."],"Se garde 2 jours au frigo ; réchauffe avec un trait de lait.");
X("oeuf-coque","Une petite casserole, une cuillère, un minuteur, des coquetiers.",[
 "Sors les œufs du frigo 10 minutes avant : un œuf froid plongé dans l'eau bouillante risque de se fendre.",
 "Porte de l'eau à ébullition dans la casserole, en quantité suffisante pour couvrir les œufs.",
 "Dépose les œufs un par un avec une cuillère et lance un minuteur de 3 minutes dès qu'ils touchent l'eau. Garde une ébullition douce.",
 "Pendant ce temps, coupe le pain en bâtonnets, fais-les griller et beurre-les.",
 "Sors les œufs, pose-les dans les coquetiers et coupe le haut d'un coup de couteau sec.",
 "Sale le jaune et trempe les mouillettes."
],["3 minutes donnent un blanc juste pris et un jaune liquide ; 4 minutes, un jaune un peu plus épais."],"À manger tout de suite.");
X("muesli-maison","Un bol, un couteau.",[
 "Mélange dans le bol les flocons, les raisins secs et les noix concassées.",
 "Coupe la demi-pomme en petits dés et ajoute-la.",
 "Verse le lait froid juste avant de manger.",
 "Laisse reposer 2 minutes si tu préfères les flocons un peu plus tendres."
],["Prépare un grand bocal du mélange sec (flocons, raisins, noix) : il se garde 1 mois au placard."],"Le mélange sec se garde 1 mois dans un bocal fermé.");
