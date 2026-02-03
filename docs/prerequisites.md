# Prerequisites

Requirements for working with nteract-elements.

## Environment

- **Node.js 18 or later** — required for build tooling and CLI commands
- **pnpm** — recommended package manager (npm/yarn also work)

## Framework targets

nteract Elements is built targeting:

- **React 19** — no `forwardRef` usage, modern React patterns
- **Tailwind CSS 4** — utility-first styling with CSS variables
- **shadcn/ui** — component patterns and primitives

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Initialize shadcn (if not already configured)

```bash
pnpm dlx shadcn@latest init
```

This creates `components.json` and sets up the components directory structure.

### 3. Run the dev server

```bash
pnpm dev
```

Open http://localhost:3000 to view the docs site.

## Build pipeline

The repo uses `shadcn build` in the prebuild step:

```json
{
  "scripts": {
    "prebuild": "shadcn build",
    "build": "next build"
  }
}
```

This generates registry artifacts from configured components before the Next.js build runs.

## Adding shadcn primitives

To add upstream shadcn components:

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input popover tooltip
```

Components are copied into your `components/ui/` directory where you can modify them.

## Key conventions

- **`cn()` utility** — use for merging Tailwind classes (from `tailwind-merge`)
- **CSS variables** — theming via CSS custom properties
- **TypeScript** — all components should export prop types
- **Composability** — prefer small, composable pieces over monolithic components

## Dependencies already in this repo

- `react` ^19
- `tailwindcss` ^4
- `tailwind-merge` — class merging utility
- `lucide-react` — icon library
- `shadcn` — CLI for component management (devDependency)

## Optional: Node version enforcement

The repo includes an `engines` field in `package.json`:

```json
{
  "engines": {
    "node": ">=18"
  }
}
```

This warns users on older Node versions during install.