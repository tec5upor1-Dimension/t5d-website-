# wallet-build — WalletConnect / Reown AppKit bundle (build tool, not part of the live site)

## Status: package.json is in place; `npm install` needs to finish on your machine

I tried running `npm install` for this folder through the device bridge from my
side, but it's a large dependency tree (`@reown/appkit` + `@reown/appkit-adapter-ethers`
+ `ethers`) and it kept exceeding the bridge's per-command time limit, which a
couple of times knocked over the isolated Linux VM the bridge uses on your
machine entirely. Rather than keep hammering that, the fastest path is for you
to run two commands yourself in a normal PowerShell window (no time limit
there):

```powershell
cd C:\Users\scvic\OneDrive\Documents\T5D\Github\t5d-website-\wallet-build
npm install
```

That alone can take a couple of minutes the first time (it's downloading
Reown's SDK and its dependencies) — just let it finish. When it's done you'll
have a `node_modules` folder and a `package-lock.json` in here.

## What happens after that

Once `npm install` has finished, tell me (or just let me check — I can read
files here quickly, it's only installs that are slow through the bridge). I'll
then:

1. Read the real, installed type definitions for `@reown/appkit` and
   `@reown/appkit-adapter-ethers` in `node_modules` — so the integration code
   is written against the actual current API, not guessed from possibly-stale
   training data.
2. Write `src/presale-connect.js` (a small wrapper: open the Reown modal, get
   an ethers-compatible signer back, hand it to the existing
   `presale-wallet.js` contribution flow).
3. Add `vite.config.js` (already drafted) if anything needs adjusting.
4. Run `npm run build` here, which compiles everything into one file:
   `presale-connect.bundle.js`, written to the site root (`t5d-website-/`,
   one level up from this folder).
5. Add one `<script src="presale-connect.bundle.js">` line to
   `t5d-presale.html` and wire the "Connect Wallet" button to also offer
   "Connect via WalletConnect" as a second option alongside the existing
   injected-wallet (MetaMask/Rabby/browser-extension) flow.

## The one thing you need to get yourself: a Reown Project ID

This step doesn't need me. Go to **https://dashboard.reown.com**, sign up
(free), and create a project. Free "Starter" tier is $0 — 500 monthly active
wallets and 2.5M RPC calls/month, more than enough for a presale. Copy the
**Project ID** it gives you (a short alphanumeric string) and send it to me —
it's not a secret in the sense of a private key, but it does identify your
app's usage, so don't publish it anywhere other than here or the eventual
config file. I'll drop it into the config so the built bundle points at your
project.

## Nothing here touches the live site until step 4 above runs

This whole `wallet-build/` folder (including `node_modules` once it exists)
is a build-time-only tool. GitHub Pages doesn't run npm and doesn't build
anything — it just serves whatever static files are already in the repo. So
none of this can accidentally break the live presale page; the live page only
changes when the compiled `presale-connect.bundle.js` gets written and
referenced, which is the last step above.
