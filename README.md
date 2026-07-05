# Nunez & Sons Plumbing — Website

Static marketing site for **Nunez & Sons Plumbing**, a commercial and residential
plumbing company serving Los Angeles County and Ventura County.

Vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

**Live site:** https://mathias1-creator.github.io/Nunez-and-sons/

## Layout

```
nunez-sons-plumbing/     <- the entire site (deployable as-is)
├── index.html           Home
├── commercial.html      Commercial services (flagship)
├── residential.html     Residential services
├── gallery.html         Our Work (placeholder photos + lightbox)
├── contact.html         Call / text / email (no contact form)
├── styles.css           Single stylesheet
└── script.js            Single script (header, nav, reveals, counters, lightbox)
```

## Preview locally

```bash
python3 -m http.server 8000 --directory nunez-sons-plumbing
# then open http://localhost:8000
```

## Deploying

### GitHub Pages (automatic)

`.github/workflows/deploy-pages.yml` publishes the `nunez-sons-plumbing/`
folder to GitHub Pages on every push to `main`.

**One-time setup:** if the first workflow run fails at the "Setup Pages" step
with a 403 error, GitHub would not let the workflow enable Pages on its own.
Fix: **Settings → Pages → Build and deployment → Source: "GitHub Actions"**,
then re-run the failed workflow. Every push after that deploys automatically.
(Note: on a GitHub Free plan, Pages requires the repository to be public.)

### Netlify (drag and drop)

Drag the `nunez-sons-plumbing/` folder onto https://app.netlify.com/drop.
All links are relative, so the site works at any domain or subpath. If the
site moves to a custom domain, update the `og:url` / `rel="canonical"` values
in each page's `<head>`.

## Notes

- Gallery images are placeholders from picsum.photos — swap in real project
  photos (keep the same dimensions: 800×600 thumbnails, 1600×1200 full size).
- Contact is click-to-call / click-to-text / email only, by design. No form.
