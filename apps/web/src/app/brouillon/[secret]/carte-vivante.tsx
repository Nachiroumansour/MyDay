'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ValeursChamps } from '@myday/moteur'
import { enregistrerChamps } from './actions'

/**
 * L'état partagé entre le formulaire et l'aperçu.
 *
 * Les deux vivent de part et d'autre de la mise en page — l'aperçu dans le
 * gabarit de l'éditeur, les champs dans la page de l'étape. Un contexte les
 * relie sans que la page ait à devenir cliente : les composants serveur sont
 * simplement passés en enfants.
 *
 * La frappe ne part pas au serveur à chaque touche : elle est retenue le temps
 * d'une pause, puis enregistrée une fois. L'aperçu se redemande alors — un
 * rendu de carte coûte quelques centaines de millisecondes, ce qui interdit de
 * le refaire à chaque lettre.
 */
const PAUSE_MS = 650

type Statut = 'repos' | 'frappe' | 'envoi' | 'enregistre' | 'echec'

/** Ce qu'il faut savoir d'un champ pour l'éditer hors du formulaire. */
export interface ChampEditable {
  id: string
  libelle: string
  type: string
  maxLongueur?: number
  facultatif?: boolean
  exemple?: string
}

interface Valeur {
  valeurs: ValeursChamps
  version: number
  statut: Statut
  changer: (id: string, valeur: string) => void
  /** Les champs dans l'ordre où on lit la carte. */
  champs: ChampEditable[]
  /** Le champ ouvert depuis la carte, le cas échéant. */
  actif: string | undefined
  ouvrir: (id: string) => void
  fermer: () => void
}

const Contexte = createContext<Valeur | undefined>(undefined)

export function useCarte(): Valeur {
  const valeur = useContext(Contexte)
  if (!valeur) throw new Error('useCarte doit être utilisé sous <CarteVivante>')
  return valeur
}

export function CarteVivante({
  secret,
  valeursInitiales,
  champs,
  children,
}: {
  secret: string
  valeursInitiales: ValeursChamps
  champs: ChampEditable[]
  children: React.ReactNode
}) {
  const [valeurs, setValeurs] = useState<ValeursChamps>(valeursInitiales)
  const [version, setVersion] = useState(0)
  const [statut, setStatut] = useState<Statut>('repos')
  const [actif, setActif] = useState<string | undefined>(undefined)
  const ouvrir = useCallback((id: string) => setActif(id), [])
  const fermer = useCallback(() => setActif(undefined), [])

  const minuterie = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const dernieres = useRef(valeursInitiales)

  useEffect(() => () => clearTimeout(minuterie.current), [])

  const changer = useCallback(
    (id: string, valeur: string) => {
      setValeurs((avant) => {
        const apres = { ...avant, [id]: valeur }
        dernieres.current = apres
        return apres
      })
      setStatut('frappe')

      clearTimeout(minuterie.current)
      minuterie.current = setTimeout(async () => {
        setStatut('envoi')
        try {
          const { enregistre } = await enregistrerChamps(secret, dernieres.current)
          setStatut(enregistre ? 'enregistre' : 'echec')
          // L'aperçu ne se redemande qu'une fois la carte réellement écrite :
          // le redemander plus tôt rendrait l'état précédent.
          if (enregistre) setVersion((n) => n + 1)
        } catch {
          setStatut('echec')
        }
      }, PAUSE_MS)
    },
    [secret],
  )

  return (
    <Contexte.Provider
      value={{ valeurs, version, statut, changer, champs, actif, ouvrir, fermer }}
    >
      {children}
    </Contexte.Provider>
  )
}
