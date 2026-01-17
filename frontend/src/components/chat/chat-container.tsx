"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import {
  ChatMessage as ChatMessageType,
  sendChatMessage,
} from "@/lib/api/chat";
import { useSession } from "@/lib/auth-client";

export function ChatContainer() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const router = useRouter();
  const [messages, setMessages] = React.useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!session?.user?.id) {
      setError("Not authenticated. Please log in.");
      return;
    }

    // Add user message to UI immediately
    const userMessage: ChatMessageType = {
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(session.user.id, content, false);

      // Add assistant message to UI
      const assistantMessage: ChatMessageType = {
        role: "assistant",
        content: response.message,
        tool_calls: response.tools_invoked,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);

      // Handle auth errors
      if (errorMessage.includes("log in") || errorMessage.includes("Session expired")) {
        router.push("/login?error=session_expired");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center animate-fade-in-up">
            <div className="rounded-full bg-blue-100 p-4 animate-bounce-in">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Start a conversation
            </h3>
            <p className="mt-2 max-w-md text-sm text-gray-500 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              I can help you manage your tasks. Try saying something like:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li className="animate-slide-up" style={{ animationDelay: "0.3s" }}>&quot;Add a task to buy groceries tomorrow&quot;</li>
              <li className="animate-slide-up" style={{ animationDelay: "0.4s" }}>&quot;Show me my pending tasks&quot;</li>
              <li className="animate-slide-up" style={{ animationDelay: "0.5s" }}>&quot;Mark the grocery task as done&quot;</li>
            </ul>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start animate-slide-in-left">
                <div className="max-w-[80%] rounded-lg bg-gray-100 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot" style={{ animationDelay: "0ms" }} />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot" style={{ animationDelay: "0.2s" }} />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200 animate-slide-down shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t bg-white p-4">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Type a message to manage your tasks..."
        />
      </div>
    </div>
  );
}
