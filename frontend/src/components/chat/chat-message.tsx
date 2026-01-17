"use client";

import { ChatMessage as ChatMessageType, ToolInvocation } from "@/lib/api/chat";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
  showToolCalls?: boolean;
}

function ToolCallBadge({ tool }: { tool: ToolInvocation }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium animate-scale-in",
        tool.success
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      )}
    >
      {tool.success ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {tool.tool_name.replace(/_/g, " ")}
    </span>
  );
}

export function ChatMessage({ message, showToolCalls = true }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end animate-slide-in-right" : "justify-start animate-slide-in-left"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 shadow-sm transition-smooth hover-lift",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

        {/* Tool calls display */}
        {showToolCalls && message.tool_calls && message.tool_calls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 border-t border-gray-200/50 pt-2">
            {message.tool_calls.map((tool, index) => (
              <ToolCallBadge key={index} tool={tool} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <p
            className={cn(
              "mt-1 text-xs animate-fade-in",
              isUser ? "text-blue-200" : "text-gray-400"
            )}
          >
            {message.timestamp.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
