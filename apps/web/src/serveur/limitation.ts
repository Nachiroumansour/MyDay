/**
 * Limitation de débit en mémoire.
 *
 * Elle protège les formulaires publics — réponse, livre d'or, photo — d'un
 * envoi en rafale. Elle est volontairement simple : sur plusieurs instances,
 * chacune compte de son côté, ce qui suffit à freiner un abus ordinaire sans
 * ajouter une dépendance. Une protection contre une attaque coordonnée
 * relèverait d'un magasin partagé, à poser le jour où le trafic le justifie.
 */
export interface OptionsLimiteur {
  plafond: number
  fenetreMs: number
  horloge?: () => number
}

export interface Limiteur {
  autorise(cle: string): boolean
  taille(): number
}

const NETTOYAGE_TOUS_LES = 200

export function creerLimiteur(options: OptionsLimiteur): Limiteur {
  const horloge = options.horloge ?? Date.now
  const passages = new Map<string, number[]>()
  let depuisNettoyage = 0

  function nettoyer(maintenant: number): void {
    for (const [cle, dates] of passages) {
      if (dates.every((date) => maintenant - date >= options.fenetreMs)) passages.delete(cle)
    }
  }

  return {
    autorise(cle: string): boolean {
      const maintenant = horloge()

      // Sans purge, une clé vue une seule fois resterait en mémoire pour
      // toujours : la carte grossirait indéfiniment.
      if ((depuisNettoyage += 1) >= NETTOYAGE_TOUS_LES) {
        depuisNettoyage = 0
        nettoyer(maintenant)
      }

      const recentes = (passages.get(cle) ?? []).filter(
        (date) => maintenant - date < options.fenetreMs,
      )

      if (recentes.length >= options.plafond) {
        passages.set(cle, recentes)
        return false
      }

      recentes.push(maintenant)
      passages.set(cle, recentes)
      return true
    },

    taille(): number {
      return passages.size
    },
  }
}

/** Identifie l'appelant du mieux qu'on peut derrière un proxy. */
export function identifiantAppelant(requete: Request): string {
  const entetes = requete.headers
  const transmis = entetes.get('x-forwarded-for')?.split(',')[0]?.trim()
  return transmis || entetes.get('x-real-ip') || 'inconnu'
}

/** Un limiteur par usage, pour qu'un abus sur l'un ne bloque pas les autres. */
export const limiteurReponses = creerLimiteur({ plafond: 10, fenetreMs: 60_000 })
export const limiteurMessages = creerLimiteur({ plafond: 5, fenetreMs: 60_000 })
export const limiteurPhotos = creerLimiteur({ plafond: 6, fenetreMs: 300_000 })
export const limiteurConnexion = creerLimiteur({ plafond: 8, fenetreMs: 300_000 })
