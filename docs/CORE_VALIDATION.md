# Validation du cœur — 17 octobre 2026

Projet : `examples/core-demo/project.json`, **La graine et le pli**. Runtime
local : Node 24.18.1, Chrome 155.0.8059.84, Playwright 1.64.1 verrouillé, FFmpeg
fourni localement. Film de 10 s, 1920×1080, 30 i/s, 300 images. Draft 960×540.
Aucune dépendance modèle, CDN, police ni média externe. Auteur : GPT-6 Astra.

## Contrôles effectivement exécutés

| Contrôle | Résultat observé |
| --- | --- |
| `npm test` avec `RENDER_INTEGRATION=1` | **27/27 tests réussis, aucun ignoré** ; 18 tests historiques et 9 tests du cœur |
| `node --test tests/core*.test.mjs` avec `RENDER_INTEGRATION=1` | 9 tests réussis : cubic difficile, ODE trois régimes, retarget x/v avec nouveaux Hz/ζ, timeline/audio/cuts, état pur, validation, silence, secondes canoniques, navigateurs |
| `npm run core:verify` | 27 poses × 2 adaptateurs × 5 ordres/pages : mêmes pixels dans chaque adaptateur ; mêmes états et bounds entre Canvas et SVG |
| Reset des adaptateurs | Styles filter/display/transform/origin contaminés et clip Canvas contaminé sont effacés ; résultat pixel identique après seek |
| Isolation | Autre page à une autre taille sans contamination ; deux SVG ont des ids de clip distincts |
| Sous-images | 2,001 et 2,002 s donnent des images distinctes dans les deux adaptateurs |
| Temps canoniques | Deux régressions de demi-échantillon à 123 BPM passent ; enquête indépendante : 80 cas à 4 BPM sans désaccord après correction |
| Audio synthétisé | 48 kHz stéréo, 480000 frames PCM, 4 accents, crête −1,000 dBFS, RMS −29,254 dBFS, aucun sample saturé |
| Draft avec audio | 300 frames encodées, décodage validé, durée image/son contrôlée par le manifest |
| `npm run core:render -- --samples=4 --overwrite` | Master 1920×1080, 30 i/s, 300 frames décodées ; 4 sous-images, shutter 0,5 frame ; aucune erreur de page/réseau |
| Audio du master décodé | 480256 frames PCM à 48 kHz, soit 10,005333 s : 256 échantillons de padding AAC, quatre fenêtres de cues non muettes |

Le script de vérification rejette les erreurs de page/réseau, ressources
externes et dépassements de readiness/fonts ; il ferme navigateur et serveur
dans `finally`. La version du code et le descriptor sont inclus dans les hashes
du manifest de rendu, y compris `core/`. Les résultats complets sont produits
dans `out/core-verify.json` et dans les manifests adjacents aux exports.

Preuves publiées : [film MP4](assets/core/film.mp4),
[manifest de rendu](assets/core/film.mp4.manifest.json) (seuls les chemins de
sortie absolus sont remplacés par des chemins relatifs), et
[vérification compacte](assets/core/verification.json) avec hashes PNG et état
par pose. La comparaison d'état porte sur scène, caméra, objets, styles,
géométrie et bounds ; le grain est aussi couvert par les captures PNG.

Le master pèse 684550 octets. SHA-256 :
`d609a016a4eee9531fb3641aa99804dd117480006c054896e7d594cc41189ccb`.
Le descriptor final utilise LF, identique à sa version Git ; SHA-256 :
`8c0e9a4123a2c1306ca63515fa3142b2a4eeb79f95c02c2dd8017d573f3cee80`.

## Inspection réelle des images

Les quatre premières compositions (0,6 / 2,9 / 4,1 / 8,5 s) ont été ouvertes.
Elles ont révélé une feuille flottante à 4,1 s. Correction : montée de la tige
contact→unfold, apparition de la feuille unfold→unfold+0,15 s. Le
[crop après correction](assets/core/leaf-fix.png), aux temps 4,1 / 4,5 / 4,6 / 4,7 s,
a été ouvert : la tige rejoint la feuille avant son retarget.

La [bande de contact](assets/core/contact-strip.png) de 13 poses a été ouverte.
La graine descend dans le bol, le bord avant masque sa base, puis elle se
stabilise. Les contours restent lisibles à la taille inspectée.

La [planche extraite du draft encodé](assets/core/draft-decoded.png), 20 poses à
2 Hz, a été ouverte. Elle montre l'attente, l'arc continu, le contact, les feuilles
asymétriques, le retour large et la tenue finale. Aucun nouveau défaut principal
n'a été relevé dans ces poses. La [revue du film](../examples/core-demo/REVIEW.md)
documente la correction sans inventer de défauts supplémentaires.

La [planche extraite du master](assets/core/master-decoded.png), 20 poses à 2 Hz,
et ses [frames 0 et 299](assets/core/master-ends.png) ont ensuite été ouvertes.
L'entrée est un papier plein ; la dernière image tient la plante visible.
Composition, masque et feuilles restent lisibles. Aucun nouveau défaut principal
n'a été relevé dans ces images du fichier encodé.

## Limites

La planche décodée ne constitue pas une lecture vidéo continue. Le son a été
généré et mesuré, sans écoute attestée. Les mesures sont crête/RMS, pas LUFS.
Les pixels ne sont comparés qu'au sein d'un même adaptateur/navigateur ; les
rasterisations Canvas/SVG peuvent différer. Les bounds sont les enveloppes
conservatrices des points de contrôle, sans stroke ni clipping. Les probes ne
prouvent pas tous les temps ou toutes les plateformes. Les paramètres de spring
extrêmes proches des limites flottantes (par exemple ζ de 10^155) ne font pas
partie du domaine numérique validé ; les paramètres du film restent de 0,72 à
1,15 pour ζ. L'export SVG/DOM/WebGL générique n'est pas livré.
