# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

malkontenci.pl — a Polish-language comedic "Are you a malcontent?" personality quiz styled as an official diagnosis from a fictional "Krajowa Poradnia Antyfrustracyjna" (KPA). Users answer a fixed set of questions, get a 0-100 frustration score, are assigned one of five archetypes, and receive a server-generated JPG "certificate" (and sometimes a mock hospital referral). Production: https://malkontenci.pl.

## Commands

- `node index.js` — run the server locally (reads `.env` via `process.loadEnvFile()`, defaults to port 8080).
- `npx eslint .` — lint (flat config in `eslint.config.mjs`; tabs, single quotes, no semicolons-off). There is no test suite and no build step.
- `node database/syncIndexes.js` — connects to MongoDB, loads every model in `database/models/`, diffs and syncs their indexes (prints what would be dropped/created). Requires `MONGODB_URL` in `.env`.
- `node services/IndexNow.js` — parses `public/sitemap.xml` and submits all URLs to the IndexNow API in batches of 10,000, using the key file at `public/<key>.txt`. Not part of normal dev workflow; run manually for SEO submissions.
- `npm run m` — bumps all deps with `ncu -u` then installs/updates. `npm run update` — pulls main, `npm ci --omit=dev`, restarts the `mki` PM2 process (production deploy path, see `ecosystem.config.js`).
- Required `.env` vars are documented in `.env.example`: `MONGODB_URL`, `REDIS_HOST`/`REDIS_PASSWD`, `SESSION_SECRET`, `TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY`, `DOMAIN`, `PORT`, `NODE_ENV`.

## Architecture

**Request flow**: `index.js` wires up Express: helmet (CSP disabled), static `public/`, JSON body limit 8kb, morgan logging (skips the uptime-bot UA), global rate limiter (prod only), a 15s timeout handler, then Redis-backed sessions. `routes/Pages.js` renders EJS views (server-rendered shell, no SPA framework); `routes/Api.js` (mounted at `/api/v1`) serves the quiz JSON and handles certificate generation/stats. Errors go through `utils/errors.js`'s `RenderError` (HTML) / `ApiError` (JSON) helpers — always use these instead of ad-hoc `res.status().json()`/`.render()` in routes.

**Anti-abuse pipeline for certificate generation** (the core of `routes/Api.js`): a client must first `POST /api/v1/turnstile` (Cloudflare Turnstile verification, itself gated by a per-IP hour/week Redis counter) before `req.session.testAuthorizedAt` is set. `POST /api/v1/certificate` then requires that session flag to be fresh (`TEST_AUTH_MAX_AGE_MS`), enforces a regenerate cooldown, and re-checks the hour/week limits — unless the request's `key` (ticketNumber:score:nickname) matches the last cached one in the session, in which case it's treated as a free re-render of the same result. Test attempts (score + archetype) are logged to MongoDB (`TestResult`) fire-and-forget, purely for the `/statystyki` aggregate stats endpoint — never PII.

**Scoring/content model** (`utils/questions.js` + `utils/archetypes.js`): each question has 4 answers with raw scores 0-3; `computeScore` sums raw points and rescales to 0-100 (`MAX_SCORE`). `PUBLIC_QUESTIONS` (served to the client) strips the per-answer `s` score so the client never sees point values, only the client picks answer *indices* which the server re-scores from its own source of truth — the client-submitted `answers` array is just indices, never scores. `getArchetype(score)` maps the 0-100 score to one of 5 archetypes in `ARCHETYPES`, each with `diagnosis`/`treatment` copy, an optional `pet` flag (unlocks a bonus branching pet question, see `PET_QUESTION` in `questions.js`) and an optional `referral` flag (top archetype also gets a mock hospital referral document).

**Certificate rendering** (`utils/certificate.js`): pure image generation with `sharp`, no HTML/canvas. Text is rendered by asking `sharp` to rasterize Pango markup (`text: { fontfile, font, ... }`) into PNG buffers, which are then composited onto an SVG-drawn parchment background along with hand-jittered SVG "signature" paths (`SIGNATURE_PATHS`/`PATIENT_PATHS`, randomized per render via `jitterPath`) and a procedurally arc-text seal (`makeSeal`). Static text renders are memoized in `textCache`/`watermarkCache`/`sealPromise` module-level caches since the copy is constant across requests. Output is a JPEG buffer, sent to the client as a base64 data URL — nothing is written to disk.

**Frontend** (`public/js/`, no bundler/framework): `router.js` implements a tiny same-origin SPA-style router — intercepts internal link clicks, fetches page HTML, swaps `<body>` content and syncs specific `<head>` tags (`SYNCED_HEAD`), with an in-memory page cache. Each page registers its init logic via `window.PageRouter.register('<name>', initFn)`; `test.js` is the largest of these and owns the whole quiz lifecycle: fetching questions, shuffling order, saving in-progress answers to `sessionStorage` (`postep`), driving the Turnstile modal, calling `/api/v1/certificate`, and persisting finished certificates to `localStorage` (`certyfikaty`, capped at `MAX_SAVED_CERTS`) so `/moje-certyfikaty` can show history without a server round-trip. `ticket.js` generates/persists a per-browser 4-digit "ticket number" in `localStorage`. Almost all state (nickname, ticket number, certificate history) lives client-side; the server only holds short-lived session data (Turnstile auth flag, cooldown cache) and anonymous aggregate stats.

**Sharing links**: the `?dla=<base64url>` query param on `/` carries a target person's name (encoded in `routes/Pages.js`'s `encodeName`/`decodeName`, decoded again client-side in `test.js` via `fromBase64Url`) so a link can be personalized without server state.
