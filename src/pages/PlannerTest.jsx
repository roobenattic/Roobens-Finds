import { useState } from "react";

export default function PlannerTest() {
  const [ocrText, setOcrText] = useState("");
  const [strategy, setStrategy] = useState("balanced");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const DISCLAIMER =
    "This tool is for informational and educational purposes only. It does not provide financial or investment advice. All outputs are based on your selected inputs and assumptions.";

  const buttonStyle = {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease"
  };

  const cardStyle = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
    marginTop: "16px"
  };

  async function handleImageOCR(files) {
    if (!files || files.length === 0) return "";

    setOcrLoading(true);

    try {
      const Tesseract = (await import("tesseract.js")).default;
      let combinedText = "";

      for (const file of files) {
        const {
          data: { text }
        } = await Tesseract.recognize(file, "eng");

        combinedText += `\n${text || ""}`;
      }

      const cleanedText = combinedText.trim();
      setOcrText(cleanedText);
      return cleanedText;
    } catch (err) {
      console.error(err);
      return "";
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleAnalyze() {
    let textToAnalyze = ocrText;

    if (selectedFiles.length > 0 && !ocrText.trim()) {
      textToAnalyze = await handleImageOCR(selectedFiles);
    }

    if (!textToAnalyze.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: textToAnalyze,
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

  async function downloadPDF() {
    const element = document.getElementById("result-section");
    if (!element) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("portfolio-simulation.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
    }
  }

  function clearImages() {
    setSelectedFiles([]);
    setImagePreviews([]);
    setOcrText("");
    setResult(null);
  }

  return (
    <div style={{ maxWidth: "760px", margin: "100px auto", padding: "24px" }}>
      <h1 style={{ fontSize: "28px" }}>Portfolio Planner</h1>

      <div style={{ ...cardStyle, background: "#fff7ed" }}>
        <strong>Important:</strong> {DISCLAIMER}
      </div>

      {/* Upload */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          setSelectedFiles(files);
          setImagePreviews(files.map((f) => URL.createObjectURL(f)));
          setResult(null);
        }}
      />

      {/* Strategy */}
      <div style={{ marginTop: "16px" }}>
        {["balanced", "growth", "income"].map((type) => (
          <button
            key={type}
            onClick={() => setStrategy(type)}
            style={{
              ...buttonStyle,
              background: strategy === type ? "#111" : "#eee",
              color: strategy === type ? "#fff" : "#000",
              marginRight: "8px"
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Analyze */}
      <button onClick={handleAnalyze} style={{ ...buttonStyle, marginTop: "16px", background: "#111", color: "#fff" }}>
        {loading ? "Analyzing..." : "Analyze Portfolio"}
      </button>

      {/* RESULT */}
      {result && !result.error && (
        <div id="result-section">
          <div style={cardStyle}>
            <h3>Portfolio Overview</h3>
            {(result.holdings || []).map((h, i) => (
              <p key={i}>
                {h.ticker} — {h.percent}% (${h.estimatedValue})
              </p>
            ))}
          </div>

          <div style={cardStyle}>
            <h3>Current Allocation</h3>
            {Object.entries(result.allocation || {}).map(([k, v]) => (
              <p key={k}>
                {k}: {v}%
              </p>
            ))}
          </div>

          {/* NEW SAFE SECTION */}
          <div style={cardStyle}>
            <h3>Rebalance Simulation</h3>
            {(result.signals || []).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <p style={{ fontSize: "12px", color: "#6b7280" }}>
              This is a sample adjustment based on your selected strategy.
            </p>
          </div>

          <div style={cardStyle}>
            <h3>Estimated Adjustments</h3>

            {result.uiPlan?.sellLines?.map((line, i) => (
              <p key={i}>{line}</p>
            ))}

            {result.uiPlan?.buyLines?.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <button onClick={downloadPDF} style={{ ...buttonStyle, marginTop: "16px", background: "#111", color: "#fff" }}>
            Download Report
          </button>
        </div>
      )}
    </div>
  );
}