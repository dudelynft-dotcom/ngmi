/* ============================================================
   NGMI — server
   - Serves the static site (index.html / styles.css / app.js)
   - Real X (Twitter) OAuth 2.0 Authorization Code + PKCE flow
   - Stores whitelist applications to ./data/whitelist.json
   Run:  npm install && npm start   (after copying .env.example -> .env)
   ============================================================ */

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const cookieSession = require("cookie-session"); // serverless-safe (no memory store)

const {
  X_CLIENT_ID,
  X_CLIENT_SECRET,
  X_CALLBACK_URL = "http://localhost:5173/auth/x/callback",
  X_SCOPES = "users.read tweet.read",
  PORT = 5173,
  SESSION_SECRET = "dev_insecure_secret_change_me",
  COOKIE_SECURE = "false",
} = process.env;

const X_CONFIGURED = Boolean(X_CLIENT_ID && X_CLIENT_SECRET);
if (!X_CONFIGURED) {
  console.warn(
    "\n⚠  X OAuth is NOT configured — set X_CLIENT_ID and X_CLIENT_SECRET in .env.\n" +
    "   The site still runs; the login button will report it's not wired up yet.\n"
  );
}

const AUTHORIZE_URL = "https://twitter.com/i/oauth2/authorize";
const TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const ME_URL = "https://api.twitter.com/2/users/me?user.fields=profile_image_url,username,name";

const DATA_DIR = path.join(__dirname, "data");
const WL_FILE = path.join(DATA_DIR, "whitelist.json");
// On serverless (Vercel) the filesystem is read-only - the JSON fallback just won't be used there
// (Neon is reachable from Vercel), so don't crash if we can't create the dir.
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}

/* ----------------------------- helpers ----------------------------- */
const b64url = (buf) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function pkce() {
  const verifier = b64url(crypto.randomBytes(32));
  const challenge = b64url(crypto.createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

function readWhitelist() {
  try { return JSON.parse(fs.readFileSync(WL_FILE, "utf8")); }
  catch { return []; }
}
function writeWhitelist(list) {
  fs.writeFileSync(WL_FILE, JSON.stringify(list, null, 2));
}
// Map a file-stored entry (camelCase) to the same shape the Neon queries return (snake_case).
function fileEntryToApi(e) {
  if (!e) return null;
  return {
    spot: e.spot, handle: e.handle, name: e.name,
    lost_usd: e.lostUsd, cope: e.cope, nft_ath: e.nftAth,
    approval: e.approval, status: e.status || "pending",
    burn_count: e.burnCount, burns: e.burns || [], chain_id: e.chainId,
    shame_tweet: e.shameTweet || null, ts: 0,
  };
}

/* ----------------------------- Neon Postgres ----------------------------- */
// If DATABASE_URL is set we store the whitelist in Neon (over HTTPS, via the
// serverless driver — no raw 5432 needed); otherwise we use the JSON file.
const { neon } = require("@neondatabase/serverless");
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

// Race a DB call against a short timeout so a slow/unreachable Neon falls back to
// the JSON file fast instead of hanging the request.
const DB_TIMEOUT_MS = Number(process.env.DB_TIMEOUT_MS) || 8000;
function dbTry(fn, ms = DB_TIMEOUT_MS) {
  return Promise.race([
    fn(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("db timeout " + ms + "ms")), ms)),
  ]);
}
// Timeout-guarded tagged template: use `tsql` exactly like `sql`, but it rejects fast
// if Neon is slow/unreachable so handlers can fall back to the JSON file.
const tsql = sql ? (strings, ...values) => dbTry(() => sql(strings, ...values)) : null;

// Circuit breaker: after a Neon failure, skip it for 30s so requests don't each eat the timeout.
let neonDownUntil = 0;
const neonUp = () => Boolean(tsql) && Date.now() >= neonDownUntil;
function neonFailed(e) {
  neonDownUntil = Date.now() + 8000;
  console.error("Neon unavailable -> using JSON file for 8s:", e && e.message);
}

// Read from Neon with one retry before giving up (absorbs cold-start blips so we never
// serve a false-empty fallback when the data actually lives in Neon).
async function neonRead(fn) {
  try { return await dbTry(fn); }
  catch (e1) { return await dbTry(fn); }   // one retry; throws to caller if it also fails
}

async function initDb() {
  if (!sql) { console.log("   Storage: data/whitelist.json (set DATABASE_URL for Neon)"); return; }
  await tsql`CREATE TABLE IF NOT EXISTS whitelist (
    spot SERIAL UNIQUE, user_id TEXT PRIMARY KEY, handle TEXT, name TEXT,
    lost_usd TEXT, cope TEXT, nft_ath TEXT, chain_id TEXT,
    approval INTEGER DEFAULT 0, burn_count INTEGER DEFAULT 0, burns JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
  )`;
  await tsql`ALTER TABLE whitelist ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'`;
  await tsql`ALTER TABLE whitelist ADD COLUMN IF NOT EXISTS shame_tweet TEXT`;
  console.log("   Storage: Neon Postgres ✅");
}

/* ----------------------------- Approval scoring ----------------------------- */
// Higher ATH = harder rug = MORE likely to want another one = higher odds.
// Each burned NFT multiplies the tier. Need 100% for instant WL; else pending.
const ETH_USD = Number(process.env.ETH_USD_APPROX) || 3000;
function athToUsd(text) {
  if (!text) return 0;
  const str = String(text).toLowerCase();
  const num = parseFloat(str.replace(/[^0-9.]/g, ""));
  if (!isFinite(num) || num <= 0) return 0;
  return /eth|ether|Ξ|ξ/.test(str) ? num * ETH_USD : num; // assume USD unless ETH stated
}
function tierPoints(athUsd) {
  if (athUsd >= 50) return 50; // 2 bags = instant
  if (athUsd >= 30) return 34; // 3 bags = instant
  if (athUsd > 0) return 20;   // 5 bags = instant
  return 10;                    // burned something nameless = grind
}
function scoreApplication(burnCount, athUsd) {
  if (burnCount <= 0) return 0;
  return Math.min(100, tierPoints(athUsd) * burnCount);
}

const isTweetUrl = (u) => /^https?:\/\/(www\.)?(twitter|x)\.com\/[A-Za-z0-9_]{1,15}\/status\/\d+/i.test(String(u || "").trim());

const ADMIN_TOKEN = (process.env.ADMIN_TOKEN || "").trim();
const adminOk = (req) =>
  ADMIN_TOKEN && (req.get("x-admin-token") === ADMIN_TOKEN || req.query.token === ADMIN_TOKEN);

/* ----------------------------- app ----------------------------- */
const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "32kb" }));
app.use(
  cookieSession({
    name: "ngmi.sid",
    keys: [SESSION_SECRET],
    httpOnly: true,
    sameSite: "lax", // allows the cookie to survive the top-level redirect back from X
    secure: COOKIE_SECURE === "true",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })
);

/* --- 1. Kick off the OAuth dance -------------------------------- */
app.get("/auth/x/login", (req, res) => {
  if (!X_CONFIGURED) return res.redirect("/apply?x=unconfigured#wl");

  const { verifier, challenge } = pkce();
  const state = b64url(crypto.randomBytes(16));
  req.session.oauth = { verifier, state };

  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", X_CLIENT_ID);
  url.searchParams.set("redirect_uri", X_CALLBACK_URL);
  url.searchParams.set("scope", X_SCOPES);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  res.redirect(url.toString());
});

/* --- 2. Handle the callback from X ------------------------------ */
app.get("/auth/x/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const saved = req.session.oauth;

  if (error) return res.redirect("/apply?x=denied#wl");
  if (!saved || !code || state !== saved.state) {
    return res.redirect("/apply?x=badstate#wl");
  }

  try {
    // Exchange authorization code for an access token (confidential client => Basic auth)
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: String(code),
      redirect_uri: X_CALLBACK_URL,
      code_verifier: saved.verifier,
      client_id: X_CLIENT_ID,
    });
    const basic = Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString("base64");

    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body,
    });
    if (!tokenRes.ok) {
      console.error("Token exchange failed:", tokenRes.status, await tokenRes.text());
      return res.redirect("/apply?x=tokenfail#wl");
    }
    const token = await tokenRes.json();

    // Fetch the verified user
    const meRes = await fetch(ME_URL, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!meRes.ok) {
      console.error("users/me failed:", meRes.status, await meRes.text());
      return res.redirect("/apply?x=mefail#wl");
    }
    const me = (await meRes.json()).data;

    delete req.session.oauth;
    req.session.user = {
      id: me.id,
      username: me.username,
      name: me.name,
      avatar: me.profile_image_url || null,
    };
    res.redirect("/apply#wl");
  } catch (e) {
    console.error("OAuth callback error:", e);
    res.redirect("/apply?x=error#wl");
  }
});

/* --- 3. Session helpers ---------------------------------------- */
app.get("/auth/me", (req, res) => {
  res.json({ configured: X_CONFIGURED, user: req.session.user || null });
});

app.post("/auth/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

/* --- 3a. The logged-in user's own application (if any) --------- */
app.get("/api/whitelist/me", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const user = req.session.user;
  if (!user) return res.status(401).json({ ok: false, error: "Login first." });
  if (neonUp()) {
    try {
      const rows = await neonRead(() => sql`
        SELECT spot, handle, lost_usd, cope, nft_ath, approval, status, burn_count, burns, chain_id, shame_tweet,
               extract(epoch from updated_at)::bigint AS ts
        FROM whitelist WHERE user_id = ${user.id} LIMIT 1`);
      return res.json({ ok: true, application: rows[0] || null });
    } catch (e) { neonFailed(e); }
  }
  const list = readWhitelist();
  if (sql && list.length === 0) return res.status(503).json({ ok: false, warming: true, error: "Database warming up." });
  const row = list.find((e) => e.userId === user.id) || null;
  res.json({ ok: true, application: fileEntryToApi(row) });
});

/* --- 3b. Public whitelist count (for the live counter) --------- */
app.get("/api/whitelist/count", async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (neonUp()) {
    try {
      const rows = await neonRead(() => sql`SELECT count(*)::int AS n FROM whitelist`);
      return res.json({ count: rows[0].n, supply: 10000 });
    } catch (e) { neonFailed(e); }
  }
  // Neon is the store but unreachable + no local file data => warming up, not "0".
  const list = readWhitelist();
  if (sql && list.length === 0) return res.status(503).json({ warming: true, supply: 10000 });
  res.json({ count: list.length, supply: 10000 });
});

/* --- 3d. Public ruglist: every NFT burned, by whom -------------- */
app.get("/api/ruglist", async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (neonUp()) {
    try {
      const rows = await neonRead(() => sql`
        SELECT handle,
               b->>'projectName' AS collection,
               b->>'tokenId'     AS token_id,
               b->>'contract'    AS contract,
               b->>'tx'          AS tx,
               chain_id,
               extract(epoch from updated_at)::bigint AS ts
        FROM whitelist, jsonb_array_elements(burns) AS b
        ORDER BY updated_at DESC
        LIMIT 500`);
      return res.json({ ok: true, count: rows.length, rows });
    } catch (e) { neonFailed(e); }
  }
  const list = readWhitelist();
  if (sql && list.length === 0) return res.status(503).json({ ok: false, warming: true, error: "Database warming up." });
  const rows = [];
  for (const e of list) for (const b of (e.burns || [])) {
    rows.push({ handle: e.handle, collection: b.projectName, token_id: b.tokenId, contract: b.contract, tx: b.tx, chain_id: e.chainId, ts: 0 });
  }
  rows.reverse();
  res.json({ ok: true, count: rows.length, rows: rows.slice(0, 500) });
});

/* --- 3c. Detect a wallet's NFTs via Alchemy (optional) --------- */
const ALCHEMY_NETWORKS = {
  // mainnets
  "0x1": "eth-mainnet", "0x89": "polygon-mainnet", "0x2105": "base-mainnet",
  "0xa": "opt-mainnet", "0xa4b1": "arb-mainnet",
  // testnets (handy while testing burns)
  "0xaa36a7": "eth-sepolia", "0x14a34": "base-sepolia", "0x66eee": "arb-sepolia",
  "0xaa37dc": "opt-sepolia", "0x13882": "polygon-amoy",
};
// Accept either the bare app key OR a full Alchemy URL pasted into the env var.
const ALCHEMY_KEY = (() => {
  const raw = (process.env.ALCHEMY_API_KEY || "").trim();
  if (!raw) return "";
  return raw.includes("/") ? raw.replace(/\/+$/, "").split("/").pop() : raw;
})();

app.get("/api/nfts", async (req, res) => {
  const key = ALCHEMY_KEY;
  if (!key) return res.json({ configured: false, nfts: [] });

  const address = String(req.query.address || "");
  const chainId = String(req.query.chainId || "0x1");
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return res.status(400).json({ configured: true, error: "bad address", nfts: [] });

  const net = ALCHEMY_NETWORKS[chainId];
  if (!net) return res.json({ configured: true, unsupportedChain: true, nfts: [] });

  try {
    const url = `https://${net}.g.alchemy.com/nft/v3/${key}/getNFTsForOwner?owner=${address}&withMetadata=true&pageSize=100&excludeFilters%5B%5D=SPAM`;
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ configured: true, error: "alchemy " + r.status, nfts: [] });
    const data = await r.json();
    const nfts = (data.ownedNfts || [])
      .filter((n) => (n.tokenType || n.contract?.tokenType) === "ERC721")
      .map((n) => ({
        contract: n.contract?.address,
        tokenId: n.tokenId,
        name: n.name || `${n.contract?.name || "NFT"} #${n.tokenId}`,
        collection: n.contract?.openSeaMetadata?.collectionName || n.contract?.name || "Unknown collection",
        image: n.image?.thumbnailUrl || n.image?.cachedUrl || n.contract?.openSeaMetadata?.imageUrl || "",
        floor: n.contract?.openSeaMetadata?.floorPrice ?? null,
      }))
      .filter((n) => n.contract && n.tokenId != null)
      .slice(0, 60);
    res.json({ configured: true, nfts });
  } catch (e) {
    console.error("nfts error", e);
    res.status(500).json({ configured: true, error: "failed", nfts: [] });
  }
});

/* --- 4. Whitelist submission (requires X login) ---------------- */
app.post("/api/whitelist", async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ ok: false, error: "Login with X first." });

  const { lostUsd, cope, nftAth, chainId, burns, shameTweet } = req.body || {};

  // Mandatory shame: no valid public tweet link, no application.
  if (!isTweetUrl(shameTweet)) {
    return res.status(400).json({ ok: false, error: "A valid public X (shame tweet) link is required." });
  }
  const shame = String(shameTweet).trim().slice(0, 200);

  const s = (v, n) => String(v || "").slice(0, n);
  const cleanBurns = Array.isArray(burns)
    ? burns.slice(0, 20).map((b) => ({
        projectName: s(b && b.projectName, 128),
        contract: s(b && b.contract, 64),
        tokenId: s(b && b.tokenId, 80),
        tx: s(b && b.tx, 80),
      }))
    : [];

  // Score is the applicant's "case strength" shown to the admin. NOTHING auto-approves:
  // every application is created as pending and an admin decides each one manually.
  const athUsd = athToUsd(nftAth);
  const appr = scoreApplication(cleanBurns.length, athUsd);
  const status = "pending";

  // Try Neon first; on ANY db error fall back to the local JSON file so nothing is ever lost.
  if (neonUp()) {
    try {
      const burnsJson = JSON.stringify(cleanBurns);
      const rows = await tsql`
        INSERT INTO whitelist (user_id, handle, name, lost_usd, cope, nft_ath, chain_id, approval, burn_count, burns, status, shame_tweet)
        VALUES (${user.id}, ${"@" + user.username}, ${user.name}, ${s(lostUsd, 64)}, ${s(cope, 256)},
                ${s(nftAth, 64)}, ${s(chainId, 16)}, ${appr}, ${cleanBurns.length}, ${burnsJson}::jsonb, ${status}, ${shame})
        ON CONFLICT (user_id) DO UPDATE SET
          handle = EXCLUDED.handle, name = EXCLUDED.name, lost_usd = EXCLUDED.lost_usd,
          cope = EXCLUDED.cope, nft_ath = EXCLUDED.nft_ath, chain_id = EXCLUDED.chain_id,
          approval = EXCLUDED.approval, burn_count = EXCLUDED.burn_count, burns = EXCLUDED.burns,
          status = EXCLUDED.status, shame_tweet = EXCLUDED.shame_tweet, updated_at = now()
        RETURNING spot`;
      const totalRows = await tsql`SELECT count(*)::int AS n FROM whitelist`;
      return res.json({ ok: true, spot: rows[0].spot, total: totalRows[0].n, approval: appr, status, athUsd, store: "neon" });
    } catch (e) {
      neonFailed(e);
    }
  }

  try {
    const list = readWhitelist();
    const existing = list.find((e) => e.userId === user.id);
    const entry = {
      spot: existing ? existing.spot : list.length + 1,
      userId: user.id, handle: "@" + user.username, name: user.name,
      lostUsd: s(lostUsd, 64), cope: s(cope, 256), nftAth: s(nftAth, 64),
      chainId: s(chainId, 16), approval: appr, burnCount: cleanBurns.length,
      burns: cleanBurns, status, shameTweet: shame, ts: new Date().toISOString(),
    };
    if (existing) Object.assign(existing, entry); else list.push(entry);
    writeWhitelist(list);
    res.json({ ok: true, spot: entry.spot, total: list.length, approval: appr, status, athUsd, store: "file" });
  } catch (e) {
    console.error("whitelist file write error", e);
    res.status(500).json({ ok: false, error: "storage error" });
  }
});

/* --- 4b. Admin: review + approve pending applications ---------- */
app.get("/api/admin/list", async (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ ok: false, error: "Bad or missing admin token." });
  if (neonUp()) {
    try {
      const rows = await tsql`
        SELECT spot, handle, name, lost_usd, cope, nft_ath, approval, status, burn_count, burns, chain_id, shame_tweet,
               extract(epoch from created_at)::bigint AS ts
        FROM whitelist ORDER BY (status='pending') DESC, created_at DESC LIMIT 500`;
      return res.json({ ok: true, rows });
    } catch (e) { neonFailed(e); }
  }
  const rows = readWhitelist().map(fileEntryToApi)
    .sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1));
  res.json({ ok: true, rows });
});

app.post("/api/admin/decide", async (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ ok: false, error: "Bad token." });
  const spot = Number((req.body || {}).spot);
  const decision = (req.body || {}).decision === "reject" ? "rejected" : "approved";
  if (!Number.isInteger(spot)) return res.status(400).json({ ok: false, error: "bad spot" });
  if (neonUp()) {
    try {
      await tsql`UPDATE whitelist SET status=${decision}, updated_at=now() WHERE spot=${spot}`;
      return res.json({ ok: true, spot, status: decision });
    } catch (e) { neonFailed(e); }
  }
  const list = readWhitelist();
  const row = list.find((e) => e.spot === spot);
  if (row) { row.status = decision; writeWhitelist(list); }
  res.json({ ok: true, spot, status: decision });
});

/* --- 5. Static site -------------------------------------------- */
app.use(
  express.static(__dirname, {
    extensions: ["html"],
    etag: false,
    lastModified: false,
    cacheControl: false,
    setHeaders: (res, p) => {
      // never cache the .env / data even if mis-referenced
      if (p.includes(".env") || p.includes(`${path.sep}data${path.sep}`)) res.status(403);
      // dev: never cache html/css/js so design edits show on plain refresh
      if (/\.(html|css|js)$/i.test(p)) res.setHeader("Cache-Control", "no-store, must-revalidate");
    },
  })
);

/* --- 5b. Clean-URL homepage sections -> serve the homepage ------ */
app.get(["/manifesto", "/collection", "/receipts", "/roadmap", "/faq", "/whitelist"], (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "index.html"));
});

// Ensure the table exists (idempotent). Runs on local boot and on each serverless cold start.
initDb().catch((e) => neonFailed(e));

// Local dev: run a real server. On Vercel, @vercel/node imports the exported app instead.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🐸 NGMI running → http://localhost:${PORT}`);
    console.log(`   X OAuth: ${X_CONFIGURED ? "configured ✅" : "NOT configured ⚠"}`);
    console.log(`   Callback: ${X_CALLBACK_URL}\n`);
  });
}

module.exports = app;
