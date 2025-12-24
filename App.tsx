
import React, { useState, useCallback } from 'react';
import { useTranslation } from './hooks/useTranslation';
import { FileUploader } from './components/FileUploader';
import { ProcessControls } from './components/ProcessControls';
import { MetadataDisplay } from './components/MetadataDisplay';
import { BatchStatus } from './components/BatchStatus';
import { MetadataProcessor } from './services/metadataProcessor';
import { ProcessedFile, ProcessOptions } from './types';
import { 
  Download, 
  Trash2, 
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Video,
  Image as ImageIcon
} from 'lucide-react';

const App: React.FC = () => {
  const { t, language, direction, toggleLanguage } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null);

  const isRtl = direction === 'rtl';

  const handleProcessFiles = async (options: ProcessOptions) => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const results = await MetadataProcessor.processBatch(files, options);
      setProcessedFiles(results);
      if (results.length > 0) {
        setSelectedFile(results[0]);
      }
    } catch (error) {
      console.error('Batch processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadFile = (file: ProcessedFile) => {
    if (file.processedFile) {
      const url = URL.createObjectURL(file.processedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.processedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const downloadAll = () => {
    processedFiles.forEach(file => {
      if (file.processedFile && file.status === 'completed') {
        downloadFile(file);
      }
    });
  };

  const clearAll = () => {
    setFiles([]);
    setProcessedFiles([]);
    setSelectedFile(null);
  };

  return (
    <div className={`min-h-screen bg-slate-50 transition-all ${isRtl ? 'rtl text-right font-arabic' : 'text-left'}`}>
      {/* Dynamic Header */}
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-600 text-white py-14 px-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 leading-tight">
                {t('appTitle')}
              </h1>
              <p className="text-indigo-100 text-lg font-medium opacity-90">{t('appDescription')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button
              onClick={toggleLanguage}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-sm font-semibold backdrop-blur-sm border border-white/20 flex items-center gap-2"
            >
              <i className="fa-solid fa-globe"></i>
              {t('langToggle')}
            </button>
            <button
              onClick={clearAll}
              disabled={files.length === 0 && processedFiles.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-full font-bold transition-all disabled:opacity-20 backdrop-blur-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('clearAll')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto -mt-10 px-6 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Input & Controls */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-indigo-600" />
              {t('uploadFiles')}
            </h2>
            <FileUploader onFilesSelected={handleFilesSelected} />
            
            {files.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest">{t('uploadedFiles')} ({files.length})</h3>
                  <button onClick={() => setFiles([])} className="text-xs font-bold text-red-500 hover:underline">{t('removeAll')}</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group transition-all hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Video className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                        <span className="text-sm font-bold text-slate-600 truncate">{file.name}</span>
                      </div>
                      <button onClick={() => removeFile(index)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ProcessControls onProcess={handleProcessFiles} isProcessing={isProcessing} />

          {processedFiles.length > 0 && (
            <div className="animate-slide-in">
              <BatchStatus files={processedFiles} />
            </div>
          )}
        </div>

        {/* Center: Detailed Analysis */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 h-full sticky top-4">
            <h2 className="text-xl font-bold mb-8 text-slate-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              {t('metadataAnalysis')}
            </h2>
            
            {selectedFile ? (
              <MetadataDisplay file={selectedFile} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-10 opacity-40">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-lg font-bold text-slate-500">{t('selectFileToView')}</p>
                <p className="text-sm text-slate-400 mt-2">{t('uploadAndProcessFiles')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Results List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 h-full sticky top-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
                {t('processedFiles')}
              </h2>
              {processedFiles.length > 0 && (
                <button
                  onClick={downloadAll}
                  disabled={processedFiles.filter(f => f.status === 'completed').length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-100 transition-all disabled:opacity-30"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('downloadAll')}</span>
                </button>
              )}
            </div>

            {processedFiles.length > 0 ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {processedFiles.map(file => (
                  <div
                    key={file.id}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                      selectedFile?.id === file.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-md ring-1 ring-indigo-500/20'
                        : 'border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {file.originalFile.type.startsWith('image/') 
                          ? <ImageIcon className="w-4 h-4 text-green-500 flex-shrink-0" /> 
                          : <Video className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        }
                        <span className="text-sm font-bold text-slate-700 truncate" title={file.originalFile.name}>
                          {file.originalFile.name}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {file.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {file.status === 'failed' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        {file.status === 'processing' && <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>
                        {Math.round(file.metadata.originalSize / 1024)} KB
                        {file.status === 'completed' && ` → ${Math.round((file.metadata.processedSize || 0) / 1024)} KB`}
                      </span>
                      <div className="flex items-center gap-3">
                        {file.status === 'completed' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
                            className="text-indigo-600 hover:underline font-black"
                          >
                            {t('download')}
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setProcessedFiles(prev => prev.filter(f => f.id !== file.id)); }}
                          className="text-red-400 hover:text-red-600"
                        >
                          {t('remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-10 opacity-30">
                <Shield className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">{t('noProcessedFilesYet')}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 font-bold mb-2">
            {t('appTitle')} © {new Date().getFullYear()}
          </p>
          <p className="text-slate-400 text-xs max-w-2xl mx-auto leading-relaxed">
            {t('privacyNotice')} {t('disclaimer')}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
