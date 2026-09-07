# MyDay — Design produit & technique

**Date :** 7 septembre 2026
**Statut :** validé en cadrage, prêt pour plan d'implémentation
**Remplace :** `cahier-des-charges-plateforme-evenements (1).md` (août 2026) sur les points listés au §2

---

## 1. Ce qu'on construit

MyDay est une plateforme sénégalaise d'invitations d'événement — mariage, baptême, anniversaire.

Le produit n'est pas un générateur de fichier. **Le produit est un lien.** Le client crée une
invitation, la publie, et obtient une adresse web qu'il partage dans ses groupes WhatsApp. Quand un
invité l'ouvre, une enveloppe se descelle, la carte se déploie, puis se déroule tout le plan de
l'événement : le programme des cérémonies, les lieux, le dress code, le RSVP. Le PNG haute
résolution et le PDF restent livrés — mais comme sous-produits, plus comme finalité.

Ce déplacement change tout le reste : la page d'invitation est vue par 150 à 400 personnes qui ont
toutes un événement en préparation, ce qui fait de chaque client un canal d'acquisition ; le lien
reste vivant jusqu'au jour J et au-delà, ce qui crée de la rétention ; et les réponses des invités
produisent enfin des données exploitables.

### Le client en une phrase

> Awa doit annoncer son mariage. En dix minutes, sur son téléphone, elle choisit un modèle qui porte
> déjà ses prénoms, remplit son programme, paie avec Wave, et reçoit dans WhatsApp un lien à
> partager — plus sa carte en HD. Ses 300 invités ouvrent une enveloppe à leur nom, voient le
> programme des trois cérémonies, et répondent en dix secondes.

---

## 2. Décisions actées (et écarts avec le cahier des charges d'août)

| Sujet | Cahier des charges d'août | Décision retenue | Motif |
|---|---|---|---|
| Nature du produit | Fichier PNG/PDF livré sur WhatsApp | **Lien d'invitation vivant** + fichiers | Rétention, viralité, données, rampe vers la Phase 2 |
| Support | App React Native + Expo | **Web-first, PWA, une seule base de code** | Le partage passe par WhatsApp : l'invité arrive forcément sur le web. Un install de 60 Mo pour un achat unique casse le tunnel |
| Stack | NestJS + MongoDB | **Next.js (App Router) + PostgreSQL/Drizzle** | Rendu serveur nécessaire pour la page invité (perf, aperçu de partage) ; le RSVP est fortement relationnel |
| Paiement | Avant livraison | **Paywall au dernier moment** : création et aperçu gratuits, on paie pour publier | Effet de dotation : le client a vu son résultat avant qu'on lui demande de l'argent |
| Découverte | Questionnaire de 3-5 questions **avant** de voir un modèle | **Galerie d'abord**, guidage visuel optionnel et permanent | Le questionnaire est une friction avant toute preuve de valeur, et il tue le coup de cœur |
| Personnalisation | Dans l'éditeur uniquement | **Dès l'accueil** : le catalogue entier s'affiche aux prénoms du client | Guidage, conversion, et remède au « site vide » |
| Événement | Une date | **Multi-cérémonies natif** | Un mariage sénégalais n'a jamais une seule date |
| Compte utilisateur | Auth en amont | **Aucun compte avant paiement** | Supprime un chantier entier du V1 et toute friction en amont |
| Moteur de rendu | SVG maison côté serveur | **Confirmé**, plus un rendu navigateur pour l'aperçu | Contrôle du rendu, pas de dépendance tierce facturée au volume |
| Marché | Sénégal | **Sénégal + diaspora** | La diaspora finance les cérémonies au pays, en devises |

---

## 3. Public et parcours

**Le créateur.** Une femme de 25 à 40 ans, à Dakar ou en diaspora, sur un téléphone Android de
milieu de gamme, en 4G instable. Elle organise un événement une à trois fois dans sa vie. Elle
n'a aucune patience pour un tutoriel et aucune tolérance pour une inscription.

**L'invité.** N'importe qui, tout âge, tout appareil. Il reçoit un lien dans un groupe WhatsApp
saturé. Il décide en deux secondes s'il ouvre. Il revient deux ou trois fois avant l'événement,
souvent pour une seule information : l'adresse. Il n'installera jamais rien et ne créera jamais
de compte.

**Le graphiste.** Deux partenaires au lancement. Ils livrent des gabarits SVG, touchent un
pourcentage sur chaque vente, et doivent pouvoir publier un modèle sans passer par le développeur.

---

## 4. Expérience invité

C'est la pièce maîtresse. Elle est spécifiée en premier et construite en premier.

### 4.1 L'aperçu de partage

Le lien est collé dans WhatsApp. La vignette qui s'affiche est **la seule chose que 100 % des
destinataires voient**. Elle est donc générée dynamiquement par événement : le visuel réel du
modèle, les prénoms, la date. Jamais un logo générique.

- Route dédiée produisant une image 1200×630 mise en cache, régénérée à chaque publication.
- Balises Open Graph et Twitter Card complètes ; titre et description repris de l'événement.
- Validée dans WhatsApp, Facebook et iMessage avant mise en ligne — les trois se comportent
  différemment sur la mise en cache.

### 4.2 L'ouverture

L'invité atterrit sur un écran sombre et feutré. Au centre, **une enveloppe close, scellée d'un
cachet de cire portant les initiales**. Une ligne au-dessus : « Awa & Moussa vous convient ».
Une seule action possible : toucher.

Au toucher, le cachet se brise, le rabat s'ouvre, la carte glisse et se déploie plein écran.
Environ trois secondes. Si l'événement a une musique, elle démarre à cet instant — le geste sert
donc deux fois, puisqu'il débloque aussi l'autoplay que les navigateurs mobiles interdisent.

Règles strictes :

- **Passable.** Un « Passer » discret, toujours visible.
- **Jouée une seule fois.** Mémorisée par appareil. L'invité qui revient vérifier l'adresse
  arrive directement sur le contenu. Une animation subie deux fois devient une nuisance.
- **Jamais bloquante.** Sans JavaScript, la page reste entièrement lisible ; l'enveloppe est un
  enrichissement, pas un péage.
- **`prefers-reduced-motion` respecté** : fondu simple à la place de l'animation.

### 4.3 Le lien nominatif

Deux formes de lien coexistent :

- `myday.sn/e/awa-moussa` — générique, pour les groupes WhatsApp.
- `myday.sn/e/awa-moussa/k3f9x` — nominatif. L'enveloppe porte « Pour Aminata Diallo », le RSVP
  est pré-rempli, et la réponse est rattachée à la bonne personne sans qu'elle ait rien à saisir.

Le jeton est court, non devinable, sans donnée personnelle. Le créateur génère ces liens depuis son
tableau de bord et les envoie un par un aux proches ; le lien générique couvre le reste.

### 4.4 Le déroulé de la page

Un scroll narratif. Chaque section entre en scène doucement, jamais de mur de texte.

1. **La carte** — plein format, téléchargeable.
2. **Le compte à rebours** — « J-42 ».
3. **Le programme** — timeline verticale des cérémonies. Pour chacune : nom, date, heure, lieu,
   dress code, une ligne de contexte, et un bouton « Ajouter à mon agenda » produisant un `.ics`.
4. **Les lieux** — carte interactive, bouton « Itinéraire » vers Google Maps ou Waze, et surtout
   **un repère en clair** (« en face de la station Total de Sacré-Cœur 3 »). Au Sénégal l'adresse
   formelle ne guide personne, le repère guide tout le monde. Le champ repère est de premier rang,
   pas une note secondaire.
5. **Le dress code** — la palette en visuel, le tissu commun s'il y en a.
6. **Le RSVP** — deux boutons pleine largeur : « Je serai là » / « Je ne peux pas ». Les questions
   secondaires n'apparaissent qu'ensuite : nombre de personnes, **quelles cérémonies**, un mot.
   Nom et téléphone, rien d'autre. Modifiable tant que l'événement n'a pas eu lieu.
7. **Le mot des mariés** — photo et quelques lignes, optionnel.
8. **Le livre d'or** — les messages laissés par les invités, visibles de tous, modérables.
9. **La cagnotte** — participation via Wave ou Orange Money, avec message. Montants masqués aux
   autres invités par défaut.
10. **La galerie partagée** — s'ouvre le jour J : les invités déposent leurs photos. C'est ce qui
    fait vivre le lien après l'événement et ramène tout le monde sur le produit.
11. **Contacts utiles** — « Une question ? Écrire à Fatou », lien direct WhatsApp.
12. **Pied de page** — « Créé avec MyDay — créez la vôtre ». Discret, permanent. C'est le moteur
    d'acquisition.

Un bouton de partage WhatsApp reste accessible en permanence.

### 4.5 Contraintes de terrain

Ces exigences priment sur l'esthétique en cas de conflit :

- **Premier rendu utile en moins de 2 secondes sur 3G.** La page invité est rendue côté serveur et
  servie quasi statique ; seuls le RSVP, le livre d'or, la galerie et la cagnotte sont des îlots
  interactifs hydratés à la demande.
- **Budget JavaScript initial : 60 Ko compressés** pour la page invité. Mesuré à chaque livraison.
- **Images** en AVIF/WebP, dimensionnées, chargées paresseusement sous la ligne de flottaison.
- **Consultable hors-ligne** après une première visite (service worker) — l'invité vérifie souvent
  l'adresse en route, dans une zone mal couverte.
- **Sans JavaScript**, tout le contenu informatif reste lisible.

---

## 5. Expérience créateur

### 5.1 L'accueil

L'accueil est à la fois une vitrine et la galerie — pas l'un puis l'autre.

- **En-tête** : trois vraies cartes du catalogue, une par type d'événement, légèrement inclinées
  comme des cartons qu'on tient en main, qui se posent en séquence à l'ouverture. Sous le titre,
  un seul lien discret — « Voir ce que reçoivent vos invités » — qui rejoue l'ouverture de
  l'enveloppe sur une invitation d'exemple. Le spectacle est du côté invité, pas de l'accueil.
- **La barre d'identité**, immédiatement sous l'en-tête : « Vos prénoms » et « Date ». Renseignée
  une fois, **tout le catalogue se réaffiche avec ces informations**. Chaque vignette devient
  l'invitation du visiteur. C'est la signature du produit ; c'est aussi le guidage le plus efficace,
  puisqu'on ne compare plus des modèles abstraits mais des versions de son propre événement.
  Mémorisée localement, reprise dans l'éditeur.
- **Collections éditoriales** — « Mariage moderne & doré », « Baptême tout en douceur »,
  « Traditionnel revisité ». Le même fonds vu sous dix angles : c'est ce qui empêche un catalogue
  de 60 gabarits de paraître vide.
- **Nos créateurs** — visage, nom, une phrase, leurs modèles. Gratuit, authentique, et impossible
  à copier pour un concurrent qui vend du template générique. Transforme un catalogue en maison
  d'édition.
- **Comment ça marche** — trois étapes, illustrées par le produit réel.
- **Preuve** — au lancement, pas de compteur de clients mais ce qui est vrai : « Livré sur WhatsApp
  en 2 minutes », les créateurs, puis les vraies invitations dès les premiers clients.

### 5.2 La galerie

Grille dense en mosaïque, mobile d'abord. Filtres légers et toujours accessibles : type
d'événement, ambiance, couleur. Chaque gabarit existe en trois à quatre variantes de palette —
60 gabarits produisent ainsi près de 200 vignettes visuellement distinctes.

### 5.3 Le guidage

Trois principes.

**Visuel, jamais textuel.** Pas de boutons radio. Deux images plein écran : « Laquelle vous
attire ? ». Trois écrans, six images, dix secondes. Personne ne sait nommer son style, tout le
monde sait le reconnaître.

**Optionnel et permanent.** La galerie s'affiche d'abord. « Aidez-moi à choisir » reste accessible
partout, y compris après cinq minutes d'hésitation. Il n'est jamais un péage.

**Il produit un résultat, pas un filtre.** À la fin : « Votre style : Moderne & doré » — un
moodboard nommé, huit modèles, partageable sur WhatsApp. Ça fait revenir, et ça fait entrer une
deuxième personne dans le produit.

Sous le capot : chaque option porte des étiquettes, chaque gabarit aussi ; le score est une simple
intersection pondérée. Aucun modèle de langage n'est nécessaire.

### 5.4 La fiche modèle

Grand aperçu déjà personnalisé, variantes de couleur, nom du créateur, prix — et surtout
**un aperçu de l'ouverture** : le créateur voit exactement ce que ses invités verront. C'est ce
qui vend le produit.

### 5.5 L'éditeur

Un parcours en étapes, une décision par écran, aperçu toujours visible.

1. **La carte** — champs dynamiques issus de la définition du gabarit. Photo avec recadrage manuel
   au doigt. Le guidage continue ici : formulations toutes prêtes (français et wolof) pour les
   textes d'intro, contrôle de longueur pour qu'aucun texte ne déborde du cadre, signalement de ce
   qui manque.
2. **Le programme** — ajout des cérémonies, une par une, avec date, heure, lieu, repère, dress code.
3. **Les détails** — dress code global, mot des mariés, contacts utiles, musique.
4. **Les réglages** — activation du livre d'or, de la cagnotte, de la galerie photo.
5. **Aperçu** — l'expérience invité complète, telle quelle.
6. **Publier** — le paiement.

Le brouillon est sauvegardé en continu et vit dans une URL secrète, doublée d'une référence locale
au navigateur. **Aucun compte n'est demandé.** Le compte se crée automatiquement au paiement, à
partir du numéro de téléphone.

### 5.6 Publication et livraison

Au paiement confirmé : le lien est activé, le rendu haute résolution est produit, et un message
WhatsApp part avec le lien, le PNG et le PDF. En cas d'échec WhatsApp, repli sur une page de
téléchargement dont l'adresse est affichée à l'écran.

### 5.7 Le tableau de bord

Qui a répondu, combien de personnes attendues **par cérémonie**, les non-répondants, une relance
WhatsApp en un clic, export CSV, génération des liens nominatifs, modération du livre d'or et de la
galerie, suivi de la cagnotte.

---

## 6. Back-office

Réservé aux graphistes et à l'administration.

- Téléversement d'un gabarit SVG, détection automatique des champs nommés, définition manuelle de
  leur type, de leur longueur maximale et des zones photo.
- Aperçu de rendu immédiat avec des valeurs d'exemple — un gabarit ne peut être publié sans avoir
  été rendu correctement au moins une fois.
- Variantes de palette, étiquettes d'ambiance, prix, statut.
- Suivi des ventes et du revenu partagé par créateur.

---

## 7. Modèle de données

PostgreSQL via Drizzle. Les structures variables (valeurs de champs, définitions de gabarit)
vivent en JSON dans des colonnes dédiées.

Drizzle plutôt que Prisma : la CLI Prisma traîne des dépendances vulnérables hors de portée d'un
override, embarque des pilotes qu'on n'utilise pas, et pèse lourd en environnement sans serveur.
Drizzle produit des migrations en SQL lisible et un client minuscule, ce qui sert directement le
budget de performance de la page invité (§4.5).

```
User            id, phone, name, email?, createdAt
                → un compte est créé au premier paiement

Designer        id, name, bio, photoUrl, contact, revenueSharePct, payoutMethod

Template        id, slug, eventType, designerId, name, svgSource, previewUrl,
                fields (JSON), tags[], price, status, salesCount
TemplateVariant id, templateId, name, palette (JSON), previewUrl

QuizQuestion    id, eventType, order, prompt, options (JSON: label, imageUrl, tags[])

Event           id, slug, ownerId?, templateId, variantId, title, fieldValues (JSON),
                status (draft|published|archived), theme (JSON), dressCode,
                hostMessage, musicUrl, coverUrl, featureFlags (JSON),
                draftSecret, publishedAt, createdAt
                → featureFlags : livre d'or, cagnotte, galerie photo

Ceremony        id, eventId, order, name, startsAt, endsAt?, venueName, address,
                landmark, lat?, lng?, dressCode?, note?

Guest           id, eventId, fullName, phone?, token, invitedCeremonyIds[]
Rsvp            id, eventId, guestId?, name, phone, attending, partySize,
                ceremonyIds[], message?, createdAt, updatedAt

GuestbookEntry  id, eventId, authorName, message, status (pending|approved|hidden), createdAt
Photo           id, eventId, uploaderName?, url, status, createdAt
Contribution    id, eventId, contributorName, phone?, amount, message?, paymentId, status

Payment         id, kind (publication|contribution), eventId, provider,
                providerRef, amount, currency, status, rawPayload (JSON), createdAt
RenderJob       id, eventId, status, pngUrl, pdfUrl, error?, createdAt
Delivery        id, eventId, channel, recipient, status, sentAt, error?
```

Anticipation de la Phase 2 (annuaire de prestataires) : `Event` est déjà l'objet pivot auquel des
réservations pourront se rattacher. Aucune migration ne sera nécessaire.

---

## 8. Architecture technique

- **Next.js (App Router) + TypeScript + Tailwind**, déployé sur Vercel.
- **PostgreSQL + Drizzle.** Le RSVP, les cérémonies et les invités sont relationnels ; les champs
  variables restent en JSON.
- **Cloudinary** pour les médias et les fichiers produits.
- **Rendu SVG** : dans le navigateur pour la galerie et l'aperçu (substitution de nœuds dans le
  gabarit, aucun appel serveur) ; côté serveur avec `resvg-js` puis `pdf-lib` pour le PNG 300 dpi
  et le PDF de livraison. Le rendu HD s'exécute en tâche de fond, déclenché par le webhook de
  paiement.
- **Le texte est vectorisé en tracés avant tout rendu**, par `opentype.js`. `resvg-js` ignore les
  polices qu'on lui passe en mémoire et n'honore pas `loadSystemFonts: false` — vérifié à
  l'implémentation : une famille inexistante rend le même fichier que Great Vibes. Sans
  vectorisation, les calligraphies des gabarits disparaîtraient de la carte livrée sur un serveur
  Linux nu. La vectorisation supprime cette dépendance, rend le navigateur et le serveur identiques
  par construction, et empêche d'extraire le texte d'un gabarit.
- **Paiement** derrière une interface unique `PaymentProvider` — Wave et Orange Money au lancement,
  carte bancaire branchable pour la diaspora sans toucher au reste.
- **WhatsApp Business Cloud API** pour la livraison, les relances de brouillon et les rappels.
- **Séparation stricte** : la page invité ne dépend d'aucun code de l'éditeur. Ce sont deux
  applications qui partagent une base, pas une application avec deux modes.

---

## 9. Direction visuelle

### 9.1 Le principe qui gouverne tout : les cartes sont le contenu

Les gabarits portent déjà tout le décor — calligraphies, ornements, dorures, couleurs saturées.
**Une interface décorée entrerait en concurrence avec eux.** L'interface est donc calme, et les
cartes sont ce qu'on regarde. Calme ne veut pas dire fade : la sobriété est un cadre, pas une
absence de parti pris.

### 9.2 Ce qu'on refuse, et pourquoi

Le réflexe, pour un produit d'invitations de mariage, serait : fond crème, serif à fort contraste,
accent terre cuite ou doré, grain de papier. C'est le cliché du genre, et c'est aussi la signature
de la production automatisée. On ne le fait pas.

On refuse également : le fond crème (les cartes sont déjà crème — les poser dessus les efface) ;
les cartes d'interface uniformes à coins arrondis et ombre grise (on afficherait des cartes dans
des cartes) ; les étiquettes en capitales espacées au-dessus des titres ; la flèche « → » collée
aux boutons ; les dégradés décoratifs sans fonction.

### 9.3 Le parti pris : trois célébrations, trois identités

Le choix du type d'événement est la première décision de l'utilisateur et elle détermine tout ce
qu'il verra ensuite. **Chaque type porte donc sa couleur, et cette couleur le suit** de l'accueil
jusqu'à la page d'invitation publiée. À tout moment il sait quelle fête il prépare, sans qu'aucun
texte n'ait à le lui rappeler. C'est un repère structurel, pas un ornement.

Les trois couleurs viennent de la tradition textile ouest-africaine, pas d'une palette de mariage
européenne.

| Événement | Couleur | Ancrage |
|---|---|---|
| Mariage | **Indigo** `#2C3A80` | Le prestige de la teinture ouest-africaine |
| Baptême | **Vert profond** `#1F6B4A` | Le vert des tissus de cérémonie, la vie qui commence |
| Anniversaire | **Ambre** `#C9700F` | L'ocre et l'ambre du bazin, la chaleur de la fête |

### 9.4 Palette

```
--fond        #F7F8FA   Blanc froid légèrement bleuté. Fait ressortir les cartes,
                        qui sont chaudes. Jamais de crème.
--surface     #FFFFFF   Les zones qui portent du contenu
--trait       #E3E6EC   Séparations, contours discrets
--encre       #14161D   Texte principal
--encre-douce #5A6070   Texte secondaire, légendes
--evenement   variable  La couleur du type choisi (§9.3)
```

Une seule couleur d'accent à la fois, celle de l'événement en cours. Pas de seconde couleur
décorative. Les couleurs sémantiques (succès, alerte) sont distinctes de l'accent.

**Exception : la page d'invitation.** Le moment de l'enveloppe s'ouvre dans le sombre — c'est le
seul écran du produit qui quitte le blanc froid, parce que le contraste de bascule *vers* la carte
en fait tout l'effet. Après l'ouverture, la page reprend la lumière et la couleur de l'événement.

### 9.5 Typographie

Les cartes portent des écritures ornées. L'interface prend le contre-pied : **une grotesque
contemporaine, une seule famille**.

**Bricolage Grotesque** — variable, du 200 au 800, avec un caractère propre (terminaisons
franches, largeur légèrement condensée). Ni Inter, qui est le défaut de tout le monde, ni un serif
à fort contraste, qui est le cliché du faire-part.

```
Titre d'écran   40/44   poids 600   interlettrage -0.02em
Sous-titre      24/30   poids 500
Corps           16/26   poids 400
Légende         14/20   poids 400   couleur --encre-douce
Bouton          16/16   poids 600
```

Longueur de ligne plafonnée à 66 caractères. Casse normale partout : ni capitales décoratives, ni
petites capitales.

### 9.6 Mise en page

Mobile d'abord, colonne unique, marge latérale de 20 px. Au-delà de 720 px le contenu se centre
sans dépasser 1100 px.

**Accueil.** Ce qu'il y a de plus caractéristique dans ce monde, c'est la carte elle-même.
L'accueil montre donc de vraies cartes du catalogue, légèrement inclinées comme des cartons qu'on
tient en main — et déjà porteuses des prénoms saisis (§5.1). Pas d'illustration abstraite, pas de
photo d'agence.

**Galerie.** Deux colonnes sur téléphone, trois au-delà. Les vignettes n'ont ni cadre, ni ombre,
ni fond : juste l'image et son nom. Les filtres sont des pastilles, l'active prenant la couleur de
l'événement.

**Éditeur.** L'aperçu occupe le haut et y reste collé au défilement, le formulaire glisse dessous.
Un liseré de la couleur de l'événement borde l'aperçu — le seul endroit où la couleur est large.

### 9.7 Mouvement

Deux moments orchestrés, pas plus :

1. **L'ouverture de l'enveloppe**, côté invité — le seul effet spectaculaire du produit, et il est
   à sa place puisqu'il met en scène le geste réel de recevoir un carton.
2. **La pose des cartes à l'accueil**, en séquence, à 60 ms d'intervalle.

Tout le reste du mouvement répond à une action : un aperçu qui se met à jour fond en 120 ms plutôt
que de sauter. `prefers-reduced-motion` supprime tout, y compris l'enveloppe, remplacée par un
fondu.

### 9.8 Écriture

Le ton s'adresse à quelqu'un qui prépare une fête, pas à un utilisateur de logiciel. Vouvoiement.

- « Votre invitation, prête ce soir. » plutôt que « Créez des invitations personnalisées en
  quelques clics ».
- Les boutons disent ce qui arrive : « Voir les modèles », « Personnaliser », « Partager sur
  WhatsApp ». Jamais « Soumettre » ni « Continuer » seul.
- Un écran vide invite : « Aucun modèle avec ces filtres. Retirez-en un pour en voir plus. »
- Une erreur dit quoi faire : « Votre photo dépasse 8 Mo. Choisissez-en une plus légère. »

### 9.9 Identité

Le symbole est **un carton d'invitation incliné à 9°**, marqué d'un disque — le jour — au-dessus de
deux lignes de texte. Le logotype est « MyDay » en Bricolage Grotesque 600 : *My* à l'encre, *Day*
dans la couleur de l'événement en cours, à l'encre hors contexte d'événement. Fichiers dans
`brand/`.

### 9.10 Plancher de qualité

Responsive jusqu'à 320 px. Focus clavier visible. Contraste AA sur tout le texte.
`prefers-reduced-motion` respecté. Aucune police bloquant l'affichage : `font-display: swap` et une
pile système en repli — sur réseau lent, le texte s'affiche avant la police.

## 10. Sécurité et confidentialité

- Les brouillons sont protégés par un secret d'URL non devinable ; aucune énumération possible.
- Les jetons invités sont courts, aléatoires, sans donnée personnelle.
- Les numéros de téléphone des invités ne sont visibles que du propriétaire de l'événement.
- Livre d'or et galerie photo passent par une modération activable, avec limitation de débit et
  filtrage anti-abus. Le créateur peut masquer n'importe quelle contribution.
- Les webhooks de paiement sont vérifiés par signature ; aucun rendu ni aucune livraison n'est
  déclenché sans confirmation authentifiée. Traitement idempotent.
- Une invitation publiée est publique par nature : le créateur doit le savoir, et pouvoir dépublier.

---

## 11. Périmètre

**Dans le V1 :** galerie personnalisée aux prénoms, guidage visuel, fiche modèle avec aperçu de
l'ouverture, éditeur guidé, page invitation complète (ouverture, programme multi-cérémonies, lieux
avec repères, dress code, RSVP), liens nominatifs, livre d'or, cagnotte, galerie photo partagée,
paiement Wave et Orange Money, livraison WhatsApp, tableau de bord RSVP avec relances, back-office
gabarits, contenu de la vitrine.

**Hors périmètre :** annuaire de prestataires et réservation (Phase 2), assistant conversationnel,
détection de visage au recadrage, application native, gestion de tables et de plan de salle,
multi-langue au-delà de formulations wolof ponctuelles.

---

## 12. Ordre de construction

L'ordre est dicté par le risque, pas par le confort.

| Jalon | Contenu | Pourquoi ici |
|---|---|---|
| 0 | **Épreuve du moteur de rendu** sur un vrai gabarit : polices, dégradés, export Figma → SVG → PNG 300 dpi → PDF | Le seul risque capable de faire mentir tout le planning. Deux à trois jours, avant toute autre ligne de code |
| 1 | Fondations : projet, base, système de jetons visuels, composants de base | Tout en dépend |
| 2 | **Page invitation** : ouverture, programme, lieux, dress code, RSVP, partage, aperçu de partage | Le cœur du produit, et ce qui doit être irréprochable |
| 3 | Galerie personnalisée, guidage visuel, fiche modèle | L'entrée du tunnel |
| 4 | Éditeur guidé et brouillons | Relie les deux |
| 5 | Paiement, publication, rendu HD, livraison WhatsApp | Ferme la boucle économique |
| 6 | Tableau de bord RSVP et relances | Valeur pour le créateur |
| 7 | Liens nominatifs, livre d'or, galerie photo, cagnotte | Enrichissements — détachables si le calendrier serre |
| 8 | Back-office gabarits, catalogue complet, durcissement, tests réels | Mise en production |

---

## 13. Risques

- **Fidélité du rendu SVG.** ~~Traité au jalon 0.~~ **Levé** — le jalon 0 a effectivement trouvé le
  défaut annoncé, sous une forme plus grave que prévu : `resvg-js` ignorait les polices fournies.
  La vectorisation du texte (§8) le résout définitivement. Reste à surveiller que les effets Figma
  et Canva survivent à l'export SVG, ce qui relève du cahier de contraintes imposé aux graphistes.
- **Accès aux API marchands Wave et Orange Money.** KYC entreprise et homologation, souvent
  sous-estimés en délai. À engager en parallèle du jalon 1, pas au jalon 5.
- **Compte Meta Business vérifié** pour WhatsApp Cloud API. Même logique : démarche lancée tôt.
- **Cagnotte.** Encaisser pour le compte d'un tiers puis reverser soulève des questions de
  conformité et de trésorerie qui dépassent la technique. À cadrer avant le jalon 7 ; le reste du
  V1 n'en dépend pas.
- **Droits sur les gabarits.** Les contrats avec les graphistes doivent couvrir explicitement la
  revente de versions personnalisées. À confirmer par écrit.
- **Performance sur le terrain.** Le budget de la page invité doit être vérifié sur un vrai
  appareil et un vrai réseau, pas en local.

---

## 14. Critères d'acceptation

1. Une cliente crée, personnalise, paie et publie une invitation en moins de dix minutes sur
   téléphone, sans jamais créer de compte avant le paiement.
2. Le lien partagé dans WhatsApp affiche une vignette montrant la vraie invitation.
3. Un invité ouvre le lien et obtient un premier rendu utile en moins de deux secondes sur 3G.
4. L'animation d'ouverture se joue une fois, reste passable, et n'empêche jamais l'accès aux
   informations.
5. Un invité répond au RSVP en moins de dix secondes, en choisissant les cérémonies auxquelles il
   assistera, sans créer de compte.
6. Le créateur voit en temps réel le nombre de personnes attendues par cérémonie et relance les
   non-répondants sur WhatsApp en un clic.
7. Le fichier haute résolution livré est visuellement identique à l'aperçu.
8. Aucune livraison n'a lieu sans confirmation de paiement authentifiée.
9. Un graphiste publie un nouveau gabarit sans intervention du développeur.
10. La page invitation reste lisible sans JavaScript et consultable hors-ligne après une visite.
