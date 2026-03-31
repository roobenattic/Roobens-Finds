import { useState } from "react";

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  function addMessage(sender, text) {
    setMessages((prev) => [...prev, { sender, text }]);
  }

  async function sendMessage() {
    const message = input.trim();
    if (!message) return;

    addMessage("You", message);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      addMessage("Bot", data.reply || data.error || "No response");
    } catch (err) {
      addMessage("Bot", "Error connecting to chat");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "320px",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        zIndex: 9999,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: "8px" }}>
        Roobens Finds Assistant
      </div>

      <div
        style={{
          height: "220px",
          overflow: "auto",
          border: "1px solid #eee",
          borderRadius: "8px",
          padding: "8px",
          marginBottom: "8px",
          fontSize: "14px",
          background: "#fafafa",
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
        placeholder="Type your question here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
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
        }}
      >
        Send
      </button>
    </div>
  );
}
