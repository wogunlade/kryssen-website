(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
      });
    });
  }

  const applyForm = document.querySelector('[data-apply-form]');
  if (!applyForm) return;

  const recipient = 'info@kryssengrowth.com';
  const status = document.querySelector('[data-form-status]');
  let applicationCopy = '';

  const params = new URLSearchParams(window.location.search);
  const requestedMotion = params.get('motion');
  if (requestedMotion && ['sales', 'plg', 'hybrid'].includes(requestedMotion)) {
    const motionInput = applyForm.querySelector(`input[name="motion"][value="${requestedMotion}"]`);
    if (motionInput) motionInput.checked = true;
  }

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const temporaryField = document.createElement('textarea');
    temporaryField.value = text;
    temporaryField.setAttribute('readonly', '');
    temporaryField.style.position = 'fixed';
    temporaryField.style.opacity = '0';
    document.body.appendChild(temporaryField);
    temporaryField.select();
    const copied = document.execCommand('copy');
    temporaryField.remove();
    if (!copied) throw new Error('Copy failed');
  };

  const showFallbacks = (gmailUrl, mailtoUrl, gmailOpened) => {
    if (!status) return;

    status.innerHTML = `
      <strong>${gmailOpened ? 'Gmail opened in a new tab.' : 'Gmail could not open automatically.'}</strong>
      <span>${gmailOpened ? 'If you do not see it, use one of these options.' : 'Choose another way to complete your application.'}</span>
      <div class="form-fallback-actions">
        <a class="button button--dark" href="${gmailUrl}" target="_blank" rel="noopener">Open Gmail</a>
        <a class="button button--ghost" href="${mailtoUrl}">Use email app</a>
        <button class="button button--ghost" type="button" data-copy-application>Copy application</button>
      </div>
      <span class="form-fallback-address">Send to <a href="mailto:${recipient}">${recipient}</a>. Nothing is submitted until you press Send.</span>
    `;
    status.classList.add('is-visible');
  };

  applyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!applyForm.reportValidity()) return;

    const form = new FormData(applyForm);
    const subject = `Revenue Motion Fit Call — ${form.get('company')}`;
    const body = [
      'KRYSSEN REVENUE MOTION FIT CALL',
      '',
      `Name: ${form.get('name')}`,
      `Role: ${form.get('role')}`,
      `Work email: ${form.get('email')}`,
      `Company: ${form.get('company')}`,
      `Website: ${form.get('website')}`,
      `Revenue motion: ${form.get('motion')}`,
      `Current stage: ${form.get('stage')}`,
      `Primary break: ${form.get('constraint')}`,
      '',
      'What is happening now?',
      form.get('context'),
      '',
      'What would make this engagement valuable?',
      form.get('outcome') || 'Not provided'
    ].join('\n');

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    applicationCopy = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;

    const gmailWindow = window.open(gmailUrl, '_blank');
    const gmailOpened = Boolean(gmailWindow);
    if (gmailWindow) gmailWindow.opener = null;

    showFallbacks(gmailUrl, mailtoUrl, gmailOpened);
  });

  document.addEventListener('click', async (event) => {
    const copyButton = event.target.closest('[data-copy-application]');
    if (!copyButton || !applicationCopy) return;

    try {
      await copyText(applicationCopy);
      copyButton.textContent = 'Copied';
      setTimeout(() => { copyButton.textContent = 'Copy application'; }, 2500);
    } catch {
      copyButton.textContent = 'Copy failed — select the email option';
    }
  });
})();
