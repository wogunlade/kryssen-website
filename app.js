(() => {
  const config = window.KRYSSEN_CONFIG || {};
  window.dataLayer = window.dataLayer || [];
  let consentState = { analytics: false, marketing: false, decided: false };

  function gtag() {
    window.dataLayer.push(arguments);
  }

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  initNavigation();
  initConsent();
  initTracking();
  initApplicationForm();
  initReceivedPage();

  function initNavigation() {
    const menuButton = document.querySelector('[data-menu-button]');
    const nav = document.querySelector('[data-nav]');
    if (!menuButton || !nav) return;

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

  function initConsent() {
    const storageKey = `kryssen-consent-v${config.consentVersion || '1'}`;
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    } catch {
      saved = null;
    }

    if (saved && typeof saved.analytics === 'boolean' && typeof saved.marketing === 'boolean') {
      applyConsent(saved);
      addPrivacySettingsButton(() => showConsentPanel(saved, true));
      return;
    }

    showConsentPanel({ analytics: false, marketing: false }, false);

    function showConsentPanel(current, isSettings) {
      document.querySelector('[data-consent-layer]')?.remove();
      const layer = document.createElement('section');
      layer.className = 'consent-layer';
      layer.dataset.consentLayer = '';
      layer.setAttribute('aria-label', 'Privacy choices');
      layer.innerHTML = `
        <div class="consent-card" role="dialog" aria-modal="true" aria-labelledby="consent-title">
          <div class="eyebrow">Your privacy choices</div>
          <h2 id="consent-title">Choose what Kryssen may measure.</h2>
          <p>Necessary security and application processing always work. Analytics and marketing tools load only with your permission. Read the <a href="privacy.html">Privacy Policy</a>.</p>
          <div class="consent-options" ${isSettings ? '' : 'hidden'} data-consent-options>
            <label><input type="checkbox" checked disabled> <span><b>Necessary</b><small>Security, Turnstile and application processing.</small></span></label>
            <label><input type="checkbox" data-consent-analytics ${current.analytics ? 'checked' : ''}> <span><b>Analytics</b><small>GA4 and Microsoft Clarity.</small></span></label>
            <label><input type="checkbox" data-consent-marketing ${current.marketing ? 'checked' : ''}> <span><b>Marketing</b><small>Hey Oliver marketing automation.</small></span></label>
          </div>
          <div class="consent-actions">
            <button class="button button--dark" type="button" data-consent-reject>Reject non-essential</button>
            <button class="button button--ghost" type="button" data-consent-manage>${isSettings ? 'Save choices' : 'Manage choices'}</button>
            <button class="button button--dark" type="button" data-consent-accept>Accept all</button>
          </div>
        </div>`;
      document.body.appendChild(layer);

      const options = layer.querySelector('[data-consent-options]');
      const manage = layer.querySelector('[data-consent-manage]');
      manage.addEventListener('click', () => {
        if (options.hidden) {
          options.hidden = false;
          manage.textContent = 'Save choices';
          return;
        }
        saveConsent({
          analytics: layer.querySelector('[data-consent-analytics]').checked,
          marketing: layer.querySelector('[data-consent-marketing]').checked
        }, isSettings);
      });
      layer.querySelector('[data-consent-reject]').addEventListener('click', () => {
        saveConsent({ analytics: false, marketing: false }, isSettings);
      });
      layer.querySelector('[data-consent-accept]').addEventListener('click', () => {
        saveConsent({ analytics: true, marketing: true }, isSettings);
      });
    }

    function saveConsent(choice, reload) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          ...choice,
          recordedAt: new Date().toISOString()
        }));
      } catch {
        // Consent still applies to this page when storage is unavailable.
      }
      document.querySelector('[data-consent-layer]')?.remove();
      if (reload) {
        window.location.reload();
        return;
      }
      applyConsent(choice);
      addPrivacySettingsButton(() => showConsentPanel(choice, true));
      document.dispatchEvent(new CustomEvent('kryssen:consent-ready'));
    }
  }

  function applyConsent(choice) {
    consentState = {
      analytics: Boolean(choice.analytics),
      marketing: Boolean(choice.marketing),
      decided: true
    };
    gtag('consent', 'update', {
      analytics_storage: choice.analytics ? 'granted' : 'denied',
      ad_storage: choice.marketing ? 'granted' : 'denied',
      ad_user_data: choice.marketing ? 'granted' : 'denied',
      ad_personalization: choice.marketing ? 'granted' : 'denied'
    });
    window.dataLayer.push({
      event: 'kryssen_consent_update',
      consent_analytics: choice.analytics ? 'granted' : 'denied',
      consent_marketing: choice.marketing ? 'granted' : 'denied'
    });

    if (choice.analytics || choice.marketing) loadGtm();
  }

  function loadGtm() {
    const id = String(config.gtmContainerId || '').trim();
    if (!/^GTM-[A-Z0-9]+$/i.test(id) || document.querySelector('[data-kryssen-gtm]')) return;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.async = true;
    script.dataset.kryssenGtm = '';
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
  }

  function addPrivacySettingsButton(openSettings) {
    if (document.querySelector('[data-privacy-settings]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'privacy-settings';
    button.dataset.privacySettings = '';
    button.textContent = 'Privacy choices';
    button.addEventListener('click', openSettings);
    document.body.appendChild(button);
  }

  function initTracking() {
    document.addEventListener('click', (event) => {
      const element = event.target.closest('[data-track]');
      if (!element) return;
      track(element.dataset.track, {
        cta_name: element.dataset.ctaName || undefined,
        cta_location: element.dataset.ctaLocation || undefined,
        case_name: element.dataset.caseName || undefined,
        profile_name: element.dataset.profileName || undefined,
        destination: element.href || undefined,
        source_page: window.location.pathname
      });
    });
  }

  function track(eventName, parameters = {}) {
    if (!eventName || !consentState.analytics) return false;
    const clean = {};
    Object.entries(parameters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') clean[key] = value;
    });
    window.dataLayer.push({ event: eventName, ...clean });
    return true;
  }

  function initApplicationForm() {
    const form = document.querySelector('[data-apply-form]');
    if (!form) return;

    const draftKey = 'kryssen-v7-application-draft';
    const draftFields = ['name', 'role', 'email', 'company', 'website', 'motion', 'stage', 'constraint', 'context', 'outcome'];
    const iframe = document.querySelector('[data-submission-frame]');
    const status = form.querySelector('[data-form-status]');
    const submitButton = form.querySelector('[data-submit-button]');
    const submitLabel = form.querySelector('[data-submit-label]');
    const progress = document.querySelector('[data-progress]');
    const progressBar = document.querySelector('[data-progress-bar]');
    const currentStepText = document.querySelector('[data-step-current]');
    const turnstileContainer = form.querySelector('[data-turnstile-container]');
    const turnstileMessage = form.querySelector('[data-turnstile-message]');
    const endpoint = String(config.appsScriptUrl || '').trim();
    const siteKey = String(config.turnstileSiteKey || '').trim();

    let currentStep = 1;
    let formStarted = false;
    let formStartTracked = false;
    let applyViewTracked = false;
    let submitting = false;
    let turnstileToken = '';
    let turnstileWidgetId = null;
    let turnstileInitialised = false;
    let submitTimeout = null;

    setTrackingFields();
    restoreDraft();
    prefillMotion();
    configureEndpoint();
    saveDraftOnChange();
    showStep(Number(sessionStorage.getItem(`${draftKey}-step`) || 1) === 2 ? 2 : 1);

    form.addEventListener('input', markFormStarted, { once: true });
    form.addEventListener('change', markFormStarted, { once: true });
    form.querySelector('[data-next-step]').addEventListener('click', () => {
      if (!validateStep(1)) return;
      showStep(2);
    });
    form.querySelector('[data-previous-step]').addEventListener('click', () => showStep(1));
    form.addEventListener('submit', submitApplication);
    window.addEventListener('message', receiveSubmissionResult);
    document.addEventListener('kryssen:consent-ready', () => {
      sendApplyView();
      if (formStarted) sendFormStart();
    });

    sendApplyView();

    function configureEndpoint() {
      if (/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(endpoint)) {
        form.action = endpoint;
        return;
      }
      showStatus('The application receiver has not been connected yet.', 'error');
    }

    function markFormStarted() {
      if (formStarted) return;
      formStarted = true;
      sendFormStart();
    }

    function sendApplyView() {
      if (applyViewTracked) return;
      applyViewTracked = track('apply_view', {
        motion_prefill: new URLSearchParams(window.location.search).get('motion') || 'none',
        source_page: document.referrer || 'direct'
      });
    }

    function sendFormStart() {
      if (formStartTracked) return;
      formStartTracked = track('form_start', {
        revenue_motion: selectedValue('motion') || 'not_selected'
      });
    }

    function showStep(step) {
      currentStep = step === 2 ? 2 : 1;
      form.querySelectorAll('[data-form-step]').forEach((section) => {
        const active = Number(section.dataset.formStep) === currentStep;
        section.hidden = !active;
        section.classList.toggle('is-active', active);
      });
      currentStepText.textContent = String(currentStep);
      progress.setAttribute('aria-valuenow', String(currentStep));
      progressBar.style.width = currentStep === 1 ? '50%' : '100%';
      try { sessionStorage.setItem(`${draftKey}-step`, String(currentStep)); } catch {}
      if (currentStep === 2) initializeTurnstile();
      document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validateStep(step) {
      const section = form.querySelector(`[data-form-step="${step}"]`);
      const controls = Array.from(section.querySelectorAll('input, select, textarea'));
      for (const control of controls) {
        if (!control.checkValidity()) {
          control.reportValidity();
          control.focus();
          return false;
        }
      }
      return true;
    }

    async function initializeTurnstile() {
      if (turnstileInitialised) return;
      turnstileInitialised = true;

      if (!/^0x[a-zA-Z0-9_-]+$/.test(siteKey)) {
        turnstileMessage.textContent = 'The security check has not been connected yet.';
        showStatus('The application security check has not been connected yet.', 'error');
        return;
      }

      try {
        await waitForTurnstile();
        turnstileWidgetId = window.turnstile.render(turnstileContainer, {
          sitekey: siteKey,
          action: 'revenue-breakout-apply',
          theme: 'light',
          size: 'flexible',
          callback(token) {
            turnstileToken = token;
            turnstileMessage.textContent = 'Security check complete.';
            if (!submitting) setSubmitReady(true);
          },
          'expired-callback'() {
            turnstileToken = '';
            turnstileMessage.textContent = 'Security check expired. Refreshing…';
            setSubmitReady(false);
          },
          'error-callback'() {
            turnstileToken = '';
            turnstileMessage.textContent = 'Security check could not load. Refresh the page to retry.';
            setSubmitReady(false);
          }
        });
        turnstileMessage.textContent = 'Completing the security check…';
      } catch (error) {
        turnstileMessage.textContent = error.message;
        showStatus(error.message, 'error');
      }
    }

    function waitForTurnstile() {
      return new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const check = () => {
          if (window.turnstile?.render) return resolve();
          if (Date.now() - startedAt > 12000) return reject(new Error('The security check took too long to load. Refresh the page to retry.'));
          setTimeout(check, 100);
        };
        check();
      });
    }

    function submitApplication(event) {
      event.preventDefault();
      if (submitting || !validateStep(2)) return;
      if (!form.action || form.action === window.location.href || !/^https:\/\/script\.google\.com\//.test(form.action)) {
        showStatus('The application receiver has not been connected yet.', 'error');
        return;
      }
      if (!turnstileToken) {
        showStatus('Please wait for the security check to complete.', 'error');
        return;
      }

      submitting = true;
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitLabel.textContent = 'Submitting your application…';
      showStatus('Securely storing your application. Keep this page open.', 'info');
      form.submit();

      clearTimeout(submitTimeout);
      submitTimeout = setTimeout(() => {
        if (!submitting) return;
        submitting = false;
        submitButton.removeAttribute('aria-busy');
        submitLabel.textContent = 'Submit for a fit review';
        showStatus('The receiver took too long to respond. Your answers are still here—please try again.', 'error');
        resetTurnstile();
      }, 45000);
    }

    function receiveSubmissionResult(event) {
      if (!iframe || event.source !== iframe.contentWindow) return;
      let messageHost = '';
      try { messageHost = new URL(event.origin).hostname; } catch { return; }
      const trustedGoogleOrigin = event.origin === 'https://script.google.com' ||
        messageHost === 'script.googleusercontent.com' ||
        messageHost.endsWith('.script.googleusercontent.com');
      if (!trustedGoogleOrigin) return;
      const result = event.data;
      if (!result || typeof result !== 'object' || typeof result.success !== 'boolean') return;

      clearTimeout(submitTimeout);
      if (result.success) {
        submitting = false;
        clearDraft();
        track('form_submit', { revenue_motion: selectedValue('motion') || 'unknown' });
        try {
          sessionStorage.setItem('kryssen-pending-lead-event', JSON.stringify({
            revenue_motion: selectedValue('motion') || 'unknown',
            recordedAt: Date.now()
          }));
        } catch {}
        const destination = new URL('/received', window.location.origin);
        if (result.applicationId && /^KRY-[A-Z0-9-]+$/.test(result.applicationId)) {
          destination.searchParams.set('application', result.applicationId);
        }
        window.location.assign(destination.toString());
        return;
      }

      submitting = false;
      submitButton.removeAttribute('aria-busy');
      submitLabel.textContent = 'Submit for a fit review';
      showStatus(result.message || 'We could not store your application. Your answers are still here—please try again.', 'error');
      focusField(result.field);
      resetTurnstile();
    }

    function resetTurnstile() {
      turnstileToken = '';
      setSubmitReady(false);
      if (window.turnstile && turnstileWidgetId !== null) {
        try {
          window.turnstile.reset(turnstileWidgetId);
          turnstileMessage.textContent = 'Refreshing the security check for your retry…';
        } catch {
          turnstileMessage.textContent = 'Refresh the page to restart the security check. Your answers will be restored.';
        }
      }
    }

    function setSubmitReady(ready) {
      submitButton.disabled = !ready || submitting;
      if (!submitting) submitLabel.textContent = ready ? 'Submit for a fit review' : 'Preparing secure submission…';
    }

    function showStatus(message, type) {
      status.textContent = message;
      status.classList.remove('is-error', 'is-info');
      status.classList.add('is-visible', type === 'error' ? 'is-error' : 'is-info');
      if (type === 'error') status.focus({ preventScroll: true });
    }

    function focusField(name) {
      if (!name || ['turnstile', 'form'].includes(name)) return;
      const control = Array.from(form.elements).find((element) => element.name === name);
      if (control?.focus) control.focus();
    }

    function setTrackingFields() {
      const params = new URLSearchParams(window.location.search);
      setValue('[data-source-page]', window.location.href.slice(0, 500));
      setValue('[data-utm-source]', (params.get('utm_source') || '').slice(0, 150));
      setValue('[data-utm-medium]', (params.get('utm_medium') || '').slice(0, 150));
      setValue('[data-utm-campaign]', (params.get('utm_campaign') || '').slice(0, 150));
      setValue('[data-form-started-at]', String(Date.now()));
      setValue('[data-submission-nonce]', createNonce());
    }

    function setValue(selector, value) {
      const field = form.querySelector(selector);
      if (field) field.value = value;
    }

    function createNonce() {
      if (window.crypto?.randomUUID) return window.crypto.randomUUID().replaceAll('-', '');
      const bytes = new Uint8Array(16);
      window.crypto?.getRandomValues?.(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('') || `${Date.now()}${Math.random()}`.replace(/\D/g, '');
    }

    function prefillMotion() {
      const motion = new URLSearchParams(window.location.search).get('motion');
      if (!['sales', 'plg', 'hybrid'].includes(motion) || selectedValue('motion')) return;
      const input = form.querySelector(`input[name="motion"][value="${motion}"]`);
      if (input) input.checked = true;
    }

    function selectedValue(name) {
      return new FormData(form).get(name) || '';
    }

    function restoreDraft() {
      try {
        const draft = JSON.parse(sessionStorage.getItem(draftKey) || '{}');
        draftFields.forEach((name) => {
          if (!Object.prototype.hasOwnProperty.call(draft, name)) return;
          form.querySelectorAll(`[name="${name}"]`).forEach((control) => {
            if (control.type === 'radio') control.checked = control.value === draft[name];
            else control.value = draft[name] || '';
          });
        });
      } catch {}
    }

    function saveDraftOnChange() {
      let timer;
      const schedule = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const values = new FormData(form);
          const draft = {};
          draftFields.forEach((name) => { draft[name] = values.get(name) || ''; });
          try { sessionStorage.setItem(draftKey, JSON.stringify(draft)); } catch {}
        }, 180);
      };
      form.addEventListener('input', schedule);
      form.addEventListener('change', schedule);
    }

    function clearDraft() {
      try {
        sessionStorage.removeItem(draftKey);
        sessionStorage.removeItem(`${draftKey}-step`);
      } catch {}
    }
  }

  function initReceivedPage() {
    const received = document.querySelector('[data-received-page]');
    if (!received) return;

    const reference = document.querySelector('[data-application-reference]');
    const applicationId = new URLSearchParams(window.location.search).get('application') || '';
    if (reference && /^KRY-\d{8}-[A-Z0-9]{6}$/.test(applicationId)) {
      reference.textContent = applicationId;
      reference.closest('[data-reference-wrap]')?.removeAttribute('hidden');
    }

    const sendPendingLead = () => {
      try {
        const pending = JSON.parse(sessionStorage.getItem('kryssen-pending-lead-event') || 'null');
        if (pending && Date.now() - pending.recordedAt < 10 * 60 * 1000) {
          const sent = track('generate_lead', { revenue_motion: pending.revenue_motion || 'unknown' });
          if (sent) sessionStorage.removeItem('kryssen-pending-lead-event');
        }
      } catch {}
    };
    sendPendingLead();
    document.addEventListener('kryssen:consent-ready', sendPendingLead);

    const calendarFrame = document.querySelector('[data-calendar-frame]');
    const calendarFallback = document.querySelector('[data-calendar-fallback]');
    const calendarSetupNote = document.querySelector('.calendar-setup-note');
    const calendarUrl = String(config.calendarUrl || '').trim();
    if (calendarFrame && /^https:\/\//.test(calendarUrl) && !calendarUrl.includes('PASTE_')) {
      calendarFrame.src = calendarUrl;
      calendarFrame.hidden = false;
      if (calendarFallback) {
        calendarFallback.href = calendarUrl;
        calendarFallback.hidden = false;
      }
      if (calendarSetupNote) calendarSetupNote.hidden = true;
    }

    window.addEventListener('message', (event) => {
      const name = event.data?.event || event.data?.type || '';
      if (name === 'calendly.event_scheduled' || /bookingSuccessful/i.test(name)) {
        track('call_booked', { calendar_provider: event.origin, meeting_type: 'provisional_operator_review' });
      }
    });
  }
})();
