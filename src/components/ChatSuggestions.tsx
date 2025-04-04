
// This file is now empty as we've moved the suggestions directly to the ChatPage component
// The file is kept to prevent any import errors, but it's no longer used
import React from "react";

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = () => {
  return null;
};

export default ChatSuggestions;
