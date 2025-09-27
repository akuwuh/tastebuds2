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
        className="fixed left-0 top-0 z-50 h-full w-80 border-r border-slate-700/50 bg-slate-900/95 backdrop-blur-xl lg:relative lg:z-auto lg:translate-x-0"
        style={{ backdropFilter: "blur(20px)" }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-orange-500">💬</span>
              Chat History
            </h2>
            <button
              onClick={onToggle}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-300 lg:hidden"
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
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💭</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Your conversations will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
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
          <div className="border-t border-slate-700/50 p-4">
            <div className="text-xs text-slate-500 text-center">
              TasteBuds • Food Discovery
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group cursor-pointer rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 hover:border-slate-600 hover:bg-slate-800/50 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-sm">
          {getConversationEmoji(conversation.preview)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-slate-200">
            {conversation.preview}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
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
