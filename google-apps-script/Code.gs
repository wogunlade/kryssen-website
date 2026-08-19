/*
 * Kryssen Revenue Breakout Application Receiver
 * Bound Google Apps Script for the "Kryssen Revenue Breakout Applications" Sheet.
 *
 * Required Script Properties:
 * WEBHOOK_SECRET
 * SPREADSHEET_ID = ID copied from the Google Sheet URL
 * SHEET_NAME = Applications
 * INTERNAL_NOTIFICATION_EMAIL = info@kryssengrowth.com
 * REPLY_TO_EMAIL = info@kryssengrowth.com
 * RESPONSE_TIME = 24 business hours
 * WEBSITE_URL = https://kryssengrowth.com
 * SENDER_NAME = Kryssen Revenue Team
 */

function doGet() {
  return jsonResponse({
    success: true,
    service: 'Kryssen Application Receiver',
    message: 'Receiver is available.'
  });
}

/*
 * Run this once from the Apps Script editor before deployment.
 * It checks Sheet access and requests the permissions needed to send email.
 * It does not modify the Sheet or send an email.
 */
function authorizeSetup() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  var sheetName = properties.getProperty('SHEET_NAME') || 'Applications';

  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID is not configured.');
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet tab not found: ' + sheetName);
  }

  var remainingEmailQuota = MailApp.getRemainingDailyQuota();
  console.log('Authorization complete for: ' + spreadsheet.getName());
  console.log('Application tab found: ' + sheet.getName());
  console.log('Remaining daily email recipients: ' + remainingEmailQuota);

  return 'Authorization complete.';
}

function doPost(e) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var expectedSecret = properties.getProperty('WEBHOOK_SECRET');

    if (!expectedSecret) {
      throw new Error('WEBHOOK_SECRET is not configured.');
    }

    var data = parseRequest(e);

    if (!data.webhookSecret || data.webhookSecret !== expectedSecret) {
      return jsonResponse({ success: false, error: 'Unauthorized request.' });
    }

    var clean = validateAndClean(data);
    var applicationId = createApplicationId();
    var submittedAt = new Date();

    var spreadsheetId = properties.getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID is not configured.');
    }

    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheetName = properties.getProperty('SHEET_NAME') || 'Applications';
    var sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('Sheet tab not found: ' + sheetName);
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);

    var rowNumber;
    try {
      sheet.appendRow([
        submittedAt,
        applicationId,
        'New',
        clean.name,
        clean.role,
        clean.email,
        clean.company,
        clean.website,
        clean.motion,
        clean.stage,
        clean.constraint,
        clean.context,
        clean.outcome,
        clean.sourcePage,
        clean.utmSource,
        clean.utmMedium,
        clean.utmCampaign,
        'Pending',
        'Pending',
        '',
        '',
        ''
      ]);
      rowNumber = sheet.getLastRow();
    } finally {
      lock.releaseLock();
    }

    var emailSettings = {
      internalEmail: properties.getProperty('INTERNAL_NOTIFICATION_EMAIL') || 'info@kryssengrowth.com',
      replyTo: properties.getProperty('REPLY_TO_EMAIL') || 'info@kryssengrowth.com',
      responseTime: properties.getProperty('RESPONSE_TIME') || '24 business hours',
      websiteUrl: removeTrailingSlash(properties.getProperty('WEBSITE_URL') || 'https://kryssengrowth.com'),
      senderName: properties.getProperty('SENDER_NAME') || 'Kryssen Revenue Team'
    };

    var applicantEmailStatus = 'Sent';
    try {
      sendApplicantEmail(clean, applicationId, emailSettings);
    } catch (applicantEmailError) {
      applicantEmailStatus = 'Failed: ' + safeErrorMessage(applicantEmailError);
      console.error('Applicant email failed', applicantEmailError);
    }

    var internalEmailStatus = 'Sent';
    try {
      sendInternalEmail(clean, applicationId, submittedAt, spreadsheet.getUrl(), emailSettings, applicantEmailStatus);
    } catch (internalEmailError) {
      internalEmailStatus = 'Failed: ' + safeErrorMessage(internalEmailError);
      console.error('Internal email failed', internalEmailError);
    }

    sheet.getRange(rowNumber, 18).setValue(applicantEmailStatus);
    sheet.getRange(rowNumber, 19).setValue(internalEmailStatus);

    return jsonResponse({
      success: true,
      applicationId: applicationId,
      emailStatus: applicantEmailStatus,
      message: 'Application received.'
    });
  } catch (error) {
    console.error('Application receiver error', error);
    return jsonResponse({
      success: false,
      error: 'We could not receive the application. Please try again.',
      technicalReference: safeErrorMessage(error)
    });
  }
}

function parseRequest(e) {
  if (!e) return {};

  var contentType = (e.postData && e.postData.type) || '';
  var contents = (e.postData && e.postData.contents) || '';

  if (contentType.indexOf('application/json') !== -1 && contents) {
    return JSON.parse(contents);
  }

  return e.parameter || {};
}

function validateAndClean(data) {
  var required = [
    'name',
    'role',
    'email',
    'company',
    'website',
    'motion',
    'stage',
    'constraint',
    'context'
  ];

  required.forEach(function (field) {
    if (!data[field] || String(data[field]).trim() === '') {
      throw new Error('Missing required field: ' + field);
    }
  });

  var email = cleanText(data.email, 180).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email address.');
  }

  var motion = cleanText(data.motion, 50);
  if (['sales', 'plg', 'hybrid'].indexOf(motion) === -1) {
    throw new Error('Invalid revenue motion.');
  }

  return {
    name: cleanText(data.name, 120),
    role: cleanText(data.role, 120),
    email: email,
    company: cleanText(data.company, 180),
    website: cleanText(data.website, 300),
    motion: motion,
    stage: cleanText(data.stage, 120),
    constraint: cleanText(data.constraint, 250),
    context: cleanText(data.context, 3000),
    outcome: cleanText(data.outcome || 'Not provided', 2000),
    sourcePage: cleanText(data.sourcePage || '', 500),
    utmSource: cleanText(data.utmSource || '', 150),
    utmMedium: cleanText(data.utmMedium || '', 150),
    utmCampaign: cleanText(data.utmCampaign || '', 150)
  };
}

function cleanText(value, maxLength) {
  return String(value == null ? '' : value)
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, maxLength);
}

function createApplicationId() {
  var timezone = Session.getScriptTimeZone() || 'Africa/Lagos';
  var datePart = Utilities.formatDate(new Date(), timezone, 'yyyyMMdd');
  var randomPart = Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
  return 'KRY-' + datePart + '-' + randomPart;
}

function sendApplicantEmail(application, applicationId, settings) {
  var firstName = application.name.split(/\s+/)[0] || application.name;
  var subject = 'Your 45-Day Revenue Breakout application is in — ' + application.company;
  var proofUrl = settings.websiteUrl + '/proof.html';
  var voguePayUrl = proofUrl + '#voguepay';
  var coopifyUrl = proofUrl + '#coopify';

  var plainText = [
    'Hi ' + firstName + ',',
    '',
    'Your application is in.',
    '',
    'We received the 45-Day Revenue Breakout application for ' + application.company + '.',
    'Wole and Idorenyin Idiong will review your revenue motion, the proof already inside the business, and the constraint you want solved.',
    '',
    'Application reference: ' + applicationId,
    '',
    'WHAT HAPPENS NEXT',
    '1. We review your customer or product-usage proof, revenue motion and primary constraint.',
    '2. You receive a clear fit decision within ' + settings.responseTime + '.',
    '3. If the Revenue Breakout fits, we invite you to an operator review call. If it is too early or the wrong solution, we tell you directly.',
    '',
    'YOUR APPLICATION',
    'Name: ' + application.name,
    'Role: ' + application.role,
    'Email: ' + application.email,
    'Company: ' + application.company,
    'Website: ' + application.website,
    'Revenue motion: ' + displayMotion(application.motion),
    'Current stage: ' + application.stage,
    'Primary revenue break: ' + application.constraint,
    '',
    'What is happening now?',
    application.context,
    '',
    'What would make the next 45 days valuable?',
    application.outcome,
    '',
    'WHILE WE REVIEW',
    'VoguePay case: ' + voguePayUrl,
    'Coopify case: ' + coopifyUrl,
    '',
    'You are not paying for promises. You are paying against visible progress.',
    '',
    'If there is anything else we should know, reply directly to this email.',
    '',
    'Kryssen Revenue Team',
    settings.replyTo
  ].join('\n');

  var htmlBody = buildApplicantHtml(application, applicationId, firstName, settings, voguePayUrl, coopifyUrl);

  MailApp.sendEmail({
    to: application.email,
    subject: subject,
    body: plainText,
    htmlBody: htmlBody,
    name: settings.senderName,
    replyTo: settings.replyTo
  });
}

function buildApplicantHtml(application, applicationId, firstName, settings, voguePayUrl, coopifyUrl) {
  var rows = [
    ['Name', application.name],
    ['Role', application.role],
    ['Work email', application.email],
    ['Company', application.company],
    ['Website', application.website],
    ['Revenue motion', displayMotion(application.motion)],
    ['Current stage', application.stage],
    ['Primary revenue break', application.constraint]
  ];

  var summaryRows = rows.map(function (row) {
    return '<tr>' +
      '<td style="padding:10px 12px;border-bottom:1px solid #e3ddd2;color:#667069;font-size:12px;width:34%;">' + escapeHtml(row[0]) + '</td>' +
      '<td style="padding:10px 12px;border-bottom:1px solid #e3ddd2;color:#17201c;font-size:12px;font-weight:700;">' + escapeHtml(row[1]) + '</td>' +
      '</tr>';
  }).join('');

  return '<!doctype html>' +
    '<html><body style="margin:0;padding:0;background:#f1ece2;font-family:Arial,sans-serif;color:#17201c;">' +
    '<div style="display:none;max-height:0;overflow:hidden;">We’re reviewing where revenue is breaking inside ' + escapeHtml(application.company) + '.</div>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1ece2;"><tr><td align="center" style="padding:28px 14px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fbf9f5;border:1px solid #d8d0c3;">' +
    '<tr><td style="background:#0e231e;padding:24px 28px;"><span style="display:inline-block;background:#bbe182;color:#0e231e;padding:8px 10px;font-size:11px;font-weight:800;letter-spacing:1px;">KRYSSEN</span></td></tr>' +
    '<tr><td style="padding:34px 28px 10px;"><h1 style="margin:0;color:#0e231e;font-family:Georgia,serif;font-size:40px;line-height:1;letter-spacing:-1px;">Your application is in.</h1></td></tr>' +
    '<tr><td style="padding:16px 28px 28px;">' +
      '<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">Hi <strong>' + escapeHtml(firstName) + '</strong>,</p>' +
      '<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">We received the 45-Day Revenue Breakout application for <strong>' + escapeHtml(application.company) + '</strong>.</p>' +
      '<p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Wole and Idorenyin Idiong will review your revenue motion, the proof already inside the business and the constraint you want solved. This is not an automated sales pitch.</p>' +
      '<div style="padding:14px 16px;background:#fff;border-left:4px solid #c85236;font-size:12px;"><strong>Application reference:</strong> ' + escapeHtml(applicationId) + '</div>' +
    '</td></tr>' +
    '<tr><td style="padding:8px 28px 28px;"><h2 style="margin:0 0 14px;color:#0e231e;font-family:Georgia,serif;font-size:26px;">What happens next</h2>' +
      '<div style="padding:14px 0;border-top:1px solid #d8d0c3;"><strong>1. We review the evidence.</strong><br><span style="color:#667069;font-size:13px;">Customer or usage proof, your revenue motion and the primary break.</span></div>' +
      '<div style="padding:14px 0;border-top:1px solid #d8d0c3;"><strong>2. You receive a clear decision.</strong><br><span style="color:#667069;font-size:13px;">Expect a response within ' + escapeHtml(settings.responseTime) + '.</span></div>' +
      '<div style="padding:14px 0;border-top:1px solid #d8d0c3;"><strong>3. If it fits, we schedule an operator review.</strong><br><span style="color:#667069;font-size:13px;">If it is too early or the wrong tool, we tell you directly.</span></div>' +
    '</td></tr>' +
    '<tr><td style="padding:0 28px 30px;"><h2 style="margin:0 0 14px;color:#0e231e;font-family:Georgia,serif;font-size:26px;">Your application</h2>' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff;border:1px solid #d8d0c3;">' + summaryRows + '</table>' +
      '<div style="margin-top:14px;padding:16px;background:#fff;border:1px solid #d8d0c3;"><strong style="display:block;margin-bottom:7px;">What is happening now?</strong><div style="color:#667069;font-size:13px;line-height:1.6;">' + nl2br(escapeHtml(application.context)) + '</div></div>' +
      '<div style="margin-top:10px;padding:16px;background:#fff;border:1px solid #d8d0c3;"><strong style="display:block;margin-bottom:7px;">What would make the next 45 days valuable?</strong><div style="color:#667069;font-size:13px;line-height:1.6;">' + nl2br(escapeHtml(application.outcome)) + '</div></div>' +
    '</td></tr>' +
    '<tr><td style="padding:28px;background:#0e231e;color:#fff;"><h2 style="margin:0 0 8px;color:#fff;font-family:Georgia,serif;font-size:28px;">See the work while you wait.</h2><p style="margin:0 0 20px;color:#afc0b7;font-size:13px;line-height:1.6;">Two operator-led cases show how product, distribution and sales systems were connected to commercial outcomes.</p>' +
      '<a href="' + escapeHtml(voguePayUrl) + '" style="display:inline-block;margin:0 8px 8px 0;padding:12px 15px;background:#bbe182;color:#0e231e;text-decoration:none;font-size:12px;font-weight:800;">VoguePay case →</a>' +
      '<a href="' + escapeHtml(coopifyUrl) + '" style="display:inline-block;margin:0 0 8px;padding:12px 15px;background:#c85236;color:#fff;text-decoration:none;font-size:12px;font-weight:800;">Coopify case →</a>' +
    '</td></tr>' +
    '<tr><td style="padding:24px 28px;background:#fff;"><h3 style="margin:0 0 9px;color:#0e231e;font-family:Georgia,serif;font-size:22px;">Our payment assurance</h3><p style="margin:0 0 6px;color:#667069;font-size:13px;">50% to start · 30% at launch · 20% held until the agreed revenue proof is verified.</p><strong style="color:#c85236;font-size:13px;">You are not paying for promises. You are paying against visible progress.</strong></td></tr>' +
    '<tr><td style="padding:24px 28px;color:#667069;font-size:12px;line-height:1.6;">If there is anything important we should know, reply directly to this email.<br><br><strong style="color:#0e231e;">Kryssen Revenue Team</strong><br><a href="mailto:' + escapeHtml(settings.replyTo) + '" style="color:#c85236;">' + escapeHtml(settings.replyTo) + '</a></td></tr>' +
    '</table></td></tr></table></body></html>';
}

function sendInternalEmail(application, applicationId, submittedAt, spreadsheetUrl, settings, applicantEmailStatus) {
  var subject = 'New Revenue Breakout application — ' + application.company + ' · ' + displayMotion(application.motion);
  var body = [
    'NEW KRYSSEN REVENUE BREAKOUT APPLICATION',
    '',
    'Application ID: ' + applicationId,
    'Submitted at: ' + submittedAt,
    'Applicant confirmation email: ' + applicantEmailStatus,
    '',
    'Name: ' + application.name,
    'Role: ' + application.role,
    'Work email: ' + application.email,
    'Company: ' + application.company,
    'Website: ' + application.website,
    'Revenue motion: ' + displayMotion(application.motion),
    'Current stage: ' + application.stage,
    'Primary revenue break: ' + application.constraint,
    '',
    'WHAT IS HAPPENING NOW?',
    application.context,
    '',
    'DESIRED 45-DAY OUTCOME',
    application.outcome,
    '',
    'Source page: ' + application.sourcePage,
    'UTM source: ' + application.utmSource,
    'UTM medium: ' + application.utmMedium,
    'UTM campaign: ' + application.utmCampaign,
    '',
    'Google Sheet: ' + spreadsheetUrl
  ].join('\n');

  MailApp.sendEmail({
    to: settings.internalEmail,
    subject: subject,
    body: body,
    name: settings.senderName,
    replyTo: application.email
  });
}

function displayMotion(value) {
  var labels = {
    sales: 'Sales-led',
    plg: 'Product-led',
    hybrid: 'Hybrid'
  };
  return labels[value] || value;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function nl2br(value) {
  return String(value).replace(/\r?\n/g, '<br>');
}

function removeTrailingSlash(value) {
  return String(value).replace(/\/+$/, '');
}

function safeErrorMessage(error) {
  if (!error) return 'Unknown error';
  var message = error.message || String(error);
  return cleanText(message, 180);
}
