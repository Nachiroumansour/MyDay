/** @jsxImportSource preact */

import { Ambiance, type TypeFete } from './ambiance'
import { IconeAnneau, IconeColombe, IconeCoupe } from './icones'

/** Le cachet porte l'emblème de la fête, pas un cœur pour tout le monde. */
const EMBLEME: Record<TypeFete, () => preact.JSX.Element> = {
  mariage: IconeAnneau,
  bapteme: IconeColombe,
  anniversaire: IconeCoupe,
}

/** Le temps que dure l'ouverture, du clic à la page. Doit suivre les keyframes. */
const DUREE_OUVERTURE = 1600

/**
 * L'ouverture de l'enveloppe.
 *
 * C'est le premier geste de l'invité, et le seul moment de la page qui doit
 * faire un effet : une enveloppe fermée, son sceau de cire, le rabat qui
 * bascule, la carte qui glisse dehors. Tout est en CSS — le script ne fait
 * que basculer un attribut.
 *
 * Volontairement sans React : le geste doit fonctionner dès que le HTML
 * arrive, pas après l'hydratation. Sur un réseau lent, un invité qui touche
 * l'enveloppe et pour qui rien ne se passe est un invité perdu.
 *
 * La mémorisation n'a lieu qu'une fois l'ouverture terminée : la faire au clic
 * déclencherait aussitôt la règle qui masque le voile, et l'animation n'aurait
 * jamais le temps de se jouer.
 *
 * Sans JavaScript du tout, le voile est masqué : il est un enrichissement,
 * jamais un péage devant l'information.
 */
export const SCRIPT_ENVELOPPE = `
(function(){
  var v=document.getElementById('enveloppe');if(!v)return;
  var m;
  function memoriser(){
    try{localStorage.setItem('myday:enveloppe:'+v.dataset.slug,'1')}catch(e){}
    document.documentElement.dataset.enveloppe='vue';
  }
  function effacer(){v.dataset.etat='partie';memoriser()}
  function ouvrir(){
    if(v.dataset.etat!=='attente')return;
    v.dataset.etat='ouverture';
    var lent=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    m=setTimeout(effacer,lent?260:${DUREE_OUVERTURE});
  }
  v.querySelector('[data-role=ouvrir]').addEventListener('click',ouvrir);
  v.querySelector('[data-role=enveloppe]').addEventListener('click',ouvrir);
  v.querySelector('[data-role=passer]').addEventListener('click',function(){
    clearTimeout(m);effacer();
  });
})()`

/** Lu avant la peinture : l'invité qui revient ne revoit pas l'ouverture. */
export function scriptMemoire(slug: string): string {
  return `try{if(localStorage.getItem('myday:enveloppe:${slug}'))document.documentElement.dataset.enveloppe='vue'}catch(e){}`
}

interface Props {
  slug: string
  titre: string
  intitule: string
  type: TypeFete
  /** Nom de l'invité, quand il ouvre son lien nominatif. */
  invite?: string
}

export default function Enveloppe({ slug, titre, intitule, type, invite }: Props) {
  const Embleme = EMBLEME[type]

  return (
    <div
      id="enveloppe"
      className="voile"
      data-etat="attente"
      data-slug={slug}
      role="dialog"
      aria-label={`Invitation de ${titre}`}
    >
      <Ambiance type={type} />

      <div className="pli-scene">
        {/* Toute l'enveloppe est cliquable : c'est le geste qu'on a envie de
            faire en la voyant. Le bouton reste, pour le clavier et pour dire
            quoi faire. */}
        <div className="pli-enveloppe" data-role="enveloppe">
          <span className="pli-dos" aria-hidden="true" />

          <div className="pli-carte">
            <p className="pli-sur-titre">{invite ? `Pour ${invite}` : 'Invitation officielle'}</p>
            <p className="pli-noms">{intitule}</p>
            <p className="pli-mot">
              Vous êtes cordialement convié à célébrer ce moment avec nous.
            </p>
          </div>

          <span className="pli-poche" aria-hidden="true">
            <span className="pli-adresse">
              {invite ? invite : 'À nos invités'}
              <span className="pli-filet" />
              <span className="pli-mention">Invitation</span>
            </span>
          </span>

          <span className="pli-rabat" aria-hidden="true" />

          <span className="pli-sceau" aria-hidden="true">
            <Embleme />
          </span>
        </div>

        <button type="button" className="pli-bouton" data-role="ouvrir">
          Ouvrir l’enveloppe
        </button>
        <button type="button" className="passer" data-role="passer">
          Passer l’animation
        </button>
      </div>
    </div>
  )
}
