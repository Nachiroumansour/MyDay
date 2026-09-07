# Bloc 1 — Socle et moteur de rendu — Plan d'implémentation

> **Pour les agents exécutants :** SOUS-SKILL REQUIS — utilisez
> `superpowers:subagent-driven-development` (recommandé) ou
> `superpowers:executing-plans` pour dérouler ce plan tâche par tâche.
> Les étapes utilisent des cases à cocher (`- [ ]`) pour le suivi.

**Objectif :** disposer d'un moteur qui transforme un gabarit SVG et des valeurs
saisies en une carte fidèle — aperçu filigrané dans le navigateur, PNG 300 dpi et
PDF côté serveur — et d'un socle applicatif Next.js portant les jetons de design.

**Architecture :** le moteur vit dans `packages/moteur`, sans aucune dépendance à
Next.js ni au navigateur. Il opère sur un `Document` DOM standard, ce qui permet
d'exécuter **exactement le même code de remplissage** côté serveur (via
`@xmldom/xmldom`) et côté navigateur (via le `DOMParser` natif) — c'est ce qui
garantit que l'aperçu et le fichier livré ne divergent pas, et c'est ce qui rendra
possible la galerie personnalisée du bloc 3. L'application Next.js
(`apps/web`) consomme le moteur.

**Pile technique :** TypeScript, npm workspaces, Vitest, `@xmldom/xmldom`,
`opentype.js` (mesure de texte sans navigateur), `@resvg/resvg-js` (SVG → PNG),
`pdf-lib` (PDF), Next.js 15 App Router, Tailwind CSS v4, PostgreSQL 16 + Prisma.

**Spec :** `docs/superpowers/specs/2026-09-07-myday-design.md`

## Contraintes globales

Elles s'appliquent implicitement à **toutes** les tâches.

- **Node 20 ou plus.** `"type": "module"` partout, ESM exclusivement.
- **Vocabulaire de code en français** pour tout ce qui touche au domaine :
  `gabarit`, `champ`, `cadre`, `evenement`, `ceremonie`, `invite`, `brouillon`,
  `rendu`. Les mots de la plateforme (`Document`, `Buffer`, `props`) restent en
  anglais. Aucun accent ni espace dans les identifiants.
- **Copie produit au vouvoiement**, ton de la spec §9.8 : les boutons disent ce
  qui arrive, les erreurs disent quoi faire.
- **Jetons de design exacts** (spec §9.4) : `--fond #F7F8FA`, `--surface #FFFFFF`,
  `--trait #E3E6EC`, `--encre #14161D`, `--encre-douce #5A6070`. Couleurs
  d'événement : mariage `#2C3A80`, baptême `#1F6B4A`, anniversaire `#C9700F`.
  **Jamais de crème. Jamais de serif à fort contraste. Une seule couleur d'accent
  à la fois.**
- **Typographie** : Bricolage Grotesque, une seule famille, `font-display: swap`,
  pile système en repli.
- **Accessibilité** : responsive dès 320 px, focus clavier visible, contraste AA,
  `prefers-reduced-motion` respecté.
- **Rendu final** : PNG à 300 dpi minimum, PDF à la taille physique réelle du
  gabarit.
- **TDD strict** : le test échoue d'abord, l'implémentation est minimale, on
  commite à chaque tâche.

---

## Structure des fichiers

```
package.json                              workspaces npm
docker-compose.yml                        PostgreSQL 16 local
packages/moteur/
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    index.ts                              surface publique du paquet
    types.ts                              ChampGabarit, ValeursChamps, Recadrage…
    dom.ts                                adaptateurs DOM serveur / navigateur
    gabarit/analyse.ts                    découverte des champs dans un SVG
    gabarit/remplissage.ts                écriture des valeurs texte
    gabarit/ajustement.ts                 mise à l'échelle du texte au cadre
    gabarit/photo.ts                      insertion et recadrage couvrant
    gabarit/filigrane.ts                  surimpression d'aperçu
    rendu/polices.ts                      chargement et mesure des polices
    rendu/png.ts                          SVG → PNG haute résolution
    rendu/pdf.ts                          PNG → PDF à la taille physique
  tests/
    <un fichier par module>
  demo/
    gabarits/*.svg                        gabarits de démonstration
    polices/*.ttf                         polices des gabarits
apps/web/
  package.json
  next.config.ts
  tsconfig.json
  prisma/schema.prisma
  src/app/layout.tsx
  src/app/page.tsx
  src/app/globals.css                     jetons de design et base typographique
  src/serveur/bdd.ts                      client Prisma partagé
```

Chaque module du moteur a une responsabilité unique et se teste seul. Les
fonctions sont pures ou mutent un `Document` qu'on leur passe — jamais d'état
global, jamais d'accès disque hors de `rendu/polices.ts`.

---

### Tâche 1 : Squelette du dépôt et harnais de test

**Fichiers :**
- Créer : `package.json`, `tsconfig.base.json`
- Créer : `packages/moteur/package.json`, `packages/moteur/tsconfig.json`,
  `packages/moteur/vitest.config.ts`, `packages/moteur/src/index.ts`
- Créer : `packages/moteur/tests/fumee.test.ts`

**Interfaces :**
- Consomme : rien.
- Produit : le paquet `@myday/moteur`, importable par les tâches suivantes, et la
  commande `npm test --workspaces` qui doit rester verte jusqu'au bout du plan.

- [ ] **Étape 1 : Écrire le test qui échoue**

`packages/moteur/tests/fumee.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { versionMoteur } from '../src/index.js'

describe('paquet moteur', () => {
  it('expose sa version', () => {
    expect(versionMoteur()).toBe('1.0.0')
  })
})
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd packages/moteur && npx vitest run
```

Attendu : ÉCHEC — le paquet n'existe pas encore.

- [ ] **Étape 3 : Écrire la configuration minimale**

`package.json` à la racine :

```json
{
  "name": "myday",
  "private": true,
  "type": "module",
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "test": "npm test --workspaces --if-present"
  }
}
```

`tsconfig.base.json` à la racine :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "verbatimModuleSyntax": true
  }
}
```

`packages/moteur/package.json` :

```json
{
  "name": "@myday/moteur",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "test": "vitest run" },
  "dependencies": {
    "@xmldom/xmldom": "^0.9.6",
    "opentype.js": "^1.3.4",
    "@resvg/resvg-js": "^2.6.2",
    "pdf-lib": "^1.17.1"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/opentype.js": "^1.3.8",
    "typescript": "^5.7.2",
    "vitest": "^4.1.11"
  }
}
```

`packages/moteur/tsconfig.json` :

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "." },
  "include": ["src", "tests"]
}
```

`packages/moteur/vitest.config.ts` :

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
})
```

`packages/moteur/src/index.ts` :

```ts
export function versionMoteur(): string {
  return '1.0.0'
}
```

- [ ] **Étape 4 : Installer et vérifier que le test passe**

```bash
npm install
npm test --workspaces
```

Attendu : SUCCÈS, 1 test.

- [ ] **Étape 5 : Commiter**

```bash
git add package.json package-lock.json tsconfig.base.json packages/
git commit -m "Squelette du dépôt et harnais de test du moteur"
```

---

### Tâche 2 : Analyse d'un gabarit SVG

Le graphiste livre un SVG dont les éléments personnalisables portent
`data-champ` (l'identifiant), `data-type` (la nature) et `data-cadre`
(la boîte dans laquelle la valeur doit tenir, en unités du `viewBox`).
Cette convention est le contrat avec les graphistes (spec §6) : elle est
explicite parce qu'aucune mesure de texte n'est possible sans un moteur de rendu.

**Fichiers :**
- Créer : `packages/moteur/src/types.ts`
- Créer : `packages/moteur/src/dom.ts`
- Créer : `packages/moteur/src/gabarit/analyse.ts`
- Créer : `packages/moteur/tests/analyse.test.ts`
- Modifier : `packages/moteur/src/index.ts`

**Interfaces :**
- Consomme : le paquet de la tâche 1.
- Produit :
  - `type TypeChamp = 'texte' | 'texte_long' | 'date' | 'image'`
  - `interface Cadre { x: number; y: number; largeur: number; hauteur: number }`
  - `interface ChampGabarit { id: string; type: TypeChamp; cadre: Cadre; maxLongueur?: number; police?: string; tailleNominale?: number }`
  - `type ValeursChamps = Record<string, string>`
  - `function analyserDocument(source: string): Document`
  - `function serialiserDocument(doc: Document): string`
  - `function analyserGabarit(doc: Document): ChampGabarit[]`
  - `class ErreurGabarit extends Error`

- [ ] **Étape 1 : Écrire le test qui échoue**

`packages/moteur/tests/analyse.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { analyserDocument } from '../src/dom.js'
import { analyserGabarit, ErreurGabarit } from '../src/gabarit/analyse.js'

const gabarit = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
  <text data-champ="nom_1" data-type="texte" data-cadre="60,200,480,70"
        data-max-longueur="24" font-family="Marcellus" font-size="54">Prénom</text>
  <text data-champ="texte_intro" data-type="texte_long" data-cadre="60,300,480,120"
        font-family="Marcellus" font-size="20">Intro</text>
  <rect data-champ="zone_photo" data-type="image" x="150" y="480" width="300" height="300"/>
</svg>`

describe('analyserGabarit', () => {
  it('découvre les champs et leur cadre', () => {
    const champs = analyserGabarit(analyserDocument(gabarit))
    expect(champs.map((c) => c.id)).toEqual(['nom_1', 'texte_intro', 'zone_photo'])
  })

  it('lit le cadre déclaré', () => {
    const [premier] = analyserGabarit(analyserDocument(gabarit))
    expect(premier?.cadre).toEqual({ x: 60, y: 200, largeur: 480, hauteur: 70 })
  })

  it('déduit le cadre d’un rectangle de sa géométrie', () => {
    const champs = analyserGabarit(analyserDocument(gabarit))
    const photo = champs.find((c) => c.id === 'zone_photo')
    expect(photo?.cadre).toEqual({ x: 150, y: 480, largeur: 300, hauteur: 300 })
  })

  it('retient la police et la taille nominale du texte', () => {
    const [premier] = analyserGabarit(analyserDocument(gabarit))
    expect(premier?.police).toBe('Marcellus')
    expect(premier?.tailleNominale).toBe(54)
  })

  it('retient la longueur maximale quand elle est déclarée', () => {
    const [premier] = analyserGabarit(analyserDocument(gabarit))
    expect(premier?.maxLongueur).toBe(24)
  })

  it('refuse un champ sans type', () => {
    const fautif = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
      <text data-champ="nom_1" data-cadre="0,0,10,10">x</text></svg>`
    expect(() => analyserGabarit(analyserDocument(fautif))).toThrow(ErreurGabarit)
  })

  it('refuse deux champs portant le même identifiant', () => {
    const fautif = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
      <text data-champ="a" data-type="texte" data-cadre="0,0,5,5">x</text>
      <text data-champ="a" data-type="texte" data-cadre="0,5,5,5">y</text></svg>`
    expect(() => analyserGabarit(analyserDocument(fautif))).toThrow(/deux fois/)
  })

  it('refuse un champ texte sans cadre', () => {
    const fautif = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
      <text data-champ="a" data-type="texte">x</text></svg>`
    expect(() => analyserGabarit(analyserDocument(fautif))).toThrow(/cadre/)
  })
})
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd packages/moteur && npx vitest run tests/analyse.test.ts
```

Attendu : ÉCHEC — `Cannot find module '../src/dom.js'`.

- [ ] **Étape 3 : Écrire l'implémentation minimale**

`packages/moteur/src/types.ts` :

```ts
export type TypeChamp = 'texte' | 'texte_long' | 'date' | 'image'

export interface Cadre {
  x: number
  y: number
  largeur: number
  hauteur: number
}

export interface ChampGabarit {
  id: string
  type: TypeChamp
  cadre: Cadre
  maxLongueur?: number
  police?: string
  tailleNominale?: number
}

export type ValeursChamps = Record<string, string>

export interface Recadrage {
  /** Facteur d'agrandissement, 1 = la photo couvre tout juste le cadre. */
  zoom: number
  /** Point focal horizontal dans la photo, de 0 (gauche) à 1 (droite). */
  focaleX: number
  /** Point focal vertical dans la photo, de 0 (haut) à 1 (bas). */
  focaleY: number
}

export const RECADRAGE_NEUTRE: Recadrage = { zoom: 1, focaleX: 0.5, focaleY: 0.5 }
```

`packages/moteur/src/dom.ts` :

```ts
import { DOMParser as ParseurXml, XMLSerializer as SerialiseurXml } from '@xmldom/xmldom'

const SUR_NAVIGATEUR = typeof globalThis.DOMParser !== 'undefined'

/**
 * Analyse une source SVG en `Document` DOM standard.
 * Le navigateur utilise son parseur natif, Node passe par xmldom : le reste du
 * moteur ne voit qu'un `Document`, et le même code s'exécute des deux côtés.
 */
export function analyserDocument(source: string): Document {
  if (SUR_NAVIGATEUR) {
    return new globalThis.DOMParser().parseFromString(source, 'image/svg+xml')
  }
  return new ParseurXml().parseFromString(source, 'image/svg+xml') as unknown as Document
}

export function serialiserDocument(doc: Document): string {
  if (SUR_NAVIGATEUR) {
    return new globalThis.XMLSerializer().serializeToString(doc)
  }
  return new SerialiseurXml().serializeToString(doc as unknown as Node)
}

/** Tous les éléments portant `data-champ`, dans l'ordre du document. */
export function elementsDeChamp(doc: Document): Element[] {
  const trouves: Element[] = []
  const tous = doc.getElementsByTagName('*')
  for (let i = 0; i < tous.length; i += 1) {
    const element = tous[i]
    if (element && element.getAttribute('data-champ')) trouves.push(element)
  }
  return trouves
}
```

`packages/moteur/src/gabarit/analyse.ts` :

```ts
import { elementsDeChamp } from '../dom.js'
import type { Cadre, ChampGabarit, TypeChamp } from '../types.js'

export class ErreurGabarit extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ErreurGabarit'
  }
}

const TYPES_ADMIS: readonly TypeChamp[] = ['texte', 'texte_long', 'date', 'image']

function nombre(valeur: string | null): number | undefined {
  if (valeur === null || valeur.trim() === '') return undefined
  const converti = Number(valeur)
  return Number.isFinite(converti) ? converti : undefined
}

function lireCadre(element: Element, id: string): Cadre {
  const declare = element.getAttribute('data-cadre')
  if (declare) {
    const parts = declare.split(',').map((p) => Number(p.trim()))
    if (parts.length !== 4 || parts.some((p) => !Number.isFinite(p))) {
      throw new ErreurGabarit(
        `Le champ « ${id} » a un data-cadre illisible : « ${declare} ». Attendu « x,y,largeur,hauteur ».`,
      )
    }
    return { x: parts[0]!, y: parts[1]!, largeur: parts[2]!, hauteur: parts[3]! }
  }

  const x = nombre(element.getAttribute('x'))
  const y = nombre(element.getAttribute('y'))
  const largeur = nombre(element.getAttribute('width'))
  const hauteur = nombre(element.getAttribute('height'))
  if (x === undefined || y === undefined || largeur === undefined || hauteur === undefined) {
    throw new ErreurGabarit(
      `Le champ « ${id} » n'a pas de cadre. Ajoutez data-cadre="x,y,largeur,hauteur" sur l'élément.`,
    )
  }
  return { x, y, largeur, hauteur }
}

export function analyserGabarit(doc: Document): ChampGabarit[] {
  const champs: ChampGabarit[] = []
  const vus = new Set<string>()

  for (const element of elementsDeChamp(doc)) {
    const id = element.getAttribute('data-champ')!
    if (vus.has(id)) {
      throw new ErreurGabarit(`Le champ « ${id} » est déclaré deux fois dans le gabarit.`)
    }
    vus.add(id)

    const type = element.getAttribute('data-type') as TypeChamp | null
    if (!type || !TYPES_ADMIS.includes(type)) {
      throw new ErreurGabarit(
        `Le champ « ${id} » n'a pas de data-type valide. Attendu : ${TYPES_ADMIS.join(', ')}.`,
      )
    }

    champs.push({
      id,
      type,
      cadre: lireCadre(element, id),
      maxLongueur: nombre(element.getAttribute('data-max-longueur')),
      police: element.getAttribute('font-family') ?? undefined,
      tailleNominale: nombre(element.getAttribute('font-size')),
    })
  }

  return champs
}
```

Ajouter à `packages/moteur/src/index.ts` :

```ts
export * from './types.js'
export { analyserDocument, serialiserDocument } from './dom.js'
export { analyserGabarit, ErreurGabarit } from './gabarit/analyse.js'

export function versionMoteur(): string {
  return '1.0.0'
}
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

```bash
cd packages/moteur && npx vitest run
```

Attendu : SUCCÈS, 9 tests.

- [ ] **Étape 5 : Commiter**

```bash
git add packages/moteur
git commit -m "Analyse d'un gabarit SVG : découverte des champs et de leur cadre"
```

---

### Tâche 3 : Remplissage des champs texte

**Fichiers :**
- Créer : `packages/moteur/src/gabarit/remplissage.ts`
- Créer : `packages/moteur/tests/remplissage.test.ts`
- Modifier : `packages/moteur/src/index.ts`

**Interfaces :**
- Consomme : `analyserDocument`, `serialiserDocument`, `elementsDeChamp` (tâche 2).
- Produit : `function remplirTextes(doc: Document, valeurs: ValeursChamps): void`
  — mute le document sur place, ignore silencieusement les champs image, et
  supprime l'élément d'un champ texte laissé vide plutôt que d'afficher le
  texte de remplissage du gabarit.

- [ ] **Étape 1 : Écrire le test qui échoue**

`packages/moteur/tests/remplissage.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { analyserDocument, serialiserDocument } from '../src/dom.js'
import { remplirTextes } from '../src/gabarit/remplissage.js'

function gabarit(): Document {
  return analyserDocument(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
    <text data-champ="nom_1" data-type="texte" data-cadre="0,0,600,60">Prénom</text>
    <text data-champ="lieu" data-type="texte" data-cadre="0,60,600,40"><tspan x="0">Lieu</tspan></text>
    <rect data-champ="zone_photo" data-type="image" x="0" y="100" width="100" height="100"/>
  </svg>`)
}

describe('remplirTextes', () => {
  it('écrit la valeur dans un élément texte simple', () => {
    const doc = gabarit()
    remplirTextes(doc, { nom_1: 'Awa' })
    expect(serialiserDocument(doc)).toContain('>Awa<')
    expect(serialiserDocument(doc)).not.toContain('>Prénom<')
  })

  it('écrit la valeur dans le tspan quand il y en a un, en gardant ses attributs', () => {
    const doc = gabarit()
    remplirTextes(doc, { lieu: 'Dakar' })
    const sortie = serialiserDocument(doc)
    expect(sortie).toContain('x="0"')
    expect(sortie).toContain('>Dakar<')
  })

  it('supprime l’élément d’un champ laissé vide', () => {
    const doc = gabarit()
    remplirTextes(doc, { nom_1: '', lieu: '   ' })
    const sortie = serialiserDocument(doc)
    expect(sortie).not.toContain('data-champ="nom_1"')
    expect(sortie).not.toContain('data-champ="lieu"')
  })

  it('laisse intact un champ absent des valeurs', () => {
    const doc = gabarit()
    remplirTextes(doc, {})
    expect(serialiserDocument(doc)).toContain('>Prénom<')
  })

  it('ne touche pas aux champs image', () => {
    const doc = gabarit()
    remplirTextes(doc, { zone_photo: 'https://exemple.test/photo.jpg' })
    expect(serialiserDocument(doc)).toContain('data-champ="zone_photo"')
  })

  it('échappe le contenu au lieu de l’interpréter comme du balisage', () => {
    const doc = gabarit()
    remplirTextes(doc, { nom_1: '<script>alerte()</script>' })
    const sortie = serialiserDocument(doc)
    expect(sortie).not.toContain('<script>')
    expect(sortie).toContain('&lt;script&gt;')
  })
})
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd packages/moteur && npx vitest run tests/remplissage.test.ts
```

Attendu : ÉCHEC — `Cannot find module '../src/gabarit/remplissage.js'`.

- [ ] **Étape 3 : Écrire l'implémentation minimale**

`packages/moteur/src/gabarit/remplissage.ts` :

```ts
import { elementsDeChamp } from '../dom.js'
import type { ValeursChamps } from '../types.js'

function premierTspan(element: Element): Element | undefined {
  const tspans = element.getElementsByTagName('tspan')
  return tspans.length > 0 ? tspans[0] : undefined
}

/**
 * Écrit les valeurs saisies dans les champs texte du document.
 * `textContent` est utilisé partout : le DOM échappe lui-même le contenu, ce qui
 * rend impossible l'injection de balisage par une valeur du client.
 */
export function remplirTextes(doc: Document, valeurs: ValeursChamps): void {
  for (const element of elementsDeChamp(doc)) {
    const id = element.getAttribute('data-champ')!
    if (element.getAttribute('data-type') === 'image') continue
    if (!(id in valeurs)) continue

    const valeur = (valeurs[id] ?? '').trim()

    if (valeur === '') {
      element.parentNode?.removeChild(element)
      continue
    }

    const cible = premierTspan(element) ?? element
    cible.textContent = valeur
  }
}
```

Ajouter à `packages/moteur/src/index.ts` :

```ts
export { remplirTextes } from './gabarit/remplissage.js'
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

```bash
cd packages/moteur && npx vitest run
```

Attendu : SUCCÈS, 15 tests.

- [ ] **Étape 5 : Commiter**

```bash
git add packages/moteur
git commit -m "Remplissage des champs texte d'un gabarit"
```

---

### Tâche 4 : Chargement et mesure des polices

Mesurer un texte sans navigateur est indispensable pour l'ajustement au cadre
(tâche 5) et pour que l'aperçu et le fichier livré coïncident. `opentype.js` lit
les fichiers de police et donne les chasses exactes des glyphes.

**Fichiers :**
- Créer : `packages/moteur/src/rendu/polices.ts`
- Créer : `packages/moteur/tests/polices.test.ts`
- Créer : `packages/moteur/demo/polices/` (téléchargement des fichiers)
- Modifier : `packages/moteur/src/index.ts`

**Interfaces :**
- Consomme : rien du moteur.
- Produit :
  - `interface PoliceChargee { nom: string; mesurer(texte: string, taille: number): number }`
  - `class CataloguePolices` avec
    `ajouter(nom: string, contenu: ArrayBuffer): void`,
    `obtenir(nom: string): PoliceChargee | undefined`,
    `noms(): string[]`
  - `function chargerPolicesDepuisDossier(dossier: string): Promise<CataloguePolices>`
    (Node uniquement — n'est jamais importée par le navigateur)

- [ ] **Étape 1 : Télécharger les polices de démonstration**

```bash
mkdir -p packages/moteur/demo/polices
cd packages/moteur/demo/polices
curl -sL -o Marcellus.ttf "https://github.com/google/fonts/raw/main/ofl/marcellus/Marcellus-Regular.ttf"
curl -sL -o CormorantGaramond.ttf "https://github.com/google/fonts/raw/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf"
curl -sL -o GreatVibes.ttf "https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf"
ls -la
```

Attendu : trois fichiers `.ttf` non vides. Si un téléchargement échoue, récupérez
la police depuis `fonts.google.com` et déposez le `.ttf` sous le même nom.

- [ ] **Étape 2 : Écrire le test qui échoue**

`packages/moteur/tests/polices.test.ts` :

```ts
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CataloguePolices, chargerPolicesDepuisDossier } from '../src/rendu/polices.js'

const dossier = fileURLToPath(new URL('../demo/polices', import.meta.url))

describe('CataloguePolices', () => {
  it('mesure une chaîne plus large qu’une chaîne plus courte', async () => {
    const fichier = await readFile(`${dossier}/Marcellus.ttf`)
    const catalogue = new CataloguePolices()
    catalogue.ajouter('Marcellus', fichier.buffer.slice(fichier.byteOffset, fichier.byteOffset + fichier.byteLength) as ArrayBuffer)

    const police = catalogue.obtenir('Marcellus')
    expect(police).toBeDefined()
    expect(police!.mesurer('Awa & Moussa', 54)).toBeGreaterThan(police!.mesurer('Awa', 54))
  })

  it('mesure proportionnellement à la taille', async () => {
    const catalogue = await chargerPolicesDepuisDossier(dossier)
    const police = catalogue.obtenir('Marcellus')!
    const petite = police.mesurer('Dakar', 20)
    const grande = police.mesurer('Dakar', 40)
    expect(grande / petite).toBeCloseTo(2, 1)
  })

  it('rend une chaîne vide de largeur nulle', async () => {
    const catalogue = await chargerPolicesDepuisDossier(dossier)
    expect(catalogue.obtenir('Marcellus')!.mesurer('', 40)).toBe(0)
  })

  it('charge toutes les polices d’un dossier, nommées d’après le fichier', async () => {
    const catalogue = await chargerPolicesDepuisDossier(dossier)
    expect(catalogue.noms()).toEqual(
      expect.arrayContaining(['Marcellus', 'CormorantGaramond', 'GreatVibes']),
    )
  })

  it('renvoie undefined pour une police absente', async () => {
    const catalogue = await chargerPolicesDepuisDossier(dossier)
    expect(catalogue.obtenir('PoliceInexistante')).toBeUndefined()
  })
})
```

- [ ] **Étape 3 : Lancer le test et vérifier qu'il échoue**

```bash
cd packages/moteur && npx vitest run tests/polices.test.ts
```

Attendu : ÉCHEC — module introuvable.

- [ ] **Étape 4 : Écrire l'implémentation minimale**

`packages/moteur/src/rendu/polices.ts` :

```ts
import { readdir, readFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import opentype from 'opentype.js'

export interface PoliceChargee {
  nom: string
  /** Largeur du texte en unités du viewBox, pour une taille de police donnée. */
  mesurer(texte: string, taille: number): number
}

export class CataloguePolices {
  private readonly polices = new Map<string, PoliceChargee>()

  ajouter(nom: string, contenu: ArrayBuffer): void {
    const police = opentype.parse(contenu)
    this.polices.set(nom, {
      nom,
      mesurer(texte, taille) {
        if (texte === '') return 0
        return police.getAdvanceWidth(texte, taille)
      },
    })
  }

  obtenir(nom: string): PoliceChargee | undefined {
    return this.polices.get(nom)
  }

  noms(): string[] {
    return [...this.polices.keys()]
  }
}

const EXTENSIONS = new Set(['.ttf', '.otf'])

/** Charge toutes les polices d'un dossier. Le nom retenu est celui du fichier. */
export async function chargerPolicesDepuisDossier(dossier: string): Promise<CataloguePolices> {
  const catalogue = new CataloguePolices()
  for (const fichier of await readdir(dossier)) {
    if (!EXTENSIONS.has(extname(fichier).toLowerCase())) continue
    const contenu = await readFile(join(dossier, fichier))
    catalogue.ajouter(
      basename(fichier, extname(fichier)),
      contenu.buffer.slice(contenu.byteOffset, contenu.byteOffset + contenu.byteLength) as ArrayBuffer,
    )
  }
  return catalogue
}
```

- [ ] **Étape 5 : Lancer les tests et vérifier qu'ils passent**

```bash
cd packages/moteur && npx vitest run
```

Attendu : SUCCÈS, 20 tests.

- [ ] **Étape 6 : Commiter**

```bash
git add packages/moteur
git commit -m "Chargement et mesure des polices sans navigateur"
```

---

### Tâche 5 : Ajustement du texte au cadre

Un prénom long ne doit jamais déborder de la carte. La règle : on réduit la
taille jusqu'à ce que le texte tienne, sans descendre sous 60 % de la taille
nominale — en dessous, la carte serait déséquilibrée, et c'est à la validation
de l'éditeur (bloc 4) d'avoir empêché la saisie.

**Fichiers :**
- Créer : `packages/moteur/src/gabarit/ajustement.ts`
- Créer : `packages/moteur/tests/ajustement.test.ts`
- Modifier : `packages/moteur/src/index.ts`

**Interfaces :**
- Consomme : `PoliceChargee` (tâche 4), `Cadre` (tâche 2).
- Produit :
  - `const PLANCHER_ECHELLE = 0.6`
  - `interface ResultatAjustement { taille: number; deborde: boolean }`
  - `function ajusterAuCadre(texte: string, police: PoliceChargee, tailleNominale: number, cadre: Cadre): ResultatAjustement`
  - `function ajusterDocument(doc: Document, champs: ChampGabarit[], catalogue: CataloguePolices): string[]`
    — applique l'ajustement à tout le document et renvoie les identifiants des
    champs qui débordent malgré tout.

- [ ] **Étape 1 : Écrire le test qui échoue**

`packages/moteur/tests/ajustement.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { ajusterAuCadre, PLANCHER_ECHELLE } from '../src/gabarit/ajustement.js'
import type { PoliceChargee } from '../src/rendu/polices.js'

/** Police fictive : chaque caractère fait exactement une demi-taille de large. */
const policeFictive: PoliceChargee = {
  nom: 'Fictive',
  mesurer: (texte, taille) => texte.length * taille * 0.5,
}

const cadre = { x: 0, y: 0, largeur: 200, hauteur: 60 }

describe('ajusterAuCadre', () => {
  it('garde la taille nominale quand le texte tient déjà', () => {
    // « Awa » = 3 × 40 × 0,5 = 60 unités, largement sous 200.
    expect(ajusterAuCadre('Awa', policeFictive, 40, cadre)).toEqual({
      taille: 40,
      deborde: false,
    })
  })

  it('réduit la taille jusqu’à ce que le texte tienne', () => {
    // 15 caractères à la taille 40 font 300 unités : il faut descendre à 26,67,
    // ce qui reste au-dessus du plancher de 24.
    const resultat = ajusterAuCadre('A'.repeat(15), policeFictive, 40, cadre)
    expect(resultat.taille).toBeLessThan(40)
    expect(resultat.deborde).toBe(false)
    expect(policeFictive.mesurer('A'.repeat(15), resultat.taille)).toBeLessThanOrEqual(200)
  })

  it('ne descend jamais sous le plancher et signale le débordement', () => {
    const resultat = ajusterAuCadre('A'.repeat(100), policeFictive, 40, cadre)
    expect(resultat.taille).toBe(40 * PLANCHER_ECHELLE)
    expect(resultat.deborde).toBe(true)
  })

  it('traite une chaîne vide sans rien changer', () => {
    expect(ajusterAuCadre('', policeFictive, 40, cadre)).toEqual({ taille: 40, deborde: false })
  })

  it('refuse un cadre de largeur nulle en gardant la taille nominale', () => {
    const resultat = ajusterAuCadre('Awa', policeFictive, 40, { ...cadre, largeur: 0 })
    expect(resultat.taille).toBe(40 * PLANCHER_ECHELLE)
    expect(resultat.deborde).toBe(true)
  })
})
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd packages/moteur && npx vitest run tests/ajustement.test.ts
```

Attendu : ÉCHEC — module introuvable.

- [ ] **Étape 3 : Écrire l'implémentation minimale**

`packages/moteur/src/gabarit/ajustement.ts` :

```ts
import { elementsDeChamp } from '../dom.js'
import type { CataloguePolices, PoliceChargee } from '../rendu/polices.js'
import type { Cadre, ChampGabarit } from '../types.js'

/** En deçà, la carte serait déséquilibrée : on préfère signaler le débordement. */
export const PLANCHER_ECHELLE = 0.6

export interface ResultatAjustement {
  taille: number
  deborde: boolean
}

export function ajusterAuCadre(
  texte: string,
  police: PoliceChargee,
  tailleNominale: number,
  cadre: Cadre,
): ResultatAjustement {
  if (texte === '') return { taille: tailleNominale, deborde: false }

  const plancher = tailleNominale * PLANCHER_ECHELLE

  if (cadre.largeur <= 0) return { taille: plancher, deborde: true }

  const largeurNominale = police.mesurer(texte, tailleNominale)
  if (largeurNominale <= cadre.largeur) {
    return { taille: tailleNominale, deborde: false }
  }

  // La chasse est proportionnelle à la taille : une seule division suffit.
  const tailleIdeale = (tailleNominale * cadre.largeur) / largeurNominale
  if (tailleIdeale < plancher) return { taille: plancher, deborde: true }

  return { taille: tailleIdeale, deborde: false }
}

/** Applique l'ajustement à tous les champs texte, renvoie ceux qui débordent. */
export function ajusterDocument(
  doc: Document,
  champs: ChampGabarit[],
  catalogue: CataloguePolices,
): string[] {
  const parId = new Map(champs.map((c) => [c.id, c]))
  const debordements: string[] = []

  for (const element of elementsDeChamp(doc)) {
    const id = element.getAttribute('data-champ')!
    const champ = parId.get(id)
    if (!champ || champ.type === 'image') continue
    if (!champ.police || !champ.tailleNominale) continue

    const police = catalogue.obtenir(champ.police)
    if (!police) continue

    const texte = element.textContent ?? ''
    const resultat = ajusterAuCadre(texte, police, champ.tailleNominale, champ.cadre)

    element.setAttribute('font-size', String(Math.round(resultat.taille * 100) / 100))
    if (resultat.deborde) debordements.push(id)
  }

  return debordements
}
```

Ajouter à `packages/moteur/src/index.ts` :

```ts
export { ajusterAuCadre, ajusterDocument, PLANCHER_ECHELLE } from './gabarit/ajustement.js'
export { CataloguePolices, chargerPolicesDepuisDossier } from './rendu/polices.js'
export type { PoliceChargee } from './rendu/polices.js'
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

```bash
cd packages/moteur && npx vitest run
```

Attendu : SUCCÈS, 25 tests.

- [ ] **Étape 5 : Commiter**

```bash
git add packages/moteur
git commit -m "Ajustement du texte au cadre, avec plancher et signalement du débordement"
```

---

### Tâche 6 : Insertion et recadrage de la photo

Le rectangle `data-type="image"` du gabarit est remplacé par une balise `<image>`
recadrée « couvrante » — la photo remplit tout le cadre sans déformation, la
partie excédentaire étant rognée. Le client règle le zoom et le point focal
au doigt (bloc 4) ; le moteur applique ce réglage à l'identique.

**Fichiers :**
- Créer : `packages/moteur/src/gabarit/photo.ts`
- Créer : `packages/moteur/tests/photo.test.ts`
- Modifier : `packages/moteur/src/index.ts`

**Interfaces :**
- Consomme : `Cadre`, `Recadrage`, `RECADRAGE_NEUTRE` (tâche 2), `elementsDeChamp`.
- Produit :
  - `interface Photo { source: string; largeur: number; hauteur: number; recadrage?: Recadrage }`
  - `function calculerPlacement(cadre: Cadre, photo: { largeur: number; hauteur: number }, recadrage: Recadrage): Cadre`
  - `function insererPhoto(doc: Document, idChamp: string, photo: Photo): void`

- [ ] **Étape 1 : Écrire le test qui échoue**

`packages/moteur/tests/photo.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { analyserDocument, serialiserDocument } from '../src/dom.js'
import { calculerPlacement, insererPhoto } from '../src/gabarit/photo.js'
import { RECADRAGE_NEUTRE } from '../src/types.js'

const cadre = { x: 100, y: 200, largeur: 300, hauteur: 300 }

describe('calculerPlacement', () => {
  it('couvre le cadre avec une photo carrée sans marge', () => {
    const place = calculerPlacement(cadre, { largeur: 800, hauteur: 800 }, RECADRAGE_NEUTRE)
    expect(place.largeur).toBeCloseTo(300)
    expect(place.hauteur).toBeCloseTo(300)
    expect(place.x).toBeCloseTo(100)
    expect(place.y).toBeCloseTo(200)
  })

  it('déborde sur la largeur pour une photo panoramique', () => {
    const place = calculerPlacement(cadre, { largeur: 1600, hauteur: 800 }, RECADRAGE_NEUTRE)
    expect(place.hauteur).toBeCloseTo(300)
    expect(place.largeur).toBeCloseTo(600)
    // Centrée : elle dépasse de 150 de chaque côté.
    expect(place.x).toBeCloseTo(-50)
  })

  it('agrandit selon le zoom', () => {
    const place = calculerPlacement(cadre, { largeur: 800, hauteur: 800 }, {
      ...RECADRAGE_NEUTRE,
      zoom: 2,
    })
    expect(place.largeur).toBeCloseTo(600)
  })

  it('déplace le cadrage selon le point focal', () => {
    const gauche = calculerPlacement(cadre, { largeur: 1600, hauteur: 800 }, {
      zoom: 1,
      focaleX: 0,
      focaleY: 0.5,
    })
    expect(gauche.x).toBeCloseTo(100)
  })

  it('ne laisse jamais apparaître de vide dans le cadre', () => {
    const place = calculerPlacement(cadre, { largeur: 1600, hauteur: 800 }, {
      zoom: 1,
      focaleX: 1,
      focaleY: 1,
    })
    expect(place.x).toBeLessThanOrEqual(cadre.x)
    expect(place.y).toBeLessThanOrEqual(cadre.y)
    expect(place.x + place.largeur).toBeGreaterThanOrEqual(cadre.x + cadre.largeur)
    expect(place.y + place.hauteur).toBeGreaterThanOrEqual(cadre.y + cadre.hauteur)
  })

  it('refuse un zoom inférieur à 1 en le ramenant à 1', () => {
    const place = calculerPlacement(cadre, { largeur: 800, hauteur: 800 }, {
      ...RECADRAGE_NEUTRE,
      zoom: 0.2,
    })
    expect(place.largeur).toBeCloseTo(300)
  })
})

describe('insererPhoto', () => {
  const gabarit = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
    <rect data-champ="zone_photo" data-type="image" x="100" y="200" width="300" height="300"/>
  </svg>`

  it('remplace le rectangle par une image détourée', () => {
    const doc = analyserDocument(gabarit)
    insererPhoto(doc, 'zone_photo', {
      source: 'data:image/jpeg;base64,AAA',
      largeur: 800,
      hauteur: 800,
    })
    const sortie = serialiserDocument(doc)
    expect(sortie).toContain('<image')
    expect(sortie).toContain('clipPath')
    expect(sortie).toContain('data:image/jpeg;base64,AAA')
  })

  it('ignore un identifiant de champ inconnu sans lever', () => {
    const doc = analyserDocument(gabarit)
    expect(() =>
      insererPhoto(doc, 'inexistant', { source: 'x', largeur: 10, hauteur: 10 }),
    ).not.toThrow()
  })
})
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd packages/moteur && npx vitest run tests/photo.test.ts
```

Attendu : ÉCHEC — module introuvable.

- [ ] **Étape 3 : Écrire l'implémentation minimale**

`packages/moteur/src/gabarit/photo.ts` :

```ts
import { elementsDeChamp } from '../dom.js'
import type { Cadre, Recadrage } from '../types.js'
import { RECADRAGE_NEUTRE } from '../types.js'

const NS_SVG = 'http://www.w3.org/2000/svg'
const NS_XLINK = 'http://www.w3.org/1999/xlink'

export interface Photo {
  /** URL ou data-URI de la photo. */
  source: string
  largeur: number
  hauteur: number
  recadrage?: Recadrage
}

function borner(valeur: number, minimum: number, maximum: number): number {
  if (minimum > maximum) return minimum
  return Math.min(Math.max(valeur, minimum), maximum)
}

/**
 * Place la photo de façon à couvrir tout le cadre sans déformation.
 * Le point focal indique quelle partie de la photo doit rester visible ; le
 * résultat est borné pour qu'aucun vide n'apparaisse jamais dans le cadre.
 */
export function calculerPlacement(
  cadre: Cadre,
  photo: { largeur: number; hauteur: number },
  recadrage: Recadrage,
): Cadre {
  const zoom = Math.max(1, recadrage.zoom)
  const echelle = Math.max(cadre.largeur / photo.largeur, cadre.hauteur / photo.hauteur) * zoom

  const largeur = photo.largeur * echelle
  const hauteur = photo.hauteur * echelle

  // On place le point focal de la photo au centre du cadre, puis on ramène
  // l'image dans les limites qui garantissent une couverture complète.
  const xVoulu = cadre.x + cadre.largeur / 2 - largeur * borner(recadrage.focaleX, 0, 1)
  const yVoulu = cadre.y + cadre.hauteur / 2 - hauteur * borner(recadrage.focaleY, 0, 1)

  return {
    x: borner(xVoulu, cadre.x + cadre.largeur - largeur, cadre.x),
    y: borner(yVoulu, cadre.y + cadre.hauteur - hauteur, cadre.y),
    largeur,
    hauteur,
  }
}

export function insererPhoto(doc: Document, idChamp: string, photo: Photo): void {
  const zone = elementsDeChamp(doc).find((e) => e.getAttribute('data-champ') === idChamp)
  if (!zone || zone.getAttribute('data-type') !== 'image') return

  const cadre: Cadre = {
    x: Number(zone.getAttribute('x') ?? 0),
    y: Number(zone.getAttribute('y') ?? 0),
    largeur: Number(zone.getAttribute('width') ?? 0),
    hauteur: Number(zone.getAttribute('height') ?? 0),
  }

  const place = calculerPlacement(cadre, photo, photo.recadrage ?? RECADRAGE_NEUTRE)
  const idDetourage = `detourage-${idChamp}`

  const detourage = doc.createElementNS(NS_SVG, 'clipPath')
  detourage.setAttribute('id', idDetourage)
  const rectangle = doc.createElementNS(NS_SVG, 'rect')
  rectangle.setAttribute('x', String(cadre.x))
  rectangle.setAttribute('y', String(cadre.y))
  rectangle.setAttribute('width', String(cadre.largeur))
  rectangle.setAttribute('height', String(cadre.hauteur))
  detourage.appendChild(rectangle)

  const image = doc.createElementNS(NS_SVG, 'image')
  image.setAttribute('x', String(place.x))
  image.setAttribute('y', String(place.y))
  image.setAttribute('width', String(place.largeur))
  image.setAttribute('height', String(place.hauteur))
  image.setAttribute('clip-path', `url(#${idDetourage})`)
  image.setAttribute('preserveAspectRatio', 'none')
  image.setAttribute('href', photo.source)
  // resvg ne lit encore que la forme xlink : on écrit les deux.
  image.setAttributeNS(NS_XLINK, 'xlink:href', photo.source)

  const groupe = doc.createElementNS(NS_SVG, 'g')
  groupe.setAttribute('data-champ-rendu', idChamp)
  groupe.appendChild(detourage)
  groupe.appendChild(image)

  zone.parentNode?.replaceChild(groupe, zone)
}
```

Ajouter à `packages/moteur/src/index.ts` :

```ts
export { calculerPlacement, insererPhoto } from './gabarit/photo.js'
export type { Photo } from './gabarit/photo.js'
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

```bash
cd packages/moteur && npx vitest run
```

Attendu : SUCCÈS, 33 tests.

- [ ] **Étape 5 : Commiter**

```bash
git add packages/moteur
git commit -m "Insertion de la photo du client, recadrée en couverture"
```

---

### Tâche 7 : Filigrane d'aperçu

Tant que le client n'a pas payé (spec §2, paywall au dernier moment), tout rendu
sortant du serveur porte un filigrane. C'est la seule protection du catalogue :
elle doit être impossible à contourner par un paramètre de requête.

**Fichiers :**
- Créer : `packages/moteur/src/gabarit/filigrane.ts`
- Créer : `packages/moteur/tests/filigrane.test.ts`
- Modifier : `packages/moteur/src/index.ts`

**Interfaces :**
- Consomme : rien du moteur.
- Produit : `function apposerFiligrane(doc: Document, mention?: string): void`
  — surimpose une trame diagonale répétée sur toute la surface du document.

- [ ] **Étape 1 : Écrire le test qui échoue**

`packages/moteur/tests/filigrane.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { analyserDocument, serialiserDocument } from '../src/dom.js'
import { apposerFiligrane } from '../src/gabarit/filigrane.js'

const gabarit = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
  <text data-champ="nom_1" data-type="texte" data-cadre="0,0,600,60">Awa</text>
</svg>`

describe('apposerFiligrane', () => {
  it('ajoute la mention par défaut', () => {
    const doc = analyserDocument(gabarit)
    apposerFiligrane(doc)
    expect(serialiserDocument(doc)).toContain('MyDay')
  })

  it('accepte une mention personnalisée', () => {
    const doc = analyserDocument(gabarit)
    apposerFiligrane(doc, 'APERÇU')
    expect(serialiserDocument(doc)).toContain('APERÇU')
  })

  it('place le filigrane après le contenu, donc au-dessus', () => {
    const doc = analyserDocument(gabarit)
    apposerFiligrane(doc)
    const sortie = serialiserDocument(doc)
    expect(sortie.indexOf('data-filigrane')).toBeGreaterThan(sortie.indexOf('data-champ="nom_1"'))
  })

  it('couvre la surface avec plusieurs répétitions', () => {
    const doc = analyserDocument(gabarit)
    apposerFiligrane(doc)
    const sortie = serialiserDocument(doc)
    expect(sortie.split('MyDay').length - 1).toBeGreaterThan(4)
  })

  it('n’altère pas le contenu de la carte', () => {
    const doc = analyserDocument(gabarit)
    apposerFiligrane(doc)
    expect(serialiserDocument(doc)).toContain('>Awa<')
  })
})
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd packages/moteur && npx vitest run tests/filigrane.test.ts
```

Attendu : ÉCHEC — module introuvable.

- [ ] **Étape 3 : Écrire l'implémentation minimale**

`packages/moteur/src/gabarit/filigrane.ts` :

```ts
const NS_SVG = 'http://www.w3.org/2000/svg'

interface Boite {
  largeur: number
  hauteur: number
}

function dimensions(doc: Document): Boite {
  const racine = doc.documentElement
  const viewBox = racine?.getAttribute('viewBox')
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts.every(Number.isFinite)) {
      return { largeur: parts[2]!, hauteur: parts[3]! }
    }
  }
  return {
    largeur: Number(racine?.getAttribute('width') ?? 600),
    hauteur: Number(racine?.getAttribute('height') ?? 900),
  }
}

/**
 * Surimpose une trame de mentions en diagonale.
 * Le pas est calculé sur la diagonale du document pour que la couverture soit
 * complète quelles que soient les proportions du gabarit.
 */
export function apposerFiligrane(doc: Document, mention = 'MyDay'): void {
  const { largeur, hauteur } = dimensions(doc)
  const taille = Math.max(largeur, hauteur) / 14
  const pasX = taille * 7
  const pasY = taille * 4

  const groupe = doc.createElementNS(NS_SVG, 'g')
  groupe.setAttribute('data-filigrane', 'true')
  groupe.setAttribute('aria-hidden', 'true')
  groupe.setAttribute('pointer-events', 'none')

  for (let y = -hauteur; y < hauteur * 2; y += pasY) {
    for (let x = -largeur; x < largeur * 2; x += pasX) {
      const texte = doc.createElementNS(NS_SVG, 'text')
      texte.setAttribute('x', String(x))
      texte.setAttribute('y', String(y))
      texte.setAttribute('transform', `rotate(-30 ${x} ${y})`)
      texte.setAttribute('font-family', 'sans-serif')
      texte.setAttribute('font-size', String(taille))
      texte.setAttribute('font-weight', '700')
      texte.setAttribute('fill', '#14161D')
      texte.setAttribute('fill-opacity', '0.16')
      texte.textContent = mention
      groupe.appendChild(texte)
    }
  }

  doc.documentElement?.appendChild(groupe)
}
```

Ajouter à `packages/moteur/src/index.ts` :

```ts
export { apposerFiligrane } from './gabarit/filigrane.js'
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

```bash
cd packages/moteur && npx vitest run
```

Attendu : SUCCÈS, 38 tests.

- [ ] **Étape 5 : Commiter**

```bash
git add packages/moteur
git commit -m "Filigrane d'aperçu couvrant toute la surface de la carte"
```

---

### Tâche 8 : Rendu PNG haute résolution

Le gabarit déclare sa taille physique sur la balise racine
(`data-largeur-mm`, `data-hauteur-mm`). Le rendu la convertit en pixels à
300 dpi — c'est le critère d'acceptation 7 de la spec.

**Fichiers :**
- Créer : `packages/moteur/src/rendu/png.ts`
- Créer : `packages/moteur/tests/png.test.ts`
- Modifier : `packages/moteur/src/index.ts`

**Interfaces :**
- Consomme : `CataloguePolices` (tâche 4).
- Produit :
  - `const DPI_LIVRAISON = 300`
  - `interface DimensionsPhysiques { largeurMm: number; hauteurMm: number }`
  - `function dimensionsPhysiques(doc: Document): DimensionsPhysiques`
  - `function pixelsPourDpi(mm: number, dpi: number): number`
  - `async function rendrePng(svg: string, options: { largeurPx: number; polices: Map<string, Uint8Array>; policeParDefaut?: string }): Promise<Uint8Array>`

- [ ] **Étape 1 : Écrire le test qui échoue**

`packages/moteur/tests/png.test.ts` :

```ts
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { analyserDocument } from '../src/dom.js'
import { dimensionsPhysiques, pixelsPourDpi, rendrePng, DPI_LIVRAISON } from '../src/rendu/png.js'

const dossierPolices = fileURLToPath(new URL('../demo/polices', import.meta.url))

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900"
     data-largeur-mm="127" data-hauteur-mm="190.5">
  <rect width="600" height="900" fill="#F7F8FA"/>
  <text x="300" y="450" text-anchor="middle" font-family="Marcellus" font-size="60"
        fill="#2C3A80">Awa</text>
</svg>`

/** Lit la largeur et la hauteur dans le bloc IHDR d'un PNG. */
function tailleDuPng(donnees: Uint8Array): { largeur: number; hauteur: number } {
  const vue = new DataView(donnees.buffer, donnees.byteOffset, donnees.byteLength)
  return { largeur: vue.getUint32(16), hauteur: vue.getUint32(20) }
}

describe('dimensionsPhysiques', () => {
  it('lit la taille déclarée par le gabarit', () => {
    expect(dimensionsPhysiques(analyserDocument(svg))).toEqual({
      largeurMm: 127,
      hauteurMm: 190.5,
    })
  })

  it('retombe sur le format carte par défaut quand rien n’est déclaré', () => {
    const nu = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900"/>`
    expect(dimensionsPhysiques(analyserDocument(nu)).largeurMm).toBe(127)
  })
})

describe('pixelsPourDpi', () => {
  it('convertit 127 mm en 1500 px à 300 dpi', () => {
    expect(pixelsPourDpi(127, DPI_LIVRAISON)).toBe(1500)
  })

  it('arrondit au pixel entier', () => {
    expect(Number.isInteger(pixelsPourDpi(190.5, DPI_LIVRAISON))).toBe(true)
  })
})

describe('rendrePng', () => {
  it('produit un PNG valide à la largeur demandée', async () => {
    const fichier = await readFile(`${dossierPolices}/Marcellus.ttf`)
    const png = await rendrePng(svg, {
      largeurPx: 1500,
      polices: new Map([['Marcellus', new Uint8Array(fichier)]]),
      policeParDefaut: 'Marcellus',
    })

    // Signature PNG.
    expect([...png.slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47])
    expect(tailleDuPng(png).largeur).toBe(1500)
    expect(tailleDuPng(png).hauteur).toBe(2250)
  }, 20_000)

  it('rend un fichier plus lourd qu’une image vide', async () => {
    const fichier = await readFile(`${dossierPolices}/Marcellus.ttf`)
    const png = await rendrePng(svg, {
      largeurPx: 600,
      polices: new Map([['Marcellus', new Uint8Array(fichier)]]),
    })
    expect(png.byteLength).toBeGreaterThan(1000)
  }, 20_000)
})
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd packages/moteur && npx vitest run tests/png.test.ts
```

Attendu : ÉCHEC — module introuvable.

- [ ] **Étape 3 : Écrire l'implémentation minimale**

`packages/moteur/src/rendu/png.ts` :

```ts
import { Resvg } from '@resvg/resvg-js'

/** Résolution d'impression exigée par la spec (critère d'acceptation 7). */
export const DPI_LIVRAISON = 300

/** Format d'une carte d'invitation courante : 127 × 190,5 mm (5 × 7,5 pouces). */
const LARGEUR_PAR_DEFAUT_MM = 127
const HAUTEUR_PAR_DEFAUT_MM = 190.5

export interface DimensionsPhysiques {
  largeurMm: number
  hauteurMm: number
}

function nombre(valeur: string | null | undefined): number | undefined {
  if (!valeur) return undefined
  const converti = Number(valeur)
  return Number.isFinite(converti) && converti > 0 ? converti : undefined
}

export function dimensionsPhysiques(doc: Document): DimensionsPhysiques {
  const racine = doc.documentElement
  return {
    largeurMm: nombre(racine?.getAttribute('data-largeur-mm')) ?? LARGEUR_PAR_DEFAUT_MM,
    hauteurMm: nombre(racine?.getAttribute('data-hauteur-mm')) ?? HAUTEUR_PAR_DEFAUT_MM,
  }
}

export function pixelsPourDpi(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi)
}

export interface OptionsPng {
  largeurPx: number
  /** Fichiers de police, indexés par nom de famille. */
  polices: Map<string, Uint8Array>
  policeParDefaut?: string
}

export async function rendrePng(svg: string, options: OptionsPng): Promise<Uint8Array> {
  const tampons = [...options.polices.values()].map((p) => Buffer.from(p))

  const rendu = new Resvg(svg, {
    fitTo: { mode: 'width', value: options.largeurPx },
    font: {
      fontBuffers: tampons,
      loadSystemFonts: false,
      defaultFontFamily: options.policeParDefaut ?? [...options.polices.keys()][0] ?? 'sans-serif',
    },
  })

  return new Uint8Array(rendu.render().asPng())
}
```

Ajouter à `packages/moteur/src/index.ts` :

```ts
export { dimensionsPhysiques, pixelsPourDpi, rendrePng, DPI_LIVRAISON } from './rendu/png.js'
export type { DimensionsPhysiques, OptionsPng } from './rendu/png.js'
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

```bash
cd packages/moteur && npx vitest run
```

Attendu : SUCCÈS, 44 tests.

- [ ] **Étape 5 : Commiter**

```bash
git add packages/moteur
git commit -m "Rendu PNG à 300 dpi, polices embarquées, sans police système"
```

---

### Tâche 9 : Export PDF à la taille physique

Le PDF encapsule le PNG 300 dpi à la taille physique réelle du gabarit. Ce choix
garantit mécaniquement le critère d'acceptation 7 — le PDF ne peut pas différer
de l'aperçu, puisqu'il contient exactement la même image.

**Fichiers :**
- Créer : `packages/moteur/src/rendu/pdf.ts`
- Créer : `packages/moteur/tests/pdf.test.ts`
- Modifier : `packages/moteur/src/index.ts`

**Interfaces :**
- Consomme : `DimensionsPhysiques` (tâche 8).
- Produit : `async function rendrePdf(png: Uint8Array, dimensions: DimensionsPhysiques): Promise<Uint8Array>`

- [ ] **Étape 1 : Écrire le test qui échoue**

`packages/moteur/tests/pdf.test.ts` :

```ts
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { rendrePng } from '../src/rendu/png.js'
import { rendrePdf } from '../src/rendu/pdf.js'

const dossierPolices = fileURLToPath(new URL('../demo/polices', import.meta.url))

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
  <rect width="600" height="900" fill="#FFFFFF"/>
</svg>`

async function pngDeTest(): Promise<Uint8Array> {
  const fichier = await readFile(`${dossierPolices}/Marcellus.ttf`)
  return rendrePng(svg, { largeurPx: 600, polices: new Map([['Marcellus', new Uint8Array(fichier)]]) })
}

describe('rendrePdf', () => {
  it('produit un fichier PDF', async () => {
    const pdf = await rendrePdf(await pngDeTest(), { largeurMm: 127, hauteurMm: 190.5 })
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe('%PDF-')
  }, 20_000)

  it('crée une page unique à la taille physique du gabarit', async () => {
    const pdf = await rendrePdf(await pngDeTest(), { largeurMm: 127, hauteurMm: 190.5 })
    const document = await PDFDocument.load(pdf)
    expect(document.getPageCount()).toBe(1)

    const page = document.getPage(0)
    // 1 mm = 72 / 25,4 points.
    expect(page.getWidth()).toBeCloseTo((127 * 72) / 25.4, 1)
    expect(page.getHeight()).toBeCloseTo((190.5 * 72) / 25.4, 1)
  }, 20_000)

  it('refuse des données qui ne sont pas un PNG', async () => {
    await expect(
      rendrePdf(new Uint8Array([1, 2, 3, 4]), { largeurMm: 127, hauteurMm: 190.5 }),
    ).rejects.toThrow()
  })
})
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd packages/moteur && npx vitest run tests/pdf.test.ts
```

Attendu : ÉCHEC — module introuvable.

- [ ] **Étape 3 : Écrire l'implémentation minimale**

`packages/moteur/src/rendu/pdf.ts` :

```ts
import { PDFDocument } from 'pdf-lib'
import type { DimensionsPhysiques } from './png.js'

const POINTS_PAR_MM = 72 / 25.4

/**
 * Encapsule le PNG haute résolution dans un PDF d'une page, à la taille
 * physique réelle du gabarit. Le PDF contient exactement l'image de l'aperçu,
 * ce qui rend toute divergence impossible.
 */
export async function rendrePdf(
  png: Uint8Array,
  dimensions: DimensionsPhysiques,
): Promise<Uint8Array> {
  const document = await PDFDocument.create()
  const image = await document.embedPng(png)

  const largeur = dimensions.largeurMm * POINTS_PAR_MM
  const hauteur = dimensions.hauteurMm * POINTS_PAR_MM

  const page = document.addPage([largeur, hauteur])
  page.drawImage(image, { x: 0, y: 0, width: largeur, height: hauteur })

  return document.save()
}
```

Ajouter à `packages/moteur/src/index.ts` :

```ts
export { rendrePdf } from './rendu/pdf.js'
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

```bash
cd packages/moteur && npx vitest run
```

Attendu : SUCCÈS, 47 tests.

- [ ] **Étape 5 : Commiter**

```bash
git add packages/moteur
git commit -m "Export PDF à la taille physique, encapsulant le PNG 300 dpi"
```

---

### Tâche 10 : Composition d'une carte de bout en bout — l'épreuve de fidélité

C'est le jalon 0 de la spec (§12), le seul risque capable de faire mentir tout le
planning. On assemble les briques précédentes derrière une fonction unique, et on
vérifie sur de vrais gabarits que le rendu tient.

**Fichiers :**
- Créer : `packages/moteur/src/composition.ts`
- Créer : `packages/moteur/demo/gabarits/mariage-indigo.svg`
- Créer : `packages/moteur/demo/gabarits/bapteme-vert.svg`
- Créer : `packages/moteur/tests/composition.test.ts`
- Créer : `packages/moteur/scripts/epreuve.ts`
- Modifier : `packages/moteur/src/index.ts`, `packages/moteur/package.json`

**Interfaces :**
- Consomme : toutes les tâches 2 à 9.
- Produit :
  - `interface DemandeComposition { gabaritSvg: string; valeurs: ValeursChamps; photo?: Photo; polices: CataloguePolices; filigrane?: boolean }`
  - `interface CarteComposee { svg: string; champs: ChampGabarit[]; debordements: string[]; dimensions: DimensionsPhysiques }`
  - `function composerCarte(demande: DemandeComposition): CarteComposee`

- [ ] **Étape 1 : Créer les gabarits de démonstration**

`packages/moteur/demo/gabarits/mariage-indigo.svg` :

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900"
     data-largeur-mm="127" data-hauteur-mm="190.5">
  <rect width="600" height="900" fill="#F7F8FA"/>
  <rect x="28" y="28" width="544" height="844" fill="none" stroke="#2C3A80" stroke-width="1.5"/>
  <text x="300" y="150" text-anchor="middle" font-family="Marcellus" font-size="22"
        letter-spacing="6" fill="#2C3A80">INVITATION</text>
  <text data-champ="nom_1" data-type="texte" data-cadre="60,230,480,80" data-max-longueur="18"
        x="300" y="250" text-anchor="middle" font-family="GreatVibes" font-size="72"
        fill="#14161D">Awa</text>
  <text x="300" y="310" text-anchor="middle" font-family="Marcellus" font-size="26"
        fill="#2C3A80">&amp;</text>
  <text data-champ="nom_2" data-type="texte" data-cadre="60,330,480,80" data-max-longueur="18"
        x="300" y="380" text-anchor="middle" font-family="GreatVibes" font-size="72"
        fill="#14161D">Moussa</text>
  <rect data-champ="zone_photo" data-type="image" x="200" y="430" width="200" height="200"/>
  <text data-champ="date" data-type="date" data-cadre="60,680,480,40"
        x="300" y="700" text-anchor="middle" font-family="Marcellus" font-size="28"
        fill="#14161D">14 mars 2027</text>
  <text data-champ="lieu" data-type="texte" data-cadre="60,730,480,40" data-max-longueur="40"
        x="300" y="750" text-anchor="middle" font-family="Marcellus" font-size="20"
        fill="#5A6070">Dakar</text>
</svg>
```

`packages/moteur/demo/gabarits/bapteme-vert.svg` : le même document, avec
`#2C3A80` remplacé par `#1F6B4A`, `INVITATION` remplacé par `BAPTÊME`, le champ
`nom_2` et le `&amp;` supprimés, et `nom_1` recentré à `y="300"`.

- [ ] **Étape 2 : Écrire le test qui échoue**

`packages/moteur/tests/composition.test.ts` :

```ts
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { composerCarte } from '../src/composition.js'
import { chargerPolicesDepuisDossier } from '../src/rendu/polices.js'

const racine = fileURLToPath(new URL('..', import.meta.url))

async function contexte() {
  return {
    gabarit: await readFile(`${racine}demo/gabarits/mariage-indigo.svg`, 'utf8'),
    polices: await chargerPolicesDepuisDossier(`${racine}demo/polices`),
  }
}

describe('composerCarte', () => {
  it('écrit les valeurs du client dans la carte', async () => {
    const { gabarit, polices } = await contexte()
    const carte = composerCarte({
      gabaritSvg: gabarit,
      valeurs: { nom_1: 'Aminata', nom_2: 'Ibrahima', lieu: 'Saly', date: '2 mai 2027' },
      polices,
    })
    expect(carte.svg).toContain('Aminata')
    expect(carte.svg).toContain('Saly')
    expect(carte.svg).not.toContain('>Awa<')
  })

  it('expose les champs découverts dans le gabarit', async () => {
    const { gabarit, polices } = await contexte()
    const carte = composerCarte({ gabaritSvg: gabarit, valeurs: {}, polices })
    expect(carte.champs.map((c) => c.id)).toEqual([
      'nom_1', 'nom_2', 'zone_photo', 'date', 'lieu',
    ])
  })

  it('signale un prénom trop long au lieu de le laisser déborder', async () => {
    const { gabarit, polices } = await contexte()
    const carte = composerCarte({
      gabaritSvg: gabarit,
      valeurs: { nom_1: 'Aminata Ndèye Coumba Marie José Sokhna Bousso' },
      polices,
    })
    expect(carte.debordements).toContain('nom_1')
  })

  it('réduit la taille du texte long sans le signaler quand il finit par tenir', async () => {
    const { gabarit, polices } = await contexte()
    const carte = composerCarte({
      gabaritSvg: gabarit,
      valeurs: { nom_1: 'Mariama' },
      polices,
    })
    expect(carte.debordements).toEqual([])
  })

  it('insère la photo quand elle est fournie', async () => {
    const { gabarit, polices } = await contexte()
    const carte = composerCarte({
      gabaritSvg: gabarit,
      valeurs: {},
      photo: { source: 'data:image/jpeg;base64,AAA', largeur: 1200, hauteur: 900 },
      polices,
    })
    expect(carte.svg).toContain('<image')
    expect(carte.svg).toContain('clip-path')
  })

  it('n’appose le filigrane que sur demande', async () => {
    const { gabarit, polices } = await contexte()
    const sans = composerCarte({ gabaritSvg: gabarit, valeurs: {}, polices })
    const avec = composerCarte({ gabaritSvg: gabarit, valeurs: {}, polices, filigrane: true })
    expect(sans.svg).not.toContain('data-filigrane')
    expect(avec.svg).toContain('data-filigrane')
  })

  it('remonte la taille physique du gabarit', async () => {
    const { gabarit, polices } = await contexte()
    const carte = composerCarte({ gabaritSvg: gabarit, valeurs: {}, polices })
    expect(carte.dimensions).toEqual({ largeurMm: 127, hauteurMm: 190.5 })
  })
})
```

- [ ] **Étape 3 : Lancer le test et vérifier qu'il échoue**

```bash
cd packages/moteur && npx vitest run tests/composition.test.ts
```

Attendu : ÉCHEC — module introuvable.

- [ ] **Étape 4 : Écrire l'implémentation minimale**

`packages/moteur/src/composition.ts` :

```ts
import { analyserDocument, serialiserDocument } from './dom.js'
import { ajusterDocument } from './gabarit/ajustement.js'
import { analyserGabarit } from './gabarit/analyse.js'
import { apposerFiligrane } from './gabarit/filigrane.js'
import { insererPhoto, type Photo } from './gabarit/photo.js'
import { remplirTextes } from './gabarit/remplissage.js'
import { dimensionsPhysiques, type DimensionsPhysiques } from './rendu/png.js'
import type { CataloguePolices } from './rendu/polices.js'
import type { ChampGabarit, ValeursChamps } from './types.js'

export interface DemandeComposition {
  gabaritSvg: string
  valeurs: ValeursChamps
  photo?: Photo
  polices: CataloguePolices
  /** Vrai tant que le client n'a pas payé. */
  filigrane?: boolean
}

export interface CarteComposee {
  svg: string
  champs: ChampGabarit[]
  /** Identifiants des champs dont le texte déborde malgré la réduction. */
  debordements: string[]
  dimensions: DimensionsPhysiques
}

/**
 * Assemble une carte à partir d'un gabarit et des valeurs du client.
 * L'ordre est important : on découvre les champs sur le document intact, on
 * remplit, puis on ajuste — l'ajustement mesure le texte réellement écrit.
 */
export function composerCarte(demande: DemandeComposition): CarteComposee {
  const doc = analyserDocument(demande.gabaritSvg)
  const champs = analyserGabarit(doc)
  const dimensions = dimensionsPhysiques(doc)

  remplirTextes(doc, demande.valeurs)
  const debordements = ajusterDocument(doc, champs, demande.polices)

  if (demande.photo) {
    const zone = champs.find((c) => c.type === 'image')
    if (zone) insererPhoto(doc, zone.id, demande.photo)
  }

  if (demande.filigrane) apposerFiligrane(doc)

  return { svg: serialiserDocument(doc), champs, debordements, dimensions }
}
```

Ajouter à `packages/moteur/src/index.ts` :

```ts
export { composerCarte } from './composition.js'
export type { CarteComposee, DemandeComposition } from './composition.js'
```

- [ ] **Étape 5 : Lancer les tests et vérifier qu'ils passent**

```bash
cd packages/moteur && npx vitest run
```

Attendu : SUCCÈS, 54 tests.

- [ ] **Étape 6 : Écrire le script d'épreuve visuelle**

Les tests prouvent la mécanique ; seul un œil humain prouve la fidélité.

`packages/moteur/scripts/epreuve.ts` :

```ts
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { composerCarte } from '../src/composition.js'
import { dimensionsPhysiques, pixelsPourDpi, rendrePng, DPI_LIVRAISON } from '../src/rendu/png.js'
import { analyserDocument } from '../src/dom.js'
import { rendrePdf } from '../src/rendu/pdf.js'
import { chargerPolicesDepuisDossier } from '../src/rendu/polices.js'

const racine = fileURLToPath(new URL('..', import.meta.url))
const sortie = `${racine}epreuve`

const VALEURS = {
  nom_1: 'Aminata',
  nom_2: 'Ibrahima',
  date: '14 mars 2027',
  lieu: 'Grand Théâtre, Dakar',
}

async function main(): Promise<void> {
  await mkdir(sortie, { recursive: true })
  const polices = await chargerPolicesDepuisDossier(`${racine}demo/polices`)
  const tampons = new Map<string, Uint8Array>()
  for (const nom of polices.noms()) {
    tampons.set(nom, new Uint8Array(await readFile(`${racine}demo/polices/${nom}.ttf`)))
  }

  for (const gabarit of ['mariage-indigo', 'bapteme-vert']) {
    const source = await readFile(`${racine}demo/gabarits/${gabarit}.svg`, 'utf8')

    for (const filigrane of [true, false]) {
      const carte = composerCarte({ gabaritSvg: source, valeurs: VALEURS, polices, filigrane })
      if (carte.debordements.length > 0) {
        console.warn(`⚠ ${gabarit} : débordement sur ${carte.debordements.join(', ')}`)
      }

      const dimensions = dimensionsPhysiques(analyserDocument(carte.svg))
      const png = await rendrePng(carte.svg, {
        largeurPx: pixelsPourDpi(dimensions.largeurMm, DPI_LIVRAISON),
        polices: tampons,
      })

      const suffixe = filigrane ? 'apercu' : 'livraison'
      await writeFile(`${sortie}/${gabarit}-${suffixe}.png`, png)
      if (!filigrane) {
        await writeFile(`${sortie}/${gabarit}.pdf`, await rendrePdf(png, dimensions))
      }
      console.log(`✓ ${gabarit}-${suffixe}.png`)
    }
  }
  console.log(`\nOuvrez ${sortie} et vérifiez à l'œil.`)
}

main().catch((erreur) => {
  console.error(erreur)
  process.exitCode = 1
})
```

Ajouter à `packages/moteur/package.json` :

```json
"scripts": { "test": "vitest run", "epreuve": "tsx scripts/epreuve.ts" }
```

et à ses `devDependencies` : `"tsx": "^4.19.2"`. Ajouter `epreuve/` au
`.gitignore` de la racine.

- [ ] **Étape 7 : Lancer l'épreuve et vérifier à l'œil**

```bash
npm install
cd packages/moteur && npm run epreuve
open epreuve
```

Vérifier **une par une** :
- les calligraphies (GreatVibes) sont rendues, pas remplacées par une police de repli ;
- les accents et le « è » de « Ndèye » sortent correctement ;
- aucun texte ne déborde du cadre ni ne chevauche un autre ;
- le filigrane couvre toute la surface et reste lisible sans masquer la carte ;
- le PNG de livraison fait bien 1500 px de large ;
- le PDF s'ouvre et s'imprime à 12,7 cm de large.

**Si un point échoue, c'est ici qu'on le découvre** — c'est tout l'objet de cette
tâche. Le remède se prend dans cet ordre : ajouter la police manquante au
dossier `demo/polices`, puis corriger le gabarit, et seulement en dernier
recours modifier le moteur.

- [ ] **Étape 8 : Commiter**

```bash
git add packages/moteur .gitignore
git commit -m "Composition d'une carte de bout en bout et épreuve de fidélité"
```

---

### Tâche 11 : Application Next.js et jetons de design

**Fichiers :**
- Créer : `apps/web/package.json`, `apps/web/next.config.ts`,
  `apps/web/tsconfig.json`, `apps/web/vitest.config.ts`
- Créer : `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`,
  `apps/web/src/app/globals.css`
- Créer : `apps/web/src/lib/evenements.ts`
- Créer : `apps/web/tests/evenements.test.ts`

**Interfaces :**
- Consomme : `@myday/moteur` (déclaré en dépendance, pas encore utilisé).
- Produit :
  - `type TypeEvenement = 'mariage' | 'bapteme' | 'anniversaire'`
  - `const TYPES_EVENEMENT: readonly TypeEvenement[]`
  - `function couleurEvenement(type: TypeEvenement): string`
  - `function libelleEvenement(type: TypeEvenement): string`
  - `function estTypeEvenement(valeur: string): valeur is TypeEvenement`

- [ ] **Étape 1 : Écrire le test qui échoue**

`apps/web/tests/evenements.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import {
  couleurEvenement,
  estTypeEvenement,
  libelleEvenement,
  TYPES_EVENEMENT,
} from '../src/lib/evenements.js'

describe('types d’événement', () => {
  it('en compte exactement trois', () => {
    expect(TYPES_EVENEMENT).toEqual(['mariage', 'bapteme', 'anniversaire'])
  })

  it('associe à chacun la couleur de la direction de design', () => {
    expect(couleurEvenement('mariage')).toBe('#2C3A80')
    expect(couleurEvenement('bapteme')).toBe('#1F6B4A')
    expect(couleurEvenement('anniversaire')).toBe('#C9700F')
  })

  it('donne un libellé lisible et accentué', () => {
    expect(libelleEvenement('bapteme')).toBe('Baptême')
    expect(libelleEvenement('mariage')).toBe('Mariage')
    expect(libelleEvenement('anniversaire')).toBe('Anniversaire')
  })

  it('reconnaît un type valide', () => {
    expect(estTypeEvenement('mariage')).toBe(true)
  })

  it('rejette ce qui n’est pas un type', () => {
    expect(estTypeEvenement('graduation')).toBe(false)
    expect(estTypeEvenement('')).toBe(false)
  })

  it('n’attribue jamais deux fois la même couleur', () => {
    const couleurs = TYPES_EVENEMENT.map(couleurEvenement)
    expect(new Set(couleurs).size).toBe(couleurs.length)
  })
})
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd apps/web && npx vitest run
```

Attendu : ÉCHEC — l'application n'existe pas.

- [ ] **Étape 3 : Écrire l'implémentation minimale**

`apps/web/package.json` :

```json
{
  "name": "@myday/web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  },
  "dependencies": {
    "@myday/moteur": "*",
    "next": "^15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "typescript": "^5.7.2",
    "vitest": "^4.1.11"
  }
}
```

`apps/web/next.config.ts` :

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@myday/moteur'],
  serverExternalPackages: ['@resvg/resvg-js'],
}

export default config
```

`apps/web/tsconfig.json` :

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "noEmit": true,
    "allowJs": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "tests", "next-env.d.ts", ".next/types/**/*.ts"]
}
```

`apps/web/vitest.config.ts` :

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
})
```

`apps/web/src/lib/evenements.ts` :

```ts
export type TypeEvenement = 'mariage' | 'bapteme' | 'anniversaire'

export const TYPES_EVENEMENT: readonly TypeEvenement[] = [
  'mariage',
  'bapteme',
  'anniversaire',
] as const

/**
 * Une couleur par célébration, qui suit l'utilisateur de l'accueil jusqu'à sa
 * page publiée (spec §9.3). Empruntées à la tradition textile ouest-africaine.
 */
const COULEURS: Record<TypeEvenement, string> = {
  mariage: '#2C3A80',
  bapteme: '#1F6B4A',
  anniversaire: '#C9700F',
}

const LIBELLES: Record<TypeEvenement, string> = {
  mariage: 'Mariage',
  bapteme: 'Baptême',
  anniversaire: 'Anniversaire',
}

export function couleurEvenement(type: TypeEvenement): string {
  return COULEURS[type]
}

export function libelleEvenement(type: TypeEvenement): string {
  return LIBELLES[type]
}

export function estTypeEvenement(valeur: string): valeur is TypeEvenement {
  return (TYPES_EVENEMENT as readonly string[]).includes(valeur)
}
```

`apps/web/src/app/globals.css` — les jetons de la spec §9.4 et §9.5,
**au mot près** :

```css
:root {
  --fond: #F7F8FA;
  --surface: #FFFFFF;
  --trait: #E3E6EC;
  --encre: #14161D;
  --encre-douce: #5A6070;

  --mariage: #2C3A80;
  --bapteme: #1F6B4A;
  --anniversaire: #C9700F;

  /* Prend la couleur du type d'événement en cours. */
  --evenement: var(--encre);

  --marge-laterale: 20px;
  --largeur-maximale: 1100px;

  --duree-courte: 120ms;
  --duree-scene: 320ms;
  --pose-carte: 60ms;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--fond);
  color: var(--encre);
}

body {
  font-family: var(--police-interface), system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 16px;
  line-height: 1.625;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 { margin: 0; font-weight: 600; letter-spacing: -0.02em; text-wrap: balance; }
h1 { font-size: 40px; line-height: 1.1; }
h2 { font-size: 24px; line-height: 1.25; font-weight: 500; }
p  { margin: 0; max-width: 66ch; }

.legende { font-size: 14px; line-height: 1.43; color: var(--encre-douce); }

:focus-visible {
  outline: 2px solid var(--evenement);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

`apps/web/src/app/layout.tsx` :

```tsx
import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'

// Une seule famille pour toute l'interface (spec §9.5). `swap` garantit que le
// texte s'affiche avant la police sur un réseau lent.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  // Police variable : next/font refuse une liste de graisses, il expose toute la plage.
  variable: '--police-interface',
})

export const metadata: Metadata = {
  title: 'MyDay — Votre invitation, prête ce soir',
  description:
    'Créez votre invitation de mariage, de baptême ou d’anniversaire, partagez-la sur WhatsApp et suivez les réponses de vos invités.',
}

export default function RacineLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={bricolage.variable}>
      <body>{children}</body>
    </html>
  )
}
```

`apps/web/src/app/page.tsx` :

```tsx
import { couleurEvenement, libelleEvenement, TYPES_EVENEMENT } from '@/lib/evenements'

export default function Accueil() {
  return (
    <main
      style={{
        maxWidth: 'var(--largeur-maximale)',
        margin: '0 auto',
        padding: '64px var(--marge-laterale)',
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
      }}
    >
      <h1>
        Votre invitation,
        <br />
        prête ce soir.
      </h1>
      <p className="legende">
        Choisissez un modèle, écrivez vos noms, partagez le lien sur WhatsApp.
      </p>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {TYPES_EVENEMENT.map((type) => (
          <li
            key={type}
            style={{
              padding: '10px 18px',
              border: `1px solid ${couleurEvenement(type)}`,
              color: couleurEvenement(type),
              fontWeight: 600,
            }}
          >
            {libelleEvenement(type)}
          </li>
        ))}
      </ul>
    </main>
  )
}
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

```bash
npm install
npm test --workspaces
```

Attendu : SUCCÈS, 54 tests dans le moteur et 6 dans l'application.

- [ ] **Étape 5 : Vérifier que l'application se construit et s'affiche**

```bash
cd apps/web && npm run build && npm run dev
```

Ouvrir `http://localhost:3000` et vérifier : le titre s'affiche en Bricolage
Grotesque (pas en police système), le fond est le blanc froid `#F7F8FA`, les trois
pastilles portent chacune leur couleur, et la page reste correcte à 320 px de
large dans l'inspecteur.

- [ ] **Étape 6 : Commiter**

```bash
git add apps package.json package-lock.json
git commit -m "Application Next.js, jetons de design et typographie de l'interface"
```

---

### Tâche 12 : Base de données et schéma initial

Le schéma couvre les entités du bloc 1 et celles dont les blocs suivants
dépendront immédiatement (spec §7). Les entités des modules communautaires
(livre d'or, photos, cagnotte) arriveront avec leur bloc.

**Fichiers :**
- Créer : `docker-compose.yml`
- Créer : `apps/web/prisma/schema.prisma`
- Créer : `apps/web/src/serveur/bdd.ts`
- Créer : `apps/web/.env.example`
- Créer : `apps/web/tests/schema.test.ts`
- Modifier : `apps/web/package.json`

**Interfaces :**
- Consomme : `TypeEvenement` (tâche 11).
- Produit : le client Prisma partagé `bdd`, et les modèles `Graphiste`,
  `Gabarit`, `Evenement`, `Ceremonie`, `Invite`, `Reponse`.

- [ ] **Étape 1 : Écrire le test qui échoue**

`apps/web/tests/schema.test.ts` :

```ts
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const schema = fileURLToPath(new URL('../prisma/schema.prisma', import.meta.url))

describe('schéma de la base', () => {
  it('déclare les modèles du bloc 1', async () => {
    const source = await readFile(schema, 'utf8')
    for (const modele of ['Graphiste', 'Gabarit', 'Evenement', 'Ceremonie', 'Invite', 'Reponse']) {
      expect(source).toContain(`model ${modele} {`)
    }
  })

  it('permet plusieurs cérémonies par événement', async () => {
    const source = await readFile(schema, 'utf8')
    expect(source).toMatch(/ceremonies\s+Ceremonie\[\]/)
  })

  it('protège le brouillon par un secret unique', async () => {
    const source = await readFile(schema, 'utf8')
    expect(source).toMatch(/secretBrouillon\s+String\s+@unique/)
  })

  it('donne à chaque invité un jeton unique pour son lien nominatif', async () => {
    const source = await readFile(schema, 'utf8')
    expect(source).toMatch(/jeton\s+String\s+@unique/)
  })

  it('enregistre le repère d’adresse de chaque cérémonie', async () => {
    const source = await readFile(schema, 'utf8')
    expect(source).toMatch(/repere\s+String\?/)
  })
})
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd apps/web && npx vitest run tests/schema.test.ts
```

Attendu : ÉCHEC — le fichier de schéma n'existe pas.

- [ ] **Étape 3 : Écrire l'implémentation minimale**

`docker-compose.yml` à la racine :

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: myday-postgres
    environment:
      POSTGRES_USER: myday
      POSTGRES_PASSWORD: myday
      POSTGRES_DB: myday
    ports:
      - '5432:5432'
    volumes:
      - donnees-postgres:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U myday']
      interval: 5s
      retries: 10

volumes:
  donnees-postgres:
```

`apps/web/.env.example` :

```
DATABASE_URL="postgresql://myday:myday@localhost:5432/myday?schema=public"
```

`apps/web/prisma/schema.prisma` :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TypeEvenement {
  mariage
  bapteme
  anniversaire
}

enum StatutGabarit {
  brouillon
  actif
  archive
}

enum StatutEvenement {
  brouillon
  publie
  archive
}

model Graphiste {
  id           String   @id @default(cuid())
  nom          String
  bio          String?
  photoUrl     String?
  contact      String
  partRevenu   Decimal  @db.Decimal(5, 2)
  gabarits     Gabarit[]
  creeLe       DateTime @default(now())
}

model Gabarit {
  id            String        @id @default(cuid())
  slug          String        @unique
  nom           String
  typeEvenement TypeEvenement
  sourceSvg     String
  apercuUrl     String?
  champs        Json
  etiquettes    String[]
  prix          Int
  statut        StatutGabarit @default(brouillon)
  nbVentes      Int           @default(0)
  graphiste     Graphiste     @relation(fields: [graphisteId], references: [id])
  graphisteId   String
  evenements    Evenement[]
  creeLe        DateTime      @default(now())
  modifieLe     DateTime      @updatedAt

  @@index([typeEvenement, statut])
}

model Evenement {
  id              String          @id @default(cuid())
  slug            String          @unique
  /// Secret d'URL du brouillon : aucun compte n'est demandé avant le paiement.
  secretBrouillon String          @unique
  titre           String
  typeEvenement   TypeEvenement
  gabarit         Gabarit         @relation(fields: [gabaritId], references: [id])
  gabaritId       String
  valeursChamps   Json
  photoUrl        String?
  recadrage       Json?
  codeVestimentaire String?
  motDesHotes     String?
  statut          StatutEvenement @default(brouillon)
  publieLe        DateTime?
  telephoneHote   String?
  ceremonies      Ceremonie[]
  invites         Invite[]
  reponses        Reponse[]
  creeLe          DateTime        @default(now())
  modifieLe       DateTime        @updatedAt

  @@index([statut])
}

model Ceremonie {
  id           String    @id @default(cuid())
  evenement    Evenement @relation(fields: [evenementId], references: [id], onDelete: Cascade)
  evenementId  String
  rang         Int
  nom          String
  debuteLe     DateTime
  termineLe    DateTime?
  lieu         String
  adresse      String?
  /// Le repère parlé — « en face de la station Total de Sacré-Cœur 3 ».
  repere       String?
  latitude     Float?
  longitude    Float?
  codeVestimentaire String?
  note         String?

  @@unique([evenementId, rang])
}

model Invite {
  id          String    @id @default(cuid())
  evenement   Evenement @relation(fields: [evenementId], references: [id], onDelete: Cascade)
  evenementId String
  nomComplet  String
  telephone   String?
  /// Jeton court et non devinable du lien nominatif.
  jeton       String    @unique
  reponse     Reponse?
  creeLe      DateTime  @default(now())

  @@index([evenementId])
}

model Reponse {
  id           String    @id @default(cuid())
  evenement    Evenement @relation(fields: [evenementId], references: [id], onDelete: Cascade)
  evenementId  String
  invite       Invite?   @relation(fields: [inviteId], references: [id], onDelete: SetNull)
  inviteId     String?   @unique
  nom          String
  telephone    String
  present      Boolean
  nbPersonnes  Int       @default(1)
  ceremonieIds String[]
  message      String?
  creeLe       DateTime  @default(now())
  modifieLe    DateTime  @updatedAt

  @@index([evenementId, present])
}
```

`apps/web/src/serveur/bdd.ts` :

```ts
import { PrismaClient } from '@prisma/client'

// En développement, Next recharge les modules à chaud : sans ce cache, chaque
// rechargement ouvrirait un nouveau pool de connexions.
const global_ = globalThis as unknown as { bdd?: PrismaClient }

export const bdd = global_.bdd ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') global_.bdd = bdd
```

Ajouter aux dépendances de `apps/web/package.json` : `"@prisma/client": "^6.1.0"`,
et aux devDependencies `"prisma": "^6.1.0"`. Ajouter aux scripts :

```json
"bdd:migrer": "prisma migrate dev",
"bdd:generer": "prisma generate"
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

```bash
cd apps/web && npx vitest run
```

Attendu : SUCCÈS, 11 tests.

- [ ] **Étape 5 : Créer la base et la première migration**

```bash
docker compose up -d
cp apps/web/.env.example apps/web/.env
cd apps/web && npm install && npx prisma migrate dev --name socle
npx prisma validate
```

Attendu : la migration s'applique, `prisma validate` répond « The schema is valid ».

- [ ] **Étape 6 : Commiter**

```bash
git add docker-compose.yml apps package.json package-lock.json
git commit -m "Base PostgreSQL et schéma du socle, événement multi-cérémonies"
```

---

## Ce que ce bloc livre

À la fin des douze tâches :

- un moteur qui compose une carte à partir d'un gabarit et de valeurs saisies,
  ajuste le texte, insère la photo recadrée, appose un filigrane, et exporte en
  PNG 300 dpi et en PDF à la taille physique ;
- la preuve, à l'œil, que le rendu est fidèle sur de vrais gabarits — le risque
  n°1 de la spec est levé ou identifié avant d'avoir écrit une ligne d'interface ;
- une application Next.js qui se construit, portant les jetons de design et la
  typographie de la direction visuelle ;
- une base PostgreSQL dont le schéma porte déjà l'événement multi-cérémonies, le
  brouillon sans compte et les liens nominatifs.

## Les blocs suivants

| Bloc | Contenu | Dépend de |
|---|---|---|
| 2 | **Page invitation** : ouverture de l'enveloppe, programme, lieux, code vestimentaire, RSVP, aperçu de partage | bloc 1 |
| 3 | Galerie personnalisée aux prénoms, guidage visuel, fiche modèle | bloc 1 |
| 4 | Éditeur guidé et brouillons | blocs 1 et 3 |
| 5 | Paiement Wave et Orange Money, publication, livraison WhatsApp | bloc 4 |
| 6 | Tableau de bord des réponses et relances | blocs 2 et 5 |
| 7 | Liens nominatifs, livre d'or, galerie photo, cagnotte | bloc 6 |
| 8 | Back-office des gabarits, catalogue complet, durcissement | tous |
