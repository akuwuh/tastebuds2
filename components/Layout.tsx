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
        "Hey there, I'm TasteBuds! 🍽️ Tell me what you're craving and we'll figure out something delicious together!",
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Subtle background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute top-1/4 right-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-orange-600/30 to-red-600/20 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-red-500/20 to-orange-400/15 blur-3xl" />
      </div>

      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        messages={messages}
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(!isSidebarOpen)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 lg:hidden"
                  aria-label="Toggle sidebar"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                {/* Brand */}
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
                    <span className="text-sm">🍽️</span>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold text-white">
                      TasteBuds
                    </h1>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                {/* Location Status */}
                <div className="hidden items-center gap-2 rounded-md bg-slate-800/60 px-2.5 py-1.5 text-xs md:flex">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      locationPermission === "granted"
                        ? "bg-emerald-400"
                        : locationPermission === "loading"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-slate-500"
                    }`}
                  />
                  <span className="text-slate-300">
                    {locationPermission === "granted"
                      ? "Located"
                      : locationPermission === "loading"
                      ? "Locating..."
                      : "No location"}
                  </span>
                </div>

                {/* Voice Toggle */}
                <button
                  onClick={() => setUseElevenLabs(!useElevenLabs)}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    useElevenLabs
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                  <span className="hidden sm:inline">
                    {useElevenLabs ? "Voice" : "Voice"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-6">
            {/* Chat Interface */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
                {useElevenLabs ? (
                  <div className="h-full p-6">
                    <ElevenLabsChat
                      setMessages={setMessages}
                      setConversationState={setConversationState}
                    />
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
                        <ChatVisualizer conversationMode={currentMode} />
                        <div className="w-full max-h-96 overflow-y-auto">
                          <ConversationLog messages={messages} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Side Panel - Tips & Features */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-5">
                <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <span className="text-orange-500">💡</span>
                  Try saying...
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <span className="text-xl">🌮</span>
                    <span className="text-sm text-slate-300">
                      "Let's cook tacos tonight!"
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <span className="text-xl">🗺️</span>
                    <span className="text-sm text-slate-300">
                      "Find Italian restaurants nearby"
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <span className="text-xl">🛵</span>
                    <span className="text-sm text-slate-300">
                      "Order pizza for delivery"
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Request Card */}
              {locationPermission !== "granted" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-5"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">📍</span>
                    </div>
                    <h3 className="font-medium text-white mb-2">
                      Enable Location
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Get personalized restaurant recommendations based on your
                      location
                    </p>
                    <button
                      onClick={requestLocation}
                      disabled={locationPermission === "loading"}
                      className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 px-4 py-2.5 text-sm font-medium text-white transition-colors"
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
          <div className="fixed bottom-6 right-6 z-30">
            <MicrophoneButton
              mode={currentMode}
              onClick={handleVoiceButtonClick}
            />
          </div>
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
