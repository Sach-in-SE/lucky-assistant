
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick(suggestion);
    setIsVisible(false);
  };

  return (
    <>
      {isVisible && (
        <div className="flex flex-wrap gap-2 mb-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="secondary"
              size="sm"
              className="text-xs py-1 px-3 h-auto rounded-full bg-secondary/40 hover:bg-secondary/60 transition-colors text-secondary-foreground"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </>
  );
};

export default ChatSuggestions;
