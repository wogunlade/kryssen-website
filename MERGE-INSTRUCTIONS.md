# Kryssen Growth Studio v2 — merge instructions

This is the complete **front-end website v2 merge package**. It has not been deployed.

## Homepage source

`index.html` is compiled exactly from `homepage-v206-U-review.html`, the approved latest homepage candidate.

## Merge method

Merge the contents of this folder into the website project root, preserving the included relative paths. Replace matching front-end files with the v2 versions and add files that do not yet exist.

The package includes:

- All 19 current HTML routes
- All shared and page-specific CSS
- All shared and page-specific browser JavaScript
- Fonts, favicons, logos, portraits, operator marks and homepage rotator images
- Compilation map and automated QA reports

## Deliberately not included

- Apps Script backend files such as `Code.gs`
- Script Properties or spreadsheet configuration
- Worker deployment configuration or credentials
- Git history or repository metadata

Those systems remain separate and unchanged. The package is intended for a code merge, followed by repository/build review and deployment approval.

## Important homepage dependencies

The homepage platform rotator requires:

- `assets/rotor-chatgpt.png`
- `assets/rotor-perplexity.png`
- `assets/rotor-grok.png`
- `assets/rotor-claude.png`

The Google mark is embedded in `index.html`. `assets/rotor-deepseek.png` is also included because the shared `k2d.js` rotor implementation references it.

## Review files

- `COMPILE-MAP.json` maps every compiled page to its selected source.
- `QA-RESULTS.txt` contains the compilation QA.
- `V2-PACKAGE-MANIFEST.json` contains file hashes.
- `V2-QA-RESULTS.txt` contains package-level checks.
