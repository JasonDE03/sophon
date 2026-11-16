# Sophon

**Read it here: https://sophon.jasonng-1407.workers.dev** ([Tiếng Việt](https://sophon.jasonng-1407.workers.dev/vi/) · [English](https://sophon.jasonng-1407.workers.dev/en/))

The experiments that shaped physics (Những thí nghiệm làm nên vật lý). A bilingual (Vietnamese/English) site that retells the history of physics as interactive episodes. Each episode covers one experiment or discovery and has three parts: the historical context, the people involved, and a simulation the reader drives to redo the experiment.

Plain static HTML with no build step, no backend and no dependencies to install. KaTeX loads from a CDN.

## Run locally

Only needed if you want to edit the site. Simulations are ES modules, so the pages must be served over HTTP. Opening them with `file://` does not work.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Physics checks for the simulation formulas:

```bash
node check.mjs   # prints "ok"
```

## Layout

```
index.html          landing page / language chooser
style.css           shared styles (dark theme)
vi/index.html       Vietnamese contents
vi/NN-<slug>.html   Vietnamese episode
en/index.html       English contents
en/NN-<slug>.html   English episode
sims/<name>.js      one simulation per episode, shared by both languages
check.mjs           assert-based physics checks
```

## Adding an episode

1. Write `sims/<name>.js`. It exports pure physics functions plus `mount(el)`. UI labels go in a `{vi, en}` dictionary chosen by `document.documentElement.lang`.
2. Add asserts for the physics to `check.mjs`, such as limiting cases or known values, and run `node check.mjs`.
3. Copy `vi/01-vat-den.html` as a template and write the Vietnamese page, then the English page. Each page links to its counterpart in the `<nav>`.
4. Turn the "coming soon" line in both `index.html` contents pages into a link, and update the "next episode" link in the previous episode.

## Deploy

The repo is connected to Cloudflare Workers (static assets). Every push to `main` deploys automatically; other branches get preview URLs.
