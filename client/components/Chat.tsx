"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Chat(){
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();
      const aiMessage: Message = { role: "ai", content: data.reply || data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  
  return(
 <div className="flex flex-col h-[600px] w-full max-w-2xl border border-brand-gray/30 bg-surface rounded-xl overflow-hidden shadow-2xl shadow-primary/10">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="text-center text-brand-gray mt-20">
            <p className="text-xl font-semibold text-white">Hi! I'm ApplyAI.</p>
            <p className="text-sm">Ask me how to improve your resume or prepare for an interview.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === "user"
                ? "bg-primary text-white self-end ml-auto shadow-md" 
                : "bg-surface border border-brand-gray/30 text-brand-gray self-start"
            }`}
          >
            {msg.role === "ai" ? (
              <div className="prose prose-invert prose-p:text-brand-gray prose-headings:text-white text-sm">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="self-start bg-surface border border-brand-gray/20 p-3 rounded-lg text-brand-gray text-sm animate-pulse">
            Thinking...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-brand-gray/20 flex gap-2">
        <input
          className="flex-1 bg-surface border border-brand-gray/30 rounded-md p-3 text-white placeholder-brand-gray focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-primary px-6 py-2 rounded-md text-white font-bold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}