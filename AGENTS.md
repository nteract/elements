# Agent Instructions for nteract-elements

This document provides guidance for AI agents working on component intake and development.

## Repository Overview

nteract-elements is a design system for Jupyter frontends. It provides:

- **UI primitives** (`components/ui/`) — shadcn/ui components
- **Output renderers** (`registry/outputs/`) — Jupyter cell output components
- **Documentation** (`content/docs/`) — MDX documentation with live examples

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
   
   For multiple components:
   ```bash
   pnpm dlx shadcn@latest add badge card tooltip
   ```

3. **Verify the build:**
   ```bash
   pnpm run types:check
   ```

4. **Add MDX documentation** at `content/docs/ui/<component-name>.mdx`:
   - Import the component from `@/components/ui/<component-name>`
   - Include interactive examples
   - Document all props
   - Show installation instructions (CLI tab)

5. **Update navigation** in `content/docs/ui/meta.json`

6. **Commit with issue reference:**
   ```bash
   git add -A
   git commit -m "Add <ComponentName> component

   - Add component via shadcn CLI
   - Add MDX documentation with examples

   Closes #<issue-number>"
   ```

7. **Push and create PR:**
   ```bash
   git push -u origin component/<component-name>
   ```

## Adding Notebook-specific Components

For components from `intheloop` that aren't standard shadcn:

1. Review source at `runtimed/intheloop/src/components/...`
2. Copy and adapt — update imports to use `@/lib/utils` for `cn()`
3. Remove app-specific dependencies (trpc, auth, signals)
4. Place in `components/notebook/` or `registry/` as appropriate
5. Add to `registry.json` if distributing via nteract registry
6. Add MDX documentation
7. Create PR

## Directory Structure

```
components/
├── ui/              # shadcn/ui primitives (via CLI)
└── notebook/        # Notebook-specific components

registry/
└── outputs/         # Jupyter output renderers

content/docs/
├── ui/              # UI component docs
└── outputs/         # Output renderer docs

lib/
├── utils.ts         # cn() utility (shadcn standard)
└── cn.ts            # Re-export for backward compatibility
```

## Key Files

- `components.json` — shadcn configuration
- `registry.json` — nteract registry for distributable components
- `content/docs/ui/meta.json` — UI docs navigation
- `content/docs/outputs/meta.json` — Output docs navigation

## MDX Documentation Template

```mdx
---
title: Component Name
description: Brief description of the component
icon: LucideIconName
---

import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { ComponentName } from '@/components/ui/component-name';

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
import { ComponentName } from "@/components/ui/component-name"

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

- [ ] Used shadcn CLI for shadcn components (not manual copy)
- [ ] Build passes: `pnpm run types:check`
- [ ] MDX documentation created with interactive examples
- [ ] Navigation updated in appropriate `meta.json`
- [ ] Commit message references the GitHub issue (`Closes #N`)

## Utilities

- **Class merging:** Import `cn` from `@/lib/utils`
- **Icons:** Use `lucide-react` (already installed)
- **Variants:** Use `class-variance-authority` for component variants

## Related Issues

Component intake is tracked in issue #4. Individual component issues:

- #5 — Button and Input ✅
- #6 — Badge, Kbd, Spinner
- #7 — Card, Popover, Tooltip
- #8 — Cell component
- #9 — RuntimeHealthIndicator
- #10 — Dynamic registry API route

## Questions?

See `contributing/triage.md` for detailed triage criteria and source inventory.