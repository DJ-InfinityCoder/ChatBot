"use client";

import { useState, useRef, useEffect } from "react";
import { Message, ChatSession } from "@/types/chat";
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionFile, setSessionFile] = useState<{ name: string; type: string; content: string } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const retryCount = useRef(0);

  const handleNewChat = () => {
    setMessages([]);
    setSessionFile(null);
    setInputValue("");
    retryCount.current = 0;
  };

  const handleSuggestionClick = (text: string) => {
    if (text === "Analyze PDF") {
      setInputValue("Can you analyze this PDF for me?");
    } else if (text === "Analyze Image") {
      setInputValue("What can you tell me about this image?");
    } else {
      setInputValue("Help me draft some content about ");
    }
  };

  const handleSendMessage = async (text: string, file?: File, isRetry = false) => {
    if (!text?.trim() && !file) return;
    if (!isRetry) retryCount.current = 0;
    
    const userMessageId = uuidv4();
    const assistantMessageId = uuidv4();
    const timestamp = Date.now();
    
    // 1. ADD MESSAGES IMMEDIATELY FOR ZERO LATENCY UI
    if (!isRetry) {
      const newUserMessage: Message = {
        id: userMessageId,
        role: "user",
        content: text,
        timestamp,
        file: file ? { 
          name: file.name, 
          type: file.type,
          // Temporary local preview if image
          data: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
        } : undefined,
      };

      const thinkingMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: timestamp + 1,
        isGenerating: true,
      };

      setMessages((prev) => [...prev, newUserMessage, thinkingMessage]);
    } else {
      // For retry, just reset the generating state of the last message or add a new one
      const thinkingMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isGenerating: true,
      };
      setMessages((prev) => [...prev, thinkingMessage]);
    }

    setIsLoading(true);
    let currentFile = sessionFile;

    try {
      // 2. HANDLE FILE UPLOAD IN BACKGROUND
      if (file && !isRetry) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (!uploadRes.ok) throw new Error("Upload failed");
          
          const uploadData = await uploadRes.json();
          currentFile = {
            name: uploadData.name,
            type: uploadData.type,
            content: uploadData.content,
          };
          setSessionFile(currentFile);

          // Update user message with real base64 data for persistence
          if (file.type.startsWith("image/")) {
            setMessages(prev => prev.map(m => 
              m.id === userMessageId 
                ? { ...m, file: { ...m.file!, data: uploadData.content } } 
                : m
            ));
          }
        } catch (error) {
          console.error("Upload error:", error);
        }
      }

      // 3. START CHAT REQUEST
      const chatMessages = messages.filter(m => !m.isGenerating);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: isRetry ? chatMessages : [...chatMessages, { id: userMessageId, role: "user", content: text, timestamp }],
          fileContent: currentFile?.content,
          fileType: currentFile?.type,
        }),
      });

      if (!response.ok) {
        if (response.status === 503 && retryCount.current < 2) {
          retryCount.current++;
          // Remove the thinking message before retrying to avoid duplicates
          setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
          await new Promise(resolve => setTimeout(resolve, 2000));
          return handleSendMessage(text, undefined, true);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Chat failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let fullText = "";
      let displayedText = "";
      let isStreaming = true;

      const drain = () => {
        if (displayedText.length < fullText.length) {
          const diff = fullText.length - displayedText.length;
          const increment = diff > 50 ? 5 : diff > 20 ? 3 : 1;
          
          displayedText += fullText.slice(displayedText.length, displayedText.length + increment);
          
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === assistantMessageId 
                ? { ...msg, content: displayedText } 
                : msg
            )
          );
        }

        if (isStreaming || displayedText.length < fullText.length) {
          requestAnimationFrame(drain);
        } else {
          if (!fullText.trim()) {
            setMessages((prev) => 
              prev.map((msg) => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: "The AI returned an empty response. Please try again.", isGenerating: false } 
                  : msg
              )
            );
          } else {
            setMessages((prev) => 
              prev.map((msg) => 
                msg.id === assistantMessageId 
                  ? { ...msg, isGenerating: false } 
                  : msg
              )
            );
          }
        }
      };

      requestAnimationFrame(drain);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullText += chunk;
      }
      isStreaming = false;

    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage = error.message.includes("503") 
        ? "The AI is currently busy. Please try again in a moment."
        : "Oops! Something went wrong. Please try again.";
      
      setMessages((prev) => 
        prev.map(m => m.id === assistantMessageId ? { ...m, content: errorMessage, isGenerating: false } : m)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex h-screen flex-col bg-background text-foreground transition-colors overflow-hidden">
      <div className="bg-mesh" />
      <Header onNewChat={handleNewChat} />
      <ChatWindow 
        messages={messages} 
        onSuggestionClick={handleSuggestionClick} 
      />
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        inputValue={inputValue}
        setInputValue={setInputValue}
      />
    </main>
  );
}
