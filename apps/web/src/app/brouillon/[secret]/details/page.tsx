import { notFound } from 'next/navigation'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { sauverDetails } from '../actions'
import styles from '../editeur.module.css'

export default async function EtapeDetails({
  params,
}: {
  params: Promise<{ secret: string }>
}) {
  const { secret } = await params
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) notFound()

  return (
    <div className={styles.formulaire}>
      <div>
        <h1 className={styles.titre}>Les détails</h1>
        <p className={styles.introduction}>
          Tout est facultatif. Ce que vous remplissez apparaîtra sur la page que reçoivent
          vos invités.
        </p>
      </div>

      <form action={sauverDetails} className={styles.formulaire}>
        <input type="hidden" name="secret" value={secret} />

        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="codeVestimentaire">
            La tenue
          </label>
          <input
            id="codeVestimentaire"
            name="codeVestimentaire"
            className="saisie"
            defaultValue={brouillon.codeVestimentaire ?? ''}
            placeholder="Bazin et tons indigo"
          />
          <p className={styles.compteur}>
            Le tissu commun, la couleur attendue. Vos invités y tiennent plus qu’on ne croit.
          </p>
        </div>

        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="motDesHotes">
            Votre mot
          </label>
          <textarea
            id="motDesHotes"
            name="motDesHotes"
            className="saisie"
            rows={4}
            defaultValue={brouillon.motDesHotes ?? ''}
            placeholder="Nous serions honorés de vous compter parmi nous…"
          />
        </div>

        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="telephoneHote">
            Un numéro pour les questions
          </label>
          <input
            id="telephoneHote"
            name="telephoneHote"
            type="tel"
            inputMode="tel"
            className="saisie"
            defaultValue={brouillon.telephoneHote ?? ''}
            placeholder="+221 77 123 45 67"
          />
          <p className={styles.compteur}>
            Vos invités pourront écrire directement sur WhatsApp. Laissez vide si vous
            préférez.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="submit" className="bouton">
            Enregistrer
          </button>
        </div>
      </form>

      <div className={styles.actions}>
        <a className="bouton" href={`/brouillon/${secret}/publier`}>
          Voir le résultat et publier
        </a>
      </div>
    </div>
  )
}
