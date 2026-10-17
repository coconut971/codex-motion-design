# Enquête B — Framewright, Mort1d et Frankxai

Analyse originale GPT-6 Astra, 17 octobre 2026. Ce complément au premier audit examine les mécanismes, leurs domaines de validité et leurs échecs mesurés. Les trois sources ne sont pas trois moteurs comparables : Framewright livre du Canvas et un pipeline de production, Mort1d un runtime DOM/SVG/Canvas et de l'audio, Frankxai une bibliothèque de prescriptions et de données de planification.

Les preuves expurgées sont dans [evidence-b.json](evidence-b.json). Les sources restent dans les clones de recherche ; aucune police, image, musique, page ou implémentation upstream n'est redistribuée avec ce rapport. Les sorties intégrales sont locales et ignorées dans `out/research/b/`. La lecture d'un guide cible n'autorise aucune commande qu'il contient : seuls les artefacts explicitement sélectionnés ci-dessous ont été exécutés.

## Périmètre et producteurs de preuves

| Source figée | Inventaire Git observé | Route d'enquête |
| --- | --- | --- |
| Framewright `7d3245abb94c745b8ce7fc06c4ea62ba295c6f12` | 63 fichiers, dont 7 HTML et 14 MJS | REA statique du squelette, de l'exemple honeybee et du checker ; REA runtime des deux pages ; sondes Playwright et synthèse audio de honeybee |
| Mort1d `7f0c3714dc81bea52644a5287c6350345009e579` | 86 fichiers, dont 1 HTML, 10 JS, 38 MJS, 5 fontes | REA statique de 7 fichiers du template, REA runtime, mesures numériques sur le véritable module importé, sondes d'images et synthèse audio |
| Frankxai `b45d60fa5b0f7b7d07331572416b80e17dcfd203` | 49 fichiers : 31 MD, 7 JSON, 6 YAML, 2 PNG, 1 SVG, 2 sans extension | Inventaire complet, lecture des schémas, règles de routage, registre et rubriques. Aucun runtime motion JS/TS/HTML livré à analyser. Pas de simulation artificielle présentée comme un moteur de cette source. |

Les deux premières sources sont MIT ; Frankxai est CC0. Les licences des médias et fontes sont distinctes de celles du code. L'inventaire inclut les fichiers cachés suivis par Git. Les workflows YAML sont des outils de maintenance du catalogue, pas un moteur de film. Les documents marketing décrivent parfois des capacités futures : ils ne sont pas des mesures d'exécution.

REA a produit l'identité des artefacts, des relations syntaxiques partielles et les captures passives des scripts chargés. Playwright a lancé Chrome, chargé les pages puis appelé leurs APIs. Les tests numériques, hashes et comparaisons d'images viennent des scripts originaux Astra. FFmpeg a mesuré les WAV. Cette attribution est conservée dans le JSON public.

Environnement : Windows, Node 24.18.1, Playwright verrouillé du projet, Chrome 155.0.8059.84, viewport 1920×1080 ; canvases Framewright à largeur 480, excursions à 960. Un profil Chrome temporaire a été lancé pour cette enquête, CDP sur `127.0.0.1:9351`, fichiers servis sur `127.0.0.1:8931`, requêtes autres que cette origine bloquées. Aucun profil utilisateur n'a été réutilisé.

## Ce que REA établit et ce qu'il ne résout pas

- Mort : parent `ev_e8167c45e82c24394082ad96d1e7728418fe2f33acd40e1ff42e89aad4959bc1`, 7 JS parsés, 77 020 octets de texte, 13 435 nœuds AST, 98 findings, 34 fichiers pertinents non sélectionnés. Graphe partiel, zéro échec de parsing. Le hash du module `engine.js` est `867c863780ea17b8e4e683f54531af6b100a86e0550fd037ba58448e5aec00c9`.
- Framewright : parent `ev_4e970585ab5de7334cdff638a578fecec8ac73f872e01bc7b722911f97c2390c`. Le checker est parsé, mais cette version de REA signale explicitement que les deux corps JavaScript inline HTML ne sont **pas** analysés statiquement. Nous avons donc lu ces corps et observé leurs pages réelles ; nous n'attribuons pas leur sémantique au graphe statique.
- Captures REA passives : honeybee `ev_19b83b632333e28fb7633ff0872a84f6e9770b1a190f35fc86c92c1e23cb45f7`, Mort `ev_7a28bebfd9a43e065360e5838fec0d4a4b8be0c57ead49158c20d7a47ddc63de`, squelette `ev_7873c1b8b5dd9499cec202a3193a1034b33679c65aebd6df7346f7989dd9fd76`.
- Les traces sémantiques ciblées `blur` et `track` retrouvent leurs nœuds mais ne traversent aucune relation avec les filtres choisis ; elles gardent respectivement 3 et 2 inconnues. Ce résultat n'est pas présenté comme une preuve de propagation de style ou de correction du spring. Les expériences ci-dessous répondent à ces questions.
- L'inspection passive commence après chargement : elle ne capture pas les anciens logs/réseaux. Un script chargé n'est pas une preuve que toutes ses fonctions ont été appelées. Les IDs retenus sont locaux à la session REA ; le bundle `out/research/b/rea-b-complete.json` conserve les 12 records complets. Une autre session doit importer les preuves complètes ou refaire une observation, pas supposer qu'un ID seul est portable.

## Mort1d : pistes, interpolation et état graphique

### Superposition de springs

Dans [`engine.js`](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/assets/template/js/engine.js#L70-L102), une piste part d'une valeur initiale et ajoute la réponse indicielle de chaque différence de cible. Pour une fréquence et un amortissement fixes, c'est une superposition linéaire : les contributions précédentes continuent, une nouvelle contribution commence à position et vitesse nulles. La piste conserve donc position et vitesse lors d'un retarget, sans avancer une simulation frame par frame.

Sonde exécutée : clés `(0,0), (.1,100), (.3,-40), (.4,30)`, preset 3 Hz/ζ=.85, différences finies h=10⁻⁶ s. À .3 s, position 95.64465938 ; vitesses unilatérales 132.880745 et 132.853164 unités/s. À .4 s, position 14.11715980 ; vitesses −840.596582 et −840.576439. Les petits écarts de dérivée sont compatibles avec l'accélération et le pas de différence finie ; la lecture du mécanisme explique la continuité. La source n'offre pas un état initial de vitesse arbitraire ni un changement de paramètres physiques par clé.

Échec certain : pour ζ≥1, le helper emploie toujours la formule critique. À 0.1 s et 3 Hz, ζ=1 et ζ=2 renvoient exactement `0.5619604539867584`. Cela ne modélise pas le régime sur-amorti. La nouvelle implémentation doit distinguer les trois régimes et compiler position/vitesse à chaque retarget, surtout si fréquence ou ζ changent.

### Bézier CSS : inversion numérique incomplète

Le helper [`bezier`](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/assets/template/js/engine.js#L35-L54) résout x(u)=progress par huit itérations Newton, puis borne u. Sans intervalle ni bissection de secours, Newton peut sortir du domaine et la borne finale transforme un problème numérique en saut visible.

| Contrôles | Progression | Retour source | Oracle bissection 80 itérations | Erreur absolue |
| --- | ---: | ---: | ---: | ---: |
| (0,0,0,1) | .001 | 1 | .028 | .972 |
| (1,0,1,1) | .999 | 0 | .972 | .972 |
| (1,0,0,1) | .501 | 1 | .593994079 | .406005921 |
| (.16,1,.3,1), pire de 999 points | .004 | .024809977 | .024815835 | .000005858 |

Les trois premiers jeux ont des abscisses de contrôle valides pour CSS. Il ne suffit donc pas de tester les presets habituels. Une inversion bornée et des tests proches des dérivées nulles sont nécessaires. Le helper `P(t,t0,t1)` renvoie aussi NaN pour `P(1,1,1)` ; une piste vide lève une erreur d'accès à `ks[0]`. Un compilateur doit rejeter ou définir explicitement ces cas avant le rendu.

### Un setter partiellement complet

[`set`](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/assets/template/js/engine.js#L167-L204) reconstruit transform et opacity. Mais il ne réinitialise filter que si `blur` est fourni, transformOrigin que si `origin` est fourni, display que si `vis` est fourni.

Mesure sur des éléments DOM réels : après `{blur:8, origin:'0% 0%'}`, puis `{x:0}`, le filtre reste `blur(8px)` et l'origine `0% 0%`. Un élément neuf recevant `{x:0}` n'a ni filtre ni origine inline. Après `{vis:false}` puis `{x:0}`, display reste `none`. C'est une convention documentée du helper, pas une garantie d'état complet. Un adapter original doit posséder et écrire toutes ses propriétés à chaque frame, y compris les valeurs neutres et la visibilité. Le comptage des doubles `set` est un diagnostic d'auteur ; il ne rend pas une scène pure.

### Image, montage et sous-échantillons

[`reel.js`](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/assets/template/js/reel.js#L11-L38) construit les scènes une fois, efface le canvas FX, remet l'objet des effets WebGL à zéro puis appelle toutes les scènes. Chaque scène choisit sa visibilité depuis une fenêtre ; les fenêtres peuvent se chevaucher. Il s'agit d'une composition de couches, pas d'un sélecteur exclusif de plans. L'API `__render(t,f)` distingue temps continu et frame discrète : le texte brouillé utilise f/FPS, tandis que les transforms utilisent t. C'est utile pour garder une seule chaîne de caractères pendant une exposition.

Dans [`capture.mjs`](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/assets/template/tools/capture.mjs#L397-L444), les sous-images sont moyennées sur un shutter ; le nombre choisi divise les slots. Deux observations de code limitent le contrat : aucune liste explicite de cuts ne borne ces temps, et l'optimisation « première image = dernière image » suppose que l'intérieur de la fenêtre est immobile. Cette égalité n'est pas une preuve pour un objet faisant un aller-retour entre les deux instants. Ces limites sont des déductions de l'algorithme, pas des défauts visibles constatés dans le template.

Les sondes ont rendu 11 temps, dans les ordres direct, inverse, mélangé et sur une page fraîche. Le temps 1.031 et 1.0315 s produit des images différentes : il n'est pas globalement quantifié. Des différences de PNG subsistent selon l'ordre ; le décodage RGBA FFmpeg de quatre couples finaux mesure 8, 41, 629 et 3 494 canaux différents, **tous d'écart maximal 1 sur 255**. Des répétitions immédiates testées séparément sont identiques. Nous ne concluons ni à une discontinuité visible ni à une cause précise : le compositor/rasteriseur et les conventions de style restent à isoler. Une comparaison exhaustive peut détecter des différences réelles très petites ; le rapport doit en indiquer l'amplitude, pas transformer tout hash différent en accusation de physique avec mémoire.

Le checker upstream compare les attributs visibles et un hash échantillonné des pixels Canvas (pas tous les pixels finaux du DOM). Il peut donc passer alors que le raster final diffère légèrement. Inversement, les attributs d'enfants d'un parent masqué ne sont pas pertinents pour l'image courante.

## Framewright : construction du monde et protocole de capture

Le [`squelette`](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/.agents/skills/framewright/assets/skeleton.html#L165-L192) assemble les longueurs de plates, résout frame→plate/local, remet complètement le contexte Canvas en état initial puis dessine le plan et son traitement. `wipe` utilise `ctx.reset()` ou une réaffectation de largeur en secours : un simple `clearRect` ne suffirait pas pour effacer clip, composite, ombre et transform.

Les graines sont séparées par rôle : variation fixe par plate, boil sur `floor(n/3)`, bruit par frame. Cela évite qu'un tirage supplémentaire dans un objet change tout un monde, à condition de garder cette séparation. L'API reçoit un numéro de frame mais accepte des fractions ; les hashes de 30.1/30.2 et 420.1/420.2 diffèrent. Cela ne prouve pas une trajectoire entièrement lisse : le grain peut lui-même changer avec la fraction. `renderFrame` replie toujours n modulo TOTAL ; un clamp et un loop doivent être deux politiques explicites dans un moteur générique.

Le cas [`honeybee`](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/examples/honeybee/index.html#L182-L200) dépasse le squelette de plans isolés : la géométrie et les trajectoires sont construites une fois dans un monde seedé, puis échantillonnées. `camRaw(f)` interpole la position et le logarithme du zoom ; le suivi regarde la tête du tracé à `f−lag`. `camAt(f)` moyenne 19 évaluations autour de f, de −18 à +18 frames par pas 2, poids gaussiens σ=6 ; le zoom est moyenné dans le domaine logarithmique. Ce lissage est déterministe et non causal : il anticipe des valeurs futures dans une fenêtre. C'est adapté à un film calculé, pas automatiquement à une caméra interactive temps réel. Il ne dépend pas de la caméra de la frame précédente.

Sonde exécutée : 6 frames du squelette (120 frames) et 6 de honeybee (1680 frames), ordres direct/inverse/mélangé, excursion de largeur 480→960→480 et page fraîche. Zéro différence de PNG dans ces cas. Les contextes regroupent leurs caches par seed et dimensions ; les changements de résolution sont donc une sonde utile. Cette couverture n'est pas un balayage exhaustif des 1680 frames.

Le checker [`check.mjs`](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/.agents/skills/framewright/scripts/check.mjs#L94-L151) va plus loin que le seul ordre direct : poses de chaque plate, antécédent n−1, changement de largeur, balayage et page fraîche. Son analyse statique de hasard/horloge utilise toutefois des regex, pas une preuve de pureté de programme ; certains résultats sont des warnings (cues dupliquées/hors durée), pas des erreurs bloquantes. Notre compilation doit rendre les erreurs structurelles bloquantes avant l'export.

## Son : même calendrier, preuves et limites différentes

Le template Mort importe réellement `timeline.mjs` dans les scènes et dans [`audio/score.mjs`](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/assets/template/audio/score.mjs#L13-L101). Les effets s'accrochent aux cues, la musique reste construite en beats. Le synthé travaille hors ligne à 48 kHz avec une seed, des bus, du ducking, de la réverbération, puis un ajustement loudness/true peak itératif. L'affichage de loudness du synthé est une estimation distincte du contrôle FFmpeg.

Honeybee exporte **1680 lignes** de courbes : vitesse écran des deux tracés, pan, présence de l'abeille et zoom. Son [`audio.mjs`](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/examples/honeybee/audio.mjs#L6-L13) dérive fps, bpm, durée et débuts de scène de ce fichier ; il interpole les courbes au sample audio. Cela transmet plus qu'un calendrier de coups : vitesse et espace influencent la synthèse. Mais les quatre fenêtres de waggle sont encore codées dans le script audio à partir de frames fixes ; la synchronisation de toutes les actions n'est donc pas intégralement centralisée.

Les deux scripts upstream ont été exécutés deux fois, avec chemins de sortie locaux explicites. Les WAV sont identiques par SHA-256 entre les deux exécutions.

| Exécution observée | Durée / format PCM | LUFS intégrés FFmpeg | LRA | True peak FFmpeg |
| --- | --- | ---: | ---: | ---: |
| Mort template | 13 s, 48 kHz, stéréo 24 bits, 624 000 samples/canal | −14.0 | 5.1 LU | −3.5 dBFS dans le rapport true peak |
| Framewright honeybee | 56 s, 44.1 kHz, stéréo 16 bits, 2 469 600 samples/canal | −16.3 | 4.5 LU | −1.0 dBFS dans le rapport true peak |

Le synthé Mort annonce −3.68 dBTP alors que FFmpeg donne −3.5 ; les estimateurs ne sont pas interchangeables. Honeybee normalise son peak, ce qui ne définit pas son LUFS. Aucun son n'a été écouté ; ces mesures ne prouvent ni qualité musicale ni perception de synchro. Les WAV restent sous `out/`, sans redistribution dans les sources du projet.

## Frankxai : transformer une gouvernance en contrat utile

Le [schéma de job](https://github.com/frankxai/awesome-motion-design-agent-skills/blob/b45d60fa5b0f7b7d07331572416b80e17dcfd203/schemas/media-job.schema.json) est un contrat de demande : objectif, format, fournisseur, prompts, QA et provenance. Il ne contient ni scène échantillonnable ni piste temporelle. Les noms de checks QA sont des intentions à exécuter, pas des résultats PASS. La durée minimale autorisée vaut zéro ; les tableaux d'aspects peuvent être multiples. Ces décisions sont cohérentes avec un catalogue multi-média, insuffisantes pour valider un film exportable unique. Il faut une étape de compilation concrète vers durée positive, résolution, fps, assets et timeline résolus.

Le [registre de motifs](https://github.com/frankxai/awesome-motion-design-agent-skills/blob/b45d60fa5b0f7b7d07331572416b80e17dcfd203/patterns/motion-pattern-registry.json) contient 8 patterns avec surface, runtime conseillé, tokens, cas d'exclusion et fallback. C'est une table de décision de direction. Certains tokens sont des nombres, d'autres des noms propres à un runtime, d'autres des unités CSS : l'importer directement dans un moteur sans normalisation laisserait des ambiguïtés d'unités et de sémantique.

Les [routes fournisseurs](https://github.com/frankxai/awesome-motion-design-agent-skills/blob/b45d60fa5b0f7b7d07331572416b80e17dcfd203/configs/provider-routing.default.json) et le [document MCP](https://github.com/frankxai/awesome-motion-design-agent-skills/blob/b45d60fa5b0f7b7d07331572416b80e17dcfd203/mcp/motion-designer-mcp.md) décrivent une architecture souhaitée et des préférences ; l'inventaire ne livre pas leurs adapters exécutables. Ils ne prouvent pas que les fournisseurs, authentifications ou outils listés sont disponibles. Aucune commande d'installation, connexion ou soumission provenant de ces documents n'a été suivie.

La [rubrique d'excellence](https://github.com/frankxai/awesome-motion-design-agent-skills/blob/b45d60fa5b0f7b7d07331572416b80e17dcfd203/rubrics/site-motion-excellence-gate.md) distingue composition statique, hiérarchie, spécificité, chorégraphie, retenue et preuve. Son apport à notre atelier est d'exiger une observation située et une correction documentée. Un total numérique de goût ne devient pas un certificat automatisé. Reduced-motion, clavier et scroll concernent un lecteur ou site interactif ; la frame d'un film exige d'autres invariants. Le catalogue reste utile comme direction et structure de revue, sans justifier une dépendance runtime supplémentaire.

## Décisions pour le moteur original

1. Compiler un projet immuable en cues, plans, pistes et états initiaux. Unités explicites ; rejeter durées nulles, valeurs non finies, pistes vides, IDs dupliqués et références de cues absentes.
2. Échantillonner depuis le temps absolu continu ; garder le numéro de frame nominal séparé pour textes/états discrets et ne jamais quantifier globalement la trajectoire.
3. Springs exacts pour trois régimes, état position/vitesse aux changements de cible ; Bézier résolu dans un intervalle, avec tests des extrémités et dérivées faibles.
4. Adapter Canvas avec reset complet ; adapters DOM/SVG avec tous les attributs/styles possédés écrits à chaque image. Les caches doivent dépendre de toutes les entrées pertinentes.
5. Caméra pure, trajectoire et zoom logarithmique explicites ; cuts distincts des transitions de couches, shutter borné au plan courant.
6. Image, audio et QA dérivés du même projet compilé. Les courbes continues peuvent piloter le son, mais les fenêtres d'action doivent rester nommées et partagées.
7. Comparer les pixels complets, aussi sur page fraîche et après changement de dimensions ; publier l'amplitude et les limites des écarts. Évaluer une animation par captures et contacts situés, pas par le seul succès d'un export.

## Reproduction locale et limites restantes

Les scripts originaux sont `work/deep-b/host.mjs`, `probe.mjs`, `mort-diff.mjs`, `measure.mjs` et `publish-evidence.mjs`. Le premier démarre le serveur et les trois pages choisies ; les suivants mesurent seulement ces cibles. Commandes effectivement exécutées depuis la racine : `node work/deep-b/host.mjs`, `node work/deep-b/probe.mjs`, `node work/deep-b/mort-diff.mjs`, `node work/deep-b/measure.mjs`, `node work/deep-b/publish-evidence.mjs`. Le script de mesure nécessite les deux WAV initialement créés par les scripts source explicitement sélectionnés et le `curves.json` exporté par honeybee.

Les trois images représentatives ont été ouvertes : honeybee frame 420, squelette frame 30, Mort 1.031 s. Elles confirment respectivement une composition de ruche lumineuse dans un monde dessiné, une carte technique Canvas, et une composition typographique DOM. Cette inspection de trois poses ne juge pas le rythme complet. Aucun draft vidéo des sources n'a été lu à vitesse réelle dans cette enquête B. La cause précise des écarts raster DOM de 1 niveau, la totalité des scènes non sélectionnées, tous les paramètres des synthés, la perception du mix et les outils futurs du catalogue demeurent non établis.

À la clôture, le Chrome possédé par l'enquête a été fermé via `Browser.close`, puis le serveur Node identifié par sa commande `work/deep-b/host.mjs` arrêté. Aucun listener ne subsistait sur les ports 8931/9351 ; aucun profil ou processus Chrome utilisateur n'a été ciblé. Le [protocole public](REPRODUCE.md) fournit une voie plus compacte pour rejouer les régressions numériques principales.
