# BUILD_NOTES — Cafe Pre-order & Pick-up System

## Product
A Korean-cafe-style **pre-order & pick-up** web app: customers browse the drink
menu, customize each cup (temperature / sweetness / milk / toppings), apply a
membership discount, attach a transfer slip, and track their order in real time;
staff manage the order queue, verify slips, change order status, and toggle
out-of-stock menu items. Mobile-first for customers, desktop/tablet for staff.

## Stack
- **Next.js 16** (App Router, TypeScript, Turbopack) — `output: "standalone"`
- **Prisma 6 + PostgreSQL** for the data layer
- **Tailwind CSS v4** (installed locally via `@tailwindcss/postcss`)
- **lucide-react** (icons) + **recharts** (staff analytics chart) — same as the prototype
- **Docker** multi-stage build (node:20-alpine, non-root runtime)

## Commands
```bash
# 1. Install deps (postinstall runs `prisma generate`, no DB needed)
npm install

# 2. Generate the Prisma client (no DB connection required)
npx prisma generate

# 3. Production build — PASSES with no database running
npx next build

# 4. Local dev (needs Postgres + DATABASE_URL in .env)
cp .env.example .env            # then edit credentials
npx prisma migrate dev --name init   # create tables (needs a live DB)
npx prisma db seed                   # load the prototype's demo data
npm run dev                          # http://localhost:3000

# 5. Docker
docker build -t cafe-preorder .
docker run -p 3000:3000 -e DATABASE_URL="postgresql://USER:PASS@host:5432/cafe_preorder?schema=public" cafe-preorder
# (run `npx prisma migrate deploy` against the DB before/at container start)
```

> `next build` never connects to Postgres: the only data-reading route (`/`) is
> `export const dynamic = "force-dynamic"`, so its Prisma query runs at request
> time, not build time. `prisma generate` reads only the schema.

## Database schema (prisma/schema.prisma)
- **Product** — `id`, `name_th`, `name_en`, `base_price` (Int), `image_url`, `category` (Coffee | Tea | Non-Coffee | Bakery), `is_available` (Bool), `createdAt`.
- **CustomizationOption** — `id`, `type` (temperature | sweetness | milk | topping), `name`, `extra_price` (Int). BRD/PRD entity; seeded to mirror the modal's options.
- **Customer** — `id`, `phone` (unique), `name`, `points` (Int), `tier` (General | Silver | Gold), `createdAt`.
- **Order** — `id`, `order_number`, `phone`, `customer_name?`, `subtotal`, `discount_amount`, `total` (Floats — discounts can be `.5`), `points_earned` (Int), `slip_url?`, `status` (รอตรวจสอบ | กำลังชง | พร้อมรับ | สำเร็จ | ยกเลิก), `created_at`, and a 1-to-many `items`.
- **OrderItem** — `id`, `orderId` (FK, cascade delete), `product_id`, `product_name`, `customizations` (String[]), `quantity` (Int), `price_per_unit` (Float).

Statuses and customization labels are kept as the prototype's Thai strings so the
UI/UX is byte-for-byte faithful.

## What changed (Vite SPA → Next.js + Prisma)
- **Entry points:** deleted `index.html`, `src/main.tsx`, `vite.config.js`. `index.html`'s `<head>` (title, 🌸 favicon, Inter/Anuphan Google Fonts, `bg-[#FAF6F0]` body) moved into `app/layout.tsx` (`metadata` + `<head>`). `src/index.css` → `app/globals.css` (imported once), now starting with `@import "tailwindcss";` plus the original scrollbar + keyframe animations.
- **Root view:** `src/App.tsx` → `components/AppView.tsx` (`"use client"`), rendered by `app/page.tsx` (a **server component**, `force-dynamic`) which reads Products/Customers/Orders from Postgres and passes them as `initial*` props.
- **Components:** `CustomizationModal`, `CartDrawer`, `CheckoutView`, `OrderTrackingView`, `StaffDashboard` ported 1:1 into `components/` with `"use client"` and import paths updated to `@/lib/types` (and `mockSlips` → `@/lib/constants`). All JSX/styling is unchanged.
- **Types & data:** `src/types.ts` → `lib/types.ts`. The in-memory mock arrays (`src/data.ts`) moved into `prisma/seed.ts`; the UI-only sample slips became `lib/constants.ts`.
- **Data layer:** added `lib/prisma.ts` (client singleton), `app/actions.ts` (server actions: `persistNewOrder`, `persistOrderStatus`, `persistProductAvailability`, `persistNewCustomer`), `prisma/schema.prisma`, and `prisma/seed.ts`. The customer↔staff "real-time simulation" still runs on in-session React state (so role-switching instantly reflects changes exactly like the prototype); each mutation is additionally mirrored to Postgres via a server action. Persistence is wrapped in `.catch(() => {})` so the demo keeps working even when no DB is attached.
- **Config:** new `package.json` (Next scripts, `postinstall: prisma generate`, `prisma.seed`), `next.config.ts` (`output: "standalone"`; `outputFileTracingRoot`/`turbopack.root` pinned to this dir so the standalone `server.js` lands at the root despite a parent-repo lockfile), `postcss.config.mjs`, standard Next `tsconfig.json`, `.env.example`, `.gitignore`, plus the skill's `Dockerfile` + `.dockerignore`. Added an empty `public/` (the Dockerfile copies it).

## Outcome
`npx next build` **passes** (route `/` compiled as dynamic; TypeScript check clean;
standalone `server.js` emitted at `.next/standalone/server.js`) with **no database
running**. Runtime (dev / Docker) requires Postgres reachable via `DATABASE_URL`,
then `prisma migrate deploy` (or `migrate dev`) and `prisma db seed` to load the
demo menu/customers/orders.

### Not done here
- The running UI was **not** visually verified against a live Postgres instance in
  this environment (no database available). The production build and TypeScript
  compilation both pass; runtime rendering depends on the operator providing a DB
  and seeding it per the commands above.
