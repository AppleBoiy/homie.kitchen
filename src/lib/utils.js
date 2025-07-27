import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path, make it absolute
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // Otherwise, assume it's a relative path and add the base path
  return `/images/${imageUrl}`;
}

/**
 * Safely converts a value to lowercase string for search operations
 * @param {any} value - The value to convert
 * @returns {string} - Lowercase string or empty string if value is null/undefined
 */
export function safeToLowerCase(value) {
  if (value == null) return '';
  return String(value).toLowerCase();
}

/**
 * Safely checks if a string includes a substring
 * @param {any} value - The value to check
 * @param {string} query - The search query
 * @returns {boolean} - True if value includes query, false otherwise
 */
export function safeIncludes(value, query) {
  if (value == null || query == null) return false;
  return safeToLowerCase(value).includes(safeToLowerCase(query));
} 