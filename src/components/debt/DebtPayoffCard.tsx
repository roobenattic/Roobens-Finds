import { useState } from "react";
import { calculateDebtSummary, type Debt } from "../../lib/debtLogic";

export default function DebtPayoffCard() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [form, setForm] = useState({
    name: "",
    balance: "",
    interest: "",
    minimumPayment: "",
  });

  const summary = debts.length > 0 ? calculateDebtSummary(debts) : null;
  const payoffPreview = summary?.snowballOrder.slice(0, 3) || [];

  function addDebt() {
    if (!form.name.trim() || !form.balance) return;

    setDebts((current) => [
      ...current,
      {
        name: form.name.trim(),
        balance: Number(form.balance),
        interest: Number(form.interest || 0),
        minimumPayment: Number(form.minimumPayment || 0),
      },
    ]);

    setForm({ name: "", balance: "", interest: "", minimumPayment: "" });
  }

  return (
    <section className="mt-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          Debt Module
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Debt Payoff
        </h2>

        <p className="mt-2 max-w-2xl text-slate-600">
          Add your debts and see what to attack first.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <input
          className="rounded-xl border border-slate-200 p-3 outline-none focus:border-slate-950"
          placeholder="Debt name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="rounded-xl border border-slate-200 p-3 outline-none focus:border-slate-950"
          placeholder="Balance"
          type="number"
          value={form.balance}
          onChange={(e) => setForm({ ...form, balance: e.target.value })}
        />

        <input
          className="rounded-xl border border-slate-200 p-3 outline-none focus:border-slate-950"
          placeholder="Interest %"
          type="number"
          value={form.interest}
          onChange={(e) => setForm({ ...form, interest: e.target.value })}
        />

        <input
          className="rounded-xl border border-slate-200 p-3 outline-none focus:border-slate-950"
          placeholder="Min payment"
          type="number"
          value={form.minimumPayment}
          onChange={(e) =>
            setForm({ ...form, minimumPayment: e.target.value })
          }
        />
      </div>

      <button
        type="button"
        onClick={addDebt}
        className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Add Debt
      </button>

      {summary && (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Total Debt</p>
              <p className="mt-2 text-2xl font-bold">
                ${summary.total.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Highest Interest</p>
              <p className="mt-2 text-2xl font-bold">
                {summary.highestInterest.name} —{" "}
                {summary.highestInterest.interest}%
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Pay First</p>
              <p className="mt-2 text-2xl font-bold">
                {summary.snowballOrder[0]?.name}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Focus on this debt first to build momentum.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Premium Preview
            </p>

            <h3 className="mt-2 text-2xl font-semibold">
              Your Debt Freedom Plan
            </h3>

            <p className="mt-2 text-slate-300">
              Follow this order and eliminate your debt faster while paying less
              in interest.
            </p>

            <div className="mt-5 space-y-3">
              {payoffPreview.map((debt, index) => (
                <div
                  key={debt.name}
                  className="flex items-center justify-between rounded-2xl bg-white/10 p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {index + 1}. {debt.name}
                    </p>

                    <p className="text-sm text-slate-300">
                      Balance: ${debt.balance.toLocaleString()} • Min: $
                      {debt.minimumPayment.toLocaleString()}
                    </p>
                  </div>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                    Free Preview
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4">
              🔒 Unlock your full step-by-step payoff timeline + downloadable
              plan
            </div>
          </div>
        </>
      )}
    </section>
  );
}