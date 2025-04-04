
import { useState, useRef, FormEvent, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Mic, MicOff, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSubmit: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage((prev) => prev + ' ' + transcript.trim());
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopRecording();
    };
  }, [toast]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      setIsProcessing(true); // Set processing state to show user that transcription is happening
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("model", "openai/whisper-base");
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch("https://api-inference.huggingface.co/models/openai/whisper-base", {
        method: "POST",
        headers: {
          Authorization: "Bearer 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",
        },
        body: formData,
      });

      if (!response.ok) {
        console.error("Transcription failed:", response.statusText);
        // Silently fail and don't show error to user as requested
        setIsProcessing(false);
        return;
      }

      const result = await response.json();
      
      if (result.text) {
        setMessage(prev => (prev.trim() ? `${prev.trim()} ${result.text.trim()}` : result.text.trim()));
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      // Silently fail and don't show error to user as requested
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSubmit(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4">
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="min-h-[60px] glass-input"
          disabled={disabled || isListening || isProcessing}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <Button 
          type="button" 
          size="icon" 
          variant="outline"
          className={`${isListening ? 'bg-red-500/10 text-red-500 border-red-500/50 animate-pulse-recording' : 'bg-secondary/20'} transition-colors relative`}
          onClick={toggleListening}
          disabled={disabled || isProcessing}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </>
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
        
        <Button type="submit" size="icon" disabled={disabled || isProcessing}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {isProcessing && (
        <div className="text-xs text-slate-400 animate-pulse text-center">
          Processing your audio...
        </div>
      )}
    </form>
  );
}
