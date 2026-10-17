# L’atelier de l’aube

Direction et écriture originales : **GPT-6 Astra** (sélection de modèle explicite). Film du cœur `motion/1`, 1920 × 1080, 30 i/s, 14 secondes. Aucun texte à l’image, asset externe, modèle de génération d’image, ni scène JavaScript dédiée.

## Intention

Une machine lourde produit quelque chose de léger : une petite estampe de soleil. Le spectateur reconnaît d’abord une presse, suit une seule feuille crème, ressent la pression, puis découvre le résultat en accompagnant sa sortie. Le soleil imprimé reste immobile : le plaisir vient de sa révélation, de l’encre et de la composition. Le dernier plan laisse réellement regarder l’image.

La vue est dessinée et plate, comme une coupe graphique d’un petit atelier. La presse possède un bâti en arche, un volant vermillon, une vis, un plateau et une bouche sombre qui masque la zone d’impression. Une feuille rectangulaire avec angles légèrement irréguliers est l’unique objet mobile qui traverse tous les plans. Le motif est créé sous l’occlusion du bâti ; il ne se matérialise jamais sur une feuille visible.

## Direction visuelle

Papier chaud `#EEE5D4`, feuille `#FAF3E4`, encre ardoise `#3D4E53`, teinte de papier sombre `#D5C9B4`. Deux accents : ocre `#D9A33D` et vermillon `#BB604B`. Silhouettes larges, courbes de fonte asymétriques, traits bouillis à 12 Hz entre 0,35 et 0,9 px logiques. Quelques hachures dans la fonte et dans le disque solaire ; aucune texture photographique ni gradient. La table est une seule ligne de travail. Le soleil est une véritable estampe : disque imparfait, rayons de longueurs variées, petite ligne d’horizon et deux traits courbes qui composent un matin calme.

## Quatre plans

1. **L’atelier / la feuille** — plan large fixe. La presse occupe le tiers gauche et le vide à droite annonce la future sortie. Une feuille vierge arrive depuis la gauche, glisse avec un ralentissement mécanique puis disparaît dans la bouche. Le volant effectue un court retrait avant l’effort. Lecture : attente → entrée → mise en place.
2. **Le poids** — coupe rapprochée motivée par le volant. Le levier descend en arc, entraîne vis et plateau. La masse s’arrête exactement au lit de la presse, tient la pression, puis remonte plus lentement. Aucun rebond du plateau. Le volant a seulement une détente amortie de faible amplitude. Le motif devient opaque à la cue de pression, entièrement masqué.
3. **La première lumière** — coupe latérale, suivie d’un petit accompagnement horizontal borné. La feuille sort vers la droite. Le soleil apparaît progressivement sous la lèvre droite de la presse ; le contraste entre fonte sombre et ocre guide la lecture. Une fois le motif découvert, la feuille descend doucement de 26 px pour poser son bord sur la table. Un très léger dépassement horizontal du papier est résorbé avant l’arrêt. Aucun rayon ne pousse ou n’explose : c’est de l’encre sur une feuille.
4. **L’estampe** — coupe franche dans le détail de la feuille posée. La presse sort du cadre. Soleil ocre, rayons gravés et lignes ardoise restent larges et lisibles en miniature. La feuille finit de glisser de quelques pixels puis tient. Les deux dernières secondes ne changent que par le grain et le bouillonnement des traits.

Les frontières et tous les événements chiffrés résident exclusivement dans les `cues` de `project.json`. Les pistes, quatre compositions de contrôle, contacts, coupes, son et QA s’y réfèrent. La durée générale ci-dessus ne constitue pas une seconde timeline.

## Mouvement et son

Entrée : accélération brève, long freinage ; contact de la feuille sans rebond. Volant : anticipation retenue puis rotation volontaire, détente secondaire après le plateau. Plateau : accélération pesante, arrêt contraint, pression tenue puis remontée douce. Sortie : translation avec sortie lente du masque, croisière et freinage, un dépassement inférieur à 12 px. Aucune caméra permanente ; seuls les besoins de lecture motivent coupes et accompagnement.

Cinq accents maximum, calculés par le synthétiseur local : placement papier, contact lourd, détente de vis, entrée dans les rouleaux de sortie, arrêt papier. Attaque existante de 4 ms ; aucun enregistrement de bruitage ni promesse de musique. Les accents sont espacés, les tenues silencieuses. Gains modérés et fréquences distinctes ; mesures audio et éventuelle limite d’écoute seront rapportées séparément.

## Contrôles attendus

Quatre compositions nommées, miniature finale, planche par beat, contacts ±1 image, strips serrés du plateau et de la révélation, poses aux coupes, seeks désordonnés et page fraîche. Rendu brouillon avant master. La revue distingue défauts vus, mesures et limites. Sources figées avant le master ; rapport de livraison hors de ce répertoire.
