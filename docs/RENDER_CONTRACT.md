# Contrat de rendu

## Cœur motion/1

`core/film.mjs` compile le descriptor unique en `sample(t)` pur et continu.
`core/adapters.mjs` rend ce frame complet en Canvas 2D ou en SVG DOM. Les masques
sont en coordonnées monde ; la caméra dépend uniquement du temps courant.
Les coupes sont dérivées des scènes, jamais d'un second tableau. Le loader
`core/project.mjs` sélectionne `motion/1` ou le contrat legacy inchangé.

La page `/examples/core-demo/index.html?capture=1` respecte la même interface
`__motionReady`, `film.project`, `seek(t)` et `#film` Canvas que Signal.
La variante `?adapter=svg` réécrit tout le DOM et les styles à chaque frame ;
les ids de clips sont préfixés par une identité stable propre à l'instance.
Elle est vérifiée par screenshots, mais l'exporteur vidéo courant capture
Canvas uniquement. Ne pas passer la variante SVG au renderer Canvas.

`npm run core:verify` compare états et bounds entre les deux adaptateurs,
pixels avant/après seeks mélangés et page fraîche dans chacun, état contaminé
réinitialisé, deux tailles isolées et clips multi-instances. Readiness/fonts
possèdent un délai borné. Les manifests incluent aussi les sources de `core/`.
Voir [CORE.md](CORE.md) pour le schema et [CORE_VALIDATION.md](CORE_VALIDATION.md)
pour les résultats effectivement exécutés.

## Interface de l'exemple

Serveur HTTP local : `examples/signal.html?capture=1&scale=0.5`.
Le module expose :

```js
await window.__motionReady;       // projet et initialisation terminés
await document.fonts.ready;
window.film.project;              // compileProject(project.json)
window.seek(2.0);                 // dessine toute l'image, sync
document.querySelector('#film');  // Canvas 2D, dimensions projet × scale
```

`seek` rejette les temps non finis et borne les temps hors film à `[0,duration]`.
Le frame de sortie n est à `n/fps`, n dans `[0, frameCount−1]`. Le temps final
`duration` est inspectable mais ne produit pas une frame supplémentaire.
Les coordonnées logiques restent 1920 × 1080 ; seul le backing buffer change.
Le projet est validé côté Node et côté navigateur. Les ids de cues sont uniques.

Pour un autre film, adapter l'entrée HTML dans le renderer ou conserver cette
interface. Le renderer fourni vise Canvas 2D. Il ne sait pas mélanger un DOM ou
un WebGL arbitraire : une extension devra définir une capture compatible et
ses tests. Aucune magie multi-runtime n'est promise.

## Captures

Le renderer attend readiness, fonts et deux rAF à l'initialisation. Chaque seek
Canvas 2D est ensuite lu synchroniquement par `getImageData`, sans attendre une
présentation d'écran. Pour un futur renderer DOM, une barrière de présentation
par capture devra être définie. Les rAF ne sont jamais une horloge de scène. Les erreurs de page,
requêtes échouées et retours HTTP en erreur sont fatals. Les médias de l'exemple
sont entièrement locaux. La capture vise uniquement le canvas ; l'interface du
lecteur et les labels QA ne sont pas dans le film.

Un master possède `duration × fps` frames et une cadence constante. Le draft
change la résolution, conserve la cadence et les coordonnées logiques. Un
crop est exprimé en coordonnées logiques puis converti à l'échelle de sortie.
Les labels des planches indiquent temps et numéro de frame ; ce lettrage sert
uniquement à la revue, sans ajouter de titrage à l'animation.

## Sous-images

Pour S samples et shutter h (fraction de frame), on échantillonne aux centres
de S sous-intervalles autour de n/fps :

```
t(n,j) = n/fps + ((j+0.5)/S − 0.5) × h/fps
```

Les bornes du film et les cuts déclarés en secondes limitent ces temps au même
plan que la frame centrale. Pas de mélange temporel entre deux frames de sortie
ni à travers un cut. Chaque sous-image est un nouveau seek absolu. Le mélange
Canvas moyenne les octets RGBA sRGB ; c'est une approximation en espace encodé,
pas une intégration lumineuse linéaire. 4 samples améliorent les déplacements
rapides sans garantir une reproduction physique du shutter.

## Encodage et preuves

Playwright capture le canvas, Node fournit les PNG à FFmpeg avec backpressure.
Le MP4 H.264 yuv420p possède une matrice et des primaires BT.709 explicites,
une plage limitée et un transfert sRGB conservé (`iec61966-2-1`), une cadence
fixe et un audio AAC dérivé du WAV. Il ne transforme pas la courbe sRGB vers la
courbe de transfert BT.709. La compatibilité couleur reste dépendante
du lecteur et de l'écran. Un fichier temporaire est décodé avant remplacement
du master. L'audio encodé est aussi décodé en PCM binaire : sa durée doit couvrir
le film (avec au plus un paquet AAC de padding). L'énergie de chaque fenêtre
sonore est mesurée et consignée ; le test d'intégration vérifie notamment le
dernier cue de l'exemple. Le renderer transmet exactement N images
puis EOF ; un plafond `-frames:v` peut tronquer l'audio avec certains encodeurs
et n'est donc pas utilisé. Un code de sortie FFmpeg non nul ne peut jamais
produire un succès.

Le manifest adjacent à chaque sortie enregistre dimensions, cadence, frames,
samples, shutter, projet, versions et mesures disponibles. Les probes de
déterminisme hachent tous les pixels RGBA, dans différents ordres et sur une
page fraîche. Elles comparent l'environnement courant : des GPU/versions de
Chromium différents peuvent rasteriser autrement. Elles ne prouvent ni tous
les temps réels ni la qualité artistique.

Ne déduis pas la présence du son d'un nom `.mp4`, ni sa qualité d'une crête
normalisée. Décode les deux flux, inspecte les frames extraites du fichier
encodé et écoute si l'environnement le permet. Consigne toutes les limites.
