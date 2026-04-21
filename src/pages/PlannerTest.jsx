import { useState } from "react";

export default function PlannerTest() {
  const [ocrText, setOcrText] = useState("");
  const [strategy, setStrategy] = useState("balanced");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!ocrText.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: ocrText,
          totalValue: 10000,
          strategy
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Planner Test</h1>

      <label>Paste OCR Text</label>
      <textarea
        value={ocrText}
        onChange={(e) => setOcrText(e.target.value)}
        rows={8}
        style={{ width: "100%", marginTop: "8px", marginBottom: "16px" }}
        placeholder="Example: VYM 24.24% O 18.55% SCHD 9.48%"
      />

      <label>Strategy</label>
      <select
        value={strategy}
        onChange={(e) => setStrategy(e.target.value)}
        style={{ display: "block", marginTop: "8px", marginBottom: "16px" }}
      >
        <option value="balanced">Balanced</option>
        <option value="income">Income</option>
        <option value="growth">Growth</option>
      </select>

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Portfolio"}
      </button>

      {result && (
        <div style={{ marginTop: "24px" }}>
          <h2>Result</h2>

          {result.error ? (
            <p>{result.error}</p>
          ) : (
            <>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(result, null, 2)}
              </pre>

              {result.uiPlan && (
                <div style={{ marginTop: "16px" }}>
                  <h3>{result.uiPlan.sellTitle}</h3>
                  {result.uiPlan.sellLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}

                  <h3>{result.uiPlan.buyTitle}</h3>
                  {result.uiPlan.buyLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
