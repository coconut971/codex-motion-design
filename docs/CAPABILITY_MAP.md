# Capacités du cœur consolidé

Le cœur exécutable est maintenant `core/` : un descriptor `motion/1` possède
le temps, les scènes, les cues image/son/QA et les objets persistants. Il produit
un frame pur commun aux adaptateurs Canvas 2D et SVG DOM. La démo originale
**La graine et le pli** dure 10 s et utilise trois plans sans code de scène.
L'[API](CORE.md), le [storyboard](../examples/core-demo/STORYBOARD.md) et les
[vérifications](CORE_VALIDATION.md) décrivent ce qui est livré.

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
| Howseen | Temps absolu, sous-images, revue localisée ; quantification/erreurs à éviter | `compileFilm().sample(t)` continu, erreurs propagées, capture avec cuts compilés | Export Canvas 2D ; blur moyen en sRGB ; aucune reprise de son moteur |
| Whaleyxbt | Timeline image/son, continuité, retiming ; caméra sans état précédent | Descriptor unique et secondes canoniques, caméra calculée au temps courant, `scripts/audio.mjs` | Synthèse locale ; aucun catalogue de SFX tiers |
| Motion-graphics-skill | Source identifiée dans l'audit juridique | Aucun contenu adapté ou réutilisé | Licence commerciale : pas de code, prompt, template ni instruction incorporés |
| Frankxai | Direction et critères de critique | `STORYBOARD.md`, `REVIEW.md`, prompts de direction et de critique | Les critères guident une inspection ; ils ne mesurent pas automatiquement le goût |
| Framewright | Contrat et sondes de déterminisme, export contrôlé | `scripts/verify.mjs`, `scripts/core-verify.mjs`, réinitialisation Canvas/SVG, vérifications d'export | Probes dans un environnement fixé ; aucune preuve universelle de pureté |
| Mort1d | Springs, transitions et pistes ; cubic bornée et reset complet | `core/tracks.mjs` : trois régimes, retarget position/vitesse, fréquence/ζ variables ; adaptateurs complets | Implémentation originale ; aucun moteur, fonte ou asset importé |
| REA, complément MIT | Enquête sur page et JavaScript, preuves de référence | [Guide REA](REA_WORKFLOW.md), [prompt 07](../prompts/07-reverse-engineer.md), [cas Signal](cases/REA_SIGNAL.md) | Outil externe ; ses capacités de collecte ne garantissent ni reconstruction complète ni droits sur la cible |

## Ce qui s'exécute déjà

| Fonction du cœur | Point d'entrée | Preuve et portée |
| --- | --- | --- |
| Film JSON réutilisable | `compileFilm(json)` ; lecteur `?project=/film.json` | Trois plans et onze objets persistants dans la démo ; aucun code de scène spécifique |
| Temps et cuts uniques | Cues secondes/beats/frames, scènes et QA référencées | Régressions de retiming et de frontière demi-échantillon audio ; cuts dérivés des scènes |
| Pistes analytiques | `core/tracks.mjs` | Cubic bornée, logarithme du zoom, springs trois régimes, position/vitesse continues aux retargets |
| Géométrie et composition | `core/geometry.mjs`, `core/film.mjs` | Paths M/L/C/Q/Z, ellipses/rectangles, trajectoire cubic, masques monde, fade/volet, grain et boil12Hz |
| Deux adaptateurs | `canvasAdapter`, `svgAdapter` | Même frame et bounds ; pixels comparés dans chacun, contamination et clips multi-instances testés |
| Démo et sorties QA | `npm run core:sheet`, `core:verify`, `core:draft`, `core:render` | Voir [CORE_VALIDATION.md](CORE_VALIDATION.md) pour commandes, résultats et limites réellement observés |

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
`npm run verify` cible Signal ; `npm run core:verify` cible La graine et le pli.
Un nouveau projet doit disposer de probes correspondant à sa page et à son descriptor.

## Extensions à construire selon le brief

| Besoin | Travail restant |
| --- | --- |
| Export vidéo SVG/DOM/WebGL générique | L'adaptateur SVG DOM existe et est vérifié ; le renderer vidéo capture encore Canvas. Ajouter une capture dédiée avec tests avant de promettre cet export |
| Remake automatique de toute vidéo | Développer extraction, correspondance d'objets et ajustement des paramètres ; les pixels seuls ne révèlent pas le code original |
| Import automatique de projets des six dépôts | Aucun importeur livré ; analyser et réimplémenter les comportements utiles dans le cadre des licences |
| Bibliothèque d'assets prêts à l'emploi | Le cœur compose des formes JSON ; la démo et Signal ne sont pas un catalogue. Créer les assets avec Astra et documenter leur provenance |
| Critique perceptuelle certifiée | Aucun score ou test ne remplace une inspection réelle ; définir les critères du film et vérifier les captures |
| Rendu génératif distant | Hors du runtime local et de la politique Astra exclusive actuelle |

L'objectif du cœur est un parcours vérifiable : question de référence → preuve
→ storyboard → cues uniques → `seek(t)` → inspection et correction → export.
Chaque nouvelle capacité doit démontrer ce parcours sur un cas concret avant
d'être présentée comme disponible.
