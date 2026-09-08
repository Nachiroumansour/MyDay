/**
 * Feuille de style de la page invitation, en ligne dans le document.
 *
 * Elle vit dans un fichier TypeScript et non dans un `.css` parce que cette
 * page n'est pas rendue par le routeur de Next : elle est produite en HTML
 * statique. L'inliner supprime une requête réseau, ce qui compte plus que le
 * confort d'édition sur une page servie en 3G.
 *
 * Les jetons reprennent la maquette Stitch.
 */
export const STYLES = `
@font-face {
  font-family: 'Playfair Display';
  src: url('/polices/playfair-display.woff2') format('woff2');
  font-weight: 500 700;
  font-display: swap;
}

@font-face {
  font-family: 'InterVar';
  src: url('/polices/inter.woff2') format('woff2');
  font-weight: 400 600;
  font-display: swap;
}

:root {
  --surface: #FCF9F3;
  --surface-basse: #F6F3ED;
  --surface-carte: #FFFFFF;
  --surface-teintee: #F0EEE8;
  --surface-variante: #E5E2DC;

  --encre: #1C1C18;
  --encre-douce: #57423B;

  --primaire: #9F3C16;
  --primaire-vive: #BF542C;
  --primaire-claire: #FFDBCF;
  --secondaire: #735C00;
  --secondaire-claire: #FED65B;
  --tertiaire: #973F50;
  --tertiaire-claire: #FFD9DD;
  --erreur: #BA1A1A;

  --marge: 24px;
  --lecture: 620px;
  --rayon: 8px;
  --rayon-lg: 12px;
  --rayon-plein: 9999px;
  --court: 160ms;
  --ombre: 0 1px 2px rgba(28,28,24,.04), 0 8px 24px -12px rgba(28,28,24,.14);
}

* { box-sizing: border-box; }

html, body { margin: 0; padding: 0; background: var(--surface); color: var(--encre); }

body {
  font-family: 'InterVar', system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

p { margin: 0; }
a { color: inherit; }

:focus-visible { outline: 2px solid var(--primaire); outline-offset: 3px; }

.enveloppe-page { max-width: var(--lecture); margin: 0 auto; padding: 0 var(--marge); }

/* ---------- L'ouverture ---------- */

.voile {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: radial-gradient(120% 90% at 50% 15%, #B54A1E 0%, #8A3410 52%, #5E230A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: hidden;
  transition: opacity 460ms ease, visibility 460ms;
}

html[data-enveloppe='vue'] .voile { display: none; }
.voile[data-etat='partie'] { opacity: 0; visibility: hidden; pointer-events: none; }

.pli-scene {
  position: relative;
  z-index: 1;
  width: min(100%, 400px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  animation: pli-arrivee 900ms cubic-bezier(.22,1,.36,1) both;
}

@keyframes pli-arrivee {
  from { opacity: 0; transform: translateY(26px) scale(.94); }
  to   { opacity: 1; transform: none; }
}

/* L'enveloppe : une poche, un rabat, un sceau. Le tout empilé en z. */
.pli-enveloppe {
  position: relative;
  width: 100%;
  aspect-ratio: 1.48 / 1;
  perspective: 1100px;
  cursor: pointer;
  filter: drop-shadow(0 26px 44px rgba(0,0,0,.45));
  animation: pli-respire 5.5s ease-in-out infinite;
}

/* Une respiration à peine perceptible : l'enveloppe a l'air vivante,
   et l'invité comprend qu'elle attend d'être touchée. */
@keyframes pli-respire {
  0%, 100% { transform: translateY(0) rotate(-.4deg); }
  50%      { transform: translateY(-7px) rotate(.4deg); }
}

.voile[data-etat='ouverture'] .pli-enveloppe { animation: none; }

/* Le dos de l'enveloppe : ce que l'on voit une fois le rabat relevé. */
.pli-dos {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 10px;
  background: linear-gradient(200deg, #E9D9C9 0%, #DCC6B2 100%);
}

/* La carte, glissée dans la poche. Elle en sort à l'ouverture. Ses bords
   tiennent dans ceux de l'enveloppe : rien ne dépasse tant qu'elle dort. */
.pli-carte {
  position: absolute;
  left: 5%;
  right: 5%;
  top: 8%;
  bottom: 5%;
  z-index: 2;
  overflow: hidden;
  padding: 20px 20px 18px;
  justify-content: center;
  border-radius: 10px;
  background: linear-gradient(170deg, #FFFDF8 0%, var(--surface-basse) 100%);
  box-shadow: 0 10px 26px -14px rgba(0,0,0,.5);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
}

.voile[data-etat='ouverture'] .pli-carte {
  animation: pli-sortie 800ms cubic-bezier(.2,.9,.25,1) 780ms both;
}

@keyframes pli-sortie {
  0%   { transform: translateY(0) scale(1); }
  60%  { transform: translateY(-78%) scale(1.05); opacity: 1; }
  100% { transform: translateY(-104%) scale(1.14); opacity: 0; }
}

/* La poche : le devant de l'enveloppe, découpé en V. */
.pli-poche {
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: 10px;
  background: linear-gradient(160deg, #F3E7DB 0%, #E4D2C2 100%);
  clip-path: polygon(0 0, 50% 46%, 100% 0, 100% 100%, 0 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 12%;
}

.pli-adresse {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 17px;
  font-weight: 600;
  color: #6E2A0C;
}

.pli-filet { display: block; width: 46px; height: 1px; background: rgba(110,42,12,.35); }

.pli-mention {
  font-family: 'InterVar', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgba(110,42,12,.6);
}

/* Le rabat, charnière en haut. Il bascule en arrière puis passe derrière. */
.pli-rabat {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 47%;
  z-index: 4;
  border-radius: 10px 10px 0 0;
  background: linear-gradient(180deg, #EFDFD0 0%, #DFC9B5 100%);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform-origin: top center;
}

.voile[data-etat='ouverture'] .pli-rabat {
  animation: pli-rabat 620ms cubic-bezier(.45,-0.15,.3,1.12) 200ms both;
}

/* Le rabat bascule vers le lecteur, et non vers l'arrière : c'est le geste
   que l'on voit. Passé la verticale, c'est son envers qui apparaît, plus
   sombre. Au tout dernier instant il repasse sous la carte, qui sort par
   devant lui. */
@keyframes pli-rabat {
  0%   { transform: rotateX(0deg); z-index: 4;
         background: linear-gradient(180deg, #EFDFD0 0%, #DFC9B5 100%); }
  50%  { background: linear-gradient(180deg, #E4D0BE 0%, #D6BCA6 100%); }
  99%  { z-index: 4; }
  100% { transform: rotateX(148deg); z-index: 1;
         background: linear-gradient(180deg, #D2B69E 0%, #C4A68C 100%); }
}

/* Le sceau de cire, posé sur la pointe du rabat. */
.pli-sceau {
  position: absolute;
  top: 46%;
  left: 50%;
  z-index: 5;
  width: 52px;
  height: 52px;
  margin: -26px 0 0 -26px;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 30%, #C2532A 0%, #9F3C16 55%, #7A2C0E 100%);
  color: rgba(255,255,255,.9);
  display: grid;
  place-items: center;
  box-shadow: inset 0 -2px 5px rgba(0,0,0,.3), 0 3px 8px rgba(0,0,0,.3);
}

.pli-sceau svg { width: 22px; height: 22px; }

.voile[data-etat='ouverture'] .pli-sceau {
  animation: pli-sceau 380ms cubic-bezier(.3,.9,.4,1) both;
}

/* Le cachet se brise : il grossit, pivote, et s'efface. */
@keyframes pli-sceau {
  0%   { transform: scale(1) rotate(0); opacity: 1; }
  35%  { transform: scale(1.18) rotate(-8deg); opacity: 1; }
  100% { transform: scale(.55) rotate(24deg) translateY(16px); opacity: 0; }
}

.pli-sur-titre {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--secondaire);
}

.pli-noms {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(19px, 5vw, 25px);
  font-weight: 600;
  line-height: 1.15;
}

.pli-mot { font-size: 13px; color: var(--encre-douce); max-width: 30ch; }

.pli-bouton {
  appearance: none;
  border: none;
  width: 100%;
  padding: 15px 24px;
  border-radius: var(--rayon);
  background: var(--surface);
  color: var(--primaire);
  font: inherit;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 20px -10px rgba(0,0,0,.6);
  transition: transform var(--court), background var(--court);
}

.pli-bouton:hover { background: #fff; transform: translateY(-1px); }
.pli-bouton:active { transform: translateY(0); }

.voile[data-etat='ouverture'] .pli-bouton,
.voile[data-etat='ouverture'] .passer { opacity: 0; transition: opacity 200ms ease; }

.passer {
  appearance: none;
  background: none;
  border: none;
  font: inherit;
  font-size: 13px;
  color: rgba(255,255,255,.75);
  text-decoration: underline;
  cursor: pointer;
  padding: 4px;
}

/* ---------- La pluie de la fête ---------- */

.ciel {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.flocon {
  position: absolute;
  top: -8%;
  width: 11px;
  height: 11px;
  opacity: 0;
  animation-name: tomber;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

/* Chaque élément part d'un endroit et d'un instant différents. Les retards
   sont négatifs : la pluie est déjà en cours quand la page apparaît, plutôt
   que de démarrer d'un coup sur une page vide. */
.flocon:nth-child(1)  { left:  4%; animation-duration: 11s; animation-delay:  -1s;  }
.flocon:nth-child(2)  { left: 12%; animation-duration:  9s; animation-delay:  -5s;  }
.flocon:nth-child(3)  { left: 20%; animation-duration: 13s; animation-delay:  -9s;  }
.flocon:nth-child(4)  { left: 28%; animation-duration: 10s; animation-delay:  -3s;  }
.flocon:nth-child(5)  { left: 36%; animation-duration: 14s; animation-delay: -12s;  }
.flocon:nth-child(6)  { left: 44%; animation-duration:  8s; animation-delay:  -6s;  }
.flocon:nth-child(7)  { left: 52%; animation-duration: 12s; animation-delay:  -2s;  }
.flocon:nth-child(8)  { left: 60%; animation-duration: 10s; animation-delay:  -8s;  }
.flocon:nth-child(9)  { left: 68%; animation-duration: 15s; animation-delay:  -4s;  }
.flocon:nth-child(10) { left: 76%; animation-duration:  9s; animation-delay: -11s;  }
.flocon:nth-child(11) { left: 84%; animation-duration: 12s; animation-delay:  -7s;  }
.flocon:nth-child(12) { left: 92%; animation-duration: 11s; animation-delay: -13s;  }
.flocon:nth-child(13) { left: 16%; animation-duration: 16s; animation-delay: -10s;  }
.flocon:nth-child(14) { left: 72%; animation-duration: 13s; animation-delay: -14s;  }

@keyframes tomber {
  0%   { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg); }
  8%   { opacity: .85; }
  92%  { opacity: .85; }
  100% { opacity: 0; transform: translate3d(28px, 118vh, 0) rotate(420deg); }
}

/* Le mariage : des pétales. */
.ciel[data-fete='mariage'] .flocon {
  width: 13px;
  height: 13px;
  border-radius: 100% 0 100% 0;
  background: var(--primaire-claire);
}
.ciel[data-fete='mariage'] .flocon:nth-child(3n)   { background: var(--tertiaire-claire); }
.ciel[data-fete='mariage'] .flocon:nth-child(4n+1) { background: #FFF3EC; width: 10px; height: 10px; }

/* Le baptême : de petites étoiles douces et des perles. */
.ciel[data-fete='bapteme'] .flocon {
  width: 10px;
  height: 10px;
  background: var(--secondaire-claire);
  clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.ciel[data-fete='bapteme'] .flocon:nth-child(3n) {
  clip-path: none;
  border-radius: 50%;
  width: 7px;
  height: 7px;
  background: #FFF6E0;
}

/* L'anniversaire : confettis et chapeaux de fête. */
.ciel[data-fete='anniversaire'] .flocon {
  width: 8px;
  height: 13px;
  border-radius: 2px;
  background: var(--secondaire-claire);
}
.ciel[data-fete='anniversaire'] .flocon:nth-child(3n)   { background: var(--tertiaire-claire); }
.ciel[data-fete='anniversaire'] .flocon:nth-child(4n+1) { background: var(--primaire-claire); }
.ciel[data-fete='anniversaire'] .flocon:nth-child(5n) {
  width: 14px;
  height: 16px;
  border-radius: 0;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  background: #FFF3EC;
}

/* La pluie ne tombe que sur les fonds terracotta — le voile et le héros.
   Il faut l'éclaircir pour qu'elle s'y détache. */
.flocon { filter: brightness(1.3); }

/* ---------- Héros ---------- */

.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg, #A23E18 0%, #8A3410 100%);
  padding: 48px var(--marge) 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  text-align: center;
  color: #fff;
}

.hero > *:not(.ciel) { position: relative; z-index: 1; }

.hero-sur-titre {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,.72);
}

.hero-noms {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(28px, 8vw, 42px);
  font-weight: 600;
}

.carte {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--rayon);
}

.compteur {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.grille-compteur {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.unite {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 12px 12px 10px;
  border-radius: var(--rayon);
  background: rgba(255,255,255,.15);
  min-width: 64px;
}

.unite-nom {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgba(255,255,255,.72);
}

/* Chaque chiffre est une fenêtre d'une case de haut, devant sa colonne. */
.chiffres {
  --case: 1.16em;
  display: flex;
  gap: 1px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 30px;
  font-weight: 600;
  line-height: var(--case);
  font-variant-numeric: tabular-nums;
}

.chiffre {
  display: block;
  width: .58em;
  height: var(--case);
  overflow: hidden;
}

.rouleau {
  display: block;
  transform: translateY(calc(var(--n, 1) * var(--case) * -1));
  transition: transform 520ms cubic-bezier(.2,.85,.25,1);
}

.rouleau > span { display: block; height: var(--case); text-align: center; }

/* Le saut de rattrapage, du 9 de tête au 9 de queue, ne doit pas se voir. */
.chiffre.sans-glisse .rouleau { transition: none; }

.compteur-arrive {
  display: none;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 24px;
  font-weight: 600;
  padding: 14px 22px;
  border-radius: var(--rayon-plein);
  background: rgba(255,255,255,.15);
}

.grille-compteur[data-etat='arrive'] .unite { display: none; }
.grille-compteur[data-etat='arrive'] .compteur-arrive { display: block; }

.compteur-legende { font-size: 14px; color: rgba(255,255,255,.82); }

@media (max-width: 380px) {
  .chiffres { font-size: 25px; }
  .unite { min-width: 54px; padding: 10px 8px 8px; }
}

/* ---------- Sections ---------- */

.section {
  max-width: var(--lecture);
  margin: 0 auto;
  padding: 36px var(--marge) 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.titre-section-rangee {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.titre-section { font-size: 22px; }
.compte-section { font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--primaire); font-weight: 600; }

/* ---------- Le mot des hôtes ---------- */

.mot-carte {
  display: flex;
  gap: 14px;
  padding: 20px;
  border-radius: var(--rayon-lg);
  background: var(--surface-teintee);
}

.mot-pastille {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--secondaire);
  color: #fff;
  display: grid;
  place-items: center;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 17px;
  font-weight: 700;
}

.mot-titre { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.mot { font-size: 15px; line-height: 1.65; color: var(--encre-douce); }
.mot-signature { display: block; margin-top: 10px; font-size: 14px; font-weight: 600; color: var(--primaire); }

/* ---------- Programme ---------- */

.programme { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }

.ceremonie {
  display: flex;
  gap: 14px;
  padding: 18px;
  border-radius: var(--rayon-lg);
  background: var(--surface-carte);
  border: 1px solid var(--surface-variante);
  box-shadow: var(--ombre);
}

.ceremonie-pastille {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: var(--rayon);
  display: grid;
  place-items: center;
  background: var(--teinte-ceremonie, var(--primaire-claire));
  color: var(--sur-ceremonie, var(--primaire));
}

.ceremonie-corps { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }

.ceremonie-badge {
  align-self: flex-start;
  padding: 4px 10px;
  margin-bottom: 4px;
  border-radius: var(--rayon-plein);
  background: var(--teinte-ceremonie, var(--primaire-claire));
  color: var(--sur-ceremonie, var(--primaire));
  font-size: 11px;
  font-weight: 600;
}

.ceremonie-quand {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 17px;
  font-weight: 600;
}

.ceremonie-lieu { font-size: 15px; color: var(--encre-douce); }

.repere {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  margin-top: 4px;
  font-size: 13px;
  color: var(--primaire);
  font-weight: 500;
}

.note { margin-top: 8px; font-size: 14px; color: var(--encre-douce); }

.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }

.action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--rayon);
  border: 1px solid var(--surface-variante);
  background: var(--surface-basse);
  color: var(--encre);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: border-color var(--court), color var(--court);
}

.action:hover { border-color: var(--primaire); color: var(--primaire); }

.action-pleine { background: var(--primaire); border-color: var(--primaire); color: #fff; }
.action-pleine:hover { background: var(--primaire-vive); border-color: var(--primaire-vive); color: #fff; }

/* ---------- Tenue ---------- */

.tenue-carte {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border-radius: var(--rayon-lg);
  background: var(--surface-teintee);
}

.tenue-corps { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.tenue-sur-titre { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; font-weight: 600; color: var(--secondaire); }
.tenue-valeur { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; }
.tenue-texte { font-size: 14px; color: var(--encre-douce); }

.tenue-pastille {
  flex: none;
  width: 46px;
  height: 46px;
  border-radius: var(--rayon);
  background: var(--secondaire-claire);
  color: var(--secondaire);
  display: grid;
  place-items: center;
}

/* ---------- Réponse ---------- */

.rsvp-carte {
  padding: 22px;
  border-radius: var(--rayon-lg);
  background: var(--surface-carte);
  border: 1px solid var(--surface-variante);
  box-shadow: var(--ombre);
}

.rsvp { display: flex; flex-direction: column; gap: 18px; }

.rsvp-titre { font-size: 20px; margin-top: 2px; }
.rsvp-intro { font-size: 14px; color: var(--encre-douce); }

.champ { display: flex; flex-direction: column; gap: 6px; }
.etiquette { font-size: 13px; font-weight: 500; color: var(--encre-douce); }

.saisie, .zone, .liste {
  font: inherit;
  font-size: 15px;
  padding: 12px 14px;
  border: 1px solid var(--surface-variante);
  border-radius: var(--rayon);
  background: var(--surface-basse);
  color: var(--encre);
  width: 100%;
}

.saisie:focus-visible, .zone:focus-visible, .liste:focus-visible {
  border-color: var(--primaire);
  outline: none;
  background: var(--surface-carte);
}

.zone { min-height: 84px; resize: vertical; }

.aide { font-size: 12px; color: var(--encre-douce); }
.erreur { font-size: 13px; color: var(--erreur); }

.choix { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.radio {
  position: absolute; width: 1px; height: 1px; margin: -1px;
  padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}

.bouton-choix {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 10px;
  border: 1px solid var(--surface-variante);
  border-radius: var(--rayon);
  background: var(--surface-basse);
  font-weight: 600;
  font-size: 15px;
  text-align: center;
  cursor: pointer;
  transition: border-color var(--court), background var(--court), color var(--court);
}

.bouton-choix:hover { border-color: var(--primaire); }
.radio:focus-visible + .bouton-choix { outline: 2px solid var(--primaire); outline-offset: 2px; }
.radio:checked + .bouton-choix { background: var(--primaire); border-color: var(--primaire); color: #fff; }

.details { display: flex; flex-direction: column; gap: 18px; }
.rsvp:not(:has(.radio:checked)) .details { display: none; }
.rsvp:has(.radio-absent:checked) .si-present { display: none; }

.ceremonies { display: flex; flex-wrap: wrap; gap: 8px; border: none; margin: 0; padding: 0; }
.ceremonies legend { font-size: 13px; font-weight: 500; color: var(--encre-douce); padding: 0 0 8px; }

.coche {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border: 1px solid var(--surface-variante);
  border-radius: var(--rayon);
  background: var(--surface-basse);
  font-size: 14px;
  cursor: pointer;
}

.coche input { accent-color: var(--primaire); width: 16px; height: 16px; flex: none; }
.coche:has(input:checked) { border-color: var(--primaire); color: var(--primaire); }

.envoyer {
  appearance: none;
  padding: 15px 20px;
  border: none;
  border-radius: var(--rayon);
  background: var(--primaire);
  color: #fff;
  font: inherit;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
}

.envoyer:hover { background: var(--primaire-vive); }

.merci { display: flex; flex-direction: column; gap: 8px; align-items: center; text-align: center; padding: 12px 0; }
.merci-pastille { width: 48px; height: 48px; border-radius: 50%; background: var(--primaire-claire); color: var(--primaire); display: grid; place-items: center; }
.merci-titre { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; }

/* ---------- Modules ---------- */

.mots { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }

.mot-invite {
  padding: 16px 18px;
  border-radius: var(--rayon-lg);
  background: var(--surface-teintee);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mot-invite p { font-size: 15px; line-height: 1.6; }
.mot-invite-signature { font-size: 13px; color: var(--encre-douce); }

.grille-photos { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.grille-photos img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--rayon); }

@media (min-width: 560px) { .grille-photos { grid-template-columns: repeat(3, 1fr); } }

/* ---------- Bas de page ---------- */

.pied {
  max-width: var(--lecture);
  margin: 0 auto;
  padding: 36px var(--marge) 56px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.whatsapp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: var(--rayon);
  background: #25D366;
  color: #06331A;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
}

.partage {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: var(--rayon);
  border: 1px solid var(--surface-variante);
  background: var(--surface-carte);
  color: var(--encre);
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
}

.signature { font-size: 13px; color: var(--encre-douce); text-align: center; padding-top: 8px; }
.signature a { color: var(--primaire); font-weight: 600; text-decoration: none; }

/* ---------- L'entrée en scène ---------- */

/* Le héros se pose élément par élément, une fois seulement, à l'arrivée.
   Chaque bloc part d'un état visible en fin d'animation : rien n'attend un
   observateur pour devenir lisible. */
.hero-sur-titre { animation: monter 700ms cubic-bezier(.22,1,.36,1) 60ms both; }
.hero-noms      { animation: monter 700ms cubic-bezier(.22,1,.36,1) 180ms both; }
.carte-cadre    { animation: carte-entree 1100ms cubic-bezier(.22,1,.36,1) 300ms both; }
.compteur       { animation: monter 700ms cubic-bezier(.22,1,.36,1) 620ms both; }

@keyframes monter {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}

/* La carte arrive comme un objet qu'on tend : elle se redresse. */
@keyframes carte-entree {
  from { opacity: 0; transform: translateY(30px) rotateX(14deg) scale(.94); }
  to   { opacity: 1; transform: none; }
}

/* Un éclat traverse la carte, une fois, comme la lumière sur du papier glacé. */
.carte-cadre {
  position: relative;
  display: block;
  width: min(100%, 340px);
  border-radius: var(--rayon);
  overflow: hidden;
  box-shadow: 0 20px 50px -18px rgba(0,0,0,.55);
}

.carte-cadre::after {
  content: '';
  position: absolute;
  top: -60%;
  bottom: -60%;
  width: 45%;
  left: -60%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.42), transparent);
  transform: skewX(-18deg);
  animation: eclat 1400ms ease-out 1250ms 1 both;
}

@keyframes eclat {
  from { left: -60%; }
  to   { left: 130%; }
}

/* Les sections se redressent au défilement, sans une ligne de JavaScript.
   Le mouvement ne touche jamais l'opacité : une invitation dont le programme
   attendrait un défilement pour devenir lisible serait une invitation ratée.
   Au repos, tout est là — le mouvement n'est qu'une récompense. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .section, .pied {
      animation: paraitre linear both;
      animation-timeline: view();
      animation-range: entry 5% cover 20%;
    }
  }
}

@keyframes paraitre {
  from { transform: translateY(22px); }
  to   { transform: none; }
}

/* ---------- Les gestes ---------- */

.ceremonie {
  transition: transform 220ms cubic-bezier(.22,1,.36,1), box-shadow 220ms ease;
}

.ceremonie:hover {
  transform: translateY(-3px);
  box-shadow: 0 2px 6px rgba(28,28,24,.06), 0 18px 40px -16px rgba(28,28,24,.24);
}

.ceremonie-pastille { transition: transform 260ms cubic-bezier(.34,1.56,.64,1); }
.ceremonie:hover .ceremonie-pastille { transform: rotate(-8deg) scale(1.08); }

.action, .whatsapp, .partage {
  transition: transform var(--court), border-color var(--court), background var(--court);
}

.action:hover, .whatsapp:hover, .partage:hover { transform: translateY(-2px); }

.mot-carte { transition: transform 300ms cubic-bezier(.22,1,.36,1); }
.mot-carte:hover { transform: translateY(-2px); }

/* ---------- Quand le mouvement dérange ---------- */

/* Réglage système « moins d'animations » : l'ouverture reste, réduite à une
   fondu — le geste garde son sens — et tout le reste se tient tranquille. */
@media (prefers-reduced-motion: reduce) {
  .voile { transition: opacity 160ms linear; }
  .pli-enveloppe,
  .pli-scene,
  .hero-sur-titre,
  .hero-noms,
  .carte-cadre,
  .compteur,
  .carte-cadre::after,
  .voile[data-etat='ouverture'] .pli-carte,
  .voile[data-etat='ouverture'] .pli-rabat,
  .voile[data-etat='ouverture'] .pli-sceau {
    animation: none;
  }

  .ciel { display: none; }
  .rouleau { transition: none; }

  .ceremonie, .ceremonie-pastille, .action, .whatsapp, .partage, .mot-carte {
    transition: none;
  }

  .ceremonie:hover, .action:hover, .whatsapp:hover, .partage:hover, .mot-carte:hover {
    transform: none;
  }
}
`
