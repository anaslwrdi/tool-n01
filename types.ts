
export type Language = 'ar' | 'en';

export interface FileMetadata {
  filename: string;
  type: string;
  originalSize: number;
  processedSize?: number;
  sensitiveData?: string[];
  recommendations?: string[];
  format?: string;
  creationDate?: string;
  modificationDate?: string;
  lastModified?: string | number;
  device?: string;
  location?: string;
  hasGPS?: boolean;
  hasFaces?: boolean;
  hasSensitiveData?: boolean;
  safeModeApplied?: boolean;
  generatedFakeData?: boolean;
  fileType?: 'image' | 'video';
  videoProcessingNote?: string;
  technicalData?: Record<string, any>;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface ProcessedFile {
  id: string;
  originalFile: File;
  processedFile?: File;
  metadata: FileMetadata;
  error?: string;
  status: 'completed' | 'failed' | 'processing' | 'pending';
  processedAt?: string;
  progress?: number;
}

export interface ProcessOptions {
  safeMode: boolean;
  removeGPS: boolean;
  changeDates: boolean;
  generateFakeData: boolean;
  preserveQuality: boolean;
}

export interface RejectedFile {
  file: File;
  reason: string;
}
