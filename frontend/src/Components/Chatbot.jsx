import React, { useState, useRef, useEffect } from "react";

const SESSION_ID = "user_" + Math.random().toString(36).slice(2, 9);

const QUICK_STARTS = [
  "What is depression?",
  "How to cope with anxiety?",
  "What does PHQ-9 score mean?",
  "Signs of severe depression",
  "How to help someone with depression?",
  "What are antidepressants?",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! 👋 I'm **MindBot**, your mental health AI assistant powered by Google Gemini.\n\nI can answer **any question** related to depression, anxiety, and mental wellbeing. What would you like to know?",
      quickReplies: QUICK_STARTS,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText) return;
    setInput("");
    setError("");

    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setIsTyping(true);

    try {
      const res = await fetch("http://127.0.0.1:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, session_id: SESSION_ID }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.reply, quickReplies: [] },
      ]);
    } catch (err) {
      const errorMessage = err.message || "";
      const displayMessage = errorMessage.includes("API key") || errorMessage.includes("403") 
        ? `⚠️ **API Key Error:** ${errorMessage}` 
        : "⚠️ I'm having trouble connecting right now. Please make sure the backend server is running.";
        
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: displayMessage,
          quickReplies: [],
        },
      ]);
      setError(err.message);
    } finally {
      setIsTyping(false);
    }
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
        aria-label="Open MindBot"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {hasUnread && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-3xl shadow-2xl overflow-hidden"
          style={{ height: "540px", background: "#fff" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🤖</div>
            <div className="flex-1">
              <p className="font-bold text-sm">MindBot</p>
              <p className="text-xs text-white/80">AI Mental Health Assistant · Gemini</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/80">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${msg.from === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "text-white rounded-br-sm"
                      : "text-gray-800 bg-white shadow-sm rounded-bl-sm border border-gray-100"
                  }`}
                  style={
                    msg.from === "user"
                      ? { background: "linear-gradient(135deg, #6366f1, #a855f7)" }
                      : {}
                  }
                  dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                />
                {/* Quick replies only for last bot message */}
                {msg.from === "bot" && msg.quickReplies?.length > 0 && i === messages.length - 1 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {msg.quickReplies.map((qr, qi) => (
                      <button
                        key={qi}
                        onClick={() => sendMessage(qr)}
                        disabled={isTyping}
                        className="text-xs px-3 py-1.5 rounded-full border border-indigo-300 text-indigo-600 bg-white hover:bg-indigo-50 transition-colors disabled:opacity-50"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isTyping && sendMessage()}
              placeholder="Ask anything about depression..."
              disabled={isTyping}
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 disabled:opacity-60"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Disclaimer */}
          <div className="px-4 pb-2 bg-white">
            <p className="text-center text-xs text-gray-400">
              🤖 Powered by Google Gemini · Not a substitute for professional advice
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
