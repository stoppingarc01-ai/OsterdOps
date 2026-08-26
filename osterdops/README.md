# OsterdOps

**AI Cost Governance & Operations Platform**

Gain total visibility and control over your AI infrastructure spend.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + CSS design tokens
- **Theme:** next-themes (light/dark)
- **Fonts:** Geist Sans & Geist Mono (via `next/font`)

## Getting Started

```bash
cd osterdops
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Design system & global styles
│   ├── (marketing)/        # Public pages layout
│   ├── (auth)/             # Auth pages layout
│   └── dashboard/          # Dashboard layout + pages
│
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── layout/             # Layout components (Navbar, Sidebar, etc.)
│   ├── marketing/          # Marketing page components
│   └── dashboard/          # Dashboard-specific components
│
├── lib/                    # Utilities
├── config/                 # Centralized configuration
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── constants/              # Application constants

docs/                       # Documentation
tests/                      # Test files
```

## Design System

The visual identity uses the **"Dragon God Silver / White"** theme:

- **Light mode:** Clean silver/slate-white backgrounds, white surfaces, obsidian typography
- **Dark mode:** Deep obsidian backgrounds, charcoal surfaces, silver/white typography

All design tokens are defined as CSS variables in `globals.css` and registered with Tailwind v4 via `@theme inline`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm start` | Start production server |
