import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.expense.createMany({
    data: [
      { title: "Flight to client", amount: 420.5, category: "Travel", date: new Date("2026-06-12"), status: "approved" },
      { title: "Team lunch", amount: 88.0, category: "Food", date: new Date("2026-06-18"), status: "pending" },
      { title: "Figma seats", amount: 45.0, category: "Software", date: new Date("2026-06-20"), status: "approved" },
      { title: "Printer paper", amount: 12.99, category: "Office", date: new Date("2026-06-22"), status: "rejected" },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
