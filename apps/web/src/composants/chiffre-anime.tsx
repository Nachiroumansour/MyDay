'use client'

import { useEffect, useState } from 'react'

const DUREE = 900

/**
 * Un nombre qui monte jusqu'à sa valeur.
 *
 * Rendu d'abord à sa valeur finale : sans JavaScript, ou avant hydratation,
 * le chiffre juste est déjà là. L'animation n'est qu'un ornement par-dessus.
 */
export function ChiffreAnime({ valeur }: { valeur: number }) {
  const [affiche, setAffiche] = useState(valeur)

  useEffect(() => {
    if (valeur === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let image = 0
    const depart = performance.now()
    setAffiche(0)

    const avancer = (instant: number) => {
      const part = Math.min(1, (instant - depart) / DUREE)
      // Décélération : le compteur ralentit en approchant, comme un vrai.
      setAffiche(Math.round(valeur * (1 - Math.pow(1 - part, 3))))
      if (part < 1) image = requestAnimationFrame(avancer)
    }

    image = requestAnimationFrame(avancer)
    return () => cancelAnimationFrame(image)
  }, [valeur])

  return <>{affiche}</>
}
