function buildSnapshot(allocation = {}) {
  return [
    { label: "Growth", value: allocation.Growth || 0 },
    { label: "Dividend", value: allocation.Dividend || 0 },
    { label: "REIT", value: allocation.REIT || 0 },
    { label: "Cash", value: allocation.Cash || 0 }
  ];
}

function buildSignals(allocation = {}) {
  const signals = [];

  const growth = allocation.Growth || 0;
  const dividend = allocation.Dividend || 0;
  const reit = allocation.REIT || 0;
  const cash = allocation.Cash || 0;

  if (dividend >= 25) signals.push("✔️ Strong income base");
  if (growth >= 40) signals.push("✔️ Good growth exposure");
  if (reit >= 15) signals.push("⚠️ High REIT concentration");
  if (cash >= 10) signals.push("✔️ Healthy cash buffer");

  if (signals.length === 0) {
    signals.push("⚠️ Portfolio needs more balance");
  }

  return signals.slice(0, 3);
}

export { buildSnapshot, buildSignals };
