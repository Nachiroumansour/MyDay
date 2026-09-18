'use client'

import { useEffect, useRef } from 'react'
import type { ChampGabarit } from '@myday/moteur'
import type { TypeEvenement } from '@/lib/evenements'
import { formulesIntro, libelleChamp, longueurConseillee } from '@/lib/redaction'
import { useCarte } from './carte-vivante'
import styles from './editeur.module.css'

/**
 * Un champ de la carte.
 *
 * Ce que l'on tape part dans l'état partagé : l'aperçu suit, et le brouillon
 * s'enregistre tout seul. Plus de bouton à trouver, plus de travail perdu
 * parce qu'on a changé d'étape sans penser à enregistrer.
 *
 * Le compteur ne s'affiche qu'à l'approche de la limite. Un « 0 / 22 » sous
 * une case vide n'apprend rien à personne et remplit l'écran de bruit ; c'est
 * au moment de déborder que le chiffre compte.
 *
 * Le champ n'est pas contrôlé par React : sur un réseau lent, ce que l'on
 * tape avant que le JavaScript n'arrive serait sinon effacé à l'hydratation.
 * Le DOM garde la saisie, et on la reverse dans l'état au montage.
 */
export function Champ({
  champ,
  type,
  exemple,
}: {
  champ: ChampGabarit
  type: TypeEvenement
  /** Le texte que le graphiste a mis dans son modèle, montré en filigrane. */
  exemple?: string
}) {
  const { valeurs, changer } = useCarte()
  const valeur = valeurs[champ.id] ?? ''
  const saisie = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const etat = longueurConseillee(valeur, champ.maxLongueur)

  useEffect(() => {
    const dejaTape = saisie.current?.value ?? ''
    if (dejaTape !== valeur) changer(champ.id, dejaTape)
    // Au montage seulement : ensuite c'est onChange qui mène.
     
  }, [])

  // La même valeur s'édite aussi depuis la carte, dans la feuille qui monte du
  // bas. Le champ n'étant pas contrôlé, on y reporte ce qui a changé ailleurs —
  // sauf pendant qu'on y écrit, pour ne pas déplacer le curseur sous les doigts.
  useEffect(() => {
    const noeud = saisie.current
    if (noeud && document.activeElement !== noeud && noeud.value !== valeur) {
      noeud.value = valeur
    }
  }, [valeur])
  const identifiant = `champ-${champ.id}`
  const estLong = champ.type === 'texte_long'
  const propose = champ.id === 'texte_intro' ? formulesIntro(type) : []

  const commun = {
    id: identifiant,
    name: identifiant,
    className: etat === 'trop-long' ? `saisie ${styles.saisieLongue}` : 'saisie',
    defaultValue: valeurs[champ.id] ?? '',
    onChange: (e: { target: { value: string } }) => changer(champ.id, e.target.value),
    placeholder: exemple ?? undefined,
  }

  const rempli = valeur.trim() !== ''

  return (
    <div
      className={rempli ? `${styles.champ} ${styles.champRempli}` : styles.champ}
      data-champ-bloc
    >
      <label className="etiquette-champ" htmlFor={identifiant}>
        {libelleChamp(champ.id, type)}
        {champ.facultatif && <span className={styles.facultatif}>facultatif</span>}
      </label>

      {estLong ? (
        <textarea {...commun} rows={3} ref={saisie as React.RefObject<HTMLTextAreaElement>} />
      ) : (
        <input {...commun} type="text" ref={saisie as React.RefObject<HTMLInputElement>} />
      )}

      {propose.length > 0 && (
        <div className={styles.formules}>
          {propose.map((formule) => (
            <button
              key={formule.texte}
              type="button"
              className={styles.formule}
              onClick={() => {
                if (saisie.current) saisie.current.value = formule.texte
                changer(champ.id, formule.texte)
              }}
            >
              {formule.texte}
              {formule.langue === 'wolof' ? ' · wolof' : ''}
            </button>
          ))}
        </div>
      )}

      {etat !== 'bon' && champ.maxLongueur && (
        <p className={etat === 'trop-long' ? styles.compteurLong : styles.compteurProche}>
          {etat === 'trop-long'
            ? `${valeur.length} caractères : au-delà de ${champ.maxLongueur}, le texte sera réduit pour tenir.`
            : `${valeur.length} / ${champ.maxLongueur}`}
        </p>
      )}
    </div>
  )
}
