"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ConversationMode } from "@/lib/types";

interface MicrophoneButtonProps {
  mode: ConversationMode;
  onClick: () => void;
  className?: string;
}

const modeToLabel: Record<ConversationMode, string> = {
  [ConversationMode.Idle]: "Tap to Talk",
  [ConversationMode.Listening]: "Listening…",
  [ConversationMode.Processing]: "Thinking…",
  [ConversationMode.Speaking]: "Speaking…",
};

const rippleVariants = {
  idle: { scale: 1, opacity: 0.2 },
  listening: { scale: 1.2, opacity: 0.4 },
  processing: {
    scale: [1, 1.25, 1],
    opacity: [0.3, 0.45, 0.3],
    transition: { duration: 1.8, repeat: Infinity },
  },
  speaking: { scale: [1.1, 1.3, 1.1], opacity: [0.4, 0.6, 0.4] },
};

export const MicrophoneButton = forwardRef<
  HTMLButtonElement,
  MicrophoneButtonProps
>(function MicrophoneButton({ mode, onClick, className }, ref) {
  const isActive = mode !== ConversationMode.Idle;

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      className={`group relative flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-200 ${
        isActive
          ? "bg-orange-600 border-orange-500 shadow-lg shadow-orange-600/25 text-white"
          : "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-300 hover:text-white"
      } ${className ?? ""}`}
      whileTap={{ scale: 0.95 }}
    >
      {isActive && (
        <motion.div
          className="absolute inset-[-4px] rounded-full border-2 border-orange-400/30"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 1.75a3.25 3.25 0 0 1 3.25 3.25v6a3.25 3.25 0 0 1-6.5 0v-6A3.25 3.25 0 0 1 12 1.75Zm6.5 9.25a6.5 6.5 0 0 1-13 0m6.5 6.5v4m-4 0h8"
        />
      </svg>
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-400 whitespace-nowrap">
        {modeToLabel[mode]}
      </span>
    </motion.button>
  );
});
