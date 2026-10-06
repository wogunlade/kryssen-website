# Kryssen latest page set — review copy

Compiled on **5 October 2026** for human review only. This folder is not a deployment package and does not replace the production site or prior ZIP.

## Homepage source

`index.html` is the cumulative **v2.06 Change O** review candidate (`homepage-v206-O-review.html`).

## Updated About page

`about.html` includes the current operator-led rebuild and latest refinements: tighter alignment and spacing; the supplied Adewale Yusuf, VoguePay and Coopify assets; four exact VoguePay figures; the updated Coopify operator record; a LinkedIn button; and one neutral 12-mark organisation wall headed “Where Wole has worked and where his work has been featured.” Individual organisations are not classified or presented as clients.

## Updated 404 page

`404.html` is a dedicated recovery page with the three-link navigation, clear homepage and service routes, useful service/FAQ/About paths, an inline WhatsApp route and the Strategy Conversation close. It uses `404-v2.css` and does not load the legacy behaviour script.

## Complete local routing

The assembled set includes the root-level application, manifesto and privacy pages required by links elsewhere in the review pages. Automated QA checks that every local HTML route, local asset and fragment destination resolves inside this folder.

## Cookie choices

Every assembled page loads the shared `analytics.js` consent layer. A first visit offers **Decline** and **Accept**. The decision is saved under `kryssen-consent-v1`, and the persistent **Cookies** control lets the visitor reopen the panel. GTM is not requested after Decline and is loaded only after an accepted optional category. The consent panel carries its own responsive styling so it works consistently across legacy and dedicated page stylesheets.

## Verification

See `COMPILE-MAP.json` for source mappings and hashes, and `QA-RESULTS.txt` for automated checks. Production remains unchanged and the prior ZIP has not been rebuilt.
