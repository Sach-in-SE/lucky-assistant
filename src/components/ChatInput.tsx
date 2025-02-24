
import { useState, useRef, FormEvent } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";
import { FileUpload } from "./FileUpload";
import { VoiceRecorder } from "./VoiceRecorder";
import { useToast } from "./ui/use-toast";

interface ChatInputProps {
  onSubmit: (message: string, attachment?: {
    url: string;
    type: string;
    name: string;
    size: number;
  }) => void;
}

export function ChatInput({ onSubmit }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<{
    url: string;
    type: string;
    name: string;
    size: number;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !attachment) return;

    onSubmit(message, attachment || undefined);
    setMessage("");
    setAttachment(null);
  };

  const handleFileUpload = (url: string, name: string, type: string, size: number) => {
    setAttachment({ url, type, name, size });
    toast({
      title: "File uploaded",
      description: `${name} has been attached to your message`,
    });
  };

  const handleVoiceUpload = (url: string, duration: number) => {
    setAttachment({
      url,
      type: "audio/webm",
      name: `Voice message (${duration.toFixed(1)}s)`,
      size: 0,
    });
    toast({
      title: "Voice message recorded",
      description: "Your voice message has been attached",
    });
  };

  const handleError = (error: string) => {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4">
      {attachment && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground truncate">
            {attachment.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAttachment(null)}
          >
            Remove
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <FileUpload onUpload={handleFileUpload} onError={handleError} />
        <VoiceRecorder
          onRecordingComplete={handleVoiceUpload}
          onError={handleError}
        />
      </div>
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
