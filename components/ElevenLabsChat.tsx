"use client";

import { useConversation } from "@elevenlabs/react";
import { ChatMessage } from "@/lib/types";

interface ElevenLabsChatProps {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setConversationState: React.Dispatch<
    React.SetStateAction<"idle" | "listening" | "processing" | "speaking">
  >;
}

interface ElevenLabsMessage {
  source: "ai" | "user";
  message: string;
}

export function ElevenLabsChat({
  setMessages,
  setConversationState,
}: ElevenLabsChatProps) {
  const conversation = useConversation({
    agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "",
    onConnect: () => {
      console.log("Connected to ElevenLabs");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
    },
    onMessage: (message: ElevenLabsMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: message.source === "ai" ? "assistant" : "user",
          content: message.message,
          timestamp: Date.now(),
        },
      ]);
    },
    onModeChange: ({ mode }: { mode: string }) => {
      setConversationState(
        mode === "listening"
          ? "listening"
          : mode === "thinking"
          ? "processing"
          : mode === "speaking"
          ? "speaking"
          : "idle"
      );
    },
  });

  if (!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚙️</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Voice Chat Setup Required
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Configure your ElevenLabs Agent ID to enable voice features
          </p>
          <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            Check ELEVENLABS_SETUP.md for setup instructions
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🎙️</span>
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">
          Voice Chat Active
        </h3>

        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className={`h-2 w-2 rounded-full ${
              conversation.status === "connected"
                ? "bg-emerald-400"
                : conversation.status === "connecting"
                ? "bg-amber-400 animate-pulse"
                : "bg-red-400"
            }`}
          />
          <span className="text-sm text-slate-400 capitalize">
            {conversation.status}
          </span>
        </div>

        {conversation.status === "connected" ? (
          <p className="text-slate-300">
            Start speaking to begin your conversation
          </p>
        ) : conversation.status === "connecting" ? (
          <p className="text-slate-300">Connecting to voice service...</p>
        ) : (
          <div>
            <p className="text-slate-300 mb-4">
              Connection failed. Please try again.
            </p>
            <button
              onClick={() => conversation.startSession()}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
