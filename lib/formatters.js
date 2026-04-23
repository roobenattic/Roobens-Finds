function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatTickerPlanForUI(tickerPlan) {
  const sellLines = (tickerPlan?.sell || []).map(
    (item) =>
      `- An example reduction could include ${item.ticker} → ${formatMoney(
        item.amount
      )}`
  );

  const buyLines = (tickerPlan?.buy || []).map(
    (item) =>
      `- An example addition could include ${item.ticker} → ${formatMoney(
        item.amount
      )}`
  );

  return {
    sellTitle: "Possible Reductions",
    sellLines,
    buyTitle: "Possible Additions",
    buyLines
  };
}

export { formatMoney, formatTickerPlanForUI };