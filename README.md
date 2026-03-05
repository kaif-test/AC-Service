# AC Pro — Landing Page

High-converting AC service lead capture landing page built with React + Vite.

## Quick Start

```bash
# Install dependencies
bun install

# Start dev server (http://localhost:5173)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Features

- 📱 Mobile-first responsive design
- 🎯 Single lead form (Name / Phone / Area)
- 🔒 UTM parameter capture (utm_source, utm_campaign, ad_id)
- 🎉 On-page success state + toast notification
- ♿ Accessible (ARIA labels, focus outlines, reduced motion)
- ⚡ Sticky header, mobile sticky CTA bar
- 📊 Meta Pixel + GA4 placeholder hooks

## Customize

1. **Phone number** — search `+91 9082333734` and replace with your number
2. **Meta Pixel** — add your Pixel ID in `index.html`
3. **GA4** — add your Measurement ID in `index.html`
4. **Form submission** — replace the `setTimeout` mock in `LeadForm` with your API call
5. **Colors** — edit CSS variables in `src/index.css`
