# Sophon

**Read it here: https://sophon.jasonng-1407.workers.dev** ([Tiếng Việt](https://sophon.jasonng-1407.workers.dev/vi/) · [English](https://sophon.jasonng-1407.workers.dev/en/))

The experiments that shaped physics (Những thí nghiệm làm nên vật lý). A bilingual (Vietnamese/English) site that retells the history of physics as interactive episodes. Each episode covers one experiment or discovery and has three parts: the historical context, the people involved, and a simulation the reader drives to redo the experiment.

Plain static HTML with no build step or dependencies to install, plus a tiny Cloudflare Worker for comments. KaTeX loads from a CDN.

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

## Comments

Public comments appear immediately, shared by Vietnamese and English pages for each episode. Anyone can reply to a top-level comment; replies appear indented, oldest first. Replies to replies attach to the same top-level parent. The Reply button moves the single form under that thread; Cancel returns it to the bottom. A name and message are enough; no login is needed. Turnstile verifies submissions and D1 limits each salted IP hash to five comments per ten minutes. Raw IP addresses are never stored in D1. The unlinked `/admin` page lists the latest 200 comments, marks replies and authors, and lets the owner delete comments using an admin token. Deleting a top-level comment also deletes its replies.

For the existing live database, run this migration yourself before deploying the updated Worker (existing comments keep `parent_id = NULL` and `is_author = 0`):

```bash
npx wrangler d1 execute sophon-comments --remote --file=migrations/0001_replies_author.sql
```

Fresh databases use the updated `schema.sql` below; do not also run the migration on a fresh database.

To post as the author, open `/admin`, enter a valid admin token, and check “Ghi nhớ trên trình duyệt này để bình luận với tư cách tác giả”. After validation, this saves the token in this browser's localStorage under `sophon-author`. Episode comment forms then show an author note and skip Turnstile. Only comment POST requests send the saved token, as `Authorization: Bearer <ADMIN_TOKEN>`; public GET requests never send it. The server alone sets the verified “✓ Tác giả” / “✓ Author” badge and skips the rate limit for valid author posts. An expired or invalid saved token is removed after a 401, and the form returns to Turnstile with the draft preserved. Use “Quên trên trình duyệt này” on `/admin` to remove the saved author token.

One-time Cloudflare setup (run these yourself):

```bash
npx wrangler d1 create sophon-comments
# Paste the returned database_id into wrangler.jsonc, replacing REPLACE_WITH_D1_ID.
npx wrangler d1 execute sophon-comments --remote --file=schema.sql
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put IP_SALT
npx wrangler secret put ADMIN_TOKEN
```

Use a long random value for each of `IP_SALT` and `ADMIN_TOKEN`. Create a Turnstile widget for the site hostname, put its real secret in `TURNSTILE_SECRET`, and replace `TURNSTILE_SITE_KEY` in `wrangler.jsonc` with its public site key. The committed site key is a production key; override it locally with the test key below. Workers Builds continues to run `npx wrangler deploy` with the committed config, preserving pretty episode URLs.

For a full local preview, create a gitignored `.dev.vars` file:

```dotenv
TURNSTILE_SECRET=1x0000000000000000000000000000000AA
IP_SALT=local-test-salt
ADMIN_TOKEN=local-test-admin-token
```

Add `TURNSTILE_SITE_KEY=1x00000000000000000000AA` to `.dev.vars` to override the production key locally, then run:

```bash
npx wrangler d1 execute sophon-comments --local --file=schema.sql
npx wrangler dev
# Open http://localhost:8787/vi/04-bohr and http://localhost:8787/admin
```

Local D1 is separate from the remote database; these commands need no Cloudflare login. The test token `XXXX.DUMMY.TOKEN.XXXX` also works for direct POST requests with the test secret. `python3 -m http.server 8000` still previews the site; comments show a deployed-site-only note there. Worker source, config, schema, migrations, Markdown docs, tools, and local secrets are excluded from deployed static assets by `.assetsignore`.
