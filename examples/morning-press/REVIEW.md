# Revue — L’atelier de l’aube

Auteur : GPT-6 Astra. État initial avant captures ; aucune qualité visuelle ni écoute prétendue.

La direction a reçu une critique indépendante préventive : vérifier l’occlusion complète du motif avant la pression, le contact exact du plateau et la solidarité de l’estampe avec le papier à chaque coupe. Le descriptor prévoit une bouche opaque, un bord de plateau contraint à 540 px et des pistes de transformation identiques pour tous les éléments imprimés.

Les quatre compositions, contacts, raccords et tenue finale sont nommés dans la QA du JSON. Le journal sera complété après observation des images et avant le gel des sources du master.

## Première revue des compositions

Image réellement ouverte : `out/morning-press/compositions-v1.png`. Les quatre plans présentent une presse identifiable, un plateau lisible au contact, une sortie de feuille avec le même motif et un soleil assez grand pour la miniature. La fonte et le soleil portent bien deux masses différentes ; les rayons restent de l’encre attachée au papier.

Défaut confirmé par l’auteur et la critique indépendante, composition finale : un fragment vertical sombre de carter restait au bord gauche. Le cadrage s’arrêtait à x monde 952,86 alors que le carter s’étend jusqu’à 963. Première correction : caméra finale décalée de 20 px vers la droite, bord gauche monde 972,86. Le recontrôle indépendant a révélé qu’une fente arrière s’étendait jusqu’à 978 et restait visible sous forme de ligne fine. Correction complète : caméra x 1440, bord gauche monde 982,86 ; l’estampe reste proche du centre, tous les éléments de presse sortent du champ. Recontrôle final requis.

La planche `out/morning-press/critic-poses-v1.png` a également été ouverte par l’auteur : entrée de feuille vierge, mise en place occultée, retrait du levier, fermeture puis réouverture du plateau sont lisibles. Le plateau tient la pression sans rebond ni pénétration visible. Ces poses ne remplacent pas une lecture à vitesse réelle.

## Recontrôle et contact final

Images ouvertes par l’auteur : `critic-mini-final.png` et `critic-contact-final.png`. La presse est désormais entièrement hors du champ final, les rayons restent distincts à 360 px et le strip de pression ne montre pas de pénétration. La miniature a révélé un second défaut, relevé indépendamment aussi par le critique : le bas de la feuille restait environ 30 px monde au-dessus de la table, donnant une impression de suspension.

Correction de mise en scène : après la première moitié de révélation, la feuille descend doucement de 26 px pour finir à y 757. Avec son angle final, son bord bas rejoint la ligne de table à environ y 935. Le mouvement reste entièrement partagé par le papier et l’encre ; l’arrêt sonore possède ainsi un contact visible. Caméra finale y 749 pour conserver la place de l’estampe dans le cadre. Les cues sonores et les coupes sont inchangées. Recontrôle des poses de sortie et du détail final requis avant gel.

Le contrôle indépendant des huit poses `critic-rest-v4.png` a confirmé la pose sur la table et l’absence de fragment de presse. La vérification analytique de la piste x a cependant révélé un troisième problème : une clé intermédiaire finissait à vitesse nulle, suivie d’un intervalle cubic démarrant à environ 818 px/s. Cet à-coup n’était pas démontré par les planches clairsemées. Correction : suppression de cette clé x et courbe `smooth` unique de l’éjection au dépassement. Position et vitesse sont maintenant continues au milieu de la sortie ; la feuille conserve son dépassement final de 10 px. Trois poses QA autour de `reveal-middle`, sans nouveau son ni nouvelle seconde source de temps, vérifient le passage. Recontrôle visuel final requis avant gel.

## État figé pour le master

L’auteur a ouvert `out/morning-press/compositions-v5.png` et `out/morning-press/ejection-flow-v5.png` : les quatre compositions conservent leur hiérarchie ; le soleil apparaît progressivement dans les neuf poses successives de sortie ; le papier et le motif se déplacent ensemble ; le bord final repose sur la table ; aucun morceau de presse ne reste dans le dernier champ. Les trois problèmes prioritaires sont ainsi corrigés : bord parasite, contact final ambigu et discontinuité de vitesse d’éjection.

Le contrôle navigateur exécuté par l’orchestration rapporte PASS sur 71 temps et cinq parcours, pour les pixels Canvas RGBA et l’état SVG DOM, avec six paires de sous-images actives sur six et descriptor immuable. Il s’agit de sondes de déterminisme, pas d’une certification universelle. Le brouillon v1 a été rendu, décodé et inspecté en atlas par l’orchestration ; les corrections suivantes ont reçu les recontrôles ciblés ci-dessus. La critique indépendante et ses limites sont conservées dans `out/morning-press/critique.md`.

Les quatre fichiers source de cet exemple sont figés à cette étape. Le master, ses tests de décodage, les mesures audio et les commandes réellement exécutées seront consignés hors de ce répertoire pour préserver les hashes des sources. L’auteur ne revendique ici ni écoute, ni visionnage continu du MP4 : son examen visuel porte sur les images et strips explicitement listés. Cinq accents synthétiques utilisent uniquement les cues du JSON ; aucun enregistrement ni musique externe.
