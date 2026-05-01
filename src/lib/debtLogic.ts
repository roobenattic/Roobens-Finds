export type Debt = {
  name: string;
  balance: number;
  interest: number;
  minimumPayment: number;
};

export function calculateDebtSummary(debts: Debt[]) {
  const total = debts.reduce((sum, d) => sum + Number(d.balance || 0), 0);

  const highestInterest = debts.reduce((max, d) =>
    Number(d.interest || 0) > Number(max.interest || 0) ? d : max
  );

  const snowballOrder = [...debts].sort(
    (a, b) => Number(a.balance || 0) - Number(b.balance || 0)
  );

  return {
    total,
    highestInterest,
    snowballOrder,
  };
}