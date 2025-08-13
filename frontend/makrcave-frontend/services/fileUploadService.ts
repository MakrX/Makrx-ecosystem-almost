/**
 * File Upload Service
 * Handles file uploads for profile images, documents, and other assets
 */

export interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  resize?: {
    width: number;
    height: number;
    quality?: number;
  };
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
}

class FileUploadService {
  private readonly baseUrl: string;
  private readonly defaultOptions: UploadOptions = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  };

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  /**
   * Upload a file to the server
   */
  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Validate file
      const validation = this.validateFile(file, opts);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Resize image if needed
      let fileToUpload = file;
      if (opts.resize && file.type.startsWith('image/')) {
        fileToUpload = await this.resizeImage(file, opts.resize);
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('type', this.getFileType(file));

      // Get auth token
      const token = localStorage.getItem('auth_token') || localStorage.getItem('makrx_access_token');

      // Upload file
      const response = await fetch(`${this.baseUrl}/api/v1/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        url: result.url,
        filename: result.filename,
        size: fileToUpload.size,
      };
    } catch (error) {
      console.error('File upload error:', error);
      
      // Fallback to mock upload for development
      if (process.env.NODE_ENV === 'development') {
        return this.mockUpload(file, options);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload profile image with automatic resizing
   */
  async uploadProfileImage(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
    return this.uploadFile(file, {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      resize: {
        width: 200,
        height: 200,
        quality: 0.8,
      },
      onProgress,
    });
  }

  /**
   * Upload document files
   */
  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
    return this.uploadFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      onProgress,
    });
  }

  /**
   * Upload image files
   */
  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
    return this.uploadFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      onProgress,
    });
  }

  /**
   * Validate file against options
   */
  private validateFile(file: File, options: UploadOptions): { valid: boolean; error?: string } {
    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      return {
        valid: false,
        error: `File size too large. Maximum size is ${this.formatFileSize(options.maxSize)}`,
      };
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Resize image file
   */
  private resizeImage(file: File, options: { width: number; height: number; quality?: number }): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = options.width;
        canvas.height = options.height;

        // Calculate aspect ratio
        const aspectRatio = img.width / img.height;
        let { width, height } = options;

        if (aspectRatio > 1) {
          height = width / aspectRatio;
        } else {
          width = height * aspectRatio;
        }

        // Draw image
        ctx?.drawImage(
          img,
          (options.width - width) / 2,
          (options.height - height) / 2,
          width,
          height
        );

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          options.quality || 0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get file type for categorization
   */
  private getFileType(file: File): string {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf')) return 'document';
    return 'other';
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Mock upload for development/fallback
   */
  private async mockUpload(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate mock URL
    const mockUrl = URL.createObjectURL(file);
    
    // Store in localStorage for persistence during dev
    const uploads = JSON.parse(localStorage.getItem('mock_uploads') || '[]');
    const uploadRecord = {
      filename: file.name,
      url: mockUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };
    uploads.push(uploadRecord);
    localStorage.setItem('mock_uploads', JSON.stringify(uploads));

    // Call progress callback if provided
    if (options.onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        setTimeout(() => options.onProgress!(i), i * 20);
      }
    }

    return {
      success: true,
      url: mockUrl,
      filename: file.name,
      size: file.size,
    };
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('makrx_access_token');

      const response = await fetch(`${this.baseUrl}/api/v1/upload/${filename}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      return response.ok;
    } catch (error) {
      console.error('File deletion error:', error);
      
      // Remove from mock uploads in development
      if (process.env.NODE_ENV === 'development') {
        const uploads = JSON.parse(localStorage.getItem('mock_uploads') || '[]');
        const filtered = uploads.filter((upload: any) => upload.filename !== filename);
        localStorage.setItem('mock_uploads', JSON.stringify(filtered));
        return true;
      }
      
      return false;
    }
  }

  /**
   * Get uploaded files
   */
  async getUploads(): Promise<any[]> {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('makrx_access_token');

      const response = await fetch(`${this.baseUrl}/api/v1/uploads`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    }

    // Return mock uploads in development
    if (process.env.NODE_ENV === 'development') {
      return JSON.parse(localStorage.getItem('mock_uploads') || '[]');
    }

    return [];
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();

// Export for easier usage
export const uploadFile = fileUploadService.uploadFile.bind(fileUploadService);
export const uploadProfileImage = fileUploadService.uploadProfileImage.bind(fileUploadService);
export const uploadDocument = fileUploadService.uploadDocument.bind(fileUploadService);
export const uploadImage = fileUploadService.uploadImage.bind(fileUploadService);
