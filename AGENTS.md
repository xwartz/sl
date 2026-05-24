# AGENTS.md

Read `DESIGN.md` before making UI changes.

## Do

- Keep diffs small and local.
- Use React function components and existing hooks patterns.
- Use semantic tokens and utilities from `src/index.css` for all styling.
- Keep user-facing copy in `src/locales/en.ts` and `src/locales/zh.ts`.
- Preserve light and dark mode parity.
- Reuse existing UI patterns before introducing new abstractions.
- Use `src/store/position-store.ts` for shared position state.
- Keep calculation logic in `src/lib/position-calculator.ts` instead of
  duplicating it in components.

## Don't

- Do not hardcode hex colors, direct Tailwind palette colors, or inline style
  objects in components unless there is no semantic token for the need.
- Do not add new dependencies without approval.
- Do not bypass i18n for visible UI copy.
- Do not rewrite large surfaces when a focused edit is enough.
- Do not break responsive parity between the desktop table flow and the mobile
  card flow.

## Commands

- Install dependencies: `pnpm install`
- Start local dev: `pnpm dev`
- Format or lint touched files: `pnpm exec biome check --write src/path/to/file.tsx`
- Full lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Production build: `pnpm build`
- Full verification: `pnpm check`

There is no dedicated unit test script in this repo right now. Use lint,
typecheck, build, and manual UI verification as the default validation stack.

## Safety And Permissions

Allowed without asking:

- Read, search, and list files
- Run `pnpm exec biome check --write ...` on touched files
- Run `pnpm lint`
- Run `pnpm typecheck`

Ask first:

- Adding or updating dependencies
- Deleting files or making broad renames
- Running `pnpm build` or `pnpm check`
- Making network-dependent changes beyond documentation lookup

## Project Structure

- App shell and header: `src/App.tsx`
- Main workflow: `src/components/PositionCalculator.tsx`
- Shared controls: `src/components/IconButton.tsx`, `src/components/NumberInput.tsx`
- Position UI modules: `src/components/position/*`
- Calculation logic: `src/lib/position-calculator.ts`
- State: `src/store/position-store.ts`
- Global theme and utilities: `src/index.css`, `src/lib/theme-context.ts`
- Locales: `src/locales/en.ts`, `src/locales/zh.ts`
- Visual guidance: `DESIGN.md`

## Good Examples

- Compact toggle groups: `src/components/position/ConfigurationPanel.tsx`
- Responsive order entry: `src/components/position/OrderList.tsx`,
  `src/components/position/OrderTableRow.tsx`,
  `src/components/position/OrderCard.tsx`
- Utility actions and overlays: `src/components/IconButton.tsx`,
  `src/components/ShareButton.tsx`
- Summary presentation: `src/components/position/SummaryPanel.tsx`

## PR Checklist

- User-facing copy updated in both locale files when text changes
- No raw colors added to components
- Light and dark modes both still work
- `pnpm lint` and `pnpm typecheck` pass
- Diff stays focused and easy to review

## When Stuck

- Inspect the nearest existing component and `src/index.css` before adding a
  new abstraction.
- Ask before making speculative structural changes.
- If a UI change alters the visual language, update `DESIGN.md` in the same
  change.
