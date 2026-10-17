# Revue de Signal — 17 octobre 2026

Le storyboard a précédé le code. La première passe a été rendue puis examinée
sur quatre clés, la planche et le strip du contact. Les fichiers avant correction
sont conservés localement dans `out/*-before.png`, ignorés par Git.

| Preuve / instant | Observation de la première passe | Correction | Nouvelle inspection |
| --- | --- | --- | --- |
| Clés, frame 204 / 6,8 s | La composition finale occupait trop peu de l'image pour le petit format. | Cadrage fixe agrandi ×1,2 autour du centre, sans mouvement caméra ajouté. | Clés rerendues et image à 360 px ouvertes ; pétales et centre restent distincts. |
| Clés, frame 42 / 1,4 s | Le signal longeait la jonction des pétales avant le cue central, compliquant la lecture de sa cible. | Approche par l'espace supérieur gauche, arc plus faible. | Nouvelle clé et strip frames 54–66 ouverts : trajectoire et arrivée centrale plus séparées. |
| Clés, frame 204 / 6,8 s | Le contour de résolution restait proche du guide préparatoire, donc la fin changeait peu la hiérarchie. | Trait final 4,5 px, alpha 0,78 ; guide progressivement retiré. | La miniature ouverte conserve un contour final lisible et un centre dominant. |

La bande dense du contact montre la réaction après frame 60, puis les retards
des trois fragments. Le crop tronque volontairement le grand guide ; la planche
du cadre complet sert au contrôle de cadrage. La fin revient au papier, sans
nouvel élément. Le film est une démonstration géométrique courte, pas une campagne
de marque ni une prétendue reproduction d'une référence.

La revue technique indépendante a aussi motivé des régressions : readiness
bornée, confinement du serveur, grille avec offset, timeout fini, trois régimes
de spring et refus d'une vitesse initiale appliquée plusieurs fois dans une track.
Le décodage du premier master a exposé une piste AAC tronquée par un plafond de
frames vidéo. L'export a été corrigé et une régression exige désormais la durée
PCM complète et l'énergie du dernier cue avant de remplacer le master.

La lecture continue et l'écoute subjective ne sont pas établies par ces images.
Le rapport [VALIDATION.md](docs/VALIDATION.md) précise les contrôles réellement
effectués sur les sorties finales et leurs limites.
