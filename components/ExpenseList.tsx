import type { Expense } from "@prisma/client";

const statusColor: Record<Expense["status"], string> = {
  approved: "text-emerald-400",
  pending: "text-amber-400",
  rejected: "text-rose-400",
};

export function ExpenseList({ items }: { items: Expense[] }) {
  return (
    <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900">
      {items.map((e) => (
        <li key={e.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-medium">{e.title}</p>
            <p className="text-xs text-slate-400">
              {e.category} · {e.date.toISOString().slice(0, 10)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono">${e.amount.toFixed(2)}</p>
            <p className={`text-xs ${statusColor[e.status]}`}>{e.status}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
