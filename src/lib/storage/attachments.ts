import { supabase } from '../supabase';

export async function uploadAttachments(ticketId: string, files: File[]) {
  const uploaded: { name: string; url: string; size: number; path: string }[] = [];
  
  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${ticketId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('support-attachments')
      .upload(filePath, file, { 
        upsert: false,
        contentType: file.type 
      });
    
    if (uploadError) {
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }
    
    // Get signed URL for immediate access
    const { data: signedUrl } = await supabase.storage
      .from('support-attachments')
      .createSignedUrl(filePath, 60 * 60 * 24); // 24 hours
    
    uploaded.push({
      name: file.name,
      url: signedUrl?.signedUrl || '',
      size: file.size,
      path: filePath
    });
  }
  
  return uploaded;
}

export async function getAttachmentSignedUrl(path: string, expiresIn = 60 * 60) {
  const { data, error } = await supabase.storage
    .from('support-attachments')
    .createSignedUrl(path, expiresIn);
  
  if (error) {
    return null;
  }
  
  return data.signedUrl;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}