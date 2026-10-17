# Capacités du cœur consolidé

Ce dépôt rassemble une implémentation originale, des règles de production et
un parcours d'enquête REA. Les **six sources ont été auditées**, pas fusionnées
comme six moteurs embarqués. La source commerciale est exclue de toute
réutilisation. L'[audit versionné](SOURCE_AUDIT.md) contient les constats et
permalien de chaque source ; le tableau ci-dessous décrit le résultat local.

La création et les corrections suivent l'[exclusivité Astra](ASTRA_WORKFLOW.md).
L'exécution du code et la fabrication des médias restent locales.

## Des sources aux capacités livrées

| Source analysée | Apport retenu | Réalisation dans ce dépôt | Limite |
| --- | --- | --- | --- |
| Howseen | Temps absolu, sous-images, revue localisée | `seek(t)` dans `examples/signal.mjs`, capture dans `scripts/render.mjs` | Canvas 2D ; blur moyen en sRGB ; aucune reprise de son moteur |
| Whaleyxbt | Timeline partagée image/son, continuité, retiming | `project.json`, `lib/project.mjs`, `scripts/audio.mjs` | Le son livré est une synthèse locale ; aucun catalogue de SFX tiers |
| Motion-graphics-skill | Source identifiée dans l'audit juridique | Aucun contenu adapté ou réutilisé | Licence commerciale : pas de code, prompt, template ni instruction incorporés |
| Frankxai | Direction et critères de critique | `STORYBOARD.md`, `REVIEW.md`, prompts de direction et de critique | Les critères guident une inspection ; ils ne mesurent pas automatiquement le goût |
| Framewright | Contrat et sondes de déterminisme, export contrôlé | `scripts/verify.mjs`, tests, vérifications de l'export | Probes dans un environnement fixé ; aucune preuve universelle de pureté |
| Mort1d | Springs, transitions, pipeline de revue | `lib/motion.mjs`, tests des trois régimes, captures et prompts | Helpers originaux ; pas de moteur, fonte ou bibliothèque d'assets importés |
| REA, complément MIT | Enquête sur page et JavaScript, preuves de référence | [Guide REA](REA_WORKFLOW.md), [prompt 07](../prompts/07-reverse-engineer.md), [cas Signal](cases/REA_SIGNAL.md) | Outil externe ; ses capacités de collecte ne garantissent ni reconstruction complète ni droits sur la cible |

## Ce qui s'exécute déjà

| Fonction | Point d'entrée | Preuve et portée |
| --- | --- | --- |
| Lecture/scrub d'un film calculé | `npm run studio` | Exemple Signal local, scènes au temps absolu |
| Physique analytique et compilation des cues | `npm test` | Tests des springs, conversions et contrats ; voir [VALIDATION.md](VALIDATION.md) pour les résultats datés |
| Répétabilité des images | `npm run verify` | Signal : RGBA complets comparés sur temps répétés/mélangés et page fraîche ; sous-images distinctes |
| Planche, images clés, strips et crops | `npm run sheet`, options de `scripts/render.mjs` | Sorties inspectables ; la qualité visuelle exige leur ouverture réelle |
| Audio issu des mêmes événements | `npm run audio` | WAV stéréo 48 kHz ; les mesures ne constituent pas une écoute |
| Draft et master avec sous-images | `npm run draft`, `npm run render -- --samples=4` | Encodage puis décodage et comptage ; manifests adjacents |
| Référence HTML vers film reconstruit | [Cas REA Signal](cases/REA_SIGNAL.md) | Commandes, observations, comparaisons et limites propres au cas ; statut de l'installation dans le guide REA |

Ces commandes décrivent les entrées présentes. Le succès sur une machine ou à
une révision ne préjuge pas de l'état d'un autre poste. Les résultats exécutés
appartiennent à [VALIDATION.md](VALIDATION.md), au guide REA et au cas documenté.
`npm run verify` cible l'exemple Signal ; un nouveau projet doit disposer de
probes correspondant à sa page et à son descriptor.

## Extensions à construire selon le brief

| Besoin | Travail restant |
| --- | --- |
| Capture DOM, SVG ou WebGL générique | Ajouter un adaptateur conforme au contrat, readiness et tests ; le renderer courant capture le Canvas 2D |
| Remake automatique de toute vidéo | Développer extraction, correspondance d'objets et ajustement des paramètres ; les pixels seuls ne révèlent pas le code original |
| Import automatique de projets des six dépôts | Aucun importeur livré ; analyser et réimplémenter les comportements utiles dans le cadre des licences |
| Bibliothèque de scènes et assets prêts à l'emploi | Créer avec Astra, documenter provenance, cues et preuves ; l'exemple Signal n'est pas un catalogue |
| Critique perceptuelle certifiée | Aucun score ou test ne remplace une inspection réelle ; définir les critères du film et vérifier les captures |
| Rendu génératif distant | Hors du runtime local et de la politique Astra exclusive actuelle |

L'objectif du cœur est un parcours vérifiable : question de référence → preuve
→ storyboard → cues uniques → `seek(t)` → inspection et correction → export.
Chaque nouvelle capacité doit démontrer ce parcours sur un cas concret avant
d'être présentée comme disponible.
