# T5D Website

**Tec5uport Dimension (T5D)** — Omnichain Intelligent Support Layer.

> One Platform. Infinite Support.

Live at [tec5uportdimension.com](https://tec5uportdimension.com), served via GitHub Pages from this repo's `main` branch (Cloudflare sits in front as DNS/CDN).

## Pages

- `index.html` — homepage (Pentagon Framework, Five Pillars, boot animation)
- `whitepaper.html` — Foundational Whitepaper v2.0
- `roadmap.html` — six-phase project roadmap
- `token-utility-research.html` — draft/research-only token utility notes
- `future-participation.html` — current participation status and scam-safety guidance
- `t5d-presale.html` — presale preparation page (no active sale yet)
- `404.html` — not-found redirect

## Source docs

- `T5D_WHITEPAPER_V2.md`, `T5D_ROADMAP.md` — markdown sources linked from the corresponding HTML pages' download buttons
- `T5D_BRAND_GUIDE.md` — brand identity, pentagon symbolism, color palette

## Local preview

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes for future edits

- `styles.css` is the shared stylesheet for `whitepaper.html`, `roadmap.html`, `token-utility-research.html`, `future-participation.html`, and `t5d-presale.html`. `style.css` (singular) is used only by `index.html`'s boot-animation homepage — they are intentionally separate.
- Brand assets live under `assets/t5d-brand/`. Use `t5d-shield-transparent-speck-clean.png` for icons/favicons and `t5d-wordmark-transparent.png` for the horizontal footer logo — don't reference `.svg` brand assets, none currently exist in this repo.
- The script file is `script.js` (lowercase). GitHub Pages serves from a case-sensitive filesystem, so a mismatched `<script src="Script.js">` reference will 404 in production even though it works fine locally on Windows.
- Any page-status language ("no token deployed", "no active sale") reflects real project state — don't change it without confirming the actual status first.
