/** @jsxImportSource preact */

import type { RestantDetaille } from '@/lib/dates'

/**
 * Le compte à rebours, en odomètre.
 *
 * Chaque chiffre est une colonne de dix cases glissée derrière un masque : un
 * changement de chiffre coûte une seule transformation, ce que le téléphone
 * le plus modeste sait faire à soixante images par seconde. Les autres
 * patrons — le volet basculant des tableaux d'aéroport, les anneaux SVG —
 * demandent bien plus de travail par seconde pour un résultat plus bruyant
 * sur une invitation.
 *
 * La colonne porte onze cases et non dix : un 9 supplémentaire est posé en
 * tête. Sans lui, le passage de 0 à 9 ferait défiler toute la colonne à
 * l'envers ; avec lui, il ne coûte qu'un cran vers le bas, et l'on saute
 * ensuite sans transition sur le 9 de queue.
 *
 * Le serveur écrit les chiffres justes : sans JavaScript, l'invité voit un
 * compte à rebours figé mais exact, jamais des zéros.
 */

const CASES = ['9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/** L'index de la case à montrer pour un chiffre donné. */
function rang(chiffre: number): number {
  return chiffre + 1
}

function Chiffre({ valeur }: { valeur: number }) {
  return (
    <span className="chiffre" data-n={rang(valeur)} style={`--n:${rang(valeur)}`}>
      <span className="rouleau">
        {CASES.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </span>
    </span>
  )
}

function Unite({ cle, valeur, largeur, nom }: { cle: string; valeur: number; largeur: number; nom: string }) {
  const chiffres = String(valeur).padStart(largeur, '0').split('').map(Number)
  return (
    <span className="unite">
      <span className="chiffres" data-unite={cle}>
        {chiffres.map((c, i) => (
          <Chiffre key={i} valeur={c} />
        ))}
      </span>
      <span className="unite-nom">{nom}</span>
    </span>
  )
}

export default function CompteARebours({
  restant,
  cible,
  legende,
}: {
  restant: RestantDetaille
  cible: Date
  legende: string
}) {
  // Les jours gardent la largeur qu'ils ont à l'arrivée : un mariage dans
  // trois cents jours mérite trois colonnes, un mariage demain en garde deux.
  const largeurJours = Math.max(2, String(restant.jours).length)

  return (
    <div className="compteur">
      <div className="grille-compteur" data-cible={String(cible.getTime())}>
        <Unite cle="j" valeur={restant.jours} largeur={largeurJours} nom="jours" />
        <Unite cle="h" valeur={restant.heures} largeur={2} nom="heures" />
        <Unite cle="m" valeur={restant.minutes} largeur={2} nom="min" />
        <Unite cle="s" valeur={restant.secondes} largeur={2} nom="sec" />
        <p className="compteur-arrive">C’est le grand jour</p>
      </div>
      <p className="compteur-legende">{legende}</p>
    </div>
  )
}

/**
 * Le battement, hors du routeur comme le reste de cette page.
 *
 * L'heure restante est recalculée depuis l'horloge à chaque battement, jamais
 * décrémentée : un onglet mis en veille reprend juste, sans dérive.
 */
export const SCRIPT_COMPTEUR = `
(function(){
  var g=document.querySelector('[data-cible]');if(!g)return;
  var cible=+g.dataset.cible;
  var UNITES=[['j',86400000],['h',3600000],['m',60000],['s',1000]];
  var GLISSE=520;
  function poser(chiffre,valeur){
    var actuel=+chiffre.dataset.n, vise=valeur+1;
    if(actuel===vise)return;
    chiffre.dataset.n=vise;
    if(actuel===1&&valeur===9){
      // Un cran vers le bas sur le 9 de tête, puis on rattrape le 9 de queue.
      chiffre.style.setProperty('--n',0);
      setTimeout(function(){
        chiffre.classList.add('sans-glisse');
        chiffre.style.setProperty('--n',10);
        void chiffre.offsetHeight;
        chiffre.classList.remove('sans-glisse');
      },GLISSE+40);
      return;
    }
    chiffre.style.setProperty('--n',vise);
  }
  function battre(){
    var reste=cible-Date.now();
    if(reste<=0){g.dataset.etat='arrive';clearInterval(t);return}
    for(var i=0;i<UNITES.length;i++){
      var pas=UNITES[i][1], valeur=Math.floor(reste/pas);
      reste-=valeur*pas;
      var boite=g.querySelector('[data-unite='+UNITES[i][0]+']');
      if(!boite)continue;
      var cols=boite.children, texte=String(valeur);
      while(texte.length<cols.length)texte='0'+texte;
      for(var k=0;k<cols.length;k++)poser(cols[k],+texte[k]);
    }
  }
  var t=setInterval(battre,1000);
  battre();
})()`
