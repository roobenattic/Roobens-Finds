import { useState } from "react";

export default function PlannerTest() {
  const [ocrText, setOcrText] = useState("");
  const [strategy, setStrategy] = useState("balanced");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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

  function clearImages() {
    setSelectedFiles([]);
    setImagePreviews([]);
    setOcrText("");
    setResult(null);
  }

  return (
    <div
      style={{
        maxWidth: "760px",
        margin: "100px auto 40px",
        padding: "24px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        boxSizing: "border-box"
      }}
    >
      <h1 style={{ marginBottom: "16px", fontSize: "28px" }}>Planner Test</h1>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
        <label
          htmlFor="portfolio-upload"
          style={{
            ...buttonStyle,
            display: "inline-block",
            background: "#111827",
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
          Upload Portfolio Screenshots
        </label>

        <button
          onClick={clearImages}
          style={{
            ...buttonStyle,
            background: "#e5e7eb",
            color: "#111827"
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
          Clear
        </button>
      </div>

      <input
        id="portfolio-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            setSelectedFiles(files);
            setImagePreviews(files.map((file) => URL.createObjectURL(file)));
            setResult(null);
          }
        }}
        style={{ display: "none" }}
      />

      {imagePreviews.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "16px"
          }}
        >
          {imagePreviews.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`preview-${index}`}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "contain",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                background: "#fff"
              }}
            />
          ))}
        </div>
      )}

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
        placeholder="OCR text from all uploaded screenshots will appear here..."
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["balanced", "growth", "income"].map((type) => {
          const active = strategy === type;

          return (
            <button
              key={type}
              onClick={() => setStrategy(type)}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: active ? "2px solid #2563eb" : "1px solid #d1d5db",
                background: active ? "#2563eb" : "#ffffff",
                color: active ? "#ffffff" : "#111827",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (!active) e.target.style.background = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                if (!active) e.target.style.background = "#ffffff";
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          );
        })}
      </div>

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
          ? "Reading images..."
          : loading
          ? "Analyzing..."
          : "Analyze"}
      </button>

      {result?.error && (
        <div style={cardStyle}>
          <strong>Error:</strong> {result.error}
        </div>
      )}

      {result && !result.error && (
        <>
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Portfolio</h3>
            {(result.holdings || []).map((h, i) => (
              <p key={i} style={{ margin: "6px 0" }}>
                {h.ticker} — {h.percent}% (${h.estimatedValue})
              </p>
            ))}
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Allocation</h3>
            {Object.entries(result.allocation || {}).map(([key, val], i) => (
              <p key={i} style={{ margin: "6px 0" }}>
                {key}: {val}%
              </p>
            ))}
          </div>

          {result.signals?.length > 0 && (
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>Signals</h3>
              {result.signals.map((line, i) => (
                <p key={i} style={{ margin: "6px 0" }}>
                  {line}
                </p>
              ))}
            </div>
          )}

          {result.uiPlan?.sellLines?.length > 0 && (
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>{result.uiPlan.sellTitle}</h3>
              {result.uiPlan.sellLines.map((line, i) => (
                <p key={i} style={{ margin: "6px 0" }}>
                  {line}
                </p>
              ))}
            </div>
          )}

          {result.uiPlan?.buyLines?.length > 0 && (
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>{result.uiPlan.buyTitle}</h3>
              {result.uiPlan.buyLines.map((line, i) => (
                <p key={i} style={{ margin: "6px 0" }}>
                  {line}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}