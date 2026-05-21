"use client";

import { useState } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { Message } from "@/types/chat";
import { sendMessage } from "@/services/chatApi";

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
    id: crypto.randomUUID(),
    role: "assistant",
    content: "Hello Vishal 👋 How can I help you today?",
    timestamp: new Date(),
  },
  ]);

  const [loading, setLoading] = useState(false);

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

  try {
    const response = await sendMessage(text);

    const botMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: response.reply,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}

        {loading && (
          <div className="text-sm text-gray-500">
            AI is typing...
          </div>
        )}
      </div>

      <ChatInput
        onSend={handleSend}
        loading={loading}
      />
    </div>
  );
}