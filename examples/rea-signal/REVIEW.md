# Revue du cas REA Signal — 17 octobre 2026

Les captures proviennent des deux pages locales avec `seek(t)`, aux mêmes temps,
seed et dimensions (960×540). Le différentiel montre les écarts RGB amplifiés ×4.
Il ne s'agit pas d'une mesure produite par REA.

| Preuve ouverte | Observation | Décision |
| --- | --- | --- |
| `out/rea-case/key-comparison.png`, 0,5 / 2 / 3,5 / 6 s | Les positions, les tailles et les silhouettes de référence/reconstruction concordent visuellement. Les écarts se concentrent sur les contours et le grain. | Garder le dessinateur indépendant ; aucune recherche de zéro pixel. |
| `out/rea-case/contact-comparison.png`, 1,8→2,2 s | La source et la reconstruction se rejoignent au centre avant l'expansion décalée des fragments. Le crop permet de distinguer l'onde et le cœur or. | Aucun défaut majeur observé sur ces échantillons. |
| `out/rea-case/thumbnail-comparison.png`, 6 s, 360 px par version | Trois fragments, centre et arc restent distincts ; le centre ne devient pas une tache illisible. | Tenue finale conservée. |

La planche dense du contact et la miniature ont aussi été inspectées par l'agent
coordinateur. Aucun défaut de composition ne justifiait d'inventer trois retouches.
Les corrections réelles de cette passe concernent la fiabilité du workflow :

- Attente `__motionReady`/fonts et captures bornées par un délai explicite.
- Expiration de la CLI : terminaison de l'arbre de processus possédé sous Windows.
- Statut de comparaison bloqué par les erreurs de page/ressource ; seuils resserrés
  et contrôle négatif d'un écran papier substitué à la résolution.

Les métriques, instants exacts et probes sont dans `out/rea-case/metrics.json`.
Les seuils sont volontairement plus larges que les écarts de contours observés,
mais le contrôle négatif doit rejeter une animation disparue sur son fond.

Cette revue d'images ne constitue ni une lecture du film en temps réel, ni une
écoute. Les contrôles finaux du MP4, les limites d'écoute et les fichiers publics
sont consignés par le coordinateur dans `docs/cases/REA_SIGNAL.md` et
`docs/VALIDATION.md` après rendu.
