# Agent Instructions for nteract-elements

This document provides guidance for AI agents working on component development.

## Repository Overview

nteract-elements is a design system for Jupyter frontends. It provides:

- **Cell components** (`registry/cell/`) — Notebook cell UI components
- **Output renderers** (`registry/outputs/`) — Jupyter cell output components
- **Widget components** (`registry/widgets/`) — Jupyter widget implementations (ipywidgets)
- **Editor** (`registry/editor/`) — CodeMirror editor integration
- **Documentation** (`content/docs/`) — MDX documentation with live examples

UI primitives (button, badge, avatar, etc.) come from **upstream shadcn/ui**. They are not published in the nteract registry. The docs site installs them into `components/ui/` via the shadcn CLI.

## Directory Structure

```
registry/
├── cell/            # Notebook cell components (published)
├── outputs/         # Jupyter output renderers (published)
├── editor/          # CodeMirror editor (published)
└── widgets/         # Jupyter widget implementations (published)
    └── controls/    # ipywidgets control implementations

components/
├── ui/              # shadcn/ui primitives (installed via CLI, not published)
├── ai/              # Fumadocs site internals only
└── docs/            # Docs site helpers

content/docs/
├── ui/              # UI primitive docs
├── cell/            # Cell component docs
├── outputs/         # Output renderer docs
└── widgets/         # Widget docs
```

## Adding shadcn/ui Components (for docs site only)

Primitives are **not published** in the nteract registry — consumers get them from upstream shadcn. To add a new primitive for the docs site:

```bash
pnpm dlx shadcn@latest add <component-name>
```

The CLI installs into `components/ui/` (configured via `components.json`). No `registry.json` entry needed for primitives.

## Adding Notebook Components

For components that aren't standard shadcn:

1. Place in appropriate `registry/` subfolder
2. Use proper imports:
   - `@/lib/utils` for `cn()`
   - `@/components/ui/<component>` for UI primitives
3. Add entry to `registry.json`
4. Add MDX documentation at `content/docs/<category>/<component>.mdx`
5. Update navigation in appropriate `meta.json`
6. Create PR

## Key Files

- `components.json` — shadcn configuration (ui alias points to `components/ui`)
- `registry.json` — nteract registry for distributable components
- `content/docs/*/meta.json` — Documentation navigation

## MDX Documentation Template

```mdx
---
title: Component Name
description: Brief description of the component
icon: LucideIconName
---

import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { RegistrySetup } from '@/components/docs/registry-setup';
import { ComponentName } from '@/registry/category/component-name';

<div className="my-8">
  <ComponentName>Live Example</ComponentName>
</div>

Brief description paragraph.

## Installation

<Tabs items={['CLI', 'Manual']}>
  <Tab value="CLI">
    ```bash
    npx shadcn@latest add @nteract/component-name
    ```
    <RegistrySetup />
  </Tab>
  <Tab value="Manual">
    Copy from registry and install dependencies.
  </Tab>
</Tabs>

## Usage

\`\`\`tsx
import { ComponentName } from "@/registry/category/component-name"

export function Example() {
  return <ComponentName>Example</ComponentName>
}
\`\`\`

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `"default" \| "other"` | `"default"` | Visual variant |
| `className` | `string` | — | Additional CSS classes |
```

## Checklist Before Creating PR

- [ ] Component placed in correct `registry/` subfolder
- [ ] Entry added to `registry.json` with correct path
- [ ] CSS variables (if any) match between `app/global.css` and `registry.json`
- [ ] Imports use `@/components/ui/` for UI dependencies
- [ ] Build passes: `pnpm run types:check`
- [ ] MDX documentation created with interactive examples
- [ ] Navigation updated in appropriate `meta.json`

## CSS Variables

Components using CSS variables must define them in **two places**:

1. **`app/global.css`** — For the docs site (`:root` for light, `.dark` for dark)
2. **`registry.json`** — Under `cssVars.light` and `cssVars.dark` for the component

The shadcn CLI reads `cssVars` from registry.json and injects them into consumer CSS. If values don't match global.css, consumers get different colors than the docs site.

**When changing CSS variables:**
- Update both files with identical values
- Test in both light and dark modes

See `contributing/css-variables.md` for full details and examples.

## Utilities

- **Class merging:** Import `cn` from `@/lib/utils`
- **Icons:** Use `lucide-react` (already installed)
- **Variants:** Use `class-variance-authority` for component variants

## What's Implemented

**Cell Components** (`registry/cell/`):
CellContainer, CellControls, CellHeader, CellTypeButton, CellTypeSelector, CollaboratorAvatars, ExecutionCount, ExecutionStatus, OutputArea, PlayButton, PresenceBookmarks, RuntimeHealthIndicator

**Output Renderers** (`registry/outputs/`):
ansi-output, html-output, image-output, json-output, markdown-output, svg-output, media-router, media-provider

**Widgets** (`registry/widgets/`):
Full ipywidgets implementation including sliders, buttons, text inputs, dropdowns, progress bars, media widgets, layout containers (Box, HBox, VBox, Grid, Tab, Accordion, Stack), and anywidget support.

**Editor** (`registry/editor/`):
CodeMirror editor integration

**UI Primitives** (`components/ui/` — from upstream shadcn):
accordion, alert, alert-dialog, avatar, badge, button, button-group, card, checkbox, collapsible, command, dialog, dropdown-menu, empty, hover-card, input, kbd, label, popover, progress, radio-group, select, separator, sheet, skeleton, slider, spinner, switch, tabs, textarea, toggle, toggle-group, tooltip
