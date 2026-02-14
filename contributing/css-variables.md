# CSS Variables

Components that use CSS variables must define them in **two places** to work correctly for both the docs site and consumers installing via the shadcn CLI.

## Dual-Location Pattern

### 1. `app/global.css`

Define variables in both `:root` (light mode) and `.dark` (dark mode) selectors:

```css
:root {
    --ansi-yellow-bg: #adad27;
}

.dark {
    --ansi-yellow-bg: #b5a000;
}
```

### 2. `registry.json`

Add the same values to the component's `cssVars` object:

```json
{
  "name": "ansi-output",
  "cssVars": {
    "light": {
      "ansi-yellow-bg": "#adad27"
    },
    "dark": {
      "ansi-yellow-bg": "#b5a000"
    }
  }
}
```

## Why Both?

- **`global.css`** — Used by the docs site at runtime
- **`registry.json`** — Read by the shadcn CLI when consumers run `npx shadcn add @nteract/component-name`. The CLI injects these values into the consumer's CSS.

If these values don't match, consumers see different colors than the docs site shows.

## Checklist

When adding or changing CSS variables:

- [ ] Update `app/global.css` (both `:root` and `.dark` if theme-aware)
- [ ] Update `registry.json` `cssVars.light` and `cssVars.dark`
- [ ] Verify values match exactly between the two files

## Example: ANSI Colors

The `ansi-output` component defines 24 CSS variables for terminal colors (8 standard + 8 bright foreground colors, plus 8 background colors). All must be kept in sync between `global.css` and `registry.json`.

## When to Use CSS Variables vs Tailwind

**Use CSS variables when:**
- Colors need to adapt to light/dark mode
- Values are generated at runtime (e.g., from library output like `anser`)
- You need the same semantic color across multiple elements

**Use Tailwind classes when:**
- Standard theme colors suffice (`bg-gray-100 dark:bg-gray-800`)
- No runtime generation needed
- The component doesn't need to expose customizable colors to consumers
