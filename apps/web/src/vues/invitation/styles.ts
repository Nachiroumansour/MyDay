/**
 * Feuille de style de la page invitation, en ligne dans le document.
 *
 * Elle vit dans un fichier TypeScript et non dans un `.css` parce que cette
 * page n'est pas rendue par le routeur de Next : elle est produite en HTML
 * statique. L'inliner supprime une requête réseau, ce qui compte plus que le
 * confort d'édition sur une page servie en 3G.
 */
export const STYLES = `
@font-face {
  font-family: 'Bricolage Grotesque';
  src: url('/polices/bricolage-grotesque.woff2') format('woff2');
  font-weight: 200 800;
  font-display: swap;
}

:root {
  --fond: #F7F8FA;
  --surface: #FFFFFF;
  --trait: #E3E6EC;
  --encre: #14161D;
  --encre-douce: #5A6070;
  --marge: 20px;
  --lecture: 560px;
  --court: 120ms;
}

* { box-sizing: border-box; }

html, body { margin: 0; padding: 0; background: var(--fond); color: var(--encre); }

body {
  font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.625;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 { margin: 0; font-weight: 600; letter-spacing: -0.02em; text-wrap: balance; }
p { margin: 0; }

:focus-visible { outline: 2px solid var(--evenement); outline-offset: 3px; }

/* ---------- L'ouverture ---------- */

.voile {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: #101218;
  color: #f2f3f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 32px 20px;
  transition: opacity 420ms ease, visibility 420ms;
}

html[data-enveloppe='vue'] .voile { display: none; }

.voile[data-etat='partie'] { opacity: 0; visibility: hidden; pointer-events: none; }

.voile-intro { font-size: 14px; letter-spacing: 0.06em; color: #8f96a5; text-align: center; }

.voile-noms {
  font-size: clamp(26px, 8vw, 38px);
  font-weight: 600;
  letter-spacing: -0.03em;
  text-align: center;
  text-wrap: balance;
}

.pli { appearance: none; border: none; background: none; padding: 0; cursor: pointer; display: block; width: min(74vw, 300px); }
.pli svg { display: block; width: 100%; height: auto; overflow: visible; }

.rabat { transform-box: fill-box; transform-origin: 50% 0%; transition: transform 620ms cubic-bezier(0.66, 0, 0.34, 1); }
.cachet { transform-box: fill-box; transform-origin: 50% 50%; transition: transform 320ms ease, opacity 320ms ease; }
.carte-pliee { opacity: 0; transition: transform 640ms cubic-bezier(0.22, 1, 0.36, 1) 180ms, opacity 260ms ease 180ms; }

.voile[data-etat='ouverture'] .rabat { transform: rotateX(180deg); }
.voile[data-etat='ouverture'] .cachet { transform: scale(0.2); opacity: 0; }
.voile[data-etat='ouverture'] .carte-pliee { opacity: 1; transform: translateY(-46px) scale(1.04); }

.voile-invite { font-size: 14px; color: #8f96a5; }

.passer {
  position: absolute; top: 16px; right: 16px;
  appearance: none; background: none; border: none;
  color: #8f96a5; font: inherit; font-size: 14px; cursor: pointer; padding: 8px 10px;
}
.passer:hover { color: #f2f3f6; }

/* ---------- Le héros ---------- */

.hero { display: flex; flex-direction: column; align-items: center; gap: 28px; padding: 40px var(--marge) 56px; }

.carte { display: block; width: min(100%, 420px); height: auto; border: 1px solid var(--trait); }

.compteur { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
.compteur-valeur {
  font-size: clamp(34px, 11vw, 46px); font-weight: 600; letter-spacing: -0.03em;
  line-height: 1; color: var(--evenement); font-variant-numeric: tabular-nums;
}
.compteur-legende { font-size: 15px; color: var(--encre-douce); }

/* ---------- Sections ---------- */

.section {
  max-width: var(--lecture); margin: 0 auto;
  padding: 40px var(--marge);
  border-top: 1px solid var(--trait);
  display: flex; flex-direction: column; gap: 24px;
}

.titre-section { font-size: 22px; }

/* ---------- Programme ---------- */

.programme { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 36px; }

.ceremonie { position: relative; padding-left: 26px; }
.ceremonie::before {
  content: ''; position: absolute; left: 4px; top: 9px;
  width: 9px; height: 9px; border-radius: 50%; background: var(--evenement);
}
.ceremonie:not(:last-child)::after {
  content: ''; position: absolute; left: 8px; top: 24px; bottom: -36px;
  width: 1px; background: var(--trait);
}

.quand { font-size: 14px; color: var(--encre-douce); display: flex; flex-wrap: wrap; gap: 0 8px; }
.quand b { color: var(--encre); font-weight: 500; }

.nom-ceremonie { font-size: 20px; margin: 4px 0 10px; }
.lieu { font-weight: 500; }
.adresse { font-size: 15px; color: var(--encre-douce); }

.repere { margin-top: 12px; padding-left: 12px; border-left: 2px solid var(--evenement); font-size: 15px; }
.repere-etiquette { display: block; font-size: 13px; color: var(--encre-douce); }

.note { margin-top: 12px; font-size: 15px; color: var(--encre-douce); }

.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.action {
  display: inline-block; padding: 8px 14px;
  border: 1px solid var(--trait); color: var(--encre);
  text-decoration: none; font-size: 14px; font-weight: 500;
  transition: border-color var(--court), color var(--court);
}
.action:hover, .action:focus-visible { border-color: var(--evenement); color: var(--evenement); }

/* ---------- Tenue, mot, contact ---------- */

.pastille-tenue {
  display: inline-block; align-self: flex-start;
  padding: 6px 12px; border: 1px solid var(--evenement);
  color: var(--evenement); font-size: 14px; font-weight: 500;
}

.mot { font-size: 17px; line-height: 1.7; }
.contact { font-size: 15px; color: var(--encre-douce); }

/* ---------- Réponse ---------- */

.rsvp { display: flex; flex-direction: column; gap: 22px; }

.choix { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.radio {
  position: absolute; width: 1px; height: 1px; margin: -1px;
  padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}

.bouton-choix {
  display: block; padding: 18px 12px;
  border: 1px solid var(--trait); background: var(--surface); color: var(--encre);
  font-weight: 600; font-size: 16px; text-align: center; cursor: pointer;
  transition: border-color var(--court), background var(--court), color var(--court);
}
.bouton-choix:hover { border-color: var(--evenement); }
.radio:focus-visible + .bouton-choix { outline: 2px solid var(--evenement); outline-offset: 3px; }
.radio:checked + .bouton-choix { background: var(--evenement); border-color: var(--evenement); color: #fff; }

.details { display: flex; flex-direction: column; gap: 20px; }
.rsvp:not(:has(.radio:checked)) .details { display: none; }
.rsvp:has(.radio-absent:checked) .si-present { display: none; }

.champ { display: flex; flex-direction: column; gap: 6px; }
.etiquette { font-size: 14px; font-weight: 500; }

.saisie, .zone {
  font: inherit; padding: 12px 14px;
  border: 1px solid var(--trait); background: var(--surface); color: var(--encre); width: 100%;
}
.saisie:focus-visible, .zone:focus-visible { border-color: var(--evenement); outline: none; }
.zone { min-height: 88px; resize: vertical; }

.aide { font-size: 13px; color: var(--encre-douce); }
.erreur { font-size: 13px; color: #b3261e; }

.ceremonies { display: flex; flex-direction: column; gap: 10px; border: none; margin: 0; padding: 0; }
.ceremonies legend { font-size: 14px; font-weight: 500; padding: 0 0 10px; }

.coche { display: flex; align-items: baseline; gap: 10px; font-size: 15px; cursor: pointer; }
.coche input { accent-color: var(--evenement); width: 18px; height: 18px; flex: none; }
.coche small { display: block; font-size: 13px; color: var(--encre-douce); }

.envoyer {
  appearance: none; padding: 15px 20px; border: none;
  background: var(--evenement); color: #fff;
  font: inherit; font-weight: 600; font-size: 16px; cursor: pointer;
}

.merci { padding-left: 14px; border-left: 2px solid var(--evenement); display: flex; flex-direction: column; gap: 6px; }
.merci-titre { font-size: 18px; font-weight: 600; }

/* ---------- Pied ---------- */

.pied {
  max-width: var(--lecture); margin: 0 auto;
  padding: 40px var(--marge) 72px;
  border-top: 1px solid var(--trait);
  display: flex; flex-direction: column; gap: 18px; align-items: flex-start;
}

.partage {
  display: inline-block; padding: 12px 20px;
  background: var(--evenement); color: #fff;
  text-decoration: none; font-weight: 600; font-size: 15px;
}

.signature { font-size: 13px; color: var(--encre-douce); }
.signature a { color: var(--encre); text-decoration: none; border-bottom: 1px solid var(--trait); }

@media (min-width: 720px) { .hero { padding-top: 64px; } }

@media (prefers-reduced-motion: reduce) {
  .rabat, .cachet, .carte-pliee { transition: none; }
  .voile { transition: opacity 160ms linear; }
}
`
