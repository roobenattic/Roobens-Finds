import { useState } from "react";

export default function PlannerTest() {
  const [ocrText, setOcrText] = useState("");
  const [strategy, setStrategy] = useState("balanced");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const buttonStyle = {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease"
  };

  async function handleImageOCR(file) {
    if (!file) return;

    setOcrLoading(true);

    try {
      const Tesseract = (await import("tesseract.js")).default;
      const {
        data: { text }
      } = await Tesseract.recognize(file, "eng");

      setOcrText(text || "");
    } catch (err) {
      console.error(err);
    } finally {
      setOcrLoading(false);
    }
  }

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
    } catch (err) {
      console.error(err);
      setResult({ error: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "760px",
        margin: "100px auto 40px",
        padding: "24px",
        background: "#ffffff",
        border: "5px solid #e5e7eb",
        borderRadius: "16px",
        boxSizing: "border-box"
      }}
    >
      <h1 style={{ marginBottom: "16px", fontSize: "28px" }}>Planner Test</h1>

      <label
        htmlFor="portfolio-upload"
        style={{
          ...buttonStyle,
          display: "inline-block",
          background: "#111827",
          color: "#ffffff",
          marginBottom: "16px"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.opacity = "1";
        }}
      >
        Upload Portfolio Screenshot
      </label>

      <input
        id="portfolio-upload"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageOCR(file);
        }}
        style={{ display: "none" }}
      />

      <textarea
        value={ocrText}
        onChange={(e) => setOcrText(e.target.value)}
        rows={8}
        style={{
          width: "100%",
          maxWidth: "100%",
          display: "block",
          marginTop: "8px",
          marginBottom: "16px",
          padding: "12px",
          border: "1px solid #d1d5db",
          borderRadius: "10px",
          boxSizing: "border-box",
          resize: "vertical"
        }}
        placeholder="OCR text will appear here..."
      />

      <select
        value={strategy}
        onChange={(e) => setStrategy(e.target.value)}
        style={{
          display: "block",
          marginBottom: "16px",
          padding: "10px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "10px"
        }}
      >
        <option value="balanced">Balanced</option>
        <option value="income">Income</option>
        <option value="growth">Growth</option>
      </select>

      <button
        onClick={handleAnalyze}
        disabled={loading || ocrLoading}
        style={{
          ...buttonStyle,
          background: "#2563eb",
          color: "#ffffff"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.opacity = "1";
        }}
      >
        {ocrLoading
          ? "Reading image..."
          : loading
          ? "Analyzing..."
          : "Analyze"}
      </button>

      {result && (
        <pre
          style={{
            marginTop: "20px",
            whiteSpace: "pre-wrap",
            background: "#f9fafb",
            padding: "16px",
            borderRadius: "10px",
            overflowX: "auto"
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}