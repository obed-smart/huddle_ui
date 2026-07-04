# Huddle Design Token System

## Purpose

This file defines the design token system for Huddle. It exists so that every future
styling change references a single source of truth instead of ad-hoc decisions made
per-screen. Before styling anything, check this file. If a value you need isn't here,
add it here first, then use it — don't invent one-off values inline.

This system borrows *structure* (the idea of locked, named scales for type, spacing,
radius, and component states) from common production design systems. It does not
borrow any specific brand's colors or fonts. Huddle's own colors, extracted from the
current codebase, are the source of truth below.

---

## Step 0 — Extraction notes

All `<EXTRACT>` placeholders have been resolved. Values were pulled directly from
`src/app/globals.css` (the single source of truth for raw palette anchors and
semantic aliases). No values were invented — where multiple shades existed, the
one wired to a semantic alias in that file was chosen.

**One inconsistency flagged:** the CSS radius scale starts at `--radius-sm: 8px`;
there is no `4px` CSS custom property. The `xs: 4px` entry in the radius scale below
is used in prose (e.g. bubble tail description) but has no corresponding
`--radius-xs` token yet. Add `--radius-xs: 4px` to `globals.css` before using it
in components.

---

## Color Tokens

Values map directly to palette anchors defined in `src/app/globals.css`.

```
Token              Hex value    CSS custom property          Notes
─────────────────────────────────────────────────────────────────────────────────
primary            #8b5cf6      --huddle-violet-500          buttons, sent bubbles, brand
primary-press      #7c3aed      --huddle-violet-600          pressed/active state (--primary-hover)
primary-tint       #ede9fe      --huddle-violet-100          secondary buttons, highlights (--secondary)
on-primary         #ffffff      --huddle-white               text/icons on primary-colored surfaces

ink                #0f172a      --huddle-slate-900           primary body text (--foreground)
ink-mute           #64748b      --huddle-slate-500           secondary/caption text (--muted-foreground)

canvas             #f8fafc      --huddle-slate-50            main background (--background)
canvas-elevated    #fafaf9      --huddle-stone-50            card/panel background (--surface)
bubble-received    #eeedf8      --huddle-bubble-received     received message bubble background
hairline           #e2e8f0      --huddle-slate-200           border/divider color (--border)

semantic-error     #f43f5e      --huddle-rose-500            hang-up, destructive actions, error text (--destructive)
semantic-success   #10b981      --huddle-emerald-500         online status dot, success states (--success)
semantic-warning   #f59e0b      --huddle-amber-500           pending/requesting states (--warning)
```

> When referencing these in Tailwind classes or CSS, always use the semantic alias
> (e.g. `bg-primary`, `text-muted-foreground`, `border-border`) rather than the raw
> hex or palette anchor. The aliases are what's exposed via `@theme inline` in
> `globals.css`.

---

## Typography Scale

Lock these sizes. Every heading, body, and caption in the app pulls from this list —
no one-off font-size values in components.

```
Role          Size   Weight   Line-height   Letter-spacing   Usage
─────────────────────────────────────────────────────────────────────────────────────
display-lg    28px   700      1.2           -0.3px           landing hero
display-md    22px   700      1.25          -0.2px           section headers
heading-lg    20px   600      1.3            0px             screen titles (Settings, Group settings)
heading-md    17px   600      1.4            0px             list item names (contact names, group names)
heading-sm    15px   600      1.4            0px             sender name above message bubble
body-lg       16px   400      1.5            0px             message bubble text
body-md       14px   400      1.5            0px             secondary body text, input placeholder
caption       13px   400      1.4            0.1px           timestamps, "Member"/"Host" labels
micro-cap     11px   700      1.2            0.5px           uppercase eyebrow labels, badges
```

**Font families** (from `globals.css` / `src/app/layout.tsx`):
- Body / sans: `Inter` → `--font-sans: var(--font-inter), system-ui, sans-serif`
- Headings: `Plus Jakarta Sans` → `--font-heading: var(--font-jakarta), var(--font-inter), system-ui, sans-serif`

Do not introduce a new font family without updating `globals.css` and `layout.tsx`.

---

## Spacing Scale

Base unit 4 px. Every padding/margin/gap value in the app should come from this list.

```
Token   px    Tailwind equiv   Usage
────────────────────────────────────────────────────────────────
xs       4px   p-1 / gap-1     tight internal padding (icon-to-text gaps)
sm       8px   p-2 / gap-2     standard internal component padding
md      12px   p-3 / gap-3     bubble internal padding, input field padding
lg      16px   p-4 / gap-4     section padding, card padding
xl      20px   p-5 / gap-5     screen-edge horizontal padding
xxl     24px   p-6 / gap-6     section-to-section vertical spacing
huge    32px   p-8 / gap-8     major layout breaks (e.g. hero section padding)
```

---

## Border Radius Scale

```
Token   px      CSS custom property   Usage
────────────────────────────────────────────────────────────────────────────
xs       4px    (--radius-xs — add to globals.css before use)   hairline tags, small badges, bubble tail corner
sm       8px    --radius-sm           form inputs, message input bar
md      12px    --radius-md           secondary cards
lg      16px    --radius-lg           message bubbles (base), cards, settings panels
xl      20px    --radius-xl           pricing/feature-style cards, modals
pill   999px    --radius-full         all buttons, status pills, role badges (Host/Member/Admin)
```

**Message bubble shape:** `lg` (16 px) radius on three corners; the corner nearest
the sender's side reduced to `xs` (4 px). This creates the speech-bubble direction
cue. Apply mirrored for sent (bottom-right tail) and received (bottom-left tail).

---

## Component States

Every interactive element must follow these states — don't improvise per-component.

### Buttons (primary — "Get started", "Save changes", "Send")
- Default: `primary` (#8b5cf6) background, `on-primary` (#fff) text, `pill` radius
- Hover: `primary-press` (#7c3aed) background
- Pressed: `primary-press` background, scale(0.97)
- Disabled: `primary` at 40 % opacity, `cursor-not-allowed`, no pointer events
- Loading: spinner replaces label text, button stays disabled

### Toggle buttons (mic, camera, screen-share in call/meet screens)
- Active/ON: filled `primary` background, `on-primary` icon color
- Inactive/OFF: 1 px `hairline` border, `ink-mute` icon color, transparent/`canvas` background
- Never visually similar to the hang-up button — keep weight clearly distinct

### Destructive action (hang-up button)
- `semantic-error` (#f43f5e) background, filled
- Diameter at least 1.3 × the toggle button diameter
- Isolated with ≥ `lg` (16 px) spacing from the toggle row
- No pressed-state ambiguity — must never read as a toggle

### Message bubbles
- Sent: `primary` background, `on-primary` text, tail on the right
- Received: `bubble-received` (#eeedf8) background, `ink` text, tail on the left
- Reply preview (quoted block inside a bubble): `primary-tint` (#ede9fe) background,
  left border accent in `primary`; on sent bubbles use a darkened overlay variant

### Input fields (message input bar, form fields)
- Default: `canvas-elevated` background, 1 px `hairline` border, `sm` radius
- Focused: border color → `primary`, 2 px width (via `ring`)
- Error: border color → `semantic-error`, error message below field in `semantic-error`
- Never flat/borderless — must always read as a contained, tappable field

---

## Usage Instructions for Claude Code

When implementing any UI change to Huddle:

1. **Check this file first.** Use existing tokens — never invent a new color, spacing
   value, or radius inline.
2. If a needed value doesn't exist here, stop and flag it rather than guessing —
   propose an addition to this file first, then apply.
3. When asked to "make it calmer," "less white," "more polished," etc. — translate
   that request into specific token changes here, update this file, then apply the
   updated tokens to components. Don't apply one-off fixes that bypass the system.
4. This file covers visual tokens only. Do not use styling prompts to change component
   behavior, and don't use behavior/logic prompts to change these tokens without also
   updating this file.
5. Scope every change to only the files and concerns explicitly named in the current
   prompt. Do not restyle, refactor, or "improve" adjacent code beyond what was asked.
