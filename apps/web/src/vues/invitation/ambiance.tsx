/** @jsxImportSource preact */

/**
 * La pluie de la fête : pétales pour un mariage, étoiles douces pour un
 * baptême, confettis et chapeaux pour un anniversaire.
 *
 * Ce sont des formes dessinées en CSS, pas des emoji : un emoji change de
 * dessin d'un téléphone à l'autre, et pèse une police entière quand la page
 * doit rester sous les cent kilo-octets. Les positions, durées et retards
 * vivent dans la feuille de style (`:nth-child`) — ici, on ne pose que le
 * nombre d'éléments et le décor à jouer.
 */

const NOMBRE = 14

export type TypeFete = 'mariage' | 'bapteme' | 'anniversaire'

export function Ambiance({ type }: { type: TypeFete }) {
  return (
    <div className="ciel" data-fete={type} aria-hidden="true">
      {Array.from({ length: NOMBRE }, (_, i) => (
        <span key={i} className="flocon" />
      ))}
    </div>
  )
}
