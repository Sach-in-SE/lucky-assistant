
import React from "react";

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

// This component is no longer used as the suggestions are implemented directly in ChatPage
const ChatSuggestions: React.FC<ChatSuggestionsProps> = () => {
  return null;
};

export default ChatSuggestions;
