import { prisma } from "@/lib/prisma";
import AppView from "@/components/AppView";
import type { Customer, Order, Product } from "@/lib/types";

// Reads live data from Postgres at request time — never at build time, so
// `next build` succeeds without a database (see prisma-setup.md §8).
export const dynamic = "force-dynamic";

export default async function Page() {
  const [products, customers, orders] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.customer.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.order.findMany({
      orderBy: { created_at: "asc" },
      include: { items: true },
    }),
  ]);

  const initialProducts: Product[] = products.map((p) => ({
    id: p.id,
    name_th: p.name_th,
    name_en: p.name_en,
    base_price: p.base_price,
    image_url: p.image_url,
    category: p.category as Product["category"],
    is_available: p.is_available,
  }));

  const initialCustomers: Customer[] = customers.map((c) => ({
    id: c.id,
    phone: c.phone,
    name: c.name,
    points: c.points,
    tier: c.tier as Customer["tier"],
  }));

  const initialOrders: Order[] = orders.map((o) => ({
    id: o.id,
    order_number: o.order_number,
    phone: o.phone,
    customer_name: o.customer_name ?? undefined,
    items: o.items.map((it) => ({
      product_id: it.product_id,
      product_name: it.product_name,
      customizations: it.customizations,
      quantity: it.quantity,
      price_per_unit: it.price_per_unit,
    })),
    subtotal: o.subtotal,
    discount_amount: o.discount_amount,
    total: o.total,
    slip_url: o.slip_url ?? undefined,
    status: o.status as Order["status"],
    created_at: o.created_at.toISOString(),
  }));

  return (
    <AppView
      initialProducts={initialProducts}
      initialCustomers={initialCustomers}
      initialOrders={initialOrders}
    />
  );
}
