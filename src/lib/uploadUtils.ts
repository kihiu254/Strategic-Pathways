import { supabase } from './supabase';
import { isImageFile, STORAGE_BUCKETS, imagekitConfig, buildImageKitUrl } from './storage';

export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
}

/**
 * Unified file upload - automatically routes to correct storage
 * Documents → Supabase
 * Images → ImageKit
 */
export const uploadFile = async (
  file: File,
  folder: 'verification' | 'profiles' | 'opportunities'
): Promise<UploadResult> => {
  if (isImageFile(file)) {
    // 1. Get ImageKit auth params from our backend
    const authResponse = await fetch(`${window.location.origin}/api/imagekit-auth`);
    if (!authResponse.ok) throw new Error('Failed to get ImageKit authentication');
    const { token, expire, signature } = await authResponse.json();

    // 2. Upload to ImageKit
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', `${folder}_${Date.now()}_${file.name}`);
    formData.append('token', token);
    formData.append('expire', expire);
    formData.append('signature', signature);
    formData.append('publicKey', imagekitConfig.publicKey);
    formData.append('folder', `/${folder}`);

    const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.message || 'ImageKit upload failed');
    }

    const ikData = await uploadResponse.json();

    return {
      url: ikData.url,
      path: ikData.filePath,
      bucket: 'imagekit'
    };
  } else {
    // Documents remain in Supabase
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const bucket = STORAGE_BUCKETS.VERIFICATION_DOCS;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
      bucket
    };
  }
};

/**
 * Delete file from storage
 */
export const deleteFile = async (path: string, bucket: string): Promise<void> => {
  if (bucket === 'imagekit') {
    console.warn('ImageKit delete not implemented on client side for security.');
    return;
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};

/**
 * Get optimized image URL (using ImageKit)
 */
export const getOptimizedImageUrl = (
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string => {
  if (url && url.includes('ik.imagekit.io')) {
    // Extract path from ImageKit URL
    const urlParts = url.split('/');
    const path = urlParts.slice(3).join('/');
    return buildImageKitUrl(path, options);
  }
  return url;
};
