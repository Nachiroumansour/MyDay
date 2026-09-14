'use client'

import { useEffect, useRef, useState } from 'react'
import { extraireCoordonnees, formaterPoint } from '@/lib/localisation'
import styles from './editeur.module.css'

/**
 * Le point exact d'une cérémonie.
 *
 * Deux gestes, selon où se trouve l'hôte. Depuis son ordinateur, il colle le
 * lien que le bouton « Partager » de Google Maps lui a donné. Depuis la salle,
 * il appuie sur « Utiliser ma position » — c'est le plus précis, et le plus
 * court.
 *
 * Les deux aboutissent au même champ texte : la position du navigateur y est
 * écrite sous forme de coordonnées, que le serveur lit exactement comme un
 * lien collé. Un seul chemin à travers le code, un seul à éprouver.
 *
 * Le champ n'est pas contrôlé par React, et c'est voulu : sur un réseau lent,
 * l'hôte qui colle son lien avant que le JavaScript ne soit prêt verrait sa
 * saisie effacée à l'hydratation. Le DOM garde la valeur, l'état ne sert qu'à
 * afficher ce qu'on en a compris.
 */
export function PointCarte({ valeurInitiale }: { valeurInitiale: string }) {
  const champ = useRef<HTMLInputElement>(null)
  const [valeur, setValeur] = useState(valeurInitiale)
  const [etat, setEtat] = useState<'repos' | 'recherche' | 'refus' | 'echec'>('repos')

  // Ce qui a été collé avant que le JavaScript n'arrive vit dans le DOM, pas
  // dans l'état : sans cette relecture, la saisie partirait bien au serveur
  // mais la confirmation ne s'afficherait jamais.
  useEffect(() => {
    const dejaLa = champ.current?.value ?? ''
    if (dejaLa !== valeur) setValeur(dejaLa)
    // Au montage seulement : ensuite, c'est onChange qui tient l'état.
     
  }, [])

  // Reconnu tout de suite pour un lien long ou des coordonnées ; un lien court
  // ne se lit qu'au serveur, après dépliage.
  const point = extraireCoordonnees(valeur)
  const courtAResoudre = valeur.trim() !== '' && !point

  function localiser() {
    if (!navigator.geolocation) return setEtat('echec')
    setEtat('recherche')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const trouve = formaterPoint({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        if (champ.current) champ.current.value = trouve
        setValeur(trouve)
        setEtat('repos')
      },
      (erreur) => setEtat(erreur.code === erreur.PERMISSION_DENIED ? 'refus' : 'echec'),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  return (
    <div className={styles.champ}>
      <label className="etiquette-champ" htmlFor="point">
        Le point exact sur la carte
      </label>

      <div className={styles.rangeePoint}>
        <input
          id="point"
          name="point"
          className="saisie"
          ref={champ}
          defaultValue={valeurInitiale}
          onChange={(e) => setValeur(e.target.value)}
          placeholder="Collez le lien Google Maps du lieu"
          autoComplete="off"
        />
        <button
          type="button"
          className="bouton-contour"
          onClick={localiser}
          disabled={etat === 'recherche'}
        >
          {etat === 'recherche' ? 'Recherche…' : 'Utiliser ma position'}
        </button>
      </div>

      {point ? (
        <p className={styles.pointTrouve}>
          <span aria-hidden="true">⚑</span> Point enregistré — vos invités seront guidés
          jusqu’à la porte.
        </p>
      ) : courtAResoudre ? (
        <p className={styles.compteur}>Le lien sera déplié à l’enregistrement.</p>
      ) : (
        <p className={styles.compteur}>
          Facultatif, mais c’est ce qui change tout : sans point, vos invités n’auront
          qu’une recherche sur le nom du lieu, et à Dakar elle tombe souvent à côté.
        </p>
      )}

      {etat === 'refus' && (
        <p className={styles.avertissement}>
          Votre navigateur a refusé l’accès à la position. Autorisez-le, ou collez le lien
          Google Maps.
        </p>
      )}
      {etat === 'echec' && (
        <p className={styles.avertissement}>
          Position introuvable. Collez plutôt le lien Google Maps du lieu.
        </p>
      )}
    </div>
  )
}
