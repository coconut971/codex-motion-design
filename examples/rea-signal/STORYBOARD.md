# Signal : reconstruction après enquête REA

Écrit avant le module de reconstruction. Référence autorisée : notre film
`examples/signal.html`, observé par REA 6.5.0 et dont les sources sont lisibles.
Ce travail n'est donc pas une expérience en salle blanche ni une inversion vidéo.

Intention : une impulsion rejoint trois fragments, les écarte, puis laisse une
couronne lisible. Caméra fixe ; palette papier, encre, sauge, argile et or reprise
pour rendre la comparaison utile. Aucun texte dans le film. Les seuls titres
sont les labels des images de contrôle.

Le descriptor `project.json` possède les cues ; les valeurs en secondes ci-dessous
sont une lecture du descriptor de référence, pas une seconde timeline exécutée.

| Phase | Lecture de référence | Mise en scène reconstruite |
| --- | --- | --- |
| 0–0,3 s | Apparition douce | Grain fixe dès le départ, objets en fondu. |
| arrival → contact (0,5→2 s) | Signal depuis le haut gauche ; arc guide | Trajet incurvé continu ; cible centrale fixe ; silhouettes groupées. |
| contact, puis 0,65 s | Signal au centre ; expansion décalée des fragments | Springs analytiques proches de 2 Hz, ζ=0,8 ; retard de 70 ms ; onde unique. |
| split → align (3,5→5 s) | Les fragments tournent vers leur position finale | Rotation lente commune et léger écart supplémentaire ; pas de caméra mobile. |
| align → resolve (5→6 s) | Le guide devient un trait plus affirmé | L'arc extérieur gagne en contraste ; centre or lisible. |
| resolve → exit (6→7,5 s) | Couronne tenue | Micro-mouvement angulaire de 0,008 rad ; pas de nouvel événement. |
| exit → fin (7,5→8 s) | Disparition | Fondu des objets vers le même papier ; aucune coupe. |

Son : les cinq cues sonores autorisés sont repris en données dans le descriptor.
Le WAV et le MP4 dérivent de ce JSON, sans tableau de secondes parallèle. Le
contact est le plus fort ; la résolution plus haute et longue. L'écoute doit être
rapportée séparément des mesures de décodage.

Construction originale : séparer un modèle de pose absolue et un dessinateur
Canvas. Les contours utilisent 48 sommets et de nouveaux identifiants de bruit,
les arcs 80 segments ; le grain possède sa propre distribution. On conserve les
paramètres de mouvement compris dans les sources, sans importer ni copier le
module du film de référence. Ces choix impliquent des différences de pixels.

Contrôles : quatre compositions, beats, cues ±1 frame, bande dense du contact,
crop, miniature et première/dernière frame. Comparer aux mêmes temps, taille et
seed ; publier MAE, RMSE et fraction de pixels dont un canal RGB diffère de plus
de 12/255, pour l'image et une région contenant l'action. Les seuils sont des
garde-fous de régression, pas une preuve d'équivalence perceptuelle. Vérifier les
seeks répétés, inverses, mélangés et une page fraîche, puis rendre draft et master.
