
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup function to stop recording and release resources
  useEffect(() => {
    return () => {
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        await processAudioData();
      };
      
      mediaRecorder.start();
      setIsListening(true);
      
      // Optional: Auto-stop after 10 seconds
      setTimeout(() => {
        if (isListening && mediaRecorderRef.current) {
          stopRecording();
        }
      }, 10000);
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const processAudioData = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    try {
      setIsProcessing(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert blob to base64
      const base64Audio = await convertBlobToBase64(audioBlob);
      const audioData = base64Audio.split(',')[1]; // Remove the data URL prefix
      
      await transcribeAudio(audioData);
    } catch (error) {
      console.error('Error processing audio:', error);
      // Silently fail without showing error to user as requested
    } finally {
      setIsProcessing(false);
    }
  };

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const transcribeAudio = async (base64Audio: string) => {
    try {
      // Create FormData for the API request
      const formData = new FormData();
      
      // Convert base64 back to a file/blob
      const byteCharacters = atob(base64Audio);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: 'audio/webm' });
      
      // Append the audio file to the FormData
      formData.append("file", audioBlob, "recording.webm");
      
      // Send the request to the Hugging Face API
      const response = await fetch("https://api-inference.huggingface.co/models/openai/whisper-base", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
        },
        body: formData,
      });
      
      if (!response.ok) {
        console.error("Transcription failed:", response.statusText);
        return;
      }
      
      const result = await response.json();
      
      if (result.text) {
        setMessage(prev => (prev.trim() ? `${prev.trim()} ${result.text.trim()}` : result.text.trim()));
        
        // Focus the textarea
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      // Silently fail as requested
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
