/** @jsxImportSource preact */
const DUREE_OUVERTURE = 900

/**
 * Le script qui pilote l'ouverture. Volontairement minuscule et en ligne :
 * le geste doit fonctionner dès que le HTML arrive. Sur un réseau lent, un
 * invité qui touche l'enveloppe et pour qui rien ne se passe est perdu.
 */
export const SCRIPT_ENVELOPPE = `
(function(){
  var v=document.getElementById('enveloppe');if(!v)return;
  var m;
  function memoriser(){
    try{localStorage.setItem('myday:enveloppe:'+v.dataset.slug,'1')}catch(e){}
    document.documentElement.dataset.enveloppe='vue';
  }
  function effacer(){v.dataset.etat='partie'}
  v.querySelector('[data-role=ouvrir]').addEventListener('click',function(){
    if(v.dataset.etat!=='attente')return;
    v.dataset.etat='ouverture';memoriser();m=setTimeout(effacer,${DUREE_OUVERTURE});
  });
  v.querySelector('[data-role=passer]').addEventListener('click',function(){
    clearTimeout(m);memoriser();effacer();
  });
})()`

/** Lu avant la peinture : l'invité qui revient ne revoit pas l'ouverture. */
export function scriptMemoire(slug: string): string {
  return `try{if(localStorage.getItem('myday:enveloppe:${slug}'))document.documentElement.dataset.enveloppe='vue'}catch(e){}`
}

interface Props {
  slug: string
  titre: string
  initiales: string
  couleur: string
}

export default function Enveloppe({ slug, titre, initiales, couleur }: Props) {
  return (
    <div
      id="enveloppe"
      className="voile"
      data-etat="attente"
      data-slug={slug}
      role="dialog"
      aria-label={`Invitation de ${titre}`}
    >
      <button type="button" className="passer" data-role="passer">
        Passer
      </button>

      <p className="voile-intro">Une invitation pour vous</p>
      <p className="voile-noms">{titre}</p>

      <button type="button" className="pli" data-role="ouvrir" aria-label="Ouvrir l’invitation">
        <svg viewBox="0 0 320 224" aria-hidden="true">
          <rect x="25" y="55" width="270" height="150" fill="#1b1f28" />

          {/* La carte, invisible tant que l'enveloppe est close — sans quoi
              elle transparaîtrait à travers le rabat. */}
          <g className="carte-pliee">
            <rect x="52" y="48" width="216" height="140" fill="#f7f8fa" />
            <rect x="52" y="48" width="216" height="5" fill={couleur} />
          </g>

          <g className="rabat">
            <path d="M25 55 L160 148 L295 55 Z" fill="#262b36" />
            <path d="M25 55 L160 148 L295 55" fill="none" stroke="#33394a" strokeWidth="1" />
          </g>

          <g className="cachet">
            <circle cx="160" cy="140" r="27" fill={couleur} />
            <circle cx="160" cy="140" r="22" fill="none" stroke="#ffffff" strokeOpacity="0.28" />
            <text
              x="160"
              y="148"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="19"
              fontWeight="600"
              letterSpacing="1"
            >
              {initiales}
            </text>
          </g>
        </svg>
      </button>

      <p className="voile-invite">Touchez pour ouvrir</p>
    </div>
  )
}
