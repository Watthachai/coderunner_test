# ExpenseFlow — Build Notes

## What this is
**ExpenseFlow** is a mobile-first expense tracking app for small teams.

- **IDEA:** A mobile-first expense tracking app for small teams.
- **BRD:** Teams submit expenses, managers approve, finance exports.
- **PRD:** Screens — submit, approvals, dashboard.

This repository is the FITT Builder export of the prototype. The prototype is a
minimal **Vite + React** single-page app that currently renders the ExpenseFlow
landing placeholder ("Track team expenses."). It has been set up faithfully as a
clean, runnable project — no redesign, restyle, or extra features were added.

## How to run

Prerequisites: Node.js (built/tested with v22) and npm.

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server (hot reload)
npm run build    # produce a production build in dist/
npm run preview  # serve the production build locally
```

## Project layout

```
index.html         # Vite HTML entry, mounts #root
vite.config.js     # Vite config with @vitejs/plugin-react
src/main.jsx       # React entry — mounts <App/> into #root
src/App.jsx        # Root component (ExpenseFlow prototype)
docs/              # Product briefs: IDEA.md, BRD.md, PRD.md
```

## What was fixed
Nothing needed to be changed to make it run. The export already contained a
valid `package.json`, Vite config, and source files. Setup consisted of:

1. Extracting the export and removing the source zip.
2. Running `npm install` (62 packages; generated `package-lock.json`).
3. Verifying `npm run build` succeeds — it builds cleanly (30 modules, ~143 kB JS).
4. Adding a `.gitignore` for `node_modules/` and `dist/`.

> Note: `npm install` reports a couple of advisory vulnerabilities in transitive
> dev dependencies. These were left as-is to preserve the exported dependency
> versions and reproduce the prototype faithfully (`npm audit fix --force` would
> introduce breaking version changes).
