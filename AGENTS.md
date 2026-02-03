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
    npx shadcn@latest add component-name
    ```
  </Tab>
  <Tab value="Manual">
    Copy from [shadcn/ui](https://ui.shadcn.com/docs/components/component-name).
  </Tab>
</Tabs>

## Usage

```tsx
import { ComponentName } from "@/registry/primitives/component-name"

export function Example() {
  return <ComponentName>Example</ComponentName>
}
```

## Examples

### Variant Name

<div className="my-4">
  <ComponentName variant="example">Example</ComponentName>
</div>

```tsx
<ComponentName variant="example">Example</ComponentName>
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

Component intake is tracked in issue #4.

### Completed

- #5 — Button and Input ✅
- #6 — Badge, Kbd, Spinner ✅
- #7 — Card, Popover, Tooltip ✅
- #14 — DropdownMenu ✅
- #15 — PlayButton ✅
- #16 — ExecutionStatus ✅
- #17 — CellTypeButton ✅

### In Progress

- #18 — CellControls (needs DropdownMenu ✅)
- #19 — CellContainer (refactor needed)
- #20 — CellHeader (refactor needed)
- #9 — RuntimeHealthIndicator

### Deferred

- #10 — Dynamic registry API route

## Questions?

See `contributing/triage.md` for detailed triage criteria and source inventory.