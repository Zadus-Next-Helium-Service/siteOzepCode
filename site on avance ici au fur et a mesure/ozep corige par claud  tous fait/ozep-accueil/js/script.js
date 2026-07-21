/* ============================================================
   OZEP — Script principal (réutilisé sur toutes les pages)
   ============================================================ */

/* ============================================================
   1. CARROUSEL HERO (uniquement sur la page d'accueil avec + de 1 slide)
   ============================================================ */

const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const hero = document.querySelector('.hero');
const logo = document.querySelector('.logo');
const headerEl = document.querySelector('header');
const slideCount = slides.length;
let currentStep = 0;
let autoTimer;
let isHeroAnimating = false;
let heroAnimationTimers = [];
let ticking = false;

function updateLogoScrollState() {
  const currentScrollY = window.scrollY;
  const isScrolling = currentScrollY > 20;

  if (logo) {
    if (isScrolling) {
      logo.classList.add('is-scrolling');
    } else {
      logo.classList.remove('is-scrolling');
    }
  }

  if (headerEl) {
    if (isScrolling) {
      headerEl.classList.add('is-scrolling');
    } else {
      headerEl.classList.remove('is-scrolling');
    }
  }
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateLogoScrollState();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// --- Le carrousel n'est actif que s'il y a un hero ET au moins 2 slides ---
if (hero && slideCount > 0) {

  // === CAS : UN SEUL SLIDE → on désactive tout le carrousel ===
  if (slideCount === 1) {
    // Masquer les contrôles (flèches, points)
    const nav = hero.querySelector('.hero-nav');
    if (nav) nav.style.display = 'none';
    const arrows = hero.querySelectorAll('.arrow-btn, .dot');
    arrows.forEach(btn => btn.style.display = 'none');

    // Forcer le slide actif à rester en plein écran sans transition
    const activeSlide = hero.querySelector('.slide.active');
    if (activeSlide) {
      activeSlide.style.transition = 'none';
      activeSlide.style.transform = 'translate(-50%, -50%) translateX(0) translateZ(0) rotateY(0deg) scale(1)';
    }

    // Ajouter une classe pour éventuel style personnalisé
    hero.classList.add('single-slide');
    hero.classList.remove('is-carousel');
    hero.classList.add('is-expanded');

    // Ne pas lancer l'auto-play ni les événements
    // On sort du bloc pour ne pas exécuter la suite du carrousel
  } 
  // === CAS : PLUSIEURS SLIDES → carrousel normal ===
  else {
    // (code existant du carrousel multi-slides)
    function normalizeIndex(i) {
      return ((i % slideCount) + slideCount) % slideCount;
    }

    function getClosestStepForIndex(index) {
      const activeIndex = normalizeIndex(currentStep);
      let delta = index - activeIndex;

      if (delta > slideCount / 2) delta -= slideCount;
      if (delta < -slideCount / 2) delta += slideCount;

      return currentStep + delta;
    }

    function clearHeroAnimationTimers() {
      heroAnimationTimers.forEach(timer => clearTimeout(timer));
      heroAnimationTimers = [];
    }

    function setActiveSlide(index) {
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));

      slides[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
    }

    function setCarouselPositions(centerStep) {
      const spacing = Math.min(330, Math.max(190, window.innerWidth * 0.24));

      slides.forEach((slide, index) => {
        let offset = index - normalizeIndex(centerStep);

        if (offset > slideCount / 2) offset -= slideCount;
        if (offset < -slideCount / 2) offset += slideCount;

        const distance = Math.abs(offset);
        const x = offset * spacing;
        const z = -distance * 145;
        const rotate = offset * -26;
        const scale = 1 - Math.min(distance * 0.11, 0.34);
        const opacity = distance > 2 ? 0 : 1 - distance * 0.22;
        const depth = 20 - distance;

        slide.style.setProperty('--slide-x', `${x}px`);
        slide.style.setProperty('--slide-z', `${z}px`);
        slide.style.setProperty('--slide-rotate', `${rotate}deg`);
        slide.style.setProperty('--slide-scale', scale);
        slide.style.setProperty('--slide-opacity', opacity);
        slide.style.setProperty('--slide-depth', depth);
      });
    }

    function goToStep(step, instant = false) {
      if (isHeroAnimating && !instant) return;

      const previousIndex = normalizeIndex(currentStep);
      const nextIndex = normalizeIndex(step);

      if (step === currentStep && !instant) return;

      clearHeroAnimationTimers();

      if (instant) {
        currentStep = step;
        setActiveSlide(nextIndex);
        setCarouselPositions(currentStep);
        if (hero) {
          hero.classList.remove('is-carousel');
          hero.classList.add('is-expanded');
        }
        return;
      }

      isHeroAnimating = true;
      setActiveSlide(previousIndex);
      setCarouselPositions(currentStep);

      if (hero) {
        hero.classList.remove('is-expanded');
        hero.classList.add('is-carousel');
      }

      heroAnimationTimers.push(setTimeout(() => {
        currentStep = step;
        setActiveSlide(nextIndex);
        setCarouselPositions(currentStep);
      }, 500));

      heroAnimationTimers.push(setTimeout(() => {
        if (hero) {
          hero.classList.remove('is-carousel');
          hero.classList.add('is-expanded');
        }
      }, 1200));

      heroAnimationTimers.push(setTimeout(() => {
        isHeroAnimating = false;
      }, 1800));
    }

    function goToSlide(i) {
      goToStep(getClosestStepForIndex(normalizeIndex(i)));
    }

    function nextSlide() { goToStep(currentStep + 1); }
    function prevSlide() { goToStep(currentStep - 1); }

    function startAuto() {
      autoTimer = setInterval(nextSlide, 7500);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAuto();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAuto();
      });
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goToSlide(parseInt(dot.dataset.slide));
        resetAuto();
      });
    });

    goToStep(0, true);
    startAuto();

    window.addEventListener('resize', () => {
      setCarouselPositions(currentStep);
    });
  } // fin du else (multi-slides)
} // fin du if (hero && slideCount > 0)


/* ============================================================
   (Toutes les autres fonctionnalités restent inchangées)
   ============================================================ */

const countElements = document.querySelectorAll('.count');

function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1500;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.floor(progress * target);
    el.textContent = value + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target + suffix;
    }
  }
  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      countElements.forEach(animateCount);
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.4 });

const statsSection = document.querySelector('.intro-stats');
if (statsSection) statsObserver.observe(statsSection);

const statsObserverV2 = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat').forEach(stat => {
        stat.classList.add('is-visible');
      });
      statsObserverV2.disconnect();
    }
  });
}, { threshold: 0.3 });

const statsContainer = document.querySelector('.intro-stats');
if (statsContainer) {
  statsObserverV2.observe(statsContainer);
}

const introImage = document.querySelector('.intro-image img');
if (introImage) {
  window.addEventListener('scroll', function() {
    const rect = introImage.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight && rect.bottom > 0) {
      const scrollY = window.scrollY;
      const speed = 0.15;
      const yPos = scrollY * speed;
      introImage.style.transform = `translateY(${yPos}px)`;
    }
  }, { passive: true });
}

const staggerText = document.querySelector('.stagger-reveal');
if (staggerText) {
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        staggerText.classList.add('is-visible');
      } else {
        staggerText.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.2 });

  staggerObserver.observe(staggerText);
}

const cards = document.querySelectorAll('.service-card');

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-20px) scale(1.02)`;

    const img = card.querySelector('.service-img');
    if (img) {
      img.style.transform = `translateZ(30px) scale(1.05)`;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)`;
    const img = card.querySelector('.service-img');
    if (img) {
      img.style.transform = `translateZ(0px) scale(1)`;
    }
  });
});

const serviceCards = document.querySelectorAll('.service-card');

const serviceObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    } else {
      entry.target.classList.remove('is-visible');
    }
  });
}, { threshold: 0.2 });

serviceCards.forEach(card => {
  serviceObserver.observe(card);
});

const typewriterTitle = document.querySelector('.typewriter-title');
const whyGrid = document.querySelector('.why-grid');
const rotatingElement = document.querySelector('.rotating-word');

const titlePhrases = [
  "Une équipe engagée, des chantiers maîtrisés.",
  "Des relations durables basées sur la confiance et la transparence",
  "Des solutions techniques modernes et durables",
  "Des solutions personnalisées adaptées à vos besoins",
];

const rotatingWords = [
  "Fiabilité",
  "Responsabilité",
  "Respect des délais",
  "Innovation",
  "Expertise locale"
];

let currentTitleIndex = 0;
let titleRunning = false;

let currentWordIndex = 0;
let rotatingInterval = null;
let rotatingActive = false;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeWord(word, element, speed = 80) {
  element.textContent = '';
  for (let char of word) {
    if (!titleRunning) return;
    element.textContent += char;
    await wait(speed);
  }
}

async function eraseWord(element, speed = 40) {
  let text = element.textContent;
  while (text.length > 0) {
    if (!titleRunning) return;
    text = text.slice(0, -1);
    element.textContent = text;
    await wait(speed);
  }
}

async function titleTypewriterLoop() {
  if (!titleRunning) return;
  const phrase = titlePhrases[currentTitleIndex];
  await typeWord(phrase, typewriterTitle, 80);
  if (!titleRunning) return;
  await wait(2000);
  if (!titleRunning) return;
  await eraseWord(typewriterTitle, 40);
  if (!titleRunning) return;
  await wait(300);
  currentTitleIndex = (currentTitleIndex + 1) % titlePhrases.length;
  if (titleRunning) titleTypewriterLoop();
}

function startTitleTypewriter() {
  if (titleRunning) return;
  titleRunning = true;
  currentTitleIndex = 0;
  typewriterTitle.textContent = '';
  titleTypewriterLoop();
}

function stopTitleTypewriter() {
  titleRunning = false;
  typewriterTitle.textContent = '';
}

function rotateText() {
  if (!rotatingActive || !rotatingElement) return;
  rotatingElement.classList.remove('active');
  rotatingElement.classList.add('fade-out');
  setTimeout(() => {
    if (!rotatingActive) return;
    currentWordIndex = (currentWordIndex + 1) % rotatingWords.length;
    rotatingElement.textContent = rotatingWords[currentWordIndex];
    rotatingElement.classList.remove('fade-out');
    rotatingElement.classList.add('active');
  }, 500);
}

function startRotatingText() {
  if (rotatingActive) return;
  rotatingActive = true;
  currentWordIndex = 0;
  rotatingElement.textContent = rotatingWords[0];
  rotatingElement.classList.add('active');
  rotatingInterval = setInterval(rotateText, 4000);
}

function stopRotatingText() {
  rotatingActive = false;
  if (rotatingInterval) {
    clearInterval(rotatingInterval);
    rotatingInterval = null;
  }
  rotatingElement.classList.remove('active', 'fade-out');
  rotatingElement.textContent = '';
}

if (whyGrid && typewriterTitle && rotatingElement) {
  let whyRevealTimeout = null;

  const whyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        clearTimeout(whyRevealTimeout);
        whyRevealTimeout = setTimeout(() => {
          startTitleTypewriter();
          startRotatingText();
        }, 200);
      } else {
        entry.target.classList.remove('is-visible');
        clearTimeout(whyRevealTimeout);
        stopTitleTypewriter();
        stopRotatingText();
      }
    });
  }, { threshold: 0.3 });

  whyObserver.observe(whyGrid);
}

const workTrack = document.querySelector('.work-track');
const workCards = document.querySelectorAll('.work-card');
const workPrevBtn = document.getElementById('workPrevBtn');
const workNextBtn = document.getElementById('workNextBtn');
const workIndicator = document.getElementById('workIndicator');

if (workTrack && workCards.length > 0) {
  const totalCards = workCards.length / 2;
  let currentIndex = 0;
  let cardWidth = 0;
  let autoResumeTimer = null;

  function getCardWidth() {
    const firstCard = workCards[0];
    if (!firstCard) return 384;
    const gap = 24;
    return firstCard.offsetWidth + gap;
  }

  function updateIndicator(index) {
    const displayIndex = (index % totalCards) + 1;
    if (workIndicator) {
      workIndicator.textContent = `${displayIndex} / ${totalCards}`;
    }
  }

  function startAutoAnimation() {
    workTrack.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
    workTrack.style.transform = 'translateX(0)';
    workTrack.style.animation = 'scrollWork 28s linear infinite';
  }

  function stopAutoAnimation() {
    workTrack.style.animation = 'none';
  }

  function resetAutoResumeTimer() {
    if (autoResumeTimer) clearTimeout(autoResumeTimer);
    autoResumeTimer = setTimeout(() => {
      startAutoAnimation();
      currentIndex = 0;
      updateIndicator(0);
    }, 3000);
  }

  function goToCard(index) {
    stopAutoAnimation();
    resetAutoResumeTimer();

    cardWidth = getCardWidth();
    let normalizedIndex = index;
    const maxIndex = workCards.length - 1;
    if (normalizedIndex < 0) normalizedIndex = maxIndex;
    if (normalizedIndex > maxIndex) normalizedIndex = 0;

    currentIndex = normalizedIndex;
    const targetPosition = -currentIndex * cardWidth;

    workTrack.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
    workTrack.style.transform = `translateX(${targetPosition}px)`;

    updateIndicator(currentIndex);
  }

  cardWidth = getCardWidth();
  updateIndicator(0);

  if (workPrevBtn) {
    workPrevBtn.addEventListener('click', () => goToCard(currentIndex - 1));
  }
  if (workNextBtn) {
    workNextBtn.addEventListener('click', () => goToCard(currentIndex + 1));
  }

  window.addEventListener('resize', () => {
    cardWidth = getCardWidth();
    const targetPosition = -currentIndex * cardWidth;
    workTrack.style.transition = 'none';
    workTrack.style.transform = `translateX(${targetPosition}px)`;
  });

  workTrack.addEventListener('mouseenter', () => {
    workTrack.style.animationPlayState = 'paused';
    if (autoResumeTimer) {
      clearTimeout(autoResumeTimer);
      autoResumeTimer = null;
    }
  });

  workTrack.addEventListener('mouseleave', () => {
    workTrack.style.animationPlayState = 'running';
    if (workTrack.style.animation !== 'none' && workTrack.style.animation !== '') {
      resetAutoResumeTimer();
    }
  });
}

const revealElements = document.querySelectorAll('.reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-spin, .reveal-zoom');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    } else {
      entry.target.classList.remove('is-visible');
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));

if (window.matchMedia('(pointer: fine)').matches) {
  const ring = document.createElement('div');
  const dot = document.createElement('div');
  ring.className = 'custom-cursor';
  dot.className = 'custom-cursor-dot';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  let mouseX = 0,
    mouseY = 0;
  let ringX = 0,
    ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }, { passive: true });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  const updateInteractiveListeners = () => {
    const interactives = document.querySelectorAll('a, button, .btn, .dot, .arrow-btn, .burger, input, textarea, select');
    interactives.forEach(el => {
      if (!el.dataset.hasCursorEvents) {
        el.dataset.hasCursorEvents = 'true';
        el.addEventListener('mouseenter', () => {
          ring.classList.add('hover');
          dot.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
          ring.classList.remove('hover');
          dot.classList.remove('hover');
        });
      }
    });
  };

  updateInteractiveListeners();

  const ctaSection = document.querySelector('.cta');
  if (ctaSection) {
    ctaSection.addEventListener('mouseenter', () => {
      ring.classList.add('cta-hover');
      dot.classList.add('cta-hover');
    });
    ctaSection.addEventListener('mouseleave', () => {
      ring.classList.remove('cta-hover');
      dot.classList.remove('cta-hover');
    });
  }

  const cursorMutationObserver = new MutationObserver(updateInteractiveListeners);
  cursorMutationObserver.observe(document.body, { childList: true, subtree: true });
}

const introSection = document.querySelector('.intro');
const imgTerrain = document.querySelector('.intro-img-terrain');
const imgBureau = document.querySelector('.intro-img-bureau');

if (introSection && imgTerrain && imgBureau) {

  function checkImageChange() {
    const rect = introSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const sectionMiddle = rect.top + rect.height / 2;
    const windowMiddle = windowHeight / 2;

    if (rect.top < windowHeight && rect.bottom > 0) {
      if (sectionMiddle < windowMiddle) {
        imgTerrain.classList.add('inactive');
        imgTerrain.classList.remove('active');
        imgBureau.classList.add('active');
      } else {
        imgTerrain.classList.remove('inactive');
        imgTerrain.classList.add('active');
        imgBureau.classList.remove('active');
      }
    }
  }

  window.addEventListener('scroll', checkImageChange, { passive: true });
  window.addEventListener('load', checkImageChange);
  setTimeout(checkImageChange, 100);
}

// NOTE : l'ancien gestionnaire de #contactForm (qui affichait juste un
// message "Merci !" et vidait le formulaire) a été retiré d'ici.
// Il est désormais géré par js/contact-futuristic.js, qui envoie
// réellement le message et affiche l'animation de transmission.

// Gestion du mode plein écran pour le couloir 3D
(function() {
  var section = document.getElementById('corridorSection');
  var fsBtn = document.getElementById('corridorFullscreenBtn');
  var returnBtn = document.getElementById('corridorReturnBtn');

  if (!section || !fsBtn || !returnBtn) return;

  function enterFullscreen() {
    section.classList.add('fullscreen');
    fsBtn.style.display = 'none';
    returnBtn.style.display = 'inline-block';
    window.dispatchEvent(new Event('resize'));
  }

  function exitFullscreen() {
    section.classList.remove('fullscreen');
    fsBtn.style.display = 'inline-block';
    returnBtn.style.display = 'none';
    window.dispatchEvent(new Event('resize'));
  }

  fsBtn.addEventListener('click', enterFullscreen);
  returnBtn.addEventListener('click', exitFullscreen);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && section.classList.contains('fullscreen')) {
      exitFullscreen();
    }
  });
})();

/* ============================================================
   MENU MOBILE — ouverture/fermeture du burger
   (présent sur toutes les pages, chargé une seule fois ici)
   ============================================================ */
(function () {
  const burgerBtn = document.querySelector('.burger');
  const mobileNav = document.querySelector('.nav-links');

  if (!burgerBtn || !mobileNav) return;

  function openMenu() {
    mobileNav.classList.add('is-open');
    burgerBtn.classList.add('is-active');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  }

  function closeMenu() {
    mobileNav.classList.remove('is-open');
    burgerBtn.classList.remove('is-active');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  function toggleMenu() {
    if (mobileNav.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  burgerBtn.setAttribute('aria-expanded', 'false');
  burgerBtn.addEventListener('click', toggleMenu);

  // Fermer le menu quand on clique sur un lien (navigation vers une autre page/section)
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Fermer avec la touche Échap
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Si l'utilisateur repasse en affichage desktop (rotation tablette, redimensionnement),
  // on referme le menu mobile pour éviter un état bloqué/incohérent
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && mobileNav.classList.contains('is-open')) {
      closeMenu();
    }
  });
})();
