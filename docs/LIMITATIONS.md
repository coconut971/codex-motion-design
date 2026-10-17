# Limites constatées et arrêt de l’expérimentation

**L’objectif visuel du projet n’est pas atteint ; le développement est mis en
sommeil.** Deux essais créés avec GPT-6 Astra, en efforts `high` puis `ultra`,
ont été rejetés par l’utilisateur. Les contrôles techniques réussis ne valent
pas acceptation artistique. Le [rapport de synthèse](EXPERIMENT_REPORT.md)
documente le périmètre, les résultats et la décision de clôture.

## Premier essai : mécanique et rendu insuffisants

Le film [L’atelier de l’aube](assets/morning-press/film.mp4) reste publié comme
un test exploratoire au résultat artistique insuffisant. Il a été réalisé
rapidement avec **GPT-6 Astra, `reasoning_effort = high`**, pour l’auteur,
la critique et la QA. Il dure 14 secondes, comporte quatre plans, 81 objets
dessinés et cinq accents sonores synthétiques dans le moteur local `motion/1`.
Le [dossier du cas](cases/morning-press.md) conserve ses paramètres et contrôles.

L’utilisateur a jugé le rendu très insuffisant, en particulier la logique
mécanique sous le levier. Ce jugement final prend le pas sur l’impression
favorable de la revue de production. Le master et ses sources restent figés
pour conserver le résultat effectivement obtenu.

Le [descriptor](../examples/morning-press/project.json) anime `lever.rotation`,
`shaft.y` et `platen.y` par des pistes distinctes et des courbes différentes.
Des événements communs synchronisent leurs temps, mais le
[calcul du frame](../core/film.mjs) n’impose aucune relation cinématique.
Le levier ne détermine donc pas le déplacement du plateau, contrairement à
la causalité annoncée dans le storyboard.

Les 27 tests réussis, les sondes sur 71 temps × cinq parcours × deux adaptateurs
et les six paires de sous-images actives vérifient des propriétés techniques.
Ils ne prouvent ni la justesse mécanique, ni le rythme, ni la qualité artistique.
La critique par captures et strips n’a pas suffi à relever le défaut signalé
ensuite par l’utilisateur. La [revue originale](../examples/morning-press/REVIEW.md)
reste inchangée ; le retour humain ultérieur est documenté dans le dossier du cas.

## Second essai : simplification insuffisante

Un essai local ultérieur a employé **Astra `ultra`** pour l’auteur, la critique
et la QA : six secondes, un plan, une seule action simple. Une construction
rigide et des contrôles mécaniques ciblés ont répondu au problème de liaison.
La vérification a couvert 25 temps × cinq parcours × deux adaptateurs en
1920 × 1080 et deux paires de sous-images.

L’utilisateur a néanmoins jugé le résultat graphique extrêmement pauvre et
l’a refusé. Le raccourcissement du film et la contrainte mécanique n’ont donc
pas fourni le résultat artistique attendu. La piste « quatre à six secondes,
une action » n’est plus une suggestion non essayée : cet essai l’a explorée
sans succès. Ses sources, images et vidéos restent hors publication ; seul
ce constat anonyme est rapporté.

## Portée du bilan

Le blocage créatif est constaté **dans cette configuration de projet avec
Astra**. La critique des agents a été trop indulgente face au niveau attendu.
Le moteur fournit des primitives et des pistes, sans catalogue visuel, rigs
expressifs ni solveur mécanique général. Les chemins autorisent des dessins
arbitraires, mais leur richesse restait à construire. Aucune mesure ne permet
d’isoler la contribution de ce cadre de celle du modèle.

L’utilisateur rapporte avoir vu ailleurs des rendus de **Claude Opus 5.5**
extrêmement meilleurs et estime que les capacités d’Astra constituent le
blocage, quel que soit le niveau d’effort. Ce retour est un témoignage
expérientiel qui motive sa décision d’arrêter. Aucun comparatif Claude à brief,
moteur et budget identiques n’a été exécuté ici. Les versions des modèles
utilisés par les dépôts étudiés n’ont pas fait l’objet d’un inventaire exhaustif.

Les efforts `high` et `ultra` ont été testés sur deux briefs différents ;
**`max` n’a pas été testé**, ni l’ensemble des autres efforts. On ne peut donc
pas mesurer l’effet propre de l’effort ou conclure à une incapacité universelle.
Ces limites de comparaison ne changent pas l’échec du projet à satisfaire
l’utilisateur.

Le dépôt est conservé comme expérimentation de reverse engineering et
d’adaptation de workflows Claude vers GPT, sans promesse de production.
Aucun nouveau film ni développement n’est programmé. Une reprise exige une
demande explicite de l’utilisateur et une validation humaine du résultat.
