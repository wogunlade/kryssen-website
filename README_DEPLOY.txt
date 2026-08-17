KRYSSEN WEBSITE — VERSION 5 DEPLOYMENT PACKAGE
==============================================

This package contains only the approved V2 architecture, relabelled as Version 5 and converted to production filenames.

There are no duplicate V1/V2 page files in this package.

FILES
-----
index.html                 Version 5 homepage with case-study previews
proof.html                 Version 5 VoguePay/Coopify proof hub
apply.html                 Version 5 application page
submission-received.html   Version 5 confirmation page
styles.css                 Version 5 combined styling
app.js                     Navigation and email-application logic
assets/                    Local images and logos

DEPLOYMENT
----------
1. Back up the current live site or keep its last Cloudflare deployment available for rollback.
2. Upload the CONTENTS of this folder to the GitHub redesign branch—not the enclosing folder.
3. Confirm index.html is at the repository root.
4. Let Cloudflare create a preview deployment.
5. Test index.html, proof.html, apply.html and the email fallbacks.
6. Merge the redesign branch into main only after approval.

This is a static site. No build tool or package installation is required.
Cloudflare Pages settings: Framework None, build command exit 0, output directory .

APPLICATION FLOW
----------------
The form opens a prefilled Gmail compose window. Fallbacks allow the applicant to use the default email application or copy the application. Nothing is submitted until the applicant presses Send.
