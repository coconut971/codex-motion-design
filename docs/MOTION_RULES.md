# Règles de motion design adaptées à GPT

Le [cœur motion/1](CORE.md) exécute ces règles avec un descriptor unique.
Ses retargets préservent position/vitesse même lors d'un changement de fréquence
ou ζ ; la cubic utilise une bissection bornée. Les secondes compilées restent
canoniques : le champ beat dérivé n'est pas reconverti pour le son, afin d'éviter
un déplacement d'un échantillon audio aux frontières d'arrondi. Les coupes
proviennent des plans, les masques et caméras sont évalués au temps courant.
Les adaptateurs Canvas/SVG réécrivent chaque état et partagent la même géométrie.

Ce document formalise notre adaptation originale. Les méthodes observées et les
différences avec les six dépôts sont dans [SOURCE_AUDIT.md](SOURCE_AUDIT.md).
Il ne suffit pas de remplacer un nom de modèle dans un prompt : les contrats
doivent être exécutables, les corrections visibles et les preuves explicites.

## Une image est une fonction du temps

`frame = F(t, project, seed, dimensions, localAssets)`. Le résultat de `seek(4)`
ne dépend jamais d'un ancien `seek(3)`. Un objet écrit sa transform, sa couleur,
son alpha et sa visibilité à chaque appel. Un cache immuable de géométrie ou de
grain est permis si sa clé contient toutes ses entrées. Une simulation nécessaire
peut être pré-calculée avec seed et pas fixe, puis échantillonnée, sans dépendre
de l'ordre des appels du renderer.

Le temps du film est en secondes continues. `n/fps` appartient au renderer ; une
propriété discrète, telle qu'un chiffre, peut lire la frame de sortie séparément
si le projet l'exige. Ne mélange pas deux caractères en calculant leur contenu
depuis les sous-images du shutter. Notre exemple sans texte évite ce cas.

## Springs : une physique définie

Pour une cible unitaire constante :

```
x'' + 2 ζω x' + ω² x = ω²
ω = 2π frequencyHz
ζ = damping / (2 √(stiffness × mass))
```

`lib/motion.mjs` calcule les trois régimes au temps absolu, avec position initiale
zéro et vitesse initiale configurable. Pour ζ<1 et vitesse nulle :

```
x(t) = 1 − exp(−ζωt) [cos(ωd t) + ζω/ωd sin(ωd t)]
ωd = ω √(1−ζ²)
```

Omettre le terme sinus change la vitesse initiale. Remplacer tous les ζ>1 par
la solution critique change le temps de réponse. Nos tests vérifient les
conditions initiales, l'équation différentielle, les trois régimes et la
continuité des changements de cible via superposition (`springTrack`).

| Usage de départ | Fréquence | ζ | Intention |
| --- | --- | --- | --- |
| Petit accent | 4 Hz | 0,85 | Vif, très peu de dépassement |
| Fragment de papier | 2,3 Hz | 0,8 | Souple, amortissement lisible |
| Masse lourde | 1,7 Hz | 1 | Sans rebond |
| Fermeture retenue | 2 Hz | 1,4 | Suramortie, lente |

Ces valeurs sont des points de départ. Ne confonds pas Hz et rad/s. Si un objet
doit respecter une limite géométrique, planifie un mouvement contraint ; couper
brutalement un spring par `clamp` casse sa vitesse et son intention physique.

## Banned list : retirer les automatismes

| Automatisme à éviter | Décision à prendre à la place |
| --- | --- |
| Texte central qui apparaît sur gradient violet/bleu | Une composition et une palette motivées par le sujet |
| Néon, chrome, verre et glow sur tous les objets | Une matière dominante, un éclairage cohérent |
| Particules, confettis et compteurs décoratifs | Un mouvement qui explique une cause ou une transformation |
| Grille de cartes identiques pour chaque brief | Une métaphore et une silhouette propres au produit |
| Même ease et même bounce pour tout | Poids, fonction et retard différents |
| Caméra qui zoome en permanence | Une caméra servant le cadrage et la lecture |
| Tout se déplace simultanément | Un foyer d'attention, secondaire décalé |
| Logo seul sur noir puis effets sans payoff | Setup, transformation, conséquence, tenue finale |
| Faux chiffres, faux témoignages, marque OpenAI implicite | Faits sourcés, données illustratives déclarées dans le brief |
| Nouvel objet apparu sans entrée ni sortie | Continuité, occlusion, trajectoire ou raccord visible |

Une exception artistique demandée est possible : note sa fonction dans le
storyboard. La liste combat le résultat interchangeable, pas une technique
interdite dans tous les styles. Grain ou pastel ne rendent pas automatiquement
un film original.

## Beat grid et synchronisation

Beats indexés depuis zéro. `seconds = beatOffset + beat × 60/bpm`.
Un bar contient `beatsPerBar` beats. Le JSON est l'unique propriétaire des cues.
Un cue donne le contact visuel et le début demandé du son. Dans cet exemple,
120 BPM et 30 i/s donnent 15 images/beat ; le contact au beat 4 est à 2 s,
frame 60 et échantillon WAV 96000.

À 110 BPM, un beat tombe souvent entre deux images. Choisis explicitement :
garder le temps musical exact ou arrondir le cue visible à `round(t*fps)/fps`
et dériver aussi le son de ce cue compilé. N'arrondis jamais la scène entière.
Pour une piste enregistrée, relève des beats réels et le décalage du départ ;
le BPM moyen ne prouve pas la position du drop ni l'absence de dérive.

Notre son est synthétisé en local à 48 kHz stéréo. La forme d'enveloppe implique
un début à zéro puis une attaque de 4 ms : début demandé et pic perceptuel ne
sont pas interchangeables. Pour un SFX externe, mesure son pic et place le
début à `cue − peakOffset`, en vérifiant début de film et trims. Le mix ne doit
pas masquer les contacts par un whoosh générique. Garde du silence. Ne vise pas
−14 LUFS par défaut sur une composition à quelques accents : mesure d'abord.

## Critique par images et par temps

1. Quatre images : ouverture, action, transformation, payoff. Vérifier hiérarchie,
   silhouette, marges et palette avant de financer un rendu complet.
2. Planche : chaque beat et offsets utiles entre les beats. Une planche clairsemée
   peut manquer un flash d'une seule frame ; la compléter aux raccords.
3. Contacts : frame précédente, contact, suivante ; strip dense, crop local,
   trajectoire et timing. Le son doit référencer ce même événement.
4. Miniature 360 px : la forme et, si demandé, le texte principal doivent tenir.
5. `REVIEW.md` : frame, défaut observé, importance, correction, fichier de preuve,
   résultat après correction. Traiter les trois défauts les plus importants.
6. Brouillon à vitesse réelle puis master décodé : rythme, temps de compréhension,
   fermeture, texture temporelle et synchronisation. Une grille de frames ne
   remplace pas une lecture, une waveform ne remplace pas une écoute.

Un score facultatif aide à comparer deux passes, sans certifier une qualité.
Le critique décrit ce qui se voit et se mesure. Si rien n'est à corriger, il
documente les observations utiles au lieu d'inventer dix défauts.
