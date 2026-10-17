# Audit des sources et choix d’adaptation

Cet audit repose sur la lecture des six dépôts demandés, clonés séparément du dépôt livré. Les révisions ci-dessous figent ce qui a été consulté le 17 octobre 2026. Il s’agit d’une analyse de leurs interfaces, comportements et méthodes ; les constats de code ne constituent pas une exécution de leurs exemples.

Le présent projet développe son architecture, son texte, ses prompts et son exemple indépendamment. Les liens suivants permettent de distinguer les observations vérifiables des choix propres à cette adaptation pour Codex et ChatGPT.

## Périmètre et licences

| Source | Révision consultée | Licence constatée | Usage dans ce projet |
| --- | --- | --- | --- |
| [howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design/tree/3d90d349ef3fdde9b7e89de4df4a2159c9e8697f) | `3d90d349ef3fdde9b7e89de4df4a2159c9e8697f` | [MIT, Howseen AI / Raphaël Aubry](https://github.com/howseen-ai/claude-motion-design/blob/3d90d349ef3fdde9b7e89de4df4a2159c9e8697f/LICENSE#L1-L21) | Analyse des méthodes et limites ; implémentation indépendante. |
| [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion/tree/e627941543d9988b155dc610bb9cc0115a5e365e) | `e627941543d9988b155dc610bb9cc0115a5e365e` | [MIT, whaleyxbt](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/LICENSE#L1-L21) | Analyse des méthodes et limites ; implémentation indépendante. |
| [Miftahul-Islam-Efaz/Motion-graphics-skill](https://github.com/Miftahul-Islam-Efaz/Motion-graphics-skill/tree/4fe427bcda356b8a53ce65705eecced2e10be572) | `4fe427bcda356b8a53ce65705eecced2e10be572` | [Commercial Single-User Licence](https://github.com/Miftahul-Islam-Efaz/Motion-graphics-skill/blob/4fe427bcda356b8a53ce65705eecced2e10be572/LICENSE.md) | Source exclue de la réutilisation. Aucun code, prompt, template, texte adapté ou résumé de ses instructions n’est livré. |
| [frankxai/awesome-motion-design-agent-skills](https://github.com/frankxai/awesome-motion-design-agent-skills/tree/b45d60fa5b0f7b7d07331572416b80e17dcfd203) | `b45d60fa5b0f7b7d07331572416b80e17dcfd203` | [CC0 1.0 Universal](https://github.com/frankxai/awesome-motion-design-agent-skills/blob/b45d60fa5b0f7b7d07331572416b80e17dcfd203/LICENSE) | Analyse de la direction et des critères de revue. |
| [smwbev/framewright](https://github.com/smwbev/framewright/tree/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12) | `7d3245abb94c745b8ce7fc06c4ea62ba295c6f12` | [MIT, Evgenii / smwbev](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/LICENSE) | Analyse du contrat de rendu et des contrôles. |
| [Mort1d/motion-graphics-skills](https://github.com/Mort1d/motion-graphics-skills/tree/7f0c3714dc81bea52644a5287c6350345009e579) | `7f0c3714dc81bea52644a5287c6350345009e579` | [MIT, Mort1d](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/LICENSE) ; fontes sous leurs licences OFL | Analyse du moteur et du processus de production. Aucune fonte de ce dépôt n’est embarquée. |

Une mention de source ne remplace pas une licence. En cas d’ajout ultérieur de code, fonte, musique, logo ou autre asset provenant d’un tiers, enregistrer sa provenance et préserver les notices applicables. Les médias présentés dans les sources n’appartiennent pas automatiquement à leur licence de code.

## Howseen : temps absolu et rendu par sous-images

### Observations retenues

- Le [contrat de scène](https://github.com/howseen-ai/claude-motion-design/blob/3d90d349ef3fdde9b7e89de4df4a2159c9e8697f/skill/motion-design/SKILL.md#L33-L47) place le dessin sous `seek(t)` et sépare la lecture interactive de la capture. Les propriétés d’une image doivent pouvoir être calculées directement à partir de son temps.
- Le même passage décrit les springs analytiques, l’interpolation logarithmique du zoom et les transitions dont la géométrie couvre réellement le cadre. Ce sont des méthodes à implémenter et mesurer, plutôt que des noms d’effets à reproduire.
- Le [renderer](https://github.com/howseen-ai/claude-motion-design/blob/3d90d349ef3fdde9b7e89de4df4a2159c9e8697f/skill/motion-design/scripts/render_template.py#L26-L46) attend les ressources, suspend les animations autonomes et laisse deux cycles de présentation après chaque seek.
- La [capture finale](https://github.com/howseen-ai/claude-motion-design/blob/3d90d349ef3fdde9b7e89de4df4a2159c9e8697f/skill/motion-design/scripts/render_template.py#L66-L84) échantillonne plusieurs temps dans une fenêtre d’exposition. Les échantillons sont maintenus du même côté d’un changement de plan.
- La [revue par images](https://github.com/howseen-ai/claude-motion-design/blob/3d90d349ef3fdde9b7e89de4df4a2159c9e8697f/skill/motion-design/SKILL.md#L98-L122) associe défauts, timestamps et nouvelles captures. Les [contrôles additionnels](https://github.com/howseen-ai/claude-motion-design/blob/3d90d349ef3fdde9b7e89de4df4a2159c9e8697f/skill/motion-design/SKILL.md#L138-L143) distinguent construction et critique.

### Écarts de code à ne pas reproduire

- Le [spring du moteur de remake](https://github.com/howseen-ai/claude-motion-design/blob/3d90d349ef3fdde9b7e89de4df4a2159c9e8697f/skill/motion-design/scripts/remake/core.js#L19-L20) omet le terme sinus de la réponse sous-amortie au repos. Il produit une vitesse initiale non nulle pour un amortissement positif. Le nouveau helper doit exprimer les conditions initiales et les régimes physiques qu’il supporte.
- Le [seek du même moteur](https://github.com/howseen-ai/claude-motion-design/blob/3d90d349ef3fdde9b7e89de4df4a2159c9e8697f/skill/motion-design/scripts/remake/core.js#L124-L132) arrondit le temps à une frame entière. Cela convient à une reconstruction verrouillée sur des frames, mais ne conserve pas un mouvement continu entre deux sous-échantillons. L’exemple livré conserve le temps continu.
- Le [template de capture](https://github.com/howseen-ai/claude-motion-design/blob/3d90d349ef3fdde9b7e89de4df4a2159c9e8697f/skill/motion-design/scripts/render_template.py#L79-L84) imprime les erreurs de page sans interrompre ce chemin d’export et n’explicite pas de paramètres de couleur dans cette commande FFmpeg. L’adaptation rend les erreurs fatales et documente ce qui est effectivement encodé.
- Les [détecteurs de pops et de boucle](https://github.com/howseen-ai/claude-motion-design/blob/3d90d349ef3fdde9b7e89de4df4a2159c9e8697f/skill/motion-design/scripts/render_template.py#L108-L140) sont des alarmes heuristiques. Un seuil passé ne prouve ni une boucle perceptuellement invisible ni l’absence de défaut dans toutes les images.

## Whaleyxbt : une timeline pour l’image, le son et la revue

### Observations retenues

- Le [document de mouvement](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/.claude/skills/motion-design/SKILL.md#L10-L15) fait de la timeline la source partagée des événements. Scènes et cues audio lisent les mêmes instants ; un retiming doit donc se propager sans ressaisie.
- Les [réglages et durées](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/.claude/skills/motion-design/SKILL.md#L30-L49) distinguent les entrées, sorties, staggers et poses de lecture. Les nombres sont des points de départ propres à un exemple, à évaluer selon contenu et format.
- Les [règles de continuité](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/.claude/skills/motion-design/SKILL.md#L72-L86) favorisent les objets persistants et les transitions liées à leur action. Le mouvement secondaire peut être dérivé de la vitesse.
- Le [cycle de revue](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/.claude/skills/review-loop/SKILL.md#L12-L20) combine draft, feuilles de contact, captures précises et nouvelle inspection. Son [rapport attendu](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/.claude/skills/review-loop/SKILL.md#L44-L50) rattache une correction à une preuve rerendue.
- Le [moteur audio](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/.claude/skills/sound-design/SKILL.md#L44-L47) conserve les cues dans le calendrier visuel et accepte qu’un mix très clairsemé reste sous sa cible de loudness. Le [choix des sons](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/.claude/skills/sound-design/SKILL.md#L52-L72) suit la fonction et la hiérarchie des actions.
- Le [runtime de simulation](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/sims/kit/runtime.js#L118-L130) expose un chemin de capture sans boucle de lecture. Ses [helpers](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/sims/kit/util.js#L23-L39) distinguent un générateur initialisé et une variation sans état.

### Écarts de code à ne pas reproduire

- Dans la [capture HTML](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/sims/capture.mjs#L62-L75), les erreurs navigateur sont journalisées. Le chemin principal [attend la fin de FFmpeg](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/sims/capture.mjs#L124-L139) sans vérifier son code de sortie. Le renderer livré doit échouer clairement dans ces cas.
- Une capture séquentielle régulière ne teste pas, à elle seule, l’indépendance des frames. Ajouter des seeks dans plusieurs ordres et une comparaison du résultat final.
- Les springs de cette source sont réglés en masse, raideur et coefficient d’amortissement. L’adaptation expose explicitement le ratio `ζ = c / (2√(km))` pour éviter de confondre coefficient et ratio.
- La déclaration selon laquelle un agent ne peut pas regarder une vidéo, présente au [début du guide de revue](https://github.com/whaleyxbt/claude-motion/blob/e627941543d9988b155dc610bb9cc0115a5e365e/.claude/skills/review-loop/SKILL.md#L6-L8), dépend des capacités de son environnement. Ici, chaque rapport précise les images ouvertes, les métriques mesurées et les limites d’inspection.

## Frankxai : direction et critères d’évaluation

Cette source est un ensemble de guides de direction et de rubriques, plutôt qu’une implémentation de moteur `seek(t)`.

- Le [guide de direction](https://github.com/frankxai/awesome-motion-design-agent-skills/blob/b45d60fa5b0f7b7d07331572416b80e17dcfd203/skills/motion-director/SKILL.md#L10-L21) relie le choix du runtime au résultat attendu, puis demande des tokens de mouvement et des captures évaluables.
- Le [guide Remotion](https://github.com/frankxai/awesome-motion-design-agent-skills/blob/b45d60fa5b0f7b7d07331572416b80e17dcfd203/skills/remotion-video-agent/SKILL.md#L10-L15) définit des scènes sur des plages temporelles déterministes et une inspection après rendu.
- La [rubrique générale](https://github.com/frankxai/awesome-motion-design-agent-skills/blob/b45d60fa5b0f7b7d07331572416b80e17dcfd203/rubrics/motion-quality-rubric.md#L7-L19) sépare objectif, timing, hiérarchie, marque, accessibilité, performance et mise en œuvre.
- Le [contrôle de qualité visuelle](https://github.com/frankxai/awesome-motion-design-agent-skills/blob/b45d60fa5b0f7b7d07331572416b80e17dcfd203/rubrics/site-motion-excellence-gate.md#L11-L31) demande une composition statique solide, une progression lisible et des preuves inspectées.

L’adaptation applique ces idées au storyboard et à la critique. Les exigences d’interface interactive, de performance web ou de réduction du mouvement concernent le lecteur selon son usage ; elles ne se transposent pas automatiquement à chaque image d’un film exporté.

## Framewright : contrat explicite et sondes de déterminisme

- Son [guide principal](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/.agents/skills/framewright/SKILL.md#L29-L38) définit l’image à partir du numéro de frame, de la seed et de la largeur de sortie. Cette interface exprime le même invariant que `seek(t)`, avec une unité différente.
- Le [squelette](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/.agents/skills/framewright/assets/skeleton.html#L239-L250) expose une API de frame et les métadonnées de production. Le [guide audio](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/.agents/skills/framewright/references/audio.md#L14-L29) utilise les cues visuelles pour la génération du WAV, évitant une seconde transcription des temps.
- Le [guide de timing](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/.agents/skills/framewright/references/guide.md#L68-L86) explicite BPM, subdivisions et quantification. Une subdivision musicale peut tomber entre deux frames : il faut distinguer temps musical idéal et frame de contact réellement visible.
- Le [contrôle statique](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/.agents/skills/framewright/scripts/check.mjs#L31-L38) recherche des sources d’horloge et de hasard ainsi que des indices de données audio périmées.
- Les [sondes comportementales](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/.agents/skills/framewright/scripts/check.mjs#L94-L125) comparent plusieurs contextes : ordres différents, changement de largeur, balayage et page fraîche. Elles inspirent un test de contrat plus précis qu’une seule capture chronologique.
- Le [build](https://github.com/smwbev/framewright/blob/7d3245abb94c745b8ce7fc06c4ea62ba295c6f12/.agents/skills/framewright/scripts/build.sh#L5-L18) explicite la conversion couleur et passe par un fichier temporaire avant de remplacer le master.

L’adaptation conserve ces contrôles comme sondes, sans présenter quelques cas testés comme une preuve universelle. Elle utilise un outillage Node compatible avec Windows et n’hérite pas implicitement d’une cadence de 30 fps. Framewright possède déjà un chemin Codex ; son apport ne se réduit donc pas à renommer une intégration Claude.

## Mort1d : moteur analytique et production complète

- Le [guide de production](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/SKILL.md#L223-L248) relie images clés, contrat de frame pure, réécriture des propriétés et données de timing partageables sans DOM.
- Le [moteur](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/assets/template/js/engine.js#L70-L105) utilise une réponse spring analytique, additionne les changements de cible et propose des presets exprimés par fréquence et ratio d’amortissement. Il comprend également un zoom logarithmique.
- La [revue](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/SKILL.md#L282-L307) associe captures par beat, lecture mobile, strips de mouvements et défauts localisés dans un journal de revue.
- Le [module de timeline](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/assets/template/js/timeline.mjs#L1-L29) regroupe format, cadence, BPM, scènes et cues. La [liste de motifs à éviter](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/references/story-and-motion.md#L192-L210) traite surtout des automatismes sans lien avec le produit ou son message ; elle informe la revue sans remplacer une direction artistique propre au projet.
- La [capture à sous-échantillons](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/assets/template/tools/capture.mjs#L397-L431) distingue les propriétés continues des éléments discrets. La [règle correspondante](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/SKILL.md#L383-L388) évite de mélanger des chiffres ou lettres provenant de plusieurs instants d’exposition.

### Écarts de code à ne pas reproduire

- La [fonction spring](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/assets/template/js/engine.js#L70-L87) emploie la branche critique pour les ratios supérieurs ou égaux à un. Cette branche n’est exacte qu’à `ζ = 1`. Le nouveau helper doit traiter séparément sous-amortissement, amortissement critique et sur-amortissement.
- Le [test de déterminisme](https://github.com/Mort1d/motion-graphics-skills/blob/7f0c3714dc81bea52644a5287c6350345009e579/skills/motion-graphics/assets/template/tools/capture.mjs#L350-L370) utilise notamment un hash échantillonné des pixels. L’adaptation compare les captures complètes des probes, dans un environnement fixé, plutôt que de considérer cet échantillonnage comme exhaustif.
- La réussite d’un export ne prouve pas que le son a été livré ou écouté. Le nouveau contrat indique explicitement si l’export comprend une piste audio et quelle vérification a été réalisée.

## Décisions propres à ce dépôt

| Besoin | Choix d’adaptation pour Codex / ChatGPT |
| --- | --- |
| Entrée agent | `AGENTS.md` au niveau du dépôt, prompts en fichiers lisibles et commandes ordinaires. Aucune configuration de modèle ou intégration Claude requise. |
| Image indépendante | Temps absolu continu ; chaque appel écrit l’état complet ; pas de physique accumulée ni d’horloge dans les scènes. |
| Springs | Helper mathématique original avec ratio explicite, trois régimes et tests des conditions initiales et limites. |
| Identité visuelle | Direction décidée dans le storyboard ; banned list utilisée pour éliminer des automatismes sans interdire un choix expressément motivé. |
| Retiming | Des événements nommés dans un seul descriptor pilotent scènes, cues et points de revue. |
| Contrôle | Tests automatisés du contrat, captures répétées et désordonnées, images clés, strips, draft et rapport des défauts réellement observés. |
| Son | Cues issues des événements visuels ; placement en samples ; distinction entre mesure technique et écoute subjective. |
| Livraison | Dépendances verrouillées, assets locaux, erreurs de rendu bloquantes, export documenté et preuves de validation vérifiables. |

Une limite de style n’est pas un invariant physique. Par exemple, un ratio élevé limite souvent le rebond pour une interface calme ; une animation volontairement élastique peut demander un autre réglage. Le contrat doit rester déterministe dans les deux cas.

## Limites d’attribution et de recherche sociale

Aucun lien vers un post de `@seeconvm`, `@humzaakhalid` ou `@flxrnc` n’a été trouvé dans les six clones analysés. Ces dépôts ne permettent donc pas d’établir le contenu, la date ou l’auteur d’un post particulier de ces comptes. Aucune technique du présent audit ne leur est attribuée sur cette base.

La recherche web menée séparément et ses limites sont consignées dans [SOCIAL_SOURCES.md](SOCIAL_SOURCES.md). Elle ne modifie pas rétroactivement les observations de code ci-dessus.

Les mentions « Opus 5.5 » de certaines sources sont leur propre présentation. Elles ne prouvent pas que l’ensemble des six systèmes a été conçu exclusivement pour ce modèle : plusieurs documentent déjà Codex ou plusieurs agents. L’adaptation vise les capacités effectives de Codex et ChatGPT : lire le projet, modifier les fichiers, exécuter les commandes, inspecter les captures et rendre compte des limites.

Les contrôles de déterminisme restent liés au navigateur, aux versions, aux fontes, aux dimensions et à la plateforme testés. Ils évaluent la reproductibilité dans ce périmètre, pas l’identité pixel par pixel entre tous les systèmes possibles.

## Source complémentaire : REA

[morluto/rea](https://github.com/morluto/rea/tree/408704827057280b240c91963ee5590fd4dcc988), révision `408704827057280b240c91963ee5590fd4dcc988`, version `6.5.0`, est sous [licence MIT, morluto](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/LICENSE#L1-L21). Cette source complémentaire apporte une enquête facultative sur pages et artefacts logiciels, sans remplacer le moteur vidéo. Son installation Codex, les commandes vérifiées dans les sources et les limites d’interprétation sont détaillées dans [REA_WORKFLOW.md](REA_WORKFLOW.md). Aucun code ni skill REA n’est redistribué ici.
