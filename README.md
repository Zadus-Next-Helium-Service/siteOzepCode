# OZEP — Site vitrine

Site vitrine officiel d'**OZEP Group**, entreprise basée à Ouagadougou (Burkina Faso) spécialisée dans le génie civil, les mines, l'hydraulique et la géotechnique.

🔗 Dépôt GitHub : [Zadus-Next-Helium-Service/siteOzepCode](https://github.com/Zadus-Next-Helium-Service/siteOzepCode)
🔗 Site en ligne : *(lien à ajouter une fois déployé)*

## 🧱 À propos du projet

OZEP est un acteur engagé dans le développement d'infrastructures durables au Burkina Faso. Ce site présente l'entreprise, ses domaines d'expertise et ses réalisations, avec pour objectif de générer des demandes de devis.

### Domaines d'activité présentés
- Génie civil & BTP
- Ingénierie minière
- Étude géotechnique
- Hydraulique

## 🛠️ Stack technique

- **HTML5** — structure des pages
- **CSS3** — plusieurs feuilles de style (`style.css`, `pages-extra.css`, et des styles dédiés par page)
- **JavaScript vanilla** — animations, carrousel hero en 3D, accordéons, sliders de réalisations
- Polices : Google Fonts (*Archivo Black*, *Barlow Condensed*, *Inter*)

## 📁 Structure du projet

```
site on avance ici au fur et a mesure/
└── ozep-accueil 3/
    └── ozep-accueil/          👈 dossier du code réel du site
        ├── index.html          # Page d'accueil
        ├── services.html        # Détail des services
        ├── realisations.html    # Galerie de projets réalisés
        ├── apropos.html          # Présentation de l'entreprise
        ├── contact.html          # Formulaire / coordonnées
        ├── css/
        │   ├── style.css
        │   ├── pages-extra.css
        │   ├── apropos-extra.css
        │   ├── contact-futuristic.css
        │   ├── corridor-ozep.css
        │   ├── services-accordion.css
        │   └── services-animation.css
        ├── js/
        │   ├── script.js
        │   ├── contact-futuristic.js
        │   ├── corridor-ozep.js
        │   ├── services-accordion.js
        │   └── services-animation.js
        └── assets/               # Images, vidéos, logo
```

> 🧹 **À prévoir** : cette arborescence imbriquée (dossiers avec espaces) fonctionne, mais reste peu pratique pour les commandes Git et certains outils de déploiement. Rapatrier le contenu de `ozep-accueil` directement à la racine du dépôt reste une amélioration possible pour la suite.

## ✨ Fonctionnalités principales

- Carrousel hero plein écran avec vidéos et navigation par points/flèches
- Compteurs animés (années d'expérience, domaines d'expertise)
- Défilement continu des réalisations (bande de projets en boucle)
- Sections responsive avec animations au scroll (reveal, zoom, spin)
- Menu de navigation avec bouton "Demander un devis"

## 📂 Où trouver le code du site

Le code source à jour du site se trouve dans :
`site on avance ici au fur et a mesure/ozep-accueil 3/ozep-accueil/`

## 🧹 Historique Git

Le dépôt a été repris avec un **historique propre** (un seul commit initial). L'ancien historique contenait plusieurs vidéos trop lourdes (100+ Mo) qui bloquaient systématiquement les push vers GitHub, ainsi que des dossiers dupliqués (copies de travail) suivis par erreur.

Un fichier **`.gitignore`** a été mis en place à la racine pour exclure définitivement :
- Les archives (`.zip`, `.rar`)
- Les dossiers de copies/versions de travail (`ozep-accueil 3 - Copie...`)
- Les anciens fichiers WordPress (export du site d'origine)
- Les vidéos non compressées

Toutes les vidéos actuellement suivies font **moins de 30 Mo** chacune.

## 🚧 État d'avancement

- [x] Page d'accueil (`index.html`)
- [x] Page Services
- [x] Page Réalisations
- [x] Page À propos
- [x] Page Contact
- [x] Compression des vidéos (toutes sous 30 Mo)
- [x] Historique Git nettoyé et code poussé sur GitHub
- [ ] Rendre le site **responsive** (bon rendu sur téléphone et ordinateur)
- [ ] Rendre le site robuste et corriger les éventuels bugs
- [ ] Déploiement (GitHub Pages ou Netlify — choix en cours)
- [ ] Éventuellement passer sur un serveur payant par la suite

Les cinq pages du site sont terminées et fonctionnent bien dans l'ensemble. Le principal axe d'amélioration restant est l'adaptation responsive (mobile/desktop), ainsi que la fiabilisation générale du code avant la mise en ligne.

## 📌 À faire / prochaines étapes

- Analyser le code pour identifier les points à corriger pour le responsive
- Tester l'affichage sur différentes tailles d'écran (mobile, tablette, desktop)
- Choisir l'hébergement définitif : GitHub Pages ou Netlify
- Prévoir la migration vers un serveur payant si besoin, une fois le trafic plus important
- Éventuellement simplifier l'arborescence du dépôt (dossiers imbriqués)

## 📞 Contact

- Email : ouezan52@gmail.com
- Téléphone : +226 56 58 83 97 / +226 62 03 84 04
- Localisation : Ouagadougou, Burkina Faso

---
© 2026 OZEP. Tous droits réservés.