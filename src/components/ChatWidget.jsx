import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { MessageCircle, Send, X } from "lucide-react";
import { ENABLE_PAID_AI_CHAT } from "@/config";

const plannerActions = [
  "What does my score mean?",
  "What files can I upload?",
  "What is included in Premium?",
];

const generalActions = ["What does Roobens Finds offer?", "How do I get started?"];

function localReply(message, path) {
  const question = message.toLowerCase();
  if (/score|health/.test(question)) {
    return "The health score is an educational 100-point check. Diversification, single-position concentration, liquidity, and alignment with your selected reference strategy each contribute 25 points. Open “How this score works” in your diagnosis for the breakdown.";
  }
  if (/file|upload|pdf|csv|screenshot|txt/.test(question)) {
    return "The free diagnosis accepts PNG, JPG/JPEG, WEBP, PDF, CSV, and TXT. You can use up to 5 files at 10 MB each. Scanned PDFs use limited in-browser OCR.";
  }
  if (/premium|upgrade|workspace/.test(question)) {
    return "Premium is being upgraded into a private living web app with saved portfolios, live scenarios, exact action plans, progress history, and unlimited updated PDFs. The public Premium page is a preview, not a promise of immediate access.";
  }
  if (/privacy|broker|password|safe/.test(question)) {
    return "You do not need to provide brokerage credentials. Core file processing and calculations run in the browser, and the free diagnosis does not depend on a paid AI API.";
  }
  if (/start|begin/.test(question)) {
    return path === "/portfolio-planner"
      ? "Choose screenshots or a portfolio file, review every detected holding, confirm the total, then set your plan and analyze."
      : "Start with the Free Portfolio Diagnosis from the Planner link, or browse the Tools and Finds sections.";
  }
  if (/offer|roobens/.test(question)) {
    return "Roobens Finds offers the Free Portfolio Diagnosis, a preview of the upcoming Premium Portfolio Workspace, practical finance tools, and curated everyday finds.";
  }
  return "I don’t have a reliable local answer for that yet. Please use the Contact page and Roobens Finds can help directly.";
}

export default function ChatWidget() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "Bot", text: "Hi — I can explain the planner, uploads, score, privacy, and Premium preview." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  const quickActions = location === "/portfolio-planner" ? plannerActions : generalActions;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function sendMessage(customMessage) {
    const message = String(customMessage ?? input).trim();
    if (!message || isSending) return;
    setMessages((current) => [...current, { sender: "You", text: message }]);
    setInput("");

    if (!ENABLE_PAID_AI_CHAT) {
      setMessages((current) => [...current, { sender: "Bot", text: localReply(message, location) }]);
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: messages.slice(-8), currentPage: location }),
      });
      const data = await response.json();
      setMessages((current) => [...current, { sender: "Bot", text: data.reply || "Chat is unavailable right now." }]);
    } catch {
      setMessages((current) => [...current, { sender: "Bot", text: "Chat is unavailable right now. Please use Contact." }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      {isOpen ? (
        <section className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-[9999] flex h-[min(34rem,calc(100vh-8rem))] w-[min(22.5rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2" aria-label="Roobens Finds assistant">
          <header className="flex items-center justify-between border-b bg-[#081423] px-5 py-4 text-white">
            <div>
              <h2 className="font-semibold">Roobens Finds Assistant</h2>
              <p className="mt-0.5 text-xs text-slate-300">Local answers for common questions</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#FECFA5]" aria-label="Close assistant">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex flex-wrap gap-2 border-b p-3">
            {quickActions.map((action) => (
              <button key={action} type="button" onClick={() => sendMessage(action)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 hover:border-[#F16953] focus-visible:ring-2 focus-visible:ring-[#F16953]">
                {action}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.sender}-${index}`} className={`mb-3 flex ${message.sender === "Bot" ? "justify-start" : "justify-end"}`}>
                <p className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.sender === "Bot" ? "bg-white text-slate-700 shadow-sm" : "bg-[#24364c] text-white"}`}>{message.text}</p>
              </div>
            ))}
            {isSending ? <p className="text-xs text-slate-500">Thinking…</p> : null}
            <div ref={endRef} />
          </div>

          <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex gap-2 border-t bg-white p-3">
            <label htmlFor="assistant-question" className="sr-only">Ask a question</label>
            <input id="assistant-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask a question…" className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-[#F16953]" />
            <button type="submit" disabled={isSending || !input.trim()} className="grid h-10 w-10 place-items-center rounded-xl bg-[#F16953] text-white focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50" aria-label="Send message">
              <Send className="h-4 w-4" />
            </button>
          </form>
          <Link href="/contact" className="border-t bg-white py-2 text-center text-xs font-semibold text-[#495E79] hover:text-[#F16953]">Contact Roobens Finds</Link>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-3 z-[10000] grid h-12 w-12 place-items-center rounded-full bg-[#24364c] text-white shadow-lg transition duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F16953] focus-visible:ring-offset-2 hover:opacity-100 ${isOpen ? "opacity-100" : "opacity-[.22] grayscale hover:grayscale-0"}`}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}
