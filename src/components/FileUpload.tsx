import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  title: string;
  description: string;
  acceptedTypes: string[];
  onFileUpload: (file: File) => void;
  uploadProgress?: number;
  isProcessing?: boolean;
  uploadedFile?: File | null;
  onRemoveFile?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  title,
  description,
  acceptedTypes,
  onFileUpload,
  uploadProgress = 0,
  isProcessing = false,
  uploadedFile,
  onRemoveFile
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  if (uploadedFile) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <File className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
              </div>
              {!isProcessing && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRemoveFile}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {isProcessing && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">Processing file...</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-muted rounded-full">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports: {acceptedTypes.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};