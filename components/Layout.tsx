"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ActionPanel } from "@/components/action-panel/ActionPanel";
import { ChatVisualizer } from "@/components/ChatVisualizer";
import { ConversationLog } from "@/components/ConversationLog";
import { ChatHistorySidebar } from "@/components/ChatHistorySidebar";
import { ElevenLabsChat } from "@/components/ElevenLabsChat";
import { MicrophoneButton } from "@/components/MicrophoneButton";
import { playAudioFromText } from "@/lib/audio";
import { useLocationPermission } from "@/lib/location";
import {
  type ActiveFeature,
  type ChatMessage,
  ConversationMode,
  FeatureIntent,
} from "@/lib/types";
import { fetchChatResponse } from "@/lib/chat";

type ConversationState = "idle" | "listening" | "processing" | "speaking";

export default function Layout() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Hey there, I'm Hungry Buddy! 🍽️ Tell me what you're craving and we'll figure out something delicious together!",
      timestamp: Date.now(),
    },
  ]);
  const [conversationState, setConversationState] =
    useState<ConversationState>("idle");
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>(null);
  const [activeIntent, setActiveIntent] = useState<FeatureIntent | null>(null);
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [useElevenLabs, setUseElevenLabs] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const {
    permission: locationPermission,
    coordinates,
    requestPermission: requestLocation,
  } = useLocationPermission();

  const startSpeechRecognition = useCallback(() => {
    if (conversationState === "speaking") {
      return;
    }

    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionCtor) {
      console.warn("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setConversationState("listening");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (!transcript) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: transcript,
          timestamp: Date.now(),
        },
      ]);
      setPendingQuery(transcript);
      setConversationState("processing");
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      setConversationState("idle");
    };

    recognition.onend = () => {
      recognition.stop();
      recognitionRef.current = null;

      if (conversationState === "listening") {
        setConversationState("idle");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [conversationState]);

  const stopSpeechRecognition = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setConversationState("idle");
  }, []);

  const handleVoiceButtonClick = useCallback(() => {
    if (conversationState === "listening") {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  }, [conversationState, startSpeechRecognition, stopSpeechRecognition]);

  useEffect(() => {
    if (!pendingQuery) return;

    let cancel = false;

    const processQuery = async () => {
      try {
        const { reply, intent, featurePayload } = await fetchChatResponse(
          pendingQuery,
          activeIntent
        );

        if (cancel) return;

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: reply,
            timestamp: Date.now(),
          },
        ]);

        if (intent) {
          setActiveIntent(intent.intent);
          setActiveFeature(intent.feature);
          setPanelOpen(true);
        }

        if (featurePayload) {
          setFeaturePayload(featurePayload);
        }

        setConversationState("speaking");
        await playAudioFromText(reply);
      } catch (error) {
        console.error(error);
        if (cancel) return;
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "I ran into an issue thinking that through. Mind asking me again?",
            timestamp: Date.now(),
            error: true,
          },
        ]);
      } finally {
        if (!cancel) {
          setConversationState("idle");
          setPendingQuery(null);
        }
      }
    };

    void processQuery();

    return () => {
      cancel = true;
    };
  }, [pendingQuery, activeIntent]);

  const [featurePayload, setFeaturePayload] = useState<
    Record<string, unknown> | undefined
  >(undefined);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setActiveFeature(null);
  }, []);

  const currentMode = useMemo<ConversationMode>(() => {
    switch (conversationState) {
      case "listening":
        return ConversationMode.Listening;
      case "processing":
        return ConversationMode.Processing;
      case "speaking":
        return ConversationMode.Speaking;
      default:
        return ConversationMode.Idle;
    }
  }, [conversationState]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-warm-bg via-red-950/20 to-orange-950/20">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-orange-500/20 to-yellow-500/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        messages={messages}
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Navigation */}
        <header className="flex items-center justify-between border-b border-orange-500/20 bg-gradient-to-r from-red-950/30 to-orange-950/20 backdrop-blur-xl p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="rounded-xl bg-orange-500/10 p-2 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200 transition-colors lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-food-gradient bounce-gentle">
                🍽️ Hungry Buddy
              </h1>
              <p className="text-sm text-orange-300/70">
                Your AI foodie companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ElevenLabs Toggle */}
            <button
              onClick={() => setUseElevenLabs(!useElevenLabs)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                useElevenLabs
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white pulse-warm"
                  : "bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
              }`}
            >
              🎙️ {useElevenLabs ? "AI Voice ON" : "AI Voice OFF"}
            </button>

            {/* Location Status */}
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`h-2 w-2 rounded-full ${
                  locationPermission === "granted"
                    ? "bg-green-400"
                    : locationPermission === "loading"
                    ? "bg-yellow-400 animate-pulse"
                    : "bg-red-400"
                }`}
              />
              <span className="text-orange-300/70">
                {locationPermission === "granted"
                  ? "📍 Located"
                  : locationPermission === "loading"
                  ? "📍 Locating..."
                  : "📍 Location Off"}
              </span>
            </div>
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
            {/* Chat Interface */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 rounded-2xl bg-food-gradient backdrop-blur-xl border border-orange-500/20 p-6">
                {useElevenLabs ? (
                  <ElevenLabsChat
                    setMessages={setMessages}
                    setConversationState={setConversationState}
                  />
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center gap-8">
                      <ChatVisualizer conversationMode={currentMode} />
                      <div className="w-full max-w-2xl">
                        <ConversationLog messages={messages} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Side Panel - Tips & Features */}
            <div className="w-full lg:w-80 space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 p-6">
                <h2 className="text-lg font-semibold text-food-gradient mb-4">
                  🔥 Quick Bites
                </h2>
                <ul className="space-y-3 text-sm text-orange-200/80">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🌮</span>
                    <span>"Let's cook tacos tonight!"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🗺️</span>
                    <span>"Find Italian restaurants nearby"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🛵</span>
                    <span>"Order pizza for delivery"</span>
                  </li>
                </ul>
              </div>

              {/* Location Request Card */}
              {locationPermission !== "granted" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/20 p-6"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3 bounce-gentle">📍</div>
                    <h3 className="font-semibold text-yellow-200 mb-2">
                      Enable Location
                    </h3>
                    <p className="text-sm text-yellow-200/70 mb-4">
                      Get personalized restaurant recommendations and accurate
                      delivery options
                    </p>
                    <button
                      onClick={requestLocation}
                      disabled={locationPermission === "loading"}
                      className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-sm font-medium text-white hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 transition-all"
                    >
                      {locationPermission === "loading"
                        ? "Requesting..."
                        : "Allow Location"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </main>

        {/* Voice Button */}
        {!useElevenLabs && (
          <MicrophoneButton
            mode={currentMode}
            onClick={handleVoiceButtonClick}
            className="fixed bottom-6 right-6 z-30"
          />
        )}
      </div>

      {/* Action Panel */}
      <ActionPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        activeFeature={activeFeature}
        featurePayload={featurePayload}
        setFeaturePayload={setFeaturePayload}
        setActiveIntent={setActiveIntent}
        userLocation={coordinates}
      />
    </div>
  );
}
