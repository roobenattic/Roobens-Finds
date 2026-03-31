<div style="position:fixed;bottom:20px;right:20px;width:320px;background:#fff;border:1px solid #ddd;border-radius:12px;padding:12px;box-shadow:0 4px 12px rgba(0,0,0,0.12);z-index:9999;">
  <div style="font-weight:700;margin-bottom:8px;">Roobens Finds Assistant</div>
  <div id="chatBox" style="height:220px;overflow:auto;border:1px solid #eee;border-radius:8px;padding:8px;margin-bottom:8px;font-size:14px;background:#fafafa;"></div>
  <input id="chatInput" type="text" placeholder="Type your question here..." style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ccc;border-radius:8px;" />
  <button id="chatSend" style="width:100%;padding:10px;border:none;border-radius:8px;cursor:pointer;">
    Send
  </button>
</div>

<script>
  const chatBox = document.getElementById("chatBox");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");

  function addMessage(sender, text) {
    const msg = document.createElement("div");
    msg.style.marginBottom = "8px";
    msg.innerHTML = "<strong>" + sender + ":</strong> " + text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage("You", message);
    chatInput.value = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      addMessage("Bot", data.reply || data.error || "No response");
    } catch (err) {
      addMessage("Bot", "Error connecting to chat");
    }
  }

  chatSend.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") sendMessage();
  });
</script>
