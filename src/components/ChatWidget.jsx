import React, { useEffect, useRef, useState } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "Bot", text: "Hi — how can I help today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const sendMessage = async (customMessage) => {
    const message = (customMessage ?? input).trim();
    if (!message || isSending) return;

    setMessages((prev) => [...prev, { sender: "You", text: message }]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "Bot",
          text:
            data.reply ||
            `${data.error || "Request failed"}${
              data.details ? `: ${data.details}` : ""
            }`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "Bot", text: "Chat is unavailable right now." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          style={panelStyle}
        >
          <div style={headerStyle}>
            <div>
              <div style={titleStyle}>Roobens Finds Assistant</div>
              <div style={subtitleStyle}>Ask a question or take the next step</div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={iconBtnStyle}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div style={quickActionsWrap}>
            <button
              onClick={() => sendMessage("What do you offer?")}
              style={quickBtn}
            >
              What do you offer?
            </button>

            <button
              onClick={() => sendMessage("How do I get started?")}
              style={quickBtn}
            >
              Get started
            </button>

            <a
              href="/contact"
              style={{ ...quickBtn, textDecoration: "none", textAlign: "center" }}
            >
              Contact
            </a>
          </div>

          <div style={messagesAreaStyle}>
            {messages.map((msg, index) => {
              const isBot = msg.sender === "Bot";

              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: isBot ? "flex-start" : "flex-end",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      ...bubbleBaseStyle,
                      ...(isBot ? botBubbleStyle : userBubbleStyle),
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "10px" }}>
                <div style={{ ...bubbleBaseStyle, ...botBubbleStyle, padding: "12px 14px" }}>
                  <div style={typingWrap}>
                    <span style={{ ...dotStyle, animationDelay: "0ms" }} />
                    <span style={{ ...dotStyle, animationDelay: "180ms" }} />
                    <span style={{ ...dotStyle, animationDelay: "360ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div style={inputWrapStyle}>
            <input
              type="text"
              value={input}
              placeholder="Type your question..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              style={inputStyle}
            />

            <button
              onClick={() => sendMessage()}
              style={sendBtnStyle}
              disabled={isSending}
            >
              {isSending ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={launcherStyle}
        aria-label="Open chat"
      >
        <span style={{ transform: isOpen ? "scale(0.9)" : "scale(1)", transition: "0.2s ease" }}>
          💬
        </span>
      </button>

      <style>{`
        @keyframes chatFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes typingBounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          40% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

const panelStyle = {
  position: "fixed",
  bottom: "92px",
  right: "20px",
  width: "360px",
  maxWidth: "calc(100vw - 24px)",
  height: "560px",
  maxHeight: "calc(100vh - 120px)",
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: "28px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.16)",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  animation: "chatFadeUp 0.28s ease-out",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 18px 12px 18px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  background: "rgba(255,255,255,0.72)",
};

const titleStyle = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#111827",
  letterSpacing: "-0.02em",
};

const subtitleStyle = {
  fontSize: "12px",
  color: "#6b7280",
  marginTop: "2px",
};

const iconBtnStyle = {
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.85)",
  width: "32px",
  height: "32px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "18px",
  color: "#111827",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const quickActionsWrap = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  padding: "12px 16px 4px 16px",
};

const quickBtn = {
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.9)",
  borderRadius: "999px",
  padding: "8px 12px",
  fontSize: "12px",
  cursor: "pointer",
  color: "#111827",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const messagesAreaStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "14px 16px 10px 16px",
  background:
    "linear-gradient(to bottom, rgba(249,250,251,0.55), rgba(255,255,255,0.82))",
};

const bubbleBaseStyle = {
  maxWidth: "82%",
  padding: "11px 14px",
  borderRadius: "18px",
  fontSize: "14px",
  lineHeight: 1.45,
  wordBreak: "break-word",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
};

const botBubbleStyle = {
  background: "#f3f4f6",
  color: "#111827",
  borderTopLeftRadius: "8px",
};

const userBubbleStyle = {
  background: "#111827",
  color: "#ffffff",
  borderTopRightRadius: "8px",
};

const typingWrap = {
  display: "flex",
  gap: "5px",
  alignItems: "center",
};

const dotStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "999px",
  background: "#6b7280",
  display: "inline-block",
  animation: "typingBounce 1s infinite ease-in-out",
};

const inputWrapStyle = {
  padding: "14px 16px 16px 16px",
  borderTop: "1px solid rgba(0,0,0,0.06)",
  background: "rgba(255,255,255,0.82)",
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

const inputStyle = {
  flex: 1,
  padding: "13px 14px",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: "16px",
  outline: "none",
  fontSize: "14px",
  background: "#ffffff",
  color: "#111827",
  boxSizing: "border-box",
};

const sendBtnStyle = {
  border: "none",
  borderRadius: "16px",
  padding: "13px 16px",
  cursor: "pointer",
  background: "#111827",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  minWidth: "68px",
};

const launcherStyle = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  width: "62px",
  height: "62px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.25)",
  background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
  color: "#ffffff",
  fontSize: "24px",
  cursor: "pointer",
  boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
  zIndex: 10000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
