import { useState } from "react";

export default function CashFlowCard() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");

  const totalIncome = Number(income || 0);
  const totalExpenses = Number(expenses || 0);
  const leftover = totalIncome - totalExpenses;

  return (
    <section className="mt-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          Cash Flow Module
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Cash Flow
        </h2>

        <p className="mt-2 max-w-2xl text-slate-600">
          Understand where your money is going every month.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          className="rounded-xl border border-slate-200 p-3 outline-none focus:border-slate-950"
          placeholder="Monthly Income"
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 p-3 outline-none focus:border-slate-950"
          placeholder="Monthly Expenses"
          type="number"
          value={expenses}
          onChange={(e) => setExpenses(e.target.value)}
        />
      </div>

      {(income || expenses) && (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Income</p>
            <p className="mt-2 text-2xl font-bold">
              ${totalIncome.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Expenses</p>
            <p className="mt-2 text-2xl font-bold">
              ${totalExpenses.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Leftover</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                leftover >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${leftover.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}