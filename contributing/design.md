# Design Philosophy

This document outlines the design principles for nteract-elements components, following shadcn/ui patterns.

## Props vs className

Components follow a clear separation of concerns:

- **Props** = Behavior (callbacks, state, data)
- **className** = Appearance (layout, spacing, colors via Tailwind)

### Examples

**Good - behavioral prop:**
```tsx
<PlayButton onExecute={handleRun} executionState="running" />
```

**Good - appearance via className:**
```tsx
<CellContainer className="border-2 rounded-lg" />
```

**Bad - appearance as prop:**
```tsx
// Don't do this - use className instead
<CellContainer borderWidth={2} borderRadius="lg" />
```

## Composition over Configuration

Instead of adding props for every use case, provide slots for composition:

**Good - slot-based composition:**
```tsx
<CellContainer
  gutterContent={<PlayButton />}
  rightGutterContent={<MyCustomControls />}
>
  {children}
</CellContainer>
```

**Bad - configuration props:**
```tsx
// Don't do this
<CellContainer
  showPlayButton
  showControls
  controlsPosition="right"
  controlsLayout="vertical"
/>
```

## Customization Model

Users **vendor** (copy) components into their codebase via `npx shadcn`. If they need different behavior or structure, they modify the source directly.

This means:

1. **Don't add props to cover every use case** - keep components focused
2. **Don't deprecate, just change** - users own their copy
3. **Breaking changes are acceptable** - users can choose when to update

## Paper Margins Pattern

The cell layout uses a "paper margins" metaphor:

```
┌──────────────────────────────────────────────────────────┐
│ Left    │                                    │   Right   │
│ Margin  │         Content Area               │   Margin  │
├─────────┼────────────────────────────────────┼───────────┤
│ ▶  │▮│  │ Source code                        │     [^]   │
│[1]:│▮│  │ print("Hello")                     │     [⋮]   │
│    │▮│  │                                    │           │
└────┴─┴──┴────────────────────────────────────┴───────────┘
```

- **Left margin**: Execution controls (play button, execution count, colored ribbon)
- **Content area**: Clean "paper" with just source and output
- **Right margin**: Cell actions (kebab menu, source toggle)

This removes UI chrome from the content area, making cells feel like annotated pages.

## Visibility Patterns

Use Tailwind's responsive and group-hover utilities:

```tsx
// Desktop: hidden by default, visible on hover
// Mobile: always visible
className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
```

The parent element needs `group` class for this to work:

```tsx
<div className="group">
  <div className="sm:opacity-0 sm:group-hover:opacity-100">
    Controls appear on hover
  </div>
</div>
```
