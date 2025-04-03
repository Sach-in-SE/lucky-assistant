
import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { ChatHistory, type Message } from "@/components/ChatHistory";
import { ChatInput } from "@/components/ChatInput";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// API URL and key configuration
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";
const TOGETHER_API_KEY = "tgp_v1_qgxCBe0k1wqAVamtAz6jvWTjEb7OURkx4wSE79XGicM";

// Hugging Face API configuration
const HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3-8b-chat-hf";
const HF_API_KEY = "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";

interface ChatPageProps {
  initialMessages?: Message[];
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  initialMessages = [
    {
      id: "1",
      content: "Hello! 👋 Lucky is here. How can I help you today?",
      isAI: true,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [useHuggingFace, setUseHuggingFace] = useState(true); // Default to using Hugging Face

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isAI: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let aiResponse;
      
      if (useHuggingFace) {
        // Call Hugging Face API
        aiResponse = await callHuggingFaceAPI(content, messages);
      } else {
        // Call Together.ai API as fallback
        aiResponse = await callTogetherAPI(content, messages);
      }

      // Reset API key error if the request was successful
      setApiKeyError(false);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(`Error calling API:`, error);
      toast({
        title: "Error",
        description: `${error instanceof Error ? error.message : "An error occurred. Please try again."}`,
        variant: "destructive",
      });
      
      // If error is due to Hugging Face API, try Together.ai as fallback
      if (useHuggingFace) {
        try {
          setUseHuggingFace(false);
          const fallbackResponse = await callTogetherAPI(content, messages);
          
          const fallbackMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: fallbackResponse,
            isAI: true,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, fallbackMessage]);
          
          toast({
            title: "Switched to Fallback API",
            description: "Hugging Face API encountered an issue. Using Together.ai as fallback.",
          });
        } catch (fallbackError) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: fallbackError instanceof Error 
              ? fallbackError.message 
              : "I apologize, but I encountered an error processing your request. Please try again later.",
            isAI: true,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: error instanceof Error 
            ? error.message 
            : "I apologize, but I encountered an error processing your request. Please try again later.",
          isAI: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const callHuggingFaceAPI = async (content: string, prevMessages: Message[]): Promise<string> => {
    const conversation = prevMessages.map(msg => ({
      role: msg.isAI ? "assistant" : "user",
      content: msg.content
    }));
    
    const payload = {
      inputs: {
        system: "You are Lucky, a helpful and friendly AI assistant. Respond to users in a conversational, natural way. Keep responses concise but informative.",
        messages: [
          ...conversation,
          { role: "user", content }
        ]
      },
      parameters: {
        temperature: 0.7,
        max_new_tokens: 800
      }
    };
    
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Hugging Face API Error:", errorData);
      throw new Error(`Hugging Face API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    return data.generated_text || "I'm sorry, I couldn't generate a response.";
  };

  const callTogetherAPI = async (content: string, prevMessages: Message[]): Promise<string> => {
    // Use custom API key if provided, otherwise use the default one
    const currentApiKey = customApiKey || TOGETHER_API_KEY;
    
    const response = await fetch(TOGETHER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentApiKey}`
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3-8b-chat-hf",
        messages: [
          { role: "system", content: "You are Lucky, a helpful and friendly AI assistant. Respond to users in a conversational, natural way. Keep responses concise but informative." },
          ...prevMessages.map(msg => ({
            role: msg.isAI ? "assistant" : "user",
            content: msg.content
          })),
          { role: "user", content }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Together.ai API Error:", errorData);
      
      // Check if it's an invalid API key error
      if (errorData.error?.code === "invalid_api_key") {
        setApiKeyError(true);
        throw new Error("Invalid API key. Please provide a valid API key.");
      }
      
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "API key has been updated",
    });
    
    setApiKeyError(false);
  };

  return (
    <div className="flex flex-col h-full glass rounded-2xl modern-shadow">
      {apiKeyError && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Error</AlertTitle>
          <AlertDescription>
            The API key is invalid or has expired. Please provide a valid Together.ai API key to continue using the chat.
          </AlertDescription>
          <form onSubmit={handleApiKeySubmit} className="mt-4 flex gap-2">
            <Input
              type="password"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="Enter your Together.ai API key"
              className="flex-1"
            />
            <Button type="submit" variant="secondary">Save Key</Button>
          </form>
          <p className="text-xs mt-2">
            You can get an API key from <a href="https://api.together.xyz/settings/api-keys" target="_blank" rel="noopener noreferrer" className="underline">Together.ai</a>
          </p>
        </Alert>
      )}
      <div className="flex-1 overflow-hidden">
        <ChatHistory messages={messages} />
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/60">
        <ChatInput onSubmit={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatPage;
