/* =========================================================
   NGMI - front-end logic (no build step, no deps)
   - Procedural "rugged Pepe" SVG generator
   - Mock mint counter
   - Whitelist initiation flow: X login → confession → live burn → WL
   NOTE: This is a parody. No real wallet, chain, or mint is touched.
   ========================================================= */

/* -----------------------------------------------------------
   BRAND CONFIG - change the project name in ONE place.
   Suggested alternatives (all on-theme):
     "NGMI" · "EXIT LIQUIDITY" · "RUGGED PEPE" · "$REKT" · "FLOORLESS" · "JEET PEPE"
   ----------------------------------------------------------- */
const BRAND = {
  name: "NGMI",
  supply: 10000,
  maxPerWallet: 5,
  // Minting happens on OpenSea, NOT on this site. No wallet connect here.
  // Drop your collection URL in here and every "Mint" button points to it.
  opensea: "https://opensea.io/collection/ngmi",
};

/* Runtime auth state, filled in by checkAuth() on boot.
   backend=true  → the Node server (server.js) is serving us, real X OAuth is available.
   backend=false → opened as a static file / dumb static host → fall back to the mock login. */
const APP = { backend: false, configured: false, user: null };

/* ----------------------------- tiny utils ----------------------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
// seeded PRNG so each token id is deterministic & reproducible
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

/* ----------------------------- PEPE GENERATOR ----------------------------- */
// Trait pools - everything is some flavour of financially ruined.
const SKINS = ["#6bbf3f", "#7cc94e", "#5aa632", "#86c98f", "#9bd17f"];
const BG = ["#f3f5f7", "#eef2ec", "#fdeeee", "#eef1f8", "#f6f1e9", "#f0f0f3"];
const MOODS = ["sob", "dead", "cope", "shock", "thousand-yard"];
const HATS = ["none", "none", "cap", "tinfoil", "bag", "crown"];
const EXTRAS = ["none", "knife", "tears", "rope", "none"];
const PL_LABELS = [
  "rugged at ATH", "down 99.4%", "exit liquidity", "bag holder", "floor at zero",
  "minted at the top", "still coping", "house = gone", "wife left", "art never revealed"
];

function buildPepe(id, size = 320) {
  const r = rng(id * 2654435761);
  const skin = pick(r, SKINS);
  const bg = pick(r, BG);
  const mood = pick(r, MOODS);
  const hat = pick(r, HATS);
  const extra = pick(r, EXTRAS);
  const drop = (98 + r() * 1.9).toFixed(1); // % the floor is down

  // mouth path by mood
  const mouths = {
    sob:   `<path d="M120 218 Q160 250 200 218" fill="none" stroke="#2b3a1c" stroke-width="7" stroke-linecap="round"/>`,
    dead:  `<path d="M122 226 H198" stroke="#2b3a1c" stroke-width="7" stroke-linecap="round"/>`,
    cope:  `<path d="M120 224 Q160 236 200 224" fill="none" stroke="#2b3a1c" stroke-width="6" stroke-linecap="round"/>`,
    shock: `<ellipse cx="160" cy="226" rx="20" ry="26" fill="#2b3a1c"/>`,
    "thousand-yard": `<path d="M124 224 Q160 228 196 224" fill="none" stroke="#2b3a1c" stroke-width="6" stroke-linecap="round"/>`,
  };
  // eyes - sad pepe big eyes, pupils drift down
  const deadEyes = mood === "dead"
    ? `<path d="M104 150 l24 24 M128 150 l-24 24" stroke="#2b3a1c" stroke-width="6" stroke-linecap="round"/>
       <path d="M192 150 l24 24 M216 150 l-24 24" stroke="#2b3a1c" stroke-width="6" stroke-linecap="round"/>`
    : `<circle cx="116" cy="162" r="30" fill="#fff" stroke="#2b3a1c" stroke-width="4"/>
       <circle cx="204" cy="162" r="30" fill="#fff" stroke="#2b3a1c" stroke-width="4"/>
       <circle cx="116" cy="${mood==='shock'?168:174}" r="${mood==='shock'?7:11}" fill="#10180a"/>
       <circle cx="204" cy="${mood==='shock'?168:174}" r="${mood==='shock'?7:11}" fill="#10180a"/>
       ${mood!=='shock' ? `<path d="M92 142 Q116 132 140 142" stroke="#2b3a1c" stroke-width="4" fill="none" stroke-linecap="round"/>
       <path d="M180 142 Q204 132 228 142" stroke="#2b3a1c" stroke-width="4" fill="none" stroke-linecap="round"/>`:''}`;

  const tears = (mood === "sob" || extra === "tears")
    ? `<path d="M108 188 q-6 26 4 40 q10 -14 4 -40 z" fill="#5db4ff" opacity=".85"/>
       <path d="M212 188 q6 26 -4 40 q-10 -14 -4 -40 z" fill="#5db4ff" opacity=".85"/>` : "";

  const hats = {
    none: "",
    cap: `<path d="M92 96 q68 -46 136 0 l0 10 q-68 -22 -136 0 z" fill="#1d1d1f"/><rect x="84" y="104" width="120" height="12" rx="6" fill="#1d1d1f"/>`,
    tinfoil: `<path d="M96 100 l16 -34 l14 22 l18 -30 l16 28 l16 -22 l14 30 l18 -16 l-2 24 q-66 -16 -126 0 z" fill="#cfd3d8" stroke="#9aa0a8" stroke-width="2"/>`,
    bag: `<path d="M104 86 q56 -30 112 0 l-10 26 q-46 -16 -92 0 z" fill="#e8c98a" stroke="#caa85f" stroke-width="2"/><text x="160" y="80" font-size="20" text-anchor="middle" fill="#7a5b1d" font-family="monospace">$0</text>`,
    crown: `<path d="M108 92 l0 -34 l20 18 l32 -30 l32 30 l20 -18 l0 34 z" fill="#e8b923" stroke="#b8901a" stroke-width="2"/>`,
  };

  const extras = {
    none: "",
    knife: `<g transform="rotate(28 250 150)"><rect x="244" y="60" width="12" height="80" rx="3" fill="#c8ccd2"/><rect x="240" y="138" width="20" height="26" rx="3" fill="#3a3a3c"/></g><path d="M250 150 q-4 20 -2 34" stroke="#a11" stroke-width="6" fill="none" opacity=".7"/>`,
    tears: "",
    rope: `<path d="M160 40 q40 30 0 64" stroke="#b08545" stroke-width="9" fill="none"/><ellipse cx="160" cy="118" rx="20" ry="26" fill="none" stroke="#b08545" stroke-width="9"/>`,
  };

  // red downtrend chart in the background - the eternal candle
  let chart = `<polyline points="`;
  let y = 70;
  for (let i = 0; i <= 9; i++) {
    y = clamp(y + (r() * 26 - 6), 40, 250);
    chart += `${30 + i * 28},${y} `;
  }
  chart += `" fill="none" stroke="#ff2d2d" stroke-width="3" opacity=".18"/>`;

  return `
  <svg viewBox="0 0 320 320" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rugged Pepe #${id}">
    <rect width="320" height="320" fill="${bg}"/>
    ${chart}
    <!-- body -->
    <ellipse cx="160" cy="196" rx="92" ry="86" fill="${skin}"/>
    <ellipse cx="160" cy="210" rx="70" ry="60" fill="#ffffff" opacity=".35"/>
    <!-- head dome -->
    <ellipse cx="160" cy="150" rx="104" ry="92" fill="${skin}"/>
    ${deadEyes}
    ${tears}
    ${mouths[mood]}
    ${hats[hat]}
    ${extras[extra]}
    <!-- watermark loss tag -->
    <g opacity=".9">
      <rect x="14" y="286" width="120" height="22" rx="6" fill="#0a0a0b"/>
      <text x="22" y="301" font-family="monospace" font-size="13" fill="#ff6b6b">floor -${drop}%</text>
    </g>
  </svg>`;
}

function pepeTraits(id) {
  const r = rng(id * 2654435761);
  pick(r, SKINS); pick(r, BG); const mood = pick(r, MOODS);
  const hat = pick(r, HATS); const extra = pick(r, EXTRAS);
  const tag = pick(rng(id * 40503), PL_LABELS);
  return { mood, hat, extra, tag };
}

// Mock NFT economics for the preview dossier: minted at X, floor now ~99% lower.
const MINTS = [0.02, 0.05, 0.08, 0.1, 0.15, 0.2, 0.33, 0.5, 0.69];
function previewEconomics(id) {
  const r = rng(id * 7777 + 13);
  const mint = pick(r, MINTS);             // the price it got swept at (the high)
  const drop = 98 + r() * 1.95;            // ~98% .. 99.95% down to the current floor
  const floor = mint * (1 - drop / 100);
  return { mint, drop, floor };
}
const ethShort = (n) => {
  if (n >= 0.01) return (+n.toFixed(3)) + " ETH";
  if (n > 0) return n.toFixed(7).replace(/0+$/, "").replace(/\.$/, "") + " ETH";
  return "0 ETH";
};

/* ----------------------------- TICKER ----------------------------- */
/* ----------------------------- MINT (off-site, on OpenSea) -----------------------------
   No wallet connect on this site. The mint lives on OpenSea - every "mint" button is
   just an outbound link to BRAND.opensea. This panel is pure FOMO/marketing display.   */
const MintState = {
  claimed: 0,   // real whitelist count, fetched from the server below
};

function renderMint() {
  const countEl = $("#mintedCount");
  if (countEl) countEl.textContent = MintState.claimed.toLocaleString();
  const fillEl = $("#mintFill");
  if (fillEl) fillEl.style.width = ((MintState.claimed / BRAND.supply) * 100).toFixed(2) + "%";
}

function initMint() {
  // The hero counter widget was removed; only fetch the count if it's on the page.
  if ($("#mintedCount")) {
    fetch("/api/whitelist/count")
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d && typeof d.count === "number") { MintState.claimed = d.count; renderMint(); } })
      .catch(() => {});
  }

  // Mint isn't live yet - .js-soon buttons just say so.
  $$(".js-soon").forEach(b => b.addEventListener("click", (e) => {
    e.preventDefault();
    toast("Mint isn't live yet - grab your whitelist spot first.");
  }));
}

/* ----------------------------- EXHIBIT (single feature file) ----------------------------- */
const CAUSES = [
  "roadmap abandoned at ATH", "honeypot - could mint, couldn't sell", "slow-rugged over 3 weeks",
  "Discord deleted overnight", "dev minted the whole supply to himself", "art never revealed (still 'soon')",
  "team renounced nothing, then vanished", "minted the influencer's exit", "floor swept to zero",
];
const STATUS = ["still coping", "financially deceased", "down bad", "in the trenches", "permanently underwater"];
let exhibitSeed = 420;

/* ----------------------------- COLLECTION GALLERY (real art) ----------------------------- */
const GALLERY_COUNT = 19;
const galleryImg = (n) => `/assets/gallery/${String(n).padStart(2, "0")}.png`;

const GAL_PAGE = 6;   // how many to reveal per tap on mobile
function initGallery() {
  const wrap = $("#gallery"); if (!wrap) return;
  let html = "";
  for (let n = 1; n <= GALLERY_COUNT; n++) {
    const id = String(((n * 743) % 9900) + 100).padStart(4, "0");
    html += `<figure class="gcard"><img src="${galleryImg(n)}" loading="lazy" alt="NGMI Pepe #${id}" /><figcaption>NGMI #${id}<span class="down"> · not minted</span></figcaption></figure>`;
  }
  wrap.innerHTML = html;

  // Mobile: show a few + a "Show more" button so the grid doesn't eat the whole screen.
  const more = $("#galMore");
  const figs = Array.from(wrap.children);
  const isMobile = () => window.matchMedia("(max-width: 680px)").matches;
  let shown = isMobile() ? GAL_PAGE : figs.length;
  function apply() {
    if (!isMobile()) { figs.forEach(f => (f.style.display = "")); if (more) more.hidden = true; return; }
    figs.forEach((f, i) => (f.style.display = i < shown ? "" : "none"));
    if (more) {
      const left = figs.length - shown;
      more.hidden = left <= 0;
      more.textContent = left > 0 ? `Show more + (${left} left)` : "";
    }
  }
  if (more) more.onclick = () => { shown = Math.min(figs.length, shown + GAL_PAGE); apply(); };
  let t; window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => { if (!isMobile()) shown = figs.length; else if (shown >= figs.length) shown = GAL_PAGE; apply(); }, 150);
  });
  apply();
}

/* ----------------------------- HERO ART (real art) ----------------------------- */
function initHeroArt() {
  const img = $("#heroImg");
  if (img) img.src = galleryImg(1 + Math.floor(Math.random() * GALLERY_COUNT));
  const loss = $("#heroLoss");
  if (loss) loss.textContent = `floor -${(96 + Math.random() * 3.7).toFixed(1)}%`;
}

/* ----------------------------- FAQ ----------------------------- */
const FAQ = [
  ["Is this a rug?", "Yes. We are legally and morally obligated to inform you: this is the concept. The product is the rug. You're not buying despite the rug, you're buying the rug. Congrats on your purchase."],
  ["Wen utility?", "Never. Utility is for projects that are insecure about their art. Our art is a frog that lost everything. That IS the utility. It's emotional support for your portfolio."],
  ["Is the team doxxed?", "Absolutely not. We watched what happened to the doxxed devs. We're anon, we're frogs, and we're already in the Bahamas (allegedly)."],
  ["Is the team diverse?", "Extremely. We're not racist, we equal-opportunity rug. We hired an Indian dev to write the contract and a few Nigerian influencers to shill it, a fully global operation assembled to rug the community as perfectly as humanly possible. Diversity is our strength."],
  ["What's the floor going to be?", "Lower than it is right now, whenever 'now' is. The floor is less of a price and more of a personal journey toward acceptance."],
  ["Why would I mint this?", "Honestly? We don't know either. But you've scrolled to the FAQ of a project that openly mocks you, so the data suggests you're going to. We'll see you up top at the mint button."],
  ["Can I get a refund?", "lol. lmao, even."],
];
function initFaq() {
  const list = $("#faqList"); if (!list) return;   // FAQ moved to its own page
  list.innerHTML = FAQ.map(([q, a]) => `
    <div class="faq__item">
      <button class="faq__q">${q} <span>+</span></button>
      <div class="faq__a"><p>${a}</p></div>
    </div>`).join("");
  $$(".faq__item").forEach(item => {
    const q = $(".faq__q", item); const a = $(".faq__a", item);
    q.onclick = () => {
      const open = item.classList.toggle("open");
      a.style.maxHeight = open ? a.scrollHeight + 40 + "px" : "0";
    };
  });
}

/* ----------------------------- MODAL CORE ----------------------------- */
const IS_APPLY = () => document.body.dataset.page === "apply";
const modal = $("#wlModal");

// Mark which step we're on in the /apply rail (1..4).
function setApplyStep(n) {
  $$(".apply__rail-step").forEach(el => el.classList.toggle("is-on", Number(el.dataset.s) <= n));
}

function openModal(html) {
  // On the dedicated /apply page, render the step into the page, not a popup.
  if (IS_APPLY()) {
    const stage = $("#applyStage");
    if (stage) {
      const main = document.querySelector("main.apply"); if (main) main.classList.remove("apply--wide");
      const rail = document.querySelector(".apply__rail"); if (rail) rail.style.display = "";
      stage.innerHTML = `<div class="apply__card">${html}</div>`;
      stage.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => { window.location.href = "/"; }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
  }
  $("#wlModalBody").innerHTML = html;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal() {
  if (IS_APPLY()) { window.location.href = "/"; return; }
  return _closeModalReal();
}
function _closeModalReal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
if (modal) {
  modal.addEventListener("click", e => { if (e.target.matches("[data-close]")) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
}

/* ----------------------------- WHITELIST FLOW ----------------------------- */
/* =========================================================
   ON-CHAIN BURN - uses the injected wallet (MetaMask etc.) directly
   via EIP-1193. No API key, no library. The "burn" is a real
   transferFrom(you → dead address) and we watch the receipt live.
   ========================================================= */
const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const SIG = { ownerOf: "0x6352211e", name: "0x06fdde03", transferFrom: "0x23b872dd" };
const hasWallet = () => typeof window !== "undefined" && !!window.ethereum;

const strip0x = (h) => (String(h).startsWith("0x") ? String(h).slice(2) : String(h));
const addr32 = (a) => strip0x(a).toLowerCase().padStart(64, "0");
const id32 = (id) => BigInt(id).toString(16).padStart(64, "0");
const isAddress = (a) => /^0x[0-9a-fA-F]{40}$/.test((a || "").trim());
const seedFromStr = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h || 1; };

const ethReq = (method, params = []) => window.ethereum.request({ method, params });
const ethCall = (to, data) => ethReq("eth_call", [{ to, data }, "latest"]);
const decodeAddress = (word) => "0x" + strip0x(word).slice(24);
function decodeString(ret) {
  try {
    const h = strip0x(ret);
    if (h.length < 128) return "";
    const len = parseInt(h.slice(64, 128), 16);
    const bytes = h.slice(128, 128 + len * 2);
    let s = ""; for (let i = 0; i < bytes.length; i += 2) s += String.fromCharCode(parseInt(bytes.substr(i, 2), 16));
    return s;
  } catch { return ""; }
}
const connectWallet = async () => (await ethReq("eth_requestAccounts"))[0];
const ownerOf = async (c, id) => decodeAddress(await ethCall(c, SIG.ownerOf + id32(id)));
const collectionName = async (c) => { try { return decodeString(await ethCall(c, SIG.name)).trim(); } catch { return ""; } };
const sendBurn = (c, from, id) => ethReq("eth_sendTransaction", [{ from, to: c, data: SIG.transferFrom + addr32(from) + addr32(BURN_ADDRESS) + id32(id) }]);
async function waitForReceipt(txHash, onTick) {
  for (let i = 0; i < 150; i++) { // ~5 min
    const r = await ethReq("eth_getTransactionReceipt", [txHash]).catch(() => null);
    if (r) return r;
    if (onTick) onTick(i);
    await new Promise((res) => setTimeout(res, 2000));
  }
  return null;
}
function explorerTx(hash, chainId) {
  const map = { "0x1": "https://etherscan.io", "0x89": "https://polygonscan.com", "0x2105": "https://basescan.org", "0xa": "https://optimistic.etherscan.io", "0xa4b1": "https://arbiscan.io" };
  return `${map[chainId] || "https://etherscan.io"}/tx/${hash}`;
}

const WL = { handle: null, lostUsd: null, cope: null, wallet: null, burnContract: null, burnTokenId: null, nftAth: null, projectName: null, burnTx: null, chainId: null, burnBlock: null };

function startWhitelist() {
  // Already authed via real X login? Skip straight to the confession.
  if (APP.backend && APP.user) { WL.handle = "@" + APP.user.username; stepConfess(); }
  else stepLogin();
}

// STEP 1 - Login with X
function stepLogin() {
  setApplyStep(1);
  // ---- Real X OAuth (served by server.js) ----
  if (APP.backend) {
    openModal(`
      <span class="step__kicker">Initiation · Step 1 of 4</span>
      <h2 class="step__title">Login with X</h2>
      <p class="step__desc">Real X login. We verify your handle, then make you prove how broken
        you are. You'll bounce to X, authorize, and land right back here at step 2.</p>
      ${APP.configured ? `
      <button class="x-login" id="xLogin">
        Sign in with X
      </button>
      <p class="hint" style="margin-top:14px">We only read your handle. We can't tweet, can't post,
        can't touch your DMs. We just need to know which jeet you are.</p>
      ` : `
      <div class="x-handle" style="background:var(--rug-soft);border-color:#f3b4b4;align-items:flex-start;flex-direction:column">
        <b>X OAuth isn't wired up on the server yet.</b>
        <span class="hint" style="margin-top:6px">Add <code>X_CLIENT_ID</code> and
        <code>X_CLIENT_SECRET</code> to your <code>.env</code> and restart the server.</span>
      </div>`}
      <div class="modal__foot">
        <button class="btn btn--ghost" data-close>I'm scared</button>
      </div>
    `);
    const b = $("#xLogin");
    if (b) b.onclick = () => {
      toast("Redirecting to X.");
      window.location.href = "/auth/x/login";
    };
    return;
  }

  // ---- Static-file fallback (mock login) ----
  openModal(`
    <span class="step__kicker">Initiation · Step 1 of 4</span>
    <h2 class="step__title">Login with X <span class="muted" style="font-size:13px">(demo mode)</span></h2>
    <p class="step__desc">You opened this as a static file, so X login is mocked. Run it with the
      Node server (<code>npm start</code>) for the real OAuth flow. For now, type a handle.</p>
    <p class="field" style="margin-top:4px">
      <label>Your handle</label>
      <input id="xHandle" placeholder="@your_underwater_bags" autocomplete="off" />
      <span class="hint">We will absolutely tweet that you joined. Cope.</span>
    </p>
    <div class="modal__foot">
      <button class="btn btn--ghost" data-close>I'm scared</button>
      <button class="btn btn--primary" id="xNext">Continue →</button>
    </div>
  `);
  const go = () => {
    let h = ($("#xHandle").value || "").trim().replace(/^@/, "");
    if (!h) h = "anon_jeet_" + (Math.floor(rng(Date.now() & 0xffff)() * 9000) + 1000);
    WL.handle = "@" + h;
    stepConfess();
  };
  $("#xNext").onclick = go;
  $("#xHandle").addEventListener("keydown", e => { if (e.key === "Enter") go(); });
}

// STEP 2 - Confess your losses
function stepConfess() {
  setApplyStep(2);
  openModal(`
    <span class="step__kicker">Initiation · Step 2 of 4</span>
    <h2 class="step__title">Confess your losses, ${WL.handle}</h2>
    <p class="step__desc">Be honest. We've all been there. The first step is admitting how hard
      you got bent over.</p>

    <div class="field">
      <label>How much did the last project rug you for? (USD) <span class="req">*</span></label>
      <input id="cLost" inputmode="numeric" placeholder="e.g. 14,500" required />
      <span class="hint">Pre-tax. The pain is post-tax.</span>
    </div>
    <div class="field">
      <label>What will you do <em>this</em> time, before we rug you like all the others? <span class="req">*</span></label>
      <select id="cCope">
        <option value="">- choose your cope -</option>
        <option>List it above floor (it'll never sell)</option>
        <option>Flip it at 2x floor (I'll hold to zero)</option>
        <option>"This time the art is different"</option>
        <option>Diamond hand it to zero out of spite</option>
        <option>Tell myself the roadmap is still coming</option>
        <option>Nothing. I've accepted my role as exit liquidity.</option>
      </select>
    </div>

    <div class="follow-cta">
      <div class="follow-cta__txt"><b>Follow @engmiHQ on X</b><span>The least you can do before we rug you. <b class="acid">+250</b> NGMI points.</span></div>
      <button type="button" class="btn btn--accent" id="cFollow">Follow →</button>
    </div>

    <div class="modal__foot">
      <button class="btn btn--ghost" id="cBack">← Back</button>
      <button class="btn btn--primary" id="cNext">I confess →</button>
    </div>
  `);
  $("#cBack").onclick = () => { if (IS_APPLY()) window.location.href = "/"; else stepLogin(); };
  const followBtn = $("#cFollow");
  if (followBtn) {
    followBtn.onclick = async () => {
      window.open("https://x.com/engmiHQ", "_blank", "noopener");
      followBtn.disabled = true; followBtn.textContent = "Claiming...";
      try {
        const r = await fetch("/api/points/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: "follow" }) });
        const d = await r.json();
        if (d.ok) { followBtn.textContent = "Followed ✓"; toast("Nice. +250 NGMI points."); }
        else { followBtn.disabled = false; followBtn.textContent = "Follow →"; }
      } catch { followBtn.disabled = false; followBtn.textContent = "Follow →"; }
    };
    fetch("/api/points/me", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(d => {
      if (d && (d.claimed || []).includes("follow")) { followBtn.disabled = true; followBtn.textContent = "Followed ✓"; }
    }).catch(() => {});
  }
  $("#cNext").onclick = () => {
    const lost = ($("#cLost").value || "").trim();
    const cope = $("#cCope").value || "";
    if (!/[0-9]/.test(lost)) { toast("Required: how much did the last project rug you for? (a number)"); $("#cLost").focus(); return; }
    if (!cope) { toast("Required: choose your cope."); $("#cCope").focus(); return; }
    WL.lostUsd = lost;
    WL.cope = cope;
    stepBurn();
  };
}

// STEP 3 - Detect NFTs, select, and burn them live on-chain
const burnState = { nfts: [], selected: [], mode: "init", loading: false };

const nftKey = (n) => (n.contract || "").toLowerCase() + ":" + n.tokenId;
const nftBonus = (n) => 8 + (seedFromStr(nftKey(n)) % 19);          // 8..26 % per NFT, by "type"
const approvalFor = (list) => (list.length ? Math.min(99, 12 + list.reduce((a, n) => a + nftBonus(n), 0)) : 0);
const shortId = (id) => { id = String(id); return id.length > 9 ? id.slice(0, 9) + "…" : id; };
// Approval estimate (mirrors the server's authoritative scoring):
// higher stated ATH = harder rug = higher odds; each burned bag multiplies the tier.
const ETH_USD_C = 3000;
const athToUsdC = (t) => {
  if (!t) return 0;
  const str = String(t).toLowerCase();
  const num = parseFloat(str.replace(/[^0-9.]/g, ""));
  if (!isFinite(num) || num <= 0) return 0;
  return /eth|ether|Ξ|ξ/.test(str) ? num * ETH_USD_C : num;
};
const tierPointsC = (a) => (a >= 50 ? 50 : a >= 30 ? 34 : a > 0 ? 20 : 10);
const clientApproval = (count, athText) => (count <= 0 ? 0 : Math.max(10, Math.min(99, tierPointsC(athToUsdC(athText)) * count)));
const CHAIN_NAMES = {
  "0x1": "Ethereum", "0x89": "Polygon", "0x2105": "Base", "0xa": "Optimism", "0xa4b1": "Arbitrum",
  "0xaa36a7": "Sepolia", "0x14a34": "Base Sepolia", "0x66eee": "Arbitrum Sepolia",
  "0xaa37dc": "Optimism Sepolia", "0x13882": "Polygon Amoy",
};
const chainName = () => CHAIN_NAMES[WL.chainId] || ("chain " + (WL.chainId || "?"));

function stepBurn() {
  setApplyStep(3);
  openModal(`
    <span class="step__kicker">Initiation · Step 3 of 4</span>
    <h2 class="step__title">Burn rugged NFTs. Live, on-chain.</h2>
    <p class="step__desc">Not ours - <em>theirs</em>. Connect your wallet, pick the bags that already
      rugged you, and send them to the dead address forever. We watch the chain confirm each burn in
      real time. <b>The more you burn, the higher your approval odds.</b></p>

    <div class="bonus-row">
      <p class="bonus-line">Boost your odds: burn it <b>live</b> on stream or in a public road and tag
        <b>@engmiHQ</b> in the video. Burn it <b>fully naked</b> and you skip review entirely - instant whitelist.</p>
      <img class="bonus-row__img" src="/assets/babe.png" alt="Bikini Pepe burning an NFT" />
    </div>

    <div class="field">
      <label>Wallet</label>
      <div id="walletBox"></div>
    </div>

    <div id="nftArea"></div>

    <div class="field">
      <label>What was the bag's ATH? <span class="req">*</span> <span class="muted" style="font-weight:600">(decides your odds)</span></label>
      <input id="bAth" placeholder="e.g. $80, or 0.05 ETH" autocomplete="off" value="${WL.nftAth ? escapeHtml(WL.nftAth) : ""}" />
      <span class="hint">Peak value of the bag that rugged you. $50+ = premium victim = best odds. Higher pain, higher chance.</span>
    </div>

    <div class="approval" id="approvalBox" hidden>
      <div class="approval__head"><span>Application strength</span><b id="approvalPct">0%</b></div>
      <div class="approval__bar"><div class="approval__fill" id="approvalFill"></div></div>
      <p class="approval__note" id="approvalNote"></p>
    </div>

    <div class="burn-status" id="burnStatus"></div>
    <div class="modal__foot">
      <button class="btn btn--ghost" id="bBack">← Back</button>
      <button class="btn btn--accent" id="bBurn" disabled>Burn selected live</button>
    </div>
  `);
  renderWalletBox();
  renderNftArea();
  renderApproval();
  updateBurnBtn();
  const ath = $("#bAth"); if (ath) ath.addEventListener("input", renderApproval);
  $("#bBack").onclick = stepConfess;
  $("#bBurn").onclick = burnExecute;
}

function renderWalletBox() {
  const box = $("#walletBox");
  if (!box) return;
  if (!hasWallet()) {
    box.innerHTML = `<div class="x-handle" style="border-style:dashed">No browser wallet found.<span class="hint" style="margin-left:8px">A burn is a real on-chain tx - install MetaMask or open in a wallet browser.</span></div>`;
    return;
  }
  if (WL.wallet) {
    const offMain = WL.chainId && WL.chainId !== "0x1";
    box.innerHTML =
      `<div class="x-handle"><b>${WL.wallet.slice(0, 6)}…${WL.wallet.slice(-4)}</b><span class="hint" style="margin-left:8px">${chainName()}</span><button class="walletbtn" id="disconnectW" type="button">Disconnect</button></div>` +
      (offMain ? `<button class="btn btn--accent btn--block" id="switchEth" type="button" style="margin-top:8px">Switch to Ethereum mainnet</button>` : "");
    $("#disconnectW").onclick = disconnectWallet;
    const se = $("#switchEth"); if (se) se.onclick = switchToEthereum;
    return;
  }
  box.innerHTML = `<button class="x-login" type="button" id="connectW">Connect wallet</button>`;
  $("#connectW").onclick = onConnect;
}

async function onConnect() {
  try {
    WL.wallet = await connectWallet();
    WL.chainId = await ethReq("eth_chainId").catch(() => "0x1");
    attachWalletListeners();
    renderWalletBox();
    await loadNfts();
  } catch { toast("Wallet connection rejected."); }
}

// React to the user switching network/account in their wallet while on the burn step.
function attachWalletListeners() {
  if (!hasWallet() || !window.ethereum.on || burnState._hooked) return;
  burnState._hooked = true;
  window.ethereum.on("chainChanged", (cid) => {
    WL.chainId = cid;
    if ($("#nftArea") && WL.wallet) { renderWalletBox(); loadNfts(); }
  });
  window.ethereum.on("accountsChanged", (accts) => {
    if (!accts || !accts.length) { if ($("#nftArea")) disconnectWallet(); return; }
    WL.wallet = accts[0];
    if ($("#nftArea")) { renderWalletBox(); loadNfts(); }
  });
}

function disconnectWallet() {
  WL.wallet = null; WL.chainId = null;
  burnState.nfts = []; burnState.selected = []; burnState.mode = "init"; burnState.loading = false;
  renderWalletBox(); renderNftArea(); renderApproval(); updateBurnBtn();
  toast("Wallet disconnected.");
}

// Ask the wallet to switch to Ethereum mainnet (then re-scan NFTs).
async function switchToEthereum() {
  const btn = $("#switchEth");
  if (btn) { btn.disabled = true; btn.textContent = "Switching…"; }
  try {
    await ethReq("wallet_switchEthereumChain", [{ chainId: "0x1" }]);
    WL.chainId = "0x1";
    renderWalletBox();
    await loadNfts();
    toast("Switched to Ethereum mainnet.");
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = "Switch to Ethereum mainnet"; }
    toast("Couldn't switch - change to Ethereum in your wallet manually.");
  }
}

async function loadNfts() {
  burnState.loading = true; burnState.reason = null; renderNftArea();
  try {
    const r = await fetch(`/api/nfts?address=${WL.wallet}&chainId=${WL.chainId || "0x1"}`);
    const d = r.ok ? await r.json() : null;
    if (!d) { burnState.mode = "manual"; burnState.reason = "error"; }
    else if (!d.configured) { burnState.mode = "manual"; burnState.reason = "unconfigured"; }
    else if (d.unsupportedChain) { burnState.mode = "manual"; burnState.reason = "chain"; }
    else {
      burnState.nfts = d.nfts || []; burnState.selected = []; burnState.mode = "select";
      burnState.reason = burnState.nfts.length ? null : "empty";
    }
  } catch { burnState.mode = "manual"; burnState.reason = "error"; }
  burnState.loading = false;
  renderNftArea(); renderApproval(); updateBurnBtn();
}

function manualInputsHtml() {
  return `
    <div class="field"><label>Rugged NFT - contract address</label>
      <input id="bContract" placeholder="0x… the collection that did you dirty" autocomplete="off" value="${WL.burnContract || ""}" /></div>
    <div class="field"><label>Token ID - the exact one you minted</label>
      <input id="bTokenId" inputmode="numeric" placeholder="e.g. 4269" autocomplete="off" value="${WL.burnTokenId || ""}" /></div>`;
}

function nftCardHtml(n) {
  const k = nftKey(n);
  const sel = burnState.selected.some((x) => nftKey(x) === k);
  const img = n.image
    ? `<img src="${escapeHtml(n.image)}" alt="" loading="lazy" onerror="this.parentNode.classList.add('noimg')" />`
    : "";
  return `<button type="button" class="nftcard${sel ? " sel" : ""}${n.image ? "" : " noimg"}" data-k="${escapeHtml(k)}">
    <span class="nftcard__img">${img}</span>
    <span class="nftcard__meta"><b>${escapeHtml(n.collection)}</b><span>#${escapeHtml(shortId(n.tokenId))}</span></span>
  </button>`;
}

function renderNftArea() {
  const area = $("#nftArea"); if (!area) return;

  if (!hasWallet()) {
    area.innerHTML = `<p class="hint" style="margin:6px 0 2px">A whitelist burn is a real on-chain transaction, so you need a web3 wallet (MetaMask, Rabby, or a wallet's in-app browser). No wallet, no burn. Nothing to burn anyway? <a href="/tasks" style="color:var(--rug)">Farm points instead →</a></p>`;
    return;
  }
  if (!WL.wallet) { area.innerHTML = `<p class="hint" style="margin:6px 0 2px">Connect your wallet to load the NFTs that wronged you.</p>`; return; }
  if (burnState.loading) { area.innerHTML = `<div class="nft-loading">Scanning the chain for your bad decisions…</div>`; return; }

  if (burnState.mode === "manual") {
    const msg = burnState.reason === "chain"
      ? `Auto-detect doesn't cover <b>${chainName()}</b> yet - switch your wallet to Ethereum, Base, Polygon, Optimism or Arbitrum and <button class="linklike" id="retryNfts" type="button">rescan</button>, or paste it manually below.`
      : burnState.reason === "error"
      ? `Couldn't reach the NFT scanner (the server may have been restarting). <button class="linklike" id="retryNfts" type="button">Retry scan</button>, or paste it manually below.`
      : burnState.reason === "unconfigured"
      ? `Auto-detect isn't configured on the server (no Alchemy key). Paste the rugged NFT below.`
      : `Paste the rugged NFT below.`;
    area.innerHTML = `<p class="hint" style="margin:2px 0 10px">${msg}</p>${manualInputsHtml()}`;
    const rb = $("#retryNfts"); if (rb) rb.onclick = loadNfts;
    return;
  }
  if (!burnState.nfts.length) {
    area.innerHTML = `<div class="nft-loading">No ERC-721s found in this wallet on <b>${chainName()}</b> - you're either clean or on another chain. <button class="linklike" id="manualSwitch" type="button">Paste one manually →</button></div>`;
    $("#manualSwitch").onclick = () => { burnState.mode = "manual"; renderNftArea(); renderApproval(); updateBurnBtn(); };
    return;
  }
  area.innerHTML = `
    <label style="font-weight:800;font-size:13.5px;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center;margin:2px 0 8px">
      <span>Pick your sacrifices - ${burnState.nfts.length} found</span>
      <button class="linklike" id="rescanNfts" type="button" style="font-size:11px">↻ rescan</button>
    </label>
    <div class="nftgrid">${burnState.nfts.map(nftCardHtml).join("")}</div>`;
  const rs = $("#rescanNfts"); if (rs) rs.onclick = loadNfts;
  $$(".nftcard", area).forEach((el) => el.onclick = () => {
    const k = el.dataset.k;
    const i = burnState.selected.findIndex((x) => nftKey(x) === k);
    if (i >= 0) burnState.selected.splice(i, 1);
    else { const n = burnState.nfts.find((x) => nftKey(x) === k); if (n) burnState.selected.push(n); }
    el.classList.toggle("sel", i < 0);
    renderApproval(); updateBurnBtn();
  });
}

function renderApproval() {
  const box = $("#approvalBox"); if (!box) return;
  box.hidden = false;
  const manual = !hasWallet() || burnState.mode === "manual";
  const liveBags = manual ? 1 : burnState.selected.length;
  const count = (WL.priorBurns ? WL.priorBurns.length : 0) + liveBags;  // prior burns add up too
  const athText = ($("#bAth") && $("#bAth").value) || "";
  const athUsd = athToUsdC(athText);
  const pct = clientApproval(count, athText);
  WL.approval = pct;

  $("#approvalPct").textContent = pct + "%";
  const fill = $("#approvalFill");
  fill.style.width = pct + "%";
  fill.className = "approval__fill" + (pct >= 85 ? " hot" : pct >= 50 ? " warm" : "");

  let note;
  if (!manual && liveBags === 0) {
    note = "Select the bags you're willing to martyr. Higher ATH + more bags = stronger case.";
  } else if (athUsd === 0) {
    note = `No ATH given, so your case is weak (${pct}%). Every application is hand-reviewed by an admin anyway. Add an ATH ($50+ is best) to strengthen it.`;
  } else {
    const tier = athUsd >= 50 ? "$50+ (premium rug victim)" : athUsd >= 30 ? "$30-50" : "under $30";
    note = `Tier: ${tier}. Case strength ${pct}%. There's no auto-whitelist - an admin reviews every application. Burn more / higher-ATH bags to make your case stronger.`;
  }
  $("#approvalNote").textContent = note;
}

function updateBurnBtn() {
  const btn = $("#bBurn"); if (!btn) return;
  if (!hasWallet()) { btn.disabled = true; btn.textContent = "Wallet required to burn"; return; }
  if (burnState.mode === "manual") { btn.disabled = false; btn.textContent = "Burn it live"; return; }
  const n = burnState.selected.length;
  btn.disabled = n === 0;
  btn.textContent = n > 1 ? `Burn ${n} bags live` : "Burn selected live";
}

// Auto-detect a collection's name from its contract (server -> Alchemy), for manual burns.
async function fetchCollectionMeta(contract, chainId) {
  try {
    const r = await fetch(`/api/collection-image?contract=${contract}&chainId=${chainId || "0x1"}`);
    if (!r.ok) return {};
    return await r.json();
  } catch { return {}; }
}

async function burnExecute() {
  // A whitelist burn must be a real on-chain transaction - no wallet, no burn.
  if (!hasWallet()) { toast("You need a web3 wallet (MetaMask, Rabby, or a wallet browser) to burn. No wallet, no burn."); return; }
  if (!WL.wallet) { toast("Connect your wallet first."); return; }

  const ath = (($("#bAth") && $("#bAth").value) || "").trim();
  if (!ath) { toast("Required: enter the bag's ATH - it decides your odds."); if ($("#bAth")) $("#bAth").focus(); return; }
  WL.nftAth = ath;

  let toBurn;
  if (burnState.mode === "manual") {
    const contract = (($("#bContract") && $("#bContract").value) || "").trim();
    const tokenId = (($("#bTokenId") && $("#bTokenId").value) || "").trim();
    if (!isAddress(contract)) { toast("Required: a valid contract address (0x + 40 hex)."); return; }
    if (!/^\d+$/.test(tokenId)) { toast("Required: token ID (a number)."); return; }
    WL.burnContract = contract; WL.burnTokenId = tokenId;
    const meta = await fetchCollectionMeta(contract, WL.chainId || "0x1");
    toBurn = [{ contract, tokenId, collection: (meta && meta.name) || "your bag" }];
  } else {
    if (!burnState.selected.length) { toast("Required: select at least one NFT to burn."); return; }
    toBurn = burnState.selected.slice();
  }
  WL.approval = clientApproval((WL.priorBurns || []).length + toBurn.length, WL.nftAth); // estimate; server is authoritative
  burnSelected(toBurn);
}

// Burn each selected NFT in sequence, with a live per-NFT progress list.
async function burnSelected(list) {
  setApplyStep(3);
  openModal(`
    <span class="step__kicker">Live on-chain</span>
    <h2 class="step__title">Burning ${list.length} bag${list.length > 1 ? "s" : ""}…</h2>
    <div class="burnprog">${list.map((n, i) => `
      <div class="burnprog__row">
        <span class="burnprog__name">${escapeHtml(n.collection)} #${escapeHtml(shortId(n.tokenId))}</span>
        <span class="burnprog__state" id="bps-${i}">queued</span>
      </div>`).join("")}</div>
    <p class="burn-status" id="burnStatus">Confirm each burn in your wallet. Every one is irreversible.</p>
  `);

  const done = [];
  for (let i = 0; i < list.length; i++) {
    const n = list[i];
    const el = $(`#bps-${i}`);
    const set = (t, cls) => { if (el) { el.innerHTML = t; el.className = "burnprog__state" + (cls ? " " + cls : ""); } };
    try {
      set("checking…");
      const owner = await ownerOf(n.contract, n.tokenId).catch(() => null);
      if (!owner || owner.toLowerCase() !== WL.wallet.toLowerCase()) { set("not yours - skipped", "skip"); continue; }
      const pname = (await collectionName(n.contract).catch(() => "")) || n.collection;
      set("confirm in wallet…");
      const tx = await sendBurn(n.contract, WL.wallet, n.tokenId);
      set(`burning… <a href="${explorerTx(tx, WL.chainId)}" target="_blank" rel="noopener">tx ↗</a>`, "live");
      const rc = await waitForReceipt(tx);
      if (!rc || rc.status === "0x0") { set("reverted", "skip"); continue; }
      set(`burned <a href="${explorerTx(tx, WL.chainId)}" target="_blank" rel="noopener">tx ↗</a>`, "ok");
      done.push({ contract: n.contract, tokenId: n.tokenId, tx, projectName: pname, floor: n.floor ?? null });
    } catch { set("cancelled", "skip"); }
  }

  if (!done.length) {
    const st = $("#burnStatus");
    st.innerHTML = `<span class="down">Nothing burned. Even the burn rugged you.</span>`;
    const foot = document.createElement("div"); foot.className = "modal__foot"; foot.style.marginTop = "16px";
    foot.innerHTML = `<button class="btn btn--ghost" id="bRetry">← Try again</button>`;
    st.after(foot);
    $("#bRetry").onclick = stepBurn;
    return;
  }

  // Append to any burns from a previous submission (so "burn more" accumulates).
  WL.burns = [...(WL.priorBurns || []), ...done];
  WL.projectName = done[0].projectName;
  WL.approval = clientApproval(WL.burns.length, WL.nftAth);
  $("#burnStatus").innerHTML = `Burned ${done.length}/${list.length}. ${WL.burns.length} total. Estimated approval <b>${WL.approval}%</b>.`;
  setTimeout(() => runBurnFinale({ live: true }), 900);
}

// The dramatic finale: flames + "you got fucked by <project>" flash, then whitelist.
function runBurnFinale({ live }) {
  setApplyStep(3);
  const first = (WL.burns && WL.burns[0]) || {};
  const seed = seedFromStr((first.contract || "x") + (first.tokenId || "0"));
  const victim = (WL.projectName && WL.projectName.trim()) ? WL.projectName.trim() : "this project";
  const victimSafe = escapeHtml(victim);
  const n = (WL.burns || []).length;

  openModal(`
    <span class="step__kicker">${live ? "Burn confirmed on-chain" : "Demo burn - no wallet"}</span>
    <h2 class="step__title">${n > 1 ? n + " bags, gone." : "It's gone."}</h2>
    <div class="burn-stage">
      <div class="burn-frame" id="burnFrame">
        ${buildPepe(seed, 230)}
        <div class="flames" id="flames"></div>
      </div>
      <div class="burn-caption" id="burnCap">IT'S BURNING</div>
    </div>
  `);
  const flames = $("#flames");
  for (let i = 0; i < 7; i++) {
    const f = document.createElement("div");
    f.className = "flame";
    f.style.left = 8 + i * 30 + "px";
    f.style.animationDelay = (i * 0.13) + "s";
    f.style.height = 60 + (i % 3) * 24 + "px";
    flames.appendChild(f);
  }
  setTimeout(() => $("#burnFrame").classList.add("lit"), 250);
  const cap = $("#burnCap");
  const lines = [
    [`IT'S BURNING`, 1100],
    [`gone. forever. sent to the dead address.`, 1100],
    [`YOU GOT FUCKED BY ${victim.toUpperCase()}`, 1500],
    [`…and you came back for more.`, 1200],
  ];
  let t = 0;
  lines.forEach(([text, dur], idx) => {
    setTimeout(() => {
      cap.textContent = text;
      cap.classList.toggle("rug", idx === 2);
      if (idx === 2) scamFlash(victimSafe);
    }, t);
    t += dur;
  });
  setTimeout(stepShame, t + 200);
}

// STEP 3.5 - Mandatory shame: post the tweet and paste the link, or no whitelist.
const isTweetUrl = (u) => /^https?:\/\/(www\.)?(twitter|x)\.com\/[A-Za-z0-9_]{1,15}\/status\/\d+/i.test((u || "").trim());

function stepShame() {
  setApplyStep(4);
  const n = (WL.burns || []).length;
  const victim = (WL.projectName && WL.projectName.trim()) ? WL.projectName.trim() : "the project that rugged me";
  const tweetText = `I just burned ${n} rugged NFT${n > 1 ? "s" : ""} to apply for ${BRAND.name}. Publicly admitting I'm exit liquidity and I came back for more. Rugged by ${victim}. I have learned nothing. ngmi #NGMI #ExitLiquidity`;
  openModal(`
    <span class="step__kicker">Initiation · final gate</span>
    <h2 class="step__title">Post your shame. Or get nothing.</h2>
    <p class="step__desc">No tweet, no whitelist. Publicly post that you burned your bag and crawled
      back for more, then paste the link below. The admin checks every one - fake or deleted links
      get you <strong>rejected</strong>.</p>
    <button class="x-login" id="shamePost" type="button">Post my shame on X</button>
    <div class="field" style="margin-top:16px">
      <label>Paste your shame tweet URL <span class="req">*</span></label>
      <input id="shameUrl" placeholder="https://x.com/you/status/1234567890" autocomplete="off" value="${WL.shameTweet ? escapeHtml(WL.shameTweet) : ""}" />
      <span class="hint">Must be a public x.com / twitter.com status link. Keep it up, the admin will look.</span>
    </div>
    <div class="burn-status" id="shameStatus"></div>
    <div class="modal__foot">
      <button class="btn btn--ghost" id="shameBack">← Back</button>
      <button class="btn btn--accent" id="shameSubmit">Submit application →</button>
    </div>
  `);
  $("#shamePost").onclick = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, "_blank", "noopener");
    toast("Posted? Copy the tweet link and paste it below.");
  };
  $("#shameBack").onclick = stepBurn;
  $("#shameSubmit").onclick = () => {
    const url = ($("#shameUrl").value || "").trim();
    if (!isTweetUrl(url)) {
      $("#shameStatus").innerHTML = `<span class="down">That's not a valid X status link. No tweet, no whitelist.</span>`;
      toast("Paste a real shame tweet, or you get nothing.");
      return;
    }
    WL.shameTweet = url;
    stepDone();
  };
}

function scamFlash(projectSafe) {
  let f = $(".scam-flash");
  if (!f) { f = document.createElement("div"); f.className = "scam-flash"; document.body.appendChild(f); }
  f.innerHTML = `<span>YOU GOT FUCKED BY ${(projectSafe || "THIS PROJECT").toUpperCase()}</span>`;
  f.classList.remove("show"); void f.offsetWidth; f.classList.add("show");
}

// STEP 4 - Whitelisted (instant) or Pending (manual review)
async function stepDone() {
  setApplyStep(4);
  let spot = null, status = null, approval = WL.approval;
  // Persist the application server-side (only works in real-backend mode).
  if (APP.backend && APP.user) {
    try {
      const r = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lostUsd: WL.lostUsd, cope: WL.cope, nftAth: WL.nftAth, chainId: WL.chainId,
          shameTweet: WL.shameTweet,
          burns: (WL.burns || []).map(b => ({
            projectName: b.projectName, contract: b.contract, tokenId: b.tokenId, tx: b.tx,
          })),
        }),
      });
      const d = await r.json();
      if (d.ok) { spot = d.spot; status = d.status; approval = d.approval; }
    } catch { /* fall through */ }
  }
  // Static/demo fallback: still never auto-approves (admin reviews everything).
  if (status == null) {
    approval = clientApproval((WL.burns || []).length, WL.nftAth);
    status = "pending";
    spot = spot ?? (MintState.claimed + 1);
  }
  WL.approval = approval;
  const app = {
    handle: WL.handle, status, approval, spot,
    lost_usd: WL.lostUsd, cope: WL.cope, nft_ath: WL.nftAth,
    chain_id: WL.chainId, burn_count: (WL.burns || []).length,
    burns: WL.burns || [], shame_tweet: WL.shameTweet,
  };
  showDashboard(app);
  if (status === "approved") confettiOfPain();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* little falling red-candle "confetti" of pain */
function confettiOfPain() {
  const card = $(".modal__card") || $(".apply__card"); if (!card) return;
  for (let i = 0; i < 18; i++) {
    const c = document.createElement("div");
    const r = rng(i + 1 + seedFromStr((WL.burnTokenId || "0") + (WL.burnContract || "")))();
    c.textContent = ["$0", "REKT", "-99%", "NGMI"][Math.floor(r * 4)];
    Object.assign(c.style, {
      position: "absolute", left: (r * 100) + "%", top: "-20px",
      fontSize: 14 + r * 14 + "px", pointerEvents: "none", zIndex: 6,
      transition: "transform 1.8s ease-in, opacity 1.8s", opacity: "1",
    });
    card.appendChild(c);
    requestAnimationFrame(() => {
      c.style.transform = `translateY(${300 + r * 200}px) rotate(${r * 360}deg)`;
      c.style.opacity = "0";
    });
    setTimeout(() => c.remove(), 1900);
  }
}

/* ----------------------------- TOAST ----------------------------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ----------------------------- AUTH BOOTSTRAP ----------------------------- */
// Ask the server who we are. If this 200s, the Node backend is live → real OAuth.
async function checkAuth() {
  try {
    const r = await fetch("/auth/me", { headers: { Accept: "application/json" } });
    if (!r.ok) return;                       // static host (404) → stay in mock mode
    const data = await r.json();
    APP.backend = true;
    APP.configured = !!data.configured;
    APP.user = data.user || null;
    if (APP.user) WL.handle = "@" + APP.user.username;
  } catch { /* file:// or no server → mock mode */ }
}

const OAUTH_ERRORS = {
  denied: "X login denied. Coward.",
  badstate: "Login expired or state mismatch - try again.",
  tokenfail: "X token exchange failed. Check your client secret.",
  mefail: "Couldn't read your X profile. Check app permissions.",
  error: "OAuth hiccup. Try again, ser.",
  unconfigured: "X OAuth isn't set up on the server yet.",
};

/* ----------------------------- /apply PAGE ----------------------------- */
// A username chip: copies "@handle" to the clipboard, then opens the dashboard.
function navUserCopyChip(username) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "nav__userbtn";
  btn.title = "Copy username + open dashboard";
  btn.textContent = "@" + username;
  btn.onclick = () => {
    const txt = "@" + username;
    const go = () => { window.location.href = "/apply"; };
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => {
      btn.classList.add("copied"); btn.textContent = "copied ✓";
      setTimeout(go, 550);
    }).catch(go);
  };
  return btn;
}
function setNavUser() {
  const el = $("#navUser");
  if (!el) return;
  el.innerHTML = "";
  if (APP.user) el.appendChild(navUserCopyChip(APP.user.username));
}

async function initApplyPage() {
  // Paint something instantly so the stage is never blank while auth/app loads.
  const stage = $("#applyStage");
  if (stage) stage.innerHTML = `<div class="apply__card"><span class="step__kicker">Initiation</span><h2 class="step__title">Loading...</h2><p class="step__desc">Pulling up the receipts on your bad decisions.</p></div>`;
  await checkAuth();
  setNavUser();
  initNavToggle();

  // Surface any OAuth error passed back on the redirect.
  const p = new URLSearchParams(location.search);
  const x = p.get("x");
  if (x && OAUTH_ERRORS[x]) toast(OAUTH_ERRORS[x]);
  if (x) history.replaceState(null, "", "/apply");

  if (!APP.user) { stepLogin(); return; }

  WL.handle = "@" + APP.user.username;
  // Already applied? Show their status + details instead of the form again.
  const existing = await fetchMyApplication();
  if (existing === "warming") {
    // DB still waking after retries - show a wait screen and re-check, never a blank form.
    const stage = $("#applyStage");
    if (stage) stage.innerHTML = `<div class="apply__card"><span class="step__kicker">One sec</span><h2 class="step__title">Waking the database...</h2><p class="step__desc">Checking your existing application. This takes a moment on a cold start.</p></div>`;
    return void setTimeout(() => initApplyPage(), 2500);
  }
  if (existing) stepStatus(existing);
  else stepConfess();
}

// Returns the user's application, or the string "warming" if the DB is briefly
// unreachable - so callers never mistake a cold DB for "no application" and re-show the form.
async function fetchMyApplication(tries = 4) {
  if (!APP.backend) return null;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch("/api/whitelist/me", { headers: { Accept: "application/json" }, cache: "no-store" });
      if (r.status === 401) return null;                 // genuinely logged out / no app
      const d = await r.json().catch(() => ({}));
      if (r.status === 503 || d.warming) { await new Promise(s => setTimeout(s, 1500)); continue; }
      if (!r.ok) return null;
      return d.application || null;
    } catch { await new Promise(s => setTimeout(s, 1500)); }
  }
  return "warming";   // DB still waking after retries - don't show a blank form
}

// Returning applicant: read-only status screen (pending / approved / rejected).
function stepStatus(app) {
  // Pre-load so "burn more" keeps the existing answers and appends to existing burns.
  WL.lostUsd = app.lost_usd || WL.lostUsd;
  WL.cope = app.cope || WL.cope;
  WL.nftAth = app.nft_ath || WL.nftAth;
  WL.priorBurns = Array.isArray(app.burns) ? app.burns : [];
  WL.approval = app.approval || 0;
  showDashboard(app);
}

/* ----------------------------- THE RUG DASHBOARD -----------------------------
   The post-application view: a satirical "treasury terminal" that brags about how
   much was raised to rug the user, plus their real application file.            */
function shareShame(app) {
  const approved = app && app.status === "approved";
  const text = encodeURIComponent(`I just ${approved ? "got whitelisted for" : "applied to"} ${BRAND.name}. They told me to my face I'm exit liquidity and I said "bet". I have learned nothing. ngmi`);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener");
}
function animateRaiseCounter() {
  const el = $("#dashRaise"); if (!el) return;
  const target = 100000000, dur = 1200, t0 = performance.now();
  (function tick(now) {
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = "$" + Math.floor(target * e).toLocaleString("en-US");
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
function fillHolders() {
  const el = $("#dashHolders"); if (!el) return;
  fetch("/api/whitelist/count", { cache: "no-store" })
    .then(r => (r.ok ? r.json() : null))
    .then(d => { if (d && typeof d.count === "number") el.textContent = d.count.toLocaleString("en-US"); })
    .catch(() => {});
}
function fillPoints() {
  const el = $("#dashPoints"); if (!el) return;
  fetch("/api/points/me", { cache: "no-store" })
    .then(r => (r.ok ? r.json() : null))
    .then(d => { if (d && typeof d.balance === "number") el.textContent = d.balance.toLocaleString("en-US"); })
    .catch(() => {});
}
function showDashboard(app) {
  setApplyStep(4);
  const html = dashboardMarkup(app);
  if (IS_APPLY() && $("#applyStage")) {
    const main = document.querySelector("main.apply"); if (main) main.classList.add("apply--wide");
    const rail = document.querySelector(".apply__rail"); if (rail) rail.style.display = "none";
    $("#applyStage").innerHTML = html;
    window.scrollTo({ top: 0 });
  } else {
    openModal(html);
  }
  const bm = $("#dashBurnMore"); if (bm) bm.onclick = stepBurn;
  const sx = $("#dashShare"); if (sx) sx.onclick = () => shareShame(app);
  animateRaiseCounter();
  fillHolders();
  fillPoints();
}
function dashboardMarkup(app) {
  const status = (app.status || "pending").toLowerCase();
  const approved = status === "approved", rejected = status === "rejected";
  const approval = app.approval || 0;
  const burns = Array.isArray(app.burns) ? app.burns : [];
  const handle = escapeHtml(app.handle || WL.handle || "anon");
  const lost = String(app.lost_usd || "").replace(/[^0-9.,]/g, "") || "0";
  const rank = app.spot ? "#" + String(app.spot).padStart(4, "0") : "#????";
  const pill = approved
    ? `<span class="dash-pill dash-pill--ok">WHITELISTED</span>`
    : rejected
    ? `<span class="dash-pill dash-pill--dead">DENIED</span>`
    : `<span class="dash-pill dash-pill--warn">PENDING REVIEW</span>`;
  const burnRows = burns.filter(b => b.tx).map((b, i) =>
    `<div><span>Burn ${i + 1}</span><b><a class="dash-link" href="${explorerTx(b.tx, app.chain_id)}" target="_blank" rel="noopener">${String(b.tx).slice(0, 8)}…${String(b.tx).slice(-6)} ↗</a></b></div>`
  ).join("");
  const headline = approved ? `You're whitelisted, ${handle}.` : rejected ? `Denied, ${handle}. Brutal.` : `Welcome to the treasury, ${handle}.`;
  const sub = approved
    ? `Certified exit liquidity. An admin signed off. Now you wait for the rug like everyone else.`
    : rejected
    ? `An admin passed on you. Burn more bags and resubmit if you want to be rugged this badly.`
    : `Your application is logged. You are officially the product. Here is the dashboard that proves it.`;

  return `
  <div class="dash">
    <div class="dash__bar">
      <div>
        <span class="dash__eyebrow">// EXIT LIQUIDITY TERMINAL</span>
        <h1 class="dash__title">${headline}</h1>
        <p class="dash__sub">${sub}</p>
      </div>
      <div class="dash__id">${pill}<span class="dash__rank">RANK ${rank}</span></div>
    </div>

    <div class="dash__hero">
      <span class="dash__hero-label">Capital raised to rug you</span>
      <div class="dash__hero-num" id="dashRaise">$100,000,000</div>
      <div class="dash__hero-bar"><div class="dash__hero-fill"></div></div>
      <span class="dash__hero-foot">97% of rug target reached — we just needed your bag to close it out.</span>
    </div>

    <div class="dash__grid">
      <div class="dash__card"><span>Your contribution</span><b class="down">$${lost}</b><small>already donated to exit scams</small></div>
      <div class="dash__card"><span>Bags burned for us</span><b>${app.burn_count || burns.length || 0}</b><small>thanks for the deflation</small></div>
      <div class="dash__card"><span>Case strength</span><b class="acid">${approval}%</b><small>an admin still decides by hand</small></div>
      <div class="dash__card"><span>NGMI points</span><b class="acid" id="dashPoints">—</b><small><a href="/tasks" style="color:inherit;border-bottom:2px solid var(--acid)">farm more →</a></small></div>
      <div class="dash__card"><span>Degens in line</span><b id="dashHolders">—</b><small>your fellow exit liquidity</small></div>
      <div class="dash__card"><span>Mint price</span><b class="down">NOT FREE</b><small>cheap maybe. free never, beggar.</small></div>
      <div class="dash__card"><span>Rug ETA</span><b class="down">SOON™</b><small>when you least expect it</small></div>
    </div>

    <div class="dash__panel">
      <div class="dash__panel-head"><span>// YOUR FILE</span>${pill}</div>
      <div class="dash__rows">
        <div><span>Degen</span><b>${handle}</b></div>
        <div><span>Rugged for</span><b class="down">$${lost}</b></div>
        <div><span>Plan this time</span><b>${escapeHtml(app.cope || "—")}</b></div>
        <div><span>Bag ATH (you said)</span><b>${escapeHtml(app.nft_ath || "—")}</b></div>
        ${burnRows || `<div><span>Bags burned</span><b>${app.burn_count || 0}</b></div>`}
        ${app.shame_tweet ? `<div><span>Shame tweet</span><b><a class="dash-link" href="${escapeHtml(app.shame_tweet)}" target="_blank" rel="noopener">view ↗</a></b></div>` : ""}
        <div><span>Status</span><b class="${approved ? "acid" : "down"}">${status.toUpperCase()}</b></div>
      </div>
    </div>

    <div class="dash__actions">
      <button class="btn btn--ghost" id="dashShare">Post my shame to X</button>
      ${approved ? "" : `<button class="btn btn--accent" id="dashBurnMore">${rejected ? "Burn more & resubmit" : "Burn more bags — raise your odds"}</button>`}
      <a class="btn btn--ghost" href="/ruglist">The Ruglist</a>
      <a class="btn btn--ghost" href="/">Back to site</a>
    </div>
    <p class="dash__fine">Parody / satire. The numbers are fake, the rug is a bit, no mint is promised. Do not actually burn or buy anything.</p>
  </div>`;
}

/* ----------------------------- DESIGN / MOTION ----------------------------- */
// Scroll-reveal: fade-and-rise sections as they enter the viewport.
function initReveal() {
  const targets = $$(".section__head, .manifesto li, .exhibit, .road__item, .faq__item, .report, .wl, .cta > *, .marquee, .dchat");
  targets.forEach(el => el.classList.add("reveal"));
  if (!("IntersectionObserver" in window)) { targets.forEach(el => el.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
  targets.forEach(el => io.observe(el));
}

// Subtle 3D tilt on the hero art as the cursor moves.
function initTilt() {
  const art = $(".hero__art"), card = $("#heroPepe");
  if (!art || !card || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  art.addEventListener("mousemove", (e) => {
    const r = art.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--ry", (x * 9).toFixed(2) + "deg");
    card.style.setProperty("--rx", (y * -7).toFixed(2) + "deg");
  });
  art.addEventListener("mouseleave", () => { card.style.setProperty("--ry", "0deg"); card.style.setProperty("--rx", "0deg"); });
}

// Count up the big stat when it scrolls into view.
function initCountUp() {
  const el = $(".report__quote b");
  if (!el) return;
  const target = parseInt(el.textContent.replace(/[^0-9]/g, ""), 10) || 0;
  if (!target || !("IntersectionObserver" in window)) return;
  el.textContent = "0";
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    const dur = 1400, t0 = (typeof performance !== "undefined" ? performance.now() : 0);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step); else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
  }, { threshold: 0.4 });
  io.observe(el.closest(".report") || el);
}

/* ----------------------------- CLEAN-URL ROUTER -----------------------------
   Homepage sections get real paths (/manifesto, /collection, ...) instead of #hash.
   In-page clicks scroll + pushState; direct loads / back-button jump to the section. */
const ROUTES = { "/whitelist": "wl" };
function scrollToRoute(path, smooth) {
  const id = ROUTES[path];
  const el = id && document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  else window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
}
function initRouter() {
  if (ROUTES[location.pathname]) requestAnimationFrame(() => scrollToRoute(location.pathname, false));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-route]");
    if (!a) return;
    const url = new URL(a.href, location.origin);
    if (url.origin !== location.origin || ROUTES[url.pathname] === undefined) return;
    e.preventDefault();
    history.pushState(null, "", url.pathname);
    scrollToRoute(url.pathname, true);
  });
  window.addEventListener("popstate", () => scrollToRoute(location.pathname, true));
}

// Mobile hamburger: toggle the dropdown nav; close it when a link is tapped.
// Highlight the nav link for the current page.
function markActiveNav(nav) {
  let p = location.pathname;
  if (p.length > 1 && p.slice(-1) === "/") p = p.slice(0, -1);
  nav.querySelectorAll(".nav__links a").forEach(a => {
    if (a.getAttribute("href") === p) a.classList.add("is-active");
  });
}
function initNavToggle() {
  const nav = document.querySelector(".nav"), tog = document.getElementById("navToggle");
  if (!nav) return;
  markActiveNav(nav);
  if (!tog) return;
  tog.addEventListener("click", () => {
    const open = nav.classList.toggle("nav--open");
    tog.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll(".nav__links a").forEach(a => a.addEventListener("click", () => nav.classList.remove("nav--open")));
}

/* ----------------------------- BOOT ----------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  document.body.classList.add("js");

  // The dedicated initiation page has its own flow.
  if (IS_APPLY()) { initApplyPage(); return; }

  initHeroArt();
  initMint();
  initGallery();
  initFaq();
  initReveal();
  initTilt();
  initCountUp();
  initRouter();
  initNavToggle();

  // Every whitelist button leaves the homepage for the dedicated /apply page.
  $$(".js-wl, #wlBtn").forEach(b =>
    b.addEventListener("click", e => { e.preventDefault(); window.location.href = "/apply"; })
  );
  document.title = `${BRAND.name} - 10,000 Pre-Rugged Pepes`;

  await checkAuth();
  // Already applied? Swap the "Join Whitelist" button for a "Dashboard" button.
  if (APP.user) {
    const app = await fetchMyApplication();
    if (app && app !== "warming") {
      const wl = $("#navWl");
      if (wl) {
        const a = document.createElement("a");
        a.className = "btn btn--accent";
        a.href = "/apply";
        a.id = "navWl";
        a.title = "Open your dashboard";
        a.textContent = "Dashboard →";
        wl.replaceWith(a);
      }
    }
  }

  // Point the "NGMI just tweeted" pill at the latest admin-set tweet.
  try {
    const tb = $("#tweetbarLink");
    if (tb) {
      const r = await fetch("/api/tweet", { cache: "no-store" });
      const d = await r.json();
      if (d && d.url) tb.href = d.url;
    }
  } catch {}
});
