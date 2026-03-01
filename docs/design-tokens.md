# Design Tokens

Complete reference for the Tailwind CSS 4 design token system defined in
`src/app/globals.css`. All tokens are available as Tailwind utility classes
and as CSS custom properties for use in inline styles.

---

## Typography

Fonts are self-hosted via `next/font/google` with `display: swap` to prevent
layout shift. The `@theme` block maps these onto Tailwind's font family tokens.

| Token | CSS variable | Font | Usage |
|-------|-------------|------|-------|
| `font-sans` | `--font-inter` | Inter | Body copy, UI labels, navigation |
| `font-display` | `--font-playfair` | Playfair Display | Headings, hero text |
| `font-mono` | `--font-jetbrains` | JetBrains Mono | Code blocks, terminal output |

**Examples:**

```html
<p class="font-sans">Body text</p>
<h1 class="font-display">Hero heading</h1>
<code class="font-mono">const x = 1;</code>
```

---

## Color Palette

### Primary (Indigo) — `--color-primary-{shade}`

Based on brand color `#5469d4`. Generates utility classes
`bg-primary-{shade}`, `text-primary-{shade}`, `border-primary-{shade}`, etc.

| Shade | Hex | Tailwind class |
|-------|-----|---------------|
| 50 | `#eef0fb` | `bg-primary-50` |
| 100 | `#d5daf6` | `bg-primary-100` |
| 200 | `#acb4ed` | `bg-primary-200` |
| 300 | `#828fe4` | `bg-primary-300` |
| 400 | `#6979dc` | `bg-primary-400` |
| **500** | **`#5469d4`** | **`bg-primary-500`** (brand) |
| 600 | `#3d52c4` | `bg-primary-600` |
| 700 | `#2f3fa8` | `bg-primary-700` |
| 800 | `#283588` | `bg-primary-800` |
| 900 | `#1f2969` | `bg-primary-900` |
| 950 | `#141a42` | `bg-primary-950` |

### Neutral — `--color-neutral-{shade}`

Warm gray scale for surfaces and text.

| Shade | Hex | Common use |
|-------|-----|-----------|
| 50 | `#f8f9fa` | Light mode background |
| 100 | `#f1f3f4` | Subtle surfaces |
| 200 | `#e4e4e7` | Borders (light) |
| 300 | `#d4d4d8` | Dividers |
| 400 | `#a1a1aa` | Placeholder text |
| 500 | `#71717a` | Secondary text |
| 600 | `#52525b` | Muted body text |
| 700 | `#3f3f46` | Sub-headings |
| 800 | `#27272a` | Dark surfaces |
| 900 | `#18181b` | Near-black |
| 950 | `#0f0f0f` | Dark mode background |

### Status Colors

| Token | Light hex | Dark hex | Usage |
|-------|-----------|---------|-------|
| `bg-success-50 / -500 / -700` | `#f0fdf4 / #22c55e / #15803d` | — | Success states |
| `bg-warning-50 / -500 / -700` | `#fffbeb / #f59e0b / #b45309` | — | Warnings |
| `bg-error-50 / -500 / -700` | `#fef2f2 / #ef4444 / #b91c1c` | — | Errors / danger |
| `bg-info-50 / -500 / -700` | `#eff6ff / #3b82f6 / #1d4ed8` | — | Informational |

---

## Semantic / Runtime Tokens

These tokens automatically switch between light and dark mode. Use them in
components whenever possible instead of hardcoded palette values.

| Tailwind class | CSS variable | Light value | Dark value |
|---------------|-------------|------------|-----------|
| `bg-background` | `--bg` | `#f8f9fa` | `#0f0f0f` |
| `bg-background-alt` | `--bg-alt` | `#f0f2f5` | `#1a1a1a` |
| `text-foreground` | `--text` | `#1a1a1a` | `#f5f5f5` |
| `text-foreground-muted` | `--text-light` | `#52525b` | `#b0b0b0` |
| `bg-accent` / `text-accent` | `--accent` | `#5469d4` | `#818cf8` |
| `bg-accent-hover` | `--accent-hover` | `#3d52c4` | `#a5b4fc` |
| `text-accent-foreground` | `--accent-foreground` | `#ffffff` | `#1a1a1a` |
| `text-muted` | `--muted` | `#94a3b8` | `#71717a` |
| `border-border` | `--border-color` | `#e4e4e7` | `#333333` |

### WCAG Contrast Ratios

| Pair | Ratio | Standard |
|------|-------|---------|
| Light accent (`#5469d4`) text on light bg (`#f8f9fa`) | 5.48 : 1 | ✅ AA |
| White text on light accent (`#5469d4`) | 4.83 : 1 | ✅ AA |
| Dark accent (`#818cf8`) text on dark bg (`#0f0f0f`) | 6.44 : 1 | ✅ AA |
| Dark text (`#1a1a1a`) on dark accent (`#818cf8`) | 5.70 : 1 | ✅ AA |

**Example — accent button that passes in both modes:**

```html
<button
  style="background-color: var(--accent); color: var(--accent-foreground);"
>
  Click me
</button>
```

Or with Tailwind classes:

```html
<button class="bg-accent text-accent-foreground px-4 py-2 rounded-md">
  Click me
</button>
```

---

## Border Radius

| Token | Value | Tailwind class |
|-------|-------|---------------|
| `none` | `0px` | `rounded-none` |
| `sm` | `4px` | `rounded-sm` |
| `md` | `8px` | `rounded-md` |
| `lg` | `12px` | `rounded-lg` |
| `xl` | `16px` | `rounded-xl` |
| `2xl` | `24px` | `rounded-2xl` |
| `3xl` | `32px` | `rounded-3xl` |
| `full` | `9999px` | `rounded-full` |

---

## Elevation / Shadows

| Token | Tailwind class | Use case |
|-------|---------------|---------|
| `sm` | `shadow-sm` | Subtle lift — cards, inputs |
| `md` | `shadow-md` | Default elevation — dropdowns |
| `lg` | `shadow-lg` | Modals, popovers |
| `xl` | `shadow-xl` | Sheets, drawers |
| `2xl` | `shadow-2xl` | Full-page overlays |
| `inner` | `shadow-inner` | Pressed / inset states |

---

## Breakpoints

| Name | Width | Tailwind prefix |
|------|-------|----------------|
| `sm` | 640px | `sm:` |
| `md` | 768px | `md:` |
| `lg` | 1024px | `lg:` |
| `xl` | 1280px | `xl:` |
| `2xl` | 1536px | `2xl:` |

---

## Spacing

Tailwind CSS 4 uses a linear 4 px base grid by default (`--spacing: 0.25rem`).
All standard spacing utilities (`p-4`, `m-8`, `gap-6`, etc.) follow this grid.

| Step | rem | px |
|------|-----|----|
| 1 | 0.25 rem | 4 px |
| 2 | 0.5 rem | 8 px |
| 4 | 1 rem | 16 px |
| 8 | 2 rem | 32 px |
| 16 | 4 rem | 64 px |

---

## Adding a New Token

1. For a **palette** value (static): add `--color-{name}-{shade}: {value};`
   inside the first `@theme { }` block.
2. For a **semantic** value (switches in dark mode): add a CSS variable to
   `:root` (light) and `.dark` (dark), then reference it in `@theme inline`.
