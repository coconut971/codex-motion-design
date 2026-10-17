# L’atelier de l’aube — test publié, résultat artistique insuffisant

17 octobre 2026. Test exploratoire réalisé rapidement avec **GPT-6 Astra,
`reasoning_effort = high`** pour l’auteur, la critique et la QA, avec sélection
explicite du modèle. Ni `max` ni `ultra` n’ont été essayés pour ce film. Le rendu utilise le
cœur local `motion/1`, sans asset généré par un autre modèle, service distant ou
clé API.

**Statut final : échec artistique au regard de la demande de l’utilisateur.**
Les contrôles techniques ci-dessous ont réussi, mais l’utilisateur a ensuite
jugé le rendu très insuffisant, notamment la logique mécanique sous le levier.
Le film est publié avec ses défauts. Il ne constitue pas une démonstration de
qualité studio ou de résultat prêt pour la production. Voir le
[retour humain après livraison](#retour-humain-après-livraison) et les
[limites du test](../LIMITATIONS.md).

Une feuille vierge entre dans une presse ; le plateau descend, l’encre est
révélée à la sortie, puis l’estampe de soleil repose sur la table. Les quatre
plans durent 14 secondes au total. Le descriptor contient 81 objets et cinq
accents sonores synthétiques. Le film ne contient aucun texte.

## Fichiers

- [Descriptor](../../examples/morning-press/project.json),
  [storyboard](../../examples/morning-press/STORYBOARD.md) et
  [revue de l’auteur](../../examples/morning-press/REVIEW.md).
- [Master MP4 publié](../assets/morning-press/film.mp4) et
  [manifest de rendu](../assets/morning-press/film.mp4.manifest.json).
- [Présentation](../assets/morning-press/watch.html),
  [affiche](../assets/morning-press/poster.webp) et
  [aperçu animé silencieux](../assets/morning-press/preview.webp).
- [Rapport de seeks](../assets/morning-press/verify.json) et
  [rapport du lecteur](../assets/morning-press/watch-verify.json).

Les sorties de travail dans `out/` restent locales et ignorées par Git. Les
copies publiées sont conservées dans `docs/assets/morning-press/`. Le lecteur
est accessible sous `/docs/assets/morning-press/watch.html` après lancement de
`node scripts/serve.mjs`. Sur GitHub, le lien HTML affiche le code de la page ;
le MP4 se consulte ou se télécharge directement.
La page démarre muette, propose un bouton de son, les contrôles vidéo natifs,
un lien MP4 et l’aperçu animé. Elle charge le petit MP4 local en mémoire pour
permettre les seeks natifs même avec le serveur statique sans requêtes Range.
Elle ne charge aucun service externe ni outil de suivi.

## Contrôles réellement exécutés

| Contrôle | Résultat et portée |
| --- | --- |
| Suite du dépôt avec intégration de rendu activée | 27 tests réussis, aucun ignoré ; exécutée par l’opérateur |
| `scripts/verify-film.mjs` | 71 temps × cinq parcours × deux adaptateurs, Chrome 155.0.8059.84 à 480 × 270 |
| Canvas | Égalité SHA-256 de tous les octets RGBA sur parcours croissant, décroissant, mélangé, répété et page fraîche |
| SVG | Égalité du DOM complet et du frame partagé ; aucune égalité de pixels Canvas/SVG revendiquée |
| Sous-images actives | Six paires sur six changent les pixels dans une même image de sortie et un même tick de trait |
| Descriptor | SHA-256 du JSON effectivement reçu identique dans chaque page et fichier inchangé en fin de QA |
| Master | 420 images décodées, vidéo et audio décodés sans erreur ; aucune erreur JavaScript ou réseau au rendu |
| Sources | Les 35 fichiers référencés par le manifest ont été contrôlés inchangés par l’opérateur après rendu |
| Présentation | Lecture muette avançant, seek exact à 12,5 s, plage seekable 0–14 s, bouton son et retour vidéo/aperçu fonctionnels |
| Aperçu | WebP 768 × 432, 168 trames, 14 000 ms ; produit à 12 i/s depuis le master |
| Mise en page | Captures desktop et mobile ouvertes ; largeur mobile 390 px sans débordement ; aucune erreur de page ou réseau |

Le script générique a aussi été vérifié sur `core-demo` : 40 temps × cinq
parcours × deux adaptateurs et six paires actives sur six. Sa méthode et ses
options figurent dans [FILM_QA.md](../FILM_QA.md).

La revue visuelle de production a porté sur les quatre compositions, les
contacts, les poses aux coupes et les strips. Trois défauts ont été corrigés
avant le gel : fragment de presse dans le dernier champ, feuille semblant
flotter au-dessus de la table, puis arrêt/reprise brusque au milieu de la sortie.
Les quatre compositions v5 et les neuf poses d’éjection ont été ouvertes après
correction. L’opérateur a ensuite ouvert les atlas décodés du brouillon final
et du master (28 poses chacun, à 2 Hz), ainsi que les images 0 et 419 du master.
Il n’y a alors pas relevé de nouveau défaut principal. La QA de présentation a ouvert
`watch.png` et `watch-mobile.png` : l’estampe finale est visible, le titre et les
commandes restent hors du film.

## Retour humain après livraison

L’utilisateur a ensuite jugé ce rendu **très insuffisant**, avec une logique
mécanique manquante sous le levier. Il estime que Claude aurait fait nettement
mieux. Ce jugement humain final est consigné après la revue de production ; il
ne faut pas lire les observations antérieures comme une acceptation artistique.
La revue et les sources figées du master sont conservées sans modification.

Le code confirme une limite précise : `lever.rotation` et `platen.y`/`shaft.y`
sont des pistes animées séparément, synchronisées par cues, avec des courbes
différentes. Aucune contrainte cinématique ne déduit le déplacement du plateau
du mouvement du levier. L’intention du storyboard — le levier entraîne vis et
plateau — n’est donc pas garantie par la construction du film. La répétabilité
des frames ne démontre pas la crédibilité de cette relation.

Ce test a été exploratoire et rapide. Aucun essai Claude à conditions identiques
ni variante de ce film avec Astra en effort `max` ou `ultra` ne permet ici de
comparer les modèles ou les réglages. À l’issue de cette première production,
des films de 4 à 6 secondes centrés sur une seule action avaient été proposés
comme piste à tester, pas comme capacité démontrée.
Le [bilan des limites](../LIMITATIONS.md) précise les conclusions permises et les
inconnus. Aucun nouveau rendu ni amélioration du film n’a été réalisé pour cette
publication.

### Addendum de clôture — 17 octobre 2026

Un second essai local ultérieur a utilisé Astra `ultra` pour l’auteur, la
critique et la QA, avec six secondes, un plan et une action mécaniquement
contrainte. L’utilisateur l’a également rejeté pour sa pauvreté graphique.
Ses sources et médias ne sont pas publiés ; ce constat reste anonyme.
`max` demeure non testé. Le [rapport de clôture](../EXPERIMENT_REPORT.md)
consigne les deux résultats, le retour de l’utilisateur sur les rendus Claude
vus ailleurs et la décision de mettre le développement en sommeil. Le master,
ses sources et sa revue de production ne sont pas modifiés par cet addendum.

## Paramètres et mesures

Le master est en 1920 × 1080, 30 i/s, 14 s, avec quatre sous-échantillons par
image et shutter de 0,5 intervalle d’image. Les captures sont moyennées en
RGBA sRGB avant encodage. Taille du MP4 : **1 818 063 octets**.

Le WAV contient 672 000 frames d’échantillons stéréo à 48 kHz, soit 14 s.
Sa crête mesurée est −1,00015 dBFS et son RMS −30,2834 dBFS ; aucun échantillon
écrêté. Les cinq accents synthétiques dérivent des cues du descriptor. Le
décodage AAC produit 672 768 frames, soit 14,016 s : les 768 frames supplémentaires
correspondent au padding d’encodage accepté. Les cinq fenêtres de cues ont un
signal décodé non nul. **Le LUFS n’a pas été mesuré.**

SHA-256 du descriptor :
`90e308945ad3cf1b9f17863156a8dd74425b519b525ad6e02ee49f37ebe892c7`.

SHA-256 du MP4 :
`0b452c0bc286c87ca1824b81ad44c0cfcf0af67e02a77ce6abfd11e619ed29bf`.

## Commandes de contrôle et reproduction

Les chemins de Chrome et FFmpeg peuvent être fournis par `CHROME_PATH` et
`FFMPEG_PATH` ou les options correspondantes. Contrôle du film exécuté :

```sh
node scripts/verify-film.mjs --project=examples/morning-press/project.json --out=out/morning-press/verify.json --scale=.25
```

Pour reproduire le master dans un nouveau fichier :

```sh
node scripts/render.mjs --html="/examples/core-demo/index.html?capture=1&project=/examples/morning-press/project.json" --project=examples/morning-press/project.json --samples=4 --out=out/morning-press/rebuild.mp4
```

L’affiche et l’aperçu livrés ont été produits avec FFmpeg local depuis le master :

```sh
ffmpeg -ss 12.5 -i out/morning-press/film.mp4 -frames:v 1 -vf scale=1280:-1 -c:v libwebp -quality 90 out/morning-press/poster.webp
ffmpeg -i out/morning-press/film.mp4 -an -vf fps=12,scale=768:-1 -c:v libwebp -quality 75 -compression_level 4 -loop 0 out/morning-press/preview.webp
```

## Limites

La comparaison RGBA couvre les temps et la résolution du rapport, sur ce
navigateur. Elle n’est pas une preuve universelle de pureté ou d’identité entre
plateformes. Les contrôles SVG portent sur le DOM et l’état, pas sur ses pixels.
Les atlas et strips constituent des observations d’images ; le test de lecture
muette constate la progression du lecteur. **Aucun visionnage intégral à vitesse
réelle ni écoute humaine du son n’est revendiqué.** Le bouton son a été testé
fonctionnellement, sans évaluation perceptuelle de l’accompagnement.
