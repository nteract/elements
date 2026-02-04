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
| `dialog` | Modal dialog windows |
| `dropdown-menu` | Action list menu |
| `input` | Text input with focus and validation states |
| `kbd` | Keyboard shortcut display |
| `label` | Form labels |
| `popover` | Floating content panel |
| `separator` | Visual dividers |
| `sheet` | Slide-out panels |
| `spinner` | Loading indicator |
| `tabs` | Tabbed content panels |
| `textarea` | Multi-line text input |
| `tooltip` | Hover information |

### Cell primitives (`registry/cell/`)

| Component | Description |
|-----------|-------------|
| `CellContainer` | Focus/selection wrapper with drag handle support |
| `CellControls` | Action menu (delete, move, clear outputs) |
| `CellHeader` | Slot-based header layout (left/right content) |
| `CellTypeButton` | Code/Markdown/SQL/AI cell type buttons |
| `ExecutionCount` | Cell execution count display `[1]:` |
| `ExecutionStatus` | Queued/Running/Error state badges |
| `OutputArea` | Collapsible output wrapper with copy button |
| `PlayButton` | Execute/interrupt button |
| `RuntimeHealthIndicator` | Kernel connection status |

## Sprint 3 priorities (#46)

### shadcn primitives (via CLI)

```bash
pnpm dlx shadcn@latest add avatar command collapsible skeleton switch hover-card slider alert alert-dialog
```

| Component | Priority | Notes |
|-----------|----------|-------|
| Avatar | High | Needed for collaboration components |
| Command | High | Searchable list, model selector |
| HoverCard | High | User info on hover |
| Collapsible | Medium | Expandable sections |
| Skeleton | Medium | Loading placeholders |
| Switch | Medium | Toggle controls |
| Slider | Low | Range input |
| Alert | Low | Banners and callouts |
| AlertDialog | Low | Confirmation dialogs |

### Cell components (from intheloop)

| Component | Source | Adaptation needed |
|-----------|--------|-------------------|
| CellTypeSelector | `cell/shared/CellTypeSelector.tsx` | Replace `useFeatureFlag` → `enabledTypes` prop |

### Collaboration components (from intheloop)

| Component | Source | Adaptation needed |
|-----------|--------|-------------------|
| PresenceBookmarks | `cell/shared/PresenceBookmarks.tsx` | Strip hooks → accept users array as prop |
| CollaboratorAvatars | `CollaboratorAvatars.tsx` | Strip auth hooks → accept users as prop |

### Layout components (from intheloop)

| Component | Source | Adaptation needed |
|-----------|--------|-------------------|
| Empty | `ui/empty.tsx` | Minimal — well-designed slots |
| ButtonGroup | `ui/button-group.tsx` | Minimal — already generic |

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
5. Open PR with commit message referencing the issue (e.g., `Closes #46`)

### For notebook-specific components

These aren't available via shadcn CLI. Copy from `runtimed/intheloop`:

1. Copy source file(s) from intheloop
2. Update imports:
   - Use `@/lib/utils` for `cn()`
   - Use `@/registry/primitives/<component>` for UI primitives
3. Strip app-specific patterns (see table below)
4. Place in `registry/cell/` for cell components
5. Verify the build works: `pnpm run types:check`
6. Add entry to `registry.json`
7. Add MDX documentation under `content/docs/cell/<component>.mdx`
8. Open PR

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

### Ready to import (low coupling)

| File | Status | Notes |
|------|--------|-------|
| `ui/empty.tsx` | Sprint 3 | Empty state container |
| `ui/button-group.tsx` | Sprint 3 | Button grouping |
| `cell/shared/CellTypeSelector.tsx` | Sprint 3 | Type switcher |
| `cell/shared/PresenceBookmarks.tsx` | Sprint 3 | Cell presence |
| `CollaboratorAvatars.tsx` | Sprint 3 | Notebook presence |

### Do NOT import (too coupled)

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

### App-specific patterns to strip when importing

| Pattern | Found in | Replace with |
|---------|----------|--------------|
| `@runtimed/schema` types | CellContainer | Local interface |
| `useDragDropCellSort` | CellContainer, CellHeader | Optional callback props |
| `useFeatureFlag` | CellTypeSelector | Props like `enabledCellTypes` |
| `useAddCell` | CellAdder, CellBetweener | `onAddCell` callback prop |
| `useAuthenticatedUser` | CollaboratorAvatars | `currentUserId` prop |
| `useUserRegistry` | PresenceBookmarks | `users`, `getUserColor` props |
| `useOrderedCollaboratorInfo` | PresenceBookmarks | Accept pre-sorted array |

## Dependencies

Already in this repo:
- `lucide-react` — icons
- `tailwind-merge` — class merging
- `class-variance-authority` — variant props (cva)
- `@radix-ui/react-slot` — polymorphic components
- `@radix-ui/react-dropdown-menu` — dropdown menu primitive
- `@radix-ui/react-popover` — popover primitive
- `@radix-ui/react-tooltip` — tooltip primitive
- `@radix-ui/react-dialog` — dialog primitive
- `@radix-ui/react-tabs` — tabs primitive
- `clsx` — class composition

Will need for Sprint 3:
- `cmdk` — command palette (for Command component)
- `@radix-ui/react-avatar` — avatar primitive
- `@radix-ui/react-collapsible` — collapsible primitive
- `@radix-ui/react-switch` — switch primitive
- `@radix-ui/react-hover-card` — hover card primitive
- `@radix-ui/react-slider` — slider primitive
- `@radix-ui/react-alert-dialog` — alert dialog primitive

May need for future phases:
- `sonner` — toast notifications
- `@codemirror/*` — editor integration (defer to later phase)