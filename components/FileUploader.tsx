
import React, { useCallback, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { FileUp, AlertCircle, Image as ImageIcon, Video, FileText, X, Upload } from 'lucide-react';
import { RejectedFile } from '../types';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  maxFiles = 20,
  maxSize = 100 * 1024 * 1024,
}) => {
  const { t } = useTranslation();
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 ب';
    const k = 1024;
    const sizes = ['ب', 'ك.ب', 'م.ب', 'ج.ب'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => prev === null ? 0 : Math.min(prev + 12, 98));
    }, 80);

    setTimeout(() => {
      clearInterval(progressInterval);
      const rawFiles = Array.from(files);
      const accepted: File[] = [];
      const rejected: RejectedFile[] = [];

      rawFiles.forEach((file) => {
        const isSupported = file.type.startsWith('image/') || file.type.startsWith('video/');
        const isSizeOk = file.size <= maxSize;

        if (isSupported && isSizeOk) {
          if (accepted.length < maxFiles) {
            accepted.push(file);
          } else {
            rejected.push({ file, reason: t('exceededMaxFilesDesc') });
          }
        } else {
          rejected.push({
            file,
            reason: !isSupported ? t('unsupportedFormat') : t('fileTooLarge')
          });
        }
      });

      if (accepted.length > 0) onFilesSelected(accepted);
      if (rejected.length > 0) setRejectedFiles(prev => [...prev, ...rejected]);
      
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 400);
    }, 700);
  }, [onFilesSelected, maxFiles, maxSize, t]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer
          transition-all duration-500 group overflow-hidden
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01] shadow-2xl' 
            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
          }
          bg-white dark:bg-slate-900
        `}
        onClick={() => document.getElementById('file-input-main')?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {uploadProgress !== null && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <div className="relative">
              <div className="w-20 h-20 border-[6px] border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-indigo-600">
                {uploadProgress}%
              </div>
            </div>
            <p className="text-indigo-600 font-black mt-6 uppercase tracking-widest text-xs">{t('uploadFiles')}...</p>
          </div>
        )}

        <input
          id="file-input-main"
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className={`w-24 h-24 rounded-3xl transition-all duration-500 flex items-center justify-center ${isDragging ? 'bg-indigo-600 rotate-12 scale-110 shadow-indigo-200 shadow-2xl' : 'bg-slate-50 group-hover:bg-indigo-50 group-hover:-rotate-6'}`}>
            <FileUp className={`w-12 h-12 ${isDragging ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-black text-slate-800">{isDragging ? t('dropFiles') : t('dragDrop')}</p>
            <p className="text-sm text-slate-500 font-medium">{t('supportedFormats')}: JPG, PNG, MP4, MOV</p>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t('maxSize')}: {formatFileSize(maxSize)}</p>
          </div>
          <button type="button" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
            {t('selectFiles')}
          </button>
        </div>
      </div>

      {rejectedFiles.length > 0 && (
        <div className="p-6 bg-red-50/50 border border-red-100 rounded-[2rem] animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <span className="font-black text-sm uppercase tracking-wider">{t('rejectedFiles')} ({rejectedFiles.length})</span>
            </div>
            <button onClick={() => setRejectedFiles([])} className="text-slate-400 hover:text-red-500 p-2"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            {rejectedFiles.map(({ file, reason }, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-red-50">
                <div className="flex items-center gap-3 truncate">
                  {file.type.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-red-400" /> : <Video className="w-5 h-5 text-red-400" />}
                  <div className="flex flex-col truncate">
                    <span className="font-black text-xs text-slate-700 truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-3 py-1.5 rounded-full">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
