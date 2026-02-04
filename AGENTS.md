# Agent Instructions for nteract-elements

This document provides guidance for AI agents working on component intake and development.

## Repository Overview

nteract-elements is a design system for Jupyter frontends. It provides:

- **UI primitives** (`registry/primitives/`) — shadcn/ui components
- **Cell components** (`registry/cell/`) — Notebook cell UI components
- **Output renderers** (`registry/outputs/`) — Jupyter cell output components
- **Documentation** (`content/docs/`) — MDX documentation with live examples

The `components/` folder is for fumadocs site internals only — **not** for published components.

## Directory Structure

```
registry/
├── primitives/      # shadcn/ui primitives (via CLI)
├── cell/            # Notebook cell components
└── outputs/         # Jupyter output renderers

components/
└── ai/              # Fumadocs site internals only (not published)

content/docs/
├── ui/              # UI primitive docs
├── cell/            # Cell component docs
└── outputs/         # Output renderer docs
```

## Adding shadcn/ui Components

**Always use the shadcn CLI. Do not manually copy component code.**

### Step-by-step process

1. **Create a branch:**
   ```bash
   git checkout -b component/<component-name>
   ```

2. **Add the component via CLI:**
   ```bash
   pnpm dlx shadcn@latest add <component-name>
   ```
   
   The CLI places components in `registry/primitives/` (configured via `components.json`).

3. **Verify the build:**
   ```bash
   pnpm run types:check
   ```

4. **Add entry to `registry.json`** with correct path in `registry/primitives/`

5. **Add MDX documentation** at `content/docs/ui/<component-name>.mdx`:
   - Import the component from `@/registry/primitives/<component-name>`
   - Include interactive examples
   - Document all props
   - Show installation instructions

6. **Update navigation** in `content/docs/ui/meta.json`

7. **Commit with issue reference:**
   ```bash
   git add -A
   git commit -m "Add <ComponentName> component

   - Add component via shadcn CLI
   - Add MDX documentation with examples

   Closes #<issue-number>"
   ```

8. **Push and create PR:**
   ```bash
   git push -u origin component/<component-name>
   ```

## Adding Notebook Cell Components

For components from `intheloop` that aren't standard shadcn:

1. Review source at `runtimed/intheloop/src/components/notebook/cell/...`
2. Copy and adapt:
   - Update imports to use `@/lib/utils` for `cn()`
   - Update imports to use `@/registry/primitives/<component>` for UI primitives
   - Remove app-specific dependencies (trpc, auth, signals, `@runtimed/schema`)
3. Place in `registry/cell/`
4. Add entry to `registry.json`
5. Add MDX documentation at `content/docs/cell/<component>.mdx`
6. Create PR

## Key Files

- `components.json` — shadcn configuration (ui alias points to `registry/primitives`)
- `registry.json` — nteract registry for distributable components
- `content/docs/ui/meta.json` — UI docs navigation
- `content/docs/cell/meta.json` — Cell docs navigation
- `content/docs/outputs/meta.json` — Output docs navigation

## MDX Documentation Template

```mdx
---
title: Component Name
description: Brief description of the component
icon: LucideIconName
---

import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { ComponentName } from '@/registry/primitives/component-name';

<div className="my-8">
  <ComponentName>Live Example</ComponentName>
</div>

Brief description paragraph.

## Installation

<Tabs items={['CLI', 'Manual']}>
  <Tab value="CLI">
    ```bash
    npx shadcn@latest add https://nteract-elements.vercel.app/r/component-name.json
    ```
  </Tab>
  <Tab value="Manual">
    Copy from the [nteract/elements registry](https://github.com/nteract/elements/tree/main/registry/primitives).
  </Tab>
</Tabs>

## Usage

```tsx
import { ComponentName } from "@/registry/primitives/component-name"

export function Example() {
  return <ComponentName>Example</ComponentName>
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `"default" \| "other"` | `"default"` | Visual variant |
| `className` | `string` | — | Additional CSS classes |
```

## Checklist Before Creating PR

- [ ] Component placed in correct `registry/` subfolder
- [ ] Entry added to `registry.json` with correct path
- [ ] Imports use `@/registry/primitives/` for UI dependencies
- [ ] Build passes: `pnpm run types:check`
- [ ] MDX documentation created with interactive examples
- [ ] Navigation updated in appropriate `meta.json`
- [ ] Commit message references the GitHub issue (`Closes #N`)

## Utilities

- **Class merging:** Import `cn` from `@/lib/utils`
- **Icons:** Use `lucide-react` (already installed)
- **Variants:** Use `class-variance-authority` for component variants

## Issue Status

### Sprint 1 & 2 Complete ✅ (#4 closed)

**UI Primitives (`registry/primitives/`):**
- Badge, Button, Card, Dialog, DropdownMenu, Input, Kbd, Label, Popover, Separator, Sheet, Spinner, Tabs, Textarea, Tooltip

**Cell Primitives (`registry/cell/`):**
- CellContainer, CellControls, CellHeader, CellTypeButton, ExecutionCount, ExecutionStatus, OutputArea, PlayButton, RuntimeHealthIndicator

**Output Renderers (`registry/outputs/`):**
- ansi-output, html-output, image-output, json-output, markdown-output, svg-output, media-router

### Sprint 3 In Progress (#46)

**shadcn Primitives:**
- Avatar, Command, Collapsible, Skeleton, Switch, HoverCard, Slider, Alert, AlertDialog

**Cell Components:**
- CellTypeSelector — Type switcher dropdown (from intheloop)

**Collaboration Components:**
- PresenceBookmarks — Show users present on a cell
- CollaboratorAvatars — Notebook-level presence indicator

**Layout & Empty States:**
- Empty — Empty state container with slots
- ButtonGroup — Group buttons with proper borders

### Deferred

- #10 — Dynamic registry API route
- Editor integration (CodeMirror) — separate concern
- Toolbars (AI, SQL) — too coupled to app logic
- CellAdder / CellBetweener — require hook abstraction

## Source Inventory (intheloop)

### Ready to import (low coupling)

| Component | Source | Notes |
|-----------|--------|-------|
| CellTypeSelector | `cell/shared/CellTypeSelector.tsx` | Strip feature flags → use `enabledTypes` prop |
| PresenceBookmarks | `cell/shared/PresenceBookmarks.tsx` | Strip hooks → accept users as prop |
| CollaboratorAvatars | `CollaboratorAvatars.tsx` | Strip auth → accept users as prop |
| Empty | `ui/empty.tsx` | Minimal changes needed |
| ButtonGroup | `ui/button-group.tsx` | Minimal changes needed |

### Do NOT import (too coupled)

| Component | Reason |
|-----------|--------|
| `Cell.tsx` | Router component, not reusable |
| `ExecutableCell.tsx` | 25KB, deeply coupled to livestore/signals/auth |
| `MarkdownCell.tsx` | 12KB, coupled to editor integration |
| `Editor.tsx` | CodeMirror integration — separate concern |
| `AiToolbar.tsx` | AI streaming, model selection, feature flags |

## Questions?

See `contributing/triage.md` for detailed triage criteria and source inventory.