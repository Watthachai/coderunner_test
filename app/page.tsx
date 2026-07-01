import { prisma } from "@/lib/prisma";
import { ExpenseList } from "@/components/ExpenseList";

export const dynamic = "force-dynamic";

export default async function Page() {
  const expenses = await prisma.expense.findMany({ orderBy: { date: "asc" } });
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">ExpenseFlow</h1>
        <p className="text-slate-400">Team expense tracker</p>
      </header>
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">Total this month</p>
        <p className="text-3xl font-bold">${total.toFixed(2)}</p>
      </div>
      <ExpenseList items={expenses} />
    </main>
  );
}
