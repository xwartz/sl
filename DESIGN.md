# DESIGN

## Product Feel

SL should feel like a compact trading workspace: calm, dense, and precise.
The UI is intentionally restrained so numbers, risk states, and plan actions stay
easy to scan.

## Core Rules

- Start from semantic tokens in `src/index.css`.
- Keep the base palette neutral. Use status colors only for meaning.
- Preserve light and dark mode parity.
- Keep motion short and functional.
- Keep copy short enough for dense tables, cards, and utility menus.

## Visual Tokens

Use the semantic variables and utilities from `src/index.css`.

- Surfaces: `--bg`, `--card-bg`, `--panel-bg`
- Text: `--text`, `--text-secondary`, `--muted`
- Actions: `--accent`, `--accent-hover`, `--accent-text`
- Status: `--success`, `--warning`, `--danger`, `--info`
- Effects: `--focus-ring`, `--shadow-sm`, `--shadow-md`, `--scrim`, `--qr-canvas`

Do not introduce raw hex values or direct Tailwind palette colors inside React
components. Add or extend semantic utilities in `src/index.css` first.

## Layout

- `src/App.tsx` provides a sticky header with compact utility controls.
- `src/components/PositionCalculator.tsx` centers content in a
  `max-w-[1600px]` container with generous outer spacing.
- Main sections are separate cards: plan tabs, configuration, order list, and
  summary.
- Desktop favors a dense table for order entry. Mobile collapses the same data
  into stacked cards.

## Component Patterns

- Icon controls use `src/components/IconButton.tsx`: 40x40 rounded secondary
  buttons with subtle lift.
- Segmented controls use small pills on `bg-panel`, with active states driven by
  accent or status tokens.
- Inputs are rounded, compact, and placed on `bg-panel` or `bg-card`, often with
  inline currency or percent hints.
- Menus and modals are bordered cards with soft shadow, blur, and short entrance
  motion.
- Summary panels emphasize number hierarchy first, labels second, warnings only
  when needed.
- Destructive actions should stay understated until hover or warning state.

## Interaction

- Every clickable surface should show a pointer cursor.
- Default hover feedback is subtle: tint plus about a 1px lift.
- Primary and secondary buttons can use stronger shadow on hover.
- Press states should feel immediate, not bouncy.
- Keyboard users must keep a visible focus ring.
- Use short transitions, usually 150ms to 300ms.

## Copy

- Prefer short verbs: `Add`, `Copy`, `Share`, `Import`, `Export`.
- Prefer concise section labels: `Capital`, `Position`, `Risk`, `P&L`.
- Keep `src/locales/en.ts` and `src/locales/zh.ts` aligned.
- Avoid explanatory copy inside dense surfaces unless it prevents mistakes.

## Source Of Truth

- App shell: `src/App.tsx`
- Main workflow: `src/components/PositionCalculator.tsx`
- Tokens and utilities: `src/index.css`
- Shared controls: `src/components/IconButton.tsx`, `src/components/NumberInput.tsx`
- Position modules: `src/components/position/*`
