# Contexte du projet — à coller au début d'une conversation avec une IA

Je travaille sur le site web d'OZEP (BTP / ingénierie minière / hydraulique), fait en HTML, CSS et JavaScript pur (pas de framework). Le dépôt GitHub est :
https://github.com/Zadus-Next-Helium-Service/siteOzepCode
Le bon dossier actif est : `site on avance ici au fur et a mesure/ozep corige par claud  tous fait/ozep-accueil` (il existe un ancien dossier `ozep-accueil 3` à ignorer, je le supprimerai plus tard).

Le site a 5 pages : `index.html`, `apropos.html`, `contact.html`, `realisations.html`, `services.html`, avec `css/style.css` (base + tous les media queries), plusieurs autres fichiers CSS par page (`pages-extra.css`, `apropos-extra.css`, `contact-futuristic.css`, `corridor-ozep.css`, `services-accordion.css`, `services-animation.css`), et `js/script.js`.

## Objectif général
Rendre le site responsive **page par page**, **section par section**. Le PC est déjà correct et ne doit PAS être modifié — tout le travail en cours ne concerne QUE l'affichage téléphone (le breakpoint utilisé est `@media (max-width: 600px)`), pas la tablette.

## Ce qu'on a fait jusqu'ici (page d'accueil — hero)

Le hero d'origine (desktop) utilise un effet "carrousel 3D" avec `position: fixed` sur `.hero` et `.page-content { margin-top: 100vh }`, ce qui crée l'illusion que le hero reste fixe en arrière-plan pendant que le reste de la page défile par-dessus (comme une superposition).

On s'est inspiré du rendu mobile du site https://www.snydercg.com/ (entrepreneur en construction) pour le mobile. Sur leur site mobile, contrairement au PC de mon site : le header reste fixe et compact, mais le **hero n'est pas fixe** — c'est un bloc normal de hauteur modérée qui défile avec le reste de la page, avec une seule image à la fois en fondu (pas de carrousel 3D), texte en gras ancré en bas, boutons discrets en style "lien" (texte + »).

On a donc ajouté un bloc `@media (max-width: 600px)` dans `css/style.css` qui, uniquement sur téléphone :
- Désactive le `position: fixed` du `.hero` (repasse en `position: relative`, hauteur `46vh` modérée, `margin-top: 100px` pour l'espace sous l'entête).
- Annule `.page-content { margin-top: 100vh }` (repasse à 0) et passe `.page-content` en largeur 100% (`width:100%; padding:0; background:none`) — le fond dégradé sombre d'origine (prévu pour l'ancien effet de hero fixe) créait un voile noir sur les côtés en descendant dans la page, donc on l'a neutralisé ; le padding interne pour la lisibilité est géré via `.page-content .wrap { padding: 0 20px }`. Le `body` a un fond blanc (`background:#fff`) pour que l'espace sous l'entête (avant le hero) soit blanc et non noir.
- Remplace les `<video>` du hero par des `<img class="slide-image">` (ajoutées en HTML à côté de chaque `<video>`, vidéos cachées en CSS sur mobile via `display:none` + `preload="none"`), avec un effet de mouvement type "plan de caméra" (zoom + léger déplacement, 3 variantes différentes selon le slide via `nth-child`, en boucle continue tant que le slide reste actif — PAS un simple zoom répétitif).
- Neutralise le `transform` 3D du carrousel (`.slide { transform: none !important; width/height: 100% !important }`) pour un simple fondu (crossfade) : `.slide { opacity:0 }`, `.slide.active { opacity:1 }`. ATTENTION : la règle desktop `.hero.is-expanded .slide.active { width:100vw; height:100vh }` est plus spécifique que `.slide{width:100%}` seul — sans le `!important` sur width/height, la slide active "saute" à la taille de l'écran entier au lieu de rester à la taille du hero (bug déjà rencontré et corrigé, à ne pas réintroduire).
- Désactive aussi l'animation de fond desktop `.hero.is-expanded .slide.active .slide-bg { animation: hero-film-move-orbital ... }` sur mobile (`animation: none !important`) : elle se combinait avec le Ken Burns de `.slide-image` et créait un zoom disgracieux ("saut").
- Le texte du hero (`.slide-content`) glisse depuis la gauche en même temps que l'image apparaît (`translateX`). On masque le petit texte `<p>` sous le titre, on garde seulement le `<h1>`.
- Les boutons `.hero-actions .btn` perdent fond/bordure/ombre et deviennent des liens texte orange avec un « » » ajouté en `::after`.
- L'entête (`header`) : **l'utilisateur a personnalisé lui-même les couleurs** dans le bloc mobile — respecter impérativement ces valeurs et ne pas les écraser sans qu'il le demande explicitement :
  ```css
  header { background: rgba(30, 29, 29, 0.752); backdrop-filter: blur(8px) brightness(1.6) saturate(0.7); border-bottom: 1px solid rgba(20, 20, 20, 0.03); }
  header.is-scrolling { background: rgba(51, 20, 1, 0.753); backdrop-filter: blur(10px) brightness(1.15); border-bottom: 1px solid rgba(248, 125, 2, 0.35); }
  ```
  Le hamburger (`.burger span`) est en couleur foncée (`var(--black)`) pour rester visible.
- Le carré orange décoratif à côté du logo (`.logo-chip`) a été ajouté PUIS retiré à la demande de l'utilisateur — ne pas le remettre. Le HTML des 5 pages n'a plus ce `<span>`.
- `.page-content` : largeur 100%, padding 0, fond neutralisé (voir plus haut). Padding interne via `.page-content .wrap { padding: 0 20px }`.

## Section "Qui sommes-nous" (juste après le hero)

- Les 3 statistiques (`.intro-stats`) restent sur **une seule ligne** sur mobile (`flex-wrap: nowrap !important`), avec polices/icônes réduites. Le bloc du milieu ("Bâtir sur nos valeurs africaines") a des styles écrits en dur en HTML (inline) : il faut donc utiliser `!important` avec des sélecteurs `:nth-child(2)` pour le redimensionner, un simple CSS externe non-important ne suffit pas (l'inline gagne toujours sinon).
- Les icônes des 3 statistiques (`.stat-icon` + l'icône du bloc du milieu) ont une animation `stat-icon-bob` qui les fait monter/descendre en boucle, chacune légèrement décalée dans le temps (`animation-delay` différent). **Ce bloc a déjà disparu une fois par accident lors d'un copier-coller côté utilisateur — vérifier qu'il est toujours présent si le mouvement des icônes semble cassé.**
- Le titre `.intro-text .section-title` ("Implanté au Burkina Faso...") est rendu visible **dès l'arrivée sur la page** (on annule l'état caché de `.stagger-reveal` via `.intro-text.stagger-reveal > * { opacity:1; transform:translateY(0) }`, plus spécifique donc prioritaire), et a une animation continue : reflet lumineux qui balaie le texte (`background-clip:text` + `background-position` animée) + léger flottement vertical (`intro-text-float`), pour que le texte semble "vivant" en permanence, pas seulement au moment où il apparaît.
- Les 2 photos "terrain" / "bureau" (`.intro-image-container`) changent au scroll via JS (`js/script.js`, fonction `checkImageChange`). **Bug corrigé** : le calcul se basait sur toute la section `.intro` (très haute sur mobile) au lieu de la photo elle-même, ce qui déclenchait le changement bien avant que la photo soit au milieu de l'écran — corrigé en ciblant `.intro-image-container` directement.
- Transition entre les 2 photos (mobile uniquement) : **glissement latéral façon carrousel "push"**, pas un fondu. La photo qui arrive vient de la gauche (`translateX(-100%)` → `translateX(0)`) pendant que celle qui s'en va part vers la droite (`translateX(0)` → `translateX(100%)`), en jouant sur la classe `.active`/`.inactive` déjà gérée par le JS. La toute première photo affichée au chargement de la page ne joue pas cette animation, elle est juste présente normalement. Note : on a dû abandonner l'effet "Ken Burns" continu sur ces 2 photos car il utilisait aussi `transform`, ce qui entrait en conflit avec le glissement (une seule anime `transform` à la fois proprement) — si on veut réintroduire un mouvement continu ici, il faudra l'appliquer sur un élément wrapper séparé plutôt que sur l'image elle-même, pour ne pas rentrer en conflit avec le glissement.

Important : le JS (`js/script.js`) gère déjà le carrousel du hero (classes `.active`, `.is-expanded`, `.is-carousel`) et le changement des 2 photos "Qui sommes-nous" (classes `.active`/`.inactive`) de façon automatique. On a fait un seul changement JS jusqu'ici (le calcul du point de bascule des 2 photos, décrit ci-dessus). Tout le reste des effets visuels mobile passe uniquement par le CSS du bloc `@media (max-width: 600px)`, en surchargeant/neutralisant certaines propriétés avec `!important` quand nécessaire pour ignorer les calculs de positionnement 3D du PC (variables CSS `--slide-x`, `--slide-z`, `--slide-rotate`, `--slide-scale`, `--slide-opacity` posées en inline par le JS).

## Comment je veux qu'on travaille (règles à respecter)

1. Toute modification doit être scopée au mobile uniquement, sauf si je dis explicitement le contraire (utiliser `@media (max-width: 600px)` pour téléphone, ne pas toucher aux styles PC/tablette existants).
2. Je ne connais pas le HTML/CSS — sois pédagogue, explique simplement.
3. Donne-moi les modifications précises à faire (fichier concerné, code avant/après), MAIS envoie aussi le(s) fichier(s) complet(s) et corrigés en téléchargement à la fin, prêts à remplacer directement chez moi. On a eu plusieurs fois des bugs venant de copier-coller incomplets (un `}` ou un bloc entier perdu) — le fichier complet en téléchargement évite ce risque et est la méthode la plus fiable.
4. Vérifie toujours que le nombre d'accolades `{` et `}` du CSS est équilibré avant de livrer un fichier, pour détecter une éventuelle erreur de collage.
5. Si quelque chose n'est pas clair dans ma demande, pose-moi une question avant de coder.
6. Ne modifie jamais les couleurs de l'entête (`header` / `header.is-scrolling` dans le bloc mobile) sans que je le demande explicitement — je les ajuste moi-même selon mon goût.

## Prochaine étape

La page d'accueil (`index.html`) est bien avancée en mobile : hero + section "Qui sommes-nous" sont traités (voir détails ci-dessus). Il reste à adapter le reste d'`index.html` (Nos domaines d'activité/services, Pourquoi nous choisir, Réalisations à la une, CTA final, footer — actuellement encore en style desktop pur sur mobile), puis passer aux 4 autres pages (`apropos.html`, `contact.html`, `realisations.html`, `services.html`), section par section, en gardant la même logique : cohérence avec le style mobile déjà en place, animations variées et vivantes (pas de simple fondu/zoom répétitif), tout en respectant les couleurs d'entête personnalisées.
