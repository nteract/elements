# nteract-elements

An opinionated starting point for building Jupyter frontends. A design system and component library for notebooks, cells, outputs, terminals, sidecars, and the broader interactive computing ecosystem.

We follow shadcn/ui conventions (copy-into-repo, Tailwind + CSS variables, composable primitives) so you can adopt upstream UI primitives while building Jupyter-specific components on top.

## Prerequisites

Before installing nteract Elements, make sure your environment meets the following requirements:

- Node.js 18 or later
- shadcn/ui installed in your project. If you don't have it installed, running any install command will automatically install it for you.

nteract Elements is built targeting React 19 (no `forwardRef` usage) and Tailwind CSS 4.

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 to see the docs site.

## What this repo provides

- **Documentation site** — Fumadocs-powered docs and component examples
- **Component area** — `components/` for in-repo UI components following shadcn patterns
- **Registry integration** — `shadcn build` in prebuild for shadcn-style component distribution

## Component priority

We're actively building out the component library. Priority order:

1. **Atomic primitives** — Button, Input, Badge, Avatar, Kbd, Spinner
2. **Layout utilities** — Card, Popover, Tooltip, Sidebar, Tabs, Dialog
3. **Notebook primitives** — Cell, CellAdder, CellToolbar, ExecutionCount
4. **Output renderers** — ANSI, JSON, Markdown, HTML, Images, Plots, DataFrames
5. **Higher-level notebook UI** — NotebookContent, NotebookSidebar, RuntimeHealthIndicator

See `contributing/triage.md` for the component intake process.

## Project structure

| Path | Purpose |
|------|---------|
| `components/` | In-repo UI components |
| `registry/` | shadcn registry definitions |
| `app/docs/` | Documentation pages |
| `content/docs/` | MDX documentation source |
| `contributing/` | Contributor docs (triage process, prerequisites) |

## Learn more

- [nteract](https://nteract.io) — the nteract project
- [Fumadocs](https://fumadocs.dev) — documentation framework
- [shadcn/ui](https://ui.shadcn.com) — component patterns we follow