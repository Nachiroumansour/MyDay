'use client'

import { useState } from 'react'
import type { ChampGabarit } from '@myday/moteur'
import type { TypeEvenement } from '@/lib/evenements'
import { formulesIntro, libelleChamp, longueurConseillee } from '@/lib/redaction'
import styles from './editeur.module.css'

/**
 * Un champ de la carte, avec son guidage.
 *
 * C'est ici que les gens galèrent : ils ne savent pas quoi écrire, et ils ne
 * savent pas quand leur texte va déborder du cadre. On leur dit les deux.
 */
export function Champ({
  champ,
  type,
  valeurInitiale,
}: {
  champ: ChampGabarit
  type: TypeEvenement
  valeurInitiale: string
}) {
  const [valeur, setValeur] = useState(valeurInitiale)
  const etat = longueurConseillee(valeur, champ.maxLongueur)
  const identifiant = `champ-${champ.id}`
  const estLong = champ.type === 'texte_long'
  const propose = champ.id === 'texte_intro' ? formulesIntro(type) : []

  const classeCompteur =
    etat === 'trop-long'
      ? styles.compteurLong
      : etat === 'proche'
        ? styles.compteurProche
        : styles.compteur

  return (
    <div className={styles.champ}>
      <label className="etiquette-champ" htmlFor={identifiant}>
        {libelleChamp(champ.id, type)}
      </label>

      {estLong ? (
        <textarea
          id={identifiant}
          name={identifiant}
          className="saisie"
          rows={3}
          value={valeur}
          onChange={(e) => setValeur(e.target.value)}
        />
      ) : (
        <input
          id={identifiant}
          name={identifiant}
          className="saisie"
          type={champ.type === 'date' ? 'text' : 'text'}
          value={valeur}
          onChange={(e) => setValeur(e.target.value)}
          {...(champ.id === 'date' ? { placeholder: '14 mars 2027' } : {})}
        />
      )}

      {propose.length > 0 && (
        <div className={styles.formules}>
          {propose.map((formule) => (
            <button
              key={formule.texte}
              type="button"
              className={styles.formule}
              onClick={() => setValeur(formule.texte)}
            >
              {formule.texte}
              {formule.langue === 'wolof' ? ' · wolof' : ''}
            </button>
          ))}
        </div>
      )}

      {champ.maxLongueur && (
        <p className={classeCompteur}>
          {etat === 'trop-long'
            ? `${valeur.length} caractères — au-delà de ${champ.maxLongueur}, le texte sera réduit pour tenir dans la carte.`
            : `${valeur.length} / ${champ.maxLongueur} caractères`}
        </p>
      )}
    </div>
  )
}
