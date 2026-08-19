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

  showApplicationReference();

  const applyForm = document.querySelector('[data-apply-form]');
  if (!applyForm) return;

  const DRAFT_KEY = 'kryssen-revenue-breakout-draft-v1';
  const DRAFT_FIELDS = [
    'name', 'role', 'email', 'company', 'website', 'motion',
    'stage', 'constraint', 'context', 'outcome'
  ];

  const status = applyForm.querySelector('[data-form-status]');
  const submitButton = applyForm.querySelector('[data-submit-button]');
  const submitLabel = applyForm.querySelector('[data-submit-label]');
  const turnstileContainer = applyForm.querySelector('[data-turnstile-container]');
  const turnstileMessage = applyForm.querySelector('[data-turnstile-message]');

  const state = {
    submitting: false,
    turnstileToken: '',
    turnstileWidgetId: null,
    turnstileReady: false
  };

  setTrackingFields();
  const restoredFields = restoreDraft();
  applyRequestedMotion(restoredFields);
  beginDraftSaving();
  initializeTurnstile();

  applyForm.addEventListener('submit', submitApplication);

  async function initializeTurnstile() {
    try {
      const response = await fetch('/api/config', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store'
      });
      const config = await response.json().catch(() => ({}));

      if (!response.ok || !config.success || !config.turnstileSiteKey) {
        throw new Error(config.message || 'The secure form is not configured yet.');
      }

      await waitForTurnstile();

      state.turnstileWidgetId = window.turnstile.render(turnstileContainer, {
        sitekey: config.turnstileSiteKey,
        action: config.turnstileAction || 'revenue-breakout-apply',
        theme: 'light',
        size: 'flexible',
        callback(token) {
          state.turnstileToken = token;
          state.turnstileReady = true;
          turnstileMessage.textContent = 'Security check complete.';
          if (!state.submitting) setSubmitReady(true);
        },
        'expired-callback'() {
          state.turnstileToken = '';
          state.turnstileReady = false;
          turnstileMessage.textContent = 'The security check expired. Completing it again…';
          setSubmitReady(false);
        },
        'error-callback'() {
          state.turnstileToken = '';
          state.turnstileReady = false;
          turnstileMessage.textContent = 'The security check could not load. Refresh the page to try again.';
          setSubmitReady(false);
        }
      });

      turnstileMessage.textContent = 'Completing the security check…';
    } catch (error) {
      turnstileMessage.textContent = error.message || 'The security check could not load. Refresh the page to try again.';
      showStatus('The secure application form is temporarily unavailable. Refresh the page and try again.', 'error');
      setSubmitReady(false);
    }
  }

  function waitForTurnstile() {
    return new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const check = () => {
        if (window.turnstile && typeof window.turnstile.render === 'function') {
          resolve();
          return;
        }
        if (Date.now() - startedAt > 12000) {
          reject(new Error('The security check took too long to load. Refresh the page to try again.'));
          return;
        }
        window.setTimeout(check, 100);
      };
      check();
    });
  }

  async function submitApplication(event) {
    event.preventDefault();
    if (state.submitting) return;
    if (!applyForm.reportValidity()) return;

    if (!state.turnstileReady || !state.turnstileToken) {
      showStatus('Please wait for the security check to complete, then submit again.', 'error');
      turnstileContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    state.submitting = true;
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Submitting your application…';
    showStatus('Securely storing your application. Keep this page open.', 'info');

    const formData = new FormData(applyForm);
    const payload = Object.fromEntries(formData.entries());
    payload.turnstileToken = state.turnstileToken;

    try {
      const response = await fetch(applyForm.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success !== true || !result.applicationId) {
        const error = new Error(result.message || 'We could not submit your application. Your answers are still here—please try again.');
        error.field = result.field || '';
        throw error;
      }

      clearDraft();
      const destination = new URL('submission-received.html', window.location.href);
      destination.searchParams.set('application', result.applicationId);
      window.location.assign(destination.toString());
    } catch (error) {
      state.submitting = false;
      submitButton.removeAttribute('aria-busy');
      submitLabel.textContent = 'Submit for Operator Review';
      showStatus(error.message || 'We could not submit your application. Your answers are still here—please try again.', 'error');
      focusInvalidField(error.field);
      resetTurnstile();
    }
  }

  function resetTurnstile() {
    state.turnstileToken = '';
    state.turnstileReady = false;
    setSubmitReady(false);
    turnstileMessage.textContent = 'Refreshing the security check for your retry…';

    if (window.turnstile && state.turnstileWidgetId !== null) {
      try {
        window.turnstile.reset(state.turnstileWidgetId);
      } catch {
        turnstileMessage.textContent = 'Refresh the page to restart the security check. Your answers will be restored.';
      }
    }
  }

  function setSubmitReady(ready) {
    submitButton.disabled = !ready || state.submitting;
    if (!state.submitting) {
      submitLabel.textContent = ready ? 'Submit for Operator Review' : 'Preparing secure submission…';
    }
  }

  function showStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.classList.remove('is-error', 'is-info');
    status.classList.add('is-visible', type === 'error' ? 'is-error' : 'is-info');
    if (type === 'error') status.focus({ preventScroll: true });
  }

  function focusInvalidField(fieldName) {
    if (!fieldName || fieldName === 'turnstile') return;
    const input = Array.from(applyForm.elements).find((element) => element.name === fieldName);
    if (input && typeof input.focus === 'function') input.focus({ preventScroll: false });
  }

  function setTrackingFields() {
    const params = new URLSearchParams(window.location.search);
    setHidden('[data-source-page]', window.location.href.slice(0, 500));
    setHidden('[data-utm-source]', (params.get('utm_source') || '').slice(0, 150));
    setHidden('[data-utm-medium]', (params.get('utm_medium') || '').slice(0, 150));
    setHidden('[data-utm-campaign]', (params.get('utm_campaign') || '').slice(0, 150));
    setHidden('[data-form-started-at]', String(Date.now()));
  }

  function setHidden(selector, value) {
    const field = applyForm.querySelector(selector);
    if (field) field.value = value;
  }

  function applyRequestedMotion(restoredFields) {
    if (restoredFields.has('motion')) return;
    const requestedMotion = new URLSearchParams(window.location.search).get('motion');
    if (!['sales', 'plg', 'hybrid'].includes(requestedMotion)) return;
    const input = applyForm.querySelector(`input[name="motion"][value="${requestedMotion}"]`);
    if (input) input.checked = true;
  }

  function restoreDraft() {
    const restored = new Set();
    try {
      const draft = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) || '{}');
      DRAFT_FIELDS.forEach((name) => {
        if (!Object.prototype.hasOwnProperty.call(draft, name)) return;
        const value = String(draft[name] == null ? '' : draft[name]);
        const controls = applyForm.querySelectorAll(`[name="${name}"]`);
        controls.forEach((control) => {
          if (control.type === 'radio') {
            control.checked = control.value === value;
          } else {
            control.value = value;
          }
        });
        if (value) restored.add(name);
      });
    } catch {
      // Storage can be unavailable in strict privacy modes; the form still works.
    }
    return restored;
  }

  function beginDraftSaving() {
    let timer;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(saveDraft, 180);
    };
    applyForm.addEventListener('input', schedule);
    applyForm.addEventListener('change', schedule);
  }

  function saveDraft() {
    const formData = new FormData(applyForm);
    const draft = {};
    DRAFT_FIELDS.forEach((name) => {
      draft[name] = formData.get(name) || '';
    });
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // The current page still retains the answers if storage is unavailable.
    }
  }

  function clearDraft() {
    try {
      window.sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // No action needed.
    }
  }

  function showApplicationReference() {
    const reference = document.querySelector('[data-application-reference]');
    if (!reference) return;
    const applicationId = new URLSearchParams(window.location.search).get('application') || '';
    if (/^KRY-\d{8}-[A-Z0-9]{6}$/.test(applicationId)) {
      reference.textContent = applicationId;
      reference.closest('[data-reference-wrap]')?.removeAttribute('hidden');
    }
  }
})();
