# Réparer un rendu avec preuve

```text
Diagnostique [commande + erreur + fichier]. Lis docs/RENDER_CONTRACT.md.
Réduis le cas à une frame ou à une plage courte. Vérifie d'abord doctor,
readiness, ressources locales, erreurs navigateur, dimensions et sortie FFmpeg.
Compare seek(t) après un autre temps puis sur une page fraîche, tous les pixels.
Vérifie que t reste continu et que le blur ne traverse aucun cut.

Corrige la cause avec la plus petite modification cohérente. Ajoute un test de
régression si le défaut concerne un contrat réutilisable. Ne masque pas une
erreur en désactivant le contrôle. Préserve le master précédent si le nouvel
export échoue. Rerends le cas, puis le livrable affecté, et rapporte les preuves.
```
