# mockingbird

A lightweight template repo for prototyping web apps with Claude Code.

Built around a Chrome-devtools-style **device-mockup viewer** so you can see your prototype rendered at real device viewports as you build — without the Figma → code translation tax.

## Stack

- **Bun** — runtime + package manager
- **Vite 6** — dev server + bundler
- **React 19 + TypeScript**
- **TanStack Router** — typed routing, URL-synced state
- **Tailwind v4** — CSS-first, no config file
- **Dexie** *(opt-in)* — IndexedDB wrapper for prototypes that need persistence

## Getting started

```bash
bun create mockingbird my-app
cd my-app
bun install
bun dev
```

Or clone this repo directly and use it as a template via the **Use this template** button on GitHub.

Open <http://localhost:5173>. You'll see the viewer with the prototype iframed inside an iPhone 15 Pro frame.

## Layout

| Route | What it is |
| --- | --- |
| `/` | Viewer — toolbar + device frame wrapping an iframe of `/app` |
| `/app/*` | Your prototype. **This is where you build.** |

Open `/app` directly in another tab whenever you want the prototype full-screen.

## Viewer features

- 8 device presets (iPhone 15 Pro, iPhone SE, Pixel 8, iPad Air, iPad Pro 11", Desktop 1280/1440/1920) + custom `W × H`
- Rotate, zoom (fit / 50–150% / custom)
- All state in the URL — bookmark a specific viewport, share it
- Keyboard: `R` rotate · `[` `]` cycle devices · `+` `-` zoom · `0` reset zoom · `F` fit

Why an iframe? It gives the prototype its own `window.innerWidth`, so Tailwind `sm:`/`md:`/`lg:` and `@media` queries fire correctly per device. Same trick Chrome devtools uses.

## What to edit

- `src/routes/app/home.tsx` — the prototype landing page (replace with your app)
- `src/routes/app/shell.tsx` — app-wide layout, providers
- `src/router.tsx` — add more `/app/*` routes here

## What to leave alone (unless you need to)

- `src/viewer/*` — the device viewer
- `src/routes/viewer.tsx` — viewer page and URL schema

## Opt-in database

`src/db/` ships unwired. See `src/db/README.md` for the one-line enable.

## Build

```bash
bun run build       # type-check + production build
bun run preview     # serve the built bundle
```

## Using this as a template

1. Click **Use this template** on GitHub to create a new repo
2. Rename in `package.json` and `index.html`
3. Replace `src/routes/app/home.tsx` with your prototype
4. Tell Claude Code what to build
