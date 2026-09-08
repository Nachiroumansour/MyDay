  <defs>
    <!-- L'or : trois passages clair/sombre, comme une dorure qui accroche la lumière. -->
    <linearGradient id="or" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9A742A"/>
      <stop offset=".22" stop-color="#E7CD87"/>
      <stop offset=".45" stop-color="#B08C2E"/>
      <stop offset=".68" stop-color="#F0DFAA"/>
      <stop offset="1" stop-color="#A87F27"/>
    </linearGradient>
    <linearGradient id="or-vertical" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E9D08A"/>
      <stop offset=".5" stop-color="#B08C2E"/>
      <stop offset="1" stop-color="#EBD495"/>
    </linearGradient>
    <linearGradient id="ruban" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F6E9C4"/>
      <stop offset=".5" stop-color="#D8BC72"/>
      <stop offset="1" stop-color="#F3E4BC"/>
    </linearGradient>

    <!-- Les pétales : blanc crème, ombrés vers l'extérieur. -->
    <radialGradient id="petale" cx=".38" cy=".28" r=".85">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset=".55" stop-color="#FBF6EA"/>
      <stop offset="1" stop-color="#E6DCC6"/>
    </radialGradient>
    <radialGradient id="coeur-fleur" cx=".4" cy=".4" r=".7">
      <stop offset="0" stop-color="#FBF3DE"/>
      <stop offset="1" stop-color="#DCCDA6"/>
    </radialGradient>

    <!-- Le papier : ivoire, à peine plus chaud sur les bords. -->
    <radialGradient id="papier" cx=".5" cy=".42" r=".78">
      <stop offset="0" stop-color="#FEFCF6"/>
      <stop offset=".72" stop-color="#F9F3E4"/>
      <stop offset="1" stop-color="#F0E7D2"/>
    </radialGradient>

    <path id="petale-forme"
          d="M0 0 C -13 -5 -21 -19 -14 -29 C -8 -36 8 -36 14 -29 C 21 -19 13 -5 0 0 Z"/>

    <!-- Une rose vue de dessus : trois couronnes de pétales et un cœur. -->
    <g id="rose" fill="url(#petale)" stroke="#D9CEB4" stroke-width=".7">
      <use href="#petale-forme"/>
      <use href="#petale-forme" transform="rotate(72)"/>
      <use href="#petale-forme" transform="rotate(144)"/>
      <use href="#petale-forme" transform="rotate(216)"/>
      <use href="#petale-forme" transform="rotate(288)"/>
      <use href="#petale-forme" transform="rotate(36) scale(.66)"/>
      <use href="#petale-forme" transform="rotate(108) scale(.66)"/>
      <use href="#petale-forme" transform="rotate(180) scale(.66)"/>
      <use href="#petale-forme" transform="rotate(252) scale(.66)"/>
      <use href="#petale-forme" transform="rotate(324) scale(.66)"/>
      <use href="#petale-forme" transform="rotate(20) scale(.34)"/>
      <use href="#petale-forme" transform="rotate(140) scale(.34)"/>
      <use href="#petale-forme" transform="rotate(260) scale(.34)"/>
      <circle r="3.4" fill="url(#coeur-fleur)" stroke="none"/>
    </g>

    <!-- Un bouton, pour remplir les creux du bouquet. -->
    <g id="bouton" stroke="#D9CEB4" stroke-width=".6">
      <ellipse rx="7" ry="9" fill="url(#petale)"/>
      <path d="M-7 2 C -4 -6 4 -6 7 2" fill="none"/>
      <path d="M0 9 L0 18" stroke="#3C6B42" stroke-width="1.4" fill="none"/>
    </g>

    <path id="feuille-forme" d="M0 0 C 11 -11 29 -13 42 -3 C 29 8 11 10 0 0 Z"/>
    <path id="feuille-longue" d="M0 0 C 14 -9 40 -12 62 -4 C 40 6 14 9 0 0 Z"/>
    <path id="feuille-fine" d="M0 0 C 12 -5 32 -7 48 -2 C 32 3 12 5 0 0 Z"/>

    <g id="feuille">
      <use href="#feuille-forme"/>
      <path d="M1 -1 C 14 -4 28 -4 40 -3" fill="none" stroke="#FFFFFF" stroke-opacity=".28" stroke-width="1"/>
    </g>

    <!-- Un brin doré : tige souple et petites feuilles pointues. -->
    <g id="brin-or" fill="url(#or)">
      <path d="M0 0 C 22 -8 48 -14 72 -10" fill="none" stroke="url(#or)" stroke-width="1.6"/>
      <ellipse cx="16" cy="-13" rx="10" ry="4.2" transform="rotate(-28 16 -13)"/>
      <ellipse cx="34" cy="-18" rx="11" ry="4.4" transform="rotate(-20 34 -18)"/>
      <ellipse cx="54" cy="-20" rx="9" ry="3.8" transform="rotate(-10 54 -20)"/>
      <ellipse cx="26" cy="-2" rx="8" ry="3.4" transform="rotate(14 26 -2)"/>
      <ellipse cx="46" cy="-4" rx="7" ry="3" transform="rotate(8 46 -4)"/>
    </g>

    <!-- Les alliances, emblème du mariage. -->
    <g id="alliances" fill="none" stroke="url(#or)" stroke-width="3.4">
      <circle cx="-13" cy="0" r="15"/>
      <circle cx="13" cy="0" r="15"/>
      <path d="M-19 -9 A 15 15 0 0 1 -7 -14" stroke="#F6E7BC" stroke-width="1.6"/>
      <path d="M7 -14 A 15 15 0 0 1 19 -9" stroke="#F6E7BC" stroke-width="1.6"/>
    </g>

    <!-- Un fleuron de séparation, symétrique de part et d'autre du centre.
         Les filets portent un or plein : un dégradé en coordonnées d'objet
         dégénère sur un trait horizontal, dont la boîte est de hauteur nulle. -->
    <g id="fleuron" fill="none" stroke="#B08C2E" stroke-width="1.6">
      <path d="M-78 0 L-24 0"/>
      <path d="M78 0 L24 0"/>
      <path d="M-24 0 C -18 -10 -6 -12 0 -6 C 6 -12 18 -10 24 0 C 18 10 6 12 0 6 C -6 12 -18 10 -24 0 Z"/>
      <circle cx="0" cy="0" r="2.6" fill="#C7A55A" stroke="none"/>
      <path d="M-78 0 C -84 -5 -90 -4 -92 0 C -90 4 -84 5 -78 0 Z" fill="#B08C2E" stroke="none"/>
      <path d="M78 0 C 84 -5 90 -4 92 0 C 90 4 84 5 78 0 Z" fill="#B08C2E" stroke="none"/>
    </g>

    <!-- Le même filet, mais ouvert au centre pour accueillir un emblème. -->
    <g id="filet-ouvert" fill="none" stroke="#B08C2E" stroke-width="1.4">
      <path d="M-96 0 L-30 0"/>
      <path d="M96 0 L30 0"/>
      <path d="M-96 0 C -102 -5 -108 -4 -110 0 C -108 4 -102 5 -96 0 Z" fill="#B08C2E" stroke="none"/>
      <path d="M96 0 C 102 -5 108 -4 110 0 C 108 4 102 5 96 0 Z" fill="#B08C2E" stroke="none"/>
    </g>

    <path id="coeur" d="M0 5.6 C -4.6 2.2 -8 -0.8 -8 -4 C -8 -6.6 -6 -8.4 -3.6 -8.4 C -2 -8.4 -0.7 -7.5 0 -6.3 C 0.7 -7.5 2 -8.4 3.6 -8.4 C 6 -8.4 8 -6.6 8 -4 C 8 -0.8 4.6 2.2 0 5.6 Z"/>

    <g id="calendrier" fill="none" stroke="#B08C2E" stroke-width="1.6">
      <rect x="-9" y="-8" width="18" height="17" rx="2.2"/>
      <path d="M-9 -3 L9 -3"/>
      <path d="M-4.5 -8 L-4.5 -11.5 M4.5 -8 L4.5 -11.5"/>
      <circle cx="-3" cy="2" r="1.3" fill="#B08C2E" stroke="none"/>
      <circle cx="3" cy="2" r="1.3" fill="#B08C2E" stroke="none"/>
    </g>

    <g id="epingle" fill="none" stroke="#B08C2E" stroke-width="1.6">
      <path d="M0 10 C 0 10 8 0.5 8 -3.6 A 8 8 0 1 0 -8 -3.6 C -8 0.5 0 10 0 10 Z"/>
      <circle cx="0" cy="-3.6" r="3" fill="#B08C2E" stroke="none"/>
    </g>

    <!-- Le ruban qui descend le long du bord, comme sur les faire-part imprimés. -->
    <path id="ruban-bord"
          d="M0 0 C 20 56 -12 112 4 168 C 20 224 -10 280 2 336
             C 8 334 13 330 18 324 C 6 276 36 222 20 166 C 4 112 32 60 16 4 Z"/>

    <!-- La colombe du baptême. Contour doré : sur un papier ivoire, un
         contour gris disparaît et l'oiseau n'est plus qu'une tache. -->
    <g id="colombe" stroke="#B08C2E" stroke-width="1.4" stroke-linejoin="round">
      <path d="M-34 -6 L-27 -9 C -26 -16 -18 -21 -10 -18 C 2 -14 12 -8 22 -4
               C 28 -2 33 -3 38 -8 C 37 2 32 8 24 11 C 12 14 -2 10 -12 4
               C -20 0 -28 -1 -34 -6 Z" fill="#FDFBF4"/>
      <path d="M38 -8 C 44 -10 50 -8 54 -4 C 48 -2 42 -1 37 -2 Z" fill="#F6EFDC"/>
      <path d="M36 4 C 43 4 49 7 52 11 C 45 12 39 11 34 9 Z" fill="#F6EFDC"/>
      <path d="M-6 -12 C 3 -27 20 -32 31 -27 C 25 -14 12 -6 -6 -12 Z" fill="#FFFFFF"/>
      <path d="M-34 -6 L-43 -4 L-33 -1 Z" fill="#C7A55A" stroke="none"/>
      <circle cx="-21" cy="-11" r="1.5" fill="#7A5E22" stroke="none"/>
    </g>

    <!-- La couronne de laurier, où l'on inscrit l'âge. -->
    <g id="laurier" fill="#B08C2E">
      <path d="M0 44 C -22 40 -38 24 -40 2 C -42 -20 -30 -38 -12 -46"
            fill="none" stroke="#B08C2E" stroke-width="1.6"/>
      <path d="M0 44 C 22 40 38 24 40 2 C 42 -20 30 -38 12 -46"
            fill="none" stroke="#B08C2E" stroke-width="1.6"/>
      <g id="laurier-feuilles">
        <ellipse cx="-38" cy="14" rx="8" ry="3.4" transform="rotate(-64 -38 14)"/>
        <ellipse cx="-40" cy="-4" rx="8" ry="3.4" transform="rotate(-80 -40 -4)"/>
        <ellipse cx="-34" cy="-22" rx="8" ry="3.4" transform="rotate(-104 -34 -22)"/>
        <ellipse cx="-22" cy="-38" rx="7" ry="3" transform="rotate(-124 -22 -38)"/>
        <ellipse cx="-30" cy="30" rx="7" ry="3" transform="rotate(-44 -30 30)"/>
      </g>
      <use href="#laurier-feuilles" transform="scale(-1 1)"/>
    </g>

    <!-- Deux coupes qui trinquent, pour l'anniversaire. Chacune pivote sur
         son pied, pour que les buvants se rejoignent en haut. -->
    <g id="coupe" fill="none" stroke="#B08C2E" stroke-width="1.8" stroke-linejoin="round">
      <path d="M-9 -22 L9 -22 L4.5 -7 C 2.5 -4 -2.5 -4 -4.5 -7 Z"/>
      <path d="M0 -4 L0 9"/>
      <path d="M-7 10 L7 10"/>
    </g>
    <g id="coupes">
      <use href="#coupe" transform="translate(-13 0) rotate(16)"/>
      <use href="#coupe" transform="translate(13 0) rotate(-16)"/>
      <circle cx="0" cy="-27" r="1.7" fill="#C7A55A"/>
      <circle cx="-8" cy="-33" r="1.2" fill="#C7A55A"/>
      <circle cx="9" cy="-31" r="1.1" fill="#C7A55A"/>
    </g>

    <!-- L'écoinçon : le cadre d'angle, en équerres emboîtées. -->
    <g id="equerre" fill="none" stroke="#B08C2E">
      <path d="M0 46 L0 0 L46 0" stroke-width="2.4"/>
      <path d="M9 46 L9 9 L46 9" stroke-width="1"/>
      <path d="M0 22 L22 22 L22 0" stroke-width="1"/>
      <circle cx="22" cy="22" r="3.2" fill="#C7A55A" stroke="none"/>
    </g>
