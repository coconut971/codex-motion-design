# Reproduire les sondes de moteurs permissifs

Le runner original [research-probe.mjs](../../scripts/research-probe.mjs) lit les
clones fournis par l'opérateur et exécute leurs petits modules dans un Chrome
éphémère. Il ne copie aucun code tiers dans le dépôt et n'exécute aucun contenu
commercial. Il utilise Playwright : ses résultats ne sont pas des Evidence REA.

Préparer les clones `claude-motion-design`, `claude-motion` et
`motion-graphics-skills` dans un même répertoire. Les commits exacts sont ceux de
l'[index](README.md) ; le runner refuse un autre HEAD ou une modification locale
des fichiers sélectionnés. Aucun `npm install` dans ces clones n'est nécessaire.
Seuls Playwright et Chromium du projet courant sont requis ; FFmpeg ne sert pas
pour ces sondes.

```powershell
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node scripts/research-probe.mjs --sources=Z:\recherches\motion-sources
```

La sortie par défaut est `out/research/reproduction.json`. Elle contient les
commits, tailles et hashes des sources lues, version du navigateur, mesures et
sept contrôles de reproduction. Un contrôle vrai signifie que le défaut
documenté est reproduit au commit figé ; il ne signifie pas que le moteur tiers
est correct. Un chargement, une ressource, un commit ou une mesure inattendus
font échouer le processus. Le navigateur, les pages et le serveur local sont
fermés dans `finally`.

Les sondes couvrent l'arrondi et le spring Howseen, les points de cadrage
historiques du directeur Whaley, ainsi que les easing, spring et styles DOM Mort.
Le directeur Whaley reçoit des points synthétiques déterministes ; ses exemples
livrés le désactivent par défaut. Ce runner ne prétend reproduire ni les exports
complets, ni toutes les mesures audio, ni les scènes avec leurs médias.

## Observation facultative avec REA

Ajouter `--hold-ms=60000` conserve les trois pages de harnais accessibles pendant
une minute après les mesures. Le terminal affiche l'origine locale et son port.
Dans cette fenêtre, un outil REA disponible peut lancer son propre profil Chrome
avec `capture_browser_scenario`, l'URL exacte `/probe/howseen`, `/probe/whaley`
ou `/probe/mort`, une action d'attente déclarée et une capture DOM finale.
Le résultat numérique est visible dans `#result`. Ne pas employer une URL
de serveur expiré et ne pas attribuer les mesures du runner à REA.

Conserver séparément le véritable Evidence retourné par REA et exporter son
bundle si nécessaire. Les IDs de l'enquête initiale ne sont pas réutilisables
comme références actives dans une autre connexion ; le bundle local ou une
nouvelle exécution fournit la preuve transportable. Les analyses statiques,
scénarios REA et sondes Playwright restent trois périmètres distincts.

Ce parcours a été exécuté le 17 octobre 2026 : sept observations attendues
reproduites sous Chrome 155.0.8059.84, Node 24.18.1, viewport 640×360, DPR 1.
La source commerciale n'appartient pas aux routes ni au manifest de ce runner.
