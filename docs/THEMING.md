# Theming

How the visual theme system works in Laputa.

## Overview

Laputa has two layers of theming:

1. **Global CSS variables** (`src/index.css`): App-wide colors, borders, backgrounds — used by all components via Tailwind and direct CSS.
2. **Editor theme** (`src/theme.json`): Editor-specific typography and styling — converted to CSS variables by `useEditorTheme` and applied to the BlockNote container.

Currently the app is **light mode only** (dark mode was removed for simplicity).

## Layer 1: Global CSS Variables

Defined in `src/index.css` under `:root`:

### Color Palette

```css
/* Primary brand */
--primary: #155DFF;          /* Blue — links, accents, active states */
--primary-foreground: #FFFFFF;

/* Text hierarchy */
--text-primary: #37352F;     /* Main text (Notion-like dark gray) */
--text-secondary: #787774;   /* Secondary text */
--text-muted: #B4B4B4;       /* Muted/placeholder text */
--text-heading: #37352F;     /* Headings */

/* Backgrounds */
--bg-primary: #FFFFFF;       /* Main content area */
--bg-sidebar: #F7F6F3;      /* Sidebar background */
--bg-hover: #EBEBEA;         /* Hover state */
--bg-hover-subtle: #F0F0EF;  /* Subtle hover (code blocks) */
--bg-selected: #E8F4FE;     /* Selected state (blue tint) */

/* Borders */
--border-primary: #E9E9E7;  /* Standard borders */

/* Accent colors */
--accent-blue: #155DFF;
--accent-green: #00B38B;
--accent-orange: #D9730D;
--accent-red: #E03E3E;
--accent-purple: #A932FF;
--accent-yellow: #F0B100;

/* Light accent backgrounds (for badges/pills) */
--accent-blue-light: #155DFF14;
--accent-green-light: #00B38B14;
--accent-purple-light: #A932FF14;
--accent-red-light: #E03E3E14;
--accent-yellow-light: #F0B10014;
```

### shadcn/ui Variables

The app uses [shadcn/ui](https://ui.shadcn.com/) components, which require their own CSS variable naming convention:

```css
--background: #FFFFFF;
--foreground: #37352F;
--card: #FFFFFF;
--card-foreground: #37352F;
--primary: #155DFF;
--secondary: #EBEBEA;
--muted: #F0F0EF;
--muted-foreground: #787774;
--accent: #EBEBEA;
--destructive: #E03E3E;
--border: #E9E9E7;
--ring: #155DFF;
--sidebar: #F7F6F3;
```

### Tailwind v4 Integration

The `@theme inline` block in `index.css` bridges CSS variables to Tailwind's color system:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... etc */
}
```

This enables Tailwind classes like `bg-background`, `text-primary`, `border-border`, etc.

## Layer 2: Editor Theme (theme.json)

`src/theme.json` controls the BlockNote editor's typography and element styling. It's a nested JSON object with the following structure:

### Structure

```json
{
  "editor": {
    "fontFamily": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    "fontSize": 16,
    "lineHeight": 1.5,
    "maxWidth": 720,
    "paddingHorizontal": 40,
    "paddingVertical": 20,
    "paragraphSpacing": 8
  },
  "headings": {
    "h1": { "fontSize": 32, "fontWeight": 700, "lineHeight": 1.2, "marginTop": 32, "marginBottom": 12, "color": "var(--text-heading)", "letterSpacing": -0.5 },
    "h2": { "fontSize": 27, "fontWeight": 600, "lineHeight": 1.4, "marginTop": 28, "marginBottom": 10 },
    "h3": { "fontSize": 20, "fontWeight": 600, "lineHeight": 1.4, "marginTop": 24, "marginBottom": 8 },
    "h4": { "fontSize": 20, "fontWeight": 600, "lineHeight": 1.4, "marginTop": 20, "marginBottom": 6 }
  },
  "lists": {
    "bulletSymbol": "\u2022",
    "bulletSize": 28,
    "bulletColor": "#177bfd",
    "indentSize": 24,
    "itemSpacing": 4,
    "paddingLeft": 8,
    "nestedBulletSymbols": ["\u2022", "\u25e6", "\u25aa"],
    "bulletGap": 6
  },
  "checkboxes": {
    "size": 18,
    "borderRadius": 3,
    "checkedColor": "var(--accent-blue)",
    "uncheckedBorderColor": "var(--text-muted)",
    "gap": 8
  },
  "inlineStyles": {
    "bold": { "fontWeight": 700, "color": "var(--text-primary)" },
    "italic": { "fontStyle": "italic" },
    "strikethrough": { "color": "var(--text-tertiary)", "textDecoration": "line-through" },
    "code": { "fontFamily": "'SF Mono', 'Fira Code', monospace", "fontSize": 14, "backgroundColor": "var(--bg-hover-subtle)", "paddingHorizontal": 4, "paddingVertical": 2, "borderRadius": 3 },
    "link": { "color": "var(--accent-blue)", "textDecoration": "underline" },
    "wikilink": { "color": "var(--accent-blue)", "textDecoration": "none", "borderBottom": "1px dotted var(--accent-blue)", "cursor": "pointer" }
  },
  "codeBlocks": {
    "fontFamily": "'SF Mono', 'Fira Code', monospace",
    "fontSize": 13,
    "lineHeight": 1.5,
    "backgroundColor": "var(--bg-card)",
    "paddingHorizontal": 16,
    "paddingVertical": 12,
    "borderRadius": 6,
    "marginVertical": 12
  },
  "blockquote": {
    "borderLeftWidth": 3,
    "borderLeftColor": "var(--accent-blue)",
    "paddingLeft": 16,
    "marginVertical": 12,
    "color": "var(--text-secondary)",
    "fontStyle": "italic"
  },
  "table": {
    "borderColor": "var(--border-primary)",
    "headerBackground": "var(--bg-card)",
    "cellPaddingHorizontal": 12,
    "cellPaddingVertical": 8,
    "fontSize": 14
  },
  "horizontalRule": {
    "color": "var(--border-primary)",
    "marginVertical": 24,
    "thickness": 1
  },
  "colors": {
    "background": "var(--bg-primary)",
    "text": "var(--text-primary)",
    "textSecondary": "var(--text-secondary)",
    "textMuted": "var(--text-muted)",
    "heading": "var(--text-heading)",
    "accent": "var(--accent-blue)",
    "selection": "var(--bg-selected)",
    "cursor": "var(--text-primary)"
  }
}
```

### How theme.json Becomes CSS

The `useEditorTheme` hook (`src/hooks/useTheme.ts`) flattens the nested structure into CSS custom properties:

```typescript
function flattenTheme(obj, prefix = '--') {
  // Recursively flattens:
  // { editor: { fontSize: 16 } } → { '--editor-font-size': '16px' }
  // { headings: { h1: { fontSize: 32 } } } → { '--headings-h1-font-size': '32px' }
}
```

Key transformations:
- **camelCase → kebab-case**: `fontSize` → `font-size`
- **Numeric values get `px`**: `16` → `16px`
- **Unitless exceptions**: `lineHeight`, `fontWeight`, `opacity` stay as plain numbers
- **String values pass through**: `"var(--text-heading)"` → `var(--text-heading)`
- **Arrays are skipped**: `nestedBulletSymbols` is ignored in CSS flattening

The resulting flat map is applied as inline styles on the BlockNote container:

```tsx
<div className="editor__blocknote-container" style={cssVars as React.CSSProperties}>
  <BlockNoteView editor={editor} theme="light" />
</div>
```

### EditorTheme.css

`src/components/EditorTheme.css` contains CSS selectors that consume these variables to style BlockNote's internal elements (headings, lists, code blocks, etc.). This file uses selectors like `.bn-editor [data-content-type="heading"]` to target BlockNote's rendered DOM.

## How to Modify Styles

### Change a global color

Edit `src/index.css` — find the variable under `:root` and change its value:

```css
/* Before */
--primary: #155DFF;
/* After */
--primary: #FF5500;
```

All components using `text-primary`, `bg-primary`, `var(--primary)`, etc. will update automatically.

### Change editor typography

Edit `src/theme.json`:

```json
{
  "editor": {
    "fontSize": 18,         // was 16
    "fontFamily": "'Georgia', serif"  // was Inter
  }
}
```

The `useEditorTheme` hook will automatically regenerate the CSS variables on next render.

### Change heading sizes

Edit the `headings` section in `src/theme.json`:

```json
{
  "headings": {
    "h1": { "fontSize": 36 },  // was 32
    "h2": { "fontSize": 28 }   // was 27
  }
}
```

### Change wikilink appearance

Edit `inlineStyles.wikilink` in `src/theme.json`:

```json
{
  "inlineStyles": {
    "wikilink": {
      "color": "var(--accent-purple)",
      "borderBottom": "2px solid var(--accent-purple)"
    }
  }
}
```

### Add a new CSS variable

1. Add it to `:root` in `src/index.css`
2. If it needs to be available in Tailwind, add a mapping in the `@theme inline` block
3. Reference it anywhere as `var(--my-variable)` in CSS or `theme.json`

## Design Decisions

- **CSS variables over Tailwind config**: Colors are defined as CSS variables rather than Tailwind config values, because they need to be shared with non-Tailwind code (BlockNote, inline styles, theme.json).
- **theme.json for editor only**: The editor theme is separate from global styles because it controls BlockNote-specific typography that doesn't apply to the rest of the app (sidebar, dialogs, etc.).
- **No dark mode (for now)**: Dark mode was removed to simplify the initial build. The CSS variable architecture supports it — just add a `[data-theme="dark"]` or `@media (prefers-color-scheme: dark)` section in `index.css`.
- **Inline styles for editor**: The editor theme is applied via inline styles (not a stylesheet) because the values come from JSON and are computed at runtime by the hook.
