import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  
  // If it's already a full URL (starts with http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a local path (starts with /), return as is for Next.js Image component
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // If it's just a filename, assume it's in the public/images folder
  return `/images/${imageUrl}`;
} 