"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type ChatMessage } from "@/lib/types";

interface ConversationLogProps {
  messages: ChatMessage[];
}

const messageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export function ConversationLog({ messages }: ConversationLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative flex h-80 w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white/4 p-4 shadow-inner">
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto pr-2 text-sm"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <motion.div
                key={message.id}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={messageVariants}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[80%] rounded-2xl px-4 py-3 shadow-lg backdrop-blur
                    ${
                      isUser
                        ? "bg-hungry-amber-500/90 text-black"
                        : message.error
                          ? "bg-red-500/90 text-white"
                          : "bg-white/10 text-white"
                    }`}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed">
                    {message.content}
                  </p>
                  <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
                    {isUser ? "You" : "Hungry Buddy"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

