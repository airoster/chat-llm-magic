import React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  role: "assistant" | "user";
  model?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, role, model }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className={cn(
        "py-8 px-4 sm:px-6 flex animate-fade-in",
        role === "assistant" ? "bg-chat-background" : "bg-white"
      )}
    >
      <div className="max-w-4xl mx-auto w-full flex gap-4 sm:gap-6">
        <div className="w-8 h-8 rounded-full bg-chat-accent flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-medium">
            {role === "assistant" ? model?.[0]?.toUpperCase() || "A" : "U"}
          </span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="prose max-w-none">
            <p className="text-chat-text">{content}</p>
          </div>
          <button
            onClick={() => copyToClipboard(content)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};