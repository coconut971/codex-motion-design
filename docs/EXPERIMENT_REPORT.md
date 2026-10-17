# Bilan technique de l’expérimentation

17 octobre 2026 — **projet mis en sommeil à la demande de l’utilisateur**.

L’objectif visuel a échoué. L’adaptation de workflows de motion design associés
à Claude vers GPT-6 Astra a produit une chaîne de rendu contrôlable, mais aucun
des deux essais de création évalués par l’utilisateur n’a atteint son exigence.
Le premier souffre notamment d’une causalité mécanique peu crédible ; le second,
volontairement simplifié, reste graphiquement extrêmement pauvre à ses yeux.
Le blocage créatif avec Astra dans notre configuration motive l’arrêt du
développement. Les tests techniques réussis ne diminuent pas ce constat.

## Périmètre et hypothèse

Ce rapport est limité au dépôt `codex-motion-design`.

Le dépôt est une **expérimentation de reverse engineering et d’adaptation de
workflows**, pas un outil de production validé. L’hypothèse était qu’une enquête
sur les méthodes disponibles, transcrite en règles de direction, storyboard,
temps absolu, critique par images et rendu local, permettrait à GPT de produire
des films convaincants.

L’investigation initiale a été sérieuse mais bornée et rapide. Elle ne constitue
ni une étude exhaustive des workflows Claude ni un inventaire de leurs modèles
et versions. Certaines sources sociales primaires étaient inaccessibles ; le
[registre des sources](SOCIAL_SOURCES.md) conserve cette limite. Le cas
[REA Signal](cases/REA_SIGNAL.md) a réellement testé inspection, reconstruction
et comparaison sur une page du dépôt dont les sources étaient accessibles.
Il ne démontre pas la reproduction de films Claude externes.

## Essais et résultats

Les créations ont utilisé Astra pour l’auteur, la critique et la QA. Le rendu
s’exécute localement avec Node, Chromium/Playwright et FFmpeg ; le moteur
`motion/1` ne fait aucun appel de modèle.

| Configuration | Périmètre observé | Résultat et portée |
| --- | --- | --- |
| Astra `high` | [L’atelier de l’aube](cases/morning-press.md), 14 s, quatre plans, 81 objets | Rendu jugé très insuffisant ; défaut de relation entre levier, tige et plateau. |
| Astra `ultra` | Second essai local hors dépôt, 6 s, un plan, une action simple | Construction mécanique contrainte ; résultat graphique toujours rejeté comme extrêmement pauvre. Sources et médias non publiés. |
| Astra `max` | Aucun essai local | Aucun résultat à lui attribuer. |
| Autres efforts Astra | Non évalués dans cette série | Aucun effet établi. |
| Claude Opus 5.5, selon l’utilisateur | Rendus vus ailleurs, jugés extrêmement meilleurs | Témoignage expérientiel externe ; aucun comparatif exécuté ici. |

Le premier essai dispose de 27 tests réussis et de sondes sur 71 temps × cinq
parcours × deux adaptateurs, à 480 × 270, avec six paires de sous-images actives.
Canvas compare les octets RGBA ; SVG compare le DOM et l’état partagé.
Le master comporte 420 images décodées. Les compositions, contacts, strips et
atlas ont été inspectés ; aucun visionnage intégral à vitesse réelle ni écoute
humaine n’est revendiqué par la revue de production.

Le second essai a contrôlé 25 temps × cinq parcours × deux adaptateurs en
1920 × 1080 et deux paires de sous-images. Un angle analytique commun imposait
la liaison rigide ; pivot et longueur de 550 px restaient constants, avec une
énergie décroissante. Ces contrôles décrivent des invariants ciblés. Leur
réussite n’a pas rendu le film acceptable pour l’utilisateur. Seul ce bilan
anonyme est conservé ici ; le contenu de cet essai reste hors publication.

## Défaillances identifiées

**Mécanique.** Dans le premier descriptor, `lever.rotation`, `shaft.y` et
`platen.y` suivent des pistes indépendantes. Des cues communes synchronisent
des instants sans imposer de transmission cinématique. Le storyboard décrit
une cause que le calcul ne garantit pas. La répétabilité peut ainsi figer une
action incohérente.

**Direction artistique.** Réduire la durée, le nombre de plans et la complexité
mécanique n’a pas suffi à produire une image satisfaisante. La composition, la
richesse du dessin et l’intérêt de la mise en scène restent des échecs au
regard du résultat demandé.

**Critique trop indulgente.** Les revues des agents ont accepté des résultats
que l’utilisateur a ensuite nettement rejetés. Corriger quelques défauts locaux
et inspecter des captures n’a pas établi un seuil artistique pertinent. Le
jugement humain final fait autorité pour l’acceptation.

**Cadre de construction.** Le cœur fournit des primitives et des pistes
numériques, sans catalogue visuel, rigs expressifs ni solveur mécanique général.
Les chemins permettent des dessins arbitraires, mais leur richesse restait à
construire. Cette limite participe au contexte de l’échec ; son poids causal
n’a pas été isolé de celui du modèle, du brief ou de la méthode.

## Ce que les preuves établissent

Les tests vérifient des mathématiques, des contrats temporels, des images
répétables et des exports décodables. REA aide à documenter des comportements
observables et à distinguer faits et hypothèses. Ni les tests ni REA ne
garantissent une bonne direction artistique, une mécanique crédible ou une
critique exigeante.

Les deux essais diffèrent par leur brief, leur durée et leur complexité : ils
n’isolent pas l’effet de `high` contre `ultra`. Aucun protocole, capture ou budget
comparable n’a été fourni pour les rendus Claude évoqués. Le retour de
l’utilisateur est néanmoins clair : il constate ailleurs un écart majeur et
attribue le blocage aux capacités d’Astra, quel que soit l’effort. C’est son
diagnostic pratique ; la série locale ne teste pas tous les efforts et ne
mesure pas une incapacité universelle du modèle.

## Décision

Le développement est mis de côté. Le dépôt conserve le code, les preuves et
les résultats déjà publiés comme archive d’expérimentation, sans promesse de
qualité de production. Aucune nouvelle création, correction ou feuille de route
n’est engagée. Une reprise nécessitera une demande explicite de l’utilisateur
et une validation humaine du résultat visuel.
