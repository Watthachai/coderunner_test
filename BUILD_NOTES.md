# BUILD_NOTES — ExpenseFlow

## Product
ExpenseFlow is an expense-claim and cash-advance management demo for a small
consultancy (Digitalvalue): employees file cash advances (`ADV-2026-XXXXX`) and
expense claims (`EXP-2026-XXXXX`) with receipt OCR, documents move through a
3-step approval workflow (Employee → Department Head → Finance), and a real-time
dashboard summarizes spend by department/category and outstanding advances. UI is
Thai, THB-only, indigo theme.

## Stack (detected, not assumed)
- **Vite 6** (`vite build`) + **React 18** + **TypeScript** (`.tsx`, JSX via `@vitejs/plugin-react`)
- **Tailwind CSS v4** via CDN browser script (loaded in `index.html`, not a build dependency)
- **lucide-react** (icons) and **recharts** (dashboard charts)
- Fonts (Anuphan/Inter) loaded from Google Fonts CDN
- No test setup; `tsc` is not part of the build (build is a plain `vite build`)

## Commands
```bash
npm install     # no lockfile shipped; a package-lock.json is now generated
npm run dev      # Vite dev server (http://localhost:5173, --host enabled)
npm run build    # production build → dist/
npm run preview  # serve the built dist/ locally
```

## Verification
- `npm install` → 105 packages, 0 vulnerabilities.
- `npm run build` → succeeds, `dist/` emitted (index.html + hashed css/js). The
  "chunks larger than 500 kB" message is Vite's advisory warning, not an error.
- `npm run dev` → server boots in ~150 ms, serves the app, `src/main.tsx`
  transpiles and React/deps resolve at runtime.

## Changes made (and why)
The export was already coherent and built with **zero source-code changes**. Only
project hygiene was added:

- **Moved the extracted project to the repository root** and deleted the export
  zip. (Skill step: extract in place; no code touched.)
- **`package.json` `name`:** `fitt-demo` (placeholder) → `expenseflow`
  (kebab-case slug of the product). No dependency or script changes.
- **Added `.gitignore`:** ignores `node_modules/`, `dist/`, `build/`, `.next/`,
  `.env*`, logs, and `.DS_Store`. None existed before.

## Notes
- `lucide-react` and `recharts` are pinned to `"latest"` in `package.json` (as
  shipped). The generated `package-lock.json` pins the resolved versions
  (lucide-react 1.22.0, recharts 3.9.1) so installs are reproducible; left the
  `package.json` specifiers untouched to keep the diff faithful to the export.
- Tailwind and fonts load from CDNs, so the built app needs network access at
  runtime to render fully styled.
