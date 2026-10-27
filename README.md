# Interactive KLCC 3D Hero

React + Three.js + Tailwind (Vite) hero page of the Petronas Twin Towers, deployed as a static site on Cloudflare Workers.

## Develop

```bash
npm install
npm run dev        # Vite dev server
npm run preview    # build, then serve with the local Cloudflare runtime (wrangler dev)
```

## Deploy

```bash
npx wrangler login # once
npm run deploy     # build + wrangler deploy
```

Config lives in `wrangler.jsonc` (static assets from `dist/`, SPA fallback). `public/_headers` sets long-lived caching for hashed files in `/assets/*`.
