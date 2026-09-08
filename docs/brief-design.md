# MyDay — brief de design

Document destiné à un designer qui n'a jamais vu le produit. Il décrit ce
qu'est MyDay, pour qui, quels écrans existent et quelles contraintes tiennent.
**Il ne contient volontairement aucune décision visuelle** — couleurs,
typographie, mise en page et animation sont à proposer.

---

## 1. Le produit en une phrase

MyDay permet à une famille sénégalaise de créer une invitation d'événement —
mariage, baptême, anniversaire — de la partager par un lien sur WhatsApp, et de
suivre les réponses de ses invités.

**Ce qu'on vend n'est pas un fichier, c'est un lien.** Le client obtient une
adresse web qu'il partage dans ses groupes WhatsApp. Ses invités l'ouvrent,
découvrent la carte, lisent le programme de l'événement et répondent. Une carte
en haute définition et un PDF imprimable sont livrés en plus, mais ce sont des
sous-produits.

Le lien est aussi le moteur de croissance : chaque événement est vu par cent à
quatre cents personnes qui ont toutes une fête en préparation.

---

## 2. Le marché

**Sénégal, plus la diaspora** (France, Italie, États-Unis), qui finance souvent
les cérémonies au pays.

Ce qu'il faut avoir en tête :

- **Téléphone Android de milieu de gamme**, écran modeste, batterie fatiguée.
- **Réseau lent et intermittent.** La 3G est la norme hors des centres-villes.
- **WhatsApp est le réseau social**, le canal de partage, et souvent le
  navigateur de départ.
- **Le paiement se fait par mobile money** — Wave et Orange Money — pas par
  carte bancaire, sauf pour la diaspora.
- **Un mariage sénégalais tient sur plusieurs jours** : le *ngénte*, le *takk*,
  la réception, parfois une soirée. Chacun a sa date, son lieu et sa tenue.
- **L'adresse formelle ne guide personne.** Ce qui guide, c'est le repère
  parlé : « en face de la station Total de Sacré-Cœur 3 ».
- **Le tissu compte.** Les familles se mettent d'accord sur un bazin ou une
  couleur commune ; c'est une information que les invités attendent.

---

## 3. Les gens

### La cliente

Une femme de 25 à 40 ans, à Dakar ou en diaspora. Elle organise un événement
une à trois fois dans sa vie. Elle prépare une fête, pas un dossier : elle n'a
aucune patience pour un tutoriel et aucune tolérance pour une inscription.
Elle travaille sur son téléphone, souvent le soir.

Ce qu'elle craint : que ça fasse cheap, que ses invités ne répondent pas, de ne
pas savoir combien de personnes prévoir.

### L'invité

N'importe qui, tout âge, tout appareil. Il reçoit un lien dans un groupe
WhatsApp saturé et décide en deux secondes s'il l'ouvre. Il revient deux ou
trois fois avant l'événement, presque toujours pour une seule information :
l'adresse. **Il n'installera jamais rien et ne créera jamais de compte.**

### Le créateur

Un graphiste dakarois qui livre les modèles de cartes et touche un pourcentage
sur chaque vente. Il est un personnage du produit, pas une ligne de crédits :
c'est ce qui distingue une maison d'édition d'une banque de gabarits.

---

## 4. Les écrans

### Côté client

**L'accueil.** Doit faire comprendre le produit en cinq secondes et donner
envie. Il porte une idée forte : le visiteur écrit ses prénoms et une date
dans une barre, et **tout le catalogue se réaffiche aussitôt avec ces
informations** — chaque modèle devient son invitation à lui. Il contient aussi
les trois types de fête, des collections thématiques, les créateurs, et le
fonctionnement en trois étapes.

**La galerie.** Une grille de modèles, filtrable par type de fête et par
ambiance. Le catalogue visera 15 à 20 dessins par type, déclinés en plusieurs
couleurs — donc beaucoup de vignettes visuellement proches. Le classement et
le filtrage comptent autant que la grille elle-même.

**Le guidage.** Trois questions pour aider à choisir. Elles sont **visuelles,
jamais textuelles** : on montre deux images et on demande laquelle attire —
personne ne sait nommer son style, tout le monde sait le reconnaître. Le
guidage est facultatif, accessible partout, et aboutit à un style nommé plutôt
qu'à une liste de filtres.

**La fiche modèle.** Un grand aperçu déjà personnalisé, le nom du créateur, le
prix, ce qui est inclus, et deux actions : personnaliser, ou voir ce que
reçoivent les invités.

**L'éditeur**, en quatre étapes, avec l'aperçu de la carte toujours visible :
la carte (les champs, la photo), le programme (les cérémonies), les détails
(tenue, mot des hôtes, contact), la publication. C'est là que les gens galèrent
le plus : ils ne savent pas quoi écrire. Le produit propose des formulations
toutes prêtes, prévient avant qu'un texte ne déborde du cadre, et rappelle ce
qui manque.

**Le tableau de bord.** Combien de personnes sont attendues, **cérémonie par
cérémonie** — c'est le chiffre qui compte pour qui organise. Plus la liste des
réponses, l'export, et la relance des retardataires.

### Côté invité — l'écran le plus important

Il est vu par cent à quatre cents personnes par événement, contre une seule
pour tous les autres. Il se déroule en trois temps.

**Avant le clic : l'aperçu dans WhatsApp.** La vignette qui s'affiche quand le
lien est collé dans une conversation. **C'est la seule chose que 100 % des
destinataires voient.** Format 1200 × 630.

**L'arrivée.** Un moment mis en scène : l'invitation ne doit pas s'afficher
comme une page web mais se *recevoir*, comme on reçoit du courrier. Un seul
geste de la part de l'invité. Ce moment ne se rejoue jamais pour qui revient,
il est toujours passable, et il ne doit jamais empêcher l'accès aux
informations.

**La page.** Dans l'ordre : la carte, le compte à rebours, le programme des
cérémonies (avec pour chacune la date, l'heure, le lieu, le repère parlé, la
tenue, et de quoi lancer un itinéraire ou l'ajouter à son agenda), la tenue
générale, le mot des hôtes, **la réponse**, et selon ce que le client a ouvert :
un livre d'or, une galerie photo partagée, une cagnotte. Puis un contact
WhatsApp et un bouton de partage.

**La réponse doit prendre dix secondes.** Deux grands choix — je viens / je ne
peux pas — puis seulement ensuite : combien de personnes, à quelles cérémonies,
un mot. Nom et téléphone, rien d'autre. Jamais de compte.

### Côté équipe

Un back-office sobre : dépôt et validation des modèles, gestion des créateurs,
suivi des commandes. Il sert deux ou trois personnes ; il doit être clair, pas
beau.

---

## 5. Les contraintes qui ne se négocient pas

**La page invité doit s'ouvrir en moins de deux secondes en 3G.** Elle est
aujourd'hui servie en HTML quasi statique, sans JavaScript de cadre. Toute
proposition qui exigerait une grosse librairie côté client sur cette page est
à écarter. Les autres pages sont plus souples.

**Elle doit rester lisible sans JavaScript** et consultable hors ligne après
une première visite — l'invité vérifie souvent l'adresse en route, sans réseau.

**Mobile d'abord, jusqu'à 320 pixels de large.**

**Accessible** : contraste suffisant, focus clavier visible,
`prefers-reduced-motion` respecté — toute animation doit pouvoir être coupée.

**Un événement a plusieurs cérémonies.** Ce n'est pas un cas particulier, c'est
la norme. Tout écran qui parle de « la date » ou « le lieu » au singulier est
faux.

**Aucun compte avant le paiement.** Le brouillon vit dans une adresse secrète
que le client conserve.

**Le repère parlé est de premier rang**, pas une note en bas de fiche.

---

## 6. La langue

Tout est en **français**, au **vouvoiement**. Le ton s'adresse à quelqu'un qui
prépare une fête, pas à un utilisateur de logiciel.

- « Votre invitation, prête ce soir. » plutôt que « Créez des invitations
  personnalisées en quelques clics ».
- Un bouton dit ce qui arrive : « Partager sur WhatsApp », jamais « Soumettre ».
- Une erreur dit quoi faire : « Votre photo dépasse 8 Mo. Choisissez-en une
  plus légère. »
- Un écran vide invite plutôt qu'il ne constate.

Quelques mots du domaine à connaître : **ngénte** (cérémonie du baptême, ou
première cérémonie d'un mariage), **takk** (le mariage religieux), **bazin**
(le tissu damassé des tenues de fête). Des formulations en **wolof** sont
proposées à côté des françaises pour les textes d'invitation.

---

## 7. Ce qui est déjà arrêté, et pourquoi

Ce sont des décisions produit, pas des décisions de design — elles tiennent.

| Décision | Raison |
|---|---|
| Web, pas d'application à installer | Le partage passe par WhatsApp : l'invité arrive forcément sur le web. Un install pour un achat unique casse le tunnel |
| On paie **après** avoir créé et vu son résultat | Le client a déjà investi son effort et vu sa carte : c'est le moment de conversion maximal |
| La galerie s'affiche **avant** le guidage | Un questionnaire en préalable est une friction avant toute preuve de valeur, et il tue le coup de cœur |
| Le catalogue se personnalise aux prénoms dès l'accueil | On ne compare plus des modèles abstraits mais des versions de son propre événement |
| Trois types de fête, chacun avec son identité propre | C'est la première décision de l'utilisateur, et elle détermine tout ce qu'il verra ensuite |

---

## 8. Ce qu'on attend du design

Une direction visuelle complète et argumentée : l'univers, la palette, la
typographie, le traitement des cartes du catalogue, le rythme des pages, et le
parti pris d'animation.

Trois questions à trancher en particulier :

**Comment un site qui vend de la belle papeterie doit-il se tenir vis-à-vis
d'elle ?** Les cartes portent déjà calligraphies, ornements et couleurs
saturées. Une interface qui rivalise les écrase ; une interface trop effacée
rend le site ennuyeux. Où placer le curseur ?

**Comment donner de la joie sans faire bon marché ?** Le produit vend de la
fête. Il doit se réjouir avec le client sans ressembler à un gabarit gratuit.

**Comment rendre le moment de l'ouverture mémorable ?** C'est l'instant où
l'invitation cesse d'être une page web pour devenir un objet reçu. C'est la
signature du produit, et le seul écran que voient tous les invités.

---

## 9. Le nom

**MyDay.** Un logo existe, il peut être repris ou revu.
