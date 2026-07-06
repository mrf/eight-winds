# Eight Winds

A contemplative tracker for the **eight worldly winds** (aṭṭha lokadhammā) — gain and loss,
status and disrepute, praise and blame, pleasure and pain. Not a mood tracker: the unit of
observation is *which wind is blowing, and how the mind is meeting it*. See
[DESIGN.md](DESIGN.md) for the full design document.

- **Local-only.** No server, no account, no analytics. Entries live in IndexedDB on your
  device; export/import is a first-class practice, not an afterthought.
- **PWA.** Installable, fully offline, < 20 KB gzipped of JavaScript.
- **Free, forever, as dāna.** MIT-licensed static site.

## Development

```sh
npm install
npm run dev        # local dev server
npm test           # vitest suite
npm run lint       # eslint, strictest settings, warnings are errors
npm run build      # tsc -b + vite build (dist/)
npm run verify     # lint + test + build
npm run icons      # regenerate public/ icons (no image deps)
```

Stack: Preact + Vite + TypeScript (full strict family), `idb` for IndexedDB,
hand-rolled SVG charts, `vite-plugin-pwa` (Workbox) for offline. Deploys to GitHub Pages
via `.github/workflows/deploy.yml` on push to `main`.

## Source text

> "Gain and loss, status and disgrace, censure and praise, pleasure and pain: these
> conditions among human beings are inconstant, impermanent, subject to change."
> — [AN 8:6, Lokavipatti Sutta](https://suttacentral.net/an8.6)
