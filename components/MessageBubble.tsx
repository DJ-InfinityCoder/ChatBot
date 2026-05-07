"use client";

import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { User, Bot, FileText, ImageIcon, X, Loader2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isImage = message.file?.type.startsWith("image/") && message.file.data;
  const isThinking = message.role === "assistant" && message.isGenerating && !message.content;

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          "flex w-full gap-3 py-4",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar - Full Rounded */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all shadow-sm",
            isUser 
              ? "bg-orange-500 text-white" 
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-border/50"
          )}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </motion.div>

        {/* Message Content Container */}
        <div className={cn(
          "flex max-w-[80%] flex-col gap-1.5",
          isUser ? "items-end" : "items-start"
        )}>
          {/* File Preview */}
          {message.file && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 backdrop-blur-sm p-2 pr-4 text-[10px] font-bold uppercase tracking-tight text-zinc-600 dark:text-zinc-300">
                {isImage ? (
                  <ImageIcon size={12} className="text-orange-500" />
                ) : (
                  <FileText size={12} className="text-orange-500" />
                )}
                <span className="truncate max-w-[150px]">{message.file.name}</span>
              </div>
              
              {isImage && (
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsImageExpanded(true)}
                  className="relative h-32 w-48 cursor-zoom-in overflow-hidden rounded-lg border border-border shadow-sm group"
                >
                  <img 
                    src={message.file.data?.startsWith('blob:') ? message.file.data : `data:${message.file.type};base64,${message.file.data}`} 
                    alt={message.file.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Bubble */}
          <div className={cn(
            "relative rounded-lg px-4 py-2.5 text-[14px] leading-relaxed transition-all shadow-sm",
            isUser 
              ? "bg-orange-500 text-white rounded-tr-none shadow-orange-500/10" 
              : "bg-zinc-100 dark:bg-zinc-900 border border-border/50 text-foreground rounded-tl-none"
          )}>
            {isThinking ? (
              <div className="flex items-center gap-2 py-1">
                <div className="flex gap-1">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                </div>
              </div>
            ) : (
              <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-border/50 prose-code:text-orange-500 dark:prose-code:text-orange-400">
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {/* Actions & Timestamp */}
          <div className="flex items-center gap-3 px-1">
            {!isThinking && !isUser && message.content && (
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest transition-all",
                  copied ? "text-emerald-500" : "text-zinc-400 hover:text-orange-500"
                )}
              >
                {copied ? <Check size={10} /> : <Copy size={10} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
            
            {!isThinking && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400/80">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Expansion Modal */}
      <AnimatePresence>
        {isImageExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setIsImageExpanded(false)}
          >
            <button 
              className="absolute top-6 right-6 rounded-lg bg-white/10 p-2.5 text-white hover:bg-white/20 transition-all backdrop-blur-md"
              onClick={() => setIsImageExpanded(false)}
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={message.file?.data?.startsWith('blob:') ? message.file.data : `data:${message.file!.type};base64,${message.file!.data}`}
              alt={message.file!.name}
              className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
