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
    onModeChange: (mode: string) => {
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
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-orange-200 mb-2">
            ElevenLabs Not Configured
          </h3>
          <p className="text-orange-300/70 text-sm mb-4">
            Please set up your ElevenLabs Agent ID in the environment variables
            to enable AI voice features.
          </p>
          <div className="text-xs text-orange-400/60 bg-orange-500/10 rounded-lg p-3">
            Check ELEVENLABS_SETUP.md for detailed instructions
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 text-center">
        <div className="text-4xl mb-2 bounce-gentle">🤖</div>
        <p className="text-orange-200">ElevenLabs AI Voice Active</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              conversation.status === "connected"
                ? "bg-green-400"
                : conversation.status === "connecting"
                ? "bg-yellow-400 animate-pulse"
                : "bg-red-400"
            }`}
          />
          <span className="text-xs text-orange-300/70 capitalize">
            {conversation.status}
          </span>
        </div>
      </div>

      <div className="flex-1 rounded-xl bg-black/20 p-4 flex flex-col items-center justify-center">
        {conversation.status === "connected" ? (
          <div className="text-center">
            <div className="text-2xl mb-3 bounce-gentle">🎙️</div>
            <p className="text-orange-200 font-medium">Ready to chat!</p>
            <p className="text-orange-300/70 text-sm mt-1">
              Start speaking to begin your food adventure
            </p>
          </div>
        ) : conversation.status === "connecting" ? (
          <div className="text-center">
            <div className="text-2xl mb-3 animate-pulse">🔄</div>
            <p className="text-orange-200 font-medium">Connecting...</p>
            <p className="text-orange-300/70 text-sm mt-1">
              Setting up your AI food companion
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-2xl mb-3">❌</div>
            <p className="text-red-300 font-medium">Connection Failed</p>
            <p className="text-orange-300/70 text-sm mt-1">
              Please check your internet connection and try again
            </p>
            <button
              onClick={() => conversation.startSession()}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-orange-600 transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
