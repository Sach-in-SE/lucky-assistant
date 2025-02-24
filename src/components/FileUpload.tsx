
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  onUpload: (fileUrl: string, fileName: string, fileType: string, fileSize: number) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onUpload, onError }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);

      onUpload(publicUrl, file.name, file.type, file.size);
    } catch (error) {
      onError('Error uploading file');
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  }, [onUpload, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/20",
        uploading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} disabled={uploading} />
      <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {isDragActive
          ? "Drop the file here"
          : uploading
          ? "Uploading..."
          : "Drag & drop a file here, or click to select"}
      </p>
    </div>
  );
}
