
import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VoiceRecorderProps {
  onRecordingComplete: (url: string, duration: number, transcript?: string) => void;
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
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        if (chunks.current.length === 0) {
          onError('No audio data recorded');
          return;
        }

        const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
        if (audioBlob.size === 0) {
          onError('Recorded audio is empty');
          return;
        }

        setIsUploading(true);

        try {
          const filename = `recording-${Date.now()}.webm`;
          console.log('Uploading audio file:', filename);

          const { error: uploadError, data } = await supabase.storage
            .from('chat_attachments')
            .upload(filename, audioBlob);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('chat_attachments')
            .getPublicUrl(filename);

          console.log('Audio uploaded successfully, getting transcription...');

          const { data: transcriptionData, error: transcriptionError } = await supabase.functions
            .invoke('transcribe-audio', {
              body: { audioUrl: publicUrl }
            });

          if (transcriptionError) {
            console.error('Transcription error:', transcriptionError);
            throw transcriptionError;
          }

          if (!transcriptionData?.text) {
            console.warn('No transcription text received');
          }

          const duration = (Date.now() - startTime.current) / 1000;
          onRecordingComplete(publicUrl, duration, transcriptionData?.text);
        } catch (error) {
          console.error('Error processing recording:', error);
          onError('Error processing recording. Please try again.');
        } finally {
          setIsUploading(false);
        }
      };

      // Start recording with 1-second time slices
      mediaRecorder.current.start(1000);
      startTime.current = Date.now();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      onError('Error accessing microphone. Please ensure microphone permissions are granted.');
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
    isUploading ? (
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
    )
  );
}
