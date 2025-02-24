
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: string;
  isAI: boolean;
  timestamp: string;
}

interface CodeBlock {
  language: string;
  code: string;
}

export function ChatMessage({ message, isAI, timestamp }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const messageRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Parse code blocks from message
  const parseCodeBlocks = (text: string): (string | CodeBlock)[] => {
    const parts: (string | CodeBlock)[] = [];
    const regex = /```(\w+)?\n([\s\S]+?)\n```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add code block
      parts.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
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

  const renderContent = (text: string) => {
    const parts = parseCodeBlocks(text);
    return parts.map((part, index) => {
      if (typeof part === 'string') {
        return (
          <p key={index} className="text-xs leading-relaxed whitespace-pre-wrap break-words">
            {part}
          </p>
        );
      } else {
        return (
          <div key={index} className="relative my-2 rounded-md overflow-hidden">
            <div className="flex items-center justify-between bg-muted/50 px-4 py-1">
              <span className="text-xs text-muted-foreground">{part.language}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => handleCopy(part.code)}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <SyntaxHighlighter
              language={part.language}
              style={atomDark}
              customStyle={{
                margin: 0,
                borderRadius: '0 0 0.375rem 0.375rem',
              }}
            >
              {part.code}
            </SyntaxHighlighter>
          </div>
        );
      }
    });
  };

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
            ? "bg-[#F0EEFF] dark:bg-[#2D2B4A] rounded-tl-none"
            : "bg-[#E5DEFF] dark:bg-[#4B4499] text-foreground rounded-tr-none"
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
              copied ? "text-green-500" : "text-foreground"
            )}
            onClick={() => handleCopy(message)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <div className={cn(
          "prose max-w-none",
          isAI ? "dark:prose-invert" : "prose-p:text-foreground"
        )}>
          {renderContent(displayText)}
        </div>
      </div>
    </div>
  );
}
