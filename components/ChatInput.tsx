"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (text: string, file?: File) => void;
  isLoading: boolean;
  inputValue: string;
  setInputValue: (val: string) => void;
}

export default function ChatInput({ onSendMessage, isLoading, inputValue, setInputValue }: ChatInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [inputValue]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || isLoading) return;

    onSendMessage(inputValue, selectedFile || undefined);
    setInputValue("");
    setSelectedFile(null);
    setPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="border-t border-border bg-background/95 p-4 pb-8 transition-all">
      <div className="container mx-auto max-w-4xl">
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-card p-2"
            >
              {preview ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border">
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-orange-500/5">
                  <Paperclip className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              )}
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-xs font-bold text-foreground">{selectedFile.name}</span>
                <span className="text-[10px] font-bold text-orange-500 uppercase">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                onClick={removeFile}
                className="rounded-lg p-1 text-zinc-400 hover:bg-orange-500/10 hover:text-orange-500 transition-all active:scale-90"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <div className={cn(
            "relative flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-200",
            "focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/20"
          )}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Type your message..."
              className="w-full resize-none bg-transparent px-4 py-3 text-sm font-medium text-foreground placeholder:text-zinc-500 focus:outline-none min-h-[48px] max-h-32"
            />
            
            <div className="flex items-center justify-between border-t border-border/50 px-2 py-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-orange-500/10 hover:text-orange-500 transition-all active:scale-90"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "image/*";
                      fileInputRef.current.click();
                    }
                  }}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-orange-500/10 hover:text-orange-500 transition-all active:scale-90"
                >
                  <ImageIcon size={18} />
                </button>
              </div>
              
              <button
                type="submit"
                disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 active:scale-90",
                  (inputValue.trim() || selectedFile) && !isLoading
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600"
                )}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.txt,image/*"
          />
        </form>
      </div>
    </div>
  );
}
