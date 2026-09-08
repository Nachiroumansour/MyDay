export interface ReponseComptable {
  nom: string
  telephone: string
  present: boolean
  nbPersonnes: number
  ceremonieIds: string[]
  message: string | null
  creeLe: Date
}

export interface CeremonieNommee {
  id: string
  nom: string
}

export interface Resume {
  reponses: number
  presents: number
  absents: number
  /** Personnes attendues, accompagnants compris. */
  personnes: number
}

export function resumeReponses(reponses: ReponseComptable[]): Resume {
  const presents = reponses.filter((r) => r.present)
  return {
    reponses: reponses.length,
    presents: presents.length,
    absents: reponses.length - presents.length,
    personnes: presents.reduce((somme, r) => somme + r.nbPersonnes, 0),
  }
}

export interface CompteCeremonie extends CeremonieNommee {
  /** Personnes attendues. */
  personnes: number
  /** Réponses distinctes — un foyer peut venir à plusieurs. */
  foyers: number
}

/**
 * Le chiffre qui compte vraiment pour qui organise : combien de personnes
 * attendre à chaque cérémonie. Un mariage à trois cérémonies n'a pas un
 * nombre d'invités, il en a trois.
 */
export function compterParCeremonie(
  reponses: ReponseComptable[],
  ceremonies: CeremonieNommee[],
): CompteCeremonie[] {
  return ceremonies.map((ceremonie) => {
    const concernees = reponses.filter(
      (r) => r.present && r.ceremonieIds.includes(ceremonie.id),
    )
    return {
      id: ceremonie.id,
      nom: ceremonie.nom,
      personnes: concernees.reduce((somme, r) => somme + r.nbPersonnes, 0),
      foyers: concernees.length,
    }
  })
}

/**
 * Neutralise une cellule qui commence par un opérateur : un tableur
 * l'exécuterait comme une formule.
 */
function cellule(valeur: string): string {
  const sur = /^[=+\-@\t\r]/.test(valeur) ? `'${valeur}` : valeur
  return /[",\n]/.test(sur) ? `"${sur.replace(/"/g, '""')}"` : sur
}

export function exporterCsv(
  reponses: ReponseComptable[],
  ceremonies: CeremonieNommee[],
): string {
  const nomDe = new Map(ceremonies.map((c) => [c.id, c.nom]))

  const lignes = [
    ['Nom', 'Téléphone', 'Vient', 'Personnes', 'Cérémonies', 'Message', 'Répondu le'],
    ...reponses.map((r) => [
      r.nom,
      r.telephone,
      r.present ? 'oui' : 'non',
      String(r.nbPersonnes),
      r.ceremonieIds.map((id) => nomDe.get(id) ?? id).join(' · '),
      r.message ?? '',
      r.creeLe.toISOString().slice(0, 10),
    ]),
  ]

  return lignes.map((ligne) => ligne.map(cellule).join(',')).join('\n')
}
