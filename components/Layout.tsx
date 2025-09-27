"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ActionPanel } from "@/components/action-panel/ActionPanel";
import { ChatVisualizer } from "@/components/ChatVisualizer";
import { ConversationLog } from "@/components/ConversationLog";
import { MicrophoneButton } from "@/components/MicrophoneButton";
import { playAudioFromText } from "@/lib/audio";
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
        "Hey there, I’m Hungry Buddy! Tell me what you’re craving and we’ll figure out something tasty together.",
      timestamp: Date.now(),
    },
  ]);
  const [conversationState, setConversationState] = useState<ConversationState>(
    "idle",
  );
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>(null);
  const [activeIntent, setActiveIntent] = useState<FeatureIntent | null>(null);
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
          activeIntent,
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-orb-gradient opacity-70 blur-3xl" />
      <motion.div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-neutral-950/60 to-neutral-900 opacity-90"
        animate={{ opacity: [0.88, 0.95, 0.88] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <main className="relative z-10 flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 pb-28 pt-14 md:px-12 lg:px-16">
        <header className="flex flex-col gap-2">
          <AnimatePresence>
            <motion.h1
              key="title"
              className="text-4xl font-semibold text-white drop-shadow-sm md:text-5xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Hungry Buddy
            </motion.h1>
          </AnimatePresence>
          <p className="max-w-xl text-balance text-sm text-white/70 md:text-base">
            Your voice-first foodie companion. Chat with Hungry Buddy to discover
            recipes, scout restaurants, or simulate delivery orders—all hands
            free.
          </p>
        </header>

        <section className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col items-center justify-center gap-8 rounded-3xl bg-white/5 p-8 backdrop-blur-xl">
            <ChatVisualizer conversationMode={currentMode} />
            <ConversationLog messages={messages} />
          </div>
          <div className="rounded-3xl bg-white/4 p-6 backdrop-blur-xl">
            <h2 className="text-lg font-medium text-white/80">Quick Tips</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li>
                Try saying: <span className="text-white">“Let’s cook tacos tonight.”</span>
              </li>
              <li>
                Planning a night out? Ask for restaurants and we’ll scout the map.
              </li>
              <li>
                In the mood to order in? We can simulate an entire delivery
                experience.
              </li>
            </ul>
          </div>
        </section>
      </main>

      <MicrophoneButton
        mode={currentMode}
        onClick={handleVoiceButtonClick}
        className="fixed bottom-10 left-1/2 z-30 -translate-x-1/2"
      />

      <ActionPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        activeFeature={activeFeature}
        featurePayload={featurePayload}
        setFeaturePayload={setFeaturePayload}
        setActiveIntent={setActiveIntent}
      />
    </div>
  );
}

