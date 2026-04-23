import { useMemo, useState } from "react";

export default function PlannerTest() {
  const [ocrText, setOcrText] = useState("");
  const [strategy, setStrategy] = useState("balanced");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const DISCLAIMER =
    "Educational portfolio simulation only — built to help you review allocation and sample adjustments based on your selected strategy.";

  const strategyMeta = {
    balanced: {
      label: "Balanced",
      description: "Steadier mix with a middle-ground allocation."
    },
    growth: {
      label: "Growth",
      description: "Higher growth focus with more volatility."
    },
    income: {
      label: "Income",
      description: "More income-oriented allocation mix."
    }
  };

  const selectedStrategyDescription = useMemo(
    () => strategyMeta[strategy]?.description || "",
    [strategy]
  );

  async function handleImageOCR(files) {
    if (!files || files.length === 0) return "";

    setOcrLoading(true);
    setErrorMessage("");

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
      setErrorMessage("Could not read the uploaded screenshots.");
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

    if (!textToAnalyze.trim()) {
      setResult({ error: "Upload screenshots or paste portfolio text first." });
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMessage("");

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
      setResult({ error: "Something went wrong while analyzing." });
    } finally {
      setLoading(false);
    }
  }

  async function downloadPDF() {
    const element = document.getElementById("result-section");
    if (!element) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDFModule = await import("jspdf");
      const JsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f5f5f7"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new JsPDF("p", "mm", "a4");
      const pdfWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save("portfolio-simulation.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
      setErrorMessage("PDF export failed. Please try again.");
    }
  }

  function clearImages() {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setImagePreviews([]);
    setOcrText("");
    setResult(null);
    setErrorMessage("");
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f5f7",
      padding: "56px 20px"
    },
    shell: {
      maxWidth: "860px",
      margin: "0 auto"
    },
    title: {
      margin: "0 0 10px",
      fontSize: "44px",
      lineHeight: 1.05,
      letterSpacing: "-0.03em",
      color: "#111111",
      fontWeight: 700
    },
    subtitle: {
      margin: "0 0 28px",
      color: "#6e6e73",
      fontSize: "17px",
      lineHeight: 1.5
    },
    glassCard: {
      background: "rgba(255,255,255,0.82)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: "28px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
      padding: "26px"
    },
    noticeCard: {
      background: "linear-gradient(180deg, #fffaf2 0%, #f7f1e7 100%)",
      border: "1px solid #eadfcf",
      borderRadius: "22px",
      padding: "18px 18px 16px",
      marginBottom: "22px"
    },
    noticeEyebrow: {
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "#8a6a3e",
      marginBottom: "8px"
    },
    noticeText: {
      margin: 0,
      fontSize: "16px",
      lineHeight: 1.55,
      color: "#2f2f32"
    },
    section: {
      background: "#ffffff",
      border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: "24px",
      padding: "18px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
      marginTop: "18px"
    },
    sectionTitle: {
      margin: "0 0 10px",
      fontSize: "20px",
      fontWeight: 600,
      color: "#111111",
      letterSpacing: "-0.02em"
    },
    smallMuted: {
      fontSize: "14px",
      color: "#6e6e73",
      lineHeight: 1.5,
      margin: 0
    },
    uploadWrap: {
      display: "flex",
      flexDirection: "column",
      gap: "14px"
    },
    uploadRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      alignItems: "center"
    },
    hiddenInput: {
      display: "none"
    },
    uploadButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "52px",
      padding: "0 20px",
      borderRadius: "16px",
      background: "#111111",
      color: "#ffffff",
      fontWeight: 600,
      fontSize: "15px",
      cursor: "pointer",
      border: "none",
      transition: "all 0.2s ease",
      boxShadow: "0 10px 24px rgba(0,0,0,0.14)"
    },
    secondaryButton: {
      minHeight: "52px",
      padding: "0 18px",
      borderRadius: "16px",
      background: "#f0f0f2",
      color: "#111111",
      fontWeight: 600,
      fontSize: "15px",
      cursor: "pointer",
      border: "1px solid rgba(0,0,0,0.06)",
      transition: "all 0.2s ease"
    },
    filePill: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      minHeight: "42px",
      padding: "0 14px",
      borderRadius: "999px",
      background: "#eef5ff",
      color: "#1859d1",
      border: "1px solid #d8e7ff",
      fontSize: "14px",
      fontWeight: 600
    },
    strategyRow: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "18px"
    },
    strategyButton: {
      minHeight: "54px",
      padding: "0 18px",
      borderRadius: "18px",
      border: "1px solid rgba(0,0,0,0.08)",
      background: "#f6f6f7",
      color: "#111111",
      fontWeight: 600,
      fontSize: "16px",
      cursor: "pointer",
      transition: "all 0.2s ease"
    },
    strategyButtonActive: {
      background: "#111111",
      color: "#ffffff",
      boxShadow: "0 12px 24px rgba(0,0,0,0.16)",
      transform: "translateY(-1px)"
    },
    primaryButton: {
      minHeight: "56px",
      padding: "0 22px",
      borderRadius: "18px",
      border: "none",
      background: "#111111",
      color: "#ffffff",
      fontWeight: 700,
      fontSize: "16px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
      marginTop: "18px"
    },
    textarea: {
      width: "100%",
      minHeight: "150px",
      marginTop: "14px",
      padding: "16px",
      borderRadius: "18px",
      border: "1px solid rgba(0,0,0,0.08)",
      background: "#fbfbfc",
      outline: "none",
      resize: "vertical",
      fontSize: "15px",
      color: "#111111",
      boxSizing: "border-box"
    },
    previewGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "12px",
      marginTop: "8px"
    },
    previewCard: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "18px",
      border: "1px solid rgba(0,0,0,0.08)",
      background: "#ffffff",
      minHeight: "150px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
    },
    previewImage: {
      width: "100%",
      height: "150px",
      objectFit: "cover",
      display: "block"
    },
    previewLabel: {
      position: "absolute",
      left: "10px",
      bottom: "10px",
      padding: "6px 10px",
      borderRadius: "999px",
      background: "rgba(17,17,17,0.78)",
      color: "#fff",
      fontSize: "12px",
      fontWeight: 600,
      maxWidth: "calc(100% - 20px)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    },
    statusText: {
      fontSize: "14px",
      color: "#6e6e73",
      marginTop: "10px"
    },
    errorCard: {
      marginTop: "16px",
      background: "#fff2f2",
      color: "#b42318",
      border: "1px solid #ffd2d2",
      borderRadius: "18px",
      padding: "14px 16px",
      fontSize: "14px",
      fontWeight: 600
    },
    listLine: {
      margin: "8px 0",
      fontSize: "16px",
      color: "#1d1d1f",
      lineHeight: 1.55
    },
    resultHint: {
      fontSize: "13px",
      color: "#6e6e73",
      marginTop: "10px"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.glassCard}>
          <h1 style={styles.title}>Portfolio Planner</h1>
          <p style={styles.subtitle}>
            Upload portfolio screenshots, choose a strategy, and review a cleaner simulation report.
          </p>

          <div style={styles.noticeCard}>
            <div style={styles.noticeEyebrow}>Good to know</div>
            <p style={styles.noticeText}>{DISCLAIMER}</p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Upload portfolio screenshots</h3>
            <div style={styles.uploadWrap}>
              <div style={styles.uploadRow}>
                <label
                  htmlFor="portfolio-upload"
                  style={styles.uploadButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px) scale(1.01)";
                    e.currentTarget.style.boxShadow = "0 16px 32px rgba(0,0,0,0.18)";
                    e.currentTarget.style.background = "#1c1c1e";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.14)";
                    e.currentTarget.style.background = "#111111";
                  }}
                >
                  {selectedFiles.length > 0 ? "Add More Screenshots" : "Choose Screenshots"}
                </label>

                <button
                  type="button"
                  onClick={clearImages}
                  style={styles.secondaryButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e7e7ea";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f0f0f2";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Clear
                </button>

                {selectedFiles.length > 0 && (
                  <div style={styles.filePill}>
                    {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>

              <input
                id="portfolio-upload"
                type="file"
                accept="image/*"
                multiple
                style={styles.hiddenInput}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;

                  imagePreviews.forEach((url) => URL.revokeObjectURL(url));

                  setSelectedFiles(files);
                  setImagePreviews(files.map((file) => URL.createObjectURL(file)));
                  setResult(null);
                  setErrorMessage("");
                }}
              />

              <p style={styles.smallMuted}>
                Drag in portfolio screenshots through your system picker, then analyze when you're ready.
              </p>

              {imagePreviews.length > 0 && (
                <div style={styles.previewGrid}>
                  {imagePreviews.map((src, index) => (
                    <div key={src} style={styles.previewCard}>
                      <img
                        src={src}
                        alt={`preview-${index}`}
                        style={styles.previewImage}
                      />
                      <div style={styles.previewLabel}>
                        {selectedFiles[index]?.name || `Screenshot ${index + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div style={styles.statusText}>
                  {ocrLoading
                    ? "Reading uploaded screenshots..."
                    : "Screenshots loaded and ready for analysis."}
                </div>
              )}

              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                rows={8}
                style={styles.textarea}
                placeholder="OCR text from your uploaded screenshots will appear here, or you can paste portfolio text manually..."
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(0,0,0,0.14)";
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(0,0,0,0.04)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(0,0,0,0.08)";
                  e.currentTarget.style.background = "#fbfbfc";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Choose a strategy</h3>
            <p style={styles.smallMuted}>{selectedStrategyDescription}</p>

            <div style={styles.strategyRow}>
              {["balanced", "growth", "income"].map((type) => {
                const active = strategy === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setStrategy(type)}
                    style={{
                      ...styles.strategyButton,
                      ...(active ? styles.strategyButtonActive : {})
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "#ececef";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "#f6f6f7";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {strategyMeta[type].label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || ocrLoading}
              style={{
                ...styles.primaryButton,
                opacity: loading || ocrLoading ? 0.72 : 1,
                cursor: loading || ocrLoading ? "not-allowed" : "pointer"
              }}
              onMouseEnter={(e) => {
                if (!(loading || ocrLoading)) {
                  e.currentTarget.style.transform = "translateY(-1px) scale(1.01)";
                  e.currentTarget.style.boxShadow = "0 18px 36px rgba(0,0,0,0.2)";
                  e.currentTarget.style.background = "#1c1c1e";
                }
              }}
              onMouseLeave={(e) => {
                if (!(loading || ocrLoading)) {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.16)";
                  e.currentTarget.style.background = "#111111";
                }
              }}
            >
              {ocrLoading
                ? "Reading Screenshots..."
                : loading
                ? "Analyzing Portfolio..."
                : "Analyze Portfolio"}
            </button>
          </div>

          {(errorMessage || result?.error) && (
            <div style={styles.errorCard}>{errorMessage || result?.error}</div>
          )}

          {result && !result.error && (
            <div id="result-section">
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Portfolio Overview</h3>
                {(result.holdings || []).map((h, i) => (
                  <p key={i} style={styles.listLine}>
                    {h.ticker} — {h.percent}% (${h.estimatedValue})
                  </p>
                ))}
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Current Allocation</h3>
                {Object.entries(result.allocation || {}).map(([k, v]) => (
                  <p key={k} style={styles.listLine}>
                    {k}: {v}%
                  </p>
                ))}
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Rebalance Simulation</h3>
                {(result.signals || []).map((line, i) => (
                  <p key={i} style={styles.listLine}>
                    {line}
                  </p>
                ))}
                <p style={styles.resultHint}>
                  This section shows a sample adjustment path based on your selected strategy.
                </p>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Estimated Adjustments</h3>

                {result.uiPlan?.sellLines?.map((line, i) => (
                  <p key={`sell-${i}`} style={styles.listLine}>
                    {line}
                  </p>
                ))}

                {result.uiPlan?.buyLines?.map((line, i) => (
                  <p key={`buy-${i}`} style={styles.listLine}>
                    {line}
                  </p>
                ))}
              </div>

              <button
                type="button"
                onClick={downloadPDF}
                style={styles.primaryButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px) scale(1.01)";
                  e.currentTarget.style.boxShadow = "0 18px 36px rgba(0,0,0,0.2)";
                  e.currentTarget.style.background = "#1c1c1e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.16)";
                  e.currentTarget.style.background = "#111111";
                }}
              >
                Download Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}