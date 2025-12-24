
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ProcessedFile } from '../types';
import {
  FileText,
  Calendar,
  MapPin,
  Shield,
  AlertTriangle,
  CheckCircle,
  Download,
  Clock,
  Smartphone,
  Hash,
  Cpu,
  ChevronRight,
  AlertCircle,
  Lock,
  Eye,
  Fingerprint,
  Info
} from 'lucide-react';
import { getGeminiService, GeminiAnalysis } from '../services/gemini';

interface MetadataDisplayProps {
  file: ProcessedFile;
}

export const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ file }) => {
  const { t, language } = useTranslation();
  const [aiAnalysis, setAiAnalysis] = useState<GeminiAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (file.status === 'completed' && !aiAnalysis) {
      analyzeWithAI();
    }
  }, [file.id, file.status]);

  const analyzeWithAI = async () => {
    try {
      setLoadingAnalysis(true);
      const gemini = getGeminiService();
      const analysis = await gemini.analyzeFile(file.originalFile);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = language === 'ar' ? ['ب', 'ك.ب', 'م.ب', 'ج.ب'] : ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('notAvailable');
    try {
      return new Date(dateString).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
    } catch {
      return dateString;
    }
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'high': return 'bg-red-500 text-white border-red-600';
      case 'medium': return 'bg-yellow-500 text-white border-yellow-600';
      case 'low': return 'bg-green-500 text-white border-green-600';
      default: return 'bg-slate-400 text-white border-slate-500';
    }
  };

  const downloadFile = () => {
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

  const riskLabel = (level: string) => {
    const key = (level + 'Risk') as any;
    return t(key) || level;
  };

  return (
    <div className="space-y-8 animate-slide-in h-full overflow-y-auto custom-scrollbar pr-2 pb-12">
      {/* Risk Alert Header */}
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Cpu className="w-20 h-20" />
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-indigo-400" />
              <h3 className="font-black text-lg tracking-widest uppercase">{t('metadataAnalysis')}</h3>
            </div>
            {aiAnalysis && (
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-b-2 shadow-lg ${getRiskLevelColor(aiAnalysis.riskLevel)}`}>
                {riskLabel(aiAnalysis.riskLevel)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-xl">
               <FileText className="w-6 h-6 text-indigo-300" />
             </div>
             <div className="min-w-0">
               <p className="text-sm font-bold truncate">{file.metadata.filename}</p>
               <p className="text-[10px] text-slate-400 uppercase font-black">{file.metadata.type} • {formatFileSize(file.metadata.originalSize)}</p>
             </div>
          </div>
        </div>
      </div>

      {/* AI Risk Assessment */}
      <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2rem]">
        <h4 className="font-black text-indigo-900 mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {t('safetyAnalysis')}
        </h4>
        
        {loadingAnalysis ? (
          <div className="flex items-center gap-4 py-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <span className="font-bold text-indigo-400">{t('analyzingWithAI')}...</span>
          </div>
        ) : aiAnalysis ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{t('sensitiveItems')}</p>
              {aiAnalysis.sensitiveData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-indigo-100 text-xs text-slate-600 font-bold">
                  <ChevronRight className="w-3 h-3 text-indigo-500" />
                  {item}
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-indigo-200">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{t('aiRecommendations')}</p>
              <ul className="space-y-2">
                {aiAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-slate-400">{t('uploadAndProcessFiles')}</p>
        )}
      </div>

      {/* Technical Footprint Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            {t('deviceAndLocation')}
          </h4>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-300 uppercase">{t('device')}</span>
              <span className="text-sm font-bold text-slate-700 truncate">{file.metadata.device || t('notAvailable')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-300 uppercase">{t('location')}</span>
              <span className="text-sm font-bold text-slate-700 truncate">{file.metadata.location || t('notAvailable')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t('fileInformation')}
          </h4>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-300 uppercase">{t('creationDate')}</span>
              <span className="text-sm font-bold text-slate-700">{formatDate(file.metadata.creationDate)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-300 uppercase">{t('originalSize')}</span>
              <span className="text-sm font-bold text-slate-700">{formatFileSize(file.metadata.originalSize)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Applied Security Layer */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          <Fingerprint className="w-6 h-6 text-indigo-600" />
          {t('securityFeaturesApplied')}
        </h4>
        <div className="flex flex-wrap gap-3">
          {file.metadata.safeModeApplied && (
            <div className="px-5 py-3 bg-green-50 text-green-700 rounded-2xl flex items-center gap-3 border border-green-100">
              <Lock className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">{t('safeMode')}</span>
            </div>
          )}
          {file.metadata.generatedFakeData && (
            <div className="px-5 py-3 bg-purple-50 text-purple-700 rounded-2xl flex items-center gap-3 border border-purple-100">
              <Eye className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">{t('fakeDataGenerated')}</span>
            </div>
          )}
          {!file.metadata.hasGPS && (
            <div className="px-5 py-3 bg-blue-50 text-blue-700 rounded-2xl flex items-center gap-3 border border-blue-100">
              <MapPin className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">{t('gpsRemoved')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Forensic Metadata Data (JSON) */}
      {file.metadata.technicalData && (
        <div className="bg-slate-900 rounded-[2.5rem] p-8">
          <h4 className="font-black text-white mb-6 flex items-center gap-2">
            <Hash className="w-5 h-5 text-indigo-400" />
            {t('technicalMetadata')}
          </h4>
          <div className="bg-slate-800 rounded-3xl p-6 overflow-x-auto border border-slate-700">
            <pre className="text-xs text-indigo-300 font-mono">
              {JSON.stringify(file.metadata.technicalData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Footer Download Action */}
      {file.status === 'completed' && (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md p-4 border-t border-slate-100 rounded-t-3xl shadow-lg animate-slide-in">
           <button
            onClick={downloadFile}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <Download className="w-6 h-6" />
            <span>{t('download')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
