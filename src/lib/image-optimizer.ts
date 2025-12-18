/**
 * Image optimization utilities for faster uploads and processing
 */

interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: Required<OptimizeImageOptions> = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.85,
  maxSizeKB: 1024, // 1MB
};

/**
 * Optimize an image file for upload
 * - Resizes to max dimensions
 * - Compresses to target quality
 * - Converts to JPEG for consistency
 * - Returns base64 string ready for API calls
 */
export async function optimizeImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > opts.maxWidth || height > opts.maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = opts.maxWidth;
            height = width / aspectRatio;
          } else {
            height = opts.maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Use better image smoothing for quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with compression
        const base64 = canvas.toDataURL("image/jpeg", opts.quality);

        // Check size and reduce quality if needed
        const sizeKB = (base64.length * 3) / 4 / 1024;

        if (sizeKB > opts.maxSizeKB && opts.quality > 0.5) {
          // Recursively reduce quality
          const newQuality = opts.quality - 0.1;
          optimizeImage(file, { ...opts, quality: newQuality })
            .then(resolve)
            .catch(reject);
          return;
        }

        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file before processing
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Formato de arquivo inválido. Use JPEG, PNG ou WebP.",
    };
  }

  // Check file size (max 10MB before optimization)
  const maxSizeMB = 10;
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions without loading full image
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Create a preview URL from base64 (for display purposes)
 */
export function createPreviewUrl(base64: string): string {
  return base64;
}

/**
 * Estimate final file size in KB from base64
 */
export function estimateSizeKB(base64: string): number {
  return (base64.length * 3) / 4 / 1024;
}
