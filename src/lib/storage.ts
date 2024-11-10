import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadContractFile(file: File, userId: string) {
  try {
    // Simplified path structure
    const fileName = `${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, file);

    if (error) {
      console.error('Storage error details:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Upload error details:', error);
    throw error;
  }
}
