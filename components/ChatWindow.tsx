"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import { motion, AnimatePresence } from "framer-motion";

interface ChatWindowProps {
  messages: Message[];
  onSuggestionClick?: (text: string) => void;
}

export default function ChatWindow({ messages, onSuggestionClick }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto scroll-smooth px-4 py-8 transition-colors"
    >
      <div className="container mx-auto max-w-4xl">
        <AnimatePresence initial={false} mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex h-[60vh] flex-col items-center justify-center gap-6 text-center"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">
                  Chat<span className="text-orange-500">bot</span>
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto font-medium">
                  Upload a PDF, share an image, or just start typing to begin your session.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-4">
                {[
                  { icon: '📄', text: 'Analyze PDF' },
                  { icon: '🖼️', text: 'Analyze Image' },
                  { icon: '✍️', text: 'Draft Content' }
                ].map((item) => (
                  <motion.div 
                    key={item.text}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSuggestionClick?.(item.text)}
                    className="p-4 rounded-lg border border-border bg-card text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer hover:border-orange-500/30 hover:bg-orange-500/[0.02] shadow-sm hover:shadow-md"
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="font-bold text-xs uppercase tracking-wider">"{item.text}"</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
              />
            ))
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
