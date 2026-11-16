# Shared Components

Components in this folder are portable between projects. Copy a file (plus anything listed in its `Requires:` header) into another React + TypeScript project and it works with no edits.

## Rules

Every file in `shared/` must follow these rules. ESLint enforces the import rules (see `eslint.config.js`).

1. **Imports: `react` and sibling `shared/` files only.** No `../` imports, no `@/` path aliases, and no project modules (content, schema, hooks, utils, router, API client).
2. **Data comes in through props.** Never read site content, global state, or env vars. If a component needs a value, it's a prop.
3. **No styling assumptions.** No CSS imports, and no framework classes (daisyUI, shadcn tokens, project CSS variables). Accept `className` and let the consuming project style it. Basic Tailwind utilities are fine only as overridable defaults.
4. **Declare what to copy.** Start each file with a header comment:

   ```ts
   // Shared component: portable between projects. See ./README.md for the rules.
   // Requires: react, ./youtube.ts
   ```

   List any npm packages beyond `react`, and any sibling files the component imports.
5. **Strict-TypeScript safe.** Use named exports and `import type` for type-only imports (works with `verbatimModuleSyntax`), and avoid `enum`/`namespace` (works with `erasableSyntaxOnly`).
6. **One component per `.tsx` file.** Non-component helpers go in their own `.ts` file, so React Fast Refresh keeps working.

## Inventory

| File | What it does | Requires |
| --- | --- | --- |
| `Button.tsx` | Site-wide button: `<button>` or `<a>` (with `href`), variants, sizes, shapes, colors, icons, loading state | react, `buttonStyles.ts` |
| `buttonStyles.ts` | `getButtonProps()`: the Button look as `className` + `style`, for router links and other elements; themeable via `--button-color` / `--button-contrast` | none |
| `Sheet.tsx` | Panel that slides in from the top or bottom over a backdrop; Escape/backdrop close, scroll lock | react |
| `FallbackImage.tsx` | `<img>` that shows a labelled placeholder when `src` is missing or fails to load | react |
| `YouTubeEmbed.tsx` | Lazy-loaded YouTube iframe from a URL or video ID | react, `youtube.ts` |
| `Countdown.tsx` | Live weeks : days : hours : minutes countdown to an ISO date | react, `useNow.ts` |
| `useNow.ts` | `useNow(ms)`: current time that re-renders every interval (shared timer per interval) | react |
| `youtube.ts` | `getYouTubeVideoId()`: parses watch, youtu.be, embed, shorts, and live URLs | none |

## Adding A Component

1. Build it inside the project as usual.
2. Once it has no project-specific dependencies, move it here and add the header comment.
3. Add it to the inventory table above.
4. Run `bun run lint`. The import rules fail if anything project-specific remains.

Project-specific components that read EPK content belong in `components/epk/`, not here.
