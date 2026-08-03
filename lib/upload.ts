'use client';

import { supabase } from '@/lib/supabase';

export async function uploadThumbnail(file: File) {
  if (!supabase) return null;
  
  // Limit 5MB
  if (file.size > 5 * 1024 * 1024) {
    alert('File terlalu besar! Maksimal 5MB.');
    return null;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `articles/${fileName}`;

  const { data, error } = await supabase.storage
    .from('images') // Pastikan bucket bernama 'images' sudah dibuat
    .upload(filePath, file);

  if (error) {
    console.error('Upload Error:', error);
    return null;
  }

  const { data: publicUrl } = supabase.storage.from('images').getPublicUrl(filePath);
  return publicUrl.publicUrl;
}
