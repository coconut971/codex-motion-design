# Limites constatées

Le film [L’atelier de l’aube](assets/morning-press/film.mp4) est publié comme un
test exploratoire au résultat artistique insuffisant. Il a été réalisé rapidement
avec **GPT-6 Astra, `reasoning_effort = high`**, pour l’auteur, la critique et la
QA. Ce réglage décrit cette session ; il ne constitue pas une recommandation.
Les efforts `max` et `ultra` n’ont pas été essayés dans ce test.

Le cadre est précis : 14 secondes, quatre plans, 81 objets dessinés et cinq
accents sonores synthétiques, décrits en JSON dans le moteur local `motion/1`.
Il s’agit d’un film calculé avec les formes et pistes de ce moteur, sans modèle
de génération vidéo. Le [dossier du cas](cases/morning-press.md) conserve les
paramètres, les contrôles et leurs limites.

## Ce qui a échoué

Après la revue de production, l’utilisateur a jugé le rendu **très insuffisant**,
en particulier la logique mécanique sous le levier. Cette appréciation finale
prend le pas sur l’impression favorable de la revue précédente pour décider
si ce film répond à sa demande. Le master est conservé tel quel pour montrer
le résultat effectivement obtenu.

Le [descriptor](../examples/morning-press/project.json) permet de préciser le
défaut : la rotation du `lever` et la translation du `shaft` et du `platen`
suivent des pistes distinctes, avec des courbes différentes. Elles partagent
des événements temporels, mais le [calcul du frame](../core/film.mjs) n’impose
aucune relation cinématique entre elles. Le storyboard annonçait un levier qui
entraîne vis et plateau ; la réalisation ne garantit pas cette causalité
mécanique. Des positions reproductibles peuvent donc produire une action peu
crédible.

Les 27 tests réussis, les sondes de seeks sur 71 temps × cinq parcours × deux
adaptateurs et les six paires de sous-images actives vérifient des propriétés
techniques. Ils ne prouvent ni la justesse mécanique, ni le rythme, ni la qualité
artistique. La critique par images et strips n’a pas suffi à relever le défaut
signalé ensuite par l’utilisateur. La [revue originale](../examples/morning-press/REVIEW.md)
reste inchangée : le [retour humain ultérieur](cases/morning-press.md#retour-humain-après-livraison)
est un addendum, pas une réécriture de l’historique.

## Ce que ce test permet de conclure

Ce résultat ne répond pas à l’exigence artistique de l’utilisateur. Le processus
de critique employé ici n’a pas suffisamment évalué la causalité de l’action.
Le dépôt fournit un moteur et des contrôles exécutables ; ce cas ne démontre pas
qu’il permet d’obtenir de manière fiable un film prêt pour la production.

L’utilisateur estime que Claude aurait fait nettement mieux. C’est son
appréciation, pas le résultat d’une comparaison contrôlée : aucun essai Claude
avec le même brief, le même moteur et le même budget de travail n’a été réalisé.
Un essai Astra en effort `high` ne permet pas de conclure à une incapacité générale
de GPT, à une supériorité générale de Claude ou à la nécessité d’attendre une
mise à jour d’OpenAI. L’effet d’autres niveaux d’effort, d’un autre brief ou d’une
autre méthode de construction reste inconnu.

Une piste serait de tester des images animées ou des films de **4 à 6 secondes**,
avec une seule action simple, pour réduire la difficulté de composition et de
continuité. Cette piste n’a pas été validée ; une durée plus courte ne garantit
ni compréhension mécanique ni meilleur résultat. Aucun nouveau rendu ni
correction du film n’accompagne ce constat.
