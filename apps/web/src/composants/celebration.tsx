'use client'

import { useEffect } from 'react'

/**
 * Une volée de confettis, une seule fois, au moment où quelque chose aboutit.
 *
 * La librairie n'est chargée qu'à cet instant : elle ne pèse sur aucune autre
 * page. Le CSS ferait mal cette animation-là — une explosion demande une vraie
 * physique, gravité et décélération comprises.
 */
export function Celebration({ couleur }: { couleur: string }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let annule = false
    void import('canvas-confetti').then(({ default: confetti }) => {
      if (annule) return

      const commun = {
        particleCount: 70,
        spread: 62,
        startVelocity: 42,
        ticks: 180,
        colors: [couleur, '#FFFFFF', '#F7F8FA'],
        disableForReducedMotion: true,
      }

      // Deux gerbes qui partent des côtés : plus juste qu'une seule au centre.
      void confetti({ ...commun, origin: { x: 0.15, y: 0.5 }, angle: 60 })
      void confetti({ ...commun, origin: { x: 0.85, y: 0.5 }, angle: 120 })
    })

    return () => {
      annule = true
    }
  }, [couleur])

  return null
}
