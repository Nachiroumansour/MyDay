import {
  analyserDocument,
  rendrePng,
  serialiserDocument,
  vectoriserTextes,
} from '@myday/moteur'
import { rendreCarte } from './carte'
import { polices } from './polices'
import type { EvenementVue } from './bdd/evenements'

/** Dimensions attendues par WhatsApp, Facebook et iMessage. */
export const LARGEUR_APERCU = 1200
export const HAUTEUR_APERCU = 630

const POLICE_MARQUE = 'BricolageGrotesque'

function echapper(texte: string): string {
  return texte.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]!)
}

/** Coupe un titre trop long plutôt que de le laisser sortir du cadre. */
function tronquer(texte: string, maximum: number): string {
  return texte.length <= maximum ? texte : `${texte.slice(0, maximum - 1).trimEnd()}…`
}

/**
 * L'image que voient les destinataires dans WhatsApp avant même d'ouvrir le
 * lien — souvent la seule chose qu'ils verront. Elle montre donc la vraie
 * carte, avec les vrais prénoms, jamais un logo générique.
 */
export async function apercuPartage(
  evenement: EvenementVue,
  couleur: string,
  quand: string,
  ou: string,
): Promise<Uint8Array> {
  const carte = await rendreCarte(evenement, { largeurPx: 460, filigrane: false })
  const carteEncodee = Buffer.from(carte).toString('base64')

  // La carte occupe la colonne de gauche, à hauteur constante.
  const hauteurCarte = 470
  const largeurCarte = Math.round(hauteurCarte * (127 / 190.5))
  const xCarte = 96
  const yCarte = (HAUTEUR_APERCU - hauteurCarte) / 2
  const xTexte = xCarte + largeurCarte + 72

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR_APERCU} ${HAUTEUR_APERCU}">
  <rect width="${LARGEUR_APERCU}" height="${HAUTEUR_APERCU}" fill="#101218"/>
  <rect x="0" y="0" width="8" height="${HAUTEUR_APERCU}" fill="${couleur}"/>
  <image x="${xCarte}" y="${yCarte}" width="${largeurCarte}" height="${hauteurCarte}"
         preserveAspectRatio="xMidYMid slice"
         href="data:image/png;base64,${carteEncodee}"/>
  <text x="${xTexte}" y="248" font-family="${POLICE_MARQUE}" font-size="26"
        letter-spacing="2" fill="#8f96a5">UNE INVITATION POUR VOUS</text>
  <text x="${xTexte}" y="322" font-family="${POLICE_MARQUE}" font-size="56"
        font-weight="600" fill="#f2f3f6">${echapper(tronquer(evenement.titre, 26))}</text>
  <text x="${xTexte}" y="382" font-family="${POLICE_MARQUE}" font-size="28"
        fill="${couleur}">${echapper(tronquer(quand, 34))}</text>
  <text x="${xTexte}" y="424" font-family="${POLICE_MARQUE}" font-size="24"
        fill="#8f96a5">${echapper(tronquer(ou, 40))}</text>
  <text x="${xTexte}" y="492" font-family="${POLICE_MARQUE}" font-size="22"
        fill="#6c7382">myday.sn</text>
</svg>`

  // Le texte est vectorisé comme partout ailleurs : resvg n'applique pas les
  // polices qu'on lui fournit.
  const doc = analyserDocument(svg)
  vectoriserTextes(doc, await polices())

  return rendrePng(serialiserDocument(doc), { largeurPx: LARGEUR_APERCU })
}
