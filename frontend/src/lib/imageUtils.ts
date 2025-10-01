/**
 * Utility functions for handling image URLs with fallbacks
 */

const DEFAULT_IMAGE_URL = "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg";

/**
 * Get the base image URL from environment or default to localhost:5001
 */
export const getBaseImageUrl = (): string => {
    return process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:5001";
};

/**
 * Get a property image URL with fallback
 */
export const getPropertyImageUrl = (imageUrl?: string, fallback?: string): string => {
    if (!imageUrl) {
        return fallback || DEFAULT_IMAGE_URL;
    }

    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // If it's a relative path, construct the full URL
    const baseUrl = getBaseImageUrl();
    return `${baseUrl}/images/Properties/original/${imageUrl}`;
};

/**
 * Get a property image URL with error handling
 */
export const getPropertyImageUrlWithFallback = (imageUrl?: string): string => {
    return getPropertyImageUrl(imageUrl, DEFAULT_IMAGE_URL);
};

/**
 * Handle image load errors by providing a fallback
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.target as HTMLImageElement;
    if (target.src !== DEFAULT_IMAGE_URL) {
        target.src = DEFAULT_IMAGE_URL;
    }
};
