"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCw, AlertTriangle } from "lucide-react";
import { cn, getRiskColor } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { sendChatMessage, getChatHistory, clearChatHistory } from "@/lib/api";
import type { ChatMessage } from "@/types";

const QUICK_QUESTIONS = [
  "Can the vendor increase price?",
  "When does this contract expire?",
  "What happens if we cancel?",
  "Who owns the data?",
  "Is there auto-renewal?",
  "What is the notice period?",
];

export function ContractChat({ contractId }: { contractId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadHistory();
  }, [contractId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const history = await getChatHistory(contractId);
      setMessages(history);
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(contractId, message);
      setMessages((prev) => [...prev, response]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClear = async () => {
    try {
      await clearChatHistory(contractId);
      setMessages([]);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">LexiScan AI</p>
            <p className="text-xs text-emerald-600">Ready to answer</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                <p className="text-sm text-slate-700">
                  Hi! I&apos;ve analyzed your contract. Ask me anything about it — risks,
                  clauses, obligations, or specific terms.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium px-1">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-3",
              msg.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                msg.role === "user"
                  ? "bg-slate-200"
                  : "bg-indigo-600"
              )}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-slate-600" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] space-y-1.5",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-slate-100 text-slate-700 rounded-tl-sm"
                )}
              >
                {msg.content}
              </div>
              {msg.role === "assistant" && msg.risk_level && msg.risk_level !== "neutral" && (
                <Badge className={cn("text-xs", getRiskColor(msg.risk_level))}>
                  Risk Level: {msg.risk_level}
                </Badge>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-xl p-2 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this contract…"
            rows={1}
            className="flex-1 resize-none text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent px-2 py-1.5 max-h-32"
            style={{ minHeight: "36px" }}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            size="sm"
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
