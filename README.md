# T5D Website

**Tec5uport Dimension (T5D)** — Omnichain Intelligent Support Layer.

> One Platform. Infinite Support.

Live at [tec5uportdimension.com](https://tec5uportdimension.com), served via GitHub Pages from this repo's `main` branch (Cloudflare sits in front as DNS/CDN).

## Pages

- `index.html` — homepage (Website v2 design: Pentagon Framework, Five Pillars)
- `whitepaper.html` — Foundational Whitepaper v2.0
- `roadmap.html` — six-phase project roadmap
- `token-utility-research.html` — draft/research-only token utility notes
- `future-participation.html` — current participation status and scam-safety guidance
- `t5d-presale.html` — presale preparation page (no active sale yet)
- `404.html` — not-found redirect

All pages share `styles.css` and `script.js`. There is no other stylesheet or script file — if you ever see a page referencing `style.css` (singular) or `Script.js` (capitalized), that's stale/wrong; fix the reference rather than adding the old file back.

## Source docs

- `T5D_WHITEPAPER_V2.md`, `T5D_ROADMAP.md` — markdown sources linked from the corresponding HTML pages' download buttons
- `T5D_BRAND_GUIDE.md` — brand identity, pentagon symbolism, color palette

## Local preview

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## `main` is the only source of truth

This repo previously accumulated several branches (from Copilot's coding agent and other sessions) that were never merged and never had a PR opened — including one that held the *only* copies of `whitepaper.html`, `roadmap.html`, and this repo's brand docs. Nobody deleted them; they just silently diverged while `main` moved on, and the live site kept working only because Cloudflare's cache was serving old pages that no longer existed in the branch GitHub Pages actually builds. If Cloudflare's cache had been purged, several live pages would have 404'd with no warning.

**Going forward: don't create long-lived content branches for this repo.** Small changes should land on `main` directly (or through a short-lived branch with a PR merged same-day). If you do need a branch for something bigger, open a PR immediately and merge or close it — don't let it sit unmerged.

The one prior homepage design that predated the current one (a boot-animation "INITIALIZING..." loading screen) is preserved at git tag `archive/boot-animation-homepage-v1` for reference. It is not deployed and not linked from anywhere live — check it out only if you specifically need to see what it looked like.

## Notes for future edits

- Brand assets live under `assets/t5d-brand/` (PNG brand marks: shield, wordmark, badge) and `assets/icons/` (SVG pillar icons: support/community/intelligence/security/education) plus `assets/t5d-pentagon-layered.svg` (homepage hero graphic). Use `t5d-brand/t5d-shield-transparent-speck-clean.png` for favicons/brand-mark icons and `t5d-brand/t5d-wordmark-transparent.png` for the horizontal footer logo.
- The script file is `script.js` (lowercase). GitHub Pages serves from a case-sensitive filesystem, so a mismatched `<script src="Script.js">` reference will 404 in production even though it works fine locally on Windows.
- Any page-status language ("no token deployed", "no active sale") reflects real project state — don't change it without confirming the actual status first.
