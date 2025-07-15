import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { uploadFileToSupabase } from '@/lib/supabase/uploadResume';

const UploadPage = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleUpload = async (file: File) => {
    setUploadedFile(file);
    setProgress(10);
    try {
      const url = await uploadResume(file, 'user-id-or-folder-name');
      setProgress(100);
      console.log('✅ Uploaded file URL:', url);
    } catch (err) {
      console.error('❌ Upload failed:', err);
      setProgress(0);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FileUpload
        title="Upload Your Resume"
        description="PDF, DOCX, or TXT files only"
        acceptedTypes={['.pdf', '.docx', '.txt']}
        onFileUpload={handleUpload}
        uploadedFile={uploadedFile}
        uploadProgress={progress}
        isProcessing={progress > 0 && progress < 100}
        onRemoveFile={() => {
          setUploadedFile(null);
          setProgress(0);
        }}
      />
    </div>
  );
};

export default UploadPage;
