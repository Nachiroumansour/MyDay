const COLONNES = [
  {
    titre: 'Navigation',
    liens: [
      { libelle: 'Accueil', href: '/' },
      { libelle: 'Catalogue', href: '/modeles' },
      { libelle: 'Trouver mon style', href: '/guide' },
    ],
  },
  {
    titre: 'Cérémonies',
    liens: [
      { libelle: 'Mariages (takk)', href: '/modeles?type=mariage' },
      { libelle: 'Baptêmes (ngénte)', href: '/modeles?type=bapteme' },
      { libelle: 'Anniversaires', href: '/modeles?type=anniversaire' },
    ],
  },
]

export function PiedSite() {
  return (
    <footer className="pied-site">
      <div className="contenu">
        <div className="pied-grille">
          <div className="pied-colonne">
            <span className="pied-marque">MyDay</span>
            <p className="legende" style={{ maxWidth: '32ch' }}>
              Les invitations de vos cérémonies, au Sénégal et dans la diaspora.
            </p>
          </div>

          {COLONNES.map((colonne) => (
            <nav key={colonne.titre} className="pied-colonne" aria-label={colonne.titre}>
              <span className="pied-titre">{colonne.titre}</span>
              {colonne.liens.map((lien) => (
                <a key={lien.href} className="pied-lien" href={lien.href}>
                  {lien.libelle}
                </a>
              ))}
            </nav>
          ))}

          <div className="pied-colonne">
            <span className="pied-titre">Nous écrire</span>
            <span className="pied-lien">Dakar, Sénégal</span>
            <a className="pied-lien" href="mailto:contact@myday.sn">
              contact@myday.sn
            </a>
          </div>
        </div>

        <p className="pied-bas">
          Conçu à Dakar, pour le Sénégal et la diaspora.
        </p>
      </div>
    </footer>
  )
}
