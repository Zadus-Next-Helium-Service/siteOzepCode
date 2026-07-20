/* ============================================================
   OZEP — CONTACT : effets futuristes (HUD) + envoi réel du message
   Chargé uniquement sur contact.html, APRÈS js/script.js
   ============================================================ */

/* ------------------------------------------------------------
   ADRESSE DE RÉCEPTION DES MESSAGES
   Change juste cette valeur pour tester avec une autre adresse.
   ⚠️ La toute première fois qu'un message est envoyé vers une
   adresse donnée, FormSubmit envoie un email de confirmation à
   cette adresse : il faut cliquer sur le lien reçu pour activer
   la réception. Ensuite, tous les envois suivants sont automatiques.
   ------------------------------------------------------------ */
const FORM_TARGET_EMAIL = "zadus4541@gmail.com";

(function () {

  /* --- 1. Léger effet de bascule (tilt) sur les panneaux HUD --- */
  const hudPanels = document.querySelectorAll('.hud-panel');

  hudPanels.forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / rect.height) * -3;
      const rotateY = ((x - rect.width / 2) / rect.width) * 3;
      panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    panel.addEventListener('mouseleave', () => {
      panel.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });

  /* --- 2. Séquence de "transmission" au clic sur le formulaire --- */
  const form = document.getElementById('contactForm');
  const submitBtn = form ? form.querySelector('.btn-transmit') : null;
  const btnLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;
  const terminal = document.getElementById('terminalOutput');
  const terminalLine = terminal ? terminal.querySelector('.terminal-line') : null;

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function typeLine(el, text, speed = 20) {
    el.textContent = '';
    for (const char of text) {
      el.textContent += char;
      await wait(speed);
    }
  }

  if (form && submitBtn && btnLabel) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (submitBtn.classList.contains('is-sending')) return;

      const originalLabel = btnLabel.textContent;
      submitBtn.classList.add('is-sending');
      submitBtn.classList.remove('is-error');
      if (terminal) terminal.classList.remove('is-error');

      let dots = 0;
      btnLabel.textContent = 'Transmission';
      const dotTimer = setInterval(() => {
        dots = (dots + 1) % 4;
        btnLabel.textContent = 'Transmission' + '.'.repeat(dots);
      }, 260);

      // Envoi réel du message via FormSubmit (pas de backend à héberger)
      const formData = new FormData(form);
      formData.append('_subject', 'Nouveau message depuis le site OZEP');
      formData.append('_template', 'table');

      let success = false;
      try {
        const response = await fetch(`https://formsubmit.co/ajax/${FORM_TARGET_EMAIL}`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        success = response.ok;
      } catch (err) {
        success = false;
      }

      // On garde un minimum de suspense même si la réponse est instantanée
      await wait(700);
      clearInterval(dotTimer);

      if (success) {
        btnLabel.textContent = 'Message transmis ✓';
        if (terminal && terminalLine) {
          terminal.classList.add('is-visible');
          await typeLine(terminalLine, '> Requête reçue. Un conseiller OZEP vous recontacte sous 24h.');
        }
        form.reset();
      } else {
        submitBtn.classList.add('is-error');
        btnLabel.textContent = 'Échec de l\'envoi ⚠';
        if (terminal && terminalLine) {
          terminal.classList.add('is-visible', 'is-error');
          await typeLine(terminalLine, '> Erreur de transmission. Réessayez ou appelez-nous directement.');
        }
        // on ne vide pas le formulaire pour que la personne ne perde pas son message
      }

      await wait(2600);
      btnLabel.textContent = originalLabel;
      submitBtn.classList.remove('is-sending', 'is-error');

      if (terminal) {
        setTimeout(() => terminal.classList.remove('is-visible', 'is-error'), 4500);
      }
    });
  }

})();
