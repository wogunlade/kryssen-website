# Kryssen Growth Studio — Website v1.1

Education-led growth agency site. Static build — no dependencies, no build step.
Every page is self-contained HTML referencing three stylesheets (`kryssen-style-tokens.css`, `fonts.css`, `k2d.css`) and one behaviour script (`k2d.js`).

Includes the 2026-09-18 CRO audit + feedback implementation: analytics.js and k2d.js wired across the site (GTM consent mode, event gating, rotor, WhatsApp controls and section diagnostics), canonical/schema URLs set to kryssengrowth.com, unified "Apply for a fit review" CTAs with full UTM attribution, Inter self-hosted (zero third-party requests).

**v0.71:** Simplified the quiz interface by removing the extra panel branding marker and sidebar Context label while retaining the full product identity and progress count.

**v0.70:** Widened the founder hero, added explicit profession/industry callouts to all eight sector-page openings, and strengthened the quiz interface and result-state branding with the full Kryssen identity and Education Opportunity Finder attribution.

**v0.69:** Expanded the homepage hero measure so the rotating-platform statement stays on one line at desktop widths, aligned the continuation line, and widened the supporting ELG paragraph without changing global content widths.

**v0.68:** Connected Apply and Masterclass to the protected Google Apps Script staging receiver, added dedicated Turnstile actions, native redirect delivery, nonces, honeypots, draft recovery, source attribution and receipt-safe return states. The package is intentionally marked staging until the Cloudflare preview hostname is allowlisted and end-to-end submissions pass.

**v0.67:** Completed a full automated QA pass and repaired the three defects found: the Quiz now has a semantic H1, Apply has complete canonical/Open Graph metadata plus page analytics identity, and preview-mode Apply can no longer claim a submission was received. The rerun passed with zero structural errors. Form delivery remains the production blocker.

**v0.66:** Added a contextual fixed WhatsApp conversion path to 15 high-intent pages, with page- and sector-specific pre-populated messages, a desktop label, compact mobile control, accessibility, consent/sticky-control collision handling and contextual click measurement. Homepage, Apply, Quiz and Privacy remain excluded from the floating action.

**v0.65:** Added one full horizontal Kryssen Growth Studio logo and installed it across every page header, including Apply. The compact K remains the favicon because a horizontal wordmark is not legible at browser-tab size.

**v0.64:** Aligned analytics and consent to the current live setup by using GTM container `GTM-NGKZZ88T`, denied-by-default consent mode, one shared `analytics.js` across all 19 pages and consent-gated interaction events. Updated Privacy and footer disclosures, corrected preview application measurement, revised the 404, replaced the homepage wordmark with a symbol, and added a bespoke Kryssen favicon set. **Staging status:** Apply and Masterclass point to the protected staging receiver. Do not merge until preview-host allowlisting and end-to-end tests pass.

**v0.63:** Updated all footer labels to “Read the ELG™ manifesto” and removed the orange footer divider on the About page only so its dark application close flows continuously into the footer.

**v0.62:** Refined the About-page conversion path with a clickable Wole Ogunlade LinkedIn profile action, a new three-part content-opportunity section, and a more direct application close. The close now reverses risk by clarifying that applying creates no project commitment and that, if an engagement proceeds, the final 20% remains held until the agreed proof event appears.

**v0.61:** Rebuilt the About page around Wole Ogunlade as Kryssen’s sole operator, with a concise product/growth/management/leadership value story, the approved Adewale Yusuf reference, a clearly bounded VoguePay and Coopify results dossier, and one focused Fit Review path. Removed Idorenyin Idiong from public company information and the packaged portrait assets, standardised the public name to Wole Ogunlade, and made the homepage Organization founder schema singular.

**v0.60:** Removed 12 retired or redundant pages: both Manifesto variants, PR Launch, Reports, Resources, Articles plus three article pages, Case Studies and both noindex Fintech variants. Also removed eight obsolete rebuild scripts and the orphaned Manifesto poster, repaired retained navigation, reduced the sitemap to 16 canonical URLs, and rewrote `llms.txt` around the remaining site. No standalone AI Visibility Scan or Education Breakout file remained to delete.

**v0.59:** The Masterclass hero image and its packaged asset have been removed. The hero is now a direct copy/form split, and the complete numbered “What education-led content is” layer-summary section has also been removed.

**v0.58:** The Masterclass is now form-first: the complete priority-list form sits in the hero, with copy → form → image ordering on mobile. The tool-demo bento, three later curriculum modules, full growth-motion section and ICP/skip section were removed; the expanded-content contrast and working canvas remain.

**v0.57:** `workshops.html` is now the ELG™ Manifesto Masterclass priority-list page: a no-cost live online session for up to 25 participants. It includes expanded-content training, an ELG™ working canvas and a richer lead form. With no production endpoint configured, the form remains visibly in preview and cannot display a false submission success.

**v0.56:** The Manifesto opening now uses “The Education-Led Growth™ manifesto?” without the ELG™ abbreviation, the growth-strategy heading is more direct, and the closing explanation and post-CTA capacity line have been reduced.

**v0.55:** The ELG Manifesto now leads with “The Education-Led Growth™ (ELG™) manifesto?”, uses simpler ELG™ naming throughout, removes the Missing/Emerging/Operational note, shortens the layer and beliefs headings, strengthens the application close and meets the footer without a gap.

**v0.54:** Manifesto Option 1 is now the canonical `manifesto.html`. It directly defines education-led content strategy, expands content from publishing into decision utility and market leadership, introduces a human-reviewed five-dimension ELG Score, cites the 2024 Edelman–LinkedIn thought-leadership finding, combines Inbound/Outbound/Category leadership with six beliefs, and closes on a contextual Fit Review application. The sector-example section and all small section labels were removed.

**v0.53:** Two noindex ELG Manifesto concept pages have been added for owner review. `manifesto-option-1.html` presents the “Content buyers can use” expansion. `manifesto-recommended.html` presents the recommended buyer-decision hybrid connecting Foundation, Decision utilities and Market leadership to Inbound, Outbound and Category leadership. The canonical `manifesto.html` remains unchanged pending selection.

**v0.52:** The homepage header now contains only the Apply action; “How it works” and “Resources” were removed. The standalone Education-Led Growth™ title above the homepage H1 was also removed.

**v0.51:** All sector application closes now say “Apply. Tell us about your business and expectations.” and set a two-business-day application review expectation before the potential-fit call agenda. Four small section labels have been removed from every canonical sector page to simplify the path.

**v0.50:** All eight canonical sector pages are now bottom-funnel decision-to-advantage journeys with distinct market headlines, three buyer-understanding gaps, four selectable sector-specific content opportunities and one closing Fit Review application bridge. Generic deliverable/workflow/duplicate-close sections were removed; advanced opportunities now include appropriate guides, calculators, estimators, diagnostics, benchmarking tools, playbooks, dashboards, reports and research-led PR. Opportunity selection now correctly updates root-level `apply.html` context.

**v0.49:** The Industries opening has been redesigned as a higher-impact full-height selector: a three-part centred H1, lime ELG emphasis, a lime advantage panel with orange depth, restrained grid/radial depth and one direct jump to the industry cards.

**v0.48:** The Industries hero now centres the direct H1 “Select your industry to see how Education-Led Growth™ works—and how it gives you an advantage.” All site footers have been simplified by removing Reports, PR Launch, Case studies and The resource hub, while the existing Workshops page is now linked under Learn.

**v0.47:** The Industries hub is now a full-page selector led by “Select your industry to see what your buyers need to understand.” Eight redesigned editorial route cards make only “Explore this sector” underlined; the generic asset stack has been removed, and the close now frames content as a market advantage while explaining the Fit Review and four-company capacity limit.

**v0.46:** The Industries hub now leads with the direct promise “Use content to build market leadership in your industry,” uses plain-language supporting copy, and gives one clear instruction to select an industry and see what its buyers need to understand.

**v0.45:** The opening context now reads “Take the ELG™ Quiz.” The operating-readiness question asks whether a dedicated person can work with Kryssen, allows up to three relevant support selections, and adds ownership readiness to the result explanation without automatically changing the suggested service.

**v0.44:** The no-email Education Opportunity Finder now opens directly on its context questions with no intermediate landing screen. After the result, the conversion panel directly invites the visitor to apply for a fit review, states that Kryssen accepts only four companies at a time, and explains the human review of reusable work, evidence, expertise, ownership, approvals and service fit.

**v0.43:** The legacy AI-visibility score was replaced by a no-email Education Opportunity Finder. One context screen and six focused questions identify the buyer opportunity, knowledge/asset maturity, sector decision, why-now trigger, candidate commercial movement and operating readiness. The result recommends three-to-five likely assets, one primary service and at most one optional supporting service, explains why, and offers contextual `Apply for a fit review` and WhatsApp actions. Root-level `apply.html` is now Apply V1.5 and captures Finder-suggested primary/supporting service context alongside audience, sector and opportunity without treating it as confirmed scope or an automatic fit verdict.

## Publication note

The Adewale Yusuf references are operator proof about Ogunlade’s pre-Kryssen work at VoguePay, not Kryssen-client testimonials. Keep that evidence boundary intact.

**Application status:** `apply.html` and its runtime assets are included in this website package. The application remains in labelled preview mode until `apply-v1-config.js` is connected to the production submission endpoint, security challenge, durable storage, routing and applicant receipt workflow.

## What's inside

| Group | Files |
|---|---|
| Homepage | `index.html` |
| Audiences | `founders.html` · `business.html` |
| Application | `apply.html` · `apply-v1.css` · `apply-v1.js` · `apply-v1-config.js` |
| Learn | `quiz.html` + `quiz.js` · `manifesto.html` · `workshops.html` |
| Industries | `industries.html` + 8 canonical industry pages |
| Company | `about.html` · `privacy.html` · `404.html` |
| Assets | `favicon.svg` · `share.png` · `assets/` (including self-hosted Inter) |
| SEO / AI | `sitemap.xml` (16 canonical URLs) · `llms.txt` · `robots.txt` |
| History | `VERSION.md` (full changelog through v0.71) |

## Conversion wiring (do not change without intent)

- **All Apply CTAs** — label "Apply for a fit review" → local `apply.html`; audience, sector, opportunity, lane and UTM context is preserved for Apply V1.5.
- **WhatsApp** → `https://wa.me/2348158357418` (+234 815 835 7418)
- **Email** → `info@kryssengrowth.com`
- **Analytics** → live GTM container `GTM-NGKZZ88T`; optional interaction events require consent. Cloudflare Web Analytics remains a Cloudflare project setting.

## Deploy on GitHub Pages

1. Create a new GitHub repository (e.g. `kryssen-site`).
2. Upload the contents of this folder to the repo root (drag-and-drop works, or):
   ```bash
   git init && git add . && git commit -m "v1.1" && git branch -M main
   git remote add origin https://github.com/<you>/kryssen-site.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages → Source: Deploy from a branch → main / root → Save**.
4. Your site goes live at `https://<you>.github.io/kryssen-site/` within a minute or two.

Notes:
- `404.html` is served automatically by GitHub Pages for missing routes.
- If you deploy under a sub-path (`/kryssen-site/`), internal relative links still work; canonicals already point at kryssengrowth.com for the eventual domain switch.

## Local preview

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```
