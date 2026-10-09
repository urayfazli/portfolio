# 0xray — Web3 Portfolio (static site)

Vanilla HTML/CSS/JS portfolio with parallax scrolling.
Design: Binance design tokens (`../DESIGN.md`) + shadcn-style components.

## Structure

```
site/
├── index.html          # all sections
├── css/styles.css      # tokens, components, responsive
├── js/app.js           # parallax (translate3d + rAF), starfield, reveals, nav
├── favicon.svg         # "0x" monogram
├── apple-touch-icon.png# 180×180
└── assets/             # <-- put profile.jpg here (see below)
```

## Profile photo

To show your own photo in the hero section:

1. Save a **square** image (min 512×512 px) as `assets/profile.jpg`
   → full path: `~/workspace/portfolio-web3/site/assets/profile.jpg`
2. Done — the site picks it up automatically.

If the file is missing, a styled placeholder avatar ("0x" on dark, yellow ring)
is shown instead, so the layout never breaks.

## Placeholders still needing Ray's data

- **X / Twitter handle** — contact section shows a clearly-marked placeholder card.
- Node/project cards are intentionally generic (no invented metrics).

## Preview

Open `index.html` directly in a browser, or serve locally:

```bash
cd ~/workspace/portfolio-web3/site && python3 -m http.server 8080
```
