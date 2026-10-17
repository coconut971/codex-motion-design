# Produire un film complet avec Codex

À coller dans Codex, ouvert à la racine du dépôt. Remplacer les champs.

```text
Auteur requis : GPT-6 Astra exclusivement, y compris pour le code, les assets,
les prompts et les corrections. Vérifie le modèle avec les informations fiables
de la session ; si ce n'est pas Astra ou si tu ne peux pas le vérifier, signale
la limite avant de générer et demande sa sélection, sans modèle de secours.
Le rendu et les mesures des fichiers existants restent locaux, sans API modèle.

Crée un film original de [8–15] secondes pour [sujet / public / destination].
Ce que le spectateur doit comprendre : [une idée].
Format : [1920×1080, 30 i/s]. Ton : [calme / précis / énergique].
Contraintes de marque : [palette, matières, assets locaux autorisés].
Texte à l'écran : [aucun / contenu exact]. Son : [ponctuations / musique / muet].
Payoff attendu : [forme ou transformation finale].

Suis AGENTS.md. Écris d'abord STORYBOARD.md : idée, états lisibles, anticipation,
action, conséquence, tenue finale, transitions et direction sonore. Donne des
valeurs concrètes plutôt que « premium ». Choisis une métaphore propre au sujet.
Si le brief permet d'avancer, pose tes hypothèses et continue.

Lis docs/CORE.md. Écris un descriptor motion/1 avec scènes, objets à ids stables,
pistes et cues partagées image/son/QA. Réutilise compileFilm et les adaptateurs
Canvas/SVG ; ajoute du code au cœur uniquement pour un besoin démontré et testé.
Le lecteur examples/core-demo accepte un autre JSON via ?project= ; aucun code
de scène copié n'est nécessaire. Le seek(t) reste pur et continu. Rends la vidéo
avec Canvas et vérifie aussi le SVG si utilisé. Aucun modèle/API au runtime.
Commence par quatre images clés puis inspecte la planche par beat, les strips
des contacts et une miniature. Consigne les défauts observés dans REVIEW.md,
corrige les trois plus importants et rerends leurs preuves. Lance les tests et
la vérification des seeks. Rends le draft puis le master sonorisé décodable.
Livre les fichiers, les contrôles exécutés et les limites de lecture/écoute.
```

Politique d'auteur : [workflow Astra](../docs/ASTRA_WORKFLOW.md).
