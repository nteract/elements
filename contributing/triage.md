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

### UI primitives (`components/ui/`)

| Component | Description |
|-----------|-------------|
| `button` | Button with variants and sizes |
| `input` | Text input with focus and validation states |

## Priority order for new components

1. **Atomic primitives** — Badge, Kbd, Spinner, Separator, Label, Textarea
2. **Layout utilities** — Card, Popover, Tooltip, Sidebar, Tabs, Dialog, Sheet
3. **Notebook primitives** — Cell, CellAdder, CellToolbar, ExecutionCount
4. **Higher-level notebook UI** — NotebookContent, NotebookSidebar, RuntimeHealthIndicator

## Workflow

### For shadcn/ui primitives (Button, Input, Card, etc.)

**Use the shadcn CLI.** Do not manually copy component code.

```bash
# Add a single component
pnpm dlx shadcn@latest add badge

# Add multiple components
pnpm dlx shadcn@latest add card popover tooltip
```

This ensures:
- Latest component versions
- Correct dependency installation
- Proper file placement in `components/ui/`

After adding via CLI:

1. Verify the build works: `pnpm run types:check`
2. Add MDX documentation under `content/docs/ui/<component>.mdx`
3. Update `content/docs/ui/meta.json` to include the new component
4. Open PR with commit message referencing the issue (e.g., `Closes #5`)

### For notebook-specific components

These aren't available via shadcn CLI. Copy from `runtimed/intheloop`:

1. Copy source file(s) from intheloop
2. Update imports to use `@/lib/utils` for `cn()` 
3. Place in appropriate directory:
   - `components/notebook/` for notebook UI
   - `registry/` for components we distribute via our registry
4. Verify the build works
5. Add to `registry.json` if distributing via nteract registry
6. Add MDX documentation
7. Open PR

## Directory structure

| Path | Purpose |
|------|---------|
| `components/ui/` | shadcn/ui primitives (added via CLI) |
| `components/notebook/` | Notebook-specific components |
| `registry/outputs/` | Output renderers (distributed via nteract registry) |
| `content/docs/ui/` | MDX docs for UI primitives |
| `content/docs/outputs/` | MDX docs for output renderers |

## Intake checklist

Before merging a component PR:

- [ ] Component added via shadcn CLI (for shadcn primitives) or properly adapted
- [ ] TypeScript props exported (no `any`)
- [ ] Uses `cn()` from `@/lib/utils` for class merging
- [ ] Build passes: `pnpm run types:check`
- [ ] MDX documentation with interactive examples
- [ ] Docs navigation updated (`meta.json`)
- [ ] Commit message references the issue

## Source inventory (intheloop)

For notebook-specific components not available via shadcn:

### `src/components/notebook/` — notebook-specific

- `NotebookContent.tsx` — main notebook layout
- `NotebookSidebar.tsx` — sidebar with panels
- `NotebookTitle.tsx` — editable title
- `NotebookLoadingScreen.tsx` — loading state
- `RuntimeHealthIndicator.tsx` — kernel status indicator
- `EmptyStateCellAdder.tsx` — empty notebook state

### `src/components/notebook/cell/` — cell components

- `Cell.tsx` — base cell wrapper
- `ExecutableCell.tsx` — code cell (~25KB, complex)
- `MarkdownCell.tsx` — markdown cell (~12KB)
- `CellAdder.tsx`, `CellBetweener.tsx` — add cell UI
- `CellTypeButtons.tsx` — code/markdown toggle
- `shared/` — shared cell utilities
- `toolbars/` — cell action toolbars

## Dependencies

Already in this repo:
- `lucide-react` — icons
- `tailwind-merge` — class merging
- `class-variance-authority` — variant props (cva)
- `@radix-ui/react-slot` — polymorphic components
- `clsx` — class composition

May need to add for specific components:
- `cmdk` — command palette
- `sonner` — toast notifications
- `@codemirror/*` — editor integration (defer to later phase)