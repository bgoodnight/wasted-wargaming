# Wasted Wargaming

Static GitHub Pages website for Wasted Wargaming.

## Gallery metadata validation

Gallery classification is defined in `assets/data/gallery-taxonomy.json` and documented in `docs/gallery-metadata.md`. After changing gallery items, contributors, or taxonomy data, run:

```text
node scripts/validate-gallery.mjs
```

The validator requires Node.js but no packages, framework, build step, or permanent server. It reports invalid contracts as errors and unused valid taxonomy tags as informational coverage gaps.

## Commander application delivery

The Commander application and confirmation pages are ready, but application delivery is intentionally disabled until a form service is selected.

To connect delivery, add the public HTTPS submission endpoint supplied by the form service to `assets/js/commander-form-config.js`. Do not place a secret key in that browser-side file. Successful submissions are redirected to `commander-thanks.html`.
