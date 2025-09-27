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

export const MicrophoneButton = forwardRef<HTMLButtonElement, MicrophoneButtonProps>(
  function MicrophoneButton({ mode, onClick, className }, ref) {
    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        className={`group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-hungry-amber-500 via-hungry-amber-300 to-hungry-plum-400 text-black shadow-[0_20px_60px_rgba(255,159,52,0.4)] transition-transform hover:scale-105 active:scale-95 ${className ?? ""}`}
        whileTap={{ scale: 0.94 }}
      >
        <motion.div
          className="absolute inset-[-18%] rounded-full border border-white/30"
          animate={rippleVariants[mode.toLowerCase() as keyof typeof rippleVariants] ?? rippleVariants.idle}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="z-10 h-8 w-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 1.75a3.25 3.25 0 0 1 3.25 3.25v6a3.25 3.25 0 0 1-6.5 0v-6A3.25 3.25 0 0 1 12 1.75Zm6.5 9.25a6.5 6.5 0 0 1-13 0m6.5 6.5v4m-4 0h8"
          />
        </svg>
        <span className="absolute top-[110%] w-28 text-center text-xs font-medium tracking-wide text-white/80">
          {modeToLabel[mode]}
        </span>
      </motion.button>
    );
  },
);

