KRYSSEN WEBSITE — VERSION 7
===========================

Version 7 is a static website with a custom two-step application form.

Application architecture:
Custom HTML form -> Google Apps Script -> Turnstile verification -> Google Sheet -> applicant/internal emails -> /received

There is no Cloudflare Worker, Wrangler configuration, package.json or node_modules dependency.

PUBLIC WEBSITE FILES
--------------------
index.html
proof.html
apply.html
received.html
submission-received.html (compatibility redirect)
privacy.html
styles.css
app.js
config.js
assets/

NON-WEBSITE SETUP MATERIALS
---------------------------
google-apps-script/Code.gs
gtm/HEY-OLIVER-CUSTOM-HTML.html
TRACKING-VALUES.txt
PRE-LAUNCH-CHECKLIST.txt
SETUP-CLOUDFLARE.txt

DEPLOYMENT SAFETY
-----------------
1. Start a new GitHub branch named version-7 from the clean main branch.
2. Do not reuse application-workflow, which contains the retired Version 6 implementation.
3. Upload only the contents of the Version 7 website deployment ZIP.
4. Confirm there is no worker/, wrangler.jsonc or package.json on the version-7 branch.
5. Let Cloudflare create a static preview.
6. Add the exact preview hostname to ALLOWED_TURNSTILE_HOSTNAMES in Apps Script and to the Turnstile widget.
7. Test before merging.
8. Publish GTM only after consent tests pass in Preview mode.

PUBLIC CONFIGURATION
--------------------
config.js contains browser-visible values only:
- Apps Script /exec URL
- Turnstile Site Key
- Google Calendar embed URL
- GTM container ID

No secret belongs in config.js or GitHub.
