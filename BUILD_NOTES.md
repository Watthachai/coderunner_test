# ExpenseFlow — Build Notes

A mobile-first team expense tracker: employees submit expenses, managers approve/reject, finance sees totals. This build implements the PRD scope shipped in the prototype — an expense list with per-item status and a monthly total.

## Stack

Next.js 15 (App Router, TypeScript) + Prisma + PostgreSQL, Tailwind CSS v4, Docker (multi-stage, `output: "standalone"`).

## Commands

```bash
npm install                 # installs deps; postinstall runs `prisma generate` (no DB needed)
npx prisma db push          # sync schema.prisma to a local Postgres (needs DATABASE_URL)
npx prisma db seed          # loads the 4 sample expenses from the prototype's mock data
npm run dev                 # http://localhost:3000
npm run build               # next build — passes with NO live database
npm start                   # run the production server (needs DATABASE_URL at runtime)
docker build -t expenseflow .
docker run -p 3000:3000 -e DATABASE_URL="postgresql://..." expenseflow
```

Set `DATABASE_URL` in `.env` (see `.env.example`) for `dev`/`db push`/`seed`. `next build` never touches the database.

## Data model (`prisma/schema.prisma`)

```
Expense {
  id        String   @id @default(cuid())
  title     String
  amount    Float
  category  Category        // Travel | Food | Software | Office
  date      DateTime
  status    ExpenseStatus    // pending | approved | rejected (default: pending)
  createdAt DateTime @default(now())
}
```

Derived directly from the prototype's `src/types.ts` `Expense` interface and the BRD fields (title, amount, category, date) plus the PRD statuses.

## What changed (Vite SPA -> Next.js + Prisma)

- Removed `index.html`, `vite.config.ts`, `src/main.tsx` (Next owns bootstrapping/mounting).
- `src/App.tsx` -> `app/page.tsx`: now an **async Server Component** that reads expenses via Prisma (`prisma.expense.findMany`) and computes the total server-side, instead of importing the in-memory `expenses` array. Marked `export const dynamic = "force-dynamic"` so `next build` never queries the database at build time.
- `src/components/ExpenseList.tsx` -> `components/ExpenseList.tsx`, ported 1:1 (same markup/classes/status-color logic), typed against the generated Prisma `Expense` type instead of the hand-written one in `src/types.ts`.
- No client component / `"use client"` needed anywhere — the prototype has no hooks or interactivity, so the whole UI stays server-rendered.
- `src/index.css` -> `app/globals.css`, now starting with `@import "tailwindcss"` (Tailwind v4 installed locally via `@tailwindcss/postcss` instead of the CDN `<script>` the prototype used) — same visual result, production-ready build.
- `src/data.ts`'s mock array moved to `prisma/seed.ts` (`prisma db seed`, wired via `tsx` + the `prisma.seed` field in `package.json`).
- Added `lib/prisma.ts` (singleton client), `prisma/schema.prisma`, `.env.example`.
- `next.config.ts`: `output: "standalone"` for the Docker image, plus `outputFileTracingRoot` pinned to the project root (silences a workspace-root warning from an unrelated lockfile in a parent directory).
- `Dockerfile`/`.dockerignore` from the standard template; fixed one issue in the `deps` stage — `prisma/schema.prisma` must be copied in **before** `npm ci`, since `postinstall` runs `prisma generate`, which needs the schema file present.

## Verified

- `npm install && npx next build` passes with no database running.
- `npx tsc --noEmit` passes.
- End-to-end smoke test: ran a local Postgres container, `prisma db push` + `prisma db seed`, then `next start` — rendered HTML matched the prototype exactly (title, 4 expenses, categories, dates, status colors, total = $566.49).
- `docker build` succeeds; the built image, run against a seeded Postgres container on a Docker network, served the same page correctly over HTTP.
