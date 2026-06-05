"use client";

import { useState } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { Message } from "@/types/chat";
import { sendMessage } from "@/services/chatApi";
import { SourceObject } from "@/types/chat";
import SourcePanel from "./SourcePanel";

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
  const [selectedSources, setSelectedSources] = useState<SourceObject[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

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
      sources: response.sources,
      timestamp: new Date(),
    };

    setSelectedMessageId(botMessage.id);
    setSelectedSources(response.sources ?? []);

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

  const handleViewSources = (message: Message) => {
    setSelectedMessageId(message.id);
    setSelectedSources(message.sources ?? []);
  };

  return (
    <div className="flex h-full gap-4 bg-gray-100 p-4">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onViewSources={handleViewSources}
            />
          ))}

          {loading && (
            <div className="text-sm text-gray-500">
              Looking through the sources...
            </div>
          )}
        </div>

        <ChatInput
          onSend={handleSend}
          loading={loading}
        />
      </div>

      <SourcePanel sources={selectedSources} />
    </div>
  );
}