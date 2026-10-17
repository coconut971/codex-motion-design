# REA pour comprendre une référence, puis la réimplémenter

[REA — Reverse Engineer Anything](https://github.com/morluto/rea) est une intégration optionnelle pour l’enquête technique. Codex peut l’utiliser via MCP ou par sa CLI pour inspecter une page, des scripts JavaScript ou une application. Le film reste produit par le moteur `seek(t)`, Playwright et FFmpeg de ce dépôt ; REA ne remplace pas cette pipeline.

Cette intégration est documentée à partir du commit [`408704827057280b240c91963ee5590fd4dcc988`](https://github.com/morluto/rea/tree/408704827057280b240c91963ee5590fd4dcc988), version `6.5.0`, sous [licence MIT, morluto](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/LICENSE#L1-L21). Une consultation du registre npm le 17 octobre 2026 a confirmé `latest = 6.5.0`, le dépôt officiel et les exigences Node ci-dessous. Aucun code ni skill REA n’est embarqué ici. Après la première validation en dry-run, l’intégration Codex et le skill ont effectivement été installés sur la machine de travail. Le [cas pratique Signal](cases/REA_SIGNAL.md) relie l’enquête sur une page HTML à une reconstruction, aux comparaisons d’images et au rendu local.

## Installer l’intégration Codex

REA 6.5.0 requiert Node `22.x >= 22.19`, `24.x >= 24.11` ou `26+`, avec npm. C’est plus strict que le minimum du renderer de ce dépôt. JavaScript statique ne nécessite pas Hopper, Ghidra ou IDA. L’analyse d’une page nécessite un navigateur de la famille Chrome. Sous Linux, l’analyse JavaScript/Electron exige aussi un `ps` compatible procps. Voir les [prérequis officiels](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/README.md#L164-L197) et [la précision Linux](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/installation.md#L338-L346).

La commande d’entrée officielle est :

```sh
npx rea-agents setup
```

Pour limiter explicitement l’installation à Codex et examiner un plan reproductible :

```sh
npx rea-agents@6.5.0 setup --client codex --dry-run
npx rea-agents@6.5.0 setup --client codex
```

La première commande affiche le plan sans appliquer les changements. La seconde propose son application ; lire les chemins indiqués, puis valider dans REA et redémarrer Codex après réussite. Aucun moteur d’analyse native n’est nécessaire pour les usages web et JavaScript décrits ici. L’ajout de `--skill=false` permet d’enregistrer seulement le MCP, sans le workflow REA. Ces options sont documentées dans [l’installation](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/installation.md#L31-L114) et définies dans [la CLI](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/src/cli/setupCommands.ts#L50-L88).

Le setup touche les emplacements utilisateur suivants, selon l’environnement réel présenté dans son plan :

| Élément | Emplacement et effet |
| --- | --- |
| Enregistrement MCP Codex | `config.toml` dans `CODEX_HOME`, ou `~/.codex/config.toml` si cette variable est vide ou absente ; entrée `mcp_servers.rea`. |
| Workflow REA par défaut | `~/.agents/skills/reverse-engineer-anything/`, avec ses références. Pour Codex, cette destination partagée n’est pas déplacée par `CODEX_HOME`. |
| Sauvegardes de configuration | Fichiers `.rea.backup` et, si nécessaire, sauvegarde de récupération nommée par son empreinte ; conserver les chemins rapportés par le setup. |
| Délais MCP | Initialisation de 30 secondes pour une nouvelle entrée et délai d’outil dérivé des providers ; les valeurs positives déjà choisies sont préservées. |

Les chemins découlent du [résolveur de configuration Codex](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/src/application/SupportedClients.ts#L167-L168), de [sa déclaration](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/src/application/SupportedClients.ts#L503-L509) et du [résolveur des skills](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/src/application/SupportedClients.ts#L811-L855). Les [sauvegardes](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/installation.md#L49-L70) et [délais Codex](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/client-configuration.md#L244-L260) sont décrits séparément.

Laisser REA produire son enregistrement plutôt que recopier un TOML générique. Le launcher est épinglé à sa version ; sous Windows, il utilise un wrapper `cmd.exe /d /c` pour lancer `npx`, comme le montre [son implémentation](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/src/application/ClientRegistrationIdentity.ts#L53-L69). Ce setup modifie le profil Codex utilisateur, pas seulement le dépôt courant.

Vérifier ensuite uniquement les composants concernés :

```sh
npx rea-agents@6.5.0 doctor --client codex --skill --json
npx rea-agents@6.5.0 --help
```

Si le skill a volontairement été omis, retirer `--skill` de la vérification. Un diagnostic scoped ne prouve pas qu’une cible précise sera analysable ; le [guide de readiness](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/installation.md#L301-L329) distingue ces niveaux. Un enregistrement valide n’ajoute pas les outils MCP à une session déjà ouverte : redémarrer ou reconnecter Codex, puis vérifier leur découverte dans la nouvelle session. Entre-temps, une CLI fonctionnelle permet de poursuivre l’enquête autorisée et de conserver les mêmes Evidence. L’absence de découverte MCP n’impose pas d’arrêter ce chemin CLI ni de répéter le setup. Un ChatGPT hébergé sans accès au processus local ne reçoit pas ce MCP par cette seule installation ; utiliser Codex sur la machine, une CLI disponible dans son environnement, ou lui fournir les Evidence exportées.

## Choisir la bonne enquête

| Référence disponible | REA peut apporter | Ce qui reste à établir |
| --- | --- | --- |
| Page animée accessible | DOM, scripts capturés, ressources, observations réseau/console et screenshots du viewport. | Timeline visuelle, éléments hors capture, code serveur, dépendances absentes et intention artistique. |
| Dossier JavaScript / application Electron / ASAR | Graphe de modules, imports, relations et emplacements de code observés ; analyse statique sans exécuter l’application. | Comportement effectif, chemins non résolus et paramètres non observables. |
| Scénario d’interface | Actions déclarées et captures de leur résultat dans un navigateur lancé ou sélectionné. | Un scénario réussi ne suffit pas à démontrer la qualité du mouvement ni l’équivalence de toutes les interactions. |
| MP4, GIF ou images seuls | La référence visuelle peut guider une spécification et une comparaison. | Les pixels ne fournissent pas les fichiers source ni une fonction spring unique. REA n’est ni un générateur vidéo ni une garantie de récupération du projet original. |

Le [catalogue web](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/browser-observation.md#L15-L38) sépare inspection passive et captures ; les [scénarios](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/browser-scenario-contract.md#L1-L28) constituent un autre chemin, capable d’effectuer des actions. Les [workflows JavaScript](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/javascript-application-workflows.md#L3-L24) conservent la différence entre observation statique, observation runtime, inférence et inconnu.

## Page web : capturer les faits utiles

Utiliser un profil Chrome dédié avec un port de débogage local. REA ne lance ni ne termine le navigateur du chemin passif. Le [guide officiel](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/browser-observation.md#L92-L119) fournit les flags `--remote-debugging-port=9222` et `--user-data-dir=<profil dédié>`. Le chemin exact de l’exécutable dépend de la machine ; le port reste sur l’interface locale.

Les commandes suivantes utilisent un endpoint réellement ouvert ; remplacer `TARGET_ID` par une identité renvoyée par la première commande :

```sh
npx rea-agents@6.5.0 list-browser-targets http://127.0.0.1:9222 --json
npx rea-agents@6.5.0 inspect-web-page http://127.0.0.1:9222 TARGET_ID --observation-ms 1000 --json
npx rea-agents@6.5.0 analyze-web-bundle http://127.0.0.1:9222 TARGET_ID --json
npx rea-agents@6.5.0 capture-web-screenshot http://127.0.0.1:9222 TARGET_ID --json
```

Pour observer une interaction humaine, armer `observe-web-session` avec une fenêtre explicite, puis effectuer l’action dans cette fenêtre. Pour capturer aussi les scripts exposés au Debugger, ajouter `--include-script-sources` à `inspect-web-page`. Les [commandes et options](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/browser-observation.md#L192-L213) et la [capture de contenu](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/browser-observation.md#L245-L277) sont vérifiables dans les sources. Les screenshots sont des artefacts inline, pas nécessairement un PNG déjà enregistré sur disque.

Conserver la sortie complète en JSON UTF-8 et sans BOM dans un dossier d’enquête local, par exemple sous `work/rea/`. Ne pas verser automatiquement captures, scripts tiers, cookies ou données de session dans le dépôt public. Une sélection d’options plus large peut inclure des informations sensibles ; ne sélectionner que les données utiles à la question étudiée.

Si des sources ont effectivement été capturées, REA peut les exporter vers un **nouveau** dossier puis les analyser. Dans les commandes ci-dessous, remplacer les deux chemins entre chevrons par les chemins absolus réels :

```sh
npx rea-agents@6.5.0 export-web-scripts "<capture.json>" "<nouveau-dossier>" --json
npx rea-agents@6.5.0 analyze-javascript-application "<nouveau-dossier>/files" --json
```

L’export peut légitimement ne fournir aucune entrée analysable. Il ne reconstitue pas une application complète, ne récupère pas automatiquement les source maps absentes et ne garantit pas l’exécution des scripts observés. Vérifier `analysis_input`, les empreintes, la couverture et les exclusions dans les [résultats d’export](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/website-script-export.md#L19-L34) et leurs [limites](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/website-script-export.md#L67-L86).

Pour un dossier déjà disponible, il suffit de lancer `npx rea-agents@6.5.0 analyze-javascript-application "<dossier-absolu-ou-ASAR>" --json`. Des Evidence volumineuses doivent être enregistrées puis interrogées par vues ciblées, comme expliqué dans la [CLI](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/cli.md#L7-L38). En MCP, les références retenues appartiennent à la connexion ; plusieurs appels CLI doivent partager des fichiers Evidence complets, pas seulement un identifiant de session ([contrat](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/cli.md#L216-L232)).

## Transformer l’enquête en animation déterministe

1. Définir une question observable : par exemple « quelle durée sépare le clic et l’impact visuel ? » ou « quelle courbe rapproche ce panneau de sa cible ? ». Conserver URL ou empreinte de fichier, version, dimensions, capture et temps de référence.
2. Consigner les résultats dans une note locale : fait observé, preuve précise, inférence, incertitude. Une famille de courbes peut expliquer les mêmes positions ; distinguer une valeur lue dans le code d’un réglage ajusté visuellement.
3. Produire `STORYBOARD.md` avant l’implémentation : états successifs, anticipation, action, contact, lecture, transition, rôle de la caméra et son. Pour une vidéo seule, relever les poses et contacts par frames avec FFmpeg ; ne pas prétendre avoir identifié le code original.
4. Reporter les événements nommés dans le descriptor du film. Distinguer temps musical et frame de contact. Choisir un vocabulaire de formes, couleurs et sons propre au nouveau film ; les droits de REA ne donnent aucun droit sur la cible analysée.
5. Réimplémenter le comportement utile avec `seek(t)`, les helpers du dépôt et des assets autorisés. Garder les constats d’enquête séparés du code livré. Réinitialiser tout l’état dessiné, utiliser des seeds stables et exprimer les springs par fréquence et ratio d’amortissement.
6. Exécuter `npm test`, puis les contrôles navigateur de `npm run verify`. Comparer images clés, beats, contacts à ±1 frame et strips de transition. Vérifier également seeks répétés, ordre inverse/mélangé et page fraîche. Les comparaisons pixel de REA peuvent compléter une enquête, sans remplacer ces tests du nouveau moteur.
7. Rendre un draft, examiner son rythme, synchroniser les cues depuis le descriptor, puis exporter le master. Consigner ce qui a été réellement ouvert, mesuré et éventuellement écouté dans `docs/VALIDATION.md` ; l’analyse de code seule ne valide pas le film.

Utiliser le [prompt de production](../prompts/07-reverse-engineer.md) pour conduire cette séquence dans Codex. Les commandes de rendu et leurs paramètres restent ceux de [RENDER_CONTRACT.md](RENDER_CONTRACT.md).

## Vérifications réellement effectuées

Le 17 octobre 2026, sous Windows avec Node `24.18.1` :

- Lecture du clone, des options de CLI et des résolveurs de chemins au commit cité ; contrôle de 22 permaliens de ce guide contre les fichiers et plages de lignes du clone.
- Consultation `npm view rea-agents version dist-tags engines bin license repository --json` : version publiée `6.5.0`, package et dépôt concordants.
- Exécution de `rea setup --help` avec le package `6.5.0` : sortie réussie, options Codex et dry-run présentes.
- Exécution réelle du plan avec `npm exec --ignore-scripts --yes --package=rea-agents@6.5.0 -- rea setup --client codex --dry-run --json` : code de sortie `0`, statut `planned`, aucune action appliquée. Le plan proposait uniquement `configure_client:codex` et `install_skill`. L’empreinte du `config.toml` utilisateur était identique avant et après.

Cette première passe était un dry-run : elle n’avait installé ni enregistrement MCP ni skill et n’avait pas encore testé une enquête sur une cible. Elle reste consignée comme étape historique, et non comme état actuel.

### Installation appliquée le 17 octobre 2026

À la demande de l’utilisateur, les commandes suivantes ont ensuite été exécutées :

```sh
npm exec --ignore-scripts --yes --package=rea-agents@6.5.0 -- rea setup --client codex --yes --json
npm exec --ignore-scripts --yes --package=rea-agents@6.5.0 -- rea doctor --client codex --skill --json
```

Le setup a renvoyé `status: ready`, deux actions appliquées : `configured_codex` et `installed_skill`. L’entrée Codex a été configurée et la sauvegarde `~/.codex/config.toml.rea.backup` a été créée. Le workflow a été installé dans `~/.agents/skills/reverse-engineer-anything/`.

Le diagnostic ciblé a terminé avec le code `0` et `healthy: true` : `node`, `registration:codex` et `skill:identity` sont `ok`. Son périmètre est explicitement Codex et le skill, sans provider natif. La valeur globale `environment_healthy: false` concerne les providers natifs non configurés ; ils ne sont pas requis pour l’enquête JavaScript et navigateur du cas pratique. Ce résultat ne prétend donc pas valider Hopper, Ghidra ou d’autres moteurs natifs.

Le package a été provisionné dans le cache npm avec ses scripts de cycle de vie désactivés. Le premier `--yes` appartient à npm ; celui placé après `setup --client codex` applique le setup REA déjà autorisé. Les rapports complets de configuration restent locaux dans `work/rea-install/` : ils ne sont pas des pièces à publier avec la configuration utilisateur. À cette étape, la session d’auteur n’avait pas renouvelé sa liste d’outils MCP ; le premier cas pratique Signal utilisait donc la CLI versionnée.

Un client stdio éphémère a ensuite lancé le launcher installé, `cmd.exe /d /c npx -y rea-agents@6.5.0 mcp`, et réussi `initialize` puis `tools/list` en 2,079 s. Le serveur s’est identifié comme `rea 6.5.0`, protocole `2024-11-05`, avec 207 outils sur une page, dont `inspect_web_page`, `capture_web_screenshot` et `compare_web_screenshots`. Le [rapport expurgé](assets/rea-case/mcp-smoke.json) atteste ce dialogue réel. Il ne prouve pas l’attachement du serveur à la conversation Codex déjà ouverte, ni l’exécution des 207 outils ; le test a arrêté son processus après la découverte.

La génération de nouvelles scènes suit la politique [Astra](ASTRA_WORKFLOW.md). Astra assure l’analyse, la spécification, l’écriture et la critique ; `seek(t)`, Playwright et FFmpeg exécutent ensuite le rendu local sans SDK de modèle ni clé API. Le cœur indépendant et ses limites sont décrits dans [CORE.md](CORE.md), avec ses contrôles dans [CORE_VALIDATION.md](CORE_VALIDATION.md).
