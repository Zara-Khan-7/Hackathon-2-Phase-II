"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ChatContainer } from "@/components/chat/chat-container";
import { SignOutButton } from "@/components/auth/signout-button";

function ChatLoading() {
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
        <span>Loading chat...</span>
      </div>
    </div>
  );
}

function ChatPageContent() {
  const { data: session } = useSession();

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm animate-slide-down">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">AI Task Assistant</h1>
            <nav className="flex gap-2">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-200"
              >
                Chat
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <span className="text-sm text-gray-600 animate-fade-in">
                {session.user.name || session.user.email}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-4xl">
          <ChatContainer />
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatPageContent />
    </Suspense>
  );
}
