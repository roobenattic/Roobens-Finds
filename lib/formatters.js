function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTickerPlanForUI(plan = {}) {
  return {
    title: "Category-level educational guidance",
    actions: Array.isArray(plan.categoryGuidance) ? plan.categoryGuidance : [],
  };
}

export { formatMoney, formatTickerPlanForUI };
