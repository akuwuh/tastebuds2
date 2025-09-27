"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/lib/types";

interface ChatHistorySidebarProps {
  messages: ChatMessage[];
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatHistorySidebar({
  messages,
  isOpen,
  onToggle,
}: ChatHistorySidebarProps) {
  const conversations = groupMessagesByConversation(messages);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 z-50 h-full w-80 border-r border-orange-500/20 bg-gradient-to-b from-red-950/30 to-orange-950/20 backdrop-blur-xl lg:relative lg:z-auto lg:translate-x-0"
        style={{ backdropFilter: "blur(20px)" }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-orange-500/20 p-4">
            <h2 className="text-lg font-semibold text-food-gradient">
              🍽️ Chat History
            </h2>
            <button
              onClick={onToggle}
              className="rounded-full p-2 text-orange-300 hover:bg-orange-500/10 hover:text-orange-200 lg:hidden"
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
            </button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto p-4">
            {conversations.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3 bounce-gentle">🤤</div>
                  <p className="text-sm text-orange-300/70">
                    Start chatting to see your food adventures here!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation, index) => (
                  <ConversationItem
                    key={index}
                    conversation={conversation}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-orange-500/20 p-4">
            <div className="text-xs text-orange-300/50 text-center">
              🔥 Powered by taste & technology
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

interface ConversationItemProps {
  conversation: {
    id: string;
    preview: string;
    timestamp: number;
    messageCount: number;
  };
  index: number;
}

function ConversationItem({ conversation, index }: ConversationItemProps) {
  const timeAgo = getTimeAgo(conversation.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer rounded-xl border border-orange-500/10 bg-gradient-to-r from-red-500/5 to-orange-500/5 p-3 hover:border-orange-400/30 hover:from-red-500/10 hover:to-orange-500/10 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-lg">
          {getConversationEmoji(conversation.preview)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 line-clamp-2 group-hover:text-orange-200">
            {conversation.preview}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-orange-300/60">
            <span>{timeAgo}</span>
            <span>•</span>
            <span>{conversation.messageCount} messages</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function groupMessagesByConversation(messages: ChatMessage[]) {
  // Simple grouping - in a real app, you'd have proper conversation IDs
  if (messages.length === 0) return [];

  const conversations = [];
  let currentConversation = {
    id: crypto.randomUUID(),
    preview: "",
    timestamp: 0,
    messageCount: 0,
  };

  for (const message of messages) {
    if (message.role === "user" && currentConversation.messageCount === 0) {
      currentConversation.preview = message.content;
      currentConversation.timestamp = message.timestamp;
    }
    currentConversation.messageCount++;
    currentConversation.timestamp = Math.max(
      currentConversation.timestamp,
      message.timestamp
    );
  }

  if (currentConversation.messageCount > 0) {
    conversations.push(currentConversation);
  }

  return conversations;
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

function getConversationEmoji(preview: string): string {
  const lower = preview.toLowerCase();
  if (lower.includes("pizza")) return "🍕";
  if (lower.includes("burger")) return "🍔";
  if (lower.includes("taco")) return "🌮";
  if (lower.includes("sushi")) return "🍣";
  if (lower.includes("pasta")) return "🍝";
  if (lower.includes("salad")) return "🥗";
  if (lower.includes("coffee")) return "☕";
  if (lower.includes("dessert") || lower.includes("cake")) return "🍰";
  if (lower.includes("restaurant")) return "🏪";
  if (lower.includes("recipe") || lower.includes("cook")) return "👨‍🍳";
  return "🍽️";
}
