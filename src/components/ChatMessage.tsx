
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect, useRef } from "react";

interface ChatMessageProps {
  message: string;
  isAI: boolean;
  timestamp: string;
}

export function ChatMessage({ message, isAI, timestamp }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const messageRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  useEffect(() => {
    if (isAI) {
      setDisplayText('');
      const words = message.split(' ');
      let currentIndex = 0;

      const typeNextWord = () => {
        if (currentIndex < words.length) {
          setDisplayText(prev => {
            const wordsToAdd = Math.min(3, words.length - currentIndex);
            const newWords = words.slice(currentIndex, currentIndex + wordsToAdd).join(' ');
            const newText = prev + (currentIndex === 0 ? '' : ' ') + newWords;
            currentIndex += wordsToAdd;
            return newText;
          });
          
          if (messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      };

      intervalRef.current = setInterval(typeNextWord, 20);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      setDisplayText(message);
    }
  }, [message, isAI]);

  return (
    <div
      className={cn(
        "flex w-full gap-2 p-2 message-transition",
        isAI ? "justify-start" : "justify-end"
      )}
      ref={messageRef}
    >
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[70%] rounded-xl px-3 py-2 relative group",
          isAI
            ? "bg-secondary/50 rounded-tl-none"
            : "bg-[#E5DEFF] dark:bg-[#4B4499] text-foreground rounded-tr-none" // Changed this line
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">
              {isAI ? "Lucky" : "You"}
            </span>
            <span className={cn(
              "text-[10px]",
              isAI ? "text-muted-foreground" : "text-foreground/80"
            )}>
              {timestamp}
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
              copied ? "text-green-500" : isAI ? "text-foreground" : "text-foreground"
            )}
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <div className={cn(
          "prose max-w-none",
          isAI ? "dark:prose-invert" : "prose-p:text-foreground"
        )}>
          <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
            {displayText}
          </p>
        </div>
      </div>
    </div>
  );
}
