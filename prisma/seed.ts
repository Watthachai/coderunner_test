import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Ported verbatim from the prototype's src/data.ts (the in-memory mock).
const products = [
  { id: "PROD-001", name_th: "ไอซ์ ลาเต้", name_en: "Iced Latte", base_price: 75, image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600", category: "Coffee", is_available: true },
  { id: "PROD-002", name_th: "มัทฉะ ลาเต้", name_en: "Matcha Latte", base_price: 85, image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600", category: "Tea", is_available: true },
  { id: "PROD-003", name_th: "สตรอว์เบอร์รี่ นมสด", name_en: "Strawberry Milk", base_price: 80, image_url: "https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&q=80&w=600", category: "Non-Coffee", is_available: true },
  { id: "PROD-004", name_th: "เอสเพรสโซ่เย็น", name_en: "Iced Espresso", base_price: 70, image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600", category: "Coffee", is_available: true },
  { id: "PROD-005", name_th: "ชาไทยพรีเมียม", name_en: "Premium Thai Tea", base_price: 70, image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600", category: "Tea", is_available: true },
  { id: "PROD-006", name_th: "ดาร์ก โกโก้", name_en: "Dark Cocoa", base_price: 75, image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=600", category: "Non-Coffee", is_available: true },
  { id: "PROD-007", name_th: "อเมริกาโน่น้ำส้ม", name_en: "Orange Americano", base_price: 85, image_url: "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&q=80&w=600", category: "Coffee", is_available: true },
  { id: "PROD-008", name_th: "ครอฟเฟิลเคลือบน้ำตาล", name_en: "Sugar Glazed Croffle", base_price: 65, image_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600", category: "Bakery", is_available: true },
  { id: "PROD-009", name_th: "สตรอว์เบอร์รี่ ช็อตเค้ก", name_en: "Strawberry Shortcake", base_price: 95, image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600", category: "Bakery", is_available: false },
];

// Customization options (BRD/PRD entity) — mirror the modal's hardcoded options.
const customizationOptions = [
  { id: "OPT-TEMP-1", type: "temperature", name: "ร้อน", extra_price: 0 },
  { id: "OPT-TEMP-2", type: "temperature", name: "เย็น", extra_price: 0 },
  { id: "OPT-TEMP-3", type: "temperature", name: "ปั่น", extra_price: 10 },
  { id: "OPT-SWEET-1", type: "sweetness", name: "0%", extra_price: 0 },
  { id: "OPT-SWEET-2", type: "sweetness", name: "25%", extra_price: 0 },
  { id: "OPT-SWEET-3", type: "sweetness", name: "50%", extra_price: 0 },
  { id: "OPT-SWEET-4", type: "sweetness", name: "100%", extra_price: 0 },
  { id: "OPT-MILK-1", type: "milk", name: "นมจืด", extra_price: 0 },
  { id: "OPT-MILK-2", type: "milk", name: "นมถั่วเหลือง", extra_price: 10 },
  { id: "OPT-MILK-3", type: "milk", name: "นมโอ๊ต", extra_price: 15 },
  { id: "OPT-TOP-1", type: "topping", name: "ไข่มุก", extra_price: 10 },
  { id: "OPT-TOP-2", type: "topping", name: "เจลลี่", extra_price: 10 },
  { id: "OPT-TOP-3", type: "topping", name: "เพิ่มช็อตกาแฟ", extra_price: 15 },
];

const customers = [
  { id: "CUST-001", phone: "0812345678", name: "น้องพิม พาสเทล", points: 150, tier: "Gold" },
  { id: "CUST-002", phone: "0898765432", name: "คุณมินโฮ สุดหล่อ", points: 45, tier: "Silver" },
  { id: "CUST-003", phone: "0855551234", name: "คุณนุ่มนิ่ม มินิมอล", points: 8, tier: "General" },
];

const SLIP = "https://images.unsplash.com/photo-1628258334807-290b5072f6a6?auto=format&fit=crop&q=80&w=400";

const orders = [
  {
    id: "ORD-101",
    order_number: "#001",
    phone: "0812345678",
    customer_name: "น้องพิม พาสเทล",
    subtotal: 100,
    discount_amount: 10, // 10% Gold discount
    total: 90,
    points_earned: 9,
    slip_url: SLIP,
    status: "รอตรวจสอบ",
    created_at: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    items: [
      { product_id: "PROD-001", product_name: "ไอซ์ ลาเต้", customizations: ["เย็น", "หวาน 50%", "นมโอ๊ต (+฿15)", "ไข่มุก (+฿10)"], quantity: 1, price_per_unit: 100 },
    ],
  },
  {
    id: "ORD-102",
    order_number: "#002",
    phone: "0898765432",
    customer_name: "คุณมินโฮ สุดหล่อ",
    subtotal: 210,
    discount_amount: 10.5, // 5% Silver discount
    total: 199.5,
    points_earned: 19,
    slip_url: SLIP,
    status: "กำลังชง",
    created_at: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    items: [
      { product_id: "PROD-002", product_name: "มัทฉะ ลาเต้", customizations: ["ปั่น (+฿10)", "หวาน 100%", "นมจืด", "เจลลี่ (+฿10)"], quantity: 2, price_per_unit: 105 },
    ],
  },
];

async function main() {
  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, update: p, create: p });
  }

  for (const o of customizationOptions) {
    await prisma.customizationOption.upsert({ where: { id: o.id }, update: o, create: o });
  }

  for (const c of customers) {
    await prisma.customer.upsert({ where: { id: c.id }, update: c, create: c });
  }

  for (const { items, ...order } of orders) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: order,
      create: { ...order, items: { create: items } },
    });
  }

  console.log("✅ Seed complete:", {
    products: products.length,
    options: customizationOptions.length,
    customers: customers.length,
    orders: orders.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
