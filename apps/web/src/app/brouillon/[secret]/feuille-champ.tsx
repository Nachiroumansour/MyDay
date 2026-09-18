'use client'

import { useEffect, useRef } from 'react'
import { longueurConseillee } from '@/lib/redaction'
import { useCarte } from './carte-vivante'
import styles from './editeur.module.css'

/** Au-delà de cette largeur, le formulaire est visible à côté de la carte. */
const BUREAU = '(min-width: 62.5rem)'

/**
 * L'édition d'un texte touché sur la carte.
 *
 * Au téléphone, une feuille monte du bas de l'écran, dans la zone que le pouce
 * atteint sans effort, et ne montre qu'un champ à la fois — la recherche
 * publique britannique et NN/g s'accordent : c'est ce qui convient aux gens
 * peu à l'aise avec les formulaires. « Suivant » enchaîne sur le texte d'en
 * dessous, dans l'ordre où on lit la carte : on remplit l'invitation de haut en
 * bas sans jamais chercher où l'on en est.
 *
 * Sur un grand écran, le formulaire est déjà là, à côté : ouvrir une feuille
 * par-dessus serait un détour. Le champ correspondant y est simplement amené
 * sous les yeux et mis en valeur.
 */
export function FeuilleChamp() {
  const { valeurs, changer, champs, actif, ouvrir, fermer } = useCarte()
  const feuille = useRef<HTMLDialogElement>(null)
  const saisie = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const rang = champs.findIndex((champ) => champ.id === actif)
  const champ = rang >= 0 ? champs[rang] : undefined

  useEffect(() => {
    if (!actif) {
      if (feuille.current?.open) feuille.current.close()
      return
    }

    if (window.matchMedia(BUREAU).matches) {
      const cible = document.getElementById(`champ-${actif}`)
      if (cible) {
        cible.scrollIntoView({ behavior: 'smooth', block: 'center' })
        cible.focus({ preventScroll: true })
        const bloc = cible.closest('[data-champ-bloc]')
        bloc?.setAttribute('data-eclaire', '')
        setTimeout(() => bloc?.removeAttribute('data-eclaire'), 1200)
      }
      // Rien ne reste ouvert : toucher le même texte doit pouvoir recommencer.
      fermer()
      return
    }

    // La feuille occupe le bas de l'écran : le texte qu'on édite doit rester
    // visible au-dessus, sinon on écrit sans voir ce que ça donne. Une date ou
    // un lieu en bas de carte seraient sinon recouverts.
    document
      .querySelector(`[data-zone="${actif}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    if (!feuille.current?.open) feuille.current?.showModal()
    // Le clavier s'ouvre sur le champ : on est venu pour écrire.
    requestAnimationFrame(() => saisie.current?.focus({ preventScroll: true }))
  }, [actif, fermer])

  if (!champ) {
    return <dialog ref={feuille} className={styles.feuille} onClose={fermer} />
  }

  const valeur = valeurs[champ.id] ?? ''
  const etat = longueurConseillee(valeur, champ.maxLongueur)
  const precedent = champs[rang - 1]
  const suivant = champs[rang + 1]
  const estLong = champ.type === 'texte_long'

  const commun = {
    id: 'feuille-saisie',
    className: etat === 'trop-long' ? `saisie ${styles.saisieLongue}` : 'saisie',
    value: valeur,
    onChange: (e: { target: { value: string } }) => changer(champ.id, e.target.value),
    placeholder: champ.exemple,
    'aria-describedby': 'feuille-aide',
  }

  return (
    <dialog
      ref={feuille}
      className={styles.feuille}
      onClose={fermer}
      // Toucher le voile, hors de la feuille, la referme.
      onClick={(e) => e.target === feuille.current && feuille.current?.close()}
      aria-labelledby="feuille-libelle"
    >
      <div className={styles.feuilleCorps}>
        <span className={styles.feuillePoignee} aria-hidden="true" />

        <div className={styles.feuilleTete}>
          <label id="feuille-libelle" htmlFor="feuille-saisie" className={styles.feuilleLibelle}>
            {champ.libelle}
            {champ.facultatif && <span className={styles.facultatif}>facultatif</span>}
          </label>
          <span className={styles.feuilleRang}>
            {rang + 1} / {champs.length}
          </span>
        </div>

        {estLong ? (
          <textarea
            {...commun}
            ref={saisie as React.RefObject<HTMLTextAreaElement>}
            rows={3}
          />
        ) : (
          <input
            {...commun}
            ref={saisie as React.RefObject<HTMLInputElement>}
            type="text"
            enterKeyHint={suivant ? 'next' : 'done'}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              if (suivant) ouvrir(suivant.id)
              else feuille.current?.close()
            }}
          />
        )}

        <p id="feuille-aide" className={styles.feuilleAide}>
          {etat === 'trop-long'
            ? `${valeur.length} caractères : au-delà de ${champ.maxLongueur}, le texte sera réduit pour tenir.`
            : etat === 'proche'
              ? `${valeur.length} / ${champ.maxLongueur}`
              : 'La carte se met à jour pendant que vous écrivez.'}
        </p>

        <div className={styles.feuilleActions}>
          {precedent ? (
            <button type="button" className="bouton-contour" onClick={() => ouvrir(precedent.id)}>
              Précédent
            </button>
          ) : (
            <span />
          )}
          {suivant ? (
            <button type="button" className="bouton" onClick={() => ouvrir(suivant.id)}>
              Suivant
            </button>
          ) : (
            <button type="button" className="bouton" onClick={() => feuille.current?.close()}>
              Terminé
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}
