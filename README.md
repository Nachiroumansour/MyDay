# MyDay

Plateforme sénégalaise d'invitations d'événement — mariage, baptême, anniversaire.

Le produit n'est pas un générateur de fichier : **c'est un lien**. Le client crée
une invitation, la publie, et obtient une adresse à partager dans ses groupes
WhatsApp. L'invité l'ouvre, une enveloppe se descelle, la carte se déploie, puis
se déroule le plan de l'événement — programme, lieux, tenue, réponse. Le PNG
haute définition et le PDF restent livrés, mais comme sous-produits.

- **Cadrage produit et design** — `docs/superpowers/specs/2026-09-07-myday-design.md`
- **À transmettre aux graphistes** — `docs/cahier-des-charges-graphistes.md`

---

## Démarrer

```bash
npm install
docker compose up -d                 # PostgreSQL sur le port 5435
cp apps/web/.env.example apps/web/.env
cd apps/web
npm run bdd:migrer                   # applique les migrations
npm run bdd:semer                    # 16 modèles et un événement de démonstration
npm run dev
```

L'accueil est sur `http://localhost:3000`, l'invitation de démonstration sur
`/e/aminata-ibrahima`, et le back-office sur `/admin`.

## Vérifier

```bash
npm test                             # 224 tests unitaires + typage, à la racine
cd apps/web
npm run verifier:parcours            # les quatre parcours, dans un vrai navigateur
npm run mesurer /e/aminata-ibrahima  # le poids réseau, face au budget de la spec
npm run capturer                     # captures d'écran, mobile et bureau
```

Le moteur de rendu a sa propre épreuve visuelle :

```bash
cd packages/moteur && npm run epreuve   # écrit des cartes dans packages/moteur/epreuve/
```

---

## Ce qu'il faut savoir avant de toucher au code

**La page invitation est rendue hors du routeur de Next.** Elle vit dans
`src/app/e/[slug]/route.tsx` et non dans un `page.tsx`, parce que le routeur
embarque plus de 400 Ko de socle React même sans un seul composant client —
onze secondes sur une 3G dakaroise, sur la page que tous les invités ouvrent.
Rendue en HTML statique avec Preact et le CSS en ligne, elle pèse 71 Ko et
**zéro JavaScript de cadre**. Le formulaire de réponse est un formulaire HTML
ordinaire, sa révélation progressive se fait en CSS : il marche sans JavaScript.
Le seul script est l'ouverture de l'enveloppe, quelques centaines d'octets.

Si vous ajoutez quelque chose à cette page, mesurez : `npm run mesurer`.

**Le texte des cartes est vectorisé avant tout rendu.** `resvg-js` ignore les
polices qu'on lui passe en mémoire et n'honore pas `loadSystemFonts: false` —
vérifié : une famille inexistante rend le même fichier que Great Vibes. Sans
vectorisation, les calligraphies disparaîtraient des cartes livrées sur un
serveur sans polices installées. `vectoriserTextes` convertit chaque `<text>` en
tracés avec `opentype.js` ; toute police réclamée par un gabarit doit se trouver
dans `apps/web/polices/`.

**Rien n'est publié ni livré avant confirmation authentifiée du paiement.** La
signature des webhooks est vérifiée en temps constant avant toute écriture, et
la confirmation est idempotente — les fournisseurs rejouent leurs webhooks.

**Aucun compte n'est demandé avant le paiement.** Un brouillon vit dans une URL
secrète. C'est cette adresse que le client garde pour revenir modifier son
invitation et suivre les réponses.

---

## Configuration

Tout est dans `apps/web/.env` — voir `.env.example`.

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | PostgreSQL |
| `NEXT_PUBLIC_ORIGINE` | Origine absolue. Sans elle, WhatsApp n'affiche aucun aperçu de partage |
| `PAIEMENT_SIMULE` | Fournisseur de paiement factice. **Jamais en production avec de vrais clients** |
| `WAVE_CLE_API`, `WAVE_SECRET_WEBHOOK` | Wave |
| `ORANGE_ID_CLIENT`, `ORANGE_SECRET_CLIENT`, `ORANGE_CLE_MARCHAND`, `ORANGE_SECRET_WEBHOOK` | Orange Money |
| `WHATSAPP_ID_NUMERO`, `WHATSAPP_JETON` | WhatsApp Business Cloud API |
| `ADMIN_MOT_DE_PASSE`, `ADMIN_SECRET_SESSION` | Back-office. Sans eux il reste fermé |

Le fournisseur simulé s'efface dès qu'un vrai moyen de paiement est configuré.

---

## Ce qui reste à faire hors du code

Ces trois points décideront de la date de lancement, pas le développement :

1. **Accès marchand Wave et Orange Money** — KYC entreprise et homologation.
   Les adaptateurs sont écrits contre les API documentées mais **non vérifiés en
   conditions réelles**.
2. **Compte Meta Business vérifié** pour l'API WhatsApp, même logique.
3. **Le catalogue.** 15 à 20 modèles par type d'événement, livrés en SVG selon
   `docs/cahier-des-charges-graphistes.md`. Le dépôt vérifie chaque gabarit et
   refuse ceux qui ne se rendent pas — le graphiste voit le problème tout de
   suite.

Et une décision qui n'est pas technique : **le reversement de la cagnotte**. Les
participations sont encaissées et présentées aux hôtes, mais rien n'est reversé
automatiquement. Encaisser pour le compte d'un tiers relève de la conformité et
de la trésorerie.

---

## Organisation

```
packages/moteur/    Le moteur de rendu. Aucune dépendance à Next ni au navigateur.
apps/web/
  src/app/          Routes. La page invitation est une route, pas une page.
  src/vues/         Les composants de la page invitation, rendus en HTML statique.
  src/lib/          Logique pure et testée : dates, agenda, validation, statistiques.
  src/serveur/      Base, paiement, stockage, livraison.
  gabarits/         Modèles de démonstration.
  polices/          Polices exigées par les gabarits.
brand/              Le logo et ses déclinaisons.
docs/               Spec, plan et cahier de contraintes.
```
