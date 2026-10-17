# Validation exécutée — 17 octobre 2026

Contrôles réalisés sous Windows, Node `24.18.1`, Playwright `1.64.1`, Chrome
`155.0.8059.84`, FFmpeg `N-92722-gf22fcd4483` (build 2018). Ce sont les versions
réellement testées, pas des minima recommandés. La CI Linux possède son propre
contrôle avec le Chromium Playwright installé et le FFmpeg de la distribution.

## Calcul et contrat

`npm run doctor` réussit. Avec `RENDER_INTEGRATION=1`, `npm test` : **14 réussis,
0 échec, 0 ignoré**. Les cas incluent :

- Conditions initiales, équation différentielle et convergence des springs dans
  les trois régimes ; continuité d'une track au repos et refus d'une vitesse
  initiale réappliquée à chaque changement.
- Beats → secondes → frames → échantillons, retiming partagé image/son,
  validation du descriptor et immutabilité des entrées.
- Shutter borné au plan, grille avec offset, arguments invalides, confinement
  serveur et refus d'un symlink qui sort de sa racine.
- Audio déterministe, durée PCM exacte, attaque à zéro et marge en crête.
- Erreur de capture préservant le MP4 précédent, nettoyage du temporaire,
  promesse de readiness bloquée interrompue par une vraie échéance.
- Rendu réel avec son complet jusqu'au cue final ; rejet d'un MP4 volontairement
  tronqué à cinq secondes.

Une copie propre des fichiers préparés pour Git, dans un chemin contenant un
espace, a passé `npm ci`, ces mêmes 14 tests et `npm run verify`. Cette copie
n'a pas réutilisé le `node_modules` du projet initial.

`npm run verify` compare le SHA-256 de **tous les octets RGBA** à 22 instants :
repères, ±1 frame, ouverture/fin et sous-images continues. Après les références
chronologiques, cinq passes réussissent : ordre inversé, mélangé, répété,
après ouverture d'une autre taille, page fraîche. Les captures à 1,234 et
1,235 s diffèrent ; le temps n'est pas arrondi à la frame entière. Les requêtes
externes sont bloquées et aucun asset externe n'est demandé.

[Résultat des probes](assets/verify-evidence.json). Ces sondes ne prouvent pas
tous les temps réels ni l'identité entre différents systèmes de rasterisation.

## Images inspectées et corrections

Les quatre clés à 0,4 / 1,4 / 3,8 / 6,8 s, la planche par beat, le strip dense
1,8–2,2 s, le crop central et la miniature 360 px ont été ouverts visuellement.
Après revue, le cadrage a été agrandi, la trajectoire d'entrée dégagée et le
contour final renforcé. Les preuves ont été rerendues et ouvertes à nouveau.
Voir [REVIEW.md](../REVIEW.md) pour les observations avant/après.

![Images clés vérifiées](assets/keyframes.png)

[Bande du contact](assets/contact.png) · [Miniature 360 px](assets/mobile.png) ·
[Planche décodée du master](assets/decoded-sheet.png)

Des images extraites du MP4 ont également été ouvertes : une grille à deux
images/seconde et les frames exactes 0 et 239. La première et la dernière
reviennent au papier ; le résidu de la fermeture à frame 239 reste très faible.
La grille décodée n'est pas une vérification de chaque frame ni une séquence
étiquetée au frame exact.

## Fichiers effectivement livrés

[signal.mp4](assets/signal.mp4) : **8 s, 1920×1080, H.264 yuv420p, 30 i/s,
240 images**, 710 578 octets. Quatre sous-images par frame, shutter 0,5 frame.
Matrice et primaires BT.709, plage limitée, transfert sRGB conservé et déclaré.
Le blur moyenne des octets sRGB ; il n'intègre pas une luminance linéaire.

Le master a été décodé intégralement avant remplacement de la sortie. L'AAC
stéréo 48 kHz a été redécodé en PCM : **384 000 samples stéréo, 1 536 000 octets,
8,000 s**. Chaque fenêtre sonore possède une énergie non nulle, dont `resolve`
à 6 s (RMS ≈ 0,1062). Les paramètres, empreintes des sources et mesures sont dans
le [manifest livré](assets/render-evidence.json).

La première passe avait un audio tronqué à 5,8667 s par le plafond `-frames:v`.
Ce défaut a été corrigé : le renderer transmet N images puis EOF, borne la durée
globale et contrôle la durée PCM réelle. Le master lié ci-dessus est la passe
corrigée, avec le dernier accent présent.

La mesure `loudnorm` du **fichier livré en entrée du filtre** donne environ
**−17,13 LUFS intégrés**, **−1,00 dBTP**, LRA **2,50 LU**. La sortie filtrée a
été jetée : aucun mastering à −14 LUFS n'est revendiqué. Les valeurs `output_*`
du log ne décrivent pas notre MP4. [Mesure](assets/audio-measurement.json).

Le draft 960×540 a été lancé à vitesse normale dans un élément vidéo Chromium,
en mode muet, et atteint réellement la fin à 8 s sans erreur média.
[Rapport de lecture](assets/playback.json). Cette lecture automatisée ne vaut
ni observation humaine continue ni écoute subjective. L'appréciation visuelle
de l'agent repose sur les captures et strips ouverts ; le son a été contrôlé
techniquement, sans écoute humaine revendiquée.

## REA, provenance et limites

Les six dépôts demandés et REA ont été clonés puis lus à des commits figés.
[Audit et licences](SOURCE_AUDIT.md). Le contenu de la source commerciale reste
exclu. Aucun code, police ou média tiers de ces dépôts n'est embarqué.

REA `6.5.0` : lecture du source, métadonnées npm, aide CLI et setup Codex en
`--dry-run` réellement réussis. Résultat `planned`, zéro action appliquée,
empreinte de la configuration utilisateur inchangée. Aucun serveur MCP ni skill
REA n'a été installé, et aucune enquête REA complète sur une cible n'est prétendue
testée. [Détails et commandes](REA_WORKFLOW.md).

Les articles X originaux demandés n'étaient pas consultables ; les recherches
et URLs candidates sont [consignées](SOCIAL_SOURCES.md), sans attribution technique
inventée. Ce manque documentaire reste explicite.

## Reproduire

```sh
npm ci
npx playwright install chromium
npm run doctor
npm test
npm run verify
npm run sheet
npm run draft
npm run render -- --samples=4
```

Activer `RENDER_INTEGRATION=1` pour les trois tests d'intégration ; renseigner
`CHROME_PATH` / `FFMPEG_PATH` si les exécutables ne sont pas à leur emplacement
attendu. Pour des sorties existantes, ajouter `--overwrite`. Les manifests
locaux enregistrent les entrées du rendu. Une modification du code, du projet
ou des versions demande de nouvelles captures et une nouvelle validation.
