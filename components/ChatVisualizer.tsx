"use client";

import { memo } from "react";
import { motion, type TargetAndTransition } from "framer-motion";
import { ConversationMode } from "@/lib/types";

interface ChatVisualizerProps {
  conversationMode: ConversationMode;
}

const modeToDescription: Record<ConversationMode, string> = {
  [ConversationMode.Idle]: "Ready when you are",
  [ConversationMode.Listening]: "Listening…",
  [ConversationMode.Processing]: "Thinking…",
  [ConversationMode.Speaking]: "Speaking…",
};

const ringVariants: Record<ConversationMode, TargetAndTransition> = {
  [ConversationMode.Idle]: { scale: 1, opacity: 0.45 },
  [ConversationMode.Listening]: { scale: 1.08, opacity: 0.6 },
  [ConversationMode.Processing]: { scale: 1.12, opacity: 0.55 },
  [ConversationMode.Speaking]: { scale: 1.15, opacity: 0.7 },
};

const waveVariants: Record<ConversationMode, TargetAndTransition> = {
  [ConversationMode.Idle]: {
    pathLength: 0.85,
    transition: { duration: 1.8, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
  },
  [ConversationMode.Listening]: {
    pathLength: [0.7, 1, 0.7],
    transition: { duration: 2.4, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
  },
  [ConversationMode.Processing]: {
    pathLength: [0.5, 1.1, 0.5],
    transition: { duration: 2.2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
  },
  [ConversationMode.Speaking]: {
    pathLength: [1.2, 0.4, 1.2],
    transition: { duration: 2.1, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
  },
};

const ChatVisualizerComponent = ({ conversationMode }: ChatVisualizerProps) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex h-64 w-64 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-hungry-amber-500/40 via-hungry-plum-600/40 to-hungry-amber-300/40 blur-3xl"
          animate={{ opacity: [0.4, 0.55, 0.4] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute inset-[18%] rounded-full border border-white/30"
          animate={ringVariants[conversationMode]}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute inset-[6%] rounded-full border border-white/10 backdrop-blur-3xl"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="relative z-10 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-hungry-amber-500 via-hungry-plum-400 to-hungry-plum-600 shadow-[0_0_40px_rgba(195,155,255,0.3)]"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.svg
            viewBox="0 0 200 200"
            className="h-32 w-32"
            initial={{ pathLength: 0.8 }}
            animate={waveVariants[conversationMode]}
          >
            <motion.path
              d="M0 100 Q20 60 40 100 T80 100 T120 100 T160 100 T200 100"
              fill="transparent"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={8}
              strokeLinecap="round"
            />
          </motion.svg>
        </motion.div>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/40">
          TasteBuds
        </p>
        <p className="text-lg font-medium text-white/80">
          {modeToDescription[conversationMode]}
        </p>
      </div>
    </div>
  );
};

export const ChatVisualizer = memo(ChatVisualizerComponent);
