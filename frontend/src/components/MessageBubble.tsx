import { Message } from "@/types/chat";

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md ${
          isUser
            ? "bg-black text-white"
            : "bg-white text-black"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}