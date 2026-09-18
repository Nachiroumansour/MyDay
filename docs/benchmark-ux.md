# Benchmark : invitations numériques

Septembre 2026. Recherche menée avant de reprendre l'expérience de MyDay de
bout en bout — le parcours de l'hôte, la page de l'invité, l'enveloppe et les
animations. Jusqu'ici l'écran avait été corrigé par touches successives sans
jamais regarder ce que font les meilleurs ; ce document répare ça.

## Méthode

Neuf services examinés. Pour ceux dont une page publique existait, elle a été
ouverte comme un invité l'ouvre : sur un téléphone de 390 px de large, avec un
agent iPhone, en capturant les premières secondes et en pesant tout ce que la
page télécharge. Pour les autres, leur documentation, leurs pages d'aide et les
analyses publiées.

| Service | Ce qu'il est | Observé comment |
|---|---|---|
| **InviteMoi** (Dakar) | Concurrent direct : faire-part numérique sénégalais | Démo ouverte sur téléphone, pages publiques, tarifs |
| **Paperless Post** | La référence historique de l'enveloppe animée (depuis 2008) | Aide en ligne, analyses publiées |
| **Greenvelope** | Enveloppe animée : doublure, timbre, sceau, musique | Page produit, aide |
| **Partiful** | L'appli d'invitation de la génération Z | Page d'événement réelle ouverte sur téléphone |
| **Luma** | Pages d'événement, création en un écran | Aide, analyses d'interface |
| **Apple Invites** | La même idée vue par Apple (2025) | Annonce, prise en main publiée |
| **Evite** | Le grand public américain | Aide détaillant les étapes |
| **Joy** | Sites de mariage, plusieurs cérémonies | Aide, pages produit |
| **Zola** | Mariage : site + réponses | Aide, pages produit |

## Ce qui se mesure

| | Poids de la page invité | Compte pour créer | Étapes de création | Réponse de l'invité |
|---|---|---|---|---|
| **MyDay** | **154 Ko, 0 Ko de JS** | Aucun | **6** | Au milieu de la page |
| InviteMoi | 2 143 Ko, 41 requêtes | E-mail + lien magique | 3 | Au milieu de la page |
| Partiful | 14 856 Ko, 160 requêtes | Téléphone | 1 écran | **Barre flottante en bas** |
| Luma | — | E-mail vérifié | **1 écran** | En tête |
| Evite | — | Oui | 7 | — |
| Greenvelope | — | Hôte seulement | — | **Dans la même vue que la carte** |

Deux lectures s'imposent.

**Notre page invité est notre meilleur atout, et de loin.** Quatorze fois plus
légère qu'InviteMoi, cent fois plus que Partiful. Au Sénégal, l'accès se fait
presque entièrement par forfait mobile ; une page de 2 Mo sur un réseau chargé,
c'est une invitée qui renonce avant l'enveloppe. Il ne faut rien céder là-dessus.

**Notre parcours de création est le plus long du lot.** Six étapes, là où
InviteMoi en a trois et Luma un seul écran. C'est ce que l'utilisateur ressent
sans le formuler : ça n'avance pas.

## Ce que chacun fait de mieux

### InviteMoi — le concurrent à Dakar

Ils vendent exactement notre promesse : « sceau de cire à briser, programme du
Takk et du Berndé, confirmation de présence ». Leur démo, ouverte sur téléphone :

- **L'enveloppe** : fond vert nuit traversé de rayons de lumière, enveloppe
  chocolat, **un sceau d'or gravé des initiales du couple**, et l'accroche
  « Une invitation particulière vous attend… ». Au bout de trois secondes sans
  geste, **une main vient désigner le sceau** et l'écran dit « Brisez le sceau ».
  « Passer l'animation » reste visible.
- **La carte** ouvre sur une formule religieuse — « Par la grâce de Dieu et la
  bénédiction de leurs familles » — puis les prénoms en calligraphie dorée.
- **« 127 invités ont déjà confirmé »**, juste sous le compte à rebours.
- Le programme présenté comme **« Une journée, quatre moments »** : Takk,
  Berndé, Réception, avec les heures.
- Un carrousel de l'histoire du couple (« La rencontre », « La demande »,
  « Les fiançailles »), une vidéo, une musique à activer.
- En pied de page : partager sur WhatsApp, copier le lien — et **« Créer mon
  invitation »**, qui transforme chaque invité en client potentiel.

Leur création tient en trois temps : **choisir un univers → tout personnaliser
avec aperçu en direct → payer et partager**. Mais il faut un compte, par lien
magique envoyé **par e-mail** — une adresse que beaucoup de Sénégalais ne
consultent guère, quand WhatsApp est ouvert en permanence.

Leurs tarifs : **250 FCFA** l'invitation, + 250 l'album, + 500 la musique, + 500
les confirmations, + 1 000 la vidéo. Paiement Wave, Orange Money, Free Money.
Assistance par WhatsApp à toute heure.

### Paperless Post — la leçon de l'enveloppe

Leur enveloppe animée a fait leur réputation — on les appelait « ceux dont
l'enveloppe s'ouvre ». Puis ils ont dû la **refaire** : l'ancienne version
cachait la réponse et la page de l'événement derrière l'animation, il fallait
quitter l'une pour voir l'autre, et elle fonctionnait mal sur téléphone, où se
lisent 55 % de leurs invitations.

Leur nouvelle version : l'enveloppe tombe dans l'écran rabat déjà ouvert, s'en
va vite, et **la page de l'événement se charge juste dessous**, la carte posée
sur un rebord. **L'animation ne doit jamais bloquer l'information.**

Côté création, on édite **en touchant le texte sur la carte elle-même** — pas
dans un formulaire à côté.

### Greenvelope — l'enveloppe personnelle

L'enveloppe arrive **adressée à l'invité par son nom**, avec une doublure, un
timbre et un sceau que l'hôte a choisis, parfois une musique. Elle s'ouvre, la
carte en sort, et **la réponse est intégrée dans la même vue**, sans navigation.
Aucun compte, aucune appli, à aucun moment pour l'invité.

Leur argument : l'enveloppe fait passer l'invitation du statut de visuel
promotionnel à celui de courrier personnel, et les invités répondent plus vite
parce que la réponse tient en un geste, au moment même où ils sont captivés.

### Partiful — la réponse sous le pouce

Page d'événement ouverte sur téléphone : titre énorme, visuel, étincelles
animées, et surtout **une barre flottante en bas de l'écran — « RSVP » /
« Interested » — qui reste là pendant tout le défilement**. La réponse est
toujours à portée de pouce.

Et **la liste des invités est visible** avant de s'engager : on voit qui vient.
Leur analyse : ça réduit l'anxiété sociale qui retient les gens de venir.

### Luma — un seul écran

La création tient en **un écran** : titre, date, lieu, description. Les
réglages fins s'ouvrent en surcouches, pas en pages. L'événement est **en ligne
aussitôt créé**, et on l'affine ensuite dans des onglets séparés.

### Joy — plusieurs cérémonies, un programme par invité

Chaque invité ne voit **que les cérémonies auxquelles il est convié**, et répond
pour chacune séparément. C'est exactement la situation d'un mariage sénégalais,
où le Berndé se tient en petit comité familial.

### Apple Invites

Une image de fond, un titre, une date, un lieu — et autour, **Plans pour
l'itinéraire et la météo du jour**, un album partagé où les invités déposent
leurs photos pendant et après la fête.

### Evite et Zola

Evite enchaîne sept étapes ; c'est le contre-exemple. Zola ne fait pas
d'invitation numérique : son site de mariage recueille les réponses. Rien à
retenir, sinon que la longueur de parcours d'Evite est ce qu'on nous reproche.

## Ce que dit la recherche en ergonomie

- **Une chose par écran** convient aux publics peu à l'aise avec le numérique et
  au téléphone (service numérique du gouvernement britannique, NN/g). Mais un
  écran unique bien conçu, avec des surcouches, fait aussi bien quand les champs
  sont peu nombreux (Luma).
- **La zone du pouce** : une action principale placée en bas de l'écran obtient
  de 10 à 20 % de complétion en plus que la même action en haut. Les feuilles qui
  montent du bas (bottom sheets) tombent pile dans cette zone.
- **Les durées d'animation** : 200 à 300 ms pour une transition d'interface ;
  au-delà de 400 ms elle paraît lente, au-delà de 500 ms elle agace. Une
  animation de « plaisir » comme l'enveloppe peut durer plus — à condition de
  pouvoir être passée et de ne rien cacher.
- **Le coût d'interaction** — effort mental et physique — est ce qu'il faut
  réduire. Moins de champs, mieux ordonnés, doublent presque la complétion.

## Où en est MyDay

**Ce que nous faisons mieux que tous :**

- Le poids de la page invité, sans comparaison.
- Aucun compte, ni pour l'hôte ni pour l'invité — InviteMoi exige un e-mail.
- Le catalogue qui affiche chaque modèle **avec les prénoms du visiteur**. Personne
  d'autre ne le fait.
- La page tient sans JavaScript : l'invitation reste lisible quoi qu'il arrive.

**Ce qui nous manque :**

1. **Le parcours de création est trop long** — six étapes, et tout est présenté
   au même niveau : la carte, le programme, les invités, les réponses. Or les
   invités et les réponses viennent *après* la publication.
2. **On édite dans un formulaire**, pas sur la carte. Paperless Post et Canva
   font toucher le texte lui-même.
3. **La réponse de l'invité est enterrée** au milieu d'une longue page.
4. **Le sceau est générique** — une icône, là où InviteMoi grave les initiales.
5. **Pas de preuve sociale** : ni « 42 personnes ont confirmé », ni qui vient.
6. **Pas d'indice gestuel** : l'invité qui ne pense pas à toucher l'enveloppe
   reste devant.
7. **Pas de boucle virale** : rien sur la page invité ne dit « créez la vôtre »
   de façon visible.

## Un point qui n'est pas d'ergonomie : le prix

InviteMoi démarre à **250 FCFA**. MyDay est à **5 000 FCFA** — vingt fois plus.
Même avec des configurations complètes, leur exemple pour 150 invités s'élève à
750 FCFA.

Aucune refonte d'écran ne compensera cet écart face à un concurrent qui propose
le même sceau, le même programme, la même confirmation. C'est une décision
commerciale, pas de conception, et elle ne m'appartient pas ; mais elle
conditionne tout le reste et elle doit être prise en connaissance de cause.

## La refonte proposée

### Le parcours de l'hôte : trois temps au lieu de six

```
AVANT   Galerie → Carte → Programme → Détails → Invités → Publication → Réponses

APRÈS   Choisir ─────→ Composer ─────────────→ Partager
        (galerie à     (la carte au centre,     (payer, puis
         vos prénoms)   on touche pour éditer)   WhatsApp)
                                                     │
                                                     ▼
                                              Suivre (après publication)
                                              réponses · invités · livre d'or
```

**Choisir** — inchangé : c'est notre signature. La galerie montre chaque modèle
avec les prénoms du visiteur.

**Composer** — un seul écran, construit autour de la carte :

- La carte occupe le haut de l'écran, grande.
- **On touche un texte de la carte pour l'éditer.** Le moteur connaît déjà le
  cadre exact de chaque champ (`data-cadre`) : il suffit de poser des zones
  tactiles transparentes par-dessus l'image. Toucher « Moussa » ouvre une
  feuille qui monte du bas, sur le bon champ, avec les champs voisins.
- Sous la carte, le programme en frise — Takk, Berndé, Réception — et un bouton
  « Ajouter un moment », qui ouvre une feuille.
- La tenue et le mot des hôtes en option repliée.
- Une barre fixe en bas : la progression, et le bouton **« Partager »**.

**Partager** — le paiement Wave ou Orange Money, puis dans la foulée : le lien
avec le bouton WhatsApp, et un QR code à imprimer.

**Suivre** — un tableau de bord séparé, qui n'apparaît qu'après la publication :
les réponses, la liste d'invités nominatifs, le livre d'or à modérer.

### La page de l'invité

- **Le sceau porte les initiales du couple**, gravées dans la cire.
- **Un indice gestuel** si l'invité n'a pas touché au bout de deux secondes : une
  main qui vient désigner le sceau.
- L'enveloppe reste sous deux secondes, passable, et **ne cache jamais
  l'information** : sans JavaScript, elle n'existe pas.
- **Une barre de réponse fixée en bas de l'écran**, dans la zone du pouce :
  « Je viens » / « Je ne pourrai pas ». Toujours là, du premier au dernier
  défilement.
- **« 42 personnes ont déjà confirmé »** sous le compte à rebours — le nombre
  seul, jamais les noms : une famille sénégalaise n'a pas forcément envie
  d'afficher sa liste.
- **Le programme en frise verticale**, les heures à gauche : la journée se lit
  d'un coup d'œil.
- **« Créez la vôtre »** en pied de page, discret mais visible.

### Les animations

| Moment | Durée | Règle |
|---|---|---|
| Feuille d'édition qui monte | 280 ms, décélération | Standard d'interface |
| Champ touché sur la carte | Pulsation 400 ms | Montre ce qu'on édite |
| Enregistrement | Coche 200 ms | Confirme sans interrompre |
| Enveloppe | ~1,6 s | Moment de plaisir : passable, ne cache rien |
| Indice gestuel | Après 2 s d'inaction | Seulement si personne n'a touché |
| Tout le reste | ≤ 300 ms | Au-delà, l'interface paraît lente |

Et partout : le réglage « moins d'animations » est respecté.

### Ce qu'on ne copie pas

- **La musique au chargement** (Greenvelope, InviteMoi). Au Sénégal, une page
  qui joue du son dans un bus ou à la mosquée est une gêne. Si on l'ajoute, ce
  sera à la demande de l'invité, jamais d'office.
- **La liste nominative des invités visible** (Partiful). Utile entre amis
  trentenaires ; délicat pour un mariage où les familles ne s'exposent pas.
  Le nombre suffit.
- **Les pages lourdes.** Tout ce qui précède doit tenir dans notre budget. La
  vidéo et le carrousel photo d'InviteMoi sont précisément ce qui leur coûte
  2 Mo.
- **Un compte par e-mail.** Notre lien secret de brouillon vaut mieux pour ce
  public.

## Sources

- [Paperless Post — étude de conception « You're invited »](https://medium.com/design-paperless-post/you-re-invited-93c86d417ee5)
- [Paperless Post — l'ingénierie de l'enveloppe](https://medium.com/life-at-paperless/youre-invited-4ff03e8e6ad7)
- [Paperless Post — modifier le texte d'une carte](https://paperlesspost.zendesk.com/hc/en-us/articles/4407067096475-Adding-and-Formatting-Text-on-Your-Card-Design)
- [Greenvelope — qu'est-ce qu'une enveloppe animée](https://www.greenvelope.com/resources/animated-envelope-invitations)
- [Digestible UX — Apple Invites a copié Partiful](https://www.digestibleux.com/p/apples-invites-mimicked-partiful)
- [Partiful — page d'événement publique](https://partiful.com/e/S9m7mAA0avBXnFR6rgf0)
- [Luma — créer un événement](https://help.luma.com/p/creating-an-event)
- [Luma — analyse d'interface](https://screensdesign.com/showcase/luma-delightful-events)
- [Apple — présentation d'Apple Invites](https://www.apple.com/newsroom/2025/02/introducing-apple-invites-a-new-app-that-brings-people-together/)
- [Evite — créer une invitation](https://support.evite.com/products/invitations/create-and-edit/create-invitation-free-or-premium)
- [Joy — plusieurs cérémonies et réponses](https://withjoy.com/help/en/articles/11085588-how-can-i-use-joy-to-manage-rsvps-and-schedules-for-multiple-events-when-not-everyone-is-invited-to-every-event)
- [Zola — invitations numériques](https://www.zola.com/faq/do-you-offer-digital-invitations)
- [InviteMoi — invitation de mariage](https://invitemoi.sn/invitation/mariage) et [démo](https://invitemoi.sn/demo/royal)
- [NN/g — feuilles montantes](https://www.nngroup.com/articles/bottom-sheet/)
- [NN/g — durée des animations](https://www.nngroup.com/articles/animation-duration/)
- [NN/g — réduire la charge cognitive des formulaires](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)
- [GOV.UK — une chose par page](https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/)
- [UX Movement — placement de l'action principale sur mobile](https://uxmovement.com/mobile/optimal-placement-for-mobile-call-to-action-buttons/)
- [Material Design — durées et courbes](https://m1.material.io/motion/duration-easing.html)
- [DataReportal — Digital 2026 : Sénégal](https://datareportal.com/reports/digital-2026-senegal)
