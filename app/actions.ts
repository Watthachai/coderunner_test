"use server";

import { prisma } from "@/lib/prisma";
import type { Customer, Order, OrderStatus } from "@/lib/types";

// The customer view and staff dashboard mutate shared state in-session (exactly
// like the prototype's React state) for the instant real-time simulation; these
// server actions persist each mutation to Postgres so the data layer is real.
// Callers wrap them in try/catch so the demo still runs if no DB is attached.

// Create a new order (with its line items) and award membership points.
export async function persistNewOrder(order: Order & { points_earned?: number }) {
  await prisma.order.create({
    data: {
      id: order.id,
      order_number: order.order_number,
      phone: order.phone,
      customer_name: order.customer_name ?? null,
      subtotal: order.subtotal,
      discount_amount: order.discount_amount,
      total: order.total,
      points_earned: order.points_earned ?? Math.floor(order.total / 10),
      slip_url: order.slip_url ?? null,
      status: order.status,
      created_at: new Date(order.created_at),
      items: {
        create: order.items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          customizations: item.customizations,
          quantity: item.quantity,
          price_per_unit: item.price_per_unit,
        })),
      },
    },
  });

  // Award points + recompute tier for an existing member (thresholds match the
  // prototype: 150 -> Gold, 50 -> Silver).
  const earned = order.points_earned ?? Math.floor(order.total / 10);
  const member = await prisma.customer.findUnique({ where: { phone: order.phone } });
  if (member) {
    const points = member.points + earned;
    const tier = points >= 150 ? "Gold" : points >= 50 ? "Silver" : member.tier;
    await prisma.customer.update({
      where: { phone: order.phone },
      data: { points, tier },
    });
  }
}

// Staff changes an order's status (รอตรวจสอบ -> กำลังชง -> พร้อมรับ -> สำเร็จ / ยกเลิก).
export async function persistOrderStatus(orderId: string, status: OrderStatus) {
  await prisma.order.update({ where: { id: orderId }, data: { status } });
}

// Staff toggles a product's availability (out-of-stock control).
export async function persistProductAvailability(
  productId: string,
  isAvailable: boolean,
) {
  await prisma.product.update({
    where: { id: productId },
    data: { is_available: isAvailable },
  });
}

// Register a brand-new member created at checkout.
export async function persistNewCustomer(customer: Customer) {
  await prisma.customer.upsert({
    where: { phone: customer.phone },
    update: {},
    create: {
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
      points: customer.points,
      tier: customer.tier,
    },
  });
}
