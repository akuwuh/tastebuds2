"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion } from "framer-motion";
import { ChatMessage } from "@/lib/types";

interface UnifiedVoiceChatProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setConversationState: React.Dispatch<
    React.SetStateAction<"idle" | "listening" | "processing" | "speaking">
  >;
  conversationState: "idle" | "listening" | "processing" | "speaking";
  onSearchResults?: (results: any[]) => void;
}

interface ElevenLabsMessage {
  source: "ai" | "user";
  message: string;
}

export function UnifiedVoiceChat({
  messages,
  setMessages,
  setConversationState,
  conversationState,
  onSearchResults,
}: UnifiedVoiceChatProps) {
  const [transcript, setTranscript] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      // Update transcript for user messages
      if (message.source === "user") {
        setTranscript(message.message);
      }
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

  // Mock search function for demonstration
  useEffect(() => {
    if (
      conversationState === "processing" &&
      transcript.toLowerCase().includes("restaurant")
    ) {
      // Simulate search delay
      setTimeout(() => {
        const mockResults = [
          {
            id: "1",
            name: "Bella Vista Italian",
            rating: 4.5,
            cuisine: "Italian",
            distance: "0.3 miles",
            image:
              "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop",
          },
          {
            id: "2",
            name: "Sakura Sushi",
            rating: 4.7,
            cuisine: "Japanese",
            distance: "0.5 miles",
            image:
              "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&h=200&fit=crop",
          },
          {
            id: "3",
            name: "Taco Libre",
            rating: 4.3,
            cuisine: "Mexican",
            distance: "0.7 miles",
            image:
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
          },
        ];
        setSearchResults(mockResults);
        onSearchResults?.(mockResults);
      }, 2000);
    }
  }, [conversationState, transcript, onSearchResults]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
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
    <div className="h-full flex flex-col">
      {/* Voice Status */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4 relative">
          {conversationState !== "idle" && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-orange-400/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <span className="text-3xl">🎙️</span>
        </div>

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
          <span className="text-sm text-slate-400">
            {conversation.status === "connected"
              ? "Connected"
              : conversation.status}
          </span>
        </div>

        {/* Connect Button */}
        {conversation.status === "disconnected" && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => conversation.startSession()}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z"
                />
              </svg>
              Connect to Voice Chat
            </button>
          </div>
        )}

        {conversation.status === "connected" && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => conversation.endSession()}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="flex-1 mb-6">
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 max-h-64 overflow-y-auto">
            <div className="p-4 space-y-3">
              {messages.slice(-10).map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-orange-600 text-white"
                        : "bg-slate-700 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs opacity-70 font-medium">
                        {message.role === "user" ? "You" : "TasteBuds"}
                      </span>
                      <span className="text-xs opacity-50">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div>{message.content}</div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Search State */}
      {conversationState === "processing" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-amber-200 text-sm">
              Searching for restaurants...
            </div>
          </div>
        </motion.div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && conversationState !== "processing" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="text-lg font-medium text-white mb-4">
            Found these restaurants:
          </div>
          {searchResults.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-white">{restaurant.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                    <span>⭐ {restaurant.rating}</span>
                    <span>{restaurant.cuisine}</span>
                    <span>📍 {restaurant.distance}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Ready State */}
      {conversationState === "idle" &&
        !transcript &&
        searchResults.length === 0 && (
          <div className="text-center text-slate-400">
            <p className="mb-4">
              Start speaking to search for restaurants, recipes, or place orders
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span>🍕</span>
                <span>"Find pizza places nearby"</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>🍝</span>
                <span>"Show me Italian restaurants"</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>🌮</span>
                <span>"I want tacos for delivery"</span>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
