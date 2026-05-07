"use client";

import { Plus, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HeaderProps {
  onNewChat: () => void;
}

export default function Header({ onNewChat }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-500/10 bg-background/80 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <h1 className="text-xl font-black tracking-tighter text-foreground uppercase">Chat<span className="text-orange-500">bot</span></h1>
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">AI Assistant</span>
        </motion.div>

        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-orange-500/5 transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 text-orange-400" />
              ) : (
                <Moon className="h-4 w-4 text-orange-600" />
              )}
            </button>
          )}

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onNewChat}
            className="group flex items-center gap-2 rounded-lg border border-orange-500/20 bg-orange-500/5 px-4 py-2 text-sm font-bold text-orange-600 dark:text-orange-400 transition-all hover:bg-orange-500 hover:text-white active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
