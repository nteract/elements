# Component intake and triage

Process for evaluating and importing components into nteract-elements.

## What already exists in this repo

### Output renderers (`registry/outputs/`)

| Component | Description |
|-----------|-------------|
| `ansi-output` | ANSI escape sequences (terminal colors) |
| `html-output` | HTML content, DataFrames, iframes |
| `image-output` | PNG, JPEG, GIF, WebP from base64 or URLs |
| `json-output` | Interactive JSON tree view |
| `markdown-output` | GFM with math (KaTeX) and code highlighting |
| `svg-output` | Vector graphics |
| `media-router` | MIME-type dispatcher that routes to the above |

### UI primitives (`registry/primitives/`)

| Component | Description |
|-----------|-------------|
| `badge` | Status labels and counts |
| `button` | Button with variants and sizes |
| `card` | Content grouping container |
| `dropdown-menu` | Action list menu |
| `input` | Text input with focus and validation states |
| `kbd` | Keyboard shortcut display |
| `popover` | Floating content panel |
| `spinner` | Loading indicator |
| `tooltip` | Hover information |

### Cell primitives (`registry/cell/`)

| Component | Description |
|-----------|-------------|
| `CellControls` | Action menu (delete, move, clear outputs) |
| `CellHeader` | Slot-based header layout (left/right content) |
| `CellTypeButton` | Code/Markdown/SQL/AI cell type buttons |
| `ExecutionStatus` | Queued/Running/Error state badges |
| `PlayButton` | Execute/interrupt button |
| `RuntimeHealthIndicator` | Kernel connection status |

## Priority order for new components

### Next up

1. **More shadcn primitives** — Separator, Label, Textarea (#33), Tabs, Dialog, Sheet (#34)
2. **Cell composition** — CellContainer (#19), ExecutionCount (#36), CellOutputArea (#35)
3. **Notebook-level components** — from intheloop (NotebookContent, NotebookSidebar)

### Deferred

- Dynamic registry API route (#10) — not blocking current work

## Directory structure

| Path | Purpose |
|------|---------|
| `registry/primitives/` | shadcn/ui primitives (published via nteract registry) |
| `registry/cell/` | Notebook cell components (published via nteract registry) |
| `registry/outputs/` | Output renderers (published via nteract registry) |
| `components/` | Fumadocs site internals only (not published) |
| `content/docs/ui/` | MDX docs for UI primitives |
| `content/docs/cell/` | MDX docs for cell components |
| `content/docs/outputs/` | MDX docs for output renderers |

## Workflow

### For shadcn/ui primitives (Button, Input, Card, etc.)

**Use the shadcn CLI.** Do not manually copy component code.

```bash
# Add a single component
pnpm dlx shadcn@latest add badge

# Add multiple components
pnpm dlx shadcn@latest add card popover tooltip
```

The CLI places components in `registry/primitives/` (configured via `components.json`).

After adding via CLI:

1. Verify the build works: `pnpm run types:check`
2. Add entry to `registry.json` with correct path
3. Add MDX documentation under `content/docs/ui/<component>.mdx`
4. Update `content/docs/ui/meta.json` to include the new component
5. Open PR with commit message referencing the issue (e.g., `Closes #33`)

### For notebook-specific components

These aren't available via shadcn CLI. Copy from `runtimed/intheloop`:

1. Copy source file(s) from intheloop
2. Update imports:
   - Use `@/lib/utils` for `cn()`
   - Use `@/registry/primitives/<component>` for UI primitives
3. Place in `registry/cell/` for cell components
4. Verify the build works: `pnpm run types:check`
5. Add entry to `registry.json`
6. Add MDX documentation under `content/docs/cell/<component>.mdx`
7. Open PR

## Intake checklist

Before merging a component PR:

- [ ] Component placed in correct `registry/` subfolder
- [ ] TypeScript props exported (no `any`)
- [ ] Uses `cn()` from `@/lib/utils` for class merging
- [ ] Imports use `@/registry/primitives/` for UI dependencies
- [ ] Entry added to `registry.json` with correct path
- [ ] Build passes: `pnpm run types:check`
- [ ] MDX documentation with interactive examples
- [ ] Docs navigation updated (`meta.json`)
- [ ] Commit message references the issue

## Source inventory (intheloop)

For notebook-specific components not available via shadcn:

### `src/components/notebook/` — notebook-specific

| File | Status | Notes |
|------|--------|-------|
| `RuntimeHealthIndicator.tsx` | ✅ Done | #9 |
| `NotebookContent.tsx` | Not started | Main notebook layout |
| `NotebookSidebar.tsx` | Not started | Sidebar with panels |
| `NotebookTitle.tsx` | Not started | Editable title |
| `NotebookLoadingScreen.tsx` | Not started | Loading state |
| `EmptyStateCellAdder.tsx` | Not started | Empty notebook state |

### `src/components/notebook/cell/` — cell components

**Completed:**

| File | Issue | Notes |
|------|-------|-------|
| `shared/PlayButton.tsx` | #15 ✅ | Execute/interrupt button |
| `shared/ExecutionStatus.tsx` | #16 ✅ | State badges |
| `CellTypeButtons.tsx` | #17 ✅ | Cell type buttons |
| `shared/CellControls.tsx` | #18 ✅ | Action menu |
| `shared/CellHeader.tsx` | #20 ✅ | Header layout |

**In progress:**

| File | Issue | Notes |
|------|-------|-------|
| `shared/CellContainer.tsx` | #19 | Focus/selection wrapper |

**Do NOT import (too coupled):**

| File | Size | Reason |
|------|------|--------|
| `Cell.tsx` | 1KB | Router to ExecutableCell/MarkdownCell |
| `ExecutableCell.tsx` | 25KB | Coupled to signals, livestore, auth |
| `MarkdownCell.tsx` | 12KB | Coupled to editor integration |
| `CellAdder.tsx` | 1.3KB | Depends on `useAddCell` hook |
| `CellBetweener.tsx` | 1.8KB | Depends on `useAddCell` hook |
| `shared/Editor.tsx` | 5.4KB | CodeMirror integration — separate concern |
| `toolbars/AiToolbar.tsx` | 13KB | AI streaming, model selection |
| `toolbars/SqlToolbar.tsx` | 1.7KB | Feature-flagged, SQL-specific |

**App-specific patterns to strip when importing:**

| Pattern | Found in | Replace with |
|---------|----------|--------------|
| `@runtimed/schema` types | CellContainer | Local interface |
| `useDragDropCellSort` | CellContainer, CellHeader | Optional callback props |
| `useFeatureFlag` | CellTypeSelector | Props like `enabledCellTypes` |
| `useAddCell` | CellAdder, CellBetweener | `onAddCell` callback prop |

## Dependencies

Already in this repo:
- `lucide-react` — icons
- `tailwind-merge` — class merging
- `class-variance-authority` — variant props (cva)
- `@radix-ui/react-slot` — polymorphic components
- `@radix-ui/react-dropdown-menu` — dropdown menu primitive
- `@radix-ui/react-popover` — popover primitive
- `@radix-ui/react-tooltip` — tooltip primitive
- `clsx` — class composition

May need to add for specific components:
- `cmdk` — command palette
- `sonner` — toast notifications
- `@codemirror/*` — editor integration (defer to later phase)