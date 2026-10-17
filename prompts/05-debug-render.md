# Réparer un rendu avec preuve

```text
Auteur requis : GPT-6 Astra exclusivement, y compris pour le code, les assets,
les prompts et les corrections. Vérifie le modèle avec les informations fiables
de la session ; si ce n'est pas Astra ou si tu ne peux pas le vérifier, signale
la limite avant de générer et demande sa sélection, sans modèle de secours.
Le rendu et les mesures des fichiers existants restent locaux, sans API modèle.

Diagnostique [commande + erreur + fichier]. Lis docs/RENDER_CONTRACT.md.
Pour motion/1, lis docs/CORE.md, compare film.sample(t) avant le rendu puis les
deux adaptateurs ; npm run core:verify teste reset, masques et état partagé.
Réduis le cas à une frame ou à une plage courte. Vérifie d'abord doctor,
readiness, ressources locales, erreurs navigateur, dimensions et sortie FFmpeg.
Compare seek(t) après un autre temps puis sur une page fraîche, tous les pixels.
Vérifie que t reste continu et que le blur ne traverse aucun cut.

Corrige la cause avec la plus petite modification cohérente. Ajoute un test de
régression si le défaut concerne un contrat réutilisable. Ne masque pas une
erreur en désactivant le contrôle. Préserve le master précédent si le nouvel
export échoue. Rerends le cas, puis le livrable affecté, et rapporte les preuves.
```

Politique d'auteur : [workflow Astra](../docs/ASTRA_WORKFLOW.md).
