# Component intake and triage

Process for evaluating and importing components into nteract-elements.

## What already exists in this repo

The `registry/outputs/` directory already has Jupyter output renderers:

| Component | Description |
|-----------|-------------|
| `ansi-output` | ANSI escape sequences (terminal colors) |
| `html-output` | HTML content, DataFrames, iframes |
| `image-output` | PNG, JPEG, GIF, WebP from base64 or URLs |
| `json-output` | Interactive JSON tree view |
| `markdown-output` | GFM with math (KaTeX) and code highlighting |
| `svg-output` | Vector graphics |
| `media-router` | MIME-type dispatcher that routes to the above |

These are registered in `registry.json` and can be installed via `shadcn add`.

## Priority order for new components

1. **Atomic primitives** — Button, Input, Badge, Avatar, Kbd, Spinner, Separator
2. **Layout utilities** — Card, Popover, Tooltip, Sidebar, Tabs, Dialog, Sheet
3. **Notebook primitives** — Cell, CellAdder, CellToolbar, ExecutionCount
4. **Higher-level notebook UI** — NotebookContent, NotebookSidebar, RuntimeHealthIndicator

## Source inventory (intheloop)

Components available in `runtimed/intheloop`:

### `src/components/ui/` — shadcn primitives (low effort)

These are standard shadcn components, mostly copy-paste:

- `button.tsx`, `button-group.tsx`
- `input.tsx`, `textarea.tsx`, `label.tsx`
- `badge.tsx`, `avatar.tsx`
- `card.tsx`, `accordion.tsx`, `collapsible.tsx`
- `dialog.tsx`, `alert-dialog.tsx`, `sheet.tsx`
- `popover.tsx`, `hover-card.tsx`, `tooltip.tsx`
- `dropdown-menu.tsx`, `command.tsx`
- `tabs.tsx`, `separator.tsx`, `skeleton.tsx`
- `switch.tsx`, `slider.tsx`
- `sidebar.tsx` (~24KB, large)
- `kbd.tsx`, `Spinner.tsx`, `sonner.tsx`
- `confirm.tsx`, `empty.tsx`
- Custom: `AvatarWithDetails.tsx`, `DateDisplay.tsx`, `SidebarSwitch.tsx`, `TerminalPlay.tsx`

### `src/components/notebook/` — notebook-specific (medium effort)

- `NotebookContent.tsx` — main notebook layout
- `NotebookSidebar.tsx` — sidebar with panels
- `NotebookTitle.tsx` — editable title
- `NotebookLoadingScreen.tsx` — loading state
- `RuntimeHealthIndicator.tsx` — kernel status indicator
- `EmptyStateCellAdder.tsx` — empty notebook state

### `src/components/notebook/cell/` — cell components (medium-high effort)

- `Cell.tsx` — base cell wrapper
- `ExecutableCell.tsx` — code cell (~25KB, complex)
- `MarkdownCell.tsx` — markdown cell (~12KB)
- `CellAdder.tsx`, `CellBetweener.tsx` — add cell UI
- `CellTypeButtons.tsx` — code/markdown toggle
- `shared/` — shared cell utilities
- `toolbars/` — cell action toolbars

### `src/components/outputs/` — output rendering (medium effort)

Note: We already have output renderers in `registry/outputs/`. These may overlap or provide additional functionality:

- `MaybeCellOutputs.tsx` — output container with routing
- `IframeOutput.tsx` — sandboxed HTML output
- `MaybeFixCodeButton.tsx` — error action button

## Intake checklist

Before merging a component:

- [ ] TypeScript props exported (no `any`)
- [ ] Uses `cn()` for class merging
- [ ] Tailwind 4 classes
- [ ] Keyboard accessible where applicable
- [ ] ARIA attributes where applicable
- [ ] Registered in `registry.json` if it's a user-facing component
- [ ] MDX documentation under `content/docs/components/`

## Recommended first batch

Start with these — low complexity, high reuse:

1. `button.tsx` + `button-group.tsx`
2. `input.tsx` + `textarea.tsx` + `label.tsx`
3. `badge.tsx`
4. `kbd.tsx`
5. `Spinner.tsx`
6. `card.tsx`
7. `tooltip.tsx`
8. `popover.tsx`

## Second batch (notebook primitives)

1. `Cell.tsx` + cell shared utilities
2. `CellAdder.tsx` + `CellBetweener.tsx`
3. `RuntimeHealthIndicator.tsx`
4. `NotebookTitle.tsx`

## Dependencies to track

Components from intheloop may depend on:

- `@radix-ui/*` — expected, shadcn uses Radix
- `lucide-react` — already in this repo
- `tailwind-merge` — already in this repo
- `class-variance-authority` — may need to add for variant props (cva)
- `cmdk` — for command palette
- `sonner` — for toasts
- `@codemirror/*` — for editor integration (defer to later phase)

## Workflow

1. Pick a component from the priority list
2. Copy source file(s) from intheloop
3. Update imports to match this repo's structure
4. Verify it builds (`pnpm dev`)
5. Add to `registry.json` with name, description, dependencies
6. Add MDX documentation under `content/docs/components/`
7. Open PR with component + docs + registry entry