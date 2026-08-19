const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_ACTION = 'revenue-breakout-apply';
const MAX_BODY_BYTES = 30000;

const ALLOWED_MOTIONS = new Set(['sales', 'plg', 'hybrid']);
const ALLOWED_STAGES = new Set([
  'paying B2B customers',
  'recurring product usage',
  'paying customers and recurring usage'
]);
const ALLOWED_CONSTRAINTS = new Set([
  'We are reaching the wrong accounts',
  'Our offer does not create urgency',
  'Signups do not activate',
  'Usage does not become payment',
  'Sales and product handoff is broken',
  'We cannot see what creates revenue',
  'We are spread across too many channels'
]);

class RequestError extends Error {
  constructor(message, status = 400, field = '') {
    super(message);
    this.name = 'RequestError';
    this.status = status;
    this.field = field;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      if (request.method !== 'GET') return methodNotAllowed(['GET']);
      return jsonResponse({
        success: true,
        service: 'Kryssen Application Gateway',
        configured: {
          googleReceiver: Boolean(env.GOOGLE_APPS_SCRIPT_URL && env.GOOGLE_APPS_SCRIPT_SECRET),
          turnstile: Boolean(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY)
        }
      });
    }

    if (url.pathname === '/api/config') {
      if (request.method !== 'GET') return methodNotAllowed(['GET']);
      if (!env.TURNSTILE_SITE_KEY) {
        return jsonResponse(
          { success: false, message: 'The secure application form is not configured yet.' },
          503
        );
      }
      return jsonResponse({
        success: true,
        turnstileSiteKey: env.TURNSTILE_SITE_KEY,
        turnstileAction: TURNSTILE_ACTION
      });
    }

    if (url.pathname === '/api/apply') {
      if (request.method !== 'POST') return methodNotAllowed(['POST']);
      return handleApplication(request, env, url);
    }

    if (url.pathname.startsWith('/api/')) {
      return jsonResponse({ success: false, message: 'API route not found.' }, 404);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleApplication(request, env, requestUrl) {
  try {
    ensureConfigured(env);
    validateRequestOrigin(request, requestUrl);

    const raw = await parseRequestBody(request);

    // This field is hidden from people. Bots that fill every field are rejected quietly.
    if (cleanString(raw.companyFax, 200)) {
      return jsonResponse({ success: true, message: 'Application received.' });
    }

    validateSubmissionTiming(raw.formStartedAt);

    const token = cleanString(
      raw.turnstileToken || raw['cf-turnstile-response'],
      2048
    );
    if (!token) {
      throw new RequestError('Please complete the security check and try again.', 403, 'turnstile');
    }

    const turnstile = await verifyTurnstile(token, request, env.TURNSTILE_SECRET_KEY);
    if (!turnstile.success) {
      throw new RequestError('The security check expired or could not be verified. Please try again.', 403, 'turnstile');
    }
    if (turnstile.action !== TURNSTILE_ACTION) {
      throw new RequestError('The security check could not be verified. Please try again.', 403, 'turnstile');
    }
    if (!turnstile.hostname || turnstile.hostname.toLowerCase() !== requestUrl.hostname.toLowerCase()) {
      throw new RequestError('The security check was completed on an unexpected site.', 403, 'turnstile');
    }

    const application = validateApplication(raw);
    const googleResult = await sendToGoogle(application, env);

    if (!googleResult || googleResult.success !== true || !googleResult.applicationId) {
      throw new RequestError(
        'We could not securely store your application. Your answers are still here—please try again.',
        502
      );
    }

    return jsonResponse({
      success: true,
      applicationId: cleanString(googleResult.applicationId, 80),
      message: 'Application received.'
    });
  } catch (error) {
    if (error instanceof RequestError) {
      return jsonResponse({
        success: false,
        message: error.message,
        field: error.field || undefined
      }, error.status);
    }

    console.error('Kryssen application gateway error', error);
    return jsonResponse({
      success: false,
      message: 'We could not submit your application right now. Your answers are still here—please try again.'
    }, 500);
  }
}

function ensureConfigured(env) {
  const missing = [
    'GOOGLE_APPS_SCRIPT_URL',
    'GOOGLE_APPS_SCRIPT_SECRET',
    'TURNSTILE_SITE_KEY',
    'TURNSTILE_SECRET_KEY'
  ].filter((name) => !env[name]);

  if (missing.length) {
    console.error('Missing Worker bindings:', missing.join(', '));
    throw new RequestError(
      'The secure application form is temporarily unavailable. Please try again shortly.',
      503
    );
  }

  let googleUrl;
  try {
    googleUrl = new URL(env.GOOGLE_APPS_SCRIPT_URL);
  } catch {
    throw new RequestError('The application receiver is not configured correctly.', 503);
  }

  if (googleUrl.protocol !== 'https:' || googleUrl.hostname !== 'script.google.com' || !googleUrl.pathname.endsWith('/exec')) {
    throw new RequestError('The application receiver is not configured correctly.', 503);
  }
}

function validateRequestOrigin(request, requestUrl) {
  const origin = request.headers.get('Origin');
  const fetchSite = request.headers.get('Sec-Fetch-Site');

  if (!origin || origin !== requestUrl.origin) {
    throw new RequestError('This application must be submitted from the Kryssen website.', 403);
  }

  if (fetchSite && fetchSite !== 'same-origin') {
    throw new RequestError('This application must be submitted from the Kryssen website.', 403);
  }
}

async function parseRequestBody(request) {
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    throw new RequestError('The application is too large. Please shorten the longer answers.', 413);
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new RequestError('The application is too large. Please shorten the longer answers.', 413);
  }

  const contentType = (request.headers.get('Content-Type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    try {
      const parsed = JSON.parse(text || '{}');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid object');
      return parsed;
    } catch {
      throw new RequestError('The application could not be read. Please refresh and try again.');
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(text));
  }

  throw new RequestError('Unsupported application format.', 415);
}

function validateSubmissionTiming(value) {
  const startedAt = Number(value);
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    throw new RequestError('Please refresh the application page and try again.', 400);
  }

  if (Date.now() - startedAt < 1200) {
    throw new RequestError('Please review your answers, then submit again.', 400);
  }
}

async function verifyTurnstile(token, request, secret) {
  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: request.headers.get('CF-Connecting-IP') || ''
  });

  let response;
  try {
    response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10000)
    });
  } catch (error) {
    console.error('Turnstile request failed', error);
    throw new RequestError('The security check could not be reached. Please try again.', 503, 'turnstile');
  }

  if (!response.ok) {
    console.error('Turnstile returned HTTP', response.status);
    throw new RequestError('The security check could not be reached. Please try again.', 503, 'turnstile');
  }

  try {
    return await response.json();
  } catch {
    throw new RequestError('The security check returned an invalid response. Please try again.', 503, 'turnstile');
  }
}

function validateApplication(raw) {
  const application = {
    name: requiredText(raw.name, 'Your name', 120, 'name'),
    role: requiredText(raw.role, 'Your role', 120, 'role'),
    email: requiredText(raw.email, 'Work email', 180, 'email').toLowerCase(),
    company: requiredText(raw.company, 'Company', 180, 'company'),
    website: requiredText(raw.website, 'Company website', 300, 'website'),
    motion: requiredText(raw.motion, 'Revenue motion', 50, 'motion'),
    stage: requiredText(raw.stage, 'Current stage', 120, 'stage'),
    constraint: requiredText(raw.constraint, 'Primary revenue break', 250, 'constraint'),
    context: requiredText(raw.context, 'What is happening now', 3000, 'context'),
    outcome: cleanString(raw.outcome || '', 2000),
    sourcePage: cleanString(raw.sourcePage || '', 500),
    utmSource: cleanString(raw.utmSource || '', 150),
    utmMedium: cleanString(raw.utmMedium || '', 150),
    utmCampaign: cleanString(raw.utmCampaign || '', 150)
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email)) {
    throw new RequestError('Enter a valid work email address.', 400, 'email');
  }

  let websiteUrl;
  try {
    websiteUrl = new URL(application.website);
  } catch {
    throw new RequestError('Enter the full company website, beginning with https://', 400, 'website');
  }
  if (!['http:', 'https:'].includes(websiteUrl.protocol) || !websiteUrl.hostname.includes('.')) {
    throw new RequestError('Enter a valid company website.', 400, 'website');
  }
  application.website = websiteUrl.toString();

  if (!ALLOWED_MOTIONS.has(application.motion)) {
    throw new RequestError('Select a valid revenue motion.', 400, 'motion');
  }
  if (!ALLOWED_STAGES.has(application.stage)) {
    throw new RequestError('Select what the company already has.', 400, 'stage');
  }
  if (!ALLOWED_CONSTRAINTS.has(application.constraint)) {
    throw new RequestError('Select where the revenue motion is breaking.', 400, 'constraint');
  }
  if (application.context.length < 20) {
    throw new RequestError('Tell us a little more about what is happening now.', 400, 'context');
  }

  return application;
}

function requiredText(value, label, maxLength, field) {
  const text = cleanString(value, maxLength + 1);
  if (!text) throw new RequestError(`${label} is required.`, 400, field);
  if (text.length > maxLength) {
    throw new RequestError(`${label} is too long.`, 400, field);
  }
  return text;
}

function cleanString(value, maxLength) {
  return String(value == null ? '' : value)
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, maxLength);
}

async function sendToGoogle(application, env) {
  let response;
  try {
    response = await fetch(env.GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...application,
        webhookSecret: env.GOOGLE_APPS_SCRIPT_SECRET
      }),
      redirect: 'follow',
      signal: AbortSignal.timeout(20000)
    });
  } catch (error) {
    console.error('Google receiver request failed', error);
    throw new RequestError(
      'We could not securely store your application. Your answers are still here—please try again.',
      502
    );
  }

  if (!response.ok) {
    console.error('Google receiver returned HTTP', response.status);
    throw new RequestError(
      'We could not securely store your application. Your answers are still here—please try again.',
      502
    );
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error('Google receiver returned a non-JSON response');
    throw new RequestError(
      'We could not confirm that your application was stored. Your answers are still here—please try again.',
      502
    );
  }
}

function methodNotAllowed(methods) {
  const response = jsonResponse({ success: false, message: 'Method not allowed.' }, 405);
  response.headers.set('Allow', methods.join(', '));
  return response;
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'Referrer-Policy': 'no-referrer'
    }
  });
}
