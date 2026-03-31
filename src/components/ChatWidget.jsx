import React, { useState } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "Bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const message = input.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { sender: "You", text: message }]);
    setInput("");

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
        { sender: "Bot", text: data.reply || data.error || "No response" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "Bot", text: "Chat is unavailable right now." },
      ]);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "320px",
            backgroundColor: "#ffffff",
            border: "1px solid #ddd",
            borderRadius: "16px",
            padding: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Roobens Finds Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              height: "220px",
              overflowY: "auto",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "8px",
              marginBottom: "8px",
              fontSize: "14px",
              backgroundColor: "#fafafa",
            }}
          >
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>

          <input
            type="text"
            value={input}
            placeholder="Type your question here..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              width: "100%",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: "#111827",
              color: "#ffffff",
            }}
          >
            Send
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#f97316",
          color: "#ffffff",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          zIndex: 10000,
        }}
      >
        💬
      </button>
    </>
  );
}
