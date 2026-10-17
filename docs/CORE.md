# Cœur motion/1

Le cœur original compile un JSON en images indépendantes. Aucun SDK de modèle,
aucune simulation accumulée, aucun service de rendu ou média distant. Astra
écrit la direction et le descriptor ; le calcul s'exécute ensuite localement.

```js
import {compileFilm} from './core/film.mjs';
import {canvasAdapter, svgAdapter} from './core/adapters.mjs';
const film = compileFilm(descriptor);
const adapter = canvasAdapter(canvas, {scale: .5});
// Ou svgAdapter(svg, {scale: .5, idPrefix: 'my-film'}).
const frame = film.sample(4.123);
adapter.render(frame);
```

`sample(t)` renvoie un frame gelé : temps, scène, caméra, objets persistants,
géométrie, styles, masques, transition et grain. Le même temps produit le même
état après n'importe quel seek. L'adaptateur Canvas réinitialise son buffer et
son contexte ; l'adaptateur SVG remplace ses attributs racine et son graphe DOM.
Il ne reste aucun display, filtre, clip ou transform d'un frame antérieur.
`idPrefix` est obligatoire pour plusieurs SVG : donner un identifiant stable
unique par instance (l'id de la racine est utilisé par défaut).

`film.project` respecte le contrat existant de capture et d'audio.
`film.cuts` vient des frontières des scènes ; `film.cues` contient leurs temps
compilés ; `film.qa` référence ces mêmes cues. `core/project.mjs` est le loader
compatible des commandes audio/rendu. `lib/project.mjs` reste inchangé pour
Signal et son cas REA. Les scènes Signal historiques continuent à fonctionner.

## Descriptor

La [démo complète](../examples/core-demo/project.json) sert d'exemple.

```json
{
  "schema":"motion/1", "id":"my-film",
  "width":1920, "height":1080, "fps":30, "duration":10,
  "seed":61, "bpm":120, "beatOffset":0, "beatsPerBar":4,
  "palette":{"paper":"#F1E8D7","ink":"#394953","clay":"#C8795E"},
  "cues":[{"id":"contact","at":{"beat":8}}],
  "scenes":[{"id":"wide","start":0,"end":10}],
  "objects":[{
    "id":"seed", "geometry":{"type":"ellipse","rx":50,"ry":60},
    "x":{"keys":[{"at":0,"value":300},{"at":{"cue":"contact"},"value":1100,"ease":[0.2,0.7,0.3,1]}]},
    "y":600, "fill":"clay"
  }],
  "qa":[{"id":"contact","at":{"cue":"contact"},"object":"seed"}]
}
```

Un temps est un nombre en secondes, ou un objet avec **une** unité :
`{seconds: 1.2}`, `{beat: 4}`, `{frame: 60}` ou `{cue: 'contact', offset: -.1}`.
L'offset est en secondes. `snap:'frame'` arrondit ce cue seul à la grille image ;
il ne quantifie jamais `sample(t)`. Les cues sont des temps de base, sans
références circulaires ; pistes, scènes et QA peuvent les référencer. Les
scènes doivent couvrir exactement `[0,duration]` sans vide ni chevauchement.
Une frontière appartient à la scène entrante ; `duration` permet l'inspection
de l'état final, sans ajouter d'image au master. Ne fournir aucune liste `cuts`.

Une cue peut porter `sound:{hz,gain,duration,pan}` selon le contrat de synthèse
existant. Le même temps compilé alimente l'image, le WAV et la QA. Une modification
invalide les sorties correspondantes ; aucun fichier audio séparé ne possède
des temps manuels. Un film silencieux reste valide.

Les secondes de `film.project.events[].at` restent exactement celles compilées
des cues. Le `beat` dérivé sert aux métadonnées ; ne pas passer ce projet déjà
compilé au compilateur legacy pour reconvertir ses beats. Consommer directement
`film.project`, comme le font le renderer et la synthèse audio. Cela préserve les
frontières d'arrondi à un demi-échantillon même pour un BPM hors grille.

## Pistes et géométrie

Les propriétés `x`, `y`, `rotation` (degrés), `scaleX`, `scaleY`, `opacity` sont
soit des constantes, soit des pistes. Les keyframes sont strictement ordonnées ;
avant/après la piste, la valeur est tenue. Le `ease` de la keyframe d'arrivée
contrôle son intervalle : `linear`, `smooth`, `hold`, ou `[x1,y1,x2,y2]` cubic.
La résolution cubic utilise une bissection bornée, y peut dépasser [0,1].

```json
{"spring":{
  "initial":0, "velocity":0, "frequencyHz":2, "dampingRatio":0.8,
  "targets":[
    {"at":{"cue":"contact"},"value":100},
    {"at":{"cue":"retarget"},"value":30,"frequencyHz":3,"dampingRatio":1.4}
  ]
}}
```

La compilation calcule position **et vitesse** à chaque retarget puis résout
analytiquement le segment suivant, y compris si fréquence ou amortissement
changent. Les trois régimes sont distincts. Une vitesse initiale peut être
non nulle ; les unités sont propriété/seconde, Hz et ratio ζ. Aucun pas fps.
Les fonctions historiques de `lib/motion.mjs` restent disponibles et testées.

Géométrie : `ellipse` (`rx`, `ry`, `cx`, `cy`), `rect` (`x`, `y`, `width`,
`height`) ou `path` avec commandes `M`, `L`, `C`, `Q`, `Z`. Tous les tracés sont
compilés en commandes partagées. `fill`/`stroke` acceptent une clé de palette,
une couleur hex ou `none`. `strokeWidth` et `boil` sont des nombres logiques.
Le contour varie à 12 Hz avec seed/id stables ; la trajectoire reste continue.

`trajectory:{points:[[x0,y0],[x1,y1],[x2,y2],[x3,y3]],progress:track,orient:true}`
ajoute une trajectoire cubic à x/y ; l'orientation suit sa tangente si demandée.
Ce paramétrage n'est pas une vitesse d'arc constante. Les bounds retournées
sont les enveloppes conservatrices des points de contrôle transformés, sans
épaisseur de trait ni intersection avec les masques. Elles sont identiques
entre adaptateurs, pas nécessairement égales au rectangle des pixels peints.

## Plans, caméra, masques

Chaque scène peut choisir `objects:[ids]` ; les autres objets restent présents
dans le frame avec `visible:false`, conservant identité et pistes globales.
L'ordre de `objects` dans le descriptor est l'ordre de peinture.

`camera:{x,y,zoom}` accepte les mêmes pistes ; zoom positif s'interpole en
logarithme, et n'accepte pas les springs qui pourraient traverser zéro. La
caméra est calculée depuis le temps courant, jamais depuis le dernier rendu.
`mask` sur une scène ou un objet accepte une géométrie **en coordonnées monde**,
avant le transform local de l'objet. `transition:{type:'fade'|'wipe',duration,
colour:'paper'}` couvre l'écran à l'entrée puis révèle le plan ; durée en
secondes. Les frontières de plans limitent le shutter même avec un volet.

## Lecture et export

```sh
npm run core:sheet
npm run core:verify
npm run core:draft
npm run core:render -- --samples=4
npm run core:audio
```

Après `npm run studio`, ouvrir `/examples/core-demo/index.html` ou la variante
`?adapter=svg`. Le lecteur accepte `?project=/path/to/descriptor.json` sur le
même serveur : un autre film nécessite un autre JSON, aucun code de scène.
En export, fournir ce même chemin à `--project` et à la query `project` ; le
renderer refuse tout désaccord entre son descriptor et celui de la page.

L'export vidéo livré capture **Canvas 2D**. Le SVG est un adaptateur DOM
consultable et testé, pas une promesse de capture de HTML/WebGL arbitraire.
La QA compare états et bounds entre adaptateurs, et pixels répétés au sein de
chacun. Les rasterisations Canvas/SVG peuvent différer. Les mesures et limites
de la démo sont dans [CORE_VALIDATION.md](CORE_VALIDATION.md).
