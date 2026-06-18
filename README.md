# 🐸 NGMI

A satirical NFT mint site — **10,000 procedurally-generated "rugged Pepes," free mint** —
that mocks rug-pull / crypto-Twitter culture by being brutally honest: it tells you to your
face that you're the exit liquidity.

> ⚠️ **This is a parody.** There is no token, no real mint, no wallet connection, and no
> blockchain. Nothing here is a financial product or investment advice. It's an art/comedy
> piece. Don't actually buy NFTs from anonymous frogs who promise to rug you.

## Run it

### Full version — real X OAuth (recommended)

```bash
cd exit-liquidity
npm install
cp .env.example .env          # then fill in your X credentials (see below)
npm start                     # → http://localhost:5173
```

The Node server (`server.js`) serves the site **and** runs the real X (Twitter) OAuth 2.0
login for the whitelist gate.

### Quick look — static only (login is mocked)

No backend needed; the whitelist login falls back to a typed-handle demo:

```
double-click index.html      (or:  python -m http.server 5173)
```

## Setting up X OAuth 2.0

1. Go to <https://developer.x.com> → create a Project + App.
2. Open the app's **User authentication settings** and set:
   - **App type:** `Web App, Automated App or Bot` (a *confidential* client)
   - **App permissions:** `Read`
   - **Callback URI / Redirect URL:** `http://localhost:5173/auth/x/callback` (must match exactly)
   - **Website URL:** `http://localhost:5173`
3. Copy the **OAuth 2.0 Client ID** and **Client Secret**.
4. `cp .env.example .env` and paste them into `X_CLIENT_ID` / `X_CLIENT_SECRET`.
   Generate a session secret with
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
5. `npm start`. On boot it prints `X OAuth: configured ✅`.

**The flow:** `Begin Initiation` → **Sign in with X** redirects to `/auth/x/login` → server
generates PKCE + state, bounces you to X → you authorize → X calls `/auth/x/callback` → server
exchanges the code for a token (Basic auth, confidential client), reads your handle from
`GET /2/users/me`, stores it in the session, and returns you to `/?wl=1` → the modal resumes at
**step 2 (confession)** with your real `@handle`. Submitting the burn saves the application (one
spot per X account) to **Neon Postgres** if `DATABASE_URL` is set, else `data/whitelist.json`.
No wallet, no keys, ever.

## Storage (Neon Postgres)

Whitelist applications are stored in **Neon** (serverless Postgres) via the
`@neondatabase/serverless` driver — it talks to Neon over **HTTPS**, so no raw `5432` port is
needed (works on locked-down/serverless hosts). Set the connection string in `.env`:

```
DATABASE_URL=postgresql://<user>:<pass>@<host>-pooler.<region>.aws.neon.tech/neondb?sslmode=require
```

On boot the server runs `CREATE TABLE IF NOT EXISTS whitelist (...)`, so there's nothing to
migrate. Each submission is an **upsert keyed on the X user id** (re-applying updates the same
row and keeps the original `spot`). Columns: `spot, user_id, handle, name, lost_usd, cope,
nft_ath, chain_id, approval, burn_count, burns (jsonb), created_at, updated_at`. The live
`WL CLAIMED` counter and the returned `spot` both come from this table.
**Leave `DATABASE_URL` blank** and it transparently falls back to the local JSON file.

**Going to production:** put it behind HTTPS, set `COOKIE_SECURE=true`, swap the callback URL +
`X_CALLBACK_URL` to your real domain (and register it on X), and replace `express-session`'s
in-memory session store (dev-only) with a persistent one (e.g. `connect-pg-simple` on the same
Neon DB, or Redis).

## What's inside

| File | What it does |
|------|--------------|
| `index.html` | Page structure — hero/mint, manifesto, gallery, whitelist, roadmap, FAQ |
| `styles.css` | White-theme design system (CSS variables, fully responsive, reduced-motion safe) |
| `app.js`    | Procedural Pepe SVG generator, OpenSea mint links, whitelist initiation flow |
| `server.js` | Express server: serves the site + real X OAuth 2.0 PKCE + whitelist storage |
| `.env.example` | Copy to `.env` and add your X OAuth credentials |

### The whitelist "initiation" flow (the centerpiece)
`Begin Initiation` →
1. **Login with 𝕏** — real OAuth 2.0 when the server runs (mock typed-handle as a static fallback)
2. **Confess your losses** — how much the last project rugged you for, and what you'll *claim*
   you'll do before we rug you too
3. **Burn a real rugged NFT, LIVE on-chain** — connect a wallet (MetaMask / any injected
   EIP-1193 wallet), paste the **contract + token ID** of the NFT that actually rugged you and
   its **ATH**. We verify ownership on-chain (`ownerOf`), read the collection's `name()`, then
   send `transferFrom(you → 0x…dEaD)` — a real burn to the dead address — and **watch the receipt
   confirm live** (with an explorer link). On confirmation: flames + a full-screen
   `YOU GOT FUCKED BY <project>` flash. No wallet installed → demo mode runs the same theatre
   without a transaction.
4. **You're whitelisted** — receipt shows the burn tx + WL spot, with a "post my shame to X" button

> ⚠️ The burn is a **real, irreversible** ERC-721 transfer to the dead address. Only the
> connected owner can burn their own token, and ownership is checked on-chain before the tx.
> This is parody — don't burn anything you aren't genuinely fine losing forever.

### The art
Every Pepe is generated deterministically from its token id (seeded PRNG) as inline SVG —
sad/dead/cope/shock moods, tinfoil hats, knives in the back, tears, a permanent red downtrend
chart in the background, and a `-$amount rugged` watermark. Click **Pull another file** in the
Evidence section to roll a fresh victim.

## Project name options (theme: degen / rug-pull satire)

Building with **NGMI** by default — iconic CT term, short, reads as a logo and a hashtag, while
**"you are the exit liquidity"** stays as the concept/tagline underneath. Swap the name in one
line at the top of `app.js` (`const BRAND = { name: ... }`):

- **NGMI** ✅ (current) — Not Gonna Make It
- **EXIT LIQUIDITY** — you are the product (now the tagline)
- **RUGGED PEPE** — does what it says on the tin
- **$REKT** — short, ticker-ready
- **FLOORLESS** — there is no floor
- **JEET PEPE** — for the paper-handed

## Minting & X login (architecture)

- **No wallet connect on this site.** The actual free mint lives on **OpenSea** — every "Mint"
  button (nav, hero, bottom CTA, whitelist-success) is an outbound link to `BRAND.opensea`.
  Set your collection URL in one place: `BRAND.opensea` at the top of `app.js`.
- **X (Twitter) OAuth 2.0 (PKCE)** is the only auth on the site, and only as the whitelist gate.
  It's **real** and runs server-side in `server.js` — see "Setting up X OAuth 2.0" above. When the
  site is opened as a plain static file (no server), step 1 gracefully degrades to a typed-handle
  demo so you can still click through the flow.

## Customizing

- **Name / supply / max-per-wallet / OpenSea URL:** `BRAND` object at the top of `app.js`.
- **Copy/tone:** all text lives in `index.html` and the `FAQ` / ticker / modal strings in `app.js`.
- **Colors:** the `:root` CSS variables in `styles.css` (`--pepe`, `--rug`, `--ink`, …).
