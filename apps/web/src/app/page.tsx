import { couleurEvenement, libelleEvenement, TYPES_EVENEMENT } from '@/lib/evenements'

export default function Accueil() {
  return (
    <main
      style={{
        maxWidth: 'var(--largeur-maximale)',
        margin: '0 auto',
        padding: '64px var(--marge-laterale)',
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
      }}
    >
      <h1>
        Votre invitation,
        <br />
        prête ce soir.
      </h1>
      <p className="legende">
        Choisissez un modèle, écrivez vos noms, partagez le lien sur WhatsApp.
      </p>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {TYPES_EVENEMENT.map((type) => (
          <li
            key={type}
            style={{
              padding: '10px 18px',
              border: `1px solid ${couleurEvenement(type)}`,
              color: couleurEvenement(type),
              fontWeight: 600,
            }}
          >
            {libelleEvenement(type)}
          </li>
        ))}
      </ul>
    </main>
  )
}
