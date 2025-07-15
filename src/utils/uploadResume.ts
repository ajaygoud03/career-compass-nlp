import { supabase } from '../supabaseClient';

export const uploadResume = async (file: File, userId: string) => {
  const filePath = `resumes/${userId}_${file.name}`;

  const { data, error } = await supabase.storage
    .from('resumes') // Use your actual bucket name
    .upload(filePath, file);

  if (error) {
    console.error('Upload failed:', error);
    throw new Error('Failed to upload file to Supabase');
  }

  const publicURL = supabase.storage.from('resumes').getPublicUrl(filePath).data.publicUrl;
  return publicURL;
};
