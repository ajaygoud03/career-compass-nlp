// src/components/FileUpload.tsx
import React from 'react';
import { Button } from './ui/button';

interface FileUploadProps {
  title: string;
  description: string;
  acceptedTypes: string[];
  onFileUpload: (file: File) => void;
  uploadProgress: number;
  isProcessing: boolean;
  uploadedFile: File | null;
  onRemoveFile: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  title,
  description,
  acceptedTypes,
  onFileUpload,
  uploadProgress,
  isProcessing,
  uploadedFile,
  onRemoveFile
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-sm">
      <h4 className="text-lg font-medium mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>

      {uploadedFile ? (
        <div className="mb-3">
          <p className="text-sm font-semibold">{uploadedFile.name}</p>
          <Button variant="destructive" onClick={onRemoveFile}>
            Remove File
          </Button>
        </div>
      ) : (
        <input
          type="file"
          accept={acceptedTypes.map((type) => `.${type.toLowerCase()}`).join(',')}
          onChange={handleFileChange}
          disabled={isProcessing}
          className="block w-full mb-3"
        />
      )}

      {isProcessing && (
        <div className="text-xs text-gray-500">Uploading... {uploadProgress}%</div>
      )}
    </div>
  );
};
