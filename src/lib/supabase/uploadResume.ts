import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadResume = async (
  file: File,
  folder: 'resumes' | 'descriptions'
): Promise<string> => {
  const filePath = `${folder}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from('resumes') // ✅ Corrected bucket name
    .upload(filePath, file);

  if (error) {
    console.error('Supabase Upload Error:', error);
    throw new Error('Upload failed');
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from('resumes').getPublicUrl(filePath); // ✅ also here

  return publicUrl;
};
