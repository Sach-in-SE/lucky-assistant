
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { useEffect, useRef } from "react";

export interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: string;
}

interface ChatHistoryProps {
  messages: Message[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 h-full overflow-auto scroll-smooth">
      <div className="flex flex-col">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.content}
            isAI={message.isAI}
            timestamp={message.timestamp}
          />
        ))}
      </div>
    </div>
  );
}
