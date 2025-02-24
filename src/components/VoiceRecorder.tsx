
import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VoiceRecorderProps {
  onRecordingComplete: (url: string, duration: number) => void;
  onError: (error: string) => void;
}

export function VoiceRecorder({ onRecordingComplete, onError }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startTime = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
        setIsUploading(true);

        try {
          const filename = `recording-${Date.now()}.webm`;
          const { error: uploadError, data } = await supabase.storage
            .from('chat_attachments')
            .upload(filename, audioBlob);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('chat_attachments')
            .getPublicUrl(filename);

          const duration = (Date.now() - startTime.current) / 1000;
          onRecordingComplete(publicUrl, duration);
        } catch (error) {
          onError('Error uploading recording');
          console.error('Error uploading recording:', error);
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.current.start();
      startTime.current = Date.now();
      setIsRecording(true);
    } catch (error) {
      onError('Error accessing microphone');
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isUploading ? (
        <Button variant="ghost" size="icon" disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : isRecording ? (
        <Button
          variant="destructive"
          size="icon"
          onClick={stopRecording}
        >
          <Square className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={startRecording}
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
