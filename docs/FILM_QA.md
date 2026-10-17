# Vérifier un film `motion/1`

Le contrôle générique utilise le vrai lecteur et les adaptateurs du dépôt dans
Chrome/Chromium. Il ne modifie ni le descriptor ni le moteur. Exemple :

```sh
node scripts/verify-film.mjs --project=examples/morning-press/project.json --out=out/morning-press/verify.json --scale=.25
```

Utiliser `CHROME_PATH` ou `--chrome=chemin/vers/chrome` si nécessaire. Les seules
autres options sont `--timeout=30000` (millisecondes, au plus 120 000) et la taille
`--scale` (strictement positive, au plus 2). `--project` et `--out` sont requis.
Le descriptor doit rester dans le dépôt. Le rapport JSON désigné est remplacé
par un nouveau rapport uniquement après une passe réussie.

Les temps viennent de `film.qa`, des coupes à ±1 image, du début, de la dernière
image encodée et de l’état à la durée exacte. Le script ajoute jusqu’à deux
paires de sous-images en mouvement par scène : elles appartiennent à la même
image de sortie et au même tick de bouillonnement. La sélection se fait sur les
transformations visibles ; la variation est ensuite mesurée dans les pixels.

Chaque temps est visité dans cinq parcours : croissant, décroissant, mélangé,
répété, puis dans une page fraîche. Pour Canvas, le SHA-256 couvre tous les
octets RGBA, copiés dans un buffer de capture CPU `willReadFrequently` comme
dans le renderer vidéo. La lecture n’affecte ainsi pas le choix de backend du
Canvas source. Le SHA-256 du frame complet et celui du DOM SVG complet sont
également comparés. Le frame partagé doit correspondre entre Canvas et SVG ;
les pixels des deux adaptateurs ne sont pas censés être identiques.

Le corps JSON réellement reçu par chaque page et le fichier encore présent en
fin de passe doivent avoir le SHA-256 initial. Toute édition pendant la passe
invalide le contrôle. Les erreurs JavaScript, requêtes échouées, HTTP ≥ 400 et
requêtes externes sont bloquantes. Navigation, readiness, polices et évaluations
ont des délais ; navigateur et serveur sont fermés dans `finally`.

Ce sont des régressions sur les temps listés, au navigateur et à la résolution
indiqués. Elles ne prouvent ni la pureté universelle du film, ni la qualité
artistique, ni l’absence de collision hors de ces temps. Le SVG est vérifié par
état et DOM, pas par rasterisation. Les résultats ne constituent pas une écoute
du son ou une observation du rythme à vitesse réelle. Les planches, contacts,
brouillon et master restent nécessaires.
