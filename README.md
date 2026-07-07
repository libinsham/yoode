# Yoode — Next.js + Prisma + Postgres (Supabase)

Full rebuild of the Yoode custom-merch site: Next.js 14 (App Router), a real
database via Prisma, a working admin panel (product CRUD + orders), a 2D
logo-overlay customizer for the whole catalogue, and a rotating **3D**
preview (Three.js, procedural geometry — no external model files) for
flagship products: mug, bottle, t-shirt/polo.

## 1. Run it locally (SQLite, zero setup)

```bash
npm install
npm run db:push      # creates the local SQLite database from prisma/schema.prisma
npm run db:seed       # loads the 12 starter products
npm run dev
```

Visit http://localhost:3000. Admin panel: http://localhost:3000/admin

That's it for local dev — no external accounts needed yet.

## 2. Go to production: Supabase (Postgres) + Vercel

This is the recommended path: free to start, no server to manage, and Prisma
makes the local→production switch a two-line change.

### a) Create a Supabase project
1. Go to supabase.com → New Project (free tier is fine).
2. Once created, go to **Project Settings → Database → Connection string**
   and copy the **URI** (use the "Connection pooling" string for Vercel's
   serverless functions — it's labeled `Transaction` mode, port 6543).

### b) Point Prisma at Postgres
In `prisma/schema.prisma`, change:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```
to:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### c) Push the schema and seed Supabase
```bash
# .env -> DATABASE_URL="<your supabase connection string>"
npm run db:push
npm run db:seed
```

### d) Deploy to Vercel
1. Push this project to a GitHub repo.
2. Import it in vercel.com → New Project.
3. Add an environment variable `DATABASE_URL` = your Supabase connection
   string (the same one from step a).
4. Deploy. Vercel runs `prisma generate` automatically via the `postinstall`
   script already in `package.json`.

Your admin panel at `/admin` and storefront will now read/write the same
Supabase Postgres database — accessible from anywhere, not just your
browser's localStorage.

## Notes & things worth knowing

- **Cart** stays in the browser's `localStorage` (this is normal — every
  major e-commerce site does this; the cart is yours until you check out).
  **Orders** are written to the real database the moment someone checks out,
  so they show up in `/admin` immediately, from any device.
- **Uploaded logos** are currently stored as base64 data URLs directly in the
  database for simplicity. Fine for a prototype/small store; for higher
  volume, swap to **Supabase Storage** (or S3/Cloudinary) and store a URL
  instead — ask me and I'll wire that in.
- **3D preview**: only mug / bottle / t-shirt / polo get the 3D toggle right
  now (`SHAPE_3D` in `src/app/customizer/page.tsx`). Everything else uses the
  2D mockup overlay, matching how Vistaprint/Printful actually do it for most
  of their catalogue.
- To reset the product catalogue at any time, delete all rows in the
  `Product` table (or re-run `npm run db:seed` on an empty table).

## Project structure

```
prisma/schema.prisma     Product / Order / OrderItem models
prisma/seed.ts           12 starter products
src/app/page.tsx         Homepage
src/app/shop/            Filterable catalogue
src/app/customizer/      2D + 3D product customizer, live pricing
src/app/cart/            Cart + checkout → creates a real Order
src/app/admin/           Product CRUD + dashboard + orders list
src/app/api/products/    REST endpoints (GET/POST, GET/PUT/DELETE by id)
src/app/api/orders/      REST endpoints (GET/POST)
src/components/          Header, Footer, ProductThumb (2D), ProductViewer3D
src/lib/                 prisma client, cart helpers, pricing logic, types
```
