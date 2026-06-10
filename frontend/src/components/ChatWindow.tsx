"use client";

import {
  useState,
  useEffect
} from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import {
  Message,
  SourceObject,
  SessionObject,
  SessionHistoryItem,
  ConversationHistoryItem
} from "@/types/chat";
import {
  sendMessage,
  fetchChatHistory
} from "@/services/chatApi";
import SourcePanel from "./SourcePanel";
import { v4 as uuidv4 } from "uuid";
import { GREETING_MESSAGE } from "../../constants/messages.js"

const createGreetingMessage = (): Message => ({
  id: crypto.randomUUID(),
  role: "assistant",
  content: GREETING_MESSAGE,
  timestamp: new Date(),
});

export default function ChatWindow() {

  const [session, setSession] = useState(() => ({ sessionId:uuidv4(), sessionCreatedAt: Date.now()}));
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState<SourceObject[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [messages, setMessages] = useState<Message[]>(() => [createGreetingMessage()]);

  useEffect(() => {
    (async () => {
      const data = await fetchChatHistory();
      setHistory(data);
    })();     
  }, []);

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
      const response = await sendMessage(text, session, conversationId);
      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        sources: response.sources,
        timestamp: new Date(),
      };

      setConversationId(response.conversationId);
      setSelectedMessageId(botMessage.id);
      setSelectedSources(response.sources ?? []);
      setMessages((prev) => [...prev, botMessage]);
      const data = await fetchChatHistory();
      setHistory(data);

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

  const handleHistory = async (history: ConversationHistoryItem, session: SessionObject) => {
    setSession(session);
    setConversationId(history.conversationId);

    const selectedMessages = history.messages.map((message) => ({
      id: crypto.randomUUID(),
      role: message.role,
      content: message.content,
      timestamp: new Date()
    }));

    setMessages(selectedMessages);
    setSelectedSources([]);
    setSelectedMessageId(null);
  };

  const handleNewChat = async () => {
    setConversationId(null);
    setMessages([createGreetingMessage()]);
    setSelectedSources([]);
    setSelectedMessageId(null);
  };

  return (
    <div className="flex h-full gap-4 bg-gray-100 p-4">
      <aside>
        <button onClick={handleNewChat}>New Chat</button>
        {history.map((session) => 
          session.conversations.map((conversation) => (
            <button
              key={conversation.conversationId}
              onClick={() => handleHistory(
                conversation,
                {
                  sessionId: session.sessionId,
                  sessionCreatedAt: session.sessionCreatedAt
                }
              )}
            >
            {conversation.title}
            </button>
          ))
        )}
      </aside>
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