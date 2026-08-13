KRYSSEN WEBSITE — DEPLOYMENT PACKAGE
====================================

This is a complete static website. There is no build step and no package installation.

PAGES
-----
index.html                 Main landing page
apply.html                 Application page
proof.html                 Proof and operators page
submission-received.html   Confirmation page reserved for a future server-backed form

CORE FILES
----------
styles.css                 Shared site styling
app.js                     Mobile navigation, motion preselection, Gmail compose, and email fallbacks
assets/                     Team images and optimized company logos

HOW TO PUBLISH
--------------
1. Extract this ZIP.
2. Upload the CONTENTS of the "kryssen-live-site" folder to the public root of your host.
   Common public-root names include public_html, www, or the selected deployment directory.
3. Confirm that index.html is at the root—not inside an extra nested folder.
4. Visit these URLs after deployment:
   https://kryssengrowth.com/
   https://kryssengrowth.com/apply.html
   https://kryssengrowth.com/proof.html
5. Test the site on desktop and mobile.

HOSTING OPTIONS
---------------
The package works on any static host, including Cloudflare Pages, Netlify, GitHub Pages,
Amazon S3/static hosting, cPanel/Apache, and most standard web hosts.

APPLICATION EMAIL FLOW
----------------------
The application remains on the visitor's device until they send it.

With JavaScript enabled:
- The form validates the required answers.
- Gmail compose opens in a new tab with the recipient, subject, and answers prefilled.
- The page displays fallbacks: Open Gmail, Use email app, and Copy application.

Without JavaScript:
- The form uses its native mailto action to open the visitor's configured email application.

Recipient: info@kryssengrowth.com
Nothing is submitted until the applicant presses Send in their email service.

IMPORTANT NOTE ABOUT THE CONFIRMATION PAGE
------------------------------------------
submission-received.html is included for future use. Do not redirect applicants to it unless a
server or CRM endpoint has actually received and stored the application. The current email flow
does not use this page because email delivery cannot be confirmed by the website.

PRE-LAUNCH CHECKLIST
--------------------
[ ] Open every page and test every navigation link.
[ ] Test Sales-led, PLG, and Hybrid links from the home page to the application page.
[ ] Submit a test application using Gmail.
[ ] Test the "Use email app" fallback.
[ ] Test the "Copy application" fallback.
[ ] Confirm that info@kryssengrowth.com receives the email.
[ ] Check all team images and logos.
[ ] Test at phone, tablet, and desktop widths.
[ ] Confirm HTTPS is enabled on the live domain.
[ ] Confirm permissions to display all company logos and the $200m+ claim.

ASSET SOURCES
-------------
Company logos were supplied for MAX, VoguePay, Zedvance, Mkobo, GIG Mobility, Wesley,
Sabi, and Rensource. Local optimized copies are included so the live website does not depend
on third-party image servers.
