KRYSSEN WEBSITE — VERSION 6 DEPLOYMENT PACKAGE
==============================================

Version 6 retains the approved website architecture and adds a secure, direct application workflow for the existing Cloudflare Worker named "kryssen-website".

PUBLIC WEBSITE FILES
--------------------
index.html                 Approved homepage
proof.html                 VoguePay/Coopify proof hub
apply.html                 Direct application form
submission-received.html   Success page shown only after storage
styles.css                 Website and form styling
app.js                     Navigation, form submission, retry and draft logic
assets/                    Local website images and logos

SERVER-SIDE FILES (NOT PUBLIC ASSETS)
-------------------------------------
worker/index.js             /api/apply, /api/config and /api/health
wrangler.jsonc              Existing Worker configuration
package.json                Wrangler build commands
.assetsignore               Prevents server/setup files being served publicly
google-apps-script/Code.gs  Google Sheet and email receiver source

SECURITY
--------
- The browser submits only to the same-origin /api/apply endpoint.
- Cloudflare verifies Turnstile on the server.
- Cloudflare validates the application before forwarding it.
- The Google URL, webhook password and Turnstile secret remain encrypted Worker secrets.
- The applicant is redirected only after Google confirms that storage succeeded.
- Failed submissions keep the entered answers available for retry.
- The button is locked while a request is in progress.

PREVIEW WORKFLOW
----------------
1. Create the GitHub branch application-workflow from main.
2. Replace the repository contents on that branch with the CONTENTS of this folder.
3. Do not merge into main.
4. Let Cloudflare Workers Builds create a versioned preview.
5. Add the required Worker variables/secrets after the first code-bearing preview exists.
6. Redeploy the preview branch.
7. Complete the full test checklist.
8. Merge only after approval.

See SETUP-CLOUDFLARE-WORKER.txt and PRE-LAUNCH-CHECKLIST.txt for the ordered beginner procedure.
