/**
 * Image Compression Utility
 * Compresses images for efficient transmission to server
 */

class ImageCompressor {
  constructor() {
    this.defaultOptions = {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: 'image/jpeg',
      maxSizeKB: 500 // 500KB max
    };
  }

  /**
   * Compress an image file
   * @param {File} file - The image file to compress
   * @param {Object} options - Compression options
   * @returns {Promise<File>} - Compressed image file
   */
  async compressFile(file, options = {}) {
    const opts = { ...this.defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const compressedFile = this.compressImage(img, file.name, opts);
          resolve(compressedFile);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress image from canvas (used for camera captures)
   * @param {HTMLImageElement} img - Image element
   * @param {string} filename - Original filename
   * @param {Object} options - Compression options
   * @returns {Promise<File>} - Compressed image file
   */
  async compressImage(img, filename, options = {}) {
    const opts = { ...this.defaultOptions, ...options };

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate new dimensions
      let { width, height } = this.calculateDimensions(img.width, img.height, opts.maxWidth, opts.maxHeight);

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        const compressedFile = new File([blob], this.generateFilename(filename), {
          type: opts.format,
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, opts.format, opts.quality);
    });
  }

  /**
   * Calculate optimal dimensions while maintaining aspect ratio
   */
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;

    // If image is smaller than max dimensions, keep original size
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }

    // Calculate aspect ratio
    const aspectRatio = width / height;

    // Resize based on the limiting dimension
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Generate a compressed filename
   */
  generateFilename(originalFilename) {
    const timestamp = Date.now();
    const extension = this.getFileExtension(originalFilename);
    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    return `${baseName}_compressed_${timestamp}.${extension}`;
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename) {
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1] : 'jpg';
  }

  /**
   * Get compression stats
   */
  getCompressionStats(originalFile, compressedFile) {
    const originalSize = originalFile.size;
    const compressedSize = compressedFile.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    const sizeReduction = this.formatBytes(originalSize - compressedSize);

    return {
      originalSize: this.formatBytes(originalSize),
      compressedSize: this.formatBytes(compressedSize),
      compressionRatio: `${compressionRatio}%`,
      sizeReduction,
      isCompressed: compressedSize < originalSize
    };
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if file needs compression
   */
  needsCompression(file, maxSizeKB = 500) {
    const maxSizeBytes = maxSizeKB * 1024;
    return file.size > maxSizeBytes;
  }

  /**
   * Get recommended compression settings based on file size
   */
  getRecommendedSettings(file) {
    const sizeKB = file.size / 1024;

    if (sizeKB < 200) {
      return { quality: 0.9, maxWidth: 1600, maxHeight: 1600 };
    } else if (sizeKB < 500) {
      return { quality: 0.8, maxWidth: 1200, maxHeight: 1200 };
    } else if (sizeKB < 1000) {
      return { quality: 0.7, maxWidth: 1000, maxHeight: 1000 };
    } else {
      return { quality: 0.6, maxWidth: 800, maxHeight: 800 };
    }
  }
}

// Create singleton instance
export const imageCompressor = new ImageCompressor();

// Convenience functions
export const compressImageFile = (file, options) => imageCompressor.compressFile(file, options);
export const compressImageFromCanvas = (img, filename, options) => imageCompressor.compressImage(img, filename, options);
export const getCompressionStats = (original, compressed) => imageCompressor.getCompressionStats(original, compressed);
export const needsCompression = (file, maxSizeKB) => imageCompressor.needsCompression(file, maxSizeKB);
export const getRecommendedSettings = (file) => imageCompressor.getRecommendedSettings(file);