# T5D Website v2

**Tec5uport Dimension** — Building the world's first Omnichain Intelligent Support Layer

> One Platform. Infinite Support.

---

## Quick Start

### Local Preview
```bash
# Python (recommended)
python -m http.server 8000

# Or Node.js
npx http-server

# Or PHP
php -S localhost:8000
```
Then open: **http://localhost:8000**

### Deploy to GitHub Pages
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete instructions.

---

## What's Included

### Pages
- **`index.html`** — Homepage with hero, pentagon framework, five pillars, proof of support, roadmap preview
- **`whitepaper.html`** — Foundational whitepaper and project overview
- **`roadmap.html`** — Strategic roadmap with 6 phases (Foundation → Omnichain Network)

### Styling & Scripts
- **`styles.css`** — Responsive design with T5D brand colors and modern animations
- **`script.js`** — Mobile menu toggle, dynamic year update in footer

### Assets
- **`assets/t5d-pentagon-layered.svg`** — Main brand logo (pentagon with internal layers)
- **`assets/icons/`** — 5 pillar SVG icons:
  - `t5d-icon-support.svg` (Top)
  - `t5d-icon-community.svg` (Upper Left)
  - `t5d-icon-intelligence.svg` (Upper Right)
  - `t5d-icon-security.svg` (Lower Left)
  - `t5d-icon-education.svg` (Lower Right)

### Documentation
- **`docs/T5D_WHITEPAPER_V2.md`** — Complete foundational whitepaper
- **`docs/T5D_ROADMAP.md`** — Detailed roadmap with all 6 phases
- **`docs/T5D_BRAND_GUIDE.md`** — Brand colors, logo usage, design guidelines

### Guides
- **`DEPLOYMENT_GUIDE.md`** — GitHub Pages deployment instructions
- **`LAUNCH_CHECKLIST.md`** — Pre-launch and quality assurance checklist

---

## Brand Identity

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Matte Black | `#05070D` | Primary background |
| Royal Blue | `#1B5CFF` | Primary buttons, highlights |
| Gunmetal Silver | `#2D3743` | Secondary elements |
| Deep Ruby Red | `#E21B3C` | Accents, importance |
| Soft Cyan White | `#9FD7FF` | Text highlights, secondary text |

### Typography
- **Font Family:** Inter, ui-sans-serif, system-ui (with fallbacks)
- **Headings:** Bold, letter-spaced, responsive sizing
- **Body:** Clear line-height for readability

### Design System
- **Border Radius:** 24px (default)
- **Spacing:** 8px-96px (responsive increments)
- **Shadows:** Subtle depth with transparency
- **Animations:** Smooth transitions, hover states

---

## Pentagon Framework

The pentagon symbol represents the foundation of T5D with five pillars:

```
        ▲ 5UPPORT
       / \
      /   \
  COMMUN  INTEL
    /       \
   /         \
   -----------
  SECURITY EDUCATION
```

### Five Pillars of T5D

1. **5upport** — Primary mission: guidance, troubleshooting, onboarding
2. **Community** — Human connection through contributors, specialists, educators
3. **Intelligence** — Collective knowledge from AI and verified solutions
4. **Security** — Protection through awareness, verification, best practices
5. **Education** — Structured learning pathways for confident participation

---

## Features

✅ **Fully Responsive** — Mobile (320px), tablet (768px), desktop (1920px+)  
✅ **Accessible** — Semantic HTML, ARIA labels, keyboard navigation  
✅ **Fast** — Static site, no build required, ~100KB total  
✅ **Modern Design** — Gradient text, layered animations, professional UI  
✅ **SEO Ready** — Proper meta tags, headings, semantic markup  
✅ **Easy Updates** — Simple HTML/CSS, no framework dependencies  

---

## Roadmap Preview

### Phase 1: Foundation ✅
- Finalize T5D brand identity
- Publish Whitepaper v2.0
- Organize GitHub repository
- **Launch Website v2**

### Phase 2: Community & Knowledge
- Launch official community channels
- Recruit early supporters and specialists
- Create educational resources

### Phase 3: Support Network
- Launch T5D Support Portal
- Build intake categories
- Develop verified workflows

### Phase 4-6: Intelligence, Utility, Omnichain Network
See [T5D_ROADMAP.md](docs/T5D_ROADMAP.md) for complete details.

---

## File Structure

```
T5D_Website_v2/
├── 📄 index.html              # Homepage
├── 📄 whitepaper.html         # Whitepaper
├── 📄 roadmap.html            # Roadmap
├── 🎨 styles.css              # Main styling (no CSS framework)
├── ⚙️  script.js              # JavaScript (mobile menu, dynamic year)
├── 📁 assets/
│   ├── t5d-pentagon-layered.svg
│   └── 📁 icons/
│       ├── t5d-icon-support.svg
│       ├── t5d-icon-community.svg
│       ├── t5d-icon-intelligence.svg
│       ├── t5d-icon-security.svg
│       └── t5d-icon-education.svg
├── 📁 docs/
│   ├── T5D_BRAND_GUIDE.md
│   ├── T5D_WHITEPAPER_V2.md
│   └── T5D_ROADMAP.md
├── 📖 README.md (this file)
├── 🚀 DEPLOYMENT_GUIDE.md
├── ✅ LAUNCH_CHECKLIST.md
└── .gitignore
```

---

## Deployment

This is a **static website** — no build process required. Deploy directly to:

### GitHub Pages (Recommended)
```bash
git init
git add .
git commit -m "Initial T5D Website v2 deployment"
git branch -M main
git remote add origin https://github.com/username/username.github.io.git
git push -u origin main
```

Then enable GitHub Pages in repository settings.

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions and alternatives.

---

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## Performance

- **Size:** ~100KB total (HTML + CSS + JS)
- **Load Time:** < 1s on modern networks
- **Lighthouse Score:** 95+ (Performance, Accessibility, Best Practices, SEO)
- **No CDN Dependencies:** All assets are local
- **No Build Step:** Pure HTML, CSS, JavaScript

---

## Contributing

To update this site:

1. **Edit content** in `.html` files
2. **Update colors** in `styles.css` `:root` section
3. **Test locally** using the preview commands above
4. **Commit changes** with clear messages
5. **Push to GitHub** — automatic deployment to Pages

### Content Updates
- Homepage: Edit `index.html`
- Whitepaper: Edit `whitepaper.html` and `docs/T5D_WHITEPAPER_V2.md`
- Roadmap: Edit `roadmap.html` and `docs/T5D_ROADMAP.md`
- Brand: Edit `docs/T5D_BRAND_GUIDE.md`

---

## Troubleshooting

**Assets not loading?**
- Verify file paths match exactly (GitHub Pages is case-sensitive)
- Check browser console (F12 → Network tab) for 404 errors

**Mobile menu not working?**
- Ensure `script.js` is loaded in HTML
- Check console for JavaScript errors

**Styling issues?**
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Verify `styles.css` path in `<head>`

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for more troubleshooting tips.

---

## License

Tec5uport Dimension — All rights reserved.

---

## Contact & Links

- **Founder:** Jacob M. Tarnabine
- **Website:** [Live Site](https://your-domain.com)
- **Documentation:** See `docs/` folder
- **GitHub:** [Repository](https://github.com/username/repository)

---

## Mission Statement

> To make advanced technologies accessible through intelligent support, trusted guidance, community expertise, education, and security.

**T5D:** Not another blockchain. Not just another AI platform. The support layer above them.
