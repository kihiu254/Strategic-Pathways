import { supabase } from './supabase';
import { isImageFile, isDocumentFile, STORAGE_BUCKETS } from './storage';

export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
}

/**
 * Unified file upload - automatically routes to correct storage
 * Documents → Supabase
 * Images → Supabase (ready for ImageKit migration)
 */
export const uploadFile = async (
  file: File,
  folder: 'verification' | 'profiles' | 'opportunities'
): Promise<UploadResult> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Route based on file type
  const bucket = isImageFile(file) 
    ? STORAGE_BUCKETS.PROFILE_IMAGES 
    : STORAGE_BUCKETS.VERIFICATION_DOCS;

  // Upload to Supabase
  const { error: uploadError, data } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return {
    url: urlData.publicUrl,
    path: fileName,
    bucket
  };
};

/**
 * Delete file from storage
 */
export const deleteFile = async (path: string, bucket: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};

/**
 * Get optimized image URL (ready for ImageKit)
 */
export const getOptimizedImageUrl = (
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): string => {
  // Currently returns Supabase URL
  // When migrating to ImageKit, add transformation logic here
  return url;
};
