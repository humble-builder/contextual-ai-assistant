import { Message } from "@/types/chat";

interface Props {
  message: Message;
  onViewSources: (message: Message) => void
}

export default function MessageBubble({
  message,
  onViewSources
}: Props) {
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
            ? "bg-blue-500 text-white"
            : "bg-white text-grey-800"
        }`}
      >
        {message.content}
        {!isUser && message.sources?.length ? (
          <button
            type="button"
            onClick={() => onViewSources(message)}
            className="mt-2 block cursor-pointer rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            View sources
          </button>
        ) : null}
      </div>
    </div>
  );
}