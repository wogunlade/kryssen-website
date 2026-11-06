# Kryssen Growth Studio V3 — Publication Package

- Entry point: `index.html`
- Status: publication-ready package; not deployed
- Indexable commercial/entity pages: 20
- Utility pages with `noindex,follow`: Apply, Privacy, Quiz and the 404 page
- Search crawling: allowed
- ChatGPT search crawler: allowed
- GPTBot model-training crawler: blocked
- Sitemap: `sitemap.xml`
- Machine-readable site summary: `llms.txt`

This folder is separate from the noindex review build. Publication still requires an explicit deployment action.

Deployment requirements: serve `404.html` with an HTTP 404 status for unknown routes; serve `index.html` for `/`. The site is delivered by a Cloudflare Worker serving static assets.
