# Wasted Wargaming

Static GitHub Pages website for Wasted Wargaming.

## Commander application delivery

The Commander application and confirmation pages are ready, but application delivery is intentionally disabled until a form service is selected.

To connect delivery, add the public HTTPS submission endpoint supplied by the form service to `assets/js/commander-form-config.js`. Do not place a secret key in that browser-side file. Successful submissions are redirected to `commander-thanks.html`.
