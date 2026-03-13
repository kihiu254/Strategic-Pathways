// ImageKit Configuration
export const imagekitConfig = {
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '',
  authenticationEndpoint: '/api/imagekit-auth',
};

// Storage strategy: Supabase for documents, ImageKit for images
export const STORAGE_BUCKETS = {
  VERIFICATION_DOCS: 'verification-documents', // Supabase
  PROFILE_IMAGES: 'profile-images', // Supabase (will migrate to ImageKit)
} as const;

// File type detection
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const isDocumentFile = (file: File): boolean => {
  const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  return docTypes.includes(file.type);
};

// ImageKit URL builder (for when we migrate)
export const buildImageKitUrl = (path: string, transformations?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}): string => {
  if (!imagekitConfig.urlEndpoint) return path;
  
  const params = new URLSearchParams();
  if (transformations?.width) params.append('tr', `w-${transformations.width}`);
  if (transformations?.height) params.append('tr', `h-${transformations.height}`);
  if (transformations?.quality) params.append('tr', `q-${transformations.quality}`);
  if (transformations?.format) params.append('tr', `f-${transformations.format}`);
  
  const queryString = params.toString();
  return `${imagekitConfig.urlEndpoint}/${path}${queryString ? `?${queryString}` : ''}`;
};
