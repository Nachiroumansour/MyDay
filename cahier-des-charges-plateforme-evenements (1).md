# Cahier des charges — MVP Plateforme événementielle sénégalaise
### Cartes & affiches personnalisées (mariage, baptême, anniversaire)
Version dev — Août 2026

---

## 0. Objectif du document

Ce document traduit le document de cadrage projet en spécification exploitable par le développeur.
Il couvre uniquement le **MVP (cartes & affiches)** — la Phase 2 (annuaire de prestataires) est
volontairement laissée hors périmètre technique pour l'instant, mais son impact sur le modèle de
données est anticipé pour éviter une refonte plus tard.

**Décision technique actée (diffère du document de cadrage) :** le moteur de rendu ne sera **pas**
un outil tiers (Placid / Templated.io) mais un **moteur de rendu SVG maison**, développé par Manou.
Raison : plus de contrôle sur le rendu final, pas de dépendance à un service tiers payant/limité en
volume, et le format SVG + champs nommés se prête bien à un moteur simple (remplissage de balises
`<text>`/`<image>` dans un gabarit SVG, export en PNG haute résolution + PDF côté serveur). Cette
décision est reflétée dans la Brique 1 ci-dessous.

---

## 1. Périmètre du MVP

**Dans le périmètre :**
- Sélection du type d'événement (mariage / baptême / anniversaire)
- Questionnaire guidé (filtres) → recommandation de 3 à 5 modèles
- Personnalisation d'un modèle (texte, photo, infos événement)
- Prévisualisation fidèle au rendu final
- Paiement Wave / Orange Money
- Livraison du fichier (PNG HD + PDF) via WhatsApp Business API
- Back-office minimal pour les graphistes (upload de gabarits, définition des champs)

**Hors périmètre (Phase 2, à anticiper dans le modèle de données uniquement) :**
- Annuaire de prestataires, réservation, paiement échelonné, tableau de bord multi-prestataires

---

## 2. Architecture technique

Approche cohérente avec Modly (stack déjà maîtrisée) : backend NestJS + MongoDB, mobile React Native
+ Expo + TypeScript. Le moteur de rendu SVG est un service isolé (peut tourner dans le même backend
au démarrage, extractible en microservice plus tard si la charge de rendu devient significative).

```
┌─────────────────────┐        ┌──────────────────────────┐
│  App mobile (RN +   │  API   │  Backend NestJS           │
│  Expo, TypeScript)  │◄──────►│  - Auth                   │
│  - Choix événement  │        │  - Catalogue de modèles   │
│  - Questionnaire    │        │  - Moteur de rendu SVG    │
│  - Personnalisation │        │  - Paiement (Wave/OM)     │
│  - Preview          │        │  - Livraison WhatsApp     │
│  - Paiement         │        └───────────┬───────────────┘
└─────────────────────┘                    │
                                            ▼
                              ┌─────────────────────────┐
                              │  MongoDB (modèles,       │
                              │  commandes, graphistes)  │
                              │  Cloudinary (assets,     │
                              │  fichiers générés)       │
                              └─────────────────────────┘
```

---

## 3. Stack recommandée

| Couche | Choix | Justification |
|---|---|---|
| Mobile | React Native + Expo + TypeScript | Cohérent avec Modly, réutilisable |
| Backend | NestJS | Cohérent avec Modly |
| Base de données | MongoDB | Cohérent avec Modly, schéma de gabarit flexible (champs variables par modèle) |
| Stockage médias | Cloudinary | Déjà en place sur Modly, gère bien le PNG/PDF haute résolution |
| Moteur de rendu | Service maison en Node (librairie SVG côté serveur, ex. `resvg` / `sharp` pour l'export PNG, `svg-to-pdf` ou équivalent pour le PDF) | Décision actée — voir §0 et Brique 1 |
| Paiement | API marchand Wave + API marchand Orange Money | Imposé par le marché sénégalais |
| Livraison | WhatsApp Business Cloud API (Meta) | Imposé par le document de cadrage |
| Notifications | Firebase (déjà en place sur Modly) | Rappels de commande, statut de paiement |

---

## 4. Modèle de données (schéma MongoDB)

### `EventType`
```
{
  _id, nom: "mariage" | "bapteme" | "anniversaire",
  questions_guidage: [ { id, texte, options: [ { valeur, tags_associes[] } ] } ]
}
```

### `Template` (le gabarit livré par le graphiste)
```
{
  _id,
  event_type_id,
  nom, apercu_url,
  tags_ambiance: [string],        // ex. "moderne", "traditionnel", "pastel"
  fichier_svg_url,                // le gabarit source
  champs: [
    { id: "nom_1", type: "texte", position: {...}, max_longueur },
    { id: "nom_2", type: "texte", ... },
    { id: "date", type: "date", ... },
    { id: "lieu", type: "texte", ... },
    { id: "texte_intro", type: "texte_long", ... },
    { id: "zone_photo", type: "image", position: {...}, ratio_recadrage }
  ],
  graphiste_id,
  prix, statut: "actif" | "brouillon" | "archive",
  nb_ventes                       // pour le calcul de revenu partagé
}
```

### `Graphiste`
```
{ _id, nom, contact, pourcentage_revenu_partage, iban_ou_mobile_money }
```

### `Commande`
```
{
  _id, client_id (ou contact WhatsApp si pas de compte),
  template_id, event_type_id,
  valeurs_champs: { nom_1: "...", date: "...", zone_photo: url_uploadée, ... },
  fichier_genere: { png_url, pdf_url },
  statut: "brouillon" | "paye" | "livre" | "echec_paiement",
  paiement: { provider: "wave" | "orange_money", reference, montant, date },
  livraison: { whatsapp_numero, date_envoi, statut_envoi },
  created_at
}
```

*Anticipation Phase 2 (non implémenté au MVP) : `Commande` pourra référencer un `evenement_id` commun
regroupant plusieurs achats (carte + futures réservations de prestataires) — prévoir ce champ optionnel
dès maintenant pour éviter une migration.*

---

## 5. Parcours utilisateur → écrans à développer

1. **Écran d'accueil** — 3 tuiles : Mariage / Baptême / Anniversaire
2. **Questionnaire guidé** — 3 à 5 questions max (ambiance, couleurs, style), génère un vecteur de tags
3. **Résultats** — grille de 3 à 5 modèles recommandés (filtrage par tags, pas d'IA générative nécessaire pour la V1 du guidage)
4. **Fiche modèle** — aperçu grand format, bouton "Personnaliser"
5. **Formulaire de personnalisation** — champs dynamiques générés depuis `template.champs` (noms, date, lieu, texte, upload photo avec recadrage guidé par `zone_photo`)
6. **Prévisualisation** — rendu SVG→PNG en temps réel (ou quasi) à partir des valeurs saisies
7. **Paiement** — choix Wave / Orange Money, redirection ou SDK natif selon ce que proposent les APIs marchands
8. **Confirmation & livraison** — écran de confirmation + envoi automatique sur WhatsApp (numéro saisi ou récupéré du compte)

---

## 6. Spécification des 4 briques

### Brique 1 — Moteur de rendu (SVG maison)
- Entrée : `template.fichier_svg_url` + `valeurs_champs`
- Traitement serveur : parser le SVG, remplacer les nœuds `<text>` correspondant aux `id` de champs par les valeurs saisies, insérer l'image uploadée (recadrée/centrée) dans la `zone_photo`
- Sortie : export PNG haute résolution (300 dpi minimum) + export PDF
- Point d'attention : la détection de visage automatique mentionnée dans le document de cadrage (pour bien centrer la photo) n'est **pas indispensable au MVP** — un recadrage manuel simple (pinch/zoom sur l'app) suffit pour la V1, à améliorer plus tard si besoin
- Librairies à évaluer : `resvg-js` ou `sharp` (rendu SVG→raster), `pdf-lib` ou conversion via un headless renderer pour le PDF

### Brique 2 — Guidage / recommandation
- V1 : logique de filtres simples (arbre de décision basé sur les tags du questionnaire vs `tags_ambiance` des templates) — pas besoin d'IA/LLM pour démarrer
- Évolution possible : assistant conversationnel plus tard, hors périmètre MVP

### Brique 3 — Paiement
- Intégration API marchand Wave (à vérifier : sandbox/documentation développeur disponible)
- Intégration API marchand Orange Money
- Webhook de confirmation de paiement → déclenche le rendu final + la livraison

### Brique 4 — Livraison
- WhatsApp Business Cloud API (Meta) : envoi du PNG + PDF en pièce jointe au numéro du client dès confirmation du paiement
- Prévoir un fallback (lien de téléchargement dans l'app) si l'envoi WhatsApp échoue

---

## 7. Spécifications pour les graphistes (à leur transmettre séparément)

- Livrer chaque gabarit en **SVG**, avec des identifiants de champs fixes et documentés (`nom_1`, `nom_2`, `date`, `lieu`, `texte_intro`, `zone_photo`, etc.)
- Une `zone_photo` doit être un rectangle/masque clairement défini dans le SVG (position + ratio)
- Catalogue de départ : 15 à 20 modèles par type d'événement
- Format de livraison : SVG natif ou export depuis Figma/Canva vers SVG (à valider que l'export conserve la structure des calques nommés)

---

## 8. API — endpoints proposés (backend NestJS)

```
GET  /event-types
GET  /event-types/:id/questions
POST /recommendations              { event_type_id, reponses[] } → templates[]
GET  /templates/:id
POST /orders                       { template_id, valeurs_champs } → order (brouillon)
POST /orders/:id/preview           → génère un rendu PNG basse résolution (preview)
POST /orders/:id/payment           { provider } → lien/session de paiement
POST /webhooks/wave                (webhook confirmation paiement)
POST /webhooks/orange-money        (webhook confirmation paiement)
POST /orders/:id/deliver           (déclenché en interne après paiement confirmé) → envoi WhatsApp

# Back-office graphiste (minimal, peut être un simple espace admin)
POST /admin/templates              (upload SVG + définition des champs)
PATCH /admin/templates/:id
```

---

## 9. Roadmap suggérée

| Sprint | Contenu |
|---|---|
| 1 | Modèle de données + moteur de rendu SVG sur 2-3 modèles pilotes (avec les 2 graphistes) |
| 2 | Back-office minimal pour upload/gestion des gabarits |
| 3 | App mobile : accueil, questionnaire, résultats, fiche modèle |
| 4 | App mobile : formulaire de personnalisation + preview temps réel |
| 5 | Intégration paiement Wave / Orange Money |
| 6 | Intégration livraison WhatsApp Business API + tests de bout en bout |
| 7 | Catalogue complet (15-20 modèles/événement), durcissement, tests utilisateurs réels |

---

## 10. Critères d'acceptation MVP

- Un client peut choisir un type d'événement, répondre au questionnaire, voir des modèles pertinents, personnaliser, payer et recevoir son fichier sur WhatsApp en moins de 5 minutes, sans intervention manuelle
- Le rendu final (PNG + PDF) est visuellement identique à la prévisualisation
- Le paiement est confirmé avant toute livraison de fichier
- Un graphiste peut ajouter un nouveau modèle sans intervention du développeur (via le back-office)

---

## 11. Risques & questions ouvertes

- **Accès API Wave / Orange Money** : vérifier les conditions d'accès (KYC entreprise, délais d'homologation) avant le sprint 5 — point souvent sous-estimé en délai
- **WhatsApp Business Cloud API** : nécessite un compte Meta Business vérifié, prévoir cette démarche en parallèle du développement, pas à la fin
- **Rendu SVG→PDF/PNG fidèle** : à valider tôt (sprint 1) sur les polices, dégradés et effets utilisés par les graphistes — certains effets Figma/Canva ne se traduisent pas parfaitement en SVG standard
- **Droits sur les gabarits** : s'assurer que les contrats avec les 2 graphistes couvrent explicitement la revente de versions personnalisées (cf. le point licence Freepik soulevé dans le document de cadrage — s'applique par analogie, à faire confirmer par écrit avec les graphistes)
