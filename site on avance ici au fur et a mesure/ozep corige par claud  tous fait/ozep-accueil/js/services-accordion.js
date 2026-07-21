/* ============================================================
   services-accordion.js
   Un seul panneau ouvert à la fois, accessible clavier (Entrée/
   Espace), clic sur "En savoir plus" sans re-fermer le panneau.
   ============================================================ */
(function () {
  const items = document.querySelectorAll('.services-accordion .acc-item');
  if (!items.length) return;

  function activate(target) {
    items.forEach((item) => {
      const isActive = item === target;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
  }

  items.forEach((item) => {
    item.addEventListener('click', () => activate(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate(item);
      }
    });

    const link = item.querySelector('.acc-link');
    if (link) {
      link.addEventListener('click', (e) => e.stopPropagation());
    }
  });
})();
