# Livrer un gabarit pour MyDay — cahier de contraintes

**Version 1 — septembre 2026**
À transmettre aux graphistes partenaires.

---

## 1. Ce qu'on attend de vous

Un **fichier SVG par modèle**, dans lequel les zones que le client pourra
personnaliser sont identifiées par des attributs précis. Notre moteur lit ces
attributs, y écrit les informations du client, et produit la carte finale en
PNG haute définition et en PDF imprimable.

Votre création n'est pas contrainte : couleurs, ornements, calligraphies,
mises en page sont libres. Ce document ne fixe que **la façon de nommer les
zones modifiables** et **quelques limites techniques**.

---

## 2. Format du fichier

- **SVG uniquement.** Export depuis Figma, Illustrator ou Inkscape.
- **Un `viewBox` obligatoire** sur la balise racine (par exemple
  `viewBox="0 0 600 900"`).
- **La taille physique déclarée** sur la même balise racine :
  `data-largeur-mm="127" data-hauteur-mm="190.5"` pour une carte de
  12,7 × 19,05 cm. C'est ce qui détermine la résolution d'impression.
- **Pas d'image bitmap intégrée** en dehors de la zone photo du client
  (pas de JPEG ou PNG collé dans le décor) : le fichier deviendrait trop lourd
  et le rendu perdrait en netteté à l'impression.

---

## 3. Les zones personnalisables

Chaque élément que le client peut modifier porte **trois attributs**.

| Attribut | Rôle | Exemple |
|---|---|---|
| `data-champ` | L'identifiant de la zone | `data-champ="nom_1"` |
| `data-type` | Sa nature | `data-type="texte"` |
| `data-cadre` | La boîte dans laquelle la valeur doit tenir | `data-cadre="60,230,480,80"` |

**`data-type`** prend l'une de ces quatre valeurs : `texte`, `texte_long`,
`date`, `image`.

**`data-cadre`** s'écrit `x,y,largeur,hauteur`, en unités du `viewBox`. C'est
la zone dans laquelle le texte doit rester. Notre moteur réduit
automatiquement la taille du texte si le client saisit un nom long — jusqu'à
60 % de la taille que vous avez choisie. En dessous, il nous signale que le
texte déborde et nous refusons la saisie côté client.

Vous pouvez ajouter `data-max-longueur="18"` pour indiquer le nombre de
caractères raisonnable : nous nous en servons pour guider le client au moment
de la saisie.

### Identifiants à utiliser

Utilisez ces noms chaque fois que la zone existe, pour que les modèles soient
interchangeables :

| Identifiant | Contenu |
|---|---|
| `nom_1`, `nom_2` | Les prénoms des mariés, ou le prénom de l'enfant |
| `date` | La date de l'événement |
| `lieu` | Le lieu principal |
| `texte_intro` | La formule d'invitation |
| `zone_photo` | L'emplacement de la photo du client |

Un modèle n'a pas besoin de tous les porter. Un faire-part de baptême n'aura
qu'un `nom_1`.

### Exemple complet

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900"
     data-largeur-mm="127" data-hauteur-mm="190.5">

  <!-- Décor libre : ce qui ne porte pas data-champ n'est jamais modifié -->
  <rect width="600" height="900" fill="#F7F8FA"/>
  <rect x="28" y="28" width="544" height="844" fill="none"
        stroke="#2C3A80" stroke-width="1.5"/>

  <!-- Zone de texte personnalisable -->
  <text data-champ="nom_1" data-type="texte"
        data-cadre="60,230,480,80" data-max-longueur="18"
        x="300" y="250" text-anchor="middle"
        font-family="GreatVibes" font-size="72" fill="#14161D">Awa</text>

  <!-- Zone photo : un simple rectangle -->
  <rect data-champ="zone_photo" data-type="image"
        x="200" y="430" width="200" height="200"/>
</svg>
```

---

## 4. La zone photo

C'est un **simple rectangle** portant `data-champ="zone_photo"` et
`data-type="image"`. Sa position et sa taille viennent de ses propres
attributs `x`, `y`, `width`, `height` — pas besoin de `data-cadre`.

La photo du client remplit tout le rectangle sans déformation, la partie
excédentaire étant rognée. Le client règle le cadrage au doigt.

**Si le client ne met pas de photo, la zone disparaît** et le décor autour
doit rester cohérent. Concevez donc la carte pour qu'elle tienne debout sans
photo.

---

## 5. Les polices — le point le plus important

**Chaque police utilisée doit nous être livrée en fichier `.ttf` ou `.otf`**,
avec le modèle. Sans le fichier, la carte ne peut pas être produite.

- **Le nom de la famille dans le SVG doit correspondre exactement au nom du
  fichier**, sans espace : `font-family="GreatVibes"` va avec
  `GreatVibes.ttf`.
- **Vérifiez que la police contient les caractères accentués** : é, è, ê, à,
  ç, ô, ë, et la ligature œ. Beaucoup de polices calligraphiques anglaises ne
  les ont pas, et le nom du client sortirait amputé.
- **Vérifiez que vous avez le droit de nous la céder** pour un usage
  commercial. Une police achetée en licence personnelle ne convient pas.
- **Ne vectorisez pas le texte vous-même** dans les zones personnalisables :
  elles doivent rester de vraies balises `<text>` pour que nous puissions y
  écrire. Le décor, lui, peut être vectorisé sans problème.

---

## 6. Ce qui ne passe pas l'export

Certains effets de Figma et Canva ne survivent pas au format SVG standard.
Vérifiez systématiquement votre export **en l'ouvrant dans un navigateur** :
ce que vous y voyez est ce que nous produirons.

Les points qui posent problème en pratique :

- **les effets de flou, d'ombre portée et de mélange de calques** — souvent
  perdus ou déplacés ;
- **les masques complexes** — préférez des formes simples ;
- **les dégradés sur du texte** — utilisez une couleur pleine sur les zones
  personnalisables ;
- **le texte sur un tracé courbe** dans une zone personnalisable — nous ne
  savons pas le repositionner après remplissage. Réservez-le au décor.

---

## 7. Ce qu'on vous demande de livrer, par modèle

1. Le fichier `.svg`.
2. Les fichiers de police `.ttf` ou `.otf` utilisés.
3. Une capture PNG du modèle tel que vous le voyez, pour comparaison.
4. Le nom du modèle et deux ou trois mots d'ambiance (« moderne », « doré »,
   « traditionnel », « pastel ») pour le classement dans le catalogue.

---

## 8. Volume attendu

**15 à 20 modèles par type d'événement** — mariage, baptême, anniversaire.

Prévoyez, pour chaque modèle, **trois à quatre variantes de couleur**. Un même
dessin décliné en quatre palettes donne quatre entrées distinctes au
catalogue, pour un travail bien moindre qu'un nouveau modèle.

---

## 9. Comment on valide

Vous déposez le modèle dans l'espace graphiste. Le moteur le rend
immédiatement avec des valeurs d'exemple et vous montre le résultat. **Un
modèle qui ne se rend pas correctement ne peut pas être publié** — vous voyez
donc le problème tout de suite, sans nous attendre.

Les erreurs les plus fréquentes, dans l'ordre : une police non livrée, un
`data-cadre` oublié, et un `data-type` mal orthographié.
