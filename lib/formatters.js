function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatTickerPlanForUI(tickerPlan) {
  const sellLines = (tickerPlan?.sell || []).map(
    (item) => `- Sell ${item.ticker} → ${formatMoney(item.amount)}`
  );

  const buyLines = (tickerPlan?.buy || []).map(
    (item) => `- Buy ${item.ticker} → ${formatMoney(item.amount)}`
  );

  return {
    sellTitle: "Sell",
    sellLines,
    buyTitle: "Buy",
    buyLines
  };
}

export { formatMoney, formatTickerPlanForUI };
